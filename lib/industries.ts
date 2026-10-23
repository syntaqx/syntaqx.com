/**
 * Industry volumes: the playbook applied to one industry's rules. Each lives
 * under content/docs/industries/<name>/, which makes its section
 * "industries-<name>" and gives it its own sidebar.
 */

export interface Industry {
  /** The folder under content/docs/industries/, and the cover's URL segment. */
  slug: string;
  name: string;
  /** One line, for cards and the cover's metadata. */
  summary: string;
  /** The cover's opening paragraphs. */
  intro: string[];
}

/** Written volumes, each with a cover at /docs/industries/<slug>. */
export const INDUSTRIES: Industry[] = [
  {
    slug: "payments",
    name: "Payments",
    summary:
      "How the payments industry works, from a card tap to running a provider, and what each of its rules means for the systems you build.",
    intro: [
      "The playbook's Payments section is about handling money correctly anywhere: amounts, idempotency, state machines and ledgers. This volume is about the industry those systems plug into. Card networks, banks, processors and regulators each set rules, and almost every hard problem in a payments platform is one of them doing exactly what it's supposed to.",
      "It reads in order: how a payment moves and what it costs; who sets the rules; taking payments in, keeping cards on file, and defending against fraud and disputes; moving money out; and finally what it takes to become the provider everyone else builds on.",
    ],
  },
];

export const industrySection = (slug: string) => `industries-${slug}`;

/** "47 min", or "5 h 12 min" for a whole volume. */
export const formatMinutes = (minutes: number) =>
  minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${minutes % 60} min`;

/** Industries with a volume planned but not written yet, shown as "Soon". */
export const UPCOMING_INDUSTRIES = [
  "Field Service",
  "Property Tech",
  "Marketplaces",
  "Consumer Fintech",
  "Gaming",
  "Media & UGC",
  "Web Hosting",
  "E-commerce",
];

export const isIndustry = (section: string) => section.startsWith("industries-");

/** "Payments Industry" reads as "Payments" in a list of industries. */
export const industryName = (category: string) => category.replace(/ Industry$/, "");
