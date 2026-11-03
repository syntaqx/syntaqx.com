+++
title = "Measuring Engineering"
description = "Engineering metrics that improve the system, not rank people: DORA, SPACE and DevEx, developer surveys, PR flow, and measuring AI-assisted work honestly."
category = "Leadership"
order = 1309
tags = ["leadership", "metrics", "dora", "developer-experience"]
+++

Every engineering organization eventually gets asked how productive it is, and the tempting answer is a dashboard of whatever is easy to count: commits, pull requests, story points, lines of code. Those numbers are easy to collect, look rigorous, and measure activity rather than outcomes. Put them on a leaderboard and they make the system worse, because people optimize what they're judged on.

My default: measure the delivery system and the developer experience, at the team or service level, as trends the team owns and uses to decide what to fix. Pair a small set of system metrics (DORA's) with a regular developer survey, never score individuals with any of it, and treat every number as a question to ask the team, not an answer to report upward.

## What Metrics Are For

Engineering metrics have one legitimate job: to show a team where its delivery system is slow, fragile or painful, so it can improve it. A metric that doesn't lead to a decision about the system is noise.

They are not for ranking people or teams. Goodhart's law, in Marilyn Strathern's phrasing, is the whole risk: "When a measure becomes a target, it ceases to be a good measure" ([Goodhart's law](https://en.wikipedia.org/wiki/Goodhart%27s_law)). DORA's guide to its own metrics says the same about targets: setting them "increases the likelihood that teams will try to game the metrics", and "The goal is to improve your team's performance over time, not to compete against other teams or organizations" ([DORA metrics guide](https://dora.dev/guides/dora-metrics/)).

The practical test I use before adding any metric: if this number moved the wrong way next month, what would the team do differently? If the answer is "nothing" or "work harder", don't collect it.

## DORA: The Delivery System

DORA's research is the best-evidenced starting point for delivery performance. Its guide defines five software delivery metrics ([DORA metrics guide](https://dora.dev/guides/dora-metrics/)):

| Metric | DORA's definition | Group |
| --- | --- | --- |
| Change lead time | "The amount of time it takes for a change to go from committed to version control to deployed in production." | Throughput |
| Deployment frequency | "The number of deployments over a given period or the time between deployments." | Throughput |
| Failed deployment recovery time | "The time it takes to recover from a deployment that fails and requires immediate intervention." | Throughput |
| Change fail rate | "The ratio of deployments that require immediate intervention following a deployment." | Instability |
| Deployment rework rate | "The ratio of deployments that are unplanned but happen as a result of an incident in production." | Instability |

The model has moved over the years ([A history of DORA's software delivery metrics](https://dora.dev/guides/dora-metrics/history/)). The original four were deployment frequency, lead time, mean time to recover and change fail rate. DORA added availability as an operational measure in 2018 and broadened it to reliability (latency, performance and scalability too) in 2021; in 2023 MTTR became failed deployment recovery time, counting only failures caused by a change; and in 2024 deployment rework rate joined as a fifth delivery metric, capturing the unplanned work that change fail rate had been standing in for. The instability side and how to read it belong to [Quality Metrics](/docs/quality/metrics#delivery-stability-dora); this page doesn't repeat it.

How I use them:

- **Per service, not per organization.** DORA's guide says the metrics "are meant to be applied at the application or service level", and warns that "Comparing metrics between vastly different applications... can be misleading." An org-wide average blends a mobile app with a nightly batch job and describes neither.
- **Throughput and instability together.** Deploying more often while change fail rate climbs isn't improvement. Neither is a falling fail rate because the team stopped deploying.
- **Automated, from the pipeline.** Lead time and deploy frequency come from [CI and deploy events](/docs/delivery/ci-pipelines); failure and rework come from incident records and rollbacks. Hand-collected DORA metrics are always late and usually generous.
- **Reliability alongside them.** DORA's delivery metrics describe deployments, not the service between them; DORA tracks reliability separately as an operational measure. Whether users are getting a working product is what [SLOs](/docs/operations/slos) measure; I put error budget burn on the same page as the delivery metrics, so speed is read against reliability.

## SPACE: Productivity Has More Than One Dimension

DORA covers the delivery pipeline. It says nothing about whether developers are drowning in meetings, waiting days for review, or burning out to hit those numbers. The SPACE framework (Forsgren, Storey and colleagues, ACM Queue, 2021) is the best map of what else to look at. Its five dimensions are satisfaction and well-being, performance, activity, communication and collaboration, and efficiency and flow ([The SPACE of Developer Productivity](https://queue.acm.org/detail.cfm?id=3454124)).

The paper is as useful for the myths it names as for the framework. Among them: "Productivity is all about developer activity", "Productivity is only about individual performance", and "One productivity metric can tell us everything." On performance it's blunt: software "is written by teams, not individuals," so performance "is often best evaluated as outcomes instead of output."

Its guidance on using the framework is specific and is my default:

- **At least three dimensions.** "Teams and leaders... should capture several metrics across multiple dimensions of the framework, at least three are recommended." Adding pull request count to a dashboard that already tracks commits adds nothing; both are activity.
- **At least one perceptual measure.** "At least one of the metrics include perceptual measures such as survey data," because "perceptual data may provide more accurate and complete information than what can be observed from instrumenting system behavior alone."
- **Metrics in tension, on purpose.** Pick measures that pull against each other (throughput and satisfaction, say), so improving one by sacrificing another shows up.
- **Aggregate, not individual.** Teams should "report only anonymized, aggregate results at the team or group level," and the paper notes that in some countries reporting on individual productivity isn't legal.

## DevEx: Measure the Friction

The DevEx paper (Noda, Storey, Forsgren and Greiler, ACM Queue, 2023) narrows SPACE to what developers actually experience, in three dimensions: **feedback loops** (how fast tools and people respond: builds, tests, reviews), **cognitive load** (how much mental effort the work takes beyond the problem itself) and **flow state** (how often developers get uninterrupted, focused time) ([DevEx: What Actually Drives Productivity](https://queue.acm.org/detail.cfm?id=3595878)).

Its central measurement point is that you need both kinds of data: "A comparative analysis of perceptual measures and workflows is necessary because neither alone can tell the full picture." Its examples cut both ways: review turnaround that looks fast in the data "may still feel disruptive to developers if code reviews regularly interrupt their work," while developers "content with their build processes" may be living with slower feedback loops than they need.

GitHub's research with DX on the same model reported that developers who carve out significant time for deep work report feeling more productive, and that developers with a good understanding of their code feel 42% more productive than those without ([GitHub: Good DevEx increases productivity](https://github.blog/research/good-devex-increases-productivity/)). Those are self-reported perceptions, and I read them as such: evidence that friction matters to how people experience the work, not a conversion rate from flow time to output.

A DevEx measurement set for one team might look like:

| Dimension | Perception (survey) | Workflow (system data) |
| --- | --- | --- |
| Feedback loops | "How satisfied are you with the time it takes to get CI results?" | Median and p90 time from push to merge-blocking result |
| Feedback loops | "How often does waiting for review block you?" | Time from PR opened to first review |
| Cognitive load | "How easy is it to understand the code you work on?" | Number of services or repos a typical change touches |
| Flow state | "How often do you get two or more hours of uninterrupted time?" | Meeting hours per developer per week, from the calendar, in aggregate |

## Developer Surveys

A regular developer survey is the cheapest perceptual measure there is and the one most teams skip. The DevEx paper's guidance, from working with hundreds of organizations, is practical: survey questions "should be based on well-defined constructs and be rigorously tested in interviews for consistent interpretation"; break results down "by team and persona (e.g., role, tenure, seniority)" because company-wide averages hide problems that affect small groups; and mix in short transactional surveys at specific moments (after a failed CLI install, after an on-call shift) alongside the periodic one.

My defaults:

- **Quarterly, short, the same core questions each time,** so trends mean something. Ten to fifteen questions, most on a five-point scale, plus two open questions: "what slowed you down most this quarter?" and "what one thing should we fix?"
- **Anonymous, reported only in groups large enough** that nobody can be identified (I use five as a floor).
- **Results go back to the teams first,** within two weeks, with the open-text answers. The team picks one or two things to fix.
- **Close the loop visibly.** The next survey opens with what changed because of the last one. Participation drops fast when people see nothing happen.

## Cycle Time and PR Flow

Between DORA's pipeline-level numbers and the survey sits the flow of work through review, which is where most of a team's waiting happens. The metrics I look at, all as team-level distributions (median and p90), never per person:

- **Cycle time,** from first commit (or PR opened) to deployed. DORA's capability guide frames the goal as reducing "the cycle time to get changes into the hands of users" ([Working in small batches](https://dora.dev/capabilities/working-in-small-batches/)).
- **Time to first review.** Usually the biggest single wait, and the most fixable: a team agreement on review turnaround changes it within weeks.
- **PR size.** Large changes are slow to review and risky to ship. DORA's guidance: "Any batch of code that takes longer than a week to complete and check is too big."
- **Review rounds and rework.** Many rounds on most PRs means expectations aren't clear before the work starts; see [Commits & Reviews](/docs/development/commits-and-reviews).
- **Work in progress.** Many open PRs per person means work is started and not finished, usually because review is the bottleneck.

The p90 matters more than the median. A median cycle time of a day with a p90 of three weeks means some kind of work (cross-team changes, migrations, anything touching a particular service) is stuck, and that's where to look.

## What Never to Measure Per Person

Some numbers should never be attached to an individual, on a dashboard, in a review, or in a conversation about performance:

- **Lines of code.** Rewards verbosity and punishes deletion, which is often the most valuable change in a codebase. With AI tools generating code, it's worse than meaningless.
- **Commits or pull requests per person.** Rewards splitting work into many small units whether or not that helps, and punishes the engineer who spends a week on review, mentoring or a hard investigation.
- **Story points or velocity as productivity.** Points are an estimation aid for one team, and they inflate the moment they're used to judge. Ron Jeffries, who may have invented them: "I may have invented story points, and if I did, I'm sorry now," and "I think comparing teams on quality of estimates or velocity is harmful" ([Story Points Revisited](https://ronjeffries.com/articles/019-01ff/story-points/Index.html)). The SPACE paper notes story points can give teams incentive to focus on their own work at the expense of collaborating.
- **Hours online, response time in chat, or activity scores** from any tool. They measure presence, and people will provide presence.
- **Bugs caused or incidents involved in.** Ranks people by which systems they work on, and teaches everyone to hide problems ([Quality Metrics](/docs/quality/metrics#what-not-to-measure)).

People's performance is judged the way [Performance Reviews](/docs/leadership/performance-reviews#write-from-evidence-against-the-ladder) describes: evidence of impact against the career ladder, written by someone who knows the work. System metrics can provide context there ("the team's lead time halved after the pipeline work you led"), but never a score.

## Rolling Metrics Out

How metrics are introduced decides whether they're trusted. A dashboard that appears from leadership with team names on it reads as surveillance, no matter the intent.

1. **Start with the question.** "Where is our delivery slow?" or "what's making on-call miserable?", not "let's measure productivity."
2. **Teams own their metrics.** Each team sees its own numbers first, picks which ones it cares about, and decides what to do. Leadership sees the same data, aggregated, and the teams' own interpretation of it.
3. **Baseline before changing anything.** A few weeks of data first, so improvement is visible against something.
4. **Trends, not targets.** The question is "are we getting better?", not "did we hit four deploys a day?" DORA's warning about targets is the reason.
5. **Never compare teams on a leaderboard.** Different services have different shapes. Compare a team with its own past.
6. **Revisit every few quarters.** Drop metrics nobody has acted on. A dashboard nobody uses still costs attention.

The cost of this approach is that it's slower and less tidy than a top-down dashboard, and leadership doesn't get one number. I think that's the right trade; the one number would be wrong.

## Measuring AI-Assisted Development Honestly

AI coding tools make measurement harder and more important, because the obvious metrics (code produced, PRs opened) go up whether or not anything improved, and people's own sense of speed turns out to be unreliable.

The evidence so far is mixed and worth reading carefully:

- **DORA's 2025 report** describes AI's primary role as "an amplifier, magnifying an organization's existing strengths and weaknesses" ([State of AI-assisted Software Development 2025](https://dora.dev/research/2025/dora-report/)). Its announcement reports that 90% of respondents use AI at work, a positive relationship between AI adoption and throughput, and that "AI adoption does continue to have a negative relationship with software delivery stability" ([Google Cloud: Announcing the 2025 DORA report](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report)).
- **METR's early-2025 randomized study** of 16 experienced open-source developers on 246 real issues found that with AI tools they took 19% longer, while they had expected a 24% speedup and afterwards still believed AI had sped them up by 20% ([METR, July 2025](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)). Its follow-up with newer tools found that developers increasingly declined to work without AI at all, and METR concluded its new data is "only very weak evidence" and redesigned the study ([METR, February 2026](https://metr.org/blog/2026-02-24-uplift-update/)).

The lesson I take isn't that AI tools help or don't. It's that perceived speedup is not evidence, and that a measurement plan has to be in place before adoption, not after. My defaults:

- **Measure outcomes, not output.** DORA throughput and instability, cycle time, escaped defects and the developer survey, the same set as without AI. If AI helps, it shows up there. More code doesn't count.
- **Watch instability first.** DORA's finding that AI correlates with lower stability is the risk to manage. Change fail rate, rework rate and revert rate are the early warning; small batches are the countermeasure DORA's guide recommends.
- **Slice by authorship where it helps decide policy.** [AI-Assisted Development](/docs/development/ai-assisted-development#measure-agents-like-any-contributor) tags agent-written commits and tracks their change failure and review rounds, to decide what may merge with less review. That's measuring a tool, not a person.
- **Count review load.** If AI produces more code, someone reviews it. Time to first review and reviewer hours per week show whether the cost moved rather than disappeared.
- **Watch maintenance cost.** Code that's easy to generate is still expensive to own; duplicated and unexplained code is [tech debt](/docs/development/tech-debt) with a delayed bill. Track the interest the way that page describes.
- **Ask developers,** in the survey, with specific questions: where AI saves time, where it costs time, how much they trust its output. Read the answers as perceptions, which the METR results show can differ from measured time.

## References

**Research**

- [DORA: Software delivery performance metrics](https://dora.dev/guides/dora-metrics/), the five delivery metrics, throughput and instability, and the pitfalls of targets and comparisons
- [A history of DORA's software delivery metrics](https://dora.dev/guides/dora-metrics/history/), how the four keys became five, reliability, and why MTTR changed
- [DORA: State of AI-assisted Software Development 2025](https://dora.dev/research/2025/dora-report/), AI as an amplifier of existing strengths and weaknesses
- [Google Cloud: Announcing the 2025 DORA report](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report), AI adoption, throughput and the negative relationship with stability
- [The SPACE of Developer Productivity](https://queue.acm.org/detail.cfm?id=3454124), Forsgren, Storey et al., ACM Queue (2021): five dimensions, the myths, and measuring at least three dimensions with one perceptual
- [DevEx: What Actually Drives Productivity](https://queue.acm.org/detail.cfm?id=3595878), Noda, Storey, Forsgren and Greiler, ACM Queue (2023): feedback loops, cognitive load and flow, perceptions and workflows, survey design
- [METR: Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/), the randomized study where developers took 19% longer and believed they were faster
- [METR: changing the developer productivity experiment design](https://metr.org/blog/2026-02-24-uplift-update/), the follow-up and why its data is weak evidence

**Reference**

- [DORA: Working in small batches](https://dora.dev/capabilities/working-in-small-batches/), cycle time, batch size and small batches as the countermeasure to AI-driven instability
- [GitHub: Good DevEx increases productivity](https://github.blog/research/good-devex-increases-productivity/), self-reported findings on flow, cognitive load and feedback loops
- [Goodhart's law](https://en.wikipedia.org/wiki/Goodhart%27s_law), Goodhart's formulation and Strathern's phrasing

**In practice**

- [Ron Jeffries: Story Points Revisited](https://ronjeffries.com/articles/019-01ff/story-points/Index.html), why story points shouldn't compare teams or measure productivity
