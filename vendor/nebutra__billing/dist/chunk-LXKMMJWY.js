import {
  SubscriptionError
} from "./chunk-44PNSGWM.js";
import {
  getStripe
} from "./chunk-B4ZQV2UG.js";

// src/subscriptions/service.ts
async function createStripeSubscription(input) {
  const stripe = getStripe();
  const subscriptionData = {
    customer: input.customerId,
    items: [{ price: input.priceId }],
    metadata: {
      organizationId: input.organizationId,
      ...input.metadata
    },
    expand: ["latest_invoice.payment_intent"]
  };
  if (input.trialDays && input.trialDays > 0) {
    subscriptionData.trial_period_days = input.trialDays;
  }
  return stripe.subscriptions.create(subscriptionData);
}
async function getStripeSubscription(subscriptionId) {
  const stripe = getStripe();
  try {
    return await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["customer", "items.data.price.product"]
    });
  } catch {
    return null;
  }
}
async function updateStripeSubscription(subscriptionId, updates) {
  const stripe = getStripe();
  const updateParams = {};
  if (updates.priceId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const itemId = subscription.items.data[0]?.id;
    if (!itemId) {
      throw new SubscriptionError("No subscription items found", "NO_SUBSCRIPTION_ITEMS");
    }
    updateParams.items = [
      {
        id: itemId,
        price: updates.priceId
      }
    ];
    updateParams.proration_behavior = "create_prorations";
  }
  if (updates.cancelAtPeriodEnd !== void 0) {
    updateParams.cancel_at_period_end = updates.cancelAtPeriodEnd;
  }
  if (updates.metadata) {
    updateParams.metadata = updates.metadata;
  }
  return stripe.subscriptions.update(subscriptionId, updateParams);
}
async function cancelStripeSubscription(subscriptionId, immediately = false) {
  const stripe = getStripe();
  if (immediately) {
    return stripe.subscriptions.cancel(subscriptionId);
  }
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true
  });
}
async function resumeStripeSubscription(subscriptionId) {
  const stripe = getStripe();
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false
  });
}
async function pauseStripeSubscription(subscriptionId) {
  const stripe = getStripe();
  return stripe.subscriptions.update(subscriptionId, {
    pause_collection: {
      behavior: "void"
    }
  });
}
async function unpauseStripeSubscription(subscriptionId) {
  const stripe = getStripe();
  return stripe.subscriptions.update(subscriptionId, {
    pause_collection: ""
  });
}
async function getCustomerSubscriptions(customerId) {
  const stripe = getStripe();
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    expand: ["data.items.data.price.product"]
  });
  return subscriptions.data;
}
function mapStripeStatusToLocal(stripeStatus) {
  const statusMap = {
    active: "ACTIVE",
    past_due: "PAST_DUE",
    canceled: "CANCELED",
    unpaid: "UNPAID",
    trialing: "TRIALING",
    paused: "PAUSED",
    incomplete: "INCOMPLETE",
    incomplete_expired: "CANCELED"
  };
  return statusMap[stripeStatus] || "INCOMPLETE";
}
async function previewSubscriptionChange(subscriptionId, newPriceId) {
  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const itemId = subscription.items.data[0]?.id;
  if (!itemId) {
    throw new SubscriptionError("No subscription items found", "NO_SUBSCRIPTION_ITEMS");
  }
  return stripe.invoices.createPreview({
    subscription: subscriptionId,
    subscription_details: {
      items: [
        {
          id: itemId,
          price: newPriceId
        }
      ]
    }
  });
}

export {
  createStripeSubscription,
  getStripeSubscription,
  updateStripeSubscription,
  cancelStripeSubscription,
  resumeStripeSubscription,
  pauseStripeSubscription,
  unpauseStripeSubscription,
  getCustomerSubscriptions,
  mapStripeStatusToLocal,
  previewSubscriptionChange
};
//# sourceMappingURL=chunk-LXKMMJWY.js.map