/* =========================================================
   الرفيق — Service Worker
   الإصدار: 10
   الهدف:
   - تحديث quran.html و tafsir.html وملفات JSON
   - حذف الكاش القديم
   - دعم العمل بدون إنترنت
   - عدم فشل تثبيت Service Worker بسبب ملف كبير
   ========================================================= */

'use strict';

const CACHE_NAME = 'rafeeq-v10';

/* ---------------------------------------------------------
   الملفات الأساسية التي يمكن تخزينها في الكاش
   --------------------------------------------------------- */
const APP_FILES = [
    './',
    './index.html',
    './quran.html',
    './tafsir.html',
    './adhkar.html',
    './hisnul.html',
    './arbaeen.html',
    './prayer.html',
    './qibla.html',
    './more.html',
    './style.css',
    './theme.js',
    './app.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

/* ---------------------------------------------------------
   ملفات البيانات
   يتم تحديثها عند الاتصال بالإنترنت ثم تحفظ للعمل بدون إنترنت
   --------------------------------------------------------- */
const DATA_FILES = [
    './quran-local.json',
    './tafsir-saadi.json'
];


/* =========================================================
   INSTALL
   ========================================================= */

self.addEventListener('install', (event) => {

    console.log('🚀 تثبيت الرفيق:', CACHE_NAME);

    event.waitUntil(

        caches.open(CACHE_NAME)

            .then(async (cache) => {

                /*
                 * نستخدم ملفًا ملفًا حتى لا يفشل التثبيت كله
                 * إذا تعذر تحميل أحد الملفات.
                 */

                for (const file of APP_FILES) {

                    try {

                        const response = await fetch(file, {
                            cache: 'no-store'
                        });

                        if (response.ok) {
                            await cache.put(file, response.clone());
                        }

                    } catch (error) {

                        console.warn(
                            '⚠️ تعذر تخزين:',
                            file
                        );

                    }

                }

                /*
                 * نحاول أيضًا تخزين ملفات البيانات الكبيرة،
                 * لكن فشلها لا يمنع تثبيت Service Worker.
                 */

                for (const file of DATA_FILES) {

                    try {

                        const response = await fetch(file, {
                            cache: 'no-store'
                        });

                        if (response.ok) {
                            await cache.put(file, response.clone());
                        }

                    } catch (error) {

                        console.warn(
                            '⚠️ تعذر تخزين ملف البيانات:',
                            file
                        );

                    }

                }

            })

            .finally(() => {

                /*
                 * تفعيل النسخة الجديدة مباشرة
                 */

                return self.skipWaiting();

            })

    );

});


/* =========================================================
   ACTIVATE
   حذف جميع إصدارات الكاش القديمة
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

                            return caches.delete(cacheName);

                        }

                        return Promise.resolve();

                    })

                );

            })

            .then(() => {

                /*
                 * يجعل النسخة الجديدة تتحكم في التطبيق فورًا
                 */

                return self.clients.claim();

            })

    );

});


/* =========================================================
   تحديد الملفات التي يجب تحديثها دائمًا عند وجود إنترنت
   ========================================================= */

function isImportantFile(request) {

    const url = new URL(request.url);

    const path = url.pathname;

    return (

        path.endsWith('/quran.html') ||

        path.endsWith('/tafsir.html') ||

        path.endsWith('/index.html') ||

        path.endsWith('/quran-local.json') ||

        path.endsWith('/tafsir-saadi.json')

    );

}


/* =========================================================
   FETCH
   ========================================================= */

self.addEventListener('fetch', (event) => {

    const request = event.request;

    /*
     * نهتم بطلبات GET فقط
     */

    if (request.method !== 'GET') {
        return;
    }


    event.respondWith(

        caches.open(CACHE_NAME)

            .then(async (cache) => {


                /* ------------------------------------------------
                   1. الملفات المهمة:
                   Network First
                   ------------------------------------------------ */

                if (isImportantFile(request)) {

                    try {

                        const networkResponse = await fetch(
                            request,
                            {
                                cache: 'no-store'
                            }
                        );

                        /*
                         * إذا نجح الاتصال نحفظ النسخة الجديدة
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

                        console.warn(
                            '📴 لا يوجد اتصال، استخدام الكاش:',
                            request.url
                        );

                        /*
                         * عند عدم وجود الإنترنت:
                         * استخدم النسخة المحلية
                         */

                        const cachedResponse =
                            await cache.match(request);

                        if (cachedResponse) {

                            return cachedResponse;

                        }

                        /*
                         * إذا لم توجد النسخة:
                         * نحاول البحث بالمسار النسبي
                         */

                        const relativePath =
                            './' +
                            request.url.split('/').pop();

                        const fallback =
                            await cache.match(relativePath);

                        if (fallback) {

                            return fallback;

                        }

                        throw error;

                    }

                }


                /* ------------------------------------------------
                   2. بقية الملفات:
                   Cache First
                   ------------------------------------------------ */

                const cachedResponse =
                    await cache.match(request);

                if (cachedResponse) {

                    return cachedResponse;

                }


                /* ------------------------------------------------
                   3. الملف غير موجود في الكاش:
                   نطلبه من الإنترنت
                   ------------------------------------------------ */

                try {

                    const networkResponse =
                        await fetch(request);

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
   استقبال أوامر من التطبيق
   ========================================================= */

self.addEventListener('message', (event) => {

    if (!event.data) {
        return;
    }


    /* ---------------------------------------------
       تفعيل النسخة الجديدة فورًا
       --------------------------------------------- */

    if (
        event.data.type === 'SKIP_WAITING'
    ) {

        self.skipWaiting();

    }


    /* ---------------------------------------------
       مسح جميع الكاشات
       --------------------------------------------- */

    if (
        event.data.type === 'CLEAR_CACHE'
    ) {

        event.waitUntil(

            caches.keys()

                .then((cacheNames) => {

                    return Promise.all(

                        cacheNames.map((cacheName) => {

                            return caches.delete(
                                cacheName
                            );

                        })

                    );

                })

        );

    }

});


console.log(
    '🟢 الرفيق — Service Worker v10 يعمل بنجاح'
);