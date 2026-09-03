// src/checkout/manual.ts
var ManualCheckoutProvider = class {
  name = "manual";
  async createCreditPurchase(input) {
    const sessionId = `manual_${Date.now()}_${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
    const separator = input.successUrl.includes("?") ? "&" : "?";
    return {
      url: `${input.successUrl}${separator}manual_session=${sessionId}`,
      sessionId,
      provider: "manual"
    };
  }
};

export {
  ManualCheckoutProvider
};
//# sourceMappingURL=chunk-MZLNCNRS.js.map