import { describe, it, expect } from "vitest";
import { getAllPosts, markdownToHtml } from "./posts";
import { POST_SCENES } from "./scene/scenes";
import { REST } from "./scene/iso";
import { scenes } from "./scene/scenes";
import { levels, rasterize } from "./scene/raster";

describe("feature post heroes", () => {
  const features = getAllPosts().filter((p) => p.layout === "feature");

  it("gives every feature post a hero scene", () => {
    expect(features.length).toBeGreaterThan(0);
    for (const post of features) expect(post.hero, post.slug).toBeDefined();
  });

  it("never shares a hero between posts", () => {
    const heroes = features.map((p) => p.hero);
    expect(new Set(heroes).size).toBe(heroes.length);
  });

  it("only allows post scenes, never page scenes like the home art", () => {
    expect(POST_SCENES).not.toContain("system");
  });
});

describe("scene rasterizer", () => {
  it("draws every scene with visible tiles and some accent", () => {
    for (const [name, fn] of Object.entries(scenes)) {
      const { field } = rasterize(fn(REST), 120, 90, 0);
      const lv = levels(field);
      expect(
        lv.some((v) => v > 0),
        name,
      ).toBe(true);
      expect(
        field.acc.some((v) => v > 0),
        name,
      ).toBe(true);
    }
  });
});

describe("markdownToHtml diagrams", () => {
  it("inlines a /diagrams SVG as a labelled figure with its caption", async () => {
    const html = await markdownToHtml('![Payment states, from pending to settled](/diagrams/payment-states.svg "Payment states. Teal is the happy path.")');
    expect(html).toMatch(/^<figure class="diagram"><svg role="img" aria-label="Payment states, from pending to settled" /);
    expect(html).toContain("<figcaption><strong>Payment states.</strong> Teal is the happy path.</figcaption>");
    expect(html).not.toContain("<img");
    // 1.25x its viewBox width (740) caps how far a wide column scales it.
    expect(html).toMatch(/<svg role="img" aria-label="[^"]*" width="925" /);
    // The first render loads the syntax highlighter, which can take seconds.
  }, 30_000);

  it("leaves other images alone", async () => {
    const html = await markdownToHtml("![A photo](/images/photo.png)");
    expect(html).toContain('<img src="/images/photo.png" alt="A photo">');
  });
});

describe("markdownToHtml tables", () => {
  it("wraps each table in its own scroll box", async () => {
    const html = await markdownToHtml("| Rail | Settles |\n| --- | --- |\n| ACH | T+1 |");
    expect(html).toMatch(/^<div class="table-scroll"><table>[\s\S]*<\/table><\/div>$/);
  }, 30_000);
});
