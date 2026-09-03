import { Redis } from "@upstash/redis";
import type { CacheClient, ScanOptions, SetOptions } from "./types.js";
/**
 * Upstash Redis adapter — wraps the @upstash/redis HTTP client.
 *
 * Upstash already JSON-(de)serializes values automatically, so our wrapper is
 * almost a passthrough. The contract we expose mirrors `@upstash/redis`'s
 * options shape ({ ex, px, nx, xx }) — that was the native shape strategies
 * were written against pre-refactor.
 */
export declare class UpstashRedisCacheClient implements CacheClient {
    private client;
    constructor(client?: Redis);
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: unknown, opts?: SetOptions): Promise<"OK" | null>;
    del(...keys: string[]): Promise<number>;
    ping(): Promise<string>;
    scan(cursor: string | number, options?: ScanOptions): Promise<[string, string[]]>;
    incr(key: string): Promise<number>;
    incrby(key: string, n: number): Promise<number>;
    expire(key: string, seconds: number): Promise<number>;
    eval(script: string, keys: string[], args: Array<string | number>): Promise<unknown>;
}
//# sourceMappingURL=upstash.d.ts.map