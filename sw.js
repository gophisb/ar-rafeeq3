/* =========================================================
   الرفيق — Service Worker
   الإصدار: v13

   الهدف:
   - تحديث صفحات التطبيق المهمة
   - تحديث القرآن والتفسير والقبلة
   - تحديث app.js و theme.js و style.css
   - تحديث ملف الأذان adhan.mp3
   - العمل بدون إنترنت بعد تحميل الملفات
   - حذف إصدارات الرفيق القديمة
   ========================================================= */

'use strict';


/* =========================================================
   1) إصدار الكاش
   ========================================================= */

const CACHE_NAME = 'rafeeq-v13';


/* =========================================================
   2) ملفات التطبيق الأساسية
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
    './icon-512.png',

    /*
     * الأذان
     * مهم جدًا: أُضيف هنا حتى يحصل
     * Service Worker على النسخة الجديدة.
     */
    './adhan.mp3'

];


/* =========================================================
   3) ملفات البيانات المحلية
   ========================================================= */

const DATA_FILES = [

    './quran-local.json',
    './tafsir-saadi.json'

];


/* =========================================================
   4) الملفات الحساسة للتحديث
   *
   * Network First
   * أي نسخة جديدة على GitHub تُستخدم أولًا.
   ========================================================= */

function isUpdateSensitive(request) {

    const url =
        new URL(request.url);

    const path =
        url.pathname;


    return (

        path.endsWith('/index.html') ||

        path.endsWith('/quran.html') ||

        path.endsWith('/tafsir.html') ||

        path.endsWith('/qibla.html') ||

        path.endsWith('/prayer.html') ||

        path.endsWith('/app.js') ||

        path.endsWith('/theme.js') ||

        path.endsWith('/style.css') ||

        path.endsWith('/manifest.json') ||

        path.endsWith('/quran-local.json') ||

        path.endsWith('/tafsir-saadi.json') ||

        /*
         * الأهم:
         * ملف الأذان نفسه أصبح حساسًا للتحديث.
         */
        path.endsWith('/adhan.mp3')

    );

}


/* =========================================================
   5) تثبيت الإصدار الجديد
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


                                console.log(
                                    '✅ تم تخزين:',
                                    file
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
                       ملفات البيانات
                       ----------------------------------------- */

                    for (
                        const file of DATA_FILES
                    ) {

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


                                console.log(
                                    '✅ تم تخزين البيانات:',
                                    file
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

                    /*
                     * تفعيل الإصدار الجديد فورًا
                     */
                    return self.skipWaiting();

                }
            )

        );

    }
);


/* =========================================================
   6) تفعيل Service Worker
   *
   * حذف كل إصدارات الرفيق القديمة.
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

                    /*
                     * جعل v13 يتحكم في جميع الصفحات فورًا
                     */
                    return self.clients.claim();

                }
            )

        );

    }
);


/* =========================================================
   7) FETCH
   ========================================================= */

self.addEventListener(
    'fetch',
    (event) => {

        const request =
            event.request;


        /*
         * GET فقط
         */

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


                    /* =================================================
                       الملفات الحساسة للتحديث
                       Network First
                       ================================================= */

                    if (
                        isUpdateSensitive(
                            request
                        )
                    ) {

                        try {

                            /*
                             * طلب مباشر من الشبكة
                             * مع منع الكاش الوسيط.
                             */

                            const networkResponse =
                                await fetch(
                                    request,
                                    {
                                        cache: 'no-store'
                                    }
                                );


                            /*
                             * إذا كانت النسخة صالحة
                             * نخزنها مكان القديمة.
                             */

                            if (
                                networkResponse &&
                                networkResponse.ok
                            ) {

                                await cache.put(
                                    request,
                                    networkResponse.clone()
                                );


                                console.log(
                                    '🔄 تم تحديث:',
                                    request.url
                                );

                            }


                            return networkResponse;


                        } catch (error) {

                            /*
                             * لا يوجد إنترنت:
                             * نستخدم النسخة المحلية.
                             */

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


                            /*
                             * محاولة ثانية بالمسار النسبي.
                             */

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


                    /* =================================================
                       بقية الملفات
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
                       غير موجود في الكاش
                       تحميل من الشبكة
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

                }
            )

        );

    }
);


/* =========================================================
   8) رسائل التطبيق
   ========================================================= */

self.addEventListener(
    'message',
    (event) => {

        if (
            !event.data
        ) {

            return;

        }


        /* -----------------------------------------------------
           تفعيل النسخة الجديدة
           ----------------------------------------------------- */

        if (
            event.data.type ===
            'SKIP_WAITING'
        ) {

            self.skipWaiting();

        }


        /* -----------------------------------------------------
           حذف جميع الكاش
           ----------------------------------------------------- */

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
   9) رسالة تشخيصية
   ========================================================= */

console.log(
    '🟢 الرفيق — Service Worker v13 يعمل'
);