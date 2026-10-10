import type { MeteringConfig, MeteringProvider } from "./types";
/**
 * Create a metering provider instance.
 *
 * @example
 * ```ts
 * // Auto-detect from environment
 * const metering = await createMetering();
 *
 * // Explicit ClickHouse
 * const metering = await createMetering({
 *   provider: "clickhouse",
 *   httpUrl: "http://clickhouse.local:8123",
 * });
 *
 * // Explicit memory (dev/test)
 * const metering = await createMetering({
 *   provider: "memory",
 * });
 * ```
 */
export declare function createMetering(config?: MeteringConfig): Promise<MeteringProvider>;
/**
 * Get or create the default (singleton) metering provider.
 * Uses lazy initialisation so import-time side effects are avoided.
 */
export declare function getMetering(): Promise<MeteringProvider>;
/**
 * Replace the default metering provider (useful in tests).
 */
export declare function setMetering(provider: MeteringProvider): void;
/**
 * Gracefully shut down the default metering provider.
 */
export declare function closeMetering(): Promise<void>;
//# sourceMappingURL=factory.d.ts.map