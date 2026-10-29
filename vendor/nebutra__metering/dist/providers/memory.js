import { logger } from "@nebutra/logger";
import { UsageEventSchema } from "../types";
export class MemoryProvider {
    name = "memory";
    meters = new Map();
    events = [];
    quotas = new Map();
    constructor() {
        logger.info("[metering:memory] Provider initialised (dev/test only)");
    }
    // ── Meter Definition ────────────────────────────────────────────────────
    async defineMeter(definition) {
        this.meters.set(definition.id, definition);
        logger.debug("[metering:memory] Meter defined", { id: definition.id });
    }
    // ── Ingest ──────────────────────────────────────────────────────────────
    async ingest(event) {
        const validated = UsageEventSchema.parse(event);
        const id = validated.id ?? crypto.randomUUID();
        const timestamp = validated.timestamp ?? new Date().toISOString();
        const stored = {
            ...validated,
            id,
            timestamp,
        };
        this.events.push(stored);
        logger.debug("[metering:memory] Event ingested", {
            id,
            meterId: event.meterId,
            tenantId: event.tenantId,
        });
    }
    async ingestBatch(events) {
        for (const event of events) {
            await this.ingest(event);
        }
    }
    // ── Usage Aggregation ───────────────────────────────────────────────────
    getPeriodRange(period, referenceDate = new Date()) {
        const date = new Date(referenceDate);
        switch (period) {
            case "hourly": {
                const start = new Date(date);
                start.setMinutes(0, 0, 0);
                const end = new Date(start);
                end.setHours(end.getHours() + 1);
                return { start: start.toISOString(), end: end.toISOString() };
            }
            case "daily": {
                const start = new Date(date);
                start.setHours(0, 0, 0, 0);
                const end = new Date(start);
                end.setDate(end.getDate() + 1);
                return { start: start.toISOString(), end: end.toISOString() };
            }
            case "monthly": {
                const start = new Date(date.getFullYear(), date.getMonth(), 1);
                const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
                return { start: start.toISOString(), end: end.toISOString() };
            }
        }
    }
    aggregateEvents(events, aggregation) {
        if (events.length === 0)
            return 0;
        switch (aggregation) {
            case "sum":
                return events.reduce((sum, e) => sum + (e.value ?? 0), 0);
            case "max": {
                const values = events.map((e) => e.value ?? 0);
                return values.length > 0 ? Math.max(...values) : 0;
            }
            case "count":
                return events.length;
            case "count_distinct": {
                const uniqueIds = new Set(events.map((e) => e.id));
                return uniqueIds.size;
            }
        }
    }
    // ── Query Usage ─────────────────────────────────────────────────────────
    async getUsage(tenantId, meterId, period) {
        const meter = this.meters.get(meterId);
        if (!meter)
            return null;
        const { start, end } = this.getPeriodRange(period);
        const relevant = this.events.filter((e) => e.tenantId === tenantId &&
            e.meterId === meterId &&
            e.timestamp >= start &&
            e.timestamp < end);
        const value = this.aggregateEvents(relevant, meter.aggregation);
        // Build breakdown by first property dimension if available
        const breakdown = {};
        const firstEvent = relevant[0];
        if (relevant.length > 0 && firstEvent?.properties) {
            const firstProp = Object.keys(firstEvent.properties)[0];
            if (firstProp) {
                const byDimension = new Map();
                for (const event of relevant) {
                    const dimValue = String(event.properties?.[firstProp]);
                    if (!byDimension.has(dimValue)) {
                        byDimension.set(dimValue, []);
                    }
                    byDimension.get(dimValue)?.push(event);
                }
                for (const [dim, events] of byDimension) {
                    breakdown[dim] = this.aggregateEvents(events, meter.aggregation);
                }
            }
        }
        const result = {
            meterId,
            tenantId,
            periodStart: start,
            periodEnd: end,
            value,
        };
        if (Object.keys(breakdown).length > 0) {
            result.breakdown = breakdown;
        }
        return result;
    }
    async getUsageHistory(tenantId, meterId, opts) {
        const meter = this.meters.get(meterId);
        if (!meter)
            return [];
        const results = [];
        const start = new Date(opts.startDate);
        const end = new Date(opts.endDate);
        for (let current = new Date(start); current < end;) {
            const summary = await this.getUsage(tenantId, meterId, opts.period);
            if (summary) {
                results.push(summary);
            }
            if (opts.period === "hourly") {
                current.setHours(current.getHours() + 1);
            }
            else if (opts.period === "daily") {
                current.setDate(current.getDate() + 1);
            }
            else {
                current.setMonth(current.getMonth() + 1);
            }
        }
        return results;
    }
    // ── Quota Management ────────────────────────────────────────────────────
    getQuotaKey(tenantId, meterId, period) {
        return `${tenantId}:${meterId}:${period}`;
    }
    async setQuota(tenantId, meterId, limit, period) {
        const key = this.getQuotaKey(tenantId, meterId, period);
        this.quotas.set(key, { tenantId, meterId, limit, period });
        logger.debug("[metering:memory] Quota set", {
            tenantId,
            meterId,
            limit,
            period,
        });
    }
    async getQuota(tenantId, meterId, period) {
        const key = this.getQuotaKey(tenantId, meterId, period);
        const quota = this.quotas.get(key);
        if (!quota)
            return null;
        const summary = await this.getUsage(tenantId, meterId, period);
        if (!summary) {
            return {
                meterId,
                tenantId,
                limit: quota.limit,
                used: 0,
                remaining: quota.limit,
                percentage: 0,
                period,
                periodStart: "",
                periodEnd: "",
            };
        }
        const used = summary.value;
        const remaining = Math.max(0, quota.limit - used);
        const percentage = (used / quota.limit) * 100;
        return {
            meterId,
            tenantId,
            limit: quota.limit,
            used,
            remaining,
            percentage,
            period,
            periodStart: summary.periodStart,
            periodEnd: summary.periodEnd,
        };
    }
    // ── Breakdown ───────────────────────────────────────────────────────────
    async getBreakdown(tenantId, meterId, dimension, period) {
        const meter = this.meters.get(meterId);
        if (!meter)
            return {};
        const { start, end } = this.getPeriodRange(period);
        const relevant = this.events.filter((e) => e.tenantId === tenantId &&
            e.meterId === meterId &&
            e.timestamp >= start &&
            e.timestamp < end &&
            e.properties &&
            dimension in e.properties);
        const breakdown = {};
        for (const event of relevant) {
            const dimValue = String(event.properties?.[dimension]);
            if (!breakdown[dimValue]) {
                breakdown[dimValue] = 0;
            }
            breakdown[dimValue] += event.value;
        }
        return breakdown;
    }
    // ── Threshold Alerting ──────────────────────────────────────────────────
    async checkThreshold(tenantId, meterId, threshold, period) {
        const quota = await this.getQuota(tenantId, meterId, period);
        if (!quota)
            return null;
        const percentage = quota.percentage / 100;
        if (percentage < threshold)
            return null;
        return {
            meterId,
            tenantId,
            threshold,
            currentUsage: quota.used,
            limit: quota.limit,
            triggeredAt: new Date().toISOString(),
        };
    }
    // ── Shutdown ────────────────────────────────────────────────────────────
    async close() {
        logger.info("[metering:memory] Provider shut down");
    }
}
