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
interface CreateAlipayWapOrderInput extends CreateAlipayOrderInput {
    /** Where Alipay sends the browser after paying. */
    returnUrl?: string;
    /** Where the "back" link on Alipay's page goes if the buyer abandons. */
    quitUrl?: string;
}
declare function buildAlipayWapPayUrl(input: CreateAlipayWapOrderInput): {
    payUrl: string;
};
declare function queryAlipayOrder(outTradeNo: string): Promise<{
    status: "paid" | "pending" | "failed";
    totalAmount: string;
    tradeNo?: string;
}>;
interface RefundAlipayOrderInput {
    outTradeNo: string;
    outRequestNo: string;
    /** CNY yuan, e.g. "9.90". */
    refundAmount: string;
    reason?: string;
}
declare function refundAlipayOrder(input: RefundAlipayOrderInput): Promise<{
    status: "succeeded" | "failed";
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
    app_id?: string;
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
/** `qr` for a desktop buyer to scan; `h5` to open the wallet on the buyer's own phone. */
type ChinaPayChannel = "qr" | "h5";
interface CreateChinaPayOrderInput {
    /** Unique order ID from your system. */
    tradeOrderId: string;
    /** Amount in CNY (yuan), e.g., "9.90". */
    totalFee: string;
    /** Payment method. */
    method: ChinaPayMethod;
    channel?: ChinaPayChannel;
    /** Order title/description. */
    title: string;
    /** Opaque metadata carried through to the payment notification. */
    attach?: string;
    /** H5 only: where the browser returns after paying. */
    returnUrl?: string;
    /** H5 only: where the browser goes if the buyer abandons (Alipay). */
    quitUrl?: string;
    /** H5 only: the buyer's IP — WeChat Pay H5 requires it. */
    clientIp?: string;
}
interface ChinaPayOrder {
    /** `qr`: render `payUrl` as a QR code. `redirect`: send the browser to it. */
    kind: "qr" | "redirect";
    payUrl: string;
    tradeOrderId: string;
}
/**
 * Create a payment order directly with the official gateway — no aggregator
 * in the path. Desktop: WeChat Native / Alipay `trade.precreate`, both a QR.
 * Phone: WeChat H5 / Alipay `trade.wap.pay`, both a redirect into the wallet.
 */
declare function createChinaPayOrder(input: CreateChinaPayOrderInput): Promise<ChinaPayOrder>;
/** Poll order status from the gateway (reconciliation / admin use). */
declare function queryChinaPayOrder(tradeOrderId: string, method: ChinaPayMethod): Promise<{
    status: "paid" | "pending" | "failed";
    paidFen: number;
    providerRef?: string;
}>;
interface RefundChinaPayOrderInput {
    tradeOrderId: string;
    /** Idempotency key: the same refundId never pays out twice. */
    refundId: string;
    method: ChinaPayMethod;
    /** CNY yuan to refund, e.g. "9.90". */
    refundFee: string;
    /** CNY yuan originally paid — WeChat Pay requires it. */
    totalFee: string;
    reason?: string;
}
/**
 * Refund all or part of a paid order. This moves money only; reversing the
 * credits the purchase granted is the caller's decision.
 */
declare function refundChinaPayOrder(input: RefundChinaPayOrderInput): Promise<{
    status: "succeeded" | "processing" | "failed";
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
interface CreateWechatH5OrderInput extends CreateWechatNativeOrderInput {
    /** The buyer's IP. WeChat Pay H5 rejects an order without one. */
    clientIp: string;
    /** Where the browser lands after paying (or abandoning). */
    redirectUrl?: string;
}
declare function createWechatH5Order(input: CreateWechatH5OrderInput): Promise<{
    h5Url: string;
}>;
declare function queryWechatOrder(outTradeNo: string): Promise<{
    status: "paid" | "pending" | "failed";
    amountFen: number;
    transactionId?: string;
}>;
interface RefundWechatOrderInput {
    outTradeNo: string;
    outRefundNo: string;
    refundFen: number;
    totalFen: number;
    reason?: string;
}
declare function refundWechatOrder(input: RefundWechatOrderInput): Promise<{
    status: "succeeded" | "processing" | "failed";
    refundId: string;
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

export { ALIPAY_NOTIFY_SUCCESS_BODIES, type AlipayConfig, type AlipayNotificationFields, type ChinaPayChannel, type ChinaPayMethod, type ChinaPayOrder, type CreateChinaPayOrderInput, type RefundChinaPayOrderInput, WECHAT_NOTIFY_FAIL, WECHAT_NOTIFY_OK, type WechatNotificationHeaders, type WechatPayConfig, type WechatPaymentResource, buildAlipayWapPayUrl, createAlipayPrecreateOrder, createChinaPayOrder, createWechatH5Order, createWechatNativeOrder, ensurePem, getAlipayConfig, getWechatPayConfig, initAlipay, initWechatPay, queryAlipayOrder, queryChinaPayOrder, queryWechatOrder, refundAlipayOrder, refundChinaPayOrder, refundWechatOrder, resetChinaPayConfig, resetWechatPlatformCertCache, seedWechatPlatformCertCache, verifyAlipayNotification, verifyAndDecryptWechatNotification };
