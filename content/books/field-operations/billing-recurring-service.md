+++
title = "Billing Recurring Service"
description = "Billing recurring service: per-visit, periodic and prepaid models, the service balance, invoices, autopay, financing, tax on services and accounting sync."
category = "Field Operations Industry"
order = 1530
part = "Customers and Billing"
tags = ["field-operations", "billing", "invoicing", "autopay", "sales-tax", "accounting"]
+++

A recurring service business sells a promise (four treatments a year, a weekly pool visit, a spring and fall tune-up, a biweekly cleaning) and then has to turn that promise into invoices, one at a time, for years. The hard part is that two clocks run at once. The **service clock** is the visits: they move for weather, get skipped when a gate is locked, and bunch up when a route falls behind. The **billing clock** is the money: monthly on the 1st, after each visit, or once a year up front. When the clocks agree, billing is invisible. When they disagree (the customer was billed for March and nobody came in March), you get a phone call, a credit, sometimes a chargeback, and a customer who now reads every invoice. Most of the design in this chapter is deciding which clock drives the invoice, and recording enough to explain the answer later.

The money movement underneath is in the Payments volume ([Stored Cards & Recurring Billing](/books/payments/stored-credentials), [ACH & Bank Transfers](/books/payments/ach)), and the general subscription mechanics (periods, anchors, renewal jobs, proration) are in [Subscriptions](/docs/payments/subscriptions); failed charges are [Collections & Retention](/books/field-operations/collections-and-retention). This chapter is what gets billed in field service, when, with what tax, and where the numbers go.

## Four Billing Models

Every vendor's settings reduce to four shapes (`per_visit`, `periodic`, `prepaid`, `seasonal`), often mixed on one customer:

- **Per visit:** an invoice for each completed service. Billing follows the service clock exactly, so a skipped visit costs the customer nothing. Cash arrives in lumps (a quarterly pest service bills four times a year), and revenue is earned when the visit happens.
- **Periodic (level billing):** the annual price divided into equal monthly, quarterly or annual charges on a calendar date, whatever the visit schedule. Cash is smooth and predictable, and customers like a small number better than a big one. The catch is that the invoice no longer proves a visit happened.
- **Prepaid:** the year paid up front, often for a discount, charged when the agreement becomes active. Cash arrives early, the business owes the customer the visits, and an accrual-basis business holds the money as deferred revenue until it's earned ([Revenue Metrics](#revenue-metrics) covers when that is).
- **Seasonal:** lawn programs and mosquito service bill per round (the fourth fertilization of the season) or monthly only during the season's months; pool service in northern states bills weekly from opening to closing. Programs carry their own calendar, and a rained-out round moves the bill with it.

![Four billing models compared. Per visit invoices when the visit completes, bills nothing for a skipped visit, collects after each visit and earns revenue on the visit. Periodic invoices on the billing day, still bills when a visit is skipped, collects each period and earns over the term. Prepaid invoices when the agreement becomes active, owes the customer a visit when one is skipped, collects up front and earns per visit. Seasonal invoices each round in season, moves the bill when a round moves, collects in season and earns per round.](/diagrams/fo-billing-recurring-service-models.svg "The model decides which clock drives the invoice. The skipped-visit column is the one customers notice.")

The agreement chooses the model ([Service Agreements & Plans](/books/field-operations/service-agreements)); billing executes it and makes the skipped-visit behavior explicit before the customer finds it.

## Service-Driven or Calendar-Driven, and the Gap Between Them

Underneath the four shapes is one question: does the bill follow the work, or the calendar? Per-visit and seasonal-per-round billing are **service-driven**: no completed visit, no invoice. Monthly, quarterly and annual billing are **calendar-driven**: the charge runs on its date whatever happened in the field, including an annual plan that simply renews and charges once a year. Jobber names the split directly, "per visit" versus a "fixed price job" billed per invoicing period regardless of visits, and FieldRoutes keeps generating invoices on a fixed schedule even when visits are skipped, unless the subscription is frozen.

Calendar-driven billing is service-agnostic by design, and that creates a running gap between what the customer has paid for and what they've received. A quarterly pest plan billed monthly is ahead of the work in month one and behind it right after a visit. A lawn program with seven rounds, billed in twelve equal months, has delivered most of its rounds by late summer and keeps billing through winter. An annual charge on renewal day is all paid and nothing delivered. None of that is wrong; it's the deal. But the system has to know where each agreement stands:

- **Keep a service balance per agreement:** visits (or rounds) paid for to date against visits delivered to date, valued at the plan's per-visit price. Positive means the business owes service; negative means the customer has received more than they've paid for.
- **Price visit types separately, even under a flat bill.** The initial visit is usually priced on its own and billed on completion (or taken at signing as a refundable initial-service charge, one of the exceptions in [Charging Inside the Window](/books/field-operations/consumer-protection#charging-inside-the-window)); recurring visits carry the plan's per-visit value; callbacks and reservices are free under the agreement; add-on services (a one-off wasp nest, a tree treatment) bill per service on top of the monthly charge. A customer on "$49 a month" can still see three kinds of line on one statement.
- **Decide the true-up before the first termination.** A customer who ends a level-billed lawn program in August has received more than they've paid; one who ends an annual prepaid plan in March has paid for visits never made. The agreement should say what happens (the remaining balance is billed, refunded or forgiven), and billing should compute it from the service balance, not from a support agent's arithmetic. Where an early-termination charge applies, disclose it at signing ([Consumer Protection](/books/field-operations/consumer-protection)).
- **Show the balance to the customer.** "4 of 7 rounds complete, paid through October" on the statement and in the portal answers most billing complaints before they're made ([Customer Self-Service](/books/field-operations/customer-self-service)).
- **Mixed plans are normal.** A base program billed monthly, add-ons billed per visit, and an annual termite renewal billed once a year can all sit on one account; model each as its own billing plan against the same agreement rather than one plan with exceptions.

![A dimensional drawing of an illustrative seven-round lawn program priced at 420 dollars a year and billed 35 dollars on the 1st of each month, with rounds in March to June and August to October. Bars show the service balance at each month end, paid minus delivered at 60 dollars a round: up to plus 70 in February, down to minus 70 in October and back to zero in December. The August balance of minus 20 is dimensioned as the true-up if the customer cancels then.](/diagrams/fo-billing-recurring-service-dwg-balance.svg "Level billing runs ahead of the work early in the season and behind it late. The service balance is the running difference, and a termination true-up is its value on that day. All amounts are illustrative.")

My rule: let the customer choose calendar or service billing where the business can carry the cash-flow difference, but never let the system lose track of the gap. Accounting cares too: under accrual accounting, cash collected ahead of the work is a liability until it's earned, so the service balance and deferred revenue should reconcile ([Revenue Metrics](#revenue-metrics)).

## How the Platforms Do It

**FieldRoutes** (pest and lawn) puts billing on each subscription: "After Each Completed Service" by default, or a frequency on its own timer that keeps invoicing through skipped visits until the subscription is frozen or closed. Its worked example is worth copying as a test case: a quarterly-service customer moved to monthly billing has the recurring charge cut to a third, while the production value stays at the quarterly price so the technician's credit isn't cut too. **Billed amount and production value are different numbers,** and a billing change must not silently change pay ([Sales Teams & Commissions](/books/field-operations/sales-teams-and-commissions)).

**ServiceTitan** (HVAC, plumbing, electrical) models recurring revenue as **memberships** with their own billing invoice, separate from each recurring service's invoice; staff run Charge Members to bill them, and accrual businesses add paired deferred-revenue items so revenue is recognized as each service is booked. **Jobber** asks for "per visit" or "fixed price job" billing on a recurring job; **Housecall Pro**'s service-plan FAQ documents edge cases worth copying as tests (frequency locked on an active plan, payments pending after reactivation, rounding on add-on prices divided across months); **GorillaDesk** lets an invoice follow its own frequency, unaffected by the job's.

| | Billing driven by | Fixed-schedule billing when a visit is skipped | Prepay and deferral |
| --- | --- | --- | --- |
| FieldRoutes | Subscription billing frequency | Still invoiced until frozen or closed | Prepayment plans with discounts |
| ServiceTitan | Membership type | Membership invoice independent of visits | Upfront or deferred-revenue configuration |
| Jobber | Recurring job billing method | Fixed price bills per period regardless | Quote deposits |
| Housecall Pro | Service plan payment option | Plan charges on its schedule | Yearly payment option |
| GorillaDesk | Invoice frequency | Separate frequency is unaffected by the job | Standalone recurring invoices |

A subscription engine such as Stripe Billing fits the calendar-driven plans well and per-visit billing poorly, because the trigger is a field event it doesn't see. Anchors and month-end clamping are in [Subscriptions](/docs/payments/subscriptions#periods-and-anchors).

## Repair, Install and Commercial Work

Recurring plans are half of field billing. The other half is one-off work, whose job flow, pricing methods, warranty claims and SLA clocks are in [Repair, Install & Commercial Work](/books/field-operations/repair-and-installation). What it changes on the billing side:

- **The invoice is built from approved lines.** Flat-rate tasks, time and materials and the diagnostic fee come from the options the customer approved, and a waived or credited diagnostic fee is a rule the invoice applies, not the technician's memory ([Pricing & Sales Rules](/books/field-operations/pricing-and-sales-rules)).
- **Installs bill in stages.** Deposit, progress payments and the balance, each an invoice against the same work order. The deposit is a liability until the work it pays for is done, and a deposit taken at signing is refundable under the cooling-off rules ([Charging Inside the Window](/books/field-operations/consumer-protection#charging-inside-the-window)).
- **A financed balance is paid by the lender.** Record the lender as payer, its fee as a cost of the sale, and funding as its own event after approval; an approved loan that hasn't funded is still a receivable. Lenders, presentment and when they pay out are in [Financing Presentment](/books/field-operations/pricing-and-sales-rules#financing-presentment).
- **Warranty work has a second payer.** The manufacturer's share is a separate receivable from the customer's, paid late, partially or not at all; a rejected claim becomes a bill to the customer that someone has to explain.
- **Home warranty and insurance work split the invoice.** The homeowner owes the warranty company's service call fee or the policy's deductible, and the warranty company or the insurance proceeds pay the rest, after an authorization or a carrier approval. Bill the two shares as separate invoices on the same work order, each to its own account, so the third party's aging is visible; never discount the deductible away, which some states make an offense ([Home Warranty Companies](/books/field-operations/repair-and-installation#home-warranty-companies), [Insurance Claims Work](/books/field-operations/repair-and-installation#insurance-claims-work-restoration-and-roofing)).
- **Commercial customers bill on their terms:** a PO number on every invoice, a not-to-exceed cap, monthly consolidation across sites, net 30 or later through the client's accounts-payable portal, and SLA credits computed from the work order's clock events.

Cleaning and delivery sit between: a cleaning company bills recurring visits like a route trade plus one-off deep cleans, and a delivery operator bills shippers per stop on a statement, with redelivery fees as their own lines. When the one-off work is for a plan customer (member pricing, folding it into a scheduled visit, which stored-card authorization covers it), see [One-Time Services & Upsells](/books/field-operations/one-time-services-and-upsells#one-off-work-for-plan-customers).

## Invoices and Statements

An **invoice** bills specific work: one visit, one period, one round, one stage of an install. A **statement** is a snapshot of everything outstanding on an account at a date, and may cover several unpaid invoices. Commercial accounts add **consolidated invoices**: several invoices grouped so a property manager or a school district pays once, while the original invoices still exist underneath. Payer and service location are often different parties, which [Customers, Accounts & Properties](/books/field-operations/customers-and-properties) models.

Rules that hold across vendors and accounting practice:

- **An invoice is immutable once finalized.** Corrections are credit notes, voids and reissues, never edits, so a printed invoice and the database always agree.
- **Line items carry their origin.** A visit line points at the visit; a fee line at the policy that created it; a discount at the offer; an SLA credit at the work order that missed. That's what lets support answer "what is this charge."
- **Payments are applied, not assigned.** A payment lands on the account and is applied to invoices by a rule, as [Payment States & Ledgers](/docs/payments/payment-states#payments-are-applied-not-assigned) describes. The common default is oldest first: QuickBooks Online's mobile app, for example, applies a received payment to the oldest open invoice first, then the next oldest, leaving any excess unapplied. Override it when the customer names the invoice (a commercial remittance that lists invoice numbers, a portal payment against one invoice). Partial payments and credits make anything simpler wrong.
- **Money is integers in minor units** ([Money](/docs/payments/money)), with a rule for where the leftover cent of a divided price goes.

## Autopay

Autopay is what makes recurring service economical; FieldRoutes says many of its clients run autopay rates of 80 to 90% (vendor-reported). Two decisions shape it in field service:

1. **Event-triggered or calendar-triggered.** Per-visit autopay charges on completion (Jobber creates and charges the invoice once the visit is marked complete); fixed billing charges on the billing date. Completion-triggered charges need the visit's completion to be trustworthy, which is why [Proof of Service](/books/field-operations/proof-of-service) matters to billing: a technician who marks a visit complete from the truck without treating the yard has just charged a card.
2. **Charge the invoice or the balance.** Charging each invoice is simple and auditable. Charging the account balance on a schedule handles partial payments and credits, but must compute the amount at execution and be capped, as [Autopay Against a Balance](/books/payments/stored-credentials#autopay-against-a-balance) explains, including Regulation E's notice for varying ACH debits.

Stored cards decay over a multi-year agreement, so run them through account updater ([Keeping the Card Alive](/books/payments/stored-credentials#keeping-the-card-alive)). Whoever holds the card tokens decides whether a business can leave with its autopay customers ([Switching Platforms](/books/field-operations/switching-platforms)), and card fees have network and state rules ([Surcharging & Fees](/books/payments/surcharging-and-fees)).

## Sales Tax on Services

Many states tax some services, and field services are a common target. Texas taxes structural pest control "even when pests are not found," and its local tax is based on the provider's place of business in Texas rather than the customer's address, though a provider whose place of business has a local rate under 2 percent and who serves other local jurisdictions may also owe local use tax there; Ohio taxes exterminating and lawn care, excluding lawn care providers with less than $5,000 of such sales in the year. The same service can be taxable in one state and not the next, and an operator crossing state lines can owe collection where it has no office. The mechanics (tax codes per item, the quote that becomes a snapshot at finalization, sourcing, nexus, exemption certificates) are in [Sales Tax](/docs/payments/sales-tax#taxability-varies-by-place).

What's field-specific is how the platforms wire it. ServiceTitan integrates Avalara with a choice that generalizes: recalculate on every edit (accurate, more calls, higher cost) or call once at booking and refresh when the invoice is emailed, printed, paid or viewed. Either way, the call at finalization is required, because that answer is the snapshot the invoice keeps ([Tax Is a Quote Until the Invoice Finalizes](/docs/payments/sales-tax#tax-is-a-quote-until-the-invoice-finalizes)). ServiceTitan's integration can send the business unit as ship-from and the service location as ship-to, exactly the pair Texas-style sourcing needs, and the technician's offline app shows an estimate until the server computes the real number. Invoice structure is a tax decision too: Texas taxes the whole charge when a taxable service above 5% of it isn't stated separately, so a treatment bundled into a nontaxable line needs its own line and tax code.

## Accounting Sync

The FSM is the operational ledger; the business's books live in QuickBooks, Xero or Sage. Summary journals versus detail sync, a log per sync batch and idempotent posting are general, in [Syncing to the Accounting System](/docs/payments/accounting#syncing-to-the-accounting-system); my default there (summary journals plus a CSV export) suits field businesses because their bookkeepers use whatever accounting system they already had. What the field vendors push:

| Vendor | Systems | What syncs |
| --- | --- | --- |
| FieldRoutes | QuickBooks Online | Reads the chart of accounts; sends payment journal entries built from account mappings, scheduled or on demand, with a sync log |
| Jobber | QuickBooks Online | Clients two-way; products and services two-way with QuickBooks as the source of truth; invoices and payments one-way, one time, so later edits are made in both systems |
| Housecall Pro | QuickBooks Online and Desktop | Invoices, customers, line items and payments pushed automatically |
| ServiceTitan | QuickBooks Desktop and Online, Sage Intacct, Xero | Invoices, payments and customers depending on the system, plus a general CSV export for unsupported systems |

Jobber's one-way, one-time invoice sync is the detail-sync cost in practice: an invoice edited after it synced has to be edited in both systems. The field-specific journal lines are deferred revenue on prepaid plans and install deposits, released as below, and the production value that commissions read, which never goes to the books.

## Revenue Metrics

Recurring billing produces its own vocabulary. **MRR** (the monthly-normalized value of active agreements, so a $600 annual plan contributes $50) is an operating number, not revenue ([Revenue Metrics Are Not Revenue](/docs/payments/accounting#revenue-metrics-are-not-revenue)). Field service adds metrics a pure subscription business doesn't need:

- **Recurring revenue under contract,** by service line, and how much of it is on autopay.
- **Billed versus performed.** For fixed billing, the gap between what was invoiced and what was serviced is a liability (visits owed) or a dispute waiting to happen.
- **Deferred revenue** from prepayments and install deposits, released as it's earned. When that is, is an accounting judgment, not a system default: a plan whose promise is a set number of visits may release a share per completed visit, while a plan that promises unlimited reservices between visits can be a stand-ready promise recognized evenly over the term. Your accountant decides; the system keeps both the completed visits and the term dates so either method can be computed ([Recognition Schedules](/docs/payments/accounting#recognition-schedules)), and install deposits release by stage.

Collecting what was billed is [Collections & Retention](/books/field-operations/collections-and-retention); AR aging and the other definitions are in [Operating Metrics](/books/field-operations/operating-metrics#receivables), with one definition per metric ([Data Pipelines](/docs/architecture/data-pipelines#one-definition-per-metric)); the billing system's job is to keep the events those metrics are computed from.

## How to Build It

Keep the billing schedule a separate object from the service schedule, the way GorillaDesk lets an invoice follow its own frequency and ServiceTitan keeps the membership's billing invoice apart from each recurring service's. The visit generator ([Recurring Schedules](/books/field-operations/recurring-schedules)) and the billing generator both read the agreement and don't call each other; they meet at the work order, which invoice lines reference. The tables below extend the canonical `agreements`, `accounts` and `visits` from [The Field Operations Business](/books/field-operations/field-operations-business#the-core-data-model).

The volume's `invoices` and `payment_methods` start here, compactly; the payment and ledger mechanics underneath are in [Payment States & Ledgers](/docs/payments/payment-states). A payment method holds the processor's or vault's token and display details, never a card number ([Card Vault](/books/payments/card-vault)), plus the signed authorization the recurring or ACH debit relies on.

```sql
CREATE TABLE payment_methods (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  account_id       UUID NOT NULL REFERENCES accounts (id),
  kind             TEXT NOT NULL CHECK (kind IN ('card', 'ach')),
  processor        TEXT NOT NULL,                         -- who issued the token
  vault_token      TEXT NOT NULL,                         -- never a PAN or full account number
  brand            TEXT,                                  -- display only
  last4            CHAR(4),
  expires_on       DATE,                                  -- cards; account updater refreshes it
  authorization_document_id UUID REFERENCES agreement_documents (id),  -- the signed authorization
  status           TEXT NOT NULL CHECK (status IN ('active', 'invalid', 'removed')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE invoices (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  account_id      UUID NOT NULL REFERENCES accounts (id), -- the payer
  number          TEXT,                                   -- assigned at finalization
  status          TEXT NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  currency        TEXT NOT NULL,
  total_amount    BIGINT NOT NULL DEFAULT 0,              -- minor units, lines plus tax
  issued_on       DATE,                                   -- branch business date
  due_on          DATE,                                   -- aging runs from here or issued_on
  finalized_at    TIMESTAMPTZ,                            -- immutable after this
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT invoices_tenant_number_key UNIQUE (tenant_id, number)
);

CREATE TABLE billing_plans (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  agreement_id      UUID NOT NULL REFERENCES agreements (id),
  payer_account_id  UUID NOT NULL REFERENCES accounts (id),  -- may differ from the property's owner
  billing_model     TEXT NOT NULL CHECK (billing_model IN ('per_visit', 'periodic', 'prepaid', 'seasonal')),
  billing_interval  TEXT CHECK (billing_interval IN ('month', 'quarter', 'year')),  -- periodic only
  anchor_day        SMALLINT CHECK (anchor_day BETWEEN 1 AND 31),            -- clamped to month end
  amount            BIGINT,                                -- minor units, per period or per visit
  currency          TEXT NOT NULL,
  net_days          SMALLINT NOT NULL DEFAULT 0,
  autopay_method_id UUID REFERENCES payment_methods (id),
  status            TEXT NOT NULL CHECK (status IN ('active', 'paused', 'ended')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE billing_periods (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  billing_plan_id UUID NOT NULL REFERENCES billing_plans (id),
  valid_during    DATERANGE NOT NULL,                      -- [first day, day after last)
  invoice_id      UUID REFERENCES invoices (id),
  CONSTRAINT billing_periods_plan_period_key UNIQUE (billing_plan_id, valid_during)  -- billed once
);

CREATE TABLE invoice_lines (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  invoice_id        UUID NOT NULL REFERENCES invoices (id),
  kind              TEXT NOT NULL CHECK (kind IN ('service', 'fee', 'discount', 'credit')),
  work_order_id     UUID REFERENCES work_orders (id),      -- the work this line bills
  visit_id          UUID REFERENCES visits (id),           -- set for per-visit lines
  description       TEXT NOT NULL,
  quantity          NUMERIC NOT NULL,
  unit_amount       BIGINT NOT NULL,
  currency          TEXT NOT NULL,
  tax_code          TEXT,
  production_amount BIGINT                                 -- technician credit, independent of price
);
```

Tax isn't a line kind. Each taxable line gets its tax rows in `invoice_line_taxes`, snapshotted at finalization as [Sales Tax](/docs/payments/sales-tax#tax-is-a-quote-until-the-invoice-finalizes) defines, so a credit note can reverse tax at the original jurisdictions and rates.

How it runs:

1. **No recurring-period charge on an agreement that isn't `active`.** The run selects due periods only for active agreements, and a charge attempt rechecks the state at execution, because an agreement can be cancelled between draft and charge. ServiceTitan's billing runs skip a suspended membership the same way. The two refundable charges allowed at signing are in [Charging Inside the Window](/books/field-operations/consumer-protection#charging-inside-the-window), and the deadline that moves `signed` to `active` in [Signing the Agreement](/books/field-operations/signing-the-agreement).
2. **A billing run is a scheduled job per branch per business day,** using the branch's business date from its `org_units` time zone ([Business Dates](/docs/fundamentals/time#business-dates-business-days-and-holidays), [Background Jobs](/docs/architecture/background-jobs#scheduling)): select due periods, draft, tax, finalize, charge. The unique period makes a rerun safe; the charge's idempotency key is the period and attempt, as in [Renewal Jobs](/docs/payments/subscriptions#renewal-jobs).
3. **Per-visit invoices hang off the `visit.completed` event,** consumed idempotently by visit ID ([Events](/docs/architecture/events)). A reversed completion produces a credit note, not a deleted invoice.
4. **Skipped visits are a per-plan policy:** keep billing and show "visits owed," auto-credit the missed visit, or defer the next period. Show the choice on statements and in the portal.
5. **Plan changes follow [Plan Changes and Proration](/docs/payments/subscriptions#plan-changes-and-proration),** with one field-specific adjustment. Downgrades apply at the next period, as there. An upgrade (an added service, a higher frequency) applies from the first changed visit, not the moment it's entered, because the occurrence generator changes the visits from a date and billing ahead of the first added visit charges for work not yet scheduled. Prorate in days, credit through the service balance, and apply price-change notice rules to auto-renewing plans.
6. **Prepay is a liability.** Payment goes to deferred revenue and is released by the method the accountant chose ([Revenue Metrics](#revenue-metrics)); a termination refunds or credits the unearned part from the service balance.
7. **Draft, then finalize, then charge,** with a review window and a way to exclude an account from a run without editing its plan.

![The billing run. A billing plan's period comes due, a draft invoice is created, and the tax engine returns a quote. The invoice is finalized, which assigns its number and locks it, autopay charges the stored method, the payment is applied to the balance and aging, and the result syncs to accounting as a journal or detail. When there is no payment method on file, the invoice is sent with a payment link instead.](/diagrams/fo-billing-recurring-service-run.svg "Every step is idempotent by billing period, so a rerun after a crash never bills or charges twice.")

What's genuinely hard:

- **Drift.** Fixed billing plus a route that slipped two weeks bills a period with no visit yet; give support a "billed but not serviced" list before customers call.
- **Payer changes.** A property sells or a manager takes over: the payer changes on a date, and earlier invoices stay with the old payer.
- **Migration.** Import the paid-through date and visits still owed for prepaid customers, not just the plan.

## Auditing

Billing records are evidence in disputes, chargebacks, tax audits and commission arguments. The general design is in [Audit Trails](/docs/architecture/audit-trails), and field records in [Audit Trails & Records](/books/field-operations/audit-trails-and-records). For field billing, make sure the record shows:

- **Each billing run's selections,** including periods skipped because the agreement wasn't `active`, and each charge outcome with the processor's response code.
- **The service balance behind every true-up,** credit and refund at termination, so the amount can be recomputed.
- **Billing changes that affect pay:** a changed billed amount or production value, who made it, and whether a person or a system process (a trigger rule, the billing run) did.
- **The tax snapshot, the ship-from and ship-to used,** and exemption certificates, for the auditor who asks three years later.

## What This Means for the System You Build

- **A billing plan separate from the service schedule,** with the model, payer, anchor and autopay method on it, and several plans per agreement when the customer has a mixed plan.
- **No recurring-period charge on an agreement that isn't `active`,** checked when the run selects periods and again when the charge executes ([Charging Inside the Window](/books/field-operations/consumer-protection#charging-inside-the-window) has the exceptions).
- **Payment methods as vault tokens** with their signed authorization, never card numbers.
- **A service balance per agreement** that drives statements, the termination true-up and the reconciliation with deferred revenue.
- **A configurable skipped-visit policy** per plan, visible to the customer, with a "billed but not serviced" report for support.
- **Repair and install billing:** flat-rate lines, staged invoices with deposits as liabilities, warranty claims as their own receivables, and purchase orders, not-to-exceed limits and SLA credits for commercial accounts.
- **Production value separate from billed price** on every service line.
- **Tax by code and both addresses,** snapshotted on the invoice, and financing recorded as lender-paid.
- **Accounting export** to the systems field businesses use, with deferred revenue for prepaid plans and deposits.

## References

**Specifications**

- [Texas Comptroller: Pest Control Services (Publication 94-114)](https://comptroller.texas.gov/taxes/publications/94-114.php), pest control taxable even when no pests are found, the 5% rule for charges not stated separately, local tax based on the place of business, and local use tax that may also be due
- [Ohio Revised Code 5739.01](https://codes.ohio.gov/ohio-revised-code/section-5739.01), exterminating and landscaping and lawn care among taxable sales, and the $5,000 exclusion for lawn care providers

**Reference**

- [Stripe: Set the subscription billing renewal date](https://docs.stripe.com/billing/subscriptions/billing-cycle), billing cycle anchors and month-end behavior
- [QuickBooks: Receive an invoice payment using the QuickBooks Online mobile app](https://quickbooks.intuit.com/community/help-articles-128/receive-an-invoice-payment-using-the-quickbooks-online-mobile-app-284363), payments applied to the oldest open invoice first, with any excess unapplied

**In practice**

- [FieldRoutes: Set up Recurring Billing](https://knowledgebase.fieldroutes.com/docs/set-up-recurring-billing.md), billing frequency, invoices on skipped visits until frozen, and production value
- [FieldRoutes: Prepayments Overview](https://knowledgebase.fieldroutes.com/docs/prepayments-overview.md), prepayment plans with tiered discounts
- [FieldRoutes: 3 Ways to Drastically Improve Collections](https://knowledgebase.fieldroutes.com/docs/3-ways-to-drastically-improve-collections.md), autopay rates of 80 to 90% among clients
- [FieldRoutes: QBI overview](https://knowledgebase.fieldroutes.com/docs/qbi-overview.md), QuickBooks Online payment journal entries and sync logs
- [ServiceTitan: Understanding membership setup](https://help.servicetitan.com/how-to/understanding-membership-setup), membership billing invoice templates and deferred revenue items
- [ServiceTitan: Edit customer memberships](https://help.servicetitan.com/docs/edit-customer-memberships), suspended memberships left out of billing runs
- [ServiceTitan: Basic memberships workflows](https://help.servicetitan.com/docs/basic-memberships-workflows), Charge Members and automatic charging of stored methods
- [ServiceTitan: Avalara integration guide](https://help.servicetitan.com/docs/avalara-integration-guide), cache and no-cache tax calculation, ship-from and ship-to addresses, filing and the mobile estimate
- [ServiceTitan: Accounting integrations](https://help.servicetitan.com/docs/accounting-integrations-overview), QuickBooks, Sage Intacct, Xero and the general CSV export
- [Jobber: Create a recurring job](https://help.getjobber.com/en/articles/create-a-recurring-job/), per-visit and fixed-price billing and invoice schedules
- [Jobber: Automatic payments](https://help.getjobber.com/en/articles/automatic-payments/), invoices created and charged when a visit is marked complete
- [Jobber: QuickBooks Online sync](https://help.getjobber.com/hc/en-us/articles/115009786748), what syncs in each direction and edits after sync
- [Housecall Pro: Create service plans](https://help.housecallpro.com/en/articles/2369524-create-service-plans), service plan payment options including yearly
- [Housecall Pro: Service plans FAQs](https://help.housecallpro.com/en/articles/5485025-service-plans-faqs), locked billing frequency, pending payments on reactivation and add-on rounding
- [Housecall Pro: QuickBooks integration](https://www.housecallpro.com/features/quickbooks/), invoices, customers, line items and payments pushed to QuickBooks
- [GorillaDesk: Invoice frequency](https://intercom.help/gorilladesk/en/articles/2924297-invoice-frequency), standalone and job-attached recurring invoices
