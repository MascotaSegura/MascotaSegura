const CACHE_NAME = 'mascotasegura-v5';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './entrar.html',
  './registro.html',
  './recuperar.html',
  './mis-mascotas.html',
  './crear-placa.html',
  './notificaciones.html',
  './perfil.html',
  './sequence.js',
  './script.js',
  './paw-print-fill.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith('http') && !event.request.url.includes(location.hostname)) {
      return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
