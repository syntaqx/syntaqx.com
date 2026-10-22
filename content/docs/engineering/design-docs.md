+++
title = "Decisions & Design Docs"
description = "How much process a decision deserves, a named decider and a date, disagree and commit, and design docs and ADRs that keep the reasoning findable later."
category = "Engineering Practice"
order = 1001
tags = ["process", "architecture", "adr", "documentation", "decisions", "leadership"]
aliases = ["design-docs", "leadership/technical-decisions"]
+++

Teams rarely fail because they make bad technical decisions. They fail because they make them slowly, implicitly, or twice. A choice nobody owns gets relitigated in every meeting; a choice nobody wrote down gets reversed by the next person who didn't know why it was made. Code shows what a system does, rarely why. So the practice has two halves: make decisions at the right weight, by a named person, and write them down where the next engineer will find them.

## Match the Process to the Door

The most useful question about any decision is how expensive it is to undo. Jeff Bezos's [2015 letter to shareholders](https://www.sec.gov/Archives/edgar/data/1018724/000119312516530910/d168744dex991.htm) names the two kinds: "one-way doors", consequential and irreversible or nearly so, and "two-way doors", which are changeable and reversible. Organizations get this backwards in both directions: heavyweight review for choices they could undo next week, and casual calls on the truly irreversible ones because "we decide things fast here".

| Door | Examples | Who decides | Process |
| ---- | -------- | ----------- | ------- |
| Two-way | A library inside one service, an internal API shape | The person or team doing the work | Decide, note it in the PR |
| Somewhat sticky | A public API contract, a service boundary, a shared data model | The owning team, consulting those affected | A short design doc |
| One-way | A primary datastore, a vendor you'll be locked into, a security model | A named senior decider, after real review | Design doc, explicit alternatives, sign-off |

Requiring approval for two-way doors doesn't make them better; it teaches people to stop deciding and turns senior engineers into a bottleneck for choices they have the least context on. The trap is misclassifying: "we can always migrate later" is said about a lot of databases still in production a decade on. Ask what reversing would cost in a year, with the data and integrations that will exist by then.

## A Decider and a Date

The commonest failure isn't the wrong answer. It's no answer: a thread that grows for three weeks, a doc with forty comments and no conclusion, while the team quietly waits or builds on assumptions that may not survive. Before a discussion starts, settle two things:

- **Who decides.** One named person, not "the team". Everyone else informs the decision. A group can't be accountable, and accountability is what makes a decision stick.
- **By when.** A date, chosen by asking what waiting costs. Usually someone is blocked.

Bezos's [2016 letter](https://www.aboutamazon.com/news/company-news/2016-letter-to-shareholders) argues most decisions should be made with "somewhere around 70% of the information you wish you had". Waiting for 90% is usually slower than being wrong and correcting, especially on a two-way door.

## Consent, Then Commit

Consensus asks whether everyone agrees this is the best option, and on any interesting question the honest answer is no. Teams that require it stall or settle on a compromise nobody believes in. [Consent](https://patterns.sociocracy30.org/consent-decision-making.html) asks whether it's "good enough for now and safe enough to try": an objection has to show a risk worth avoiding or a concrete improvement, not a preference. That's the bar I use for most team decisions.

Once decided, everyone executes it as their own, including the people who argued against it: "disagree and commit", from the same 2016 letter. It only works if the disagreement was heard, so record the dissent in the doc with its reasoning, and if the commitment is real: no half-hearted execution, no "I told you so", no quietly building the other option. New information comes back as new information, not the old argument again. It applies to leaders too; some of the most useful things I say to a team are "I'd have done it differently, it's your call, and I'm in."

## When to Write a Design Doc

A design doc works a decision out while changing it is cheap: moving a box on a diagram costs minutes, moving it after three months of code costs a migration. It's overhead, so it has to buy something. It does when:

- **More than one team, or more than a couple of weeks of work.** Two teams with two mental models build two halves that don't meet.
- **It changes a public API, a data model, or how money moves.** These outlive the code that introduces them.
- **It's a one-way door:** a new datastore, a vendor, a migration.
- **Reasonable engineers would disagree.** Have the argument once, in writing, not in every code review that follows.

If a prototype can answer the question in a day, build the prototype. A doc speculating about something you could have measured is the worst of both.

## What Goes in One

Most good design docs fit in 2 to 6 pages, because a doc nobody finishes reviews nothing.

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

**Non-Goals** stop scope creep before it starts. **Alternatives Considered** is what makes it a decision instead of a description: if the author can't name a credible alternative and say why it lost, reviewers can't tell whether the obvious option was weighed or missed.

Review it async first, since comments scale, leave a record and give quieter people a voice; meet only for disagreements comments can't settle. Name the approvers, usually the owners of the systems it touches, and give the review a deadline. When it ships, mark it implemented and note where reality diverged; a doc confidently wrong about the shipped system is worse than none.

## ADRs Record Departures

An architecture decision record captures one decision in about a page, in the repository it affects, in [Michael Nygard's format](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions): context, decision, consequences. Where a design doc explores, an ADR concludes.

A team with written standards doesn't need one for every choice. When the code does what the playbook says, the playbook is the explanation, and an ADR restating it is noise that buries the records that matter. An ADR earns its place when a system **departs** from the standard: integer keys for one warehouse, no deprecation window for an API nobody uses yet. Those are exactly the choices a new engineer will assume are mistakes and "fix". Teams without written standards are different: every decision departs from nothing, so ADRs are how the standard gets built, and repeated patterns get promoted into the playbook.

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

Link the standard it departs from, store it with the code (`docs/adr/`) and review it in the same pull request as the change. Don't rewrite history: a changed decision gets a new record that supersedes the old one, and a departure that keeps proving right becomes a playbook change. Write a revisit trigger into larger decisions ("if traffic exceeds X"), so they're reopened when the facts change, not when the people do.

[syntaqx.com's ADRs](https://github.com/syntaqx/syntaqx.com/tree/main/docs/adr) number four, because the site mostly follows this playbook. Each is a departure, like header-only API versioning or a Content-Security-Policy that still allows inline scripts.

## References

**In practice**

- [Amazon: 2015 Letter to Shareholders](https://www.sec.gov/Archives/edgar/data/1018724/000119312516530910/d168744dex991.htm), one-way and two-way door decisions
- [Amazon: 2016 Letter to Shareholders](https://www.aboutamazon.com/news/company-news/2016-letter-to-shareholders), deciding with about 70% of the information and "disagree and commit"
- [Sociocracy 3.0: Consent Decision Making](https://patterns.sociocracy30.org/consent-decision-making.html), consent as "good enough for now, safe enough to try"
- [Michael Nygard: Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions), the original ADR format
- [ADR GitHub Organization](https://adr.github.io/), ADR templates and tooling
- [Malte Ubl: Design Docs at Google](https://www.industrialempathy.com/posts/design-docs-at-google/), what goes in a design doc and when to skip one
