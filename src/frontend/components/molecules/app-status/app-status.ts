const CACHE_RUNTIME_KEY = 'craft-runtime-source';
const CACHE_PREFIX = 'kreativsause-';

type StatusState = 'ok' | 'warn' | 'unknown';

type CacheStatusResponse = {
    type: 'CACHE_STATUS_RESPONSE',
    hasCache: boolean,
};

const getStatusElement = (selector: string): HTMLElement | null => {
    return document.querySelector<HTMLElement>(selector);
};

const setStatus = (element: HTMLElement | null, state: StatusState, label: string): void => {
    if (!element) {
        return;
    }

    element.dataset.state = state;
    element.setAttribute('aria-label', label);
    element.title = label;

    const text = element.querySelector<HTMLElement>('.craft-app-status-text');
    if (text) {
        text.textContent = label;
        return;
    }

    element.textContent = label;
};

const getHasCache = async (): Promise<boolean> => {
    if (!('caches' in window)) {
        return false;
    }

    const cacheNames = await caches.keys();
    const matchingNames = cacheNames.filter((cacheName) => cacheName.startsWith(CACHE_PREFIX));

    if (matchingNames.length === 0) {
        return false;
    }

    for (const cacheName of matchingNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();

        if (keys.length > 0) {
            return true;
        }
    }

    return false;
};

const requestCacheStatus = (): void => {
    navigator.serviceWorker.controller?.postMessage({ type: 'CACHE_STATUS_REQUEST' });
};

export const createAppStatusBar = (): void => {
    const networkStatus = getStatusElement('[data-network-status]');
    const cacheStatus = getStatusElement('[data-cache-status]');
    const runtimeStatus = getStatusElement('[data-runtime-status]');

    if (!networkStatus || !cacheStatus || !runtimeStatus) {
        return;
    }

    const hasServiceWorkerSupport = 'serviceWorker' in navigator;
    let hasCache = false;

    const syncRuntimeStatus = (): void => {
        if (!navigator.onLine && hasCache) {
            setStatus(runtimeStatus, 'ok', 'Cache');
            return;
        }

        if (sessionStorage.getItem(CACHE_RUNTIME_KEY) === 'cache') {
            setStatus(runtimeStatus, 'warn', 'Fallback');
            return;
        }

        setStatus(runtimeStatus, 'ok', 'Live');
    };

    const syncNetworkStatus = (): void => {
        if (navigator.onLine) {
            sessionStorage.removeItem(CACHE_RUNTIME_KEY);
            setStatus(networkStatus, 'ok', 'Online');
        } else {
            setStatus(networkStatus, 'warn', 'Offline');
        }

        syncRuntimeStatus();
    };

    const syncCacheStatus = async (): Promise<void> => {
        hasCache = await getHasCache();
        setStatus(cacheStatus, hasCache ? 'ok' : 'warn', hasCache ? 'Cache' : 'Kein Cache');
        syncRuntimeStatus();
    };

    window.addEventListener('online', syncNetworkStatus);
    window.addEventListener('offline', syncNetworkStatus);

    syncNetworkStatus();
    void syncCacheStatus();

    if (!hasServiceWorkerSupport) {
        setStatus(cacheStatus, hasCache ? 'ok' : 'warn', hasCache ? 'Cache' : 'Kein SW');
        return;
    }

    navigator.serviceWorker.addEventListener('message', (event: MessageEvent<CacheStatusResponse | { type: string }>) => {
        if (event.data?.type === 'CACHE_STATUS_RESPONSE') {
            hasCache = event.data.hasCache;
            setStatus(cacheStatus, hasCache ? 'ok' : 'warn', hasCache ? 'Cache' : 'Kein Cache');
            syncRuntimeStatus();
            return;
        }

        if (event.data?.type === 'CACHE_FALLBACK_USED') {
            sessionStorage.setItem(CACHE_RUNTIME_KEY, 'cache');
            syncRuntimeStatus();
        }
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
        void syncCacheStatus();
        requestCacheStatus();
    });

    navigator.serviceWorker.ready
        .then(() => {
            requestCacheStatus();
            return syncCacheStatus();
        })
        .catch(() => undefined);
};
