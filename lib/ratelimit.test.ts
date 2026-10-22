import { describe, it, expect, beforeAll } from "vitest";
import { Redis } from "@upstash/redis";
import {
  checkRateLimit,
  memoryStore,
  noopStore,
  redisCredentials,
  redisStore,
  selectStore,
  setRateLimitStore,
} from "./ratelimit";
import { CACHE, cacheableJson } from "./api";

describe("selectStore()", () => {
  it("uses noop without Redis credentials", () => {
    expect(selectStore({}).name).toBe("noop");
  });

  it("uses Redis with Upstash's or Vercel's variable names", () => {
    expect(selectStore({ UPSTASH_REDIS_REST_URL: "https://redis.example", UPSTASH_REDIS_REST_TOKEN: "t" }).name).toBe("redis");
    expect(selectStore({ KV_REST_API_URL: "https://redis.example", KV_REST_API_TOKEN: "t" }).name).toBe("redis");
  });

  it("honors RATE_LIMIT_STORE", () => {
    const creds = { KV_REST_API_URL: "https://redis.example", KV_REST_API_TOKEN: "t" };
    expect(selectStore({ ...creds, RATE_LIMIT_STORE: "memory" }).name).toBe("memory");
    expect(selectStore({ ...creds, RATE_LIMIT_STORE: "noop" }).name).toBe("noop");
    expect(() => selectStore({ RATE_LIMIT_STORE: "redis" })).toThrow(/needs/);
  });
});

describe("noop store", () => {
  it("never limits, but still sends the rate-limit headers", async () => {
    for (let i = 0; i < 3; i++) {
      const r = await noopStore.limit("10.9.0.1");
      expect(r.limited).toBe(false);
      expect(r.remaining).toBe(5000);
      expect(r.headers["RateLimit-Policy"]).toBe('"hourly";q=5000;w=3600');
      expect(r.headers.RateLimit).toMatch(/^"hourly";r=5000;t=\d+$/);
    }
  });
});

describe("304 refunds", () => {
  it("gives a request back in the memory store, never below zero", async () => {
    const key = `10.9.2.${Date.now() % 250}`;
    await memoryStore.limit(key);
    const second = await memoryStore.limit(key);
    await memoryStore.refund(key);
    expect((await memoryStore.limit(key)).remaining).toBe(second.remaining);
    await memoryStore.refund("never-seen");
  });

  it("refunds a revalidation that matched, so polling with If-None-Match is free", async () => {
    setRateLimitStore(memoryStore);
    try {
      const ip = `10.9.3.${Date.now() % 250}`;
      const url = "http://localhost/api/healthz";
      const first = await cacheableJson(new Request(url), { status: "ok" }, CACHE.revalidate);
      const etag = first.headers.get("ETag")!;

      const before = await checkRateLimit(ip); // counted as the proxy would
      const revalidated = await cacheableJson(
        new Request(url, { headers: { "If-None-Match": etag, "X-Forwarded-For": ip } }),
        { status: "ok" },
        CACHE.revalidate,
      );
      expect(revalidated.status).toBe(304);
      // The 304 gave its request back, so the next request sees the same quota.
      expect((await checkRateLimit(ip)).remaining).toBe(before.remaining);
    } finally {
      setRateLimitStore(undefined);
    }
  });
});

describe("redis store", () => {
  it("falls back to the in-memory store when Redis is unreachable", async () => {
    const store = redisStore(new Redis({ url: "http://127.0.0.1:1", token: "t", retry: false }));
    const key = `10.9.1.${Date.now() % 250}`;
    const first = await store.limit(key);
    const second = await store.limit(key);
    expect(first.limited).toBe(false);
    // Counted in memory: the second request has one fewer remaining.
    expect(second.remaining).toBe(first.remaining - 1);
  });
});

// Runs against the compose.yml stack (and the matching services in CI).
const LOCAL = { url: "http://localhost:8079", token: "local_dev_token" };
let redisUp = false;
beforeAll(async () => {
  try {
    const res = await fetch(LOCAL.url, {
      method: "POST",
      headers: { Authorization: `Bearer ${LOCAL.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(["PING"]),
      signal: AbortSignal.timeout(1000),
    });
    redisUp = res.ok;
  } catch {
    redisUp = false;
  }
});

describe("redis store against a real Redis", () => {
  it("is reachable in CI, where compose's services always run", (ctx) => {
    if (!process.env.CI) ctx.skip();
    expect(redisUp).toBe(true);
  });

  it("shares one count across instances, which is what makes the limit global", async (ctx) => {
    if (!redisUp) ctx.skip();
    // Two stores stand in for two serverless instances.
    const a = redisStore(new Redis(redisCredentials({ UPSTASH_REDIS_REST_URL: LOCAL.url, UPSTASH_REDIS_REST_TOKEN: LOCAL.token })!));
    const b = redisStore(new Redis(LOCAL));
    const key = `test-${crypto.randomUUID()}`;

    const first = await a.limit(key);
    const second = await b.limit(key);
    const third = await a.limit(key);

    expect([first.remaining, second.remaining, third.remaining]).toEqual([4999, 4998, 4997]);
    expect(first.headers["X-RateLimit-Reset"]).toBe(third.headers["X-RateLimit-Reset"]);
    // Prove Redis did the counting, not the in-memory fallback.
    expect(await new Redis(LOCAL).get(`syntaqx:ratelimit:${key}`)).toBe(3);
  });

  it("refunds in Redis without going below zero", async (ctx) => {
    if (!redisUp) ctx.skip();
    const key = `test-${crypto.randomUUID()}`;
    const store = redisStore(new Redis(LOCAL));
    await store.limit(key);
    await store.limit(key);
    await store.refund(key);
    expect(await new Redis(LOCAL).get(`syntaqx:ratelimit:${key}`)).toBe(1);
    await store.refund(`test-${crypto.randomUUID()}`);
  });

  it("expires the window in Redis, so counters never pile up", async (ctx) => {
    if (!redisUp) ctx.skip();
    const key = `test-${crypto.randomUUID()}`;
    await redisStore(new Redis(LOCAL)).limit(key);
    const ttl = await new Redis(LOCAL).pttl(`syntaqx:ratelimit:${key}`);
    expect(ttl).toBeGreaterThan(3_590_000);
    expect(ttl).toBeLessThanOrEqual(3_600_000);
  });
});
