export const getKeysFilter = (obj: Record<string, any>): string[] => {
    if (typeof obj !== 'object' || obj === null) {
        return [];
    }
    return Object.keys(obj);
};