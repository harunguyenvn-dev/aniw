
const CACHE_NAME = 'aniw-pwa-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
];

// Install event: Cache basic assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Sử dụng addAll nhưng bắt lỗi để không làm hỏng toàn bộ quá trình install nếu 1 file lỗi
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Failed to cache assets during install:', err);
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

// Fetch event: Network first, fall back to cache for navigation
self.addEventListener('fetch', (event) => {
  // Chỉ cache GET request
  if (event.request.method !== 'GET') return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // Đối với các request khác, thử cache trước nếu có
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// --- VIDEO DOWNLOAD LOGIC ---

// Helper to open IDB
const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('aniw-offline-db', 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('videos')) {
                db.createObjectStore('videos', { keyPath: 'id' });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

// Helper to save to IDB
const saveVideoToDB = async (videoData) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['videos'], 'readwrite');
        const store = transaction.objectStore('videos');
        const request = store.put(videoData);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

self.addEventListener('message', async (event) => {
    if (event.data && event.data.type === 'DOWNLOAD_VIDEO') {
        const { url, animeName, episodeTitle, id } = event.data.payload;
        // Kiểm tra xem source có tồn tại không trước khi gửi tin nhắn
        const clientId = event.source ? event.source.id : null;

        const sendMessageToClient = (message) => {
             if (!clientId) return;
             self.clients.get(clientId).then(client => {
                if (client) client.postMessage(message);
            });
        };

        const sendProgress = (progress, status) => {
            sendMessageToClient({
                type: 'DOWNLOAD_PROGRESS',
                payload: { id, progress, status }
            });
        };

        const sendSuccess = () => {
             sendMessageToClient({
                type: 'DOWNLOAD_COMPLETE',
                payload: { id }
            });
        };
        
        const sendError = (errorMsg) => {
             sendMessageToClient({
                type: 'DOWNLOAD_ERROR',
                payload: { id, error: errorMsg }
            });
        };

        try {
            sendProgress(0, 'Đang phân tích...');

            let finalBlob;
            let fileType = 'video/mp4';

            if (url.includes('.m3u8')) {
                fileType = 'video/mp2t';
                // 1. Fetch M3U8
                sendProgress(5, 'Đang đọc playlist...');
                const response = await fetch(url);
                if (!response.ok) throw new Error('Failed to fetch playlist');
                const manifest = await response.text();

                // 2. Parse Segments with better URL resolution
                const lines = manifest.split('\n');
                const segmentUrls = [];

                for (let line of lines) {
                    line = line.trim();
                    if (line && !line.startsWith('#')) {
                        // Resolve relative paths safely using the M3U8 URL as base
                        try {
                             const segmentUrl = new URL(line, url).href;
                             segmentUrls.push(segmentUrl);
                        } catch (e) {
                             console.warn('Invalid segment URL:', line);
                        }
                    }
                }

                if (segmentUrls.length === 0) throw new Error('No segments found');

                // 3. Download Segments
                const chunks = [];
                const total = segmentUrls.length;
                
                // Download sequentially to be safe with memory/network
                for (let i = 0; i < total; i++) {
                    const percent = Math.round(((i + 1) / total) * 100);
                    // Update progress every 5 segments or at the end
                    if (i % 5 === 0 || i === total - 1) {
                         sendProgress(percent, `Đang tải đoạn ${i + 1}/${total}`);
                    }
                    
                    try {
                        const segRes = await fetch(segmentUrls[i]);
                        if (!segRes.ok) throw new Error(`Segment fetch failed: ${segmentUrls[i]}`);
                        const blob = await segRes.blob();
                        chunks.push(blob);
                    } catch (err) {
                        console.warn('Segment failed', err);
                        // Skip or retry logic could go here
                    }
                }

                sendProgress(99, 'Đang ghép nối...');
                finalBlob = new Blob(chunks, { type: 'video/mp2t' });

            } else {
                // Direct file download
                sendProgress(0, 'Đang tải file...');
                const response = await fetch(url);
                if (!response.ok) throw new Error('Failed to fetch video');
                
                finalBlob = await response.blob();
                fileType = finalBlob.type;
            }

            // 4. Save to IDB
            sendProgress(100, 'Đang lưu vào thiết bị...');
            await saveVideoToDB({
                id: url,
                animeName,
                episodeTitle,
                savedAt: Date.now(),
                blob: finalBlob,
                fileType
            });

            sendSuccess();

        } catch (error) {
            console.error('Download error in SW:', error);
            sendError(error.message);
        }
    }
});
