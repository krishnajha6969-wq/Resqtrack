// ResQTrack Service Worker
// Provides offline caching for static assets and map tiles

const CACHE_NAME = 'resqtrack-v1';
const STATIC_ASSETS = [
    '/',
    '/login',
    '/dashboard',
    '/rescue',
    '/incidents',
    '/analytics',
];

const TILE_CACHE = 'resqtrack-tiles-v1';

// Install: cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((key) => key !== CACHE_NAME && key !== TILE_CACHE)
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// Fetch: serve from cache first, fallback to network
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Cache map tiles
    if (url.hostname.includes('basemaps.cartocdn.com') ||
        url.hostname.includes('tile.openstreetmap.org')) {
        event.respondWith(
            caches.open(TILE_CACHE).then((cache) =>
                cache.match(event.request).then((cached) => {
                    if (cached) return cached;
                    return fetch(event.request).then((response) => {
                        if (response.ok) cache.put(event.request, response.clone());
                        return response;
                    });
                })
            )
        );
        return;
    }

    // Skip API requests from cache
    if (url.pathname.startsWith('/api/')) {
        return;
    }

    // Serve static assets from cache, fallback to network
    event.respondWith(
        caches.match(event.request).then((cached) => {
            return cached || fetch(event.request).catch(() => {
                // Return cached index for navigation requests
                if (event.request.mode === 'navigate') {
                    return caches.match('/');
                }
            });
        })
    );
});

// Handle background sync
self.addEventListener('sync', (event) => {
    if (event.tag === 'resqtrack-sync') {
        console.log('[SW] Background sync triggered');
        event.waitUntil(
            self.clients.matchAll().then((clients) => {
                clients.forEach((client) => {
                    client.postMessage({ type: 'SYNC_REQUESTED' });
                });
            })
        );
    }
});
