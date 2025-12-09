
const CACHE_NAME = 'aniw-pwa-cache-v4';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html'
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
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
            // Update cache with new page if successful
            const resClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, resClone);
            });
            return response;
        })
        .catch(() => {
          // NETWORK FAIL STRATEGY:
          // 1. Try to serve index.html (App Shell) to allow React to handle offline logic.
          // 2. IF index.html is missing, OR if we specifically want a separate offline page fallback:
          //    Serve offline.html
          
          return caches.match(event.request)
            .then((cachedRes) => {
                if (cachedRes) return cachedRes;
                // If the specific page isn't cached, try the App Shell
                return caches.match('/index.html');
            })
            .then((response) => {
                // If index.html is also missing or we decide to enforce offline.html
                return response || caches.match('/offline.html');
            });
        })
    );
    return;
  }

  // 2. Handle Assets (JS, CSS, Images, etc.)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
        return fetch(event.request).then((networkResponse) => {
            if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                return networkResponse;
            }
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
            });
            return networkResponse;
        }).catch(() => {
            return cachedResponse;
        });
    })
  );
});
