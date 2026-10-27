+++
title = "Product Analytics"
description = "What product analytics answers and how: funnels, cohorts and retention curves, active users and stickiness, segments, attribution, north stars and pitfalls."
category = "Telemetry & Analytics"
order = 1254
tags = ["analytics", "metrics", "retention", "funnels", "cohorts", "telemetry"]
+++

Product analytics turns the events a product emits into answers about how people use it: how many came, how far they got, whether they came back, and which of them did better. It is the layer between [collecting events](/docs/telemetry/collection) and deciding what to build next, and it fails in a predictable way. The charts are easy to make, every tool makes them, and two teams looking at the "same" retention chart are often looking at two different definitions. This chapter is about the shapes of question that matter, the definitions that settle them, and where the numbers should live so they agree.

The examples run across products on purpose. A SaaS app, a store, a game, a field service platform and a banking app ask the same five questions with different nouns.

## The Questions It Answers

Almost every product analytics question is one of these:

- **How many?** Active users per day, week and month, and how that moves. The headline, and the least informative number on the page.
- **How far?** Of the people who started a flow (signup, checkout, onboarding, booking a visit, opening an account), what share finished each step. That is a funnel.
- **Did they come back?** Of the people who started in a given week, what share was still active a week, a month, a quarter later. That is retention, measured on cohorts.
- **Who?** Which segments (plan, platform, country, acquisition channel, device class) behave differently on any of the above.
- **Why?** Which change, campaign or feature caused a difference. Analytics can only suggest an answer; proving it takes a controlled experiment ([Experimentation & A/B Testing](/docs/telemetry/experimentation)).

Keeping the last one separate is the most useful discipline in the field. A chart that shows users of feature X retain better than users who never touched it shows correlation. The users who found X were probably more engaged to begin with.

## Active Users and Stickiness

DAU, WAU and MAU count distinct users active on a day, in a 7-day window and in a 30-day window. The arithmetic is trivial; the word "active" is not, and vendors disagree about it. Google Analytics 4 separates **total users**, "the number of unique users who triggered any event," from **active users**, "the number of unique users who engaged with your site or app," where an engaged session "lasted 10 seconds or longer, or had 1 or more conversion events or 2 or more page or screen views." The same property reports two different user counts for the same day, by design.

My rule: **active means performed a value event, from a named list in the definition.** For a project tool, created or edited a task; for a store, viewed a product or added to a cart; for a game, started a match; for a field service customer portal, booked, rescheduled or paid; for a bank, checked a balance or moved money. App opens, background refreshes, push-notification taps that bounce, and failed logins are excluded, because each can rise while nobody gets value.

**Stickiness** is DAU divided by MAU: the share of the month's users who show up on a typical day. A messaging app may run high; a tax app is low by nature and that's fine. Two cautions. A wave of new users inflates DAU and MAU together and can hide churn, so read stickiness next to the share of actives who are new. And the tools use the word for a different chart: Amplitude's Stickiness chart shows "how often users fire specific events over a given time period," and PostHog's shows "how many times users perform an event within a specific time period," a distribution of days active, not the ratio. The distribution is the more useful view: it shows whether the product has a core of daily users or a long tail of occasional ones.

Name the **unit** in every definition: a person, an account, a device, a workspace or a household. One person on a phone and a laptop is two devices and one account. A B2B product usually wants both "active users" and "active accounts," and never divides one by the other by accident. For merging identities across devices and logins, see [Matching & Merging](/docs/architecture/record-linkage).

## Funnels

A funnel is an ordered list of steps and the share of entrants who reach each one. The tool choices behind a funnel change its numbers, and Mixpanel's documentation lists them plainly:

- **Conversion window.** "By default, all customers have 7 days to complete a funnel from the timestamp they perform the Step 1 event." A B2B trial that converts in 21 days looks broken in a 7-day funnel.
- **Order.** "Specific Order Funnels require the user to complete each of the funnel steps in the order laid out," while in "Any Order Funnels, users can complete unanchored funnel steps in any particular sequence and still convert."
- **Uniques or totals.** With uniques, a user enters once, the first time they do step 1 in the period; with totals, they can re-enter after converting or timing out. A user who browses ten products and buys once is one entry or ten.
- **Holding a property constant.** "Holding a property constant in a funnel requires that a user retain the same value for a given event property for each step to convert." Without it, a shopper who views product A and buys product B converts.
- **Exclusion steps** "operate as a 'did not do' filter," so a user who contacted support between steps can be counted as a drop-off.

![A funnel sheet: four bars for one weekly cohort of 10,000 entrants narrowing to 4,000 who started, 1,600 who completed the key action and 400 who paid, with step conversion dimensions between bars and an overall conversion of 4 percent highlighted, plus a variable table.](/diagrams/tm-product-analytics-funnel.svg "A funnel is a chain of step rates whose product is the overall rate; the step with the biggest loss is where to look first (illustrative values).")

Read the step rates, not only the overall rate: the overall rate is their product, and the step with the steepest drop is where to look. Then segment it. A checkout funnel that converts 4% overall may convert 6% on desktop and 2% on mobile, which is a different problem from 4% everywhere.

## Cohorts and Retention Curves

A **cohort** is a group of users who share a starting point: signed up in the week of 6 April, first played on a launch day, first booked in March. Retention follows each cohort over time, so a good month of acquisition doesn't hide a bad product.

There are two common definitions, and the tools name them differently:

| Question | Amplitude | Mixpanel | Counts as retained on day N |
| --- | --- | --- | --- |
| Were they active on that exact day? | Return On (formerly N-Day) | On | Returned on day N itself |
| Have they come back since? | Return On or After (formerly Unbounded) | On or After | Returned on day N or any later day |

Exact-day retention is the conservative headline, and it punishes products used every few days: a weekly grocery app has low day-7 exact retention and fine weekly retention. Choose the bucket to match the product's natural cadence (daily for a game or messaging, weekly for a project tool, monthly for a bill-pay app, per service interval for a quarterly maintenance plan), and name the variant. Amplitude's Return On (Custom) lets you define your own brackets (day 0, days 1 to 3, days 4 to 6) for exactly that reason.

A retention curve plots one cohort's retention against time since start. The shape matters more than any point on it:

- **A curve that flattens** means some users found lasting value: the product has a retained core, and growth adds to it.
- **A curve that keeps falling toward zero** means every cohort eventually leaves, and growth is a treadmill.
- **Cohorts that shift up over time** (later cohorts' curves sit above earlier ones) are the strongest evidence that product changes are working, short of an experiment.

Cohort tables put cohorts in rows and periods in columns. A bad release appears as a diagonal: every cohort drops in the same calendar week. A better onboarding appears as a step up in the early columns for every cohort after the change.

Cohorts can also be **behavioral**: users who did X in their first week compared with those who didn't. These are where the "users of X retain better" charts come from, and they are the most misread charts in analytics. Use them to pick hypotheses, then test them.

## Segmentation

Every number above should be breakable down by the dimensions that change behavior: platform, plan, country, acquisition channel, device class, account size, cohort. Three rules keep segmentation honest:

- **Segment by attributes fixed at the start,** such as signup channel or first platform, when comparing retention. Segmenting by a property that changes with use (current plan) mixes cause and effect: users who stayed are the ones who upgraded.
- **Watch the sample size per segment.** Twenty segments of a small product produce one that looks remarkable by chance.
- **Check the mix before the rates.** When the overall number moves, check whether the segment mix moved first (see Simpson's paradox below).

## Attribution Basics

Attribution assigns credit for a conversion to the touchpoints before it: an ad, an email, a search, a referral. Single-touch models give all credit to one touch (the first or the last); multi-touch models split it. The industry has moved toward last click and data-driven models: Google Analytics 4 now offers "Data-driven attribution," "Paid and organic last click," and "Google paid channels last click," and its first click, linear, time decay and position-based models are "no longer available as of November 2023."

What I keep in mind about attribution:

- **It's a model, not a measurement.** Two models give two answers from the same data, and the vendor whose channel is being measured often provides the model.
- **Record the raw touches,** with timestamps and campaign parameters, on your own side, so the model can change without losing history.
- **Self-reported attribution** ("How did you hear about us?") catches word of mouth and offline channels (a door hanger for a lawn care business, a streamer for a game) that click tracking never sees.
- **Incrementality needs an experiment:** a holdout region or audience that doesn't see the campaign. Attribution tells you who touched what; only a holdout tells you what would have happened anyway.

## North-Star and Guardrail Metrics

A **north-star metric** is the one number a product team steers by. Amplitude, which popularized the framework, describes it as "the key measure of success for your company's product team," built from product actions that deliver customer value, legible as strategy, and a leading indicator rather than a lagging one like monthly revenue. Its supporting **inputs** are "a set of three to five influential, complementary factors" that teams can move directly.

Examples of the shape, not prescriptions: weekly active projects with at least two collaborators (SaaS), weekly purchasing customers (commerce), weekly players who complete a match (games), completed visits per active customer (field service), monthly customers who pay a bill through the app (fintech).

**Guardrail metrics** are the counterweight: numbers that must not get worse while the north star improves. Refunds, support contacts, crash rate, unsubscribes, page latency, complaints, cancellations inside a cooling-off window. A notification change that lifts weekly actives and doubles unsubscribes has borrowed engagement from the future. Every metric review shows the north star with its guardrails, and every experiment checks them ([Guardrail Metrics](/docs/telemetry/experimentation#guardrail-metrics)).

## Tools: Vendors or the Warehouse

There are two architectures, and most companies end up with some of both.

**Product analytics vendors** collect events through their SDKs and give non-engineers funnels, cohorts and retention in minutes.

| Tool | What its docs emphasize |
| --- | --- |
| Amplitude | Retention methods (Return On, Return On or After, custom brackets), stickiness, the North Star framework |
| Mixpanel | Funnels with conversion windows, ordering, uniques or totals, held properties and exclusion steps; On and On or After retention |
| PostHog | Product analytics with stickiness insights, plus a data warehouse that lets you query Stripe, Postgres, Salesforce and other sources "alongside your events, persons, and sessions in one SQL query" |
| Heap | Autocapture of interactions "with one snippet of code," and virtual events defined later that reach "back to the moment Heap was installed" |
| Google Analytics 4 | Web and app measurement with total, new and active users, engaged sessions, and attribution models |

**Warehouse-native analytics** keeps events in your own warehouse, models them with dbt, and charts them in a BI tool. The pipeline is the one in [Data Pipelines & Analytics](/docs/architecture/data-pipelines): raw events, staging, marts, tested transformations.

My default: **the warehouse is the source of truth for every metric that leaves the product team** (anything in a board deck, a finance report, a payout or a partner statement), because only there can events be joined to orders, subscriptions, refunds and support tickets and reconciled to the ledger. A vendor tool is worth it for self-serve exploration when it saves real time, with two conditions: events go to the warehouse too (from your own collection, or the vendor's export), and money never comes from a client event. Autocapture is useful for discovery and dangerous as a source of truth: a renamed button silently ends a metric.

## Metric Definitions as Code

The way out of "my retention doesn't match yours" is the one in [One Definition per Metric](/docs/architecture/data-pipelines#one-definition-per-metric): each metric is defined once, in version control, with a unit, numerator, denominator, inclusion rules, a clock and an owner, and every chart reads that definition. The dbt Semantic Layer is one way to do it: MetricFlow lets you "define metrics using YAML abstractions," so downstream tools query a metric instead of reimplementing its SQL.

```yaml
# metrics/weekly_active_accounts.yml, owned by product analytics
metrics:
  - name: weekly_active_accounts
    label: Weekly active accounts
    description: >
      Distinct accounts with at least one value event in the 7 days ending on
      metric_time. Value events: task_created, task_updated, comment_added.
      Excludes internal, test and suspended accounts. Days in UTC.
    type: simple
    type_params:
      measure: active_accounts
    filter: |
      {{ Dimension('account__is_internal') }} = false
      and {{ Dimension('account__is_test') }} = false
```

The vendor tool may show its own version of the number. That is fine as long as everyone knows which one is the definition, and a reconciliation check compares them so a drift (a dropped SDK event, a timezone setting) is found by a job rather than in a meeting.

## Pitfalls

**Vanity metrics.** Cumulative signups, total downloads, page views and registered users only go up, so they can't tell you whether anything is working. Prefer rates and active counts over cumulative totals, and per-cohort numbers over all-time ones.

**Survivorship.** Analyzing the users still here describes the survivors, not the product. "Our power users all use feature X" says nothing about the users who left, who may have tried X and hated it. Start retention and feature analysis from everyone who entered, including those who churned.

**Simpson's paradox.** A trend in every segment can reverse when the segments are combined, because the mix of segments changed. The classic case is the University of California, Berkeley's graduate admissions: in aggregate, "men were more likely than women to be accepted," but the study's authors "were unable to detect a bias towards men in any individual department," because women applied more often to departments with lower acceptance rates (Bickel, Hammel and O'Connell, 1975, as summarized by the Stanford Encyclopedia of Philosophy).

The product version, with illustrative numbers: a checkout redesign ships the same week a mobile campaign starts.

| Segment | Before: visits | Before: conversion | After: visits | After: conversion |
| --- | --- | --- | --- | --- |
| Desktop | 8,000 | 10.0% (800) | 3,000 | 11.0% (330) |
| Mobile | 2,000 | 3.0% (60) | 7,000 | 3.5% (245) |
| All | 10,000 | 8.6% (860) | 10,000 | 5.75% (575) |

Both segments improved; the total fell by a third, because traffic moved to the segment that always converts less. The defense is to break every top-line change down by its largest segments before explaining it, and to compare like with like (or to run an experiment, where randomization keeps the mix equal across arms).

**Averages of skewed data.** Session length, revenue per user and time to first value have long tails. Report medians and percentiles beside the mean.

**Changing the definition silently.** Every definition change is a reviewed change with an effective date, and charts annotate it. Otherwise a step in the line is read as a change in behavior.

## Checklist

- **Active means a value event** from a named list, per unit (person, account, device, workspace), with the unit in the metric name.
- **DAU, WAU, MAU and stickiness** reported with the share of new actives, and the days-active distribution beside the ratio.
- **Funnels state their window, order, counting mode and held properties,** and are read step by step and by segment.
- **Retention per cohort,** exact-day or on-or-after named, with buckets that match the product's natural cadence.
- **Segments by attributes fixed at the start,** with segment sizes shown.
- **Raw touches recorded,** attribution treated as a model, and incrementality measured with holdouts.
- **One north star with inputs and guardrails,** shown together.
- **The warehouse is the source of truth** for any metric that leaves the product team; vendor tools feed it and reconcile to it.
- **Every metric defined once, as code,** versioned and owned.
- **Top-line changes decomposed by segment mix** before anyone explains them.

## References

**Reference**

- [Google Analytics Help: User metrics](https://support.google.com/analytics/answer/12253918), total, new and active users and the engaged-session definition
- [Google Analytics Help: Select attribution settings](https://support.google.com/analytics/answer/10596866), the three available attribution models and the rule-based models removed in November 2023
- [Mixpanel Docs: Funnels, advanced](https://docs.mixpanel.com/docs/reports/funnels/funnels-advanced), the 7-day default conversion window, ordering, uniques and totals, held properties and exclusion steps
- [Mixpanel Docs: Retention](https://docs.mixpanel.com/docs/reports/retention), On and On or After retention and cohort buckets
- [Amplitude Docs: Interpret your retention analysis](https://amplitude.com/docs/analytics/charts/retention-analysis/retention-analysis-interpret), Return On, Return On or After and custom brackets
- [Amplitude Docs: Stickiness](https://amplitude.com/docs/analytics/charts/stickiness/stickiness-identify-features), the stickiness chart as frequency of events over a period
- [PostHog Docs: Stickiness](https://posthog.com/docs/product-analytics/stickiness), stickiness as how many times users perform an event in a period
- [PostHog Docs: Data warehouse](https://posthog.com/docs/data-warehouse), querying external sources alongside product events in SQL
- [dbt Docs: About MetricFlow](https://docs.getdbt.com/docs/build/about-metricflow), metrics defined once in YAML for the dbt Semantic Layer

**In practice**

- [Amplitude: Every product needs a North Star metric](https://amplitude.com/blog/product-north-star-metric), the north-star definition, its criteria and three to five input metrics
- [Heap: How autocapture actually works](https://heap.io/blog/how-autocapture-actually-works), autocapture and retroactive virtual events (vendor blog)
- [Stanford Encyclopedia of Philosophy: Simpson's Paradox](https://plato.stanford.edu/entries/paradox-simpson/), the Berkeley admissions example and Bickel, Hammel and O'Connell (1975)
