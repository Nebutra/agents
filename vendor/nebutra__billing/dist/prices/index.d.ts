type ParaGenerationMode = "image" | "text" | "video" | "audio";
/**
 * Para credits sell at 1,000 for USD 9.99 (ops/nebutra/offers.json): one credit is about
 * a cent, an image USD 0.10. Video is priced per second per model (PARA_VIDEO_MODELS);
 * its entry here is one default clip of the default model (Wan 2.7, 720P, 5 s × 13), for
 * callers that only know the mode.
 */
declare const PARA_CREDITS_PER_OUTPUT: Readonly<Record<ParaGenerationMode, number>>;
type ParaVideoResolution = "480P" | "720P" | "1080P";
interface ParaVideoModelPrice {
    id: string;
    label: string;
    /** `planned` models are shown as coming soon and are never charged or run. */
    status: "available" | "planned";
    /** Whole seconds the model accepts. A request snaps to the nearest (ties go up). */
    durations: readonly number[];
    defaultDuration: number;
    resolutions: readonly ParaVideoResolution[];
    defaultResolution: ParaVideoResolution;
    /** Credits per second of output at each resolution; null while the model is planned. */
    creditsPerSecond: Readonly<Partial<Record<ParaVideoResolution, number>>> | null;
}
/**
 * Mirrors backends/python/ai/providers/video/registry.py — the origin generates from that
 * table, the gateway charges from this one, and the origin's test suite fails when their
 * durations, resolutions or defaults disagree. Change them together.
 */
declare const PARA_VIDEO_MODELS: Readonly<Record<string, ParaVideoModelPrice>>;
/** "Auto" runs the first available model in this order (same order as the origin's). */
declare const PARA_VIDEO_AUTO_ORDER: readonly string[];
/** Rate a quote falls back to when it cannot name a priced model (unknown id, planned). */
declare const PARA_VIDEO_FALLBACK_CREDITS_PER_SECOND = 20;
/**
 * Parse a duration strictly: a finite number, or a string of digits with an optional
 * fractional part and an optional trailing "s" ("5", "5s", "7.5s"). Anything else is
 * null — the caller then uses the model's default rather than guessing.
 */
declare function parseDurationSeconds(value: unknown): number | null;
/** The model "Auto" means here: the first available, priced model in the auto order. */
declare function paraVideoAutoModel(): ParaVideoModelPrice | null;
interface ParaVideoQuote {
    model: ParaVideoModelPrice;
    durationSeconds: number;
    resolution: ParaVideoResolution;
    creditsPerSecond: number;
}
interface ParaVideoQuoteInput {
    /** PARA model id, or "Auto" / undefined. */
    model?: string | undefined;
    /** Seconds per clip: a number or "5s". Snapped to the model's durations. */
    durationSeconds?: unknown;
    /** "480P" | "720P" | "1080P"; anything else is the model's default. */
    resolution?: unknown;
}
/**
 * What one clip costs per second, with duration and resolution snapped to what the model
 * accepts — exactly what the origin will run. Null when the model is unknown, planned or
 * unpriced: such a job must be refused, not charged.
 */
declare function paraVideoQuote(input?: ParaVideoQuoteInput): ParaVideoQuote | null;
type ParaGenerationOptions = ParaVideoQuoteInput;
/**
 * Credits one Para generation costs: per output, times the outputs asked for. Video is
 * credits per second × seconds × outputs for its model. A model with no price (planned,
 * unknown) quotes at the fallback rate so a screen can still show a number — the gateway
 * refuses those jobs rather than charging them (`paraVideoQuote` → null).
 */
declare function paraGenerationCredits(mode: ParaGenerationMode, count?: number, opts?: ParaGenerationOptions): number;

export { PARA_CREDITS_PER_OUTPUT, PARA_VIDEO_AUTO_ORDER, PARA_VIDEO_FALLBACK_CREDITS_PER_SECOND, PARA_VIDEO_MODELS, type ParaGenerationMode, type ParaGenerationOptions, type ParaVideoModelPrice, type ParaVideoQuote, type ParaVideoQuoteInput, type ParaVideoResolution, paraGenerationCredits, paraVideoAutoModel, paraVideoQuote, parseDurationSeconds };
