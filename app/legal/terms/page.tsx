import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing use of syntaqx.com.",
};

const lastUpdated = "May 2026";

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-2xl py-8 text-sm text-muted leading-relaxed">
      <header className="mb-10">
        <p className="text-xs text-accent font-medium tracking-wider uppercase mb-3">
          Legal
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          Terms of Service
        </h1>
        <p className="text-xs text-dim">Last updated: {lastUpdated}</p>
      </header>

      <section className="space-y-4">
        <p>
          syntaqx.com is my personal site. By using it, you agree to these
          terms. If you don&apos;t, don&apos;t use the site.
        </p>
      </section>

      <Section title="1. The site is provided as-is">
        <p>
          Everything here (posts, docs, tools, APIs, account features) is
          provided &ldquo;as is&rdquo; without warranty of any kind. I make no
          promise that anything will work, be available, be accurate, or be fit
          for any particular purpose. Use at your own risk.
        </p>
      </Section>

      <Section title="2. I reserve the right to do whatever I want">
        <p>
          I may change, restrict, or remove any feature at any time without
          notice. I may close, suspend, or delete any account for any reason or
          no reason. I may stop running the site entirely. None of this gives
          rise to any obligation to you.
        </p>
      </Section>

      <Section title="3. Acceptable use">
        <p>
          Don&apos;t do illegal stuff with the site. Don&apos;t attempt to
          break, overload, or probe systems you aren&apos;t explicitly
          authorized to. Don&apos;t use the site to harass anyone. Don&apos;t
          scrape at a rate that costs me money. The public API has rate limits,
          respect them.
        </p>
      </Section>

      <Section title="4. Your content">
        <p>
          If/when accounts go live and you submit content, you keep ownership of
          it. You grant me the rights necessary to host, display, and operate
          the site. You&apos;re responsible for what you submit.
        </p>
      </Section>

      <Section title="5. Limitation of liability">
        <p>
          To the maximum extent permitted by law, I am not liable for any
          indirect, incidental, special, consequential, or punitive damages
          arising from your use of the site. If a court decides I must be liable
          for something anyway, my total liability is capped at what you paid me
          in the previous twelve months, which for a free site is zero.
        </p>
      </Section>

      <Section title="6. Changes">
        <p>
          I may update these terms whenever. The &ldquo;last updated&rdquo; date
          at the top will reflect when. Continued use after a change means you
          accept the new version.
        </p>
      </Section>

      <Section title="7. Contact">
        <p>
          Questions? Open an issue on{" "}
          <a
            href="https://github.com/syntaqx"
            className="text-accent hover:underline"
          >
            GitHub
          </a>
          .
        </p>
      </Section>

      <p className="mt-12 text-xs text-dim">
        See also:{" "}
        <Link href="/legal/privacy" className="hover:text-accent">
          Privacy
        </Link>
        .
      </p>
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-base font-semibold text-foreground mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
