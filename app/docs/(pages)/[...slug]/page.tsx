import { notFound } from "next/navigation";
import { format } from "date-fns";
import { docLastModified } from "@/lib/doc-dates";
import { getAllDocs, getDocBySlug, getDocsByCategory, markdownToHtml } from "@/lib/docs";
import { CopyCodeScript } from "@/components/copy-code";
import { ChapterKeys } from "@/components/chapter-keys";
import { JsonLd } from "@/components/json-ld";
import { DocsHeader } from "@/components/docs-header";
import { DocsToc } from "@/components/docs-toc";
import type { Heading } from "@/lib/posts";
import { article } from "@/lib/schema";
import type { Metadata } from "next";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string[] }>;
}

const REPO = "https://github.com/syntaqx/syntaqx.com";

export async function generateStaticParams() {
  return getAllDocs().map((doc) => ({ slug: doc.slug.split("/") }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug.join("/");
  const doc = getDocBySlug(slug);
  if (!doc) return {};

  const image = { url: `/og/docs/${doc.slug}`, width: 1200, height: 630, alt: doc.title };
  const modified = docLastModified(doc.slug);
  return {
    title: doc.title,
    description: doc.description,
    openGraph: {
      title: doc.title,
      description: doc.description,
      url: `/docs/${doc.slug}`,
      type: "article",
      ...(modified && { modifiedTime: modified }),
      images: [image],
    },
    twitter: { card: "summary_large_image", creator: "@syntaqx", images: [image] },
  };
}

export default async function DocPage({ params }: Props) {
  const slug = (await params).slug.join("/");
  const doc = getDocBySlug(slug);
  // Former URLs and bare section folders redirect in next.config.ts.
  if (!doc) notFound();
  const category = getDocsByCategory().find((c) => c.name === doc.category);

  // The playbook reads front to back: neighbors in reading order.
  const docs = getAllDocs();
  const index = docs.findIndex((d) => d.slug === doc.slug);
  const prev = docs[index - 1];
  const next = docs[index + 1];

  const modified = docLastModified(doc.slug);
  const source = `content/docs/${doc.slug}.md`;

  const toc: Heading[] = [];
  const content = await markdownToHtml(doc.content, toc);
  const rail = toc.length > 1;

  // The reading column, and from xl an "On this page" rail beside it.
  return (
    <article className={rail ? "xl:grid xl:grid-cols-[minmax(0,1fr)_11rem] xl:gap-10" : undefined}>
      <JsonLd
        data={article({
          headline: doc.title,
          description: doc.description,
          path: `/docs/${doc.slug}`,
          dateModified: modified,
          crumbs: [
            { name: "Docs", path: "/docs" },
            ...(category && doc.section
              ? [{ name: category.name, path: `/docs#${category.section}` }]
              : []),
            { name: doc.title, path: `/docs/${doc.slug}` },
          ],
        })}
      />
      <div className="min-w-0">
        <DocsHeader
          title={doc.title}
          eyebrow={
            category && category.docs.length > 1 ? (
              <>
                <Link href={`/docs#${category.section}`} className="text-accent transition-colors hover:text-foreground">
                  {category.name}
                </Link>
                <span aria-hidden> · </span>
                <span className="sr-only">, chapter </span>
                {String(category.docs.findIndex((d) => d.slug === doc.slug) + 1).padStart(2, "0")}
                <span aria-hidden> / </span>
                <span className="sr-only"> of </span>
                {String(category.docs.length).padStart(2, "0")}
              </>
            ) : null
          }
        >
          {doc.description && (
            <p className="max-w-3xl text-dim">{doc.description}</p>
          )}
          <div className="inst mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-dim">
            <span>{doc.readingMinutes} min read</span>
            {modified && (
              <span>
                Updated <time dateTime={modified}>{format(new Date(modified), "MMM d, yyyy")}</time>
              </span>
            )}
            <a
              href={`${REPO}/blob/main/${source}`}
              className="transition-colors hover:text-accent"
            >
              Edit on GitHub
            </a>
            <a
              href={`${REPO}/commits/main/${source}`}
              className="transition-colors hover:text-accent"
            >
              History
            </a>
          </div>
        </DocsHeader>
        <div
          className="prose prose-docs"
          dangerouslySetInnerHTML={{ __html: content }}
        />
        {(prev || next) && (
          <nav
            aria-label="Previous and next (or use the arrow keys)"
            className="mt-16 grid gap-4 border-t border-border pt-8 sm:grid-cols-2"
          >
            {prev && (
              <Link
                href={`/docs/${prev.slug}`}
                className="group border border-border p-4 transition-colors hover:border-accent"
              >
                <span className="inst block text-dim">Previous · {prev.category}</span>
                <span className="mt-1 block group-hover:text-accent">{prev.title}</span>
              </Link>
            )}
            {next && (
              <Link
                href={`/docs/${next.slug}`}
                className="group border border-border p-4 text-right transition-colors hover:border-accent sm:col-start-2"
              >
                <span className="inst block text-dim">Next · {next.category}</span>
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
            className="rail-scroll sticky top-[6.5rem] max-h-[calc(100vh-7.5rem)] overflow-y-auto"
          />
        </aside>
      )}
      <CopyCodeScript />
      <ChapterKeys prev={prev && `/docs/${prev.slug}`} next={next && `/docs/${next.slug}`} />
    </article>
  );
}
