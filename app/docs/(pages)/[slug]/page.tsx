import { notFound } from "next/navigation";
import { getAllDocs, getDocBySlug, markdownToHtml } from "@/lib/docs";
import { CopyCodeScript } from "@/components/copy-code";
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
