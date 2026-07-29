/* ============================================================
   الرفيق — sw.js
   الإصدار: 1.0.0

   Service Worker
   - تشغيل التطبيق بدون إنترنت
   - تخزين الملفات الأساسية
   - استراتيجية Cache First للملفات المحلية
   - Network First للبيانات الخارجية
   - تحديث آمن للكاش
   - لا يحذف كاش الإصدارات القديمة إلا بعد تفعيل النسخة الجديدة
   ============================================================ */

'use strict';


/* ============================================================
   1) إعدادات الكاش
   ============================================================ */

const CACHE_NAME = 'rafeeq-v1';

const APP_SHELL = [

    './',

    './index.html',

    './app.js',

    './theme.js',

    './manifest.json',

    './icon-192.png',

    './icon-512.png',

    './adhan.mp3'

];


/* ============================================================
   2) تثبيت Service Worker
   ============================================================ */

self.addEventListener(

    'install',

    event => {

        console.log(
            '⚙️ الرفيق — تثبيت Service Worker:',
            CACHE_NAME
        );


        event.waitUntil(

            caches.open(
                CACHE_NAME
            )

            .then(

                cache => {

                    console.log(
                        '📦 حفظ الملفات الأساسية'
                    );


                    return cache.addAll(
                        APP_SHELL
                    );

                }

            )

            .then(

                () => {

                    /*
                       لا نستخدم skipWaiting()
                       بشكل إجباري حتى لا يتم
                       استبدال نسخة التطبيق أثناء
                       استخدام المستخدم لها.
                    */

                    console.log(
                        '✅ تم تجهيز Service Worker'
                    );

                }

            )

            .catch(

                error => {

                    console.error(
                        '❌ خطأ أثناء حفظ ملفات التطبيق:',
                        error
                    );

                }

            )

        );

    }

);


/* ============================================================
   3) تفعيل Service Worker الجديد
   ============================================================ */

self.addEventListener(

    'activate',

    event => {

        console.log(
            '🚀 الرفيق — تفعيل Service Worker:',
            CACHE_NAME
        );


        event.waitUntil(

            caches.keys()

            .then(

                cacheNames => {

                    return Promise.all(

                        cacheNames

                            .filter(

                                cacheName =>

                                    cacheName.startsWith(
                                        'rafeeq-'
                                    ) &&

                                    cacheName !==
                                        CACHE_NAME

                            )

                            .map(

                                oldCache => {

                                    console.log(
                                        '🗑️ حذف الكاش القديم:',
                                        oldCache
                                    );


                                    return caches.delete(
                                        oldCache
                                    );

                                }

                            )

                    );

                }

            )

            .then(

                () => {

                    console.log(
                        '✅ تم تنظيف الكاش القديم'
                    );

                }

            )

        );

    }

);


/* ============================================================
   4) استقبال طلبات الملفات
   ============================================================ */

self.addEventListener(

    'fetch',

    event => {

        const request =
            event.request;


        /*
           نتعامل فقط مع طلبات GET
        */

        if (
            request.method !==
            'GET'
        ) {

            return;

        }


        const url =
            new URL(
                request.url
            );


        /*
           طلبات API الخارجية
           مثل AlAdhan
           نستخدم معها Network First
        */

        if (
            url.hostname ===
            'api.aladhan.com'
        ) {

            event.respondWith(

                networkFirst(
                    request
                )

            );

            return;

        }


        /*
           الملفات المحلية
           نستخدم معها Cache First
        */

        event.respondWith(

            cacheFirst(
                request
            )

        );

    }

);


/* ============================================================
   5) Cache First
   ============================================================ */

async function cacheFirst(request) {

    try {

        const cachedResponse =
            await caches.match(
                request
            );


        if (
            cachedResponse
        ) {

            return cachedResponse;

        }


        const networkResponse =
            await fetch(
                request
            );


        /*
           حفظ الاستجابة الجديدة
           إذا كانت صالحة
        */

        if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic'
        ) {

            const cache =
                await caches.open(
                    CACHE_NAME
                );


            cache.put(
                request,
                networkResponse.clone()
            );

        }


        return networkResponse;

    } catch (error) {

        console.warn(
            '📴 لا يوجد اتصال بالإنترنت:',
            request.url
        );


        /*
           إذا كان الطلب صفحة HTML
           نحاول إظهار index.html
        */

        if (
            request.destination ===
            'document'
        ) {

            const offlinePage =
                await caches.match(
                    './index.html'
                );


            if (
                offlinePage
            ) {

                return offlinePage;

            }

        }


        /*
           إنشاء استجابة Offline
           عند عدم وجود الملف
        */

        return new Response(

            'لا يوجد اتصال بالإنترنت',

            {

                status: 503,

                headers: {

                    'Content-Type':
                        'text/plain; charset=utf-8'

                }

            }

        );

    }

}


/* ============================================================
   6) Network First
   ============================================================ */

async function networkFirst(request) {

    try {

        const networkResponse =
            await fetch(
                request
            );


        /*
           حفظ أحدث بيانات API
        */

        if (
            networkResponse &&
            networkResponse.ok
        ) {

            const cache =
                await caches.open(
                    CACHE_NAME
                );


            cache.put(

                request,

                networkResponse.clone()

            );

        }


        return networkResponse;

    } catch (error) {

        console.warn(
            '📴 فشل الاتصال بالخادم:',
            request.url
        );


        /*
           عند انقطاع الإنترنت
           نستخدم آخر نسخة محفوظة
        */

        const cachedResponse =
            await caches.match(
                request
            );


        if (
            cachedResponse
        ) {

            return cachedResponse;

        }


        return new Response(

            JSON.stringify({

                offline: true,

                message:
                    'لا يوجد اتصال بالإنترنت'

            }),

            {

                status: 503,

                headers: {

                    'Content-Type':
                        'application/json; charset=utf-8'

                }

            }

        );

    }

}


/* ============================================================
   7) رسالة لتحديث التطبيق يدويًا
   ============================================================ */

self.addEventListener(

    'message',

    event => {

        if (
            event.data &&
            event.data.type ===
                'SKIP_WAITING'
        ) {

            self.skipWaiting();

        }

    }

);


/* ============================================================
   8) التحكم في الصفحات بعد التفعيل
   ============================================================ */

self.addEventListener(

    'activate',

    event => {

        event.waitUntil(

            self.clients.claim()

        );

    }

);


/* ============================================================
   نهاية sw.js
   ============================================================ */

console.log(
    '🚀 الرفيق — sw.js جاهز'
);