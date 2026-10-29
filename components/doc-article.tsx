import type { ReactNode } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { markdownToHtml, type DocData } from "@/lib/docs";
import { CopyCodeScript } from "@/components/copy-code";
import { MarkdownMenu } from "@/components/copy-markdown";
import { CodeTabsScript } from "@/components/code-tabs";
import { ChapterKeys } from "@/components/chapter-keys";
import { JsonLd } from "@/components/json-ld";
import { DocsHeader } from "@/components/docs-header";
import { DocsToc } from "@/components/docs-toc";
import type { Heading } from "@/lib/posts";
import { article, type Crumb } from "@/lib/schema";

const REPO = "https://github.com/syntaqx/syntaqx.com";

export interface Neighbor {
  href: string;
  /** What it belongs to, after "Previous ·" or "Next ·". */
  label: string;
  title: string;
}

/**
 * A doc or a book chapter in the reading layout: the quiet header, the
 * Markdown, previous and next, and from xl an "On this page" rail beside it.
 * The sidebar comes from the layout around it.
 */
export async function DocArticle({
  doc,
  headline = doc.title,
  path,
  source,
  published,
  modified,
  isPartOf,
  eyebrow,
  crumbs,
  prev,
  next,
}: {
  doc: DocData;
  /** The structured data's headline, where it names more than the page's title does. */
  headline?: string;
  /** The page's URL path, e.g. /docs/payments/money. */
  path: string;
  /** The Markdown file, repo-relative, for Edit on GitHub. */
  source: string;
  /** When the Markdown file was first added, for structured data. */
  published?: string;
  modified?: string;
  /** The book or collection it belongs to, for structured data. */
  isPartOf?: object;
  eyebrow: ReactNode;
  crumbs: Crumb[];
  prev?: Neighbor;
  next?: Neighbor;
}) {
  const toc: Heading[] = [];
  const content = await markdownToHtml(doc.content, toc);
  const rail = toc.length > 1;

  return (
    <article className={rail ? "xl:grid xl:grid-cols-[minmax(0,1fr)_11rem] xl:gap-10" : undefined}>
      <JsonLd
        data={article({
          headline,
          description: doc.description,
          path,
          datePublished: published,
          dateModified: modified,
          isPartOf,
          crumbs,
        })}
      />
      <div className="min-w-0">
        <DocsHeader title={doc.title} eyebrow={eyebrow}>
          {doc.description && <p className="max-w-3xl text-dim">{doc.description}</p>}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
            <div className="inst flex flex-wrap items-center gap-x-5 gap-y-2 text-dim">
              <span>{doc.readingMinutes} min read</span>
              {modified && (
                <span>
                  Updated <time dateTime={modified}>{format(new Date(modified), "MMM d, yyyy")}</time>
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <a
                href={`${REPO}/blob/main/${source}`}
                className="inst text-dim transition-colors hover:text-accent"
              >
                Edit on GitHub
              </a>
              <MarkdownMenu href={`${path}.md`} />
            </div>
          </div>
        </DocsHeader>
        <div className="prose prose-docs" dangerouslySetInnerHTML={{ __html: content }} />
        {(prev || next) && (
          <nav
            aria-label="Previous and next (or use the arrow keys)"
            className="mt-16 grid gap-4 border-t border-border pt-8 sm:grid-cols-2"
          >
            {prev && (
              <Link
                href={prev.href}
                className="group border border-border p-4 transition-colors hover:border-accent"
              >
                <span className="inst block text-dim">Previous · {prev.label}</span>
                <span className="mt-1 block group-hover:text-accent">{prev.title}</span>
              </Link>
            )}
            {next && (
              <Link
                href={next.href}
                className="group border border-border p-4 text-right transition-colors hover:border-accent sm:col-start-2"
              >
                <span className="inst block text-dim">Next · {next.label}</span>
                <span className="mt-1 block group-hover:text-accent">{next.title}</span>
              </Link>
            )}
          </nav>
        )}
      </div>
      {rail && (
        <aside className="hidden xl:block">
          <DocsToc
            headings={toc}
            className="rail-scroll sticky top-16 max-h-[calc(100vh-5rem)] overflow-y-auto"
          />
        </aside>
      )}
      <CopyCodeScript />
      <CodeTabsScript />
      <ChapterKeys prev={prev?.href} next={next?.href} />
    </article>
  );
}

/** "03 / 31", read aloud as "chapter 3 of 31". */
export function ChapterCount({ index, total }: { index: number; total: number }) {
  return (
    <>
      <span className="sr-only">, chapter </span>
      {String(index + 1).padStart(2, "0")}
      <span aria-hidden> / </span>
      <span className="sr-only"> of </span>
      {String(total).padStart(2, "0")}
    </>
  );
}
