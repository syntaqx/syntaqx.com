+++
title = "The Collaboration Landscape"
description = "The categories of workplace software, suites against best-of-breed, market sizes from the filings, a dated timeline of deals and shutdowns, and self-hosting."
category = "Workplace & Collaboration Industry"
order = 2002
part = "The Business"
tags = ["workplace", "collaboration", "market", "acquisitions", "open-source"]
+++

Workplace software is a handful of categories that every large vendor wants to own at once. Chat, meetings, email and calendar, documents and wikis, files, work tracking, service desks, design and whiteboards, search and AI each started as somebody's standalone product, and each is now also a tab inside a suite. The landscape is that tension: two suites sold to nearly every employer (Microsoft 365 and Google Workspace), a ring of independent vendors who are better at one or two things (Slack, Zoom, Atlassian, Notion, Figma, Asana, monday.com, Dropbox, Box, DocuSign), a steady flow of the independents into larger companies, and products that stop when a parent decides they no longer fit.

It matters to the system you build because the landscape sets the integration surface. A customer on Microsoft 365 that also runs Slack, Jira and Zoom expects identity from Entra, files from SharePoint, calendar from Exchange and one audit trail across all of it; a product that shuts down owes its customers an export path and a date. This chapter lays out the categories, the suites-against-best-of-breed contest, what the filings say about size, a dated timeline of acquisitions and shutdowns, and the open-source and self-hosted alternatives, as of October 2026. Antitrust is [Suites, Bundling & Antitrust](/books/workplace-and-collaboration/suites-bundling-and-antitrust); how the money is made is [Business Models & Unit Economics](/books/workplace-and-collaboration/business-models).

## How the Platforms Do It

| Category | Suite products | Independent leaders | Open source and self-hosted |
| --- | --- | --- | --- |
| **Chat** | Microsoft Teams, Google Chat, Zoho Cliq | Slack (Salesforce) | Mattermost, Zulip, Rocket.Chat, Element on Matrix |
| **Meetings and phone** | Teams meetings and Teams Phone, Google Meet | Zoom, Webex, RingCentral | Jitsi, BigBlueButton |
| **Email and calendar** | Exchange Online and Outlook, Gmail and Google Calendar | (rarely standalone in business) | Nextcloud and other groupware |
| **Docs and wikis** | Word, Loop, SharePoint pages; Google Docs, Sites | Notion, Confluence, Coda, Quip | Nextcloud, wiki software |
| **Files** | OneDrive and SharePoint, Google Drive | Dropbox, Box | Nextcloud |
| **Work management** | Planner, Azure Boards | Jira, Linear, Asana, monday.com, ClickUp, Smartsheet, GitHub and GitLab issues | GitLab Community Edition, Plane |
| **Service management** | (none in the core suites) | ServiceNow, Jira Service Management, Freshservice | Open-source help desks |
| **Design and whiteboards** | Microsoft Whiteboard | Figma and FigJam, Miro, Mural, Lucid, Canva | Penpot, Excalidraw |
| **E-signature** | (partner integrations) | DocuSign, Adobe Acrobat Sign, Dropbox Sign | (few) |
| **Search and AI** | Microsoft 365 Copilot, Gemini in Workspace | Glean, Slack AI, Atlassian Rovo, Notion AI | Self-hosted models over self-hosted stores |

Three readings of the table matter for the rest of the volume. Every independent leader integrates with both suites, because its customers already run one; Atlassian's annual report notes that "a majority of our revenue" comes from Jira, Confluence and Jira Service Management, each of which sells into tenants that already run a suite ([Atlassian 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1650372/000165037226000036/team-20260630.htm)). The suites are converging on the independents' categories (Loop against Notion, Planner against Asana) while the independents expand toward suites (Atlassian's Teamwork Collection, Zoom's Workplace, Salesforce's Slack plus Agentforce). And open source survives mostly where control is the requirement: government, defense and regulated industries that must run their own servers.

## The Categories

**Chat** is the most contested category and the one that sparked the competition case. Slack defined the channel-based product; Teams arrived inside Office 365, and in the European Commission's description it offers "messaging, calling, video meetings, and file sharing" and "brings together Microsoft's and third-party workplace tools" ([European Commission: Statement of Objections, June 2024](https://ec.europa.eu/commission/presscorner/detail/en/ip_24_3446)). Chat is where the inversion of duties is sharpest: retention, holds and eDiscovery over private messages are the customer's tools. [Channels, Threads & Direct Messages](/books/workplace-and-collaboration/workplace-chat) covers the products.

**Meetings and phone** split into video meetings (Zoom, Teams, Meet, Webex), business telephony that replaced the desk phone (UCaaS: Teams Phone, Zoom Phone, RingCentral), and contact centers. Zoom is the independent benchmark: $4.87 billion of revenue in fiscal 2026, 60.3% of it from Enterprise customers and 39.7% from Online customers who mostly buy on a card ([Zoom 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1585521/000158552126000030/zm-20260131.htm)).

**Email and calendar** almost never sell alone in business: they are the base of the two suites, and the other categories hang off them (meeting invites, calendar-based presence, notifications by email). [Email & Calendar](/books/workplace-and-collaboration/email-and-calendar) covers the protocols.

**Docs, wikis and files** run from page editors (Google Docs, Word, Notion, Confluence, Coda) through file sync and sharing (Dropbox, Box, OneDrive, Drive) to e-signature (DocuSign). The file vendors are the mature end of the market: Dropbox reported $2.52 billion of 2025 revenue, down 1.1%, with 18.08 million paying users ([Dropbox 10-K 2025](https://www.sec.gov/Archives/edgar/data/1467623/000146762326000008/dbx-20251231.htm)); Box $1.18 billion for fiscal 2026, up 8%, from over 100,000 paying organizations ([Box 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1372612/000119312526098466/box-20260131.htm)); DocuSign $3.22 billion, up 8%, from over 1.8 million customers ([DocuSign 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1261333/000126133326000021/docu-20260131.htm)).

**Work management** is the most fragmented category: issue trackers for software teams (Jira, Linear, GitHub and GitLab issues, Azure Boards), general project tools (Asana, monday.com, ClickUp, Smartsheet, Wrike, Trello) and no-code databases (Airtable). Asana reported $790.8 million for fiscal 2026, up 9% ([Asana 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1477720/000147772026000021/asan-20260131.htm)); monday.com $1.23 billion for 2025, up 27% ([monday.com 20-F 2025](https://www.sec.gov/Archives/edgar/data/1845338/000117891326000870/zk2634436.htm)).

**Service management** is the IT help desk and its extensions into HR and facilities: request catalogs, incidents, changes, SLAs and an asset database. It sits closer to enterprise software than to collaboration, but Jira Service Management brings it into the same tenant as Jira and Confluence. [IT & Service Management](/books/workplace-and-collaboration/service-management) covers it.

**Design and visual collaboration** is Figma's category, plus whiteboards (Miro, Mural, FigJam, Lucid) and Canva at the brand end. Figma reported $1.06 billion of 2025 revenue, up 41%, in its first annual report as a public company ([Figma 10-K 2025](https://www.sec.gov/Archives/edgar/data/1579878/000162828026009228/fig-20251231.htm)).

**Search, integrations and AI** cut across all of the above: enterprise search over every connected app, integration platforms that move data between them, and AI assistants and agents that read and act across a tenant. Every vendor now sells an assistant; Microsoft's chief executive said Microsoft 365 Copilot "reached over 30 million paid seats" in the quarter ended June 30, 2026 ([Microsoft FY26 Q4 release](https://www.microsoft.com/en-us/investor/earnings/FY-2026-Q4/press-release-webcast)).

## Suites Against Best-of-Breed

The suite's argument is one contract, one identity, one admin console, one retention and eDiscovery system, one bill, and a per-seat price for the whole set that undercuts buying each piece. The independent's argument is a better product in the category its users care about most, faster development, and integrations into whichever suite the customer runs. Both arguments are true, and customers choose per category: a company can run Microsoft 365 for email, files and identity, Slack for chat, Zoom for meetings and Jira for engineering, and many do.

What decides the contest per category:

- **Who buys.** A category bought by IT for everyone (email, files, identity) goes to the suite; a category adopted by a team and then expanded (chat in 2015, design in 2020, issue tracking for engineers) gives the independent a head start that IT later has to claim ([The Life of a Customer](/books/workplace-and-collaboration/workplace-business#the-life-of-a-customer)).
- **What is already paid for.** A suite that includes chat sets the price of standalone chat at the cost of the extra seat; the Commission's case against Microsoft rested on that "distribution advantage" ([European Commission: Statement of Objections](https://ec.europa.eu/commission/presscorner/detail/en/ip_24_3446)).
- **Admin and compliance coverage.** A best-of-breed product has to match the suite's admin features (SSO, SCIM, audit logs, retention, legal hold, DLP, eDiscovery, residency) before a large customer can approve it; [From Self-Serve to Enterprise](/books/workplace-and-collaboration/selling-to-enterprises#the-enterprise-asks-are-the-roadmap) covers that list as a roadmap.
- **Network effects across companies.** Shared channels between companies (Slack Connect, Teams shared channels) and shared design files favor the product the other company already uses.

The suites report the scale of the base. Microsoft's Productivity and Business Processes segment earned $140.0 billion in fiscal 2026, with Microsoft 365 Commercial cloud revenue up 14% in the fourth quarter (16% adjusted for a prior-year recognition benefit) ([Microsoft FY26 Q4 release](https://www.microsoft.com/en-us/investor/earnings/FY-2026-Q4/press-release-webcast)). Alphabet doesn't break Workspace out: its 10-K says Google Cloud generates revenue "through our Google Cloud Platform and Google Workspace offerings," and the segment's $58.7 billion of 2025 revenue, up 36%, grew "primarily" from Google Cloud Platform ([Alphabet 10-K 2025](https://www.sec.gov/Archives/edgar/data/1652044/000165204426000018/goog-20251231.htm)). Salesforce reports Slack inside its "Agentforce 360 Platform, Slack and Other" subscription line, $8.88 billion in fiscal 2026, up 23% including $388 million from Informatica after November 2025 ([Salesforce 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1108524/000110852426000060/crm-20260131.htm)). None of the three discloses chat, meetings or docs revenue alone, so market shares by category in this volume come from customer counts and regulators' findings, not revenue.

## Market Size From the Filings

The public independents, from their latest annual reports as of October 2026:

| Company | Fiscal year | Revenue | Growth | Gross margin | Retention metric, as the filing names it |
| --- | --- | --- | --- | --- | --- |
| **Atlassian** | Ended June 30, 2026 | $6.57 billion | 26% | 85% | 57,334 customers with over $10,000 of Cloud ARR; no net retention rate disclosed |
| **Zoom** | Ended January 31, 2026 | $4.87 billion | 4.4% | 77.0% | Trailing 12-month net dollar expansion rate for Enterprise customers: 98% |
| **DocuSign** | Ended January 31, 2026 | $3.22 billion | 8% | 79% | 1,205 customers with over $300,000 of annualized contract value |
| **Dropbox** | Ended December 31, 2025 | $2.52 billion | -1.1% | 80% | 18.08 million paying users, $138.91 average revenue per paying user |
| **monday.com** | Ended December 31, 2025 | $1.23 billion | 27% | 89% | Net dollar retention rate: 110% overall, 116% for customers over $50,000 ARR |
| **Box** | Ended January 31, 2026 | $1.18 billion | 8% | 79.2% | Net retention rate: approximately 104%; remaining performance obligations of $1.71 billion, up 17% |
| **Figma** | Ended December 31, 2025 | $1.06 billion | 41% | 82% | Net dollar retention rate: 136% for customers over $10,000 ARR |
| **Asana** | Ended January 31, 2026 | $790.8 million | 9% | 89% | Dollar-based net retention rate: 96% |

Sources: [Atlassian](https://www.sec.gov/Archives/edgar/data/1650372/000165037226000036/team-20260630.htm), [Zoom](https://www.sec.gov/Archives/edgar/data/1585521/000158552126000030/zm-20260131.htm), [DocuSign](https://www.sec.gov/Archives/edgar/data/1261333/000126133326000021/docu-20260131.htm), [Dropbox](https://www.sec.gov/Archives/edgar/data/1467623/000146762326000008/dbx-20251231.htm), [monday.com](https://www.sec.gov/Archives/edgar/data/1845338/000117891326000870/zk2634436.htm), [Box](https://www.sec.gov/Archives/edgar/data/1372612/000119312526098466/box-20260131.htm), [Figma](https://www.sec.gov/Archives/edgar/data/1579878/000162828026009228/fig-20251231.htm), [Asana](https://www.sec.gov/Archives/edgar/data/1477720/000147772026000021/asan-20260131.htm).

The spread tells the landscape's story in one table. The fast growers (Atlassian, monday.com, Figma) sell into categories the suites haven't closed and expand inside customers above 100%; the mature ones (Zoom, Dropbox, Box, DocuSign) grow in single digits or shrink while generating cash, because a suite now ships a good-enough version of their category. Gross margins in the high 70s to high 80s are what software at this scale looks like; the exceptions move with infrastructure and AI costs (Figma's fell from 88% to 82% in 2025, Dropbox's from 83% to 80% with a data center refresh). Each retention metric is defined differently (by customer size threshold, trailing average or point in time), so they can't be compared directly; [Business Models & Unit Economics](/books/workplace-and-collaboration/business-models#retention-and-expansion) reads the definitions.

Some of the category's largest names aren't in the table because they aren't public: Notion, Canva, Miro, Airtable, ClickUp and Linear are private, and Smartsheet left the market in January 2025 (below). Their scale is known only from their own announcements, which this volume doesn't use as figures.

## A Dated Timeline

The deals and shutdowns that shaped the current market, with what each changed:

| Date | Event | What it changed |
| --- | --- | --- |
| July 22, 2020 | Slack files a competition complaint against Microsoft with the European Commission ([Slack](https://slack.com/blog/news/slack-files-eu-competition-complaint-against-microsoft)) | Started the Teams case ([Suites, Bundling & Antitrust](/books/workplace-and-collaboration/suites-bundling-and-antitrust#the-teams-case)) |
| July 21, 2021 | Salesforce completes its acquisition of Slack Technologies ([Salesforce](https://investor.salesforce.com/news/news-details/2021/Salesforce-Completes-Acquisition-of-Slack/default.aspx)) | The leading independent chat product joined a CRM suite; Slack's revenue now reports inside a Salesforce line |
| October 12, 2023 | Atlassian announces it will acquire Loom, with about 200,000 customers and almost 5 million videos a month ([Atlassian](https://www.atlassian.com/blog/announcements/atlassian-acquires-loom)); the deal closed on November 30, 2023 for about $885.6 million in cash ([Atlassian 10-K FY2024](https://www.sec.gov/Archives/edgar/data/1650372/000165037224000036/team-20240630.htm)) | Async video became part of Atlassian's cloud |
| December 18, 2023 | Adobe and Figma terminate the merger agreement they signed in September 2022, under which Figma's holders were to receive about $10 billion in cash and $10 billion in Adobe stock ([Adobe 8-K, September 2022](https://www.sec.gov/Archives/edgar/data/796343/000114036122033412/ny20005310x2_8k.htm)); Adobe pays the $1 billion termination fee and names the European Commission and the UK CMA ([Adobe 8-K, December 2023](https://www.sec.gov/Archives/edgar/data/796343/000079634323000254/adbe-20231217.htm), [Adobe](https://news.adobe.com/news/news-details/2023/Adobe-and-Figma-Mutually-Agree-to-Terminate-Merger-Agreement/default.aspx), [Figma](https://www.figma.com/blog/figma-adobe-abandon-proposed-merger/)) | Figma stayed independent and went public in 2025 ([Design Tools](/books/workplace-and-collaboration/design-tools#the-adobe-figma-deal-and-why-it-ended)) |
| April 1, 2024 | Microsoft introduces suites without Teams outside the EEA and Switzerland, stops selling its enterprise suites with Teams to net new subscribers worldwide, and offers a standalone Teams Enterprise ([Microsoft Licensing](https://www.microsoft.com/en-us/licensing/news/Microsoft365-Teams-WW)) | The suite began selling its chat product separately |
| January 22, 2025 | Smartsheet is taken private by an entity formed by Blackstone and Vista Equity Partners, with a subsidiary of the Abu Dhabi Investment Authority, at $56.50 a share in cash ([Smartsheet 8-K](https://www.sec.gov/Archives/edgar/data/1366561/000162828025002101/smar-20250122.htm)) | A public work-management vendor left the market |
| May 5, 2025 | Microsoft retires Skype; users move to Teams Free ([Microsoft Support](https://support.microsoft.com/en-us/skype/skype-is-retiring-in-may-2025-what-you-need-to-know-2a7d2501-427f-485e-8be0-2068a9f90472)) | One consumer calling product folded into the suite's free tier |
| July 31, 2025 | Figma's Class A stock begins trading on the NYSE; the IPO closed August 1 at $33.00 a share ([Figma 10-K 2025](https://www.sec.gov/Archives/edgar/data/1579878/000162828026009228/fig-20251231.htm)) | The design category got a public benchmark |
| September 4, 2025 | Atlassian announces it will acquire The Browser Company, maker of Arc and Dia, to build a browser for knowledge workers ([Atlassian](https://www.atlassian.com/blog/announcements/atlassian-acquires-the-browser-company)); the deal closed on October 20, 2025 for a total purchase price of $488.3 million ([Atlassian 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1650372/000165037226000036/team-20260630.htm)) | A collaboration vendor bought the surface where its products run |
| September 12, 2025 | The European Commission accepts Microsoft's Teams commitments ([European Commission](https://ec.europa.eu/commission/presscorner/detail/en/ip_25_2048)) | Binding unbundling terms for seven years, and interoperability and data portability terms for ten |
| March 2026 | Atlassian stops selling Data Center products to new customers, ahead of ending sales to existing customers in March 2028 and support in March 2029 ([Atlassian 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1650372/000165037226000036/team-20260630.htm)) | Self-managed Atlassian is ending; [Migrations, Imports & Switching](/books/workplace-and-collaboration/migrations-and-switching) covers the move |
| May 2026 | Workplace from Meta closes ([Meta](https://www.meta.com/workplace/)) | A full workplace suite from a consumer company shut down |

Two more shutdowns belong in the same list. Google moved Currents (the Workspace successor to Google+) into spaces in Google Chat: Currents communities embedded in Google Sites stopped working on July 5, 2023, and Google began deleting the remaining Currents data on August 8, 2023 ([Google Chat Help: Currents shutdown](https://support.google.com/chat/answer/14310347?hl=en)). Salesforce is retiring Quip, its docs product: paid subscriptions can't be renewed after March 1, 2027, and free users lose access on March 31, 2027 ([Salesforce Help: Quip retirement](https://help.salesforce.com/s/articleView?id=005299603&type=1)), with Slack canvases as the conversion path ([Docs & Wikis](/books/workplace-and-collaboration/docs-and-wikis#structured-documents-confluence-google-docs-and-loop)).

The pattern in the timeline is consolidation from both ends. Independents are bought by larger platforms that want a category (Slack by Salesforce, Loom by Atlassian) or taken private when public markets value them below what a buyer will pay (Smartsheet); regulators have blocked the largest combination in the category (Adobe and Figma) and forced the largest suite to unbundle; and products inside large companies end when the parent consolidates (Skype into Teams, Workplace from Meta, Currents and Quip). For a customer each of those is a migration with a deadline: Microsoft gave Skype users an export portal and a schedule for deleting data ([Microsoft Support](https://support.microsoft.com/en-us/skype/skype-is-retiring-in-may-2025-what-you-need-to-know-2a7d2501-427f-485e-8be0-2068a9f90472)), and the EU Data Act now sets minimum switching terms for data processing services ([The EU Data Act](/books/hosting-and-cloud/egress-and-switching#the-eu-data-act)).

## Open Source and Self-Hosted

Self-hosted collaboration is a minority of seats and a majority of the conversation in government and defense. Its customers want what the cloud vendors can't promise: servers they operate, networks with no internet connection, and no foreign vendor in the data path.

- **Mattermost** sells chat and workflow up to an Enterprise Advanced tier with air-gapped and disconnected operation and classified-information controls, offers a FIPS 140-3 validated image for FedRAMP and a STIG-hardened, DISA-approved image for defense, deploys on-premises, on AWS or Azure, or as a single-tenant cloud it hosts, and licenses Professional and Enterprise as prepaid annual subscriptions per seat, with prices by quote ([Mattermost: pricing](https://mattermost.com/pricing/)).
- **Element** builds on the Matrix open standard, sells self-hosted Enterprise per seat and an air-gapped Sovereign plan per deployment, and offers a free AGPL Community edition; Matrix lets organizations on different servers and clients talk to each other with "no vendor lock-in" ([Element: pricing](https://element.io/pricing)).
- **Zulip** is fully open source: self-hosting is free with all features, with paid plans for support, mobile push beyond 10 users and enterprise identity features (SAML, SCIM), and a hosted cloud from $6.67 a user a month billed annually ([Zulip: plans](https://zulip.com/plans/)).
- **Nextcloud** covers files, groupware and office editing for organizations that run their own servers, and **Rocket.Chat**, **Jitsi** and **Penpot** fill chat, meetings and design.

The trade-off is the one the Hosting & Cloud volume describes for any self-hosted service ([Self-Hosted Apps](/books/hosting-and-cloud/self-hosted-apps)): the customer takes on patching, backups, scaling, monitoring and incident response, and the features that depend on a vendor's shared service (mobile push relays, AI, global search across organizations) have to be run locally or done without. Federation is the self-hosted world's answer to Slack Connect: Matrix servers exchange messages between organizations without either one hosting the other. [Data Residency & Sovereignty](/books/workplace-and-collaboration/data-residency-and-sovereignty) covers the cloud vendors' answers to the same demand.

## How to Build It

The landscape adds three things to [the core data model](/books/workplace-and-collaboration/workplace-business#the-core-data-model): the vendor's own product catalog (a suite has many products under one tenant), which products each workspace has turned on, and a record of every product retirement and what it promised customers.

```sql
CREATE TABLE products (                  -- what the vendor ships under one tenant
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  code          TEXT NOT NULL UNIQUE,     -- 'chat', 'meetings', 'docs', 'files', 'tracker'
  name          TEXT NOT NULL,
  category      TEXT NOT NULL CHECK (category IN ('chat', 'meetings', 'phone', 'email',
                  'calendar', 'docs', 'files', 'work_management', 'service_management',
                  'design', 'whiteboard', 'esignature', 'search', 'ai')),
  status        TEXT NOT NULL CHECK (status IN ('preview', 'generally_available',
                  'end_of_sale', 'end_of_life')),
  launched_at   DATE
);

CREATE TABLE workspace_products (        -- which products a workspace has turned on
  workspace_id  UUID NOT NULL REFERENCES workspaces (id),
  product_id    UUID NOT NULL REFERENCES products (id),
  enabled_by    UUID REFERENCES members (id),  -- null: enabled by the plan at creation
  enabled_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  disabled_at   TIMESTAMPTZ,
  PRIMARY KEY (workspace_id, product_id, enabled_at)
);

CREATE TABLE product_retirements (       -- every end of sale or end of life, and what it promised
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  product_id         UUID NOT NULL REFERENCES products (id),
  announced_at       DATE NOT NULL,
  end_of_sale_new    DATE,                -- no new customers
  end_of_sale_all    DATE,                -- no renewals or expansions
  read_only_from     DATE,
  end_of_life        DATE NOT NULL,       -- service stops
  data_deleted_from  DATE,                -- deletion begins
  successor_id       UUID REFERENCES products (id),  -- where customers are pointed
  export_formats     TEXT[] NOT NULL,     -- what an admin can take out
  notice_ref         TEXT NOT NULL,       -- the public notice, as published
  CHECK (end_of_sale_new IS NULL OR end_of_sale_new <= end_of_life),
  CHECK (data_deleted_from IS NULL OR data_deleted_from >= end_of_life)
);
```

Design notes:

- **A product is not a plan.** Plans bundle products ([Suites, Bundling & Antitrust](/books/workplace-and-collaboration/suites-bundling-and-antitrust#how-to-build-it) adds `plan_products`); a workspace can be entitled to a product by its plan and still have it switched off by an admin. Entitlement comes from the plan, enablement from `workspace_products`, and the product gate checks both.
- **Retirements are dated promises.** Atlassian's Data Center end-of-life has three dates (no new customers, no expansions, no support); Skype's had a retirement date, a deletion start and an export deadline. Each date is a column, each drives notices to the affected organizations, and the notice text is kept as published, because a customer will hold the vendor to it.
- **Successors carry migrations.** `successor_id` is where the migration assistant, the in-product banner and the export defaults point; [Migrations, Imports & Switching](/books/workplace-and-collaboration/migrations-and-switching#how-to-build-it) builds the import side.
- **Third-party products are connected systems, not products.** A customer's Jira connected to a Microsoft tenant is an app installation in the core model, not a row here. This table is the vendor's own catalog.

## What This Means for the System You Build

- **Assume your customer runs a suite,** and integrate with its identity, calendar, files and audit before you build your own versions of them.
- **Match the suite's admin coverage** in your category before you sell to large customers: SSO, SCIM, audit logs, retention, hold, export.
- **Model products separately from plans,** so a suite can bundle, unbundle and let admins switch products off.
- **Read the competitors' filings with their definitions;** retention metrics differ by threshold and averaging and aren't comparable as printed.
- **Treat every retirement as a dated contract** with notice, read-only, deletion and export dates, and keep the public notice as published.
- **Plan for self-hosted customers** as a different product with different operations, or decide explicitly that you won't serve them.

## References

**Filings**

- [Atlassian: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1650372/000165037226000036/team-20260630.htm), revenue, gross margin, Cloud ARR customers, product concentration, Data Center end-of-life dates and The Browser Company closing and purchase price
- [Zoom Communications: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1585521/000158552126000030/zm-20260131.htm), revenue, gross margin, Enterprise and Online split and net dollar expansion rate
- [DocuSign: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1261333/000126133326000021/docu-20260131.htm), revenue, gross margin, customers and customers over $300,000
- [Dropbox: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1467623/000146762326000008/dbx-20251231.htm), revenue, gross margin, paying users and ARPU
- [monday.com: Form 20-F for 2025](https://www.sec.gov/Archives/edgar/data/1845338/000117891326000870/zk2634436.htm), revenue, gross margin and net dollar retention rates
- [Box: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1372612/000119312526098466/box-20260131.htm), revenue, gross margin, paying organizations, net retention rate and RPO
- [Figma: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1579878/000162828026009228/fig-20251231.htm), revenue, gross margin, net dollar retention rate and IPO dates and price
- [Asana: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1477720/000147772026000021/asan-20260131.htm), revenue, gross margin and dollar-based net retention rate
- [Microsoft: FY26 fourth quarter earnings release](https://www.microsoft.com/en-us/investor/earnings/FY-2026-Q4/press-release-webcast), Productivity and Business Processes revenue, Microsoft 365 Commercial cloud growth and Copilot paid seats
- [Alphabet: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1652044/000165204426000018/goog-20251231.htm), Google Cloud revenue, its Workspace and Cloud Platform sources, and growth drivers
- [Salesforce: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1108524/000110852426000060/crm-20260131.htm), the Agentforce 360 Platform, Slack and Other line and the Informatica contribution
- [Atlassian: Form 10-K for fiscal 2024](https://www.sec.gov/Archives/edgar/data/1650372/000165037224000036/team-20240630.htm), the Loom closing date and purchase price
- [Adobe: Form 8-K, September 15, 2022](https://www.sec.gov/Archives/edgar/data/796343/000114036122033412/ny20005310x2_8k.htm), the Figma merger consideration and the $1 billion reverse termination fee
- [Adobe: Form 8-K, December 18, 2023](https://www.sec.gov/Archives/edgar/data/796343/000079634323000254/adbe-20231217.htm), the termination agreement and the $1 billion payment
- [Smartsheet: Form 8-K, January 22, 2025](https://www.sec.gov/Archives/edgar/data/1366561/000162828025002101/smar-20250122.htm), completion of the merger, the acquirers and the price per share

**Company announcements**

- [Slack: Slack files EU competition complaint against Microsoft](https://slack.com/blog/news/slack-files-eu-competition-complaint-against-microsoft), the July 22, 2020 complaint
- [Salesforce: Salesforce completes acquisition of Slack](https://investor.salesforce.com/news/news-details/2021/Salesforce-Completes-Acquisition-of-Slack/default.aspx), the July 21, 2021 completion
- [Atlassian: Atlassian acquires Loom](https://www.atlassian.com/blog/announcements/atlassian-acquires-loom), the announcement date and Loom's customers and videos
- [Atlassian: Atlassian acquires The Browser Company](https://www.atlassian.com/blog/announcements/atlassian-acquires-the-browser-company), the announcement date, Arc and Dia
- [Adobe: Adobe and Figma mutually agree to terminate merger agreement](https://news.adobe.com/news/news-details/2023/Adobe-and-Figma-Mutually-Agree-to-Terminate-Merger-Agreement/default.aspx), the termination and the regulators named
- [Figma: Figma and Adobe abandon proposed merger](https://www.figma.com/blog/figma-adobe-abandon-proposed-merger/), the date and the fifteen months of review
- [Microsoft Support: Skype is retiring in May 2025](https://support.microsoft.com/en-us/skype/skype-is-retiring-in-may-2025-what-you-need-to-know-2a7d2501-427f-485e-8be0-2068a9f90472), the retirement date, Teams Free, the export portal and deletion schedule
- [Meta: Workplace](https://www.meta.com/workplace/), Workplace closed as of May 2026
- [Microsoft Licensing: Microsoft 365 and Office 365 suites without Teams (April 1, 2024)](https://www.microsoft.com/en-us/licensing/news/Microsoft365-Teams-WW), suites without Teams outside the EEA and Switzerland and standalone Teams Enterprise
- [Google Chat Help: Final update on the Google Currents shutdown](https://support.google.com/chat/answer/14310347?hl=en), the July 5, 2023 Sites cutoff and the August 8, 2023 start of data deletion
- [Salesforce Help: Quip retirement](https://help.salesforce.com/s/articleView?id=005299603&type=1), the end of renewals on March 1, 2027 and the end of free access on March 31, 2027

**Regulators**

- [European Commission: Statement of Objections to Microsoft over Teams (IP/24/3446)](https://ec.europa.eu/commission/presscorner/detail/en/ip_24_3446), the description of Teams and the distribution advantage
- [European Commission: Commission accepts commitments offered by Microsoft (IP/25/2048)](https://ec.europa.eu/commission/presscorner/detail/en/ip_25_2048), the September 12, 2025 decision and the commitments' seven- and ten-year terms

**Open source and self-hosted**

- [Mattermost: Pricing](https://mattermost.com/pricing/), tiers, deployment options, FIPS and STIG images and per-seat annual licensing
- [Element: Pricing](https://element.io/pricing), Community, Enterprise and Sovereign plans on Matrix
- [Zulip: Plans](https://zulip.com/plans/), free self-hosting, cloud prices and enterprise identity features
