/* ==========================================================
   الرفيق - Service Worker
   الإصدار: v17
   فلسفة التصميم:
   - الاستقرار أولاً.
   - Offline كامل للملفات الأساسية.
   - تحديث آمن.
   - تنظيف تلقائي للكاش القديم.
========================================================== */

'use strict';

const CACHE_VERSION = 'v17';
const CACHE_NAME = `rafeeq-${CACHE_VERSION}`;

const APP_SHELL = [
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

const DATA_FILES = [
    './quran-local.json',
    './tafsir-saadi.json',
    './arbaeen-data.json'
];

function urlPath(request) {
    return new URL(request.url).pathname;
}

function sameOrigin(request) {
    return new URL(request.url).origin === self.location.origin;
}

function isData(path) {
    return DATA_FILES.some(file =>
        path.endsWith(file.replace('./', '/'))
    );
}

function isPage(path) {
    if (path === '/' || path.endsWith('/'))
        return true;
    return APP_SHELL.some(file =>
        file.endsWith('.html') &&
        path.endsWith(file.replace('./', '/'))
    );
}

self.addEventListener('install', event => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            for (const file of APP_SHELL) {
                try {
                    const response = await fetch(file, {
                        cache: 'reload'
                    });
                    if (response.ok) {
                        await cache.put(file, response);
                    }
                } catch (err) {
                    console.warn('[SW] Failed:', file);
                }
            }
            await self.skipWaiting();
        })()
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            await Promise.all(
                keys.map(key => {
                    if (key.startsWith('rafeeq-') && key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
            await self.clients.claim();
            console.log('[SW] Activated:', CACHE_NAME);
        })()
    );
});

self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.method !== 'GET') return;
    if (!sameOrigin(request)) return;
    const path = urlPath(request);
    if (path.endsWith('adhan.mp3')) return;
    event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
    const cache = await caches.open(CACHE_NAME);
    const path = urlPath(request);

    if (isData(path)) {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
            const network = await fetch(request);
            if (network.ok) cache.put(request, network.clone());
            return network;
        } catch {
            return new Response('Offline', { status: 503, statusText: 'Offline' });
        }
    }

    if (isPage(path)) {
        try {
            const network = await fetch(request);
            if (network.ok) cache.put(request, network.clone());
            return network;
        } catch {
            const cached = await cache.match(request);
            if (cached) return cached;
            return cache.match('./index.html');
        }
    }

    const cached = await cache.match(request);
    const networkPromise = fetch(request)
        .then(response => {
            if (response && response.ok) cache.put(request, response.clone());
            return response;
        })
        .catch(() => null);

    if (cached) {
        networkPromise.catch(() => {});
        return cached;
    }

    const network = await networkPromise;
    if (network) return network;
    return new Response('Offline', { status: 503, statusText: 'Offline' });
}
