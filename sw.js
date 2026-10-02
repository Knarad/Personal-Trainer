// Offline support: app files load from cache when there is no connection.
// Firestore keeps its own offline copy of your data and syncs when you reconnect.
const CACHE = 'training-plan-v1';
const SHELL = ['./', 'index.html', 'config.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const put = res => { const c = res.clone(); caches.open(CACHE).then(x => x.put(r, c)); return res; };
  if (u.origin === location.origin) {
    e.respondWith(fetch(r).then(put).catch(() => caches.match(r).then(m => m || caches.match('index.html'))));
    return;
  }
  if (u.hostname === 'www.gstatic.com' || u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.match(r).then(m => { const f = fetch(r).then(put).catch(() => m); return m || f; }));
  }
});
