import {
  isPrismaUniqueViolation,
  requireTenantDb
} from "./chunk-BR5IXYNU.js";
import {
  DEFAULT_USAGE_PRICING
} from "./chunk-44PNSGWM.js";

// src/usage/ledger.ts
import { createHash } from "crypto";
import {
  UsageLedgerEntryInputSchema
} from "@nebutra/contracts";
var DEFAULT_TAKE = 100;
var MAX_TAKE = 500;
function getClient(organizationId, client) {
  return client ?? requireTenantDb(organizationId);
}
function buildUsageLedgerIdempotencyKey(input) {
  const base = [
    input.organizationId,
    input.eventId ?? "manual",
    input.type,
    input.resource ?? "default",
    input.occurredAt.toISOString()
  ].join(":");
  return createHash("sha256").update(base).digest("hex");
}
async function appendUsageLedgerEntry(input, options = {}) {
  const payload = UsageLedgerEntryInputSchema.parse(input);
  const db = getClient(payload.organizationId, options.client);
  const metadata = payload.metadata;
  const existing = await db.usageLedgerEntry.findUnique({
    where: {
      tenantId_idempotencyKey: {
        tenantId: payload.organizationId,
        idempotencyKey: payload.idempotencyKey
      }
    },
    select: { id: true }
  });
  if (existing) {
    return { created: false, entryId: existing.id };
  }
  try {
    const created = await db.usageLedgerEntry.create({
      data: {
        tenantId: payload.organizationId,
        idempotencyKey: payload.idempotencyKey,
        source: payload.source,
        type: payload.type,
        quantity: BigInt(payload.quantity),
        unit: payload.unit,
        currency: payload.currency,
        occurredAt: payload.occurredAt,
        ingestVersion: payload.ingestVersion,
        metadata,
        ...payload.eventId ? { eventId: payload.eventId } : {},
        ...payload.subscriptionId ? { subscriptionId: payload.subscriptionId } : {},
        ...payload.userId ? { userId: payload.userId } : {},
        ...payload.resource ? { resource: payload.resource } : {},
        ...payload.unitCost !== void 0 ? { unitCost: payload.unitCost } : {},
        ...payload.totalCost !== void 0 ? { totalCost: payload.totalCost } : {}
      },
      select: { id: true }
    });
    return { created: true, entryId: created.id };
  } catch (error) {
    if (isPrismaUniqueViolation(error)) {
      const duplicate = await db.usageLedgerEntry.findUnique({
        where: {
          tenantId_idempotencyKey: {
            tenantId: payload.organizationId,
            idempotencyKey: payload.idempotencyKey
          }
        },
        select: { id: true }
      });
      if (duplicate) {
        return { created: false, entryId: duplicate.id };
      }
    }
    throw error;
  }
}
async function listUsageLedgerEntries(input, options = {}) {
  const db = getClient(input.organizationId, options.client);
  const take = Math.min(Math.max(input.take ?? DEFAULT_TAKE, 1), MAX_TAKE);
  return db.usageLedgerEntry.findMany({
    where: {
      tenantId: input.organizationId,
      ...input.source ? { source: input.source } : {},
      ...input.type ? { type: input.type } : {},
      ...input.from || input.to ? {
        occurredAt: {
          ...input.from ? { gte: input.from } : {},
          ...input.to ? { lte: input.to } : {}
        }
      } : {}
    },
    orderBy: { occurredAt: "desc" },
    take
  });
}

// src/usage/service.ts
import { logger } from "@nebutra/logger";
import {
  AI_TOKENS,
  API_CALLS,
  BANDWIDTH,
  COMPUTATION_TIME,
  getMetering,
  STORAGE_BYTES
} from "@nebutra/metering";
import { format } from "date-fns";
var usageBuffer = /* @__PURE__ */ new Map();
var BUFFER_FLUSH_INTERVAL = 5e3;
var BUFFER_MAX_SIZE = 100;
function recordUsage(input) {
  const record = {
    id: crypto.randomUUID(),
    organizationId: input.organizationId,
    userId: input.userId,
    type: input.type,
    quantity: BigInt(input.quantity),
    resource: input.resource,
    metadata: input.metadata,
    recordedAt: /* @__PURE__ */ new Date()
  };
  const pricing = DEFAULT_USAGE_PRICING.find((p) => p.type === input.type);
  if (pricing) {
    record.unitCost = pricing.pricePerUnit / pricing.unitSize;
    record.totalCost = Number(record.quantity) * record.unitCost;
  }
  ensureFlushTimer();
  const key = input.organizationId;
  const buffer = usageBuffer.get(key) || [];
  buffer.push(record);
  usageBuffer.set(key, buffer);
  if (buffer.length >= BUFFER_MAX_SIZE) {
    flushUsageBuffer(key);
  }
}
function usageTypeToMeterId(type) {
  switch (type) {
    case "API_CALL":
      return API_CALLS.id;
    case "AI_TOKEN":
      return AI_TOKENS.id;
    case "STORAGE":
      return STORAGE_BYTES.id;
    case "COMPUTE":
      return COMPUTATION_TIME.id;
    case "BANDWIDTH":
      return BANDWIDTH.id;
    case "CUSTOM":
    default:
      return API_CALLS.id;
  }
}
async function flushUsageBuffer(organizationId) {
  const flushed = [];
  if (organizationId) {
    const buffer = usageBuffer.get(organizationId) || [];
    flushed.push(...buffer);
    usageBuffer.delete(organizationId);
  } else {
    for (const [key, buffer] of usageBuffer) {
      flushed.push(...buffer);
      usageBuffer.delete(key);
    }
  }
  if (flushed.length === 0) {
    return flushed;
  }
  let metering = null;
  try {
    metering = await getMetering();
  } catch (err) {
    logger.warn("[billing:flushUsageBuffer] metering provider unavailable", { err });
  }
  let ledgerOk = 0;
  let meterOk = 0;
  let failed = 0;
  for (const record of flushed) {
    const quantity = Number(record.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      failed += 1;
      continue;
    }
    const idempotencyKey = buildUsageLedgerIdempotencyKey({
      organizationId: record.organizationId,
      eventId: record.id,
      type: record.type,
      resource: record.resource,
      occurredAt: record.recordedAt
    });
    try {
      await appendUsageLedgerEntry({
        organizationId: record.organizationId,
        idempotencyKey,
        eventId: record.id,
        ...record.userId ? { userId: record.userId } : {},
        source: "API",
        type: record.type,
        ...record.resource ? { resource: record.resource } : {},
        quantity,
        unit: "unit",
        ...record.unitCost !== void 0 ? { unitCost: record.unitCost } : {},
        ...record.totalCost !== void 0 ? { totalCost: record.totalCost } : {},
        currency: "USD",
        occurredAt: record.recordedAt,
        ingestVersion: "v1",
        metadata: {
          ...record.metadata ?? {},
          flushSource: "recordUsageBuffer"
        }
      });
      ledgerOk += 1;
    } catch (err) {
      failed += 1;
      logger.error("[billing:flushUsageBuffer] appendUsageLedgerEntry failed", {
        err,
        organizationId: record.organizationId,
        type: record.type,
        eventId: record.id
      });
    }
    if (metering) {
      try {
        await metering.ingest({
          meterId: usageTypeToMeterId(record.type),
          tenantId: record.organizationId,
          value: quantity,
          timestamp: record.recordedAt.toISOString(),
          properties: {
            usageType: record.type,
            ...record.resource ? { resource: record.resource } : {},
            ...record.userId ? { userId: record.userId } : {},
            eventId: record.id
          }
        });
        meterOk += 1;
      } catch (err) {
        logger.warn("[billing:flushUsageBuffer] metering.ingest failed", {
          err,
          organizationId: record.organizationId,
          type: record.type
        });
      }
    }
  }
  logger.info("[billing:flushUsageBuffer] flushed buffer to ledger + metering", {
    total: flushed.length,
    ledgerOk,
    meterOk,
    failed
  });
  return flushed;
}
function checkUsageLimit(currentUsage, limit, requestedQuantity) {
  if (limit === BigInt(-1)) {
    return {
      allowed: true,
      remaining: BigInt(-1),
      limit: BigInt(-1),
      percentUsed: 0,
      overage: BigInt(0),
      overageCost: 0
    };
  }
  const afterUsage = currentUsage + requestedQuantity;
  const overage = afterUsage > limit ? afterUsage - limit : BigInt(0);
  const remaining = limit > currentUsage ? limit - currentUsage : BigInt(0);
  const percentUsed = Number(currentUsage * BigInt(100) / limit);
  return {
    allowed: afterUsage <= limit || overage === BigInt(0),
    remaining,
    limit,
    percentUsed: Math.min(percentUsed, 100),
    overage,
    overageCost: 0
    // Calculate based on pricing
  };
}
function getPlanUsageLimit(plan, type) {
  const pricing = DEFAULT_USAGE_PRICING.find((p) => p.type === type);
  if (!pricing) return BigInt(-1);
  const limit = pricing.includedInPlan[plan];
  return BigInt(limit);
}
function calculateOverageCost(type, overageQuantity) {
  const pricing = DEFAULT_USAGE_PRICING.find((p) => p.type === type);
  if (!pricing) return 0;
  const units = Number(overageQuantity) / pricing.unitSize;
  return units * pricing.pricePerUnit;
}
function resolvePeriod(period) {
  if (period === "month") return "monthly";
  if (period === "day") return "daily";
  if (period === "hour") return "hourly";
  return period;
}
async function getUsage(organizationId, meterId, opts) {
  try {
    const metering = await getMetering();
    const summary = await metering.getUsage(organizationId, meterId, resolvePeriod(opts.period));
    return summary?.value ?? 0;
  } catch (error) {
    logger.error("[billing:getUsage] Failed to read usage from metering", error);
    throw new Error(
      `Failed to read usage for tenant=${organizationId} meter=${meterId}: ${error.message}`
    );
  }
}
function getCurrentPeriod() {
  return format(/* @__PURE__ */ new Date(), "yyyy-MM");
}
function formatUsage(quantity, type) {
  const pricing = DEFAULT_USAGE_PRICING.find((p) => p.type === type);
  if (!pricing) return quantity.toString();
  if (type === "STORAGE") {
    const gb = Number(quantity) / (1024 * 1024 * 1024);
    if (gb >= 1) return `${gb.toFixed(2)} GB`;
    const mb = Number(quantity) / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  }
  if (type === "AI_TOKEN") {
    const k = Number(quantity) / 1e3;
    if (k >= 1) return `${k.toFixed(1)}K tokens`;
    return `${quantity} tokens`;
  }
  return `${quantity.toLocaleString()} ${pricing.unitName}s`;
}
var flushTimer = null;
function ensureFlushTimer() {
  if (flushTimer !== null || typeof setInterval === "undefined") return;
  flushTimer = setInterval(() => {
    flushUsageBuffer().catch((err) => logger.error("Usage buffer flush failed", err));
  }, BUFFER_FLUSH_INTERVAL);
  flushTimer.unref?.();
}
if (typeof process !== "undefined") {
  const drainBuffer = () => {
    flushUsageBuffer().catch(() => {
    });
  };
  process.on("SIGTERM", drainBuffer);
  process.on("SIGINT", drainBuffer);
}

export {
  buildUsageLedgerIdempotencyKey,
  appendUsageLedgerEntry,
  listUsageLedgerEntries,
  recordUsage,
  flushUsageBuffer,
  checkUsageLimit,
  getPlanUsageLimit,
  calculateOverageCost,
  getUsage,
  getCurrentPeriod,
  formatUsage
};
//# sourceMappingURL=chunk-VPIBN2K6.js.map