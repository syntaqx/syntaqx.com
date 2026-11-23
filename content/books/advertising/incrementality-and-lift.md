+++
title = "Incrementality & Lift"
description = "How platforms measure what ads caused: user holdouts, ghost ads, PSA and intent-to-treat tests, geo experiments, synthetic controls and lift study records."
category = "Advertising Industry"
order = 2936
part = "Measurement"
tags = ["advertising", "ad-tech", "measurement", "incrementality", "experiments", "data-model"]
+++

Incrementality is the difference between what happened with the ads and what would have happened without them. Attribution can't measure it: a platform that credits every conversion following one of its ads will credit people who were going to buy anyway, and the more precisely a campaign targets likely buyers (retargeting, brand search, lookalikes of existing customers), the more of its attributed conversions are ones it didn't cause. The way to know is an experiment: randomly withhold the ads from some people or some places, and compare outcomes. A lift study is that experiment, run by the platform for an advertiser, and its result (incremental conversions, relative lift, incremental cost per acquisition, incremental ROAS) is the number the attributed one should be checked against.

It is hard on the platform side because an ad auction is not a clean experiment. The control group must be the people who would have seen the ad, not everyone, or the effect is diluted to nothing; the ad system optimizes delivery toward converters, so whoever sees a placebo ad is not comparable to whoever sees the real one; withholding ads costs the advertiser reach and the platform revenue; competitors fill the slots the control group doesn't get; users span devices and geographies leak into each other; and the result has to be computed from conversions the platform received from the advertiser, under the same consent rules as attribution. The industry's answers (ghost ads, predicted ghost ads, geo experiments, synthetic controls) are each a way around one of those problems.

This chapter covers the estimands (intent-to-treat and treatment-on-the-treated), user-level holdouts and why PSA tests break under optimized delivery, ghost ads and predicted ghost ads, geo experiments, matched markets, time-based regression and synthetic controls, power and duration, what Google's and Meta's lift tools expose, what counts as an experiment under the MRC's outcomes standard, and the records a platform keeps, with a deterministic assignment and ghost-logging sketch in Go and Rust. It extends `campaigns` and `conversions` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model). The generic experiment machinery (randomization units, power, peeking, interference, holdouts) is the playbook's [Experimentation](/docs/telemetry/experimentation); the advertiser's own geo tests and lift calendar are Commerce's [Incrementality and Geo Tests](/books/commerce/acquisition-and-attribution#incrementality-and-geo-tests); attribution is [Attribution](/books/advertising/attribution); and using lift results to calibrate a mix model is [Marketing Mix Modeling](/books/advertising/marketing-mix-modeling).

## How the Platforms Do It

As of November 2026, from each tool's documentation:

| Tool | Design | Metrics | Access and notes |
| --- | --- | --- | --- |
| **Google Conversion Lift** | User-based (groups from "aggregated user attributes") or geography-based (groups from "aggregated geographical data," which "support offline data"); treatment "People who see your ads," control "People who don't see your ads" | User-based: incremental conversions, relative lift, incremental conversion value, iCPA, iROAS; geo-based: iROAS, incremental conversions, value and cost | "Conversion Lift isn't available for all Google Ads accounts"; requires a Google representative |
| **Google Meridian GeoX** | "Cross-platform, geo-experiment solution" in the Meridian toolkit | Lift results fed into the MMM through Meridian's automated calibration | "Now available globally" (the announcement is undated) |
| **Meta ad studies** (Marketing API `AdStudy` reference) | The create call's `type` values include `LIFT`, `SPLIT_TEST`, `CONTINUOUS_LIFT_CONFIG` and `GEO_LIFT` (the field description itself names only split tests and lift); cells with `treatment_percentage` and `control_percentage` fields | Objectives per study, a `confidence_level` for power and reporting, an observation period after the study | Each cell's treatment percentage at least 10; start time and cell treatment percentages can't change once running. This is the API reference only; Meta's help pages for its lift tests didn't load for review |
| **Meta GeoLift** (open source) | Geo experiments with synthetic control methods, power calculators and "data-driven market selection" | Geo-level lift | R (4.0.0 or newer), MIT licensed |
| **Google research** (Vaver and Koehler 2011; Kerman, Wang and Vaver 2017) | Randomized geo experiments; time-based regression for few geos | ROAS from geo-level response | The published methods behind geo tools |

Brand lift studies (surveys of exposed and control groups about recall and consideration) use the same split with a survey as the outcome; this chapter is about conversion lift, but the records are the same.

## What Is Being Estimated

The playbook's experiment vocabulary applies ([Randomization Units and Assignment](/docs/telemetry/experimentation#randomization-units-and-assignment)), with two estimands that advertising keeps apart:

- **Intent-to-treat (ITT).** Compare everyone assigned to treatment with everyone assigned to control, whether or not they were ever exposed. It is always valid, cheap and compatible with geo randomization, but its precision is poor when most assigned users never see the ad: Johnson, Lewis and Nubbemeyer note that "ITT's precision is poor when the proportion of untreated users is high, as is often the case in practice."
- **Treatment-on-the-treated (TOT).** Compare the users who were exposed with the users in control who would have been exposed. This is what an advertiser means by "the effect of my ad," and it is far more precise, but it needs to know who in the control group would have been exposed, which is the hard part.

From either, the reported numbers follow:

```text
incremental_conversions = conv_treatment - conv_control × (n_treatment / n_control)
relative_lift           = incremental_conversions / (conv_treatment - incremental_conversions)
iCPA                    = spend / incremental_conversions
iROAS                   = incremental_conversion_value / spend
```

Google's definition of iCPA is exactly that: "the total spend divided by Incremental Conversions." A study reports each with a confidence or credible interval; a point estimate without one is not a result.

## User Holdouts, PSAs and Why They Break

The classic design shows the control group a public service announcement (PSA) in place of the advertiser's ad: both groups are "exposed," so comparing exposed treatment users with PSA-exposed control users estimates the effect on the treated. Johnson, Lewis and Nubbemeyer's paper on ghost ads lays out why it fails on a modern platform:

- **Cost and coordination.** "PSAs are expensive and prone to errors because they require coordination among advertisers, publishers, and third-party charities," which pushes advertisers to tiny control groups (in one study they cite, the advertiser wanted "less than 2% of users in the control group"), wrecking precision.
- **Optimized delivery breaks the symmetry.** Performance-optimized campaigns break PSA tests: "to maximize performance of the treatment ad and PSA, the ad platform will assign different types of users to be exposed to the PSA or treatment ad," so "the PSA-exposed users are no longer a valid holdout group." The paper notes that two thirds of online display dollars at the time used performance-optimizing technology.
- **PSAs aren't nothing.** A PSA displaces competitors' ads the control user would otherwise have seen, so the comparison isn't against the world without the campaign.

A plain user holdout (control users simply don't get the advertiser's ads, and the platform logs nothing else) avoids PSAs but only supports ITT, with its dilution.

## Ghost Ads

Ghost ads solve the counterfactual-exposure problem inside the ad platform. From the paper's abstract: the method identifies "the control-group counterparts of the exposed consumers in a randomized experiment." Concretely, for a user in control, the platform runs its normal decision; whenever the advertiser's ad would have won, it records a **ghost impression** (the ad would have shown here) and then serves whatever would have won without the advertiser's ad. Control users see the ads they'd see in a world without the campaign; the platform knows exactly which of them would have been exposed and when. Treated users who were exposed are then compared with control users who had ghost impressions, and the comparison is symmetric even under optimized delivery, because the same optimizer made both decisions.

The paper's results: relative to PSA and ITT tests, ghost ads "can reduce the cost of experimentation, improve measurement precision, and work with modern ad platforms that optimize ad delivery in real-time"; in an online retailer's retargeting campaign, a setting where "a PSA test would be severely biased," the ads "lifted website visits by 17% and purchases by 11%"; and advertisers "can measure ad lift just as precisely while spending at least an order of magnitude less."

**Predicted ghost ads.** A plain ghost ad isn't always observable: when the platform suggests an ad to a downstream publisher that can reject it, the control group has no record of the cases where the publisher would have refused, and the arms stop being symmetric. The variant runs a simulated auction for both treatment and control users, before the real winner is chosen, to predict whether the advertiser's ad would be delivered, logs those predicted ghost impressions, and uses the prediction (for both arms, so it stays symmetric) as an instrument. The paper describes it as "compatible with online display advertising platforms" and reports an implementation recording "more than 100 million predicted ghost ads per day." The cost of the prediction is noise, since predicted and actual exposure differ; the gain is that it doesn't depend on seeing the final serve.

What a ghost ad design requires of the platform's records:

- **Assignment before decision.** The user's arm is fixed before any ad decision, by deterministic hashing of a stable identifier with a study salt, so the same user is in the same arm on every request and every device the identifier covers.
- **A ghost log beside the event log.** Ghost impressions are not `ad_events`: they never rendered, never bill and never enter delivery counts. They are their own records with the auction they came from.
- **The same eligibility on both sides.** Targeting, frequency caps, pacing and bid logic run identically for treatment and control users; only the final serve differs. A frequency cap that counts ghost impressions in control but real impressions in treatment keeps the arms symmetric; one that doesn't count ghosts gives control users more ghost exposures than treatment users get real ones.
- **Outcomes from the same pipe.** Conversions for both arms come from the same conversion actions and receipts ([Attribution](/books/advertising/attribution#receiving-conversions)), not attributed, just counted per unit.

## Geo Experiments

When user-level randomization is impossible (no stable identifier, offline sales, TV, a channel the platform doesn't control) or not trusted, the unit becomes a region. Vaver and Koehler's Google paper describes the design: "non-overlapping geographic regions" are randomly assigned to control or treatment, and each region receives its condition through geo-targeted advertising. Spend goes up, down or off in treatment regions; total outcomes (sales from the advertiser's order book, store visits, sign-ups) are compared with control regions.

Geo tests need nothing but regional targeting from the platform, which is why they work for every channel and why they are the advertiser's default ([Incrementality and Geo Tests](/books/commerce/acquisition-and-attribution#incrementality-and-geo-tests)). The methods differ in how they build the counterfactual:

- **Randomized geos with regression.** Many regions, random assignment, a regression of post-period response on pre-period response; Vaver and Koehler's approach.
- **Time-based regression.** When few regions are available ("smaller countries, or subregions of larger countries," and matched-market tests comparing "a single control region" with "a single test region"), Kerman, Wang and Vaver's method "predicts the time series of the counterfactual market response" from the control series and estimates the cumulative effect at the end.
- **Synthetic control.** Build the counterfactual for the treated regions as a weighted combination of untreated regions that tracked them before the test. Meta's GeoLift measures lift "at a Geo-level using the latest developments in Synthetic Control Methods" (it depends on the `augsynth` package) and adds power calculators and market selection.
- **Matched markets.** Pair regions that look alike and treat one of each pair; simple, fragile when the match drifts.

The geo design problems are interference problems ([Interference and Network Effects](/docs/telemetry/experimentation#interference-and-network-effects)): people commute, shop and stream across regional boundaries; targeting by IP-derived location leaks; national TV and press reach control regions anyway; and a handful of large regions can dominate the result. Platforms report geo results at the region level (iROAS, incremental conversions) because the unit is the region; there is no user-level answer.

## Power, Duration and Pre-Registration

A lift study is expensive (lost reach in control, analyst time, the opportunity cost of waiting), so it should be designed to answer its question:

- **Power first.** The minimum detectable lift follows from baseline conversion rate, control share, exposure rate and duration ([Sample Size and Power](/docs/telemetry/experimentation#sample-size-and-power)). Meta's `AdStudy` reference describes a `confidence_level` "used in power calculations and final study report," and GeoLift ships power calculators. A study whose detectable lift is larger than any plausible effect is not worth running.
- **Fix the window and the observation period.** Conversions keep arriving after the study's delivery ends; Meta's study has an `observation_end_time` for an observation period that "starts when the study period ends." The outcome window is set before the start, as are the primary metric and the analysis method.
- **Don't peek and stop.** Stopping when the result looks good inflates false positives unless the analysis is sequential by design ([Peeking and Sequential Testing](/docs/telemetry/experimentation#peeking-and-sequential-testing)).
- **Lock the design.** Meta's API reference says "Once the study runs, you cannot update start_time, treatment_percentage for cells" and "You cannot remove associated objects such as adsets, adaccounts, campaigns," though `end_time` can still be moved later while the study hasn't ended, and its delete call on a study isn't supported. A study whose split changed midway is two studies with a contaminated boundary.
- **Multi-cell for comparisons.** Comparing two strategies (two creatives, prospecting versus retargeting) is several treatment cells with a shared or separate control; Meta's reference says each cell's treatment percentage "should be at least 10" and that the sum across cells "should be less or equal to 100."

## What Counts as an Experiment

The MRC's Outcomes and Data Quality Standard draws the line a platform's reporting must respect: "An experiment (RCT) uses randomization," and an approach that doesn't randomly control treatment "would be considered an observational approach." A synthetic control on a geo test is randomized only if the treated regions were chosen randomly; one where the advertiser picked the regions is observational with a strong counterfactual model. Attribution, data-driven or not, is observational. Mix models are observational unless calibrated with experiments, and even then the calibration doesn't make them experiments.

So every lift result a platform reports carries its design (randomized user holdout, ghost ads, predicted ghost ads, randomized geo, non-random geo with synthetic control), its estimand (ITT or TOT), its interval, and whether the treatment assignment was random. The IAB and MRC retail media guidelines list the same family (randomized controlled trials, synthetic controls, matched-market tests and machine learning models) for retail incrementality, and [Retail Media Networks](/books/advertising/retail-media-networks) applies them to closed-loop sales.

## How to Build It

A lift study adds the study and its cells, the assignment of units to arms, the ghost impressions for control units, and the analyzed results. Commerce's `lift_tests` is the advertiser's record of a test and its answer; a platform-run study here is the source of that answer, and the advertiser imports `lift_study_results` into its own table.

```sql
CREATE TABLE lift_studies (              -- one experiment, designed before it starts
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  ad_account_id         UUID NOT NULL REFERENCES ad_accounts (id),
  name                  TEXT NOT NULL,
  design                TEXT NOT NULL CHECK (design IN ('user_itt', 'user_psa', 'ghost_ads',
                          'predicted_ghost_ads', 'geo_randomized', 'geo_synthetic_control',
                          'geo_matched_market', 'brand_survey')),
  unit                  TEXT NOT NULL CHECK (unit IN ('user', 'household', 'device', 'geo')),
  random_assignment     BOOLEAN NOT NULL,  -- false: observational, whatever the method
  salt                  TEXT NOT NULL,     -- hashing salt for user-level assignment; never reused
  primary_metric        TEXT NOT NULL,     -- a conversion_actions.id as text, or 'store_sales'
  conversion_action_ids UUID[] NOT NULL DEFAULT '{}',
  min_detectable_lift_bp INT,              -- from the power analysis, basis points of baseline
  confidence_level_bp   INT NOT NULL DEFAULT 9000,
  study_period          TSTZRANGE NOT NULL,
  observation_end       TIMESTAMPTZ NOT NULL,  -- conversions counted until here
  status                TEXT NOT NULL CHECK (status IN ('draft', 'running', 'observing',
                          'analyzed', 'invalidated')),
  locked_at             TIMESTAMPTZ,       -- set at start; design fields immutable after
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (observation_end >= upper(study_period))
);

CREATE TABLE lift_study_cells (          -- a treatment strategy and its share of units
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  lift_study_id        UUID NOT NULL REFERENCES lift_studies (id),
  name                 TEXT NOT NULL,
  campaign_ids         UUID[] NOT NULL,   -- what is withheld from this cell's control
  treatment_share_bp   INT NOT NULL CHECK (treatment_share_bp BETWEEN 1 AND 10000),
  control_share_bp     INT NOT NULL CHECK (control_share_bp BETWEEN 1 AND 10000),
  test_geos            TEXT[],            -- geo designs: the assigned regions
  control_geos         TEXT[],
  UNIQUE (lift_study_id, name),
  CHECK (treatment_share_bp + control_share_bp <= 10000)
);

CREATE TABLE lift_study_assignments (    -- which arm a unit landed in; written on first sight
  lift_study_id   UUID NOT NULL REFERENCES lift_studies (id),
  unit_key        TEXT NOT NULL,          -- a keyed hash of the user ID, or the geo code
  cell_id         UUID NOT NULL REFERENCES lift_study_cells (id),
  arm             TEXT NOT NULL CHECK (arm IN ('treatment', 'control')),
  first_seen_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (lift_study_id, unit_key)
);

CREATE TABLE ghost_impressions (         -- the advertiser's ad would have served to a control unit
  id              UUID NOT NULL DEFAULT uuidv7(),
  occurred_at     TIMESTAMPTZ NOT NULL,
  lift_study_id   UUID NOT NULL,
  cell_id         UUID NOT NULL,
  unit_key        TEXT NOT NULL,
  auction_id      UUID,                   -- the auction that would have been won
  line_item_id    UUID NOT NULL,
  predicted       BOOLEAN NOT NULL,       -- predicted ghost ads: the prediction, not the auction
  PRIMARY KEY (occurred_at, id)
) PARTITION BY RANGE (occurred_at);     -- never joined into ad_events or delivery_daily

CREATE TABLE lift_study_exposures (      -- each unit's first exposure: a real impression or a ghost
  lift_study_id    UUID NOT NULL REFERENCES lift_studies (id),
  unit_key         TEXT NOT NULL,
  cell_id          UUID NOT NULL REFERENCES lift_study_cells (id),
  arm              TEXT NOT NULL CHECK (arm IN ('treatment', 'control')),
  first_exposed_at TIMESTAMPTZ NOT NULL,
  exposures        INT NOT NULL DEFAULT 1, -- real impressions in treatment, ghosts in control
  PRIMARY KEY (lift_study_id, unit_key)
);

CREATE TABLE lift_study_results (        -- one analysis of one cell and metric
  id                       UUID PRIMARY KEY DEFAULT uuidv7(),
  lift_study_id            UUID NOT NULL REFERENCES lift_studies (id),
  cell_id                  UUID NOT NULL REFERENCES lift_study_cells (id),
  metric                   TEXT NOT NULL,
  estimand                 TEXT NOT NULL CHECK (estimand IN ('itt', 'tot')),
  method_version           TEXT NOT NULL, -- analysis code commit or library version
  treatment_units          BIGINT NOT NULL,
  control_units            BIGINT NOT NULL,
  treatment_conversions    BIGINT NOT NULL,
  control_conversions      BIGINT NOT NULL,
  incremental_conversions_milli BIGINT NOT NULL,  -- thousandths, can be negative
  relative_lift_bp         INT,
  ci_low_bp                INT,
  ci_high_bp               INT,
  incremental_value_micros BIGINT,
  spend_micros             BIGINT NOT NULL,
  currency                 CHAR(3) NOT NULL,
  analyzed_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  superseded_by            UUID REFERENCES lift_study_results (id)
);

ALTER TABLE campaigns ADD COLUMN lift_study_id UUID;   -- the study a campaign is currently in
ALTER TABLE campaigns ADD CONSTRAINT campaigns_lift_study_fk
  FOREIGN KEY (lift_study_id) REFERENCES lift_studies (id) NOT VALID;
ALTER TABLE conversions ADD COLUMN lift_unit_key TEXT;  -- the unit key, set when a study counts it
```

Assignment is a pure function of the study's salt and the unit, so every server makes the same decision with no lookup, and the assignment table is written only for audit and analysis. Serving then branches: treatment units are served normally; control units get a ghost impression logged when the advertiser's line item wins, and the decision is re-run without the study's campaigns:

```go tab="Go"
type Request struct {
	UnitKey string // the study's unit: a stable user ID's keyed hash, or a geo code
}

type Study struct {
	ID, CellID, Salt string
	ControlShareBp   uint64
	Campaigns        map[string]bool // the campaigns withheld from control
}

// Arm assigns a unit to treatment or control from a keyed hash, stable across requests.
func Arm(salt, unitKey string, controlShareBp uint64) string {
	mac := hmac.New(sha256.New, []byte(salt))
	mac.Write([]byte(unitKey))
	bucket := binary.BigEndian.Uint64(mac.Sum(nil)[:8]) % 10000
	if bucket < controlShareBp {
		return "control"
	}
	return "treatment"
}

type Decision struct {
	LineItemID string
	CampaignID string
	AuctionID  string
}

type Decider func(ctx context.Context, req Request, exclude map[string]bool) (Decision, bool)

type GhostLog interface {
	Write(ctx context.Context, studyID, cellID, unitKey string, d Decision) error
}

// Serve runs the normal decision; for a control unit whose winner belongs to the study,
// it logs a ghost impression and serves the next-best decision without the study's campaigns.
func Serve(ctx context.Context, req Request, study Study, decide Decider, ghosts GhostLog) (Decision, bool) {
	d, ok := decide(ctx, req, nil)
	if !ok || !study.Campaigns[d.CampaignID] {
		return d, ok
	}
	if Arm(study.Salt, req.UnitKey, study.ControlShareBp) == "treatment" {
		return d, true
	}
	_ = ghosts.Write(ctx, study.ID, study.CellID, req.UnitKey, d) // async in production
	return decide(ctx, req, study.Campaigns)                     // what control users really see
}
```

```rust tab="Rust"
use hmac::{Hmac, Mac};
use sha2::Sha256;
use std::collections::HashSet;

/// Assigns a unit to treatment or control from a keyed hash, stable across requests.
pub fn is_control(salt: &[u8], unit_key: &str, control_share_bp: u64) -> bool {
    let mut mac = Hmac::<Sha256>::new_from_slice(salt).expect("any key length");
    mac.update(unit_key.as_bytes());
    let digest = mac.finalize().into_bytes();
    let bucket = u64::from_be_bytes(digest[..8].try_into().unwrap()) % 10_000;
    bucket < control_share_bp
}

pub struct Request {
    pub unit_key: String, // the study's unit: a stable user ID's keyed hash, or a geo code
}

pub struct Decision {
    pub line_item_id: String,
    pub campaign_id: String,
    pub auction_id: String,
}

pub struct Study {
    pub id: String,
    pub cell_id: String,
    pub salt: Vec<u8>,
    pub control_share_bp: u64,
    pub campaigns: HashSet<String>,
}

pub trait Decider {
    fn decide(&self, req: &Request, exclude: Option<&HashSet<String>>) -> Option<Decision>;
}

pub trait GhostLog {
    fn write(&self, study_id: &str, cell_id: &str, unit_key: &str, d: &Decision);
}

/// Runs the normal decision; for a control unit whose winner belongs to the study,
/// logs a ghost impression and serves the next-best decision without the study's campaigns.
pub fn serve(req: &Request, study: &Study, decider: &impl Decider, ghosts: &impl GhostLog) -> Option<Decision> {
    let d = decider.decide(req, None)?;
    if !study.campaigns.contains(&d.campaign_id)
        || !is_control(&study.salt, &req.unit_key, study.control_share_bp)
    {
        return Some(d);
    }
    ghosts.write(&study.id, &study.cell_id, &req.unit_key, &d); // async in production
    decider.decide(req, Some(&study.campaigns)) // what control users really see
}
```

The sketch leaves out what the design notes require: assignment is computed only for units eligible for the study (in its geos, with consent to be measured), the frequency and pacing state for a control unit is updated by its ghost impressions so both arms see the same caps, and the pacing controller budgets for the control share so treatment users don't receive the control's undelivered spend.

Both arms write each unit's first exposure to `lift_study_exposures` (a real impression in treatment, a ghost in control), so the treatment-on-the-treated analysis compares like with like; it counts conversions after first exposure, over the observation window:

```sql
-- Treatment-on-the-treated counts for one cell: exposed treatment units vs. ghost-exposed control units.
WITH study AS (
  SELECT conversion_action_ids, tstzrange(lower(study_period), observation_end) AS counted
  FROM lift_studies WHERE id = $1
), units AS (
  SELECT e.unit_key, e.arm, e.first_exposed_at
  FROM lift_study_exposures e
  WHERE e.lift_study_id = $1 AND e.cell_id = $2
)
SELECT u.arm,
       COUNT(DISTINCT u.unit_key) AS exposed_units,
       COUNT(c.id) AS conversions
FROM units u
CROSS JOIN study s
LEFT JOIN conversions c
  ON c.lift_unit_key = u.unit_key
 AND c.conversion_action_id = ANY (s.conversion_action_ids)
 AND c.occurred_at <@ s.counted
 AND c.occurred_at >= u.first_exposed_at      -- outcomes after first (real or ghost) exposure
 AND NOT c.modeled
GROUP BY u.arm;
```

Design notes:

- **Lock the design at start.** `locked_at` is set when the study starts, and an update trigger rejects changes to the design, salt, shares, cells and periods afterward; a study that must change is invalidated and a new one created, a stricter version of the start-time and cell-percentage lock in Meta's API.
- **Never reuse a salt.** A new salt per study keeps a unit's arm in one study independent of its arm in the last; reusing one creates users who are always in control.
- **Ghosts are not events.** `ghost_impressions` has its own partitioned log and never joins `ad_events`, `delivery_daily` or invoices; a ghost that leaks into delivery bills the advertiser for an ad no one saw.
- **Keep the observational flag honest.** `random_assignment` is false for any design where someone chose the regions or the users, and every report shows it. The MRC's outcomes standard doesn't name such a flag, but it separates experiments from observational approaches and requires disclosure of biases, sample bases and sampling error with the results.
- **Results are versioned, not overwritten.** Re-analysis with a new method writes a new `lift_study_results` row and sets `superseded_by` on the old one, so the result an advertiser acted on is still there.
- **Unit keys are pseudonymous, not anonymous.** A keyed hash of a user ID is still personal data; assignments and ghost logs follow the same retention and consent rules as the events they derive from ([Pseudonymous Is Not Anonymous](/docs/telemetry/consent-and-privacy#pseudonymous-is-not-anonymous)), and units without consent to measurement are excluded from user-level studies, not silently put in control.
- **The spend in iCPA is the study's spend.** `spend_micros` is the cell's media cost from `delivery_daily` over the study period, in the ad account's currency, so iCPA and iROAS divide like with like.

## Auditing

- **Every study's design as locked,** with power analysis, primary metric, windows and the people who approved it, kept as long as budgets are defended with its result.
- **Assignments and ghost logs** for the analysis window, so the result can be recomputed.
- **Every result and its method version,** including superseded analyses.
- **Exclusions,** with counts: units excluded for missing consent, geography or eligibility, because a lift study's population is part of its result.

The mechanics (typed actors, append-only history) are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Measure incrementality with experiments,** and report attribution and lift side by side, never one as the other.
- **Assign units by keyed hash with a fresh salt per study,** before any ad decision, and lock the design when the study starts.
- **Log ghost impressions for control units** where the auction allows, predicted ghosts where it doesn't, and keep them out of delivery and billing.
- **Run caps, pacing and eligibility identically for both arms,** counting ghosts as exposures for the control.
- **Offer geo designs** for channels and advertisers without user-level identity, with synthetic controls or time-based regression when regions are few.
- **Power the study before running it,** fix its windows, and don't stop on a peek.
- **Label every result with design, estimand, interval and whether assignment was random.**

## References

**Reference**

- [Johnson, Lewis and Nubbemeyer: Ghost Ads, Improving the Economics of Measuring Ad Effectiveness (NBER working paper, February 18, 2016, PDF)](https://conference.nber.org/conf_papers/f84173.pdf), ghost ads and predicted ghost ads, the PSA and intent-to-treat problems, the 17% and 11% retargeting lifts and the order-of-magnitude cost reduction
- [Google Research: Measuring Ad Effectiveness Using Geo Experiments (Vaver and Koehler, 2011)](https://research.google/pubs/measuring-ad-effectiveness-using-geo-experiments/), randomized non-overlapping regions assigned to control or treatment
- [Google Research: Estimating Ad Effectiveness using Geo Experiments in a Time-Based Regression Framework (Kerman, Wang and Vaver, 2017)](https://research.google/pubs/estimating-ad-effectiveness-using-geo-experiments-in-a-time-based-regression-framework/), counterfactual forecasting for few geos and matched markets

**In practice**

- [Google Ads Help: About Conversion Lift](https://support.google.com/google-ads/answer/12003020), user-based and geography-based studies, treatment and control groups, the metrics and limited availability
- [Google: Meridian updates](https://business.google.com/us/accelerate/announcements/meridian-updates/), GeoX as a cross-platform geo-experiment solution available globally and automated calibration (undated page)
- [Meta for Developers: Ad Study](https://developers.facebook.com/docs/marketing-api/reference/ad-study/), study types including LIFT and GEO_LIFT, cells and percentages, confidence level, observation period and the constraints once running
- [Meta: GeoLift (GitHub)](https://github.com/facebookincubator/GeoLift), synthetic control geo experiments, power calculators, market selection, R and the MIT license

**Specifications**

- [MRC: Outcomes and Data Quality Standards (September 2022, PDF)](https://mediaratingcouncil.org/sites/default/files/Standards/MRC%20Outcomes%20and%20Data%20Quality%20Standards%20%28Final%29.pdf), experiments as randomized and everything else as observational, and the disclosure requirements for results
- [IAB and MRC: Retail Media Measurement Guidelines (January 2024, PDF)](https://mediaratingcouncil.org/sites/default/files/Standards/IAB_Retail_Media_Measurement_Guidelines_January2024.pdf), randomized trials, synthetic controls, matched markets and models for retail incrementality
