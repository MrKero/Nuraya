/* Nuraya – Service Worker: alles offline verfügbar */
const VERSION = 'nur-v1.6.2';
const CORE = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css',
  'js/i18n.js', 'js/cities.js', 'js/core.js', 'js/calendar.js', 'js/prayer.js', 'js/tasbih.js', 'js/quran.js', 'js/names.js', 'js/zakat.js', 'js/settings.js',
  'lib/adhan.min.js', 'lib/fflate.min.js', 'lib/tz-lookup.js', 'data/cities.json',
  'fonts/amiri-quran.woff2', 'fonts/aref-ruqaa.woff2', 'fonts/reem-kufi.woff2',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
  'data/meta.json',
  ...['gruen', 'kaaba_gruen', 'moschee_gruen'].flatMap(k => [`icons/alt/${k}-180.png`, `icons/alt/${k}-512.png`]),
];
for (let i = 1; i <= 114; i++) CORE.push('data/quran/' + String(i).padStart(3, '0') + '.json');

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE.map(u => new Request(u, { cache: 'reload' })))));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // fremde Server (Audio, Diyanet) nicht anfassen
  if (u.pathname.includes('/audio/')) return; // lokale Audiodateien direkt
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request).then(res => {
    if (res.ok && res.type === 'basic') { const cp = res.clone(); caches.open(VERSION).then(c => c.put(e.request, cp)); }
    return res;
  }).catch(() => caches.match('index.html'))));
});
