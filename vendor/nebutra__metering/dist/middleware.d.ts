import type { MeteringProvider } from "./types";
/**
 * Create a Hono middleware that automatically meters API calls.
 *
 * @example
 * ```ts
 * import { Hono } from "hono";
 * import { getMetering } from "@nebutra/metering";
 * import { meterApiCall } from "@nebutra/metering";
 *
 * const app = new Hono();
 * const metering = await getMetering();
 *
 * app.use("*", meterApiCall("api_calls", metering));
 *
 * app.get("/api/data", (c) => {
 *   return c.json({ ok: true });
 * });
 * ```
 */
export declare function meterApiCall(meterId: string, provider: MeteringProvider): (c: any, next: () => Promise<void>) => Promise<void>;
/**
 * Create a middleware that meters specific operations within handlers.
 *
 * @example
 * ```ts
 * export const recordTokenUsage = meterOperation("ai_tokens");
 *
 * app.post("/api/chat", async (c) => {
 *   const metering = await getMetering();
 *   const tenantId = c.get("tenantId");
 *
 *   const response = await callAI("gpt-5.5", prompt);
 *
 *   await recordTokenUsage(metering, tenantId, response.tokens, {
 *     model: "gpt-5.5",
 *     endpoint: "/api/chat",
 *   });
 *
 *   return c.json(response);
 * });
 * ```
 */
export declare function meterOperation(meterId: string): (provider: MeteringProvider, tenantId: string, value: number, properties?: Record<string, unknown>) => Promise<void>;
/**
 * Helper to create a metering wrapper for async operations.
 *
 * @example
 * ```ts
 * const metering = await getMetering();
 * const withMetering = createMeteringWrapper(metering);
 *
 * // Record a background job
 * await withMetering("job_executed", tenantId, 1, {
 *   job_type: "report_generation",
 *   status: "completed",
 * });
 * ```
 */
export declare function createMeteringWrapper(provider: MeteringProvider): (meterId: string, tenantId: string, value: number, properties?: Record<string, unknown>) => Promise<void>;
//# sourceMappingURL=middleware.d.ts.map