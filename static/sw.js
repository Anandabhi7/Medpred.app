/**
 * MedPredictor Service Worker v2.0
 * Provides offline functionality and caching for PWA
 */

const CACHE_NAME = 'medpredictor-v2.0';
const STATIC_CACHE = 'medpredictor-static-v2.0';
const DYNAMIC_CACHE = 'medpredictor-dynamic-v2.0';

// Files to cache for offline functionality
const STATIC_ASSETS = [
    '/',
    '/static/css/style.css',
    '/static/js/app.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// API endpoints to cache
const API_CACHE = [
    '/api/symptoms',
    '/api/diseases',
    '/api/emergency-contacts',
    '/api/health-instructions',
    '/api/voice-commands'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        Promise.all([
            caches.open(STATIC_CACHE).then((cache) => {
                console.log('Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            }),
            caches.open(DYNAMIC_CACHE).then((cache) => {
                console.log('Caching API endpoints...');
                return Promise.all(
                    API_CACHE.map(url => 
                        fetch(url)
                            .then(response => cache.put(url, response.clone()))
                            .catch(error => console.log(`Failed to cache ${url}:`, error))
                    )
                );
            })
        ])
    );
    
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Handle API requests
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(handleApiRequest(request));
    }
    // Handle static assets
    else if (request.destination === 'document' || 
             request.destination === 'script' || 
             request.destination === 'style' ||
             request.destination === 'image') {
        event.respondWith(handleStaticRequest(request));
    }
    // Handle other requests
    else {
        event.respondWith(handleOtherRequest(request));
    }
});

// Handle API requests with cache-first strategy for GET, network-first for POST
async function handleApiRequest(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    
    if (request.method === 'GET') {
        // Cache-first for GET requests
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            console.log('Serving API from cache:', request.url);
            return cachedResponse;
        }
    }
    
    try {
        console.log('Fetching API from network:', request.url);
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok && request.method === 'GET') {
            // Cache successful GET responses
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('API request failed, checking cache:', request.url);
        
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline response for POST requests
        if (request.method === 'POST') {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Offline - this feature requires internet connection',
                    offline: true
                }),
                {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
        
        throw error;
    }
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        console.log('Serving static from cache:', request.url);
        return cachedResponse;
    }
    
    try {
        console.log('Fetching static from network:', request.url);
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Static request failed:', request.url);
        
        // Return offline page for document requests
        if (request.destination === 'document') {
            const offlineResponse = await cache.match('/');
            if (offlineResponse) {
                return offlineResponse;
            }
        }
        
        throw error;
    }
}

// Handle other requests
async function handleOtherRequest(request) {
    try {
        return await fetch(request);
    } catch (error) {
        console.log('Request failed:', request.url);
        throw error;
    }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('Background sync triggered:', event.tag);
    
    if (event.tag === 'background-sync-symptoms') {
        event.waitUntil(syncSymptoms());
    }
});

// Sync offline symptom data
async function syncSymptoms() {
    try {
        // Get offline data from IndexedDB (if implemented)
        console.log('Syncing offline symptom data...');
        // Implementation would depend on offline storage strategy
    } catch (error) {
        console.error('Failed to sync symptoms:', error);
    }
}

// Push notifications
self.addEventListener('push', (event) => {
    console.log('Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'Health reminder from MedPredictor',
        icon: '/static/icons/icon-192x192.png',
        badge: '/static/icons/badge-72x72.png',
        actions: [
            {
                action: 'open',
                title: 'Open App'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ],
        tag: 'medpredictor-notification',
        renotify: true
    };
    
    event.waitUntil(
        self.registration.showNotification('MedPredictor', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then((clientList) => {
                // Check if app is already open
                for (let client of clientList) {
                    if (client.url.includes('/') && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // Open new window if app not found
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
        );
    }
});

console.log('MedPredictor Service Worker v2.0 loaded');
