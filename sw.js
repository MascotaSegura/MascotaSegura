const CACHE_NAME = 'mascotasegura-v7';
const ASSETS_TO_CACHE = [
  './index.html',
  './entrar.html',
  './registro.html',
  './recuperar.html',
  './mis-mascotas.html',
  './crear-placa.html',
  './notificaciones.html',
  './perfil.html',
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
    fetch(event.request)
      .then((networkResponse) => {
        // Guardar la nueva respuesta en caché para futuros usos sin conexión
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          if (event.request.method === 'GET') {
            cache.put(event.request, responseClone);
          }
        });
        return networkResponse;
      })
      .catch(() => {
        // Si la red falla (offline), intentamos servir desde el caché
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'MascotaSegura', body: '¡Nueva alerta sobre tu mascota!' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || './paw-print-fill.svg',
      data: data.data
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/mis-mascotas.html';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
