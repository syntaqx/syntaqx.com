import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { isIndustry } from "@/lib/industries";
import { ArrowRight } from "lucide-react";
import { DocsHeader } from "@/components/docs-header";
import { IndustryCards, type IndustryCard } from "@/components/industry-cards";

export interface DocsIndexEntry {
  href: string;
  title: string;
  description: string;
}

export interface DocsIndexCategory {
  name: string;
  /** The section folder (/docs/<section>/...), used as the anchor. */
  section: string;
  docs: DocsIndexEntry[];
}

interface DocsIndexProps {
  /** Every doc, by section; industry chapters are listed by their volume's card. */
  categories: DocsIndexCategory[];
  /** The industry volumes, listed as one section of cards. */
  industries: IndustryCard[];
  /** The intro paragraph under the title. */
  intro: ReactNode;
}

/** The Industries section's anchor on /docs. */
const INDUSTRIES_ANCHOR = "industries";

/**
 * /docs, in the same reading layout as the chapters: the sidebar comes from
 * the docs layout, and search is the site's Ctrl K.
 */
export function DocsIndex({ categories, industries, intro }: DocsIndexProps) {
  // The first section is the featured "start here" strip; the rest are lists,
  // with the industry volumes as one Industries section before Reference.
  const listed = categories.filter((c) => !isIndustry(c.section));
  const [featured, ...sections] = listed;

  return (
    <div>
      <DocsHeader eyebrow="Docs" title="Documentation">
        <div className="max-w-3xl text-dim">{intro}</div>
      </DocsHeader>

      <div className="space-y-16">
        {featured && <Featured category={featured} />}
        {sections.map((category) => (
          <Fragment key={category.section}>
            {category === listed[listed.length - 1] && (
              <section id={INDUSTRIES_ANCHOR} className="scroll-mt-24">
                <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-border pb-3">
                  <h2 className="eyebrow">Industries</h2>
                  <span className="inst text-dim">{industries.length}</span>
                </div>
                <IndustryCards industries={industries} />
              </section>
            )}
            <section id={category.section} className="scroll-mt-24">
              <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
                <h2 className="eyebrow">{category.name}</h2>
                <span className="inst text-dim">{category.docs.length}</span>
              </div>
              <ul className="grid sm:grid-cols-2 sm:gap-x-10">
                {category.docs.map((doc) => (
                  <DocRow key={doc.href} doc={doc} />
                ))}
              </ul>
            </section>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function Featured({ category }: { category: DocsIndexCategory }) {
  return (
    <section id={category.section} aria-label={category.name} className="scroll-mt-24">
      <p className="eyebrow mb-4">{category.name}</p>
      <ul className="grid gap-3">
        {category.docs.map((doc) => (
          <li key={doc.href}>
            <Link
              href={doc.href}
              className="group flex items-center justify-between gap-6 border border-border bg-surface p-5 transition-colors hover:border-accent/60"
            >
              <div>
                <h3 className="text-xl leading-tight text-foreground transition-colors group-hover:text-accent">
                  {doc.title}
                </h3>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-dim">
                  {doc.description}
                </p>
              </div>
              <ArrowRight
                size={18}
                className="shrink-0 text-dim transition-all group-hover:translate-x-0.5 group-hover:text-accent"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DocRow({ doc }: { doc: DocsIndexEntry }) {
  return (
    <li className="border-b border-border">
      <Link href={doc.href} className="group block py-4">
        <span className="block text-lg leading-tight text-foreground transition-colors group-hover:text-accent">
          {doc.title}
        </span>
        <span className="mt-1 line-clamp-2 block text-[0.8rem] leading-relaxed text-dim">
          {doc.description}
        </span>
      </Link>
    </li>
  );
}
