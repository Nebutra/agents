import { C as CheckoutProvider, P as PaymentSessionInput, a as PaymentSession } from '../stripe-DcMk-jws.js';
export { B as BillingProviderReadiness, b as BillingProviderReadinessInput, c as BillingProviderReadinessStatus, d as CREDIT_PURCHASE_METADATA_TYPE, e as CheckoutConfig, f as CheckoutProviderType, g as CreditPurchaseMetadata, h as CreditPurchaseWebhookInput, i as CreditPurchaseWebhookResult, j as PAYMENT_ORDER_METADATA_KEY, k as PaymentSessionInputSchema, S as StripeCheckoutProvider, l as detectProvider, m as getCheckout, n as handleCreditPurchaseWebhook, o as isChinaPayConfigured, r as refundStripeCheckoutSession, p as resolveBillingProviderReadiness } from '../stripe-DcMk-jws.js';
import 'zod';

/**
 * ChinaPayCheckoutProvider — official WeChat Pay APIv3 or Alipay, no
 * aggregator. The order id is the merchant order number (out_trade_no), so a
 * notification or a status query finds the order with no metadata at all.
 * `kind` says what to do with the url: render a QR code on a desktop, or
 * redirect into the wallet on a phone (see chinapay/payments.ts).
 */
declare class ChinaPayCheckoutProvider implements CheckoutProvider {
    readonly name: "chinapay";
    createPaymentSession(input: PaymentSessionInput): Promise<PaymentSession>;
}

/**
 * CreemCheckoutProvider — card payments worldwide through Creem, the merchant
 * of record (ADR 2026-09-26). The order id travels as `request_id` and in
 * metadata; the price is the order's, passed as `custom_price` on the one
 * configured product. Creem adds tax on top and remits it.
 */
declare class CreemCheckoutProvider implements CheckoutProvider {
    readonly name: "creem";
    createPaymentSession(input: PaymentSessionInput): Promise<PaymentSession>;
}

/**
 * ManualCheckoutProvider — no money moves. Development and admin flows only:
 * it returns the success URL, and the order stays PENDING until someone
 * settles it by hand.
 */
declare class ManualCheckoutProvider implements CheckoutProvider {
    readonly name: "manual";
    createPaymentSession(input: PaymentSessionInput): Promise<PaymentSession>;
}

export { CheckoutProvider, ChinaPayCheckoutProvider, CreemCheckoutProvider, ManualCheckoutProvider, PaymentSession, PaymentSessionInput };
