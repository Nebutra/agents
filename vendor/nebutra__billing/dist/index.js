import {
  cancelStripeSubscription,
  createStripeSubscription,
  getCustomerSubscriptions,
  getStripeSubscription,
  mapStripeStatusToLocal,
  pauseStripeSubscription,
  previewSubscriptionChange,
  resumeStripeSubscription,
  unpauseStripeSubscription,
  updateStripeSubscription
} from "./chunk-LXKMMJWY.js";
import "./chunk-SESXYTZT.js";
import {
  cancelPolarSubscription,
  createPolarCheckout,
  getPolar,
  getPolarSubscription,
  initPolar,
  listPolarProducts
} from "./chunk-3UGSD4FM.js";
import {
  detectProvider,
  getCheckout,
  handleCreditPurchaseWebhook,
  resolveBillingProviderReadiness
} from "./chunk-XR46WOY3.js";
import {
  CREDIT_PURCHASE_METADATA_TYPE,
  CreditPurchaseInputSchema
} from "./chunk-YAIVJWCN.js";
import "./chunk-HCE5MEXD.js";
import "./chunk-Q7RTUAIY.js";
import "./chunk-FTOCD7EJ.js";
import "./chunk-MZLNCNRS.js";
import {
  ALIPAY_NOTIFY_SUCCESS_BODIES,
  WECHAT_NOTIFY_FAIL,
  WECHAT_NOTIFY_OK,
  createAlipayPrecreateOrder,
  createChinaPayOrder,
  createWechatNativeOrder,
  ensurePem,
  getAlipayConfig,
  getWechatPayConfig,
  initAlipay,
  initWechatPay,
  queryAlipayOrder,
  queryChinaPayOrder,
  queryWechatOrder,
  resetChinaPayConfig,
  verifyAlipayNotification,
  verifyAndDecryptWechatNotification
} from "./chunk-XFCVBZZ7.js";
import {
  PlanConfigService,
  getPlanConfig,
  initPlanConfig
} from "./chunk-X4GCTHGA.js";
import {
  addBonusCredits,
  addCredits,
  creditsToDollars,
  deductCredits,
  dollarsToCredits,
  formatCredits,
  getCreditAllowanceForPlan,
  getCreditBalance,
  getCreditTransactions,
  hasEnoughCredits,
  refundCredits
} from "./chunk-SZSFO2Y5.js";
import "./chunk-XTZHQTHP.js";
import {
  FEATURES,
  METER_TO_PLAN_LIMIT,
  PLAN_FEATURES,
  checkEntitlement,
  checkEntitlementUsage,
  getEntitlements,
  grantEntitlement,
  incrementUsage,
  initializePlanEntitlements,
  isPlanFeature,
  requireEntitlement,
  requireEntitlementUsage,
  resetUsage,
  revokeEntitlement
} from "./chunk-YWESHPGV.js";
import {
  calculateOverageCost,
  checkUsageLimit,
  flushUsageBuffer,
  formatUsage,
  getCurrentPeriod,
  getPlanUsageLimit,
  getUsage,
  recordUsage
} from "./chunk-VPIBN2K6.js";
import {
  configureBillingTenantDb
} from "./chunk-BR5IXYNU.js";
import {
  BillingError,
  CheckEntitlementSchema,
  CreateSubscriptionSchema,
  DEFAULT_PLAN_LIMITS,
  DEFAULT_PRICING,
  DEFAULT_USAGE_PRICING,
  EntitlementError,
  PaymentError,
  PurchaseCreditsSchema,
  RecordUsageSchema,
  SubscriptionError,
  UpdateSubscriptionSchema,
  UsageError
} from "./chunk-44PNSGWM.js";
import {
  cancelLemonSubscription,
  createLemonCheckout,
  getLemonCustomerPortalUrl,
  getLemonSqueezyConfig,
  getLemonSubscription,
  initLemonSqueezy
} from "./chunk-SKPOS46O.js";
import {
  STRIPE_TEST_CLOCK_IN_FLIGHT_MS,
  advanceStripeTestClock,
  clockAdvanceCrossesPeriodEnd,
  createBillingPortalSession,
  createCheckoutSession,
  createCustomer,
  createStripeTestClock,
  decideClockWebhookReplay,
  deleteCustomer,
  getCustomer,
  getOrCreateCustomer,
  invoiceEventsAfterClockAdvance,
  isStripeTestModeSecret,
  requireStripeTestClockSecret,
  updateCustomer
} from "./chunk-OUE3DC7O.js";
import {
  getStripe,
  getWebhookSecret,
  initStripe
} from "./chunk-B4ZQV2UG.js";

// src/catalog/checkout-plan.ts
var CHECKOUT_PLANS = ["pro", "enterprise"];
var CHECKOUT_INTERVALS = ["monthly", "yearly"];
var PRICE_ENV = {
  pro_monthly: "STRIPE_PRICE_ID_PRO_MONTHLY",
  pro_yearly: "STRIPE_PRICE_ID_PRO_YEARLY",
  enterprise_monthly: "STRIPE_PRICE_ID_ENTERPRISE_MONTHLY",
  enterprise_yearly: "STRIPE_PRICE_ID_ENTERPRISE_YEARLY"
};
var TRIAL_ENV = {
  pro: "STRIPE_TRIAL_DAYS_PRO",
  enterprise: "STRIPE_TRIAL_DAYS_ENTERPRISE"
};
function parseCheckoutSelection(input) {
  const plan = normalizePlan(input.plan);
  const interval = normalizeInterval(input.interval);
  if (!plan || !interval) {
    throw new BillingError(
      "Checkout requires a catalog plan and interval",
      "CHECKOUT_SELECTION_INVALID",
      400
    );
  }
  return { plan, interval };
}
function resolveCheckoutOffer(selection, env = process.env) {
  const envKey = PRICE_ENV[`${selection.plan}_${selection.interval}`];
  const priceId = env[envKey];
  if (typeof priceId !== "string" || !priceId.startsWith("price_")) {
    throw new BillingError(
      `Checkout catalog is missing ${envKey}`,
      "CHECKOUT_PRICE_UNCONFIGURED",
      503
    );
  }
  const trialPeriodDays = readCatalogTrial(selection.plan, env);
  return {
    ...selection,
    priceId,
    quantity: 1,
    ...trialPeriodDays !== void 0 ? { trialPeriodDays } : {}
  };
}
function resolveCheckoutReturnUrls(env = process.env) {
  const origin = resolveProductOrigin(env);
  return {
    successUrl: `${origin}/checkout-return?billing=checkout-success`,
    cancelUrl: `${origin}/checkout-return?billing=checkout-canceled`
  };
}
function assertProductReturnUrl(value, env = process.env) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new BillingError("Invalid billing return URL", "CHECKOUT_RETURN_URL_INVALID", 400);
  }
  const allowed = new URL(resolveProductOrigin(env));
  if (parsed.origin !== allowed.origin) {
    throw new BillingError(
      "Billing return URL must stay on the product origin",
      "CHECKOUT_RETURN_URL_FORBIDDEN",
      400
    );
  }
  return parsed.toString();
}
function resolveProductOrigin(env) {
  const configured = env.APP_URL ?? env.NEXT_PUBLIC_APP_URL;
  if (typeof configured === "string" && configured.length > 0) {
    return new URL(configured).origin;
  }
  throw new BillingError(
    "APP_URL is required to build billing return URLs",
    "CHECKOUT_APP_URL_MISSING",
    503
  );
}
function normalizePlan(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "pro" || normalized === "plan_pro") return "pro";
  if (normalized === "enterprise" || normalized === "plan_enterprise") return "enterprise";
  if (normalized === "pro_monthly" || normalized === "pro_yearly") return "pro";
  return CHECKOUT_PLANS.includes(normalized) ? normalized : null;
}
function normalizeInterval(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "month" || normalized === "monthly") return "monthly";
  if (normalized === "year" || normalized === "yearly") return "yearly";
  return null;
}
function readCatalogTrial(plan, env) {
  const raw = env[TRIAL_ENV[plan] ?? ""];
  if (!raw) return void 0;
  const days = Number.parseInt(raw, 10);
  if (!Number.isFinite(days) || days <= 0) return void 0;
  return Math.min(days, 30);
}
export {
  ALIPAY_NOTIFY_SUCCESS_BODIES,
  BillingError,
  CHECKOUT_INTERVALS,
  CHECKOUT_PLANS,
  CREDIT_PURCHASE_METADATA_TYPE,
  CheckEntitlementSchema,
  CreateSubscriptionSchema,
  CreditPurchaseInputSchema,
  DEFAULT_PLAN_LIMITS,
  DEFAULT_PRICING,
  DEFAULT_USAGE_PRICING,
  EntitlementError,
  FEATURES,
  METER_TO_PLAN_LIMIT,
  PLAN_FEATURES,
  PaymentError,
  PlanConfigService,
  PurchaseCreditsSchema,
  RecordUsageSchema,
  STRIPE_TEST_CLOCK_IN_FLIGHT_MS,
  SubscriptionError,
  UpdateSubscriptionSchema,
  UsageError,
  WECHAT_NOTIFY_FAIL,
  WECHAT_NOTIFY_OK,
  addBonusCredits,
  addCredits,
  advanceStripeTestClock,
  assertProductReturnUrl,
  calculateOverageCost,
  cancelLemonSubscription,
  cancelPolarSubscription,
  cancelStripeSubscription,
  checkEntitlement,
  checkEntitlementUsage,
  checkUsageLimit,
  clockAdvanceCrossesPeriodEnd,
  configureBillingTenantDb,
  createAlipayPrecreateOrder,
  createBillingPortalSession,
  createCheckoutSession,
  createChinaPayOrder,
  createCustomer,
  createLemonCheckout,
  createPolarCheckout,
  createStripeSubscription,
  createStripeTestClock,
  createWechatNativeOrder,
  creditsToDollars,
  decideClockWebhookReplay,
  deductCredits,
  deleteCustomer,
  detectProvider,
  dollarsToCredits,
  ensurePem,
  flushUsageBuffer,
  formatCredits,
  formatUsage,
  getAlipayConfig,
  getCheckout,
  getCreditAllowanceForPlan,
  getCreditBalance,
  getCreditTransactions,
  getCurrentPeriod,
  getCustomer,
  getCustomerSubscriptions,
  getEntitlements,
  getLemonCustomerPortalUrl,
  getLemonSqueezyConfig,
  getLemonSubscription,
  getOrCreateCustomer,
  getPlanConfig,
  getPlanUsageLimit,
  getPolar,
  getPolarSubscription,
  getStripe,
  getStripeSubscription,
  getUsage,
  getWebhookSecret,
  getWechatPayConfig,
  grantEntitlement,
  handleCreditPurchaseWebhook,
  hasEnoughCredits,
  incrementUsage,
  initAlipay,
  initLemonSqueezy,
  initPlanConfig,
  initPolar,
  initStripe,
  initWechatPay,
  initializePlanEntitlements,
  invoiceEventsAfterClockAdvance,
  isPlanFeature,
  isStripeTestModeSecret,
  listPolarProducts,
  mapStripeStatusToLocal,
  parseCheckoutSelection,
  pauseStripeSubscription,
  previewSubscriptionChange,
  queryAlipayOrder,
  queryChinaPayOrder,
  queryWechatOrder,
  recordUsage,
  refundCredits,
  requireEntitlement,
  requireEntitlementUsage,
  requireStripeTestClockSecret,
  resetChinaPayConfig,
  resetUsage,
  resolveBillingProviderReadiness,
  resolveCheckoutOffer,
  resolveCheckoutReturnUrls,
  resumeStripeSubscription,
  revokeEntitlement,
  unpauseStripeSubscription,
  updateCustomer,
  updateStripeSubscription,
  verifyAlipayNotification,
  verifyAndDecryptWechatNotification
};
//# sourceMappingURL=index.js.map