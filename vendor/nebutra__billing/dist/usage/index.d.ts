import { UsageLedgerSourceContract, UsageTypeContract, UsageLedgerEntryInput } from '@nebutra/contracts';
import { B as BillingTenantDb } from '../db-f_I8E4zB.js';
export { G as GetUsageOptions, U as UsageCheckResult, h as UsageRecord, i as UsageSummary, c as calculateOverageCost, a as checkUsageLimit, f as flushUsageBuffer, b as formatUsage, g as getCurrentPeriod, d as getPlanUsageLimit, e as getUsage, r as recordUsage } from '../service-YoauCwIM.js';
import '@nebutra/metering';
import '../types-DvfRZWG_.js';
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
