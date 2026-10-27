+++
title = "Service Agreements & Plans"
description = "What a field customer buys: memberships, maintenance plans and contracts, tiers and add-ons, visit generation, pauses, renewal, cancellation, warranties, SLAs."
category = "Field Operations Industry"
order = 1504
part = "How the Work Flows"
tags = ["field-operations", "subscriptions", "memberships", "contracts", "warranties", "sla"]
+++

Most field revenue that a business can count on comes from an agreement, not a job. An HVAC customer buys a membership with two tune-ups and 15% off repairs; a pest customer buys quarterly service for a year; a pool owner buys weekly cleaning for the season; a termite customer buys a renewable warranty; a property manager signs a janitorial or landscaping contract covering forty buildings with a response-time promise. The **service agreement** is that promise in data: what's covered, where, how often, at what price up front and per period, for how long, and what happens at the end. Every operational system is generated from it: the visits on the schedule, the invoices, the renewal notices, the technician's checklist, the commission. Model it loosely (a plan name and a price on the customer) and each of those systems invents its own reading.

It's hard for three reasons. Service and billing run on different clocks (quarterly visits billed monthly is normal). The agreement changes while it's running (upgrades, pauses, price increases, a sold house). And the end of an agreement is regulated: automatic renewal and cancellation are among the most heavily policed practices in consumer services. The general machinery of recurring billing (states, periods, proration, dunning, the law of automatic renewal) is in [Subscriptions & Recurring Billing](/docs/payments/subscriptions); this chapter is what's specific to field service.

## What an Agreement Is Made Of

Across vendors the same parts recur, under different names (membership, service plan, subscription, maintenance agreement, contract):

- **Plan or tier.** The product sold: "Gold membership", "Quarterly pest", "Termite renewal". Tiers differ by included visits, discount and coverage (good, better, best, as [Pricing & Sales Rules](/books/field-operations/pricing-and-sales-rules) describes).
- **Included services.** What visits the plan produces and how often: a spring and fall tune-up, a quarterly exterior treatment, weekly pool service, a biweekly house clean.
- **Benefits.** Discounts on other work, priority scheduling, waived trip fees, free re-service between visits. In HVAC and plumbing the repair discount is often the point of the membership, so the agreement has to reach into repair pricing ([Repair, Install & Commercial Work](/books/field-operations/repair-and-installation)).
- **Add-ons.** Extra services or covered equipment, each with its own price: a second system, mosquito service, a crawl space.
- **Price.** Usually an **initial** price (the first, heavier service or an installation) and a **recurring** price, plus how it's billed: per visit, monthly, annually, or prepaid.
- **Term and renewal.** Start date, length, whether it renews automatically, and what notice the customer gets.
- **Property and assets.** Which site, and for equipment plans which units, the agreement covers.

The vendors arrange these differently, and the arrangement tells you what they optimize for. **ServiceTitan** memberships, built around HVAC and plumbing, are a member discount plus recurring service types (annual, seasonal, monthly), sold as a task on an invoice or estimate, with a renewal pricebook item; "every fixed-duration membership type needs a renewal task." **FieldRoutes**, built around pest and lawn, puts nearly every decision on the subscription: service type, frequency, seasonal or year-round, separate initial and recurring invoice templates priced by quantity or square and linear feet, billing frequency, contract length and value, and up to three sales reps for commission. Its frequencies are admin-defined day counts, not calendar rules. **Housecall Pro** service plans carry a discount on all jobs, up to 12 included visits a year and a monthly to yearly payment cadence, and attach to individual addresses. **Jobber** has no separate plan object: a recurring job carries the contract's start, repeat pattern and end.

The enterprise suites separate the commercial contract from the work it generates. **Dynamics 365** agreements "automatically generate work orders and invoices with predefined details, frequencies, and date ranges," with separate booking setups (what work, how often) and invoice setups. **Salesforce Field Service** has service contracts, contract line items for what's covered, entitlements for the support a customer may receive, and maintenance plans that "define the maintenance schedule for specific assets." **ServiceTrade**'s published schema keeps a `service_recurrence` table separate from an `invoice_recurrence` table, which is the cleanest statement of the rule that service and billing schedules are different things.

## How the Agreement Constrains Generation

An agreement promises visits; something has to turn that promise into dated work. [Recurring Schedules](/books/field-operations/recurring-schedules) owns that machinery: the generation models, the occurrence that represents each promised visit, and the idempotent generator. The agreement constrains it in four ways:

- **It supplies the rule:** which service, how often, at which property, inside which season.
- **It bounds the rule by its suspensions and term:** no occurrences inside a pause or hold interval (including one scheduled for next winter), none past the term end, and untouched future occurrences removed when the agreement is `cancelled` or `terminated`.
- **It stamps every occurrence with the terms version** that produced it, so a mid-term change never rewrites history.
- **It decides whether an unused visit is owed.** FieldPulse's on-demand agreements "do not generate jobs automatically," and an Unused Visit Policy either expires the allowance each period or rolls it over.

Repair and installation work found during an agreement visit (a cracked heat exchanger at a tune-up, a failed pool pump) isn't generated by the agreement. It's a separate work order that the agreement prices, through the member discount, and sometimes covers, through a warranty or a commercial contract's scope.

## Billing Against the Agreement

Billing follows its own schedule, and the vendors are explicit that the two can drift. FieldRoutes bills after each completed service by default; its other billing frequencies invoice independently of service, so skipped visits still bill. In Dynamics, closing an agreement work order creates an invoice for completed work, separately from the agreement's invoice setups, so the agreement's price list has to keep covered work from being billed twice. GorillaDesk supports "a monthly service that is billed quarterly." Housecall Pro won't change billing frequency on an active plan; you cancel and recreate it. [Billing Recurring Service](/books/field-operations/billing-recurring-service) covers how service-driven and calendar-driven billing reconcile.

One rule sits above every billing model: **no recurring-period charge runs on an agreement that isn't `active`**; the rule and its two refundable exceptions are in [Billing Recurring Service](/books/field-operations/billing-recurring-service#how-to-build-it), and the law behind them in [Consumer Protection](/books/field-operations/consumer-protection#charging-inside-the-window).

Prepaid agreements create a liability: the customer paid for visits not yet delivered. ServiceTitan can recognize revenue as services are performed, and Successware's accounting module supports "deferring revenue for agreement visits." Charging stored cards on a schedule is a merchant-initiated transaction with its own consent and retry rules ([Stored Cards & Recurring Billing](/books/payments/stored-credentials)).

## Pausing and Holding

Agreements stop temporarily for two reasons, and the difference decides who can lift the stop and what billing does:

- **Pause** (`paused`). The customer asked for a stop the plan doesn't already include: a winter away, a year with the pool drained for repairs. No visits, and usually no billing. A planned off-season is not a pause: it's the recurrence's `season`, and the agreement stays `active` through it ([Recurring Schedules](/books/field-operations/recurring-schedules)). FieldRoutes subscriptions carry seasonal start and end dates for that predictable case; GorillaDesk recurrences can skip selected months.
- **Hold** (`on_hold`). The company stopped service: non-payment or a dispute. No new visits and no new charges, while collection of what's already owed continues ([Collections & Retention](/books/field-operations/collections-and-retention)). Vendors differ on how it's placed: ServiceTitan's Suspended membership is set by staff and drops out of billing runs while its recurring services stay active, and FieldRoutes' subscription hold removes services from the job pool and can also be placed automatically by an accounts-receivable trigger rule. Whether a rule or a person places it is policy; either way, log who or what placed it and why.

Ending a live agreement while keeping its history is the other common shape. ServiceTitan cancels a membership (benefits stop, recurring services are deactivated, the record stays for reporting, and deleting is only for mistakes), Housecall Pro cancels an active plan and can later restore it, and FieldRoutes freezes a subscription (no longer due for service, a cancellation category required, reactivation possible). In this volume's terms all three are `terminated`, and reactivation is a new term or a new agreement, not a return to `active`, so churn and win-back are counted once each. FieldRoutes notes that freezing "does not freeze any future scheduled appointments"; those must be cancelled separately.

That last detail is the failure to design out. A pause or hold has to reach every derived object: future visits, open occurrences, recurring invoices and scheduled autopay. Two records carry it. `agreement_suspensions` holds the dated intervals (kind `pause` or `hold`, `valid_during`, reason, who), and they drive `agreements.status`, which is only the current state: `paused` or `on_hold` while today falls inside an interval, `active` otherwise. The occurrence generator and the billing run read the intervals, not the status, so a pause booked in October for January to March is honored by everything generated before January. Then decide whether the term extends by the paused time. My default is to extend prepaid and visit-count agreements ("four visits a year" still means four) and not extend month-to-month ones, and to tell the customer which at the moment they pause.

## Upgrades, Downgrades and Changes

Agreements change mid-term: a customer adds mosquito service, moves from quarterly to bimonthly, adds a second furnace, or gets a price increase. The vendors handle change cautiously. FieldPulse applies billing amount or frequency changes only to future draft invoices, keeps jobs the team edited when the generation window changes, and applies template edits only to agreements created afterward. Aspire treats renewal as the moment to change prices, takeoffs, checklists and route assignments.

The design that makes this tractable is **versioned terms**: the agreement is a stable identity, and its terms (lines, prices, frequency, covered assets) live in immutable versions that generated visits and invoices cite ([Versioned Entities](/docs/database/temporal-data#versioned-entities)). Plans are versioned the same way, so editing the "Gold" plan's price never reprices existing members. Proration of a mid-period change follows the general rules in [Plan Changes and Proration](/docs/payments/subscriptions#plan-changes-and-proration); the field-specific twist is that a frequency change also moves occurrences already generated, which [Recurring Schedules](/books/field-operations/recurring-schedules) handles by closing one recurrence version and opening the next.

A price increase on existing members is a notified migration, not an edit, because state automatic-renewal laws such as California's require advance notice of a price change.

## Term, Renewal and Cancellation

Renewal is either automatic re-generation or a sales event, and the industry does both.

**Automatic.** Housecall Pro plans "continue until customer cancels" and charge the card on file each period. I'd stagger renewal dates by service line to spread the cash and the notice workload across the year.

**Renewal as a sale.** ServiceTitan's Expiring Memberships tab generates renewal estimates. Successware's Agreement Manager pulls expiring fixed-term agreements and produces renewal documents. BuildOps sets a per-agreement renewal notice window such as 30, 60 or 90 days. Aspire's renewal settings choose whether to keep prior prices or recalculate from current catalog costs, and its guidance is that "contracts should not last more than 12 months," with multi-year commercial deals renewed every 12 months. FieldRoutes' renewal notices are templates selected by a window of days before or after the renewal date, which must not overlap. Commercial renewals are where repricing from current labor and material costs matters most, because a janitorial or grounds contract priced three years ago is often underwater.

**The law.** ROSCA, state automatic-renewal laws (California's the strictest well-known one) and the FTC's history on negative options are in [The Law of Automatic Renewal](/docs/payments/subscriptions#the-law-of-automatic-renewal); [Consumer Protection](/books/field-operations/consumer-protection) adds the field-specific rules, including the Cooling-Off Rule for door-to-door sales whose deadline [Signing the Agreement](/books/field-operations/signing-the-agreement) computes. What the agreement model must carry for them: the renewal terms version the customer consented to, the notice windows per jurisdiction, and a logged notice per renewal.

**Cancellation.** The general design (accept every channel, stamp the receipt time, store an effective date, confirm it) is in [Cancellation](/docs/payments/subscriptions#cancellation). In this industry the states matter: a request before the agreement is `active`, including within the cooling-off window, moves it to `cancelled` (`agreement.cancelled`); ending an `active` agreement moves it to `terminated` (`agreement.terminated`) with a `churn_type` (voluntary, involuntary or administrative) and a reason. A customer who moves away is voluntary churn unless the agreement transfers to the buyer. Churn definitions are in [Operating Metrics](/books/field-operations/operating-metrics), and the reasons feed [Collections & Retention](/books/field-operations/collections-and-retention). ServiceTitan distinguishes cancel from delete: cancelling stops discounts and recurring services on the chosen date, cancels later recurring events that weren't booked, can produce a refund and keeps the membership for reporting; delete is "only if it was sold as a mistake." FieldRoutes' portal cancellation requests create a task and a note for the office. A cancellation said to a technician at the door is a request too ([Collections & Retention](/books/field-operations/collections-and-retention#cancellations)).

![Agreement states: draft goes out for signature, is signed, and becomes active when the cooling-off window closes; a packet never signed or expired ends void, and a signed agreement cancelled before activation ends cancelled with a reason. Active renews into a new term version, moves to and from paused when the customer asks and on hold when the company stops service, and ends terminated with a reason; paused can also end terminated. The path to active and the renewal loop are accented, dashed arrows end the agreement, and terminal states have a double outline.](/diagrams/fo-service-agreements-states.svg "Active is the long middle and the only state that bills. The first visit is a milestone, not a state; void and cancelled end agreements that never went live, terminated ends one that did.")

These states are this volume's own vocabulary, the union of what the platforms separate, not any one vendor's list. Most products collapse several of them, and an import or integration has to map them explicitly ([Switching Platforms](/books/field-operations/switching-platforms)):

| This volume | Dynamics 365 agreement | FieldRoutes subscription | Housecall Pro service plan | Jobber (quote, then recurring job) | ServiceTitan membership |
| --- | --- | --- | --- | --- | --- |
| `draft` | Estimate | Not documented | Draft | Quote: Draft | Sold on an estimate or invoice, no draft state |
| `out_for_signature` | Estimate, with a substatus such as awaiting signature | Not documented | Sent | Quote: Awaiting response | Not documented |
| `signed` | Estimate, until set Active | Not documented | Not documented | Quote: Approved, then Converted to a job | Not documented |
| `active` | Active | Active | Active | Active recurring job | Active |
| `paused` | Substatus of Active | On hold (often at the customer's request) or seasonal dates | Not documented | Not documented | Suspended |
| `on_hold` | Substatus of Active | On hold, manual or by trigger rule | Not documented | Not documented | Suspended |
| `terminated` | Canceled, or Expired at the end date | Frozen | Canceled (restorable) | Job closed, then archived | Canceled, or Expired at the end of its duration |
| `fulfilled` | Expired | Not applicable | Not applicable | One-off job closed, then archived | Not applicable |
| `void`, `cancelled` | Canceled | Deleted | Draft or sent plan deleted | Quote archived | Deleted ("sold as a mistake") |

"Not documented" means I found no public help page for it, not that the product can't represent it. The two places the mapping loses information are the ones to watch: a vendor with one suspended state can't say whether the customer or the company stopped service, and a vendor that deletes unsigned or rescinded agreements leaves no record of the cooling-off cancellation.

## Warranties and Guarantees

Three different promises get called a warranty, and they need different models.

- **The company's guarantee.** Free re-service between scheduled visits, or a labor warranty on a repair. Model it as a benefit that lets a callback job be created at zero price and tracked against the agreement or the original repair, because callback rate is a quality metric ([Operating Metrics](/books/field-operations/operating-metrics)).
- **Renewable termite warranties,** often called termite bonds. FieldRoutes models them as renewal subscriptions: billing upon renewal, service as needed, a renewal date set at initial service completion or initial payment, and annual, semi-annual or two-year renewal. There, a full payment advances the renewal date from the renewal date, not the payment date, and a partial payment doesn't advance it; that's one design, and the alternative is ServiceTitan's fixed-duration membership, which expires and renews through a renewal estimate. Whichever you choose, compute the next term from the old term's end, never from the payment date, so a late payer doesn't drift the anniversary. The law reaches the document: Florida requires the first page of a new wood-destroying organism contract to state in bold whether it covers repair and retreatment, retreatment only, or nothing, and bars calling a limited guarantee "full" or "unlimited."
- **Manufacturer warranties on equipment.** These live on the asset, not the agreement; registration deadlines that change their terms, and the claims filed against them, are in [Repair, Install & Commercial Work](/books/field-operations/repair-and-installation#equipment-is-an-asset).

## Commercial Contracts and SLAs

Commercial agreements add what residential plans rarely have: response-time commitments, coverage hours, many sites under one contract, and budgets. The agreement records the entitlement (which sites, which hours, which targets); the clocks that run against it on each work order, and the on-call staffing behind them, are in [Repair, Install & Commercial Work](/books/field-operations/repair-and-installation#commercial-work-contracts-clocks-and-caps). Dynamics bills many service accounts through one billing account. BuildOps tracks budget, cost, revenue and margin per agreement "as work happens." Multi-site customers need portals that span sites; PestPac's lets them manage multiple locations with audit-only users for specific sites.

What the agreement must carry for those clocks is the target per priority (respond within 4 hours, restore a walk-in cooler within 24) and the calendar it counts in (business hours or 24/7, in the site's time zone), versioned with the rest of the terms so a disputed breach is measured against the target in force that day.

## How to Build It

The core extends the canonical `agreements` and `plan_versions` tables in [The Field Operations Business](/books/field-operations/field-operations-business) with the columns this chapter needs:

```sql
ALTER TABLE plan_versions
  ADD COLUMN initial_amount    BIGINT,
  ADD COLUMN recurring_amount  BIGINT,
  ADD COLUMN currency          TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN billing_model     TEXT NOT NULL,  -- per_visit | periodic | prepaid | seasonal
  ADD COLUMN billing_interval  TEXT,           -- month | quarter | year (periodic only)
  ADD COLUMN term_months       INTEGER,
  ADD COLUMN is_auto_renewing  BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE agreements
  ADD COLUMN signed_at         TIMESTAMPTZ,
  ADD COLUMN term_during       DATERANGE,      -- the current term, closed-open
  ADD COLUMN renewal_mode      TEXT,           -- auto | notify | manual
  ADD COLUMN churn_type        TEXT;           -- voluntary | involuntary | administrative (terminated only)

CREATE TABLE agreement_terms (                 -- versioned: one immutable row per change
  tenant_id       UUID NOT NULL,
  agreement_id    UUID NOT NULL REFERENCES agreements (id),
  version         INTEGER NOT NULL,
  plan_version_id UUID NOT NULL REFERENCES plan_versions (id),
  lines           JSONB NOT NULL,              -- services, add-ons, covered assets, amounts
  valid_during    DATERANGE NOT NULL,
  PRIMARY KEY (agreement_id, version)
);

CREATE TABLE agreement_suspensions (           -- the intervals that drive paused and on_hold
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  agreement_id    UUID NOT NULL REFERENCES agreements (id),
  kind            TEXT NOT NULL,               -- pause | hold
  valid_during    DATERANGE NOT NULL,          -- open upper bound until lifted
  reason          TEXT NOT NULL,
  placed_by_id    UUID REFERENCES staff_members (id),  -- null when a system rule placed it
  is_term_extended BOOLEAN NOT NULL
);
```

The agreement owns its `recurrences` (the rule, window and season per included service); the `occurrences` table and its generator are in [Recurring Schedules](/books/field-operations/recurring-schedules). Billing gets its own schedule, as ServiceTrade's split suggests. Emit an event for every transition (`agreement.signed`, `agreement.activated`, `agreement.cancelled` and `agreement.terminated` with their reason, plus pauses, holds and renewals) so scheduling, billing, communications and commissions react without polling ([Events & Async Messaging](/docs/architecture/events)).

Build vs buy: if you're a field business, buy. If you're building a platform, the agreement engine is core and worth building, because it's where pricing, scheduling and billing meet. Integrate rather than rebuild for payments, e-signature and tax.

What's genuinely hard: prorating mid-period changes against prepaid balances; renewals that reprice from current costs while honoring promised rates; keeping visit allowances honest when visits are skipped; seasonal agreements that span a year boundary; and a house sale mid-term, where a transferable termite warranty moves to the new owner and a membership usually doesn't. Test each with property-based tests over dates, especially the 29th to 31st of months ([Time & Date Formats](/docs/fundamentals/time)).

## Auditing

Agreements are contracts, so their history is evidence: "I never agreed to auto-renew," a chargeback asking for proof of authorization for a recurring charge ([Disputes & Chargebacks](/books/payments/disputes-and-chargebacks)), a regulator asking for renewal notices, a rep disputing a commission. The field-specific records:

- **The signed terms version** with the disclosures shown, the consent captured and the signature evidence, retained as long as the strictest automatic-renewal law you sell under requires.
- **Every pause, hold and resumption** with its reason and who placed it, including holds placed automatically by an accounts-receivable rule (as a system actor, not a person).
- **Cancellation requests,** when received and through which channel (portal, phone, a technician at the door), separately from when they were processed.
- **Renewal notices and price-change notices** with content and delivery result. Housecall Pro's activity feed logs the plan lifecycle and automatic charges, including failures; FieldRoutes keeps a renewal date log behind an access control.

[Audit Trails](/docs/architecture/audit-trails) covers the record shape and capture; [Audit Trails & Records](/books/field-operations/audit-trails-and-records) covers field records and retention.

## What This Means for the System You Build

- **Model the agreement separately from visits and invoices.** Terms generate work and billing; neither is the agreement.
- **Keep service and billing schedules separate.** Quarterly service billed monthly is normal; skipped visits must not silently keep invoicing.
- **Let the agreement bound generation.** It supplies the rule, stops occurrences while paused or on hold and after the term, and stamps each with its terms version.
- **Version plans and agreement terms.** Changes take effect from a date, generated records cite the version, and plan edits never reprice existing customers without notice.
- **Charge only active agreements.** Signed (cooling-off open), paused and on-hold agreements never bill a recurring period; an initial charge or deposit at signing is refundable within the cooling-off rules.
- **Make pauses and holds dated intervals that drive the status and that every consumer reads,** with the term extension rule stated to the customer.
- **Treat renewal as a configurable process.** Automatic or sales-led, with notices on windows that meet the strictest state law you sell under.
- **Accept cancellation everywhere,** including at the door. Cancelled before activation, terminated after with a churn type, each with a reason.
- **Model warranties by kind.** Company guarantees as benefits, termite warranties as renewal agreements, manufacturer warranties on assets with registration deadlines.
- **Let the agreement price repair work** through member discounts, and express commercial SLAs as clocks over visit events.

## References

**Specifications**

- [16 CFR 429.1: The Cooling-Off Rule](https://www.law.cornell.edu/cfr/text/16/429.1), the three-business-day cancellation right and ten-business-day refund for door-to-door sales
- [California Business and Professions Code 17602](https://codes.findlaw.com/ca/business-and-professions-code/bpc-sect-17602/), automatic renewal disclosures, consent records, renewal and price-change notices
- [Florida Statutes 482.227: Guarantees and warranties](https://www.flsenate.gov/Laws/Statutes/2026/482.227), 2026 text: first-page disclosure of repair and retreatment terms in termite contracts

**Reference**

- [ServiceTitan: Understanding membership setup](https://help.servicetitan.com/how-to/understanding-membership-setup), the membership wizard, recurring service types and renewal items
- [ServiceTitan: Memberships paid up front](https://help.servicetitan.com/residential-s-r/docs/configure-memberships-for-revenue-paid-up-front), fixed-duration memberships, renewal tasks and revenue recognition
- [ServiceTitan: Basic memberships workflows](https://help.servicetitan.com/docs/basic-memberships-workflows), memberships sold as tasks, expiring memberships and add-ons
- [ServiceTitan: Edit customer memberships](https://help.servicetitan.com/docs/edit-customer-memberships), Active, Suspended, Expired, Canceled and Deleted and what each stops
- [ServiceTitan: Cancel and delete customer memberships](https://help.servicetitan.com/docs/cancel-and-delete-customer-memberships), what cancellation stops and when to delete
- [FieldRoutes: Adding a service type subscription](https://knowledgebase.fieldroutes.com/docs/adding-a-service-type-subscription.md), subscription fields for service, billing and sales
- [FieldRoutes: Frequency options](https://knowledgebase.fieldroutes.com/docs/frequency-options.md), frequencies as day counts
- [FieldRoutes: Set up recurring billing](https://knowledgebase.fieldroutes.com/docs/set-up-recurring-billing.md), billing timers independent of service
- [FieldRoutes: Placing subscriptions on hold](https://knowledgebase.fieldroutes.com/docs/placing-subscriptions-on-holds.md), holds, reasons and automatic holds from trigger rules
- [FieldRoutes: Freezing vs deleting a subscription](https://knowledgebase.fieldroutes.com/docs/freezing-vs-deleting-a-subscription.md), freezing keeps data but not future appointments
- [FieldRoutes: Renewal subscriptions](https://knowledgebase.fieldroutes.com/docs/renewal-subscriptions.md), termite warranty renewals, renewal dates and the renewal date log
- [FieldRoutes: Renewal notices](https://knowledgebase.fieldroutes.com/docs/renewal-notices.md), notice templates by day ranges
- [FieldRoutes: Online service cancellation](https://knowledgebase.fieldroutes.com/docs/online-service-cancellation.md), portal cancellation requests
- [Housecall Pro: Create service plans](https://help.housecallpro.com/en/articles/2369524-create-service-plans), discounts, included visits, duration and payment cadence
- [Housecall Pro: How to sell a service plan](https://help.housecallpro.com/en/articles/2921514-how-to-sell-a-service-plan), plans attached to addresses
- [Housecall Pro: Service plans FAQs](https://help.housecallpro.com/en/articles/5485025-service-plans-faqs), automatic charges and fixed billing frequency
- [Housecall Pro: Edit or delete a service plan](https://help.housecallpro.com/en/articles/2962784-edit-or-delete-a-service-plan), draft and sent plans deleted, active plans cancelled, cancelled plans restored
- [Housecall Pro: Activity feed](https://help.housecallpro.com/en/articles/4154392-activity-feed), service plan lifecycle and automatic charge history
- [Jobber: Create a recurring job](https://help.getjobber.com/en/articles/create-a-recurring-job/), recurring visits and invoice schedules
- [Jobber: Quote list page and key metrics](https://help.getjobber.com/en/articles/quote-list-page-and-key-metrics/), quote statuses from draft through approved, converted and archived
- [Jobber: What if a job gets canceled](https://help.getjobber.com/en/articles/what-if-a-job-gets-canceled/), closing a job, removing future visits and archiving
- [GorillaDesk: Recurring jobs](https://intercom.help/gorilladesk/en/articles/1089485-recurring-jobs), separate invoice frequencies and month exceptions
- [Microsoft: Agreements overview](https://learn.microsoft.com/en-us/dynamics365/field-service/set-up-customer-agreements), agreements generating work orders and invoices
- [Microsoft Learn: Create agreements](https://learn.microsoft.com/en-us/training/modules/define-agreements/create-agreements), Estimate, Active, Expired and Canceled system statuses and substatuses
- [Microsoft: Set up agreements to generate work orders](https://learn.microsoft.com/en-us/dynamics365/field-service/set-up-agreements-work-orders), invoices for completed agreement work orders and the negotiated price list
- [Salesforce: Field Service Developer Guide](https://resources.docs.salesforce.com/latest/latest/en-us/sfdc/pdf/field_service_dev.pdf), service contracts, contract line items, entitlements and maintenance plans
- [Fivetran: ServiceTrade connector schema](https://fivetran.com/docs/connectors/applications/servicetrade/connector-schema), separate service and invoice recurrence tables
- [FieldPulse: Maintenance agreements](https://help.fieldpulse.com/en/articles/5722045-maintenance-agreements), on-demand agreements, unused visit policy and change behavior
- [Successware: Agreement Manager](https://www.successware.com/blog/2023/august/did-you-know-agreement-manager/), renewal documents for expiring agreements
- [Successware: FAQs](https://www.successware.com/faqs), deferred revenue for agreement visits
- [BuildOps: Service agreements](https://buildops.com/platform/service-agreements/), renewal notice windows and per-agreement margin
- [Aspire: Contract renewal settings](https://guide.youraspire.com/docs/understanding-contract-renewal-settings), renewal pricing from prior or current costs
- [Aspire: Best practices for multi-year contracts](https://guide.youraspire.com/docs/best-practices-for-multi-year-contracts), twelve-month renewal cycles
- [PestPac: Customer portal](https://www.pestpac.com/features/customer-portal), multi-location commercial accounts and audit-only users
