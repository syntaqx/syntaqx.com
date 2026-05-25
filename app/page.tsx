import Link from "next/link";
import { Suspense } from "react";
import { getAllPosts, getNewestPostSlug } from "@/lib/posts";
import { socials } from "@/lib/constants";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { PostMeta } from "@/components/post-meta";
import { SimpleIcon } from "@/components/simple-icon";
import {
  GitHubActivityAsync,
  GitHubActivitySkeleton,
} from "@/components/github-activity";

export default function Home() {
  const posts = getAllPosts();
  const newestSlug = getNewestPostSlug(posts);

  return (
    <div>
      {/* Hero — Holman-style intro */}
      <section className="mb-20">
        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-10">
          <div className="lg:w-1/2 shrink-0">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.15] mb-6">
              Chase Pierce
            </h1>
            <div className="text-sm text-muted leading-relaxed space-y-3 mb-8">
              <p>
                <span className="text-foreground font-medium">Currently</span> /{" "}
                VP of Software Engineering. I lead engineering orgs, own
                architecture and delivery, and still write code. The
                architecture needs to be right to enable building the right
                products. Without it, you&apos;re fighting the system instead of
                building on it. Problem clarity tells you what to build. Then
                the architecture circles back to provide the right solution, and
                when requirements change, that should be a configuration change,
                not a bug.
              </p>
              <p>
                <span className="text-foreground font-medium">Previously</span>{" "}
                / Writing code since I was 11. Over 20 years across gaming,
                social media, fintech, e-commerce, proptech, hosting, travel,
                sports tech, and more. The problems are universal. The fun part
                is solving them.
              </p>
              <p>
                <span className="text-foreground font-medium">Otherwise</span> /{" "}
                Open sorcerer. Perpetually online. Obsessed with technology,
                hooked on shipping. Your favorite internet junkie with a love of
                all things digital and bacon-based.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button href="/about">
                More about me
                <ArrowRight size={13} />
              </Button>
              <Button href="/posts" variant="secondary">
                Read the blog
              </Button>
            </div>
          </div>
          <div className="mt-10 lg:mt-0 lg:flex-1 lg:min-w-0">
            <a
              href="https://calendly.com/syntaqx"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-4 rounded-lg border border-accent/40 bg-accent/5 p-4 mb-4 hover:bg-accent/10 hover:border-accent transition-colors group"
            >
              <div>
                <p className="text-sm font-medium text-accent">
                  Book time with me
                </p>
                <p className="text-xs text-muted">
                  Schedule a chat on Calendly.
                </p>
              </div>
              <ArrowRight
                size={14}
                className="text-accent/70 group-hover:text-accent transition-colors shrink-0"
              />
            </a>
            <div className="rounded-lg border border-border bg-surface/50 p-4 mb-4">
              <div className="flex items-center justify-between gap-4">
                <div className="shrink-0">
                  <p className="text-sm font-medium text-foreground">
                    Follow me
                  </p>
                  <p className="text-xs text-dim">If you&apos;re into that.</p>
                </div>
                <div className="flex items-center gap-1">
                  {socials.map((s) => (
                    <a
                      key={s.href}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-md hover:bg-accent/10 transition-colors"
                      aria-label={s.label}
                      title={s.label}
                    >
                      <SimpleIcon
                        name={s.icon}
                        size={20}
                        className="text-dim group-hover:text-accent transition-colors sm:hidden"
                      />
                      <SimpleIcon
                        name={s.icon}
                        size={24}
                        className="text-dim group-hover:text-accent transition-colors hidden sm:block"
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <Suspense fallback={<GitHubActivitySkeleton />}>
              <GitHubActivityAsync username="syntaqx" />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Posts */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs font-medium uppercase tracking-widest text-dim">
            Recent Posts
          </h2>
          <Link
            href="/posts"
            className="text-xs text-dim hover:text-accent transition-colors flex items-center gap-1"
          >
            view all <ArrowRight size={11} />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/posts/${post.slug}`}
              className="group flex flex-col"
            >
              <Card hover className="flex flex-col h-full p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                    {post.title}
                  </h3>
                  {post.slug === newestSlug && (
                    <span className="shrink-0 rounded border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent">
                      New
                    </span>
                  )}
                </div>
                {post.description && (
                  <p className="text-xs text-dim leading-relaxed line-clamp-3 mb-auto">
                    {post.description}
                  </p>
                )}
                <div className="mt-4 pt-3 border-t border-border">
                  <PostMeta
                    date={post.date}
                    readingTimeMinutes={post.readingTimeMinutes}
                  />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
