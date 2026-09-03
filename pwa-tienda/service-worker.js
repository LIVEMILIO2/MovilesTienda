// nombre y version del cache. Cambia el numero cuando actualices los
// archivos para que el navegador descargue la version nueva.
const CACHE_NAME = 'tienda-skins-v1';

// archivos del "app shell": lo minimo para que la pagina cargue offline
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './firebase-config.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// se ejecuta una sola vez, cuando el navegador instala el service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

// borra caches de versiones viejas cuando se activa una version nueva
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      )
    )
  );
});

// intercepta cada pedido de archivo: si ya lo tenemos guardado, lo sirve
// de ahi (mas rapido y funciona sin internet). Si no, lo pide a la red.
//
// ojo: esto solo cachea los archivos de la pagina (html, css, js, iconos).
// la conexion en tiempo real con Firebase sigue necesitando internet.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
