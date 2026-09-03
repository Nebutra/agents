import { PeriodType } from '@nebutra/metering';
import { s as UsageType, i as Plan, R as RecordUsageInput } from './types-DvfRZWG_.js';

interface UsageRecord {
    id: string;
    organizationId: string;
    userId?: string;
    type: UsageType;
    quantity: bigint;
    unitCost?: number;
    totalCost?: number;
    resource?: string;
    metadata?: Record<string, unknown>;
    recordedAt: Date;
}
interface UsageSummary {
    organizationId: string;
    period: string;
    usage: {
        type: UsageType;
        quantity: bigint;
        cost: number;
        limit: number;
        percentUsed: number;
    }[];
    totalCost: number;
}
interface UsageCheckResult {
    allowed: boolean;
    remaining: bigint;
    limit: bigint;
    percentUsed: number;
    overage: bigint;
    overageCost: number;
}
/**
 * Record usage event (buffered for performance)
 */
declare function recordUsage(input: RecordUsageInput): void;
/**
 * Flush usage buffer into the dual-write pipeline:
 * 1. `appendUsageLedgerEntry` (Postgres billing ledger)
 * 2. `metering.ingest` (analytics / ClickHouse or memory)
 *
 * Legacy `UsageRecord` Prisma model was removed; this closes TODO(#126).
 * Prefer calling `metering.ingest` + `appendUsageLedgerEntry` directly at
 * call sites; the buffer remains for batched `recordUsage(...)` callers.
 */
declare function flushUsageBuffer(organizationId?: string): Promise<UsageRecord[]>;
/**
 * Check if usage is within limits
 */
declare function checkUsageLimit(currentUsage: bigint, limit: bigint, requestedQuantity: bigint): UsageCheckResult;
/**
 * Get usage limit for a plan and usage type
 */
declare function getPlanUsageLimit(plan: Plan, type: UsageType): bigint;
/**
 * Calculate overage cost
 */
declare function calculateOverageCost(type: UsageType, overageQuantity: bigint): number;
/**
 * Options passed to {@link getUsage}.
 *
 * - `period` maps directly to `PeriodType` in `@nebutra/metering`
 *   (`hourly` | `daily` | `monthly`). We also accept the ergonomic alias
 *   `"month"` / `"day"` / `"hour"` used by the entitlements surface.
 */
interface GetUsageOptions {
    period: PeriodType | "month" | "day" | "hour";
}
/**
 * Read the current aggregated usage for an organization/meter from the metering
 * pipeline. Backed by `@nebutra/metering` — in production this reads from
 * ClickHouse, in tests from the in-memory provider injected via `setMetering`.
 *
 * Returns `0` when no events have been recorded or the meter is unknown to
 * the provider. Callers should treat the return value as authoritative for
 * quota / entitlement checks.
 */
declare function getUsage(organizationId: string, meterId: string, opts: GetUsageOptions): Promise<number>;
/**
 * Get current period string (YYYY-MM)
 */
declare function getCurrentPeriod(): string;
/**
 * Format usage for display
 */
declare function formatUsage(quantity: bigint, type: UsageType): string;

export { type GetUsageOptions as G, type UsageCheckResult as U, checkUsageLimit as a, formatUsage as b, calculateOverageCost as c, getPlanUsageLimit as d, getUsage as e, flushUsageBuffer as f, getCurrentPeriod as g, type UsageRecord as h, type UsageSummary as i, recordUsage as r };
