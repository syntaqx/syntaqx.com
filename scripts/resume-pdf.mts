// npm run resume:pdf
//
// Builds the full resume PDF, with the private contact details the public
// site leaves out, into .private/. Both the details and the output are
// gitignored and never deployed. .private/resume.json looks like:
//
//   { "location": "City, ST 00000", "phone": "(000) 000-0000" }
import { readFileSync, writeFileSync } from "node:fs";
import { PUBLIC_CONTACT, type ResumeContact } from "../lib/resume";
import { renderResumePdf } from "../lib/resume-pdf";

const input = ".private/resume.json";
const output = ".private/Chase Pierce - Resume.pdf";

let details: Partial<ResumeContact>;
try {
  details = JSON.parse(readFileSync(input, "utf8"));
} catch {
  console.error(
    `Missing ${input}. Create it with your private details, e.g.:\n  { "location": "City, ST 00000", "phone": "(000) 000-0000" }`,
  );
  process.exit(1);
}

writeFileSync(output, await renderResumePdf({ ...PUBLIC_CONTACT, ...details }));
console.log(`Wrote ${output}`);
