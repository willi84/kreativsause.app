

const containsFilter = (value, search) => {
    const inputType = typeof value;
    if(!value) return false;
    if(inputType === 'string'){

        switch(typeof search){
            case 'string':
                if(value && value.toLowerCase().indexOf(search.toLowerCase()) !== -1){
                    return true;
                }
                break;
            case 'object':
                const isArray = Array.isArray(search);
                if(isArray && search.length > 0){
                    for(let i = 0; i < search.length; i++){
                        if(value && value.toLowerCase().indexOf(search[i].toLowerCase()) !== -1){
                            return true;
                        }
                    }
                } else if(!isArray && Object.keys(search).length > 0){
                    for(const key in search){
                        if(value && value.toLowerCase().indexOf(search[key].toLowerCase()) !== -1){
                            return true;
                        }
                    }
                }
                break;
            default:
                return false;
        }
    } else if(Array.isArray(value)){
        if(Array.isArray(search)){
            for(let i = 0; i < search.length; i++){
                if(value.indexOf(search[i]) !== -1){
                    return true;
                }
            }
        } else if(typeof search === 'string'){
            if(value.indexOf(search) !== -1){
                return true;
            }
        } else {
            return false;
        }
    }
    
    return false;
  }

exports.containsFilter = containsFilter;