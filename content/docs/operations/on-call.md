+++
title = "On-Call & Runbooks"
description = "A sustainable on-call rotation: who carries the pager, paging and escalation, written handoffs, a runbook for every alert, and time budgeted to drive toil down."
category = "Operations"
order = 1204
tags = ["operations", "on-call", "incidents", "runbooks"]
aliases = ["on-call"]
+++

Every alert from [Observability](/docs/observability/overview) and every fast [SLO](/docs/operations/slos) burn ends at a person. On-call exists so customers get help fast, and it only lasts if it's sustainable for the people carrying the pager: few pages, every page actionable, and time set aside to make next week quieter than this one.

## Rotations

- **The team that ships the service carries its pager.** A team paged for its own bugs fixes them; a team that hands the pager to someone else ships them.
- **One-week shifts,** primary and secondary, handed off on a weekday morning, never on a Friday evening. A week is long enough to build context on what's been flaky, short enough to recover from.
- **Enough people.** Around the clock at one site takes about eight engineers; two sites splitting the day by time zone, about six each, the numbers the [Google SRE Book](https://sre.google/sre-book/being-on-call/) arrives at. Fewer, and people are on call too often to recover, and tired engineers make slow, bad decisions at exactly the wrong time.
- **Follow the sun when you can.** Nights are the exception, not the job.
- **On-call is the shift's main work.** Feature work is a bonus; the rest goes to toil and alert hygiene.

## Paging and Escalation

Severity levels, incident roles and how an incident is run live in [Incidents & Postmortems](/docs/operations/incident-response); on-call is how the right person gets there.

- **Primary acknowledges a page within 5 minutes.** No acknowledgement escalates automatically to secondary, then to the engineering manager.
- **Escalating is never a failure.** Pulling in the database owner at 3am is cheaper than guessing for two hours.
- **Every service's runbook says who to escalate to,** not someone's memory.
- **Count the pages.** A rotation that pages more than it can act on stops reading pages; [Alert Fatigue](/docs/observability/dashboards-and-alerts#alert-fatigue) has the measures.

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

Toil is manual, repetitive, automatable work that grows with the system and leaves nothing behind. It scales with traffic while the team doesn't, so left alone it consumes the time that would have made it go away. Google's SRE teams cap it at [50% of an engineer's time](https://sre.google/sre-book/eliminating-toil/), and that's a ceiling, not a target.

- **Track it.** Every manual intervention on shift gets a tally in the handoff.
- **Fix the top item every rotation.** Automate it, or make the alert that caused it go away.
- **Delete noisy alerts.** An alert that's acknowledged and ignored twice gets fixed or removed.

## References

**In practice**

- [Google SRE Book: Being On-Call](https://sre.google/sre-book/being-on-call/), rotation size and load
- [Google SRE Workbook: On-Call](https://sre.google/workbook/on-call/), handoffs and sustainable rotations
- [Google SRE Book: Eliminating Toil](https://sre.google/sre-book/eliminating-toil/), the 50% toil cap
