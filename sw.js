// ============================================================
// الرفيق — Service Worker
// ⚠️ غيّر رقم الإصدار في كل تحديث
// ============================================================

const CACHE_NAME = 'rafeeq-v7';  // ← غيّر الرقم هنا عند كل تحديث

const urlsToCache = [
    './',
    './index.html',
    './tafsir.html',
    './style.css',
    './app.js',
    './quran-local.json',
    './tafsir-saadi.json',
    './manifest.json',
    'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Lateef&display=swap'
];

// تثبيت الـ Service Worker وتخزين الملفات
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

// تفعيل الـ Service Worker وتنظيف الكاش القديم
self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(function () {
            return self.clients.claim();
        })
    );
});

// اعتراض الطلبات وتقديمها من الكاش
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request)
            .then(function (response) {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});
