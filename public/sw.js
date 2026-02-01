// KILLER SERVICE WORKER
// This worker is designed to delete all existing caches and force network requests.
// Use this to recover from "White Screen" issues caused by aggressive caching of stale HTML.

const CLEANUP_VERSION = 'cleanup-v1';

self.addEventListener('install', (event) => {
    console.log('[SW Cleanup] Installing cleanup worker...');
    // Skip waiting to activate immediately
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[SW Cleanup] Activating and nuking caches...');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    console.log('[SW Cleanup] Deleting cache:', cacheName);
                    return caches.delete(cacheName);
                })
            );
        }).then(() => {
            console.log('[SW Cleanup] All caches cleared.');
            // Take control of all clients immediately
            return self.clients.claim();
        })
    );
});

// Intercept all requests and force them to go to the network
self.addEventListener('fetch', (event) => {
    // Pure network proxy - no caching
    event.respondWith(
        fetch(event.request).catch((error) => {
            console.error('[SW Cleanup] Network fetch failed:', error);
            // Optional: fallback to offline page if desired, but for now just fail naturally
            // so we don't accidentally cache a broken offline page
        })
    );
});
