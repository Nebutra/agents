import {
  CREDIT_PURCHASE_METADATA_TYPE
} from "./chunk-HXOJK45E.js";
import {
  detectProvider
} from "./chunk-MNIB3ISW.js";
import {
  addCredits
} from "./chunk-3UKOJWHE.js";

// src/checkout/credit-webhook.ts
var DUPLICATE_ERROR_PATTERNS = ["duplicate", "already_processed", "unique constraint"];
function isDuplicateError(error) {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return DUPLICATE_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
}
async function handleCreditPurchaseWebhook(input) {
  const { provider, sessionId, metadata, amountPaid, currency } = input;
  if (metadata.type !== CREDIT_PURCHASE_METADATA_TYPE) {
    return { handled: false, skipped: "not_credit_purchase" };
  }
  const organizationId = metadata.organizationId;
  const rawCreditAmount = metadata.creditAmount;
  const product = metadata.product;
  if (!organizationId || !rawCreditAmount || !product) {
    return { handled: true, skipped: "invalid_metadata" };
  }
  const creditAmount = Number.parseInt(rawCreditAmount, 10);
  if (!Number.isFinite(creditAmount) || creditAmount <= 0) {
    return { handled: true, skipped: "invalid_metadata" };
  }
  const referenceId = metadata.referenceId;
  const description = referenceId ? `Credit purchase via ${provider} (ref: ${referenceId})` : `Credit purchase via ${provider} (session: ${sessionId})`;
  try {
    const transaction = await addCredits({
      organizationId,
      product,
      amount: creditAmount,
      type: "PURCHASE",
      description,
      relatedId: sessionId,
      metadata: {
        provider,
        sessionId,
        ...referenceId ? { referenceId } : {},
        ...amountPaid !== void 0 ? { amountPaid } : {},
        ...currency ? { currency } : {}
      }
    });
    return {
      handled: true,
      organizationId,
      creditAmount,
      transactionId: transaction.id
    };
  } catch (error) {
    if (isDuplicateError(error)) {
      return { handled: true, skipped: "already_processed" };
    }
    throw error;
  }
}

// src/checkout/readiness.ts
function detectProviderFromEnv(env) {
  const previous = {
    BILLING_PROVIDER: process.env.BILLING_PROVIDER,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    ALIPAY_APP_ID: process.env.ALIPAY_APP_ID,
    WECHATPAY_MCHID: process.env.WECHATPAY_MCHID
  };
  try {
    process.env.BILLING_PROVIDER = env.BILLING_PROVIDER ?? "";
    process.env.STRIPE_SECRET_KEY = env.STRIPE_SECRET_KEY ?? "";
    process.env.ALIPAY_APP_ID = env.ALIPAY_APP_ID ?? "";
    process.env.WECHATPAY_MCHID = env.WECHATPAY_MCHID ?? "";
    return detectProvider();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === void 0) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}
function isPresent(value) {
  return typeof value === "string" && value.trim().length > 0;
}
function resolveBillingProviderReadiness({
  env = process.env,
  selfServiceEnabled = true,
  requiredPriceEnvVars = []
} = {}) {
  const provider = detectProviderFromEnv(env);
  if (!selfServiceEnabled) {
    return {
      provider: "manual",
      status: "disabled",
      checkoutReady: false,
      portalReady: false,
      missing: [],
      title: "Billing self-service is disabled",
      description: "The billing feature flag or checkout mode is off, so plan changes remain read-only."
    };
  }
  if (provider !== "stripe") {
    return {
      provider,
      status: "degraded",
      checkoutReady: false,
      portalReady: false,
      missing: provider === "manual" ? ["BILLING_PROVIDER"] : [],
      title: "Subscription self-service needs Stripe",
      description: "A non-Stripe or manual provider is detected. Checkout and hosted billing portal actions stay disabled until a supported subscription route is configured."
    };
  }
  const missing = [
    ...!isPresent(env.STRIPE_SECRET_KEY) ? ["STRIPE_SECRET_KEY"] : [],
    ...requiredPriceEnvVars.filter((key) => !isPresent(env[key]))
  ];
  const missingPrices = requiredPriceEnvVars.filter((key) => !isPresent(env[key]));
  const hasSecret = isPresent(env.STRIPE_SECRET_KEY);
  if (missing.length > 0) {
    return {
      provider: "stripe",
      status: "degraded",
      checkoutReady: false,
      portalReady: hasSecret,
      missing,
      title: hasSecret ? "Stripe is partially configured" : "Stripe is selected but not configured",
      description: missingPrices.length > 0 ? "Customer portal can be requested, but paid plan checkout stays disabled until every paid plan has a Stripe price id." : "Set STRIPE_SECRET_KEY before enabling checkout or customer portal actions."
    };
  }
  return {
    provider: "stripe",
    status: "ready",
    checkoutReady: true,
    portalReady: true,
    missing: [],
    title: "Stripe self-service is ready",
    description: "Checkout and hosted billing portal actions can be exposed for configured plans."
  };
}

export {
  handleCreditPurchaseWebhook,
  resolveBillingProviderReadiness
};
//# sourceMappingURL=chunk-EMYALU5B.js.map