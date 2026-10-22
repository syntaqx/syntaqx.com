+++
title = "Onboarding"
description = "Getting a new engineer to a merged change in week one: access ready on day one, a buddy, a written 30/60/90 plan, real starter tasks, and on-call by stages."
category = "Leadership"
order = 1302
tags = ["leadership", "onboarding", "teams", "process"]
+++

Onboarding is where a team finds out how much of its knowledge is written down. A new engineer stuck for three days on local setup isn't a slow learner; they've found a README that's wrong, a dependency nobody documented, or a credential that only one person knows how to issue. Treat every snag they hit as a bug in the team, because the next hire will hit it too.

The goal I set: **a merged change to production in the first week.** It doesn't have to be big. A typo fix through the real pipeline proves the setup works, the access is in place, and the review and deploy path is understood, and it gives the new person something done instead of a week of reading.

## Ready Before Day One

Accounts, laptop, repository access, chat, the on-call tool, the cloud console with the right (limited) permissions: all of it requested before the start date. A first day spent filing access tickets tells the new person that nobody prepared for them, and it burns their best days of curiosity on waiting.

Keep the access list as a checklist in the repository, not in someone's memory. Every time a new hire finds something missing from it, they add it.

## One Command to Run It

The README should take someone from a fresh clone to a running system with one command, as [Code Ownership](/docs/engineering/code-ownership) requires. If setup is ten manual steps in a wiki, the first job of the new hire, with a buddy, is to fix that. It's the most valuable onboarding task there is: they're the only person on the team who can still see what's confusing.

## A Buddy, Not Just a Manager

Pair each new engineer with a buddy: a peer on the team, not their manager, whose explicit job for the first few weeks is to answer questions. New people hesitate to ask "obvious" things of a manager or a busy senior engineer, and a question they don't ask turns into an hour lost. A named buddy makes asking normal. Budget real time for it; a buddy with a full sprint of their own will be too busy to help.

## A Written 30/60/90 Plan

A short written plan, agreed in the first week, says what success looks like at 30, 60 and 90 days:

| By | Typically |
| -- | --------- |
| 30 days | Shipping small changes independently, understands the team's systems and how work flows |
| 60 days | Owning a meaningful piece of work end to end, contributing in reviews and design discussions |
| 90 days | Working at the level they were hired for, and starting on-call |

Writing it down matters because "how am I doing?" is the question every new hire carries and few ask. The plan answers it, and it gives the manager something concrete to check in against instead of a vague sense of progress.

## Real Work, Early

Starter tasks should be real: a small feature, a bug users hit, a gap in monitoring, an annoying manual step to automate. The [Google SRE book](https://sre.google/sre-book/accelerating-sre-on-call/) makes the same case for its new engineers: ownership of something small beats a queue of repetitive tickets, because it teaches how the pieces fit together. Avoid the "read the codebase for two weeks" start; people learn a system by changing it.

## The Docs Are the Onboarding Path

The best onboarding program is documentation good enough that a new engineer can find answers without asking. This playbook is exactly that: the standards for APIs, errors, testing, releases and incidents, written down so a new person learns "how we do things here" by reading instead of by being corrected in review. Where the docs are wrong or missing, the new hire fixes them. They're the best-placed person to notice.

## On-Call by Stages

Nobody should take their first page alone at 3 a.m. Bring new engineers into [on-call](/docs/operations/on-call) gradually: read past postmortems and runbooks, shadow a rotation (receive the pages, don't own them), then reverse-shadow (lead while an experienced engineer watches), then take the rotation with a clear escalation path. The SRE book describes the move to on-call as "a milestone in a new SRE's career", and it should feel like one, not like being thrown in.

## Ask How It Went

At 30 and 90 days, ask the new person what was confusing, what was missing and what they'd change. Then change it. Onboarding feedback is unusually honest and unusually cheap, because the person still remembers what it was like not to know.

## References

**In practice**

- [Google SRE Book: Accelerating SREs to On-Call and Beyond](https://sre.google/sre-book/accelerating-sre-on-call/), starter projects, shadowing and reverse shadowing on the way to on-call
- [Lara Hogan: Questions for our first 1:1](https://larahogan.me/blog/first-one-on-one-questions/), learning early how a new teammate likes feedback and support
