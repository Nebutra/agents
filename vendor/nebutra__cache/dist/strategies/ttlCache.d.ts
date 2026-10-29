export interface TTLCacheOptions {
    /** TTL in seconds */
    ttl: number;
    /** Key prefix for namespacing */
    prefix?: string;
}
/**
 * Standard TTL-based cache
 */
export declare class TTLCache {
    private prefix;
    private defaultTTL;
    constructor(options: TTLCacheOptions);
    private key;
    /**
     * Get value from cache. Returns null on Redis unavailability (graceful cache miss).
     */
    get<T>(key: string): Promise<T | null>;
    /**
     * Set value in cache. Silently skips on Redis unavailability.
     */
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    /**
     * Delete value from cache. Silently skips on Redis unavailability.
     */
    delete(key: string): Promise<void>;
    /**
     * Get or set with callback
     */
    getOrSet<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T>;
}
/**
 * Create a TTL cache instance
 */
export declare function createTTLCache(options: TTLCacheOptions): TTLCache;
//# sourceMappingURL=ttlCache.d.ts.map