import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { socials } from "@/lib/constants";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { PostMeta } from "@/components/post-meta";
import { SimpleIcon } from "@/components/simple-icon";
import {
  GitHubActivity,
  fetchGitHubContributions,
} from "@/components/github-activity";

export default async function Home() {
  const posts = getAllPosts();
  const contributions = await fetchGitHubContributions("syntaqx");

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
                <span className="text-foreground font-medium">Currently</span> /
                VP of Software Engineering. I lead engineering orgs, own
                architecture and delivery, and still write code. The
                architecture needs to be right to enable building the right
                products. Without it, you&apos;re fighting the system instead of
                building on it. Problem clarity tells you what to build. Then
                the architecture circles back to provide the right solution, and
                when requirements change, that&apos;s a configuration change,
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
                <span className="text-foreground font-medium">Otherwise</span> /
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
            <div className="rounded-lg border border-border bg-surface/50 p-4 mb-4">
              <div className="flex items-center gap-6">
                <div className="shrink-0">
                  <p className="text-sm font-medium text-foreground">
                    Follow me
                  </p>
                  <p className="text-xs text-dim">If you&apos;re into that.</p>
                </div>
                <div className="flex items-center gap-1 flex-1 justify-end">
                  {socials.map((s) => (
                    <a
                      key={s.href}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-center w-12 h-12 rounded-md hover:bg-accent/10 transition-colors"
                      aria-label={s.label}
                      title={s.label}
                    >
                      <SimpleIcon
                        name={s.icon}
                        size={24}
                        className="text-dim group-hover:text-accent transition-colors"
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <GitHubActivity data={contributions} />
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
                <h3 className="text-sm font-medium text-foreground group-hover:text-accent transition-colors mb-2">
                  {post.title}
                </h3>
                {post.description && (
                  <p className="text-xs text-dim leading-relaxed line-clamp-3 mb-auto">
                    {post.description}
                  </p>
                )}
                <div className="mt-4 pt-3 border-t border-border">
                  <PostMeta date={post.date} tags={post.tags} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
