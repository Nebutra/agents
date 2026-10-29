import {
  isCreemConfigured
} from "./chunk-FY2FTVCA.js";

// src/checkout/factory.ts
import { isMainlandMarket } from "@nebutra/contracts/market";
function detectProvider(env = process.env) {
  const explicit = env.BILLING_PROVIDER?.trim();
  if (explicit) {
    return explicit;
  }
  const creem = isCreemConfigured(env);
  const chinapay = isChinaPayConfigured(void 0, env);
  if (isMainlandMarket(env) && chinapay) return "chinapay";
  if (creem) return "creem";
  if (chinapay) return "chinapay";
  return "manual";
}
function isChinaPayConfigured(method, env = process.env) {
  const alipay = Boolean(env.ALIPAY_APP_ID);
  const wechat = Boolean(env.WECHATPAY_MCHID);
  if (method === "alipay") return alipay;
  if (method === "wechat") return wechat;
  return alipay || wechat;
}
async function getCheckout(config) {
  const provider = config?.provider ?? detectProvider();
  switch (provider) {
    case "creem": {
      const { CreemCheckoutProvider } = await import("./creem-37KWOXFP.js");
      return new CreemCheckoutProvider();
    }
    case "stripe": {
      const { StripeCheckoutProvider } = await import("./stripe-5OMFWBLA.js");
      return new StripeCheckoutProvider();
    }
    case "chinapay": {
      const { ChinaPayCheckoutProvider: ChinaPayCheckoutProvider2 } = await import("./chinapay-5BWOHNA6.js");
      return new ChinaPayCheckoutProvider2();
    }
    default: {
      const { ManualCheckoutProvider } = await import("./manual-WF5RE4VO.js");
      return new ManualCheckoutProvider();
    }
  }
}

// src/checkout/chinapay.ts
var ChinaPayCheckoutProvider = class {
  name = "chinapay";
  async createPaymentSession(input) {
    const { createChinaPayOrder } = await import("./chinapay/index.js");
    const method = input.method ?? (isChinaPayConfigured("alipay") ? "alipay" : "wechat");
    const order = await createChinaPayOrder({
      tradeOrderId: input.orderId,
      totalFee: (input.amountMinor / 100).toFixed(2),
      method,
      title: input.title,
      channel: input.channel,
      clientIp: input.clientIp,
      returnUrl: input.successUrl,
      quitUrl: input.cancelUrl
    });
    return { kind: order.kind, url: order.payUrl, provider: "chinapay" };
  }
};

export {
  detectProvider,
  isChinaPayConfigured,
  getCheckout,
  ChinaPayCheckoutProvider
};
//# sourceMappingURL=chunk-GGPW5O4Z.js.map