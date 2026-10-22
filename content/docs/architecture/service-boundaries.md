+++
title = "Service Boundaries"
description = "Where to draw lines in a system: start with a modular monolith, split only for a reason, give every piece of data one owner, and never share a database."
category = "Architecture"
order = 8
tags = ["architecture", "microservices", "monolith", "design"]
aliases = ["service-boundaries"]
+++

Most architecture pain comes from boundaries drawn in the wrong place, not from the technology on either side of them. A boundary is a promise: this side owns this data and this behavior, and everyone else goes through its interface.

## Start With a Modular Monolith

One deployable, many modules ([MonolithFirst](https://martinfowler.com/bliki/MonolithFirst.html)). Each module has:

- **Its own directory and public interface.** Other modules call its exported functions, never its internals.
- **Its own tables.** Other modules don't join against them or write to them.
- **No circular dependencies.** Enforce it in CI with a dependency linter, not with good intentions.

This gets most of the benefit of services (clear ownership, independent reasoning) without the cost (network calls, distributed transactions, partial failure, versioned contracts). And because the boundaries are already real, splitting a module out later is a deployment change, not a rewrite.

## When to Split

Extract a service when there's a concrete reason, not because a module got big:

| Reason | Example |
| ------ | ------- |
| Different scaling profile | Webhook delivery bursts 50x at month end |
| Different reliability or compliance needs | The card vault, kept out of [PCI scope](/docs/payments/sensitive-data) for everything else |
| Different deploy cadence | A team blocked weekly by another team's release train |
| Different runtime | A model served from Python next to a Go API |
| Team ownership | A team big enough to own it on call, end to end |

"It would be cleaner" isn't on the list. If none of these apply, the module stays in.

## Every Piece of Data Has One Owner

- **One service writes a table.** Others read through its API or consume its [events](/docs/architecture/events).
- **No shared databases.** A table read by two services is a contract nobody versioned. The first schema change breaks the other one, and you find out in production.
- **Copies are fine, if they're labeled.** A service can keep a local, read-only projection of someone else's data, fed by events. It is never the source of truth.
- **Reference by ID.** Store the other service's ID (`customer_id`), not a copy of its fields, unless you need the value as it was at that moment (an invoice's billing address).

## Synchronous vs Asynchronous

| Use | When |
| --- | ---- |
| Synchronous (HTTP, gRPC) | The caller needs the answer to continue, and the user is waiting |
| Asynchronous ([events](/docs/architecture/events), queues) | Something happened and others may care, now or later |

- **Prefer async between services.** A chain of synchronous calls has the availability of the product of its parts. Five services at 99.9% each is about 99.5% together.
- **Every sync call has a timeout and a fallback.** See [Retries & Timeouts](/docs/operations/retries-and-timeouts).
- **No distributed transactions.** When a workflow spans services, model it as a sequence of local transactions with compensating actions (a saga), and make every step [idempotent](/docs/payments/idempotency).

## Boundaries Follow Teams

[Conway's law](https://www.melconway.com/Home/Committees_Paper.html): systems end up mirroring the communication structure of the organization that builds them. Work with it, not against it.

- **One team owns a service:** its code, its data, its alerts, and its [on-call](/docs/operations/on-call).
- **No shared ownership.** "Everyone owns it" means nobody does.
- **Draw the boundary where the conversation is rare.** If two teams have to coordinate on every change, they're on the wrong sides of the line.

## Contracts

Every boundary has an explicit contract, versioned like a public API, whether it's internal or not:

- HTTP APIs follow these docs, including [Versioning & Deprecation](/docs/operations/versioning).
- Events have schemas with the same compatibility rules. See [Events & Async Messaging](/docs/architecture/events).
- Contract tests run in CI on both sides. See [Testing Strategy](/docs/engineering/testing).

Write the decision down. Splitting or merging a service is exactly the kind of choice that gets an [ADR](/docs/engineering/design-docs).

## References

**In practice**

- [Martin Fowler: MonolithFirst](https://martinfowler.com/bliki/MonolithFirst.html), the modular-monolith default
- [Martin Fowler & James Lewis: Microservices](https://martinfowler.com/articles/microservices.html), the trade-offs of splitting into services
- [Martin Fowler: Bounded Context](https://martinfowler.com/bliki/BoundedContext.html), drawing boundaries around a domain model
- [microservices.io: Database per Service](https://microservices.io/patterns/data/database-per-service.html), one owner per piece of data, no shared databases
- [Melvin Conway: How Do Committees Invent?](https://www.melconway.com/Home/Committees_Paper.html), the original statement of Conway's law
- [Team Topologies: Key Concepts](https://teamtopologies.com/key-concepts), aligning service ownership with teams
