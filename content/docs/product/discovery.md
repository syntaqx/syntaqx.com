+++
title = "Discovery & User Research"
nav_title = "Discovery & Research"
description = "Finding problems worth solving before a problem statement: weekly customer contact, interviews about past behavior, assumption tests and small usability tests."
category = "Product"
order = 111
tags = ["product", "discovery", "user-research", "usability"]
+++

Discovery is the work that happens before a [problem statement](/docs/product/problem-statements) exists: finding out which problems are real, which ones matter, and whether a solution would get used, before anyone pays for building it. Most teams skip it, not on purpose, but because delivery always has something more urgent. The result is a backlog full of confident guesses and a team that learns what customers needed from the usage graph after launch.

My default is small and continuous: someone on the team who builds the product talks to a customer every week, interviews ask about what people did rather than what they would do, ideas get broken into assumptions that are tested one at a time, and the findings land somewhere the next person can find them. None of it needs a research department.

## Continuous, Not a Phase

The old shape is a research project at the start of a big initiative: a few weeks of interviews, a deck, and then a year of building on what the deck said. By the time the product ships, the deck describes customers who've moved on.

Teresa Torres' definition of continuous discovery is the one I use: "weekly touch points with customers by the team building the product," where the team conducts "small research activities in pursuit of a desired outcome" ([Product Talk](https://www.producttalk.org/glossary-discovery-continuous-discovery/)). Every word of it is load-bearing:

- **Weekly.** A cadence, not a project. One conversation a week is enough to keep the team's picture of the customer current, and cheap enough to survive a busy sprint.
- **The team building the product.** Not a research team that hands over a summary. Findings lose most of their force in the handoff; the engineer who watched a customer fail at a task doesn't need to be convinced the task is broken.
- **Small activities.** An interview, a five-person usability test, a look at last week's support tickets. Not a study with a kickoff.
- **A desired outcome.** Discovery without a target is tourism. The outcome (a metric the team is trying to move, from [Roadmaps](/docs/product/roadmaps)) is what decides which conversations to have.

The cost is real: an hour or two a week from the people who'd otherwise be building, plus someone keeping the recruiting pipeline full. I pay it because the alternative is spending months on work nobody uses, which costs far more and is spent all at once.

## Interviews: Past Behavior Over Hypotheticals

Everyone you interview is trying to be helpful, and helpfulness is the problem. Ask "would you use a feature that did X?" and people say yes, because saying yes is polite and costs them nothing. Rob Fitzpatrick's *The Mom Test* is built on that observation: "The world's most deadly fluff is: 'I would definitely buy that'", because "folks are wildly optimistic about what they would do in the future" ([quotes](https://www.goodreads.com/work/quotes/26235307-the-mom-test-is-a-quick-practical-guide-that-will-save-you-time-money)). His three rules are the core of every interview I run:

- "Talk about their life instead of your idea"
- "Ask about specifics in the past instead of generics or opinions about the future"
- "Talk less and listen more"

Jakob Nielsen's first rule of usability makes the same point from the research side: "Watch what people actually do. Do not believe what people say they do" ([NN/g](https://www.nngroup.com/articles/first-rule-of-usability-dont-listen-to-users/)). The last time something happened is a fact; how often it "usually" happens is a guess with an agenda.

In practice that means anchoring every question on a specific recent event:

| Ask this | Not this |
| --- | --- |
| "Tell me about the last time you had to send a client their monthly report." | "How do you usually handle reporting?" |
| "What did you do when the numbers didn't match?" | "Would it help if the numbers were reconciled automatically?" |
| "What did that cost you, roughly, in time?" | "How painful is reconciliation, on a scale of one to ten?" |
| "Have you looked for something to fix this? What did you try?" | "Would you pay for a tool that fixed this?" |

The last row is the strongest signal there is. Someone who has already spent money, time or political capital on a workaround has a real problem. Someone who'd "definitely" use a fix but has never looked for one probably doesn't.

A guide keeps a 30-minute interview on track without turning it into a survey read aloud:

```text
Interview guide (30 min)

Before: who they are, why they were picked, what the team wants to learn.
Consent: confirm recording is OK, say what it's for and who sees it.

1. Context (5 min)
   - What's your role? What does a normal week look like?
2. The last time (15 min)
   - Tell me about the last time you [did the job being researched].
   - What happened right before? What did you do next?
   - Where did it get slow, annoying or risky?
   - What do you do about that today? (tools, spreadsheets, people)
   - What has that workaround cost you?
3. Prior attempts (5 min)
   - Have you tried to fix this? What did you try, and why did you stop?
4. Close (5 min)
   - Anything I should have asked and didn't?
   - Who else deals with this that I should talk to?

After (same day): top three findings, quotes verbatim, link to recording.
```

Two people per interview when possible: one asks, one takes notes. The person asking listens better when they aren't typing, and two people remember the conversation differently, which is useful when you compare notes.

## Jobs to Be Done

Interviews produce a pile of stories; jobs to be done is the lens I use to sort them. The Christensen Institute describes the job as "the progress they're trying to make as they strive toward a goal or aspiration within particular circumstances", and the reason it matters: "People don't simply buy or pick products or services; they pull them into their lives to make progress" ([Jobs to Be Done](https://www.christenseninstitute.org/theory/jobs-to-be-done/)).

The practical value is in the competition it reveals. Their well-known milkshake example found that morning buyers were hiring a milkshake to curb hunger and make a long drive less dull, and that its real competitors were bananas and bagels, not other milkshakes. For software the competitor is usually a spreadsheet, an email thread, or a person who does the task by hand. That's what the solution has to beat, and it's what [Problem Statements](/docs/product/problem-statements#customers-name-problems-not-solutions) means by treating the workaround as the best evidence there is.

I write a job as one sentence with the circumstance in it ("when a client asks why this month's bill went up, the account manager needs to explain it on the call, without looking it up afterwards") and attach the interviews that support it. Jobs are stable; the features that serve them change.

## Opportunity Solution Trees

The trap after a few interviews is jumping straight from one vivid story to one solution. An opportunity solution tree, also from Teresa Torres, is "a simple way of visually representing the paths you might take to reach a desired outcome" ([Product Talk](https://www.producttalk.org/opportunity-solution-trees/)). The outcome sits at the root. Under it, opportunities: "the customer needs, pain points, and desires that, if addressed, will drive your desired outcome." Under those, solutions, and under each solution, the assumption tests that would show whether it works.

![An opportunity solution tree read top to bottom: the outcome "more teams invite a colleague" at the root; three opportunities under it ("don't know who to invite", "afraid of spamming them", "invite lost in the inbox"); two solutions under the first opportunity, each with an assumption test ("domain match in the data", "5 usability sessions"); and the accented path from "afraid of spamming them" to the solution "preview what they'll get" and its test "prototype with 5 users"](/diagrams/opportunity-solution-tree.svg "An opportunity solution tree: every solution traces up to an opportunity a customer actually has, and down to the test that will show whether it works. The team works one opportunity at a time.")

Three things make it more than a diagram:

- **Every solution traces up to an opportunity.** A feature idea with no customer need above it is visible as exactly that, an orphan.
- **Several solutions per opportunity.** Comparing three options is how you avoid falling for the first one. If an opportunity has one solution, nobody has looked hard yet.
- **One target opportunity at a time.** The tree holds many; the team works one, which keeps the weekly interviews and tests focused.

The tree lives in a shared doc or whiteboard and changes every week. It's a thinking tool, not a deliverable to present.

## Test Assumptions, Not Whole Ideas

An idea fails for one of a handful of reasons. Marty Cagan's four big risks are the classic list: value ("whether customers will buy it or users will choose to use it"), usability ("whether users can figure out how to use it"), feasibility ("whether our engineers can build what we need with the time, skills and technology we have") and business viability ("whether this solution also works for the various aspects of our business") ([SVPG](https://www.svpg.com/four-big-risks/)). Torres adds a fifth, ethical: "whether building the solution could cause harm."

Her point about what to do with them is the important one: "stop testing whole ideas, and to start testing the underlying assumptions that your ideas depend upon" ([Assumption Testing](https://www.producttalk.org/2023/10/assumption-testing/)). A whole idea that fails tells you almost nothing about why. An assumption that fails tells you exactly which part to change.

So for each candidate solution I list the assumptions it depends on, sorted by type, then pick the ones that are both important and least known, and test those first:

| Type | Example assumption | Cheapest test I'd reach for |
| --- | --- | --- |
| Desirability | Account managers send the report to clients every month | Ask about the last three months in interviews; check how often the current export runs in [product analytics](/docs/telemetry/product-analytics) |
| Usability | They'll find the share option without being told | Five-person usability test on a clickable prototype |
| Feasibility | The totals can be computed from existing invoice data in under a second | An engineer spikes the query against a copy of production-shaped data |
| Viability | Sharing doesn't need a seat license, so it won't cannibalize sales | A conversation with whoever owns pricing, before building |
| Ethical | Clients won't see data they shouldn't | Walk the permission model with the team that owns access control |

Most assumption tests take a day or less. The ones that take longer are usually a sign the assumption should be split.

## Prototypes and Fake Doors

A prototype is the cheapest thing that can answer a specific question. For usability, that's often a clickable mockup; for desirability, sometimes nothing more than a description and a question about the last time they needed it. Build the least you can and still get behavior instead of opinion.

A fake door (or painted door) is the desirability test that goes furthest: a real entry point in the live product (a menu item, a button, a pricing tier) for a feature that doesn't exist yet, measuring how many people try to open it. It produces behavior at scale, which interviews can't. It also deceives the people who click, and that has costs:

- **Tell them immediately and plainly.** The page behind the door says the feature isn't built yet, that their click is helping decide whether to build it, and offers a way to hear when it ships. No fake loading screen, no error message pretending to be a bug.
- **Never charge, and never collect anything you wouldn't otherwise.** A fake door on a paid upgrade that takes card details is a dark pattern, not a test.
- **Small exposure, short duration.** Show it to a sample, for days, not to everyone for a quarter. The same [experimentation](/docs/telemetry/experimentation#ethics-and-consent) rules apply as for any test on live users.
- **Clicks are not commitment.** A click says the label was interesting. Follow up with a few of the people who clicked before reading demand into it.

The closest independent standard is research ethics on deception, not product practice. The American Psychological Association's Ethics Code (Standard 8.07) allows a deceptive study only when its value justifies it and "effective nondeceptive alternative procedures are not feasible," and requires explaining the deception to participants "as early as is feasible" and letting them withdraw their data. A fake door is not a study under that code, but the same tests apply: is there an honest way to learn this, and does the person find out right away. I don't know of a standard written for fake-door tests specifically; the published guidance is mostly from vendors who sell experimentation tools, so the rules above are my own floor. <!-- source-gap: fake-door-ethics | missing | no independent standard or research on fake-door test ethics specifically, only vendor guidance; nearest is general research-deception ethics (APA 8.07) | closes with: an academic, regulator or professional-body publication on painted-door tests | checked: 2026-11-03 -->

## Usability Testing: Small and Often

Usability testing is watching people try to use the thing, and it's the research method with the best return for a small team. Nielsen's 2000 argument still holds: a single user reveals about 31% of the usability problems on average, five users find about 85%, and "After the fifth user, you are wasting your time by observing the same findings repeatedly" ([Why You Only Need to Test with 5 Users](https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/)). His recommendation is to spend a budget of fifteen participants as "3 studies with 5 users each", fixing problems between rounds, because the fixes need testing too.

The caveats matter, and NN/g's later guidance spells them out ([How Many Test Users](https://www.nngroup.com/articles/how-many-test-users/)): five is for qualitative studies of one user group. Distinct user groups need their own participants (3 to 4 each when there are two groups), and quantitative studies that report a number need at least 20 users. Five people can tell you that a flow is confusing; they can't tell you what share of your users will fail it.

My default round: five participants, 30 to 45 minutes each, one tester and one note-taker, three to five realistic tasks phrased as goals ("send this month's report to Acme") rather than instructions ("click Share"), think-aloud, and no helping. The findings go to the team the same week, ranked by severity, and the next round tests the fixes.

## Surveys and Their Limits

Surveys are tempting because they're cheap and produce numbers. The numbers are the problem. A survey is attitudinal research, and NN/g's summary of attitudinal methods is that they are "limited by what people are aware of and willing to report" ([When to Use Which UX Research Methods](https://www.nngroup.com/articles/which-ux-research-methods/)). A survey tells you what people say about themselves, filtered through who bothered to answer.

What I use them for:

- **Sizing something interviews already found.** Ten interviews surfaced three workarounds; a survey asks a few hundred people which of the three they use.
- **Tracking a stated attitude over time,** with the same questions asked the same way each time.
- **Recruiting.** The most useful question on many surveys is "can we talk to you about this?"

What I don't: asking people to predict their behavior ("would you use...?"), asking them to rank features they haven't used, or treating a satisfaction score as an explanation. A survey can't ask a follow-up question, which is where most of the learning in an interview happens.

## Support Tickets and Analytics as Inputs

The cheapest discovery is reading what customers already wrote and what they already did.

- **Support tickets** are unprompted problem reports with the customer's own words attached. Tagged consistently ([Customer Support](/docs/operations/customer-support#classify-route-answer)), they show which problems recur, for whom, and how often. Read a week of raw tickets every so often, not just the tag counts; the counts flatten the stories.
- **[Product analytics](/docs/telemetry/product-analytics)** shows behavior at scale: where people drop out of a [funnel](/docs/telemetry/product-analytics#funnels), which features retained cohorts use, which ones nobody touches. It says what and where, never why.

The useful pattern is to let each one point at the other. Analytics shows that most people abandon a setup step; interviews with a few of them find out why; a ticket count tells you how many complained; an [experiment](/docs/telemetry/experimentation) checks whether the fix moved the number. Any one of them alone misleads.

## Research Ops on a Small Team

A small team doesn't need a research operations function, but it needs the things one would do, or the weekly interview quietly stops happening.

- **Recruiting on autopilot.** The hardest part of continuous discovery is having someone to talk to next week. Keep a standing pool: an opt-in in the product ("happy to talk to the team?"), a question at the end of support conversations, a list from sales and success. Ask for a 30-minute slot and offer something for their time where it's appropriate.
- **Consent, every time.** Before any session, tell the participant what you're recording, why, who will see it and how long it's kept, and get a clear yes. GDPR's standard is a useful floor wherever you operate: consent is "freely given, specific, informed and unambiguous" ([GDPR Art. 4](https://gdpr-info.eu/art-4-gdpr/)).
- **Recordings are personal data.** A video of a person's face and voice relates to "an identified or identifiable natural person", which is GDPR's definition of personal data (same article). Store recordings in one access-controlled place, set a retention period and delete them on schedule, and never put them in a public channel or a shared drive with link sharing. The obligations are the same as for any other personal data ([GDPR](/docs/compliance/gdpr)). Share clips and quotes; keep the raw sessions locked down.
- **A findings repository.** NN/g describes a research repository as "a central place where user-research artifacts and outputs are stored" so others can access them ([Research Repositories](https://www.nngroup.com/articles/research-repositories/)). On a small team that's a folder or a database with one page per session (who, when, what was learned, verbatim quotes, link to the recording) and one page per insight, linked to the sessions that support it. Their advice to start small, with a few broad tags, is right; a taxonomy nobody uses is worse than a folder people do.

The repository is what turns interviews into evidence. When a [backlog](/docs/product/backlogs) item says "customers need this", it should link to the sessions that say so.

## Engineers in Discovery

Torres' unit for discovery is the product trio, "a product manager, a designer, and a software engineer" ([Product Talk](https://www.producttalk.org/2021/08/product-trio/)), and the engineer's seat is the one teams most often leave empty. Her description of the handoff model is the failure I see most: "the product manager doesn't know what's possible and the engineers can't implement the requirements as written."

Engineers belong in discovery for three reasons:

- **Feasibility is an assumption like any other.** The engineer in the room can say "that's a week" or "that's a quarter" while the solution is still a sketch, and can propose a cheaper one that solves the same problem.
- **They see solutions others don't.** Knowing what the system can already do (the data that's already there, the integration that's half-built) changes which options are on the tree.
- **It changes how they build.** An engineer who watched three customers struggle with a step makes better calls about edge cases and error states than one reading a ticket, without needing every detail written down.

That doesn't mean every engineer in every interview. My default is one engineer per trio, rotating each quarter, and an open invitation for anyone on the team to sit in on a session. The weekly cost is an hour; the return is a team that argues about the customer's problem instead of the ticket's wording.

## When Discovery Is Done

Discovery doesn't end; the tree keeps changing. But a given opportunity is ready to leave discovery when the team can write its [problem statement](/docs/product/problem-statements) with evidence behind every line: who has the problem (from interviews), what they do today (from observed workarounds), what it costs them (from their own numbers), and how you'll know it's better (an outcome the analytics can see). If a line of that statement is still a guess, that's the next assumption to test.

## References

**Research**

- [Why You Only Need to Test with 5 Users](https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/), Jakob Nielsen (2000): five users find about 85% of usability problems; run several small rounds
- [How Many Test Users in a Usability Study?](https://www.nngroup.com/articles/how-many-test-users/), NN/g: when five is right, and when you need more
- [First Rule of Usability? Don't Listen to Users](https://www.nngroup.com/articles/first-rule-of-usability-dont-listen-to-users/), Jakob Nielsen (2001): watch behavior, distrust self-report
- [When to Use Which User-Experience Research Methods](https://www.nngroup.com/articles/which-ux-research-methods/), NN/g: attitudinal versus behavioral methods and what surveys measure
- [APA: Ethical Principles of Psychologists and Code of Conduct](https://www.apa.org/ethics/code), Standard 8.07 on when deception is justified and debriefing as early as feasible

**Reference**

- [Continuous Discovery](https://www.producttalk.org/glossary-discovery-continuous-discovery/), Teresa Torres: weekly touch points by the team building the product
- [Opportunity Solution Trees](https://www.producttalk.org/opportunity-solution-trees/), Teresa Torres: outcome, opportunities, solutions and assumption tests
- [Assumption Testing](https://www.producttalk.org/2023/10/assumption-testing/), Teresa Torres: the five assumption types and testing assumptions rather than ideas
- [Product Trio](https://www.producttalk.org/2021/08/product-trio/), Teresa Torres: product, design and engineering doing discovery together
- [The Four Big Risks](https://www.svpg.com/four-big-risks/), Marty Cagan (SVPG): value, usability, feasibility and viability
- [Jobs to Be Done](https://www.christenseninstitute.org/theory/jobs-to-be-done/), Christensen Institute: progress in a circumstance, and the milkshake example
- [The Mom Test quotes](https://www.goodreads.com/work/quotes/26235307-the-mom-test-is-a-quick-practical-guide-that-will-save-you-time-money), Rob Fitzpatrick: the three rules for customer conversations

**In practice**

- [Research Repositories](https://www.nngroup.com/articles/research-repositories/), NN/g: what to store and how to start small
- [GDPR Article 4](https://gdpr-info.eu/art-4-gdpr/), the definitions of personal data and consent that cover research recordings
