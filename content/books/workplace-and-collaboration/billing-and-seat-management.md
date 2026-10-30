+++
title = "Billing, Seats & Resellers"
description = "Seat billing operations for collaboration software: counting seats, proration, true-ups, co-terming, POs, CSP resellers, cloud marketplaces and tax."
category = "Workplace & Collaboration Industry"
order = 2063
part = "Running the Platform"
tags = ["billing", "seats", "proration", "resellers", "marketplaces"]
+++

A seat-based subscription looks like the simplest kind of billing: a price per user per month, times the number of users. Operating it is not simple, because the number of users changes every day, and the customer's admin, not the vendor, changes it. People join and leave; guests are invited; SCIM deactivates a hundred accounts after a layoff; a department buys its own workspace on a credit card and is later folded into the enterprise contract. Each change raises the same questions: does it change the bill, from when, by how much, and on which invoice. The answers differ by vendor, by plan, by term, and by whether the customer bought directly, through a reseller or through a cloud marketplace.

This chapter is the operations side of seat billing. Plan design and what a seat means (active versus provisioned, guest pricing, seat types) belong to Plans, Pricing & Seats; the billing engine that rates usage and runs invoices belongs to Hosting & Cloud ([Metering & Rating](/books/hosting-and-cloud/metering-and-rating), [Invoices, Dunning & Suspension](/books/hosting-and-cloud/invoices-dunning-and-suspension)). Here: how vendors count seats and prorate changes, the three ways to handle growth mid-term (prorate now, true up later, buy a tier), co-terming, invoices, purchase orders and payment terms, the Microsoft CSP channel, cloud marketplaces, and the sales tax twist for software used by employees in many states. It adds seat changes, true-ups, invoices and channel records to the core data model. Generic subscription mechanics are the playbook's [Subscriptions](/docs/payments/subscriptions).

## How the Platforms Do It

| Vendor | Seat count that bills, as of October 2026 | Adding seats mid-term | Removing seats mid-term | Payment terms |
| --- | --- | --- | --- | --- |
| **Slack** (self-serve) | Active members; a member inactive more than 28 days, or deactivated, stops billing (Fair Billing Policy) | Prorated charge for the days remaining: monthly card plans billed the next month, annual card plans at month end, annual invoice plans settled quarterly | Automatic prorated credit for the unused part of the period, toward future payments; no cash value | Card or self-serve invoicing |
| **Atlassian Cloud** | Users with product access; Marketplace app users and deactivated users don't count | Monthly: prorated for the rest of the period, billed at the highest count reached (Maximum Quantity Billing). Annual: a "formal, prorated upgrade quote" to a higher user tier | Monthly: no reduction for the current period, lower count from the next. Annual: "user tiers cannot be altered" | Monthly: card or PayPal. Annual: card, bank transfer, check, ACH, PayPal, or Net-30 for orders above $10,000 |
| **Google Workspace** | Flexible Plan: user accounts held each month. Annual/Fixed-Term Plan: committed licenses | Flexible: prorated by day. Annual: added licenses prorated for the rest of the term | Flexible: any time. Annual: "can't remove licenses and lower your subscription price until it's time to renew" | Monthly in arrears (Flexible); upfront or monthly (Annual) |
| **Microsoft 365** (Microsoft Customer Agreement) | Purchased licenses | Any time, billed within one or two days | Only within seven days of buying, renewing or adding licenses; later reductions take effect after renewal | Card, invoice; partner billing through CSP |

The patterns:

- **Monthly plans follow the headcount; annual plans follow the commitment.** Every vendor in the table lets monthly customers shrink, and none lets annual customers shrink before renewal (Microsoft allows seven days after a purchase). The discount for an annual term buys the vendor a floor.
- **Growth is always allowed and always prorated.** All four charge for added seats from the day they're added to the end of the period or term. The variation is when the charge is invoiced: immediately, at month end, quarterly, or at a true-up.
- **"Active" is a billing policy, not a seat definition.** Slack's 28-day inactivity credit is a billing rule applied to a seat count; Atlassian counts users with access regardless of activity. Plans, Pricing & Seats covers the definitions; this chapter covers the ledger that applies them.
- **Payment terms are a tier feature.** Net-30 invoicing is gated by order size at Atlassian; monthly plans are card-only at Atlassian. The ability to pay by invoice is as much a part of the enterprise tier as SSO.

## Counting Seats

The bill is computed from a seat count, and the seat count is computed from membership state that admins and directory sync change constantly. Three counting methods appear:

- **Point in time.** The count at the invoice date. Simple, and gameable: remove users the day before the invoice, re-add them after.
- **Maximum in the period.** Atlassian's monthly Maximum Quantity Billing charges "for the highest seat count reached during the cycle." No gaming, but a one-day spike costs a full period.
- **Daily proration.** Google's Flexible Plan charges for each account for the days it existed: a user added April 1 and deleted April 15 costs half a month. Slack does the same for adds and credits. Fair, but the invoice becomes a sum of many partial lines.

Whatever the method, the count has to be reproducible: from membership events, the vendor must be able to show which members were billable on which days. That record is also what the customer's admin reconciles against, using the license utilization reports covered in [Workplace Metrics](/books/workplace-and-collaboration/workplace-metrics#license-utilization-and-reclaim).

Directory sync makes counting an integration problem. A SCIM push that provisions every employee in the identity provider, including those who will never open the product, turns provisioned users into billed seats. Atlassian says users count "once product access is granted," and stop counting only when deactivated, deleted, or removed from a synced directory. The customer controls this through which groups it syncs (Provisioning, SCIM & Offboarding covers group push); the vendor's billing UI should show which seats came from sync and when, because the admin who set up SCIM is rarely the one reading the invoice.

## Proration

Proration is arithmetic on a price, a quantity and a fraction of a period. Slack publishes its formula: cost per member divided by days in the month, times the remaining days. A member deactivated on day 15 of a 30-day month on an $8.75 plan earns $8.75 / 30 x 15 = $4.38 of credit; a member added 10 days in costs $8.75 / 30 x 20 = $5.83. Google's annual example is the same idea over a term: three Business Starter licenses added on day 6 of month 4, on a plan of $84 per license per year, cost $65.80 for that month, and the monthly charge rises to $70 for the remaining months.

The decisions a billing system must make explicitly:

- **Day or second.** Most seat billing prorates by day; the vendor picks the day boundary (the customer's billing time zone or UTC) and documents it.
- **Credit or refund.** Slack's credits apply to future payments and have "no cash value"; Google and Microsoft reduce future charges. A credit balance is a liability the vendor carries until it's consumed.
- **Immediate or deferred invoicing.** Slack bills monthly card customers' prorated adds the next month and settles annual invoice customers quarterly; Microsoft bills added licenses "within one or two days." Many small invoices annoy procurement; one large deferred invoice surprises finance.
- **Rounding.** Per line, to the currency's minor unit, with the rounding rule stated. [Money](/docs/payments/money) covers the arithmetic.

The playbook's [Plan Changes and Proration](/docs/payments/subscriptions#plan-changes-and-proration) has the general mechanics; seat billing adds that the quantity, not just the plan, changes mid-period, and that it changes because of events in the customer's directory.

## True-Ups and Tiers

For annual and multi-year contracts, charging every add as it happens produces dozens of small invoices that a procurement department must approve, each against a purchase order. Vendors avoid this in three ways:

- **Prorated add-on orders.** Each increase is a small order co-termed to the contract end. Microsoft and Google do this.
- **Periodic true-up.** The customer may exceed its committed quantity during the term, and the vendor counts usage at intervals (quarterly or annually) and invoices the overage, prorated from the true-up date or for the full period depending on contract. Slack's annual invoice customers have their prorated balances settled once per calendar quarter, which is the self-serve form of the same idea. Negotiated enterprise order forms set their own true-up cadence.
- **Tiers.** The customer buys a band of users, and moving to the next band is an upgrade. Atlassian's annual plans are sold in "distinct user tiers," and adding seats beyond the tier requires a prorated upgrade quote.

The tier model has a pricing consequence covered in Plans, Pricing & Seats: Atlassian's published example for Jira Cloud Standard prices 450 seats in bands, $8.60 per user for the first 100, $7.30 for 101 to 250 and $6.10 for 251 to 450, for $3,175.00 a month, an average of $7.06 per user. For billing operations, the tier and band are attributes of the subscription that every upgrade quote must reprice.

My default for an enterprise contract: a committed quantity with a quarterly true-up, priced at the contract rate and prorated from the true-up date, invoiced against the existing purchase order with a stated cap above which a new PO is required. It keeps procurement out of individual hires and keeps the vendor paid for growth within a quarter.

## Co-Terming

A large customer accumulates subscriptions: the original workspace plan, an add-on for AI or compliance bought six months later, a second product, extra storage. Co-terming aligns their end dates so the customer renews everything once. Two ways:

- **Co-term new purchases to the existing term.** An add-on bought in month 7 of a 12-month contract is sold for 5 months, prorated. Google's annual plan prorates added licenses to the end of the commitment.
- **Re-term everything at renewal.** At the next renewal, all subscriptions are renewed to one date, with short stubs as needed.

Co-terming matters more in workplace software than in most SaaS because the suites sell many products to the same tenant, and the customer's IT and procurement teams want one renewal date to plan budgets, negotiate and decide what to drop. A billing system needs a subscription group per customer with a common end date, and add-on pricing that prorates to it by default.

## Invoices, Purchase Orders and Payment Terms

Self-serve customers pay by card; enterprise customers pay invoices, and an invoice that doesn't match the customer's procurement rules doesn't get paid.

- **Quotes before orders.** Atlassian's annual plans are bought and changed through quotes: in the Quotes tab, a contact can download a PDF, pay by card, update a PO number or delete the quote, and bank transfer, check or ACH payment requires a renewal quote. A quote is a priced, dated offer with an expiry; accepting it creates the order.
- **Purchase order numbers on every invoice.** Large customers' accounts payable systems reject invoices without a matching PO. The PO number must be captured at the order, printed on every invoice drawn against it, and updatable when the customer issues a new PO mid-term.
- **Only billing contacts see billing.** Atlassian restricts quotes and invoices to listed billing or technical contacts. Billing is a separate role from workspace administration; Admin Consoles & Policies covers the admin role ladder.
- **Net terms by threshold.** Atlassian offers Net-30 terms on orders above $10,000. Net terms are credit the vendor extends, so they need a credit decision and dunning that doesn't suspend a customer for an invoice that is merely in approval ([Failed Payments and Dunning](/books/hosting-and-cloud/invoices-dunning-and-suspension#failed-payments-and-dunning)).
- **Refund windows.** Atlassian refunds annual plans within 30 days of payment and monthly plans only in the first paid month after a trial; Microsoft's MCA allows cancellation with a prorated refund within seven days of the start or renewal, after which only recurring billing can be turned off. Each is a rule with a clock, and the clock runs from a recorded event.

## Resellers and the Microsoft CSP Channel

Workplace suites are often bought through partners who bundle licenses with deployment, support and managed services. Microsoft's Cloud Solution Provider program is the largest public example. It has two models:

- **Indirect.** An indirect reseller buys through a distributor (formerly "indirect provider"), which can collaborate on marketing, support and billing.
- **Direct bill.** The partner buys directly from Microsoft and must "sell to, bill, manage, and support their customers autonomously." Direct-bill status requires at least 12 months as an indirect reseller, at least USD one million in trailing 12-month CSP revenue, a capabilities assessment covering billing, provisioning, support, compliance and security, at least one managed service or solution, a Solution Partner designation and a paid support plan.

Before a partner can order on a customer's behalf, the customer must accept the Microsoft Customer Agreement. In the admin center, a CSP-bought subscription shows "Reseller" as its purchase channel, and the customer can't buy or remove licenses itself: it contacts the partner.

For a vendor building a reseller channel, the CSP structure shows what to model: the end customer's tenant and agreement, the partner who bills it, possibly a distributor between them, prices at each level, and who may change seat counts. Atlassian's SLA shows another consequence: credits for reseller purchases "go to the reseller," which passes them to the customer. Every financial event on a resold subscription flows through the partner, and the vendor's data model has to know who the payer is for each subscription. [Resellers and White Label](/books/hosting-and-cloud/accounts-and-resellers#resellers-and-white-label) covers the general model, and [Resellers and the Cascade](/books/hosting-and-cloud/invoices-dunning-and-suspension#resellers-and-the-cascade) what happens when a reseller doesn't pay.

## Cloud Marketplaces

Enterprises with committed cloud spend can buy SaaS through the cloud provider's marketplace and draw down their commitment, which makes the marketplace a procurement shortcut: the vendor is already an approved supplier, and the spend is already budgeted.

- **AWS Marketplace** listing fees, effective January 5, 2024: 3% for SaaS public offers; for private offers, 3% below $1M total contract value, 2% from $1M to below $10M, 1.5% at $10M or more, and 1.5% on all renewals; channel partner private offers add 0.5%; South Korean buyers add a 1% regional fee from April 1, 2025.
- **Microsoft Marketplace** charges a 3% standard store service fee on transact offers, with a 50% discount available on private offer renewals. SaaS plans support per-user, flat-rate and metered pricing, terms from one month to five years, and payment monthly, annually or upfront. Microsoft acts as the publisher's agent for billing and collection; Enterprise Agreement customers see the software on their Microsoft invoice. Monetary commitments and free credits "can't be used to pay for publisher software license fees" under that arrangement, so whether a purchase draws down a commitment depends on the program and the offer.

The operational consequence: a marketplace subscription is a subscription whose payer, invoice and collection belong to the cloud provider. The vendor receives an entitlement (customer, plan, quantity, term) through the marketplace's fulfillment API, provisions or updates the workspace from it, reports metered usage back if the plan has meters, and is paid net of the fee. Seat changes may come from the marketplace rather than the vendor's own billing UI, so the vendor's seat ledger must accept changes from either source and never let them diverge. [Marketplaces](/books/hosting-and-cloud/commitments-and-marketplaces#marketplaces) covers the provider side and [Private offers and channel partners](/books/hosting-and-cloud/commitments-and-marketplaces#private-offers-and-channel-partners) the deal mechanics.

## Tax on Seats Used Everywhere

Sales tax on SaaS varies by US state: some treat remotely accessed software as a taxable sale of software, some tax it as data processing or information services, some don't tax it, and some tax it only for business use. [US Sales Tax on Hosting, IaaS and SaaS](/books/hosting-and-cloud/tax#us-sales-tax-on-hosting-iaas-and-saas) surveys the rules and [Local Cloud Taxes: Chicago](/books/hosting-and-cloud/tax#local-cloud-taxes-chicago) the city tax; the playbook's [Taxability Varies by Place](/docs/payments/sales-tax#taxability-varies-by-place) and [Sourcing Is Data](/docs/payments/sales-tax#sourcing-is-data) give the mechanics.

The workplace twist is sourcing. A seat-based contract is bought by a company at one address and used by employees in dozens of states. Some states source software to where it's used and let buyers allocate a multi-state purchase (Washington's multiple points of use exemption and Pennsylvania's user-location allocation are in the Hosting & Cloud survey). For a billing system that means:

- **Seat location is a billing attribute.** The vendor (or the customer, on an exemption form) can allocate seats by user location, which requires a usable location per member or a customer-provided allocation.
- **Allocation certificates are documents** that change the tax on an invoice and must be stored with their dates ([Exemptions Are Documents](/docs/payments/sales-tax#exemptions-are-documents)).
- **Marketplace sales shift collection.** When AWS or Microsoft sells the subscription, the marketplace operator may be the facilitator that collects tax in its own name ([Marketplaces and Facilitator Rules](/books/hosting-and-cloud/tax#marketplaces-and-facilitator-rules)); the vendor's own invoices and the marketplace's must not both charge it.

## How to Build It

`plans`, `subscriptions` and `seat_assignments` are core. Plans, Pricing & Seats defines what a billable seat is; this chapter records how the count changes, how changes are priced and invoiced, and who pays.

```sql
ALTER TABLE subscriptions
  ADD COLUMN term_start        DATE NOT NULL,
  ADD COLUMN term_end          DATE NOT NULL,
  ADD COLUMN billing_cadence   TEXT NOT NULL CHECK (billing_cadence IN ('monthly',
                                 'annual_upfront', 'annual_monthly', 'quarterly')),
  ADD COLUMN count_method      TEXT NOT NULL CHECK (count_method IN ('point_in_time',
                                 'period_max', 'daily_prorated', 'committed')),
  ADD COLUMN committed_seats   INT,              -- floor for annual commitments
  ADD COLUMN reduce_window     INTERVAL,         -- '7 days' after purchase or renewal
  ADD COLUMN true_up_cadence   TEXT CHECK (true_up_cadence IN ('quarterly', 'annual')),
  ADD COLUMN coterm_group_id   UUID,             -- subscriptions renewing together
  ADD COLUMN channel           TEXT NOT NULL DEFAULT 'direct' CHECK (channel IN
                                 ('direct', 'reseller', 'aws_marketplace',
                                  'azure_marketplace', 'gcp_marketplace')),
  ADD COLUMN payer_party_id    UUID;             -- the customer, reseller or marketplace

CREATE TABLE billing_parties (                  -- who receives and pays invoices
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  kind           TEXT NOT NULL CHECK (kind IN ('customer', 'reseller', 'distributor',
                   'marketplace')),
  organization_id UUID REFERENCES organizations (id),   -- set for kind = 'customer'
  name           TEXT NOT NULL,
  payment_terms_days SMALLINT NOT NULL DEFAULT 0,       -- 30 for Net-30
  credit_limit   BIGINT                                 -- minor units
);

CREATE TABLE seat_changes (                     -- the seat ledger
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  subscription_id  UUID NOT NULL REFERENCES subscriptions (id),
  effective_at     TIMESTAMPTZ NOT NULL,
  delta            INT NOT NULL,                -- +1, -1, +250
  quantity_after   INT NOT NULL CHECK (quantity_after >= 0),
  source           TEXT NOT NULL CHECK (source IN ('admin', 'scim', 'inactivity_policy',
                     'reactivation', 'true_up', 'marketplace', 'reseller', 'renewal')),
  member_id        UUID REFERENCES members (id),  -- for single-seat changes
  external_ref     TEXT,                        -- marketplace or partner event id
  billed_on        UUID,                        -- invoice_lines.id once priced
  UNIQUE (subscription_id, external_ref)        -- marketplace events apply once
);

CREATE TABLE true_ups (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  subscription_id  UUID NOT NULL REFERENCES subscriptions (id),
  measured_on      DATE NOT NULL,
  committed_seats  INT NOT NULL,
  measured_seats   INT NOT NULL,               -- billable members that day, per count_method
  overage_seats    INT GENERATED ALWAYS AS (GREATEST(measured_seats - committed_seats, 0))
                     STORED,
  prorate_from     DATE NOT NULL,              -- usually measured_on
  status           TEXT NOT NULL CHECK (status IN ('measured', 'sent_to_customer',
                     'invoiced', 'waived')),
  UNIQUE (subscription_id, measured_on)
);

CREATE TABLE purchase_orders (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  billing_party_id UUID NOT NULL REFERENCES billing_parties (id),
  po_number        TEXT NOT NULL,
  amount_cap       BIGINT,                     -- invoices beyond it need a new PO
  currency         CHAR(3) NOT NULL,
  valid_during     DATERANGE NOT NULL,
  UNIQUE (billing_party_id, po_number)
);

CREATE TABLE invoices (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  billing_party_id UUID NOT NULL REFERENCES billing_parties (id),
  purchase_order_id UUID REFERENCES purchase_orders (id),
  number           TEXT NOT NULL UNIQUE,       -- sequential per seller entity
  issued_on        DATE NOT NULL,
  due_on           DATE NOT NULL,
  currency         CHAR(3) NOT NULL,
  status           TEXT NOT NULL CHECK (status IN ('draft', 'issued', 'paid', 'void'))
);

CREATE TABLE invoice_lines (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  invoice_id       UUID NOT NULL REFERENCES invoices (id),
  subscription_id  UUID NOT NULL REFERENCES subscriptions (id),
  kind             TEXT NOT NULL CHECK (kind IN ('recurring', 'proration', 'credit',
                     'true_up', 'tier_upgrade', 'sla_credit')),
  service_period   DATERANGE NOT NULL,
  quantity         INT NOT NULL,
  unit_price       BIGINT NOT NULL,            -- minor units at the contract rate
  amount           BIGINT NOT NULL,
  tax_code         TEXT NOT NULL,
  tax_allocation   JSONB                       -- seats by jurisdiction, if allocated
);
```

Pricing one seat change by daily proration, Slack's formula, for a monthly period:

```sql
-- $1: seat_changes.id, $2: unit price per seat per period (minor units)
SELECT sc.delta * ROUND($2::numeric
         * (upper(p.period) - sc.effective_at::date)
         / (upper(p.period) - lower(p.period))) AS amount
FROM seat_changes sc
JOIN subscriptions s ON s.id = sc.subscription_id
CROSS JOIN LATERAL (
  SELECT daterange(date_trunc('month', sc.effective_at)::date,
                   (date_trunc('month', sc.effective_at) + interval '1 month')::date)
         AS period
) p
WHERE sc.id = $1;
```

Notes on the sketch:

- **The ledger is the source of the count.** `quantity_after` on the latest change is the current quantity; the quantity on any past day is a lookup, which is what a proration, a true-up or a dispute needs. Membership events (admin actions, SCIM, inactivity) write seat changes; they never edit the subscription's quantity directly.
- **Reductions obey the term.** For committed subscriptions, a negative change below `committed_seats` outside `reduce_window` is rejected or scheduled for the renewal date, not applied; the admin sees the date it takes effect, as Microsoft's admin center shows.
- **Inactivity credits are seat changes too.** A Slack-style fair billing rule writes a `-1` with `source = 'inactivity_policy'` when a member crosses the inactivity threshold, and a `+1` with `source = 'reactivation'` when they return, so the same proration query prices both.
- **Channels change the payer, not the ledger.** A marketplace or reseller subscription's changes arrive with `external_ref` and apply exactly once; invoices go to the `billing_party` that pays, and SLA credits for resold subscriptions are issued to the reseller.
- **POs travel with invoices.** An invoice draws on a PO whose `valid_during` covers its date; when cumulative invoiced amounts would exceed `amount_cap`, the invoice stays a draft and billing contacts are asked for a new PO.
- **Co-term groups renew together.** An add-on created in a group gets `term_end` from the group; renewal quotes are generated per group.
- **Tax lines carry allocation.** When a customer supplies a multi-state allocation, `tax_allocation` stores seats by jurisdiction and the certificate that supports it.

## Auditing

- **Every seat change and its cause:** admin, sync, policy, marketplace or partner, with the member and the external reference, so a count can be explained.
- **Every price applied:** the contract rate, the proration fraction, the rounding, and the invoice line it produced.
- **Every true-up:** the measurement, the commitment, the overage and the customer's acknowledgment.
- **Every quote, PO and refund decision** with the clocks that governed it (refund windows, reduction windows, PO validity).
- **Billing access:** who viewed or changed billing data, kept separately from workspace admin actions in `audit_events`, because billing contacts and workspace admins are often different people.

## What This Means for the System You Build

- **Keep a seat ledger,** written by every membership source, and derive quantities from it.
- **Choose and publish the counting method** (point in time, period maximum, daily proration, committed) per plan and term.
- **Prorate by a documented formula** with stated day boundaries, rounding and credit treatment.
- **Let annual customers grow freely and shrink only at renewal,** with any reduction window stated as a clock.
- **Offer true-ups or tiers for enterprise growth** so procurement isn't approving every hire.
- **Co-term add-ons by default** to the customer's renewal date.
- **Capture PO numbers, quotes and billing contacts** as first-class records, and gate net terms by credit.
- **Model the payer separately from the tenant** for resellers and marketplaces, and accept seat changes from their APIs exactly once.
- **Treat seat location as a tax input** when customers allocate multi-state use.

## References

**Vendor documentation**

- [Slack Help Center: Slack's Fair Billing Policy](https://slack.com/help/articles/218915077-Slacks-Fair-Billing-Policy), the 28-day inactivity rule, proration formula and examples, credits, and how prorated charges are billed by cadence
- [Atlassian: Cloud licensing](https://www.atlassian.com/licensing/cloud), Maximum Quantity Billing, user tiers, who counts as a user, upgrade quotes, refunds, quotes and POs, payment methods, Net-30 over $10,000 and the Jira tier pricing example
- [Atlassian: Service Level Agreement](https://www.atlassian.com/legal/sla), SLA credits for reseller purchases issued to the reseller
- [Google Workspace Admin Help: Flexible Plan](https://knowledge.workspace.google.com/admin/billing/flexible-plan), monthly billing per account, daily proration and limits on new accounts
- [Google Workspace Admin Help: Annual/Fixed-Term Plan](https://knowledge.workspace.google.com/admin/billing/annual-fixed-term-plan), the commitment, prorated added licenses with a worked example, no reductions before renewal, and renewal options
- [Microsoft Learn: Buy or remove licenses for a Microsoft business subscription](https://learn.microsoft.com/en-us/microsoft-365/commerce/licenses/buy-licenses), the seven-day reduction window, invoicing of added licenses, reseller-bought subscriptions
- [Microsoft Learn: Cancel your Microsoft business subscription](https://learn.microsoft.com/en-us/microsoft-365/commerce/subscriptions/cancel-your-subscription), the seven-day prorated cancellation window under MCA and partner purchases
- [Microsoft Learn: Cloud Solution Provider program overview](https://learn.microsoft.com/en-us/partner-center/enroll/csp-overview), indirect and direct-bill models and direct-bill requirements
- [AWS Marketplace Seller Guide: Understanding listing fees](https://docs.aws.amazon.com/marketplace/latest/userguide/listing-fees.html), SaaS public and private offer fees, renewals, CPPO uplift and regional fees, effective January 5, 2024
- [Microsoft Learn: Microsoft Marketplace transact capabilities](https://learn.microsoft.com/en-us/partner-center/marketplace-offers/marketplace-commercial-transaction-capabilities-and-considerations), the 3% store service fee, the renewal discount, SaaS pricing models and terms, agency billing and commitment limits
