// npm run resume:pdf
//
// Builds the full resume, as a PDF and as plain text for paste-in forms,
// with the private contact details the public site leaves out, into .private/. Both the details and the output are
// gitignored and never deployed. .private/resume.json looks like:
//
//   { "location": "City, ST 00000", "phone": "(000) 000-0000" }
import { readFileSync, writeFileSync } from "node:fs";
import { PUBLIC_CONTACT, type ResumeContact } from "../lib/resume";
import { renderResumePdf } from "../lib/resume-pdf";
import { renderResumeText } from "../lib/resume-text";

const input = ".private/resume.json";
const output = ".private/Chase Pierce - Resume";

let details: Partial<ResumeContact>;
try {
  details = JSON.parse(readFileSync(input, "utf8"));
} catch {
  console.error(
    `Missing ${input}. Create it with your private details, e.g.:\n  { "location": "City, ST 00000", "phone": "(000) 000-0000" }`,
  );
  process.exit(1);
}

const contact = { ...PUBLIC_CONTACT, ...details };
writeFileSync(`${output}.pdf`, await renderResumePdf(contact));
writeFileSync(`${output}.txt`, renderResumeText(contact));
console.log(`Wrote ${output}.pdf and ${output}.txt`);
