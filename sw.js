/* =========================================================
   الرفيق — Service Worker
   الإصدار: v14

   النسخة المرجعية مبنية على sw.js الأصلي الذي أرسله المستخدم.

   الإصلاحات:
   - القرآن والتفسير: Cache First
   - الأربعون: Cache First
   - الأذان: Cache First مع دعم Range Requests
   - الصفحات والبرمجيات: Network First
   - حذف إصدارات الكاش القديمة
   ========================================================= */

'use strict';


/* =========================================================
   1) إصدار الكاش
   ========================================================= */

const CACHE_NAME = 'rafeeq-v14';


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
    './icon-512.png'
];


/* =========================================================
   3) ملفات البيانات الثابتة
   ========================================================= */

const DATA_FILES = [
    './quran-local.json',
    './tafsir-saadi.json',
    './arbaeen-data.json'
];


/* =========================================================
   4) ملف الأذان
   *
   * منفصل عن DATA_FILES لأن الصوت يحتاج معالجة
   * خاصة لطلبات Range.
   ========================================================= */

const AUDIO_FILES = [
    './adhan.mp3'
];


/* =========================================================
   5) الصفحات والبرمجيات التي تحتاج تحديثًا
   ========================================================= */

function isUpdateSensitivePage(request) {

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

        path.endsWith('/app.js') ||

        path.endsWith('/style.css') ||

        path.endsWith('/theme.js')

    );

}


/* =========================================================
   6) معرفة هل الطلب ملف بيانات
   ========================================================= */

function isDataFile(request) {

    const path =
        new URL(request.url).pathname;


    return DATA_FILES.some(
        file =>
            path.endsWith(
                file.replace('./', '/')
            )
    );

}


/* =========================================================
   7) معرفة هل الطلب ملف الأذان
   ========================================================= */

function isAudioFile(request) {

    const path =
        new URL(request.url).pathname;


    return AUDIO_FILES.some(
        file =>
            path.endsWith(
                file.replace('./', '/')
            )
    );

}


/* =========================================================
   8) قراءة Range Header
   ========================================================= */

function parseRangeHeader(
    range,
    totalLength
) {

    if (
        !range ||
        !range.startsWith('bytes=')
    ) {

        return null;

    }


    const value =
        range
            .replace('bytes=', '')
            .split(',')[0]
            .trim();


    const parts =
        value.split('-');


    let start =
        Number(parts[0]);


    let end =
        parts[1] === ''
            ? totalLength - 1
            : Number(parts[1]);


    /*
     * bytes=-500
     * يعني آخر 500 بايت.
     */

    if (
        parts[0] === ''
    ) {

        const suffixLength =
            Number(parts[1]);


        if (
            !Number.isFinite(
                suffixLength
            )
        ) {

            return null;

        }


        start =
            Math.max(
                0,
                totalLength - suffixLength
            );

        end =
            totalLength - 1;

    }


    if (
        !Number.isFinite(start) ||
        !Number.isFinite(end)
    ) {

        return null;

    }


    start =
        Math.max(
            0,
            Math.floor(start)
        );

    end =
        Math.min(
            totalLength - 1,
            Math.floor(end)
        );


    if (
        start > end ||
        start >= totalLength
    ) {

        return null;

    }


    return {
        start,
        end
    };

}


/* =========================================================
   9) خدمة ملف الأذان مع دعم Range
   ========================================================= */

async function serveAudio(
    request,
    cache
) {

    /*
     * نحاول استخدام النسخة المحلية أولًا.
     */

    let cachedResponse =
        await cache.match(
            request
        );


    /*
     * طلب Range لن يجد تطابقًا مباشرًا عادةً،
     * لذلك نبحث عن النسخة الأصلية بدون Range.
     */

    if (
        !cachedResponse &&
        request.headers.has('range')
    ) {

        cachedResponse =
            await cache.match(
                AUDIO_FILES[0]
            );

    }


    /*
     * لا توجد نسخة محلية:
     * نجلب الملف من الشبكة.
     */

    if (
        !cachedResponse
    ) {

        try {

            const networkResponse =
                await fetch(
                    request
                );


            if (
                networkResponse &&
                networkResponse.ok &&
                !request.headers.has('range')
            ) {

                await cache.put(
                    AUDIO_FILES[0],
                    networkResponse.clone()
                );

            }


            return networkResponse;

        } catch (error) {

            console.warn(
                '❌ تعذر تحميل الأذان:',
                error
            );

            throw error;

        }

    }


    /*
     * إذا لم يكن الطلب Range،
     * نعيد الملف الكامل.
     */

    const rangeHeader =
        request.headers.get(
            'range'
        );


    if (
        !rangeHeader
    ) {

        return cachedResponse;

    }


    /*
     * تحويل الاستجابة إلى ArrayBuffer.
     */

    const buffer =
        await cachedResponse.arrayBuffer();


    const totalLength =
        buffer.byteLength;


    const range =
        parseRangeHeader(
            rangeHeader,
            totalLength
        );


    /*
     * Range غير صالح.
     */

    if (
        !range
    ) {

        return new Response(
            null,
            {
                status: 416,
                headers: {
                    'Content-Range':
                        `bytes */${totalLength}`
                }
            }
        );

    }


    /*
     * استخراج الجزء المطلوب.
     */

    const chunk =
        buffer.slice(
            range.start,
            range.end + 1
        );


    const headers =
        new Headers();


    /*
     * الاحتفاظ بنوع الملف.
     */

    const contentType =
        cachedResponse.headers.get(
            'Content-Type'
        );


    if (
        contentType
    ) {

        headers.set(
            'Content-Type',
            contentType
        );

    } else {

        headers.set(
            'Content-Type',
            'audio/mpeg'
        );

    }


    headers.set(
        'Accept-Ranges',
        'bytes'
    );


    headers.set(
        'Content-Length',
        String(
            chunk.byteLength
        )
    );


    headers.set(
        'Content-Range',

        `bytes ${range.start}-${range.end}/${totalLength}`

    );


    headers.set(
        'Cache-Control',
        'public, max-age=31536000'
    );


    return new Response(
        chunk,
        {
            status: 206,
            statusText: 'Partial Content',
            headers
        }
    );

}


/* =========================================================
   10) INSTALL
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
                       ملفات القرآن والتفسير
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


                    /* -----------------------------------------
                       الأذان
                       ----------------------------------------- */

                    for (
                        const file of AUDIO_FILES
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

                                /*
                                 * نخزن النسخة الكاملة،
                                 * وليس استجابة Range.
                                 */

                                await cache.put(
                                    file,
                                    response.clone()
                                );

                                console.log(
                                    '🔊 تم تخزين ملف الأذان'
                                );

                            }

                        } catch (error) {

                            console.warn(
                                '⚠️ تعذر تخزين الأذان:',
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
   11) ACTIVATE
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
   12) FETCH
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
            request.method !==
            'GET'
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
                       أولاً: الأذان
                       ========================================= */

                    if (
                        isAudioFile(
                            request
                        )
                    ) {

                        return serveAudio(
                            request,
                            cache
                        );

                    }


                    /* =========================================
                       ثانيًا: القرآن والتفسير والبيانات
                       Cache First
                       ========================================= */

                    if (
                        isDataFile(
                            request
                        )
                    ) {

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


                    /* =========================================
                       ثالثًا: الصفحات والبرمجيات
                       Network First
                       ========================================= */

                    if (
                        isUpdateSensitivePage(
                            request
                        )
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
                       رابعًا: أي طلب آخر
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
   13) الرسائل
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
   14) رسالة تشخيصية
   ========================================================= */

console.log(
    '🟢 الرفيق — Service Worker v14 يعمل'
);