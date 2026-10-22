import { notFound } from "next/navigation";
import { format } from "date-fns";
import { docLastModified } from "@/lib/doc-dates";
import { getAllDocs, getDocBySlug, getDocsByCategory, markdownToHtml } from "@/lib/docs";
import { CopyCodeScript } from "@/components/copy-code";
import { PostToc } from "@/components/post-toc";
import type { Heading } from "@/lib/posts";
import { JsonLd } from "@/components/json-ld";
import { article } from "@/lib/schema";
import type { Metadata } from "next";

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
    twitter: { card: "summary_large_image", images: [image] },
  };
}

export default async function DocPage({ params }: Props) {
  const slug = (await params).slug.join("/");
  const doc = getDocBySlug(slug);
  // Former URLs and bare section folders redirect in next.config.ts.
  if (!doc) notFound();
  const category = getDocsByCategory().find((c) => c.name === doc.category);

  const modified = docLastModified(doc.slug);
  const source = `content/docs/${doc.slug}.md`;

  const toc: Heading[] = [];
  const content = await markdownToHtml(doc.content, toc);

  return (
    <article>
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
      {/* Content column (header + body) | contents rail from the top (xl+). */}
      <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_13rem]">
        <div className="min-w-0">
          <header className="mb-10 border-b border-border pb-8">
            <h1 className="mb-3 text-3xl leading-[0.95] sm:text-4xl wrap-break-word">
              {doc.title}
            </h1>
            {doc.description && (
              <p className="max-w-3xl text-dim">{doc.description}</p>
            )}
            <div className="inst mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-dim">
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
          </header>
          <div
            className="prose prose-docs"
            data-toc-body
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
        {toc.length > 1 && (
          <PostToc
            headings={toc}
            className="hidden self-start xl:sticky xl:top-[6.5rem] xl:grid"
          />
        )}
      </div>
      <CopyCodeScript />
    </article>
  );
}
