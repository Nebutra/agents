import { d as CheckoutProvider, f as CreditPurchaseInput, i as CreditPurchaseSession } from '../readiness-C11Wv_NK.js';
export { B as BillingProviderReadiness, a as BillingProviderReadinessInput, b as BillingProviderReadinessStatus, C as CREDIT_PURCHASE_METADATA_TYPE, c as CheckoutConfig, e as CheckoutProviderType, g as CreditPurchaseInputSchema, h as CreditPurchaseMetadata, j as CreditPurchaseWebhookInput, k as CreditPurchaseWebhookResult, l as detectProvider, m as getCheckout, n as handleCreditPurchaseWebhook, r as resolveBillingProviderReadiness } from '../readiness-C11Wv_NK.js';
import 'zod';

/**
 * ChinaPayCheckoutProvider — official WeChat Pay APIv3 or Alipay, no
 * aggregator. Returns a `payUrl` meant to be rendered as a QR code on the
 * checkout page (see chinapay/payments.ts).
 */
declare class ChinaPayCheckoutProvider implements CheckoutProvider {
    readonly name: "chinapay";
    createCreditPurchase(input: CreditPurchaseInput): Promise<CreditPurchaseSession>;
}

/**
 * LemonCheckoutProvider — wraps `createLemonCheckout`.
 *
 * LemonSqueezy requires a pre-existing variant id; the caller passes it via
 * `input.priceId`. Custom data is embedded so the webhook handler can identify
 * credit-purchase payments.
 */
declare class LemonCheckoutProvider implements CheckoutProvider {
    readonly name: "lemonsqueezy";
    createCreditPurchase(input: CreditPurchaseInput): Promise<CreditPurchaseSession>;
}

/**
 * ManualCheckoutProvider — no payment is taken.
 *
 * Useful for dev/test flows and admin-driven credit grants where the real
 * payment happens out-of-band (wire transfer, invoice, manual Stripe dashboard
 * charge, etc.). The returned URL redirects straight to the successUrl with a
 * synthetic session id so the UI can track the handoff.
 */
declare class ManualCheckoutProvider implements CheckoutProvider {
    readonly name: "manual";
    createCreditPurchase(input: CreditPurchaseInput): Promise<CreditPurchaseSession>;
}

/**
 * PolarCheckoutProvider — wraps `createPolarCheckout`.
 *
 * Polar requires a pre-existing product id; it doesn't support fully dynamic
 * line items the way Stripe does. The caller supplies the product id via
 * `input.priceId`.
 */
declare class PolarCheckoutProvider implements CheckoutProvider {
    readonly name: "polar";
    createCreditPurchase(input: CreditPurchaseInput): Promise<CreditPurchaseSession>;
}

/**
 * StripeCheckoutProvider — bridges the generic checkout API to Stripe Checkout.
 *
 * Credit packs are typically variable-priced, so this provider uses dynamic
 * `price_data` line_items rather than requiring a pre-created Stripe Price.
 * If `customerId` is missing but `customerEmail` is present, it auto-creates
 * (or looks up) a customer via `getOrCreateCustomer`.
 */
declare class StripeCheckoutProvider implements CheckoutProvider {
    readonly name: "stripe";
    createCreditPurchase(input: CreditPurchaseInput): Promise<CreditPurchaseSession>;
}

export { CheckoutProvider, ChinaPayCheckoutProvider, CreditPurchaseInput, CreditPurchaseSession, LemonCheckoutProvider, ManualCheckoutProvider, PolarCheckoutProvider, StripeCheckoutProvider };
