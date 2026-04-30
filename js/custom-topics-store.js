/**
 * Temas teóricos y cuestionarios definidos por el docente (localStorage compartido en el navegador).
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'interactiveCodeLab_teacher_custom_topics';

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { topics: [] };
      var d = JSON.parse(raw);
      if (!d || !Array.isArray(d.topics)) return { topics: [] };
      return { topics: d.topics };
    } catch (e) {
      return { topics: [] };
    }
  }

  function save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  function generateId() {
    return 'custom_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
  }

  function normalizeTopic(t) {
    var id = t.id || generateId();
    var qp = typeof t.quizPoints === 'number' ? t.quizPoints : 20;
    qp = Math.max(0, Math.min(500, Math.floor(qp)));
    var questions = Array.isArray(t.questions) ? t.questions : [];
    questions = questions
      .map(function (q) {
        var kind = q.kind === 'console' ? 'console' : 'choice';
        if (kind === 'console') {
          var cc = q.consoleCheck || {};
          var minL = parseInt(cc.minLength, 10);
          if (isNaN(minL)) minL = 0;
          minL = Math.max(0, Math.min(2000, minL));
          var must = Array.isArray(cc.mustInclude) ? cc.mustInclude : [];
          must = must
            .map(function (s) {
              return String(s == null ? '' : s).trim();
            })
            .filter(function (s) {
              return s.length > 0;
            })
            .slice(0, 24);
          var must2 = [];
          for (var mi = 0; mi < must.length; mi++) {
            if (must2.indexOf(must[mi]) === -1) must2.push(must[mi]);
          }
          return {
            kind: 'console',
            q: String(q.q || '').trim(),
            placeholder: String(q.placeholder != null ? q.placeholder : '').trim(),
            hint: String(q.hint != null ? q.hint : '').trim(),
            consoleCheck: {
              minLength: minL,
              mustInclude: must2,
              requireConsoleLog: !!cc.requireConsoleLog,
            },
          };
        }
        var correct = String(q.correct || 'a').toLowerCase();
        if (correct !== 'a' && correct !== 'b' && correct !== 'c') correct = 'a';
        var opts = q.opts || {};
        return {
          kind: 'choice',
          q: String(q.q || '').trim(),
          correct: correct,
          opts: {
            a: String(opts.a != null ? opts.a : '').trim(),
            b: String(opts.b != null ? opts.b : '').trim(),
            c: String(opts.c != null ? opts.c : '').trim(),
          },
        };
      })
      .filter(function (q) {
        if (!q.q.length) return false;
        if (q.kind === 'console') {
          var c = q.consoleCheck || {};
          var hasMust = Array.isArray(c.mustInclude) && c.mustInclude.length > 0;
          var hasMin = typeof c.minLength === 'number' && c.minLength > 0;
          return hasMust || c.requireConsoleLog || hasMin;
        }
        var o = q.opts || {};
        return o.a.length > 0 && o.b.length > 0 && o.c.length > 0;
      });
    return {
      id: id,
      title: String(t.title || 'Tema sin título').trim() || 'Tema sin título',
      tabLabel: String(t.tabLabel || t.title || 'Tema').trim() || 'Tema',
      body: String(t.body || '').trim(),
      quizPoints: qp,
      questions: questions,
    };
  }

  function getTopics() {
    return load().topics.map(normalizeTopic);
  }

  function setTopics(list) {
    var topics = (Array.isArray(list) ? list : []).map(normalizeTopic);
    save({ topics: topics });
  }

  function addTopic(partial) {
    var topics = getTopics();
    var neu = normalizeTopic(Object.assign({}, partial, { id: generateId() }));
    topics.push(neu);
    save({ topics: topics });
    return neu;
  }

  function updateTopic(id, partial) {
    var topics = getTopics();
    var i = -1;
    for (var j = 0; j < topics.length; j++) {
      if (topics[j].id === id) {
        i = j;
        break;
      }
    }
    if (i === -1) return null;
    var merged = Object.assign({}, topics[i], partial, { id: id });
    topics[i] = normalizeTopic(merged);
    save({ topics: topics });
    return topics[i];
  }

  function deleteTopic(id) {
    var topics = getTopics().filter(function (t) {
      return t.id !== id;
    });
    save({ topics: topics });
  }

  function findTopic(id) {
    var topics = getTopics();
    for (var i = 0; i < topics.length; i++) {
      if (topics[i].id === id) return topics[i];
    }
    return null;
  }

  function getCustomTopicIdsOrdered() {
    return getTopics().map(function (t) {
      return t.id;
    });
  }

  function quizFromTopic(t) {
    if (!t || !t.questions.length) return null;
    return t.questions.map(function (q) {
      if (q.kind === 'console') {
        return {
          kind: 'console',
          q: q.q,
          placeholder: q.placeholder || '',
          hint: q.hint || '',
          consoleCheck: q.consoleCheck,
        };
      }
      return {
        kind: 'choice',
        q: q.q,
        correct: q.correct,
        opts: [
          { k: 'a', t: q.opts.a },
          { k: 'b', t: q.opts.b },
          { k: 'c', t: q.opts.c },
        ],
      };
    });
  }

  function getQuizForTopic(topicId) {
    return quizFromTopic(findTopic(topicId));
  }

  function getPointsForTopic(topicId) {
    var t = findTopic(topicId);
    return t ? t.quizPoints : 20;
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function bodyToHtml(body) {
    var parts = String(body || '').split(/\n\n+/);
    if (!parts.length || (parts.length === 1 && !parts[0].trim())) {
      return '<p class="text-slate-500">Tu docente aún no escribió el contenido de este tema.</p>';
    }
    return parts
      .map(function (block) {
        return '<p>' + escapeHtml(block.trim()).replace(/\n/g, '<br />') + '</p>';
      })
      .join('');
  }

  /**
   * Inserta pestañas y paneles en la vista estudiante (index.html).
   * Idempotente: elimina bloques anteriores marcados antes de volver a crear.
   */
  function injectTheoryUI() {
    var tabHost = document.getElementById('topic-tabs');
    if (!tabHost) return;

    var oldGroup = document.getElementById('topic-level-teacher-custom');
    if (oldGroup) oldGroup.remove();
    document.querySelectorAll('[data-custom-topic-panel="1"]').forEach(function (el) {
      el.remove();
    });

    var topics = getTopics();
    if (!topics.length) return;

    var group = document.createElement('div');
    group.id = 'topic-level-teacher-custom';
    group.className = 'topic-level-group';
    group.innerHTML =
      '<p class="text-xs font-semibold uppercase tracking-wider text-lab-accent">Temas del docente</p>' +
      '<p class="mb-2 text-xs text-slate-500">Unidades adicionales en orden, tras aprobar <em>3.3 · Pruebas y trazado</em>.</p>' +
      '<div class="flex flex-wrap gap-2" id="topic-tabs-teacher-custom-buttons"></div>';
    tabHost.appendChild(group);

    var btnWrap = document.getElementById('topic-tabs-teacher-custom-buttons');
    topics.forEach(function (t) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'topic-tab rounded-lg px-3 py-2 text-xs font-medium sm:text-sm';
      btn.setAttribute('data-topic', t.id);
      btn.setAttribute('aria-selected', 'false');
      btn.textContent = t.tabLabel;
      btnWrap.appendChild(btn);
    });

    var anchor = document.getElementById('topic-panel-pruebas_trazado');
    if (!anchor || !anchor.parentNode) return;

    var insertAfter = anchor;
    topics.forEach(function (t) {
      var panel = document.createElement('div');
      panel.id = 'topic-panel-' + t.id;
      panel.className = 'topic-theory-panel hidden space-y-6';
      panel.setAttribute('data-topic-panel', t.id);
      panel.setAttribute('data-custom-topic-panel', '1');
      panel.innerHTML =
        '<div class="rounded-2xl border border-lab-border bg-lab-surface/50 p-6 sm:p-8 space-y-5 text-sm leading-relaxed text-slate-400">' +
        '<h3 class="text-lg font-semibold text-white">' +
        escapeHtml(t.title) +
        '</h3>' +
        '<div class="space-y-3">' +
        bodyToHtml(t.body) +
        '</div>' +
        '<p class="text-xs text-slate-500">Este tema no incluye modelo 3D/RA. Al aprobar el cuestionario sumarás <strong class="text-slate-300">' +
        t.quizPoints +
        ' pts</strong> la primera vez.</p>' +
        '</div>' +
        '<div class="topic-quiz-mount" data-topic-quiz="' +
        escapeHtml(t.id) +
        '"></div>';
      insertAfter.parentNode.insertBefore(panel, insertAfter.nextSibling);
      insertAfter = panel;
    });
  }

  global.LabCustomTopics = {
    STORAGE_KEY: STORAGE_KEY,
    load: load,
    getTopics: getTopics,
    setTopics: setTopics,
    addTopic: addTopic,
    updateTopic: updateTopic,
    deleteTopic: deleteTopic,
    findTopic: findTopic,
    getCustomTopicIdsOrdered: getCustomTopicIdsOrdered,
    getQuizForTopic: getQuizForTopic,
    getPointsForTopic: getPointsForTopic,
    injectTheoryUI: injectTheoryUI,
    normalizeTopic: normalizeTopic,
  };
})(typeof window !== 'undefined' ? window : this);
