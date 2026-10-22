import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";
import { API_VERSIONS } from "@/lib/api";

/**
 * Build a NextRequest with a unique IP so each test gets its own
 * rate-limit bucket. (The limiter's state is module-scoped.)
 */
let ipCounter = 0;
function makeRequest(
  url: string,
  init: {
    method?: string;
    host?: string;
    ip?: string;
    headers?: Record<string, string>;
  } = {},
): NextRequest {
  const ip = init.ip ?? `10.0.0.${++ipCounter}`;
  const headers = new Headers({
    "x-forwarded-for": ip,
  });
  if (init.host) headers.set("host", init.host);
  for (const [k, v] of Object.entries(init.headers ?? {})) headers.set(k, v);
  return new NextRequest(url, { method: init.method ?? "GET", headers });
}

describe("proxy: API header guarantees", () => {
  it("attaches Request-Id and X-RateLimit-* headers to /api/* requests", async () => {
    const res = await proxy(makeRequest("http://localhost/api/healthz"));
    expect(res).toBeDefined();
    const r = res as Response;
    expect(r.headers.get("Request-Id")).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    expect(r.headers.get("X-RateLimit-Limit")).toBe("5000");
    expect(r.headers.get("X-RateLimit-Remaining")).toBe("4999");
    expect(r.headers.get("X-RateLimit-Reset")).toMatch(/^\d+$/);
  });

  it("attaches IETF RateLimit-Policy and RateLimit structured fields", async () => {
    const r = (await proxy(makeRequest("http://localhost/api/healthz")));
    expect(r.headers.get("RateLimit-Policy")).toBe('"hourly";q=5000;w=3600');
    expect(r.headers.get("RateLimit")).toMatch(/^"hourly";r=4999;t=\d+$/);
    const t = Number(r.headers.get("RateLimit")!.split("t=")[1]);
    expect(t).toBeGreaterThan(0);
    expect(t).toBeLessThanOrEqual(3600);
  });

  it("attaches headers to every API path (root, catch-all, auth, openapi)", async () => {
    for (const path of [
      "/api",
      "/api/whatever",
      "/api/auth/sign-in/email",
      "/api/openapi",
      "/api/sentry-example-api",
    ]) {
      const res = (await proxy(makeRequest(`http://localhost${path}`)));
      expect(
        res.headers.get("Request-Id"),
        `${path} should set Request-Id`,
      ).toBeTruthy();
      expect(
        res.headers.get("X-RateLimit-Limit"),
        `${path} should set X-RateLimit-Limit`,
      ).toBe("5000");
    }
  });

  it("decrements X-RateLimit-Remaining for repeated requests from the same IP", async () => {
    const ip = `10.1.0.${++ipCounter}`;
    const a = (await proxy(makeRequest("http://localhost/api/healthz", { ip })));
    const b = (await proxy(makeRequest("http://localhost/api/healthz", { ip })));
    expect(a.headers.get("X-RateLimit-Remaining")).toBe("4999");
    expect(b.headers.get("X-RateLimit-Remaining")).toBe("4998");
  });

  it("does not touch non-API paths", async () => {
    const res = (await proxy(makeRequest("http://localhost/about")));
    // NextResponse.next() — no rate-limit headers, no request id.
    expect(res.headers.get("X-RateLimit-Limit")).toBeNull();
    expect(res.headers.get("Request-Id")).toBeNull();
  });

  it("returns 204 with CORS headers for OPTIONS preflight on /api/*", async () => {
    const res = await proxy(
      makeRequest("http://localhost/api/healthz", { method: "OPTIONS" }),
    ) as Response;
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("POST");
  });
});

describe("proxy: rate limiting enforcement", () => {
  it("returns 429 with the documented envelope and Retry-After once the limit is exceeded", async () => {
    const ip = `10.99.0.${++ipCounter}`;
    let limitedResponse: Response | null = null;

    // MAX_REQUESTS = 5000, so the 5001st call should be limited.
    for (let i = 0; i < 5001; i++) {
      const res = await proxy(
        makeRequest("http://localhost/api/healthz", { ip }),
      ) as Response;
      if (res.status === 429) {
        limitedResponse = res;
        break;
      }
    }

    expect(limitedResponse).not.toBeNull();
    const res = limitedResponse!;
    expect(res.status).toBe(429);
    expect(res.headers.get("Content-Type")).toContain("application/json");
    expect(res.headers.get("Retry-After")).toMatch(/^\d+$/);
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(res.headers.get("RateLimit")).toMatch(/^"hourly";r=0;t=\d+$/);
    expect(res.headers.get("Request-Id")).toBeTruthy();

    const body = await res.json();
    expect(body).toEqual({ message: "Too many requests. Please try again later." });
  });
});

describe("proxy: Api-Version", () => {
  const current = API_VERSIONS[0].version;

  it("defaults and echoes Api-Version with Vary on API responses", async () => {
    const res = (await proxy(makeRequest("http://localhost/api/healthz")));
    expect(res.headers.get("Api-Version")).toBe(current);
    expect(res.headers.get("Vary")).toContain("Api-Version");
  });

  it("honors a supported Api-Version header", async () => {
    const res = await proxy(
      makeRequest("http://localhost/api/healthz", {
        headers: { "Api-Version": current },
      }),
    ) as Response;
    expect(res.status).toBe(200);
    expect(res.headers.get("Api-Version")).toBe(current);
  });

  it("returns 400 with the error envelope for an unsupported version", async () => {
    const res = await proxy(
      makeRequest("http://localhost/api/healthz", {
        headers: { "Api-Version": "1999-01-01" },
      }),
    ) as Response;
    expect(res.status).toBe(400);
    expect(res.headers.get("Request-Id")).toBeTruthy();
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    const body = await res.json();
    expect(body.message).toContain('Unsupported Api-Version "1999-01-01"');
    expect(body.errors["Api-Version"][0]).toContain(current);
  });

  it("allows and exposes the versioning headers for browsers", async () => {
    const res = await proxy(
      makeRequest("http://localhost/api/healthz", { method: "OPTIONS" }),
    ) as Response;
    expect(res.headers.get("Access-Control-Allow-Headers")).toContain("Api-Version");
    for (const h of ["Api-Version", "Deprecation", "Sunset", "RateLimit"]) {
      expect(res.headers.get("Access-Control-Expose-Headers")).toContain(h);
    }
  });

  it("leaves non-API pages alone", async () => {
    const res = await proxy(
      makeRequest("http://localhost/about", { headers: { "Api-Version": "bogus" } }),
    ) as Response;
    expect(res.status).toBe(200);
    expect(res.headers.get("Api-Version")).toBeNull();
  });
});

describe("proxy: api subdomain", () => {
  it("rewrites api.syntaqx.com root to /api so the route handler is the source of truth", async () => {
    const res = await proxy(
      makeRequest("http://api.syntaqx.com/", { host: "api.syntaqx.com" }),
    ) as Response;
    expect(res.status).toBe(200);
    expect(res.headers.get("Request-Id")).toBeTruthy();
    expect(res.headers.get("X-RateLimit-Limit")).toBe("5000");
    expect(res.headers.get("x-middleware-rewrite")).toBe("http://api.syntaqx.com/api");
  });

  it("serves endpoints at the root of the api subdomain, with no /v1 prefix", async () => {
    const res = await proxy(
      makeRequest("http://api.syntaqx.com/hash", { host: "api.syntaqx.com" }),
    ) as Response;
    expect(res.headers.get("x-middleware-rewrite")).toBe("http://api.syntaqx.com/api/hash");
    expect(res.headers.get("Request-Id")).toBeTruthy();
  });
});

describe("proxy: HTTP QUERY", () => {
  const HELLO_SHA256 =
    "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9";

  function queryRequest(
    url: string,
    init: { method?: string; headers?: Record<string, string>; body?: string } = {},
  ): NextRequest {
    const headers = new Headers({
      "x-forwarded-for": `10.1.0.${++ipCounter}`,
      "content-type": "application/json",
      ...init.headers,
    });
    return new NextRequest(url, {
      method: init.method ?? "QUERY",
      headers,
      body: init.body ?? JSON.stringify({ input: "hello world" }),
    });
  }

  it("serves a native QUERY with cacheable, discoverable responses", async () => {
    const res = await proxy(queryRequest("http://localhost/api/hash"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ algorithm: "SHA-256", digest: HELLO_SHA256 });
    expect(res.headers.get("Cache-Control")).toBe("public, max-age=31536000, immutable");
    expect(res.headers.get("Accept-Query")).toBe("application/json");
    expect(res.headers.get("Allow")).toBe("POST, QUERY, OPTIONS");
    expect(res.headers.get("Request-Id")).toBeTruthy();
  });

  it("serves POST + X-HTTP-Method-Override: QUERY without caching", async () => {
    const res = await proxy(
      queryRequest("http://localhost/api/hash", {
        method: "POST",
        headers: { "X-HTTP-Method-Override": "query" },
      }),
    );
    expect(res.status).toBe(200);
    expect((await res.json()).digest).toBe(HELLO_SHA256);
    expect(res.headers.get("Cache-Control")).toBe("private, no-store");
  });

  it("rejects any override other than POST to QUERY", async () => {
    for (const [method, value] of [["POST", "DELETE"], ["GET", "QUERY"]]) {
      const res = await proxy(
        makeRequest("http://localhost/api/hash", {
          method,
          headers: { "X-HTTP-Method-Override": value },
        }),
      );
      expect(res.status, `${method} -> ${value}`).toBe(400);
    }
  });

  it("returns 415 with Accept-Query for unsupported query formats", async () => {
    const res = await proxy(
      queryRequest("http://localhost/api/hash", { headers: { "content-type": "text/plain" } }),
    );
    expect(res.status).toBe(415);
    expect(res.headers.get("Accept-Query")).toBe("application/json");
  });

  it("returns 413 for query content over 64 KB", async () => {
    const res = await proxy(
      queryRequest("http://localhost/api/hash", {
        body: JSON.stringify({ input: "a".repeat(70_000) }),
      }),
    );
    expect(res.status).toBe(413);
  });

  it("returns 422 for a well-formed query that can't run, 400 for malformed JSON", async () => {
    const invalid = await proxy(
      queryRequest("http://localhost/api/hash", { body: JSON.stringify({ algorithm: "nope" }) }),
    );
    expect(invalid.status).toBe(422);
    expect((await invalid.json()).errors).toBeTruthy();

    const malformed = await proxy(queryRequest("http://localhost/api/hash", { body: "{" }));
    expect(malformed.status).toBe(400);
  });

  it("returns 405 for QUERY on endpoints that don't support it", async () => {
    const res = await proxy(queryRequest("http://localhost/api/uuid"));
    expect(res.status).toBe(405);
  });

  it("works on the api subdomain path too", async () => {
    const req = queryRequest("https://api.syntaqx.com/hash");
    req.headers.set("host", "api.syntaqx.com");
    const res = await proxy(req);
    expect(res.status).toBe(200);
  });

  it("advertises QUERY on OPTIONS", async () => {
    const res = (await proxy(makeRequest("http://localhost/api/hash", { method: "OPTIONS" })));
    expect(res.headers.get("Allow")).toBe("POST, QUERY, OPTIONS");
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("QUERY");
    expect(res.headers.get("Access-Control-Allow-Headers")).toContain("X-HTTP-Method-Override");
  });
});

describe("proxy: rate-limit key forwarding", () => {
  it("tells the route the key it counted, overwriting any client-supplied value", async () => {
    const res = await proxy(
      makeRequest("http://localhost/api/healthz", {
        ip: "198.51.100.23",
        headers: { "syntaqx-ratelimit-key": "someone-else" },
      }),
    );
    expect(res.headers.get("x-middleware-request-syntaqx-ratelimit-key")).toBe("198.51.100.23");
  });
});

describe("proxy: conditional request forwarding", () => {
  it("forwards If-None-Match under a name the platform won't strip, replacing client copies", async () => {
    const res = await proxy(
      makeRequest("http://localhost/api/healthz", {
        headers: { "If-None-Match": '"abc"', "syntaqx-if-none-match": '"spoofed"' },
      }),
    );
    expect(res.headers.get("x-middleware-request-syntaqx-if-none-match")).toBe('"abc"');
  });
});
