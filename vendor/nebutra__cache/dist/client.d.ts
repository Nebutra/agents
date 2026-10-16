import type { CacheBackend, CacheClient } from "./types.js";
/**
 * Get the active cache client. Lazy-initialised on first call.
 *
 * Backend modules (`./ioredis`, `./upstash`) are loaded via dynamic
 * `import()` so they remain server-only — webpack/Next.js will NOT bundle
 * `ioredis`'s Node-only deps (`net`, `tls`, etc.) into client bundles
 * that transitively reach this file through the @nebutra/cache barrel.
 *
 * Originally `getCacheClient()` was synchronous and imported both
 * backends at the top of this file. That pulled `ioredis` into any
 * `"use client"` component reachable from a chain like
 * `@nebutra/auth/client → features.ts → @nebutra/feature-flags → @nebutra/cache`
 * and broke Next.js builds with `Module not found: Can't resolve 'net'`.
 */
export declare function getCacheClient(): Promise<CacheClient>;
/** Report which backend the singleton resolved to (or null pre-init). */
export declare function getCacheBackend(): CacheBackend | null;
/**
 * Back-compat alias for the previous `getRedis()` API.
 *
 * NOTE — now async. Old call sites:
 *
 *   const redis = getRedis();
 *   await redis.get("key");
 *
 * Update to:
 *
 *   const redis = await getRedis();
 *   await redis.get("key");
 *
 * Or use the `redis` Proxy below for transparent lazy-init.
 */
export declare function getRedis(): Promise<CacheClient>;
/**
 * Redis client proxy — lazy-initialised, safe to import at module top level.
 *
 * Every method call awaits the backend resolution on first use, then calls
 * through. Callers write `await redis.get(key)` exactly as before — the
 * Promise the Proxy returns transparently chains backend init + method call.
 */
export declare const redis: CacheClient;
export type { Redis } from "./types.js";
//# sourceMappingURL=client.d.ts.map