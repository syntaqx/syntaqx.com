import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button } from "@/registry/syntaqx/ui/button";

const render = (props: Record<string, unknown>, ...children: unknown[]) =>
  renderToStaticMarkup(h(Button, props, ...(children as never[])));

describe("Button shapes", () => {
  it("renders shadcn's markup by default: no label span, no shape attribute", () => {
    const html = render({}, "Save");
    expect(html).not.toContain("button-label");
    expect(html).not.toContain("data-shape");
    expect(html).toMatch(/^<button[^>]*>Save<\/button>$/);
  });

  it("wraps the content in a label for any other shape", () => {
    const html = render({ shape: "slant" }, "Save");
    expect(html).toContain('data-shape="slant"');
    expect(html).toMatch(/<span data-slot="button-label"[^>]*>Save<\/span><\/button>$/);
  });

  it("puts the label inside an asChild link, around the link's own content", () => {
    const html = render({ asChild: true, shape: "slant" }, h("a", { href: "/about" }, "About"));
    expect(html).toMatch(
      /^<a [^>]*href="\/about"[^>]*><span data-slot="button-label"[^>]*>About<\/span><\/a>$/,
    );
  });

  it("leaves an asChild link alone in the default shape", () => {
    const html = render({ asChild: true }, h("a", { href: "/about" }, "About"));
    expect(html).toMatch(/^<a [^>]*>About<\/a>$/);
  });

  it("keeps the spinner and the hidden label inside the shape's label", () => {
    const html = render({ shape: "slant", loading: true }, "Save");
    expect(html).toMatch(
      /<span data-slot="button-label"[^>]*><span class="invisible[^"]*">Save<\/span><svg/,
    );
  });
});
