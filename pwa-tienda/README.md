# PWA: Tienda de Skins (lee la misma base de Firebase que Unity)

Página web simple, sin frameworks ni herramientas de build, que lee el
mismo nodo `skins` de Firebase Realtime Database que usamos en Unity, y
funciona como PWA (se puede "instalar" y carga offline gracias al service
worker).

## Archivos

- `index.html` — la página de la tienda (ahora exige sesión iniciada).
- `login.html` — pantalla de inicio de sesión y registro.
- `style.css` — estilos de las tarjetas y el header, estilo "ZZZ".
- `auth.css` — estilos del formulario de login/registro y del botón de
  cerrar sesión (usa las mismas variables de color de `style.css`).
- `app.js` — revisa que haya sesión iniciada (si no, manda a
  `login.html`), se conecta a Firebase, lee `skins` y dibuja las
  tarjetas. También registra el service worker y maneja el botón de
  cerrar sesión.
- `auth.js` — lógica de `login.html`: iniciar sesión y crear cuenta con
  Firebase Auth (correo + contraseña).
- `firebase-config.js` — aquí pegas la configuración de tu proyecto de
  Firebase (ver paso 1).
- `manifest.json` — le dice al navegador que esto se puede instalar como
  app (nombre, colores, ícono).
- `service-worker.js` — guarda en caché los archivos de la página para que
  cargue rápido y funcione sin internet.
- `icons/icon-192.png`, `icons/icon-512.png` — íconos de ejemplo
  (un círculo con una "S"), reemplázalos por los tuyos cuando quieras.

## 0. Habilitar el inicio de sesión con correo/contraseña

En la consola de Firebase: **Authentication** → pestaña **Sign-in
method** → habilita **Correo electrónico/contraseña**. Sin este paso,
`login.html` va a mostrar errores al intentar entrar o registrarse.

## 1. Configurar Firebase

En la consola de Firebase: ícono de engranaje → **Configuración del
proyecto** → pestaña **Tus apps**. Si no tienes una app web todavía,
créala ahí mismo (ícono `</>`). Copia el objeto `firebaseConfig` que te
muestra y pégalo en `firebase-config.js`, reemplazando los valores de
ejemplo.

Usamos el mismo nodo `skins` que ya armamos para Unity, así que si ya
tienes datos ahí, no necesitas cargar nada de nuevo. Si empiezas de cero,
este es el JSON de ejemplo (mismo que en el proyecto de Unity):

```json
{
  "skins": {
    "skin_001": { "name": "Guerrero de Fuego", "price": 500, "spriteName": "guerrero_fuego" },
    "skin_002": { "name": "Ninja Sombra", "price": 300, "spriteName": "ninja_sombra" },
    "skin_003": { "name": "Caballero de Hielo", "price": 750, "spriteName": "caballero_hielo" }
  }
}
```

Y las reglas para que cualquiera pueda leerlo sin loguearse:

```json
{
  "rules": {
    "skins": {
      ".read": true,
      ".write": false
    }
  }
}
```

## 2. Agregar las imágenes

Crea una carpeta `images/` al lado de `index.html` y pon ahí las mismas
imágenes que usaste en Unity, con el mismo nombre que el campo
`spriteName` (por ejemplo `images/guerrero_fuego.png`).

```
pwa-tienda/
  images/
    guerrero_fuego.png
    ninja_sombra.png
    caballero_hielo.png
  index.html
  ...
```

## 3. Probarla (IMPORTANTE: necesitas un servidor local)

Los service workers no funcionan si abres `index.html` directo con doble
clic (protocolo `file://`). Necesitas servir la carpeta por `http://`.
La forma más simple si tienes Python instalado:

```bash
cd pwa-tienda
python3 -m http.server 8000
```

Y abres `http://localhost:8000` en Chrome. Si usas Visual Studio Code, la
extensión "Live Server" hace lo mismo con un clic.

## 4. Ver que funciona como PWA

Con la página abierta en Chrome:

- **DevTools → Application → Manifest**: te muestra el nombre, íconos y
  colores que lee de `manifest.json`.
- **DevTools → Application → Service Workers**: te muestra el service
  worker registrado y su estado.
- En la barra de direcciones debería aparecer un ícono de instalar
  (⊕ o una pantalla con flecha). Si lo instalas, se abre como una app
  aparte, sin la barra del navegador.
- Para probar el modo offline: con la página ya cargada una vez, en
  DevTools → Network, marca "Offline" y recarga. La página (HTML, CSS,
  imágenes de las tarjetas ya vistas) debería seguir apareciendo, aunque
  los datos de Firebase no se puedan actualizar sin internet.

## 5. Qué le falta (para después)

Ya hay login y registro (`login.html` + `auth.js`, con Firebase Auth de
correo/contraseña), y `index.html` no deja ver la tienda sin sesión
iniciada. Lo que todavía no existe es la compra en sí: por ahora solo se
puede ver el catálogo, no gastar monedas ni guardar qué skins tiene cada
usuario. Eso implicaría, por ejemplo, guardar bajo
`usuarios/{uid}/skinsCompradas` en la misma base de datos.
