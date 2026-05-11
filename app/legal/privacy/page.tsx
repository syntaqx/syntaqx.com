import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How syntaqx.com handles data.",
};

const lastUpdated = "May 2026";

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl py-8 text-sm text-muted leading-relaxed">
      <header className="mb-10">
        <p className="text-xs text-accent font-medium tracking-wider uppercase mb-3">
          Legal
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          Privacy
        </h1>
        <p className="text-xs text-dim">Last updated: {lastUpdated}</p>
      </header>

      <section className="space-y-4">
        <p>
          syntaqx.com is my personal site. I try to collect as little as
          possible. This page lists what I actually collect, why, and who else
          sees it.
        </p>
      </section>

      <Section title="What I collect when you just visit">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-foreground">Vercel Analytics</strong>:
            aggregate page views and referrers, no cookies, no cross-site
            tracking. See{" "}
            <a
              href="https://vercel.com/docs/analytics/privacy-policy"
              className="text-accent hover:underline"
            >
              Vercel&apos;s privacy policy
            </a>
            .
          </li>
          <li>
            <strong className="text-foreground">Vercel Speed Insights</strong>:
            performance metrics from your browser (LCP, CLS, etc.), anonymized.
          </li>
          <li>
            <strong className="text-foreground">Sentry</strong>: error and
            performance traces when something breaks. May include URL, browser,
            IP-derived approximate location, and a stack trace. See{" "}
            <a
              href="https://sentry.io/privacy/"
              className="text-accent hover:underline"
            >
              Sentry&apos;s privacy policy
            </a>
            .
          </li>
          <li>
            <strong className="text-foreground">Server logs</strong>: standard
            web request logs (IP, user agent, path, status) retained briefly for
            debugging and abuse handling.
          </li>
        </ul>
        <p>
          No advertising trackers. No third-party analytics beyond the above. No
          selling of data. I don&apos;t have any to sell, and wouldn&apos;t.
        </p>
      </Section>

      <Section title="If/when accounts go live">
        <p>
          Account features aren&apos;t open yet. When they are, I&apos;ll
          collect what&apos;s necessary to run them: email, a hashed password
          (or your OAuth identity), session records, and any data you explicitly
          create. The architecture is documented in the repository for the
          curious.
        </p>
      </Section>

      <Section title="Cookies and local storage">
        <p>
          Today: no cookies. Your theme preference (light / dark / system) is
          stored in your browser&apos;s{" "}
          <code className="text-foreground">localStorage</code>, which never
          leaves your device.
        </p>
        <p>
          When auth ships: an <code className="text-foreground">HttpOnly</code>{" "}
          session cookie (host-locked to syntaqx.com) for signed-in users.
          Strictly functional. Not used for tracking.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          If you have an account (when accounts exist), you can export or delete
          your data on request. For analytics/error data, contact me and
          I&apos;ll do what&apos;s reasonable.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          I may update this page when what I collect changes. The &ldquo;last
          updated&rdquo; date will reflect when.
        </p>
      </Section>

      <Section title="Contact">
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
        <Link href="/legal/terms" className="hover:text-accent">
          Terms of Service
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
