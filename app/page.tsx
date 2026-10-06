import Link from "next/link";
import { Suspense } from "react";
import { getAllPosts, getNewestPostSlug } from "@/lib/posts";
import { socials } from "@/lib/constants";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/button";
import { PostList } from "@/components/post-list";
import { SceneArt } from "@/components/scene-art";
import { SimpleIcon } from "@/components/simple-icon";
import {
  GitHubActivityAsync,
  GitHubActivitySkeleton,
} from "@/components/github-activity";

const bio = [
  {
    label: "currently",
    text: "I lead software engineering orgs, own architecture and delivery, and still write code. The architecture needs to be right to enable building the right products. Without it, you're fighting the system instead of building on it. Problem clarity tells you what to build. Then the architecture circles back to provide the right solution, and when requirements change, that should be a configuration change, not a bug.",
  },
  {
    label: "previously",
    text: "Writing code since I was 11. Over 20 years across gaming, social media, fintech, e-commerce, proptech, hosting, travel, sports tech, and more. The problems are universal. The fun part is solving them.",
  },
  {
    label: "otherwise",
    text: "Open sorcerer. Perpetually online. Obsessed with technology, hooked on shipping. Your favorite internet junkie with a love of all things digital and bacon-based.",
  },
];

export default function Home() {
  const posts = getAllPosts();
  const newestSlug = getNewestPostSlug(posts);

  const stats = [
    { value: "20", unit: "+", label: "years shipping" },
    { value: "11", label: "age at first line" },
    { value: "12", label: "industries" },
    { value: String(posts.length), label: "essays & notes" },
  ];

  return (
    <div>
      <section className="relative isolate grid items-center gap-x-10 gap-y-12 pb-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div
          aria-hidden="true"
          className="beams pointer-events-none absolute -inset-x-6 -top-12 bottom-0 -z-10 mask-[linear-gradient(to_bottom,black_40%,transparent)]"
        />
        <div>
          <p className="inst mb-5 tracking-[0.3em] text-dim">
            software engineering leader · utah
          </p>
          <h1 className="mb-10 text-[clamp(3.75rem,8.5vw,7rem)] leading-[0.86]">
            Chase <span className="text-accent">Pierce</span>
          </h1>
          <dl className="grid max-w-xl gap-5">
            {bio.map((item) => (
              <div key={item.label}>
                <dt className="inst mb-1.5 text-accent">{item.label}</dt>
                <dd className="text-[1.05rem] leading-relaxed text-dim">
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

      <section className="-mx-6 mb-20 grid grid-cols-2 border-y border-border md:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`grid gap-2.5 border-border px-6 py-5 md:border-r md:last:border-r-0 ${i % 2 ? "" : "border-r"} ${i < 2 ? "border-b md:border-b-0" : ""}`}
          >
            <span className="font-voice text-5xl leading-[0.82] font-bold">
              {s.value}
              {s.unit && (
                <span className="text-[0.5em] text-accent">{s.unit}</span>
              )}
            </span>
            <span className="inst text-dim">{s.label}</span>
          </div>
        ))}
      </section>

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
