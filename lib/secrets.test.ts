import { beforeAll, describe, expect, it } from "vitest";
import { Redis } from "@upstash/redis";
import { DAILY_CREATE_LIMIT, encryptSecret, redisSecretStore } from "./secrets";

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

const fresh = () => `test-${crypto.randomUUID()}`;

describe("redis secret store against a real Redis", () => {
  it("returns a value once, and expires it with its TTL", async (ctx) => {
    if (!redisUp) ctx.skip();
    const store = redisSecretStore(new Redis(LOCAL));
    const lookup = fresh();
    // A real stored value: base64 of the server-side encryption.
    const value = await encryptSecret("A".repeat(32), "hunter2");
    expect(await store.put(lookup, value, 600, undefined, fresh())).toBe(true);
    const ttl = await store.ttl(lookup);
    expect(ttl).toBeGreaterThan(590_000);
    expect(await store.take(lookup, undefined)).toEqual({ status: "ok", value });
    expect(await store.take(lookup, undefined)).toEqual({ status: "missing" });
    expect(await store.ttl(lookup)).toBeNull();
  });

  it("refuses a read without the check and keeps both keys", async (ctx) => {
    if (!redisUp) ctx.skip();
    const redis = new Redis(LOCAL);
    const store = redisSecretStore(redis);
    const lookup = fresh();
    const check = "c".repeat(43);
    await store.put(lookup, "cipher", 600, check, fresh());
    expect(await store.take(lookup, undefined)).toEqual({ status: "denied" });
    expect(await store.take(lookup, "d".repeat(43))).toEqual({ status: "denied" });
    expect(await redis.pttl(`syntaqx:secret:${lookup}:check`)).toBeGreaterThan(590_000);
    expect(await store.take(lookup, check)).toEqual({ status: "ok", value: "cipher" });
    expect(await redis.exists(`syntaqx:secret:${lookup}`, `syntaqx:secret:${lookup}:check`)).toBe(
      0,
    );
  });

  it("caps creates per client per day", async (ctx) => {
    if (!redisUp) ctx.skip();
    const redis = new Redis(LOCAL);
    const store = redisSecretStore(redis);
    const client = fresh();
    for (let i = 0; i < DAILY_CREATE_LIMIT; i++) {
      expect(await store.put(fresh(), "x", 60, undefined, client)).toBe(true);
    }
    expect(await store.put(fresh(), "x", 60, undefined, client)).toBe(false);
    expect(await redis.ttl(`syntaqx:secret-quota:${client}`)).toBeGreaterThan(86_000);
  });
});
