/* =========================================================
   الرفيق — Service Worker
   الإصدار: v12
   النسخة المستقرة للقرآن والتفسير
   ========================================================= */

'use strict';

const CACHE_NAME = 'rafeeq-v12';


/* =========================================================
   ملفات التطبيق الأساسية
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
   ملفات القرآن والتفسير
   ========================================================= */

const DATA_FILES = [
    './quran-local.json',
    './tafsir-saadi.json'
];


/* =========================================================
   الملفات التي يجب تحديثها من الشبكة
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

                /* ملفات التطبيق */

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
                            '⚠️ تعذر تخزين:',
                            file,
                            error
                        );

                    }

                }


                /* ملفات البيانات */

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
                            '⚠️ تعذر تخزين البيانات:',
                            file,
                            error
                        );

                    }

                }

            })

            .then(() => {

                return self.skipWaiting();

            })

    );

});


/* =========================================================
   ACTIVATE
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

                return self.clients.claim();

            })

    );

});


/* =========================================================
   FETCH
   ========================================================= */

self.addEventListener('fetch', (event) => {

    const request = event.request;

    if (
        request.method !== 'GET'
    ) {

        return;

    }


    event.respondWith(

        caches.open(CACHE_NAME)

            .then(async (cache) => {


                /* =============================================
                   القرآن والتفسير والصفحات المهمة
                   Network First
                   ============================================= */

                if (
                    isUpdateSensitive(request)
                ) {

                    try {

                        const networkResponse =
                            await fetch(
                                request,
                                {
                                    cache: 'no-store'
                                }
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


                        const filename =
                            new URL(
                                request.url
                            )
                            .pathname
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


                /* =============================================
                   باقي الملفات
                   Cache First
                   ============================================= */

                const cachedResponse =
                    await cache.match(
                        request
                    );


                if (
                    cachedResponse
                ) {

                    return cachedResponse;

                }


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
   الرسائل
   ========================================================= */

self.addEventListener('message', (event) => {

    if (
        !event.data
    ) {

        return;

    }


    if (
        event.data.type ===
        'SKIP_WAITING'
    ) {

        self.skipWaiting();

    }


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


console.log(
    '🟢 الرفيق — Service Worker v12 يعمل'
);