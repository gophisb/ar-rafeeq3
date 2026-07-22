// ============================================================
// sw.js — الرفيق v6
// Service Worker — Offline + Cache + Quran Local
// ============================================================

const CACHE_NAME = 'rafeeq3-v6';

const APP_SHELL = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './theme.js',
    './manifest.json',

    // الصوت
    './adhan.mp3',

    // الأيقونات
    './icon-192.png',
    './icon-512.png',

    // الصفحات
    './quran.html',
    './prayer.html',
    './qibla.html',
    './adhkar.html',
    './hisnul.html',
    './arbaeen.html',
    './more.html',

    // بيانات القرآن المحلية
    './quran-local.json'
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                return cache.addAll(APP_SHELL);
            })
            .then(function () {
                return self.skipWaiting();
            })
            .catch(function (error) {
                console.error('SW install error:', error);
            })
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys()
            .then(function (keys) {
                return Promise.all(
                    keys
                        .filter(function (key) {
                            return key !== CACHE_NAME;
                        })
                        .map(function (key) {
                            return caches.delete(key);
                        })
                );
            })
            .then(function () {
                return self.clients.claim();
            })
    );
});

self.addEventListener('fetch', function (event) {

    // نتعامل فقط مع طلبات GET
    if (event.request.method !== 'GET') {
        return;
    }

    const url = new URL(event.request.url);

    // ========================================================
    // مواقيت الصلاة — الشبكة أولاً ثم الكاش
    // ========================================================
    if (url.hostname === 'api.aladhan.com') {

        event.respondWith(
            fetch(event.request)
                .then(function (response) {

                    if (response && response.ok) {
                        const copy = response.clone();

                        caches.open(CACHE_NAME)
                            .then(function (cache) {
                                cache.put(event.request, copy);
                            });
                    }

                    return response;
                })
                .catch(function () {
                    return caches.match(event.request);
                })
        );

        return;
    }

    // ========================================================
    // باقي ملفات التطبيق
    // Cache First
    // ========================================================
    event.respondWith(

        caches.match(event.request)
            .then(function (cachedResponse) {

                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request)
                    .then(function (networkResponse) {

                        if (
                            networkResponse &&
                            networkResponse.ok &&
                            event.request.url.startsWith(self.location.origin)
                        ) {

                            const copy = networkResponse.clone();

                            caches.open(CACHE_NAME)
                                .then(function (cache) {
                                    cache.put(event.request, copy);
                                });
                        }

                        return networkResponse;
                    })
                    .catch(function () {

                        // إذا كانت صفحة HTML ولم نجدها
                        // نعيد الصفحة الرئيسية
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }

                        return new Response('', {
                            status: 503,
                            statusText: 'Offline'
                        });
                    });
            })
    );
});
