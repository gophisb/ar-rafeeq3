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
    './adhan.mp3'          // ← أُضيف هنا ليأخذ Service Worker النسخة الجديدة
];

/* =========================================================
   3) ملفات البيانات المحلية
   ========================================================= */
const DATA_FILES = [
    './quran-local.json',
    './tafsir-saadi.json'
];

/* =========================================================
   4) الملفات الحساسة للتحديث — Network First
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
        path.endsWith('/app.js') ||
        path.endsWith('/theme.js') ||
        path.endsWith('/style.css') ||
        path.endsWith('/manifest.json') ||
        path.endsWith('/quran-local.json') ||
        path.endsWith('/tafsir-saadi.json') ||
        path.endsWith('/adhan.mp3')   // ← الأذان صار حساسًا للتحديث
    );
}

/* =========================================================
   5) تثبيت الإصدار الجديد
   ========================================================= */
self.addEventListener('install', (event) => {
    console.log('🚀 تثبيت Service Worker:', CACHE_NAME);

    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            // تخزين ملفات التطبيق
            for (const file of APP_FILES) {
                try {
                    const response = await fetch(file, { cache: 'no-store' });
                    if (response && response.ok) {
                        await cache.put(file, response.clone());
                        console.log('✅ تم تخزين:', file);
                    }
                } catch (error) {
                    console.warn('⚠️ تعذر تخزين:', file, error);
                }
            }

            // تخزين ملفات البيانات
            for (const file of DATA_FILES) {
                try {
                    const response = await fetch(file, { cache: 'no-store' });
                    if (response && response.ok) {
                        await cache.put(file, response.clone());
                        console.log('✅ تم تخزين البيانات:', file);
                    }
                } catch (error) {
                    console.warn('⚠️ تعذر تخزين البيانات:', file, error);
                }
            }
        }).then(() => self.skipWaiting())
    );
});

/* =========================================================
   6) تفعيل Service Worker — حذف إصدارات الرفيق القديمة
   ========================================================= */
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName.startsWith('rafeeq-') && cacheName !== CACHE_NAME) {
                        console.log('🗑️ حذف الكاش القديم:', cacheName);
                        return caches.delete(cacheName);
                    }
                    return Promise.resolve();
                })
            );
        }).then(() => self.clients.claim())
    );
});

/* =========================================================
   7) استراتيجية FETCH
   ========================================================= */
self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET') return;

    event.respondWith(
        caches.open(CACHE_NAME).then(async (cache) => {
            // الملفات الحساسة: Network First
            if (isUpdateSensitive(request)) {
                try {
                    const networkResponse = await fetch(request, { cache: 'no-store' });
                    if (networkResponse && networkResponse.ok) {
                        await cache.put(request, networkResponse.clone());
                        console.log('🔄 تم تحديث:', request.url);
                    }
                    return networkResponse;
                } catch (error) {
                    console.warn('📴 الشبكة غير متاحة، استخدام الكاش:', request.url);
                    const cachedResponse = await cache.match(request);
                    if (cachedResponse) return cachedResponse;

                    const filename = new URL(request.url).pathname.split('/').pop();
                    if (filename) {
                        const fallback = await cache.match('./' + filename);
                        if (fallback) return fallback;
                    }
                    throw error;
                }
            }

            // بقية الملفات: Cache First
            const cachedResponse = await cache.match(request);
            if (cachedResponse) return cachedResponse;

            try {
                const networkResponse = await fetch(request);
                if (networkResponse && networkResponse.ok) {
                    await cache.put(request, networkResponse.clone());
                }
                return networkResponse;
            } catch (error) {
                throw error;
            }
        })
    );
});

/* =========================================================
   8) رسائل التطبيق
   ========================================================= */
self.addEventListener('message', (event) => {
    if (!event.data) return;

    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
            })
        );
    }
});

/* =========================================================
   9) رسالة تشخيصية
   ========================================================= */
console.log('🟢 الرفيق — Service Worker v13 يعمل');