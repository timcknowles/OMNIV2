const CACHE = 'rca-calc-v1.1';
const ASSETS = [
  '/OMNIV2/',
  '/OMNIV2/index.html',
  '/OMNIV2/sw.js',
  '/OMNIV2/manifest.json',
  '/OMNIV2/icon-192.svg',
  '/OMNIV2/icon-512.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Network-first: always try to get fresh content, fall back to cache offline
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});

// Page triggers this to activate a waiting SW immediately
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
