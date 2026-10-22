import Link from "next/link";
import { Suspense } from "react";
import { getAllPosts, getNewestPostSlug } from "@/lib/posts";
import { bio, socials, SITE_URL } from "@/lib/constants";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/button";
import { PostList } from "@/components/post-list";
import { SceneArt } from "@/components/scene-art";
import { SimpleIcon } from "@/components/simple-icon";
import { StatsStrip, StatsStripSkeleton } from "@/components/stats-strip";
import {
  GitHubActivityAsync,
  GitHubActivitySkeleton,
} from "@/components/github-activity";
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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "syntaqx",
      url: SITE_URL,
      description:
        "Personal site of Chase Pierce: writing on engineering, systems, and craft, API design docs, and a public developer API.",
      inLanguage: "en",
      author: { "@id": `${SITE_URL}/#person` },
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Chase Pierce",
      alternateName: "syntaqx",
      url: SITE_URL,
      jobTitle: "Software Engineering Leader",
      description: bio[0].text,
      sameAs: socials.map((s) => s.href),
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "professional inquiries",
        url: `${SITE_URL}/contact`,
      },
    },
  ],
};

export default function Home() {
  const posts = getAllPosts();
  const newestSlug = getNewestPostSlug(posts);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="relative isolate grid items-center gap-x-10 gap-y-12 pb-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div
          aria-hidden="true"
          className="beams pointer-events-none absolute -inset-x-6 -top-12 bottom-0 -z-10 mask-[linear-gradient(to_bottom,transparent,black_20%,black_50%,transparent)]"
        />
        <div>
          <p className="inst mb-5 tracking-[0.3em] text-dim">
            software engineering leader
          </p>
          <h1 className="mb-8 text-[clamp(3rem,6vw,4.75rem)] leading-[0.9]">
            Chase <span className="text-accent">Pierce</span>
          </h1>
          <dl className="grid max-w-xl gap-5">
            {bio.map((item) => (
              <div key={item.label}>
                <dt className="inst mb-1.5 text-accent">{item.label}</dt>
                <dd className="text-[0.95rem] leading-relaxed text-dim">
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
            <Button
              href="https://calendly.com/syntaqx"
              variant="secondary"
              external
            >
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
                  className="flex size-10 items-center justify-center text-dim transition-colors hover:text-accent"
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
          label="Exploded isometric diagram of a software system: server racks, a Postgres database and cabling at the bottom, API services and a message queue in the middle, and a product window with a teal block on top."
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

      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="eyebrow">writing</h2>
          <Link
            href="/posts"
            className="inst flex items-center gap-1.5 text-dim transition-colors hover:text-accent"
          >
            all posts <ArrowRight size={11} />
          </Link>
        </div>
        <PostList posts={posts} newestSlug={newestSlug} />
      </section>
    </div>
  );
}
