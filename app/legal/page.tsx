import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { pageMetadata } from "@/lib/metadata";
import { LEGAL_DOCS } from "@/lib/legal";

export const metadata = pageMetadata(
  "/legal",
  "Legal",
  "Legal information for syntaqx.com: the Terms of Service that govern using the site, and the Privacy policy covering how your data is handled.",
);

export default function LegalPage() {
  return (
    <div>
      <PageHeader
        label="legal"
        title="The fine print, in plain words"
        scene="legal"
        sceneLabel="A magnifying glass moving down a page of fine print, each line under it lighting up"
      >
        <p>
          The terms and privacy policy for syntaqx.com. The short version: no accounts, no cookies,
          no ad trackers, nothing sold, and everything is provided as is.
        </p>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2">
        {LEGAL_DOCS.map((doc) => (
          <Link
            key={doc.href}
            href={doc.href}
            className="group flex flex-col border border-border bg-card p-6 transition-colors hover:border-primary"
          >
            <span className="inst text-muted-foreground">Updated {doc.updated}</span>
            <span className="mt-4 flex items-center justify-between gap-4">
              <span className="text-2xl leading-none text-foreground transition-colors group-hover:text-primary">
                {doc.title}
              </span>
              <ArrowRight
                aria-hidden
                className="size-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary"
              />
            </span>
            <span className="mt-3 text-sm/relaxed text-muted-foreground">{doc.summary}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
