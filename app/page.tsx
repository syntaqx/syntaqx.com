import Link from "next/link";
import { Suspense } from "react";
import { getAllPosts, getNewestPostSlug } from "@/lib/posts";
import { getDocBySlug } from "@/lib/docs";
import { bio, socials } from "@/lib/constants";
import { siteGraph } from "@/lib/schema";
import { featuredTools } from "@/lib/tools";
import { JsonLd } from "@/components/json-ld";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { PostList } from "@/components/post-list";
import { SceneArt } from "@/components/scene-art";
import { SimpleIcon } from "@/components/simple-icon";
import { StatsStrip, StatsStripSkeleton } from "@/components/stats-strip";
import { GitHubActivityAsync, GitHubActivitySkeleton } from "@/components/github-activity";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    // Restated: a page-level `alternates` replaces the layout one wholesale.
    types: {
      "application/rss+xml": [{ url: "/feed.xml", title: "syntaqx RSS feed" }],
    },
  },
};

const jsonLd = siteGraph({
  description:
    "Personal site of Chase Pierce: writing on engineering, systems, and craft, API design docs, and a public developer API.",
  personDescription: bio[0].text,
});

/** Docs readers keep coming back to; the homepage is the most-linked page, so it links them. */
const FEATURED_DOCS = [
  "api-design/naming-conventions",
  "requests/pagination",
  "requests/error-responses",
  "database/naming-conventions",
];

export default function Home() {
  const posts = getAllPosts();
  const newestSlug = getNewestPostSlug(posts);
  const docs = FEATURED_DOCS.map((slug) => {
    const doc = getDocBySlug(slug);
    if (!doc) throw new Error(`Featured doc not found: ${slug}`);
    return doc;
  });

  return (
    <div>
      <JsonLd data={jsonLd} />
      <section className="relative isolate grid items-center gap-x-10 gap-y-12 pb-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div
          aria-hidden="true"
          className="beams pointer-events-none absolute -inset-x-6 -top-12 bottom-0 -z-10 mask-[linear-gradient(to_bottom,transparent,black_20%,black_50%,transparent)]"
        />
        <div>
          <p className="inst mb-5 tracking-[0.3em] text-muted-foreground">
            software engineering leader
          </p>
          <h1 className="mb-8 text-[clamp(3rem,6vw,4.75rem)] leading-[0.9]">
            Chase <span className="text-primary">Pierce</span>
          </h1>
          <dl className="grid max-w-xl gap-5">
            {bio.map((item) => (
              <div key={item.label}>
                <dt className="inst mb-1.5 text-primary">{item.label}</dt>
                <dd className="text-[0.95rem] leading-relaxed text-muted-foreground">
                  {item.text}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button href="/about">
              More about me
              <ArrowRight size={13} />
            </Button>
            <Button href="https://calendly.com/syntaqx" variant="secondary" external>
              Book time
              <ArrowUpRight size={13} />
            </Button>
            <div className="ml-1 flex items-center">
              {socials.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-9 items-center justify-center text-muted-foreground transition-colors hover:text-primary"
                  aria-label={s.label}
                  title={s.label}
                >
                  <SimpleIcon name={s.icon} size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
        <SceneArt
          scene="system"
          className="aspect-6/5"
          label="Exploded isometric diagram of a production system in four tiers: a product on top; an edge tier where a CDN takes all traffic and serves static files from an S3 bucket, with DNS beside it; an app tier where a load balancer feeds a cluster of four app instances, which queue work for a worker; and a data tier with a Postgres primary replicating to a read replica, and Redis."
        />
      </section>

      <Suspense fallback={<StatsStripSkeleton />}>
        <StatsStrip username="syntaqx" />
      </Suspense>

      <section className="mb-20">
        <Suspense fallback={<GitHubActivitySkeleton />}>
          <GitHubActivityAsync username="syntaqx" />
        </Suspense>
      </section>

      <section className="mb-20">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="eyebrow">docs</h2>
          <Link
            href="/docs"
            className="inst flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
          >
            all docs <ArrowRight size={11} />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {docs.map((doc) => (
            <Link key={doc.slug} href={`/docs/${doc.slug}`} className="group flex flex-col">
              <Card hover className="flex h-full flex-col">
                <p className="inst mb-2 text-muted-foreground">{doc.category}</p>
                <h3 className="mb-2 text-lg leading-none text-foreground transition-colors group-hover:text-primary">
                  {doc.title}
                </h3>
                <p className="text-xs/relaxed text-muted-foreground">{doc.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-20">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="eyebrow">tools</h2>
          <Link
            href="/tools"
            className="inst flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
          >
            all tools <ArrowRight size={11} />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {featuredTools.map((tool) => (
            <Link key={tool.href} href={tool.href} className="group flex flex-col">
              <Card hover className="flex h-full flex-col">
                <h3 className="mb-2 text-lg leading-none text-foreground transition-colors group-hover:text-primary">
                  {tool.title}
                </h3>
                <p className="text-xs/relaxed  text-muted-foreground">{tool.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="eyebrow">writing</h2>
          <Link
            href="/posts"
            className="inst flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
          >
            all posts <ArrowRight size={11} />
          </Link>
        </div>
        <PostList posts={posts} newestSlug={newestSlug} />
      </section>
    </div>
  );
}
