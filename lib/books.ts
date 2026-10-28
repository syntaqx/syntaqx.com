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

/** Written books, each with a cover at /books/<slug>. */
export const BOOKS: Book[] = [
  {
    slug: "payments",
    type: "industry",
    name: "Payments",
    cover: "tender",
    summary:
      "How the payments industry works, from a card tap to running a provider, and what each of its rules means for the systems you build.",
    intro: [
      "The playbook's Payments section is about handling money correctly anywhere: amounts, idempotency, state machines and ledgers. This book is about the industry those systems plug into. Card networks, banks, processors and regulators each set rules, and almost every hard problem in a payments platform is one of them doing exactly what it's supposed to.",
      "It reads in seven parts. How Money Moves: the parties and the companies that fill each role, a payment by card and terminal and what it costs, then by bank transfer, check, cash and wallet, in stablecoins, across borders and currencies, and all of them compared. The Rules: who sets them, what you may pass on to the payer, and how they change in Canada and in the EU and UK. Taking Payments: onboarding merchants, the API they integrate with, the checkout pages, invoices and payment links built on it, authenticating cardholders, keeping cards on file, taking payments by phone, and defending against fraud and disputes. Paying Out: paying merchants, the bank accounts and files behind it, reconciling every balance against processors and banks, and paying vendors. Issuing Cards: how a card program is structured, BIN sponsorship and issuer processors, the businesses built on issuing, the authorization decision and just-in-time funding, and the issuer's side of disputes. Running a Provider: serving software platforms, selling through partners and paying their residuals, what changes by vertical, routing across processors and switching between them, running a card vault and its keys, what a processor runs, certification, architecture at scale, operations, AI and agentic payments, the metrics a provider runs on, and becoming the provider everyone else builds on. Reference: a glossary of every term.",
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
      "It reads in seven parts, plus a reference. How the Work Flows: the business and its branches and franchises, the software landscape, customers and properties, the agreements they sign, repair, installs and commercial work (with connected equipment, home warranty and insurance payers, and subcontractors), and last-mile delivery. Scheduling and Routing: recurring schedules, territories and capacity, booking, route optimization, weighing the routing objective, and dispatch. In the Field: the technician's app, proof of service, fleet and safety, and technicians' time, pay and labor rules. The Rules: regulated materials, licenses, permits, bonds and insurance, consumer protection, and audit trails. Selling: marketing and lead sources, door to door, pricing, one-time services and upsells, signing the agreement, and the sales teams behind it. Customers and Billing: the contact center, communications, self-service, billing recurring service, and collections and retention. Running the Platform: its architecture, AI, the metrics that run the business, and switching platforms. Reference: a glossary of every term.",
    ],
  },
  {
    slug: "gaming",
    type: "industry",
    name: "Gaming",
    cover: "arcade",
    summary:
      "How games are built and run, from the engine and the frame budget to netcode, game servers, mobile, live operations, creator economies and the rules around them.",
    intro: [
      "A game is a real-time simulation that has to feel instant on a player's machine, stay fair across a hundred thousand concurrent matches, ship a patch to millions of players overnight, and keep a store, an economy and a community running for years. This book surveys how the industry does each piece, from Unreal, Unity and in-house engines to the netcode, server fleets, launchers and backend services that public engineering write-ups describe, and how you'd build it, drawn as dimensioned technical sheets wherever a budget or a stack makes the point.",
      "It reads in eight parts, plus a reference. How Games Get Made: the business, its deals and its data model, the engine landscape and middleware, building your own engine, and production pipelines from localization to porting. Clients and Delivery: game clients and launchers, patching, and mobile games. Multiplayer: netcode, game servers and persistent worlds, lockstep and rollback, matchmaking, and social systems. Backend and Live Services: backend architecture, accounts, saves and player data, economies, live operations through end of service, and telemetry. Fair Play and Safety: anti-cheat and DRM, player behavior and its regulatory duties, and player support. Money: monetization, stores and payments, and UGC and creator economies. The Rules: ratings and children, loot boxes and consumer law, and accessibility. Running the Platform: metrics, AI and esports. Reference: a glossary of every term.",
    ],
  },
  {
    slug: "property-tech",
    type: "industry",
    name: "Property Tech",
    cover: "tenancy",
    summary:
      "How the software that runs rental housing, associations, commercial space, storage and short-term rentals works, from the lease and the ledger to the law.",
    intro: [
      "A rental property looks simple from outside: a unit, a lease, rent on the first. Underneath it run three ledgers that must never mix (the owner's, the manager's and the resident's), money held in trust under each state's rules, prices that antitrust enforcers now read line by line, screening governed by credit reporting and fair housing law, and a different body of landlord-tenant law at every state and city line. This book surveys how the industry's platforms handle each piece, benchmarked across Entrata, Yardi, RealPage, AppFolio, MRI, ResMan, Rent Manager, Buildium and the specialists around them, with no single vendor as the model, and how you'd build it, extending one core data model chapter by chapter.",
      "It reads in eight parts, plus a reference. The Business: how property earns money, who the parties are, how big the market is, the core data model, and the software landscape of suites, specialists, AI packaging and consolidation. Properties, Owners and Investors: portfolios, properties and units, management agreements and owner distributions, funds, waterfalls and asset management, trust accounting and three-way reconciliation, and budgets and capital projects. Leasing: listings and all-in pricing laws, leads, tours and the leasing center, revenue management and the RealPage antitrust record as design constraints, applications and screening, the lease, and move-in and move-out with deposit deadlines. Rent and Resident Money: charges and resident ledgers, collecting rent and who holds it, resident financial products, insurance, deposits and guarantees, utilities and energy, subsidized and affordable housing, and delinquency, collections and eviction. Operations: maintenance and work orders, vendors and payables, access, smart buildings and parking, and resident experience. Other Property Types: student housing by the bed, military and specialty housing, senior living, community associations, commercial property, self storage and lien sales, and short-term rentals. The Rules: fair housing, landlord-tenant law modeled as effective-dated data, records, privacy and audits, and what changes in Canada, the UK, Australia and the EU. Running the Platform: architecture, users and integrations, AI agents and their governance, operating metrics, and switching platforms and onboarding acquisitions. Reference: a glossary of every term, grouped by part.",
    ],
  },
  {
    slug: "user-generated-platforms",
    type: "industry",
    name: "User-Generated Platforms",
    cover: "feed",
    summary:
      "How platforms where users supply the content or the inventory work, from communities, media and live streams to peer-to-peer marketplaces, trust and safety, and the law.",
    intro: [
      "Forums, image hosts, short-form video apps, live streaming, chat servers, federated networks and peer-to-peer marketplaces look like different industries, and underneath they run on the same machinery: accounts with several roles, communities with their own rules and volunteer moderators, an upload path that scans every file before it publishes, video that costs money for every hour watched, money held for creators and hosts until it's paid out, and a trust and safety stack answering to Section 230, the DSA, the Online Safety Act and the child-safety reporting laws. This book surveys how the industry does each piece, benchmarked across Reddit, Discord, Pinterest, Imgur, TikTok, Instagram, Snapchat, Twitch, YouTube, Kick, Tumblr, Bluesky, Mastodon, Airbnb, Outdoorsy, RVshare, Turo, Etsy, eBay and Vinted and the vendors behind them, with no single platform as the model, and how you'd build it, extending one core data model chapter by chapter.",
      "It reads in nine parts, plus a reference. The Business: how the platforms make money, how big they are, the core data model, the platform and vendor landscape, and accounts, identity and standing. Communities and Conversation: communities, roles and permissions, posts and voting, feeds and recommendations, search, real-time chat, voice rooms, volunteer moderation, federation, and developer platforms and data access. Media: the upload path, images at scale, storage and delivery economics, video on demand, and live streaming from ingest to latency, VODs and the interactive layer. Social and Short-Form: interest-graph feeds and how the algorithm behind For You works, sounds, remix and duets, the camera and effects, stories and disappearing content, and social commerce and live shopping. Creators and Money: monetization strategies, ads, brand safety and data licensing, creator monetization, and paying creators and sellers. Peer-to-Peer Marketplaces: supply onboarding, listings and ranking, availability and booking, pricing and all-in prices, deposits and protection, damage and claims, messaging and reviews, cancellations and disputes, and marketplace fraud. Trust and Safety: the law of hosting user content, moderation at scale, spam and bots, child safety, violent extremism and graphic content, intimate image abuse, copyright, and abuse desks for hosts and registrars. The Rules: regulators and enforcement, minors and age assurance, law enforcement requests, and transparency reporting. Running the Platform: architecture, AI, operating metrics, and migrations, purges and shutdowns. Reference: a glossary of every term, grouped by part.",
    ],
  },
  {
    slug: "hosting-and-cloud",
    type: "industry",
    name: "Hosting & Cloud",
    cover: "cloud",
    summary:
      "How companies that rent out infrastructure work, from the rack and the hypervisor to domains, certificates, the edge, messaging, metered billing and the law.",
    intro: [
      "Web hosts, clouds, PaaS and frontend clouds, registrars, certificate authorities, edge networks and communications platforms look like different industries, and underneath they rent the same thing: capacity someone else owns, measured and billed by the month or the unit. Each one runs on a layer below it, a hyperscaler under a PaaS, a registry under a registrar, carriers under a texting platform, and passes that layer's fees, outages and rules through to its customers. This book tells the stack bottom to top and through its history, each layer with the problem it solved and what it cost, benchmarked across AWS, Azure, Google Cloud, Oracle, DigitalOcean, Akamai, Hetzner, OVHcloud, Vercel, Netlify, Heroku, Fly.io, Cloudflare, Fastly, GoDaddy, Newfold, Hostinger, IONOS, SiteGround, WP Engine, Verisign, Let's Encrypt, Twilio, Bandwidth and the others, with no single provider as the model, and how you'd build it, extending one core data model chapter by chapter.",
      "It reads in seventeen parts, plus a reference. The Business: the parties, every way providers earn, how big they are, the core data model, the provider landscape, accounts and resellers, and a dated timeline from bare metal to cloud and back. The Stack, Bottom to Top: data centers, dedicated servers, data center networking, virtualization, shared hosting isolation, containers, schedulers, microVMs, functions and edge compute, storage, regions and cells, hybrid cloud and repatriation. Kubernetes: its architecture, managed offerings, networking, storage, packaging and GitOps, multi-tenancy and policy, autoscaling and cost, and the alternatives. Managed Services: databases, serverless and edge databases, queues and streaming, observability, and open source and the clouds. Deployment: how code got to servers, platforms taking over the deploy, and PaaS and frontend clouds. CI/CD Platforms: how CI began, the platform business, runners, continuous delivery, artifacts and registries, and pipeline supply-chain security. Infrastructure as Code: CFEngine and Puppet, Chef, Ansible and Salt, Packer, Terraform and OpenTofu, and testing, policy and secrets. Homelab: hardware, storage, hypervisors, networks, routing, self-hosted apps, exposing services, AI at home, and the move to colocation. Web Hosting: how it makes money, cPanel and WHM, panel licensing, managed WordPress, backups and migrations, and email hosting. Domains and DNS: ICANN and registries, EPP, the domain lifecycle, transfers and locks, registration data, DNS abuse, disputes, new gTLDs, and DNS hosting. Certificates: the Web PKI, ACME at scale, and shorter lifetimes and distrust. The Edge: the business, networks and IP addresses, caching, TLS, DDoS, and WAF and bots. Communications Platforms: the CPaaS business, numbers and porting, texting registration, sending a text, voice, telecom duties, fraud, email sending and inbox rules. Metering and Billing: metering and rating, pricing catalogs, free tiers and credits, commitments and marketplaces, renewal law, invoices and suspension, tax, SLAs, and FinOps. Abuse, Trust and the Law: abuse on infrastructure, stolen keys, conduits and blocking orders, sanctions, and law enforcement. Market Rules and Compliance: compliance programs, egress and switching, competition cases, and licensing disputes. Running the Provider: architecture, GPU and AI clouds, where AI runs, outages and status pages, operating metrics, and end of life. Reference: a glossary of every term, grouped by part.",
    ],
  },
];

/** Books planned but not written yet, shown as "Soon". */
export const UPCOMING_BOOKS: UpcomingBook[] = [
  {
    name: "Health Tech",
    type: "industry",
    cover: "pulse",
    summary: "Practice management and patient engagement first, then EHRs, FHIR, claims, prior auth and pharmacy, under HIPAA.",
  },
  {
    name: "Commerce",
    type: "industry",
    cover: "basket",
    summary: "Catalog, orders and inventory across your store, POS and marketplaces like Amazon, plus subscriptions and regulated goods.",
  },
  {
    name: "Banking & Lending",
    type: "industry",
    cover: "bank",
    summary: "Deposit and loan ledgers on a core or a sponsor bank, credit decisions under TILA and ECOA, and business spend management.",
  },
  {
    name: "Workplace & Collaboration",
    type: "industry",
    cover: "board",
    summary: "Tenants, seats and permissions for chat, docs and work tracking, where the customer owns the content and sets retention.",
  },
];

/** Books I'm weighing but haven't committed to, shown as "Considering". */
export const CONSIDERING_BOOKS: FutureBook[] = [
  { name: "Insurance", type: "industry", summary: "Policies, premiums and claim reserves, rated and filed state by state, from carriers to embedded coverage." },
  { name: "Workforce", type: "industry", summary: "Gross-to-net payroll, tax by state and locality, garnishments, benefits enrollment and wage-hour law." },
  {
    name: "Logistics & Supply Chain",
    type: "industry",
    summary: "Loads, shipments and inventory across brokers, carriers and warehouses, through EDI, customs and recalls.",
  },
  {
    name: "Travel, Hospitality & Events",
    type: "industry",
    summary: "Reservations, rates and inventory across GDS and channel managers, hotel systems and ticketed on-sales.",
  },
  {
    name: "Advertising",
    type: "industry",
    summary: "Auctions, impressions and attribution across DSPs and SSPs, and the consent and privacy law that limits each.",
  },
  {
    name: "Investing",
    type: "industry",
    summary: "Accounts, positions and tax lots at a broker or custodian, order routing and best execution, and digital asset custody.",
  },
  {
    name: "Energy & Utilities",
    type: "industry",
    summary: "Meter reads into bills under tariffs, net metering and distributed energy, and settlement in wholesale markets.",
  },
  {
    name: "Public Sector & Education",
    type: "industry",
    summary: "Permits and benefits eligibility for government, student records and aid for schools, donors and grants for nonprofits.",
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
