import {
  requireTenantDb
} from "./chunk-BR5IXYNU.js";
import {
  BillingError
} from "./chunk-UJQFQMSY.js";

// src/credits/lots.ts
import { logger } from "@nebutra/logger";

// src/money.ts
function dollarsToCents(dollars) {
  return Math.round(Number((dollars * 100).toFixed(4)));
}

// src/credits/service.ts
var PRODUCT_ID = /^[a-z][a-z0-9-]{1,31}$/;
function assertWalletProduct(product) {
  if (!PRODUCT_ID.test(product)) {
    throw new BillingError(`Invalid wallet product: ${product}`, "INVALID_WALLET_PRODUCT", 400);
  }
  return product;
}
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
var cacheKey = (organizationId, product) => `${organizationId}:${product}`;
function invalidateCreditCache(organizationId, product) {
  balanceCache.delete(cacheKey(organizationId, product));
}
var balanceKey = (organizationId, product) => ({
  tenantId_product: { tenantId: organizationId, product: assertWalletProduct(product) }
});
function toJsonInput(metadata) {
  return metadata ?? {};
}
async function getCreditBalance(organizationId, product) {
  const now = Date.now();
  const key = cacheKey(organizationId, product);
  const cached = balanceCache.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }
  const db = requireTenantDb(organizationId);
  let dbBalance = await db.creditBalance.findUnique({
    where: balanceKey(organizationId, product)
  });
  if (!dbBalance) {
    dbBalance = await db.creditBalance.create({
      data: {
        tenantId: organizationId,
        product,
        balance: 0,
        currency: "USD"
      }
    });
  }
  const mapped = {
    organizationId: dbBalance.tenantId,
    product,
    balance: Number(dbBalance.balance),
    currency: dbBalance.currency
  };
  balanceCache.set(key, {
    data: mapped,
    expiresAt: now + CACHE_TTL_MS
  });
  return mapped;
}
async function getCreditBalanceFresh(organizationId, product) {
  invalidateCreditCache(organizationId, product);
  return getCreditBalance(organizationId, product);
}
async function hasEnoughCreditsFresh(organizationId, product, amount) {
  const balance = await getCreditBalanceFresh(organizationId, product);
  return balance.balance >= amount;
}
async function addCredits(input) {
  if (input.amount <= 0) {
    throw new BillingError("Credit amount must be positive", "INVALID_CREDIT_AMOUNT", 400);
  }
  const db = requireTenantDb(input.organizationId);
  const transactionData = await db.$transaction((tx) => grantInTx(tx, input));
  invalidateCreditCache(input.organizationId, input.product);
  return {
    id: transactionData.id,
    organizationId: input.organizationId,
    product: input.product,
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
async function grantInTx(tx, input) {
  if (input.amount <= 0) {
    throw new BillingError("Credit amount must be positive", "INVALID_CREDIT_AMOUNT", 400);
  }
  const balance = await tx.creditBalance.upsert({
    where: balanceKey(input.organizationId, input.product),
    create: {
      tenantId: input.organizationId,
      product: input.product,
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
    where: balanceKey(input.organizationId, input.product),
    data: { balance: { increment: input.amount } }
  });
  if (input.lot) {
    await tx.creditLot.create({
      data: {
        creditBalanceId: updatedBalance.id,
        source: input.lot.source,
        amount: input.amount,
        remaining: input.amount,
        expiresAt: input.lot.expiresAt,
        relatedId: input.relatedId
      }
    });
  }
  return tx.creditTransaction.create({
    data: {
      creditBalanceId: updatedBalance.id,
      type: input.type,
      amount: input.amount,
      balanceAfter: updatedBalance.balance,
      description: input.description,
      expiresAt: input.lot?.expiresAt ?? input.expiresAt,
      relatedId: input.relatedId,
      metadata: toJsonInput(input.metadata)
    }
  });
}
async function consumeLots(tx, creditBalanceId, amount) {
  let left = amount;
  const lots = await tx.creditLot.findMany({
    where: { creditBalanceId, remaining: { gt: 0 }, expiresAt: { gt: /* @__PURE__ */ new Date() } },
    orderBy: [{ expiresAt: "asc" }, { createdAt: "asc" }]
  });
  for (const lot of lots) {
    if (left <= 0) break;
    const take = Math.min(Number(lot.remaining), left);
    await tx.creditLot.update({
      where: { id: lot.id },
      data: { remaining: { decrement: take } }
    });
    left -= take;
  }
}
async function deductCredits(input) {
  if (input.amount <= 0) {
    throw new BillingError("Credit amount must be positive", "INVALID_CREDIT_AMOUNT", 400);
  }
  const db = requireTenantDb(input.organizationId);
  const transactionData = await db.$transaction(async (tx) => {
    const balance = await tx.creditBalance.findUnique({
      where: balanceKey(input.organizationId, input.product)
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
        product: input.product,
        balance: { gte: input.amount }
      },
      data: { balance: { decrement: input.amount } }
    });
    if (updateResult.count === 0) {
      throw new BillingError("Insufficient credits", "INSUFFICIENT_CREDITS", 402);
    }
    const freshBalance = await tx.creditBalance.findUnique({
      where: balanceKey(input.organizationId, input.product)
    });
    if (!freshBalance) {
      throw new BillingError("Credit balance not found", "CREDIT_BALANCE_NOT_FOUND", 404);
    }
    await consumeLots(tx, freshBalance.id, input.amount);
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
  invalidateCreditCache(input.organizationId, input.product);
  return {
    id: transactionData.id,
    organizationId: input.organizationId,
    product: input.product,
    type: transactionData.type,
    amount: Number(transactionData.amount),
    balanceAfter: Number(transactionData.balanceAfter),
    description: transactionData.description || void 0,
    relatedId: transactionData.relatedId || void 0,
    metadata: transactionData.metadata || void 0,
    createdAt: transactionData.createdAt
  };
}
async function hasEnoughCredits(organizationId, product, amount) {
  const balance = await getCreditBalance(organizationId, product);
  return balance.balance >= amount;
}
async function getCreditTransactions(organizationId, product, options) {
  const db = requireTenantDb(organizationId);
  const balance = await db.creditBalance.findUnique({
    where: balanceKey(organizationId, product),
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
    product,
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
    product: input.product,
    amount: input.amount,
    type: "REFUND",
    description: input.reason || "Refund",
    relatedId: input.relatedId
  });
}
async function addBonusCredits(input) {
  return await addCredits({
    organizationId: input.organizationId,
    product: input.product,
    amount: input.amount,
    type: "BONUS",
    description: input.reason || "Bonus credits",
    expiresAt: input.expiresAt
  });
}

// src/credits/lots.ts
var log = logger.child({ service: "credit-lots" });
async function getExpiringCredits(organizationId, product) {
  const db = requireTenantDb(organizationId);
  const lots = await db.creditLot.findMany({
    where: {
      creditBalance: { tenantId: organizationId, product },
      remaining: { gt: 0 },
      expiresAt: { gt: /* @__PURE__ */ new Date() }
    },
    orderBy: { expiresAt: "asc" }
  });
  return lots.map(
    (lot) => ({ source: lot.source, remaining: Number(lot.remaining), expiresAt: lot.expiresAt })
  );
}
async function expireCreditLots(systemDb, options = {}) {
  const now = options.now ?? /* @__PURE__ */ new Date();
  const due = await systemDb.creditLot.findMany({
    where: { expiresAt: { lte: now }, remaining: { gt: 0 } },
    include: { creditBalance: { select: { tenantId: true, product: true } } },
    orderBy: { expiresAt: "asc" },
    take: options.limit ?? 200
  });
  const result = { expired: 0, errors: 0 };
  for (const lot of due) {
    const { tenantId, product } = lot.creditBalance;
    try {
      await requireTenantDb(tenantId).$transaction(async (tx) => {
        await tx.creditBalance.updateMany({
          where: { id: lot.creditBalanceId },
          data: { balance: { increment: 0 } }
        });
        const fresh = await tx.creditLot.findUnique({ where: { id: lot.id } });
        const balance = await tx.creditBalance.findUnique({ where: { id: lot.creditBalanceId } });
        if (!fresh || !balance || Number(fresh.remaining) <= 0) return;
        const amount = Math.min(Number(fresh.remaining), Number(balance.balance));
        await tx.creditLot.update({ where: { id: lot.id }, data: { remaining: 0 } });
        if (amount <= 0) return;
        const updated = await tx.creditBalance.update({
          where: { id: lot.creditBalanceId },
          data: { balance: { decrement: amount } }
        });
        await tx.creditTransaction.create({
          data: {
            creditBalanceId: lot.creditBalanceId,
            type: "EXPIRATION",
            amount: -amount,
            balanceAfter: updated.balance,
            description: `Expired (${fresh.source.toLowerCase()} credits)`,
            relatedId: `expire:${lot.id}`,
            metadata: { lotId: lot.id, expiresAt: fresh.expiresAt.toISOString() }
          }
        });
      });
      invalidateCreditCache(tenantId, product);
      result.expired += 1;
    } catch (error) {
      result.errors += 1;
      log.error("Expiring a credit lot failed", { lotId: lot.id, tenantId, product, error });
    }
  }
  return result;
}

export {
  assertWalletProduct,
  invalidateCreditCache,
  getCreditBalance,
  getCreditBalanceFresh,
  hasEnoughCreditsFresh,
  addCredits,
  grantInTx,
  deductCredits,
  hasEnoughCredits,
  getCreditTransactions,
  dollarsToCredits,
  creditsToDollars,
  getCreditAllowanceForPlan,
  formatCredits,
  refundCredits,
  addBonusCredits,
  getExpiringCredits,
  expireCreditLots
};
//# sourceMappingURL=chunk-3UKOJWHE.js.map