import { Redis } from "@upstash/redis";
import { getRedisConfig } from "./env.js";
/**
 * Upstash Redis adapter — wraps the @upstash/redis HTTP client.
 *
 * Upstash already JSON-(de)serializes values automatically, so our wrapper is
 * almost a passthrough. The contract we expose mirrors `@upstash/redis`'s
 * options shape ({ ex, px, nx, xx }) — that was the native shape strategies
 * were written against pre-refactor.
 */
export class UpstashRedisCacheClient {
    client;
    constructor(client) {
        this.client = client ?? new Redis(getRedisConfig());
    }
    async get(key) {
        return (await this.client.get(key)) ?? null;
    }
    async set(key, value, opts) {
        const result = await this.client.set(key, value, opts);
        return result ?? null;
    }
    async del(...keys) {
        if (keys.length === 0)
            return 0;
        return await this.client.del(...keys);
    }
    async ping() {
        return (await this.client.ping()) ?? "PONG";
    }
    async scan(cursor, options) {
        const result = await this.client.scan(cursor, options);
        return [String(result[0]), result[1]];
    }
    async incr(key) {
        return await this.client.incr(key);
    }
    async incrby(key, n) {
        return await this.client.incrby(key, n);
    }
    async expire(key, seconds) {
        return await this.client.expire(key, seconds);
    }
    async eval(script, keys, args) {
        return await this.client.eval(script, keys, args);
    }
}
