// src/checkout/factory.ts
function detectProvider() {
  const explicit = process.env.BILLING_PROVIDER;
  if (explicit) {
    return explicit;
  }
  if (process.env.STRIPE_SECRET_KEY) return "stripe";
  if (isChinaPayConfigured()) return "chinapay";
  return "manual";
}
function isChinaPayConfigured(method) {
  const alipay = Boolean(process.env.ALIPAY_APP_ID);
  const wechat = Boolean(process.env.WECHATPAY_MCHID);
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
      const { ChinaPayCheckoutProvider: ChinaPayCheckoutProvider2 } = await import("./chinapay-SUPZFORW.js");
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
//# sourceMappingURL=chunk-MNIB3ISW.js.map