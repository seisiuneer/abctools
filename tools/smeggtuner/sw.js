// SmeggTuner web edition: service worker scoped to /tools/smeggtuner/.
// Cache name is isolated from other SmeggTuner deployments on the same domain.
const BASE = '/tools/smeggtuner/';
const PREFIX = 'smeggtuner-tools-smeggtuner-';
const CACHE = `${PREFIX}1.4.1-subdir1`;
const SHELL = [
  BASE,
  `${BASE}index.html`,
  `${BASE}engine/smeggtuner.wasm`,
  `${BASE}engine/wasm_exec.js`,
  `${BASE}manifest.webmanifest`
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(names
        .filter(name => name.startsWith(PREFIX) && name !== CACHE)
        .map(name => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin ||
      !url.pathname.startsWith(BASE)) return;

  if (request.mode === 'navigate') {
    // Prefer fresh HTML when online; use the locally cached index when offline.
    event.respondWith(fetch(request).then(async response => {
      if (response.ok) {
        const cache = await caches.open(CACHE);
        await cache.put(`${BASE}index.html`, response.clone());
      }
      return response;
    }).catch(async () => {
      const cache = await caches.open(CACHE);
      return await cache.match(`${BASE}index.html`) || Response.error();
    }));
    return;
  }

  // Hashed assets and local engine files: cache first, then network.
  event.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  }));
});
