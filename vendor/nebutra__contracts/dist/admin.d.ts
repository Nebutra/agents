import { z } from 'zod';

/**
 * Admin Contract — `nebutra.admin/v1`.
 *
 * Every Nebutra SaaS exposes one manifest describing the admin surface it
 * owns: resources (nouns), actions (audited verbs, plan → apply), signals
 * (probed facts) and policies (actions the system runs by itself). The
 * platform admin renders any product from its manifest; an agent derives
 * tools from it. Nothing product-specific lives in the renderer.
 *
 * See docs/plans/2026-09-08-admin-of-admins-model.md.
 */
declare const ADMIN_CONTRACT_VERSION: "nebutra.admin/v1";
/** One status vocabulary. `unknown` is first-class and never renders green. */
declare const AdminStatusSchema: z.ZodEnum<{
    healthy: "healthy";
    degraded: "degraded";
    down: "down";
    unknown: "unknown";
}>;
type AdminStatus = z.infer<typeof AdminStatusSchema>;
/** One role ladder; product roles map onto it, staff grants mean the same everywhere. */
declare const StaffRoleSchema: z.ZodEnum<{
    platform_readonly: "platform_readonly";
    platform_support: "platform_support";
    platform_operator: "platform_operator";
    platform_owner: "platform_owner";
}>;
type StaffRole = z.infer<typeof StaffRoleSchema>;
declare const STAFF_ROLE_RANK: Record<StaffRole, number>;
declare function roleAtLeast(role: StaffRole, required: StaffRole): boolean;
declare const AdminSeveritySchema: z.ZodEnum<{
    info: "info";
    warn: "warn";
    critical: "critical";
}>;
type AdminSeverity = z.infer<typeof AdminSeveritySchema>;
/** The canonical eleven. A product declares the subset it has. */
declare const AdminDomainIdSchema: z.ZodEnum<{
    identity: "identity";
    access: "access";
    commerce: "commerce";
    usage: "usage";
    catalog: "catalog";
    operations: "operations";
    integrations: "integrations";
    trust: "trust";
    support: "support";
    growth: "growth";
    settings: "settings";
    supply: "supply";
}>;
type AdminDomainId = z.infer<typeof AdminDomainIdSchema>;
declare const AdminColumnSchema: z.ZodObject<{
    key: z.ZodString;
    label: z.ZodString;
    kind: z.ZodDefault<z.ZodEnum<{
        number: "number";
        text: "text";
        mono: "mono";
        status: "status";
        badge: "badge";
        time: "time";
        link: "link";
    }>>;
    align: z.ZodDefault<z.ZodEnum<{
        start: "start";
        end: "end";
    }>>;
}, z.core.$strip>;
type AdminColumn = z.infer<typeof AdminColumnSchema>;
declare const AdminResourceSchema: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    list: z.ZodString;
    detail: z.ZodOptional<z.ZodString>;
    columns: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        label: z.ZodString;
        kind: z.ZodDefault<z.ZodEnum<{
            number: "number";
            text: "text";
            mono: "mono";
            status: "status";
            badge: "badge";
            time: "time";
            link: "link";
        }>>;
        align: z.ZodDefault<z.ZodEnum<{
            start: "start";
            end: "end";
        }>>;
    }, z.core.$strip>>;
    key: z.ZodDefault<z.ZodString>;
    search: z.ZodDefault<z.ZodBoolean>;
    actions: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
type AdminResource = z.infer<typeof AdminResourceSchema>;
declare const AdminActionSchema: z.ZodObject<{
    id: z.ZodString;
    verb: z.ZodString;
    resource: z.ZodOptional<z.ZodString>;
    role: z.ZodEnum<{
        platform_readonly: "platform_readonly";
        platform_support: "platform_support";
        platform_operator: "platform_operator";
        platform_owner: "platform_owner";
    }>;
    url: z.ZodString;
    plan: z.ZodDefault<z.ZodBoolean>;
    destructive: z.ZodDefault<z.ZodBoolean>;
    input: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
type AdminAction = z.infer<typeof AdminActionSchema>;
declare const AdminSignalSchema: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    severity: z.ZodEnum<{
        info: "info";
        warn: "warn";
        critical: "critical";
    }>;
    probe: z.ZodString;
    resource: z.ZodOptional<z.ZodString>;
    action: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
type AdminSignal = z.infer<typeof AdminSignalSchema>;
declare const AdminPolicySchema: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    on: z.ZodString;
    runs: z.ZodString;
    enabled: z.ZodDefault<z.ZodBoolean>;
    intent: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
type AdminPolicy = z.infer<typeof AdminPolicySchema>;
declare const AdminDomainSchema: z.ZodObject<{
    id: z.ZodEnum<{
        identity: "identity";
        access: "access";
        commerce: "commerce";
        usage: "usage";
        catalog: "catalog";
        operations: "operations";
        integrations: "integrations";
        trust: "trust";
        support: "support";
        growth: "growth";
        settings: "settings";
        supply: "supply";
    }>;
    label: z.ZodString;
    resources: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        list: z.ZodString;
        detail: z.ZodOptional<z.ZodString>;
        columns: z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            label: z.ZodString;
            kind: z.ZodDefault<z.ZodEnum<{
                number: "number";
                text: "text";
                mono: "mono";
                status: "status";
                badge: "badge";
                time: "time";
                link: "link";
            }>>;
            align: z.ZodDefault<z.ZodEnum<{
                start: "start";
                end: "end";
            }>>;
        }, z.core.$strip>>;
        key: z.ZodDefault<z.ZodString>;
        search: z.ZodDefault<z.ZodBoolean>;
        actions: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>>;
    actions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        verb: z.ZodString;
        resource: z.ZodOptional<z.ZodString>;
        role: z.ZodEnum<{
            platform_readonly: "platform_readonly";
            platform_support: "platform_support";
            platform_operator: "platform_operator";
            platform_owner: "platform_owner";
        }>;
        url: z.ZodString;
        plan: z.ZodDefault<z.ZodBoolean>;
        destructive: z.ZodDefault<z.ZodBoolean>;
        input: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        description: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    signals: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        severity: z.ZodEnum<{
            info: "info";
            warn: "warn";
            critical: "critical";
        }>;
        probe: z.ZodString;
        resource: z.ZodOptional<z.ZodString>;
        action: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    policies: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        on: z.ZodString;
        runs: z.ZodString;
        enabled: z.ZodDefault<z.ZodBoolean>;
        intent: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    slot: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
type AdminDomain = z.infer<typeof AdminDomainSchema>;
declare const AdminManifestSchema: z.ZodObject<{
    contract: z.ZodLiteral<"nebutra.admin/v1">;
    product: z.ZodString;
    label: z.ZodString;
    version: z.ZodString;
    origin: z.ZodString;
    graph: z.ZodEnum<{
        core: "core";
        runtime: "runtime";
        labs: "labs";
    }>;
    status: z.ZodEnum<{
        stable: "stable";
        foundation: "foundation";
        wip: "wip";
        experimental: "experimental";
    }>;
    health: z.ZodString;
    audit: z.ZodOptional<z.ZodString>;
    domains: z.ZodArray<z.ZodObject<{
        id: z.ZodEnum<{
            identity: "identity";
            access: "access";
            commerce: "commerce";
            usage: "usage";
            catalog: "catalog";
            operations: "operations";
            integrations: "integrations";
            trust: "trust";
            support: "support";
            growth: "growth";
            settings: "settings";
            supply: "supply";
        }>;
        label: z.ZodString;
        resources: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            list: z.ZodString;
            detail: z.ZodOptional<z.ZodString>;
            columns: z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                label: z.ZodString;
                kind: z.ZodDefault<z.ZodEnum<{
                    number: "number";
                    text: "text";
                    mono: "mono";
                    status: "status";
                    badge: "badge";
                    time: "time";
                    link: "link";
                }>>;
                align: z.ZodDefault<z.ZodEnum<{
                    start: "start";
                    end: "end";
                }>>;
            }, z.core.$strip>>;
            key: z.ZodDefault<z.ZodString>;
            search: z.ZodDefault<z.ZodBoolean>;
            actions: z.ZodDefault<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>>;
        actions: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            verb: z.ZodString;
            resource: z.ZodOptional<z.ZodString>;
            role: z.ZodEnum<{
                platform_readonly: "platform_readonly";
                platform_support: "platform_support";
                platform_operator: "platform_operator";
                platform_owner: "platform_owner";
            }>;
            url: z.ZodString;
            plan: z.ZodDefault<z.ZodBoolean>;
            destructive: z.ZodDefault<z.ZodBoolean>;
            input: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            description: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
        signals: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            severity: z.ZodEnum<{
                info: "info";
                warn: "warn";
                critical: "critical";
            }>;
            probe: z.ZodString;
            resource: z.ZodOptional<z.ZodString>;
            action: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
        policies: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            on: z.ZodString;
            runs: z.ZodString;
            enabled: z.ZodDefault<z.ZodBoolean>;
            intent: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
        slot: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
type AdminManifest = z.infer<typeof AdminManifestSchema>;
declare const ResourceListSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    total: z.ZodNumber;
    probedAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
type ResourceList = z.infer<typeof ResourceListSchema>;
declare const ActionRequestSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    mode: z.ZodLiteral<"plan">;
    input: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>, z.ZodObject<{
    mode: z.ZodLiteral<"apply">;
    input: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    planId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>], "mode">;
type ActionRequest = z.infer<typeof ActionRequestSchema>;
declare const PlanDiffEntrySchema: z.ZodObject<{
    op: z.ZodEnum<{
        add: "add";
        remove: "remove";
        change: "change";
    }>;
    path: z.ZodString;
    from: z.ZodOptional<z.ZodUnknown>;
    to: z.ZodOptional<z.ZodUnknown>;
}, z.core.$strip>;
declare const ActionPlanSchema: z.ZodObject<{
    planId: z.ZodString;
    summary: z.ZodString;
    diff: z.ZodArray<z.ZodObject<{
        op: z.ZodEnum<{
            add: "add";
            remove: "remove";
            change: "change";
        }>;
        path: z.ZodString;
        from: z.ZodOptional<z.ZodUnknown>;
        to: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>>;
    affected: z.ZodDefault<z.ZodArray<z.ZodObject<{
        resource: z.ZodString;
        id: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    warnings: z.ZodDefault<z.ZodArray<z.ZodString>>;
    expiresAt: z.ZodString;
}, z.core.$strip>;
type ActionPlan = z.infer<typeof ActionPlanSchema>;
declare const ActionResultSchema: z.ZodObject<{
    auditId: z.ZodString;
    summary: z.ZodString;
    result: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
type ActionResult = z.infer<typeof ActionResultSchema>;
declare const SignalReadingSchema: z.ZodObject<{
    id: z.ZodString;
    status: z.ZodEnum<{
        unknown: "unknown";
        ok: "ok";
        raised: "raised";
    }>;
    severity: z.ZodEnum<{
        info: "info";
        warn: "warn";
        critical: "critical";
    }>;
    probedAt: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    detail: z.ZodOptional<z.ZodString>;
    resource: z.ZodOptional<z.ZodString>;
    action: z.ZodOptional<z.ZodString>;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
type SignalReading = z.infer<typeof SignalReadingSchema>;
/** Standard error body for contract endpoints. */
declare const AdminErrorSchema: z.ZodObject<{
    error: z.ZodObject<{
        code: z.ZodEnum<{
            unauthenticated: "unauthenticated";
            forbidden: "forbidden";
            not_found: "not_found";
            invalid_input: "invalid_input";
            plan_required: "plan_required";
            plan_expired: "plan_expired";
            upstream_unavailable: "upstream_unavailable";
            internal: "internal";
        }>;
        message: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
type AdminError = z.infer<typeof AdminErrorSchema>;
/** Validate an apply against its action: destructive applies must reference a plan. */
declare function assertApplyAllowed(action: AdminAction, request: ActionRequest): AdminError | null;
/** Resolve a contract path against the manifest origin. */
declare function resolveContractUrl(manifest: Pick<AdminManifest, "origin">, path: string): string;
/**
 * The HTTP status an admin error travels as.
 *
 * Cloudflare sits in front of every admin and product host, and it replaces an
 * origin's `502` or `504` with its own branded HTML error page. The body we
 * wrote — the code and the message the operator needs — is discarded before the
 * browser sees it, so the console can only report `network · HTTP 502`. A
 * contract endpoint therefore never answers with a gateway status: an upstream
 * that failed is `503`, and a fault of our own is `500`. Both reach the client
 * with their JSON envelope intact.
 */
declare const ADMIN_ERROR_STATUS: Record<AdminError["error"]["code"], number>;
/**
 * Narrow an arbitrary status to one that survives the CDN, preserving anything
 * already safe. Use it when echoing an upstream contract call's status.
 */
declare function cdnSafeStatus(status: number | undefined, fallback?: number): number;

export { ADMIN_CONTRACT_VERSION, ADMIN_ERROR_STATUS, type ActionPlan, ActionPlanSchema, type ActionRequest, ActionRequestSchema, type ActionResult, ActionResultSchema, type AdminAction, AdminActionSchema, type AdminColumn, AdminColumnSchema, type AdminDomain, type AdminDomainId, AdminDomainIdSchema, AdminDomainSchema, type AdminError, AdminErrorSchema, type AdminManifest, AdminManifestSchema, type AdminPolicy, AdminPolicySchema, type AdminResource, AdminResourceSchema, type AdminSeverity, AdminSeveritySchema, type AdminSignal, AdminSignalSchema, type AdminStatus, AdminStatusSchema, PlanDiffEntrySchema, type ResourceList, ResourceListSchema, STAFF_ROLE_RANK, type SignalReading, SignalReadingSchema, type StaffRole, StaffRoleSchema, assertApplyAllowed, cdnSafeStatus, resolveContractUrl, roleAtLeast };
