(function () {
  'use strict';

  var THEME_STORAGE_KEY = 'interactiveCodeLab_theme';

  var BASE_THEORY_IDS = [
    'algoritmos',
    'variables',
    'entrada_salida',
    'operadores',
    'decisiones_multiples',
    'cadenas',
    'bucles',
    'arreglos',
    'funciones',
    'pruebas_trazado',
  ];

  var LAST_TOPIC_LABELS = {
    algoritmos: '1.1 · Algoritmos y condicionales',
    variables: '1.2 · Variables y tipos',
    entrada_salida: '1.3 · Entrada, proceso y salida',
    operadores: '2.1 · Operadores',
    decisiones_multiples: '2.2 · Decisiones múltiples',
    cadenas: '2.3 · Cadenas de texto',
    bucles: '2.4 · Bucles',
    arreglos: '3.1 · Arreglos',
    funciones: '3.2 · Funciones',
    pruebas_trazado: '3.3 · Pruebas y trazado',
  };

  function allTheoryIds() {
    if (typeof LabCustomTopics !== 'undefined' && LabCustomTopics.getCustomTopicIdsOrdered) {
      return BASE_THEORY_IDS.concat(LabCustomTopics.getCustomTopicIdsOrdered());
    }
    return BASE_THEORY_IDS.slice();
  }

  function lastTopicLabel(id) {
    if (!id || id === '—') return '—';
    if (LAST_TOPIC_LABELS[id]) return LAST_TOPIC_LABELS[id];
    if (typeof LabCustomTopics !== 'undefined') {
      var t = LabCustomTopics.findTopic(id);
      if (t) return t.tabLabel || t.title;
    }
    return id;
  }

  function syncThemeToggleButton() {
    var isDark = document.documentElement.classList.contains('dark');
    document.querySelectorAll('.theme-toggle-btn').forEach(function (btn) {
      btn.setAttribute('aria-label', isDark ? 'Activar tema claro' : 'Activar tema oscuro');
      btn.setAttribute('title', isDark ? 'Tema claro' : 'Tema oscuro');
      var sun = btn.querySelector('[data-icon="sun"]');
      var moon = btn.querySelector('[data-icon="moon"]');
      if (sun) sun.classList.toggle('hidden', !isDark);
      if (moon) moon.classList.toggle('hidden', isDark);
    });
  }

  function applyTheme(theme) {
    var root = document.documentElement;
    if (theme === 'light') root.classList.remove('dark');
    else root.classList.add('dark');
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {}
    syncThemeToggleButton();
  }

  function wireThemeToggle() {
    document.querySelectorAll('.theme-toggle-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
        applyTheme(next);
      });
    });
    syncThemeToggleButton();
  }

  function summarizeStudentProgress(userId) {
    var ids = allTheoryIds();
    var key = LabUsers.getProgressStorageKey(userId);
    var raw = localStorage.getItem(key);
    if (!raw) {
      return { points: 0, quizDone: 0, quizTotal: ids.length, lastTopic: '—' };
    }
    try {
      var d = JSON.parse(raw);
      var quizDone = 0;
      ids.forEach(function (id) {
        if (d.quizRewards && d.quizRewards[id]) quizDone++;
      });
      return {
        points: typeof d.points === 'number' ? d.points : 0,
        quizDone: quizDone,
        quizTotal: ids.length,
        lastTopic: lastTopicLabel(d.lastTheoryTopic || '—'),
      };
    } catch (e) {
      return { points: 0, quizDone: 0, quizTotal: ids.length, lastTopic: '—' };
    }
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function renderStudentsTable() {
    var tb = document.getElementById('teacher-tbody');
    if (!tb) return;
    tb.innerHTML = '';
    LabUsers.getUsers()
      .filter(function (u) {
        return u.role === 'student';
      })
      .forEach(function (u) {
        var p = summarizeStudentProgress(u.id);
        var tr = document.createElement('tr');
        tr.className = 'hover:bg-lab-bg/30';
        tr.innerHTML =
          '<td class="px-3 py-2">' +
          escapeHtml(u.displayName || u.username) +
          '</td>' +
          '<td class="px-3 py-2 font-mono text-xs text-lab-accent">' +
          escapeHtml(u.username) +
          '</td>' +
          '<td class="px-3 py-2">' +
          (u.active ? '<span class="text-emerald-400">Sí</span>' : '<span class="text-slate-500">No</span>') +
          '</td>' +
          '<td class="px-3 py-2 font-mono">' +
          p.points +
          '</td>' +
          '<td class="px-3 py-2">' +
          p.quizDone +
          ' / ' +
          p.quizTotal +
          '</td>' +
          '<td class="px-3 py-2 text-xs text-slate-300">' +
          escapeHtml(String(p.lastTopic)) +
          '</td>';
        tb.appendChild(tr);
      });
  }

  function showFormMessage(text, kind) {
    var el = document.getElementById('teacher-topic-form-msg');
    if (!el) return;
    if (!text) {
      el.classList.add('hidden');
      el.textContent = '';
      return;
    }
    el.classList.remove('hidden', 'border-emerald-500/30', 'bg-emerald-950/20', 'text-emerald-200');
    el.classList.remove('border-red-500/30', 'bg-red-950/20', 'text-red-200');
    if (kind === 'error') {
      el.classList.add('border-red-500/30', 'bg-red-950/20', 'text-red-200');
    } else {
      el.classList.add('border-emerald-500/30', 'bg-emerald-950/20', 'text-emerald-200');
    }
    el.textContent = text;
  }

  function wireQuestionKindToggle(wrap) {
    var sel = wrap.querySelector('.teacher-q-kind');
    var pChoice = wrap.querySelector('.teacher-q-panel-choice');
    var pCons = wrap.querySelector('.teacher-q-panel-console');
    if (!sel || !pChoice || !pCons) return;
    function sync() {
      var isConsole = sel.value === 'console';
      pChoice.classList.toggle('hidden', isConsole);
      pCons.classList.toggle('hidden', !isConsole);
      pChoice.querySelectorAll('input, select, textarea').forEach(function (el) {
        el.disabled = isConsole;
      });
      pCons.querySelectorAll('input, select, textarea').forEach(function (el) {
        el.disabled = !isConsole;
      });
    }
    sel.addEventListener('change', sync);
    sync();
  }

  function createQuestionBlock(data) {
    data = data || {};
    var kind = data.kind === 'console' ? 'console' : 'choice';
    var wrap = document.createElement('div');
    wrap.className = 'rounded-xl border border-lab-border bg-lab-bg/40 p-4 space-y-3';
    wrap.innerHTML =
      '<div class="flex items-start justify-between gap-2">' +
      '<span class="text-xs font-medium text-slate-500">Pregunta</span>' +
      '<button type="button" class="teacher-q-remove rounded border border-lab-border px-2 py-0.5 text-[11px] text-slate-400 hover:bg-red-950/30 hover:text-red-300">Quitar</button>' +
      '</div>' +
      '<textarea class="teacher-q-text w-full rounded-lg border border-lab-border bg-lab-bg px-3 py-2 text-sm text-slate-200" rows="2" placeholder="Enunciado (lo verá el estudiante)"></textarea>' +
      '<label class="block text-xs text-slate-400">Tipo' +
      '<select class="teacher-q-kind mt-1 w-full rounded-lg border border-lab-border bg-lab-bg px-3 py-2 text-sm text-slate-200 sm:max-w-xl">' +
      '<option value="choice">Opción múltiple (a / b / c)</option>' +
      '<option value="console">Consola (escribir código; se valida por reglas, no se ejecuta)</option>' +
      '</select></label>' +
      '<div class="teacher-q-panel-choice space-y-3">' +
      '<label class="block text-xs text-slate-400">Respuesta correcta' +
      '<select class="teacher-q-correct mt-1 w-full rounded-lg border border-lab-border bg-lab-bg px-3 py-2 text-sm text-slate-200 sm:max-w-[12rem]">' +
      '<option value="a">a</option><option value="b">b</option><option value="c">c</option>' +
      '</select></label>' +
      '<div class="grid gap-2 sm:grid-cols-3">' +
      '<label class="text-xs text-slate-400">Opción a<input type="text" class="teacher-opt-a mt-1 w-full rounded-lg border border-lab-border bg-lab-bg px-2 py-1.5 text-sm text-slate-200" /></label>' +
      '<label class="text-xs text-slate-400">Opción b<input type="text" class="teacher-opt-b mt-1 w-full rounded-lg border border-lab-border bg-lab-bg px-2 py-1.5 text-sm text-slate-200" /></label>' +
      '<label class="text-xs text-slate-400">Opción c<input type="text" class="teacher-opt-c mt-1 w-full rounded-lg border border-lab-border bg-lab-bg px-2 py-1.5 text-sm text-slate-200" /></label>' +
      '</div></div>' +
      '<div class="teacher-q-panel-console hidden space-y-3">' +
      '<p class="text-xs text-slate-500">El navegador <strong class="text-slate-400">no ejecuta</strong> el código: se normaliza el texto (minúsculas, sin tildes, espacios unificados) y se buscan subcadenas. Una línea en “Debe incluir” = una subcadena obligatoria.</p>' +
      '<label class="block text-xs text-slate-400">Placeholder del área de código' +
      '<input type="text" class="teacher-console-placeholder mt-1 w-full rounded-lg border border-lab-border bg-lab-bg px-3 py-2 text-sm text-slate-200" placeholder="Ej. Escribe un console.log que muestre tu nombre" /></label>' +
      '<label class="block text-xs text-slate-400">Pista opcional' +
      '<textarea class="teacher-console-hint mt-1 w-full rounded-lg border border-lab-border bg-lab-bg px-3 py-2 text-sm text-slate-200" rows="2" placeholder="Ayuda breve"></textarea></label>' +
      '<label class="block text-xs text-slate-400">Longitud mínima (caracteres del texto escrito, sin espacios extremos)' +
      '<input type="number" class="teacher-console-minlen mt-1 w-full rounded-lg border border-lab-border bg-lab-bg px-3 py-2 font-mono text-sm text-slate-200 sm:max-w-[10rem]" min="0" max="2000" value="12" /></label>' +
      '<label class="block text-xs text-slate-400">Debe incluir (una subcadena por línea)' +
      '<textarea class="teacher-console-must mt-1 w-full rounded-lg border border-lab-border bg-lab-bg px-3 py-2 font-mono text-xs text-slate-200" rows="4" placeholder="console.log&#10;hola"></textarea></label>' +
      '<label class="flex cursor-pointer items-center gap-2 text-xs text-slate-400">' +
      '<input type="checkbox" class="teacher-console-reqlog rounded border-lab-border" />' +
      'Exigir la subcadena <code class="text-lab-accent">console.log</code></label>' +
      '</div>';

    wrap.querySelector('.teacher-q-text').value = data.q || '';
    wrap.querySelector('.teacher-q-kind').value = kind;
    wrap.querySelector('.teacher-q-correct').value = data.correct || 'a';
    wrap.querySelector('.teacher-opt-a').value = (data.opts && data.opts.a) || '';
    wrap.querySelector('.teacher-opt-b').value = (data.opts && data.opts.b) || '';
    wrap.querySelector('.teacher-opt-c').value = (data.opts && data.opts.c) || '';
    var ck = data.consoleCheck || {};
    wrap.querySelector('.teacher-console-placeholder').value = data.placeholder != null ? data.placeholder : '';
    wrap.querySelector('.teacher-console-hint').value = data.hint != null ? data.hint : '';
    wrap.querySelector('.teacher-console-minlen').value = String(
      typeof ck.minLength === 'number' ? ck.minLength : 12
    );
    wrap.querySelector('.teacher-console-must').value = Array.isArray(ck.mustInclude)
      ? ck.mustInclude.join('\n')
      : '';
    wrap.querySelector('.teacher-console-reqlog').checked = !!ck.requireConsoleLog;

    wrap.querySelector('.teacher-q-remove').addEventListener('click', function () {
      var mount = document.getElementById('teacher-questions-wrap');
      if (mount && mount.children.length <= 1) {
        showFormMessage('Debe quedar al menos una pregunta.', 'error');
        return;
      }
      wrap.remove();
      showFormMessage('', '');
    });
    wireQuestionKindToggle(wrap);
    return wrap;
  }

  function clearQuestionEditors() {
    var mount = document.getElementById('teacher-questions-wrap');
    if (!mount) return;
    mount.innerHTML = '';
    mount.appendChild(createQuestionBlock());
  }

  function collectQuestionsFromForm() {
    var mount = document.getElementById('teacher-questions-wrap');
    if (!mount) return [];
    var out = [];
    mount.querySelectorAll(':scope > div').forEach(function (block) {
      var qEl = block.querySelector('.teacher-q-text');
      var kindEl = block.querySelector('.teacher-q-kind');
      if (!qEl || !kindEl) return;
      if (kindEl.value === 'console') {
        var mustRaw = (block.querySelector('.teacher-console-must') && block.querySelector('.teacher-console-must').value) || '';
        var mustInclude = mustRaw
          .split(/\r?\n/)
          .map(function (s) {
            return s.trim();
          })
          .filter(Boolean);
        var minLen = parseInt(block.querySelector('.teacher-console-minlen').value, 10);
        if (isNaN(minLen)) minLen = 0;
        out.push({
          kind: 'console',
          q: qEl.value.trim(),
          placeholder: (block.querySelector('.teacher-console-placeholder').value || '').trim(),
          hint: (block.querySelector('.teacher-console-hint').value || '').trim(),
          consoleCheck: {
            minLength: minLen,
            mustInclude: mustInclude,
            requireConsoleLog: block.querySelector('.teacher-console-reqlog').checked,
          },
        });
        return;
      }
      var corr = block.querySelector('.teacher-q-correct');
      var oa = block.querySelector('.teacher-opt-a');
      var ob = block.querySelector('.teacher-opt-b');
      var oc = block.querySelector('.teacher-opt-c');
      if (!corr || !oa || !ob || !oc) return;
      out.push({
        kind: 'choice',
        q: qEl.value.trim(),
        correct: corr.value,
        opts: { a: oa.value.trim(), b: ob.value.trim(), c: oc.value.trim() },
      });
    });
    return out;
  }

  function resetTopicForm() {
    document.getElementById('teacher-topic-edit-id').value = '';
    document.getElementById('teacher-topic-title').value = '';
    document.getElementById('teacher-topic-tab').value = '';
    document.getElementById('teacher-topic-body').value = '';
    document.getElementById('teacher-topic-points').value = '25';
    clearQuestionEditors();
    var cancel = document.getElementById('teacher-topic-cancel');
    if (cancel) cancel.classList.add('hidden');
  }

  function fillFormFromTopic(t) {
    document.getElementById('teacher-topic-edit-id').value = t.id;
    document.getElementById('teacher-topic-title').value = t.title;
    document.getElementById('teacher-topic-tab').value = t.tabLabel;
    document.getElementById('teacher-topic-body').value = t.body;
    document.getElementById('teacher-topic-points').value = String(t.quizPoints);
    var mount = document.getElementById('teacher-questions-wrap');
    if (mount) {
      mount.innerHTML = '';
      (t.questions || []).forEach(function (q) {
        mount.appendChild(createQuestionBlock(q));
      });
      if (!mount.children.length) mount.appendChild(createQuestionBlock());
    }
    var cancel = document.getElementById('teacher-topic-cancel');
    if (cancel) cancel.classList.remove('hidden');
  }

  function renderTopicList() {
    var list = document.getElementById('teacher-topic-list');
    var empty = document.getElementById('teacher-topic-list-empty');
    if (!list) return;
    var topics = LabCustomTopics.getTopics();
    list.innerHTML = '';
    if (empty) empty.classList.toggle('hidden', topics.length > 0);
    topics.forEach(function (t) {
      var li = document.createElement('li');
      li.className =
        'flex flex-col gap-2 rounded-xl border border-lab-border bg-lab-bg/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between';
      li.innerHTML =
        '<div><p class="font-medium text-slate-200">' +
        escapeHtml(t.title) +
        '</p>' +
        '<p class="mt-1 text-xs text-slate-500">' +
        escapeHtml(t.tabLabel) +
        ' · ' +
        t.questions.length +
        ' pregunta(s)' +
        (t.questions.some(function (q) {
          return q.kind === 'console';
        })
          ? ' (incluye consola)'
          : '') +
        ' · ' +
        t.quizPoints +
        ' pts</p></div>' +
        '<div class="flex flex-wrap gap-2">' +
        '<button type="button" class="teacher-edit-topic rounded-lg border border-lab-border px-3 py-1.5 text-xs text-lab-accent hover:bg-lab-accent/10" data-id="' +
        escapeHtml(t.id) +
        '">Editar</button>' +
        '<button type="button" class="teacher-delete-topic rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-300 hover:bg-red-950/20" data-id="' +
        escapeHtml(t.id) +
        '">Eliminar</button>' +
        '</div>';
      list.appendChild(li);
    });

    list.querySelectorAll('.teacher-edit-topic').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-id');
        var topic = LabCustomTopics.findTopic(id);
        if (topic) {
          fillFormFromTopic(topic);
          showFormMessage('', '');
          document.getElementById('teacher-topic-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
    list.querySelectorAll('.teacher-delete-topic').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-id');
        if (!id) return;
        if (!confirm('¿Eliminar este tema? Los estudiantes dejarán de verlo al recargar la página.')) return;
        LabCustomTopics.deleteTopic(id);
        renderTopicList();
        resetTopicForm();
        renderStudentsTable();
        showFormMessage('Tema eliminado.', 'ok');
      });
    });
  }

  function wireCustomTopicsForm() {
    var form = document.getElementById('teacher-topic-form');
    var addQ = document.getElementById('teacher-add-question');
    var cancel = document.getElementById('teacher-topic-cancel');
    if (addQ) {
      addQ.addEventListener('click', function () {
        var mount = document.getElementById('teacher-questions-wrap');
        if (mount) mount.appendChild(createQuestionBlock());
        showFormMessage('', '');
      });
    }
    if (cancel) {
      cancel.addEventListener('click', function () {
        resetTopicForm();
        showFormMessage('', '');
      });
    }
    if (form) {
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var questions = collectQuestionsFromForm().filter(function (q) {
          if (q.kind === 'console') {
            if (!q.q.length) return false;
            var c = q.consoleCheck || {};
            var hasMust = Array.isArray(c.mustInclude) && c.mustInclude.length > 0;
            var hasMin = typeof c.minLength === 'number' && c.minLength > 0;
            return hasMust || c.requireConsoleLog || hasMin;
          }
          return q.q.length > 0 && q.opts.a && q.opts.b && q.opts.c;
        });
        if (!questions.length) {
          showFormMessage(
            'Añade al menos una pregunta válida: opción múltiple con texto y las tres opciones, o consola con enunciado y al menos una regla (subcadenas, longitud mínima o exigir console.log).',
            'error'
          );
          return;
        }
        var title = document.getElementById('teacher-topic-title').value.trim();
        var tab = document.getElementById('teacher-topic-tab').value.trim();
        var body = document.getElementById('teacher-topic-body').value.trim();
        var points = parseInt(document.getElementById('teacher-topic-points').value, 10);
        if (!title || !tab) {
          showFormMessage('Título y etiqueta de pestaña son obligatorios.', 'error');
          return;
        }
        var editId = document.getElementById('teacher-topic-edit-id').value.trim();
        var payload = {
          title: title,
          tabLabel: tab,
          body: body,
          quizPoints: isNaN(points) ? 25 : points,
          questions: questions,
        };
        if (editId) {
          LabCustomTopics.updateTopic(editId, payload);
          showFormMessage('Tema actualizado. Los estudiantes verán los cambios al recargar.', 'ok');
        } else {
          LabCustomTopics.addTopic(payload);
          showFormMessage('Tema guardado. Los estudiantes lo verán al abrir o recargar Teoría.', 'ok');
        }
        resetTopicForm();
        renderTopicList();
        renderStudentsTable();
      });
    }
  }

  function boot() {
    wireThemeToggle();
    var s = LabUsers.getSession();
    var el = document.getElementById('teacher-welcome');
    if (el && s) {
      el.textContent = 'Hola, ' + (s.displayName || s.username) + '.';
    }
    document.getElementById('teacher-logout').addEventListener('click', function () {
      LabUsers.clearSession();
      window.location.href = 'login.html';
    });
    wireCustomTopicsForm();
    clearQuestionEditors();
    renderTopicList();
    LabUsers.initUsers().then(function () {
      renderStudentsTable();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
