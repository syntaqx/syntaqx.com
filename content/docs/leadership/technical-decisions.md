+++
title = "Technical Decision-Making"
nav_title = "Technical Decisions"
description = "Who decides what, how much process a decision deserves, driving to a decision with a named owner and a date, and disagree and commit when you lose."
category = "Leadership"
order = 1391
tags = ["leadership", "decisions", "process", "architecture"]
+++

Most engineering organizations don't fail because they make bad technical decisions. They fail because they make them slowly, implicitly, or twice. A choice nobody owns gets relitigated in every meeting; a choice nobody wrote down gets reversed by the next person who didn't know why it was made. The job of a technical leader is less about being right and more about making sure decisions get made, by the right people, at the right weight, and stay made.

## Match the Process to the Door

The most useful question about any decision is how expensive it is to undo. Jeff Bezos's [2015 letter to shareholders](https://www.sec.gov/Archives/edgar/data/1018724/000119312516530910/d168744dex991.htm) names the two kinds: "one-way doors", consequential and irreversible or nearly so, and "two-way doors", which are changeable and reversible. His point, and mine, is that organizations get this backwards in both directions: they run heavyweight review on choices they could undo next week, and then make the truly irreversible ones casually because "we decide things fast here".

| Door | Examples | Who decides | Process |
| ---- | -------- | ----------- | ------- |
| Two-way | A library inside one service, an internal API shape, a test strategy | The person or team doing the work | Decide, note it in the PR, move on |
| Somewhat sticky | A public API contract, a new service boundary, a shared data model | The owning team, with the people it affects consulted | A short [design doc](/docs/engineering/design-docs) |
| One-way | A primary datastore, a vendor you'll be locked into, a security model, deleting data | A named senior decider, after real review | Design doc, explicit alternatives, sign-off |

Two-way-door decisions should be fast and made close to the work. Requiring approval for them doesn't make them better; it teaches people to stop deciding, and it turns senior engineers into a bottleneck for choices they have the least context on. The care belongs where the cost of being wrong can't be undone.

The trap is misclassifying. "We can always migrate later" is said about a lot of databases that are still in production a decade on. When in doubt, ask what it would cost to reverse in a year, with the data and integrations that will exist by then, not what it costs today.

## Every Decision Has a Decider and a Date

The most common failure in technical discussions isn't the wrong answer. It's no answer: a thread that grows for three weeks, a meeting that ends with "let's think about it more", a doc with forty comments and no conclusion. The cost is invisible because nobody pays it at once; the team just quietly waits, or builds on assumptions that may not survive.

Before a discussion starts, settle two things:

- **Who decides.** One named person, not "the team" or "the architects". Everyone else's job is to inform the decision; theirs is to make it. A group can decide by consensus on small things, but a group can't be accountable, and accountability is what makes a decision stick.
- **By when.** A date, chosen by asking what waiting costs. If the answer is "nothing", the decision can wait. Usually the answer is that someone is blocked.

Bezos makes the companion point in his [2016 letter](https://www.aboutamazon.com/news/company-news/2016-letter-to-shareholders): most decisions should be made with "somewhere around 70% of the information you wish you had". Waiting for 90% is usually slower than being wrong and correcting, especially for two-way doors. The decider's job is to recognize when more information won't change the answer.

## Consent Over Consensus

Consensus asks "does everyone agree this is the best option?", and on any interesting question the honest answer is no. Teams that require it either stall, or reach a mushy compromise that nobody actually believes in.

[Consent](https://patterns.sociocracy30.org/consent-decision-making.html) asks a smaller question: is this "good enough for now and safe enough to try"? An objection then has to show a risk worth avoiding or a concrete way to improve the proposal, not just a preference for a different option. That's the bar I use for most team decisions. It moves faster than consensus, it still surfaces the objections that matter, and it fits two-way doors well: if it turns out wrong, you'll change it.

## Disagree and Commit

Once a decision is made, everyone executes it as if it were their own, including the people who argued against it. That's what "[disagree and commit](https://www.aboutamazon.com/news/company-news/2016-letter-to-shareholders)" means, and it only works if two things are true:

- **The disagreement was heard.** Commitment can't be demanded from someone whose objection was ignored. Record the dissent in the design doc, with the reasoning, so it's visibly part of the decision.
- **Commitment is real.** Half-hearted execution, "I told you so" when something goes wrong, or quietly building the other option is worse than either choice. If new information appears, bring it back as new information, not as the old argument again.

It applies to leaders too. Some of the most useful signals I give a team are the times I say "I'd have done it differently, it's your call, and I'm in."

## Write It Down

A decision that isn't written down will be made again, usually by someone who wasn't in the room and arrives at a different answer. The record doesn't need to be long. It needs the context, the options considered, the choice and the reasoning, so a future reader can tell whether circumstances have changed enough to revisit it.

Where it goes depends on the weight. Two-way doors live in the pull request or the commit message. Larger decisions get a [design doc](/docs/engineering/design-docs). And because this playbook writes the standards down, ADRs here are reserved for **departures** from them; everything else is explained by the playbook itself.

## Revisiting Decisions

Decisions should be revisited when the facts change, not when the people do. A good trigger is written into the decision itself: "we'll revisit if traffic exceeds X" or "if we hire a second team on this service". Without a trigger, every new senior hire relitigates every old choice, and the team spends its energy defending history instead of building.

When a decision does turn out wrong, say so plainly and change it. Treating reversals as failures makes people defend bad decisions long past the point where everyone knows they're bad. The goal was never to be right the first time; it was to keep making progress with the information available.

## References

**In practice**

- [Amazon: 2015 Letter to Shareholders](https://www.sec.gov/Archives/edgar/data/1018724/000119312516530910/d168744dex991.htm), one-way and two-way door decisions
- [Amazon: 2016 Letter to Shareholders](https://www.aboutamazon.com/news/company-news/2016-letter-to-shareholders), deciding with about 70% of the information and "disagree and commit"
- [Sociocracy 3.0: Consent Decision Making](https://patterns.sociocracy30.org/consent-decision-making.html), consent as "good enough for now, safe enough to try"
- [Will Larson: Scaling Consistency](https://lethain.com/scaling-consistency/), keeping technical decisions consistent as an organization grows
