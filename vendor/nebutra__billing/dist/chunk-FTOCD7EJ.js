// src/checkout/lemonsqueezy.ts
var LemonCheckoutProvider = class {
  name = "lemonsqueezy";
  async createCreditPurchase(input) {
    if (!input.priceId) {
      throw new Error(
        "LemonSqueezy checkout requires a variantId passed as `priceId` on CreditPurchaseInput"
      );
    }
    const { createLemonCheckout } = await import("./lemonsqueezy/index.js");
    const customData = {
      type: "credit_purchase",
      organizationId: input.organizationId,
      creditAmount: String(input.creditAmount),
      ...input.referenceId ? { referenceId: input.referenceId } : {},
      ...input.metadata ?? {}
    };
    const { checkoutUrl, checkout } = await createLemonCheckout({
      variantId: input.priceId,
      email: input.customerEmail,
      redirectUrl: input.successUrl,
      customData
    });
    const sessionId = checkout?.data?.id ?? `lemon_${Date.now()}`;
    return {
      url: checkoutUrl,
      sessionId: String(sessionId),
      provider: "lemonsqueezy"
    };
  }
};

export {
  LemonCheckoutProvider
};
//# sourceMappingURL=chunk-FTOCD7EJ.js.map