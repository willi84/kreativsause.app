import { getElements } from '../../../_shared/select/select';

export const activateFilterButtons = (defaultCategory: string): void => {
    const root: HTMLElement = document as unknown as HTMLElement;
    const filterButtons = getElements(root, '[data-filter-button]');
    const sections = getElements(root, 'article');

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            if (button.classList.contains('inactive')) {
                return;
            }

            const category = button.dataset.filterButton || defaultCategory;
            filterButtons.forEach((btn) => btn.classList.toggle('active', btn === button));

            if (button.closest('[data-portfolio]')) {
                return;
            }

            sections.forEach((section) => {
                const categories = section.dataset.category?.split(',') || [];
                const isVisible = category === defaultCategory ? true : categories.indexOf(category) !== -1;
                section.classList.toggle('d-none', !isVisible);
            });
        });
    });
};
