import { z } from 'zod';

type Plan = "FREE" | "PRO" | "ENTERPRISE";
type SubscriptionStatus = "ACTIVE" | "PAST_DUE" | "CANCELED" | "UNPAID" | "TRIALING" | "PAUSED" | "INCOMPLETE";
type BillingInterval = "MONTHLY" | "YEARLY" | "WEEKLY" | "ONE_TIME";
type InvoiceStatus = "DRAFT" | "OPEN" | "PAID" | "VOID" | "UNCOLLECTIBLE";
type PaymentMethodType = "CARD" | "BANK_TRANSFER" | "ALIPAY" | "WECHAT_PAY" | "CRYPTO";
type UsageType = "API_CALL" | "AI_TOKEN" | "STORAGE" | "COMPUTE" | "BANDWIDTH" | "CUSTOM";
type CreditTransactionType = "PURCHASE" | "USAGE" | "REFUND" | "ADJUSTMENT" | "EXPIRATION" | "BONUS";
interface PlanLimits {
    apiCalls: number;
    aiTokens: number;
    storage: number;
    teamMembers: number;
    projects: number;
    features: string[];
}
declare const DEFAULT_PLAN_LIMITS: Record<Plan, PlanLimits>;
interface PricingConfig {
    id: string;
    plan: Plan;
    name: string;
    description?: string;
    interval: BillingInterval;
    amount: number;
    currency: string;
    trialDays: number;
    trialPeriodDays?: number;
    seatBased?: boolean;
    isDefault?: boolean;
    contactSales?: boolean;
    features: string[];
    limits: PlanLimits;
}
declare const DEFAULT_PRICING: PricingConfig[];
interface UsagePricing {
    type: UsageType;
    unitName: string;
    unitSize: number;
    pricePerUnit: number;
    currency: string;
    includedInPlan: Record<Plan, number>;
}
declare const DEFAULT_USAGE_PRICING: UsagePricing[];
declare const CreateSubscriptionSchema: z.ZodObject<{
    organizationId: z.ZodString;
    pricingPlanId: z.ZodString;
    paymentMethodId: z.ZodOptional<z.ZodString>;
    trialDays: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
declare const UpdateSubscriptionSchema: z.ZodObject<{
    subscriptionId: z.ZodString;
    pricingPlanId: z.ZodOptional<z.ZodString>;
    cancelAtPeriodEnd: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
declare const RecordUsageSchema: z.ZodObject<{
    organizationId: z.ZodString;
    userId: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<{
        API_CALL: "API_CALL";
        AI_TOKEN: "AI_TOKEN";
        STORAGE: "STORAGE";
        COMPUTE: "COMPUTE";
        BANDWIDTH: "BANDWIDTH";
        CUSTOM: "CUSTOM";
    }>;
    quantity: z.ZodNumber;
    resource: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
declare const PurchaseCreditsSchema: z.ZodObject<{
    organizationId: z.ZodString;
    amount: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    paymentMethodId: z.ZodString;
}, z.core.$strip>;
declare const CheckEntitlementSchema: z.ZodObject<{
    organizationId: z.ZodString;
    feature: z.ZodString;
    quantity: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
type CreateSubscriptionInput = z.infer<typeof CreateSubscriptionSchema>;
type UpdateSubscriptionInput = z.infer<typeof UpdateSubscriptionSchema>;
type RecordUsageInput = z.infer<typeof RecordUsageSchema>;
type PurchaseCreditsInput = z.infer<typeof PurchaseCreditsSchema>;
type CheckEntitlementInput = z.infer<typeof CheckEntitlementSchema>;
declare class BillingError extends Error {
    readonly code: string;
    readonly statusCode: number;
    readonly cause?: unknown | undefined;
    constructor(message: string, code: string, statusCode?: number, cause?: unknown | undefined);
}
declare class SubscriptionError extends BillingError {
    constructor(message: string, code: string, cause?: unknown);
}
declare class UsageError extends BillingError {
    constructor(message: string, code: string, cause?: unknown);
}
declare class EntitlementError extends BillingError {
    constructor(message: string, code: string, cause?: unknown);
}
declare class PaymentError extends BillingError {
    constructor(message: string, code: string, cause?: unknown);
}

export { BillingError as B, type CheckEntitlementInput as C, DEFAULT_PLAN_LIMITS as D, EntitlementError as E, type InvoiceStatus as I, PaymentError as P, type RecordUsageInput as R, SubscriptionError as S, type UpdateSubscriptionInput as U, type BillingInterval as a, CheckEntitlementSchema as b, type CreateSubscriptionInput as c, CreateSubscriptionSchema as d, type CreditTransactionType as e, DEFAULT_PRICING as f, DEFAULT_USAGE_PRICING as g, type PaymentMethodType as h, type Plan as i, type PlanLimits as j, type PricingConfig as k, type PurchaseCreditsInput as l, PurchaseCreditsSchema as m, RecordUsageSchema as n, type SubscriptionStatus as o, UpdateSubscriptionSchema as p, UsageError as q, type UsagePricing as r, type UsageType as s };
