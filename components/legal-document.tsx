import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PostToc } from "@/components/post-toc";
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
 * A legal document in the posts' reading layout, since there's no sidebar:
 * contents on the left, the reading column centered, details on the right.
 * Under the header, an "At a glance" summary of what it says, then numbered
 * sections, then the other document.
 */
export function LegalDocument({
  doc,
  intro,
  glance,
  sections,
  other,
  prev,
  next,
}: {
  doc: LegalDoc;
  intro: ReactNode;
  /** Each line restates something the document says; an even count fills the grid. */
  glance: GlanceItem[];
  sections: LegalSection[];
  /** The other legal document, for the details rail. */
  other: LegalDoc;
  prev?: Neighbor;
  next?: Neighbor;
}) {
  return (
    <article>
      <PageHeader label="legal" title={doc.title}>
        <p>{intro}</p>
      </PageHeader>

      {/* Contents | reading column | details, as on a post. */}
      <div className="grid gap-10 lg:grid-cols-[minmax(0,16rem)_minmax(0,44rem)] xl:grid-cols-[minmax(0,1fr)_minmax(0,44rem)_minmax(0,1fr)]">
        <PostToc headings={sections.map((s) => ({ id: s.id, text: s.title }))} />

        <div className="min-w-0" data-toc-body>
          <section aria-labelledby="at-a-glance" className="mb-12 border border-border">
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

        <aside className="hidden self-start xl:sticky xl:top-24 xl:grid xl:gap-8">
          <dl className="border-t border-border">
            {[
              ["updated", doc.updated],
              ["sections", String(sections.length)],
              ["covers", "syntaqx.com"],
              ["owner", "Chase Pierce"],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex items-baseline justify-between gap-4 border-b border-border py-2.5"
              >
                <dt className="inst text-muted-foreground">{k}</dt>
                <dd className="text-sm text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
          <nav aria-label="Also">
            <p className="inst mb-1 text-muted-foreground">also</p>
            <Link
              href={other.href}
              className="flex items-baseline justify-between gap-4 border-y border-border py-2.5 text-sm text-foreground transition-colors hover:text-primary"
            >
              {other.title}
              <ArrowRight aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
            </Link>
          </nav>
        </aside>
      </div>
    </article>
  );
}
