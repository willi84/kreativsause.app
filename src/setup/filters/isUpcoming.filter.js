const isUpcoming = (value) => {
   if (!value) {
        return false;
    }

    let date;

    // deutsches Format: DD.MM.YYYY
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(value)) {
        const [day, month, year] = value.split('.');
        date = new Date(year, month - 1, day);
    }

    // ISO / englisch: YYYY-MM-DD oder YYYY/MM/DD
    else if (/^\d{4}[-/]\d{2}[-/]\d{2}$/.test(value)) {
        date = new Date(value.replace(/\//g, '-'));
    }

    // Fallback: JS versuchen lassen
    else {
        date = new Date(value);
    }

    if (isNaN(date.getTime())) {
        return false;
    }

    // Uhrzeit entfernen → heute zählt mit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    date.setHours(0, 0, 0, 0);

    return date >= today;
}
exports.isUpcoming = isUpcoming;