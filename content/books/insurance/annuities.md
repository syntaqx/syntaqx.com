+++
title = "Annuities & Riders"
description = "Fixed, MYGA, indexed, RILA, variable, SPIA and DIA annuities: crediting, riders, surrender charges and MVAs worked, nonforfeiture, free look, SEC overlay."
category = "Insurance Industry"
order = 2758
part = "Life and Annuities"
tags = ["insurance", "annuities", "fixed-indexed-annuities", "rila", "variable-annuities", "surrender-charges"]
+++

An annuity is the life insurance contract turned around. Life insurance pays if you die too soon; an annuity pays if you live too long, or, before it pays anything, grows money tax-deferred inside an insurance contract until you take it out. Most of what US insurers sell as annuities is the second kind: deferred annuities, which are savings contracts with an account value, a crediting method (a declared rate, an index formula or separate account funds), surrender charges that keep the money in place long enough for the insurer to earn its spread, and riders that guarantee income or a death benefit whatever the account does. Immediate and deferred income annuities are the first kind: a premium exchanged for payments for life, priced on mortality and interest, with no account at all.

Annuities are the larger half of the life industry's money. NAIC counted $618.27 billion of direct annuity premium in 2025 against $210.24 billion of life insurance premium, and LIMRA counted a fourth straight record year of US retail annuity sales. They are also where insurance law meets securities law: fixed and fixed indexed annuities are insurance products regulated by the states, while variable annuities and registered index-linked annuities are securities as well, registered with the SEC and sold under FINRA's rules. This chapter covers the products as data: fixed and multi-year guaranteed, fixed indexed, registered index-linked, variable and income annuities, the riders, surrender charges and market value adjustments with worked numbers, the nonforfeiture floor, free look and the registered products overlay, with the `riders` and `surrender_schedules` tables, on top of [Life Products as Data](/books/insurance/life-products#how-to-build-it)'s `policy_values`. How annuities are sold, suitability and best interest, replacements and 1035 exchanges, is [Best Interest, Replacements & 1035 Exchanges](/books/insurance/annuity-best-interest); how they are illustrated is [Illustrations](/books/insurance/illustrations#annuity-illustrations-under-model-245).

## How the Platforms Do It

What annuity writers publish about their products, as of November 2026:

| Company | Products | What its public material shows |
| --- | --- | --- |
| **Athene** (Apollo) | Fixed indexed, annual reset, multi-year guaranteed and registered index-linked deferred annuities; pension group annuities; funding agreements | All common shares held by Apollo, its investment manager; Bermuda reinsurance subsidiaries and the ACRA co-invest vehicles; $36.69 billion of 2025 direct annuity premium, the largest group at 5.93% (10-K; NAIC) |
| **F&G** | FIA, fixed rate (including MYGA), pension risk transfer, funding agreements, IUL | 2025 gross sales of $14.6 billion: FIA about 46%, fixed rate 26%, PRT 15%, funding agreements 12%, IUL 1%; $6.9 billion of annuity sales through independent marketing organizations and $3.8 billion through banks and broker-dealers; Blackstone ISG-I Advisors manages investments under a contract F&G can't easily end (10-K) |
| **Jackson** | VA, RILA, fixed and fixed index, payout annuities | 2025 retail annuity sales of $19.7 billion; GMWB for Life elected on 72% of VA account value, enhanced GMDB on 10%; VA guarantee risk reinsured to Brooke Life Reinsurance Company, a Michigan captive; a dynamic hedging program for VA guarantees and RILA and FIA index crediting plus a macro hedge (10-K) |
| **Empower** (Great-West Capital Choice RILA) | Single premium registered index-linked annuity | A 10% free annual withdrawal amount; a withdrawal charge starting at 7%; an MVA with interest and index components; worked cap (5% cap on a 10% gain credits 5%) and buffer (a −10% buffer on a −25% index credits −15%) examples (prospectus) |
| **Gainbridge** (OneUp RILA) | Single premium registered index-linked annuity, closed to new purchasers | A 10-day right to cancel returning contract value unless state law requires premium; a fixed strategy with a 1.00% guaranteed minimum rate; withdrawal charges in the first six contract years (May 1, 2025 prospectus) |
| **Union Security** (variable annuity with multi-year guarantee periods) | VA with fixed guarantee periods | An MVA on amounts removed more than 15 days from a guarantee period's end, using `[(1+i)/(1+j+.0025)]^(N/12) − 1` in its Florida and New York variation (prospectus) |
| **RiverSource** (Structured Solutions 2) | Index-linked annuity | A 10-day free look for new investors, longer in some states; an MVA that "will not decrease the death benefit" (prospectus) |

Three patterns stand out. **The capital behind the product matters as much as the product.** Four of the top 22 annuity writers in NAIC's 2025 ranking are owned by or affiliated with alternative asset managers (Apollo's Athene, Brookfield, KKR's Global Atlantic, and F&G with Blackstone as investment manager), which is the subject of [Life Reserves, Capital & Private Equity](/books/insurance/life-reserves-and-capital#asset-managers-and-life-insurers). **Guarantees are hedged and often reinsured.** Jackson's VA riders sit in a captive and are hedged daily; the rider is a liability on the insurer's books with a hedging program attached, not just a feature. **Liquidity has a price schedule.** Every deferred product in the table charges for leaving early, through a withdrawal charge, an MVA or both, with a free withdrawal allowance and a free look carved out.

## The Market in Numbers

LIMRA's final 2025 figures put US retail annuity sales at $464.1 billion, up 7%: fixed-rate deferred $165.3 billion (+6%), fixed indexed $127.9 billion (+1%, a record), registered index-linked $79.5 billion (+20%, a record), traditional variable $63.1 billion (+8%), single premium immediate $14.4 billion (+6%) and deferred income $4.8 billion (−3%). NAIC's 2025 market share data, on direct premium including group and institutional business, puts industry annuity premium at $618.27 billion, led by Apollo's Athene (5.93%), New York Life (5.42%), Nationwide (4.85%), MassMutual (4.67%), AIG's Corebridge (4.65%), Prudential (4.22%), Equitable (4.06%), Lincoln (3.87%), Jackson (3.72%) and Allianz (3.65%); the top 25 wrote 79.87%.

## The Anatomy of an Annuity

Every annuity record has the same parties and two phases:

- **Owner** (who controls the contract and pays tax on it), **annuitant** (whose life measures the payments and, on many contracts, triggers the death benefit) and **beneficiary**. They can be three different people, and the tax rules key off the owner (26 USC 72(s) requires distribution after the holder's death).
- **Accumulation phase**: premiums in, crediting, withdrawals, charges, riders. The value is an account value in `policy_values`.
- **Payout phase**: on **annuitization** the account (or a single premium) converts to a stream of payments for a period or for life, and the account value disappears into a payment schedule. A rider can also produce lifetime withdrawals while the account stays in accumulation.
- **Qualified or nonqualified.** An annuity inside an IRA or a retirement plan is "qualified" and follows the account's tax rules ([Retirement Accounts](/books/investing-and-digital-assets/retirement-accounts#traditional-and-roth-iras)); a nonqualified annuity bought with after-tax money follows section 72 directly. The contract is the same; the tax lot and reporting are not.

## Fixed and Multi-Year Guaranteed Annuities

A **fixed deferred annuity** credits a declared rate, guaranteed for a period and then reset by the insurer at or above the contract minimum. A **multi-year guaranteed annuity (MYGA)** guarantees one rate for the whole surrender charge period, three to ten years, which makes it the insurance equivalent of a certificate of deposit with tax deferral and, usually, an MVA. The data is a rate declaration per guarantee period, the guarantee period's start and end, and the account value; the interest is credited daily or on anniversaries by the contract's method. At the end of the guarantee period the contract opens a **window** to withdraw without charge or renew into a new period at the then-current rate, which the system has to notice in advance and track to its last day.

## Fixed Indexed Annuities

A fixed indexed annuity (FIA) is a fixed annuity whose interest is computed from an external index, usually over one-year **crediting terms**, with a floor that is usually 0%, so the owner never loses principal to the index (fees and surrender charges are another matter). Athene's 10-K describes an FIA as earning "interest at a crediting rate based on a specified index." Each strategy has non-guaranteed **crediting parameters** the insurer resets each term within contract minimums: a **cap** (the maximum credit), a **participation rate** (the share of the index change credited), a **spread** or margin (subtracted from the change), and sometimes a **trigger** rate (a fixed credit if the index is flat or up). Most FIA indexes are price indexes, and many newer ones are volatility-controlled custom indexes built for the product.

**Worked numbers: one crediting term, three strategies.** Mine: $100,000 allocated at the start of a one-year annual point-to-point term; the index starts the term at 5,000.00 and ends at 5,600.00, a 12.00% change.

| Strategy | Parameters | Formula | Credit | Amount |
| --- | --- | --- | ---: | ---: |
| Cap | 8.00% cap, 100% participation, 0% floor | min(12.00%, 8.00%) | 8.00% | $8,000.00 |
| Participation | 45% participation, no cap | 12.00% × 45% | 5.40% | $5,400.00 |
| Spread | 4.00% spread, no cap | 12.00% − 4.00% | 8.00% | $8,000.00 |
| Any of them, index down 10% | 0% floor | max(−10.00%, 0%) | 0.00% | $0.00 |

The credit posts on the term's end date; nothing is credited midterm, so a withdrawal before the term ends usually forfeits the index credit on the amount withdrawn. The data model needs each **segment** (amount, strategy, start date, start index value, locked parameters) as its own holding inside the account value, the published index value on each segment's start and end date from a defined source and time, and the declared parameters for each new term. Insurers fund the credit by buying options with the "hedge budget" from the general account's yield, which is why caps fall when interest rates fall: Jackson's 10-K describes hedging FIA index crediting in the same program as its VA guarantees.

FIAs are insurance, not securities, so their sales follow the state best-interest rule, and their disclosure follows Model #245, which requires an FIA disclosure document to explain the crediting elements (participation rates, caps, spreads) and limits what an FIA illustration may show ([Illustrations](/books/insurance/illustrations#annuity-illustrations-under-model-245)).

## Registered Index-Linked Annuities

A registered index-linked annuity (RILA) trades the FIA's 0% floor for higher upside: the owner accepts some loss in exchange for a higher cap or participation. Downside protection is either a **buffer** (the insurer absorbs the first loss, say 10%; the owner takes losses beyond it) or a **floor** (the owner takes losses up to, say, 10%; the insurer absorbs the rest). Because the owner can lose principal, a RILA is a security: it is registered with the SEC and sold under a prospectus by FINRA members. Empower's prospectus works both: a 5% cap on a 10% index gain credits 5%, and a −10% buffer on a −25% index change credits −15%. A floor of −10% on the same −25% would credit −10%.

RILAs also need an **interim value**: a segment's value on any day before its end date, used for withdrawals, surrenders, death benefits and annuitization midterm. It is computed from a formula in the prospectus that approximates the fair value of the segment's embedded options (Empower's is built from a "Strategy Interest MVA Factor and the Strategy Index MVA Factor," the latter zero on a term end date), so the system needs market inputs (index level, volatility, rates) each day for every open segment, not just on term end dates. A $100,000 allocation surrendered before its term ends could lose "up to $90,000 or more," Empower's prospectus warns, and RiverSource's warns of a loss of up to 100% of the amount invested from a negative MVA. Those numbers are in the prospectus because the interim value can be far from the segment's starting value.

## Variable Annuities

A variable annuity (VA) holds the account in **separate account subaccounts** the owner chooses, so the account value moves with the funds and the owner bears the investment risk, net of the contract's mortality and expense charge, administrative charges and fund expenses. VAs are securities: SEC-registered, sold by FINRA members under FINRA Rule 2330 for deferred VAs, with a prospectus. The insurance part is the guarantees, sold as riders:

- **Guaranteed minimum death benefit (GMDB).** The death benefit is at least the premiums paid less withdrawals, or a ratchet (the highest anniversary value) or a roll-up (premiums grown at a stated rate); Jackson's enhanced GMDB covers 10% of its VA account value.
- **Guaranteed lifetime withdrawal benefit (GLWB, Jackson's GMWB for Life).** A **benefit base** (a notional amount, not cash) that grows by roll-ups or step-ups, and a withdrawal percentage by age that the owner may take every year for life even if the account value reaches zero. Jackson's 72% of VA account value with GMWB for Life shows how central these riders are.
- **Guaranteed minimum accumulation or income benefits** (GMAB, GMIB), older designs that guarantee an account value at a date or an annuitization basis.

Each rider adds a charge (usually a percentage of the benefit base, taken quarterly or annually) and a shadow value the system computes every day or anniversary alongside the account. The insurer's liability is the difference between what the guarantee will pay and what the account will cover, which depends on markets and on how owners behave: whether they withdraw at the guaranteed rate, more, or not at all. That's why VA guarantees are reserved under VM-21 stochastically and hedged ([VM-21 and VM-22](/books/insurance/life-reserves-and-capital#vm-21-and-vm-22-annuities)), and why Jackson reinsures them to a captive.

## Income Annuities

A **single premium immediate annuity (SPIA)** converts a premium into payments starting within a year, for life, for a period certain, or for life with a period certain or a cash refund. A **deferred income annuity (DIA)** starts payments years later. There is no account value: the record is the premium, the payment schedule, the lives it depends on, and the remaining guaranteed payments. For a nonqualified SPIA, each payment is part return of premium and part income: section 72(b) excludes the share of each payment equal to the "investment in the contract" over the "expected return," until the investment is recovered. A $100,000 life annuity for a 70-year-old paying $7,000 a year with an expected return (from the IRS tables) of $119,000 would exclude 100,000 / 119,000 = 84.0% of each payment, $5,882.35, as return of basis until $100,000 has been excluded; that example is mine and the expected return is assumed, not taken from the tables. Pension risk transfer buy-outs are group SPIAs at scale ([Life Reserves, Capital & Private Equity](/books/insurance/life-reserves-and-capital) covers [pension risk transfer](/books/insurance/life-reserves-and-capital#pension-risk-transfer)).

## Surrender Charges, Free Withdrawals and MVAs

Deferred annuities charge for early exit in two ways that often stack:

- **Surrender (withdrawal) charge.** A declining percentage of the amount withdrawn above the free amount, by contract year since issue (or since each premium): Empower's starts at 7% and declines to zero. Florida caps surrender charges on annuities issued to consumers 65 or older at 10% and bars any charge after the 10th policy year (Fla. Stat. 627.4554(9)).
- **Free withdrawal amount.** A share that can be taken each year without a charge: Empower's is 10% of the remaining purchase payment, $10,000 on $100,000.
- **Market value adjustment (MVA).** A positive or negative adjustment that passes the change in interest rates since issue through to the owner who leaves before the guarantee period ends: if rates have risen, the insurer's bonds are worth less and the adjustment is negative; if rates have fallen, positive. Union Security's formula is `[(1+i)/(1+j+.0025)]^(N/12) − 1`, with i the guaranteed rate, j the current rate for a new guarantee of the remaining length, N the months remaining and 0.25% a fixed spread; its MVA doesn't apply within 15 days of the guarantee period's end.

**Worked numbers: surrendering a MYGA early.** Mine, on an illustrative contract that applies the MVA first and then the surrender charge: $100,000 single premium in a five-year MYGA guaranteeing 5.00%, with a surrender charge of 8%, 7%, 6%, 5% and 4% in contract years 1 to 5 and the Union Security MVA formula. The owner surrenders at the start of contract year 4, with 24 months left, when the insurer's two-year rate is 6.00%.

| Step | Calculation | Amount |
| --- | --- | ---: |
| Account value after three years | 100,000 × 1.05³ | $115,762.50 |
| MVA factor | (1.05 / (1 + 0.06 + 0.0025))^(24/12) − 1 = (0.988235)² − 1 | −2.3391% |
| MVA | 115,762.50 × −0.023391 | −$2,707.80 |
| Adjusted value | | $113,054.70 |
| Surrender charge, year 4 | 113,054.70 × 5% | −$5,652.74 |
| Cash surrender value | | **$107,401.96** |

Had rates fallen to 3.00% instead, the factor would be (1.05 / 1.0325)² − 1 = +3.4186%, an MVA of +$3,957.41, and the owner would get more than the account value before the surrender charge. A partial withdrawal within the 10% free amount would take neither charge on many contracts, while the MVA may still apply; which charges apply to which dollars, and in what order, is a contract term the system has to encode per product, not a convention.

## The Nonforfeiture Floor

However the charges stack, a deferred annuity's cash surrender value can't fall below the minimum the Standard Nonforfeiture Law for Individual Deferred Annuities (Model #805, Fall 2020) sets. The **minimum nonforfeiture amount** is 87.5% of gross considerations accumulated at the nonforfeiture rate, less prior withdrawals, an annual contract charge of $50, premium tax the company paid and any loan, all accumulated at the same rate (Section 4A). The rate is the lesser of 3% and the five-year Constant Maturity Treasury rate reduced by 125 basis points, but not below 0.15%, fixed for an initial period and redeterminable (4B); for contracts with substantive equity index participation, the reduction may be up to 100 basis points larger if the present value of the extra reduction doesn't exceed the market value of the index benefit (4C). Cash surrender value before maturity must be at least the present value of the paid-up maturity value, discounted at no more than 1% above the contract's accumulation rate (Section 6), which is the statutory ceiling on how hard an MVA can bite.

For the worked MYGA, with a nonforfeiture rate of 1.00%: 87,500 × 1.01³ − 50 × (1.01³ + 1.01² + 1.01) = 90,151.34 − 153.02 = $89,998.32. The $107,401.96 cash value clears it easily, as it does in almost every real case; the floor binds for contracts with high early charges, low guaranteed rates and an early surrender, and the system must compute it on every surrender and pay the greater.

## Free Look

Every annuity and life policy can be returned within a free look period for a refund. The period depends on the rule that applies, and several can stack:

| Rule | Period | Refund |
| --- | --- | --- |
| Model #245 (annuity disclosure), when the disclosure document and Buyer's Guide weren't given at or before application | No less than 15 days, running concurrently with other free looks | Per state law |
| Model #613 (replacements), replacing insurer | 30 days from delivery | All premiums, or for variable and MVA contracts the cash surrender value plus fees and charges deducted |
| California Ins. Code 10127.10, owners 60 or older | No less than 30 days | Full refund on nonvariable products; for variable, premium if it stayed in a fixed or money market option during the period, else account value plus fees |
| N.Y. Ins. Law 3203(a)(11), individual life | 10 to 30 days from delivery; 30 days for mail order | Premium refund |
| Prospectuses (RiverSource, Gainbridge) | 10 days, longer where state law requires | Contract value, which can be more or less than premium, unless state law requires premium |

The system has to compute the free look end date per contract from the delivery date (so delivery has to be recorded, with proof, in `documents`), the owner's age and state, whether it's a replacement and whether disclosure was late, apply the most generous, and know whether the refund is premium or value. A California senior's variable annuity also changes where the premium may be invested during the period: in fixed income and money market funds unless the owner directs otherwise (10127.10).

## Registered Products and the SEC and FINRA Overlay

Variable annuities, RILAs and variable life are both insurance contracts and securities. The insurance side, the contract form, the state filing, nonforfeiture, the free look, the insurer's solvency, stays with the state; the securities side adds SEC registration and prospectus delivery, a FINRA-registered representative and broker-dealer, Regulation Best Interest for recommendations to retail customers, and FINRA Rule 2330 for deferred VAs: a reasonable basis that the customer has been told of surrender charges, the tax penalty before 59½, fees and market risk; for exchanges, attention to whether the customer had another deferred VA exchange in the preceding 36 months; and principal review no later than seven business days after the supervising office receives a complete application. [Investing & Digital Assets](/books/investing-and-digital-assets/advice-and-conduct#regulation-best-interest) owns Regulation Best Interest and the broker-dealer's conduct; [Best Interest, Replacements & 1035 Exchanges](/books/insurance/annuity-best-interest) covers how the state rule's safe harbor leans on it. In the data, a registered product carries its SEC registration (file number, prospectus version delivered), the broker-dealer and registered representative on the sale, and the principal approval with its timestamp.

## Death of the Owner

An annuity's death benefit is the greater of the account value and any GMDB, paid to the beneficiary, and the tax code limits how long the beneficiary may defer it: if the holder dies before the annuity starting date, the entire interest must be distributed within five years of death, unless a designated beneficiary takes it over life or life expectancy starting within one year, and a surviving spouse may be treated as the holder and continue the contract (26 USC 72(s)). If the holder dies after payments start, the remaining interest must be paid at least as quickly as the method in use. The system needs the owner's and annuitant's dates of death, the beneficiary's election and its deadline, and a spousal continuation transaction that changes the owner without ending the contract.

## How to Build It

Annuities use the core model's `products`, `policies`, `policy_versions`, `coverages` and `party_roles` (owner, annuitant, beneficiary), and [Life Products as Data](/books/insurance/life-products#how-to-build-it)'s `policy_values` and `policy_value_segments` for the account and its segments. This chapter adds `riders` for the guarantees, which carry state of their own (a benefit base, a withdrawal percentage, an election date), and `surrender_schedules` for the exit charges, versioned with the product filing:

```sql
CREATE TABLE riders (                      -- a guarantee with its own state
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_id          UUID NOT NULL REFERENCES policies (id),
  coverage_id        UUID NOT NULL REFERENCES coverages (id),  -- code and charge
  kind               TEXT NOT NULL CHECK (kind IN ('gmdb_return_of_premium',
                       'gmdb_ratchet', 'gmdb_rollup', 'glwb', 'gmwb', 'gmab', 'gmib',
                       'waiver_of_surrender', 'nursing_home', 'income_enhancement',
                       'waiver_of_premium', 'accidental_death', 'accelerated_death',
                       'ltc', 'child_term', 'guaranteed_insurability', 'term')),
  elected_on         DATE NOT NULL,
  terminated_on      DATE,
  charge_basis       TEXT CHECK (charge_basis IN ('account_value', 'benefit_base',
                       'face', 'premium', 'flat')),
  charge_bp          INT,                   -- current charge; maximum is in the filing
  terms              JSONB NOT NULL         -- roll-up rate, ratchet dates, age bands
);

CREATE TABLE rider_values (                -- benefit base and guarantee state by date
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  rider_id           UUID NOT NULL REFERENCES riders (id),
  policy_value_id    UUID REFERENCES policy_values (id),  -- the account row it pairs with
  as_of              DATE NOT NULL,
  benefit_base       BIGINT,                -- notional, never paid as cash
  withdrawal_rate_bp INT,                   -- lifetime percentage locked at first withdrawal
  annual_allowance   BIGINT,
  taken_this_year    BIGINT NOT NULL DEFAULT 0,
  excess_withdrawal  BOOLEAN NOT NULL DEFAULT FALSE,  -- reduces the base pro rata
  charge_taken       BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE surrender_schedules (         -- exit charges as filed, per product version
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  product_id         UUID NOT NULL REFERENCES products (id),
  basis              TEXT NOT NULL CHECK (basis IN ('contract_year', 'premium_year')),
  charges_bp         INT[] NOT NULL,        -- {800,700,600,500,400}
  free_withdrawal    JSONB NOT NULL,        -- {"pct_bp":1000,"of":"remaining_premium"}
  mva                JSONB,                 -- {"formula":"union_2025","spread_bp":25,
                                            --  "exempt_days_from_end":15}
  order_of_charges   TEXT[] NOT NULL,       -- {'mva','surrender_charge'}
  state_overrides    JSONB NOT NULL DEFAULT '{}',  -- FL 65+: cap 10%, none after year 10
  nonforfeiture      JSONB NOT NULL         -- {"pct_bp":8750,"rate_rule":"cmt5_less_125",
                                            --  "floor_bp":15,"cap_bp":300,"charge":5000}
);
```

A surrender quote then runs the same steps as the worked example: value as of the date (including the interim value for open RILA segments), MVA, surrender charge net of the free amount, state overrides, and the nonforfeiture floor, and records every step on the `policy_values` row for event `surrender`. The index credit at a segment's end is small enough to share across FIA, IUL and RILA products:

```go tab="Go"
// IndexCredit returns the credit rate in basis points for one segment term.
// change is the index change in basis points (1200 = +12.00%). Caps, spreads
// and floors are basis points; participation is basis points of the change.
type Crediting struct {
	CapBP, SpreadBP, ParticipationBP int64
	FloorBP                          int64 // 0 for an FIA; -1000 for a 10% RILA floor
	BufferBP                         int64 // 1000 for a 10% buffer; 0 if none
	HasCap                           bool
}

func IndexCredit(change int64, c Crediting) int64 {
	if change < 0 {
		if c.BufferBP > 0 { // insurer absorbs the first BufferBP of loss
			loss := change + c.BufferBP
			if loss > 0 {
				return 0
			}
			return loss
		}
		if change < c.FloorBP {
			return c.FloorBP
		}
		return change
	}
	credit := change * c.ParticipationBP / 10_000
	credit -= c.SpreadBP
	if credit < 0 {
		credit = 0
	}
	if c.HasCap && credit > c.CapBP {
		credit = c.CapBP
	}
	return credit
}
```

```rust tab="Rust"
/// Credit rate in basis points for one segment term; change is the index change in bp.
pub struct Crediting {
    pub cap_bp: Option<i64>, pub spread_bp: i64, pub participation_bp: i64,
    pub floor_bp: i64,  // 0 for an FIA; -1000 for a 10% RILA floor
    pub buffer_bp: i64, // 1000 for a 10% buffer; 0 if none
}

pub fn index_credit(change: i64, c: &Crediting) -> i64 {
    if change < 0 {
        if c.buffer_bp > 0 {
            return (change + c.buffer_bp).min(0);
        }
        return change.max(c.floor_bp);
    }
    let credit = (change * c.participation_bp / 10_000 - c.spread_bp).max(0);
    match c.cap_bp { Some(cap) => credit.min(cap), None => credit }
}
```

On the worked FIA, a 1,200 basis point change returns 800 under the cap strategy, 540 under 45% participation and 800 under a 400 basis point spread; on Empower's RILA examples, a −2,500 change with a 1,000 buffer returns −1,500, and a 1,000 change with a 500 cap returns 500. The index values themselves need their own table of published closes by index and date, with the source and the time each was captured, because a segment's credit is only as defensible as its start and end values.

## Auditing

- **Every credit from its inputs.** For each segment term, the start and end index values with source, the locked parameters, the formula version and the credit, so a disputed credit can be rebuilt; for RILAs, the daily interim value inputs for any midterm event.
- **Declared parameters against minimums.** Every cap, participation rate and declared rate at or above the contract's guaranteed minimum, with the declaration date and who approved it.
- **Surrender math step by step.** MVA, charge, free amount, state override and nonforfeiture floor for every surrender and withdrawal, because the floor and the senior caps are what examiners test.
- **Free look end dates and refunds.** The rule chosen, the delivery proof and whether premium or value was refunded.
- **Rider bases.** The benefit base history with each roll-up, step-up and excess withdrawal adjustment, because a GLWB owner who outlives the account is owed exactly what the base says.
- **Registered sales.** Prospectus version delivered, representative, broker-dealer and principal approval time for every registered product.

## What This Means for the System You Build

- **Model the account and the guarantees separately:** account value in `policy_values`, rider state (benefit bases, allowances) in `rider_values`, both by date.
- **Carry each index segment as a holding** with locked parameters and start values, and keep a table of index closes with sources.
- **Encode surrender charges, free amounts, MVAs, their order and state overrides per product version,** then compute the nonforfeiture floor on every surrender and pay the greater.
- **Compute the free look per contract** from delivery proof, age, state, replacement status and disclosure timing, and refund premium or value as the rule says.
- **Flag registered products** and keep the securities facts (prospectus, broker-dealer, principal review) on the sale, linking to the Investing model rather than duplicating it.
- **Record owner, annuitant and beneficiary separately,** with the death-of-holder clock and spousal continuation as transactions.

## References

**Law and regulation**

- [26 USC 72](https://www.law.cornell.edu/uscode/text/26/72), the exclusion ratio for annuity payments and the distribution requirements on the death of the holder, including the five-year rule, the one-year life expectancy exception and spousal continuation
- [Cal. Ins. Code 10127.10 (FindLaw)](https://codes.findlaw.com/ca/insurance-code/ins-sect-10127-10/), the 30-day free look for owners 60 or older and its refund and investment rules
- [Fla. Stat. 627.4554](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.4554.html), the 10% surrender charge cap and the ban on charges after the 10th year for consumers 65 or older
- [N.Y. Ins. Law 3203](https://www.nysenate.gov/legislation/laws/ISC/3203), the 10 to 30 day free look on individual life policies

**NAIC**

- [NAIC: Standard Nonforfeiture Law for Individual Deferred Annuities (#805), Fall 2020 (PDF)](https://content.naic.org/sites/default/files/model-law-805.pdf), the 87.5% minimum nonforfeiture amount, the $50 contract charge, the interest rate rule and the cash surrender value present value limit
- [NAIC: Annuity Disclosure Model Regulation (#245), Summer 2021 (PDF)](https://content.naic.org/sites/default/files/model-law-245.pdf), the 15-day free look when disclosure is late and the FIA disclosure of crediting elements
- [NAIC: Life Insurance and Annuities Replacement Model Regulation (#613), 2nd Quarter 2015 (PDF)](https://content.naic.org/sites/default/files/model-law-613.pdf), the 30-day right to return on replacements and the refund for variable and MVA contracts
- [NAIC: 2025 Life and Fraternal Market Share Report (PDF)](https://content.naic.org/sites/default/files/research-actuarial-life-fraternal-market-share.pdf), 2025 direct annuity premium of $618.27 billion and the top groups

**Regulators and guidance**

- [FINRA Rule 2330](https://www.finra.org/rules-guidance/rulebooks/finra-rules/2330), deferred variable annuity recommendations, the 36-month exchange question and principal review within seven business days

**Filings**

- [Athene: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1527469/000152746926000013/ahl-20251231.htm), ownership by Apollo, its product types and the FIA definition
- [F&G: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1934850/000193485026000026/fg-20251231.htm), 2025 gross sales and mix, sales by channel and the Blackstone investment management agreement
- [Jackson Financial: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1822993/000182299326000022/jxn-20251231.htm), VA rider elections, Brooke Re, the hedging program and 2025 retail annuity sales
- [Empower: Great-West Capital Choice RILA prospectus (Form 497VPU, April 2026)](https://www.sec.gov/Archives/edgar/data/2102244/000110465926046071/tm2532610d12_497vpu.htm), the free withdrawal amount, withdrawal charge, MVA components, and cap and buffer examples
- [Gainbridge: OneUp RILA prospectus, May 1, 2025 (Form POS AM)](https://www.sec.gov/Archives/edgar/data/1938470/000119312525083926/d925173dposam.htm), the 10-day right to cancel, the 1.00% fixed strategy minimum and the six-year withdrawal charge period
- [RiverSource: Structured Solutions 2 prospectus (Form 485BPOS, April 2026)](https://www.sec.gov/Archives/edgar/data/727892/000119312526187937/d139193d485bpos.htm), the 10-day free look and MVA behavior
- [Union Security Insurance Company: variable annuity prospectus (Form 497, May 2025)](https://www.sec.gov/Archives/edgar/data/823533/000162828025021217/masuscombo.htm), the MVA formula with the 0.0025 spread and the 15-day exemption

**In practice**

- [LIMRA: U.S. retail annuity sales totaled $464.1 billion in 2025, March 23, 2026](https://www.limra.com/en/newsroom/news-releases/2026/limra-final-u.s.-retail-annuity-sales-set-new-sales-high-totaling-$464.1-billion-in-2025/), sales by product type and growth
