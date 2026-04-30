/**
 * Interactive Code Lab — gamificación, temas teóricos + RA, localStorage
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'interactiveCodeLab_v1';
  /* Orden pedagógico por niveles: N1 fund. → N2 expresión/rep. → N3 datos/módulos */
  var THEORY_IDS = ['algoritmos', 'variables', 'operadores', 'bucles', 'arreglos', 'funciones'];

  /** Insignias de progreso general (no son retos de código). */
  var PROGRESS_BADGE_DEFS = [
    { id: 'explorer', label: 'Explorador', desc: 'Abriste el módulo Teoría + RA', icon: '🔭' },
    { id: 'curriculum_ra', label: 'Recorrido RA', desc: 'Completaste los 6 temas (3 niveles) con su modelo 3D', icon: '📚' },
    { id: 'quiz_master', label: 'Comprensión', desc: 'Acertaste los cuestionarios de los 6 temas', icon: '📝' },
  ];

  var POINTS_QUIZ_TOPIC = 20;

  function defaultChallengeRewards() {
    return {
      conditional_age: false,
      variables_total: false,
      operators_parity: false,
      loop_sum: false,
      array_average: false,
      function_double: false,
    };
  }

  /** Sincroniza retos completados si ya existía la insignia en datos antiguos. */
  var CHALLENGE_BADGE_TO_REWARD_KEY = {
    conditional_master: 'conditional_age',
    reto_variables: 'variables_total',
    reto_operadores: 'operators_parity',
    reto_bucle: 'loop_sum',
    reto_arreglos: 'array_average',
    reto_funciones: 'function_double',
  };

  /** Dos preguntas por tema; tres opciones; una correcta (clave k). */
  var QUIZZES = {
    algoritmos: [
      {
        q: 'En un condicional, ¿qué papel cumple el bloque asociado a `else`?',
        correct: 'b',
        opts: [
          { k: 'a', t: 'Se ejecuta siempre antes que el `if`.' },
          { k: 'b', t: 'Se ejecuta cuando la condición del `if` no se cumple.' },
          { k: 'c', t: 'Solo sirve para comentar el código y no hace nada.' },
        ],
      },
      {
        q: 'En un diagrama de flujo clásico, ¿qué forma suele usarse para una decisión (sí / no)?',
        correct: 'b',
        opts: [
          { k: 'a', t: 'Un rectángulo (solo acciones).' },
          { k: 'b', t: 'Un rombo.' },
          { k: 'c', t: 'Un triángulo equilátero.' },
        ],
      },
    ],
    variables: [
      {
        q: '¿Qué hace la línea `let precio = 99;` en JavaScript?',
        correct: 'b',
        opts: [
          { k: 'a', t: 'Compara la variable `precio` con 99.' },
          { k: 'b', t: 'Declara `precio` y guarda el valor numérico 99.' },
          { k: 'c', t: 'Imprime automáticamente 99 en la pantalla del usuario.' },
        ],
      },
      {
        q: '¿Cuál de estos valores es de tipo booleano (lógico) en JavaScript?',
        correct: 'b',
        opts: [
          { k: 'a', t: '"false" entre comillas dobles.' },
          { k: 'b', t: 'false sin comillas.' },
          { k: 'c', t: 'El número 0 como único valor posible.' },
        ],
      },
    ],
    operadores: [
      {
        q: '¿Qué resultado da la expresión `10 === 10` en JavaScript?',
        correct: 'a',
        opts: [
          { k: 'a', t: 'true (comparación verdadera).' },
          { k: 'b', t: '20 (suma implícita).' },
          { k: 'c', t: 'El texto "10".' },
        ],
      },
      {
        q: 'En `7 % 3`, el operador `%` (módulo) devuelve…',
        correct: 'b',
        opts: [
          { k: 'a', t: 'El cociente entero de la división (2).' },
          { k: 'b', t: 'El resto después de dividir (1).' },
          { k: 'c', t: '21 (producto de 7 y 3).' },
        ],
      },
    ],
    bucles: [
      {
        q: 'En un `while`, ¿cuándo deja de repetirse el bloque interior?',
        correct: 'a',
        opts: [
          { k: 'a', t: 'Cuando la condición del `while` es falsa.' },
          { k: 'b', t: 'Siempre después de exactamente una ejecución.' },
          { k: 'c', t: 'Nunca; el `while` no puede terminar.' },
        ],
      },
      {
        q: 'En un `for` típico, las tres partes entre paréntesis son: inicialización, condición y…',
        correct: 'b',
        opts: [
          { k: 'a', t: 'El nombre del archivo fuente.' },
          { k: 'b', t: 'La actualización del contador (ej. `i++`).' },
          { k: 'c', t: 'Un mensaje de error obligatorio.' },
        ],
      },
    ],
    arreglos: [
      {
        q: 'Para `let notas = [10, 20, 30];`, ¿cómo se accede al primer elemento?',
        correct: 'b',
        opts: [
          { k: 'a', t: 'notas[1]' },
          { k: 'b', t: 'notas[0]' },
          { k: 'c', t: 'notas.primero' },
        ],
      },
      {
        q: 'Para ese mismo arreglo de tres elementos, `notas.length` vale…',
        correct: 'b',
        opts: [
          { k: 'a', t: '2' },
          { k: 'b', t: '3' },
          { k: 'c', t: '30' },
        ],
      },
    ],
    funciones: [
      {
        q: '¿Qué palabra clave se usa en JavaScript para devolver un valor desde una función?',
        correct: 'b',
        opts: [
          { k: 'a', t: 'print' },
          { k: 'b', t: 'return' },
          { k: 'c', t: 'break' },
        ],
      },
      {
        q: 'Al llamar `sumar(4, 5)`, los valores 4 y 5 son los…',
        correct: 'b',
        opts: [
          { k: 'a', t: 'Índices del arreglo.' },
          { k: 'b', t: 'Argumentos (valores que pasas a la función).' },
          { k: 'c', t: 'Tipos de retorno obligatorios.' },
        ],
      },
    ],
  };

  function migrateTopicsVisited(data) {
    var o = {};
    THEORY_IDS.forEach(function (id) {
      o[id] = false;
    });
    if (data.topicsVisited && typeof data.topicsVisited === 'object') {
      THEORY_IDS.forEach(function (id) {
        o[id] = !!data.topicsVisited[id];
      });
    } else if (data.theoryVisited) {
      o.algoritmos = true;
    }
    return o;
  }

  function migrateQuizRewards(data) {
    var o = {};
    THEORY_IDS.forEach(function (id) {
      o[id] = !!(data.quizRewards && data.quizRewards[id]);
    });
    return o;
  }

  function migrateChallengeRewards(data) {
    var o = defaultChallengeRewards();
    if (data.challengeRewards && typeof data.challengeRewards === 'object') {
      Object.keys(o).forEach(function (k) {
        if (data.challengeRewards[k]) o[k] = true;
      });
    }
    if (data.challengeCompleted) {
      o.conditional_age = true;
    }
    if (Array.isArray(data.badges)) {
      Object.keys(CHALLENGE_BADGE_TO_REWARD_KEY).forEach(function (badgeId) {
        if (data.badges.indexOf(badgeId) !== -1) {
          o[CHALLENGE_BADGE_TO_REWARD_KEY[badgeId]] = true;
        }
      });
    }
    return o;
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      var data = JSON.parse(raw);
      return {
        points: typeof data.points === 'number' ? data.points : 0,
        badges: Array.isArray(data.badges) ? data.badges : [],
        theoryVisited: !!data.theoryVisited,
        topicsVisited: migrateTopicsVisited(data),
        lastTheoryTopic:
          typeof data.lastTheoryTopic === 'string' && THEORY_IDS.indexOf(data.lastTheoryTopic) !== -1
            ? data.lastTheoryTopic
            : 'algoritmos',
        studentName:
          typeof data.studentName === 'string' && data.studentName.trim()
            ? data.studentName.trim()
            : 'Estudiante',
        quizRewards: migrateQuizRewards(data),
        challengeRewards: migrateChallengeRewards(data),
      };
    } catch (e) {
      return defaultState();
    }
  }

  function defaultState() {
    var tv = {};
    var qr = {};
    THEORY_IDS.forEach(function (id) {
      tv[id] = false;
      qr[id] = false;
    });
    return {
      points: 0,
      badges: [],
      theoryVisited: false,
      topicsVisited: tv,
      lastTheoryTopic: 'algoritmos',
      studentName: 'Estudiante',
      quizRewards: qr,
      challengeRewards: defaultChallengeRewards(),
    };
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('No se pudo guardar en localStorage', e);
    }
  }

  /** Tema 1.1 siempre abierto; cada siguiente tema exige cuestionario completo del anterior. */
  function isTopicUnlocked(st, topicId) {
    var idx = THEORY_IDS.indexOf(topicId);
    if (idx === -1) return false;
    if (idx === 0) return true;
    return !!st.quizRewards[THEORY_IDS[idx - 1]];
  }

  function getFirstUnlockedTopicId(st) {
    for (var i = 0; i < THEORY_IDS.length; i++) {
      if (isTopicUnlocked(st, THEORY_IDS[i])) return THEORY_IDS[i];
    }
    return 'algoritmos';
  }

  function clampLastTheoryTopic(st) {
    var t = st.lastTheoryTopic;
    if (!isTopicUnlocked(st, t)) {
      st.lastTheoryTopic = getFirstUnlockedTopicId(st);
      saveState(st);
    }
  }

  var topicLockHintTimer;
  function flashTopicLockHint(message) {
    var el = document.getElementById('topic-lock-hint');
    if (!el) return;
    el.textContent = message;
    el.classList.remove('hidden');
    clearTimeout(topicLockHintTimer);
    topicLockHintTimer = setTimeout(function () {
      el.classList.add('hidden');
    }, 4800);
  }

  function renderTopicTabsLockState(st) {
    document.querySelectorAll('.topic-tab').forEach(function (tab) {
      var topic = tab.getAttribute('data-topic');
      if (!topic) return;
      var unlocked = isTopicUnlocked(st, topic);
      if (unlocked) {
        tab.classList.remove('topic-tab--locked');
        tab.removeAttribute('aria-disabled');
        tab.removeAttribute('title');
        tab.removeAttribute('tabindex');
      } else {
        tab.classList.add('topic-tab--locked');
        tab.setAttribute('aria-disabled', 'true');
        tab.setAttribute('title', 'Completa el cuestionario del tema anterior (todas las respuestas correctas) para desbloquear este tema.');
        tab.setAttribute('tabindex', '-1');
      }
    });
  }

  function allTopicsVisited(state) {
    return THEORY_IDS.every(function (id) {
      return state.topicsVisited[id];
    });
  }

  function maybeAwardCurriculumBadge(state) {
    if (!allTopicsVisited(state)) return;
    if (state.badges.indexOf('curriculum_ra') !== -1) return;
    state.badges.push('curriculum_ra');
    saveState(state);
    renderBadges(state);
  }

  function allQuizzesPassed(state) {
    return THEORY_IDS.every(function (id) {
      return state.quizRewards[id];
    });
  }

  function maybeAwardQuizMasterBadge(state) {
    if (!allQuizzesPassed(state)) return;
    if (state.badges.indexOf('quiz_master') !== -1) return;
    state.badges.push('quiz_master');
    saveState(state);
    renderBadges(state);
  }

  function quizConfettiSmall() {
    if (typeof confetti !== 'function') return;
    confetti({ particleCount: 55, spread: 58, origin: { y: 0.75 }, zIndex: 9999 });
  }

  function renderAllTopicQuizzes(currentState) {
    document.querySelectorAll('.topic-quiz-mount').forEach(function (mount) {
      var topicId = mount.getAttribute('data-topic-quiz');
      if (!topicId || !QUIZZES[topicId]) return;

      mount.innerHTML = '';
      var box = document.createElement('div');
      box.className = 'topic-quiz';
      box.setAttribute('data-quiz-box', topicId);

      var title = document.createElement('h4');
      title.textContent = 'Comprueba lo aprendido (opción múltiple)';
      box.appendChild(title);

      if (currentState.quizRewards[topicId]) {
        var done = document.createElement('div');
        done.className = 'quiz-done-badge';
        done.textContent =
          'Completado: respondiste bien las dos preguntas. +' + POINTS_QUIZ_TOPIC + ' pts (solo la primera vez).';
        box.appendChild(done);
      }

      QUIZZES[topicId].forEach(function (question, qi) {
        var wrapQ = document.createElement('div');
        wrapQ.className = 'quiz-question';

        var pq = document.createElement('p');
        pq.className = 'quiz-q-text';
        pq.textContent = qi + 1 + '. ' + question.q;
        wrapQ.appendChild(pq);

        var opts = document.createElement('div');
        opts.className = 'quiz-options';

        question.opts.forEach(function (opt) {
          var lab = document.createElement('label');
          lab.className = 'quiz-option';
          var inp = document.createElement('input');
          inp.type = 'radio';
          inp.name = 'quiz-' + topicId + '-' + qi;
          inp.value = opt.k;
          if (currentState.quizRewards[topicId]) {
            inp.disabled = true;
            if (opt.k === question.correct) inp.checked = true;
          }
          lab.appendChild(inp);
          var span = document.createElement('span');
          span.textContent = opt.t;
          lab.appendChild(span);
          opts.appendChild(lab);
        });

        wrapQ.appendChild(opts);
        box.appendChild(wrapQ);
      });

      var feedback = document.createElement('p');
      feedback.className = 'quiz-feedback-msg text-slate-500';
      feedback.setAttribute('role', 'status');

      if (!currentState.quizRewards[topicId]) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-quiz-check';
        btn.textContent = 'Comprobar respuestas';
        btn.addEventListener('click', function () {
          btn.disabled = true;
          var allOk = true;
          var labels = box.querySelectorAll('.quiz-option');

          labels.forEach(function (l) {
            l.classList.remove('quiz-option--correct', 'quiz-option--wrong');
          });

          var unanswered = 0;
          QUIZZES[topicId].forEach(function (question, qi) {
            var name = 'quiz-' + topicId + '-' + qi;
            var sel = box.querySelector('input[name="' + name + '"]:checked');
            var picked = sel ? sel.value : null;
            if (!picked) unanswered += 1;
            if (picked !== question.correct) {
              allOk = false;
            }

            question.opts.forEach(function (opt) {
              var r = box.querySelector('input[name="' + name + '"][value="' + opt.k + '"]');
              var lab = r && r.closest('.quiz-option');
              if (!lab) return;
              if (opt.k === question.correct) {
                lab.classList.add('quiz-option--correct');
              }
              if (picked && opt.k === picked && picked !== question.correct) {
                lab.classList.add('quiz-option--wrong');
              }
            });
          });

          if (allOk) {
            feedback.className = 'quiz-feedback-msg text-emerald-400 font-medium';
            feedback.textContent =
              '¡Muy bien! Demuestras que entiendes las ideas clave de este tema.';
            currentState.quizRewards[topicId] = true;
            currentState.points += POINTS_QUIZ_TOPIC;
            saveState(currentState);
            updatePointsDisplay(currentState);
            maybeAwardQuizMasterBadge(currentState);
            quizConfettiSmall();
            renderAllTopicQuizzes(currentState);
          } else {
            feedback.className = 'quiz-feedback-msg text-amber-400';
            feedback.textContent =
              'Algunas respuestas no son correctas. En verde está la opción adecuada; en rojo, la que elegiste si era incorrecta. Vuelve a intentar.';
            if (unanswered > 0) {
              feedback.textContent =
                unanswered === QUIZZES[topicId].length
                  ? 'Selecciona una opción en cada pregunta y pulsa Comprobar de nuevo.'
                  : 'Falta marcar una o más preguntas. Completa todas y vuelve a comprobar.';
            }
            btn.disabled = false;
          }
        });
        box.appendChild(btn);
      }

      box.appendChild(feedback);
      mount.appendChild(box);
    });
    renderTopicTabsLockState(currentState);
    renderChallengePanels(currentState);
  }

  function markTopicVisited(state, topicId) {
    if (THEORY_IDS.indexOf(topicId) === -1) return;
    if (!state.topicsVisited[topicId]) {
      state.topicsVisited[topicId] = true;
      saveState(state);
      maybeAwardCurriculumBadge(state);
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

  function validateVariablesTotal(code) {
    if (!code || code.trim().length < 12) {
      return { ok: false, message: 'Escribe código con precio, cantidad y total.' };
    }
    var n = normalizeForCheck(code);
    var hasPrecio = n.includes('precio') || n.includes('price');
    var hasCantidad = n.includes('cantidad') || n.includes('quantity') || n.includes('qty');
    if (!hasPrecio || !hasCantidad) {
      return { ok: false, message: 'Declara variables como precio y cantidad (o price/quantity).' };
    }
    if (!n.includes('10') || !n.includes('2')) {
      return { ok: false, message: 'Usa precio 10 y cantidad 2.' };
    }
    if (!n.includes('total')) {
      return { ok: false, message: 'Guarda el resultado en una variable total.' };
    }
    if (!n.includes('*') && !n.includes('20')) {
      return { ok: false, message: 'Obtén el total multiplicando precio × cantidad (20).' };
    }
    if (!n.includes('20')) {
      return { ok: false, message: 'Debe quedar claro que el total es 20 (valor o comprobación).' };
    }
    return { ok: true, message: '¡Bien! Variables y operación coherentes.' };
  }

  function validateOperatorsParity(code) {
    if (!code || code.trim().length < 15) {
      return { ok: false, message: 'Incluye el operador % y condicionales para 8 y 7.' };
    }
    var n = normalizeForCheck(code);
    if (!n.includes('%') || !n.includes('2')) {
      return { ok: false, message: 'Usa el módulo (%) con 2 para distinguir par/impar.' };
    }
    var hasBranch = /\bif\b|\bsi\b/.test(n) || n.includes('entonces');
    if (!hasBranch) {
      return { ok: false, message: 'Usa al menos una condicional (if / si).' };
    }
    if (!n.includes('8')) {
      return { ok: false, message: 'Trata el caso del número 8.' };
    }
    if (!n.includes('7')) {
      return { ok: false, message: 'Trata el caso del número 7.' };
    }
    var hasPar = n.includes('par') || n.includes('even');
    var hasImpar = n.includes('impar') || n.includes('odd');
    if (!hasPar || !hasImpar) {
      return { ok: false, message: 'Indica explícitamente par e impar (texto o mensaje).' };
    }
    return { ok: true, message: '¡Correcto! Buen uso de % y condicionales.' };
  }

  function validateLoopSum(code) {
    if (!code || code.trim().length < 15) {
      return { ok: false, message: 'Usa un bucle y acumula la suma del 1 al 10.' };
    }
    var n = normalizeForCheck(code);
    var hasLoop = /\bfor\b|\bwhile\b|\bmientras\b/.test(n) || /\bpara\b/.test(n);
    if (!hasLoop) {
      return { ok: false, message: 'Incluye un bucle: for, while o mientras/para en pseudocódigo.' };
    }
    if (!n.includes('55')) {
      return { ok: false, message: 'El resultado debe ser 55 (suma 1+2+…+10).' };
    }
    return { ok: true, message: '¡Perfecto! El bucle y la suma encajan.' };
  }

  function validateArrayAverage(code) {
    if (!code || code.trim().length < 15) {
      return { ok: false, message: 'Define el arreglo [8,9,10] y calcula el promedio.' };
    }
    var n = normalizeForCheck(code);
    if (!n.includes('8') || !n.includes('9') || !n.includes('10')) {
      return { ok: false, message: 'El arreglo debe contener 8, 9 y 10.' };
    }
    if (!n.includes('[') && !n.includes('arreglo')) {
      return { ok: false, message: 'Usa notación de arreglo [ ] o indica un arreglo en pseudocódigo.' };
    }
    if (!n.includes('/') && !n.includes('promedio') && !n.includes('average')) {
      return { ok: false, message: 'Calcula el promedio (división entre 3 o equivalente).' };
    }
    if (!n.includes('9')) {
      return { ok: false, message: 'El promedio de 8, 9 y 10 es 9; deja ese resultado visible.' };
    }
    return { ok: true, message: '¡Muy bien! Arreglo y promedio correctos.' };
  }

  function validateFunctionDouble(code) {
    if (!code || code.trim().length < 15) {
      return { ok: false, message: 'Define una función con return que devuelva el doble.' };
    }
    var n = normalizeForCheck(code);
    var hasFn = /\bfunction\b/.test(n) || n.includes('=>');
    if (!hasFn) {
      return { ok: false, message: 'Define una función (function … o flecha =>).' };
    }
    if (!n.includes('return')) {
      return { ok: false, message: 'Usa return para devolver el valor.' };
    }
    if (!n.includes('*') && !n.includes('doble') && !n.includes('double')) {
      return { ok: false, message: 'El valor devuelto debe ser el doble del parámetro (×2).' };
    }
    if (!n.includes('3') || !n.includes('6')) {
      return { ok: false, message: 'Incluye la idea de prueba: doble(3) → 6 (en código o comentario).' };
    }
    return { ok: true, message: '¡Excelente! Función y return bien planteados.' };
  }

  var CHALLENGE_DEFS = [
    {
      id: 'conditional_age',
      badgeId: 'conditional_master',
      label: 'Condicionales',
      desc: 'Reto: acceso por edad',
      icon: '🔷',
      requiresQuizTopic: 'algoritmos',
      points: 100,
      validate: validateConditionalSolution,
    },
    {
      id: 'variables_total',
      badgeId: 'reto_variables',
      label: 'Variables',
      desc: 'Reto: precio × cantidad',
      icon: '🏷️',
      requiresQuizTopic: 'variables',
      points: 85,
      validate: validateVariablesTotal,
    },
    {
      id: 'operators_parity',
      badgeId: 'reto_operadores',
      label: 'Operadores',
      desc: 'Reto: par/impar con %',
      icon: '🧮',
      requiresQuizTopic: 'operadores',
      points: 85,
      validate: validateOperatorsParity,
    },
    {
      id: 'loop_sum',
      badgeId: 'reto_bucle',
      label: 'Bucles',
      desc: 'Reto: suma 1…10',
      icon: '🔄',
      requiresQuizTopic: 'bucles',
      points: 90,
      validate: validateLoopSum,
    },
    {
      id: 'array_average',
      badgeId: 'reto_arreglos',
      label: 'Arreglos',
      desc: 'Reto: promedio',
      icon: '📋',
      requiresQuizTopic: 'arreglos',
      points: 90,
      validate: validateArrayAverage,
    },
    {
      id: 'function_double',
      badgeId: 'reto_funciones',
      label: 'Funciones',
      desc: 'Reto: función doble',
      icon: '🔧',
      requiresQuizTopic: 'funciones',
      points: 95,
      validate: validateFunctionDouble,
    },
  ];

  var TOPIC_TITLE_FOR_LOCK = {
    algoritmos: '1.1 · Algoritmos y condicionales',
    variables: '1.2 · Variables y tipos',
    operadores: '2.1 · Operadores',
    bucles: '2.2 · Bucles',
    arreglos: '3.1 · Arreglos',
    funciones: '3.2 · Funciones',
  };

  function getChallengeDef(challengeId) {
    for (var i = 0; i < CHALLENGE_DEFS.length; i++) {
      if (CHALLENGE_DEFS[i].id === challengeId) return CHALLENGE_DEFS[i];
    }
    return null;
  }

  function isChallengeUnlocked(st, challengeId) {
    var def = getChallengeDef(challengeId);
    if (!def) return false;
    return !!st.quizRewards[def.requiresQuizTopic];
  }

  function syncChallengeBadgesFromRewards(st) {
    CHALLENGE_DEFS.forEach(function (c) {
      if (st.challengeRewards[c.id] && st.badges.indexOf(c.badgeId) === -1) {
        st.badges.push(c.badgeId);
      }
    });
  }

  function renderChallengeBadgesCard(st) {
    var list = document.getElementById('challenge-badges-list');
    if (!list) return;
    list.innerHTML = '';

    CHALLENGE_DEFS.forEach(function (c) {
      var earned = !!st.challengeRewards[c.id];
      var unlocked = isChallengeUnlocked(st, c.id);
      var li = document.createElement('li');
      li.className = 'challenge-badge-row' + (earned ? ' challenge-badge-row--earned' : ' challenge-badge-row--pending');

      var icon = document.createElement('span');
      icon.className = 'challenge-badge-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = earned ? c.icon : unlocked ? '○' : '🔒';

      var text = document.createElement('div');
      text.className = 'challenge-badge-text min-w-0';
      var title = document.createElement('div');
      title.className = 'text-xs font-medium text-slate-200';
      title.textContent = c.label;
      var sub = document.createElement('div');
      sub.className = 'text-[11px] text-slate-500 leading-snug';
      if (earned) {
        sub.textContent = c.desc + ' · +' + c.points + ' pts';
      } else if (unlocked) {
        sub.textContent = 'Disponible en Retos · ' + c.desc;
      } else {
        sub.textContent =
          'Bloqueado: completa el cuestionario de ' + (TOPIC_TITLE_FOR_LOCK[c.requiresQuizTopic] || c.requiresQuizTopic);
      }
      text.appendChild(title);
      text.appendChild(sub);
      li.appendChild(icon);
      li.appendChild(text);
      list.appendChild(li);
    });
  }

  function renderChallengePanels(st) {
    CHALLENGE_DEFS.forEach(function (c) {
      var unlocked = isChallengeUnlocked(st, c.id);
      var done = !!st.challengeRewards[c.id];
      var banner = document.querySelector('[data-challenge-lock="' + c.id + '"]');
      var body = document.querySelector('[data-challenge-body="' + c.id + '"]');
      var ta = document.querySelector('[data-challenge-input="' + c.id + '"]');
      var btn = document.querySelector('.btn-challenge-validate[data-challenge="' + c.id + '"]');
      var msg = document.querySelector('[data-challenge-msg="' + c.id + '"]');

      if (banner) {
        if (unlocked) {
          banner.classList.add('hidden');
          banner.textContent = '';
        } else {
          banner.classList.remove('hidden');
          banner.textContent =
            'Bloqueado: responde bien el cuestionario de «' +
            (TOPIC_TITLE_FOR_LOCK[c.requiresQuizTopic] || c.requiresQuizTopic) +
            '» en Teoría + RA.';
        }
      }

      if (body) {
        body.classList.toggle('challenge-panel-body--disabled', !unlocked);
      }
      if (ta) {
        ta.disabled = !unlocked || done;
      }
      if (btn) {
        btn.disabled = !unlocked || done;
      }
      if (done && msg) {
        msg.textContent = 'Reto superado. +' + c.points + ' pts · insignia guardada.';
        msg.className = 'challenge-validation-msg text-sm text-emerald-400 font-medium';
      } else if (!unlocked && msg) {
        msg.textContent = '';
        msg.className = 'challenge-validation-msg text-sm text-slate-500';
      }
    });
  }

  function awardChallenge(st, def, isFirstTime) {
    if (isFirstTime) {
      st.challengeRewards[def.id] = true;
      st.points += def.points;
      if (st.badges.indexOf(def.badgeId) === -1) {
        st.badges.push(def.badgeId);
      }
      saveState(st);
      updatePointsDisplay(st);
      renderChallengeBadgesCard(st);
      renderBadges(st);
      triggerConfetti();
    } else {
      if (typeof confetti === 'function') {
        confetti({ particleCount: 40, spread: 54, origin: { y: 0.72 }, zIndex: 9999 });
      }
    }
    renderChallengePanels(st);
  }

  function wireChallengeValidators() {
    document.querySelectorAll('.btn-challenge-validate').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var challengeId = btn.getAttribute('data-challenge');
        var def = getChallengeDef(challengeId);
        if (!def) return;
        if (!isChallengeUnlocked(state, challengeId)) {
          return;
        }
        var ta = document.querySelector('[data-challenge-input="' + challengeId + '"]');
        var msg = document.querySelector('[data-challenge-msg="' + challengeId + '"]');
        var code = ta ? ta.value : '';
        var result = def.validate(code);
        if (msg) {
          msg.textContent = result.message;
          msg.className =
            'challenge-validation-msg text-sm ' + (result.ok ? 'text-emerald-400 font-medium' : 'text-amber-400');
        }
        if (result.ok) {
          var first = !state.challengeRewards[def.id];
          awardChallenge(state, def, first);
        }
      });
    });
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

    PROGRESS_BADGE_DEFS.forEach(function (def) {
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

  function showTheoryTopic(topicId) {
    if (THEORY_IDS.indexOf(topicId) === -1) topicId = 'algoritmos';
    if (!isTopicUnlocked(state, topicId)) {
      topicId = getFirstUnlockedTopicId(state);
    }

    document.querySelectorAll('.topic-theory-panel').forEach(function (panel) {
      panel.classList.add('hidden');
    });
    var panel = document.getElementById('topic-panel-' + topicId);
    if (panel) panel.classList.remove('hidden');

    document.querySelectorAll('.topic-tab').forEach(function (tab) {
      var sel = tab.getAttribute('data-topic') === topicId;
      tab.setAttribute('aria-selected', sel ? 'true' : 'false');
    });

    state.lastTheoryTopic = topicId;
    markTopicVisited(state, topicId);
    saveState(state);
    renderTopicTabsLockState(state);
  }

  function getActiveModelViewer() {
    var panel = document.querySelector('.topic-theory-panel:not(.hidden)');
    if (!panel) return null;
    return panel.querySelector('model-viewer.ar-lab-mv');
  }

  function setMvStatusFor(topicId, text, kind) {
    var el = document.querySelector('[data-mv-status="' + topicId + '"]');
    if (!el) return;
    el.textContent = text;
    el.className =
      'mv-status-topic border-b border-lab-border px-4 py-2 text-center text-xs ' +
      (kind === 'error' ? 'bg-red-950/40 text-amber-300' : kind === 'ok' ? 'hidden' : 'bg-lab-surface/40 text-slate-400');
    if (kind === 'ok') el.setAttribute('aria-hidden', 'true');
    else el.removeAttribute('aria-hidden');
  }

  function wireAllModelViewers() {
    document.querySelectorAll('model-viewer.ar-lab-mv').forEach(function (mv) {
      var tid = mv.getAttribute('data-topic-mv');
      if (!tid) return;
      mv.addEventListener('load', function () {
        setMvStatusFor(tid, '', 'ok');
      });
      mv.addEventListener('error', function () {
        setMvStatusFor(
          tid,
          'Error al cargar el modelo. Ejecuta python scripts/generar_modelos_logica.py y sirve la carpeta con http.server.',
          'error'
        );
      });
    });
  }

  var state = loadState();
  clampLastTheoryTopic(state);
  syncChallengeBadgesFromRewards(state);
  saveState(state);
  updatePointsDisplay(state);
  renderBadges(state);
  renderChallengeBadgesCard(state);
  applyStudentNameToUI();
  renderTopicTabsLockState(state);
  renderAllTopicQuizzes(state);
  renderChallengePanels(state);
  wireChallengeValidators();

  if (allTopicsVisited(state)) {
    maybeAwardCurriculumBadge(state);
  }
  if (allQuizzesPassed(state)) {
    maybeAwardQuizMasterBadge(state);
  }

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

      if (section === 'theory') {
        if (!state.theoryVisited) {
          state.theoryVisited = true;
          if (state.badges.indexOf('explorer') === -1) {
            state.badges.push('explorer');
          }
          saveState(state);
          renderBadges(state);
        }
        showTheoryTopic(state.lastTheoryTopic || 'algoritmos');
        renderAllTopicQuizzes(state);
      }
      if (section === 'practice') {
        renderChallengePanels(state);
      }
    });
  });

  document.querySelectorAll('.topic-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var topic = tab.getAttribute('data-topic');
      if (!topic) return;
      if (!isTopicUnlocked(state, topic)) {
        flashTopicLockHint(
          'Este tema sigue bloqueado. Responde bien las dos preguntas del tema anterior para desbloquearlo.'
        );
        return;
      }
      showTheoryTopic(topic);
    });
  });

  if (customElements.whenDefined) {
    customElements.whenDefined('model-viewer').then(wireAllModelViewers).catch(wireAllModelViewers);
  } else {
    wireAllModelViewers();
  }

  var btnAr = document.getElementById('btn-ar-scan');
  if (btnAr) {
    btnAr.addEventListener('click', function () {
      var mv = getActiveModelViewer();
      if (!mv) {
        alert('No hay modelo activo. Elige un tema en las pestañas.');
        return;
      }
      if (mv.canActivateAR === false) {
        alert(
          'La RA no está disponible o el modelo aún no cargó.\n\nPrueba en Chrome (Android) o Safari (iPhone/iPad) cuando veas el 3D.'
        );
        return;
      }
      var arFn = mv.activateAR;
      if (typeof arFn !== 'function') {
        alert('RA no disponible en este navegador.');
        return;
      }
      try {
        var out = arFn.call(mv);
        if (out && typeof out.then === 'function') {
          out.catch(function () {
            alert(
              'No se pudo abrir la RA. Usa móvil compatible y espera a que el modelo termine de cargar.'
            );
          });
        }
      } catch (err) {
        alert('No se pudo iniciar la RA en este dispositivo.');
      }
    });
  }

  showSection('dashboard');
})();
