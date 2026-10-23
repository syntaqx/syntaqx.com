import Link from "next/link";
import type { Metadata } from "next";
import { getDocsByCategory } from "@/lib/docs";
import { INDUSTRIES, UPCOMING_INDUSTRIES, formatMinutes, industrySection } from "@/lib/industries";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "The playbook applied to one industry at a time: how its rules, money and regulators shape the systems you build, one volume per industry.",
};

/** Every industry volume, and the ones still to come. */
export default function IndustriesPage() {
  const categories = getDocsByCategory();

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

      <ul className="grid gap-4 sm:grid-cols-2">
        {INDUSTRIES.map((industry) => {
          const volume = categories.find((c) => c.section === industrySection(industry.slug));
          const minutes = volume?.docs.reduce((sum, d) => sum + d.readingMinutes, 0) ?? 0;
          return (
            <li key={industry.slug}>
              <Link
                href={`/docs/industries/${industry.slug}`}
                className="group block h-full border border-border p-5 transition-colors hover:border-accent"
              >
                <span className="inst block text-dim">
                  {volume?.docs.length ?? 0} chapters · {formatMinutes(minutes)} read
                </span>
                <span className="mt-2 block text-xl font-semibold text-foreground transition-colors group-hover:text-accent">
                  {industry.name}
                </span>
                <span className="mt-2 block text-sm leading-relaxed text-dim">{industry.summary}</span>
              </Link>
            </li>
          );
        })}
        {UPCOMING_INDUSTRIES.map((name) => (
          <li key={name} className="flex items-center justify-between border border-dashed border-border p-5 text-dim">
            {name}
            <span className="inst border border-border px-1.5 py-px text-[0.5rem]">Soon</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
