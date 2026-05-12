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

      <Section title="4. Your account">
        <p>
          You need to give a valid email address and pick a username to create
          an account. New account creation may be open, closed, or invite-only
          at any time. I&apos;m not promising the door is open. Don&apos;t
          impersonate other people. Don&apos;t pick a handle that squats a name
          you have no claim to. I may rename or reclaim handles to resolve
          disputes or to free up names being obviously squatted.
        </p>
        <p>
          You&apos;re responsible for keeping your password safe. If your
          account is used to do something against these terms, that&apos;s on
          you regardless of who was at the keyboard.
        </p>
      </Section>

      <Section title="5. Your content">
        <p>
          You keep ownership of anything you upload (avatar, display name,
          anything you publish later). You grant me the rights necessary to
          host, display, and operate the site, and nothing broader.
        </p>
        <p>
          Don&apos;t upload content you don&apos;t have the right to use.
          Don&apos;t upload anything illegal, including but not limited to CSAM,
          content that infringes copyright, or malware. Avatars are publicly
          visible, so don&apos;t upload anything you wouldn&apos;t want public.
          I may remove content and/or close the account behind it without notice
          if it violates this section.
        </p>
      </Section>

      <Section title="6. Limitation of liability">
        <p>
          To the maximum extent permitted by law, I am not liable for any
          indirect, incidental, special, consequential, or punitive damages
          arising from your use of the site. If a court decides I must be liable
          for something anyway, my total liability is capped at what you paid me
          in the previous twelve months, which for a free site is zero.
        </p>
      </Section>

      <Section title="7. Changes">
        <p>
          I may update these terms whenever. The &ldquo;last updated&rdquo; date
          at the top will reflect when. Continued use after a change means you
          accept the new version.
        </p>
      </Section>

      <Section title="8. Contact">
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
