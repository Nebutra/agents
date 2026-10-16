import pRetry from "p-retry";
import { getCacheClient } from "../client.js";
import { createLock } from "./lockCache.js";
async function getRedis() {
    return getCacheClient();
}
class CacheFillPendingError extends Error {
    constructor() {
        super("cache fill pending");
        this.name = "CacheFillPendingError";
    }
}
/**
 * Cache with stampede prevention
 * Uses distributed lock to prevent multiple processes from
 * regenerating the same cache entry simultaneously
 */
export class StampedeCache {
    prefix;
    ttl;
    lockTTL;
    waitRetries;
    waitDelay;
    lock = createLock();
    constructor(options) {
        this.prefix = options.prefix || "stampede";
        this.ttl = options.ttl;
        this.lockTTL = options.lockTTL || 30;
        this.waitRetries = options.waitRetries ?? 3;
        this.waitDelay = options.waitDelay ?? 100;
    }
    key(k) {
        return `${this.prefix}:${k}`;
    }
    /**
     * Get or set with stampede prevention
     */
    async getOrSet(key, fetcher, ttl) {
        const redis = await getRedis();
        const cacheKey = this.key(key);
        // Try to get from cache first
        const cached = await redis.get(cacheKey);
        if (cached !== null) {
            return cached;
        }
        // Cache miss - acquire lock to regenerate
        const lockKey = `${cacheKey}:lock`;
        const result = await this.lock.withLock(lockKey, { ttl: this.lockTTL }, async () => {
            // Double-check cache (another process might have set it)
            const rechecked = await redis.get(cacheKey);
            if (rechecked !== null) {
                return rechecked;
            }
            // Fetch and cache
            const value = await fetcher();
            await redis.set(cacheKey, value, { ex: ttl || this.ttl });
            return value;
        });
        // If we couldn't get the lock, another process is regenerating. Poll with
        // exponential backoff + jitter before falling back to an uncached fetch.
        if (result === null) {
            try {
                return await pRetry(async () => {
                    const eventual = await redis.get(cacheKey);
                    if (eventual !== null)
                        return eventual;
                    throw new CacheFillPendingError();
                }, {
                    retries: this.waitRetries,
                    minTimeout: this.waitDelay,
                    factor: 2,
                    maxTimeout: Math.max(this.waitDelay, this.waitDelay * 2 ** 4),
                    randomize: true,
                    shouldRetry: ({ error }) => error instanceof CacheFillPendingError,
                });
            }
            catch (error) {
                if (!(error instanceof CacheFillPendingError)) {
                    throw error;
                }
            }
            // Last resort - just fetch without caching
            return fetcher();
        }
        return result;
    }
}
/**
 * Create a stampede-protected cache
 */
export function createStampedeCache(options) {
    return new StampedeCache(options);
}
