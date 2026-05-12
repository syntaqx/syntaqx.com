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

      <Section title="What I collect if you create an account">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-foreground">Email address.</strong> Used to
            sign in, recover access, and send the few transactional emails
            (verification, password reset, organization invites) that auth
            requires. Not used for marketing unless you explicitly opt in.
          </li>
          <li>
            <strong className="text-foreground">Password.</strong> Hashed
            (scrypt) by Better Auth. I never see and can&apos;t recover the
            plaintext.
          </li>
          <li>
            <strong className="text-foreground">
              Username and display name.
            </strong>{" "}
            Public. They&apos;re what shows up at{" "}
            <code className="text-foreground">/&lt;username&gt;</code> and in
            the header.
          </li>
          <li>
            <strong className="text-foreground">Avatar.</strong> Optional. If
            you upload one it&apos;s stored in Vercel Blob (publicly accessible
            by URL, since profile pages are public) and the URL is saved on your
            account. Replacing or removing your avatar deletes the previous
            file.
          </li>
          <li>
            <strong className="text-foreground">Sessions.</strong> A row per
            active session: an opaque token, the IP and user-agent the session
            was created from, and an expiry. Used to enforce sign-out and to let
            you see/revoke your sessions later.
          </li>
          <li>
            <strong className="text-foreground">
              Organization membership.
            </strong>{" "}
            Each account gets a personal organization at signup. If you join
            others later, that membership is recorded.
          </li>
        </ul>
        <p>
          All account data lives in a Postgres database hosted on Neon (US
          region). Avatars live in Vercel Blob (US region). Nothing is shared
          with third parties beyond the infrastructure providers needed to run
          the site.
        </p>
      </Section>

      <Section title="Cookies and local storage">
        <p>
          Your theme preference (light / dark / system) is stored in your
          browser&apos;s <code className="text-foreground">localStorage</code>,
          which never leaves your device.
        </p>
        <p>
          If you&apos;re signed in, an{" "}
          <code className="text-foreground">HttpOnly</code> session cookie
          (host-locked to syntaqx.com) keeps you signed in. Strictly functional.
          Not used for tracking. Sign out to remove it.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          You can edit your display name, change your avatar, and change your
          password from{" "}
          <Link href="/settings" className="text-accent hover:underline">
            Settings
          </Link>
          . Account deletion and data export aren&apos;t self-serve yet. Contact
          me and I&apos;ll handle it. For analytics/error data, same: contact me
          and I&apos;ll do what&apos;s reasonable.
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
