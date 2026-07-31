/* =========================================================
   الرفيق — Service Worker
   الإصدار: v14

   أهداف هذه النسخة:
   - فتح التطبيق بأسرع وقت ممكن
   - عدم تحميل القرآن والتفسير أثناء تثبيت SW
   - القرآن والتفسير: Runtime Cache First
   - صفحات التطبيق: Stale While Revalidate
   - الأذان: يمر مباشرة للمتصفح دون اعتراض SW
   - الطلبات الخارجية: لا يتدخل فيها SW
   - دعم Offline بعد زيارة الصفحة/البيانات مرة واحدة
   - حذف الكاش القديم تلقائيًا
   ========================================================= */

'use strict';


/* =========================================================
   1) إصدار الكاش
   ========================================================= */

const CACHE_NAME = 'rafeeq-v14';


/* =========================================================
   2) Shell صغير جدًا
   *
   * هذه الملفات فقط تُخزَّن أثناء INSTALL.
   *
   * لا نضع هنا:
   * - quran-local.json
   * - tafsir-saadi.json
   * - adhan.mp3
   * - صفحات فرعية كثيرة
   *
   * حتى لا يكون تثبيت Service Worker ثقيلًا.
   * ========================================================= */

const SHELL_FILES = [

    './',
    './index.html',

    './style.css',
    './app.js',
    './theme.js',

    './manifest.json',

    './icon-192.png',
    './icon-512.png'

];


/* =========================================================
   3) ملفات البيانات الكبيرة
   *
   * تُخزَّن فقط عند طلبها.
   * ثم تصبح Offline / Cache First.
   * ========================================================= */

const DATA_FILES = [

    './quran-local.json',
    './tafsir-saadi.json',
    './arbaeen-data.json'

];


/* =========================================================
   4) صفحات التطبيق
   *
   * تُخزَّن عند زيارتها.
   * وتستخدم Stale-While-Revalidate.
   * ========================================================= */

const APP_PAGES = [

    './index.html',
    './quran.html',
    './tafsir.html',
    './qibla.html',
    './prayer.html',
    './adhkar.html',
    './hisnul.html',
    './arbaeen.html',
    './more.html'

];


/* =========================================================
   5) ملفات البرمجة والأصول
   ========================================================= */

const APP_ASSETS = [

    './style.css',
    './app.js',
    './theme.js',
    './manifest.json'

];


/* =========================================================
   6) أدوات URL
   ========================================================= */

function getPath(request) {

    return new URL(
        request.url
    ).pathname;

}


function getFileName(request) {

    const path =
        getPath(request);

    return path
        .split('/')
        .pop();

}


/* =========================================================
   7) التأكد أن الطلب من نفس المشروع
   *
   * لا نتدخل في:
   * - Google Fonts
   * - AlAdhan API
   * - أي مصدر خارجي
   * ========================================================= */

function isSameOrigin(request) {

    const url =
        new URL(
            request.url
        );

    return (
        url.origin ===
        self.location.origin
    );

}


/* =========================================================
   8) التحقق من ملف بيانات
   ========================================================= */

function isDataFile(request) {

    const path =
        getPath(request);


    return DATA_FILES.some(
        file =>
            path.endsWith(
                file.replace(
                    './',
                    '/'
                )
            )
    );

}


/* =========================================================
   9) التحقق من صفحة
   ========================================================= */

function isAppPage(request) {

    const path =
        getPath(request);


    return APP_PAGES.some(
        file =>
            path.endsWith(
                file.replace(
                    './',
                    '/'
                )
            )
    );

}


/* =========================================================
   10) التحقق من أصول التطبيق
   ========================================================= */

function isAppAsset(request) {

    const path =
        getPath(request);


    return APP_ASSETS.some(
        file =>
            path.endsWith(
                file.replace(
                    './',
                    '/'
                )
            )
    );

}


/* =========================================================
   11) التحقق من ملف الأذان
   *
   * مهم:
   * نترك adhan.mp3 يمر إلى المتصفح مباشرة.
   *
   * لا Cache.put
   * لا Cache.match
   * لا Range processing
   *
   * حتى لا يتدخل Service Worker في تشغيل الصوت.
   * ========================================================= */

function isAdhanFile(request) {

    const path =
        getPath(request);


    return path.endsWith(
        '/adhan.mp3'
    );

}


/* =========================================================
   12) INSTALL
   *
   * تثبيت Shell صغير فقط.
   * ========================================================= */

self.addEventListener(
    'install',
    event => {

        console.log(
            '🚀 تثبيت الرفيق Service Worker:',
            CACHE_NAME
        );


        event.waitUntil(

            caches.open(
                CACHE_NAME
            )

            .then(
                async cache => {

                    /*
                     * لا نسمح بفشل ملف واحد
                     * بإيقاف التثبيت كله.
                     */

                    for (
                        const file
                        of SHELL_FILES
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
                                '⚠️ تعذر تثبيت:',
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
                     * تفعيل النسخة الجديدة مباشرة.
                     */

                    return self.skipWaiting();

                }
            )

        );

    }
);


/* =========================================================
   13) ACTIVATE
   ========================================================= */

self.addEventListener(
    'activate',
    event => {

        event.waitUntil(

            caches.keys()

            .then(
                cacheNames => {

                    return Promise.all(

                        cacheNames.map(
                            cacheName => {

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
                     * السيطرة على الصفحات الحالية.
                     */

                    return self.clients.claim();

                }
            )

        );

    }
);


/* =========================================================
   14) جلب ملف من الشبكة وتخزينه
   ========================================================= */

async function fetchAndCache(
    request,
    cache
) {

    const response =
        await fetch(
            request,
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
            request,
            response.clone()
        );

    }


    return response;

}


/* =========================================================
   15) استراتيجية Cache First
   *
   * للقرآن والتفسير والبيانات.
   *
   * سريع جدًا بعد أول تحميل.
   * ========================================================= */

async function cacheFirst(
    request,
    cache
) {

    const cached =
        await cache.match(
            request
        );


    if (
        cached
    ) {

        console.log(
            '⚡ Cache First:',
            request.url
        );


        return cached;

    }


    try {

        const response =
            await fetchAndCache(
                request,
                cache
            );


        return response;

    } catch (error) {

        console.error(
            '❌ تعذر تحميل:',
            request.url,
            error
        );


        throw error;

    }

}


/* =========================================================
   16) استراتيجية Stale-While-Revalidate
   *
   * يعيد الكاش فورًا.
   * ثم يحدّثه في الخلفية.
   *
   * هذه هي الاستراتيجية المناسبة
   * للصفحات الصغيرة والملفات البرمجية.
   * ========================================================= */

async function staleWhileRevalidate(
    request,
    cache,
    event
) {

    const cached =
        await cache.match(
            request
        );


    /*
     * بدأنا التحديث في الخلفية
     * بدون تعطيل المستخدم.
     */

    const updatePromise =

        fetch(
            request,
            {
                cache:
                    'no-store'
            }
        )

        .then(
            async response => {

                if (
                    response &&
                    response.ok
                ) {

                    await cache.put(
                        request,
                        response.clone()
                    );

                }


                return response;

            }
        )

        .catch(
            error => {

                console.warn(
                    '📴 تعذر تحديث:',
                    request.url
                );


                return null;

            }
        );


    /*
     * إذا كانت النسخة المحلية موجودة،
     * اعرضها فورًا.
     */

    if (
        cached
    ) {

        event.waitUntil(
            updatePromise
        );


        console.log(
            '⚡ عرض فوري + تحديث خلفي:',
            request.url
        );


        return cached;

    }


    /*
     * لا توجد نسخة محلية:
     * في هذه الحالة ننتظر الشبكة.
     */

    const response =
        await updatePromise;


    if (
        response
    ) {

        return response;

    }


    /*
     * محاولة أخيرة للكاش.
     */

    const fallback =
        await cache.match(
            request
        );


    if (
        fallback
    ) {

        return fallback;

    }


    throw new Error(
        'فشل تحميل المورد: ' +
        request.url
    );

}


/* =========================================================
   17) FETCH
   ========================================================= */

self.addEventListener(
    'fetch',
    event => {

        const request =
            event.request;


        /*
         * GET فقط.
         */

        if (
            request.method !==
            'GET'
        ) {

            return;

        }


        /*
         * لا نتدخل في المواقع الخارجية.
         *
         * هذا مهم جدًا للمصادر الخارجية:
         * Google Fonts
         * AlAdhan API
         * وغيرها.
         */

        if (
            !isSameOrigin(
                request
            )
        ) {

            return;

        }


        /*
         * الأذان:
         * مرره مباشرة إلى المتصفح.
         *
         * لا نضعه في Cache API.
         */

        if (
            isAdhanFile(
                request
            )
        ) {

            event.respondWith(
                fetch(
                    request
                )
            );

            return;

        }


        event.respondWith(

            caches.open(
                CACHE_NAME
            )

            .then(
                async cache => {


                    /* =========================================
                       1) القرآن والتفسير والبيانات
                       Cache First
                       ========================================= */

                    if (
                        isDataFile(
                            request
                        )
                    ) {

                        return cacheFirst(
                            request,
                            cache
                        );

                    }


                    /* =========================================
                       2) صفحات التطبيق
                       Stale While Revalidate
                       ========================================= */

                    if (
                        isAppPage(
                            request
                        )
                    ) {

                        return staleWhileRevalidate(
                            request,
                            cache,
                            event
                        );

                    }


                    /* =========================================
                       3) CSS / JS / manifest
                       Stale While Revalidate
                       ========================================= */

                    if (
                        isAppAsset(
                            request
                        )
                    ) {

                        return staleWhileRevalidate(
                            request,
                            cache,
                            event
                        );

                    }


                    /* =========================================
                       4) باقي موارد نفس الأصل
                       Cache First
                       ========================================= */

                    const cached =
                        await cache.match(
                            request
                        );


                    if (
                        cached
                    ) {

                        return cached;

                    }


                    try {

                        return await fetchAndCache(
                            request,
                            cache
                        );

                    } catch (error) {

                        throw error;

                    }

                }
            )

        );

    }
);


/* =========================================================
   18) الرسائل
   ========================================================= */

self.addEventListener(
    'message',
    event => {

        if (
            !event.data
        ) {

            return;

        }


        /* ---------------------------------------------
           تفعيل SW الجديد فورًا
           --------------------------------------------- */

        if (
            event.data.type ===
            'SKIP_WAITING'
        ) {

            self.skipWaiting();

        }


        /* ---------------------------------------------
           حذف الكاش
           --------------------------------------------- */

        if (
            event.data.type ===
            'CLEAR_CACHE'
        ) {

            event.waitUntil(

                caches.keys()

                .then(
                    cacheNames => {

                        return Promise.all(

                            cacheNames.map(
                                cacheName => {

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
   19) تشخيص
   ========================================================= */

console.log(
    '🟢 الرفيق — Service Worker v14 جاهز'
);