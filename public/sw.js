const CACHE_NAME = 'erp-enterprise-v1';

// Saat Aplikasi Di-install, simpan file penting ke memori HP
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/favicon.svg'
      ]);
    })
  );
  console.log('[Service Worker] Berhasil Di-install! Aplikasi siap mode mobile.');
});

// Saat Aplikasi Berjalan, gunakan memori cache agar ngebut
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});