import { notFound, permanentRedirect } from "next/navigation";
import {
  getAllPosts,
  getAllTags,
  getPostSlugs,
  getPostBySlug,
  getRoutablePosts,
  markdownToHtml,
  slugifyTag,
  type Heading,
} from "@/lib/posts";
import Link from "next/link";
import { PostMeta } from "@/components/post-meta";
import { CopyCodeScript } from "@/components/copy-code";
import { CodeTabsScript } from "@/components/code-tabs";
import { SceneArt } from "@/components/scene-art";
import { PostToc } from "@/components/post-toc";
import { Pager, type Neighbor } from "@/components/pager";
import { format } from "date-fns";
import { postDay } from "@/lib/post-day";
import { SITE_URL } from "@/lib/constants";
import { personRef } from "@/lib/schema";
import { JsonLd } from "@/components/json-ld";
import type { Metadata } from "next";
import { cn } from "@/lib/cn";

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
  // Drafts and scheduled posts get a page too; they're unlisted, not hidden.
  for (const post of getRoutablePosts()) slugs.add(post.slug);
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
    // Reachable by its link before it's published, but not indexed.
    ...(post.draft && { robots: { index: false, follow: false } }),
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
    mainEntityOfPage: `${SITE_URL}/posts/${post.slug}`,
    author: personRef,
    publisher: personRef,
    ...(post.tags?.length && { keywords: post.tags.join(", ") }),
  };

  const all = getAllPosts();
  const idx = all.findIndex((p) => p.slug === post.slug);
  const newer = idx > 0 ? all[idx - 1] : null;
  const older = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
  // Older reads as previous (←), newer as next (→), labelled by date.
  const neighbor = (p: (typeof all)[number] | null): Neighbor | null =>
    p && {
      href: `/posts/${p.slug}`,
      label: format(postDay(p.date), "MMM d, yyyy"),
      title: p.title,
    };
  const words = post.content.split(/\s+/).filter(Boolean).length;
  const feature = post.layout === "feature" && post.hero;
  const tagCounts = new Map(getAllTags(all).map((t) => [t.slug, t.count]));

  return (
    <article>
      <JsonLd data={jsonLd} />
      {feature ? (
        <header className="relative -mx-6 -mt-12 border-b border-border">
          <SceneArt
            scene={post.hero!}
            wide
            className="aspect-video sm:aspect-16/7"
            label={`Illustration for ${post.title}`}
          />
          <div className="pointer-events-none grid justify-items-start gap-5 px-6 pt-2 pb-8 sm:absolute sm:inset-x-0 sm:bottom-0 sm:pt-0">
            <PostMeta
              date={post.date}
              dateFormat="MMM d, yyyy"
              readingTimeMinutes={post.readingTimeMinutes}
              draft={post.draft}
              className="border border-border bg-background px-2.5 py-1.5 text-primary!"
            />
            <h1 className="max-w-[26ch] text-balance text-[clamp(2.6rem,5.5vw,4.5rem)] leading-[0.9] text-foreground wrap-break-word [text-shadow:0_2px_28px_var(--background),0_0_3px_var(--background)]">
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
            draft={post.draft}
            className="mb-5"
          />
          <h1 className="max-w-4xl text-[clamp(2.2rem,4vw,3.25rem)] leading-[0.92] text-foreground wrap-break-word">
            {post.title}
          </h1>
        </header>
      )}

      {/* Contents | reading column | details. The reading column holds its
          measure; the rails share whatever width is left. */}
      <div className="grid gap-10 pt-12 lg:grid-cols-[minmax(0,16rem)_minmax(0,44rem)] xl:grid-cols-[minmax(0,1fr)_minmax(0,44rem)_minmax(0,1fr)]">
        {toc.length > 1 ? <PostToc headings={toc} /> : <div className="hidden lg:block" />}
        <div className="min-w-0" data-toc-body>
          {post.description && (
            <p
              className={cn(
                "mb-8 max-w-176",
                feature ? "text-[1.2rem] font-semibold text-foreground" : "text-lg text-subtle",
                "leading-snug",
              )}
            >
              {post.description}
            </p>
          )}
          <div
            className={feature ? "prose prose-feature" : "prose"}
            dangerouslySetInnerHTML={{ __html: content }}
          />
          <Pager prev={neighbor(older)} next={neighbor(newer)} />
        </div>
        <aside
          data-pagefind-ignore
          className="hidden self-start xl:sticky xl:top-24 xl:grid xl:gap-8"
        >
          <dl className="border-t border-border">
            {[
              [
                "published",
                post.date
                  ? postDay(post.date).toLocaleDateString("en-US", {
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
                <dt className="inst text-muted-foreground">{k}</dt>
                <dd className="text-sm text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
          {post.tags && post.tags.length > 0 && (
            <nav aria-label="Filed under">
              <p className="inst mb-1 text-muted-foreground">filed under</p>
              {/* Rows like the details above, so a long tag stays on one line. */}
              <ul className="border-t border-border">
                {post.tags.map((tag) => {
                  const slug = slugifyTag(tag);
                  return (
                    <li key={slug} className="border-b border-border">
                      <Link
                        href={`/tags/${slug}`}
                        className="flex items-baseline justify-between gap-4 py-2.5 text-sm text-foreground transition-colors hover:text-primary"
                      >
                        {tag}
                        <span className="inst text-muted-foreground tabular-nums">{tagCounts.get(slug)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}
          <a
            href="/feed.xml"
            className="inst flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
          >
            <span aria-hidden className="tick" />
            subscribe via rss
          </a>
        </aside>
      </div>
      <CopyCodeScript />
      <CodeTabsScript />
    </article>
  );
}
