+++
title = "Illustrations"
description = "Life illustrations under Model #582, the illustration actuary, the AG 49 family for indexed UL, in-force illustrations, and annuity illustrations (#245)."
category = "Insurance Industry"
order = 2759
part = "Life and Annuities"
tags = ["insurance", "life-insurance", "illustrations", "model-582", "ag-49", "model-245"]
+++

An illustration is the insurer's projection of what a policy will do: a ledger, year by year, of premiums, account or cash values, surrender values and death benefits, on the guaranteed basis and on the insurer's current, non-guaranteed scale. For a permanent life policy or a deferred annuity it is the main sales document, the page the buyer and the producer sign, and the exhibit in most lawsuits about policies that didn't perform as shown. The 1980s and 1990s taught regulators why: universal life sold on illustrations at double-digit credited rates and "vanishing premiums" that never vanished. The NAIC's answer was the Life Insurance Illustrations Model Regulation (#582), which makes the illustration a regulated artifact: what may be projected, on what scale, certified by whom, signed by whom, delivered when, and kept how long. Indexed universal life later found room inside #582's rules, and the actuarial guidelines in the AG 49 family closed it, one gap at a time. Annuities have their own model, the Annuity Disclosure Model Regulation (#245), which makes illustrations optional but tightly constrains them.

For the system, an illustration is a computation that has to be reproducible years later: the product version, the scales, the inputs, the engine version and the output, frozen together and tied to the application and the issued policy. This chapter covers Model #582 and its tests, the illustration actuary, the three-basis numeric summary worked, the AG 49 family for indexed UL, in-force illustrations and annual reports, Model #245 for annuities with its index scenarios, and the regulators' 2026 work on both, with the `illustrations` table against the core model's `quotes` and `documents`. The values the illustration projects are [Life Products as Data](/books/insurance/life-products#universal-life) and [Annuities & Riders](/books/insurance/annuities#fixed-indexed-annuities).

## How the Platforms Do It

Illustration is usually its own software layer between the product and the sale. What vendors and standards publish, as of November 2026:

| Vendor or standard | What it does | What its public material shows |
| --- | --- | --- |
| **Hexure** (part of iCapital) | ForeSight Sales Illustrations; FireLight sales platform for life, annuities, LTC and disability; Carrier Forms Engine; Embedded API | ForeSight "generates multiple illustrations across products" so advisors can compare them; FireLight carries the illustration into the e-application |
| **iPipeline** | Quotes and illustrations, e-application, new business and underwriting (Resonant), e-delivery and e-signature | 100+ carrier customers, 2,500+ distribution partners, 500,000+ agents and advisors |
| **ACORD TXLife** | The life and annuity XML standard | `TXLifeRequest` carries an `IllustrationRequest` element alongside `OLifE` (the policy, party and relation data), so an illustration can be requested system to system (schema 2.20.01) |
| **Carriers' own engines** | Most carriers run the certified engine themselves and expose it to the vendor platforms | The illustration actuary certifies the scale the carrier's engine uses (Model #582 Section 11) |

The pattern: **the projection logic belongs to the insurer** (its actuary certifies the scale and its filed product defines the formulas), while **the sales platform owns the session**, the inputs, the comparison, the signatures and the handoff to the application. A platform that computes values itself has to match the carrier's engine to the cent, which is why most platforms call the carrier's engine or a carrier-certified copy.

## Model #582: What an Illustration Is

Model #582 (April 2001 edition) applies to group and individual life policies and certificates with a handful of exceptions, and its insurer designates each policy form as one that will or won't be marketed with illustrations (Section 5). Its definitions are the vocabulary of every life illustration system:

- **Guaranteed elements** are the premiums, benefits, values, credits or charges guaranteed and determined at issue; **non-guaranteed elements** are the ones that aren't (Section 4F).
- The **disciplined current scale** is a scale of non-guaranteed elements "constituting a limit on illustrations currently being used," reasonably based on actual recent experience and "certified annually by an illustration actuary designated by the insurer"; it may reflect only actions already taken or events already occurred, and no projected improvement in experience (4D).
- The **illustrated scale** is the scale an illustration uses, and it may not be more favorable than "the lesser of" the disciplined current scale and the currently payable scale (4G). An insurer can't illustrate a better scale than it pays, or a scale its experience doesn't support.
- A **basic illustration** is the ledger used in the sale; a **supplemental illustration** is an extra presentation that may show only what a basic illustration may; an **in force illustration** is one furnished after the policy has been in force a year or more (4H).

Section 6 prohibits the old practices outright: no representation of the policy as anything other than life insurance, no statement or implication that non-guaranteed elements are guaranteed, no depiction more favorable than the illustrated scale at any duration, no term "vanish" or "vanishing premium," no illustration that is lapse-supported (except for policies that can never develop nonforfeiture values) or not self-supporting, and no illustrated interest rate greater than the earned rate underlying the disciplined current scale (6B, 6C).

## The Self-Support and Lapse-Support Tests

Two tests decide whether a policy form may be illustrated at all:

- **Self-supporting.** Using the experience assumptions underlying the disciplined current scale, at every illustrated point "on or after the fifteenth policy anniversary or the twentieth policy anniversary for second-or-later-to-die policies (or upon policy expiration if sooner), the accumulated value of all policy cash flows equals or exceeds the total policy owner value available" (4O). In words: by year 15, the premiums and the insurer's experience must have paid for everything the illustration shows the owner could take out.
- **Lapse-supported.** An illustration fails if it isn't self-supporting under a modified persistency assumption, the disciplined current scale's lapse rates for the first five years "and 100 percent policy persistency thereafter" (4J). This catches products whose illustrated values are funded by the money forfeited by people who lapse early; if everyone kept the policy after year five, the illustrated values couldn't be paid.

These are actuarial tests run per policy form and scale, not per illustration, and the illustration actuary's annual certification is the record that they passed. The system's job is to stamp every illustration with the scale and certification it ran under, and to stop illustrating a form whose certification lapsed.

## The Illustration Actuary

The insurer's board appoints one or more illustration actuaries, members in good standing of the American Academy of Actuaries, who certify each year that the disciplined current scale conforms to the Actuarial Standard of Practice for #582 and that the illustrated scales in insurer-authorized illustrations meet the regulation (Section 11). The certification must also disclose whether, since the last one, a currently payable scale for business issued in the previous five years has been reduced for reasons other than experience, and whether the non-guaranteed elements illustrated for new and in-force policies are consistent with what is being paid. That second disclosure is the regulator's check on a company that illustrates new business generously while quietly cutting credits on old policies.

## The Basic Illustration and Its Three Bases

A basic illustration has a fixed anatomy (Section 7): a label as a life insurance illustration with the insurer, producer, insured's age, sex and rate class, product name and form number, initial death benefit and dividend option (6A); a narrative summary of the policy and its non-guaranteed elements; a **numeric summary**; signed statements; and a tabular ledger for at least each of years 1 to 10 and every fifth year after (Section 7E).

The numeric summary shows death benefits, values, premium outlay and contract premium at policy years 5, 10 and 20 and at age 70 (30 for multiple-life policies) on three bases (7C):

- **(a) policy guarantees**;
- **(b) the insurer's illustrated scale**;
- **(c) the illustrated scale with non-guaranteed elements reduced**: dividends at 50% of the illustrated scale's, non-guaranteed credited interest at the average of the guaranteed rate and the illustrated rate, and non-guaranteed charges (COI, M&E and others) at the average of the guaranteed and illustrated rates. This is the "midpoint" column.

If coverage would cease before maturity or age 100 on any basis, the year it ceases must be shown for each.

**Worked numbers: a numeric summary.** Mine, on a deliberately simple annual model, not any product: a 45-year-old, a $500,000 level death benefit universal life policy, a $6,000 annual premium with a 6% load and a $120 annual fee, current COI starting at $1.20 per $1,000 of net amount at risk and rising 8% a year, guaranteed maximum COI at twice current, a 2% guaranteed credited rate and a 6% illustrated rate (the corridor is ignored).

| Basis | Credited rate | COI | Year 5 | Year 10 | Year 20 | Age 70 (year 25) | Coverage ceases |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| (a) Guaranteed | 2.00% | 2.0 × current | $22,073 | $43,531 | $78,954 | $87,934 | Policy year 40 (age 84) |
| (b) Illustrated | 6.00% | current | $28,955 | $66,207 | $176,404 | $257,915 | Not before age 100 |
| (c) Midpoint | 4.00% | 1.5 × current | $25,370 | $54,013 | $120,816 | $158,344 | Not before age 100 |

The values are account values at the end of each year. The midpoint column is computed, not chosen: its rate and charges are exactly halfway between columns (a) and (b), which is why regulators put it there. On the guaranteed basis the same premium that looks like a $258,000 account at 70 runs out in year 40. That spread is the whole disclosure, and an illustration engine has to produce all three columns from one set of inputs and one engine version.

The applicant signs a statement that they have received the illustration and understand that non-guaranteed elements are subject to change and could be higher or lower, and the producer certifies that the illustration was presented and that no statements inconsistent with it were made (7D). If the policy is applied for as illustrated, a signed copy goes to the insurer with the application; if it is issued other than as applied for, a "Revised Illustration" conforming to the policy as issued goes with the policy, signed no later than delivery; if no illustration was used, the producer certifies that on an insurer form and the applicant acknowledges that an illustration conforming to the issued policy will come at delivery (Section 9). The insurer keeps the basic illustration, any revised one and any certification "until three (3) years after the policy is no longer in force."

## AG 49 and Indexed UL

Model #582 limits the illustrated scale to the disciplined current scale, but an indexed product's "current scale" is a cap and a participation rate, and the illustrated credited rate is a projection from index history. Indexed UL illustrations through the early 2010s showed long-run rates computed from favorable historical periods, plus multipliers, bonuses and loan arbitrage (illustrating a credited rate on borrowed values above the loan charge). The NAIC's Life Actuarial Task Force responded with actuarial guidelines that interpret #582 for IUL, which states apply through their adoption of the model:

- **AG 49-A** (approved in 2020, as InsuranceNewsNet's November 2025 report describes it) limits the maximum illustrated rate used in policy projections and restricts the benefit illustrations may show from indexed loans.
- **AG 49-B**, effective May 1, 2023, amended AG 49-A: index accounts may not be illustrated above the **benchmark index account**, and the maximum illustrated rate must include bonuses; it targeted uncapped volatility-controlled indexes with a fixed bonus, which had been used to illustrate higher rates than plain index accounts. The same report describes illustrated rates as limited to "a maximum of 145% of whatever an IUL portfolio is earning," the hedge budget cap. It called AG 49-B "a patch until the NAIC reopens illustration regulation."
- **The 10-year history amendment.** In November 2025, LATF unanimously adopted an AG 49-A change requiring 10 years of historical data to illustrate index components that lack 25 years of history (the industry had asked for five), aimed at side-by-side historical averages above the maximum illustrated rate and at backcasted performance of the more than 160 proprietary indices. The Life Insurance and Annuities (A) Committee adopted it on November 21, 2025 and the Executive (EX) Committee and Plenary unanimously on December 11, 2025. As adopted, for policies sold on or after April 1, 2026 (optionally from January 1, 2026), the historical table covers only the most recent 25 years, is limited to the index's history when that is at least 10 but under 25 years, is omitted when it is under 10, and the illustration may not show other historical returns or compare them side by side with the maximum illustrated rate ([NAIC: Executive (EX) Committee and Plenary minutes, December 11, 2025, Attachment Four (PDF)](https://content.naic.org/sites/default/files/national_meeting/01_Minutes-EXPlenary_3.pdf)).

AG 49-A's full title applies it to policies "With Index-Based Interest Sold on or After December 14, 2020," but the full text of the guideline, with its effective dates for in-force illustrations and its numeric limit on illustrated loan leverage, wasn't reachable from an NAIC page in this review, so the chapter states the guideline's purpose without the specific limits. <!-- source-gap: ag49a-text | missing | AG 49-A in-force effective dates and the illustrated loan leverage limit | closes with: the adopted AG 49-A text (NAIC AP&P Manual Appendix C or an NAIC posting) | checked: 2026-11-10 --> For the engine, the guidelines mean the IUL illustration has more inputs than the product: the benchmark index account's parameters, the computed maximum illustrated rate as of the illustration date, the hedge budget limit, and the loan leverage rule, each versioned, because an illustration from before May 1, 2023 and one from after it follow different rules for the same product.

## In-Force Illustrations and Annual Reports

After issue, the illustration obligation shifts to the in-force book. An **in force illustration** projects an existing policy from its current values on the current scale; the owner can request one, and Model #613 requires the existing insurer in a replacement to send in-force illustrations or a policy summary within five business days of a request ([Replacements under Model 613](/books/insurance/annuity-best-interest#replacements-under-model-613)). For policies marketed with illustrations, #582 Section 10 requires an **annual report**: for universal life, the period's beginning and end dates, policy value at the start and end, every amount credited or debited by type (interest, mortality, expense, riders), the current death benefit, net cash surrender value and outstanding loans, and, if on guaranteed assumptions the policy would not stay in force to the end of the next period, a notice saying so. For other policies, the death benefit, annual contract premium, cash surrender value, dividend and its application, and loan.

The annual report's UL section is the [Life Products as Data](/books/insurance/life-products#how-to-build-it) `policy_values` history summed by charge type, so the report and the values engine must share the same records. The lapse warning is a projection on guaranteed assumptions, which is the illustration engine running on an in-force policy, so the two engines should be one.

## Annuity Illustrations under Model 245

Model #245 (Summer 2021 edition) requires a disclosure document and the NAIC's Annuity Buyer's Guide at or before application, and a free look of no less than 15 days when they come later ([Annuities & Riders](/books/insurance/annuities#free-look)). Illustrations are optional, but an insurer that uses one for an annuity must follow Section 6: non-guaranteed elements based on current elements with no assumed improvement and reflecting planned changes after guarantee or bonus periods, and for a **fixed indexed annuity**, three scenarios (6(9)):

- the index's actual performance over **the most recent ten calendar years**;
- the continuous ten-year period out of **the last twenty calendar years with the least index value growth** (the low scenario);
- the continuous ten-year period out of the last twenty with **the most** growth (the high scenario).

The rules around them are precise. The ten and twenty years end on the prior December 31, except that illustrations in the first three months of a year may end on the December 31 before the last full calendar year (a). An index that hasn't existed for at least ten calendar years may not be illustrated, and a strategy allocated to one is assumed to hold zero (b); one that has existed ten to twenty years picks its low and high windows from the years it has existed (c). Caps, spreads and participation rates may be no more favorable than current (d). The allocation is the same across scenarios, with windows chosen independently per indexed account (e). The **geometric mean** annual rate of account value growth over the ten-year period is shown for each scenario (f), and beyond the first ten years, the most recent ten-year history repeats (g).

**Worked numbers: the geometric mean.** Mine, with invented credits, not real index history: ten annual credits on a capped strategy of 8.00%, 0%, 6.50%, 8.00%, 0%, 3.00%, 8.00%, 8.00%, 0% and 5.20% compound to a growth factor of 1.08 × 1.00 × 1.065 × ... × 1.052 = 1.56999, a geometric mean of 1.56999^(1/10) − 1 = 4.61% a year. The arithmetic average of the same credits is 4.67%; the difference grows with dispersion, which is why #245 asks for the geometric figure.

Two things make this a data problem. The engine needs the index's published annual history, from a defined source, back at least twenty calendar years, with the date the index launched (backcasted values before launch don't count as existence, and the NAIC's 2026 exposure would bar illustrating them outright). And the windows must be recomputed every January (or April), so an illustration dated February 2027 may legitimately use a different window than one dated May 2027. Selecting the windows is a small function:

```go tab="Go"
// Windows returns the start index of the ten-year windows with the least and
// most growth among the last twenty annual credits (oldest first). credits are
// growth factors scaled by 1e6 (8.00% = 1_080_000). The index must have at least
// ten years; with fewer than twenty, the windows come from the years it exists.
func Windows(credits []int64) (low, high int, ok bool) {
	if len(credits) < 10 {
		return 0, 0, false // not illustratable under Model 245 6(9)(b)
	}
	if len(credits) > 20 {
		credits = credits[len(credits)-20:]
	}
	growth := func(s []int64) float64 { // product of factors
		g := 1.0
		for _, c := range s {
			g *= float64(c) / 1e6
		}
		return g
	}
	lowG, highG := 0.0, 0.0
	for i := 0; i+10 <= len(credits); i++ {
		g := growth(credits[i : i+10])
		if i == 0 || g < lowG {
			low, lowG = i, g
		}
		if i == 0 || g > highG {
			high, highG = i, g
		}
	}
	return low, high, true
}
```

```rust tab="Rust"
/// Start indices of the least- and most-growth ten-year windows among the last
/// twenty annual growth factors (scaled by 1e6, oldest first). None if fewer than ten.
pub fn windows(credits: &[i64]) -> Option<(usize, usize)> {
    if credits.len() < 10 {
        return None; // not illustratable under Model 245 6(9)(b)
    }
    let c = &credits[credits.len().saturating_sub(20)..];
    let growth = |s: &[i64]| s.iter().map(|&x| x as f64 / 1e6).product::<f64>();
    let (mut low, mut high) = ((0, growth(&c[0..10])), (0, growth(&c[0..10])));
    for i in 1..=c.len() - 10 {
        let g = growth(&c[i..i + 10]);
        if g < low.1 { low = (i, g); }
        if g > high.1 { high = (i, g); }
    }
    Some((low.0, high.0))
}
```

The credits fed in are what the strategy would have credited each year at current caps and participation, not raw index returns, because rule (d) applies the current parameters to the history. Floating point is acceptable here because the result picks a window; the illustrated values themselves are computed in minor units by the values engine.

Model #245 also requires an annual report to contract owners (Section 7), and compliance with SEC and FINRA disclosure rules satisfies it for registered products, though certain sales still require the Buyer's Guide.

## The 2026 Rework

Both models are being reopened. The NAIC's Life Insurance and Annuities Illustrations (A) Working Group, organized in February 2026 with a charge to "evaluate concepts for improving life insurance and annuity illustrations and disclosures," discussed in March regulators' observations of indexed annuity disclosures suggesting annual returns of 10% to 25%. It debated whether a short-term fix should start from Model #245, AG 49-A or a blank page, and asked in July whether an actuarial guideline could serve as a stopgap until states adopt an updated model. Its September 15, 2026 exposure asks for Model #245 proposals by November 10, 2026 built on preliminary conceptual decisions:

1. Shorter, standardized illustrations: fewer ledger pages, combined tables, fewer redundant sections.
2. A signed attestation by a company officer for compliance with Model #245.
3. No hypothetical returns for years before an index existed, "even if any input components to the index existed during those years."
4. Preferably no illustration of non-guaranteed elements or historical index data at all; if history is used, adjustments or haircuts to current non-guaranteed elements.
5. Supplemental information as a one-period calculation of the credit if the index rises or falls by a stated percentage (for example ±20%), tables or visuals of alternate scenarios, or, if up and down scenarios stay in the ledger, the guaranteed scale as the down scenario.

As of November 10, 2026, these are working group decisions on an exposure, not an adopted model or guideline. For a system, they point one way: illustration rules will keep changing faster than products, so the rule set (scenario definitions, permitted indexes, haircuts, required supplements and attestations) should be versioned data the engine reads by illustration date ([Rules as Data](/docs/building-blocks/rules-as-data#effective-dates-and-versions)), not logic in a release.

## How to Build It

An illustration is a priced projection attached to a quote, and the core model already has `quotes` (with the rating worksheet) and `documents` (the rendered, delivered artifact, defined in [Quote, Bind & Issue](/books/insurance/quote-bind-and-issue#how-to-build-it)). This chapter adds `illustrations`, the frozen computation, and its ledger rows:

```sql
CREATE TABLE illustrations (               -- one projection, reproducible forever
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  quote_id           UUID REFERENCES quotes (id),       -- new business
  policy_id          UUID REFERENCES policies (id),     -- in-force illustrations
  kind               TEXT NOT NULL CHECK (kind IN ('basic', 'revised', 'supplemental',
                       'in_force', 'annuity', 'annual_report_projection')),
  rule_set           TEXT NOT NULL,         -- 'NAIC582-2001+AG49A+AG49B', 'NAIC245-2021'
  product_id         UUID NOT NULL REFERENCES products (id),
  scale_refs         JSONB NOT NULL,        -- disciplined current scale, illustrated scale,
                                            -- guaranteed tables, with versions
  certification_ref  TEXT,                  -- illustration actuary certification in force
  inputs             JSONB NOT NULL,        -- insured, class, face, option, premiums,
                                            -- loans, withdrawals, allocations
  index_history_ref  TEXT,                  -- dataset and as-of for #245 or AG 49 inputs
  max_illustrated_rate_bp INT,              -- computed, for indexed products
  engine_version     TEXT NOT NULL,
  prepared_at        TIMESTAMPTZ NOT NULL,
  document_id        UUID,                  -- rendered PDF in documents
  signed_by_applicant_at TIMESTAMPTZ,
  signed_by_producer_at  TIMESTAMPTZ,
  no_illustration_certification BOOLEAN NOT NULL DEFAULT FALSE,
  retain_until       DATE                   -- set to 3 years after the policy ends
);

CREATE TABLE illustration_rows (           -- the ledger, per basis and year
  illustration_id    UUID NOT NULL REFERENCES illustrations (id),
  basis              TEXT NOT NULL CHECK (basis IN ('guaranteed', 'illustrated',
                       'midpoint', 'scenario_recent', 'scenario_low', 'scenario_high')),
  policy_year        INT NOT NULL,
  attained_age       INT NOT NULL,
  premium_outlay     BIGINT NOT NULL,
  account_value      BIGINT,
  cash_surrender_value BIGINT NOT NULL,
  death_benefit      BIGINT NOT NULL,
  credited_rate_bp   INT,
  ceased             BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (illustration_id, basis, policy_year)
);
```

Four rules make it work. **Freeze the inputs and versions,** and never re-run an old illustration with today's engine to "show" what was presented; store the rows. **Tie the illustration to the application and the policy** (`quote_id`, then the policy issued from it), so the Section 9 logic can tell whether the policy was issued as illustrated and trigger a revised illustration and its signature task when it wasn't. **Gate illustration by certification:** a product form whose scale isn't covered by a current certification, or whose index lacks the history a rule requires, can't produce an illustration. **Compute retention from policy status:** `retain_until` is set when the policy ends, three years out, and the [retention schedule](/docs/building-blocks/data-retention#retention-schedules-by-record-type) honors it.

The rendered document follows [Generated Documents](/docs/building-blocks/generated-documents#what-was-sent-is-what-you-keep): what the applicant signed is the file kept, with its hash, not a regenerated copy.

## Auditing

- **Every illustration reproducible.** For any signed illustration, the rule set, scales, certification, inputs, engine version and rows, so a regulator or a court sees exactly what the applicant saw.
- **Signatures and delivery.** Applicant and producer signatures with dates, the revised illustration for policies issued other than as applied for, signed no later than delivery, and the no-illustration certification where none was used.
- **Scale discipline.** The illustrated scale never more favorable than the lesser of the disciplined current scale and the currently payable scale; the annual certification and its disclosures on file for every year.
- **New versus in-force consistency.** Evidence for the actuary's certification that new and in-force illustrations use consistent non-guaranteed elements, and that both match what is paid.
- **Index inputs.** For indexed products, the index history dataset and the computed windows or maximum illustrated rate as of the illustration date.
- **Annual reports.** One per policy per year for illustrated forms, built from the same value rows, with the lapse warning when the guaranteed projection fails.

## What This Means for the System You Build

- **Treat the illustration as a frozen computation:** rule set, scales, certification, inputs, engine version and rows, stored together and tied to the quote and the policy.
- **Produce every basis from one engine run:** guaranteed, illustrated and midpoint for life; recent, low and high for indexed annuities.
- **Gate by certification and data:** no certified scale, no illustration; an index without ten calendar years of real history, no indexed illustration.
- **Version the rules by illustration date,** because AG 49-B, the 10-year history amendment and the 2026 #245 rework change outputs for the same product.
- **Share the engine between sales illustrations, in-force illustrations and annual reports,** so the warning in an annual report and the projection in an in-force illustration agree.
- **Drive signatures, revised illustrations and retention from status,** as tasks with deadlines, not as reminders.

## References

**NAIC**

- [NAIC: Life Insurance Illustrations Model Regulation (#582), April 2001 (PDF)](https://content.naic.org/sites/default/files/model-law-582.pdf), definitions of guaranteed and non-guaranteed elements, disciplined current and illustrated scales, the self-supporting and lapse-supported tests, Section 6 prohibitions, the numeric summary on three bases, signatures, delivery, three-year retention, annual reports and the illustration actuary's certification
- [NAIC: Annuity Disclosure Model Regulation (#245), Summer 2021 (PDF)](https://content.naic.org/sites/default/files/model-law-245.pdf), the disclosure document and Buyer's Guide, the 15-day free look, and the fixed indexed annuity illustration scenarios and their rules
- [NAIC: Life Insurance Disclosure Model Regulation (#580), 3rd Quarter 2018 (PDF)](https://content.naic.org/sites/default/files/model-law-580.pdf), the Buyer's Guide and policy summary delivery rules for life insurance
- [NAIC: Life Insurance and Annuities Replacement Model Regulation (#613), 2nd Quarter 2015 (PDF)](https://content.naic.org/sites/default/files/model-law-613.pdf), the existing insurer's in force illustration within five business days
- [NAIC: Life Insurance and Annuities Illustrations (A) Working Group](https://content.naic.org/committees/a/life-annuity-illustrations-wg), the 2026 charge, meetings, exposures and comment letters
- [NAIC: Illustration Working Group exposure, September 15, 2026 (PDF)](https://content.naic.org/sites/default/files/inline-files/naic-illustration-working-group-exposure-09-15-2026.pdf), the request for Model #245 proposals by November 10, 2026 and the preliminary conceptual decisions

**Standards**

- [ACORD TXLife 2.20.01: TXLife_Type (Liquid Technologies schema mirror)](https://schemas.liquid-technologies.com/Accord/Life%20Standards/2.20.01/txlife_type.html), the request and response structure of the life and annuity XML message
- [ACORD TXLife 2.20.01: TXLifeRequest_Type (Liquid Technologies schema mirror)](https://schemas.liquid-technologies.com/Accord/Life%20Standards/2.20.01/txliferequest_type.html), the request elements including TransType, IllustrationRequest and OLifE

**Vendor documentation**

- [Hexure](https://www.hexure.com/), ForeSight Sales Illustrations, FireLight and its ownership by iCapital
- [iPipeline](https://www.ipipeline.com/), quotes and illustrations among its solution categories and its customer counts

**In practice**

- [InsuranceNewsNet: NAIC task force recommends 10-year data history for index illustrations, November 17, 2025](https://insurancenewsnet.com/innarticle/naic-task-force-recommends-10-year-data-history-for-index-illustrations), LATF's unanimous adoption of the 10-year minimum, the industry's five-year request and the remaining committee votes
- [InsuranceNewsNet: Will AG 49-B be a May Day or meh day for IUL illustrations?, May 1, 2023](https://insurancenewsnet.com/innarticle/will-ag-49-b-be-may-day-or-meh-day-for-iul-illustrations), AG 49-B's effective date, the benchmark index account and bonus rules, the 145% limit and its target
