+++
title = "Incident Postmortems"
description = "Blameless postmortems: when to write one, the template, how to find contributing factors instead of a culprit, and making sure action items get done."
category = "Engineering Practice"
order = 12.5
tags = ["process", "incidents", "reliability", "postmortems"]
aliases = ["postmortems"]
+++

Incidents are expensive. A postmortem is how you get something back for the cost: a shared understanding of what happened, and changes that make it less likely, or less bad, next time.

## When to Write One

- Any customer-visible outage or degradation past the SLO.
- Any incorrect money movement, of any size: a double charge, a missed payout, a ledger imbalance.
- Any security or data exposure.
- Any near miss that would have been one of the above with slightly worse luck.

Near misses are the cheapest incidents you'll ever get: all of the lesson, none of the impact. Skipping them because "nothing happened" throws away the warning before the real one.

Draft within 2 business days, while people still remember why they did what they did; a week later they remember what they did, and the reasons have been rewritten by hindsight. Review within a week.

## Blameless, Not Accountability-Free

Blame doesn't make systems safer; it makes people quieter. If the person who ran the bad command expects to be punished, they'll explain less, and the next postmortem gets a tidier story with less of the truth in it. The information you need to fix the system lives in the heads of the people closest to the failure, so the process has to make it safe to share.

The working assumption is that people made reasonable decisions with the information they had, an idea the [Google SRE book](https://sre.google/sre-book/postmortem-culture/) puts at the center of postmortem culture. If a person could take the system down by running one command, the problem is that the command existed, not the person who ran it.

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

Timelines are in UTC per [Time & Date Formats](/docs/fundamentals/time), built from logs and alerts (see [Observability](/docs/operations/observability)), not memory.

## Contributing Factors, Not a Root Cause

"Root cause" implies there's one, and the search ends as soon as something plausible turns up, usually the last thing that changed. Real incidents in complex systems almost never work that way: the deploy was the trigger, but it only hurt because an alert was missing, the runbook was stale, and a retry policy turned one failure into a flood. As [Richard Cook](https://how.complexsystems.fail/) put it, failure takes multiple contributors at once. So instead of stopping at the first "why", look at every layer:

- **Trigger:** what changed (a deploy, traffic, a dependency, a config).
- **Detection:** why it took as long as it did to notice.
- **Response:** what slowed down diagnosis or mitigation.
- **Blast radius:** why it affected as much as it did.

Each layer usually produces at least one action item. Fixing only the trigger leaves the next, different trigger just as dangerous.

## Action Items That Get Done

A postmortem whose action items never ship is a ritual. The same incident comes back, and the second postmortem is a copy of the first. Most of what goes wrong here is vagueness and lack of ownership, so the rules target both:

- **Each one is specific and owned.** "Improve monitoring" isn't an action item. "Alert when authorization rate drops 10 points below the 7-day baseline for 5 minutes" is.
- **Tagged by type:** prevent, detect, mitigate, or process. A good postmortem has a mix.
- **Tracked in the normal backlog** with due dates, and reviewed until closed.
- **Prefer mechanisms over intentions.** A guardrail in the deploy pipeline beats "be more careful". Intentions fade by the next sprint; a check that fails the build works on the worst day of the newest hire.

## Sharing

Postmortems are shared widely by default. Other teams learn more from your incident than from their own docs, because an incident is a design assumption that turned out to be false, and their systems probably make the same one. Hiding postmortems also signals that incidents are shameful, which undoes the blameless part. For payment incidents, the impact section also feeds customer communication and any required reporting to partners.

## References

**In practice**

- [Google SRE Book: Postmortem Culture](https://sre.google/sre-book/postmortem-culture/), blameless postmortems and when to write one
- [PagerDuty: Postmortem Documentation](https://postmortems.pagerduty.com/), template, timeline and action items
- [Atlassian: Blameless Postmortems](https://www.atlassian.com/incident-management/postmortem/blameless), blameless without being accountability-free
- [Richard Cook: How Complex Systems Fail](https://how.complexsystems.fail/), why incidents have contributing factors, not a single root cause
