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
  it("attaches Request-Id and X-RateLimit-* headers to /api/* requests", () => {
    const res = proxy(makeRequest("http://localhost/api/v1/healthz"));
    expect(res).toBeDefined();
    const r = res as Response;
    expect(r.headers.get("Request-Id")).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    expect(r.headers.get("X-RateLimit-Limit")).toBe("5000");
    expect(r.headers.get("X-RateLimit-Remaining")).toBe("4999");
    expect(r.headers.get("X-RateLimit-Reset")).toMatch(/^\d+$/);
  });

  it("attaches IETF RateLimit-Policy and RateLimit structured fields", () => {
    const r = proxy(makeRequest("http://localhost/api/v1/healthz")) as Response;
    expect(r.headers.get("RateLimit-Policy")).toBe('"hourly";q=5000;w=3600');
    expect(r.headers.get("RateLimit")).toMatch(/^"hourly";r=4999;t=\d+$/);
    const t = Number(r.headers.get("RateLimit")!.split("t=")[1]);
    expect(t).toBeGreaterThan(0);
    expect(t).toBeLessThanOrEqual(3600);
  });

  it("attaches headers to non-/v1 API paths too (root, catch-all, auth, openapi)", () => {
    for (const path of [
      "/api",
      "/api/whatever",
      "/api/auth/sign-in/email",
      "/api/v1/openapi",
      "/api/sentry-example-api",
    ]) {
      const res = proxy(makeRequest(`http://localhost${path}`)) as Response;
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

  it("decrements X-RateLimit-Remaining for repeated requests from the same IP", () => {
    const ip = `10.1.0.${++ipCounter}`;
    const a = proxy(makeRequest("http://localhost/api/v1/healthz", { ip })) as Response;
    const b = proxy(makeRequest("http://localhost/api/v1/healthz", { ip })) as Response;
    expect(a.headers.get("X-RateLimit-Remaining")).toBe("4999");
    expect(b.headers.get("X-RateLimit-Remaining")).toBe("4998");
  });

  it("does not touch non-API paths", () => {
    const res = proxy(makeRequest("http://localhost/about")) as Response;
    // NextResponse.next() — no rate-limit headers, no request id.
    expect(res.headers.get("X-RateLimit-Limit")).toBeNull();
    expect(res.headers.get("Request-Id")).toBeNull();
  });

  it("returns 204 with CORS headers for OPTIONS preflight on /api/*", () => {
    const res = proxy(
      makeRequest("http://localhost/api/v1/healthz", { method: "OPTIONS" }),
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
      const res = proxy(
        makeRequest("http://localhost/api/v1/healthz", { ip }),
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

  it("defaults and echoes Api-Version with Vary on API responses", () => {
    const res = proxy(makeRequest("http://localhost/api/v1/healthz")) as Response;
    expect(res.headers.get("Api-Version")).toBe(current);
    expect(res.headers.get("Vary")).toContain("Api-Version");
  });

  it("honors a supported Api-Version header", () => {
    const res = proxy(
      makeRequest("http://localhost/api/v1/healthz", {
        headers: { "Api-Version": current },
      }),
    ) as Response;
    expect(res.status).toBe(200);
    expect(res.headers.get("Api-Version")).toBe(current);
  });

  it("returns 400 with the error envelope for an unsupported version", async () => {
    const res = proxy(
      makeRequest("http://localhost/api/v1/healthz", {
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

  it("allows and exposes the versioning headers for browsers", () => {
    const res = proxy(
      makeRequest("http://localhost/api/v1/healthz", { method: "OPTIONS" }),
    ) as Response;
    expect(res.headers.get("Access-Control-Allow-Headers")).toContain("Api-Version");
    for (const h of ["Api-Version", "Deprecation", "Sunset", "RateLimit"]) {
      expect(res.headers.get("Access-Control-Expose-Headers")).toContain(h);
    }
  });

  it("leaves non-API pages alone", () => {
    const res = proxy(
      makeRequest("http://localhost/about", { headers: { "Api-Version": "bogus" } }),
    ) as Response;
    expect(res.status).toBe(200);
    expect(res.headers.get("Api-Version")).toBeNull();
  });
});

describe("proxy: api subdomain", () => {
  it("rewrites api.syntaqx.com root to /api so the route handler is the source of truth", () => {
    const res = proxy(
      makeRequest("http://api.syntaqx.com/", { host: "api.syntaqx.com" }),
    ) as Response;
    expect(res.status).toBe(200);
    expect(res.headers.get("Request-Id")).toBeTruthy();
    expect(res.headers.get("X-RateLimit-Limit")).toBe("5000");
    expect(res.headers.get("x-middleware-rewrite")).toBe("http://api.syntaqx.com/api");
  });

  it("returns 404 with envelope on non-/v1 paths under api subdomain", async () => {
    const res = proxy(
      makeRequest("http://api.syntaqx.com/random", { host: "api.syntaqx.com" }),
    ) as Response;
    expect(res.status).toBe(404);
    expect(res.headers.get("Request-Id")).toBeTruthy();
    const body = await res.json();
    expect(body).toEqual({ message: "Not found." });
  });
});
