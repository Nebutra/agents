// src/config/plan-config.ts
var InMemoryCache = class {
  cache = /* @__PURE__ */ new Map();
  async get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (item.expiresAt && item.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }
  async set(key, value, ttlSeconds = 300) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1e3
    });
  }
  async del(key) {
    this.cache.delete(key);
  }
  async keys(pattern) {
    const regex = new RegExp(pattern.replace("*", ".*"));
    return Array.from(this.cache.keys()).filter((k) => regex.test(k));
  }
};
var PlanConfigService = class _PlanConfigService {
  prisma;
  cache;
  cacheTTL;
  cachePrefix;
  // Singleton instance
  static instance = null;
  constructor(options) {
    this.prisma = options.prisma;
    this.cache = options.cache ?? new InMemoryCache();
    this.cacheTTL = options.cacheTTL ?? 300;
    this.cachePrefix = options.cachePrefix ?? "billing:config:";
  }
  /**
   * Initialize singleton instance
   */
  static init(options) {
    _PlanConfigService.instance = new _PlanConfigService(options);
    return _PlanConfigService.instance;
  }
  /**
   * Get singleton instance
   */
  static getInstance() {
    if (!_PlanConfigService.instance) {
      throw new Error("PlanConfigService not initialized. Call init() first.");
    }
    return _PlanConfigService.instance;
  }
  // ============================================
  // Core Methods
  // ============================================
  /**
   * Get resolved configuration for an organization
   * Merges: Plan defaults → Customer overrides
   */
  async getConfig(organizationId) {
    const cacheKey = `${this.cachePrefix}org:${organizationId}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        tenantId: organizationId,
        status: { in: ["ACTIVE", "TRIALING"] }
      },
      include: {
        pricingPlan: {
          include: {
            planFeatures: {
              include: { feature: true }
            },
            planLimits: {
              include: { limitDef: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    const planVersion = await this.prisma.customerPlanVersion.findUnique({
      where: { tenantId: organizationId },
      include: {
        plan: {
          include: {
            planFeatures: { include: { feature: true } },
            planLimits: { include: { limitDef: true } }
          }
        }
      }
    });
    const effectivePlan = planVersion?.plan && (!planVersion.expiresAt || planVersion.expiresAt > /* @__PURE__ */ new Date()) ? planVersion.plan : subscription?.pricingPlan;
    const plan = effectivePlan ?? await this.getFreePlan();
    const features = this.buildFeaturesFromPlan(plan);
    const limits = this.buildLimitsFromPlan(plan);
    const [featureOverrides, limitOverrides] = await Promise.all([
      this.prisma.customerFeatureOverride.findMany({
        where: {
          tenantId: organizationId,
          OR: [{ expiresAt: null }, { expiresAt: { gt: /* @__PURE__ */ new Date() } }]
        }
      }),
      this.prisma.customerUsageLimit.findMany({
        where: {
          tenantId: organizationId,
          OR: [{ expiresAt: null }, { expiresAt: { gt: /* @__PURE__ */ new Date() } }]
        },
        include: { limitDef: true }
      })
    ]);
    const overriddenFeatures = [];
    for (const override of featureOverrides) {
      features[override.featureKey] = {
        enabled: Boolean(override.value),
        value: override.value,
        metadata: { overrideReason: override.reason }
      };
      overriddenFeatures.push(override.featureKey);
    }
    const overriddenLimits = [];
    for (const override of limitOverrides) {
      limits[override.limitDef.key] = {
        limit: Number(override.limitValue),
        unit: override.limitDef.unit,
        resetPeriod: override.limitDef.resetPeriod,
        overageRate: override.overageRate ? Number(override.overageRate) : limits[override.limitDef.key]?.overageRate ?? null
      };
      overriddenLimits.push(override.limitDef.key);
    }
    const config = {
      plan: this.formatPlanConfig(plan),
      features,
      limits,
      overrides: {
        planVersion: planVersion ? plan.version : null,
        features: overriddenFeatures,
        limits: overriddenLimits
      }
    };
    await this.cache.set(cacheKey, JSON.stringify(config), this.cacheTTL);
    return config;
  }
  /**
   * Get plan by slug (e.g., "pro", "enterprise")
   */
  async getPlan(slug, version) {
    const cacheKey = `${this.cachePrefix}plan:${slug}:${version ?? "latest"}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    const plan = await this.prisma.pricingPlan.findFirst({
      where: {
        slug,
        isActive: true,
        ...version ? { version } : {},
        OR: [{ effectiveTo: null }, { effectiveTo: { gt: /* @__PURE__ */ new Date() } }]
      },
      include: {
        planFeatures: { include: { feature: true } },
        planLimits: { include: { limitDef: true } }
      },
      orderBy: { effectiveFrom: "desc" }
    });
    if (!plan) return null;
    const config = this.formatPlanConfig(plan);
    await this.cache.set(cacheKey, JSON.stringify(config), this.cacheTTL);
    return config;
  }
  /**
   * Get all active plans
   */
  async getPlans(options) {
    const cacheKey = `${this.cachePrefix}plans:${options?.publicOnly ? "public" : "all"}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    const plans = await this.prisma.pricingPlan.findMany({
      where: {
        isActive: true,
        ...options?.publicOnly ? { isPublic: true } : {},
        OR: [{ effectiveTo: null }, { effectiveTo: { gt: /* @__PURE__ */ new Date() } }]
      },
      include: {
        planFeatures: { include: { feature: true } },
        planLimits: { include: { limitDef: true } }
      },
      orderBy: [{ plan: "asc" }, { effectiveFrom: "desc" }]
    });
    const uniquePlans = /* @__PURE__ */ new Map();
    for (const plan of plans) {
      if (!uniquePlans.has(plan.slug)) {
        uniquePlans.set(plan.slug, plan);
      }
    }
    const configs = Array.from(uniquePlans.values()).map((p) => this.formatPlanConfig(p));
    await this.cache.set(cacheKey, JSON.stringify(configs), this.cacheTTL);
    return configs;
  }
  /**
   * Check if organization has feature access
   */
  async hasFeature(organizationId, featureKey) {
    const config = await this.getConfig(organizationId);
    return config.features[featureKey]?.enabled ?? false;
  }
  /**
   * Get usage limit for organization
   */
  async getLimit(organizationId, limitKey) {
    const config = await this.getConfig(organizationId);
    return config.limits[limitKey] ?? null;
  }
  /**
   * Check if usage is within limits
   */
  async checkLimit(organizationId, limitKey, currentUsage, additionalUsage = 0) {
    const limitConfig = await this.getLimit(organizationId, limitKey);
    if (!limitConfig) {
      return {
        allowed: false,
        limit: 0,
        current: currentUsage,
        remaining: 0,
        wouldExceed: true
      };
    }
    if (limitConfig.limit === -1) {
      return {
        allowed: true,
        limit: -1,
        current: currentUsage,
        remaining: -1,
        wouldExceed: false
      };
    }
    const remaining = limitConfig.limit - currentUsage;
    const wouldExceed = currentUsage + additionalUsage > limitConfig.limit;
    return {
      allowed: !wouldExceed,
      limit: limitConfig.limit,
      current: currentUsage,
      remaining: Math.max(0, remaining),
      wouldExceed
    };
  }
  // ============================================
  // Cache Management
  // ============================================
  /**
   * Invalidate cache for organization
   */
  async invalidateOrg(organizationId) {
    const cacheKey = `${this.cachePrefix}org:${organizationId}`;
    await this.cache.del(cacheKey);
  }
  /**
   * Invalidate all plan caches
   */
  async invalidatePlans() {
    const keys = await this.cache.keys(`${this.cachePrefix}plan:*`);
    for (const key of keys) {
      await this.cache.del(key);
    }
    await this.cache.del(`${this.cachePrefix}plans:public`);
    await this.cache.del(`${this.cachePrefix}plans:all`);
  }
  /**
   * Invalidate all caches
   */
  async invalidateAll() {
    const keys = await this.cache.keys(`${this.cachePrefix}*`);
    for (const key of keys) {
      await this.cache.del(key);
    }
  }
  // ============================================
  // Private Helpers
  // ============================================
  async getFreePlan() {
    const plan = await this.prisma.pricingPlan.findFirst({
      where: {
        plan: "FREE",
        isActive: true
      },
      include: {
        planFeatures: { include: { feature: true } },
        planLimits: { include: { limitDef: true } }
      }
    });
    if (!plan) {
      return {
        id: "default-free",
        slug: "free",
        name: "Free",
        plan: "FREE",
        version: "v1",
        interval: "MONTHLY",
        amount: 0,
        currency: "USD",
        trialDays: 0,
        effectiveFrom: /* @__PURE__ */ new Date(),
        effectiveTo: null,
        isActive: true,
        isPublic: true,
        planFeatures: [],
        planLimits: []
      };
    }
    return plan;
  }
  buildFeaturesFromPlan(plan) {
    const features = {};
    for (const pf of plan.planFeatures) {
      features[pf.feature.key] = {
        enabled: pf.isEnabled,
        value: pf.value,
        metadata: pf.metadata ?? void 0
      };
    }
    return features;
  }
  buildLimitsFromPlan(plan) {
    const limits = {};
    for (const pl of plan.planLimits) {
      limits[pl.limitDef.key] = {
        limit: Number(pl.limitValue),
        unit: pl.limitDef.unit,
        resetPeriod: pl.limitDef.resetPeriod,
        overageRate: pl.overageRate ? Number(pl.overageRate) : pl.limitDef.overageRate ? Number(pl.limitDef.overageRate) : null
      };
    }
    return limits;
  }
  formatPlanConfig(plan) {
    return {
      id: plan.id,
      slug: plan.slug,
      name: plan.name,
      plan: plan.plan,
      version: plan.version,
      interval: plan.interval,
      amount: Number(plan.amount),
      currency: plan.currency,
      trialDays: plan.trialDays,
      features: this.buildFeaturesFromPlan(plan),
      limits: this.buildLimitsFromPlan(plan),
      isActive: plan.isActive,
      effectiveFrom: plan.effectiveFrom,
      effectiveTo: plan.effectiveTo
    };
  }
};
var initPlanConfig = PlanConfigService.init.bind(PlanConfigService);
var getPlanConfig = () => PlanConfigService.getInstance();

export {
  PlanConfigService,
  initPlanConfig,
  getPlanConfig
};
//# sourceMappingURL=chunk-X4GCTHGA.js.map