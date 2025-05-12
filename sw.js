const CACHE_NAME = 'barebones-pwa-cache-v1';
const urlsToCache = [
    './', // Alias for index.html
    './index.html',
    // Add other assets you want to cache here, e.g., './style.css', './script.js' if they were separate
    // './icon-192x192.png', // Cache icons if needed, though apple-touch-icon is usually fetched by iOS
    // './icon-512x512.png'
];

// Install event: open cache and add core files
self.addEventListener('install', event => {
    console.log('[ServiceWorker] Install');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[ServiceWorker] Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                return self.skipWaiting(); // Force the waiting service worker to become the active service worker
            })
    );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
    console.log('[ServiceWorker] Activate');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[ServiceWorker] Removing old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim(); // Take control of all open clients
        })
    );
});

// Fetch event: serve cached content when offline, or fetch from network
self.addEventListener('fetch', event => {
    // We only want to cache GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    console.log('[ServiceWorker] Returning from cache:', event.request.url);
                    return cachedResponse;
                }
                console.log('[ServiceWorker] Fetching from network:', event.request.url);
                return fetch(event.request).then(
                    networkResponse => {
                        // Optionally, cache new requests dynamically
                        // if (networkResponse && networkResponse.status === 200) {
                        //     const responseToCache = networkResponse.clone();
                        //     caches.open(CACHE_NAME)
                        //         .then(cache => {
                        //             cache.put(event.request, responseToCache);
                        //         });
                        // }
                        return networkResponse;
                    }
                ).catch(error => {
                    console.log('[ServiceWorker] Fetch failed; returning offline fallback (if available) or error', error);
                    // Optionally, return a generic offline page here if the fetch fails
                    // return caches.match('./offline.html');
                });
            })
    );
});
