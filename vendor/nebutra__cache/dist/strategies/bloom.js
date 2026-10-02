/**
 * Redis-backed Bloom filter — wraps the `bloom-filters` npm package
 * (Yoshua's library, ~28K weekly downloads, pure JS, TypeScript types).
 *
 * Why a Bloom filter:
 *   - Membership tests in O(1) with bounded false-positive rate, ~10 bits
 *     per element regardless of value size.
 *   - Order-of-magnitude cheaper than `SET` for large dedup sets:
 *       100M elements + 1% false positive = ~120 MB
 *       100M elements + Redis SET = ~6 GB
 *   - AI SaaS use cases: prompt dedup (don't re-charge identical prompts
 *     in the same minute), notification "have you seen this" checks,
 *     email already-registered preflight, click-tracking dedup.
 *
 * Persistence: we serialize the filter to a single Redis key as JSON. On
 * each `add()` we re-serialize and `SET` it — fine for low-write,
 * high-read workloads (the typical Bloom shape). For very hot writes,
 * batch via `addMany()` to amortize the serialization cost.
 *
 * Trade-off vs the `RedisBloom` module: this works on stock Redis /
 * Upstash / Dragonfly without requiring the BF.* commands. Cheaper to
 * deploy, no module dependency. The cost is the read-modify-write cycle
 * on every add — fine for the typical "did we see this before" workload
 * but not for high-throughput counting.
 */
import * as bloomFiltersNs from "bloom-filters";
import { getCacheClient } from "../client.js";
// `bloom-filters` ships as CJS; under Node's ESM resolver the named exports
// land directly on the namespace, under tsx they're nested under `.default`.
// Probe both shapes so both pipelines work.
const bloomFilters = bloomFiltersNs.default ?? bloomFiltersNs;
const { BloomFilter } = bloomFilters;
async function load(key, opts) {
    const cache = await getCacheClient();
    const raw = await cache.get(key);
    if (!raw) {
        const filter = BloomFilter.create(opts.capacity, opts.errorRate ?? 0.01);
        return { filter, count: 0 };
    }
    try {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        // `bloom-filters` types `fromJSON` as `(json: JSON)` (a typo for `any`
        // in their .d.ts) — cast through `any` to bypass the bogus constraint.
        return {
            // biome-ignore lint/suspicious/noExplicitAny: third-party typing bug
            filter: BloomFilter.fromJSON(parsed.filter),
            count: parsed.count ?? 0,
        };
    }
    catch {
        // Corrupt/legacy value — start over rather than crashing the caller.
        return { filter: BloomFilter.create(opts.capacity, opts.errorRate ?? 0.01), count: 0 };
    }
}
async function save(key, filter, count, ttlSeconds) {
    const cache = await getCacheClient();
    const payload = { filter: filter.saveAsJSON(), count };
    const serialized = JSON.stringify(payload);
    await (ttlSeconds ? cache.set(key, serialized, { ex: ttlSeconds }) : cache.set(key, serialized));
}
export function createBloomFilter(opts) {
    const { key } = opts;
    return {
        async add(item) {
            const { filter, count } = await load(key, opts);
            const wasPresent = filter.has(item);
            if (!wasPresent) {
                filter.add(item);
                await save(key, filter, count + 1, opts.ttlSeconds);
            }
            return wasPresent;
        },
        async addMany(items) {
            if (items.length === 0)
                return 0;
            const { filter, count } = await load(key, opts);
            let added = 0;
            for (const item of items) {
                if (!filter.has(item)) {
                    filter.add(item);
                    added++;
                }
            }
            if (added > 0) {
                await save(key, filter, count + added, opts.ttlSeconds);
            }
            return added;
        },
        async has(item) {
            const { filter } = await load(key, opts);
            return filter.has(item);
        },
        async clear() {
            const cache = await getCacheClient();
            await cache.del(key);
        },
        async approxSize() {
            const { count } = await load(key, opts);
            return count;
        },
    };
}
