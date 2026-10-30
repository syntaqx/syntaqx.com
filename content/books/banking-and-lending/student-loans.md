+++
title = "Student Loans"
description = "Federal and private student loans: Direct Loans and their servicers, the 2025 law's limits and repayment plans, SAVE's end, PSLF, refinancing and discharge."
category = "Banking & Lending Industry"
order = 2437
part = "Lending Products"
tags = ["banking", "lending", "student-loans", "repayment-plans", "pslf", "servicing"]
+++

Student lending is two markets that share a borrower and almost nothing else. The federal government is the lender for most of it: about $1.6 trillion of Direct Loans to 38.5 million borrowers, made without underwriting to anyone enrolled in an eligible program, priced by a statutory formula, and serviced by contractors under rules set by Congress and the Department of Education. Private lenders (banks, credit unions, specialty lenders and refinancers) hold a much smaller book, underwrite it like any consumer loan, usually with a cosigner, and disclose it under a subpart of Regulation Z written for it. The federal side changed more in 2025 and 2026 than in the previous decade: the One Big Beautiful Bill Act capped graduate and parent borrowing, ended Grad PLUS for new borrowers, created a new income-driven plan and a tiered standard plan, and set an end date for the older plans, while a court order ended the SAVE plan and borrowers in it were moved.

This chapter covers both sides: the market and its lenders and servicers, federal loans and their pricing, private loans and their disclosures, the federal servicing system, the 2025-26 changes with a worked payment comparison, Public Service Loan Forgiveness and other forgiveness, refinancing, and discharge, including bankruptcy. The schedule and payment engine is the one in [Personal & Installment Loans](/books/banking-and-lending/installment-loans#how-to-build-it); the servicing mechanics (boarding, payment application, transfers) are in [Loan Servicing](/books/banking-and-lending/loan-servicing), and collections and default in [Collections & Recovery](/books/banking-and-lending/collections).

## How the Platforms Do It

As of October 2026, from filings, the Congressional Research Service and servicer pages:

| Organization | Role | Scale | Notes |
| --- | --- | --- | --- |
| **Department of Education (Federal Student Aid)** | Lender and owner of Direct Loans | About $1.6 trillion of Direct Loans for 38.5 million borrowers at March 31, 2026 | Contracts servicing out; signed an agreement in March 2026 to move defaulted-loan collection to the Treasury (below) |
| **Nelnet** | Federal and private servicer, Nelnet Bank, legacy FFELP owner | Services $519.2 billion for 15.2 million borrowers across ED, FFELP, private and other loans (second quarter of 2026) | Nelnet Bank held $1.64 billion of loans; its own loan portfolio is $7.83 billion, mostly FFELP |
| **Sallie Mae (SLM)** | Private in-school lender (bank) | $3.4 billion of private education loan originations in the third quarter of 2026, up 15% | Graduate originations up 119% in the first academic year after the federal Grad PLUS change; 4.2% of loans in repayment delinquent |
| **Navient** | FFELP holder and private lender and refinancer (Earnest) | $26.6 billion of FFELP loans and $15.7 billion of private loans at June 30, 2026 | Private originations of $815 million in the second quarter of 2026, $735 million of them Earnest refinancing; moved its ED servicing to Maximus in 2021 |
| **SoFi** | Bank lender: refinancing and in-school loans | $2.92 billion of student loan originations in the third quarter of 2026, up 96% | Holds student loans at fair value ($18.52 billion at September 30, 2026) |

Three things stand out. **The government is the biggest lender and doesn't service its loans:** ED owns the federal book and pays contractors to run it, so a "federal servicer" is a vendor running another party's portfolio under that party's rules. **Private lending grows when federal lending shrinks:** Sallie Mae's graduate originations more than doubled once Grad PLUS closed to new borrowers. **Refinancing is a different product from in-school lending:** Earnest's and SoFi's volumes come from graduates with income moving federal or private loans to a lower private rate, underwritten on their own credit.

## The Market

The Federal Reserve Bank of New York put student loan balances at $1.651 trillion at the end of June 2026, down $7 billion in the quarter. Its measure of balances moving into serious delinquency (90 days or more) fell from 12.88% to 7.83% over the year, a figure it says is distorted by defaults being re-reported after the pandemic pause, when federal loans weren't reported as delinquent for years. Most of the balance is federal; private and legacy FFEL loans are the rest.

The legacy **Federal Family Education Loan (FFEL)** program, in which private lenders made loans the government guaranteed, no longer makes new loans, and its remaining loans are held by companies like Navient and Nelnet and serviced on their own platforms. Every new federal student loan is a **Direct Loan**, made by ED.

## Federal Loans

The Direct Loan program makes four kinds of loan: **Subsidized** (undergraduates with financial need; the government pays interest while the student is in school), **Unsubsidized** (undergraduate and graduate, interest accrues from disbursement), **PLUS** (for graduate students until the 2026 change, and for parents of dependent undergraduates, with a credit check for an adverse credit history but no underwriting of income), and **Consolidation** (combining federal loans into one, at the weighted average of their rates rounded up to the nearest one-eighth of a percent, with no fee). The school certifies eligibility and the amount, and the loan disburses to the school.

**Rates are set once a year by formula and fixed for the life of the loan.** For loans first disbursed from July 1 through June 30, the rate is the high yield of the 10-year Treasury note at the May auction plus a statutory add-on, subject to a cap. For 2026-27, the May 12, 2026 auction yield was 4.468%:

| Loan | Add-on | Cap | 2026-27 rate | 2025-26 rate |
| --- | --- | --- | --- | --- |
| Undergraduate Subsidized and Unsubsidized | 2.05% | 8.25% | **6.52%** | 6.39% |
| Graduate and professional Unsubsidized | 3.60% | 9.50% | **8.07%** | 7.94% |
| PLUS (parent and continuing graduate borrowers) | 4.60% | 10.50% | **9.07%** | 8.94% |

**Origination fees are deducted from each disbursement:** 1.057% for Subsidized and Unsubsidized loans and 4.228% for PLUS loans first disbursed from October 1, 2026 (the statutory 1% and 4% increased by sequestration, unchanged from the prior year). A $5,500 undergraduate loan disburses $5,441.86 to the school, and the borrower owes $5,500.

For the system, the rate is a function of the loan type and the first disbursement date, looked up from a table with one row per award year, and the fee is a function of the type and the first disbursement date on the federal fiscal year (October to September), so one loan's rate and fee come from different calendars.

## Private Loans and Their Disclosures

A private education loan is made by a bank, credit union or other lender for postsecondary expenses, outside the federal program. It's underwritten on credit (most undergraduates need a cosigner), may be fixed or variable, and is usually certified by the school against the cost of attendance less other aid, so the lender doesn't fund more than the student needs. Regulation Z gives these loans their own disclosure regime (12 CFR 1026.46 to 1026.48), separate from other closed-end credit:

- **Three disclosures at three moments:** application or solicitation disclosures with the application (with an example of the total cost on a $10,000 loan, the alternative of federal loans, and the self-certification notice); approval disclosures with the approval notice (the terms and the date the offer expires); and final disclosures after the borrower accepts (including the right to cancel).
- **A 30-day acceptance period:** the borrower has at least 30 calendar days from receiving the approval disclosure to accept, and the rate and terms can't change in that time except as the disclosed variable rate index moves.
- **A three-business-day right to cancel** after the final disclosure, without penalty, and **no disbursement until it ends**.
- **The self-certification form:** before consummation the lender must obtain ED's form, signed by the borrower, which shows the cost of attendance and the aid already received.
- **Co-branding limits** on implying the school endorses the lender, and preferred-lender information to schools each year.

These are clocks, and the system treats them as gates: an approval that expires, an acceptance that opens the final disclosure, and a cancellation period that holds the disbursement ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).

## The Federal Servicing System

ED owns the federal loans and contracts their servicing to private servicers, who bill, take payments, process plan enrollments, deferments and forbearances, certify income and employment, and report to the bureaus, all on ED's rules. Nelnet and MOHELA are among them, and Maximus took over Navient's ED-owned accounts in 2021 by contract novation, on the same platform and with Navient staff moving to it. For an engineer, the defining traits of federal servicing are:

- **The rules come from statute and ED, not from the note.** Repayment plans, deferments, forbearance limits, qualifying payment counts and discharge rules are set by law and change by law, and the servicer implements them across tens of millions of accounts at once, often against a statutory effective date.
- **Accounts move between servicers.** When a contract ends or ED reassigns a portfolio, borrowers move with their full history: plan, payment counts, deferment and forbearance months, income certifications and capitalized interest. A conversion that drops a month of qualifying payment history changes a borrower's forgiveness date.
- **Default is at 270 days** of delinquency, after which collection tools include administrative wage garnishment of up to 15% of disposable pay and Treasury offset of tax refunds and federal benefits. From July 1, 2027, a loan can be rehabilitated out of default twice, and loans made from that date have a rehabilitation payment of at least $10.

The federal collection apparatus moved in 2025 and 2026. Collections on defaulted loans resumed in May 2025 after the pandemic pause; according to press reports, ED paused wage garnishment and Treasury offset again on January 16, 2026 while it implemented the new plans. <!-- source-gap: fsa-collections-treasury | secondary | ED paused AWG and Treasury offset on Jan 16, 2026 | closes with: an ED press release or FSA electronic announcement of the January 2026 pause | checked: 2026-10-30 --> I found that pause only in secondary reporting. On March 19, 2026, ED and the Treasury announced a partnership under which the Treasury assumes "operational responsibility for collecting on defaulted Federal student loan debt" first, with operational support for non-defaulted loans and other Federal Student Aid functions to follow "to the extent practicable and permitted by law." Whoever runs it, collection on a federal loan is a set of statutory remedies with their own notices and hearings, which [Collections & Recovery](/books/banking-and-lending/collections) covers.

## The 2025-26 Changes

The One Big Beautiful Bill Act (Pub. L. 119-21, signed July 4, 2025) rewrote federal student lending in Title VIII. The Congressional Budget Office estimated the Title VIII changes would reduce federal spending by about $284 billion, most of it from the repayment plan changes.

**Loan limits (section 81001), for periods of instruction beginning on or after July 1, 2026:**

- **Grad PLUS ends for new borrowers.** A student enrolled in a program on June 30, 2026 who already has a Direct Loan for it keeps the old limits for the lesser of three academic years or the rest of the program.
- **Graduate Unsubsidized:** $20,500 a year and $100,000 in aggregate; **professional students:** $50,000 a year and $200,000 in aggregate.
- **Parent PLUS:** $20,000 a year per dependent student and $65,000 per student across all parents.
- **A lifetime cap of $257,500** on all federal student borrowing other than Parent PLUS, regardless of repayment or discharge.
- Undergraduate limits are unchanged; loans are prorated for less-than-full-time enrollment, and schools may set lower limits by program.

**Repayment plans (section 82001):**

- **Loans made on or after July 1, 2026** get two plans: a **Tiered Standard** plan with fixed payments over 10 years for a total principal under $25,000, 15 years from $25,000, 20 years from $50,000 and 25 years from $100,000; and the **Repayment Assistance Plan** below. A borrower with older loans who takes a new loan on or after that date has all Direct Loans moved to the new terms.
- **Existing borrowers** keep the current plans through June 30, 2028. Income-Contingent Repayment, the authority PAYE and SAVE were built on, is repealed effective July 1, 2028; a borrower who hasn't chosen by then is placed in RAP, or in Income-Based Repayment for loans RAP doesn't cover.
- **Income-Based Repayment** stays for existing borrowers, without the partial financial hardship test it used to require (from July 4, 2025). It costs 15% of income above 150% of the poverty line, or 10% with forgiveness after 20 years instead of 25 for borrowers whose loans were made from July 1, 2014 and before July 1, 2026, and is capped at the 10-year standard payment.

**The Repayment Assistance Plan** (20 U.S.C. 1087e(q)), available from July 1, 2026, sets the payment from adjusted gross income rather than discretionary income:

- **Base payment:** $120 a year for AGI up to $10,000; 1% of AGI above $10,000 up to $20,000; then one more percentage point for each $10,000 band, to 10% of AGI above $100,000. The percentage applies to all of AGI, not the amount above a threshold.
- **Monthly payment:** the base divided by 12, less **$50 per dependent**, and at least **$10**.
- **Application:** to interest, then fees, then principal.
- **Interest subsidy:** if an on-time payment doesn't cover the month's interest, the unpaid interest isn't charged.
- **Principal match:** if an on-time payment reduces principal by less than $50, ED reduces principal by the lesser of $50 or the payment, less what the payment already applied to principal.
- **Forgiveness** of any remaining balance after **360 qualifying payments**. A borrower who doesn't provide income information pays the 10-year standard amount until they do.

**Deferment and forbearance (section 82002):** loans made on or after July 1, 2027 lose the unemployment and economic hardship deferments, and forbearance is limited to nine months in any 24-month period.

**SAVE's end.** SAVE, the most recent income-contingent plan, was blocked in court and its borrowers were placed in forbearance; interest resumed on those loans on August 1, 2025, without retroactive interest, as reported at the time. Missouri and other states had sued over it in the Eastern District of Missouri (*State of Missouri v. Trump*, No. 4:24-cv-00520-JAR), and ED and the plaintiffs asked the court on December 9, 2025 to enter a final judgment ending it. After the Eighth Circuit directed that judgment on March 9, 2026, the district court on **March 10, 2026** vacated the SAVE final rule (88 FR 43820, July 10, 2023) in full, except for the provision on which deferment and forbearance periods count toward income-driven forgiveness (34 CFR 685.209(k)(4)(iv)), which stays in effect. MOHELA's borrower FAQ says borrowers get 90 days from their servicer's notice to choose a new plan, and that those who don't are placed in the Standard or Tiered Standard plan depending on when their loans were disbursed. For the system, SAVE's end is a mass plan migration: millions of accounts, each with a notice date, a 90-day window, a default placement rule that depends on disbursement dates, and payment counts that have to carry over correctly.

## Worked Numbers: RAP and IBR

A single borrower with no dependents, an adjusted gross income of $55,000, and $40,000 of Direct Loans at 6.52%. The 2026 HHS poverty guideline for one person in the 48 contiguous states is $15,960.

- **RAP:** AGI of $55,000 is in the band above $50,000 up to $60,000, so the base payment is 5% of AGI, $2,750 a year: **$229.17 a month**. With two dependents it would be $129.17.
- **IBR at 10% (a newer borrower):** 150% of the poverty line is $23,940, so income above it is $31,060, and 10% of that is $3,106 a year: **$258.83 a month**. At 15% (an older borrower) it's $388.25.
- **The interest subsidy and match under RAP:** a month's interest on $40,000 at 6.52% is $40,000 × 0.0652 / 12 = $217.33. The $229.17 payment covers it and applies $11.84 to principal; because that's under $50, ED reduces principal by $50 − $11.84 = **$38.16** more, so the balance falls by $50.00 that month. If the borrower's income dropped and the payment were the $10 minimum, the $207.33 of unpaid interest wouldn't be charged and the match would reduce principal by $10, so the balance still falls.
- **The cliff:** RAP's percentage applies to all of AGI, so a raise that crosses a band boundary raises the whole payment: moving from $60,000 to $60,001 of AGI moves the base from 5% ($3,000) to 6% ($3,600.06), $50 a month more for a dollar of income.

The servicing engine has to compute this from a certified income record, recompute it at each annual recertification, apply the payment in the statutory order, post the interest waiver and the match as separate, labeled entries (they're government subsidies, not borrower payments), and count the month as qualifying only if the payment was on time.

## PSLF and Other Forgiveness

**Public Service Loan Forgiveness** cancels the remaining Direct Loan balance after 120 qualifying monthly payments made while the borrower works full time for a qualifying public service employer, and the borrower must still be in such a job when applying (20 U.S.C. 1087e(m)). RAP payments count. A final rule published October 31, 2025, effective July 1, 2026, would have excluded employers found to have a "substantial illegal purpose"; courts in Massachusetts and the District of Columbia vacated it in final judgments on June 30, 2026, ED removed the employer attestation from the PSLF form on July 13, 2026, and its appeals, filed August 27, 2026, are pending as of October 2026.

PSLF is the purest example of a counter the system must keep forever: each month is qualifying or not, by loan, with the reason (employer certification, plan, payment on time, full amount), and the count survives consolidation, servicer transfers and plan changes. Income-driven forgiveness (20 or 25 years under IBR, 360 payments under RAP) is the same counter on a longer clock.

**Taxes.** The 2021 special rule that excluded most student loan discharges from income applied through 2025. The 2025 Act replaced it: from 2026, the tax code permanently excludes discharges on account of death or total and permanent disability, for federal and private loans, if the borrower's Social Security number is on the return (26 U.S.C. 108(f)(5)). My reading is that income-driven forgiveness after 2025 is taxable unless another exclusion applies, so a servicer issuing a Form 1099-C needs to know which kind of discharge it is.

## Refinancing

Refinancing a student loan is a new private loan that pays off old ones, federal or private, underwritten on the borrower's current income and credit. It's how most private student lending to graduates works, and the filings show it growing: Navient's Earnest refinanced $735 million in the second quarter of 2026, up from $443 million a year earlier, and SoFi's student loan originations, mostly refinancing, reached $2.92 billion in the third quarter.

A refinanced federal loan becomes a private loan, so the borrower gives up what exists only in federal law: income-driven plans, PSLF and income-driven forgiveness, the federal deferments and forbearance, and federal discharge rights. The application flow has to say so before the borrower accepts, and the payoff to the federal servicer is a disbursement to a creditor ([Personal & Installment Loans](/books/banking-and-lending/installment-loans#how-to-build-it)'s `loan_disbursements` with `kind = 'refinance_payoff'`), confirmed when the old servicer shows the loan paid in full.

## Discharge

**Federal discharges** are statutory and each has its own evidence: death (on documentation), total and permanent disability, closed school (the school closed while the borrower was enrolled or soon after), borrower defense (the school's misconduct), and PSLF and income-driven forgiveness. The 2022 rules that expanded borrower defense and closed school discharges are delayed by the 2025 Act for loans made before July 1, 2035, so the earlier rules apply to them.

**Bankruptcy.** Student loans, federal and most private, aren't discharged in bankruptcy unless repaying them "would impose an undue hardship on the debtor and the debtor's dependents" (11 U.S.C. 523(a)(8)), which the borrower must prove; courts decide what undue hardship means. On November 17, 2022 the Justice Department, with ED, issued guidance telling government attorneys to stipulate to the facts and recommend discharge of a federal loan when three conditions are met: the debtor presently can't repay (allowable expenses under the IRS Collection Financial Standards exceed income), the inability is likely to persist, and the debtor tried in good faith to repay. Persistence is presumed for a debtor who is 65 or older, has a disability or chronic injury affecting income, has been unemployed for at least five of the last ten years, didn't obtain the degree the loan was for, or whose loan has been in repayment status (other than in-school) for at least ten years. The debtor supplies the facts on a sworn attestation form, but still files an adversary proceeding, and the bankruptcy judge still decides. The press release now sits in DOJ's archive; I found no notice withdrawing the guidance as of October 2026. For a servicer, the presumptions are data it already holds (loan status history, disbursement dates, completion), which ED is expected to supply in its litigation report. The private loan exception is narrower than it looks: 523(a)(8)(B) covers "qualified education loans" as the tax code defines them, so in my reading a private loan for costs beyond the cost of attendance may be dischargeable like other debt, which is one more reason the school's certification belongs in the loan file.

## How to Build It

These are deltas against [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model). A student loan is an `accounts` row (`account_kind = 'loan'`) with a `loans` row (`amortization = 'level_payment'`, or `interest_only` while in school or deferment), versioned `payment_schedules` with `schedule_installments`, and the disbursement and payoff tables from [Personal & Installment Loans](/books/banking-and-lending/installment-loans#how-to-build-it). For a federal loan the institution of record is the servicer's client (ED), recorded on `loans.owner`, with the contractor as `loans.servicer`. A cosigner is an `account_parties` row with `role = 'co_borrower'`. This chapter adds the loan program terms, school certifications, income certifications, plan enrollments, deferment and forbearance periods, monthly qualifying payment records and discharges.

```sql
CREATE TABLE student_loan_terms (
  account_id           UUID PRIMARY KEY REFERENCES accounts (id),
  program              TEXT NOT NULL CHECK (program IN ('direct_subsidized', 'direct_unsubsidized',
                         'direct_plus_graduate', 'direct_plus_parent', 'direct_consolidation',
                         'ffel', 'private_in_school', 'private_refinance')),
  student_party_id     UUID REFERENCES parties (id),     -- differs from the borrower on Parent PLUS
  school_ref           TEXT,                              -- the school's federal school code
  award_year           TEXT,                              -- '2026-27'; selects the rate row
  first_disbursed_on   DATE,
  origination_fee_bps  INT NOT NULL DEFAULT 0,             -- 106 for 1.057%, by federal fiscal year
  new_terms            BOOLEAN NOT NULL DEFAULT false,      -- made on or after July 1, 2026, or moved to them
  grandfathered_until  DATE,                              -- interim borrowers under the old limits
  self_certification_ref TEXT,                            -- private loans: the signed ED form
  qualified_education_loan BOOLEAN                        -- private loans: within cost of attendance
);

CREATE TABLE school_certifications (         -- what the school confirmed, before disbursement
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id           UUID NOT NULL REFERENCES accounts (id),
  enrollment_status    TEXT NOT NULL,
  cost_of_attendance   BIGINT NOT NULL,
  other_aid            BIGINT NOT NULL,
  certified_amount     BIGINT NOT NULL,
  period               DATERANGE NOT NULL,
  certified_at         TIMESTAMPTZ NOT NULL
);

ALTER TABLE loan_disbursements DROP CONSTRAINT loan_disbursements_kind_check;
ALTER TABLE loan_disbursements ADD CONSTRAINT loan_disbursements_kind_check
  CHECK (kind IN ('to_borrower', 'to_creditor', 'fee_withheld', 'refinance_payoff', 'to_school'));

CREATE TABLE income_certifications (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id             UUID NOT NULL REFERENCES parties (id),
  tax_year             SMALLINT,
  adjusted_gross_income BIGINT NOT NULL,      -- includes a spouse's unless filing separately
  family_size          SMALLINT NOT NULL,
  dependents           SMALLINT NOT NULL,
  source               TEXT NOT NULL CHECK (source IN ('irs_data', 'alternative_documentation',
                         'self_reported_zero')),
  document_ref         TEXT,
  valid_from           DATE NOT NULL,
  recertify_by         DATE NOT NULL
);

CREATE TABLE repayment_plan_enrollments (     -- one borrower's plan over time, across loans
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id             UUID NOT NULL REFERENCES parties (id),
  plan                 TEXT NOT NULL CHECK (plan IN ('standard_10', 'tiered_standard', 'graduated',
                         'extended', 'ibr', 'ibr_new', 'icr', 'paye', 'save', 'rap', 'private')),
  income_certification_id UUID REFERENCES income_certifications (id),
  monthly_payment      BIGINT NOT NULL,
  computation          JSONB NOT NULL,         -- band, rate, dependents, poverty line used, cap applied
  rule_version         TEXT NOT NULL,          -- the statute and ED guidance version it ran under
  reason               TEXT NOT NULL CHECK (reason IN ('borrower_choice', 'default_placement',
                         'statutory_migration', 'recertification', 'servicer_transfer')),
  notice_disclosure_id UUID REFERENCES disclosures (id),
  valid_during         DATERANGE NOT NULL
);

CREATE TABLE plan_enrollment_loans (
  enrollment_id        UUID NOT NULL REFERENCES repayment_plan_enrollments (id),
  account_id           UUID NOT NULL REFERENCES accounts (id),
  PRIMARY KEY (enrollment_id, account_id)
);

CREATE TABLE payment_pauses (                -- deferments and forbearances
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id           UUID NOT NULL REFERENCES accounts (id),
  kind                 TEXT NOT NULL CHECK (kind IN ('deferment', 'forbearance', 'administrative')),
  reason               TEXT NOT NULL,          -- 'in_school', 'unemployment', 'economic_hardship', 'military', 'save_litigation', ...
  interest_accrues     BOOLEAN NOT NULL,
  counts_toward        TEXT[] NOT NULL DEFAULT '{}',   -- 'rap', 'ibr', 'pslf' where the statute says so
  rule_ref             TEXT NOT NULL,
  valid_during         DATERANGE NOT NULL,
  approved_at          TIMESTAMPTZ NOT NULL
);

CREATE TABLE qualifying_months (             -- the forgiveness counters, one row per loan, program and month
  account_id           UUID NOT NULL REFERENCES accounts (id),
  program              TEXT NOT NULL CHECK (program IN ('pslf', 'ibr', 'rap', 'icr')),
  month                DATE NOT NULL,          -- first of the month
  qualifies            BOOLEAN NOT NULL,
  basis                TEXT NOT NULL,          -- 'on_time_payment', 'deferment', 'forbearance_credit', 'adjustment'
  loan_payment_id      UUID REFERENCES loan_payments (id),
  employer_certification_ref TEXT,            -- PSLF only
  determined_by_rule   TEXT NOT NULL,
  PRIMARY KEY (account_id, program, month)
);

CREATE TABLE subsidy_postings (               -- RAP interest waivers and principal matches
  loan_payment_id      UUID NOT NULL REFERENCES loan_payments (id),
  kind                 TEXT NOT NULL CHECK (kind IN ('interest_waiver', 'principal_match')),
  amount               BIGINT NOT NULL CHECK (amount > 0),
  journal_entry_id     UUID NOT NULL REFERENCES journal_entries (id),
  PRIMARY KEY (loan_payment_id, kind)
);

CREATE TABLE loan_discharges (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id           UUID NOT NULL REFERENCES accounts (id),
  kind                 TEXT NOT NULL CHECK (kind IN ('pslf', 'ibr', 'rap', 'icr', 'death',
                         'total_permanent_disability', 'closed_school', 'borrower_defense',
                         'bankruptcy', 'other')),
  amount               BIGINT NOT NULL,
  effective_on         DATE NOT NULL,
  evidence_ref         TEXT NOT NULL,          -- the certification, determination or court order
  tax_treatment        TEXT NOT NULL CHECK (tax_treatment IN ('excluded', 'reportable')),
  form_1099c_ref       TEXT,
  journal_entry_id     UUID NOT NULL REFERENCES journal_entries (id)
);
```

A borrower's payment is computed by a versioned function of the enrollment's plan and its income certification, and `computation` stores the inputs it used (the band, the percentage, the poverty guideline year, the dependents, any cap), so a recalculation after a rule change is a new enrollment row with `reason = 'statutory_migration'`, never an edit ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)). Each on-time RAP payment allocates to interest, fees and principal in `payment_allocations` and, where the statute applies, posts its interest waiver and principal match to `subsidy_postings` with their own journal entries, so the subsidy is visible in the ledger and to the owner. `qualifying_months` is derived nightly from payments, pauses and employer certifications but stored, because it's the record a borrower's forgiveness date rests on and must travel intact in a servicer transfer; its row count by program is the counter. Statutory dates (July 1, 2026, July 1, 2027, June 30, 2028) live in rule tables, not code, and the forbearance limit is a check against `payment_pauses` over a rolling 24 months. For private loans, the acceptance window, cancellation period and self-certification are gates on disbursement, read from `disclosures` delivery times.

## Auditing

Federal servicing is audited by ED, its inspector general and the CFPB, and private lending by bank examiners; the general design is in [Audit Trails](/docs/architecture/audit-trails). Make sure the record shows:

- **Each loan's program, award year, rate row and fee,** and whether it's on the new terms and why.
- **Every school certification and disbursement,** and for private loans the self-certification form, the three disclosures, the acceptance date and the cancellation period.
- **Every plan enrollment with its computation inputs and rule version,** every income certification with its source, and every migration with its notice and placement rule.
- **Every pause,** with its reason, whether interest accrued and what it counted toward, checked against the statutory limits.
- **Every qualifying month by program,** with its basis, and an export of the full history for any servicer transfer.
- **Every subsidy posting and discharge,** with its evidence, journal entry and tax treatment.

## What This Means for the System You Build

- **Drive federal loans from rule tables keyed by statute and date:** rates by award year, fees by fiscal year, limits, plans and effective dates.
- **Store every plan payment computation with its inputs,** and treat a law change as a migration that writes new enrollments with notices.
- **Count qualifying months as stored facts by loan and program,** and make them survive consolidation, plan changes and servicer transfers.
- **Post RAP's interest waiver and principal match as their own entries,** separate from the borrower's payment.
- **Gate private disbursements on the Regulation Z clocks** and keep the school certification and self-certification in the file.
- **Warn refinancing applicants what federal protections they lose,** and confirm the federal payoff before boarding the new loan.
- **Record each discharge's kind, evidence and tax treatment,** because the 1099-C depends on it.

## References

**Law and regulation**

- [Cornell LII: 20 U.S.C. 1087e, terms and conditions of Direct Loans](https://www.law.cornell.edu/uscode/text/20/1087e), the Tiered Standard plan terms, the Repayment Assistance Plan's payment bands, dependent reduction, minimum, payment order, interest subsidy, principal match and 360-payment forgiveness, PSLF in (m), and the July 1, 2028 ICR transition
- [Cornell LII: 20 U.S.C. 1098e, income-based repayment](https://www.law.cornell.edu/uscode/text/20/1098e), the removal of the partial financial hardship test, the 15% and 10% amounts above 150% of the poverty line, 20- and 25-year forgiveness and the standard payment cap
- [Cornell LII: 26 U.S.C. 108, income from discharge of indebtedness](https://www.law.cornell.edu/uscode/text/26/108), the permanent exclusion for death and disability discharges from 2026 and the SSN requirement
- [Cornell LII: 11 U.S.C. 523, exceptions to discharge](https://www.law.cornell.edu/uscode/text/11/523), the undue hardship standard for government and qualified education loans
- [CFPB: Regulation Z § 1026.46, private education loans, special disclosure requirements](https://www.consumerfinance.gov/rules-policy/regulations/1026/46/), the definition of a private education loan and the timing of the three disclosures
- [CFPB: Regulation Z § 1026.47, content of disclosures](https://www.consumerfinance.gov/rules-policy/regulations/1026/47/), the application, approval and final disclosure contents including the $10,000 cost example and federal loan alternatives
- [CFPB: Regulation Z § 1026.48, limitations on private education loans](https://www.consumerfinance.gov/rules-policy/regulations/1026/48/), co-branding limits, the 30-day acceptance period, the three business day right to cancel, the bar on disbursement and the self-certification form

**Government reports and announcements**

- [CRS R48727: Student loan provisions of the 2025 reconciliation law](https://www.everycrsreport.com/reports/R48727.html), the Title VIII loan limits, repayment plan changes, deferment and forbearance changes, rehabilitation, the borrower defense and closed school delay, and the CBO estimates
- [CRS IF12267: Federal student loans (July 24, 2026)](https://www.everycrsreport.com/files/2026-07-24_IF12267_f0125b7b747867911eca23a89d2a487eff4afbc4.html), the Direct Loan portfolio and borrower count, loan types, limits, consolidation, default at 270 days and collection tools
- [CRS IF13075: The Repayment Assistance Plan](https://www.everycrsreport.com/reports/IF13075.html), who gets the new plans and how existing loans move
- [CRS LSB11472: The PSLF employer eligibility rule (August 31, 2026)](https://www.everycrsreport.com/reports/LSB11472.html), the October 31, 2025 rule, its July 1, 2026 effective date, the June 30, 2026 vacatur, the form change and the appeals
- [FSA: Interest rates for Direct Loans first disbursed July 1, 2026 to June 30, 2027](https://fsapartners.ed.gov/knowledge-center/library/electronic-announcements/2026-06-04/interest-rates-federal-direct-loans-first-disbursed-between-july-1-2026-and-june-30-2027), the May 12, 2026 auction yield, add-ons, caps and rates
- [FSA: Interest rates for Direct Loans first disbursed July 1, 2025 to June 30, 2026](https://fsapartners.ed.gov/knowledge-center/library/electronic-announcements/2025-05-30/interest-rates-direct-loans-first-disbursed-between-july-1-2025-and-june-30-2026), the 2025-26 rates
- [FSA: FY27 sequester-required changes to Title IV programs](https://fsapartners.ed.gov/knowledge-center/library/electronic-announcements/2026-05-13/fy27-sequester-required-changes-title-iv-student-aid-programs), the 1.057% and 4.228% origination fees from October 1, 2026
- [Treasury: Treasury and Education announce historic Federal Student Assistance partnership (March 19, 2026)](https://home.treasury.gov/news/press-releases/sb0419), the Treasury assuming operational responsibility for collecting defaulted loans and later phases "to the extent practicable and permitted by law"
- [Education Department: Historic Federal Student Assistance partnership (March 19, 2026)](https://www.ed.gov/about/news/press-release/us-department-of-education-and-us-department-of-treasury-announce-historic-federal-student-assistance-partnership), ED's announcement of the same agreement
- [Justice Department: Guidance for Department attorneys regarding student loan bankruptcy litigation (November 17, 2022)](https://www.justice.gov/civil/file/1553726/dl), the three conditions, the IRS Collection Financial Standards test, the five presumptions of future inability, good faith and the attestation form
- [Justice Department: A fairer and more accessible bankruptcy discharge process for student loan borrowers (November 17, 2022)](https://www.justice.gov/archives/opa/pr/justice-department-and-department-education-announce-fairer-and-more-accessible-bankruptcy), the announcement, now in DOJ's archive
- [HHS ASPE: Poverty guidelines](https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines), the 2026 guideline of $15,960 for one person
- [Federal Reserve Bank of New York: Household debt and credit, Q2 2026 (August 11, 2026)](https://www.newyorkfed.org/newsevents/news/research/2026/20260811), student loan balances and the distorted serious delinquency flow

**Litigation**

- [Order in *State of Missouri v. Trump*, No. 4:24-cv-00520-JAR (E.D. Mo. March 10, 2026)](https://www.moept.uscourts.gov/sites/moed/files/documents/424c00520-0102.pdf), the Eighth Circuit's March 9, 2026 judgment, the joint motion of December 9, 2025 granted, and the SAVE final rule (88 FR 43820) vacated except 34 CFR 685.209(k)(4)(iv)

**Filings**

- [Sallie Mae (SLM): Third quarter 2026 results (Form 8-K exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1032033/000103203326000051/slm102226ex991.htm), private education loan originations, graduate originations after the PLUS change and delinquency
- [Navient: Second quarter 2026 supplement (Form 8-K exhibit 99.2)](https://www.sec.gov/Archives/edgar/data/1593538/000119312526338039/navi-ex99_2.htm), FFELP and private loan balances and Earnest refinance and in-school originations
- [Navient: Form 8-K exhibit 99.1 (September 28, 2021)](https://www.sec.gov/Archives/edgar/data/1593538/000165495421010517/navi_ex991.htm), the transfer of ED servicing to Maximus by contract novation
- [Nelnet: Second quarter 2026 results (Form 8-K exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1258602/000125860226000041/aex991-080626xearningsrele.htm), servicing volume and borrowers, Nelnet Bank and the loan portfolio
- [SoFi Technologies: Third quarter 2026 results (Form 8-K exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1818874/000181887426000065/a2026q3earningsrelease.htm), student loan originations and loans at fair value

**In practice**

- [MOHELA: SAVE plan FAQ](https://mohela.studentaid.gov/DL/resourceCenter/SAVEPlanFaq.aspx), the 90-day choice window, default placement and RAP's July 1, 2026 availability
- [AACOM: ED to restart interest accrual on SAVE loans (July 14, 2025)](https://www.aacom.org/news-reports/news/2025/07/14/ed-to-restart-interest-accrual-on-save-loans), the August 1, 2025 interest restart for SAVE forbearance, as reported
- [Daily Montanan: report on the January 2026 collections pause](https://dailymontanan.com/?p=34826), the January 16, 2026 pause and the 15% garnishment limit, as reported
