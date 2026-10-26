// npm run resume:pdf
//
// Builds the full resume, as a PDF and as plain text for paste-in forms,
// with the private contact details the public site leaves out, into .private/. Both the details and the output are
// gitignored and never deployed. .private/resume.json looks like:
//
//   { "location": "City, ST 00000", "phone": "(000) 000-0000" }
//
// Optional "headlines" build one more copy per track you're applying for,
// each with its own headline under the name, into .private/<track>/:
//
//   "headlines": { "ic": "Principal Software Engineer · Software Architect" }
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { PUBLIC_CONTACT, resume, type ResumeContact } from "../lib/resume";
import { renderResumePdf } from "../lib/resume-pdf";
import { renderResumeText } from "../lib/resume-text";

const input = ".private/resume.json";
const file = "Chase Pierce - Resume";

let details: Partial<ResumeContact> & { headlines?: Record<string, string> };
try {
  details = JSON.parse(readFileSync(input, "utf8"));
} catch {
  console.error(
    `Missing ${input}. Create it with your private details, e.g.:\n  { "location": "City, ST 00000", "phone": "(000) 000-0000" }`,
  );
  process.exit(1);
}

const { headlines = {}, ...rest } = details;
const contact = { ...PUBLIC_CONTACT, ...rest };
for (const [dir, title] of [
  [".private", resume.title],
  ...Object.entries(headlines).map(([track, t]) => [`.private/${track}`, t]),
]) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/${file}.pdf`, await renderResumePdf(contact, title));
  writeFileSync(`${dir}/${file}.txt`, renderResumeText(contact, title));
  console.log(`Wrote ${dir}/${file}.pdf and .txt`);
}
