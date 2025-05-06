import { CacheMap } from "../cache.map";
import type { Session } from "../session";
import type { ICache } from "../cache.interface";

export class InMemorySessionCache implements ICache<Session> {

    private cache: CacheMap<Session>;

    constructor() {
        this.cache = new CacheMap<Session>();
    }

    set = async (key: string, value: Session): Promise<void> => {
        try {
            this.cache.set(key, value);
        } catch (error) {
            console.error('Error setting session in cache:', error);
        }
    };

    get = async (key: string): Promise<Session | undefined> => {
        try {
            return this.cache.get(key);
        } catch (error) {
            console.error('Error getting session from cache:', error);
            return undefined;
        }
    };

    has = async (key: string): Promise<boolean> => {
        try {
            return this.cache.has(key);
        } catch (error) {
            console.error('Error checking session in cache:', error);
            return false;
        }
    };

    delete = async (key: string): Promise<boolean> => {
        try {
            return this.cache.delete(key);
        } catch (error) {
            console.error('Error deleting session from cache:', error);
            return false;
        }
    };

    clear = async (): Promise<void> => {
        try {
            this.cache.clear();
        } catch (error) {
            console.error('Error clearing cache:', error);
        }

    };

    findAndClear = async (searchPattern: string): Promise<string[]> => {
        return this.cache.findAndClear(searchPattern);
    }

    size = async (): Promise<number> => {
        try {
            return this.cache.size();
        } catch (error) {
            console.error('Error getting size of cache:', error);
            return 0;
        }
    };
    
}

