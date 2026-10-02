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
  createCreemCheckout,
  getCreemCheckout,
  getCreemConfig,
  isCreemConfigured,
  refundCreemOrder,
  verifyCreemSignature
} from "./chunk-3FO4YIYS.js";
import {
  handleCreditPurchaseWebhook,
  resolveBillingProviderReadiness
} from "./chunk-VZDUXIJ4.js";
import "./chunk-O4SQJWDX.js";
import {
  refundStripeCheckoutSession
} from "./chunk-GV4XPATE.js";
import {
  CREDIT_PURCHASE_METADATA_TYPE,
  PAYMENT_ORDER_METADATA_KEY,
  PaymentSessionInputSchema
} from "./chunk-HXOJK45E.js";
import "./chunk-3JCLGJ6I.js";
import {
  detectProvider,
  getCheckout,
  isChinaPayConfigured
} from "./chunk-YNHE4XXL.js";
import {
  ALIPAY_NOTIFY_SUCCESS_BODIES,
  WECHAT_NOTIFY_FAIL,
  WECHAT_NOTIFY_OK,
  buildAlipayWapPayUrl,
  createAlipayPrecreateOrder,
  createChinaPayOrder,
  createWechatH5Order,
  createWechatNativeOrder,
  ensurePem,
  getAlipayConfig,
  getWechatPayConfig,
  initAlipay,
  initWechatPay,
  queryAlipayOrder,
  queryChinaPayOrder,
  queryWechatOrder,
  refundAlipayOrder,
  refundChinaPayOrder,
  refundWechatOrder,
  resetChinaPayConfig,
  verifyAlipayNotification,
  verifyAndDecryptWechatNotification
} from "./chunk-KIQ3WN33.js";
import {
  PlanConfigService,
  getPlanConfig,
  initPlanConfig
} from "./chunk-X4GCTHGA.js";
import {
  addBonusCredits,
  addCredits,
  assertWalletProduct,
  creditsToDollars,
  deductCredits,
  dollarsToCredits,
  expireCreditLots,
  formatCredits,
  getCreditAllowanceForPlan,
  getCreditBalance,
  getCreditBalanceFresh,
  getCreditTransactions,
  getExpiringCredits,
  grantInTx,
  hasEnoughCredits,
  hasEnoughCreditsFresh,
  invalidateCreditCache,
  refundCredits
} from "./chunk-WFTWMHNV.js";
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
  configureBillingTenantDb,
  requireTenantDb
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

// src/fulfillment/index.ts
import { logger as logger2 } from "@nebutra/logger";

// src/memberships/index.ts
import { logger } from "@nebutra/logger";
var log = logger.child({ service: "memberships" });
var DAY_MS = 24 * 60 * 60 * 1e3;
var GRANT_PERIOD_DAYS = 30;
function toMembership(row) {
  return {
    organizationId: row.tenantId,
    product: row.product,
    tier: row.tier,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    monthlyCredits: row.monthlyCredits
  };
}
async function getMembership(organizationId, product, now = /* @__PURE__ */ new Date()) {
  const row = await requireTenantDb(organizationId).membership.findUnique({
    where: { tenantId_product: { tenantId: organizationId, product } }
  });
  return row && row.endsAt > now ? toMembership(row) : null;
}
function grantWindow(from, endsAt) {
  const monthEnd = new Date(from.getTime() + GRANT_PERIOD_DAYS * DAY_MS);
  return monthEnd < endsAt ? { expiresAt: monthEnd, next: monthEnd } : { expiresAt: endsAt, next: null };
}
async function applyMembershipPurchase(purchase) {
  if (!(Number.isInteger(purchase.days) && purchase.days > 0)) {
    throw new BillingError(
      "A membership needs a positive number of days",
      "MEMBERSHIP_INVALID",
      500
    );
  }
  const now = purchase.now ?? /* @__PURE__ */ new Date();
  const key = { tenantId: purchase.organizationId, product: purchase.product };
  await requireTenantDb(purchase.organizationId).$transaction(async (tx) => {
    const current = await tx.membership.findUnique({
      where: { tenantId_product: key }
    });
    if (current?.appliedOrders.includes(purchase.orderId)) return;
    const length = purchase.days * DAY_MS;
    const extending = current !== null && current.endsAt > now && current.tier === purchase.tier;
    if (extending) {
      const endsAt2 = new Date(current.endsAt.getTime() + length);
      await tx.membership.update({
        where: { id: current.id },
        data: {
          endsAt: endsAt2,
          nextGrantAt: current.nextGrantAt ?? current.endsAt,
          appliedOrders: { push: purchase.orderId }
        }
      });
      return;
    }
    const endsAt = new Date(now.getTime() + length);
    const window = grantWindow(now, endsAt);
    const data = {
      tier: purchase.tier,
      startsAt: now,
      endsAt,
      monthlyCredits: purchase.monthlyCredits,
      nextGrantAt: window.next
    };
    if (current) {
      await tx.membership.update({
        where: { id: current.id },
        data: { ...data, appliedOrders: { push: purchase.orderId } }
      });
    } else {
      await tx.membership.create({ data: { ...key, ...data, appliedOrders: [purchase.orderId] } });
    }
    if (purchase.monthlyCredits > 0) {
      await grantInTx(tx, {
        organizationId: purchase.organizationId,
        product: purchase.product,
        amount: purchase.monthlyCredits,
        type: "PURCHASE",
        description: `${purchase.tier} membership credits`,
        relatedId: purchase.orderId,
        lot: { source: "SUBSCRIPTION", expiresAt: window.expiresAt }
      });
    }
  });
  invalidateCreditCache(purchase.organizationId, purchase.product);
}
async function revokeMembershipPurchase(input) {
  const now = input.now ?? /* @__PURE__ */ new Date();
  return requireTenantDb(input.organizationId).$transaction(async (tx) => {
    const current = await tx.membership.findUnique({
      where: { tenantId_product: { tenantId: input.organizationId, product: input.product } }
    });
    if (!current?.appliedOrders.includes(input.orderId)) return false;
    const shortened = new Date(current.endsAt.getTime() - input.days * input.ratio * DAY_MS);
    const endsAt = shortened > now ? shortened : now;
    await tx.membership.update({
      where: { id: current.id },
      data: {
        endsAt,
        nextGrantAt: current.nextGrantAt && current.nextGrantAt < endsAt ? current.nextGrantAt : null,
        appliedOrders: current.appliedOrders.filter((id) => id !== input.orderId)
      }
    });
    return true;
  });
}
async function grantDueMemberships(systemDb, options = {}) {
  const now = options.now ?? /* @__PURE__ */ new Date();
  const due = await systemDb.membership.findMany({
    where: { nextGrantAt: { lte: now } },
    orderBy: { nextGrantAt: "asc" },
    take: options.limit ?? 200
  });
  const result = { granted: 0, errors: 0 };
  for (const row of due) {
    try {
      await requireTenantDb(row.tenantId).$transaction(async (tx) => {
        const fresh = await tx.membership.findUnique({
          where: { id: row.id }
        });
        const start = fresh?.nextGrantAt;
        if (!fresh || !start || start > now) return;
        if (start >= fresh.endsAt) {
          await tx.membership.update({ where: { id: row.id }, data: { nextGrantAt: null } });
          return;
        }
        const window = grantWindow(start, fresh.endsAt);
        if (fresh.monthlyCredits > 0) {
          await grantInTx(tx, {
            organizationId: fresh.tenantId,
            product: fresh.product,
            amount: fresh.monthlyCredits,
            type: "BONUS",
            description: `${fresh.tier} membership credits`,
            relatedId: `membership:${fresh.id}:${start.toISOString()}`,
            lot: { source: "SUBSCRIPTION", expiresAt: window.expiresAt }
          });
        }
        await tx.membership.update({
          where: { id: row.id },
          data: { nextGrantAt: window.next }
        });
      });
      invalidateCreditCache(row.tenantId, row.product);
      result.granted += 1;
    } catch (error) {
      result.errors += 1;
      log.error("Granting membership credits failed", { membershipId: row.id, error });
    }
  }
  return result;
}

// src/fulfillment/index.ts
var log2 = logger2.child({ service: "fulfillment" });
var registry = /* @__PURE__ */ new Map();
function registerFulfillment(type, handler) {
  registry.set(type, handler);
}
function getFulfillment(type) {
  const handler = registry.get(type);
  if (!handler) {
    throw new BillingError(
      `No fulfillment handler registered for "${type}"`,
      "FULFILLMENT_UNREGISTERED",
      500
    );
  }
  return handler;
}
function creditsParam(params) {
  const credits = params.credits;
  if (!(typeof credits === "number" && Number.isInteger(credits) && credits > 0)) {
    throw new BillingError(
      "credits fulfillment needs a positive integer params.credits",
      "FULFILLMENT_INVALID_PARAMS",
      500
    );
  }
  return credits;
}
var DAY_MS2 = 24 * 60 * 60 * 1e3;
function positiveInt(params, key) {
  const value = params[key];
  if (value === void 0) return void 0;
  if (!(typeof value === "number" && Number.isInteger(value) && value > 0)) {
    throw new BillingError(
      `fulfillment params.${key} must be a positive integer`,
      "FULFILLMENT_INVALID_PARAMS",
      500
    );
  }
  return value;
}
registerFulfillment("credits", {
  async fulfill(ctx) {
    const days = positiveInt(ctx.params, "expiresInDays");
    await addCredits({
      organizationId: ctx.organizationId,
      product: ctx.product,
      amount: creditsParam(ctx.params),
      type: "PURCHASE",
      description: `Purchase (order ${ctx.orderId})`,
      relatedId: ctx.orderId,
      ...days ? { lot: { source: "PURCHASE", expiresAt: new Date(Date.now() + days * DAY_MS2) } } : {}
    });
  },
  async revoke(ctx) {
    const amount = Math.floor(creditsParam(ctx.params) * ctx.ratio);
    if (amount <= 0) return { revoked: true };
    try {
      await deductCredits({
        organizationId: ctx.organizationId,
        product: ctx.product,
        amount,
        description: `Refund (order ${ctx.orderId})`,
        relatedId: `refund:${ctx.refundId}`
      });
      return { revoked: true };
    } catch (error) {
      if (error instanceof BillingError && error.code === "INSUFFICIENT_CREDITS") {
        log2.warn("Refunded credits were already spent", {
          orderId: ctx.orderId,
          organizationId: ctx.organizationId,
          amount
        });
        return { revoked: false, reason: "credits_already_spent" };
      }
      throw error;
    }
  }
});
function balanceGrant(ctx) {
  const rates = ctx.params.unitsPerMajor;
  const rate = rates?.[ctx.currency];
  if (!(typeof rate === "number" && rate > 0)) {
    throw new BillingError(
      `balance fulfillment needs params.unitsPerMajor.${ctx.currency}`,
      "FULFILLMENT_INVALID_PARAMS",
      500
    );
  }
  return Math.floor(ctx.amountMinor / 100 * rate * 1e4) / 1e4;
}
registerFulfillment("balance", {
  async fulfill(ctx) {
    await addCredits({
      organizationId: ctx.organizationId,
      product: ctx.product,
      amount: balanceGrant(ctx),
      type: "PURCHASE",
      description: `Top-up (order ${ctx.orderId})`,
      relatedId: ctx.orderId
    });
  },
  async revoke(ctx) {
    const amount = Math.floor(balanceGrant(ctx) * ctx.ratio * 1e4) / 1e4;
    if (amount <= 0) return { revoked: true };
    try {
      await deductCredits({
        organizationId: ctx.organizationId,
        product: ctx.product,
        amount,
        description: `Refund (order ${ctx.orderId})`,
        relatedId: `refund:${ctx.refundId}`
      });
      return { revoked: true };
    } catch (error) {
      if (error instanceof BillingError && error.code === "INSUFFICIENT_CREDITS") {
        log2.warn("Refunded balance was already spent", {
          orderId: ctx.orderId,
          organizationId: ctx.organizationId,
          amount
        });
        return { revoked: false, reason: "balance_already_spent" };
      }
      throw error;
    }
  }
});
function membershipParams(params) {
  const tier = params.tier;
  const days = positiveInt(params, "days");
  const monthlyCredits = params.monthlyCredits ?? 0;
  if (!(typeof tier === "string" && tier.length > 0) || !days || !(typeof monthlyCredits === "number" && Number.isInteger(monthlyCredits) && monthlyCredits >= 0)) {
    throw new BillingError(
      "membership fulfillment needs params.tier, params.days and params.monthlyCredits",
      "FULFILLMENT_INVALID_PARAMS",
      500
    );
  }
  return { tier, days, monthlyCredits };
}
registerFulfillment("membership", {
  async fulfill(ctx) {
    await applyMembershipPurchase({
      orderId: ctx.orderId,
      organizationId: ctx.organizationId,
      product: ctx.product,
      ...membershipParams(ctx.params)
    });
  },
  async revoke(ctx) {
    const { days, monthlyCredits } = membershipParams(ctx.params);
    const shortened = await revokeMembershipPurchase({
      orderId: ctx.orderId,
      organizationId: ctx.organizationId,
      product: ctx.product,
      days,
      ratio: ctx.ratio
    });
    const credits = Math.floor(monthlyCredits * ctx.ratio);
    if (credits <= 0) return { revoked: shortened };
    try {
      await deductCredits({
        organizationId: ctx.organizationId,
        product: ctx.product,
        amount: credits,
        description: `Refund (order ${ctx.orderId})`,
        relatedId: `refund:${ctx.refundId}`
      });
      return { revoked: shortened };
    } catch (error) {
      if (error instanceof BillingError && error.code === "INSUFFICIENT_CREDITS") {
        log2.warn("Refunded membership credits were already spent", {
          orderId: ctx.orderId,
          organizationId: ctx.organizationId,
          credits
        });
        return { revoked: false, reason: "credits_already_spent" };
      }
      throw error;
    }
  }
});

// src/offers/index.ts
var CURRENCIES = ["USD", "CNY"];
var ACCOUNTS = ["personal", "organization", "workspace"];
var DEFAULT_OFFERS = [
  {
    id: "credits_10k",
    product: "app",
    name: "10,000 credits",
    prices: { USD: 10, CNY: 68 },
    fulfillment: { type: "credits", params: { credits: 1e4 } }
  },
  {
    id: "credits_55k",
    product: "app",
    name: "55,000 credits",
    prices: { USD: 50, CNY: 348 },
    fulfillment: { type: "credits", params: { credits: 55e3 } },
    highlight: "5,000 bonus"
  },
  {
    id: "credits_250k",
    product: "app",
    name: "250,000 credits",
    prices: { USD: 200, CNY: 1388 },
    fulfillment: { type: "credits", params: { credits: 25e4 } },
    highlight: "50,000 bonus"
  }
];
var catalog = DEFAULT_OFFERS;
var PRODUCT_ID = /^[a-z][a-z0-9-]{1,31}$/;
function invalid(offer, what) {
  throw new BillingError(`Offer ${offer.id} ${what}`, "OFFER_INVALID", 500);
}
function validate(offer) {
  if (!PRODUCT_ID.test(offer.product ?? "")) invalid(offer, "needs a product id");
  if (offer.account !== void 0 && !ACCOUNTS.includes(offer.account)) {
    invalid(offer, `has an unknown account "${offer.account}"`);
  }
  const fixed = offer.prices ? Object.entries(offer.prices) : [];
  const custom = offer.customAmount ? Object.entries(offer.customAmount) : [];
  if (fixed.length > 0 === custom.length > 0) {
    invalid(offer, "needs exactly one of prices or customAmount");
  }
  for (const [currency, price] of fixed) {
    if (!(typeof price === "number" && price > 0))
      invalid(offer, `has an invalid ${currency} price`);
  }
  for (const [currency, range] of custom) {
    if (!(range && range.min > 0 && range.max >= range.min)) {
      invalid(offer, `has an invalid ${currency} amount range`);
    }
  }
}
function configureOffers(offers) {
  const seen = /* @__PURE__ */ new Set();
  for (const offer of offers) {
    if (seen.has(offer.id)) {
      throw new BillingError(`Duplicate offer id: ${offer.id}`, "OFFER_DUPLICATE_ID", 500);
    }
    seen.add(offer.id);
    validate(offer);
  }
  catalog = offers;
}
function configureOffersFromEnv(env = process.env) {
  const raw = env.BILLING_OFFERS_JSON?.trim();
  if (!raw) return;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new BillingError("BILLING_OFFERS_JSON is not valid JSON", "OFFER_CATALOG_INVALID", 500);
  }
  if (!Array.isArray(parsed)) {
    throw new BillingError(
      "BILLING_OFFERS_JSON must be an array of offers",
      "OFFER_CATALOG_INVALID",
      500
    );
  }
  configureOffers(parsed);
}
function listOffers(product) {
  return catalog.filter(
    (offer) => offer.active !== false && (product === void 0 || offer.product === product)
  );
}
function getOffer(id) {
  return listOffers().find((offer) => offer.id === id);
}
function offerAccount(offer) {
  return offer.account ?? "organization";
}
function offerCurrencies(offer) {
  return CURRENCIES.filter(
    (c) => offer.prices ? offer.prices[c] !== void 0 : offer.customAmount?.[c] !== void 0
  );
}
function priceOffer(offer, currency, requested) {
  if (offer.prices) {
    const price = offer.prices[currency];
    if (price === void 0) {
      throw new BillingError(
        `Offer ${offer.id} has no ${currency} price`,
        "OFFER_CURRENCY_UNAVAILABLE",
        400
      );
    }
    return price;
  }
  const range = offer.customAmount?.[currency];
  if (!range) {
    throw new BillingError(
      `Offer ${offer.id} cannot be bought in ${currency}`,
      "OFFER_CURRENCY_UNAVAILABLE",
      400
    );
  }
  if (typeof requested !== "number" || !Number.isFinite(requested) || Math.abs(Math.round(requested * 100) - requested * 100) > 1e-6 || requested < range.min || requested > range.max) {
    throw new BillingError(
      `Offer ${offer.id} takes an amount between ${range.min} and ${range.max} ${currency}`,
      "OFFER_AMOUNT_OUT_OF_RANGE",
      400
    );
  }
  return requested;
}
function toMinorUnits(major) {
  return Math.round(major * 100);
}
function toMajorString(minor) {
  return (minor / 100).toFixed(2);
}

// src/orders/index.ts
import { logger as logger3 } from "@nebutra/logger";
var log3 = logger3.child({ service: "payment-orders" });
var store;
function configurePaymentOrderStore(next) {
  store = next;
}
function requireStore() {
  if (!store) {
    throw new BillingError(
      "Payment orders are not configured \u2014 call configurePaymentOrderStore() at boot",
      "PAYMENT_ORDER_STORE_UNCONFIGURED",
      500
    );
  }
  return store;
}
var ORDER_TTL_MS = 30 * 60 * 1e3;
var RECONCILE_AFTER_MS = 2 * 60 * 1e3;
function currencyFor(method) {
  return method === "card" ? "USD" : "CNY";
}
function isPaymentMethodAvailable(method) {
  if (method === "card") return Boolean(process.env.CREEM_API_KEY && process.env.CREEM_PRODUCT_ID);
  return isChinaPayConfigured(method);
}
function lockedSpec(order) {
  const spec = order.fulfillment;
  if (!(spec?.type && spec.product)) {
    throw new BillingError(
      `Order ${order.id} has no locked product to fulfill into`,
      "FULFILLMENT_PRODUCT_MISSING",
      500
    );
  }
  return spec;
}
async function listPaymentOrders(organizationId, limit = 20) {
  const rows = await requireStore().listByTenant(organizationId, Math.min(Math.max(limit, 1), 100));
  return rows.map((row) => ({
    ...row,
    product: row.fulfillment?.product ?? null
  }));
}
async function getPaymentOrder(orderId) {
  return requireStore().findById(orderId);
}
async function createPaymentOrder(input) {
  const offer = getOffer(input.offerId);
  if (!offer) {
    throw new BillingError(`Unknown offer: ${input.offerId}`, "OFFER_NOT_FOUND", 400);
  }
  if (!isPaymentMethodAvailable(input.method)) {
    throw new BillingError(
      `Payment method not available: ${input.method}`,
      "PAYMENT_METHOD_UNAVAILABLE",
      400
    );
  }
  const currency = currencyFor(input.method);
  const price = priceOffer(offer, currency, input.amount);
  const orders = requireStore();
  const amountMinor = toMinorUnits(price);
  const provider = input.method === "card" ? "creem" : "chinapay";
  const order = await orders.create({
    tenantId: input.organizationId,
    offerId: offer.id,
    // Locked with the product it grants into, so a later catalog edit cannot
    // move a paid order's grant to another product.
    fulfillment: { ...offer.fulfillment, product: offer.product },
    amountMinor,
    currency,
    provider,
    method: input.method,
    expiresAt: new Date(Date.now() + ORDER_TTL_MS)
  });
  const checkout = await getCheckout({ provider });
  const session = await checkout.createPaymentSession({
    orderId: order.id,
    organizationId: input.organizationId,
    title: offer.name,
    amountMinor,
    currency,
    successUrl: input.successUrl,
    cancelUrl: input.cancelUrl,
    ...input.customerEmail ? { customerEmail: input.customerEmail } : {},
    ...input.method !== "card" ? { method: input.method, channel: input.channel, clientIp: input.clientIp } : {}
  });
  if (session.providerRef) {
    await orders.setProviderRef(order.id, session.providerRef);
  }
  return { orderId: order.id, session, amountMinor, currency };
}
async function settlePaymentOrder(input) {
  const orders = requireStore();
  const order = await orders.findById(input.orderId);
  if (!order) return "not_found";
  if (input.paidMinor !== order.amountMinor || input.currency.toUpperCase() !== order.currency) {
    log3.error("Payment does not match the order's locked price", {
      orderId: order.id,
      expected: { amountMinor: order.amountMinor, currency: order.currency },
      received: { amountMinor: input.paidMinor, currency: input.currency }
    });
    throw new BillingError("Paid amount does not match the order", "PAYMENT_AMOUNT_MISMATCH", 409);
  }
  const won = await orders.markPaid(order.id, {
    paidMinor: input.paidMinor,
    ...input.providerRef ? { providerRef: input.providerRef } : {}
  });
  await fulfillPaymentOrder(order.id);
  return won ? "settled" : "already_settled";
}
async function fulfillPaymentOrder(orderId) {
  const orders = requireStore();
  const order = await orders.findById(orderId);
  if (!order || order.fulfilledAt || order.status !== "PAID") return false;
  const spec = lockedSpec(order);
  await getFulfillment(spec.type).fulfill({
    orderId: order.id,
    organizationId: order.tenantId,
    product: spec.product,
    params: spec.params ?? {},
    amountMinor: order.amountMinor,
    currency: order.currency
  });
  return orders.markFulfilled(order.id);
}
async function reconcilePaymentOrders(options = {}) {
  const orders = requireStore();
  const limit = options.limit ?? 100;
  const now = options.now ?? /* @__PURE__ */ new Date();
  const result = { checked: 0, settled: 0, expired: 0, fulfilled: 0, errors: 0 };
  const pending = await orders.listPendingCreatedBefore(
    new Date(now.getTime() - RECONCILE_AFTER_MS),
    limit
  );
  const { queryChinaPayOrder: queryChinaPayOrder2 } = await import("./chinapay/index.js");
  for (const order of pending) {
    result.checked += 1;
    try {
      if (order.provider === "creem" && order.providerRef) {
        const { getCreemCheckout: getCreemCheckout2 } = await import("./creem-IUHJVJOT.js");
        const checkout = await getCreemCheckout2(order.providerRef);
        if (checkout.status === "completed" && checkout.order) {
          const outcome = await settlePaymentOrder({
            orderId: order.id,
            paidMinor: checkout.order.amount,
            currency: checkout.order.currency,
            providerRef: checkout.order.id
          });
          if (outcome === "settled") result.settled += 1;
          continue;
        }
      }
      if (order.provider === "chinapay") {
        const status = await queryChinaPayOrder2(order.id, order.method);
        if (status.status === "paid") {
          const outcome = await settlePaymentOrder({
            orderId: order.id,
            paidMinor: status.paidFen,
            currency: "CNY",
            ...status.providerRef ? { providerRef: status.providerRef } : {}
          });
          if (outcome === "settled") result.settled += 1;
          continue;
        }
      }
      if (order.expiresAt <= now && await orders.markExpired(order.id)) {
        result.expired += 1;
      }
    } catch (error) {
      result.errors += 1;
      log3.error("Reconcile failed for order", { orderId: order.id, error });
    }
  }
  for (const order of await orders.listPaidUnfulfilled(limit)) {
    try {
      if (await fulfillPaymentOrder(order.id)) result.fulfilled += 1;
    } catch (error) {
      result.errors += 1;
      log3.error("Fulfillment retry failed", { orderId: order.id, error });
    }
  }
  return result;
}
async function refundPaymentOrder(input) {
  const orders = requireStore();
  const order = await orders.findById(input.orderId);
  if (!order) {
    throw new BillingError(`Unknown order: ${input.orderId}`, "ORDER_NOT_FOUND", 404);
  }
  if (order.status !== "PAID" && order.status !== "PARTIALLY_REFUNDED") {
    throw new BillingError(
      `Order ${order.id} is ${order.status}, not refundable`,
      "ORDER_NOT_REFUNDABLE",
      409
    );
  }
  const paidMinor = order.paidMinor ?? order.amountMinor;
  const remaining = paidMinor - order.refundedMinor;
  const amountMinor = input.amountMinor ?? remaining;
  if (!(Number.isInteger(amountMinor) && amountMinor > 0 && amountMinor <= remaining)) {
    throw new BillingError(
      `Refund must be between 1 and ${remaining} minor units`,
      "REFUND_AMOUNT_INVALID",
      400
    );
  }
  let status;
  if (order.provider === "chinapay") {
    const { refundChinaPayOrder: refundChinaPayOrder2 } = await import("./chinapay/index.js");
    ({ status } = await refundChinaPayOrder2({
      tradeOrderId: order.id,
      refundId: input.refundId,
      method: order.method,
      refundFee: toMajorString(amountMinor),
      totalFee: toMajorString(paidMinor),
      reason: input.reason
    }));
  } else if (order.provider === "creem" && order.providerRef) {
    if (amountMinor !== remaining) {
      throw new BillingError(
        "Creem refunds only the full remaining amount; refund it all or settle the difference outside Creem",
        "REFUND_PARTIAL_UNSUPPORTED",
        400
      );
    }
    const { refundCreemOrder: refundCreemOrder2 } = await import("./creem-IUHJVJOT.js");
    ({ status } = await refundCreemOrder2(order.providerRef));
  } else if (order.provider === "stripe" && order.providerRef) {
    ({ status } = await refundStripeCheckoutSession({
      sessionId: order.providerRef,
      amountMinor,
      refundId: input.refundId
    }));
  } else {
    throw new BillingError(
      `Order ${order.id} has no provider payment to refund`,
      "ORDER_NOT_REFUNDABLE",
      409
    );
  }
  if (status === "failed") {
    return { status, refundedMinor: order.refundedMinor };
  }
  const refundedMinor = order.refundedMinor + amountMinor;
  const recorded = await orders.recordRefund(order.id, {
    previousRefundedMinor: order.refundedMinor,
    refundedMinor,
    fullyRefunded: refundedMinor >= paidMinor
  });
  if (!recorded) {
    throw new BillingError(
      "The order changed while refunding; retry with the same refundId",
      "REFUND_CONFLICT",
      409
    );
  }
  const spec = lockedSpec(order);
  const handler = getFulfillment(spec.type);
  const revocation = handler.revoke ? await handler.revoke({
    orderId: order.id,
    organizationId: order.tenantId,
    product: spec.product,
    params: spec.params ?? {},
    amountMinor: order.amountMinor,
    currency: order.currency,
    refundId: input.refundId,
    ratio: amountMinor / paidMinor
  }) : void 0;
  return { status, refundedMinor, ...revocation ? { revocation } : {} };
}
export {
  ALIPAY_NOTIFY_SUCCESS_BODIES,
  BillingError,
  CHECKOUT_INTERVALS,
  CHECKOUT_PLANS,
  CREDIT_PURCHASE_METADATA_TYPE,
  CheckEntitlementSchema,
  CreateSubscriptionSchema,
  DEFAULT_OFFERS,
  DEFAULT_PLAN_LIMITS,
  DEFAULT_PRICING,
  DEFAULT_USAGE_PRICING,
  EntitlementError,
  FEATURES,
  GRANT_PERIOD_DAYS,
  METER_TO_PLAN_LIMIT,
  PAYMENT_ORDER_METADATA_KEY,
  PLAN_FEATURES,
  PaymentError,
  PaymentSessionInputSchema,
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
  applyMembershipPurchase,
  assertProductReturnUrl,
  assertWalletProduct,
  buildAlipayWapPayUrl,
  calculateOverageCost,
  cancelStripeSubscription,
  checkEntitlement,
  checkEntitlementUsage,
  checkUsageLimit,
  clockAdvanceCrossesPeriodEnd,
  configureBillingTenantDb,
  configureOffers,
  configureOffersFromEnv,
  configurePaymentOrderStore,
  createAlipayPrecreateOrder,
  createBillingPortalSession,
  createCheckoutSession,
  createChinaPayOrder,
  createCreemCheckout,
  createCustomer,
  createPaymentOrder,
  createStripeSubscription,
  createStripeTestClock,
  createWechatH5Order,
  createWechatNativeOrder,
  creditsToDollars,
  decideClockWebhookReplay,
  deductCredits,
  deleteCustomer,
  detectProvider,
  dollarsToCredits,
  ensurePem,
  expireCreditLots,
  flushUsageBuffer,
  formatCredits,
  formatUsage,
  fulfillPaymentOrder,
  getAlipayConfig,
  getCheckout,
  getCreditAllowanceForPlan,
  getCreditBalance,
  getCreditBalanceFresh,
  getCreditTransactions,
  getCreemCheckout,
  getCreemConfig,
  getCurrentPeriod,
  getCustomer,
  getCustomerSubscriptions,
  getEntitlements,
  getExpiringCredits,
  getFulfillment,
  getMembership,
  getOffer,
  getOrCreateCustomer,
  getPaymentOrder,
  getPlanConfig,
  getPlanUsageLimit,
  getStripe,
  getStripeSubscription,
  getUsage,
  getWebhookSecret,
  getWechatPayConfig,
  grantDueMemberships,
  grantEntitlement,
  handleCreditPurchaseWebhook,
  hasEnoughCredits,
  hasEnoughCreditsFresh,
  incrementUsage,
  initAlipay,
  initPlanConfig,
  initStripe,
  initWechatPay,
  initializePlanEntitlements,
  invalidateCreditCache,
  invoiceEventsAfterClockAdvance,
  isChinaPayConfigured,
  isCreemConfigured,
  isPaymentMethodAvailable,
  isPlanFeature,
  isStripeTestModeSecret,
  listOffers,
  listPaymentOrders,
  mapStripeStatusToLocal,
  offerAccount,
  offerCurrencies,
  parseCheckoutSelection,
  pauseStripeSubscription,
  previewSubscriptionChange,
  priceOffer,
  queryAlipayOrder,
  queryChinaPayOrder,
  queryWechatOrder,
  reconcilePaymentOrders,
  recordUsage,
  refundAlipayOrder,
  refundChinaPayOrder,
  refundCredits,
  refundCreemOrder,
  refundPaymentOrder,
  refundStripeCheckoutSession,
  refundWechatOrder,
  registerFulfillment,
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
  revokeMembershipPurchase,
  settlePaymentOrder,
  toMajorString,
  toMinorUnits,
  unpauseStripeSubscription,
  updateCustomer,
  updateStripeSubscription,
  verifyAlipayNotification,
  verifyAndDecryptWechatNotification,
  verifyCreemSignature
};
//# sourceMappingURL=index.js.map