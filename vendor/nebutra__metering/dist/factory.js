import { logger } from "@nebutra/logger";
// =============================================================================
// Metering Factory — Provider-agnostic metering creation
// =============================================================================
// The factory resolves the correct provider at runtime based on:
//   1. Explicit config passed to `createMetering()`
//   2. `METERING_PROVIDER` environment variable
//   3. Auto-detection based on available env vars (CLICKHOUSE_HTTP_URL)
//
// This lets customers switch backends without changing application code.
// =============================================================================
let defaultProvider = null;
/**
 * Detect which provider to use based on available environment variables.
 */
function detectProvider() {
    if (process.env.CLICKHOUSE_URL || process.env.CLICKHOUSE_HTTP_URL)
        return "clickhouse";
    return "memory";
}
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
export async function createMetering(config) {
    const providerType = config?.provider ??
        process.env.METERING_PROVIDER ??
        detectProvider();
    logger.info("[metering] Creating provider", { provider: providerType });
    switch (providerType) {
        case "clickhouse": {
            const { ClickHouseProvider } = await import("./providers/clickhouse");
            const chConfig = config;
            return new ClickHouseProvider({
                url: chConfig?.url,
                httpUrl: chConfig?.httpUrl,
                username: chConfig?.username,
                password: chConfig?.password,
                database: chConfig?.database,
                batchSize: chConfig?.batchSize,
                flushIntervalMs: chConfig?.flushIntervalMs,
                skipBootstrap: chConfig?.skipBootstrap,
            });
        }
        case "memory": {
            const { MemoryProvider } = await import("./providers/memory");
            return new MemoryProvider();
        }
        default:
            throw new Error(`Unknown metering provider: ${providerType}`);
    }
}
/**
 * Get or create the default (singleton) metering provider.
 * Uses lazy initialisation so import-time side effects are avoided.
 */
export async function getMetering() {
    if (!defaultProvider) {
        defaultProvider = await createMetering();
    }
    return defaultProvider;
}
/**
 * Replace the default metering provider (useful in tests).
 */
export function setMetering(provider) {
    defaultProvider = provider;
}
/**
 * Gracefully shut down the default metering provider.
 */
export async function closeMetering() {
    if (defaultProvider) {
        await defaultProvider.close();
        defaultProvider = null;
    }
}
