import {
  CREDIT_PURCHASE_METADATA_TYPE
} from "./chunk-YAIVJWCN.js";
import {
  addCredits
} from "./chunk-SZSFO2Y5.js";

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
  if (!organizationId || !rawCreditAmount) {
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

// src/checkout/factory.ts
function detectProvider() {
  const explicit = process.env.BILLING_PROVIDER;
  if (explicit) {
    return explicit;
  }
  if (process.env.STRIPE_SECRET_KEY) return "stripe";
  if (process.env.POLAR_ACCESS_TOKEN) return "polar";
  if (process.env.LEMONSQUEEZY_API_KEY) return "lemonsqueezy";
  if (process.env.CHINAPAY_APP_ID) return "chinapay";
  return "manual";
}
async function getCheckout(config) {
  const provider = config?.provider ?? detectProvider();
  switch (provider) {
    case "stripe": {
      const { StripeCheckoutProvider: StripeCheckoutProvider2 } = await import("./stripe-BIUJVYWN.js");
      return new StripeCheckoutProvider2();
    }
    case "polar": {
      const { PolarCheckoutProvider: PolarCheckoutProvider2 } = await import("./polar-PX5XD7NV.js");
      return new PolarCheckoutProvider2();
    }
    case "lemonsqueezy": {
      const { LemonCheckoutProvider: LemonCheckoutProvider2 } = await import("./lemonsqueezy-KKEJ5YI2.js");
      return new LemonCheckoutProvider2();
    }
    case "chinapay": {
      const { ChinaPayCheckoutProvider: ChinaPayCheckoutProvider2 } = await import("./chinapay-HW7N2WVN.js");
      return new ChinaPayCheckoutProvider2();
    }
    default: {
      const { ManualCheckoutProvider: ManualCheckoutProvider2 } = await import("./manual-BAJLGRWP.js");
      return new ManualCheckoutProvider2();
    }
  }
}

// src/checkout/readiness.ts
function detectProviderFromEnv(env) {
  const previous = {
    BILLING_PROVIDER: process.env.BILLING_PROVIDER,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    POLAR_ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN,
    LEMONSQUEEZY_API_KEY: process.env.LEMONSQUEEZY_API_KEY,
    CHINAPAY_APP_ID: process.env.CHINAPAY_APP_ID
  };
  try {
    process.env.BILLING_PROVIDER = env.BILLING_PROVIDER ?? "";
    process.env.STRIPE_SECRET_KEY = env.STRIPE_SECRET_KEY ?? "";
    process.env.POLAR_ACCESS_TOKEN = env.POLAR_ACCESS_TOKEN ?? "";
    process.env.LEMONSQUEEZY_API_KEY = env.LEMONSQUEEZY_API_KEY ?? "";
    process.env.CHINAPAY_APP_ID = env.CHINAPAY_APP_ID ?? "";
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
  detectProvider,
  getCheckout,
  resolveBillingProviderReadiness
};
//# sourceMappingURL=chunk-XR46WOY3.js.map