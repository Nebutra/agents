// src/checkout/polar.ts
var PolarCheckoutProvider = class {
  name = "polar";
  async createCreditPurchase(input) {
    if (!input.priceId) {
      throw new Error(
        "Polar checkout requires a productId passed as `priceId` on CreditPurchaseInput"
      );
    }
    const { createPolarCheckout } = await import("./polar/index.js");
    const metadata = {
      type: "credit_purchase",
      organizationId: input.organizationId,
      creditAmount: String(input.creditAmount),
      ...input.referenceId ? { referenceId: input.referenceId } : {},
      ...input.metadata ?? {}
    };
    const checkout = await createPolarCheckout({
      productId: input.priceId,
      successUrl: input.successUrl,
      customerEmail: input.customerEmail,
      metadata
    });
    const url = checkout.url;
    const id = checkout.id;
    const expiresAt = checkout.expiresAt;
    if (!url) {
      throw new Error("Polar did not return a checkout URL");
    }
    return {
      url,
      sessionId: id ?? `polar_${Date.now()}`,
      provider: "polar",
      ...expiresAt ? { expiresAt: new Date(expiresAt) } : {}
    };
  }
};

export {
  PolarCheckoutProvider
};
//# sourceMappingURL=chunk-Q7RTUAIY.js.map