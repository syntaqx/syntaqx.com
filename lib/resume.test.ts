import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { GET as resumePdf } from "@/app/resume.pdf/route";
import { renderMarkdownPage } from "@/lib/markdown";
import { PUBLIC_CONTACT, resume } from "@/lib/resume";
import { resumeHostRedirects } from "@/next.config";

// Private details belong in the gitignored .private/resume.json, never in
// the repo (so not in this test either): phone- and ZIP-shaped text always
// fails, and where the private file exists, so does any of its values.
const PRIVATE: (RegExp | string)[] = [
  /\(?\d{3}\)?[\s.-]?\d{3}[\s.-]\d{4}/,
  /\b\d{5}(-\d{4})?\b/,
];
if (existsSync(".private/resume.json")) {
  const details: Record<string, string> = JSON.parse(
    readFileSync(".private/resume.json", "utf8"),
  );
  PRIVATE.push(...Object.values(details).flatMap((v) => v.split(/,\s*/)));
}

describe("resume", () => {
  // The public PDF renders from exactly this data, so checking it covers the
  // PDF too (its text is stored as glyph IDs, so its bytes can't be grepped).
  it("keeps private details out of everything public", () => {
    for (const text of [
      JSON.stringify(resume),
      JSON.stringify(PUBLIC_CONTACT),
      renderMarkdownPage("/resume").body,
    ]) {
      for (const p of PRIVATE)
        if (typeof p === "string") expect(text).not.toContain(p);
        else expect(text).not.toMatch(p);
    }
    expect(PUBLIC_CONTACT.phone).toBeUndefined();
  });

  it("serves a PDF", async () => {
    const res = await resumePdf();
    expect(res.headers.get("content-type")).toBe("application/pdf");
    const bytes = Buffer.from(await res.arrayBuffer());
    expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
  });

  it("has a Markdown version", () => {
    const { status, body } = renderMarkdownPage("/resume");
    expect(status).toBe(200);
    expect(body).toContain(`# ${resume.name}`);
    expect(body).toContain("## Experience");
    expect(body).toContain("/resume.pdf");
  });

  it("sends resume.syntaqx.com to the resume on the main site", () => {
    expect(resumeHostRedirects).toEqual([
      expect.objectContaining({
        source: "/resume.pdf",
        destination: "https://www.syntaqx.com/resume.pdf",
      }),
      expect.objectContaining({
        source: "/:path*",
        destination: "https://www.syntaqx.com/resume",
      }),
    ]);
    for (const r of resumeHostRedirects)
      expect(r.has).toEqual([{ type: "host", value: "resume.syntaqx.com" }]);
  });
});
