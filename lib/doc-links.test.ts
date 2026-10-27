import { describe, it, expect } from "vitest";
import { classify, extractLinks, renderReport } from "./doc-links";

describe("extractLinks()", () => {
  it("returns cited link targets, deduped and without fragments", () => {
    const md = [
      "See [RFC 9110](https://datatracker.ietf.org/doc/html/rfc9110#section-9).",
      "And [again](https://datatracker.ietf.org/doc/html/rfc9110) plus [MDN](https://developer.mozilla.org/x).",
      "An [internal link](/docs/requests/caching) and a bare https://example.com/not-a-citation.",
    ].join("\n");
    expect(extractLinks(md)).toEqual([
      "https://datatracker.ietf.org/doc/html/rfc9110",
      "https://developer.mozilla.org/x",
    ]);
  });

  it("ignores URLs inside fenced code blocks, which are examples", () => {
    const md = [
      "```http",
      "Link: <https://api.syntaqx.com/payments?cursor=abc>; rel=\"next\"",
      "[not real](https://api.example.com/x)",
      "```",
      "[real](https://www.rfc-editor.org/rfc/rfc8288)",
    ].join("\n");
    expect(extractLinks(md)).toEqual(["https://www.rfc-editor.org/rfc/rfc8288"]);
  });

  it("keeps balanced parentheses inside a URL", () => {
    const md =
      "[Apple](https://developer.apple.com/documentation/uikit/x/applicationdidenterbackground(_:)), then (see [this](https://example.com/a)).";
    expect(extractLinks(md)).toEqual([
      "https://developer.apple.com/documentation/uikit/x/applicationdidenterbackground(_:)",
      "https://example.com/a",
    ]);
  });
});

describe("classify()", () => {
  it("treats only definite absence as dead", () => {
    expect(classify({ status: 200 })).toBe("ok");
    expect(classify({ status: 301 })).toBe("ok");
    expect(classify({ status: 404 })).toBe("dead");
    expect(classify({ status: 410 })).toBe("dead");
    expect(classify({ errorCode: "ENOTFOUND" })).toBe("dead");
  });

  it("treats bot walls, rate limits, server errors and timeouts as uncertain", () => {
    for (const status of [401, 403, 429, 500, 503]) expect(classify({ status })).toBe("uncertain");
    expect(classify({ errorCode: "TIMEOUT" })).toBe("uncertain");
    expect(classify({ errorCode: "ECONNRESET" })).toBe("uncertain");
  });
});

describe("renderReport()", () => {
  const results = [
    { url: "https://a.example/gone", status: "dead" as const, detail: "404", citedBy: ["content/docs/x.md"] },
    { url: "https://b.example/blocked", status: "uncertain" as const, detail: "403", citedBy: ["docs/adr/0001.md"] },
    { url: "https://c.example/fine", status: "ok" as const, detail: "200", citedBy: ["content/docs/y.md"] },
  ];

  it("summarizes counts and lists dead and uncertain links with where they're cited", () => {
    const report = renderReport(results);
    expect(report).toContain("3 cited URLs: 1 dead, 1 uncertain, 1 OK.");
    expect(report).toContain("- https://a.example/gone (404), cited in `content/docs/x.md`");
    expect(report).toContain("https://b.example/blocked");
    expect(report).not.toContain("https://c.example/fine");
  });

  it("can render only the dead links, for the issue body", () => {
    const report = renderReport(results, { deadOnly: true });
    expect(report).toContain("https://a.example/gone");
    expect(report).not.toContain("https://b.example/blocked");
  });
});
