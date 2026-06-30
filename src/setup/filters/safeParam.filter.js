const safeParam = (value, fallback = undefined, alternative = undefined) => {
    const hasValue = value && typeof value !== 'undefined';
    const hasAlternative = alternative && typeof alternative !== 'undefined';
    const hasFallback = fallback && typeof fallback !== 'undefined';
    if(hasValue){
        return value;
    } else if(hasAlternative){
        return alternative;
    } else if(hasFallback){
        return fallback;
    } else {
        return "";
    }
}
exports.safeParam = safeParam;