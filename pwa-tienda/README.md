# PWA: Tienda de Skins (lee la misma base de Firebase que Unity)

Página web simple, sin frameworks ni herramientas de build, que lee el
mismo nodo `skins` de Firebase Realtime Database que usamos en Unity, y
funciona como PWA (se puede "instalar" y carga offline gracias al service
worker).

## Archivos

- `index.html` — la página.
- `style.css` — estilos de las tarjetas.
- `app.js` — se conecta a Firebase, lee `skins` y dibuja las tarjetas.
  También registra el service worker.
- `firebase-config.js` — aquí pegas la configuración de tu proyecto de
  Firebase (ver paso 1).
- `manifest.json` — le dice al navegador que esto se puede instalar como
  app (nombre, colores, ícono).
- `service-worker.js` — guarda en caché los archivos de la página para que
  cargue rápido y funcione sin internet.
- `icons/icon-192.png`, `icons/icon-512.png` — íconos de ejemplo
  (un círculo con una "S"), reemplázalos por los tuyos cuando quieras.

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

Esto solo lee y muestra las skins, igual que el ejemplo de Unity: no hay
login ni compra todavía. Si más adelante quieres agregar login web con
Firebase Auth, es el mismo patrón que usamos en Unity pero con el SDK de
Auth para web (`firebase-auth.js`) — avísame cuando quieras ese paso y lo
armamos.
