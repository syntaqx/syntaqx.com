/**
 * Books: long reads that apply the playbook to one subject, outside /docs.
 * Each lives under content/books/<slug>/ and reads at /books/<slug>, a cover
 * with its chapters under it. Adding a book is a folder of chapters plus an
 * entry here. No file system access, so client components can import it.
 */

import type { BookSceneName } from "@/lib/scene/scenes";

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
  /** A shorter name, where titles that add the book's name would run long. */
  shortName?: string;
  /** One line, for cards and the cover's metadata. */
  summary: string;
  /** The cover's opening paragraphs. */
  intro: string[];
  /** The live art on the book's card and cover; every book has its own. */
  cover: BookSceneName;
}

/** A book not written yet: a name and what it would cover. */
export interface FutureBook {
  name: string;
  type: BookType;
  /** One line, for the card. */
  summary: string;
}

/** A book I've committed to: its cover is drawn, and shows still until the book is written. */
export interface UpcomingBook extends FutureBook {
  cover: BookSceneName;
}

/**
 * Written books, each with a cover at /books/<slug>. Listed by when I first
 * worked in each industry, earliest first; books outside my career follow,
 * in the order they were written.
 */
export const BOOKS: Book[] = [
  {
    slug: "commerce",
    type: "industry",
    name: "Commerce",
    cover: "basket",
    summary:
      "How selling works in software, from a brand's own store, Amazon and wholesale to the register, delivery apps, regulated goods and the platform behind them.",
    intro: [
      "Every commerce system sells from a catalog to a customer and owes someone a fulfilled order, whether that's a brand's site and Amazon listing the same product, a distributor quoting ten thousand SKUs at a price per company, or a restaurant pushing its menu to three apps. One order lives in several systems at once (the channel, the order manager, the warehouse, the carrier, the tax engine, the processor, the ledger), each able to be wrong about it in its own way, under rules that change by channel, state and product. This book surveys how the industry does each piece, benchmarked across Shopify, Salesforce, commercetools, Amazon, Walmart, Etsy, Square, Toast, DoorDash, Avalara, NetSuite and the others, with no single company as the model, and how you'd build it, extending one core data model chapter by chapter.",
      "It reads in twelve parts, plus a glossary, from the catalog, checkout and fulfillment through marketplaces, wholesale, point of sale, on-demand delivery and regulated goods.",
    ],
  },
  {
    slug: "payments",
    type: "industry",
    name: "Payments",
    cover: "tender",
    summary:
      "How the payments industry works, from a card tap to running a provider, and what each of its rules means for the systems you build.",
    intro: [
      "The playbook's Money section is about handling money correctly anywhere: amounts, state machines and ledgers. This book is about the industry those systems plug into. Card networks, banks, processors and regulators each set rules, and almost every hard problem in a payments platform is one of them doing exactly what it's supposed to.",
      "It reads in seven parts, ending with a glossary: how money moves, the rules, taking payments, paying out, issuing cards, and running a provider.",
    ],
  },
  {
    slug: "hosting-and-cloud",
    type: "industry",
    name: "Hosting & Cloud",
    cover: "cloud",
    summary:
      "How rented infrastructure works, from one server in a closet to colocation, the cloud and the businesses built on it, and back to owned metal.",
    intro: [
      "Every company in this book rents out a bigger version of one server in a closet. A homelab already holds the whole stack in miniature, and when it outgrows the house (an upload link sized for watching rather than serving, one line, one power feed) it moves into a colocation cabinet. From there the same layers scale up one at a time: bare metal, virtual machines, containers and schedulers, functions, storage, regions, managed services, deploy platforms and infrastructure as code, with the hosts, registrars, certificate authorities and edge networks that sell to everyone else on top. Kubernetes is a strong option on that path but not the end of it, and some steady workloads went back to owned metal. This book tells each layer through its history and what it cost, benchmarked across AWS, Azure, Google Cloud, Hetzner, Vercel, Cloudflare, GoDaddy, Let's Encrypt and the others, and how you'd build it, extending one core data model chapter by chapter.",
      "It reads in six movements across seventeen parts, plus a glossary: at home, up the stack, the platform, the businesses, the rules, and the top of the path and back to owned metal.",
    ],
  },
  {
    slug: "gaming",
    type: "industry",
    name: "Gaming",
    cover: "arcade",
    summary:
      "How games are built and run, from the engine and frame budget to netcode, game servers, live operations, creator economies and the rules around them.",
    intro: [
      "A game is a real-time simulation that has to feel instant on a player's machine, stay fair across a hundred thousand concurrent matches, ship a patch to millions of players overnight, and keep a store, an economy and a community running for years. This book surveys how the industry does each piece, from Unreal, Unity and in-house engines to the netcode, server fleets, launchers and backend services that public engineering write-ups describe, and how you'd build it, drawn as dimensioned technical sheets wherever a budget or a stack makes the point.",
      "It reads in eight parts, plus a glossary, from how games get made through multiplayer, live services, fair play and the money, to the rules and running the platform.",
    ],
  },
  {
    slug: "user-generated-platforms",
    type: "industry",
    name: "User-Generated Platforms",
    shortName: "UGC Platforms",
    cover: "feed",
    summary:
      "How platforms built on users' content or inventory work, from communities, media and live streams to P2P marketplaces, trust and safety, and the law.",
    intro: [
      "Forums, image hosts, short-form video apps, live streaming, chat servers, federated networks and peer-to-peer marketplaces look like different industries, and underneath they run on the same machinery: accounts with several roles, communities with their own rules and volunteer moderators, an upload path that scans every file before it publishes, video that costs money for every hour watched, money held for creators and hosts until it's paid out, and a trust and safety stack answering to Section 230, the DSA, the Online Safety Act and the child-safety reporting laws. This book surveys how the industry does each piece, benchmarked across Reddit, Discord, TikTok, YouTube, Twitch, Bluesky, Mastodon, Airbnb, Turo, Etsy and the others, with no single platform as the model, and how you'd build it, extending one core data model chapter by chapter.",
      "It reads in nine parts, plus a glossary, including media from upload to live streaming, how the For You feed works, peer-to-peer marketplaces, and trust and safety.",
    ],
  },
  {
    slug: "banking-and-lending",
    type: "industry",
    name: "Banking & Lending",
    shortName: "Banking",
    cover: "bank",
    summary:
      "How banks, credit unions, fintechs and lenders work, from the core and its ledgers to deposits, credit decisions, servicing and business spend.",
    intro: [
      "Banking is two promises and a balance sheet: a depositor is promised their money back on demand, up to a limit the government insures, and a borrower promises money back on a schedule, under rules that say what the lender had to disclose, how it decided, and what it may do when payments stop. The same dollar is recorded in several places that must agree to the cent, from a fintech's ledger to a sponsor bank's core, and a loan lives in the system that decided it, the servicer that bills it, the bureaus it is reported to and the investor who bought it. This book surveys how the industry does each piece, benchmarked across banks and credit unions, core vendors like Fiserv, Jack Henry and Thought Machine, neobanks like Chime, lenders like Affirm and Rocket, and spend platforms like Ramp, with no single company as the model, and how you'd build it, extending one core data model chapter by chapter.",
      "It reads in thirteen parts, plus a glossary, from the core and deposits through fintech and BaaS, lending, servicing and collections, to business banking and spend management.",
    ],
  },
  {
    slug: "property-tech",
    type: "industry",
    name: "Property Tech",
    shortName: "PropTech",
    cover: "tenancy",
    summary:
      "How the software that runs rental housing, associations, commercial space, storage and short-term rentals works, from the lease and the ledger to the law.",
    intro: [
      "A rental property looks simple from outside: a unit, a lease, rent on the first. Underneath it run three ledgers that must never mix (the owner's, the manager's and the resident's), money held in trust under each state's rules, prices that antitrust enforcers now read line by line, screening governed by credit reporting and fair housing law, and a different body of landlord-tenant law at every state and city line. This book surveys how the industry's platforms handle each piece, benchmarked across Entrata, Yardi, RealPage, AppFolio, MRI, ResMan, Rent Manager, Buildium and the specialists around them, with no single vendor as the model, and how you'd build it, extending one core data model chapter by chapter.",
      "It reads in eight parts, plus a glossary, from owners and trust accounting through leasing, rent and operations, to other property types like student housing, senior living and self storage.",
    ],
  },
  {
    slug: "workplace-and-collaboration",
    type: "industry",
    name: "Workplace & Collaboration",
    shortName: "Workplace",
    cover: "board",
    summary:
      "How workplace software works, from chat, meetings, docs and work tracking to identity, retention and AI, with the customer's admins holding the controls.",
    intro: [
      "Workplace software runs the same machinery as consumer chat and content, with the duties turned around. A Slack channel, a Zoom call, a Jira issue and a law firm's matter folder all sit in a tenant the customer organization controls: its admins provision and cut off people through SSO, decide who outside can see what, set retention, place legal holds and can leave with their data. The vendor runs the service and follows the customer's instructions, and builds everything around that inversion, from managed accounts and seats to enterprise search and the eDiscovery regulators and courts expect. This book surveys how the industry does each piece, benchmarked across Microsoft 365, Google Workspace, Atlassian, Slack, Zoom, Notion, Figma, Box, ServiceNow, Okta, Clio and the others, with no single company as the model, and how you'd build it, extending one core data model chapter by chapter.",
      "It reads in eleven parts, plus a glossary, from tenancy and identity through chat, meetings, docs and work management, to security and compliance and law firms.",
    ],
  },
  {
    slug: "field-operations",
    type: "industry",
    name: "Field Operations",
    cover: "route",
    summary:
      "How businesses that send people and trucks to customers work, from the lead and the call to the route, the technician, the service and the bill.",
    intro: [
      "HVAC, plumbing, lawn care, pest control, pool, cleaning, commercial service and delivery look like different businesses, and underneath they run on the same machinery: recurring agreements, territories, schedules with windows, routes optimized against drive time, technicians working offline, regulated materials and licenses, and billing that starts when the work does. This book surveys how the industry's platforms handle each piece, from ServiceTitan and FieldRoutes to Salesforce, eLogii and the new AI-native tools, and how you'd build it better, with the records you'll need when someone asks you to prove it.",
      "It reads in seven parts, plus a glossary, from how the work flows and scheduling and routing, through the field and the rules, to selling, billing and running the platform.",
    ],
  },
  {
    slug: "health-tech",
    type: "industry",
    name: "Health Tech",
    cover: "pulse",
    summary:
      "How health care runs in software, from the front desk of a small practice to records, claims, payers, pharmacy and trials, under HIPAA and the Cures Act.",
    intro: [
      "A dental office, a vet clinic and a hospital look like different businesses, and underneath they run on the same records: a patient, the people and places that treat them, appointments, encounters, coded procedures, the coverage that pays for some of it and the ledger that bills the rest. Each record lives in several systems at once, each speaking its own standard (HL7 v2, FHIR, X12, NCPDP, DICOM) and each answerable to HIPAA, the Cures Act's information blocking rules, state health privacy laws and the payer's contract. This book surveys how the industry does each piece, benchmarked across Epic, Oracle Health, athenahealth, Dentrix, Open Dental, ezyVet, Availity, Waystar, Surescripts and the others, with no single vendor as the model, and how you'd build it, extending one core data model chapter by chapter.",
      "It reads in ten parts, plus a glossary, from records and interoperability through the revenue cycle and practice management, to care delivery, payers, pharma and clinical trials.",
    ],
  },
  {
    slug: "investing-and-digital-assets",
    type: "industry",
    name: "Investing & Digital Assets",
    shortName: "Investing",
    cover: "market",
    summary:
      "How brokers, crypto exchanges, custodians and stablecoin issuers hold and trade assets, from order books and tax lots to wallets, reserves, DeFi and the law.",
    intro: [
      "A share of stock and a bitcoin look like different things, and the businesses that hold them run on the same promises: the customer owns what the ledger says they own, an order gets the best price the market offers, assets are kept apart from the firm's own, and anyone can be shown that what's owed is actually held. A broker keeps those promises through a clearing house and a century of rules written after each crisis; a crypto exchange keeps them with keys, wallets and a chain that never closes. When Lehman, MF Global, Celsius and FTX broke them, the ledger and the assets stopped agreeing, and every rule in this book is a guard against that. This book surveys how the industry does each piece, benchmarked across Robinhood, Schwab, Interactive Brokers, Coinbase, Kraken, Circle, Fireblocks, Uniswap and the others, with no single company as the model, and how you'd build it, extending one core data model chapter by chapter.",
      "It reads in thirteen parts, plus a glossary, from accounts, trading and clearing through wealth and advice, to wallets, crypto exchanges, stablecoins, DeFi and tokenization.",
    ],
  },
  {
    slug: "insurance",
    type: "industry",
    name: "Insurance",
    cover: "policy",
    summary:
      "How insurance works in software, from the rate filed with a state and the agent who sells it to the policy, the claim, the reserve and the reinsurer behind it.",
    intro: [
      "An auto policy, a commercial liability program, a cyber policy from an MGA, a twenty-year term life policy and a protection plan sold at checkout look like different businesses, and underneath they run on the same promise: a premium collected now for a payment that may come later, priced on a rate filed with a state, sold by a licensed producer, changed only through dated transactions, earned day by day, and backed by reserves and capital a regulator watches. One policy lives in several systems at once (the rater, the policy system, billing, claims, the agency's system, the reinsurer's bordereau, the statutory statement), each answerable to fifty-six jurisdictions' rules on rates, forms, notices and claim deadlines. This book surveys how the industry does each piece, benchmarked across Progressive, State Farm, Travelers, Lemonade, Chubb, Kinsale, MetLife, Guidewire, Duck Creek, Socotra, Verisk and the others, with no single company as the model, and how you'd build it, extending one core data model chapter by chapter. Health insurance stays in the Health Tech book.",
      "It reads in thirteen parts, plus a glossary, from the business and its regulation through distribution, rating, policy administration and claims, to reinsurance, personal, commercial and life lines, workers' compensation, embedded insurance and service contracts, and the platform behind them.",
    ],
  },
  {
    slug: "workforce",
    type: "industry",
    name: "Workforce",
    cover: "paystub",
    summary:
      "How payroll and HR run in software, from gross-to-net and payroll tax at every level to garnishments, wage-hour law, benefits, contractors and global pay.",
    intro: [
      "A paycheck looks like one number, and underneath it is a calculation and a set of promises. Hours, rates and elections become gross pay; gross pay becomes federal, state and local taxes, benefit deductions and garnishments, each with its own taxable wage base; and what's left moves to the employee's bank on a date the law fixes, while every amount withheld becomes a liability owed to an agency, a carrier, a plan or a court on its own deadline. A payroll provider, a PEO, an employer of record and an embedded payroll API are all keeping those promises for someone else's employees, out of money they collected first. This book surveys how the industry does each piece, benchmarked across ADP, Paychex, Paycom, Paylocity, Dayforce, Workday, Gusto, Rippling, Deel, TriNet, Check and the others, with no single company as the model, and how you'd build it, extending one core data model chapter by chapter.",
      "It reads in ten parts, plus a glossary: the business, gross to net, payroll tax, moving the money (funding, client funds, direct deposit, child support and garnishments), time and wage-hour law, hiring and HR records, leave, benefits administration, contractors and global payroll, and running the platform.",
    ],
  },
];

/** Books planned but not written yet, shown as "Soon". */
export const UPCOMING_BOOKS: UpcomingBook[] = [];

/** Books I'm weighing but haven't committed to, shown as "Considering". */
export const CONSIDERING_BOOKS: FutureBook[] = [
  {
    name: "Logistics & Supply Chain",
    type: "industry",
    summary:
      "Loads, shipments and inventory across brokers, carriers and warehouses, through EDI, customs and recalls.",
  },
  {
    name: "Travel, Hospitality & Events",
    type: "industry",
    summary:
      "Reservations, rates and inventory across GDS and channel managers, hotel systems and ticketed on-sales.",
  },
  {
    name: "Advertising",
    type: "industry",
    summary:
      "Auctions, impressions and attribution across DSPs and SSPs, and the consent and privacy law that limits each.",
  },
  {
    name: "Energy & Utilities",
    type: "industry",
    summary:
      "Meter reads into bills under tariffs, net metering and distributed energy, and settlement in wholesale markets.",
  },
  {
    name: "Public Sector & Education",
    type: "industry",
    summary:
      "Permits and benefits eligibility for government, student records and aid for schools, donors and grants for nonprofits.",
  },
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
