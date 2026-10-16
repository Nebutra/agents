import type { ClickHouseProviderConfig, MeterDefinition, MeteringProvider, PeriodType, ThresholdAlert, UsageEvent, UsageQuota, UsageSummary } from "../types";
/**
 * Production ClickHouse-backed `MeteringProvider`.
 *
 * The constructor never throws on missing creds — failures surface on first use,
 * matching the project pattern (`@nebutra/queue`, `@nebutra/search`).
 */
export declare class ClickHouseProvider implements MeteringProvider {
    readonly name: "clickhouse";
    private readonly config;
    private client;
    private queue;
    private flushTimer;
    private readonly flushQueue;
    private readonly meters;
    private bootstrapped;
    private closed;
    private readonly exitHandler;
    constructor(config?: Omit<ClickHouseProviderConfig, "provider">);
    private getClient;
    private ensureBootstrapped;
    defineMeter(definition: MeterDefinition): Promise<void>;
    ingest(event: UsageEvent): Promise<void>;
    ingestBatch(events: UsageEvent[]): Promise<void>;
    private enqueue;
    private scheduleFlush;
    /**
     * Flush the in-memory buffer. Flush tasks are serialized by p-queue so inserts
     * and close-time drains cannot race the underlying ClickHouse client.
     */
    flush(): Promise<void>;
    getUsage(tenantId: string, meterId: string, period: PeriodType): Promise<UsageSummary | null>;
    getUsageHistory(tenantId: string, meterId: string, opts: {
        period: PeriodType;
        startDate: string;
        endDate: string;
    }): Promise<UsageSummary[]>;
    setQuota(tenantId: string, meterId: string, limit: number, period: PeriodType): Promise<void>;
    getQuota(tenantId: string, meterId: string, period: PeriodType): Promise<UsageQuota | null>;
    getBreakdown(tenantId: string, meterId: string, dimension: string, period: PeriodType): Promise<Record<string, number>>;
    checkThreshold(tenantId: string, meterId: string, threshold: number, period: PeriodType): Promise<ThresholdAlert | null>;
    close(): Promise<void>;
    private queryAggregate;
}
//# sourceMappingURL=clickhouse.d.ts.map