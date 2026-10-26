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
      "It reads in six parts. How Money Moves: a payment by card and terminal and what it costs, then by bank transfer, check, cash and wallet, and all of them compared. The Rules: who sets them, what you may pass on to the payer, and how they change across the border in Canada. Taking Payments: onboarding merchants, the API they integrate with, authenticating cardholders, keeping cards on file, taking payments by phone and by link, and defending against fraud and disputes. Paying Out: paying merchants, the bank accounts and files behind it, and paying vendors. Running a Provider: serving software platforms, routing across processors, running a card vault and its keys, what a processor runs, certification, operations, and becoming the provider everyone else builds on. Reference: a glossary of every term.",
    ],
  },
  {
    slug: "field-operations",
    name: "Field Operations",
    summary:
      "How businesses that send people and trucks to customers work, from the sale at the door to the route, the service and the bill.",
    intro: [
      "HVAC, plumbing, lawn care, pest control, pool, cleaning, commercial service and delivery look like different businesses, and underneath they run on the same machinery: recurring agreements, territories, schedules with windows, routes optimized against drive time, technicians working offline, regulated materials and licenses, and billing that starts when the work does. This volume surveys how the industry's platforms handle each piece, from ServiceTitan and FieldRoutes to Salesforce, eLogii and the new AI-native tools, and how you'd build it better, with the records you'll need when someone asks you to prove it.",
      "It reads in seven parts, plus a reference. How the Work Flows: the business, the software landscape, customers and properties, the agreements they sign, repair, installs and commercial work, and last-mile delivery. Scheduling and Routing: recurring schedules, territories and capacity, booking, route optimization, weighing the routing objective, and dispatch. In the Field: the technician's app, proof of service, and fleet and safety. The Rules: regulated materials, licenses and permits, consumer protection, and audit trails. Selling: door to door, pricing, signing the agreement, and the sales teams behind it. Customers and Billing: communications, self-service, billing recurring service, and collections and retention. Running the Platform: its architecture, AI, the metrics that run the business, and switching platforms. Reference: a glossary of every term.",
    ],
  },
];

export const industrySection = (slug: string) => `industries-${slug}`;

/** "47 min", or "5 h 12 min" for a whole volume. */
export const formatMinutes = (minutes: number) =>
  minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${minutes % 60} min`;

/** Industries with a volume planned but not written yet, shown as "Soon". */
export const UPCOMING_INDUSTRIES = [
  "Gaming",
  "Property Tech",
  "Commerce & Marketplaces",
  "Consumer Fintech",
  "Social & UGC",
  "Hosting & Cloud",
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
