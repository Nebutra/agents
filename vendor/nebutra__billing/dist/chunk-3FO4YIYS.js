import {
  BillingError
} from "./chunk-44PNSGWM.js";

// src/creem/index.ts
import { createHmac, timingSafeEqual } from "crypto";
import { logger } from "@nebutra/logger";
var log = logger.child({ service: "creem" });
function isCreemConfigured(env = process.env) {
  return Boolean(env.CREEM_API_KEY && env.CREEM_PRODUCT_ID);
}
function getCreemConfig(env = process.env) {
  const apiKey = env.CREEM_API_KEY?.trim();
  const productId = env.CREEM_PRODUCT_ID?.trim();
  if (!apiKey || !productId) {
    throw new BillingError(
      "Creem is not configured (CREEM_API_KEY, CREEM_PRODUCT_ID)",
      "CREEM_UNCONFIGURED",
      500
    );
  }
  return {
    apiKey,
    productId,
    webhookSecret: env.CREEM_WEBHOOK_SECRET?.trim() || void 0,
    testMode: env.CREEM_TEST_MODE === "true"
  };
}
function baseUrl(cfg) {
  return cfg.testMode ? "https://test-api.creem.io" : "https://api.creem.io";
}
async function creemRequest(cfg, method, path, body, fetchImpl = fetch) {
  const res = await fetchImpl(`${baseUrl(cfg)}${path}`, {
    method,
    headers: {
      "x-api-key": cfg.apiKey,
      accept: "application/json",
      ...body ? { "content-type": "application/json" } : {}
    },
    body: body ? JSON.stringify(body) : void 0,
    signal: AbortSignal.timeout(15e3)
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    log.error("Creem request failed", { method, path, status: res.status, body: data });
    const message = Array.isArray(data.message) ? data.message.join("; ") : data.message;
    throw new BillingError(
      `Creem request failed: ${typeof message === "string" ? message : res.statusText}`,
      "CREEM_REQUEST_FAILED",
      res.status >= 500 ? 502 : 400,
      data
    );
  }
  return data;
}
async function createCreemCheckout(input, fetchImpl = fetch) {
  const cfg = getCreemConfig();
  if (!(Number.isInteger(input.customPriceMinor) && input.customPriceMinor >= 100)) {
    throw new BillingError(
      "Creem needs a price of at least 100 minor units",
      "CREEM_PRICE_OUT_OF_RANGE",
      400
    );
  }
  return creemRequest(
    cfg,
    "POST",
    "/v1/checkouts",
    {
      product_id: cfg.productId,
      request_id: input.requestId,
      custom_price: input.customPriceMinor,
      success_url: input.successUrl,
      ...input.customerEmail ? { customer: { email: input.customerEmail } } : {},
      ...input.metadata ? { metadata: input.metadata } : {}
    },
    fetchImpl
  );
}
async function getCreemCheckout(checkoutId, fetchImpl = fetch) {
  const cfg = getCreemConfig();
  return creemRequest(
    cfg,
    "GET",
    `/v1/checkouts?checkout_id=${encodeURIComponent(checkoutId)}`,
    void 0,
    fetchImpl
  );
}
async function refundCreemOrder(creemOrderId, fetchImpl = fetch) {
  const cfg = getCreemConfig();
  const search = await creemRequest(
    cfg,
    "GET",
    `/v1/transactions/search?order_id=${encodeURIComponent(creemOrderId)}`,
    void 0,
    fetchImpl
  );
  const transaction = search.items?.[0];
  if (!transaction) {
    throw new BillingError(
      `No Creem transaction for order ${creemOrderId}`,
      "CREEM_TRANSACTION_NOT_FOUND",
      404
    );
  }
  if (transaction.status === "refunded") return { status: "succeeded" };
  const refund = await creemRequest(
    cfg,
    "POST",
    "/v1/refunds",
    { transaction_id: transaction.id },
    fetchImpl
  );
  return {
    status: refund.status === "succeeded" ? "succeeded" : refund.status === "pending" || refund.status === "requiresAction" ? "processing" : "failed"
  };
}
function verifyCreemSignature(rawBody, signature, secret = getCreemConfig().webhookSecret) {
  if (!signature || !secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature.trim(), "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export {
  isCreemConfigured,
  getCreemConfig,
  createCreemCheckout,
  getCreemCheckout,
  refundCreemOrder,
  verifyCreemSignature
};
//# sourceMappingURL=chunk-3FO4YIYS.js.map