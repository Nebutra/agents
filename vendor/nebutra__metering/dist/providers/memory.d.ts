import type { MeterDefinition, MeteringProvider, PeriodType, ThresholdAlert, UsageEvent, UsageQuota, UsageSummary } from "../types";
export declare class MemoryProvider implements MeteringProvider {
    readonly name: "memory";
    private meters;
    private events;
    private quotas;
    constructor();
    defineMeter(definition: MeterDefinition): Promise<void>;
    ingest(event: UsageEvent): Promise<void>;
    ingestBatch(events: UsageEvent[]): Promise<void>;
    private getPeriodRange;
    private aggregateEvents;
    getUsage(tenantId: string, meterId: string, period: PeriodType): Promise<UsageSummary | null>;
    getUsageHistory(tenantId: string, meterId: string, opts: {
        period: PeriodType;
        startDate: string;
        endDate: string;
    }): Promise<UsageSummary[]>;
    private getQuotaKey;
    setQuota(tenantId: string, meterId: string, limit: number, period: PeriodType): Promise<void>;
    getQuota(tenantId: string, meterId: string, period: PeriodType): Promise<UsageQuota | null>;
    getBreakdown(tenantId: string, meterId: string, dimension: string, period: PeriodType): Promise<Record<string, number>>;
    checkThreshold(tenantId: string, meterId: string, threshold: number, period: PeriodType): Promise<ThresholdAlert | null>;
    close(): Promise<void>;
}
//# sourceMappingURL=memory.d.ts.map