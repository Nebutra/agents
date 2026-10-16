// src/checkout/manual.ts
var ManualCheckoutProvider = class {
  name = "manual";
  async createPaymentSession(input) {
    const separator = input.successUrl.includes("?") ? "&" : "?";
    return {
      kind: "redirect",
      url: `${input.successUrl}${separator}manual_order=${input.orderId}`,
      provider: "manual"
    };
  }
};

export {
  ManualCheckoutProvider
};
//# sourceMappingURL=chunk-3JCLGJ6I.js.map