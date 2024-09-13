//
// Service worker for abctools offline use resource caching
//
//
//
//
// Updated 12 Sep 2024 at 1815
//
//
//
//
//

// Installing Service Worker
self.addEventListener('install', (e) => {

    console.log('[Service Worker] Install');

    // Make this the current service worker
    self.skipWaiting();

  });

self.addEventListener('activate', event => {

    console.log("[Service Worker] Activate event");

    clients.claim().then(() => {
        //claim means that the html file will use this new service worker.
        console.log(
          '[Service Worker] - The service worker has now claimed all pages so they use the new service worker.'
        );
    });

    // Delete all caches
    event.waitUntil(
        caches.keys().then((keys) => {
          return Promise.all(
            keys.map((key) => caches.delete(key))
          );
        })
    );

    console.log("[Service Worker] All caches deleted");

});
  

