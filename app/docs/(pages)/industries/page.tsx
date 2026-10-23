import Link from "next/link";
import type { Metadata } from "next";
import { getDocsByCategory } from "@/lib/docs";
import { industryCards } from "@/lib/industries";
import { IndustryCards } from "@/components/industry-cards";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "The playbook applied to one industry at a time: how its rules, money and regulators shape the systems you build, one volume per industry.",
};

/** Every industry volume, and the ones still to come. */
export default function IndustriesPage() {
  return (
    <article>
      <header className="mb-12 border-b border-border pb-10">
        <p className="inst mb-4">
          <Link href="/docs" className="text-accent transition-colors hover:text-foreground">
            Docs
          </Link>
        </p>
        <h1 className="mb-6 text-4xl leading-[0.95] sm:text-5xl">Industries</h1>
        <p className="max-w-3xl text-muted">
          The core of the playbook applies anywhere. Each volume here takes one industry and shows how its rules, its
          money and its regulators shape the engineering, building on the chapters before it.
        </p>
      </header>

      <IndustryCards industries={industryCards(getDocsByCategory())} />
    </article>
  );
}
