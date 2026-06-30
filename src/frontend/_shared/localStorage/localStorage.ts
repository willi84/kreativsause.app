export const save = (key: string, value: string) => localStorage.setItem(key, value);

export const load = (key: string): string | null => {
    return localStorage.getItem(key);
};

export const saveJson = <T>(key: string, value: T) => {
    save(key, JSON.stringify(value));
};

export const loadJson = <T>(key: string, fallback: T): T => {
    const value = load(key);

    if (!value) {
        return fallback;
    }

    try {
        return JSON.parse(value) as T;
    } catch {
        return fallback;
    }
};