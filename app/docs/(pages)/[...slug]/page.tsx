import { notFound } from "next/navigation";
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

export async function generateStaticParams() {
  return getAllDocs().map((doc) => ({ slug: doc.slug.split("/") }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug.join("/");
  const doc = getDocBySlug(slug);
  if (!doc) return {};

  return {
    title: doc.title,
    description: doc.description,
  };
}

export default async function DocPage({ params }: Props) {
  const slug = (await params).slug.join("/");
  const doc = getDocBySlug(slug);
  // Former URLs and bare section folders redirect in next.config.ts.
  if (!doc) notFound();
  const category = getDocsByCategory().find((c) => c.name === doc.category);

  const toc: Heading[] = [];
  const content = await markdownToHtml(doc.content, toc);

  return (
    <article>
      <JsonLd
        data={article({
          headline: doc.title,
          description: doc.description,
          path: `/docs/${doc.slug}`,
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
