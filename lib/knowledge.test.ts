import { describe, it, expect } from "vitest";
import { isOpinion, parseTarget, read, search, searchDetailed, tokenize } from "@/lib/knowledge";
import { buildIndex, splitSections, type Section } from "@/lib/knowledge-index";

describe("tokenize", () => {
  it("drops stopwords and folds plurals", () => {
    expect(tokenize("Which webhooks should I use for the classes?")).toEqual(["webhook", "classe"]);
    expect(tokenize("Access process")).toEqual(["access", "process"]);
  });
});

describe("splitSections", () => {
  it("splits at h2/h3 with the page's anchor ids, skipping code fences and References", () => {
    const sections = splitSections(
      [
        "Intro text.",
        "## The `Header` [Spec](/x)",
        "Body one.",
        "```md",
        "## Not a heading",
        "```",
        "### Detail",
        "Body two.",
        "## Detail",
        "Again.",
        "## References",
        "1. A citation.",
      ].join("\n"),
    );
    expect(sections.map((s) => [s.heading, s.anchor])).toEqual([
      ["", ""],
      ["The Header Spec", "the-header-spec"],
      ["Detail", "detail"],
      ["Detail", "detail-1"],
    ]);
    expect(sections[1].text).toContain("## Not a heading");
  });
});

describe("isOpinion", () => {
  it("marks the playbook, posts and a book's My Default section", () => {
    expect(isOpinion({ kind: "playbook", heading: "Anything" })).toBe(true);
    expect(isOpinion({ kind: "post", heading: "" })).toBe(true);
    expect(isOpinion({ kind: "book", heading: "How to Build It" })).toBe(false);
    expect(isOpinion({ kind: "book", heading: "My Default" })).toBe(true);
  });
});

describe("search", () => {
  const section = (s: Partial<Section>): Section => ({
    kind: "playbook",
    path: "/docs/x",
    anchor: "",
    title: "X",
    heading: "",
    text: "",
    ...s,
  });
  const idx = buildIndex([
    section({
      path: "/docs/webhooks",
      title: "Webhooks",
      heading: "Signatures",
      anchor: "signatures",
      text: "Sign every delivery with HMAC.",
    }),
    section({
      path: "/docs/webhooks",
      title: "Webhooks",
      heading: "Retries",
      anchor: "retries",
      text: "Retry with backoff.",
    }),
    section({
      path: "/docs/webhooks",
      title: "Webhooks",
      heading: "Replay",
      anchor: "replay",
      text: "Let consumers replay.",
    }),
    section({
      kind: "book",
      book: "payments",
      path: "/books/payments/ach",
      title: "ACH",
      heading: "Webhooks",
      anchor: "webhooks",
      text: "Processors send webhooks for returns.",
    }),
    section({ kind: "post", path: "/posts/p", title: "A Post", text: "Nothing relevant." }),
  ]);

  it("ranks, links and caps results at two sections per page", () => {
    const results = search("webhooks", {}, idx);
    expect(results.filter((r) => r.path === "/docs/webhooks")).toHaveLength(2);
    expect(results[0].url).toMatch(/^https:\/\/www\.syntaqx\.com\/docs\/webhooks#[a-z]+$/);
    expect(results.find((r) => r.kind === "book")).toMatchObject({
      book: "payments",
      opinion: false,
    });
  });

  it("filters by kind and book", () => {
    expect(search("webhooks", { kinds: ["book"] }, idx).map((r) => r.path)).toEqual([
      "/books/payments/ach",
    ]);
    expect(search("webhooks", { book: "health-tech" }, idx)).toEqual([]);
  });

  it("returns nothing for a query of stopwords", () => {
    expect(search("what should I use", {}, idx)).toEqual([]);
  });

  it("snippets tables as text, without the rule row", () => {
    const tables = buildIndex([
      section({ text: "| Engine | License |\n| --- | --- |\n| Postgres | PostgreSQL |" }),
    ]);
    const [hit] = search("license", {}, tables);
    expect(hit.snippet).toBe("Engine · License Postgres · PostgreSQL");
  });

  it("counts options weighed together, not named in passing", () => {
    const pair = buildIndex([
      section({ path: "/docs/a", text: "Postgres or MongoDB? Postgres, unless MongoDB fits." }),
      section({ path: "/docs/b", text: "Adapters for Postgres, MySQL and MongoDB." }),
    ]);
    const { comparison } = searchDetailed("postgres or mongodb", {}, pair);
    expect(comparison).toMatchObject({ together: 1, opinionsTogether: 1 });
  });

  it("snippets around the match", () => {
    const [hit] = search("hmac", {}, idx);
    expect(hit.snippet).toContain("HMAC");
  });
});

describe("parseTarget", () => {
  it("accepts paths and syntaqx.com URLs, with anchors and .md", () => {
    expect(parseTarget("/docs/a/b")).toEqual({ path: "/docs/a/b", anchor: "" });
    expect(parseTarget("docs/a/b.md#c")).toEqual({ path: "/docs/a/b", anchor: "c" });
    expect(parseTarget("https://www.syntaqx.com/books/payments/ach?x=1#returns")).toEqual({
      path: "/books/payments/ach",
      anchor: "returns",
    });
  });
});

describe("read", () => {
  it("reads a whole page or one section of the real content", () => {
    const page = read("/docs/requests/idempotency");
    expect(page.ok && page.markdown).toMatch(/^# /);
    const [hit] = search("idempotency header", { kinds: ["playbook"] });
    const one = read(hit.path, hit.anchor);
    expect(one.ok && one.markdown).toContain(`Source: ${hit.url}`);
  });

  it("explains a missing page or section", () => {
    expect(read("/docs/nope")).toMatchObject({ ok: false });
    expect(read("/docs/requests/idempotency", "nope")).toMatchObject({ ok: false });
  });
});

describe("the prebuilt index", () => {
  it("round-trips through disk with identical results", async () => {
    const os = await import("node:os");
    const fsp = await import("node:fs/promises");
    const path = await import("node:path");
    const { writeIndex, loadIndex } = await import("@/lib/knowledge-index");
    const sections = splitSections("## Webhooks\nSign them.\n## Queues\nPostgres or a broker.").map(
      (s) => ({ kind: "playbook" as const, path: "/docs/x", title: "X", ...s }),
    );
    const built = buildIndex(sections);
    const dir = await fsp.mkdtemp(path.join(os.tmpdir(), "knowledge-"));
    try {
      writeIndex(built, dir);
      const loaded = loadIndex(dir)!;
      expect(loaded).not.toBeNull();
      for (const q of ["webhooks", "postgres or a broker", "queues"]) {
        expect(search(q, {}, loaded)).toEqual(search(q, {}, built));
      }
    } finally {
      await fsp.rm(dir, { recursive: true });
    }
  });

  it("is null when missing", async () => {
    const { loadIndex } = await import("@/lib/knowledge-index");
    expect(loadIndex("/nonexistent/knowledge")).toBeNull();
  });
});
