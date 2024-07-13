//
// Service worker for abctools offline use resource caching
//
//
//
//
// Updated 12 July 2024 at 1825
//
//
//
//

const cacheName = 'cache-005';

const contentToCache = [
    'abctools.html'
];

// Installing Service Worker
self.addEventListener('install', (e) => {

    console.log('[Service Worker] Install');

    // Make this the current service worker
    self.skipWaiting();
    
    e.waitUntil((async () => {
      const cache = await caches.open(cacheName);
      console.log('[Service Worker] Caching all: app shell and content');
      await cache.addAll(contentToCache);
      console.log('[Service Worker] Cache addAll complete!');
    })());


  });

self.addEventListener('activate', event => {

    console.log("[Service Worker] Activate event");

    clients.claim().then(() => {
        //claim means that the html file will use this new service worker.
        console.log(
          '[Service Worker] - The service worker has now claimed all pages so they use the new service worker.'
        );
    });

    event.waitUntil(
        caches.keys().then((keys) => {
          return Promise.all(
            keys.filter((key) => key != cacheName).map((key) => caches.delete(key))
          );
        })
    );

});
  

