import { z } from "zod";
/**
 * Supported metering backend providers.
 *
 * - `clickhouse` — ClickHouse (production analytics DB, already in stack)
 * - `memory`     — In-memory metering for local dev & testing (NOT for production)
 */
export type MeteringProviderType = "clickhouse" | "memory";
/**
 * Meter types supported by the metering system.
 *
 * - `counter`       — Cumulative count (e.g., API calls, total tokens)
 * - `gauge`         — Point-in-time measurement (e.g., current storage usage)
 * - `histogram`     — Distribution of values (e.g., request latencies)
 * - `unique_count`  — Count of unique identifiers (e.g., active users)
 */
export type MeterType = "counter" | "gauge" | "histogram" | "unique_count";
/**
 * Aggregation functions for meters.
 *
 * - `sum`           — Total across period (counters)
 * - `max`           — Maximum value in period (gauges)
 * - `count`         — Count of events
 * - `count_distinct`— Count of unique identifiers
 */
export type AggregationType = "sum" | "max" | "count" | "count_distinct";
/**
 * Billing period granularity.
 */
export type PeriodType = "hourly" | "daily" | "monthly";
export declare const MeterDefinitionSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<{
        counter: "counter";
        gauge: "gauge";
        histogram: "histogram";
        unique_count: "unique_count";
    }>;
    description: z.ZodOptional<z.ZodString>;
    unit: z.ZodString;
    aggregation: z.ZodEnum<{
        sum: "sum";
        max: "max";
        count: "count";
        count_distinct: "count_distinct";
    }>;
}, z.core.$strip>;
export type MeterDefinition = z.infer<typeof MeterDefinitionSchema>;
export declare const UsageEventSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    meterId: z.ZodString;
    tenantId: z.ZodString;
    value: z.ZodNumber;
    timestamp: z.ZodOptional<z.ZodString>;
    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    idempotencyKey: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UsageEvent = z.infer<typeof UsageEventSchema>;
export interface UsageSummary {
    /** Meter being reported on */
    meterId: string;
    /** Tenant being reported on */
    tenantId: string;
    /** Start of the billing period (ISO-8601) */
    periodStart: string;
    /** End of the billing period (ISO-8601) */
    periodEnd: string;
    /** Aggregated value for the period */
    value: number;
    /** Optional breakdown by dimension */
    breakdown?: Record<string, number> | undefined;
}
export interface UsageQuota {
    /** Meter being tracked */
    meterId: string;
    /** Tenant being tracked */
    tenantId: string;
    /** Quota limit for the period */
    limit: number;
    /** Current usage */
    used: number;
    /** Remaining quota */
    remaining: number;
    /** Percentage used (0-100) */
    percentage: number;
    /** Billing period type */
    period: PeriodType;
    /** Period start date (ISO-8601) */
    periodStart: string;
    /** Period end date (ISO-8601) */
    periodEnd: string;
}
export interface ThresholdAlert {
    /** Meter that triggered the alert */
    meterId: string;
    /** Tenant that triggered the alert */
    tenantId: string;
    /** Threshold that was crossed (0.8, 0.9, 1.0) */
    threshold: number;
    /** Current usage value */
    currentUsage: number;
    /** Quota limit */
    limit: number;
    /** ISO-8601 timestamp of the alert */
    triggeredAt: string;
}
export interface QuotaEnforcementInput {
    /** Meter being checked */
    meterId: string;
    /** Current usage for the billing period */
    used: number;
    /** Usage that would be consumed by the pending operation */
    requested?: number;
    /** Billing-style usage limit. `-1` means unlimited. */
    limit: number;
}
export interface QuotaEnforcementResult {
    /** Whether the pending operation is within the usage limit */
    allowed: boolean;
    /** Meter being checked */
    meterId: string;
    /** Current usage for the billing period */
    used: number;
    /** Usage that would be consumed by the pending operation */
    requested: number;
    /** Usage after applying the pending operation */
    projected: number;
    /** Billing-style usage limit. `-1` means unlimited. */
    limit: number;
    /** Remaining quota before the pending operation, or Infinity for unlimited */
    remaining: number;
    /** Human-readable denial reason when blocked */
    reason?: string;
}
/**
 * Every metering backend must implement this interface.
 * The factory function (`createMetering`) returns a `MeteringProvider`.
 */
export interface MeteringProvider {
    readonly name: MeteringProviderType;
    /**
     * Register a meter definition.
     */
    defineMeter(definition: MeterDefinition): Promise<void>;
    /**
     * Ingest a single usage event.
     */
    ingest(event: UsageEvent): Promise<void>;
    /**
     * Ingest multiple events in a single batch (optimized for high-throughput).
     */
    ingestBatch(events: UsageEvent[]): Promise<void>;
    /**
     * Get usage for the current billing period.
     */
    getUsage(tenantId: string, meterId: string, period: PeriodType): Promise<UsageSummary | null>;
    /**
     * Get historical usage across multiple periods.
     */
    getUsageHistory(tenantId: string, meterId: string, opts: {
        period: PeriodType;
        startDate: string;
        endDate: string;
    }): Promise<UsageSummary[]>;
    /**
     * Get current quota status.
     */
    getQuota(tenantId: string, meterId: string, period: PeriodType): Promise<UsageQuota | null>;
    /**
     * Set or update a quota limit for a meter.
     */
    setQuota(tenantId: string, meterId: string, limit: number, period: PeriodType): Promise<void>;
    /**
     * Get usage breakdown by a specific dimension.
     */
    getBreakdown(tenantId: string, meterId: string, dimension: string, period: PeriodType): Promise<Record<string, number>>;
    /**
     * Check if usage exceeds a threshold and return alert if so.
     */
    checkThreshold(tenantId: string, meterId: string, threshold: number, period: PeriodType): Promise<ThresholdAlert | null>;
    /**
     * Graceful shutdown — drain any pending operations, close connections.
     */
    close(): Promise<void>;
}
export interface ClickHouseProviderConfig {
    provider: "clickhouse";
    /**
     * ClickHouse HTTP URL (defaults to `process.env.CLICKHOUSE_URL`).
     * Legacy `CLICKHOUSE_HTTP_URL` is also honoured for backwards compatibility.
     */
    url?: string;
    /** Legacy alias for `url`. Prefer `url`. */
    httpUrl?: string;
    /** ClickHouse username (defaults to `process.env.CLICKHOUSE_USERNAME`, then `default`). */
    username?: string;
    /** ClickHouse password (defaults to `process.env.CLICKHOUSE_PASSWORD`). */
    password?: string;
    /** Database name (defaults to `process.env.CLICKHOUSE_DATABASE` or `nebutra_metering`). */
    database?: string;
    /** Batch size for inserts (default: 100). */
    batchSize?: number;
    /** Batch flush interval in milliseconds (default: 1000). */
    flushIntervalMs?: number;
    /** Skip auto-running schema bootstrap (default: false). Set true if migrations are managed externally. */
    skipBootstrap?: boolean;
}
export interface MemoryProviderConfig {
    provider: "memory";
}
export type MeteringConfig = ClickHouseProviderConfig | MemoryProviderConfig;
//# sourceMappingURL=types.d.ts.map