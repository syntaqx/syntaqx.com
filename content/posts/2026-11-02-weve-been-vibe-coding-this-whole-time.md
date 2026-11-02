+++
title = "We've Been Vibe Coding This Whole Time"
date = 2026-11-02T00:00:00Z
description = "Every promotion has moved you further from the code, and the company has shipped anyway. Leadership set direction and managed outcomes. That's your job now."
categories = ["AI", "Engineering Leadership"]
tags = ["LLMs", "AI in Development", "Engineering Culture", "Software Quality"]
layout = "feature"
hero = "stamp"
+++

Andrej Karpathy coined "vibe coding" in [February 2025](https://x.com/karpathy/status/1886192184808149383): a new kind of coding where you "fully give in to the vibes, embrace exponentials, and forget that the code even exists." He meant throwaway weekend projects. It didn't take long to become an insult. Vibe coders don't read their code. Vibe coders ship things they don't understand. Vibe coders are the reason your on-call rotation is about to get very interesting. You've heard the tone: the same one people use for "they're really into crypto now."

Under the sneer is a real argument: if you didn't read every line, you shouldn't ship it. I've [made that argument on this exact blog](/posts/growing-together-in-the-age-of-llms). But the better the models get, the more I think about how every company I've worked at actually shipped software, long before any of us had a model to blame.

Every promotion in this industry moves you further from the code, whether you want it to or not. A senior engineer reads most of it. A staff engineer reads the scary parts. Managers and directors read more Jira than code. A CTO reads dashboards. That's the job at any real scale. One person can barely keep up with twenty engineers. At fifty, forget it. At two hundred, or two thousand, it's impossible. Leadership sets direction, manages outcomes, and builds the guardrails that catch what nobody read.

The company shipped anyway. For decades. Some of that code is running your bank right now, and some of it was written at 4:55 on a Friday by someone who has since left to start a kombucha company.

An agent isn't an engineer, and I'll get to where the comparison breaks. The point is how we oversee the work, not who's doing it.

We've been vibe coding this whole time. We just called it delegation and drew it as an org chart.

## Nobody read every line

Walk a feature to production at a perfectly normal company, any year you like before 2023.

Product writes a ticket. It's mostly a screenshot with a red circle on it. An engineering manager gets it first, complains in a comment that there are no acceptance criteria, and writes them. After sprint planning, a mid-level engineer picks it up and builds it. A third of the code is adapted from a 2014 Stack Overflow answer. (No judgment. It was working code.) Another third executes a function from the file next door, written by the guy who left eight months ago.

A senior engineer reviews the diff: two comments about naming, one "nit:" resolved without a word. A staff engineer gets tagged because it touches billing, reads the billing part and skims the rest, because the rest of the codebase works. Mostly. Then the tech lead approves the approval. "LGTM" is a load-bearing acronym, and a healthy number of them mean "looks good to whoever looked at it before me."

It merges. Well, it merges after three other pull requests land on main first, one of which changed that function from the file next door in a way nobody mentioned. Your tests still pass, so in it goes. It deploys. The CTO finds out when a number on a dashboard moves.

Nobody in that chain read every line, and nobody was supposed to. Each of them trusted something: the person before them, the tests, the type checker, the compiler, the fact that it ran locally.

The scrutiny runs downhill, too. A junior's pull request gets the deepest review in the building, and it should, because review is half of how they learn. Flip it. It's 2am, production is down, and your Principal Engineer posts in the incident channel that they found it and they're pushing a fix. How hard is the on-call reading that diff? Be honest. It's approved before CI finishes. We call that trust. It's really reputation, and reputation is usually right, right up until the night it isn't.

When it did go wrong, nobody I've worked for responded by having the CTO review every pull request. They wrote a [postmortem](/docs/operations/incident-response), added a test, tightened a check, and went back to asking what they'd always asked: did it work, did it ship, did the number move.

## Trust was a track record

Every engineering org has an answer to this, written down or not: can a junior approve another junior's work?

Usually, no. Neither has seen enough things break to know where to look. Two seniors, though, can ship with nobody else looking, and nobody loses sleep. They're wrong all the time. They've just been wrong in front of you often enough that you know roughly how, and how often.

Which seniors, though? The one who started last week and the one who's been here five years have the same title and the same approve button. You don't trust them the same, and you shouldn't.

You trust someone exactly as far as you can predict their mistakes. Every review rule, every [CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners) file, every "two approvals on anything in `billing/`," is a trust policy wearing a YAML costume. The track record behind it lived in people's heads.

The tests were part of that record, and they were worse than we admitted. I've reviewed plenty of human-written tests that existed to drag coverage from 78% to 80% before a deadline. Tests with no assertions. Tests named `test_it_works`. We got a little green badge in the README for it.

Coverage was never a quality metric. Google's testing team says it plainly: coverage is great at telling you [what isn't tested](https://testing.googleblog.com/2020/08/code-coverage-best-practices.html), and says very little about whether what is tested is right. To find out whether your tests catch anything, break the code on purpose and see if they notice. That's mutation testing, and it's the first thing I reach for when I [measure test quality](/docs/quality/metrics).

The good tech leads knew where to look anyway. With a junior's pull request, they read the tests harder than the code, because the assertions are the spec. If the test asserts the refund goes back to the original card, I care a lot less how the forty lines above it got there. If it says `expect(result).toBeDefined()`, I don't care how pretty those forty lines are.

## Knowing when to ping the architect

Every company I've worked at had someone like an architect: principal, staff, chief something, whatever the ladder called it that year. They weren't on every pull request. If they had been, nothing would have shipped, and they would have quit.

They got pulled in for a new service, a change to the one service that's been quietly stable for a year, a three-year vendor contract with a termination clause written by someone who hates you. Or they pulled themselves in: skimming merged PRs over coffee, noticing three teams had each built their own rate limiter this quarter, two on Redis and one on the database, each counting slightly differently, and showing up with a doc before it became an incident.

Everyone below them needed the matching skill: knowing when to ping the architect, and when not to. Ask about every variable name and you burn the architect out. Never ask and you ship a second job queue.

The good engineers built up a feel for all of it, and the feel came down to reversibility. Bezos called it [one-way and two-way doors](https://www.sec.gov/Archives/edgar/data/1018724/000119312516530910/d168744dex991.htm). Most decisions are two-way: get it wrong, back out, try again. A schema with a billion rows in it isn't. Neither is a public API, a payment flow, a data deletion, or anything with the word "migration" in it.

That's what we now call human-in-the-loop. Nobody invented it in 2024. The loop was just made of people.

## Then the typing got cheap

Typing the code was always the most visible cost in that chain, and it just got cheap. Not free, but close: hand an agent a well-described task and it'll knock it out. It'll build the wrong thing just as happily, too.

Karpathy's version was "forget that the code even exists." No good CTO has ever forgotten the code exists. They just don't read it, because everything built around the lines reads it for them: review, CI, types, tests, monitoring, on-call, postmortems, and the one senior engineer who can smell a bad migration from across the building.

So the question that matters was never whether a human read it. It's whether anything would catch it if it were wrong.

Ask what scares people about models and the first answer is "the quality of the code," usually from people who never measured their humans' code quality either. Push a little and the real fears come out. Nobody kept the model's track record. Its mistakes don't look like a human's, so your reviewing instincts don't fire. It's brilliant on Tuesday and baffling on Wednesday on the same kind of task.

None of that is "the code is bad." It's "I can't predict how it's bad," which is a measurement problem: the track record we never wrote down, coming due.

## This is DevOps

Measurement is the one problem this industry knows how to solve. We called it DevOps.

You trust a deploy because the pipeline checks it twice. Before anything ships, the build goes green and the test suite passes. Once it's live, smoke tests run clean against the real deploy, [synthetics](/docs/observability/frontend-and-synthetic#synthetic-monitoring) keep walking the critical flows every few minutes, the canary takes traffic, error rates and latency hold, and nobody rolls back. [DORA's metrics](https://dora.dev/guides/dora-metrics-four-keys/) exist so leadership can know how delivery is going without reading every change.

So point the same machine at your agents. It's less work than it sounds. Tag every change with who, or what, wrote it (plenty of agent tooling already adds a co-author trailer to the commit), then slice the numbers you already collect by author and by area. Change failure rate, reverts, escaped defects, review rounds, how often a human caught something the agent missed.

Now trust has a shape. Maybe the agent's UI changes fail less often than your juniors' do, and its billing changes fail way more. Let it merge UI changes on green and require a senior on billing, the way you'd give a junior more rope as they earn it. Autonomy stops being an argument in Slack and becomes a policy that follows the data, and tightens itself the week the numbers turn.

Read those numbers honestly, though. Agents get the easier tickets, so compare like with like. A human quietly fixing the agent's work in review is a save, not a pass, so count it against the agent. And an architectural mistake won't show up in change failure rate for months, so give slow failures time to land before you hand out more rope. A green dashboard only says it hasn't broken yet.

## Who clicks approve

Follow the data far enough and you reach the question people flinch at: why can't an agent approve and merge another agent's work? Take a one-line fix with a failing test that now passes. If the reviewer is a different model in a different session, the tests are real, the change stays off the one-way-door list, and the numbers say this kind of change almost never fails, what is a human adding by clicking approve? Latency, mostly. They were going to skim it anyway.

The different model and the fresh session matter for the same reason you don't approve your own pull request: you can't see your own blind spots. A reviewer in the same session is the engineer who pair-programmed the change and then approved it: they watched every line get written and were talked into it long before the pull request opened.

Sometimes the loop never ends: the reviewer flags something, the writer fixes it and breaks something else, and around they go, like two very polite people stuck in a doorway. When it won't converge, it's usually because nobody wrote down what "done" looks like. Stop the loop and pick it up yourself.

And yes, AI-written tests will mock the function under test, or edit the assertion to match the bug and report, cheerfully, that everything passes. It's `test_it_works` with better throughput, and the fix is the old one: read the tests harder than the code.

Then make it show its work, the same way you'd ask an engineer to. "It works" isn't evidence. Screenshots of the change in the PR are. Better yet, have the agent record itself using the feature, clicking through the flow it just built, and attach the video. If it can't demo the thing, it didn't finish the thing.

The part that makes people nervous is work nobody started. Support files a bug. An error spike after a deploy files another. Dependabot opens the [major version bump](/docs/engineering/dependencies) that used to sit for a month because the changelog said "breaking changes" and nobody had an afternoon. An agent picks it up, reproduces it, writes the failing test and fixes it, and a different agent reviews it. If the numbers say that kind of change is safe, it merges on green, and a human first hears about it in the changelog.

Some tickets aren't fixes at all. "Make the export work differently" is a product decision filed as a bug, and it waits for a person: the agent writes up a plan and waits for a yes, or the reviewer hands you a preview environment and a question instead of a merge.

It's an on-call rotation that never sleeps. Like the human one, it needs an owner for every queue it pulls from and a track record that widens what it can do alone. But engineers built up a feel for when to ping the architect, and agents don't have one, so you write it down: which changes need a human, which can merge on green, which files nobody touches without asking. A line in a config file, or [an instruction the agent actually reads](/docs/engineering/ai-assisted-development).

## Where the analogy breaks

**Agents don't learn from getting yelled at.** A junior who takes down production learns that whole class of mistake. They'll tell the story at their retirement party. An agent will make the same one again tomorrow. The model itself does get better, but in jumps, when the next one ships, and the new one might fix your old mistake and pick up one you've never seen. Between jumps, the only lessons that stick are the ones written down outside it. So tighten the guardrails until the mistake is impossible: a test, a lint rule, a check in CI, a line in its `AGENTS.md`. Every postmortem used to end with a human who learned something. Now it has to end with a commit.

**The volume is different.** A junior opens one to three pull requests a week. An agent can open more than that before lunch, and humans with too much to review start approving things. A 2,000-line diff gets the same "LGTM" as a 20-line one, just faster. If your plan is "we'll review all of it carefully," you don't have a plan. You have a backlog.

So hold agents to the rule we've always held people to: [changes small enough to review](/docs/engineering/commits-and-reviews#pull-requests). We learned to ship in iterations because a small change can actually be read, actually be tested, and actually be rolled back on its own. An agent will cheerfully do the whole feature in one heroic diff if you let it. Don't. Ask for the same work in steps, each one merged, deployed and verified before the next one starts.

**Agents are wrong with a straight face.** A nervous junior hedges in the PR description and puts "I think?" at the end of things. An agent sounds exactly as sure about the broken thing as the working one. You lose the tell, so the guardrails have to become the tell.

**You still own it.** "The agent did it" is "the intern did it" in a new hat. When production is down for six hours, the CTO owns that outage, and nobody in the board meeting cares that they never read the diff. Even if the robot wrote it, approved it, merged it, deployed it and walked away, somebody set the policy that let it, and that somebody owns it.

**Somebody still has to become senior.** The junior writing the boring code was also learning how to become the senior who knows where the bodies are buried. If agents write all the boring code, that path has to be rebuilt on purpose. I've written about [what goes missing](/posts/the-thinking-tax) when the tool does the thinking first, and I don't think anyone, me included, has solved this one yet.

## You're a director now

Every engineer now has the leverage only managers and directors used to have, on an AI budget instead of a headcount one. You describe an outcome, something else does the typing, and you judge the result. That judging is why it still takes an engineer: knowing it's right today, and that it'll still be right in six months, when nobody remembers the prompt.

The time you save on typing should go first to the part most teams under-built: the guardrails, the boring infrastructure that made delegating work in the first place. It was always the work nobody had time for, because the feature was due Friday. For once you have the time: while one agent builds the feature, point another one at the guardrails.

Before anything, human or otherwise, merges without me reading it, I want the boring stuff to be fast: tests that actually fail, [CI](/docs/delivery/ci-pipelines) measured in minutes, and continuous delivery with smoke tests against the real deploy. I want being wrong to be cheap: rollbacks nobody is afraid to press, feature flags so shipping the code and turning it on are two different decisions, and a [Chaos Monkey](https://github.com/Netflix/chaosmonkey) habit of breaking production on purpose while everyone's awake. And I want everyone to stop pretending staging is the real thing. [It was always a polite fiction](/docs/quality/test-data#why-shared-staging-decays), with a tenth of the data and a config file nobody's diffed against prod since the Obama administration. [Test in production](/docs/quality/release-readiness), carefully, with [real QA](/docs/quality/exploratory-testing) walking the flows by hand.

That last one is where agents get fun. Turn one loose in a browser with no idea what the happy path is supposed to be, and [watch where it chokes](/docs/quality/ai-assisted-testing). Wherever it gets stuck, a customer will too, so write a Playwright test that asserts what should be true. Then send the agent back every night, like a new customer who never learns the shortcuts, and read what it found confusing.

With the guardrails in, you inherit the rest of what the architect and the CTO used to carry. That's every engineer's job now.

## It was always the job

So no, I'm not losing sleep over code nobody read line by line. Nobody ever did. The job is instrumenting the work so it gets human eyes when it needs them, and adjusting those controls as the models change, the same way you do as a mid-level grows into a senior. This industry has always run on trust, review and guardrails. When those were good, it worked. When they weren't, we wrote a postmortem.

What changed is who's at the top of the chain. Getting there used to take a decade of promotions and a calendar full of skip-levels. Now it takes a terminal, and the judgment you used to earn on the way up.

So it's you now. Congratulations on the ~~promotion~~ new responsibilities. Set the direction, and let go of the lines. You don't have to read every one of them. You just have to build the thing that would notice.
