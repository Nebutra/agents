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
export interface BloomFilterOptions {
    /** Redis key holding the serialized filter. */
    key: string;
    /** Expected element count. The filter sizes itself accordingly. */
    capacity: number;
    /** Acceptable false-positive rate. 0.01 = 1% is a good default. */
    errorRate?: number;
    /** TTL in seconds — filter resets after expiry. Omit for no expiry. */
    ttlSeconds?: number;
}
export interface RedisBloomFilter {
    /** Add an item. Returns true if the item was likely already present. */
    add(item: string): Promise<boolean>;
    /** Add multiple items in one round-trip. Returns count newly added. */
    addMany(items: readonly string[]): Promise<number>;
    /** Test for membership. False = definitely not in set; true = probably in set. */
    has(item: string): Promise<boolean>;
    /** Wipe the filter (deletes the Redis key). */
    clear(): Promise<void>;
    /** Approximate filter size (number of items added since last clear). */
    approxSize(): Promise<number>;
}
export declare function createBloomFilter(opts: BloomFilterOptions): RedisBloomFilter;
//# sourceMappingURL=bloom.d.ts.map