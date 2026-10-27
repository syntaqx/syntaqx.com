+++
title = "Payments Architecture at Scale"
nav_title = "Architecture at Scale"
description = "Running payments at millions a day: service boundaries, idempotency end to end, outbox and sagas, hot ledger accounts, multi-region, peaks and safe change."
category = "Payments Industry"
order = 1437
part = "Running a Provider"
tags = ["payments", "architecture", "scalability", "ledger", "reliability", "idempotency"]
+++

Every earlier chapter describes one piece of a payment provider and how to get it right. This one is about running all of them at once, at millions of transactions a day, without losing a cent or the ability to prove it. The hard part isn't throughput. Card volume is modest by internet standards: Visa's fiscal 2025 filing counts 329 billion payments and cash transactions with Visa's brand, an average of 901 million a day, or about 10,400 a second worldwide, against network capacity Visa has described as more than 65,000 transaction messages a second. A provider sees a fraction of that. What makes payments hard at scale is that every one of those transactions crosses several systems that can each fail halfway, that a few accounts are touched by every single one, that load arrives in spikes set by calendars rather than by users, and that someone (a sponsor bank, an auditor, a merchant) will eventually ask you to prove each one.

This chapter covers the services and where their boundaries go, which parts must answer synchronously and which must not, idempotency from the API to the bank file, publishing events and running multi-step money movement without distributed transactions, the ledger under load, multiple regions, peaks and capacity, the continuous checks that catch what everything else misses, and how to change the system without breaking money. The mechanics of each piece stay in its own chapter; this one is how they fit together.

## The Services and Their Boundaries

A provider's platform settles into roughly nine services, whatever they're called. Start them as modules in one deployable and split them when a team or a scaling need demands it ([Start With a Modular Monolith](/docs/architecture/service-boundaries#start-with-a-modular-monolith)); the boundaries matter more than the process count, because each boundary is a place where a call can fail with an unknown outcome.

| Service | Owns | Answers | Chapter |
| --- | --- | --- | --- |
| **API edge** | Authentication, rate limits, idempotency records, request logs | Synchronously | [Designing the Payments API](/books/payments/payments-api) |
| **Authorization** | Payments, attempts, routing, the call to the processor | Synchronously, inside the networks' timeouts | [Inside a Processor](/books/payments/inside-a-processor#one-authorization-end-to-end) |
| **Risk** | Scores, rules, decisions and their versions | Synchronously, with a fallback policy when it's down | [Fraud & Risk](/books/payments/fraud-and-risk) |
| **Vault** | Card numbers, tokens, detokenization and forwarding | Synchronously, inside its own PCI scope | [Running a Card Vault](/books/payments/card-vault) |
| **Ledger** | Accounts, transactions, entries, balances | Asynchronously, except the balance check before a payout | [Ledger & Reconciliation](/books/payments/ledger-and-reconciliation) |
| **Clearing and settlement** | Captures to presentments, settlement files, fee true-ups | Batch, on the processors' and networks' schedules | [Payouts & Settlement](/books/payments/payouts-and-settlement) |
| **Payouts** | Payout schedules, bank files, returns | Batch, on the banks' cutoffs | [Treasury & Bank Operations](/books/payments/treasury) |
| **Webhooks** | Event delivery to merchants and platforms, retries | Asynchronously, at least once | [Designing the Payments API](/books/payments/payments-api#events) |
| **Reporting** | Statements, reports, analytics | Asynchronously, from a copy of the data | [Operating the Platform](/books/payments/operating-the-platform#statements-and-reports) |

![A payment provider's services. Across the top, the synchronous path, accented: checkout (outside the provider, the merchant's customer) calls the API edge (keys, limits, idempotency), then risk (score, rules), then authorize (route, write state and event), then the vault (detokenize, forward), then the processor (outside the provider, to the networks). From authorize, a plain arrow labeled "same commit" drops to the outbox and event log, relayed at least once, which fans out to five asynchronous services: ledger (append-only entries), settlement (clearing files, batches), payouts (bank files, cutoffs), webhooks (at least once, retried) and reporting (CDC to analytics). The legend says the accented line is a live answer or a clean failure, the plain line is queued and replayable, and the offset boxes are outside the provider.](/diagrams/pm-architecture-services.svg "One path has to answer while the cardholder waits; everything else hangs off an event log and can be retried, replayed or delayed without anyone at a checkout noticing.")

### What Has to Be Synchronous

Only the authorization path has someone waiting: a customer at a checkout, a terminal, a merchant's server holding a connection open. The networks set the clock ([Inside a Processor](/books/payments/inside-a-processor#one-authorization-end-to-end) has the numbers), and your own budget is what's left after the processor and issuer take theirs. So the synchronous path is as short as it can be: edge, risk, authorization, vault, processor, and one database commit that records the outcome and the event announcing it. Nothing else belongs on it.

My rule: **if a step can be retried later without changing what the customer was told, it doesn't run inside the authorization.** Posting to the ledger, sending the webhook, updating the merchant's dashboard, scoring for later review, building the settlement record: all of them read the committed outcome and run behind it. That buys two things. The authorization path's availability is the product of fewer dependencies, and every asynchronous consumer can fall behind for an hour during an incident and catch up without a single payment failing. The general rule is in [Synchronous vs Asynchronous](/docs/architecture/service-boundaries#synchronous-vs-asynchronous); in payments the line is drawn by the network's timeout.

Two exceptions prove the rule. **Balance checks before money leaves** (a payout, an instant transfer, a refund drawn from a merchant's balance) read the ledger synchronously, because spending money twice is worse than waiting ([Instant Payouts From a Prefunded Balance](/books/payments/vendor-payouts#instant-payouts-from-a-prefunded-balance)). And **the idempotency record** is written synchronously at the edge, because it's what makes every later retry safe.

## Idempotency End to End

An idempotency key at the API protects one hop. A payment crosses many, and each can fail after doing its work and before reporting it. The design is a chain of keys, each derived from the one before, so a retry at any point lands on the same record downstream ([Idempotency Beyond the API](/docs/payments/idempotency#idempotency-beyond-the-api)):

1. **API request.** The client's `Idempotency-Key`, scoped to the merchant, with the request's parameters stored beside it so a reused key with a different body is rejected rather than replayed.
2. **Payment and attempt.** The payment row is unique on merchant and key, as the [core data model](/books/payments/card-payments#the-core-data-model) has it. Each attempt at a processor carries a key derived from the payment and the attempt number, which is what lets a timeout be resolved by query rather than by a second charge ([Failover Without Double Charging](/books/payments/processor-routing#failover-without-double-charging)).
3. **Events.** Each outbox row has its own ID, and every consumer records the IDs it has processed in the same transaction as its side effect.
4. **Ledger postings.** A ledger transaction is unique on the event that caused it (`source_type`, `source_id`), so an event delivered twice posts once.
5. **Payouts and bank files.** A payout's key is derived from the merchant, the schedule and the period; a bank file is identified by its hash and the bank's file ID, and a file that might have been sent is confirmed with the bank before anything is resent ([Bank Files](/books/payments/treasury#bank-files)).
6. **Webhooks out.** Each delivery carries the event's ID so the merchant can dedupe, because you will deliver some twice.

The windows differ by provider, and the shortest one in the chain sets how long a retry stays safe. Adyen keeps keys for 7 to 14 days at the company account level; Payabli keeps a key for 2 minutes; Stripe keeps a key for at least 24 hours and replays the saved response, `500` errors included. A provider that sits on a processor with a short window has to keep its own, longer record of what it sent, so a retry after the processor has forgotten is still caught on your side.

### How the Platforms Do It

What the public documentation says about the guarantees a provider's own clients get, as of October 2026:

| Provider | Idempotency window | Scope and collisions | Webhook retries | Ordering |
| --- | --- | --- | --- | --- |
| **Adyen** | 7 to 14 days after first submission | Company account; a duplicate while the first is in flight gets `422` or `409`; keys aren't checked across regional endpoints | Several retries, then a queue retried for up to 30 days | Not guaranteed; queued webhooks can arrive in a burst |
| **Payabli** | 2 minutes | `409 Conflict` on reuse before expiry, including after a decline | 2 retries at 5-minute intervals, then manual retry | Not documented |
| **Stripe** | At least 24 hours | Parameters compared with the original; the first response saved, including `500` errors | Up to three days with exponential backoff in live mode | Not guaranteed; dedupe by event ID |

Two rows carry lessons. Adyen's note that keys aren't checked across regions is the multi-region problem in one sentence ([Multi-Region](#multi-region)): an idempotency record lives where it was written. And none of the three promises ordering, which is why every consumer in this chapter is written to accept events out of order.

## Publishing Events With the Write

The authorization commits a payment's new state; the ledger, webhooks and settlement need to hear about it. Writing to the database and then publishing to a broker is the dual-write bug: a crash between the two leaves a captured payment nobody else knows about. The fix is the [transactional outbox](/docs/architecture/events#the-transactional-outbox): insert the event into an outbox table in the same transaction as the state change, and let a relay (polling, or change data capture from the write-ahead log) publish it afterward. The event exists if and only if the state change committed. The relay can publish twice, so consumers dedupe ([Consumers Are Idempotent](/docs/architecture/events#consumers-are-idempotent)).

At scale, three details matter:

- **Order per payment, not globally.** Partition the event log by payment (or merchant) so one payment's events stay in order on one partition, and let different payments interleave. A global order is a single-threaded bottleneck, and nothing in payments needs it.
- **Consumers tolerate gaps and reorders anyway.** A `refund.succeeded` that arrives before `payment.captured` is held or used to fetch the current state, never applied blindly. The ledger is the strictest consumer: it posts from the event and its own rules, so arrival order doesn't change the result.
- **The outbox is pruned, the ledger isn't.** The outbox is a delivery queue. Rows are deleted after a retention window; proof of what happened is in the ledger and the [audit trail](/docs/architecture/audit-trails#not-logs-not-events).

## Sagas for Money That Moves in Steps

Most money movement is several steps across services and outside parties, and none of them can share a transaction: capture at the processor, split the funds between merchant and platform in the ledger, then pay out to a bank. Two-phase commit across those isn't available (the processor and the bank won't join your transaction) and wouldn't be wanted if it were. The pattern is a **saga**: a sequence of local transactions, each committed on its own, with an explicit compensating action for every step that can be undone ([microservices.io](https://microservices.io/patterns/data/saga.html); [Synchronous vs Asynchronous](/docs/architecture/service-boundaries#synchronous-vs-asynchronous)).

My default is **orchestration**: one workflow record per money movement, owned by one service, that holds the state and decides the next step, rather than choreography where each service reacts to the last one's event. With money, someone has to be able to answer "where is this payment stuck, and what happens next?" from one row.

**Capture, split, payout.** A platform payment that pays a sub-merchant and a platform fee:

| Step | Forward action | Compensation if a later step fails |
| --- | --- | --- |
| 1. Capture | Capture at the processor, keyed to the payment | Refund (or void, before settlement) at the processor |
| 2. Split | Post merchant share and platform fee to the ledger as pending | Reverse the pending entries |
| 3. Settle | Move pending to available when the settlement file confirms the capture | None needed: settlement is a fact, so later problems become new entries |
| 4. Payout | Include the available balance in the next payout | A returned payout credits the balance back ([Payout Failures](/books/payments/payouts-and-settlement#payout-failures)) |

**Refund after payout.** The harder direction: the merchant has already been paid, and a refund needs money that's no longer in its balance. The workflow reserves the amount against the merchant's balance; if the balance is short, it either debits the merchant's bank account (another step, with its own failure and return) or lets the balance go negative under the merchant's agreement ([Negative Balances](/books/payments/payouts-and-settlement#negative-balances)); only then does it send the refund to the processor. Compensation runs backward: a refund the processor rejects releases the reservation, and a debit that returns reopens the negative balance as a collections item.

Three rules make sagas safe with money:

- **Every step is idempotent and keyed from the workflow,** so the orchestrator can retry any step after a crash without doing it twice. The step's key is the workflow ID plus the step name.
- **Some steps can't be compensated, so they go last.** A payout sent over an instant rail, or a wire, can't be pulled back ([Instant Payouts From a Prefunded Balance](/books/payments/vendor-payouts#instant-payouts-from-a-prefunded-balance)). Put irreversible steps after every step that might fail, and reserve the money they need before they start.
- **Sagas aren't isolated, so reserve, don't read.** Two sagas can see the same balance between steps. A step that depends on a balance takes a reservation (a pending entry, or a hold) in the same transaction as its check, so a second saga sees the money as already spoken for. That's the "countermeasure" the saga literature means, and in a ledger it's the pending/posted split ([Double Entry at Provider Scale](/books/payments/ledger-and-reconciliation#double-entry-at-provider-scale)).

A workflow engine (any durable-execution runtime, or a state table and a job runner in Postgres) is a choice about tooling, not about the pattern. What matters is that the workflow's state, every step's attempt and outcome, and every compensation are rows you can query and an auditor can read ([How to Build It](#how-to-build-it)).

## Exactly Once Is Three Things

No network delivers a message exactly once. What a payments system needs is exactly-once **effects**: the card is charged once, the ledger posts once, the merchant is paid once. Those come from three layers, and each one catches what the one before can miss:

1. **At-least-once delivery.** Every hop retries until it gets an acknowledgment: the outbox relay, the broker, the webhook sender, the bank-file job. Nothing is dropped; some things arrive twice.
2. **Idempotency at every receiver.** The chain of keys above turns duplicates into no-ops: the payment row, the attempt key, the processed-event table, the ledger's unique source, the payout key.
3. **Reconciliation against outside truth.** The processor's settlement file, the bank's statement and your ledger are compared every day, and more often for the invariants that matter most ([Continuous Consistency Checks](#continuous-consistency-checks)). This is the layer that catches what the first two can't: the processor that captured twice despite your key, the bank that posted a file you thought was rejected, the bug that skipped a posting.

Leaving out the third layer is the most common mistake. A system with perfect idempotency and no reconciliation is correct exactly as long as every other party also is.

## The Ledger at Scale

The ledger's rules don't change with volume: balanced transactions, append-only entries, postings keyed to the events that caused them ([Double Entry at Provider Scale](/books/payments/ledger-and-reconciliation#double-entry-at-provider-scale)). What changes is where it breaks. Stripe's description of its own ledger gives a sense of the scale: an immutable log of events that sees five billion events a day, with 99.99% of dollar volume ingested and verified within four days.

### Balances: Derived, or Maintained With Care

A balance is the sum of an account's entries. Summing every entry on every read stops working when an account has millions of them, so the balance is kept one of two ways:

- **Derived:** a periodic snapshot (balance as of a point in the log) plus the entries since. Writes never touch a balance row, so they never contend on one. Reads cost a snapshot lookup and a short sum.
- **Maintained:** a balance row updated in the same transaction as each entry. Reads are free, and the row is a lock every posting to that account takes.

My default is derived balances everywhere, and a maintained, locked balance only where an overdraft check is the point: a merchant's available balance before a payout, a prefunded balance before an instant transfer. Either way, the derived sum is the truth, and a job compares maintained balances to it continuously; a mismatch is an incident, not a rounding error.

### Hot Accounts

Some accounts are touched by nearly every transaction: the platform's fee revenue, processing costs, the FBO cash account, and the clearing accounts that every capture and settlement passes through ([A Provider's Chart of Accounts](/books/payments/ledger-and-reconciliation#a-provider-s-chart-of-accounts)). On a sharded or locking ledger they become the bottleneck; TigerBeetle's documentation names the problem directly: a small number of hot accounts are often involved in a large share of transactions, so the shards responsible for them become the limit. The techniques, roughly in the order to reach for them:

- **Don't lock what doesn't need a check.** No overdraft rule applies to platform revenue, so postings to it append entries and never read or lock a balance. This alone removes most contention.
- **Sub-account sharding.** Split one logical account into N physical sub-accounts (`platform_revenue` shards 0 to 15), pick one per posting by hashing the transaction ID, and report the logical balance as the sum. Each shard takes a fraction of the writes. The chart of accounts keeps one name; the shard is a dimension.
- **Batching.** Post many transactions in one database transaction or one request. TigerBeetle's interface is built on it, with up to 8,189 transfers per request in its default configuration, so the cost of consensus and I/O is paid once per batch rather than once per transfer.
- **Deferred aggregation.** For accounts nobody checks in real time, post each payment's fee to a per-merchant or per-shard accrual, and sweep the accruals into the real revenue account periodically with one summarizing transaction that links to what it summarizes. The detail stays queryable; the hot account takes one write per sweep.

### Partitioning by Merchant and by Time

Two cuts, for two reasons:

- **By merchant, for blast radius and scale.** Merchants are the natural shard key: almost every query is scoped to one, and almost no transaction spans two except through platform accounts. Shopify's pods are the public example of the shape, a set of shops on a fully isolated set of datastores, so one pod's failure doesn't become a platform outage, with a routing layer that maps each request to its pod. For a payments ledger, a **cell** of merchants gets its own database; platform-wide accounts (revenue, FBO cash) are aggregated across cells by deferred sweeps rather than written by every cell directly.
- **By time, for retention and maintenance.** Entries are written once and read mostly while recent. Range partitions by month let old months be detached and archived without a bulk delete; PostgreSQL's documentation notes that dropping or detaching a partition is far faster than a bulk delete and avoids its vacuum overhead, and `DETACH PARTITION ... CONCURRENTLY` takes a weaker lock. The catch is uniqueness: a unique or primary key on a partitioned table must include the partition key, so "an event posts once" can't be enforced across time partitions on the partitioned table itself. Keep that constraint on an unpartitioned table (the ledger transactions, which are narrow) and partition the entries, which are the bulk.

**Archive, don't delete.** Detached partitions go to immutable storage in an open format, with their row counts and control totals recorded, and stay queryable for the retention period ([How Long to Keep What](/books/payments/operating-the-platform#how-long-to-keep-what)). Before a partition is detached, a balance snapshot as of its end is taken and checked, so balances never need the archived entries again.

### A Dedicated Ledger Database

A general-purpose database (Postgres, MySQL) runs most providers' ledgers, with the techniques above. Dedicated ledger databases exist for the case where they stop being enough. TigerBeetle is the best-documented: debits and credits as its native data model, pending and posted balances built in, batching by design, a single core and a single leader processing all events by design (so, in its own words, adding nodes increases reliability but not throughput), and a recommended six-replica cluster across three sites, with strict serializability as long as three of the six replicas survive (four, if the primary is among the failures).

| | General-purpose database | Dedicated ledger database |
| --- | --- | --- |
| **Model** | Your tables, your constraints, your bugs | Accounts and transfers, with balance rules enforced by the engine |
| **Hot accounts** | Contended row locks; you shard and batch | Batching built in; no interactive locks across the network |
| **Queries** | Anything SQL can do, joined to the rest of your data | Lookups by account and transfer; reporting happens elsewhere |
| **Operations** | Your team already runs it | A new system to run, back up, upgrade and staff on-call for |
| **Fit** | Most providers, for years | Very high posting rates, or hot accounts batching can't fix |

My default is Postgres until measurements say otherwise, with the ledger behind its own interface (post a transaction, read a balance, reserve an amount) so that moving it later is a change to one service. Adyen publicly described running its payment databases on PostgreSQL clusters of one primary and at least three replicas across data centers, at 50 terabytes in 2018, which is a fair indication of how far a general-purpose database goes in competent hands.

## Multi-Region

Two parts of the system want opposite things from a second region.

**The authorization path wants active-active.** Every minute it's down is lost sales, its state per request is small, and it can run in several regions at once, each with its own connections to processors. The hard part is the one Adyen's documentation states plainly: idempotency keys aren't checked across its regional endpoints. A retry that lands in a different region from the original sees no record of it. The defenses:

- **Route by key, not by luck.** Pin each merchant (or each idempotency key, by hash) to a home region, and send retries there. A client that fails over to another region does so only when the home region is down, not on a single timeout.
- **Make the processor the tiebreaker.** The attempt key derived from the payment goes to the processor whichever region sends it, so a duplicate that slips past your regional records still hits the processor's idempotency, inside its window.
- **Resolve unknowns before re-sending.** After a regional failover, payments whose last attempt was in flight in the failed region are `unknown` until queried at the processor; they're never re-authorized blind ([Failover Without Double Charging](/books/payments/processor-routing#failover-without-double-charging)).

**The ledger wants a single writer.** Two regions accepting postings to the same merchant's balance can each approve a payout against the same money, and merging conflicting balances afterward isn't a thing accounting allows. So the ledger has one writable primary per cell, with synchronous replicas in nearby zones and an asynchronous replica in another region. Failing over the ledger is a decision, not an automatic reflex: confirm the old primary is fenced off, accept that asynchronous replication may have lost the last seconds of postings, and replay those from the event log, which the ledger's unique source keys make safe. Postings can wait minutes while that happens; authorizations can't, which is exactly why they don't wait on the ledger.

**Batches and files fail over last.** Settlement, payout and bank-file jobs run in one region at a time with a lease, and after a failover every file is checked against what the bank or processor received before anything is resent ([When a Region Fails](/books/payments/operating-the-platform#when-a-region-fails)).

**Data residency** decides where some data can live at all. India is the strictest well-known case: the Reserve Bank of India's 2018 directive requires payment system data to be stored only in India, and data processed abroad must be deleted there and brought back within one business day or 24 hours of processing, whichever is earlier. Other regimes restrict transfers rather than storage ([GDPR](/docs/compliance/gdpr)). The architectural consequence is the same: the cell that holds a merchant's data is chosen by jurisdiction as well as by load, and anything that copies data across regions (replicas, backups, analytics, logs) is listed and justified.

## Peaks and Capacity

Payments traffic is shaped by calendars, and the peaks are predictable to the day:

- **The first and fifteenth.** Paydays, rent and bills cluster on them, and so do recurring charges: Payabli's balance-driven autopays run only on the first, the fifteenth or the last day of the month, and Stripe warns that the beginning of the month, when subscriptions renew, can bring a spike in webhook deliveries large enough to overwhelm receivers.
- **Fixed-hour batch jobs.** Recurring billing runs at set times rather than spread across the day: Payabli's autopays all execute overnight between 2:30 and 3:30 AM Eastern on their scheduled date. A billing run is a self-inflicted peak, and its shape (thousands of merchants' schedules landing in the same hour) is under your control. Spread runs across the window by merchant, and rate-limit them per processor.
- **Batch cutoffs.** Everything that must make a window arrives just before it: the Federal Reserve's same-day ACH deadlines at 10:30 AM, 2:45 PM and 4:45 PM Eastern, each provider's own capture cutoff (Payabli's default batch cutoff is 5 PM Eastern), and your bank's earlier cutoffs in front of those ([The Banking Calendar](/books/payments/treasury#the-banking-calendar)). Jobs that build files are scheduled backward from the cutoff with room to retry, not started at the last minute.
- **Holidays and events.** The retail peak is the extreme case: Shopify's merchants peaked at $5.1 million in sales per minute at 12:01 PM Eastern on Black Friday 2025, with its edge serving 489 million requests a minute. Ticket on-sales, tax deadlines and benefit payment dates are smaller versions for the merchants they hit.

**Load test with production-shaped traffic.** A test that sends one endpoint a flat rate proves little. The traffic has to look like the peak: the mix of card brands and wallets, the share of 3DS challenges, refunds and captures alongside authorizations, a recurring batch landing on top of interactive traffic, and simulated processors that respond with realistic latency, declines and timeouts ([Make the Traffic Real](/docs/quality/load-testing#make-the-traffic-real)). Shopify's preparation for 2025 is the public reference: five scale tests from April to October at forecast peak levels, with a tool that runs scripted browse, cart and checkout flows, and, separately, game days that injected faults and regional failovers that evacuated traffic from its core US and EU regions. Never test against a real processor's production endpoint, and agree any load on its sandbox with the processor first.

**Admission control and backpressure.** When load exceeds capacity, something has to be refused, and it should be the right thing. Shed by priority: authorizations first in line, then captures and refunds (which have deadlines but not seconds-long ones), then reporting, exports and webhook redelivery. Tie admission to the health of what's downstream (processor latency, database load) rather than a fixed rate ([Protecting What's Downstream](/docs/architecture/admission-control#protecting-what-s-downstream), [Priority Classes](/docs/architecture/admission-control#priority-classes)). Per-merchant limits keep one merchant's runaway retry loop or card-testing attack from consuming everyone's capacity ([Noisy Neighbors](/docs/architecture/multi-tenancy#noisy-neighbors)). Asynchronous queues are the shock absorber: they're allowed to grow during a peak, with alerts on the age of their oldest item against each item's deadline (a capture's authorization expiry, a payout's cutoff), not on their length.

**Game days and failure injection.** Rehearse the failures that will happen: a processor timing out on 20% of requests, the primary database failing over mid-batch, the event relay stopping for an hour, a region evacuated during a recurring billing run. Each game day checks two outcomes, that the system degraded as designed and that afterward every payment was accounted for, with the consistency checks below as the scorecard ([Runbooks and Game Days](/docs/operations/disaster-recovery#runbooks-and-game-days)).

## Continuous Consistency Checks

The daily close proves the books for yesterday ([Closing the Day and the Month](/books/payments/ledger-and-reconciliation#closing-the-day-and-the-month)). At scale that's too slow to be the first line of defense: a bug that double-posts fees can affect a million transactions before tomorrow's close sees it. So the invariants run continuously, every few minutes, against recent data:

- **Every transaction balances.** Entries per transaction and currency sum to zero. The database enforces it, and the check proves the enforcement wasn't bypassed.
- **Every event posted, and every posting has an event.** Each captured payment, refund and payout in the operational tables has its ledger transaction, and each ledger transaction points to a real source. This is what Stripe calls completeness: every ID in a producer's database has a matching ledger event.
- **Clearing accounts drain.** The accounts meant to return to zero (acquirer settlement clearing, payouts in transit) do so within their expected windows; Stripe's ledger measures exactly this, the fraction of the ledger appropriately zeroed out at steady state, because a missing, late or wrong transaction leaves a balance in a pipe that should be empty.
- **Sums agree by merchant.** For each merchant, captures minus refunds minus fees in the operational tables equals the movement in its ledger accounts, and the processor's reported totals agree once the file arrives. Summing by merchant localizes a break to someone a person can investigate.
- **Maintained balances equal derived balances,** for every account that keeps one.
- **Nothing is stuck.** No workflow sits in a non-terminal state past its deadline, no outbox row is unpublished past a few minutes, no attempt is `unknown` past its resolution window.

A failed invariant opens a break with an owner ([Breaks](/books/payments/ledger-and-reconciliation#breaks)), and the ones that touch cash hold the next payout run for the affected scope. My rule: **the checks run against the same data the business uses, by code that shares nothing with the code that wrote it.** A check that calls the posting library to verify the posting library proves nothing.

## Analytics Without Recomputing Money

Reporting, finance, risk models and dashboards all need the payment data, and none of them may slow down or change the system that holds it. The split is the usual one: the OLTP databases serve the product, and a change-data-capture stream copies their changes to an analytical store ([Nobody Queries the Primary](/docs/data/separating-production-and-analytics#nobody-queries-the-primary); [Change Data Capture](/docs/architecture/data-pipelines#change-data-capture)).

The payments-specific rule: **the analytics side reads money, it never recomputes it.** A merchant's balance, a fee, a payout amount is copied from the ledger as posted, with the ledger transaction ID beside it. A warehouse query that re-derives fees from pricing rules, or balances from payment rows, will disagree with the ledger the first time a rule changes or a correction posts, and then two numbers circulate for the same thing. Metrics that need money join to the ledger's figures; when an analytical number and the ledger disagree, the ledger is right and the pipeline has a bug ([Reconcile to the Source](/docs/architecture/data-pipelines#reconcile-to-the-source); [Payments Metrics](/books/payments/payments-metrics)).

## Change Management

Most outages in mature systems are changes. In payments, a bad change can also be a financial event, so change management is part of the architecture:

- **No deploys across settlement windows.** Freeze changes to settlement, payout and file-building services in the hours before each cutoff and while files are in flight, and to everything during the peaks above. The freezes are data (a calendar the deploy pipeline reads), not a message in a channel. Shopify's stance is the healthy version of this: the peak isn't a release deadline, so nothing is rushed in for it.
- **Feature flags for behavior, with money paths flagged per merchant.** A new routing rule, fee calculation or payout method goes live for a few merchants first, with a kill switch that returns to the old behavior without a deploy ([Progressive Rollout](/docs/delivery/feature-flags#progressive-rollout); [Kill Switches](/docs/delivery/feature-flags#kill-switches)). The flag's state at the time of each payment is recorded, so a bad fee can be traced to the flag that produced it.
- **Schema migrations online.** Expand, migrate, contract ([Expand and Contract](/docs/database/zero-downtime-migrations#expand-and-contract)), and never rewrite financial rows in place ([Financial Tables](/docs/database/zero-downtime-migrations#financial-tables)). Stripe's account of moving hundreds of millions of subscription objects to a new table is the canonical public example: dual writing, then moving reads (with both paths compared in production), then moving writes, then removing the old data, each phase a small change on its own. Reconciliation runs before and after, and a migration that changes any balance stops.
- **Changes to processors and banks are changes too.** A new processor endpoint, a renewed certificate, a new bank file format: each goes through the same review and staged rollout as code, and the networks expect notice of some of them ([Connecting to the Networks](/books/payments/inside-a-processor#connecting-to-the-networks)).

## How to Build It

These are deltas against [the core data model](/books/payments/card-payments#the-core-data-model) and the ledger tables in [Ledger & Reconciliation](/books/payments/ledger-and-reconciliation#how-to-build-it).

```sql
-- The outbox: written in the same transaction as the state change, relayed after commit.
CREATE TABLE outbox_events (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),  -- the event ID consumers dedupe on
  merchant_id   UUID NOT NULL REFERENCES merchants (id),
  subject_type  TEXT NOT NULL,                       -- 'payment', 'refund', 'payout', ...
  subject_id    UUID NOT NULL,                       -- also the partition key on the event log
  type          TEXT NOT NULL,                       -- 'payment.captured', ...
  payload       JSONB NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at  TIMESTAMPTZ                          -- set by the relay after the broker acknowledges
);

CREATE INDEX outbox_events_unpublished ON outbox_events (created_at) WHERE published_at IS NULL;

-- Each consumer records what it has applied, in the same transaction as the effect.
CREATE TABLE processed_events (
  consumer      TEXT NOT NULL,                       -- 'ledger', 'webhooks', 'settlement'
  event_id      UUID NOT NULL,
  processed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (consumer, event_id)
);

-- Sagas: one workflow per money movement, one row per step attempt.
CREATE TABLE workflows (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  type             TEXT NOT NULL CHECK (type IN ('capture_split_payout', 'refund_after_payout')),
  merchant_id      UUID NOT NULL REFERENCES merchants (id),
  subject_id       UUID NOT NULL,                    -- the payment or refund it moves money for
  idempotency_key  TEXT NOT NULL UNIQUE,
  state            TEXT NOT NULL CHECK (state IN ('running', 'waiting', 'compensating',
                     'succeeded', 'compensated', 'failed_needs_review')),
  current_step     TEXT NOT NULL,
  deadline_at      TIMESTAMPTZ,                      -- capture expiry, payout cutoff
  next_run_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lease_owner      TEXT,                             -- the worker running it now
  lease_expires_at TIMESTAMPTZ,
  version          INTEGER NOT NULL DEFAULT 0,       -- optimistic concurrency on every transition
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at      TIMESTAMPTZ
);

CREATE INDEX workflows_runnable ON workflows (next_run_at)
  WHERE state IN ('running', 'waiting', 'compensating');

CREATE TABLE workflow_steps (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  workflow_id      UUID NOT NULL REFERENCES workflows (id),
  step             TEXT NOT NULL,                    -- 'capture', 'split', 'payout', 'reserve', 'refund'
  direction        TEXT NOT NULL CHECK (direction IN ('forward', 'compensate')),
  attempt          SMALLINT NOT NULL,
  request_key      TEXT NOT NULL UNIQUE,             -- workflow ID, step, direction: sent downstream
  status           TEXT NOT NULL CHECK (status IN ('started', 'succeeded', 'failed', 'unknown')),
  external_reference TEXT,                           -- processor reference, ledger transaction, payout
  error            TEXT,
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at      TIMESTAMPTZ,
  UNIQUE (workflow_id, step, direction, attempt)
);

-- Hot accounts split into shards; the shard is one more dimension.
ALTER TABLE ledger_accounts
  ADD COLUMN shard SMALLINT NOT NULL DEFAULT 0 CHECK (shard >= 0),
  DROP CONSTRAINT ledger_accounts_dims_key,
  ADD CONSTRAINT ledger_accounts_dims_key
    UNIQUE NULLS NOT DISTINCT (name, merchant_id, bank_account_id, processor, currency, shard);

-- Balances derived from snapshots plus later entries; a snapshot is checked before
-- the partitions it summarizes are detached.
CREATE TABLE ledger_balance_snapshots (
  ledger_account_id UUID NOT NULL REFERENCES ledger_accounts (id),
  as_of             TIMESTAMPTZ NOT NULL,            -- covers entries created before this instant
  posted            BIGINT NOT NULL,
  pending           BIGINT NOT NULL,
  entry_count       BIGINT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (ledger_account_id, as_of)
);

-- Replaces the core ledger_entries: partitioned by month. The primary key must include
-- the partition key, so "an event posts once" stays on the unpartitioned ledger_transactions,
-- and references to an entry (match_members) carry (ledger_entry_id, created_at).
CREATE TABLE ledger_entries (
  id                    UUID NOT NULL DEFAULT uuidv7(),
  ledger_transaction_id UUID NOT NULL REFERENCES ledger_transactions (id),
  ledger_account_id     UUID NOT NULL REFERENCES ledger_accounts (id),
  amount                BIGINT NOT NULL,             -- signed; per transaction and currency sums to zero
  currency              CHAR(3) NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE ledger_entries_2026_10 PARTITION OF ledger_entries
  FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');

CREATE INDEX ledger_entries_account ON ledger_entries (ledger_account_id, created_at);

-- Which cell (database) holds each merchant; moves are recorded, never overwritten.
CREATE TABLE merchant_cells (
  merchant_id   UUID NOT NULL REFERENCES merchants (id),
  cell          TEXT NOT NULL,                       -- 'us-1', 'us-2', 'in-1'
  jurisdiction  CHAR(2) NOT NULL,                    -- residency decides the candidates
  valid_from    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_to      TIMESTAMPTZ,
  PRIMARY KEY (merchant_id, valid_from)
);

-- Continuous invariants and their results.
CREATE TABLE invariant_checks (
  name          TEXT PRIMARY KEY,                    -- 'transactions_balance', 'clearing_drains', ...
  scope         TEXT NOT NULL CHECK (scope IN ('platform', 'cell', 'merchant', 'account')),
  query_version INTEGER NOT NULL,
  schedule      INTERVAL NOT NULL,
  blocks_payouts BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE invariant_results (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  check_name    TEXT NOT NULL REFERENCES invariant_checks (name),
  query_version INTEGER NOT NULL,
  window_start  TIMESTAMPTZ NOT NULL,
  window_end    TIMESTAMPTZ NOT NULL,
  passed        BOOLEAN NOT NULL,
  violations    INTEGER NOT NULL DEFAULT 0,
  amount        BIGINT,                              -- the sum out of balance, where it applies
  break_id      UUID REFERENCES breaks (id),         -- opened when it fails
  ran_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Change freezes the deploy pipeline reads.
CREATE TABLE change_freezes (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  scope         TEXT NOT NULL,                       -- 'settlement', 'payouts', 'all'
  during        TSTZRANGE NOT NULL,
  reason        TEXT NOT NULL,                       -- 'same-day ACH 2:45 PM window', 'Black Friday'
  approved_by   TEXT NOT NULL,
  EXCLUDE USING gist (scope WITH =, during WITH &&)  -- needs btree_gist; no overlapping freezes per scope
);
```

How it runs:

1. **The authorization transaction** updates the payment and attempt and inserts the outbox row, and commits. Nothing else is on its path.
2. **The relay** reads `outbox_events_unpublished` in order, publishes to the log partitioned by `subject_id`, then sets `published_at`. Rows older than the retention window are deleted.
3. **Each consumer** inserts into `processed_events` and applies its effect in one transaction; a duplicate violates the primary key and is skipped.
4. **The orchestrator** claims runnable workflows by taking the lease with an optimistic update on `version`, runs the next step with its `request_key`, records the step's outcome, and advances or begins compensating. An `unknown` step is resolved by querying downstream with the same key before anything else happens.
5. **Postings to a sharded account** pick `shard = hash(ledger_transaction_id) % N`, where N is set per account and only grows.
6. **Monthly,** a job creates next month's partition ahead of time, snapshots balances at the boundary of the oldest live month, verifies them against the entries, then detaches and archives that month's partition.
7. **The invariant runner** executes each check on its schedule, writes a result row every time (passes included, which are the evidence), and opens a break on failure.

## Auditing

A provider at scale is asked to show that the system is controlled, not just that today's numbers add up. Sponsor banks ask during due diligence and periodic reviews ([Living With a Sponsor Bank](/books/payments/becoming-a-payment-provider#living-with-a-sponsor-bank)), and a SOC 1 or SOC 2 auditor tests the same controls over a period ([What Auditors Test](/docs/compliance/soc-2#what-auditors-test)). Keep:

- **Change records** for every production change to a money path: the ticket, the review, the approval, the deploy, the flag changes, and the freeze calendar showing no change landed inside a freeze without a documented emergency approval.
- **Migration evidence:** the reconciliation run before and after each schema or data migration on financial tables, showing no balance moved.
- **Disaster recovery tests:** the date, the scenario, the recovery time and data loss actually achieved against targets, and the post-test reconciliation proving no payment was lost or duplicated ([Restores Are What Matter](/docs/operations/disaster-recovery#restores-are-what-matter)).
- **Capacity tests:** the forecast each test targeted, the traffic shape used, the results, and the fixes made, ahead of each known peak.
- **Reconciliation and invariant results,** every run, passes included, with breaks and their resolutions; a gap in the history is itself a finding.
- **Workflow histories:** every saga's steps, attempts, compensations and the people who resolved any that needed review, so a single payment's path through the system can be shown end to end.
- **Data location:** where each cell runs, which jurisdictions' data it holds, and every cross-region copy, for residency reviews.

## What This Means for the System You Build

- **A short synchronous path:** edge, risk, authorization, vault, processor and one commit; everything else reads the outcome afterward.
- **A chain of idempotency keys** from the API to the processor, the ledger, the payout and the bank file, with your own record outlasting the shortest window downstream.
- **The outbox for every event** that announces a state change, ordered per payment, and consumers that dedupe and tolerate reordering.
- **Sagas with an orchestrator,** explicit compensations, reservations instead of reads, and irreversible steps last.
- **Exactly-once effects** as at-least-once delivery plus idempotency plus reconciliation; the third layer is not optional.
- **A ledger built for contention:** derived balances, locks only where an overdraft check needs them, sharded and batched hot accounts, deferred aggregation, cells by merchant and partitions by month.
- **Active-active authorization and a single-writer ledger,** with retries routed home and unknowns resolved before any failover resend.
- **Capacity planned from the calendar,** load tested with production-shaped traffic, protected by priority-aware admission, and rehearsed with game days.
- **Continuous invariants** run by independent code, with results kept as evidence and failures holding payouts.
- **Change control that knows the money calendar:** freezes as data, flags per merchant, online migrations with reconciliation before and after.

## References

**Specifications**

- [Federal Reserve Financial Services: FedACH Processing Schedule](https://www.frbservices.org/resources/resource-centers/same-day-ach/fedach-processing-schedule.html), same-day ACH deposit deadlines at 10:30 a.m., 2:45 p.m. and 4:45 p.m. ET
- [Reserve Bank of India: Storage of Payment System Data, FAQ](https://rbi.org.in/scripts/FAQView.aspx?Id=130), the April 6, 2018 directive that payment data be stored only in India, and deletion abroad within one business day or 24 hours of processing
- [PostgreSQL: Table Partitioning](https://www.postgresql.org/docs/current/ddl-partitioning.html), range partitioning, detaching and dropping partitions instead of bulk deletes, and unique constraints that must include the partition key

**Reference**

- [microservices.io: Saga pattern](https://microservices.io/patterns/data/saga.html), sagas as sequences of local transactions with compensating transactions, orchestration and choreography, and the lack of isolation
- [TigerBeetle: Performance](https://docs.tigerbeetle.com/concepts/performance/), hot accounts as the bottleneck for sharded ledgers, batching, and a single core and single leader by design
- [TigerBeetle: Requests](https://docs.tigerbeetle.com/coding/requests/), up to 8,189 events per request in the default configuration, batching to amortize consensus and I/O
- [TigerBeetle: Cluster](https://docs.tigerbeetle.com/operating/cluster/), six replicas recommended across three sites, and strict serializability while a majority survives
- [Visa: Annual report on Form 10-K for fiscal 2025](https://www.sec.gov/Archives/edgar/data/1403161/000140316125000089/v-20250930.htm), 329 billion transactions and an average of 901 million a day
- [Visa: Fact sheet (VisaNet)](https://www.visa.gr/dam/VCOM/download/corporate/media/visanet-technology/aboutvisafactsheet.pdf), VisaNet described as capable of handling more than 65,000 transaction messages a second

**In practice**

- [Adyen: API idempotency](https://docs.adyen.com/development-resources/api-idempotency), keys valid 7 to 14 days at the company account level, not checked across regions, and errors for concurrent duplicates
- [Adyen: Troubleshoot webhooks](https://docs.adyen.com/development-resources/webhooks/troubleshoot), retry intervals, then a queue retried for up to 30 days
- [Adyen: Updating a 50 terabyte PostgreSQL database](https://www.adyen.com/knowledge-hub/updating-a-50-terabyte-postgresql-database), PostgreSQL clusters of one primary and at least three replicas across data centers, and queueing transactions during upgrades (2018)
- [Payabli: API overview](https://docs.payabli.com/developers/api-reference/api-overview), idempotency keys kept for 2 minutes and `409 Conflict` on reuse
- [Payabli: Autopays overview](https://docs.payabli.com/guides/pay-in-autopays-overview), autopays executed between 2:30 and 3:30 AM ET, and balance-driven autopays only on the first, fifteenth or last day of the month
- [Payabli: How money moves](https://docs.payabli.com/guides/platform-how-money-moves-overview), the default 5 PM ET batch cutoff
- [Payabli: Notifications and webhooks](https://docs.payabli.com/guides/pay-ops-notifications-webhooks-overview), two retries at 5-minute intervals, then manual retry
- [Shopify: Merchants achieve record-breaking $14.6 billion in Black Friday-Cyber Monday sales](https://sec.gov/Archives/edgar/data/1594805/000159480525000090/a2025bfcmpressrelease.htm), the $5.1 million-per-minute peak at 12:01 PM EST and 489 million edge requests a minute (2025)
- [Shopify Engineering: How we prepare Shopify for BFCM (2025)](https://shopify.engineering/bfcm-readiness-2025), five scale tests from April to October, scripted production-shaped load, game days with fault injection, regional failovers, and peak not used as a release deadline
- [Shopify Engineering: A pods architecture to allow Shopify to scale](https://shopify.engineering/a-pods-architecture-to-allow-shopify-to-scale), sets of shops on fully isolated datastores and request routing to pods
- [Stripe: Idempotent requests](https://docs.stripe.com/api/idempotent_requests), keys kept at least 24 hours, saved responses including `500` errors, and parameter comparison
- [Stripe: Webhooks](https://docs.stripe.com/webhooks), retries for up to three days with exponential backoff, no ordering guarantee, duplicates, and start-of-month spikes when subscriptions renew
- [Stripe Engineering: Designing robust and predictable APIs with idempotency](https://stripe.com/blog/idempotency), idempotency keys and retries with exponential backoff and jitter
- [Stripe Engineering: Online migrations at scale](https://stripe.com/blog/online-migrations), the four-phase dual-writing migration of hundreds of millions of subscription objects
- [Stripe Engineering: Ledger, Stripe's system for tracking and validating money movement](https://stripe.dev/blog/ledger-stripe-system-for-tracking-and-validating-money-movement), an immutable event log at five billion events a day, 99.99% of dollar volume verified within four days, clearing and completeness checks
