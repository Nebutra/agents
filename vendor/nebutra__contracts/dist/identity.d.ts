import { z } from 'zod';

declare const AuthProviderSchema: z.ZodEnum<{
    custom: "custom";
    clerk: "clerk";
    authjs: "authjs";
    nebutra: "nebutra";
}>;
type AuthProvider = z.infer<typeof AuthProviderSchema>;
declare const CanonicalRoleSchema: z.ZodEnum<{
    OWNER: "OWNER";
    ADMIN: "ADMIN";
    MEMBER: "MEMBER";
    VIEWER: "VIEWER";
}>;
type CanonicalRole = z.infer<typeof CanonicalRoleSchema>;
declare const CanonicalPlanSchema: z.ZodEnum<{
    FREE: "FREE";
    PRO: "PRO";
    ENTERPRISE: "ENTERPRISE";
}>;
type CanonicalPlan = z.infer<typeof CanonicalPlanSchema>;
declare const CanonicalIdentitySchema: z.ZodObject<{
    provider: z.ZodEnum<{
        custom: "custom";
        clerk: "clerk";
        authjs: "authjs";
        nebutra: "nebutra";
    }>;
    userId: z.ZodString;
    organizationId: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<{
        OWNER: "OWNER";
        ADMIN: "ADMIN";
        MEMBER: "MEMBER";
        VIEWER: "VIEWER";
    }>>;
    plan: z.ZodOptional<z.ZodEnum<{
        FREE: "FREE";
        PRO: "PRO";
        ENTERPRISE: "ENTERPRISE";
    }>>;
    email: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodOptional<z.ZodString>;
    claimsVersion: z.ZodDefault<z.ZodLiteral<"v1">>;
}, z.core.$strip>;
type CanonicalIdentity = z.infer<typeof CanonicalIdentitySchema>;
declare const ExternalAccountLinkSchema: z.ZodObject<{
    provider: z.ZodEnum<{
        custom: "custom";
        clerk: "clerk";
        authjs: "authjs";
        nebutra: "nebutra";
    }>;
    providerUserId: z.ZodString;
    internalUserId: z.ZodString;
    linkedAt: z.ZodCoercedDate<unknown>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
type ExternalAccountLink = z.infer<typeof ExternalAccountLinkSchema>;
declare const TenantHeaderContractSchema: z.ZodObject<{
    "x-user-id": z.ZodOptional<z.ZodString>;
    "x-organization-id": z.ZodOptional<z.ZodString>;
    "x-role": z.ZodOptional<z.ZodString>;
    "x-plan": z.ZodOptional<z.ZodEnum<{
        FREE: "FREE";
        PRO: "PRO";
        ENTERPRISE: "ENTERPRISE";
    }>>;
}, z.core.$strip>;
type TenantHeaderContract = z.infer<typeof TenantHeaderContractSchema>;
declare const NebutraOAuthScopeSchema: z.ZodEnum<{
    email: "email";
    openid: "openid";
    profile: "profile";
    "organization:read": "organization:read";
    "organization:write": "organization:write";
    "content:read": "content:read";
    "content:write": "content:write";
    "billing:read": "billing:read";
}>;
type NebutraOAuthScope = z.infer<typeof NebutraOAuthScopeSchema>;
declare const OAuthClientTypeSchema: z.ZodEnum<{
    CONFIDENTIAL: "CONFIDENTIAL";
    PUBLIC: "PUBLIC";
}>;
type OAuthClientType = z.infer<typeof OAuthClientTypeSchema>;
declare const OAuthClientRegistrationSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodDefault<z.ZodEnum<{
        CONFIDENTIAL: "CONFIDENTIAL";
        PUBLIC: "PUBLIC";
    }>>;
    redirectUris: z.ZodArray<z.ZodString>;
    allowedScopes: z.ZodDefault<z.ZodArray<z.ZodEnum<{
        email: "email";
        openid: "openid";
        profile: "profile";
        "organization:read": "organization:read";
        "organization:write": "organization:write";
        "content:read": "content:read";
        "content:write": "content:write";
        "billing:read": "billing:read";
    }>>>;
    websiteUrl: z.ZodOptional<z.ZodString>;
    logoUrl: z.ZodOptional<z.ZodString>;
    privacyPolicyUrl: z.ZodOptional<z.ZodString>;
    tosUrl: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
type OAuthClientRegistration = z.infer<typeof OAuthClientRegistrationSchema>;

export { type AuthProvider, AuthProviderSchema, type CanonicalIdentity, CanonicalIdentitySchema, type CanonicalPlan, CanonicalPlanSchema, type CanonicalRole, CanonicalRoleSchema, type ExternalAccountLink, ExternalAccountLinkSchema, type NebutraOAuthScope, NebutraOAuthScopeSchema, type OAuthClientRegistration, OAuthClientRegistrationSchema, type OAuthClientType, OAuthClientTypeSchema, type TenantHeaderContract, TenantHeaderContractSchema };
