import { notFound, permanentRedirect } from "next/navigation";
import {
  getAllPosts,
  getPostSlugs,
  getPostBySlug,
  markdownToHtml,
} from "@/lib/posts";
import { PostMeta, PostTags } from "@/components/post-meta";
import { CopyCodeScript } from "@/components/copy-code";
import { SITE_URL } from "@/lib/constants";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  // Pre-render the canonical slug AND the legacy date-prefixed filename
  // (e.g. `2024-07-01-hello-world`). Without the alias in this list, a hit
  // on a legacy `/posts/YYYY-MM-DD-<slug>` URL renders on-demand in a
  // function just to compute its 308 — a lambda hop that lands in the
  // `/posts/[slug]` field samples. Emitting it makes the redirect a static
  // 308 served from the CDN. `getPostSlugs()` returns the full filenames;
  // the Set dedupes any post whose file isn't date-prefixed.
  const slugs = new Set<string>();
  for (const post of getAllPosts()) slugs.add(post.slug);
  for (const name of getPostSlugs()) slugs.add(name);
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  // Always advertise the canonical slug, even when reached via a legacy alias.
  const url = `${SITE_URL}/posts/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      publishedTime: post.date,
      authors: ["Chase Pierce"],
      tags: post.tags,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  // Legacy `/posts/YYYY-MM-DD-<slug>` links land on the canonical URL (308).
  if (post.slug !== slug) permanentRedirect(`/posts/${post.slug}`);

  const content = await markdownToHtml(post.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    url: `${SITE_URL}/posts/${post.slug}`,
    author: {
      "@type": "Person",
      name: "Chase Pierce",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Person",
      name: "Chase Pierce",
      url: SITE_URL,
    },
    ...(post.tags?.length && { keywords: post.tags.join(", ") }),
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="mb-12 pb-8 border-b border-border">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground wrap-break-word">
          {post.title}
        </h1>
        {post.description && (
          <p className="mt-3 text-sm sm:text-base text-muted leading-relaxed">
            {post.description}
          </p>
        )}
        <PostMeta
          date={post.date}
          dateFormat="MMMM d, yyyy"
          readingTimeMinutes={post.readingTimeMinutes}
          className="mt-5"
        />
        {post.tags && post.tags.length > 0 && (
          <PostTags tags={post.tags} className="mt-3" asLinks />
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
