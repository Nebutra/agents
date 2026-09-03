interface CreateAlipayOrderInput {
    outTradeNo: string;
    subject: string;
    /** Total amount in CNY yuan, e.g. "9.90". */
    totalAmount: string;
    /** Opaque passthrough returned verbatim (URL-encoded) in the async notification. */
    passbackParams?: string;
}
declare function createAlipayPrecreateOrder(input: CreateAlipayOrderInput): Promise<{
    qrCode: string;
}>;
declare function queryAlipayOrder(outTradeNo: string): Promise<{
    status: "paid" | "pending" | "failed";
    totalAmount: string;
}>;
interface AlipayNotificationFields {
    [key: string]: string | undefined;
    sign?: string;
    sign_type?: string;
    trade_status?: string;
    out_trade_no?: string;
    trade_no?: string;
    total_amount?: string;
    passback_params?: string;
}
declare function verifyAlipayNotification(fields: AlipayNotificationFields): boolean;
declare const ALIPAY_NOTIFY_SUCCESS_BODIES: string[];

interface WechatPayConfig {
    /** WeChat Pay merchant id (mchid). */
    mchid: string;
    /** WeChat Open Platform / Official Account appid used for the order. */
    appId: string;
    /** Merchant API certificate private key, PEM-encoded. */
    privateKey: string;
    /** Serial number of the merchant API certificate matching `privateKey`. */
    serialNo: string;
    /** APIv3 key (32 bytes) used to decrypt platform certificates and notifications. */
    apiV3Key: string;
    /** Absolute HTTPS URL WeChat Pay calls on payment completion. */
    notifyUrl: string;
    /** Override for testing; defaults to the production APIv3 host. */
    baseUrl?: string;
}
interface AlipayConfig {
    /** Alipay Open Platform app id. */
    appId: string;
    /** Merchant application private key, PEM-encoded (RSA2). */
    privateKey: string;
    /** Alipay's public key for the app, PEM-encoded — used to verify async notifications. */
    alipayPublicKey: string;
    /** Absolute HTTPS URL Alipay calls on payment completion. */
    notifyUrl: string;
    /** true for the Alipay sandbox (open.alipaydev.com). */
    sandbox?: boolean;
    /** Override for testing. */
    gatewayUrl?: string;
}
declare function initWechatPay(cfg: WechatPayConfig): void;
declare function initAlipay(cfg: AlipayConfig): void;
/** Reset cached in-memory config; test-only. */
declare function resetChinaPayConfig(): void;
declare function getWechatPayConfig(): WechatPayConfig;
declare function getAlipayConfig(): AlipayConfig;
/** Wraps a bare base64 RSA key body in PEM headers if it isn't PEM already. */
declare function ensurePem(value: string, label: "PRIVATE KEY" | "PUBLIC KEY" | "CERTIFICATE"): string;

type ChinaPayMethod = "alipay" | "wechat";
interface CreateChinaPayOrderInput {
    /** Unique order ID from your system. */
    tradeOrderId: string;
    /** Amount in CNY (yuan), e.g., "9.90". */
    totalFee: string;
    /** Payment method. */
    method: ChinaPayMethod;
    /** Order title/description. */
    title: string;
    /** Opaque metadata carried through to the payment notification. */
    attach?: string;
}
interface ChinaPayOrder {
    /** A value to render as a QR code — not an http redirect for either method. */
    payUrl: string;
    tradeOrderId: string;
}
/**
 * Create a payment order directly with the official gateway (WeChat Pay
 * APIv3 Native, or Alipay `trade.precreate`) — no aggregator in the path.
 */
declare function createChinaPayOrder(input: CreateChinaPayOrderInput): Promise<ChinaPayOrder>;
/** Poll order status from the gateway (reconciliation / admin use). */
declare function queryChinaPayOrder(tradeOrderId: string, method: ChinaPayMethod): Promise<{
    status: "paid" | "pending" | "failed";
}>;

interface CreateWechatNativeOrderInput {
    outTradeNo: string;
    description: string;
    /** Total amount in CNY fen (integer cents), per the WeChat Pay APIv3 contract. */
    totalFen: number;
    /** Opaque passthrough returned verbatim in the payment notification. Max 128 bytes UTF-8. */
    attach?: string;
}
declare function createWechatNativeOrder(input: CreateWechatNativeOrderInput): Promise<{
    codeUrl: string;
}>;
declare function queryWechatOrder(outTradeNo: string): Promise<{
    status: "paid" | "pending" | "failed";
    amountFen: number;
}>;
/** Test-only: reset the platform certificate cache. */
declare function resetWechatPlatformCertCache(): void;
/** Test-only: seed the platform certificate cache without a network call. */
declare function seedWechatPlatformCertCache(serialNo: string, publicKeyPem: string): void;
interface WechatNotificationHeaders {
    timestamp: string;
    nonce: string;
    signature: string;
    serial: string;
}
interface WechatPaymentResource {
    out_trade_no: string;
    transaction_id: string;
    trade_state: string;
    attach?: string;
    amount?: {
        total?: number;
        payer_total?: number;
        currency?: string;
    };
}
declare function verifyAndDecryptWechatNotification(headers: WechatNotificationHeaders, rawBody: string): Promise<WechatPaymentResource>;
/** Success response body required by the WeChat Pay v3 notification contract. */
declare const WECHAT_NOTIFY_OK: {
    readonly code: "SUCCESS";
    readonly message: "成功";
};
declare const WECHAT_NOTIFY_FAIL: (message: string) => {
    readonly code: "FAIL";
    readonly message: string;
};

export { ALIPAY_NOTIFY_SUCCESS_BODIES, type AlipayConfig, type AlipayNotificationFields, type ChinaPayMethod, type ChinaPayOrder, type CreateChinaPayOrderInput, WECHAT_NOTIFY_FAIL, WECHAT_NOTIFY_OK, type WechatNotificationHeaders, type WechatPayConfig, type WechatPaymentResource, createAlipayPrecreateOrder, createChinaPayOrder, createWechatNativeOrder, ensurePem, getAlipayConfig, getWechatPayConfig, initAlipay, initWechatPay, queryAlipayOrder, queryChinaPayOrder, queryWechatOrder, resetChinaPayConfig, resetWechatPlatformCertCache, seedWechatPlatformCertCache, verifyAlipayNotification, verifyAndDecryptWechatNotification };
