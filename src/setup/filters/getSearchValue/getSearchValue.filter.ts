export const getSearchValueFilter = (item: any, category: string): string => {
    if(!item ){
        return '';
    }
    const keys = Object.keys(item);
    let result = '';
    const FORBIDDEN = ['true', 'false', 'undefined'];
    for(const key of keys){
        const value = item[key];
        if(!value){
            continue; // skip empty values
        }
        if(typeof value === 'string'){
            const strValue = value?.toLowerCase().trim();
            if(strValue.indexOf('http') !== -1){
                continue; // skip urls
            } else if(FORBIDDEN.includes(strValue)){
                continue; // skip forbidden values
            } else {
                const final = strValue
                    .replace(/[,;\.]/ig, ' ') // replace forbidden characters with space
                    .replace(/\s+/ig, ' ') // normalize spaces
                    .trim();
                if(final !== ''){
                    result += ' ' + final;
                }
            }
        }
    }
    return result + ' ' +  (category ? category.toLowerCase() : '');
}