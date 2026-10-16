export interface LockOptions {
    /** Lock TTL in seconds (auto-release) */
    ttl: number;
    /** Retry attempts */
    retries?: number;
    /** Retry delay in ms */
    retryDelay?: number;
}
/**
 * Distributed lock using Redis
 */
export declare class DistributedLock {
    private prefix;
    private key;
    /**
     * Acquire a lock
     */
    acquire(lockKey: string, options: LockOptions): Promise<string | null>;
    /**
     * Release a lock (only if we own it)
     */
    release(lockKey: string, lockId: string): Promise<boolean>;
    /**
     * Execute with lock
     */
    withLock<T>(lockKey: string, options: LockOptions, fn: () => Promise<T>): Promise<T | null>;
}
/**
 * Create a distributed lock instance
 */
export declare function createLock(): DistributedLock;
//# sourceMappingURL=lockCache.d.ts.map