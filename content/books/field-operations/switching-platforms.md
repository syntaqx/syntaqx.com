+++
title = "Switching Platforms"
description = "Moving between field service platforms: what imports and what doesn't, card token transfer, phased cutover, reconciliation, audit and data portability."
category = "Field Operations Industry"
order = 1535
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

**Service history** is the decision with the longest tail. GorillaDesk doesn't import it; ServiceTitan's Jobs template carries job number, invoice number, status, dates, subtotal and tax; specialist migration teams say they move it. Even when job rows move, the regulated detail inside them often doesn't: the product, EPA registration number, amount and target pests of each pesticide application are records some states require you to keep for years ([Regulated Materials](/books/field-operations/regulated-materials)). The rule: either migrate that detail as structured records with their original values, or keep the legacy export as a retrievable archive for the full retention period, indexed by customer and address. A summary line that says "General pest service, $89" is not a pesticide record.

**Equipment** matters most to repair and install businesses. An HVAC or water heater company's install base (make, model, serial number, install date, the manufacturer warranty registration and the labor warranty the company sold) is what lets a technician file a warranty claim, quote a replacement for a twelve-year-old unit, or run a maintenance plan per asset. ServiceTitan imports it through its own template; tools without an asset model flatten it into notes, where the serial number can't be searched or validated. Migrate equipment as assets attached to properties, with their original install dates, before the service history that references them.

**Agreements** must keep their history, not just their terms. Housecall Pro's guidance for a plan that was sold and paid before the switch is to enter the original sale date as the start date, record who sold it, mark visits already completed, and accept it with "Plan has already been paid for." That is the general pattern: an imported agreement carries its original sale date (cancellation rights, renewal dates and commissions depend on it), its seller, its paid-through date, its next service date and its remaining visits. An agreement imported "starting today" bills a prepaid customer twice and resets every renewal notice. Commercial contracts add their SLA terms and the clock state of open work orders; a work order four hours into a six-hour response window can't restart at zero on the new system.

**Open balances** move best as invoices. A starting balance is enough to collect but not to answer "what is this charge," which is the first question in a dispute; carry each open invoice with its original date, due date and lines, so aging is continuous across the switch ([Operating Metrics](/books/field-operations/operating-metrics)).

## Moving Payment Credentials

Cards on file are the part customers notice and the part software vendors can't move themselves, because the card numbers live in a processor's vault ([Stored Cards & Recurring Billing](/books/payments/stored-credentials)). They move by a processor-to-processor PAN import (an encrypted file the old processor sends straight to the new one, a mapping file back, no card security codes, exports only to a PCI-compliant recipient, weeks to months for the old processor's side), followed by a ramp while issuers learn the new merchant ID; the whole procedure, network tokens, dunning state and the exit plan are in [Switching Processors](/books/payments/switching-processors). Two things are specific to field service. Bank debits for service plans run on the authorization the customer gave the business, sometimes signed on a technician's tablet at the door, so keep that signed authorization with the agreement and migrate it as a document, not just the account number ([Bank Mandates](/books/payments/switching-processors#bank-mandates), [ACH](/books/payments/ach)). And recurring billing moves as data on the field calendar: keep each service plan's billing anchor and paid-through date, cancel the old schedule before it charges so nobody is billed twice, move cards in the same cohort and season as the routes they pay for, and run the first recurring charges on the new processor away from the month's largest membership renewal run.

## Identity and Mapping

Every migrated record keeps a permanent link to where it came from, in a crosswalk of external IDs with the batch that created it; the shape, the run log and the rules for closing a wrong link are in [Crosswalks and ID Mapping](/docs/architecture/replacing-systems#crosswalks-and-id-mapping). A field migration needs one crosswalk per entity it loads (`account_external_ids`, `property_external_ids`, `agreement_external_ids`, `asset_external_ids`, `payment_method_external_ids`), and the processor's card mapping file lands in the last one with the old processor as its source, so a token can be traced back to the legacy account.

Deduplication happens before the load, with rules the business agrees to, and it takes real time (import and cleanup is the largest block in the vendor timelines below). Merge candidates (same standardized address and unit, same name or phone) go to a review queue ([Review Bands](/docs/architecture/record-linkage#review-bands)). Two field rules: never auto-merge two accounts that both have active agreements or cards on file, and a landlord or property manager with fifty properties is one account with fifty properties, not fifty duplicate customers.

## Big Bang, Phased or Parallel

The options, the difference between parallel comparison and parallel operation, and the phases each cohort moves through (transitional load with side effects off, dark launch, cutover with a rollback window, retire) are general, in [Big Bang, Phased or Parallel](/docs/architecture/replacing-systems#big-bang-phased-or-parallel) and [Cutover and the Rollback Window](/docs/architecture/replacing-systems#cutover-and-the-rollback-window). My rule carries over unchanged: phase by cohort, compare each cohort's schedules and invoices against the old system's for one cycle before it goes live, and never let both systems bill or message the same customer. What changes in the field is what a cohort is and when it moves:

- **A cohort is a branch, a route group or a billing day.** Moving a route group keeps a technician's day in one system; moving a billing day keeps one billing run in one system. A small single-branch business is one cohort, which is when a big bang with a long rehearsal is the right call.
- **Parallel operation fails in the truck.** FieldRoutes advises against running paper and digital side by side because it confuses technicians, while migration services sell running alongside the old system as a safety net. Both are right about different things: comparing billing and schedules in the back office is cheap, and asking technicians to enter work twice is not. During a phased cutover each technician needs to know which of their routes have moved.
- **The season picks the date.** A lawn or pest company switches in winter, an HVAC company avoids the first heat wave, and a pool company avoids opening season.
- **Suppression covers field messages too:** on-my-way texts, service reminders and reminder calls, not just receipts and charges, because a bulk load looks like a burst of real events to the notification service ([Customer Communications](/books/field-operations/customer-communications)).

![Cutover for one cohort in four phases named after the legacy displacement patterns: transitional load, dark launch, canary cutover and retire, with a loop back to the load when reconciliation finds a break and a rollback window from the canary cutover; the legacy system stays authoritative for the cohort until the cutover and remains a read-only archive afterwards.](/diagrams/fo-switching-platforms-cutover.svg "Each cohort moves through the same phases. The legacy system keeps billing the cohort until the canary cutover, and stays readable as an archive after it is retired.")

Reconciliation is the gate between dark launch and cutover; the general checks (counts, sums to the cent, credentials, a shadow cycle, people reading samples) are in [Reconciliation](/docs/architecture/replacing-systems#reconciliation). The field checks on top: next service date and next bill date for every agreement in both systems, remaining visits and paid-through dates on prepaid plans, equipment counts per property, and a sample that includes multi-property customers, commercial contracts with open SLA clocks and accounts in collections. After go-live, watch the first recurring run's approval rate and declines by code; Stripe names `do_not_honor` and `generic_decline` as the codes a new merchant ID tends to raise.

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

Customers notice three things: a new name on their card statement, new message senders and portal logins, and anything that bills differently. Stripe notes that clear statement descriptors "can reduce chargebacks and disputes," so keep the descriptor the customer already recognizes, and if it must change, tell customers before the first charge under the new one. Send one deliberate notice per cohort, before go-live, covering what changes (portal link, payment page, sender numbers) and what doesn't (price, schedule, technician). If terms do change, that is a change to a recurring agreement, not a software notice, and the consent rules in [Consumer Protection](/books/field-operations/consumer-protection) apply. Commercial customers with purchase orders, portals or invoice-submission systems need the new remit-to details and invoice format confirmed before the first invoice, or it sits unpaid in their accounts payable queue.

Staff need the change earlier. FieldRoutes' approach trains power users first, who become internal experts after go-live; for smaller teams everyone takes the curriculum. Technicians need the new app, its offline behavior, and to know which of their routes have moved during a phased cutover.

## Auditing the Migration

A migration rewrites every record in the business at once, which makes it the event most likely to be questioned later: a customer disputing a charge that started the month of the switch, a regulator asking for a pesticide record from before it, an employee whose commission dropped, an acquirer's diligence on retention. The general audit record is in [Audit Trails](/docs/architecture/audit-trails), and field records in [Audit Trails & Records](/books/field-operations/audit-trails-and-records). What a migration adds:

- **Keep the original exports.** Every legacy and processor export, unchanged, with checksums, encrypted at rest (card data never lands here; it went processor to processor), retained for the longest retention period of anything in it, which for pesticide records can be years.
- **A run log per batch.** Who ran it, when, from what code and mapping version, with what input checksum, and what it created, updated, rejected and why, with a failure file per rejected row, as Commusoft's import returns.
- **Recorded approvals.** Who approved each cohort's reconciliation and go-live, with the reconciliation report attached. Stripe requires explicit approval before it imports; do the same internally.
- **Export the old audit trail before you leave.** Activity logs rarely migrate, and some can't be exported: ServiceM8's account activity log keeps 90 days and "cannot be exported." Pull every change log the legacy system offers (FieldRoutes exposes a Change Log Report and an API Changelogs resource) while you still have access.

## Lock-In and Data Portability

What decides switching cost in general (self-serve exports, APIs, credentials) is in [Vendor Exports and Lock-In](/docs/architecture/replacing-systems#vendor-exports-and-lock-in). The field vendors' reality:

- **Self-serve exports are spreadsheets.** FieldRoutes' Customer Report exports selected fields such as contact details and account balance to CSV in batches; exports like it rarely carry history, agreements, equipment or regulated records.
- **APIs exist, on terms.** FieldRoutes publishes an API reference covering customers, subscriptions, appointments, tickets, payments, chemical uses and changelogs, and Fivetran syncs ServiceTitan data into a warehouse. PestPac's API is limited to customers or approved developers with a one-time setup fee, and Briostack's public API is tiered by request volume. An API with rate limits and paid access is portability in principle, priced in practice.

If you build the platform, the exit you owe tenants is in [Plan the Exit Before You Enter](/docs/architecture/replacing-systems#plan-the-exit-before-you-enter); the field addition is that the tenant export includes equipment and regulated records (pesticide applications, inspection reports) with their original values, because the tenant's record-keeping obligations outlast its subscription ([Platform Architecture](/books/field-operations/platform-architecture)).

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
