+++
title = "Experimentation & A/B Testing"
nav_title = "Experimentation"
description = "Running A/B tests you can trust: units and hashing, sample size, peeking and sequential tests, sample ratio checks, guardrails, CUPED, interference and ethics."
category = "Telemetry & Analytics"
order = 1255
tags = ["experimentation", "ab-testing", "statistics", "feature-flags", "analytics", "telemetry"]
+++

[Product analytics](/docs/telemetry/product-analytics) can show that users of a feature retain better; it can't show that the feature is why. A controlled experiment can: assign units at random to the current experience (control) or a change (treatment), and the only systematic difference between the groups is the change. It is also easy to get quietly wrong, because a broken experiment still produces a confident-looking p-value.

Most of the work is not statistics: assignment that stays put, exposure logged where the decision happens, a sample size decided before the start, and reading the result only when the design says so. The mechanics are the same for a SaaS app, a store, a multiplayer game, a field service marketplace and a banking app.

## Expect Small Effects

Kohavi, Deng, Longbotham and Xu, writing from thousands of experiments at Amazon, Booking.com, LinkedIn and Microsoft, put it bluntly: at Bing, "most fail, and those that succeed improve key metrics by 0.1% to 1.0%." Two consequences shape everything below. Experiments need enough units to detect small effects, and a large effect is more likely a bug than a breakthrough. They call the second one **Twyman's law**: when a result looks too good to be true, investigate before celebrating. Their example: a script that should have slowed Bing's results page instead "showed the opposite: users clicked more," because it had improved click tracking, not clicking.

## Randomization Units and Assignment

The **randomization unit** is what gets assigned: a user, an account, a device, a session, a store, a delivery zone, a match. Choose the unit at which the change is experienced and at which interference stops:

- **User or account** for most product changes. A B2B change that alters a shared workspace is assigned by **workspace**, or two colleagues see different products.
- **Device or anonymous ID** only before login, accepting that one person on two devices may land in both arms.
- **Session or request** only for changes nobody would notice switching (a ranking tweak), never for anything a user can see twice.
- **Cluster** (a region, a market, a match, a team) when users affect each other; see [Interference](#interference-and-network-effects).

Assignment must be **deterministic and sticky**: the same unit gets the same variant on every call, every device and every server, without a lookup. The standard way is to hash the unit's ID with an experiment-specific seed into a fixed number of buckets. GrowthBook's SDK specification shows a production version: it uses fnv32a, version 2 hashes "seed + value" and divides by 10,000, and it notes that version 1 "had a flaw that caused bias when running experiments in parallel." The choice of hash matters: in Kohavi, Henne and Sommerfield's 2007 tests of hash functions for assignment, "only the cryptographic hash function MD5 generated no correlations between experiments," while the .NET string hash "failed to pass even a two-way interaction test."

```ts
import { createHash } from "node:crypto";

// Same experiment seed and unit id always give the same bucket, on any machine.
export function bucket(experimentSeed: string, unitId: string, buckets = 10_000): number {
  const digest = createHash("md5").update(`${experimentSeed}:${unitId}`).digest();
  return digest.readUInt32BE(0) % buckets;
}

export function variant(experimentSeed: string, unitId: string): "control" | "treatment" | null {
  const b = bucket(experimentSeed, unitId);
  if (b < 200) return null; // holdout: sees neither arm
  return b < 5_100 ? "control" : "treatment";
}
```

![A dimensional sheet of experiment assignment: a bar of 10,000 hash buckets split into a hatched 200-bucket holdout, 4,900 control and 4,900 highlighted treatment buckets, and a second view comparing 821,588 control with 815,482 treatment users, a gap of 6,106, with Detail A enlarging the holdout and Detail B enlarging the gap between the two bars, and a variable table computing the chi-square test.](/diagrams/tm-experimentation-assignment.svg "Assignment is a fixed split of a hash space; a sample ratio of 50.2/49.8 looks balanced to the eye and is still a bug (bucket sizes illustrative, counts from Fabijan et al.).")

Three rules keep assignment trustworthy:

- **Sticky across changes.** Changing an experiment's traffic split re-buckets some units if you aren't careful. GrowthBook's sticky bucketing stores the first assignment and reuses it, with a `bucketVersion` "to force a re-bucketing of users" when you mean to. I ramp by adding buckets to an arm, never by reshuffling.
- **Log exposure where the decision happens.** Record that a unit saw a variant at the moment the code branches, not at assignment. Someone assigned to a new checkout who never reaches checkout wasn't exposed, and including them dilutes the effect.
- **Experiments run through the flag system,** with experiment flags typed as such and removed when the result is in ([Feature Flags](/docs/delivery/feature-flags)).

```sql
CREATE TABLE experiment_exposures (
  id                UUID PRIMARY KEY,        -- UUID v7
  experiment_id     UUID NOT NULL REFERENCES experiments (id),
  variant_key       TEXT NOT NULL,           -- control, treatment
  unit_type         TEXT NOT NULL,           -- account, workspace, device, region
  unit_id           TEXT NOT NULL,
  bucket_version    INTEGER NOT NULL,
  first_exposed_at  TIMESTAMPTZ NOT NULL,
  UNIQUE (experiment_id, unit_type, unit_id)
);
```

Every analytics event the unit emits afterwards can be joined to this row, so analysis never has to reconstruct who was in which arm.

## Sample Size and Power

Decide the sample size before the start, from three inputs: the metric's variance, the smallest effect worth detecting, and the error rates you accept (commonly 5% false positives and 80% to 90% power). The same 2007 practical guide gives a rule of thumb for 95% confidence and 90% power: n = (4rσ/Δ)², where r is the number of variants, σ the metric's standard deviation and Δ the smallest difference to detect. Its worked example is a store where 5% of visitors buy, spending $75, so revenue per visitor averages $3.75 with a standard deviation of $30. Detecting a 5% change in revenue needs "over 1.6 million users"; detecting a 5% change in conversion needs "less than 500,000"; relaxing to a 20% change in conversion drops it "by a factor of 16 to 30,400."

What that means in practice:

- **Choose low-variance metrics where you can.** Conversion beats revenue; capped revenue beats raw revenue. In the rules-of-thumb paper, capping Bing's revenue per user at $10 per week cut its skewness from 18 to 5.3, and "Capped Revenue per user can detect a change 30% smaller."
- **Skewed metrics need more units.** The same paper suggests at least 355 × s² units per variant, where s is the skewness, before treating the mean as normal; for Bing's revenue per user (skewness 17.9) that was 114,000.
- **Run whole weeks.** Weekday and weekend users differ, so a test that runs Monday to Thursday describes weekday users.
- **Small products can't detect small effects.** If the arithmetic says eight months, test bigger changes, use a lower-variance metric, or decide without an experiment and say so.

## Peeking and Sequential Testing

A classical fixed-horizon test is valid for one look, at the planned sample size. Looking every day and stopping when the p-value dips below 0.05 inflates false positives well past 5%. Statsig's documentation puts it directly: "Continuous monitoring of an experiment, or peeking, inflates the false positive rate above the significance level you chose." Optimizely's account of building its Stats Engine reports that in its simulations even conservative checking schedules pushed a 5% error rate above 25%.

Two honest options:

- **Fixed horizon, no peeking at the decision metric.** Watch guardrails and health daily (to stop a harmful test), but read the primary result once, at the planned size.
- **Sequential testing,** designed for continuous monitoring. Johari, Pekelis and Walsh's "always valid" p-values and confidence intervals let users act "as fast as it becomes available" while staying valid, and the authors report the method in use on hundreds of thousands of experiments in a commercial platform. Statsig uses a mixture sequential probability ratio test (mSPRT), in which "each metric's confidence interval widens by an amount that shrinks as data accumulates." Optimizely's Stats Engine combines sequential testing with false discovery rate control across metrics. GrowthBook offers sequential testing in its frequentist engine to "mitigate concerns with peeking."

The price of sequential methods is wider intervals early on, so a fixed-horizon test reaches the same power with fewer units if you can wait. Statsig itself "discourages peeking in general" and recommends sequential tests mainly to catch regressions early. My default: sequential for guardrails (stop fast if harm appears), fixed horizon for the decision metric.

## Sample Ratio Mismatch

If the design says 50/50 and the data says otherwise, the experiment is broken. A **sample ratio mismatch** (SRM) is a chi-square test of observed against expected counts per arm, and Fabijan and colleagues, drawing on experiments at four companies, say SRM "in most cases completely invalidates experiment results." Their example: "a ratio of 50.2/49.8 (821,588 versus 815,482 users)" has less than a 1 in 500,000 chance of happening by chance.

The causes they catalogue are mundane, which is why SRM is common:

- **Assignment bugs,** such as an assignment service that gave control "one less bucket than the required number of buckets," turning 50/50 into 49.9/50.
- **Telemetry loss that differs by arm.** A treatment that crashes, slows the page or changes when events are sent loses or gains logged users. PlayFab's experiment docs name it for games: SRM is "often caused by a treatment causing crashes or affecting logging."
- **Filtering in analysis,** such as a bot filter or a trigger condition applied to one arm's logs.

My rule: **compute SRM automatically on every experiment, and don't read results until a mismatch is explained.** A treatment that "wins" with an SRM may have won by losing its unhappiest users from the logs.

## Guardrail Metrics

Every experiment has one primary metric (or an overall evaluation criterion that combines a few), decided before the start, and a standing set of **guardrails** it must not harm: latency, error and crash rates, refunds, support contacts, unsubscribes, cancellations. Guardrails are company-wide and checked automatically, so nobody has to remember them. A checkout change that raises conversion and doubles payment declines, or a dispatch change that lifts jobs per day and callbacks with it, is a loss until someone decides otherwise on purpose. Guardrails also cover trust in the experiment itself: SRM, the share of units with logged exposure, and event volume per arm.

## Variance Reduction: CUPED

Most of the variance in a metric comes from differences between users that existed before the experiment: heavy users stay heavy in either arm. **CUPED** (Controlled-experiment Using Pre-Experiment Data), from Deng, Xu, Kohavi and Walker (WSDM 2013), adjusts each unit's metric by its value in a pre-experiment period, removing that variance without bias, because pre-experiment data can't be affected by the treatment. At Bing they could "reduce variance by about 50%, effectively achieving the same statistical power with only half of the users, or half the duration."

The details that matter:

- **The same metric from the pre-period is usually the best covariate.** A longer pre-period helped, and adding a second covariate to the pre-period metric gained only 2 to 3 more points of reduction in their example.
- **It depends on correlation.** For revenue per user, CUPED "reduced the variance by less than 5%" because revenue correlated poorly across periods.
- **New users have no history.** The paper handles them with an indicator for presence in the pre-period. Eppo's CUPED++ also uses assignment properties as covariates, which helps experiments on new users where "no pre-experiment data exists," and says "CUPED works best for experiments with long-time users."

Built by hand, it is a few lines of SQL over the exposure table and one pre-period aggregate per unit: the cheapest power you will ever buy.

## Novelty and Primacy

A change can win because it is new (users click on anything that moved) or lose because it is unfamiliar (users trained on the old layout stumble). Both fade. Kohavi and colleagues recommend "running experiments for two weeks and looking for such effects," and report that in practice "novelty and primacy effects are uncommon," showing up mostly in recommendation systems, where new diversity or a finite pool causes a short-lived lift. Plot the treatment effect by day since first exposure: a line that decays toward zero is novelty, one that rises is learning, and neither is visible in the pooled average.

## Interference and Network Effects

Randomization assumes each unit's outcome depends only on its own assignment, the stable unit treatment value assumption (SUTVA). Saveski and colleagues at LinkedIn note that violations are "common in features that exhibit network effects" and "result in inaccurate estimates." Where it breaks:

- **Marketplaces.** Riders, buyers and drivers share supply. Statsig's rideshare example: riders shown a higher price request fewer rides, which frees drivers and shortens waits for control riders, so the measured effect mixes the price with the wait. A field service marketplace has the same shape: a booking change that fills more slots in treatment leaves fewer for control in the same branch.
- **Multiplayer games.** A change to one player's experience changes the match for everyone in it, including control players. For example, see [Game Metrics](/books/gaming/game-metrics#experiments).
- **Social and collaborative products.** A feed ranking change for one user changes what their connections see; a new sharing flow sends invites to control users.

The remedies trade variance for validity:

- **Cluster randomization:** assign whole regions, markets, workspaces, teams or matchmaking pools. Fewer independent units means wider intervals, and the analysis must be at the cluster level.
- **Switchbacks:** "A switchback test switches an entire population back and forth between test and control treatments on a set cadence," for example a city's pricing every hour, comparing windows rather than users. Effects carry over across switches, so Statsig's implementation discards exposures in burn-in and burn-out periods at the edges of each window.
- **Test for interference** when you aren't sure: Saveski et al. run a user-randomized and a cluster-randomized experiment side by side and compare their estimates.

## Holdouts

A **holdout** keeps a small share of users on the old experience across many launches, for months, to check that a quarter of "wins" added up to something. Statsig describes holdouts as measuring "the features' combined effect over months," recommends "a low single-digit holdout percentage, such as 1% to 2%," and running them "for three to six months, then releasing it." Holdouts cost something real: those users miss improvements, and the old code paths must keep working for them. Keep them small, time-boxed, and out of anything safety- or compliance-related.

## Tools

| Tool | What its documentation describes |
| --- | --- |
| Statsig | Sequential testing with mSPRT, holdouts, switchback tests for marketplaces, CUPED |
| GrowthBook | Deterministic fnv32a hashing with sticky bucketing, Bayesian and frequentist engines, sequential testing, CUPED, SRM checks; data "remains securely stored in your data warehouse" |
| Eppo | A "warehouse-native analysis engine" that "processes experiment data within your data warehouse," CUPED and CUPED++ |
| Optimizely | Stats Engine: sequential testing with false discovery rate control |
| LaunchDarkly | Experiments attached to feature flags, "frequentist confidence intervals or Bayesian credible intervals," metrics from a warehouse such as Snowflake |

Games often use their backend's built-in experiments; PlayFab's are an example ([Live Operations](/books/gaming/live-operations#experiments)).

Buy or build, the same split as product analytics applies. Assignment belongs in the flag system the product already uses. Analysis belongs where the metric definitions live, which for most companies past the first year is the warehouse ([One Definition per Metric](/docs/architecture/data-pipelines#one-definition-per-metric)), so an experiment's "revenue" is finance's revenue. The warehouse-native tools exist for exactly that reason.

## Ethics and Consent

An experiment is a change you make to people's experience without telling them which version they got. Most are as harmless as any product change, which is why terms of service and privacy notices usually cover them. Some are not.

The case everyone cites is Facebook's 2014 emotional contagion study: for one week, the News Feeds of 689,003 users were altered to show fewer positive or fewer negative posts, to see whether their own posts changed. The authors relied on Facebook's Data Use Policy as consent. PNAS published an editorial expression of concern, noting that "questions have been raised about the principles of informed consent and opportunity to opt out." The FTC's 2022 staff report on dark patterns names the commercial version of the risk: companies "can experiment with digital dark patterns more easily, frequently, and at a much larger scale," and design experimentation "used to deceive consumers or manipulate them into taking unwitting or detrimental actions, is a signal of dark patterns at work."

My rules:

- **Review before running** anything that tests prices, fees, cancellation flows, consent prompts, health or financial decisions, or emotional state. A short written review by someone outside the team is enough for most; some need legal.
- **Never test whether a deceptive claim converts better.** If one variant would be unacceptable to ship, it is unacceptable to test.
- **Don't experiment on the vulnerable by default.** Exclude known minors, accounts in collections or hardship programs, and users in safety-related flows unless the experiment exists to help them.
- **Consent prompts are not a conversion funnel.** Testing the wording of a cookie or tracking prompt to raise acceptance is the pattern the FTC report describes. The [GDPR](/docs/compliance/gdpr) and the [consent rules for telemetry](/docs/telemetry/consent-and-privacy) apply to experiment data like any other.
- **Fairness can be the product.** Players competing for the same ranked ladder under different rules, or drivers paid under different formulas, is a fairness problem before it is a statistics problem.

## Checklist

- **Unit chosen where the change is experienced** and interference stops; cluster or switchback when units share supply, matches or feeds.
- **Deterministic hashed assignment** with a per-experiment seed, sticky across ramps, through the flag system.
- **Exposure logged at the decision point,** one row per unit per experiment.
- **Sample size, duration (whole weeks), primary metric and guardrails fixed before the start.**
- **No peeking at fixed-horizon results;** sequential methods where continuous monitoring is needed.
- **SRM checked automatically,** results withheld until it passes or is explained.
- **CUPED** on metrics with a pre-period, low-variance or capped metrics where possible.
- **Effect by day since exposure** to catch novelty and primacy.
- **Small, time-boxed holdouts** for cumulative and long-term effects.
- **Analysis on the shared metric definitions** in the warehouse.
- **Ethics review** for prices, consent, cancellation, vulnerable users and fairness.

## References

**Papers**

- [Deng, Xu, Kohavi and Walker: Improving the Sensitivity of Online Controlled Experiments by Utilizing Pre-Experiment Data (WSDM 2013)](https://exp-platform.com/Documents/2013-02-CUPED-ImprovingSensitivityOfControlledExperiments.pdf), CUPED, about 50% variance reduction at Bing, under 5% for revenue per user
- [Johari, Pekelis and Walsh: Always Valid Inference: Bringing Sequential Analysis to A/B Testing](https://arxiv.org/abs/1512.04922), always-valid p-values and confidence intervals for continuously monitored tests
- [Fabijan et al.: Diagnosing Sample Ratio Mismatch in Online Controlled Experiments (KDD 2019)](https://exp-platform.com/Documents/2019_KDDFabijanGupchupFuptaOmhoverVermeerDmitriev.pdf), the SRM taxonomy, the 50.2/49.8 example and the off-by-one bucket bug
- [Kohavi, Deng, Longbotham and Xu: Seven Rules of Thumb for Web Site Experimenters (KDD 2014)](https://exp-platform.com/Documents/2014%20experimentersRulesOfThumb.pdf), small effects, Twyman's law, novelty and primacy, skewness and capped revenue
- [Kohavi, Henne and Sommerfield: Practical Guide to Controlled Experiments on the Web (KDD 2007)](https://exp-platform.com/Documents/GuideControlledExperiments.pdf), the sample size rule of thumb and worked example, and hash function tests for assignment
- [Saveski et al.: Detecting Network Effects: Randomizing Over Randomized Experiments (KDD 2017)](https://faculty.washington.edu/msaveski/assets/publications/2017_detecting_network_effects/paper.pdf), SUTVA, cluster randomization and a test for interference at LinkedIn
- [Kramer, Guillory and Hancock: Experimental evidence of massive-scale emotional contagion through social networks (PNAS 2014)](https://pmc.ncbi.nlm.nih.gov/articles/PMC4066473/), the 689,003-user News Feed experiment
- [PNAS: Editorial Expression of Concern (2014)](https://pmc.ncbi.nlm.nih.gov/articles/PMC4115552), informed consent and opportunity to opt out

**Reference**

- [Kohavi, Tang and Xu: Trustworthy Online Controlled Experiments](https://experimentguide.com/), the book (Cambridge University Press, 2020)
- [GrowthBook: Build your own SDK](https://docs.growthbook.io/lib/build-your-own), fnv32a hashing, seeds, hash attributes and sticky bucketing
- [GrowthBook: Statistics overview](https://docs.growthbook.io/statistics/overview), Bayesian and frequentist engines, sequential testing, CUPED and SRM
- [GrowthBook: Data sources](https://docs.growthbook.io/warehouses), analysis that keeps data in your warehouse
- [Statsig: Sequential testing](https://docs.statsig.com/experiments-plus/sequential-testing), peeking, mSPRT and widened confidence intervals
- [Statsig: Holdouts](https://docs.statsig.com/holdouts), purpose, 1% to 2% recommended size and three to six months
- [Statsig: Switchback tests](https://docs.statsig.com/experiments-plus/switchback-tests), switchbacks for marketplaces, buckets by time and region, burn-in and burn-out
- [Eppo: CUPED and CUPED++](https://docs.geteppo.com/statistics/cuped/), variance reduction with assignment properties for new users
- [Eppo documentation](https://docs.geteppo.com/), the warehouse-native analysis engine
- [LaunchDarkly: Experimentation](https://launchdarkly.com/docs/home/experimentation), experiments on flags with frequentist or Bayesian results
- [Microsoft Learn: PlayFab Experiments](https://learn.microsoft.com/en-us/gaming/playfab/features/analytics/experiments/), SRM caused by crashes or logging in game experiments

**In practice**

- [Optimizely: The story behind our Stats Engine](https://www.optimizely.com/insights/blog/statistics-for-the-internet-age-the-story-behind-optimizelys-new-stats-engine/), peeking simulations, sequential testing and false discovery rate control
- [FTC: Bringing Dark Patterns to Light (staff report, September 2022)](https://www.ftc.gov/reports/bringing-dark-patterns-light), design experimentation as a signal of dark patterns
