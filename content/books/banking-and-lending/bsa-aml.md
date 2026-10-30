+++
title = "BSA/AML Programs"
description = "The bank's anti-money laundering program: its pillars, monitoring, alerts and cases, SARs and CTRs, structuring, 314(a) and (b), the 2026 proposal, enforcement."
category = "Banking & Lending Industry"
order = 2421
part = "Financial Crime"
tags = ["banking", "bsa", "aml", "sar", "ctr", "transaction-monitoring", "enforcement"]
+++

A bank is required to watch its customers' money for crime and tell the government what it sees. The Bank Secrecy Act and FinCEN's rules under it turn that into a program with named parts (internal controls, independent testing, a responsible officer, training, customer due diligence), two report types every engineer in a bank meets sooner or later (the suspicious activity report and the currency transaction report), recordkeeping rules for cash and wires, and two information-sharing channels. None of it is optional, none of it can be contracted away to a fintech, and the penalties for doing it badly are the largest in banking: TD Bank's 2024 resolution brought penalties from four agencies, a guilty plea and a cap on the bank's growth.

The engineering is harder than the rules. A monitoring system has to see every transaction on every rail, in a form that can be aggregated by customer across accounts and days; alerts have to become cases with owners, evidence and decisions; SARs have deadlines that start at a judgment, not a timestamp; and the whole thing is confidential in a way most software isn't, because telling a customer, or letting a support tool show, that a SAR exists is itself a violation. The enforcement record of the last two years is mostly a record of coverage gaps (rails and products nobody monitored), backlogs (alerts nobody worked) and growth that outran controls.

This chapter is the bank's program: its parts and the 2026 proposal to redefine them, the customer risk profile, monitoring, alerts and cases, SARs, CTRs and structuring, funds transfer records, 314(a) and 314(b), and the enforcement cases engineers should read. Who verifies the customer at opening is [KYC & Account Opening](/books/banking-and-lending/kyc-and-account-opening); sanctions, which are strict liability and run on different rules, are [Sanctions Screening](/books/banking-and-lending/sanctions-screening). The payment provider's version (an MSB's program, transaction laundering, merchant monitoring) is in [Operating the Platform](/books/payments/operating-the-platform#compliance-operations) and [Gatekeeping: Sanctions, AML and Losses](/books/payments/becoming-a-payment-provider#gatekeeping-sanctions-aml-and-losses).

## How the Platforms Do It

What BaaS platforms and monitoring vendors publish about who runs monitoring in a bank-fintech program, as of October 2026:

| Platform | Role | What it publishes |
| --- | --- | --- |
| **Alloy** | Identity and fraud decisioning | An Events API for post-onboarding monitoring, and case management alongside its onboarding workflows |
| **Synctera** | BaaS platform | "Synctera AML" for transaction monitoring, case management and report filing; rules that "reflect the bank's risk appetite and policies"; AML cases created automatically from rule hits, moving from New to In Review and then closed as expected activity or escalated to the bank; the bank reviews the AML scenarios before launch; the fintech meets KYC requirements and bears fraud losses |
| **Treasury Prime with Unit21** | BaaS platform with a monitoring and case management vendor | "The bank as the regulated entity assumes the transaction monitoring responsibility" but can delegate "adjudication of certain alerts and rules" to the fintech, which can use preconfigured rules or write its own; transactions posting to the ledger flow to the monitoring system; case management that automates SAR filing work |

Three things stand out. **The bank owns the program and the SAR decision; the fintech works alerts.** Every platform puts the rules under the bank's approval and the escalation path ending at the bank, with the fintech as first-level reviewer. That matches the regulators' view that a bank's program can use third parties but remains the bank's ([Who Does What in a Program](#who-does-what-in-a-program)). **Monitoring reads the ledger.** Treasury Prime's integration feeds Unit21 from posted ledger transactions; a monitoring system that reads anything less than every posted transaction on every rail is the TD Bank failure waiting to happen. **The case has two exits,** closed with a reason or escalated, and the case history is the record. I have not found a BaaS platform that publishes its SAR filing split in more detail than this, so a program's agreement is where the line is drawn.

## The Program

The bank's AML program rule (31 CFR 1020.210) requires a written program approved under the bank's federal functional regulator's rules, with:

1. **Internal controls** "to assure ongoing compliance": the policies, procedures, systems and staffing that do the work.
2. **Independent testing** by bank personnel or an outside party, which is the audit that samples cases, tests monitoring coverage and validates the models.
3. **A designated individual or individuals** responsible for coordinating and monitoring day-to-day compliance: the BSA officer.
4. **Training** for appropriate personnel.
5. **Risk-based customer due diligence,** including understanding the nature and purpose of customer relationships to build a customer risk profile, and ongoing monitoring to identify and report suspicious transactions and update customer information.

These are the "five pillars" in compliance shorthand. Each one is something software makes provable or not: controls are rules, thresholds and workflows with versions; testing reads the records; the officer's authority shows up as who can change a rule and who decides a SAR; training records are data; CDD is the risk profile and the monitoring that compares activity to it.

### The 2026 program proposal

On April 10, 2026 FinCEN proposed a rewrite of the program rule for all financial institutions (91 FR 18704, docket FINCEN-2026-0034, comments closed June 9, 2026). It says the July 2024 proposal "should be considered withdrawn and superseded." As proposed:

- **An effective program** is one established under the rule and maintained, meaning "implemented in all material respects."
- **A risk assessment process** becomes an explicit component: risk-based internal policies, procedures and controls that evaluate money laundering and terrorist financing risks, incorporate FinCEN's AML/CFT Priorities "as appropriate," and are updated promptly after significant changes, with more attention and resources for higher-risk customers and activities.
- **The AML/CFT officer** must be located in the United States; training and independent testing remain; ongoing CDD moves under internal controls.
- **The board** (or an equivalent body or appropriate senior management) approves the written program.
- **Supervision changes shape:** the banking agencies would consult FinCEN before a "significant AML/CFT supervisory action," with 30 days' written notice, and enforcement for implementation failures would be limited to "significant or systemic" ones. The proposal "does not reference or require the use of any particular technology" and says responsible innovation won't by itself add risk of a significant supervisory action.
- **Effective date:** 12 months after a final rule is issued.

As of October 2026 there is no final rule; the current rule above is what examiners apply. For a system the proposal mostly raises the bar on evidence that the risk assessment drives the controls: which risks each monitoring scenario addresses, and what changed in the controls after the risk assessment changed.

## Who Does What in a Program

A fintech program on a sponsor bank's charter has three parties touching the program, and one owner of it:

| Task | Usually performed by | Owned by |
| --- | --- | --- |
| CIP and KYC at opening | Fintech, to the bank's CIP | Bank |
| Monitoring rules and thresholds | Platform or vendor, configured jointly | Bank (approves) |
| Level 1 alert review | Fintech or platform | Bank |
| Investigation and SAR decision | Bank's BSA team | Bank |
| SAR filing | Bank | Bank |
| CTRs | Bank, or platform on its behalf | Bank |
| 314(a) searches | Bank, across program data | Bank |
| Account restriction or closure after a decision | Fintech, on the bank's instruction | Bank |

The pattern is in the platforms' own descriptions above. A fintech may see a SAR's existence only as the bank's agent and only as far as the bank's procedures allow, which is why SAR confidentiality is an access-control requirement on the fintech's systems too ([Confidentiality](#confidentiality)). How a sponsor bank tests its programs and what the 2024 to 2026 consent orders found is Sponsor Bank Oversight's subject.

## The Customer Risk Profile

CDD requires understanding the nature and purpose of each relationship well enough to build a **customer risk profile**, which is what monitoring compares activity against. In data terms it is:

- **The inputs:** product, stated purpose and expected activity (monthly volume, cash, international wires), occupation or industry, geography, channel, ownership structure, and screening results (PEP, adverse media).
- **A rating** (low, medium, high, or a score) from a versioned methodology, with the factors that drove it.
- **Its triggers for refresh:** an alert, a SAR, a change in owners or activity, a 314(a) match, a periodic review for higher ratings.

Enhanced due diligence for high-risk customers (source of funds, more documents, senior approval, more frequent review) is the same object with more inputs; [Merchant Onboarding](/books/payments/merchant-onboarding#know-who-you-re-paying) covers EDD and PEPs for a provider, and the bank's version differs only in who examines it. The profile must be computed, versioned and explainable: an examiner asks why this customer is "medium", and the answer is the inputs and the methodology version, not a person's memory.

## Transaction Monitoring

The FFIEC's BSA/AML manual describes two kinds of monitoring, often used together. **Manual transaction monitoring** reviews reports from the bank's systems: currency activity, funds transfers, monetary instrument sales, large items, significant balance changes, ATM and NSF reports, filtered by thresholds management sets. **Surveillance monitoring** runs rules or adaptive models over transactions "directly from the bank's core data processing system": **rule-based systems** apply many overlapping rules and filters, often a broad rule for all accounts and a refined one for a segment; **intelligent systems** compare activity with the customer's own history and with a peer group.

What the manual expects, in engineering terms:

- **Thresholds are designed against typologies.** Its example: a structuring filter that triggers only on a daily cash total over $10,000 misses structuring, which "often involve[s] transactions that are slightly under the CTR threshold." Reports should catch currency between, say, $7,000 and $10,000, and small amounts ($3,000) that aggregate over a period (15 days) to a large sum ($30,000).
- **Filters are reviewed before implementation and tested periodically.** Management documents the criteria and thresholds, can explain why they fit the bank's risks, and has them "independently validated to ensure that the models are detecting potentially suspicious activity."
- **Access to change profiles and rules is limited,** with changes generally approved by the BSA officer or senior management.
- **Expected activity comes from what's reasonable for the account type,** not only the account's own history, because history can itself be suspicious.

The rule I'd add from the enforcement record: **coverage is a control in its own right.** Measure, every day, the share of posted transactions by rail and product that reached the monitoring system, and alert on any rail at zero. TD Bank "intentionally did not automatically monitor all domestic automated clearinghouse (ACH) transactions, most check activity, and numerous other transaction types," and launched Zelle "without ensuring appropriate transaction monitoring coverage" ([TD Bank, 2024](#td-bank-2024)). Every new rail, product or program is a monitoring change before it is a launch.

Typical scenarios, each a versioned rule with its parameters: cash structuring and funnel accounts (deposits in one place, withdrawals elsewhere), rapid movement of funds (in and out within days), round-dollar and just-below-threshold patterns, P2P volume inconsistent with the profile, many senders to one receiver (mule collection), high-risk geographies, dormant accounts that suddenly move money, and activity after a decision to close. Payments' monitoring patterns for merchants are in [Compliance Operations](/books/payments/operating-the-platform#compliance-operations).

## Alerts and Cases

The FFIEC manual's five components of a monitoring and reporting system are the workflow:

1. **Identification or alert of unusual activity,** from employees, law enforcement inquiries (subpoenas, National Security Letters, 314(a) requests), other referrals and monitoring systems.
2. **Managing alerts:** a defined escalation path "from the point of initial detection to disposition," adequate trained staff, and research tools (account systems, CDD and EDD information, media searches), with conclusions documented.
3. **SAR decision making** by an individual or committee with authority to make the final decision.
4. **SAR completion and filing.**
5. **Monitoring and SAR filing on continuing activity.**

In software that is alerts (machine or human generated) grouped into cases (one subject, possibly many alerts), each case with an owner, evidence, a decision and its reason. Two details matter more than they look:

- **Group by subject, not by alert.** An investigator decides about a customer's activity, which may span several accounts, programs and alerts; a case per alert multiplies work and splits the evidence. Alerts attach to an open case for the same subject.
- **Fraud and AML talk to each other.** The manual expects lines of communication between BSA and fraud departments where both research unusual activity. A fraud claim on a mule account ([Account Takeover & Scams](/books/banking-and-lending/account-takeover-and-scams#mules-and-the-receiving-side)) is an AML referral.

**Documenting a no-file decision.** The October 9, 2025 interagency SAR FAQs say there is "no requirement or expectation" to document a decision not to file, and that where an institution chooses to, "a short, concise statement" will usually suffice. Examiners still review individual SAR decisions to test the process, and the manual says a bank that followed its process "should not be criticized for the failure to file a SAR unless the failure is significant or accompanied by evidence of bad faith." My default is to keep the short statement anyway: it costs one sentence and is the only way to show the process was followed.

**Backlogs are findings.** New York's Department of Financial Services found in April 2025 that Block's "rapid growth in 2019 and 2020 caused a severe transaction alert backlog" left unaddressed for a significant period. Alert inflow, age and staffing are metrics the BSA officer and the board see, and an aging alert is as much a control failure as a missing rule.

## Suspicious Activity Reports

A bank files a SAR for a transaction "conducted or attempted by, at, or through the bank" that involves or aggregates at least $5,000 and that the bank knows, suspects or has reason to suspect involves funds from illegal activity, is designed to evade the BSA, or has no apparent lawful purpose and no reasonable explanation after examining the facts (31 CFR 1020.320). The banking agencies' own SAR rules (the OCC's at 12 CFR 21.11, for example) add the criminal-violation thresholds the FFIEC manual lists together:

| Activity | Threshold |
| --- | --- |
| Insider abuse (a director, officer, employee or agent) | Any amount |
| Criminal violation, suspect identified | $5,000 or more |
| Criminal violation, no suspect identified | $25,000 or more |
| Money laundering, BSA evasion, no apparent lawful purpose | $5,000 or more |

The rest of the rule, as the system must implement it:

- **Deadline:** within 30 calendar days after "initial detection of facts that may constitute a basis for filing." If no suspect is identified, the bank may take 30 more days to identify one, but never more than 60 days after initial detection. Ongoing violations needing immediate attention also get a phone call to law enforcement (and, at an OCC bank, the OCC).
- **Initial detection is a determination, not an alert.** The FFIEC manual says initial detection "should not be interpreted as meaning the moment a transaction is highlighted for review"; the clock starts when an appropriate review determines the activity is suspicious, and the review itself must be completed in a reasonable time. The system stores both times: when the alert fired, and when the investigator determined suspicion.
- **Continuing activity:** the agencies' long-standing suggestion was a SAR on continuing activity at least every 90 days, with a filing deadline 120 days after the prior SAR. The 2025 FAQs say a separate post-SAR review is not required, and give the timeline for institutions that choose to follow the guidance: Day 0 detection, Day 30 initial SAR, Day 120 end of the 90-day period, Day 150 continuing SAR (each 30 days later if the first SAR used the 60-day extension).
- **Board notification:** management promptly notifies the board or a committee of SAR filings (12 CFR 21.11(h)), in a format the bank chooses, and never notifies a director who is the suspect.
- **Retention:** each SAR and its supporting documentation for five years from filing; supporting documentation is deemed filed with the SAR and is produced to FinCEN, law enforcement or the bank's regulator on request without legal process.
- **Filing:** electronically through the BSA E-Filing System; a SAR may carry one CSV attachment of up to 1 MB of transactions, which is part of the narrative, not a substitute for it.
- **Safe harbor:** 31 USC 5318(g)(3) protects the bank and its people from civil liability for a SAR or other disclosure to the authorities, and for not telling the subject.

### Worked numbers: a SAR clock

An alert fires on October 1, 2026 for a customer whose account received 40 P2P credits from different senders in a week and sent the total out by wire. The investigator completes the review and determines the activity is suspicious on Thursday, October 15: that's Day 0.

- **SAR due:** 30 calendar days later, Saturday, November 14, 2026. The rule counts calendar days, so a team that files on business days files by Friday the 13th.
- **If no suspect could be identified** (the wires went to an account the bank can't attribute), the bank may take up to 30 more days, to Monday, December 14, and no later.
- **If the bank follows the continuing-activity guidance** and the activity continues after an initial SAR filed November 14: the 90-day period ends at Day 120, Friday, February 12, 2027, and the continuing SAR is due at Day 150, Sunday, March 14, 2027, covering the whole 90-day period.

October 1 is on the record as the alert time, and the 14 days between alert and determination are what "a reasonable period of time" has to cover. A system that started the 30 days at the alert would file early, which is harmless; one that started it at a case's "escalated" status, set days after the investigator's determination, files late.

### Confidentiality

A SAR, and "any information that would reveal the existence of a SAR," is confidential (31 CFR 1020.320(e)). The bank may not tell anyone involved in the transaction, must decline a subpoena for a SAR (citing the rule) and notify FinCEN and its regulator, and may share only as the rule allows: with FinCEN, law enforcement and regulators, with another institution for a joint SAR, within its corporate structure to a head office, controlling company or affiliate subject to a SAR rule, and in certain employment references. The manual notes that a US bank may not share SARs with its own foreign branches. The existence or non-existence of a SAR is itself confidential.

For systems this is the hardest requirement in the chapter:

- **SAR data lives in a restricted store** with its own access list, not in the case table customer support reads. The `cases` row for an AML investigation is visible to the BSA team; its SAR filing records are visible to fewer people still.
- **Downstream effects carry no reason.** When a SAR leads to restricting or closing an account, the customer-facing reason is a neutral code, and the support tool shows "restricted under policy," never "SAR filed." [Closing Accounts](/books/banking-and-lending/dormancy-and-escheat#closing-accounts) relies on this.
- **Analytics and logs inherit the restriction.** A warehouse table with a `sar_filed` flag joined to customer data is a disclosure risk; aggregate reporting to the board uses counts.
- **Fintech staff are agents with need-to-know,** under the bank's procedures, and the program's systems log every access ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).

## Currency Transaction Reports and Structuring

A bank files a **CTR** for each deposit, withdrawal, exchange or other payment or transfer "by, through, or to" it involving currency "of more than $10,000" (31 CFR 1010.311), within 15 days following the day of the transaction, and keeps a copy for five years (1010.306). Multiple currency transactions are treated as one if the bank knows they are by or on behalf of the same person and total more than $10,000 cash in or cash out in one business day, across all domestic branches; night and weekend deposits count toward the next business day (1010.313). The aggregation is per direction: $6,000 in and $6,000 out the same day is two sides of $6,000 each, and neither is reportable.

**Exemptions** (1020.315) let a bank stop filing CTRs on banks, government agencies, listed companies and their 51%-owned subsidiaries, and, after a customer has had a transaction account for at least two months (earlier with a documented risk-based assessment), on non-listed businesses and payroll customers that frequently transact in currency over $10,000. Many businesses are ineligible (financial services, vehicle sales, legal, accounting and medical practices, real estate brokerage, pawnbrokers and others, unless no more than 50% of revenue comes from them). The bank designates by filing FinCEN Form 110 within 30 calendar days after the first reportable transaction it exempts, reviews eligibility at least annually, and keeps monitoring the account: an exemption removes the CTR, never the SAR.

**Structuring** is conducting or attempting currency transactions "in any amount, at one or more financial institutions, on one or more days, in any manner, for the purpose of evading" CTR requirements (31 CFR 1010.100(xx)), and it is a crime under 31 USC 5324 whether or not the money is clean: up to five years, or ten with a twice-larger fine if it is part of other illegal activity or a pattern over $100,000 in a year. The October 2025 FAQs added a point systems should encode: a transaction or series "at or near the $10,000 CTR threshold is not information sufficient to require the filing of a SAR." What requires one is knowing or suspecting that the transactions are designed to evade. So a structuring rule produces alerts, not automatic SARs, and the investigator looks for the evasion: a customer who asks how to avoid the form, splits a deposit between tellers, or deposits $9,500 at three branches in a morning.

### Worked numbers: a CTR

On Monday, October 5, 2026 a customer deposits $6,000 in cash at one branch at 10:00 and $5,000 at another at 15:00; the bank's systems link both to the same customer. Aggregated: $11,000 cash in, one business day, more than $10,000: one CTR, due by October 20, 2026 (15 days following the day of the transaction). Had the second deposit been dropped in the night depository after Friday's close, it would count toward Monday's total instead. Had the customer deposited $9,000 on Monday and $9,000 on Tuesday, there's no CTR; whether there's a SAR depends on whether the bank has reason to suspect the split was to avoid one.

## Funds Transfers and the Travel Rule

For funds transfers of $3,000 or more, banks keep the originator's and beneficiary's details and the payment instructions, and the originator's and intermediary banks pass the originator's name, account number and address, the amount and date, and the beneficiary's details along with the order (31 CFR 1010.410, the "travel rule"). Records are kept five years and must be retrievable by name and, for established customers, by account number. Monetary instrument sales of $3,000 to $10,000 in currency have their own records. For systems this means every wire, and every book or instant transfer that the bank treats as a funds transfer, carries structured originator and beneficiary fields that monitoring and 314(a) searches can query; [Sanctions and Data on Cross-Border Flows](/books/payments/cross-border-and-fx#sanctions-and-data-on-cross-border-flows) covers the provider's side of the same rule.

## 314(a) and 314(b)

Section 314 of the USA PATRIOT Act created two information channels:

- **314(a): the government asks.** Law enforcement investigating terrorism or money laundering, through FinCEN, certifies a list of subjects with identifiers (31 CFR 1010.520). The bank searches its records for any current account of a subject, any account maintained in the preceding 12 months, and transactions and funds transmittals in the preceding six months, and reports matches (name, account number or transaction date and type, and the identifiers it holds) in the manner and timeframe the request specifies. The request is confidential; it doesn't require closing the account, and its information may be used only to report, to decide whether to open or keep an account or transaction, or for BSA compliance. The bank designates a point of contact.
- **314(b): banks share with each other.** A financial institution that files a notice with FinCEN (effective one year) and confirms the other party has filed one may share information to identify and report money laundering or terrorist activity, with a safe harbor from liability for the sharing (31 CFR 1010.540). It is how two banks on either end of a mule network compare notes.

A 314(a) search is a query across every program and every account the institution holds, including closed accounts within the lookback, which is a strong argument for the core data model's rule that every account carries its institution: a sponsor bank must be able to search all of its programs' customers at once. Mere receipt of a 314(a) request or subpoena does not by itself require a SAR, the FFIEC manual says, but it should prompt a review of the subject's activity.

## Enforcement Engineers Should Read

### TD Bank, 2024

On October 10, 2024 TD Bank, N.A. pleaded guilty to conspiring to fail to maintain an AML program, fail to file accurate CTRs and launder money, the first US bank to plead guilty to conspiracy to commit money laundering; its holding company pleaded guilty to related charges. It agreed to forfeit $452,432,302 and pay a criminal fine of $1,434,513,478.40 (about $1.89 billion) and retain a monitor for three years. FinCEN assessed a record $1.3 billion with a four-year monitorship, the OCC $450 million with a restriction on the bank's growth, and the Federal Reserve $123.5 million, with that amount of DOJ's forfeiture credited toward it. The facts from DOJ's release read like a monitoring postmortem:

- **92% of transaction volume, about $18.3 trillion, went unmonitored** from January 1, 2018 to April 12, 2024, because domestic ACH, most check activity and other transaction types were intentionally excluded from automated monitoring.
- **No new monitoring scenarios and no material changes to existing ones** from at least 2014 through late 2022, while Zelle and other products launched "without ensuring appropriate transaction monitoring coverage."
- **A budget rule**, the "flat cost paradigm", kept the AML budget from growing with the bank's risk.
- **More than $5 billion moved through accounts after the bank decided to close them.**
- **CTRs that didn't identify the conductor:** one network moved more than $470 million through large cash deposits while employees, given gift cards, left the person conducting the transaction off the reports. FinCEN adds that the bank failed to file SARs on transactions totaling about $1.5 billion.

Each bullet maps to a control in this chapter: coverage by rail, scenario review, staffing metrics, close-decision enforcement and CTR data quality.

### Block (Cash App), 2025

In January 2025, 48 state financial regulators fined Block $80 million over BSA/AML failures in customer due diligence, identity verification, suspicious activity reporting and controls for high-risk accounts, requiring an independent consultant's review within nine months and remediation within 12 months after it. In April 2025 New York's DFS added $40 million and a monitor, finding inadequate CDD, insufficient risk-based controls, lax treatment of high-risk bitcoin transactions, and the alert backlog from 2019 and 2020 growth. The superintendent's summary is the lesson: "Compliance functions must keep pace with company growth or expansion." Separately, the CFPB's January 2025 order over Cash App's handling of fraud disputes is in [Errors & Disputes on Deposit Accounts](/books/banking-and-lending/deposit-errors-and-disputes#how-the-platforms-do-it).

### Starling, 2024

The UK contrast. The FCA fined Starling Bank £28,959,426 on October 2, 2024 (£40,959,426 before a 30% settlement discount). After a 2021 review of challenger banks, Starling had agreed not to open accounts for high-risk customers until its controls improved; it opened more than 54,000 accounts for about 49,000 high-risk customers between September 2021 and November 2023. Its automated sanctions screening had, since 2017, checked customers against only a fraction of the full list, which it discovered in January 2023. Customers grew from about 43,000 in 2017 to 3.6 million in 2023, and its financial crime measures "did not keep pace with its growth." Two engineering lessons: a restriction agreed with a regulator is a control that must be enforced in the onboarding code, and a screening list feed needs a completeness check ([Sanctions Screening](/books/banking-and-lending/sanctions-screening#lists-and-list-management)).

## How to Build It

These are deltas against [the core data model](/books/banking-and-lending/banking-business#the-core-data-model) and the case deadlines of [Errors & Disputes on Deposit Accounts](/books/banking-and-lending/deposit-errors-and-disputes#how-to-build-it). An investigation is a `cases` row with `kind = 'aml_investigation'`; its SAR clock is a `case_deadlines` row; the SAR itself lives in a restricted schema.

```sql
-- The customer risk profile: versioned, explainable, refreshed on triggers.
CREATE TABLE customer_risk_profiles (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id            UUID NOT NULL REFERENCES parties (id),
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  methodology_version TEXT NOT NULL,
  rating              TEXT NOT NULL CHECK (rating IN ('low', 'medium', 'high', 'prohibited')),
  factors             JSONB NOT NULL,         -- each input and its contribution
  expected_activity   JSONB NOT NULL,         -- monthly volume, cash, wires, countries, as stated
  edd_required        BOOLEAN NOT NULL DEFAULT FALSE,
  trigger             TEXT NOT NULL,          -- 'onboarding', 'alert', 'periodic', 'owner_change', '314a'
  next_review_due     DATE,
  valid_during        TSTZRANGE NOT NULL
);

-- Monitoring scenarios as versioned rules, each tied to a risk it addresses.
CREATE TABLE monitoring_rules (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  program_id          UUID REFERENCES programs (id),   -- null: bank-wide
  code                TEXT NOT NULL,          -- 'CASH_STRUCT_15D', 'P2P_FAN_IN_7D', ...
  version             INT NOT NULL,
  typology            TEXT NOT NULL,          -- the risk assessment entry it covers
  rails               TEXT[] NOT NULL,        -- 'cash', 'ach', 'wire', 'check', 'p2p', 'card', 'book'
  parameters          JSONB NOT NULL,         -- thresholds, windows, segments
  approved_by         TEXT NOT NULL,          -- the BSA officer or delegate
  validated_ref       TEXT,                   -- the independent validation that covered it
  valid_during        TSTZRANGE NOT NULL,
  UNIQUE (institution_id, code, version)
);

CREATE TABLE alerts (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  source              TEXT NOT NULL CHECK (source IN ('rule', 'model', 'employee', 'law_enforcement',
                        '314a', '314b', 'fraud_referral', 'other')),
  rule_id             UUID REFERENCES monitoring_rules (id),  -- the exact version that fired
  party_id            UUID REFERENCES parties (id),
  account_id          UUID REFERENCES accounts (id),
  score               NUMERIC(6, 3),
  fired_at            TIMESTAMPTZ NOT NULL,
  status              TEXT NOT NULL CHECK (status IN ('new', 'in_review', 'closed_no_action',
                        'attached_to_case')),
  disposition_reason  TEXT,
  reviewed_by         TEXT,
  case_id             UUID REFERENCES cases (id)
);

CREATE TABLE alert_transactions (
  alert_id            UUID NOT NULL REFERENCES alerts (id),
  transaction_id      UUID NOT NULL REFERENCES transactions (id),
  PRIMARY KEY (alert_id, transaction_id)
);

-- What the monitoring engine or vendor acknowledged receiving, per posted transaction.
CREATE TABLE monitoring_ingest (
  transaction_id      UUID PRIMARY KEY REFERENCES transactions (id),
  engine              TEXT NOT NULL,          -- the monitoring system that received it
  ingested_at         TIMESTAMPTZ NOT NULL
);

-- Detail for an aml_investigation case; the SAR clock is a case_deadlines row.
CREATE TABLE aml_investigations (
  case_id             UUID PRIMARY KEY REFERENCES cases (id),
  subject_party_ids   UUID[] NOT NULL,
  determined_suspicious_at TIMESTAMPTZ,       -- "initial detection": the SAR clock starts here
  suspect_identified  BOOLEAN,                -- false allows the 60-day limit
  decision            TEXT CHECK (decision IN ('file_sar', 'no_sar', 'refer_314b')),
  decision_note       TEXT,                   -- the short statement, even when not required
  decided_by          TEXT,
  account_action      TEXT CHECK (account_action IN ('none', 'restrict', 'close', 'keep_open_le_request')),
  le_keep_open_ref    TEXT                    -- the written law enforcement request, if any
);

-- Restricted schema: separate grants, every read logged.
CREATE TABLE bsa_restricted.sar_filings (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  case_id             UUID NOT NULL REFERENCES cases (id),
  filing_type         TEXT NOT NULL CHECK (filing_type IN ('initial', 'continuing', 'correction',
                        'joint')),
  prior_filing_id     UUID REFERENCES bsa_restricted.sar_filings (id),
  activity_period     DATERANGE NOT NULL,
  amount              BIGINT NOT NULL,
  bsa_id              TEXT,                   -- FinCEN's acknowledgment identifier
  narrative_ref       TEXT NOT NULL,          -- the narrative and CSV attachment, as filed
  supporting_docs_ref TEXT NOT NULL,          -- deemed filed with the SAR
  filed_at            TIMESTAMPTZ,
  board_reported_at   TIMESTAMPTZ,            -- 12 CFR 21.11(h) or the bank's agency rule
  retain_until        DATE NOT NULL           -- filed date + 5 years
);

-- Cash, aggregated per party, direction and business date, for CTRs and structuring rules.
CREATE TABLE currency_aggregates (
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  party_id            UUID NOT NULL REFERENCES parties (id),  -- the person on whose behalf
  business_date       DATE NOT NULL,
  direction           TEXT NOT NULL CHECK (direction IN ('cash_in', 'cash_out')),
  total               BIGINT NOT NULL,
  transaction_ids     UUID[] NOT NULL,
  conductor_party_ids UUID[] NOT NULL,        -- who physically conducted each one
  PRIMARY KEY (institution_id, party_id, business_date, direction)
);

CREATE TABLE ctr_filings (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  party_id            UUID NOT NULL REFERENCES parties (id),
  business_date       DATE NOT NULL,
  direction           TEXT NOT NULL,
  amount              BIGINT NOT NULL CHECK (amount > 1000000),  -- minor units: over $10,000
  due_on              DATE NOT NULL,          -- business_date + 15 days
  bsa_id              TEXT,
  filed_at            TIMESTAMPTZ,
  UNIQUE (institution_id, party_id, business_date, direction)
);

CREATE TABLE ctr_exemptions (
  party_id            UUID NOT NULL REFERENCES parties (id),
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  category            TEXT NOT NULL CHECK (category IN ('bank', 'government', 'listed', 'listed_subsidiary',
                        'non_listed_business', 'payroll_customer')),
  form_110_filed_at   TIMESTAMPTZ,            -- within 30 days after the first exempted transaction
  last_review_at      DATE NOT NULL,          -- at least annually
  valid_during        TSTZRANGE NOT NULL,
  PRIMARY KEY (party_id, institution_id, valid_during)
);

CREATE TABLE fincen_314a_requests (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  tracking_ref        TEXT NOT NULL,
  received_at         TIMESTAMPTZ NOT NULL,
  respond_by          TIMESTAMPTZ NOT NULL,   -- as the request specifies
  searched_at         TIMESTAMPTZ,
  search_scope        JSONB,                  -- accounts 12 months, transactions 6 months, programs included
  matches             JSONB NOT NULL DEFAULT '[]',
  responded_at        TIMESTAMPTZ
);
```

How it runs:

1. **Every posted transaction reaches monitoring.** A coverage job compares posted `transactions` per rail and program against what the monitoring system ingested, per business date, and alerts on any gap. A new rail or program cannot go live without monitoring rules whose `rails` include it.
2. **Rules fire alerts with their exact version,** and alerts for a subject attach to its open case.
3. **The investigator's determination starts the clock:** setting `determined_suspicious_at` writes a `case_deadlines` row (`kind = 'sar_filing'`, 30 days, or 60 if `suspect_identified` is false), with `rule_ref` naming 31 CFR 1020.320(b)(3).
4. **Filing writes to the restricted schema;** a continuing review deadline (Day 120) is written if the bank follows the continuing-activity guidance.
5. **Account actions flow out with a neutral reason code,** and the decision to close is enforced by the core (status `restricted` then `closed`), not by a note, so no money moves after the decision.
6. **Cash aggregates build per business date** across branches and programs; a CTR job files for any aggregate over $10,000 not covered by an exemption, by `due_on`.

The control query that should be empty: monitoring coverage by rail for yesterday.

```sql
SELECT t.rail, p.name AS program, COUNT(*) AS posted,
       COUNT(m.transaction_id) AS monitored
FROM transactions t
JOIN accounts a ON a.id = t.account_id
LEFT JOIN programs p ON p.id = a.program_id
LEFT JOIN monitoring_ingest m ON m.transaction_id = t.id   -- what the monitoring system acknowledged
WHERE t.effective_date = CURRENT_DATE - 1
GROUP BY t.rail, p.name
HAVING COUNT(m.transaction_id) < COUNT(*);
```

`monitoring_ingest` is filled from whatever acknowledgment the monitoring vendor or engine returns per transaction; the point is that coverage is measured from the ledger outward, never from the monitoring system inward.

## Auditing

BSA/AML is examined at every bank on every cycle, and independent testing covers it at least as often. What the records must show:

- **The program and its versions:** the risk assessment, each monitoring rule with its typology, parameters, approver, validation and dates in force, and what changed after each risk assessment.
- **Coverage:** daily, by rail, product and program, from the ledger to monitoring.
- **Every alert and how it ended,** with the rule version, reviewer, reason and case.
- **Every case:** subjects, evidence, determination time, decision and decider, account actions, and for SARs the filing, its timeliness against the deadline, the board report and supporting documents, in the restricted store for five years from filing.
- **CTRs:** each aggregate, its conductors and beneficiaries, the filing and its date; exemptions with their designation and annual reviews.
- **314(a):** every request, the search scope and time, and the response.
- **Access to SAR data,** every read, by whom.

Five years is the BSA's general retention (31 CFR 1010.430), retrievable within a reasonable time. Records for an exited program stay with the bank, which is why a program's monitoring data is the bank's. The record mechanics are in [Audit Trails](/docs/architecture/audit-trails), and model validation is Model Risk Management's subject.

## What This Means for the System You Build

- **Monitor from the ledger:** every posted transaction on every rail reaches monitoring, coverage is measured daily, and a launch without rules for its rail doesn't ship.
- **Version every rule** with its typology, parameters, approver and validation, and record which version fired.
- **Keep a customer risk profile** that is computed, versioned and refreshed on triggers, and compare activity to it.
- **Group alerts into cases by subject,** and give fraud referrals a path into AML.
- **Start the SAR clock at the determination,** store it as a deadline, and record the alert time beside it.
- **Put SARs in a restricted store** and make every downstream effect carry a neutral reason.
- **Aggregate cash per person, direction and business date** across branches and programs, and record who conducted each transaction.
- **Treat near-threshold cash as an alert, not a SAR,** and look for the evasion.
- **Make 314(a) one query across every program and closed account** in the lookback.
- **Measure alert age and backlog** as the control it is, and staff to it.

## References

**Law and regulation**

- [31 CFR 1020.210: Anti-money laundering program requirements for banks](https://www.law.cornell.edu/cfr/text/31/1020.210), internal controls, independent testing, the designated individual, training and risk-based CDD
- [31 CFR 1020.320: Reports by banks of suspicious transactions](https://www.law.cornell.edu/cfr/text/31/1020.320), the $5,000 threshold, the 30 and 60-day deadlines, exceptions, retention, confidentiality and safe harbor
- [12 CFR 21.11: Suspicious Activity Report (OCC)](https://www.law.cornell.edu/cfr/text/12/21.11), the insider, $5,000 and $25,000 thresholds, telephone notice and board notification
- [31 CFR 1010.311: Filing obligations for reports of transactions in currency](https://www.law.cornell.edu/cfr/text/31/1010.311), the CTR for currency transactions of more than $10,000
- [31 CFR 1010.313: Aggregation](https://www.law.cornell.edu/cfr/text/31/1010.313), multiple transactions by or for the same person in one business day, across branches, and night deposits
- [31 CFR 1010.306: Filing of reports](https://www.law.cornell.edu/cfr/text/31/1010.306), CTRs within 15 days and kept five years
- [31 CFR 1020.315: Transactions of exempt persons](https://www.law.cornell.edu/cfr/text/31/1020.315), exempt categories, ineligible businesses, Form 110 designation and annual review
- [31 USC 5324: Structuring transactions to evade reporting requirement prohibited](https://www.law.cornell.edu/uscode/text/31/5324), the evasion purpose and the five and ten-year penalties
- [31 CFR 1010.410: Records to be made and retained by financial institutions](https://www.law.cornell.edu/cfr/text/31/1010.410), funds transfer records and the travel rule at $3,000
- [31 CFR 1010.430: Nature of records and retention period](https://www.law.cornell.edu/cfr/text/31/1010.430), five-year BSA retention and retrievability
- [31 CFR 1010.520: Information sharing between government agencies and financial institutions](https://www.law.cornell.edu/cfr/text/31/1010.520), 314(a) requests, the 12-month and six-month searches, confidentiality and use
- [31 CFR 1010.540: Voluntary information sharing among financial institutions](https://www.law.cornell.edu/cfr/text/31/1010.540), 314(b) notice, verification, use and safe harbor
- [Federal Register: Anti-Money Laundering and Countering the Financing of Terrorism Programs, 91 FR 18704 (April 10, 2026)](https://www.federalregister.gov/api/v1/documents/2026-07033.json), the proposed rule, docket and comment deadline
- [Federal Register: proposed rule full text](https://www.federalregister.gov/documents/full_text/html/2026/04/10/2026-07033.html), the withdrawal of the 2024 proposal, effectiveness, risk assessment, board approval, FinCEN consultation and the 12-month effective date

**Regulators and guidance**

- [FFIEC BSA/AML Manual: Suspicious Activity Reporting](https://bsaaml.ffiec.gov/manual/AssessingComplianceWithBSARegulatoryRequirements/04), monitoring systems, thresholds and validation, the five components, initial detection, continuing activity, board notice, attachments and SAR confidentiality
- [FinCEN, Federal Reserve, FDIC, NCUA and OCC: Frequently Asked Questions Regarding Suspicious Activity Reporting Requirements (October 9, 2025)](https://www.fincen.gov/system/files/2025-10/SAR-FAQs-October-2025.pdf), near-threshold cash, continuing activity reviews and timeline, and no-SAR documentation

**Enforcement**

- [DOJ: TD Bank Pleads Guilty to Bank Secrecy Act and Money Laundering Conspiracy Violations in $1.8B Resolution (October 10, 2024)](https://www.justice.gov/archives/opa/pr/td-bank-pleads-guilty-bank-secrecy-act-and-money-laundering-conspiracy-violations-18b), the pleas, forfeiture and fine, the monitor, 92% and $18.3 trillion unmonitored, the flat cost paradigm and the laundering networks
- [DOJ Criminal Division: United States v. TD Bank, N.A.](https://www.justice.gov/criminal/case/united-states-america-v-td-bank-na), the information and plea agreement
- [FinCEN: FinCEN Assesses Record $1.3 Billion Penalty against TD Bank (October 10, 2024)](https://www.fincen.gov/news/news-releases/fincen-assesses-record-13-billion-penalty-against-td-bank), the penalty, monitorship, P2P monitoring gaps, unfiled SARs and CTR failures
- [OCC: News Release 2024-116 (October 10, 2024)](https://www.occ.gov/news-issuances/news-releases/2024/nr-occ-2024-116.html), the $450 million penalty and the growth restriction
- [Federal Reserve: enforcement action against The Toronto-Dominion Bank (October 10, 2024)](https://www.federalreserve.gov/newsevents/pressreleases/enforcement20241010a.htm), the $123.5 million penalty
- [CSBS: State Regulators Issue $80 Million Penalty to Block, Inc. (January 15, 2025)](https://www.csbs.org/newsroom/state-regulators-issue-80-million-penalty-block-inc-cash-app-bsaaml-violations), 48 states, the findings and the consultant and remediation timeline
- [NYDFS: $40 Million Settlement with Block, Inc. (April 10, 2025)](https://www.dfs.ny.gov/reports_and_publications/press_releases/pr202504101), CDD, risk-based controls, the alert backlog and the monitor
- [FCA: FCA fines Starling Bank for failings in financial crime systems and controls (October 2, 2024)](https://www.fca.org.uk/news/press-releases/fca-fines-starling-bank-failings-financial-crime-systems-and-controls), the fine, the high-risk account restriction breach, partial sanctions screening and growth

**Vendor documentation**

- [Alloy: Developer documentation](https://developer.alloy.com/), the Events API for ongoing monitoring and case management
- [Synctera: Achieve risk and compliance readiness](https://docs.synctera.com/docs/achieve-risk-compliance-readiness), the bank's review of AML scenarios, Synctera AML for monitoring, cases and filing, and the fintech's KYC and fraud-loss responsibilities
- [Synctera: AML cases](https://docs.synctera.com/docs/aml-cases), cases created from rule hits, New and In Review, closed or escalated to the bank
- [Synctera: Cases for fintechs](https://docs.synctera.com/docs/cases-for-fintechs), the case types and rules reflecting the bank's risk appetite
- [Treasury Prime: Fintech Transaction Monitoring Behind the Scenes (November 21, 2022)](https://www.treasuryprime.com/blog/unit-21-partner-profile), the bank owning monitoring, delegated alert adjudication and ledger-fed monitoring
