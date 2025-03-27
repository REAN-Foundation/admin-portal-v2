export class CacheMap<K, V> {

    private cache: Map<K, V>;

    constructor() {
        this.cache = new Map<K, V>();
    }

    // Method to set a value in the cache
    set(key: K, value: V): void {
        this.cache.set(key, value);
    }

    // Method to get a value from the cache
    get(key: K): V | undefined {
        console.log(`size: ${this.cache.size}`);
        return this.cache.get(key);
    }

    // Method to check if a key exists in the cache
    has(key: K): boolean {
        return this.cache.has(key);
    }

    // Method to delete a key from the cache
    delete(key: K): boolean {
        return this.cache.delete(key);
    }

    // Method to clear the entire cache
    clear(): void {
        this.cache.clear();
    }

    // Method to get the size of the cache
    size(): number {
        return this.cache.size;
    }
   
}


