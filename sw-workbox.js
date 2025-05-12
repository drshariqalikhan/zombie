// sw-workbox.js

importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.1.0/workbox-sw.js');

if (workbox) {
    console.log(`Workbox is loaded 🎉`);

    workbox.core.setCacheNameDetails({
        prefix: 'my-locked-pwa',
        suffix: 'v5-splash', // Incremented suffix for this splash screen update
        precache: 'precache',
        runtime: 'runtime-cache'
    });

    workbox.precaching.precacheAndRoute([
        { url: './', revision: null },
        { url: './index.html', revision: null },
        { url: './manifest.json', revision: null },
        { url: './icons/icon-192x192.png', revision: null },
        { url: './icons/icon-512x512.png', revision: null }
    ]);

    workbox.core.skipWaiting();
    workbox.core.clientsClaim();

    self.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SKIP_WAITING') {
          self.skipWaiting();
        }
    });

    console.log('Workbox service worker configured for splash screen version.');

} else {
    console.error(`Workbox didn't load 😬`);
}
