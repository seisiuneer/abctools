// SmeggTuner v1.4.2: service worker isolated to /tools/smeggtuner/
// Its cache prefix is unique to this deployment; it does not delete caches
// belonging to ABC Transcription Tools or other service workers.
const BASE = '/tools/smeggtuner/';
const PREFIX = 'smeggtuner-tools-smeggtuner-';
const CACHE = `${PREFIX}1.4.2-39420754be4a-subdir1`;
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
    // Network-first documents; fallback to the precached entry offline.
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

  // Keep all runtime assets and caches within this deployment's namespace.
  event.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  }));
});
