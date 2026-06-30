const lenFilter = (arr, prop) => {
    if(!prop){
        return (arr || []).length
    } else {
        // count lenght of subproperties and sum
        let num = 0;
        for(let item of (arr || [])){
            num += (item[prop]) ? item[prop].length : 0;
        }
        return num;
    }
}

exports.lenFilter = lenFilter;