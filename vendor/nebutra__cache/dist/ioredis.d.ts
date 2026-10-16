import { type Redis as IORedisClient } from "ioredis";
import type { CacheClient, ScanOptions, SetOptions } from "./types.js";
/**
 * ioredis adapter — wraps a standard TCP Redis client (self-hosted Redis,
 * Dragonfly, Vercel KV, Redis Cloud, anything Redis-protocol-compatible).
 *
 * Unlike @upstash/redis, ioredis doesn't auto-(de)serialize JSON. This
 * adapter wraps every write to stringify non-string values, and every read
 * to attempt JSON.parse — falling back to the raw string if parse fails.
 * That gives callers the same structured-value contract as the Upstash
 * adapter.
 *
 * Connection: defaults to process.env.REDIS_URL. Caller can inject an
 * existing client (useful for tests + when the consumer already manages the
 * connection pool).
 */
export declare class IoredisCacheClient implements CacheClient {
    private client;
    constructor(client?: IORedisClient | string);
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: unknown, opts?: SetOptions): Promise<"OK" | null>;
    del(...keys: string[]): Promise<number>;
    ping(): Promise<string>;
    scan(cursor: string | number, options?: ScanOptions): Promise<[string, string[]]>;
    incr(key: string): Promise<number>;
    incrby(key: string, n: number): Promise<number>;
    expire(key: string, seconds: number): Promise<number>;
    eval(script: string, keys: string[], args: Array<string | number>): Promise<unknown>;
    /**
     * Expose the underlying ioredis client for callers that need protocol-level
     * commands (LPUSH, BRPOPLPUSH, etc.) NOT covered by CacheClient. Treat as
     * an escape hatch — extending CacheClient is preferred when the new method
     * is reused.
     */
    unsafeUnderlying(): IORedisClient;
}
//# sourceMappingURL=ioredis.d.ts.map