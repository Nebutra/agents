import { z } from 'zod';

type CheckoutProviderType = "creem" | "stripe" | "chinapay" | "manual";
declare const PaymentSessionInputSchema: z.ZodObject<{
    orderId: z.ZodString;
    organizationId: z.ZodString;
    title: z.ZodString;
    amountMinor: z.ZodNumber;
    currency: z.ZodString;
    successUrl: z.ZodString;
    cancelUrl: z.ZodString;
    customerEmail: z.ZodOptional<z.ZodString>;
    method: z.ZodOptional<z.ZodEnum<{
        alipay: "alipay";
        wechat: "wechat";
    }>>;
    channel: z.ZodOptional<z.ZodEnum<{
        qr: "qr";
        h5: "h5";
    }>>;
    clientIp: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
type PaymentSessionInput = z.infer<typeof PaymentSessionInputSchema>;
interface PaymentSession {
    /** `redirect`: send the browser to `url`. `qr`: render `url` as a QR code. */
    kind: "redirect" | "qr";
    url: string;
    /** The provider's own id for this session, when it differs from the order id. */
    providerRef?: string;
    provider: CheckoutProviderType;
    expiresAt?: Date;
}
interface CheckoutProvider {
    readonly name: CheckoutProviderType;
    createPaymentSession(input: PaymentSessionInput): Promise<PaymentSession>;
}
type CheckoutConfig = {
    provider: "creem";
} | {
    provider: "stripe";
    secretKey?: string;
} | {
    provider: "chinapay";
} | {
    provider: "manual";
};
/** Stripe metadata key carrying the PaymentOrder id back to the webhook. */
declare const PAYMENT_ORDER_METADATA_KEY: "paymentOrderId";
/**
 * Legacy marker from before payment orders: a Stripe session carrying it
 * credits the organization straight from its metadata. Kept only so a session
 * opened before the upgrade still completes; nothing creates one any more.
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
 * 2. Validate required fields (organizationId, product, creditAmount as positive int).
 * 3. Call `addCredits` with `relatedId = sessionId` for idempotency.
 * 4. Swallow duplicate errors (already processed); rethrow other errors.
 */
declare function handleCreditPurchaseWebhook(input: CreditPurchaseWebhookInput): Promise<CreditPurchaseWebhookResult>;

/**
 * Detect which checkout provider to use based on environment variables.
 *
 * Precedence when multiple are set: stripe → chinapay.
 * Set `BILLING_PROVIDER` to override.
 */
declare function detectProvider(): CheckoutProviderType;
/**
 * Whether a wallet has merchant credentials. These are the variables
 * chinapay/client.ts reads — detection used to look at a CHINAPAY_APP_ID
 * nothing else set, so a fully configured merchant still fell to "manual".
 */
declare function isChinaPayConfigured(method?: "alipay" | "wechat"): boolean;
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

/**
 * StripeCheckoutProvider — opens a Stripe Checkout session for one payment
 * order. The price is inline `price_data` because it comes from the order,
 * which took it from the offer catalog; no Stripe Price object is involved.
 */
declare class StripeCheckoutProvider implements CheckoutProvider {
    readonly name: "stripe";
    createPaymentSession(input: PaymentSessionInput): Promise<PaymentSession>;
}
/**
 * Refund part or all of what a Checkout session collected. `refundId` is the
 * idempotency key, so a retried refund never pays out twice.
 */
declare function refundStripeCheckoutSession(input: {
    sessionId: string;
    amountMinor: number;
    refundId: string;
}): Promise<{
    status: "succeeded" | "processing" | "failed";
}>;

export { type BillingProviderReadiness as B, type CheckoutProvider as C, type PaymentSessionInput as P, StripeCheckoutProvider as S, type PaymentSession as a, type BillingProviderReadinessInput as b, type BillingProviderReadinessStatus as c, CREDIT_PURCHASE_METADATA_TYPE as d, type CheckoutConfig as e, type CheckoutProviderType as f, type CreditPurchaseMetadata as g, type CreditPurchaseWebhookInput as h, type CreditPurchaseWebhookResult as i, PAYMENT_ORDER_METADATA_KEY as j, PaymentSessionInputSchema as k, detectProvider as l, getCheckout as m, handleCreditPurchaseWebhook as n, isChinaPayConfigured as o, resolveBillingProviderReadiness as p, refundStripeCheckoutSession as r };
