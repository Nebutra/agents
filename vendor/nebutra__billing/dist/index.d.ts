export { B as BillingProviderReadiness, a as BillingProviderReadinessInput, b as BillingProviderReadinessStatus, C as CREDIT_PURCHASE_METADATA_TYPE, c as CheckoutConfig, d as CheckoutProvider, e as CheckoutProviderType, f as CreditPurchaseInput, g as CreditPurchaseInputSchema, h as CreditPurchaseMetadata, i as CreditPurchaseSession, j as CreditPurchaseWebhookInput, k as CreditPurchaseWebhookResult, l as detectProvider, m as getCheckout, n as handleCreditPurchaseWebhook, r as resolveBillingProviderReadiness } from './readiness-C11Wv_NK.js';
export { ALIPAY_NOTIFY_SUCCESS_BODIES, AlipayConfig, AlipayNotificationFields, ChinaPayMethod, ChinaPayOrder, WECHAT_NOTIFY_FAIL, WECHAT_NOTIFY_OK, WechatNotificationHeaders, WechatPayConfig, WechatPaymentResource, createAlipayPrecreateOrder, createChinaPayOrder, createWechatNativeOrder, ensurePem, getAlipayConfig, getWechatPayConfig, initAlipay, initWechatPay, queryAlipayOrder, queryChinaPayOrder, queryWechatOrder, resetChinaPayConfig, verifyAlipayNotification, verifyAndDecryptWechatNotification } from './chinapay/index.js';
export { CacheAdapter, FeatureValue, LimitConfig, PlanConfig, PlanConfigService, ResolvedConfig, getPlanConfig, initPlanConfig } from './config/index.js';
export { addBonusCredits, addCredits, creditsToDollars, deductCredits, dollarsToCredits, formatCredits, getCreditAllowanceForPlan, getCreditBalance, getCreditTransactions, hasEnoughCredits, refundCredits } from './credits/index.js';
export { B as BillingTenantDb, I as InputJsonValue, c as configureBillingTenantDb } from './db-f_I8E4zB.js';
export { FEATURES, METER_TO_PLAN_LIMIT, PLAN_FEATURES, UsageEntitlementResult, checkEntitlement, checkEntitlementUsage, getEntitlements, grantEntitlement, incrementUsage, initializePlanEntitlements, isPlanFeature, requireEntitlement, requireEntitlementUsage, resetUsage, revokeEntitlement } from './entitlements/index.js';
export { cancelLemonSubscription, createLemonCheckout, getLemonCustomerPortalUrl, getLemonSqueezyConfig, getLemonSubscription, initLemonSqueezy } from './lemonsqueezy/index.js';
export { cancelPolarSubscription, createPolarCheckout, getPolar, getPolarSubscription, initPolar, listPolarProducts } from './polar/index.js';
export { ClockWebhookInboxState, STRIPE_TEST_CLOCK_IN_FLIGHT_MS, StripeTestClock, StripeTestClockApi, advanceStripeTestClock, clockAdvanceCrossesPeriodEnd, createBillingPortalSession, createCheckoutSession, createCustomer, createStripeTestClock, decideClockWebhookReplay, deleteCustomer, getCustomer, getOrCreateCustomer, getStripe, getWebhookSecret, initStripe, invoiceEventsAfterClockAdvance, isStripeTestModeSecret, requireStripeTestClockSecret, updateCustomer } from './stripe/index.js';
export { cancelStripeSubscription, createStripeSubscription, getCustomerSubscriptions, getStripeSubscription, mapStripeStatusToLocal, pauseStripeSubscription, previewSubscriptionChange, resumeStripeSubscription, unpauseStripeSubscription, updateStripeSubscription } from './subscriptions/index.js';
export { B as BillingError, a as BillingInterval, C as CheckEntitlementInput, b as CheckEntitlementSchema, c as CreateSubscriptionInput, d as CreateSubscriptionSchema, e as CreditTransactionType, D as DEFAULT_PLAN_LIMITS, f as DEFAULT_PRICING, g as DEFAULT_USAGE_PRICING, E as EntitlementError, I as InvoiceStatus, P as PaymentError, h as PaymentMethodType, i as Plan, j as PlanLimits, k as PricingConfig, l as PurchaseCreditsInput, m as PurchaseCreditsSchema, R as RecordUsageInput, n as RecordUsageSchema, S as SubscriptionError, o as SubscriptionStatus, U as UpdateSubscriptionInput, p as UpdateSubscriptionSchema, q as UsageError, r as UsagePricing, s as UsageType } from './types-DvfRZWG_.js';
export { G as GetUsageOptions, c as calculateOverageCost, a as checkUsageLimit, f as flushUsageBuffer, b as formatUsage, g as getCurrentPeriod, d as getPlanUsageLimit, e as getUsage, r as recordUsage } from './service-YoauCwIM.js';
import 'zod';
import '@lemonsqueezy/lemonsqueezy.js';
import '@polar-sh/sdk';
import '@polar-sh/sdk/models/components/product.js';
import '@polar-sh/sdk/models/components/subscription.js';
import '@polar-sh/sdk/models/components/checkout.js';
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

export { CHECKOUT_INTERVALS, CHECKOUT_PLANS, type CheckoutInterval, type CheckoutOffer, type CheckoutPlanId, type CheckoutSelection, assertProductReturnUrl, parseCheckoutSelection, resolveCheckoutOffer, resolveCheckoutReturnUrls };
