+++
title = "Automated Risk Decisions"
description = "Rules and models that decide about people: score bands with a human middle, decision records, late labels, holdouts, error costs, fail-open or closed, appeals."
category = "Architecture"
order = 416
tags = ["architecture", "risk", "fraud", "machine-learning", "decisions", "rules"]
+++

A payment is declined as likely fraud. An account is suspended for cheating. A sign-up is held for review as a probable bot. A message is hidden as spam. A loan, a refund or a payout is delayed for a second look. Each one is the same machine: signals go in, rules and a model produce a judgment, and a decision comes out that a real person feels, often without being told why. The domains differ in their signals and their law; the machine is the same everywhere, and it fails in the same ways.

My rule: **a score is an input, never a decision; the decision is made by code against thresholds that live in data, recorded with everything that produced it, and measured against outcomes that arrive later.** This chapter is that machine. Domain specifics live elsewhere: payments fraud in [Fraud & Risk](/books/payments/fraud-and-risk), content and conduct in [Trust & Safety](/docs/security/trust-and-safety), cheating in [Anti-Cheat](/books/gaming/anti-cheat#detection).

## Two Kinds of Error

Every automated decision can be wrong in two directions, and they don't cost the same or show up the same way:

| Mistake | Example | What it costs | How you find out |
| --- | --- | --- | --- |
| **False negative:** bad case allowed | A stolen card approved, a cheater left in ranked play, a bot account let through | The direct loss, plus whatever the bad actor does next | Eventually, as disputes, reports or losses |
| **False positive:** good case blocked | A real customer declined, an innocent player banned, a legitimate post removed | The sale, the customer, support load, trust, sometimes a regulator | Rarely. A false decline looks like an abandoned checkout |

The asymmetry in visibility is the trap. Losses from false negatives arrive itemized; false positives arrive as silence. A system tuned only against what it can see drifts toward blocking more, and nobody notices the customers it loses. So measure both on purpose: sample what you blocked, track customers who retry after a block (a strong sign the block was wrong), and put a price on each kind of error so the threshold is a business decision, not an engineer's guess.

## Rules and Models Together

**Rules** are explicit conditions: more than five cards tried from one device in an hour, a new account sending links in its first minute, a payout to a bank account changed yesterday. They deploy in minutes when an attack starts, they explain themselves, and they encode knowledge no model has seen yet. **Models** learn from labeled history and produce a score; they find combinations nobody would write by hand and adapt as patterns shift.

Each covers the other's weakness. Rules alone become a pile nobody dares delete, each tuned to the incident that prompted it. Models alone can't respond to a new attack until weeks of labeled cases exist, and can't explain a block. The arrangement that works is layered: a model produces a score, and rules act on the score plus specific facts ("review if the score is over 70 and the order ships to a new address"). Commercial tools are built the same way; Stripe Radar describes adaptive models producing a risk score from "hundreds of risk factors", with rules that take one of four actions: request 3D Secure, allow, block or send to review ([Stripe: Risk evaluation](https://docs.stripe.com/radar/risk-evaluation)).

Three kinds of detector feed the score, and they fail differently:

- **Exact matches** (hash lists, blocklists, known signatures) are close to proof when they fire and blind to anything new.
- **Rules and thresholds** are cheap and explainable, and easy to evade once attackers learn them.
- **Classifiers** find new patterns, produce probabilities rather than answers, and drift as behavior changes.

Thresholds, lists and rule parameters live in data with effective dates and versions, the shape in [Rules as Data](/docs/architecture/rules-as-data), so changing one is a reviewed row and not a deploy. The models themselves go through a registry and a promotion process ([Experiments and the Model Registry](/docs/data/data-science-platforms#experiments-and-the-model-registry)).

## Scores, Bands and the Human Middle

A score becomes a decision through **bands**: above an upper threshold the system acts on its own, below a lower one it does nothing, and between them a person decides. The same shape decides record merges in [Review Bands](/docs/architecture/record-linkage#review-bands) and moderation in [Automated Detection, Human Review](/docs/security/trust-and-safety#automated-detection-human-review). Stripe's defaults show it concretely: scores run 0 to 99, 65 and above is elevated risk, which is allowed by default and can go to a review queue, and 75 and above is high risk, which is blocked by default ([Stripe: Risk evaluation](https://docs.stripe.com/radar/risk-evaluation)).

- **Bands per category, set by cost.** Auto-removing spam at a 2% false positive rate may be fine; auto-suspending accounts at that rate means a steady stream of wrongful suspensions, each one a support ticket and an appeal. Set each category's thresholds from its costs and its volume, and write down why.
- **The middle band is sized to the reviewers.** If a band sends more cases than people can review within the time the decision can wait, cases age out or get rubber-stamped. Widen the automated bands, add reviewers, or narrow what the review covers, deliberately.
- **Reviewers get the evidence, not just the score:** the signals that fired, the matched rules, the history, and for gameplay or content, the replay or the item itself.
- **Score cases, not events.** One suspicious event is noise; fifty across a week is a pattern. Accumulate signals per account or entity into a case with its own score, and decide on the case.
- **Act on the reversible thing first.** Hiding content, holding fulfillment or requiring a challenge is cheap to undo; banning an account or keeping funds is not. Let automation take reversible actions at lower confidence and require higher confidence, or a person, for the rest.

## More Outcomes Than Yes and No

A risk check that can only allow or block forces a choice between letting bad cases through and hurting good ones. More outcomes take the pressure off the threshold:

| Outcome | When | Cost |
| --- | --- | --- |
| **Allow** | Low risk | Nothing |
| **Challenge** | Uncertain, and the person is present | A moment of friction: 3-D Secure, a passkey, a one-time code, a CAPTCHA. Most legitimate people pass; most attackers can't |
| **Hold** | Uncertain, and the action can wait | A delay: fulfillment held, a payout delayed, content held before publication |
| **Review** | Uncertain and valuable enough for a person | A human's time and a delay |
| **Block** | High risk | A false positive whenever the model is wrong |

A challenge is the most underused outcome: on an uncertain case with the person present, it converts most legitimate users and stops most attacks, where blocking loses the first group and allowing pays for the second. Run the check where the outcome is still possible: before authorization for payments, at sign-up or first action for accounts, and a second cheaper check later (after the issuer responds, after the first session) when new facts arrive.

## The Decision Record

Every decision is recorded with what produced it, in append-only storage, the shape [Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions) gives every automated choice:

```sql
CREATE TABLE risk_decisions (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  subject_type     TEXT NOT NULL,          -- 'payment', 'account', 'payout', 'message'
  subject_id       UUID NOT NULL,
  checkpoint       TEXT NOT NULL,          -- 'pre_auth', 'signup', 'post_match', 'payout_release'
  outcome          TEXT NOT NULL CHECK (outcome IN
                     ('allow', 'challenge', 'hold', 'review', 'block')),
  score            NUMERIC(5,2),
  model_version    TEXT,                   -- null when no model ran
  ruleset_version  TEXT NOT NULL,
  rules_matched    TEXT[] NOT NULL DEFAULT '{}',
  features         JSONB NOT NULL,         -- the inputs as the scorer saw them
  degraded         BOOLEAN NOT NULL DEFAULT FALSE,  -- fallback path, scorer unavailable
  holdout          BOOLEAN NOT NULL DEFAULT FALSE,  -- sampled to review instead of block
  decided_by       TEXT NOT NULL,          -- typed actor: 'system:risk', 'reviewer:<id>'
  supersedes_id    UUID REFERENCES risk_decisions (id),
  decided_at       TIMESTAMPTZ NOT NULL
);

CREATE INDEX risk_decisions_subject_idx ON risk_decisions (subject_type, subject_id, decided_at);
```

- **Inputs as they were.** The features the scorer saw, not a pointer to tables that will have changed by the time anyone asks. They're also the next training set: logged features from production avoid the skew of recomputing them later ([Features and Training/Serving Skew](/docs/data/data-science-platforms#features-and-training-serving-skew)).
- **Versions, not just a score.** A decision is only explainable against the model and rule set that made it. "The model said so" isn't an answer to a customer, a support agent or a regulator; the matched rules, the score and the versions are.
- **Reviews and appeals add records.** A reviewer approving a held payment, or an appeal reversing a ban, writes a new decision with `supersedes_id` pointing at the one it changed, never an edit ([Amend, Don't Overwrite](/docs/architecture/audit-trails#amend-don-t-overwrite)).
- **Personal data rules apply.** Features often include device, location and behavior data. Keep what explaining and retraining need, for as long as disputes and appeals can arrive, and no longer ([Data Retention & Deletion](/docs/architecture/data-retention)).

## Labels Arrive Late

A model is only as good as its labels, and in risk the labels arrive late and biased. A payment is confirmed fraudulent when the cardholder disputes it, weeks or months later. A cheater is confirmed by a signature detection or a reviewed case. A spam account is confirmed by reports or by the reviewer. Every one of these sources feeds training and rule review, joined to the decision record by subject ID as it arrives ([Monitoring and Drift](/docs/data/data-science-platforms#monitoring-and-drift)).

The bias is the bigger problem: **you never learn whether what you blocked was bad.** A blocked payment never becomes a dispute; a rejected sign-up never misbehaves. Left alone, the system grades its own homework, and everything it blocked "was fraud" because nothing proves otherwise.

### Holdouts

The fix is a **holdout**: a small random share of cases that would have been blocked goes to review, a challenge, or (where the cost is bounded) is allowed, and the outcomes become unbiased labels. Stripe describes doing this to its own scores: "for a small subset of payments, Stripe modifies the reported risk score" so it can measure performance and keep metrics "such as false positive rate and recall" in range ([Stripe: Risk evaluation](https://docs.stripe.com/radar/risk-evaluation)).

- **Random, not chosen.** A holdout someone picks is a sample of what they already believed.
- **Bounded cost.** Cap the value or the harm per holdout case; hold out from the middle of the block band, not from cases that match a known attack.
- **Flagged on the record** (`holdout = true`), so analysis can separate them and nobody mistakes a deliberate allow for a missed block.
- **Validated on the future.** Attackers adapt, so a model validated on last quarter's cases overstates its accuracy on next quarter's. Hold out a test set from the most recent period, not a random slice of all history.

## Measuring It

Accuracy is the wrong number. Risk is imbalanced by nature, and Google's ML course gives the reason in one line: on rare positives, "a model that predicts negative 100% of the time would score 99% on accuracy, despite being useless" ([Google: Accuracy, precision and recall](https://developers.google.com/machine-learning/crash-course/classification/accuracy-precision-recall)). The numbers that matter:

- **Precision:** of what you flagged, how much was really bad. Low precision is the false positive cost: blocked customers, wrongful bans, wasted reviewer time.
- **Recall:** of what was really bad, how much you caught. Low recall is the loss you let through.
- **False positive rate:** of the good cases, how many you flagged. With millions of good cases, a tiny rate is still a lot of people.
- **The threshold tradeoff.** Raising the threshold cuts false positives and adds false negatives; precision and recall "often show an inverse relationship" (same source). The threshold is where the two costs balance, so price both and compute it.

Measure them **by segment** (country, payment method, platform, account age, language), because an average hides a segment the model treats badly. Add the operational numbers: the share of decisions in each band (a sudden doubling of blocks is either an attack or a broken model, and someone should find out which within the hour), review queue age, reviewer agreement with the model, and the **appeal reversal rate**, which is the most honest false positive measure you have where appeals exist.

## Changing Rules and Models Safely

A rule that would have stopped last month's attack and blocked 3% of last month's good customers is a bad rule that looks good in a postmortem. Every change goes through the same path:

1. **Backtest** against stored decision records: how many past decisions change, in which direction, in which segments, and what the labeled outcomes say about those changes.
2. **Shadow** in production: the new model or rule set scores live traffic and its output is logged but not used ([Shipping Models Into Products Safely](/docs/data/data-science-platforms#shipping-models-into-products-safely)).
3. **Ramp** behind a [feature flag](/docs/delivery/feature-flags), watching the band shares and the business outcome (approval rate, retention, reports), not only model metrics.
4. **Record** the new version on every decision from the moment it acts.

Emergency rules during an active attack skip the backtest but not the record, and get an expiry date: a rule added at 2 a.m. that nobody revisits is how the pile of rules nobody dares delete starts.

## When the Scorer Is Down

The scoring service will sometimes be slow or unavailable. Decide in advance what each checkpoint does then, because the decision made during an incident is always "turn it off".

- **Fail open** keeps the business running and lets an attack through the gap. Attackers probe for exactly this, so a fail-open path is itself a vulnerability.
- **Fail closed** turns a risk-service outage into an outage of whatever it protects: checkout, sign-up, payouts.

Neither is right everywhere. My default:

- **A strict timeout** on the scorer, so a slow score degrades to the fallback instead of hanging the request ([Retries & Timeouts](/docs/architecture/retries-and-timeouts)).
- **Local fallback rules** that need no remote call (velocity limits, blocklists, hard checks such as a failed card security code), run on every request, scorer up or down.
- **Fail open for low-value, reversible actions** with the fallback rules in force: small payments, sign-ups that can be reviewed later, content that can be removed.
- **Fail closed, or queue for review, for high-value or irreversible ones:** large payouts, account recovery, bans. A queue that drains when the scorer returns is usually better than a hard block.
- **Mark degraded decisions** (`degraded = true`) and re-score them when the scorer returns, so anything that slipped through is found the same day.

The reasoning is the same as for a [rate limiter](/docs/requests/rate-limiting): the protection must not become the outage, and the gap it leaves must be small, logged and closed afterwards.

## Explanations and Appeals

Automated decisions about people make mistakes, and appeals are how you find them. In the EU, GDPR Article 22 gives people "the right not to be subject to a decision based solely on automated processing" with legal or similarly significant effects, and where such decisions are allowed it requires safeguards including "the right to obtain human intervention on the part of the controller", to express a view and to contest the decision ([GDPR Article 22](https://gdpr-info.eu/art-22-gdpr/)). Whatever the law where you operate, the same design works:

- **Tell people what happened** in terms they can act on: the decision, the rule or policy it rests on, and what they can do next. Don't publish thresholds or the signals that fired; that's a manual for evasion.
- **A person who wasn't involved reviews the appeal,** with the original evidence and anything the appellant adds, and the result is a new decision record ([Appeals](/docs/security/trust-and-safety#appeals) has the moderation version).
- **Reversals restore everything** the decision took: the account, the content, the order, the funds, the strike on the ladder.
- **Reversals feed back.** Each one is a labeled false positive, with the model version and rules that produced it. Report reversal rates by category, detection source and model version, and treat a rising rate as an incident.
- **Support can override, on-call can switch off.** Support reverses a decision for one person through a named, logged operation ([Support Access & Internal Tools](/docs/security/support-access)); on-call can turn a model off and fall back to rules for everyone ([Kill Switches](/docs/delivery/feature-flags#kill-switches)).

Anything built on a language model inherits the issues in [AI & LLM Security](/docs/security/ai-security): the content being judged is attacker-controlled input. A model that classifies is safer than one that acts; keep the action in code, as [Decide in Code](/docs/architecture/ai-agents#decide-in-code) requires.

## Checklist

- **Both error costs measured and priced,** with sampled reviews of what was blocked and customers who retried.
- **Rules and models layered:** a model score, rules over the score and facts, thresholds and lists in versioned data.
- **Bands per category** with a human middle sized to the reviewers, evidence attached, decisions on cases not events.
- **More outcomes than allow and block:** challenge, hold and review, with reversible actions automated first.
- **An append-only decision record** with inputs, score, model and rule set versions, matched rules, actor and what it supersedes.
- **Labels joined as they arrive,** and a random, bounded, flagged holdout from the block band.
- **Precision, recall and false positive rate by segment,** band shares, queue age and appeal reversal rate on one dashboard.
- **Changes backtested, shadowed and ramped,** with emergency rules expiring.
- **A designed degraded mode:** strict timeouts, local fallback rules, fail-open or fail-closed chosen per checkpoint, degraded decisions re-scored.
- **Appeals to a different reviewer,** reversals that restore everything and feed training, an override for support and a kill switch for on-call.

## References

**Specifications**

- [GDPR Article 22: Automated individual decision-making, including profiling](https://gdpr-info.eu/art-22-gdpr/), the right not to be subject to solely automated decisions, and human intervention, expressing a view and contesting as safeguards

**Reference**

- [Google Machine Learning Crash Course: Accuracy, precision and recall](https://developers.google.com/machine-learning/crash-course/classification/accuracy-precision-recall), precision, recall, false positive rate, the threshold tradeoff and why accuracy misleads on imbalanced data

**In practice**

- [Stripe: Risk evaluation](https://docs.stripe.com/radar/risk-evaluation), model scores from hundreds of factors, the four rule actions, the 0 to 99 score with 65 and 75 defaults, review queues, and modified scores on a subset of payments to measure false positive rate and recall
