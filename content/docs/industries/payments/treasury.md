+++
title = "Treasury & Bank Operations"
description = "The bank accounts behind a payments ledger: FBO accounts, pass-through insurance, funding, bank files, the banking calendar and reconciliation."
category = "Payments Industry"
order = 1420
part = "Paying Out"
tags = ["payments", "treasury", "banking", "reconciliation", "ledger"]
+++

A ledger says who owns what. A bank account says what exists. [Payouts & Settlement](/docs/industries/payments/payouts-and-settlement) follows a merchant's balance until it becomes a deposit; this chapter is the other side of that line: the accounts a provider actually holds, the money that moves between them every day, and the discipline that keeps the ledger and the bank telling the same story. It's the least visible part of a payments company and the one that ends it fastest. A provider that can't say whose money sits in an account, or that borrowed customers' money to cover its own gap, has a problem no amount of good API design will fix.

## The Accounts You Run

Separate accounts by whose money it is, never by convenience:

| Account | Whose money | What moves through it |
| ------- | ----------- | --------------------- |
| **FBO (custodial)** | Merchants' | Settlement in, payouts out. In your name, titled for the benefit of the people it's held for |
| **Reserve** | Merchants', held against risk | Holdbacks in; releases and covered losses out. Some sponsor banks require it as its own account |
| **Operating** | Yours | Fees you've earned, payroll, vendors, every expense |
| **Clearing** | In transit | Where some setups land funds before sweeping them on. Zero balance by design, so anything left in it is a question |
| **Collateral** | Yours, pledged | What the sponsor bank or acquirer requires you to post ([Becoming a Payment Provider](/docs/industries/payments/becoming-a-payment-provider)) |

The cardinal sin is commingling: paying an expense out of the custodial account, even for a day to bridge a payroll gap, or leaving earned fees in it indefinitely so nobody can say which dollars are yours. Money crosses between custodial and operating only as a sweep the ledger computed, recorded on both sides, so at any moment the custodial account holds exactly what you owe the people it's for.

![The accounts a payment provider runs at its sponsor bank and how money moves between them each day: acquirers settle into the FBO custodial account; payouts leave it for merchants' banks; part of it is held back in reserve; only earned fees are swept to the operating account; and the operating account prefunds the FBO when payouts lead settlement.](/diagrams/treasury-accounts.svg "Merchants' money lives in one place and leaves it only on purpose. Settlement lands in the custodial account and payouts leave from it; the reserve and your fees are carved out by the ledger, and when you pay out before settlement arrives, it's your own money that fills the gap.")

## FBO Accounts and Pass-Through Insurance

An FBO account holds many owners' money in one pool at the bank, in the provider's name. Whether those owners are protected if the bank fails depends on pass-through deposit insurance, and the FDIC only recognizes the custodial relationship if two things are true. The relationship has to be expressly disclosed in the bank's deposit account records, and the details of each owner's interest have to be ascertainable, either from the bank's records or from records the depositor (or someone it engaged) maintains "in good faith and in the regular course of business" ([12 CFR 330.5(b)](https://www.law.cornell.edu/cfr/text/12/330.5)).

That second condition is your ledger. If it can't produce, on demand, who owns how much of the pool, the insurance the account was supposed to carry may not reach anyone. And the insurance has a limit people forget: it pays only when an insured bank fails. In the FDIC's words, it "does not provide consumers and businesses with general protection against the default, insolvency, or bankruptcy of any non-bank entities", which is to say it doesn't protect anyone from you, or from the middleware between you and the bank.

Synapse showed what that looks like. When the banking-as-a-service middleware company went bankrupt in 2024, its partner banks had, as the FDIC put it, "significant difficulties in obtaining, reviewing, and reconciling Synapse's records", and consumers lost access to their money for months. The FDIC responded on October 2, 2024 with a proposed rule for custodial accounts with transactional features: banks would keep records of each beneficial owner, the balance attributable to each, and their ownership category, and reconcile against those records "no less frequently than at the close of business daily". The comment period ran to January 16, 2025. As of October 2026 the Federal Register shows the proposal and its extension, and neither a final rule nor a withdrawal.

Build as if it were final anyway. A ledger that can hand your bank a per-owner balance file every day, summing to the account balance to the cent, is what makes the insurance real, and it's what every sponsor bank will ask for after Synapse whether or not the rule ever lands.

## Funding the Day

Money arrives on the acquirer's schedule and leaves on yours, and the gap between them is a treasury problem.

- **Settlement arrives net or gross.** Net settlement deposits sales minus refunds, chargebacks and fees as one number; gross settlement deposits sales and bills fees separately, often monthly. Net is simpler to fund and harder to reconcile: one deposit has to be decomposed into thousands of ledger entries from the processor's reports before anything can match ([Interchange & Pricing](/docs/industries/payments/interchange-and-pricing) covers where the fees come from).
- **Payouts can lead settlement.** Next-day or instant payouts promise merchants money before the acquirer has sent it. The difference comes from your own funds or a credit line, and it's a loan to your merchants until settlement lands: record it as a receivable from the acquirer, moved into the custodial account explicitly, never covered by letting the account run short.
- **Float has an owner.** Money sits in the custodial account between settlement and payout. Who earns interest on it, if anyone, is a question for your bank agreement and your counsel, not an assumption to build a business model on.
- **Fees are swept, not skimmed.** Once a day, the ledger computes what you've earned and the system moves exactly that from custodial to operating. The balance in the custodial account is never a number anyone eyeballs to decide what's theirs.

## Reserves and Negative Balances Are Cash

A reserve in the ledger is a promise that the money exists. Whether it's an earmarked part of the custodial account or a separate account the sponsor bank requires, the cash has to be there on the day a [dispute](/docs/industries/payments/disputes-and-chargebacks) or a [risky merchant](/docs/industries/payments/merchant-onboarding) needs it, and its release dates are treasury events: they change what you can pay out that day.

Negative balances are the reverse. When refunds and lost disputes take a merchant below zero and you've already paid them out, the custodial account is short by that amount until you recover it. Fill the gap from operating funds, recorded as a receivable from the merchant, the moment it appears. Letting other merchants' money cover it instead is commingling by another name. Filling the gap is a cash move, not a decision about who bears the loss: the merchant still owes the money, recovered in the order [Payouts & Settlement](/docs/industries/payments/payouts-and-settlement#negative-balances) sets.

## Moving Money Safely

Every transfer out of a custodial account is irreversible enough to deserve ceremony.

- **Know the cutoffs.** The Fedwire Funds Service runs from 9:00 p.m. ET the previous day to 7:00 p.m. ET, with customer transfers cut off at 6:45 p.m. ET; your bank's own cutoffs are earlier, and they're the ones that matter. [ACH & Bank Transfers](/docs/industries/payments/ach) covers the ACH windows. Schedule sweeps, prefunding and payout runs backward from them.
- **Wires for large, final moves.** Prefunding, collateral and bank-to-bank rebalancing go by wire because a wire is final; volume goes by ACH because it's cheap. The finality cuts both ways, which is why wires get the strictest controls.
- **The system initiates, people approve.** No movement out of a custodial or operating account is typed by hand. The system creates the instruction from the ledger, and a second person approves it, with thresholds that add approvers as amounts grow. Nobody can both create and release a wire, and a change to a beneficiary's bank details is its own approved change, for the reasons [Vendor Payouts](/docs/industries/payments/vendor-payouts) gives.
- **Lock what shouldn't move.** Positive pay on any account that issues checks, and ACH debit blocks or filters on accounts nobody should be debiting, which is usually all of them.
- **Initiate idempotently.** A transfer instruction carries a key derived from what it represents, like the date and purpose of a sweep ([Idempotency](/docs/payments/idempotency)). Many bank APIs don't honor idempotency keys, so store the intent before sending, put your own end-to-end reference on the payment, and after a timeout ask the bank about that reference before sending anything again ([Retries & Timeouts](/docs/architecture/retries-and-timeouts)).
- **Plan for a second bank.** One sponsor bank is one point of failure for every payout you make. A second relationship gives you somewhere to go, at the price of splitting custodial funds and doubling reconciliation, the same trade [Processor Routing](/docs/industries/payments/processor-routing) makes for card processing.

## The Banking Calendar

Every date that moves money is a banking-day calculation: when a payout lands, when an ACH debit's two-day return window closes, when a check's funds are available, when a pre-authorized debit's notice must go out. One service should own those calculations, because a calendar duplicated in five jobs is five calendars.

- **Holidays follow rules, and the rules have exceptions.** The Federal Reserve observes a Sunday holiday on Monday, but when a holiday falls on a Saturday, the Reserve Banks open the Friday before. In 2026, July 4 is a Saturday and July 3 is a banking day; in 2027, Juneteenth repeats the pattern. Load the published schedule as data, years ahead, rather than computing it.
- **Effective date isn't settlement date.** The Originator picks an ACH entry's effective date; the ACH Operator assigns the settlement date, and an effective date that's stale or not a banking day settles at the next opportunity. Model both, and base return windows on the settlement date the bank reports.
- **Your bank's calendar and cutoffs are the ones that bind,** and they're per rail: ACH windows, wire cutoffs, check deposit deadlines. Store them per bank, in Eastern Time where the rails run, and schedule jobs backward from them.
- **Every country has its own.** Payments Canada closes on Good Friday, Victoria Day, September 30 and Boxing Day and stays open on US Thanksgiving ([Payments in Canada](/docs/industries/payments/canada)); euro payments follow the TARGET calendar. A platform in two countries keeps two calendars, and a cross-border payout needs both to be open.
- **Calendar days and banking days are different types.** The ACH windows are two banking days and 60 calendar days; Canadian personal debits get 10 calendar days of notice and business debits 10 business days of claims. Give each its own type in code, so nobody adds the wrong kind of day ([Time](/docs/fundamentals/time) covers the rest).

## Bank Files

Most bank connections are still files. ACH and wire instructions, positive pay issue files and payment requests go out; acknowledgements, returns, notifications of change, statements, lockbox deposits and processors' settlement and fee files come back. The file pipeline is as critical as any API, and it gets less attention because it runs at night.

- **Transport with keys you rotate.** Host-to-host SFTP is the norm, with AS2 or HTTPS at some banks. J.P. Morgan's, for example, takes 2048-bit RSA keys at minimum, requires every uploaded file to be PGP-signed, encrypts on request, and asks clients to rotate keys and certificates at least annually. Test and production get separate credentials, and the bank's own PGP key changes on its schedule, so its expiry is on your calendar too.
- **Names are identities.** Every outbound file gets a unique name; J.P. Morgan warns that reusing one "can and will cause file overwrites". Inside the file, the Nacha header's File ID Modifier distinguishes files sent the same day, and Canada's Standard 005 has its file creation number ([Payments in Canada](/docs/industries/payments/canada)). Allocate both from the database.
- **A file is a state machine:** built, transmitted, acknowledged or rejected, then settled, with a record of exactly which entries went into it. After an ambiguous failure, ask the bank what arrived before sending anything again; a resent file is a duplicate of every payment in it.
- **Read the acknowledgement.** A FedACH acknowledgement reports the file's status, its batch and entry counts and its debit and credit totals, and lists batch-level errors by edit code; ISO 20022 banks answer a `pain.001` with a `pain.002` status report (accepted, accepted with change, partially accepted, rejected, pending). Compare the counts and totals with what you sent, and alert when no acknowledgement arrives by the time it should. A missing acknowledgement before the cutoff is a phone call; after it, it's a day of late payments.
- **Inbound files are processed exactly once.** Poll politely (J.P. Morgan asks for no more than four polls an hour, away from the top and bottom of the hour), key each file by name and content hash, move it to processed or failed, and feed returns and NOCs into the ledger the same day. Processor settlement and fee files go through the same pipeline: fees parsed from them become ledger entries, as [Payouts & Settlement](/docs/industries/payments/payouts-and-settlement) requires.
- **Archive everything, encrypted and immutable.** Disputes, returns and examiners all refer back to the original file. ACH debit authorizations alone must be kept two years after they're revoked or end ([ACH & Bank Transfers](/docs/industries/payments/ach)), so keep the files themselves, not just what you parsed from them.

## Bank Reconciliation Is Its Own Discipline

[Ledger reconciliation](/docs/payments/payment-states) asks whether your books balance. Bank reconciliation asks whether the bank agrees, and they fail in different ways: a ledger can balance perfectly while a wire you think you sent never left.

Banks report in two families of formats. In the US, BAI2 files are still everywhere. ISO 20022 replaces them with `camt.053`, the end-of-day statement of booked entries; `camt.052`, an intraday report of the account; and `camt.054`, notifications of individual debits and credits. Expect several versions across your banks and build a parser per bank, not one that assumes the standard means one shape.

Reconciliation is matching, and the shapes are uneven:

- **One to one:** a wire matches a transfer you initiated, by your end-to-end reference.
- **One to many:** a net settlement deposit matches the thousands of transactions, refunds and fees it settles.
- **Many to one:** a payout batch leaves as one debit and has to match every payout in it.

What doesn't match goes to an unmatched-items queue, each item with an owner, an age and a deadline. Money that arrives and can't be identified, a credit with no reference, is one of those items: it sits in a suspense account until someone claims it, and goes back to the sender if nobody does. Tolerances exist only for documented costs with a reason, like a wire fee your bank charges per transfer; "within five dollars" is how a slow leak becomes a large one.

An unexplained break is a stop, not a ticket: it holds the next payout run until someone explains it. Intraday reports earn their keep here: they tell you whether today's payouts are funded before the bank's cutoff, not after.

Monitoring this pipeline, from a failed connection or a missing acknowledgement to a file that arrived and never reached the ledger, is in [Operating the Platform](/docs/industries/payments/operating-the-platform#watching-the-pipeline).

## Safeguarding Outside the US

In the UK, payment and e-money institutions don't rely on deposit insurance; they safeguard customers' funds under the FCA's rules, and those rules just got stricter. The FCA published PS25/12 on 7 August 2025, and its Supplementary Regime came into force on 7 May 2026. Firms now reconcile safeguarded funds at least once every reconciliation day (weekends, bank holidays and days when the relevant foreign markets are closed excepted), keep a resolution pack describing where funds are held and how they'd be returned, file a new monthly safeguarding return, and, unless they've safeguarded no more than £100,000 over the past 53 weeks, arrange an annual safeguarding audit by a qualified auditor. An end state modeled on the FCA's client assets rules (CASS) is planned for after the underlying legislation is repealed.

Read it as the US direction of travel written down: daily reconciliation, records that let someone else return the money if you can't, and an outside party checking.

## What This Means for the System You Build

- **A treasury ledger, separate from the merchant ledger.** One account per real bank account, every movement as double entries ([Payment States & Ledgers](/docs/payments/payment-states)). The cash in custodial accounts equals what you owe merchants (pending and available balances), plus reserves you hold for them, plus fees you've earned but not yet swept, adjusted for money in transit either way (`acquirer_settlement_clearing` coming in, `payouts_in_transit` going out). That equation is checked daily and alerts when it doesn't hold.
- **Per-owner balances on demand.** The file your bank or a regulator would need to pay each owner directly is a scheduled job, not a project you start during a crisis.
- **Every movement is a record before it's a transfer.** Intent stored, approvals attached, bank reference captured, bank confirmation matched. A transfer that exists at the bank and not in your records is the worst finding a reconciliation can produce.
- **Breaks stop payouts.** A reconciliation job that only reports is a dashboard. One that holds the next payout run on an unexplained difference is a control.

## References

**Specifications**

- [12 CFR 330.5: Recognition of deposit ownership and fiduciary relationships](https://www.law.cornell.edu/cfr/text/12/330.5), the disclosure and recordkeeping conditions for pass-through deposit insurance
- [FDIC: Recordkeeping for Custodial Accounts (proposed rule, October 2, 2024)](https://www.federalregister.gov/documents/2024/10/02/2024-22565/recordkeeping-for-custodial-accounts), beneficial-owner records, daily reconciliation, Synapse, and what deposit insurance doesn't cover
- [FDIC: Recordkeeping for Custodial Accounts; Extension of Comment Period](https://www.federalregister.gov/documents/2024/11/20/2024-27097/recordkeeping-for-custodial-accounts-extension-of-comment-period), the comment period extended to January 16, 2025
- [FCA: PS25/12, Changes to the safeguarding regime for payments and e-money firms](https://www.fca.org.uk/publications/policy-statements/ps25-12-changes-safeguarding-regime-payments-and-e-money-firms), published 7 August 2025, Supplementary Regime in force 7 May 2026

**Reference**

- [Federal Reserve Financial Services: Fedwire Funds Service Operating Hours](https://www.frbservices.org/resources/financial-services/wires/operating-hours.html), the funds-transfer day and the 6:45 p.m. ET customer transfer cutoff

**In practice**

- [CMS: FCA strengthens safeguarding regime for payments and e-money firms](https://cms.law/en/int/legal-updates/fca-strengthens-safeguarding-regime-for-payments-and-e-money-firms), daily reconciliations, the resolution pack, the monthly return and the audit exemption
- [Federal Reserve: Holiday schedules](https://www.federalreserve.gov/aboutthefed/k8.htm), the Fed's holidays and its Saturday and Sunday rules
- [Federal Reserve Financial Services: FedACH acknowledgement example](https://www.frbservices.org/binaries/content/assets/crsocms/resources/resource-centers/fedach-platform-modernization/achfahk691000134ain20200512085211959.ack), file status, counts, totals and batch edit codes
- [J.P. Morgan: Host-to-Host recommended best practices](https://www.jpmorgan.com/payments/client-resource-center/h2h/recommended-best-practices), unique file names, resending, polling and key rotation
- [SIX: Swiss Payment Standards, status report](https://www.six-group.com/dam/download/banking-services/standardization/sps/ig-status-report-sps2021-en.pdf), `pain.002` status codes in an implementation guide
- [SEPA for Corporates: The difference between camt.052, camt.053 and camt.054](https://www.sepaforcorporates.com/swift-for-corporates/the-difference-between-a-camt052-camt053-and-camt054/), intraday reports, statements and notifications
