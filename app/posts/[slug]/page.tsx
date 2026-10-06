import { notFound, permanentRedirect } from "next/navigation";
import {
  getAllPosts,
  getPostSlugs,
  getPostBySlug,
  markdownToHtml,
  type Heading,
} from "@/lib/posts";
import { PostMeta, PostTags } from "@/components/post-meta";
import { CopyCodeScript } from "@/components/copy-code";
import { SceneArt } from "@/components/scene-art";
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

  const toc: Heading[] = [];
  const content = await markdownToHtml(post.content, toc);

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
      {post.layout === "feature" && post.hero ? (
        <>
          <header className="relative -mx-6 -mt-12 border-b border-border">
            <SceneArt
              scene={post.hero}
              wide
              className="aspect-16/9 sm:aspect-16/7"
              label={`Illustration for ${post.title}`}
            />
            <div className="pointer-events-none grid justify-items-start gap-5 px-6 pt-2 pb-8 sm:absolute sm:inset-x-0 sm:bottom-0 sm:pt-0">
              <PostMeta
                date={post.date}
                dateFormat="MMM d, yyyy"
                readingTimeMinutes={post.readingTimeMinutes}
                className="border border-border bg-background px-2.5 py-1.5 text-accent!"
              />
              <h1 className="max-w-[12ch] text-[clamp(3rem,7vw,6.25rem)] leading-[0.86] text-foreground wrap-break-word [text-shadow:0_2px_28px_var(--background),0_0_3px_var(--background)]">
                {post.title}
              </h1>
            </div>
          </header>
          <div className="grid gap-12 pt-12 lg:grid-cols-[12rem_minmax(0,40rem)]">
            {toc.length > 1 && (
              <nav
                aria-label="Contents"
                className="hidden self-start lg:sticky lg:top-24 lg:grid"
              >
                <p className="inst mb-3 text-foreground">contents</p>
                {toc.map((h, i) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    className="grid grid-cols-[2.2rem_1fr] border-t border-border py-2 text-sm leading-snug text-dim transition-colors hover:text-foreground"
                  >
                    <span className="font-voice text-xl leading-none font-bold text-accent">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {h.text}
                  </a>
                ))}
              </nav>
            )}
            <div className="min-w-0 lg:col-start-2">
              {post.description && (
                <p className="mb-8 max-w-[40rem] text-[1.4rem] leading-snug font-semibold text-foreground">
                  {post.description}
                </p>
              )}
              <div
                className="prose prose-feature"
                dangerouslySetInnerHTML={{ __html: content }}
              />
              {post.tags && post.tags.length > 0 && (
                <PostTags
                  tags={post.tags}
                  className="mt-12 border-t border-border pt-6"
                  asLinks
                />
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <header className="mb-12 max-w-4xl border-b border-border pb-10">
            <PostMeta
              date={post.date}
              dateFormat="MMM d, yyyy"
              readingTimeMinutes={post.readingTimeMinutes}
              className="mb-6"
            />
            <h1 className="text-[clamp(2.6rem,5.5vw,4.25rem)] leading-[0.9] text-foreground wrap-break-word">
              {post.title}
            </h1>
            {post.description && (
              <p className="mt-6 max-w-2xl text-xl leading-snug text-muted">
                {post.description}
              </p>
            )}
            {post.tags && post.tags.length > 0 && (
              <PostTags tags={post.tags} className="mt-7" asLinks />
            )}
          </header>
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </>
      )}
      <CopyCodeScript />
    </article>
  );
}
