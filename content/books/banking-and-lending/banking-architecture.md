+++
title = "Banking Architecture: Building It Yourself"
nav_title = "Banking Architecture"
description = "One ledger for accounts and loans, event-sourced cores, idempotency across rails, cutoffs and calendars, multi-program tenancy and a reference build."
category = "Banking & Lending Industry"
order = 2470
part = "Running the Platform"
tags = ["banking", "architecture", "ledger", "events", "multi-tenancy", "idempotency"]
+++

Every earlier chapter of this volume ended with a How to Build It: the tables a deposit, a loan, a case or a filing adds to the core model, the queries that matter and the events they emit. This chapter is where those pieces become one system. A bank's platform is a dozen domains that each own a slice of the same money (the party who owns it, the product that sets its terms, the account that holds it, the posting engine that moves it, the holds that fence it, the accruals that grow it, the loan servicing that collects it, the cases that dispute it, the screening and monitoring that watch it, the reporting that tells the regulator about it), and the hard part is not any one of them. It's the seams: one posting read by statements, interest, overdraft, monitoring and the call report; an ACH file that arrives twice; a business day that ends at 8 p.m. in one system and midnight in another; and a sponsor bank's books that must agree, every night, with the books of every program running on its charter.

The chapter covers how cores are being built now, the bounded contexts and which of the volume's tables each owns, one ledger for deposits and loans, the event-sourced core and what "the journal is the event log" means in practice, idempotency at every rail boundary, cutoffs and calendars, tenancy with the institution above the program, the invariants a platform checks continuously, and a reference build. The general engineering is the playbook's ([Service Boundaries](/docs/architecture/service-boundaries), [Events & Async Messaging](/docs/architecture/events), [Idempotency](/docs/payments/idempotency), [Multi-Tenancy](/docs/architecture/multi-tenancy), [Temporal Data](/docs/database/temporal-data)); the Payments volume's [Payments Architecture at Scale](/books/payments/architecture-at-scale) is the same exercise for a payment provider and owns hot accounts, sagas and multi-region ledgers, and [Commerce Architecture](/books/commerce/commerce-architecture) does it for a store. It adds `rail_calendars`, `rail_cutoffs`, `inbound_messages`, `account_positions` and `invariant_checks` to [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model).

## How the Platforms Do It

As of October 2026, from vendor documentation, status pages and filings. Architecture claims are the vendors' own:

| Platform | Core shape | Events out | Business day | Source of the claim |
| --- | --- | --- | --- | --- |
| **Fiserv, FIS, Jack Henry incumbent cores** | Batch cores run as a service bureau or in-house, with memo posting by day and hard posting at night ([Batch Cores and Real-Time Cores](/books/banking-and-lending/core-banking-systems#batch-cores-and-real-time-cores)) | Files and extracts; real-time APIs added around the core | Nightly end of day rolls the date | 10-Ks and vendor pages, covered in [Core Banking Systems](/books/banking-and-lending/core-banking-systems#how-the-platforms-do-it) |
| **Jack Henry Platform** | Components adopted beside an existing core: "wires, ledger, exceptions, etc." as the bank is ready; Jack Henry Ledger described as "a real-time posting general ledger solution," in closed beta with one bank holding company | Data Hub delivers to BigQuery, Azure or AWS | The existing core keeps it until components replace it | Public status page; dates are the vendor's estimates |
| **Mambu** | SaaS core; configurable accounting cutoff and a published end-of-day job order ([End of Day and the Business Date](/books/banking-and-lending/posting-holds-and-balances#end-of-day-and-the-business-date)) | A Streaming API with subscriptions and cursors: events not committed are sent again, and the consumer "will need to deduplicate" | Cutoff per tenant; entries after it carry the next journal date | Developer documentation |
| **Thought Machine Vault Core** | "A single, unified ledger" for retail, SME and corporate products, with products as "programmable smart contracts" | "Event-driven data streaming" | Claims "zero scheduled downtime" | Product page |
| **10x Banking** | "Event-driven, real-time architecture, no batch processing"; "supports multi-tenant architectures," several brands "on shared infrastructure with full logical separation" | Streams "real-time position and cashflow data instead of relying on overnight batch runs" | Claims 99.99% uptime | Product page and FAQ |
| **Q2 Helix** | "Cloud-native core processing and BaaS platform" beside Q2's digital banking | Not detailed in the filing | Not detailed | Q2's 2025 10-K |

Four patterns run through the table:

- **The ledger is the product.** Every new core leads with one ledger for every product and every posting in real time; the incumbents' answer is a new real-time ledger built beside the old core. What changed is not double entry, it's that the posting and the balance check happen in the same moment instead of a day apart ([Memo Posting and Hard Posting](/books/banking-and-lending/posting-holds-and-balances#memo-posting-and-hard-posting)).
- **Products are configuration or code, not schema.** Smart contracts, product kits and product factories all keep the account record generic and put the terms in a versioned definition ([The Product Factory](/books/banking-and-lending/product-configuration#the-product-factory)).
- **Events leave at least once.** Every core that streams events tells consumers to commit what they processed and dedupe what comes again. Nobody promises single delivery.
- **The business day survives real time.** Even cores without a nightly batch keep an accounting cutoff, because interest, fees, statements, Reg CC and the GL are defined by business date.

## Bounded Contexts

A context owns its data, its vocabulary and its invariants, and others reach it only through its interface and its events ([Every Piece of Data Has One Owner](/docs/architecture/service-boundaries#every-piece-of-data-has-one-owner)). The volume's tables fall into these:

| Context | Owns (tables from this volume) | Invariant it guards | Chapters |
| --- | --- | --- | --- |
| **Parties and identity** | `parties`, `party_identities`, `identity_verifications`, `cip_determinations`, `party_relationships`, `account_security_events` | One verified person or business, with how and when it was verified | [KYC & Account Opening](/books/banking-and-lending/kyc-and-account-opening#how-to-build-it), [Account Takeover & Scams](/books/banking-and-lending/account-takeover-and-scams#how-to-build-it) |
| **Products** | `products`, `product_rate_tiers`, `product_fees`, `account_terms`, `term_changes` | An account is on exactly one product version until a recorded change moves it | [Products & Product Configuration](/books/banking-and-lending/product-configuration#how-to-build-it) |
| **Accounts** | `accounts`, `account_parties`, `time_deposits`, `account_closures` | One institution per account; roles effective-dated | [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model), [Deposit Accounts & Truth in Savings](/books/banking-and-lending/deposit-accounts#how-to-build-it) |
| **Posting and the ledger** | `journal_entries`, `journal_lines`, `transactions`, `memo_posts`, `holds`, `balance_snapshots`, `business_days`, `eod_steps`, `account_positions` | Every entry balances; available is ledger less holds; the date rolls only when end of day completes | [Posting, Holds & Balances](/books/banking-and-lending/posting-holds-and-balances#how-to-build-it), [Core Banking Systems](/books/banking-and-lending/core-banking-systems#how-to-build-it) |
| **Interest and fees** | `interest_accruals`, `interest_credits`, `fee_assessments`, `overdraft_decisions` | Accrued at full precision, rounded once; every fee names the rule that produced it | [Interest, APY & Statements](/books/banking-and-lending/interest-and-statements#how-to-build-it), [Overdraft, NSF & Fees](/books/banking-and-lending/overdraft-and-fees#how-to-build-it) |
| **Availability** | `availability_rules`, `deposit_items`, `availability_decisions` | Funds available no later than Reg CC allows, with a notice for every exception | [Funds Availability](/books/banking-and-lending/funds-availability#how-to-build-it) |
| **Origination and decisions** | `applications`, `application_conditions`, `verifications`, `credit_decisions`, `decision_policies`, `model_outputs`, `credit_report_pulls`, `decision_notices` | A decision keeps its frozen inputs, versions and reasons | [Loan Origination](/books/banking-and-lending/loan-origination#how-to-build-it), [Underwriting & Decision Engines](/books/banking-and-lending/decision-engines#how-to-build-it), [Adverse Action & Explaining Decisions](/books/banking-and-lending/adverse-action#how-to-build-it) |
| **Loans and servicing** | `loans`, `payment_schedules`, `schedule_installments`, `loan_payments`, `payment_allocations`, `collateral`, `credit_lines`, `balance_segments` | A loan's balance is the sum of its allocations | [Credit Cards as Credit](/books/banking-and-lending/credit-cards#how-to-build-it), [Personal & Installment Loans](/books/banking-and-lending/installment-loans#how-to-build-it); Loan Servicing |
| **Cases** | `cases`, `error_claims`, `case_deadlines`, `provisional_credits`, `legal_orders`, `fraud_claims` | Every clock starts at notice and its deadline is stored | [Errors & Disputes on Deposit Accounts](/books/banking-and-lending/deposit-errors-and-disputes#how-to-build-it), [Levies, Garnishments & Legal Process](/books/banking-and-lending/legal-process#how-to-build-it) |
| **Financial crime** | `screenings`, `screening_hits`, `alerts`, `aml_investigations`, `bsa_restricted.sar_filings`, `ctr_filings` | Every party and payment screened against the list version in force; SAR records walled off | [BSA/AML Programs](/books/banking-and-lending/bsa-aml#how-to-build-it), [Sanctions Screening](/books/banking-and-lending/sanctions-screening#how-to-build-it) |
| **Programs** | `programs`, `program_participants`, `program_obligations`, `owner_balance_files`, `omnibus_reconciliations` | Every program's owners sum to the omnibus balance, every night | [Banking as a Service](/books/banking-and-lending/banking-as-a-service#how-to-build-it), [Program Ledgers & the Synapse Lesson](/books/banking-and-lending/program-ledgers#how-to-build-it) |
| **Funding** | `funding_vehicles`, `loan_funding_allocations`, `loan_transfers`, `investor_reports` | Every loan has one owner at a time, effective-dated | [Funding the Book](/books/banking-and-lending/funding-the-book#how-to-build-it) |
| **Reporting** | `gl_accounts`, `gl_mappings`, `subledger_proofs`, `regulatory_filings`, `hmda_lar_records`, `report_line_values`, `filing_submissions` | The GL ties to the subledgers; every filed number walks back to rows | [Regulatory Reporting & Data](/books/banking-and-lending/regulatory-reporting#how-to-build-it) |

Three boundaries are the ones teams get wrong:

- **The ledger is not the account.** The account context knows who owns the account, on what terms and in what status; the ledger knows what moved. A status change (frozen, dormant, charged off) is an account event that the posting engine reads as a rule, never a column the posting engine writes. Mixing them is how a frozen account gets debited because the freeze lived in a table the posting path didn't read.
- **Servicing is not the ledger either.** A loan payment's allocation is a servicing decision under the contract and the law; the journal entry is its consequence. Servicing computes the allocation and asks the ledger to post it as one entry with one key, so a reversal unwinds both together.
- **The program ledger is not the bank's ledger.** A fintech program's per-owner subledger and the bank's core are two sets of books for the same money, owned by different companies, reconciled every night ([Daily Reconciliation](/books/banking-and-lending/program-ledgers#daily-reconciliation)). Building them as one database for convenience is how a platform ends up unable to say whose money is where when one side fails.

My default is the one the playbook gives: one database and one deployable, with these contexts as modules that own their tables and talk through interfaces and events, split into services only when a team or a scaling profile demands it ([Start With a Modular Monolith](/docs/architecture/service-boundaries#start-with-a-modular-monolith)). The posting engine is the one module whose transaction boundary everything else depends on: a journal entry, its transactions, the hold it releases, the position it updates and the event it emits commit together or not at all.

## One Ledger for Accounts and Loans

A deposit, a loan and a line are all `accounts`, and every money movement on any of them is a `journal_entries` row with balanced `journal_lines`, each line naming a GL account and, for subledger lines, the customer account ([The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model)). What differs between them is the sign and the buckets:

- **Direction of the debt.** A deposit is a liability: a customer's credit balance is a credit on a deposit GL account. A loan is an asset: principal outstanding is a debit on a loan GL account. The same `journal_lines.amount` convention (debit positive) serves both, and the customer-visible `transactions.direction` is from the customer's side. A credit card payment is a credit to the customer's line and reduces the bank's receivable; a deposit is a credit to the customer's account and increases what the bank owes.
- **Buckets are GL accounts, not columns.** A loan's principal, accrued interest receivable, fees receivable, escrow and unapplied funds are separate GL accounts with the loan's `account_id` on each line, so the loan's principal balance is a sum over one bucket and the allocation of a payment is one entry with lines to several buckets ([Payment Allocation](/books/banking-and-lending/banking-business#the-life-of-a-loan)). A credit card's balance segments (purchases, cash advances, promotional balances) are the same idea one level down ([Balance Segments and APRs](/books/banking-and-lending/credit-cards#balance-segments-and-aprs)).
- **Mappings are data.** Which GL accounts an entry kind hits for a product version is a `gl_mappings` row, effective-dated, so a chart-of-accounts change doesn't touch the posting code ([The General Ledger and Its Subledgers](/books/banking-and-lending/core-banking-systems#the-general-ledger-and-its-subledgers)).
- **Accruals are a separate subledger.** Interest accrues daily into `interest_accruals` at six decimal places of a minor unit; the GL gets the accrual as a summarized entry and the customer gets the posted amount on the crediting or billing date ([Accrual Is Daily](/books/banking-and-lending/interest-and-statements#accrual-is-daily)).

### Balances: derived, then held

Ledger balance is the sum of an account's lines and available balance subtracts open holds; [Payments Architecture at Scale](/books/payments/architecture-at-scale#balances-derived-or-maintained-with-care) covers the general choice between deriving and maintaining. A bank adds a reason to maintain one: an authorization, an instant payment or a P2P send must check the available balance in milliseconds, with no batch behind it to catch an overdraft. So the posting engine keeps an `account_positions` row per account, updated in the same transaction as the lines and holds that change it, with a version for optimistic concurrency, and proves it against the derived sums every night (the invariant checks, below). The position is a cache the posting engine is allowed to trust inside its own transaction; everything else (statements, interest, reporting) reads `balance_snapshots` or the lines themselves.

Two consequences follow:

- **One writer per account.** Every posting to an account goes through the posting engine, which locks or version-checks the position. A second path (a batch fee job writing lines directly, a conversion script, a servicing module posting its own entries) is the commonest way a position drifts from its lines.
- **Hot accounts are the bank's own.** Customer accounts are rarely contended; the settlement, suspense, fee income and interchange GL accounts every posting touches are. They take no balance check, so post to them without reading or locking, as [Hot Accounts](/books/payments/architecture-at-scale#hot-accounts) describes; the FBO and omnibus accounts of a large program are the exception, because the program's float check reads them.

## Event-Sourced Cores

"Event sourced" means the system of record is an append-only log of what happened and current state is derived from it. A banking ledger has always been one: the journal is the log, balances are projections, and corrections are new entries that reverse old ones rather than edits ([Append-Only Records](/docs/payments/payment-states#append-only-records)). What the newer cores add is treating every other change the same way, with the product, account, hold and limit changes also kept as events that consumers can replay. What matters for a build:

- **Commands, then facts.** "Post this ACH credit with this key" is a command to the posting engine; `transaction.posted` is the fact it emits once the entry commits. The posting engine is the only place a command becomes a fact, and it validates against the account's status, the product's rules and the position before writing ([Commands vs Events](/docs/architecture/events#commands-vs-events)).
- **The event commits with the entry.** Every module writes its event to the playbook's `outbox_events` in the same transaction as the state change, and a relay publishes it ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)). A posted payroll credit whose event was lost is a deposit the customer's notification, the fraud monitor and the program's subledger never hear about.
- **Order per account, not globally.** Partition the stream by account so one account's postings are consumed in sequence, and carry the account's position version in each event so a consumer ignores anything older than what it has applied ([Ordering](/docs/architecture/events#ordering)).
- **Consumers dedupe.** Mambu's streaming documentation is the industry's rule in one line: what you haven't committed comes again, and you "will need to deduplicate." Every consumer stores the event IDs it applied ([Consumers Are Idempotent](/docs/architecture/events#consumers-are-idempotent)).
- **Projections are rebuildable, snapshots are not.** A real-time position, a monitoring feature store or a search index can be rebuilt from the journal. A `balance_snapshots` row, an issued statement or a filed report cannot: it is what was true and said on that business date, and a later correction is a new row ([Snapshots](/docs/database/temporal-data#snapshots)).

The events the volume's chapters emit, grouped by producer:

| Producer | Events | Main consumers |
| --- | --- | --- |
| Accounts | `account.opened`, `account.status_changed`, `account_party.added`, `account.closed` | Screening, monitoring, digital banking, insurance records, reporting |
| Posting | `transaction.posted`, `transaction.reversed`, `hold.placed`, `hold.released`, `business_day.closed` | Alerts, monitoring, program subledgers, statements, the GL export |
| Interest and fees | `interest.credited`, `fee.assessed`, `fee.refunded` | Statements, tax reporting, complaints analytics |
| Origination | `application.completed`, `credit_decision.made`, `decision_notice.sent` | Fair lending data, HMDA and 1071 records, servicing boarding |
| Servicing | `loan.boarded`, `loan_payment.applied`, `installment.past_due`, `loan.charged_off` | Collections, furnishing, investor reporting, CECL |
| Cases | `case.opened`, `case.deadline_approaching`, `case.resolved` | Work queues, provisional credit, complaint reporting |

## Idempotency at Every Rail

Every boundary a bank's money crosses is crossed by retries: a mobile client's timeout on a transfer, an ACH file the operator delivers twice, a card network's clearing record resent, a Fedwire message replayed after a connectivity failure, a program's API call retried by its own queue. The rule is the playbook's ([Idempotency](/docs/payments/idempotency)): every write that crosses a boundary carries a key, and the receiver stores the key with the result. `journal_entries` already enforces `UNIQUE (institution_id, idempotency_key)`; the work is choosing keys that are stable across retries and distinct across real repeats:

| Boundary | Key | Where it's stored | Chapter |
| --- | --- | --- | --- |
| A customer's transfer or bill payment | The client's request key, reused for the posting | `journal_entries.idempotency_key` | [Idempotency Beyond the API](/docs/payments/idempotency#idempotency-beyond-the-api) |
| An inbound ACH entry | File ID modifier, batch and trace number from the received file, scoped to the operator's file | `inbound_messages`, then the entry | [Anatomy of a Nacha File](/books/payments/ach#anatomy-of-a-nacha-file) |
| A card authorization and its clearing | The network's transaction identifier; clearing matches the authorization's memo post | `memo_posts (account_id, kind, source_ref)` | [Memo Posting and Hard Posting](/books/banking-and-lending/posting-holds-and-balances#memo-posting-and-hard-posting) |
| A check deposit | The item's capture ID and, for duplicate detection across channels, the MICR line and amount | `deposit_items` | [Funds Availability](/books/banking-and-lending/funds-availability#how-to-build-it) |
| A program's owner balance file | The program and business date | `owner_balance_files` | [Program Ledgers & the Synapse Lesson](/books/banking-and-lending/program-ledgers#how-to-build-it) |
| An end-of-day step | Institution, business date, step and account | `eod_steps` | [End of Day and the Business Date](/books/banking-and-lending/posting-holds-and-balances#end-of-day-and-the-business-date) |
| A loan payment | The payment's source reference (the ACH trace, the card authorization, the lockbox item) | `loan_payments`, its transaction | Loan Servicing |
| A legal order | The serving agency's case number and the bank's receipt | `legal_orders` | [Levies, Garnishments & Legal Process](/books/banking-and-lending/legal-process#how-to-build-it) |

Two banking specifics:

- **A repeat can be real.** Two identical $50.00 transfers from the same customer a minute apart may both be intended; two identical ACH entries with the same trace number in the same file are a duplicate; two with different trace numbers are two payments even if every other field matches. The key encodes the rail's identity for the item, never a hash of its content.
- **Store the raw message before acting on it.** Every file, message and webhook from a rail or a partner is written to `inbound_messages` under its external identity with a unique constraint, acknowledged inside the sender's window, and processed from the stored row. A file reprocessed after a crash posts nothing twice, and an examiner asking "what did the operator send on June 3" gets the bytes ([Consumer Expectations](/docs/api-design/webhooks#consumer-expectations)).

## Cutoffs, Calendars and the Business Date

[End of Day and the Business Date](/books/banking-and-lending/posting-holds-and-balances#end-of-day-and-the-business-date) sets the rule: the business date is a row, not a clock, and it rolls only when end of day completes. The architecture problem is that a bank runs on several calendars at once and every one of them is law or contract:

- **The institution's business days and cutoff.** When the bank is open and when its day ends, which decide what "received on a business day" means for Reg CC availability and Reg E deadlines ([Funds Availability](/books/banking-and-lending/funds-availability#what-the-schedule-covers)).
- **Each rail's operating days and windows.** The Federal Reserve's holiday schedule governs FedACH and Fedwire; Same Day ACH settles in three windows ([Timing](/books/payments/ach#timing)); card networks clear on their own schedule; RTP and FedNow run every day. A bank's internal deadline for each window comes before the operator's, because files have to be built, balanced and sent.
- **The specific calendars of particular rules.** TRID counts every day except Sundays and the legal public holidays in 5 U.S.C. 6103(a) for some deadlines and business days for others ([Two Kinds of Business Day](/books/banking-and-lending/mortgage-disclosures#two-kinds-of-business-day)); Reg E error resolution counts business days; Reg F and the TCPA count by the consumer's local time.

**A worked example of my own, from the Federal Reserve's 2026 holiday schedule.** Independence Day falls on Saturday, July 4, 2026. The Reserve Banks are open on Friday, July 3 (only the Board of Governors closes), so FedACH and Fedwire operate that Friday. A bank that closes its branches on July 3 anyway has a Friday that is an operating day for its rails and not a business day for its customers: Regulation CC requires an electronic payment to be available "not later than the business day after the banking day on which the bank received" it, so on my reading an ACH payroll credit settling that Friday has Monday, July 6 as its first banking day and Tuesday, July 7 as its outer availability date, while a bank that treats July 3 as a banking day owes availability on Monday. Most banks release payroll credits sooner than the outer limit; the point is that the system has to know which day each rule counts from. The same bank's calendar has to say both things, and the posting engine has to know which one each rule reads. The 2027 schedule has the mirror case: July 4 is a Sunday and every Federal Reserve office closes on Monday, July 5.

The design follows from the example:

- **Calendars are data per rail and per institution,** loaded from the published schedules a year ahead, with the source recorded (`rail_calendars`, below). A holiday added by statute, as Juneteenth was in 2021, is a row inserted, not a deploy.
- **Cutoffs are data per institution, rail and window,** with the bank's internal deadline beside the operator's, in the operator's time zone, effective-dated so a change to the Same Day schedule is a new row (`rail_cutoffs`).
- **Every entry carries its business date at receipt.** Assigned once, from the calendar and cutoff in force when the item arrived, and never recomputed; a late correction gets a value date in the past and a booking date in the open period ([Effective Dates and Backdating](/books/banking-and-lending/posting-holds-and-balances#effective-dates-and-backdating)).
- **Deadlines are computed and stored.** A case's due date, a funds availability date and a filing's due date are written when the clock starts, from the calendar version in force, so a calendar correction later shows up as a difference to review rather than a silent change to history ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).

## Multi-Program Tenancy

The volume's tenancy is set in the core model: the institution is on every row that matters and the program is optional beneath it ([The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model)). That is the playbook's [Tenant Hierarchies](/docs/architecture/multi-tenancy#tenant-hierarchies) with two levels, and each kind of platform uses it differently:

- **A core vendor** serves many institutions and is the institution's system of record. Isolation is per institution: separate databases or schemas for the largest, a mandatory `institution_id` scope for the rest, and a bank's data producible alone for an examiner, a conversion or an exit ([Isolation Models](/docs/architecture/multi-tenancy#isolation-models)).
- **A BaaS platform** serves many programs across several banks. The institution is the hard boundary (one bank's examiner must never see another bank's customers); the program is the operational boundary (limits, obligations, branding, who may see what). A program moving banks is a migration across the hard boundary ([Moving Between Sponsor Banks](/books/banking-and-lending/banking-as-a-service#moving-between-sponsor-banks)).
- **A sponsor bank** running programs on its own core sees every program as a product line on its charter, with program-level limits and reporting, and its own compliance staff reading across programs.

What makes it hold:

- **Enforce both levels in the database.** Row-level security keyed on the session's institution, and on its program where the caller is a program, turns a forgotten filter into an error instead of a disclosure ([Enforce It in the Database](/docs/architecture/multi-tenancy#enforce-it-in-the-database)). The bank's own staff get a session scoped to the institution with all programs; a program's staff and API keys get one program.
- **Limits per program, enforced at posting.** Daily outflow, per-transaction caps, the program's balance and reserve requirements are rules the posting engine reads per program, so one program's fraud run or growth spurt hits its own ceiling first ([Sponsor Bank Oversight](/books/banking-and-lending/sponsor-bank-oversight#how-to-build-it) stores them as `program_limits`). Per-program queues and rate limits keep one program's month-end batch from delaying another's payroll ([Noisy Neighbors](/docs/architecture/multi-tenancy#noisy-neighbors)).
- **Obligations are tenancy too.** Which party performs CIP, monitoring, Reg E investigations or complaints for a program is a matrix of rows ([Who Owns Which Obligation](/books/banking-and-lending/banking-as-a-service#who-owns-which-obligation)), and the system routes each case and alert to the performer the matrix names for that program on that date.
- **Exits are designed in.** A program that winds down, a bank that exits a program, a regulator's order that restricts one: each is a status on `programs` that the posting engine and onboarding read, and an extract that produces every owner's balance and history from the records alone. The Synapse collapse is what happens when that extract can't be produced ([What the Records Couldn't Say](/books/banking-and-lending/program-ledgers#what-the-records-couldn-t-say)).

## Invariants, Checked Continuously

A bank's ledger is checked by end of day, by the auditors, by the program's reconciliation and by the examiner, and each finds problems later than they could have been found. The cheaper habit is to state the invariants and check them on a schedule, alerting on any difference ([Continuous Consistency Checks](/books/payments/architecture-at-scale#continuous-consistency-checks) is the payments version):

| Invariant | Check | When |
| --- | --- | --- |
| Every journal entry balances | Sum of lines per entry = 0 | On write (constraint or trigger), and a nightly sweep |
| Positions equal their lines | `account_positions.ledger_balance` = sum of the account's lines; available = ledger less open holds | Hourly sample, nightly full |
| Every transaction has an entry, every subledger line an account | Joins with no orphans | Nightly |
| The GL ties to the subledgers | `subledger_proofs.difference` = 0 or explained | Each end of day ([The General Ledger and Its Subledgers](/books/banking-and-lending/core-banking-systems#the-general-ledger-and-its-subledgers)) |
| Program owners sum to the omnibus | `omnibus_reconciliations.difference` = 0 | Each end of day ([Daily Reconciliation](/books/banking-and-lending/program-ledgers#daily-reconciliation)) |
| No hold outlives its reason | Open holds past `expires_at`; holds whose source closed | Hourly |
| No posting to a blocked account | Debits to accounts frozen, closed or under a legal order since the status changed | Hourly |
| Every inbound message processed once | `inbound_messages` received but not processed after its window; processed twice | Every window |
| Loan balances equal allocations | Principal bucket balance = sum of principal allocations | Nightly |

Each check writes a row to `invariant_checks` with its result, so "were the books right on March 14" is a query, and a difference opens work with an owner rather than a log line nobody reads ([Alert Design](/docs/observability/dashboards-and-alerts#alert-design)).

## A Reference Architecture

Built yourself, as a bank, a program on a sponsor bank, a BaaS platform or a lender, the system this volume describes is a short list of parts. Each is the owning chapters' tables behind a module interface; the infrastructure is the [Hosting & Cloud](/books/hosting-and-cloud/regions-zones-and-cells) volume's:

- **Channels.** Digital banking, the branch and call center tools, partner APIs. They read positions and write commands; none posts directly ([Digital & Mobile Banking](/books/banking-and-lending/digital-banking)).
- **A transactional core.** One relational database holding parties, products, accounts, the posting engine, holds, positions, interest and fees, cases and the outbox as modules, so a posting, its position update and its event commit together.
- **Rail gateways.** One per rail (ACH, wires, card processor, RTP or FedNow, check image exchange), each storing inbound messages under their identity, building outbound files against the cutoffs, and turning both into posting commands ([Comparing the Rails](/books/payments/comparing-the-rails)).
- **End-of-day and scheduled work.** The ordered steps of the business day, idempotent per account and step, plus date-driven jobs: interest crediting, maturities, statements, dormancy, delinquency aging ([Background Jobs](/docs/architecture/background-jobs)).
- **Decisioning.** Screening, monitoring and credit decisions as services that answer synchronously when a posting or an application waits on them, with a defined fallback when they don't ([When the Scorer Is Down](/docs/architecture/risk-scoring#when-the-scorer-is-down)).
- **Servicing and cases.** Loan servicing, collections, disputes and legal process as workflows over the core's data, posting only through the posting engine.
- **A ledger export and a warehouse.** The GL export to the accounting system and change data capture into an analytical store that reporting, CECL, monitoring models and metrics read; nobody runs a report against the posting database ([Keep Analytics Off Production](/docs/architecture/data-pipelines#keep-analytics-off-production); [Regulatory Reporting & Data](/books/banking-and-lending/regulatory-reporting) builds the filings from it).

What I buy rather than build, even when building the rest: card processing, identity verification, sanctions list data, check imaging, the rails' connectivity and, for a program, the bank's core itself. A team that builds its own ledger still connects to a bank that runs someone else's ([Build, Buy or Partner](/books/banking-and-lending/banking-landscape#build-buy-or-partner)), and the security and resilience duties that come with every vendor are [Security, Resilience & Incident Notice](/books/banking-and-lending/security-and-resilience).

## How to Build It

The playbook's `outbox_events` table carries every event above, and the volume's existing tables carry the ledger. This chapter adds the calendars, the inbound side of the rails, the real-time position and the invariant results:

```sql
CREATE TABLE rail_calendars (              -- operating days per rail, from the published schedule
  rail                TEXT NOT NULL,         -- 'fedach', 'fedwire', 'rtp', 'fednow', 'card:visa', ...
  calendar_date       DATE NOT NULL,
  is_operating_day    BOOLEAN NOT NULL,
  note                TEXT,                  -- 'Independence Day (Saturday): Reserve Banks open Friday'
  source              TEXT NOT NULL,         -- 'Federal Reserve holiday schedule 2026'
  loaded_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (rail, calendar_date)
);

CREATE TABLE rail_cutoffs (                -- the bank's deadline and the operator's, per window
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  rail                TEXT NOT NULL,
  window_name         TEXT NOT NULL,         -- 'same_day_1', 'same_day_2', 'next_day', 'wire_close'
  direction           TEXT NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  internal_cutoff     TIME NOT NULL,         -- when the bank stops accepting for this window
  operator_deadline   TIME NOT NULL,         -- the operator's published submission deadline
  settles_at          TIME,                  -- settlement time, where the rail publishes one
  time_zone           TEXT NOT NULL,         -- the operator's, e.g. 'America/New_York'
  valid_during        DATERANGE NOT NULL,    -- a schedule change is a new row
  EXCLUDE USING gist (institution_id WITH =, rail WITH =, window_name WITH =,
                      direction WITH =, valid_during WITH &&)
);

CREATE TABLE inbound_messages (            -- every file, message and webhook, stored before acting
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  program_id          UUID REFERENCES programs (id),  -- set when a program sent it
  rail                TEXT NOT NULL,         -- 'fedach', 'fedwire', 'card_clearing', 'partner_api', ...
  external_ref        TEXT NOT NULL,         -- the sender's identity for it: file ID, IMAD, event ID
  received_at         TIMESTAMPTZ NOT NULL,
  business_date       DATE NOT NULL,         -- assigned at receipt from the calendar and cutoff
  raw_ref             TEXT NOT NULL,         -- object storage key of the bytes as received
  content_hash        TEXT NOT NULL,         -- a re-sent file with a new ID but the same bytes is flagged
  item_count          INT,
  control_total       BIGINT,                -- the file's own totals, checked before posting
  status              TEXT NOT NULL CHECK (status IN ('received', 'validated', 'processing',
                        'processed', 'rejected', 'duplicate')),
  processed_at        TIMESTAMPTZ,
  UNIQUE (institution_id, rail, external_ref)
);

CREATE TABLE account_positions (           -- the real-time balance, updated with every posting
  account_id          UUID PRIMARY KEY REFERENCES accounts (id),
  ledger_balance      BIGINT NOT NULL,       -- signed, customer's side: credit balance positive
  open_holds          BIGINT NOT NULL DEFAULT 0,
  early_availability  BIGINT NOT NULL DEFAULT 0,  -- funds made available before collection
  available_balance   BIGINT GENERATED ALWAYS AS
                        (ledger_balance - open_holds + early_availability) STORED,
  last_journal_line_id UUID REFERENCES journal_lines (id),
  version             BIGINT NOT NULL DEFAULT 0,  -- optimistic concurrency; carried in events
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE invariant_checks (            -- every continuous check, with its result
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  check_key           TEXT NOT NULL,         -- 'entry_balances', 'position_equals_lines', ...
  check_version       INT NOT NULL,          -- the query, in version control
  scope               JSONB NOT NULL DEFAULT '{}',  -- {"program_id": "..."}, {"sample": 0.01}
  business_date       DATE,
  started_at          TIMESTAMPTZ NOT NULL,
  finished_at         TIMESTAMPTZ,
  rows_checked        BIGINT,
  exceptions          BIGINT NOT NULL DEFAULT 0,
  difference          BIGINT,                -- minor units, where the check is a sum
  exceptions_ref      TEXT,                  -- the exception rows, as extracted
  status              TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'error')),
  assigned_to         TEXT                   -- set when status is failed
);
```

The posting engine's write, in one transaction: lock the position by version, check the account's status and the product's rules, insert the entry and its lines under the key, update the position, release any hold the posting settles, write the event:

```sql
BEGIN;
-- 1. The key: a retry returns the original entry and stops here.
INSERT INTO journal_entries (institution_id, kind, effective_date, source_ref, idempotency_key)
VALUES (:institution_id, 'ach_credit', :business_date, :inbound_message_id, :key)
ON CONFLICT (institution_id, idempotency_key) DO NOTHING
RETURNING id;                                          -- no row: already posted, return it

-- 2. The position, guarded by status and version.
UPDATE account_positions p
SET ledger_balance = ledger_balance + :amount,
    version        = version + 1,
    updated_at     = NOW()
FROM accounts a
WHERE p.account_id = :account_id
  AND a.id = p.account_id
  AND a.status IN ('active', 'dormant')               -- frozen, closed: rejected to a case
  AND p.version = :expected_version
RETURNING p.version;                                   -- no row: retry with a fresh read, or reject

-- 3. Lines, the customer's transaction and the event, then COMMIT.
COMMIT;
```

Next business date for a rail and an institution, the query every deadline calculation starts from:

```sql
SELECT MIN(c.calendar_date) AS next_business_date
FROM rail_calendars c
JOIN business_days b
  ON b.institution_id = :institution_id AND b.business_date = c.calendar_date
WHERE c.rail = :rail
  AND c.calendar_date > :from_date
  AND c.is_operating_day;                              -- both the rail and the bank are open
```

Design notes:

- **The position never leaves the posting transaction.** Other modules read it through the posting engine's interface or its events, and nothing but the posting engine updates it. The nightly `position_equals_lines` check is the proof that rule held.
- **The file's own totals come first.** An ACH file's batch and file control totals, a card clearing file's record counts and a program's owner file's sum are checked against the items before any item posts, and a mismatch rejects the file to an exception queue rather than posting part of it.
- **Calendars are loaded, not computed.** Holiday rules have exceptions (the Saturday rule differs between the Board and the Reserve Banks), so each rail's calendar is the operator's published schedule, with its source, not a function.
- **Tenancy columns are on every new table.** `inbound_messages` and `invariant_checks` carry `institution_id` (and `program_id` where it applies) so row-level security covers them like every other table.
- **Events carry the position version.** `transaction.posted` includes the account's new version, which is what lets a consumer applying events out of order know it's behind.

## Auditing

The records in this chapter are the ones an examiner, an auditor, a sponsor bank or a court asks for when something went wrong between systems:

- **What arrived, and when.** Every inbound file and message as received, with its business date, its control totals and what it posted ([Producing Records](/docs/architecture/audit-trails#producing-records)).
- **Which calendar and cutoff applied.** The calendar rows and cutoff versions in force on each date, so a funds availability date or a case deadline can be recomputed and shown.
- **That the books balanced, every day.** Every invariant check with its result and, for each failure, who worked it and how it was resolved.
- **Who could see and move what.** The tenancy scope of every session and API key, and every change to a program's limits and status, with the approver ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **That events matched state.** The outbox and the consumers' applied-event records, so a gap between a posting and a notification, a monitoring alert or a program's subledger can be traced to where it opened.

## What This Means for the System You Build

- **Draw the contexts first** and give each table one owner; the posting engine is the only writer to the ledger and the positions.
- **Keep deposits, loans and lines in one ledger,** with buckets as GL accounts and mappings as effective-dated data.
- **Maintain a real-time position** inside the posting transaction for instant decisions, and prove it against the lines every night.
- **Treat the journal as the event log,** emit every event through the outbox in the same transaction, partition by account and dedupe in every consumer.
- **Key every rail item by the rail's own identity** and store every inbound message before acting on it.
- **Load calendars and cutoffs as data** per rail and institution, assign business dates once at receipt, and store every deadline.
- **Put the institution above the program** in every scope, enforce both in the database, and design the program exit before the launch.
- **State the invariants and check them continuously,** with results as rows and failures as owned work.
- **Buy the rails, the processing and the bank;** build the ledger, the rules and the records that prove them.

## References

**Law and regulation**

- [12 CFR 229.10 (Regulation CC)](https://www.law.cornell.edu/cfr/text/12/229.10), availability of electronic payments by the business day after the banking day of receipt
- [12 CFR 229.19 (Regulation CC)](https://www.law.cornell.edu/cfr/text/12/229.19), deposits on a day that is not a banking day treated as made on the next banking day

**Regulators and guidance**

- [Federal Reserve: Holidays observed by the Federal Reserve System](https://www.federalreserve.gov/aboutthefed/k8.htm), the 2026 and 2027 dates and the Saturday and Sunday rules

**Vendor documentation**

- [Jack Henry: State of the Platform](https://knowledge.banno.com/platform/state-of-the-platform/), components adopted beside the core, Jack Henry Ledger in closed beta, Data Hub destinations
- [Mambu: Committing cursors (Streaming API)](https://docs.mambu.com/md/api/pages/streaming/committing-cursors.txt), redelivery of uncommitted events and the duty to deduplicate
- [Thought Machine: Vault Core](https://www.thoughtmachine.net/vault-core), the single ledger, smart contracts, event-driven streaming and the downtime claim
- [10x Banking](https://www.10xbanking.com/), the event-driven no-batch architecture, real-time position streaming, multi-tenancy and the uptime claim

**Filings**

- [Q2 Holdings: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1410384/000141038426000006/qtwo-20251231.htm), Helix as a cloud-native core processing and BaaS platform
