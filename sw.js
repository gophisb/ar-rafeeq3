/* =========================================================
   الرفيق — Service Worker
   الإصدار: v13
   إصلاح: القرآن والتفسير الآن Cache First (كانا يُعاد تحميلهما
   من الشبكة في كل فتح صفحة، وهذا كان سبب الثقل والبطء)
   ========================================================= */

'use strict';

const CACHE_NAME = 'rafeeq-v13';

/* =========================================================
   ملفات التطبيق الأساسية (صفحات + برمجيات — خفيفة الحجم)
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
   ملفات البيانات الثابتة الكبيرة — لا تتغيّر أبداً بعد النشر،
   لذا تُخزَّن Cache First حصرياً (لا تُعاد من الشبكة أبداً
   طالما موجودة محلياً — هذا هو الإصلاح الجوهري)
   ========================================================= */
const DATA_FILES = [
    './quran-local.json',
    './tafsir-saadi.json',
    './arbaeen-data.json',
    './adhan.mp3'
];

/* =========================================================
   الصفحات فقط (وليس ملفات البيانات) تُحدَّث من الشبكة أولاً
   لضمان وصول أي تعديل برمجي جديد بسرعة — حجمها صغير فلا يُبطئ شيئاً
   ========================================================= */
function isUpdateSensitivePage(request) {
    const url = new URL(request.url);
    const path = url.pathname;
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
   INSTALL
   ========================================================= */
self.addEventListener('install', (event) => {
    console.log('🚀 تثبيت Service Worker:', CACHE_NAME);

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async (cache) => {

                for (const file of APP_FILES) {
                    try {
                        const response = await fetch(file, { cache: 'no-store' });
                        if (response && response.ok) {
                            await cache.put(file, response.clone());
                        }
                    } catch (error) {
                        console.warn('⚠️ تعذر تخزين:', file, error);
                    }
                }

                for (const file of DATA_FILES) {
                    try {
                        const response = await fetch(file, { cache: 'no-store' });
                        if (response && response.ok) {
                            await cache.put(file, response.clone());
                        }
                    } catch (error) {
                        console.warn('⚠️ تعذر تخزين البيانات:', file, error);
                    }
                }

            })
            .then(() => self.skipWaiting())
    );
});

/* =========================================================
   ACTIVATE
   ========================================================= */
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) =>
                Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName.startsWith('rafeeq-') && cacheName !== CACHE_NAME) {
                            console.log('🗑️ حذف الكاش القديم:', cacheName);
                            return caches.delete(cacheName);
                        }
                        return Promise.resolve();
                    })
                )
            )
            .then(() => self.clients.claim())
    );
});

/* =========================================================
   FETCH
   ========================================================= */
self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET') return;

    event.respondWith(
        caches.open(CACHE_NAME).then(async (cache) => {

            /* =============================================
               1) ملفات البيانات الكبيرة (القرآن، التفسير،
               الأربعين، الأذان) — Cache First دائماً.
               لا تُطلب من الشبكة إطلاقاً إن كانت مخزَّنة محلياً.
               ============================================= */
            const path = new URL(request.url).pathname;
            const isBigDataFile = DATA_FILES.some((f) => path.endsWith(f.replace('./', '/')));

            if (isBigDataFile) {
                const cachedResponse = await cache.match(request);
                if (cachedResponse) {
                    return cachedResponse; // فوري — لا انتظار شبكة إطلاقاً
                }
                try {
                    const networkResponse = await fetch(request);
                    if (networkResponse && networkResponse.ok) {
                        await cache.put(request, networkResponse.clone());
                    }
                    return networkResponse;
                } catch (error) {
                    throw error;
                }
            }

            /* =============================================
               2) الصفحات والبرمجيات — Network First
               (حجمها صغير، فلا تُبطئ شيئاً، وتضمن وصول أي
               تحديث برمجي بسرعة)
               ============================================= */
            if (isUpdateSensitivePage(request)) {
                try {
                    const networkResponse = await fetch(request, { cache: 'no-store' });
                    if (networkResponse && networkResponse.ok) {
                        await cache.put(request, networkResponse.clone());
                    }
                    return networkResponse;
                } catch (error) {
                    console.warn('📴 استخدام النسخة المخزنة:', request.url);
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

            /* =============================================
               3) أي طلب آخر (خطوط، أيقونات خارجية...) — Cache First
               ============================================= */
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
   الرسائل
   ========================================================= */
self.addEventListener('message', (event) => {
    if (!event.data) return;

    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) =>
                Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
            )
        );
    }
});

console.log('🟢 الرفيق — Service Worker v13 يعمل (القرآن والتفسير الآن فوريان من الكاش)');
