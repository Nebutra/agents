/**
 * CacheClient — provider-agnostic cache interface.
 *
 * Tracks only the methods our strategies and downstream consumers actually use
 * (audited via grep on 2026-05-12). Keeping the surface tiny lets us back the
 * interface with both `@upstash/redis` (HTTP REST) and `ioredis` (TCP) without
 * exposing protocol-specific quirks to callers.
 *
 * Adding new methods here = adding adapter impls in BOTH `upstash.ts` and
 * `ioredis.ts`. Don't bypass the interface by typing as `Redis` directly.
 */
export {};
