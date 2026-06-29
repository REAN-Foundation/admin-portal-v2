import { createClient, type RedisClientType } from 'redis';
import type { Session } from '../session';
import type { ICache } from '../cache.interface';

////////////////////////////////////////////////////////////////////////////////////////

export class RedisSessionCache implements ICache<Session> {

    private _client: RedisClientType| null = null;
    private _isConnected: boolean = false;
    private _connectionAttempts: number = 0;
    private _expiry = 60 * 60 * 24; // 24 hours

    constructor() {
        const CACHE_HOST = process.env.CACHE_HOST || 'localhost:6379';
        const CACHE_PASSWORD = process.env.CACHE_PASSWORD;
        
        this._client = createClient({
            url: `redis://${CACHE_HOST}`,
            password: CACHE_PASSWORD
        });
    
        // IMPORTANT: Connect asynchronously but track connection state
        this.connectRedis().catch(err => {
            console.error(`[Redis] Failed to connect on init: ${err instanceof Error ? err.message : String(err)}`);
        });
    }

    private async ensureConnected(): Promise<void> {
        // If already connected, return immediately
        if (this._isConnected && this._client?.isReady) return;
        
        // Wait for connection with timeout (3 seconds)
        let attempts = 0;
        const maxAttempts = 30;
        const startTime = Date.now();
        
        while (!this._isConnected && attempts < maxAttempts) {
            if (this._client?.isReady) {
                this._isConnected = true;
                const connectionTime = Date.now() - startTime;
                console.log(`[Redis] Connected successfully (${connectionTime}ms, attempts: ${attempts})`);
                return;
            }
            await new Promise(r => setTimeout(r, 100)); // Wait 100ms
            attempts++;
        }
        
        const totalTime = Date.now() - startTime;
        console.error(`[Redis] Connection timeout after ${totalTime}ms (${attempts} attempts) - Session operations may fail`);
        this._isConnected = false;
    }

    set = async (key: string, value: Session): Promise<void> => {
        try {
            await this.ensureConnected();
            if (!this._client?.isReady) {
                console.warn(`[Redis] SET operation skipped - client not ready for key: ${key}`);
                return;
            }
            
            const exists = await this._client.exists(key);
            if (exists === 1) {
                await this._client.del(key);
            }
            await this._client.set(key, JSON.stringify(value), {
                EX: this._expiry,// 24 hours
            });
            console.log(`[Redis] Session stored successfully for key: ${key.substring(0, 8)}...`);
        } catch (error) {
            console.error(`[Redis] Error setting session: ${error instanceof Error ? error.message : String(error)}`);
            throw error; // Re-throw so caller knows this failed
        }
        
    };

    get = async (key: string): Promise<Session | undefined> => {
        try {
            await this.ensureConnected();
            if (!this._client?.isReady) {
                console.warn(`[Redis] GET operation skipped - client not ready for key: ${key}`);
                return undefined;
            }
            
            const val = await this._client.get(key);
            if (val) {
                const session = JSON.parse(val) as Session;
                console.log(`[Redis] Session retrieved successfully for userId: ${session.userId}`);
                return session;
            }
            console.warn(`[Redis] Session not found in cache for key: ${key.substring(0, 8)}...`);
            return undefined;
        } catch (error) {
            console.error(`[Redis] Error getting session: ${error instanceof Error ? error.message : String(error)}`);
            return undefined;
        }
    };

    has = async (key: string): Promise<boolean> => {
        try {
            await this.ensureConnected();
            if (this._client?.isReady) {
                const exists = await this._client.exists(key);
                return exists === 1;
            }
            return false;
        } catch (error) {
            console.error('Error checking session in cache:', error);
            return false;
        }

    };

    delete = async (key: string): Promise<boolean> => {
        try {
            await this.ensureConnected();
            if (this._client?.isReady) {
                const exists = await this._client.exists(key);
                if (exists === 1) {
                    await this._client.del(key);
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Error deleting session cache:', error);
            return false;
        }

    };

    clear = async (): Promise<void> => {
        try {
            await this.ensureConnected();
            if (this._client?.isReady) {
                console.log('Clearing cache');
                await this._client.flushAll();
            }
        } catch (error) {
            console.error('Error clearing session cache:', error);
        }
        
    };

    findAndClear = async (searchPattern: string): Promise<string[]> => {
        await this.ensureConnected();
        if (this._client?.isReady) {
            const keys = await this._client.keys(searchPattern);
            if (keys.length > 0) {
                await this._client.del(keys);
            }
            return keys;
        }
        return [];
    }
    
    size = async (): Promise<number> => {
        try {
            await this.ensureConnected();
            if (this._client?.isReady) {
                console.log('Getting cache size');
                return await this._client.dbSize();
            }
            return 0;
        } catch (error) {
            console.error('Error getting sessin cache size:', error);
            return 0;
        }
        
    };

    private async connectRedis(): Promise<void> {
        try {
            if (!this._client) {
                console.error('[Redis] Client is null, cannot connect');
                return;
            }
            
            this._connectionAttempts++;
            console.log(`[Redis] Attempting connection (attempt ${this._connectionAttempts})...`);
            const startTime = Date.now();
            
            await this._client.connect();
            this._isConnected = true;
            const connectionTime = Date.now() - startTime;
            console.log(`[Redis] ✅ Connected successfully in ${connectionTime}ms`);
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error(`[Redis] ❌ Connection failed: ${errorMsg}`);
            this._client = null;
            this._isConnected = false;
        }
    }

}
