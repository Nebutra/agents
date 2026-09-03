import { z } from 'zod';

declare const NotificationChannelContractSchema: z.ZodEnum<{
    email: "email";
    in_app: "in_app";
    push: "push";
    sms: "sms";
    chat: "chat";
}>;
type NotificationChannelContract = z.infer<typeof NotificationChannelContractSchema>;
declare const NotificationFrequencyContractSchema: z.ZodEnum<{
    never: "never";
    immediate: "immediate";
    daily: "daily";
    weekly: "weekly";
}>;
type NotificationFrequencyContract = z.infer<typeof NotificationFrequencyContractSchema>;
declare const NotificationRuntimeStatusContractSchema: z.ZodObject<{
    provider: z.ZodEnum<{
        novu: "novu";
        direct: "direct";
    }>;
    providerLabel: z.ZodString;
    mode: z.ZodEnum<{
        managed: "managed";
        self_hosted: "self_hosted";
        preview: "preview";
        degraded: "degraded";
    }>;
    canManagePreferences: z.ZodBoolean;
    canViewInbox: z.ZodBoolean;
    canMarkInboxRead: z.ZodBoolean;
    summary: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
    missing: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
type NotificationRuntimeStatusContract = z.infer<typeof NotificationRuntimeStatusContractSchema>;
declare const NotificationPreferenceContractSchema: z.ZodObject<{
    userId: z.ZodString;
    tenantId: z.ZodOptional<z.ZodString>;
    channel: z.ZodEnum<{
        email: "email";
        in_app: "in_app";
        push: "push";
        sms: "sms";
        chat: "chat";
    }>;
    enabled: z.ZodBoolean;
    disabledCategories: z.ZodOptional<z.ZodArray<z.ZodString>>;
    frequency: z.ZodEnum<{
        never: "never";
        immediate: "immediate";
        daily: "daily";
        weekly: "weekly";
    }>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
type NotificationPreferenceContract = z.infer<typeof NotificationPreferenceContractSchema>;
declare const NotificationItemContractSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    tenantId: z.ZodOptional<z.ZodString>;
    type: z.ZodString;
    title: z.ZodString;
    body: z.ZodString;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    read: z.ZodBoolean;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
type NotificationItemContract = z.infer<typeof NotificationItemContractSchema>;
declare const NotificationListQueryContractSchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    offset: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    unreadOnly: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
}, z.core.$strip>;
type NotificationListQueryContract = z.infer<typeof NotificationListQueryContractSchema>;
declare const NotificationListResponseContractSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        tenantId: z.ZodOptional<z.ZodString>;
        type: z.ZodString;
        title: z.ZodString;
        body: z.ZodString;
        data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        read: z.ZodBoolean;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
    total: z.ZodNumber;
    unreadCount: z.ZodNumber;
}, z.core.$strip>;
type NotificationListResponseContract = z.infer<typeof NotificationListResponseContractSchema>;
declare const NotificationUnreadCountResponseContractSchema: z.ZodObject<{
    count: z.ZodNumber;
}, z.core.$strip>;
type NotificationUnreadCountResponseContract = z.infer<typeof NotificationUnreadCountResponseContractSchema>;
declare const NotificationMarkReadRequestContractSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
type NotificationMarkReadRequestContract = z.infer<typeof NotificationMarkReadRequestContractSchema>;
declare const NotificationMutationCountResponseContractSchema: z.ZodObject<{
    count: z.ZodNumber;
}, z.core.$strip>;
type NotificationMutationCountResponseContract = z.infer<typeof NotificationMutationCountResponseContractSchema>;
declare const NotificationSettingsUpdateRequestContractSchema: z.ZodObject<{
    type: z.ZodString;
    channel: z.ZodEnum<{
        email: "email";
        in_app: "in_app";
        push: "push";
        sms: "sms";
        chat: "chat";
    }>;
    enabled: z.ZodBoolean;
}, z.core.$strip>;
type NotificationSettingsUpdateRequestContract = z.infer<typeof NotificationSettingsUpdateRequestContractSchema>;
declare const NotificationSettingsUpdateResponseContractSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    preference: z.ZodObject<{
        userId: z.ZodString;
        tenantId: z.ZodOptional<z.ZodString>;
        channel: z.ZodEnum<{
            email: "email";
            in_app: "in_app";
            push: "push";
            sms: "sms";
            chat: "chat";
        }>;
        enabled: z.ZodBoolean;
        disabledCategories: z.ZodOptional<z.ZodArray<z.ZodString>>;
        frequency: z.ZodEnum<{
            never: "never";
            immediate: "immediate";
            daily: "daily";
            weekly: "weekly";
        }>;
        updatedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
type NotificationSettingsUpdateResponseContract = z.infer<typeof NotificationSettingsUpdateResponseContractSchema>;

export { type NotificationChannelContract, NotificationChannelContractSchema, type NotificationFrequencyContract, NotificationFrequencyContractSchema, type NotificationItemContract, NotificationItemContractSchema, type NotificationListQueryContract, NotificationListQueryContractSchema, type NotificationListResponseContract, NotificationListResponseContractSchema, type NotificationMarkReadRequestContract, NotificationMarkReadRequestContractSchema, type NotificationMutationCountResponseContract, NotificationMutationCountResponseContractSchema, type NotificationPreferenceContract, NotificationPreferenceContractSchema, type NotificationRuntimeStatusContract, NotificationRuntimeStatusContractSchema, type NotificationSettingsUpdateRequestContract, NotificationSettingsUpdateRequestContractSchema, type NotificationSettingsUpdateResponseContract, NotificationSettingsUpdateResponseContractSchema, type NotificationUnreadCountResponseContract, NotificationUnreadCountResponseContractSchema };
