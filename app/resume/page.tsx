import { ArrowUpRight, Download } from "lucide-react";
import { Button } from "@/components/button";
import { pageMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/page-header";
import { JsonLd } from "@/components/json-ld";
import { profilePage } from "@/lib/schema";
import { resumeLastModified } from "@/lib/doc-dates";
import { PUBLIC_CONTACT, resume } from "@/lib/resume";

export const metadata = pageMetadata(
  "/resume",
  "Resume",
  "The resume of Chase Pierce (syntaqx), software architect and engineering leader: two decades of platforms, teams and delivery. Also available as a PDF.",
);

const link =
  "text-foreground underline decoration-accent underline-offset-4 hover:text-accent";

export default function ResumePage() {
  return (
    <div>
      <JsonLd
        data={profilePage({
          path: "/resume",
          headline: `Resume of ${resume.name}`,
          description: resume.summary[0],
          dateModified: resumeLastModified(),
          crumbs: [{ name: "Resume", path: "/resume" }],
        })}
      />
      <PageHeader
        label="resume"
        title={resume.name}
        scene="career"
        sceneLabel="A career as a skyline of roles along a timeline, a playhead lighting each in turn"
        hideSceneOnMobile
      >
        <p className="mb-6 text-lg text-muted">{resume.title}</p>
        <p className="mb-8 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          <span>{PUBLIC_CONTACT.location}</span>
          <a href={`mailto:${PUBLIC_CONTACT.email}`} className={link}>
            {PUBLIC_CONTACT.email}
          </a>
          {resume.links.map((l) => (
            <a key={l.href} href={l.href} className={link}>
              {l.label}
            </a>
          ))}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button href="/resume.pdf" download>
            Download PDF
            <Download size={13} />
          </Button>
          <Button href="/resume.pdf" variant="secondary" external>
            View PDF
            <ArrowUpRight size={13} />
          </Button>
          <Button href="/resume.txt" variant="secondary" external>
            Plain text
            <ArrowUpRight size={13} />
          </Button>
        </div>
      </PageHeader>

      <div className="max-w-3xl">
        <section className="mb-14">
          <h2 className="eyebrow mb-6">summary</h2>
          <div className="space-y-5 text-[1.0625rem] leading-relaxed text-muted">
            {resume.summary.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </section>

        <section className="mb-14">
          <h2 className="eyebrow mb-2">technical skills</h2>
          <p className="mb-6 text-dim">{resume.skillsIntro}</p>
          <dl className="border-t border-border">
            {resume.skills.map((k) => (
              <div
                key={k.label}
                className="grid gap-1 border-b border-border py-3 sm:grid-cols-[10rem_1fr] sm:gap-6"
              >
                <dt className="font-semibold text-foreground">{k.label}</dt>
                <dd className="leading-relaxed text-muted">{k.items}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mb-14">
          <h2 className="eyebrow mb-6">experience</h2>
          <ol className="border-t border-border">
            {resume.experience.map((job) => (
              <li
                key={`${job.company} ${job.title}`}
                className="border-b border-border py-6"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {job.title} <span className="text-muted">at</span>{" "}
                    {job.company}
                  </h3>
                  <p className="inst text-dim">
                    {job.start} - {job.end}
                  </p>
                </div>
                {job.progression && (
                  <p className="mt-1 text-sm text-dim">
                    {job.progression.join(" → ")}
                  </p>
                )}
                {job.highlights && (
                  <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-muted marker:text-accent">
                    {job.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            <li className="border-b border-border py-6">
              <h3 className="mb-3 text-lg font-semibold text-foreground">
                Earlier roles
              </h3>
              <ul className="space-y-1.5">
                {resume.earlier.map((job) => (
                  <li
                    key={job.company}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 text-muted"
                  >
                    <span>
                      {job.title} <span className="text-dim">at</span>{" "}
                      {job.company}
                    </span>
                    <span className="inst text-dim">
                      {job.start} - {job.end}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          </ol>
          <p className="mt-6 text-muted">
            {resume.more.text}{" "}
            <a href={resume.more.href} className={link}>
              {resume.more.label}
            </a>
          </p>
        </section>

        <section className="mb-14">
          <h2 className="eyebrow mb-6">education</h2>
          <ul className="border-t border-border">
            <li className="border-b border-border py-6">
              <h3 className="text-lg font-semibold text-foreground">
                {resume.education.selfTaught.title}
              </h3>
              <p className="mt-1 text-muted">
                {resume.education.selfTaught.details}
              </p>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
