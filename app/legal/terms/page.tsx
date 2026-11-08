import Link from "next/link";
import { LegalDocument, type GlanceItem, type LegalSection } from "@/components/legal-document";
import { pageMetadata } from "@/lib/metadata";
import { PRIVACY, TERMS } from "@/lib/legal";

export const metadata = pageMetadata(
  TERMS.href,
  TERMS.title,
  "The terms governing use of syntaqx.com: what you can expect from this site and what I expect from visitors. Plain language, no surprises.",
);

const glance: GlanceItem[] = [
  { title: "Provided as is", detail: "No warranty, and no uptime guarantee." },
  { title: "Reuse it", detail: "The source, posts, docs and books are MIT licensed." },
  { title: "Play fair", detail: "Nothing illegal, no probing, and respect the rate limits." },
  { title: "It can change", detail: "Features and these terms can change; the date says when." },
];

const sections: LegalSection[] = [
  {
    id: "as-is",
    title: "The site is provided as-is",
    body: (
      <>
        <p>
          Everything here (posts, docs, tools, APIs) is provided &ldquo;as is&rdquo; without
          warranty of any kind. I make no promise that anything will work, be available, be
          accurate, or be fit for any particular purpose. Use at your own risk.
        </p>
        <p>
          That includes one-time secrets. They have no uptime guarantee: if the service is down, a
          link won&apos;t open until it&apos;s back, and an unread secret is gone once it expires.
          Keep your own copy of anything you can&apos;t afford to lose.
        </p>
      </>
    ),
  },
  {
    id: "my-right-to-change-it",
    title: "I reserve the right to do whatever I want",
    body: (
      <p>
        I may change, restrict, or remove any feature at any time without notice. I may stop running
        the site entirely. None of this gives rise to any obligation to you.
      </p>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    body: (
      <p>
        Don&apos;t do illegal stuff with the site. Don&apos;t attempt to break, overload, or probe
        systems you aren&apos;t explicitly authorized to. Don&apos;t use the site to harass anyone.
        Don&apos;t scrape at a rate that costs me money. The public API has rate limits, respect
        them.
      </p>
    ),
  },
  {
    id: "using-the-content",
    title: "Using the content",
    body: (
      <p>
        The site&apos;s source, including the posts, docs and books, is public on{" "}
        <a href="https://github.com/syntaqx/syntaqx.com">GitHub</a> under the{" "}
        <a href="https://github.com/syntaqx/syntaqx.com/blob/main/LICENSE">MIT License</a>. Reuse it
        under those terms, which ask that you keep the copyright notice.
      </p>
    ),
  },
  {
    id: "limitation-of-liability",
    title: "Limitation of liability",
    body: (
      <p>
        To the maximum extent permitted by law, I am not liable for any indirect, incidental,
        special, consequential, or punitive damages arising from your use of the site. If a court
        decides I must be liable for something anyway, my total liability is capped at what you paid
        me in the previous twelve months, which for a free site is zero.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes",
    body: (
      <p>
        I may update these terms whenever. The &ldquo;updated&rdquo; date at the top will reflect
        when. Continued use after a change means you accept the new version.
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

export default function TermsPage() {
  return (
    <LegalDocument
      doc={TERMS}
      intro="syntaqx.com is my personal site. By using it, you agree to these terms. If you don't, don't use the site."
      glance={glance}
      sections={sections}
      next={{ href: PRIVACY.href, label: "Legal", title: PRIVACY.title }}
    />
  );
}
