+++
title = "Charges & Resident Ledgers"
description = "The charge catalog, recurring postings, proration, late fees and their caps, payment application order, concessions, and how the resident ledger meets the GL."
category = "Property Tech Industry"
order = 1714
part = "Rent and Resident Money"
tags = ["property-tech", "resident-ledger", "late-fees", "proration", "concessions", "accounting"]
+++

Every dollar a resident owes starts as a charge. Rent on the first, pet rent and parking beside it, a prorated first month, a late fee on the sixth, a utility bill allocated across the building, a repair charged back after move-out, a free month taken off the top: each is a row on the lease's ledger, and that ledger is the record the resident disputes, the owner's statement summarizes, the eviction court reads, and the auditor ties to the general ledger. The software looks like bookkeeping, but almost every line is regulated. States cap late fees and set when they may start, some states say a payment must go to rent before fees, fee transparency laws decide which charges must be in the advertised price, and subsidy programs say which part of the rent the resident owes at all. This chapter covers the resident ledger: the charge catalog, the posting run, proration, late fees, the order payments are applied in, concessions, and how all of it reaches the general ledger. Money arriving is [Collecting Rent](/books/property-tech/collecting-rent); money not arriving is [Delinquency, Collections & Eviction](/books/property-tech/delinquency-and-eviction).

## How the Platforms Do It

Every platform in this market has the same parts: a catalog of charge codes mapped to GL accounts, recurring charges on the lease, a nightly or monthly job that posts them, a late fee engine, and a rule for which open charges a payment pays. They differ in how much of the law they carry for you, and how much is a setting someone has to get right.

- **Recurring posting is table stakes.** Yardi Breeze describes automated recurring rent and fee postings, and tenant charges for maintenance work posted from the work order. Every suite in [The Software Landscape](/books/property-tech/software-landscape) does the same.
- **Payment allocation is a setting.** Buildium's default applies money to the open item with the largest balance first, "typically rent", and its custom allocation lets a manager set a priority list globally, per property or per lease; once the listed items are paid, the remainder falls back to largest-balance-first. Rentvine lets a manager rank GL accounts (rent, then late fees, then NSF fees), oldest first within each, and everything else oldest first after. TurboTenant documents that an "oldest charges first" setting applies only when a payment is made: changing it later doesn't re-allocate earlier payments.
- **Proration is a setting too.** Rentvine offers three methods (actual days in the month, a 30-day month, and actual days in the year), per-charge proration at move-in, and an option to collect the full first month and prorate the second.
- **Lease-to-billing audits are now products.** Entrata's Lease File Audit abstracts lease documents into structured terms and compares them with billing to find charges missing from resident accounts and billing errors that could overcharge residents. That such a product sells tells you how often the lease and the ledger disagree.
- **Concessions are moving off the ledger.** RealPage's LOFT Loyalty lets staff send residents "digital concessions" (move-in gifts, renewal offers redeemable at retail brands), funded by the client, with unused funds recovered, as an alternative to rent concessions on the ledger.

The rest of the chapter is what those settings have to encode.

## The Charge Catalog

The charge code is where a fee becomes a fact the platform can reason about. The core model's `charge_codes` has a code, a name and a category; a working catalog needs more, because each code answers questions regulators and owners ask:

- **Is it mandatory?** A charge every resident must pay (pest control, valet trash, a "technology package", utility administration) is part of the price. The FTC's December 2025 order against Greystar requires a "Total Monthly Leasing Price" that includes such fees ([The Property Business](/books/property-tech/property-business#the-property-s-money)), and Colorado's HB25-1090, effective January 1, 2026, requires anyone advertising a price to disclose the maximum total price clearly and conspicuously and bars landlords from requiring certain fees at all, with tenants entitled to demand reimbursement of unlawfully imposed charges plus damages. [Listings, Websites & Marketing](/books/property-tech/listings-and-marketing#fee-transparency-and-all-in-pricing) owns the display; the catalog has to be able to answer "what does this unit really cost per month," which means each code carries a default for whether it's mandatory, recurring, and included in the advertised price. The default isn't the answer: the same code can be mandatory at one community and optional at another, so the property's effective-dated fee terms in [Listings](/books/property-tech/listings-and-marketing#how-to-build-it) decide per property and date.
- **Is it rent?** In many states, only rent supports a nonpayment eviction. Washington says a tenant's right to possession "may not be conditioned on a tenant's payment or satisfaction of any monetary amount other than rent." Colorado and Oregon bar terminating for unpaid late fees. So each code needs to say whether it's rent for legal purposes, which is not the same as its accounting category: a mandatory monthly fee may be "rent" under one lease and state and not under another.
- **Is it subsidized?** Under a housing assistance contract, part of the rent is owed by the agency, not the resident. Minnesota and Colorado both say late fees apply only to the tenant's portion. That's a ledger party, not a charge code, and it's why the schema below adds `ledger_party` to charges ([Subsidized & Affordable Housing](/books/property-tech/affordable-housing#the-owner-side)).
- **Where does it post?** Every code maps to a GL account (rent income, other income, a liability for deposits or prepaid rent), which is how the resident ledger becomes the owner's income statement. The mapping is per chart of accounts, so it lives in [Trust Accounting & the General Ledger](/books/property-tech/trust-accounting#the-chart-of-accounts), keyed by the code.
- **Is it taxable?** A few charges (some short-term or commercial rents, some resold utilities or services) carry sales or lodging tax in some places. Tax is a code per item, as [Sales Tax](/docs/payments/sales-tax#a-tax-code-per-item) describes.

My rule: a fee nobody can classify on these axes doesn't get a code. Charge codes are created by a small group, with the classification reviewed when they're created, because a code added by a site manager at 5 p.m. is exactly the fee a regulator finds.

## Recurring Charges and the Posting Run

A recurring charge is a promise on the lease (`lease_charge_schedules`); a posted charge is the fact (`charges`). The posting run turns one into the other:

1. **Select schedules due.** For each property, on its business date in its time zone ([Business Dates](/docs/fundamentals/time#business-dates-business-days-and-holidays)), find schedules whose next service period starts within the posting window. Most operators post rent a few days before the first so it shows on the portal when residents look.
2. **Compute each amount.** Full period, or prorated if the schedule starts or ends inside the period.
3. **Post idempotently.** The core model's unique key on `(tenant_id, schedule_id, service_period)` means a run that crashes and restarts can't post rent twice. The run itself is a row (`charge_posting_runs`), with what it selected and what it posted, so "why didn't unit 204 get charged" has an answer.
4. **Emit `charge.posted`** for statements, notifications and integrations.

The run is a [background job](/docs/architecture/background-jobs#scheduling) with three traps. **Schedules change mid-period.** A rent change effective the 15th is two schedule rows, and the run posts two charges, each prorated; editing the amount on one row rewrites history ([Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows)). **Leases end mid-period.** A notice to vacate or a skip stops the schedule at the move-out date, and anything already posted past it is reversed, not deleted. **Posting in advance means reversing later.** If rent posts on the 28th for the coming month and the resident moves out on the 30th, the posted charge is reversed with a reason, which is why the core model has `reverses_charge_id`.

Other recurring charges follow the same path: pet rent, parking and storage on a `rentable_space`, the insurance program charge in [Insurance, Deposits & Guarantees](/books/property-tech/insurance-deposits-and-guarantees#master-and-force-placed-policies), the monthly utility allocation in [Utilities & Energy](/books/property-tech/utilities-and-energy#resident-utility-billing), and resident products in [Resident Financial Products & Ancillary Revenue](/books/property-tech/resident-financial-products#disclosure-and-revenue-share). One-off charges (an application fee, a damage chargeback from a completed work order, a returned payment fee) are posted by an action, not a schedule, and carry who posted them and why.

## Proration

A lease that starts on the 17th owes part of a month. Three methods are in common use, and the platforms offer all three as settings:

| Method | Daily rate | Rent $1,500, move in on the 17th of a 31-day month |
| --- | --- | --- |
| **Actual days in the month** | rent / days in that month | 15 days × $1,500 / 31 = $725.81 |
| **30-day month** | rent / 30 | 15 days × $50 = $750.00 (14 days if the month is treated as 30 days long) |
| **Actual days in the year** | rent × 12 / 365 | 15 days × $49.32 = $739.73 |

The method is a contract term: the lease or the property's policy says which one applies, and the platform records which method computed every prorated charge, so the same number comes out when the resident questions it a year later. Three more decisions sit beside it:

- **Which charges prorate.** Rent usually; a flat monthly fee for a service may or may not. Prorate per charge code, with the default on the code and an override on the schedule.
- **First month or second.** Some operators collect a full first month at move-in and prorate the second, so the move-in payment is round and the remainder rides on the next bill.
- **Rounding.** Compute in integer minor units, round once per charge, and record the rule ([Rounding](/docs/payments/money#rounding)); a resident comparing a portal number with a hand calculation will find a one-cent disagreement and assume the rest is wrong too.

Move-out proration is the mirror image, and in some states it's also a legal question (whether rent stops on the day the resident returns keys or at the end of the notice period). That's [The Lease](/books/property-tech/the-lease#notices) and [Move-In & Move-Out](/books/property-tech/move-in-and-move-out#move-out); the ledger's job is to post what those rules decide.

## Late Fees

A late fee is a charge posted by a rule: if a lease's rent is still unpaid on a day, post a fee computed from a formula. Both the day and the formula are regulated, and the regulations differ in ways that matter to the code:

| State | When a fee may start | Cap | Other rules |
| --- | --- | --- | --- |
| **New York** (Real Property Law 238-a) | Not unless rent is unpaid within 5 days of the due date | $50 or 5% of monthly rent, whichever is less | Waivers in the lease are void |
| **Colorado** (SB21-173) | Rent at least 7 calendar days late | The greater of $50 or 5% of the past-due rent | One fee per late payment; no interest on fees; none on the subsidy portion; no recouping a fee from a rent payment; no eviction solely for fees; written notice within 180 days |
| **Texas** (Property Code 92.019) | Rent unpaid two full days after the due date | Must be reasonable; safe harbor of 12% of the period's rent for structures of up to 4 units and 10% above 4 | Must be in a written lease; an initial plus daily fee counts as one fee; $100 plus three times the fee plus attorney's fees for a violation |
| **Oregon** (ORS 90.260) | Rent not received by the 4th day of the period | A reasonable flat fee; or a daily fee from the 5th day up to 6% of the flat fee; or 5% of rent per 5-day period | One method; no deducting a prior fee from a later rent payment; unpaid fees can't support a nonpayment termination |
| **Washington** (RCW 59.18.170) | Not for rent paid within 5 days of the due date | Not capped in that section | A tenant whose primary income is monthly government assistance may propose a due date up to 5 days later |
| **Minnesota** (504B.177) | When the written or oral agreement says | 8% of the overdue rent payment | An early-payment "discount" date isn't the due date; under a HAP contract, only the tenant's portion |

That's six states of fifty, as of October 2026, plus cities that add their own rules and federal programs that override state caps for subsidized tenancies (Minnesota's statute lets a landlord follow a federal late fee schedule where it conflicts). No platform should ship this table in code. Late fee rules are effective-dated data per jurisdiction ([Rules as Data](/docs/architecture/rules-as-data#effective-dates-and-versions)), maintained by someone accountable for them, and [Landlord-Tenant Law as Data](/books/property-tech/landlord-tenant-law#sourcing-and-keeping-rules-current) covers sourcing and keeping them current. The property's own policy sits inside the legal envelope: the lease sets the operator's fee, and the engine posts the lesser of the policy and the cap.

The design points the table forces:

- **The base differs.** A percentage of "monthly rent" (New York), of "past-due rent" (Colorado, Minnesota) or of "rent for the rental period" (Texas) are three different numbers once a resident has paid part. Store the base as a field of the rule.
- **The clock differs.** Five days "of the date it was due", seven calendar days, "two full days after", "by the fourth day". Compute the first eligible day in the property's business calendar and store it on the case, as [Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored) says, so a later rule change doesn't silently move a past deadline.
- **Daily fees accumulate under a cap.** Texas counts an initial plus daily fee as one fee; Oregon caps the daily rate against the flat fee and stops accrual when rent (excluding the fee) is paid. The engine needs to know the total already charged for this period's lateness, not just today's increment.
- **Fees are not rent.** Colorado, Oregon and Washington each stop a landlord using unpaid fees to evict, and Colorado and Oregon forbid taking a fee out of the next rent payment, which would turn a paid month into a late one. That's a payment application rule, below.
- **Waivers are a workflow.** Staff waive fees all the time (a bank error, a first offense, a resident in an assistance program). A waiver is a reversing charge with a reason and an approver, reported per property, because fee waiver patterns are a fair housing question as much as a revenue one.
- **Subsidized portions are excluded.** Fees run against the resident's share only.

The late fee run is the same idempotent job as the posting run: one fee per lease per rent period per rule step, keyed so a rerun can't double it.

## Payment Application Order

When a resident owes rent, a late fee and a utility charge and pays less than all three, the platform has to decide what the payment paid. It matters more than it looks. Applied to fees first, a full rent payment can leave rent short and start a new late fee and a nonpayment notice; applied to rent first, the fees remain owed but can't support an eviction in states that bar evicting over fees.

Some states decide it for you:

- **Washington** requires a landlord to "first apply any payment made by a tenant toward rent before applying any payment toward late payments", damages, legal costs or attorneys' fees (RCW 59.18.283).
- **Colorado** forbids recouping a late fee from a rent payment.
- **Oregon** forbids deducting a previously imposed late charge from a later rent payment.

Elsewhere, the lease decides, and leases commonly say the reverse: payments go to fees, deposits and charges first, rent last. My default, everywhere, is rent first and oldest first within rent, then everything else oldest first. It's what the strictest states require, it keeps "is rent paid" a simple question, and it's the order a court will understand.

As data, an application rule is an ordered list of steps, each matching charges by category, code, ledger party or "counts as rent", with an ordering inside the step (oldest due date first), and a fallback step for anything left. The rule in force is resolved per property and lease from the jurisdiction's mandatory order and the operator's policy, with the law winning. Three behaviors make it work:

- **Apply at the moment of payment, and record the rule.** Each `payment_applications` row carries the rule version that produced it. TurboTenant documents the consequence of not doing this: changing the setting doesn't move old payments, and nobody can tell later which setting was in force.
- **Re-apply by reversal.** When a payment is returned, its applications are reversed (negative rows), and the charges they paid are open again. When a charge is reversed, the payment applied to it becomes unapplied credit and runs through the rule again. Nothing is edited ([Payments Are Applied, Not Assigned](/docs/payments/payment-states#payments-are-applied-not-assigned)).
- **Prepayments wait.** Money beyond what's due is unapplied credit on the lease, applied by the rule when the next charges post. It's a liability in the GL until then.

A per-member twist: roommates who each pay their share want to see that their share is paid. Most platforms keep one ledger per lease (the lease is jointly owed), and some, mostly in student housing, bill individually by bed. The schema allows a charge to name a `responsible_person_id`, so individually billed leases can apply each person's payment to their own charges first. [Student Housing](/books/property-tech/student-housing#by-the-bed-leasing-and-liability) covers the by-the-bed model.

## Concessions

A concession is a price reduction given to sign or renew: a month free, $500 off move-in, a reduced rate for the first six months. [The Lease](/books/property-tech/the-lease#concessions) owns the concession's terms; this chapter posts against them. How it's booked decides what the rent roll says, what the resident sees, and what the owner's income statement shows.

- **Upfront.** A one-time credit posted as a negative charge (a concession code) at move-in or in a named month. Simple, and the face rent stays at the full amount, which is often the point: the next lease and the renewal are priced off face rent.
- **Recurring.** A negative recurring schedule for some or all of the term, so every month shows rent and a credit.
- **Effective rent.** Face rent minus concessions spread over the term: $1,800 face with one month free on a 12-month lease is $1,650 effective. [Revenue Management & Pricing](/books/property-tech/revenue-management#renewal-pricing) prices in effective terms, and renewal offers compare against it.

The ledger and the books diverge here. A lessor with an operating lease recognizes rental income on a straight-line basis, so a free month is spread across the term in the GL even when the resident's ledger shows a zero-dollar month ([Grant Thornton's lessor discussion](https://www.grantthornton.com/insights/articles/audit/2020/snapshot/april/accounting-for-rent-concessions) describes the "normal straight-line rental income" that continues through rent relief). Many apartment operators book concessions as a contra-revenue line in the month given instead and report the difference; that's a policy finance chooses, not a fact the product decides ([The Product Keeps Facts, Finance Picks Policy](/docs/payments/accounting#the-product-keeps-facts-finance-picks-policy)). The product's job is to keep enough to support either: each concession as its own record with its total, its schedule and the lease it belongs to.

Concessions come back when leases end early. A lease that granted a free month for a 12-month term and ends at month seven often provides that the unearned concession is repaid. That's a charge the lease authorizes, computed from the concession record, and in some places limited by law; record the clause that authorizes it. **Digital concessions** (gift cards or retail credits instead of a rent credit) aren't rent reductions at all: they're marketing spend paid to a third party, outside the resident ledger, and they belong in [Rewards and Loyalty](/books/property-tech/resident-financial-products#rewards-and-loyalty).

## Chargebacks From Operations

Damage repaired by maintenance, a lockout fee, a replaced key fob, a towing reimbursement: operations generate one-off charges. The work order in the core model has `is_resident_chargeable`; when it closes, the platform proposes a charge from its time and materials, a manager approves it, and it posts with a link to the work order and its photos ([Proof of Service](/books/field-operations/proof-of-service) has the evidence model). During a tenancy these are ordinary charges; at move-out they're deposit deductions, governed by itemization deadlines in [Move-In & Move-Out](/books/property-tech/move-in-and-move-out#damage-charges). Either way, the charge without the evidence is the one that gets refunded.

## The Resident Ledger and the General Ledger

The resident ledger is a view, not a table: every charge, reversal, payment and application on a lease, in date order, with a running balance. The general ledger is the owner's books: rent income, other income, receivables, prepaid rent, deposits held, cash. The two meet through the double-entry entries that every charge and payment posts ([Double-Entry Ledger](/docs/payments/payment-states#double-entry-ledger)):

| Event | Debit | Credit |
| --- | --- | --- |
| Rent posts | Resident receivable | Rent income |
| Late fee posts | Resident receivable | Other income (fees) |
| Concession posts | Concession (contra-revenue) | Resident receivable |
| Payment received, applied | Cash (operating or trust) | Resident receivable |
| Payment received, unapplied | Cash | Prepaid rent (liability) |
| Payment returned | Resident receivable | Cash |
| Balance written off | Bad debt expense | Resident receivable |

Four rules follow:

- **The sum of resident balances equals the receivable account.** Every day, per property and per owning entity. A difference is a bug, and the reconciliation that finds it is part of the month-end close ([Month-End Close](/docs/payments/accounting#month-end-close)).
- **Aging comes from the ledger, not a column.** The aged receivables report (current, 30, 60, 90 days) is computed from open charges and their due dates, which is why application order changes aging: rent-first application leaves fees aging instead of rent. Delinquency starts there.
- **The ledger is per landlord entity.** The resident owes the lease's landlord of record, and the receivable sits on that entity's books, in a property that may be owned by an LLC inside a fund. [Trust Accounting & the General Ledger](/books/property-tech/trust-accounting#the-general-ledger-by-entity) covers the entity GLs and trust accounts the cash lands in.
- **Closed periods stay closed.** A correction to a charge from a closed month posts in the current period with a reference to the original ([Closed Periods Stay Closed](/docs/payments/accounting#closed-periods-stay-closed)); the resident ledger shows the correction on the day it happened.

The resident sees the ledger in the portal, and residents read it closely. Show every charge with its code's plain-language name, its service period, what was applied to it and what's open, and never show a balance that a reader can't reconcile from the lines above it.

## How to Build It

The core model's `charge_codes`, `lease_charge_schedules`, `charges` and `payment_applications` gain the columns and tables this chapter needs:

```sql
ALTER TABLE charge_codes
  ADD COLUMN is_mandatory         BOOLEAN NOT NULL DEFAULT FALSE,  -- default; listings' fee_terms decide
                                                                   -- per property and date
  ADD COLUMN is_recurring         BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN in_advertised_price  BOOLEAN NOT NULL DEFAULT FALSE,  -- default, as above
  ADD COLUMN counts_as_rent       BOOLEAN NOT NULL DEFAULT FALSE,  -- for notices and application order;
                                                                   -- jurisdiction rules can override
  ADD COLUMN prorates             BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN application_priority INT NOT NULL DEFAULT 100,        -- lower is paid first in the default rule
  ADD COLUMN tax_code             TEXT;                            -- null: not taxable

ALTER TABLE charges
  ADD COLUMN ledger_party          TEXT NOT NULL DEFAULT 'resident'
               CHECK (ledger_party IN ('resident', 'subsidy', 'third_party')),
  ADD COLUMN responsible_person_id UUID REFERENCES people (id),    -- individually billed leases
  ADD COLUMN posting_run_id        UUID,                           -- null for one-off charges
  ADD COLUMN work_order_id         UUID REFERENCES work_orders (id),
  ADD COLUMN proration_method      TEXT CHECK (proration_method IN ('actual_days_month',
                                     'thirty_day_month', 'actual_days_year')),
  ADD COLUMN lease_concession_id   UUID REFERENCES lease_concessions (id),  -- concession credits
  ADD COLUMN reason                TEXT,                           -- required for one-offs and reversals
  ADD COLUMN posted_by             UUID NOT NULL REFERENCES users (id);  -- staff, or the run's
                                                                   -- service user

ALTER TABLE payment_applications
  ADD COLUMN application_rule_id UUID REFERENCES payment_application_rules (id);  -- the order used

CREATE TABLE charge_posting_runs (       -- one row per property per run
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  property_id   UUID NOT NULL REFERENCES properties (id),
  kind          TEXT NOT NULL CHECK (kind IN ('recurring', 'late_fee')),
  business_date DATE NOT NULL,
  status        TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  selected      INT NOT NULL DEFAULT 0,
  posted        INT NOT NULL DEFAULT 0,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at   TIMESTAMPTZ,
  UNIQUE (tenant_id, property_id, kind, business_date)
);

-- Late fees use the rules catalog in Landlord-Tenant Law as Data, not a table of their
-- own: the law's cap is a legal_rules row of rule type 'late_fee_cap' (citation via its
-- legal_sources row), and the operator's policy is a tenant_policies row of the same type,
-- never looser than the law. Both share one params_schema:
--   {"starts_after": "5 days", "day_basis": "calendar" | "full_days_after" | "day_of_period",
--    "base": "monthly_rent" | "past_due_rent" | "period_rent",
--    "flat_amount": 5000, "percent": 0.05, "cap_rule": "lesser" | "greater",
--    "daily_amount": null, "daily_cap_percent_of_flat": null,
--    "max_fees_per_period": 1, "tenant_portion_only": true}
-- The late fee run records a rule_evaluations row per fee it posts.

CREATE TABLE payment_application_rules ( -- the operator's order; ordered steps
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  property_id   UUID REFERENCES properties (id),
  lease_id      UUID REFERENCES leases (id),
  steps         JSONB NOT NULL,          -- [{"match": {"counts_as_rent": true}, "order": "oldest_due"},
                                         --  {"match": "any", "order": "oldest_due"}]
  valid_during  DATERANGE NOT NULL
);
-- A jurisdiction's mandatory order is a legal_rules row of type 'payment_application_order'
-- with the same steps; where one applies it wins, and the evaluation is recorded.

-- lease_concessions is defined in The Lease: kind (upfront, recurring, digital), the
-- signed document that authorizes it, the negative schedule for recurring ones, the
-- clawback method and its status. This chapter posts against it: an upfront concession
-- is a negative charge carrying lease_concession_id, a recurring one is its schedule's
-- postings, and a clawback is a charge computed from clawback_method.

CREATE VIEW resident_ledger AS           -- what the resident and the court see
SELECT c.tenant_id, c.lease_id, c.posted_on AS entry_date, 'charge' AS kind,
       c.id AS entry_id, cc.name AS description, c.service_period, c.ledger_party,
       c.amount, c.due_on
  FROM charges c JOIN charge_codes cc ON cc.id = c.charge_code_id
UNION ALL
SELECT p.tenant_id, p.lease_id, p.created_at::date, 'payment',
       p.id, 'Payment', NULL, 'resident', -p.amount_captured, NULL
  FROM payments p
 WHERE p.lease_id IS NOT NULL AND p.status = 'succeeded';
```

The view is deliberately simple; the portal adds a running balance with a window function per lease and ledger party, and returned payments appear as their own reversing entries from the Payments model. Decisions behind the shape:

- **Jurisdiction rules and operator policies share one rules catalog.** The late fee cap is a `late_fee_cap` rule and the operator's fee a `tenant_policies` row of the same type ([Landlord-Tenant Law as Data](/books/property-tech/landlord-tenant-law#how-to-build-it)); the late fee engine evaluates both and posts the lesser, recording both in a `rule_evaluations` row, so a fee can be proven lawful on the day it posted. Application order follows the same pattern with `payment_application_order` rules over the operator's `payment_application_rules`.
- **`counts_as_rent` is a default, not the answer.** Whether a mandatory fee is rent depends on the lease and the jurisdiction; the notice generator in [Notices](/books/property-tech/delinquency-and-eviction#notices) resolves it per lease and records the resolution.
- **`ledger_party` splits one lease's receivable** into the resident's share and a subsidy agency's share (or another third party's), with late fees, aging and notices running only on the resident's.
- **Late fee runs share the posting run table,** so the same idempotency key and the same "what ran on the 6th" answer cover both.
- **Concessions are records with charges,** not just negative charges, so effective rent, straight-lining and early-termination repayment can be computed from one row.

## Auditing

- **Every charge has a source.** A schedule and a posting run, or an action with a user, a reason and, for chargebacks, a work order. Reversals carry the reason and the approver.
- **Every late fee can be proven lawful.** The rule versions (law and policy) that computed it, the base and the days late on the posting date.
- **Every application can be reproduced.** The rule version on each application row, so a resident's dispute ("I paid rent, why am I late?") can be answered with the order in force that day.
- **The ledger ties to the GL daily,** per property and entity, and the tie-out is kept.
- **The catalog has a history.** Who created each charge code, how it was classified, and every change to its mandatory, advertised-price and rent flags, because a fee transparency inquiry asks what the code meant on the date of the ad ([Audit Trails](/docs/architecture/audit-trails#snapshot-what-changes-underneath-you)).

## What This Means for the System You Build

- **Classify every charge code** as mandatory or optional, recurring or one-off, in or out of the advertised price, rent or not, before it can be used.
- **Post recurring charges from schedules in an idempotent run,** recorded as a row, on the property's business date; change schedules by new effective-dated rows and correct posted charges by reversal.
- **Make proration a recorded method,** chosen per lease or property, applied per charge code, and rounded once.
- **Keep late fee law and late fee policy as effective-dated data,** post the lesser, compute the first eligible day and store it, and never charge fees on a subsidy portion.
- **Apply payments by a versioned rule, rent first by default,** honor states that require it, and re-apply only by reversal.
- **Record concessions as their own objects** so effective rent, straight-line income and early-termination repayment come from the same row.
- **Prove the resident ledger equals the receivable** every day, per entity, and show residents a ledger they can reconcile line by line.

## References

**Statutes**

- [New York Real Property Law 238-a](https://www.nysenate.gov/legislation/laws/RPP/238-A), late fees after five days capped at the lesser of $50 or 5% of monthly rent; application and background check fee limits; returned check fees
- [Colorado SB21-173](https://leg.colorado.gov/bills/sb21-173), late fees after seven days, capped at the greater of $50 or 5% of past-due rent; one fee per late payment, no recouping from rent, no fees on subsidy portions, no eviction solely for fees
- [Colorado HB25-1090](https://leg.colorado.gov/bills/hb25-1090), total price disclosure and prohibited rental fees, effective January 1, 2026
- [Texas Property Code 92.019](https://texas.public.law/statutes/tex._prop._code_section_92.019), late fees after two full days, reasonableness safe harbors of 12% and 10%, penalties
- [Oregon ORS 90.260](https://oregon.public.law/statutes/ors_90.260), late charges from the fifth day, flat, daily and percentage methods, no deducting fees from rent, no nonpayment termination for fees
- [Washington RCW 59.18.170](https://app.leg.wa.gov/rcw/default.aspx?cite=59.18.170), no late fee within five days of the due date, due date change for tenants on monthly government assistance
- [Washington RCW 59.18.283](https://app.leg.wa.gov/rcw/default.aspx?cite=59.18.283), payments applied to rent before late fees and other charges; possession conditioned only on rent
- [Minnesota Statutes 504B.177](https://www.revisor.mn.gov/statutes/cite/504B.177), late fees capped at 8% of the overdue payment; early-payment discounts; federal schedules and tenant-portion-only fees under HAP contracts

**Reference**

- [Grant Thornton: Accounting for rent concessions](https://www.grantthornton.com/insights/articles/audit/2020/snapshot/april/accounting-for-rent-concessions), lessors' straight-line rental income through rent relief

**In practice**

- [Buildium: Introducing custom payment allocation](https://buildium.com/blog/introducing-custom-payment-allocation), largest-balance-first default and priority lists by account, property and lease
- [Rentvine: How to change your payment allocation order](https://help.rentvine.com/en/articles/16574031-how-to-change-your-payment-allocation-order), allocation by ranked GL accounts, oldest first within each
- [TurboTenant: How to require renters to pay past due charges first](https://support.turbotenant.com/en/articles/9657853-how-to-require-renters-to-pay-past-due-charges-first), allocation settings apply only at payment time
- [Rentvine: Proration features and settings](https://www.rentvine.com/blog/rentvine-tip-of-the-week---episode-8-proration-features--settings), actual-days, 30-day and annual-days methods, per-charge proration, second-month proration
- [Yardi Breeze: Residential features](https://www.yardibreeze.com/residential-features/), automated recurring postings and maintenance chargebacks
- [Entrata: Lease File Audit](https://www.entrata.com/products/lease-file-audit), comparing abstracted lease terms with billing to find missed charges and overbilling
- [RealPage: LOFT Loyalty](https://www.realpage.com/resident-portal/loyalty-rewards/), client-funded digital concessions with unused funds recovered
