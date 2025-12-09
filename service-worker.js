
const CACHE_NAME = 'aniw-pwa-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event: Cache basic assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.error('Failed to cache assets during install:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // 1. Handle Navigation requests (HTML pages)
  // Strategy: Network First -> Fallback to Cache -> Fallback to Offline Page (/index.html)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
            // Update cache with new page
            const resClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, resClone);
            });
            return response;
        })
        .catch(() => {
          // If network fails, try cache, or fallback to index.html (SPA entry point)
          return caches.match(event.request).then((cachedRes) => {
              return cachedRes || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // 2. Handle Assets (JS, CSS, Images, etc.)
  // Strategy: Stale-While-Revalidate (Try Cache first, but update from network in background)
  // OR for this demo: Network First, falling back to cache (to ensure latest code on reload)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
        // Even if we have it in cache, try to fetch fresh
        return fetch(event.request).then((networkResponse) => {
            // Check if valid response
            if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                return networkResponse;
            }

            // Update cache
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
            });

            return networkResponse;
        }).catch(() => {
            // Network failed, return cached response if available
            return cachedResponse;
        });
    })
  );
});
