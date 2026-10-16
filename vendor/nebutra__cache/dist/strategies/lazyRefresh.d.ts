export interface LazyRefreshOptions {
    /** Hard TTL in seconds (cache eviction) */
    ttl: number;
    /** Soft TTL in seconds (trigger background refresh) */
    softTTL: number;
    /** Key prefix */
    prefix?: string;
}
/**
 * Cache with lazy background refresh
 * Returns stale data while refreshing in background before hard expiry
 */
export declare class LazyRefreshCache {
    private prefix;
    private ttl;
    private softTTL;
    private refreshing;
    constructor(options: LazyRefreshOptions);
    private key;
    /**
     * Get or set with lazy refresh
     */
    getOrSet<T>(key: string, fetcher: () => Promise<T>, options?: Partial<LazyRefreshOptions>): Promise<T>;
    private refresh;
    /**
     * Invalidate cache entry
     */
    invalidate(key: string): Promise<void>;
}
/**
 * Create a lazy refresh cache
 */
export declare function createLazyRefreshCache(options: LazyRefreshOptions): LazyRefreshCache;
//# sourceMappingURL=lazyRefresh.d.ts.map