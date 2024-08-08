//
// Service worker for abctools offline use resource caching
//
//
//
// Updated 8 August 2024 at 1415
//
//
//

const cacheName = 'cache-205';

const contentToCache = [
    'abctools.html',
    'userguide.html',
    'tunesources.html',
    'tunesources.css',
    'credits.html',
    'tipjars.html',
    'general_midi_extended_v7.pdf',
    'abc_standard_v2.1.pdf',
    'ABCquickRefv0_6.pdf',
    'app.css',
    'app-min.js',
    'jquery-1.11.1.min.js',
	'jszip.min.js',
	'xml2abc-min.js',
	'abcjs-chord-intervals.js',
	'abcjs-basic-eskin-min.js',
	'jspdf.min.js',
    'pdf-lib-min.js',
	'html2image.js',
	'qrcode.js',
	'lz-string.min.js',
	'daypilot-modal.min-3.10.1.js',
	'lame.min.js',
	'unmute.min.js',
	'tab-injectors-min.js',
    'visualscript-sdk.js',
    'smartdraw-export-min.js',
    'acoustic_grand_piano-mp3.js',
    'percussion-mp3.js',
    'online-check.js',
    'database.js',
    'download-reverb.js',
    'bww2abc.js',
    'manage_database.js',
    'context-menu.js',
	'api-keys.js',
    'img/zoomin.png',
    'img/zoomout.png',
    'img/helpbutton.png',
    'img/playbutton.png',
    'img/pdfbutton.png',
    'img/michael.jpg',
    'img/settings.png',
    'img/abc-android-icon-144x144.png',
    'img/abc-android-icon-192x192.png',
    'img/abc-android-icon-36x36.png',
    'img/abc-android-icon-48x48.png',
    'img/abc-android-icon-72x72.png',
    'img/abc-android-icon-96x96.png',
    'img/abc-apple-icon-114x114.png',
    'img/abc-apple-icon-120x120.png',
    'img/abc-apple-icon-144x144.png',
    'img/abc-apple-icon-152x152.png',
    'img/abc-apple-icon-180x180.png',
    'img/abc-apple-icon-57x57.png',
    'img/abc-apple-icon-60x60.png',
    'img/abc-apple-icon-72x72.png',
    'img/abc-apple-icon-76x76.png',
    'img/abc-apple-icon-precomposed.png',
    'img/abc-apple-icon.png',
    'img/abc-favicon-16x16.png',
    'img/abc-favicon-32x32.png',
    'img/abc-favicon-96x96.png',
    'img/abc-favicon.ico',
    'img/abc-icon-512x512.png',
    'img/abc-icon-user-guide-basic.png',
    'img/abc-icon.png',
    'img/abc-ms-icon-144x144.png',
    'img/abc-ms-icon-150x150.png',
    'img/abc-ms-icon-310x310.png',
    'img/abc-ms-icon-70x70.png',
    'img/abc-manifest.json'
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
  
// Fetching content using Service Worker
self.addEventListener('fetch', (e) => {

    //console.log(`[Service Worker] fetching: ${e.request.url}`);

    // Cache http and https only, skip unsupported chrome-extension:// and file://...
    if (!(
        e.request.url.startsWith('http:') || e.request.url.startsWith('https:')
    )) {
        return; 
    }

    e.respondWith((async () => {

        const r = await caches.match(e.request,{ignoreSearch: true});

        if (r){

            //console.log(`[Service Worker] Returning cached resource: ${e.request.url}`);

            return r;
        }

        try{

            //console.log(`[Service Worker] Fetching resource: ${e.request.url}`);

            const response = await fetch(e.request);

            //Don't cache any resources

            // if ((e.request.url.indexOf("service_worker") == -1) && (e.request.url.indexOf("soundfonts") == -1)){
            
            //     const cache = await caches.open(cacheName);

            //     console.log(`[Service Worker] Caching new resource: ${e.request.url}`);

            //     cache.put(e.request, response.clone());

            // }
 
            return response;
            
        }
        catch (error){

            //console.log("[Service Worker] fetch error: "+error);
    
        }
    })());
});


