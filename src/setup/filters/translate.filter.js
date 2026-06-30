const translateFilter = (key, translations) => {
    if (!translations || typeof translations !== 'object') return key;
    return translations[key] || key;
};

exports.translateFilter = translateFilter;