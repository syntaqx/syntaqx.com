+++
title = "Earned Wage Access"
description = "Earned wage access: employer-integrated and direct-to-consumer models, fees and tips, the CFPB arc to its 2025 advisory opinion, state laws and payroll."
category = "Banking & Lending Industry"
order = 2428
part = "Fintech and BaaS"
tags = ["banking", "fintech", "earned-wage-access", "payroll", "regulation-z", "state-law"]
+++

Earned wage access (EWA) lets a worker take part of their pay before payday, for wages already earned in the current pay period. The provider sends the money now and gets it back from the next paycheck. Whether that is a loan is the question the whole industry is built around. If it's credit, the Truth in Lending Act applies, each expedite fee is a finance charge, the APR on a $3 fee for a $100 advance repaid in a week runs into triple digits, and state lending caps and licenses follow. If it isn't, it is a payroll service with a fee schedule. Federal regulators answered "not credit" in 2020, "credit" in a 2024 proposal, and "not credit, under four conditions" in December 2025. The states answered for themselves: most statutes enacted since 2023 say EWA isn't a loan and regulate it as its own product, while Connecticut and Maryland put it under their consumer lending laws.

The engineering follows the legal line. A product built to the federal conditions reads accrued wages from payroll data, recovers through the payroll process rather than the worker's bank account, never pulls a credit report, and has no recourse when the deduction comes up short. A product that does any of those differently may still be lawful, but under different rules. This chapter covers the two models and how they make money, the federal history to the advisory opinion now in force, the state laws as of October 2026, a worked fee and cumulative-access example, payroll integration, and the data model. Overdraft-style advances such as cash advance accounts are in [Overdraft, NSF & Fees](/books/banking-and-lending/overdraft-and-fees#the-product-lines), payday loans in [Personal & Installment Loans](/books/banking-and-lending/installment-loans#small-dollar-and-payday-loans), and the neobanks that bundle EWA into a checking account in [Neobanks & Consumer Fintech](/books/banking-and-lending/neobanks#earned-wage-access-and-the-credit-question).

## How the Platforms Do It

As of October 2026, from providers' own pages and the CFPB's descriptions:

| Provider | Model | Access and limits | What the worker pays | Notes |
| --- | --- | --- | --- | --- |
| **DailyPay** | Employer-integrated | Earned pay as the employer's payroll data shows it | Standard next-business-day transfer free; instant transfer "fee may apply", $3.99 on its card fee schedule; fees waived to the DailyPay Card with direct deposit | Card issued by The Bancorp Bank, N.A. |
| **Payactiv** | Employer-integrated (the employer must participate) | Earned pay per employer settings | Several no-fee options; real-time to the Payactiv Visa card free with a qualifying direct deposit of $200 or more per pay period, otherwise $2.49; other instant destinations $2.49 or $3.49 | Its 2020 CFPB sandbox approval was terminated at its request in 2022 so it could change its fee model |
| **EarnIn** | Direct-to-consumer | Up to $200 a day and $1,000 per pay period, lower in some states | Standard transfer free in 1 to 3 business days; Lightning Speed $3.99; optional tips | "No interest, no credit check, no mandatory fees" |
| **Chime** (MyPay) | Direct-to-consumer, inside a neobank account; requires qualifying direct deposits | A "$20 - $1000 Credit Limit per pay period" in the fine print (the page headlines up to $750); minimum advance $20 | Standard free within 24 hours; instant "3% of the advance amount ($2 minimum, $5 maximum)" | Chime reported $8.8 billion of transactions in the first nine months after its 2024 launch, per the CFPB's 2025 advisory opinion; Chime's own disclosure calls the limit a credit limit |

Three patterns hold across them. **The free option exists everywhere,** because most state laws require one and because the federal analysis of expedite fees turns on whether the worker could have chosen the free path. **Speed is the product:** in the CFPB's sample of employer-integrated providers, expedite fees were 96.6% of fees consumers paid, and about 90% of workers paid at least one. **Direct-to-consumer providers and employer-integrated ones are converging:** the CFPB notes that some D2C providers now read payroll records and recover through the payroll process instead of debiting the worker's bank account, which is exactly what moves a product across the federal line.

## Two Models

**Employer-integrated** (the CFPB says employer-partnered). The provider contracts with the employer and connects to its payroll system or payroll processor. It knows hours worked and pay rates, so it can compute accrued wages directly, and at payday the payroll process sends the advanced amount (plus any fee) to the provider and the remainder to the worker. Revenue comes from employer payments, a share of interchange on a card the worker is paid onto, expedite fees and, less often, subscriptions. The employer usually doesn't pay much, and in the CFPB's sample employer subsidies were about 5% of fee revenue.

**Direct-to-consumer (D2C).** The provider contracts with the worker alone. It estimates accrued wages, usually from the worker's bank transactions, employment verification or location and timesheet data, and recovers by debiting the bank account the paycheck lands in, on payday. Revenue comes from expedite fees, tips and subscriptions. Recovery from a bank account is where D2C picks up deposit-side risk: a debit that arrives before the paycheck or after other debits can overdraw the account, which is why Connecticut's statute makes the provider reimburse overdraft and NSF fees its debits cause, and Nevada's does when a debit comes earlier than disclosed or for a different amount (NRS 604D.400).

The market is large enough to matter. The CFPB's July 2024 Data Spotlight estimated the employer-integrated market at **$22.8 billion across 214 million transactions in 2022**, up from $3.2 billion and 18.6 million in 2018, with 7.2 million workers using it at least once; D2C providers issued about **$9.1 billion to about 3 million workers** the same year. In its eight-firm sample the average employer-integrated transaction was about **$106**, the average fee per fee-paying transaction about **$3.18**, and workers averaged around 27 transactions a year. Charge-off rates in 2022 were **0.3%** for employer-integrated providers and **6.3%** in the D2C sample: the gap between reading payroll and estimating it.

## The Federal Arc

Six documents, as of October 2026:

| Date | Document | What it said |
| --- | --- | --- |
| Dec 10, 2020 | Advisory opinion, 85 FR 79404 | A "Covered EWA Program" (employer-integrated, free to the worker, no recourse) isn't credit under Regulation Z |
| Dec 30, 2020 | Sandbox approval for Payactiv | Temporary safe harbor for Payactiv's products; terminated at Payactiv's request on June 30, 2022, effective immediately |
| Jul 31, 2024 | Proposed interpretive rule, 89 FR 61358 | All EWA, employer-integrated or D2C, is credit; expedite fees and some tips are finance charges. Never finalized |
| Jan 15, 2025 | Advisory opinion, 90 FR 3622 | Withdrew the 2020 opinion |
| May 12, 2025 | Withdrawal, 90 FR 20084 | Withdrew a batch of guidance documents, the 2020 opinion and its January 2025 rescission among them |
| Dec 23, 2025 | Advisory opinion, 90 FR 60069, effective on publication | Covered EWA isn't credit; expedite fees and bona fide tips aren't finance charges in the normal course; withdraws the 2024 proposal |

There was never a final rule treating EWA as credit. The 2024 document was a proposed interpretive rule, and the December 2025 opinion formally withdrew it.

**The four conditions.** The 2025 opinion defines **Covered EWA** as EWA with all of these characteristics:

1. **Within accrued wages, from payroll data.** No transaction exceeds the accrued cash value of the wages the worker has earned up to that moment (what the worker would be owed under state law on separation), determined from payroll data, not from the worker's statements, estimates or predictions. A transaction that pushes the worker's cumulative EWA in the pay period above accrued wages, counting other providers, isn't covered, though earlier transactions may be.
2. **Payroll process deduction.** The provider is repaid at the next payroll event through instructions the payroll processor (or employer) acts on, without debiting the worker's regular account after wages arrive. The opinion's examples: the processor pays the provider and sends the rest to the worker; the processor pays an account held for the worker's benefit used only to repay the provider; or the processor pays all wages to the provider, which pays the balance on. One extra deduction at the next payroll is allowed after a technical or administrative error, such as an API failure; a garnishment that shrinks the paycheck is not such an error.
3. **No recourse, disclosed and warranted.** Before providing EWA, the provider clearly and conspicuously tells the worker, and warrants in the contract, that it has no legal or contractual claim if the deduction falls short (including no right to take payment from the worker's accounts), and that it won't collect, sell or place the amount as a debt, or report it to a consumer reporting agency.
4. **No credit underwriting.** The provider doesn't assess the individual worker's credit risk, directly or indirectly, including by pulling credit reports or scores.

The opinion drops two limits of the 2020 version: the product may charge the worker, and a D2C provider qualifies if it meets the conditions. Its reasoning is that with no liability on the worker there is no "debt", so no credit, whatever the price.

**Fees and tips.** For any EWA that *is* credit, the opinion says expedited delivery fees aren't finance charges in the normal course, but can be if the provider "makes it too difficult" to choose free delivery, and that a bona fide tip "cannot be a finance charge" while a tip that isn't really voluntary can be. Both are facts-and-circumstances tests, which makes the user interface evidence: the screen order, the default delivery speed, the default tip, and how many taps the free path takes.

An advisory opinion is interpretation, not a rule. It binds the CFPB's own enforcement approach, not courts, states or private plaintiffs, and the opinion itself notes that a federal court found a D2C provider's fees could be finance charges (*Orubo v. Activehours*, N.D. Cal. April 30, 2025). In Congress, the House Financial Services Committee ordered H.R. 9330, the Earned Wage Access Consumer Protection Act, reported by 29 to 22 at its June 30, 2026 markup, and reported it on September 1, 2026 (H. Rept. 119-790). As reported, the bill would make compliant EWA, its fees and its tips not credit, a loan or a finance charge under federal law, require a no-cost option for any amount offered for a fee, set the default tip at $0, and preempt state laws that treat compliant EWA as credit or a loan or "prevent or significantly interfere with" offering it, while keeping states' general fraud and UDAP laws. As of October 2026 govinfo published no House-passed version, so it hadn't passed the House.

## State Laws

Most EWA statutes follow one template: EWA isn't a loan or money transmission, fees aren't finance charges, the provider registers or is licensed, offers at least one free option, makes tips voluntary with a zero option, and gives up late fees, interest, collections, lawsuits and credit reporting. Two states went the other way. As of October 2026:

| State | Law | In force | License or registration | Notable rules |
| --- | --- | --- | --- | --- |
| **Nevada** | NRS ch. 604D (2023) | 2023, most sections through Dec 31, 2029 | License from the Commissioner of Financial Institutions; $35,000 bond | At least one no-cost option; tips excluded from "fee", zero option, and disclosure that tips don't go to a specific employee; no fee sharing with employers; no credit reports for eligibility; not a loan or money transmission |
| **Missouri** | RSMo 361.749 (SB 103, 2023; amended 2026) | Aug 28, 2023; current text Aug 28, 2026 | License from the Division of Finance under the current text | Tips voluntary and not a condition; employer-paid fees are the no-cost route; no interest, credit reporting, credit scores, credit card repayment, lawsuits or collectors |
| **Wisconsin** | Wis. Stat. ch. 203 (2023 Act 131); 2025 Act 199 | Sep 1, 2024; Act 199 from April 5, 2026 | License; banks and credit unions exempt | Act 199 (enacted April 3, 2026, published April 4, with no separate effective date, so in force the next day under Wis. Stat. 991.11) caps fees at $5 for advances of $75 or less and $7.50 above, adjusted for inflation every five years from January 1, 2030 |
| **Kansas** | Earned Wage Access Services Act (HB 2560, 2024) | Jul 1, 2024 | Registration with the State Bank Commissioner through NMLS | No-cost option; voluntary tips; no unreasonable expedite fee; not subject to the UCCC; annual report |
| **South Carolina** | S.C. Code 39-5-810 to -890 (Act 190 of 2024) | Nov 21, 2024 | Annual registration with Consumer Affairs; $1,000 fee, $30,000 bond | Reasonable no-cost option; tips may be zero; not a loan, deferred presentment or wage assignment |
| **Utah** | Utah Code 13-75 (HB 279, 2025) | May 7, 2025 | Annual registration with the Division of Consumer Protection | No-fee option; no outbound collection calls, debt sales or credit reporting; up to $2,500 per violation |
| **Arkansas** | Act 347 of 2025 (HB 1517), Ark. Code 23-52-201 et seq. | Approved March 20, 2025 | None in the act | A compliant provider isn't engaged in lending, money transmission or debt collection; a no-cost option; tips may be zero, are voluntary and can't affect access; banks and credit unions excluded |
| **Indiana** | IC 28-8-6 (HEA 1125, 2025) | Jan 1, 2026, licensing grace to Apr 30, 2026 | License through NMLS; a small loan or money transmitter license doesn't cover it | Fees capped at the check-cashing limit, the greater of $5 or 5% (IC 28-8-6-803, IC 28-8-5-17(a)(2)); at least one no-cost option, clearly displayed (IC 28-8-6-801) |
| **Louisiana** | Act 496 of 2025 (HB 368) | Aug 1, 2025 | None found | Annual reports from fee-charging providers |
| **Connecticut** | Public Act 25-155 (SB 1396) | Oct 1, 2025 | Small loan license | An advance under $750 within earned wages is a **small loan**; finance charges, including tips and fees, capped at $4 an advance or $30 a month; voluntary payments default to $0; one repayment on the next payday no more than 34 days out, reschedulable into up to three installments; must reimburse overdraft and NSF fees and control stacking across providers |
| **Maryland** | HB 1294 (2025, ch. 847); SB 94 (2026, ch. 170) | Oct 1, 2025; Oct 1, 2026 | Under the Maryland Consumer Loan Law | EWA is a loan; delivery or expedite fees capped at $5 for advances of $75 or less and $7.50 above (Com. Law 12-1505); the 2026 law bars lenders from accepting or soliciting tips |
| **California** | DFPI registration rules under the CCFPL | Registration due Feb 15, 2025 | Registration of "income-based advance" providers | Treated as covered persons under the state's consumer financial protection law |

The divergence is the design input. The same app, with the same tip screen, is a licensed non-loan product in Nevada, a small loan with a $4 cap in Connecticut, a loan in Maryland that may not take tips at all from October 2026, and unlicensed in states with no statute, where general lending and money transmission law decide. Every rule above is jurisdiction data with an effective date, and the jurisdiction is the worker's, which means knowing where the worker lives and works at each advance.

## Worked Numbers: Fees, APR and the Cumulative Cap

**What a fee costs as a rate.** The CFPB's typical employer-integrated transaction is $106 with a $3.18 fee, repaid in about 10 days. Expressed the way Regulation Z would if the product were credit: 3.18 / 106 × 365 / 10 = **109.5%**. The same fee on a $50 advance repaid in 4 days is 580%. A $3.99 instant fee on $100 repaid in 7 days is 3.99 / 100 × 365 / 7 = **208%**. Under the federal opinion none of these is an APR, because Covered EWA isn't credit; in Connecticut each is a finance charge under a $4 cap, and in Wisconsin and Maryland the $5 and $7.50 caps bind on the dollar amount, not a rate.

**Accrued wages and the cross-provider check.** An example of my own: a worker paid biweekly earns $20 an hour. By Thursday of the first week, payroll data shows 32 hours, so accrued wages are 32 × $20 = **$640**. The provider's own policy lets workers take up to 50% of accrued wages net of estimated withholding (a common design choice; the opinion only sets the outer limit).

| Step | Amount | Check |
| --- | --- | --- |
| Accrued wages from payroll | $640.00 | The ceiling for Covered EWA |
| Provider's access limit (50% of an estimated $512.00 net) | $256.00 | Product policy |
| Already taken from another provider this period (seen in the payroll deduction instructions) | $200.00 | Counts toward the $640 ceiling |
| Worker requests | $250.00 | Within the $256.00 limit |
| Cumulative EWA in the period | $450.00 | Under $640.00: covered |
| Instant delivery fee | $3.99 | Standard delivery free, shown first |
| Payroll deduction on payday | $253.99 | Sent by the processor to the provider |

If a garnishment arrives in week two and the paycheck can't cover the $253.99, the provider takes what the deduction yields and writes off the rest: no debit from the worker's bank account, no collection, no bureau report, because those are the conditions. A design that would debit the account for the shortfall has stepped outside Covered EWA for every transaction, not just the short one, because condition 3 is a warranty made before the first advance.

## Payroll Integration

The integration is the product. Three ways in, from most to least direct:

- **Employer payroll connection.** The provider reads hours, rates and pay schedules from the employer's payroll or time system and posts deductions back as payroll instructions. Timekeeping and payroll vendors expose this through partner programs; the provider's job is to map every employer's pay codes (regular, overtime, tips, shift differentials) to "accrued cash value" consistently, and to cut off access at the payroll processor's deadline for the pay run.
- **Payroll-account connection by the worker.** A D2C provider connects to the worker's payroll account with the worker's consent, reads earnings and sets up a deduction or split deposit, the arrangement the CFPB describes as directing part of the paycheck to an account held for the worker's benefit and used only to repay the provider.
- **Bank transaction data.** The provider reads deposits through an aggregator ([Open Banking in the US](/books/banking-and-lending/open-banking#how-the-platforms-do-it)) and estimates earnings. This is the estimate the opinion excludes from Covered EWA.

The payroll calendar matters as much as the data. An advance taken after the pay run closes can't be recovered from that payroll, so the access window per employer closes at the processor's cutoff, and a worker paid on a card or into a neobank account is still paid on the employer's schedule, which the program has to hold as a calendar per employer, not a global rule.

## How to Build It

These are deltas against [the core data model](/books/banking-and-lending/banking-business#the-core-data-model). Each worker has one `accounts` row per EWA product, with `account_kind = 'line'`: the account has a limit, draws and repayments, which is the ledger shape a line has, while whether it is credit is a separate, recorded fact on the product version (`products.terms` carries `tila_credit` and `covered_ewa`). Fees are `fee_assessments`; tips are not, because they aren't fees in most of the statutes above. The employer is a business `parties` row.

```sql
CREATE TABLE ewa_employers (                 -- an employer-integrated relationship
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id            UUID NOT NULL REFERENCES parties (id),   -- the employer, a business
  program_id          UUID REFERENCES programs (id),           -- where a sponsor bank holds the funds
  payroll_provider    TEXT NOT NULL,          -- processor, or 'in_house'
  deduction_method    TEXT NOT NULL CHECK (deduction_method IN ('processor_split',
                        'fbo_split', 'full_wage_pass_through', 'none')),
  pay_calendar_ref    TEXT NOT NULL,          -- pay dates and run cutoffs, as data
  employer_fee_terms  JSONB,                  -- what the employer pays, if anything
  valid_during        TSTZRANGE NOT NULL
);

CREATE TABLE wage_accruals (                 -- what payroll says the worker has earned
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id            UUID NOT NULL REFERENCES parties (id),   -- the worker
  ewa_employer_id     UUID REFERENCES ewa_employers (id),      -- null for a D2C estimate
  pay_period          DATERANGE NOT NULL,
  source              TEXT NOT NULL CHECK (source IN ('employer_payroll', 'worker_payroll_link',
                        'bank_transactions', 'worker_statement')),
  accrued_amount      BIGINT NOT NULL,        -- accrued cash value as of as_of
  other_ewa_seen      BIGINT NOT NULL DEFAULT 0,  -- other providers' deductions visible in payroll
  as_of               TIMESTAMPTZ NOT NULL,
  raw_ref             TEXT NOT NULL           -- the payroll record or file it came from
);

CREATE TABLE ewa_advances (                  -- one access transaction
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  wage_accrual_id     UUID NOT NULL REFERENCES wage_accruals (id),  -- the figure it was checked against
  amount              BIGINT NOT NULL CHECK (amount > 0),
  cumulative_in_period BIGINT NOT NULL,       -- this provider's and others', including this one
  delivery            TEXT NOT NULL CHECK (delivery IN ('standard', 'instant')),
  fee_assessment_id   UUID REFERENCES fee_assessments (id),
  tip_amount          BIGINT NOT NULL DEFAULT 0,
  tip_default_shown   BIGINT,                 -- the pre-filled tip on the screen, 0 where required
  screen_version      TEXT NOT NULL,          -- the flow the worker saw: order, defaults, wording
  jurisdiction        CHAR(2) NOT NULL,       -- the worker's state at the time
  state_rule_id       UUID NOT NULL,          -- ewa_state_rules, below
  recovery_method     TEXT NOT NULL CHECK (recovery_method IN ('payroll_deduction',
                        'account_debit')),
  transaction_id      UUID NOT NULL REFERENCES transactions (id),  -- the disbursement
  requested_at        TIMESTAMPTZ NOT NULL,
  CHECK (cumulative_in_period >= amount),
  CHECK (fee_assessment_id IS NULL OR delivery = 'instant')   -- in this design the only per-advance fee is speed
);

CREATE TABLE ewa_recoveries (                -- what came back, and what didn't
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  pay_date            DATE NOT NULL,
  expected_amount     BIGINT NOT NULL,        -- advances plus fees due from this payroll
  recovered_amount    BIGINT NOT NULL,
  method              TEXT NOT NULL CHECK (method IN ('payroll_deduction', 'retry_after_error',
                        'account_debit')),
  error_ref           TEXT,                   -- the technical or payroll error that allows one retry
  shortfall_disposition TEXT CHECK (shortfall_disposition IN ('written_off', 'retry_scheduled',
                        'installments')),     -- installments: Connecticut's reschedule
  overdraft_reimbursed BIGINT NOT NULL DEFAULT 0,  -- NSF or overdraft fees the debit caused, repaid
  transaction_id      UUID REFERENCES transactions (id)
);

CREATE TABLE ewa_state_rules (               -- versioned law, one row per state and period
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction        CHAR(2) NOT NULL,
  treatment           TEXT NOT NULL CHECK (treatment IN ('ewa_statute', 'loan_law', 'registration_only',
                        'no_statute')),
  license_kind        TEXT,                   -- 'license', 'registration', 'small_loan_license', null
  no_cost_option      BOOLEAN NOT NULL,
  tips_allowed        BOOLEAN NOT NULL,
  tip_default_zero    BOOLEAN NOT NULL,
  tips_are_charges    BOOLEAN NOT NULL,       -- Connecticut counts them toward the cap
  fee_cap             JSONB,                  -- e.g. {"le_7500": 500, "gt_7500": 750} in minor units
  max_advance         BIGINT,
  overdraft_reimbursement BOOLEAN NOT NULL,
  effective_from      DATE NOT NULL,
  effective_to        DATE,
  source_citation     TEXT NOT NULL
);
```

The checks run in a fixed order at each request and each one is stored: the accrual is fresh enough for the employer's data (a stale accrual is the commonest way to exceed wages), the cumulative total including other providers stays at or under `accrued_amount`, the product limit applies, and the state rule decides whether a fee or tip may be offered and at what cap. Nothing in the flow reads a credit report, and the schema makes that visible: an EWA product has no `credit_decisions` rows, and an eligibility or limit change is a rule evaluation over payroll data with its policy version ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)). Where a state treats EWA as a loan, its cost limits are also [`rate_cap_rules`](/books/banking-and-lending/installment-loans#how-to-build-it) rows, so the same evaluation records which cap applied. A Covered EWA product has `recovery_method = 'payroll_deduction'` on every advance; a constraint at the product level (no `account_debit` advances on a product version with `covered_ewa = true`) turns the federal line into something the database enforces. The ledger is a receivable on the provider's books, funded from its own or a bank partner's money ([FBO Accounts and Pass-Through Insurance](/books/payments/treasury#fbo-accounts-and-pass-through-insurance) when a bank holds the worker's card balance), and a written-off shortfall is a journal entry to a loss account, never a debt on the worker.

## Auditing

EWA is examined by state regulators under licensing statutes, by the CFPB and states for unfair or deceptive practices, and by plaintiffs who argue the fees are finance charges. Keep:

- **The accrual behind every advance,** with its source and the payroll record, so "never more than earned wages" can be shown per transaction.
- **Cross-provider exposure** where payroll shows it, and the cumulative total at each advance.
- **The screen as shown:** screen version, default delivery speed, default tip, the order of options and the free path, by date. The federal test for fees and tips is about these facts.
- **Every fee, tip and refund,** with the state rule in force; tips stored apart from fees.
- **Recoveries and shortfalls,** including what was written off and the absence of any collection or bureau report.
- **Overdraft and NSF reimbursements** where the state requires them, linked to the debit that caused them.
- **Annual reports** to state regulators, reproducible from the rows ([Producing Records](/docs/architecture/audit-trails#producing-records)).

## What This Means for the System You Build

- **The legal characterization is a product attribute,** recorded on the version: covered EWA, loan, or neither, by state.
- **Accrued wages come from payroll, with a source and a timestamp,** and the cumulative check includes other providers.
- **Recovery through payroll, not the bank account,** is what keeps a product inside the federal conditions; the schema can enforce it.
- **No credit data in the flow.** Limits are rules over payroll data, versioned and recorded.
- **Fees and tips are separate records,** with the screen and defaults that produced them.
- **State law is effective-dated data,** keyed to the worker's jurisdiction at each advance.
- **A shortfall is the provider's loss,** written off in the ledger, never collected.

## References

**Law and regulation**

- [Federal Register: Truth in Lending (Regulation Z); Non-application to Earned Wage Access Products (90 FR 60069, December 23, 2025)](https://www.federalregister.gov/documents/2025/12/23/2025-23735/truth-in-lending-regulation-z-non-application-to-earned-wage-access-products), effective on publication
- [CFPB: Earned wage access advisory opinion (PDF)](https://files.consumerfinance.gov/f/documents/cfpb_earned-wage-access-advisory-opinion_2025-12.pdf), the four Covered EWA conditions, payroll process deduction examples, the error allowance, expedite fees and tips, withdrawal of the 2024 proposal, *Orubo v. Activehours*, and the market figures it cites
- [Federal Register: Truth in Lending (Regulation Z); Earned Wage Access Programs (85 FR 79404, December 10, 2020)](https://www.federalregister.gov/documents/2020/12/10/2020-26664/truth-in-lending-regulation-z-earned-wage-access-programs), the 2020 advisory opinion
- [Federal Register: Consumer Credit Offered to Borrowers in Advance of Expected Receipt of Compensation for Work (proposed interpretive rule, July 31, 2024)](https://www.federalregister.gov/documents/2024/07/31/2024-16827/truth-in-lending-regulation-z-consumer-credit-offered-to-borrowers-in-advance-of-expected-receipt-of), 89 FR 61358
- [Federal Register: Consumer Credit Offered to Borrowers in Advance of Expected Receipt of Compensation for Work (90 FR 3622, January 15, 2025)](https://www.federalregister.gov/documents/2025/01/15/2025-00381/truth-in-lending-regulation-z-consumer-credit-offered-to-borrowers-in-advance-of-expected-receipt-of), withdrawal of the 2020 opinion
- [Federal Register: Interpretive Rules, Policy Statements, and Advisory Opinions; Withdrawal (90 FR 20084, May 12, 2025)](https://www.federalregister.gov/documents/2025/05/12/2025-08286/interpretive-rules-policy-statements-and-advisory-opinions-withdrawal), the withdrawal of both 2020 and January 2025 opinions
- [GovInfo: H.R. 9330, Earned Wage Access Consumer Protection Act (reported in House, September 1, 2026)](https://www.govinfo.gov/content/pkg/BILLS-119hr9330rh/html/BILLS-119hr9330rh.htm), the reported text: not credit under federal law, the no-cost option, the $0 default tip and the preemption section
- [GovInfo: H. Rept. 119-790](https://www.govinfo.gov/content/pkg/CRPT-119hrpt790/html/CRPT-119hrpt790.htm), the June 30, 2026 markup and the 29 to 22 vote

**State law**

- [Nevada: NRS chapter 604D](https://www.leg.state.nv.us/NRS/NRS-604D.html), licensing, the $35,000 bond, the no-cost option, tips, prohibited practices, not a loan, and the December 31, 2029 sunset
- [Missouri: RSMo 361.749](https://revisor.mo.gov/main/OneSection.aspx?section=361.749), licensing, tips, prohibited practices and effective dates
- [Wisconsin: Statutes chapter 203](https://docs.legis.wisconsin.gov/statutes/statutes/203), licensing, the bank and credit union exemption and the definition of fee
- [Wisconsin: 2025 Act 199](https://docs.legis.wisconsin.gov/2025/related/acts/199), the $5 and $7.50 fee caps, their inflation adjustment and the April 3 enactment and April 4, 2026 publication
- [Wisconsin: Stat. 991.11](https://docs.legis.wisconsin.gov/statutes/statutes/991/11), acts take effect the day after publication unless they say otherwise
- [Kansas OSBC: Earned Wage Access Services Act](https://osbckansas.gov/?p=9809), registration through NMLS from July 1, 2024
- [Kansas Legislature: Supplemental note on HB 2105](https://www.kslegislature.gov/li_2024/b2023_24/measures/documents/supp_note_hb2105_03_0000.pdf), the act's provisions before they moved into HB 2560
- [South Carolina: S.700 (Act 190 of 2024)](https://www.scstatehouse.gov/sess125_2023-2024/bills/700.htm), registration, fee, bond, no-cost option, tips and effective date
- [Utah: HB 279 (2025), enrolled](https://le.utah.gov/Session/2025/bills/enrolled/HB0279.pdf), registration with the Division of Consumer Protection, prohibited practices and penalties, effective May 7, 2025
- [Arkansas: Act 347 of 2025 (PDF)](https://arkleg.state.ar.us/Acts/FTPDocument?path=%2FACTS%2F2025R%2FPublic%2F&file=347.pdf&ddBienniumSession=2025%2F2025R), the not-lending provision, the no-cost option, tips, the bank exclusion and the March 20, 2025 approval
- [Indiana DFI: Earned wage access licensing guidance (PDF)](https://www.in.gov/dfi/files/EWALicensingGuidance.pdf), the January 1, 2026 effective date, NMLS licensing and the grace period
- [Indiana Code 28-8-6-803 (Justia)](https://law.justia.com/codes/indiana/title-28/article-8/chapter-6/section-28-8-6-803/) and [28-8-5-17](https://law.justia.com/codes/indiana/title-28/article-8/chapter-5/section-28-8-5-17/), the fee cap by reference to the check-cashing limit of the greater of $5 or 5%
- [Indiana Code 28-8-6-801 (Justia)](https://law.justia.com/codes/indiana/title-28/article-8/chapter-6/section-28-8-6-801/), the no-cost option
- [Louisiana: HB 368 (Act 496 of 2025)](https://legis.la.gov/legis/BillInfo.aspx?i=248355), effective August 1, 2025
- [Connecticut: Public Act 25-155 (PDF)](https://www.cga.ct.gov/2025/ACT/PA/PDF/2025PA-00155-R00SB-01396-PA.PDF), EWA as a small loan, the $4 and $30 caps, tips as finance charges, repayment and reimbursement rules
- [Maryland: HB 1294 (2025)](https://mgaleg.maryland.gov/mgawebsite/Legislation/Details/hb1294?ys=2025RS), EWA under the Consumer Loan Law, effective October 1, 2025
- [Maryland: Chapter 847 of 2025 (PDF)](https://mgaleg.maryland.gov/2025RS/Chapters_noln/CH_847_hb1294t.pdf), the enacted text, including the $5 and $7.50 fee caps in Com. Law 12-1505
- [Maryland: SB 94 (2026)](https://mgaleg.maryland.gov/mgawebsite/Legislation/Details/sb0094?ys=2026RS), the ban on tips, effective October 1, 2026
- [California DFPI: Covered persons registration](https://dfpi.ca.gov/regulated-industries/covered-persons/), income-based advance providers and the February 15, 2025 deadline

**Regulators and research**

- [CFPB: Data Spotlight, Developments in the Paycheck Advance Market (July 18, 2024)](https://www.consumerfinance.gov/data-research/research-reports/data-spotlight-developments-in-the-paycheck-advance-market/), market size, average transaction and fee, fee shares, implied APRs and charge-off rates
- [CFPB: Rescinding special regulatory treatment for Payactiv (June 30, 2022)](https://www.consumerfinance.gov/about-us/newsroom/cfpb-rescinds-special-regulatory-treatment-for-payactiv), the termination and its reasons

**Vendor documentation**

- [DailyPay: Frequently asked questions](https://get.dailypay.com/frequently-asked-questions/), free standard transfers and fee waivers
- [DailyPay: Card fees](https://www.dailypay.com/en-us/legal/card-fees/), the $3.99 instant transfer fee and the issuing bank
- [Payactiv: Pricing](https://www.payactiv.com/pricing), no-fee options, the $2.49 and $3.49 fees and the direct deposit waiver
- [EarnIn: Cash Out](https://www.earnin.com/products/cashout), the $200 and $1,000 limits, Lightning Speed and tips
- [Chime: MyPay](https://www.chime.com/mypay/), the $20 to $1,000 credit limit, the 3% instant fee with its $2 minimum and $5 maximum, free delivery within 24 hours and the direct deposit requirement
