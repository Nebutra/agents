// src/market.ts
var MARKET_ENV_KEYS = [
  "NEBUTRA_LOCALE",
  "NEXT_PUBLIC_NEBUTRA_LOCALE",
  "NEBUTRA_REGION",
  "NEXT_PUBLIC_REGION"
];
var REGIONS = ["cn-mainland", "cn-hk-mo-tw", "overseas", "unknown"];
function parseMarket(value) {
  if (!value) return void 0;
  const v = value.toLowerCase().trim();
  if (!v) return void 0;
  if (REGIONS.includes(v) && v !== "unknown") return v;
  if (v === "cn" || v === "china" || v === "mainland" || v === "zh-cn") return "cn-mainland";
  if (["hk", "mo", "tw", "hkt", "hkmotw"].includes(v)) return "cn-hk-mo-tw";
  if (["global", "intl", "us", "eu", "world", "overseas"].includes(v)) return "overseas";
  return void 0;
}
function read(get) {
  try {
    return get();
  } catch {
    return void 0;
  }
}
function processMarketEnv() {
  return {
    NEBUTRA_LOCALE: read(() => process.env.NEBUTRA_LOCALE),
    NEXT_PUBLIC_NEBUTRA_LOCALE: read(() => process.env.NEXT_PUBLIC_NEBUTRA_LOCALE),
    NEBUTRA_REGION: read(() => process.env.NEBUTRA_REGION),
    NEXT_PUBLIC_REGION: read(() => process.env.NEXT_PUBLIC_REGION)
  };
}
function detectMarket(env = processMarketEnv()) {
  for (const key of MARKET_ENV_KEYS) {
    const parsed = parseMarket(env[key]);
    if (parsed) return parsed;
  }
  return "unknown";
}
function isMainlandMarket(env) {
  return detectMarket(env) === "cn-mainland";
}

export {
  MARKET_ENV_KEYS,
  parseMarket,
  detectMarket,
  isMainlandMarket
};
//# sourceMappingURL=chunk-UYIVYKTY.js.map