+++
title = "Building It Isn't Owning It"
date = 2026-11-09T00:00:00Z
description = "Anyone can build an app over a weekend now. Building it was never the same as owning it, and owning it is the part that costs."
categories = ["AI", "Engineering Leadership"]
tags = ["AI", "Engineering Leadership", "Product Management", "Software Architecture"]
layout = "feature"
hero = "sprawl"
+++

In [We've Been "Vibe Coding" This Whole Time](/posts/weve-been-vibe-coding-this-whole-time) I argued that nobody ever read every line, and that the job is building the thing that would notice. This is the other half: what gets built, where it goes, and who's left holding it.

Building got cheap. Anyone in the company can turn a problem into working software over a weekend now, and plenty of them are. Owning it didn't get any cheaper. It's still years of keeping it running, changing it without breaking whoever depends on it, and fitting it in next to everything else. Most of the decisions that matter now happen in that gap, usually by accident.

## "Can we just add it?"

It usually arrives as a link. Somebody in ops, sales or product had a problem nobody had time for, so they spent a weekend with an agent and solved it. There's a demo. It works, and it honestly looks pretty good. The message ends one of two ways: "Can we just add it to the app?" or, more and more, "How do we get this live?" That second one is the question I get asked most by people building with these tools.

They weren't wrong to build it. They felt a real problem and did something about it, which is more than the backlog did. Two days of prompting feels like a lot more progress than filing a ticket and hoping it gets prioritized next quarter. Most of the argument right now is whether people outside engineering should be building software at all. Too late. They can, and they did.

## We've been here before

It used to be called shadow IT.

The Excel macro that reconciles the month-end close. The Access database on a shared drive that quietly became the CRM. The Google Sheet with a script that emails the renewal reminders, the FileMaker app the warehouse runs on, the Zapier chain somebody in marketing built in 2019. Each one was built by the person who felt the problem, often without telling anyone it existed. Each one became important without anybody deciding it should, and landed on IT the week its builder left, as a file named something like `FINAL_v7_REAL.xlsm`.

It isn't always harmless. When JPMorgan settled with the SEC over its 2012 "London Whale" losses, it admitted to deficient controls, [including "spreadsheet miscalculations that caused large valuation errors."](https://www.sec.gov/newsroom/press-releases/2013-187) Nobody sets out to run a bank's valuations on a spreadsheet. It ends up there, one reasonable shortcut at a time.

What changed is the reach. A macro needed somebody who knew VBA, and the worst it could do lived in one workbook. An agent-built app comes with a login page, an API key, a deploy and, if you're not careful, your customers' data. Shadow IT grew up into shadow development, and it brought a database.

It was also a time problem, and still is. Nobody wanted the account manager tuning a macro instead of calling customers. Building it took the builder's own weekend. Owning it takes a slice of every week, from the job they were hired to do, or from an engineering team's roadmap when it lands there instead.

The companies that handled shadow IT well didn't ban it. Banning it never worked; people just stopped telling you. They noticed which ones mattered and adopted them on purpose, before the person who built them left.

## Should it exist?

An agent will build anything you ask for, by lunch, and it will never once ask whether you should.

For most of this industry's history we had two filters we never appreciated. Most people couldn't program at all, and the ones who learned took years to get good enough to ship something real. And building was slow: a half-baked idea had to survive a planning meeting, a quarter of competing priorities, and some engineer asking "wait, who is this for?" Most didn't make it. We complained about the backlog constantly. It was saving us from ourselves.

Both filters are gone. Every build-or-buy call used to be priced in build cost, say three months of a team's time, and that's where most ideas died. Build cost is close to zero now. Ownership cost never showed up in the estimate, and it's most of the bill: every feature you ship is one you maintain, secure, migrate, explain to support, train three departments on, and eventually argue about deleting. Nobody estimates a weekend build. They build it.

So price it before anyone builds. Skip "how long will this take?" and ask "what will this cost us every month for the next two years, and who pays it?" If the honest answer is more than the problem is worth, the right amount of code is none. If it's already for sale, buying it is usually cheaper than owning it.

Take "we should just build our own Slack." An agent will knock out a chat app in an afternoon: channels, DMs, a login, messages saved to a serverless database. Then somebody asks for emoji reactions, then threads, then search that actually finds things, and every one of those lands on whoever built it. Some of the best features are ones nobody asks for. I doubt anyone filed a ticket for huddles, since most companies already had Zoom or Google Meet, and people use huddles anyway. That's a product team deciding what comes next, year after year, and your chat app would need one too.

Underneath it, the bar is a lot higher than "it saves messages." A server can die mid-write and you still can't lose a single message. It has to stay up when the whole company runs on it. Then there are retention policies, legal holds, and whether leadership wants every developer with production access able to read the CEO's DMs with the board. You don't pay for Slack because chat is hard to build. You pay so somebody else owns all of that.

The hosting is the small number. The Vercel bill, the Lovable bill and the extra load on your database add up, but the expensive line is people. Every hour an engineer spends keeping an unplanned app alive is an hour of salary that isn't going to the roadmap. None of that shows up on an invoice, so it never makes the budget.

It compounds, too. The roadmap still has stakeholders waiting on it, and their features slip. The people waiting get tired of waiting, and some of them spend a weekend with an agent and solve it themselves. Now there's one more app to keep alive, and the roadmap slips again.

The backlog is the same math at scale. A dozen people with a thousand items aren't getting to them, and an agent could type its way through all thousand and leave you owning every one. So I let untouched tickets [go stale and close](/docs/product/backlogs). If one matters again, it comes back with fresh evidence and a [problem statement](/docs/product/problem-statements).

Mark Rosewater, twenty years in at Wizards of the Coast, wrote that your audience is "[good at recognizing problems and bad at solving them](https://magic.wizards.com/en/news/making-magic/twenty-years-twenty-lessons-part-3-2016-06-13)." The weekend build is usually a great problem report wearing a solution.

It also skipped the cheapest step in the whole process. Normally an idea gets brought to the team and picked apart before anyone writes a problem statement, opens a design file or writes a line of code. One person has tried it before. Another knows the customer who'll hate it. A third points out it's the same problem as three other tickets. That feedback is most of how you find out whether a thing is worth building. Build it alone over a weekend and you skip all of it, and what you've got is a solution to a problem nobody else is aligned on.

## Where does it go?

Say it's worth owning. When something built outside engineering shows up as "it's done, it just needs to be deployed," that's almost never true, because it doesn't fit anything you already run. The agent picked its own stack, say Next.js on Vercel, and your product is Go on infrastructure you've spent years hardening.

It also follows a style guide that isn't yours, usually one the agent made up: its own idea of how errors get handled, how logs look, how auth works and what a test is. Making the two fit is a rewrite, or a second stack you run forever.

The architecture is the bigger problem. An agent doesn't have taste. It has every architecture ever blogged about, and it'll hand you whichever one the prompt leans toward, with total confidence and very good variable names.

Ask for a feature and it might build you a fully isolated application: its own deploy, its own auth, and a SQLite database, when every other service you run is on Postgres. Now you own two products, and the customer data lives in both.

Or mention "microservices" once in the prompt and you get Lambda sprawl. Every endpoint, job and handler gets its own function, queue, permissions and deploy. Enough features later, you're running thousands of them, nobody can draw the system, and it costs real money just to exist. All you needed was one service with four endpoints.

Or it plugs straight into what you already run, which is its own problem. It'll happily run a report query every thirty seconds against a table that was never indexed for it, or call an internal API a thousand times a second to make the page feel fast. Those systems were sized for the traffic you know about, on a budget that was already fought over. You find out when the database is pegged at 9am on a Monday, an API that's never had a bad day starts timing out for everyone, or the cloud bill comes in higher and finance wants to know why.

It cuts the other way too. The app calls an internal API that was only ever meant for your own frontend. Engineering deprecates it, ships the replacement, migrates every caller they know about, and turns the old one off. One morning the app half of sales runs on is broken, and the first engineering hears of it is a ticket asking why they broke it.

The code is fine in all of these. The tests pass! The agent doesn't know where your boundaries are unless you tell it.

One isolated app is a nuisance. Ten is a mess. Give ten people agents, none of them talking to each other, and you get ten apps with ten logins, ten copies of the customer table and ten ideas of what an order is. Each one works on its own. The pain is between them: data that won't line up, a fix that has to land in ten places, and an outage in one that takes three more down with it because somebody wired them together in a hurry. Any company that's been shipping for a decade has already paid once to merge apps that grew up apart into something one team can reason about. Every agent build from another corner of the company undoes a little of that.

What most products should be running is a [modular monolith](/docs/architecture/service-boundaries), boring on purpose: real seams between modules, each owning its own tables and its own interface, in one deploy. When a piece genuinely needs to scale, ship or fail on its own, you split it out as a service, and that's cheap, because the seam is already there. An agent almost never suggests one unprompted, because "put it in the app we already have" doesn't sound like much of an answer. What used to live in an architect's head now has to reach everyone directing an agent, engineer or not.

## The year-two test

Here's owning something, on a timeline.

Day one is the demo. Week one is the first bug report, and the first wave of feature requests from people who do the job differently from whoever built it. Month two, a CVE lands in a dependency the agent picked. Month four, sales needs a field added, and the change breaks the export that finance runs every Friday. Month six is the first schema migration, on a table that now has real data in it. Year two, the builder has moved teams, the agent session is long gone, and nobody remembers the prompt.

The migration is the one that hurts. A blank database is the easy case, and it's exactly what agents are great at. By month six the whole company uses the app every day, a few customers have it wired into their own processes, and somebody needs it to do one more thing. The feature is small. The change isn't, because the shape the data took on day one doesn't fit anymore. The `status` column needs to become a history. The customer that was one row needs to become an account with many users. The one currency becomes three.

You can't regenerate your way out of that. There's no "start over" when the table holds every record since launch and the app can't go down. You [expand and contract](/docs/database/zero-downtime-migrations): add the new shape next to the old one, write to both, backfill millions of rows without locking anything, move every reader across one at a time, and only then drop what you replaced. Every step has to be safe to roll back, and every step runs while people are using the thing.

Keeping the prompt won't save you either. It isn't documentation. Run it again and you get different code, and neither version carries the decisions behind the first one: why it stores dates that way, which edge case that weird `if` was for, what the customer was promised. A prompt can produce a schema. It takes an owner to change one without breaking everybody standing on it.

Then there's everything that never came up in the demo:

- Who gets paged when it breaks, and [what do they look at](/docs/observability/dashboards-and-alerts)?
- What does it cost to run every month, and [whose budget is that](/docs/operations/cost-and-finops)?
- What data does it touch, and [who's allowed to see it](/docs/security/authorization)?
- How is it backed up, and has anyone [ever restored it](/docs/operations/disaster-recovery)?
- What does it depend on, and who [keeps those current](/docs/development/dependencies)?
- Whose name goes in [CODEOWNERS](/docs/development/code-ownership)?

All of them show up eventually, and the dependency one can show up on day one. Models make up packages: [a 2025 study of 16 models](https://www.usenix.org/conference/usenixsecurity25/presentation/spracklen) found that, on average, at least 5.2% of the packages commercial models suggested didn't exist, and 21.7% from open-source models. An attacker can register one of those names, put malware in it and wait. If an agent installs it, you've got a crypto miner in production, and nothing in that loop knew to look.

A demo answers "does it work?" The year-two test asks "will anyone still be able to work on it?" Only one of those is the job.

## Somebody has to run it

This is what worries me more than any of the code.

Engineers are being pulled toward product: what to build, whether it should exist, how it feels to use. A lot of them would rather just write code, and that's getting harder to get away with. Product is moving the other way, and plenty of PMs and designers are shipping software with these tools. Good.

Those trips aren't the same length. An engineer who learns product is still an engineer, now with better judgment about what to build. A product person who learns to drive an agent can build software, but building it was never the hard part. Somebody still has to own it technically: what it depends on, how it fails, and what to do when it does.

Last time I argued an agent can earn trust the way a junior does, slice by slice, with more rope as the numbers hold. The other kind of trust is the one you give a person: that they'll still care about this thing in two years, pick up the page in the middle of the night because it's theirs, and say so when they're out of their depth. No model ships with that.

That's what an engineering ladder is for: every rung is somebody to escalate to. A stuck agent loop gets an engineer. A change you can't undo gets a staff engineer. A 2am outage gets an on-call rotation full of people who can read a stack trace. When a product team runs the loop alone, the ladder stops at them. Stuck agent? Prompt it again, and again, with nobody to escalate to. Down at 2am? The escalation path is the same agent, asked more nicely.

## How to say yes

None of this is an argument for saying no. The weekend builds will keep coming, and some of them are the best ideas anyone's had all quarter. The answer is a front door, and that's what I tell anyone who asks how to get this live.

Before it goes anywhere near production, and ideally before anyone builds it, write down:

- **A named owner in engineering.** A person, not a team alias, and their manager has agreed to give up the time it takes. The builder can stay the product owner.
- **The problem it solves**, in a sentence, so you can tell later whether it still does.
- **What it touches.** Customer data, money and production credentials each raise the bar.
- **Answers to the year-two questions**, especially who gets paged and whose budget it comes out of.
- **A date to look at it again.**

Sometimes writing those down is enough to answer the question: the owner is "nobody," the data is "everything," and the right move is to buy the thing, for the same reason you don't build your own Slack, or not to do it at all. Otherwise it goes one of two ways. Engineering adopts it: takes the idea, keeps what's good, rebuilds what isn't, and gives it real seams in the product it belongs to. Or it stays in a sandbox, on purpose: no customer data, no production credentials, its own budget, and a date it expires. If it's unclaimed by then, it goes away.

The person who built it doesn't need to become a staff engineer. Their app needs one.
