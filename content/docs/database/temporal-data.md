+++
title = "Effective Dating & History"
nav_title = "Effective Dating"
description = "Valid time and recorded time, effective-dated rows and as-of queries in PostgreSQL ranges, versioned plans and prices, snapshots and scheduled changes."
category = "Database"
order = 505
tags = ["database", "postgres", "temporal", "history", "versioning"]
+++

Most tables store what's true now. Then someone asks what was true then: what a player paid for a skin before the holiday sale, which sales region an account belonged to last March, what interest rate applied on the day a loan was drawn, which plan price a customer agreed to two years ago. A table that overwrites `price = 24.00` can't answer, and neither can a report run against it, so the business reconstructs the answer from emails and screenshots. The fix isn't to keep history of everything; it's to know which values change on a schedule, give those an effective range, and make every question about them carry a date.

## Two Kinds of Time

Every fact about the past has two times, and confusing them is where most temporal bugs start:

- **Valid time:** when the fact is true in the world. The price is $24 from November 1. The account moves to the north sales region from the 15th. Martin Fowler calls this *actual* history.
- **Recorded time:** when the system knew it. Somebody entered that price change on October 20, and corrected a typo in it on October 22. Fowler calls this *record* history.

Fowler's example is a salary: on March 15, HR reports that Sally got a raise effective February 15, so February's payroll was computed from a belief that has since changed. Actual history isn't append-only, because "we go back and make retroactive changes", while record history is ([Bitemporal History](https://martinfowler.com/articles/bitemporal-history.html)). A system that tracks both is **bitemporal**. SQL:2011 standardized both halves: application-time period tables for valid time, system-versioned tables for recorded time, and the two together as bitemporal tables ([SQL:2011](https://en.wikipedia.org/wiki/SQL:2011)).

My default: **valid time on the handful of values that change on a schedule, recorded time from the [audit trail](/docs/architecture/audit-trails) for everything, and full bitemporal tables only where a retroactive correction changes money already computed.** Fowler agrees that if you can avoid bitemporal history, "that's usually preferable." Payroll, interest accrual, insurance premiums and commissions are where you can't.

## Effective-Dated Rows

Fowler's **temporal property** is the pattern: a value that changes over time, read "as of" a date, where a change can take effect in the past (a retroactive correction), now, or in the future (a scheduled change) ([Temporal Property](https://martinfowler.com/eaaDev/TemporalProperty.html)). In a table, that means one row per period instead of one row per thing:

| Domain | Effective-dated value |
| ------ | --------------------- |
| A game | An item's store price, a region's season, a battle pass's reward track |
| A SaaS app | The price list new customers see, a tenant's seat limit, a feature's rollout terms |
| A field service business | A territory's boundary, a technician's territory membership, a license's validity |
| A bank or lender | A product's interest rate, a fee schedule, a customer's credit limit |
| A payments platform | Interchange tables and each merchant's contracted price |

Fowler's advice is to use it for a few properties, and to ask whether anyone needs the history at all; a regular column can be made temporal later. Effective-date the values people schedule changes to, dispute after the fact, or price money with. Leave a customer's display name alone: the audit trail already says when it changed.

## One Naming Standard: Range Columns

PostgreSQL has range types, and they're the right representation. One column holds the period, the database understands it, and the constraint that matters (no two values for the same key at the same time) becomes one line.

- **The column is `valid_during`.** Not `effective_range`, `period` or `validity` in different tables. Recorded time, where you keep it, is `recorded_during`.
- **`DATERANGE` when the business says "effective on", `TSTZRANGE` when it says "effective at".** A price change effective November 1 is a date, resolved in the location's zone like any [business date](/docs/fundamentals/time#business-dates-business-days-and-holidays). A season that opens worldwide at 18:00 UTC is an instant. The same split as `_on` and `_at` in [Naming Conventions](/docs/database/naming-conventions).
- **Closed-open, always.** The built-in discrete ranges, `daterange` among them, already use the canonical form `[)`: the lower bound included, the upper excluded ([PostgreSQL: Range Types](https://www.postgresql.org/docs/current/rangetypes.html)). November's row is `[2026-11-01,2026-12-01)` and December's starts at `2026-12-01`, so adjacent rows meet without a gap or a shared day. SQL:2011 periods use the same closed-open semantics.
- **An open end means "until further notice".** The current row's upper bound is omitted (`[2026-11-01,)`), and `upper_inf(valid_during)` finds it. No `9999-12-31` sentinels, and no mixing them with `infinity`, which `upper_inf` reports as bounded.

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE item_prices (
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id      UUID NOT NULL REFERENCES items (id),
  region_id    UUID NOT NULL REFERENCES regions (id),
  amount       BIGINT NOT NULL,
  currency     TEXT NOT NULL,
  valid_during TSTZRANGE NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT item_prices_valid_during_excl
    EXCLUDE USING GIST (item_id WITH =, region_id WITH =, valid_during WITH &&)
);
```

A plain `UNIQUE (item_id, region_id)` would allow one row ever; the **exclusion constraint** allows many, as long as no two for the same item and region overlap. Equality on UUIDs inside a GiST index is what `btree_gist` provides, and PostgreSQL's own documentation pairs the two for exactly this ([btree_gist](https://www.postgresql.org/docs/current/btree-gist.html)). The constraint's GiST index also serves the as-of lookups below. The name follows the pattern Postgres generates (`_excl`).

![Dimensional timeline of item_prices for one item and region, with illustrative amounts. Four rows meet end to end: 2400 from 2026-10-01, 1499 from 2026-11-01, 2400 from 2026-12-01, and 2600 from 2027-01-01 with an open end. A hatched insert overlapping two rows is rejected by the exclusion constraint, an as-of read on 2026-11-05 lands in the second row, and a detail view shows the closed-open boundary at 2026-11-01, where one row's excluded upper bound equals the next row's included lower bound.](/diagrams/pb-database-effective-dating.svg "One row per period, closed-open so neighbors meet without a gap or a shared day; the constraint refuses overlaps and the open end means until further notice.")

**On PostgreSQL 18 and later**, temporal keys are built in. `UNIQUE (item_id, region_id, valid_during WITHOUT OVERLAPS)` behaves like the exclusion constraint above, and a foreign key with `PERIOD` requires the referenced rows to cover the referencing row's whole range, so an account's region membership can't outlive the region ([CREATE TABLE](https://www.postgresql.org/docs/current/sql-createtable.html); [PostgreSQL 18 release notes](https://www.postgresql.org/docs/release/18.0/)). The cascading actions (`CASCADE`, `SET NULL` and the rest) aren't supported on temporal foreign keys, so changes still go through your code.

**If you use paired columns** (an ORM that can't map ranges, or a database without them), name them `valid_from_on` and `valid_to_on` for dates, or `valid_from_at` and `valid_to_at` for instants, keep the end exclusive and nullable for "open", and say so in the column comment. You still get the overlap guarantee in Postgres by building the range in the constraint: `EXCLUDE USING GIST (item_id WITH =, daterange(valid_from_on, valid_to_on) WITH &&)`, plus a `CHECK (valid_to_on > valid_from_on)`. What you lose is everything else the range gives for free, so every query has to get the null and the exclusive end right by hand.

## As-Of Queries

Every read of an effective-dated value names the moment it's asking about:

```sql
SELECT amount, currency
FROM item_prices
WHERE item_id = $1
  AND region_id = $2
  AND valid_during @> $3::timestamptz;
```

- **The as-of moment is a parameter, not `NOW()`.** A refund job running at 00:05 prices yesterday's purchases as of the purchase, not as of the job. A nightly report for October 31 reads October 31's region assignments. Calls to `NOW()` buried in queries are how a job that runs late silently uses the wrong rates.
- **Join every temporal table at the same moment.** Joining a membership to its region needs both `valid_during @> $as_of` conditions; constraining only one returns every version of the other.
- **Store the answer where it was used.** An order records the price it charged; it doesn't re-ask the price table later. As-of queries are for deciding; the decision is kept (see Snapshots below).
- **APIs that serve these values accept an as-of time** and echo the one they used, in [RFC 3339](/docs/fundamentals/time), so "what will this cost on the 1st?" is a query rather than a support ticket.

## Changing a Value

A change closes the current row and opens the next, in one transaction:

```sql
BEGIN;

UPDATE item_prices
SET valid_during = tstzrange(lower(valid_during), $4)
WHERE item_id = $1 AND region_id = $2 AND valid_during @> $4::timestamptz;

INSERT INTO item_prices (item_id, region_id, amount, currency, valid_during)
VALUES ($1, $2, 1499, 'USD', tstzrange($4, NULL));

COMMIT;
```

If a later row already exists (a sale price scheduled for next week), the new row ends where that one starts instead of running open-ended; the exclusion constraint rejects the insert otherwise, which is the point. Run the change at an isolation level that can't interleave with another editor ([Transactions & Concurrency](/docs/database/transactions-and-concurrency)), and write an [audit entry](/docs/architecture/audit-trails) in the same transaction with who changed it and why.

Rows whose period has started are history. Fixing a past value in place, without recorded time, is how a disputed invoice ends up "proving" a price nobody charged. A correction to the past is either a new effective-dated change plus an audit entry that says it was retroactive, or, where money was already computed from the old value, a bitemporal correction.

## Scheduling Future Changes

A future row is the schedule. Insert the January price today with `valid_during = [2027-01-01,)` and on January 1 every as-of query returns it, with no job flipping a column at midnight. A midnight job is a change that doesn't happen when the job doesn't run, and leaves no record of what the price was before.

What does need a job is the side effects at the boundary: a notice to subscribers 30 days before a price increase, a cache to invalidate, a store page to rebuild. Enqueue those from the row (keyed on the row's ID and its effective moment so a rerun doesn't double-send), not from a clock that guesses ([Background Jobs](/docs/architecture/background-jobs#scheduling)). Cached values get a lifetime that ends at the next boundary, `upper(valid_during)` at most, or the cache serves December's price on January 1 ([Application Caching](/docs/architecture/application-caching#invalidation)).

A scheduled row that hasn't taken effect can be edited or withdrawn, because nothing has been computed from it yet; record the withdrawal in the audit trail all the same, because customers may have been told. Once its period starts, it's history like the rest.

## Versioned Entities

Effective-dated rows answer "what's the value at time T?", one value per key at a time. Some things are different: several versions are in force at once, for different customers. A SaaS plan raised its price in March, and customers who signed in January stay on the old price until renewal. A terms of service template is on version 7, while each customer is bound by the version they accepted. A game's matchmaking rules ship as a ruleset, and a replay is only explainable against the ruleset it ran under.

Those are **versioned entities**: a stable identity, a sequence of immutable versions, and references that point at a version, not at the identity.

```sql
CREATE TABLE plan_versions (
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  plan_id      UUID NOT NULL REFERENCES plans (id),
  version      INTEGER NOT NULL,
  amount       BIGINT NOT NULL,
  currency     TEXT NOT NULL,
  seat_limit   INTEGER,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT plan_versions_plan_id_version_key UNIQUE (plan_id, version)
);

-- subscriptions.plan_version_id references plan_versions (id)
```

- **Published versions never change.** Editing the plan creates version 4; a trigger or the table's permissions reject updates once `published_at` is set. Stripe's prices work this way: once created, only a price's metadata, nickname and active flag can be updated, a new amount is a new price, and archiving the old one leaves existing subscriptions on it ([Stripe: Manage products and prices](https://docs.stripe.com/products-prices/manage-prices)).
- **"Which version do new customers get?" is an effective-dated pointer**, a `plan_offers` row with `valid_during` and a `plan_version_id`, so a launch can be scheduled like any other change.
- **Moving existing customers is an explicit migration,** with notice where the law or the contract requires it, never a side effect of editing the plan. Price increases on renewal are where consumer automatic-renewal rules bite; [Service Agreements & Plans](/books/field-operations/service-agreements#upgrades-downgrades-and-changes) has one industry's version.
- **Every derived record cites the version that produced it.** The invoice names the plan version, the payout names the fee schedule version, the settlement names the interchange table version ([Interchange & Pricing](/books/payments/interchange-and-pricing#a-pricing-engine)).

## Snapshots

Fowler's **snapshot** is "a view of an object at a point in time" ([Snapshot](https://martinfowler.com/eaaDev/Snapshot.html)). In a schema, it's copying the values you used at the moment of the fact, rather than pointing at something that can change.

Reference a version ID when the version is immutable and yours. Copy the values when the source is mutable or someone else's: a tax rate from a provider, an exchange rate, a vendor's product label, a credential that will be renewed. And copy anyway for documents that stand on their own: an invoice line carries its amount, currency, discount and tax even though it also names the price version, because the invoice is what the customer received. [Audit Trails](/docs/architecture/audit-trails#snapshot-what-changes-underneath-you) covers what to snapshot and storing documents once by content hash.

## Recorded Time and Corrections

When money is computed from a value that later turns out to have been wrong, you need both times. A savings product's rate is cut effective March 1, but the change is entered on March 10. Interest accrued from the 1st to the 10th used the old rate. The customer, the auditor and finance each ask a different question: what was the rate on March 5 (the new one), what did the system believe on March 5 (the old one), and what was actually paid. Valid time alone can't answer the second, and without it nobody can explain the third.

Add `recorded_during` and never update a row's values or valid time again; a correction ends the old row's `recorded_during` and inserts its replacement:

```sql
-- What did the system believe on March 10 about the rate on March 5?
SELECT rate_bps
FROM product_rates
WHERE product_id = $1
  AND valid_during @> DATE '2027-03-05'
  AND recorded_during @> TIMESTAMPTZ '2027-03-10T12:00:00Z';
```

The exclusion constraint becomes `(product_id WITH =, valid_during WITH &&, recorded_during WITH &&)`: one belief per day per moment of knowledge. PostgreSQL implements valid-time keys but not SQL:2011 system versioning, so `recorded_during` is maintained by your write path or a trigger. The money itself is fixed the way all money is: an adjusting entry for the difference, never an edit to past accruals ([Payment States & Ledgers](/docs/payments/payment-states#append-only-records)). Rates live in basis points or exact decimals, never floats ([Money & Amounts](/docs/payments/money)).

## What Goes Wrong

- **Overlaps,** which a missing exclusion constraint allows and an as-of query then returns twice.
- **Gaps,** which the constraint doesn't catch. Where a value must always exist (every store in a region, every product with a rate), validate on save that a key's ranges are contiguous, `-|-` adjacent, from the first to the open-ended last.
- **Inclusive end dates.** A `valid_to` of December 31 meant as "through the 31st" next to code that treats it as exclusive loses a day at every boundary. Closed-open everywhere, no exceptions.
- **The wrong day.** "Effective November 1" begins at midnight in the location's zone, not the server's or UTC.
- **`NOW()` in batch work,** so a late job prices with tomorrow's rates.
- **Editing published versions,** which silently reprices every customer on them.
- **A cron that flips values,** instead of rows that already say when they apply.
- **Effective-dating everything,** so every query carries a date filter for values nobody ever disputes.

## Checklist

- **Pick valid time for scheduled values, the audit trail for the rest,** and bitemporal only where retroactive corrections move money.
- **`valid_during` as a range,** `DATERANGE` for "effective on" and `TSTZRANGE` for "effective at", closed-open, with an open upper bound for current rows.
- **An exclusion constraint per key** with `btree_gist`, or `WITHOUT OVERLAPS` and `PERIOD` foreign keys on PostgreSQL 18.
- **Paired columns only when you must,** named `valid_from_on` and `valid_to_on`, end exclusive, with the same constraint built from them.
- **Every query takes an as-of moment** as a parameter, and every temporal join applies it to each table.
- **Changes close one row and open the next** in one transaction, with an audit entry.
- **Future changes are future rows;** jobs only handle side effects at the boundary, and caches expire there.
- **Versioned entities are immutable once published,** referenced by version ID, with new-customer offers as an effective-dated pointer.
- **Snapshot values at the moment of the fact** when the source is mutable or external.

For one industry's application, see effective-dated territories, memberships and shifts in [Territories & Capacity](/books/field-operations/territories-and-capacity#effective-dating).

## References

**Specifications**

- [SQL:2011](https://en.wikipedia.org/wiki/SQL:2011), application-time and system-versioned period tables, bitemporal tables and closed-open periods

**Reference**

- [PostgreSQL: Range Types](https://www.postgresql.org/docs/current/rangetypes.html), canonical `[)` form for `daterange`, unbounded ranges, multiranges and exclusion constraints over ranges
- [PostgreSQL: Range Functions and Operators](https://www.postgresql.org/docs/current/functions-range.html), `@>`, `&&`, `-|-`, `upper_inf` and the other range operations
- [PostgreSQL: btree_gist](https://www.postgresql.org/docs/current/btree-gist.html), GiST equality for scalar types, including `uuid`, in exclusion constraints
- [PostgreSQL: CREATE TABLE](https://www.postgresql.org/docs/current/sql-createtable.html), `WITHOUT OVERLAPS` keys and `PERIOD` foreign keys
- [PostgreSQL 18 release notes](https://www.postgresql.org/docs/release/18.0/), temporal primary key, unique and foreign key constraints
- [Martin Fowler: Temporal Property](https://martinfowler.com/eaaDev/TemporalProperty.html), values read as of a date, with retroactive and scheduled changes
- [Martin Fowler: Bitemporal History](https://martinfowler.com/articles/bitemporal-history.html), actual and record history, and when retroactive changes require both
- [Martin Fowler: Snapshot](https://martinfowler.com/eaaDev/Snapshot.html), a view of an object at a point in time

**In practice**

- [Stripe: Manage products and prices](https://docs.stripe.com/products-prices/manage-prices), immutable price amounts, new prices for new amounts, and archived prices that keep existing subscriptions
