+++
title = "Flood & the NFIP"
description = "The NFIP and Write Your Own, Risk Rating 2.0 and a premium built step by step, mandatory purchase, reauthorization lapses, private flood and reform."
category = "Insurance Industry"
order = 2745
part = "Personal Lines"
tags = ["insurance", "flood", "nfip", "risk-rating-2", "fema", "personal-lines"]
+++

Flood is the peril the homeowners policy excludes and the federal government insures. The National Flood Insurance Program, run by FEMA, writes about 4.5 million policies with about $1.3 trillion of coverage, collects about $4.6 billion a year in premiums, fees and surcharges, and is the primary source of residential flood insurance in the United States, yet FEMA estimates only about 4% of homeowners have flood insurance. Most NFIP policies are sold and serviced by private insurers in their own names under the **Write Your Own** program, as fiscal agents of the United States, so a carrier's policy and claims systems handle a federal product with federal rates, forms, data reporting and money that belongs to the Treasury. Since 2021 the NFIP prices each building individually under **Risk Rating 2.0**, built from catastrophe models; since 2017 its authority to sell policies has lapsed several times when Congress let its short-term extensions run out; and a growing private flood market writes around it.

This chapter covers the NFIP's structure and Write Your Own, Risk Rating 2.0 with a premium built step by step, coverage limits and the waiting period, the mandatory purchase requirement for mortgages, reauthorization and its lapses, private flood, and the reform proposals as of November 2026. The NFIP's own reinsurance and cat bonds are in Reinsurance Structures and Cat Bonds, ILS & State Cat Funds; flood claims adjusting is in Property Claims.

## How the Platforms Do It

As of November 2026:

| Participant | Role | Public detail |
| --- | --- | --- |
| **FEMA (NFIP)** | Insurer of record, rate and form setter, risk bearer | About 4.5 million policies and $1.3 trillion of coverage; more than 22,700 participating communities in 56 states and jurisdictions; owes $22.525 billion to the Treasury with $7.9 billion of a $30.425 billion borrowing limit remaining (CRS, October 2026) |
| **Write Your Own companies** | Private insurers selling and servicing NFIP policies in their own names | 47 WYO companies sell about 87.6% of NFIP policies |
| **Direct Servicing Agent** | FEMA's own servicing operation for policies not written through a WYO | About 12.4% of policies; National Flood Services has been the DSA since October 2020 |
| **Private flood insurers and MGAs** | Admitted and surplus lines flood policies outside the NFIP | 643,467 private flood policies as of May 2026 against the NFIP's 4.55 million (CRS); Neptune Flood, an MGA, reported $370.2 million of premium in force at the end of 2025 and an estimated 8.2% of the US primary residential flood market |
| **Reinsurers and cat bond investors** | Take part of the NFIP's risk | 2024 traditional reinsurance of $619.5 million for $121.1 million of premium, and three-year cat bonds |

Neptune's 10-K describes the private MGA pattern plainly: it writes on behalf of 40 capacity providers (including 32 reinsurers across 8 insurance programs) and "does not take any balance sheet insurance risk," and says "100% of our underwriting is performed instantaneously by our Triton engine." The NFIP runs the other way: one public insurer, standardized forms, and private companies paid to administer it.

## Write Your Own

Under the WYO arrangement (renewed annually; the fiscal year 2027 arrangement was published in the Federal Register on May 5, 2026), private insurers sell NFIP flood insurance under their own names and adjust claims under the Standard Flood Insurance Policy, acting "as fiscal agents" of the federal government under 42 U.S.C. 4071 and 4081(a) and 44 CFR 62.23 and 62.24. Its terms:

- **Expense allowance.** Operating and administrative expenses are reimbursed by formula: the sum of the average industry expense ratios from NAIC data for five property coverages. Separately, the company retains 15% of written premium for agent and broker commissions.
- **Growth bonus.** FEMA may increase a company's allowance for meeting marketing goals, with all bonuses together capped at 2% of aggregate net written premium.
- **Loss adjustment.** Unallocated LAE is reimbursed on a ULAE schedule; allocated LAE on a fee schedule FEMA may raise temporarily after catastrophic events.
- **Money.** Companies draw on the National Flood Insurance Fund as needed (typically at most once a day) and "remit all funds not required to meet current expenditures to the United States Treasury."
- **Term.** October 1, 2026 through at least September 30, 2027; intent to subscribe was due September 2, 2026.

For a WYO company's systems, NFIP business is a separate book: premium isn't the company's revenue, losses aren't its losses, and its reporting to FEMA follows FEMA's transaction record formats and accounting procedures rather than its own statutory statement. The data model treats the NFIP as the `insurer` on the policy and the WYO company as a servicer with its own name on the documents. FEMA also launched a direct-to-customer quoting tool in April 2025.

## Risk Rating 2.0

FEMA replaced zone-based rating (where a premium depended mainly on the building's flood zone on the Flood Insurance Rate Map and its elevation relative to the base flood elevation) with **Risk Rating 2.0**: new policies from October 1, 2021, renewals from April 1, 2022, fully implemented April 1, 2023. It rates each building on flood frequency, multiple flood types (river overflow, storm surge, coastal erosion and heavy rainfall), distance to a water source, elevation and rebuilding cost, using private datasets and catastrophe models. Community Rating System discounts (5% for Class 9 up to 45% for Class 1, a national average of 13.8%) now apply to every policy in a participating community, not only to policies in the special flood hazard area.

The methodology report (Milliman for FEMA, January 18, 2022) shows how the rates were built and in what order the premium is computed:

- **Target premiums** by state, peril, occupancy and levee status, from average annual losses modeled with the AIR, CoreLogic and KatRisk models, rescaled to the NFIP's history, plus provisions for expenses, LAE and the net cost of reinsurance.
- **Rating territories:** 115,862 for non-leveed areas and 14,866 for leveed areas, so territory factors are published in ranges.
- **Selected factors** include foundation type (1.30 for basements, 1.25 for elevated buildings with an enclosure that are not on posts, piles or piers, 1.20 for crawlspaces, 1.00 otherwise) and 0.95 for machinery and equipment elevated above the first floor; factors are capped at about the 5th and 95th percentiles of the exposure distribution.
- **A maximum rate** of $15 per $1,000 of building value (and of contents value) times the insurance-to-value factor.
- **A prior claims surcharge** of $2 per $1,000 of value (times the weighted insurance-to-value factor) for each claim after the first in the 20 years before the policy period.
- **Calculation order:** base rate by state, sub-peril and coverage; geographic factors; property and policy factors; concentration risk; the CRS discount; the deductible and insurance-to-value factor; minimum and maximum rates; rates times value in thousands for the initial premium; the prior claims surcharge; an expense constant and a loss constant per policy; the cost of Increased Cost of Compliance coverage and the Reserve Fund; then fees.

Statutory limits then cap how fast any one policy's premium can rise: most increases are limited to 18% a year for primary residences and 25% for other policies (CRS), so a building whose full-risk premium is far above its old premium climbs toward it over years. GAO found about 66% of premiums increased in Risk Rating 2.0's first year and estimated it could take until 2037 for 95% of policies to reach full risk-based rates.

### An NFIP Premium, Step by Step

An illustration, mine, following the methodology's order with FEMA's published charges; the rates per $1,000, the constants and the ICC premium are invented for the example, since the actual tables are in FEMA's Flood Insurance Manual (effective October 1, 2025 for new business), which is too large for me to retrieve.<!-- source-gap: nfip-manual-premium-tables | missing | Flood Insurance Manual (Oct 1, 2025) tables: ICC premium amounts, expense and loss constants, and the exact premium base the 18% cap and the Reserve Fund assessment are applied to | closes with: the relevant sections of the FEMA Flood Insurance Manual, or a FEMA rate explanation for a real policy | checked: 2026-11-10 -->

A primary residence, single-family home with a building replacement cost of $250,000 and contents of $100,000, insured to those limits, in a CRS Class 6 community (a 20% discount), no prior claims, renewing; last year's premium on the same basis was $1,000.

| Step | Calculation | Amount |
| --- | --- | --- |
| Building rate per $1,000, after geographic, property, concentration and CRS factors and the deductible and ITV factor (illustrative) | $4.10, under the $15 maximum | |
| Contents rate per $1,000 (illustrative) | $2.00 | |
| Initial premium | 250 × $4.10 + 100 × $2.00 | $1,225.00 |
| Prior claims surcharge | none | $0.00 |
| Expense and loss constants (illustrative) | | $60.00 |
| Full-risk premium before ICC and assessments | | $1,285.00 |
| Annual increase cap for a primary residence | $1,000 × 1.18 | $1,180.00 |
| Premium charged (lesser of full-risk and capped) | | $1,180.00 |
| ICC premium (illustrative) | | $30.00 |
| Reserve Fund assessment, 18% | 18% × $1,210.00 | $217.80 |
| HFIAA surcharge, primary residence | | $25.00 |
| Federal Policy Fee | | $47.00 |
| **Total cost to the policyholder** | | **$1,499.80** |

The parts with statutory or FEMA-set values: the Reserve Fund assessment is 18% of premium on all policies (raised from 15% effective April 1, 2020); the HFIAA surcharge is $25 for primary residences and $250 for all other properties; the Federal Policy Fee is $47 for most policies (reduced by unit count for large residential condominium buildings) and funds mapping and floodplain management; a $50 probation fee applies in communities on probation for floodplain management deficiencies; and Increased Cost of Compliance coverage pays up to $30,000 toward bringing a substantially damaged building up to code (CRS). Next year the same house's premium can rise at most another 18% toward its $1,285 full-risk level, so the system stores both the full-risk premium and the capped premium charged, every year, with the cap's base.

## Coverage, Limits and the Waiting Period

The Standard Flood Insurance Policy's limits are set by law (CRS):

| Building type | Building limit | Contents limit |
| --- | --- | --- |
| Single-family and 2 to 4 family residential | $250,000 | $100,000 |
| Other residential | $500,000 | $100,000 |
| Nonresidential | $500,000 | $500,000 |

Above those limits, owners buy **excess flood** from private insurers. A new NFIP policy takes effect only after a **30-day waiting period** from completion of the application and payment (42 U.S.C. 4013(c)), with three exceptions: an initial purchase in connection with making, increasing, extending or renewing a loan; an initial purchase within one year after a flood map revision is published; and certain properties affected by post-wildfire flooding from federal land, if purchased within 60 days of the fire's containment. The policy system computes the effective date from the application date and the exception that applies, and stores which.

## Mandatory Purchase

Flood insurance is required for a mortgage on a building in a **special flood hazard area** mapped by FEMA in a participating community, under 42 U.S.C. 4012a, as amended by the Biggert-Waters Act of 2012 and the 2014 Homeowner Flood Insurance Affordability Act:

- **Amount.** Coverage of at least the lesser of the outstanding principal balance or the maximum available under the NFIP, for the loan's term (4012a(b)(1)(A)).
- **Private flood acceptance.** Regulated lenders "shall accept" private flood insurance that meets the statute's definition (4012a(b)(1)(B)): issued by an insurer licensed or approved in the state (or, for certain commercial policies, an eligible surplus lines insurer), coverage "at least as broad as the coverage provided under a standard flood insurance policy," 45 days' written notice of cancellation or nonrenewal to the insured and lender, a mortgage interest clause, a one-year period to sue after a written denial, and cancellation terms at least as restrictive as the NFIP's (4012a(b)(7)). Regulators implemented it in a joint final rule in February 2019.
- **Escrow.** Premiums and fees on residential loans are escrowed with the loan payments, with exceptions including small lenders under $1 billion in assets, junior liens, condominium policies paid as a common expense, home equity lines and loans of 12 months or less (4012a(d)).
- **Force placement.** If a lender finds the property uninsured or underinsured, it notifies the borrower; if the borrower doesn't buy coverage within 45 days, the lender must buy it and may charge the borrower; within 30 days of confirming the borrower's own coverage it must cancel and refund the overlap (4012a(e)). Borrower and lender may jointly ask FEMA to review a flood zone determination, decided within 45 days.
- **Penalties.** Up to $2,000 per violation for a regulated lender's pattern or practice of violations, with no annual cap since 2012 (4012a(f)).

For the insurer that writes flood (NFIP or private), the lender is a mortgagee with statutory notice rights, the policy must carry a lender-acceptable compliance statement for private flood, and the coverage amount is checked against the loan; for the lender's systems, the flood zone determination on each loan is the trigger ([Mortgage Servicing](/books/banking-and-lending/mortgage-servicing#force-placed-insurance)).

## Reauthorization and Lapses

The NFIP's authority to issue new policies has to be reauthorized by Congress. Since the end of fiscal year 2017 Congress has enacted 35 short-term extensions (CRS, August 2026), and as of the CRS update of September 11, 2026 the program is authorized until **December 11, 2026** under P.L. 119-103. When it lapses:

- **No new policies or renewals** can be issued; existing policies stay in force to the end of their one-year terms.
- **Borrowing authority drops** from $30.425 billion to $1 billion; FEMA keeps paying claims from premiums as they arrive.

The lapses on record include January 20 to 22, 2018; about 8 hours on February 9, 2018; about 13 hours on March 23, 2024; October 1 to November 12, 2025; and February 1 to 3, 2026. A lapse is an operational event for every WYO company and agent: renewals that fall in the gap can't be issued, home closings in flood zones stall because the mandatory purchase requirement can't be met with an NFIP policy, and when authority returns the held transactions must be processed with the effective dates FEMA's guidance for that lapse allows. The policy system needs a program-status calendar that renewal and new business transactions check, and a queue for transactions held during a lapse.

## Private Flood

Private flood grew from a niche to a market: 643,467 policies as of May 2026 against the NFIP's 4.55 million. CRS lists what private flood can offer consumers: more flexible policies, higher coverage limits (above the NFIP's $250,000 residential building cap), coverage integrated with the homeowners policy, and lower-cost coverage for some buildings. The CRS notes the counterpart risk: private insurers will take the policies they consider adequately priced and leave the rest, so the NFIP could become the insurer of last resort for the highest-risk buildings, and private policies are not guaranteed to renew.

For the system, private flood is an ordinary admitted or surplus lines product (Excess & Surplus Lines) with two flood-specific duties: proving lender acceptability under 4012a(b)(7), and modeling flood risk at the building level, usually with the same vendor models the NFIP used (Catastrophe Models & Their Regulators).

## Reform Proposals

The FEMA Review Council, created by Executive Order 14180 in January 2025, issued its final report on May 7, 2026 with recommendations for the NFIP that CRS summarized on August 28, 2026:

- Continue Risk Rating 2.0 and work with Congress on affordability for selected homeowners.
- Reform the Community Rating System and revise WYO compensation through rulemaking, as Biggert-Waters directed.
- Address repetitive loss structures.
- Shift certain policies to the private market through a voluntary **take-out** program, and evaluate a centralized flood insurance **marketplace** offering NFIP and qualified private policies, under which a customer might be required to choose a private policy priced no more than 10% above the full risk-based rate.

The report acknowledged that legislation would be required; public comments closed June 8, 2026. As of November 2026 none of it has been enacted. CRS notes the open questions: how take-out policies would be priced, the adverse selection risk to the NFIP, and the loss of Federal Policy Fee revenue that funds mapping as policies leave.

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model): `policies` (with the NFIP as `insurer` and the WYO company recorded as servicer), `risks` (kind `dwelling` or `building`), `coverages`, `premium_entries` (kinds include `assessment` for the Reserve Fund and `surcharge` for HFIAA, plus the Federal Policy Fee), and `party_roles` (the mortgagee). This chapter adds `flood_determinations` (the zone and community facts for a building), `nfip_rating_records` (full-risk and capped premium per term) and `program_authorizations` (the NFIP's legal status by date).

```sql
CREATE TABLE flood_determinations (        -- the building's flood facts, as determined
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  risk_stable_key    UUID NOT NULL,
  community_number   TEXT NOT NULL,         -- NFIP community ID
  community_status   TEXT NOT NULL CHECK (community_status IN ('participating',
                       'probation', 'suspended', 'non_participating')),
  crs_class          INT CHECK (crs_class BETWEEN 1 AND 10),
  flood_zone         TEXT NOT NULL,         -- FIRM zone: 'AE', 'VE', 'X', ...
  in_sfha            BOOLEAN NOT NULL,      -- drives mandatory purchase
  firm_panel         TEXT,
  map_effective_on   DATE,
  determined_by      TEXT NOT NULL,         -- determination vendor or FEMA review
  determined_at      TIMESTAMPTZ NOT NULL,
  review_requested_at TIMESTAMPTZ           -- 4012a(e)(5): decided within 45 days
);

CREATE TABLE nfip_rating_records (         -- one per policy term
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_term_id     UUID NOT NULL REFERENCES policy_terms (id),
  rating_inputs      JSONB NOT NULL,        -- distance to water, elevation, FFH, ...
  full_risk_premium  BIGINT NOT NULL,
  prior_term_premium BIGINT,                -- the cap's base
  cap_pct_bp         INT NOT NULL,          -- 1800 primary residence, 2500 other
  premium_charged    BIGINT NOT NULL,       -- LEAST(full_risk, capped)
  icc_premium        BIGINT NOT NULL,
  reserve_fund       BIGINT NOT NULL,       -- 18%
  hfiaa_surcharge    BIGINT NOT NULL,       -- $25 or $250
  federal_policy_fee BIGINT NOT NULL,       -- $47 for most policies
  probation_fee      BIGINT NOT NULL DEFAULT 0,
  manual_edition     DATE NOT NULL,         -- Flood Insurance Manual effective date
  CHECK (premium_charged <= full_risk_premium)
);

CREATE TABLE program_authorizations (      -- may the NFIP issue policies on this date?
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  program            TEXT NOT NULL,         -- 'NFIP'
  authorized         DATERANGE NOT NULL,
  authority_ref      TEXT NOT NULL,         -- 'P.L. 119-103'
  recorded_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

A new business or renewal transaction checks that the transaction's effective date falls inside an authorization range; outside it, the transaction is held, not rejected, and released when an extension is recorded (with its retroactivity rule). Design choices that matter:

- **Full-risk and charged premium are both stored** every term, because the cap glides one toward the other and policyholders, FEMA and examiners ask for both.
- **Fees and assessments are separate premium entries** with their own kinds, since they're remitted and reported differently from premium.
- **The waiting period is computed and explained:** the effective date records the 30-day rule or the 4013(c)(2) exception that waived it.
- **Determinations are dated facts** that change with map revisions, and a building newly mapped into a special flood hazard area starts the mandatory purchase clock for its lender.

## Auditing

- **Every NFIP premium reproduces** from the manual edition, the rating inputs and the cap's base, with the Reserve Fund, HFIAA surcharge and Federal Policy Fee at the values in force.
- **No NFIP policy issued during a lapse;** every held transaction released with its effective date per the extension.
- **Waiting periods applied** or exceptions documented.
- **WYO remittances reconcile** to NFIP premium collected, and drawn funds to claims and expenses paid.
- **Private flood policies sold for mandatory purchase** carry the statutory compliance elements and the 45-day notice to the lender.

## What This Means for the System You Build

- **Treat the NFIP as the insurer and the WYO company as servicer,** with NFIP money kept apart from the company's own books.
- **Store full-risk premium, capped premium and each federal charge separately** every term.
- **Check program authorization by effective date** and hold transactions through a lapse.
- **Compute effective dates with the waiting period and its exceptions.**
- **Keep flood determinations as dated facts** that drive mandatory purchase, CRS discounts and mortgagee duties.
- **Build private flood to the 4012a(b)(7) definition** so lenders must accept it.

## References

**Law and regulation**

- [42 U.S.C. 4012a (Cornell LII)](https://www.law.cornell.edu/uscode/text/42/4012a), mandatory purchase amount, mandatory acceptance of private flood and its definition, escrow and exceptions, force placement at 45 days and refund within 30, zone determination review, and penalties
- [42 U.S.C. 4013 (Cornell LII)](https://www.law.cornell.edu/uscode/text/42/4013), the 30-day waiting period and its loan, map revision and post-wildfire exceptions
- [Federal Register: Write Your Own Financial Assistance/Subsidy Arrangement, FY 2027, May 5, 2026](https://www.govinfo.gov/content/pkg/FR-2026-05-05/html/2026-08728.htm), WYO companies as fiscal agents, the expense allowance and 15% commission, the growth bonus cap, LAE reimbursement, remittance and the arrangement period

**Regulators and guidance**

- [FEMA: Risk Rating 2.0](https://www.fema.gov/flood-insurance/risk-rating), implementation phases, rating variables, the 18% cap and CRS discounts
- [FEMA: NFIP Risk Rating 2.0 Methodology and Data Sources, January 18, 2022 (PDF)](https://www.fema.gov/sites/default/files/documents/FEMA_Risk-Rating-2.0_Methodology-and-Data-Appendix__01-22.pdf), target premiums from the AIR, CoreLogic and KatRisk models, territories, foundation and machinery factors, the maximum rate, the prior claims surcharge, factor capping and the order of the premium calculation
- [FEMA: Flood Insurance Manual, current editions](https://www.fema.gov/flood-insurance/work-with-nfip/manuals/current), the manual effective October 1, 2025
- [FEMA: NFIP reinsurance program](https://www.fema.gov/flood-insurance/work-with-nfip/reinsurance), 2024 traditional reinsurance and cat bond placements
- [Congressional Research Service: Introduction to the National Flood Insurance Program (R44593), updated October 5, 2026](https://www.everycrsreport.com/reports/R44593.html), the Federal Policy Fee, Reserve Fund assessment, HFIAA surcharge, probation fee, ICC, CRS discounts, caps, coverage limits, WYO share, debt and borrowing, the direct quoting tool and the private flood rules
- [Congressional Research Service: NFIP reauthorization (IN10835), September 11, 2026](https://www.everycrsreport.com/files/2026-09-11_IN10835_1177d2de1e2916fd50e80100ff618a10dbb6bb04.html), authorization to December 11, 2026 under P.L. 119-103, lapse effects and dates, borrowing authority and program size
- [Congressional Research Service: FEMA Review Council Recommendations for the NFIP (IF13302), August 28, 2026 (PDF)](https://www.everycrsreport.com/files/2026-08-28_IF13302_b2f3579eb2c23e7a75e70d72ad58521590065e67.pdf), coverage and revenue, the 4% take-up estimate, private policy counts, GAO's findings on Risk Rating 2.0, the Council's recommendations and their open questions

**Filings**

- [Neptune Insurance Holdings: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/2067129/000206712926000007/nyse-20251231.htm), the MGA model without balance sheet risk, premium in force, market share estimate, automated underwriting and capacity providers
