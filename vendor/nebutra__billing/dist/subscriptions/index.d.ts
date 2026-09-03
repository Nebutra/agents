import Stripe from 'stripe';
import { o as SubscriptionStatus } from '../types-DvfRZWG_.js';
import 'zod';

interface SubscriptionDetails {
    id: string;
    stripeId: string;
    organizationId: string;
    status: SubscriptionStatus;
    planId: string;
    planName: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    trialEnd: Date | null;
}
interface CreateStripeSubscriptionInput {
    customerId: string;
    priceId: string;
    organizationId: string;
    trialDays?: number;
    metadata?: Record<string, string>;
}
/**
 * Create a subscription in Stripe
 */
declare function createStripeSubscription(input: CreateStripeSubscriptionInput): Promise<Stripe.Subscription>;
/**
 * Get a subscription from Stripe
 */
declare function getStripeSubscription(subscriptionId: string): Promise<Stripe.Subscription | null>;
/**
 * Update a subscription in Stripe
 */
declare function updateStripeSubscription(subscriptionId: string, updates: {
    priceId?: string;
    cancelAtPeriodEnd?: boolean;
    metadata?: Record<string, string>;
}): Promise<Stripe.Subscription>;
/**
 * Cancel a subscription in Stripe
 */
declare function cancelStripeSubscription(subscriptionId: string, immediately?: boolean): Promise<Stripe.Subscription>;
/**
 * Resume a canceled subscription
 */
declare function resumeStripeSubscription(subscriptionId: string): Promise<Stripe.Subscription>;
/**
 * Pause a subscription
 */
declare function pauseStripeSubscription(subscriptionId: string): Promise<Stripe.Subscription>;
/**
 * Resume a paused subscription
 */
declare function unpauseStripeSubscription(subscriptionId: string): Promise<Stripe.Subscription>;
/**
 * Get all subscriptions for a customer
 */
declare function getCustomerSubscriptions(customerId: string): Promise<Stripe.Subscription[]>;
declare function mapStripeStatusToLocal(stripeStatus: Stripe.Subscription.Status): SubscriptionStatus;
/**
 * Preview upcoming invoice for a subscription change
 */
declare function previewSubscriptionChange(subscriptionId: string, newPriceId: string): Promise<Stripe.UpcomingInvoice>;

export { type CreateStripeSubscriptionInput, type SubscriptionDetails, cancelStripeSubscription, createStripeSubscription, getCustomerSubscriptions, getStripeSubscription, mapStripeStatusToLocal, pauseStripeSubscription, previewSubscriptionChange, resumeStripeSubscription, unpauseStripeSubscription, updateStripeSubscription };
