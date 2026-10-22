import { describe, it, expect } from "vitest";
import { contentSecurityPolicy } from "../next.config";

const directives = Object.fromEntries(
  contentSecurityPolicy.split("; ").map((d) => {
    const [name, ...values] = d.split(" ");
    return [name, values];
  }),
);

describe("Content-Security-Policy", () => {
  it("locks down the directives that don't depend on the site's scripts", () => {
    expect(directives["default-src"]).toEqual(["'self'"]);
    expect(directives["object-src"]).toEqual(["'none'"]);
    expect(directives["base-uri"]).toEqual(["'none'"]);
    expect(directives["frame-ancestors"]).toEqual(["'none'"]);
    expect(directives["form-action"]).toEqual(["'self'"]);
  });

  it("allows the API console to reach the API, and Sentry to receive events", () => {
    expect(directives["connect-src"]).toContain("https://api.syntaqx.com");
    expect(directives["connect-src"]).toContain("https://*.ingest.us.sentry.io");
  });

  it("reports violations to Sentry", () => {
    expect(directives["report-uri"]?.[0]).toMatch(/^https:\/\/.+\.ingest\.us\.sentry\.io\/api\/\d+\/security\/\?sentry_key=/);
    expect(directives["report-to"]).toEqual(["csp"]);
  });
});
