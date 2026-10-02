import {
  PAYMENT_ORDER_METADATA_KEY
} from "./chunk-HXOJK45E.js";

// src/checkout/stripe.ts
var StripeCheckoutProvider = class {
  name = "stripe";
  async createPaymentSession(input) {
    const { getStripe } = await import("./stripe/index.js");
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        client_reference_id: input.orderId,
        ...input.customerEmail ? { customer_email: input.customerEmail } : {},
        line_items: [
          {
            price_data: {
              currency: input.currency.toLowerCase(),
              product_data: { name: input.title },
              unit_amount: input.amountMinor
            },
            quantity: 1
          }
        ],
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        metadata: {
          [PAYMENT_ORDER_METADATA_KEY]: input.orderId,
          organizationId: input.organizationId
        }
      },
      // One order opens at most one session, however often the request is retried.
      { idempotencyKey: `payment-order:${input.orderId}` }
    );
    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL");
    }
    return {
      kind: "redirect",
      url: session.url,
      providerRef: session.id,
      provider: "stripe",
      ...session.expires_at ? { expiresAt: new Date(session.expires_at * 1e3) } : {}
    };
  }
};
async function refundStripeCheckoutSession(input) {
  const { getStripe } = await import("./stripe/index.js");
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(input.sessionId);
  const paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  if (!paymentIntent) {
    throw new Error(`Stripe session ${input.sessionId} has no payment to refund`);
  }
  const refund = await stripe.refunds.create(
    { payment_intent: paymentIntent, amount: input.amountMinor },
    { idempotencyKey: `refund:${input.refundId}` }
  );
  return {
    status: refund.status === "succeeded" ? "succeeded" : refund.status === "pending" || refund.status === "requires_action" ? "processing" : "failed"
  };
}

export {
  StripeCheckoutProvider,
  refundStripeCheckoutSession
};
//# sourceMappingURL=chunk-GV4XPATE.js.map