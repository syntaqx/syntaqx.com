+++
title = "Backlogs"
description = "One backlog for features, bugs and tech debt, sized to what the team can build, with stale items closed on a schedule and important ideas left to come back."
category = "Product"
order = 1022
tags = ["product", "backlog", "planning", "prioritization"]
+++

A backlog is a queue, and queues obey arithmetic. Most backlogs are far longer than the team will ever get through, which turns them from a plan into a list of things you've decided not to build without saying so. Shape Up puts it bluntly: "Backlogs are a big weight we don't need to carry", and "The growing pile gives us a feeling like we're always behind even though we're not" ([Bets, Not Backlogs](https://basecamp.com/shapeup/2.1-chapter-07)).

## The Economics

[Little's Law](https://projectproduction.org/journal/reprint-littles-law-as-viewed-on-its-50th-anniversary/) relates the three numbers that matter: the average number of items in a system equals the rate they arrive times how long each one waits. Turned around, the average wait is the queue length divided by throughput. It "holds under remarkably general conditions", which includes a ticket tracker.

So do the division. A team that finishes 20 items a month, with 1,000 in the backlog, has a 50-month wait, assuming nothing new ever arrives. Something always arrives. Item 900 isn't "later", it's never, and everyone involved already knows it. The backlog just doesn't say so.

My default: **keep the backlog to about two quarters of the team's throughput.** Anything that can't plausibly start in that window doesn't belong on the list. That isn't a judgment on the idea. It's an honest statement of what the team is going to build.

## One Backlog, Three Kinds of Work

Features, bugs and tech debt live in the same system, typed so each can be filtered and counted, and held to the same hygiene rules. Splitting them into separate trackers hides the trade-off between them, which is the one decision planning exists to make.

They're funded differently, though:

- **Features and bugs** are prioritized against each other by whoever owns the product area. A bug is behavior that's wrong; [Defects & Triage](/docs/quality/defects#bugs-versus-tech-debt) covers severity, priority and the line between a bug and debt.
- **Tech debt and engineering improvements** come out of engineering's standing share of capacity ([Roadmaps & Capacity](/docs/product/roadmaps)), so they never have to win a vote against a feature with a sponsor.

## Stale, Then Closed

An item nobody has touched in months has been decided against. Closing it makes the decision visible.

My default: **an item untouched for 90 days gets a stale label and a comment, and closes 14 days later** unless someone gives a reason to keep it. The same rule [Defects & Triage](/docs/quality/defects#keep-the-backlog-honest) uses for bugs applies to features and debt. GitHub's [stale action](https://github.com/actions/stale) "Warns and then closes issues and PRs that have had no activity for a specified amount of time"; its defaults are 60 days to stale and 7 to close, and every tracker has an equivalent.

- **Exempt what's committed.** Items on the current roadmap, S1 and S2 bugs, and debt with incidents linked as its interest don't go stale, because someone is already accountable for them.
- **Close with a reason.** "Not building this in the next two quarters" is an honest status. A closed item keeps its history, its links and every customer who asked for it.
- **Closing isn't deleting.** Nothing is lost. It's just no longer pretending to be next.

## Important Ideas Come Back

The fear behind every thousand-item backlog is losing the one good idea. It doesn't happen. Shape Up again: "Really important ideas will come back to you", and "If you hear it once and never again, maybe it wasn't really a problem."

When something does come back, open it fresh, with the current evidence, and link the closed item so its history and its count of requests carry over. The new ticket is worth more than the old one: it describes the product as it is now, and the fact that it came back is itself the evidence it was missing.

Teams can still keep their own lists without a central pile. Shape Up's version: "Support can keep a list of requests or issues that come up more often than others", and "Programmers maintain a list of bugs they'd like to fix when they have some time." What changes is that none of those lists is a promise.

## Grooming Isn't Progress

"The time spent constantly reviewing, grooming and organizing old ideas prevents everyone from moving forward on the timely projects that really matter right now." Refine only the top of the backlog, the next cycle or two. Estimating item 400 is effort spent on something that will never start.

## Cheap Code Doesn't Make a Backlog Cheap

Coding agents can type through a backlog faster than any team. That's the danger, not the fix. Code got cheaper to write; it didn't get cheaper to own. Every item an agent closes by building it is a feature someone maintains, secures, migrates and supports from then on, and the slow pace that used to filter out half-formed ideas is gone. Each item still has to trace back to a real [problem statement](/docs/product/problem-statements) before it's built, by anyone.

## References

- [Bets, Not Backlogs](https://basecamp.com/shapeup/2.1-chapter-07), Shape Up (Basecamp)
- [Little's Law as Viewed on Its 50th Anniversary](https://projectproduction.org/journal/reprint-littles-law-as-viewed-on-its-50th-anniversary/), John D. C. Little, Operations Research 59(3), 2011 (reprint)
- [actions/stale](https://github.com/actions/stale), GitHub
