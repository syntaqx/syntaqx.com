import { describe, it, expect } from "vitest";
import { markdownRewrites, sectionRedirects } from "./next.config";

// The .md suffix rules answer whatever the Accept header says.
const suffix = markdownRewrites.beforeFiles.filter((r) => !("has" in r));
const all = [...markdownRewrites.beforeFiles, ...markdownRewrites.fallback].filter((r) => "has" in r);

describe("Markdown .md URLs", () => {
  it("serve docs and books at their path plus .md, never on the API host", () => {
    expect(suffix.map(({ source, destination }) => ({ source, destination }))).toEqual([
      { source: "/docs/:path*.md", destination: "/md/docs/:path*" },
      { source: "/books/:path*.md", destination: "/md/books/:path*" },
    ]);
    for (const r of suffix) {
      expect(r.missing).toEqual([{ type: "host", value: "api.syntaqx.com" }]);
    }
    // Ahead of the Accept rewrites, which would send /docs/x.md to /md/docs/x.md.
    expect(markdownRewrites.beforeFiles.slice(0, 2)).toEqual(suffix);
  });
});

describe("Markdown content negotiation rewrites", () => {
  it("only apply when Accept asks for text/markdown, and never on the API host", () => {
    for (const r of all) {
      expect(r.has).toEqual([
        { type: "header", key: "accept", value: ".*text/markdown.*" },
      ]);
      expect(r.missing).toEqual([{ type: "host", value: "api.syntaqx.com" }]);
      expect(r.destination.startsWith("/md")).toBe(true);
    }
    const accept = new RegExp(`^${markdownRewrites.fallback[0].has[0].value}$`);
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

describe("/misc redirects", () => {
  // The first rule whose source matches wins, as in Next.js.
  const destination = (path: string) => {
    for (const r of sectionRedirects) {
      const re = new RegExp(`^${r.source.replace("/:path*", "(?:/(.*))?")}$`);
      const m = path.match(re);
      if (m) return r.destination.replace("/:path*", m[1] ? `/${m[1]}` : "");
    }
  };

  it("send the pattern pages to /ui and everything else to /tools", () => {
    expect(destination("/misc")).toBe("/tools");
    expect(destination("/misc/jwt")).toBe("/tools/jwt");
    expect(destination("/misc/convert/base64")).toBe("/tools/convert/base64");
    expect(destination("/misc/hover-cards")).toBe("/ui/patterns/hover-cards");
    expect(destination("/misc/feedback")).toBe("/ui/patterns/feedback");
    expect(destination("/ui/patterns")).toBe("/ui");
    expect(sectionRedirects.every((r) => r.permanent)).toBe(true);
  });
});
