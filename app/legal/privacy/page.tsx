import Link from "next/link";
import { LegalDocument, type GlanceItem, type LegalSection } from "@/components/legal-document";
import { pageMetadata } from "@/lib/metadata";
import { PRIVACY, TERMS } from "@/lib/legal";

export const metadata = pageMetadata(
  PRIVACY.href,
  PRIVACY.title,
  "How syntaqx.com handles your data: what's collected, what isn't, and the choices you have. I try to collect as little as possible.",
);

const glance: GlanceItem[] = [
  { title: "No accounts", detail: "No sign-in and no user database." },
  { title: "No cookies", detail: "Preferences stay in your browser's localStorage." },
  { title: "No ad trackers", detail: "Analytics are aggregate, with no cross-site tracking." },
  { title: "Nothing sold", detail: "I don't have any to sell, and wouldn't." },
  { title: "API data expires", detail: "Everything the API keeps expires on its own." },
  { title: "Searches aren't kept", detail: "What you search through the MCP server isn't stored." },
];

const sections: LegalSection[] = [
  {
    id: "when-you-visit",
    title: "What I collect when you just visit",
    body: (
      <>
        <ul>
          <li>
            <strong>Vercel Analytics</strong>: aggregate page views and referrers, no cookies, no
            cross-site tracking. See{" "}
            <a href="https://vercel.com/docs/analytics/privacy-policy">
              Vercel&apos;s privacy policy
            </a>
            .
          </li>
          <li>
            <strong>Vercel Speed Insights</strong>: performance metrics from your browser (LCP, CLS,
            etc.), anonymized.
          </li>
          <li>
            <strong>Sentry</strong>: error and performance traces when something breaks. May include
            URL, browser, IP-derived approximate location, and a stack trace. Session Replay is off,
            and the decryption key in a one-time secret link is stripped before anything is sent.
            See <a href="https://sentry.io/privacy/">Sentry&apos;s privacy policy</a>.
          </li>
          <li>
            <strong>Server logs</strong>: standard web request logs (IP, user agent, path, status)
            retained briefly for debugging and abuse handling.
          </li>
        </ul>
        <p>
          No advertising trackers. No third-party analytics beyond the above. No selling of data. I
          don&apos;t have any to sell, and wouldn&apos;t.
        </p>
      </>
    ),
  },
  {
    id: "api-and-tools",
    title: "What I store when you use the API or tools",
    body: (
      <>
        <p>
          The public API and tools keep short-lived data in{" "}
          <a href="https://upstash.com/trust/privacy.pdf">Upstash Redis</a>. All of it expires on
          its own:
        </p>
        <ul>
          <li>
            <strong>Rate limiting</strong>: a request count per IP address, kept for up to an hour,
            and a count of one-time secrets created per IP address, kept for a day.
          </li>
          <li>
            <strong>The MCP server</strong>: requests count toward the same rate limit. What you
            search for or read through it isn&apos;t stored.
          </li>
          <li>
            <strong>Idempotency keys</strong>: if you send an <code>Idempotency-Key</code> header,
            the response to that request is stored under your IP address for 24 hours so a retry
            gets the same answer. On endpoints like <code>/api/echo</code>, that response includes
            what you sent.
          </li>
          <li>
            <strong>One-time secrets</strong>:
            <ul>
              <li>
                A secret or file made on <Link href="/tools/secrets">the secrets page</Link> is
                encrypted in your browser and stored only as ciphertext, under a hash of its id,
                with a hash of its key that lets the server turn away a wrong key. The key itself
                lives in the link, so I can&apos;t read what&apos;s stored.
              </li>
              <li>
                A &ldquo;For scripts&rdquo; link, or a secret sent straight to the API, is encrypted
                by the server instead, so the server sees it while storing it.
              </li>
              <li>
                Either way, it&apos;s deleted the first time it&apos;s read, or after its expiry (7
                days at most).
              </li>
            </ul>
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "accounts",
    title: "Accounts",
    body: (
      <p>
        There are no accounts. The site has no sign-in, no user database, and stores nothing about
        you beyond the data listed above.
      </p>
    ),
  },
  {
    id: "cookies-and-local-storage",
    title: "Cookies and local storage",
    body: (
      <p>
        No cookies are set. A few preferences are kept in your browser&apos;s{" "}
        <code>localStorage</code> and never leave your device: your theme (light, dark or system),
        the code language you last picked, and your recent searches. The one-time secrets tool keeps
        the link you just made in <code>sessionStorage</code> until it&apos;s revealed, so a reload
        doesn&apos;t lose it.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <p>
        There&apos;s no account data to export or delete. For the analytics and error data described
        above, contact me and I&apos;ll do what&apos;s reasonable.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes",
    body: (
      <p>
        I may update this page when what I collect changes. The &ldquo;updated&rdquo; date at the
        top will reflect when.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <p>
        Questions? <Link href="/contact">Get in touch</Link>.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      doc={PRIVACY}
      intro="syntaqx.com is my personal site. I try to collect as little as possible. This page lists what I actually collect, why, and who else sees it."
      glance={glance}
      sections={sections}
      other={TERMS}
      prev={{ href: TERMS.href, label: "Legal", title: TERMS.title }}
    />
  );
}
