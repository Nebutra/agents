import { z } from 'zod';

type CheckoutProviderType = "stripe" | "polar" | "lemonsqueezy" | "chinapay" | "manual";
declare const CreditPurchaseInputSchema: z.ZodObject<{
    organizationId: z.ZodString;
    creditAmount: z.ZodNumber;
    amount: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    customerEmail: z.ZodOptional<z.ZodString>;
    customerId: z.ZodOptional<z.ZodString>;
    priceId: z.ZodOptional<z.ZodString>;
    successUrl: z.ZodString;
    cancelUrl: z.ZodString;
    referenceId: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, z.core.$strip>;
type CreditPurchaseInput = z.infer<typeof CreditPurchaseInputSchema>;
interface CreditPurchaseSession {
    url: string;
    sessionId: string;
    provider: CheckoutProviderType;
    expiresAt?: Date;
}
interface CheckoutProvider {
    readonly name: CheckoutProviderType;
    createCreditPurchase(input: CreditPurchaseInput): Promise<CreditPurchaseSession>;
}
type CheckoutConfig = {
    provider: "stripe";
    secretKey?: string;
} | {
    provider: "polar";
    accessToken?: string;
    sandbox?: boolean;
} | {
    provider: "lemonsqueezy";
    apiKey?: string;
    storeId?: string;
} | {
    provider: "chinapay";
    appId?: string;
    appSecret?: string;
    method?: "alipay" | "wechat";
} | {
    provider: "manual";
};
/**
 * Metadata marker embedded in every checkout session so that webhook handlers
 * can distinguish credit purchases from subscriptions or other payment intents.
 */
declare const CREDIT_PURCHASE_METADATA_TYPE: "credit_purchase";
interface CreditPurchaseMetadata {
    type: typeof CREDIT_PURCHASE_METADATA_TYPE;
    organizationId: string;
    /** Stored as string because most providers coerce metadata values to strings. */
    creditAmount: string;
    referenceId?: string;
}

interface CreditPurchaseWebhookInput {
    provider: CheckoutProviderType;
    sessionId: string;
    metadata: Record<string, string | undefined>;
    /** Dollar amount actually received from the provider (for audit trail). */
    amountPaid?: number;
    currency?: string;
}
interface CreditPurchaseWebhookResult {
    handled: boolean;
    organizationId?: string;
    creditAmount?: number;
    transactionId?: string;
    skipped?: "already_processed" | "not_credit_purchase" | "invalid_metadata";
}
/**
 * Handle a credit-purchase checkout completion webhook from any provider.
 *
 * Flow:
 * 1. If `metadata.type !== "credit_purchase"` → return early (not our job).
 * 2. Validate required fields (organizationId, creditAmount as positive int).
 * 3. Call `addCredits` with `relatedId = sessionId` for idempotency.
 * 4. Swallow duplicate errors (already processed); rethrow other errors.
 */
declare function handleCreditPurchaseWebhook(input: CreditPurchaseWebhookInput): Promise<CreditPurchaseWebhookResult>;

/**
 * Detect which checkout provider to use based on environment variables.
 *
 * Precedence when multiple are set: stripe → polar → lemonsqueezy → chinapay.
 * Set `BILLING_PROVIDER` to override.
 */
declare function detectProvider(): CheckoutProviderType;
/**
 * Resolve a checkout provider.
 *
 * Providers are loaded via dynamic import so unused SDKs are never evaluated.
 *
 * @example
 * ```ts
 * // Auto-detect
 * const checkout = await getCheckout();
 * const session = await checkout.createCreditPurchase({
 *   organizationId: "org_123",
 *   creditAmount: 1000,
 *   amount: 9.99,
 *   successUrl: "https://app.example.com/success",
 *   cancelUrl: "https://app.example.com/cancel",
 * });
 * ```
 */
declare function getCheckout(config?: CheckoutConfig): Promise<CheckoutProvider>;

type BillingProviderReadinessStatus = "disabled" | "degraded" | "ready";
interface BillingProviderReadinessInput {
    env?: Record<string, string | undefined>;
    selfServiceEnabled?: boolean;
    requiredPriceEnvVars?: string[];
}
interface BillingProviderReadiness {
    provider: CheckoutProviderType;
    status: BillingProviderReadinessStatus;
    checkoutReady: boolean;
    portalReady: boolean;
    missing: string[];
    title: string;
    description: string;
}
declare function resolveBillingProviderReadiness({ env, selfServiceEnabled, requiredPriceEnvVars, }?: BillingProviderReadinessInput): BillingProviderReadiness;

export { type BillingProviderReadiness as B, CREDIT_PURCHASE_METADATA_TYPE as C, type BillingProviderReadinessInput as a, type BillingProviderReadinessStatus as b, type CheckoutConfig as c, type CheckoutProvider as d, type CheckoutProviderType as e, type CreditPurchaseInput as f, CreditPurchaseInputSchema as g, type CreditPurchaseMetadata as h, type CreditPurchaseSession as i, type CreditPurchaseWebhookInput as j, type CreditPurchaseWebhookResult as k, detectProvider as l, getCheckout as m, handleCreditPurchaseWebhook as n, resolveBillingProviderReadiness as r };
