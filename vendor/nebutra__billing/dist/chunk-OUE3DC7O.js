import {
  getStripe
} from "./chunk-B4ZQV2UG.js";

// src/stripe/customers.ts
async function createCustomer(input) {
  const stripe = getStripe();
  return stripe.customers.create({
    email: input.email,
    name: input.name,
    metadata: {
      organizationId: input.organizationId,
      ...input.metadata
    }
  });
}
async function getCustomer(customerId) {
  const stripe = getStripe();
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      return null;
    }
    return customer;
  } catch {
    return null;
  }
}
async function updateCustomer(input) {
  const stripe = getStripe();
  return stripe.customers.update(input.customerId, {
    email: input.email,
    name: input.name,
    metadata: input.metadata
  });
}
async function deleteCustomer(customerId) {
  const stripe = getStripe();
  return stripe.customers.del(customerId);
}
async function getOrCreateCustomer(organizationId, email, name) {
  const stripe = getStripe();
  const existing = await stripe.customers.search({
    query: `metadata["organizationId"]:"${organizationId}"`,
    limit: 1
  });
  if (existing.data.length > 0) {
    return existing.data[0];
  }
  return createCustomer({
    organizationId,
    email,
    name
  });
}
async function createBillingPortalSession(customerId, returnUrl) {
  const stripe = getStripe();
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl
  });
}
async function createCheckoutSession(options) {
  const stripe = getStripe();
  return stripe.checkout.sessions.create({
    customer: options.customerId,
    mode: options.mode || "subscription",
    line_items: [
      {
        price: options.priceId,
        quantity: options.quantity ?? 1
      }
    ],
    success_url: options.successUrl,
    cancel_url: options.cancelUrl,
    subscription_data: options.trialPeriodDays ? {
      trial_period_days: options.trialPeriodDays,
      metadata: options.metadata
    } : {
      metadata: options.metadata
    },
    metadata: options.metadata
  });
}

// src/stripe/test-clock.ts
var STRIPE_TEST_CLOCK_IN_FLIGHT_MS = 3e4;
function isStripeTestModeSecret(secret) {
  return typeof secret === "string" && secret.startsWith("sk_test_");
}
function requireStripeTestClockSecret(secret = process.env.STRIPE_SECRET_KEY) {
  if (!isStripeTestModeSecret(secret)) {
    throw new Error("Stripe Test Clock requires STRIPE_SECRET_KEY starting with sk_test_");
  }
  return secret;
}
function clockAdvanceCrossesPeriodEnd(previousFrozenTime, nextFrozenTime, subscriptionPeriodEnd) {
  return previousFrozenTime < subscriptionPeriodEnd && nextFrozenTime >= subscriptionPeriodEnd;
}
function invoiceEventsAfterClockAdvance(input) {
  if (!clockAdvanceCrossesPeriodEnd(
    input.previousFrozenTime,
    input.nextFrozenTime,
    input.subscriptionPeriodEnd
  )) {
    return [];
  }
  return ["invoice.finalized", "invoice.paid", "customer.subscription.updated"];
}
function decideClockWebhookReplay(event, now = /* @__PURE__ */ new Date(), inFlightMs = STRIPE_TEST_CLOCK_IN_FLIGHT_MS) {
  if (event.processedAt != null) {
    return "skip_processed";
  }
  if (event.errorMessage) {
    return "process";
  }
  if (now.getTime() - event.createdAt.getTime() < inFlightMs) {
    return "in_flight";
  }
  return "process";
}
async function createStripeTestClock(clocks, input) {
  const clock = await clocks.create({
    frozen_time: input.frozenTime,
    name: input.name
  });
  return { id: clock.id, frozenTime: clock.frozen_time, name: clock.name ?? input.name };
}
async function advanceStripeTestClock(clocks, clockId, frozenTime) {
  const clock = await clocks.advance(clockId, { frozen_time: frozenTime });
  return { id: clock.id, frozenTime: clock.frozen_time };
}

export {
  createCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  getOrCreateCustomer,
  createBillingPortalSession,
  createCheckoutSession,
  STRIPE_TEST_CLOCK_IN_FLIGHT_MS,
  isStripeTestModeSecret,
  requireStripeTestClockSecret,
  clockAdvanceCrossesPeriodEnd,
  invoiceEventsAfterClockAdvance,
  decideClockWebhookReplay,
  createStripeTestClock,
  advanceStripeTestClock
};
//# sourceMappingURL=chunk-OUE3DC7O.js.map