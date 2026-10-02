// src/types.ts
import { z } from "zod";
var DEFAULT_PLAN_LIMITS = {
  FREE: {
    apiCalls: 1e3,
    aiTokens: 1e4,
    storage: 100 * 1024 * 1024,
    // 100MB
    teamMembers: 1,
    projects: 1,
    features: ["basic_ai", "basic_content"]
  },
  PRO: {
    apiCalls: 5e4,
    aiTokens: 5e5,
    storage: 10 * 1024 * 1024 * 1024,
    // 10GB
    teamMembers: 10,
    projects: 10,
    features: [
      "basic_ai",
      "basic_content",
      "advanced_ai",
      "recommendations",
      "analytics",
      "api_access"
    ]
  },
  ENTERPRISE: {
    apiCalls: -1,
    // unlimited
    aiTokens: -1,
    storage: -1,
    teamMembers: -1,
    projects: -1,
    features: [
      "basic_ai",
      "basic_content",
      "advanced_ai",
      "recommendations",
      "analytics",
      "api_access",
      "web3",
      "custom_models",
      "sso",
      "audit_logs",
      "priority_support"
    ]
  }
};
var DEFAULT_PRICING = [
  {
    id: "free",
    plan: "FREE",
    name: "Free",
    description: "Get started with basic features",
    interval: "MONTHLY",
    amount: 0,
    currency: "USD",
    trialDays: 0,
    trialPeriodDays: 0,
    isDefault: true,
    features: ["1,000 API calls/month", "10K AI tokens/month", "100MB storage"],
    limits: DEFAULT_PLAN_LIMITS.FREE
  },
  {
    id: "pro_monthly",
    plan: "PRO",
    name: "Pro",
    description: "For growing teams",
    interval: "MONTHLY",
    amount: 2900,
    // $29
    currency: "USD",
    trialDays: 14,
    trialPeriodDays: 14,
    seatBased: true,
    features: [
      "50,000 API calls/month",
      "500K AI tokens/month",
      "10GB storage",
      "Up to 10 team members",
      "Advanced analytics",
      "Priority support"
    ],
    limits: DEFAULT_PLAN_LIMITS.PRO
  },
  {
    id: "pro_yearly",
    plan: "PRO",
    name: "Pro (Annual)",
    description: "For growing teams - save 20%",
    interval: "YEARLY",
    amount: 27900,
    // $279/year (~$23.25/month)
    currency: "USD",
    trialDays: 14,
    trialPeriodDays: 14,
    seatBased: true,
    features: [
      "50,000 API calls/month",
      "500K AI tokens/month",
      "10GB storage",
      "Up to 10 team members",
      "Advanced analytics",
      "Priority support"
    ],
    limits: DEFAULT_PLAN_LIMITS.PRO
  },
  {
    id: "enterprise",
    plan: "ENTERPRISE",
    name: "Enterprise",
    description: "For large organizations",
    interval: "MONTHLY",
    amount: 0,
    // Custom pricing
    currency: "USD",
    trialDays: 30,
    trialPeriodDays: 30,
    contactSales: true,
    features: [
      "Unlimited API calls",
      "Unlimited AI tokens",
      "Unlimited storage",
      "Unlimited team members",
      "SSO/SAML",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantee"
    ],
    limits: DEFAULT_PLAN_LIMITS.ENTERPRISE
  }
];
var DEFAULT_USAGE_PRICING = [
  {
    type: "API_CALL",
    unitName: "API call",
    unitSize: 1,
    pricePerUnit: 1e-3,
    // $0.001 per call
    currency: "USD",
    includedInPlan: { FREE: 1e3, PRO: 5e4, ENTERPRISE: -1 }
  },
  {
    type: "AI_TOKEN",
    unitName: "token",
    unitSize: 1e3,
    pricePerUnit: 2e-3,
    // $0.002 per 1K tokens
    currency: "USD",
    includedInPlan: { FREE: 1e4, PRO: 5e5, ENTERPRISE: -1 }
  },
  {
    type: "STORAGE",
    unitName: "GB",
    unitSize: 1024 * 1024 * 1024,
    pricePerUnit: 0.02,
    // $0.02 per GB
    currency: "USD",
    includedInPlan: {
      FREE: 100 * 1024 * 1024,
      PRO: 10 * 1024 * 1024 * 1024,
      ENTERPRISE: -1
    }
  }
];
var CreateSubscriptionSchema = z.object({
  organizationId: z.string(),
  pricingPlanId: z.string(),
  paymentMethodId: z.string().optional(),
  trialDays: z.number().optional()
});
var UpdateSubscriptionSchema = z.object({
  subscriptionId: z.string(),
  pricingPlanId: z.string().optional(),
  cancelAtPeriodEnd: z.boolean().optional()
});
var RecordUsageSchema = z.object({
  organizationId: z.string(),
  userId: z.string().optional(),
  type: z.enum(["API_CALL", "AI_TOKEN", "STORAGE", "COMPUTE", "BANDWIDTH", "CUSTOM"]),
  quantity: z.number().int().positive(),
  resource: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});
var PurchaseCreditsSchema = z.object({
  organizationId: z.string(),
  amount: z.number().positive(),
  currency: z.string().default("USD"),
  paymentMethodId: z.string()
});
var CheckEntitlementSchema = z.object({
  organizationId: z.string(),
  feature: z.string(),
  quantity: z.number().optional()
});
var BillingError = class extends Error {
  constructor(message, code, statusCode = 400, cause) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.cause = cause;
    this.name = "BillingError";
  }
  code;
  statusCode;
  cause;
};
var SubscriptionError = class extends BillingError {
  constructor(message, code, cause) {
    super(message, code, 400, cause);
    this.name = "SubscriptionError";
  }
};
var UsageError = class extends BillingError {
  constructor(message, code, cause) {
    super(message, code, 400, cause);
    this.name = "UsageError";
  }
};
var EntitlementError = class extends BillingError {
  constructor(message, code, cause) {
    super(message, code, 403, cause);
    this.name = "EntitlementError";
  }
};
var PaymentError = class extends BillingError {
  constructor(message, code, cause) {
    super(message, code, 402, cause);
    this.name = "PaymentError";
  }
};

export {
  DEFAULT_PLAN_LIMITS,
  DEFAULT_PRICING,
  DEFAULT_USAGE_PRICING,
  CreateSubscriptionSchema,
  UpdateSubscriptionSchema,
  RecordUsageSchema,
  PurchaseCreditsSchema,
  CheckEntitlementSchema,
  BillingError,
  SubscriptionError,
  UsageError,
  EntitlementError,
  PaymentError
};
//# sourceMappingURL=chunk-44PNSGWM.js.map