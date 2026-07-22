// ============================================================
// الرفيق — Service Worker
// الإصدار v8
// ============================================================

const CACHE_NAME = 'rafeeq-v8';

const urlsToCache = [
    './',
    './index.html',
    './tafsir.html',
    './style.css',
    './app.js',
    './quran-local.json',
    './tafsir-saadi.json',
    './manifest.json'
];

// ============================================================
// التثبيت
// ============================================================
self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                return cache.addAll(urlsToCache);
            })
            .then(function () {
                return self.skipWaiting();
            })
    );
});

// ============================================================
// التفعيل وتنظيف الكاش القديم
// ============================================================
self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys()
            .then(function (cacheNames) {
                return Promise.all(
                    cacheNames.map(function (cacheName) {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(function () {
                return self.clients.claim();
            })
    );
});

// ============================================================
// التعامل مع الطلبات
// ============================================================
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request)
            .then(function (cachedResponse) {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request)
                    .then(function (networkResponse) {
                        return networkResponse;
                    });
            })
            .catch(function () {
                return caches.match('./index.html');
            })
    );
});
