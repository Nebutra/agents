import pRetry from "p-retry";
import { getCacheClient } from "../client.js";
async function getRedis() {
    return getCacheClient();
}
/**
 * Sentinel thrown when a SET NX attempt does not win the lock. Used to drive
 * p-retry's backoff loop without conflating "lock contended" with a real error.
 */
class LockNotAcquiredError extends Error {
    constructor() {
        super("lock not acquired");
        this.name = "LockNotAcquiredError";
    }
}
/**
 * Distributed lock using Redis
 */
export class DistributedLock {
    prefix = "lock";
    key(k) {
        return `${this.prefix}:${k}`;
    }
    /**
     * Acquire a lock
     */
    async acquire(lockKey, options) {
        const redis = await getRedis();
        const lockId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const retries = options.retries || 0;
        const retryDelay = options.retryDelay || 100;
        // One initial attempt + `retries` retries on contention, matching p-retry's
        // attempt accounting (total attempts = retries + 1). The fixed `retryDelay`
        // becomes the base delay, now grown with exponential backoff + jitter to
        // avoid a thundering herd when many clients contend for the same lock.
        const attempt = async () => {
            // SET NX with TTL
            const result = await redis.set(this.key(lockKey), lockId, {
                nx: true,
                ex: options.ttl,
            });
            if (result === "OK") {
                return lockId;
            }
            // Contended — signal p-retry to back off and retry.
            throw new LockNotAcquiredError();
        };
        try {
            return await pRetry(attempt, {
                retries,
                factor: 2,
                minTimeout: retryDelay,
                // Cap backoff growth so a large `retries` cannot push a single wait
                // into the multi-second range; jitter spreads contenders out.
                maxTimeout: Math.max(retryDelay, retryDelay * 2 ** 5),
                randomize: true,
                // A SET NX failure is the only retryable condition; let genuine Redis
                // errors fail fast and propagate (matching the original loop, which
                // never caught them).
                shouldRetry: ({ error }) => error instanceof LockNotAcquiredError,
            });
        }
        catch (error) {
            // Lock stayed contended through every attempt — preserve the original
            // contract of returning null on exhaustion. Any other error (e.g. a real
            // Redis failure) propagates, exactly as before.
            if (error instanceof LockNotAcquiredError) {
                return null;
            }
            throw error;
        }
    }
    /**
     * Release a lock (only if we own it)
     */
    async release(lockKey, lockId) {
        const redis = await getRedis();
        const currentLockId = await redis.get(this.key(lockKey));
        if (currentLockId === lockId) {
            await redis.del(this.key(lockKey));
            return true;
        }
        return false;
    }
    /**
     * Execute with lock
     */
    async withLock(lockKey, options, fn) {
        const lockId = await this.acquire(lockKey, options);
        if (!lockId) {
            return null;
        }
        try {
            return await fn();
        }
        finally {
            await this.release(lockKey, lockId);
        }
    }
}
/**
 * Create a distributed lock instance
 */
export function createLock() {
    return new DistributedLock();
}
