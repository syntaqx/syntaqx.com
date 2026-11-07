import { describe, expect, it } from "vitest";
import { markdownAlternates, pageMetadata } from "./metadata";

describe("canonical URLs", () => {
  it("gives every pageMetadata page its own canonical, keeping the feed", () => {
    expect(pageMetadata("/about", "About", "D").alternates).toEqual({
      canonical: "/about",
      types: { "application/rss+xml": [{ url: "/feed.xml", title: "syntaqx RSS feed" }] },
    });
  });

  it("gives docs and books pages a canonical beside their Markdown", () => {
    expect(markdownAlternates("/docs/x")).toMatchObject({
      canonical: "/docs/x",
      types: { "text/markdown": "/docs/x.md" },
    });
  });
});
