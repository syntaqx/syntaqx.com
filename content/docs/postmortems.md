+++
title = "Incident Postmortems"
description = "Blameless postmortems: when to write one, the template, how to find contributing factors instead of a culprit, and making sure action items get done."
category = "Engineering Practice"
order = 12.5
tags = ["process", "incidents", "reliability", "postmortems"]
+++

Incidents are expensive. A postmortem is how you get something back for the cost: a shared understanding of what happened, and changes that make it less likely, or less bad, next time.

## When to Write One

- Any customer-visible outage or degradation past the SLO.
- Any incorrect money movement, of any size: a double charge, a missed payout, a ledger imbalance.
- Any security or data exposure.
- Any near miss that would have been one of the above with slightly worse luck.

Draft within 2 business days, while memory is fresh. Review within a week.

## Blameless, Not Accountability-Free

People make reasonable decisions with the information they have. If a person could take the system down by running one command, the problem is that the command existed, not the person who ran it.

- Describe actions, not character. "The deploy was run without the migration step", not "Alex forgot the migration".
- Ask "what made this the reasonable thing to do at the time?"
- Owners are still accountable for **action items**. Blameless is about causes, not about follow-through.

## Template

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
14:11 On-call acknowledges, ...
14:31 Rollback complete, authorization rate recovers

## Contributing Factors
What combined to cause this, and why our defenses didn't catch it sooner.

## What Went Well
Detection, tooling, people. Keep doing these.

## Action Items
| Action | Type | Owner | Due |
```

Timelines are in UTC per [Time & Date Formats](/docs/time), built from logs and alerts (see [Observability](/docs/observability)), not memory.

## Contributing Factors, Not a Root Cause

Real incidents rarely have one cause. Instead of stopping at the first "why", look at every layer:

- **Trigger:** what changed (a deploy, traffic, a dependency, a config).
- **Detection:** why it took as long as it did to notice.
- **Response:** what slowed down diagnosis or mitigation.
- **Blast radius:** why it affected as much as it did.

Each layer usually produces at least one action item. Fixing only the trigger leaves the next, different trigger just as dangerous.

## Action Items That Get Done

- **Each one is specific and owned.** "Improve monitoring" isn't an action item. "Alert when authorization rate drops 10 points below the 7-day baseline for 5 minutes" is.
- **Tagged by type:** prevent, detect, mitigate, or process. A good postmortem has a mix.
- **Tracked in the normal backlog** with due dates, and reviewed until closed.
- **Prefer mechanisms over intentions.** A guardrail in the deploy pipeline beats "be more careful".

## Sharing

Postmortems are shared widely by default. Other teams learn more from your incident than from their own docs. For payment incidents, the impact section also feeds customer communication and any required reporting to partners.
