const filterByProp = (arr, prop, value, invert = false) => {
    if (!Array.isArray(arr)) {
        const keys = Object.keys(arr || {})
        arr = keys.map(key => arr[key])
        if (arr.length === 0) return []
    }
    return arr.filter(item => {
        const matches = item[prop] === value
        return invert ? !matches : matches
    })
}

exports.filterByProp = filterByProp