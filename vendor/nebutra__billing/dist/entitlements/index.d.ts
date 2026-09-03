import { D as DEFAULT_PLAN_LIMITS, i as Plan } from '../types-DvfRZWG_.js';
import 'zod';

interface Entitlement {
    id: string;
    organizationId: string;
    feature: string;
    isEnabled: boolean;
    limitValue?: bigint;
    usedValue: bigint;
    resetPeriod?: "monthly" | "daily";
    lastResetAt?: Date;
    expiresAt?: Date;
    source: "plan" | "addon" | "trial" | "custom";
    metadata?: Record<string, unknown>;
}
interface EntitlementCheckResult {
    allowed: boolean;
    feature: string;
    reason?: string;
    limit?: bigint;
    used?: bigint;
    remaining?: bigint;
}
interface GrantEntitlementInput {
    organizationId: string;
    feature: string;
    limitValue?: number;
    resetPeriod?: "monthly" | "daily";
    expiresAt?: Date;
    source: "plan" | "addon" | "trial" | "custom";
    metadata?: Record<string, unknown>;
}
declare const FEATURES: {
    readonly "ai.chat": {
        readonly name: "AI Chat";
        readonly description: "Access to AI chat features";
    };
    readonly "ai.embeddings": {
        readonly name: "Embeddings";
        readonly description: "Generate text embeddings";
    };
    readonly "ai.images": {
        readonly name: "Image Generation";
        readonly description: "Generate images with AI";
    };
    readonly "ai.reasoning": {
        readonly name: "AI Reasoning";
        readonly description: "Access to reasoning models";
    };
    readonly "content.create": {
        readonly name: "Content Creation";
        readonly description: "Create content";
    };
    readonly "content.publish": {
        readonly name: "Content Publishing";
        readonly description: "Publish content";
    };
    readonly "content.analytics": {
        readonly name: "Content Analytics";
        readonly description: "View content analytics";
    };
    readonly "recommendations.basic": {
        readonly name: "Basic Recommendations";
        readonly description: "Basic recommendation features";
    };
    readonly "recommendations.advanced": {
        readonly name: "Advanced Recommendations";
        readonly description: "Advanced ML-based recommendations";
    };
    readonly "web3.nft": {
        readonly name: "NFT Features";
        readonly description: "NFT minting and management";
    };
    readonly "web3.wallet": {
        readonly name: "Wallet Integration";
        readonly description: "Web3 wallet integration";
    };
    readonly "team.members": {
        readonly name: "Team Members";
        readonly description: "Add team members";
    };
    readonly "team.roles": {
        readonly name: "Custom Roles";
        readonly description: "Create custom roles";
    };
    readonly "api.access": {
        readonly name: "API Access";
        readonly description: "Direct API access";
    };
    readonly webhooks: {
        readonly name: "Webhooks";
        readonly description: "Configure webhooks";
    };
    readonly sso: {
        readonly name: "SSO/SAML";
        readonly description: "Single sign-on integration";
    };
    readonly audit_logs: {
        readonly name: "Audit Logs";
        readonly description: "View audit logs";
    };
};
type FeatureKey = keyof typeof FEATURES;
declare const PLAN_FEATURES: Record<Plan, FeatureKey[]>;
declare function getEntitlements(_organizationId: string): Promise<Entitlement[]>;
/**
 * @deprecated See {@link DEPRECATION_MESSAGE}. Prefer plan-level feature gating
 * via {@link isPlanFeature} or metered checks via {@link checkEntitlementUsage}.
 *
 * Returns `{ allowed: false }` so callers that still depend on the deleted
 * DB-backed entitlement store cannot silently bypass plan or quota checks.
 */
declare function checkEntitlement(_organizationId: string, feature: string, _quantity?: number): Promise<EntitlementCheckResult>;
/**
 * @deprecated See {@link DEPRECATION_MESSAGE}. Throws so legacy callers fail
 * closed instead of silently bypassing quota or feature enforcement.
 */
declare function requireEntitlement(_organizationId: string, _feature: string, _quantity?: number): Promise<void>;
declare function grantEntitlement(_input: GrantEntitlementInput): Promise<Entitlement>;
declare function revokeEntitlement(_organizationId: string, _feature: string): Promise<void>;
declare function incrementUsage(_organizationId: string, _feature: string, _quantity?: number): Promise<void>;
declare function resetUsage(_organizationId: string, _feature: string): Promise<void>;
declare function initializePlanEntitlements(_organizationId: string, _plan: Plan): Promise<Entitlement[]>;
/**
 * Check if a feature is available in a plan
 */
declare function isPlanFeature(plan: Plan, feature: string): boolean;
/**
 * Meter IDs (from `@nebutra/metering`) → plan limit fields.
 *
 * Expressed as a plain object so that new meters can be registered without
 * touching `checkEntitlementUsage` itself. Keys must match the `id` field
 * of the corresponding `MeterDefinition`.
 */
declare const METER_TO_PLAN_LIMIT: Record<string, keyof (typeof DEFAULT_PLAN_LIMITS)["FREE"]>;
interface UsageEntitlementResult {
    allowed: boolean;
    meterId: string;
    plan: Plan;
    used: number;
    /** Usage requested by the pending operation being checked. */
    requested: number;
    /** Usage after applying the pending operation. */
    projected: number;
    /** Plan limit. `-1` means unlimited (ENTERPRISE). */
    limit: number;
    /** Remaining quota (`Infinity` when `limit === -1`). */
    remaining: number;
    reason?: string;
}
interface CheckEntitlementUsageOptions {
    /** Usage that would be consumed by the operation about to run. */
    requested?: number;
}
/**
 * Check whether a metered feature is within the plan's usage limit.
 *
 * Pulls **live usage** from the metering pipeline and compares it against the
 * plan's configured limit. This is the canonical replacement for the deleted
 * DB-backed entitlement store:
 *
 *     AI call → metering.ingest("ai_tokens", org, N)   [ClickHouse write]
 *             → getUsage(org, "ai_tokens", { period: "monthly" })
 *             → checkEntitlementUsage(org, "ai_tokens", plan)
 *
 * Returns `{ allowed: false }` when usage has reached or exceeded the plan
 * limit. Returns `{ allowed: true, limit: -1 }` for unlimited plans.
 *
 * @throws when the meter is not recognised in {@link METER_TO_PLAN_LIMIT}.
 */
declare function checkEntitlementUsage(organizationId: string, meterId: string, plan: Plan, options?: CheckEntitlementUsageOptions): Promise<UsageEntitlementResult>;
/**
 * Require a metered entitlement to be within limits — throws otherwise.
 */
declare function requireEntitlementUsage(organizationId: string, meterId: string, plan: Plan, options?: CheckEntitlementUsageOptions): Promise<void>;

export { type Entitlement, type EntitlementCheckResult, FEATURES, type FeatureKey, type GrantEntitlementInput, METER_TO_PLAN_LIMIT, PLAN_FEATURES, type UsageEntitlementResult, checkEntitlement, checkEntitlementUsage, getEntitlements, grantEntitlement, incrementUsage, initializePlanEntitlements, isPlanFeature, requireEntitlement, requireEntitlementUsage, resetUsage, revokeEntitlement };
