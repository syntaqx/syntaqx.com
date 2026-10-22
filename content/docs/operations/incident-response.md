+++
title = "Incident Response"
description = "Running an incident while it's happening: declare early, assign a commander who doesn't debug, mitigate before diagnosing, and communicate on a clock."
category = "Operations"
order = 1205
tags = ["incidents", "operations", "on-call", "reliability"]
+++

An incident is the worst time to invent a process. Everyone is stressed, information is incomplete, and the instinct of every engineer in the room is to start debugging. Left alone, that instinct produces the classic failure: five people investigating the same graph, two of them changing production at once, nobody telling customers anything, and an hour later nobody can say who decided what.

Incident response is the small amount of structure that prevents that. It's not bureaucracy; it's a way of making sure the work gets split, the changes get coordinated, and the people outside the room know what's happening.

## Declare Early

The most expensive incidents are the ones nobody declared. An engineer notices elevated errors, assumes it's a blip, starts poking at it alone, and forty minutes later the problem is customer-visible, three teams are involved, and the response is starting from zero.

Declaring is cheap. It opens a channel, pages a commander, and starts a timeline. If it turns out to be nothing, you close it in five minutes and nobody minds. Undeclared incidents are expensive in a way that only shows up later: no timeline for the postmortem, no customer communication, no one coordinating.

Google's SRE teams use three questions; if any answer is yes, it's an incident:

- Does fixing it need a second team?
- Is it visible to customers?
- Is it still unsolved after an hour of focused work?

The [Google SRE book](https://sre.google/sre-book/managing-incidents/) puts the bias plainly: it's better to declare early and stand down than to start the process hours into a worsening problem. Build the culture to match. Nobody gets criticized for declaring an incident that turned out to be minor; people get asked why they didn't declare one that wasn't.

## Severity Levels

Severity decides who gets woken up and how fast you communicate, so it has to be decidable in seconds, by whoever is on call, without a meeting. That means criteria about impact, not about cause:

| Severity | Criteria | Response |
| -------- | -------- | -------- |
| **SEV1** | Core flow down for many customers (can't log in, can't pay), data loss or exposure, or money moving incorrectly | Page the commander and owning teams now; status page within 15 minutes; updates every 30 minutes |
| **SEV2** | A major feature degraded, a subset of customers fully blocked, or an [SLO](/docs/operations/slos) burning fast | Commander assigned; status page if customers can see it; updates hourly |
| **SEV3** | Minor degradation with a workaround, or internal-only impact | Owning team handles it in business hours; tracked like an incident |

- **When unsure, pick the higher severity.** Downgrading is free; discovering at minute 50 that this was a SEV1 is not.
- **Severity follows impact, so it can change.** An incident that starts as SEV3 and spreads gets upgraded, and everyone's response changes with it.
- **Anything touching money or personal data starts at SEV1** until proven otherwise. A double charge affecting ten customers matters more than its user count suggests (see [Payment States & Ledgers](/docs/payments/payment-states)).

## Roles

The structure most of the industry uses descends from the [Incident Command System](https://training.fema.gov/emiweb/is/icsresource/) that US emergency services built for wildfires: one person commands, others execute, and responsibilities are explicit. Google's incident management is [based on it](https://sre.google/sre-book/managing-incidents/), and [PagerDuty's public incident response guide](https://response.pagerduty.com/) uses the same shape.

| Role | Owns | Doesn't |
| ---- | ---- | ------- |
| **Incident commander (IC)** | The overall picture, decisions, assigning work, the timeline | Debug or change production |
| **Operations lead** | Hands on keyboard: investigating, mitigating, the only one changing the system | Talk to customers or executives |
| **Communications lead** | Status page, customer and internal updates, on a clock | Investigate |
| **Subject matter experts** | Answers about their system, when asked | Freelance changes |

**The commander doesn't debug.** This is the rule people break most and regret most. The moment the IC opens a dashboard to chase a theory, nobody is tracking what everyone else is doing, nobody notices the second team arriving, and nobody is deciding whether to roll back. Debugging is absorbing by design; command can't be. On a small team, one person may hold several roles, but say out loud which one you're doing right now.

**Only the operations lead changes production.** Two people "trying something" at the same time is how a mitigation gets undone by an unrelated fix, and how the postmortem can't explain what actually helped.

**Handoffs are explicit.** For long incidents, people need to sleep. The outgoing IC briefs the incoming one live, says "you're now the incident commander," waits for an acknowledgment, and announces the change in the channel. A silent handoff leaves two people who each think the other is in charge.

## Mitigate First, Diagnose Later

During an incident, the goal is to stop the impact, not to understand it. Those are different activities, and the second one can wait.

- **Roll back first if a deploy is plausibly involved.** A rollback is fast, well-practiced and reversible (see [Deployment Strategies](/docs/delivery/deployment-strategies)). Proving the deploy was the cause takes longer than undoing it.
- **Use the switches you built for this:** kill-switch [feature flags](/docs/delivery/feature-flags), shedding load, failing over, scaling up, blocking an abusive client.
- **Keep evidence while you mitigate.** Note the time and the action, grab logs or a heap dump if it's cheap, then act. The root cause matters, for the [postmortem](/docs/operations/incident-response), not for the next ten minutes.

The trap is a team that has a theory and wants to confirm it before acting. If confirming takes thirty minutes and rolling back takes two, roll back. If the rollback didn't help, you've learned something and lost two minutes.

## One Channel, One Timeline

- **One incident channel,** named for the incident, where all coordination happens. Side conversations in direct messages are invisible to the IC and to the postmortem.
- **A running timeline** of what was observed, decided and changed, with UTC times ([Time & Date Formats](/docs/fundamentals/time)). The IC owns it; a scribe can keep it. Google calls the live incident document the commander's most important responsibility, because it's the only shared picture of what's going on.
- **A pinned summary** at the top: current impact, current hypothesis, current actions, who's in which role, and when the next update is due. Anyone joining reads that, not three hundred messages.

## Communicate on a Clock

Silence during an incident reads as either "they don't know" or "they don't care". Both cost more trust than the outage.

- **Post the first status update fast,** even if it only says "we're investigating elevated errors on checkout". Customers already know something is wrong; confirming it is the respectful thing to do.
- **Give every update a next-update time,** and keep it even when nothing has changed. "No change; still investigating; next update at 14:30 UTC" is a real update.
- **Write for the reader.** Customers need impact and workaround, not hypotheses about connection pools. Executives need impact, customer exposure and expected duration.
- **Internal and external updates come from the communications lead,** so the people fixing the problem aren't interrupted to write them.

## When to Escalate

Escalate early and without apology. Pulling in another team or a senior engineer costs them some time; failing to costs customers the duration of the outage.

- **The cause seems to be in another team's system.** Page them; don't debug their service for them.
- **There's no progress after a set time,** 30 minutes for a SEV1 is a reasonable default.
- **The blast radius is growing,** or the incident touches security, data or money, which brings in security and legal.
- **A decision is above the responders' authority:** taking a feature offline, a customer-wide notification, an emergency spend.

## Closing the Incident

An incident ends when impact ends and the system is stable, not when the fix is perfect.

1. The IC declares it resolved and posts a final status update.
2. Mitigations that are still in place (a disabled feature, an extra replica, a blocked client) are listed with owners, so a temporary fix doesn't become permanent by accident.
3. A postmortem owner is named and the draft is due within two business days (see [Incident Postmortems](/docs/operations/incident-response)). The timeline from the channel becomes its spine.

The pager rotation, escalation paths and runbooks that make all of this possible live in [On-Call & Runbooks](/docs/operations/on-call).

## References

**Reference**

- [FEMA: ICS Resource Center](https://training.fema.gov/emiweb/is/icsresource/), the Incident Command System the role structure descends from

**In practice**

- [Google SRE Book: Managing Incidents](https://sre.google/sre-book/managing-incidents/), the commander, operations, communication and planning roles, criteria for declaring, and explicit handoffs
- [Google SRE Workbook: Incident Response](https://sre.google/workbook/incident-response/), incident command applied in practice
- [PagerDuty Incident Response](https://response.pagerduty.com/), commander, deputy, scribe, subject matter expert and liaison roles
- [Atlassian: Incident communication](https://www.atlassian.com/incident-management/incident-communication), status pages and customer updates during incidents
