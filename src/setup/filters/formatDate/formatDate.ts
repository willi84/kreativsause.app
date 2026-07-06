export const formatDateFilter = (dateString: string, format: string = 'datetime'): string => {
     const date = new Date(dateString);

    switch (format) {
        case 'date':
            return new Intl.DateTimeFormat('de-DE', {
                timeZone: 'UTC',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }).format(date);

        case 'time':
            return new Intl.DateTimeFormat('de-DE', {
                timeZone: 'UTC',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).format(date);

        case 'datetime':
        default:
            return `${formatDateFilter(dateString, 'date')}, ${formatDateFilter(dateString, 'time')}`;
    }
};