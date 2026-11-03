+++
title = "Roadmaps & Capacity"
description = "Roadmaps that commit to problems and outcomes, not dated feature lists, with a fixed share of capacity engineering spends on debt, upgrades and improvements."
category = "Product"
order = 1003
tags = ["product", "roadmap", "planning", "tech-debt"]
+++

Most companies get this wrong the same way. The roadmap is a list of features with dates, every feature has a sponsor, and everything that keeps the product healthy (upgrades, debt, faster builds, the improvements a team spots while building) has to win a vote against them. It never wins, so it never happens, and two years later every change takes three times as long and nobody can say when that started.

The fix is structural: commit to problems instead of features, and give engineering a fixed share of capacity off the top, before anyone argues about features.

## Commit to Problems, Not Features

A roadmap is a statement of intent, and its job is alignment: everyone knows which problems the team is working on now, which come next, and which are on the horizon. A dated list of features does that badly, because it commits to solutions before anyone has learned enough to pick them, and it turns every change of plan into a missed promise.

- **Rows are problems.** Each one points at a [problem statement](/docs/product/problem-statements): who has it, what better looks like, and how much it's worth.
- **Now, next, later.** Detail drops off with distance. "Now" is shaped and committed. "Later" is a direction, and it's allowed to change.
- **Appetite, not estimate.** Shape Up's framing is the useful one: decide how much time a problem deserves, then shape a solution to fit it, "fixed time, variable scope" ([Set Boundaries](https://basecamp.com/shapeup/1.2-chapter-03)). A date is the boundary, and the scope is what moves.
- **Dates only where something real needs them.** A contract, a regulation, a conference, a partner launch. Those go on the roadmap as dates, and everything else doesn't.

## Engineering Gets a Share Off the Top

Marty Cagan described the deal in 2007: "Product management takes 20% of the capacity right off the top and gives this to engineering to spend as they see fit", for what eBay called headroom, "to avoid slamming your head into ceilings" ([Engineering Wants to Rewrite!](https://www.svpg.com/engineering-wants-to-rewrite/)). He was firm about the floor: "I get nervous when I find teams that think they can get away with much less than 20%", and "If you're in really bad shape today, you might need to make this 30% or even more."

It isn't an unusual idea. Google's SRE teams cap operational work at half of each engineer's time: "At least 50% of each SRE's time should be spent on engineering project work that will either reduce future toil or add service features" ([Eliminating Toil](https://sre.google/sre-book/eliminating-toil/)). Shape Up builds slack into the calendar instead: "after each six-week cycle, we schedule two weeks for cool-down", which teams "use to fix bugs, explore new ideas, or try out new technical possibilities" ([The Betting Table](https://basecamp.com/shapeup/2.2-chapter-08)).

My default: **at least 20% of every team's capacity, every cycle, engineering's to spend.** It's the same budget [Tech Debt](/docs/engineering/tech-debt#budget-for-it-continuously) draws on. Three rules keep it real:

- **It's set once, not negotiated each cycle.** A share that's argued about every planning meeting loses to every feature, because the features have sponsors and the headroom doesn't.
- **Engineering chooses what it buys.** The people who feel the friction know where it is.
- **It's spent, not banked.** Unused headroom doesn't roll into feature work, and a "cleanup sprint" next quarter doesn't count.

## What the Share Is For

| Spend it on | Not on |
| --- | --- |
| Paying down [tech debt](/docs/engineering/tech-debt) with known interest | Features product didn't prioritize, relabeled as engineering work |
| [Dependency and runtime upgrades](/docs/engineering/dependencies), before they're emergencies | Bugs: those are prioritized against features ([Backlogs](/docs/product/backlogs#one-backlog-three-kinds-of-work)) |
| Faster builds, tests and deploys | Gold-plating something that already works |
| Reliability work from [postmortems](/docs/operations/incident-response) | Rewrites with no stated problem |
| Improvements spotted while building something else | |
| Prototypes and spikes that test a technical idea | |

The fifth row is the one most often lost. Teams learn things while they build: a slow query, a confusing flow, a seam that would make the next feature half the work. Without a standing share, each of those becomes a ticket that never wins. With one, the team can just do it.

## Leave Room Inside the Work, Too

The share covers work engineering starts. The work product starts needs room as well, because nobody knows everything at planning time. Keep scope variable inside each commitment: the problem and the appetite are fixed, the list of what ships is not. When the team finds a better solution halfway through, that's the plan working, not the plan slipping.

## Make the Share Visible

A budget nobody can see gets cut first. Put the engineering share on the roadmap as its own lane, and report what it bought each cycle in the same terms as everything else: the upgrade that's done, the build that's faster, the incident class that stopped recurring. "Engineering time" that can't show results will get taken back, and should.

## References

- [Engineering Wants to Rewrite!](https://www.svpg.com/engineering-wants-to-rewrite/), Marty Cagan, SVPG (2007)
- [Eliminating Toil](https://sre.google/sre-book/eliminating-toil/), Site Reliability Engineering (Google)
- [The Betting Table](https://basecamp.com/shapeup/2.2-chapter-08), Shape Up (Basecamp): cycles and cool-down
- [Set Boundaries](https://basecamp.com/shapeup/1.2-chapter-03), Shape Up: appetite and fixed time, variable scope
