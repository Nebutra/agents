import Stripe from 'stripe';
export { default as Stripe } from 'stripe';

interface StripeConfig {
    secretKey: string;
    webhookSecret?: string;
}
/**
 * Initialize the Stripe client
 */
declare function initStripe(config: StripeConfig): Stripe;
/**
 * Get the Stripe client instance
 */
declare function getStripe(): Stripe;
/**
 * Get the webhook secret
 */
declare function getWebhookSecret(): string;

interface CreateCustomerInput {
    organizationId: string;
    email: string;
    name?: string;
    metadata?: Record<string, string>;
}
interface UpdateCustomerInput {
    customerId: string;
    email?: string;
    name?: string;
    metadata?: Record<string, string>;
}
/**
 * Create a Stripe customer
 */
declare function createCustomer(input: CreateCustomerInput): Promise<Stripe.Customer>;
/**
 * Get a Stripe customer by ID
 */
declare function getCustomer(customerId: string): Promise<Stripe.Customer | null>;
/**
 * Update a Stripe customer
 */
declare function updateCustomer(input: UpdateCustomerInput): Promise<Stripe.Customer>;
/**
 * Delete a Stripe customer
 */
declare function deleteCustomer(customerId: string): Promise<Stripe.DeletedCustomer>;
/**
 * Get or create a Stripe customer for an organization
 */
declare function getOrCreateCustomer(organizationId: string, email: string, name?: string): Promise<Stripe.Customer>;
/**
 * Create a billing portal session for a customer
 */
declare function createBillingPortalSession(customerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session>;
/**
 * Create a checkout session for a customer
 */
declare function createCheckoutSession(options: {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    mode?: "subscription" | "payment" | "setup";
    trialPeriodDays?: number;
    quantity?: number;
    metadata?: Record<string, string>;
}): Promise<Stripe.Checkout.Session>;

/**
 * Stripe Test Clock helpers.
 *
 * Live calls only run against `sk_test_` keys. Production secrets must never
 * create or advance clocks.
 */
declare const STRIPE_TEST_CLOCK_IN_FLIGHT_MS = 30000;
interface StripeTestClock {
    id: string;
    frozenTime: number;
    name?: string;
}
interface StripeTestClockApi {
    create(params: {
        frozen_time: number;
        name?: string;
    }): Promise<{
        id: string;
        frozen_time: number;
        name?: string | null;
    }>;
    advance(id: string, params: {
        frozen_time: number;
    }): Promise<{
        id: string;
        frozen_time: number;
    }>;
}
interface ClockWebhookInboxState {
    processedAt: Date | null;
    errorMessage: string | null;
    createdAt: Date;
}
declare function isStripeTestModeSecret(secret: string | undefined): secret is `sk_test_${string}`;
declare function requireStripeTestClockSecret(secret?: string | undefined): string;
declare function clockAdvanceCrossesPeriodEnd(previousFrozenTime: number, nextFrozenTime: number, subscriptionPeriodEnd: number): boolean;
declare function invoiceEventsAfterClockAdvance(input: {
    previousFrozenTime: number;
    nextFrozenTime: number;
    subscriptionPeriodEnd: number;
}): readonly string[];
/**
 * Inbox recovery after a clock-driven webhook crashes mid-handler.
 * Unique `(provider, eventId)` means received, not processed.
 */
declare function decideClockWebhookReplay(event: ClockWebhookInboxState, now?: Date, inFlightMs?: number): "process" | "skip_processed" | "in_flight";
declare function createStripeTestClock(clocks: StripeTestClockApi, input: {
    frozenTime: number;
    name?: string;
}): Promise<StripeTestClock>;
declare function advanceStripeTestClock(clocks: StripeTestClockApi, clockId: string, frozenTime: number): Promise<StripeTestClock>;

export { type ClockWebhookInboxState, type CreateCustomerInput, STRIPE_TEST_CLOCK_IN_FLIGHT_MS, type StripeConfig, type StripeTestClock, type StripeTestClockApi, type UpdateCustomerInput, advanceStripeTestClock, clockAdvanceCrossesPeriodEnd, createBillingPortalSession, createCheckoutSession, createCustomer, createStripeTestClock, decideClockWebhookReplay, deleteCustomer, getCustomer, getOrCreateCustomer, getStripe, getWebhookSecret, initStripe, invoiceEventsAfterClockAdvance, isStripeTestModeSecret, requireStripeTestClockSecret, updateCustomer };
