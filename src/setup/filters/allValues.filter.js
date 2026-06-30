const allValues = (object) => {
    const values = Object.values(object);
    if (values.length === 0) return '';
    return values.join(' ').toLowerCase();
}
exports.allValuesFilter = allValues;