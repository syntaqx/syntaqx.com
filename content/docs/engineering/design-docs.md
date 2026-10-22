+++
title = "Design Docs & ADRs"
description = "When a change needs a design doc, what goes in one, and why decision records should capture departures from your standards rather than every choice."
category = "Engineering Practice"
order = 1001
tags = ["process", "architecture", "adr", "documentation"]
aliases = ["design-docs"]
+++

Code shows what a system does. It rarely shows why, or what else was considered. A design doc works a decision out while changing it is still cheap: moving a box on a diagram costs minutes, while moving it after three months of code costs a migration. A decision record keeps the reasoning findable after the people who made it have moved on.

## When to Write One

A design doc is overhead, so it has to buy something. It does when the cost of being wrong is high or the right answer isn't obvious:

- **More than one team, or more than a couple of weeks of work.** Coordination is where unwritten plans fall apart. Two teams with two mental models build two halves that don't meet.
- **It changes a public API, a data model, or how money moves.** These outlive the code that introduces them, and clients or historical data lock them in.
- **It's hard to reverse:** a new datastore, a new vendor, a migration. The doc is cheap insurance against a decision you'll live with for years.
- **Reasonable engineers would disagree.** Better to have the argument once, in writing, than in every code review that follows.

Skip it for work that's easy to undo. If a prototype can answer the question in a day, build the prototype. A doc speculating about something you could have measured is the worst of both.

## What Goes in One

Short beats complete. Most good design docs fit in 2 to 6 pages, because a doc nobody finishes reading reviews nothing.

```markdown
# Title

Author, reviewers, status (draft, in review, accepted, superseded), date.

## Context
What problem, for whom, and why now. Link the data.

## Goals and Non-Goals
What this must achieve. What it explicitly won't.

## Proposal
The design. Diagrams, API shapes, data model, the flow of a request.

## Alternatives Considered
Each real option, and why it lost. "Do nothing" is always one.

## Risks and Mitigations
Failure modes, security, migration, cost.

## Rollout
Phases, feature flags, how we know it's working, how we roll back.

## Open Questions
What's undecided, and who decides it.
```

Two sections carry most of the value:

- **Non-Goals** stop scope creep before it starts. "This doesn't handle multi-currency" written down on day one saves the review where someone asks why it doesn't.
- **Alternatives Considered** is what makes it a decision instead of a description. If the author can't name a credible alternative and say why it lost, the design hasn't been thought through yet, and reviewers can't tell whether the obvious option was weighed or just missed.

## Review

- **Async first.** Comments on the doc scale to more reviewers, leave a record, and give quieter people a voice that a meeting doesn't. Meet only for disagreements that comments can't settle.
- **Named approvers,** usually the owners of the systems it touches. "Anyone who reads it" means nobody is accountable for saying yes, so nobody says no either.
- **A deadline.** A review that drifts for weeks blocks the work it was meant to improve, and the team quietly starts building anyway.
- **Disagree and commit.** Once it's accepted, record the objections in the doc and proceed. Relitigating in every pull request costs more than any single wrong call.

## Architecture Decision Records

An ADR records one decision in about a page, in the repository it affects, using [Michael Nygard's format](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions): context, decision, consequences. Where a design doc explores, an ADR concludes.

### Record Departures, Not Defaults

A team with written standards doesn't need an ADR for every choice. When the code does what the playbook says, the playbook is the explanation, and an ADR restating it is noise. Worse, it's noise that buries the records that matter: if `docs/adr/` holds forty files, nobody reads the three that explain why a system is different.

An ADR earns its place when a system **departs** from the standard: integer keys for one warehouse, no deprecation window for an API nobody uses yet, a security header weaker than the default. Those are exactly the choices a new engineer will reasonably assume are mistakes and "fix". The record is what stops them, or tells them the original reason no longer holds.

Teams without written standards are in a different position. Every significant decision is a departure from nothing, so ADRs are how the standard gets built in the first place. As patterns repeat, promote them into the playbook and stop recording them one by one.

```markdown
# 0007. Integer keys for the reporting warehouse

Status: Accepted (2026-03-14)

## Context
The playbook defaults to UUID v7 keys. The warehouse joins billions of
rows on keys and is only ever written by one loader...

## Decision
Warehouse tables use BIGINT keys, mapped from source UUIDs at load time...

## Consequences
Join keys and indexes are half the size. Keys can't be generated
outside the loader...
```

- **Say what it departs from.** Link the standard it overrides, so a reader can weigh the exception against the rule.
- **Stored with the code** (`docs/adr/`), reviewed in the same pull request as the change, so the code and its reason land together.
- **Don't rewrite history.** While a departure stands, its record stays as written; a changed decision gets a new record that supersedes it. When a departure keeps proving right, change the playbook instead and retire the record. Git keeps the history either way, and the active set stays short enough to read.

This site keeps its own: [syntaqx.com's ADRs](https://github.com/syntaqx/syntaqx.com/tree/main/docs/adr) number four, because the site mostly follows this playbook. Each one is a departure, like header-only API versioning or a Content-Security-Policy that still allows inline scripts.

## After It Ships

Close the loop. Mark the doc implemented, note where reality diverged from the plan, and link the records it produced. A design doc that's confidently wrong about the shipped system is worse than none, because people trust it.

## References

**In practice**

- [Michael Nygard: Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions), the original ADR format
- [ADR GitHub Organization](https://adr.github.io/), ADR templates and tooling
- [Malte Ubl: Design Docs at Google](https://www.industrialempathy.com/posts/design-docs-at-google/), what goes in a design doc and when to skip one
