// import 'vite/dynamic-import-polyfill'; // for prod mode
import './_shared/index.css';
import { createAppStatusBar } from './components/molecules/app-status/app-status';
import { createDropdowns } from './components/molecules/dropdown/dropdown';
import { activateFilterButtons } from './components/molecules/filter-button/filter-button';
import { setupSearch } from './components/molecules/search/search.molecule';
import { createPiSoundboard } from './components/organisms/pi-soundboard/pi-soundboard';
import { createPortfolio } from './components/organisms/portfolio/portfolio';

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>,
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>,
};

type InstallUiState = 'available' | 'installed' | 'unavailable';

const MUSIC_CACHE_NAME = 'kreativsause-app-v2';
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

const isStartPage = (): boolean => {
    return window.location.pathname === '/' || window.location.pathname === '/index.html';
};

const cacheMusicAsset = async (assetUrl: string): Promise<void> => {
    if (!('caches' in window)) {
        return;
    }

    const existing = await caches.match(assetUrl);
    if (existing) {
        return;
    }

    const response = await fetch(assetUrl, { cache: 'reload' });

    if (!response.ok) {
        throw new Error(`Failed to preload ${assetUrl}`);
    }

    const cache = await caches.open(MUSIC_CACHE_NAME);
    await cache.put(assetUrl, response.clone());
};

const preloadMusicAssets = (): void => {
    if (!import.meta.env.PROD || !isStartPage()) {
        return;
    }

    const scheduleWarmup = window.requestIdleCallback
        ? (callback: () => void) => window.requestIdleCallback(callback)
        : (callback: () => void) => window.setTimeout(callback, 250);

    scheduleWarmup(() => {
        void Promise.allSettled(MUSIC_ASSETS.map((assetUrl) => cacheMusicAsset(assetUrl)));
    });
};

const setupPwaInstall = (): void => {
    const button = document.querySelector<HTMLButtonElement>('[data-pwa-install]');
    const installStatus = document.querySelector<HTMLElement>('[data-install-status]');
    if (!button || !installStatus) {
        return;
    }

    let deferredPrompt: BeforeInstallPromptEvent | null = null;
    const isInstalled = (): boolean => window.matchMedia('(display-mode: standalone)').matches
        || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

    const setInstallState = (state: InstallUiState, label: string): void => {
        installStatus.dataset.state = state === 'installed' ? 'ok' : state === 'available' ? 'ok' : 'warn';
        installStatus.setAttribute('aria-label', label);
        installStatus.title = label;

        const text = installStatus.querySelector<HTMLElement>('.craft-app-status-text');
        if (text) {
            text.textContent = label;
        }
    };

    const syncButton = (): void => {
        const installed = isInstalled();
        const isVisible = deferredPrompt !== null && !installed;

        button.classList.toggle('d-none', !isVisible);
        button.disabled = !isVisible;

        if (installed) {
            setInstallState('installed', 'Installiert');
            return;
        }

        if (isVisible) {
            setInstallState('available', 'Installieren');
            return;
        }

        setInstallState('unavailable', 'Nicht installiert');
    };

    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        deferredPrompt = event as BeforeInstallPromptEvent;
        syncButton();
    });

    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        syncButton();
    });

    button.addEventListener('click', async () => {
        if (!deferredPrompt || isInstalled()) {
            return;
        }

        await deferredPrompt.prompt();
        await deferredPrompt.userChoice.catch(() => undefined);
        deferredPrompt = null;
        syncButton();
    });

    syncButton();
};

(() => {
    setupSearch();
    createPortfolio();
    createDropdowns();
    activateFilterButtons('all');
    setupPwaInstall();
    createAppStatusBar();
    createPiSoundboard();
    preloadMusicAssets();

    if ('serviceWorker' in navigator && import.meta.env.PROD) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(() => undefined);
        });
    }
})();
