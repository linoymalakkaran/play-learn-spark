/**
 * Service Worker for Play & Learn Spark
 * Provides offline caching and performance optimization
 */

const CACHE_NAME = 'play-learn-spark-v1';
const STATIC_CACHE_NAME = 'play-learn-spark-static-v1';
const DYNAMIC_CACHE_NAME = 'play-learn-spark-dynamic-v1';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  // Core CSS and JS will be added by the build process
];

// Cache strategies for different asset types
const CACHE_STRATEGIES = {
  // Cache first for static assets
  static: ['/', '/index.html', '/manifest.json'],
  
  // Network first for API calls
  networkFirst: ['/api/', '/data/'],
  
  // Cache first for images and fonts
  cacheFirst: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.woff', '.woff2', '.ttf'],
  
  // Stale while revalidate for CSS/JS
  staleWhileRevalidate: ['.css', '.js', '.json']
};

// Maximum cache sizes
const MAX_CACHE_SIZE = {
  static: 50,
  dynamic: 100,
  images: 200
};

self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('🔧 Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('🔧 Service Worker: Static assets cached');
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('🔧 Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('🔧 Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { url, method } = request;

  // Only handle GET requests
  if (method !== 'GET') return;

  // Skip cross-origin requests
  if (!url.startsWith(self.location.origin)) return;

  const strategy = determineStrategy(url);
  
  switch (strategy) {
    case 'cacheFirst':
      event.respondWith(cacheFirst(request));
      break;
    case 'networkFirst':
      event.respondWith(networkFirst(request));
      break;
    case 'staleWhileRevalidate':
      event.respondWith(staleWhileRevalidate(request));
      break;
    default:
      event.respondWith(cacheFirst(request));
  }
});

// Cache-first strategy (good for images, fonts, static assets)
async function cacheFirst(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the response for future use
      await cache.put(request, networkResponse.clone());
      await limitCacheSize(DYNAMIC_CACHE_NAME, MAX_CACHE_SIZE.dynamic);
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('🔧 Service Worker: Cache-first failed:', error);
    return getOfflineFallback(request);
  }
}

// Network-first strategy (good for API calls, dynamic content)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      await cache.put(request, networkResponse.clone());
      await limitCacheSize(DYNAMIC_CACHE_NAME, MAX_CACHE_SIZE.dynamic);
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('🔧 Service Worker: Network failed, trying cache:', error);
    
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return getOfflineFallback(request);
  }
}

// Stale-while-revalidate strategy (good for CSS, JS that can be updated)
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Network failed, return cached version if available
    return cachedResponse;
  });
  
  // Return cached version immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

// Determine caching strategy based on URL
function determineStrategy(url) {
  const urlPath = new URL(url).pathname;
  
  // Check for API calls
  if (CACHE_STRATEGIES.networkFirst.some(pattern => urlPath.includes(pattern))) {
    return 'networkFirst';
  }
  
  // Check for images and fonts
  if (CACHE_STRATEGIES.cacheFirst.some(ext => urlPath.endsWith(ext))) {
    return 'cacheFirst';
  }
  
  // Check for CSS/JS
  if (CACHE_STRATEGIES.staleWhileRevalidate.some(ext => urlPath.endsWith(ext))) {
    return 'staleWhileRevalidate';
  }
  
  // Default to cache-first for static assets
  if (CACHE_STRATEGIES.static.some(pattern => urlPath === pattern || urlPath.includes(pattern))) {
    return 'cacheFirst';
  }
  
  return 'cacheFirst';
}

// Limit cache size to prevent storage bloat
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxSize) {
    const keysToDelete = keys.slice(0, keys.length - maxSize);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
    console.log(`🔧 Service Worker: Cleaned up ${keysToDelete.length} items from ${cacheName}`);
  }
}

// Get offline fallback response
async function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  // For HTML pages, return offline page
  if (request.headers.get('accept')?.includes('text/html')) {
    const cache = await caches.open(STATIC_CACHE_NAME);
    return cache.match('/offline.html') || new Response('Offline', { status: 503 });
  }
  
  // For images, return a placeholder
  if (request.headers.get('accept')?.includes('image/')) {
    return new Response(
      '<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="#999" text-anchor="middle" dy=".3em">Image unavailable</text></svg>',
      { 
        headers: { 'Content-Type': 'image/svg+xml' },
        status: 503 
      }
    );
  }
  
  // Generic offline response
  return new Response('Resource unavailable offline', { status: 503 });
}

// Handle background sync for deferred tasks
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔧 Service Worker: Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle queued operations when online
  // This could include syncing user progress, uploading analytics, etc.
  try {
    // Example: Sync any pending data
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'BACKGROUND_SYNC' });
    });
  } catch (error) {
    console.warn('🔧 Service Worker: Background sync failed:', error);
  }
}

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: data.url,
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/icons/explore.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/')
    );
  }
});

// Performance monitoring
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_STATS') {
    getCacheStats().then(stats => {
      event.ports[0].postMessage(stats);
    });
  }
});

async function getCacheStats() {
  const cacheNames = await caches.keys();
  const stats = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    stats[cacheName] = keys.length;
  }
  
  return stats;
}