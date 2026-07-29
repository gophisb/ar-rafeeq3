/* ============================================================
   الرفيق — sw.js
   Service Worker
   الإصدار: 1.0.0

   الوظائف:
   - تشغيل التطبيق بدون إنترنت
   - تخزين ملفات التطبيق
   - تخزين ملفات القرآن والتفسير والأذكار
   - تحديث آمن للكاش
   - عدم حذف الكاش القديم قبل نجاح الكاش الجديد
   ============================================================ */

'use strict';

/* ============================================================
   1) إعدادات الكاش
   ============================================================ */

const CACHE_VERSION = 'rafeeq-v1';
const APP_CACHE = `${CACHE_VERSION}-app`;
const DATA_CACHE = `${CACHE_VERSION}-data`;

/* ============================================================
   2) ملفات التطبيق الأساسية
   ============================================================ */

const APP_FILES = [
    './',
    './index.html',
    './manifest.json',
    './app.js',
    './theme.js',
    './prayer.html',
    './quran.html',
    './adhkar.html',
    './hisnul.html',
    './arbaeen.html',
    './tafsir.html',
    './qibla.html',
    './more.html',
    './icon-192.png',
    './icon-512.png',
    './adhan.mp3'
];

/* ============================================================
   3) ملفات البيانات المحلية
   ============================================================ */

const DATA_FILES = [
    './quran-local.json',
    './tafsir-saadi.json'
];

/* ============================================================
   4) تثبيت Service Worker
   ============================================================ */

self.addEventListener('install', event => {
    console.log('📦 الرفيق: بدء تثبيت Service Worker', CACHE_VERSION);

    event.waitUntil(
        Promise.all([
            caches.open(APP_CACHE).then(cache => {
                return cache.addAll(APP_FILES);
            }),
            caches.open(DATA_CACHE).then(cache => {
                return cache.addAll(DATA_FILES);
            })
        ])
        .then(() => {
            console.log('✅ تم تخزين ملفات الرفيق بنجاح');
            /* لا نستخدم skipWaiting() بشكل إجباري حتى لا يتم تبديل نسخة التطبيق فجأة أثناء الاستخدام. */
        })
        .catch(error => {
            console.error('❌ فشل تثبيت ملفات الرفيق:', error);
            throw error;
        })
    );
});

/* ============================================================
   5) تفعيل Service Worker
   ============================================================ */

self.addEventListener('activate', event => {
    console.log('🔄 الرفيق: تفعيل Service Worker');

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(cacheName => {
                        return (
                            cacheName.startsWith('rafeeq-') &&
                            cacheName !== APP_CACHE &&
                            cacheName !== DATA_CACHE
                        );
                    })
                    .map(oldCache => {
                        console.log('🗑️ حذف كاش قديم:', oldCache);
                        return caches.delete(oldCache);
                    })
            );
        })
        .then(() => {
            console.log('✅ تم تنظيف الإصدارات القديمة');
            /* السماح للصفحات المفتوحة باستخدام Service Worker الجديد. */
            return self.clients.claim();
        })
    );
});

/* ============================================================
   6) استراتيجية جلب الملفات
   ============================================================ */

self.addEventListener('fetch', event => {
    const request = event.request;

    /* نتعامل فقط مع طلبات GET */
    if (request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(request).then(cachedResponse => {
            /* إذا وجد الملف في الكاش نعيده فورًا. */
            if (cachedResponse) {
                return cachedResponse;
            }

            /* إذا لم يوجد في الكاش نحاول تحميله من الإنترنت. */
            return fetch(request)
                .then(networkResponse => {
                    /* التأكد من أن الرد صالح */
                    if (
                        !networkResponse ||
                        networkResponse.status !== 200 ||
                        networkResponse.type === 'opaque'
                    ) {
                        return networkResponse;
                    }

                    /* نسخ الرد قبل تخزينه */
                    const responseClone = networkResponse.clone();

                    /* تحديد نوع الكاش */
                    const requestURL = new URL(request.url);
                    const isDataFile = requestURL.pathname.endsWith('.json');
                    const cacheName = isDataFile ? DATA_CACHE : APP_CACHE;

                    caches.open(cacheName).then(cache => {
                        cache.put(request, responseClone);
                    });

                    return networkResponse;
                })
                .catch(error => {
                    console.warn('⚠️ لا يوجد اتصال بالإنترنت:', request.url);

                    /* إذا كانت الصفحة HTML ولم نستطع تحميلها نعيد الصفحة الرئيسية. */
                    if (request.destination === 'document') {
                        return caches.match('./index.html');
                    }

                    /* للملفات الأخرى نترك المتصفح يتعامل مع الخطأ. */
                    throw error;
                });
        })
    );
});

/* ============================================================
   7) استقبال أوامر من التطبيق
   ============================================================ */

self.addEventListener('message', event => {
    if (!event.data) {
        return;
    }

    /* طلب تحديث Service Worker */
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    /* طلب تنظيف الكاش يدويًا */
    if (event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name.startsWith('rafeeq-'))
                        .map(name => caches.delete(name))
                );
            })
        );
    }
});

/* ============================================================
   8) نهاية Service Worker
   ============================================================ */

console.log('🚀 الرفيق — Service Worker جاهز:', CACHE_VERSION);