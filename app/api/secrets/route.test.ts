import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { POST } from "./route";
import { GET } from "./[id]/route";
import { lookupKey, memorySecretStore, setSecretStore, type SecretStore } from "@/lib/secrets";

const create = (body: unknown) =>
  POST(
    new Request("http://localhost/api/secrets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );

const read = (id: string) => GET(new Request(`http://localhost/api/secrets/${id}`), { params: Promise.resolve({ id }) });

let store: SecretStore;
beforeEach(() => {
  store = memorySecretStore();
  setSecretStore(store);
});
afterEach(() => setSecretStore(undefined));

describe("POST /secrets and GET /secrets/{id}", () => {
  it("returns the secret once, then 404s", async () => {
    const res = await create({ secret: "hunter2" });
    expect(res.status).toBe(201);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    const { id, url } = await res.json();
    expect(url).toBe(`http://localhost/api/secrets/${id}`);

    const first = await read(id);
    expect(first.status).toBe(200);
    expect(await first.json()).toEqual({ secret: "hunter2" });
    expect((await read(id)).status).toBe(404);
  });

  it("builds links on the api subdomain without /api", async () => {
    const res = await POST(
      new Request("https://api.syntaqx.com/api/secrets", {
        method: "POST",
        headers: { host: "api.syntaqx.com" },
        body: '{"secret":"x"}',
      }),
    );
    const { id, url } = await res.json();
    expect(url).toBe(`https://api.syntaqx.com/secrets/${id}`);
  });

  it("stores ciphertext under a hash of the id, never the id or plaintext", async () => {
    const stored = new Map<string, string>();
    setSecretStore({
      put: async (lookup, value) => void stored.set(lookup, value),
      take: async () => null,
    });
    const { id } = await (await create({ secret: "hunter2" })).json();
    const [[lookup, value]] = stored;
    expect(lookup).toBe(await lookupKey(id));
    expect(lookup).not.toContain(id);
    expect(value).not.toContain("hunter2");
  });

  it("expires unread secrets", async () => {
    const { id } = await (await create({ secret: "x", ttl: 60 })).json();
    const realNow = Date.now;
    Date.now = () => realNow() + 61_000;
    try {
      expect((await read(id)).status).toBe(404);
    } finally {
      Date.now = realNow;
    }
  });

  it("validates the body", async () => {
    expect((await create("{")).status).toBe(400);
    expect((await create({})).status).toBe(422);
    expect((await create({ secret: "" })).status).toBe(422);
    expect((await create({ secret: "x", ttl: 30 })).status).toBe(422);
    expect((await create({ secret: "x", ttl: 86401 })).status).toBe(422);
    expect((await create({ secret: "x".repeat(4097) })).status).toBe(413);
  });

  it("404s a malformed or unknown id", async () => {
    expect((await read("nope")).status).toBe(404);
    expect((await read("A".repeat(32))).status).toBe(404);
  });

  it("fails closed with 503 when storage is down", async () => {
    const down = async () => {
      throw new Error("down");
    };
    setSecretStore({ put: down, take: down });
    expect((await create({ secret: "x" })).status).toBe(503);
    expect((await read("A".repeat(32))).status).toBe(503);
  });
});
