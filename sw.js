/* =========================================================
   الرفيق — Service Worker
   الإصدار: v11

   الهدف:
   - تحديث صفحات التطبيق المهمة
   - تحديث qibla.html وعدم إبقائها في الكاش القديم
   - تحديث quran.html و tafsir.html
   - تحديث ملفات القرآن والتفسير
   - العمل بدون إنترنت بعد تحميل الملفات
   - حذف إصدارات الرفيق القديمة من الكاش
   ========================================================= */

'use strict';

const CACHE_NAME = 'rafeeq-v11';


/* =========================================================
   الملفات الأساسية
   ========================================================= */

const APP_FILES = [
    './',
    './index.html',

    './quran.html',
    './tafsir.html',
    './qibla.html',
    './prayer.html',

    './adhkar.html',
    './hisnul.html',
    './arbaeen.html',
    './more.html',

    './style.css',
    './app.js',
    './theme.js',

    './manifest.json',

    './icon-192.png',
    './icon-512.png'
];


/* =========================================================
   ملفات البيانات
   ========================================================= */

const DATA_FILES = [
    './quran-local.json',
    './tafsir-saadi.json'
];


/* =========================================================
   ملفات يجب تحديثها من الشبكة عند توفر الإنترنت
   ========================================================= */

function isUpdateSensitive(request) {

    const url = new URL(request.url);
    const path = url.pathname;

    return (

        path.endsWith('/index.html') ||

        path.endsWith('/quran.html') ||

        path.endsWith('/tafsir.html') ||

        path.endsWith('/qibla.html') ||

        path.endsWith('/prayer.html') ||

        path.endsWith('/quran-local.json') ||

        path.endsWith('/tafsir-saadi.json')

    );
}


/* =========================================================
   INSTALL
   ========================================================= */

self.addEventListener('install', (event) => {

    console.log(
        '🚀 تثبيت Service Worker:',
        CACHE_NAME
    );

    event.waitUntil(

        caches.open(CACHE_NAME)

            .then(async (cache) => {


                /* ---------------------------------------------
                   تخزين ملفات التطبيق
                   ملفًا ملفًا حتى لا يفشل التثبيت كله
                   --------------------------------------------- */

                for (const file of APP_FILES) {

                    try {

                        const response =
                            await fetch(
                                file,
                                {
                                    cache: 'no-store'
                                }
                            );

                        if (
                            response &&
                            response.ok
                        ) {

                            await cache.put(
                                file,
                                response.clone()
                            );

                        }

                    } catch (error) {

                        console.warn(
                            '⚠️ تعذر تخزين ملف:',
                            file
                        );

                    }

                }


                /* ---------------------------------------------
                   تخزين ملفات البيانات
                   --------------------------------------------- */

                for (const file of DATA_FILES) {

                    try {

                        const response =
                            await fetch(
                                file,
                                {
                                    cache: 'no-store'
                                }
                            );

                        if (
                            response &&
                            response.ok
                        ) {

                            await cache.put(
                                file,
                                response.clone()
                            );

                        }

                    } catch (error) {

                        console.warn(
                            '⚠️ تعذر تخزين ملف البيانات:',
                            file
                        );

                    }

                }

            })

            .then(() => {

                /*
                 * تفعيل الإصدار الجديد مباشرة
                 */

                return self.skipWaiting();

            })

    );

});


/* =========================================================
   ACTIVATE
   حذف الكاش القديم
   ========================================================= */

self.addEventListener('activate', (event) => {

    event.waitUntil(

        caches.keys()

            .then((cacheNames) => {

                return Promise.all(

                    cacheNames.map((cacheName) => {

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

                /*
                 * اجعل v11 يتحكم في التطبيق فورًا
                 */

                return self.clients.claim();

            })

    );

});


/* =========================================================
   FETCH
   ========================================================= */

self.addEventListener('fetch', (event) => {

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

        caches.open(CACHE_NAME)

            .then(async (cache) => {


                /* =================================================
                   الملفات الحساسة للتحديث
                   Network First
                   ================================================= */

                if (
                    isUpdateSensitive(request)
                ) {

                    try {

                        /*
                         * نجلب النسخة الجديدة مباشرة
                         * مع منع استخدام HTTP cache
                         */

                        const networkResponse =
                            await fetch(
                                request,
                                {
                                    cache: 'no-store'
                                }
                            );


                        /*
                         * حفظ النسخة الجديدة
                         */

                        if (
                            networkResponse &&
                            networkResponse.ok
                        ) {

                            await cache.put(
                                request,
                                networkResponse.clone()
                            );

                        }


                        return networkResponse;


                    } catch (error) {

                        /*
                         * لا يوجد إنترنت
                         * نستخدم النسخة المحلية
                         */

                        console.warn(
                            '📴 استخدام النسخة المخزنة:',
                            request.url
                        );


                        const cachedResponse =
                            await cache.match(
                                request
                            );


                        if (
                            cachedResponse
                        ) {

                            return cachedResponse;

                        }


                        /*
                         * محاولة باستخدام المسار النسبي
                         */

                        const filename =
                            new URL(
                                request.url
                            ).pathname
                            .split('/')
                            .pop();


                        if (filename) {

                            const fallback =
                                await cache.match(
                                    './' + filename
                                );


                            if (
                                fallback
                            ) {

                                return fallback;

                            }

                        }


                        throw error;

                    }

                }


                /* =================================================
                   بقية الملفات:
                   Cache First
                   ================================================= */

                const cachedResponse =
                    await cache.match(
                        request
                    );


                if (
                    cachedResponse
                ) {

                    return cachedResponse;

                }


                /* =================================================
                   غير موجود في الكاش:
                   نطلبه من الشبكة
                   ================================================= */

                try {

                    const networkResponse =
                        await fetch(
                            request
                        );


                    if (
                        networkResponse &&
                        networkResponse.ok
                    ) {

                        await cache.put(
                            request,
                            networkResponse.clone()
                        );

                    }


                    return networkResponse;


                } catch (error) {

                    throw error;

                }

            })

    );

});


/* =========================================================
   الرسائل الاختيارية من التطبيق
   ========================================================= */

self.addEventListener('message', (event) => {

    if (
        !event.data
    ) {

        return;

    }


    /* ---------------------------------------------------------
       تفعيل النسخة الجديدة
       --------------------------------------------------------- */

    if (
        event.data.type ===
        'SKIP_WAITING'
    ) {

        self.skipWaiting();

    }


    /* ---------------------------------------------------------
       حذف جميع الكاش
       --------------------------------------------------------- */

    if (
        event.data.type ===
        'CLEAR_CACHE'
    ) {

        event.waitUntil(

            caches.keys()

                .then((cacheNames) => {

                    return Promise.all(

                        cacheNames.map(
                            (cacheName) => {

                                return caches.delete(
                                    cacheName
                                );

                            }
                        )

                    );

                })

        );

    }

});


/* =========================================================
   رسالة تشخيصية
   ========================================================= */

console.log(
    '🟢 الرفيق — Service Worker v11 يعمل'
);