+++
title = "Design Docs & ADRs"
description = "When a change needs a design doc, what goes in one, and how architecture decision records keep the reasoning behind a system findable years later."
category = "Engineering Practice"
order = 12
tags = ["process", "architecture", "adr", "documentation"]
aliases = ["design-docs"]
+++

Code shows what a system does. It rarely shows why, or what else was considered. Design docs work out a decision before it's built, and decision records keep the reasoning around after the people who made it have moved on.

## When to Write One

Write a design doc when any of these are true:

- More than one team, or more than a couple of weeks of work, is involved.
- It changes a public API, a data model, or how money moves.
- It's hard to reverse: a new datastore, a new vendor, a migration.
- Reasonable engineers would disagree about the approach.

Skip it for work that's easy to undo. A prototype that answers the question beats a document that speculates about it.

## Design Doc Template

Short beats complete. Most good design docs fit in 2 to 6 pages.

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

**Alternatives Considered** is the most important section. A doc without real alternatives is a description, not a decision.

## Review

- **Async first.** Reviewers comment on the doc. A meeting is only for disagreements that comments can't settle.
- **Named approvers,** not "anyone who reads it". Usually the owners of the systems it touches.
- **A deadline.** Reviews that drift forever block the work they were meant to improve.
- **Disagree and commit.** Once accepted, objections are recorded in the doc, and the work proceeds.

## Architecture Decision Records

An ADR records one decision, in about a page, in the repository it affects. Based on [Michael Nygard's format](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).

### Record Departures, Not Defaults

A team with written standards doesn't need an ADR for every choice. When the code does what the playbook says, the playbook is the explanation, and an ADR restating it is noise that buries the records that matter.

An ADR earns its place when a system **departs** from the standard: a different ID format for one warehouse, no deprecation window for an API nobody uses yet, a security header weaker than the default. Those are the choices a new engineer will reasonably assume are mistakes, so the reasoning has to be findable. If a departure keeps turning out to be right, that's a sign the standard should change, and the ADR goes away with it.

Teams without written standards are in a different position: every significant decision is effectively a departure from nothing, and ADRs are how the standard gets built up in the first place.

```markdown
# 0007. Integer keys for the reporting warehouse

Status: Accepted (2026-03-14)

## Context
The playbook defaults to UUID v7 keys. The warehouse joins billions of rows on keys and is never written by more than one service...

## Decision
Warehouse tables use BIGINT keys, mapped from source UUIDs at load time...

## Consequences
Joins and indexes are a quarter the size. Keys can't be generated outside the loader...
```

- **Numbered and immutable.** An ADR is never edited after it's accepted. A changed decision is a new ADR that supersedes the old one, and the old one links forward.
- **Stored with the code** (`docs/adr/`), so they're reviewed in pull requests and found by people reading the code.
- **Say what it departs from.** Link the standard it overrides, so a reader can weigh the exception against the rule.

This site keeps its own: [syntaqx.com's ADRs](https://github.com/syntaqx/syntaqx.com/tree/main/docs/adr) are short because the site mostly follows this playbook. The few that exist are the departures, like serving the API with header-only versioning and a Content-Security-Policy that still allows inline scripts.

## After It Ships

Close the loop. Mark the doc implemented, note where reality diverged from the plan, and link the ADRs it produced. A design doc that's wrong about the shipped system is worse than none.

## References

**In practice**

- [Michael Nygard: Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions), the original ADR format
- [ADR GitHub Organization](https://adr.github.io/), ADR templates and tooling
- [Malte Ubl: Design Docs at Google](https://www.industrialempathy.com/posts/design-docs-at-google/), what goes in a design doc and when to skip one
