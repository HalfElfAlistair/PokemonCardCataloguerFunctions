console.log("Cache module loaded");

// Cache functions and memory
const cache: Record<string, any> = {};
export function getCache<T>(key: string): T | undefined {
    return cache[key];
}
export function setCache<T>(key: string, value: T): void {
    cache[key] = value;
}