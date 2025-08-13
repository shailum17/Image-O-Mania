// Service Worker for ImageOmania - Aggressive Caching Strategy
const CACHE_NAME = 'imageOmania-v1.2';
const STATIC_CACHE = 'static-v1.2';
const DYNAMIC_CACHE = 'dynamic-v1.2';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/pages/my_designs.html',
  '/pages/Search.html',
  '/pages/about.html',
  '/pages/contact.html',
  '/pages/collaboration.html',
  '/styles/critical.css',
  '/styles/style.css',
  '/styles/brand-colors.css',
  '/scripts/optimized.js',
  '/Assets/favicon.png',
  '/Assets/Landingpage.svg'
];

// Network-first resources (always try network first)
const NETWORK_FIRST = [
  '/pages/header.html',
  '/pages/footer.html'
];

// Cache-first resources (images, fonts, etc.)
const CACHE_FIRST = [
  '/Assets/',
  'https://cdnjs.cloudflare.com/',
  'https://cdn.jsdelivr.net/',
  'https://unpkg.com/',
  'https://images.unsplash.com/'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('SW: Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('SW: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip chrome-extension and other protocols
  if (!url.protocol.startsWith('http')) return;
  
  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Network-first strategy for dynamic content
  if (NETWORK_FIRST.some(path => url.pathname.includes(path))) {
    return networkFirst(request);
  }
  
  // Cache-first strategy for static assets
  if (CACHE_FIRST.some(path => url.href.includes(path))) {
    return cacheFirst(request);
  }
  
  // Stale-while-revalidate for HTML pages
  if (url.pathname.endsWith('.html') || url.pathname === '/') {
    return staleWhileRevalidate(request);
  }
  
  // Default to network-first
  return networkFirst(request);
}

// Cache strategies
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('Asset not found', { status: 404 });
  }
}

async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      const cache = caches.open(DYNAMIC_CACHE);
      cache.then(c => c.put(request, response.clone()));
    }
    return response;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// Background sync for analytics or form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle any queued form submissions or analytics
  console.log('SW: Background sync triggered');
}

// Push notifications (future enhancement)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/Assets/favicon.png',
        badge: '/Assets/favicon.png'
      })
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
