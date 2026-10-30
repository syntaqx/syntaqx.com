+++
title = "Dormancy, Escheat & Closing Accounts"
nav_title = "Dormancy & Escheat"
description = "How deposit accounts end: dormancy, state unclaimed property periods, due diligence and reporting, priority rules, closures, debanking and deceased owners."
category = "Banking & Lending Industry"
order = 2418
part = "Deposits"
tags = ["banking", "deposits", "dormancy", "escheat", "unclaimed-property", "account-closure"]
+++

Every deposit account ends, and only some end with the customer closing it. Some go quiet and are eventually handed to a state as unclaimed property; some are closed by the bank; some outlive their owner. Each ending has its own law: state unclaimed property acts decide when a quiet account is presumed abandoned, what the bank must do to find the owner first and when it reports and pays the state; a 1965 Supreme Court decision decides which state; federal banking agencies now constrain why an account may be closed; and federal benefit rules decide what happens to payments that arrive after a beneficiary dies. The money moves only a few times, but the records have to say, years later, why it moved and who was told.

This chapter covers the end of a deposit account. The statuses these processes use live in the core ([Core Banking Systems](/books/banking-and-lending/core-banking-systems#what-a-core-does)), the dormancy period is a product parameter ([Products & Product Configuration](/books/banking-and-lending/product-configuration#the-product-factory)), and whether interest keeps accruing on a dormant account is a disclosure question ([Interest, APY & Statements](/books/banking-and-lending/interest-and-statements#when-interest-starts-and-stops)). How insurance treats a deceased owner's beneficiaries is in [Deposit Insurance](/books/banking-and-lending/deposit-insurance#the-2024-trust-rule).

## How the Platforms Do It

What cores and institutions publish about dormancy and escheat, as of October 2026:

| Platform | Role | What it publishes |
| --- | --- | --- |
| **Jack Henry Digital Core** | Core | A per-state configuration resource "to set the time frame that accounts change into a dormant, escheat, or inactive status": `stateCode` with `inactiveDays`, `dormantDays` and `escheatDays` |
| **Jack Henry jXchange** | Core API | Closing an escheated account: compute balance plus accrued interest, post a "Debit to Closing" with an override for the "system fault that normally blocks debits on escheat accounts", offset to the DDA settlement GL, optionally credit an escheat holding GL; end of day closes the account at zero |
| **Mambu** | Core Optional dormancy defined at product level, entered after a period with no deposits, withdrawals or transfers; "no more interest is accrued" and "no automated transactions are posted" (interest, fees, transfers); a transaction by an authorized user reactivates it and interest for the dormant period is recalculated and applied |
| **WSECU** (Washington credit union) | Institution | Dormant "after one year without any activity", with a notice and ways to reactivate; after three years of inactivity Washington treats the funds as unclaimed, and institutions close the accounts and send the funds to the state Department of Revenue each year |

Three things stand out. **Dormant and escheatable are separate states with separate clocks:** WSECU calls an account dormant after one year, an internal status, and the state's three-year period decides when it is unclaimed. **The clock is per state:** Jack Henry keys its configuration by state code because the period and the activity rules are the owner's state's, not the bank's. **Escheat is a closing debit with a GL offset,** posted against a status the core otherwise protects from debits, which is why it needs an override and an audit trail.

## Dormant Is Not Abandoned

A bank uses **dormant** or **inactive** for its own purposes: to stop statements, raise fraud controls on an account nobody watches, require identification before the next withdrawal, or (where the agreement and state law allow) charge an inactivity fee or stop interest, as Mambu's dormancy option does. Nothing about it is required, and the bank chooses the period. **Presumed abandoned** is the state's: once an account has had no qualifying owner activity for the statutory period, the balance is presumed abandoned, the bank must try to reach the owner, and if that fails it reports and delivers the funds to the state, which holds them for the owner indefinitely. The owner then claims from the state, not the bank.

The two interact. A bank-side dormancy that stops interest or charges fees must be disclosed in the account terms ([Deposit Accounts & Truth in Savings](/books/banking-and-lending/deposit-accounts#account-disclosures)), and California's statute separately defines the "service charges" imposed because of inactivity. The trap is treating the bank's dormancy flag as the escheat clock: the activity that resets each one differs, and an account can be active for one purpose and inactive for the other.

## Which State Gets It

Escheat is state law, so every account needs a state, and it isn't the bank's choice. In *Texas v. New Jersey*, 379 U.S. 674 (decided February 1, 1965), the Supreme Court held that an intangible obligation is "subject to escheat only by the State of the last known address of the creditor" as shown in the debtor's records. If the records show no address, or the address state's law doesn't provide for escheat of that property, the debtor's state of incorporation may take it, subject to a later claim by a state that proves a superior right.

For a bank, the depositor is the creditor and the bank is the debtor, so:

- **The owner's last known address on the bank's books decides,** which makes the address history in `party_identities` a legal record, not a convenience.
- **No address, or a foreign one,** falls to the bank's state of incorporation under the second rule, and stays exposed to a claim if an address state turns up.
- **A fintech program doesn't change the holder.** The account is the sponsor bank's deposit liability, so the bank is the holder that reports, even when the program manager knows the customer and runs the notices.

## Periods and What Counts as Activity

The statutory periods are commonly three years for checking, savings and matured CDs, with the detail in what resets the clock. Three examples, as of October 2026:

| State | Period | Activity that keeps the account alive | Notable rule |
| --- | --- | --- | --- |
| **New York** (Abandoned Property Law 300) | Three years unclaimed | The amount "reduced or increased, exclusive of dividend or interest payment"; a passbook presented for interest entry; written evidence received from the owner showing awareness of the account | Interest credits don't count as activity |
| **California** (Code of Civil Procedure 1513) | More than three years | Increasing or decreasing the deposit, cashing an interest check or presenting the passbook; corresponding "electronically or in writing" about the deposit; an indication of interest on file | An account doesn't escheat if the owner was active on another account at the bank in the last three years and the bank communicated with the owner about this one, statements included; electronically initiated debits and credits, payroll deposits and federal benefit deposits count as owner activity |
| **Texas** (Property Code 73.101) | Three years for checking, savings and matured CDs; five otherwise | The inactivity period starts at "the depositor's last transaction or correspondence" | Presumed abandoned only if the depositor's location is also "unknown to the depository" |

The differences are why activity must be recorded as typed events, not a `last_activity_at` column. A recurring ACH payroll credit keeps a California account alive and also changes the amount in New York; an interest credit counts in neither; a login to online banking is none of New York's triggers, while California counts electronic correspondence about the deposit. The rule engine needs the event type, the date and whether the owner initiated it.

## Due Diligence and Reporting

Before reporting, the holder must try to reach the owner, and each state sets the window, the threshold and the method. Texas is a clear example (Property Code 74.1011 and 74.101):

- **Notice:** a holder who on March 1 holds property valued at more than $250 must send notice "by mail to the last known address of the owner or by e-mail", not later than the 60th day before delivering the property, saying it holds the property and may have to deliver it to the comptroller on or before July 1 if unclaimed. No notice is required if the holder has no physical or email address.
- **Report:** due on or before July 1 for property held on March 1, with the owner's identity and last known address, a description and account number, the balance, the date the property became payable and the date of the last transaction with the owner. Items under $25 may be reported in aggregate.

Other states have their own dates and thresholds; the design consequence is a calendar of jurisdictions, each with a notice window, a report date, a delivery date and a format, versioned as the statutes change.

A due diligence letter that the owner answers ends the matter: the response is owner activity, the clock restarts, and the account returns to normal status. One that comes back undeliverable is evidence the owner's location is unknown, which is a condition of abandonment in Texas. Both outcomes are records.

## Worked Numbers: One Quiet Account

A Texas resident's savings account at a bank incorporated in Delaware had its last owner deposit on March 15, 2023. Since then it has received only monthly interest credits, the bank's statements have come back undeliverable since 2024, and the balance is $1,840.

- **Which state:** the last known address on the bank's books is in Texas, so Texas, not Delaware ([Which State Gets It](#which-state-gets-it)).
- **Presumed abandoned:** three years after the last transaction, on March 15, 2026, with the depositor's location unknown (the returned mail); interest credits aren't transactions by the depositor.
- **Which report:** on March 1, 2026 the account wasn't yet presumed abandoned, so it first appears in the report covering property held on March 1, 2027, due July 1, 2027.
- **Notice:** the balance is over $250, so the bank must send notice to the last known address or by email no later than 60 days before delivery; for delivery on July 1, 2027, by May 2, 2027.
- **If the owner answers** by, say, logging in and making a transfer, that transaction restarts the clock and the account leaves the escheat run. **If not,** the bank closes it at zero with a debit to the escheat holding GL on delivery, and the owner can later claim the $1,840 from the Texas comptroller.

Had the owner lived in New York, the same interest-only history would also be inactivity; in California, a recent payroll deposit to the owner's checking account at the same bank, plus the bank's statements about the savings account, would keep the savings account from escheating at all.

## Closing Accounts

**Customer-initiated closure** is the easy case: settle pending items, pay accrued interest, release or resolve holds, disburse the balance and record the method. The hard parts are what's still in flight: a card authorization, an ACH debit that arrives next week, a check that clears next month. The core keeps a closed account able to receive returns and refuse new debits, and the closure record says what was paid out and how.

**Bank-initiated closure** follows the deposit agreement, usually with notice and the balance mailed or transferred, and for cause (fraud, abuse, a BSA/AML decision) it may be immediate. The reasons are records the bank must be able to produce, and some are confidential: a closure that follows a suspicious activity report is decided under BSA/AML Programs, whose confidentiality rules govern what the closure record and notice may say.

**Debanking** is now a supervisory and policy subject in its own right. Executive Order 14331, "Guaranteeing Fair Banking for All Americans" (signed August 7, 2025, 90 FR 38925), defines "politicized or unlawful debanking" as restricting or adversely modifying accounts or services on the basis of a customer's "political or religious beliefs" or lawful business activities the provider "disfavors for political reasons", directed the banking regulators to remove reputation risk from their supervision within 180 days and to review institutions for such practices within 120 days. The OCC and FDIC then finalized "Prohibition on the Use of Reputation Risk by Regulators" (91 FR 18279, April 10, 2026, docket OCC-2025-0142, effective June 9, 2026), and NCUA published its own final rule on June 25, 2026. The OCC and FDIC rule binds the agencies: they may not criticize or act against an institution on the basis of reputation risk, or require, instruct or encourage it to close accounts or withhold services on the basis of political, social, cultural or religious views, protected speech or politically disfavored lawful business. It doesn't describe new duties for banks themselves, but the order's reviews and the FDIC's September 2026 merger proposal, which includes a review designed to deter politicized or unlawful debanking, make a bank's closure reasons something it should expect to show.

The design consequence is the same either way: **every bank-initiated closure, restriction or denial carries a reason code from a controlled list, the policy version it applied, who decided, and the notice sent,** so the institution can show that closures follow written, risk-based criteria and nothing else. That is also what Charters & Regulators and Exams, Ratings & Call Reports cover from the examiner's side.

## Deceased Owners

A death notice changes the account's rules the day it arrives:

- **Who may act.** Joint owners with survivorship and POD or trust beneficiaries take under the account's titling; everything else waits for the estate's representative or a state small-estate procedure. The roles on `account_parties` say which applies, which is one reason they are effective-dated ([Who Owns the Account](/books/banking-and-lending/deposit-accounts#who-owns-the-account)).
- **Insurance.** The death of an owner doesn't change the deposit's insurance coverage for six months unless the account is restructured; after that, coverage follows actual ownership (12 CFR 330.3(j)).
- **Federal benefits after death.** Social Security and other federal benefits paid by ACH after a beneficiary's death are reclaimed under 31 CFR 210. An institution that learns of a death from anywhere other than the paying agency must notify the agency immediately (returning a payment with reason code R14 or R15 counts as notice) and return payments received after it knew. The agency must start a reclamation within 120 calendar days of its own knowledge. An institution without prior knowledge can limit its liability to the lesser of the account balance when the notice of reclamation arrives (plus later benefit payments) or the outstanding total, has at most one business day to act on the notice, and must give the name, last known address and phone number of the recipient, co-owners, others authorized to withdraw and anyone who withdrew after the death. So the death date, the date the bank learned it and the source are three different fields, and the moment a notice of reclamation arrives the account's balance is evidence.
- **Recurring transactions.** Autopays and card-on-file charges may continue until stopped; the executor needs them listed, and the bank's records need to show when each was stopped.

A deceased owner's quiet account is still subject to the unclaimed property clock, and an estate that never claims it ends up at the state like any other.

## How to Build It

These are deltas against [the core data model](/books/banking-and-lending/banking-business#the-core-data-model). Accounts keep the statuses the spine already has (`dormant`, `restricted`, `closed`); the jurisdiction rules are versioned data, owner activity is a typed event stream, and each escheat run, closure and death is a record with its basis.

```sql
-- Unclaimed property law per jurisdiction and property type, effective-dated.
CREATE TABLE unclaimed_property_rules (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction        TEXT NOT NULL,          -- 'US-TX', 'US-NY', 'US-CA', ...
  property_type       TEXT NOT NULL,          -- 'checking', 'savings', 'matured_cd', 'other_deposit'
  period_years        INTEGER NOT NULL,
  activity_kinds      TEXT[] NOT NULL,        -- the owner_activity kinds that reset the clock
  related_account_rule BOOLEAN NOT NULL DEFAULT FALSE,  -- California-style
  requires_location_unknown BOOLEAN NOT NULL DEFAULT FALSE,  -- Texas
  holding_date        TEXT NOT NULL,          -- '03-01': property held on this date is reported
  report_due          TEXT NOT NULL,          -- '07-01'
  notice_min_value    BIGINT,                 -- 25000 for $250, in minor units
  notice_lead_days    INTEGER,                -- notice no later than N days before delivery
  aggregate_below     BIGINT,                 -- 2500: items under $25 may be aggregated
  statute_ref         TEXT NOT NULL,
  valid_during        DATERANGE NOT NULL,
  EXCLUDE USING gist (jurisdiction WITH =, property_type WITH =, valid_during WITH &&)
);

-- What the owner did, typed, so each state's definition can be evaluated.
CREATE TABLE owner_activity (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id    UUID NOT NULL REFERENCES accounts (id),
  party_id      UUID REFERENCES parties (id),
  kind          TEXT NOT NULL CHECK (kind IN ('owner_deposit', 'owner_withdrawal',
                  'electronic_credit', 'electronic_debit', 'interest_credit', 'login',
                  'written_correspondence', 'electronic_correspondence', 'passbook_presented',
                  'due_diligence_response', 'returned_mail')),
  occurred_at   TIMESTAMPTZ NOT NULL,
  source_ref    TEXT NOT NULL                 -- the transaction, session or letter
);

-- One account through one escheat cycle.
CREATE TABLE escheat_items (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id            UUID NOT NULL REFERENCES accounts (id),
  rule_id               UUID NOT NULL REFERENCES unclaimed_property_rules (id),
  jurisdiction_basis    TEXT NOT NULL CHECK (jurisdiction_basis IN ('last_known_address',
                          'state_of_incorporation')),
  address_identity_id   UUID REFERENCES party_identities (id),  -- the address relied on
  last_activity_id      UUID REFERENCES owner_activity (id),
  presumed_abandoned_on DATE NOT NULL,
  report_year           INTEGER NOT NULL,
  notice_disclosure_id  UUID REFERENCES disclosures (id),       -- the due diligence letter
  notice_due_on         DATE,
  amount                BIGINT,                                 -- set when reported
  remittance_entry_id   UUID REFERENCES journal_entries (id),
  status                TEXT NOT NULL CHECK (status IN ('candidate', 'noticed', 'owner_responded',
                          'reported', 'remitted', 'reclaimed_from_state')),
  UNIQUE (account_id, report_year)
);

-- Every closure, with who started it and why.
CREATE TABLE account_closures (
  account_id            UUID PRIMARY KEY REFERENCES accounts (id),
  initiated_by          TEXT NOT NULL CHECK (initiated_by IN ('customer', 'institution',
                          'escheat', 'estate', 'program_exit')),
  reason_code           TEXT NOT NULL,        -- from a controlled list; never free text alone
  policy_ref            TEXT,                 -- the written criterion applied
  decided_by            TEXT NOT NULL,
  notice_disclosure_id  UUID REFERENCES disclosures (id),
  final_balance         BIGINT NOT NULL,
  disbursed_via         TEXT,                 -- 'check', 'ach', 'internal_transfer', 'escheat'
  closing_entry_id      UUID REFERENCES journal_entries (id),
  closed_at             TIMESTAMPTZ NOT NULL,
  confidential          BOOLEAN NOT NULL DEFAULT FALSE  -- reason restricted (e.g. BSA)
);

-- A death, as the institution learned it.
CREATE TABLE death_notices (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id              UUID NOT NULL REFERENCES parties (id),
  date_of_death         DATE,
  source                TEXT NOT NULL CHECK (source IN ('family', 'estate', 'paying_agency',
                          'death_master_file', 'court', 'other')),
  received_at           TIMESTAMPTZ NOT NULL,  -- the institution's knowledge, for 31 CFR 210
  agency_notified_at    TIMESTAMPTZ            -- when not learned from the paying agency
);

-- A federal agency's notice of reclamation and the institution's answer.
CREATE TABLE benefit_reclamations (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id            UUID NOT NULL REFERENCES accounts (id),
  death_notice_id       UUID REFERENCES death_notices (id),
  agency                TEXT NOT NULL,          -- 'SSA', 'VA', 'OPM', 'RRB', ...
  outstanding_total     BIGINT NOT NULL,
  received_at           TIMESTAMPTZ NOT NULL,
  balance_at_receipt    BIGINT NOT NULL,        -- the limit on liability without prior knowledge
  returned_amount       BIGINT,
  return_entry_id       UUID REFERENCES journal_entries (id),
  withdrawers           JSONB,                  -- names and contacts the regulation requires
  certified_at          TIMESTAMPTZ
);
```

How it runs:

1. **Every posting and every contact writes `owner_activity`** with its kind; a transaction the core posts on its own (interest, a fee) is recorded as what it is, not as owner activity.
2. **A nightly job evaluates each account** against the rule for its owner's address state, using the address in force at the time, and opens `escheat_items` as candidates; a bank-side dormancy status is a separate, product-driven transition.
3. **The due diligence run** selects candidates for the coming report, sends notices as `disclosures` rows by each rule's window and threshold, and treats a response as owner activity.
4. **The report and remittance** are generated per jurisdiction from the items, closed accounts are debited to an escheat holding GL, and the payment to the state clears it; the report file is archived as sent.
5. **A death notice** restricts the account to the actions the titling allows, starts the reclamation watch for federal benefit deposits and notifies the paying agency where required.

## Auditing

Unclaimed property audits look back many years, often across every state at once, and a closure or a death can be litigated long after the account is gone. Keep:

- **The jurisdiction decision per account:** the address relied on, its date and source, and the rule version applied.
- **The activity history** the presumption was computed from, with event kinds, so "why was this account escheated in 2027" is answered from rows.
- **Every due diligence letter as sent,** its delivery result, and any response.
- **Each report and remittance:** the file as filed, the items in it, the journal entries and the state's acknowledgment.
- **Every closure's reason code, policy, decider and notice,** with confidential reasons access-controlled and still retained.
- **The dates of death, knowledge and agency notice,** and every reclamation with the balance on receipt, the amount returned and the certifications.

The general retention and append-only rules are in [Data Retention](/docs/architecture/data-retention#retention-schedules-by-record-type) and [Audit Trails](/docs/architecture/audit-trails#amend-don-t-overwrite).

## What This Means for the System You Build

- **Separate the bank's dormancy status from the state's abandonment clock,** each with its own rules.
- **Record owner activity as typed events,** because each state defines activity differently.
- **Decide the state from the last known address on the books,** keep address history, and fall back to the state of incorporation only when the rules say so.
- **Keep unclaimed property rules as versioned data** per jurisdiction and property type, with their notice and report calendars.
- **Make due diligence, reporting and remittance one traceable run** from candidate to state acknowledgment.
- **Give every bank-initiated closure a controlled reason, a policy, a decider and a notice,** so the institution can show what it closed and why.
- **Store when the bank learned of a death, from whom,** and what the account held when a reclamation arrived.

## References

**Law and regulation**

- [Texas v. New Jersey, 379 U.S. 674 (1965)](https://www.law.cornell.edu/supremecourt/text/379/674), the last-known-address and state-of-incorporation priority rules
- [New York Abandoned Property Law 300](https://www.nysenate.gov/legislation/laws/ABP/300), three years unclaimed, activity exclusive of interest, passbook presentation and written evidence of awareness
- [California Code of Civil Procedure 1513](https://california.public.law/codes/code_of_civil_procedure_section_1513), more than three years, activity including electronic correspondence, the related-account rule and electronically initiated transactions
- [Texas Property Code 73.101](https://texas.public.law/statutes/tex._prop._code_section_73.101), three and five years of inactivity and the location-unknown condition
- [Texas Property Code 74.101](https://texas.public.law/statutes/tex._prop._code_section_74.101), the July 1 report for property held on March 1, its contents and aggregation under $25
- [Texas Property Code 74.1011](https://texas.public.law/statutes/tex._prop._code_section_74.1011), notice for property over $250 by mail or email, 60 days before delivery
- [12 CFR 330.3](https://www.law.cornell.edu/cfr/text/12/330.3), six months of unchanged insurance after a deposit owner's death
- [31 CFR 210.10](https://www.law.cornell.edu/cfr/text/31/210.10), RDFI liability for post-death benefit payments, notice to the agency, R14 and R15, and the 120-day and six-year limits
- [31 CFR 210.11](https://www.law.cornell.edu/cfr/text/31/210.11), limiting liability, the balance on receipt, one business day, and the information to provide

**Regulators and guidance**

- [Federal Register: Executive Order 14331, Guaranteeing Fair Banking for All Americans (90 FR 38925)](https://www.federalregister.gov/documents/full_text/html/2025/08/12/2025-15341.html), the definition of politicized or unlawful debanking and the 180-day and 120-day directives
- [Federal Register API: Prohibition on the Use of Reputation Risk by Regulators (2026-06947)](https://www.federalregister.gov/api/v1/documents/2026-06947.json), 91 FR 18279, April 10, 2026, docket OCC-2025-0142, effective June 9, 2026, and what it bars
- [Federal Register API: documents referencing "Guaranteeing Fair Banking"](https://www.federalregister.gov/api/v1/documents.json?conditions[term]=%22Guaranteeing+Fair+Banking%22&order=oldest), the NCUA final rule of June 25, 2026 and the FDIC merger proposal of September 22, 2026

**Vendor documentation**

- [Jack Henry Digital Core: State Dormancy Escheat](https://jackhenry.dev/digital-core-api-docs/account-services/api-reference/v1/state-dormancy-escheat/), per-state inactive, dormant and escheat day settings
- [Jack Henry jXchange: Closing escheat deposit accounts](https://jackhenry.dev/jxchange-soap/tutorials/transaction/closing-escheat-deposit-accounts/), the closing debit, override and GL offsets
- [Mambu: Deposit account life cycle and states](https://docs.mambu.com/md/docs/deposit-accounts-life-cycle-and-states.txt), product-level dormancy, no interest accrual or automated transactions while dormant, and recalculation on reactivation
- [WSECU: Dormant and escheated accounts](https://wsecu.org/resources/faqs-dormant-and-escheated-accounts), one-year dormancy, three-year unclaimed funds and annual delivery to Washington
