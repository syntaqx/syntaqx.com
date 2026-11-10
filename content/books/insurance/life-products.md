+++
title = "Life Products as Data"
description = "Term, whole, universal, indexed and variable life and final expense: what each stores and computes, riders, nonforfeiture and the policy values table."
category = "Insurance Industry"
order = 2757
part = "Life and Annuities"
tags = ["insurance", "life-insurance", "universal-life", "whole-life", "nonforfeiture", "policy-values"]
+++

A life policy is a promise with a schedule. A property policy is priced for a year and renewed or dropped; a life policy is priced once, at issue, for a promise that may run sixty years, and everything the insurer will charge, credit or guarantee over those years is written into the contract or into a scale the insurer can change only within the contract's limits. A twenty-year term policy stores a premium schedule and a face amount and computes almost nothing. A whole life policy stores a table of guaranteed cash values the insurer filed with the state, and a dividend the board declares each year on top. A universal life policy stores an account value that the system recomputes every month: premium in, expense charges and the cost of insurance out, interest credited, and a test at the end of the month of whether there's enough left to keep the coverage going. Indexed and variable universal life add a crediting strategy tied to an index or to separate account funds. Each kind is a different program running against the same policy record.

That's why the core of a life system is the values engine, not the rating engine. Pricing is done by actuaries before the product is filed; what the system does every day is apply the filed formulas to each policy, month after month, and keep every value it produced: cash value, account value, surrender charge, loan balance, death benefit, net amount at risk. Those values drive lapse, loans, surrenders, tax tests, illustrations, reserves and death claims, and a regulator, a court or the policyholder may ask what any of them was on any date. This chapter covers the products as data: term, whole, universal, indexed universal, variable universal and final expense, what each stores and computes, the riders, the nonforfeiture law that guarantees value on lapse, and the `policy_values` table the rest of the part builds on, against the core model's `products`, `policies` and `coverages` ([The Core Data Model](/books/insurance/insurance-business#the-core-data-model)). Annuities are the next chapter, [Annuities & Riders](/books/insurance/annuities); how the values become a sales projection is [Illustrations](/books/insurance/illustrations); the tax limits every permanent product is designed around are [Life Insurance & the Tax Code](/books/insurance/life-insurance-and-tax).

## How the Platforms Do It

What carriers and administration platforms publish about the products they write and run, as of November 2026:

| Company | What it writes or runs | What its public material shows |
| --- | --- | --- |
| **Globe Life** | Nonparticipating ordinary life: traditional whole life, term and other life, sold by exclusive agents (American Income, Liberty National) and direct to consumer | $3.42 billion of life annualized premium in force at the end of 2025: traditional whole life 71%, term 22%, interest-sensitive whole life 1%, other 6%; direct to consumer $924 million of it; the company "does not currently sell interest-sensitive whole life products" (2025 10-K) |
| **Lincoln Benefit Life** | Variable universal life (Consultant VUL, closed to new sales since September 13, 2004, still administered) | Monthly deduction of a $7.50 policy fee, a 0.72% mortality and expense charge on subaccount value in years 1 to 14, cost of insurance on the net amount at risk and rider charges; guaranteed maximum COI rates on the 1980 CSO table; a 61-day grace period; a 14-year surrender charge (May 1, 2026 prospectus) |
| **Northwestern Mutual** | Participating whole life | An expected $10.4 billion dividend payout for 2027, about $8.9 billion of it to whole life owners, "most of whom use their dividend to purchase paid-up additional insurance"; "Future dividends are not guaranteed" (October 27, 2026 release) |
| **Primerica** | Level term only, sold by its own representatives | Level premium periods of 10 to 35 years; $967.6 billion of face amount and 3,010,563 policies in force at December 31, 2025; 80% to 90% of mortality risk reinsured on a first-dollar quota share, yearly renewable term basis (2025 10-K) |
| **DXC** | Life and annuity administration: Assure Life+, Assure Cyberlife, Assure Ingenium, Assure Integral, Assure wmA, GraphTalk | Commits to support heritage Ingenium, Cyberlife, wmA, Group/400, Integral and Life/400 deployments; markets 21 of the world's 25 leading insurers as customers |
| **Equisoft** | equisoft/manage policy administration, plus data migration | Markets 35+ policy administration clients and 350+ data migrations and implementations |
| **Majesco** | "Intelligent Core for LA&H": policy, billing and claims for life, annuity, group and voluntary benefits | Group and voluntary benefits listed beside individual lines |
| **Sapiens** | CoreSuite for Life & Pensions | A core policy administration system for life and pensions |

Three patterns run through the table. **The in-force book outlives the product.** Lincoln Benefit still files a prospectus for a policy it stopped selling in 2004, and DXC sells support for systems named after the 1980s; a life platform runs every product it ever issued, by its own filed formula, until the last insured dies or lapses. **Traditional and account-value products are different programs.** Globe Life's book is mostly fixed-premium traditional life whose values come from tables, while universal life's values are a monthly calculation; most administration systems carry both engines. **Reinsurance is part of the product.** Primerica cedes most of the mortality on every new term policy the day it issues, so the reinsurance cession is a field on the policy from day one ([Life Reserves, Capital & Private Equity](/books/insurance/life-reserves-and-capital) covers the structures in [Life Reinsurance](/books/insurance/life-reserves-and-capital#life-reinsurance)).

## The Market in Numbers

US life insurers wrote $210.24 billion of direct life insurance premium in 2025, NAIC's market share data shows, with filings received by March 18, 2026 covering about 97.5% of the industry. New York Life (7.40%), Northwestern Mutual (6.75%), MetLife (6.19%), Prudential (5.97%), Lincoln (4.36%), MassMutual (4.35%), Nationwide (3.41%), Pacific Life (3.35%), State Farm (2.89%) and Guardian (2.60%) led; Globe Life (1.58%) and Primerica (1.48%) ranked 19th and 20th, and the top 25 groups wrote 73.20%. The life business is bigger than its premium: NAIC counted $1.5 trillion of direct premium and deposits across life, annuity and health lines for 2025 and $10.0 trillion of admitted assets, because a life insurer holds reserves for decades ([The Insurance Business](/books/insurance/insurance-business#the-ratios)).

## Term Life

Term pays the face amount if the insured dies during the term and nothing otherwise. There is no cash value, so the record is small: the face amount, the insured, the term, the rate class from underwriting, and a premium schedule.

- **Level term.** The premium is level for an initial period (Primerica's run from 10 to 35 years) and then, if the policy is renewable, jumps each year to a scale based on attained age, usually steep enough that most owners lapse. The system stores the level period, the post-level schedule (guaranteed maximums and current rates) and the renewal age limit.
- **Annual renewable term (ART, or yearly renewable term).** A premium that rises every year with age from the start. The same structure is how most mortality reinsurance is priced: Primerica's first-dollar quota share YRT cession means the reinsurer gets a yearly rate per thousand of net amount at risk for its share.
- **Conversion privilege.** Most term policies let the owner convert to a permanent policy without evidence of insurability before a stated age or the end of a stated period. Conversion is an in-force transaction that issues a new policy at the attained-age rate on the original rate class ([In-Force Administration](/books/insurance/in-force-administration) covers it in [Conversions](/books/insurance/in-force-administration#conversions)).
- **Return of premium term.** Refunds premiums at the end of the term if the insured survives, which gives it cash values and puts it under the nonforfeiture law.

Term computes premium due, grace and lapse, and the death benefit. It has no account value, no loans and, unless it returns premium, no surrender value, which is why it is the cheapest to administer and the one direct and accelerated channels sell most.

## Whole Life

Whole life covers the insured for life at a level premium (or for a limited premium period, such as 20-pay or paid-up at 65), and builds a **guaranteed cash value** that, at the policy's maturity age, equals the face amount. The cash values aren't computed by the system from experience; they are a table of guaranteed values per $1,000 of face by policy year, computed by the actuary at filing from a mortality table and an interest rate stated in the policy. The Standard Nonforfeiture Law requires the policy to state "the mortality table and rate of interest used in calculating cash surrender values and the paid-up nonforfeiture benefits," together with a table showing them, and New York's standard provisions require the table to cover each of the first twenty years (N.Y. Ins. Law 3203(a)(7)).

**Participating whole life** adds dividends: a mutual or a stock company's participating block returns part of the divisible surplus each year according to a dividend scale the board declares. New York requires the insurer to apportion divisible surplus annually and participating policies to state that dividends are not guaranteed (3203(a)(6), (a)(15)). The owner picks a dividend option: cash, reduce the premium, accumulate at interest, or buy **paid-up additions** (small single-premium whole life policies that add both face and cash value). Northwestern Mutual's release describes the last as what most of its owners choose. In the data, a dividend is a declared amount applied by option on the anniversary, recorded per policy with the declaration it came from, and each paid-up addition is a block of coverage with its own face and cash value that the death claim and the surrender must add in. [Who Carries the Risk](/books/insurance/who-carries-the-risk#how-to-build-it) owns the `policyholder_dividends` record for mutual dividends generally; whole life uses it and adds the paid-up additions to `policy_values`.

**Interest-sensitive (current assumption) whole life** keeps the fixed premium and guaranteed minimum values of whole life but credits a current interest rate to an accumulation value, which makes it an account-value product under the hood; Globe Life's 1% of in-force premium in it, and its statement that it no longer sells it, are typical of where the market went.

## Nonforfeiture: Value on Lapse

A permanent policy with cash value can't simply end when the owner stops paying: the Standard Nonforfeiture Law for Life Insurance (Model #808) requires options that give the owner the value built up. Model #808, January 2014 edition, requires a policy to provide:

- On default, a **paid-up nonforfeiture benefit** on a plan stipulated in the policy, effective as of the premium due date, on request "not later than sixty (60) days after the due date of the premium in default" (Section 2A).
- On surrender within those 60 days, after premiums have been paid for at least three full years (five for industrial insurance), a **cash surrender value** instead (2B).
- A **default option** that takes effect automatically if the owner elects nothing within 60 days (2C). Policies typically name extended term insurance as the default when the policy is standard and reduced paid-up when it is rated, but the plan is whatever the policy stipulates.
- The right of the company to defer payment of a cash surrender value for up to six months after the request (Section 2, after 2F).

The two paid-up options are conversions of the net cash value into coverage at attained age:

- **Reduced paid-up insurance.** The net cash value buys a single-premium whole life policy at attained age. A worked example, mine: a whole life policy with a $100,000 face lapses with a guaranteed cash value of $20,000 and a $5,000 policy loan, so net cash value is $15,000. If the policy's net single premium at the insured's attained age, on the policy's nonforfeiture mortality and interest basis, is $450 per $1,000, reduced paid-up coverage is 15,000 / 0.450 = $33,333 of face for life, with no more premiums.
- **Extended term insurance.** The same $15,000 buys term coverage for the full face, less the loan ($95,000 here), for as long as it will pay: the system finds the term period whose net single premium for $95,000 at attained age equals $15,000, typically stored in the filed table as years and days.

Both are values the policy's filed tables or formulas define. The administration system doesn't price them; it looks them up or applies the filed basis, records the election and its effective date, and issues a new status. Model #808's adjusted-premium method, under which the minimum cash value is the present value of future guaranteed benefits less the present value of future "adjusted premiums" (Sections 3 and 5), is the actuarial floor the filed table must clear; since the Valuation Manual became operative, the mortality and interest basis follows it ([Life Reserves, Capital & Private Equity](/books/insurance/life-reserves-and-capital)).

## Universal Life

Universal life separates the policy into an account and a charge for coverage. The owner pays flexible premiums into an **account value** (policy value); each month the insurer takes charges out and credits interest; the death benefit is the face amount (or face plus account value) as long as the account can pay the charges. The policy stores the guaranteed maximums of every charge and the minimum credited rate, and the insurer sets current charges and rates within them, which is why a UL policy's future is "non-guaranteed elements" all the way down.

The monthly cycle, on each **monthly deduction day** (the monthiversary):

1. **Premium received** since the last cycle is credited, less a **premium expense charge** (a percentage load; Lincoln Benefit's VUL charges 3.5% in years 1 to 10 and 1.5% after, plus a separate 2.5% premium tax charge).
2. **Net amount at risk (NAR)** is computed: the death benefit discounted for one month at the guaranteed interest rate, less the account value. Lincoln Benefit's prospectus defines it as the death benefit "divided by 1.0032737" minus the policy value; 1.0032737 is 1.04 raised to the power 1/12, a 4% guaranteed annual rate expressed monthly.
3. **The monthly deduction** is taken: the **cost of insurance** (COI), which is the NAR in thousands times the monthly COI rate for the insured's issue age, duration, sex and rate class, plus the **policy fee** and **rider charges**, and for variable products a **mortality and expense risk charge** on the separate account value.
4. **Interest** (or index credit, or fund performance) is credited.
5. **Lapse test**: if the net cash surrender value (account value less surrender charge and loans) can't cover the next monthly deduction, the policy enters its grace period (61 days in Lincoln Benefit's contract and in New York's standard provisions for variable-premium policies, 3203(a)(1)).

**Worked numbers: one month of a universal life policy.** Mine, on illustrative charges: a $500,000 Option A (level death benefit) policy on a 45-year-old, account value $40,000.00 at the start of the month, $600.00 premium received, a 6% premium expense charge, a $10.00 monthly policy fee, a current COI rate of $0.21 per $1,000 of NAR per month, and a 4.5% current annual credited rate.

| Step | Calculation | Amount |
| --- | --- | ---: |
| Opening account value | | $40,000.00 |
| Net premium | 600.00 × (1 − 0.06) | +$564.00 |
| Account value after premium | | $40,564.00 |
| Net amount at risk | 500,000 / 1.0032737 − 40,564.00 | $457,804.49 |
| Cost of insurance | 457.80449 × $0.21 | −$96.14 |
| Policy fee | | −$10.00 |
| Account value after deduction | | $40,457.86 |
| Interest for the month | 40,457.86 × (1.045^(1/12) − 1) = 40,457.86 × 0.0036748 | +$148.67 |
| Closing account value | | $40,606.53 |

Every row is a stored value, not a log line: the NAR and the COI rate used are what a regulator checks when an insurer raises COI rates, and what the reinsurer's YRT premium is computed from. Three things change the shape. Under **Option B** (increasing death benefit), the death benefit is face plus account value, so NAR stays at about the face amount and COI doesn't fall as the account grows. When the account value is large relative to the face, the **corridor** takes over: the death benefit must be at least a percentage of the cash value (250% through age 40, grading down to 100% at 95) for the policy to stay life insurance under the tax code, so the death benefit becomes the account value times the corridor factor and NAR rises with the account ([Life Insurance & the Tax Code](/books/insurance/life-insurance-and-tax) works the [corridor](/books/insurance/life-insurance-and-tax#the-cash-value-corridor)). And when the guaranteed maximum COI rate applies instead of the current one, as in an illustration's guaranteed column, the same policy can lapse decades earlier.

**Secondary guarantee universal life (ULSG)** adds a no-lapse guarantee: the policy stays in force even if the account value goes to zero, as long as a shadow account or a cumulative premium test is met. It behaves like level-premium permanent term and is reserved in its own VM-20 reserving category ([Life Reserves, Capital & Private Equity](/books/insurance/life-reserves-and-capital) covers [VM-20](/books/insurance/life-reserves-and-capital#vm-20-life)). The data model has to carry the shadow account, with its own charges and credits, beside the real one, and the lapse test checks both.

## Indexed Universal Life

Indexed universal life (IUL) is universal life whose credited interest comes from an index strategy instead of a declared rate: on each segment's anniversary, the insurer credits the index change subject to a **cap** (maximum credit), a **participation rate** (share of the change), a **floor** (usually 0%) and sometimes a **spread** or a **multiplier or bonus**. The account value in a strategy is locked for the segment term (usually a year); money arriving mid-year waits in a fixed account until the next sweep date, so an IUL policy holds several **segments**, each with its own start date, start index value, cap and participation, and the values engine tracks them separately. The mechanics are the same as a fixed indexed annuity's, worked in [Annuities & Riders](/books/insurance/annuities#fixed-indexed-annuities); the difference in life is that the credits feed an account that also pays COI.

IUL is where illustrations got aggressive. The actuarial guidelines in the AG 49 family limit the rate an IUL may be illustrated at and the benefit an illustration may show from borrowing against the policy at a rate below the illustrated credit ([Illustrations](/books/insurance/illustrations#ag-49-and-indexed-ul)). None of that changes what the contract credits; it changes what the sales projection may show.

## Variable Universal Life

Variable universal life (VUL) puts the account value in **separate account** subaccounts the owner chooses (mutual-fund-like portfolios), so the owner bears the investment risk and the policy is a security: it is registered with the SEC, sold under a prospectus by FINRA-registered representatives, and the separate account's assets are held apart from the insurer's general account. Lincoln Benefit's VUL prospectus is the public anatomy of the charges: premium expense and tax charges, a monthly policy fee, the 0.72% mortality and expense risk charge on subaccount value (to fall to 0.36% from year 15, guaranteed not to exceed 0.48%), COI on the NAR, a surrender charge per $1,000 of face that declines over 14 years, and policy loans up to 90% of surrender value, with loaned amounts moved to a loan account credited 4%. The securities side (registration, Reg BI, FINRA's communications rules) belongs to [Investing & Digital Assets](/books/investing-and-digital-assets/advice-and-conduct#regulation-best-interest); this volume covers the insurance product and its insurance regulation. In the data, VUL adds unit holdings per subaccount, daily unit values from the separate account, and transfer instructions, on top of the UL cycle.

## Final Expense and Small Face Products

Final expense is small face whole life sold to older buyers to pay funeral and end-of-life costs, through direct mail and digital channels, telesales and agents. Underwriting runs from **simplified issue** (a few health questions, a prescription check, no exam) to **guaranteed issue** (no health questions; anyone in the age band is accepted). Because guaranteed issue can't select against people who are already ill, a common design is a **graded death benefit**: for non-accidental deaths in the first years, the policy returns premiums with interest instead of paying the face, and it pays the full face after that. Globe Life's direct-to-consumer channel, $924 million of life annualized premium in force at the end of 2025, is the scale version of the direct model. In the data, final expense is whole life with a few extra fields: the graded benefit schedule by policy year and cause of death, which the death claim must apply, and the channel and solicitation records, because direct response sales have their own replacement and disclosure rules ([Best Interest, Replacements & 1035 Exchanges](/books/insurance/annuity-best-interest#replacements-under-model-613)).

## Riders

A rider is a coverage attached to a base policy with its own charge, its own terms and often its own underwriting, stored as a `coverages` row on the policy version with its own code:

| Rider | What it does | What the system computes |
| --- | --- | --- |
| **Waiver of premium** | Waives premiums (or, on UL, the monthly deduction or a specified premium) while the insured is totally disabled | A disability claim with an elimination period; then premium credits instead of billing |
| **Accidental death benefit** | Pays an extra amount for accidental death | Cause-of-death test on the death claim; New York excludes ADB riders from the base policy's exclusion rules (3203(d)(1)) |
| **Accelerated death benefit** | Pays part of the face early on terminal illness (and, on chronic illness riders, chronic illness) | Treated as paid by reason of death for tax if the insured is certified as reasonably expected to die within 24 months (26 USC 101(g)); reduces the face and the cash value |
| **Long-term care or chronic illness** | Pays a monthly benefit from the death benefit for qualifying care needs | Benefit payments that reduce face and account value; a qualified LTC rider doesn't stop the contract from being life insurance (26 USC 1035(b)(3)) |
| **Child term** | Term coverage on the insured's children | A separate insured life on the same policy |
| **Guaranteed insurability** | Options to buy more coverage at set dates without evidence | Option dates and amounts as tasks |
| **Term rider on the insured or another life** | Blends term into a permanent policy | Its own COI or premium |

Riders interact with everything later in the part. A rider's charge is part of the monthly deduction; a rider that adds death benefit is an increase for the 7-pay test; a waiver of premium claim follows the claims rules that apply to disability ([Group Life & Disability](/books/insurance/group-life-and-disability#erisa-claim-rules) covers ERISA's for group plans).

## The Product as Data

What each product stores and computes, the core of the rest of this part:

| Product | Stored per policy | Computed and recorded | Values that matter later |
| --- | --- | --- | --- |
| **Term** | Face, term, rate class, premium schedule (level and post-level, guaranteed and current), conversion terms | Premium due, grace, lapse | Death benefit; conversion eligibility |
| **Whole life** | Face, guaranteed cash value table, nonforfeiture basis, dividend option | Cash value by date, dividends applied, paid-up additions, nonforfeiture options on lapse | Cash surrender value, loan value, paid-up additions in the death benefit |
| **Universal life** | Face, death benefit option, guaranteed maximum charges, minimum credited rate, surrender charge schedule | Monthly account value roll: premium, loads, NAR, COI, fees, interest; lapse test | Account value, surrender value, NAR, corridor death benefit, shadow account for ULSG |
| **Indexed UL** | UL plus strategies, caps, participation, floors, segment rules | Segment index credits on segment anniversaries | Segment values, locked caps |
| **Variable UL** | UL plus subaccount allocations | Unit holdings at daily unit values | Separate account value, M&E charges |
| **Final expense** | Whole life plus graded benefit schedule | As whole life | Graded benefit by policy year and cause |

The split that matters most: **traditional products read values from filed tables; account-value products produce values by running a calculation.** A whole life cash value on a date is a table lookup (with interpolation between anniversaries) plus dividends and additions; a UL account value on a date is the result of every monthly cycle since issue, and it can only be reproduced by replaying them with the rates that applied each month. That makes the history of the inputs, the current COI scale, the credited rate declarations and the premium payments, as important as the values themselves.

## How to Build It

The life chapters extend the core model's `products`, `policies`, `policy_versions` and `coverages` ([The Core Data Model](/books/insurance/insurance-business#the-core-data-model)). The insured life is a `risks` row of kind `insured_life`; owner, insured, payor and beneficiaries are `party_roles`. The filed product's guaranteed schedules (COI maximums, cash value tables, surrender charges) live in `rate_tables` versioned with the filing, defined in [How a Rate Is Built](/books/insurance/how-a-rate-is-built#how-to-build-it); the insurer's current scales (current COI, declared rates) are rate tables too, effective-dated by declaration, so the engine can say which scale applied in which month. This chapter adds `policy_values`, one row per policy per valuation event:

```sql
CREATE TABLE policy_values (               -- every value the engine produced, kept
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_id          UUID NOT NULL REFERENCES policies (id),
  as_of              DATE NOT NULL,         -- monthiversary, anniversary, transaction date
  event              TEXT NOT NULL CHECK (event IN ('monthly_deduction', 'anniversary',
                       'premium', 'withdrawal', 'loan', 'index_credit', 'dividend',
                       'nonforfeiture', 'surrender', 'death', 'correction')),
  transaction_id     UUID REFERENCES policy_transactions (id),
  account_value      BIGINT,                -- UL, IUL, VUL; minor units
  cash_value         BIGINT,                -- whole life: guaranteed plus additions
  surrender_charge   BIGINT NOT NULL DEFAULT 0,
  loan_balance       BIGINT NOT NULL DEFAULT 0,  -- principal plus accrued interest
  cash_surrender_value BIGINT NOT NULL,     -- what a full surrender would pay today
  death_benefit      BIGINT NOT NULL,       -- after corridor, additions and loans
  net_amount_at_risk BIGINT,
  premium_load       BIGINT,                -- charges taken in this event
  coi_charge         BIGINT,
  fee_charge         BIGINT,
  rider_charges      BIGINT,
  interest_credited  BIGINT,
  scale_refs         JSONB NOT NULL,        -- {"coi":"2026-01 current","rate":"4.50% 2026-07"}
  shadow_account     BIGINT,                -- ULSG no-lapse test value, if any
  status_after       TEXT NOT NULL CHECK (status_after IN ('in_force', 'grace',
                       'lapsed', 'reduced_paid_up', 'extended_term', 'paid_up',
                       'surrendered', 'death_claim')),
  computed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (policy_id, as_of, event, transaction_id)
);

CREATE TABLE policy_value_segments (       -- indexed and variable holdings within a value row
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_value_id    UUID NOT NULL REFERENCES policy_values (id),
  kind               TEXT NOT NULL CHECK (kind IN ('fixed', 'index_segment',
                       'subaccount', 'loan_account', 'paid_up_addition')),
  strategy_ref       TEXT,                  -- 'SP500_1YR_PTP_CAP', fund code, PUA block
  segment_start      DATE,
  start_index_value  NUMERIC(14,4),
  cap_bp             INT,                   -- locked at segment start
  participation_bp   INT,
  units              NUMERIC(20,6),         -- subaccount units
  value              BIGINT NOT NULL
);
```

Values are produced by a scheduled monthly job per policy and by every financial transaction, always in policy order: a premium received backdated to the 5th is applied, and every later monthly deduction is recomputed, which creates new `policy_values` rows with event `correction` and leaves the superseded ones in place with their `computed_at`, the same rule as [Recorded Time and Corrections](/docs/database/temporal-data#recorded-time-and-corrections). The monthly deduction itself is small and should be shared code across products, in integer minor units with the rates as scaled integers ([Integer Minor Units](/docs/money/amounts#integer-minor-units)):

```go tab="Go"
// MonthlyDeduction applies one universal life monthly cycle. Amounts are cents;
// coiMicros is the COI per $1 of NAR per month in millionths (0.21 per 1,000 = 210);
// discount is the guaranteed monthly factor scaled by 1e7 (1.0032737 = 10032737).
type Month struct {
	OpeningAV, Premium, PolicyFee int64
	LoadBP                       int64 // premium expense charge, basis points
	Face                         int64 // Option A death benefit before corridor
	COIMicros, Discount          int64
	CreditMicros                 int64 // monthly credited rate in millionths
}

func roundDiv(n, d int64) int64 { return (2*n + d) / (2 * d) } // half up, n >= 0

func MonthlyDeduction(m Month) (nar, coi, closing int64) {
	av := m.OpeningAV + m.Premium - roundDiv(m.Premium*m.LoadBP, 10_000)
	nar = roundDiv(m.Face*10_000_000, m.Discount) - av
	if nar < 0 {
		nar = 0
	}
	coi = roundDiv(nar*m.COIMicros, 1_000_000)
	av -= coi + m.PolicyFee
	closing = av + roundDiv(av*m.CreditMicros, 1_000_000)
	return nar, coi, closing
}
```

```rust tab="Rust"
/// One universal life monthly cycle; amounts in cents, rates as scaled integers.
pub struct Month {
    pub opening_av: i64, pub premium: i64, pub policy_fee: i64,
    pub load_bp: i64, pub face: i64,
    pub coi_micros: i64, pub discount: i64, pub credit_micros: i64,
}

fn round_div(n: i64, d: i64) -> i64 { (2 * n + d) / (2 * d) } // half up, n >= 0

pub fn monthly_deduction(m: &Month) -> (i64, i64, i64) {
    let mut av = m.opening_av + m.premium - round_div(m.premium * m.load_bp, 10_000);
    let nar = (round_div(m.face * 10_000_000, m.discount) - av).max(0);
    let coi = round_div(nar * m.coi_micros, 1_000_000);
    av -= coi + m.policy_fee;
    let closing = av + round_div(av * m.credit_micros, 1_000_000);
    (nar, coi, closing)
}
```

Run on the worked example (opening $40,000.00, premium $600.00, 600 basis points, face $500,000, 210 micros, 10032737, 3675 micros), the function returns a NAR within a cent of the table's $457,804.49 and the same COI and closing value; the cent comes from where rounding happens, which is why the filed contract's rounding rule (per step or at the end, to the cent or the mill) is a product parameter, not an implementation detail. Corridor, Option B, riders and shadow accounts are more steps in the same pipeline, each recorded in the row.

Status follows from values: `grace` when the lapse test fails, `lapsed` or a nonforfeiture status at the end of grace, `death_claim` when a death is reported. The transitions and their notices are [In-Force Administration](/books/insurance/in-force-administration)'s ([Grace, Lapse and the Notices](/books/insurance/in-force-administration#grace-lapse-and-the-notices)).

## Auditing

Values are what policyholders sue over and regulators examine, so the records have to answer:

- **What was the value, and why.** For any policy and date, the value row with every charge and credit, and the scale and table versions it used, so a disputed surrender value or a lapse can be recomputed to the cent.
- **What changed when the insurer changed a scale.** A COI increase or a credited rate cut is an insurer decision that applies to every affected policy from a date; the scale's declaration, its effective date and the policies it touched should be one query, because COI increases are the subject of class actions and regulator inquiries.
- **Guarantees honored.** Every charge at or below its guaranteed maximum and every credit at or above its guaranteed minimum, checked on every row, with exceptions stopped before they post.
- **Nonforfeiture elections.** The election or default, its date against the 60-day window, the values it was computed from.
- **Corrections.** Replayed months as new rows, never overwritten ones ([Amend, Don't Overwrite](/docs/building-blocks/audit-trails#amend-don-t-overwrite)).

## What This Means for the System You Build

- **Build a values engine, not just a policy record.** Account-value products are a calculation that runs every month for the life of the policy; keep every result in `policy_values` with the scale and table versions it used.
- **Separate guaranteed tables from current scales,** both effective-dated, and check every charge against its guaranteed maximum and every credit against its minimum.
- **Treat traditional and account-value products as different programs** on one record: table lookups for whole life and term, monthly replay for universal life.
- **Replay, don't patch.** A backdated premium or a correction recomputes every later cycle as new rows.
- **Make rounding and order of operations product parameters,** taken from the filed contract.
- **Carry segments, subaccounts, paid-up additions and shadow accounts as first-class holdings,** because the death benefit, the surrender value and the tax tests all need them.
- **Store the reinsurance cession and the rate class at issue,** because both are read on every monthly cycle and every claim.

## References

**Law and regulation**

- [26 USC 101](https://www.law.cornell.edu/uscode/text/26/101), death benefits excluded from income, and accelerated death benefits for insureds certified as terminally ill (expected to die within 24 months) treated as paid by reason of death
- [26 USC 1035](https://www.law.cornell.edu/uscode/text/26/1035), the definition of life insurance and annuity contracts, and the rule that a qualified long-term care rider doesn't disqualify the contract
- [N.Y. Ins. Law 3203](https://www.nysenate.gov/legislation/laws/ISC/3203), standard provisions of individual life policies: the 31-day and 61-day grace periods, dividends, the twenty-year nonforfeiture table, loans and the exclusion of accidental death riders from the exclusion rules

**NAIC**

- [NAIC: Standard Nonforfeiture Law for Life Insurance (#808), January 2014 (PDF)](https://content.naic.org/sites/default/files/model-law-808.pdf), the paid-up nonforfeiture benefit and cash surrender value on default, the 60-day election and default option, the three-year requirement, the six-month deferral right and adjusted premiums
- [NAIC: 2025 Life and Fraternal Market Share Report (PDF)](https://content.naic.org/sites/default/files/research-actuarial-life-fraternal-market-share.pdf), 2025 direct life premium of $210.24 billion, the top groups and their shares, and the filing completeness note
- [NAIC: 2025 Annual Life Industry Commentary (PDF)](https://content.naic.org/sites/default/files/2025-annual-life-industry-commentary.pdf), direct premium and deposits and admitted assets for 2025

**Filings**

- [Globe Life: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/320335/000032033526000090/gl-20251231.htm), its channels, life annualized premium in force by channel and by product and the statement that it no longer sells interest-sensitive whole life
- [Lincoln Benefit Life: Consultant VUL prospectus, May 1, 2026 (Form 485BPOS)](https://www.sec.gov/Archives/edgar/data/910475/000162828026025862/consvul485bpos.htm), the monthly deduction, the net amount at risk formula with the 1.0032737 discount, the M&E charge, premium expense and tax charges, 1980 CSO guaranteed COI, the 61-day grace period, the surrender charge and loan terms
- [Primerica: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1475922/000119312526082233/pri-20251231.htm), level premium periods of 10 to 35 years, face amount and policies in force at December 31, 2025, and the first-dollar quota share YRT reinsurance of 80% to 90% of mortality risk

**Vendor documentation**

- [DXC: Life and annuity solutions](https://dxc.com/us/en/industries/insurance/life-annuity), the Assure products and heritage systems supported, and its customer claims
- [Equisoft](https://www.equisoft.com/), equisoft/manage policy administration and its policy administration client and migration counts
- [Majesco](https://www.majesco.com/), Intelligent Core for LA&H across life, annuity, group and voluntary benefits
- [Sapiens](https://sapiens.com/), CoreSuite for Life & Pensions

**In practice**

- [Northwestern Mutual: Record $10.4 billion expected dividend payout for 2027, October 27, 2026](https://news.northwesternmutual.com/2026-10-27-Northwestern-Mutual-Announces-Record-10-4-Billion-Expected-Dividend-Payout-for-2027,-the-Largest-in-Company-History), the payout, the share to whole life owners, paid-up additions as the common use and the statement that dividends are not guaranteed
