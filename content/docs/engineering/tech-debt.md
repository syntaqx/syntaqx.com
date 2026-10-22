+++
title = "Tech Debt"
description = "Treat tech debt like a loan: know which kind you took on, track the interest you pay, budget a steady share to repay it, and modernize with strangler figs."
category = "Engineering Practice"
order = 12.7
tags = ["tech-debt", "process", "architecture", "planning"]
+++

Tech debt isn't a moral failing. It's a loan: you ship sooner now and pay interest later, in slower changes, more incidents and harder onboarding. Taking a loan on purpose is often the right call. Not knowing you have one is the problem.

## Know Which Kind You Have

Martin Fowler's [technical debt quadrant](https://martinfowler.com/bliki/TechnicalDebtQuadrant.html) splits debt by two questions: did you take it on deliberately, and was it prudent?

| | Reckless | Prudent |
| --- | --- | --- |
| **Deliberate** | Skipping design because there's "no time" | Shipping now, knowing the cost, with a plan to pay it back |
| **Inadvertent** | Not knowing good design in the first place | Learning, after building it, how it should have been built |

- **Deliberate and prudent** is a business decision. Record it, with what it'll take to pay back. An [ADR](/docs/engineering/design-docs) is the right place.
- **Inadvertent and prudent** is inevitable. You learn the domain by building in it. Pay it down as understanding improves.
- **Reckless** debt in either row is a process problem. Fix the process (reviews, design docs, mentoring), not just the code.

## Make It Visible

Debt nobody can see doesn't get prioritized. Every known piece is a tracked item in the normal backlog, and each one says what the interest is:

- **Incidents** it caused or made worse, linked from the [postmortem](/docs/engineering/postmortems).
- **Slower delivery:** "every change to billing takes three extra days because of X."
- **Risk:** an unsupported runtime, a dependency with no maintainer, a single point of failure.

Debt described as interest gets prioritized against features. Debt described as "the code is ugly" doesn't, and shouldn't.

## Budget for It Continuously

Reserve a steady share of every team's capacity for paying down debt and keeping things current, around 20%, and spend it every cycle.

- **Not debt sprints.** A quarterly "cleanup sprint" lets interest compound for three months, then gets cancelled the first time a deadline slips.
- **The team chooses** what to spend it on. They know where the interest hurts.
- **Upgrades come out of this budget,** before they become emergencies. See [Staying Current](/docs/delivery/staying-current).

## Pay It Down Where You're Working

The cheapest time to fix a piece of code is when you're already changing it: the context is loaded, the tests are running, and the reviewer is already looking. Leave the code a little better than you found it.

- **Refactor in its own commit** within the pull request, so the behavior change stays reviewable. See [Commits, PRs & Code Review](/docs/engineering/commits-and-reviews).
- **Don't go wandering.** Improve what you touch; a drive-by rewrite of an unrelated module belongs in its own change.

## When to Stop and Pay

Some debt can't wait for the budget:

- It's **blocking a priority:** the feature can't be built safely on the current design.
- It's **causing incidents:** the same root cause shows up in postmortems twice.
- It's a **security or support deadline:** an end-of-life runtime, a vulnerable dependency with no patch.

At that point it becomes the priority, planned and staffed like any other project.

## Rewrite or Strangle

Big rewrites are the riskiest way to repay debt. They stop delivery for months, rebuild years of edge cases from memory, and ship all at once.

Prefer the **[strangler fig](https://martinfowler.com/bliki/StranglerFigApplication.html):** build the replacement beside the old system, route one capability at a time to it, and delete the old code as each piece moves. Every step ships, every step can be rolled back, and the work can pause without leaving anything half-done. The same idea works at every scale, from a service down to a module, and it's how [Zero-Downtime Migrations](/docs/database/zero-downtime-migrations) handle schemas.

## Deprecate With Dates

Removing something is how debt actually goes away, and removals need the same care as APIs:

- **Announce it with a date,** and the replacement.
- **Measure who still uses it,** and tell them directly.
- **Delete it on the date.** A deprecation without a removal date is just a comment.

See [Versioning & Deprecation](/docs/operations/versioning) for the public-API version of this.

## References

**In practice**

- [Martin Fowler: Technical Debt](https://martinfowler.com/bliki/TechnicalDebt.html), the debt metaphor and interest payments
- [Martin Fowler: Technical Debt Quadrant](https://martinfowler.com/bliki/TechnicalDebtQuadrant.html), deliberate vs inadvertent, reckless vs prudent
- [Martin Fowler: Strangler Fig](https://martinfowler.com/bliki/StranglerFigApplication.html), incremental replacement instead of a big rewrite
