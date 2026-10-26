// The resume (lib/resume.ts) as plain text, for application forms that ask
// you to paste it: no markup, ASCII separators, one fact per line. Served at
// /resume.txt (public contact details); scripts/resume-pdf.mts writes the
// private copy next to the private PDF.
import { resume, type ResumeContact, type ResumeJob } from "@/lib/resume";

export function renderResumeText(
  contact: ResumeContact,
  title = resume.title,
): string {
  const dates = (j: { start: string; end: string }) => `${j.start} - ${j.end}`;
  const reach = [contact.location, contact.email, contact.phone]
    .filter(Boolean)
    .join(" | ");
  const jobs = [...resume.experience, ...resume.earlier].map((job: ResumeJob) =>
    [
      `${job.title} | ${dates(job)}`,
      job.company,
      job.progression && `Progression: ${job.progression.join(" > ")}`,
      ...(job.highlights ?? []).map((h) => `- ${h}`),
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return `${[
    `${resume.name.toUpperCase()}\n${title.replace(" · ", " | ")}\n${reach}\n${resume.links.map((l) => l.href).join(" | ")}`,
    `SUMMARY\n${resume.summary.join("\n\n")}`,
    `SKILLS\n${resume.skills.map((k) => `${k.label}: ${k.items}`).join("\n")}`,
    `EXPERIENCE\n${jobs.join("\n\n")}`,
    `EDUCATION\n${resume.education.selfTaught.title}\n${resume.education.selfTaught.details}`,
  ].join("\n\n")}\n`;
}
