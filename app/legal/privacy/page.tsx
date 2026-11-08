import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/legal/privacy",
  "Privacy",
  "How syntaqx.com handles your data: what's collected, what isn't, and the choices you have. I try to collect as little as possible.",
);

const lastUpdated = "November 2026";

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl py-8 text-sm/relaxed text-subtle ">
      <header className="mb-10">
        <p className="text-xs text-primary font-medium tracking-wider uppercase mb-3">Legal</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Privacy</h1>
        <p className="text-xs text-muted-foreground">Last updated: {lastUpdated}</p>
      </header>

      <section className="space-y-4">
        <p>
          syntaqx.com is my personal site. I try to collect as little as possible. This page lists
          what I actually collect, why, and who else sees it.
        </p>
      </section>

      <Section title="What I collect when you just visit">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-foreground">Vercel Analytics</strong>: aggregate page views and
            referrers, no cookies, no cross-site tracking. See{" "}
            <a
              href="https://vercel.com/docs/analytics/privacy-policy"
              className="text-primary hover:underline"
            >
              Vercel&apos;s privacy policy
            </a>
            .
          </li>
          <li>
            <strong className="text-foreground">Vercel Speed Insights</strong>: performance metrics
            from your browser (LCP, CLS, etc.), anonymized.
          </li>
          <li>
            <strong className="text-foreground">Sentry</strong>: error and performance traces when
            something breaks. May include URL, browser, IP-derived approximate location, and a stack
            trace. Session Replay is off, and the decryption key in a one-time secret link is
            stripped before anything is sent. See{" "}
            <a href="https://sentry.io/privacy/" className="text-primary hover:underline">
              Sentry&apos;s privacy policy
            </a>
            .
          </li>
          <li>
            <strong className="text-foreground">Server logs</strong>: standard web request logs (IP,
            user agent, path, status) retained briefly for debugging and abuse handling.
          </li>
        </ul>
        <p>
          No advertising trackers. No third-party analytics beyond the above. No selling of data. I
          don&apos;t have any to sell, and wouldn&apos;t.
        </p>
      </Section>

      <Section title="What I store when you use the API or tools">
        <p>
          The public API and tools keep short-lived data in{" "}
          <a href="https://upstash.com/trust/privacy.pdf" className="text-primary hover:underline">
            Upstash Redis
          </a>
          . All of it expires on its own:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-foreground">Rate limiting</strong>: a request count per IP
            address, kept for up to an hour, and a count of one-time secrets created per IP address,
            kept for a day.
          </li>
          <li>
            <strong className="text-foreground">The MCP server</strong>: requests count toward the
            same rate limit. What you search for or read through it isn&apos;t stored.
          </li>
          <li>
            <strong className="text-foreground">Idempotency keys</strong>: if you send an{" "}
            <code className="text-foreground">Idempotency-Key</code> header, the response to that
            request is stored under your IP address for 24 hours so a retry gets the same answer. On
            endpoints like <code className="text-foreground">/api/echo</code>, that response
            includes what you sent.
          </li>
          <li>
            <strong className="text-foreground">One-time secrets</strong>: a secret or file made on{" "}
            <Link href="/tools/secrets" className="text-primary hover:underline">
              the secrets page
            </Link>{" "}
            is encrypted in your browser and stored only as ciphertext, under a hash of its id, with
            a hash of its key that lets the server turn away a wrong key. The key itself lives in
            the link, so I can&apos;t read what&apos;s stored. A &ldquo;For scripts&rdquo; link, or
            a secret sent straight to the API, is encrypted by the server instead, so the server
            sees it while storing it. Either way, it&apos;s deleted the first time it&apos;s read,
            or after its expiry (7 days at most).
          </li>
        </ul>
      </Section>

      <Section title="Accounts">
        <p>
          There are no accounts. The site has no sign-in, no user database, and stores nothing about
          you beyond the data listed above.
        </p>
      </Section>

      <Section title="Cookies and local storage">
        <p>
          No cookies are set. A few preferences are kept in your browser&apos;s{" "}
          <code className="text-foreground">localStorage</code> and never leave your device: your
          theme (light, dark or system), the code language you last picked, and your recent
          searches. The one-time secrets tool keeps the link you just made in{" "}
          <code className="text-foreground">sessionStorage</code> until it&apos;s revealed, so a
          reload doesn&apos;t lose it.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          There&apos;s no account data to export or delete. For the analytics and error data
          described above, contact me and I&apos;ll do what&apos;s reasonable.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          I may update this page when what I collect changes. The &ldquo;last updated&rdquo; date
          will reflect when.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions?{" "}
          <Link href="/contact" className="text-primary hover:underline">
            Get in touch
          </Link>
          .
        </p>
      </Section>

      <p className="mt-12 text-xs text-muted-foreground">
        See also:{" "}
        <Link href="/legal/terms" className="hover:text-primary">
          Terms of Service
        </Link>
        .
      </p>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-base font-semibold text-foreground mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
