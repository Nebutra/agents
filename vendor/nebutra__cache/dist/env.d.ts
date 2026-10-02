export interface RedisConfig {
    url: string;
    token: string;
}
/**
 * Resolve Redis credentials from either the current Upstash REST names or the
 * older generic aliases still present in some deployment templates.
 */
export declare function getRedisConfig(): RedisConfig;
//# sourceMappingURL=env.d.ts.map