// src/stripe/client.ts
import Stripe from "stripe";
var stripeClient = null;
var STRIPE_API_VERSION = "2026-02-25.clover";
function initStripe(config) {
  stripeClient = new Stripe(config.secretKey, {
    apiVersion: STRIPE_API_VERSION,
    typescript: true
  });
  return stripeClient;
}
function getStripe() {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("Stripe not initialized. Call initStripe() or set STRIPE_SECRET_KEY");
    }
    stripeClient = new Stripe(secretKey, {
      apiVersion: STRIPE_API_VERSION,
      typescript: true
    });
  }
  return stripeClient;
}
function getWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET not set");
  }
  return secret;
}

export {
  initStripe,
  getStripe,
  getWebhookSecret
};
//# sourceMappingURL=chunk-B4ZQV2UG.js.map