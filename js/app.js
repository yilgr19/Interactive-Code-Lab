/**
 * Interactive Code Lab — estado, gamificación y persistencia (localStorage)
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'interactiveCodeLab_v1';

  var BADGE_DEFS = [
    { id: 'explorer', label: 'Explorador', desc: 'Visitaste el módulo de algoritmos y RA', icon: '🔭' },
    { id: 'conditional_master', label: 'Lógica condicional', desc: 'Completaste el reto de acceso por edad', icon: '🎯' },
  ];

  var POINTS_CHALLENGE = 100;

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      var data = JSON.parse(raw);
      return {
        points: typeof data.points === 'number' ? data.points : 0,
        badges: Array.isArray(data.badges) ? data.badges : [],
        challengeCompleted: !!data.challengeCompleted,
        theoryVisited: !!data.theoryVisited,
        studentName: typeof data.studentName === 'string' && data.studentName.trim() ? data.studentName.trim() : 'Estudiante',
      };
    } catch (e) {
      return defaultState();
    }
  }

  function defaultState() {
    return {
      points: 0,
      badges: [],
      challengeCompleted: false,
      theoryVisited: false,
      studentName: 'Estudiante',
    };
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('No se pudo guardar en localStorage', e);
    }
  }

  function normalizeForCheck(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Valida solución del reto sin eval(): busca condición de mayoría de edad (18) y ambas ramas permitido/denegado.
   */
  function validateConditionalSolution(code) {
    if (!code || code.trim().length < 10) {
      return { ok: false, message: 'Escribe una solución más completa (condicional + mensajes).' };
    }

    var n = normalizeForCheck(code);

    var hasBranching =
      /\bif\s*\(/.test(n) ||
      /\bif\s+/.test(n) ||
      /\bsi\s*\(/.test(n) ||
      /\bsi\s+/.test(n) ||
      n.includes('si ') ||
      n.includes(' entonces');

    if (!hasBranching) {
      return { ok: false, message: 'Incluye una estructura condicional (if/si …).' };
    }

    var hasAgeCheck =
      (n.includes('edad') || n.includes('age')) &&
      (n.includes('18') || n.includes('>= 18') || n.includes('>=18') || n.includes('> 17') || n.includes('>17'));

    if (!hasAgeCheck) {
      return { ok: false, message: 'Debes comparar edad (o age) con 18 (mayoría de edad).' };
    }

    var hasElse =
      /\belse\b/.test(n) ||
      /\bsino\b/.test(n) ||
      /\bsi no\b/.test(n) ||
      /}\s*else\s*{/.test(code.replace(/\s+/g, ' '));

    if (!hasElse) {
      return { ok: false, message: 'Incluye la rama alternativa (else / sino) para acceso denegado.' };
    }

    var permitido =
      n.includes('permitido') ||
      n.includes('permitir') ||
      n.includes('allowed') ||
      n.includes('acceso permitido') ||
      n.includes('"ok"') ||
      n.includes("'ok'");

    var denegado =
      n.includes('denegado') ||
      n.includes('denegar') ||
      n.includes('rechazado') ||
      n.includes('denied') ||
      n.includes('no permitido') ||
      n.includes('menor');

    if (!permitido || !denegado) {
      return {
        ok: false,
        message: 'Indica explícitamente ambos resultados (p. ej. “Permitido” y “Denegado” o equivalentes).',
      };
    }

    return { ok: true, message: '¡Correcto! Has aplicado bien las condicionales.' };
  }

  function triggerConfetti() {
    if (typeof confetti !== 'function') return;
    var count = 120;
    var defaults = { origin: { y: 0.65 }, zIndex: 9999 };

    function fire(particleRatio, opts) {
      confetti(
        Object.assign({}, defaults, opts, {
          particleCount: Math.floor(count * particleRatio),
        })
      );
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }

  function renderBadges(state) {
    var list = document.getElementById('badges-list');
    if (!list) return;
    list.innerHTML = '';

    BADGE_DEFS.forEach(function (def) {
      var earned = state.badges.indexOf(def.id) !== -1;
      var li = document.createElement('li');
      li.className = 'badge-item' + (earned ? '' : ' locked');
      li.innerHTML =
        '<span class="badge-icon" aria-hidden="true">' +
        (earned ? def.icon : '🔒') +
        '</span>' +
        '<div><div class="font-medium text-slate-200">' +
        def.label +
        '</div><div class="text-xs text-slate-500">' +
        def.desc +
        '</div></div>';
      list.appendChild(li);
    });
  }

  function updatePointsDisplay(state) {
    var el = document.getElementById('points-display');
    if (el) el.textContent = String(state.points);
  }

  function showSection(id) {
    document.querySelectorAll('.section-panel').forEach(function (panel) {
      panel.classList.add('hidden');
    });
    var target = document.getElementById('section-' + id);
    if (target) target.classList.remove('hidden');

    document.querySelectorAll('.nav-btn').forEach(function (btn) {
      var isCurrent = btn.getAttribute('data-section') === id;
      btn.setAttribute('aria-current', isCurrent ? 'true' : 'false');
    });
  }

  function applyStudentNameToUI() {
    var inputEl = document.getElementById('student-name-input');
    if (inputEl && document.activeElement !== inputEl) {
      inputEl.value = state.studentName;
    }
  }

  var state = loadState();
  updatePointsDisplay(state);
  renderBadges(state);
  applyStudentNameToUI();

  var nameInput = document.getElementById('student-name-input');
  if (nameInput) {
    nameInput.addEventListener('change', function () {
      var v = nameInput.value.trim() || 'Estudiante';
      state.studentName = v;
      saveState(state);
      applyStudentNameToUI();
    });
  }

  document.querySelectorAll('.nav-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var section = btn.getAttribute('data-section');
      if (!section) return;
      showSection(section);

      if (section === 'theory' && !state.theoryVisited) {
        state.theoryVisited = true;
        if (state.badges.indexOf('explorer') === -1) {
          state.badges.push('explorer');
        }
        saveState(state);
        renderBadges(state);
      }
    });
  });

  var mv = document.getElementById('flow-model-viewer');
  var mvStatus = document.getElementById('mv-status');
  var btnAr = document.getElementById('btn-ar-scan');

  function setMvStatus(text, kind) {
    if (!mvStatus) return;
    mvStatus.textContent = text;
    mvStatus.className =
      'border-b border-lab-border px-4 py-2 text-center text-xs ' +
      (kind === 'error' ? 'bg-red-950/40 text-amber-300' : kind === 'ok' ? 'hidden' : 'bg-lab-surface/40 text-slate-400');
    if (kind === 'ok') mvStatus.setAttribute('aria-hidden', 'true');
    else mvStatus.removeAttribute('aria-hidden');
  }

  function wireModelViewer() {
    if (!mv) return;
    mv.addEventListener('load', function () {
      setMvStatus('', 'ok');
    });
    mv.addEventListener('error', function () {
      setMvStatus(
        'No se pudo cargar el modelo. Abre la página con python -m http.server (carpeta del proyecto) y comprueba que exista assets/FlujoLogicoAlgoritmo.glb (o ejecuta scripts/generar_modelo_flujo_logico.py).',
        'error'
      );
    });
  }

  if (customElements.whenDefined) {
    customElements.whenDefined('model-viewer').then(wireModelViewer).catch(function () {
      wireModelViewer();
    });
  } else {
    wireModelViewer();
  }

  if (btnAr && mv) {
    btnAr.addEventListener('click', function () {
      if (mv.canActivateAR === false) {
        alert(
          'La RA no está disponible en este navegador o el modelo aún no cargó.\n\n' +
            'Prueba en Chrome (Android) o Safari (iPhone/iPad) después de ver el modelo en 3D.'
        );
        return;
      }
      var arFn = mv.activateAR;
      if (typeof arFn !== 'function') {
        alert(
          'La realidad aumentada no está disponible aquí. Prueba Chrome en Android o Safari en iOS, y recarga la página.'
        );
        return;
      }
      try {
        var out = arFn.call(mv);
        if (out && typeof out.then === 'function') {
          out.catch(function () {
            alert(
              'No se pudo abrir la RA.\n\n' +
                '• Usa Chrome en Android o Safari en iPhone/iPad.\n' +
                '• Espera a que el diagrama de flujo se vea en 3D.\n' +
                '• En muchos PCs no hay “ver en tu sala”; el 3D en pantalla es lo habitual.'
            );
          });
        }
      } catch (err) {
        alert(
          'No se pudo iniciar la RA en este dispositivo. En PC suele limitarse a ver y rotar el modelo en pantalla.'
        );
      }
    });
  }

  var btnValidate = document.getElementById('btn-validate');
  var codeInput = document.getElementById('code-input');
  var validationMsg = document.getElementById('validation-message');

  if (btnValidate && codeInput) {
    btnValidate.addEventListener('click', function () {
      var result = validateConditionalSolution(codeInput.value);
      if (validationMsg) {
        validationMsg.textContent = result.message;
        validationMsg.className =
          'text-sm ' + (result.ok ? 'text-emerald-400 font-medium' : 'text-amber-400');
      }

      if (result.ok) {
        var firstTime = !state.challengeCompleted;
        if (firstTime) {
          state.challengeCompleted = true;
          state.points += POINTS_CHALLENGE;
          if (state.badges.indexOf('conditional_master') === -1) {
            state.badges.push('conditional_master');
          }
          saveState(state);
          updatePointsDisplay(state);
          renderBadges(state);
          triggerConfetti();
        } else {
          if (typeof confetti === 'function') {
            confetti({ particleCount: 35, spread: 54, origin: { y: 0.72 }, zIndex: 9999 });
          }
        }
      }
    });
  }

  showSection('dashboard');
})();
