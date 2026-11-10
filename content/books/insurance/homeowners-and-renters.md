+++
title = "Homeowners & Renters"
description = "Homeowners forms and coverages, replacement cost and ACV, roof rules, hurricane deductibles worked, mortgagees and escrow, condo and renters, and availability."
category = "Insurance Industry"
order = 2744
part = "Personal Lines"
tags = ["insurance", "homeowners", "renters", "replacement-cost", "hurricane-deductible", "personal-lines"]
+++

Homeowners insurance is the second largest personal line, $188.7 billion of direct premium in 2025 by NAIC's count, and the one where the US market is under the most strain. A policy bundles property coverage for the house, other structures and belongings, living expenses while the house can't be lived in, and personal liability, all priced on a building's location, age, construction and roof, and all exposed to the same catastrophes as the neighbors' policies. Lenders require it, so most homeowners can't simply drop it when the price rises, and states regulate it closely: what an insurer may refuse to write because of a roof's age, what deductibles it must offer, how it pays a claim and when it may nonrenew.

This chapter covers the policy forms and coverages, replacement cost and actual cash value worked on a roof claim, roof age rules, wind and hurricane deductibles worked, mortgagee requirements and escrow, condominium and renters coverage, and the availability problems outside Florida and California. Property claims handling (estimating, appraisal, public adjusters) is Property Claims; the Florida and California markets and residual property plans are Stressed & Residual Markets; renters insurance requirements at a rental property are Property Tech's.

## How the Platforms Do It

NAIC's 2025 market share data for homeowners multiple peril, as of November 2026:

| Group | 2025 share of homeowners direct premium | Direct loss and DCC to earned premium |
| --- | --- | --- |
| State Farm | 18.69% | 76.24% |
| Allstate | 9.42% | 57.54% |
| USAA | 7.02% | 61.95% |
| Liberty Mutual | 5.51% | 50.95% |
| Farmers | 5.46% | 49.69% |
| **Industry total** | **$188.69 billion** | |

Behind the national writers are regional carriers, Florida and Gulf specialists (Universal, HCI and others whose reinsurance programs are in Reinsurance Structures), state residual plans, and insurtechs that write renters and homeowners through apps. Lemonade's 2025 10-K describes a product set of renters, homeowners, pet, car and term life (life through Legal & General), more than 3 million customers, and about 45% of 2025 gross written premium from California, New York and Texas.

## Forms and Coverages

Most homeowners policies follow forms published by ISO (Verisk) or a few other advisory organizations, adopted with state amendatory endorsements (Products, Coverages & Forms). The family, by convention:

| Form | For | Perils |
| --- | --- | --- |
| HO 2 (broad) | Owner-occupied homes | Named perils on dwelling and contents |
| HO 3 (special) | Owner-occupied homes, the most common form | Open perils (all risks not excluded) on the dwelling and other structures, named perils on personal property |
| HO 4 (contents broad) | Renters | Named perils on personal property; liability |
| HO 5 (comprehensive) | Owner-occupied homes | Open perils on dwelling and personal property |
| HO 6 (unit owners) | Condominium unit owners | Named perils on contents, the unit's interior and improvements; loss assessment |
| HO 8 (modified) | Older homes where replacement cost far exceeds market value | Named perils, repair with functionally equivalent materials |

The coverages, lettered A to F in the ISO forms:<!-- source-gap: iso-ho-forms-text | missing | ISO HO 00 03 and related form text for coverage letters, default percentages of Coverage A for B, C and D, and the named-peril lists | closes with: a state DOI or court copy of the ISO HO 00 03 form, or a filed carrier homeowners form on SERFF Filing Access | checked: 2026-11-10 -->

- **Coverage A, Dwelling.** The house, rebuilt at replacement cost under most forms, to the limit.
- **Coverage B, Other structures.** Detached garages, fences, sheds; commonly a percentage of A.
- **Coverage C, Personal property.** Belongings, with special limits on categories such as jewelry and cash; Texas's consumer guide notes it usually pays "a percentage of your dwelling coverage limit."
- **Coverage D, Loss of use.** Additional living expense while the home is uninhabitable, and fair rental value; the Texas guide notes ALE "might be limited to 10 to 20%" of the dwelling limit.
- **Coverage E, Personal liability.** Bodily injury and property damage to others for which the insured is legally liable, with defense.
- **Coverage F, Medical payments to others,** regardless of fault.

The Texas Department of Insurance's homeowners guide (updated June 1, 2026) lists the same six coverages without the letters. In the core data model each is a `coverages` row on the dwelling risk with its own limit and form references, and B, C and D are often stored as percentages of A that the rating engine resolves into dollars at quote time.

## Replacement Cost, ACV and Roofs

**Replacement cost** (RC) pays what it costs to repair or replace with like kind and quality; **actual cash value** (ACV) is replacement cost less depreciation. Many policies pay ACV first and the depreciation (the **holdback**) when the work is done. Florida writes the sequence into law: an insurer issuing a homeowners policy must offer replacement cost coverage "rather than actual cash value" (Fla. Stat. 627.7011(1)), may pay ACV first on a dwelling loss with the balance on replacement, and on a total loss must pay replacement cost "without reservation or holdback" (627.7011(3)).

Roofs are where ACV matters most, because roof damage drives wind and hail claims and roofs depreciate fast. Insurers use three tools, all filed with the rate and form: **age-based eligibility** (not writing homes with roofs over an age), **roof surfacing payment schedules or ACV roof endorsements** (paying a declining percentage of replacement cost by roof age), and separate **roof deductibles**. States limit them. Florida, for policies issued or renewed on or after July 1, 2022, bars refusing to issue or renew "solely because of the age of the roof" if the roof is less than 15 years old, and for an older roof lets the homeowner get an inspection; the insurer may not refuse if it shows "5 years or more of useful life remaining" (627.7011(5)). Florida also lets an insurer include "a separate roof deductible" the policyholder may opt out of (627.701(10)).

A worked roof claim, mine: hail destroys a roof with a replacement cost of $24,000. The roof is 12 years old against a 20-year expected life, and the deductible is $2,000.

| Settlement basis | Calculation | Payment |
| --- | --- | --- |
| Replacement cost, paid in full | $24,000 − $2,000 | $22,000 |
| Replacement cost, ACV first | ACV = $24,000 × (1 − 12/20) = $9,600; $9,600 − $2,000 | $7,600 now, then $14,400 holdback when the roof is replaced |
| A roof payment schedule paying 50% at age 12 (an illustrative schedule, mine) | $24,000 × 50% − $2,000 | $10,000, with no holdback |

The schedule and the depreciation method are filed terms. The claims system reads them from the policy version in force on the loss date; the estimate, depreciation and holdback are tracked as separate amounts on the exposure, and the holdback is a reserve that stays open until proof of replacement or the policy's deadline for it (Property Claims).

## Wind, Hail and Hurricane Deductibles

In coastal and hail states, wind losses carry a separate deductible, usually a percentage of Coverage A rather than a dollar amount. Florida requires insurers to offer hurricane deductibles of "$500, 2 percent, 5 percent, and 10 percent of the policy dwelling limits," and the hurricane deductible applies "on an annual basis to all covered hurricane losses that occur during the calendar year" (Fla. Stat. 627.701), so a second hurricane in the same year draws only on what remains of the deductible.

A worked season, mine: Coverage A of $400,000 with a 2% hurricane deductible, $8,000 for the calendar year.

| Event | Covered loss | Deductible applied | Deductible remaining | Insurer pays |
| --- | --- | --- | --- | --- |
| Hurricane 1, August | $6,000 | $6,000 | $2,000 | $0 |
| Hurricane 2, October | $15,000 | $2,000 | $0 | $13,000 |
| Hailstorm, November (not a hurricane) | $5,000 | the all-other-perils deductible, say $1,000 | | $4,000 |

The deductible is a running balance per policy per calendar year across claims, not a field on one claim: the claims system queries prior hurricane claims under the same policy in the same year (and, at renewal, across two policy terms that straddle the calendar year) before applying it. Which events count as hurricanes is set by the policy definition and the event record (Catastrophe Events).

```go tab="Go"
// HurricaneDeductible applies a calendar-year hurricane deductible to a
// new loss, given the deductible already absorbed by earlier hurricane
// losses this year. It returns the deductible applied and the amount paid.
func HurricaneDeductible(loss, annual, absorbed int64) (applied, paid int64) {
	remaining := max(0, annual-absorbed)
	applied = min(loss, remaining)
	return applied, loss - applied
}
```

```rust tab="Rust"
/// Applies a calendar-year hurricane deductible to a new loss given the
/// deductible already absorbed this year; returns (applied, paid).
pub fn hurricane_deductible(loss: i64, annual: i64, absorbed: i64) -> (i64, i64) {
    let applied = loss.min((annual - absorbed).max(0));
    (applied, loss - applied)
}
```

## Mortgagees, Escrow and Lender Requirements

A mortgaged home's policy names the lender as **mortgagee**, which gives the lender rights to notice and to claim payments (Cancellation, Nonrenewal & Notice Law; Property Claims). The lender's investor sets the coverage it requires. Fannie Mae's Selling Guide (B7-3-02, as published November 4, 2026) requires property insurance on one- to four-unit properties to "provide coverage on a replacement cost basis," though roofs need not be insured on a replacement cost basis, and caps the deductible: the maximum "is 5% of the property insurance coverage amount," and a separate deductible for a peril such as wind is also capped at 5%.

That puts a lender rule into the product: a 10% hurricane deductible on a $400,000 dwelling is $40,000, twice Fannie Mae's $20,000 cap, so an agent selling it on a Fannie Mae loan creates a policy the servicer will reject. The quote can check the mortgagee's investor requirements at bind when they're known.

**Escrow.** Most servicers collect the premium monthly with the mortgage payment and pay the insurer from an escrow account. RESPA's Regulation X lets the servicer hold a cushion "no greater than one-sixth (1/6) of the estimated total annual payments" from the account, requires an annual escrow analysis, and requires a surplus of $50 or more to be refunded within 30 days (12 CFR 1024.17). A worked figure, mine: a $3,600 annual premium and $4,800 of property taxes make $8,400 of annual disbursements, $700 a month, and a cushion of at most $1,400. A premium increase at renewal lands in the next escrow analysis as a shortage the homeowner repays, which is how a homeowners rate increase becomes a mortgage payment increase. The servicer's side is in [Escrow](/books/banking-and-lending/mortgage-servicing#escrow); the insurer's side is billing the mortgagee and accepting the escrow disbursement (Billing & Premium Finance).

**Force placement.** If coverage lapses, the servicer may buy **force-placed** (lender-placed) insurance and charge the borrower, after an initial notice "at least 45 days before" any charge, a reminder no earlier than 30 days after the first notice and at least 15 days before the charge, and must cancel and refund within 15 days of receiving evidence of coverage (12 CFR 1024.37). The lender-placed product and the servicer's process are in [Force-Placed Insurance](/books/banking-and-lending/mortgage-servicing#force-placed-insurance) and [Master and Force-Placed Policies](/books/property-tech/insurance-deposits-and-guarantees#master-and-force-placed-policies); for the voluntary insurer the event that starts it is its own cancellation or nonrenewal notice to the mortgagee.

## Condominiums and Renters

**Condominium unit owners** buy an HO 6 that covers what the association's master policy doesn't: contents, the unit's interior finishes and improvements (depending on whether the master policy is "bare walls" or "all-in"), liability, and **loss assessment** coverage for the owner's share of an assessment the association levies after an uninsured or under-insured loss. The system needs the master policy's scope as a fact on the unit owner's risk, since it decides what Coverage A on an HO 6 must insure.

**Renters** buy an HO 4: contents, loss of use and liability, with no dwelling coverage. It is cheap, high-volume, sold increasingly online and at lease signing, and the line where insurtechs started (Lemonade's product set begins with renters). The landlord's side (requiring renters insurance, verifying it, a master policy when tenants lapse) is Property Tech's [Renters Insurance Requirements](/books/property-tech/insurance-deposits-and-guarantees#renters-insurance-requirements) and [Verification and Lapse](/books/property-tech/insurance-deposits-and-guarantees#verification-and-lapse); the insurer's side is that a landlord named as an **interested party** gets cancellation notices, and that verification requests arrive by API from property management software.

## Availability Outside Florida and California

Florida and California are where the homeowners market broke most visibly (Stressed & Residual Markets), but the pressure is national. The Treasury's Federal Insurance Office, analyzing data from over 330 insurers on more than 246 million policies for 2018 to 2022 (released January 16, 2025), found:

- Nonrenewal rates in the highest-risk ZIP codes were "about 80 percent higher" than in the lowest-risk ones.
- Homeowners in the riskiest 20% of ZIP codes paid an average premium of $2,321, 82% more than those in the least risky 20%.
- Average claims were about $24,000 in high-risk areas against about $19,000 in low-risk areas.

FIO's September 2026 annual report adds the 2025 turn: homeowners lines "benefited from nearly 12 percent growth in net premiums earned and an approximately 10 percent decline in net losses incurred," and personal lines posted a second consecutive year of underwriting profit despite significant catastrophe losses. Prices rose to meet costs, so availability eased in places while affordability did not.<!-- source-gap: homeowners-availability-states | missing | state-level homeowners availability data outside Florida and California (e.g. Louisiana, Texas, Colorado, Iowa nonrenewal and residual plan growth) | closes with: a state DOI or residual plan report with 2025-2026 figures, or the NAIC homeowners market data call | checked: 2026-11-10 -->

For the system, availability shows up as underwriting and notice volume: tighter eligibility rules by geography and roof (Underwriting Rules, Referrals & Models), more nonrenewals with state notice periods and moratoria after disasters (Catastrophe Events), more referrals to residual plans and surplus lines markets, and more mitigation data (roof type, opening protection, defensible space) collected to qualify for coverage or discounts.

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model): `risks` (kind `dwelling` or `location`), `coverages` (codes `cov_a` to `cov_f` and endorsements), and `party_roles` (mortgagee, additional interest). This chapter adds `property_characteristics` (the rating and underwriting facts about a dwelling, versioned, with their sources), `deductible_ledgers` (running annual deductibles such as Florida's hurricane deductible) and `mortgagee_requirements` (an investor's coverage rules checked at bind).

```sql
CREATE TABLE property_characteristics (    -- facts about a dwelling, with sources
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  risk_stable_key    UUID NOT NULL,         -- risks.stable_key, across versions
  characteristic     TEXT NOT NULL,         -- 'year_built', 'roof_year', 'roof_cover',
                                            -- 'construction', 'sq_ft', 'opening_protection',
                                            -- 'first_floor_height', 'defensible_space'
  value              JSONB NOT NULL,
  source             TEXT NOT NULL CHECK (source IN ('applicant', 'inspection',
                       'wind_mitigation_form', 'third_party_data', 'aerial_imagery',
                       'claim')),
  evidence_ref       TEXT,                  -- inspection report, form, vendor response
  effective          TSTZRANGE NOT NULL,    -- when the fact was true of the house
  recorded_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE deductible_ledgers (          -- annual deductibles that span claims
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_id          UUID NOT NULL REFERENCES policies (id),
  kind               TEXT NOT NULL CHECK (kind IN ('hurricane', 'named_storm',
                       'windstorm_hail')),
  period             DATERANGE NOT NULL,    -- the calendar year in FL 627.701
  amount             BIGINT NOT NULL,       -- 2% of Coverage A, fixed at the first loss
  rule_ref           TEXT NOT NULL
);

CREATE TABLE deductible_applications (
  ledger_id          UUID NOT NULL REFERENCES deductible_ledgers (id),
  exposure_id        UUID NOT NULL REFERENCES exposures (id),
  applied            BIGINT NOT NULL,
  recorded_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (ledger_id, exposure_id)
);

CREATE TABLE mortgagee_requirements (      -- investor or lender rules checked at bind
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  investor           TEXT NOT NULL,         -- 'fannie_mae', 'freddie_mac', 'fha', ...
  rule               TEXT NOT NULL,         -- 'max_deductible_pct', 'replacement_cost'
  value              JSONB NOT NULL,        -- {"pct_bp": 500}
  source_ref         TEXT NOT NULL,         -- 'Fannie Mae Selling Guide B7-3-02'
  effective          DATERANGE NOT NULL
);
```

Design choices that matter:

- **Characteristics are facts with sources and dates,** not columns on the policy: a roof replaced in 2025 changes the roof year from that date, and the rate and eligibility at each renewal read the value as of the renewal's effective date.
- **The annual deductible is a ledger** whose remaining balance is derived from its applications, so a reopened or reversed claim restores the right amount.
- **Coverage percentages resolve to dollars** in the coverage rows at each version, so a Coverage A change moves B, C and D in the same transaction and the claim reads dollars.
- **Mortgagee and interested-party roles are party roles on the policy version,** each with its own notice requirements.

## Auditing

- **Roof and age rules held:** no refusal or nonrenewal based solely on roof age where the state forbids it, and every roof-based decision stores the inspection or characteristic that justified it.
- **Required deductible options offered** in the states that require them, with the insured's choice recorded.
- **Hurricane deductibles applied across claims** in the same calendar year, reconciled per policy.
- **ACV holdbacks tracked to payment or expiry,** and total losses paid at replacement cost where the law requires.
- **Mortgagees notified** of every cancellation and nonrenewal, and named as payees on dwelling payments where the policy requires.

## What This Means for the System You Build

- **Model each coverage A to F as its own row** with dollars resolved from any percentage, and forms per state.
- **Store property characteristics as sourced, dated facts** and read them as of each transaction.
- **Encode roof rules, required deductible options and RC/ACV settlement terms** as state product configuration with effective dates.
- **Run calendar-year deductibles as ledgers** across claims and terms.
- **Check lender and investor coverage requirements at bind** when the mortgagee is known.
- **Integrate with escrow servicers and property managers** through the mortgagee and interested-party roles, and their notice duties.

## References

**Law and regulation**

- [Fla. Stat. 627.7011](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.7011.html), the required replacement cost offer, ACV-first settlement, replacement cost without holdback on total losses, and the roof age rule for roofs under 15 years and inspections showing 5 years of life
- [Fla. Stat. 627.701](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.701.html), hurricane deductible options of $500, 2%, 5% and 10%, application on a calendar-year basis, and the optional separate roof deductible
- [12 CFR 1024.17 (Cornell LII)](https://www.law.cornell.edu/cfr/text/12/1024.17), escrow cushion of one-sixth, annual analysis and the $50 surplus refund
- [12 CFR 1024.37 (Cornell LII)](https://www.law.cornell.edu/cfr/text/12/1024.37), force-placed insurance notices at 45 and 15 days, the 30-day spacing, and cancellation and refund within 15 days of evidence of coverage

**NAIC**

- [NAIC: 2025 Property and Casualty Market Share Report (PDF)](https://content.naic.org/sites/default/files/research-actuarial-property-casualty-market-share.pdf), homeowners multiple peril direct premium, the top groups' shares and loss and DCC ratios

**Regulators and guidance**

- [Texas Department of Insurance: Home insurance guide](https://www.tdi.texas.gov/pubs/consumer/cb025.html), the six homeowners coverages, personal property as a percentage of dwelling, and ALE limited to 10 to 20% of dwelling
- [US Treasury: press release on FIO's analyses of US homeowners insurance markets, January 16, 2025](https://home.treasury.gov/news/press-releases/jy2791), the data set, nonrenewal rates, premiums and claim sizes by ZIP code risk
- [US Treasury, Federal Insurance Office: Annual Report on the Insurance Industry, September 2026 (PDF)](https://home.treasury.gov/system/files/311/2026-FIO-AR.pdf), 2025 homeowners premium and loss changes and personal lines underwriting profit
- [Fannie Mae Selling Guide: B7-3-02, Property Insurance Requirements for One- to Four-Unit Properties](https://selling-guide.fanniemae.com/sel/b7-3-02/property-insurance-requirements-one-four-unit-properties), replacement cost basis with the roof exception and the 5% maximum deductible

**Filings**

- [Lemonade: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1691421/000169142126000016/lmnd-20251231.htm), products, more than 3 million customers, and the concentration of premium in California, New York and Texas
