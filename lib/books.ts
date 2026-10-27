/**
 * Books: long reads that apply the playbook to one subject, outside /docs.
 * Each lives under content/books/<slug>/ and reads at /books/<slug>, a cover
 * with its chapters under it. Adding a book is a folder of chapters plus an
 * entry here. No file system access, so client components can import it.
 */

/** "industry": one industry's rules and money. "topic": one subject, across industries. */
export type BookType = "industry" | "topic";

/** How each type is headed on /books, in this order. Types with no books don't show. */
export const BOOK_TYPES: Record<BookType, string> = {
  industry: "Industry Books",
  topic: "Topic Books",
};

export interface Book {
  /** The folder under content/books/, and the URL segment. */
  slug: string;
  type: BookType;
  name: string;
  /** One line, for cards and the cover's metadata. */
  summary: string;
  /** The cover's opening paragraphs. */
  intro: string[];
}

/** Written books, each with a cover at /books/<slug>. */
export const BOOKS: Book[] = [
  {
    slug: "payments",
    type: "industry",
    name: "Payments",
    summary:
      "How the payments industry works, from a card tap to running a provider, and what each of its rules means for the systems you build.",
    intro: [
      "The playbook's Payments section is about handling money correctly anywhere: amounts, idempotency, state machines and ledgers. This book is about the industry those systems plug into. Card networks, banks, processors and regulators each set rules, and almost every hard problem in a payments platform is one of them doing exactly what it's supposed to.",
      "It reads in six parts. How Money Moves: the parties and the companies that fill each role, a payment by card and terminal and what it costs, then by bank transfer, check, cash and wallet, across borders and currencies, and all of them compared. The Rules: who sets them, what you may pass on to the payer, and how they change in Canada and in the EU and UK. Taking Payments: onboarding merchants, the API they integrate with, authenticating cardholders, keeping cards on file, taking payments by phone and by link, and defending against fraud and disputes. Paying Out: paying merchants, the bank accounts and files behind it, reconciling every balance against processors and banks, and paying vendors. Running a Provider: serving software platforms, routing across processors and switching between them, running a card vault and its keys, what a processor runs, certification, operations, AI and agentic payments, the metrics a provider runs on, and becoming the provider everyone else builds on. Reference: a glossary of every term.",
    ],
  },
  {
    slug: "field-operations",
    type: "industry",
    name: "Field Operations",
    summary:
      "How businesses that send people and trucks to customers work, from the sale at the door to the route, the service and the bill.",
    intro: [
      "HVAC, plumbing, lawn care, pest control, pool, cleaning, commercial service and delivery look like different businesses, and underneath they run on the same machinery: recurring agreements, territories, schedules with windows, routes optimized against drive time, technicians working offline, regulated materials and licenses, and billing that starts when the work does. This book surveys how the industry's platforms handle each piece, from ServiceTitan and FieldRoutes to Salesforce, eLogii and the new AI-native tools, and how you'd build it better, with the records you'll need when someone asks you to prove it.",
      "It reads in seven parts, plus a reference. How the Work Flows: the business, the software landscape, customers and properties, the agreements they sign, repair, installs and commercial work, and last-mile delivery. Scheduling and Routing: recurring schedules, territories and capacity, booking, route optimization, weighing the routing objective, and dispatch. In the Field: the technician's app, proof of service, and fleet and safety. The Rules: regulated materials, licenses and permits, consumer protection, and audit trails. Selling: door to door, pricing, one-time services and upsells, signing the agreement, and the sales teams behind it. Customers and Billing: communications, self-service, billing recurring service, and collections and retention. Running the Platform: its architecture, AI, the metrics that run the business, and switching platforms. Reference: a glossary of every term.",
    ],
  },
  {
    slug: "gaming",
    type: "industry",
    name: "Gaming",
    summary:
      "How games are built and run, from the engine and the frame budget to netcode, game servers, patching, live operations and the rules around them.",
    intro: [
      "A game is a real-time simulation that has to feel instant on a player's machine, stay fair across a hundred thousand concurrent matches, ship a patch to millions of players overnight, and keep a store, an economy and a community running for years. This book surveys how the industry does each piece, from Unreal, Unity and in-house engines to the netcode, server fleets, launchers and backend services that public engineering write-ups describe, and how you'd build it, drawn as dimensioned technical sheets wherever a budget or a stack makes the point.",
      "It reads in eight parts, plus a reference. How Games Get Made: the business and its data model, the engine landscape, building your own engine, and production pipelines. Clients and Delivery: game clients and launchers, and patching. Multiplayer: netcode, game servers, lockstep and rollback, matchmaking, and social systems. Backend and Live Services: backend architecture, accounts, economies, live operations and telemetry. Fair Play and Safety: anti-cheat, player behavior and player support. Money: monetization, and stores and payments. The Rules: ratings and children, loot boxes and consumer law, and accessibility. Running the Platform: metrics, AI and esports. Reference: a glossary of every term.",
    ],
  },
];

/** Books planned but not written yet, shown as "Soon". */
export const UPCOMING_BOOKS: { name: string; type: BookType }[] = [
  { name: "Property Tech", type: "industry" },
  { name: "Commerce & Marketplaces", type: "industry" },
  { name: "Consumer Fintech", type: "industry" },
  { name: "Social & UGC", type: "industry" },
  { name: "Hosting & Cloud", type: "industry" },
];

export const getBook = (slug: string) => BOOKS.find((b) => b.slug === slug);

/** "47 min", or "5 h 12 min" for a whole book. */
export const formatMinutes = (minutes: number) =>
  minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${minutes % 60} min`;

/**
 * A book's chapters, in order, as runs of the same frontmatter `part`. The
 * books tests keep each part's chapters contiguous, so a part is one run.
 */
export function bookParts<T extends { part?: string }>(chapters: T[]) {
  const parts: { title: string; docs: T[] }[] = [];
  for (const doc of chapters) {
    const title = doc.part ?? "";
    if (parts.at(-1)?.title !== title) parts.push({ title, docs: [] });
    parts.at(-1)!.docs.push(doc);
  }
  return parts;
}
