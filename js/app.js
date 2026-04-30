/**
 * Interactive Code Lab — gamificación, temas teóricos + RA, localStorage
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'interactiveCodeLab_v1';
  /**
   * Orden estricto de lo más básico a lo más avanzado.
   * Cada tema se desbloquea solo tras el cuestionario del tema anterior (1.1 → 1.2 → … → 3.3).
   */
  var THEORY_IDS = [
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

  /** Retos agrupados por nivel; el Nivel n exige mayoría de retos completos del Nivel n−1. */
  var CHALLENGE_IDS_BY_LEVEL = {
    1: ['conditional_age', 'variables_total', 'io_rectangle'],
    2: ['operators_parity', 'grades_letter', 'string_length', 'loop_sum'],
    3: ['array_average', 'function_double', 'trace_while'],
  };

  /** Mínimo de retos del nivel anterior que deben estar superados (mayoría estricta). */
  function majorityThreshold(total) {
    return Math.floor(total / 2) + 1;
  }

  function countChallengesDoneInList(st, ids) {
    var n = 0;
    for (var i = 0; i < ids.length; i++) {
      if (st.challengeRewards[ids[i]]) n++;
    }
    return n;
  }

  /** ¿Se cumple el requisito de retos del nivel anterior para poder jugar retos de `challengeLevel`? */
  function isPreviousLevelChallengesSatisfied(st, challengeLevel) {
    if (challengeLevel <= 1) return true;
    var prevLevel = challengeLevel - 1;
    var prevIds = CHALLENGE_IDS_BY_LEVEL[prevLevel];
    if (!prevIds || !prevIds.length) return true;
    var need = majorityThreshold(prevIds.length);
    return countChallengesDoneInList(st, prevIds) >= need;
  }

  function getPreviousLevelChallengeProgress(st, challengeLevel) {
    if (challengeLevel <= 1) return null;
    var prevLevel = challengeLevel - 1;
    var prevIds = CHALLENGE_IDS_BY_LEVEL[prevLevel];
    if (!prevIds || !prevIds.length) return null;
    return {
      level: prevLevel,
      done: countChallengesDoneInList(st, prevIds),
      need: majorityThreshold(prevIds.length),
      total: prevIds.length,
    };
  }

  /** Insignias de progreso general (no son retos de código). */
  var PROGRESS_BADGE_DEFS = [
    { id: 'explorer', label: 'Explorador', desc: 'Abriste el módulo Teoría + RA', icon: '🔭' },
    { id: 'curriculum_ra', label: 'Recorrido RA', desc: 'Completaste los 10 temas con modelo 3D/RA', icon: '📚' },
    { id: 'quiz_master', label: 'Comprensión', desc: 'Acertaste los cuestionarios de los 10 temas', icon: '📝' },
  ];

  var POINTS_QUIZ_TOPIC = 20;

  function defaultChallengeRewards() {
    return {
      conditional_age: false,
      variables_total: false,
      io_rectangle: false,
      operators_parity: false,
      grades_letter: false,
      loop_sum: false,
      string_length: false,
      array_average: false,
      function_double: false,
      trace_while: false,
    };
  }

  /** Sincroniza retos completados si ya existía la insignia en datos antiguos. */
  var CHALLENGE_BADGE_TO_REWARD_KEY = {
    conditional_master: 'conditional_age',
    reto_variables: 'variables_total',
    reto_entrada_salida: 'io_rectangle',
    reto_operadores: 'operators_parity',
    reto_decisiones: 'grades_letter',
    reto_bucle: 'loop_sum',
    reto_cadenas: 'string_length',
    reto_arreglos: 'array_average',
    reto_funciones: 'function_double',
    reto_trazado: 'trace_while',
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
      {
        q: 'Mini‑código: ¿cuál línea abre bien un `if` que comprueba si `edad` es mayor o igual a 18?',
        correct: 'b',
        opts: [
          { k: 'a', t: 'if edad >= 18 {' },
          { k: 'b', t: 'if (edad >= 18) {' },
          { k: 'c', t: 'if [edad >= 18] {' },
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
      {
        q: 'Mini‑código: ¿cuál declara la variable `nombre` y guarda el texto "Ana"?',
        correct: 'b',
        opts: [
          { k: 'a', t: 'nombre = "Ana";' },
          { k: 'b', t: 'let nombre = "Ana";' },
          { k: 'c', t: 'let nombre == "Ana";' },
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
      {
        q: 'Mini‑código: ¿qué expresión calcula el resto de dividir `n` entre `2` (par/impar)?',
        correct: 'b',
        opts: [
          { k: 'a', t: 'n / 2' },
          { k: 'b', t: 'n % 2' },
          { k: 'c', t: 'n ** 2' },
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
      {
        q: 'Mini‑código: ¿cuál es una cabecera válida de `while` en JavaScript?',
        correct: 'a',
        opts: [
          { k: 'a', t: 'while (i < 10) {' },
          { k: 'b', t: 'while i < 10 {' },
          { k: 'c', t: 'while [i < 10] {' },
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
      {
        q: 'Mini‑código: ¿cuál crea un arreglo con los números 8, 9 y 10?',
        correct: 'b',
        opts: [
          { k: 'a', t: 'let notas = (8, 9, 10);' },
          { k: 'b', t: 'let notas = [8, 9, 10];' },
          { k: 'c', t: 'let notas = {8, 9, 10};' },
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
      {
        q: 'Mini‑código: ¿cuál define una función `doble` con parámetro `x` en JavaScript?',
        correct: 'a',
        opts: [
          { k: 'a', t: 'function doble(x) { }' },
          { k: 'b', t: 'def doble(x):' },
          { k: 'c', t: 'fun doble(x) { }' },
        ],
      },
    ],
    entrada_salida: [
      {
        q: 'En lógica de programación, la “salida” de un algoritmo suele referirse a…',
        correct: 'b',
        opts: [
          { k: 'a', t: 'Solo a cerrar el programa.' },
          { k: 'b', t: 'Los resultados que se muestran o entregan después de procesar.' },
          { k: 'c', t: 'Al archivo donde guardas el código fuente.' },
        ],
      },
      {
        q: 'En el esquema entrada → proceso → salida, la **entrada** suele ser…',
        correct: 'b',
        opts: [
          { k: 'a', t: 'Solo el mensaje final que ves en pantalla.' },
          { k: 'b', t: 'Los datos o valores que el programa recibe para trabajar.' },
          { k: 'c', t: 'Únicamente el código fuente guardado en el archivo.' },
        ],
      },
      {
        q: 'Mini‑código: en el navegador, ¿qué instrucción muestra `area` en la consola (como “imprimir”)?',
        correct: 'b',
        opts: [
          { k: 'a', t: 'print(area);' },
          { k: 'b', t: 'console.log(area);' },
          { k: 'c', t: 'echo area;' },
        ],
      },
    ],
    decisiones_multiples: [
      {
        q: 'En JavaScript, si la primera condición de un `if` no se cumple y quieres probar otra distinta, suele usarse…',
        correct: 'b',
        opts: [
          { k: 'a', t: 'Solo otro `if` sin relación (nunca encadenado).' },
          { k: 'b', t: '`else if` (otra condición en cadena).' },
          { k: 'c', t: 'El operador `++` obligatorio.' },
        ],
      },
      {
        q: 'Un `if` dentro de otro `if` se llama condicional…',
        correct: 'a',
        opts: [
          { k: 'a', t: 'Anidado.' },
          { k: 'b', t: 'Infinito.' },
          { k: 'c', t: 'Duplicado ilegal.' },
        ],
      },
      {
        q: 'Mini‑código: tras un `if` que no se cumple, ¿qué encadena otra condición (antes del `else` final)?',
        correct: 'a',
        opts: [
          { k: 'a', t: 'else if (nota >= 70) { }' },
          { k: 'b', t: 'elseif (nota >= 70) { }' },
          { k: 'c', t: 'else then (nota >= 70) { }' },
        ],
      },
    ],
    cadenas: [
      {
        q: 'En JavaScript, ¿qué devuelve `"Hola".length`?',
        correct: 'b',
        opts: [
          { k: 'a', t: '0' },
          { k: 'b', t: '4 (cuatro caracteres).' },
          { k: 'c', t: 'El texto "length".' },
        ],
      },
      {
        q: 'Concatenar dos cadenas en JavaScript con `+` significa…',
        correct: 'b',
        opts: [
          { k: 'a', t: 'Sumar sus longitudes numéricamente siempre.' },
          { k: 'b', t: 'Unir los textos uno detrás del otro.' },
          { k: 'c', t: 'Comparar si son iguales.' },
        ],
      },
      {
        q: 'Mini‑código: si `s` es una cadena, ¿cómo se obtiene su longitud en JavaScript?',
        correct: 'b',
        opts: [
          { k: 'a', t: 'length(s)' },
          { k: 'b', t: 's.length' },
          { k: 'c', t: 's.len' },
        ],
      },
    ],
    pruebas_trazado: [
      {
        q: 'Un comentario con `//` en JavaScript…',
        correct: 'b',
        opts: [
          { k: 'a', t: 'Se ejecuta como instrucción normal.' },
          { k: 'b', t: 'Lo ignora el intérprete; sirve para humanos.' },
          { k: 'c', t: 'Solo puede ir al final del archivo.' },
        ],
      },
      {
        q: 'Antes de ejecutar código nuevo, una buena práctica es…',
        correct: 'b',
        opts: [
          { k: 'a', t: 'No leer el código y confiar ciegamente.' },
          { k: 'b', t: 'Imaginar o anotar qué valores saldrían en cada paso (traza mental).' },
          { k: 'c', t: 'Eliminar todas las llaves { }.' },
        ],
      },
      {
        q: 'Mini‑código: ¿cuál línea es un comentario de una sola línea en JavaScript (no se ejecuta)?',
        correct: 'b',
        opts: [
          { k: 'a', t: '# traza: i = 0' },
          { k: 'b', t: '// traza: i = 0' },
          { k: 'c', t: '** traza: i = 0' },
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
    if (o.bucles && !o.cadenas) {
      o.cadenas = true;
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

  /**
   * El temario pasó a enseñar cadenas (2.3) antes que bucles (2.4).
   * Si un guardado antiguo tiene bucles aprobado pero no cadenas, se asume cadenas vista para no cerrar temas ya alcanzados.
   */
  function migrateQuizRewardsWithOrderFix(data) {
    var o = migrateQuizRewards(data);
    if (o.bucles && !o.cadenas) {
      o.cadenas = true;
    }
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
        quizRewards: migrateQuizRewardsWithOrderFix(data),
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
        tab.setAttribute(
          'title',
          'Completa el cuestionario del tema anterior (todas las preguntas, incluidas las de código) para desbloquear este tema.'
        );
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
      title.textContent = 'Comprueba lo aprendido (concepto + mini‑código, opción múltiple)';
      box.appendChild(title);

      if (currentState.quizRewards[topicId]) {
        var done = document.createElement('div');
        done.className = 'quiz-done-badge';
        done.textContent =
          'Completado: acertaste todas las preguntas del tema (incluidas las de código). +' +
          POINTS_QUIZ_TOPIC +
          ' pts (solo la primera vez).';
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
    renderChallengeBadgesCard(currentState);
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
      return {
        ok: false,
        message:
          'Aún va un poco corto. Intenta escribir algo como: “si la edad es 18 o más, muestra un mensaje de que sí puede entrar; si no, otro mensaje de que no”. Puedes usar if { } y else { } en JavaScript.',
      };
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
      return {
        ok: false,
        message:
          'Aquí el programa tiene que decidir entre dos situaciones. Busca en la teoría el ejemplo con if ( … ) { … } else { … } o, en español, “si … entonces … si no …”. Copia la idea y cámbiala a edad y 18.',
      };
    }

    var hasAgeCheck =
      (n.includes('edad') || n.includes('age')) &&
      (n.includes('18') || n.includes('>= 18') || n.includes('>=18') || n.includes('> 17') || n.includes('>17'));

    if (!hasAgeCheck) {
      return {
        ok: false,
        message:
          'Falta la parte de la edad y el número 18. El enunciado habla de “18 años o más”: en código suele verse como edad >= 18 (o age >= 18). ¿Ya pusiste el nombre de la edad y el 18 en la misma pregunta?',
      };
    }

    var hasElse =
      /\belse\b/.test(n) ||
      /\bsino\b/.test(n) ||
      /\bsi no\b/.test(n) ||
      /}\s*else\s*{/.test(code.replace(/\s+/g, ' '));

    if (!hasElse) {
      return {
        ok: false,
        message:
          'Ya tienes el caso de “sí cumple”; falta el de “no cumple”. Añade la segunda parte con else (en JavaScript) o si no (en pseudocódigo), con el mensaje cuando la persona es menor de 18.',
      };
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
        message:
          'La lógica va bien encaminada; ahora deja escritos con palabras claras los dos resultados: en un camino algo como “permitido” o “acceso permitido”, y en el otro “denegado”, “no permitido” o “rechazado”. Así se ve que entendiste los dos casos.',
      };
    }

    return {
      ok: true,
      message: '¡Muy bien! Separaste bien los dos casos (mayor o menor de edad) y se entiende qué pasa en cada uno.',
    };
  }

  function validateVariablesTotal(code) {
    if (!code || code.trim().length < 12) {
      return {
        ok: false,
        message:
          'Escribe unas líneas más. Recuerda la “compra”: algo como precio = 10, cantidad = 2, y luego el total de multiplicar ambos.',
      };
    }
    var n = normalizeForCheck(code);
    var hasPrecio = n.includes('precio') || n.includes('price');
    var hasCantidad = n.includes('cantidad') || n.includes('quantity') || n.includes('qty');
    if (!hasPrecio || !hasCantidad) {
      return {
        ok: false,
        message:
          'Necesitamos dos cajitas de datos: una para el precio y otra para la cantidad (pueden llamarse precio y cantidad, o price y quantity). Con let precio = 10; vas por buen camino.',
      };
    }
    if (!n.includes('10') || !n.includes('2')) {
      return {
        ok: false,
        message:
          'El enunciado pide precio 10 y cantidad 2. Revisa que esos números aparezcan en tu código como en el ejemplo de la teoría.',
      };
    }
    if (!n.includes('total')) {
      return {
        ok: false,
        message:
          'Falta guardar el resultado con un nombre como total. Idea: primero precio y cantidad, luego algo como let total = precio * cantidad; (el asterisco * es “por” en programación).',
      };
    }
    if (!n.includes('*') && !n.includes('20')) {
      return {
        ok: false,
        message:
          'El total sale de multiplicar precio por cantidad. En JavaScript se escribe con * (no con ×). 10 por 2 = 20.',
      };
    }
    if (!n.includes('20')) {
      return {
        ok: false,
        message:
          'Casi: deja escrito en algún sitio el 20 (el resultado final) o un console.log(total) para que se vea que te da 20.',
      };
    }
    return {
      ok: true,
      message: '¡Genial! Usaste bien las variables y la multiplicación; el total 10 × 2 quedó claro.',
    };
  }

  function validateOperatorsParity(code) {
    if (!code || code.trim().length < 15) {
      return {
        ok: false,
        message:
          'Hace falta un poco más de código. Piensa: el número 8 es par, el 7 es impar; en la teoría explican el símbolo % (sirve para ver el “sobrante” al dividir entre 2).',
      };
    }
    var n = normalizeForCheck(code);
    if (!n.includes('%') || !n.includes('2')) {
      return {
        ok: false,
        message:
          'Prueba usar % junto con el número 2. Idea sencilla: si al dividir un número entre 2 el sobrante es 0, suele ser par; si no, impar. En JavaScript eso se escribe algo como n % 2.',
      };
    }
    var hasBranch = /\bif\b|\bsi\b/.test(n) || n.includes('entonces');
    if (!hasBranch) {
      return {
        ok: false,
        message:
          'El programa tiene que elegir según el número. Usa algo como if ( … ) { … } para el 8 y otra rama para el 7, o un if que distinga par e impar.',
      };
    }
    if (!n.includes('8')) {
      return {
        ok: false,
        message:
          'No olvides el 8: el reto pide mostrar o decir que es par. ¿Dónde aparece el 8 en tu respuesta?',
      };
    }
    if (!n.includes('7')) {
      return {
        ok: false,
        message:
          'Falta el 7: debe quedar claro que es impar. Añade ese caso con un mensaje o comentario.',
      };
    }
    var hasPar = n.includes('par') || n.includes('even');
    var hasImpar = n.includes('impar') || n.includes('odd');
    if (!hasPar || !hasImpar) {
      return {
        ok: false,
        message:
          'Usa las palabras par e impar (o “even” / “odd”) en un mensaje o comentario, para que quede claro qué entendiste de cada número.',
      };
    }
    return {
      ok: true,
      message: '¡Bien hecho! Combinaste la idea de mirar lo que sobra al dividir entre 2 con los dos números del enunciado.',
    };
  }

  function validateLoopSum(code) {
    if (!code || code.trim().length < 15) {
      return {
        ok: false,
        message:
          'Necesitas un poco más de líneas. La idea es repetir sumando: 1, luego 1+2, luego hasta llegar al 10, sin escribir diez sumas a mano. En la teoría verás for o while.',
      };
    }
    var n = normalizeForCheck(code);
    var hasLoop = /\bfor\b|\bwhile\b|\bmientras\b/.test(n) || /\bpara\b/.test(n);
    if (!hasLoop) {
      return {
        ok: false,
        message:
          'Aquí hace falta algo que repita pasos. Busca en el tema de bucles las palabras for o while (o “mientras” en pseudocódigo): son formas de decir “sigue haciendo esto mientras…” hasta completar del 1 al 10.',
      };
    }
    if (!n.includes('55')) {
      return {
        ok: false,
        message:
          'La suma 1 + 2 + … + 10 da 55. Si tu código no muestra 55, revisa el límite del contador (¿llega hasta 10?) y que vayas sumando de uno en uno en una variable llamada por ejemplo suma.',
      };
    }
    return {
      ok: true,
      message: '¡Perfecto! Usaste repetición y el resultado 55 encaja con sumar del 1 al 10.',
    };
  }

  function validateArrayAverage(code) {
    if (!code || code.trim().length < 15) {
      return {
        ok: false,
        message:
          'Escribe un poco más. Necesitas una lista con tres notas (8, 9 y 10) y luego el “valor del medio” que sale de sumar las tres y dividir entre 3.',
      };
    }
    var n = normalizeForCheck(code);
    if (!n.includes('8') || !n.includes('9') || !n.includes('10')) {
      return {
        ok: false,
        message:
          'La lista debe incluir los tres números 8, 9 y 10 (son las tres notas del ejemplo).',
      };
    }
    if (!n.includes('[') && !n.includes('arreglo')) {
      return {
        ok: false,
        message:
          'En JavaScript la lista suele ir entre corchetes, por ejemplo [8, 9, 10]. Si escribes en español, puedes decir “arreglo” o “lista”, pero en código ayuda usar [ ].',
      };
    }
    if (!n.includes('/') && !n.includes('promedio') && !n.includes('average')) {
      return {
        ok: false,
        message:
          'El promedio aquí es: sumar 8 + 9 + 10 y partir el resultado en tres partes iguales (dividir entre 3). En código suele verse con el símbolo / o la palabra promedio.',
      };
    }
    if (!n.includes('9')) {
      return {
        ok: false,
        message:
          'El resultado correcto del promedio es 9. Déjalo escrito en un console.log, comentario o variable para que se vea.',
      };
    }
    return {
      ok: true,
      message: '¡Muy bien! Agrupaste las tres notas y el promedio 9 quedó claro.',
    };
  }

  function validateFunctionDouble(code) {
    if (!code || code.trim().length < 15) {
      return {
        ok: false,
        message:
          'Hace falta más código. La idea es un trozo de código reutilizable que reciba un número y devuelva el doble (el número multiplicado por 2). En la teoría verás function … { }.',
      };
    }
    var n = normalizeForCheck(code);
    var hasFn = /\bfunction\b/.test(n) || n.includes('=>');
    if (!hasFn) {
      return {
        ok: false,
        message:
          'Crea una función: en JavaScript suele empezar con la palabra function, el nombre (por ejemplo doble) y paréntesis con el dato que entra. Otra forma es la “flecha” =>; mira el ejemplo del tema.',
      };
    }
    if (!n.includes('return')) {
      return {
        ok: false,
        message:
          'Dentro de la función hace falta la palabra return: es la línea que devuelve el resultado hacia afuera (por ejemplo return número * 2;). Sin return, el resultado no “sale”.',
      };
    }
    if (!n.includes('*') && !n.includes('doble') && !n.includes('double')) {
      return {
        ok: false,
        message:
          'El resultado debe ser el doble del valor que entra: piensa en multiplicar por 2 (en teclado suele ser * 2).',
      };
    }
    if (!n.includes('3') || !n.includes('6')) {
      return {
        ok: false,
        message:
          'Añade una prueba sencilla en comentario o código: si entra 3, debe salir 6. Así se ve que entendiste la idea del doble.',
      };
    }
    return {
      ok: true,
      message: '¡Excelente! Tu función devuelve el doble y la prueba 3 → 6 encaja con el reto.',
    };
  }

  function validateIoRectangle(code) {
    if (!code || code.trim().length < 12) {
      return {
        ok: false,
        message: 'Escribe unas líneas: dos medidas, el área y un console.log para ver el 20.',
      };
    }
    var n = normalizeForCheck(code);
    var hasBase = n.includes('base') || n.includes('ancho') || n.includes('width');
    var hasAlt = n.includes('altura') || n.includes('alto') || n.includes('height');
    if (!hasBase || !hasAlt) {
      return {
        ok: false,
        message: 'Declara dos variables con nombres claros, por ejemplo base (o ancho) y altura (o alto).',
      };
    }
    if (!n.includes('4') || !n.includes('5') || !n.includes('20')) {
      return {
        ok: false,
        message: 'Usa base 4 y altura 5; el área del rectángulo debe quedar como 20 en el resultado o en el mensaje.',
      };
    }
    if (!n.includes('*') && !n.includes('area')) {
      return {
        ok: false,
        message: 'El área es base por altura: en código suele ser base * altura (asterisco).',
      };
    }
    if (!n.includes('console.log')) {
      return {
        ok: false,
        message: 'Muestra el resultado con console.log para practicar la “salida” en la consola.',
      };
    }
    return {
      ok: true,
      message: '¡Bien! Conectaste datos de entrada, cálculo y salida como en un algoritmo pequeño.',
    };
  }

  function validateGradesLetter(code) {
    if (!code || code.trim().length < 20) {
      return {
        ok: false,
        message: 'Necesitas varias ramas: piensa en nota alta, nota media y el resto. Usa if y else if.',
      };
    }
    var n = normalizeForCheck(code);
    if (!n.includes('nota')) {
      return {
        ok: false,
        message: 'Usa una variable llamada por ejemplo nota para guardar la calificación numérica.',
      };
    }
    if (!n.includes('85')) {
      return {
        ok: false,
        message: 'El reto pide probar con nota 85: debe aparecer ese número en tu código (asignación o comentario de prueba).',
      };
    }
    var hasChain = /\belse\s+if\b/.test(code) || (n.includes('else') && n.includes('if'));
    if (!hasChain || !n.includes('90') || !n.includes('70')) {
      return {
        ok: false,
        message: 'Encadena condiciones: típicamente nota >= 90 para una letra, else if nota >= 70 para otra, y else para la última. Revisa los umbrales 90 y 70.',
      };
    }
    var hasB =
      n.includes('letra b') ||
      n.includes('letra: b') ||
      n.includes('"b"') ||
      n.includes("'b'") ||
      (n.includes('console.log') && n.includes('b') && n.includes('85'));
    if (!hasB) {
      return {
        ok: false,
        message: 'Deja claro en el resultado que la nota 85 corresponde a la letra B (por ejemplo un mensaje con “letra B” o la b entre comillas).',
      };
    }
    return {
      ok: true,
      message: '¡Muy bien! Ordenaste varias condiciones y la nota 85 cae en la categoría B.',
    };
  }

  function validateStringLength(code) {
    if (!code || code.trim().length < 15) {
      return {
        ok: false,
        message: 'Declara un texto, usa .length y muestra el número en consola.',
      };
    }
    var n = normalizeForCheck(code);
    if (!n.includes('hola') || !n.includes('.length')) {
      return {
        ok: false,
        message: 'Crea una cadena con la palabra Hola entre comillas y léela con .length (cuántos caracteres tiene).',
      };
    }
    if (!n.includes('console.log')) {
      return {
        ok: false,
        message: 'Añade console.log(...) para ver en la consola la longitud (debe ser 4 para "Hola").',
      };
    }
    if (!n.includes('4')) {
      return {
        ok: false,
        message: 'La palabra "Hola" tiene 4 letras: deja el 4 visible en un comentario o en el mensaje.',
      };
    }
    return {
      ok: true,
      message: '¡Genial! Ya relacionas texto, longitud y salida por consola.',
    };
  }

  function validateTraceWhile(code) {
    if (!code || code.trim().length < 25) {
      return {
        ok: false,
        message: 'Escribe un while que cuente con i desde 0, imprima i en cada vuelta y sume 1 a i hasta que i sea 2.',
      };
    }
    var n = normalizeForCheck(code);
    if (!/\bwhile\s*\(/.test(code) && !n.includes('mientras')) {
      return {
        ok: false,
        message: 'Usa un bucle while (o mientras en pseudocódigo) como en el tema de pruebas y trazado.',
      };
    }
    if (!n.includes('i') || !n.includes('0') || !n.includes('2')) {
      return {
        ok: false,
        message: 'El patrón típico empieza con i en 0 y repite mientras i sea menor que 2 (así salen dos números en consola).',
      };
    }
    if (!n.includes('console.log')) {
      return {
        ok: false,
        message: 'Dentro del bucle, muestra el valor de i con console.log para ver la traza 0 y 1.',
      };
    }
    if (!n.includes('++') && !n.includes('i = i + 1') && !n.includes('i=i+1')) {
      return {
        ok: false,
        message: 'En cada vuelta debes acercar i al final: por ejemplo i++ o i = i + 1, si no el bucle no termina bien.',
      };
    }
    return {
      ok: true,
      message: '¡Perfecto! Ese while reproduce la traza 0 luego 1, ideal para practicar lectura de código.',
    };
  }

  var CHALLENGE_DEFS = [
    {
      id: 'conditional_age',
      badgeId: 'conditional_master',
      label: 'Condicionales',
      desc: 'Reto: acceso por edad',
      icon: '🔷',
      requiresQuizTopic: 'algoritmos',
      challengeLevel: 1,
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
      challengeLevel: 1,
      points: 85,
      validate: validateVariablesTotal,
    },
    {
      id: 'io_rectangle',
      badgeId: 'reto_entrada_salida',
      label: 'Entrada / salida',
      desc: 'Reto: área del rectángulo',
      icon: '📐',
      requiresQuizTopic: 'entrada_salida',
      challengeLevel: 1,
      points: 85,
      validate: validateIoRectangle,
    },
    {
      id: 'operators_parity',
      badgeId: 'reto_operadores',
      label: 'Operadores',
      desc: 'Reto: par/impar con %',
      icon: '🧮',
      requiresQuizTopic: 'operadores',
      challengeLevel: 2,
      points: 85,
      validate: validateOperatorsParity,
    },
    {
      id: 'grades_letter',
      badgeId: 'reto_decisiones',
      label: 'Decisiones múltiples',
      desc: 'Reto: nota a letra',
      icon: '🔀',
      requiresQuizTopic: 'decisiones_multiples',
      challengeLevel: 2,
      points: 90,
      validate: validateGradesLetter,
    },
    {
      id: 'string_length',
      badgeId: 'reto_cadenas',
      label: 'Cadenas',
      desc: 'Reto: longitud de texto',
      icon: '📝',
      requiresQuizTopic: 'cadenas',
      challengeLevel: 2,
      points: 80,
      validate: validateStringLength,
    },
    {
      id: 'loop_sum',
      badgeId: 'reto_bucle',
      label: 'Bucles',
      desc: 'Reto: suma 1…10',
      icon: '🔄',
      requiresQuizTopic: 'bucles',
      challengeLevel: 2,
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
      challengeLevel: 3,
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
      challengeLevel: 3,
      points: 95,
      validate: validateFunctionDouble,
    },
    {
      id: 'trace_while',
      badgeId: 'reto_trazado',
      label: 'Prueba y trazado',
      desc: 'Reto: while y traza',
      icon: '🔍',
      requiresQuizTopic: 'pruebas_trazado',
      challengeLevel: 3,
      points: 85,
      validate: validateTraceWhile,
    },
  ];

  /**
   * Guías «No recuerdo»: cada paso es texto o { text, code }.
   * Los bloques code muestran la forma típica en JavaScript (tú completas mensajes o detalles).
   */
  var CHALLENGE_STEP_GUIDES = {
    conditional_age: [
      {
        text: 'Hay dos caminos: 18 años o más → un mensaje; menor de 18 → otro. Tu código debe tener las dos ramas.',
      },
      {
        text: 'Primero guarda una edad de prueba en una variable (cambia el número para imaginar cada caso).',
        code: 'let edad = 20;  // prueba también con 17',
      },
      {
        text: 'La comparación “mayor o igual a 18” va entre paréntesis después de if. Las llaves { } agrupan lo que pasa en cada caso.',
        code:
          'if (edad >= 18) {\n  console.log("Acceso permitido");\n} else {\n  console.log("Acceso denegado");\n}',
      },
      {
        text: 'Puedes cambiar los textos, pero conviene que en un lado aparezca algo como “permitido” y en el otro “denegado” (o palabras muy parecidas), como pide el reto.',
      },
    ],
    variables_total: [
      {
        text: 'Declara dos variables con los valores del enunciado: precio 10 y cantidad 2. Cada una en su línea, terminando en ;',
        code: 'let precio = 10;\nlet cantidad = 2;',
      },
      {
        text: 'El total es “precio por cantidad”. En código, “por” es el asterisco * (no la x). Guarda el resultado en una variable total.',
        code: 'let total = precio * cantidad;',
      },
      {
        text: 'Muestra el resultado (20) para comprobar. El validador busca el número 20 en tu respuesta.',
        code: 'console.log(total);  // debería mostrar 20',
      },
    ],
    operators_parity: [
      {
        text: 'El símbolo % con 2 sirve para ver si “sobra” algo al dividir entre 2. Muchas veces, si el resto es 0, el número es par.',
        code: '// ejemplo mental: 8 % 2  →  0  (par)\n//               7 % 2  →  1  (impar)',
      },
      {
        text: 'Estructura típica: una decisión if y dentro un console.log que diga si es par o impar. Puedes usar dos bloques (uno para 8 y otro para 7) o combinar lógica.',
        code:
          'let n = 8;\nif (n % 2 === 0) {\n  console.log("8 es par");\n}\n\nn = 7;\nif (n % 2 !== 0) {\n  console.log("7 es impar");\n}',
      },
      {
        text: 'Las palabras par e impar deben aparecer en los mensajes (o equivalentes claros). Ajusta el código a tu estilo; la idea es la misma.',
      },
    ],
    loop_sum: [
      {
        text: 'Necesitas un acumulador que empiece en 0 y un bucle que vaya del 1 al 10 sumando en cada vuelta.',
        code: 'let suma = 0;',
      },
      {
        text: 'Un for suele tener tres partes: valor inicial, condición “mientras i sea menor o igual que 10”, y al final i++ (subir de uno en uno).',
        code:
          'for (let i = 1; i <= 10; i++) {\n  suma = suma + i;  // o: suma += i;\n}',
      },
      {
        text: 'Al salir del bucle, suma debe valer 55. Compruébalo en consola.',
        code: 'console.log(suma);  // esperado: 55',
      },
    ],
    array_average: [
      {
        text: 'Las tres notas van en una lista entre corchetes, separadas por comas.',
        code: 'let notas = [8, 9, 10];',
      },
      {
        text: 'Suma los tres elementos (puedes usar notas[0], notas[1], notas[2] o un bucle corto). Luego divide entre 3 para el promedio.',
        code:
          'let suma = notas[0] + notas[1] + notas[2];\nlet promedio = suma / 3;\nconsole.log(promedio);  // esperado: 9',
      },
      {
        text: 'El validador busca los números 8, 9 y 10, el uso de lista [ ] y que quede visible el promedio 9.',
      },
    ],
    function_double: [
      {
        text: 'Una función tiene nombre, paréntesis con el dato que entra, y llaves con el cuerpo. return devuelve el valor hacia afuera.',
        code: 'function doble(x) {\n  return x * 2;\n}',
      },
      {
        text: 'Prueba la función con el número 3; el doble debe ser 6. Así el validador ve que entendiste la idea.',
        code: 'console.log(doble(3));  // debe mostrar 6\n// o un comentario: // doble(3) → 6',
      },
      {
        text: 'Puedes cambiar el nombre de la función o del parámetro, pero mantén return y la multiplicación por 2.',
      },
    ],
    io_rectangle: [
      {
        text: 'El reto pide “datos de entrada” (base y altura), un cálculo en el medio y una salida visible. Piensa en papel: 4 × 5 = 20.',
      },
      {
        text: 'Declara dos variables con los números del enunciado y una tercera (o directamente el producto) para el área.',
        code: 'let base = 4;\nlet altura = 5;\nlet area = base * altura;',
      },
      {
        text: 'Muestra el 20 con console.log. El validador busca 4, 5, 20, el asterisco de multiplicar y la palabra base o altura (o sinónimos como ancho/alto).',
        code: 'console.log(area);  // 20',
      },
    ],
    grades_letter: [
      {
        text: 'Aquí no basta un if/else simple: hay tres “cajones” (A, B, C). En JavaScript encadena con else if y deja un else final para el resto.',
      },
      {
        text: 'Ejemplo de esqueleto: primero la nota más alta (≥90 → A), luego un tramo medio (≥70 → B), y todo lo demás → C. Ajusta los textos a tu estilo.',
        code:
          'let nota = 85;\nif (nota >= 90) {\n  console.log("Letra A");\n} else if (nota >= 70) {\n  console.log("Letra B");\n} else {\n  console.log("Letra C");\n}',
      },
      {
        text: 'Comprueba mentalmente: 85 no llega a 90 pero sí a 70, así que debe caer en la rama B. Tu código debe mostrar algo con la letra B para ese caso.',
      },
    ],
    string_length: [
      {
        text: 'Las cadenas van entre comillas. La propiedad .length cuenta caracteres (incluye letras y espacios si los hubiera).',
        code: 'let saludo = "Hola";',
      },
      {
        text: 'Hola tiene cuatro letras H-o-l-a, así que la longitud es 4. Puedes guardarla en una variable o ponerla directo en console.log.',
        code: 'console.log(saludo.length);  // 4',
      },
      {
        text: 'El validador quiere ver la palabra hola en minúsculas o mayúsculas en el código, .length y el número 4 en algún sitio (mensaje o comentario).',
      },
    ],
    trace_while: [
      {
        text: 'Imagina una tabla con columnas: vuelta, valor de i, qué imprime. Eso es la traza. El código debe usar while, no solo for.',
      },
      {
        text: 'Empieza con i = 0. La condición suele ser “mientras i sea menor que 2”. Dentro: console.log(i) y luego sube i con i++ o i = i + 1.',
        code: 'let i = 0;\nwhile (i < 2) {\n  console.log(i);\n  i++;\n}',
      },
      {
        text: 'Al ejecutar, la consola debe mostrar primero 0 y luego 1. Si te sobra otra línea, revisa la condición o el valor inicial.',
      },
    ],
  };

  var TOPIC_TITLE_FOR_LOCK = {
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

  function getChallengeDef(challengeId) {
    for (var i = 0; i < CHALLENGE_DEFS.length; i++) {
      if (CHALLENGE_DEFS[i].id === challengeId) return CHALLENGE_DEFS[i];
    }
    return null;
  }

  function isChallengeUnlocked(st, challengeId) {
    var def = getChallengeDef(challengeId);
    if (!def) return false;
    if (!st.quizRewards[def.requiresQuizTopic]) return false;
    var lvl = def.challengeLevel != null ? def.challengeLevel : 1;
    return isPreviousLevelChallengesSatisfied(st, lvl);
  }

  /** Mensaje de bloqueo para panel de reto (cuestionario o retos del nivel anterior). */
  function getChallengeLockBannerText(st, c) {
    if (!st.quizRewards[c.requiresQuizTopic]) {
      return (
        'Bloqueado: responde bien el cuestionario de «' +
        (TOPIC_TITLE_FOR_LOCK[c.requiresQuizTopic] || c.requiresQuizTopic) +
        '» en Teoría + RA (los temas se abren en orden: 1.1, luego 1.2, etc.).'
      );
    }
    var lvl = c.challengeLevel != null ? c.challengeLevel : 1;
    var prog = getPreviousLevelChallengeProgress(st, lvl);
    if (!prog || prog.done >= prog.need) return '';
    return (
      'Bloqueado: los retos de Nivel ' +
      lvl +
      ' exigen la mayoría de retos del Nivel ' +
      prog.level +
      ' completados. Llevas ' +
      prog.done +
      ' de ' +
      prog.total +
      ' (necesitas al menos ' +
      prog.need +
      '). Ve a Retos y termina los del Nivel ' +
      prog.level +
      ' primero.'
    );
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
        sub.textContent = getChallengeLockBannerText(st, c);
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
          banner.textContent = getChallengeLockBannerText(st, c);
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
      var guideBtn = document.querySelector('.btn-challenge-guide[data-challenge="' + c.id + '"]');
      var guidePanel = document.querySelector('[data-challenge-guide="' + c.id + '"]');
      if (guideBtn) {
        guideBtn.disabled = !unlocked;
        if (!unlocked) {
          guideBtn.setAttribute('aria-expanded', 'false');
          guideBtn.textContent = '¿No recuerdo? Ver guía paso a paso';
        }
      }
      if (guidePanel && !unlocked) {
        guidePanel.classList.add('hidden');
        guidePanel.innerHTML = '';
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

  function appendChallengeGuideStep(li, step) {
    if (typeof step === 'string') {
      li.textContent = step;
      return;
    }
    if (step.text) {
      var p = document.createElement('p');
      p.className = 'mb-0 leading-relaxed';
      p.textContent = step.text;
      li.appendChild(p);
    }
    if (step.code) {
      var pre = document.createElement('pre');
      pre.className = 'challenge-guide-code';
      pre.setAttribute('tabindex', '0');
      pre.textContent = step.code.replace(/^\n+|\n+$/g, '');
      li.appendChild(pre);
    }
  }

  function wireChallengeGuides() {
    document.querySelectorAll('.btn-challenge-guide').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var challengeId = btn.getAttribute('data-challenge');
        if (!challengeId || !isChallengeUnlocked(state, challengeId)) {
          return;
        }
        var steps = CHALLENGE_STEP_GUIDES[challengeId];
        var panel = document.querySelector('[data-challenge-guide="' + challengeId + '"]');
        if (!panel || !steps || !steps.length) {
          return;
        }
        var isOpen = btn.getAttribute('aria-expanded') === 'true';
        if (isOpen) {
          panel.classList.add('hidden');
          panel.innerHTML = '';
          btn.setAttribute('aria-expanded', 'false');
          btn.textContent = '¿No recuerdo? Ver guía paso a paso';
          return;
        }
        panel.innerHTML = '';
        var title = document.createElement('p');
        title.className = 'mb-3 text-xs font-semibold uppercase tracking-wider text-cyan-300/90';
        title.textContent = 'Cómo plantearlo paso a paso (texto + ejemplos de código)';
        var ol = document.createElement('ol');
        ol.className = 'challenge-guide-list list-decimal space-y-4 pl-5 text-sm leading-relaxed text-slate-300';
        steps.forEach(function (step) {
          var li = document.createElement('li');
          li.className = 'challenge-guide-step';
          appendChallengeGuideStep(li, step);
          ol.appendChild(li);
        });
        var foot = document.createElement('p');
        foot.className = 'mt-4 text-xs text-slate-500';
        foot.textContent =
          'Los recuadros verdes son ejemplos de forma: puedes adaptar mensajes y nombres. Escribe tu propia versión en el cuadro de arriba y pulsa Validar.';
        panel.appendChild(title);
        panel.appendChild(ol);
        panel.appendChild(foot);
        panel.classList.remove('hidden');
        btn.setAttribute('aria-expanded', 'true');
        btn.textContent = 'Ocultar guía';
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
  wireChallengeGuides();

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
          'Este tema sigue bloqueado. Responde bien todas las preguntas del cuestionario del tema anterior para desbloquearlo.'
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
