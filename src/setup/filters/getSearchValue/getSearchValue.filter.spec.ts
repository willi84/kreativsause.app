import { getSearchValueFilter } from './getSearchValue.filter';

describe('✅ getSearchValueFilter()', () => {
    const FN = getSearchValueFilter;
    it('should return the search value for the given item and category', () => {
        const ITEM = {
            "🔑name": "craft",
            "📍location": "undefined",
            "status": "active",
            "🌐": "HU",
            "project": "",
            "description": "this is my project description",
            "logo": "https://craft-conf.com/images/icons/craft.ico",
            "pinned": "TRUE",
            "tags": "conference, event",
        }
        expect(FN(ITEM, 'projects')).toEqual(' craft active hu this is my project description conference event projects');
        expect(FN(undefined, 'projects')).toEqual('');
    });
});