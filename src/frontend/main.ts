// import 'vite/dynamic-import-polyfill'; // for prod mode
import './_shared/index.css';
import { createDropdowns } from './components/molecules/dropdown/dropdown';
import { activateFilterButtons } from './components/molecules/filter-button/filter-button';
import { setupSearch } from './components/molecules/search/search.molecule';
import { createPortfolio } from './components/organisms/portfolio/portfolio';

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>,
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>,
};

const setupPwaInstall = (): void => {
    const button = document.querySelector<HTMLButtonElement>('[data-pwa-install]');
    if (!button) {
        return;
    }

    let deferredPrompt: BeforeInstallPromptEvent | null = null;
    const isInstalled = (): boolean => window.matchMedia('(display-mode: standalone)').matches
        || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
    const syncButton = (): void => {
        const isVisible = deferredPrompt !== null && !isInstalled();
        button.classList.toggle('d-none', !isVisible);
        button.disabled = !isVisible;
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

        if ('serviceWorker' in navigator && import.meta.env.PROD) {
                window.addEventListener('load', () => {
                        navigator.serviceWorker.register('/sw.js').catch(() => undefined);
                });
        }
})();
