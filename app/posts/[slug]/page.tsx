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
import { PostToc } from "@/components/post-toc";
import Link from "next/link";
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

  const all = getAllPosts();
  const idx = all.findIndex((p) => p.slug === post.slug);
  const newer = idx > 0 ? all[idx - 1] : null;
  const older = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
  const words = post.content.split(/\s+/).filter(Boolean).length;
  const feature = post.layout === "feature" && post.hero;

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {feature ? (
        <header className="relative -mx-6 -mt-12 border-b border-border">
          <SceneArt
            scene={post.hero!}
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
            <h1 className="max-w-[12ch] text-[clamp(2.6rem,5.5vw,4.5rem)] leading-[0.9] text-foreground wrap-break-word [text-shadow:0_2px_28px_var(--background),0_0_3px_var(--background)]">
              {post.title}
            </h1>
          </div>
        </header>
      ) : (
        <header className="border-b border-border pb-10">
          <PostMeta
            date={post.date}
            dateFormat="MMM d, yyyy"
            readingTimeMinutes={post.readingTimeMinutes}
            className="mb-5"
          />
          <h1 className="max-w-4xl text-[clamp(2.2rem,4vw,3.25rem)] leading-[0.92] text-foreground wrap-break-word">
            {post.title}
          </h1>
        </header>
      )}

      {/* Contents | reading column | details. Same frame for both layouts. */}
      <div className="grid gap-x-12 gap-y-10 pt-12 lg:grid-cols-[11rem_minmax(0,40rem)] xl:grid-cols-[11rem_minmax(0,40rem)_minmax(0,1fr)]">
        {toc.length > 1 ? (
          <PostToc headings={toc} />
        ) : (
          <div className="hidden lg:block" />
        )}
        <div className="min-w-0" data-post-body>
          {post.description && (
            <p
              className={`mb-8 max-w-[40rem] leading-snug ${
                feature
                  ? "text-[1.2rem] font-semibold text-foreground"
                  : "text-lg text-muted"
              }`}
            >
              {post.description}
            </p>
          )}
          <div
            className={feature ? "prose prose-feature" : "prose"}
            dangerouslySetInnerHTML={{ __html: content }}
          />
          <nav
            aria-label="More posts"
            className="mt-16 grid gap-px border-y border-border bg-border sm:grid-cols-2"
          >
            {[
              { p: older, label: "older" },
              { p: newer, label: "newer" },
            ].map(({ p, label }) =>
              p ? (
                <Link
                  key={label}
                  href={`/posts/${p.slug}`}
                  className={`group grid gap-2 bg-background py-5 ${label === "newer" ? "sm:pl-6 sm:text-right" : "sm:pr-6"}`}
                >
                  <span className="inst text-dim">{label}</span>
                  <span className="font-voice text-lg leading-none font-semibold uppercase text-foreground transition-colors group-hover:text-accent">
                    {p.title}
                  </span>
                </Link>
              ) : (
                <span key={label} className="hidden bg-background sm:block" />
              ),
            )}
          </nav>
        </div>
        <aside className="hidden self-start xl:sticky xl:top-24 xl:grid xl:gap-8">
          <dl className="border-t border-border">
            {[
              [
                "published",
                post.date
                  ? new Date(post.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "",
              ],
              ["reading", `${post.readingTimeMinutes} min`],
              ["words", words.toLocaleString()],
              ["author", "Chase Pierce"],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex items-baseline justify-between gap-4 border-b border-border py-2.5"
              >
                <dt className="inst text-dim">{k}</dt>
                <dd className="text-sm text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
          {post.tags && post.tags.length > 0 && (
            <div>
              <p className="inst mb-3 text-dim">filed under</p>
              <PostTags tags={post.tags} asLinks />
            </div>
          )}
          <a
            href="/feed.xml"
            className="inst flex items-center gap-2 text-dim transition-colors hover:text-accent"
          >
            <span className="size-1.5 bg-accent" />
            subscribe via rss
          </a>
        </aside>
      </div>
      <CopyCodeScript />
    </article>
  );
}
