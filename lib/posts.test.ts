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

  it("renders GitHub Flavored Markdown: tables, strikethrough, task lists, autolinks, footnotes", async () => {
    const html = await markdownToHtml(
      "| a | b |\n| - | - |\n| 1 | 2 |\n\n~~gone~~\n\n- [x] done\n- [ ] todo\n\nSee https://example.com.\n\nNoted.[^1]\n\n[^1]: The footnote.",
    );
    expect(html).toContain("<table>");
    expect(html).toContain("<del>gone</del>");
    expect(html).toContain('<input type="checkbox" checked disabled>');
    expect(html).toContain('<a href="https://example.com">https://example.com</a>');
    expect(html).toContain('data-footnotes');
  });

  it("turns a GitHub alert blockquote into a titled callout", async () => {
    const html = await markdownToHtml("> [!NOTE] Lucky me\n> Bought in **2014**.");
    expect(html).toMatch(/^<aside class="callout callout-note"><p class="callout-title"><svg viewBox="0 0 16 16" aria-hidden="true">.*<\/svg>Lucky me<\/p>/);
    expect(html).toContain("<p>Bought in <strong>2014</strong>.</p>");
    expect(html).not.toContain("[!NOTE]");
    expect(html).not.toContain("<blockquote");
  });

  it("defaults the callout title to its type and leaves plain quotes alone", async () => {
    expect(await markdownToHtml("> [!warning]\n> Careful.")).toContain('<p class="callout-title"><svg viewBox="0 0 16 16" aria-hidden="true">');
    expect(await markdownToHtml("> [!warning]\n> Careful.")).toContain("</svg>Warning</p>");
    expect(await markdownToHtml("> Just a quote.")).toContain("<blockquote>");
  });

  it("groups consecutive tab-named code blocks into one tabbed block", async () => {
    const html = await markdownToHtml(
      '```java tab="Java"\nJava();\n```\n\n```python tab="Python"\npython()\n```\n\nAfter.',
    );
    expect(html).toMatch(/^<div class="code-tabs" data-code-tabs="">/);
    expect(html).toContain(
      '<button type="button" role="tab" aria-selected="true" tabindex="0" data-tab="Java">Java</button>' +
        '<button type="button" role="tab" aria-selected="false" tabindex="-1" data-tab="Python">Python</button>',
    );
    expect(html).toContain('<div role="tabpanel" aria-label="Java" data-tab="Java"><pre class="shiki');
    expect(html).toContain('<div role="tabpanel" aria-label="Python" data-tab="Python" hidden><pre class="shiki');
    expect(html).toContain("<p>After.</p>");
  });

  it("leaves a lone tab-named block and untagged blocks as plain code", async () => {
    const html = await markdownToHtml('```bash tab="Shell"\nls\n```\n\n```bash\npwd\n```');
    expect(html).not.toContain("code-tabs");
    expect(html.match(/<pre class="shiki/g)).toHaveLength(2);
  });

  it("leaves other images alone", async () => {
    const html = await markdownToHtml("![A photo](/images/photo.png)");
    expect(html).toContain('<img src="/images/photo.png" alt="A photo">');
  });
});
