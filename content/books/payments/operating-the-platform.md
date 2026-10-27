+++
title = "Operating the Platform"
description = "Running a payments platform day to day: the internal console, monitoring, statements, compliance, outages, card-data incidents and retention."
category = "Payments Industry"
order = 1433
part = "Running a Provider"
tags = ["payments", "operations", "monitoring", "compliance", "incident-response", "retention"]
+++

A payments platform that's been built is not yet a platform that runs. Every day someone has to answer a merchant who can't find a payout, catch a file that didn't arrive, notice an issuer quietly declining more, file the reports the law requires, and know exactly what to do if card data ever leaks. This chapter is the operating layer: the tools and routines the rest of the volume assumes someone has. The general practice is in [Observability](/docs/operations/observability), [SLOs](/docs/operations/slos), [On-Call](/docs/operations/on-call), [Incident Response](/docs/operations/incident-response) and [Disaster Recovery](/docs/operations/disaster-recovery); what follows is what payments adds.

## The Internal Console

Support, risk and finance teams need a tool that sees what the platform sees, with controls the merchant-facing product doesn't have. The general design (search by any identifier, named actions with reasons and approvals, ledger adjustments only by entries, role scoping, viewing as the merchant on the record) is in [Support Access & Internal Tools](/docs/security/support-access#the-internal-console). What payments adds:

- **The identifiers are the industry's.** A merchant quotes a payout amount, a cardholder quotes the acquirer reference number (ARN) their bank gave them, the processor quotes its reference, the bank quotes an ACH trace number. The console finds the payment, refund, payout or return from any of them, and shows its full history across systems ([Inside a Processor](/books/payments/inside-a-processor#clearing)).
- **The actions move money.** Refunds, holds and releases, payout pauses and reserve changes are recorded actions with an actor, a reason and, above a threshold, a second approver; a manual ledger adjustment is a transaction with a reason code, never an edit to a balance ([Payment States & Ledgers](/docs/payments/payment-states#append-only-records)).
- **Revealing a card number is its own permission.** Support sees masked data; only the roles [Running a Card Vault](/books/payments/card-vault#who-gets-the-number-back) allows can reveal a number, and nobody can approve their own action.

## Watching the Pipeline

Money movement fails quietly. A job that didn't run throws no errors; it just leaves payments that never left, and the first alert is a customer asking where their money is. So the monitoring watches for absence as carefully as for failure, and every alarm is tied to the deadline that makes it urgent, usually a bank cutoff.

- **Captured but not sent.** Payments still waiting to be batched as the cutoff approaches, per rail: ACH entries, check images for a deposit, card captures and refunds for the day's settlement batch.
- **A file that should exist and doesn't.** An outbound file not built or not transmitted, and an inbound one that didn't arrive. Returns, acknowledgements and settlement reports come every banking day, even empty; a missing return file doesn't mean there were no returns.
- **Received but not applied.** A file that arrived but didn't parse, or parsed but whose returns and notifications of change never reached the ledger.
- **Over the limit.** Your bank caps how much you may originate (for ACH, Nacha makes the ODFI set and monitor exposure limits), and you set a limit per merchant underneath it. Alarm while there's time to act, because the bank will hold or reject a file that breaches it.
- **Overdue.** A payment past its expected settlement date with neither a settlement nor a return. Silence isn't success: the [ACH states](/books/payments/ach) advance on the clock, so a payment the bank never received would otherwise turn available on schedule.
- **Money that should have moved.** A sweep or prefunding transfer not confirmed by the cutoff, and reconciliation breaks by count and age, since a break stops payouts.
- **Not ready for the bank.** [Check images](/books/payments/checks) missing an endorsement or a detail record before a deposit file goes out.
- **Slow or failed jobs,** and a job still running when the next one is due to start.
- **Things that expire.** TLS and network certificates, HSM and working keys, processor credentials, and the dates of network releases and account-range file loads are all quiet outages with a known date ([HSMs & Key Management](/books/payments/key-management#cryptoperiods-and-rotation), [Network Certification](/books/payments/network-certification)); alarm weeks ahead, not on the day.
- **The monitor itself.** If the alarms go quiet, is everything fine or did the monitor die? It sends a heartbeat on every run, and something outside it pages when the heartbeat stops.

Run the checks on the [banking calendar](/books/payments/treasury#the-banking-calendar), so a quiet weekend doesn't page anyone and a quiet Tuesday does. [Observability](/docs/operations/observability) covers the alerting machinery; these are the questions it should be asking.

## Watching Approval Rates and Latency

The pipeline alarms above catch money that didn't move. The other quiet failure is money that should have moved and was declined: an issuer tightens its fraud rules, a processor mislabels a field after a release, a BIN range starts failing, and approvals drop a few points without a single error. This section is what to watch and alert on; the definitions behind each number (payment success versus authorization rate, raw versus deduplicated, the decline classes) are in [Acceptance](/books/payments/payments-metrics#acceptance), and the reliability indicators in [Reliability](/books/payments/payments-metrics#reliability).

- **Approval rate, sliced.** By processor, card brand, issuer or BIN range, card type, country, merchant category and channel, compared with the same slice's own history. A drop in one slice is a signal a platform-wide average hides ([Processor Routing](/books/payments/processor-routing)).
- **Decline code mix.** A rise in one code (do not honor, invalid transaction, issuer unavailable) usually names the cause before anyone investigates.
- **Authorization latency,** measured per hop against the networks' clocks, with an [SLO](/docs/operations/slos) well inside the 15-second timeout floor Visa sets for merchants.
- **Webhook delivery:** success rate, lag and backlog per merchant endpoint, because a merchant whose endpoint is failing is a merchant who thinks payments stopped ([Webhooks](/docs/api-design/webhooks)).
- **A status page** merchants can read, fed by the same signals, so an incident is announced before the support queue announces it.

## Statements and Reports

Merchants reconcile against what you send them, so statements are part of the product:

- **A monthly statement** showing gross volume, refunds, disputes, every fee by type, payouts and the resulting balance. For interchange-plus pricing it separates interchange, network fees and markup, and shows the effective rate. Canada's Code of Conduct requires statements at least monthly with the effective rate per card type, interchange and network fees, and transaction counts and volumes ([Payments in Canada](/books/payments/canada#cards)); no federal rule sets US statement content, but merchants expect the same.
- **Reports on demand,** as asynchronous jobs that produce files, with the payout reconciliation report, every transaction behind every payout, as the one merchants use most ([Designing the Payments API](/books/payments/payments-api#sdks-the-spec-and-reports)).
- **Tax forms on schedule.** 1099-Ks for every merchant, from the same ledger ([Payments for Software Platforms](/books/payments/software-platforms#1099-k-and-taxpayer-data)).

Every number on a statement comes from ledger entries, never a separate calculation, so the statement, the reports and the payouts can't disagree.

## Compliance Operations

The obligations in [The Payments Rulebook](/books/payments/payments-rulebook) and [Becoming a Payment Provider](/books/payments/becoming-a-payment-provider) become daily work:

- **Transaction monitoring for money laundering.** Rules and models that look for laundering patterns in payments: a merchant whose volume or ticket size changes abruptly, refunds to cards that never paid, structuring around reporting thresholds, and funnel accounts, which FinCEN describes as an account in one place receiving many cash deposits, often below reporting thresholds, withdrawn somewhere else soon after.
- **Transaction laundering** monitoring runs here as casework, comparing what each merchant actually sells with what was underwritten; the pattern and the network rules behind it are in [Merchant Fraud](/books/payments/fraud-and-risk#merchant-fraud).
- **Suspicious activity reports on the clock.** A bank files within 30 days of first detecting suspicious activity, extendable by 30 more only to identify a suspect and never beyond 60; a money services business files within 30 days, at a $2,000 threshold. Reports and their supporting records are kept five years.
- **Sanctions screening that never stops,** on merchants, their owners, and payouts, against lists that change daily.
- **Case management.** Every alert becomes a case with an owner, a decision and a record of why, because an examiner will ask about the alerts you closed, not only the reports you filed.

## When Card Data Is Exposed

The incident every provider plans for and hopes never to run. The general shape is in [Incident Response](/docs/operations/incident-response); card data adds deadlines set by the networks:

- **Tell the networks fast.** Visa's What To Do If Compromised guide (version 10.0, June 2026) requires reporting to Visa within three calendar days of evidence that suggests or confirms a compromise, an incident report within three days of that notice, and the at-risk account numbers within three days as well. Mastercard's account data compromise rules are stricter: notify Mastercard within 24 hours of becoming aware of an actual or potential compromise, identify and preserve evidence within 24 hours, and provide the affected account numbers within 72 hours. Whichever brand's clock is shortest sets yours.
- **A forensic investigator, if required.** When Visa requires one, the entity contracts a PCI Forensic Investigator within five business days, the investigator's preliminary report is due within five business days of being retained, and the final report within ten business days of the investigation's end. The investigator can't be affiliated with you or have provided you services (as your assessor or advisor, for example) recently.
- **Preserve before you fix.** Don't power off or rebuild affected systems; isolate them and keep the logs and images, because the investigation depends on them.
- **The rest of the law.** Every US state, the District of Columbia and several territories have breach notification laws, with deadlines that differ by state, and merchants on your platform have their own obligations to their customers.
- **Have the plan ready.** PCI DSS requires an incident response plan that includes notifying the brands and acquirers, tested at least every 12 months, with people available around the clock (12.10.1 to 12.10.3), and a procedure for card numbers found where they shouldn't be (12.10.7).

## How Long to Keep What

A payments platform keeps records for many rules at once, and each record's retention is the longest any rule requires, then deletion:

| Record | Keep for | Why |
| --- | --- | --- |
| Card numbers | Only as long as your documented business need, verified quarterly | PCI DSS 3.2.1 ([Running a Card Vault](/books/payments/card-vault#storing-the-number)) |
| Security audit logs | At least 12 months, the latest 3 months immediately available | PCI DSS 10.5.1 |
| Anti-money-laundering records and suspicious activity reports | 5 years | Bank Secrecy Act |
| ACH authorizations | 2 years after the authorization ends | Nacha ([ACH & Bank Transfers](/books/payments/ach)) |
| Electronic fund transfer and check records | At least 2 years | Regulation E, Regulation CC |
| Information returns (1099s) | 3 years, or 4 with backup withholding | IRS |
| Tax and business records | 3 years by default, longer in specific cases | IRS |
| Dispute evidence | At least the longest dispute window that could reach the payment | Network dispute rules |
| Call recordings with payment data | Never containing a card verification code | [Phone Payments](/books/payments/phone-payments#recordings) |

Where rules collide, the longest wins and deletion is a scheduled job, not a judgment call; [Data Retention & Deletion](/docs/architecture/data-retention#retention-schedules-by-record-type) covers schedules keyed by record type, legal holds, and how deletion coexists with append-only ledgers.

## Complaints and Error Resolution

Sponsor banks and regulators expect a complaint process, and consumer law sets clocks on some of it. The general mechanics (complaints tagged as complaints, a deadline computed and stored on the ticket, your own published deadline where the law sets none) are in [Complaints With Legal Clocks](/docs/operations/customer-support#complaints-with-legal-clocks). What payments adds is which clock applies to which rail:

- **Consumer bank debits** fall under Regulation E's error resolution: 60 days after the statement to report, and an investigation within 10 business days, or 45 with provisional credit. The duty sits with the institution holding the consumer's account, usually the consumer's own bank, and that bank will want your authorization records fast ([ACH & Bank Transfers](/books/payments/ach#consumer-law-regulation-e)).
- **Card billing errors** fall under Regulation Z for credit cards, and the clock belongs to the issuer: 60 days from the statement for the cardholder to notify, acknowledgment within 30 days, and resolution within two billing cycles and never more than 90 days. That clock is why a card complaint arrives at a provider as a dispute with an evidence deadline, not as a ticket ([Disputes & Chargebacks](/books/payments/disputes-and-chargebacks)).
- **Merchant complaints** (a fee a merchant doesn't recognize, a payout they think is missing) have no regulatory clock, and get yours.

Log the complaints the sponsor bank asks about by its categories, so its periodic reviews come from a query.

## Closing the Books

The platform's own finances run on the same ledger, and the close follows [Month-End Close](/docs/payments/accounting#month-end-close): a frozen cutoff, balances that tie out, reconciliations already done, and [closed periods that stay closed](/docs/payments/accounting#closed-periods-stay-closed). The payments-specific steps (invoices tied to expected fees, late fees accrued, the custodial cash equation, merchant statements from the locked period) are in [Closing the Day and the Month](/books/payments/ledger-and-reconciliation#closing-the-day-and-the-month); what operations adds is valuing reserves and negative balances as the receivables they are. The platform's revenue is its fees, never the volume it processes ([Cash Is Not Revenue](/docs/payments/accounting#cash-is-not-revenue)).

## Offboarding a Merchant

Merchants leave or are terminated, and both are processes, not deletes. Stop new payments, keep refunds and disputes flowing, hold a reserve through the dispute tail of what was sold (120 days and more for goods delivered later), then pay out the remainder after a final reconciliation. A merchant terminated for cause may need to be reported to the networks' terminated-merchant lists ([Inside a Processor](/books/payments/inside-a-processor#setting-up-a-merchant)), a merchant whose bank account no longer works leaves a balance that eventually becomes unclaimed property ([Payouts & Settlement](/books/payments/payouts-and-settlement)), and the records stay for the retention periods above. Moving a merchant to another provider means exporting its stored cards to a PCI-compliant recipient on request, with network transaction IDs, under the procedure in [Switching Processors](/books/payments/switching-processors#moving-card-numbers) and the export terms of [The Exit Plan](/books/payments/switching-processors#the-exit-plan).

## When a Processor, Network or Bank Is Down

Most payment outages aren't yours. A processor, a card network, an issuer or a bank stops answering, and the platform has to keep as much working as it safely can and tell merchants the truth while it does.

- **Know which hop failed.** An issuer that's down is usually invisible: the network's stand-in service answers for it on the issuer's parameters, and the issuer is liable for what stand-in approves ([When the Issuer Doesn't Answer](/books/payments/inside-a-processor#when-the-issuer-doesn-t-answer)), so a rise in issuer-unavailable codes or an odd approval pattern for one BIN range is the only sign. A processor that knows its own network link is down says so with an explicit, retryable response (Braintree's "processor network unavailable, try again" code is one). A timeout says nothing, and stays an unknown outcome until a query resolves it ([Failover Without Double Charging](/books/payments/processor-routing#failover-without-double-charging)).
- **Decide degraded mode in advance.** For each dependency, write down what keeps working without it. With a second processor, new authorizations fail over; without one, checkout fails cleanly with a message the merchant's customer can act on. If the risk scorer is down, a fallback policy decides, not a default of approve-everything ([When the Scorer Is Down](/docs/architecture/risk-scoring#when-the-scorer-is-down)). Card-present terminals may approve offline, with the merchant carrying every later decline ([Offline: Approved Isn't Paid](/books/payments/card-present#offline-approved-isn-t-paid)).
- **Queue what can wait, inside its deadline.** Authorization needs a live answer; capture, refunds, payouts and webhook delivery don't. Queue them with their [idempotency keys](/docs/payments/idempotency), drain at a controlled rate when the dependency returns, and watch each authorization's capture deadline while it waits ([Five Events, Not One Payment](/books/payments/card-payments#five-events-not-one-payment)), because a capture queued past the window is a late presentment.
- **A bank outage moves dates, not money.** A bank or a central rail that misses a cutoff pushes every payout behind it to the next window. Mark the affected payouts with a new expected date rather than letting them sit "in transit", and run the overdue checks above against the new date.
- **Tell merchants per component.** A status page that separates authorization, payouts, the dashboard, the API and webhooks, so "payouts delayed" doesn't read as "payments down". Post updates on a fixed cadence while an incident is open, and afterward give each affected merchant the list of its payments that were declined, delayed or left unknown, with what happened to each.
- **Have the contingency plan before the outage.** Visa requires members to keep contingency plans for a processor that fails outright, through insolvency or otherwise, available to Visa on request. The same plan, extended to ordinary outages and rehearsed, is what turns a processor's bad day into a slow one for you.

## When a Region Fails

[Disaster Recovery](/docs/operations/disaster-recovery) covers the general practice; payments adds specifics. Authorization needs the shortest recovery time, since every minute down is sales lost; payouts and file processing can wait hours. The vault's keys and the HSMs must be recoverable in the other region without ever existing in the clear, which means key backups made under the same dual control as everything else ([HSMs & Key Management](/books/payments/key-management)). And after a failover, every bank file and every unsettled payment is checked against what the bank and processor actually received before anything is resent, because a duplicated file is a duplicated payment ([Treasury & Bank Operations](/books/payments/treasury#bank-files)).

## Auditing

Operational records are evidence in sponsor bank and regulator examinations, in PCI DSS assessments, in card-data compromise investigations and in merchants' own disputes with you. The general design is in [Audit Trails](/docs/architecture/audit-trails); for operating a payments platform, make sure the record shows:

- **Every money-moving action from the console** with its actor, reason, approver and the ledger entries it produced, never only the resulting balance ([Typed Actors](/docs/architecture/audit-trails#typed-actors)).
- **Every compliance alert to its conclusion,** including the ones closed without a report, with who decided and why; automated dispositions record the rule or model version that made them ([Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions)).
- **Every deadline and when it was met:** SAR filings, network breach notices, Regulation E investigations and complaint responses, each with the computed due date stored beside the date it was done.
- **Every incident and outage's effect on payments:** which payments were declined, queued, failed over or left unknown, how each resolved, and what merchants were told when.
- **Every deletion under the retention schedule,** with the rule that allowed it, so "we deleted it" can be shown to have been on schedule.

## What This Means for the System You Build

- **An internal console** that finds anything by any identifier, acts only with recorded reasons and approvals, and adjusts the ledger only by entries.
- **Pipeline alarms for absence,** a heartbeat on the monitor, all on the banking calendar.
- **Approval rates sliced by processor, issuer and BIN,** decline code mix, latency against the networks' clocks, and webhook health, with a public status page.
- **Monthly statements and reports from the ledger,** so nothing a merchant sees can disagree with anything else.
- **Compliance operations as casework:** monitoring, reports on deadline, screening that never stops.
- **A card-data incident plan with the networks' deadlines in it,** rehearsed yearly.
- **A degraded mode per dependency,** queued captures and payouts that respect their deadlines, and per-component status for merchants.
- **A retention schedule** that takes the longest rule for each record, and deletes on schedule.

## References

**Specifications**

- [Visa: What To Do If Compromised (PDF)](https://usa.visa.com/dam/VCOM/download/merchants/cisp-what-to-do-if-compromised.pdf), reporting within three days, forensic investigation timelines and evidence preservation (version 10.0)
- [31 CFR 1020.320](https://www.law.cornell.edu/cfr/text/31/1020.320), suspicious activity reports by banks: 30 days, at most 60
- [31 CFR 1022.320](https://www.law.cornell.edu/cfr/text/31/1022.320), suspicious activity reports by money services businesses: $2,000 and 30 days
- [31 CFR 1010.430](https://www.law.cornell.edu/cfr/text/31/1010.430), five-year retention of Bank Secrecy Act records
- [12 CFR 229.21](https://www.law.cornell.edu/cfr/text/12/229.21), Regulation CC record retention
- [Mastercard: Security Rules and Procedures, Merchant Edition, August 2026 (archived PDF)](https://web.archive.org/web/20260919122811/https://www.mastercard.com/content/dam/mccom/shared/business/support/rules-pdfs/SPME-Manual.pdf), account data compromise notification, preservation and card number deadlines (10.3.1)
- [12 CFR 1005.11](https://www.law.cornell.edu/cfr/text/12/1005.11), Regulation E error resolution timeframes
- [12 CFR 1026.13](https://www.law.cornell.edu/cfr/text/12/1026.13), Regulation Z billing error notice, acknowledgment and resolution deadlines

**Reference**

- [FinCEN: Advisory on funnel accounts (FIN-2014-A005)](https://www.fincen.gov/resources/advisories/fincen-advisory-fin-2014-a005), the funnel account pattern
- [Visa Core Rules and Visa Product and Service Rules](https://usa.visa.com/dam/VCOM/download/about-visa/visa-rules-public.pdf), anti-money-laundering programs (1.9.1), issuer liability for stand-in processing (1.4.4.3) and contingency plans for processor failure (1.9.8.3)
- [NCSL: Security breach notification laws](https://www.ncsl.org/technology-and-communication/security-breach-notification-laws), laws in every state, DC and the territories
- [FCAC: Code of Conduct for the Payment Card Industry in Canada](https://www.canada.ca/en/financial-consumer-agency/services/industry/laws-regulations/credit-debit-code-conduct.html), monthly statement contents
- [IRS: How long should I keep records?](https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records), default and extended retention periods
- [IRS: Publication 1099](https://www.irs.gov/publications/p1099), retention of information return copies
- [Nacha: Why exposure limits are so important](https://www.nacha.org/news/why-are-exposure-limits-so-important-rmag-sees-several-reasons), ODFI exposure limits and monitoring

**In practice**

- [Braintree: Declines](https://developer.paypal.com/braintree/articles/control-panel/transactions/declines), the retryable "processor network unavailable" response distinguishing a network outage from a decline
