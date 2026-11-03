+++
title = "Problem Statements & Acceptance Criteria"
nav_title = "Problem Statements"
description = "Problem statements that set the frame, acceptance criteria that state outcomes and leave room for the solution, and hearing the pain behind a request."
category = "Product"
order = 112
tags = ["product", "requirements", "acceptance-criteria", "planning"]
+++

A problem statement decides most of a project before anyone picks a solution: who it's for, what they're trying to get done, and what "better" means. Get it right and a hundred small decisions make themselves. Get it wrong and the team builds exactly what was asked for, ships it on time, and watches people go back to the spreadsheet they were using before. The evidence for one comes from [discovery](/docs/product/discovery).

## What a Problem Statement Holds

Too little and nobody knows what the work is. Too much and the work has already been done, badly, by whoever wrote the ticket. Shape Up names both failures: "When a project is defined in a few words, nobody knows what it means", and when leaders go straight to mockups "they define too much detail too early", which "leaves designers no room for creativity" ([Principles of Shaping](https://basecamp.com/shapeup/1.1-chapter-02)).

A useful one fits on a page and answers:

| Question | What it pins down |
| --- | --- |
| **Who has the problem?** | A specific group, by what they do, not "the users". If several groups touch the same thing, all of them, because a solution defined by one usually breaks the assumptions of the rest |
| **What are they trying to get done?** | The job, in their words, and where else they're doing it today (a spreadsheet, a second tool, a support ticket) |
| **Why does it matter?** | What it costs them now: time, money, errors, a deal that stalls |
| **How will we know it's better?** | An observable outcome: a task that takes minutes instead of an afternoon, a support category that shrinks, a workaround that stops being used |
| **What's out?** | The non-goals. Shape Up's third property of shaped work: "shaped work indicates what not to do" |
| **How much is it worth?** | An appetite, not an estimate. "An appetite is completely different from an estimate" ([Set Boundaries](https://basecamp.com/shapeup/1.2-chapter-03)): it's how much time the problem deserves, and the solution is shaped to fit it |

Shape Up's summary of the balance is the one I use: "the roughness leaves room for the team to resolve all the details, while the solution and boundaries act like guard rails."

## Acceptance Criteria Are Outcomes

Acceptance criteria say how everyone will know the work is done. They describe behavior the user can observe, not the implementation that produces it.

The oldest description is still the best. Ron Jeffries' [Card, Conversation, Confirmation](https://ronjeffries.com/xprog/articles/expcardconversationconfirmation/): the card is "a token representing the requirement", the requirement itself "is communicated from customer to programmers through conversation", and the customer "defines the acceptance tests that will be used to show that the story has been implemented correctly." Bill Wake's [INVEST](https://xp123.com/invest-in-good-stories-and-smart-tasks/) makes the same point from the other side: a good story is negotiable, "not an explicit contract for features", and "A good story captures the essence, not the details."

Given/When/Then, from [Dan North's BDD](https://dannorth.net/blog/introducing-bdd/), is a good shape for them, because it forces a starting state, an event and an outcome: "A story's behaviour is simply its acceptance criteria." Write them so a test can check them ([GivenWhenThen](https://martinfowler.com/bliki/GivenWhenThen.html)), and they become the regression tests the change ships with.

```gherkin
Given a report built from last month's invoices
When the account manager shares it with a client
Then the client sees the same totals without needing an account
And the totals match the invoices to the cent
```

Nothing in it says "button", "modal" or "top-right". The team can solve it with a share link, a scheduled email or a PDF, and whichever they pick, the criteria still say whether it worked.

## Waterfall in Disguise

Plenty of teams call themselves agile and still hand engineering a finished design with a ticket number on it. The tell is that the criteria can only be met one way.

| Waterfall in disguise | Leaves room |
| --- | --- |
| "Add a descending sort toggle in the top-right of the orders table" | "Account managers can find their most recent orders first on every list where orders appear" |
| "Add a CSV export button to the report page" | "An account manager can get this month's report into the client's finance system without retyping it" |
| "Show a red banner when the card fails" | "A customer whose payment failed knows before their service is interrupted, and can fix it in one step" |
| Pixel-perfect mockup attached as the spec | A rough sketch attached as an illustration, with the criteria as the spec |

The left column isn't wrong because it's detailed. It's wrong because the detail arrived before the problem did, so the first time someone notices that a second screen needs the same thing for the same reason, there's no frame to hang it on. Mockups are fine. Shape Up's [fat marker sketches and breadboards](https://basecamp.com/shapeup/1.3-chapter-04) exist to show an idea "without visual styling", and "By leaving details out", they "give room to designers in subsequent phases of the project." Attach the picture, but make the criteria the contract.

Leaving room isn't leaving a void. Details are welcome: what it looks like, which edge cases matter, how many is too many. They land inside a frame everyone already shares. What doesn't work is a detail that tries to set the frame from outside, one pinned requirement at a time.

## Customers Name Problems, Not Solutions

Game designers learned this early. Ship every feature players ask for and you ship a worse game. Mark Rosewater's lesson from twenty years of designing Magic: The Gathering is "Your audience is good at recognizing problems and bad at solving them" ([Twenty Years, Twenty Lessons, Part 3](https://magic.wizards.com/en/news/making-magic/twenty-years-twenty-lessons-part-3-2016-06-13)). His metaphor is a doctor's appointment: you know exactly where it hurts, and the doctor doesn't ask you to write the prescription. Players "are excellent at identifying problems, but they're not as equipped to solve the problems", because "They don't know the restrictions you're under or what needs you have to fulfill." His conclusion: "use your audience as a resource to help figure out what is wrong with your game, but take it with a grain of salt when they offer you solutions."

Every feature request is two things stuck together: a pain, which is real and valuable, and a proposed solution, which is usually too narrow or wrong. The work is pulling them apart.

- **Ask about the moment it hurt.** What were they trying to do, how often does it happen, and what do they do instead today? The workaround is the best evidence there is: it shows the real job, and it's what the solution has to beat.
- **Count the pain, not the votes.** Ten customers asking for ten different buttons may be one problem. Link each request to the problem it's evidence for, so the count goes on the problem.
- **Write the problem statement around the pain.** The request goes in as evidence, quoted, with the customer's name on it. It doesn't go in as the spec.
- **Watch for convergence.** Sometimes the customer's solution is right. The signal is several unrelated customers arriving at the same shape independently, with different workarounds pointing at it. That's evidence, not a vote.

## Saying No

Most requests get some version of no, and how it's said decides whether the customer keeps telling you where it hurts.

- **No to the solution, yes to the problem.** "We're not adding an export button to that screen, but you shouldn't have to rebuild this report by hand every month, and here's what we're doing about that." The customer cares about the pain going away, rarely about their particular fix.
- **A plain no when it's out of scope.** Some pain is real and still not yours to solve: it serves too few people, it pulls the product somewhere you've decided not to go, or another tool does it better. Say so, and say why. A clear no lets them plan around it.
- **Never a fake "it's on the roadmap."** A request filed and never touched is a no that the customer finds out about a year late. Close it honestly instead ([Backlogs](/docs/product/backlogs)); if the pain keeps coming back, that's the evidence that reopens it.
- **Close the loop when it ships.** When a problem someone reported gets solved, even differently than they asked, tell them. It's the cheapest way to get the next report.

## References

- [Principles of Shaping](https://basecamp.com/shapeup/1.1-chapter-02), Shape Up (Basecamp): rough, solved and bounded work
- [Set Boundaries](https://basecamp.com/shapeup/1.2-chapter-03), Shape Up: appetite versus estimate
- [Find the Elements](https://basecamp.com/shapeup/1.3-chapter-04), Shape Up: breadboards and fat marker sketches
- [Essential XP: Card, Conversation, Confirmation](https://ronjeffries.com/xprog/articles/expcardconversationconfirmation/), Ron Jeffries (2001)
- [INVEST in Good Stories, and SMART Tasks](https://xp123.com/invest-in-good-stories-and-smart-tasks/), Bill Wake (2003)
- [Introducing BDD](https://dannorth.net/blog/introducing-bdd/), Dan North (2006)
- [GivenWhenThen](https://martinfowler.com/bliki/GivenWhenThen.html), Martin Fowler (2013)
- [Twenty Years, Twenty Lessons, Part 3](https://magic.wizards.com/en/news/making-magic/twenty-years-twenty-lessons-part-3-2016-06-13), Mark Rosewater (2016)
