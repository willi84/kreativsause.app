export const  getColorFilter = (text: string, list: any): string => {
    // 20 different colors as named string
    const colors = [
       'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'gray', 'teal',
       'cyan', 'magenta', 'lime', 'indigo', 'violet', 'turquoise', 'gold', 'silver', 'bronze', 'maroon'
    ];
    const keys = Object.keys(list);
    const index = keys.indexOf(text);
    if (index === -1) {
        return 'gray'; // default color if text not found in list
    }
    return colors[index % colors.length];
};