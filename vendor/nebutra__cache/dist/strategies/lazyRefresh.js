import { getCacheClient } from "../client.js";
async function getRedis() {
    return getCacheClient();
}
/**
 * Cache with lazy background refresh
 * Returns stale data while refreshing in background before hard expiry
 */
export class LazyRefreshCache {
    prefix;
    ttl;
    softTTL;
    refreshing = new Set();
    constructor(options) {
        this.prefix = options.prefix || "lazy";
        this.ttl = options.ttl;
        this.softTTL = options.softTTL;
    }
    key(k) {
        return `${this.prefix}:${k}`;
    }
    /**
     * Get or set with lazy refresh
     */
    async getOrSet(key, fetcher, options) {
        const redis = await getRedis();
        const cacheKey = this.key(key);
        const ttl = options?.ttl || this.ttl;
        const softTTL = options?.softTTL || this.softTTL;
        const cached = await redis.get(cacheKey);
        if (cached) {
            const now = Date.now();
            // Check if past soft expiry - trigger background refresh
            if (now > cached.softExpiresAt && !this.refreshing.has(cacheKey)) {
                this.refreshing.add(cacheKey);
                // Background refresh (don't await)
                this.refresh(cacheKey, fetcher, ttl, softTTL).finally(() => {
                    this.refreshing.delete(cacheKey);
                });
            }
            // Return existing value (even if stale)
            return cached.value;
        }
        // Cache miss - fetch synchronously
        return this.refresh(cacheKey, fetcher, ttl, softTTL);
    }
    async refresh(cacheKey, fetcher, ttl, softTTL) {
        const redis = await getRedis();
        const value = await fetcher();
        const now = Date.now();
        const cached = {
            value,
            expiresAt: now + ttl * 1000,
            softExpiresAt: now + softTTL * 1000,
        };
        await redis.set(cacheKey, cached, { ex: ttl });
        return value;
    }
    /**
     * Invalidate cache entry
     */
    async invalidate(key) {
        const redis = await getRedis();
        await redis.del(this.key(key));
    }
}
/**
 * Create a lazy refresh cache
 */
export function createLazyRefreshCache(options) {
    return new LazyRefreshCache(options);
}
