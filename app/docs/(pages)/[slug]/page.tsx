import { notFound } from "next/navigation";
import { getAllDocs, getDocBySlug, markdownToHtml } from "@/lib/docs";
import { CopyCodeScript } from "@/components/copy-code";
import { JsonLd } from "@/components/json-ld";
import { article } from "@/lib/schema";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllDocs().map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) return {};

  return {
    title: doc.title,
    description: doc.description,
  };
}

export default async function DocPage({ params }: Props) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) notFound();

  const content = await markdownToHtml(doc.content);

  return (
    <article>
      <JsonLd
        data={article({
          headline: doc.title,
          description: doc.description,
          path: `/docs/${doc.slug}`,
          crumbs: [
            { name: "Docs", path: "/docs" },
            { name: doc.title, path: `/docs/${doc.slug}` },
          ],
        })}
      />
      <header className="mb-10 border-b border-border pb-8">
        <h1 className="mb-3 text-3xl leading-[0.95] sm:text-4xl wrap-break-word">
          {doc.title}
        </h1>
        {doc.description && (
          <p className="max-w-2xl text-dim">{doc.description}</p>
        )}
      </header>

      <div className="prose" dangerouslySetInnerHTML={{ __html: content }} />
      <CopyCodeScript />
    </article>
  );
}
