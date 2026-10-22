/**
 * Rate limiting, per /docs/operations/rate-limiting and docs/adr/0011.
 *
 * Counts live in a pluggable store:
 *
 *   - `redis`:  Upstash Redis, so the limit holds across every serverless
 *               instance. Chosen automatically when credentials are set.
 *   - `memory`: per instance. Also the fallback when Redis errors or is
 *               slow, so an outage of the limiter never takes the API down.
 *   - `noop`:   never limits, but still sends the rate-limit headers. The
 *               default without Redis, for local development.
 *
 * `RATE_LIMIT_STORE` forces one of them.
 */

import { Redis } from "@upstash/redis";
import {
  MAX_REQUESTS,
  WINDOW_SECONDS,
  rateLimit as inMemoryRateLimit,
  rateLimitResult,
  type RateLimitResult,
} from "@/lib/api";

export type RateLimitStoreName = "redis" | "memory" | "noop";

export interface RateLimitStore {
  name: RateLimitStoreName;
  limit(key: string): Promise<RateLimitResult>;
}

/** How long to wait for Redis before falling back, in milliseconds. */
const REDIS_TIMEOUT_MS = 1000;

export const memoryStore: RateLimitStore = {
  name: "memory",
  limit: async (key) => inMemoryRateLimit(key),
};

export const noopStore: RateLimitStore = {
  name: "noop",
  limit: async () =>
    rateLimitResult(MAX_REQUESTS, Math.floor(Date.now() / 1000) + WINDOW_SECONDS, false),
};

/** Upstash's own variable names, or the ones the Vercel Marketplace integration sets. */
export function redisCredentials(
  env: Record<string, string | undefined> = process.env,
): { url: string; token: string } | null {
  const url = env.UPSTASH_REDIS_REST_URL ?? env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN ?? env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

/**
 * Fixed window, the textbook Redis pattern: count with INCR, start the
 * window's expiry on the first hit, and report the time left. One atomic
 * script, so one command per request, and plain Lua that runs on Upstash and
 * on stock Redis alike.
 */
const FIXED_WINDOW = `
local count = redis.call("INCR", KEYS[1])
if count == 1 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
end
return { count, redis.call("PTTL", KEYS[1]) }
`;

const KEY_PREFIX = "syntaqx:ratelimit:";

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms),
    ),
  ]);
}

export function redisStore(redis: Redis): RateLimitStore {
  const script = redis.createScript<[number, number]>(FIXED_WINDOW);
  // Clients already over the limit, and when their window ends (epoch ms).
  // Remembered in memory so a blocked client doesn't cost a Redis command
  // per request.
  const blocked = new Map<string, number>();

  return {
    name: "redis",
    async limit(key) {
      const now = Date.now();
      const until = blocked.get(key);
      if (until !== undefined) {
        if (now < until) return rateLimitResult(0, Math.ceil(until / 1000), true);
        blocked.delete(key);
      }

      try {
        const [count, ttlMs] = await withTimeout(
          script.exec([KEY_PREFIX + key], [String(WINDOW_SECONDS * 1000)]),
          REDIS_TIMEOUT_MS,
        );
        const reset = now + Math.max(0, ttlMs);
        const limited = count > MAX_REQUESTS;
        if (limited) blocked.set(key, reset);
        return rateLimitResult(Math.max(0, MAX_REQUESTS - count), Math.ceil(reset / 1000), limited);
      } catch (error) {
        console.error("rate limit: Redis unavailable, using the in-memory store", error);
        return memoryStore.limit(key);
      }
    },
  };
}

/** Pick the store from the environment. */
export function selectStore(env: Record<string, string | undefined> = process.env): RateLimitStore {
  const credentials = redisCredentials(env);
  const forced = env.RATE_LIMIT_STORE as RateLimitStoreName | undefined;

  if (forced === "memory") return memoryStore;
  if (forced === "noop") return noopStore;
  if (forced === "redis" && !credentials) {
    throw new Error("RATE_LIMIT_STORE=redis needs UPSTASH_REDIS_REST_URL/TOKEN or KV_REST_API_URL/TOKEN.");
  }
  return credentials ? redisStore(new Redis(credentials)) : noopStore;
}

let store: RateLimitStore | undefined;

/** Check the limit for a key (typically the client IP) against the configured store. */
export function checkRateLimit(key: string): Promise<RateLimitResult> {
  store ??= selectStore();
  return store.limit(key);
}

/** Test hook: use a specific store, or `undefined` to re-read the environment. */
export function setRateLimitStore(next: RateLimitStore | undefined): void {
  store = next;
}
