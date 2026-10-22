+++
title = "ACH & Bank Transfers"
description = "How ACH really moves money: the parties, SEC codes and files, why settled isn't final, return windows, the Nacha rules you inherit, and when RTP or FedNow fit."
category = "Payments"
order = 811
tags = ["payments", "ach", "nacha", "bank-transfers", "ledger"]
+++

Cards dominate checkout, but bank transfers move payroll, rent, invoices, subscriptions and nearly every payout a platform sends. In the US that mostly means ACH. It is cheap and universal, and it behaves nothing like a card: there is no authorization step, nothing tells you the account has the money, and a debit that "settled" can come back two months later. Engineers who model ACH like a card payment release value they don't have yet. This doc is about building on ACH without doing that, with [Payouts & Settlement](/docs/payments/payouts-and-settlement) covering the payout side and [Payment States & Ledgers](/docs/payments/payment-states) the bookkeeping.

## How It Moves

Five parties touch every entry:

| Party | Role |
| ----- | ---- |
| **Originator** | The business that starts the payment and holds the customer's authorization |
| **ODFI** | The Originator's bank, which submits entries to the network and is liable for them |
| **ACH Operator** | The central clearing facility: the Federal Reserve (FedACH) or The Clearing House (EPN) |
| **RDFI** | The receiving bank, which posts the entry to its customer's account |
| **Receiver** | The person or business whose account is credited or debited |

![Entries flow from the Originator to the ODFI, the ACH Operator (FedACH or EPN), the RDFI and the Receiver; returns and notifications of change flow back the same way. A credit pushes money from the Originator to the Receiver; a debit pulls money from the Receiver to the Originator.](/diagrams/ach-network.svg "Five parties touch every ACH entry. Entries always travel from Originator to Receiver and returns travel back; for a credit the money moves with the entry, for a debit against it.")

A **credit** pushes money from the Originator to the Receiver (payroll, payouts, refunds). A **debit** pulls money from the Receiver to the Originator (subscriptions, invoices, loan payments). The asymmetry matters: a returned credit is almost always administrative (a closed or invalid account), while a debit takes money from someone who can later say they never agreed to it.

Nacha, the association that writes the rules, doesn't move money; its Operating Rules bind everyone who does. You join that chain by contract: your ODFI agreement obliges you to follow the Rules, and if you send entries on behalf of others through your own bank relationship, you are a **Third-Party Sender**, which the ODFI must register with Nacha and which carries its own risk and monitoring duties. Most platforms reach ACH through a provider precisely so that someone else holds that role. See [The Payments Rulebook](/docs/compliance/payments-rulebook) for how these contracts stack.

## Files, Batches and SEC Codes

ACH is batch and store-and-forward, and the file format shows it. A NACHA file is fixed-width text, every line exactly 94 characters, with a record type in the first column: a file header (1), batch headers (5), entry details (6), optional addenda (7), batch controls (8) and a file control (9), padded with lines of 9s to a multiple of ten lines. Each batch carries a **Standard Entry Class** code, and the SEC code is a legal statement about how you got permission:

| SEC | Used for | Authorization it implies |
| --- | -------- | ------------------------ |
| **PPD** | Consumer credits and debits (payroll, bills) | Written or similarly authenticated consumer authorization |
| **WEB** | Consumer debits authorized online or in an app | Internet authorization, plus the fraud screening below |
| **TEL** | Consumer debits authorized by phone | Oral authorization, which you must still be able to prove |
| **CCD** | Business-to-business credits and debits | An agreement between the businesses, one addenda record |
| **CTX** | Business-to-business with remittance detail | Same, with up to 9,999 addenda records |

Pick the code from how the customer actually authorized you, not from what the bank accepts. A debit sent as PPD when the customer clicked a button in your app is a misrepresented entry, and the authorization you can produce on request is what decides a dispute. Nacha's guide says Originators must be able to produce proof of authorization within 10 days of a request, and recurring consumer debits need terms that tell the customer how to revoke.

## Timing

Entries settle on a business-day schedule: same day if submitted in a Same Day ACH window, otherwise the next banking day or a future date you choose. Same Day ACH settles at 1:00, 5:00 and 6:00 p.m. ET, and since March 18, 2022 a single Same Day entry can be up to $1 million (international IAT entries aren't eligible at all). An entry over the limit isn't rejected; it settles next day, and restructuring a payment to get under the cap isn't allowed. The submission deadline that matters is your bank's, which comes before the Operator's.

There is no real-time leg. Nothing checks the Receiver's balance before settlement, and nothing tells you the account exists until it comes back. That's the core design fact: **settlement is when the money moves, not when it's yours.**

## Returns: When Money Is Really Yours

The RDFI rejects an entry by sending a **return** with a reason code. The codes that matter, and their windows:

| Code | Meaning | Window |
| ---- | ------- | ------ |
| R01 | Insufficient funds | 2 banking days |
| R02 | Account closed | 2 banking days |
| R03 | No account, or can't locate it | 2 banking days |
| R04 | Invalid account number | 2 banking days |
| R16 | Account frozen, including by OFAC instruction | 2 banking days |
| R29 | Business says the debit wasn't authorized | 2 banking days |
| R05 | Consumer account debited with a business SEC code | 60 calendar days |
| R07 | Authorization revoked | 60 calendar days |
| R10 | Consumer says the debit wasn't authorized | 60 calendar days |
| R11 | Authorized, but the entry was wrong (amount, date) | 60 calendar days |

The 60-day codes are what make consumer ACH debits risky. The administrative failures surface within two banking days, so that's the earliest point to treat a debit as probably good. But a consumer can claim it unauthorized for 60 calendar days after settlement, and the RDFI returns it on the consumer's written statement. Banks that offer ACH APIs model this directly: Column, for example, marks a debit settled when no return arrives within two business days and only marks it completed after the 60 days pass.

So I model an ACH debit's states through the return windows, not the submission:

![ACH debit states: pending, submitted when sent in a file, settled on the settlement date, available after 2 banking days with no return, final after 60 calendar days. An administrative return within 2 banking days moves a settled debit to returned; an unauthorized return within 60 calendar days moves an available debit to returned. Final and returned are terminal.](/diagrams/ach-states.svg "A settled debit isn't money you have yet. It's probably good once the 2-banking-day window for administrative returns closes, and final only after 60 calendar days; until then a return can take it back.")

- **Never release value at submission.** A digital good, a wallet balance or a payout funded by an ACH debit waits at least for the two-day window, and for a new customer, longer.
- **Size exposure to the 60-day tail.** For consumer debits the unauthorized-return risk is a credit decision: a hold period, a limit per new account, or a reserve, exactly as [Fraud & Risk](/docs/payments/fraud-and-risk) and [Payouts & Settlement](/docs/payments/payouts-and-settlement) treat card risk.
- **A return is a ledger event,** reversing the original entry, never an edit to it. The returned debit's value comes back out of whatever balance it funded.
- **Retry only what the rules allow.** A returned entry may be reinitiated at most twice, with the same company name, company ID and amount, marked `RETRY PYMT` in the Company Entry Description; that's for insufficient-funds returns, not a general retry loop. An unauthorized return (R05, R07, R10, R29) is never retried: it needs a new authorization. R11 is different: the authorization stands but the entry was wrong, so you may correct the error and send a new entry matching the authorization within 60 days.

## The Rules You Inherit

The Nacha Operating Rules reach you through your bank, and the ones engineering owns are concrete:

- **Return rate thresholds.** Unauthorized returns (R05, R07, R10, R11, R29, R51) above 0.5% of an Originator's debits break the Rules. Administrative returns (R02, R03, R04) above 3.0%, or all debit returns above 15.0%, aren't violations by themselves but open a Nacha inquiry. All three are measured over the preceding 60 days or two calendar months. Once a case is opened, the ODFI must bring the rate down within 30 days and keep it there for 180, or the case moves to Nacha's fines, and the ODFI will pass that pressure on to you as a suspended origination account. Monitor these rates per Originator yourself, daily; your bank's report arrives too late.
- **Account validation for WEB debits.** Since March 19, 2021, the "commercially reasonable fraudulent transaction detection system" required for WEB debits must include validating the account on its first use and whenever the account number changes. Instant verification through a bank-data provider, a prenote, or micro-deposits all qualify; skipping it does not.
- **Account numbers are protected data.** Under the Supplementing Data Security Requirements rule, non-consumer Originators, Third-Party Service Providers and Third-Party Senders above 2 million ACH entries a year must render account numbers unreadable wherever they're stored electronically, including in stored authorizations; access controls alone don't count. It phased in for the largest parties on June 30, 2021 and at 2 million on June 30, 2022, and anyone crossing the line has until June 30 of the next year. I apply it at any volume: bank account numbers get the same treatment as card numbers in [Sensitive Data](/docs/payments/sensitive-data).
- **Fraud monitoring, including credits.** The 2026 Risk Management rules require risk-based processes to identify entries that are unauthorized or "authorized under False Pretenses," the business email compromise and impersonation cases where the payer was tricked into a real credit. Phase 1 took effect March 20, 2026 for all ODFIs, for non-consumer Originators, Third-Party Service Providers and Third-Party Senders with 6 million or more originations in 2023, and for RDFIs with 10 million or more receipts in 2023; Phase 2 extended it to everyone else on June 19, 2026, a federal holiday, so in practice June 22. The procedures must be reviewed at least annually. For a platform that means monitoring outbound credits (a vendor's bank details changed yesterday, a first payout to a new account) as seriously as inbound debits.
- **Notifications of Change.** When account details are outdated, the RDFI may post the entry and send a NOC (C01 incorrect account number, C02 incorrect routing number, and so on) instead of returning it. The Originator must apply the correction within six banking days of receiving it or before the next entry to that account, whichever is later (since June 2024, acting on a NOC for a one-time payment is at the Originator's discretion). Apply NOCs automatically; ignoring them is a rules violation that eventually turns into returns.

## Consumer Law: Regulation E

ACH debits from consumer accounts are electronic fund transfers under the Electronic Fund Transfer Act and Regulation E, which gives consumers rights that sit above the Nacha Rules. A consumer has 60 days after the statement showing an error to report it, and the bank must investigate within 10 business days, or within 45 days if it provisionally credits the account. Liability for unauthorized transfers is capped at $50 if the consumer reports a lost credential within two business days and $500 after that, and becomes unlimited only for transfers after the 60-day statement window that a timely report would have prevented.

That is a different machine from card [disputes](/docs/payments/disputes-and-chargebacks). A chargeback is a network process with reason codes, evidence and a representment you can win. An unauthorized ACH return is the RDFI acting on its customer's statement; you don't get to submit evidence into the return, and your remedy, if you have a valid authorization, is to pursue the customer outside the network. That asymmetry is why authorization records and account validation are worth so much more for ACH than for cards.

## The Alternatives

| Rail | Speed | Final? | Direction | Limit |
| ---- | ----- | ------ | --------- | ----- |
| ACH | Same day to next day | No, returns for up to 60 days | Push or pull | $1M per Same Day entry |
| Wire (Fedwire) | Minutes, business hours | Yes | Push | Set by your bank |
| RTP | Seconds, 24/7 | Yes | Push | $10M since February 9, 2025 |
| FedNow | Seconds, 24/7 | Yes | Push | $10M, raised from $1M effective November 2025 |

RTP and FedNow are credit push only: the payer's bank sends the money, so there's no debit to claw back, and no return window to wait out. That's the right rail for payouts that must arrive now and for anything where finality matters more than cost. Participating banks may set lower limits than the network maximum, and not every account can receive them, so instant payouts need a fallback to ACH. Wires remain the tool for large, one-off, business-hours transfers.

Account verification sits beside all of them. Instant verification through an open-banking aggregator confirms the account exists and belongs to the customer in seconds; micro-deposits take days and a round trip but need no third party. Either satisfies the WEB rule. Instant verification is the better product, and it also gives you a balance check at the moment of authorization that ACH itself never will.

## Building on ACH

- **Generate files idempotently.** Every entry has a stable internal ID and a trace number, and a file is built from entries not yet submitted, so rebuilding it can't double them. See [Idempotency](/docs/payments/idempotency).
- **Never resubmit a file blindly.** If a transmission fails ambiguously, ask the bank what it received before sending again. A duplicate file debits every customer in it twice, and every one of those comes back as a return against your rates.
- **Reconcile daily against the bank's return and NOC files,** and against settlement, as [Payouts & Settlement](/docs/payments/payouts-and-settlement) describes. An entry that never settled and never returned is a bug, not a delay.
- **Store authorizations as records:** what the customer agreed to, when, how (the SEC code's justification), and the revocation terms. Producing it in 10 days is the requirement; producing it in 10 seconds is the goal.
- **Screen before you originate.** An OFAC-blocked Receiver is your problem before it's the RDFI's R16.

## References

**Specifications**

- [Nacha: How ACH Works](https://achdevguide.nacha.org/how-ach-works), the parties, credits and debits, SEC codes and authorization requirements
- [Nacha: ACH File Overview](https://achdevguide.nacha.org/ach-file-overview), record types, the 94-character format and blocking factor
- [CFPB: Regulation E, 12 CFR 1005.6](https://www.consumerfinance.gov/rules-policy/regulations/1005/6/), consumer liability for unauthorized transfers
- [CFPB: Regulation E, 12 CFR 1005.11](https://www.consumerfinance.gov/rules-policy/regulations/1005/11/), error resolution notice and investigation timeframes

**Reference**

- [Nacha: Same Day ACH, $1 Million Per Payment](https://www.nacha.org/million), the limit, its effective date, settlement times and the no-splitting rule
- [Nacha: ACH Network Risk and Enforcement Topics](https://www.nacha.org/rules/ach-network-risk-and-enforcement-topics), the 0.5%, 3.0% and 15.0% levels, the codes each counts, the 60-day measurement, and reinitiation with `RETRY PYMT`
- [Nacha: Risk and Quality Rules fact sheet](https://www.nacha.org/system/files/2019-05/Risk-and-Quality-Rules-Fact-Sheet.pdf), the enforcement process: 30 days to reduce, 180 days of monitoring, then fines
- [Nacha: Differentiating Unauthorized Return Reasons](https://www.nacha.org/rules/differentiating-unauthorized-return-reasons), R10 versus R11, R11 in the unauthorized return rate, and correcting and resending an R11 entry
- [Nacha: Minor Rules Topics](https://www.nacha.org/rules/minor-rules-topics-1), reinitiation limited to two times
- [Nacha: Supplementing Fraud Detection Standards for WEB Debits](https://nacha.org/rules/supplementing-fraud-detection-standards-web-debits), account validation for WEB debits
- [Nacha: Supplementing Data Security Requirements](https://www.nacha.org/rules/supplementing-data-security-requirements), who's covered, the 6 million and 2 million phases, and rendering stored account numbers unreadable
- [Nacha: Fraud Monitoring, Phase 1](https://www.nacha.org/rules/risk-management-topics-fraud-monitoring-phase-1), the 2026 monitoring duties, thresholds and annual review
- [Nacha: Fraud Monitoring, Phase 2](https://www.nacha.org/rules/risk-management-topics-fraud-monitoring-phase-2), extension to all parties on June 19, 2026, in practice June 22
- [Nacha: Third-Party Sender Registration](https://www.nacha.org/rules/third-party-sender-registration), ODFIs registering the Third-Party Senders they serve
- [Federal Reserve Financial Services: FedNow limit to $10 million](https://www.frbservices.org/news/press-releases/090525-fednow-transaction-limit-increase), the network limit raised from $1 million, effective November 2025

**In practice**

- [The Clearing House: RTP Network](https://www.theclearinghouse.org/payment-systems/rtp), instant settlement that is final, any time, every day
- [Column: ACH Returns](https://docs.column.com/ach/returns), return codes with their windows, and a bank modeling debits as completed only after 60 days
- [Nacha: Minor Rules Topics (June 21, 2024)](https://www.nacha.org/rules/minor-rules-topics-2), Originator discretion over NOC changes for any single entry
- [Cape Cod 5: ACH Reference Guide (PDF)](https://www.capecodfive.com/sites/default/files/documents/2025.12.30%20CC5%20ACH%20Reference%20Guide.pdf), a bank's statement of the six-banking-day NOC rule, whichever is later
- [The Clearing House: Higher $10 Million RTP Network Transaction Limit](https://www.theclearinghouse.org/payment-systems/Articles/2024/12/Higher_10_Million_RTP_Network_Transaction_Limit_Empowers_New_Uses_12-04-2024), the limit raised from $1 million to $10 million effective February 9, 2025
