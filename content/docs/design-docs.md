+++
title = "Design Docs & ADRs"
description = "When a change needs a design doc, what goes in one, and how architecture decision records keep the reasoning behind a system findable years later."
category = "Engineering Practice"
order = 12
tags = ["process", "architecture", "adr", "documentation"]
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

An ADR records one decision, in about a page, in the repository it affects. Based on [Michael Nygard's format](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions):

```markdown
# 0007. Use UUID v7 for primary keys

Status: Accepted (2026-03-14)

## Context
IDs are generated on several services and must sort by creation time...

## Decision
All new tables use UUID v7 primary keys...

## Consequences
B-tree inserts stay sequential. Existing auto-increment tables are not migrated...
```

- **Numbered and immutable.** An ADR is never edited after it's accepted. A changed decision is a new ADR that supersedes the old one, and the old one links forward.
- **Stored with the code** (`docs/adr/`), so they're reviewed in pull requests and found by people reading the code.
- **Small decisions count.** "Why is this a separate service?" is exactly the question a new engineer asks in year three.

This site keeps its own: [syntaqx.com's ADRs](https://github.com/syntaqx/syntaqx.com/tree/main/docs/adr) cover decisions like serving HTTP QUERY in the proxy layer and keeping legacy `X-` headers as aliases, and CI checks that every record is numbered, indexed and complete.

## After It Ships

Close the loop. Mark the doc implemented, note where reality diverged from the plan, and link the ADRs it produced. A design doc that's wrong about the shipped system is worse than none.

## References

**In practice**

- [Michael Nygard: Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions), the original ADR format
- [ADR GitHub Organization](https://adr.github.io/), ADR templates and tooling
- [Malte Ubl: Design Docs at Google](https://www.industrialempathy.com/posts/design-docs-at-google/), what goes in a design doc and when to skip one
