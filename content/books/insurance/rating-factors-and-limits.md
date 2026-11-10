+++
title = "What You May Rate On"
description = "Rating factors by line and the states that ban or limit them: credit, gender, marital status, prior insurance, Prop 103, price optimization, bias testing."
category = "Insurance Industry"
order = 2720
part = "Rating and Underwriting"
tags = ["insurance", "rating", "unfair-discrimination", "credit-based-insurance-scores", "prop-103", "price-optimization"]
+++

Every state's rating law says the same three words: rates may not be excessive, inadequate or unfairly discriminatory. The third is the one that decides which columns a rating engine may read. Insurance discriminates by design (a 19-year-old pays more than a 45-year-old because the 19-year-old crashes more), and the law permits discrimination that tracks expected loss. What it forbids varies by state: some characteristics are banned outright whatever the data says (race everywhere; sex, credit or marital status in some states for some lines), some are allowed with conditions (credit-based insurance scores with notice, re-rating and exception rules), some are required in a fixed order of importance (California's auto factors), and some are allowed only if the insurer can show they aren't proxies for something banned. On top of the per-factor rules, regulators have taken aim at how factors are combined: pricing on a customer's willingness to pay rather than on risk (price optimization), and models whose inputs are individually lawful but whose outputs fall harder on a protected class.

For a system that means the set of permissible inputs is a function of state, line, product version and date, and has to be enforced in the rating engine, the underwriting rules and the models, with proof. This chapter covers the factors by line, the states that ban or restrict them as of November 2026, California's Proposition 103 regime, price optimization bulletins, and unfair discrimination testing. How a factor is applied is [How a Rate Is Built](/books/insurance/how-a-rate-is-built); how consumer report data (credit, loss history, driving records) is obtained and noticed is [Consumer Reports & Third-Party Data](/books/insurance/consumer-reports-and-third-party-data); the governance of models is [Underwriting Rules, Referrals & Models](/books/insurance/underwriting) and [Data, AI & Privacy Rules](/books/insurance/data-ai-and-privacy-rules).

## How the States Do It

Selected restrictions, each opened on a primary page and dated; the absence of a state from the table is not a statement that it has no rule:

| State | Rule | Lines | Status, November 2026 |
| --- | --- | --- | --- |
| **California** | Auto rates set by three mandatory factors in decreasing order of importance (driving safety record, annual miles, years of driving experience), then only optional factors the commissioner adopts by regulation; credit and gender are not on the optional list (gender removed effective January 1, 2019); absence of prior insurance alone may not be a criterion | Private passenger auto | In force (Ins. Code 1861.02; 10 CCR 2632.5); a regulation to remove marital status as an optional factor was sent to OAL September 16, 2026 |
| **Hawaii** | No rating plan or underwriting standard based in whole or in part on, among others, race, creed, ethnic background, age, sex, length of driving experience, credit bureau rating, marital status or physical disability | Motor vehicle | In force (HRS 431:10C-207) |
| **Maryland** | Homeowners: no underwriting, cancellation, nonrenewal or rating based in whole or in part on credit history, including discounts, tiers or affiliate placement. Auto: credit may be used to rate a new policy only, with conditions; never to refuse, cancel, nonrenew or raise a renewal premium | Homeowners, private passenger auto | In force (Ins. 27-501(e-2)) |
| **Massachusetts** | No refusal to issue or renew, and no rates, premiums or risk classifications, based on credit information, including a credit-based insurance score; an insurer's own payment history, claims history reports and motor vehicle records remain usable | Private passenger auto | In force since 2011 (G.L. c. 175, 4E and 113B; c. 175E, 4; [Acts of 2011, ch. 195](https://malegislature.gov/Laws/SessionLaws/Acts/2011/Chapter195), approved November 22, 2011) |
| **Michigan** | "An insurer shall not use an individual's credit score to establish or maintain rates or rating classifications for automobile insurance" | Auto | In force since June 11, 2019 (MCL 500.2162, 2019 PA 21) |
| **Washington** | The commissioner's 2021-2022 rule suspending credit-based insurance scores was struck down; the August 29, 2022 final order lets insurers resume credit scoring | Auto, homeowners, renters | No ban in force; a 2025 study bill (SB 5589) passed the Senate and was not enacted |
| **New York** | Insurers must evaluate whether external consumer data and AI systems proxy for protected classes and test for unfair discrimination before production | All lines DFS regulates, underwriting and pricing | Circular Letter No. 7, July 11, 2024 |
| **13 jurisdictions** | Price optimization barred in ratemaking by bulletin or notice (list below) | P&C | Bulletins issued October 2014 to October 2015 |

## Factors by Line

The variables a filing uses differ by line because the risk differs:

- **Personal auto.** Driving record (accidents and violations from motor vehicle reports and claims history), years licensed, age and sex where allowed, marital status where allowed, annual mileage and use (commute, business, pleasure), garaging territory, vehicle (symbol or rating group, model year, safety and anti-theft features), limits and deductibles, prior insurance and its limits, multi-car and multi-policy, credit-based insurance score where allowed, telematics where allowed and enrolled, and persistency (years with the insurer).
- **Homeowners and dwelling.** Location (territory, distance to coast, wildfire and wind scores, protection class from the fire department and hydrant), construction and age, roof age and material, replacement cost and coverage A amount, deductibles (all-peril, wind and hail, hurricane), prior claims at the property and by the applicant, credit-based insurance score where allowed, protective devices, and multi-policy.
- **Commercial lines.** Class code, exposure base (payroll, sales, area, vehicles), territory, limits, and the insured's own experience through experience and schedule rating ([The Commercial Lines Map](/books/insurance/commercial-lines); [Rating Workers' Comp & Premium Audit](/books/insurance/rating-workers-comp)).

California's optional auto factors, from 10 CCR 2632.5(d), show what one strict state permits after the three mandatory ones: type of vehicle; vehicle performance capabilities; type of use; percentage of use by the rated driver; multi-vehicle households; academic standing; completion of driver training or defensive driving; vehicle characteristics; marital status; persistency; non-smoker; secondary driver characteristics; multi-policy; relative claims frequency; and relative claims severity. Persistency there is a renewal discount for continuous coverage with the insurer or an affiliate and may not be based on coverage with a non-affiliated insurer.

## Banned and Restricted Factors

### Credit-Based Insurance Scores

A credit-based insurance score is a number built from credit report data to predict insurance losses, not repayment. NAIC's consumer page (updated March 19, 2026) says FICO introduced them in the early 1990s and estimates about 95% of auto insurers and 85% of homeowners insurers use them where permitted; in most states insurers may not use them as the sole reason to raise rates or deny, cancel or refuse to renew, and many states require notice when credit contributed to an adverse decision. The restrictions take four shapes:

- **Outright bans for a line.** California's auto factors exclude credit; Hawaii's motor vehicle statute names "credit bureau rating"; Massachusetts bars credit in private passenger auto issue, renewal and rates; Michigan bars credit scores in auto rates and classifications; Maryland bars credit in homeowners entirely.
- **New business only.** Maryland allows credit to rate a new auto policy but not to raise a renewal premium, and attaches conditions: no credit factor older than five years; disclosure at application, with a quote that "separately identifies the portion of the premium attributable to the applicant's credit history" on request; no use of the absence of credit history or the number of inquiries; and a review every two years (or on request) for an insured adversely affected at initial rating, with the premium adjusted for improvement.
- **The NCOIL model's conditions.** Most states that permit credit follow some version of NCOIL's Model Act Regarding Use of Credit Information in Personal Insurance (readopted November 15, 2025). It bars an insurance score that uses income, gender, address, ZIP code, ethnic group, religion, marital status or nationality; bars denying, cancelling or nonrenewing solely on credit; requires treating a consumer with no credit history as if they had neutral credit (or another approved treatment) unless the insurer excludes credit; requires a report no older than 90 days for adverse action; requires re-rating on request at annual renewal (no more than once in twelve months); excludes medical collections and multiple lender inquiries within 30 days from negative use; and requires reasonable exceptions for extraordinary life circumstances (a declared catastrophe, serious illness or injury, death of a spouse, child or parent, divorce, identity theft, involuntary job loss of three months or more, overseas military deployment). NCOIL publishes no official count of adopting states.
- **Failed bans.** Washington's commissioner suspended credit scoring by emergency rule in 2021 and permanent rule in 2022; a Thurston County Superior Court judge held that a state statute allowing credit scoring limited the commissioner's authority, and on August 29, 2022 the commissioner agreed to a final order eliminating the rule and said the Legislature would have to act. As of November 2026 it hasn't.

### Gender, Marital Status, Age and Experience

California removed gender from auto rating by regulation effective January 1, 2019 (the 2632.5 history shows amendments operative that date) and on September 16, 2026 proposed removing marital status, an optional factor since 1996; the proposed regulation was submitted to the Office of Administrative Law, and insurers using the factor would bring rating plans into compliance through the Department's Prop 103 review. In July 2026 the First District Court of Appeal in Ison v. Lara upheld the commissioner's authority under Prop 103 to regulate optional rating factors. Hawaii's statute goes furthest, naming age, sex, length of driving experience and marital status alongside credit for motor vehicle insurance, and its supreme court has read the section to cover underwriting standards as well as rating plans. Other states are reported to restrict gender in auto rating; I have opened only California's and Hawaii's rules.<!-- source-gap: gender-auto-bans | secondary | states beyond California and Hawaii that bar sex as an auto rating factor (reported: MA, MT, NC, PA, partial MI) | closes with: each state's statute or regulation text | checked: 2026-11-10 -->

### Prior Insurance and Claims

California says "the absence of prior automobile insurance coverage, in and of itself, shall not be a criterion" for Good Driver Discount eligibility or for rates, premiums or insurability (Ins. Code 1861.02(c)), and the Good Driver Discount itself must be at least 20% below what the insured would otherwise pay. Maryland's homeowners rules bar cancelling, nonrenewing or refusing a risk for a claim more than three years old, and bar refusing auto coverage solely because prior coverage was with the state fund (MAIF) or any authorized insurer; its cross-line rules let an auto insurer consider homeowners claims at initial issue but not raise an auto renewal premium for a homeowners claim. These rules sit in the underwriting engine as much as the rating engine: the same input may be lawful for one use and banned for another.

### Persistency, Loyalty and the Mirror Image

A persistency discount rewards staying; price optimization (below) is the regulatory name for the mirror image, charging more to customers predicted not to leave. California allows persistency only with the insurer or an affiliate. A rating rule that keys on tenure is lawful in most states; a rule that keys on predicted elasticity is not, in the thirteen jurisdictions below.

## California's Proposition 103

Proposition 103 (1988) made California the strictest auto rating regime in the country, and its structure is worth knowing even outside California because it is the template regulators reach for. Insurance Code 1861.02(a) requires auto rates and premiums to be determined by the three mandatory factors "in decreasing order of importance," then by optional factors the commissioner adopts by regulation that have a substantial relationship to the risk of loss, with the regulations setting each factor's weight; using any criterion without approval is unfair discrimination. Mileage is an estimate of the next twelve months' driving (the applicant's, or a reasonable objective estimate, with a commissioner-approved default), and insurers may verify it with odometer readings, including smog check readings from state agencies, or, in an optional and voluntary program, with verified actual mileage, including from "a technological device" that may collect only miles driven, never location ([Telematics & Usage-Based Insurance](/books/insurance/telematics#state-limits)). How California's rate filings are reviewed is [Filing Rates & Forms](/books/insurance/rate-and-form-filing).

In a rating system, Prop 103 means the class plan is not a free set of multiplicative factors: the regulation sets each factor's weight, so the order of importance is something the actuarial team must demonstrate before filing and the engine must preserve, and a new variable needs a regulation, not just a filing.

## Price Optimization

Price optimization, in the definition Connecticut's Office of Legislative Research collected from regulators, is the use of data mining and modeling in ratemaking to vary rates on factors other than risk of loss, aiming to charge the most an insured will tolerate before shopping or not renewing. Thirteen jurisdictions barred it by bulletin or notice:

| Jurisdiction | Instrument | Date |
| --- | --- | --- |
| Maryland | Bulletin 14-23 | October 31, 2014 |
| Ohio | Bulletin 2015-01 | January 29, 2015 |
| California | Notice regarding unfair discrimination in rating: price optimization | February 18, 2015 |
| Florida | Informational Memorandum OIR-15-04M | May 14, 2015 |
| Vermont | Bulletin No. 186 | June 24, 2015 |
| Washington | Technical Assistance Advisory 2015-01 | July 9, 2015 |
| Indiana | Bulletin 219 | July 20, 2015 |
| Pennsylvania | Notice 2015-06 | August 22, 2015 |
| Maine | Bulletin 405 | August 24, 2015 |
| District of Columbia | Bulletin 15-IB-06-8/15 | August 25, 2015 |
| Montana | Advisory Memorandum | September 18, 2015 |
| Rhode Island | Bulletin 2015-8 | September 18, 2015 |
| Delaware | Bulletin No. 78 | October 1, 2015 |

The NAIC's Casualty Actuarial and Statistical Task Force prepared a white paper on the practice. What these bulletins mean for a system: any factor in a rating plan needs a documented relationship to expected loss or expense, and a "retention" or "demand" model may inform marketing and underwriting capacity but may not feed the filed rate. The control is architectural: the rating engine's inputs are a whitelist per product version, and nothing outside it (a churn score, a price-elasticity estimate) can reach a rating step.

## Unfair Discrimination Testing

Two standards meet here. **Actuarial justification**: a factor is lawful if it is correlated with expected loss and not banned. **Disparate impact**: a lawful-looking factor (a ZIP code, an occupation, an education level, a telematics behavior) may produce outcomes that fall disproportionately on a protected class. States differ on whether the second standard applies to insurance at all, and the debate is live.

New York's Circular Letter No. 7 (July 11, 2024) is the most detailed regulator statement as of November 2026. For external consumer data and information sources (ECDIS) and AI systems used in underwriting and pricing, insurers should:

- **Evaluate proxy risk:** "the extent to which such ECDIS are correlated with (i.e., proxy for) status in any protected classes."
- **Show actuarial validity:** a "clear, empirical, statistically significant, rational, and not unfairly discriminatory relationship" between the variable and the risk.
- **Run a three-step review:** is there a disproportionate adverse effect; is there a legitimate, lawful and fair explanation; and is there a less discriminatory alternative that serves the same purpose.
- **Test before production** and then regularly and after material changes, using multiple statistical metrics with qualitative review.
- **Keep governance** (board oversight, senior management responsibility, written policies, an inventory, records of testing and complaints) and stay responsible for vendor models, without relying "solely on a third-party's claim of non-discrimination."

Colorado's SB21-169 regime (3 CCR 702-10, effective November 13, 2023, amended effective October 15, 2025) is the other insurance-specific framework; the amended governance regulation reaches insurers offering individual life, private passenger auto and health benefit plans ([Colorado Division of Insurance: Notice of Adoption, Amended Regulation 10-1-1](https://content.govdelivery.com/accounts/CODORA/bulletins/3ee9c3f)), but I could not confirm on a primary page whether homeowners rules or any quantitative testing regulation had been adopted as of November 2026.<!-- source-gap: co-sb21-169-lines | status | Colorado SB21-169 rules for homeowners, and quantitative testing regulations for any line: adopted, proposed or pending as of November 2026 | closes with: the Colorado Division of Insurance SB21-169 page or the adopted regulation texts | checked: 2026-11-10 --> The NAIC's AI model bulletin, adopted December 4, 2023 and adopted in 29 jurisdictions by November 3, 2026, requires decisions made with AI systems not to be "inaccurate, arbitrary, capricious, or unfairly discriminatory" and sets out the governance program ([Underwriting Rules, Referrals & Models](/books/insurance/underwriting)).

Testing protected-class outcomes is awkward because insurers generally don't collect race or ethnicity. The practical choice is between inferring it statistically for testing only (from name and geography), testing on proxies, or testing on a consented sample; each choice has error and privacy costs, and whichever is used belongs in the documented methodology the examiner will ask for. My rule: **the inference and the test results live in a separate, access-controlled analysis store that rating and underwriting cannot read**, so the act of testing can never become an input.

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model) and [How a Rate Is Built](/books/insurance/how-a-rate-is-built) (`rate_tables`, `rating_algorithms`, `rating_steps`). This chapter adds `rating_factor_rules`, the per-state, per-line, per-use legality of each input, enforced when a product version is published and again when a quote is rated.

```sql
CREATE TABLE rating_factor_rules (         -- may this input be used, here, for this purpose?
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  state              TEXT NOT NULL,         -- 'US-CA'
  line               TEXT NOT NULL,         -- 'personal_auto', 'homeowners', ...
  factor             TEXT NOT NULL,         -- 'credit_insurance_score', 'gender', 'marital_status',
                                            -- 'prior_insurance_absent', 'telematics_behavior', ...
  use                TEXT NOT NULL CHECK (use IN ('rating', 'underwriting', 'tiering',
                       'cancellation', 'nonrenewal', 'renewal_rating', 'payment_plan')),
  treatment          TEXT NOT NULL CHECK (treatment IN ('prohibited', 'permitted',
                       'conditional', 'mandatory')),
  conditions         JSONB,                 -- {"new_business_only": true, "max_age_years": 5,
                                            --  "rerate_on_request_months": 12, "neutral_if_no_hit": true}
  mandatory_rank     INT,                   -- Prop 103 order: 1 driving record, 2 mileage, 3 experience
  citation           TEXT NOT NULL,         -- 'Md. Ins. 27-501(e-2)(4)', 'HRS 431:10C-207'
  source_url         TEXT NOT NULL,
  effective_from     DATE NOT NULL,
  effective_to       DATE,
  checked_on         DATE NOT NULL          -- last time someone reread the primary source
);

CREATE TABLE product_rating_inputs (       -- the whitelist a product version may read
  product_id         UUID NOT NULL REFERENCES products (id),
  factor             TEXT NOT NULL,
  uses               TEXT[] NOT NULL,       -- 'rating', 'underwriting', ...
  rate_table_id      UUID REFERENCES rate_tables (id),
  justification_ref  TEXT NOT NULL,         -- actuarial memorandum exhibit in the filing
  PRIMARY KEY (product_id, factor)
);
```

Publishing a product version fails if any input is prohibited for its state, line and use on the product's effective date:

```sql
SELECT pri.factor, u.use, r.citation
FROM product_rating_inputs pri
JOIN products p ON p.id = pri.product_id
CROSS JOIN LATERAL unnest(pri.uses) AS u(use)
JOIN rating_factor_rules r
  ON r.state = p.state AND r.line = p.line AND r.factor = pri.factor AND r.use = u.use
 AND r.treatment = 'prohibited'
 AND r.effective_from <= p.effective_from
 AND (r.effective_to IS NULL OR r.effective_to > p.effective_from)
WHERE pri.product_id = :product_id;
```

Design choices:

- **Legality is per use, not per factor.** Maryland's auto credit rule permits `rating` on new business and prohibits `renewal_rating`, `cancellation` and `nonrenewal`; one row per use makes that expressible.
- **Conditions are executable.** "Neutral if no hit," "no factor older than five years" and "re-rate on request once per twelve months" are parameters the rating and renewal jobs read, not prose in a compliance binder.
- **Inputs outside the whitelist never reach rating.** The rating service receives a typed input object built from `product_rating_inputs`; a new data source needs a product version, which needs a filing.
- **Rules carry `checked_on`.** Law moves; a quarterly job lists every rule not rechecked in 90 days.

## Auditing

- **Every product version's input whitelist, with its justification reference** and the factor rules that were checked when it was published.
- **Every quote's inputs, and only those inputs,** in the worksheet; an examiner asking whether marital status affected a California premium after the effective date of a ban gets a query, not an investigation.
- **Testing records**: the methodology, the data, the metrics, the results, the less discriminatory alternatives considered and the decision, per model and version, kept apart from production data.
- **Exception handling under credit rules**: every extraordinary life circumstance request, the documentation, the decision and the date, since the NCOIL model requires a response within 30 days of sufficient documentation.

## What This Means for the System You Build

- **Model legality per state, line, factor and use, with dates and citations,** and enforce it at product publication and at rating.
- **Whitelist rating inputs per product version** so a new variable needs a filing.
- **Keep retention and elasticity models out of the rating path** in every state, not just the thirteen that barred price optimization.
- **Encode California's mandatory factor order** as a validation on the class plan, and its mileage and device limits as input rules.
- **Implement credit conditions as code:** neutral treatment for no-hit, refresh limits, re-rate on request, extraordinary life circumstance exceptions.
- **Test for disparate impact with a documented method,** in a store production can't read.

## References

**Law and regulation**

- [Cal. Ins. Code 1861.02 (FindLaw)](https://codes.findlaw.com/ca/insurance-code/ins-sect-1861-02/), the mandatory auto factors in decreasing order of importance, optional factors by regulation, the Good Driver Discount of at least 20% and the prior insurance rule
- [10 CCR 2632.5: Rating Factors](https://www.law.cornell.edu/regulations/california/10-CCR-2632.5), the mandatory factors, estimated and verified mileage, the technological device limit, the fifteen optional factors and the amendment history including January 1, 2019
- [HRS 431:10C-207](https://data.capitol.hawaii.gov/hrscurrent/Vol09_Ch0431-0435H/HRS0431/HRS_0431-0010C-0207.htm), Hawaii's prohibited motor vehicle rating and underwriting characteristics, including credit bureau rating, sex, age and marital status
- [Md. Code, Ins. 27-501 (PDF)](https://mgaleg.maryland.gov/2025RS/Statute_Web/gin/27-501.pdf), the homeowners credit ban, auto new-business credit rating and its conditions, the three-year claim rule and cross-line claim rules
- [Massachusetts Acts of 2011, ch. 195](https://malegislature.gov/Laws/SessionLaws/Acts/2011/Chapter195) and [G.L. c. 175, 4E](https://malegislature.gov/Laws/GeneralLaws/PartI/TitleXXII/Chapter175/Section4E), the private passenger auto credit ban in issuing, renewing and rating, approved November 22, 2011
- [MCL 500.2162](https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-500-2162), Michigan's ban on credit scores in auto rates and rating classifications, effective June 11, 2019

**Regulators and guidance**

- [California Department of Insurance: Release 032-2026, September 16, 2026](https://www.insurance.ca.gov/0400-news/0100-press-releases/2026/release032-2026.cfm), the proposed regulation removing marital status as an optional auto factor, its submission to OAL, and Ison v. Lara (July 16, 2026)
- [Washington OIC: Final order in court's credit scoring decision, August 29, 2022](https://www.insurance.wa.gov/news/final-order-courts-credit-scoring-decision-kreidler-will-not-appeal), the end of Washington's credit scoring rule and the commissioner's decision not to appeal
- [Washington Legislature: SB 5589 (2025-26)](https://app.leg.wa.gov/billsummary?BillNumber=5589&Year=2025), the credit and rating factor study bill's Senate passage and its return to Senate Rules
- [NY DFS: Insurance Circular Letter No. 7 (2024)](https://www.dfs.ny.gov/industry-guidance/circular-letters/cl2024-07), proxy evaluation, actuarial validity, the three-step review, pre-production testing, governance and vendor responsibility
- [Connecticut Office of Legislative Research: 2015-R-0251, Price Optimization](https://www.cga.ct.gov/2015/rpt/2015-R-0251.htm), the regulators' definition and the thirteen jurisdictions' bulletins and dates, and the NAIC draft white paper

**NAIC**

- [NAIC: Credit-Based Insurance Scores](https://content.naic.org/insurance-topics/credit-based-insurance-scores), what the scores predict, FICO's usage estimates, sole-use limits and adverse action notices (updated March 19, 2026)
- [NAIC: Model Bulletin, Use of Artificial Intelligence Systems by Insurers (PDF)](https://content.naic.org/sites/default/files/inline-files/2023-12-4%20Model%20Bulletin_Adopted_0.pdf), the unfair discrimination standard for AI-supported decisions and the AIS program
- [NAIC: Implementation of NAIC Model Bulletin on AI, adoption map (PDF)](https://content.naic.org/sites/default/files/legal-adoption-map-ai-model-bulletin.pdf), 29 adopting jurisdictions and the California, Colorado, New York and Texas alternatives, status as of November 3, 2026

**Standards**

- [NCOIL: Model Act Regarding Use of Credit Information in Personal Insurance, readopted November 15, 2025 (PDF)](https://ncoil.org/wp-content/uploads/2026/02/NCOIL-Credit-Model-November-2025.pdf), prohibited score inputs, sole-use and no-hit rules, refresh and re-rating, extraordinary life circumstances, dispute re-rating and adverse action reasons
