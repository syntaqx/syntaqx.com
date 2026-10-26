import Link from "next/link";
import { getDocsByCategory } from "@/lib/docs";
import { industryCards } from "@/lib/industries";
import { IndustryCards } from "@/components/industry-cards";
import { DocsHeader } from "@/components/docs-header";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/docs/industries",
  "Industries",
  "The playbook applied to one industry at a time: how its rules, money and regulators shape the systems you build, one volume per industry.",
);

/** Every industry volume, and the ones still to come. */
export default function IndustriesPage() {
  return (
    <article>
      <DocsHeader
        title="Industries"
        eyebrow={
          <Link href="/docs" className="text-accent transition-colors hover:text-foreground">
            Docs
          </Link>
        }
      >
        <p className="max-w-3xl text-muted">
          The core of the playbook applies anywhere. Each volume here takes one industry and shows how its rules, its
          money and its regulators shape the engineering, building on the chapters before it.
        </p>
      </DocsHeader>

      <IndustryCards industries={industryCards(getDocsByCategory())} />
    </article>
  );
}
