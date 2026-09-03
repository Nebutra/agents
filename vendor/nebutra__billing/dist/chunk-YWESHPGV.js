import {
  getUsage
} from "./chunk-VPIBN2K6.js";
import {
  DEFAULT_PLAN_LIMITS,
  EntitlementError
} from "./chunk-44PNSGWM.js";

// src/entitlements/service.ts
import { evaluateUsageLimit } from "@nebutra/metering";
var FEATURES = {
  // AI Features
  "ai.chat": { name: "AI Chat", description: "Access to AI chat features" },
  "ai.embeddings": { name: "Embeddings", description: "Generate text embeddings" },
  "ai.images": { name: "Image Generation", description: "Generate images with AI" },
  "ai.reasoning": { name: "AI Reasoning", description: "Access to reasoning models" },
  // Content Features
  "content.create": { name: "Content Creation", description: "Create content" },
  "content.publish": { name: "Content Publishing", description: "Publish content" },
  "content.analytics": { name: "Content Analytics", description: "View content analytics" },
  // Recommendations
  "recommendations.basic": {
    name: "Basic Recommendations",
    description: "Basic recommendation features"
  },
  "recommendations.advanced": {
    name: "Advanced Recommendations",
    description: "Advanced ML-based recommendations"
  },
  // Web3 Features
  "web3.nft": { name: "NFT Features", description: "NFT minting and management" },
  "web3.wallet": { name: "Wallet Integration", description: "Web3 wallet integration" },
  // Team Features
  "team.members": { name: "Team Members", description: "Add team members" },
  "team.roles": { name: "Custom Roles", description: "Create custom roles" },
  // Platform Features
  "api.access": { name: "API Access", description: "Direct API access" },
  webhooks: { name: "Webhooks", description: "Configure webhooks" },
  sso: { name: "SSO/SAML", description: "Single sign-on integration" },
  audit_logs: { name: "Audit Logs", description: "View audit logs" }
};
var PLAN_FEATURES = {
  FREE: ["ai.chat", "content.create", "recommendations.basic"],
  PRO: [
    "ai.chat",
    "ai.embeddings",
    "ai.images",
    "content.create",
    "content.publish",
    "content.analytics",
    "recommendations.basic",
    "recommendations.advanced",
    "team.members",
    "api.access",
    "webhooks"
  ],
  ENTERPRISE: [
    "ai.chat",
    "ai.embeddings",
    "ai.images",
    "ai.reasoning",
    "content.create",
    "content.publish",
    "content.analytics",
    "recommendations.basic",
    "recommendations.advanced",
    "web3.nft",
    "web3.wallet",
    "team.members",
    "team.roles",
    "api.access",
    "webhooks",
    "sso",
    "audit_logs"
  ]
};
var DEPRECATION_MESSAGE = "Entitlement DB CRUD is deprecated (Entitlement model removed). Use checkEntitlementUsage() / requireEntitlementUsage() (metering-backed) or the plan-level helpers PLAN_FEATURES + isPlanFeature().";
async function getEntitlements(_organizationId) {
  throw new EntitlementError(DEPRECATION_MESSAGE, "ENTITLEMENT_DEPRECATED");
}
async function checkEntitlement(_organizationId, feature, _quantity) {
  return {
    allowed: false,
    feature,
    reason: DEPRECATION_MESSAGE
  };
}
async function requireEntitlement(_organizationId, _feature, _quantity) {
  throw new EntitlementError(DEPRECATION_MESSAGE, "ENTITLEMENT_DEPRECATED");
}
async function grantEntitlement(_input) {
  throw new EntitlementError(DEPRECATION_MESSAGE, "ENTITLEMENT_DEPRECATED");
}
async function revokeEntitlement(_organizationId, _feature) {
  throw new EntitlementError(DEPRECATION_MESSAGE, "ENTITLEMENT_DEPRECATED");
}
async function incrementUsage(_organizationId, _feature, _quantity = 1) {
  throw new EntitlementError(DEPRECATION_MESSAGE, "ENTITLEMENT_DEPRECATED");
}
async function resetUsage(_organizationId, _feature) {
  throw new EntitlementError(DEPRECATION_MESSAGE, "ENTITLEMENT_DEPRECATED");
}
async function initializePlanEntitlements(_organizationId, _plan) {
  throw new EntitlementError(DEPRECATION_MESSAGE, "ENTITLEMENT_DEPRECATED");
}
function isPlanFeature(plan, feature) {
  const features = PLAN_FEATURES[plan] || [];
  return features.includes(feature);
}
var METER_TO_PLAN_LIMIT = {
  ai_tokens: "aiTokens",
  api_calls: "apiCalls",
  storage_bytes: "storage"
};
async function checkEntitlementUsage(organizationId, meterId, plan, options = {}) {
  const limitField = METER_TO_PLAN_LIMIT[meterId];
  if (!limitField) {
    throw new EntitlementError(
      `No plan limit mapping for meter '${meterId}'. Register it in METER_TO_PLAN_LIMIT.`,
      "UNKNOWN_METER"
    );
  }
  const limit = DEFAULT_PLAN_LIMITS[plan][limitField];
  const used = await getUsage(organizationId, meterId, { period: "monthly" });
  const quota = evaluateUsageLimit({
    meterId,
    used,
    requested: options.requested ?? 0,
    limit
  });
  return {
    allowed: quota.allowed,
    meterId,
    plan,
    used,
    requested: quota.requested,
    projected: quota.projected,
    limit,
    remaining: quota.remaining,
    ...quota.reason ? { reason: quota.reason } : {}
  };
}
async function requireEntitlementUsage(organizationId, meterId, plan, options = {}) {
  const result = await checkEntitlementUsage(organizationId, meterId, plan, options);
  if (!result.allowed) {
    throw new EntitlementError(result.reason ?? "Usage limit exceeded", "USAGE_LIMIT_EXCEEDED");
  }
}

export {
  FEATURES,
  PLAN_FEATURES,
  getEntitlements,
  checkEntitlement,
  requireEntitlement,
  grantEntitlement,
  revokeEntitlement,
  incrementUsage,
  resetUsage,
  initializePlanEntitlements,
  isPlanFeature,
  METER_TO_PLAN_LIMIT,
  checkEntitlementUsage,
  requireEntitlementUsage
};
//# sourceMappingURL=chunk-YWESHPGV.js.map