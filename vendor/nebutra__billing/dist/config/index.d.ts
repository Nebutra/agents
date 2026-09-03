import { B as BillingTenantDb } from '../db-f_I8E4zB.js';

/**
 * PlanConfigService
 *
 * Database-driven plan configuration with Redis caching
 * Supports:
 * - Dynamic plan/feature/limit configuration
 * - Customer-level overrides
 * - Plan versioning (grandfathering)
 * - Multi-tenant caching
 */

interface PlanConfig {
    id: string;
    slug: string;
    name: string;
    plan: "FREE" | "PRO" | "ENTERPRISE";
    version: string;
    interval: "MONTHLY" | "YEARLY" | "ONE_TIME";
    amount: number;
    currency: string;
    trialDays: number;
    features: Record<string, FeatureValue>;
    limits: Record<string, LimitConfig>;
    isActive: boolean;
    effectiveFrom: Date;
    effectiveTo: Date | null;
}
interface FeatureValue {
    enabled: boolean;
    value: unknown;
    metadata?: Record<string, unknown>;
}
interface LimitConfig {
    limit: number;
    unit: string;
    resetPeriod: "monthly" | "daily" | "never";
    overageRate: number | null;
}
interface ResolvedConfig {
    plan: PlanConfig;
    features: Record<string, FeatureValue>;
    limits: Record<string, LimitConfig>;
    overrides: {
        planVersion: string | null;
        features: string[];
        limits: string[];
    };
}
interface CacheAdapter {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttlSeconds?: number): Promise<void>;
    del(key: string): Promise<void>;
    keys(pattern: string): Promise<string[]>;
}
declare class PlanConfigService {
    private prisma;
    private cache;
    private cacheTTL;
    private cachePrefix;
    private static instance;
    constructor(options: {
        prisma: BillingTenantDb;
        cache?: CacheAdapter;
        cacheTTL?: number;
        cachePrefix?: string;
    });
    /**
     * Initialize singleton instance
     */
    static init(options: {
        prisma: BillingTenantDb;
        cache?: CacheAdapter;
        cacheTTL?: number;
    }): PlanConfigService;
    /**
     * Get singleton instance
     */
    static getInstance(): PlanConfigService;
    /**
     * Get resolved configuration for an organization
     * Merges: Plan defaults → Customer overrides
     */
    getConfig(organizationId: string): Promise<ResolvedConfig>;
    /**
     * Get plan by slug (e.g., "pro", "enterprise")
     */
    getPlan(slug: string, version?: string): Promise<PlanConfig | null>;
    /**
     * Get all active plans
     */
    getPlans(options?: {
        publicOnly?: boolean;
    }): Promise<PlanConfig[]>;
    /**
     * Check if organization has feature access
     */
    hasFeature(organizationId: string, featureKey: string): Promise<boolean>;
    /**
     * Get usage limit for organization
     */
    getLimit(organizationId: string, limitKey: string): Promise<LimitConfig | null>;
    /**
     * Check if usage is within limits
     */
    checkLimit(organizationId: string, limitKey: string, currentUsage: number, additionalUsage?: number): Promise<{
        allowed: boolean;
        limit: number;
        current: number;
        remaining: number;
        wouldExceed: boolean;
    }>;
    /**
     * Invalidate cache for organization
     */
    invalidateOrg(organizationId: string): Promise<void>;
    /**
     * Invalidate all plan caches
     */
    invalidatePlans(): Promise<void>;
    /**
     * Invalidate all caches
     */
    invalidateAll(): Promise<void>;
    private getFreePlan;
    private buildFeaturesFromPlan;
    private buildLimitsFromPlan;
    private formatPlanConfig;
}
declare const initPlanConfig: typeof PlanConfigService.init;
declare const getPlanConfig: () => PlanConfigService;

export { type CacheAdapter, type FeatureValue, type LimitConfig, type PlanConfig, PlanConfigService, type ResolvedConfig, getPlanConfig, initPlanConfig };
