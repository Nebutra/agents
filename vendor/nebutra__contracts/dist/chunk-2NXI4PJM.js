// src/events.ts
import { z } from "zod";
var EventContextSchema = z.object({
  tenantId: z.string().min(1),
  userId: z.string().min(1).optional(),
  requestId: z.string().min(1).optional(),
  traceId: z.string().min(1).optional(),
  occurredAt: z.coerce.date(),
  contractVersion: z.literal("v1").default("v1")
});
var EventEnvelopeSchema = z.object({
  eventName: z.string().min(1),
  context: EventContextSchema,
  payload: z.record(z.string(), z.unknown())
});

export {
  EventContextSchema,
  EventEnvelopeSchema
};
//# sourceMappingURL=chunk-2NXI4PJM.js.map