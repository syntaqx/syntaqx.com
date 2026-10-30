+++
title = "Collections & Recovery"
description = "Collecting past-due loans: delinquency buckets, FDCPA and Reg F contact limits, validation notices, hardship, stays, charge-off, debt sale and recoveries."
category = "Banking & Lending Industry"
order = 2454
part = "Servicing and Collections"
tags = ["banking", "lending", "collections", "fdcpa", "regulation-f", "charge-off", "debt-sale"]
+++

Collections is servicing after a payment is missed, and most of it is not adversarial. The majority of accounts that go 30 days past due come back with a reminder and a convenient way to pay; a smaller group needs a plan; a few go on to charge-off, an agency or a buyer. The work is a funnel measured in days past due, and the law around it is about how and how often a lender or collector may reach someone, what it must tell them, when it must stop, and what it may do with the debt afterward. Each of those rules lands in the system as a counter, a gate or a clock: a contact limiter with legal semantics, a validation period, an automatic stay that halts everything on the day a bankruptcy is filed.

This chapter covers the platforms, delinquency buckets, who the federal collection law covers, contact strategy under Regulation F (with a worked call calendar), validation notices and disputes, hardship programs and their re-aging limits, bankruptcy and servicemember stays, charge-off timing, placement, debt sale and recoveries, time-barred debt, and licensing. Mortgage delinquency adds Regulation X's early intervention and loss mitigation, in [Mortgage Servicing, Escrow & Loss Mitigation](/books/banking-and-lending/mortgage-servicing#early-intervention-and-continuity-of-contact); auto repossession is in [Auto Lending](/books/banking-and-lending/auto-lending#repossession); how the loss is reserved and booked is [Credit Losses & CECL](/books/banking-and-lending/credit-losses-and-cecl). Calling and texting consent under the TCPA is the playbook's [Consumer Contact](/docs/compliance/consumer-contact).

## How the Platforms Do It

As of October 2026, from filings, enforcement records and vendor pages:

| Who | Role | What the public record says |
| --- | --- | --- |
| **Upstart** | Lender collecting its own loans | "Focus[es] on early intervention" by email, call, text and mail; holds collections licenses in the majority of states and conducts first-party collections; partners with third-party agencies, including for charged-off loans |
| **Encore Capital** (Midland) | Debt buyer | Under the CFPB's 2015 order, up to $42 million of refunds, a $10 million penalty and a stop to collecting over $125 million of debt; a 2020 judgment for violating it added a $15 million penalty and extended the order five years |
| **PRA Group** (Portfolio Recovery Associates) | Debt buyer | Under its 2015 order, $19 million of refunds and an $8 million penalty; a 2023 judgment for violating it required at least $12.18 million of redress and a $12 million penalty |
| **LoanPro** | Loan platform | A collections suite beside its servicing and payments suites |
| **Peach Finance** (SoFi Tech Credit Solutions) | Loan platform | A compliance module covering FDCPA, SCRA, TCPA, UDAP and Reg F |
| **Nortridge** | Servicing software | "Rules based workflows that guide every past due loan from delinquency through resolution" |

Three patterns. **Collections is licensed work,** even for a lender collecting its own loans in many states, which is why Upstart's filing lists collection licenses beside its lending ones. **The debt moves and its records must move with it:** the CFPB's 2015 actions against the two largest buyers centered on collecting balances they couldn't verify, from documents that didn't travel with the accounts. **The rules are in the software:** every platform sells contact limits and compliance checks as product, because a collector's compliance is mostly a question of what the dialer and the letter engine were allowed to do.

## Delinquency Buckets

Delinquency is measured in days past due (DPD) from the oldest unpaid installment's due date, and accounts are grouped into buckets that drive treatment, reporting and loss reserves:

| Bucket | Typical treatment | What else happens |
| --- | --- | --- |
| **1 to 29 DPD** | Reminders, self-service payment, autopay retry | A late fee after any grace period; not yet reportable as late |
| **30 to 59** | Outbound contact, promises to pay, short-term plans | Reported 30 days late; mortgages: live contact by day 36, notice by day 45 |
| **60 to 89** | Hardship programs, payment plans | Card penalty APR becomes possible after 60 days ([Credit Cards as Credit](/books/banking-and-lending/credit-cards#the-card-act-rules)) |
| **90 to 119** | Final offers, settlement authority, repossession or foreclosure preparation | Mortgages: 120-day bar on a first foreclosure filing |
| **120 or more** | Charge-off for closed-end retail loans; open-end continues to 180 | Placement with an agency, sale, or internal recovery |

The share of each bucket that moves to the next each month is the **roll rate**, the number collections managers run their operation by and the input a loss model forecasts with ([Worked Numbers: A Vintage and Roll-Rate Allowance](/books/banking-and-lending/credit-losses-and-cecl#worked-numbers-a-vintage-and-roll-rate-allowance)). A strategy that lowers the 30-to-60 roll by a point is worth more than anything done at 150 days.

## Who the Law Covers

The Fair Debt Collection Practices Act and its Regulation F apply to **debt collectors**: anyone whose principal business is collecting debts or who regularly collects debts owed to another (15 U.S.C. 1692a(6)). Three edges decide most cases:

- **A creditor collecting its own debts in its own name isn't a debt collector,** and neither are its officers and employees doing so (1692a(6)(A)). A bank or lender calling its own borrowers is outside the FDCPA, though not outside the CFPB's unfair, deceptive and abusive practices authority or state collection laws, some of which reach creditors too. <!-- source-gap: state-first-party-collection | missing | which state collection statutes cover creditors collecting their own debts | closes with: the text of a state statute (e.g. California's Rosenthal Act definition) opened | checked: 2026-10-29 -->
- **A creditor that uses another name** suggesting a third party is collecting becomes a debt collector for that collection.
- **A servicer that obtained a debt before it was in default** isn't a debt collector for it (1692a(6)(F)(iii)), so a mortgage or student loan servicer collecting a loan it began servicing while current is outside the FDCPA for that loan; one that boards a portfolio already in default is inside it. Defaulted federal student loans follow their own collection path, set out in [The Federal Servicing System](/books/banking-and-lending/student-loans#the-federal-servicing-system).

My rule: build first-party collections to Regulation F's contact and disclosure standards anyway. They are the clearest public statement of what regulators consider harassing or misleading, a first-party program often hands accounts to agencies that must meet them, and a single contact engine with one set of limits is simpler than two.

## Contact Strategy

Regulation F turns "don't harass" into rules a contact engine can enforce:

- **Time and place.** Absent knowledge to the contrary, communicating before 8 a.m. or after 9 p.m. at the consumer's location is inconvenient; no contact at work if the collector knows the employer prohibits it; no contact with a consumer known to be represented by an attorney on the debt (12 CFR 1006.6(b)).
- **Call frequency (7-in-7).** A collector is presumed to comply if it calls a person about a particular debt no more than seven times in seven consecutive days, and not within seven days after a telephone conversation about that debt; exceeding either is presumed a violation (1006.14(b)(2)). Ringless voicemails count as calls; texts and emails don't, though their volume can still be harassment. Calls that don't connect don't count; calls made with the consumer's direct consent within seven days of it are excluded. Each debt is counted separately, and a call about several debts counts toward each (1006.14(b)(3), (b)(4)).
- **Channel requests.** A consumer may tell the collector to stop using a medium (phone, email, text) or a particular address or number, and it must comply (1006.14(h)); every electronic message must include a simple way to opt out, such as "Reply STOP" (1006.6(e)).
- **Cease communication.** A written refusal to pay or request to stop ends further communication about the debt, with narrow exceptions (1006.6(c)).
- **No passive collection by credit reporting.** A collector may not report a debt to a bureau before communicating with the consumer about it, by speaking with them or sending a notice and waiting a reasonable time for word that it was undeliverable (1006.30(a)).
- **Records.** A collector keeps records showing compliance until three years after its last collection activity on the debt, and keeps any call recordings it makes for three years after the call (1006.100).

## Worked Numbers: A Call Calendar

My example of the 7-in-7 counter for one consumer and one debt, starting Monday, October 5, 2026:

| Day | Calls placed | Connected | Counted | Running count (7 days) | Note |
| --- | --- | --- | --- | --- | --- |
| Mon Oct 5 | 2 | 2 (voicemail) | 2 | 2 | Voicemail counts even with no message |
| Tue Oct 6 | 3 | 2 (one busy signal) | 2 | 4 | The busy signal didn't connect |
| Wed Oct 7 | 2 | 2 | 2 | 6 | |
| Thu Oct 8 | 1 | 1, a conversation | 1 | 7 | Conversation on day one of a seven-day block |
| Fri Oct 9 to Wed Oct 14 | 0 | | | | No calls: within seven days after the conversation |
| Thu Oct 15 | 1 | 1 | 1 | 1 | Calls allowed again; Oct 9 to 15 window holds one call |

If on October 8 she had asked to be called back Saturday, a call that day is excluded as consented, within seven days of the consent. The engine needs, per person and debt: every attempt with its connection result, every conversation, and every consent with its window, and it must check before dialing, not report afterward.

## Validation Notices and Disputes

A debt collector must give the consumer validation information in its initial communication or within five days after it (12 CFR 1006.34), and Model Form B-1 is a safe harbor. The notice carries the collector, creditor and account, an **itemization date** (the last statement, charge-off, last payment, transaction or judgment date, used consistently), the amount on that date and the interest, fees, payments and credits since, the current amount, and the end of the validation period, with dispute prompts ("This is not my debt," "The amount is wrong") at the bottom. The validation period ends 30 days after the consumer receives the notice, and the collector may assume receipt five days (excluding weekends and federal holidays) after providing it.

A written dispute within the validation period stops collection of the debt, or the disputed part, until the collector sends verification or a copy of a judgment; a request for the original creditor's name and address stops it until the collector provides them; a dispute substantially the same as one already answered, with nothing new, may be answered by saying so (1006.38). The itemization comes from the servicing ledger, so a creditor that places or sells debt must hand over the charge-off balance and every later transaction, which is the documentation problem of the debt buyer cases above.

## Hardship Programs

A borrower who can pay something but not the scheduled amount gets a plan: a reduced payment for a period, a payment deferral, an extension of the term, a fixed-rate workout program for a card, or a settlement for less than the balance. Two supervisory limits shape them for banks, from the federal agencies' Uniform Retail Credit Classification and Account Management Policy:

- **Re-aging open-end accounts** (returning a delinquent card or line to current) requires renewed willingness and ability to repay, an account open at least nine months, and at least three consecutive minimum monthly payments or the equivalent; at most once in 12 months and twice in five years, plus one re-age in five years for a workout program.
- **Closed-end extensions and deferrals** need explicit limits the institution sets itself, and the institution shouldn't advance funds to cover unpaid interest and fees.

Every plan is a new `payment_schedules` version with a reason, the re-age counters live on the account, and the bureau file follows the plan's reporting rules ([Furnishing Credit Data](/books/banking-and-lending/credit-reporting#the-monthly-file)). A settlement for less than the balance is a charge-off of the difference, booked as such.

## Stays: Bankruptcy and the SCRA

**Bankruptcy.** Filing a petition stays, automatically and at once, lawsuits against the debtor, acts to take possession of the debtor's property, any act to collect a pre-petition claim, and setoff of a debt owed to the debtor against a claim (11 U.S.C. 362(a)(1), (3), (6), (7)). A willful violation exposes the creditor to actual damages, costs, attorneys' fees and, in appropriate cases, punitive damages (362(k)(1)). For a repeat filer with a case dismissed within the prior year, the stay ends on the 30th day unless extended (362(c)(3)). In the system, a bankruptcy notice must stop every collection action across every channel and agency for that borrower in one transaction: autopay debits, calls, letters, repossession orders, foreclosure steps and placements. A discharge ends personal liability, changes the tradeline, and bars selling or placing the debt (1006.30(b)).

**Servicemembers.** Debts incurred before military service are capped at 6% interest during service (for mortgages, during service and one year after), with the excess forgiven, on the servicemember's written notice with orders up to 180 days after service ends (50 U.S.C. 3937), applied as a backdated rate change recorded in `scra_benefits` ([The Servicemembers Civil Relief Act](/books/banking-and-lending/apr-and-rate-caps#the-servicemembers-civil-relief-act)); repossessing a vehicle bought before service requires a court order during service ([Auto Lending](/books/banking-and-lending/auto-lending#repossession)); and a mortgage can't be foreclosed during service or for a year after without one ([Foreclosure Timelines](/books/banking-and-lending/mortgage-servicing#foreclosure-timelines)). A status check belongs before every repossession, foreclosure step, lawsuit and sale.

## Charge-Off Timing

For banks, the federal agencies' uniform retail policy sets when a delinquent consumer loan is classified Loss and charged off: closed-end retail loans at **120** cumulative days past due, open-end at **180**; loans to borrowers in bankruptcy within 60 days of notification from the court; fraudulent accounts within 90 days of discovery; and deceased borrowers' accounts when the loss is determined. One- to four-family residential loans are assessed against their collateral at 180 days, with the part the collateral doesn't cover charged off. Nonbank lenders set their own policies, usually in the same range and disclosed in their filings. A charge-off removes the balance from the loan's carrying amount against the allowance; it doesn't forgive the debt, which the lender, an agency or a buyer may still collect ([Charge-Offs and Recoveries in the Ledger](/books/banking-and-lending/credit-losses-and-cecl#charge-offs-and-recoveries-in-the-ledger)). The account's status becomes `charged_off`, collections continues as recovery, and the bureau tradeline shows the charge-off with its date of first delinquency.

## Placement, Debt Sale and Recoveries

After charge-off a lender can collect internally, **place** accounts with an agency on contingency (the lender still owns the debt and the agency is a debt collector), or **sell** them to a debt buyer for cents on the dollar. The OCC's guidance on consumer debt sales (Bulletin 2014-37, still in effect with its reputation-risk references removed in 2025) is the clearest public statement of what a sale requires:

- **Account-level documents and data:** the signed contract or other evidence of liability, statements (all, or the last 12 if fewer), account numbers, the principal, interest and fees itemized, the issuer and brand, the date, source and amount of the last payment and the default dates, unresolved disputes and fraud claims, collection history, and the borrower's name, address and SSN.
- **Data scrubs and sampling** before the files transfer.
- **What not to sell:** accounts settled or in settlement, of deceased borrowers, in bankruptcy, in litigation with the bank, with fraud, or with unclear ownership; and generally not accounts of servicemembers eligible for SCRA protection, minors, borrowers in disaster areas, or debts near the statute of limitations.
- **Buyer due diligence and contracts:** collection practices, complaints, financials, licensing and compliance record, repeated for forward-flow buyers; contracts limiting resale and litigation volume and avoiding compensation that rewards aggressive collection. "Each time account information changes hands, risk increases that key information will be lost or corrupted."

Regulation F adds that a collector may not sell, transfer or place a debt it knows or should know was paid, settled or discharged in bankruptcy, except to the debt's owner, a prior owner under the contract, in a merger or as part of a securitization or pledge (1006.30(b)). Every dollar collected after charge-off is a **recovery**, booked against the allowance, net of the agency's contingency fee; a sale's proceeds are a recovery too, and the sold accounts' tradelines must show the sale.

## Time-Barred Debt

A debt past its state statute of limitations can still be owed, but a debt collector may not sue or threaten to sue on it (12 CFR 1006.26(b)); proofs of claim in bankruptcy are excepted. The statute of limitations depends on the state and the kind of debt, so the collection system needs the governing state's limitations period, the accrual date and the events state law says toll or revive it, as dated rules, before any legal referral. The CFPB's 2015 orders against Encore and PRA required them to disclose time-barred status and stop suing on such debts.

## Licensing

State law licenses collection agencies, and in some states debt buyers too; Upstart's 10-K says it holds collections licenses in the majority of states for its first-party work. <!-- source-gap: state-collection-licensing | missing | which states license collection agencies and debt buyers | closes with: a state regulator's licensing page or the NMLS license list for collection agencies | checked: 2026-10-29 --> A licensed collector also carries bonding, state-specific disclosures and notices, and state limits on contact and interest that sit beside Regulation F. The licensing map is reference data with effective dates, checked when an account is assigned to a team or an agency, and the same per-state rules engine as [State Rate Caps as Data](/books/banking-and-lending/installment-loans#state-rate-caps-as-data). Lender licensing in full is [Lender Licensing & Bank Partnerships](/books/banking-and-lending/lender-licensing).

## How to Build It

These are deltas against [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model): `loans`, `schedule_installments`, `payment_schedules` for plans, `cases` for validation disputes and hardship requests, and `holds` where a stay or a plan touches a deposit account. [Loan Servicing](/books/banking-and-lending/loan-servicing#how-to-build-it) added autopay enrollments and roles; [Mortgage Servicing, Escrow & Loss Mitigation](/books/banking-and-lending/mortgage-servicing#how-to-build-it) added case kinds and the foreclosure gate; [Auto Lending](/books/banking-and-lending/auto-lending#how-to-build-it) has `repossessions`. This chapter adds delinquency snapshots, contacts and their restrictions, hardship plans, stays, placements and sales.

```sql
-- Adds 'debt_validation_dispute' and 'bankruptcy'; the full list as of this chapter.
ALTER TABLE cases DROP CONSTRAINT cases_kind_check,
  ADD CONSTRAINT cases_kind_check CHECK (kind IN ('reg_e_error', 'reg_cc_claim',
    'billing_error', 'fraud_claim', 'credit_report_dispute', 'legal_process', 'complaint',
    'aml_investigation', 'hardship', 'sanctions_review', 'mca_reconciliation',
    'servicing_error', 'information_request',
    'loss_mitigation', 'debt_validation_dispute', 'bankruptcy'));

CREATE TABLE delinquency_snapshots (         -- daily, per loan or line; the roll-rate source
  account_id           UUID NOT NULL REFERENCES accounts (id),
  business_date        DATE NOT NULL,
  days_past_due        INT NOT NULL,          -- from the oldest unpaid installment
  bucket               TEXT NOT NULL CHECK (bucket IN ('current', '1_29', '30_59', '60_89',
                         '90_119', '120_149', '150_179', '180_plus', 'charged_off')),
  amount_past_due      BIGINT NOT NULL,
  principal_balance    BIGINT NOT NULL,
  on_plan              BOOLEAN NOT NULL DEFAULT false,
  stayed               BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (account_id, business_date)
);

CREATE TABLE collection_contacts (           -- every attempt, before and after it was made
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id           UUID NOT NULL REFERENCES accounts (id),
  party_id             UUID NOT NULL REFERENCES parties (id),
  collector            TEXT NOT NULL,          -- 'first_party' or the agency's ID
  channel              TEXT NOT NULL CHECK (channel IN ('call', 'ringless_voicemail', 'sms',
                         'email', 'letter', 'in_app')),
  destination_ref      TEXT NOT NULL,          -- tokenized number or address
  local_time           TIMESTAMP NOT NULL,     -- at the consumer's location
  connected            BOOLEAN,                -- calls: busy or not-in-service is false
  conversation         BOOLEAN NOT NULL DEFAULT false,
  consent_ref          UUID,                   -- a consent that excludes this call
  counted_7_in_7       BOOLEAN NOT NULL,
  gate_result          JSONB NOT NULL,         -- the checks run before it was allowed
  outcome              TEXT,                   -- 'promise_to_pay', 'refused', 'wrong_party', ...
  recording_ref        TEXT,
  attempted_at         TIMESTAMPTZ NOT NULL
);

CREATE TABLE contact_restrictions (          -- what the engine must not do
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id             UUID NOT NULL REFERENCES parties (id),
  account_id           UUID REFERENCES accounts (id),   -- null: all debts
  kind                 TEXT NOT NULL CHECK (kind IN ('medium_opt_out', 'address_opt_out',
                         'cease_communication', 'attorney_represented', 'no_work_contact',
                         'inconvenient_times', 'bankruptcy_stay', 'deceased')),
  channel              TEXT,
  destination_ref      TEXT,
  detail               JSONB,                  -- attorney contact, time windows
  source_ref           TEXT NOT NULL,          -- the call, letter or notice that created it
  valid_during         TSTZRANGE NOT NULL
);

CREATE TABLE hardship_plans (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id           UUID NOT NULL REFERENCES accounts (id),
  case_id              UUID REFERENCES cases (id),        -- kind 'hardship'
  kind                 TEXT NOT NULL CHECK (kind IN ('reduced_payment', 'deferral', 'extension',
                         'workout', 're_age', 'settlement')),
  schedule_id          UUID REFERENCES payment_schedules (id),
  qualifying_payments  SMALLINT,              -- re-age: three consecutive minimums
  settlement_amount    BIGINT,
  valid_during         DATERANGE NOT NULL,
  status               TEXT NOT NULL CHECK (status IN ('offered', 'active', 'completed', 'broken'))
);

CREATE TABLE legal_stays (                   -- bankruptcy and servicemember protections
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id             UUID NOT NULL REFERENCES parties (id),
  kind                 TEXT NOT NULL CHECK (kind IN ('bankruptcy', 'scra_active_duty')),
  chapter              SMALLINT,              -- 7, 11, 13
  court_case_ref       TEXT,
  noticed_at           TIMESTAMPTZ NOT NULL,  -- when the institution learned of it
  effective_from       DATE NOT NULL,         -- the petition or service start date
  ends_on              DATE,                  -- dismissal, discharge, 30-day repeat-filer end, service end + 1 year
  outcome              TEXT CHECK (outcome IN ('discharged', 'dismissed', 'relief_granted', 'ended'))
);

CREATE TABLE agency_placements (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id           UUID NOT NULL REFERENCES accounts (id),
  agency               TEXT NOT NULL,
  contingency_bps      INT NOT NULL,
  placed_balance       BIGINT NOT NULL,
  itemization_date     DATE NOT NULL,
  documents_ref        TEXT NOT NULL,
  placed_at            TIMESTAMPTZ NOT NULL,
  recalled_at          TIMESTAMPTZ,
  recall_reason        TEXT                    -- 'bankruptcy', 'dispute', 'deceased', 'end_of_term', ...
);

CREATE TABLE debt_sales (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id       UUID NOT NULL REFERENCES institutions (id),
  buyer                TEXT NOT NULL,
  agreement_ref        TEXT NOT NULL,
  due_diligence_ref    TEXT NOT NULL,
  cutoff_date          DATE NOT NULL,
  price_bps            INT NOT NULL,           -- of face value
  closed_at            TIMESTAMPTZ
);

CREATE TABLE debt_sale_accounts (
  sale_id              UUID NOT NULL REFERENCES debt_sales (id),
  account_id           UUID NOT NULL REFERENCES accounts (id),
  face_value           BIGINT NOT NULL,
  exclusion_checks     JSONB NOT NULL,         -- bankruptcy, litigation, fraud, deceased, SCRA, limitations
  documents_ref        TEXT NOT NULL,
  proceeds             BIGINT NOT NULL,
  PRIMARY KEY (sale_id, account_id)
);
```

How it runs:

1. **Every outbound contact passes one gate** ([One Outbound Gate](/docs/architecture/notifications#one-outbound-gate)): the gate reads open `contact_restrictions` and `legal_stays`, the consumer's local time, the 7-in-7 window from `collection_contacts` for that person and debt, and any consent, and writes its decision into `gate_result` whether it allows the contact or not.
2. **A bankruptcy or stay is one transaction across systems.** Writing `legal_stays` ends autopay, recalls placements, cancels repossession orders, blocks foreclosure steps and adds a `contact_restrictions` row, with each downstream acknowledgment recorded.
3. **Delinquency snapshots are written nightly** from the ledger and feed buckets, contact strategy, the bureau run and the allowance's roll rates.
4. **Placements and sales are gated on exclusions** checked per account at the cutoff, stored in `exclusion_checks`, and recalled when an exclusion appears later.
5. **Recoveries post as journal entries against the allowance,** gross of the agency's fee with the fee as an expense, so recovery rates are measurable ([Credit Losses & CECL](/books/banking-and-lending/credit-losses-and-cecl#how-to-build-it)).

## Auditing

Collections is examined call by call and letter by letter, and the general design is in [Audit Trails](/docs/architecture/audit-trails). Make sure the record shows:

- **Every contact attempt,** with its channel, local time, connection, conversation, the 7-in-7 count and the gate's checks.
- **Every restriction and stay,** when it was received, and every action it stopped.
- **Every validation notice as sent,** its itemization, the validation period and any dispute and verification.
- **Every hardship plan,** its schedule version, re-age counters and outcome.
- **Charge-off dates against policy,** and the bucket history leading to each.
- **Every placement and sale,** with the documents, exclusion checks, buyer due diligence and recalls.
- **Recoveries by source,** net and gross of fees, against the charge-offs they relate to.
- **Retention for three years** after the last collection activity, and recordings for three years after the call.

## What This Means for the System You Build

- **Compute delinquency daily from the ledger** and store it; it drives contact, reporting and reserves.
- **Put every contact through one gate** that enforces time, channel, frequency, restrictions and stays, and records its decision.
- **Count 7-in-7 per person per debt** with connection, conversation and consent semantics, before dialing.
- **Generate validation notices from the servicing ledger** with a consistent itemization date, and pause on disputes.
- **Model hardship plans as schedule versions** with re-age limits enforced as counters.
- **Make a bankruptcy notice stop everything at once,** across autopay, agencies, repossession and foreclosure.
- **Charge off on policy, not judgment,** and keep collecting as recovery.
- **Sell or place only with complete records** and per-account exclusion checks, and keep limitations rules by state.

## References

**Law and regulation**

- [Cornell LII: 15 U.S.C. 1692a, definitions (FDCPA)](https://www.law.cornell.edu/uscode/text/15/1692a), debt collector, the creditor's own employees, the false-name clause and debts not in default when obtained
- [CFPB: Regulation F § 1006.6, communications in connection with debt collection](https://www.consumerfinance.gov/rules-policy/regulations/1006/6/), inconvenient times and places, attorney representation, cease communication and electronic opt-outs
- [CFPB: Regulation F § 1006.14, harassing, oppressive, or abusive conduct](https://www.consumerfinance.gov/rules-policy/regulations/1006/14/), the 7-in-7 presumptions, what counts, exclusions, multiple debts and channel restrictions
- [Cornell LII: 12 CFR 1006.26, collection of time-barred debts](https://www.law.cornell.edu/cfr/text/12/1006.26), no suits or threats on time-barred debt
- [Cornell LII: 12 CFR 1006.30, other prohibited practices](https://www.law.cornell.edu/cfr/text/12/1006.30), no passive collection through credit reporting and no sale of paid, settled or discharged debt
- [CFPB: Regulation F § 1006.34, validation notices](https://www.consumerfinance.gov/rules-policy/regulations/1006/34/), timing, required information, itemization dates and Model Form B-1
- [CFPB: Regulation F § 1006.38, disputes and requests for original-creditor information](https://www.consumerfinance.gov/rules-policy/regulations/1006/38/), pausing collection until verification and duplicative disputes
- [CFPB: Regulation F § 1006.100, record retention](https://www.consumerfinance.gov/rules-policy/regulations/1006/100/), three years after the last collection activity and call recordings
- [Cornell LII: 11 U.S.C. 362, automatic stay](https://www.law.cornell.edu/uscode/text/11/362), the stayed acts, damages for willful violations and repeat filers
- [Cornell LII: 50 U.S.C. 3937, maximum rate of interest](https://www.law.cornell.edu/uscode/text/50/3937), the SCRA 6% cap, its periods, forgiveness and notice

**Regulators and guidance**

- [Federal Register: Uniform Retail Credit Classification and Account Management Policy (June 12, 2000)](https://www.federalregister.gov/documents/full_text/html/2000/06/12/00-14704.html), charge-off at 120 and 180 days, bankruptcy, fraud and deceased accounts, re-aging limits and closed-end extensions
- [FDIC: FIL-40-2000](https://www.fdic.gov/news/financial-institution-letters/2000/fil0040.html), the policy's residential loan treatment at 180 days
- [OCC: Bulletin 2014-37, Consumer Debt Sales: Risk Management Guidance](https://www.occ.gov/news-issuances/bulletins/2014/bulletin-2014-37.html), documents and data per account, what not to sell, buyer due diligence and contracts

**Enforcement**

- [CFPB: Action against the two largest debt buyers (September 9, 2015)](https://www.consumerfinance.gov/archive/newsroom/cfpb-takes-action-against-the-two-largest-debt-buyers-for-using-deceptive-tactics-to-collect-bad-debts/), the Encore and PRA orders, refunds, penalties and conduct
- [CFPB: Encore Capital Group enforcement action](https://www.consumerfinance.gov/enforcement/actions/encore-capital-group-et-al/), the 2020 judgment, penalty and extension
- [CFPB: Portfolio Recovery Associates enforcement action](https://www.consumerfinance.gov/enforcement/actions/portfolio-recovery-associates-llc/), the 2023 judgment, redress and penalty

**Filings and vendor documentation**

- [Upstart: Annual report on Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1647639/000164763926000027/upst-20251231.htm), early intervention, first-party collections, licenses and third-party agencies
- [LoanPro](https://www.loanpro.io/), the collections suite
- [Peach Finance (SoFi Tech Credit Solutions)](https://www.peachfinance.com/), the FDCPA, SCRA, TCPA, UDAP and Reg F compliance module
- [Nortridge Loan System](https://www.nortridge.com/), rules-based collections workflows
