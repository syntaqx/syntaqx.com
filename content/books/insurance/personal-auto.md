+++
title = "Personal Auto"
description = "Compulsory auto insurance and minimum limits, no-fault and PIP worked, UM and UIM stacking, rideshare gaps, SR-22, state verification systems, the rate cycle."
category = "Insurance Industry"
order = 2743
part = "Personal Lines"
tags = ["insurance", "personal-auto", "no-fault", "uninsured-motorists", "sr-22", "personal-lines"]
+++

Personal auto is the largest line in US property and casualty insurance: $371.0 billion of the industry's $1.11 trillion of direct premium in 2025, by NAIC's count, written by State Farm, Progressive, GEICO, Allstate and USAA at the top and a long tail of regionals and direct writers below them. It is also the most regulated product most people buy, because driving without it is illegal in nearly every state. The state sets minimum liability limits, decides whether injuries are paid by the driver's own insurer regardless of fault (no-fault) or by the at-fault driver's, requires or makes optional coverage against uninsured and underinsured drivers, and increasingly watches each insured car through an electronic verification system that suspends registrations when coverage lapses.

For the system, a personal auto policy is a bundle of separately limited coverages per vehicle and driver, each governed by state rules that change what must be offered, what can be rejected and in what form, and what the policy reports to the state. This chapter covers compulsory insurance and minimum limits, no-fault and personal injury protection with worked benefits, uninsured and underinsured motorists coverage and stacking worked, the rideshare and delivery gaps, SR-22 and FR-44 filings, state insurance verification, and the 2022-2025 rate cycle. Rating is How a Rate Is Built and What You May Rate On; telematics is Telematics & Usage-Based Insurance; auto claims and total losses are Auto Claims & Total Loss.

## How the Platforms Do It

As of November 2026, NAIC's 2025 market share data for private passenger auto:

| Group | 2025 share of private passenger auto direct premium |
| --- | --- |
| State Farm | 18.64% |
| Progressive | 18.60% |
| Berkshire Hathaway (GEICO) | 11.56% |
| Allstate | 10.15% |
| USAA | 6.19% |
| **Industry total** | **$371.04 billion** |

The leaders reach customers differently (captive agents, independent agents, direct online and phone; Agents, Brokers & Channels), but they administer the same product shape: a policy with listed drivers and vehicles, liability coverages at the policy or vehicle level, physical damage coverages per vehicle, and state-required coverages and forms. The Federal Insurance Office's September 2026 report notes that private passenger auto liability alone is about 19% of P&C direct premium, and that personal auto results "continued to recover from poor results in 2022."

## Compulsory Insurance and Minimum Limits

Nearly every state requires liability insurance or another form of financial responsibility to register or drive a car. Limits are written as three numbers: bodily injury per person, bodily injury per accident, and property damage per accident, in thousands. The minimums are statutes, and they move:

- **California** raised its minimums for "any policy or bond issued or renewed on or after January 1, 2025" from 15/30/5 to **30/60/15** (Cal. Veh. Code 16056(a)(2)), and the same section adds a further $20,000/$40,000/$10,000 from January 1, 2035. The DMV's insurance page lists 30/60/15.
- **New York** requires 25/50 for bodily injury, $50,000/$100,000 for death, and $10,000 property damage, plus no-fault and uninsured motorists coverage (New York DMV).
- **Florida** requires no bodily injury liability for most drivers: $10,000 of personal injury protection and $10,000 of property damage liability (Fla. Stat. 324.022; Florida DHSMV). A lapse can suspend license and plates for up to three years, with a reinstatement fee of up to $500.

The Insurance Information Institute's table of financial responsibility limits by state is the usual all-states reference; the copy I could open is dated October 25, 2022, before California's change, so the system's own limits table must be maintained from each state's statute and effective dates, not from a secondary summary.<!-- source-gap: auto-minimum-limits-all-states | secondary | a current all-states table of minimum auto liability limits | closes with: a 2026 compilation from a regulator (NAIC or a state DOI) or a refreshed III table | checked: 2026-11-10 -->

What minimums mean in software:

- **A floor in the product configuration** per state and effective date; the quote can't offer less, and a renewal after the effective date must be raised (California's change applied at renewal, so every California renewal on or after January 1, 2025 needed the new floor).
- **A residual market** for drivers no one voluntarily insures (Stressed & Residual Markets), because a compulsory product must be available to every licensed driver.
- **Proof to the state**, by ID card and increasingly by electronic reporting (below).

## No-Fault and Personal Injury Protection

In a tort state the at-fault driver's liability insurance pays the other party's injuries. In a **no-fault** state each person's own policy pays their medical costs and lost wages through **personal injury protection** (PIP) regardless of fault, and the right to sue the other driver is limited by a threshold. The III lists twelve no-fault states and Puerto Rico: Florida, Hawaii, Kansas, Kentucky, Massachusetts, Michigan, Minnesota, New Jersey, New York, North Dakota, Pennsylvania and Utah. In three of them (New Jersey, Pennsylvania and Kentucky) drivers choose: they can reject the lawsuit threshold. Thresholds are verbal (a defined category of serious injury: Florida, Michigan, New Jersey, New York, Pennsylvania) or monetary (medical costs above a dollar amount: Hawaii, Kansas, Kentucky, Massachusetts, Minnesota, North Dakota, Utah).

The benefits differ by state, and each is a set of limits and percentages the claims system applies:

| State | Benefit | Rule |
| --- | --- | --- |
| **Florida** (Fla. Stat. 627.736) | $10,000 medical and disability, $5,000 death | "Eighty percent of all reasonable expenses" for medical services if initial services are received "within 14 days after the motor vehicle accident"; "Sixty percent of any loss of gross income"; medical benefits up to $10,000 if a qualified provider finds an emergency medical condition, "limited to $2,500" if not |
| **New York** (N.Y. Ins. Law 5102, 5103) | Basic economic loss "up to fifty thousand dollars per person" | Lost earnings "up to two thousand dollars per month for not more than three years," other expenses $25 a day for a year, a $2,000 death benefit; suit for non-economic loss only for a "serious injury" as defined (death, dismemberment, significant disfigurement, a fracture, permanent loss or limitation of use, and others) |
| **Michigan** (MCL 500.3107c) | A choice, for policies "issued or renewed after July 1, 2020" | $50,000 (only for a Medicaid enrollee), $250,000, $500,000 or unlimited; unlimited is the default if the insured selects nothing; an opt-out of PIP medical for a qualified person with other coverage such as Medicare Parts A and B (500.3107d) |

**Michigan's catastrophic claims fund.** The Michigan Catastrophic Claims Association reimburses insurers for 100% of PIP losses above a retention (MCL 500.3104), $580,000 for 2019 to 2021 and adjusted every two years from July 1, 2021 by the lesser of 6% or the CPI; since 2019 it has no liability for policies with a limited PIP choice, so only unlimited-PIP policies cede to it. The policy system records the insured's PIP selection and the form it was made on, because the selection decides the claim's limit and whether the fund participates decades later.

### A Florida PIP Claim, Worked

Mine, ignoring any PIP deductible the insured selected: a Florida driver is injured, receives initial treatment within 14 days, and has $9,000 of reasonable medical bills and $5,000 of lost gross income.

| | With an emergency medical condition | Without one |
| --- | --- | --- |
| Medical: 80% of $9,000 | $7,200 | $7,200, limited to $2,500 |
| Wage loss: 60% of $5,000 | $3,000 | $3,000 |
| Subtotal | $10,200 | $5,500 |
| **PIP pays** (overall $10,000 limit) | **$10,000** | **$5,500** |

The emergency medical condition finding is a coded fact on the exposure with the provider who made it, because it changes the medical limit by $7,500.

## Uninsured and Underinsured Motorists

**Uninsured motorists** (UM) coverage pays the insured's injuries (and in some states property damage) when the at-fault driver has no insurance or flees; **underinsured motorists** (UIM) coverage pays when the at-fault driver's limits are too low. States differ on three questions the system has to encode.

**Required or optional.** The III's table lists Connecticut, Illinois, Maine, Maryland, Minnesota, Nebraska, New Jersey, New York, North Carolina, North Dakota, Oregon, South Dakota, Vermont and Virginia as requiring UM and UIM, and Missouri, South Carolina, West Virginia, Wisconsin and DC as requiring UM, as of the table's October 2022 date. Elsewhere coverage must be offered and may be rejected, in writing, on the form the statute prescribes:

- **Pennsylvania** requires insurers to offer UM and UIM, but "Purchase of uninsured motorist and underinsured motorist coverages is optional" (75 Pa.C.S. 1731(a)); rejection uses statutory forms beginning "By signing this waiver I am rejecting underinsured motorist coverage," and a noncompliant form is void, which makes coverage equal to the bodily injury liability limits (1731(c.1)).
- **Florida** makes UM part of every policy unless rejected in writing "on behalf of all insureds"; the rejection form's heading must say "You are electing not to purchase certain valuable coverage which protects you and your family," and a signed form is "conclusively presumed" an informed rejection (Fla. Stat. 627.727).
- **Washington** makes coverage mandatory unless a named insured or spouse rejects it in writing (RCW 48.22.030).

**What triggers underinsured.** Some states compare the at-fault driver's limits to the insured's damages: Washington defines an underinsured vehicle as one whose liability limits are "less than the applicable damages which the covered person is legally entitled to recover." Others compare limits to limits. And the payout is either **excess** (UIM pays damages above what the at-fault driver's insurer paid, up to the UIM limit) or **limits less** (the UIM limit is reduced by the at-fault payment). Maryland shows both in one code: its standard UIM is reduced by the liability payment, and its **enhanced UIM** pays the coverage amount "without any reduction for the amount paid to the insured" by the at-fault driver's coverage (Md. Ins. Code 19-509.1, for new policies on or after July 1, 2024).

**Stacking.** With more than one car, can the insured add the UIM limits together? Pennsylvania makes stacking the default: the limit "shall be the sum of the limits for each motor vehicle," a named insured may waive it on a statutory form beginning "By signing this waiver, I am rejecting stacked limits of underinsured motorist coverage," and premiums "shall be reduced" on waiver (75 Pa.C.S. 1738). Florida lets insurers offer non-stacking coverage under which limits "shall not be added together" (Fla. Stat. 627.727(8)).

### UIM Stacking, Worked

Mine: an insured with three cars carries $100,000 per person of UIM on each. An at-fault driver with a $50,000 bodily injury limit causes $400,000 of damages, and the at-fault insurer pays its $50,000 limit.

| | Stacked ($300,000 available) | Unstacked, waived ($100,000) |
| --- | --- | --- |
| Excess UIM: min(damages − at-fault payment, limit) | min($350,000, $300,000) = **$300,000** | min($350,000, $100,000) = **$100,000** |
| Limits-less UIM: limit − at-fault payment | $300,000 − $50,000 = **$250,000** | $100,000 − $50,000 = **$50,000** |
| Insured's total recovery (with the $50,000) | $350,000 or $300,000 | $150,000 or $100,000 |

The same accident pays the insured between $100,000 and $350,000 depending on two state rules and one signed form. That is why the policy system keeps the UM/UIM selection, the stacking election, the form version the insured signed and the signature evidence for every term, and the claims system reads them as of the loss date.

```go tab="Go"
// UIMPayable returns the underinsured motorists payment.
// limit is the per-person UIM limit (already stacked if the policy stacks);
// excess selects excess (true) or limits-less (false) treatment.
func UIMPayable(damages, atFaultPaid, limit int64, excess bool) int64 {
	if excess {
		return max(0, min(damages-atFaultPaid, limit))
	}
	return max(0, min(limit-atFaultPaid, damages-atFaultPaid))
}
```

```rust tab="Rust"
/// Underinsured motorists payment. `limit` is per person, already stacked
/// if the policy stacks; `excess` selects excess or limits-less treatment.
pub fn uim_payable(damages: i64, at_fault_paid: i64, limit: i64, excess: bool) -> i64 {
    let shortfall = damages - at_fault_paid;
    let pay = if excess { shortfall.min(limit) } else { (limit - at_fault_paid).min(shortfall) };
    pay.max(0)
}
```

## Rideshare and Delivery Gaps

A personal auto policy generally excludes using the car to carry passengers or deliveries for a fee, so a driver working for a transportation network company is covered by the platform's commercial policy in some periods and by nothing in others unless the state fills the gap. California's statute is the template many states follow: while the driver is logged into the app but hasn't accepted a ride, the TNC's coverage must provide at least $50,000 per person, $100,000 per incident and $30,000 for property damage, plus excess coverage of at least $200,000 per occurrence; from acceptance until the ride ends, primary coverage of $1,000,000 (Cal. Pub. Util. Code 5433). The platform side, the three periods and how platforms prove coverage are in [Rideshare Insurance Periods](/books/user-generated-platforms/gig-work-and-worker-law#rideshare-insurance-periods); the insurance side is that personal auto carriers file endorsements that cover the logged-in period (or explicitly exclude it), and a claim's first question is which period the driver was in, which the claims system answers from the platform's trip data.

## SR-22 and FR-44 Filings

After a serious violation (driving uninsured, a DUI, an unpaid judgment), a state can require a driver to prove future financial responsibility: the insurer files a certificate with the state, usually called an **SR-22** (some states use other form names, and some require higher limits after alcohol offenses), and must notify the state if the policy ends. California's DMV may require a "California Proof of Insurance Certificate (SR 22)." Florida sets higher limits after a DUI conviction: $100,000 per person, $300,000 per accident and $50,000 property damage, which "must be carried for a minimum period of 3 years" (Fla. Stat. 324.023).

For the system an SR-22 is a regulatory filing attached to a policy and a driver, with a required duration, required limits and a duty to notify the state on cancellation or lapse. The notice to the state is an event on the policy transaction stream, triggered by any cancellation, nonrenewal or lapse while the filing is active, and its timing follows the state's rule.<!-- source-gap: sr22-cancellation-notice-days | missing | the number of days' notice an insurer must give a state DMV before an SR-22 is cancelled (state examples) | closes with: a state DMV or statute page (e.g. Texas DPS, California DMV SR-1P) | checked: 2026-11-10 -->

## State Insurance Verification

States increasingly verify coverage electronically instead of trusting paper ID cards:

- **Texas** runs **TexasSure**, created under Transportation Code chapter 601, subchapter N, "to reduce the number of uninsured motorists in Texas," as a partnership of TDI, DPS, the DMV and the Department of Information Resources. Insurers report their policies to it; law enforcement and registration offices query it, and courts have access through the state's law enforcement network.
- **New York** requires the insurer to "send an electronic notice of insurance coverage to the DMV"; an agent or broker cannot file it. A lapse of "91 days or more" suspends the driver's license, plates and registration must be surrendered, and restoring a revoked license carries a $750 civil penalty.
- **California** requires insurers to report private-use vehicle coverage electronically under Vehicle Code 16058, and commercial and fleet coverage since January 1, 2023.
- **The IICMVA model.** The Insurance Industry Committee on Motor Vehicle Administration, formed in 1968 by an AAMVA resolution, publishes a model user guide for **web services** verification (version 7.0) and model legislation for an "on-line, event-based, evidence of insurance inquiry service": instead of insurers sending bulk files, the state asks the insurer's service in real time whether a VIN and policy are covered on a date.

Two integration patterns follow. **Book of business reporting**: the insurer sends new business, changes and cancellations to the state on a schedule, and the state matches them to registrations. **Online verification**: the insurer exposes an inquiry service the state calls with a policy number or VIN and a date. Either way the answer must be the coverage as of the asked date, which is a bitemporal query against policy versions ([Temporal Data](/docs/database/temporal-data#as-of-queries)), and a wrong answer suspends a customer's registration.

## The 2022-2025 Rate Cycle

The auto market went through its sharpest repricing in decades. The consumer price index for motor vehicle insurance (BLS series CUUR0000SETE, not seasonally adjusted) rose, December to December:

| Year | 12-month change |
| --- | --- |
| 2021 | 4.1% |
| 2022 | 14.2% |
| 2023 | 20.3% |
| 2024 | 11.3% |
| 2025 | 2.8% |

The 12-month change peaked at 22.6% in April 2024; by 2026 it turned negative, reaching −5.0% in September 2026 (BLS has no October 2025 figure, a gap from the 2025 lapse in appropriations). Behind it: repair costs, used car values and injury severity rose faster than rates after 2021, insurers filed large rate increases state by state (Filing Rates & Forms), and results recovered. Progressive's net premiums earned went from $49.2 billion in 2022 to $58.7 billion in 2023 and $70.8 billion in 2024; FIO reports that by 2025 personal lines recorded a second consecutive year of underwriting profit and that personal rate increases "have abated," in isolated cases turning to reductions.

For the system the cycle shows up as volume: hundreds of state rate filings a year per large carrier, each a new rate table version with new business and renewal effective dates (How a Rate Is Built), and renewal offers with larger changes that trigger state notice rules (Endorsements, Renewals & the Policy Transaction Model).

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model): `risks` (kinds `vehicle` and `driver`), `coverages` (codes such as `bi`, `pd`, `pip`, `um`, `uim`, `coll`, `comp`), `policy_transactions`, `notices` (Cancellation, Nonrenewal & Notice Law) and `regulatory_filings` (Filing Rates & Forms). This chapter adds `coverage_elections` (signed selections and rejections), `insurance_verifications` (reports and inquiries with a state system) and `sr22_filings`.

```sql
CREATE TABLE coverage_elections (          -- what the insured chose, on which form
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_version_id  UUID NOT NULL REFERENCES policy_versions (id),
  state              TEXT NOT NULL,
  election           TEXT NOT NULL,         -- 'um_reject', 'uim_lower_limits',
                                            -- 'uim_stacking_waiver', 'pip_choice',
                                            -- 'tort_option', 'pip_medical_optout'
  value              JSONB NOT NULL,        -- {"pip_limit": 25000000} or {"waived": true}
  form_id            UUID NOT NULL,         -- forms (Products, Coverages & Forms)
  signed_by_party_id UUID NOT NULL REFERENCES parties (id),
  signed_at          TIMESTAMPTZ NOT NULL,
  signature_evidence TEXT NOT NULL,         -- e-sign envelope or scanned form
  rule_ref           TEXT NOT NULL          -- '75 Pa.C.S. 1738(d)', 'FL 627.727(1)'
);

CREATE TABLE insurance_verifications (     -- traffic with a state verification system
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  state              TEXT NOT NULL,
  system             TEXT NOT NULL,         -- 'TexasSure', 'NY DMV', 'CA DMV EIR', ...
  direction          TEXT NOT NULL CHECK (direction IN ('report', 'inquiry')),
  policy_id          UUID REFERENCES policies (id),
  vin                TEXT,
  as_of_date         DATE NOT NULL,         -- the coverage date reported or asked
  event              TEXT,                  -- 'new', 'change', 'cancel', 'reinstate'
  response           TEXT,                  -- 'confirmed', 'unconfirmed', 'error'
  transaction_id     UUID REFERENCES policy_transactions (id),
  sent_at            TIMESTAMPTZ NOT NULL,
  acknowledged_at    TIMESTAMPTZ,
  payload_ref        TEXT NOT NULL
);

CREATE TABLE sr22_filings (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_id          UUID NOT NULL REFERENCES policies (id),
  driver_party_id    UUID NOT NULL REFERENCES parties (id),
  state              TEXT NOT NULL,
  kind               TEXT NOT NULL CHECK (kind IN ('sr22', 'fr44', 'other')),
  required_limits    JSONB NOT NULL,        -- {"bi": [10000000, 30000000], "pd": 5000000}
  required_until     DATE NOT NULL,         -- e.g. 3 years in FL 324.023
  filed_at           TIMESTAMPTZ NOT NULL,
  state_ack_ref      TEXT,
  terminated_at      TIMESTAMPTZ,           -- the termination notice sent to the state
  termination_reason TEXT
);
```

Design choices that matter:

- **A cancellation fans out.** One cancellation transaction produces the insured's notice, the lienholder's notice, a verification report to the state, an SR-22 termination notice if one is active, and a commission clawback, each a record with its own deadline ([Events & Async Messaging](/docs/architecture/events)).
- **Elections are versioned with the policy** and carried to renewals only when the state allows (some rejections persist until the insured asks otherwise; a new form version may require a new signature).
- **Claims read elections as of the loss date,** never the current policy.
- **State systems get the effective date, not the processed date:** a backdated cancellation must report the coverage end the state will use.

## Auditing

- **Every rejection or lower-limit selection** has a signed form of the statutory version with evidence; a missing or noncompliant form is treated as no rejection (Pennsylvania voids it).
- **Minimum limits held** on every policy version from each state's effective date, including renewals after a change.
- **Verification reports reconcile** to the policy system: every new business, cancellation and reinstatement reported within the state's window, every rejection by the state system worked.
- **SR-22 terminations sent** for every ended policy with an active filing.
- **PIP and UIM claims** paid with the limit, percentage, threshold finding and stacking election in force on the loss date.

## What This Means for the System You Build

- **Encode minimum limits, required coverages and rejection rules per state with effective dates** as product configuration.
- **Store every election with its signed form, version and evidence,** and read them as of the loss date.
- **Model PIP benefits as rules:** percentages, sublimits, thresholds and choices per state.
- **Compute UIM by the state's trigger, excess or limits-less treatment and stacking election.**
- **Report coverage to state verification systems** from policy transactions, by effective date, and answer inquiries bitemporally.
- **Treat SR-22s as filings with durations and termination duties** wired to cancellation events.

## References

**Law and regulation**

- [Cal. Veh. Code 16056 (FindLaw)](https://codes.findlaw.com/ca/vehicle-code/veh-sect-16056/), California minimums of 30/60/15 for policies issued or renewed on or after January 1, 2025 and the 2035 increase
- [Cal. Pub. Util. Code 5433 (FindLaw)](https://codes.findlaw.com/ca/public-utilities-code/puc-sect-5433/), transportation network company coverage while logged in ($50,000/$100,000/$30,000 plus $200,000 excess) and $1,000,000 primary from acceptance to completion
- [Fla. Stat. 324.022](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0300-0399/0324/Sections/0324.022.html), $10,000 property damage liability
- [Fla. Stat. 324.023](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0300-0399/0324/Sections/0324.023.html), 100/300/50 limits after a DUI conviction for at least 3 years
- [Fla. Stat. 627.736](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.736.html), PIP: $10,000 and $5,000 death, 80% medical with initial services within 14 days, 60% of lost income, the emergency medical condition and the $2,500 limit
- [Fla. Stat. 627.727](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.727.html), UM rejection on behalf of all insureds, the required form heading, the conclusive presumption, and non-stacking coverage
- [MCL 500.3107c](https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-500-3107c), [500.3107d](https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-500-3107d) and [500.3104](https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-500-3104), Michigan's PIP choices from July 1, 2020, the medical opt-out, and the Catastrophic Claims Association's retention and scope
- [N.Y. Ins. Law 5102](https://www.nysenate.gov/legislation/laws/ISC/5102) and [5103](https://www.nysenate.gov/legislation/laws/ISC/5103), basic economic loss of $50,000, the earnings and expense limits, the serious injury threshold and the $2,000 death benefit
- [75 Pa.C.S. 1731](https://www.palegis.us/statutes/consolidated/view-statute?txtType=PDF&ttl=75&div=0&chapter=17&section=31&subsctn=0) and [1738](https://www.palegis.us/statutes/consolidated/view-statute?txtType=PDF&ttl=75&div=0&chapter=17&section=38&subsctn=0), Pennsylvania's optional UM and UIM, rejection forms, void noncompliant forms, stacking by default, the waiver form and premium reduction
- [RCW 48.22.030](https://app.leg.wa.gov/RCW/default.aspx?cite=48.22.030), Washington's underinsured definition by damages and written rejection
- [Md. Ins. Code 19-509.1](https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gin&section=19-509.1&enactments=false), enhanced underinsured motorist coverage without reduction for the liability payment

**NAIC**

- [NAIC: 2025 Property and Casualty Market Share Report (PDF)](https://content.naic.org/sites/default/files/research-actuarial-property-casualty-market-share.pdf), private passenger auto direct premium and the top five groups' shares

**Regulators and guidance**

- [California DMV: Insurance requirements](https://www.dmv.ca.gov/portal/vehicle-registration/insurance-requirements/), 30/60/15, the SR 22 certificate, and electronic reporting under Vehicle Code 16058 including commercial vehicles from January 1, 2023
- [Florida DHSMV: Insurance](https://www.flhsmv.gov/insurance/), the $10,000 PIP and $10,000 PDL requirement and lapse consequences
- [New York DMV: Insurance requirements](https://dmv.ny.gov/insurance/insurance-requirements) and [Insurance lapses](https://dmv.ny.gov/insurance/insurance-lapses), minimum coverage, the insurer's electronic notice, and suspension after a 91-day lapse
- [TexasSure](https://www.texassure.com/), the verification program's statutory basis, purpose and partners
- [US Bureau of Labor Statistics: CPI motor vehicle insurance, CUUR0000SETE](https://data.bls.gov/timeseries/CUUR0000SETE?output_view=pct_12mths), 12-month changes 2021 to 2026
- [US Treasury, Federal Insurance Office: Annual Report on the Insurance Industry, September 2026 (PDF)](https://home.treasury.gov/system/files/311/2026-FIO-AR.pdf), auto's share of premium, the recovery from 2022 and abating personal rate increases

**Standards**

- [IICMVA: Publications](https://www.iicmva.com/publications/), the web services model user guide, the white paper on verifying evidence of liability insurance, and online verification model legislation

**Filings**

- [Progressive: Exhibit 13 to Form 10-K for 2024](https://www.sec.gov/Archives/edgar/data/80661/000008066125000007/pgr-20241231_d2.htm), net premiums earned for 2022 to 2024

**In practice**

- [Insurance Information Institute: Background on compulsory auto and uninsured motorists](https://www.iii.org/article/background-on-compulsory-auto-uninsured-motorists), the limits by state table dated October 25, 2022 and required UM and UIM by state
- [Insurance Information Institute: Background on no-fault auto insurance](https://www.iii.org/article/background-on-no-fault-auto-insurance), the no-fault states, choice states and verbal and monetary thresholds
