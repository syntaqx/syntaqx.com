import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug, markdownToHtml } from "@/lib/posts";
import { PostMeta } from "@/components/post-meta";
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

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const content = await markdownToHtml(post.content);

  return (
    <article>
      <header className="mb-10 pb-6 border-b border-border">
        <h1 className="text-xl font-semibold tracking-tight mb-3">
          {post.title}
        </h1>
        <PostMeta
          date={post.date}
          tags={post.tags}
          maxTags={99}
          dateFormat="MMMM d, yyyy"
        />
      </header>

      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
      <CopyCodeScript />
    </article>
  );
}
