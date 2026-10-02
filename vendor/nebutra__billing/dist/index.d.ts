import { a as PaymentSession } from './stripe-DcMk-jws.js';
export { B as BillingProviderReadiness, b as BillingProviderReadinessInput, c as BillingProviderReadinessStatus, d as CREDIT_PURCHASE_METADATA_TYPE, e as CheckoutConfig, C as CheckoutProvider, f as CheckoutProviderType, g as CreditPurchaseMetadata, h as CreditPurchaseWebhookInput, i as CreditPurchaseWebhookResult, j as PAYMENT_ORDER_METADATA_KEY, P as PaymentSessionInput, k as PaymentSessionInputSchema, l as detectProvider, m as getCheckout, n as handleCreditPurchaseWebhook, o as isChinaPayConfigured, r as refundStripeCheckoutSession, p as resolveBillingProviderReadiness } from './stripe-DcMk-jws.js';
export { ALIPAY_NOTIFY_SUCCESS_BODIES, AlipayConfig, AlipayNotificationFields, ChinaPayChannel, ChinaPayMethod, ChinaPayOrder, RefundChinaPayOrderInput, WECHAT_NOTIFY_FAIL, WECHAT_NOTIFY_OK, WechatNotificationHeaders, WechatPayConfig, WechatPaymentResource, buildAlipayWapPayUrl, createAlipayPrecreateOrder, createChinaPayOrder, createWechatH5Order, createWechatNativeOrder, ensurePem, getAlipayConfig, getWechatPayConfig, initAlipay, initWechatPay, queryAlipayOrder, queryChinaPayOrder, queryWechatOrder, refundAlipayOrder, refundChinaPayOrder, refundWechatOrder, resetChinaPayConfig, verifyAlipayNotification, verifyAndDecryptWechatNotification } from './chinapay/index.js';
export { CacheAdapter, FeatureValue, LimitConfig, PlanConfig, PlanConfigService, ResolvedConfig, getPlanConfig, initPlanConfig } from './config/index.js';
import { WalletProduct } from './credits/index.js';
export { CreditLotSource, ExpiringCredits, addBonusCredits, addCredits, assertWalletProduct, creditsToDollars, deductCredits, dollarsToCredits, expireCreditLots, formatCredits, getCreditAllowanceForPlan, getCreditBalance, getCreditBalanceFresh, getCreditTransactions, getExpiringCredits, hasEnoughCredits, hasEnoughCreditsFresh, invalidateCreditCache, refundCredits } from './credits/index.js';
import { B as BillingTenantDb } from './db-f_I8E4zB.js';
export { I as InputJsonValue, c as configureBillingTenantDb } from './db-f_I8E4zB.js';
export { FEATURES, METER_TO_PLAN_LIMIT, PLAN_FEATURES, UsageEntitlementResult, checkEntitlement, checkEntitlementUsage, getEntitlements, grantEntitlement, incrementUsage, initializePlanEntitlements, isPlanFeature, requireEntitlement, requireEntitlementUsage, resetUsage, revokeEntitlement } from './entitlements/index.js';
export { ClockWebhookInboxState, STRIPE_TEST_CLOCK_IN_FLIGHT_MS, StripeTestClock, StripeTestClockApi, advanceStripeTestClock, clockAdvanceCrossesPeriodEnd, createBillingPortalSession, createCheckoutSession, createCustomer, createStripeTestClock, decideClockWebhookReplay, deleteCustomer, getCustomer, getOrCreateCustomer, getStripe, getWebhookSecret, initStripe, invoiceEventsAfterClockAdvance, isStripeTestModeSecret, requireStripeTestClockSecret, updateCustomer } from './stripe/index.js';
export { cancelStripeSubscription, createStripeSubscription, getCustomerSubscriptions, getStripeSubscription, mapStripeStatusToLocal, pauseStripeSubscription, previewSubscriptionChange, resumeStripeSubscription, unpauseStripeSubscription, updateStripeSubscription } from './subscriptions/index.js';
export { B as BillingError, a as BillingInterval, C as CheckEntitlementInput, b as CheckEntitlementSchema, c as CreateSubscriptionInput, d as CreateSubscriptionSchema, e as CreditTransactionType, D as DEFAULT_PLAN_LIMITS, f as DEFAULT_PRICING, g as DEFAULT_USAGE_PRICING, E as EntitlementError, I as InvoiceStatus, h as PaymentError, i as PaymentMethodType, P as Plan, j as PlanLimits, k as PricingConfig, l as PurchaseCreditsInput, m as PurchaseCreditsSchema, R as RecordUsageInput, n as RecordUsageSchema, S as SubscriptionError, o as SubscriptionStatus, p as UpdateSubscriptionInput, q as UpdateSubscriptionSchema, r as UsageError, s as UsagePricing, U as UsageType } from './types-vCj6xfOi.js';
export { G as GetUsageOptions, c as calculateOverageCost, d as checkUsageLimit, f as flushUsageBuffer, e as formatUsage, g as getCurrentPeriod, h as getPlanUsageLimit, i as getUsage, r as recordUsage } from './service-8L7gLgxL.js';
import 'zod';
import 'stripe';
import '@nebutra/metering';

declare const CHECKOUT_PLANS: readonly ["pro", "enterprise"];
declare const CHECKOUT_INTERVALS: readonly ["monthly", "yearly"];
type CheckoutPlanId = (typeof CHECKOUT_PLANS)[number];
type CheckoutInterval = (typeof CHECKOUT_INTERVALS)[number];
interface CheckoutSelection {
    plan: CheckoutPlanId;
    interval: CheckoutInterval;
}
interface CheckoutOffer {
    plan: CheckoutPlanId;
    interval: CheckoutInterval;
    priceId: string;
    quantity: 1;
    trialPeriodDays?: number;
}
declare function parseCheckoutSelection(input: {
    plan?: unknown;
    interval?: unknown;
}): CheckoutSelection;
declare function resolveCheckoutOffer(selection: CheckoutSelection, env?: NodeJS.ProcessEnv): CheckoutOffer;
declare function resolveCheckoutReturnUrls(env?: NodeJS.ProcessEnv): {
    successUrl: string;
    cancelUrl: string;
};
declare function assertProductReturnUrl(value: string, env?: NodeJS.ProcessEnv): string;

interface CreemConfig {
    apiKey: string;
    /** The one-time product every checkout is opened against. */
    productId: string;
    /** Signs webhook deliveries (Developers → Webhook in the Creem dashboard). */
    webhookSecret?: string;
    /** Test mode uses https://test-api.creem.io; keys are per mode. */
    testMode: boolean;
}
declare function isCreemConfigured(env?: Record<string, string | undefined>): boolean;
declare function getCreemConfig(env?: Record<string, string | undefined>): CreemConfig;
interface CreateCreemCheckoutInput {
    /** Our PaymentOrder id; comes back as `request_id` on the checkout. */
    requestId: string;
    /** Price in the product's currency, minor units. Creem accepts 100–99,999,999. */
    customPriceMinor: number;
    successUrl: string;
    customerEmail?: string;
    metadata?: Record<string, string>;
}
interface CreemCheckout {
    id: string;
    checkout_url: string;
    status: "pending" | "processing" | "completed" | "expired";
}
declare function createCreemCheckout(input: CreateCreemCheckoutInput, fetchImpl?: typeof fetch): Promise<CreemCheckout>;
interface CreemOrder {
    id: string;
    /** Before tax. Creem adds tax on top as the merchant of record. */
    amount: number;
    currency: string;
    status: string;
}
/** A checkout's state and, once paid, its order. For reconciling lost webhooks. */
declare function getCreemCheckout(checkoutId: string, fetchImpl?: typeof fetch): Promise<{
    status: CreemCheckout["status"];
    order?: CreemOrder;
}>;
declare function refundCreemOrder(creemOrderId: string, fetchImpl?: typeof fetch): Promise<{
    status: "succeeded" | "processing" | "failed";
}>;
declare function verifyCreemSignature(rawBody: string, signature: string | null | undefined, secret?: string | null | undefined): boolean;
interface CreemWebhookEvent {
    id: string;
    eventType: string;
    created_at: number;
    object: {
        id: string;
        request_id?: string;
        metadata?: Record<string, string>;
        order?: CreemOrder;
    };
}

interface FulfillmentContext {
    orderId: string;
    organizationId: string;
    /** The product the order was locked to; its balance is the only one touched. */
    product: string;
    params: Record<string, unknown>;
    amountMinor: number;
    currency: string;
}
interface RevocationContext extends FulfillmentContext {
    refundId: string;
    /** Share of the paid amount refunded, 0 < ratio ≤ 1. */
    ratio: number;
}
interface RevocationResult {
    revoked: boolean;
    reason?: string;
}
interface FulfillmentHandler {
    fulfill(ctx: FulfillmentContext): Promise<void>;
    /** Omit when nothing can be taken back; the refund still moves the money. */
    revoke?(ctx: RevocationContext): Promise<RevocationResult>;
}
declare function registerFulfillment(type: string, handler: FulfillmentHandler): void;
declare function getFulfillment(type: string): FulfillmentHandler;

/** A membership grants its credits per 30-day month, like 剪映's 订阅积分. */
declare const GRANT_PERIOD_DAYS = 30;
interface Membership {
    organizationId: string;
    product: WalletProduct;
    tier: string;
    startsAt: Date;
    endsAt: Date;
    monthlyCredits: number;
}
/** The organization's current membership of a product, or null when it has none or it ended. */
declare function getMembership(organizationId: string, product: WalletProduct, now?: Date): Promise<Membership | null>;
interface MembershipPurchase {
    orderId: string;
    organizationId: string;
    product: WalletProduct;
    tier: string;
    days: number;
    monthlyCredits: number;
    now?: Date;
}
/**
 * Apply a paid membership order. Idempotent on the order id: the id is
 * recorded on the row in the same transaction that extends the period and
 * grants the first month's credits.
 */
declare function applyMembershipPurchase(purchase: MembershipPurchase): Promise<void>;
/**
 * A refund shortens the membership by the refunded share of what the order
 * bought, never into the past, and forgets the order. Credits already granted
 * by it are taken back by the caller through the ledger.
 */
declare function revokeMembershipPurchase(input: {
    orderId: string;
    organizationId: string;
    product: WalletProduct;
    days: number;
    ratio: number;
    now?: Date;
}): Promise<boolean>;
interface GrantResult {
    granted: number;
    errors: number;
}
/**
 * Grant the month's credits to every membership whose next month has begun —
 * an annual 年卡 pays out monthly, like 剪映's SVIP. Keyed on the month's start,
 * so a rerun grants nothing twice.
 */
declare function grantDueMemberships(systemDb: BillingTenantDb, options?: {
    now?: Date;
    limit?: number;
}): Promise<GrantResult>;

type OfferCurrency = "USD" | "CNY";
interface FulfillmentSpec {
    /** Key into the fulfillment registry, e.g. "credits". */
    type: string;
    params: Record<string, unknown>;
}
/** The spec as an order locks it: the offer's product travels with it. */
interface LockedFulfillmentSpec extends FulfillmentSpec {
    product: string;
}
interface AmountRange {
    /** Major units, inclusive. */
    min: number;
    max: number;
}
/**
 * Whose account an offer is bought for — which tenant's balance it feeds.
 *
 * - `personal`: the buyer's own account. Consumer products (Kuanlan, like 剪映).
 * - `organization`: the active organization; buying needs billing rights there.
 * - `workspace`: the active organization when there is one, else the buyer's
 *   own account. Router's rule: an API key belongs to whichever is active.
 */
type OfferAccount = "personal" | "organization" | "workspace";
interface Offer {
    id: string;
    /** The product whose balance this offer feeds, e.g. "router". */
    product: string;
    /** Whose account it is bought for. Defaults to `organization`. */
    account?: OfferAccount;
    name: string;
    /** Fixed price, major units per currency. A currency left out cannot buy this offer. */
    prices?: Partial<Record<OfferCurrency, number>>;
    /** The buyer names the amount within a range per currency. Exclusive with `prices`. */
    customAmount?: Partial<Record<OfferCurrency, AmountRange>>;
    fulfillment: FulfillmentSpec;
    /** Display only: shown as a badge, never read by the payment path. */
    highlight?: string;
    active?: boolean;
}
declare const DEFAULT_OFFERS: readonly Offer[];
/** Replace the whole catalog. Ids must be unique, prices positive, each offer owned by a product. */
declare function configureOffers(offers: readonly Offer[]): void;
/**
 * Load the catalog from `BILLING_OFFERS_JSON` when the deployment sets it: a
 * JSON array of offers, validated like `configureOffers`. Unset keeps the
 * template default. A malformed catalog throws, so a bad price list stops the
 * boot instead of selling at a wrong price.
 */
declare function configureOffersFromEnv(env?: Record<string, string | undefined>): void;
declare function listOffers(product?: string): Offer[];
declare function getOffer(id: string): Offer | undefined;
declare function offerAccount(offer: Offer): OfferAccount;
declare function offerCurrencies(offer: Offer): OfferCurrency[];
/**
 * The price, in major units, an order for this offer is locked at. A fixed
 * offer ignores `requested`; a custom-amount offer takes it and refuses
 * anything outside its range.
 */
declare function priceOffer(offer: Offer, currency: OfferCurrency, requested?: number): number;
/** Both catalog currencies have two decimal places. */
declare function toMinorUnits(major: number): number;
declare function toMajorString(minor: number): string;

type PaymentMethod = "card" | "alipay" | "wechat";
type PaymentOrderStatus = "PENDING" | "PAID" | "PARTIALLY_REFUNDED" | "REFUNDED" | "EXPIRED";
interface PaymentOrderRecord {
    id: string;
    tenantId: string;
    offerId: string;
    fulfillment: unknown;
    amountMinor: number;
    currency: string;
    provider: string;
    method: string;
    providerRef: string | null;
    status: PaymentOrderStatus;
    paidMinor: number | null;
    refundedMinor: number;
    fulfilledAt: Date | null;
    expiresAt: Date;
    metadata: unknown;
    createdAt: Date;
}
interface PaymentOrderStore {
    create(data: {
        tenantId: string;
        offerId: string;
        fulfillment: LockedFulfillmentSpec;
        amountMinor: number;
        currency: string;
        provider: string;
        method: string;
        expiresAt: Date;
    }): Promise<PaymentOrderRecord>;
    findById(id: string): Promise<PaymentOrderRecord | null>;
    setProviderRef(id: string, providerRef: string): Promise<void>;
    markPaid(id: string, data: {
        paidMinor: number;
        providerRef?: string;
    }): Promise<boolean>;
    markFulfilled(id: string): Promise<boolean>;
    markExpired(id: string): Promise<boolean>;
    recordRefund(id: string, data: {
        previousRefundedMinor: number;
        refundedMinor: number;
        fullyRefunded: boolean;
    }): Promise<boolean>;
    listPendingCreatedBefore(before: Date, limit: number): Promise<PaymentOrderRecord[]>;
    listPaidUnfulfilled(limit: number): Promise<PaymentOrderRecord[]>;
    listByTenant(tenantId: string, limit: number): Promise<PaymentOrderRecord[]>;
}
declare function configurePaymentOrderStore(next: PaymentOrderStore): void;
/** Whether a method has credentials behind it right now. */
declare function isPaymentMethodAvailable(method: PaymentMethod): boolean;
/** An organization's orders across every product, newest first. */
declare function listPaymentOrders(organizationId: string, limit?: number): Promise<Array<PaymentOrderRecord & {
    product: string | null;
}>>;
/** Read one order, for status polling and support. */
declare function getPaymentOrder(orderId: string): Promise<PaymentOrderRecord | null>;
interface CreatePaymentOrderInput {
    organizationId: string;
    offerId: string;
    method: PaymentMethod;
    channel?: "qr" | "h5";
    /** Major units, for an offer whose buyer names the amount. Ignored by fixed-price offers. */
    amount?: number;
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
    clientIp?: string;
}
interface CreatedPaymentOrder {
    orderId: string;
    session: PaymentSession;
    amountMinor: number;
    currency: OfferCurrency;
}
declare function createPaymentOrder(input: CreatePaymentOrderInput): Promise<CreatedPaymentOrder>;
interface SettlePaymentOrderInput {
    orderId: string;
    paidMinor: number;
    currency: string;
    providerRef?: string;
}
type SettleOutcome = "settled" | "already_settled" | "not_found";
/**
 * A provider reports the order paid. Idempotent: the second report of the
 * same payment settles nothing and fulfills nothing. A payment that does not
 * match the locked price is refused and never fulfilled — it needs a person.
 */
declare function settlePaymentOrder(input: SettlePaymentOrderInput): Promise<SettleOutcome>;
/** Hand over what was bought. Safe to call any number of times. */
declare function fulfillPaymentOrder(orderId: string): Promise<boolean>;
interface ReconcileResult {
    checked: number;
    settled: number;
    expired: number;
    fulfilled: number;
    errors: number;
}
/**
 * Wallet notifications get lost — a buyer pays, the callback never lands, and
 * the purchase never arrives. This asks the wallet directly about every order
 * pending past RECONCILE_AFTER_MS, and retries fulfillment for any order paid
 * but not handed over. Wallet orders are asked by out_trade_no, Creem orders by
 * their checkout id; Stripe orders are left to Stripe's own webhook retries.
 */
declare function reconcilePaymentOrders(options?: {
    limit?: number;
    now?: Date;
}): Promise<ReconcileResult>;
interface RefundPaymentOrderInput {
    orderId: string;
    /** Idempotency key for the provider. Reuse it to retry the same refund. */
    refundId: string;
    /** Defaults to everything not yet refunded. */
    amountMinor?: number;
    reason?: string;
}
interface RefundPaymentOrderResult {
    status: "succeeded" | "processing" | "failed";
    refundedMinor: number;
    revocation?: RevocationResult;
}
declare function refundPaymentOrder(input: RefundPaymentOrderInput): Promise<RefundPaymentOrderResult>;

export { type AmountRange, BillingTenantDb, CHECKOUT_INTERVALS, CHECKOUT_PLANS, type CheckoutInterval, type CheckoutOffer, type CheckoutPlanId, type CheckoutSelection, type CreatePaymentOrderInput, type CreatedPaymentOrder, type CreemCheckout, type CreemConfig, type CreemOrder, type CreemWebhookEvent, DEFAULT_OFFERS, type FulfillmentContext, type FulfillmentHandler, type FulfillmentSpec, GRANT_PERIOD_DAYS, type LockedFulfillmentSpec, type Membership, type Offer, type OfferAccount, type OfferCurrency, type PaymentMethod, type PaymentOrderRecord, type PaymentOrderStatus, type PaymentOrderStore, PaymentSession, type ReconcileResult, type RefundPaymentOrderInput, type RefundPaymentOrderResult, type RevocationContext, type RevocationResult, type SettleOutcome, type SettlePaymentOrderInput, WalletProduct, applyMembershipPurchase, assertProductReturnUrl, configureOffers, configureOffersFromEnv, configurePaymentOrderStore, createCreemCheckout, createPaymentOrder, fulfillPaymentOrder, getCreemCheckout, getCreemConfig, getFulfillment, getMembership, getOffer, getPaymentOrder, grantDueMemberships, isCreemConfigured, isPaymentMethodAvailable, listOffers, listPaymentOrders, offerAccount, offerCurrencies, parseCheckoutSelection, priceOffer, reconcilePaymentOrders, refundCreemOrder, refundPaymentOrder, registerFulfillment, resolveCheckoutOffer, resolveCheckoutReturnUrls, revokeMembershipPurchase, settlePaymentOrder, toMajorString, toMinorUnits, verifyCreemSignature };
