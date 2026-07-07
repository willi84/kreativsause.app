const CACHE_NAME = 'kreativsause-app-v1';
const APP_SHELL = [
    '/',
    '/assets/bootstrap.min.css',
    '/assets/bootstrap.bundle.min.js',
    '/assets/logo.svg',
    '/assets/logo.jpg',
    '/assets/logo-192.png',
    '/assets/logo-512.png',
    '/assets/manifest.webmanifest',
    '/assets/unknown.svg',
];

const isCacheableResponse = (response) => {
    return response.ok || response.type === 'opaque';
};

const notifyClients = async (type) => {
    const windows = await self.clients.matchAll({ type: 'window' });

    windows.forEach((client) => {
        client.postMessage({ type });
    });
};

const getCacheStatus = async () => {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    return keys.length > 0;
};

const updateCache = async (request, response) => {
    if (!isCacheableResponse(response)) {
        return response;
    }

    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
    return response;
};

const cacheFirst = async (request) => {
    const cached = await caches.match(request);
    if (cached) {
        return cached;
    }

    const response = await fetch(request);
    return updateCache(request, response);
};

const networkFirst = async (request) => {
    try {
        const response = await fetch(request);
        return updateCache(request, response);
    } catch {
        const cached = await caches.match(request);

        if (cached) {
            await notifyClients('CACHE_FALLBACK_USED');
            return cached;
        }

        throw new Error('Network unavailable and no cache entry found.');
    }
};

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames
                .filter((cacheName) => cacheName !== CACHE_NAME && cacheName.startsWith('kreativsause-'))
                .map((cacheName) => caches.delete(cacheName))
        );
        await self.clients.claim();
    })());
});

self.addEventListener('message', (event) => {
    if (event.data?.type !== 'CACHE_STATUS_REQUEST') {
        return;
    }

    event.waitUntil((async () => {
        const hasCache = await getCacheStatus();
        event.source?.postMessage({
            type: 'CACHE_STATUS_RESPONSE',
            hasCache,
        });
    })());
});

self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (request.method !== 'GET') {
        return;
    }

    const url = new URL(request.url);
    const isDocument = request.mode === 'navigate';
    const isAsset = request.destination === 'style'
        || request.destination === 'script'
        || request.destination === 'font'
        || request.destination === 'image'
        || url.pathname.startsWith('/assets/');
    const isSameOrigin = url.origin === self.location.origin;

    if (isDocument && isSameOrigin) {
        event.respondWith(networkFirst(request));
        return;
    }

    if (isAsset || !isSameOrigin) {
        event.respondWith(cacheFirst(request));
        return;
    }

    if (isSameOrigin) {
        event.respondWith(networkFirst(request));
    }
});
