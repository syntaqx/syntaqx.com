import { describe, it, expect } from "vitest";
import { getAllPosts, markdownToHtml } from "./posts";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { BOOKS } from "./books";
import { BOOKS_INDEX_SCENE, BOOK_SCENES, POST_SCENES } from "./scene/scenes";
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

describe("book covers", () => {
  // Scenes pages pass by name: scene="x" on a header, scene: "x" on an OG card.
  const pageScenes = new Set(
    readdirSync("app", { recursive: true, encoding: "utf8" })
      .filter((f) => f.endsWith(".tsx"))
      .flatMap((f) => [...readFileSync(join("app", f), "utf8").matchAll(/scene(?:=|: )"(\w+)"/g)].map((m) => m[1])),
  );

  it("gives every book its own cover scene", () => {
    const covers = BOOKS.map((b) => b.cover);
    for (const book of BOOKS) expect(BOOK_SCENES, book.slug).toContain(book.cover);
    expect(new Set(covers).size).toBe(covers.length);
  });

  it("never shares a cover with a post or a page", () => {
    expect(pageScenes.size).toBeGreaterThan(0);
    for (const scene of BOOK_SCENES) {
      expect(POST_SCENES as readonly string[], scene).not.toContain(scene);
      expect(pageScenes.has(scene), scene).toBe(false);
    }
  });

  it("gives the books index a scene of its own", () => {
    expect([...POST_SCENES, ...BOOK_SCENES] as string[]).not.toContain(BOOKS_INDEX_SCENE);
    expect(pageScenes.has(BOOKS_INDEX_SCENE)).toBe(false);
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
    // The first render loads the syntax highlighter, which can take seconds.
  }, 30_000);

  it("leaves other images alone", async () => {
    const html = await markdownToHtml("![A photo](/images/photo.png)");
    expect(html).toContain('<img src="/images/photo.png" alt="A photo">');
  });
});
