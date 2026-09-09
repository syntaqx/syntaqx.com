+++
title = "Control Isn't Success"
date = 2026-09-08T19:04:00Z
description = "I walked into a dying CRM rebuild welded to a legacy vendor, turned it into a real platform, and shipped a year early. Then we found out the products were solving problems nobody had, so I started fixing the problem statements myself. That fixed the products and broke everything else."
categories = ["Software Engineering", "Engineering Leadership"]
tags = ["Engineering Culture", "Developer Experience", "Team Velocity", "Leadership"]
+++

When I showed up, there was no platform. There was a CRM being written, and behind it a few years of tech debt with every product bolted to a legacy vendor. The plan was to peel the products off the vendor and stand up a new CRM in its place. Two and a half years budgeted, eight months already burned, and the whole thing quietly dying. You didn't have to squint to see it.

The strange part is it had everything the playbook tells you to want. Agile, scrum, the full kit. Standups, plannings, retros, refinements, a standing meeting for every occasion. Full test coverage. It even had MVPs, if you count building the entire finished product before a single human gets to react to it. (That is not an MVP. That is the whole product wearing a humbler nametag, and nobody was checking.) And it was still going to miss the date, because the two things holding it up were both broken: how fast it could ship, and how the work got decided in the first place.

So I came in with a pivot. Stop calling it a CRM. Build an actual platform underneath, get the products off the vendor, rebuild them loosely coupled on something we owned. And I tore the process down to the studs on the way in. Not because process is evil, but because that process was one of the anchors.

What follows is the half I actually owned: engineering. A lot of it worked, and I want to get it down before I get to the part that didn't, which was never the code and was never really mine to fix.

## Config over convention

The thing I'm proudest of is boring: the engineers built for change.

The bet was simple. The business will want something different next quarter, because the business always wants something different next quarter. So when it did, that wasn't a fire drill. The new requirement showed up as a setting instead of a bug, a checkbox that already existed, because the team had built for the kind of problem instead of the exact one on someone's desk that morning.

That's all "build it right" means once you scrape the LinkedIn off it. Not gold plating. Just not hardcoding today into a wall somebody demolishes in March.

But it only pays off if it runs both ways, and it only ran one. Engineering has to build the knobs, and whoever defines the work has to think in knobs too. My engineers could. Left alone, they reached for the configurable shape every time, the setting that would still make sense in a year. Product couldn't, or wouldn't. Every requirement arrived pre-pinned. Not "users need some way to sort this list," but "put a descending toggle in the top-right of this exact screen." A fixed feature nailed to a fixed spot, handed over like the nail was the point. You can't build for change on top of requirements that got pinned to the wall before they ever reached you.

## Process that earns its keep

The old plan tested everything all the time and treated the full agile ritual like it was load-bearing. It wasn't. So the first thing I did was pull most of it out.

We weren't the no-process cowboys people picture when they hear that. We just wouldn't run process we couldn't explain.

Building a prototype? No tickets. Go build it, show someone, find out if it's worth having. Got a real pile of work now? Start a backlog, because now you'll forget things, and a backlog is a decent cure for forgetting. Planning a whole year? Now estimates matter, because other people are betting on your timeline.

Not every ticket, though. You don't need a number on every card to know where you're headed, and you never will, because there's a bug found every day and a thing nobody saw coming that has to get solved. So we'd get a rough read from architecture on what a quarter could hold, estimate the things that actually moved the shape of the year, and let the rest wash out in the noise it was always going to live in.

Every bit of ceremony showed up the moment there was a problem it solved, and not a meeting sooner. Grooming a backlog that doesn't exist yet isn't rigor, it's cosplay. The engineers could feel that in their bones, which is most of why they were doing the best work of their careers and, weirdly, having fun. Fast and happy weren't two plates I was spinning. Same plate.

## The half I never owned

For all of that, there was a whole other half of the job, and it was the half that mattered most: deciding what to build.

That half lived across a boundary I couldn't reach. Product was its own org, its own leadership, its own scoreboard. The way of working that had my engineers doing the best work of their careers never crossed over. They never ran it, never sat in on it, never seemed to notice it existed. I fixed my side. Their side stayed exactly what it had always been.

So we'd built a system that could bend a hundred ways, and everything it got fed pointed in exactly one. Ask what a request was solving, who else leaned on it, or what it needed to become in a year, and you got a blank look. Ask which users needed it and the answer was "the users." Which users? "The users." Cool. Extremely actionable.

You know the Simpsons bit. Homer's long-lost brother hands him a car company and says build a car for the average guy. Honestly, a fine problem statement. Then he makes the fatal move and lets Homer fill it in feature by feature. Three horns that all honk La Cucaracha. A soundproofed bubble dome for the kids in back. Tail fins. Shag carpet. A cup holder the size of a bucket. Every request built exactly to spec, and what rolls off the line is an $82,000 monster that sinks the company. Each piece is precisely what he asked for. Together they're a horror, because the frame got said once and then abandoned, and after that it was just parts stacking up until they crushed the business.

That's a problem statement used as a formality instead of a spine. "A car for the average guy" should have decided half those calls before anyone picked a horn. Drip-feed the features instead and you get the Homer.

And no, the magic isn't the phrase. "CRM" was a keyword too, and it's the first thing I threw out, because naming the thing you think you're building tells you almost nothing about the problem under it. Clarity comes from understanding what the person on the other end is trying to get done, why it matters to them, and everywhere else they're trying to get it done. "Put a button on the right side of this page" isn't that. It's a spec for a page that's existed for three hours, and it falls apart the second you notice page three needs the same button for the same reason.

A real problem statement doesn't shut product up, either. It opens the right questions instead of the wrong ones. What color? Sunroof or not? How many cup holders is too many cup holders? Ask away. Those are details, and they're welcome, because a detail lands inside a frame you already share. "Where does the button go" tries to set the frame from outside, and usually sets it wrong.

## We shipped, and the products were wrong

Fourteen months in, we shipped a working platform. The one the old plan had booked two and a half years for and was going to blow anyway. As engineering, it was a flat win: new architecture, new way of working, a from-scratch build that landed on a date people had written off.

Then people started using it, and the products were wrong.

Not buggy. Wrong at the foundation, across multiple domains. In one case a single piece of functionality that four different user groups depended on, defined by consulting exactly one of them, and not as a starting point either. As the whole picture. So we shipped something lovely for a quarter of the people who'd touch it and quietly broke the assumptions of the other three. They opened it, thought some flavor of what is this, and slid right back to the spreadsheet they'd been running on the side the whole time.

You can't QA your way out of that. The code was fine. The premise was busted, and the complaints coming in were fair. That's the job.

So I did the thing that felt like heroics at the time. I didn't just patch what people were pointing at. I went back to the problem statement itself and reworked it. I dug up what had actually gone wrong at the definition layer, and once I could do that, we stopped needing to ask anyone what the thing was supposed to be. We could work it out from the data, the users, and the mess in front of us. We rebuilt on the corrected problem, and the products finally had the right bones.

Great, right?

## Control isn't success

That is exactly when everything got worse.

Because the real thing product held, the thing under the job title, was ownership of the definition. They said what "right" meant and everyone built toward it. When I reworked the problem statements myself, I took that. Not on purpose. I was just trying to ship a product that wasn't wrong. But the better the rebuilds landed, the less anyone needed them to define anything, and you could feel the floor move.

The irony still gets me. The doomed plan they were running when I showed up, marching straight at a missed deadline, they'd have called that working, because they were in control of it. A platform that shipped, ran stable, and defined itself without them read as broken. Same meter, flipped inside out. The only gauge that had actually moved was their grip, and that had gone to zero.

So let me just say it. Product's job is to align the teams on the problem. That's the work. This team did project management with a product title on it. They lived in the how and the when, the specific screen and the specific field, micromanaging delivery instead of owning the problem. Survivable, in a grim way, as long as they controlled the delivery. The day engineering started getting the problem right on its own, they lost the control and still weren't doing the product part. That's the doom loop: trade problem-definition for project-control, lose the control, and there's nothing underneath.

## Nobody files that ticket

Somewhere in there, the word RACI showed up. Responsible, accountable, consulted, informed, a whole grid of who's allowed to do what. And I believe this all the way down: a team that needs a RACI is a team that isn't aligned on the problem.

Two founders in a garage don't reach for a RACI. Fifty people actually playing for the same team don't either. You reach for one when you feel like you've lost control and you want a document that hands it back. That's not alignment. It's a fence with names on it. And when your product is live and wrong and sitting in front of users, you don't have three months and an approval matrix. You fix it now.

Here's where I actually blew it, though, and it's got nothing to do with the grid.

Once the products were obviously right, the complaints couldn't be about the products anymore, so they found a new target. Who approved this. Who signed off on that. Since when does engineering get to decide. A design call that could've gone three ways and landed the same became a referendum on whether I'd overstepped. The nitpicks turned into little trials and I was the defendant in every one.

I ran it like a help desk. Forty-some notes on the exact shade of one button, from people who'd said nothing back when it was the wrong button entirely, and I sat there working through them one at a time like I had a quota. Each was nothing by itself, so I treated the whole pile like nothing.

That was the miss, and it stings worse than a people problem, because pulling signal out of noise is the one thing I'd spent a year insisting I was good at. I stood in the clearest signal of my career and filed it under grumpy. It was never forty small complaints. It was one big one, chopped small enough that nobody had to say it out loud. "I don't get to decide what we build anymore" is not a ticket you can file, so it came out as everything else. The labels, the flows, the process, and eventually me.

## What I'd do again

I'm not going to sit here wronged, because I mostly wasn't. I built something I still think was right, and getting it right happened to strip a kind of authority off people who had no clean way to say that's what actually stung. So it came out sideways, and a lot of it came out at me. In their shoes, I'm not sure I'd have been more graceful about it.

The fix isn't "be nicer," and I want to be clear about that, because the tidy version of this ends with me learning kindness, and that's not the lesson. Kindness wasn't the missing piece. Attention was. I had thousands of comments leaning the same direction and I answered each one solo instead of reading the shape. When someone keeps grinding on things that don't matter and then starts grinding on you, that's the signal. It usually means the thing that does matter is something they can't, or won't, put on the table.

I'd build the platform the exact same way. Defined problems, config over convention, process that earns its keep, engineers close enough to the data to fix the question and not just the answer. All of it again.

I'd just clock, a lot sooner, that the day you start getting the definition right yourself, you're not only shipping better products. You're taking something. And the people you take it from won't file a ticket that says so. They'll file a thousand that don't, and sooner or later some of them will have your name on them.
