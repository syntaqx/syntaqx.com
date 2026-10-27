+++
title = "ACH & Bank Transfers"
description = "How ACH really moves money: SEC codes and files, why settled isn't final, returns, reversals and fees, validating accounts, the Nacha rules, RTP and FedNow."
category = "Payments Industry"
order = 1405
part = "How Money Moves"
aliases = ["payments/ach"]
tags = ["payments", "ach", "nacha", "bank-transfers", "ledger"]
+++

Cards dominate checkout, but bank transfers move payroll, rent, invoices, subscriptions and nearly every payout a platform sends. In the US that mostly means ACH. It is cheap and universal, and it behaves nothing like a card: there is no authorization step, nothing tells you the account has the money, and a debit that "settled" can come back two months later. Engineers who model ACH like a card payment release value they don't have yet. This chapter is about building on ACH without doing that, with [Payouts & Settlement](/books/payments/payouts-and-settlement) covering the payout side and [Payment States & Ledgers](/docs/payments/payment-states) the bookkeeping.

## How It Moves

Five parties touch every entry:

| Party | Role |
| ----- | ---- |
| **Originator** | The business that starts the payment and holds the payer's authorization |
| **ODFI** | The Originator's bank, which submits entries to the network and is liable for them |
| **ACH Operator** | The central clearing facility: the Federal Reserve (FedACH) or The Clearing House (EPN) |
| **RDFI** | The receiving bank, which posts the entry to its customer's account |
| **Receiver** | The person or business whose account is credited or debited |

![Entries flow from the Originator to the ODFI, the ACH Operator (FedACH or EPN), the RDFI and the Receiver; returns and notifications of change flow back the same way. A credit pushes money from the Originator to the Receiver; a debit pulls money from the Receiver to the Originator.](/diagrams/ach-network.svg "Five parties touch every ACH entry. Entries always travel from Originator to Receiver and returns travel back; for a credit the money moves with the entry, for a debit against it.")

A **credit** pushes money from the Originator to the Receiver (payroll, payouts, refunds). A **debit** pulls money from the Receiver to the Originator (subscriptions, invoices, loan payments). The asymmetry matters: a returned credit is almost always administrative (a closed or invalid account), while a debit takes money from someone who can later say they never agreed to it.

Nacha, the association that writes the rules, doesn't move money; its Operating Rules bind everyone who does. You join that chain by contract: your ODFI agreement obliges you to follow the Rules, and if you send entries on behalf of others through your own bank relationship, you are a **Third-Party Sender**, which the ODFI must register with Nacha and which carries its own risk and monitoring duties. Most platforms reach ACH through a provider precisely so that someone else holds that role. See [The Payments Rulebook](/books/payments/payments-rulebook) for how these contracts stack.

## Files, Batches and SEC Codes

ACH is batch and store-and-forward, and the file format shows it: fixed-width text, every line exactly 94 characters, taken apart record by record at the [end of this chapter](#anatomy-of-a-nacha-file). Each batch carries a **Standard Entry Class** code, and the SEC code is a legal statement about how you got permission:

| SEC | Used for | Authorization it implies |
| --- | -------- | ------------------------ |
| **PPD** | Consumer credits and debits (payroll, bills) | Written or similarly authenticated consumer authorization |
| **WEB** | Consumer debits authorized online or in an app | Internet authorization, plus the fraud screening below |
| **TEL** | Consumer debits authorized by phone | Oral authorization, which you must still be able to prove |
| **CCD** | Business-to-business credits and debits | An agreement between the businesses, one addenda record |
| **CTX** | Business-to-business with remittance detail | Same, with up to 9,999 addenda records |

Pick the code from how the payer actually authorized you, not from what the bank accepts. A debit sent as PPD when the payer clicked a button in your app is a misrepresented entry, and the authorization you can produce on request is what decides a dispute. Nacha's guide says Originators must be able to produce proof of authorization within ten banking days of a request, and recurring consumer debits need terms that tell the payer how to revoke.

Two more families of codes live in other chapters: the check conversion codes (ARC, BOC, POP and RCK) in [Accepting Checks](/books/payments/checks), and the oral authorization rules behind TEL in [Phone Payments](/books/payments/phone-payments). Canada's equivalent of all of this, pre-authorized debits under Payments Canada's Rule H1, is in [Payments in Canada](/books/payments/canada).

## Timing

Entries settle on a business-day schedule: same day if submitted in a Same Day ACH window, otherwise the next banking day or a future date you choose. Same Day ACH settles at 1:00, 5:00 and 6:00 p.m. ET, and since March 18, 2022 a single Same Day entry can be up to $1 million; international entries (the IAT SEC code) aren't eligible at all. An entry over the limit isn't rejected; it settles next day, and restructuring a payment to get under the cap isn't allowed. The submission deadline that matters is your bank's, which comes before the Operator's.

There is no real-time leg. Nothing checks the Receiver's balance before settlement, and nothing tells you the account exists until it comes back. That's the core design fact: **settlement is when the money moves, not when it's yours.**

## Returns: When Money Is Really Yours

The RDFI rejects an entry by sending a **return** with a reason code. The codes that matter, and their windows:

| Code | Meaning | Window |
| ---- | ------- | ------ |
| R01 | Insufficient funds | 2 banking days |
| R02 | Account closed | 2 banking days |
| R03 | No account, or can't locate it | 2 banking days |
| R04 | Invalid account number | 2 banking days |
| R09 | Uncollected funds: the balance exists but isn't yet available | 2 banking days |
| R16 | Account frozen, including by OFAC instruction (the Treasury's Office of Foreign Assets Control, which runs US sanctions) | 2 banking days |
| R17 | Entry rejected, including an improper reversal to a business account | 2 banking days |
| R29 | Business says the debit wasn't authorized | 2 banking days |
| R05 | Consumer account debited with a business SEC code | 60 calendar days |
| R07 | Authorization revoked | 60 calendar days |
| R10 | Consumer says the debit wasn't authorized | 60 calendar days |
| R11 | Authorized, but the entry was wrong (amount, date) | 60 calendar days |
| R51 | A converted check that wasn't eligible for conversion, or was converted improperly | 60 calendar days |

The 60-day codes are what make consumer ACH debits risky. The administrative failures surface within two banking days, so that's the earliest point to treat a debit as probably good. But a consumer can claim it unauthorized for 60 calendar days after settlement, and the RDFI returns it on the consumer's written statement. Banks that offer ACH through an API model this directly: Column, for example, marks a debit settled when no return arrives within two business days and only marks it completed after the 60 days pass.

So I model an ACH debit's states through the return windows, not the submission:

![ACH debit states: pending, submitted when sent in a file, settled on the settlement date, available after 2 banking days with no return, final after 60 calendar days. An administrative return within 2 banking days moves a settled debit to returned; an unauthorized return within 60 calendar days moves an available debit to returned. Final and returned are terminal.](/diagrams/ach-states.svg "A settled debit isn't money you have yet. It's probably good once the 2-banking-day window for administrative returns closes, and final only after 60 calendar days; until then a return can take it back.")

- **Never release value at submission.** A digital good, a wallet balance or a payout funded by an ACH debit waits at least for the two-day window, and for a new payer, longer.
- **Size exposure to the 60-day tail.** For consumer debits the unauthorized-return risk is a credit decision: a hold period, a limit per new account, or a reserve, exactly as [Fraud & Risk](/books/payments/fraud-and-risk) and [Payouts & Settlement](/books/payments/payouts-and-settlement) treat card risk.
- **A return is a ledger event,** reversing the original entry, never an edit to it. The returned debit's value comes back out of whatever balance it funded.
- **Retry only what the rules allow.** A returned entry may be reinitiated at most twice, with the same company name, company ID and amount, marked `RETRY PYMT` in the Company Entry Description; that's for insufficient-funds returns, not a general retry loop. An unauthorized return (R05, R07, R10, R29) is never retried: it needs a new authorization. R11 is different: the authorization stands but the entry was wrong, so you may correct the error and send a new entry matching the authorization within 60 days.

## Reversals

A return is the RDFI rejecting an entry. A **reversal** is the Originator undoing its own mistake: a new entry that offsets an erroneous one. Nacha allows it for a short list of reasons: a duplicate, the wrong Receiver, the wrong amount, a debit dated earlier or a credit dated later than intended (both added June 30, 2021), and certain payroll credits on termination of employment.

- **Five banking days.** The reversing entry must reach the RDFI within five banking days of the erroneous entry's settlement date, with `REVERSAL` in the Company Entry Description and the same company ID, SEC code and amount as the original. A whole file sent in error is reversed within 24 hours of discovering it as well, and many banks apply that 24-hour clock to single entries too.
- **Tell the Receiver** of the reversal and the reason, no later than its settlement date.
- **It's not a collection tool.** Reversing because a payer turned out not to have paid, or because the Originator failed to fund the original credit, is an improper reversal. Since June 30, 2021 the RDFI can return one: as R11 for a consumer, within the 60-day window, or as R17 for a business account, within two banking days. Nacha can fine egregious cases.
- **Model it as its own entry,** linked to the one it corrects, with its own states. Banks with ACH APIs treat a reversal as a separate transfer that can itself be returned, and so should your ledger.

![A business-day timeline from a consumer debit's settlement date: administrative returns close after 2 banking days, when the debit becomes available; the Originator's reversal window runs 5 banking days; unauthorized consumer returns stay open for 60 calendar days, after which the debit is final.](/diagrams/pm-ach-return-windows.svg "Three clocks start at settlement. The bank's administrative returns close in 2 banking days and the Originator's reversals in 5, but a consumer can still return the debit as unauthorized for 60 calendar days.")

## After a Return: Fees and Blocks

A returned debit leaves two decisions: whether to charge the payer for it, and whether to let them pay from that account again.

**Return fees.** Nacha lets an Originator collect a returned-item fee by ACH as a **Return Fee Entry**, with conditions. It's only for insufficient or uncollected funds returns (R01, R09), and only when the payer was told about the fee when they authorized the original payment. It goes as its own entry (never added to a reinitiated one), with `RETURN FEE` in the Company Entry Description, once per returned item however it's collected. The amount is state law, and the caps differ in what they cover:

| State | Cap | Applies to |
| --- | --- | --- |
| California (Civil Code 1719) | $25 for the first, $35 for each later one to the same payee | Checks |
| Florida (68.065) | $25 up to $50, $30 up to $300, $40 above, or 5% if greater, plus bank fees | Checks and electronic payments |
| Texas (Bus. & Com. Code 3.506) | $30 | Paper or electronic payments |
| New York (General Obligations Law 5-328) | $20, or a landlord's actual costs if higher and the lease provides for it | Checks |

Canada's Rule H1 lets a dishonored debit be re-presented only for the same amount, with no fee added ([Payments in Canada](/books/payments/canada)). Keep return fees as data per jurisdiction with effective dates ([Rules as Data](/docs/architecture/rules-as-data#effective-dates-and-versions)), the same way [Surcharging & Fees](/books/payments/surcharging-and-fees) keeps its rules, and charge one only where the payer agreed to it in advance.

**Blocks.** The return code decides what happens to the account:

- **R02, R03, R04** (closed, no account, invalid number): the account number is dead. Stop using it for that payer and ask for a new one; don't retry.
- **R01, R09** (insufficient or uncollected funds): reinitiate within the rules above. After repeated returns, many billing terms and leases move the payer to certified funds or another method for a period, and some states let a landlord demand cash or certified funds for a period after a bounce ([Accepting Checks](/books/payments/checks#who-still-pays-by-paper)).
- **R05, R07, R10, R29** (unauthorized or revoked): stop debiting under that authorization at once, and don't debit the account again without a new one. These, with R11 and R51, count toward Nacha's 0.5% unauthorized return threshold ([below](#the-rules-you-inherit)), so a second debit to the same account is the most expensive mistake on the list.
- **R16** (frozen): stop, and treat it as a possible sanctions hit.

Build these as **payment method restrictions**: a record with the reason, what it covers (one account number, one payer, every bank payment, or, used sparingly and reviewed, a whole routing number when fraud concentrates at one bank or prepaid program), when it started, when it expires and who lifted it, checked whenever a payment is authorized, including at a cash counter ([Cash Payments](/books/payments/cash-payments)).

Match blocked accounts by a keyed hash of the account number, so the block survives the payer entering it again under a new profile, and tell the payer why they're restricted and when it ends.

## The Rules You Inherit

The Nacha Operating Rules reach you through your bank, and the ones engineering owns are concrete:

- **Return rate thresholds.** Unauthorized returns (R05, R07, R10, R11, R29, and R51 for a misused check conversion) above 0.5% of an Originator's debits break the Rules. Administrative returns (R02, R03, R04) above 3.0%, or all debit returns above 15.0%, aren't violations by themselves but open a Nacha inquiry. All three are measured over the preceding 60 days or two calendar months. Once a case is opened, the ODFI must bring the rate down within 30 days and keep it there for 180, or the case moves to Nacha's fines, and the ODFI will pass that pressure on to you as a suspended origination account. Monitor these rates per Originator yourself, daily; your bank's report arrives too late.
- **Exposure limits.** Your ODFI must set limits on the dollar value of credits and debits you may originate over a period, monitor your origination and returns across multiple settlement dates, and enforce them (Subsection 2.2.3); a Third-Party Sender must do the same for each originator it serves. Prefunding doesn't count as a limit. For a platform that means per-merchant credit and debit limits, per day and across days, sitting under the bank's limit for you, with debit exposure counted until the return window closes.
- **Account validation for WEB debits.** Since March 19, 2021, the "commercially reasonable fraudulent transaction detection system" required for WEB debits must include validating the account on its first use and whenever the account number changes. Instant verification through a bank-data provider, a prenote, or micro-deposits all qualify; skipping it does not.
- **Account numbers are protected data.** Under the Supplementing Data Security Requirements rule, non-consumer Originators, Third-Party Service Providers and Third-Party Senders above 2 million ACH entries a year must render account numbers unreadable wherever they're stored electronically, including in stored authorizations; access controls alone don't count. It phased in for parties above 6 million entries on June 30, 2021 and above 2 million on June 30, 2022, and anyone crossing the line has until June 30 of the next year. I apply it at any volume: bank account numbers get the same treatment as card numbers in [Sensitive Data](/docs/payments/sensitive-data).
- **Fraud monitoring, including credits.** The 2026 Risk Management rules require risk-based processes to identify entries that are unauthorized or "authorized under False Pretenses," the business email compromise and impersonation cases where the payer was tricked into a real credit. Phase 1 took effect March 20, 2026 for all ODFIs, for non-consumer Originators, Third-Party Service Providers and Third-Party Senders with 6 million or more originations in 2023, and for RDFIs with 10 million or more receipts in 2023; Phase 2 extended it to everyone else on June 19, 2026, a federal holiday, so in practice June 22. The procedures must be reviewed at least annually. For a platform that means monitoring outbound credits (a vendor's bank details changed yesterday, a first payout to a new account) as seriously as inbound debits.
- **Notifications of Change.** When account details are outdated, the RDFI may post the entry and send a NOC (C01 incorrect account number, C02 incorrect routing number, and so on) instead of returning it. The Originator must apply the correction within six banking days of receiving it or before the next entry to that account, whichever is later (since June 2024, acting on a NOC for a one-time payment is at the Originator's discretion). Apply NOCs automatically; ignoring them is a rules violation that eventually turns into returns.

## Validating the Account

Nothing in ACH tells you an account exists before you debit it, so you check first. The WEB rule above requires it on first use and whenever the account number changes; it asks only that the account is open and can take ACH entries, not who owns it, and it exempts accounts with a successful payment history and changes made because of a NOC. The methods, roughly cheapest first:

- **The routing number.** Its ninth digit is a check digit (the digits weighted 3, 7, 1, repeating, must sum to a multiple of ten), which catches most typos for free. Then look it up in the Federal Reserve's **E-Payments Routing Directory**, synchronized daily with FedACH, to confirm it's ACH-eligible and current; the FedACH file names the new routing number when banks merge. Several hundred routing numbers are added or retired a year, and Nacha's December 2024 bulletin is blunt that for WEB and TEL debits "it is not commercially reasonable to do nothing." A non-bank gets the full file through its bank, under terms that forbid reselling it.
- **Instant verification** through an open-banking aggregator confirms the account exists and belongs to the payer in seconds, and gives you a balance check at the moment of authorization that ACH itself never will. It's the better product where payers will log in to their bank.
- **Database checks** from providers like Early Warning and GIACT report an account's status, and sometimes its owner, without the payer logging in: the fallback for people who won't link a bank.
- **Micro-entries** prove control of the account: credits under $1 each, optionally with an offsetting debit no larger than them, sent together, with `ACCTVERIFY` in the description and the same company name as future payments. Since March 2023, Originators must also monitor micro-entry volumes for fraud.
- **Prenotes** are zero-dollar entries that come back as a return if the account is bad. After one, wait three banking days before sending live entries; since June 2024 you may send one at any time, for example to re-check a dormant account.

All of them satisfy the WEB rule; none of them prove the payer has the money next week. Validation reduces administrative returns, not unauthorized ones.

## Consumer Law: Regulation E

ACH debits from consumer accounts are electronic fund transfers under the Electronic Fund Transfer Act and Regulation E, which gives consumers rights that sit above the Nacha Rules. A consumer has 60 days after the statement showing an error to report it, and the bank must investigate within 10 business days, or within 45 days if it provisionally credits the account. Liability for unauthorized transfers is capped at $50 if the consumer reports a lost credential within two business days and $500 after that, and becomes unlimited only for transfers after the 60-day statement window that a timely report would have prevented.

That is a different machine from card [disputes](/books/payments/disputes-and-chargebacks). A chargeback is a network process with reason codes, evidence and a representment you can win. An unauthorized ACH return is the RDFI acting on its customer's statement; you don't get to submit evidence into the return, and your remedy, if you have a valid authorization, is to pursue the payer outside the network. That asymmetry is why authorization records and account validation are worth so much more for ACH than for cards.

## The Alternatives

| Rail | Speed | Final? | Direction | Limit |
| ---- | ----- | ------ | --------- | ----- |
| ACH | Same day to next day | No, returns for up to 60 days | Push or pull | $1M per Same Day entry |
| Wire (Fedwire) | Minutes, business hours | Yes | Push | Set by your bank |
| RTP | Seconds, 24/7 | Yes | Push | $10M since February 9, 2025 |
| FedNow | Seconds, 24/7 | Yes | Push | $10M, raised from $1M effective November 2025 |

RTP and FedNow are credit push only: the payer's bank sends the money, so there's no debit to claw back, and no return window to wait out. That's the right rail for payouts that must arrive now and for anything where finality matters more than cost. Choosing a rail for each payee, beside virtual cards and checks, is [Vendor Payouts](/books/payments/vendor-payouts). Participating banks may set lower limits than the network maximum, and not every account can receive them, so instant payouts need a fallback to ACH. Wires remain the tool for large, one-off, business-hours transfers.

## Anatomy of a Nacha File

Here is a complete, valid file: a private school collecting November tuition from three families by WEB debit, one of them with a remittance addenda. Every routing number in it is fictional, with a valid check digit, and every control total is real.

```text
101 12345678012345678902610301405A094101FIRST EXAMPLE BANK     EXAMPLE ACADEMY LLC            
5225EXAMPLE ACADEMY                     1234567890WEBTUITION   NOV 26261102   1123456780000001
627987654320000123456789     0000185000STU-4471       JORDAN RIVERA         R 0123456780000001
6275555555509876543          0000142500STU-4502       SAM OKAFOR            R 1123456780000002
705TUITION NOV 2026 GR 4                                                           00010000002
63798765432055500012         0000097500STU-4519       ALEX CHEN             R 0123456780000003
822500000402530864190000004250000000000000001234567890                         123456780000001
9000001000001000000040253086419000000425000000000000000                                       
9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999
9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999
```

Each line is one record, identified by its first character. Field positions are fixed, numeric fields are right-justified and zero-filled, and text fields are left-justified, upper case and space-filled.

**File header (`1`)**, one per file:

| Positions | Field | In the example |
| --- | --- | --- |
| 2-3 | Priority code | `01`, always |
| 4-13 | Immediate destination | ` 123456780`: the ODFI's routing number, with a leading space |
| 14-23 | Immediate origin | `1234567890`: the originator, as the bank assigned it |
| 24-33 | Creation date and time | `261030 1405`: October 30, 2026, 14:05 |
| 34 | File ID modifier | `A`: the first file today; the next is `B`, so the bank can tell them apart |
| 35-40 | Record size, blocking factor, format | `094`, `10`, `1`: fixed values |
| 41-86 | Destination and origin names | The bank's name and yours |

**Batch header (`5`)**, one per batch:

| Positions | Field | In the example |
| --- | --- | --- |
| 2-4 | Service class | `225`: debits only (`220` credits only, `200` mixed) |
| 5-20 | Company name | `EXAMPLE ACADEMY`: 16 characters with the trailing space, and what appears on the payer's statement |
| 41-50 | Company identification | `1234567890`: usually `1` plus the originator's EIN (employer identification number, the federal tax ID) |
| 51-53 | SEC code | `WEB`: authorized online |
| 54-63 | Company entry description | `TUITION`: also on the statement, and where `REVERSAL`, `RETURN FEE`, `RETRY PYMT` and `ACCTVERIFY` go |
| 64-69 | Descriptive date | `NOV 26`: free text, shown on the statement |
| 70-75 | Effective entry date | `261102`: the banking day you want it to settle |
| 76-78 | Settlement date | Blank: the ACH Operator fills it in |
| 80-94 | ODFI and batch number | `12345678`, batch `0000001` |

![A dimensioned drawing of the 94-character entry detail record split into eight field groups (type and transaction code, RDFI routing number, account number, amount, individual ID, name, payment type and addenda indicator, trace number), with a detail of the amount field showing 0000185000 as $1,850.00 in cents with no decimal point.](/diagrams/pm-ach-entry-record.svg "Every entry is exactly 94 characters, and every field sits at a fixed position. The amount is cents, zero-filled from the left, with the decimal point implied rather than written.")

**Entry detail (`6`)**, one per payment, the record you'll build most:

| Positions | Field | In the example (first entry) |
| --- | --- | --- |
| 2-3 | Transaction code | `27`: debit to a checking account (`37` savings, `22` and `32` credits, `28` and `38` prenotes) |
| 4-12 | RDFI routing number | `98765432` and check digit `0` |
| 13-29 | Account number | `000123456789`, left-justified |
| 30-39 | Amount | `0000185000`: $1,850.00, in cents, never with a decimal point |
| 40-54 | Individual ID | `STU-4471`: your own reference, echoed back on returns |
| 55-76 | Individual name | `JORDAN RIVERA` |
| 77-78 | Payment type code | `R`: recurring (`S` single), required on WEB and TEL debits |
| 79 | Addenda indicator | `0`, or `1` when an addenda follows |
| 80-94 | Trace number | `123456780000001`: the ODFI's 8 digits and a sequence, unique per file |

**Addenda (`7`)** carries 80 characters of payment information after type code `05` (`TUITION NOV 2026 GR 4`), then its own sequence number and the last seven digits of its entry's trace number, which ties it to the second entry.

**Batch control (`8`)** and **file control (`9`)** are where banks catch mistakes. Each carries the count of entry and addenda records (4), the debit and credit totals in cents ($4,250.00 and $0.00), and an **entry hash**: the sum of every entry's 8-digit RDFI routing number, keeping the rightmost ten digits. Here that's 98765432 + 55555555 + 98765432 = 253086419. The file control adds the batch count and the **block count**: the number of 10-line blocks, which is why the file ends in lines of 9s padding it to a multiple of ten. A file whose controls don't add up is rejected whole, and the acknowledgement says which check failed ([Treasury & Bank Operations](/books/payments/treasury#bank-files)).

If the first family's account is short, a return comes back from the RDFI in its own file a day or two later, as an entry and an addenda:

```text
626123456780000123456789     0000185000STU-4471       JORDAN RIVERA           1987654320000001
799R01123456780000001      98765432                                            987654320000001
```

The return's entry uses transaction code `26` (return of a checking debit), is addressed to the ODFI, and carries the same account, amount and individual ID. Its addenda (`799`) holds the reason code `R01`, the original entry's trace number `123456780000001`, and the original RDFI's identification. Match returns on that original trace number, never on name or amount: it's the one field guaranteed to point at exactly one entry you sent.

## How to Build It

ACH adds three things to the [core data model](/books/payments/card-payments#the-core-data-model): the authorization behind a debit, the entries that actually go into files, and the restrictions a return leaves behind. A `payments` row is still the payment; an ACH entry is one attempt to move it, the way a `payment_attempts` row is for cards, and a reversal, prenote or return fee is an entry of its own.

```sql
CREATE TABLE ach_authorizations (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  payment_method_id UUID NOT NULL REFERENCES payment_methods (id),
  sec_code          TEXT NOT NULL CHECK (sec_code IN ('PPD', 'WEB', 'TEL', 'CCD', 'CTX')),
  terms_version     TEXT NOT NULL,          -- the wording accepted, incl. revocation and any return fee
  evidence_ref      TEXT NOT NULL,          -- the stored acceptance record
  authorized_at     TIMESTAMPTZ NOT NULL,
  revoked_at        TIMESTAMPTZ             -- set by the payer, or by an R07/R10 return
);

CREATE TABLE ach_entries (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  payment_id        UUID REFERENCES payments (id),   -- or payout_id for credits
  payout_id         UUID REFERENCES payouts (id),
  authorization_id  UUID REFERENCES ach_authorizations (id),
  kind              TEXT NOT NULL CHECK (kind IN
                      ('debit', 'credit', 'prenote', 'micro_entry', 'reversal', 'return_fee')),
  corrects_entry_id UUID REFERENCES ach_entries (id), -- the original, for reversals and retries
  amount            BIGINT NOT NULL,
  effective_date    DATE NOT NULL,
  file_id           TEXT,                   -- null until built into a file
  trace_number      TEXT UNIQUE,
  status            TEXT NOT NULL CHECK (status IN
                      ('pending', 'submitted', 'settled', 'available', 'final', 'returned')),
  settled_on        DATE
);

CREATE TABLE ach_returns (
  ach_entry_id      UUID PRIMARY KEY REFERENCES ach_entries (id),  -- matched on the original trace number
  return_code       TEXT NOT NULL,          -- R01, R10, ...
  received_at       TIMESTAMPTZ NOT NULL
);

CREATE TABLE payment_method_restrictions (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  scope             TEXT NOT NULL CHECK (scope IN ('account_number', 'customer', 'routing_number')),
  fingerprint       TEXT NOT NULL,          -- keyed hash, like payment_methods.fingerprint
  reason            TEXT NOT NULL,          -- the return code or rule that set it
  starts_at         TIMESTAMPTZ NOT NULL,
  ends_at           TIMESTAMPTZ,
  lifted_by         TEXT
);
```

A return posts a `ledger_transactions` row with `source_type = 'ach_return'`, reversing whatever the entry funded, and moves the entry to `returned`; the `available` and `final` transitions are computed from `settled_on` and the banking calendar, not set by hand ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).

## Auditing

An ACH program is audited from two sides: your ODFI's Rules compliance audit reaches down to you, and an RDFI's request for proof of authorization arrives one entry at a time. The general design is in [Audit Trails](/docs/architecture/audit-trails); for ACH, keep:

- **Every authorization, for two years after it ends.** Nacha requires the Originator to keep the original or a copy for two years from its termination or revocation, so the clock starts when the payer revokes or the agreement ends, not when it was signed. Keep the accepted terms version, the evidence of acceptance, the SEC code it justifies and the revocation event, retrievable by entry: the 10-banking-day deadline for proof of authorization runs per request.
- **Return-rate evidence you computed yourself.** Daily unauthorized, administrative and overall return rates per Originator, with the entries and return codes behind each number and the measurement window used, so a Nacha inquiry is answered from the same figures you monitored, not reconstructed after the letter arrives.
- **Each return and NOC with what you did about it:** the code, when it arrived, the restriction it set or the correction applied, and when, which is how you show NOCs were applied within six banking days and that no unauthorized return was followed by another debit under the same authorization.
- **Reversals and reinitiations with their reasons,** linked to the original entry, so each one can be shown to fall on Nacha's permitted list and within its window.
- **Account validation results** for every WEB debit account on first use and after every change, with the method and provider response, since the WEB rule is satisfied only by evidence that it ran.
- **Exposure limits and their breaches:** the limit in force per merchant on each day, every entry held or rejected for exceeding it, and who approved an override.

## What This Means for the System You Build

- **Generate files idempotently.** Every entry has a stable internal ID and a trace number, and a file is built from entries not yet submitted, so rebuilding it can't double them. See [Idempotency](/docs/payments/idempotency).
- **Never resubmit a file blindly.** If a transmission fails ambiguously, ask the bank what it received before sending again. A duplicate file debits every payer in it twice, and every one of those comes back as a return against your rates.
- **Reconcile daily against the bank's return and NOC files,** and against settlement, as [Payouts & Settlement](/books/payments/payouts-and-settlement) describes. An entry that never settled and never returned is a bug, not a delay.
- **Store authorizations as records:** what the payer agreed to, when, how (the SEC code's justification), and the revocation terms, with the evidence an electronic acceptance needs ([What the Evidence Holds](/docs/compliance/electronic-signatures#what-the-evidence-holds)). Producing it in 10 days is the requirement; producing it in 10 seconds is the goal.
- **Screen before you originate.** An OFAC-blocked Receiver is your problem before it's the RDFI's R16.
- **Treat files and dates as operations.** Transmission, acknowledgements and the banking calendar are in [Treasury & Bank Operations](/books/payments/treasury#bank-files); an effective date on a holiday settles on the next banking day, whether you planned for it or not.

## References

**Specifications**

- [Nacha: How ACH Works](https://achdevguide.nacha.org/how-ach-works), the parties, credits and debits, SEC codes and authorization requirements
- [Nacha: ACH File Overview](https://achdevguide.nacha.org/ach-file-overview), record types, the 94-character format and blocking factor
- [Nacha: ACH File Details](https://achdevguide.nacha.org/ach-file-details), the entry detail record's field positions and lengths
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
- [Nacha: Reversals and Enforcement](https://www.nacha.org/rules/reversals-and-enforcement), permissible reasons, the five-banking-day window, and improper reversals returned as R11 or R17
- [Nacha: Micro-Entries](https://www.nacha.org/rules/micro-entries), amounts, offsetting debits, `ACCTVERIFY` and fraud monitoring
- [Nacha: ACH Operations Bulletin #4-2024](https://www.nacha.org/news/ach-operations-bulletin-4-2024-importance-maintaining-date-routing-transit-numbers), several hundred routing number additions and deletions a year, keeping them current, and why doing nothing isn't commercially reasonable
- [Federal Reserve Financial Services: E-Payments Routing Directory FAQ](https://www.frbservices.org/resources/routing-number-directory/faqs.html), daily updates, download access and terms of use
- [California Civil Code 1719](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1719), returned check service charges
- [Florida Statutes 68.065](https://www.flsenate.gov/Laws/Statutes/2025/68.065), service charges on dishonored checks and electronic payments
- [Texas Business and Commerce Code 3.506](https://texas.public.law/statutes/tex._bus._and_com._code_section_3.506), the $30 processing fee for a dishonored payment device
- [New York General Obligations Law 5-328](https://www.nysenate.gov/legislation/laws/GOB/5-328), dishonored check charges and the landlord exception
- [Nacha: Why exposure limits are so important](https://www.nacha.org/news/why-are-exposure-limits-so-important-rmag-sees-several-reasons), establishing, monitoring and enforcing limits for originators and Third-Party Senders
- [Nacha: Originator Essentials (PDF)](https://www.nacha.org/sites/default/files/2024-10/RMAG_Originator_Essentials.pdf), exposure limits under Subsection 2.2.3, and why prefunding isn't one

**In practice**

- [The Clearing House: RTP Network](https://www.theclearinghouse.org/payment-systems/rtp), instant settlement that is final, any time, every day
- [Column: ACH Returns](https://docs.column.com/ach/returns), return codes with their windows, and a bank modeling debits as completed only after 60 days
- [Nacha: Minor Rules Topics (June 21, 2024)](https://www.nacha.org/rules/minor-rules-topics-2), Originator discretion over NOC changes for any single entry, and prenotes at any time
- [Increase: ACH reversals](https://increase.com/documentation/ach-reversals), a bank modeling a reversal as its own transfer
- [Early Warning: Verify Account](https://www.earlywarning.com/sites/default/files/2024-02/Verify-account-product-brief-v3-20240202.pdf), database account status checks for the WEB rule
- [Plaid: Auth](https://plaid.com/docs/auth/), instant account verification and its fallbacks
- [Cape Cod 5: ACH Reference Guide (PDF)](https://www.capecodfive.com/sites/default/files/documents/2025.12.30%20CC5%20ACH%20Reference%20Guide.pdf), a bank's statement of the six-banking-day NOC rule (whichever is later), authorizations kept two years from termination or revocation, and prenotes at least three banking days before the first live entry
- [The Clearing House: Higher $10 Million RTP Network Transaction Limit](https://www.theclearinghouse.org/payment-systems/Articles/2024/12/Higher_10_Million_RTP_Network_Transaction_Limit_Empowers_New_Uses_12-04-2024), the limit raised from $1 million to $10 million effective February 9, 2025
