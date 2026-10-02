import { UsageLedgerSourceContract, UsageTypeContract, UsageLedgerEntryInput } from '@nebutra/contracts';
import { B as BillingTenantDb } from '../db-f_I8E4zB.js';
export { G as GetUsageOptions, U as UsageCheckResult, a as UsageRecord, b as UsageSummary, c as calculateOverageCost, d as checkUsageLimit, f as flushUsageBuffer, e as formatUsage, g as getCurrentPeriod, h as getPlanUsageLimit, i as getUsage, r as recordUsage } from '../service-8L7gLgxL.js';
import '@nebutra/metering';
import '../types-vCj6xfOi.js';
import 'zod';

interface AppendUsageLedgerEntryResult {
    created: boolean;
    entryId: string;
}
interface ListUsageLedgerEntriesInput {
    organizationId: string;
    from?: Date;
    to?: Date;
    source?: UsageLedgerSourceContract;
    type?: UsageTypeContract;
    take?: number;
}
declare function buildUsageLedgerIdempotencyKey(input: {
    organizationId: string;
    eventId?: string;
    type: UsageTypeContract;
    resource?: string;
    occurredAt: Date;
}): string;
declare function appendUsageLedgerEntry(input: UsageLedgerEntryInput, options?: {
    client?: BillingTenantDb;
}): Promise<AppendUsageLedgerEntryResult>;
declare function listUsageLedgerEntries(input: ListUsageLedgerEntriesInput, options?: {
    client?: BillingTenantDb;
}): Promise<any>;

export { type AppendUsageLedgerEntryResult, type ListUsageLedgerEntriesInput, appendUsageLedgerEntry, buildUsageLedgerIdempotencyKey, listUsageLedgerEntries };
