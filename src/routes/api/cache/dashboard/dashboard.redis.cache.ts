import { CACHE_HOST, CACHE_PASSWORD } from "$env/static/private";
import { createClient, type RedisClientType } from 'redis';
import type { ICache } from "../cache.interface";

export class RedisDashboardCache implements ICache<any> {

    private _client: RedisClientType| null = null;

    private _expiry = 60 * 60 * 24; // 24 hours

    // constructor() {
    //     // Create a client and connect to redis 
    //     try {
    //         this._client = createClient({
    //             url: CACHE_HOST,
    //             password: CACHE_PASSWORD
    //         });
    //         (async () => {
    //             if (this._client) await this._client.connect();
    //             console.log('Connected to Redis.');
    //         })();
            
    //     } catch (error) {
    //         console.log('Error in connected to Redis.', error);
    //     }
        
    // }

    constructor() {
        this._client = createClient({
            url: CACHE_HOST,
            password: CACHE_PASSWORD
        });
    
        this.connectRedis();
    }

    set = async (key: string, value: any): Promise<void> => {
        try {
            if (this._client) {
                const exists = await this._client.exists(key);
                if (exists === 1) {
                    await this._client.del(key);
                }
                await this._client.set(key, JSON.stringify(value), {
                    EX: this._expiry,// 24 hours
                });
            }
        } catch (error) {
            console.error('Error setting dashboard statistics in cache:', error);
        }
        
    };

    get = async (key: string): Promise<any | undefined> => {
        try {
            if (this._client) {
                const val = await this._client.get(key);
                if (val) {
                    const value = JSON.parse(val);
                    return value;
                }
            }
            return undefined;
        } catch (error) {
            console.error('Error getting dashboard statistics from cache:', error);
            return undefined;
        }
        
    };

    has = async (key: string): Promise<boolean> => {
        try {
            if (this._client) {
                const exists = await this._client.exists(key);
                return exists === 1;
            }
            return false;
        } catch (error) {
            console.error('Error checking dashboard statistics in cache:', error);
            return false;
        }

    };

    delete = async (key: string): Promise<boolean> => {
        try {
            if (this._client) {
                const exists = await this._client.exists(key);
                if (exists === 1) {
                    await this._client.del(key);
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Error deleting dashboard statistics from cache:', error);
            return false;
        }

    };

    clear = async (): Promise<void> => {
        try {
            if (this._client) {
                console.log('Clearing cache');
                await this._client.flushAll();
            }
        } catch (error) {
            console.error('Error clearing dashboard cache:', error);
        }
        
    };

    size = async (): Promise<number> => {
        try {
            if (this._client) {
                console.log('Getting dashboard cache size');
                return await this._client.dbSize();
            }
            return 0;
        } catch (error) {
            console.error('Error getting dashboard cache size:', error);
            return 0;
        }
        
    };

    findAndClear = async (searchPattern: string): Promise<string[]> => {
        if (this._client) {
            const keys = await this._client.keys(searchPattern);
            if (keys.length > 0) {
                await this._client.del(keys);
            }
            return keys;
        }
        return [];
    }

    private async connectRedis(): Promise<void> {
        try {
            if (this._client) {
                await this._client.connect();
                console.log('Connected to Redis.');
            }
        } catch (error) {
            console.error('Error connecting to Redis:', error);
            this._client = null;
        }
    }

}
