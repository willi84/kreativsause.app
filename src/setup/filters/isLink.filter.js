const isLinkFilter = (value) => {
    if(typeof value !== 'string'){ return false; }
    // Check if the value is a valid URL or contains image file extensions
    if(value.match(/^(https?:\/\/|www\.)/)){
        return true;
    }
    return false;
  }

exports.isLinkFilter = isLinkFilter;