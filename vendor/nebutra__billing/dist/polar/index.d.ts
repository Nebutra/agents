import { Polar } from '@polar-sh/sdk';
export { Polar } from '@polar-sh/sdk';
import * as _polar_sh_sdk_models_components_product_js from '@polar-sh/sdk/models/components/product.js';
import * as _polar_sh_sdk_models_components_subscription_js from '@polar-sh/sdk/models/components/subscription.js';
import * as _polar_sh_sdk_models_components_checkout_js from '@polar-sh/sdk/models/components/checkout.js';

interface PolarConfig {
    accessToken: string;
    server?: "production" | "sandbox";
}
/**
 * Initialize the Polar client
 */
declare function initPolar(config: PolarConfig): Polar;
/**
 * Get the Polar client instance
 */
declare function getPolar(): Polar;

interface CreatePolarCheckoutInput {
    productId: string;
    successUrl: string;
    customerEmail?: string;
    metadata?: Record<string, string>;
}
/**
 * Create a Polar checkout session
 */
declare function createPolarCheckout(options: CreatePolarCheckoutInput): Promise<_polar_sh_sdk_models_components_checkout_js.Checkout>;
/**
 * Get a Polar subscription by ID
 */
declare function getPolarSubscription(subscriptionId: string): Promise<_polar_sh_sdk_models_components_subscription_js.Subscription>;
/**
 * Cancel (revoke) a Polar subscription
 */
declare function cancelPolarSubscription(subscriptionId: string): Promise<_polar_sh_sdk_models_components_subscription_js.Subscription>;
/**
 * List available Polar products
 */
declare function listPolarProducts(): Promise<_polar_sh_sdk_models_components_product_js.Product[]>;

export { type CreatePolarCheckoutInput, type PolarConfig, cancelPolarSubscription, createPolarCheckout, getPolar, getPolarSubscription, initPolar, listPolarProducts };
