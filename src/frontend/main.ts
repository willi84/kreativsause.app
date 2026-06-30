// import 'vite/dynamic-import-polyfill'; // for prod mode
import './_shared/index.css';
import { createDropdowns } from './components/molecules/dropdown/dropdown';
import { activateFilterButtons } from './components/molecules/filter-button/filter-button';
import { setupSearch } from './components/molecules/search/search.molecule';
import { createPortfolio } from './components/organisms/portfolio/portfolio';

(() => {
        setupSearch();
        createPortfolio();
        createDropdowns();
        activateFilterButtons('all');

        if ('serviceWorker' in navigator && import.meta.env.PROD) {
                window.addEventListener('load', () => {
                        navigator.serviceWorker.register('/sw.js').catch(() => undefined);
                });
        }
})();
