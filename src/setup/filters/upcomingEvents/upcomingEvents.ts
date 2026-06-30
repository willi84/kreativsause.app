export const parseEventDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;

    const match = String(dateStr).trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (!match) return null;

    const [, day, month, year] = match;
    const result = new Date(Number(year), Number(month) - 1, Number(day));
    return result;
};
export const diffDays = (dateA: Date, dateB: Date): number => {
    const msPerDay = 24 * 60 * 60 * 1000;
    const utcA = Date.UTC(dateA.getFullYear(), dateA.getMonth(), dateA.getDate());
    const utcB = Date.UTC(dateB.getFullYear(), dateB.getMonth(), dateB.getDate());
    return Math.floor((utcA - utcB) / msPerDay);
};

export const compareDates = (strDateA: string, strDateB: string) => {
    const dateA = parseEventDate(strDateA);
    const dateB = parseEventDate(strDateB);
    if (!dateA || !dateB) return 0;
    dateA.setHours(0, 0, 0, 0);
    dateB.setHours(0, 0, 0, 0);
    const diff = diffDays(dateA, dateB);
    return diff;
}

export const filterUpcomingEvents = (projects: any, now: Date) => {
    const types = Object.keys(projects);
    const upcomingEvents: any[] = [];
    const now00 = new Date(now).setHours(0, 0, 0, 0);

    for (const type of types) {
        const items = projects[type];
        for (const item of items) {
            const hasStart = item.start && item.start !== '';
            if (!hasStart) continue;
            const startDate = parseEventDate(item.start);
            if (!startDate) continue;
            const endDate = parseEventDate(item.end);
            const nowStr: string = `${new Date(now00).getDate()}.${new Date(now00).getMonth() + 1}.${new Date(now00).getFullYear()}`;
            if(endDate && endDate.getTime() < now.getTime()) continue;
            const sD = new Date(startDate).setHours(0, 0, 0, 0);

            const nD = new Date(now).setHours(0, 0, 0, 0);
            const isUpcoming = sD >= nD;
            if (isUpcoming) {
                const newItem = { ...item };
                const diff = compareDates(item.start, nowStr);
                if(diff === 0) {
                    newItem.status = 'today';
                } else if(diff === 1) {
                    newItem.status = 'tomorrow';
                }
                // nextWeek
                const currentDayOfWeek = new Date(now).getDay(); // 0 (Sun) to 6 (Sat)
                const daysUntilNextWeek = (7 - currentDayOfWeek) % 7 || 7; // Days until next Monday
                if(diff > 1 && diff <= daysUntilNextWeek + 7) {
                    newItem.status = 'next week';
                }
                upcomingEvents.push(newItem);
            }
        }
    }
    
    
    // sort by start date
    upcomingEvents.sort((a, b) => {
        const dateA = parseEventDate(a.start)?.getTime() || Number.POSITIVE_INFINITY;
        const dateB = parseEventDate(b.start)?.getTime() || Number.POSITIVE_INFINITY;
        return dateA - dateB;
    });

    return upcomingEvents;
}