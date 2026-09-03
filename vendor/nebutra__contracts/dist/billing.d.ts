import { z } from 'zod';

declare const UsageTypeContractSchema: z.ZodEnum<{
    API_CALL: "API_CALL";
    AI_TOKEN: "AI_TOKEN";
    STORAGE: "STORAGE";
    COMPUTE: "COMPUTE";
    BANDWIDTH: "BANDWIDTH";
    CUSTOM: "CUSTOM";
}>;
type UsageTypeContract = z.infer<typeof UsageTypeContractSchema>;
declare const UsageLedgerSourceContractSchema: z.ZodEnum<{
    API: "API";
    WORKFLOW: "WORKFLOW";
    WEBHOOK: "WEBHOOK";
    SYSTEM: "SYSTEM";
    BACKFILL: "BACKFILL";
}>;
type UsageLedgerSourceContract = z.infer<typeof UsageLedgerSourceContractSchema>;
declare const UsageLedgerEntryInputSchema: z.ZodObject<{
    organizationId: z.ZodString;
    idempotencyKey: z.ZodString;
    eventId: z.ZodOptional<z.ZodString>;
    subscriptionId: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
    source: z.ZodDefault<z.ZodEnum<{
        API: "API";
        WORKFLOW: "WORKFLOW";
        WEBHOOK: "WEBHOOK";
        SYSTEM: "SYSTEM";
        BACKFILL: "BACKFILL";
    }>>;
    type: z.ZodEnum<{
        API_CALL: "API_CALL";
        AI_TOKEN: "AI_TOKEN";
        STORAGE: "STORAGE";
        COMPUTE: "COMPUTE";
        BANDWIDTH: "BANDWIDTH";
        CUSTOM: "CUSTOM";
    }>;
    resource: z.ZodOptional<z.ZodString>;
    quantity: z.ZodNumber;
    unit: z.ZodDefault<z.ZodString>;
    unitCost: z.ZodOptional<z.ZodNumber>;
    totalCost: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodDefault<z.ZodString>;
    occurredAt: z.ZodCoercedDate<unknown>;
    ingestVersion: z.ZodDefault<z.ZodString>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
type UsageLedgerEntryInput = z.infer<typeof UsageLedgerEntryInputSchema>;
declare const PricingCatalogVersionSchema: z.ZodObject<{
    planSlug: z.ZodString;
    version: z.ZodString;
    effectiveFrom: z.ZodCoercedDate<unknown>;
}, z.core.$strip>;
type PricingCatalogVersion = z.infer<typeof PricingCatalogVersionSchema>;

export { type PricingCatalogVersion, PricingCatalogVersionSchema, type UsageLedgerEntryInput, UsageLedgerEntryInputSchema, type UsageLedgerSourceContract, UsageLedgerSourceContractSchema, type UsageTypeContract, UsageTypeContractSchema };
