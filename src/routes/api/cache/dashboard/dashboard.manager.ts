import { InMemoryDashboardCache } from './dashboard.inmemory.cache'
import { RedisDashboardCache } from './dashboard.redis.cache';
import { CACHE_TYPE } from '$env/static/private';
import { building } from '$app/environment';
import type { ICache } from '../cache.interface';

////////////////////////////////////////////////////////////////////////////////////////

const getCache = () => {
    //code should not be executed during the build step.
    if (!building) {
        if (CACHE_TYPE === 'in-memory') {
            return new InMemoryDashboardCache();
        }
        return new RedisDashboardCache();
    }
    return new InMemoryDashboardCache();
};

////////////////////////////////////////////////////////////////////////////////////////

export class DashboardManager {

    // static _cache: IDashboardCache = getCache();
    static _cache: ICache<any> = getCache();

    static get = async (key: string): Promise<any | undefined> => {
        return DashboardManager._cache.get(key);
    }

    static set = async (key: string, value: any): Promise<void> => {
        await DashboardManager._cache.set(key, value);
    }

    static has = async (key: string): Promise<boolean> => {
        return DashboardManager._cache.has(key);
    }

    static delete = async (key: string): Promise<boolean> => {
        return DashboardManager._cache.delete(key);
    }

    static deleteMany = async (keys: string[]): Promise<boolean> => {
        let result = true;
        for (const key of keys) {
            result = result && await DashboardManager._cache.delete(key);
        }
        return result;
    }

    static clear = async (): Promise<void> => {
        await DashboardManager._cache.clear();
    }

}
