// src/admin.ts
import { z } from "zod";
var ADMIN_CONTRACT_VERSION = "nebutra.admin/v1";
var AdminStatusSchema = z.enum(["healthy", "degraded", "down", "unknown"]);
var StaffRoleSchema = z.enum([
  "platform_readonly",
  "platform_support",
  "platform_operator",
  "platform_owner"
]);
var STAFF_ROLE_RANK = {
  platform_readonly: 0,
  platform_support: 1,
  platform_operator: 2,
  platform_owner: 3
};
function roleAtLeast(role, required) {
  return STAFF_ROLE_RANK[role] >= STAFF_ROLE_RANK[required];
}
var AdminSeveritySchema = z.enum(["info", "warn", "critical"]);
var AdminDomainIdSchema = z.enum([
  "identity",
  "access",
  "commerce",
  "usage",
  "catalog",
  "operations",
  "integrations",
  "trust",
  "support",
  "growth",
  "settings",
  // Platform-only cross-cutting domain: shared AI supply (router).
  "supply"
]);
var IdSchema = z.string().min(1).max(64).regex(/^[a-z][a-z0-9._-]*$/, "ids are lowercase dotted identifiers");
var UrlPathSchema = z.string().min(1).regex(/^\//, "contract urls are origin-relative paths");
var AdminColumnSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  kind: z.enum(["text", "mono", "status", "badge", "number", "time", "link"]).default("text"),
  /** Right-align numbers; the renderer does not guess from values. */
  align: z.enum(["start", "end"]).default("start")
});
var AdminResourceSchema = z.object({
  id: IdSchema,
  label: z.string().min(1),
  /** `GET list` → ResourceList */
  list: UrlPathSchema,
  /** `GET detail` with `{id}` placeholder → one item */
  detail: UrlPathSchema.optional(),
  columns: z.array(AdminColumnSchema).min(1),
  /** Column key that identifies a row. */
  key: z.string().min(1).default("id"),
  search: z.boolean().default(false),
  /** Action ids applicable per row. */
  actions: z.array(IdSchema).default([])
});
var AdminActionSchema = z.object({
  id: IdSchema,
  verb: z.string().min(1),
  /** Resource the action belongs to; omitted = domain-level action. */
  resource: IdSchema.optional(),
  /** Minimum staff role. Read-only tier never sees write controls. */
  role: StaffRoleSchema,
  /** `POST url` with ActionRequest (`mode: plan | apply`). */
  url: UrlPathSchema,
  /** Plan step is mandatory; `false` only for idempotent, non-destructive refreshes. */
  plan: z.boolean().default(true),
  destructive: z.boolean().default(false),
  /** JSON Schema for `input`; doubles as the MCP tool inputSchema. */
  input: z.record(z.string(), z.unknown()).optional(),
  description: z.string().optional()
});
var AdminSignalSchema = z.object({
  id: IdSchema,
  label: z.string().min(1),
  severity: AdminSeveritySchema,
  /** `GET probe` → SignalReading. Probed, never configured. */
  probe: UrlPathSchema,
  resource: IdSchema.optional(),
  /** Action that resolves the signal when raised. */
  action: IdSchema.optional()
});
var AdminPolicySchema = z.object({
  id: IdSchema,
  label: z.string().min(1),
  /** Event name (`nebutra/<domain>.<thing>.<verb>`) that triggers the policy. */
  on: z.string().min(1),
  runs: IdSchema,
  enabled: z.boolean().default(true),
  /** Natural-language intent the policy was compiled from, when it was. */
  intent: z.string().optional()
});
var AdminDomainSchema = z.object({
  id: AdminDomainIdSchema,
  label: z.string().min(1),
  resources: z.array(AdminResourceSchema).default([]),
  actions: z.array(AdminActionSchema).default([]),
  signals: z.array(AdminSignalSchema).default([]),
  policies: z.array(AdminPolicySchema).default([]),
  /** Product-owned browser surface for what the generic renderer cannot express. */
  slot: UrlPathSchema.optional()
});
var AdminManifestSchema = z.object({
  contract: z.literal(ADMIN_CONTRACT_VERSION),
  product: IdSchema,
  label: z.string().min(1),
  version: z.string().min(1),
  /** Absolute origin every relative url resolves against. */
  origin: z.string().url(),
  graph: z.enum(["core", "runtime", "labs"]),
  status: z.enum(["stable", "foundation", "wip", "experimental"]),
  /** `GET health` → @nebutra/health HealthCheckResult. */
  health: UrlPathSchema,
  /** `GET audit?…` → audit events (nebutra.audit/v1). */
  audit: UrlPathSchema.optional(),
  domains: z.array(AdminDomainSchema).min(1)
}).superRefine((m, ctx) => {
  for (const d of m.domains) {
    const actionIds = new Set(d.actions.map((a) => a.id));
    const resourceIds = new Set(d.resources.map((r) => r.id));
    for (const r of d.resources) {
      for (const a of r.actions) {
        if (!actionIds.has(a)) {
          ctx.addIssue({
            code: "custom",
            message: `resource ${r.id} references unknown action ${a}`
          });
        }
      }
    }
    for (const s of d.signals) {
      if (s.action && !actionIds.has(s.action)) {
        ctx.addIssue({
          code: "custom",
          message: `signal ${s.id} references unknown action ${s.action}`
        });
      }
      if (s.resource && !resourceIds.has(s.resource)) {
        ctx.addIssue({
          code: "custom",
          message: `signal ${s.id} references unknown resource ${s.resource}`
        });
      }
    }
    for (const p of d.policies) {
      if (!actionIds.has(p.runs)) {
        ctx.addIssue({ code: "custom", message: `policy ${p.id} runs unknown action ${p.runs}` });
      }
    }
  }
});
var ResourceListSchema = z.object({
  items: z.array(z.record(z.string(), z.unknown())),
  total: z.number().int().min(0),
  /** When the list was produced from live probes; omitted for pure reads. */
  probedAt: z.string().datetime().optional()
});
var ActionRequestSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("plan"), input: z.record(z.string(), z.unknown()).default({}) }),
  z.object({
    mode: z.literal("apply"),
    input: z.record(z.string(), z.unknown()).default({}),
    /** Required when the action is destructive; ties the apply to a reviewed plan. */
    planId: z.string().min(1).optional()
  })
]);
var PlanDiffEntrySchema = z.object({
  op: z.enum(["add", "remove", "change"]),
  path: z.string().min(1),
  from: z.unknown().optional(),
  to: z.unknown().optional()
});
var ActionPlanSchema = z.object({
  planId: z.string().min(1),
  summary: z.string().min(1),
  diff: z.array(PlanDiffEntrySchema),
  affected: z.array(z.object({ resource: IdSchema, id: z.string(), label: z.string().optional() })).default([]),
  warnings: z.array(z.string()).default([]),
  /** Plans expire; an apply after this is refused. */
  expiresAt: z.string().datetime()
});
var ActionResultSchema = z.object({
  /** Audit event id written by the product for this apply. */
  auditId: z.string().min(1),
  summary: z.string().min(1),
  result: z.record(z.string(), z.unknown()).optional()
});
var SignalReadingSchema = z.object({
  id: IdSchema,
  status: z.enum(["ok", "raised", "unknown"]),
  severity: AdminSeveritySchema,
  probedAt: z.string().datetime(),
  title: z.string().optional(),
  detail: z.string().optional(),
  resource: IdSchema.optional(),
  action: IdSchema.optional(),
  data: z.record(z.string(), z.unknown()).optional()
});
var AdminErrorSchema = z.object({
  error: z.object({
    code: z.enum([
      "unauthenticated",
      "forbidden",
      "not_found",
      "invalid_input",
      "plan_required",
      "plan_expired",
      "upstream_unavailable",
      "internal"
    ]),
    message: z.string()
  })
});
function assertApplyAllowed(action, request) {
  if (request.mode !== "apply") return null;
  if ((action.destructive || action.plan) && !request.planId) {
    return {
      error: {
        code: "plan_required",
        message: `${action.id} requires a reviewed plan before apply`
      }
    };
  }
  return null;
}
function resolveContractUrl(manifest, path) {
  return new URL(path, manifest.origin).toString();
}
var ADMIN_ERROR_STATUS = {
  unauthenticated: 401,
  forbidden: 403,
  not_found: 404,
  invalid_input: 400,
  plan_required: 409,
  plan_expired: 409,
  upstream_unavailable: 503,
  internal: 500
};
function cdnSafeStatus(status, fallback = 503) {
  if (!status || status === 502 || status === 504 || status < 400 || status > 599) return fallback;
  return status;
}

export {
  ADMIN_CONTRACT_VERSION,
  AdminStatusSchema,
  StaffRoleSchema,
  STAFF_ROLE_RANK,
  roleAtLeast,
  AdminSeveritySchema,
  AdminDomainIdSchema,
  AdminColumnSchema,
  AdminResourceSchema,
  AdminActionSchema,
  AdminSignalSchema,
  AdminPolicySchema,
  AdminDomainSchema,
  AdminManifestSchema,
  ResourceListSchema,
  ActionRequestSchema,
  PlanDiffEntrySchema,
  ActionPlanSchema,
  ActionResultSchema,
  SignalReadingSchema,
  AdminErrorSchema,
  assertApplyAllowed,
  resolveContractUrl,
  ADMIN_ERROR_STATUS,
  cdnSafeStatus
};
//# sourceMappingURL=chunk-G65TWQGE.js.map