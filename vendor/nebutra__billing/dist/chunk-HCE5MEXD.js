import {
  dollarsToCents
} from "./chunk-XTZHQTHP.js";

// src/checkout/stripe.ts
var StripeCheckoutProvider = class {
  name = "stripe";
  async createCreditPurchase(input) {
    const { getStripe, getOrCreateCustomer } = await import("./stripe/index.js");
    const stripe = getStripe();
    let customerId = input.customerId;
    if (!customerId && input.customerEmail) {
      const customer = await getOrCreateCustomer(
        input.organizationId,
        input.customerEmail,
        input.customerEmail
      );
      customerId = customer.id;
    }
    const metadata = {
      type: "credit_purchase",
      organizationId: input.organizationId,
      creditAmount: String(input.creditAmount),
      ...input.referenceId ? { referenceId: input.referenceId } : {},
      ...input.metadata ?? {}
    };
    const session = await stripe.checkout.sessions.create({
      ...customerId ? { customer: customerId } : {},
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: input.currency.toLowerCase(),
            product_data: { name: `${input.creditAmount} Credits` },
            unit_amount: dollarsToCents(input.amount)
          },
          quantity: 1
        }
      ],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata
    });
    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL");
    }
    return {
      url: session.url,
      sessionId: session.id,
      provider: "stripe",
      ...session.expires_at ? { expiresAt: new Date(session.expires_at * 1e3) } : {}
    };
  }
};

export {
  StripeCheckoutProvider
};
//# sourceMappingURL=chunk-HCE5MEXD.js.map