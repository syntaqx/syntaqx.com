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
      <header className="mb-10 pb-6 border-b border-border">
        <h1 className="text-lg sm:text-xl font-semibold tracking-tight mb-2 wrap-break-word">
          {doc.title}
        </h1>
        {doc.description && (
          <p className="text-sm text-muted">{doc.description}</p>
        )}
      </header>

      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
      <CopyCodeScript />
    </article>
  );
}
