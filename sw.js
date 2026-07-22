// sw.js — الرفيق v5 (النسخة النهائية للرفع)
const CACHE_NAME = 'rafeeq3-v5';

const APP_SHELL = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './sw.js',
    './manifest.json',
    './adhan.mp3',
    './icon-192.png',
    './icon-512.png',
    './quran.html',
    './prayer.html',
    './qibla.html',
    './adhkar.html',
    './hisnul.html',
    './arbaeen.html',
    './more.html'
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(APP_SHELL).catch(function (err) {
                console.warn('SW: بعض الملفات لم تخزن', err);
            });
        }).then(function () {
            return self.skipWaiting();
        })
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(
                keys.filter(function (key) { return key !== CACHE_NAME; })
                    .map(function (key) { return caches.delete(key); })
            );
        }).then(function () {
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', function (event) {
    var url = new URL(event.request.url);

    if (url.hostname === 'api.aladhan.com') {
        event.respondWith(
            fetch(event.request).then(function (response) {
                var clone = response.clone();
                caches.open(CACHE_NAME).then(function (cache) {
                    cache.put(event.request, clone);
                });
                return response;
            }).catch(function () {
                return caches.match(event.request);
            })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then(function (cached) {
            return cached || fetch(event.request).then(function (response) {
                return response;
            }).catch(function () {
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
