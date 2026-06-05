// Naikkan versi ke v2 untuk memaksa browser membuang ingatan lama
const CACHE_NAME = 'erp-enterprise-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Paksa pekerja baru langsung menggantikan yang lama
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['/', '/index.html', '/favicon.svg']);
    })
  );
  console.log('[Service Worker] V2 Berhasil Di-install! Mode Network-First aktif.');
});

// Bersihkan sampah cache versi lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Menghapus cache lama:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Strategi NETWORK FIRST: Selalu ambil dari Vercel dulu, kalau tidak ada sinyal baru pakai Cache
self.addEventListener('fetch', (event) => {
  // Hanya proses request GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Jika internet ada, simpan data terbaru ke cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response; // Tampilkan yang terbaru!
      })
      .catch(() => {
        // Jika sedang OFFLINE / Tidak ada sinyal, baru gunakan ingatan lama
        return caches.match(event.request);
      })
  );
});