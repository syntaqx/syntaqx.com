+++
title = "Life Reserves, Capital & Private Equity"
nav_title = "Reserves & Capital"
description = "PBR and the Valuation Manual (VM-20, VM-21, VM-22), AG 55, life reinsurance, asset-manager-owned insurers, Bermuda, sidecars and pension risk transfer."
category = "Insurance Industry"
order = 2765
part = "Life and Annuities"
tags = ["insurance", "life-insurance", "reserves", "pbr", "reinsurance", "private-equity"]
+++

A life insurer's balance sheet is mostly promises with long dates. NAIC counted $10.0 trillion of admitted assets and $540.7 billion of capital and surplus for the life industry at the end of 2025: almost everything else is reserves, the statutory liability for benefits that will be paid over decades. How those reserves are computed decides how much capital an insurer needs, how much it can pay in dividends, and how attractive its blocks are to someone else's balance sheet. For most of the industry's history, statutory reserves were formulas with prescribed mortality tables and interest rates. Since 2017, the NAIC's Valuation Manual has moved them toward **principle-based reserving** (PBR): the reserve is the higher of a prescribed floor and a reserve modeled over many economic scenarios using the company's own experience, for life insurance (VM-20), variable annuities (VM-21) and, from 2026, non-variable annuities (VM-22).

The same years brought new owners. Private equity and alternative asset managers bought or built annuity writers, invested their general accounts in private credit they originate, and reinsured blocks to affiliated or partnered reinsurers in Bermuda and the Cayman Islands, where reserving and capital rules differ. Regulators answered with asset adequacy testing for those reinsurance deals (AG 55), new economic scenarios, higher capital charges for riskier assets, and conditions on acquisitions, while the Federal Insurance Office monitors the flow offshore. This chapter covers the reserves (the Valuation Manual and each VM section's mechanics with worked numbers), asset adequacy testing and AG 55, life reinsurance forms, asset-manager ownership, offshore reinsurance and sidecars, pension risk transfer, and the regulatory response, with the `reserve_valuations` table against the core model's `policies` and the reinsurance contracts defined in [Reinsurance Structures](/books/insurance/reinsurance-structures#how-to-build-it).

## How the Platforms Do It

What life and annuity groups disclose about their reserves, reinsurance and capital, as of November 2026:

| Company | Structure | What its public material shows |
| --- | --- | --- |
| **Athene** | Owned by Apollo; Bermuda reinsurance subsidiaries | All 203,805 common shares held by Apollo Global Management (as of February 23, 2026), which is its investment manager; Bermuda subsidiaries Athene Annuity Re, Athene Life Re and Athene Life Re International; ACRA 1 and ACRA 2 co-invest reinsurance vehicles with third-party investors; Bermuda statements apply US statutory principles for policyholder reserves, and consolidated RBC is "approximately 20 RBC points higher" than on a US basis (2025 10-K) |
| **F&G** | Majority owned by Fidelity National Financial; investment manager Blackstone | FNF retained about 70% after distributing about 12% on December 31, 2025; Blackstone ISG-I Advisors handles idea generation and security selection under a long-term relationship that "limits our ability to terminate" it without BIS's consent (2025 10-K) |
| **Jackson** | Captive reinsurance of VA guarantees | Optional benefit risks reinsured to Brooke Life Reinsurance Company, a wholly owned Michigan captive; RBC ratio 567% at the end of 2025; closed life and annuity blocks of 1.3 million policies and $20.1 billion of reserves (2025 10-K) |
| **Primerica** | Term mortality reinsurance | 80% to 90% of term mortality reinsured on a first-dollar quota share YRT basis (2025 10-K) |
| **Unum** | Closed long-term care block | The Closed Block, mainly LTC, was 7.6% of 2025 premium (2025 10-K) |

Three patterns. **Reinsurance is how the balance sheet is managed,** not only how risk is shared: YRT for mortality, coinsurance and modified coinsurance for asset-intensive blocks, captives for guarantees. **Where the reinsurer sits changes the capital,** which is why Athene reports a 20-point RBC difference between bases. **Ownership and investment management are linked,** because the business model of an asset-manager-owned insurer is the spread between what the general account earns and what the annuities credit.

## From Formulas to Principle-Based Reserves

Statutory reserves under the Standard Valuation Law (Model #820) were historically formulaic: the Commissioners Reserve Valuation Method (CRVM) for life insurance and the Commissioners Annuity Reserve Valuation Method (CARVM) for annuities, computed with a prescribed mortality table and valuation interest rate. They are conservative by design but blunt: the same formula for every company, regardless of what it actually sells or how its policyholders behave, and slow to recognize products whose risks are in the scenarios rather than the averages (secondary guarantees, VA riders).

The **Valuation Manual** became operative on January 1, 2017, after all accredited states revised their Standard Valuation Laws, and PBR became an accreditation standard on January 1, 2020. Under PBR, insurers hold the higher of a minimum reserve based on prescribed assumptions and a reserve that reflects a range of future economic conditions and the insurer's own experience (mortality, policyholder behavior, expenses). A new **generator of economic scenarios (GOES)** took effect in January 2026 across all PBR frameworks. The Valuation Manual is republished each year: the 2026 edition is current, and the 2027 edition, effective January 1, 2027, is posted with its redline and the plenary-adopted amendments.

## VM-20: Life

VM-20 sets the minimum reserve for individual life policies issued on or after the Valuation Manual's operative date, and it constitutes CRVM for them (VM-20 Section 1A). Group life certificates fall under it too when the group used an individual risk selection process (an application beyond group membership, sex, age and tobacco, health questions, prescription history or fluids), charges premiums on that individual classification, and is designed and priced like individual insurance (1B); the guidance note excludes groups where only some members go through evidence of insurability.

Policies fall into three **reserving categories**: the **Term** category (term policies and riders, and YRT reinsurance assumed on coverage that would be valued under VM-20), the **ULSG** category (universal life with secondary guarantees, including after the guarantee period ends, excluding extended term and reduced paid-up), and **All Other** (Section II definitions). For each, three reserves:

- **Net premium reserve (NPR)**: a formulaic reserve, seriatim per policy, with prescribed assumptions (Section 3). It is the floor.
- **Deterministic reserve (DR)**: the present value of projected cash flows on one prescribed economic scenario, with the company's prudent estimate assumptions (Section 4).
- **Stochastic reserve (SR)**: the result of a cash-flow model run over the economic scenarios, taking the conditional tail expectation of the scenario results (Section 5).

The minimum reserve for a group of policies that runs all three is the sum of the policy NPRs plus the excess, if any, of the greater of the DR and the SR over the NPRs less any due and deferred premium asset (VM-20 2A). A company may exclude groups of policies from the SR or DR if they pass the **stochastic exclusion test** or **deterministic exclusion test** (Section 6), in which case the NPR alone applies to them.

**Worked numbers: a VM-20 minimum reserve.** Mine: a block of ULSG policies with NPRs summing to $100 million, a DR of $92 million and an SR of $110 million, and no due and deferred premium. The greater of DR and SR is $110 million, which exceeds the NPR by $10 million, so the minimum reserve is 100 + 10 = $110 million. If the SR were $95 million, the greater of DR and SR ($95 million) wouldn't exceed the NPR, and the reserve would be the $100 million NPR. The NPR is the floor; the modeled reserves only ever add.

## VM-21 and VM-22: Annuities

**VM-21** sets the minimum reserve for variable annuities issued on or after the operative date, as CARVM, and contracts under the older Actuarial Guideline XLIII (AG 43) may be aggregated with them (VM-21 Section 1A). Its stochastic reserve is a cash-flow projection over equity return and interest rate scenarios, finding for each scenario "the greatest present value of accumulated deficiency," with the reserve set by the CTE measure; the projections are the same ones used for the VA risk-based capital requirement. Hedging enters through the projection, which is why Jackson's dynamic hedging program and its captive are reserve topics as much as risk topics.

**VM-22** sets PBR for non-variable annuities (fixed, fixed indexed, income and some group pension contracts) as CARVM, and in some cases CRVM, and "apply for valuation dates on or after January 1, 2026." For business issued in the first three years after that date, a company may elect to keep using the older VM-A, VM-C, VM-M and VM-V requirements, but once it applies VM-22 to a block it must continue, and VM-22 applies to all applicable business prospectively three years after the effective date. The NAIC describes the result as a three-year phase-in, mandatory for all new issues from January 2029.

**Worked numbers: a CTE 70.** The Valuation Manual describes the measure: "CTE 70 is the average of the highest 30% modeled outcomes." Mine: ten scenario reserves for a block, in millions: 112, 95, 130, 101, 88, 140, 99, 120, 105, 93. Sorted from highest, the top 30% are 140, 130 and 120; their average, $130 million, is the CTE 70, against a mean of $108.3 million. Real runs use hundreds or thousands of GOES scenarios, but the measure is the same: the reserve is set by the bad tail, not the average.

## Asset Adequacy Testing and AG 55

Each year the appointed actuary also opines on whether reserves are adequate given the assets backing them, under the Valuation Manual's VM-30 actuarial opinion and memorandum requirements; cash-flow testing is the method, and the one AG 55 requires for the deals it covers. **Actuarial Guideline LV (AG 55)** extends asset adequacy testing to the reinsurance deals regulators worried about. LATF adopted it on June 5, 2025, the Life Insurance and Annuities (A) Committee on July 14 and the NAIC Executive Committee and Plenary on August 13, 2025, with the first reports due to domestic regulators on April 1, 2026, annually after that (Mayer Brown, August 25, 2025). The NAIC posted the 2026 year-end guidance and templates on October 29, 2026.

AG 55 covers transactions established on or after January 1, 2016 that ceded reserves (or modified coinsurance reserves) above **$5 billion**, or above **$1 billion and 5%**, **$500 million and 10%**, or **$100 million and 20%** of the ceding company's reserve base, plus any transaction, of any date, that the appointed actuary finds creates significant collectability risk. In-scope transactions need cash-flow testing and an **attribution analysis** estimating how much of the reserve reduction from the pre-reinsurance to the post-reinsurance basis comes from differences in key assumptions. Transactions ceded to reinsurers that file a VM-30 memorandum are out of scope; waivers exist for some 2016 to 2019 transactions. It starts as **disclosure only**: domestic regulators may act on results, and LATF planned to reassess after the first year of data.

**Worked numbers: is the deal in scope?** Mine: a cedent with a $20 billion reserve base reinsured a fixed annuity block in 2021, taking $1.2 billion of reserve credit: 1.2 / 20 = 6%, so it exceeds $1 billion and 5% and is in scope. A 2018 deal ceding $600 million of a $24 billion base (2.5%) fails every threshold and is out of scope, unless the appointed actuary finds significant collectability risk, and a 2018 deal in scope may qualify for a cash-flow testing waiver but still needs the attribution analysis unless the risks are shown immaterial.

## Life Reinsurance

Life reinsurance comes in a handful of forms, each with a different effect on the cedent's balance sheet:

- **Yearly renewable term (YRT).** The reinsurer takes a share of the net amount at risk for a yearly premium per thousand; the cedent keeps the reserves and the cash value. Primerica's first-dollar quota share YRT on 80% to 90% of its term mortality is the textbook use: mortality risk shared, reserves and investments retained.
- **Coinsurance.** The reinsurer takes a proportional share of everything (premiums, benefits, reserves) and receives the assets backing its share of the reserves. The cedent takes reserve credit.
- **Modified coinsurance (modco).** The reinsurer takes a proportional share of the risk, but the cedent keeps the assets and the reserves; a **modco reserve adjustment** each period passes the investment results on those assets to the reinsurer.
- **Funds withheld coinsurance.** Coinsurance in which the cedent withholds the assets and holds a funds-withheld liability to the reinsurer, so the reinsurer's credit risk is reduced.
- **Block and flow.** Athene's 10-K defines **block reinsurance** as ceding "all or a portion of a block of previously issued annuity or life contracts" and **flow reinsurance** as ceding "a portion of newly issued policies to the reinsurer." Block deals reshape an in-force balance sheet in one transaction; flow deals cede every new policy as it's written.
- **Captives.** An affiliated reinsurer, often licensed under a captive law, that takes specific risks (Jackson's Brooke Re for VA guarantees) under the captive's own reserving and capital rules, which can differ from the cedent's.

**Worked numbers: what each form does to the cedent.** Mine: a cedent with $10 billion of fixed annuity reserves backed by $10.4 billion of assets cedes 80% of the block.

| Form | Cedent's reserves after | Cedent's assets after | Reserve credit | What flows each period |
| --- | ---: | ---: | ---: | --- |
| Coinsurance | $2.0B net | about $2.08B (transfers about $8.32B) | $8.0B | 80% of premiums, benefits and expenses |
| Modified coinsurance | $10.0B (keeps them) | $10.4B (keeps them) | none on the reserve line; the share is in the modco adjustment | 80% of cash flows plus the modco reserve adjustment on investment results |
| Funds withheld | $2.0B net, plus an $8.0B funds-withheld liability | $10.4B (keeps them) | $8.0B | 80% of cash flows; investment results on withheld assets credited to the reinsurer |

The cedent's credit for reinsurance on a non-US reinsurer depends on its collateral or the reinsurer's jurisdiction status, which is [Reinsurance Operations](/books/insurance/reinsurance-operations#credit-for-reinsurance)' subject; AG 55's thresholds are measured on exactly the reserve credit column.

## Asset Managers and Life Insurers

NAIC's 2025 market share data shows four of the top 22 annuity writers owned by or affiliated with alternative asset managers: Apollo's Athene ($36.69 billion, first), Brookfield Wealth Solutions (16th), KKR's Global Atlantic (20th) and Fidelity National Financial's F&G (21st), whose investments Blackstone manages. The model is a spread business: sell fixed and fixed indexed annuities and funding agreements, invest the general account in higher-yielding assets the manager sources, often private credit, and keep the difference. F&G's 2025 gross sales of $14.6 billion were about 46% FIA, 26% fixed rate, 15% pension risk transfer and 12% funding agreements.

The Federal Insurance Office's September 2026 report quantifies the shift for the life and health sector: privately placed bonds, including private credit, reached **48.4%** of bond holdings at the end of 2025; non-investment grade bonds were **34.0%** of capital and surplus (down from 35.5%); affiliated investments were rising. It describes life insurers continuing "to reinsure business offshore through partnerships with alternative investment managers, particularly with affiliates in Bermuda, the Cayman Islands, and Barbados," citing risk sharing and diversification, and reinsurers' ability to earn higher returns "particularly where there are differences in regulatory treatment across jurisdictions."

## Bermuda, Cayman and Sidecars

Offshore asset-intensive reinsurance (AIR) moves annuity reserves and the assets behind them to reinsurers outside the US system, where the capital framework differs. Athene's disclosure is the clearest public example: its Bermuda reinsurers file statements that apply US statutory principles for policyholder reserves, yet consolidated RBC comes out about 20 points higher than on a US-only basis. FIO executed a memorandum of understanding with the Bermuda Monetary Authority for cooperation and information sharing, noting Bermuda's role in AIR, and engaged with the Cayman Islands Monetary Authority given the growth of cross-border life and annuity reinsurance there.

**Sidecars** bring third-party capital directly: separate entities that share risk with investors for a share of premiums, issuing equity and debt, usually fully collateralized. FIO reports that life and annuity reserves ceded to sidecars or sidecar-like entities rose to **$90.7 billion** in 2025 from $63.9 billion in 2024, used for in-force block reinsurance, flow reinsurance for new business and pension risk transfer. Athene's ACRA vehicles, which co-invest with third-party investors alongside its own reinsurers, are an example of the structure in a 10-K.

## Pension Risk Transfer

Pension risk transfer moves a defined benefit plan's obligations to an insurer. In a **buy-out**, the plan buys a group annuity contract and the insurer pays the retirees directly, taking the obligation off the employer's books; in a **buy-in**, the plan buys the contract as a plan asset and keeps paying retirees itself. LIMRA counted $31.3 billion of single-premium buy-out sales in 2025 across 683 contracts (down 35% in dollars), $17.5 billion of buy-in sales (up 372%), and $342.1 billion of total single-premium PRT assets at year end; fourth-quarter 2025 sales were $28 billion. Second-quarter 2026 sales were about $3 billion, down 26% year over year, with $2.77 billion of buy-outs across 139 contracts.

For the system, a buy-out is a group SPIA issued on a census: thousands of annuitants onboarded at once, each with a benefit, a form of payment, survivor options and payment instructions, converted from the plan's recordkeeper data in one migration. The data quality of the census is the insurer's risk, because every error is a payment error for life ([Annuities & Riders](/books/insurance/annuities#income-annuities)).

## The Regulatory Response

The NAIC summarized its response in December 2025: updated asset adequacy testing guidelines (AG 55), the modernized GOES with low-rate scenarios and annual stress tests of exposures such as CLOs, higher RBC charges for riskier assets, a framework under which regulators may, in limited cases, challenge investment ratings that produce capital charges not matching the risk, stricter conditions on private equity acquisitions of insurers (collateral and higher capital thresholds), and new disclosure of affiliated investments and complex holding structures. FIO's report describes continued work on transparency of investments and offshore reinsurance. For a system, each item is a reporting or modeling input: ratings with their source and any challenge, affiliate flags on every holding, reinsurance transactions tagged with their AG 55 status, and scenario sets versioned by the GOES release used.

## How to Build It

Reserves are computed by actuarial models outside the administration system, but the inputs come from it and the results must be stored against it. The life chapters' records feed the models: `policies`, `policy_values` and riders for the in-force, `reinsurance_contracts` and `cessions` (defined in [Reinsurance Structures](/books/insurance/reinsurance-structures) and [Reinsurance Operations](/books/insurance/reinsurance-operations)) for what was ceded, which gain the life forms through their `form` values (`yrt`, `coinsurance`, `modco`, `funds_withheld`) and a `block_or_flow` marker. This chapter adds the valuation record:

```sql
CREATE TABLE reserve_valuations (          -- one valuation of one reserving group
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  insurer_id         UUID NOT NULL REFERENCES insurers (id),
  valuation_date     DATE NOT NULL,
  framework          TEXT NOT NULL CHECK (framework IN ('vm20', 'vm21', 'vm22',
                       'vm_a_c_formulaic', 'ag43', 'other')),
  reserving_category TEXT,                  -- 'term', 'ulsg', 'all_other', VM-22 groups
  vm_edition         TEXT NOT NULL,         -- '2026', '2027'
  scenario_set       TEXT,                  -- GOES release and scenario count
  inforce_extract_ref TEXT NOT NULL,        -- the frozen policy and value snapshot used
  npr                BIGINT,
  deterministic_reserve BIGINT,
  stochastic_reserve BIGINT,                -- CTE 70 of scenario results
  exclusion_tests    JSONB,                 -- SET and DET results, if elected
  due_deferred_premium BIGINT NOT NULL DEFAULT 0,
  minimum_reserve    BIGINT NOT NULL,       -- per VM-20 2A or the framework's rule
  ceded_reserve_credit BIGINT NOT NULL DEFAULT 0,
  reinsurance_contract_ids UUID[] NOT NULL DEFAULT '{}',
  ag55_in_scope      BOOLEAN,               -- for the cession, with the threshold met
  actuary_party_id   UUID,
  model_run_ref      TEXT NOT NULL,         -- the actuarial model, version and run id
  approved_at        TIMESTAMPTZ
);
```

The in-force extract is the system's main contribution: a frozen, reconciled snapshot of every policy, its values and its cessions as of the valuation date, reproducible later ([Snapshots](/docs/database/temporal-data#snapshots)). The CTE measure is simple enough to compute in the reporting layer from stored scenario results, which is useful for checking the model's output:

```go tab="Go"
import "sort"

// CTE returns the average of the highest (100-level)% of outcomes; level 70
// gives CTE 70. Outcomes are minor units; the tail count rounds up.
func CTE(outcomes []int64, level int) int64 {
	s := append([]int64(nil), outcomes...)
	sort.Slice(s, func(i, j int) bool { return s[i] > s[j] })
	n := (len(s)*(100-level) + 99) / 100
	if n == 0 {
		return 0
	}
	var sum int64
	for _, v := range s[:n] {
		sum += v
	}
	return sum / int64(n)
}
```

```rust tab="Rust"
/// Average of the highest (100 - level)% of outcomes; level 70 gives CTE 70.
pub fn cte(outcomes: &[i64], level: usize) -> i64 {
    let mut s = outcomes.to_vec();
    s.sort_unstable_by(|a, b| b.cmp(a));
    let n = (s.len() * (100 - level) + 99) / 100;
    if n == 0 { return 0; }
    s[..n].iter().sum::<i64>() / n as i64
}
```

On the worked scenarios (in millions), `CTE(..., 70)` takes the top three of ten and returns 130. How a fractional tail is handled when the scenario count doesn't divide evenly is a methodology choice the Valuation Manual and the company's documentation decide; the function's round-up is an example, not the rule.

## Auditing

- **Reproducible valuations.** For every reported reserve, the in-force extract, the Valuation Manual edition, the scenario set, the model run and the approval, so the appointed actuary's opinion and an examiner can trace a number to its inputs.
- **Reinsurance tied to reserves.** Every reserve credit tied to its contracts and cessions, with the AG 55 scope test and any waiver.
- **Investment disclosures.** Affiliate flags, private placement status and rating sources on every holding, because the new disclosures and capital charges depend on them.
- **Transitions.** For VM-22, the election per block during the three-year transition and the date each block moved, since the election is irreversible.
- **Census quality for PRT.** The converted census, reconciliation to the plan's records and every correction, because each annuitant's payment depends on it.

## What This Means for the System You Build

- **Produce a frozen, reconciled in-force extract** for every valuation date, and store the reserve results against it.
- **Model life reinsurance forms explicitly** (YRT, coinsurance, modco, funds withheld; block or flow) with the reserve credit each produces.
- **Tag reinsurance for AG 55** with the thresholds computed from the cedent's reserve base and the establishment date.
- **Version scenario sets, Valuation Manual editions and elections,** because reserves change when any of them does.
- **Carry investment attributes regulators now ask about:** affiliate, private placement, rating source.
- **Treat a PRT buy-out as a migration** of a census into individual annuity records, with reconciliation as part of issue.

## References

**NAIC**

- [NAIC: Valuation Manual, January 1, 2026 edition (PDF)](https://content.naic.org/sites/default/files/pbr_data_valuation_manual_current_edition.pdf), VM-20's purpose, scope and group certificate rules, the Term, ULSG and All Other reserving categories, NPR, DR and SR and the minimum reserve formula, exclusion tests, VM-21's purpose and AG 43 aggregation, VM-22's effective date and transition, VM-30, and the CTE 70 definition
- [NAIC: PBR data and Valuation Manual editions](https://content.naic.org/pbr_data.htm), the 2026 and 2027 editions, redlines and adopted amendments
- [NAIC: Principle-based reserving (PBR)](https://content.naic.org/cipr-topics/principle-based-reserving-pbr), the 2017 operative date, the 2020 accreditation standard, the higher-of reserve standard, GOES in January 2026 and the VM-22 phase-in to January 2029
- [NAIC: Life Actuarial (A) Task Force](https://content.naic.org/committees/a/life-actuarial-tf), AG 55 and its 2026 year-end guidance and templates
- [NAIC: Navigating shifts in life insurance: how regulators respond to market evolution, December 3, 2025](https://content.naic.org/article/navigating-shifts-life-insurance-how-regulators-respond-market-evolution), asset adequacy testing, GOES, RBC charges, the ratings challenge framework, acquisition conditions and affiliated investment disclosure
- [NAIC: 2025 Life and Fraternal Market Share Report (PDF)](https://content.naic.org/sites/default/files/research-actuarial-life-fraternal-market-share.pdf), annuity premium by group, including Apollo, Brookfield, Global Atlantic and Fidelity National Financial
- [NAIC: 2025 Annual Life Industry Commentary (PDF)](https://content.naic.org/sites/default/files/2025-annual-life-industry-commentary.pdf), admitted assets and capital and surplus for 2025

**Regulators and guidance**

- [US Treasury, Federal Insurance Office: Annual Report on the Insurance Industry, September 2026 (PDF)](https://home.treasury.gov/system/files/311/2026-FIO-AR.pdf), private placements at 48.4% of L&H bonds, non-investment grade bonds at 34.0% of capital and surplus, offshore reinsurance through alternative investment managers in Bermuda, the Cayman Islands and Barbados, the BMA memorandum of understanding and CIMA engagement, and $90.7 billion of reserves ceded to sidecars

**Filings**

- [Athene: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1527469/000152746926000013/ahl-20251231.htm), ownership by Apollo, the Bermuda reinsurance subsidiaries and ACRA vehicles, the block and flow reinsurance definitions and the 20-point RBC difference
- [F&G: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1934850/000193485026000026/fg-20251231.htm), FNF ownership, the Blackstone agreement and the 2025 sales mix
- [Jackson Financial: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1822993/000182299326000022/jxn-20251231.htm), Brooke Re, the hedging program, the RBC ratio and the closed blocks
- [Primerica: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1475922/000119312526082233/pri-20251231.htm), first-dollar quota share YRT reinsurance of term mortality
- [Unum Group: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/5513/000000551326000008/unm-20251231.htm), the Closed Block's share of premium

**In practice**

- [Mayer Brown: US NAIC Summer 2025 National Meeting highlights: asset adequacy testing for reinsurance, August 25, 2025](https://www.mayerbrown.com/en/insights/publications/2025/08/us-naic-summer-2025-national-meeting-highlights-asset-adequacy-testing-for-reinsurance), AG 55's adoption dates, first reports, scope thresholds, attribution analysis, exclusions, waivers and disclosure-only status
- [LIMRA: U.S. single premium pension risk transfer sales jump 132% in the fourth quarter of 2025, March 18, 2026](https://www.limra.com/en/newsroom/news-releases/2026/limra-u.s.-single-premium-pension-risk-transfer-product-sales-jump-132-in-the-fourth-quarter-of-2025), 2025 buy-out and buy-in sales, contracts and assets
- [LIMRA: U.S. pension risk transfer sales total nearly $3 billion in second quarter 2026, September 18, 2026](https://www.limra.com/en/newsroom/news-releases/2026/limra-u.s.-pension-risk-transfer-sales-total-nearly-$3-billion-in-second-quarter-2026), Q2 2026 buy-out and buy-in sales
