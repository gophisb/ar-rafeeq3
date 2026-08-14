const CACHE_NAME = 'rafeeq-premium-v4.0.0';
const ASSETS = ['./','./index.html','./quran.html','./adhkar.html','./qibla.html','./tafsir.html','./more.html','./prayer.html','./style.css','./app.js','./theme.js','./manifest.json','./quran-local.json','./tafsir-saadi.json'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))); });
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k!==CACHE_NAME).map(k => caches.delete(k))))));
self.addEventListener('fetch', e => { if(e.request.method!=='GET') return; e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(nr => { caches.open(CACHE_NAME).then(c => c.put(e.request, nr.clone())); return nr; }))); });
