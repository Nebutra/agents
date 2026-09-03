import { z } from 'zod';

declare const EventContextSchema: z.ZodObject<{
    tenantId: z.ZodString;
    userId: z.ZodOptional<z.ZodString>;
    requestId: z.ZodOptional<z.ZodString>;
    traceId: z.ZodOptional<z.ZodString>;
    occurredAt: z.ZodCoercedDate<unknown>;
    contractVersion: z.ZodDefault<z.ZodLiteral<"v1">>;
}, z.core.$strip>;
type EventContext = z.infer<typeof EventContextSchema>;
declare const EventEnvelopeSchema: z.ZodObject<{
    eventName: z.ZodString;
    context: z.ZodObject<{
        tenantId: z.ZodString;
        userId: z.ZodOptional<z.ZodString>;
        requestId: z.ZodOptional<z.ZodString>;
        traceId: z.ZodOptional<z.ZodString>;
        occurredAt: z.ZodCoercedDate<unknown>;
        contractVersion: z.ZodDefault<z.ZodLiteral<"v1">>;
    }, z.core.$strip>;
    payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, z.core.$strip>;
type EventEnvelope = z.infer<typeof EventEnvelopeSchema>;

export { type EventContext, EventContextSchema, type EventEnvelope, EventEnvelopeSchema };
