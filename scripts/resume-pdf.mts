// npm run resume:pdf
//
// Builds the full resume, as a PDF and as plain text for paste-in forms,
// with the private contact details the public site leaves out, into .private/. Both the details and the output are
// gitignored and never deployed. .private/resume.json looks like:
//
//   { "location": "City, ST 00000", "phone": "(000) 000-0000" }
//
// Optional "headlines" build one copy per track you're applying for, each
// with its own headline under the name, into .private/<track>/ (without
// them, one copy with the site's headline goes in .private/):
//
//   "headlines": {
//     "ic": "Principal Software Engineer · Software Architect",
//     "management": "Software Architect · Engineering Executive"
//   }
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

const { headlines, ...rest } = details;
const contact = { ...PUBLIC_CONTACT, ...rest };
// Each track's files are prefixed ("IC - ", "Management - ") so uploads
// to the same site stay tellable apart.
const label = (track: string) =>
  track.length <= 3 ? track.toUpperCase() : track[0].toUpperCase() + track.slice(1);
const copies = headlines
  ? Object.entries(headlines).map(([track, t]) => [`.private/${track}`, t, `${label(track)} - ${file}`])
  : [[".private", resume.title, file]];
for (const [dir, title, name] of copies) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/${name}.pdf`, await renderResumePdf(contact, title));
  writeFileSync(`${dir}/${name}.txt`, renderResumeText(contact, title));
  console.log(`Wrote ${dir}/${name}.pdf and .txt`);
}
