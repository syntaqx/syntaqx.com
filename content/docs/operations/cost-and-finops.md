+++
title = "Cost & FinOps"
description = "Cloud cost as an engineering input: unit economics, an owner for every dollar, budgets and anomaly alerts, the few levers that matter, and free-tier cliffs."
category = "Operations"
order = 1209
tags = ["cost", "finops", "operations", "cloud"]
+++

In the cloud, every engineer is a purchasing department. A config change, a log level, a forgotten environment or a chatty service call turns directly into money, and the bill arrives a month later, aggregated past the point where anyone can tell which decision caused it. Cost is an engineering property, like latency, that you design for and measure. The goal isn't spending less; it's spending on purpose, and noticing quickly when that changes.

## Measure Cost per Unit, Not Just in Total

A bill that went from $40,000 to $55,000 tells you nothing alone. If traffic grew 60%, that's an efficiency win; if it was flat, something is wrong. A unit cost can tell the two apart. Pick a unit that matches how the business earns money (cost per thousand API requests, per active customer per month, per payment processed) and track it over time.

The [FinOps Foundation](https://www.finops.org/framework/capabilities/unit-economics/) frames unit economics as connecting technology spend to the value it creates; its own example is cost per API call. Once you have the number, "should we cache this?" becomes "this cuts cost per request by 30%", and a design review can ask what a feature does to unit cost the way it asks about latency.

## Every Dollar Has an Owner

Unowned spend never goes down: when everything is "infrastructure", every team assumes the cost is someone else's. Tag every resource with its owning team and service, enforced at creation by policy as code ([Infrastructure as Code](/docs/delivery/infrastructure-as-code)), and show each team its own costs on a dashboard they actually see. Teams don't need a chargeback model to change behavior; they need the number next to their name. Untagged spend is a metric to drive down, because that's where the waste hides.

## Budgets and Anomaly Alerts

Cost problems are usually sudden: a deploy that turns on debug logging, a retry loop against a paid API, a forgotten test environment. A monthly bill finds them thirty days late.

- **Alert on anomalies daily.** Provider anomaly detection (for example [AWS Cost Anomaly Detection](https://aws.amazon.com/aws-cost-management/aws-cost-anomaly-detection/)) learns normal spend and flags departures.
- **Budgets per team or service,** alerting well before the limit, routed to the owning team, not a finance inbox.
- **Treat a large spike like an [incident](/docs/operations/incident-response):** an owner, a cause, a follow-up. A runaway loop that costs $5,000 overnight is an outage of a different kind.

## The Levers That Actually Matter

A handful of levers account for most savings. Work on them in order of size, not of how interesting they are.

| Lever | Why it's big | Watch out for |
| ----- | ------------ | ------------- |
| **Rightsizing** | Most resources are provisioned for a peak that never comes | Do it from measured utilization, and keep headroom per [Load & Performance Testing](/docs/quality/load-testing) |
| **Commitments vs on-demand** | Committed-use discounts are large; AWS advertises [Savings Plans](https://aws.amazon.com/savingsplans/) at up to 72% below on-demand | Commit only to the steady baseline you're confident in; commitments are the hardest decision to undo |
| **Data transfer and egress** | Often invisible in design: cross-region or cross-zone chatter and internet egress are billed per GB | Draw where data flows in the design doc, not after the bill |
| **Storage lifecycle** | Data accumulates forever by default: logs, backups, old artifacts | Retention rules per [Data Retention & Deletion](/docs/architecture/data-retention); move cold data to cheaper tiers |
| **Idle environments** | Preview, staging and load-test environments running nights and weekends | Make them ephemeral or scheduled ([Environments & Configuration](/docs/operations/environments)) |

Rightsizing and idle environments are low-risk and fast. Commitments save the most but lock you in, so they come after rightsizing; committing to an oversized baseline locks in the waste.

## Free Tiers and Their Cliffs

Free tiers are a real strategy for small systems, and also a cliff: limits that, when crossed, either stop your service or start billing. Know which. Vercel's Hobby plan, for example, pauses a feature until 30 days have passed when you exceed its usage limits, and is for non-commercial personal use only, per its [plan docs](https://vercel.com/docs/plans/hobby). Design the cliff into the system, so a free datastore that stops answering degrades a feature instead of failing it, and track usage against the limit like a budget, so the cliff is a forecast, not a surprise.

## Cost in Design Reviews

Every [design doc](/docs/engineering/design-docs) that adds infrastructure estimates its cost: what it runs on, at what scale, and how cost grows with usage. Rough is fine; the point is asking while the design can still change.

## The FinOps Loop

The [FinOps Foundation framework](https://www.finops.org/framework/phases/) describes the practice as three phases that repeat: **Inform** (make spend visible and attributable), **Optimize** (find where it can be more efficient) and **Operate** (make the changes and the habits stick). It's a useful check: dashboards nobody acts on are Inform without Operate, and one-off cleanups are Optimize without the habits that stop the waste coming back.

## References

**Reference**

- [AWS Well-Architected: Cost Optimization Pillar](https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html), designing for cost as a pillar alongside reliability and performance
- [AWS Cost Anomaly Detection](https://aws.amazon.com/aws-cost-management/aws-cost-anomaly-detection/), alerting on unusual spend
- [AWS Savings Plans](https://aws.amazon.com/savingsplans/), committed-use discounts of up to 72% against on-demand
- [Vercel: Hobby plan](https://vercel.com/docs/plans/hobby), included usage, what happens when it's exceeded, and the non-commercial restriction

**In practice**

- [FinOps Foundation: What is FinOps](https://www.finops.org/introduction/what-is-finops/), the practice and its principles
- [FinOps Foundation: Phases](https://www.finops.org/framework/phases/), Inform, Optimize and Operate as an iterative loop
- [FinOps Foundation: Unit Economics](https://www.finops.org/framework/capabilities/unit-economics/), connecting spend to value with per-unit metrics
