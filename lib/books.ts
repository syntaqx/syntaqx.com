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
      "How businesses that send people and trucks to customers work, from the lead and the call to the route, the technician, the service and the bill.",
    intro: [
      "HVAC, plumbing, lawn care, pest control, pool, cleaning, commercial service and delivery look like different businesses, and underneath they run on the same machinery: recurring agreements, territories, schedules with windows, routes optimized against drive time, technicians working offline, regulated materials and licenses, and billing that starts when the work does. This book surveys how the industry's platforms handle each piece, from ServiceTitan and FieldRoutes to Salesforce, eLogii and the new AI-native tools, and how you'd build it better, with the records you'll need when someone asks you to prove it.",
      "It reads in seven parts, plus a reference. How the Work Flows: the business and its branches and franchises, the software landscape, customers and properties, the agreements they sign, repair, installs and commercial work (with connected equipment, home warranty and insurance payers, and subcontractors), and last-mile delivery. Scheduling and Routing: recurring schedules, territories and capacity, booking, route optimization, weighing the routing objective, and dispatch. In the Field: the technician's app, proof of service, fleet and safety, and technicians' time, pay and labor rules. The Rules: regulated materials, licenses, permits, bonds and insurance, consumer protection, and audit trails. Selling: marketing and lead sources, door to door, pricing, one-time services and upsells, signing the agreement, and the sales teams behind it. Customers and Billing: the contact center, communications, self-service, billing recurring service, and collections and retention. Running the Platform: its architecture, AI, the metrics that run the business, and switching platforms. Reference: a glossary of every term.",
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
  {
    slug: "property-tech",
    type: "industry",
    name: "Property Tech",
    summary:
      "How the software that runs rental housing, associations, commercial space, storage and short-term rentals works, from the lease and the ledger to the law.",
    intro: [
      "A rental property looks simple from outside: a unit, a lease, rent on the first. Underneath it run three ledgers that must never mix (the owner's, the manager's and the resident's), money held in trust under each state's rules, prices that antitrust enforcers now read line by line, screening governed by credit reporting and fair housing law, and a different body of landlord-tenant law at every state and city line. This book surveys how the industry's platforms handle each piece, benchmarked across Entrata, Yardi, RealPage, AppFolio, MRI, ResMan, Rent Manager, Buildium and the specialists around them, with no single vendor as the model, and how you'd build it, extending one core data model chapter by chapter.",
      "It reads in eight parts, plus a reference. The Business: how property earns money, who the parties are, the core data model, and the software landscape. Properties, Owners and Investors: the property hierarchy, management agreements and owner accounting, funds and asset management, trust accounting, and budgets and capital projects. Leasing: listings and marketing, leads and tours, revenue management and its antitrust record, screening, the lease, and move-in and move-out. Rent and Resident Money: charges and ledgers, collecting rent, resident financial products, insurance and deposits, utilities, affordable housing, and delinquency and eviction. Operations: maintenance, vendors and payables, access and smart buildings, and resident experience. Other Property Types: student, military and specialty, senior living, associations, commercial, self storage and short-term rentals. The Rules: fair housing, landlord-tenant law as data, records and privacy, and what changes outside the US. Running the Platform: architecture and integrations, AI, operating metrics, and switching platforms. Reference: a glossary of every term.",
    ],
  },
];

/** Books planned but not written yet, shown as "Soon". */
export const UPCOMING_BOOKS: { name: string; type: BookType }[] = [
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
