+++
title = "The Workplace Software Business"
nav_title = "The Workplace Business"
description = "How workplace software works: the parties, the inverted duties, how the money works, the life of a customer, and the core data model every chapter extends."
category = "Workplace & Collaboration Industry"
order = 2001
part = "The Business"
tags = ["workplace", "collaboration", "business-models", "data-model", "saas"]
+++

Workplace software is where an employer's people talk, meet, write, file, track and decide. A product team argues in a Slack channel, joins a Zoom call, writes the decision on a Confluence page, files the follow-up in Jira, and the legal department later searches all four for a lawsuit. A law firm keeps every email, draft and invoice against a client matter. A hospital network gives its nurses a shared phone with a walkie-talkie button and a shift roster. Underneath, the same few records repeat: an organization that pays, workspaces it runs, people with accounts and roles, places where content lives, the content itself, who may see it, and what the organization has said must be kept or destroyed.

The architecture is consumer chat and content: messages fanned out over persistent connections, documents edited by several people at once, files synced to every device, search over all of it. The duties are not. On a community platform the platform sets the rules, moderates, keeps evidence and answers subpoenas; in workplace software the customer organization does, through its administrators, and the vendor's job narrows to running the service and following the customer's instructions ([Workplace Chat Inverts the Duties](/books/user-generated-platforms/real-time-chat#workplace-chat-inverts-the-duties)). That inversion is why the product has an admin console as large as the product itself, why a sale is to a buyer who is rarely the user, and why every feature ships with a policy that someone other than the user controls. This chapter is the map the rest of the volume uses: how to read it, the parties, the inversion, how the money works, the life of a customer, and the data model every later chapter extends. Terms are collected in the volume's Glossary.

## How to Read This Volume

The volume follows a customer from its first free workspace to the platform that runs it, in eleven parts plus a reference:

- **The Business.** This chapter; [The Collaboration Landscape](/books/workplace-and-collaboration/workplace-landscape) (the categories, suites against best-of-breed, market sizes from the filings, and a dated timeline of acquisitions and shutdowns); [Business Models & Unit Economics](/books/workplace-and-collaboration/business-models) (per-seat SaaS, freemium and product-led growth, land and expand, usage and AI credits, and the metrics from the filings); [Plans, Pricing & Seats](/books/workplace-and-collaboration/plans-pricing-and-seats) (tier ladders, the SSO tax, what a seat is, terms, discount programs and AI pricing); and [Suites, Bundling & Antitrust](/books/workplace-and-collaboration/suites-bundling-and-antitrust) (why suites win, the Teams case, Google's bundling and licensing on clouds).
- **Tenancy and Identity.** Tenants, Workspaces & Organizations (workspace against organization, multi-geo tenants, joining by domain, splitting and merging tenants); SSO, Domains & Managed Accounts (domain verification, managed against personal accounts, enforced SAML and OIDC, sessions); Provisioning, SCIM & Offboarding (SCIM 2.0, directory sync, joiner-mover-leaver, ownership transfer); Guests & Cross-Org Collaboration (guest models, Slack Connect, shared channels, who owns shared content); Permissions & Sharing (role ladders, inheritance, link sharing, relationship-based access); Admin Consoles & Policies (admin roles, policy engines, admin APIs); and Data Residency & Sovereignty (what residency covers, the EU Data Boundary, sovereign clouds, transfers).
- **Chat and Messaging.** Channels, Threads & Direct Messages (the conversation models, canvases and lists, edit and delete rules, archiving); Chat at Scale (public architecture write-ups, delivery, ordering and unread state); Notifications, Presence & Attention (mentions, schedules, presence, digests and right-to-disconnect laws); Email & Calendar (Exchange and Gmail, iCalendar, CalDAV, invites and resource booking); and Frontline & Deskless Workers (shared devices, shifts, walkie-talkie, and wage-hour risk).
- **Meetings and Voice.** Meetings & Video (WebRTC, SFUs, codecs, end-to-end encryption, webinars and meeting security); Recordings, Transcripts & AI Notes (recording, transcription, notetaker bots and recording-consent law); Async Video & Screen Recording; Business Phone & Contact Center (UCaaS, direct routing, porting, E911, CCaaS); and Rooms, Devices & the Hybrid Office (room systems, desk booking, visitors and occupancy data).
- **Docs, Wikis and Files.** Docs & Wikis (page and block models, page trees, templates, publishing); Real-Time Co-Editing (OT, CRDTs, server authority, offline); Files, Sync & Storage (sync engines, versions, ransomware recovery, quotas); Intranets & Knowledge Bases; No-Code Databases & Internal Tools; and E-Signatures & Agreements (ESIGN, UETA, eIDAS, audit trails and online notarization).
- **Work Management.** Work Items, Hierarchies & Fields; Workflows & Status Machines; Queries, Views & Dashboards; Boards, Sprints & Cycles; Portfolios, Roadmaps & Goals; Automation Rules; IT & Service Management (ITIL, catalogs, SLAs and the CMDB); and Development Collaboration (code hosting, review and linking work to commits).
- **Design and Visual Collaboration.** Design Tools; Whiteboards & Diagrams; and Design Systems & Handoff.
- **Search, Integrations and AI.** Enterprise Search (permission-trimmed search and connectors); Apps & Marketplaces (app review, admin approval, revenue share); APIs, Events & Rate Limits; Integration Platforms & Workflow Builders; AI Assistants Over Company Data (permission-aware retrieval, oversharing, data-use commitments); and AI Agents, Connectors & MCP (agent identity, consent and audit).
- **Security and Compliance.** Audit Logs; Retention & Legal Hold; eDiscovery & Export; DLP & Information Protection; Encryption & Customer-Managed Keys; Certifications & Procurement Assurance; Regulated Communications & Archiving (SEC and FINRA recordkeeping, the off-channel sweep, supervision); Employee Monitoring & Privacy; and Threats & Incidents.
- **Law Firms and Professional Services.** Law Firms & Professional Services (the matter-centric model and the rules that shape software); Matters, Intake & Conflicts; Trust Accounting & IOLTA; Time, Billing & E-Billing (LEDES and UTBMS); and Legal Documents, DMS & AI.
- **Running the Platform.** Building It Yourself (services, sharding and the permission service); Desktop & Mobile Clients; Reliability, Outages & SLAs; Billing, Seats & Resellers; From Self-Serve to Enterprise; Migrations, Imports & Switching; Accessibility & Localization; and Workplace Metrics.
- **Reference.** A Glossary of every term the volume defines, grouped by part.

The volume covers what workplace software adds. The general engineering lives in the playbook, and chapters link to it rather than repeat it: [Multi-Tenancy](/docs/architecture/multi-tenancy), [SSO & Federation](/docs/security/sso-and-federation), [Identity Providers](/docs/security/identity-providers), [Authorization](/docs/security/authorization), [Audit Trails](/docs/architecture/audit-trails), [Data Retention](/docs/architecture/data-retention), [Custom Fields](/docs/architecture/custom-fields), [Realtime Connections](/docs/architecture/realtime-connections), [Offline Sync](/docs/architecture/offline-sync), [Webhooks](/docs/api-design/webhooks), [Subscriptions](/docs/payments/subscriptions), [SOC 2](/docs/compliance/soc-2) and [GDPR](/docs/compliance/gdpr). Other volumes own topics this one leans on: [User-Generated Platforms](/books/user-generated-platforms/real-time-chat) for consumer chat, media pipelines, trust and safety and law enforcement requests; [Hosting & Cloud](/books/hosting-and-cloud/metering-and-rating) for metering, billing, email sending, texting registration, outages and sovereign infrastructure; [Property Tech](/books/property-tech/trust-accounting) for trust accounting; [Payments](/books/payments/card-payments) for the card charge; and [Commerce](/books/commerce/auto-renewal-law) for auto-renewal law.

The volume is US-centric, with the EU and UK where their rules bind (GDPR, works councils, the EU Data Act, the Commission's Teams decision, the European Accessibility Act). No single company is the model: the vocabulary and tables are the industry's, benchmarked across the suites (Microsoft 365, Google Workspace, Zoho Workplace), Atlassian, Salesforce's Slack, Zoom, Notion, Figma, Asana, monday.com, Dropbox, Box and the open-source and self-hosted products, and a company's product name appears only where the chapter is describing that company.

## Who's Who

| Party | Who they are | What they need from the system |
| --- | --- | --- |
| **Vendor** | The company that builds and runs the service: Microsoft, Google, Atlassian, Salesforce for Slack, Zoom, Notion, Figma, Asana, Box | Seats that renew and expand, tenants that stay isolated, and a contract that limits what it owes for the customer's content |
| **Customer organization** | The employer, firm, school, agency or nonprofit that signs the contract and pays | Its people working, its data under its control, its policies enforced, and a way out with its data |
| **Admins** | The customer's own staff with administrative roles: org owners, workspace admins, billing admins, compliance and legal-hold admins, help desk | A console to provision people, set policy, investigate, hold, export and see the bill |
| **Members** | The customer's employees and contractors with full accounts | To get their work done without thinking about any of the above |
| **Guests** | People outside the organization invited into specific places: a client in one channel, an agency on one project | Access to exactly what they were invited to, under the host's rules |
| **External organizations** | Another customer on the same service, connected for shared channels, shared drives or federation | A trust relationship that each side's admins can approve and revoke |
| **Resellers and cloud solution providers** | Partners who sell, bill and often administer seats on the vendor's behalf: Microsoft's Cloud Solution Provider partners, Atlassian Solution Partners, cloud marketplaces | Their own price lists, the right to manage a customer's subscriptions, and margin |
| **App developers** | Companies and the customer's own engineers who build integrations, bots and marketplace apps | Stable APIs, events, a review process that clears, and scopes the admin will approve |
| **Auditors and assessors** | SOC 2 and ISO auditors, FedRAMP assessors, the customer's security reviewers | Evidence of controls, from both the vendor and the customer's own configuration |
| **Courts, regulators and requesters** | Opposing counsel, government agencies, regulators like the SEC and FINRA, data subjects | Records preserved and produced on time, from whoever controls them |

Two of these split in ways the data model has to carry. **Buyer versus user.** The person who chose Slack may be one engineer; the person who signs the renewal is a procurement lead; the person who decides what can be shared outside is a security admin; the people using it are everyone else. Each has a different screen. **Who acts for the customer.** Admin power is not one role but a ladder: Slack separates Org Owners, Workspace Owners and a Legal Holds Admin system role ([Slack: legal holds](https://slack.com/help/articles/4401830811795-Create-and-manage-legal-holds)), Microsoft and Google ship dozens of scoped admin roles, and a reseller may administer a tenant it doesn't own. Admin Consoles & Policies covers the ladders.

The channel matters to the money. Atlassian, the vendor most associated with selling without salespeople, says in its fiscal 2026 annual report that over half its revenue came "from the sales efforts of our channel partners" ([Atlassian 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1650372/000165037226000036/team-20260630.htm)); Microsoft sells license-based services through Cloud Solution Provider partners under the Microsoft Customer Agreement ([Microsoft Learn: new commerce](https://learn.microsoft.com/en-us/partner-center/customers/new-commerce-license-based)). A seat sold through a partner is still the vendor's seat and the customer's data, with a third party holding the billing relationship ([Resellers and White Label](/books/hosting-and-cloud/accounts-and-resellers#resellers-and-white-label) covers the shape).

## The Inversion

The customer organization is the controller of its content; the vendor processes it on the customer's instructions. Google's Cloud Data Processing Addendum, which covers Workspace, puts it in one line: "Google is a processor and Customer is a controller or processor, as applicable, of Customer Personal Data," and the customer's instructions include its "use of the Services (including via the Admin Console)" ([Google Cloud: Data Processing Addendum](https://cloud.google.com/terms/data-processing-addendum)). Under GDPR that split decides who answers a data subject, who must have a lawful basis, and who signs what ([Controllers, Processors and the DPA](/docs/compliance/gdpr#controllers-processors-and-the-dpa)). In practice it decides who holds each lever:

| Decision | Consumer chat or content platform | Workplace software |
| --- | --- | --- |
| **Who can join** | Anyone who signs up, subject to the platform's rules | Whoever the customer provisions, invites or lets in by verified domain |
| **What the rules are** | The platform's terms and community guidelines | The customer's policies (acceptable use, external sharing, allowed apps), set in the admin console, inside the vendor's acceptable-use terms |
| **Who moderates** | The platform's trust and safety team and volunteer moderators | The customer's admins and HR; the vendor acts only against the customer as a whole |
| **How long things are kept** | The platform's retention schedule | The customer's retention policies, per workspace or container, and its legal holds |
| **Who answers a subpoena** | The platform, directly | The customer; Slack's policy says "Third parties seeking Customer Data should contact the Customer," requires a search warrant for content, and notifies the customer before disclosure unless prohibited ([Slack: user data request policy](https://api.slack.com/user-data-request-policy)) |
| **Who searches for evidence** | The platform's investigators | The customer's own eDiscovery admins, with the vendor's tools |
| **Who can read a private message** | The platform, for safety work, under its policy | The customer, through exports and eDiscovery, under its plan and local law |
| **Who leaves, and with what** | A user deletes an account | The customer terminates and exports; departing members' content stays with the employer |

The vendor still has duties the customer can't take over: running the service, securing it, isolating tenants, answering for its own subprocessors, and acting on abuse that harms other customers or the public. Slack's data request policy states the line plainly: "The Customer controls the Customer Data and generally gets to decide what to do with all Customer Data." The design consequence runs through every chapter. A feature isn't done when it works for the user; it is done when an admin can turn it on and off, scope it, see who used it, keep or delete what it produced, and export it.

## How the Money Works

Workplace software is mostly sold per seat, per month, on a contract with a term. Around that core sit four other kinds of money, and most vendors use several:

| Kind | What is charged | Examples, as of October 2026 |
| --- | --- | --- |
| **Seats on a tier** | A price per user per month on a plan, with annual terms cheaper than monthly | Slack Pro at $7.25 a user a month billed annually or $8.75 monthly, Business+ at $15 or $18 ([Slack: pricing](https://slack.com/pricing)); Zoom Pro at $14.16 annually or $16.99 monthly ([Zoom: pricing](https://zoom.us/pricing)) |
| **Seat types** | Different prices for different kinds of user on the same plan | Figma's Full, Dev and Collab seats at $16, $12 and $3 a month on Professional, with free view access ([Figma: pricing](https://www.figma.com/pricing/)) |
| **Add-ons** | A separately priced capability on top of a plan | Microsoft 365 Copilot at $30 a user a month paid yearly ([Microsoft 365 Enterprise plans](https://www.microsoft.com/en-us/microsoft-365/enterprise/microsoft365-plans-and-pricing)); Slack's Enterprise Key Management as an Enterprise+ add-on ([Slack: pricing](https://slack.com/pricing)) |
| **Usage and credits** | A pool of units consumed by use, often AI | Rovo credits included per user per month on Jira's paid plans ([Jira pricing](https://www.atlassian.com/software/jira/pricing)); Figma's monthly AI credits per seat ([Figma: pricing](https://www.figma.com/pricing/)) |
| **Marketplace and partner revenue** | A share of third-party app sales, and the channel's margin | Atlassian's "Marketplace and other" revenue of $330.7 million in fiscal 2026 ([Atlassian 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1650372/000165037226000036/team-20260630.htm)) |

What a seat is differs by vendor, and the definition is where billing disputes start: Slack bills members who have been active in the last 28 days under its fair billing policy and credits the rest ([Slack: fair billing](https://slack.com/help/articles/218915077-Slacks-fair-billing-policy)); Atlassian counts a user as billable "once product access is granted," including invited users who haven't accepted ([Atlassian: cloud licensing](https://www.atlassian.com/licensing/cloud)); Microsoft lets a partner reduce licenses only within seven days of adding them ([Microsoft Learn: create subscriptions](https://learn.microsoft.com/en-us/partner-center/customers/create-a-new-subscription)). [Plans, Pricing & Seats](/books/workplace-and-collaboration/plans-pricing-and-seats) covers the definitions, [Business Models & Unit Economics](/books/workplace-and-collaboration/business-models) what they do to revenue, and Billing, Seats & Resellers the engine; the rating mechanics are the Hosting & Cloud volume's [Rating: From Events to Money](/books/hosting-and-cloud/metering-and-rating#rating-from-events-to-money).

The scale is in the filings. Microsoft's Productivity and Business Processes segment, where it reports Microsoft 365 Commercial cloud among other businesses, earned $140.0 billion in the fiscal year ended June 30, 2026 ([Microsoft FY26 Q4 release](https://www.microsoft.com/en-us/investor/earnings/FY-2026-Q4/press-release-webcast)); Atlassian earned $6.57 billion, up 26% ([Atlassian 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1650372/000165037226000036/team-20260630.htm)); Zoom $4.87 billion, up 4.4% ([Zoom 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1585521/000158552126000030/zm-20260131.htm)). [The Collaboration Landscape](/books/workplace-and-collaboration/workplace-landscape) lays out the rest.

My rule for the money: a subscription is a contract with a term, a quantity per seat type, a price per unit that was true when signed, and a history of every change. Store all four, and compute the invoice, the ARR and the seat count from them. A seat count stored as one number on the organization can't answer a true-up, a credit or a dispute.

## The Life of a Customer

The same few records move through every account; what changes is who creates them.

**One person signs up.** An engineer creates an account with a work email and starts a free workspace to try the product with three teammates. The account is personal, the workspace is unpaid, and nobody at the employer knows it exists. The free plan is designed to be outgrown: Slack's free plan keeps 90 days of message history ([Slack: pricing](https://slack.com/pricing)); Jira's is "Free forever for 10 users" and a site that stays over the limit is upgraded to Standard after seven days ([Jira pricing](https://www.atlassian.com/software/jira/pricing), [Atlassian: cloud licensing](https://www.atlassian.com/licensing/cloud)).

**The team pays.** Someone puts a card on file for a Pro or Standard plan, monthly. The workspace now has a subscription, a seat count, and an owner who is still just a user. New colleagues join by invitation or because their email domain matches; Slack's prospectus described usage inside organizations as "typically initially driven bottoms-up, by end users" ([Slack S-1](https://www.sec.gov/Archives/edgar/data/1764925/000162828019004786/slacks-1.htm)).

**More teams arrive.** Other departments start their own workspaces on the same domain, on their own cards. The employer now has several tenants, several bills, and content scattered across them. The vendor sees the domain repeat and its sales team calls; Business Models & Unit Economics and From Self-Serve to Enterprise cover that motion.

**IT claims it.** The company verifies its domain (a DNS TXT record or a file on its web server) and claims the accounts on it, which become managed accounts that the admin can edit, deactivate, and put under SAML single sign-on and two-step verification ([Atlassian: verify a domain](https://support.atlassian.com/user-management/docs/verify-a-domain-to-manage-accounts/)). Personal accounts that collide with the domain have to be brought in: Google's transfer tool sends invitations a user "cannot decline," and if one is ignored the admin can create a managed account with the same address, after which the user's personal account must be renamed ([Google Workspace Admin Help: transfer tool](https://knowledge.workspace.google.com/admin/users/use-the-transfer-tool-to-migrate-unmanaged-users)). The scattered workspaces are consolidated under one organization. SSO, Domains & Managed Accounts and Tenants, Workspaces & Organizations cover the mechanics.

**The enterprise contract.** Procurement signs an annual or multi-year order form for an Enterprise plan: a negotiated price per seat, a committed quantity, a data processing addendum, a security review, SSO and SCIM provisioning from the identity provider, audit logs streamed to the SIEM, retention policies, legal holds, maybe customer-managed keys and data residency. People now arrive and leave through the HR system and the directory, not invitations.

**Steady state.** Seats grow and shrink with headcount; the vendor's fair billing or true-up rules decide when the bill follows. Admins add apps, approve guests and external connections, answer an eDiscovery request, place a hold. The renewal is a negotiation over price, seats and the next add-on.

**Leaving.** The customer moves to a competitor or a suite it already pays for, exports its data, and terminates. What it can take out, in which format, and how quickly the vendor deletes the rest are the subject of Migrations, Imports & Switching, and since September 12, 2025 the EU Data Act sets rules for it ([The EU Data Act](/books/hosting-and-cloud/egress-and-switching#the-eu-data-act)).

Across the whole life, the person and the organization are different records, and the moment the organization claims the person is a state change, not a new account. That split, and the one between an organization and its workspaces, are what the data model is built on.

## The Core Data Model

Every vendor in this volume converges on the same concepts under different names. A Slack organization on Enterprise Grid, an Atlassian organization, a Microsoft 365 tenant's billing account and a Google Workspace customer are all organizations; a Slack workspace, an Atlassian site, a Notion workspace and a Figma team are all workspaces; a Slack channel, a Confluence space, a Jira project, a Google shared drive and a Figma project are all containers; a message, a page, a file, an issue and a design are all items. The volume uses one set of names, and every later chapter's "How to Build It" extends it rather than redefining it:

| Entity | Table | What it is |
| --- | --- | --- |
| **organization** | `organizations` | The customer: the billing entity, with its verified domains and its contract |
| **workspace** | `workspaces` | A tenant unit inside an organization, with its region and residency |
| **domain** | `domains` | An email domain an organization has proven it owns |
| **account** | `accounts` | A person's identity, managed by an organization or personal |
| **member** | `members` | An account inside one workspace, with its kind (full, guest, external, bot, service), role and status |
| **group** | `groups`, `group_members` | A team or directory group, local or synced |
| **container** | `containers` | A place content lives: channel, space, project, board, folder, canvas, meeting series |
| **item** | `items` | One piece of content: a message, page, file, work item, comment, design, recording |
| **item version** | `item_versions` | An edit, a page version, a file revision |
| **grant** | `grants`, `share_links` | Who may do what to which resource, and links that grant it to whoever holds them |
| **plan and subscription** | `plans`, `subscriptions`, `seat_assignments` | What is for sale, what the organization bought, and who holds each seat |
| **app** | `apps`, `app_installations`, `api_tokens` | Integrations, where they are installed, and the tokens and OAuth grants they act with |
| **audit event** | `audit_events` | Who did what to which resource, from where |
| **retention and hold** | `retention_policies`, `legal_holds`, `hold_custodians` | What the organization keeps or deletes, and what it must preserve for a matter |

Six splits matter in every chapter:

- **Organization versus workspace.** The organization pays, owns the domains and sets org-wide policy; a workspace is where people work and where region, residency and most settings live. A small customer has one of each; an enterprise has one organization and dozens of workspaces, and after an acquisition it may have two organizations to merge.
- **Account versus member.** The account is the person, with one email and one login; a member is that account inside a workspace, with a role and a status. One account can be a full member of its employer's workspace and a guest in a client's. Deactivating a member removes access to one workspace; disabling a managed account removes it everywhere the organization controls.
- **Managed versus personal.** An account whose email is on a verified domain can be claimed by the organization, after which its admins control its authentication and lifecycle. Until then it belongs to the person. The `managed_by_organization_id` column is the switch, and flipping it is an audited event.
- **Container versus item.** Containers carry visibility, membership and policy (retention, external sharing, classification); items inherit them. A message moved to another channel changes its policy. Kind-specific tables (`channels`, `spaces`, `projects`, `messages`, `pages`, `files`, `work_items`) extend the two shared tables with the same primary key, so search, retention, holds, audit and permissions work across every product without a union of ten tables.
- **Grant versus membership.** Membership in a container is the common way to get access; a grant is the general one, from a member, group, whole workspace or link, to any resource. Chapters that need relationship-based access compile both into the same check ([Choosing a Model](/docs/security/authorization#choosing-a-model)).
- **Retention versus hold.** A retention policy deletes on schedule; a legal hold suspends deletion for named custodians or containers for as long as a matter lasts. Holds always win, and both are the customer's decisions.

The spine, in the playbook's [naming conventions](/docs/database/naming-conventions), with amounts in integer minor units ([Money & Amounts](/docs/payments/money)) and every tenant-scoped table carrying `workspace_id` or `organization_id` for row-level isolation ([Enforce It in the Database](/docs/architecture/multi-tenancy#enforce-it-in-the-database)):

```sql
CREATE TABLE organizations (             -- the customer: who pays and who controls
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_name       TEXT NOT NULL,
  display_name     TEXT NOT NULL,
  kind             TEXT NOT NULL DEFAULT 'business' CHECK (kind IN ('business', 'education',
                     'nonprofit', 'government', 'personal')),
  billing_account  TEXT,                  -- the billing system's customer ID
  sold_through     TEXT NOT NULL DEFAULT 'direct' CHECK (sold_through IN ('direct', 'reseller',
                     'marketplace')),
  status           TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'terminated')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE workspaces (                -- a tenant unit: Slack workspace, Atlassian site, tenant
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,  -- the subdomain or URL key
  region           TEXT NOT NULL,         -- where its data lives, e.g. 'us', 'eu', 'au'
  residency_pinned BOOLEAN NOT NULL DEFAULT FALSE,  -- contractually fixed to the region
  status           TEXT NOT NULL CHECK (status IN ('active', 'archived', 'suspended',
                     'deleted')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE domains (                   -- email domains an organization proved it owns
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  domain           TEXT NOT NULL,         -- lowercase, punycode
  method           TEXT NOT NULL CHECK (method IN ('dns_txt', 'https_file', 'email',
                     'identity_provider')),
  verified_at      TIMESTAMPTZ,           -- null: pending
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX domains_one_verified_owner ON domains (domain)
  WHERE verified_at IS NOT NULL;          -- a domain has one verified owner at a time

CREATE TABLE accounts (                  -- a person's identity
  id                         UUID PRIMARY KEY DEFAULT uuidv7(),
  email                      TEXT NOT NULL UNIQUE,  -- normalized
  display_name               TEXT NOT NULL,
  managed_by_organization_id UUID REFERENCES organizations (id),  -- null: personal account
  claimed_at                 TIMESTAMPTZ,
  status                     TEXT NOT NULL CHECK (status IN ('active', 'disabled', 'deleted')),
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((managed_by_organization_id IS NULL) = (claimed_at IS NULL))
);

CREATE TABLE members (                   -- an account inside one workspace
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id    UUID NOT NULL REFERENCES workspaces (id),
  account_id      UUID REFERENCES accounts (id),  -- null for a bot or service member
  kind            TEXT NOT NULL CHECK (kind IN ('full', 'guest', 'external', 'bot', 'service')),
  role            TEXT NOT NULL,          -- 'owner', 'admin', 'member', or a custom role key
  status          TEXT NOT NULL CHECK (status IN ('invited', 'active', 'deactivated')),
  invited_by      UUID REFERENCES members (id),
  joined_at       TIMESTAMPTZ,
  deactivated_at  TIMESTAMPTZ,
  UNIQUE (workspace_id, account_id),
  CHECK ((kind IN ('bot', 'service')) = (account_id IS NULL))
);

CREATE TABLE groups (                    -- teams and directory groups
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id  UUID NOT NULL REFERENCES workspaces (id),
  name          TEXT NOT NULL,
  source        TEXT NOT NULL CHECK (source IN ('local', 'scim', 'directory')),
  external_id   TEXT,                     -- the identity provider's group ID when synced
  UNIQUE (workspace_id, source, external_id)
);

CREATE TABLE group_members (
  group_id   UUID NOT NULL REFERENCES groups (id),
  member_id  UUID NOT NULL REFERENCES members (id),
  added_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_id, member_id)
);

CREATE TABLE containers (                -- where content lives
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id  UUID NOT NULL REFERENCES workspaces (id),
  parent_id     UUID REFERENCES containers (id),  -- a folder in a drive, a space in a site
  kind          TEXT NOT NULL CHECK (kind IN ('channel', 'space', 'project', 'board', 'folder',
                  'drive', 'canvas', 'meeting_series', 'matter')),
  name          TEXT NOT NULL,
  visibility    TEXT NOT NULL CHECK (visibility IN ('public', 'private', 'restricted',
                  'shared_external')),
  owner_id      UUID REFERENCES members (id),
  archived_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE items (                     -- one piece of content, any kind
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id  UUID NOT NULL REFERENCES workspaces (id),
  container_id  UUID NOT NULL REFERENCES containers (id),
  parent_id     UUID REFERENCES items (id),  -- a reply, a comment, a sub-task
  kind          TEXT NOT NULL CHECK (kind IN ('message', 'page', 'file', 'work_item',
                  'comment', 'design', 'recording')),
  author_id     UUID REFERENCES members (id),  -- null once the author's member row is purged
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ               -- soft delete; retention decides when it is purged
);

CREATE TABLE item_versions (             -- edits, page versions, file revisions
  item_id      UUID NOT NULL REFERENCES items (id),
  version      INT NOT NULL CHECK (version > 0),
  editor_id    UUID REFERENCES members (id),
  content_ref  TEXT NOT NULL,             -- object storage key or the kind table's revision
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (item_id, version)
);

CREATE TABLE grants (                    -- who may do what to which resource
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id    UUID NOT NULL REFERENCES workspaces (id),
  principal_type  TEXT NOT NULL CHECK (principal_type IN ('member', 'group', 'workspace',
                    'organization', 'link')),
  principal_id    UUID NOT NULL,
  resource_type   TEXT NOT NULL CHECK (resource_type IN ('container', 'item')),
  resource_id     UUID NOT NULL,
  role            TEXT NOT NULL,          -- 'viewer', 'commenter', 'editor', 'admin', ...
  granted_by      UUID REFERENCES members (id),
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (principal_type, principal_id, resource_type, resource_id)
);

CREATE TABLE share_links (               -- "anyone with the link": a principal that is a URL
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id   UUID NOT NULL REFERENCES workspaces (id),
  token_hash     BYTEA NOT NULL UNIQUE,   -- never store the token itself
  audience       TEXT NOT NULL CHECK (audience IN ('organization', 'anyone')),
  created_by     UUID NOT NULL REFERENCES members (id),
  expires_at     TIMESTAMPTZ,
  revoked_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);                                        -- its grants rows use principal_type = 'link'

CREATE TABLE plans (                     -- what is for sale
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  code          TEXT NOT NULL UNIQUE,     -- 'free', 'pro', 'business_plus', 'enterprise'
  name          TEXT NOT NULL,
  rank          SMALLINT NOT NULL,        -- the ladder; gates compare ranks
  status        TEXT NOT NULL CHECK (status IN ('active', 'grandfathered', 'retired'))
);

CREATE TABLE subscriptions (             -- an organization's billing contract
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  plan_id          UUID NOT NULL REFERENCES plans (id),
  term             TEXT NOT NULL CHECK (term IN ('monthly', 'annual', 'multi_year')),
  billing_interval TEXT NOT NULL CHECK (billing_interval IN ('monthly', 'quarterly',
                     'annual', 'upfront')),
  seat_quantity    INT NOT NULL CHECK (seat_quantity >= 0),  -- committed or current
  unit_price       BIGINT NOT NULL CHECK (unit_price >= 0),  -- per seat per month, as signed
  currency         CHAR(3) NOT NULL,
  current_period   TSTZRANGE NOT NULL,
  term_ends_at     TIMESTAMPTZ NOT NULL,
  auto_renew       BOOLEAN NOT NULL DEFAULT TRUE,
  status           TEXT NOT NULL CHECK (status IN ('trialing', 'active', 'past_due',
                     'cancelled', 'expired')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE seat_assignments (          -- who holds each seat, and since when
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  subscription_id  UUID NOT NULL REFERENCES subscriptions (id),
  member_id        UUID NOT NULL REFERENCES members (id),
  seat_type        TEXT NOT NULL DEFAULT 'standard',  -- 'full', 'dev', 'collab', ...
  assigned_during  TSTZRANGE NOT NULL,    -- open upper bound while held
  EXCLUDE USING gist (member_id WITH =, subscription_id WITH =, assigned_during WITH &&)
);

CREATE TABLE apps (                      -- an integration, bot or marketplace listing
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  developer      TEXT NOT NULL,           -- the vendor, a partner, or a customer's own team
  owner_org_id   UUID REFERENCES organizations (id),  -- set for a customer's internal app
  name           TEXT NOT NULL,
  distribution   TEXT NOT NULL CHECK (distribution IN ('first_party', 'marketplace',
                   'internal', 'unlisted')),
  status         TEXT NOT NULL CHECK (status IN ('draft', 'in_review', 'published',
                   'suspended', 'retired'))
);

CREATE TABLE app_installations (         -- an app installed into a workspace, by an admin or user
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  app_id         UUID NOT NULL REFERENCES apps (id),
  workspace_id   UUID NOT NULL REFERENCES workspaces (id),
  installed_by   UUID NOT NULL REFERENCES members (id),
  approved_by    UUID REFERENCES members (id),  -- the admin, where approval is required
  scopes         TEXT[] NOT NULL,
  installed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uninstalled_at TIMESTAMPTZ
);

CREATE TABLE api_tokens (                -- bot tokens, user OAuth grants, admin API keys
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id        UUID NOT NULL REFERENCES workspaces (id),
  app_installation_id UUID REFERENCES app_installations (id),
  acting_member_id    UUID REFERENCES members (id),  -- whose permissions it carries
  kind                TEXT NOT NULL CHECK (kind IN ('bot', 'user_oauth', 'admin_api',
                        'service')),
  scopes              TEXT[] NOT NULL,
  token_hash          BYTEA NOT NULL UNIQUE,
  last_used_at        TIMESTAMPTZ,
  expires_at          TIMESTAMPTZ,
  revoked_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_events (              -- append-only; who did what to which resource
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  workspace_id     UUID REFERENCES workspaces (id),  -- null for org-level actions
  actor_type       TEXT NOT NULL CHECK (actor_type IN ('member', 'admin', 'app', 'service',
                     'vendor_support', 'system')),
  actor_id         UUID,
  action           TEXT NOT NULL,          -- 'member.deactivated', 'file.shared_externally', ...
  resource_type    TEXT NOT NULL,
  resource_id      UUID,
  context          JSONB NOT NULL DEFAULT '{}',  -- IP, user agent, session, request ID
  occurred_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE retention_policies (        -- what the organization keeps, and for how long
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  scope_type       TEXT NOT NULL CHECK (scope_type IN ('organization', 'workspace',
                     'container')),
  scope_id         UUID NOT NULL,
  item_kind        TEXT,                   -- null: every kind
  keep_for         INTERVAL,               -- null: keep forever
  action           TEXT NOT NULL CHECK (action IN ('delete', 'delete_versions_only', 'keep')),
  created_by       UUID NOT NULL REFERENCES members (id),
  effective_from   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE legal_holds (               -- preserve everything in scope, whatever retention says
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  matter_name      TEXT NOT NULL,
  created_by       UUID NOT NULL REFERENCES members (id),  -- a legal-hold admin
  placed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  released_at      TIMESTAMPTZ
);

CREATE TABLE hold_custodians (           -- whose content, or which containers, a hold covers
  legal_hold_id  UUID NOT NULL REFERENCES legal_holds (id),
  custodian_type TEXT NOT NULL CHECK (custodian_type IN ('account', 'container')),
  custodian_id   UUID NOT NULL,
  added_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  released_at    TIMESTAMPTZ,
  PRIMARY KEY (legal_hold_id, custodian_type, custodian_id)
);
```

Design notes:

- **Tenant scope is the workspace, policy scope is the organization.** Row-level security keys on `workspace_id` for content and on `organization_id` for billing, policy, audit and holds. A query that crosses workspaces (org-wide search, an eDiscovery collection, an org admin's member list) runs as the organization, with its own check, and is audited as such ([Tenant Hierarchies](/docs/architecture/multi-tenancy#tenant-hierarchies)).
- **Holds are custodians, not copies.** A hold names accounts and containers; the purge job asks, for each candidate item, whether any open hold covers its author or its container, and skips it if so. Copying held content to a separate store doubles storage and creates a second record to secure; the check is cheaper and is what Slack's "regardless of retention settings" means in practice.
- **Deactivation is not deletion.** A deactivated member keeps their authored items, their audit trail and their place in holds; the employer's content stays with the employer. Deleting an account is a separate, rarer act with its own retention rules ([Soft vs Hard Delete](/docs/architecture/data-retention#soft-vs-hard-delete)).
- **Seats are rows, not a number.** `seat_assignments` with a time range is what lets fair billing credit an inactive member by the day, a true-up count the peak, and a dispute show who held a seat when. `subscriptions.seat_quantity` is the committed or current quantity, and the two are reconciled, not merged.
- **Tokens carry a member.** An app's token acts with the permissions of an installation and, for user OAuth, a member; when the member is deactivated their user tokens are revoked. AI agents get the same treatment in AI Agents, Connectors & MCP.
- **Typed actors in the audit log.** An admin's action, an app's action, the vendor's support engineer's access and an automation's action are different `actor_type` values, never collapsed into "user" ([Typed Actors](/docs/architecture/audit-trails#typed-actors)).
- **Emit life-cycle events.** `member.joined`, `member.deactivated`, `account.claimed`, `container.shared_externally`, `item.created`, `item.deleted`, `grant.created`, `subscription.changed`, `legal_hold.placed` are what search, notifications, billing, the audit pipeline and customers' own integrations subscribe to ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

Each later chapter extends a defined part of this spine. The table below is the plan, by chapter; chapters in this part link to their How to Build It, and the rest will as they are written:

| Chapter | Extends | Adds |
| --- | --- | --- |
| [The Collaboration Landscape](/books/workplace-and-collaboration/workplace-landscape#how-to-build-it) | `workspaces`, `plans` | `products`, `workspace_products`, `product_retirements` |
| [Business Models & Unit Economics](/books/workplace-and-collaboration/business-models#how-to-build-it) | `organizations`, `subscriptions` | `arr_snapshots`, `arr_movements`, `net_dollar_retention` (view) |
| [Plans, Pricing & Seats](/books/workplace-and-collaboration/plans-pricing-and-seats#how-to-build-it) | `plans`, `subscriptions`, `seat_assignments` | `plan_prices`, `plan_entitlements`, `addons`, `subscription_addons`, `seat_activity`, `billing_credits`, `discount_programs`, `program_enrollments` |
| [Suites, Bundling & Antitrust](/books/workplace-and-collaboration/suites-bundling-and-antitrust#how-to-build-it) | `plans`, `products`, `plan_prices` | `plan_products`, `plan_alternatives`, `switch_windows` |
| Tenants, Workspaces & Organizations | `organizations`, `workspaces` | `workspace_join_rules`, `tenant_moves` |
| SSO, Domains & Managed Accounts | `domains`, `accounts` | `identity_providers`, `sso_configurations`, `account_claims`, `session_policies` |
| Provisioning, SCIM & Offboarding | `members`, `groups`, `group_members` | `scim_connections`, `directory_sync_runs`, `external_identities`, `ownership_transfers` |
| Guests & Cross-Org Collaboration | `members`, `containers` | `external_connections`, `shared_containers`, `guest_expirations` |
| Permissions & Sharing | `grants`, `share_links`, `containers` | `roles`, `role_permissions`, `container_restrictions` |
| Admin Consoles & Policies | `members`, `audit_events` | `admin_roles`, `admin_role_assignments`, `policies`, `policy_assignments` |
| Data Residency & Sovereignty | `workspaces` | `residency_commitments`, `data_locations` |
| Channels, Threads & Direct Messages | `containers`, `items` | `channels`, `messages`, `reactions`, `pins`, `bookmarks` |
| Chat at Scale | `messages` | `read_states`, `delivery_cursors` |
| Notifications, Presence & Attention | `members` | `notification_preferences`, `notification_schedules`, `presence_states`, `notification_deliveries` |
| Email & Calendar | `members`, `containers` | `calendars`, `calendar_events`, `event_attendees`, `bookable_resources`, `resource_bookings` |
| Frontline & Deskless Workers | `members`, `groups` | `shifts`, `shift_assignments`, `shared_devices`, `task_publications` |
| Meetings & Video | `containers` (meeting series) | `meetings`, `meeting_participants`, `meeting_sessions` |
| Recordings, Transcripts & AI Notes | `items` (recording) | `recordings`, `transcripts`, `transcript_segments`, `recording_consents` |
| Async Video & Screen Recording | `items`, `recordings` | `videos`, `video_views` |
| Business Phone & Contact Center | `members` | `phone_numbers`, `call_records`, `emergency_locations`, `number_ports` |
| Rooms, Devices & the Hybrid Office | `workspaces`, `bookable_resources` | `rooms`, `room_devices`, `desk_bookings`, `visitors` |
| Docs & Wikis | `containers` (space), `items` | `spaces`, `pages`, `blocks`, `templates`, `page_publications` |
| Real-Time Co-Editing | `item_versions` | `document_updates`, `document_snapshots` |
| Files, Sync & Storage | `items`, `item_versions` | `files`, `file_blobs`, `storage_quotas`, `sync_cursors` |
| Intranets & Knowledge Bases | `pages` | `announcements`, `content_verifications` |
| No-Code Databases & Internal Tools | `containers`, `items` | `user_tables`, `user_fields`, `user_records` |
| E-Signatures & Agreements | `files`, `audit_events` | `envelopes`, `envelope_recipients`, `signature_events`, `completion_certificates` |
| Work Items, Hierarchies & Fields | `containers` (project), `items` | `projects`, `work_items`, `work_item_types`, `work_item_links`, `custom_fields`, `custom_field_values` |
| Workflows & Status Machines | `work_items` | `workflows`, `workflow_statuses`, `workflow_transitions`, `status_changes` |
| Queries, Views & Dashboards | `work_items` | `saved_filters`, `views`, `dashboards`, `dashboard_widgets` |
| Boards, Sprints & Cycles | `containers` (board), `work_items` | `boards`, `sprints`, `sprint_items` |
| Portfolios, Roadmaps & Goals | `projects`, `work_items` | `goals`, `goal_links`, `portfolios`, `portfolio_items` |
| Automation Rules | `work_items`, `audit_events` | `automation_rules`, `automation_runs`, `automation_quotas` |
| IT & Service Management | `work_items` | `request_types`, `sla_policies`, `sla_clocks`, `assets`, `asset_relationships` |
| Development Collaboration | `work_items`, `apps` | `repositories`, `code_links`, `deployments` |
| Design Tools | `items` (design) | `designs`, `design_branches`, `components` |
| Whiteboards & Diagrams | `containers` (canvas) | `canvases`, `canvas_objects` |
| Design Systems & Handoff | `designs`, `components` | `libraries`, `library_releases`, `design_tokens` |
| Enterprise Search | `items`, `grants` | `search_connectors`, `indexed_documents`, `acl_snapshots` |
| Apps & Marketplaces | `apps`, `app_installations` | `app_listings`, `app_reviews`, `consent_grants` |
| APIs, Events & Rate Limits | `api_tokens` | `event_subscriptions`, `webhook_deliveries`, `rate_limit_buckets` |
| Integration Platforms & Workflow Builders | `apps`, `api_tokens` | `connections`, `automation_flows`, `flow_runs` |
| AI Assistants Over Company Data | `items`, `grants` | `ai_interactions`, `ai_citations`, `ai_settings` |
| AI Agents, Connectors & MCP | `apps`, `api_tokens`, `audit_events` | `agents`, `agent_identities`, `agent_actions` |
| Audit Logs | `audit_events` | `audit_exports`, `siem_streams` |
| Retention & Legal Hold | `retention_policies`, `legal_holds`, `hold_custodians` | `retention_runs`, `preserved_items` |
| eDiscovery & Export | `legal_holds`, `items` | `ediscovery_cases`, `collections`, `export_jobs` |
| DLP & Information Protection | `items`, `containers` | `sensitivity_labels`, `dlp_policies`, `dlp_matches` |
| Encryption & Customer-Managed Keys | `organizations`, `workspaces` | `customer_keys`, `key_events` |
| Certifications & Procurement Assurance | `organizations` | `compliance_attestations`, `assurance_requests` |
| Regulated Communications & Archiving | `items`, `retention_policies` | `archive_feeds`, `supervision_reviews`, `lexicon_hits` |
| Employee Monitoring & Privacy | `audit_events`, `members` | `analytics_settings`, `monitoring_notices` |
| Threats & Incidents | `api_tokens`, `audit_events` | `security_alerts`, `token_revocations`, `incident_actions` |
| Law Firms & Professional Services | `organizations`, `containers` (matter) | `clients`, `matters`, `timekeepers`, `rates` |
| Matters, Intake & Conflicts | `matters` | `intake_requests`, `parties`, `conflict_searches`, `ethical_walls` |
| Trust Accounting & IOLTA | `matters`, `clients` | `trust_accounts`, `trust_transactions`, `trust_reconciliations` |
| Time, Billing & E-Billing | `matters`, `timekeepers` | `time_entries`, `prebills`, `matter_invoices`, `ledes_submissions` |
| Legal Documents, DMS & AI | `files`, `matters` | `document_profiles`, `email_filings` |
| Building It Yourself | every table, the playbook's `outbox_events` | `shard_map`, `tenant_placements` |
| Desktop & Mobile Clients | `accounts`, `members` | `devices`, `client_sessions`, `push_tokens` |
| Reliability, Outages & SLAs | `workspaces`, `subscriptions` | `incidents`, `status_updates`, `sla_credits` |
| Billing, Seats & Resellers | `subscriptions`, `seat_assignments`, `billing_credits` | `billing_invoices`, `true_ups`, `reseller_accounts`, `marketplace_orders` |
| From Self-Serve to Enterprise | `organizations`, `domains` | `product_qualified_leads`, `security_reviews`, `order_forms` |
| Migrations, Imports & Switching | `workspaces`, `items` | `imports`, `import_mappings`, `data_exports` |
| Accessibility & Localization | `products` | `conformance_reports`, `caption_tracks` |
| Workplace Metrics | `arr_snapshots`, `seat_activity` | `metric_definitions`, `metric_values`, `license_utilization` (view) |

Three decisions keep the map one model rather than several:

- **Names that look alike are different records.** `billing_invoices` are the vendor's invoices to a customer (Billing, Seats & Resellers); `matter_invoices` are a law firm's bills to its client (Time, Billing & E-Billing). `calendar_events` are meetings on a calendar; `audit_events` and the outbox's events are records of things that happened. `automation_flows` are an integration platform's flows; the workflows in Workflows & Status Machines are status machines on work items.
- **One concept, one table, reused.** Every piece of content is an `items` row with a kind table beside it, so a hold, a retention run, a DLP match, a search document and an AI citation all point at `items.id`. Every permission is a `grants` row or derives from container membership, so search, AI retrieval and exports trim by the same check.
- **Organizations own policy; workspaces own content.** Retention policies, holds, admin roles, keys and audit live on the organization with an optional workspace or container scope, so an enterprise sets one policy for fifty workspaces and a small customer never notices the difference.

## Auditing

The records in this chapter are the ones customers, auditors, courts and regulators ask about later:

- **Who could get in, and who let them.** Every member joined, invited, claimed, changed role, deactivated and reactivated, with the actor; every domain verified; every guest and external connection approved.
- **Who could see what.** Every grant and share link created, changed and revoked, and every container's visibility change, so an oversharing incident can be dated and scoped.
- **What was kept and why.** Every retention policy with its effective date, every hold placed and released with its custodians, and every purge run with what it skipped because of a hold.
- **What the customer bought.** Every subscription change with its seat quantity, price and term, and every seat assignment, so a true-up, a credit or a renewal dispute reads from rows.
- **What acted on the customer's behalf.** Every app installed and approved, every token issued and revoked, every vendor support access to the tenant.

The mechanics (typed actors, append-only history, logging access as well as changes) are in [Audit Trails](/docs/architecture/audit-trails); the product side is Audit Logs.

## What This Means for the System You Build

- **Separate organization from workspace,** and put billing, domains and org-wide policy on the first and content, region and settings on the second.
- **Separate account from member,** so one person can be an employee here and a guest there, and deactivation in one workspace doesn't touch the other.
- **Make "managed" a state of the account,** reached by domain verification and claiming, and audit the transition.
- **Put every piece of content in `items` and every place in `containers`,** with kind tables beside them, so holds, retention, search, permissions and audit work across products.
- **Give the customer's admins the levers** for every feature: on and off, scope, retention, export and an audit trail.
- **Store seats as assignments over time,** and compute the bill, the credits and ARR from them.
- **Let holds override retention** by checking custodians at purge time, and never delete a held item.
- **Type every actor,** including apps, automations, agents and the vendor's own support staff.
- **Emit life-cycle events** for members, content, grants, subscriptions and holds, and build billing, search and audit as consumers.

## References

**Filings**

- [Atlassian: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1650372/000165037226000036/team-20260630.htm), revenue, Marketplace and other revenue, and the share of revenue from channel partners
- [Microsoft: FY26 fourth quarter earnings release](https://www.microsoft.com/en-us/investor/earnings/FY-2026-Q4/press-release-webcast), Productivity and Business Processes revenue for fiscal 2026
- [Zoom Communications: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1585521/000158552126000030/zm-20260131.htm), revenue and growth
- [Slack Technologies: Form S-1 (2019)](https://www.sec.gov/Archives/edgar/data/1764925/000162828019004786/slacks-1.htm), bottoms-up adoption by end users

**Vendor documentation**

- [Google Cloud: Data Processing Addendum](https://cloud.google.com/terms/data-processing-addendum), Google as processor, the customer as controller, and admin console use as instructions
- [Slack: User data request policy](https://api.slack.com/user-data-request-policy), customer control of data, requesters directed to the customer, warrant requirement and customer notice
- [Slack: Create and manage legal holds](https://slack.com/help/articles/4401830811795-Create-and-manage-legal-holds), the Legal Holds Admin role and preservation regardless of retention settings
- [Slack: Pricing](https://slack.com/pricing), plan prices, the free plan's 90-day history and the Enterprise Key Management add-on
- [Slack: Fair billing policy](https://slack.com/help/articles/218915077-Slacks-fair-billing-policy), billing active members and the 28-day inactivity threshold
- [Atlassian: Jira pricing](https://www.atlassian.com/software/jira/pricing), the free plan for 10 users and Rovo credits per plan
- [Atlassian: Cloud licensing](https://www.atlassian.com/licensing/cloud), billable users and the free plan's upgrade after seven days over the limit
- [Atlassian: Verify a domain to manage accounts](https://support.atlassian.com/user-management/docs/verify-a-domain-to-manage-accounts/), DNS and HTTPS verification and claiming accounts
- [Google Workspace Admin Help: Transfer tool for unmanaged users](https://knowledge.workspace.google.com/admin/users/use-the-transfer-tool-to-migrate-unmanaged-users), conflicting personal accounts and the transfer invitation
- [Microsoft Learn: New commerce license-based overview](https://learn.microsoft.com/en-us/partner-center/customers/new-commerce-license-based), CSP purchasing under the Microsoft Customer Agreement
- [Microsoft Learn: Create customer subscriptions](https://learn.microsoft.com/en-us/partner-center/customers/create-a-new-subscription), license reductions only within seven days
- [Microsoft 365 Enterprise: plans and pricing](https://www.microsoft.com/en-us/microsoft-365/enterprise/microsoft365-plans-and-pricing), the Microsoft 365 Copilot add-on price
- [Figma: Pricing](https://www.figma.com/pricing/), seat types, prices and AI credits per seat
- [Zoom: Pricing](https://zoom.us/pricing), Pro prices billed monthly and annually
