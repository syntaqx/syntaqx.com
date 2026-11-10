+++
title = "Life Insurance & the Tax Code"
nav_title = "Life Insurance & Tax"
description = "The 7702 tests and corridor, 7702A MECs and the 7-pay test, loans and withdrawals, death benefits, 1035 basis, 1099-R and 1099-INT, and the testing engine."
category = "Insurance Industry"
order = 2763
part = "Life and Annuities"
tags = ["insurance", "life-insurance", "tax", "section-7702", "mec", "1099-r"]
+++

Permanent life insurance is the most tax-favored savings vehicle most people can buy. Cash value grows without current tax; the owner can take money out basis first, or borrow it without tax at all; and the death benefit is generally free of income tax. Congress has spent forty years drawing lines around those advantages, and the lines are in two sections of the Internal Revenue Code. Section 7702 decides whether a contract is life insurance at all, by limiting how much cash value it may carry for its death benefit. Section 7702A decides whether a life insurance contract is a **modified endowment contract** (MEC), funded so quickly that its lifetime withdrawals and loans lose their favored treatment. Every universal life and whole life product is designed around both, and every premium, withdrawal, face change and rider change has to be tested against them before it posts.

That makes tax compliance a feature of the administration system, not of the tax department. The insurer computes the limits at issue, recomputes them on every material change, refunds excess premium within the statutory window, flags MECs, tracks the owner's investment in the contract, and reports distributions, exchanges and interest on Forms 1099-R and 1099-INT. This chapter covers the definition of life insurance and its two tests, the cash value corridor worked, what happens when a contract fails, the 7-pay test and MECs with worked numbers, loans, withdrawals and surrenders, death benefits and transfers for value, 1035 exchanges and basis carryover worked, the forms, and the testing engine, with the `tax_tests` and `tax_documents` tables on top of [Life Products as Data](/books/insurance/life-products#how-to-build-it)'s `policy_values`.

## How the Platforms Do It

The tax rules are federal and uniform, so what varies is how products and carriers expose them. What public documents show, as of November 2026:

| Source | What it shows |
| --- | --- |
| **Lincoln Benefit Life VUL prospectus** (May 1, 2026) | The policy is "structured to meet the definition of a life insurance contract under the Tax Code"; death benefit Options 1 and 2 are each the greater of a face-based amount and the policy value times "a specified percentage," the corridor; the prospectus doesn't name which 7702 test the policy uses |
| **IRS Form 1099-R instructions** (2026) | Code 7 for distributions "from a life insurance, annuity, or endowment contract"; code 6 for section 1035 exchanges with total value in box 1, zero in box 2a and total premiums in box 5; code 4 for death benefits to a survivor; code D for "annuity payments from nonqualified annuities and distributions from life insurance contracts"; no 1099-R is needed for a life insurance surrender when none of the payment is reasonably includible in income; reportable death benefits after a reportable policy sale |
| **IRS Form 1099-INT instructions** | Box 1 includes "interest on delayed death benefits paid by a life insurance company" of $600 or more |
| **IRS Rev. Proc. 2011-38** | Partial annuity exchanges are tax-free if nothing is received from either contract within 180 days, for transfers completed on or after October 24, 2011 |

The pattern is that **the insurer is the tax calculator of record**: it decides which test a product uses at filing, computes the limits per policy, and reports what it paid with the basis it tracked. An owner's tax return is built from the insurer's numbers.

## The Definition of Life Insurance

A contract is a life insurance contract for federal tax purposes only if it is life insurance under applicable law and meets either the **cash value accumulation test** (CVAT) or both the **guideline premium requirements** and the **cash value corridor** (26 USC 7702(a)).

- **CVAT** (7702(b)). The cash surrender value may never exceed the "net single premium which would have to be paid at such time to fund future benefits," computed at the greater of the applicable accumulation test minimum rate and the rate guaranteed in the contract. CVAT fits traditional whole life, whose guaranteed cash values are built on a net single premium basis already, and it puts no limit on premium as such: the constraint is the ratio of cash value to the net single premium for the benefits.
- **Guideline premium test** (7702(c)). Total premiums paid may not exceed, at any time, the greater of the **guideline single premium** (the single premium to fund future benefits, on reasonable mortality and expense charges and interest at the greater of the guideline premium minimum rate and the guaranteed rate) and the sum to date of **guideline level premiums** (the level annual premium payable to at least age 95, computed at the accumulation test minimum rate). The guideline premium test limits premium directly and is always paired with the corridor; flexible premium universal life is the natural fit, though either test can be elected for a product.
- **Interest rates.** For contracts issued after December 31, 2020, the applicable accumulation test minimum rate is the lesser of 4% and the **insurance interest rate** at issue, and the guideline premium minimum rate is that rate plus two percentage points; before 2021 the statute fixed them at 4% and 6% (Pub. L. 116-260). The insurance interest rate is the lesser of the section 7702 valuation interest rate (the NAIC Standard Valuation Law's prescribed rate for guarantees over 20 years) and the section 7702 applicable federal interest rate, the average of the applicable federal mid-term rates over the 60 months ending before the second calendar year before the adjustment year, rounded to the nearest whole percentage point. Contracts issued from January 1, 2021 until the first adjustment year after 2021 used 2%.
- **Computational rules** (7702(e)). For everything but the corridor, the death benefit is deemed not to increase, the maturity date is deemed no earlier than age 95 and no later than 100, and any endowment benefit is deemed not to exceed the least death benefit.

The rates are inputs that change by issue year, so the testing engine stores them in a table keyed by the period they apply to, and every policy carries the rates it was tested at issue under.

## The Cash Value Corridor

A guideline premium contract also needs a death benefit at least equal to an **applicable percentage** of the cash surrender value at all times (7702(d)). The percentage, by attained age at the start of the contract year, falls ratably within each band:

| Attained age | Applicable percentage |
| --- | --- |
| 40 or less | 250% |
| 40 to 45 | 250% to 215% |
| 45 to 50 | 215% to 185% |
| 50 to 55 | 185% to 150% |
| 55 to 60 | 150% to 130% |
| 60 to 65 | 130% to 120% |
| 65 to 70 | 120% to 115% |
| 70 to 75 | 115% to 105% |
| 75 to 90 | 105% |
| 90 to 95 | 105% to 100% |

"Ratably" means the percentage falls in equal steps for each year within the band. At 62, two years into the 60 to 65 band, it is 130 − (2/5 × 10) = 126%; at 72, 115 − (2/5 × 10) = 111%; at 92, 105 − (2/5 × 5) = 103%.

**Worked numbers: the corridor taking over.** Mine: a guideline premium UL policy with a $350,000 Option A face on an insured attained age 62, with a cash surrender value of $300,000. The corridor requires a death benefit of at least 300,000 × 1.26 = $378,000, which is more than the face, so the death benefit is $378,000 and the net amount at risk (and the COI charge) is computed on it. Ten years later, at 72, with a cash value of $400,000, the corridor death benefit is 400,000 × 1.11 = $444,000. The contract's own "specified percentage" table in the prospectus is this table, and the values engine applies it in every monthly cycle ([Universal Life](/books/insurance/life-products#universal-life)).

## When a Contract Fails

If a contract fails 7702, the owner includes the **income on the contract** in ordinary income every year: the increase in net surrender value plus the cost of life insurance protection, less premiums paid that year, and in the year it first fails, the income for all prior years too (7702(g)). The contract stays insurance under the Code, and the death benefit in excess of the net surrender value is still excluded under section 101. Two provisions keep failures rare:

- **Correction of errors** (7702(f)(8)). If a failure came from reasonable error and reasonable steps are being taken to fix it, the IRS may waive it. A waiver request has to show what the insurer computed and when, which is why the testing engine's history matters.
- **Adjustments and recapture** (7702(f)(7)). When benefits change, the limits are adjusted. A reduction in benefits in the first 15 contract years that produces a cash distribution (often a forced distribution to keep the contract within the limits) is taxed under section 72 up to a **recapture ceiling**: in years 1 to 5, for CVAT contracts the excess of cash surrender value over the net single premium after the reduction, and for guideline contracts the greater of excess premiums over the guideline limit and cash value over the corridor; in years 6 to 15, the excess of cash value over the corridor. Distributions within two years before a reduction are treated as made in anticipation of it.

## The 7-Pay Test and Modified Endowment Contracts

A contract entered into on or after June 21, 1988 that meets 7702 but **fails the 7-pay test** is a modified endowment contract, and so is a contract received in exchange for one (7702A(a)). It fails if the accumulated amount paid at any time during the first seven contract years exceeds the sum of the **net level premiums** that would have been paid by then if the contract provided paid-up future benefits after seven level annual premiums (7702A(b)). The seven level premiums are determined at issue, with the first year's death benefit deemed provided to maturity and scheduled reductions after year seven ignored (7702A(c)(1)).

**Worked numbers: a 7-pay schedule.** Mine: a UL policy whose 7-pay premium, computed by the testing engine at issue for a $500,000 face, is $12,000. The limit at the end of year n is 12,000 × n.

| Contract year | Premium paid | Cumulative paid | 7-pay limit | Result |
| ---: | ---: | ---: | ---: | --- |
| 1 | $12,000 | $12,000 | $12,000 | Passes |
| 2 | $18,000 | $30,000 | $24,000 | Fails by $6,000 |

If the insurer returns the $6,000 excess (with interest) within 60 days after the end of contract year 2, the returned amount reduces premiums paid for the year and the contract stays a non-MEC; the interest returned is taxable to the owner (7702A(e)(1)(B), (C)). If it doesn't, the contract is a MEC permanently.

**Worked numbers: a reduction in benefits.** Same policy, paid exactly $12,000 a year for four years ($48,000 cumulative, never over the limit). In year 4 the owner reduces the face to $300,000. A reduction within the first seven years means the test is applied as if the contract had been issued at the reduced level (7702A(c)(2)(A)): the 7-pay premium for $300,000, say $7,200, gives a year-4 limit of 7,200 × 4 = $28,800, and $48,000 paid exceeds it. The contract becomes a MEC, effective for distributions in the contract year of the failure and later, and for any distribution made within two years before the failure, which is treated as made in anticipation of it (7702A(d)). A face reduction is a tax event, which is why [In-Force Administration](/books/insurance/in-force-administration#withdrawals-and-partial-surrenders) quotes it before executing it.

Other rules the engine encodes:

- **Nonpayment reductions.** A reduction from nonpayment of premiums is disregarded if benefits are reinstated within 90 days (7702A(c)(2)(B)).
- **Material changes.** A material change in benefits or terms, including any increase in the death benefit (other than increases funded within the lowest benefit level of the first seven years and certain cost-of-living increases), is treated as a new contract entered into on the day it takes effect, with a new seven-year test that credits the existing cash value (7702A(c)(3)).
- **Second-to-die contracts.** For a death benefit payable only on the second death, a reduction below the lowest level in the first seven years applies the test as if issued at the reduced level (7702A(c)(6)).
- **Amount paid** means premiums less amounts received that aren't includible in income (7702A(e)(1)(A)).

## Loans, Withdrawals and Surrenders

How money coming out of a contract is taxed depends on whether it's a MEC:

- **Non-MEC life insurance: basis first.** Amounts received before the annuity starting date are taxed only to the extent they exceed the **investment in the contract** (premiums paid less amounts previously received tax-free) (72(e)(5)). A policy loan isn't a distribution at all while the policy is in force.
- **MECs and annuities: income first.** Amounts received are taxed as income to the extent of the **income on the contract** (cash value over investment), and for MECs, loans and assignments or pledges are treated as distributions (72(e)(10)). MECs issued by the same company to the same owner in the same calendar year are aggregated as one (72(e)(12)).
- **10% additional tax.** A taxable distribution from a MEC adds 10% of the taxable amount unless made on or after age 59½, attributable to disability, or part of substantially equal periodic payments (72(v)); annuities have the parallel 72(q) with more exceptions (death, immediate annuities and others).

**Worked numbers: the same withdrawal, MEC and not.** Mine: a contract with $60,000 of cash value and $48,000 of investment in the contract; the 52-year-old owner withdraws $15,000.

| | Non-MEC | MEC |
| --- | ---: | ---: |
| Taxable | $0 (basis first: 15,000 ≤ 48,000) | $12,000 (income first, up to 60,000 − 48,000) |
| Return of basis | $15,000 | $3,000 |
| 10% additional tax | none | $1,200 |
| Remaining investment in the contract | $33,000 | $45,000 |

A full **surrender** is taxable to the extent the amount received (including any loan extinguished) exceeds the investment in the contract, and is reported on Form 1099-R with code 7 for a life insurance contract; the instructions don't require a 1099-R for a surrender when it is reasonable to believe none of the payment is includible in income. A policy that **lapses with a loan** is the painful version: the loan discharged by the lapse counts as an amount received, so an owner with no cash in hand can have taxable income equal to the loan over basis. The values engine knows this before it happens, and the lapse notice is the place to say so.

## Death Benefits and Transfers for Value

Amounts received under a life insurance contract "by reason of the death of the insured" are excluded from gross income (101(a)(1)), with exceptions the claim and administration systems must recognize:

- **Transfer for value** (101(a)(2)). If the policy was transferred for valuable consideration, the exclusion is limited to the consideration paid plus later premiums and certain interest, unless the transfer was to the insured, a partner of the insured, a partnership in which the insured is a partner, or a corporation in which the insured is a shareholder or officer. Those exceptions don't apply to a **reportable policy sale**, an acquisition by someone with no substantial family, business or financial relationship with the insured apart from the policy (101(a)(3)); insurers paying death benefits on such policies report them on Form 1099-R as reportable death benefits, with an estimate of the buyer's investment in box 5.
- **Interest** (101(c)). Interest on proceeds held by the insurer is taxable, including statutory interest on delayed death claims, which goes in box 1 of Form 1099-INT when it is $600 or more ([Interest on Proceeds](/books/insurance/death-claims-and-unclaimed-benefits#interest-on-proceeds)).
- **Installments** (101(d)). When proceeds are paid in installments under a settlement option, the excluded amount is prorated over the payments and the rest is income.
- **Accelerated death benefits** (101(g)). Amounts paid to a terminally ill insured, certified as reasonably expected to die within 24 months, are treated as paid by reason of death; chronically ill insureds are covered subject to long-term care rules.
- **Employer-owned life insurance** (101(j)). The exclusion is limited to premiums paid unless notice and consent requirements were met before issue and the insured was a recent employee, a director or highly compensated, or the proceeds go to the insured's family, beneficiary, trust or estate. The notice and consent are documents the issue process must collect and keep.

## 1035 Exchanges and Basis

Section 1035(a) makes certain exchanges tax-free: a life policy for another life policy, an endowment or annuity contract, or a qualified long-term care contract; an endowment for an endowment (starting payments no later), an annuity or qualified LTC; an annuity for an annuity or qualified LTC; and qualified LTC for qualified LTC. The new contract's basis is the old one's, decreased by money received and increased by gain recognized (1031(d), through 1035(d)). An exchange in which the owner receives something besides the new contract recognizes gain up to the value of that "boot" (1031(b), through 1035(d)(1)).

**Worked numbers: basis through an exchange.** Mine: a life policy with $120,000 of cash value, a $10,000 policy loan and $80,000 of investment in the contract is exchanged for a new policy, and the old insurer applies $110,000 net to the new policy while the loan is extinguished. The extinguished loan is boot: the owner is relieved of $10,000 of debt. The gain in the old contract is 120,000 − 80,000 = $40,000; gain recognized is the lesser of the boot and the gain, $10,000, reported on Form 1099-R. The new policy's basis is 80,000 − 10,000 (boot received) + 10,000 (gain recognized) = $80,000, against $110,000 of value, carrying $30,000 of untaxed gain forward. Had the new insurer carried the loan over to the new policy instead, there would be no boot and no current tax.

For annuities, a **partial exchange** of part of one contract into another is tax-free if no amount is taken from either contract within 180 days of the transfer, other than annuity payments for 10 years or more or for life (Rev. Proc. 2011-38), with basis allocated ratably (Rev. Rul. 2003-76): moving half of an annuity with $120,000 of value and $80,000 of basis moves $60,000 of value and $40,000 of basis. The exchange is reported on Form 1099-R with code 6, total value in box 1, zero in box 2a and total premiums in box 5; a partially taxable exchange gets a separate 1099-R for the taxable part. The money has to move insurer to insurer to qualify ([1035 Exchanges and DTCC Transfers](/books/insurance/annuity-best-interest#1035-exchanges-and-dtcc-transfers)), and the new insurer must receive the carried-over basis from the old one, because it will report the next distribution.

## The Forms

| Form and code | When the insurer files it |
| --- | --- |
| **1099-R, code 7** | A distribution from a life insurance, annuity or endowment contract with no other code: surrenders, taxable withdrawals, MEC loans treated as distributions, owners 59½ or older |
| **1099-R, code 1** | An early distribution with no known exception, when the recipient is under 59½ (where the 10% additional tax may apply) |
| **1099-R, code 4** | Death benefits paid to a survivor beneficiary, such as an annuity's death benefit with gain |
| **1099-R, code 6** | A section 1035 exchange |
| **1099-R, code D** | "Annuity payments from nonqualified annuities and distributions from life insurance contracts" |
| **1099-R, box 5** | Investment in the contract (premiums paid) for exchanges and reportable death benefits |
| **1099-INT, box 1** | Interest on delayed death benefits of $600 or more |

The insurer needs the investment in the contract for every policy at every distribution, which means tracking basis from issue through every premium, every tax-free withdrawal, every exchange-in, and every taxable event.

## The Testing Engine

The testing engine is a service the administration system calls before any financial or benefit change posts:

1. **At issue,** compute the product's test (CVAT or guideline), the rates for the issue date, the net single premium (CVAT) or guideline single and level premiums, and the 7-pay premium, from the contract's benefits and the product's mortality and expense basis, and store them.
2. **On every premium,** check cumulative premiums against the guideline limit and the 7-pay limit as of the date; for an excess, either reject the excess, accept it and schedule a refund within the 60-day window after the contract year ends, or, with the owner's written election, accept MEC status.
3. **On every benefit change,** classify it (reduction, increase, material change, rider change), adjust the guideline limits (7702(f)(7)), recompute the 7-pay test from issue at the reduced level or start a new test at the material change, and compute any forced distribution and its recapture taxation.
4. **Every month,** apply the corridor to the death benefit in the values cycle.
5. **On every distribution,** classify it (MEC or not, life or annuity), split it between basis and income, apply the 10% additional tax code logic, update the investment in the contract, and queue the 1099.

The engine's outputs are tax facts that will be reported to the IRS under the insurer's name, so they're stored, never recomputed for reporting.

## How to Build It

The testing records extend [Life Products as Data](/books/insurance/life-products#how-to-build-it)'s `policy_values` and the core model's `premium_entries`; investment in the contract is a running figure derived from entries, like everything else:

```sql
CREATE TABLE tax_tests (                   -- every limit computed, and why
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_id          UUID NOT NULL REFERENCES policies (id),
  transaction_id     UUID REFERENCES policy_transactions (id),
  trigger            TEXT NOT NULL CHECK (trigger IN ('issue', 'premium', 'reduction',
                       'material_change', 'rider_change', 'exchange_in', 'reinstatement')),
  test               TEXT NOT NULL CHECK (test IN ('cvat', 'guideline_premium')),
  rates              JSONB NOT NULL,        -- {"accumulation":"2%","guideline":"4%",
                                            --  "insurance_interest_rate_year":2026}
  net_single_premium BIGINT,                -- CVAT
  guideline_single   BIGINT,
  guideline_level    BIGINT,
  seven_pay_premium  BIGINT NOT NULL,
  seven_pay_start    DATE NOT NULL,         -- issue or the material change date
  benefit_basis      BIGINT NOT NULL,       -- death benefit the test was computed on
  cumulative_paid    BIGINT NOT NULL,       -- amount paid as of this test
  limit_amount       BIGINT NOT NULL,
  excess             BIGINT NOT NULL DEFAULT 0,
  excess_action      TEXT CHECK (excess_action IN ('rejected', 'refund_scheduled',
                       'refunded', 'mec_elected', 'forced_distribution')),
  refund_due_by      DATE,                  -- 60 days after the contract year ends
  mec_status         TEXT NOT NULL CHECK (mec_status IN ('not_mec', 'mec')),
  mec_effective      DATE,
  engine_version     TEXT NOT NULL,
  computed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tax_basis_entries (           -- investment in the contract, as entries
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_id          UUID NOT NULL REFERENCES policies (id),
  transaction_id     UUID REFERENCES policy_transactions (id),
  kind               TEXT NOT NULL CHECK (kind IN ('premium', 'tax_free_withdrawal',
                       'exchange_in_basis', 'exchange_out', 'income_recognized',
                       'excess_refund')),
  amount             BIGINT NOT NULL,       -- signed
  effective_on       DATE NOT NULL
);

CREATE TABLE tax_documents (               -- every form filed, as filed
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_id          UUID NOT NULL REFERENCES policies (id),
  recipient_party_id UUID NOT NULL REFERENCES parties (id),
  tax_year           INT NOT NULL,
  form               TEXT NOT NULL CHECK (form IN ('1099-R', '1099-INT')),
  distribution_codes TEXT[],                -- {'7'}, {'1'}, {'6'}, {'4','D'}
  gross_amount       BIGINT NOT NULL,       -- box 1
  taxable_amount     BIGINT,                -- box 2a
  investment_in_contract BIGINT,            -- box 5
  source_transactions UUID[] NOT NULL,
  status             TEXT NOT NULL CHECK (status IN ('draft', 'filed', 'corrected',
                       'void')),
  corrects_id        UUID REFERENCES tax_documents (id),
  filed_at           TIMESTAMPTZ
);
```

The corridor factor and the 7-pay check are small, pure functions the values engine and the premium posting both call:

```go tab="Go"
// CorridorBP returns the 7702(d) applicable percentage in basis points for an
// attained age, falling ratably within each band.
func CorridorBP(age int) int {
	bands := [][2]int{{40, 25000}, {45, 21500}, {50, 18500}, {55, 15000}, {60, 13000},
		{65, 12000}, {70, 11500}, {75, 10500}, {90, 10500}, {95, 10000}}
	if age <= 40 {
		return 25000
	}
	for i := 1; i < len(bands); i++ {
		a0, p0, a1, p1 := bands[i-1][0], bands[i-1][1], bands[i][0], bands[i][1]
		if age <= a1 {
			return p0 + (p1-p0)*(age-a0)/(a1-a0)
		}
	}
	return 10000
}

// SevenPayExcess returns how much cumulative paid exceeds the 7-pay limit in
// contract year n (1..7); zero means the contract passes.
func SevenPayExcess(sevenPay, cumulativePaid int64, year int) int64 {
	if year > 7 {
		return 0
	}
	if x := cumulativePaid - sevenPay*int64(year); x > 0 {
		return x
	}
	return 0
}
```

```rust tab="Rust"
/// 7702(d) applicable percentage in basis points, ratable within each band.
pub fn corridor_bp(age: i32) -> i32 {
    const BANDS: [(i32, i32); 10] = [(40, 25000), (45, 21500), (50, 18500), (55, 15000),
        (60, 13000), (65, 12000), (70, 11500), (75, 10500), (90, 10500), (95, 10000)];
    if age <= 40 { return 25000; }
    for w in BANDS.windows(2) {
        let ((a0, p0), (a1, p1)) = (w[0], w[1]);
        if age <= a1 { return p0 + (p1 - p0) * (age - a0) / (a1 - a0); }
    }
    10000
}

/// How much cumulative paid exceeds the 7-pay limit in contract year 1..=7.
pub fn seven_pay_excess(seven_pay: i64, cumulative_paid: i64, year: i64) -> i64 {
    if year > 7 { return 0; }
    (cumulative_paid - seven_pay * year).max(0)
}
```

`CorridorBP(62)` returns 12,600 and `CorridorBP(72)` returns 11,100, the worked corridor figures; `SevenPayExcess(12000_00, 30000_00, 2)` returns 6,000_00, the worked excess in cents. Integer division truncates only within a band where the statute's ratable steps are whole basis points per year, which they are for every band in the table.

## Auditing

Tax records are the insurer's filings, and the IRS, the owner and a later carrier all rely on them:

- **Limits by policy and date.** Every test with its trigger, rates, benefit basis, limits and engine version, so a waiver request or an exam can show what was computed when.
- **Excess premium handling.** Every excess with its action, the refund date against the 60-day deadline, and the interest reported.
- **MEC flags.** MEC status with its effective date and the test that set it, and the notice to the owner.
- **Basis.** Investment in the contract as entries from issue (including carried-over basis received in exchanges), reconciling to every 1099-R box 5.
- **Forms.** Every 1099 as filed, with source transactions, and corrections as new documents that point at what they correct.
- **Employer-owned contracts.** The notice and consent documents for 101(j) on file before issue.

## What This Means for the System You Build

- **Make the testing engine a gate on every premium, withdrawal and benefit change,** and store its results as tax facts.
- **Store the 7702 rates by issue period** and the test a product uses at filing; never infer them later.
- **Recompute the 7-pay test from issue on reductions** and start new tests on material changes; schedule excess refunds inside the 60-day window.
- **Track investment in the contract as entries,** including basis carried in through exchanges, and report from it.
- **Classify distributions before paying them** (MEC or not, life or annuity, age, exceptions) and queue the right 1099 with the right codes.
- **Warn before tax events the owner may not expect:** a face reduction that creates a MEC, a lapse with a loan, an exchange with a loan extinguished.

## References

**Law and regulation**

- [26 USC 7702](https://www.law.cornell.edu/uscode/text/26/7702), the definition of life insurance, CVAT, the guideline premium requirements and rates after 2020, the insurance interest rate, the cash value corridor table, computational rules, adjustments and recapture, correction of errors and the treatment of failed contracts
- [26 USC 7702A](https://www.law.cornell.edu/uscode/text/26/7702A), modified endowment contracts, the 7-pay test, reductions in benefits, the 90-day reinstatement rule, material changes, second-to-die contracts, distributions in anticipation of failure and the 60-day return of excess premium
- [26 USC 72](https://www.law.cornell.edu/uscode/text/26/72), investment in the contract, basis-first treatment of non-MEC life insurance, income-first treatment and loans as distributions for MECs, aggregation, the exclusion ratio, the 72(q) and 72(v) additional taxes and their exceptions
- [26 USC 101](https://www.law.cornell.edu/uscode/text/26/101), the death benefit exclusion, transfers for value and reportable policy sales, interest, installments, accelerated death benefits and employer-owned contracts
- [26 USC 1035](https://www.law.cornell.edu/uscode/text/26/1035), tax-free exchanges and the cross-references to section 1031 for boot and basis
- [26 USC 1031](https://www.law.cornell.edu/uscode/text/26/1031), the carryover basis rule of 1031(d)

**Regulators and guidance**

- [IRS: Instructions for Forms 1099-R and 5498 (2026)](https://www.irs.gov/instructions/i1099r), distribution codes 1, 4, 6, 7 and D, section 1035 exchange reporting, life insurance surrenders and reportable death benefits
- [IRS: Instructions for Forms 1099-INT and 1099-OID](https://www.irs.gov/instructions/i1099int), interest on delayed death benefits of $600 or more in box 1
- [IRS: Internal Revenue Bulletin 2011-30 (Rev. Proc. 2011-38)](https://www.irs.gov/irb/2011-30_IRB), the 180-day rule for partial annuity exchanges and ratable basis allocation under Rev. Rul. 2003-76

**Filings**

- [Lincoln Benefit Life: Consultant VUL prospectus, May 1, 2026 (Form 485BPOS)](https://www.sec.gov/Archives/edgar/data/910475/000162828026025862/consvul485bpos.htm), the policy structured to meet the tax definition and death benefit options using a specified percentage of policy value
