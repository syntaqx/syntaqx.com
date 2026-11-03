+++
title = "Shipping It Isn't Owning It"
date = 2026-11-09T00:00:00Z
description = "An agent will build anything you ask for. Deciding what deserves to exist, and who will own it once it does, didn't get any cheaper."
categories = ["AI", "Engineering Leadership"]
tags = ["AI", "Engineering Leadership", "Product Management", "Software Architecture"]
layout = "feature"
hero = "handoff"
+++

In [We've Been "Vibe Coding" This Whole Time](/posts/weve-been-vibe-coding-this-whole-time) I argued that nobody ever read every line, and that the job is building the thing that would notice. That's the half of the job about how code ships. This is the other half: what gets built at all, where it goes, and who's left holding it.

Ask anyone whose four-month project got thrown away the week before launch because the requirements changed: building the wrong thing was never cheap. An agent just gets you to that week faster.

## The backlog was a feature

An agent will build anything. Working, tested, documented, by lunch. It will never once ask whether you should.

For most of this industry's history we had a filter we never appreciated: building was slow. A half-baked idea had to survive a planning meeting, a quarter of competing priorities, and some engineer asking "wait, who is this for?" Most didn't make it. We complained about the backlog constantly, and it was quietly saving us from ourselves.

That filter's gone. Code got cheap to write. It didn't get any cheaper to own. Every feature you ship is a feature you maintain, secure, migrate, explain to support, and eventually argue about deleting.

The backlog only works as a filter if you're honest about it. Ten people with a thousand items aren't getting to them, and the roadmap never will. So admit what you're not willing to build: anything that sits untouched long enough [goes stale and gets closed](/docs/product/backlogs). If it ever matters again, great. It'll come back with fresh evidence, and the new ticket will be worth more than the old one. An agent doesn't change that math. It could type its way through all thousand, and you'd own every one.

So every feature has to trace back to a real problem statement, on purpose this time. I wrote about this in [Control Isn't Success](/posts/control-isnt-success): a problem statement is a spine, not a formality. An agent finishes before anyone thinks to ask why.

Game designers have known this forever. Ship every feature players ask for and you ship a worse game. Path of Exile's co-creator Chris Wilson, borrowing a line from Magic: The Gathering's Mark Rosewater, puts it this way: your audience is "[good at recognizing problems and bad at solving them](https://www.gamesradar.com/games/action-rpg/path-of-exile-co-creator-tells-developers-dont-survey-your-players-because-your-audience-is-good-at-recognizing-problems-and-bad-at-solving-them/)." Same goes for the agent that tours your product every night and files feature ideas.

## Wrong building, great variable names

An agent doesn't have taste in architecture. It has every architecture, and it'll hand you whichever one the prompt leans toward, with total confidence and very good variable names.

Ask for a feature and it might build you a fully isolated application: its own Vercel project, its own database, its own auth, an ecosystem away from the product it was supposed to join. It works. It demos great. Now you own two products.

Or mention "microservices" once in the prompt and it'll give you Lambda sprawl. Every endpoint, job and handler gets its own function, queue, permissions and deploy. No single function is the mistake. The shape is, and one word in the prompt picked it. Enough features later, you're running thousands of them, nobody can draw the system, and it costs real money just to exist. All you needed was one service with four endpoints.

What most products should be running is a [modular monolith](/docs/architecture/service-boundaries), boring on purpose. You're not Google, and you don't have Amazon's problems. Real seams between modules, each owning its own tables and its own interface. It starts as one deploy. When a piece genuinely needs to scale, ship or fail on its own, you split it out as a service, and that's cheap, because the seam is already there.

The point is the modularity, not the repository. Five teams in one repository can mean 500 open pull requests, and labels, code owners and a dashboard per team keep that from drowning anyone. A repository per domain, each its own small monolith, works too. Both hold up when the seams are real. Either way, an agent almost never suggests the boring option unprompted, because "put it in the app we already have" doesn't sound like much of an answer.

The code is fine in both of those. The tests pass! The agent just doesn't know where your boundaries are or [what anything costs](/docs/operations/cost-and-finops) unless somebody tells it. What used to live in an architect's head now has to live in every engineer directing agents, which is most of why I've been writing all these docs.

## Somebody has to run it

This is what worries me more than any of the code.

Engineers have to move toward the product: what to build, whether it should exist, how it feels to use. A lot of them don't want to. They got into this to write code, and "figure out what the customer needs" sounds like somebody else's job. It isn't anymore. Product is moving the other way, and plenty of PMs and designers are shipping real software with these tools. Good.

But those aren't the same distance. An engineer who learns product is still an engineer, now with better judgment about what to build. A product person who learns to drive an agent can ship software, but shipping it was never the hard part. Somebody has to own it technically: know what it depends on, what it costs, how it fails, and what to do when it does. A demo can prove a feature works. It can't prove anyone is ready to run it: patch it, scale it, get paged when it breaks, and still understand it in two years.

If you're in engineering, you've probably already felt this from the receiving end. Product hands you something "done": built, demoed, just needs a merge. It looks exactly like something you could ship and own for the next five years. It isn't the same thing. "It runs" and "we can own it" used to arrive together, because the same people produced both. Now one shows up without the other.

Here's what that looks like. Code models invent package names that don't exist: in [a 2025 study of 16 models](https://www.usenix.org/conference/usenixsecurity25/presentation/spracklen), at least 5.2% of the packages the commercial models it tested suggested were made up, and 21.7% for the open-source ones. An attacker can register one of those names with malicious code in it and wait. The agent imports the package it invented, somebody already published that name, and there's a crypto miner running in production. It works. It demos great. Nobody in that loop knew to look.

Last time I argued an agent can earn trust the way a junior does: a track record, slice by slice, with more rope as the numbers hold. That's operational trust, and it's real. The other kind is the one you give a person: that they'll still care about this thing in two years, pick up the page at 2am because it's theirs, and say so when they're out of their depth. No model ships with that. Owning something takes a someone.

That's what the ladder is for. A stuck agent loop gets an engineer. A change at a one-way door gets a staff engineer. A 2am outage gets an on-call rotation full of people who can read a stack trace. When a product team runs the loop alone, the ladder stops at them. Stuck agent? Prompt it again, and again, with nobody to break the tie. Down at 2am? The escalation path is the same agent, asked more nicely.

The product person doesn't need to become a staff engineer. Their product needs one.
