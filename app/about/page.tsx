import {
  MapPin,
  ArrowRight,
  Briefcase,
  Heart,
  Compass,
  Users,
} from "lucide-react";
import { SimpleIcon } from "@/components/simple-icon";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { socials } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div>
      {/* Two-column layout: everything + sidebar from the top */}
      <section className="mb-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px] items-start">
          {/* Left: hero + narrative */}
          <div>
            <p className="text-xs text-accent font-medium tracking-wider uppercase mb-4">
              About
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.15] mb-8">
              Hacker, <span className="text-accent">open sorcerer</span>,
              engineering leader.
            </h1>
            <div className="text-sm text-muted leading-relaxed space-y-4">
              <p>
                My world is the screen. I&apos;m obsessed with technology: the
                systems, the architecture, the problem-solving. That&apos;s the
                engine. But the dopamine hit is watching someone actually use
                the thing you built. Building products that people click, touch,
                swipe, tap, and genuinely get value from? That&apos;s what keeps
                me up at night. I&apos;ve had this fascination since I was a
                kid, and over 20 years later it hasn&apos;t faded. If anything,
                it&apos;s gotten worse.
              </p>
              <p>
                I started writing code around 11, building tools and systems
                around the games I played. Content management for my gaming
                community, bots that automated things that shouldn&apos;t have
                been automatable, custom game maps. I built things my friends
                and I wanted but couldn&apos;t buy, and it got me hooked. That
                turned into a development internship at a local news station as
                a teenager, and I never looked back. I&apos;ve shipped software
                across gaming, social media, travel, proptech, sports tech,
                field services, fintech, payments, e-commerce, hosting, cloud
                infrastructure, and media. From massive-scale consumer platforms
                serving hundreds of millions of users to scrappy startups where
                I was racking and stacking servers, writing deployment scripts,
                and acting as the entire infrastructure team. The breadth is the
                point. Every industry, every scale, every fire has shaped how I
                think about building things.
              </p>
              <p>
                That exposure taught me something: everywhere you look, the same
                problems exist. The industry changes, the domain changes, but
                the architecture decisions, the scaling challenges, the
                trade-offs are universal. Once you see that, the problems
                themselves become the fun part.
              </p>
              <p>
                I&apos;ve been brought on to take companies to the next level.
                The approach is always the same: get the architecture right
                first, because without it you can&apos;t build the right
                products at all. Then force clarity on the problem, because
                that&apos;s what tells you what to build. Once the problem is
                clear, the architecture circles back to provide the right
                solution, and when the problem inevitably changes, good
                architecture means that change is a configuration, not a
                rewrite. Every shift in requirements should be expected, not a
                bug.
              </p>
              <p>
                Today I&apos;m a VP of Software Engineering. I lead engineering,
                DevOps, and architecture. I own delivery. I still write code,
                review PRs, debate system design, and get in the weeds when it
                matters. The best engineering leaders never lose touch with the
                craft, and I lead from the front.
              </p>
              <p>
                After coming back to Utah from San Francisco, I founded the{" "}
                <a
                  href="https://www.meetup.com/slcdevs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Salt Lake City Developers
                </a>{" "}
                meetup because I missed having a room full of technical people
                to just rant with, drinks or not, about the things we&apos;re
                passionate about. Your favorite internet junkie with a love of
                all things digital and bacon-based.
              </p>
            </div>
          </div>

          {/* Right: details sidebar */}
          <div className="space-y-3">
            {[
              { icon: MapPin, label: "Location", value: "Utah, USA" },
              {
                icon: Briefcase,
                label: "Role",
                value: "VP, Software Engineering",
              },
              {
                icon: Compass,
                label: "Focus",
                value: "Architecture, Product & Delivery",
              },
              {
                icon: Users,
                label: "Approach",
                value: "Architecture enables, problem clarity directs",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-border bg-surface/50"
              >
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                  <item.icon size={12} className="text-accent" />
                  <p className="text-xs font-medium uppercase tracking-widest text-dim">
                    {item.label}
                  </p>
                </div>
                <p className="text-sm text-foreground font-medium px-4 py-3">
                  {item.value}
                </p>
              </div>
            ))}

            {/* Connect */}
            <div className="rounded-lg border border-border bg-surface/50">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-xs font-medium uppercase tracking-widest text-dim">
                  Connect
                </p>
              </div>
              <div className="flex flex-col gap-1.5 px-4 py-3">
                {socials.map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 py-1 text-sm text-muted hover:text-accent transition-colors"
                  >
                    <SimpleIcon name={s.icon} size={14} />
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What I care about */}
      <section className="mb-16">
        <h2 className="text-xs font-medium uppercase tracking-widest text-dim mb-6 flex items-center gap-2">
          <Heart size={12} className="text-pink" />
          What I care about
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Architecture First",
              description:
                "Architecture needs to be right to enable building the right products. Without it, you can't build anything worth building. That's why I obsess over protecting it.",
              tags: ["systems", "design", "infrastructure"],
            },
            {
              title: "Problem Clarity",
              description:
                "Architecture tells you what you can build. Problem clarity tells you what you should build. I force clarity on the problem first, because if you can't articulate it, you don't know what to build.",
              tags: ["product", "strategy"],
            },
            {
              title: "Configuration over Convention",
              description:
                "When the problem changes, good architecture means the solution is a configuration change, not a rewrite. Every shift in requirements should be expected, not a bug.",
              tags: ["architecture", "resilience"],
            },
            {
              title: "Developer Experience",
              description:
                "Internal platforms, CLIs, and tooling that make engineers more productive and happier. The team's velocity is a product of how good their tools are.",
              tags: ["tooling", "platforms", "dx"],
            },
            {
              title: "Engineering Leadership",
              description:
                "High-performing teams with autonomy, trust, and a shared sense of craft. Culture is a feature, not a side effect.",
              tags: ["leadership", "culture", "teams"],
            },
            {
              title: "Open Source",
              description:
                "Contributing to and maintaining projects that solve real problems. Code should be shared when it can be. The community makes us all better.",
              tags: ["oss", "community"],
            },
          ].map((item) => (
            <Card key={item.title} className="flex flex-col h-full">
              <h3 className="text-sm font-medium text-foreground mb-1">
                {item.title}
              </h3>
              <p className="text-xs text-dim leading-relaxed flex-1 sm:min-h-[4lh]">
                {item.description}
              </p>
              {item.tags && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block rounded border border-border px-1.5 py-0.5 text-[10px] text-dim"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section>
        <Button href="/posts">
          Read the blog
          <ArrowRight size={12} />
        </Button>
      </section>
    </div>
  );
}
