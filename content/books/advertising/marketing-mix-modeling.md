+++
title = "Marketing Mix Modeling"
description = "Marketing mix models: adstock and saturation, Bayesian and ridge estimation, Meridian, Robyn and PyMC-Marketing, data needs and calibration with lift tests."
category = "Advertising Industry"
order = 2937
part = "Measurement"
tags = ["advertising", "ad-tech", "measurement", "marketing-mix-modeling", "statistics", "data-model"]
+++

A marketing mix model (MMM) estimates how much of an outcome (sales, sign-ups, installs) each marketing channel produced, from aggregate time series: spend or exposure by channel by week (and often by region), the outcome by week, and the things besides marketing that move the outcome, such as price, promotions, seasonality, distribution and the economy. It needs no user-level data, no cookies and no click IDs, which is why it came back. Once a consultancy deliverable built every year or two, it is now open-source software that an advertiser, an agency or a platform can run weekly: Google's Meridian, Meta's Robyn and PyMC Labs' PyMC-Marketing are three widely used open frameworks.

It is hard because it is a regression asked to answer a causal question from a few hundred observations. Channels move together (budgets rise in the fourth quarter for every channel at once), so their effects are confounded with each other and with seasonality; advertising works with a lag and wears off, so this week's sales depend on spend from weeks ago; returns diminish, so the effect of the next dollar is not the average effect; and the model has more parameters than the data can pin down, so its answer depends on choices (priors, hyperparameter ranges, which controls to include) that a different analyst would make differently. The defenses are structure (adstock and saturation), regularization or priors, geo-level data for more observations, and calibration with experiments, which turn a correlation into something budgets can be moved on.

This chapter covers the model's structure (baseline, adstock, saturation, controls), Bayesian and regularized estimation, the three open frameworks compared, the data a model needs and what platforms supply, calibration with lift experiments, validation, outputs (contributions, ROI, marginal ROI, response curves, budget allocation), what the MRC's outcomes standard requires disclosed, and the records that make a model run reproducible. It extends `delivery_daily` and `conversions` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model). The advertiser's use of MMM next to attribution and lift is Commerce's [Marketing Mix Modeling](/books/commerce/acquisition-and-attribution#marketing-mix-modeling); experiments that calibrate it are [Incrementality & Lift](/books/advertising/incrementality-and-lift); and the platform's own per-conversion attribution is [Attribution](/books/advertising/attribution). Running notebooks and models as production systems is the playbook's [Data Science Platforms](/docs/data/data-science-platforms).

## How the Platforms Do It

As of November 2026, from each project's repository and documentation:

| Framework | Maintainer and license | Estimation | Media transforms | Calibration and extras |
| --- | --- | --- | --- | --- |
| **Meridian** | Google; Apache-2.0; Python 3.11-3.13; generally available January 29, 2025 | Bayesian causal inference, MCMC with the No-U-Turn sampler; a JAX backend; GPU recommended | Lagged effects and saturation; optional reach and frequency inputs for video | ROI priors from experiments via a `CalibrationBuilder`; geo-level data; GeoX geo experiments; scenario planner; "time-varying media effects" on the roadmap |
| **PyMC-Marketing** | PyMC Labs; Apache-2.0; PyMC 6.0 or newer, Python 3.12 or newer | Bayesian, on PyMC | Adstock, saturation, and time-varying intercept and media effects through Gaussian process approximations | Calibration with lift tests; budget optimization; customer lifetime value models (BG/NBD, Pareto/NBD, Gamma-Gamma and others) beside MMM |
| **Robyn** | Meta Marketing Science; MIT; described as "experimental"; R on CRAN, a beta Python API that needs R | Ridge regression with hyperparameters tuned by Nevergrad, multi-objective | Geometric and Weibull adstock; Hill saturation | Calibration with lift tests (MAPE.LIFT objective); Prophet trend and seasonality decomposition; budget allocator |

Google's January 2025 announcement described Meridian as accounting "for reach and frequency" and "easily" integrating "incrementality experiment results as priors," with more than 20 certified measurement partners at launch; its later updates page says Meridian "has surpassed one million downloads" in the 18 months since its debut. Commercial MMM vendors and agencies build on the same model family with their own data pipelines; this chapter uses the open frameworks because their methods are public.

## The Model

Every modern MMM is a variant of one regression: the outcome in period *t* (and region *g*, for geo models) equals a baseline, plus each channel's transformed media, plus controls, plus noise.

```text
y[g,t] = baseline[g,t] + Σ_channels β_c · saturation_c( adstock_c( x_c[g, ≤t] ) ) + Σ_controls γ_k · z_k[g,t] + ε[g,t]
```

The pieces, which Jin, Wang, Sun, Chan and Koehler's 2017 Google paper on Bayesian MMM with "carryover and shape effects" set out and the frameworks implement:

- **Baseline.** What the outcome would be with no paid media: trend, seasonality, holidays, and organic demand. Robyn decomposes "trend, season, holiday & weekday" with Prophet; Meridian can take controls such as Google query volume so the model can "account for organic brand interest."
- **Adstock (carryover).** Advertising this week keeps working next week, decaying. The geometric form carries a fixed share forward: `adstock[t] = x[t] + λ · adstock[t-1]`, with `0 ≤ λ < 1`. Robyn offers geometric and a two-parameter Weibull adstock (as a probability density or cumulative function), where geometric decay "is not able to capture more flexible time-varying decay" and the Weibull PDF form "offers lagged effect," such as a TV campaign that peaks a week after it airs.
- **Saturation (shape).** The tenth million dollars buys less than the first. The Hill function is the common form, with a shape parameter and an inflection point (Robyn's alpha and gamma): `hill(a) = a^α / (a^α + γ^α)`.
- **Controls.** Price, promotions, distribution (a new retailer), competitor activity, macro conditions, weather where it matters. Leaving out a control that moves with spend credits its effect to the media.

Each channel's effect is the area under its transformed curve times its coefficient; its **contribution** is that effect summed over the period; its **ROI** is contribution value over spend; and its **marginal ROI** is the slope of the response curve at current spend, which is the number a budget reallocation actually needs (the next dollar's return, not the average dollar's).

## Estimation: Priors or Penalties

The model has a coefficient, an adstock parameter and two saturation parameters per channel, plus baseline and controls, against perhaps 104 to 156 weekly observations nationally. It can't be fit by ordinary least squares without nonsense (negative effects, wild decay rates). The two families constrain it differently:

- **Bayesian (Meridian, PyMC-Marketing).** Every parameter has a prior distribution; the posterior combines priors with data; results come with credible intervals. Jin et al. show the tradeoff plainly: with large datasets the model estimates well, but with small samples priors strongly influence results and can bias them, and the optimal mix "has a large variance due to the variance of the parameter estimates." Meridian's defaults are "moderately informative," and its documentation's advice for replacing them is that "Your ROI prior should be a synthesis of all the information available to you."
- **Regularized frequentist (Robyn).** Ridge regression ("Robyn uses the L2-form of the regularisation") shrinks coefficients to tame collinearity, and a gradient-free optimizer searches hyperparameters (adstock and saturation ranges, the penalty) against several objectives at once: prediction error (NRMSE), the distance between each channel's share of spend and share of effect (DECOMP.RSSD), and calibration error against experiments (MAPE.LIFT). The result is a Pareto front of candidate models from which an analyst picks.

The difference shows up in operations. A Bayesian run produces posterior samples, convergence diagnostics and intervals, and needs a GPU or patience; a Robyn run produces many candidate models, and the selection among them is a human decision that must be recorded, since a different pick gives a different budget.

**Geo-level data** is the most effective structural fix: Meridian supports "geo-level data, which contains more statistical information," modeling each region's response with shared parameters, so 50 regions of two years give thousands of observations instead of a hundred, and regional variation in spend helps separate channels that move together nationally.

## Data the Model Needs

The inputs, and where a platform fits in:

- **Media by channel and period.** Spend, and an exposure measure (impressions, GRPs, reach and frequency) per channel per week, ideally per region. This is the advertiser's import of every platform's `delivery_daily`, aggregated; geo splits come from each platform's geographic reporting. Meridian can use reach and frequency directly for channels such as video, which models frequency effects that impressions alone can't.
- **The outcome.** Sales, orders or new customers from the advertiser's own books, by the same periods and regions, never platform-attributed conversions, which would model the platforms' attribution instead of the business.
- **Controls.** Prices, promotions, distribution, seasonality markers, competitor and macro series.
- **History.** Enough periods to see seasonality at least twice; two to three years weekly is the common practice, though Robyn's documentation doesn't set a minimum and the right length depends on how often spend varied. <!-- source-gap: adv-mmm-history-minimum | missing | a published minimum of weekly history for MMM (two to three years is common practice) | closes with: a framework's documentation or the MRC outcomes standard stating a minimum | checked: 2026-11-22 -->
- **Variation.** A channel whose spend never changed can't be estimated; experiments and planned flighting create the variation the model needs.

Platforms have started shaping their reporting for MMM. Meta's October 2025 Insights API changes say "MMM breakdowns" are limited to asynchronous jobs from January 12, 2026, a recognition that mix-model feeds are bulk exports rather than dashboard queries. A platform that wants to be measured well by MMMs provides spend, impressions and reach by week and region (DMA, state or postcode), stable channel and campaign taxonomy, and restatements when invalid traffic or late data change past days.

## Calibration with Experiments

An MMM is observational: it can't tell a channel that drives sales from one that spends when sales are high anyway. The MRC's Outcomes and Data Quality Standard covers MMM explicitly (granularity, history and Bayesian priors among its disclosures) and classifies any method without randomized treatment as "an observational approach." Calibration ties the model to experiments:

- **Bayesian: experiments become priors.** A lift study's incremental ROI for a channel becomes that channel's ROI prior. Meridian's documentation is careful about the translation: "There is no single formula to translate an experiment result into a prior"; an experiment reflects its own time window, geography and campaign settings, so the translation "involves an additional layer of uncertainty beyond just the experiment's standard error"; and there can be an estimand mismatch, since "The MMM counterfactual is zero spend, whereas some experiments might define ROI against a different baseline." Stronger, consistent evidence supports a tighter prior; doubts about transferability support a wider one.
- **Robyn: experiments become an objective.** MAPE.LIFT measures how far each candidate model's implied effect for a channel and period is from the lift test's, and the optimizer prefers models that agree. Robyn also has a beta curve calibrator that uses reach and frequency data to inform saturation.
- **Geo experiments built for it.** Meridian's GeoX adds automated calibration that brings ground-truth lift results "directly into your MMM," and Meridian helps "identify channels for experimentation."

The operating rule is a loop: the MMM says which channels' estimates are most uncertain or most consequential; those channels get lift tests; the test results calibrate the next model run. A model calibrated once and never re-tested drifts back to correlation.

## Validation and Outputs

A model that fits the past isn't necessarily right about causes, so validation has several layers:

- **Fit and holdout.** Prediction error on held-out weeks; Robyn's NRMSE is one form. Good fit is necessary and nowhere near sufficient.
- **Plausibility.** Signs and magnitudes that make sense (no negative effect for a channel that spends), adstock decay rates in a believable range, and Robyn's DECOMP.RSSD against effect shares far from spend shares.
- **Stability.** Refitting with a few more weeks shouldn't swing a channel's ROI by half. Instability usually means the channel isn't identified by the data.
- **Agreement with experiments.** The strongest check, and the reason calibration exists.
- **Diagnostics.** For Bayesian fits, convergence (chains agreeing, effective sample size) before any number is read.

The outputs a planner uses: contribution by channel with intervals, ROI and marginal ROI, response curves, and a **budget allocation**: Meridian has "optimization & scenario planning abilities," and Robyn's allocator either maximizes response for a fixed budget or meets a target ROAS or CPA. Allocation is where uncertainty matters most, since an optimizer on point estimates moves money confidently on noise; a defensible allocation respects the intervals and limits moves to ranges the data covers.

## How to Build It

A platform builds MMM support in two places: the **export** that advertisers' models consume (spend and exposure by channel, week and region, restated when the past changes), and, if it runs models for advertisers or for its own planning tools, the **run records** that make a result reproducible: the frozen dataset, the configuration and priors, the experiment calibrations used, the selected model and its results.

```sql
CREATE TABLE delivery_geo_daily (        -- delivery split by region, for geo experiments and MMM
  line_item_id      UUID NOT NULL REFERENCES line_items (id),
  day               DATE NOT NULL,
  geo               TEXT NOT NULL,       -- 'US-CA', a DMA code, a postcode prefix
  source            TEXT NOT NULL CHECK (source IN ('first_party', 'third_party_ad_server',
                      'measurement_vendor', 'exchange', 'buyer')),
  impressions       BIGINT NOT NULL DEFAULT 0,
  viewable_impressions BIGINT NOT NULL DEFAULT 0,
  reach_estimate    BIGINT,              -- unique people or households, where measured
  cost_micros       BIGINT NOT NULL DEFAULT 0,
  currency          CHAR(3) NOT NULL,
  version           INT NOT NULL DEFAULT 1,  -- restated with delivery_daily
  PRIMARY KEY (line_item_id, day, geo, source)
);

CREATE TABLE mmm_datasets (              -- a frozen input table: what the model saw
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  advertiser_id     UUID NOT NULL REFERENCES advertisers (id),
  grain             TEXT NOT NULL CHECK (grain IN ('national_weekly', 'geo_weekly',
                      'national_daily', 'geo_daily')),
  period            DATERANGE NOT NULL,
  currency          CHAR(3) NOT NULL,    -- spend and money results below are in this currency
  kpi               TEXT NOT NULL,       -- 'revenue', 'orders', 'new_customers', 'installs'
  kpi_source        TEXT NOT NULL,       -- the advertiser's system of record, never platform claims
  channel_map       JSONB NOT NULL,      -- line items and campaigns to modeled channels, versioned
  storage_uri       TEXT NOT NULL,       -- the immutable file (parquet) of the rows
  content_sha256    TEXT NOT NULL,
  built_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (advertiser_id, content_sha256)
);

CREATE TABLE mmm_runs (                  -- one fit, reproducible from its inputs
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  dataset_id        UUID NOT NULL REFERENCES mmm_datasets (id),
  framework         TEXT NOT NULL CHECK (framework IN ('meridian', 'pymc_marketing', 'robyn',
                      'other')),
  framework_version TEXT NOT NULL,       -- e.g. the exact package version
  code_ref          TEXT NOT NULL,       -- commit of the modeling code
  config            JSONB NOT NULL,      -- adstock and saturation choices, hyperparameter ranges, controls
  config_sha256     TEXT NOT NULL,
  random_seed       BIGINT NOT NULL,
  diagnostics       JSONB,               -- r_hat, ESS, NRMSE, DECOMP.RSSD, MAPE.LIFT, holdout error
  status            TEXT NOT NULL CHECK (status IN ('running', 'failed', 'fitted', 'selected',
                      'rejected')),
  selected_by       TEXT,                -- the analyst who chose this model, for Pareto-front tools
  selection_note    TEXT,
  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at       TIMESTAMPTZ
);

CREATE TABLE mmm_priors (                -- the priors a run used, and where each came from
  run_id                UUID NOT NULL REFERENCES mmm_runs (id),
  channel               TEXT NOT NULL,
  parameter             TEXT NOT NULL CHECK (parameter IN ('roi', 'mroi', 'contribution',
                          'adstock_decay', 'saturation_half', 'saturation_shape', 'coefficient')),
  distribution          TEXT NOT NULL,   -- 'lognormal', 'beta', 'halfnormal'
  params                JSONB NOT NULL,  -- e.g. {"mean": 1.4, "sd": 0.5}
  basis                 TEXT NOT NULL CHECK (basis IN ('default', 'experiment', 'prior_model',
                          'judgment')),
  lift_study_result_id  UUID REFERENCES lift_study_results (id),
  PRIMARY KEY (run_id, channel, parameter),
  CHECK (basis <> 'experiment' OR lift_study_result_id IS NOT NULL)
);

CREATE TABLE mmm_channel_results (       -- what a run says about each channel
  run_id                 UUID NOT NULL REFERENCES mmm_runs (id),
  channel                TEXT NOT NULL,
  spend_micros           BIGINT NOT NULL,
  contribution_micros    BIGINT NOT NULL,  -- modeled KPI value attributed to the channel
  contribution_low_micros BIGINT,
  contribution_high_micros BIGINT,
  roi_ppm                BIGINT,           -- contribution over spend, in millionths
  roi_low_ppm            BIGINT,
  roi_high_ppm           BIGINT,
  mroi_ppm               BIGINT,           -- marginal ROI at current spend
  adstock                JSONB,            -- fitted decay parameters
  saturation             JSONB,            -- fitted curve parameters
  interval_level_bp      INT NOT NULL DEFAULT 9000,
  PRIMARY KEY (run_id, channel)
);
```

The platform's export for an advertiser's model is a weekly roll-up of its own delivery by region, from the controlling source, with the version so a re-export after restatement is visible:

```sql
-- Weekly spend and exposure by campaign and region for an advertiser's MMM feed.
SELECT c.id AS campaign_id,
       date_trunc('week', g.day)::date AS week_start,
       g.geo,
       SUM(g.cost_micros) AS spend_micros,
       SUM(g.impressions) AS impressions,
       SUM(g.viewable_impressions) AS viewable_impressions,
       MAX(g.version) AS max_version
FROM delivery_geo_daily g
JOIN line_items li ON li.id = g.line_item_id
JOIN campaigns c ON c.id = li.campaign_id
JOIN ad_accounts aa ON aa.id = c.ad_account_id
WHERE aa.advertiser_id = $1
  AND g.source = 'first_party'
  AND g.day >= $2 AND g.day < $3
GROUP BY 1, 2, 3
ORDER BY 2, 1, 3;
```

Design notes:

- **Freeze the dataset.** A run points at an immutable file with its hash, because the warehouse tables it came from will be restated; the same dataset hash plus the same config hash, framework version, code commit and seed reproduce the run ([Reproducibility](/docs/data/data-science-platforms#reproducibility)).
- **The KPI comes from the advertiser's books.** `kpi_source` names the system of record; modeling platform-attributed conversions measures attribution, not sales, and the outcomes standard asks for the outcome's source to be disclosed.
- **Priors carry their evidence.** A prior with `basis = 'experiment'` must point at the `lift_study_results` row it came from, so a reviewer can see which channels are experiment-calibrated and which rest on defaults or judgment.
- **Selection is a recorded decision.** Pareto-front tools return many models; `selected_by` and `selection_note` record who picked which and why, and the other candidates stay as `fitted` or `rejected` runs.
- **Intervals, not points.** Contribution and ROI are stored with their interval and level; an allocation that ignores them is an opinion with decimals.
- **Restatements propagate.** `delivery_geo_daily.version` moves with `delivery_daily`; a new export after invalid-traffic credits produces a new dataset hash and the old run stays pinned to what it saw.
- **Money in the units of the core.** Spend and contributions are integer micros of the advertiser's currency; ROI is a ratio in parts per million, never a float stored in a money column ([Money & Amounts](/docs/money/amounts)).

## Auditing

- **Every run's full provenance:** dataset hash, framework and version, code commit, config, seed and diagnostics, kept as long as a budget is defended with its output.
- **Which priors were calibrated** by which experiments, and which were defaults or judgment.
- **Model selection decisions** for tools that return candidates.
- **The export history** each advertiser received, with versions, so a model built on a pre-restatement export can be identified.

The mechanics (typed actors, append-only history) are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Export spend, impressions and reach by week and region,** from the controlling source, with versions when the past is restated.
- **Model the advertiser's own outcome,** never platform-attributed conversions.
- **Use adstock and saturation,** and geo-level data where the regions vary in spend.
- **Calibrate with lift experiments,** recording which prior came from which study, and re-test the channels the model is least sure of.
- **Freeze datasets and record every run's configuration, version, code and seed** so results can be reproduced.
- **Report contributions and ROI with intervals,** and allocate budgets on marginal ROI within the range the data covers.
- **Label MMM results as observational,** calibrated or not, as the outcomes standard classifies them.

## References

**Reference**

- [Google: Meridian is now available to everyone (January 29, 2025)](https://blog.google/products/ads-commerce/meridian-marketing-mix-model-open-to-everyone/), Bayesian causal inference, reach and frequency, experiment results as priors and the certified partners
- [Google: Meridian (GitHub)](https://github.com/google/meridian), Apache-2.0, supported Python versions, MCMC with NUTS and GPU guidance
- [Google for Developers: About the Meridian project](https://developers.google.com/meridian/docs/basics/about-the-project), geo-level data, organic brand interest, reach and frequency, priors, controls such as query volume, optimization and outputs
- [Google for Developers: Meridian ROI priors and calibration](https://developers.google.com/meridian/docs/advanced-modeling/roi-priors-and-calibration), moderately informative defaults, translating experiments into priors, scope and timing uncertainty and the zero-spend counterfactual
- [Google: Meridian updates](https://business.google.com/us/accelerate/announcements/meridian-updates/), one million downloads, GeoX calibration, the JAX backend, the scenario planner and time-varying effects on the roadmap
- [Meta: Robyn (GitHub)](https://github.com/facebookexperimental/Robyn), experimental status, R and Python, ridge regression, Nevergrad, adstock and saturation and the MIT license
- [Meta: Robyn features](https://facebookexperimental.github.io/Robyn/docs/features/), geometric and Weibull adstock (time-varying decay, lagged effect), Hill saturation, ridge regression, NRMSE, DECOMP.RSSD and MAPE.LIFT, calibration, Prophet decomposition and the budget allocator
- [PyMC Labs: PyMC-Marketing (GitHub)](https://github.com/pymc-labs/pymc-marketing), adstock, saturation, time-varying effects, lift test calibration, budget optimization, CLV models, Apache-2.0 and the PyMC and Python requirements
- [Google Research: Bayesian Methods for Media Mix Modeling with Carryover and Shape Effects (Jin, Wang, Sun, Chan and Koehler, 2017)](https://research.google/pubs/bayesian-methods-for-media-mix-modeling-with-carryover-and-shape-effects/), carryover and shape, priors' influence with small samples and uncertainty in the optimal mix
- [Meta for Developers: Ads Insights API metric availability updates](https://developers.facebook.com/blog/post/2025/10/16/ads-insights-api-metric-availability-updates/), MMM breakdowns limited to asynchronous jobs from January 12, 2026

**Specifications**

- [MRC: Outcomes and Data Quality Standards (PDF)](https://mediaratingcouncil.org/sites/default/files/Standards/MRC%20Outcomes%20and%20Data%20Quality%20Standards%20%28Final%29.pdf), MMM disclosures (granularity, history, priors) and observational versus experimental methods, the outcome data source disclosure
