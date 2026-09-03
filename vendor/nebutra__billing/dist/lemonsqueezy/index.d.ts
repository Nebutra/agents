import { Subscription, Checkout } from '@lemonsqueezy/lemonsqueezy.js';

interface LemonSqueezyConfig {
    apiKey: string;
    storeId: string;
    onError?: (error: Error) => void;
}
/**
 * Initialize the LemonSqueezy SDK
 */
declare function initLemonSqueezy(config: LemonSqueezyConfig): void;
/**
 * Get the LemonSqueezy store configuration.
 * Auto-initializes from environment variables if not already initialized.
 */
declare function getLemonSqueezyConfig(): {
    storeId: string;
};

interface CreateLemonCheckoutOptions {
    variantId: string | number;
    email?: string;
    name?: string;
    customData?: Record<string, unknown>;
    redirectUrl?: string;
    discountCode?: string;
    testMode?: boolean;
}
/**
 * Create a LemonSqueezy checkout URL
 */
declare function createLemonCheckout(options: CreateLemonCheckoutOptions): Promise<{
    checkoutUrl: string;
    checkout: Checkout;
}>;
/**
 * Retrieve a LemonSqueezy subscription by ID
 */
declare function getLemonSubscription(subscriptionId: string | number): Promise<Subscription>;
/**
 * Cancel a LemonSqueezy subscription
 */
declare function cancelLemonSubscription(subscriptionId: string | number): Promise<Subscription>;
/**
 * Get the customer portal URL for a LemonSqueezy customer.
 * The URL is valid for 24 hours from the time of the request.
 */
declare function getLemonCustomerPortalUrl(customerId: string | number): Promise<string>;

export { type CreateLemonCheckoutOptions, type LemonSqueezyConfig, cancelLemonSubscription, createLemonCheckout, getLemonCustomerPortalUrl, getLemonSqueezyConfig, getLemonSubscription, initLemonSqueezy };
