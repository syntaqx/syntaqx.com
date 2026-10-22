import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET as listDocs } from "@/app/api/docs/route";
import { GET as getDoc } from "@/app/api/docs/[...slug]/route";
import { queryDocsHandler } from "./docs-api";
import { getAllDocs } from "./docs";

const base = "http://localhost/api/docs";
const list = (qs = "") => listDocs(new NextRequest(`${base}${qs}`));
type Summary = { slug: string; section: string; title: string; position: number; tags: string[] };

describe("GET /docs", () => {
  it("returns a bare array in playbook order, 25 at a time, with a next Link", async () => {
    const res = await list();
    expect(res.status).toBe(200);
    const docs = (await res.json()) as Summary[];
    expect(docs).toHaveLength(25);
    expect(docs[0].slug).toBe("playbook");
    expect(docs.map((d) => d.position)).toEqual(docs.map((_, i) => i + 1));
    expect(res.headers.get("Link")).toMatch(/^<http:\/\/localhost\/api\/docs\?cursor=[\w-]+>; rel="next"$/);
    expect(res.headers.get("ETag")).toBeTruthy();
  });

  it("walks every doc exactly once by following Link to the end", async () => {
    const seen: string[] = [];
    let url: string | null = `${base}?limit=7`;
    while (url) {
      const res = await listDocs(new NextRequest(url));
      seen.push(...((await res.json()) as Summary[]).map((d) => d.slug));
      url = res.headers.get("Link")?.match(/^<([^>]+)>/)?.[1] ?? null;
    }
    expect(seen).toEqual(getAllDocs().map((d) => d.slug));
  });

  it("filters by section and tag (comma means any of) and free text", async () => {
    const payments = (await (await list("?section=payments,security")).json()) as Summary[];
    expect(payments.length).toBeGreaterThan(0);
    expect(new Set(payments.map((d) => d.section))).toEqual(new Set(["payments", "security"]));

    const tagged = (await (await list("?tag=idempotency")).json()) as Summary[];
    expect(tagged.every((d) => d.tags.includes("idempotency"))).toBe(true);

    const text = (await (await list("?q=webhook&limit=100")).json()) as Summary[];
    expect(text.map((d) => d.slug)).toContain("payments/webhooks");
  });

  it("sorts by title, descending with -, using slug as the tiebreaker", async () => {
    const docs = (await (await list("?sort=-title&limit=100")).json()) as Summary[];
    const titles = docs.map((d) => d.title);
    expect(titles).toEqual([...titles].sort((a, b) => b.localeCompare(a)));
  });

  it("rejects unknown parameters, bad sorts and over-limit pages with 422", async () => {
    for (const qs of ["?secton=payments", "?sort=created_at", "?limit=101", "?limit=0"]) {
      const res = await list(qs);
      expect(res.status, qs).toBe(422);
      expect((await res.json()).errors, qs).toBeTruthy();
    }
  });

  it("rejects a cursor reused with different filters", async () => {
    const first = await list("?section=payments&limit=2");
    const cursor = new URL(first.headers.get("Link")!.match(/^<([^>]+)>/)![1]).searchParams.get("cursor");
    const res = await list(`?section=security&limit=2&cursor=${cursor}`);
    expect(res.status).toBe(422);
    expect((await res.json()).errors.cursor).toBeTruthy();
  });

  it("answers QUERY bodies with the same results as GET", async () => {
    const viaGet = (await (await list("?section=payments&sort=title")).json()) as Summary[];
    const viaQuery = await queryDocsHandler(
      new Request(base, {
        method: "POST",
        body: JSON.stringify({ section: ["payments"], sort: "title" }),
      }),
    );
    expect(await viaQuery.json()).toEqual(viaGet);
  });
});

describe("GET /docs/{slug}", () => {
  it("returns one doc with its Markdown, and 404 for an unknown slug", async () => {
    const ok = await getDoc(new Request(`${base}/payments/idempotency`), {
      params: Promise.resolve({ slug: ["payments", "idempotency"] }),
    });
    expect(ok.status).toBe(200);
    const doc = await ok.json();
    expect(doc).toMatchObject({ slug: "payments/idempotency", section: "payments", title: "Idempotency" });
    expect(doc.content).toContain("Idempotency-Key");

    const missing = await getDoc(new Request(`${base}/nope`), { params: Promise.resolve({ slug: ["nope"] }) });
    expect(missing.status).toBe(404);
  });
});
