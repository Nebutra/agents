// src/identity.ts
import { z } from "zod";
var AuthProviderSchema = z.enum(["clerk", "authjs", "nebutra", "custom"]);
var CanonicalRoleSchema = z.enum(["OWNER", "ADMIN", "MEMBER", "VIEWER"]);
var CanonicalPlanSchema = z.enum(["FREE", "PRO", "ENTERPRISE"]);
var CanonicalIdentitySchema = z.object({
  provider: AuthProviderSchema,
  userId: z.string().min(1),
  organizationId: z.string().min(1).optional(),
  role: CanonicalRoleSchema.optional(),
  plan: CanonicalPlanSchema.optional(),
  email: z.string().email().optional(),
  sessionId: z.string().min(1).optional(),
  claimsVersion: z.literal("v1").default("v1")
});
var ExternalAccountLinkSchema = z.object({
  provider: AuthProviderSchema,
  providerUserId: z.string().min(1),
  internalUserId: z.string().min(1),
  linkedAt: z.coerce.date(),
  metadata: z.record(z.string(), z.unknown()).default({})
});
var TenantHeaderContractSchema = z.object({
  "x-user-id": z.string().min(1).optional(),
  "x-organization-id": z.string().min(1).optional(),
  "x-role": z.string().min(1).optional(),
  "x-plan": CanonicalPlanSchema.optional()
});
var NebutraOAuthScopeSchema = z.enum([
  "openid",
  "profile",
  "email",
  "organization:read",
  "organization:write",
  "content:read",
  "content:write",
  "billing:read"
]);
var OAuthClientTypeSchema = z.enum(["CONFIDENTIAL", "PUBLIC"]);
var OAuthClientRegistrationSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1e3).optional(),
  type: OAuthClientTypeSchema.default("CONFIDENTIAL"),
  redirectUris: z.array(z.string().url()).min(1),
  allowedScopes: z.array(NebutraOAuthScopeSchema).default(["openid", "profile"]),
  websiteUrl: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  privacyPolicyUrl: z.string().url().optional(),
  tosUrl: z.string().url().optional()
});

export {
  AuthProviderSchema,
  CanonicalRoleSchema,
  CanonicalPlanSchema,
  CanonicalIdentitySchema,
  ExternalAccountLinkSchema,
  TenantHeaderContractSchema,
  NebutraOAuthScopeSchema,
  OAuthClientTypeSchema,
  OAuthClientRegistrationSchema
};
//# sourceMappingURL=chunk-5JNQ2KAT.js.map