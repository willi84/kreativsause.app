import { getElement, getElements } from '../../../_shared/select/select';

const DEFAULT_CATEGORY = 'all';

const getSearchValue = (element: HTMLInputElement): string => element.value
                                                                .trim().toLowerCase()
                                                                .replace(/</g, '&lt;')
                                                                .replace(/>/g, '&gt;');

const parseCategories = (value = ''): string[] => value
    .split(',')
    .map((part) => part.trim().replace(/^[\["'\s]+|[\]"'\s]+$/g, '').toLowerCase())
    .filter(Boolean);

const updateHighlights = (card: HTMLElement, query: string): void => {
    const marks = getElements(card, '[data-search-mark]');
    if (marks.length === 0) {
        return;
    }

    for (const mark of marks) {
        const originalText = mark.textContent || '';
        const lowerText = originalText.toLowerCase();
        if (lowerText.includes(query) && query !== '') {
            const regex = new RegExp(`(${query})`, 'gi');
            mark.innerHTML = originalText.replace(regex, '<mark>$1</mark>');
            mark.classList.add('has-search-highlight');
        } else {
            mark.innerHTML = originalText;
            mark.classList.remove('has-search-highlight');
        }
    }
};

const updateSearchResult = (visibleCount: number, query: string, startTime: number): void => {
    const result = getElement(document as unknown as HTMLElement, '[data-search-result]');
    if (!result) {
        return;
    }

    if (visibleCount > 0 && query !== '') {
        result.classList.remove('search--hidden');
        result.querySelector('[data-search-count]')!.textContent = `${visibleCount}`;
        result.querySelector('[data-search-time]')!.textContent = `${new Date().getTime() - startTime}`;
        return;
    }

    result.classList.add('search--hidden');
};

const updateEmptyState = (emptyState: HTMLElement, visibleCount: number): void => {
    const isEmpty = visibleCount === 0;
    emptyState.classList.toggle('is-visible', isEmpty);
    emptyState.classList.toggle('d-none', !isEmpty);
};

const getActiveCategory = (root: HTMLElement): string => {
    const activeButton = root.querySelector<HTMLElement>('[data-filter-button].active');
    return (activeButton?.dataset.filterButton || DEFAULT_CATEGORY).toLowerCase();
};

export const setupSearch = (): void => {
    const allContexts = document.querySelectorAll<HTMLElement>('[search-context]');
    if (allContexts.length === 0) {
        return;
    }

    for (const context of allContexts) {
        const root = context;
        const sections = getElements(root, '[data-category-section]');
        const filterButtons = getElements(root, '[data-filter-button]');
        const input = root.querySelector<HTMLInputElement>('[data-search-input]');
        const emptyState = root.querySelector<HTMLElement>('[data-search-empty]');

        if (!input || !emptyState) {
            continue;
        }

        const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-search-item]'));
        const applySearch = (): void => {
            const query = getSearchValue(input);
            const activeCategory = getActiveCategory(root);
            const counts = new Map<string, number>([[DEFAULT_CATEGORY, 0]]);
            let visibleCount = 0;
            const startTime = new Date().getTime();

            cards.forEach((card) => {
                if (!card.dataset.search) {
                    console.warn('Card is missing data-search attribute:', card);
                }

                const haystack = card.dataset.search ?? '';
                const categories = parseCategories(card.dataset.category ?? '');
                const matchesSearch = haystack.includes(query);
                const matchesCategory = activeCategory === DEFAULT_CATEGORY || categories.includes(activeCategory);
                const isVisible = matchesSearch && matchesCategory;

                if (matchesSearch) {
                    counts.set(DEFAULT_CATEGORY, (counts.get(DEFAULT_CATEGORY) || 0) + 1);
                    categories.forEach((category) => {
                        counts.set(category, (counts.get(category) || 0) + 1);
                    });
                }

                card.classList.toggle('d-none', !isVisible);
                visibleCount += isVisible ? 1 : 0;
                updateHighlights(card, query);
            });

            updateSearchResult(visibleCount, query, startTime);
            updateEmptyState(emptyState, visibleCount);

            sections.forEach((section) => {
                const countElement = section.querySelector<HTMLElement>('[data-count]');
                const num = section.querySelectorAll('[data-search-item]:not(.d-none)').length;
                const hasNoVisibleItems = num === 0;

                section.classList.toggle('d-none', hasNoVisibleItems);
                if (countElement) {
                    countElement.textContent = `${num}`;
                }
            });

            filterButtons.forEach((button) => {
                const key = (button.dataset.filterButton || DEFAULT_CATEGORY).toLowerCase();
                const count = counts.get(key) || 0;
                const countElement = button.querySelector<HTMLElement>('[data-count]');
                const isInactive = key !== DEFAULT_CATEGORY && count === 0;

                if (countElement) {
                    countElement.textContent = `${count}`;
                }

                button.classList.toggle('inactive', isInactive);
                button.setAttribute('aria-disabled', isInactive ? 'true' : 'false');
            });

            console.log(`Search for "${query}" took ${new Date().getTime() - startTime} ms and found ${visibleCount} results.`);
        };

        input.addEventListener('input', applySearch);
        filterButtons.forEach((button) => {
            button.addEventListener('click', () => {
                window.requestAnimationFrame(applySearch);
            });
        });
        applySearch();
    }
};
