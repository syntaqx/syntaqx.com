import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { extractText } from "unpdf";
import { GET as resumePdf } from "@/app/resume.pdf/route";
import { GET as resumeText } from "@/app/resume.txt/route";
import { renderMarkdownPage } from "@/lib/markdown";
import { PUBLIC_CONTACT, resume } from "@/lib/resume";
import { renderResumePdf } from "@/lib/resume-pdf";
import { renderResumeText } from "@/lib/resume-text";
import { resumeHostRedirects } from "@/next.config";

// Private details belong in the gitignored .private/resume.json, never in
// the repo (so not in this test either): phone- and ZIP-shaped text always
// fails, and where the private file exists, so does its location or phone
// (its headlines aren't private).
const PRIVATE: (RegExp | string)[] = [
  /\(?\d{3}\)?[\s.-]?\d{3}[\s.-]\d{4}/,
  /\b\d{5}(-\d{4})?\b/,
];
if (existsSync(".private/resume.json")) {
  const { location, phone }: Record<string, string | undefined> = JSON.parse(
    readFileSync(".private/resume.json", "utf8"),
  );
  PRIVATE.push(...[location, phone].flatMap((v) => (v ? v.split(/,\s*/) : [])));
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

  // Some parsers (OpenResume, for one) put no line break between pages, so
  // a page's last line fuses with the next page's first. That's harmless
  // inside one role, but a page that opens on a new role, company or section
  // gets that heading swallowed into the entry above it.
  it("breaks pages inside an entry, never before a heading", async () => {
    const pdf = new Uint8Array(await (await resumePdf()).arrayBuffer());
    const { text: pages } = await extractText(pdf, { mergePages: false });
    const headings = [
      "SUMMARY",
      "TECHNICAL SKILLS",
      "EXPERIENCE",
      "EDUCATION",
      ...[...resume.experience, ...resume.earlier].flatMap((j) => [
        j.title,
        j.company,
      ]),
      resume.education.selfTaught.title,
    ];
    for (const page of pages.slice(1)) {
      const first = page.trim().split("\n")[0].trim();
      for (const heading of headings)
        expect(first.startsWith(heading)).toBe(false);
    }
  });

  it("fits on two pages", async () => {
    const pdf = Buffer.from(await (await resumePdf()).arrayBuffer()).toString(
      "latin1",
    );
    // Each page is a "/Type /Page" object; "/Type /Pages" is the page tree.
    expect(pdf.match(/\/Type \/Page(?!s)/g)).toHaveLength(2);
  });

  // What an applicant tracking system gets: the PDF's text, extracted with
  // pdf.js. Every fact has to come out verbatim, in reading order.
  it("extracts cleanly for applicant tracking systems", async () => {
    const pdf = new Uint8Array(await (await resumePdf()).arrayBuffer());
    const { text } = await extractText(pdf, { mergePages: true });
    const flat = text.replace(/\s+/g, " ");
    expect(flat.trimStart().startsWith(resume.name.toUpperCase())).toBe(true);
    for (const heading of [
      "SUMMARY",
      "TECHNICAL SKILLS",
      "EXPERIENCE",
      "EDUCATION",
    ])
      expect(flat).toContain(` ${heading} `);
    const facts = [
      resume.title.replace(" · ", " | "),
      PUBLIC_CONTACT.email,
      ...resume.summary,
      ...resume.skills.flatMap((k) => [k.label, k.items]),
      ...[...resume.experience, ...resume.earlier].map(
        (job) => `${job.start} - ${job.end}`,
      ),
      ...resume.experience.flatMap((job) => job.highlights ?? []),
      resume.education.selfTaught.details,
    ];
    for (const fact of facts) expect(flat).toContain(fact.replace(/\s+/g, " "));
    // Parsers find a role by its title and company lines; each must come out
    // as a clean line of its own, never glued to a neighbor.
    const lines = text.split("\n").map((l) => l.trim());
    for (const job of [...resume.experience, ...resume.earlier]) {
      expect(lines.some((l) => l.startsWith(job.title))).toBe(true);
      expect(lines).toContain(job.company);
    }
    // No header or footer: running text repeated on every page bleeds into
    // the content around page breaks.
    expect(flat.match(new RegExp(resume.name, "gi"))).toHaveLength(1);
  });

  // The private copy (npm run resume:pdf) adds a phone and a full address,
  // and can swap the headline for the roles being applied to. A made-up
  // contact stands in for the real one, which never enters the repo.
  it("renders private contact details in the private copy", async () => {
    const contact = {
      ...PUBLIC_CONTACT,
      location: "Springfield, IL 62701",
      phone: "(555) 010-4477",
    };
    const title = "Principal Software Engineer · Software Architect";
    const pdf = new Uint8Array(await renderResumePdf(contact, title));
    const { text } = await extractText(pdf, { mergePages: true });
    const header = text.split("\n").slice(0, 6).join(" ");
    expect(header).toContain(
      "Principal Software Engineer | Software Architect",
    );
    expect(header).toContain(contact.location);
    expect(header).toContain(contact.phone);
    expect(header).toContain(contact.email);
    const plain = renderResumeText(contact).split("\n")[2];
    expect(plain).toBe(
      `${contact.location} | ${contact.email} | ${contact.phone}`,
    );
  });

  it("has a plain-text version", async () => {
    const res = await resumeText();
    expect(res.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    const text = await res.text();
    expect(text.startsWith(resume.name.toUpperCase())).toBe(true);
    for (const heading of ["SUMMARY", "SKILLS", "EXPERIENCE", "EDUCATION"])
      expect(text).toContain(`
${heading}
`);
    for (const p of PRIVATE)
      if (typeof p === "string") expect(text).not.toContain(p);
      else expect(text).not.toMatch(p);
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
