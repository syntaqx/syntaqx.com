+++
title = "Service Boundaries"
description = "Where to draw lines in a system: start with a modular monolith, split only for a reason, give every piece of data one owner, and never share a database."
category = "Architecture"
order = 401
tags = ["architecture", "microservices", "monolith", "design"]
aliases = ["service-boundaries"]
+++

The API chapters describe a system's front door. Behind it, most architecture pain comes from boundaries drawn in the wrong place, not from the technology on either side of them. A boundary is a promise: this side owns this data and this behavior, and everyone else goes through its interface. Draw it well and teams work independently. Draw it badly and every change needs three teams in a meeting, which is worse than no boundary at all.

## Start With a Modular Monolith

One deployable, many modules. Each module has:

- **Its own directory and public interface.** Other modules call its exported functions, never its internals.
- **Its own tables.** Other modules don't join against them or write to them.
- **No circular dependencies,** enforced in CI with a dependency linter. Boundaries enforced by good intentions erode one convenient import at a time.

This gets most of what services promise (clear ownership, code you can reason about in isolation) without what they cost: network calls that fail, distributed transactions you can't have, partial outages, and contracts that need versioning. Because the boundaries are already real, extracting a module later is a deployment change, not a rewrite.

Starting with services gets the order backwards. Early on you don't know where the domain's seams are, and inside a monolith moving a boundary is a refactor, while between services it's a migration. Martin Fowler's [MonolithFirst](https://martinfowler.com/bliki/MonolithFirst.html) makes the same argument: almost every successful microservice system he saw started as a monolith that got too big.

## When to Split

Extract a service when there's a concrete reason, not because a module got big:

| Reason | Example |
| ------ | ------- |
| Different scaling profile | Webhook delivery bursts 50x at month end, and the API shouldn't scale with it |
| Different reliability or compliance needs | The card vault, kept separate so the rest of the system stays out of [PCI scope](/docs/payments/sensitive-data) |
| Different deploy cadence | A team blocked weekly by another team's release |
| Different runtime | A model served from Python next to a Go API |
| Team ownership | A team big enough to own it end to end, including [on-call](/docs/operations/on-call) |

"It would be cleaner" isn't on the list. Every split adds a network boundary, and a network boundary is a new way for things to fail. If none of these reasons apply, the module stays in.

### The Distributed Monolith

The worst outcome isn't a monolith. It's services that have to be deployed together, share a database, or call each other synchronously for every request. That's a monolith with network latency and partial failure added, and none of the independence. If two services always change together, they're one service with a boundary in the wrong place: merge them, or move the line.

## Every Piece of Data Has One Owner

- **One service writes a table.** Others read through its API or consume its [events](/docs/architecture/events).
- **No shared databases.** A table read by two services is a contract nobody versioned: the owner renames a column and the other service breaks in production. And if two services write the same rows, neither can guarantee anything about them.
- **Copies are fine, if they're labeled.** A service can keep a local, read-only projection of someone else's data, fed by events. It's a cache with known staleness, never the source of truth.
- **Reference by ID.** Store the other service's ID (`customer_id`), not a copy of its fields, unless you need the value as it was at a moment in time. An invoice keeps the billing address it was issued to, even if the customer moves.

## Synchronous vs Asynchronous

| Use | When |
| --- | ---- |
| Synchronous (HTTP, gRPC) | The caller needs the answer to continue, and a user is waiting |
| Asynchronous ([events](/docs/architecture/events), queues) | Something happened, and others may care now or later |

- **Prefer async between services.** A synchronous call couples availability: if the callee is down, the caller is down. Chain five services at 99.9% each and the request succeeds about 99.5% of the time, roughly three and a half hours of failure a month instead of 43 minutes. An event published to a broker waits for a consumer that's down; a synchronous call just fails.
- **Every sync call has a timeout and a fallback.** A call without a timeout turns a slow dependency into exhausted threads and a cascading outage. See [Retries & Timeouts](/docs/architecture/retries-and-timeouts).
- **No distributed transactions.** Two-phase commit across services couples their availability and their locks. When a workflow spans services, model it as a sequence of local transactions with compensating actions (a saga), and make every step [idempotent](/docs/payments/idempotency) so retries are safe.

## Boundaries Follow Teams

Systems end up mirroring the communication structure of the organization that builds them ([Conway's law](https://www.melconway.com/Home/Committees_Paper.html)), so one team owns each service end to end: its code, its data, its alerts and its on-call. Draw the boundary where conversation is rare; if two teams coordinate on every change, they're on the wrong sides of the line. [Team Structure](/docs/leadership/team-structure) covers the organizational side.

## Contracts

Every boundary has an explicit contract, versioned like a public API whether it's internal or not; internal consumers break just as hard and are usually less able to pin an old version. HTTP APIs follow [Versioning & Deprecation](/docs/api-design/versioning), events get schemas with the same compatibility rules ([Events & Async Messaging](/docs/architecture/events)), and contract tests run in CI on both sides ([Testing Strategy](/docs/engineering/testing)).

Splitting or merging a service is a decision you'll live with for years, so it starts with a [design doc](/docs/engineering/design-docs).

## References

**In practice**

- [Martin Fowler: MonolithFirst](https://martinfowler.com/bliki/MonolithFirst.html), why successful service architectures usually start as monoliths
- [Martin Fowler & James Lewis: Microservices](https://martinfowler.com/articles/microservices.html), the trade-offs of splitting into services
- [Martin Fowler: Bounded Context](https://martinfowler.com/bliki/BoundedContext.html), drawing boundaries around a domain model
- [microservices.io: Database per Service](https://microservices.io/patterns/data/database-per-service.html), one owner per piece of data, no shared databases
- [Melvin Conway: How Do Committees Invent?](https://www.melconway.com/Home/Committees_Paper.html), the original statement of Conway's law
- [Team Topologies: Key Concepts](https://teamtopologies.com/key-concepts), aligning service ownership with teams
