+++
title = "Incidents & Postmortems"
description = "Running an incident: declare early, a commander who doesn't debug, mitigate before diagnosing, update on a clock, then a blameless postmortem that sticks."
category = "Operations"
order = 1205
tags = ["incidents", "operations", "on-call", "reliability", "postmortems"]
aliases = ["engineering/postmortems", "postmortems"]
+++

An incident is the worst time to invent a process. Left alone, every engineer's instinct to start debugging produces the classic failure: five people on the same graph, two of them changing production at once, nobody telling customers anything, and an hour later nobody can say who decided what. Incident response is the small amount of structure that prevents that, and the postmortem afterwards is how you get something back for the cost.

## Declare Early

The most expensive incidents are the ones nobody declared: an engineer pokes at a "blip" alone, and forty minutes later it's customer-visible, three teams are involved, and the response starts from zero with no timeline. Declaring is cheap: it opens a channel, pages a commander and starts a timeline, and if it's nothing you close it in five minutes.

Google's SRE teams declare if fixing it needs a second team, it's visible to customers, or it's unsolved after an hour of focused work. The [SRE book](https://sre.google/sre-book/managing-incidents/) puts the bias plainly: better to declare early and stand down than to start hours into a worsening problem. Nobody gets criticized for declaring an incident that turned out minor.

## Severity Levels

Severity decides who gets woken up and how fast you communicate, so whoever is on call has to be able to decide it in seconds. That means criteria about impact, not cause:

| Severity | Criteria | Response |
| -------- | -------- | -------- |
| **SEV1** | Core flow down for many customers (can't log in, can't pay), data loss or exposure, or money moving incorrectly | Page the commander and owning teams now; status page within 15 minutes; updates every 30 minutes |
| **SEV2** | A major feature degraded, a subset of customers fully blocked, or an [SLO](/docs/operations/slos) burning fast | Commander assigned; status page if customers can see it; updates hourly |
| **SEV3** | Minor degradation with a workaround, or internal-only impact | Owning team handles it in business hours; tracked like an incident |

When unsure, pick the higher one; downgrading is free. Anything touching money or personal data starts at SEV1 until proven otherwise: a double charge for ten customers matters more than its count suggests ([Payment States & Ledgers](/docs/payments/payment-states)).

## Roles

The industry's structure descends from the [Incident Command System](https://training.fema.gov/emiweb/is/icsresource/) US emergency services built for wildfires: one person commands, others execute. Google's incident management is [based on it](https://sre.google/sre-book/managing-incidents/), as is [PagerDuty's public guide](https://response.pagerduty.com/).

| Role | Owns | Doesn't |
| ---- | ---- | ------- |
| **Incident commander (IC)** | The overall picture, decisions, assigning work, the timeline | Debug or change production |
| **Operations lead** | Investigating and mitigating; the only one changing the system | Talk to customers or executives |
| **Communications lead** | Status page, customer and internal updates, on a clock | Investigate |
| **Subject matter experts** | Answers about their system, when asked | Freelance changes |

**The commander doesn't debug,** the rule people break most and regret most. The moment the IC chases a theory, nobody is tracking the others or deciding whether to roll back. On a small team one person may hold several roles; say out loud which one you're doing now.

**Only the operations lead changes production;** two people "trying something" at once is how a mitigation gets undone and the postmortem can't say what helped. **Handoffs are explicit:** the outgoing IC briefs the incoming one live, gets an acknowledgment and announces it, because a silent handoff leaves two people who each think the other is in charge.

## Mitigate First, Diagnose Later

The goal during an incident is to stop the impact, not to understand it. Understanding can wait.

- **Roll back first if a deploy is plausibly involved.** A rollback is fast, practiced and reversible ([Deployment Strategies](/docs/delivery/deployment-strategies)); proving the deploy was the cause takes longer than undoing it.
- **Use the switches you built for this:** kill-switch [feature flags](/docs/delivery/feature-flags), shedding load, failing over, blocking an abusive client.
- **Keep evidence cheaply:** note the time and action, grab logs if it's quick, then act.

If confirming a theory takes thirty minutes and rolling back takes two, roll back. If it didn't help, you've lost two minutes and learned something.

## One Channel, One Timeline

- **One incident channel** for all coordination. Direct messages are invisible to the IC and the postmortem.
- **A running timeline** of what was observed, decided and changed, in UTC ([Time & Date Formats](/docs/fundamentals/time)). The IC owns it; a scribe can keep it. It's the only shared picture of what's going on, and later the postmortem's spine.
- **A pinned summary:** current impact, hypothesis, actions, who holds which role, and when the next update is due. Anyone joining reads that, not three hundred messages.

## Communicate on a Clock

Silence reads as "they don't know" or "they don't care", and both cost more trust than the outage. Post the first update fast, even if it only says "we're investigating elevated errors on checkout". Give every update a next-update time and keep it even when nothing changed: "no change; next update at 14:30 UTC" is a real update. Write for the reader: customers need impact and workaround, executives need exposure and expected duration, nobody outside needs your connection-pool hypothesis. The communications lead writes them, so the people fixing the problem aren't interrupted.

## Escalate Early

Escalation costs another team some time; not escalating costs customers the outage. Page the owners when the cause looks like their system, rather than debugging it for them. Escalate when there's no progress after a set time (30 minutes for a SEV1), when the blast radius grows or touches security, data or money, and when a decision is above the responders' authority, like taking a feature offline.

## Closing

An incident ends when impact ends, not when the fix is perfect. The IC posts a final update, lists mitigations still in place (a disabled feature, a blocked client) with owners so they don't become permanent by accident, and names a postmortem owner.

## The Postmortem

Write one for any customer-visible outage or degradation past the SLO, any incorrect money movement, any security or data exposure, and any near miss that would have been one of those with worse luck: all of the lesson, none of the impact.

Draft within two business days, while people still remember *why* they did what they did; hindsight rewrites the reasons within a week. Share widely by default: an incident is a design assumption that turned out false, and other teams' systems probably make the same one.

```markdown
# Title: one line describing the impact

Status, authors, incident date, severity.

## Summary
Three or four sentences: what broke, who was affected, for how long, how it was fixed.

## Impact
Customers and requests affected, money affected (amounts and currencies),
duration, SLO budget consumed. Numbers, not adjectives.

## Timeline (UTC)
14:02 Deploy 4812 begins
14:06 Authorization rate drops from 94% to 61% (alert fires at 14:09)
14:31 Rollback complete, authorization rate recovers

## Contributing Factors
What combined to cause this, and why our defenses didn't catch it sooner.

## What Went Well
Detection, tooling, people. Keep doing these.

## Action Items
| Action | Type | Owner | Due |
```

The timeline comes from the incident channel, logs and alerts ([Observability](/docs/operations/observability)), not memory.

### Blameless, Not Accountability-Free

Blame doesn't make systems safer; it makes people quieter, and the next postmortem gets a tidier story with less truth in it. The working assumption, central to [Google's postmortem culture](https://sre.google/sre-book/postmortem-culture/), is that people made reasonable decisions with the information they had. If one command could take the system down, the problem is that the command existed.

Describe actions, not character: "the deploy ran without the migration step", not "Alex forgot the migration". Owners are still accountable for action items; blameless is about causes, not follow-through.

### Contributing Factors, Not a Root Cause

"Root cause" implies there's one, and the search stops at the first plausible answer, usually the last thing that changed. As [Richard Cook](https://how.complexsystems.fail/) put it, failure in complex systems takes multiple contributors at once: the deploy was the trigger, but it only hurt because an alert was missing, the runbook was stale and a retry policy turned one failure into a flood. So look at every layer: the **trigger** (what changed), **detection** (why it took that long to notice), **response** (what slowed mitigation) and **blast radius** (why it affected as much as it did). Fixing only the trigger leaves the next one just as dangerous.

### Action Items That Get Done

A postmortem whose action items never ship is a ritual.

- **Specific and owned.** "Improve monitoring" isn't an action item. "Alert when authorization rate drops 10 points below the 7-day baseline for 5 minutes" is.
- **Tagged by type:** prevent, detect, mitigate or process. A good postmortem has a mix.
- **Tracked in the normal backlog** with due dates, reviewed until closed.
- **Mechanisms over intentions.** A check that fails the build works on the newest hire's worst day; "be more careful" fades by the next sprint.

The rotation, escalation paths and runbooks that make all of this possible live in [On-Call & Runbooks](/docs/operations/on-call).

## References

**Reference**

- [FEMA: ICS Resource Center](https://training.fema.gov/emiweb/is/icsresource/), the Incident Command System the role structure descends from

**In practice**

- [Google SRE Book: Managing Incidents](https://sre.google/sre-book/managing-incidents/), the commander, operations and communication roles, criteria for declaring, and explicit handoffs
- [Google SRE Workbook: Incident Response](https://sre.google/workbook/incident-response/), incident command applied in practice
- [Google SRE Book: Postmortem Culture](https://sre.google/sre-book/postmortem-culture/), blameless postmortems and when to write one
- [PagerDuty Incident Response](https://response.pagerduty.com/), commander, scribe, subject matter expert and liaison roles
- [PagerDuty: Postmortem Documentation](https://postmortems.pagerduty.com/), template, timeline and action items
- [Atlassian: Incident communication](https://www.atlassian.com/incident-management/incident-communication), status pages and customer updates during incidents
- [Richard Cook: How Complex Systems Fail](https://how.complexsystems.fail/), why incidents have contributing factors, not a single root cause
