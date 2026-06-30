const safeParamIf = (value, condition, alternative = undefined, fallback = undefined) => {
    const hasValue = value && typeof value !== 'undefined';
    const hasAlternative = alternative && typeof alternative !== 'undefined';
    const hasFallback = fallback && typeof fallback !== 'undefined';
    if(condition && hasValue){
        return value;
    } else if(hasAlternative){
        return alternative;
    } else if(hasFallback){
        return fallback;
    } else {
        return "";
    }
}
exports.safeParamIf = safeParamIf;