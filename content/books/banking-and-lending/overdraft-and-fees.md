+++
title = "Overdraft, NSF & Fees"
description = "Overdraft and NSF fees: the Reg E opt-in, APSN and the available balance, re-presentment, the 2024 CFPB rule and its 2025 repeal, and fee-free models."
category = "Banking & Lending Industry"
order = 2416
part = "Deposits"
tags = ["banking", "deposits", "overdraft", "fees", "regulation-e", "regulation-dd"]
+++

When a customer spends more than the account holds, the bank has two choices on each item: pay it and lend the difference, or refuse it. Paying it is an **overdraft**; refusing a check or ACH debit and sending it back is a **return**, and the fee for that is the **NSF** (nonsufficient funds) or returned-item fee. A declined card authorization costs the customer nothing in most programs, because there's no item to return. For decades these fees were among a bank's largest consumer revenue lines, they fell by half in four years, and the federal rules around them were rewritten, repealed and withdrawn between 2022 and 2026. What remains is a small set of durable rules (an opt-in for card overdrafts, disclosures, a balance shown without the overdraft cushion) and a body of supervisory and litigation history about which balance a fee decision may use.

Overdraft is credit that the lending rules mostly don't treat as credit. Regulation Z excludes from the finance charge "charges imposed by a financial institution for paying items that overdraw an account, unless the payment of such items and the imposition of the charge were previously agreed upon in writing", so a discretionary overdraft program isn't a loan for Truth in Lending purposes. An overdraft line of credit is, and is an open-end credit product in its own right.

## How the Platforms Do It

How institutions handle overdrafts, from the CFPB's April 2024 survey of bank policy changes and the institutions' own pages as of October 2026:

| Institution | Overdraft fee | NSF fee | Other features |
| --- | --- | --- | --- |
| **Capital One** | None. No-Fee Overdraft may pay checks, electronic payments and recurring card charges; ATM and one-time card transactions only on opt-in | None | Choice of auto-decline, an automatic transfer, or No-Fee Overdraft; eligibility needs deposits of at least $250 in two of the last three calendar months, so new accounts don't qualify |
| **Citibank** | Eliminated (CFPB survey) | Eliminated | |
| **Bank of America** | Cut to $10, and no overdraft fees on ATM withdrawals (CFPB survey) | Not listed among the survey's NSF changes | |
| **JPMorgan Chase** | Grace period to the end of the next day, and a $50 negative-balance cushion (CFPB survey) | Eliminated | |
| **Chime** (program on The Bancorp Bank and Stride Bank) | None. SpotMe covers card purchases, cash back and ATM withdrawals up to a limit that "starts at $20 and may go up to $200" | No fee for declined transactions | Needs $200 or more in qualifying direct deposits a month; the next deposit repays the negative balance automatically. Doesn't cover bill payments, transfers to other apps, or checks |
| **Dave** (ExtraCash on Evolve Bank & Trust) | "5% of each overdraft amount ($5 minimum)" for electronic transfers, per the April 2025 fee schedule | | ExtraCash is its own account, offered by the bank, with the fee charged per overdraft amount |

<!-- source-gap: bofa-nsf-status | missing | whether Bank of America charges NSF fees as of October 2026 (the CFPB's 2024 survey lists its overdraft changes but not an NSF change) | closes with: Bank of America's current deposit fee schedule or overdraft services page opened directly | checked: 2026-10-29 -->

The survey's other names show the range of what banks did in 2022 and 2023: TD Bank, Truist, U.S. Bank, PNC, Wells Fargo, Regions, USAA, M&T and others stopped charging NSF fees; several added next-day grace periods or $50 cushions; PNC and M&T limited overdraft fees to one a day; M&T, BMO Harris and Huntington cut fees to $15 and KeyBank to $20; USAA stopped charging overdraft fees on card and ATM transactions while keeping them on checks and ACH.

Three things stand out. **The NSF fee is nearly gone at large banks,** because charging a fee for refusing to pay is the hardest fee to defend. **The surviving overdraft fee is narrower:** cushions, grace periods and daily caps all reduce how often an overdraft becomes a fee, which is a configuration problem as much as a pricing one. **Fintechs replaced the fee with eligibility:** Chime's SpotMe and Capital One's No-Fee Overdraft both pay overdrafts only for customers with steady deposits, so the program's risk model is the deposit history, and Dave prices its version as a percentage rather than a flat fee.

## The Money

Banks with assets over $1 billion have reported overdraft and NSF fee revenue in their call reports since 2015, so the trend is public. In the CFPB's April 2024 Data Spotlight, combined revenue was **$5.83 billion in 2023**, down 51% from **$11.96 billion in 2019** and 24% below the $7.61 billion of 2022. Revenue was flat across the quarters of 2023, which the CFPB read as the 2022 policy changes having run their course. The data excludes banks at or under $1 billion and all credit unions. That spotlight is the most recent edition of the series I found; the call report data it comes from is the place to recompute the trend.

The shift moved the business model rather than ending it. A program that doesn't charge overdraft fees still lends on overdrafts; it prices the risk through eligibility and limits, and earns on interchange and deposits instead, which is the Neobanks & Consumer Fintech story for programs whose bank is under $10 billion in assets.

## The Product Lines

Four ways a bank covers an item the balance can't:

| Product | What happens | Which law treats it |
| --- | --- | --- |
| **Discretionary overdraft** | The bank pays the item at its discretion and may charge a per-item fee; the balance goes negative and is due back promptly | Regulation E's opt-in for ATM and one-time debit card transactions; Regulation DD's disclosures; not a finance charge unless agreed in writing |
| **Linked account transfer** | Money moves automatically from the customer's savings or another account; sometimes a transfer fee | Not an "overdraft service" under Regulation E |
| **Overdraft line of credit** | A Regulation Z credit line covers the shortfall and accrues interest | Truth in Lending, open-end credit |
| **Return** | The bank refuses the check or ACH debit and sends it back with an NSF reason | Regulation DD's returned-item fee totals; the payee's rail decides what happens next |

The decision for each item is a policy, with inputs the system has to record: the balance it used, the customer's opt-in status, the product's fee schedule and caps, any cushion or grace, and the item's type. A card authorization is decided in milliseconds at the switch ([Issuer Processing](/books/payments/issuer-processing#the-checks-in-order)); a check or ACH debit is decided during posting, often in a batch.

## The Opt-In

Regulation E's overdraft rule (12 CFR 1005.17) applies to ATM withdrawals and **one-time** debit card transactions, not recurring card payments, checks or ACH. A bank may not charge a fee for paying one of those into overdraft unless it has:

- given the consumer a notice, segregated from other information and substantially similar to Model Form A-9, describing the service, the fees (including any daily maximum), and any alternatives such as a line of credit or linked transfer;
- given a reasonable opportunity to opt in;
- obtained the consumer's **affirmative consent**; and
- sent written or electronic confirmation of the consent, including the right to revoke it.

Three rules shape the account around it. The bank can't condition paying checks, ACH or other items on the card opt-in, or decline them because the customer didn't opt in. A customer who doesn't opt in gets the same account terms, conditions and features as one who does, apart from the card overdraft service itself. And either owner of a joint account can opt in, and either can revoke; revocation takes effect "as soon as reasonably practicable". For accounts opened since July 1, 2010, consent comes before the first fee.

The CFPB's Circular 2024-05 on improper opt-in practices was among the guidance documents the Bureau withdrew on May 12, 2025, a withdrawal it said "is not necessarily final". The rule itself is untouched, and the proof it demands is the same: the bank must be able to show, for any fee on an ATM or one-time card overdraft, the consent record that was in force at that moment.

## Disclosure and the Balance Shown

Regulation DD adds three requirements for any account that can incur these fees:

- **Statement totals.** Each periodic statement shows "Total Overdraft Fees" and total returned item fees, separately, for the statement period and the calendar year to date, near the itemized fees, in a format like Sample Form B-10.
- **Advertising.** An ad that promotes paying overdrafts discloses the fee, the transaction types that trigger it, the time the consumer has to repay, and the circumstances in which the bank won't pay. Broadcast, billboard and some other media are exempt.
- **The balance shown.** A balance shown through an automated system (online, app, ATM, phone) may not include the overdraft amount the bank might pay, from a discretionary program, a credit line or a linked account. A bank may also show a second balance including those amounts, if it says prominently that it does and, where it applies, that some transactions won't be covered.

The balance rule is a design rule for every app. The number at the top of the screen is the available balance without the cushion; a program that advertises "$200 of SpotMe" shows it as a separate figure, never folded into the spendable balance.

## Which Balance Decides

Banks keep at least two balances. The **ledger balance** is the sum of posted transactions. The **available balance** is the ledger balance plus deposits that are available under the bank's funds availability policy, minus pending debits such as card holds ([Funds Availability](/books/banking-and-lending/funds-availability#how-the-core-implements-it)). Fee decisions made on the available balance can charge a customer twice for one shortfall, and the clearest case has a name: **authorize positive, settle negative (APSN)**.

A debit card purchase is authorized when the available balance covers it, and the hold reduces the available balance at once. Other items post before the purchase settles, and when it does settle, days later, the balance is negative, partly because the purchase's own hold was already counted. A bank that charges an overdraft fee at settlement charges for a transaction it approved against money that was there.

The supervisory record on APSN, as of October 2026:

- **CFPB Circular 2022-06** (October 2022) said such fees can be unfair and explained the double-counting mechanics. It was withdrawn with the other guidance documents on May 12, 2025.
- **OCC Bulletin 2023-12** (April 26, 2023) on overdraft protection programs flags APSN fees, multiple re-presentment fees, high or no daily fee limits and recurring fees for an uncured negative balance as heightened-risk practices. The OCC page still carries it, with only its references to reputation risk removed as of March 20, 2025.
- **FDIC FIL-19-2023** (April 26, 2023) is supervisory guidance on charging overdraft fees for APSN transactions. I couldn't confirm whether it is still in force: the FDIC's 2026 rescission of re-presentment guidance doesn't mention it. <!-- source-gap: fdic-fil-19-2023-status | status | whether FDIC FIL-19-2023 (APSN overdraft fee guidance, April 26, 2023) remains in effect as of October 2026 | closes with: the FDIC financial institution letters page for FIL-19-2023, or a 2025-26 FIL rescinding it | checked: 2026-10-29 -->

The guidance moved; the litigation risk and the arithmetic didn't. My rule: decide a card transaction's overdraft status once, at authorization, against the available balance at that moment, record the decision on the hold, and never assess a fee at settlement for a transaction authorized against a positive balance. Posting order matters for the same reason. Processing the largest debits first maximizes the number of overdrafts, which made it the subject of a generation of class actions, covered in Posting, Holds & Balances; the posting order a product uses is a disclosed, fixed rule, and a fee decision never depends on an ordering chosen to produce it.

## Re-Presentment

When an ACH debit or a check comes back for insufficient funds, the payee may present it again. Nacha's rules let an originator reinitiate an entry returned for insufficient funds at most twice, marked `RETRY PYMT`, and collect a disclosed return fee as its own entry ([Returns: When Money Is Really Yours](/books/payments/ach#returns-when-money-is-really-yours), [After a Return: Fees and Blocks](/books/payments/ach#after-a-return-fees-and-blocks)). If the bank charges an NSF fee each time, one unpaid bill produces three fees.

- **FDIC:** issued guidance on multiple re-presentment NSF fees in 2022 (FIL-40-2022), replaced it with FIL-32-2023 in June 2023, and rescinded that, effective immediately, on April 10, 2026 (FIL-14-2026), calling it "overly broad in scope".
- **OCC:** Bulletin 2023-12 still lists re-presentment fees as a heightened-risk practice.
- **CFPB:** Bulletin 2022-06 on returned deposited item fees (charging the depositor when a check they deposited bounces) was also among the May 2025 withdrawals.

Whatever the guidance, the system needs one capability: recognize a re-presented item as the same item. Match it to the original by the payee's identifiers and amount (the ACH company ID, the check's serial number, the trace data), and apply a single, disclosed fee policy to the series instead of a fresh decision each time.

## The 2024 Rule and Its Repeal

The CFPB's "Overdraft Lending: Very Large Financial Institutions" final rule was issued December 12, 2024 and published at 89 FR 106768 on December 30, 2024 (docket CFPB-2024-0002, RIN 3170-AA42), effective October 1, 2025. It would have applied to banks and credit unions with $10 billion or more in assets, and given them three ways to charge for overdrafts: a fee of $5, a higher fee justified by the institution's own costs and losses, or treating the overdraft as credit under Regulation Z with its disclosures and protections.

It never took effect. Congress disapproved it under the Congressional Review Act in S.J.Res. 18, signed May 9, 2025 as Public Law 119-10. Under the Act the CFPB can't issue a rule in "substantially the same form" without new legislation. Two weeks after the rule was published, on January 14, 2025, the CFPB also withdrew its January 2024 proposal to ban fees on transactions declined instantaneously at the point of sale, saying it would consider a broader approach. As of October 2026 no federal rule caps overdraft or NSF fees; what binds is Regulation E's opt-in, Regulation DD's disclosures, unfair and deceptive practice law, and state law.

For a builder the useful residue is the rule's design. A $5 cap or a cost-justified breakeven fee are both parameters a product configuration can hold, and "treat overdraft as credit" is an overdraft line of credit with the account. Banks that priced overdrafts to the rule in 2025 kept the capability after the repeal.

## Worked Numbers: Two Fees for One Shortfall

A checking account starts Monday with a ledger and available balance of $100. The customer has opted in to card overdrafts. The bank charges $35 per overdraft item.

| Day | Event | Ledger | Available | Fee under APSN practice | Fee if decided at authorization |
| --- | --- | --- | --- | --- | --- |
| Mon | Card purchase of $60 authorized; hold placed | $100 | $40 | | Authorized against a positive balance: no fee, ever |
| Tue | ACH debit of $80 presented and paid | $20 | −$40 | $35: the ACH item overdraws the available balance | $35 |
| Wed | The $60 purchase settles; hold replaced by the posted debit | −$40 | −$40 | $35: the purchase now settles against a negative balance | None |
| | **Total fees** | | | **$70** | **$35** |

The customer was short $40 once. Under the APSN practice they pay two fees, the second for a purchase the bank approved when the money was there, and the purchase's hold was the reason the ACH debit looked like an overdraft in the first place. Deciding at authorization, the $60 purchase carries a recorded "authorized positive" flag that the settlement step honors, and the statement's "Total Overdraft Fees" for the period reads $35.00.

Change one parameter at a time and the fee changes again:

- **A $50 cushion** (the JPMorgan Chase practice in the CFPB's survey): the account is only $40 negative, so neither item produces a fee.
- **A next-day grace period:** a deposit of $40 or more before the end of Wednesday cures the shortfall and the Tuesday fee is waived.
- **The bank decides on the ledger balance** at posting: Tuesday's ledger balance before the ACH is $100, so the $80 debit doesn't overdraw it, and the settlement on Wednesday does, for one $35 fee on the card purchase; that fee needs the card opt-in, which this customer gave.
- **The 2024 rule's $5 option,** had it survived, for a bank over $10 billion: $5 per item.

The point isn't the right fee. It's that the fee is a function of the balance chosen, the time of the decision, the cushion, the grace, the opt-in and the posting order, and every one of those has to be stored with the decision, because a regulator or a plaintiff will recompute it.

## How to Build It

These are deltas against [the core data model](/books/banking-and-lending/banking-business#the-core-data-model). `fee_assessments` already records each fee; overdraft adds the consent, the decision behind each item, and the product's fee policy as data:

```sql
CREATE TABLE overdraft_consents (            -- Reg E 1005.17: ATM and one-time debit card only
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id       UUID NOT NULL REFERENCES accounts (id),
  party_id         UUID NOT NULL REFERENCES parties (id),     -- either joint owner may consent or revoke
  notice_id        UUID NOT NULL REFERENCES disclosures (id), -- the A-9 notice version shown
  consented_at     TIMESTAMPTZ NOT NULL,
  channel          TEXT NOT NULL CHECK (channel IN ('online', 'app', 'phone', 'branch', 'mail')),
  confirmation_id  UUID REFERENCES disclosures (id),          -- written or electronic confirmation
  revoked_at       TIMESTAMPTZ,
  revoked_by       UUID REFERENCES parties (id)
);

CREATE TABLE overdraft_decisions (           -- one per item that would overdraw
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  item_kind           TEXT NOT NULL CHECK (item_kind IN ('card_one_time', 'card_recurring', 'atm',
                                         'ach_debit', 'check', 'p2p', 'fee', 'other')),
  item_ref            UUID NOT NULL,          -- the hold, transaction or presented item
  presentment_of      UUID REFERENCES overdraft_decisions (id),  -- re-presentment of an earlier item
  decided_at          TIMESTAMPTZ NOT NULL,
  balance_basis       TEXT NOT NULL CHECK (balance_basis IN ('available', 'ledger')),
  balance_at_decision BIGINT NOT NULL,
  authorized_positive BOOLEAN,                -- card items: the flag settlement must honor
  outcome             TEXT NOT NULL CHECK (outcome IN ('paid', 'returned', 'declined', 'covered_by_transfer',
                                         'covered_by_line', 'covered_by_program')),
  consent_id          UUID REFERENCES overdraft_consents (id),
  policy_version      TEXT NOT NULL,          -- fee schedule, cushion, grace, caps in force
  fee_assessment_id   UUID REFERENCES fee_assessments (id),
  CHECK (item_kind NOT IN ('card_one_time', 'atm') OR fee_assessment_id IS NULL OR consent_id IS NOT NULL)
);
```

The last constraint is the opt-in rule as a constraint: no fee on an ATM or one-time card overdraft without the consent in force. The fee policy itself (fee per item, daily cap, cushion, grace window, minimum overdraft before a fee, whether NSF fees exist at all) is versioned product configuration, and a grace-period cure is a waiver posted against the original `fee_assessments` row, never a deleted fee. A program like SpotMe or ExtraCash is `outcome = 'covered_by_program'` with its own limit and repayment from the next deposit, and the balance the app shows comes from the Regulation DD rule above, with the program's limit as a separate field. The availability engine's late-notice flag ([How to Build It](/books/banking-and-lending/funds-availability#how-to-build-it)) suppresses fees caused by a hold whose notice wasn't given at deposit.

## Auditing

Overdraft programs are examined for unfair and deceptive practices and for Regulation E and DD compliance, and they're the subject of class actions that recompute fees account by account. Keep:

- **Every consent and revocation,** with the notice version, the channel, the confirmation sent, and the moment each took effect ([Typed Actors](/docs/architecture/audit-trails#typed-actors) for who acted).
- **Every overdraft decision with its inputs:** balance basis and value, the authorization flag, consent in force, policy version, outcome and fee, so any fee can be recomputed exactly.
- **Posting order** applied to each day's items, as a recorded rule version, not an emergent property of a batch job.
- **Waivers and refunds,** with who granted them and why, linked to the original fee.
- **Statement totals:** the "Total Overdraft Fees" and returned item figures as printed, reconcilable to the fee rows.
- **Ads and in-app balance displays** for overdraft programs, by version and date.

## What This Means for the System You Build

- **The fee decision is a recorded function of its inputs:** balance basis, decision time, consent, cushion, grace, caps and posting order.
- **Card transactions are judged at authorization,** and an item authorized against a positive balance never draws a fee at settlement.
- **The opt-in is enforced in the schema,** not in a code path someone can bypass.
- **Re-presented items are linked to the original,** and one disclosed policy governs the series.
- **The displayed balance excludes overdraft coverage;** a program's limit is shown as its own number.
- **Fee rules are versioned configuration,** so a cap, a cushion or a regulator's next rule is a new version, not a rewrite.

## References

**Law and regulation**

- [12 CFR 1005.17: Requirements for overdraft services](https://www.law.cornell.edu/cfr/text/12/1005.17), the opt-in for ATM and one-time debit card overdrafts, no conditioning, same terms, joint accounts and revocation
- [12 CFR 1030.11: Additional disclosures regarding overdraft services](https://www.law.cornell.edu/cfr/text/12/1030.11), statement totals, overdraft advertising and the balance shown by automated systems
- [12 CFR 1026.4: Finance charge](https://www.law.cornell.edu/cfr/text/12/1026.4), overdraft charges excluded unless agreed in writing
- [GovInfo: Public Law 119-10](https://www.govinfo.gov/app/details/PLAW-119publ10), the joint resolution disapproving the overdraft rule, approved May 9, 2025, 139 Stat. 53

**Regulators and guidance**

- [CFPB: Overdraft Lending: Very Large Financial Institutions](https://www.consumerfinance.gov/rules-policy/final-rules/overdraft-lending-very-large-financial-institutions/), issued December 12, 2024, 89 FR 106768, docket CFPB-2024-0002, RIN 3170-AA42, effective date October 1, 2025
- [Congressional Research Service: Congress repeals the CFPB's overdraft rule (IN12513)](https://www.everycrsreport.com/reports/IN12513.html), the rule's three options and $10 billion threshold, S.J.Res. 18 and H.J.Res. 59, the "substantially the same form" bar
- [Federal Register: Interpretive Rules, Policy Statements, and Advisory Opinions; Withdrawal (90 FR 20084, May 12, 2025)](https://www.federalregister.gov/documents/2025/05/12/2025-08286/interpretive-rules-policy-statements-and-advisory-opinions-withdrawal), Circulars 2022-06 and 2024-05 and Bulletin 2022-06 among the withdrawn documents
- [CFPB: Circular 2022-06, Unanticipated overdraft fee assessment practices](https://www.consumerfinance.gov/compliance/circulars/consumer-financial-protection-circular-2022-06-unanticipated-overdraft-fee-assessment-practices/), the APSN mechanics and the available and ledger balances, since withdrawn
- [Federal Register: Fees for Instantaneously Declined Transactions; Withdrawal of Proposed Rule (January 14, 2025)](https://www.federalregister.gov/documents/2025/01/14/2024-31385/fees-for-instantaneously-declined-transactions-withdrawal-of-proposed-rule), the 2024 NSF proposal withdrawn
- [OCC: Bulletin 2023-12, Overdraft Protection Programs: Risk Management Practices](https://occ.gov/news-issuances/bulletins/2023/bulletin-2023-12.html), APSN and re-presentment fees as heightened-risk practices, reputation risk references removed March 20, 2025
- [FDIC: FIL-14-2026, rescinding supervisory guidance on multiple re-presentment NSF fees](https://www.fdic.gov/news/financial-institution-letters/2026/fdic-rescinds-supervisory-guidance-multiple-re-presentment), April 10, 2026, rescinding FIL-32-2023
- [CFPB: Data Spotlight, overdraft/NSF revenue in 2023](https://www.consumerfinance.gov/data-research/research-reports/data-spotlight-overdraft-nsf-revenue-in-2023-down-more-than-50-versus-pre-pandemic-levels-saving-consumers-over-6-billion-annually/), $5.83 billion in 2023 against $11.96 billion in 2019, the reporting threshold, and the banks' policy changes

**Vendor documentation**

- [Capital One: 360 Checking overdraft options](https://www.capitalone.com/bank/overdraft-options/), auto-decline, automatic transfer and No-Fee Overdraft, opt-in for ATM and one-time card, and the deposit eligibility rule
- [Chime: SpotMe](https://www.chime.com/spotme/), the $20 to $200 limit, the $200 direct deposit requirement, covered and excluded transactions, and repayment from the next deposit
- [Dave: ExtraCash account fee schedule](https://dave.com/extra-cash/fees/12), the 5% overdraft fee with a $5 minimum, Evolve Bank & Trust, effective April 22, 2025

**In practice**

- [ICBA: FDIC rescinds guidance update on re-presentment fees](https://independentbanker.org/w/fdic-rescinds-guidance-update-on-re-presentment-fees), the April 2026 rescission and its reasoning
- [Jones Walker: Compliance update, May 2023](https://joneswalker.com/en/insights/compliance-update-insights-and-highlights-may-2023.html), FDIC FIL-19-2023 on APSN overdraft fees, issued April 26, 2023
- [Consumer Finance Monitor: Trump signs resolution nullifying CFPB overdraft rule](https://www.consumerfinancemonitor.com/2025/05/12/trump-signs-resolution-nullifying-cfpb-overdraft-rule/), the signing
