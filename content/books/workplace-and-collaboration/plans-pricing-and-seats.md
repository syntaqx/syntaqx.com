+++
title = "Plans, Pricing & Seats"
description = "Tier ladders and feature gates, the SSO tax, what counts as a seat at each vendor, terms, nonprofit and education plans, and how AI pricing moved into plans."
category = "Workplace & Collaboration Industry"
order = 2004
part = "The Business"
tags = ["pricing", "plans", "seats", "billing", "saas"]
+++

A workplace plan is a ladder of tiers, each a price per seat per month and a set of features and limits, sold on monthly or annual terms. The ladder looks the same everywhere: free, a team tier, a business tier, an enterprise tier priced by quote. What isn't the same is what a seat is. Slack charges for members active in the last 28 days and credits the rest; Atlassian charges for every user granted access, including invitations nobody accepted; Figma charges by what the person does (designing, developing, commenting); Microsoft lets a partner remove a license only within seven days of adding it. Each definition is a product decision with a billing system behind it, and most disputes between a customer and a vendor are about which one applies.

Pricing is also where the inversion shows up in money. The features an enterprise admin needs to control the product (SAML single sign-on, SCIM provisioning, audit logs, retention, legal holds, data residency, customer-managed keys) sit on the top tiers, so the price of the admin's control is the price of the plan. This chapter covers the tier ladders and feature gates, the SSO tax, seat definitions across vendors, terms and commitments, discount programs, and how AI pricing moved from add-ons into plans, as of October 2026. The billing engine is Billing, Seats & Resellers and, for metering and rating, the Hosting & Cloud volume's [Metering & Rating](/books/hosting-and-cloud/metering-and-rating); renewal law is [Auto-Renewal & Cancellation Law](/books/commerce/auto-renewal-law).

## How the Platforms Do It

| Vendor | Tiers and list prices per user per month, as of October 2026 | What a seat is | Terms |
| --- | --- | --- | --- |
| **Slack** | Free; Pro $7.25 annual or $8.75 monthly; Business+ $15 or $18; Enterprise+ by quote | A member active in the last 28 days; single-channel guests and bots free | Monthly or annual, prorated ([Slack: pricing](https://slack.com/pricing), [fair billing](https://slack.com/help/articles/218915077-Slacks-fair-billing-policy)) |
| **Atlassian (Jira)** | Free for 10 users; Standard and Premium priced per user with progressive tiers; Enterprise by quote | A user granted product access, including unaccepted invitations | Monthly at the peak count, or annual by user tier for 12 or 24 months ([Jira pricing](https://www.atlassian.com/software/jira/pricing), [cloud licensing](https://www.atlassian.com/licensing/cloud)) |
| **Microsoft 365** | E3 $39, E5 $60, E7 $99 paid yearly; Teams Enterprise $8.55; Copilot add-on $30 | A license assigned to a user | Monthly, annual or three-year through partners; reductions only in the first seven days ([Microsoft 365 plans](https://www.microsoft.com/en-us/microsoft-365/enterprise/microsoft365-plans-and-pricing), [Microsoft Learn](https://learn.microsoft.com/en-us/partner-center/customers/create-a-new-subscription)) |
| **Google Workspace** | Business Starter $7, Standard $14, Plus $22; Enterprise by quote; Business editions up to 300 users | A user account in the organization | Flexible monthly or a one-year commitment ([Google Workspace: pricing](https://workspace.google.com/pricing)) |
| **Figma** | Professional: Full $16, Dev $12, Collab $3; Organization and Enterprise higher, billed annually; viewers free | A seat type per person, approved by an admin | Professional monthly or annual; Organization and Enterprise annual, mid-term seats invoiced quarterly ([Figma: pricing](https://www.figma.com/pricing/)) |
| **Zoom** | Basic free; Pro $14.16 annual or $16.99 monthly; Business $18.33 or $21.99; Enterprise by quote | A licensed user | Monthly or annual ([Zoom: pricing](https://zoom.us/pricing)) |
| **Notion** | Free; Plus $10; Business $20; Enterprise by quote; up to 20% off yearly | A member; guests separate | Monthly or yearly ([Notion: pricing](https://www.notion.com/pricing)) |
| **monday.com** | Free up to 2 seats; Basic $9, Standard $12, Pro $19 annual; Enterprise by quote | A seat, with plans from 3 users | Monthly undiscounted, yearly 18% less ([monday.com: pricing](https://monday.com/pricing)) |
| **Zulip** | Cloud Standard $6.67 annual or $8 monthly, Plus $10 or $12 with a 10-user minimum; self-hosted free | A user | Monthly or annual ([Zulip: plans](https://zulip.com/plans/)) |

The prices are list prices on the vendors' public pages; large customers negotiate, and every vendor discounts multi-year and high-volume deals. What the table is for is the shape: each vendor has a free tier to land, a team tier on a card, a business tier with the first admin controls, and an enterprise tier where the rest of the controls live and the price is a conversation.

## Tier Ladders and Feature Gates

A tier ladder gates three kinds of things, and they behave differently:

- **Limits** (history, storage, users, meetings length, integrations, automation runs): Slack's free plan shows 90 days of history ([Slack: pricing](https://slack.com/pricing)); Zoom's Basic plan stops meetings at 40 minutes and Pro allows 30 hours ([Zoom: pricing](https://zoom.us/pricing)); Jira's free plan stops at 10 users and a site that stays over it is moved to Standard after seven days ([Atlassian: cloud licensing](https://www.atlassian.com/licensing/cloud)). Limits are enforced continuously and need a defined behavior at the edge (block, warn, degrade, upgrade).
- **Features** (guest accounts, workflow builders, shared channels with other companies, advanced permissions): a flag that is on or off per plan, checked at use.
- **Controls** (SSO, SCIM, audit logs, retention, legal holds, DLP, data residency, customer keys): features for the admin rather than the user. Slack lists SAML SSO on Business+ with support for multiple identity providers, and multiple SAML configurations, SCIM, EMM, native DLP and Enterprise Key Management on Enterprise+ ([Slack: pricing](https://slack.com/pricing)); Notion offers SAML SSO from Business and SCIM only on Enterprise ([Notion: pricing](https://www.notion.com/pricing)); Zulip Cloud puts SAML and SCIM on Plus ([Zulip: plans](https://zulip.com/plans/)).

A downgrade has to say what happens to things that exist beyond the new plan's limits: messages older than the history window (Slack's pricing page says upgrading a free workspace restores access to the previous 12 months ([Slack: pricing](https://slack.com/pricing)), so older history is held back, not gone), guests beyond the guest limit, automations beyond the run quota, a SAML configuration that the lower plan doesn't include. My rule is that a downgrade never deletes customer data; it hides, disables or locks, and an upgrade restores. Deletion follows retention policies and termination, nothing else.

## The SSO Tax

The SSO tax is the price difference between a vendor's base paid tier and the tier that includes single sign-on. A community-maintained site, the SSO Wall of Shame at sso.tax, lists vendors that gate SSO behind a premium tier or a quote, measuring each as the percentage increase from the lowest paid team tier to the cheapest plan with SSO, and argues that "Security shouldn't be a premium feature" ([sso.tax](https://sso.tax/)). The practice is visible in this chapter's table: on Slack's current list prices, SAML costs $15 a user a month annually against Pro's $7.25 ([Slack: pricing](https://slack.com/pricing)); on Notion's, $20 against Plus's $10 ([Notion: pricing](https://www.notion.com/pricing)).

The vendors' case for it is that SSO buyers are organizations with IT departments, larger deals and higher support costs, and that the business tier bundles SSO with other admin features those buyers need. The customer's case against it is that SSO is the control that lets an employer cut off a departed employee in one place, and that pricing it high leaves small companies with weaker security. Both are true; the design consequence is that SSO and SCIM are plan entitlements checked like any other gate, and that turning them off on downgrade must not lock the organization out (a downgrade that removes SAML has to leave a working password or email-link path for the owners). SSO, Domains & Managed Accounts covers the mechanics.

## What Counts as a Seat

The definitions, side by side:

**Active members (Slack).** Slack's fair billing policy bills members who are active; a member is inactive after more than 28 days without using Slack, or immediately when an owner or admin deactivates them, and Slack credits the unused part of the period, prorated by day. In Slack's own example, a $8.75 member deactivated with 15 days left in a 30-day month yields a $4.38 credit. Credits apply to future charges, have no cash value and expire with the paid plan; a member who becomes active again is charged the prorated remainder. Paid seats are owners, admins, full members and multi-channel guests; single-channel guests and bots are free; a member becomes billable the day they accept an invitation. The policy covers plans bought on Slack's website by card or self-serve invoice ([Slack: fair billing](https://slack.com/help/articles/218915077-Slacks-fair-billing-policy)).

**Users with access (Atlassian).** Atlassian counts a user "toward billing once product access is granted," including invited users who haven't accepted, and stops counting only when the user is deactivated, deleted or removed from a synced directory. Monthly subscriptions use Maximum Quantity Billing: the bill is for the highest seat count at any point in the cycle, seats added mid-cycle are prorated, and seats removed mid-cycle don't lower that cycle's bill. Monthly prices are progressive: Atlassian's own example for Jira Standard with 450 seats charges $8.60 each for the first 100, $7.30 for the next 150 and $6.10 for the rest, about $7.06 on average. Annual subscriptions are sold by user tier for 12 or 24 months (the 24-month price is double the annual), and adding seats mid-term needs a prorated upgrade quote. A trusted user on a site with Jira, Confluence and Jira Service Management counts once for each product ([Atlassian: cloud licensing](https://www.atlassian.com/licensing/cloud)).

**Seat types by role (Figma).** Figma prices by what a person does: a Full seat for design and every product, a Dev seat for developers inspecting designs, a Collab seat for whiteboards, slides and comments, and free view access that lets others view and comment without a seat. On Professional they are $16, $12 and $3 a month; on Organization $55, $25 and $5 and on Enterprise $90, $35 and $5, billed annually. On Organization and Enterprise, admins must approve new seats that cost money; approved seats are added to the next invoice prorated through the end of the annual term, and new mid-term seats are invoiced quarterly. On Professional, seats added mid-year are billed monthly from the approval date ([Figma: pricing](https://www.figma.com/pricing/)).

**Licenses with a reduction window (Microsoft).** Under Microsoft's new commerce experience, through which all license-based CSP purchases have been made since September 1, 2024, subscriptions run on monthly, annual or three-year terms with monthly, annual or upfront billing ([Microsoft Learn: new commerce](https://learn.microsoft.com/en-us/partner-center/customers/new-commerce-license-based)). The number of licenses "can be decreased only within the first seven days of when the licenses were added," whether at purchase, renewal or midterm; after that, the count can't be reduced until the next cancellation window at renewal ([Microsoft Learn: create subscriptions](https://learn.microsoft.com/en-us/partner-center/customers/create-a-new-subscription)). The Business family (Basic, Standard, Premium) is limited to 300 licenses in total per customer, enforced only per license type ([Microsoft Learn: pricing and offers](https://learn.microsoft.com/en-us/partner-center/pricing/pricing-and-offers)). Large customers on enterprise agreements reconcile seat counts at an annual true-up instead of paying for each change as it happens; Billing, Seats & Resellers covers true-ups.

The four definitions put the risk of an unused seat in different places. Fair billing puts it on the vendor (an inactive member stops costing the customer automatically); maximum quantity and user tiers put it on the customer for the cycle or the term; seat types let the customer buy cheaper seats for lighter users but make the admin the gatekeeper; a reduction window puts it on the customer after a week. None is wrong, but each needs the billing system to know who held a seat when, which is why [the core data model](/books/workplace-and-collaboration/workplace-business#the-core-data-model) stores seat assignments as time ranges.

Guests are their own question. Slack's single-channel guests are free and multi-channel guests are paid ([Slack: fair billing](https://slack.com/help/articles/218915077-Slacks-fair-billing-policy)); Figma's viewers are free on any plan ([Figma: pricing](https://www.figma.com/pricing/)). A free guest tier is generous and also an abuse vector, since an organization can try to run a paying team as guests; vendors cap guests per paid member or limit what guests can do. Guests & Cross-Org Collaboration covers the models.

## Monthly, Annual and Multi-Year

Every vendor charges less per month for a longer commitment. Slack's Pro is $7.25 a user a month on an annual plan and $8.75 monthly; Zoom's Pro $14.16 and $16.99 ([Slack: pricing](https://slack.com/pricing), [Zoom: pricing](https://zoom.us/pricing)); monday.com advertises 18% off yearly and says its monthly plan "is not discounted" ([monday.com: pricing](https://monday.com/pricing)); Google advertises 16% off with a one-year commitment ([Google Workspace: pricing](https://workspace.google.com/pricing)); Notion up to 20% ([Notion: pricing](https://www.notion.com/pricing)). The discount buys the vendor a known term and lower churn; the commitment costs the customer flexibility, which is where the seat definitions above bite.

Annual terms raise four mechanics that monthly terms avoid:

- **Mid-term additions.** Seats added during an annual term are prorated to the term end and billed on a schedule (Figma quarterly, Slack at month end for annual card payers and quarterly invoices for annual invoice payers ([Slack: fair billing](https://slack.com/help/articles/218915077-Slacks-fair-billing-policy))).
- **Mid-term reductions.** Usually not allowed until renewal (Microsoft after seven days, Atlassian annual tiers); Slack's credits are the exception.
- **Co-terming.** Products and add-ons bought mid-term are aligned to the main subscription's end date so the customer renews once.
- **Price protection.** The unit price is fixed for the term; a list price change applies at renewal. Changing it mid-term needs the contract to allow it ([Price Changes and Notice](/books/hosting-and-cloud/pricing-catalogs#price-changes-and-notice)).

Auto-renewal of business subscriptions is less regulated than consumer subscriptions, but not unregulated: several state automatic renewal laws are written for consumers, and a self-serve plan bought by a sole proprietor on a card may be one ([State automatic renewal laws](/books/hosting-and-cloud/renewals-and-cancellation-law#state-automatic-renewal-laws), [Auto-Renewal & Cancellation Law](/books/commerce/auto-renewal-law)). My default is to send renewal reminders and offer online cancellation on every self-serve plan regardless of whether the buyer is a business; it costs little and removes the question.

## Nonprofit and Education Plans

Discount programs are standard, verified by a third party, and each sets its own eligibility:

| Vendor | Nonprofit | Education |
| --- | --- | --- |
| **Google Workspace** | Google Workspace for Nonprofits at $0; Business Standard $3.50 and Business Plus $6.16 a user a month on a one-year commitment ([Google for Nonprofits](https://www.google.com/nonprofits/offerings/workspace/)) | Separate Workspace for Education editions |
| **Slack** | Free Pro for workspaces of 250 or fewer members, 85% off Pro above that and 85% off Business+ at any size, verified with TechSoup; schools, religious and political organizations, hospitals and government excluded ([Slack: nonprofits](https://slack.com/help/articles/204368833-Apply-for-the-Slack-for-Nonprofits-discount)) | A separate Slack for Education discount |
| **Atlassian** | Community licenses at 75% off for eligible customers | Academic licenses at 50% off ([Atlassian: cloud licensing](https://www.atlassian.com/licensing/cloud)) |
| **Zulip** | Free Cloud Standard for small nonprofits, open-source projects and academic research; discounts for education and other nonprofits ([Zulip: plans](https://zulip.com/plans/)) | Discounted pricing |

The engineering consequence is that a discount program is an attribute of the organization with a verification record and an expiry, not a coupon on one subscription. Eligibility lapses (a nonprofit loses status, a school merges), programs change, and the vendor needs to know which organizations are on which program when either happens.

## AI Pricing: From Add-On to Plan

The first generation of workplace AI was sold as a per-seat add-on. Over 2025 most vendors moved it into their plans with usage allowances, and one large vendor kept the add-on while building a bundle around it:

| Vendor | AI pricing as of October 2026 |
| --- | --- |
| **Google Workspace** | Gemini included in Business and Enterprise plans since January 2025. A Business Standard customer who had paid $32 a user a month with the Gemini Business add-on pays $14, "only $2 more" than Workspace without Gemini had cost; existing customers moved from March 17, 2025 or at renewal ([Google Workspace blog](https://workspace.google.com/blog/product-announcements/empowering-businesses-with-AI)) |
| **Atlassian** | Rovo at no additional cost on Standard, Premium and Enterprise, with 25, 70 and 150 Rovo credits per user per month ([Jira pricing](https://www.atlassian.com/software/jira/pricing), [Atlassian 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1650372/000165037226000036/team-20260630.htm)) |
| **Slack** | Basic AI on Free and Pro, advanced AI on Business+, enterprise search on Enterprise+ ([Slack: pricing](https://slack.com/pricing)) |
| **Notion** | Agent, AI meeting notes and enterprise search in Business; zero data retention with model providers on Enterprise; trials below ([Notion: pricing](https://www.notion.com/pricing)) |
| **Zoom** | Limited AI on Basic (three meeting summaries a month); unlimited summaries and note-taking on paid plans ([Zoom: pricing](https://zoom.us/pricing)) |
| **Figma** | AI credits per seat per month, from 3,000 for a Full seat on Professional to 4,250 on Enterprise and 500 for Dev, Collab and view access ([Figma: pricing](https://www.figma.com/pricing/)) |
| **Microsoft 365** | Copilot as a $30 add-on, or inside the $99 E7 suite with E5, Agent 365 and the Entra Suite ([Microsoft 365 plans](https://www.microsoft.com/en-us/microsoft-365/enterprise/microsoft365-plans-and-pricing)) |

Two forces drove the retreat into bundles. Buyers resisted paying a second per-seat price for features they couldn't yet measure, and bundling raised the base price modestly across the whole seat count instead (Google's $2). And a bundle with an allowance caps the vendor's inference cost per seat while letting heavy users buy more, which an unlimited add-on didn't. The result is that most workplace plans now have two meters: seats, and credits consumed against a per-seat allowance, often pooled across the organization. Admins want to cap credit use per team, see who used what, and turn AI off for some groups entirely (AI Assistants Over Company Data covers the controls).

## How to Build It

This chapter extends `plans`, `subscriptions` and `seat_assignments` from [the core data model](/books/workplace-and-collaboration/workplace-business#the-core-data-model) with versioned prices by term and seat type, entitlements, add-ons, seat activity for fair billing, credits, and discount programs. Rating and invoicing are Billing, Seats & Resellers' and the Hosting & Cloud volume's.

```sql
CREATE TABLE plan_prices (               -- a list price, by term, interval, seat type and currency
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  plan_id          UUID NOT NULL REFERENCES plans (id),
  seat_type        TEXT NOT NULL DEFAULT 'standard',   -- 'full', 'dev', 'collab', ...
  term             TEXT NOT NULL CHECK (term IN ('monthly', 'annual', 'multi_year')),
  currency         CHAR(3) NOT NULL,
  min_quantity     INT NOT NULL DEFAULT 1,   -- progressive tiers: price for seats from here
  unit_price       BIGINT NOT NULL CHECK (unit_price >= 0),  -- per seat per month, minor units
  valid_during     TSTZRANGE NOT NULL,       -- price changes are new rows, never edits
  EXCLUDE USING gist (plan_id WITH =, seat_type WITH =, term WITH =, currency WITH =,
    min_quantity WITH =, valid_during WITH &&)
);

CREATE TABLE plan_entitlements (         -- limits, features and admin controls per plan
  plan_id      UUID NOT NULL REFERENCES plans (id),
  key          TEXT NOT NULL,             -- 'history_days', 'max_members', 'saml_sso', 'scim',
                                          -- 'audit_log_api', 'legal_holds', 'ai_credits_per_seat'
  kind         TEXT NOT NULL CHECK (kind IN ('limit', 'feature', 'control')),
  value        JSONB NOT NULL,            -- e.g. 90, true, {"per_seat": 25, "pooled": true}
  over_limit   TEXT CHECK (over_limit IN ('block', 'warn', 'hide', 'auto_upgrade')),
  PRIMARY KEY (plan_id, key)
);

CREATE TABLE addons (                    -- separately priced capabilities
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  code         TEXT NOT NULL UNIQUE,      -- 'ekm', 'ai_assistant', 'extra_storage'
  name         TEXT NOT NULL,
  unit         TEXT NOT NULL CHECK (unit IN ('per_seat', 'per_organization', 'per_pack')),
  requires_plan_rank SMALLINT              -- the lowest plan it can attach to
);

CREATE TABLE subscription_addons (
  subscription_id UUID NOT NULL REFERENCES subscriptions (id),
  addon_id        UUID NOT NULL REFERENCES addons (id),
  quantity        INT NOT NULL CHECK (quantity > 0),
  unit_price      BIGINT NOT NULL CHECK (unit_price >= 0),  -- as signed
  active_during   TSTZRANGE NOT NULL,       -- co-termed to the subscription's term end
  PRIMARY KEY (subscription_id, addon_id, active_during)
);

CREATE TABLE seat_activity (             -- last activity per seat, for fair billing and reclaim
  seat_assignment_id UUID PRIMARY KEY REFERENCES seat_assignments (id),
  last_active_at     TIMESTAMPTZ,         -- null: never used
  became_inactive_at TIMESTAMPTZ          -- set by the job when the inactivity threshold passes
);

CREATE TABLE billing_credits (           -- prorated credits for inactive or removed seats
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  subscription_id    UUID NOT NULL REFERENCES subscriptions (id),
  seat_assignment_id UUID REFERENCES seat_assignments (id),
  reason             TEXT NOT NULL CHECK (reason IN ('inactive_member', 'deactivated_member',
                       'sla_credit', 'goodwill', 'downgrade')),
  days               INT CHECK (days > 0),
  amount             BIGINT NOT NULL CHECK (amount > 0),
  applied_to_invoice TEXT,                -- the invoice that consumed it; null: unapplied
  expires_at         TIMESTAMPTZ,         -- e.g. when the paid plan ends
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE discount_programs (         -- nonprofit, education, community, startup
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  code          TEXT NOT NULL UNIQUE,
  kind          TEXT NOT NULL CHECK (kind IN ('nonprofit', 'education', 'community',
                  'startup', 'government')),
  terms         JSONB NOT NULL,           -- e.g. {"free_up_to": 250, "percent_off": 85}
  verifier      TEXT,                     -- the third party that checks eligibility
  valid_during  TSTZRANGE NOT NULL
);

CREATE TABLE program_enrollments (       -- which organizations are on which program
  organization_id     UUID NOT NULL REFERENCES organizations (id),
  discount_program_id UUID NOT NULL REFERENCES discount_programs (id),
  verified_at         TIMESTAMPTZ NOT NULL,
  verification_ref    TEXT NOT NULL,      -- the verifier's case or token
  expires_at          TIMESTAMPTZ,        -- reverify by then
  revoked_at          TIMESTAMPTZ,
  PRIMARY KEY (organization_id, discount_program_id, verified_at)
);
```

Design notes:

- **Prices are versioned rows.** A price change inserts a new `plan_prices` row with a new validity range; subscriptions keep the `unit_price` they were signed at until renewal, and the renewal job picks the price valid on the renewal date. Nobody edits a price in place ([The Pricing Page as Truth](/books/hosting-and-cloud/pricing-catalogs#the-pricing-page-as-truth)).
- **One gate, three kinds.** The entitlement check reads `plan_entitlements` for the organization's current plan; limits also carry the behavior at the edge. Controls are checked the same way as features, so the SSO tax is a row, not a special case, and downgrade logic can list exactly which controls a lower plan removes.
- **Fair billing is a job over activity.** A daily job marks seats inactive past the threshold, writes a prorated `billing_credits` row, and reverses it as a charge when the member is active again. The threshold (28 days for Slack) is a plan or program setting, not a constant.
- **Peak counts come from ranges.** Maximum Quantity Billing is the maximum number of overlapping `seat_assignments.assigned_during` ranges in the cycle, computed from rows, never from a counter that can drift.
- **Approval is a state of the seat.** Where admins approve paid seats (Figma's model), a seat request is a `seat_assignments` row in a pending state with the approver recorded; it starts billing at approval, prorated.
- **Credits are a ledger.** Every credit has a reason, an amount, an expiry and the invoice that consumed it, so a customer asking where their credit went gets an answer from rows.
- **Programs belong to the organization.** A nonprofit discount is an enrollment with a verification and an expiry; the renewal job checks it before applying the program's terms.

## Auditing

- **What was on the price list when.** Every `plan_prices` row with its validity range, so a renewal or a dispute is priced against the list in force.
- **What the customer was entitled to.** The plan and its entitlements at each point in time, so "we had legal holds when this matter started" can be checked.
- **Who held a seat, and whether they were active.** Seat assignments with ranges and activity, approvals and credits, which together reproduce any invoice line.
- **Who approved what.** Seat approvals, add-on purchases, plan changes and program enrollments, each with the admin who made them.

## What This Means for the System You Build

- **Write down what a seat is** (granted, active, by type, by license) before you build the billing system, and put it on the pricing page.
- **Gate limits, features and admin controls through one entitlement table,** and define the behavior at every limit.
- **Never delete customer data on downgrade;** hide, lock or disable, and restore on upgrade.
- **Version prices,** and keep each subscription's signed price until renewal.
- **Store seats as ranges with activity,** so fair billing, peak billing and reclaim are queries.
- **Treat credits as a ledger** with reasons, expiry and the invoice that consumed them.
- **Model discount programs as verified, expiring enrollments** on the organization.
- **Plan for two meters:** seats and AI credits against a per-seat allowance, with admin caps per team.

## References

**Vendor pricing and documentation**

- [Slack: Pricing](https://slack.com/pricing), plan prices, free plan limits, SAML and SCIM by plan, Enterprise+ controls and AI by plan
- [Slack: Fair billing policy](https://slack.com/help/articles/218915077-Slacks-fair-billing-policy), the 28-day threshold, prorated credits, paid and free member types and billing schedules
- [Slack: Apply for the Slack for Nonprofits discount](https://slack.com/help/articles/204368833-Apply-for-the-Slack-for-Nonprofits-discount), free Pro up to 250 members, the 85% discounts, eligibility and TechSoup
- [Atlassian: Jira pricing](https://www.atlassian.com/software/jira/pricing), plans, the free plan's user limit and Rovo credits per plan
- [Atlassian: Cloud licensing](https://www.atlassian.com/licensing/cloud), billable users, Maximum Quantity Billing, progressive tiers, user tiers, 24-month terms, free plan overage and Community and Academic discounts
- [Microsoft 365 Enterprise: plans and pricing](https://www.microsoft.com/en-us/microsoft-365/enterprise/microsoft365-plans-and-pricing), E3, E5, E7, Teams Enterprise and Copilot prices
- [Microsoft Learn: New commerce license-based overview](https://learn.microsoft.com/en-us/partner-center/customers/new-commerce-license-based), new commerce since September 1, 2024, terms and billing frequencies
- [Microsoft Learn: Create customer subscriptions](https://learn.microsoft.com/en-us/partner-center/customers/create-a-new-subscription), the seven-day reduction window
- [Microsoft Learn: Pricing and offers](https://learn.microsoft.com/en-us/partner-center/pricing/pricing-and-offers), the 300-license limit for the Business family
- [Google Workspace: Pricing](https://workspace.google.com/pricing), Business edition prices, the one-year discount and the 300-user limit
- [Google Workspace blog: AI included in Business and Enterprise plans (January 2025)](https://workspace.google.com/blog/product-announcements/empowering-businesses-with-AI), Gemini bundling, the $32 and $14 comparison and migration dates
- [Google for Nonprofits: Google Workspace](https://www.google.com/nonprofits/offerings/workspace/), the free edition and discounted prices
- [Figma: Pricing](https://www.figma.com/pricing/), seat types and prices by plan, AI credits, view access and seat approval and invoicing
- [Zoom: Pricing](https://zoom.us/pricing), plan prices, meeting limits and AI by plan
- [Notion: Pricing](https://www.notion.com/pricing), plan prices, the yearly discount, SAML and SCIM by plan and AI by plan
- [monday.com: Pricing](https://monday.com/pricing), plan prices, seat minimums and the yearly discount
- [Zulip: Plans](https://zulip.com/plans/), cloud and self-hosted prices, SAML and SCIM on Plus and discount programs
- [Atlassian: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1650372/000165037226000036/team-20260630.htm), Rovo at no additional cost

**In practice**

- [SSO Wall of Shame (sso.tax)](https://sso.tax/), what the SSO tax is and how the site measures it
