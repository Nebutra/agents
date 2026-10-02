import { B as BillingTenantDb } from '../db-f_I8E4zB.js';
import { e as CreditTransactionType, P as Plan } from '../types-vCj6xfOi.js';
import 'zod';

/**
 * Which product a balance belongs to, e.g. "router", "kuanlan", "para".
 * Balances never cross products (ADR 2026-09-27 product wallets), so every
 * read and write names one.
 */
type WalletProduct = string;
declare function assertWalletProduct(product: string): WalletProduct;
interface CreditBalance {
    organizationId: string;
    product: WalletProduct;
    balance: number;
    currency: string;
}
interface CreditTransaction {
    id: string;
    organizationId: string;
    product: WalletProduct;
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
/**
 * Where a grant came from, which decides when it expires (ADR 2026-09-27):
 * a membership's periodic credits die at the period's end, a purchased pack
 * lasts two years, a promotion whatever it was granted with.
 */
type CreditLotSource = "SUBSCRIPTION" | "PURCHASE" | "PROMO";
interface CreditLotInput {
    source: CreditLotSource;
    expiresAt: Date;
}
interface AddCreditsInput {
    organizationId: string;
    product: WalletProduct;
    /**
     * An expiring grant. Omit for credits that never expire (a money balance,
     * a legacy grant): whatever the lots do not cover is spent last.
     */
    lot?: CreditLotInput;
    amount: number;
    type: CreditTransactionType;
    description?: string;
    expiresAt?: Date;
    relatedId?: string;
    metadata?: Record<string, unknown>;
}
interface DeductCreditsInput {
    organizationId: string;
    product: WalletProduct;
    amount: number;
    description?: string;
    relatedId?: string;
    metadata?: Record<string, unknown>;
}
declare function invalidateCreditCache(organizationId: string, product: WalletProduct): void;
/**
 * Get credit balance for an organization.
 *
 * Reads through a 60s per-process cache. **Never use this on an admit/guard
 * path.** `balanceCache` is a module-level Map, so a second instance can serve
 * a stale positive balance while the first has already spent it — that is an
 * overdraw. Guards must call {@link getCreditBalanceFresh}.
 */
declare function getCreditBalance(organizationId: string, product: WalletProduct): Promise<CreditBalance>;
/**
 * Get credit balance straight from the database, bypassing `balanceCache`.
 *
 * This is the read a spend guard must use. It drops the cache entry first so a
 * concurrent reader on this instance cannot keep serving the stale value, then
 * repopulates it from the row it just read.
 */
declare function getCreditBalanceFresh(organizationId: string, product: WalletProduct): Promise<CreditBalance>;
/**
 * Check a balance against the database, not the cache. Use this, not
 * {@link hasEnoughCredits}, before admitting a request that will spend money.
 */
declare function hasEnoughCreditsFresh(organizationId: string, product: WalletProduct, amount: number): Promise<boolean>;
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
declare function hasEnoughCredits(organizationId: string, product: WalletProduct, amount: number): Promise<boolean>;
/**
 * Get credit transaction history
 */
declare function getCreditTransactions(organizationId: string, product: WalletProduct, options?: {
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
    product: WalletProduct;
    amount: number;
    reason?: string;
    relatedId?: string;
}): Promise<CreditTransaction>;
/**
 * Add bonus credits
 */
declare function addBonusCredits(input: {
    organizationId: string;
    product: WalletProduct;
    amount: number;
    reason?: string;
    expiresAt?: Date;
}): Promise<CreditTransaction>;

interface ExpiringCredits {
    source: CreditLotSource;
    remaining: number;
    expiresAt: Date;
}
/** The expiring part of one product's balance, soonest first. For "3,200 expire on …". */
declare function getExpiringCredits(organizationId: string, product: WalletProduct): Promise<ExpiringCredits[]>;
interface ExpireResult {
    expired: number;
    errors: number;
}
/**
 * Take back what expired lots still hold. `systemDb` lists due lots across
 * every tenant; each is then settled on that tenant's own client, inside one
 * transaction that locks the balance row first — the same order a spend takes
 * its locks in, so the two cannot deadlock. Never takes more than the balance
 * holds: a product whose spend path does not draw on lots (Router's holds)
 * can leave a lot looking fuller than it is.
 */
declare function expireCreditLots(systemDb: BillingTenantDb, options?: {
    now?: Date;
    limit?: number;
}): Promise<ExpireResult>;

export { type AddCreditsInput, type CreditAllowance, type CreditBalance, type CreditLotInput, type CreditLotSource, type CreditTransaction, type DeductCreditsInput, type ExpiringCredits, type WalletProduct, addBonusCredits, addCredits, assertWalletProduct, creditsToDollars, deductCredits, dollarsToCredits, expireCreditLots, formatCredits, getCreditAllowanceForPlan, getCreditBalance, getCreditBalanceFresh, getCreditTransactions, getExpiringCredits, hasEnoughCredits, hasEnoughCreditsFresh, invalidateCreditCache, refundCredits };
