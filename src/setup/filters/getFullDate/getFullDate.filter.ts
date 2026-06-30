type FULL_DATE = {
    start?: string;
    end?: string;
}

export const getFullDate = (event: FULL_DATE, format = 'default'): string => {
    const { start, end } = event;
    if(format === 'default'){
        if(start && end){
            return `${start} - ${end}`;
        } else if(start){
            return start;
        } else if(end){
            return end;
        } else {
            return "";
        }
    } else if(format === 'block'){
        const spaceChar = "&nbsp;";
        // fill not existing start or end with empty string to avoid "undefined" in output
        const placeholderDate = spaceChar.repeat(10); // 10 spaces as placeholder for missing date
        const hasMinus = start && start !== "" && end && end !== "";
        const minus = hasMinus ? " - " : spaceChar.repeat(3);
        return `${start && start !== "" ? start : placeholderDate}${minus}${end && end !== "" ? end : placeholderDate}`;
    } else {
        return "";
    }
}