+++
title = "Growing Together in the Age of LLMs"
date = 2026-05-10T00:00:00Z
description = "AI made the code part easy. The judgment behind it still has to come from somewhere."
categories = ["AI", "Software Engineering"]
tags = ["LLMs", "AI in Development", "Software Engineering", "Career Growth"]
+++

Over the past year, I've had a lot of solutions brought to me by people outside of engineering. Prototypes, internal tools, even customer-facing features. Working code, demo-ready, built fast. And honestly, every time, I'm impressed. These are smart people solving real problems with tools that would have felt like science fiction five years ago.

Then I start asking questions. Why this algorithm? Blank stare. *What algorithm?* Where is this field on the user card actually coming from? Because it isn't in the database today, and getting it there means a schema change, a backfill across two hundred million rows, and a migration plan that doesn't take the product down on the way through. How does this fit the auth model we already have? What happens when the service it depends on goes down? What happens six months from now when the requirements shift, as they always do? The conversation usually stalls there, because those weren't questions the tool surfaced. Why would it? It built exactly what it was asked to build, against a UX someone designed in isolation from everything we already have.

The gap is in knowing what to ask for. And it shows up on both sides of this. Non-engineers are shipping things without the experience to recognize what they're committing the rest of us to. Engineers are shipping things without the scrutiny to catch what the model just committed *them* to. Same gap, different cause: one side never built the instinct, the other is letting it atrophy. This piece is about both.

## The trap

There's a growing fixation on the idea that engineering is becoming obsolete because non-engineers can ship software now. I get where it comes from. When you can go from idea to working app in a weekend, it's fair to wonder what the engineers were spending all that time on.

It's a bit like building a model airplane and concluding you're ready for commercial aviation. The thing flies. It looks right. It just wasn't built to carry passengers through turbulence at 30,000 feet.

That's not a knock on the people building these things. They're doing exactly what you'd hope: using powerful tools to solve real problems. The issue is the distance between "it works" and "it works in production, at scale, when things go wrong, alongside everything else we're running, and we can still change our minds about it next quarter without rewriting half the system." That distance is invisible until you've crossed it a few times, and crossing it is most of what an engineering career actually is.

Non-engineers have no reason to be suspicious of what the tool gave them. They've never watched a missing index take a payments service offline. They've never seen a "small" config change cascade into a 3 AM outage. They've never had to unwind a decision that was reasonable on day one and load-bearing by day ninety. The paranoid questions you learn to ask come from a decade of incidents, and you can't download that by prompting harder.

I'm not saying this to gatekeep. I'm saying it because the tool skips those lessons constantly, and it skips them for me too. We've had real incidents caused by senior engineers making the exact same class of mistake. Why would anyone's first vibe-coded project be free of them? But when you point it out, people hear it as an attack instead of a code review. That's the hard part of this dynamic. The feedback feels personal because there's no shared frame for why it matters. They've never been on the other side of the problems the feedback is trying to prevent.

## Architecture answers are only as good as the context behind them

People ask LLMs about architecture all the time, and the model will engage, confidently. The trouble is that the answer comes back specific and assured without any of the context that would actually make it the right one.

The foundation is what gives you the right to build amazing things later. It's also what gives you the right to change your mind. Every interesting product I've worked on lived long enough to become something different than what it was originally scoped as. Sales pulled it one way, customers pulled it another, the data model from year one stopped fitting the business in year three. The teams that survived that without grinding to a halt weren't the ones with the cleanest first version. They were the ones whose architecture left room for the second, third, and fourth version they didn't know they were going to need.

That kind of decision isn't a code problem, it's a context problem. The model doesn't know which integrations are strategic and which are throwaway. It doesn't know which team owns the service you're about to couple yourself to, or that they're three months from deprecating it. It doesn't know that the "quick" thing you're asking it to wire directly into the request path is the thing you'll most regret in eighteen months. So when you ask "should I do A or B," you get a confident answer based on the slice of the problem that fit in the prompt, and none of the things that should have made it C.

That's what makes LLMs a great rubber duck and a dangerous decision-maker. They'll talk through a problem all day, surface options you wouldn't have considered, argue against a design if you ask them to. That's genuinely valuable, and most of how I use them. But a rubber duck doesn't get to pick. The moment you let the model pick for you, you've outsourced the part of the job that decides whether you can still move in two years, and you've done it on the basis of context the model never had.

## Engineers fall into a quieter version of this

It's tempting to make this a non-engineer problem. It isn't.

Think about how you actually learned the things you know. It wasn't from documentation. It was from spending two hours debugging something that turned out to be a race condition. It was from running a migration that locked a table and watching your error rate climb. The mental model stuck because you struggled with it.

When an LLM hands you working code in 30 seconds, that loop gets cut. You ship, it works, you move on. Do that enough times and gaps start showing up, not in your output but in your understanding. You can build the thing. You can't always explain why it works or predict where it'll fail. And when it does fail, you reach for the LLM again to diagnose a problem it can't see end to end.

I've watched this play out in incidents. Something breaks, an engineer asks the AI to explain the error, gets five plausible answers, tries each one, none of them work. The bug isn't in the code. It's in the interaction between the code, the infrastructure, a data shape that changed after last week's migration, and the monitoring gap that let it run for three days before anyone noticed.

The person who solves that is the one who understands the system end to end. They know what the query planner is doing. They remember the last time this service behaved this way and what the actual cause turned out to be. That knowledge isn't promptable. It's built up by paying attention, getting burned, and not making the same mistake twice. I [wrote about this last year](/posts/2025-02-03-evolution-of-software-engineering): the code was never the hard part. The hard part was always the thinking around it, and that's the part the LLM still leaves on your desk.

## Staying sharp

So how do you keep growing when the tool keeps getting better at doing the work for you? The answer I keep coming back to is to be intentional about where you let the tool carry you and where you make yourself walk.

When AI writes something for me, I read it before I ship it. Really read it, the way I'd read a junior engineer's PR. Could I have written this? Do I understand why it made the choices it did? If the answer is no, that's my study material.

I try to debug without AI for the first twenty minutes or so, enough to form a hypothesis before I ask for help. Even when I'm wrong, I've engaged with the system in a way that builds intuition. And sometimes I'm not wrong, which is worth more than anything the tool would've handed me.

When I do use it on design questions, I make it argue against its own answer. What breaks this? What does it lock us out of? What does the version of this we'd hate in a year look like? Optimistic answers are fine as a starting point and a terrible place to stop.

Once in a while I'll do something with no assistance at all. No copilot, no autocomplete, just me and the docs. It's slow and humbling, and that's the point. And I keep building things I'll never ship, where I can try approaches I'd never risk in production and find out what I actually understand versus what I've been borrowing from the tool.

## A snapshot, not a verdict

Everything above is a description of where things are right now, and the landscape moves daily. There's a plausible near-future where most of the code-quality problem is solved by orchestration: one agent writes, another reviews, another checks security, another validates performance. You push a branch and a swarm of reviewers finds the issues before a human looks. We're not far from that.

Even in that world, the hardest problem in software still isn't writing correct code. It's deciding what to build when the people asking for it disagree with each other. Sales needs a feature that contradicts what Product scoped last quarter. The CEO saw a competitor's demo and wants "that, but better" by next month. None of them are wrong, they're each solving for their own corner of the business, and the LLM can't reconcile that for you because it can't see any of it.

The engineering job is absorbing all of that without the system falling apart, and sometimes the right answer is to push back and not build the thing at all. AI does what you tell it to do. The skill is knowing what to tell it, knowing what not to build, and recognizing when "this is fine for now" is going to cost you a year of rework later. That instinct comes from shipping the wrong thing and living with the consequences. I don't see a shortcut to it coming anytime soon.

## Growing together

Keep using the tools. Grow with them. Stay ahead of them. The engineers who'll matter most in five years aren't the ones who refused to use AI. That's just stubbornness. They also aren't the ones who handed everything to AI and stopped thinking. That's the trap I'm describing. They're the ones who used AI to move quickly through the routine and kept going deep on the parts that decide whether the system survives the next pivot.

And if you're not an engineer but the tools have made you dangerous in the best sense, keep going. Build the prototype. Bring the demo. Just bring it to the engineers earlier than feels necessary, with the assumption that the version that ships is going to look different from the version that proved the idea. That's not gatekeeping, it's how the thing actually survives contact with everything else we're running.

Good engineering was never really about the code. It was about solving problems in a way that keeps you running for years, and lets you keep iterating on the product without getting handcuffed by the architecture you shipped on day one. That hasn't changed. The tools got faster. The judgment, on both sides, is still ours to build.
