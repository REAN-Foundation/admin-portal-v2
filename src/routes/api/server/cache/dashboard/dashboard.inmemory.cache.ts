import { CacheMap } from "../cache.map";
import type { ICache } from "../cache.interface";

export class InMemoryDashboardCache implements ICache<any> {

    private cache: CacheMap<string, any>;

    constructor() {
        this.cache = new CacheMap<string, any>();
    }

    set = async (key: string, value: any): Promise<void> => {
        try {
            this.cache.set(key, value);
        } catch (error) {
            console.error('Error setting dashboard statistics in cache:', error);
        }
    };

    get = async (key: string): Promise<any | undefined> => {
        try {
            return this.cache.get(key);
        } catch (error) {
            console.error('Error getting dashboard statistics from cache:', error);
            return undefined;
        }
    };

    has = async (key: string): Promise<boolean> => {
        try {
            return this.cache.has(key);
        } catch (error) {
            console.error('Error checking dashboard statistics in cache:', error);
            return false;
        }
    };

    delete = async (key: string): Promise<boolean> => {
        try {
            return this.cache.delete(key);
        } catch (error) {
            console.error('Error deleting dashboard statistics from cache:', error);
            return false;
        }
    };

    clear = async (): Promise<void> => {
        try {
            this.cache.clear();
        } catch (error) {
            console.error('Error clearing dashboard cache:', error);
        }

    };

    size = async (): Promise<number> => {
        try {
            return this.cache.size();
        } catch (error) {
            console.error('Error getting size of dashboard cache:', error);
            return 0;
        }
    };
  
}
