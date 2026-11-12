// SmeggTuner v1.4.5: isolated deployment under /tools/smeggtuner/
// Only manages its own cache namespace, preserving other applications' caches.
const BASE = '/tools/smeggtuner/';
const PREFIX = 'smeggtuner-tools-smeggtuner-';
const CACHE = `${PREFIX}1.4.5-a332e3c83b7d-subdir1`;
const SHELL = [
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
    // Network-first HTML; cached entry document for offline fallback.
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

  // Only cache runtime resources that belong to this subdirectory.
  event.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  }));
});
