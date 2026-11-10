+++
title = "Catastrophe Models & Their Regulators"
nav_title = "Catastrophe Models"
description = "What a cat model is and outputs (event loss tables, EP curves, AAL, PML) worked, the vendors, the Florida Commission, California 2644.4.5 and exposure data."
category = "Insurance Industry"
order = 2739
part = "Reserving, Catastrophe and Reinsurance"
tags = ["insurance", "catastrophe-models", "exceedance-probability", "regulation", "reinsurance", "ratemaking"]
+++

A catastrophe model answers the question history can't: how much would this book of business lose in the storms, earthquakes and fires that haven't happened yet? A homeowners insurer in Florida has perhaps a century of hurricane records, too few events to price a 1-in-100-year loss from experience. A model simulates tens of thousands of years of plausible events, runs each against the insurer's actual exposures (every insured building, its location, construction, age, roof and limits), and returns a loss for every event. From that list come the numbers the whole cat side of the business runs on: the average annual loss that goes into the rate, the probable maximum loss that sizes the reinsurance program, and the exceedance probability curve that rating agencies and regulators test capital against.

Because the outputs set prices and capital, regulators care which model is used and how. Florida requires insurers to use hurricane models its commission has accepted, unmodified, in residential rate filings. California opened its prior approval rates to wildfire model output with a regulation operative in December 2024, on conditions that include writing in wildfire-prone areas. The system side is exposure data: a model is only as good as the location and building characteristics fed to it, and the same exposure snapshot has to feed pricing, reinsurance and the regulator. This chapter covers what a model is and outputs, a worked event loss table with its EP curve and AAL, the vendors, Florida's commission and California's regulation, exposure data quality, and how model results reach rates and reinsurance. Actual events and their losses are [Catastrophe Events](/books/insurance/catastrophes).

## How the Platforms Do It

As of November 2026, the main US catastrophe models and where public records show them used:

| Model provider | Public evidence of use | Notes |
| --- | --- | --- |
| **Verisk** (formerly AIR Worldwide) | One of three wildfire models the California Department of Insurance completed reviewing in 2025; one of the flood and surge models FEMA used to build NFIP Risk Rating 2.0 (named there as AIR) | Platform branded Touchstone |
| **Moody's** (RMS) | One of the three California-reviewed wildfire models | |
| **Karen Clark & Company (KCC)** | One of the three California-reviewed wildfire models | Models for hurricane, flood, earthquake, wildfire, severe convective storm, winter storm and others on its RiskInsight platform; its Characteristic Event method is designed for "complete and unbiased spatial coverage" |
| **CoreLogic** | Inland flood and storm surge model used for Risk Rating 2.0 | |
| **KatRisk** | Inland flood and storm surge model used for Risk Rating 2.0 | |
| **Oasis Loss Modelling Framework** | Open source platform with a web interface, API and the ktools execution engine | Not-for-profit, driven by the (re)insurance community; reports more than 18 suppliers covering over 90 models |

Two patterns. A primary insurer typically licenses one or two vendor models, runs them in-house or through its reinsurance broker, and blends or selects results; a reinsurer runs several and adjusts them to its own view of risk. FEMA's Risk Rating 2.0 build is a public example of the second: Milliman modeled average annual losses for the NFIP's in-force policies with the AIR, CoreLogic and KatRisk models, Guy Carpenter compared them to the NFIP's historical experience and selected adjustment factors to rescale them, and the selected rating factors averaged the indications of the three models.

## What a Model Does

A catastrophe model is four steps, run for every simulated event against every exposure:

1. **Hazard.** A stochastic catalog of events (tens of thousands of simulated years of hurricanes, earthquakes, wildfires, floods), each with an annual rate and a footprint of local intensity: wind speed, ground motion, flame length, water depth.
2. **Vulnerability.** For each exposure, the damage ratio (loss divided by replacement value) the local intensity causes, given its construction, occupancy, year built, roof, number of stories and mitigation. Damage is a distribution, not a point.
3. **Financial.** The policy terms applied to the damage: deductibles (including percentage hurricane deductibles), limits, coinsurance, then reinsurance terms to get gross, ceded and net loss.
4. **Output.** Losses aggregated by event, by year, by portfolio segment.

The outputs, in the industry's vocabulary:

- **Event loss table (ELT):** one row per event, with its annual rate and the portfolio's mean loss (and standard deviation) from that event.
- **Year loss table (YLT) or period loss table:** one row per simulated year with the events in it, which is what aggregate covers and multi-event questions need.
- **Average annual loss (AAL):** the expected loss per year, the sum over events of rate times mean loss. It is the catastrophe part of the pure premium.
- **Exceedance probability (EP) curve:** the probability that losses exceed each amount in a year. The **occurrence** curve (OEP) uses the largest single event in a year, which is what a per-occurrence reinsurance layer responds to; the **aggregate** curve (AEP) uses the sum of all events in a year, which is what capital and aggregate covers respond to.
- **Return period** is the reciprocal of exceedance probability: a 1% annual exceedance probability is the 1-in-100-year loss.
- **Probable maximum loss (PML):** a loss at a stated return period on a stated curve, "the 1-in-100 OEP PML." A PML with no return period and no curve named is not a number.

## A Worked Event Loss Table

A deliberately small example, mine: six events against one homeowners portfolio, gross of reinsurance, in millions of dollars. A real ELT has tens of thousands of rows; the arithmetic is the same.

| Event | Annual rate | Mean loss | Rate × loss |
| --- | --- | --- | --- |
| E1 | 0.200 | 5 | 1.0 |
| E2 | 0.100 | 20 | 2.0 |
| E3 | 0.050 | 60 | 3.0 |
| E4 | 0.020 | 150 | 3.0 |
| E5 | 0.010 | 300 | 3.0 |
| E6 | 0.004 | 600 | 2.4 |
| **AAL** | | | **14.4** |

The **AAL is $14.4 million**. Note where it comes from: the two smallest events produce $3.0 million of it, and the three largest, each rarer than 1 in 50, produce $8.4 million. A pricing method built on ten years of history would most likely have seen only E1 and E2.

For the occurrence EP curve, treat events as independent Poisson arrivals: the probability that at least one event with loss of at least L happens in a year is 1 − e^(−λ), where λ is the sum of the rates of events with loss of at least L.

| Loss at least | λ (sum of rates) | Annual exceedance probability | Return period |
| --- | --- | --- | --- |
| 5 | 0.384 | 31.89% | 3.1 years |
| 20 | 0.184 | 16.81% | 5.9 years |
| 60 | 0.084 | 8.06% | 12.4 years |
| 150 | 0.034 | 3.34% | 29.9 years |
| 300 | 0.014 | 1.39% | 71.9 years |
| 600 | 0.004 | 0.40% | 250.5 years |

The **1-in-100 OEP PML** is the largest loss with an exceedance probability of at least 1%: here $300 million, because a $300 million loss is exceeded with 1.39% probability and the next point, $600 million, with 0.40%. In a real model, with a continuous curve, the 1% point falls between and is interpolated; with this coarse table the answer is a step. The 1-in-250 PML is $600 million.

The same table prices reinsurance. A layer of $100 million in excess of $50 million pays min(max(L − 50, 0), 100) for each event: nothing for E1 and E2, 10 for E3, 100 for E4, E5 and E6. Its expected annual loss is 0.05 × 10 + 0.02 × 100 + 0.01 × 100 + 0.004 × 100 = **$3.9 million**, a loss on line of 3.9%; a reinsurer quoting a rate on line of 9% is charging 2.3 times the modeled expected loss for volatility, capital and expenses ([Reinsurance Structures](/books/insurance/reinsurance-structures) works through a program).

And it feeds the rate. Spread over 40,000 policies, the $14.4 million AAL is $360 per policy of catastrophe pure premium before loss adjustment expense, the net cost of reinsurance and a risk load. In a Florida filing the hurricane portion of that number has to come from a commission-accepted model; in California, wildfire may come from a reviewed model only under the conditions below.

The core calculation, AAL and the occurrence exceedance probability at a threshold, from an event loss table:

```go tab="Go"
type Event struct {
	Rate float64 // annual rate
	Loss float64 // mean portfolio loss
}

// AAL is the sum of rate times mean loss over all events.
func AAL(elt []Event) float64 {
	var s float64
	for _, e := range elt {
		s += e.Rate * e.Loss
	}
	return s
}

// OEP is the annual probability that at least one event with loss >= x
// occurs, treating events as independent Poisson arrivals.
func OEP(elt []Event, x float64) float64 {
	var lambda float64
	for _, e := range elt {
		if e.Loss >= x {
			lambda += e.Rate
		}
	}
	return 1 - math.Exp(-lambda)
}
```

```rust tab="Rust"
pub struct Event {
    pub rate: f64, // annual rate
    pub loss: f64, // mean portfolio loss
}

/// Sum of rate times mean loss over all events.
pub fn aal(elt: &[Event]) -> f64 {
    elt.iter().map(|e| e.rate * e.loss).sum()
}

/// Annual probability that at least one event with loss >= x occurs,
/// treating events as independent Poisson arrivals.
pub fn oep(elt: &[Event], x: f64) -> f64 {
    let lambda: f64 = elt.iter().filter(|e| e.loss >= x).map(|e| e.rate).sum();
    1.0 - (-lambda).exp()
}
```

Production models carry a loss distribution per event, not a mean, and compute EP curves by simulation over the year loss table, so secondary uncertainty and multiple events in a year are reflected; the mean-loss version is the one to unit-test against.

## Florida's Commission

Florida created the **Florida Commission on Hurricane Loss Projection Methodology** in 1995 (ch. 95-276) and most recently amended its statute in 2026 (ch. 2026-52); as of November 2026 the 2026 Florida Statutes show Fla. Stat. 627.0628 in force. Its rules:

- **Who.** Twelve members, assigned to the State Board of Administration but exercising their powers independently: the insurance consumer advocate, the senior SBA employee responsible for the Florida Hurricane Catastrophe Fund, Citizens' executive director, the Division of Emergency Management director, the actuary on the Fund's advisory council, an Office of Insurance Regulation actuary, five members appointed by the Chief Financial Officer (an insurer actuary and university experts in insurance finance, statistics, computer system design and hurricane meteorology) and a structural engineer with wind mitigation expertise appointed by the Governor.
- **What it does.** It adopts standards and accepts or rejects methods, principles, standards, models and output ranges for hurricane loss projection, and since 2017 for personal residential flood.
- **What insurers must do.** In rate filings under 627.062, insurers must use the commission's accepted methods for hurricane loss factors and probable maximum loss levels, and "may not modify or adjust" them for PML levels. The SBA must use them, as far as feasible, for the Hurricane Catastrophe Fund's reimbursement premiums.
- **Timing.** An insurer may keep using a model in a rate filing until 120 days after the commission's acceptance of it expires. Hurricane standards are revised every odd-numbered year; flood standards, first adopted by July 1, 2017, at least every four years. For flood filings an insurer may use a straight average of model results.
- **Trade secrets.** Meeting portions discussing privately provided trade secrets in loss models are closed to the public and recorded.

For the system, the commission's regime means every Florida residential rate filing names a model version and its acceptance, every hurricane loss factor in the rate tables traces to a run of that version, and a model whose acceptance lapses has a hard 120-day horizon after which filings using it can't be made. The commission's list of accepted models by standards year is published on its site; I could not retrieve it in readable form.<!-- source-gap: fchlpm-accepted-models | missing | the list of hurricane and flood models currently accepted by the Florida Commission on Hurricane Loss Projection Methodology and their acceptance dates | closes with: the FCHLPM accepted models page or an OIR filing citing the accepted version | checked: 2026-11-10 -->

## California's Regulation

California sets rates under Proposition 103's prior approval formula, in which the catastrophe adjustment is where modeled losses can enter. The regulation that opened it to wildfire models, 10 CCR 2644.4.5 (Use of Catastrophe Models), was filed and operative December 12, 2024, under Insurance Code sections 1861.01 and 1861.05. As of November 2026 it allows:

- **Earthquake and flood:** projected annual aggregate losses "may be based on catastrophe models."
- **Other lines:** catastrophe-model losses for the fire following earthquake and terrorism adjustments.
- **Wildfire:** model output in the catastrophe adjustment for commercial property and for "qualifying residential property insurance," and for renters and HO-6 coverage, when the insurer complies with Section 2644.4.8.
- **Other perils at the commissioner's discretion,** where historical data is limited and modeling would serve at least two of Proposition 103's purposes.

Its conditions: modeling is never permitted to fill gaps in one company's data that is otherwise available; models run on in-force business as of the end of the most recent year in the recorded period; use must follow actuarial standards of practice; the applicant carries the burden of showing the model reflects the best available science and produces the most actuarially sound estimate; and the model must account for risk mitigation at the property, community and landscape scales (forest management, prescribed fire, utility mitigation and nature-based flood risk reduction among them).

The Department of Insurance opened model reviews on January 2, 2025, and by its alert of about August 1, 2025 had completed reviews of three wildfire models, from Verisk, Karen Clark & Company and Moody's, available to all insurers; insurers using them "will be mandated to provide and maintain coverage in wildfire-prone areas." Mercury, Allstate and CSAA were the first to announce rate filings using them. The write-more commitment and the companion reinsurance cost regulation are part of the Sustainable Insurance Strategy covered in [Stressed & Residual Markets](/books/insurance/stressed-markets).

## Exposure Data

The model's input is the insurer's exposure: every location with its coordinates, values and characteristics. Problems here change results more than the choice between vendors:

- **Geocoding.** A rooftop coordinate versus a ZIP centroid can move a coastal home miles from the shore in the model. Store the geocode's precision with the coordinate.
- **Replacement value.** Coverage A limits understate rebuilding cost when values lag inflation; FEMA's Risk Rating 2.0 work used replacement cost values already gathered for its reinsurance placement, and flattened its coverage value factors partly because of limits in the quality of the replacement cost data on historical exposures.
- **Primary characteristics.** Construction, occupancy, year built, stories and square footage. Unknowns default to the model's average for the region, which hides both good and bad risks.
- **Secondary modifiers.** Roof cover, roof age, roof-to-wall connections, opening protection, first floor height, foundation type, defensible space. Florida's wind mitigation credits and Risk Rating 2.0's first floor height factors are the rating side of the same data.
- **Policy terms.** Percentage deductibles, sublimits and exclusions must reach the financial module as filed; a model run that applies a flat $1,000 deductible to a book with 2% hurricane deductibles overstates losses.
- **One snapshot, many uses.** The exposure set used for a rate filing, the reinsurance submission and the Florida Hurricane Catastrophe Fund's exposure report (insured values by ZIP code as of June 30, due September 1) should be the same frozen snapshot, or the differences explained.

Open data standards exist for this exchange: the Oasis framework treats its Open Data Standards as key to transparency and interoperability between models.

## Model Results in Rates, Reinsurance and Capital

- **Rates.** Florida hurricane loss costs and California's modeled catastrophe adjustment come from model AAL plus loadings; the filing exhibits show the model, version, exposure date and results. Rate filing mechanics are in [Filing Rates & Forms](/books/insurance/rate-and-form-filing).
- **Reinsurance.** The reinsurance submission is an exposure snapshot plus modeled results; layers are placed by return period ("the program exhausts at the 1-in-130 OEP"), and reinsurers price from their own runs. HCI Group's June 2026 reinsurance disclosure states only that its limits are sufficient according to catastrophe models approved by Florida's Office of Insurance Regulation, which is how a regulator's model regime reaches the reinsurance buy.
- **Capital.** The NAIC's risk-based capital formula includes a catastrophe risk charge, and its Catastrophe Risk (E) Subgroup maintains event lists (submitted events with insured losses above US$25 million from PCS, Munich Re NatCat or Swiss Re sigma, exposed and adopted each November) used in that work ([Solvency & Capital](/books/insurance/solvency-and-capital)).
- **FEMA.** The NFIP's Risk Rating 2.0 target premiums were built from catastrophe model output with provisions for expenses, LAE and the net cost of reinsurance ([Flood & the NFIP](/books/insurance/flood-and-the-nfip)).

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model): `risks` carries each insured location's attributes. `models` and `model_inventory` ([Data, AI & Privacy Rules](/books/insurance/data-ai-and-privacy-rules)) register models for governance; a vendor cat model is registered there too. This chapter adds `exposure_snapshots` (a frozen set of locations as sent to a model), `model_runs` (one execution), and `model_event_losses` (the ELT or YLT it returned), plus `model_acceptances` for regulators' approvals.

```sql
CREATE TABLE exposure_snapshots (          -- frozen locations for a model run
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  insurer_id         UUID NOT NULL REFERENCES insurers (id),
  as_of              DATE NOT NULL,         -- in-force date of the exposures
  purpose            TEXT[] NOT NULL,       -- '{rate_filing,reinsurance,fhcf}'
  location_count     INT NOT NULL,
  total_insured_value BIGINT NOT NULL,
  file_ref           TEXT NOT NULL,         -- the exported file, hashed
  file_sha256        TEXT NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE exposure_locations (
  snapshot_id        UUID NOT NULL REFERENCES exposure_snapshots (id),
  risk_stable_key    UUID NOT NULL,         -- risks.stable_key
  policy_id          UUID NOT NULL REFERENCES policies (id),
  latitude           NUMERIC(9, 6) NOT NULL,
  longitude          NUMERIC(9, 6) NOT NULL,
  geocode_precision  TEXT NOT NULL CHECK (geocode_precision IN ('rooftop', 'parcel',
                       'street', 'zip_centroid', 'county')),
  values_by_coverage JSONB NOT NULL,        -- {"cov_a": ..., "cov_c": ...}
  characteristics    JSONB NOT NULL,        -- construction, year, roof, stories, ...
  terms              JSONB NOT NULL,        -- deductibles by peril, limits
  PRIMARY KEY (snapshot_id, risk_stable_key)
);

CREATE TABLE model_acceptances (           -- a regulator's approval of a version
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  regulator          TEXT NOT NULL,         -- 'FCHLPM', 'CA-CDI'
  model_vendor       TEXT NOT NULL,
  model_version      TEXT NOT NULL,
  peril              TEXT NOT NULL,
  accepted_on        DATE NOT NULL,
  expires_on         DATE,                  -- FL: usable until 120 days after
  conditions         TEXT                   -- e.g. CA coverage commitment
);

CREATE TABLE model_runs (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  snapshot_id        UUID NOT NULL REFERENCES exposure_snapshots (id),
  model_vendor       TEXT NOT NULL,
  model_version      TEXT NOT NULL,
  peril              TEXT NOT NULL,
  catalog            TEXT NOT NULL,         -- 'standard', 'warm_sst', ...
  perspective        TEXT NOT NULL CHECK (perspective IN ('ground_up', 'gross',
                       'ceded', 'net')),
  acceptance_id      UUID REFERENCES model_acceptances (id),
  adjustments        JSONB,                 -- vendor-to-own-view factors, if any
  aal                BIGINT NOT NULL,
  ep_points          JSONB NOT NULL,        -- [{"rp":100,"oep":...,"aep":...}, ...]
  run_at             TIMESTAMPTZ NOT NULL,
  run_by             TEXT NOT NULL          -- in-house, broker, reinsurer
);

CREATE TABLE model_event_losses (          -- the ELT (or YLT rows with year_no)
  run_id             UUID NOT NULL REFERENCES model_runs (id),
  event_id           TEXT NOT NULL,
  year_no            INT,                   -- set for year loss tables
  rate               NUMERIC(12, 10),       -- set for event loss tables
  mean_loss          BIGINT NOT NULL,
  sd_loss            BIGINT,
  PRIMARY KEY (run_id, event_id, year_no)
);
```

Design choices that matter:

- **Snapshots are immutable and hashed.** A rate filing exhibit, a reinsurance submission and the FHCF report each cite a snapshot ID; a later correction is a new snapshot.
- **A run records perspective and adjustments.** Ground-up, gross, ceded and net losses from the same run are different numbers, and a reinsurer's adjusted view is not the vendor's; mislabeling them is how a program is mispriced.
- **Florida filings check acceptance.** A filing build refuses a model run whose `acceptance_id` is null or whose acceptance expired more than 120 days before the filing date.
- **Data quality is measured per snapshot:** share of locations by geocode precision, share with unknown construction or year built, and value changes since the last snapshot.

## Auditing

- **Every modeled number in a filing or submission traces** to a model run, a model version, an acceptance where required, and a hashed exposure snapshot.
- **Snapshots reconcile** to the policy system: location counts and insured values by state and line as of the snapshot date.
- **Model changes are explained.** A change in AAL or PML between runs is decomposed into exposure change, model version change and adjustment change.
- **Regulatory use is within terms:** no Florida filing on a model past its 120-day horizon, no California wildfire filing on an unreviewed model, and California commitments tracked.

## What This Means for the System You Build

- **Freeze exposure snapshots** with geocode precision, values, characteristics and terms, and reuse one snapshot for pricing, reinsurance and regulators.
- **Store model runs with vendor, version, catalog, perspective and adjustments,** plus the ELT or YLT, not just the summary numbers.
- **Never quote a PML without a return period and curve,** and keep OEP and AEP separate.
- **Track regulators' model acceptances as dated records** that filing builds check.
- **Measure exposure data quality** every snapshot; the model can't fix a ZIP centroid.

## References

**Law and regulation**

- [Fla. Stat. 627.0628](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.0628.html), the Florida Commission on Hurricane Loss Projection Methodology: membership, required use of accepted methods for hurricane loss factors and PMLs without modification, the 120-day rule, flood standards and revision cycles, history from ch. 95-276 to ch. 2026-52
- [10 CCR 2644.4.5 (Cornell LII)](https://www.law.cornell.edu/regulations/california/10-CCR-2644.4.5), California's use of catastrophe models in ratemaking: perils and lines, wildfire conditions, the burden on the applicant, mitigation at three scales, filed and operative December 12, 2024

- [Fla. Stat. 215.555](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0200-0299/0215/Sections/0215.555.html), the Florida Hurricane Catastrophe Fund's exposure report of insured values by ZIP code as of June 30, due September 1

**NAIC**

- [NAIC: Catastrophe Risk (E) Subgroup](https://content.naic.org/cmte_e_cat_risk_sg.htm), the RBC catastrophe charge work and the annual catastrophe event lists with their sources and dates

**Regulators and guidance**

- [California Department of Insurance: alert on catastrophe model reviews (2025)](https://www.insurance.ca.gov/0400-news/0102-alerts/2025/Department-of-Insurance-expanding-covera.cfm), the reviews opened January 2, 2025, the three reviewed wildfire models, the coverage mandate and the first insurers to file
- [FEMA: NFIP Risk Rating 2.0 Methodology and Data Sources, January 18, 2022 (PDF)](https://www.fema.gov/sites/default/files/documents/FEMA_Risk-Rating-2.0_Methodology-and-Data-Appendix__01-22.pdf), the AIR, CoreLogic and KatRisk models, Guy Carpenter's rescaling, averaged factor indications, and replacement cost data limitations

**Filings**

- [HCI Group: Form 8-K on the 2026-2027 reinsurance program, June 1, 2026](https://www.sec.gov/Archives/edgar/data/1400810/000119312526249754/hci-20260601.htm), limits sufficient according to OIR-approved catastrophe models

**Vendor documentation**

- [Verisk: Touchstone](https://www.verisk.com/products/touchstone/), Verisk's catastrophe risk management software platform
- [Karen Clark & Company](https://www.karenclarkandco.com/), perils and regions modeled, the RiskInsight platform and the Characteristic Event method
- [Oasis Loss Modelling Framework](https://oasislmf.org/), the open source platform, ktools, its supplier and model counts, and Open Data Standards
