(function () {
  'use strict';

  var THEME_STORAGE_KEY = 'interactiveCodeLab_theme';
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
    var key = LabUsers.getProgressStorageKey(userId);
    var raw = localStorage.getItem(key);
    if (!raw) {
      return { points: 0, quizDone: 0, quizTotal: THEORY_IDS.length, lastTopic: '—' };
    }
    try {
      var d = JSON.parse(raw);
      var quizDone = 0;
      THEORY_IDS.forEach(function (id) {
        if (d.quizRewards && d.quizRewards[id]) quizDone++;
      });
      return {
        points: typeof d.points === 'number' ? d.points : 0,
        quizDone: quizDone,
        quizTotal: THEORY_IDS.length,
        lastTopic: d.lastTheoryTopic || '—',
      };
    } catch (e) {
      return { points: 0, quizDone: 0, quizTotal: THEORY_IDS.length, lastTopic: '—' };
    }
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function render() {
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
          '<td class="px-3 py-2 font-mono text-xs">' +
          escapeHtml(String(p.lastTopic)) +
          '</td>';
        tb.appendChild(tr);
      });
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
    LabUsers.initUsers().then(render);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
