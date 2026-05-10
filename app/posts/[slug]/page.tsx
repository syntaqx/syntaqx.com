import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug, markdownToHtml } from "@/lib/posts";
import { PostMeta, PostTags } from "@/components/post-meta";
import { CopyCodeScript } from "@/components/copy-code";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const url = `https://syntaqx.com/posts/${slug}`;

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

  const content = await markdownToHtml(post.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    url: `https://syntaqx.com/posts/${slug}`,
    author: {
      "@type": "Person",
      name: "Chase Pierce",
      url: "https://syntaqx.com",
    },
    publisher: {
      "@type": "Person",
      name: "Chase Pierce",
      url: "https://syntaqx.com",
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
          <PostTags tags={post.tags} className="mt-3" />
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
