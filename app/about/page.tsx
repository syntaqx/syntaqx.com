import Link from "next/link";
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
                technological problems exist. The industry changes, the domain
                changes, but the architecture decisions, the scaling challenges,
                the trade-offs. They&apos;re universal. Once you see that, the
                problems themselves become the fun part, agnostic of any given
                industry. I love sitting down with stakeholders, understanding
                their pain, comprehending the real problem, then delivering
                tools that remove friction or unlock value they didn&apos;t know
                was possible, with the perspective of technology at heart.
              </p>
              <p>
                I&apos;ve been brought on to take companies to the next level:
                align with the right architecture, scale forward, and build the
                foundations that let teams ship with confidence. The systems I
                build favor configuration over convention. When business needs
                change, that should be a configuration change, not a rewrite.
                Products that can adapt without engineering intervention are
                products that survive.
              </p>
              <p>
                Today I&apos;m a VP of Software Engineering. I lead engineering,
                DevOps, and architecture. I own delivery. I obsess over the
                product and force clarity on solutions that don&apos;t have
                clear problems. If you can&apos;t articulate the problem, you
                don&apos;t know what to build. I still write code, review PRs,
                debate system design, and get in the weeds when it matters. The
                best engineering leaders never lose touch with the craft, and I
                lead from the front.
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
                value: "Stakeholders first, technology at heart",
              },
            ].map((item) => (
              <Card key={item.label}>
                <div className="flex items-center gap-2 mb-1.5">
                  <item.icon size={13} className="text-accent" />
                  <p className="text-[10px] uppercase tracking-widest text-dim">
                    {item.label}
                  </p>
                </div>
                <p className="text-sm text-foreground font-medium">
                  {item.value}
                </p>
              </Card>
            ))}

            {/* Connect */}
            <Card>
              <p className="text-[10px] uppercase tracking-widest text-dim mb-3">
                Connect
              </p>
              <div className="flex flex-col gap-1.5">
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
            </Card>
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
                "Amazing products require architecture that can change and grow alongside them. Get the foundations right first, or the product becomes stagnant and impossible to evolve.",
            },
            {
              title: "Product Thinking",
              description:
                "The best architecture means nothing if it doesn't serve the product. I obsess over what users need, sit with stakeholders, and ship software that removes friction or unlocks value.",
            },
            {
              title: "Configuration over Convention",
              description:
                "Build products that can be configured to do what you need today, tomorrow, and in the future. When business needs change, it's a configuration, not a bug.",
            },
            {
              title: "Developer Experience",
              description:
                "Building internal platforms, CLIs, and tooling that make engineers more productive and happier at work.",
            },
            {
              title: "Engineering Leadership",
              description:
                "Building high-performing teams with autonomy, trust, and a shared sense of craft. Culture is a feature.",
            },
            {
              title: "Open Source",
              description:
                "Contributing to and maintaining projects that solve real problems. Code should be shared when it can be.",
            },
          ].map((item) => (
            <Card key={item.title}>
              <h3 className="text-sm font-medium text-foreground mb-1">
                {item.title}
              </h3>
              <p className="text-xs text-dim leading-relaxed">
                {item.description}
              </p>
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
