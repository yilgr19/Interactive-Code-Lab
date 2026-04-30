/**
 * Acceso — autenticación contra LabUsers (registro JSON + localStorage).
 */
(function () {
  'use strict';

  var THEME_STORAGE_KEY = 'interactiveCodeLab_theme';

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

  function redirectUrlForRole(role) {
    if (role === 'admin') return 'admin.html';
    if (role === 'teacher') return 'teacher.html';
    return 'index.html';
  }

  function wireForm() {
    var form = document.getElementById('login-form');
    var err = document.getElementById('login-error');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (err) {
        err.classList.add('hidden');
        err.textContent = '';
      }
      var userEl = document.getElementById('login-user');
      var passEl = document.getElementById('login-password');
      var user = userEl ? userEl.value.trim() : '';
      var pass = passEl ? passEl.value : '';
      if (user.length < 2) {
        if (err) {
          err.textContent = 'Escribe un usuario de al menos 2 caracteres.';
          err.classList.remove('hidden');
        }
        return;
      }
      var result = LabUsers.authenticate(user, pass);
      if (!result.ok) {
        if (err) {
          err.textContent =
            result.reason === 'password'
              ? 'Contraseña incorrecta.'
              : 'Usuario no encontrado o cuenta desactivada.';
          err.classList.remove('hidden');
        }
        if (result.reason === 'password' && passEl) passEl.value = '';
        return;
      }
      var u = result.user;
      LabUsers.setSession({
        userId: u.id,
        username: u.username,
        role: u.role,
        displayName: u.displayName || u.username,
      });
      if (u.role === 'student') {
        LabUsers.migrateLegacyProgressToUser(u.id);
      }
      window.location.href = redirectUrlForRole(u.role);
    });
  }

  function boot() {
    wireThemeToggle();
    LabUsers.initUsers()
      .then(function () {
        wireForm();
      })
      .catch(function () {
        wireForm();
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
