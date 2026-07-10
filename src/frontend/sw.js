const CACHE_NAME = 'kreativsause-app-v2';
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
const MUSIC_ASSETS = [
    '/assets/music/Pi-1.mp3',
    '/assets/music/Pi-2.mp3',
    '/assets/music/Pi-3.mp3',
    '/assets/music/Pi-4.mp3',
    '/assets/music/Pi-5.mp3',
    '/assets/music/Pi-6.mp3',
    '/assets/music/Pi-7.mp3',
    '/assets/music/Pi-8.mp3',
    '/assets/music/Pi-9.mp3',
];
const PRECACHE_ASSETS = [...APP_SHELL, ...MUSIC_ASSETS];

const isCacheableResponse = (response) => {
    return (response.ok && response.status !== 206) || response.type === 'opaque';
};

const isRangeRequest = (request) => {
    return request.headers.has('range');
};

const createRangeResponse = async (request, response) => {
    const rangeHeader = request.headers.get('range');
    const match = rangeHeader?.match(/bytes=(\d+)-(\d*)/);

    if (!match) {
        return response;
    }

    const fileBuffer = await response.arrayBuffer();
    const fileSize = fileBuffer.byteLength;
    const rangeStart = Number.parseInt(match[1], 10);
    const rangeEnd = match[2] ? Number.parseInt(match[2], 10) : fileSize - 1;
    const safeEnd = Math.min(rangeEnd, fileSize - 1);

    if (Number.isNaN(rangeStart) || Number.isNaN(safeEnd) || rangeStart > safeEnd || rangeStart >= fileSize) {
        return new Response(null, {
            status: 416,
            headers: {
                'Content-Range': `bytes */${fileSize}`,
            },
        });
    }

    const chunk = fileBuffer.slice(rangeStart, safeEnd + 1);
    const headers = new Headers(response.headers);
    headers.set('Content-Length', String(chunk.byteLength));
    headers.set('Content-Range', `bytes ${rangeStart}-${safeEnd}/${fileSize}`);
    headers.set('Accept-Ranges', 'bytes');

    return new Response(chunk, {
        status: 206,
        statusText: 'Partial Content',
        headers,
    });
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
    if (isRangeRequest(request)) {
        const cached = await caches.match(request.url);

        if (cached) {
            return createRangeResponse(request, cached);
        }

        return fetch(request);
    }

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
            .then((cache) => cache.addAll(PRECACHE_ASSETS))
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
        || request.destination === 'audio'
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
