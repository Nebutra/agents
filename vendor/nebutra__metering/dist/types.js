import { z } from "zod";
// ── Meter Definition ────────────────────────────────────────────────────────
export const MeterDefinitionSchema = z.object({
    /** Unique identifier for the meter (e.g., "api_calls", "ai_tokens") */
    id: z.string().min(1),
    /** Display name for the meter */
    name: z.string(),
    /** Type of meter */
    type: z.enum(["counter", "gauge", "histogram", "unique_count"]),
    /** Human-readable description */
    description: z.string().optional(),
    /** Unit of measurement (e.g., "requests", "tokens", "bytes", "users") */
    unit: z.string(),
    /** How to aggregate values across the period */
    aggregation: z.enum(["sum", "max", "count", "count_distinct"]),
});
// ── Usage Event ─────────────────────────────────────────────────────────────
export const UsageEventSchema = z.object({
    /** Unique event ID (auto-generated if omitted) */
    id: z.string().optional(),
    /** Meter ID this event is for */
    meterId: z.string(),
    /** Tenant ID for multi-tenancy */
    tenantId: z.string(),
    /** Numeric value being recorded */
    value: z.number().min(0),
    /** ISO-8601 timestamp (defaults to now) */
    timestamp: z.string().datetime().optional(),
    /** Arbitrary dimensions for breakdown analysis (e.g., { endpoint: "/v1/chat", model: "gpt-5.5" }) */
    properties: z.record(z.string(), z.unknown()).optional(),
    /** Idempotency key for deduplication */
    idempotencyKey: z.string().optional(),
});
