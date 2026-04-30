/**
 * Registro de usuarios y sesión (prototipo sin servidor).
 * - Semilla: data/users.json (fetch la primera vez).
 * - Copia editable: localStorage interactiveCodeLab_users_registry.
 * - Progreso del laboratorio por estudiante: interactiveCodeLab_progress_<userId>.
 * Las contraseñas van en texto plano solo para demo; en producción usar backend y hash.
 */
(function (global) {
  'use strict';

  var SESSION_KEY = 'interactiveCodeLab_session';
  var USERS_KEY = 'interactiveCodeLab_users_registry';
  var LEGACY_PROGRESS_KEY = 'interactiveCodeLab_v1';
  var PROGRESS_PREFIX = 'interactiveCodeLab_progress_';
  var USERS_JSON_URL = 'data/users.json';

  function getProgressStorageKey(userId) {
    return PROGRESS_PREFIX + userId;
  }

  function getSession() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      var s = JSON.parse(raw);
      if (!s || !s.userId) return null;
      return s;
    } catch (e) {
      return null;
    }
  }

  function setSession(obj) {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(obj));
    } catch (e) {
      console.warn('No se pudo guardar la sesión', e);
    }
  }

  function clearSession() {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {}
  }

  function getUsers() {
    try {
      var raw = localStorage.getItem(USERS_KEY);
      if (!raw) return [];
      var data = JSON.parse(raw);
      return Array.isArray(data.users) ? data.users : [];
    } catch (e) {
      return [];
    }
  }

  function saveUsers(users) {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify({ users: users }));
    } catch (e) {
      console.warn('No se pudo guardar usuarios', e);
    }
  }

  function defaultSeedUsers() {
    return [
      {
        id: 'usr-admin',
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        active: true,
        displayName: 'Administrador',
      },
      {
        id: 'usr-teacher',
        username: 'docente',
        password: 'docente123',
        role: 'teacher',
        active: true,
        displayName: 'Docente demo',
      },
      {
        id: 'usr-student-1',
        username: 'estudiante',
        password: 'laboratorio',
        role: 'student',
        active: true,
        displayName: 'Estudiante demo',
      },
    ];
  }

  /**
   * Si no hay registro en localStorage, carga data/users.json o semilla mínima.
   */
  function initUsers() {
    return new Promise(function (resolve) {
      var existing = getUsers();
      if (existing.length > 0) {
        resolve(existing);
        return;
      }
      fetch(USERS_JSON_URL)
        .then(function (r) {
          if (!r.ok) throw new Error('fetch');
          return r.json();
        })
        .then(function (data) {
          var users = Array.isArray(data.users) ? data.users : [];
          saveUsers(users.length ? users : defaultSeedUsers());
          resolve(getUsers());
        })
        .catch(function () {
          saveUsers(defaultSeedUsers());
          resolve(getUsers());
        });
    });
  }

  function normalizeUsername(u) {
    return String(u || '')
      .trim()
      .toLowerCase();
  }

  function authenticate(username, password) {
    var users = getUsers();
    var want = normalizeUsername(username);
    var pass = String(password);
    for (var i = 0; i < users.length; i++) {
      var x = users[i];
      if (!x.active) continue;
      if (normalizeUsername(x.username) !== want) continue;
      if (String(x.password) !== pass) {
        return { ok: false, reason: 'password' };
      }
      return { ok: true, user: x };
    }
    return { ok: false, reason: 'user' };
  }

  /**
   * Borra el progreso del laboratorio del estudiante en este navegador.
   * También elimina la clave heredada `interactiveCodeLab_v1` para que no se vuelva a importar al recargar.
   */
  function clearStudentLabProgress(userId) {
    if (!userId) return false;
    try {
      localStorage.removeItem(getProgressStorageKey(userId));
      localStorage.removeItem(LEGACY_PROGRESS_KEY);
      return true;
    } catch (e) {
      return false;
    }
  }

  /** Borra las claves `interactiveCodeLab_progress_*` de cada estudiante y la progresión heredada `interactiveCodeLab_v1`. */
  function clearAllStudentsLabProgress() {
    var users = getUsers();
    var n = 0;
    try {
      for (var i = 0; i < users.length; i++) {
        if (users[i].role !== 'student') continue;
        localStorage.removeItem(getProgressStorageKey(users[i].id));
        n++;
      }
      localStorage.removeItem(LEGACY_PROGRESS_KEY);
      return { ok: true, studentsCleared: n };
    } catch (e) {
      return { ok: false, studentsCleared: n, error: e };
    }
  }

  function migrateLegacyProgressToUser(userId) {
    var key = getProgressStorageKey(userId);
    if (localStorage.getItem(key)) return;
    var raw = localStorage.getItem(LEGACY_PROGRESS_KEY);
    if (!raw) return;
    try {
      var data = JSON.parse(raw);
      if (typeof data !== 'object' || data === null) return;
      var copy = JSON.parse(JSON.stringify(data));
      delete copy.sessionUser;
      localStorage.setItem(key, JSON.stringify(copy));
    } catch (e) {}
  }

  function findUserById(id) {
    var users = getUsers();
    for (var i = 0; i < users.length; i++) {
      if (users[i].id === id) return users[i];
    }
    return null;
  }

  function updateUser(id, patch) {
    var users = getUsers();
    var ix = -1;
    for (var i = 0; i < users.length; i++) {
      if (users[i].id === id) {
        ix = i;
        break;
      }
    }
    if (ix === -1) return false;
    Object.keys(patch).forEach(function (k) {
      if (k === 'id') return;
      users[ix][k] = patch[k];
    });
    saveUsers(users);
    return true;
  }

  function addUser(rec) {
    var users = getUsers();
    var username = normalizeUsername(rec.username);
    if (!username) return { ok: false, message: 'Usuario vacío' };
    for (var i = 0; i < users.length; i++) {
      if (normalizeUsername(users[i].username) === username) {
        return { ok: false, message: 'Ese usuario ya existe' };
      }
    }
    var id = rec.id || 'usr-' + Date.now();
    var row = {
      id: id,
      username: String(rec.username).trim(),
      password: String(rec.password || ''),
      role: rec.role === 'admin' || rec.role === 'teacher' || rec.role === 'student' ? rec.role : 'student',
      active: rec.active !== false,
      displayName: String(rec.displayName || rec.username).trim() || rec.username,
    };
    users.push(row);
    saveUsers(users);
    return { ok: true, user: row };
  }

  function exportUsersBlob() {
    return JSON.stringify({ users: getUsers() }, null, 2);
  }

  function importUsersJson(text) {
    var data = JSON.parse(text);
    if (!data || !Array.isArray(data.users)) throw new Error('Formato inválido: se espera { "users": [...] }');
    saveUsers(data.users);
    return getUsers().length;
  }

  global.LabUsers = {
    SESSION_KEY: SESSION_KEY,
    USERS_KEY: USERS_KEY,
    LEGACY_PROGRESS_KEY: LEGACY_PROGRESS_KEY,
    getProgressStorageKey: getProgressStorageKey,
    getSession: getSession,
    setSession: setSession,
    clearSession: clearSession,
    getUsers: getUsers,
    saveUsers: saveUsers,
    initUsers: initUsers,
    authenticate: authenticate,
    migrateLegacyProgressToUser: migrateLegacyProgressToUser,
    clearStudentLabProgress: clearStudentLabProgress,
    clearAllStudentsLabProgress: clearAllStudentsLabProgress,
    findUserById: findUserById,
    updateUser: updateUser,
    addUser: addUser,
    exportUsersBlob: exportUsersBlob,
    importUsersJson: importUsersJson,
    normalizeUsername: normalizeUsername,
  };
})(typeof window !== 'undefined' ? window : this);
