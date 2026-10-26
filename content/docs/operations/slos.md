+++
title = "SLOs & Error Budgets"
description = "Picking SLIs that reflect what users feel, setting SLO targets, spending error budgets deliberately, and alerting on burn rate instead of raw thresholds."
category = "Operations"
order = 1203
tags = ["reliability", "slo", "alerting", "operations"]
aliases = ["slos"]
+++

"Is it reliable enough?" needs a number, agreed on before the incident, not argued about during it. Service level objectives give you that number, and error budgets turn it into a decision rule.

The point isn't maximum reliability. 100% is the wrong target for nearly everything: users can't tell 99.99% from 100% through their own flaky Wi-Fi, and chasing the difference costs releases you could have shipped. An SLO says how much unreliability is acceptable, which turns the rest into a budget for moving fast. The vocabulary and burn-rate math come from Google's [SRE Book](https://sre.google/sre-book/service-level-objectives/) and [Workbook](https://sre.google/workbook/implementing-slos/), now the industry's common language.

## Terms

| Term | Meaning | Example |
| ---- | ------- | ------- |
| SLI | A measurement of good events over valid events | Requests served successfully in under 300ms, over all requests |
| SLO | The target for an SLI over a window | 99.9% over a rolling 30 days |
| Error budget | `1 - SLO`, the unreliability you're allowed | 0.1%, about 43 minutes of full outage per 30 days |
| SLA | A contract with consequences, looser than the SLO | 99.5%, with service credits |

The SLO is always stricter than any SLA, so you find out you're in trouble before your customers' lawyers do.

## Choosing SLIs

Measure what users feel, as close to them as you can (the load balancer or the client, not the database).

| Kind of service | SLIs |
| --------------- | ---- |
| Request/response API | Availability (non-`5xx` ratio), latency (ratio under a threshold) |
| Pipelines and jobs | Freshness (age of the newest processed data), correctness |
| Queues and [webhooks](/docs/api-design/webhooks) | Delivery latency, ratio delivered within the retry window |

- **Ratios, not averages.** "99% of requests under 300ms" is an SLI; "average latency 120ms" hides the slow tail users notice.
- **`4xx` aren't failures.** A `422` is the API working correctly ([Error Responses](/docs/requests/error-responses)). A `429` is a failure only if you throttled someone below their documented [rate limit](/docs/requests/rate-limiting).
- **A few per journey.** Two or three; twenty means nobody looks at any of them.

## Setting Targets

- **Start from today's performance,** then tighten as you earn it. An SLO you miss every month is ignored; one you beat by miles is wasted budget.
- **Each extra nine is a different kind of system.** 99.9% allows 43 minutes a month: a human can be paged and roll back. 99.99% allows 4, which only works if failover and rollback are automatic. Each nine costs roughly ten times the last.
- **Critical paths get stricter targets.** Authorizing a payment and rendering a settings page don't deserve the same objective.
- **Rolling 30-day windows,** reviewed quarterly.

## Error Budget Policy

The budget only matters if spending it changes behavior. Write the policy down before you need it:

| Budget remaining | What happens |
| ---------------- | ------------ |
| Healthy | Ship freely. Run experiments, do risky migrations |
| Under 25% | Risky changes need a rollback plan reviewed in advance |
| Exhausted | Feature releases freeze for that service. Work goes to reliability until the budget recovers |

Exceptions (a security fix, a regulatory deadline) are allowed, and written down. Any single incident that burns more than 20% of the budget gets a [postmortem](/docs/operations/incident-response), even if nobody noticed.

Without a policy, the budget is a dashboard: feature work continues while reliability burns, and the conversation happens after the outage. With one, the tradeoff between shipping and stability is a rule agreed in advance, not whoever argues loudest during the incident.

## Alerting on Burn Rate

Alert on how fast the budget is being spent, not on raw error rates. Burn rate is the error rate divided by the rate the SLO allows: at 99.9%, a 0.1% error rate is a burn rate of 1, which spends the budget exactly by the end of the window.

The [Workbook's recommended alerts](https://sre.google/workbook/alerting-on-slos/) for a 99.9% SLO over 30 days:

| Severity | Long window | Short window | Burn rate | Budget consumed |
| -------- | ----------- | ------------ | --------- | --------------- |
| Page | 1 hour | 5 minutes | 14.4 | 2% |
| Page | 6 hours | 30 minutes | 6 | 5% |
| Ticket | 3 days | 6 hours | 1 | 10% |

An alert fires only when **both** windows are over the burn rate. The long window keeps it from paging on a blip, and the short window (one-twelfth of the long one) makes it stop firing soon after the problem is fixed.

These replace threshold alerts like "error rate above 1% for 5 minutes", which page on spikes that don't matter and miss slow leaks that do. What happens after the page is [On-Call & Runbooks](/docs/operations/on-call).

## References

**In practice**

- [Google SRE Book: Service Level Objectives](https://sre.google/sre-book/service-level-objectives/), SLIs, SLOs and SLAs
- [Google SRE Workbook: Implementing SLOs](https://sre.google/workbook/implementing-slos/), choosing SLIs and targets
- [Google SRE Workbook: Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/), multiwindow burn-rate alerts
- [Google SRE Workbook: Error Budget Policy](https://sre.google/workbook/error-budget-policy/), what happens when the budget is spent
- [Google SRE Book: Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/), alerting on symptoms
