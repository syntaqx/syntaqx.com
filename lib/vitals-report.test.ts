import { describe, expect, it } from "vitest";
import type { INPMetricWithAttribution, LCPMetricWithAttribution } from "web-vitals/attribution";
import { inpReport, lcpReport } from "./vitals-report";

const marks = [
  { at: 0, path: "/docs/money/amounts" },
  { at: 5000, path: "/docs/money/payment-states" },
];

const inp = (value: number, rating: "good" | "needs-improvement" | "poor") =>
  ({
    value,
    rating,
    attribution: {
      interactionTarget: "nav>div>button",
      interactionTime: 6000,
      interactionType: "pointer",
      inputDelay: 4.2,
      processingDuration: 2,
      presentationDelay: 1100.6,
      loadState: "complete",
      totalScriptDuration: 3,
      longestScript: {
        entry: {
          invoker: "BUTTON.onclick",
          sourceURL: "https://syntaqx.com/_next/static/chunks/a.js?v=1",
          sourceFunctionName: "toggle",
          duration: 3.4,
        },
      },
    },
  }) as unknown as INPMetricWithAttribution;

const lcp = (value: number, rating: "good" | "needs-improvement" | "poor") =>
  ({
    value,
    rating,
    attribution: {
      target: "main>article>h1",
      timeToFirstByte: 280,
      resourceLoadDelay: 0,
      resourceLoadDuration: 0,
      elementRenderDelay: 6900.4,
    },
  }) as unknown as LCPMetricWithAttribution;

describe("inpReport", () => {
  it("stays quiet for a good interaction", () => {
    expect(inpReport(inp(120, "good"), marks, [1440, 900])).toBeNull();
  });

  it("names the element, the route it happened on and where the time went", () => {
    const r = inpReport(inp(1112, "poor"), marks, [1440, 900])!;
    expect(r.fingerprint).toEqual(["inp", "nav>div>button"]);
    expect(r.tags.inp_route).toBe("/docs/money/payment-states");
    expect(r.extra).toMatchObject({
      value: 1112,
      presentationDelay: 1101,
      longestScript: "BUTTON.onclick https://syntaqx.com/_next/static/chunks/a.js:toggle 3ms",
    });
  });
});

describe("lcpReport", () => {
  it("stays quiet for a good load", () => {
    expect(lcpReport(lcp(1200, "good"), "/books", [1440, 900])).toBeNull();
  });

  it("names the element and splits the time", () => {
    const r = lcpReport(lcp(7240, "poor"), "/books", [1440, 900])!;
    expect(r.fingerprint).toEqual(["lcp", "main>article>h1"]);
    expect(r.tags.lcp_route).toBe("/books");
    expect(r.extra).toMatchObject({ elementRenderDelay: 6900, resource: null });
  });
});
