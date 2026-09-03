// src/notifications.ts
import { z } from "zod";
var NotificationChannelContractSchema = z.enum(["in_app", "email", "push", "sms", "chat"]);
var NotificationFrequencyContractSchema = z.enum([
  "immediate",
  "daily",
  "weekly",
  "never"
]);
var NotificationRuntimeStatusContractSchema = z.object({
  provider: z.enum(["novu", "direct"]),
  providerLabel: z.string().min(1),
  mode: z.enum(["managed", "self_hosted", "preview", "degraded"]),
  canManagePreferences: z.boolean(),
  canViewInbox: z.boolean(),
  canMarkInboxRead: z.boolean(),
  summary: z.string().min(1),
  reason: z.string().optional(),
  missing: z.array(z.string())
});
var NotificationPreferenceContractSchema = z.object({
  userId: z.string().min(1),
  tenantId: z.string().min(1).optional(),
  channel: NotificationChannelContractSchema,
  enabled: z.boolean(),
  disabledCategories: z.array(z.string()).optional(),
  frequency: NotificationFrequencyContractSchema,
  updatedAt: z.string().datetime().optional()
});
var NotificationItemContractSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  tenantId: z.string().min(1).optional(),
  type: z.string().min(1),
  title: z.string(),
  body: z.string(),
  data: z.record(z.string(), z.unknown()).optional(),
  read: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});
var NotificationListQueryContractSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  unreadOnly: z.coerce.boolean().optional()
});
var NotificationListResponseContractSchema = z.object({
  items: z.array(NotificationItemContractSchema),
  total: z.number().int().nonnegative(),
  unreadCount: z.number().int().nonnegative()
});
var NotificationUnreadCountResponseContractSchema = z.object({
  count: z.number().int().nonnegative()
});
var NotificationMarkReadRequestContractSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(100)
});
var NotificationMutationCountResponseContractSchema = z.object({
  count: z.number().int().nonnegative()
});
var NotificationSettingsUpdateRequestContractSchema = z.object({
  type: z.string().min(1),
  channel: NotificationChannelContractSchema,
  enabled: z.boolean()
});
var NotificationSettingsUpdateResponseContractSchema = z.object({
  ok: z.literal(true),
  preference: NotificationPreferenceContractSchema
});

export {
  NotificationChannelContractSchema,
  NotificationFrequencyContractSchema,
  NotificationRuntimeStatusContractSchema,
  NotificationPreferenceContractSchema,
  NotificationItemContractSchema,
  NotificationListQueryContractSchema,
  NotificationListResponseContractSchema,
  NotificationUnreadCountResponseContractSchema,
  NotificationMarkReadRequestContractSchema,
  NotificationMutationCountResponseContractSchema,
  NotificationSettingsUpdateRequestContractSchema,
  NotificationSettingsUpdateResponseContractSchema
};
//# sourceMappingURL=chunk-F4BR76CX.js.map