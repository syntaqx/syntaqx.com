+++
title = "Replacing a System"
description = "Moving off a legacy system or vendor: Strangler Fig, cutover options, crosswalks, suppressed side effects, reconciliation, rollback windows and exit plans."
category = "Architecture"
order = 415
tags = ["architecture", "migration", "cutover", "legacy", "data-portability", "reconciliation"]
+++

Every system is eventually replaced: an in-house monolith by services, one billing platform by another, a hosted identity provider by a different one, a spreadsheet by software. The replacement is rarely the hard part. The hard part is that the old system is running the business while you build the new one, holding state that is in flight (renewals that bill tonight, sessions that are signed in, work that is half done), and every customer will notice a mistake before you do. A store's version, platform to platform, is the Commerce volume's [Replatforming & Migration](/books/commerce/replatforming).

My rule: **replace a live system in slices, prove each slice against the old system before it takes over, and never let both systems act on the same customer at once.** This chapter is how: choosing a cutover, mapping identities, loading without side effects, running the new system dark, reconciling, keeping a way back, and making sure the next replacement, away from whatever you pick now, is possible too.

## Strangle Instead of Rewriting

The tempting plan is a complete rewrite that replaces the old system on one day. Martin Fowler's description of the Strangler Fig pattern is a warning about that plan: "Replacing a serious IT system takes a long time, and the users can't wait for new features," and teams have "seen this simple-sounding plan go down in flames most of the time" ([Martin Fowler: Strangler Fig](https://martinfowler.com/bliki/StranglerFigApplication.html)). The alternative is to build the new system alongside the old one and move behavior over a piece at a time, until nothing runs in the old system and it can be switched off.

Three things make that work:

- **Seams.** A place where calls or data can be redirected without the caller knowing: a routing layer in front of an API, an event the old system already publishes, a module boundary inside the monolith, a file feed. Finding the seams is most of the design work; where none exists, the first slice is building one.
- **Transitional architecture.** Cartwright, Horn and Lewis define it as "software elements installed to ease the displacement of a legacy system that we intend to remove when the displacement is complete" ([Patterns of Legacy Displacement](https://martinfowler.com/articles/patterns-legacy-displacement/)): the router, the crosswalk tables, the comparison jobs, the switches that suppress side effects. Budget for it and track it, because code meant to be temporary that nobody owns becomes permanent.
- **Slices that deliver value.** Each slice moves real behavior or real customers, so the business sees progress and the team learns how the old system actually behaves (which is never quite what its documentation says) before the riskiest slices.

The same thinking applies when the "old system" is a vendor. You can't put a router inside someone else's SaaS, but you can choose which customers, regions or product lines it serves, and move them one group at a time.

## Big Bang, Phased or Parallel

There are three ways to move the work, and the patterns literature names each one ([Patterns of Legacy Displacement](https://martinfowler.com/articles/patterns-legacy-displacement/)):

| Option | What it means | Good for | Costs |
| --- | --- | --- | --- |
| **Big bang** | A **Stop the World cutover**: "suspend normal business activities while cutting over to new system" | Small systems, one team, a vendor contract that ends on a date | Every error surfaces at once, to everyone |
| **Phased** | A **Canary Release** with a cohort as the subset: "roll out a change to a subset of users", one region, branch, plan or billing day at a time | Most replacements of systems that customers touch | Two live systems for weeks or months, and an operations team that works in both |
| **Parallel** | Both systems process the same inputs and the outputs are compared | Calculations (billing, pricing, tax, payroll, scheduling) where a mismatch is the bug you're looking for | Double the work, and actively dangerous if both act |

Parallel needs a distinction that saves a lot of pain. **Parallel comparison** in the back office, where the new system computes and nothing leaves it, is cheap and catches mapping errors early. **Parallel operation**, where people enter the same work twice or both systems send messages and charges, is expensive, error-prone, and the source of double billing.

My default: phase by cohort, run each cohort through a comparison cycle before it goes live, and let exactly one system act on any customer at any moment. A big bang with a full rehearsal is the right call when the whole business is one cohort anyway, or when the old system disappears on a date you don't control. The hardest public examples are bank core conversions, in [Core Modernization & Conversions](/books/banking-and-lending/core-modernization#big-bang-or-progressive). Pick the calendar too: never cut over a billing system the week of a month-end close, or a scheduling system at the start of a busy season.

## Crosswalks and ID Mapping

Every record you migrate needs a permanent link back to where it came from. Put that link in a crosswalk of external IDs, one row per source key, rather than a `legacy_id` column on each table; the shape and its rules (IDs stored as text with leading zeros intact, links dated rather than deleted, one open link per source key) are in [Crosswalks of External IDs](/docs/architecture/record-linkage#crosswalks-of-external-ids). A migration adds one column to it, the batch that created each link:

```sql
CREATE TABLE migration_batches (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  source         TEXT NOT NULL,          -- 'legacy-billing', 'old-processor'
  cohort         TEXT NOT NULL,          -- 'region-west', 'plan-annual', 'all'
  kind           TEXT NOT NULL CHECK (kind IN ('full', 'delta', 'rerun')),
  input_sha256   TEXT NOT NULL,          -- checksum of the export file as received
  mapping_version TEXT NOT NULL,         -- version of the transform code and mappings
  started_by     TEXT NOT NULL,
  started_at     TIMESTAMPTZ NOT NULL,
  finished_at    TIMESTAMPTZ,
  created_count  INTEGER,
  updated_count  INTEGER,
  rejected_count INTEGER
);

CREATE TABLE account_external_ids (
  tenant_id     UUID NOT NULL,
  source        TEXT NOT NULL,
  source_xid    TEXT NOT NULL,           -- as the source wrote it
  account_id    UUID NOT NULL REFERENCES accounts (id),
  linked_at     TIMESTAMPTZ NOT NULL,
  unlinked_at   TIMESTAMPTZ,
  link_reason   TEXT NOT NULL CHECK (link_reason IN ('migration', 'reviewed', 'merge')),
  batch_id      UUID REFERENCES migration_batches (id),
  PRIMARY KEY (tenant_id, source, source_xid, linked_at)
);

CREATE UNIQUE INDEX account_external_ids_open_idx
  ON account_external_ids (tenant_id, source, source_xid)
  WHERE unlinked_at IS NULL;
```

- **One crosswalk per entity you load:** accounts, addresses or sites, contracts, assets, payment methods. A value in the new system can then be traced to the export line it came from.
- **Re-runs are idempotent.** A loader that finds its target by open source key updates instead of inserting a duplicate, so a failed batch can be fixed and run again ([Idempotency](/docs/payments/idempotency)).
- **Wrong links are closed, not edited.** When reconciliation finds a record loaded onto the wrong account, the bad link gets `unlinked_at` and a corrected one opens with `link_reason = 'reviewed'`, so anything that happened under the first link still explains itself.
- **Vendor mapping files land here too.** When a processor imports stored cards it returns a file linking the previous processor's customer and card IDs to new ones ([Stripe: Import payment data](https://docs.stripe.com/get-started/data-migrations/pan-import)); load it into the payment method crosswalk with the old processor as its source.
- **Keep your own primary keys.** The crosswalk maps their IDs to yours; your IDs never change because a source did. That one decision is what lets the next migration happen without rewriting every foreign key.

Deduplicate before you load, with rules the business agrees to, not inside the loader. Migrations surface every duplicate the old system tolerated; route candidates to a review queue with thresholds as in [Review Bands](/docs/architecture/record-linkage#review-bands), and keep every source ID on the survivor of a merge so history from both lands in one place. Never auto-merge two records that both have active contracts or stored payment methods.

## Load With Side Effects Off

A bulk load looks exactly like a burst of real activity to the rest of the system. Ten thousand new accounts trigger ten thousand welcome emails; a contract created with a past start date triggers an overdue invoice; a payment method attached to an account triggers a verification charge; a state change fires the webhook every integration listens to.

**Every outbound side effect is suppressed for migrated records until their cohort goes live.** Messages, charges, receipts, outbound webhooks, partner notifications, scheduled jobs: none of them run for a record whose cohort isn't live. Two ways to build it, and I use both:

- **A cohort flag checked at the gate.** If outbound messages already pass through one gate ([One Outbound Gate](/docs/architecture/notifications#one-outbound-gate)) and charges through one payment service, the check is one line in each: is this record's cohort live? Blocked sends are logged with a reason, like any other suppression, so you can prove nothing went out.
- **A migration actor on every write.** The loader writes with a typed actor (`migration:<batch_id>`), and event consumers that would trigger side effects ignore events from that actor ([Typed Actors](/docs/architecture/audit-trails#typed-actors)).

Imported state must carry its history, not start today. A contract keeps its original sale date, its paid-through date, its next bill and service dates, and its remaining entitlements; an open invoice keeps its original date, due date and lines so aging continues across the switch. Stripe's subscription import guidance states the continuity rule directly: if a customer has six months left on a yearly subscription, the imported `billing_cycle_anchor` and `start_date` must reflect that mid-cycle term, and scheduling imported subscriptions to start in the future lets you "review the import before you start to bill your customers in production" ([Stripe: Migrate subscriptions using the APIs](https://docs.stripe.com/billing/subscriptions/import-subscriptions)). Anything imported "starting today" double-bills prepaid customers and resets every renewal notice. Dates follow [Time](/docs/fundamentals/time): a one-day shift across thousands of contracts is a time zone or end-of-month bug, not noise.

## Dark Launch and Shadow Reads

Before a cohort's work moves, the new system does that work in the dark. The patterns catalog defines **Dark Launching** as calling "a new back end feature without using results in order to assess its performance impact" ([Patterns of Legacy Displacement](https://martinfowler.com/articles/patterns-legacy-displacement/)); for a replacement the point is correctness as much as performance. [Shadow and Dark Launches](/docs/delivery/deployment-strategies#shadow-and-dark-launches) covers the deployment mechanics.

- **Shadow reads.** For a read path, the router calls both systems, returns the old system's answer, and records any difference. GitHub's Scientist library is the reference implementation: the existing code path is the **control**, the new one is the **candidate**, `run` "will always return whatever the `use` block returns" (the control), exceptions in the candidate are caught and recorded rather than propagated, and mismatches are published for later debugging ([GitHub: Scientist](https://github.com/github/scientist)). Normalize before comparing (ordering, rounding, time zones), or the mismatch log fills with noise and nobody reads it.
- **Shadow computations.** For batch work, the new system computes the cohort's next cycle (invoices, schedules, renewals, payouts) and the comparison job diffs it line by line against what the old system produces for the same cycle.
- **Shadow writes are the dangerous kind.** If the new system must process writes to stay current, it processes them with side effects off, as above, and writes only to its own store. A shadow that can send an email or charge a card isn't a shadow.

A dark launch ends when the mismatch rate for a cohort is zero or every remaining difference is explained and accepted in writing. A difference the old system got wrong is still a difference: decide whether the new system matches the bug for the cutover or the customer sees a change, and if they see a change, tell them first.

## Reconciliation

A migration is correct when you can prove it, cohort by cohort, before the cohort goes live. Reconciliation runs on its own data path, reading the legacy export and the new system's tables independently, never through the loader's code, so a bug in the loader can't hide itself ([Reconciliation](/docs/payments/payment-states#reconciliation)).

- **Counts by type and status.** Active accounts, open contracts by plan, assets, open invoices, payment methods, users with each role: legacy versus new, with every difference explained.
- **Sums to the cent.** Open receivables, receivables by aging bucket, prepaid and credit balances, deferred revenue, recurring value by plan ([Money & Amounts](/docs/payments/money)).
- **Next dates.** Next bill date, next renewal, next scheduled action, for every contract, in both systems.
- **Credentials.** Every customer on automatic payment has a default payment method in the new system, and the mapping file's last four digits and expiry match the legacy record.
- **The shadow cycle.** The new system's computed cycle matches the old system's, line by line.
- **Samples read by a person.** A couple of dozen records end to end, chosen to include the oddest plans, the largest customers, accounts in collections and anything flagged during deduplication. Automated checks find what you thought to check; a person reading finds the rest.

Reconciliation is a gate, not a report. A cohort goes live only when its reconciliation passes and someone with authority approves it, and the approval, the report it approved and the batch IDs it covered are recorded. Processors work the same way: Stripe sends a validation summary and imports card data only "after your explicit approval" ([Stripe: Import payment data](https://docs.stripe.com/get-started/data-migrations/pan-import)).

After go-live, watch the signals that say the reconciliation missed something: approval rates on the first recurring charge run, declines by code, refunds for double charges, and contacts that start with "why was I charged". A new merchant account is a predictable source of declines: Stripe warns that issuers "might not recognize the new MID", lists the decline codes that tend to appear, and recommends ramping volume with one-time and customer-initiated payments before recurring ones.

## Cutover and the Rollback Window

Each cohort moves through the same phases, each with an owner and an exit criterion:

1. **Transitional load.** A full export is archived unchanged with a checksum, then loaded with crosswalk rows and side effects suppressed.
2. **Dark launch.** The new system computes the cohort's work; comparisons run; breaks loop back to the mapping and a re-run.
3. **Cutover.** The old system stops acting for the cohort (its recurring billing paused or cancelled, its scheduled jobs disabled for those records), a final delta export catches anything that changed since the load, and the new system starts acting. The order matters: stop the old system first. Stripe's warning applies to any two billing systems: cancel the old subscriptions as soon as the new ones are active "or you'll bill your customers twice".
4. **Rollback window.** For a defined period after cutover, the cohort can go back. That requires the old system's records for the cohort to stay untouched (paused, not deleted), and the new system to record everything it did so it can be replayed or reversed: charges taken, messages sent, changes customers made. A rollback after the new system has billed is a reconciliation in reverse, not a switch; decide before cutover who can order one and what they check first.
5. **Retire.** When the rollback window closes for the last cohort, the old system stops running. What's left is an archive.

The rollback window is a number written down before cutover, long enough to cover one full cycle of whatever the system does (a billing period, a payroll run, a month-end close), and short enough that two systems' data doesn't drift apart. Changes customers make during the window are the hard part: a rollback has to carry them back too, or they're lost.

## Keep the Old System as a Read-Only Archive

Not everything migrates, and some of what doesn't is a record you're obliged to keep: regulated records, signed documents, history a court or auditor may ask for. Exports also lose detail: a service history may come across as job rows with dates and totals while the regulated detail inside them stays behind.

- **Keep every original export unchanged,** with checksums, encrypted at rest, for the longest retention period of anything in it ([Retention Schedules by Record Type](/docs/architecture/data-retention#retention-schedules-by-record-type)). Card numbers never land here; they move processor to processor.
- **Make the archive retrievable** by the keys people will ask with (customer, address, document number, date), not a bucket of files only one engineer can search. A crosswalk row pointing from the new record to the archived source record is the cheapest index there is.
- **Export the old audit trail before you leave.** Activity logs are the data least likely to migrate and the most likely to be asked for later; some vendors keep them for a limited period and don't export them at all. Pull every change log the old system offers while you still have access.
- **Read-only means read-only.** If the old system stays up for lookups, revoke write access for everyone, including administrators, and turn off its scheduled jobs and integrations. An old system that can still send a reminder will eventually send one.

## Vendor Exports and Lock-In

Switching cost is set by what the old system lets you take, and the time to find out is before you sign, not when you're leaving. Three layers decide it:

- **Self-serve exports.** CSV and spreadsheet exports carry current values and rarely carry history, relationships, documents or audit logs.
- **APIs.** A bulk export endpoint or a warehouse connector is portability in principle; rate limits, paid access tiers and missing objects decide whether it's portability in practice.
- **Credentials.** Card numbers, password hashes and signing keys can't be exported by an ordinary API at all, by design. They move through a special process or not at all.

### Payment Credentials

Stored cards live in a processor's vault, so moving them means the old processor exporting card numbers directly to the new one. Stripe's process is the clearest public description of the path: the previous processor encrypts the data with Stripe's PGP key and uploads it to a dedicated SFTP server, Stripe validates it, imports after approval and returns the mapping file. What doesn't move matters as much: card security codes (PCI DSS prohibits storing them after authorization), data the old processor never stored, and subscriptions and invoices, which move separately. Processors "can take anywhere from a few days to several months to produce a final export", and some charge a fee, so request the export first ([Stripe: Import payment data](https://docs.stripe.com/get-started/data-migrations/pan-import)).

The reverse direction has its own conditions. Stripe exports card data only to a PCI DSS Level 1 processor that provides its Attestation of Compliance or a listing on Visa's registry of service providers, with a PGP key of 4,096 bits or more hosted on one of its domains, and it doesn't export payment history or subscriptions ([Stripe: Request a payment data export](https://docs.stripe.com/get-started/data-migrations/pan-export)). Read your processor contract for the export clause before you sign: Stripe notes that a previous processor "might be contractually obligated to release your data on request". Who provisions network tokens, and whether you hold card data in a processor-agnostic vault, decides how hard this is; [Processor Routing](/books/payments/processor-routing#tokens-decide-how-free-you-are) covers that choice.

### Identities and Passwords

Identity providers are the other credential lock-in. Whether password hashes can leave, and in what algorithm, differs by vendor: Auth0 exports them only by support ticket, not on its free tier, and won't commit to a date for the export ([Auth0: Export Data](https://auth0.com/docs/troubleshoot/customer-support/manage-subscriptions/export-data)). The alternative to exporting hashes is migrating users as they sign in: Amazon Cognito's user migration trigger verifies a user against the old directory on first sign-in so they "can continue using their existing passwords and do not have to reset them" ([Amazon Cognito: Importing users](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-import-users.html)). Users who never come back get a reset email at the end. [Plan the Exit](/docs/security/identity-providers#plan-the-exit) has the rest.

## Plan the Exit Before You Enter

Every system you adopt is a replacement project you'll run later. A few decisions at the start make that project ordinary instead of heroic:

- **Your own primary keys everywhere.** Vendor IDs live in crosswalks or mapped columns keyed by source, never as the key other tables reference.
- **One boundary per vendor.** If your code talks to the payment processor, the identity provider or the tax engine through one module, swapping what's behind it is a project, not a rewrite.
- **Know the export path for every credential** (cards, password hashes, keys) before data goes in, and get the export commitment in the contract.
- **A tested export.** Run a full export once a year and load it somewhere, the same way you test backups ([Restores Are What Matter](/docs/operations/disaster-recovery#restores-are-what-matter)). An export nobody has loaded is a hope.
- **Your own copy of what matters.** Events, ledger entries and audit records that the business depends on are kept in your systems, not only in the vendor's dashboard.

If you build a platform others adopt, the same list is what you owe them: a full tenant export of every entity, version and history in documented formats, a bulk API, a written commitment to cooperate with credential exports through your processor, and a retention policy for a departed tenant's data that covers their record-keeping obligations. It's the honest version of features customers need anyway, and the importer that powers onboarding (templates, validation with a failure file per rejected row, dry runs, idempotent re-runs, dependency order) is the same code run in the other direction.

## Checklist

- **Slices, not a rewrite:** seams identified, transitional architecture budgeted and owned, each slice moving real behavior or customers.
- **Phased by cohort by default,** with a comparison cycle before each cohort goes live, and one system acting on any customer at a time.
- **A crosswalk per migrated entity,** source IDs as text, dated links, the batch on every link, your own primary keys untouched.
- **A run log per batch:** who ran it, input checksum, mapping version, counts, and a failure file per rejected row.
- **Side effects suppressed** for migrated records until their cohort is live, enforced at the outbound gates and logged.
- **History imported, not reset:** original dates, paid-through dates, next dates and open items with their lines.
- **Dark launch with shadow reads or computations,** returning the old answer and recording every mismatch.
- **Reconciliation as a recorded gate:** counts, sums to the cent, next dates, credentials, a shadow cycle and human samples.
- **Cutover stops the old system first,** then a delta load, then the new system, with a written rollback window covering one full cycle.
- **A read-only archive** of original exports and audit logs, retrievable by customer for the full retention period.
- **The exit path known before adoption:** credential exports, contract terms, a tested annual export.

## References

**Reference**

- [Martin Fowler: Strangler Fig](https://martinfowler.com/bliki/StranglerFigApplication.html), gradual replacement over a rewrite, seams and transitional architecture
- [Cartwright, Horn and Lewis: Patterns of Legacy Displacement](https://martinfowler.com/articles/patterns-legacy-displacement/), Transitional Architecture, Dark Launching, Canary Release, Stop the World cutover and parallel running
- [GitHub: Scientist](https://github.com/github/scientist), control and candidate code paths, returning the control's result, catching candidate exceptions and publishing mismatches

**In practice**

- [Stripe: Import payment data](https://docs.stripe.com/get-started/data-migrations/pan-import), processor-to-processor PGP and SFTP transfer, validation and explicit approval, the mapping file, what can't be imported, export timelines, new-MID declines and contractual release of data
- [Stripe: Request a payment data export](https://docs.stripe.com/get-started/data-migrations/pan-export), exports only to PCI DSS Level 1 processors with an AOC and a 4,096-bit PGP key; no history or subscriptions
- [Stripe: Migrate subscriptions using the APIs](https://docs.stripe.com/billing/subscriptions/import-subscriptions), billing cycle continuity and future start dates for review before billing
- [Auth0: Export Data](https://auth0.com/docs/troubleshoot/customer-support/manage-subscriptions/export-data), password hash exports by support ticket, not on the free tier and not at a guaranteed time
- [Amazon Cognito: Importing users into a user pool](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-import-users.html), migration on first sign-in without password resets, and bulk CSV import
