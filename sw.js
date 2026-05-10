// LinkDrop Service Worker — v1.0.0
const CACHE_NAME = 'linkdrop-v1.0.0';

const PRECACHE = [
  '/',
  '/index.html',
  '/app.js',
  '/styles.css',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// ── Install: pre-cache static shell ───────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .catch(() => {}) // don't block install on network error
  );
  self.skipWaiting();
});

// ── Activate: purge old caches ─────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: cache-first for shell, network-first for rest ──────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GETs
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // SPA routes — always serve index.html from cache
  const spaRoutes = ['/', '/add', '/share-target'];
  if (spaRoutes.includes(url.pathname)) {
    event.respondWith(
      caches.match('/index.html').then(r => r || fetch('/index.html'))
    );
    return;
  }

  // Static assets — cache-first
  if (PRECACHE.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(c => c.put(request, clone));
          }
          return response;
        }).catch(() => caches.match('/index.html'));
      })
    );
    return;
  }

  // Everything else — network with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
