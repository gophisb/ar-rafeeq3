const CACHE_NAME = 'rafeeq-v3.5';
const ASSETS = ['./','./index.html','./quran.html','./azkar.html','./qibla.html','./tafsir.html','./more.html','./style.css','./app.js','./theme.js','./manifest.json','./quran-local.json','./tafsir-saadi.json'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))); });
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.map(k => k!==CACHE_NAME && caches.delete(k))))));
self.addEventListener('fetch', e => { if(e.request.method!=='GET') return; e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(nr => { caches.open(CACHE_NAME).then(c => c.put(e.request, nr.clone())); return nr; }))); });
