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
      "It reads in five parts. How Money Moves: a payment by card, terminal, wallet, bank transfer, check or cash, and what it costs. The Rules: who sets them, what you may pass on to the payer, and how they change across the border in Canada. Taking Payments: onboarding merchants, authenticating cardholders, keeping cards on file, taking payments by phone, and defending against fraud and disputes. Paying Out: moving money to merchants and vendors, and the bank accounts behind it. Running a Provider: routing, embedding payments in software, running a card vault and its keys, certification, and becoming the provider everyone else builds on.",
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

/**
 * A volume's chapters, in order, as runs of the same frontmatter `part`. The
 * docs tests keep each part's chapters contiguous, so a part is one run.
 */
export function industryParts<T extends { part?: string }>(docs: T[]) {
  const parts: { title: string; docs: T[] }[] = [];
  for (const doc of docs) {
    const title = doc.part ?? "";
    if (parts.at(-1)?.title !== title) parts.push({ title, docs: [] });
    parts.at(-1)!.docs.push(doc);
  }
  return parts;
}

export const isIndustry = (section: string) => section.startsWith("industries-");

/** "Payments Industry" reads as "Payments" in a list of industries. */
export const industryName = (category: string) => category.replace(/ Industry$/, "");

/** The card data for every written volume, from its chapters. */
export function industryCards(categories: { section: string; docs: { readingMinutes: number }[] }[]) {
  return INDUSTRIES.map((industry) => {
    const docs = categories.find((c) => c.section === industrySection(industry.slug))?.docs ?? [];
    return {
      href: `/docs/industries/${industry.slug}`,
      name: industry.name,
      summary: industry.summary,
      chapters: docs.length,
      readingTime: formatMinutes(docs.reduce((sum, d) => sum + d.readingMinutes, 0)),
    };
  });
}
