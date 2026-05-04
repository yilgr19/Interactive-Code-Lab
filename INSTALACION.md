# Guía de instalación y ejecución — Interactive Code Lab

Aplicación web estática (HTML, CSS, JavaScript): **no** hace falta `npm` ni compilar. Hay que abrirla con **HTTP** (nunca con `file://`), para que carguen `data/users.json` y el resto de recursos.

| Dónde | URL típica (puerto **8000**) |
|--------|-------------------------------|
| **PC** (mismo ordenador que el servidor) | `http://localhost:8000/login.html` |
| **Móvil / tablet** (misma Wi‑Fi que el PC) | `http://TU_IP_LOCAL:8000/login.html` |

**Puerto:** **8000** (en muchos Windows el **8080** da error de permisos; si 8000 está ocupado, usa otro número y cámbialo en todas las URLs).

**Servidor recomendado:** si quieres usar el laboratorio **tanto en PC como en el móvil**, arranca Python con **`--bind 0.0.0.0`** para que el PC acepte conexiones desde la red local (no solo desde `localhost`).

---

## 1. Requisitos previos

- Navegador actualizado (Chrome, Edge, Firefox o Safari).
- **Python 3** en el PC que hará de servidor, u otro servidor HTTP estático (ver §4).
- Internet la **primera vez** (Tailwind por CDN, fuentes, `model-viewer`). Después puede quedar en caché.

---

## 2. Proyecto y carpeta correcta

1. Coloca la carpeta del proyecto donde quieras (ej. `Interactive Code Lab`).
2. En la terminal, entra en la **raíz** (donde están `login.html`, `index.html`, `js/`, `data/`).

```powershell
cd "C:\ruta\a\Interactive Code Lab"
dir login.html
```

Debes ver el archivo `login.html`. Si no aparece, no estás en la carpeta del proyecto.

### Archivos clave

| Ruta | Uso |
|------|-----|
| `login.html` | Entrada (login) |
| `index.html` | Vista estudiante |
| `teacher.html` | Docente |
| `admin.html` | Administrador |
| `data/users.json` | Usuarios iniciales |
| `js/` | Lógica de la app |
| `assets/` | Modelos `.glb` (teoría / RA) |

---

## 3. Arrancar el servidor (PC — sirve para ti y para el móvil)

Desde la **raíz del proyecto**:

### Python (recomendado)

```powershell
python -m http.server 8000 --bind 0.0.0.0
```

Si `python` no existe:

```powershell
py -m http.server 8000 --bind 0.0.0.0
```

- **Deja la terminal abierta.** Si cierras o pulsas Ctrl+C, la web deja de funcionar.
- Con `--bind 0.0.0.0` el servidor escucha en **todas** las interfaces: sirve para **`localhost` en el PC** y para **la IP local** desde el móvil.

### Otras opciones

- **Node:** `npx --yes serve -l 8000` (comprueba en la salida si escucha en todas las interfaces para usar el móvil).
- **VS Code:** extensión “Live Server” abriendo la raíz del proyecto.

---

## 4. Usar en el PC

1. Con el servidor en marcha (§3).
2. Abre en el navegador del **mismo PC**:

   **`http://localhost:8000/login.html`**

3. Inicia sesión (§6).

---

## 5. Usar en el móvil o tablet (Android / iPhone)

El servidor sigue siendo **el PC**. En el teléfono **no** uses `localhost` (ahí “localhost” es el propio teléfono).

### 5.1 Misma red

- PC y móvil en la **misma Wi‑Fi** (sin datos móviles en el teléfono para esta prueba).
- Evita Wi‑Fi “invitado” si el router **aisla** clientes (no se ven entre sí).

### 5.2 IP del PC

En **cmd** o **PowerShell** del PC:

```powershell
ipconfig
```

Busca **Wi‑Fi** → **Dirección IPv4** (ej. `192.168.1.15`). Esa es **TU_IP_LOCAL**.

### 5.3 URL en el móvil

En el navegador (mejor **Chrome** en Android):

**`http://TU_IP_LOCAL:8000/login.html`**

Ejemplo: `http://192.168.1.15:8000/login.html` — **`http`**, no `https`.

### 5.4 Comprobar que “llega” el móvil

1. En el **PC**, abre también `http://TU_IP_LOCAL:8000/login.html`. Si aquí falla, arregla eso antes que el móvil.
2. Al cargar desde el móvil, en la ventana de Python debería salir algo como `GET /login.html`. Si **no** sale nada, suele ser **firewall** o red.

### 5.5 Firewall de Windows (muy habitual)

- Marca el Wi‑Fi como red **Privada** en Windows.
- Si Windows preguntó por Python, permite acceso en **redes privadas**.
- Si hace falta, regla de entrada: **TCP puerto 8000**, permitir, perfil **Privado**.

En **PowerShell como administrador**:

```powershell
New-NetFirewallRule -DisplayName "Python HTTP Lab 8000" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow -Profile Private
```

### 5.6 Si el móvil no carga

- Vuelve a ejecutar `ipconfig`: la IPv4 **puede cambiar**.
- Prueba otro puerto (ej. `8010`) en el comando y en la URL.
- Pantalla negra o sugerencias a `localhost`: revisa que la URL lleve la **IP del PC**, no `localhost`.

### 5.7 Realidad aumentada (RA)

La RA del botón **“Escanear en mi espacio”** está pensada sobre todo para **móvil** (Chrome en Android o Safari en iPhone). En escritorio Windows muchas veces **no** está disponible; el modelo 3D en pantalla sí puedes usarlo en el PC.

---

## 6. Usuarios de demostración

Definidos en `data/users.json` (luego pueden copiarse a `localStorage`):

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Estudiante | `estudiante` | `laboratorio` |
| Docente | `docente` | `docente123` |
| Administrador | `admin` | `admin123` |

---

## 7. Progreso y datos en el dispositivo

- Puntos, cuestionarios y retos se guardan en **`localStorage`** de **cada navegador** (PC y móvil son progresos **distintos** si no es el mismo perfil/navegador).
- Los temas extra del docente están en `interactiveCodeLab_teacher_custom_topics` en ese mismo navegador.
- Copiar la carpeta del proyecto a otro PC **no** copia el progreso.

---

## 8. Modelos 3D (opcional)

Si faltan `.glb` en `assets/`, revisa los scripts en `scripts/` y la documentación del proyecto. Sin modelos, el resto de la app puede usarse, pero los visores 3D pueden mostrar error de carga.

---

## 9. Solución de problemas

| Problema | Qué hacer |
|----------|-----------|
| Login no carga / JSON vacío | Usa `http://...` y **no** `file:///...`. Servidor encendido en la carpeta correcta. |
| `PermissionError 10013` al arrancar | Otro programa usa el puerto; prueba `8000`, `8010`, `5500`. Comprueba con `netstat -ano` qué usa el puerto. |
| 404 desde el móvil | Servidor iniciado desde la raíz donde está `login.html`; URL con `/login.html` completo. |
| Móvil no conecta | `--bind 0.0.0.0`, firewall §5.5, misma Wi‑Fi, IP actual con `ipconfig`. |
| Cambios en `users.json` sin efecto | Si ya hay copia en `localStorage`, usa importación desde admin o limpia datos del sitio (solo en pruebas). |

---

## 10. Resumen en tres líneas

```powershell
cd "C:\ruta\a\Interactive Code Lab"
python -m http.server 8000 --bind 0.0.0.0
```

- **PC:** `http://localhost:8000/login.html`
- **Móvil (misma Wi‑Fi):** `http://TU_IP_LOCAL:8000/login.html`

---

*Prototipo Interactive Code Lab. En producción: backend, HTTPS, contraseñas con hash y persistencia centralizada.*
