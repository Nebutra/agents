import type { MeterDefinition } from "./types";
/**
 * API Calls meter — tracks total number of API requests
 * Aggregation: sum of request counts across all endpoints
 * Unit: requests
 */
export declare const API_CALLS: MeterDefinition;
/**
 * AI Tokens meter — tracks token consumption for AI models
 * Aggregation: sum of tokens (input + output)
 * Unit: tokens
 *
 * Dimensions: model (gpt-5.5, claude-sonnet-4.6, etc.), endpoint
 */
export declare const AI_TOKENS: MeterDefinition;
/**
 * Storage Bytes meter — tracks current storage usage
 * Aggregation: maximum value in period (gauge)
 * Unit: bytes
 *
 * Dimensions: storage_type (documents, media, cache)
 */
export declare const STORAGE_BYTES: MeterDefinition;
/**
 * Active Users meter — tracks count of unique active users
 * Aggregation: count of distinct user IDs
 * Unit: users
 *
 * Dimensions: user_type (standard, admin), region
 */
export declare const ACTIVE_USERS: MeterDefinition;
/**
 * Bandwidth meter — tracks data transfer volume
 * Aggregation: sum of bytes transferred
 * Unit: bytes
 *
 * Dimensions: direction (inbound, outbound), region
 */
export declare const BANDWIDTH: MeterDefinition;
/**
 * Request Latency meter — tracks distribution of request latencies
 * Aggregation: histogram (could be max, percentile)
 * Unit: milliseconds
 *
 * Dimensions: endpoint, method (GET, POST, etc.)
 */
export declare const REQUEST_LATENCY: MeterDefinition;
/**
 * Computation Time meter — tracks CPU/GPU time consumed
 * Aggregation: sum of milliseconds
 * Unit: milliseconds
 *
 * Dimensions: compute_type (cpu, gpu, ml)
 */
export declare const COMPUTATION_TIME: MeterDefinition;
/**
 * Database Operations meter — tracks database transactions
 * Aggregation: count of operations
 * Unit: operations
 *
 * Dimensions: operation_type (read, write, delete)
 */
export declare const DB_OPERATIONS: MeterDefinition;
/**
 * Email Messages meter — tracks sent emails
 * Aggregation: count of emails
 * Unit: messages
 *
 * Dimensions: email_type (notification, marketing, transactional)
 */
export declare const EMAIL_MESSAGES: MeterDefinition;
/**
 * Webhooks Fired meter — tracks webhook invocations
 * Aggregation: count of webhooks
 * Unit: webhooks
 *
 * Dimensions: event_type, status (success, failed)
 */
export declare const WEBHOOKS_FIRED: MeterDefinition;
/**
 * All standard meters for bulk registration
 */
export declare const ALL_STANDARD_METERS: readonly [{
    id: string;
    name: string;
    type: "counter" | "gauge" | "histogram" | "unique_count";
    unit: string;
    aggregation: "sum" | "max" | "count" | "count_distinct";
    description?: string | undefined;
}, {
    id: string;
    name: string;
    type: "counter" | "gauge" | "histogram" | "unique_count";
    unit: string;
    aggregation: "sum" | "max" | "count" | "count_distinct";
    description?: string | undefined;
}, {
    id: string;
    name: string;
    type: "counter" | "gauge" | "histogram" | "unique_count";
    unit: string;
    aggregation: "sum" | "max" | "count" | "count_distinct";
    description?: string | undefined;
}, {
    id: string;
    name: string;
    type: "counter" | "gauge" | "histogram" | "unique_count";
    unit: string;
    aggregation: "sum" | "max" | "count" | "count_distinct";
    description?: string | undefined;
}, {
    id: string;
    name: string;
    type: "counter" | "gauge" | "histogram" | "unique_count";
    unit: string;
    aggregation: "sum" | "max" | "count" | "count_distinct";
    description?: string | undefined;
}, {
    id: string;
    name: string;
    type: "counter" | "gauge" | "histogram" | "unique_count";
    unit: string;
    aggregation: "sum" | "max" | "count" | "count_distinct";
    description?: string | undefined;
}, {
    id: string;
    name: string;
    type: "counter" | "gauge" | "histogram" | "unique_count";
    unit: string;
    aggregation: "sum" | "max" | "count" | "count_distinct";
    description?: string | undefined;
}, {
    id: string;
    name: string;
    type: "counter" | "gauge" | "histogram" | "unique_count";
    unit: string;
    aggregation: "sum" | "max" | "count" | "count_distinct";
    description?: string | undefined;
}, {
    id: string;
    name: string;
    type: "counter" | "gauge" | "histogram" | "unique_count";
    unit: string;
    aggregation: "sum" | "max" | "count" | "count_distinct";
    description?: string | undefined;
}, {
    id: string;
    name: string;
    type: "counter" | "gauge" | "histogram" | "unique_count";
    unit: string;
    aggregation: "sum" | "max" | "count" | "count_distinct";
    description?: string | undefined;
}];
//# sourceMappingURL=meters.d.ts.map