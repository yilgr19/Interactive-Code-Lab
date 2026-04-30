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

  function roleLabel(r) {
    if (r === 'admin') return 'Administrador';
    if (r === 'teacher') return 'Docente';
    return 'Estudiante';
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
      return { empty: true, points: 0, quizDone: 0, quizTotal: ids.length, badges: 0, lastTopic: '—' };
    }
    try {
      var d = JSON.parse(raw);
      var quizDone = 0;
      ids.forEach(function (id) {
        if (d.quizRewards && d.quizRewards[id]) quizDone++;
      });
      var badges = Array.isArray(d.badges) ? d.badges.length : 0;
      return {
        empty: false,
        points: typeof d.points === 'number' ? d.points : 0,
        quizDone: quizDone,
        quizTotal: ids.length,
        badges: badges,
        lastTopic: lastTopicLabel(d.lastTheoryTopic || '—'),
      };
    } catch (e) {
      return { empty: true, points: 0, quizDone: 0, quizTotal: ids.length, badges: 0, lastTopic: '—' };
    }
  }

  function renderUsers() {
    var tb = document.getElementById('admin-users-tbody');
    if (!tb) return;
    tb.innerHTML = '';
    LabUsers.getUsers().forEach(function (u) {
      var tr = document.createElement('tr');
      tr.className = 'hover:bg-lab-bg/30';
      tr.innerHTML =
        '<td class="px-3 py-2">' +
        '<button type="button" class="toggle-active rounded border px-2 py-1 text-xs ' +
        (u.active ? 'border-emerald-500/40 text-emerald-300' : 'border-slate-600 text-slate-500') +
        '" data-id="' +
        u.id +
        '">' +
        (u.active ? 'Sí' : 'No') +
        '</button></td>' +
        '<td class="px-3 py-2 font-mono text-xs text-lab-accent">' +
        escapeHtml(u.username) +
        '</td>' +
        '<td class="px-3 py-2">' +
        escapeHtml(u.displayName || '') +
        '</td>' +
        '<td class="px-3 py-2">' +
        roleLabel(u.role) +
        '</td>' +
        '<td class="px-3 py-2 text-right space-x-1">' +
        '<button type="button" class="btn-edit rounded border border-lab-border px-2 py-1 text-xs text-slate-300 hover:bg-lab-accent/10 hover:text-lab-accent" data-id="' +
        u.id +
        '">Editar</button>' +
        '</td>';
      tb.appendChild(tr);
    });

    tb.querySelectorAll('.toggle-active').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-id');
        var user = LabUsers.findUserById(id);
        if (!user) return;
        LabUsers.updateUser(id, { active: !user.active });
        renderUsers();
        renderProgress();
      });
    });

    tb.querySelectorAll('.btn-edit').forEach(function (btn) {
      btn.addEventListener('click', function () {
        openModal(LabUsers.findUserById(btn.getAttribute('data-id')));
      });
    });
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function renderProgress() {
    var tb = document.getElementById('admin-progress-tbody');
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
          ' <span class="font-mono text-[11px] text-slate-500">(' +
          escapeHtml(u.username) +
          ')</span></td>' +
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
          '</td>' +
          '<td class="px-3 py-2">' +
          p.badges +
          '</td>';
        tb.appendChild(tr);
      });
  }

  var modalBackdrop = document.getElementById('admin-modal-backdrop');
  var modalTitle = document.getElementById('admin-modal-title');
  var form = document.getElementById('admin-user-form');
  var isCreateMode = false;

  function openModal(user) {
    isCreateMode = !user;
    modalTitle.textContent = user ? 'Editar usuario' : 'Nuevo usuario';
    document.getElementById('edit-user-id').value = user ? user.id : '';
    document.getElementById('edit-username').value = user ? user.username : '';
    document.getElementById('edit-displayname').value = user ? user.displayName || '' : '';
    document.getElementById('edit-password').value = '';
    document.getElementById('edit-password').required = !user;
    document.getElementById('edit-password').placeholder = user ? 'Vacío = no cambiar' : 'Contraseña inicial';
    document.getElementById('edit-role').value = user ? user.role : 'student';
    document.getElementById('edit-active').checked = user ? !!user.active : true;
    modalBackdrop.classList.remove('hidden');
    modalBackdrop.classList.add('flex');
  }

  function closeModal() {
    modalBackdrop.classList.add('hidden');
    modalBackdrop.classList.remove('flex');
  }

  function boot() {
    wireThemeToggle();

    document.getElementById('admin-logout').addEventListener('click', function () {
      LabUsers.clearSession();
      window.location.href = 'login.html';
    });

    document.getElementById('btn-export-users').addEventListener('click', function () {
      var blob = new Blob([LabUsers.exportUsersBlob()], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'users.json';
      a.click();
      URL.revokeObjectURL(a.href);
    });

    document.getElementById('input-import-users').addEventListener('change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          LabUsers.importUsersJson(reader.result);
          renderUsers();
          renderProgress();
          alert('Usuarios importados correctamente.');
        } catch (err) {
          alert('No se pudo importar: ' + (err.message || err));
        }
        e.target.value = '';
      };
      reader.readAsText(f, 'UTF-8');
    });

    document.getElementById('btn-new-user').addEventListener('click', function () {
      openModal(null);
    });

    var resetMsg = document.getElementById('admin-reset-progress-msg');
    function showResetMsg(text, kind) {
      if (!resetMsg) return;
      if (!text) {
        resetMsg.classList.add('hidden');
        resetMsg.textContent = '';
        return;
      }
      resetMsg.classList.remove('hidden', 'border-emerald-500/30', 'bg-emerald-950/20', 'text-emerald-200');
      resetMsg.classList.remove('border-red-500/30', 'bg-red-950/20', 'text-red-200');
      if (kind === 'error') {
        resetMsg.classList.add('border-red-500/30', 'bg-red-950/20', 'text-red-200');
      } else {
        resetMsg.classList.add('border-emerald-500/30', 'bg-emerald-950/20', 'text-emerald-200');
      }
      resetMsg.textContent = text;
    }

    var btnResetAll = document.getElementById('admin-reset-all-progress');
    if (btnResetAll) {
      btnResetAll.addEventListener('click', function () {
        var students = LabUsers.getUsers().filter(function (u) {
          return u.role === 'student';
        });
        if (!students.length) {
          showResetMsg('No hay cuentas con rol estudiante.', 'error');
          return;
        }
        if (
          !confirm(
            '¿Eliminar el progreso del laboratorio de TODOS los estudiantes en este navegador?\n\n' +
              'Se borrarán puntos, cuestionarios, retos e insignias guardadas por estudiante. Los usuarios y contraseñas no se tocan.\n\n' +
              'Esta acción no se puede deshacer.'
          )
        ) {
          return;
        }
        if (
          !confirm(
            'Confirmación final: se afectará a ' +
              students.length +
              ' cuenta(s) estudiante. ¿Continuar?'
          )
        ) {
          return;
        }
        var res = LabUsers.clearAllStudentsLabProgress();
        if (!res.ok) {
          showResetMsg('No se pudo completar el borrado (revisa permisos del almacenamiento).', 'error');
          return;
        }
        showResetMsg(
          'Progreso reiniciado para ' + res.studentsCleared + ' estudiante(s). La tabla se actualiza a continuación.',
          'ok'
        );
        renderProgress();
      });
    }

    document.getElementById('admin-modal-cancel').addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', function (e) {
      if (e.target === modalBackdrop) closeModal();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var id = document.getElementById('edit-user-id').value;
      var username = document.getElementById('edit-username').value.trim();
      var displayName = document.getElementById('edit-displayname').value.trim();
      var password = document.getElementById('edit-password').value;
      var role = document.getElementById('edit-role').value;
      var active = document.getElementById('edit-active').checked;

      if (isCreateMode) {
        var res = LabUsers.addUser({
          username: username,
          password: password,
          displayName: displayName || username,
          role: role,
          active: active,
        });
        if (!res.ok) {
          alert(res.message || 'Error al crear');
          return;
        }
      } else {
        var existing = LabUsers.findUserById(id);
        if (!existing) return;
        if (LabUsers.normalizeUsername(username) !== LabUsers.normalizeUsername(existing.username)) {
          var taken = LabUsers.getUsers().some(function (x) {
            return x.id !== id && LabUsers.normalizeUsername(x.username) === LabUsers.normalizeUsername(username);
          });
          if (taken) {
            alert('Ya existe otro usuario con ese nombre de acceso.');
            return;
          }
        }
        var patch = {
          username: username,
          displayName: displayName || username,
          role: role,
          active: active,
        };
        if (password) patch.password = password;
        LabUsers.updateUser(id, patch);
      }
      closeModal();
      renderUsers();
      renderProgress();
    });

    LabUsers.initUsers().then(function () {
      renderUsers();
      renderProgress();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
