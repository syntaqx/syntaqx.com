+++
title = "APR, Finance Charges & Rate Caps"
nav_title = "APR & Rate Caps"
description = "The APR under Appendix J with worked numbers, the finance charge, APR-based tests, MLA and SCRA, state usury, rate exportation, Madden and true lender."
category = "Banking & Lending Industry"
order = 2448
part = "Origination and Underwriting"
tags = ["banking", "lending", "apr", "truth-in-lending", "usury", "rate-exportation", "mla"]
+++

Two questions decide what a loan may cost. The first is arithmetic: what is the cost of this credit, as a dollar figure and as a yearly rate, computed the way federal law says so that every lender's number means the same thing. The second is legal: what is the most this lender may charge this borrower in this place, which depends on the lender's charter, the borrower's state and military status, and which court's reading of a 1980 statute applies. The first is the Truth in Lending Act's finance charge and annual percentage rate. The second is state usury law, federal rate exportation for banks, the opt-outs states are now exercising, the Madden decision and the regulators' answer to it, the true lender doctrine, and two federal caps (36% for servicemembers under the Military Lending Act and 6% on their pre-service debts under the Servicemembers Civil Relief Act).

They meet in the system: the APR the disclosure shows is also the number every APR-based test reads (rate caps, the MLA, higher-priced mortgage and qualified mortgage thresholds, HOEPA), so an error in which fees count as finance charges is not a disclosure error alone. This chapter covers the finance charge, the Appendix J computation with a worked mortgage example, the tolerances, the tests that read the APR, the MLA and SCRA, state usury and exportation, the Colorado opt-out case, Madden and valid when made, and true lender, each as of October 2026. The closed-end disclosure itself is in [Personal & Installment Loans](/books/banking-and-lending/installment-loans#the-product-and-its-disclosures); card APRs and balance segments are in [Credit Cards as Credit](/books/banking-and-lending/credit-cards#balance-segments-and-aprs); the licenses a nonbank needs are in Lender Licensing & Bank Partnerships.

## How the Platforms Do It

Every lender computes an APR the same way and justifies its price under a different authority. As of October 2026, from filings and agency pages:

| Who | Rate authority | Public detail |
| --- | --- | --- |
| **Affirm (through Celtic Bank and Lead Bank)** | State bank exportation, FDIA section 27 | Celtic and Lead "generally allow a consumer loan borrower to agree to any annual rate of interest up to 36%," Cross River up to 30%, calculated under the FDIC's Federal Interest Rate Authority rule |
| **National banks** | National Bank Act section 85 | The rate allowed by the bank's home state, exported to borrowers elsewhere (12 U.S.C. 85) |
| **State-licensed nonbank lenders** | Each state's license and cap | Priced state by state, with "not offered here" where a cap closes the market ([State Rate Caps as Data](/books/banking-and-lending/installment-loans#state-rate-caps-as-data)) |
| **FFIEC APR Computational Tool** | The examiners' calculator | Replaced the OCC's APRWIN in 2020; verifies Regulation Z APRs and Military Lending Act MAPR limits for installment loans |

The partner-bank row carries its own risk statement: Affirm's 10-K says that if its originating bank partner model "is successfully challenged or deemed impermissible," it could be found in violation of "licensing, interest rate limit, lending, or brokering laws." That sentence is what the last three sections of this chapter are about.

## The Finance Charge

The finance charge is "the cost of consumer credit as a dollar amount": any charge payable directly or indirectly by the consumer and imposed directly or indirectly by the creditor as an incident to the extension of credit, excluding charges of a type payable in a comparable cash transaction (12 CFR 1026.4(a)). The boundary is the hard part:

- **In:** interest, points, loan and assumption fees, finder's fees, appraisal and credit report fees outside the real estate exclusion, required insurance and debt cancellation premiums, and mortgage broker fees, always (1026.4(b), (a)(3)).
- **Third parties:** a third party's charge is a finance charge if the creditor requires the service or keeps part of the charge; a closing agent's fees count only in the cases the rule lists (1026.4(a)(1), (a)(2)).
- **Out:** application fees charged to all applicants whether or not credit is extended, late, over-limit and similar charges for unanticipated events, seller's points, and for real estate-secured credit, bona fide and reasonable fees for title examination and insurance, deed and document preparation, notary services, appraisal and credit reports (1026.4(c)).
- **Out if voluntary:** credit insurance and debt cancellation premiums, when the coverage isn't required, that fact is disclosed in writing, and the consumer signs or initials an affirmative written request (1026.4(d)).
- **Never netted:** interest the consumer earns on a deposit tied to the loan can't be subtracted (1026.4(f)).

Each fee type's treatment is a rule with a citation, and the same fee can be in for one product and out for another (an appraisal fee on a car loan versus a mortgage). The **amount financed** is the principal less prepaid finance charges, and the APR measures the finance charge against it.

## The Actuarial Method

The APR is computed under Appendix J to Regulation Z, by the actuarial method (or the United States Rule method, 1026.22(a)(1)): at the end of each unit-period the unpaid balance of the amount financed grows by the finance charge earned and falls by any payment made. The rate that makes the payments exactly retire the amount financed is the unit-period rate, and the APR is that rate times the number of unit-periods in a year (Appendix J (b)(1)).

- **Unit-period:** "that common period, not to exceed 1 year, that occurs most frequently in the transaction," the smaller one if two tie (b)(4). For a monthly mortgage it's a month, and there are 12 per year.
- **Odd periods:** for a fraction of a unit-period, the rate is that fraction times the unit-period rate (b)(6), and a fraction of a month is counted in days over 30 (b)(5).
- **Solution by iteration:** there is no closed form, so the APR is found by guessing a rate, computing the present value of the payments, and adjusting until it equals the amount financed (b)(9).
- **Tools:** any computation tool that matches Appendix J within tolerance may be used (1026.22(b)).

**Tolerances.** An APR is accurate if within **1/8 of 1 percentage point** of the computed rate for a regular transaction, or **1/4 of 1 point** for an irregular one (multiple advances, irregular payment periods or amounts) (1026.22(a)(2), (a)(3)). For mortgages, an APR is also accurate if it results from a disclosed finance charge that is itself accurate, and a mortgage finance charge is accurate if understated by no more than **$100** or overstated (1026.22(a)(4), 1026.18(d)(1); 1026.38(o)(2) for the Closing Disclosure). For other closed-end credit, the finance charge tolerance is $5 for an amount financed of $1,000 or less and $10 above (1026.18(d)(2)).

## Worked Numbers: A Mortgage APR With Fees

A $300,000 fixed-rate mortgage at 6.50% over 360 months, with interest starting at consummation and the first payment one month later (no odd first period). The closing costs:

| Charge | Amount | Finance charge? | Why |
| --- | --- | --- | --- |
| Discount points (1%) | $3,000 | Yes | Points (1026.4(b)(3)) |
| Origination fee | $1,200 | Yes | Loan fee |
| Underwriting fee | $795 | Yes | Imposed by the creditor as incident to the credit |
| Appraisal | $600 | No | Real estate exclusion (1026.4(c)(7)) |
| Credit report | $50 | No | Real estate exclusion |
| Title insurance | $1,800 | No | Real estate exclusion |
| Recording fees | $150 | No | Government fee for the security interest (1026.4(e)) |

**The payment.** $300,000 × r / (1 − (1 + r)^−360) with r = 6.50% / 12 is $1,896.204, so $1,896.20 a month, with the 360th payment $1,900.91 to absorb rounding. Total of payments: $682,636.71, of which $382,636.71 is interest.

**Amount financed and finance charge.** Prepaid finance charges are $3,000 + $1,200 + $795 = $4,995. Amount financed: $300,000 − $4,995 = **$295,005**. Finance charge: $382,636.71 interest + $4,995 = **$387,631.71**, which also equals the total of payments minus the amount financed.

**The iteration.** Find the annual rate at which the 360 payments are worth exactly $295,005 today:

| Trial APR | Present value of the payments |
| --- | --- |
| 6.50% | $300,000.03 (the note rate returns the principal) |
| 6.60% | $296,904.09 |
| 6.70% | $293,858.49 |
| 6.66% | $295,070.75 |
| 6.662% | $295,009.95 |

Interpolating between 6.60% and 6.70% gives 6.6624%, and one more step settles at **6.662%**, a monthly unit-period rate of 0.5552%. The fees add 0.16 points to the rate.

**What a misclassified fee does.** If the underwriting fee were wrongly treated as excluded, the amount financed would be $295,800 and the APR 6.636%: only 0.026 points lower, inside the 1/8-point tolerance. But the finance charge would be understated by $795, more than the $100 mortgage tolerance, so the disclosure is wrong anyway. On a refinance the rescission rules apply their own finance charge tolerances (1026.23(g) and (h), which 1026.22(a)(4) cross-references), and a material disclosure that fails them can extend the borrower's right to rescind ([Rescission and Funding](/books/banking-and-lending/closing-and-enotes#rescission-and-funding)). The classification table is where APR errors start, not the solver.

## Tests That Read the APR

The disclosed APR is an input to rules that change what the lender may do:

- **Higher-priced covered transactions** under the ability-to-repay rule: an APR that exceeds the average prime offer rate (APOR) for a comparable transaction, as of the rate-set date, by **1.5 points** or more for a first lien (3.5 for certain small-creditor and balloon QMs) or **3.5 points** for a subordinate lien (1026.43(b)(4)). A qualified mortgage that isn't higher-priced gets a safe harbor; a higher-priced one gets a rebuttable presumption.
- **General QM price thresholds:** the APR must exceed APOR by less than 2.25 points for a first-lien loan of $137,958 or more in 2026, with wider spreads for smaller loans and subordinate liens; subordinate liens get 3.5 points from $82,775 and 6.5 below (1026.43(e)(2)(vi)). [Ability to Repay and the Qualified Mortgage](/books/banking-and-lending/decision-engines#ability-to-repay-and-the-qualified-mortgage) covers the full test in the decision engine.
- **QM points and fees** for 2026, the schedule in full: no more than 3% of the total loan amount for loans of $137,958 or more, $4,139 from $82,775 to under $137,958, 5% from $27,592 to under $82,775, $1,380 from $17,245 to under $27,592, and 8% below that (1026.43(e)(3), adjusted effective January 1, 2026). Which charges count is the `in_points_and_fees` flag below, which differs from the finance charge.
- **HOEPA high-cost mortgages** for 2026: among other triggers, points and fees above 5% of the total loan amount for loans of $27,592 or more, or above the lesser of $1,380 or 8% for smaller loans.
- **State caps** measured as an APR, and the MLA's MAPR (below).

The worked loan's points and fees ($4,995) are well under the 3% cap ($9,000) for its size; its 6.662% APR is a higher-priced loan or not depending on the APOR for the week its rate was set, which is why the APOR table is reference data with an effective week and the rate-set date is a recorded event. The mortgage program side of ATR/QM is in [Ability to Repay and Qualified Mortgages](/books/banking-and-lending/mortgages#ability-to-repay-and-qualified-mortgages).

## The Military Lending Act

For a covered member of the armed forces or a dependent, a creditor may not impose a **military annual percentage rate** above **36%** on closed-end credit or in any billing cycle of open-end credit (32 CFR 232.4(b)). The MAPR is computed like the APR for closed-end credit and like the effective APR per billing cycle for open-end credit, but it counts charges Regulation Z excludes: credit insurance premiums, debt cancellation and suspension fees, fees for credit-related ancillary products, finance charges, and certain application and participation fees (232.4(c)).

**Worked numbers.** A $1,000 loan over 12 months at 32% interest, with a $45 voluntary credit insurance premium financed into the loan: the principal is $1,045 and the payment $102.90. For Regulation Z the premium is excluded (it's voluntary, disclosed and requested), the amount financed is $1,045, and the APR is **32%**. For the MLA the premium is a charge, the borrower got $1,000 of credit, and the same 12 payments give a MAPR of **40.85%**. The loan is lawful to a civilian and prohibited to a covered borrower, which is why the covered-borrower check must run before the offer, and why its result is a record.

## The Servicemembers Civil Relief Act

Separately, a servicemember's debts incurred before military service, alone or jointly with a spouse, may not bear interest above **6%** a year during service, and for mortgages through one year after service ends (50 U.S.C. 3937). Interest above 6% is **forgiven**, not deferred, and periodic payments drop by the forgiven amount. "Interest" includes service charges, renewal charges and fees (bona fide insurance excepted). The servicemember sends written notice with a copy of orders within 180 days after release; the creditor may instead rely on the Defense Manpower Data Center; once notice arrives, the cap applies from the date the servicemember was called to service, which means a retroactive recalculation. A court can relieve the creditor if service doesn't materially affect the ability to pay, and a knowing violation is a crime.

For the system the SCRA benefit is a rate change on an existing loan with an effective date in the past, so it needs the same backdated reposting machinery as a payment correction, plus a record of the notice, the orders and the period. Collections & Recovery covers the SCRA's protections against default judgments and foreclosure.

## State Usury and Rate Exportation

Every state caps interest for some lenders and products, by license type, amount and term. A bank escapes most of that through federal exportation:

- **National banks** may charge interest "at the rate allowed by the laws of the State, Territory, or District where the bank is located," or 1 point above the Federal Reserve discount rate on 90-day commercial paper if greater, to any borrower anywhere (12 U.S.C. 85). The OCC defines interest to include late, NSF, overlimit, annual, cash advance and membership fees (12 CFR 7.4001(a)), so those export too.
- **State-chartered insured banks** got parity in 1980: section 521 of DIDMCA (FDIA section 27, 12 U.S.C. 1831d) lets them charge the greater of 1 point over that discount rate or the rate allowed where the bank is located. Knowingly charging more forfeits all interest on the debt, and the borrower may recover twice the interest paid within two years (1831d(b)).
- **Nonbank lenders** get no exportation and price under each state's law where they lend.

That's why a fintech's program sits at a bank whose home-state law allows the program's price, and why the program's own limits (36% at Celtic and Lead, 30% at Cross River for Affirm's loans) are a contract term, not the law's ceiling.

## Opt-Outs and the Colorado Case

Section 525 of DIDMCA lets a state opt out of section 521 "with respect to loans made in such State." Opting out doesn't touch national banks, which export under section 85. The states exercising it are Colorado (since 2023), Iowa, and Oregon (from April 2026, for consumer finance loans); Rhode Island has considered it. The fight is over where a loan is "made":

- **District court (2024):** in *National Association of Industrial Bankers v. Weiser*, a preliminary injunction barred Colorado from applying its caps to loans by the plaintiff associations' members when the bank is outside Colorado (737 F. Supp. 3d 1113).
- **Panel (November 2025):** the Tenth Circuit reversed 2-1, holding that a loan is made where it's completed or executed, so a loan is made in an opt-out state if either the lender or the borrower is there.
- **En banc (April 2, 2026):** the court vacated the panel opinion and granted rehearing; the injunction stayed in effect. The FDIC and OCC filed amicus briefs for the plaintiffs, as did banking trade groups and 21 state attorneys general; argument was set for August 18, 2026.
- **As of October 2026:** I found no en banc decision. Congress has bills (the American Lending Fairness Act of 2026, S. 3889 and H.R. 7866) that would repeal section 525 and let states opt out only for banks they charter.

For a program, the outcome decides whether a Colorado or Oregon borrower can get an out-of-state state bank's exported rate. The system needs the borrower's state at application, the lender of record's charter type, each opt-out as a rule with an effective date and the litigation status as of the offer date, and the ability to reprice or decline a state when a court rules ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)).

## Madden and Valid When Made

Banks sell loans, and buyers (debt purchasers, marketplace investors, securitization trusts) aren't banks. *Madden v. Midland Funding* (2d Cir. 2015) held that "the National Bank Act ceased to preempt state law once the national bank had assigned the loan to a non-bank entity": a debt buyer that bought a charged-off national bank card account could face New York usury claims. The Supreme Court denied review on June 27, 2016, leaving the decision binding in the Second Circuit (Connecticut, New York, Vermont).

The regulators answered with rules:

- **OCC (June 2, 2020, 85 FR 33530):** interest permissible under section 85 "shall not be affected by the sale, assignment, or other transfer of the loan" (12 CFR 7.4001(e)).
- **FDIC (July 22, 2020, 85 FR 44146):** interest permissible under section 27 is determined "as of the date the loan was made" and isn't affected by a change in state law, a change in the reference rate, or the sale or transfer of the loan, in whole or in part (12 CFR 331.4(e)).
- **Challenged and upheld:** in *California v. OCC* (No. 4:20-cv-5200) and *California v. FDIC* (No. 4:20-cv-5860), the Northern District of California granted summary judgment to the agencies on February 8, 2022, applying Chevron deference.

Two cautions. The rules address the interest on a validly made bank loan after transfer; they don't decide who made the loan, which is the true lender question. And the 2022 decisions rested on Chevron, which the Supreme Court overruled in *Loper Bright Enterprises v. Raimondo* (June 28, 2024), so a new challenge would be argued without that deference.

## True Lender

A bank partnership puts the bank's name on the note while a nonbank markets, often prices, services and buys the loans. A **true lender** challenge argues that the nonbank, not the bank, is the real lender, so the loan is subject to the state's caps and licensing as if the nonbank made it, and may be void or uncollectable above the cap.

The OCC tried to settle the question for national banks with a rule that a bank makes a loan if, as of origination, it is named as the lender in the loan agreement or funds the loan (85 FR 68742, October 30, 2020, effective December 29, 2020). Congress disapproved it under the Congressional Review Act (Senate 52-47 on May 11, 2021, House 218-208 on June 24, 2021, signed June 30, 2021), so it never took effect and the OCC can't reissue a substantially similar rule without new authority; the OCC removed it from the CFR on August 5, 2021 (86 FR 42686). True lender questions are decided case by case under state law and the facts of each program.

Courts and state statutes that apply a true lender test look at who holds the economic risk and benefit: who funds, who keeps the receivable, who bears losses, who designed the underwriting and pricing, and whether the bank's role is more than nominal. That's a description of the program agreement and the loan's ownership history, so the evidence is in records: the bank's approval of each underwriting and pricing policy, the bank's retention (how long it holds the loan, what share it keeps), the purchase terms, the loss sharing, and the bank's control over complaints and servicing. [Sponsor Bank Oversight](/books/banking-and-lending/sponsor-bank-oversight) covers the oversight side and Lender Licensing & Bank Partnerships the license and charter alternatives.

## How to Build It

These are deltas against [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model). `loans.apr` holds the disclosed APR; [Personal & Installment Loans](/books/banking-and-lending/installment-loans#how-to-build-it) added `rate_cap_rules` (with `measure` of simple rate, APR or MAPR) and `rate_cap_evaluations`, which this chapter reuses for state caps, opt-outs and the MLA. It adds the finance charge classification rules, the recorded APR computations, the rate authority on each loan, covered borrower checks and SCRA benefits.

```sql
CREATE TABLE finance_charge_rules (          -- how each fee type is treated, with its citation
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  fee_kind              TEXT NOT NULL,         -- 'discount_points', 'origination', 'appraisal', ...
  product_scope         TEXT NOT NULL,         -- 'real_estate_secured', 'closed_end_other', 'open_end'
  in_finance_charge     BOOLEAN NOT NULL,
  in_mapr               BOOLEAN NOT NULL,      -- the MLA counts more than Reg Z
  in_points_and_fees    BOOLEAN NOT NULL,      -- for QM and HOEPA
  conditions            TEXT,                  -- 'voluntary, disclosed, signed request'
  citation              TEXT NOT NULL,         -- '12 CFR 1026.4(c)(7)'
  effective_during      DATERANGE NOT NULL
);

CREATE TABLE apr_computations (              -- every APR computed for an offer or disclosure
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id            UUID REFERENCES accounts (id),
  application_id        UUID REFERENCES applications (id),
  disclosure_id         UUID REFERENCES disclosures (id),   -- the document that showed it
  measure               TEXT NOT NULL CHECK (measure IN ('apr', 'mapr')),
  method                TEXT NOT NULL CHECK (method IN ('actuarial', 'us_rule')),
  unit_period           TEXT NOT NULL,         -- 'month', 'week', ...
  amount_financed       BIGINT NOT NULL,       -- minor units
  finance_charge        BIGINT NOT NULL,
  charges               JSONB NOT NULL,        -- each charge with the finance_charge_rules row applied
  payment_stream        JSONB NOT NULL,        -- amounts and dates as solved
  rate                  NUMERIC(9, 6) NOT NULL,  -- 0.066620
  irregular             BOOLEAN NOT NULL,      -- picks the 1/8 or 1/4 tolerance
  engine_version        TEXT NOT NULL,
  computed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (account_id IS NOT NULL OR application_id IS NOT NULL)
);

ALTER TABLE loans
  ADD COLUMN rate_authority     TEXT CHECK (rate_authority IN ('nba_85', 'fdia_27', 'hola',
                                  'fcua', 'state_license', 'state_usury')),
  ADD COLUMN rate_home_state    CHAR(2),       -- the exporting bank's state, if exported
  ADD COLUMN borrower_state     CHAR(2);       -- at consummation: what opt-outs and caps read

CREATE TABLE covered_borrower_checks (       -- the MLA lookup before every offer
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id              UUID NOT NULL REFERENCES parties (id),
  application_id        UUID REFERENCES applications (id),
  source                TEXT NOT NULL CHECK (source IN ('dmdc', 'consumer_reporting_agency')),
  result                TEXT NOT NULL CHECK (result IN ('covered', 'not_covered', 'unavailable')),
  response_ref          TEXT NOT NULL,         -- the certificate or report, as received
  checked_at            TIMESTAMPTZ NOT NULL
);

CREATE TABLE scra_benefits (                 -- a 6% cap applied to an existing loan
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id            UUID NOT NULL REFERENCES loans (account_id),
  party_id              UUID NOT NULL REFERENCES parties (id),
  notice_received_at    TIMESTAMPTZ,           -- null when applied from DMDC data
  evidence_ref          TEXT NOT NULL,         -- orders or DMDC certificate
  service_period        DATERANGE NOT NULL,
  benefit_period        DATERANGE NOT NULL,    -- mortgages: service plus one year
  capped_rate           NUMERIC(9, 6) NOT NULL DEFAULT 0.060000,
  forgiven_interest     BIGINT NOT NULL DEFAULT 0,  -- running total, minor units
  journal_entry_id      UUID REFERENCES journal_entries (id),  -- the retroactive adjustment
  status                TEXT NOT NULL CHECK (status IN ('active', 'ended', 'court_relief'))
);
```

How it runs:

1. **Classify, then solve.** The offer engine classifies every charge through `finance_charge_rules` for the product scope and date, computes the amount financed and finance charge, solves the APR, and writes `apr_computations` with the charges and the payment stream as solved. The same row is what the disclosure renders and what the caps read, so the APR shown, the APR tested and the APR on `loans.apr` are one number. Solver accuracy is tested against the FFIEC tool and Appendix J's published examples in CI ([Rounding](/docs/payments/money#rounding)).
2. **Check the borrower before pricing.** `covered_borrower_checks` runs before any offer; a covered result switches the cap evaluation to the MAPR, computed with `in_mapr` charges, and writes a second `apr_computations` row.
3. **Evaluate every applicable cap** from `rate_cap_rules` on the borrower's state, the lender of record's charter and `rate_authority`, and the date, including opt-out rules and their litigation status, and write `rate_cap_evaluations` for each, pass or fail.
4. **Mortgage tests read the same row:** the APR, APOR, rate-set date, points and fees and the result go on `atr_qm_determinations`, which [Mortgages & Home Equity](/books/banking-and-lending/mortgages#how-to-build-it) defines; the APR it stores is the `apr_computations` rate, never a recomputation.
5. **SCRA benefits repost history.** Applying a benefit reverses and reposts interest from the start of `benefit_period` at the capped rate, records the forgiven amount as a journal entry against interest income, and regenerates the payment schedule as a new version ([Amend, Don't Overwrite](/docs/architecture/audit-trails#amend-don-t-overwrite)).
6. **Ownership history supports the partnership.** Every sale of a bank-originated loan keeps the original lender of record and `rate_authority` on the loan, which is what a valid-when-made defense and a true lender inquiry both read.

## Auditing

APR and cap errors are found by recomputation, so the record must allow it:

- **Every APR and MAPR as computed:** the charges and their classification rule, the amount financed, the payment stream, the method, the engine version, and the disclosure that showed it.
- **The classification rules over time,** with citations and effective dates.
- **Every cap evaluated for every offer,** including opt-outs and their status on the offer date.
- **Every covered borrower check,** with the response as received.
- **Every SCRA benefit:** notice, evidence, periods, forgiven interest and the reposting entries.
- **For partner-bank loans:** lender of record, rate authority and home state, the bank's approvals of underwriting and pricing policy, and each transfer of ownership.

## What This Means for the System You Build

- **Keep fee classification as cited rules,** separately for the finance charge, the MAPR and points and fees.
- **Compute the APR once per offer and store it with its inputs,** and render, test and book from that row.
- **Test the solver against Appendix J and the FFIEC tool,** and know which tolerance applies (1/8, 1/4, $100).
- **Run the MLA check before the price,** and compute the MAPR with the charges Regulation Z leaves out.
- **Model SCRA as a backdated rate change** with forgiveness and a new schedule version.
- **Record the lender of record's rate authority and home state on every loan,** and keep it through every sale.
- **Treat opt-outs and court rulings as dated rules,** with the ability to reprice or exit a state when they change.

## References

**Law and regulation**

- [12 CFR 1026.4](https://www.law.cornell.edu/cfr/text/12/1026.4), the finance charge: definition, examples, third-party charges, exclusions, voluntary insurance and no offsets
- [12 CFR 1026, Appendix J](https://www.consumerfinance.gov/rules-policy/regulations/1026/j/), the actuarial method, unit-periods, fractional periods and solution by iteration
- [12 CFR 1026.22](https://www.law.cornell.edu/cfr/text/12/1026.22), APR accuracy: 1/8 and 1/4 point tolerances, the mortgage rule and calculation tools
- [12 CFR 1026.18](https://www.law.cornell.edu/cfr/text/12/1026.18), the $100 mortgage finance charge tolerance and the $5 and $10 tolerances
- [12 CFR 1026.38](https://www.law.cornell.edu/cfr/text/12/1026.38), the Closing Disclosure's finance charge accuracy standard
- [12 CFR 1026.43](https://www.law.cornell.edu/cfr/text/12/1026.43), higher-priced covered transactions, General QM product features, price thresholds and points and fees
- [12 CFR 1026.43 (CFPB)](https://www.consumerfinance.gov/rules-policy/regulations/1026/43/), the higher-priced covered transaction definition
- [32 CFR 232.4](https://www.law.cornell.edu/cfr/text/32/232.4), the 36% MAPR and the charges it includes
- [50 U.S.C. 3937](https://www.law.cornell.edu/uscode/text/50/3937), the SCRA 6% cap, forgiveness, notice and DMDC
- [12 U.S.C. 85](https://www.law.cornell.edu/uscode/text/12/85), national bank interest rate authority
- [12 U.S.C. 1831d](https://www.law.cornell.edu/uscode/text/12/1831d), state bank parity, the forfeiture penalty and the section 525 opt-out note
- [12 CFR 7.4001](https://www.law.cornell.edu/cfr/text/12/7.4001), the OCC's definition of interest and its valid-when-made provision
- [12 CFR 331.4](https://www.law.cornell.edu/cfr/text/12/331.4), the FDIC's interest rate authority and its valid-when-made provision

**Federal Register**

- [CFPB: Truth in Lending (Regulation Z) Annual Threshold Adjustments, 90 FR 57890 (December 15, 2025)](https://www.federalregister.gov/documents/full_text/html/2025/12/15/2025-22773.html), the 2026 QM, points and fees and HOEPA figures
- [OCC: National Banks and Federal Savings Associations as Lenders, 85 FR 68742 (October 30, 2020)](https://www.federalregister.gov/documents/2020/10/30/2020-24134/national-banks-and-federal-savings-associations-as-lenders), the true lender rule's named-or-funds test
- [OCC: National Banks and Federal Savings Associations as Lenders, 86 FR 42686 (August 5, 2021)](https://www.federalregister.gov/documents/2021/08/05/2021-16619/national-banks-and-federal-savings-associations-as-lenders), the rule removed after the CRA disapproval

**Regulators and tools**

- [OCC: Bulletin 2020-40, FFIEC Federal Disclosure Computational Tools](https://www.occ.gov/news-issuances/bulletins/2020/bulletin-2020-40.html), APRWIN retired and the FFIEC APR tool for Regulation Z and MLA checks

**Courts and analysis**

- [Loper Bright Enterprises v. Raimondo (June 28, 2024)](https://www.law.cornell.edu/supremecourt/text/22-451), Chevron overruled
- [Nutter: Supreme Court declines review of Madden (July 13, 2016)](https://www.nutter.com/trending-newsroom-publications-Supreme-Court-Declines-Review-of-Controversial-Second-Circuit-Loan-Purchase-Decision-07-13-2016), the holding, the cert denial and its circuit reach
- [Orrick: OCC and FDIC successfully defend valid-when-made rules (February 2022)](https://www.orrick.com/en/Insights/2022/02/OCC-and-FDIC-Successfully-Defend-Valid-When-Made-Rules), California v. OCC and v. FDIC, the dates, case numbers and Chevron
- [Davis Polk: OCC's true lender rule has been repealed](https://www.davispolk.com/insights/client-update/occ-s-true-lender-rule-has-been-repealed), the CRA votes, signing and effect
- [CRS Legal Sidebar LSB11433: En banc Tenth Circuit to consider scope of DIDMCA opt-out (May 22, 2026)](https://www.everycrsreport.com/files/2026-05-22_LSB11433_01c9274923b644f900a11cc38dacf4ba656333e5.html), Weiser's history, the opt-out states and the federal bills
- [Consumer Finance Monitor: Plaintiffs' en banc brief in the Colorado opt-out case (June 8, 2026)](https://www.consumerfinancemonitor.com/2026/06/08/plaintiffs-tell-tenth-circuit-en-banc-court-that-colorados-opt-out-law-cannot-reach-loans-made-by-out-of-state-state-chartered-banks/), the injunction, the amici and the August 18, 2026 argument

**Filings**

- [Affirm Holdings: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/0001820953/000162828026059279/afrm-20260630.htm), originating bank partners' rate limits under the FDIC rule and the partner-model risk factor
