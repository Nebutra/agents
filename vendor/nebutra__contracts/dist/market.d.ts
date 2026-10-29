/**
 * Market — which legal market a deployment serves, read from env.
 *
 * The one switch for mainland-China surfaces (CLAUDE.md, ADR 2026-09-24 §3):
 *
 *   NEBUTRA_LOCALE=cn
 *
 * Server code reads `NEBUTRA_LOCALE`. Client bundles cannot see a non-public
 * variable, so the apps mirror it to `NEXT_PUBLIC_NEBUTRA_LOCALE` in their
 * `next.config.ts` (`env`), and this module reads that name as a literal so
 * Next inlines it. The older names stay as aliases: `NEBUTRA_REGION` and
 * `NEXT_PUBLIC_REGION`.
 *
 * Precedence: NEBUTRA_LOCALE → NEXT_PUBLIC_NEBUTRA_LOCALE → NEBUTRA_REGION →
 * NEXT_PUBLIC_REGION. The first one that parses wins; an unparseable value is
 * skipped rather than read as "global".
 *
 * Pure: no fetch, no geo-IP, no `navigator`. Safe on server, client and tests.
 */
type MarketRegion = "cn-mainland" | "cn-hk-mo-tw" | "overseas" | "unknown";
/** The env names, in precedence order. */
declare const MARKET_ENV_KEYS: readonly ["NEBUTRA_LOCALE", "NEXT_PUBLIC_NEBUTRA_LOCALE", "NEBUTRA_REGION", "NEXT_PUBLIC_REGION"];
type MarketEnv = Partial<Record<(typeof MARKET_ENV_KEYS)[number], string | undefined>>;
/** Parse one value; `undefined` when it names no market. */
declare function parseMarket(value: string | undefined): MarketRegion | undefined;
/** The market this deployment serves. `"unknown"` when nothing is set. */
declare function detectMarket(env?: MarketEnv): MarketRegion;
/** `true` for mainland China only; HK/MO/TW has different rails and rules. */
declare function isMainlandMarket(env?: MarketEnv): boolean;

export { MARKET_ENV_KEYS, type MarketEnv, type MarketRegion, detectMarket, isMainlandMarket, parseMarket };
