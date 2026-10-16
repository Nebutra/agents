// src/prices/index.ts
var PARA_CREDITS_PER_OUTPUT = {
  image: 10,
  text: 1,
  video: 65,
  audio: 20
};
var span = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
var PARA_VIDEO_MODELS = {
  "wan-2.7": {
    id: "wan-2.7",
    label: "Wan 2.7",
    status: "available",
    durations: span(2, 15),
    defaultDuration: 5,
    resolutions: ["720P", "1080P"],
    defaultResolution: "720P",
    // Bailian list price (model market, wan2.7-t2v / wan2.7-i2v, read 2026-09-28): 0.6 CNY/s
    // at 720P, 1.0 CNY/s at 1080P → ≈ USD 0.084 / 0.141 per second at 7.1 CNY/USD.
    creditsPerSecond: { "720P": 13, "1080P": 21 }
  },
  "seedance-2.5": {
    id: "seedance-2.5",
    label: "Seedance 2.5",
    status: "planned",
    durations: span(4, 30),
    defaultDuration: 5,
    resolutions: ["480P", "720P"],
    defaultResolution: "720P",
    creditsPerSecond: null
  },
  "kling-3": {
    id: "kling-3",
    label: "Kling 3.0",
    status: "planned",
    durations: span(3, 15),
    defaultDuration: 5,
    resolutions: ["1080P"],
    defaultResolution: "1080P",
    creditsPerSecond: null
  },
  "veo-3.1": {
    id: "veo-3.1",
    label: "Veo 3.1",
    status: "planned",
    durations: [4, 6, 8],
    defaultDuration: 6,
    resolutions: ["720P", "1080P"],
    defaultResolution: "720P",
    creditsPerSecond: null
  },
  "minimax-h3": {
    id: "minimax-h3",
    label: "MiniMax H3",
    status: "planned",
    durations: span(5, 15),
    defaultDuration: 5,
    resolutions: ["480P", "720P", "1080P"],
    defaultResolution: "720P",
    creditsPerSecond: null
  }
};
var PARA_VIDEO_AUTO_ORDER = [
  "seedance-2.5",
  "kling-3",
  "veo-3.1",
  "minimax-h3",
  "wan-2.7"
];
var PARA_VIDEO_FALLBACK_CREDITS_PER_SECOND = 20;
function parseDurationSeconds(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (text.length > 16) return null;
  const match = /^(\d+(?:\.\d+)?) ?s?$/i.exec(text);
  return match ? Number(match[1]) : null;
}
function snap(allowed, seconds) {
  let best = allowed[0];
  for (const d of allowed) {
    const delta = Math.abs(d - seconds);
    const bestDelta = Math.abs(best - seconds);
    if (delta < bestDelta || delta === bestDelta && d > best) best = d;
  }
  return best;
}
function normalizeResolution(model, value) {
  let text = typeof value === "string" ? value.trim().toUpperCase() : "";
  if (text && !text.endsWith("P")) text = `${text}P`;
  return model.resolutions.includes(text) ? text : model.defaultResolution;
}
function paraVideoAutoModel() {
  for (const id of PARA_VIDEO_AUTO_ORDER) {
    const model = PARA_VIDEO_MODELS[id];
    if (model?.status === "available" && model.creditsPerSecond) return model;
  }
  return null;
}
function paraVideoQuote(input = {}) {
  const model = input.model === void 0 || input.model === "" || input.model === "Auto" ? paraVideoAutoModel() : PARA_VIDEO_MODELS[input.model] ?? null;
  if (!model || model.status !== "available" || !model.creditsPerSecond) return null;
  const resolution = normalizeResolution(model, input.resolution);
  const rate = model.creditsPerSecond[resolution];
  if (rate === void 0) return null;
  const parsed = parseDurationSeconds(input.durationSeconds);
  return {
    model,
    durationSeconds: parsed === null ? model.defaultDuration : snap(model.durations, parsed),
    resolution,
    creditsPerSecond: rate
  };
}
function paraGenerationCredits(mode, count = 1, opts = {}) {
  if (mode !== "video") return PARA_CREDITS_PER_OUTPUT[mode] * count;
  const quote = paraVideoQuote(opts);
  if (quote) return quote.creditsPerSecond * quote.durationSeconds * count;
  const seconds = parseDurationSeconds(opts.durationSeconds);
  const clamped = seconds === null ? 5 : Math.max(1, Math.round(seconds));
  return PARA_VIDEO_FALLBACK_CREDITS_PER_SECOND * clamped * count;
}
export {
  PARA_CREDITS_PER_OUTPUT,
  PARA_VIDEO_AUTO_ORDER,
  PARA_VIDEO_FALLBACK_CREDITS_PER_SECOND,
  PARA_VIDEO_MODELS,
  paraGenerationCredits,
  paraVideoAutoModel,
  paraVideoQuote,
  parseDurationSeconds
};
//# sourceMappingURL=index.js.map