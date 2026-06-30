import { getFullDate } from './getFullDate.filter';

describe('getFullDate filter', () => {
    const FN = getFullDate;
    const start = '2021-01-01';
    const end = '2021-12-31';
    describe('default format', () => {
        it('should return start and end date when both are provided', () => {
            expect(FN({ start, end })).toBe(`${start} - ${end}`);
        });
    
        it('should return start date when only start is provided', () => {
            expect(FN({ start })).toBe(start);
        });
    
        it('should return end date when only end is provided', () => {
            expect(FN({ end })).toBe(end);
        });
    
        it('should return empty string when neither start nor end is provided', () => {
            expect(FN({})).toBe('');
        });
    });
    describe('block format', () => {
        const placeholder = " ".repeat(10);
        it('should return start and end date when both are provided', () => {
            expect(FN({ start, end }, 'block')).toBe(`${start} ${end}`);
        });
    
        it('should return start date when only start is provided', () => {
            expect(FN({ start }, 'block')).toBe(`${start} ${placeholder}`);
        });
    
        it('should return end date when only end is provided', () => {
            expect(FN({ end }, 'block')).toBe(`${placeholder} ${end}`);
        });
    
        it('should return empty string when neither start nor end is provided', () => {
            expect(FN({}, 'block')).toBe(`${placeholder} ${placeholder}`);
        });
    });
});