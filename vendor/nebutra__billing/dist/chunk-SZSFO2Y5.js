import {
  dollarsToCents
} from "./chunk-XTZHQTHP.js";
import {
  requireTenantDb
} from "./chunk-BR5IXYNU.js";
import {
  BillingError
} from "./chunk-44PNSGWM.js";

// src/credits/service.ts
var CACHE_TTL_MS = 60 * 1e3;
var balanceCache = /* @__PURE__ */ new Map();
var DEFAULT_CREDIT_ALLOWANCES = {
  FREE: {
    includedMonthly: 1500,
    dailyRefresh: 300,
    refreshTime: "08:00 UTC"
  },
  PRO: {
    includedMonthly: 1e4,
    dailyRefresh: 1e3,
    refreshTime: "08:00 UTC"
  },
  ENTERPRISE: {
    includedMonthly: -1,
    dailyRefresh: -1,
    refreshTime: "08:00 UTC"
  }
};
function invalidateCreditCache(organizationId) {
  balanceCache.delete(organizationId);
}
function toJsonInput(metadata) {
  return metadata ?? {};
}
async function getCreditBalance(organizationId) {
  const now = Date.now();
  const cached = balanceCache.get(organizationId);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }
  const db = requireTenantDb(organizationId);
  let dbBalance = await db.creditBalance.findUnique({
    where: { tenantId: organizationId }
  });
  if (!dbBalance) {
    dbBalance = await db.creditBalance.create({
      data: {
        tenantId: organizationId,
        balance: 0,
        currency: "USD"
      }
    });
  }
  const mapped = {
    organizationId: dbBalance.tenantId,
    balance: Number(dbBalance.balance),
    currency: dbBalance.currency
  };
  balanceCache.set(organizationId, {
    data: mapped,
    expiresAt: now + CACHE_TTL_MS
  });
  return mapped;
}
async function addCredits(input) {
  if (input.amount <= 0) {
    throw new BillingError("Credit amount must be positive", "INVALID_CREDIT_AMOUNT", 400);
  }
  const db = requireTenantDb(input.organizationId);
  const transactionData = await db.$transaction(async (tx) => {
    const balance = await tx.creditBalance.upsert({
      where: { tenantId: input.organizationId },
      create: {
        tenantId: input.organizationId,
        balance: 0,
        currency: "USD"
      },
      update: {}
    });
    if (input.relatedId) {
      const existing = await tx.creditTransaction.findFirst({
        where: {
          creditBalanceId: balance.id,
          relatedId: input.relatedId,
          type: input.type
        }
      });
      if (existing) {
        return existing;
      }
    }
    const updatedBalance = await tx.creditBalance.update({
      where: { tenantId: input.organizationId },
      data: { balance: { increment: input.amount } }
    });
    return tx.creditTransaction.create({
      data: {
        creditBalanceId: updatedBalance.id,
        type: input.type,
        amount: input.amount,
        balanceAfter: updatedBalance.balance,
        description: input.description,
        expiresAt: input.expiresAt,
        relatedId: input.relatedId,
        metadata: toJsonInput(input.metadata)
      }
    });
  });
  invalidateCreditCache(input.organizationId);
  return {
    id: transactionData.id,
    organizationId: input.organizationId,
    type: transactionData.type,
    amount: Number(transactionData.amount),
    balanceAfter: Number(transactionData.balanceAfter),
    description: transactionData.description || void 0,
    expiresAt: transactionData.expiresAt || void 0,
    relatedId: transactionData.relatedId || void 0,
    metadata: transactionData.metadata || void 0,
    createdAt: transactionData.createdAt
  };
}
async function deductCredits(input) {
  if (input.amount <= 0) {
    throw new BillingError("Credit amount must be positive", "INVALID_CREDIT_AMOUNT", 400);
  }
  const db = requireTenantDb(input.organizationId);
  const transactionData = await db.$transaction(async (tx) => {
    const balance = await tx.creditBalance.findUnique({
      where: { tenantId: input.organizationId }
    });
    if (!balance) {
      throw new BillingError("Insufficient credits", "INSUFFICIENT_CREDITS", 402);
    }
    if (input.relatedId) {
      const existing = await tx.creditTransaction.findFirst({
        where: {
          creditBalanceId: balance.id,
          relatedId: input.relatedId,
          type: "USAGE"
        }
      });
      if (existing) {
        return existing;
      }
    }
    const updateResult = await tx.creditBalance.updateMany({
      where: {
        tenantId: input.organizationId,
        balance: { gte: input.amount }
      },
      data: { balance: { decrement: input.amount } }
    });
    if (updateResult.count === 0) {
      throw new BillingError("Insufficient credits", "INSUFFICIENT_CREDITS", 402);
    }
    const freshBalance = await tx.creditBalance.findUnique({
      where: { tenantId: input.organizationId }
    });
    if (!freshBalance) {
      throw new BillingError("Credit balance not found", "CREDIT_BALANCE_NOT_FOUND", 404);
    }
    return tx.creditTransaction.create({
      data: {
        creditBalanceId: freshBalance.id,
        type: "USAGE",
        amount: -input.amount,
        balanceAfter: freshBalance.balance,
        description: input.description,
        relatedId: input.relatedId,
        metadata: toJsonInput(input.metadata)
      }
    });
  });
  invalidateCreditCache(input.organizationId);
  return {
    id: transactionData.id,
    organizationId: input.organizationId,
    type: transactionData.type,
    amount: Number(transactionData.amount),
    balanceAfter: Number(transactionData.balanceAfter),
    description: transactionData.description || void 0,
    relatedId: transactionData.relatedId || void 0,
    metadata: transactionData.metadata || void 0,
    createdAt: transactionData.createdAt
  };
}
async function hasEnoughCredits(organizationId, amount) {
  const balance = await getCreditBalance(organizationId);
  return balance.balance >= amount;
}
async function getCreditTransactions(organizationId, options) {
  const db = requireTenantDb(organizationId);
  const balance = await db.creditBalance.findUnique({
    where: { tenantId: organizationId },
    select: { id: true }
  });
  if (!balance) return [];
  const raw = await db.creditTransaction.findMany({
    where: {
      creditBalanceId: balance.id,
      ...options?.type ? { type: options.type } : {}
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit || 50,
    skip: options?.offset || 0
  });
  return raw.map((tx) => ({
    id: String(tx.id),
    organizationId,
    type: tx.type,
    amount: Number(tx.amount),
    balanceAfter: Number(tx.balanceAfter),
    description: tx.description || void 0,
    expiresAt: tx.expiresAt || void 0,
    relatedId: tx.relatedId || void 0,
    metadata: tx.metadata || void 0,
    createdAt: tx.createdAt
  }));
}
function dollarsToCredits(dollars) {
  return dollarsToCents(dollars);
}
function creditsToDollars(credits) {
  return credits / 100;
}
function getCreditAllowanceForPlan(plan) {
  const normalized = plan === "PRO" || plan === "ENTERPRISE" ? plan : "FREE";
  return {
    plan: normalized,
    ...DEFAULT_CREDIT_ALLOWANCES[normalized]
  };
}
function formatCredits(credits, currency = "USD", locale = "en-US") {
  const amount = creditsToDollars(credits);
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}
async function refundCredits(input) {
  return await addCredits({
    organizationId: input.organizationId,
    amount: input.amount,
    type: "REFUND",
    description: input.reason || "Refund",
    relatedId: input.relatedId
  });
}
async function addBonusCredits(input) {
  return await addCredits({
    organizationId: input.organizationId,
    amount: input.amount,
    type: "BONUS",
    description: input.reason || "Bonus credits",
    expiresAt: input.expiresAt
  });
}

export {
  getCreditBalance,
  addCredits,
  deductCredits,
  hasEnoughCredits,
  getCreditTransactions,
  dollarsToCredits,
  creditsToDollars,
  getCreditAllowanceForPlan,
  formatCredits,
  refundCredits,
  addBonusCredits
};
//# sourceMappingURL=chunk-SZSFO2Y5.js.map