+++
title = "Excess & Surplus Lines"
description = "Going non-admitted: eligibility, diligent search, stamping offices and SL taxes, the NRRA home-state rule worked for multistate risks, E&S carriers."
category = "Insurance Industry"
order = 2752
part = "Commercial and Specialty Lines"
tags = ["insurance", "surplus-lines", "e-and-s", "premium-tax", "nrra", "commercial-lines"]
+++

The excess and surplus lines (E&S) market writes what the admitted market won't: the restaurant with a liquor liability history, the vacant building, the cannabis grower, the startup with a novel product, the coastal property every admitted carrier has stopped writing. A surplus lines insurer is not licensed (admitted) in the insured's state; it is eligible there, which means it can write the risk without filing its rates or forms, and the state regulates the transaction through the licensed surplus lines broker who places it rather than through the insurer. That freedom is the point: the insurer can price and word a policy for a risk no filed product fits. The price of freedom is that policyholders have no state guaranty fund behind most surplus lines policies, the broker must show the admitted market didn't want the risk, and every placement is filed with a state or its stamping office and taxed.

The market is now large enough to be a mainstream channel rather than a last resort. This chapter covers who writes it, when business goes non-admitted, eligibility, the diligent search, the stamping offices and the tax (with a multistate placement worked under the federal home-state rule), and the data model. The surplus lines broker's role and the home-state rule's basics are in Agents, Brokers & Channels in the Distribution part, which defines `sl_placements`; this chapter extends it with diligent search records and the filing life cycle. It also touches `insurer_authorities` from [The Core Data Model](/books/insurance/insurance-business#the-core-data-model), whose `surplus_lines_eligible` basis is how an E&S insurer appears.

## How the Platforms Do It

As of November 2026, from 2025 filings and the stamping offices' report:

| Company or office | Model | What the public record says |
| --- | --- | --- |
| **Kinsale** | Pure E&S, small accounts | Kinsale Insurance Company writes on an E&S basis in all 50 states, DC, Puerto Rico and the US Virgin Islands; about 1.5% of a $129.8 billion E&S market (AM Best, 2024 direct premium); uses its "freedom of rate and form assertively"; no delegated authority; average broker commission 14.8% |
| **RLI** | Admitted and E&S side by side | 2025 gross written premium about 60% specialty admitted ($1.2 billion) and 39% E&S ($783 million); wholesale and retail brokers for E&S-heavy lines |
| **Skyward Specialty** | Mostly non-admitted specialty | 59% of 2025 gross written premium non-admitted, 41% admitted |
| **Palomar** | Admitted and E&S companies | An admitted Oregon insurer (Palomar Specialty Insurance Company) and an Arizona E&S insurer (Palomar Excess and Surplus Insurance Company) |
| **Wholesale brokers** | Distribution | Kinsale's three largest brokers, RSG Specialty (18.8%), AmWINS (17.1%) and CRC (11.7%), placed 47.6% of its 2025 premium |
| **Stamping offices** | Filing and tax | The 15 stamping office states recorded $90.4 billion of 2025 surplus lines premium in 7.57 million items; with the six SLIP states, $100.85 billion in 8.19 million items |

The model is wholesale. A retail agent with a client the admitted market declined goes to a wholesale broker who holds a surplus lines license and access to E&S insurers; the wholesaler places the risk, issues or delivers the policy, files the placement and collects and remits the tax. Insurers like Kinsale see only broker submissions, and their underwriting speed and appetite are their competitive edge.

## The Market in Numbers

The stamping offices' 2025 annual assessment (published by the Wholesale & Specialty Insurance Association and the Florida Surplus Lines Service Office in March 2026) counts what flows through the 15 states with stamping offices (Arizona, California, Florida, Idaho, Illinois, Minnesota, Mississippi, Nevada, New York, North Carolina, Oregon, Pennsylvania, Texas, Utah and Washington): $90.40 billion of premium and 7.57 million items in 2025, against $83.81 billion and 6.64 million in 2024, growth of about 8% in premium and 14% in items. Adding the states that file through SLIP or SLIP+ (Georgia, Colorado, Oklahoma, South Dakota, Tennessee and Wyoming) brings it to $100.85 billion and 8.19 million items. California is the largest office at $22.1 billion. An "item" is a filed transaction: a new policy, an endorsement, a cancellation, an audit. The report notes that California's 2024 figures were first reported "artificially low" because policies filed as PDFs were left out, and were restated: a reminder that filing data is pipeline data with its own defects.

## When Business Goes Non-Admitted

A risk is placed with a surplus lines insurer when:

- **The admitted market declines it,** shown by a diligent search, for its hazard, its loss history, its size or its novelty.
- **It is on an export list.** Some states publish lists of coverages deemed unavailable in the admitted market, for which no search is needed.
- **The insured is an exempt commercial purchaser.** Under the Nonadmitted and Reinsurance Reform Act (15 USC 8205), a large commercial buyer with a qualified risk manager may be placed without a search after the broker's disclosure that coverage "may or may not be available from the admitted market" and the buyer's written request.
- **Coverage is excess of admitted primary,** in states that let excess layers be placed non-admitted with less proof.

Some lines can't go non-admitted at all, or only on narrow conditions. Workers' compensation is the main one: the NRRA expressly leaves in place state laws that restrict placing workers' compensation, or excess cover for self-funded workers' compensation plans, with a nonadmitted insurer (15 USC 8202(d)). Personal auto liability and some medical malpractice must first be offered through a state plan in New York (below).

## Eligibility

A surplus lines broker may place only with an insurer that is eligible in the home state. The NRRA limits what states may demand. For an insurer domiciled in a US jurisdiction, a state may not set eligibility requirements "except in conformance with such requirements and criteria in sections 5A(2) and 5C(2)(a)" of the NAIC's Non-Admitted Insurance Model Act (the capital and surplus and the authorization tests), unless the states adopt uniform standards; for an alien insurer, a state may not stop a broker from placing with one "listed on the Quarterly Listing of Alien Insurers" maintained by the NAIC's International Insurers Department (15 USC 8204). Many states also publish their own list of eligible insurers, refreshed as insurers are added and removed.

For the system, eligibility is an `insurer_authorities` row with `basis = 'surplus_lines_eligible'` per state, dated, from the state's list or the NAIC's alien list, checked at bind like an admitted certificate of authority.

## Diligent Search

The broker must show that the coverage wasn't available from admitted insurers. The rule varies by state; three examples:

- **New York (Ins. Law 2118).** The licensee swears that "after diligent effort" the full amount couldn't be procured from authorized insurers that write the kind of coverage and that it "has reason to believe might consider" it, with three declinations unless the superintendent sets a different number for a coverage. Declinations from affiliated insurers count only if they operate as distinct, autonomous competitors. The affidavit lists each declining insurer's name, NAIC code and declination date. No search is required for an exempt commercial purchaser after the written disclosure and request. Where a state plan offers the coverage (non-commercial auto liability, medical malpractice for hospitals, physicians and dentists, insurance the law requires from an authorized insurer), diligent effort can't be found while the plan offers it.
- **California (Ins. Code 1763).** The surplus line broker must make sure a diligent search is made among admitted insurers that write the type of insurance; it is presumed diligent if the filed standardized form shows three admitted insurers declined or fewer than three write the coverage, signed by a licensed person who made or supervised the search. The broker files a report with the commissioner within 60 days of placement, and the search requirement doesn't apply to a commercial insured after the broker's written disclosure and the insured's written request.
- **Florida (s. 626.916).** Eligibility for export adds price and form tests: the premium rate can't be lower than most authorized insurers' rate for the same coverage on a similar risk, the form can't be more favorable to the insured than most authorized insurers' forms (a unique form may be filed, subject to disapproval within 10 days), deductibles must match, and the insured must acknowledge a surplus lines disclosure.

A diligent search is therefore a set of dated records: which admitted insurers were approached, by whom, when, and how each declined, plus the affidavit or form that summarizes it. Keep them as rows, not a PDF only, because the regulator's question is usually about a pattern (the same three insurers declining every risk, declinations dated after the binding).

## Stamping Offices and Filing

In 15 states a stamping office (a nonprofit run by the brokers or the state) receives every surplus lines transaction, checks it (eligible insurer, licensed broker, diligent search, tax computed, required disclosures on the policy), stamps or records it, and reports to the state; in the others, brokers file with the department directly or through SLIP. Every item filed carries the policy number, insurer, broker, effective dates, premium, coverage codes, the home state and the tax. Endorsements, cancellations and audits are items too, with their own premium (positive or negative) and tax.

Filing deadlines are per state and usually tied to the effective or transaction date (within so many days, or by month), and late filing carries penalties. The stamping fee is a percentage of premium or a flat amount per item, charged to the insured with the tax.

## The Tax

The tax is the insured's, collected and remitted by the broker. Florida's statute shows the parts: a "premium receipts tax of 4.94 percent of all gross premiums charged," collected from the insured on top of premium when the policy or confirmation is delivered; the agent "is prohibited from absorbing such tax" or rebating it; "premium" includes assessments and fees but not the service office's fee; the tax is remitted quarterly to the Florida Surplus Lines Service Office with the quarterly affidavit; and overdue tax bears 9% interest a year (s. 626.932). Where Florida is the home state of a risk only partly in Florida, the tax "shall be computed on the gross premium."

The 2025 rates in the stamping office states, from the same report:

| State | SL tax | Stamping fee |
| --- | --- | --- |
| Arizona | 3.00% | 0.20% |
| California | 3.00% | 0.18% |
| Florida | 4.94% | 0.06% |
| Idaho | 1.50% | 0.50% |
| Illinois | 3.50% | 0.04% |
| Minnesota | 3.00% | 0.04% |
| Mississippi | 4.00% | 0.25% |
| Nevada | 3.50% | 0.40% |
| New York | 3.60% | 0.15% |
| North Carolina | 5.00% | 0.30% |
| Oregon | 2.00% | 0.3% fire marshal tax on every policy |
| Pennsylvania | 3.00% | $10 per item |
| Texas | 4.85% | $20 per item |
| Utah | 4.25% | 0.04% |
| Washington | 2.00% | 0.18% |

Several states add their own surcharges (fire marshal taxes, municipal taxes, assessments), and the taxable base (whether policy fees and inspection fees are included) differs, so the tax is a rule per state and per charge type, not one rate.

### The Home-State Rule, Worked

Since July 21, 2011, "No State other than the home State of an insured may require any premium tax payment for nonadmitted insurance" (15 USC 8201), and only the home state may require the broker to be licensed or regulate the placement (8202). The home state is the state of the insured's principal place of business (an individual's principal residence), or, "if 100 percent of the insured risk is located out of" that state, "the State to which the greatest percentage of the insured's taxable premium for that insurance contract is allocated"; for affiliated insureds on one contract, the home state of the member with the largest share of premium (15 USC 8206). The worked cases are mine, using the rates above.

**Case 1: principal place of business with part of the risk.** A distributor headquartered in Illinois buys a $250,000 surplus lines property policy covering warehouses in Illinois (40% of the premium), Florida (35%) and Texas (25%). The home state is Illinois, which taxes the whole premium.

| Item | Computation | Amount |
| --- | --- | --- |
| Illinois SL tax | $250,000 × 3.50% | $8,750.00 |
| Illinois stamping fee | $250,000 × 0.04% | $100.00 |
| Florida and Texas tax | Not owed: neither is the home state | $0.00 |
| Total collected from the insured | | $8,850.00 |

Before July 2011 each state could tax its share: Illinois $100,000 × 3.50% = $3,500.00, Florida $87,500 × 4.94% = $4,322.50, Texas $62,500 × 4.85% = $3,031.25, a total of $10,853.75 in tax across three filings, plus each state's fees.

**Case 2: principal place of business with none of the risk.** A holding company headquartered in New York owns hotels only in Florida (70% of the premium) and Texas (30%). All of the risk is outside New York, so the home state is the state with the greatest share of taxable premium: Florida.

| Item | Computation | Amount |
| --- | --- | --- |
| Florida SL tax, on the gross premium | $250,000 × 4.94% | $12,350.00 |
| Florida service office fee | $250,000 × 0.06% | $150.00 |
| New York and Texas | Not owed | $0.00 |
| Total | | $12,500.00 |

The broker needs a Florida surplus lines license (and no New York or Texas one for this placement), files the item with the Florida Surplus Lines Service Office, and remits with the quarterly affidavit.

**Case 3: a mid-term change.** In Case 1, an endorsement adds a Wisconsin warehouse for $20,000 of additional premium on day 120 of the term. The insured's principal place of business is still Illinois, so the endorsement is a new Illinois item with tax of $700.00 and a fee of $8.00. A cancellation would produce a negative item and a return of tax, filed the same way.

The calculation is a function of the home state, the charge types and the state's rule table:

```go tab="Go"
type SLRule struct {
	State       string
	TaxRate     decimal.Decimal // 0.0494 for Florida
	FeeRate     decimal.Decimal // percentage stamping fee, or zero
	FeePerItem  int64           // flat fee per item in cents, or zero
	TaxableKind map[string]bool // which premium_entries kinds the tax applies to
	Citation    string          // "Fla. Stat. 626.932"
}

type Charge struct {
	Kind   string // "premium", "policy_fee", "inspection_fee", ...
	Amount int64  // cents, signed for returns
}

// SLTax computes tax and fee in cents for one filed item, rounding half away from zero.
func SLTax(r SLRule, charges []Charge) (tax, fee int64) {
	var base int64
	for _, c := range charges {
		if r.TaxableKind[c.Kind] {
			base += c.Amount
		}
	}
	b := decimal.NewFromInt(base)
	tax = b.Mul(r.TaxRate).Round(0).IntPart()
	fee = b.Mul(r.FeeRate).Round(0).IntPart() + r.FeePerItem
	return tax, fee
}

// SLTax(illinois, []Charge{{"premium", 25_000_000}}) == (875_000, 10_000)
```

```rust tab="Rust"
use rust_decimal::{prelude::ToPrimitive, Decimal, RoundingStrategy};
use std::collections::HashSet;

pub struct SlRule {
    pub state: &'static str,
    pub tax_rate: Decimal,              // 0.0494 for Florida
    pub fee_rate: Decimal,              // percentage stamping fee, or zero
    pub fee_per_item: i64,              // flat fee per item in cents, or zero
    pub taxable_kinds: HashSet<&'static str>, // which premium_entries kinds are taxed
    pub citation: &'static str,         // "Fla. Stat. 626.932"
}

pub struct Charge {
    pub kind: &'static str, // "premium", "policy_fee", "inspection_fee", ...
    pub amount: i64,        // cents, signed for returns
}

/// Tax and fee in cents for one filed item, rounding half away from zero.
pub fn sl_tax(r: &SlRule, charges: &[Charge]) -> (i64, i64) {
    let base: i64 = charges
        .iter()
        .filter(|c| r.taxable_kinds.contains(c.kind))
        .map(|c| c.amount)
        .sum();
    let round = |d: Decimal| {
        d.round_dp_with_strategy(0, RoundingStrategy::MidpointAwayFromZero)
            .to_i64()
            .unwrap()
    };
    let b = Decimal::from(base);
    (round(b * r.tax_rate), round(b * r.fee_rate) + r.fee_per_item)
}

// sl_tax(&illinois, &[Charge { kind: "premium", amount: 25_000_000 }]) == (875_000, 10_000)
```

## Freedom of Rate and Form

An E&S insurer's rates and forms are not filed or approved, which is the market's reason to exist: Kinsale writes risks "standard carriers have rejected" because of "approved forms and filed rates." The freedom has edges the system still enforces. Florida's export tests require the rate to be no lower than the admitted market's and the form no more favorable, so E&S can't undercut the admitted market there. Disclosure is a condition of the placement: Florida requires the insured to sign or otherwise document an acknowledgment of a surplus lines disclosure before the risk is exported. And freedom from filing is not freedom from every state rule: my default is to run E&S policies through the same notice, claim clock and complaint rule tables as admitted ones, marking which rules a state applies to surplus lines, rather than assume none do.

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model) and `sl_placements`, defined in Agents, Brokers & Channels (one placement per policy transaction with the broker, the broker's home-state license, the home state and its basis, the exempt commercial purchaser flag, taxable premium, tax, stamping fee and the filing reference). This chapter adds the diligent search and the filing life cycle and the per-state rules the tax reads.

```sql
ALTER TABLE sl_placements
  ADD COLUMN insurer_authority_id UUID REFERENCES insurer_authorities (id),  -- eligibility used
  ADD COLUMN placement_basis   TEXT NOT NULL DEFAULT 'diligent_search'
    CHECK (placement_basis IN ('diligent_search', 'export_list', 'exempt_commercial_purchaser',
      'excess_of_admitted')),
  ADD COLUMN risk_allocation   JSONB,       -- {"US-IL": 0.40, "US-FL": 0.35, "US-TX": 0.25}
  ADD COLUMN disclosure_doc_id UUID,        -- the signed surplus lines disclosure
  ADD COLUMN filing_status     TEXT NOT NULL DEFAULT 'pending'
    CHECK (filing_status IN ('pending', 'filed', 'accepted', 'rejected', 'corrected')),
  ADD COLUMN filing_due_at     TIMESTAMPTZ,  -- from the home state's rule
  ADD COLUMN rejection_reason  TEXT,
  ADD COLUMN remittance_period TEXT;        -- '2026-Q3' for quarterly remitters

CREATE TABLE diligent_searches (           -- the proof the admitted market declined
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  sl_placement_id    UUID NOT NULL REFERENCES sl_placements (id),
  home_state         TEXT NOT NULL,
  required_declinations INT NOT NULL,       -- 3 in NY and CA unless a rule says otherwise
  rule_ref           TEXT NOT NULL,         -- 'NY Ins. Law 2118(a)(4)', 'Cal. Ins. Code 1763(b)'
  performed_by_license_id UUID NOT NULL REFERENCES producer_licenses (id),
  affidavit_doc_id   UUID,                  -- the sworn statement or standardized form
  completed_at       TIMESTAMPTZ NOT NULL,
  report_due_at      TIMESTAMPTZ            -- California's 60-day report
);

CREATE TABLE diligent_search_contacts (    -- each admitted insurer approached
  diligent_search_id UUID NOT NULL REFERENCES diligent_searches (id),
  seq                INT NOT NULL,
  admitted_insurer_naic TEXT NOT NULL,      -- NY's affidavit lists the NAIC code
  admitted_insurer_name TEXT NOT NULL,
  approached_at      TIMESTAMPTZ NOT NULL,
  response           TEXT NOT NULL CHECK (response IN ('declined', 'no_response',
                       'does_not_write', 'quoted_inadequate')),
  responded_at       TIMESTAMPTZ,
  reason             TEXT,
  evidence_doc_id    UUID,
  PRIMARY KEY (diligent_search_id, seq)
);

CREATE TABLE sl_tax_rules (                -- the home state's tax and fees, dated
  state              TEXT NOT NULL,
  charge             TEXT NOT NULL,         -- 'sl_tax', 'stamping_fee', 'fire_marshal_tax', ...
  rate               NUMERIC(8, 6),         -- 0.049400
  flat_per_item      BIGINT,                -- minor units: Texas $20, Pennsylvania $10
  taxable_kinds      TEXT[] NOT NULL,       -- premium_entries kinds in the base
  effective_from     DATE NOT NULL,
  effective_to       DATE,
  rule_ref           TEXT NOT NULL,         -- 'Fla. Stat. 626.932(1)'
  PRIMARY KEY (state, charge, effective_from)
);
```

The tax and fees for a placement become `premium_entries` of kinds `sl_tax` and `stamping_fee` on the same transaction, computed from the rules effective on the transaction date:

```sql
INSERT INTO premium_entries (transaction_id, kind, amount, earn_from, earn_to, state,
                             accounting_date)
SELECT sp.policy_transaction_id,
       CASE r.charge WHEN 'sl_tax' THEN 'sl_tax' ELSE 'stamping_fee' END,
       ROUND(base.amount * COALESCE(r.rate, 0)) + COALESCE(r.flat_per_item, 0),
       pt.effective_at, pt.effective_at, sp.home_state, CURRENT_DATE
FROM sl_placements sp
JOIN policy_transactions pt ON pt.id = sp.policy_transaction_id
JOIN LATERAL (SELECT SUM(pe.amount) AS amount FROM premium_entries pe
              JOIN sl_tax_rules r2 ON r2.state = sp.home_state AND r2.charge = 'sl_tax'
               AND pt.effective_at::date >= r2.effective_from
               AND (r2.effective_to IS NULL OR pt.effective_at::date < r2.effective_to)
              WHERE pe.transaction_id = sp.policy_transaction_id
                AND pe.kind = ANY (r2.taxable_kinds)) base ON TRUE
JOIN sl_tax_rules r ON r.state = sp.home_state
  AND pt.effective_at::date >= r.effective_from
  AND (r.effective_to IS NULL OR pt.effective_at::date < r.effective_to)
WHERE sp.id = :placement_id;
```

Design notes:

- **The home state is fixed at placement.** My rule: it is computed from the principal place of business and the risk allocation, stored with its basis, and used for every later item on the policy term; a move of headquarters mid-term doesn't move the tax.
- **Every transaction is a filing item.** Endorsements, cancellations and audits each create a placement row (or an item under it) with their own tax, fee and filing status, so the broker's filings reconcile to the stamping office's item counts.
- **Taxes are entries, not fields.** SL tax and fees are `premium_entries` that earn immediately and are excluded from earned premium and commissions; the remittance report is a sum of them by state and period.
- **A search can't postdate the bind.** The bind check requires a completed `diligent_searches` row (or an export list or exempt purchaser basis) before the placement's binding time.
- **Eligibility is checked like a license.** The `insurer_authority_id` recorded is the eligibility row valid on the placement date.

## Auditing

- **Every placement's legal basis:** the home state and its basis, the eligibility record, and either the diligent search with each admitted insurer's response, the export list entry or the exempt commercial purchaser disclosure and request.
- **Tax and fee per item,** with the rule version, the taxable base and the remittance that paid it, reconcilable to the stamping office's records and the quarterly affidavits.
- **Filing status per item:** filed, accepted or rejected with the reason, and corrections, against each state's filing deadline.
- **Disclosures delivered:** the nonadmitted and no-guaranty-fund notice on each policy and the insured's acknowledgment where required.

## What This Means for the System You Build

- **Compute and store the home state at placement** with its basis and the risk allocation, and tax 100% of the premium there.
- **Record diligent searches as rows** (insurer, NAIC code, dates, responses) before binding, or the export list or exempt purchaser basis that replaces them.
- **Make every policy transaction a filing item** with its own tax, fee and filing status.
- **Keep SL tax and fee rules per state, charge and date,** with their taxable base, and post them as premium entries.
- **Check surplus lines eligibility like a certificate of authority,** dated, per state.
- **Deliver and keep the nonadmitted disclosures** and acknowledgments as documents.

## References

**Law and regulation**

- [15 USC 8202](https://www.law.cornell.edu/uscode/text/15/8202), placement governed solely by the home state, home-state-only broker licensing, preemption and the workers' compensation exception
- [15 USC 8204](https://www.law.cornell.edu/uscode/text/15/8204), uniform eligibility: US insurers only per the NAIC Non-Admitted Insurance Model Act sections 5A(2) and 5C(2)(a), and alien insurers on the NAIC Quarterly Listing
- [15 USC 8206](https://www.law.cornell.edu/uscode/text/15/8206), the home state definition, the 100% outside rule and affiliated groups
- [N.Y. Ins. Law 2118](https://www.nysenate.gov/legislation/laws/ISC/2118), diligent effort, three declinations, the affidavit's contents, exempt commercial purchasers, state plan coverages and records
- [Cal. Ins. Code 1763 (FindLaw)](https://codes.findlaw.com/ca/insurance-code/ins-sect-1763/), the diligent search among admitted insurers, the three-declination presumption, the 60-day report and the commercial insured exemption
- [Fla. Stat. 626.916](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0626/Sections/0626.916.html), eligibility for export: rate, form, deductible and disclosure acknowledgment tests
- [Fla. Stat. 626.932](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0626/Sections/0626.932.html), the 4.94% surplus lines tax, its base, collection from the insured, quarterly remittance and interest on delinquency

**Regulators and guidance**

- [WSIA and FSLSO: US Surplus Lines Service Offices 2025 Annual Assessment, March 2026 (PDF)](https://slipplus.com/wp-content/uploads/documents/WSIA-SLAS-States-Report-March-2026.ai_SW.pdf), premium and items by stamping office and SLIP state for 2024 and 2025, totals, the California restatement, and SL tax and stamping fee rates

**Filings**

- [Kinsale Capital Group: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1669162/000166916226000015/knsl-20251231.htm), the E&S market size per AM Best, Kinsale's share, its largest brokers and commission, and freedom of rate and form
- [RLI Corp.: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/84246/000110465926018013/rli-20251231x10k.htm), admitted and E&S shares of gross written premium and distribution by product
- [Skyward Specialty: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1519449/000151944926000015/skwd-20251231.htm), the admitted and non-admitted split
- [Palomar Holdings: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1761312/000119312526067364/plmr-20251231.htm), the admitted and E&S insurance companies
