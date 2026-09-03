// src/checkout/chinapay.ts
import { logger } from "@nebutra/logger";

// src/checkout/types.ts
import { z } from "zod";
var CreditPurchaseInputSchema = z.object({
  organizationId: z.string().min(1),
  creditAmount: z.number().int().positive(),
  // Number of credits to grant
  amount: z.number().positive(),
  // Dollar amount to charge
  currency: z.string().length(3).default("USD"),
  customerEmail: z.string().email().optional(),
  customerId: z.string().optional(),
  // Pre-existing provider customer id
  priceId: z.string().optional(),
  // Stripe price / Polar product / Lemon variant id
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  referenceId: z.string().optional(),
  // Idempotency / tracking key
  metadata: z.record(z.string(), z.string()).optional()
});
var CREDIT_PURCHASE_METADATA_TYPE = "credit_purchase";

// src/checkout/chinapay.ts
var log = logger.child({ service: "chinapay-checkout" });
var ChinaPayCheckoutProvider = class {
  name = "chinapay";
  async createCreditPurchase(input) {
    const { createChinaPayOrder } = await import("./chinapay/index.js");
    const method = process.env.CHINAPAY_METHOD === "wechat" ? "wechat" : "alipay";
    const tradeOrderId = input.referenceId ?? `credit_${input.creditAmount}_${input.organizationId}_${Date.now()}`;
    const attachPayload = (includeReference) => JSON.stringify({
      t: CREDIT_PURCHASE_METADATA_TYPE,
      o: input.organizationId,
      c: String(input.creditAmount),
      ...includeReference && input.referenceId ? { r: input.referenceId } : {}
    });
    let attach = attachPayload(true);
    if (Buffer.byteLength(attach, "utf8") > 128) {
      attach = attachPayload(false);
    }
    if (Buffer.byteLength(attach, "utf8") > 128) {
      log.error("ChinaPay attach payload exceeds 128 bytes even without referenceId", {
        organizationId: input.organizationId
      });
      throw new Error("Credit purchase metadata is too large for WeChat Pay/Alipay passthrough");
    }
    const order = await createChinaPayOrder({
      tradeOrderId,
      totalFee: input.amount.toFixed(2),
      method,
      title: `${input.creditAmount} Credits`,
      attach
    });
    return {
      url: order.payUrl,
      sessionId: order.tradeOrderId,
      provider: "chinapay"
    };
  }
};

export {
  CreditPurchaseInputSchema,
  CREDIT_PURCHASE_METADATA_TYPE,
  ChinaPayCheckoutProvider
};
//# sourceMappingURL=chunk-YAIVJWCN.js.map