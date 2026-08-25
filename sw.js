const CACHE_NAME = 'dashboard-seguridad-v2';
const urlsToCache = [
  './',
  'index.html',
  'styles.css',
  'script.js',
  'manifest.json',
  'https://code.highcharts.com/highcharts.js',
  'https://code.highcharts.com/highcharts-3d.js',
  'https://code.highcharts.com/modules/exporting.js',
  'https://code.highcharts.com/modules/export-offline.js'
];

// Instalación del Service Worker y guardado en caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activación y limpieza de cachés antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptación de peticiones para permitir uso offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

