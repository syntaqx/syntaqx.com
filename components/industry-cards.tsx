import Link from "next/link";
import { UPCOMING_INDUSTRIES } from "@/lib/industries";

export interface IndustryCard {
  href: string;
  name: string;
  summary: string;
  chapters: number;
  /** Total reading time, already formatted ("2 h 58 min"). */
  readingTime: string;
}

/** Each industry volume as a card linking to its cover, then the ones still to come. */
export function IndustryCards({ industries }: { industries: IndustryCard[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {industries.map((industry) => (
        <li key={industry.href}>
          <Link
            href={industry.href}
            className="group block h-full border border-border p-5 transition-colors hover:border-accent"
          >
            <span className="inst block text-dim">
              {industry.chapters} chapters · {industry.readingTime} read
            </span>
            <span className="mt-2 block text-xl font-semibold text-foreground transition-colors group-hover:text-accent">
              {industry.name}
            </span>
            <span className="mt-2 block text-sm leading-relaxed text-dim">{industry.summary}</span>
          </Link>
        </li>
      ))}
      {UPCOMING_INDUSTRIES.map((name) => (
        <li key={name} className="flex items-center justify-between border border-dashed border-border p-5 text-dim">
          {name}
          <span className="inst border border-border px-1.5 py-px text-[0.5rem]">Soon</span>
        </li>
      ))}
    </ul>
  );
}
