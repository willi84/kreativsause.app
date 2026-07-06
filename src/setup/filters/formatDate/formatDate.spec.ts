import { formatDateFilter } from './formatDate';

describe('formatDate()', () => {
    const FN = formatDateFilter;  
    it('should format a date correctly', () => {
        expect(FN('2026-07-06T17:00:00.000Z')).toBe('6. Juli 2026, 17:00');
        expect(FN('2026-07-06T17:00:00.000Z', 'date')).toBe('6. Juli 2026');
        expect(FN('2026-07-06T17:00:00.000Z', 'time')).toBe('17:00');
    });
});