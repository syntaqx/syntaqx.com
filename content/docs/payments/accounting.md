+++
title = "Accounting & Revenue Recognition"
nav_title = "Accounting"
description = "What the product owes the books: deferred revenue as ledger facts, ASC 606 and IFRS 15 basics, breakage, accounting sync, month-end close and write-offs."
category = "Payments"
order = 809
tags = ["payments", "accounting", "revenue-recognition", "ledger", "month-end"]
+++

The product's ledger records money that moved. The business's books record what that money *means*: how much of it has been earned, how much is still owed back as service, how much will never be collected. Those are different questions, and the second set is answered by accountants under standards that change their estimates every quarter. The engineering job isn't to make accounting decisions. It's to keep the facts every accounting decision needs, in a form finance can recompute under this quarter's policy, and to deliver them to the accounting system in a way that reconciles.

This is the engineering of accounting data, not accounting advice: which treatment applies to your products is your finance team's and auditor's call. The ledger underneath follows [Payment States & Ledgers](/docs/payments/payment-states#double-entry-ledger), amounts follow [Money & Amounts](/docs/payments/money), and recurring billing follows [Subscriptions & Recurring Billing](/docs/payments/subscriptions).

## The Product Keeps Facts, Finance Picks Policy

My rule: **the product records facts at the finest grain it has, and recognition, deferral and write-off policies run over those facts as versioned rules.** A fact is something that happened and won't change: a payment of 12,000 minor units on a date, an invoice line for a service period, a visit completed, an item consumed, an invoice marked uncollectible. A policy is a judgment about those facts: recognize this line evenly over its period, release this prepayment per completed visit, expect 8% of these balances never to be used.

The failure mode is storing the policy's output instead of its inputs. A row that says "recognized $50 this month" can't be recomputed when the auditor changes the method; a row that says "annual plan, $600, service period January 1 to December 31, paid January 3" can be recognized monthly, daily or per use, as many times as anyone asks. When policies change (and estimates like a customer's expected lifetime change every quarter), the facts underneath them must not.

| Fact to keep | Why finance needs it |
| --- | --- |
| Service period on every invoice line (start, end) | Spreading revenue over the period the service is delivered |
| What was promised: a term, a number of uses, a durable item, a consumable | Choosing between over-time and point-in-time recognition |
| Each delivery event: a visit completed, a unit consumed, an item granted | Recognizing per use, and measuring breakage |
| Paid versus granted value on every balance | Only paid value is a liability with cash behind it |
| Price allocation per line in a bundle | Splitting one price across several obligations |
| Refunds, disputes, credit notes and write-offs as their own entries | Reversing what was recognized, in the right period |
| The time and time zone of each event | Assigning it to the right accounting period |

## Cash Is Not Revenue

When a customer pays in advance, the business has the cash and owes the service. The payment is a liability until it's earned. The US revenue standard's implementation guidance is explicit: "upon receipt of a prepayment from a customer, an entity should recognize a contract liability", and revenue follows only as the goods or services are transferred ([Deloitte: ASC 606-10-55-46 to 55-49](https://dart.deloitte.com/USDART/home/codification/revenue/asc606-10/roadmap-revenue-recognition/chapter-8-step-5-determine-when/8-8-customers-unexercised-rights-breakage)).

So a deferral is a ledger fact, posted like any other transaction:

| When | Debit | Credit | Amount |
| --- | --- | --- | --- |
| Annual invoice finalized | `accounts_receivable` | `deferred_revenue` | 120,000 |
| Customer pays | `cash` | `accounts_receivable` | 120,000 |
| Each month end | `deferred_revenue` | `revenue` | 10,000 |

Stripe's revenue recognition product is built exactly this way, on "a double-entry accounting ledger": finalizing an invoice debits accounts receivable and credits deferred revenue, payment debits cash and credits receivables, and recognition moves deferred revenue to revenue over each line's period. By default it amortizes "by the day", with options for the second or the month ([Stripe: How Revenue Recognition works](https://docs.stripe.com/revenue-recognition/methodology), [Stripe: Revenue Recognition settings](https://docs.stripe.com/revenue-recognition/revenue-settings)). Refunds and disputes split the same way: the part already recognized becomes contra revenue, and the rest comes out of deferred revenue. Tax collected is a liability to the tax authority, never revenue ([Sales Tax & VAT](/docs/payments/sales-tax)).

Prepaid balances that aren't tied to a period behave the same: account credit, a stored-value wallet, a gift card, a bundle of visits paid upfront, a pack of virtual currency. Each is a liability until it's used, and the ledger keeps them in their own accounts (`customer_credit`, `prepaid_balance`, `deferred_revenue`), separate from `unapplied_cash`, which is money received and not yet matched to anything ([Payments Are Applied, Not Assigned](/docs/payments/payment-states#payments-are-applied-not-assigned)).

## ASC 606 and IFRS 15 in Five Steps

The US standard (ASC 606) and the international one (IFRS 15) are converged on the same model. The IFRS Foundation summarizes it: revenue is recognized to "depict the transfer of promised goods or services to the customer", through five steps, and IFRS 15 has applied to annual periods beginning on or after 1 January 2018 ([IFRS 15](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/)):

1. **Identify the contract** with the customer.
2. **Identify the performance obligations,** the distinct promises in it.
3. **Determine the transaction price,** estimating any variable consideration.
4. **Allocate the price** to each obligation by relative standalone selling price.
5. **Recognize revenue** when each obligation is satisfied, at a point in time or over time.

Each step maps to something the data model must hold. Step 1 is the agreement or subscription with its terms and dates. Step 2 is the line items, each a separate promise. Step 3 is the price after discounts, with credits, refunds and usage as variable parts. Step 4 needs the standalone price of each component recorded even when the customer paid one bundle price. Step 5 needs either a service period (over time) or a delivery event (point in time) for every line.

### Performance Obligations in Software

The common shapes, and the fact each one needs:

- **A subscription to a hosted service** is usually a promise to stand ready over the term, recognized evenly over the period. Stripe treats "each invoice line item as its own performance obligation" and amortizes it evenly over the line's period; a line with no period is recognized in full at finalization ([Stripe: How Revenue Recognition works](https://docs.stripe.com/revenue-recognition/methodology)). So every line carries a period, or someone decided it shouldn't.
- **Setup, onboarding and implementation fees** may be a separate obligation or part of the subscription, which changes whether they're recognized up front or over the term. Keep them as their own line with their own standalone price so either answer can be computed.
- **Prepaid usage** (credits, a bundle of visits, a quota) is recognized as it's used, which needs a consumption event per use.
- **Plan changes** create prorations and negative lines that reverse recognition already scheduled; [Plan Changes and Proration](/docs/payments/subscriptions#plan-changes-and-proration) produces them as lines with their own periods, which is what recognition needs.
- **Virtual goods and in-app currency** are paid for before they're delivered. Roblox's annual report says bookings are "initially recorded in deferred revenue" and durable items are recognized over "the estimated average lifetime of a paying user, which was 27 months as of December 31, 2025" ([Roblox: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1315098/000131509826000024/rblx-20251231.htm)). The lifetime is an estimate that can move; the purchase, the item's durability and each spend are facts. [Monetization Models](/books/gaming/monetization#virtual-currency) covers the game side.

When the answer depends on a judgment ("is this a stand-ready promise or a set number of visits?"), store both shapes of fact (the term dates and the deliveries) and let finance pick. The system shouldn't hard-code one method into a column nobody can recompute.

### Breakage

Customers don't use everything they pay for. Gift cards expire unspent, prepaid visits go unbooked, currency sits in wallets. The standard calls these unexercised rights **breakage**, and the treatment depends on what you can predict: if you expect to be entitled to breakage, you recognize it "in proportion to the pattern of rights exercised by the customer"; if you don't, you recognize it only "when the likelihood of the customer exercising its remaining rights becomes remote". Gift cards and store credit, with the state rules that decide what is escheated, are the Commerce volume's [Gift Cards and Store Credit](/books/commerce/promotions-and-gift-cards#gift-cards-and-store-credit). Amounts you must hand to a government under unclaimed property laws are a liability, "and not revenue" ([Deloitte: ASC 606-10-55-46 to 55-49](https://dart.deloitte.com/USDART/home/codification/revenue/asc606-10/roadmap-revenue-recognition/chapter-8-step-5-determine-when/8-8-customers-unexercised-rights-breakage)).

What the product owes finance is the redemption history that makes the estimate possible: for each issued balance, when it was issued, how much, to whom (jurisdiction matters for unclaimed property), and each use with its date. With that, finance can compute the historical redemption curve by cohort and apply it. Without it, the only option is waiting until each balance is remote, which delays revenue for years.

Never let breakage logic expire a customer's balance in the product. Whether a balance can expire is a consumer law and terms question (some stores and jurisdictions forbid it), and recognizing breakage in the books doesn't remove the customer's right to spend.

## Recognition Schedules

The simplest durable design: the product posts facts to its ledger and computes a **recognition schedule** per line from a versioned policy, and finance can regenerate any schedule under a new policy version without touching the facts.

```sql
CREATE TABLE revenue_lines (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  invoice_line_id   UUID NOT NULL REFERENCES invoice_lines (id),
  obligation_kind   TEXT NOT NULL CHECK (obligation_kind IN
                      ('over_term', 'per_use', 'point_in_time', 'stored_value')),
  allocated_amount  BIGINT NOT NULL,     -- minor units, after bundle allocation
  currency          TEXT NOT NULL,       -- ISO 4217
  service_start     TIMESTAMPTZ,         -- required for over_term
  service_end       TIMESTAMPTZ,
  units_promised    INTEGER,             -- required for per_use
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE recognition_entries (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  revenue_line_id   UUID NOT NULL REFERENCES revenue_lines (id),
  accounting_period DATE NOT NULL,       -- first day of the period
  amount            BIGINT NOT NULL,     -- negative for reversals
  reason            TEXT NOT NULL CHECK (reason IN
                      ('scheduled', 'usage', 'breakage', 'refund', 'dispute',
                       'credit_note', 'write_off', 'correction')),
  policy_version    TEXT NOT NULL,       -- the rule that produced it
  source_event_id   UUID NOT NULL,       -- what caused it; unique, so retries post once
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (revenue_line_id, source_event_id, accounting_period)
);
```

- **Entries are append-only.** A refund in March of an annual plan posts a negative entry in March; it never edits January's entry ([Append-Only Records](/docs/payments/payment-states#append-only-records)).
- **The policy version is on every entry,** like any rule's decision record ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)). A method change produces a new version and, for closed periods, correcting entries in the open one.
- **The sum checks itself.** For every line, recognized entries plus remaining deferred equals the allocated amount; a nightly job asserts it and opens a break when it doesn't.
- **Periods are dates in the business's reporting time zone,** assigned once when the entry is created, not recomputed on read ([Assign the Business Date Once](/docs/architecture/data-pipelines#assign-the-business-date-once)).

Most businesses buy this instead of building it: billing platforms and dedicated revenue tools compute schedules from invoice data. The product's job is the same either way: lines with periods, allocated prices, delivery events and reversals, delivered completely.

## Syncing to the Accounting System

The product is the operational ledger; the general ledger lives in an accounting system (QuickBooks, Xero, Sage, NetSuite and others). The sync between them is where most "the books don't match" tickets start.

### Summary Journals or Detail

There are two ways to send data, and the vendors' public docs show both:

- **Detail sync** mirrors every customer, invoice and payment into the accounting system. The bookkeeper can drill in, but every later edit becomes a reconciliation problem. Jobber's QuickBooks Online sync is a clear example of the cost: invoices and payments sync one way, one time, so "if you make any edits to an invoice after it has already synced" you must "make the same changes in both programs" ([Jobber: QuickBooks Online sync](https://help.getjobber.com/hc/en-us/articles/115009786748)).
- **Summary sync** posts journal entries by period and account (revenue by product line, cash by deposit, deferred revenue movements, fees, write-offs) and keeps the product authoritative for detail. FieldRoutes builds "journal entries from your mappings and sends them to QuickBooks", reading the customer's existing chart of accounts rather than creating accounts ([FieldRoutes: QBI overview](https://knowledgebase.fieldroutes.com/docs/qbi-overview.md)).

My default is summary journals by day and account plus a full detail export (CSV and API) that ties to them, because it works with any accounting system and keeps one source of truth for each fact. Detail sync only where the bookkeeper genuinely works in invoices, and then one direction only, with edits after sync blocked in the product or posted as new adjusting documents.

Map accounts, don't create them. The customer's chart of accounts belongs to their accountant; the product reads it, stores a mapping from its own accounts (and product lines, tax codes, payment methods) to theirs, and refuses to post when a mapping is missing instead of guessing.

### One Log Per Sync Batch

Every sync run, scheduled or manual, writes one batch record: when it ran, who or what started it, the period and accounts it covered, the totals it sent, the external IDs the accounting system returned, and every error. FieldRoutes records each sync run's journal entry in a sync log that "stays even if you later disconnect the account" and exports to CSV ([FieldRoutes: QBI overview](https://knowledgebase.fieldroutes.com/docs/qbi-overview.md)). That log is how support answers "the books don't match" in minutes: find the period, compare the batch totals to the product's ledger and to what the accounting system shows, and the difference is either a failed batch, an edit made directly in the accounting system, or a late event.

```sql
CREATE TABLE accounting_sync_batches (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  target           TEXT NOT NULL,          -- 'quickbooks_online', 'xero', 'csv'
  period_start     DATE NOT NULL,
  period_end       DATE NOT NULL,
  idempotency_key  TEXT NOT NULL,          -- tenant + target + period + journal kind + revision
  status           TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'confirmed', 'failed')),
  total_debits     BIGINT NOT NULL,
  total_credits    BIGINT NOT NULL,        -- must equal total_debits
  external_ref     TEXT,                   -- the journal ID the accounting system returned
  error            TEXT,
  started_by       TEXT NOT NULL,          -- 'schedule' or a typed actor
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at     TIMESTAMPTZ,
  UNIQUE (tenant_id, idempotency_key),
  CHECK (total_debits = total_credits)
);
```

### Idempotent Sync

A sync that times out after the accounting system accepted the journal will post it twice on retry unless it's idempotent, and a doubled revenue journal is the worst kind of reconciliation break because it balances.

- **One deterministic key per journal:** tenant, target, period, journal kind and revision. A retry reuses the key, and the batch table's unique constraint means the product never builds a second journal for the same thing ([Idempotency](/docs/payments/idempotency)).
- **Store the external ID before declaring success,** and on retry look for a journal with your reference (most accounting APIs let you set a reference or document number) before posting again.
- **Never edit a confirmed journal.** A late event for a synced period becomes a new revision journal for the difference, in the open period, with its own batch record.

## Month-End Close

Closing the books is finance's process, but it runs on what the product provides. At month end, finance needs:

- **A frozen cutoff.** Every event assigned to a period by its business date, and a way to say "everything up to 23:59:59 on the last day, in the reporting time zone, has arrived." Late events (a webhook delayed past midnight, a settlement file that lands on the 2nd) are the usual cause of a close that won't tie.
- **Balances that tie out.** Receivables, deferred revenue, customer credit and prepaid balances, unapplied cash and tax liability, each as the sum of ledger entries, matching the summary journals sent for the period.
- **Reconciliations already done.** Processor settlements and bank deposits matched to the ledger daily, with breaks tracked and owned ([Reconciliation](/docs/payments/payment-states#reconciliation)), and every processor and network invoice reconciled against the fees the ledger expected.
- **The subledger reports:** a deferred revenue rollforward (opening balance, billed, recognized, reversed, closing balance), an aging of receivables, and a list of write-offs with approvers.
- **Controls evidence.** Who changed a price, a mapping, a policy version or a sync setting, and when. Enterprise customers and auditors ask for a SOC 1 report on the controls behind financial numbers, separate from the security-focused [SOC 2](/docs/compliance/soc-2).

### Closed Periods Stay Closed

Once a period is closed, nothing posts into it. Accounting systems enforce this with a closing date; QuickBooks' version is described as "a built-in safeguard to prevent users from accidently changing closed periods", where a change to a closed period requires a password ([Kaufman Rossin: QuickBooks closing date password](https://kaufmanrossin.com/quickbooks-tip-set-a-closing-date-password-to-protect-prior-year-data/)). Stripe's revenue recognition behaves the same way from the product side: when a setting change affects history, "transactions in previously closed accounting periods appear as corrections in the current period" unless finance deliberately reopens the periods ([Stripe: Revenue Recognition settings](https://docs.stripe.com/revenue-recognition/revenue-settings)).

The product should match: a `closed_through` date per tenant, a database constraint or posting check that rejects entries dated before it, and corrections posted in the open period with a reason and a pointer to what they correct. Reopening a period is an explicit, recorded action by someone in finance, never a side effect of a backfill.

## Write-Offs

Some receivables are never collected. Writing one off is an accounting entry, not a discount, and the product should model it as its own ledger entry with a reason and an approver. A write-off disguised as a coupon or a credit makes bad debt look like a sales concession, and leaves nothing to reverse when a collection agency recovers the money later.

There are two methods, and the business's accountant picks one:

- **Direct write-off.** When a specific receivable is judged uncollectible, debit bad-debt expense and credit receivables. Stripe's ledger posts exactly this when an invoice is marked uncollectible: debit bad debt, credit accounts receivable ([Stripe: How Revenue Recognition works](https://docs.stripe.com/revenue-recognition/methodology)). For US tax purposes a business bad debt is deductible "only in the year the debt becomes worthless", and only if the amount was included in income ([IRS: Topic 453, Bad debt deduction](https://www.irs.gov/taxtopics/tc453)).
- **Allowance.** Under US GAAP's credit loss standard, an entity that extends credit, even routine 30-day terms, estimates expected losses each period into an allowance for credit losses, commonly with loss rates by aging bucket ([Keiter: CECL for trade receivables](https://keitercpa.com/?p=34141)). The period's estimate posts as expense against the allowance, and a later write-off of a specific receivable debits the allowance, not expense.

The product supports both by keeping what each needs: receivables with original invoice and due dates (for aging buckets and historical loss rates), a write-off entry per receivable with reason, approver and date, and recoveries as their own entries that reverse a write-off rather than edit it. Writing off doesn't forgive the debt: collection can continue, and a recovery posts income or reverses the allowance, depending on the method.

## Revenue Metrics Are Not Revenue

Operational metrics such as monthly recurring revenue, bookings and billings are useful and are not recognized revenue. MRR, as Stripe defines it, is the monthly-normalized value of active and past-due subscriptions, so a yearly plan of 600 contributes 50 a month whether or not anyone has paid. Bookings are what was sold, billings what was invoiced, recognized revenue what was earned. Each is computed from the same ledger facts by one definition, in one place ([One Definition per Metric](/docs/architecture/data-pipelines#one-definition-per-metric)), and a dashboard that labels billings as revenue will eventually be quoted to someone who reads financial statements.

## Checklist

- **Facts at the finest grain:** service periods on every line, promised units, delivery events, paid versus granted value, allocated prices, all with times.
- **Policies as versioned rules,** with the policy version on every recognition entry, so any schedule can be recomputed.
- **Deferred revenue and prepaid balances as ledger accounts,** separate from unapplied cash and from tax liabilities.
- **Breakage data kept:** issue and redemption history per balance, with jurisdiction; no product-side expiry driven by accounting.
- **Append-only recognition entries,** reversals in the period they happen, and a nightly check that recognized plus deferred equals allocated.
- **Summary journals by default,** mapped to the customer's chart of accounts, with a detail export that ties to them.
- **One batch record per sync,** idempotent by a deterministic key, external IDs stored, confirmed journals never edited.
- **A month-end package:** frozen cutoff, tied-out balances, daily reconciliations, rollforward and aging reports, controls evidence.
- **Closed periods enforced** in the product, corrections in the open period, reopening an explicit recorded action.
- **Write-offs as entries** with reason and approver, supporting direct and allowance methods, with recoveries as reversals.

## References

**Specifications**

- [IFRS Foundation: IFRS 15 Revenue from Contracts with Customers](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/), the core principle, the five steps and the 1 January 2018 effective date
- [Deloitte DART: Customers' unexercised rights (breakage), ASC 606-10-55-46 to 55-49](https://dart.deloitte.com/USDART/home/codification/revenue/asc606-10/roadmap-revenue-recognition/chapter-8-step-5-determine-when/8-8-customers-unexercised-rights-breakage), prepayments as contract liabilities, breakage in proportion to rights exercised or when remote, and unclaimed property as a liability
- [IRS: Topic 453, Bad debt deduction](https://www.irs.gov/taxtopics/tc453), business bad debts deductible in the year they become worthless and only if included in income

**Reference**

- [Stripe: How Revenue Recognition works](https://docs.stripe.com/revenue-recognition/methodology), the double-entry ledger, chart of accounts, each invoice line as a performance obligation amortized over its period, contra revenue for refunds and disputes, and bad debt entries
- [Stripe: Revenue Recognition settings](https://docs.stripe.com/revenue-recognition/revenue-settings), accounting period close and reopening, daily amortization by default, and corrections in the current period
- [Keiter: Current Expected Credit Losses, a trade receivables example](https://keitercpa.com/?p=34141), the CECL allowance for trade receivables and the aging-bucket method
- [Kaufman Rossin: QuickBooks closing date password](https://kaufmanrossin.com/quickbooks-tip-set-a-closing-date-password-to-protect-prior-year-data/), closing dates that lock prior periods

**In practice**

- [Jobber: QuickBooks Online sync](https://help.getjobber.com/hc/en-us/articles/115009786748), two-way and one-way objects, and edits after sync made in both systems
- [FieldRoutes: QBI overview](https://knowledgebase.fieldroutes.com/docs/qbi-overview.md), payment journal entries built from account mappings, nightly sync and a sync log that survives disconnection
- [Stripe: Billing analytics](https://docs.stripe.com/billing/subscriptions/analytics), MRR as the monthly-normalized value of active and past-due subscriptions, excluding taxes
- [Roblox: Annual report on Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1315098/000131509826000024/rblx-20251231.htm), virtual currency bookings in deferred revenue and durable items recognized over a 27-month paying-user lifetime
