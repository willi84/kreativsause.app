import { compareDates, diffDays, filterUpcomingEvents, parseEventDate } from './upcomingEvents';

const hackathons = [
    { status: "done", title: "Hack A", start: "24.10.2015", end: "25.10.2015" },
    { status: "done", title: "Hack B", start: "24.10.2026", end: "25.10.2015" },
    { status: "done", title: "Hack C", start: "24.09.2026", end: "25.09.2026" },
];
const talks = [
    { status: "done", event: "Talk A", start: "02.08.2019" },
    { status: "done", event: "Talk B", start: "01.08.2022" },
    { status: "done", event: "Talk C", start: "07.08.2026" },
    { status: "done", event: "Talk D", start: "15.05.2026" },
    { status: "done", event: "Talk E", start: "16.05.2026" },
    { status: "done", event: "Talk F", start: "18.05.2026" },
    { status: "done", event: "Talk G", start: "20.05.2026" },
    { status: "done", event: "Talk H", start: "22.05.2026" },
];
const conferences = [
    { title: "Craft Conference 2026", start: "02.06.2026", end: "05.06.2026" },
    { title: "Craft Conference 2026", start: "03.06.2026", end: "05.06.2026" },
    { title: "Craft Conference 2026", start: "04.06.2026", end: "05.06.2026" },
];
const workshops = [
    { title: "Crafting Code 2026", start: "22.7.2026" },
    { title: "Other Workshop", start: "22.8.2026", end: "23.8.2026" },
    { title: "Before Workshop", start: "2.6.2026" },
    { title: "Crafting Code 2026", start: "22.4.2026" },
    { title: "A Workshop", start: "1.6.2026" },
    { title: "Crafting Code 2026", start: "22.4.2026", end: "" },
];
const projects = [
    {
        "title": "MetaCollect",
        "🔑name": "MetaCollect",
    }
];

const SAMPLE_DATA = {
    hackathons,
    talks,
    conferences,
    workshops,
    projects
};
describe('diffDays()', () => {
    const FN = diffDays;
    it('should calculate the difference in days correctly', () => {
        const dateA = new Date(2026, 4, 17); // 17.05.2026
        const dateB = new Date(2026, 4, 19); // 19.05.2026
        expect(FN(dateA, dateB)).toBe(-2);
        expect(FN(dateB, dateA)).toBe(2);
    });
});

describe('compareDates()', () => {
    const FN = compareDates;
    it('should compare dates correctly', () => {
        expect(FN('17.05.2026', '19.05.2026')).toBe(-2);
        expect(FN('17.05.2026', '18.05.2026')).toBe(-1);
        expect(FN('18.05.2026', '17.05.2026')).toBe(1);
        expect(FN('20.05.2026', '17.05.2026')).toBe(3);
        expect(FN('17.05.2026','17.05.2026')).toBe(0);
    });
});

describe('parseEventDate()', () => {
    const FN = parseEventDate;
    it('should parse valid date string', () => {
        const month = 4;
        const year = 2026;
        const day = 12;
        const d = new Date(year, month - 1, day)
        expect(FN(`${day}.${month}.${year}`)).toEqual(new Date(year, month - 1, day));
        expect(FN(`${day}.0${month}.${year}`)).toEqual(new Date(year, month - 1, day));
    });
});

describe('filterUpcomingEvents()', () => {
    const FN = filterUpcomingEvents;
    it('should return only upcoming events', () => {
        const now = new Date('2026-05-15 00:00:00');
        const EXPECTED = [
            // { status: "done", title: "Hack B", start: "24.10.2026", end: "25.10.2015" },

            { status: "today", event: "Talk D", start: "15.05.2026" },
            { status: "tomorrow", event: "Talk E", start: "16.05.2026" },
            { status: "next week", event: "Talk F", start: "18.05.2026" },
            { status: "next week", event: "Talk G", start: "20.05.2026" },
            { status: "next week", event: "Talk H", start: "22.05.2026" },
            { title: "A Workshop", start: "1.6.2026" },
            { title: "Before Workshop", start: "2.6.2026" },
            { title: "Craft Conference 2026", start: "03.06.2026", end: "05.06.2026" },
            { title: "Crafting Code 2026", start: "22.7.2026" },
            { status: "done", event: "Talk C", start: "07.08.2026" },
            { title: "Other Workshop", start: "22.8.2026", end: "23.8.2026" },
            { status: "done", title: "Hack C", start: "24.09.2026", end: "25.09.2026" },
        ]
        expect(FN(SAMPLE_DATA, now)).toEqual(EXPECTED);
    });
    it('should return only upcoming events', () => {
        const now = new Date('2026-05-15 23:00:00');
        const EXPECTED = [
            // { status: "done", title: "Hack B", start: "24.10.2026", end: "25.10.2015" },

            { status: "today", event: "Talk D", start: "15.05.2026" },
            { status: "tomorrow", event: "Talk E", start: "16.05.2026" },
            { status: "next week", event: "Talk F", start: "18.05.2026" },
            { status: "next week", event: "Talk G", start: "20.05.2026" },
            { status: "next week", event: "Talk H", start: "22.05.2026" },
            { title: "A Workshop", start: "1.6.2026" },
            { title: "Before Workshop", start: "2.6.2026" },
            { title: "Craft Conference 2026", start: "03.06.2026", end: "05.06.2026" },
            { title: "Crafting Code 2026", start: "22.7.2026" },
            { status: "done", event: "Talk C", start: "07.08.2026" },
            { title: "Other Workshop", start: "22.8.2026", end: "23.8.2026" },
            { status: "done", title: "Hack C", start: "24.09.2026", end: "25.09.2026" },
        ]
        expect(FN(SAMPLE_DATA, now)).toEqual(EXPECTED);
    });
});