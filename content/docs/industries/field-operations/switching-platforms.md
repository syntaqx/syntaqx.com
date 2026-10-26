+++
title = "Switching Platforms"
description = "Moving between field service platforms: what imports and what doesn't, card token transfer, phased cutover, reconciliation, audit and data portability."
category = "Field Operations Industry"
order = 1532
part = "Running the Platform"
tags = ["field-operations", "migration", "cutover", "data-portability", "payments", "reconciliation"]
+++

A field service business that switches software is changing the engine while the car is moving. On the day of the switch it has thousands of recurring agreements with next-service dates and next-bill dates in flight, technicians on routes, invoices half paid, cards on file that renew tonight, commercial contracts with response-time promises, and customers who will notice any of it going wrong before the office does. The old system holds years of service history that a regulator, a court or a manufacturer's warranty desk may ask for, and some of it can't be exported at all. The vendors' public docs agree on more than they differ: customers and properties move easily, open balances move as a number, history moves partly or not at all, card numbers move only processor to processor, and the hardest part is cleaning the data. This chapter is how a switch works, what moves and what doesn't, how to cut over without double-billing anyone, how to prove the migration was right, and how to build a platform that customers could leave, which is also the platform they trust enough to join.

## What Moves and What Doesn't

Each class of data has its own path and its own failure mode.

| Data | How it usually moves | What goes wrong |
| --- | --- | --- |
| Customers, contacts, properties | Template or CSV import; vendor-run load | Duplicates. Commusoft updates on Address line 1 plus Surname; Jobber creates a property only if a Street or Address column has content |
| Settings and reference lists | Recreated by hand first | Commusoft requires customer types, advertising sources and service reminder names to exist before the import |
| Recurring agreements | Recreated with original dates, or vendor-loaded | Next-service and next-bill dates reset to the import date |
| Equipment and warranties | ServiceTitan has an Equipment template; elsewhere notes or nothing | Serial numbers, install dates and warranty registrations lost, so warranty claims fail |
| Open balances | A starting balance per account, or an AR import | Invoice-level detail lost, so aging and disputes can't be answered |
| Service history | Partly (jobs with dates and totals) or not at all | Pesticide application records, photos and signatures left behind |
| Documents and photos | Some paid services only | JobNimbus notes that its QuickBooks sync alone doesn't bring notes, documents or photos |
| Card and bank credentials | Processor to processor, encrypted | New merchant ID declines; double charges if both systems bill |
| Price book | Spreadsheet import; industry books | Successware imports Profit Rhino, NSPG and other published books |
| Custom fields | Mapped to notes or tags | Housecall Pro can't create custom fields, so structured data becomes text |
| Audit and activity logs | Almost never | The record of who changed what is gone unless exported first |

**Service history** is the decision with the longest tail. GorillaDesk doesn't import it; ServiceTitan's Jobs template carries job number, invoice number, status, dates, subtotal and tax; specialist migration teams say they move it. Even when job rows move, the regulated detail inside them often doesn't: the product, EPA registration number, amount and target pests of each pesticide application are records some states require you to keep for years ([Regulated Materials](/docs/industries/field-operations/regulated-materials)). The rule: either migrate that detail as structured records with their original values, or keep the legacy export as a retrievable archive for the full retention period, indexed by customer and address. A summary line that says "General pest service, $89" is not a pesticide record.

**Equipment** matters most to repair and install businesses. An HVAC or water heater company's install base (make, model, serial number, install date, the manufacturer warranty registration and the labor warranty the company sold) is what lets a technician file a warranty claim, quote a replacement for a twelve-year-old unit, or run a maintenance plan per asset. ServiceTitan imports it through its own template; tools without an asset model flatten it into notes, where the serial number can't be searched or validated. Migrate equipment as assets attached to properties, with their original install dates, before the service history that references them.

**Agreements** must keep their history, not just their terms. Housecall Pro's guidance for a plan that was sold and paid before the switch is to enter the original sale date as the start date, record who sold it, mark visits already completed, and accept it with "Plan has already been paid for." That is the general pattern: an imported agreement carries its original sale date (cancellation rights, renewal dates and commissions depend on it), its seller, its paid-through date, its next service date and its remaining visits. An agreement imported "starting today" bills a prepaid customer twice and resets every renewal notice. Commercial contracts add their SLA terms and the clock state of open work orders; a work order four hours into a six-hour response window can't restart at zero on the new system.

**Open balances** move best as invoices. A starting balance is enough to collect but not to answer "what is this charge," which is the first question in a dispute; carry each open invoice with its original date, due date and lines, so aging is continuous across the switch ([Operating Metrics](/docs/industries/field-operations/operating-metrics)).

## Moving Payment Credentials

Cards on file are the part customers notice and the part software vendors can't move themselves, because the card numbers live in a processor's vault ([Stored Cards & Recurring Billing](/docs/industries/payments/stored-credentials)). The industry path is a **PAN import**: the old processor exports the card data directly to the new one, encrypted, and the new processor returns tokens. Stripe's documentation is the clearest public description:

- The previous processor encrypts the data with Stripe's PGP key and uploads it to a dedicated SFTP server; the merchant never handles card numbers.
- Stripe reviews the data and sends a validation summary, which may ask the merchant to confirm the last four digits for two customer IDs, then imports only after explicit approval.
- It returns a **mapping file** linking the previous processor's customer and card IDs to new ones. Your platform updates its payment profiles from that file.
- Card security codes can't be imported (PCI DSS prohibits storing them after authorization), nor data the old processor never stored, nor subscriptions and invoices, which move separately.
- Processors "can take anywhere from a few days to several months to produce a final export," and some charge a fee; imports typically complete within 10 business days of valid data. Request the export first.
- The new merchant ID is unfamiliar to issuers, so expect more declines at first; Stripe recommends ramping volume, sending customer-initiated and one-time payments before recurring ones.

The reverse direction works the same way. Stripe exports card data only to a PCI DSS Level 1 processor that provides its Attestation of Compliance (or a Visa registry listing) and a PGP key of 4,096 bits or more hosted on its own domain, and it doesn't export payment history or subscriptions. Who holds the network tokens and vault tokens decides how hard this is, which is half of [Processor Routing](/docs/industries/payments/processor-routing#tokens-decide-how-free-you-are).

ACH is similar: Stripe imports ACH Direct Debit details in the same encrypted file, but the new processor will debit on the strength of the authorization the customer gave you, so keep that signed authorization with the agreement and migrate it as a document ([ACH](/docs/industries/payments/ach)). Recurring billing schedules move as data. Stripe's subscription import guidance makes the continuity rule explicit: set the start date and billing cycle anchor so a customer six months into a yearly term stays on that term, schedule imported subscriptions to start in the future so they can be reviewed before billing, and cancel the old subscriptions "as soon as your Stripe subscriptions become active or you'll bill your customers twice."

## Identity and Mapping

Every migrated record needs a permanent link to where it came from, kept in a crosswalk of external IDs rather than a `legacy_id` column on each entity. The general rules (one row per source key, IDs kept as text with leading zeros intact, dated links instead of deletes, idempotent re-runs that find rows by source key) are in [Crosswalks of External IDs](/docs/architecture/record-linkage#crosswalks-of-external-ids). A migration uses that shape, one crosswalk per entity it loads (`account_external_ids`, `property_external_ids`, `agreement_external_ids`, `asset_external_ids`, `payment_method_external_ids`), and adds one column, the batch:

```sql
CREATE TABLE agreement_external_ids (
  tenant_id     UUID NOT NULL,
  source        TEXT NOT NULL,       -- 'legacy-fsm', 'old-processor'
  source_xid    TEXT NOT NULL,       -- as the source wrote it
  agreement_id  UUID NOT NULL REFERENCES agreements (id),
  linked_at     TIMESTAMPTZ NOT NULL,
  unlinked_at   TIMESTAMPTZ,
  link_reason   TEXT NOT NULL,       -- migration | reviewed | merge
  batch_id      UUID,                -- the load that created the link
  PRIMARY KEY (tenant_id, source, source_xid, linked_at)
);

-- one open link per source key at a time
CREATE UNIQUE INDEX agreement_external_ids_open_idx
  ON agreement_external_ids (tenant_id, source, source_xid)
  WHERE unlinked_at IS NULL;
```

- **The batch.** Every link records the load that created it, so a bad batch can be found, compared and re-run, and any value can be traced to the export line it came from. A re-run finds its rows by open source key instead of inserting duplicates.
- **Wrong links are closed, not fixed in place.** When reconciliation finds a legacy agreement loaded onto the wrong property, the bad link gets `unlinked_at` and a corrected one opens with `link_reason = 'reviewed'`, so the first batch's output still resolves when someone asks why a charge went where it did.
- **The processor's mapping file lands in `payment_method_external_ids`** with the old processor as its source, so a card token can be traced from the new payment method back through the old processor's ID to the legacy account.

Deduplication happens before the load, with rules the business agrees to, not inside it. FieldRoutes budgets weeks 3 to 8 of its timeline for import and cleanup, with duplicates removed and records verified before go-live. Merge candidates (same standardized address and unit, same name or phone) go to a review queue with thresholds, as in [Review Bands](/docs/architecture/record-linkage#review-bands). Two field rules: never auto-merge two accounts that both have active agreements or cards on file, and a landlord or property manager with fifty properties is one account with fifty properties, not fifty duplicate customers. Merged records keep every source ID in the crosswalk so history from both lands on the survivor.

## Big Bang, Phased or Parallel

The engineering literature on replacing systems favors gradual displacement. Martin Fowler's Strangler Fig describes building the new system alongside the old and moving behavior over piece by piece, using **transitional architecture**, "code that will go away once the modernization is complete." Cartwright, Horn and Lewis name the cutover options: **Stop the World cutover**, "suspend normal business activities while cutting over"; **Canary Release** to a subset of users; **Event Interception**, routing some updates to the new component; and parallel run as one of several successful strategies.

For a field service business, those become three practical choices:

- **Big bang.** Everything moves over one weekend, which is a Stop the World cutover. Simple to explain and the only option when the old vendor's contract ends on a date. The risk is that every error surfaces at once, on Monday, on every route.
- **Phased by cohort.** One branch, one route group or one billing day at a time, which is a Canary Release with the cohort as the subset. Errors found in the first cohort are fixed before the second. The cost is that both systems are live for weeks and the office works in two of them.
- **Parallel run.** Both systems process the same work and the results are compared. FieldRoutes advises against running paper and digital side by side because it confuses technicians, while migration services sell running alongside the old system as a safety net. Both are right about different things: parallel *comparison* of billing and schedules in the back office is cheap and catches mapping errors, while parallel *operation* in the field, technicians entering work twice, is expensive and error-prone.

My rule: phase by cohort, compare the new system's schedules and invoices for each cohort against the old system's for one cycle before it goes live, and never let both systems bill or message the same customer. The alternative, a big bang with a long rehearsal, is right for a small single-branch business, where a cohort is the whole company anyway. Pick the season too: a lawn or pest company switches in winter, an HVAC company avoids the first heat wave, and a pool company avoids opening season.

![Cutover for one cohort in four phases named after the legacy displacement patterns: transitional load, dark launch, canary cutover and retire, with a loop back to the load when reconciliation finds a break and a rollback window from the canary cutover; the legacy system stays authoritative for the cohort until the cutover and remains a read-only archive afterwards.](/diagrams/fo-switching-platforms-cutover.svg "Each cohort moves through the same phases. The legacy system keeps billing the cohort until the canary cutover, and stays readable as an archive after it is retired.")

Each cohort moves through four phases, each with an owner:

1. **Transitional load.** A full export from the legacy system is archived unchanged with a checksum, then imported with crosswalk entries and agreements with their next dates intact. The crosswalk, the suppression switch and the comparison reports are **transitional architecture** in Fowler's sense: built to be removed. **Every outbound side effect is suppressed**: no welcome texts, reminders, receipts or charges, because a bulk load looks like a burst of real events to the notification service ([Customer Communications](/docs/industries/field-operations/customer-communications)).
2. **Dark launch.** The pattern's definition is to "call a new back end feature without using results"; here the new system computes the cohort's next schedule and invoices, and nothing is sent or charged. The checks below compare its output with the legacy system's. A break loops back to the mapping and the load.
3. **Canary cutover.** The legacy system stops scheduling, billing and charging this cohort, and its recurring billing is cancelled or paused; a final delta export catches anything that changed since the load. The new system schedules, bills and messages the cohort, while the remaining cohorts stay on the legacy system. A rollback window (a defined number of days) keeps the legacy records untouched so the cohort can be reverted.
4. **Retire.** Once the rollback window closes for the last cohort, the legacy system is strangled in the Strangler Fig sense: nothing runs there any more, and what remains is a read-only archive kept for the retention period.

## Reconciliation

A migration is correct when the business can prove it, cohort by cohort, before go-live. The checks:

- **Counts by type and status.** Active accounts, properties, active agreements by plan, equipment records, open invoices, payment profiles: legacy export vs new system, with every difference explained.
- **Sums.** Total open AR, AR by aging bucket, prepaid balances, deferred revenue on prepaid agreements, and monthly recurring value by plan. Money must match to the cent ([Money](/docs/payments/money)).
- **Next dates.** For every agreement, next service date and next bill date in both systems. A shift of one day across thousands of agreements is a time zone or end-of-month bug, not noise ([Time](/docs/fundamentals/time)).
- **Payment profiles.** Every customer on autopay in the legacy system has a default payment method in the new one; the mapping file's last four digits and expiry match the legacy record.
- **Shadow cycle.** The new system's generated schedule and invoices for the next cycle, compared line by line with the legacy system's.
- **Samples.** A human reads twenty full accounts end to end, chosen to include the oddest plans, multi-property customers, commercial contracts and accounts in collections.
- **After go-live.** Approval rates on the first recurring run, declines by code, refunds for double charges, and inbound "why was I charged" calls are the post-cutover signals; Stripe names `do_not_honor` and `generic_decline` as the codes a new merchant ID tends to raise.

## Who Does the Conversion

Vendors split into self-serve importers, vendor-run conversions and paid migration services. The public docs show the range:

| Vendor | Who does the work | What their docs say moves | Stated cost or time |
| --- | --- | --- | --- |
| ServiceTitan | Customer fills XLSX templates; Implementation Manager loads them | Customers, Equipment, Jobs, Estimates, plus an AR template "if you need to import incoming payment transactions" | Not published |
| FieldRoutes | Implementation Specialist with the customer's project managers | "Historical data is transferred, duplicates removed, and records verified before go-live" | 2 to 3 months: training weeks 1 to 2, import and cleanup weeks 3 to 8, go-live weeks 9 to 12 |
| Housecall Pro | Self-serve Import Wizard; Data Import team on the MAX plan | Customers, jobs, price book; job rows carry payment amount, method type and date | "Basic transfer option is free" |
| Jobber | Admin self-import | Clients and properties from delimited files | Sync QuickBooks first |
| GorillaDesk | Staff import free for paid subscribers, or self-import | Customers, contacts, addresses, a starting balance | "Can not import past service and payment history" |
| JobNimbus | Paid migration service | Contacts, jobs, appointments, emails, notes, documents, photos, products, services, invoices, payments | Paid, priced separately |
| Successware | Vendor conversion for a fee | "Most data from third-party systems"; major third-party price books | About 30 days for migration, 4 to 6 weeks for implementation; financial data needs some manual setup |
| Skimmer | Vendor migration team | "Service history, customer info, and route data" | "Within days, not weeks" |
| ZenMaid | Vendor, free from Launch27 | Customer data; automations recreated; schedule set up | Not published |

Read the table for what it implies. The enterprise and vertical vendors (ServiceTitan, FieldRoutes) run conversion as an implementation project measured in months, and FieldRoutes gives the largest block of its timeline to import and cleanup. SMB tools (Jobber, GorillaDesk, Commusoft) give the customer a template and validation rules. Trade specialists in pool (Skimmer) and cleaning (ZenMaid) compete on doing it for you quickly, which works because their data is simpler: a route of recurring stops with a few readings, not an install base with warranties.

## Communicating With Customers and Staff

Customers notice three things: a new name on their card statement, new message senders and portal logins, and anything that bills differently. Stripe notes that clear statement descriptors "can reduce chargebacks and disputes," so keep the descriptor the customer already recognizes, and if it must change, tell customers before the first charge under the new one. Send one deliberate notice per cohort, before go-live, covering what changes (portal link, payment page, sender numbers) and what doesn't (price, schedule, technician). If terms do change, that is a change to a recurring agreement, not a software notice, and the consent rules in [Consumer Protection](/docs/industries/field-operations/consumer-protection) apply. Commercial customers with purchase orders, portals or invoice-submission systems need the new remit-to details and invoice format confirmed before the first invoice, or it sits unpaid in their accounts payable queue.

Staff need the change earlier. FieldRoutes' approach trains power users first, who become internal experts after go-live; for smaller teams everyone takes the curriculum. Technicians need the new app, its offline behavior, and to know which of their routes have moved during a phased cutover.

## Auditing the Migration

A migration rewrites every record in the business at once, which makes it the event most likely to be questioned later: a customer disputing a charge that started the month of the switch, a regulator asking for a pesticide record from before it, an employee whose commission dropped, an acquirer's diligence on retention. The general audit record is in [Audit Trails](/docs/architecture/audit-trails), and field records in [Audit Trails & Records](/docs/industries/field-operations/audit-trails-and-records). What a migration adds:

- **Keep the original exports.** Every legacy and processor export, unchanged, with checksums, encrypted at rest (card data never lands here; it went processor to processor), retained for the longest retention period of anything in it, which for pesticide records can be years.
- **A run log per batch.** Who ran it, when, from what code and mapping version, with what input checksum, and what it created, updated, rejected and why, with a failure file per rejected row, as Commusoft's import returns.
- **Recorded approvals.** Who approved each cohort's reconciliation and go-live, with the reconciliation report attached. Stripe requires explicit approval before it imports; do the same internally.
- **Export the old audit trail before you leave.** Activity logs rarely migrate, and some can't be exported: ServiceM8's account activity log keeps 90 days and "cannot be exported." Pull every change log the legacy system offers (FieldRoutes exposes a Change Log Report and an API Changelogs resource) while you still have access.

## Lock-In and Data Portability

Switching cost is set by what the old system lets you take. Three layers decide it:

- **Self-serve exports.** FieldRoutes' Customer Report exports selected fields such as contact details and account balance to CSV in batches. Exports built for spreadsheets rarely carry history, agreements, equipment or regulated records.
- **APIs and connectors.** FieldRoutes publishes an API reference covering customers, subscriptions, appointments, tickets, payments, chemical uses and changelogs, and Fivetran syncs ServiceTitan data into a warehouse. Access terms differ: PestPac's API is limited to customers or approved developers with a one-time setup fee, and Briostack's public API is tiered by request volume. An API with rate limits and paid access is portability in principle, priced in practice.
- **Payment credentials.** Card portability depends on the processor's export policy and who holds the tokens. Stripe notes the previous processor "might be contractually obligated to release your data on request"; read that clause before signing, not when leaving.

If you build the platform, make leaving straightforward, because it is the honest version of the same features customers need anyway: a full tenant export (every entity, every version, history, equipment and regulated records, in documented formats), a stable API with bulk export, a written commitment to cooperate with PAN export through your processor, and a retention policy for a departed tenant's data that covers their record-keeping obligations ([Data Retention](/docs/architecture/data-retention)). The same export powers your own onboarding tool when you import from it in reverse, and a migration-grade importer with validation, a failure file and a dry run is a sales asset ([Platform Architecture](/docs/industries/field-operations/platform-architecture)).

## What This Means for the System You Build

- **A migration-grade importer.** Templates, validation with a downloadable failure file, dry runs, idempotent re-runs and dependency order (settings, accounts, properties, equipment, agreements, history, balances).
- **A crosswalk for every migrated record.** Source, source ID as text, target, dated links (`linked_at`, `unlinked_at`) and the batch, including the processor's card mapping file.
- **Agreements imported with their history.** Original sale date, seller, paid-through date, next service and bill dates, remaining visits, and SLA terms for commercial contracts.
- **Equipment as assets.** Make, model, serial, install date and warranties attached to properties, not flattened into notes.
- **Open balances as invoices.** Original dates and lines, so aging and disputes continue across the switch.
- **Side effects suppressed during loads.** No messages, charges or receipts until a cohort is explicitly live.
- **Cohort-based cutover phases.** Transitional load, dark launch, canary cutover and retire, with a rollback window, and never two systems billing or messaging the same customer.
- **Reconciliation as a gate.** Counts, sums to the cent, next dates, payment profiles and a shadow billing cycle, approved and recorded before go-live.
- **An archive of everything that didn't migrate.** Original exports and legacy audit logs, retrievable by customer and address for the full retention period.
- **Portability out.** Full tenant export, bulk API and cooperation with processor PAN export.

## References

**Reference**

- [Martin Fowler: Strangler Fig](https://martinfowler.com/bliki/StranglerFigApplication.html), gradual replacement of a legacy system and transitional architecture
- [Cartwright, Horn and Lewis: Patterns of Legacy Displacement](https://martinfowler.com/articles/patterns-legacy-displacement/), Transitional Architecture, Dark Launching, Canary Release, Stop the World cutover, Event Interception, parallel run

**In practice**

- [Stripe: Import payment data](https://docs.stripe.com/get-started/data-migrations/pan-import), processor-to-processor PGP and SFTP transfer, validation and approval, the mapping file, what can't be imported, timelines and new-MID declines
- [Stripe: Request a payment data export](https://docs.stripe.com/get-started/data-migrations/pan-export), exports only to PCI DSS Level 1 processors with an AOC and a 4,096-bit PGP key; no history or subscriptions
- [Stripe: Migrate subscriptions using the APIs](https://docs.stripe.com/billing/subscriptions/import-subscriptions), billing cycle continuity, future start dates and avoiding double billing
- [Stripe: Statement descriptors](https://docs.stripe.com/get-started/account/statement-descriptors), clear descriptors reduce chargebacks and disputes
- [ServiceTitan: Prepare your data for import](https://help.servicetitan.com/docs/prepare-your-data-for-import-into-servicetitan.md), the Customers, Equipment, Jobs and Estimates templates and the AR template
- [FieldRoutes: Switching guide](https://www.fieldroutes.com/resources/tips-and-tools/how-to-switch-to-fieldroutes-software-migration-guide), the 2 to 3 month timeline, data cleanup and power-user training
- [FieldRoutes: Exporting customer information](https://knowledgebase.fieldroutes.com/docs/exporting-customer-information.md), batched CSV export of selected customer fields
- [FieldRoutes: API reference](https://knowledgebase.fieldroutes.com/apidocs), resources including subscriptions, payments, chemical uses and changelogs
- [Housecall Pro: Prepare to import your data](https://help.housecallpro.com/en/articles/6584603-prepare-to-import-your-data), what imports, no custom fields, free and paid options
- [Housecall Pro: Service plan scenarios](https://help.housecallpro.com/en/articles/3983500-service-plans-scenarios), importing already-paid plans with original dates
- [Jobber: Import clients](https://help.getjobber.com/es/articles/import-clients/), property creation and the QuickBooks-first rule
- [GorillaDesk: Importing your data](https://intercom.help/gorilladesk/en/articles/1143817-importing-your-data), no past service or payment history; starting balances
- [Commusoft: Import customers](https://help.commusoft.com/en/articles/216447-import-customers), import order, prerequisites, duplicate rules and the error file
- [JobNimbus: Data migration](https://info.jobnimbus.com/data-migration), the paid migration service and its scope
- [Successware: FAQs](https://www.successware.com/faqs), conversion fee, 30-day migration and price book imports
- [Skimmer: Compare](https://www.getskimmer.com/vs/competitors), migration team and what moves
- [ZenMaid: Compare Launch27](https://get.zenmaid.com/compare/launch27), free migration offer
- [ServiceM8: Account activity](https://support.servicem8.com/help-center/desktop/more-on-the-online-dashboard/how-to-view-your-account-activity.md), a 90-day activity log that can't be exported
- [Fivetran: ServiceTitan connector](https://fivetran.com/docs/connectors/applications/servicetitan), syncing platform data into a warehouse
- [WorkWave: Developer](https://developer.workwave.com/), PestPac API access terms
- [Briostack: Public API](https://www.briostack.com/public-api/), API tiers and rate limits
