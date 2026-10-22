+++
title = "Team Structure"
description = "Designing teams on purpose: Conway's law, stream-aligned teams that own services end to end, platforms run as products, and cognitive load as the sizing limit."
category = "Leadership"
order = 14.5
tags = ["leadership", "management", "organization", "team-topologies"]
+++

Org charts are architecture diagrams that nobody reviews. Whatever lines you draw between teams, the system will grow seams in the same places, because the seams are where communication is expensive. I design teams the way I design services: deliberately, around the flow of work, with clear ownership and as few handoffs as possible.

## Conway's Law Is a Constraint, Not a Curiosity

In 1968 Melvin Conway argued that organizations which design systems are constrained to produce designs that copy their own communication structures. Fifty years of experience say he was right, and the reason is mundane. Two people on the same team change a shared interface over lunch. Two teams change it through tickets, meetings and a release plan. The cheap path wins, so code coupling ends up mirroring social coupling.

That makes team design a technical decision. If three teams each own a slice of checkout, you'll get a checkout split into three pieces with negotiated contracts between them, whether or not that's the right shape for checkout. If one team owns frontend and another owns backend, every feature crosses a team boundary and every boundary becomes an API that has to be scheduled.

## The Inverse Conway Maneuver

If structure produces architecture, you can run it the other way: decide the architecture you want, then shape teams so that the easy communication paths are the ones the design needs. Thoughtworks named this the Inverse Conway Maneuver and has recommended it since 2014.

In practice that means I draw the [service boundaries](/docs/architecture/service-boundaries) and the team boundaries in the same conversation. A boundary that's good in the code but splits a team, or that two teams have to coordinate across for every change, is not a good boundary yet. The reverse also holds: reorganizing teams without touching the architecture just moves the coordination cost somewhere else.

## Four Team Types, Three Ways to Interact

Team Topologies gave the industry a vocabulary I use directly, because it forces the question "what is this team *for*?":

- **Stream-aligned teams** deliver a flow of work for a product, a customer journey or a business domain. Most teams should be these.
- **Platform teams** provide internal services that make stream-aligned teams faster.
- **Enabling teams** help other teams pick up a capability (observability, accessibility, a new framework) and then step away.
- **Complicated-subsystem teams** own something that genuinely needs specialist knowledge, like a pricing engine or a video codec.

Teams interact in one of three modes: **collaboration** (working closely together for a while, usually to discover something), **X-as-a-Service** (one team consumes another's offering with minimal contact) and **facilitation** (one team coaches another). The modes matter as much as the types. Collaboration is expensive and should be temporary and deliberate. If two teams have been "collaborating" for a year, that's not a mode, it's a missing boundary.

## Cognitive Load Sets the Size

The constraint I size teams against is not headcount, it's how much a team can hold in its head. Team Topologies puts it plainly: teams can only handle so much complexity before breaking down, and overloaded teams make poor decisions and move slowly. A team that owns six services, two legacy systems and the on-call rotation for all of them will be slow at every one of them, no matter how good the people are.

So when a team is struggling, I look at what it owns before I look at who's on it. The symptoms are recognizable: nobody can explain how a part of their system works, on-call is a lottery, and every estimate has a "depends on what we find" clause. The fixes are to give work away, retire things, or put a platform underneath them, not to add people to an already overloaded scope.

## Stream-Aligned Teams Own Services End to End

A stream-aligned team owns its services from design through production: the code, the schema, the deploy pipeline, the dashboards, the pager. It's listed as the owner in [code ownership](/docs/engineering/code-ownership), and it can ship a change to its customers without waiting on anyone else.

End to end is the point. A team that writes code and throws it to an ops team never learns what its code does at 3am. A team that owns the pager writes fewer pages. Ownership also makes decisions faster, because the people who know the trade-offs are the ones who live with them.

## Platform Teams Are Product Teams

A platform team's customers are the other engineers, and I hold it to the same standard as any product team: it has users, a roadmap driven by their problems, documentation, and a measure of whether it's working. The measure is adoption and the time it saves, not the number of features shipped.

The failure mode is a platform that's mandatory, poorly documented and built for problems nobody had. Engineers route around it, and now you have two platforms. If a platform team has to mandate its own adoption, the product isn't good enough yet. The best platforms are the paved road people choose because it's genuinely easier than doing it themselves.

## Small Teams

Amazon's two-pizza rule says a team should be no larger than two pizzas can feed. I read that as roughly five to nine people, and it holds up because the cost of coordination grows faster than the team does. Every new member adds a connection to everyone already there. Past a certain size, a team stops having one conversation and starts having several, and it's quietly become two teams that share a standup.

Below about four, the opposite problem shows up: vacations and on-call make the team fragile, and one departure takes half its knowledge. When a team grows past nine, I split it along a seam in the work, not alphabetically or by seniority, so each half owns something whole.

## Avoid Component Teams and Handoffs

A component team owns a layer (the database team, the frontend team, the API team) rather than an outcome. Every feature then needs work from several of them, and every one of those handoffs adds a queue, a priority negotiation and a chance for context to get lost. Delivery speed becomes the speed of the slowest team's backlog.

I organize around outcomes instead, and keep specialists in the stream-aligned teams or in enabling teams that spread the skill. The exception is genuine depth: a complicated subsystem that would overwhelm any stream-aligned team. That's a deliberate choice, made rarely, with a clear X-as-a-Service interface so other teams don't have to wait on it.

## When and How to Reorganize

Reorgs are expensive. Every one resets relationships, ownership and context that took months to build, and people stop doing their best work while they wait to find out where they'll land. I reorganize only for a reason I can say in one sentence that's about the work: a team's cognitive load is unsustainable, a boundary forces constant cross-team coordination, or the product strategy has genuinely changed shape.

When I do:

- **Start from the architecture and the flow of work**, then fit people to it. Not the other way around.
- **Move ownership explicitly.** Every service, alert and on-call rotation has a named new owner on day one, written down. Orphaned systems are how reorgs cause incidents.
- **Tell people early and in person.** Rumors do more damage than the change. Each person hears from their manager what changes for them, before the announcement.
- **Make it once, then hold still.** A series of small reorgs is worse than one considered one. Teams need time to become teams again.

## References

### Reference

- [Mel Conway: How Do Committees Invent?](http://www.melconway.com/Home/Committees_Paper.html), the 1968 Datamation paper arguing that system designs copy the communication structure of the organizations that build them
- [Team Topologies: Key Concepts](https://teamtopologies.com/key-concepts), the four team types, three interaction modes, and cognitive load as the limit on what a team can own
- [Thoughtworks Technology Radar: Inverse Conway Maneuver](https://www.thoughtworks.com/radar/techniques/inverse-conway-maneuver), evolving team structure to promote the architecture you want

### In practice

- [Martin Fowler: Conway's Law](https://martinfowler.com/bliki/ConwaysLaw.html), why the law holds and how teams use it deliberately
- [AWS: Two-Pizza Teams](https://docs.aws.amazon.com/whitepapers/latest/introduction-devops-aws/two-pizza-teams.html), Amazon's rule of keeping teams small enough to feed with two pizzas, with ownership end to end
