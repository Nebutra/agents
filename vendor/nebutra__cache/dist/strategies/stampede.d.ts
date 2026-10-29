export interface StampedeOptions {
    /** Cache TTL in seconds */
    ttl: number;
    /** Lock TTL in seconds */
    lockTTL?: number;
    /** Retry attempts while waiting for a contended lock holder to fill cache */
    waitRetries?: number;
    /** Initial retry delay in ms while waiting for a contended cache fill */
    waitDelay?: number;
    /** Key prefix */
    prefix?: string;
}
/**
 * Cache with stampede prevention
 * Uses distributed lock to prevent multiple processes from
 * regenerating the same cache entry simultaneously
 */
export declare class StampedeCache {
    private prefix;
    private ttl;
    private lockTTL;
    private waitRetries;
    private waitDelay;
    private lock;
    constructor(options: StampedeOptions);
    private key;
    /**
     * Get or set with stampede prevention
     */
    getOrSet<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T>;
}
/**
 * Create a stampede-protected cache
 */
export declare function createStampedeCache(options: StampedeOptions): StampedeCache;
//# sourceMappingURL=stampede.d.ts.map