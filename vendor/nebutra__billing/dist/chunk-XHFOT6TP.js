import {
  PAYMENT_ORDER_METADATA_KEY
} from "./chunk-HXOJK45E.js";

// src/checkout/creem.ts
var CreemCheckoutProvider = class {
  name = "creem";
  async createPaymentSession(input) {
    const { createCreemCheckout } = await import("./creem-M2S65BWT.js");
    const checkout = await createCreemCheckout({
      requestId: input.orderId,
      customPriceMinor: input.amountMinor,
      successUrl: input.successUrl,
      ...input.customerEmail ? { customerEmail: input.customerEmail } : {},
      metadata: {
        [PAYMENT_ORDER_METADATA_KEY]: input.orderId,
        organizationId: input.organizationId
      }
    });
    return {
      kind: "redirect",
      url: checkout.checkout_url,
      providerRef: checkout.id,
      provider: "creem"
    };
  }
};

export {
  CreemCheckoutProvider
};
//# sourceMappingURL=chunk-XHFOT6TP.js.map