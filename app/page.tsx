import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { PostMeta } from "@/components/post-meta";
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
                architecture and delivery, and still write code. Great products
                demand architecture that can evolve with them — get that right
                first, or the product stagnates and becomes impossible to
                change.
              </p>
              <p>
                <span className="text-foreground font-medium">Product</span> / I
                obsess over building things people actually want to use. The
                best architecture in the world means nothing if it doesn&apos;t
                serve the product. I sit with stakeholders, understand their
                pain, and ship software that removes friction or unlocks value.
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
                driven by product. Your favorite internet junkie with a love of
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
