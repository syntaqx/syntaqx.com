+++
title = "From Self-Serve to Enterprise"
description = "How collaboration products go from a free team to an enterprise contract: domain claiming, expansion signals, sales assist, procurement, enterprise asks."
category = "Workplace & Collaboration Industry"
order = 2064
part = "Running the Platform"
tags = ["enterprise-sales", "product-led-growth", "procurement", "security-reviews", "contracts"]
nav_title = "Self-Serve to Enterprise"
+++

Most collaboration products are adopted before they are bought. A team signs up with work email addresses, invites colleagues, connects a calendar or a repository, and pays with a manager's card. Months later the company discovers it has forty workspaces of the same product, each with its own admin, retention settings and guests, and either consolidates them under a contract or bans the product. The vendor's job is to make the first path the likely one: to turn bottom-up adoption into an organization the vendor can sell to, and an IT department that wants to own the product rather than fight it.

The inversion that runs through this book shows up as a sale. Self-serve customers are teams; enterprise customers are the controller of everyone's data, and they buy the controls that let them act as one: identity, provisioning, audit, retention, keys, residency and a contract that says what the vendor may do with the data. This chapter covers the funnel from signup to enterprise, how domain verification and account claiming turn scattered workspaces into one organization, the signals that tell a vendor which accounts are ready for sales, what procurement asks for and the documents it reviews, and why the enterprise feature list is the same at every vendor. It adds expansion signals, procurement reviews and agreements to the core data model. Plan design is in Plans, Pricing & Seats and unit economics in Business Models & Unit Economics; this chapter is the motion between them.

## How the Platforms Do It

| Vendor | Bottom-up path, from public sources | How the org takes control | Enterprise tier carries, as of October 2026 |
| --- | --- | --- | --- |
| **Slack** | Self-service free and paid plans "driven largely by word-of-mouth"; direct sales and customer success added from 2016; in-product upgrade prompts | Domain claiming on Enterprise+; Enterprise Grid consolidates workspaces | Multiple SAML configurations, EKM (add-on), Audit Logs API, legal holds, information barriers, Discovery API, HIPAA support, custom terms of service, granular roles, domain claiming |
| **Atlassian** | Self-serve cloud plans with published per-user prices and tiers | Verify a domain (HTML file, DNS TXT, or by connecting Google Workspace or Microsoft Entra ID), then claim all accounts on it, or some by CSV of up to 10,000 addresses | Atlassian Guard for policies on managed accounts (two-step verification, SAML SSO); Enterprise SLA of 99.95% |
| **Microsoft 365, Google Workspace** | Sold to IT from the start; trials and self-serve for small businesses | The tenant or customer account is the organization from day one | Suite tiers that add compliance, security and admin features |

The patterns:

- **Product-led vendors add sales; they don't replace self-serve.** Slack's S-1 describes a self-service model for both free and paid plans, plus a direct sales force and customer success staff "focused on adoption and expansion" since 2016. The two motions coexist: self-serve brings in teams, sales consolidates them.
- **Domain ownership is the hinge.** A verified email domain is what lets an organization say "these accounts are ours," and every product-led vendor uses it to convert scattered usage into a managed organization.
- **The enterprise tier is a governance bundle.** Slack's Enterprise+ list and Atlassian Guard read like the table of contents of Parts 2 and 9 of this book. Customers buy them because they are the controller of employee data and need the tools to act like it.

## The Funnel, With Numbers From One Filing

The clearest public picture of a collaboration funnel is Slack's 2019 S-1. As of January 31, 2019: more than 600,000 organizations with three or more users on Slack, more than 88,000 paid customers (up from 59,000 a year earlier and 37,000 two years earlier), 575 paid customers above $100,000 of annual recurring revenue (298 and 135 in the prior two years), and those 575 accounted for approximately 40% of revenue in fiscal 2019. Daily active users exceeded 10 million. The net dollar retention rate was 143%, down from 152% and 171%.

The shape is the point. The free base is broad (about one paid customer per seven organizations); paid customers are many and small; a few hundred large customers pay for a large share of revenue and grow fastest. The vendor's work is moving accounts up that ladder, and the definitions the filing uses are the ones a vendor's own systems need: an organization counts at three or more users; a paid customer has three or more users on a paid plan; a daily active user created or consumed content in a 24-hour period. [Workplace Metrics](/books/workplace-and-collaboration/workplace-metrics) covers these metrics and what they miss.

The stages, and what moves an account between them:

1. **Signup and activation.** A team creates a workspace and reaches the point where it works for them: enough members, a few channels or projects, an integration. Activation definitions are product-specific and belong in the vendor's metrics catalog.
2. **Team paid.** A limit (history, integrations, guests, storage) or a feature (SSO for a small company, admin controls) converts the team. Slack lists in-product prompts and notifications, feature recommendations and support as the upgrade drivers.
3. **Spread.** More teams at the same company adopt, often in separate workspaces, each paying separately.
4. **Organization.** IT notices, verifies the domain, claims accounts, and consolidates workspaces under one admin, usually on a higher tier.
5. **Enterprise contract.** A negotiated agreement with procurement, legal and security review, annual or multi-year terms, invoicing and the enterprise feature set.

## Domain Capture and Admin Claiming

The mechanism that turns stage 3 into stage 4 is domain verification followed by account claiming, and the vendors have converged on it.

Atlassian's version is typical. An admin proves ownership of a domain by uploading an HTML file to the domain's web server, adding a DNS TXT record, or connecting Google Workspace or Microsoft Entra ID (which verifies their domains automatically). Verification lets the organization "prove that you own all user accounts with that domain." The admin then claims accounts: all of them, including new accounts as they're created, or a subset by CSV (up to 10,000 addresses, 5 MB per file), after optionally exporting the list to review. Claimed accounts become managed accounts the admin can edit, deactivate or delete, and Atlassian Guard applies security policies to them. Users are told: an in-app notification and a note in account settings that the organization manages their account. Accounts already claimed by another Atlassian organization can't be claimed. Slack lists domain claiming among its Enterprise+ admin controls.

What claiming does to the user is the delicate part. People signed up with a work address, but they may think of the account as theirs, and it may contain personal workspaces or content. The vendor sets the rules for what the claiming org gets (control of the identity, sign-in policy, deactivation) and what it doesn't (content in workspaces the org doesn't own). SSO, Domains & Managed Accounts covers the identity side, including consumer-account conflicts; Tenants, Workspaces & Organizations covers consolidating workspaces.

For the vendor's sales motion, a verified domain is also the unit of account: all usage on a domain rolls up to one prospective organization, whether or not anyone has claimed it yet.

## Expansion Signals and Sales Assist

A product-led vendor has thousands of paying teams and a sales force that can talk to a few hundred. The selection is made from product data: usage that suggests an account is ready for an organization-level conversation. The industry calls such accounts product-qualified leads; the term is marketing vocabulary, but the mechanics are concrete:

- **Domain roll-up.** Many workspaces, members or paying teams on one corporate domain.
- **Breadth.** Members across several departments or locations, or a high share of a company's estimated headcount.
- **Governance pain.** Admins asking for SSO, audit logs, data exports, or retention; searches in the help center for these features; a security questionnaire request.
- **Limits.** Teams repeatedly hitting plan limits (history, guests, storage, automation runs).
- **External signals.** Company size from the domain, and existing customers' integrations with the domain.

The privacy line matters here. Signals derived from customer content (what people write in messages or documents) are off limits; signals from account metadata and product usage are what the vendor's terms and privacy notice allow it to process, and the customer's DPA may narrow that further. A vendor's sales tooling should read from a metrics layer built for that purpose, not from production content stores. [Product Analytics](/docs/telemetry/product-analytics) and [Consent and Privacy](/docs/telemetry/consent-and-privacy) cover the generic rules.

Sales assist is the step between self-serve and enterprise sales: a person who helps a growing account through an upgrade, a consolidation or a security review, without a full enterprise sales cycle. The handoff rules must be explicit: when an account is assigned to a seller, self-serve upgrades still work, and the customer never loses the ability to buy online because someone in sales owns the account.

## What Procurement Asks For

Enterprise purchases go through a process the buyer runs, with security, legal, privacy and finance each holding a veto. The asks are predictable:

- **Security review.** A questionnaire or an assessment. The Cloud Security Alliance's CAIQ (v4.1, released January 27, 2026) is a set of yes/no questions that "offers an industry-accepted way to document what security controls exist in IaaS, PaaS, and SaaS services," mapped to the Cloud Controls Matrix and used for submissions to the STAR Registry; the Shared Assessments SIG is the other common standard questionnaire. Buyers also ask for SOC 2 Type II reports, ISO 27001 certificates and penetration test summaries. Certifications & Procurement Assurance covers the certifications; [SOC 2](/docs/compliance/soc-2) the generic program.
- **Trust center.** Vendors publish their reports, policies and subprocessor lists behind a light gate (an NDA click-through), so the security reviewer can self-serve most of the questionnaire.
- **Data processing agreement.** The customer is the controller; the vendor processes on its instructions. Slack's DPA "reflects our requirements as a processor of Customer Data" and supplements the customer terms, executed by an authorized signer. DPAs fix subprocessor notice, international transfer mechanisms, security commitments, incident notification and deletion at termination ([GDPR](/docs/compliance/gdpr)).
- **Master agreement and order form.** The MSA carries the legal terms (liability caps, indemnities, warranties, governing law); the order form carries the commercial ones (products, quantities, prices, term, payment terms, renewal, true-up). Negotiated SLAs live here, which is why public SLA pages are a floor ([Reliability, Outages & SLAs](/books/workplace-and-collaboration/reliability-and-outages#how-the-platforms-do-it)).
- **Accessibility conformance.** Public-sector and many large buyers require an accessibility conformance report ([Accessibility & Localization](/books/workplace-and-collaboration/accessibility-and-localization#vpats-and-conformance-reports)).
- **Vendor onboarding.** Supplier registration, tax forms, insurance certificates, and banking details in the buyer's procurement system, before the first invoice can be paid ([Invoices, Purchase Orders and Payment Terms](/books/workplace-and-collaboration/billing-and-seat-management#invoices-purchase-orders-and-payment-terms)).

My rule for a vendor: every document a buyer asks for twice becomes a self-serve artifact. A standard DPA anyone can sign online, a trust center with current reports, a pre-filled CAIQ, a published subprocessor list with change notifications, and an order form template. A sales cycle measured in weeks is mostly the time each of these takes to arrive.

## The Enterprise Asks Are the Roadmap

Ask enterprise buyers what they need from a collaboration product and the list is nearly identical across vendors, because it follows from what the customer must be able to do as controller of its employees' data:

| Ask | Why the customer needs it | Covered in |
| --- | --- | --- |
| SSO and managed accounts | One identity, one sign-in policy, one off switch | SSO, Domains & Managed Accounts |
| SCIM provisioning | Joiners, movers and leavers driven by HR and the directory | Provisioning, SCIM & Offboarding |
| Admin roles and policies | Delegated administration, external sharing and app controls | Admin Consoles & Policies |
| Audit logs and an API | Investigations, SIEM, evidence for auditors | Audit Logs |
| Retention, legal hold, eDiscovery | Legal duties to preserve and produce | Retention & Legal Hold; eDiscovery & Export |
| DLP and information barriers | Regulated data and conflicts of interest | DLP & Information Protection |
| Customer-managed keys | Control over the vendor's access to content | Encryption & Customer-Managed Keys |
| Data residency | Contractual and regulatory location commitments | Data Residency & Sovereignty |
| SLA, support tiers, named contacts | Operational dependency on the product | [Reliability, Outages & SLAs](/books/workplace-and-collaboration/reliability-and-outages) |
| Invoicing, POs, consolidated billing | Procurement and finance processes | [Billing, Seats & Resellers](/books/workplace-and-collaboration/billing-and-seat-management) |
| Accessibility conformance | Procurement law and policy | [Accessibility & Localization](/books/workplace-and-collaboration/accessibility-and-localization) |
| Migration and export | A way in and a way out | [Migrations, Imports & Switching](/books/workplace-and-collaboration/migrations-and-switching) |

Two consequences for a vendor's product plan. First, these features are cheapest when the architecture assumes them from the start: `workspace_id` everywhere, an audit event for every change, a permission service that search and AI also use, retention that reaches caches and indexes ([Building It Yourself](/books/workplace-and-collaboration/collaboration-architecture)). Retrofitting audit logs or residency into a product that never planned for them is a multi-year project. Second, gating them by tier is a pricing decision with a public cost: the "SSO tax" criticism is about exactly this list, and Plans, Pricing & Seats covers how vendors have responded.

## How to Build It

The core tables (`organizations`, `workspaces`, `domains`, `subscriptions`) are fixed. This chapter adds the vendor's view of a prospective organization: signals rolled up by domain, procurement reviews and the agreements that govern a customer.

```sql
CREATE TABLE domain_rollups (               -- usage on one corporate domain, claimed or not
  domain             TEXT PRIMARY KEY,      -- 'example.com', lowercased
  organization_id    UUID REFERENCES organizations (id),  -- once the org verifies it
  workspaces_count   INT NOT NULL,
  members_count      INT NOT NULL,
  paying_workspaces  INT NOT NULL,
  monthly_spend      BIGINT NOT NULL,       -- minor units, across paying workspaces
  admins_count       INT NOT NULL,
  computed_at        TIMESTAMPTZ NOT NULL
);

CREATE TABLE expansion_signals (            -- metadata and usage only, never content
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  domain         TEXT NOT NULL REFERENCES domain_rollups (domain),
  workspace_id   UUID REFERENCES workspaces (id),
  kind           TEXT NOT NULL CHECK (kind IN ('workspace_spread', 'plan_limit_hit',
                   'governance_feature_interest', 'security_review_request',
                   'admin_count_growth', 'seat_growth')),
  detail         JSONB NOT NULL,            -- {"limit": "message_history"}
  observed_at    TIMESTAMPTZ NOT NULL
);

CREATE TABLE procurement_reviews (          -- one buyer's review of the vendor
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID REFERENCES organizations (id),
  domain           TEXT,                    -- before an organization exists
  kind             TEXT NOT NULL CHECK (kind IN ('security_questionnaire',
                     'privacy_review', 'accessibility_review', 'legal_review',
                     'vendor_onboarding')),
  format           TEXT,                    -- 'caiq', 'sig', 'custom'
  opened_at        TIMESTAMPTZ NOT NULL,
  due_at           TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  artifacts_shared TEXT[] NOT NULL DEFAULT '{}',  -- 'soc2_type2_2026', 'acr_2026_09'
  open_items       JSONB NOT NULL DEFAULT '[]'    -- answers needing engineering input
);

CREATE TABLE agreements (                   -- the documents that govern a customer
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  kind             TEXT NOT NULL CHECK (kind IN ('msa', 'online_terms', 'dpa',
                     'order_form', 'baa', 'sla_addendum', 'nda')),
  version          TEXT NOT NULL,           -- the vendor template version, or 'negotiated'
  negotiated       BOOLEAN NOT NULL DEFAULT FALSE,
  signed_at        TIMESTAMPTZ,
  effective_during DATERANGE NOT NULL,
  supersedes_id    UUID REFERENCES agreements (id),
  document_ref     TEXT NOT NULL,           -- stored signed copy
  commitments      JSONB NOT NULL DEFAULT '{}'  -- machine-readable terms the product
                                              -- must honor: {"residency": "eu",
                                              -- "breach_notice_hours": 48,
                                              -- "subprocessor_notice_days": 30}
);
```

Notes on the sketch:

- **Signals never read content.** `expansion_signals` is fed from metering, admin actions and plan-limit events, never from messages, pages or files; the job that writes it runs against the metrics layer, so a DPA that limits processing doesn't need a carve-out for sales.
- **The domain is the account before the organization exists.** Roll-ups are keyed by domain; when the organization verifies the domain (the core `domains` row), `organization_id` is set and history carries over.
- **Agreements carry commitments the product enforces.** A negotiated DPA's subprocessor notice period, a residency commitment, a breach notification clock or a custom SLA are stored as data in `commitments` and read by the systems that must honor them: residency placement ([Building It Yourself](/books/workplace-and-collaboration/collaboration-architecture#how-to-build-it)), incident notification, the subprocessor change process. A commitment that lives only in a PDF will be broken by someone who never read it.
- **Reviews are tracked like support tickets.** `open_items` are routed to the engineers who can answer them, and completed answers feed the self-serve trust center so the next buyer doesn't ask.
- **Self-serve keeps working.** An organization with a sales owner can still upgrade online; the sales system records ownership, it doesn't remove the checkout.

## Auditing

- **Every account claim and domain verification,** with the method, the admin and the accounts claimed, because claiming changes who controls a person's identity.
- **Every agreement version in force** for each customer, with what it superseded, so any question about obligations has a dated answer.
- **Every security and privacy artifact shared,** with the version and the recipient under NDA.
- **Access to expansion data,** to show that sales tooling reads metadata, not content.

## What This Means for the System You Build

- **Keep self-serve and sales running together;** a seller owning an account never disables online purchase.
- **Make domain verification and account claiming first-class,** with clear rules for what the claiming organization controls and how users are told.
- **Roll usage up by domain** before an organization exists, and derive expansion signals from metadata and usage only.
- **Turn every repeated procurement request into a self-serve artifact:** trust center, standard DPA, pre-filled CAIQ, subprocessor list, ACR.
- **Store agreement commitments as data** that the product's systems read and enforce.
- **Build the enterprise asks into the architecture early;** they are the same list at every vendor.

## References

**Filings**

- [Slack Technologies: Form S-1 (April 26, 2019)](https://www.sec.gov/Archives/edgar/data/1764925/000162828019004786/slacks-1.htm), organizations, paid customers, customers above $100,000 ARR and their share of revenue, DAU, net dollar retention, definitions, the self-service model and the sales force added from 2016

**Vendor documentation**

- [Atlassian Support: Verify a domain to manage accounts](https://support.atlassian.com/user-management/docs/verify-a-domain-to-manage-accounts/), verification methods, claiming all or some accounts, CSV limits, user notifications and Guard policies
- [Atlassian: Service Level Agreement](https://www.atlassian.com/legal/sla), the Enterprise 99.95% commitment
- [Slack: Enterprise plans](https://slack.com/pricing/enterprise), Enterprise+ features including multiple SAML configurations, EKM, audit logs, legal holds, information barriers, Discovery API, HIPAA support and domain claiming
- [Slack: Data Processing Addendum](https://slack.com/terms-of-service/data-processing), Slack as processor and execution of the addendum

**Standards**

- [Cloud Security Alliance: STAR Level 1 Security Questionnaire (CAIQ v4.1)](https://cloudsecurityalliance.org/artifacts/star-level-1-security-questionnaire-caiq-v4), the questionnaire's purpose, CCM mapping, STAR Registry use and the January 27, 2026 release
