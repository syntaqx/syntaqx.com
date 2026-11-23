+++
title = "Machine Learning for Ads"
description = "The models behind ad delivery: pCTR and pCVR, calibration, retrieval and ranking, training data, delayed feedback, evaluation and privacy-preserving training."
category = "Advertising Industry"
order = 2972
part = "Running the Platform"
tags = ["advertising", "machine-learning", "ranking", "auctions", "data-model"]
+++

Every automated decision in an ad system is a prediction turned into a price. A search auction ranks ads by bid times predicted click-through rate; a DSP values an impression at its advertiser's target cost per acquisition times the predicted chance of a click and a conversion; a social feed decides whether an ad beats the organic post it would displace by comparing predicted values; a pacing controller forecasts traffic; a fraud filter scores a click. The models are machine learning in the ordinary sense, but the setting is not: the predictions are spent as money in auctions within milliseconds, the labels arrive late or never, the data each model learns from was selected by the previous model, and the law decides which records may be used to train at all.

That is what makes the field hard. A model that ranks well but predicts probabilities 20% too high overbids by 20% on every impression, so calibration matters as much as accuracy. Training data is a join between what was shown and what happened later, and every choice about how long to wait for the label biases the model. Offline metrics improve while revenue falls, because the auction responds to the model. This chapter covers what the models predict and how predictions become prices, calibration, retrieval and ranking, training data and its sampling, delayed feedback, evaluation offline and online, feedback loops and exploration, privacy-preserving training, and the records a platform keeps of its models. It extends `auctions`, `bids` and `conversions` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model).

Other chapters own the uses. Automated Bidding (in Auctions and Pricing) owns the bid strategies (tCPA, tROAS, learning periods) that consume these predictions; Auction Mechanics owns how a predicted value enters a pricing rule; Social Advertising owns ad load and the organic comparison in feeds; Attribution owns which conversion a model's label is; Demand-Side Platforms owns bid shading's win-rate model; Invalid Traffic & Ad Fraud owns detection models. User-Generated Platforms owns organic feed ranking ([Feeds & Recommendations](/books/user-generated-platforms/feeds-and-recommendations)). The generic engineering of models in products is the playbook's [Data Science Platforms](/docs/data/data-science-platforms): [Features and Training/Serving Skew](/docs/data/data-science-platforms#features-and-training-serving-skew), [Experiments and the Model Registry](/docs/data/data-science-platforms#experiments-and-the-model-registry), [Monitoring and Drift](/docs/data/data-science-platforms#monitoring-and-drift). Where models run and what accelerators cost is Hosting & Cloud's [GPU & AI Clouds](/books/hosting-and-cloud/gpu-and-ai-clouds).

## How the Platforms Do It

The large platforms have published how their ad prediction systems work, in papers and engineering posts that remain the field's reference. Figures are as each source reported them, as of November 2026:

| Platform | Source | What it describes |
| --- | --- | --- |
| **Google** | "Ad Click Prediction: a View from the Trenches", KDD 2013 | Search ad CTR prediction with FTRL-Proximal online logistic regression; per-coordinate learning rates that "reduced AucLoss by 11.2%"; 16-bit q2.13 coefficients that "save 75% of the RAM for coefficient storage" with "no measurable loss"; subsampling of unclicked queries with importance weights; progressive validation; isotonic calibration |
| **Google** | Consent mode conversion modeling | Models using "consented user journeys" to estimate conversions where consent was declined, once a click threshold is met; advertiser-specific "calibration factors" from cookieless pings |
| **Meta** | "Practical Lessons from Predicting Clicks on Ads at Facebook", ADKDD 2014 | Boosted decision trees feeding logistic regression, beating either alone "by over 3%"; normalized entropy and calibration as the metrics; training daily rather than weekly reduced NE "by approximately 1%"; negative downsampling with a recalibration formula; an "online joiner" that labels impressions after a waiting window |
| **Meta** | Andromeda, December 2024 | A retrieval stage that selects "from tens of millions of ad candidates into a few thousand" before ranking; "+6% recall" and "+8% ads quality on selected segments"; "10,000x" model capacity |
| **Meta** | GEM, November 2025 | A generative ads foundation model, "trained across thousands of GPUs", whose knowledge is transferred to "hundreds of user-facing vertical models"; "a 5% increase in ad conversions on Instagram and a 3% increase in ad conversions on Facebook Feed in Q2" |
| **The Trade Desk** | Form 10-K for 2025 | "Koa's artificial intelligence capabilities are used across various aspects of the platform"; no model details published |

The published record has a shape worth noticing: a decade ago the papers were about linear models, sparse features and memory; now they are about multi-stage systems, large shared models distilled into many smaller serving models, and accelerators. The problems in between (calibration, sampling, delayed labels, feedback loops) haven't changed.

## What the Models Predict

The core predictions, and where each one is spent:

| Prediction | Notation | Used by | How it becomes money |
| --- | --- | --- | --- |
| Probability of a click given an impression | pCTR | Search and social auctions, CPC line items in CPM auctions, DSP valuation | Ranking price = CPC bid × pCTR × 1,000, an impression-equivalent CPM |
| Probability of a conversion given a click (or an impression) | pCVR | tCPA and tROAS bidding, CPA line items | Value = target CPA × pCTR × pCVR, or predicted conversion value × pCTR × pCVR |
| Probability the ad is viewable, or watched to completion | pView, pVTR | vCPM and CPCV buying, viewability goals | Value per measured or completed view |
| Probability of winning at a price | P(win \| bid) | Bid shading in first-price auctions | Chooses the bid that maximizes expected surplus (Demand-Side Platforms) |
| Predicted value of an organic item | Organic value | Feed ad load | An ad shows only if its value beats the displaced item's (Social Advertising) |
| Probability a click or impression is invalid | pIVT | Fraud filtering | Removes it from billing and from training data |

Two worked conversions, with illustrative numbers. A search ad with a $1.50 CPC bid and a pCTR of 0.5% ranks at 1.50 × 0.005 × 1,000 = a $7.50 impression-equivalent CPM against other ads on the same page. A DSP line item with a $20 target CPA, on an impression with pCTR 0.4% and pCVR 2%, is worth 20 × 0.004 × 0.02 × 1,000 = $1.60 CPM before shading; the bidder writes that to `bids.value_cpm_micros` as `1600000`. Every factor in those products is a model output, which is why an error in any of them is an error in the price.

The product structure also explains why platforms optimize for more than the advertiser's goal. Meta says its auction does not pick "the highest bid" and that "estimated action rates and ad quality measure ad relevance" (Social Advertising has the auction); Google ranks with bids and predicted quality (Search Advertising). The predicted value is one term in a ranking that also prices the user's experience.

## Calibration

A prediction used as a probability in a price has to be a probability. Meta's paper defines **calibration** as "the ratio of the average estimated CTR and empirical CTR", "the ratio of the number of expected clicks to the number of actually observed clicks", and calls it "a very important metric since accurate and well-calibrated prediction of CTR is essential to the success of online bidding and auction". Google's says "Accurate and well-calibrated predictions are not only essential to run the auction, they also allow for a loosely coupled overall system design separating concerns of optimizations in the auction from the machine learning machinery." A calibration of 1.0 means the model expects as many clicks as happen; 1.2 means every value computed from it is 20% too high.

Ranking quality and calibration are separate properties. A model can order impressions perfectly and still be uniformly 20% high, which ranking metrics like AUC don't see and the advertiser's cost per acquisition does. The standard practice, from both papers:

- **Measure calibration per slice, not only overall.** Google defines success as "giving well calibrated predictions across a wide range of possible partitions of the data": by country, device, placement, advertiser vertical, creative format, position. An overall ratio of 1.0 can hide one slice at 1.5 and another at 0.7, and the 1.5 slice is overbidding.
- **Correct with a monotone calibration layer.** Google describes fitting a simple correction by Poisson regression and then "a piecewise linear or piecewise constant correction function" constrained to be isotonic (monotonically increasing), found by isotonic regression, which "significantly reduced bias for predictions at both the high and low ends of the range". A monotone map fixes the probability without changing the ranking.
- **Undo sampling before serving.** A model trained on downsampled negatives predicts in the sampled space; it has to be mapped back (next section) before its output is a probability.
- **Expect no guarantee.** Google notes that "the inherent feedback loop in the system makes it impossible to provide theoretical guarantees for the impact of calibration": the auction decides which impressions are shown, which decides the next model's training data.

The calibration map is a versioned artifact like the model itself, applied in the serving path after the model and before the price:

```go tab="Go"
package predict

import "sort"

// Recalibrate maps a prediction made by a model trained with negative downsampling
// back to the full-traffic probability: q = p / (p + (1-p)/w), w the negative sampling rate.
func Recalibrate(p, w float64) float64 {
	if p <= 0 {
		return 0
	}
	return p / (p + (1-p)/w)
}

// Isotonic is a piecewise-linear, monotone calibration map fitted offline per slice.
// X and Y are increasing knots; predictions between knots are interpolated.
type Isotonic struct {
	Version string
	X, Y    []float64
}

func (c Isotonic) Apply(p float64) float64 {
	n := len(c.X)
	if n == 0 {
		return p
	}
	if p <= c.X[0] {
		return c.Y[0]
	}
	if p >= c.X[n-1] {
		return c.Y[n-1]
	}
	i := sort.SearchFloat64s(c.X, p) // first knot >= p
	x0, x1, y0, y1 := c.X[i-1], c.X[i], c.Y[i-1], c.Y[i]
	return y0 + (y1-y0)*(p-x0)/(x1-x0)
}

// Calibrated is what the price is computed from, with the versions recorded on the bid.
func Calibrated(raw, negRate float64, m Isotonic) float64 {
	return m.Apply(Recalibrate(raw, negRate))
}
```

```rust tab="Rust"
/// Maps a prediction from a model trained with negative downsampling back to the
/// full-traffic probability: q = p / (p + (1-p)/w), w the negative sampling rate.
pub fn recalibrate(p: f64, w: f64) -> f64 {
    if p <= 0.0 {
        return 0.0;
    }
    p / (p + (1.0 - p) / w)
}

/// A piecewise-linear, monotone calibration map fitted offline per slice.
pub struct Isotonic {
    pub version: String,
    pub x: Vec<f64>, // increasing knots
    pub y: Vec<f64>,
}

impl Isotonic {
    pub fn apply(&self, p: f64) -> f64 {
        let n = self.x.len();
        if n == 0 {
            return p;
        }
        if p <= self.x[0] {
            return self.y[0];
        }
        if p >= self.x[n - 1] {
            return self.y[n - 1];
        }
        let i = self.x.partition_point(|&k| k < p); // first knot >= p
        let (x0, x1, y0, y1) = (self.x[i - 1], self.x[i], self.y[i - 1], self.y[i]);
        y0 + (y1 - y0) * (p - x0) / (x1 - x0)
    }
}

/// What the price is computed from, with the versions recorded on the bid.
pub fn calibrated(raw: f64, neg_rate: f64, m: &Isotonic) -> f64 {
    m.apply(recalibrate(raw, neg_rate))
}
```

## Retrieval and Ranking

No platform scores every eligible ad with its best model. The systems are funnels: a cheap stage reduces the candidates, a more expensive stage scores the survivors, and the most expensive models see the fewest ads. Meta describes retrieval as "the first step in our multi-stage ads recommendation system", selecting "from tens of millions of ad candidates into a few thousand relevant ad candidates" so that "larger and more sophisticated ranking models predict people and advertiser value" on the rest; retrieval "processes three orders of magnitude more ads than subsequent stages". A DSP's version is the bidder funnel in [Real-Time Bidding at Scale](/books/advertising/bidding-at-scale#inside-a-bidder): targeting index, budget and frequency filters, then scoring.

The stages and what each optimizes:

- **Candidate generation (retrieval).** Targeting eligibility from an index over line item expressions, then a learned retrieval model (typically embeddings of the user context and the ad, compared by similarity) that keeps the candidates most likely to score well. Measured by recall: of the ads the full ranker would have chosen, how many survived. Andromeda's reported gain was in recall.
- **Early ranking.** A lighter model over thousands of candidates, trained to agree with the final ranker, cutting to hundreds.
- **Final ranking.** The full pCTR, pCVR and value models, calibrated, producing the values the auction uses.
- **Auction and policy.** The pricing rule, reserve prices, ad load and the organic comparison, diversity and frequency constraints. Not a model, but it consumes the models' outputs and its rules change what they should learn.

The newest published pattern adds a large model above the serving funnel rather than in it. Meta describes GEM as a foundation model whose value "only delivers impact if its knowledge can be efficiently transferred to hundreds of user-facing vertical models", by distilling "knowledge from GEM into domain-specific FMs, which then teach VMs" (vertical models). The serving models stay small enough for the latency budget; the large model is trained offline and teaches them. The engineering consequence is a two-level model lineage: every serving model version records which teacher version it was distilled from, because a regression can come from either.

## Training Data

A training example is an impression (or a click, for pCVR) with the features known when it served and a label that arrives later. The construction has more traps than the model:

- **Log features at serve time.** The features a model used at the moment of the decision are logged with the decision, and training reads those, not features recomputed later from current tables. Recomputed features leak the future (a user's later activity, an ad's later performance) and produce a model that looks better offline than it will be online ([Features and Training/Serving Skew](/docs/data/data-science-platforms#features-and-training-serving-skew)). Meta's online joiner is built this way: "each ad and the associated features used in ranking that impression are added to the impression stream".
- **Wait for the label, but not forever.** A click usually comes within seconds; there is no "no click" event. Meta's joiner labels an impression negative "if the user did not click the ad after a fixed, and sufficiently long period of time", and notes the trade: too long a window "delays the real-time training data and increases the memory", too short loses clicks and makes "the empirical CTR that is somewhat lower than the ground truth". It reported that the bias can be reduced "to decimal points of a percentage" with manageable windows, and corrected.
- **Sample negatives, then correct.** Clicks are rare, so most impressions carry little information. Google trains on every query with a click and a fraction r of those without, weighting the sampled negatives by 1/r so the weighted objective matches the full data, and found "even fairly aggressive sub-sampling of unclicked queries has a very mild impact on accuracy". Meta's best negative downsampling rate in its experiment was 0.025, and it gives the correction from the sampled space back to real probabilities: q = p / (p + (1 − p) / w), with p the prediction in downsampling space and w the sampling rate. Its example: an average CTR of 0.1% becomes "roughly 10%" after 0.01 negative downsampling, and the formula takes the model's outputs back to 0.1%.
- **Keep the data fresh.** Meta found that "NE can be reduced by approximately 1% by going from training weekly to training daily", that contextual features depend more on freshness than historical ones, and moved the linear layer to online learning. Google's system learns online throughout. The general rule: the half-life of an ad model is days, and retraining cadence is a design parameter, not an operational detail.
- **Remove invalid traffic.** Clicks later classified invalid are removed from the labels, and the impressions they came from from the examples; a model trained on bot clicks learns to buy bots.
- **Guard the pipeline.** Meta's paper describes the failure directly: if the click stream goes stale, the joiner produces training data with "a very small or even zero empirical CTR", the trainer predicts near-zero, and the system shows fewer ads. "Anomaly detection mechanisms can help here", including disconnecting the online trainer when the training data distribution "changes abruptly".

## Delayed Feedback

Conversions are the hard label. A purchase can follow a click by days, and an install's in-app events by weeks; an attribution window (Attribution, in Measurement) says how long the platform will wait and which interactions get credit. That creates a choice every pCVR pipeline makes explicitly or by accident:

- **Wait for the window to close.** Labels are correct but the model trains on data a week or more old, and new campaigns have no labels at all for that long.
- **Train on recent data with immature labels.** Fresh, but every recent click whose conversion hasn't happened yet is a false negative, so the model underpredicts and the bidder underbids.
- **Model the delay.** Predict both whether a conversion will happen and when, so a click that hasn't converted yet is treated as "not yet" in proportion to the time elapsed. The literature started from an assumption that "the time delay follows an exponential distribution" and has moved to nonparametric delay models that fit the delay from the ad and user features (Yoshikawa and Imai, 2018).

The labels themselves vary in quality by source. A server-side conversion with an order ID is a clean label; a modeled conversion (Google's consent mode modeling, an aggregated SKAdNetwork or AdAttributionKit postback in Mobile Ad IDs, ATT & SKAdNetwork) is a statistical estimate, often at campaign rather than impression level, and training on it as if it were observed teaches the model the modeler's assumptions. `conversions.modeled` and `modeling_version` (Attribution) separate them, and the training set records which it used.

My rule: the attribution setting and the label maturity are part of the model's definition. A pCVR model trained on 7-day-click labels and used to bid for an advertiser optimizing on 1-day-click is predicting the wrong thing, however well it scores.

## Evaluation

Offline, the papers agree on log-loss-family metrics, because they measure probability quality, plus a ranking metric:

- **Log loss** and **normalized entropy (NE)**: Meta's NE is "the average log loss per impression divided by what the average log loss per impression would be if a model predicted the background click through rate (CTR) for every impression", which makes it comparable across traffic with different base rates. Lower is better.
- **AUC** (or Google's AucLoss, 1 − AUC): ranking quality, insensitive to calibration.
- **Calibration** per slice, as above.
- **Progressive validation**: Google evaluates on each example before training on it, "rather than cross-validation or evaluation on a held out dataset", which suits online learning and is aggregated hourly and by slice.

The scale of a meaningful change is small. Google calls AucLoss reductions of 1% "large"; Meta notes most feature experiments move NE "by a fraction of a percentage". At that scale, noise and slice composition swamp the effect unless evaluation is done on the same examples, sliced, and repeated.

Online, the test is an experiment on live traffic, and auction systems add complications to the playbook's [Experimentation](/docs/telemetry/experimentation):

- **The auction responds.** A model that predicts higher values for one advertiser wins it more impressions and changes what every other advertiser pays. Revenue, advertiser value (conversions at their costs) and user experience metrics all move, and an offline gain can be an online loss.
- **Budgets interfere.** Treatment and control share advertisers' budgets; a treatment that spends a budget faster leaves control less to spend, inflating the difference ([Interference and Network Effects](/docs/telemetry/experimentation#interference-and-network-effects)). Budget-split designs give each arm its own share of each budget.
- **Guardrails are business metrics.** Calibration by slice, advertiser cost per conversion, spend rate, ad load and complaint rates gate a rollout alongside the target metric ([Guardrail Metrics](/docs/telemetry/experimentation#guardrail-metrics)).
- **Rollback is a configuration change.** Every bid records `bid_model_version`; a model rollout is a deployment record with a traffic share, and reverting is moving the share back.

## Feedback Loops and Exploration

An ad model learns only from impressions that were shown, and impressions were shown because a previous model scored them highly. Ads it underrates never serve, so it never learns it was wrong about them; new ads have no history and score on priors. Google's calibration section names the consequence ("the inherent feedback loop in the system"), and the industry's responses are the same ones traffic shaping uses ([Traffic Shaping](/books/advertising/bidding-at-scale#traffic-shaping)):

- **Explore on purpose.** A small share of decisions serve candidates the model wouldn't have chosen, or with randomized adjustments, and are logged as exploration with their selection probability, so training can weight them.
- **Treat new ads and advertisers separately.** Cold-start models and learning periods (Automated Bidding's `bid_strategy_states`) give new entities traffic before they have history, and the period ends on observed outcomes, not on time.
- **Correct for selection when evaluating.** Offline evaluation of a new model on logged data only covers what the old model chose; counterfactual estimates need the logged selection probabilities, which is one more reason to log them.

## Privacy-Preserving Training

Training data is personal data assembled from many requests, so the consent and retention rules apply to it as they do to the request:

- **Train only on records whose basis allows it.** The request's `ads_mode` and reasons (Consent Management & the TCF) decide whether its events may train a personalization model; `limited` requests contribute at most to contextual and aggregate models. Which TCF purposes a training use needs, and which legal basis each allows, is Consent Management & the TCF's subject. The playbook's rule is [Consent Before Collection](/docs/telemetry/consent-and-privacy#consent-before-collection).
- **Prefer aggregates where the use allows.** Many models (pacing forecasts, floor models, contextual CTR) need no user identifier at all; build them without one.
- **Model the unobserved instead of tracking it.** Consent mode's conversion modeling is the published pattern: observe consented journeys, estimate unconsented ones in aggregate, and keep the advertiser-specific "calibration factors" that cookieless pings make possible. The estimate is a label of known lower quality, flagged as modeled.
- **Add differential privacy where outputs leave a trust boundary.** Clean rooms (Data Clean Rooms, in Identity and Audiences) apply noise and privacy budgets to query results; training with differential privacy, as in "Deep Learning with Differential Privacy" (Abadi and others, CCS 2016), which showed deep networks can be trained "under a modest privacy budget", bounds what a model can reveal about any one person in its training data, at a cost in accuracy.
- **Retention and deletion reach the training sets.** Training sets are derived data with their own retention, deletions remove a person's rows before the next training run, and a model's training window is recorded so the question "was this person's data in the model" has an answer. Retraining on a regular cadence is what makes deletion effective for models.

## How to Build It

Demand-Side Platforms adds `value_cpm_micros`, `unshaded_cpm_micros`, `win_probability_ppm` and `bid_model_version` to `bids`; Attribution adds `modeled` and `modeling_version` to `conversions`; Social Advertising records predicted ad and organic values on `feed_ad_decisions`. This chapter adds the model registry those version strings refer to, deployments with their traffic shares, evaluations by slice, and the calibrated predictions on each bid.

```sql
CREATE TABLE ad_models (                 -- a prediction task and its owner
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  task              TEXT NOT NULL CHECK (task IN ('pctr', 'pcvr', 'pview', 'pcompletion',
                      'win_rate', 'organic_value', 'retrieval', 'ivt', 'forecast',
                      'teacher')),
  surface           TEXT NOT NULL,       -- 'search', 'feed', 'open_web_bidder', 'ctv', ...
  label_definition  TEXT NOT NULL,       -- e.g. 'click_within_30m', 'purchase_7d_click_1d_view'
  owner             TEXT NOT NULL,
  UNIQUE (task, surface, label_definition)
);

CREATE TABLE ad_model_versions (         -- what actually scores, by artifact hash
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  ad_model_id       UUID NOT NULL REFERENCES ad_models (id),
  version           TEXT NOT NULL,       -- what bids.bid_model_version and others record
  artifact_sha256   BYTEA NOT NULL,
  teacher_version_id UUID REFERENCES ad_model_versions (id),  -- distilled from, if any
  training_window   TSTZRANGE NOT NULL,  -- events whose serve time fell here
  training_data_ref TEXT NOT NULL,       -- the dataset snapshot, by ID
  allowed_ads_modes TEXT[] NOT NULL,     -- e.g. {'personalized'}: which requests' events trained it
  negative_sampling_rate NUMERIC CHECK (negative_sampling_rate > 0 AND negative_sampling_rate <= 1),
  calibration_ref   TEXT,                -- the calibration map version applied after the model
  label_maturity_s  INT NOT NULL,        -- how long labels were allowed to arrive
  modeled_labels    BOOLEAN NOT NULL DEFAULT FALSE,  -- trained on modeled conversions
  status            TEXT NOT NULL CHECK (status IN ('training', 'candidate', 'serving',
                      'retired', 'rejected')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (ad_model_id, version)
);

CREATE TABLE ad_model_deployments (      -- which version serves what share, where, when
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  model_version_id  UUID NOT NULL REFERENCES ad_model_versions (id),
  region            TEXT NOT NULL,
  traffic_bp        INT NOT NULL CHECK (traffic_bp BETWEEN 0 AND 10000),
  role              TEXT NOT NULL CHECK (role IN ('control', 'treatment', 'shadow', 'full')),
  experiment_ref    TEXT,
  active            TSTZRANGE NOT NULL,
  approved_by       TEXT NOT NULL
);

CREATE TABLE ad_model_evaluations (      -- a metric for a version on a slice and period
  model_version_id  UUID NOT NULL REFERENCES ad_model_versions (id),
  mode              TEXT NOT NULL CHECK (mode IN ('offline_holdout', 'progressive', 'online')),
  period            TSTZRANGE NOT NULL,
  slice             JSONB NOT NULL DEFAULT '{}',  -- {"country":"US","device":"phone"}
  examples          BIGINT NOT NULL,
  log_loss_micro    BIGINT,              -- mean log loss x 1e6
  normalized_entropy_micro BIGINT,       -- NE x 1e6
  auc_micro         BIGINT,
  calibration_micro BIGINT,              -- expected / observed x 1e6; 1000000 = calibrated
  computed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (model_version_id, mode, period, slice)
);

-- The calibrated predictions the price was computed from, on each bid.
ALTER TABLE bids ADD COLUMN ad_model_version_id UUID,  -- the registry row behind bid_model_version
                 ADD COLUMN p_click_ppm INT,       -- calibrated pCTR, parts per million
                 ADD COLUMN p_conversion_ppm INT,  -- calibrated pCVR given a click
                 ADD COLUMN exploration BOOLEAN NOT NULL DEFAULT FALSE,
                 ADD COLUMN selection_probability_ppm INT;  -- when exploration chose it
ALTER TABLE bids ADD CONSTRAINT bids_ad_model_version_fk
  FOREIGN KEY (ad_model_version_id) REFERENCES ad_model_versions (id) NOT VALID;
ALTER TABLE bids ADD CONSTRAINT bids_p_click_check
  CHECK (p_click_ppm IS NULL OR p_click_ppm BETWEEN 0 AND 1000000) NOT VALID;
```

The check every serving model runs daily, calibration by slice from the bids it priced and the clicks they got, so a slice drifting high is caught before an advertiser's CPA does:

```sql
-- Expected over observed clicks for won, valid impressions, by model version and country.
SELECT b.ad_model_version_id,
       r.country,
       count(*)                                              AS impressions,
       sum(b.p_click_ppm) / 1e6                              AS expected_clicks,
       count(c.id)                                           AS observed_clicks,
       round((sum(b.p_click_ppm) / 1e6) / NULLIF(count(c.id), 0), 3) AS calibration
FROM bids b
JOIN auctions a    ON a.started_at = b.auction_started_at AND a.id = b.auction_id
JOIN ad_requests r ON r.id = a.ad_request_id
                  AND r.received_at BETWEEN a.started_at - interval '1 minute' AND a.started_at
JOIN ad_events i   ON i.auction_id = a.id AND i.kind = 'impression' AND i.ivt = 'none'
                  AND i.occurred_at >= a.started_at AND i.occurred_at < a.started_at + interval '1 hour'
LEFT JOIN ad_events c ON c.auction_id = a.id AND c.kind = 'click' AND c.ivt = 'none'
                     AND c.occurred_at >= i.occurred_at AND c.occurred_at < i.occurred_at + interval '1 day'
WHERE b.outcome = 'won' AND b.p_click_ppm IS NOT NULL
  AND b.auction_started_at >= $1 AND b.auction_started_at < $2
GROUP BY 1, 2
HAVING count(*) > 10000
ORDER BY abs(1 - (sum(b.p_click_ppm) / 1e6) / NULLIF(count(c.id), 0)) DESC;
```

The sketch counts at most one click per impression only if clicks are deduplicated upstream, which Counting Impressions & Clicks' click validation does; at scale it runs in the warehouse over the same columns.

Design notes:

- **The version string becomes a foreign key.** `bids.bid_model_version` (Demand-Side Platforms) stays the readable string the bidder logs; `bids.ad_model_version_id` and the deployment records point at `ad_model_versions`, so any bid can be traced to the artifact, its training window, its calibration map and its teacher.
- **Consent scope is a property of the model.** `allowed_ads_modes` records which requests' events trained a version; a model trained on personalized-mode data is never used to score a `limited` request with user features, and a deletion audit can list the versions whose training window covered a person's data.
- **Label definition and maturity are part of the model.** They are stored with the model and the version, so a model trained on one attribution setting isn't silently used for another.
- **Calibration is evaluated where it is spent.** Predictions are stored calibrated on the bid, and calibration is measured per slice on won, valid impressions, because that is the population whose clicks bill.
- **Exploration is logged with its probability.** Without `selection_probability_ppm`, exploration traffic can't be weighted in training or evaluation, and the feedback loop closes.
- **The registry mirrors other volumes.** The same artifact-hash, owner and validation shape appears in Banking & Lending's [Model Risk](/books/banking-and-lending/model-risk#how-to-build-it), where regulators require it; ad models need it for money rather than for a regulator.

## Auditing

- **Which model priced each bid,** with its artifact, training window, calibration map, teacher and the calibrated predictions used.
- **What trained each model,** by dataset snapshot, consent scope, label definition, maturity and whether labels were modeled, so a regulator's or a person's question about their data has an answer.
- **How each version performed, by slice,** offline and online, with the experiment and guardrails that approved its rollout.
- **What served where, and when,** from the deployment records, including shadows and rollbacks.
- **Exploration,** with its share and selection probabilities, so evaluation and training can be reproduced.

## What This Means for the System You Build

- **Treat predictions as prices:** calibrate per slice, store the calibrated value on the bid, and alert on drift.
- **Undo sampling before serving,** with the sampling rate recorded on the model version.
- **Build funnels:** cheap retrieval with measured recall, expensive ranking on the survivors, and the largest models offline as teachers.
- **Log features at serve time** and train from the log, never from recomputed features.
- **Choose label windows deliberately,** model the delay for conversions, and keep modeled labels separate from observed ones.
- **Evaluate with log loss, NE and calibration per slice offline,** then online with budget-aware experiments and business guardrails.
- **Explore on purpose and log selection probabilities,** so the feedback loop can be corrected.
- **Scope training data by consent mode,** prefer aggregate models where they suffice, and make deletion reach training sets through retraining.
- **Keep a registry:** task, label definition, version, artifact hash, training window, deployments and evaluations.

## References

**Research**

- [Google Research: Ad Click Prediction, a View from the Trenches (KDD 2013)](https://research.google/pubs/ad-click-prediction-a-view-from-the-trenches/), FTRL-Proximal, per-coordinate learning rates, q2.13 encoding, subsampling with importance weights, progressive validation, isotonic calibration and the feedback loop
- [He and others: Practical Lessons from Predicting Clicks on Ads at Facebook (ADKDD 2014)](https://quinonero.net/Publications/predicting-clicks-facebook.pdf), trees plus logistic regression, normalized entropy and calibration, data freshness, the online joiner, negative downsampling and the recalibration formula
- [Yoshikawa and Imai: A Nonparametric Delayed Feedback Model for Conversion Rate Prediction (2018)](https://arxiv.org/abs/1802.00255), exponential delay models and a nonparametric alternative
- [Abadi and others: Deep Learning with Differential Privacy (CCS 2016)](https://arxiv.org/abs/1607.00133), training deep networks under a modest privacy budget

**In practice**

- [Meta Engineering: Meta Andromeda (December 2, 2024)](https://engineering.fb.com/2024/12/02/production-engineering/meta-andromeda-advantage-automation-next-gen-personalized-ads-retrieval-engine/), retrieval from tens of millions of candidates, recall and quality gains, and model capacity
- [Meta Engineering: Meta's Generative Ads Model (GEM) (November 10, 2025)](https://engineering.fb.com/2025/11/10/ml-applications/metas-generative-ads-model-gem-the-central-brain-accelerating-ads-recommendation-ai-innovation/), the foundation model, transfer to vertical models and the reported conversion gains
- [Meta for Business: About the ad auction](https://www.facebook.com/business/ads/ad-auction), estimated action rates and ad quality alongside the bid
- [Google Ads Help: About consent mode modeling](https://support.google.com/google-ads/answer/10548233?hl=en), modeling unconsented conversions from consented journeys and calibration factors from cookieless pings

**Filings**

- [The Trade Desk: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1671933/000167193326000014/ttd-20251231.htm), Koa's AI capabilities used across the platform
