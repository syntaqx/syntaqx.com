import { notFound } from "next/navigation";
import { docLastModified } from "@/lib/doc-dates";
import { getAllDocs, getDocBySlug, getDocsByCategory } from "@/lib/docs";
import { ChapterCount, DocArticle } from "@/components/doc-article";
import type { Metadata } from "next";
import Link from "next/link";

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
  const neighbor = (d: (typeof docs)[number] | undefined) =>
    d && { href: `/docs/${d.slug}`, label: d.category, title: d.title };

  return (
    <DocArticle
      doc={doc}
      path={`/docs/${doc.slug}`}
      source={`content/docs/${doc.slug}.md`}
      modified={docLastModified(doc.slug)}
      crumbs={[
        { name: "Docs", path: "/docs" },
        ...(category && doc.section ? [{ name: category.name, path: `/docs#${category.section}` }] : []),
        { name: doc.title, path: `/docs/${doc.slug}` },
      ]}
      eyebrow={
        category && category.docs.length > 1 ? (
          <>
            <Link href={`/docs#${category.section}`} className="text-accent transition-colors hover:text-foreground">
              {category.name}
            </Link>
            <span aria-hidden> · </span>
            <ChapterCount index={category.docs.findIndex((d) => d.slug === doc.slug)} total={category.docs.length} />
          </>
        ) : null
      }
      prev={neighbor(docs[index - 1])}
      next={neighbor(docs[index + 1])}
    />
  );
}
