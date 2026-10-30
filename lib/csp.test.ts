import { describe, it, expect, vi } from "vitest";
import { contentSecurityPolicy } from "../next.config";

const parse = (policy: string): Record<string, string[]> =>
  Object.fromEntries(
    policy.split("; ").map((d) => {
      const [name, ...values] = d.split(" ");
      return [name, values];
    }),
  );

const directives = parse(contentSecurityPolicy);

describe("Content-Security-Policy", () => {
  it("locks down the directives that don't depend on the site's scripts", () => {
    expect(directives["default-src"]).toEqual(["'self'"]);
    expect(directives["object-src"]).toEqual(["'none'"]);
    expect(directives["base-uri"]).toEqual(["'none'"]);
    expect(directives["frame-ancestors"]).toEqual(["'none'"]);
    expect(directives["form-action"]).toEqual(["'self'"]);
  });

  it("allows exactly the outside origins the site's own tools call", () => {
    expect(directives["connect-src"]).toEqual([
      "'self'",
      "https://api.syntaqx.com",
      "https://*.ingest.us.sentry.io",
      "https://vercel.live",
      "wss://ws-us3.pusher.com",
      "https://api.ipify.org",
      "https://api64.ipify.org",
      "https://ipinfo.io",
      "https://api.github.com",
      "data:",
    ]);
  });

  it("allows the API console to reach the API, and Sentry to receive events", () => {
    expect(directives["connect-src"]).toContain("https://api.syntaqx.com");
    expect(directives["connect-src"]).toContain("https://*.ingest.us.sentry.io");
  });

  it("lets search compile its WebAssembly without allowing eval", () => {
    expect(directives["script-src"]).toContain("'wasm-unsafe-eval'");
    expect(directives["script-src"]).not.toContain("'unsafe-eval'");
  });

  it("doesn't report outside production", () => {
    expect(directives["report-uri"]).toBeUndefined();
    expect(directives["report-to"]).toBeUndefined();
  });

  it("reports violations to Sentry in production", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.resetModules();
    const { contentSecurityPolicy: policy } = await import("../next.config");
    vi.unstubAllEnvs();
    const prod = parse(policy);
    expect(prod["report-uri"]?.[0]).toMatch(/^https:\/\/.+\.ingest\.us\.sentry\.io\/api\/\d+\/security\/\?sentry_key=/);
    expect(prod["report-to"]).toEqual(["csp"]);
  });
});
