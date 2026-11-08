+++
title = "Building It Isn't Owning It"
date = 2026-11-09T00:00:00Z
description = "Anyone can build an app over a weekend now. Building it was never the same as owning it, and owning it is the part that costs."
categories = ["AI", "Engineering Leadership"]
tags = ["AI", "Engineering Leadership", "Product Management", "Software Architecture"]
layout = "feature"
hero = "sprawl"
+++

In [We've Been "Vibe Coding" This Whole Time](/posts/weve-been-vibe-coding-this-whole-time) I argued that nobody ever read every line, and that the job is building the thing that would notice. This is the other half: who's left holding whatever gets built.

Building software got cheap. Owning it didn't.

## "Can we just add it?"

It usually arrives as a link, from a department that has never shipped software. Finance, support, the warehouse: it doesn't matter which. They filed a ticket a month or two ago. Nobody said no; the roadmap was full that week, and it still is. So somebody spent a weekend with an agent and solved it. The demo looks good. The message ends with "Can we just add it to the app?" or, more and more, "How do we get this live?"

They weren't wrong to build it. A weekend of prompting beats another quarter of hoping. Should people outside engineering be building software at all? Too late. They can, and they did.

## We've been here before

It used to be called shadow IT. The Excel macro that reconciles the month-end close. The Access database on a shared drive that quietly became the CRM. Each was built by the person who felt the problem, usually after IT said the request couldn't be prioritized. Often nobody else knew it existed, and it became important without anybody deciding it should. By the time its builder left, part of the business ran on it, so it landed back on IT, as a file named something like `FINAL_v7_REAL.xlsm`.

It isn't always harmless. When JPMorgan settled with the SEC over its 2012 "London Whale" losses, it admitted to deficient controls, [including "spreadsheet miscalculations that caused large valuation errors."](https://www.sec.gov/newsroom/press-releases/2013-187) Nobody plans for a spreadsheet to end up in an SEC settlement.

What changed is the reach. A spreadsheet could get the numbers badly wrong, but it never had a login page. An agent-built app comes with one, plus an API key, a deploy, and your customers' data sitting right next to a dependency with a vulnerability disclosed last week. Shadow IT grew up into shadow development, and it brought a database.

The companies that handled shadow IT well didn't ban it, because banning it meant people stopped telling you. They made room instead: real capacity every quarter for the small asks that would never make the executive roadmap, and anything that slipped through got adopted on purpose before its builder left.

They still said no, plenty, but the no came with a reason, and the reason was often news to whoever asked. The app already did it, on a screen they'd never seen. It was on the roadmap, two months out, folded into a bigger project with a codename that meant nothing to them. Something better landed instead, built on what they had. Or, once somebody walked them through it, it didn't make sense. Some got what they asked for and some learned why not. Either way they got an answer and felt heard, and none of them had to build it themselves. A clear no beats a ticket nobody answers. That's a healthy product cycle, and shadow IT grows wherever one is missing.

## Should it exist?

An agent will build anything you ask for, by lunch, and it will never once ask whether you should.

37signals built a whole company on asking. In [Getting Real](https://basecamp.com/gettingreal/02.1-build-less), the book before Rework, they wrote: "Do less than your competitors to beat them." Every feature request, even their own, "[meets a no](https://basecamp.com/gettingreal/05.3-start-with-no)." An agent's default is yes.

We used to have two filters we never appreciated. Most people couldn't program, and learning took years. Building was also slow, so an idea had to survive the team first. In planning, one person had tried it before, another knew the customer who'd hate it, and somebody else had three tickets for the same problem. We complained about the backlog constantly. It was saving us from ourselves.

Mark Rosewater of Wizards of the Coast wrote that your audience is "[good at recognizing problems and bad at solving them](https://magic.wizards.com/en/news/making-magic/twenty-years-twenty-lessons-part-3-2016-06-13)." What shows up is usually a great problem report wearing a solution, and it skipped the meeting where somebody would have pulled the two apart.

Both filters are gone. Build cost, where most ideas used to die, is closer to zero than it's ever been. Ownership cost never made the estimate, and it's most of the bill: every feature you ship is one you maintain, secure, migrate, explain to support and eventually argue about deleting. Nobody estimates a weekend build. They build it.

Price it before anyone builds: what does it cost for two years, and who pays? Hosting is the small number. The expensive line is people. The build took one weekend. Owning it takes a slice of every week, out of their day job or engineering's roadmap. That slice grows with every feature request.

And it compounds: every build that lands on engineering slips the roadmap, and every slip sends more people off to build their own. The tempting fix is to point an agent at the backlog, but that means owning a thousand more things. I'd rather let untouched tickets [go stale and close](/docs/product/backlogs) with a reason, which is still an answer. If the bill is more than the problem is worth, the right amount of code to write is none.

Buying is often cheaper than owning. Take "we should just build our own Slack." An agent will knock out channels, DMs and a login in an afternoon. Then come reactions, threads, search that actually finds the message from March, unread counts that stay in sync across your laptop and your phone, shared channels with your vendors, integrations, and huddles nobody asked for and everybody uses. It's never done: Slack is already solving problems you don't know you have yet. Underneath, it can't lose a message when a server dies mid-write, and somebody has to decide whether every developer with production access can read the CEO's DMs with the board straight out of the database. You don't pay for Slack because chat is hard to build. You pay so somebody else owns all of that.

## Where does it go?

Say it's worth owning. "It's done, it just needs to be deployed" is almost never true, because the agent picked its own stack. It built on Nuxt and Vercel; your product is a React frontend and a Go backend, on infrastructure you've spent years hardening. It made up rules for errors, logs, auth and tests as it went. And instead of using your UI kit, the one somebody spent a year getting right, it copied how your buttons look into fresh Vue components, so they drift the first time the real ones change. Making the two fit is a rewrite, or a second stack you run forever.

The architecture is worse. An agent doesn't have taste. It has every architecture ever blogged about, and it'll hand you whichever one the prompt leans toward, with total confidence and very good variable names.

Ask for a feature and you might get a separate app on Supabase. Claude offered to set up auth there, and "yes" sounded easiest to someone who wasn't sure what auth meant. The new app has never heard of the login you've had for years, the one already wired into your single sign-on, so your users get a second one. The customer data came over once, as a CSV export, and has been going stale ever since. Now you own two products, and nobody can say which one has the right address.

Say "microservices" and you might get Lambda sprawl: every endpoint, job and handler with its own function, queue, permissions and deploy. They still call each other, so every release crawls through them in order or something breaks. It costs real money just to exist, and you needed one service with twelve endpoints. Soon nobody can draw the system, because it's really three systems wired together: one from engineering, one somebody in product built with Claude Code on a personal account, and one the sales lead built on Lovable, running on a company card. Each team skipped the conversation with the other two.

The sales lead's app is the one that plugs into what you run. It calls an internal API a thousand times a second until that API times out for everyone at 9am on a Monday. The API was only ever meant for your own frontend, so after the outage engineering ships a replacement, moves every caller it knows about, and turns the old one off. Half of sales runs on that app by now, and engineering's first word of it is a ticket asking why they broke it.

The code is fine in all of these. The tests pass! The agent doesn't know where your boundaries are unless you tell it.

One of these is a nuisance. Ten, from ten people who never talked, mean ten logins, ten copies of the customer table and ten ideas of what an order is. Each one made sense on its own, because it never had to make sense next to the other nine. Three of them email finance a revenue report, each with a different number, and nobody in engineering knows those reports exist until the board asks which one is right. Nobody holds the whole picture, because there was never a moment where anyone had to.

Most products should be a [modular monolith](/docs/architecture/service-boundaries), boring on purpose: real seams between modules, each owning its tables, in one deploy. When a piece needs to scale or fail on its own, splitting it out is cheap, because the team wrote down where the boundary is, which module owns which data, and how it gets across. An agent rarely suggests one, because "put it in the app we already have" doesn't sound like much of an answer.

Writing it down is the part nobody sees. Engineers owe each other an understanding of the whole system, and pay for it constantly: design docs, reviews, the senior explaining why billing never calls the user service, the manager who notices two teams about to build the same thing. Something built alone never pays that tax. It's the [thinking tax](/posts/the-thinking-tax), owed to the team instead of yourself, and it comes due the day the thing breaks.

## The year-two test

Day one is the demo. Week one brings the first bug report and feature requests. Month two, a CVE lands in a dependency the agent picked. Month four, sales needs a field added, and it breaks the export finance runs every Friday. Month six is the first schema migration, on a table full of customer data. Year two, the builder has moved teams, the agent session is long gone, and nobody remembers the prompt.

The migration is the one that hurts. A blank database is exactly what agents are great at. By month six everyone uses the app every day, and somebody needs it to do one more thing. The feature is small. The change isn't, because the shape the data took on day one doesn't fit anymore. The `status` column becomes a history. The customer that was one row becomes an account with many users. The one currency becomes three.

"Start over" is the expensive option: every record since launch moved into a new shape with the app up, which is the same migration with a rewrite stacked on top. Instead you [expand and contract](/docs/database/zero-downtime-migrations): add the new shape beside the old, write to both, backfill, move readers across one at a time, then drop the old one, every step safe to roll back while people use it.

Keeping the prompt won't save you either. Run it again and you get different code, without the decisions behind the first: why it stores dates that way, what that weird `if` was for. A prompt can produce a schema. It takes an owner to change one without breaking everybody standing on it.

Then there's everything the demo never raised:

- Who gets paged when it breaks, and [what do they look at](/docs/observability/dashboards-and-alerts)?
- What does it cost to run every month, and [whose budget is that](/docs/operations/cost-and-finops)?
- What data does it touch, and [who's allowed to see it](/docs/security/authorization)?
- How is it backed up, and has anyone [ever restored it](/docs/operations/disaster-recovery)?
- What does it depend on, and who [keeps those current](/docs/development/dependencies)?
- Which team goes in [CODEOWNERS](/docs/development/code-ownership)?

The dependency one can bite on day one. [A 2025 study of 16 models](https://www.usenix.org/conference/usenixsecurity25/presentation/spracklen) found that, on average, commercial models made up at least 5.2% of the packages they suggested, and open-source models 21.7%. An attacker can register one, put malware in it and wait. If an agent installs it, you could have a crypto miner in production, and nothing in that loop would know to look.

## Somebody has to run it

Engineers are being pulled toward product, and PMs and designers are shipping software. Good. Those trips aren't the same length. An engineer who learns product is still an engineer, with better judgment about what to build. A product person who learns to drive an agent can build software, but building it was never the hard part. Somebody still has to own it technically.

Last time I argued an agent can earn trust the way a junior does. The trust you give a person is different: that they'll still care in two years, take the page at night because it's theirs, and say so when they're out of their depth. No model ships with that.

That's what an engineering ladder is for. Every rung is somebody to escalate to: a stuck agent loop gets an engineer, a change you can't undo gets a staff engineer, an outage gets an on-call rotation that can read a stack trace. When a product team runs the loop alone, the ladder stops at them. Stuck agent? Prompt it again. Down at 2am? The escalation path is the same agent, asked more nicely.

## How to say yes

None of this means saying no to everything. Some of these builds are the best ideas anyone's had all quarter. When somebody asks how to get one live, I say it needs a front door.

The door is the same product scrutiny every feature has faced, cheap to build or not: should you, why now, and who owns it? Before it goes near production, ideally before anyone builds it, write down:

- **[The problem it solves](/docs/product/problem-statements)**, in a sentence, so you can tell later whether it still does.
- **Who else has it.** Take it to the planning meeting it skipped.
- **Why now.** What it beats on the roadmap, and what the owning team stops doing to make room. Owning it takes at least as long as building it properly would have.
- **An owning team in engineering.** Not one person: one person leaving is how all of this landed on IT the first time. The team's lead agrees to the time, and the builder stays on as a stakeholder.
- **What it touches.** Customer data, money and production credentials each raise the bar.
- **Answers to the year-two questions.**
- **Where it fits.** What it reads, writes and calls, [documented](/docs/development/documentation) where the rest of the system is, with [the decisions behind it](/docs/development/design-docs), so the next person can work out what it is, why it exists and how it works without finding whoever built it. The prompt doesn't count.
- **A date to look at it again.** Maybe nobody uses it anymore, and deleting it is a feature. Maybe it's one of five small builds that are really the same missing feature, and it's time to build that one properly.

Sometimes the list answers itself: the owner is "nobody," the data is "everything," and you buy something or skip it. Otherwise, engineering adopts it, out of capacity set aside for exactly this, and gives it real seams in the product it belongs to. Or it lives in a sandbox on purpose, with no customer data, no production credentials and an expiry date.

If builds arrive faster than anyone can answer those questions, the front door is understaffed. Each build is a ticket the roadmap had no room for, with a demo attached. Count them, take the list to whoever sets the budget, and argue for the people to work through it. Cowboying them into production is how you end up with ten apps and nobody who owns them.

The person who built it doesn't need to become a staff engineer. But every feature and product you ship, theirs included, needs one behind it.
