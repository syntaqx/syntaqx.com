import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";

/**
 * Build a NextRequest with a unique IP so each test gets its own
 * rate-limit bucket. (The limiter's state is module-scoped.)
 */
let ipCounter = 0;
function makeRequest(
  url: string,
  init: { method?: string; host?: string; ip?: string } = {},
): NextRequest {
  const ip = init.ip ?? `10.0.0.${++ipCounter}`;
  const headers = new Headers({
    "x-forwarded-for": ip,
  });
  if (init.host) headers.set("host", init.host);
  return new NextRequest(url, { method: init.method ?? "GET", headers });
}

describe("proxy: API header guarantees", () => {
  it("attaches X-Request-ID and X-RateLimit-* headers to /api/* requests", () => {
    const res = proxy(makeRequest("http://localhost/api/v1/healthz"));
    expect(res).toBeDefined();
    const r = res as Response;
    expect(r.headers.get("X-Request-ID")).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    expect(r.headers.get("X-RateLimit-Limit")).toBe("5000");
    expect(r.headers.get("X-RateLimit-Remaining")).toBe("4999");
    expect(r.headers.get("X-RateLimit-Reset")).toMatch(/^\d+$/);
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
        res.headers.get("X-Request-ID"),
        `${path} should set X-Request-ID`,
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
    expect(res.headers.get("X-Request-ID")).toBeNull();
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
    expect(res.headers.get("X-Request-ID")).toBeTruthy();

    const body = await res.json();
    expect(body).toEqual({ message: "Too many requests. Please try again later." });
  });
});

describe("proxy: api subdomain", () => {
  it("returns the API index on api.syntaqx.com root", async () => {
    const res = proxy(
      makeRequest("http://api.syntaqx.com/", { host: "api.syntaqx.com" }),
    ) as Response;
    expect(res.status).toBe(200);
    expect(res.headers.get("X-Request-ID")).toBeTruthy();
    expect(res.headers.get("X-RateLimit-Limit")).toBe("5000");
    const body = await res.json();
    expect(body).toHaveProperty("healthz_url");
    expect(body).toHaveProperty("openapi_url");
  });

  it("returns 404 with envelope on non-/v1 paths under api subdomain", async () => {
    const res = proxy(
      makeRequest("http://api.syntaqx.com/random", { host: "api.syntaqx.com" }),
    ) as Response;
    expect(res.status).toBe(404);
    expect(res.headers.get("X-Request-ID")).toBeTruthy();
    const body = await res.json();
    expect(body).toEqual({ message: "Not found." });
  });
});
