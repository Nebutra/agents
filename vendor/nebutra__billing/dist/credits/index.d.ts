import { e as CreditTransactionType, i as Plan } from '../types-DvfRZWG_.js';
import 'zod';

interface CreditBalance {
    organizationId: string;
    balance: number;
    currency: string;
}
interface CreditTransaction {
    id: string;
    organizationId: string;
    type: CreditTransactionType;
    amount: number;
    balanceAfter: number;
    description?: string;
    expiresAt?: Date;
    relatedId?: string;
    metadata?: Record<string, unknown>;
    createdAt: Date;
}
interface CreditAllowance {
    plan: Plan;
    includedMonthly: number;
    dailyRefresh: number;
    refreshTime: string;
}
interface AddCreditsInput {
    organizationId: string;
    amount: number;
    type: CreditTransactionType;
    description?: string;
    expiresAt?: Date;
    relatedId?: string;
    metadata?: Record<string, unknown>;
}
interface DeductCreditsInput {
    organizationId: string;
    amount: number;
    description?: string;
    relatedId?: string;
    metadata?: Record<string, unknown>;
}
/**
 * Get credit balance for an organization
 */
declare function getCreditBalance(organizationId: string): Promise<CreditBalance>;
/**
 * Add credits to an organization's balance
 */
declare function addCredits(input: AddCreditsInput): Promise<CreditTransaction>;
/**
 * Deduct credits from an organization's balance
 */
declare function deductCredits(input: DeductCreditsInput): Promise<CreditTransaction>;
/**
 * Check if organization has enough credits
 */
declare function hasEnoughCredits(organizationId: string, amount: number): Promise<boolean>;
/**
 * Get credit transaction history
 */
declare function getCreditTransactions(organizationId: string, options?: {
    limit?: number;
    offset?: number;
    type?: CreditTransactionType;
}): Promise<CreditTransaction[]>;
/**
 * Convert dollar amount to credits
 * 1 credit = $0.01 (100 credits = $1)
 */
declare function dollarsToCredits(dollars: number): number;
/**
 * Convert credits to dollars
 */
declare function creditsToDollars(credits: number): number;
/**
 * Return plan-scoped included credits for app display and allowance policies.
 *
 * `-1` means unlimited. These defaults are deliberately centralized in the
 * billing package so dashboard UI, API routes, and future scheduled refresh
 * jobs do not drift.
 */
declare function getCreditAllowanceForPlan(plan: Plan | string | null | undefined): CreditAllowance;
/**
 * Format credits for display as a localized currency string.
 *
 * Credits are converted to major units (1 credit = $0.01), then formatted via
 * Intl.NumberFormat. For USD amounts under 1000 the output matches the previous
 * `$X.XX` form exactly; amounts >= 1000 gain a locale thousands separator
 * (e.g. "$1,000.00"). Non-USD currencies render with the correct symbol/format.
 *
 * @param credits Integer credit balance (1 credit = $0.01)
 * @param currency ISO 4217 currency code (default "USD")
 * @param locale BCP 47 locale tag (default "en-US")
 */
declare function formatCredits(credits: number, currency?: string, locale?: string): string;
/**
 * Refund credits to an organization
 */
declare function refundCredits(input: {
    organizationId: string;
    amount: number;
    reason?: string;
    relatedId?: string;
}): Promise<CreditTransaction>;
/**
 * Add bonus credits
 */
declare function addBonusCredits(input: {
    organizationId: string;
    amount: number;
    reason?: string;
    expiresAt?: Date;
}): Promise<CreditTransaction>;

export { type AddCreditsInput, type CreditAllowance, type CreditBalance, type CreditTransaction, type DeductCreditsInput, addBonusCredits, addCredits, creditsToDollars, deductCredits, dollarsToCredits, formatCredits, getCreditAllowanceForPlan, getCreditBalance, getCreditTransactions, hasEnoughCredits, refundCredits };
