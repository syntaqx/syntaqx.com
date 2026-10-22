import { describe, it, expect, afterEach } from "vitest";
import { POST } from "./route";
import {
  fingerprint,
  memoryIdempotencyStore,
  setIdempotencyStore,
  type IdempotencyStore,
} from "@/lib/idempotency";

const post = (body: string, headers: Record<string, string> = {}) =>
  POST(
    new Request("http://localhost/api/echo", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Forwarded-For": "198.51.100.7", ...headers },
      body,
    }),
  );

afterEach(() => setIdempotencyStore(undefined));

describe("POST /echo", () => {
  it("creates a new echo on every call without a key", async () => {
    setIdempotencyStore(memoryIdempotencyStore());
    const a = await (await post('{"n":1}')).json();
    const b = await (await post('{"n":1}')).json();
    expect(a.id).not.toBe(b.id);
    expect(a.payload).toEqual({ n: 1 });
  });

  it("replays the original response byte for byte for the same key and body", async () => {
    setIdempotencyStore(memoryIdempotencyStore());
    const key = { "Idempotency-Key": crypto.randomUUID() };
    const first = await post('{"n":1}', key);
    const firstBody = await first.text();
    const retry = await post('{"n":1}', key);
    expect(first.status).toBe(201);
    expect(retry.status).toBe(201);
    expect(await retry.text()).toBe(firstBody);
    expect(retry.headers.get("Idempotent-Replayed")).toBe("true");
    expect(first.headers.get("Idempotent-Replayed")).toBeNull();
  });

  it("rejects the same key with a different body with 400", async () => {
    setIdempotencyStore(memoryIdempotencyStore());
    const key = { "Idempotency-Key": crypto.randomUUID() };
    await post('{"n":1}', key);
    const res = await post('{"n":2}', key);
    expect(res.status).toBe(400);
  });

  it("answers 409 while the first request with a key is still in progress", async () => {
    const store = memoryIdempotencyStore();
    setIdempotencyStore(store);
    const key = crypto.randomUUID();
    // Simulate a first request that has claimed the key and not finished.
    await store.claim(`198.51.100.7:${key}`, await fingerprint("POST", "/echo", '{"n":1}'));
    const res = await post('{"n":1}', { "Idempotency-Key": key });
    expect(res.status).toBe(409);
    expect(res.headers.get("Retry-After")).toBe("1");
  });

  it("doesn't store requests rejected before execution", async () => {
    setIdempotencyStore(memoryIdempotencyStore());
    const key = { "Idempotency-Key": crypto.randomUUID() };
    expect((await post("[1,2]", key)).status).toBe(422);
    // Fixed and retried with the same key: it runs, rather than replaying the 422.
    expect((await post('{"n":1}', key)).status).toBe(201);
  });

  it("rejects invalid keys and oversized bodies", async () => {
    setIdempotencyStore(memoryIdempotencyStore());
    expect((await post("{}", { "Idempotency-Key": "x".repeat(256) })).status).toBe(400);
    expect((await post(JSON.stringify({ big: "x".repeat(17_000) }))).status).toBe(413);
  });

  it("fails closed with 503 when idempotency storage is unavailable", async () => {
    const broken: IdempotencyStore = {
      claim: async () => {
        throw new Error("redis down");
      },
      complete: async () => {},
    };
    setIdempotencyStore(broken);
    const res = await post('{"n":1}', { "Idempotency-Key": crypto.randomUUID() });
    expect(res.status).toBe(503);
  });
});
