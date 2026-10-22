+++
title = "On-Call & Runbooks"
description = "A sustainable on-call rotation: severity levels, escalation, handoffs, a runbook template for every alert, and budgeting time to drive toil down."
category = "Operations"
order = 5.9
tags = ["operations", "on-call", "incidents", "runbooks"]
aliases = ["on-call"]
+++

On-call exists so customers get help fast. It only works long term if it's sustainable for the people carrying the pager: few pages, every page actionable, and time set aside to make next week quieter than this one.

## Rotations

- **The team that ships the service carries its pager.** Ownership and on-call are the same thing. A team that gets paged for its own bugs fixes them; a team that hands the pager to someone else ships them.
- **One-week shifts,** primary and secondary, handed off on a weekday morning, never on a Friday evening. A week is long enough to build context on what's been flaky, short enough to recover from.
- **Enough people to make it sustainable.** For a round-the-clock rotation at one site, that's about eight engineers; with two sites in different time zones splitting the day, about six per site. Fewer than that and each person is on call too often to recover between shifts, and burned-out on-call engineers make slow, bad decisions at exactly the wrong time. The [Google SRE Book](https://sre.google/sre-book/being-on-call/) arrives at the same numbers.
- **Follow the sun when you can.** Nights are the exception, not the job.
- **On-call is the shift's main work.** Feature work is a bonus. The rest of the shift goes to toil reduction and alert hygiene.

## Severity Levels

| Severity | Definition | Response |
| -------- | ---------- | -------- |
| SEV1 | Critical journey down, money moving incorrectly, or data exposed | Page immediately, incident commander, status page, all hands as needed |
| SEV2 | Major degradation, or an [SLO](/docs/operations/slos) burning fast | Page, fix during the shift |
| SEV3 | Minor or contained impact | Ticket, fix within the week |

Declare early and downgrade later. A SEV1 that turns out to be a SEV3 costs an hour of a few people's time. A SEV3 that was really a SEV1 costs customers, and the hours lost before anyone realized it are the hardest to explain afterward.

## During an Incident

- **One incident commander.** They coordinate and decide; they don't debug. Everyone else works the problem. The person deepest in the logs is the worst person to also track who's doing what, what's been tried, and when to update customers.
- **Mitigate first, diagnose later.** Roll back, fail over, flip the [kill switch](/docs/engineering/feature-flags). Understanding why can wait until customers are fine. Root-causing a live outage feels productive, but every minute of it is a minute of impact a rollback would have ended.
- **One channel, one timeline.** Decisions and actions go in the incident channel with timestamps. It becomes the [postmortem](/docs/engineering/postmortems) timeline.
- **Communicate on a schedule.** Status updates every 30 minutes for SEV1, even when the update is "still investigating".

## Escalation

- Primary acknowledges within **5 minutes** for a page. No acknowledgement escalates to secondary automatically, then to the engineering manager.
- **Escalating is never a failure.** Pulling in the database owner at 3am is cheaper than guessing for two hours.
- Every service lists who to escalate to, in the runbook, not in someone's memory.

## Handoffs

Every shift ends with a short written handoff:

```markdown
## Handoff 2026-10-19 to 2026-10-26

Pages: 3 (2 actionable, 1 noisy: see ticket)
Open incidents: none
Ongoing: payments-db replica lag alerts after Tuesday's index build, watching
Changes to know about: processor failover flag is ON for EU traffic
Toil worth fixing: manual webhook redelivery for disabled endpoints
```

## Runbooks

Every alert links to a runbook. An alert without one doesn't get to page anyone.

```markdown
# Alert: PaymentsAuthorizationBurnRateHigh

## What it means
Authorization failures are spending the 30-day error budget at 14.4x or more.

## Impact
Customers can't pay. Merchants see failed checkouts.

## Triage
1. Check the authorization rate dashboard by processor and card brand.
2. One processor? Check its status page, then step 1 of Mitigation.
3. All processors? Check the most recent deploy and roll it back.

## Mitigation
1. Fail over the affected processor: flip the `processor-failover` flag.
2. ...

## Escalation
Payments team secondary, then the processor's support line (in the vendor doc).
```

Runbooks are kept next to the code, reviewed in pull requests, and updated after every incident that found them wrong or missing.

## Toil

Toil is manual, repetitive, automatable work that grows with the system and leaves nothing behind. It's dangerous because it scales with traffic while the team doesn't: left alone, it eventually consumes all the time that would have gone into making it go away. Google's SRE teams cap it at [50% of an engineer's time](https://sre.google/sre-book/eliminating-toil/), and that's a ceiling, not a target.

- **Track it.** Every manual intervention on shift gets a tally in the handoff.
- **Fix the top item every rotation.** Automate it, or make the alert that caused it go away.
- **Delete noisy alerts.** An alert that's acknowledged and ignored twice gets fixed or removed.

## References

**In practice**

- [Google SRE Book: Being On-Call](https://sre.google/sre-book/being-on-call/), rotation size and load
- [Google SRE Workbook: On-Call](https://sre.google/workbook/on-call/), handoffs and sustainable rotations
- [Google SRE Book: Managing Incidents](https://sre.google/sre-book/managing-incidents/), incident roles
- [Google SRE Workbook: Incident Response](https://sre.google/workbook/incident-response/), running an incident
- [Google SRE Book: Eliminating Toil](https://sre.google/sre-book/eliminating-toil/), the 50% toil cap
- [PagerDuty: Incident Response Documentation](https://response.pagerduty.com/), severity levels and the incident commander role
