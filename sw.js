/* ============================================================
   الرفيق — sw.js
   FORCE CACHE RESET — الإصدار 3
   ============================================================ */

'use strict';

const CACHE_VERSION = 'rafeeq-v3';
const CACHE_NAME = `${CACHE_VERSION}-app`;

const FILES_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './theme.js',
    './manifest.json',

    './prayer.html',
    './quran.html',
    './adhkar.html',
    './hisnul.html',
    './arbaeen.html',
    './tafsir.html',
    './qibla.html',
    './more.html',

    './quran-local.json',
    './tafsir-saadi.json',

    './icon-192.png',
    './icon-512.png',
    './adhan.mp3'
];


/* ============================================================
   INSTALL
   ============================================================ */

self.addEventListener('install', event => {

    console.log('🚀 تثبيت الرفيق:', CACHE_VERSION);

    event.waitUntil(

        caches.open(CACHE_NAME)

            .then(cache => {

                return cache.addAll(FILES_TO_CACHE);

            })

            .then(() => {

                console.log(
                    '✅ تم تحميل ملفات الواجهة الجديدة'
                );

                /*
                 * تفعيل النسخة الجديدة فورًا
                 */

                return self.skipWaiting();

            })

    );

});


/* ============================================================
   ACTIVATE
   حذف جميع نسخ الرفيق القديمة
   ============================================================ */

self.addEventListener('activate', event => {

    event.waitUntil(

        caches.keys()

            .then(cacheNames => {

                return Promise.all(

                    cacheNames.map(cacheName => {

                        /*
                         * حذف أي كاش قديم للرفيق
                         */

                        if (
                            cacheName.startsWith('rafeeq-') &&
                            cacheName !== CACHE_NAME
                        ) {

                            console.log(
                                '🗑️ حذف الكاش القديم:',
                                cacheName
                            );

                            return caches.delete(
                                cacheName
                            );

                        }

                        return Promise.resolve();

                    })

                );

            })

            .then(() => {

                console.log(
                    '✅ تم تنظيف جميع نسخ الكاش القديمة'
                );

                /*
                 * السيطرة على الصفحات المفتوحة
                 */

                return self.clients.claim();

            })

    );

});


/* ============================================================
   FETCH
   ============================================================ */

self.addEventListener('fetch', event => {

    const request = event.request;

    /*
     * GET فقط
     */

    if (
        request.method !== 'GET'
    ) {

        return;

    }


    event.respondWith(

        caches.match(request)

            .then(cachedResponse => {

                /*
                 * الملف موجود محليًا
                 */

                if (
                    cachedResponse
                ) {

                    return cachedResponse;

                }


                /*
                 * الملف غير موجود
                 * نحاول الإنترنت
                 */

                return fetch(request)

                    .then(response => {

                        /*
                         * لا نخزن الردود غير الصالحة
                         */

                        if (
                            !response ||
                            response.status !== 200
                        ) {

                            return response;

                        }


                        /*
                         * نسخ الرد
                         */

                        const responseClone =
                            response.clone();


                        /*
                         * حفظ الملف
                         */

                        caches.open(CACHE_NAME)

                            .then(cache => {

                                cache.put(
                                    request,
                                    responseClone
                                );

                            });


                        return response;

                    })

                    .catch(() => {

                        /*
                         * إذا انقطع الإنترنت
                         * نعيد الصفحة الرئيسية
                         */

                        if (
                            request.destination === 'document'
                        ) {

                            return caches.match(
                                './index.html'
                            );

                        }


                        /*
                         * البحث عن الملف في الكاش
                         */

                        return caches.match(
                            request
                        );

                    });

            })

    );

});


/* ============================================================
   MESSAGES
   ============================================================ */

self.addEventListener(
    'message',
    event => {

        if (
            !event.data
        ) {

            return;

        }


        /*
         * تحديث فوري
         */

        if (
            event.data.type === 'SKIP_WAITING'
        ) {

            self.skipWaiting();

        }


        /*
         * حذف جميع الكاش
         */

        if (
            event.data.type === 'CLEAR_CACHE'
        ) {

            event.waitUntil(

                caches.keys()

                    .then(cacheNames => {

                        return Promise.all(

                            cacheNames.map(
                                cacheName =>
                                    caches.delete(
                                        cacheName
                                    )
                            )

                        );

                    })

            );

        }

    }
);


/* ============================================================
   READY
   ============================================================ */

console.log(
    '🟢 الرفيق — Service Worker v3 جاهز'
);