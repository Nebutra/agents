import { logger } from "@nebutra/logger";
import { getCacheClient } from "../client.js";
async function getRedis() {
    return getCacheClient();
}
/**
 * Standard TTL-based cache
 */
export class TTLCache {
    prefix;
    defaultTTL;
    constructor(options) {
        this.prefix = options.prefix || "cache";
        this.defaultTTL = options.ttl;
    }
    key(k) {
        return `${this.prefix}:${k}`;
    }
    /**
     * Get value from cache. Returns null on Redis unavailability (graceful cache miss).
     */
    async get(key) {
        try {
            const redis = await getRedis();
            return await redis.get(this.key(key));
        }
        catch (err) {
            logger.warn("[cache] Redis get failed — treating as cache miss", { key, err });
            return null;
        }
    }
    /**
     * Set value in cache. Silently skips on Redis unavailability.
     */
    async set(key, value, ttl) {
        try {
            const redis = await getRedis();
            await redis.set(this.key(key), value, { ex: ttl || this.defaultTTL });
        }
        catch (err) {
            logger.warn("[cache] Redis set failed — skipping cache write", { key, err });
        }
    }
    /**
     * Delete value from cache. Silently skips on Redis unavailability.
     */
    async delete(key) {
        try {
            const redis = await getRedis();
            await redis.del(this.key(key));
        }
        catch (err) {
            logger.warn("[cache] Redis delete failed", { key, err });
        }
    }
    /**
     * Get or set with callback
     */
    async getOrSet(key, fetcher, ttl) {
        const cached = await this.get(key);
        if (cached !== null) {
            return cached;
        }
        const value = await fetcher();
        await this.set(key, value, ttl);
        return value;
    }
}
/**
 * Create a TTL cache instance
 */
export function createTTLCache(options) {
    return new TTLCache(options);
}
