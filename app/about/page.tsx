import { ArrowRight } from "lucide-react";
import { SimpleIcon } from "@/components/simple-icon";
import { Button } from "@/components/button";
import { socials } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "The people, principles, and hard-won opinions behind syntaqx: how I think about architecture, engineering leadership, and building software that lasts.",
};

export default function AboutPage() {
  return (
    <div>
      {/* Two-column layout: everything + sidebar from the top */}
      <section className="mb-16">
        <div className="grid gap-16 lg:grid-cols-[1fr_340px] items-start">
          {/* Left: hero + narrative */}
          <div>
            <p className="eyebrow mb-6">about</p>
            <h1 className="mb-10 text-[clamp(2.5rem,4.5vw,3.75rem)] leading-[0.92]">
              Hacker, <span className="text-accent">open sorcerer</span>,
              engineering leader.
            </h1>
            <div className="max-w-2xl space-y-5 text-[1.0625rem] leading-relaxed text-muted">
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
                Today I lead software engineering, DevOps, and architecture. I
                own delivery. I still write code, review PRs, debate system
                design, and get in the weeds when it matters. The best
                engineering leaders never lose touch with the craft, and I lead
                from the front.
              </p>
              <p>
                After coming back to Utah from San Francisco, I founded the{" "}
                <a
                  href="https://www.meetup.com/slcdevs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline decoration-accent underline-offset-4 hover:text-accent"
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
          <aside className="lg:sticky lg:top-24">
            <dl className="border-t border-border">
              {[
                { label: "location", value: "Utah, USA" },
                { label: "role", value: "Software Engineering Leadership" },
                { label: "focus", value: "Architecture, Product & Delivery" },
                {
                  label: "approach",
                  value: "Architecture enables, problem clarity directs",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-[6rem_1fr] gap-4 border-b border-border py-3"
                >
                  <dt className="inst pt-1.5 text-dim">{item.label}</dt>
                  <dd className="leading-snug font-semibold text-foreground">
                    {item.value}
                  </dd>
                </div>
              ))}
              <div className="grid grid-cols-[6rem_1fr] gap-4 py-3">
                <dt className="inst pt-1.5 text-dim">connect</dt>
                <dd className="flex flex-col gap-1">
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
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      {/* What I care about */}
      <section className="mb-16">
        <h2 className="eyebrow mb-8">what I care about</h2>
        <ol className="grid gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Architecture First",
              description:
                "Architecture needs to be right to enable building the right products. Without it, you can't build anything worth building. That's why I obsess over protecting it.",
            },
            {
              title: "Problem Clarity",
              description:
                "Architecture tells you what you can build. Problem clarity tells you what you should build. I force clarity on the problem first, because if you can't articulate it, you don't know what to build.",
            },
            {
              title: "Configuration over Convention",
              description:
                "When the problem changes, good architecture means the solution is a configuration change, not a rewrite. Every shift in requirements should be expected, not a bug.",
            },
            {
              title: "Developer Experience",
              description:
                "Internal platforms, CLIs, and tooling that make engineers more productive and happier. The team's velocity is a product of how good their tools are.",
            },
            {
              title: "Engineering Leadership",
              description:
                "High-performing teams with autonomy, trust, and a shared sense of craft. Culture is a feature, not a side effect.",
            },
            {
              title: "Open Source",
              description:
                "Contributing to and maintaining projects that solve real problems. Code should be shared when it can be. The community makes us all better.",
            },
          ].map((item, i) => (
            <li key={item.title} className="border-t border-border pt-5 pb-10">
              <span className="font-voice text-xl leading-none font-semibold text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 mb-3 text-xl leading-none text-foreground">
                {item.title}
              </h3>
              <p className="text-base leading-relaxed text-muted">
                {item.description}
              </p>
            </li>
          ))}
        </ol>
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
