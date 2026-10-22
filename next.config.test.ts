import { describe, it, expect } from "vitest";
import { markdownRewrites } from "./next.config";

const all = [...markdownRewrites.beforeFiles, ...markdownRewrites.fallback];

describe("Markdown content negotiation rewrites", () => {
  it("only apply when Accept asks for text/markdown, and never on the API host", () => {
    for (const r of all) {
      expect(r.has).toEqual([
        { type: "header", key: "accept", value: ".*text/markdown.*" },
      ]);
      expect(r.missing).toEqual([{ type: "host", value: "api.syntaqx.com" }]);
      expect(r.destination.startsWith("/md")).toBe(true);
    }
    const accept = new RegExp(`^${all[0].has[0].value}$`);
    expect(accept.test("text/markdown")).toBe(true);
    expect(accept.test("text/markdown, text/html;q=0.9")).toBe(true);
    expect(accept.test("text/html,application/xhtml+xml,*/*;q=0.8")).toBe(false);
  });

  it("rewrite the homepage up front and send would-be 404s to the Markdown 404", () => {
    expect(markdownRewrites.beforeFiles).toContainEqual(
      expect.objectContaining({ source: "/", destination: "/md" }),
    );
    expect(markdownRewrites.fallback).toEqual([
      expect.objectContaining({ source: "/:path*", destination: "/md/:path*" }),
    ]);
  });
});
