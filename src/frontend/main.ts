// import 'vite/dynamic-import-polyfill'; // for prod mode
import './_shared/index.css';
import { createAppStatusBar } from './components/molecules/app-status/app-status';
import { createDropdowns } from './components/molecules/dropdown/dropdown';
import { activateFilterButtons } from './components/molecules/filter-button/filter-button';
import { setupSearch } from './components/molecules/search/search.molecule';
import { createPortfolio } from './components/organisms/portfolio/portfolio';

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>,
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>,
};

type InstallUiState = 'available' | 'installed' | 'unavailable';

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

    if ('serviceWorker' in navigator && import.meta.env.PROD) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(() => undefined);
        });
    }
})();
