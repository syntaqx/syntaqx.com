import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { DocsToc } from "@/components/docs-toc";
import { Pager, type Neighbor } from "@/components/pager";
import type { LegalDoc } from "@/lib/legal";

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

export interface GlanceItem {
  title: string;
  detail: string;
}

/**
 * A legal document in the site's reading layout: the page header, an "At a
 * glance" summary of what it says, numbered sections in the prose measure,
 * an "On this page" rail from xl, and the other document at the foot.
 */
export function LegalDocument({
  doc,
  intro,
  glance,
  sections,
  prev,
  next,
}: {
  doc: LegalDoc;
  intro: ReactNode;
  /** Each line restates something the document says; an even count fills the grid. */
  glance: GlanceItem[];
  sections: LegalSection[];
  prev?: Neighbor;
  next?: Neighbor;
}) {
  return (
    <article className="xl:grid xl:grid-cols-[minmax(0,1fr)_11rem] xl:gap-10">
      <div className="min-w-0">
        <PageHeader label="legal" title={doc.title}>
          <p>{intro}</p>
          <p className="inst mt-6 flex flex-wrap gap-x-5 gap-y-1 text-muted-foreground">
            <span>Updated {doc.updated}</span>
            <span>{sections.length} sections</span>
          </p>
        </PageHeader>

        <section aria-labelledby="at-a-glance" className="mb-14 max-w-176 border border-border">
          <h2
            id="at-a-glance"
            className="inst border-b border-border bg-card px-5 py-3 text-muted-foreground"
          >
            At a glance
          </h2>
          <ul className="grid gap-px bg-border sm:grid-cols-2">
            {glance.map((g) => (
              <li key={g.title} className="flex gap-3 bg-background px-5 py-4">
                <Check aria-hidden className="mt-1 size-4 shrink-0 text-primary" />
                <div>
                  <p className="text-foreground">{g.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{g.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="prose">
          {sections.map((s) => (
            <section key={s.id}>
              <h2 id={s.id}>
                {s.title}
                <a href={`#${s.id}`} className="heading-anchor" aria-label={`Link to ${s.title}`}>
                  #
                </a>
              </h2>
              {s.body}
            </section>
          ))}
        </div>

        <Pager prev={prev} next={next} />
      </div>
      <aside className="hidden xl:block">
        <DocsToc
          headings={sections.map((s) => ({ id: s.id, text: s.title }))}
          className="rail-scroll sticky top-16 max-h-[calc(100vh-5rem)] overflow-y-auto"
        />
      </aside>
    </article>
  );
}
