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

The architecture is consumer chat and content: messages fanned out over persistent connections, documents edited by several people at once, files synced to every device, search over all of it. The duties are not. On a community platform the platform sets the rules, moderates, keeps evidence and answers subpoenas; in workplace software the customer organization does, through its administrators, and the vendor's job narrows to running the service and following the customer's instructions ([Workplace Chat Inverts the Duties](/books/user-generated-platforms/real-time-chat#workplace-chat-inverts-the-duties)). That inversion is why the product has an admin console as large as the product itself, why a sale is to a buyer who is rarely the user, and why every feature ships with a policy that someone other than the user controls. This chapter is the map the rest of the volume uses: how to read it, the parties, the inversion, how the money works, the life of a customer, and the data model every later chapter extends. Terms are collected in the volume's [Glossary](/books/workplace-and-collaboration/glossary).

## How to Read This Volume

The volume follows a customer from its first free workspace to the platform that runs it, in eleven parts plus a reference:

- **The Business.** This chapter; [The Collaboration Landscape](/books/workplace-and-collaboration/workplace-landscape) (the categories, suites against best-of-breed, market sizes from the filings, and a dated timeline of acquisitions and shutdowns); [Business Models & Unit Economics](/books/workplace-and-collaboration/business-models) (per-seat SaaS, freemium and product-led growth, land and expand, usage and AI credits, and the metrics from the filings); [Plans, Pricing & Seats](/books/workplace-and-collaboration/plans-pricing-and-seats) (tier ladders, the SSO tax, what a seat is, terms, discount programs and AI pricing); and [Suites, Bundling & Antitrust](/books/workplace-and-collaboration/suites-bundling-and-antitrust) (why suites win, the Teams case, Google's bundling and licensing on clouds).
- **Tenancy and Identity.** [Tenants, Workspaces & Organizations](/books/workplace-and-collaboration/tenants-and-workspaces) (workspace against organization, multi-geo tenants, joining by domain, splitting and merging tenants); [SSO, Domains & Managed Accounts](/books/workplace-and-collaboration/sso-and-managed-accounts) (domain verification, managed against personal accounts, enforced SAML and OIDC, sessions); [Provisioning, SCIM & Offboarding](/books/workplace-and-collaboration/provisioning-and-scim) (SCIM 2.0, directory sync, joiner-mover-leaver, ownership transfer); [Guests & Cross-Org Collaboration](/books/workplace-and-collaboration/guests-and-external-collaboration) (guest models, Slack Connect, shared channels, who owns shared content); [Permissions & Sharing](/books/workplace-and-collaboration/permissions-and-sharing) (role ladders, inheritance, link sharing, relationship-based access); [Admin Consoles & Policies](/books/workplace-and-collaboration/admin-consoles-and-policies) (admin roles, policy engines, admin APIs); and [Data Residency & Sovereignty](/books/workplace-and-collaboration/data-residency-and-sovereignty) (what residency covers, the EU Data Boundary, sovereign clouds, transfers).
- **Chat and Messaging.** [Channels, Threads & Direct Messages](/books/workplace-and-collaboration/workplace-chat) (the conversation models, canvases and lists, edit and delete rules, archiving); [Chat at Scale](/books/workplace-and-collaboration/chat-architecture) (public architecture write-ups, delivery, ordering and unread state); [Notifications, Presence & Attention](/books/workplace-and-collaboration/notifications-and-attention) (mentions, schedules, presence, digests and right-to-disconnect laws); [Email & Calendar](/books/workplace-and-collaboration/email-and-calendar) (Exchange and Gmail, iCalendar, CalDAV, invites and resource booking); and [Frontline & Deskless Workers](/books/workplace-and-collaboration/frontline-workers) (shared devices, shifts, walkie-talkie, and wage-hour risk).
- **Meetings and Voice.** [Meetings & Video](/books/workplace-and-collaboration/meetings-and-video) (WebRTC, SFUs, codecs, end-to-end encryption, webinars and meeting security); [Recordings, Transcripts & AI Notes](/books/workplace-and-collaboration/recordings-transcripts-and-ai-notes) (recording, transcription, notetaker bots and recording-consent law); [Async Video & Screen Recording](/books/workplace-and-collaboration/async-video); [Business Phone & Contact Center](/books/workplace-and-collaboration/business-phone-and-contact-center) (UCaaS, direct routing, porting, E911, CCaaS); and [Rooms, Devices & the Hybrid Office](/books/workplace-and-collaboration/rooms-and-the-hybrid-office) (room systems, desk booking, visitors and occupancy data).
- **Docs, Wikis and Files.** [Docs & Wikis](/books/workplace-and-collaboration/docs-and-wikis) (page and block models, page trees, templates, publishing); [Real-Time Co-Editing](/books/workplace-and-collaboration/real-time-collaboration) (OT, CRDTs, server authority, offline); [Files, Sync & Storage](/books/workplace-and-collaboration/files-and-sync) (sync engines, versions, ransomware recovery, quotas); [Intranets & Knowledge Bases](/books/workplace-and-collaboration/intranets-and-knowledge); [No-Code Databases & Internal Tools](/books/workplace-and-collaboration/no-code-databases-and-internal-tools); and [E-Signatures & Agreements](/books/workplace-and-collaboration/e-signatures-and-agreements) (ESIGN, UETA, eIDAS, audit trails and online notarization).
- **Work Management.** [Work Items, Hierarchies & Fields](/books/workplace-and-collaboration/work-items-and-fields); [Workflows & Status Machines](/books/workplace-and-collaboration/workflows-and-states); [Queries, Views & Dashboards](/books/workplace-and-collaboration/queries-views-and-dashboards); [Boards, Sprints & Cycles](/books/workplace-and-collaboration/boards-sprints-and-cycles); [Portfolios, Roadmaps & Goals](/books/workplace-and-collaboration/portfolios-roadmaps-and-goals); [Automation Rules](/books/workplace-and-collaboration/automation-rules); [IT & Service Management](/books/workplace-and-collaboration/service-management) (ITIL, catalogs, SLAs and the CMDB); and [Development Collaboration](/books/workplace-and-collaboration/development-collaboration) (code hosting, review and linking work to commits).
- **Design and Visual Collaboration.** [Design Tools](/books/workplace-and-collaboration/design-tools); [Whiteboards & Diagrams](/books/workplace-and-collaboration/whiteboards-and-diagrams); and [Design Systems & Handoff](/books/workplace-and-collaboration/design-systems-and-handoff).
- **Search, Integrations and AI.** [Enterprise Search](/books/workplace-and-collaboration/enterprise-search) (permission-trimmed search and connectors); [Apps & Marketplaces](/books/workplace-and-collaboration/apps-and-marketplaces) (app review, admin approval, revenue share); [APIs, Events & Rate Limits](/books/workplace-and-collaboration/apis-webhooks-and-rate-limits); [Integration Platforms & Workflow Builders](/books/workplace-and-collaboration/integration-platforms); [AI Assistants Over Company Data](/books/workplace-and-collaboration/ai-assistants) (permission-aware retrieval, oversharing, data-use commitments); and [AI Agents, Connectors & MCP](/books/workplace-and-collaboration/ai-agents-and-mcp) (agent identity, consent and audit).
- **Security and Compliance.** [Audit Logs](/books/workplace-and-collaboration/audit-logs); [Retention & Legal Hold](/books/workplace-and-collaboration/retention-and-legal-hold); [eDiscovery & Export](/books/workplace-and-collaboration/ediscovery-and-export); [DLP & Information Protection](/books/workplace-and-collaboration/dlp-and-information-protection); [Encryption & Customer-Managed Keys](/books/workplace-and-collaboration/encryption-and-customer-keys); [Certifications & Procurement Assurance](/books/workplace-and-collaboration/compliance-certifications); [Regulated Communications & Archiving](/books/workplace-and-collaboration/regulated-communications) (SEC and FINRA recordkeeping, the off-channel sweep, supervision); [Employee Monitoring & Privacy](/books/workplace-and-collaboration/employee-monitoring-and-privacy); and [Threats & Incidents](/books/workplace-and-collaboration/threats-and-incidents).
- **Law Firms and Professional Services.** [Law Firms & Professional Services](/books/workplace-and-collaboration/law-firms-and-professional-services) (the matter-centric model and the rules that shape software); [Matters, Intake & Conflicts](/books/workplace-and-collaboration/matters-intake-and-conflicts); [Trust Accounting & IOLTA](/books/workplace-and-collaboration/trust-accounting-iolta); [Time, Billing & E-Billing](/books/workplace-and-collaboration/time-billing-and-ledes) (LEDES and UTBMS); and [Legal Documents, DMS & AI](/books/workplace-and-collaboration/legal-documents-and-ai).
- **Running the Platform.** [Building It Yourself](/books/workplace-and-collaboration/collaboration-architecture) (services, sharding and the permission service); [Desktop & Mobile Clients](/books/workplace-and-collaboration/desktop-and-mobile-clients); [Reliability, Outages & SLAs](/books/workplace-and-collaboration/reliability-and-outages); [Billing, Seats & Resellers](/books/workplace-and-collaboration/billing-and-seat-management); [From Self-Serve to Enterprise](/books/workplace-and-collaboration/selling-to-enterprises); [Migrations, Imports & Switching](/books/workplace-and-collaboration/migrations-and-switching); [Accessibility & Localization](/books/workplace-and-collaboration/accessibility-and-localization); and [Workplace Metrics](/books/workplace-and-collaboration/workplace-metrics).
- **Reference.** A [Glossary](/books/workplace-and-collaboration/glossary) of every term the volume defines, grouped by part.

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

Two of these split in ways the data model has to carry. **Buyer versus user.** The person who chose Slack may be one engineer; the person who signs the renewal is a procurement lead; the person who decides what can be shared outside is a security admin; the people using it are everyone else. Each has a different screen. **Who acts for the customer.** Admin power is not one role but a ladder: Slack separates Org Owners, Workspace Owners and a Legal Holds Admin system role ([Slack: legal holds](https://slack.com/help/articles/4401830811795-Create-and-manage-legal-holds)), Microsoft and Google ship dozens of scoped admin roles, and a reseller may administer a tenant it doesn't own. [Admin Consoles & Policies](/books/workplace-and-collaboration/admin-consoles-and-policies) covers the ladders.

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

What a seat is differs by vendor, and the definition is where billing disputes start: Slack bills members who have been active in the last 28 days under its fair billing policy and credits the rest ([Slack: fair billing](https://slack.com/help/articles/218915077-Slacks-fair-billing-policy)); Atlassian counts a user as billable "once product access is granted," including invited users who haven't accepted ([Atlassian: cloud licensing](https://www.atlassian.com/licensing/cloud)); Microsoft lets a partner reduce licenses only within seven days of adding them ([Microsoft Learn: create subscriptions](https://learn.microsoft.com/en-us/partner-center/customers/create-a-new-subscription)). [Plans, Pricing & Seats](/books/workplace-and-collaboration/plans-pricing-and-seats) covers the definitions, [Business Models & Unit Economics](/books/workplace-and-collaboration/business-models) what they do to revenue, and [Billing, Seats & Resellers](/books/workplace-and-collaboration/billing-and-seat-management) the engine; the rating mechanics are the Hosting & Cloud volume's [Rating: From Events to Money](/books/hosting-and-cloud/metering-and-rating#rating-from-events-to-money).

The scale is in the filings. Microsoft's Productivity and Business Processes segment, where it reports Microsoft 365 Commercial cloud among other businesses, earned $140.0 billion in the fiscal year ended June 30, 2026 ([Microsoft FY26 Q4 release](https://www.microsoft.com/en-us/investor/earnings/FY-2026-Q4/press-release-webcast)); Atlassian earned $6.57 billion, up 26% ([Atlassian 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1650372/000165037226000036/team-20260630.htm)); Zoom $4.87 billion, up 4.4% ([Zoom 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1585521/000158552126000030/zm-20260131.htm)). [The Collaboration Landscape](/books/workplace-and-collaboration/workplace-landscape) lays out the rest.

My rule for the money: a subscription is a contract with a term, a quantity per seat type, a price per unit that was true when signed, and a history of every change. Store all four, and compute the invoice, the ARR and the seat count from them. A seat count stored as one number on the organization can't answer a true-up, a credit or a dispute.

## The Life of a Customer

The same few records move through every account; what changes is who creates them.

**One person signs up.** An engineer creates an account with a work email and starts a free workspace to try the product with three teammates. The account is personal, the workspace is unpaid, and nobody at the employer knows it exists. The free plan is designed to be outgrown: Slack's free plan keeps 90 days of message history ([Slack: pricing](https://slack.com/pricing)); Jira's is "Free forever for 10 users" and a site that stays over the limit is upgraded to Standard after seven days ([Jira pricing](https://www.atlassian.com/software/jira/pricing), [Atlassian: cloud licensing](https://www.atlassian.com/licensing/cloud)).

**The team pays.** Someone puts a card on file for a Pro or Standard plan, monthly. The workspace now has a subscription, a seat count, and an owner who is still just a user. New colleagues join by invitation or because their email domain matches; Slack's prospectus described usage inside organizations as "typically initially driven bottoms-up, by end users" ([Slack S-1](https://www.sec.gov/Archives/edgar/data/1764925/000162828019004786/slacks-1.htm)).

**More teams arrive.** Other departments start their own workspaces on the same domain, on their own cards. The employer now has several tenants, several bills, and content scattered across them. The vendor sees the domain repeat and its sales team calls; [Business Models & Unit Economics](/books/workplace-and-collaboration/business-models) and [From Self-Serve to Enterprise](/books/workplace-and-collaboration/selling-to-enterprises) cover that motion.

**IT claims it.** The company verifies its domain (a DNS TXT record or a file on its web server) and claims the accounts on it, which become managed accounts that the admin can edit, deactivate, and put under SAML single sign-on and two-step verification ([Atlassian: verify a domain](https://support.atlassian.com/user-management/docs/verify-a-domain-to-manage-accounts/)). Personal accounts that collide with the domain have to be brought in: Google's transfer tool sends invitations a user "cannot decline," and if one is ignored the admin can create a managed account with the same address, after which the user's personal account must be renamed ([Google Workspace Admin Help: transfer tool](https://knowledge.workspace.google.com/admin/users/use-the-transfer-tool-to-migrate-unmanaged-users)). The scattered workspaces are consolidated under one organization. [SSO, Domains & Managed Accounts](/books/workplace-and-collaboration/sso-and-managed-accounts) and [Tenants, Workspaces & Organizations](/books/workplace-and-collaboration/tenants-and-workspaces) cover the mechanics.

**The enterprise contract.** Procurement signs an annual or multi-year order form for an Enterprise plan: a negotiated price per seat, a committed quantity, a data processing addendum, a security review, SSO and SCIM provisioning from the identity provider, audit logs streamed to the SIEM, retention policies, legal holds, maybe customer-managed keys and data residency. People now arrive and leave through the HR system and the directory, not invitations.

**Steady state.** Seats grow and shrink with headcount; the vendor's fair billing or true-up rules decide when the bill follows. Admins add apps, approve guests and external connections, answer an eDiscovery request, place a hold. The renewal is a negotiation over price, seats and the next add-on.

**Leaving.** The customer moves to a competitor or a suite it already pays for, exports its data, and terminates. What it can take out, in which format, and how quickly the vendor deletes the rest are the subject of [Migrations, Imports & Switching](/books/workplace-and-collaboration/migrations-and-switching), and since September 12, 2025 the EU Data Act sets rules for it ([The EU Data Act](/books/hosting-and-cloud/egress-and-switching#the-eu-data-act)).

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
  id           UUID PRIMARY KEY DEFAULT uuidv7(),  -- what other tables reference
  item_id      UUID NOT NULL REFERENCES items (id),
  version      INT NOT NULL CHECK (version > 0),
  editor_id    UUID REFERENCES members (id),
  content_ref  TEXT NOT NULL,             -- object storage key or the kind table's revision
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (item_id, version)
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

CREATE TABLE audit_events (              -- append-only; the sketch: Audit Logs gives the full shape
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  workspace_id     UUID REFERENCES workspaces (id),  -- null for org-level actions
  actor_type       TEXT NOT NULL CHECK (actor_type IN ('member', 'admin', 'app', 'bot',
                     'service', 'agent', 'vendor_staff', 'system')),
  actor_id         UUID,
  action           TEXT NOT NULL,          -- 'member.deactivated', 'file.shared_externally', ...
  resource_type    TEXT NOT NULL,
  resource_id      UUID,
  context          JSONB NOT NULL DEFAULT '{}',  -- IP, user agent, session, request ID
  occurred_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE retention_policies (        -- the sketch: Retention & Legal Hold gives the full
                                          -- shape of this table and the two below it
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
- **Tokens carry a member.** An app's token acts with the permissions of an installation and, for user OAuth, a member; when the member is deactivated their user tokens are revoked. AI agents get the same treatment in [AI Agents, Connectors & MCP](/books/workplace-and-collaboration/ai-agents-and-mcp).
- **Typed actors in the audit log.** An admin's action, an app's action, the vendor's support engineer's access and an automation's action are different `actor_type` values, never collapsed into "user" ([Typed Actors](/docs/architecture/audit-trails#typed-actors)).
- **Emit life-cycle events.** `member.joined`, `member.deactivated`, `account.claimed`, `container.shared_externally`, `item.created`, `item.deleted`, `grant.created`, `subscription.changed`, `legal_hold.placed` are what search, notifications, billing, the audit pipeline and customers' own integrations subscribe to ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

Each later chapter extends a defined part of this spine in its How to Build It. The table below is the map: the core tables a chapter changes (with the columns it adds) and the tables it owns. A table is created in exactly one chapter; every other chapter that needs it references it by this name.

| Chapter | Extends | Owns |
| --- | --- | --- |
| [The Collaboration Landscape](/books/workplace-and-collaboration/workplace-landscape#how-to-build-it) | `workspaces`, `plans` | `products`, `workspace_products`, `product_retirements` |
| [Business Models & Unit Economics](/books/workplace-and-collaboration/business-models#how-to-build-it) | `organizations` (+ `acquisition_channel`, `first_paid_at`), `subscriptions` | `arr_snapshots`, `arr_movements`, `net_dollar_retention` (view) |
| [Plans, Pricing & Seats](/books/workplace-and-collaboration/plans-pricing-and-seats#how-to-build-it) | `plans`, `subscriptions`, `seat_assignments` | `plan_prices`, `plan_entitlements`, `addons`, `subscription_addons`, `seat_activity`, `billing_credits`, `discount_programs`, `program_enrollments` |
| [Suites, Bundling & Antitrust](/books/workplace-and-collaboration/suites-bundling-and-antitrust#how-to-build-it) | `plans`, `products`, `plan_prices` | `plan_products`, `plan_alternatives`, `switch_windows` |
| [Tenants, Workspaces & Organizations](/books/workplace-and-collaboration/tenants-and-workspaces#how-to-build-it) | `workspaces` (+ `access_mode`, `shard_key`, `created_by_account_id`, `joined_organization_at`), `accounts` (+ `org_unit_id`) | `org_units`, `workspace_join_rules`, `tenant_moves`, `tenant_move_id_map` |
| [SSO, Domains & Managed Accounts](/books/workplace-and-collaboration/sso-and-managed-accounts#how-to-build-it) | `domains` (+ `verification_token`, `status`, `claimable_after` and others), `accounts` | `account_claims`, `sso_connections`, `authentication_policies`, `authentication_policy_members`, `account_sessions` |
| [Provisioning, SCIM & Offboarding](/books/workplace-and-collaboration/provisioning-and-scim#how-to-build-it) | `members` (+ `directory_connection_id`, `external_id`, `employee_number`, `manager_member_id`, `scim_etag`, `deactivation_source`), `groups` (+ `directory_connection_id`) | `directory_connections`, `scim_operations`, `offboarding_runs`, `ownership_transfers` |
| [Guests & Cross-Org Collaboration](/books/workplace-and-collaboration/guests-and-external-collaboration#how-to-build-it) | `members` (+ `guest_scope`, `guest_expires_at`, `home_organization_id`), `items` (+ `author_organization_id`) | `organization_trusts`, `container_organizations` |
| [Permissions & Sharing](/books/workplace-and-collaboration/permissions-and-sharing#how-to-build-it) | `containers` (+ `restricted`, `external_sharing`), `items` (+ `restricted`), `grants` (+ `effect`, `can_reshare`, `acl_revision`), `share_links` (+ `role`, `resource_key`, `disabled_at`) | `acl_revisions`, `access_index` |
| [Admin Consoles & Policies](/books/workplace-and-collaboration/admin-consoles-and-policies#how-to-build-it) | `members`, `audit_events` | `admin_roles`, `admin_role_assignments`, `admin_role_activations`, `admin_policies` (every per-scope setting and feature switch), `admin_policy_revisions` |
| [Data Residency & Sovereignty](/books/workplace-and-collaboration/data-residency-and-sovereignty#how-to-build-it) | `workspaces` (+ `data_region`, `backup_region`, `processing_in_region`, `residency_state`), `items` (+ `stored_regions`) | `residency_categories`, `region_moves` |
| [Channels, Threads & Direct Messages](/books/workplace-and-collaboration/workplace-chat#how-to-build-it) | `containers` (channel), `items` (message) | `channels`, `channel_memberships`, `messages`, `message_reactions`, `channel_pins`, `messaging_policies`, `messaging_policy_assignments` |
| [Chat at Scale](/books/workplace-and-collaboration/chat-architecture#how-to-build-it) | `channels`, `messages` | `channel_heads`, `channel_read_states`, `thread_read_states`, `capture_events` (the compliance feed archivers read) |
| [Notifications, Presence & Attention](/books/workplace-and-collaboration/notifications-and-attention#how-to-build-it) | `members` | `notification_preferences`, `quiet_schedules`, `dnd_states`, `presence_sessions`, `notification_deliveries` |
| [Email & Calendar](/books/workplace-and-collaboration/email-and-calendar#how-to-build-it) | `containers` (calendar), `items` (event) | `calendars`, `calendar_events`, `event_attendees`, `calendar_resources` (every bookable room and resource), `calendar_sync_cursors` |
| [Frontline & Deskless Workers](/books/workplace-and-collaboration/frontline-workers#how-to-build-it) | `members` (+ `seat_profile`, `pay_basis`) | `locations`, `shifts`, `shift_changes`, `time_punches`, `shared_device_sessions` |
| [Meetings & Video](/books/workplace-and-collaboration/meetings-and-video#how-to-build-it) | `containers` (meeting series) | `meeting_policies`, `meeting_policy_assignments`, `meetings`, `meeting_sessions`, `meeting_participants` |
| [Recordings, Transcripts & AI Notes](/books/workplace-and-collaboration/recordings-transcripts-and-ai-notes#how-to-build-it) | `items` (recording) | `recordings`, `transcripts`, `meeting_summaries`, `capture_consents`, `voice_profiles` |
| [Async Video & Screen Recording](/books/workplace-and-collaboration/async-video#how-to-build-it) | `recordings`, `item_versions` | `recording_upload_sessions`, `video_renditions`, `video_view_settings`, `video_view_daily`, `video_named_views` |
| [Business Phone & Contact Center](/books/workplace-and-collaboration/business-phone-and-contact-center#how-to-build-it) | `members`, `app_installations` | `pstn_connections`, `phone_numbers`, `number_ports`, `emergency_locations`, `network_locations`, `call_records` |
| [Rooms, Devices & the Hybrid Office](/books/workplace-and-collaboration/rooms-and-the-hybrid-office#how-to-build-it) | `members` (rooms as service members), `calendar_resources` | `places`, `place_bookings`, `room_devices`, `work_locations`, `visitor_visits`, `occupancy_daily` |
| [Docs & Wikis](/books/workplace-and-collaboration/docs-and-wikis#how-to-build-it) | `containers` (space), `items` (page) | `pages`, `page_blocks`, `page_templates`, `page_publications` |
| [Real-Time Co-Editing](/books/workplace-and-collaboration/real-time-collaboration#how-to-build-it) | `items`, `item_versions` | `doc_sessions`, `doc_ops`, `doc_rejected_ops` |
| [Files, Sync & Storage](/books/workplace-and-collaboration/files-and-sync#how-to-build-it) | `containers` (drive, shared drive), `items` (file), `item_versions` (+ `blocklist`, `content_hash`, `trim_state`, `expires_at` and others) | `files`, `file_blocks`, `file_journal`, `sync_cursors`, `storage_usage` |
| [Intranets & Knowledge Bases](/books/workplace-and-collaboration/intranets-and-knowledge#how-to-build-it) | `containers` (portal), `pages` | `audience_targets`, `announcements`, `announcement_acks`, `page_translations`, `content_verifications`, `search_answers` |
| [No-Code Databases & Internal Tools](/books/workplace-and-collaboration/no-code-databases-and-internal-tools#how-to-build-it) | `containers` (base), `items` (record), `connector_policies` | `nocode_tables`, `nocode_fields`, `nocode_records`, `nocode_links`, `nocode_automations` |
| [E-Signatures & Agreements](/books/workplace-and-collaboration/e-signatures-and-agreements#how-to-build-it) | `items` (agreement), `audit_events` | `agreement_templates`, `envelopes`, `envelope_recipients`, `envelope_events`, `agreement_terms` |
| [Work Items, Hierarchies & Fields](/books/workplace-and-collaboration/work-items-and-fields#how-to-build-it) | `containers` (project), `items` (work item) | `projects`, `project_key_aliases`, `work_item_types`, `work_items`, `work_item_key_aliases`, `work_item_fields`, `work_item_field_contexts`, `work_item_link_types`, `work_item_links` |
| [Workflows & Status Machines](/books/workplace-and-collaboration/workflows-and-states#how-to-build-it) | `work_items` (+ `resolution`, `resolved_at`, `workflow_version_id`) | `work_item_statuses`, `work_item_workflows`, `work_item_workflow_versions`, `work_item_workflow_statuses`, `work_item_transitions`, `work_item_transition_rules`, `work_item_workflow_schemes`, `work_item_status_changes` |
| [Queries, Views & Dashboards](/books/workplace-and-collaboration/queries-views-and-dashboards#how-to-build-it) | `work_items`, `grants` | `work_item_views`, `work_item_view_subscriptions`, `work_dashboards`, `work_dashboard_widgets` |
| [Boards, Sprints & Cycles](/books/workplace-and-collaboration/boards-sprints-and-cycles#how-to-build-it) | `containers` (board), `work_items` | `boards`, `board_columns`, `cycle_cadences`, `sprints`, `sprint_membership`, `work_item_estimate_changes`, `board_daily_snapshots` |
| [Portfolios, Roadmaps & Goals](/books/workplace-and-collaboration/portfolios-roadmaps-and-goals#how-to-build-it) | `projects` (+ `lead_member_id`, `start_on`, `target_on` and others) | `portfolios`, `portfolio_members`, `goals`, `goal_links`, `status_updates`, `update_cadences`, `capacity_allocations` |
| [Automation Rules](/books/workplace-and-collaboration/automation-rules#how-to-build-it) | `work_items`, `members` (rule actors are bots), `audit_events` | `automation_rules`, `automation_rule_versions`, `automation_runs`, `automation_run_steps`, `automation_usage` |
| [IT & Service Management](/books/workplace-and-collaboration/service-management#how-to-build-it) | `work_items` | `request_types`, `service_tickets`, `priority_rules`, `business_calendars`, `sla_policies`, `sla_clocks`, `sla_clock_events`, `change_approvals`, `config_items`, `config_item_relations`, `ticket_config_items` |
| [Development Collaboration](/books/workplace-and-collaboration/development-collaboration#how-to-build-it) | `work_items`, `app_installations` | `dev_connections`, `dev_objects`, `dev_links`, `dev_commands` |
| [Design Tools](/books/workplace-and-collaboration/design-tools#how-to-build-it) | `items` (design), `item_versions` (+ `checkpoint_kind`, `snapshot_uri`, `head_seq`) | `design_files`, `design_branches`, `design_sessions` |
| [Whiteboards & Diagrams](/books/workplace-and-collaboration/whiteboards-and-diagrams#how-to-build-it) | `design_files`, `item_versions` | `board_objects`, `board_connectors`, `board_votes`, `board_vote_ballots`, `board_templates` |
| [Design Systems & Handoff](/books/workplace-and-collaboration/design-systems-and-handoff#how-to-build-it) | `design_files`, `grants` | `design_libraries`, `library_releases`, `library_assets`, `library_subscriptions`, `library_usage_daily`, `design_tokens`, `design_token_values`, `code_connections`, `design_annotations`, `design_dev_status` |
| [Enterprise Search](/books/workplace-and-collaboration/enterprise-search#how-to-build-it) | `members`, `groups`, `items`, `grants` | `search_sources`, `search_identities`, `search_external_groups`, `search_external_group_members`, `search_documents`, `search_document_principals` (the index and ACL ledger AI retrieval reads), `search_sync_runs` |
| [Apps & Marketplaces](/books/workplace-and-collaboration/apps-and-marketplaces#how-to-build-it) | `apps` (+ `publisher_org_id`, `hosting`, `publisher_verified_at`, `suspended_at`), `app_installations` (+ `app_version_id`, `granted_scopes`, `consent_kind`, `request_id`, `revoked_at`) | `app_versions`, `app_listings`, `app_reviews`, `app_policies`, `app_install_requests` |
| [APIs, Events & Rate Limits](/books/workplace-and-collaboration/apis-webhooks-and-rate-limits#how-to-build-it) | `api_tokens`, `app_installations` | `event_subscriptions`, `event_deliveries`, `rate_limit_policies`, `api_terms_acceptances` |
| [Integration Platforms & Workflow Builders](/books/workplace-and-collaboration/integration-platforms#how-to-build-it) | `apps`, `api_tokens` | `integration_connections`, `integration_flows`, `integration_flow_versions`, `integration_flow_runs`, `connector_policies` |
| [AI Assistants Over Company Data](/books/workplace-and-collaboration/ai-assistants#how-to-build-it) | `items`, `grants`, `access_index`, `search_documents` (read, not copied) | `ai_policies`, `discovery_exclusions`, `ai_interactions`, `ai_interaction_sources` |
| [AI Agents, Connectors & MCP](/books/workplace-and-collaboration/ai-agents-and-mcp#how-to-build-it) | `members` (an agent is a bot member), `api_tokens` (+ `mcp_client_id`, `audience`, `agent_id`) | `agents`, `agent_tool_grants`, `mcp_clients`, `mcp_client_policies`, `agent_actions` |
| [Audit Logs](/books/workplace-and-collaboration/audit-logs#how-to-build-it) | `audit_events` (its full shape: typed actor, target, hash chain, `expires_at`) | `audit_actions`, `audit_streams`, `audit_retention_rules` |
| [Retention & Legal Hold](/books/workplace-and-collaboration/retention-and-legal-hold#how-to-build-it) | `retention_policies`, `legal_holds`, `hold_custodians` (their full shapes) | `retention_policy_targets`, `hold_containers`, `hold_notices`, `preserved_versions`, `disposition_runs` |
| [eDiscovery & Export](/books/workplace-and-collaboration/ediscovery-and-export#how-to-build-it) | `legal_holds` (+ `ediscovery_case_id`), `members` (+ `is_counsel`) | `ediscovery_cases`, `ediscovery_case_members`, `ediscovery_searches`, `ediscovery_exports`, `ediscovery_export_items`, `item_link_versions` |
| [DLP & Information Protection](/books/workplace-and-collaboration/dlp-and-information-protection#how-to-build-it) | `containers` (+ `sensitivity_label_id`, `default_item_label_id`) | `sensitivity_labels`, `item_labels`, `dlp_policies`, `dlp_rules`, `dlp_incidents` |
| [Encryption & Customer-Managed Keys](/books/workplace-and-collaboration/encryption-and-customer-keys#how-to-build-it) | `containers` (+ `encryption_mode`, `disabled_features`), `item_versions` (+ `key_binding_id`, `wrapped_dek`, `client_side`) | `customer_keys`, `key_bindings`, `key_use_events` |
| [Certifications & Procurement Assurance](/books/workplace-and-collaboration/compliance-certifications#how-to-build-it) | `workspaces` (+ `cloud_environment`, `compliance_profile`), `admin_policies` | `assurance_attestations`, `assurance_scopes`, `assurance_agreements`, `trust_document_requests` |
| [Regulated Communications & Archiving](/books/workplace-and-collaboration/regulated-communications#how-to-build-it) | `members` (+ `regulatory_role`, `recording_policy`), `capture_events`, `retention_policies` | `archive_connections`, `capture_cursors`, `capture_reconciliations`, `approved_channels`, `supervision_reviews` |
| [Employee Monitoring & Privacy](/books/workplace-and-collaboration/employee-monitoring-and-privacy#how-to-build-it) | `workspaces` (+ `analytics_identifiable`, `analytics_min_group_size`, `activity_detail_ttl`) | `monitoring_notices`, `monitoring_acknowledgments`, `monitoring_agreements`, `content_access_requests` |
| [Threats & Incidents](/books/workplace-and-collaboration/threats-and-incidents#how-to-build-it) | `app_installations` (+ `risk_level`, `disabled_at`, `last_used_at`), `api_tokens` (+ `bound_to`, `last_used_ip`, `revoked_reason`) | `security_contacts`, `security_alerts`, `security_incidents`, `incident_actions` |
| [Law Firms & Professional Services](/books/workplace-and-collaboration/law-firms-and-professional-services#how-to-build-it) | `containers` (matter) | `parties`, `clients`, `matters`, `timekeepers`, `timekeeper_rates` |
| [Matters, Intake & Conflicts](/books/workplace-and-collaboration/matters-intake-and-conflicts#how-to-build-it) | `matters`, `grants` (+ `screen_id`; walls are `effect = 'deny'` grants) | `party_relationships`, `party_names`, `matter_parties`, `intakes`, `conflict_checks`, `conflict_hits`, `conflict_resolutions`, `screens`, `screen_members`, `screen_certifications`, `engagement_letters`, `matter_closings` |
| [Trust Accounting & IOLTA](/books/workplace-and-collaboration/trust-accounting-iolta#how-to-build-it) | the Payments volume's `ledger_accounts` and `bank_accounts` | `trust_rules`, `trust_deposit_decisions`, `trust_transfers`, `trust_reconciliations` |
| [Time, Billing & E-Billing](/books/workplace-and-collaboration/time-billing-and-ledes#how-to-build-it) | `matters`, `timekeepers` | `utbms_codes`, `billing_arrangements`, `billing_guideline_rules`, `time_entries`, `time_entry_revisions`, `expense_entries`, `legal_invoices`, `legal_invoice_lines`, `ebilling_submissions`, `ebilling_adjustments` |
| [Legal Documents, DMS & AI](/books/workplace-and-collaboration/legal-documents-and-ai#how-to-build-it) | `items` (file), `matters` | `document_profiles`, `email_filings`, `privilege_designations`, `ai_tools`, `ai_client_permissions`, `ai_citation_checks` |
| [Building It Yourself](/books/workplace-and-collaboration/collaboration-architecture#how-to-build-it) | every table, by placement | `cells`, `shards`, `workspace_placements`, `placement_moves`, `shared_container_hosts`, `outbox_events` |
| [Desktop & Mobile Clients](/books/workplace-and-collaboration/desktop-and-mobile-clients#how-to-build-it) | `accounts`, `members` | `client_releases`, `client_version_floors`, `workspace_client_policies`, `client_installs` (push tokens live here), `client_install_workspaces` |
| [Reliability, Outages & SLAs](/books/workplace-and-collaboration/reliability-and-outages#how-to-build-it) | `workspaces`, `subscriptions` | `service_incidents`, `incident_impacts`, `incident_updates`, `maintenance_notices`, `sla_terms`, `sla_credits`, `workspace_restores` |
| [Billing, Seats & Resellers](/books/workplace-and-collaboration/billing-and-seat-management#how-to-build-it) | `subscriptions` (+ `term_start`, `term_end`, `count_method`, `committed_seats`, `coterm_group_id`, `channel` and others), `seat_assignments`, `billing_credits` | `billing_parties`, `seat_changes`, `true_ups`, `purchase_orders`, `invoices`, `invoice_lines` |
| [From Self-Serve to Enterprise](/books/workplace-and-collaboration/selling-to-enterprises#how-to-build-it) | `organizations`, `domains` | `domain_rollups`, `expansion_signals`, `procurement_reviews`, `agreements` |
| [Migrations, Imports & Switching](/books/workplace-and-collaboration/migrations-and-switching#how-to-build-it) | `containers` (+ `migration_state`, `history_starts_at`), `items` (+ `imported_from`, `source_id`) | `import_jobs`, `import_id_map`, `tenant_exports`, `switching_requests` |
| [Accessibility & Localization](/books/workplace-and-collaboration/accessibility-and-localization#how-to-build-it) | `members` (+ `locale`, `time_zone`), `products` | `conformance_reports`, `conformance_results`, `workspace_language_settings`, `admin_text_translations` |
| [Workplace Metrics](/books/workplace-and-collaboration/workplace-metrics#how-to-build-it) | `seat_assignments`, `arr_snapshots` | `metric_definitions`, `member_daily_activity`, `workspace_report_settings`, `license_reclaim_candidates` |

The kind lists in the sketch are the starting set. Chapters add kinds rather than tables: `containers.kind` gains `calendar` ([Email & Calendar](/books/workplace-and-collaboration/email-and-calendar#how-to-build-it)), `shared_drive` ([Files, Sync & Storage](/books/workplace-and-collaboration/files-and-sync#how-to-build-it)), `portal` ([Intranets & Knowledge Bases](/books/workplace-and-collaboration/intranets-and-knowledge#how-to-build-it)) and `base` ([No-Code Databases & Internal Tools](/books/workplace-and-collaboration/no-code-databases-and-internal-tools#how-to-build-it)); `items.kind` gains `event`, `record` and `agreement` from the same chapters and [E-Signatures & Agreements](/books/workplace-and-collaboration/e-signatures-and-agreements#how-to-build-it).

Three decisions keep the map one model rather than several:

- **Names that look alike are different records.** `invoices` are the vendor's invoices to a customer ([Billing, Seats & Resellers](/books/workplace-and-collaboration/billing-and-seat-management)); `legal_invoices` are a law firm's bills to its client ([Time, Billing & E-Billing](/books/workplace-and-collaboration/time-billing-and-ledes)). `calendar_events` are meetings on a calendar; `audit_events`, `capture_events` and the outbox's events are records of things that happened. `integration_flows` are an integration platform's flows, `automation_rules` are in-product rules, and the workflows in [Workflows & Status Machines](/books/workplace-and-collaboration/workflows-and-states) (`work_item_workflows`) are status machines on work items. `assurance_agreements` (a BAA or DPA the vendor signs), `agreements` (the enterprise contract set in [From Self-Serve to Enterprise](/books/workplace-and-collaboration/selling-to-enterprises)) and `envelopes` (anything sent for signature) are three records; `trust_document_requests` is a trust-center request, unrelated to the law firm's `trust_*` money tables.
- **One concept, one table, reused.** Every piece of content is an `items` row with a kind table beside it, so a hold, a retention run, a DLP match, a search document and an AI citation all point at `items.id` (or `item_versions.id` for a specific revision). Every permission is a `grants` row or derives from container membership, so search, AI retrieval and exports trim by the same check: deny grants serve both [Permissions & Sharing](/books/workplace-and-collaboration/permissions-and-sharing)'s exclusions and the law firm's ethical walls, AI retrieval reads the same audiences search does (`access_index` for native content, `search_document_principals` for connected sources), `calendar_resources` is the one bookable-resource record for calendars and rooms, and `admin_policies` holds every per-scope setting, including the feature switches a compliance profile checks.
- **Organizations own policy; workspaces own content.** Retention policies, holds, admin roles, keys and audit live on the organization with an optional workspace or container scope, so an enterprise sets one policy for fifty workspaces and a small customer never notices the difference.

## Auditing

The records in this chapter are the ones customers, auditors, courts and regulators ask about later:

- **Who could get in, and who let them.** Every member joined, invited, claimed, changed role, deactivated and reactivated, with the actor; every domain verified; every guest and external connection approved.
- **Who could see what.** Every grant and share link created, changed and revoked, and every container's visibility change, so an oversharing incident can be dated and scoped.
- **What was kept and why.** Every retention policy with its effective date, every hold placed and released with its custodians, and every purge run with what it skipped because of a hold.
- **What the customer bought.** Every subscription change with its seat quantity, price and term, and every seat assignment, so a true-up, a credit or a renewal dispute reads from rows.
- **What acted on the customer's behalf.** Every app installed and approved, every token issued and revoked, every vendor support access to the tenant.

The mechanics (typed actors, append-only history, logging access as well as changes) are in [Audit Trails](/docs/architecture/audit-trails); the product side is [Audit Logs](/books/workplace-and-collaboration/audit-logs).

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
