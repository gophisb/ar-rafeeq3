// sw.js — الرفيق 3
const CACHE_NAME = 'rafeeq3-v1';
const TAFSIR_CACHE = 'rafeeq3-tafsir-v1';

const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './theme.js',
  './app.js',
  './manifest.json',
  './quran.html',
  './quran-local.json',
  './arbaeen.html',
  './arbaeen-data.json',
  './adhkar.html',
  './hisnul.html',
  './qibla.html',
  './prayer.html',
  './more.html',
  './adhan.mp3',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) =>
        Promise.allSettled(
          APP_SHELL.map((url) => cache.add(url).catch((err) => {
            console.warn('[SW] تعذّر تخزين ' + url, err);
          }))
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME && k !== TAFSIR_CACHE).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isPrayerApi = url.hostname === 'api.aladhan.com';

  if (isSameOrigin) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((cached) => {
            if (cached) return cached;
            if (event.request.mode === 'navigate') return caches.match('./index.html');
            return Response.error();
          })
        )
    );
    return;
  }

  if (isPrayerApi) {
    // مواقيت الصلاة: شبكة أولاً، مع تخزين النتيجة (يستخدمها التطبيق لاحقاً عبر localStorage أيضاً)
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // أي طلب خارجي آخر (خطوط، مكتبة lunr.js): كاش أولاً
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
