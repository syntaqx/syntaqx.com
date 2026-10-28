+++
title = "Data Science & ML Platforms"
description = "Running data science without breaking production: notebooks, reproducibility, feature stores and skew, experiment tracking, model registries, serving and drift."
category = "Data Platforms"
order = 1277
tags = ["data", "machine-learning", "mlops", "feature-store", "data-science"]
+++

A churn model for a SaaS product, a fraud score on card authorizations, a demand forecast for a store, a no-show prediction for a field service schedule, a matchmaking quality model for a game: each starts as a notebook on someone's laptop and, if it works, ends up deciding things for customers. The platform is everything between those two points. Without one, every model is a one-off: trained on a CSV nobody can find, deployed by copying a pickle file, and monitored by nobody until a customer complains.

This chapter is about that platform: where data scientists work, how their work becomes reproducible, how features and models reach production, and how you know they're still right. LLM-powered agents inside a product have their own rules ([AI Agents in the Product](/docs/architecture/ai-agents)); many of the platform pieces here (evaluation, versioning, monitoring) apply to them too.

## Exploration Is Not Production

Data science needs freedom: ad hoc queries, big joins, throwaway tables, libraries installed on a whim. Production needs the opposite. The first job of the platform is to give exploration a place where it can't hurt anything, the same separation [Separating Production and Analytics](/docs/data/separating-production-and-analytics) draws for analysts:

- **Read from the warehouse or lake, never the production database.** Marts and raw history are where the data is anyway, and a long feature query against the primary is an outage waiting for a deadline.
- **A sandbox per person or team** with its own schema or workspace, its own compute, and write access only to itself. Shared marts are read-only from there.
- **Masked by default.** Most models don't need names, emails or card numbers; they need stable IDs and behavior. Sensitive columns are masked or tokenized in the sandbox, with exceptions approved and logged ([Data Governance & Access](/docs/data/data-governance)).
- **A clear path out.** Work that should run in production leaves the sandbox through review and a pipeline, never by pointing a product at a table someone built by hand.

## Notebooks and Their Pitfalls

Notebooks are the right tool for exploration: code, output and narrative together, fast iteration, plots inline. They are the wrong tool for anything that must run the same way twice. Reproducibility is a known weakness at scale: Pimentel and colleagues studied 1.4 million notebooks from GitHub for the characteristics that affect it ([MSR 2019](https://2019.msrconf.org/details/msr-2019-papers/36/A-Large-scale-Study-about-Quality-and-Reproducibility-of-Jupyter-Notebooks)). In a team, the failures look like this:

- **Hidden state.** A cell was edited after it ran, or a variable was set in a cell that was later deleted. The notebook on disk no longer describes what produced the output on screen.
- **Out-of-order execution.** Cells were run 1, 4, 2, 4 again. Run top to bottom, the result is different, or it doesn't run.
- **Unpinned environments and local data.** The notebook needs the library version that happened to be installed and a file in someone's downloads folder.

The rules I use: notebooks are for exploring and explaining, and nothing in production imports from one. **Restart and run all** before a notebook is shared or reviewed. Anything reused (a feature definition, a training step, an evaluation) moves into a versioned module with tests, and the notebook imports it. A notebook that must run on a schedule is parameterized and executed by the orchestrator in a clean environment, like any other job.

## Reproducibility

A model is reproducible when you can say exactly which code, which data and which environment produced it, and rebuild it from those. Four things have to be pinned:

- **Code:** a commit, recorded with every training run.
- **Environment:** a lockfile and a container image, the same discipline as [Containers](/docs/delivery/containers). "It worked with the version I had" is not a version.
- **Data:** a fixed snapshot of the training set, not a query against tables that keep changing. Tools differ in how: DVC keeps small metafiles in Git "in lieu of large files" and the data in remote storage ([DVC: Versioning data and models](https://doc.dvc.org/use-cases/versioning-data-and-models)); Delta Lake time travel queries an older table version by number or timestamp ([Delta Lake: Table batch reads and writes](https://docs.delta.io/latest/delta-batch.html)). Time travel is not an archive: Delta keeps history for 30 days by default and `VACUUM` removes old files, so a training set you need to keep is written out as its own snapshot.
- **Randomness:** seeds recorded, and the evaluation set fixed, so a "better" model is better on the same examples.

Erasure applies to training data like any other copy. A training snapshot that contains personal data has a retention period and is in scope for deletion requests ([Data Retention](/docs/architecture/data-retention#erasure-requests)); keep snapshots keyed by pseudonymous IDs so they're cheap to filter, and record which snapshot each model was trained on so you know which models a deletion touches.

## Features and Training/Serving Skew

The most expensive bug in applied ML is a model that is accurate in training and wrong in production. Google's Rules of Machine Learning defines training-serving skew as "a difference between performance during training and performance during serving," caused by different data handling in the two pipelines, data that changes between training and serving, or feedback loops ([Google: Rules of ML](https://developers.google.com/machine-learning/guides/rules-of-ml)). Its remedies are the ones I'd start with: "save the set of features used at serving time" and train on them (rule 29), and reuse code between training and serving (rule 32).

The specific trap is time. A training row for "did this order end in a chargeback?" must use the features as they were when the order was placed, not as they are now. Join the customer's current `chargeback_count` and you've given the model the answer, and it will look brilliant until it ships.

![Plan view of one training row on an event-time axis from 04:00 to 18:00. A feature has three values over time: v1 from 05:00, v2 written at 11:00, and v3 written at 16:00, which is hatched as the future. A label event at t0 = 14:00 is marked with a centerline. The join scans back from t0 up to a TTL of K1 = 8 hours and picks v2, whose age G1 = 3 hours is highlighted. v3, written after t0, is excluded because using it would leak the future into training. A table defines T0, K1, U2, G1 and U3.](/diagrams/dp-data-science-platforms-pit.svg "A point-in-time join takes the newest value written before each training row's timestamp, within a TTL, and never one written after it. That's the value the live model would have seen.")

Feature stores exist to make this correct by construction. Feast pairs "an offline store for historical feature extraction used in model training" with "an online store for serving features at low-latency," and joins features onto training rows "in a point-in-time correct way," scanning back from each row's timestamp up to a TTL ([Feast: Introduction](https://docs.feast.dev/); [Feast: Point-in-time joins](https://docs.feast.dev/getting-started/concepts/point-in-time-joins)). It says plainly what it isn't: not "a general purpose data pipelining system," and not "a replacement for your data warehouse." Tecton is a managed feature platform aimed at real-time features, and names training-serving skew as the problem it removes ([Tecton: Introduction](https://docs.tecton.ai/docs/introduction)).

You don't need a feature store for your first model. A batch model that scores nightly from the warehouse has no online path to skew against; one feature definition in SQL, used for both training and scoring, is enough. Reach for a feature store when a model is served online (features must be fresh and fast), or when several models share features and each team is recomputing them differently. Whichever you use, a feature is defined once, with an owner, the timestamp it's valid at, and a test that the online and offline values agree on a sample.

## Experiments and the Model Registry

Training is an experiment until a model is chosen, and the record of the experiment is what lets you trust the choice later.

- **Track every run.** MLflow Tracking logs "parameters, code versions, metrics, and output files," with each run's metadata and artifacts (weights, plots) and experiments grouping the runs for one task ([MLflow: Tracking](https://mlflow.org/docs/latest/ml/tracking/)). Log the data snapshot ID with them; a run without its data is half a record.
- **Register what ships.** In a model registry, "each registered model can have one or many versions," each linked to the run that produced it, and aliases give "a mutable, named reference to a particular version" ([MLflow: Model Registry](https://mlflow.org/docs/latest/ml/model-registry/)). Serving loads `fraud_score@champion`, not a file path, so promotion and rollback are a change to the alias, reviewed and logged.
- **Promotion has a checklist.** Evaluated on the fixed evaluation set against the current champion, checked for performance across segments that matter (new versus returning customers, regions, platforms, small merchants), with a model card that says what it's for, what it isn't for, and what data it saw.

## Batch or Online Inference

| | Batch | Online |
| --- | --- | --- |
| How | A job scores every entity on a schedule and writes a table | A service scores one request in its latency budget |
| Fits | Churn risk, lead scores, demand forecasts, next-week staffing, recommendations refreshed daily | Fraud at authorization, ranking a search, a matchmaking decision, a quote at checkout |
| Freshness | As of the last run | As of the request |
| Failure | The table is stale; yesterday's scores still work | Every request needs a fallback |

My default is batch. A score table is easy to test, cheap to run, simple to roll back (keep yesterday's), and the product reads it like any other data. Move to online only when the decision needs information from the request itself, or freshness that a schedule can't give. Online inference is a production service with an [SLO](/docs/operations/slos), a timeout and a fallback: if the model doesn't answer in budget, the product uses a rule or a default and records that it did ([Retries & Timeouts](/docs/architecture/retries-and-timeouts)).

## Shipping Models Into Products Safely

A model's output is an input to a decision, not the decision. The pattern in [AI Agents](/docs/architecture/ai-agents#decide-in-code) applies to every model: code owns the rule ("decline above 0.92, review between 0.7 and 0.92"), the model supplies a number, and the threshold lives where it can be changed and audited ([Rules as Data](/docs/architecture/rules-as-data)).

- **Shadow first.** The new model scores live traffic and its output is logged but not used. Compare it to the champion on real inputs before it decides anything.
- **Behind a flag, then a ramp.** Release to a share of traffic with a [feature flag](/docs/delivery/feature-flags), and measure the business outcome (approval rate, false declines, retention), not just model metrics.
- **Keep a holdout** where possible, so you can still measure what the model adds after it's everywhere.
- **Log every decision** with the model version, the features it saw and the score, so a disputed decline or a customer complaint can be explained, and so the logged features can become the next training set (rule 29 again).
- **A human override and a kill switch.** Support can reverse a model's decision for one customer; on-call can turn the model off and fall back to rules for everyone.

## Monitoring and Drift

Models degrade without throwing errors. The world changes (a new product line, a holiday, a competitor's outage, a new game mode), the inputs shift, and the model keeps answering confidently.

- **Watch the inputs.** Compare the distribution of each feature in production to the training data. Evidently's defaults are a reasonable start: a Kolmogorov-Smirnov test for numeric columns when the reference has 1,000 rows or fewer, Wasserstein distance above that, with a drift threshold of 0.1 for the distance methods ([Evidently: Data drift](https://docs.evidentlyai.com/metrics/explainer_drift)). Treat it as an alarm to investigate, not a verdict.
- **Watch the outputs.** The distribution of scores and the share of decisions in each band. A fraud model that suddenly declines twice as many orders is either right about an attack or broken, and someone should find out which within the hour.
- **Measure accuracy when labels arrive.** Ground truth is late: chargebacks take weeks, churn takes a billing cycle, a no-show takes a day. Join predictions to outcomes as they arrive and track the real metric by cohort.
- **Check skew directly.** Recompute a sample of served feature vectors through the offline pipeline and alert when they differ.
- **Retrain on a schedule and on evidence,** through the same registry and promotion checklist, never by overwriting the model in place.

## Compute Isolation and Cost

Data science compute is spiky and easy to forget. A GPU instance left running over a long weekend, a notebook cluster with no auto-stop, a feature backfill that scans the whole lake: each is real money, and none is visible to the person who started it.

- **Separate compute for exploration, training and serving,** so a training job can't starve a serving endpoint, and a sandbox query can't slow the warehouse's scheduled models.
- **Auto-stop everything interactive,** with idle timeouts measured in minutes, not days.
- **Budgets and quotas per team,** with alerts before the limit. Warehouses provide the brakes: BigQuery can cap "the number of bytes billed for a query" and set custom daily quotas ([BigQuery: Controlling costs](https://docs.cloud.google.com/bigquery/docs/best-practices-costs)).
- **Tag every resource with an owner and a purpose,** and review the top spenders monthly against what they produced ([Cost & FinOps](/docs/operations/cost-and-finops)).

## Checklist

- Do data scientists work in sandboxes that read the warehouse, can't write to shared marts, and see sensitive columns masked?
- Does nothing in production import from a notebook?
- Does every training run record its code commit, environment, data snapshot and seed?
- Are training features joined point-in-time, and served from the same definitions online?
- Is every shipped model a registry version loaded by alias, with a promotion checklist and a model card?
- Is batch inference the default, with online inference held to an SLO, a timeout and a fallback?
- Do new models run in shadow, then behind a flag, with every decision logged with its model version and features?
- Are input drift, output distribution, delayed accuracy and skew monitored, with alerts?
- Does every compute resource have an owner, an auto-stop and a budget?

## References

**Reference**

- [Feast: Introduction](https://docs.feast.dev/), offline and online stores, and what a feature store is not
- [Feast: Point-in-time joins](https://docs.feast.dev/getting-started/concepts/point-in-time-joins), point-in-time correct joins scanning back up to a TTL
- [Tecton: Introduction](https://docs.tecton.ai/docs/introduction), a managed feature store for real-time machine learning and training-serving skew
- [MLflow: Tracking](https://mlflow.org/docs/latest/ml/tracking/), runs, experiments, parameters, metrics, artifacts and code versions
- [MLflow: Model Registry](https://mlflow.org/docs/latest/ml/model-registry/), model versions, aliases and lineage to the producing run
- [DVC: Versioning data and models](https://doc.dvc.org/use-cases/versioning-data-and-models), metafiles in Git with data in remote storage
- [Delta Lake: Table batch reads and writes](https://docs.delta.io/latest/delta-batch.html), time travel and the retention settings that limit it
- [Evidently: Data drift](https://docs.evidentlyai.com/metrics/explainer_drift), default drift tests by data size and their thresholds
- [BigQuery: Controlling costs](https://docs.cloud.google.com/bigquery/docs/best-practices-costs), maximum bytes billed and custom quotas

**In practice**

- [Google: Rules of Machine Learning](https://developers.google.com/machine-learning/guides/rules-of-ml), training-serving skew, logging serving features, reusing code between training and serving
- [Pimentel et al.: A Large-scale Study about Quality and Reproducibility of Jupyter Notebooks](https://2019.msrconf.org/details/msr-2019-papers/36/A-Large-scale-Study-about-Quality-and-Reproducibility-of-Jupyter-Notebooks), MSR 2019, 1.4 million notebooks from GitHub
