/* =========================================================
   الرفيق — Service Worker
   الإصدار: v13

   مبني مباشرة على النسخة المرجعية v12.

   التعديل الوحيد الجوهري:
   - القرآن والتفسير: Cache First
   - الصفحات والبرمجيات: Network First
   - عدم إعادة تنزيل ملفات القرآن والتفسير عند كل فتح
   ========================================================= */

'use strict';


const CACHE_NAME = 'rafeeq-v13';


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
   ملفات البيانات الكبيرة
   مهم:
   هذه الملفات ستكون Cache First
   ========================================================= */

const DATA_FILES = [

    './quran-local.json',
    './tafsir-saadi.json'

];


/* =========================================================
   تحديد ملفات البيانات
   ========================================================= */

function isDataFile(request) {

    const url =
        new URL(request.url);

    const path =
        url.pathname;


    return DATA_FILES.some(

        file =>

            path.endsWith(
                file.replace('./', '/')
            )

    );

}


/* =========================================================
   تحديد الصفحات والبرمجيات
   ========================================================= */

function isUpdateSensitive(request) {

    const url =
        new URL(request.url);

    const path =
        url.pathname;


    return (

        path.endsWith('/') ||

        path.endsWith('/index.html') ||

        path.endsWith('/quran.html') ||

        path.endsWith('/tafsir.html') ||

        path.endsWith('/qibla.html') ||

        path.endsWith('/prayer.html') ||

        path.endsWith('/adhkar.html') ||

        path.endsWith('/hisnul.html') ||

        path.endsWith('/arbaeen.html') ||

        path.endsWith('/more.html') ||

        path.endsWith('/style.css') ||

        path.endsWith('/app.js') ||

        path.endsWith('/theme.js')

    );

}


/* =========================================================
   INSTALL
   ========================================================= */

self.addEventListener(
    'install',
    (event) => {

        console.log(
            '🚀 تثبيت Service Worker:',
            CACHE_NAME
        );


        event.waitUntil(

            caches.open(
                CACHE_NAME
            )

            .then(
                async (cache) => {


                    /* -----------------------------------------
                       ملفات التطبيق
                       ----------------------------------------- */

                    for (
                        const file of APP_FILES
                    ) {

                        try {

                            const response =
                                await fetch(
                                    file,
                                    {
                                        cache:
                                            'no-store'
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


                    /* -----------------------------------------
                       القرآن والتفسير
                       ----------------------------------------- */

                    for (
                        const file of DATA_FILES
                    ) {

                        try {

                            const response =
                                await fetch(
                                    file,
                                    {
                                        cache:
                                            'no-store'
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

                }
            )

            .then(
                () => {

                    return self.skipWaiting();

                }
            )

        );

    }
);


/* =========================================================
   ACTIVATE
   ========================================================= */

self.addEventListener(
    'activate',
    (event) => {

        event.waitUntil(

            caches.keys()

            .then(
                (cacheNames) => {

                    return Promise.all(

                        cacheNames.map(
                            (cacheName) => {

                                if (

                                    cacheName.startsWith(
                                        'rafeeq-'
                                    ) &&

                                    cacheName !==
                                    CACHE_NAME

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

                            }
                        )

                    );

                }
            )

            .then(
                () => {

                    return self.clients.claim();

                }
            )

        );

    }
);


/* =========================================================
   FETCH
   ========================================================= */

self.addEventListener(
    'fetch',
    (event) => {

        const request =
            event.request;


        if (
            request.method !== 'GET'
        ) {

            return;

        }


        event.respondWith(

            caches.open(
                CACHE_NAME
            )

            .then(
                async (cache) => {


                    /* =========================================
                       1) القرآن والتفسير
                       Cache First
                       ========================================= */

                    if (
                        isDataFile(request)
                    ) {

                        const cachedResponse =
                            await cache.match(
                                request
                            );


                        if (
                            cachedResponse
                        ) {

                            console.log(
                                '⚡ من الكاش:',
                                request.url
                            );


                            return cachedResponse;

                        }


                        /*
                         * لا توجد نسخة محلية:
                         * نحمّلها مرة واحدة فقط.
                         */

                        try {

                            const networkResponse =
                                await fetch(
                                    request,
                                    {
                                        cache:
                                            'no-store'
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

                            console.error(
                                '❌ تعذر تحميل ملف البيانات:',
                                request.url
                            );


                            throw error;

                        }

                    }


                    /* =========================================
                       2) الصفحات والبرمجيات
                       Network First
                       ========================================= */

                    if (
                        isUpdateSensitive(request)
                    ) {

                        try {

                            const networkResponse =
                                await fetch(
                                    request,
                                    {
                                        cache:
                                            'no-store'
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
                                '📴 الشبكة غير متاحة، استخدام الكاش:',
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


                            if (
                                filename
                            ) {

                                const fallback =
                                    await cache.match(
                                        './' +
                                        filename
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


                    /* =========================================
                       3) باقي الملفات
                       Cache First
                       ========================================= */

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

                }
            )

        );

    }
);


/* =========================================================
   الرسائل
   ========================================================= */

self.addEventListener(
    'message',
    (event) => {

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

                .then(
                    (cacheNames) => {

                        return Promise.all(

                            cacheNames.map(
                                (cacheName) => {

                                    return caches.delete(
                                        cacheName
                                    );

                                }
                            )

                        );

                    }
                )

            );

        }

    }
);


/* =========================================================
   تشخيص
   ========================================================= */

console.log(
    '🟢 الرفيق — Service Worker v13 يعمل'
);