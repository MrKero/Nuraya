/* Nuraya – Service Worker: alles offline verfügbar */
const VERSION = 'nur-v1.8.1';
const CORE = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css',
  'js/i18n.js', 'js/cities.js', 'js/core.js', 'js/calendar.js', 'js/prayer.js', 'js/tasbih.js', 'js/quran.js', 'js/names.js', 'js/zakat.js', 'js/tajtag.js', 'js/tajweed.js', 'js/settings.js',
  'lib/adhan.min.js', 'lib/fflate.min.js', 'lib/tz-lookup.js', 'data/cities.json',
  'fonts/amiri-quran.woff2', 'fonts/aref-ruqaa.woff2', 'fonts/reem-kufi.woff2',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
  'data/meta.json',
  ...['gruen', 'kaaba_gruen', 'moschee_gruen'].flatMap(k => [`icons/alt/${k}-180.png`, `icons/alt/${k}-512.png`]),
];
for (let i = 1; i <= 114; i++) CORE.push('data/quran/' + String(i).padStart(3, '0') + '.json');

// Schriftarten & Koran-Skripte: eigener, versionsunabhängiger Speicher – wird nur einmal geladen
const EXTRA_CACHE = 'nur-extra-1';
const EXTRA = ['data/scripts/standard.json', 'data/scripts/indopak.json', 'data/scripts/plain.json', 'fonts/kfgqpc-hafs.woff2', 'fonts/indopak.woff2'];
const fillExtra = () => caches.open(EXTRA_CACHE).then(c => Promise.all(EXTRA.map(u => c.match(u).then(r => r || c.add(u).catch(() => {})))));
self.addEventListener('install', e => {
  // jede Datei einzeln, bei Netzwacklern bis zu 3 Versuche – ein einzelner Fehler soll das Update nicht abbrechen
  const get = (u, n = 3) => fetch(new Request(u, { cache: 'reload' })).then(r => { if (!r.ok) throw new Error(u + ' ' + r.status); return r; }).catch(err => n > 1 ? new Promise(ok => setTimeout(ok, 800)).then(() => get(u, n - 1)) : Promise.reject(err));
  e.waitUntil(Promise.all([caches.open(VERSION).then(c => Promise.all(CORE.map(u => get(u).then(r => c.put(u, r))))), fillExtra().catch(() => {})]));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION && k !== EXTRA_CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); if (e.data === 'fillExtra') e.waitUntil(fillExtra()); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // fremde Server (Audio, Diyanet) nicht anfassen
  if (u.pathname.includes('/audio/')) return; // lokale Audiodateien direkt
  if (u.pathname.endsWith('/sw.js')) return; // Versionsprüfung immer direkt beim Server
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request).then(res => {
    if (res.ok && res.type === 'basic') { const cp = res.clone(); caches.open(VERSION).then(c => c.put(e.request, cp)); }
    return res;
  }).catch(() => caches.match('index.html'))));
});
