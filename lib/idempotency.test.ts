import { describe, it, expect, beforeAll } from "vitest";
import { Redis } from "@upstash/redis";
import { memoryIdempotencyStore, redisIdempotencyStore, validKey, type IdempotencyStore } from "./idempotency";

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

async function behavesLikeAnIdempotencyStore(store: IdempotencyStore) {
  const key = `test-${crypto.randomUUID()}`;

  // Two simultaneous first requests: exactly one may run.
  const [a, b] = await Promise.all([store.claim(key, "f1"), store.claim(key, "f1")]);
  expect([a.kind, b.kind].sort()).toEqual(["in_progress", "new"]);

  // A different request with the same key is a mismatch, even mid-flight.
  expect((await store.claim(key, "f2")).kind).toBe("mismatch");

  await store.complete(key, "f1", { status: 201, body: '{"ok":true}', contentType: "application/json" });
  expect(await store.claim(key, "f1")).toEqual({
    kind: "completed",
    response: { status: 201, body: '{"ok":true}', contentType: "application/json" },
  });
}

describe("idempotency stores", () => {
  it("memory: one claim wins, mismatches and replays are detected", async () => {
    await behavesLikeAnIdempotencyStore(memoryIdempotencyStore());
  });

  it("redis: the same guarantees across instances, with SET NX", async (ctx) => {
    if (!redisUp) ctx.skip();
    await behavesLikeAnIdempotencyStore(redisIdempotencyStore(new Redis(LOCAL)));
  });
});

describe("validKey()", () => {
  it("accepts 1 to 255 printable characters", () => {
    expect(validKey("f47ac10b-58cc-4372-a567-0e02b2c3d479")).toBe(true);
    expect(validKey("")).toBe(false);
    expect(validKey("x".repeat(256))).toBe(false);
    expect(validKey("has space")).toBe(false);
  });
});
