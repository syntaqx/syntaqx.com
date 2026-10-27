+++
title = "Payments Metrics"
description = "The numbers a payments platform runs on, one definition each: approval and success rates, declines, fraud, disputes, take rate, payouts, reconciliation, SLOs."
category = "Payments Industry"
order = 1435
part = "Running a Provider"
aliases = []
tags = ["payments", "metrics", "analytics", "authorization", "disputes", "slos"]
+++

A payments platform is run from a short list of numbers: how many attempts were approved, how much was lost to fraud and disputes, how close each merchant is to a network threshold, what the platform kept from each dollar it moved, whether merchants were paid on time, and whether every dollar reconciled. Most of them have more than one reasonable definition, and the definitions that matter most aren't yours: the card networks define the dispute and fraud ratios that put a merchant into a monitoring program, and they don't define them the same way. When a number decides a merchant's reserve, a sales commission, an acquirer conversation or a network fine, its definition is a contract.

This chapter gives one definition per metric, with its formula, and says which definitions are a network's, which are a vendor's, and which are this book's. How to define a metric once, version it and stamp its outputs is general practice in [One Definition per Metric](/docs/architecture/data-pipelines#one-definition-per-metric); funnels, cohorts and segmentation are in [Product Analytics](/docs/telemetry/product-analytics); service level objectives are in [SLOs](/docs/operations/slos). The monitoring that watches these numbers in real time is in [Operating the Platform](/books/payments/operating-the-platform#watching-approval-rates-and-latency); this chapter is how each is computed.

## Why the Same Metric Disagrees

Four choices make two dashboards show different numbers for the same month.

- **What's in the denominator.** Stripe publishes two acceptance rates side by side. Its **payment success rate** divides authorized charges by "the number of unique payment attempts submitted through Stripe," including payments that failed 3-D Secure or were blocked by its fraud tools; its **authorization rate** divides by attempts "submitted to the card network for authorization," excluding those. Its worked example shows the gap: 93,000 authorized out of 100,000 valid requests is a 93% success rate, and out of the 98,000 that reached the network a 94.9% authorization rate.
- **Whether retries count.** A customer who mistypes a CVC and tries again is two attempts and one purchase. Stripe's **raw** rate counts every attempt; its **deduplicated** rate groups retries of the same purchase and counts the final outcome, so three attempts ending in an approval are 33.3% raw and 100% deduplicated.
- **Which month a dispute belongs to.** Stripe's dispute analytics can count a dispute by the date it was filed or by the date of the original payment. Visa's monitoring divides a month's fraud reports and disputes by the same month's settled transactions; Mastercard divides a month's chargebacks by the previous month's transactions. Both networks assign a dispute to the month they received it, regardless of when the payment happened.
- **Count or value.** Network program ratios are counts (Visa's VAMP ratio is explicitly "count-based"), while finance cares about amounts. A merchant with many small disputes and few large ones looks worse to Visa than to its CFO.

So every metric here names its unit, numerator, denominator, inclusion rules and clock ([What a Definition Contains](/docs/architecture/data-pipelines#what-a-definition-contains)), and where a network defines it, the network's definition wins for anything compared with the network's threshold.

## How the Platforms Report

| Source | Metric | Definition as published |
| --- | --- | --- |
| **Mastercard** | Chargeback rate (Excessive Chargeback Program) | Chargebacks raised this month / captured transactions in the previous month |
| **Mastercard** | Fraud chargeback rate (Excessive Fraud Merchant) | Fraud-related chargebacks this month / e-commerce transactions in the previous month |
| **Stripe** | Payment success rate | Authorized charges / unique payment attempts, including 3-D Secure failures and blocked payments; invalid API calls excluded |
| **Stripe** | Authorization rate | Issuer-authorized payments / unique attempts submitted to the network |
| **Stripe** | Dispute rate | "Percentage of payments that led to disputes, out of all accepted payments"; by dispute date by default, early fraud warnings included by default |
| **Stripe** | Win rate | Won / disputes challenged with evidence, by dispute date |
| **Visa** | VAMP ratio | Count of fraud reports (TC40) plus disputes (TC15) / count of settled transactions (TC05), card-not-present, same month |
| **Visa** | VAMP enumeration ratio | Enumerated authorization transactions / all authorization transactions, approved and declined |
| **Canada's Code of Conduct** | Effective merchant discount rate | Total acquirer and processor fees and network fees paid / sales volume, per card type |

Two practical notes. A provider's dashboard and a network's report will differ even with the same formula: Stripe notes that disputes it absorbs on a merchant's behalf don't count toward its own rates but do count in the networks' calculations, and that statement descriptors, multiple merchant IDs or a merchant ID change can make network data diverge from what the dashboard shows. And a platform computes all of these per merchant, per merchant ID and for itself, because the networks identify accounts by descriptor and acquirer, not by your merchant record.

## Acceptance

**Payment success rate** (this book's general form of Stripe's): of the purchases a customer attempted, how many were authorized.

```text
payment success rate = authorized attempts / valid attempts
  valid attempts = all attempts except malformed requests
                   (includes authentication failures, risk blocks and issuer declines)
```

**Authorization rate** (also called approval rate): of the attempts that reached the issuer, how many it approved. This is the number to compare across processors and with issuers, because everything before the network is your own decision.

```text
authorization rate = issuer approvals / attempts sent to the network
```

Report both **raw** and **deduplicated**. Deduplicate by grouping attempts for the same purchase (same invoice, or same customer or card, same amount, close in time, as Stripe does) and counting the final outcome. The raw rate is what issuers and the networks see, and the one that drives retry fees; the deduplicated rate is what the business experiences. A feature that adds retries can raise approvals in the raw count of approvals while lowering the raw rate, and only the deduplicated rate shows whether more purchases succeeded.

**Soft and hard declines.** Classify every decline from its raw code, and report the share of each:

```text
soft decline share = soft declines / declines     (retry may succeed: insufficient funds, try again later)
hard decline share = hard declines / declines     (never retry: lost, stolen, closed, revoked)
```

The classification lives in versioned reference data, with the raw issuer code, the processor's code and Mastercard's merchant advice code kept beside it ([Declines, and the Rules on Retrying](/books/payments/stored-credentials#declines-and-the-rules-on-retrying), [One Response Model](/books/payments/processor-routing#one-response-model)).

**Decline code mix.** The share of declines by normalized reason (generic, insufficient funds, incorrect data, suspected fraud, expired, not permitted), per slice. A shift in mix names a cause faster than a shift in rate: a jump in incorrect-number or expired-card declines after a migration is a data problem, a jump in generic declines on a new merchant ID is issuer trust ([Switching Processors](/books/payments/switching-processors#watching-declines-after-cutover)), and a jump in small-amount generic declines is the signature of card testing ([Card Testing](/books/payments/fraud-and-risk#card-testing)).

**Slices.** Every acceptance metric is reported by processor, brand, issuer or BIN range, card type, card country, channel, initiation type (customer- or merchant-initiated), network token or card number, and merchant. Stripe's acceptance reports pivot on most of the same attributes and note the patterns to expect: domestic above cross-border, credit above debit above prepaid, wallets and card-present above keyed-in cards. Compare each slice with its own history, never with the platform average.

**Retry recovery rate** (this book's): of the purchases whose first attempt was soft-declined, how many succeeded on a later attempt within the retry window, and after how many attempts. It's the honest measure of a retry strategy, because it counts purchases recovered rather than approvals added.

**Checkout conversion** (this book's): of checkout sessions that reached the payment step, how many ended in an authorized payment. It belongs to the funnel analysis in [Funnels](/docs/telemetry/product-analytics#funnels), and it's where false declines show up: a customer declined by a risk rule abandons, and the decline never appears in any fraud report ([The Two Costs](/books/payments/fraud-and-risk#the-two-costs)). Report it beside the block rate, so a stricter rule's cost is visible.

## Fraud

**Fraud rate**, by count and by value, in basis points (one basis point is 0.01%):

```text
fraud rate (count, bps) = 10,000 x fraud-labeled payments / settled payments
fraud rate (value, bps) = 10,000 x fraud-labeled amount / settled amount
  fraud-labeled = an issuer fraud report (early fraud warning) or a fraud-reason dispute
```

Stripe's fraud rate is the count form: the "percentage of card payments identified as fraudulent, out of all accepted card payments." Report both forms, and both clocks: by report month (what the networks count) and by payment month (what shows whether a fraud control worked, at the cost of recent months looking better until late labels arrive).

**VAMP ratio** (Visa's, for card-not-present Visa transactions):

```text
VAMP ratio = (fraud reports (TC40) + disputes (TC15)) / settled transactions (TC05), counts, same month
```

Visa excludes disputes resolved through pre-dispute services and fraud reports that qualify under Compelling Evidence 3.0, and counts a payment that appears as both a fraud report and a dispute twice. Thresholds apply at two levels, which is why a platform computes it for every merchant and for its whole portfolio: an acquirer's portfolio is "Above Standard" at 50 basis points and "Excessive" at 70, and individual merchants are excessive at 150 basis points in most regions from April 1, 2026, with minimum monthly counts. The merchant thresholds and what follows from them are in [Monitoring Programs](/books/payments/disputes-and-chargebacks#monitoring-programs-the-threshold-that-ends-accounts).

**Enumeration ratio** (Visa's): enumerated authorizations, as identified by Visa's model, over all authorizations, approved and declined; Visa's fact sheet sets the excessive level at 2,000 basis points with at least 300,000 enumerated transactions. You can't reproduce Visa's model, so track your own proxy (attempts flagged by your card-testing rules over all attempts) and watch for divergence when Visa's report arrives.

**Block rate and review rate** (this book's): the share of attempts your own risk system blocked or sent to review, by rule and by model version. Pair each with the fraud rate on what was allowed, and with the outcome of a held-out sample of what would have been blocked ([Feedback Loops](/books/payments/fraud-and-risk#labels-and-outages)).

## Disputes and Refunds

**Dispute rate.** Stripe's form: disputes over accepted payments, by count, by dispute date. For network comparisons, use the network's own form:

```text
Mastercard chargeback rate = chargebacks raised in month M / captured transactions in month M-1
Mastercard fraud chargeback rate = fraud chargebacks in month M / e-commerce transactions in month M-1
```

Mastercard's Excessive Chargeback Merchant level starts at 100 chargebacks and a 1.5% rate; its Excessive Fraud Merchant program combines a minimum of 1,000 e-commerce transactions, more than $50,000 of fraud chargebacks, a fraud chargeback rate above 0.50% and low 3-D Secure use. Those thresholds belong to [Disputes & Chargebacks](/books/payments/disputes-and-chargebacks); the metric's job is to reproduce the network's arithmetic daily, so the month's number is known before the network reports it. Neither network subtracts refunds or won disputes: a dispute counts when it's raised.

**Dispute win rate.** Won disputes over disputes challenged with evidence, by dispute date. Stripe notes its win rate excludes disputes never challenged and looks low for recent months while outcomes are pending, which can take 60 to 75 days. Report **evidence submission rate** (disputes challenged over disputes received) beside it, because a high win rate on few challenges says little.

**Dispute loss** (this book's): disputed amount lost plus dispute fees, over the period's volume, in basis points. This is the money number, as opposed to the ratio the networks police.

**Refund rate** (this book's):

```text
refund rate (count) = refunds issued / captured payments
refund rate (value) = refunded amount / captured amount
```

Count refunds by the month of the refund and by the month of the original payment, as with disputes. A rising refund rate can be a product problem or good dispute prevention (refunding before the cardholder disputes, as [Prevention Beats Winning](/books/payments/disputes-and-chargebacks#prevention-beats-winning) recommends), so read it with the dispute rate. Refunds to cards that never paid the merchant are a fraud signal, not a refund metric ([Merchant Fraud](/books/payments/fraud-and-risk#merchant-fraud)).

## Revenue and Cost

All amounts here are ledger amounts in minor units, by currency, converted for reporting only at the rates recorded on each entry ([Money](/docs/payments/money), [Multi-Currency](/docs/payments/multi-currency)).

**Gross volume:** captured amount, before refunds and disputes. **Net volume:** captured minus refunded minus lost disputes.

**Net revenue** (this book's): what the platform keeps after paying the cost of acceptance.

```text
net revenue = fees billed to merchants
            - interchange
            - network fees (assessments and per-transaction fees)
            - processor and acquirer fees
```

**Take rate:** net revenue over gross volume, in basis points. It's the single number investors ask about and the least useful one operationally, because it moves with mix: more debit, more domestic, more large merchants on negotiated pricing all lower it without anything going wrong. Always report it with its mix (by card type, region and pricing model).

**Effective rate**, from the merchant's side: total fees the merchant paid over its sales volume. Canada's Code of Conduct defines the effective merchant discount rate as total acquirer and processor fees and network fees paid, divided by sales volume, per card type, and requires it on statements at least monthly ([Statements and Reports](/books/payments/operating-the-platform#statements-and-reports)). Use the same definition everywhere, since a merchant comparing your statement with a competitor's quote will.

**Interchange pass-through margin** (this book's): for merchants on interchange-plus pricing, the markup the platform kept, after the pass-through components cancel out.

```text
pass-through margin = (fees billed - interchange billed - network fees billed)
                    - (processor and acquirer fees paid)
                    + (interchange billed - interchange paid)
                    + (network fees billed - network fees paid)
```

The last two terms should be zero. When they aren't, the pricing engine estimated interchange or network fees that the settlement file contradicted (a downgrade, a misread fee program), and the difference is either the platform's loss or an overcharge to the merchant ([A Pricing Engine](/books/payments/interchange-and-pricing#a-pricing-engine), [Downgrades](/books/payments/interchange-and-pricing#downgrades)). Report it per merchant and per interchange category.

**Cost per transaction** (this book's): interchange, network and processor costs, plus allocated infrastructure, vault, fraud vendor and support costs, over transaction count, by rail. It's the number that decides minimum fees and which rail to steer customers toward ([Comparing the Rails](/books/payments/comparing-the-rails)).

## Money Movement

**Payout timeliness** (this book's): of payouts due in a period, the share that arrived at the merchant's bank on the scheduled date.

```text
payout timeliness = payouts settled on or before the scheduled arrival date / payouts due
```

The denominator is payouts that were due, including those held, delayed or failed, so a missed cutoff counts against it. Report the reasons for every late payout (missed cutoff, bank return, risk hold, insufficient balance, bank holiday handled wrong) and the **payout failure rate** (returned or rejected payouts over payouts sent, by return code) beside it ([Payout Failures](/books/payments/payouts-and-settlement#payout-failures)). A held payout is a decision, not a failure, but it's still late from the merchant's side.

**Reconciliation break rate and age** (this book's):

```text
break rate = unmatched items / items expected to match, per source (processor file, bank statement)
break age  = today - opened_on, per open break; report count and amount by age bucket
```

A break is any expected item without its counterpart: a captured payment with no settlement line, a deposit with no payout, a fee the ledger didn't expect. The rate says how good matching is; the age says how good the team is, and old breaks are where losses hide. Report the open break amount by the age buckets of [Breaks](/books/payments/ledger-and-reconciliation#breaks) (today, 1 to 3 days, 4 to 7, 8 to 30, older) next to the count, and alert on age, since a cash break stops payouts ([Watching the Pipeline](/books/payments/operating-the-platform#watching-the-pipeline)).

**Settlement lag** (this book's): time from capture to funds received from the processor, by processor and rail, against the expected schedule. A lag that grows is a processor holding funds before it tells you.

## Merchants

**Onboarding time to live** (this book's): elapsed time from application submitted to first live payment, reported as a median and 90th percentile, split by risk tier and by the time spent waiting on the merchant versus waiting on you. The second split is the one to manage, since a slow merchant upload and a slow review queue look the same in the total ([A State Machine, Not a Checkbox](/books/payments/merchant-onboarding#a-state-machine-not-a-checkbox)).

**Onboarding approval rate** (this book's): approved applications over decided applications, with declined, withdrawn and pending reported separately, by tier and channel. A sudden rise is as suspicious as a fall: either the funnel improved or the review got looser.

**Activation rate** (this book's): approved merchants with a live payment within 30 days, over approved merchants. Software platforms live on this one, since an approved merchant that never processes earns nothing.

**Losses** (this book's), in basis points of volume, split by kind because each has a different owner:

```text
fraud loss      = fraud disputes lost + fraud refunds the platform absorbed
merchant credit loss = negative merchant balances written off
                       (disputes, refunds and fees the merchant couldn't cover)
operational loss = errors: duplicate payouts, mispriced fees, unrecoverable mistakes
```

Merchant credit loss is the payfac's distinctive risk, the bust-out of [Merchant Fraud](/books/payments/fraud-and-risk#merchant-fraud) and the negative balances of [Payouts & Settlement](/books/payments/payouts-and-settlement#negative-balances), and it's written off only after the recovery steps fail, so it lags the risk by months.

**Reserve coverage** (this book's): reserves held over estimated exposure, per merchant and for the portfolio.

```text
reserve coverage = reserve balance / exposure
  exposure = expected refunds + disputes over the remaining dispute window
           + undelivered goods and services already paid for
```

How exposure is estimated is in [Underwriting and Risk Tiers](/books/payments/merchant-onboarding#underwriting-and-risk-tiers); the metric's job is to show which merchants' coverage has fallen as their volume grew, before a loss does.

## Reliability

Service level objectives follow the general method in [SLOs](/docs/operations/slos): pick indicators users feel, set targets, alert on burn rate. The payments-specific indicators:

| Indicator | Definition (good events / valid events) | Notes |
| --- | --- | --- |
| **Authorization availability** | Authorization requests that returned an outcome (approval or decline) / authorization requests received | Declines are successes here; timeouts and errors aren't |
| **Authorization latency** | Requests answered under the target time / requests | Set well inside the networks' timeout clocks ([Watching Approval Rates and Latency](/books/payments/operating-the-platform#watching-approval-rates-and-latency)) |
| **Unknown outcomes** | Timeouts resolved by query or reversal within the target time / timeouts | Unresolved unknowns become duplicate charges or lost holds ([Failover Without Double Charging](/books/payments/processor-routing#failover-without-double-charging)) |
| **Webhook delivery** | Events delivered within the target lag / events | Per merchant endpoint, so one failing endpoint is visible |
| **Payout on time** | As payout timeliness above | A reliability objective as much as a finance metric |
| **File deadlines** | Outbound bank and network files transmitted before cutoff / files due | Per rail and cutoff ([The Banking Calendar](/books/payments/treasury#the-banking-calendar)) |

Authorization availability is measured per processor and for the platform, because a processor outage that failover absorbs is invisible at the platform level and very visible in the processor's bill and its approval rates.

## Building the Pipeline

Metrics that set reserves, fees and commissions need a pipeline that is complete, replayable and kept off the production database ([Keep Analytics Off Production](/docs/architecture/data-pipelines#keep-analytics-off-production)). The core data model in [How Card Payments Work](/books/payments/card-payments) already has the events these metrics are built from; the pipeline adds facts at the right grain. The one that matters most is one row per attempt, not per payment, because every acceptance metric is a ratio of attempts:

```sql
-- One row per authorization attempt, with what each acceptance metric needs
CREATE TABLE fct_payment_attempts (
  attempt_id            UUID PRIMARY KEY,
  payment_id            UUID NOT NULL,          -- the purchase; dedup groups on this
  merchant_id           UUID NOT NULL,
  processor             TEXT NOT NULL,
  attempted_at          TIMESTAMPTZ NOT NULL,
  business_on           DATE NOT NULL,          -- assigned once, in the reporting zone
  amount                BIGINT NOT NULL,        -- minor units
  currency              CHAR(3) NOT NULL,
  brand                 TEXT NOT NULL,
  card_type             TEXT,                   -- credit | debit | prepaid
  card_country          CHAR(2),
  bin_data_version      TEXT,
  channel               TEXT NOT NULL,          -- card_present | ecommerce | moto
  initiation            TEXT NOT NULL,          -- cit | mit
  credential            TEXT NOT NULL,          -- pan | network_token | wallet
  attempt_number        INTEGER NOT NULL,       -- within the payment
  stage_reached         TEXT NOT NULL,          -- invalid | authentication | risk | network
  outcome               TEXT NOT NULL,          -- approved | declined | blocked | auth_failed | error | unknown
  decline_class         TEXT,                   -- soft | hard
  decline_reason        TEXT,                   -- normalized
  raw_issuer_code       TEXT,
  merchant_advice_code  TEXT,
  is_final_attempt      BOOLEAN NOT NULL,       -- set when the payment's retry window closes
  definition_version    TEXT NOT NULL
);
```

From it, the success rate counts `outcome = 'approved'` over rows with `stage_reached <> 'invalid'`; the authorization rate over rows with `stage_reached = 'network'`; the deduplicated rates use only `is_final_attempt` rows. A dispute fact (one row per dispute, with raised date, payment date, network, reason, fraud flag and outcome) and a fraud report fact feed the network ratios; the ledger feeds revenue, cost, losses and reserves; payout and reconciliation facts feed the money movement metrics.

Three holes to close. **Network data isn't yours:** fraud reports and network program counts arrive from the processor, late, and Visa's enumeration count comes from a model you can't run, so store the network's reported figures beside your own estimate and reconcile them monthly ([Reconcile to the Source](/docs/architecture/data-pipelines#reconcile-to-the-source)). **Late labels:** a dispute can arrive months after its payment, so metrics by payment month are restated as labels arrive, and frozen periods are snapshotted rather than recomputed ([Versions, Stamps and Frozen Periods](/docs/architecture/data-pipelines#versions-stamps-and-frozen-periods)). **The business date:** a payment's day is assigned once, in a declared zone; the networks report in their own cutoffs and Stripe's analytics in UTC, so reconcile at month level, not day level ([Assign the Business Date Once](/docs/architecture/data-pipelines#assign-the-business-date-once)).

## Auditing Metric Definitions

A metric that sets a reserve, a merchant's pricing tier or a salesperson's commission will be disputed. The general practice (versioned definitions, stamped outputs, frozen periods, logged overrides) is in [One Definition per Metric](/docs/architecture/data-pipelines#one-definition-per-metric), and the audit record in [Audit Trails](/docs/architecture/audit-trails). What payments adds:

- **Reference data is part of the definition.** The decline-code classification, BIN tables and interchange tables change what a metric says without any code change, so each version is recorded and stamped on the outputs it fed.
- **Network figures are kept as reported.** The monthly VAMP, chargeback and fraud figures from the network or processor are stored unchanged, with your own estimate beside them and the explanation of any gap, because those figures are what fines and terminations are based on.
- **Overrides are actions with reasons.** Excluding a merchant from a portfolio ratio, reclassifying a dispute, or writing off a balance is an attributed action, reviewable by someone other than the person it benefits.
- **Watch for gaming.** Retries that inflate raw approvals, refunds timed to keep a dispute ratio under a threshold, merchants split across new merchant IDs or descriptors to reset network counts, and reviews closed in bulk before month end are the patterns to alert on.

## What This Means for the System You Build

- **Every metric is a versioned definition** with unit, numerator, denominator, inclusion rules and clock, and network definitions used verbatim wherever a network threshold applies.
- **One row per attempt,** with the stage reached, the outcome, the raw codes and a final-attempt flag, so success, authorization, raw and deduplicated rates all come from one fact.
- **Both acceptance rates, both ways:** payment success and authorization rate, raw and deduplicated, sliced by processor, brand, issuer, card type, country, initiation and credential.
- **Network ratios reproduced daily,** per merchant and for the portfolio, on the network's own clock and with the network's exclusions, and reconciled to the network's monthly figures.
- **Fraud and disputes by count and by value,** by report month and by payment month.
- **Money metrics from the ledger:** net revenue, take rate with its mix, effective rate per card type, and pass-through margin that shows where estimated costs met actual ones.
- **Payout timeliness, payout failures and reconciliation breaks by age,** as operating metrics and as objectives.
- **Merchant metrics with the waiting split out,** losses split by kind, and reserve coverage per merchant.
- **SLOs on authorization availability, latency, unknown outcomes, webhooks, payouts and file deadlines,** per processor and for the platform.

## References

**Specifications**

- [Visa: Visa Acquirer Monitoring Program fact sheet (PDF)](https://corporate.visa.com/content/dam/VCOM/corporate/visa-perspectives/security-and-trust/documents/visa-acquirer-monitoring-program-fact-sheet-2025.pdf), the count-based VAMP ratio and its exclusions, acquirer and merchant thresholds, and the enumeration ratio
- [FCAC: Code of Conduct for the Payment Card Industry in Canada](https://www.canada.ca/en/financial-consumer-agency/services/industry/laws-regulations/credit-debit-code-conduct.html), the effective merchant discount rate and monthly statement contents

**In practice**

- [Stripe: Acceptance analytics](https://docs.stripe.com/payments/analytics/acceptance), payment success rate and authorization rate, the worked example, raw and deduplicated rates, and the pivots by card attributes
- [Stripe: Disputes analytics](https://docs.stripe.com/payments/analytics/disputes), dispute rate, fraud rate, win rate and evidence submission rate, dispute date versus payment date, and early fraud warnings
- [Stripe: Dispute and fraud card monitoring programs](https://docs.stripe.com/disputes/monitoring-programs), Visa's same-month and Mastercard's previous-month calculations, VAMP counting and thresholds, Mastercard ECP and EFM thresholds, and why provider and network figures differ
