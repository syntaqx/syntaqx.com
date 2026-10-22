+++
title = "Cost & FinOps"
description = "Cloud cost as an engineering input: unit economics, an owner for every dollar, budgets and anomaly alerts, the few levers that matter, and free-tier cliffs."
category = "Operations"
order = 5.99
tags = ["cost", "finops", "operations", "cloud"]
+++

In the cloud, every engineer is a purchasing department. A config change, a log level, a forgotten environment or a chatty service call turns directly into money, and the bill arrives a month later, aggregated past the point where anyone can tell which decision caused it. Cost management isn't finance's job you occasionally help with. It's an engineering property, like latency, that you design for and measure.

The goal isn't spending less. It's spending on purpose: knowing what each dollar buys, and noticing quickly when that changes.

## Measure Cost per Unit, Not Just in Total

A bill that went from $40,000 to $55,000 tells you nothing on its own. If traffic grew 60%, that's an efficiency win. If traffic was flat, something is wrong. The total can't distinguish the two; a unit cost can.

Pick a unit that matches how the business earns money, and track cost per unit over time:

- Cost per thousand API requests
- Cost per active customer per month
- Cost per payment processed, or per GB stored for a customer

The [FinOps Foundation](https://www.finops.org/framework/capabilities/unit-economics/) frames unit economics as connecting what you spend on technology to the value it creates; its own example is cost per API call, total API cost divided by call count. Once you have the number, cost conversations change. "Should we cache this?" becomes "this cuts cost per request by 30%", and a new feature's design review can ask what it does to unit cost, the same way it asks what it does to latency.

## Every Dollar Has an Owner

Unowned spend never goes down. A shared account where everything is "infrastructure" means every team can assume the cost belongs to someone else.

- **Tag or label every resource** with the owning team and the service, enforced at creation time (policy as code; see [Infrastructure as Code](/docs/delivery/infrastructure-as-code)), not cleaned up afterwards.
- **Show each team its own costs,** on a dashboard they actually see. Teams don't need a chargeback model to change behavior; they need to see the number next to their name.
- **Untagged spend is a metric to drive down.** If 30% of the bill can't be attributed, that 30% is where the waste is hiding.

## Budgets and Anomaly Alerts

Cost problems are usually sudden: a deploy that turns on debug logging, a retry loop against a paid API, a test environment that someone forgot to tear down. A monthly bill finds these thirty days late.

- **Alert on anomalies daily,** not on the monthly total. Cloud providers' anomaly detection (for example [AWS Cost Anomaly Detection](https://aws.amazon.com/aws-cost-management/aws-cost-anomaly-detection/)) learns normal spend and flags departures from it.
- **Budgets per team or service,** with alerts at thresholds well before the limit, routed to the owning team rather than a finance inbox.
- **Treat a cost spike like an incident** when it's large: someone owns it, it gets a cause, and the fix gets a follow-up. A runaway loop that costs $5,000 overnight is an outage of a different kind.

## The Levers That Actually Matter

A handful of levers account for most savings. Work on them in order of size, not of how interesting they are.

| Lever | Why it's big | Watch out for |
| ----- | ------------ | ------------- |
| **Rightsizing** | Most resources are provisioned for a peak that never comes | Do it from measured utilization, and keep headroom per [Load & Performance Testing](/docs/operations/load-testing) |
| **Commitments vs on-demand** | Committed-use discounts are large; AWS advertises [Savings Plans](https://aws.amazon.com/savingsplans/) at up to 72% below on-demand | Commit only to the steady baseline you're confident in; commitments are the hardest decision to undo |
| **Data transfer and egress** | Often invisible in design: cross-region or cross-zone chatter and internet egress are billed per GB | Draw where data flows in the design doc, not after the bill |
| **Storage lifecycle** | Data accumulates forever by default: logs, backups, old artifacts | Retention rules per [Data Retention & Deletion](/docs/architecture/data-retention); move cold data to cheaper tiers |
| **Idle environments** | Preview, staging and load-test environments running nights and weekends | Make them ephemeral or scheduled (see [Environments](/docs/operations/environments)) |

The order matters. Rightsizing and idle environments are low-risk and fast. Commitments save the most but lock you in, so they come after the usage is right-sized, not before; committing to an oversized baseline locks in the waste.

## Free Tiers and Their Cliffs

Free tiers are a real strategy for small systems, not a trick. They're also a cliff: usage limits that, when crossed, either stop your service or start billing, and you want to know which before it happens.

- **Know each limit and what happens at it.** Some providers pause the feature until the period resets; others start charging if a card is attached. Vercel's Hobby plan, for example, pauses a feature until 30 days have passed if you exceed its usage limits, and is for non-commercial personal use only, per its [plan docs](https://vercel.com/docs/plans/hobby). Read the terms, not just the quotas.
- **Design the cliff into the system.** If a free datastore stops answering at its limit, the feature that depends on it should degrade, not fail.
- **Track usage against the limit** the same way you'd track a budget, so the cliff is a forecast, not a surprise.

## Cost in Design Reviews

Every [design doc](/docs/engineering/design-docs) that adds infrastructure should estimate its cost: what it runs on, at what scale, and how cost grows with usage. Rough is fine. The point is that the question gets asked while the design can still change, rather than after the first bill.

## The FinOps Loop

The [FinOps Foundation framework](https://www.finops.org/framework/phases/) describes the practice as three phases that repeat: **Inform** (make spend visible and attributable), **Optimize** (find where it can be more efficient) and **Operate** (make the changes and the habits stick). It's a useful check that you're not stuck in one phase: dashboards nobody acts on are Inform without Operate, and one-off cleanup projects are Optimize without the habits that stop the waste coming back.

## This Site

[syntaqx.com](https://github.com/syntaqx/syntaqx.com) is deliberately built to run on free tiers, and treats that as a design constraint. Its [decision record on datastores](https://github.com/syntaqx/syntaqx.com/blob/main/docs/adr/0001-no-authentication-or-user-identity.md) allows one only if it's managed, on a free tier and never on the critical path. The rate limiter's Upstash Redis free tier includes 500K commands a month (per [Upstash's pricing](https://upstash.com/pricing/redis)), so the limiter uses one script per request and caches blocked clients in memory to stay well inside it, and it falls back to in-memory counting if Redis stops answering. The cliff is designed in: crossing it makes rate limits per-instance for a while, not an outage.

## References

**Reference**

- [AWS Well-Architected: Cost Optimization Pillar](https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html), designing for cost as a pillar alongside reliability and performance
- [AWS Cost Anomaly Detection](https://aws.amazon.com/aws-cost-management/aws-cost-anomaly-detection/), alerting on unusual spend
- [AWS Savings Plans](https://aws.amazon.com/savingsplans/), committed-use discounts of up to 72% against on-demand
- [Vercel: Hobby plan](https://vercel.com/docs/plans/hobby), included usage, what happens when it's exceeded, and the non-commercial restriction
- [Upstash: Redis pricing](https://upstash.com/pricing/redis), the free tier's monthly command allowance

**In practice**

- [FinOps Foundation: What is FinOps](https://www.finops.org/introduction/what-is-finops/), the practice and its principles
- [FinOps Foundation: Phases](https://www.finops.org/framework/phases/), Inform, Optimize and Operate as an iterative loop
- [FinOps Foundation: Unit Economics](https://www.finops.org/framework/capabilities/unit-economics/), connecting spend to value with per-unit metrics
