import {
  BillingError
} from "./chunk-44PNSGWM.js";

// src/chinapay/alipay.ts
import { createSign, createVerify } from "crypto";
import { logger } from "@nebutra/logger";

// src/chinapay/client.ts
var wechatConfig = null;
var alipayConfig = null;
function initWechatPay(cfg) {
  wechatConfig = cfg;
}
function initAlipay(cfg) {
  alipayConfig = {
    ...cfg,
    gatewayUrl: cfg.gatewayUrl ?? (cfg.sandbox ? "https://openapi-sandbox.dl.alipaydev.com/gateway.do" : "https://openapi.alipay.com/gateway.do")
  };
}
function resetChinaPayConfig() {
  wechatConfig = null;
  alipayConfig = null;
}
function normalizePemFromEnv(value) {
  return value.includes("\\n") ? value.replace(/\\n/g, "\n") : value;
}
function getWechatPayConfig() {
  if (wechatConfig) return wechatConfig;
  const mchid = process.env.WECHATPAY_MCHID;
  const appId = process.env.WECHATPAY_APP_ID;
  const privateKey = process.env.WECHATPAY_PRIVATE_KEY;
  const serialNo = process.env.WECHATPAY_SERIAL_NO;
  const apiV3Key = process.env.WECHATPAY_API_V3_KEY;
  const notifyUrl = process.env.WECHATPAY_NOTIFY_URL;
  if (!mchid || !appId || !privateKey || !serialNo || !apiV3Key || !notifyUrl) {
    throw new Error(
      "WeChat Pay is not configured (WECHATPAY_MCHID, WECHATPAY_APP_ID, WECHATPAY_PRIVATE_KEY, WECHATPAY_SERIAL_NO, WECHATPAY_API_V3_KEY, WECHATPAY_NOTIFY_URL)"
    );
  }
  wechatConfig = {
    mchid,
    appId,
    privateKey: normalizePemFromEnv(privateKey),
    serialNo,
    apiV3Key,
    notifyUrl,
    baseUrl: process.env.WECHATPAY_BASE_URL ?? "https://api.mch.weixin.qq.com"
  };
  return wechatConfig;
}
function getAlipayConfig() {
  if (alipayConfig) return alipayConfig;
  const appId = process.env.ALIPAY_APP_ID;
  const privateKey = process.env.ALIPAY_PRIVATE_KEY;
  const alipayPublicKey = process.env.ALIPAY_PUBLIC_KEY;
  const notifyUrl = process.env.ALIPAY_NOTIFY_URL;
  if (!appId || !privateKey || !alipayPublicKey || !notifyUrl) {
    throw new Error(
      "Alipay is not configured (ALIPAY_APP_ID, ALIPAY_PRIVATE_KEY, ALIPAY_PUBLIC_KEY, ALIPAY_NOTIFY_URL)"
    );
  }
  const sandbox = process.env.ALIPAY_SANDBOX === "true";
  alipayConfig = {
    appId,
    privateKey: normalizePemFromEnv(privateKey),
    alipayPublicKey: normalizePemFromEnv(alipayPublicKey),
    notifyUrl,
    sandbox,
    gatewayUrl: process.env.ALIPAY_GATEWAY_URL ?? (sandbox ? "https://openapi-sandbox.dl.alipaydev.com/gateway.do" : "https://openapi.alipay.com/gateway.do")
  };
  return alipayConfig;
}
function toPemBlock(base64, label) {
  const lines = base64.match(/.{1,64}/g) ?? [base64];
  return `-----BEGIN ${label}-----
${lines.join("\n")}
-----END ${label}-----
`;
}
function ensurePem(value, label) {
  if (value.includes("-----BEGIN")) return value;
  return toPemBlock(value.replace(/\s+/g, ""), label);
}

// src/chinapay/alipay.ts
var log = logger.child({ service: "alipay" });
function alipayTimestamp() {
  const beijing = new Date(Date.now() + 8 * 60 * 60 * 1e3);
  return beijing.toISOString().replace("T", " ").slice(0, 19);
}
function signContent(params, privateKeyPem) {
  const content = Object.keys(params).filter((k) => params[k] !== void 0 && params[k] !== "" && k !== "sign").sort().map((k) => `${k}=${params[k]}`).join("&");
  return createSign("RSA-SHA256").update(content, "utf8").sign(privateKeyPem, "base64");
}
function baseParams(cfg, method, bizContent) {
  return {
    app_id: cfg.appId,
    method,
    format: "JSON",
    charset: "utf-8",
    sign_type: "RSA2",
    timestamp: alipayTimestamp(),
    version: "1.0",
    notify_url: cfg.notifyUrl,
    biz_content: JSON.stringify(bizContent)
  };
}
async function createAlipayPrecreateOrder(input) {
  const cfg = getAlipayConfig();
  const params = baseParams(cfg, "alipay.trade.precreate", {
    out_trade_no: input.outTradeNo,
    total_amount: input.totalAmount,
    subject: input.subject
  });
  if (input.passbackParams) {
    params.passback_params = encodeURIComponent(input.passbackParams);
  }
  params.sign = signContent(params, cfg.privateKey);
  const res = await fetch(cfg.gatewayUrl ?? "https://openapi.alipay.com/gateway.do", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString()
  });
  const data = await res.json();
  const body = data.alipay_trade_precreate_response;
  if (!res.ok || !body || body.code !== "10000") {
    log.error("Alipay precreate order failed", { status: res.status, body });
    throw new BillingError(
      `Alipay order creation failed: ${body?.sub_msg ?? body?.msg ?? "unknown error"}`,
      "ALIPAY_PRECREATE_FAILED",
      400,
      body
    );
  }
  if (!body.qr_code) {
    throw new BillingError(
      "Alipay precreate order returned no qr_code",
      "ALIPAY_MISSING_QR_CODE",
      502,
      body
    );
  }
  return { qrCode: body.qr_code };
}
async function queryAlipayOrder(outTradeNo) {
  const cfg = getAlipayConfig();
  const params = baseParams(cfg, "alipay.trade.query", { out_trade_no: outTradeNo });
  params.sign = signContent(params, cfg.privateKey);
  const res = await fetch(cfg.gatewayUrl ?? "https://openapi.alipay.com/gateway.do", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString()
  });
  const data = await res.json();
  const body = data.alipay_trade_query_response;
  const statusMap = {
    TRADE_SUCCESS: "paid",
    TRADE_FINISHED: "paid",
    WAIT_BUYER_PAY: "pending",
    TRADE_CLOSED: "failed"
  };
  return {
    status: statusMap[body?.trade_status ?? ""] ?? "pending",
    totalAmount: body?.total_amount ?? "0"
  };
}
function verifyAlipayNotification(fields) {
  const cfg = getAlipayConfig();
  const sign = fields.sign;
  if (!sign) return false;
  const toVerify = {};
  for (const [key, value] of Object.entries(fields)) {
    if (key === "sign" || key === "sign_type" || value === void 0) continue;
    toVerify[key] = value;
  }
  const content = Object.keys(toVerify).sort().map((k) => `${k}=${toVerify[k]}`).join("&");
  try {
    return createVerify("RSA-SHA256").update(content, "utf8").verify(cfg.alipayPublicKey, sign, "base64");
  } catch (error) {
    log.error("Alipay notification signature verification threw", { error });
    return false;
  }
}
var ALIPAY_NOTIFY_SUCCESS_BODIES = ["TRADE_SUCCESS", "TRADE_FINISHED"];

// src/chinapay/wechat.ts
import {
  createDecipheriv,
  createSign as createSign2,
  createVerify as createVerify2,
  randomBytes,
  X509Certificate
} from "crypto";
import { logger as logger2 } from "@nebutra/logger";
var log2 = logger2.child({ service: "wechatpay" });
function nonceStr() {
  return randomBytes(16).toString("hex");
}
function timestampSeconds() {
  return String(Math.floor(Date.now() / 1e3));
}
function signRequest(cfg, method, urlPath, body) {
  const timestamp = timestampSeconds();
  const nonce = nonceStr();
  const message = `${method}
${urlPath}
${timestamp}
${nonce}
${body}
`;
  const signature = createSign2("RSA-SHA256").update(message).sign(cfg.privateKey, "base64");
  const authorization = `WECHATPAY2-SHA256-RSA2048 mchid="${cfg.mchid}",nonce_str="${nonce}",timestamp="${timestamp}",serial_no="${cfg.serialNo}",signature="${signature}"`;
  return { authorization, timestamp, nonce };
}
async function wechatRequest(cfg, method, urlPath, body) {
  const bodyText = body ? JSON.stringify(body) : "";
  const { authorization } = signRequest(cfg, method, urlPath, bodyText);
  const baseUrl = cfg.baseUrl ?? "https://api.mch.weixin.qq.com";
  const res = await fetch(`${baseUrl}${urlPath}`, {
    method,
    headers: {
      Authorization: authorization,
      Accept: "application/json",
      ...body ? { "Content-Type": "application/json" } : {},
      "User-Agent": "nebutra-sailor/wechatpay-v3"
    },
    body: body ? bodyText : void 0
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new BillingError(
      `WeChat Pay request failed: ${data.message ?? res.statusText}`,
      data.code ?? "WECHATPAY_REQUEST_FAILED",
      res.status,
      data
    );
  }
  return data;
}
async function createWechatNativeOrder(input) {
  const cfg = getWechatPayConfig();
  if (input.attach && Buffer.byteLength(input.attach, "utf8") > 128) {
    throw new BillingError(
      "WeChat Pay attach payload exceeds 128 bytes",
      "WECHATPAY_ATTACH_TOO_LARGE",
      400
    );
  }
  const data = await wechatRequest(
    cfg,
    "POST",
    "/v3/pay/transactions/native",
    {
      mchid: cfg.mchid,
      appid: cfg.appId,
      description: input.description,
      out_trade_no: input.outTradeNo,
      notify_url: cfg.notifyUrl,
      amount: { total: input.totalFen, currency: "CNY" },
      ...input.attach ? { attach: input.attach } : {}
    }
  );
  return { codeUrl: data.code_url };
}
async function queryWechatOrder(outTradeNo) {
  const cfg = getWechatPayConfig();
  const data = await wechatRequest(
    cfg,
    "GET",
    `/v3/pay/transactions/out-trade-no/${encodeURIComponent(outTradeNo)}?mchid=${cfg.mchid}`
  );
  const status = data.trade_state === "SUCCESS" ? "paid" : data.trade_state === "NOTPAY" || data.trade_state === "USERPAYING" ? "pending" : "failed";
  return { status, amountFen: data.amount?.total ?? 0 };
}
var platformCertCache = /* @__PURE__ */ new Map();
var platformCertFetchedAt = 0;
var PLATFORM_CERT_TTL_MS = 12 * 60 * 60 * 1e3;
function decryptAeadAes256Gcm(apiV3Key, nonce, associatedData, ciphertextBase64) {
  const raw = Buffer.from(ciphertextBase64, "base64");
  const authTag = raw.subarray(raw.length - 16);
  const ciphertext = raw.subarray(0, raw.length - 16);
  const decipher = createDecipheriv(
    "aes-256-gcm",
    Buffer.from(apiV3Key, "utf8"),
    Buffer.from(nonce, "utf8")
  );
  decipher.setAuthTag(authTag);
  decipher.setAAD(Buffer.from(associatedData, "utf8"));
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}
async function refreshPlatformCertificates(cfg) {
  const data = await wechatRequest(cfg, "GET", "/v3/certificates");
  const next = /* @__PURE__ */ new Map();
  for (const entry of data.data) {
    const pem = decryptAeadAes256Gcm(
      cfg.apiV3Key,
      entry.encrypt_certificate.nonce,
      entry.encrypt_certificate.associated_data,
      entry.encrypt_certificate.ciphertext
    );
    next.set(entry.serial_no, {
      publicKeyPem: new X509Certificate(pem).publicKey.export({ type: "spki", format: "pem" }).toString(),
      expireTime: Date.parse(entry.expire_time)
    });
  }
  platformCertCache = next;
  platformCertFetchedAt = Date.now();
}
async function getPlatformPublicKey(cfg, serialNo) {
  const stale = Date.now() - platformCertFetchedAt > PLATFORM_CERT_TTL_MS;
  if (stale || !platformCertCache.has(serialNo)) {
    await refreshPlatformCertificates(cfg);
  }
  const entry = platformCertCache.get(serialNo);
  if (!entry) {
    throw new BillingError(
      "Unknown WeChat Pay platform certificate serial",
      "WECHATPAY_UNKNOWN_CERT_SERIAL",
      400
    );
  }
  return entry.publicKeyPem;
}
function resetWechatPlatformCertCache() {
  platformCertCache = /* @__PURE__ */ new Map();
  platformCertFetchedAt = 0;
}
function seedWechatPlatformCertCache(serialNo, publicKeyPem) {
  platformCertCache.set(serialNo, { publicKeyPem, expireTime: Date.now() + PLATFORM_CERT_TTL_MS });
  platformCertFetchedAt = Date.now();
}
async function verifyAndDecryptWechatNotification(headers, rawBody) {
  const cfg = getWechatPayConfig();
  const publicKeyPem = await getPlatformPublicKey(cfg, headers.serial);
  const message = `${headers.timestamp}
${headers.nonce}
${rawBody}
`;
  const valid = createVerify2("RSA-SHA256").update(message).verify(publicKeyPem, headers.signature, "base64");
  if (!valid) {
    throw new BillingError(
      "WeChat Pay notification signature is invalid",
      "WECHATPAY_BAD_SIGNATURE",
      400
    );
  }
  const envelope = JSON.parse(rawBody);
  if (envelope.event_type !== "TRANSACTION.SUCCESS") {
    log2.info("Ignoring non-success WeChat Pay notification", { eventType: envelope.event_type });
  }
  const plaintext = decryptAeadAes256Gcm(
    cfg.apiV3Key,
    envelope.resource.nonce,
    envelope.resource.associated_data,
    envelope.resource.ciphertext
  );
  return JSON.parse(plaintext);
}
var WECHAT_NOTIFY_OK = { code: "SUCCESS", message: "\u6210\u529F" };
var WECHAT_NOTIFY_FAIL = (message) => ({ code: "FAIL", message });

// src/chinapay/payments.ts
async function createChinaPayOrder(input) {
  if (input.method === "wechat") {
    const totalFen = Math.round(Number.parseFloat(input.totalFee) * 100);
    const { codeUrl } = await createWechatNativeOrder({
      outTradeNo: input.tradeOrderId,
      description: input.title,
      totalFen,
      attach: input.attach
    });
    return { payUrl: codeUrl, tradeOrderId: input.tradeOrderId };
  }
  const { qrCode } = await createAlipayPrecreateOrder({
    outTradeNo: input.tradeOrderId,
    subject: input.title,
    totalAmount: input.totalFee,
    passbackParams: input.attach
  });
  return { payUrl: qrCode, tradeOrderId: input.tradeOrderId };
}
async function queryChinaPayOrder(tradeOrderId, method) {
  if (method === "wechat") {
    const result2 = await queryWechatOrder(tradeOrderId);
    return { status: result2.status };
  }
  const result = await queryAlipayOrder(tradeOrderId);
  return { status: result.status };
}

export {
  initWechatPay,
  initAlipay,
  resetChinaPayConfig,
  getWechatPayConfig,
  getAlipayConfig,
  ensurePem,
  createAlipayPrecreateOrder,
  queryAlipayOrder,
  verifyAlipayNotification,
  ALIPAY_NOTIFY_SUCCESS_BODIES,
  createWechatNativeOrder,
  queryWechatOrder,
  resetWechatPlatformCertCache,
  seedWechatPlatformCertCache,
  verifyAndDecryptWechatNotification,
  WECHAT_NOTIFY_OK,
  WECHAT_NOTIFY_FAIL,
  createChinaPayOrder,
  queryChinaPayOrder
};
//# sourceMappingURL=chunk-XFCVBZZ7.js.map