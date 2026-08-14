const CACHE_NAME = 'rafeeq-premium-v4.2';
const ASSETS = ['./','./index.html','./quran.html','./adhkar.html','./qibla.html','./tafsir.html','./more.html','./style.css','./app.js','./theme.js','./manifest.json','./quran-local.json','./tafsir-saadi.json'];
const ADHAN_AUDIO = ['./audio/adhan_mecca.mp3','./audio/adhan_medina.mp3','./audio/adhan_alaqsa.mp3'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll([...ASSETS, ...ADHAN_AUDIO]).catch(() => c.addAll(ASSETS)))); });
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.map(k => k!==CACHE_NAME && caches.delete(k))))));
self.addEventListener('fetch', e => { if(e.request.method!=='GET') return; e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(nr => { caches.open(CACHE_NAME).then(c => c.put(e.request, nr.clone())); return nr; }))); });
