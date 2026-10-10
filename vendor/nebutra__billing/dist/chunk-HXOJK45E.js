// src/checkout/types.ts
import { z } from "zod";
var PaymentSessionInputSchema = z.object({
  /** The PaymentOrder id — also the provider's merchant order number. */
  orderId: z.string().min(1).max(32),
  organizationId: z.string().min(1),
  /** Shown to the buyer on the provider's page. */
  title: z.string().min(1),
  amountMinor: z.number().int().positive(),
  currency: z.string().length(3),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  customerEmail: z.string().email().optional(),
  /** ChinaPay only: which wallet the buyer chose. */
  method: z.enum(["alipay", "wechat"]).optional(),
  /** ChinaPay only: `qr` for a desktop to scan, `h5` to open the wallet on this phone. */
  channel: z.enum(["qr", "h5"]).optional(),
  /** ChinaPay H5 only: the buyer's IP, which WeChat Pay H5 requires. */
  clientIp: z.string().optional()
});
var PAYMENT_ORDER_METADATA_KEY = "paymentOrderId";
var CREDIT_PURCHASE_METADATA_TYPE = "credit_purchase";

export {
  PaymentSessionInputSchema,
  PAYMENT_ORDER_METADATA_KEY,
  CREDIT_PURCHASE_METADATA_TYPE
};
//# sourceMappingURL=chunk-HXOJK45E.js.map