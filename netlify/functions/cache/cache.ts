// Cache functions and memory
const cache: Record<string, any> = {};

export const getCache = () => {
    return cache;
}

export const getCacheItem = <T>(key: string): T | undefined => {
    return cache[key];
}

export const setCache = <T>(key: string, value: T): void => {
    cache[key] = value;
}