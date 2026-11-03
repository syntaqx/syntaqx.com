+++
title = "Communication & Meetings"
description = "Written by default, async first, meetings that earn their place, decision logs, status updates that lead with the ask, chat norms and working across time zones."
category = "Leadership"
order = 1308
tags = ["leadership", "communication", "meetings", "remote"]
+++

Most engineering teams don't have a communication problem so much as a defaults problem. Decisions get made in a call and live only in the memories of whoever attended. Status is a meeting. Questions go to DMs, so the answer helps one person once. Every new hire, every time zone and every person who was on vacation that week pays for it.

My defaults are the opposite: write it down first, make meetings the exception that has to justify itself, put conversations where others can find them, and say plainly what you need from whom by when. They cost something real (writing well takes longer than talking), and I'll defend paying it.

## Written by Default

Anything that matters past this week gets written: decisions, proposals, status, plans, the reasoning behind a change. Basecamp's guide puts the case in two lines: "Writing solidifies, chat dissolves," and "Speaking only helps who's in the room, writing helps everyone" ([How We Communicate](https://basecamp.com/guides/how-we-communicate)). GitLab, which runs a large company without offices, makes the same rule explicit: conclusions of offline conversations get written down, and "The email or Slack message should not be the source of truth" ([GitLab Handbook: Communication](https://handbook.gitlab.com/handbook/communication/)).

Writing does three things talking doesn't:

- **It forces the thinking.** A proposal that sounds convincing in a meeting often falls apart on the page, because prose doesn't let you skip the step you haven't worked out. Amazon's version of this is the six-page memo instead of slides: "We don't do PowerPoint (or any other slide-oriented) presentations at Amazon. Instead, we write narratively structured six-page memos," and a great one "probably should take a week or more" ([2017 Letter to Shareholders](https://www.aboutamazon.com/news/company-news/2017-letter-to-shareholders)).
- **It scales across time.** The person who joins next year can read why the system looks the way it does. That's most of what [onboarding](/docs/leadership/onboarding#the-docs-are-the-onboarding-path) runs on.
- **It's fair to people who think before they speak.** A written proposal with a comment period gets input from the quiet engineer and the one in another time zone, not just the fastest talker in the room.

The cost is time and skill. Writing clearly is harder than talking, and some people are slow at it at first. I treat it as a core engineering skill and give feedback on writing the way I would on code.

For technical decisions specifically, the format is a [design doc](/docs/development/design-docs), with a named decider and a date ([A Decider and a Date](/docs/development/design-docs#a-decider-and-a-date)). This page covers everything else.

## Async First, With Clear Response Expectations

Async first means a message shouldn't require the other person to drop what they're doing. GitLab's handbook: "we use asynchronous communication as a starting point," and "You are not expected to be available all the time." Basecamp: "Real-time sometimes, asynchronous most of the time," and "Never expect or require someone to get back to you immediately unless it's a true emergency."

Async without response expectations just becomes slow, so I write them down for the team:

| Channel | Expected response | Use it for |
| --- | --- | --- |
| Pager | Minutes, on-call only | Production incidents ([On-Call](/docs/operations/on-call)) |
| Direct mention in a team channel | Same working day | A question blocking someone's work today |
| Channel message, no mention | Within a working day or two | Questions, FYIs, discussion |
| Doc comment or PR review request | Within a working day | Review, feedback on a proposal |
| Email | A few working days | External contacts, formal notices |

The table does two jobs: it tells senders how to signal urgency, and it gives everyone permission to not watch chat all day. Deep work needs that permission written down; otherwise the most responsive person sets the norm for everyone.

When something really is urgent, say so in words ("blocking the release, need an answer by 3pm UTC") rather than through a second ping or a DM. Basecamp's line, "Urgency is overrated, ASAP is poison", is right about the default; a real deadline should be stated as a deadline.

## Meetings That Earn Their Place

A meeting is the most expensive way to communicate. Basecamp: "Five people in a room for an hour isn't a one hour meeting, it's a five hour meeting," and "Meetings are the last resort, not the first option." Microsoft's 2023 Work Trend Index found that people rank "inefficient meetings" as their top productivity disruptor, that the average employee spends 57% of their time communicating (meetings, email and chat combined), and that only 35% think they'd be missed in most of their meetings ([Will AI Fix Work?](https://www.microsoft.com/en-us/worklab/work-trend-index/will-ai-fix-work)).

Meetings earn their place when the conversation needs real-time back and forth, or when the relationship matters as much as the content. The ones I keep:

- **[1:1s](/docs/leadership/one-on-ones).** Weekly, and the last meeting I'd cut. Feedback and hard conversations don't work async.
- **Planning.** At the start of a cycle, to agree what the team is taking on and what it isn't. The proposal is written in advance; the meeting resolves disagreements.
- **[Incident reviews](/docs/operations/incident-response#the-postmortem).** The written postmortem comes first; the meeting is where people who were there fill gaps and agree on actions.
- **Design discussions that stalled in comments.** When a doc's comment thread has gone around twice without converging, 30 minutes on a call usually settles it. The outcome goes back in the doc.
- **Team time with no agenda.** A social call or retro. It's a meeting whose purpose is the relationship; it should be labeled as such and optional.

**Standups are optional, and short when kept.** If the team's board and a written check-in already show who's doing what, a daily status meeting adds an interruption and little else. Where a team finds a standup useful (new team, tightly coupled work, a crunch), keep it to 15 minutes, about blockers and coordination rather than a recital of yesterday, and end it on time. A written daily check-in works across time zones in a way a standup can't; Basecamp's version is an automatic question whose answers are "shared with everyone in the company."

## Meeting Hygiene

For any meeting that survives, the same rules:

- **An agenda in advance, or no meeting.** GitLab: "Ensure that every meeting has an agenda and is available for everyone to edit." No agenda by the start time means the meeting is cancelled, and that's a normal, blameless outcome.
- **One owner.** The person who called it runs it, keeps time, and is responsible for the notes going out.
- **Pre-reads read.** If there's a document, it goes out a day ahead, or the first ten minutes are silent reading, Amazon's "study hall." Either way nobody presents slides of a doc everyone could read.
- **Notes in the agenda doc, decisions marked.** What was decided, by whom, and the action items with an owner and a date. A meeting with no written outcome might as well not have happened for everyone who wasn't there.
- **Smallest useful group.** Invite the people who need to decide or contribute; everyone else reads the notes. Optional attendees are genuinely optional.
- **Default to 25 or 50 minutes,** so people can get between meetings.
- **Recurring meetings get reviewed.** Every quarter, ask of each recurring meeting whether it would be created today. Most teams accumulate them and never delete any.

A one-page template keeps this cheap:

```markdown
# Planning: payments team, cycle 14
Owner: [name] · Date: [date] · Pre-read: [link to proposal]

## Agenda
1. Confirm scope for the cycle (15 min)
2. Decide: keep or cut the refund-export work (10 min)
3. Risks and dependencies on other teams (5 min)

## Notes
- ...

## Decisions
- DECIDED: refund export is out this cycle; revisit in cycle 15. (Decider: [name])

## Actions
- [ ] [name]: tell support the export moved, by [date]
```

## Decision Logs

The single highest-value written artifact for a team, after design docs, is a decision log: a running list of decisions with the date, who decided, a one-line summary, and a link to the discussion. It answers "why do we do it this way?" without anyone needing to remember, and it stops decisions being relitigated by people who weren't there.

Decisions get made in meetings, threads and hallway calls; the rule is that wherever it happened, the decider adds it to the log the same day. A decision not in the log isn't final.

Disagreement is part of this. Not everyone will agree with every decision, and waiting for unanimity is slow. Bezos' 2016 letter has the phrase I use: "disagree and commit," and the guidance that "most decisions should probably be made with somewhere around 70% of the information you wish you had. If you wait for 90%, in most cases, you're probably being slow" ([2016 Letter to Shareholders](https://www.aboutamazon.com/news/company-news/2016-letter-to-shareholders)). Record the dissent in the log alongside the decision; it's useful when you revisit it.

## Status Updates That Lead With the Ask

Most status updates bury the one thing the reader needs to act on under a paragraph of activity. I write them in order of what the reader must do:

```text
ASK: Need a decision from [name] by Thursday on whether to delay
the migration a week (details below). Default if no answer: the migration moves a week.

STATUS: At risk. Cutover planned for the 14th; now likely the 21st.

WHY: The replica lag test failed at peak load. Fix is understood
(batching writes), about three days of work.

DONE THIS WEEK: Schema migrated in staging; load test harness built.
NEXT: Batch writes, rerun the load test Tuesday.
```

- **The ask first,** with who, what and by when, and what happens if nobody answers. If there's no ask, say so ("no action needed").
- **One status word** that means something: on track, at risk, off track. Not green when it's amber.
- **The why in two sentences,** for anything not on track.
- **Activity last,** for the people who want it.

A weekly written update replaces most status meetings. Basecamp's principle that "If you want an answer, you have to ask a question" applies to the ask line: a status update without a question gets read and not answered.

## Chat Norms

Chat is where communication goes to dissolve, so it needs rules more than any other channel.

- **Channels over DMs.** GitLab: "Use issues or public chat channels... instead of direct messages or one-on-one emails." A question answered in a channel helps everyone who has it later and lets someone other than the person you asked answer it. DMs are for personal or sensitive matters.
- **Threads for replies.** One topic per thread keeps a busy channel readable and lets people follow what matters to them.
- **Ask the whole question.** "Hey, got a minute?" followed by silence costs the other person two context switches. Write the question, the context and what you've tried in the first message.
- **Urgency is stated, not implied.** A mention means "I need you specifically"; `@channel` and `@here` are for things everyone needs now, which is rare. Say the deadline in words.
- **Decisions leave chat.** Basecamp: "If it's important, critical, or fundamental, write it up, don't chat it down." When a thread reaches a decision, someone writes it into the decision log or the doc, and posts the link back in the thread.
- **Status signals are honest.** Set your status when you're heads-down, out, or outside working hours, and respect others'. Messages outside someone's working hours don't expect a reply.

## Working Across Time Zones

GitLab's reminder that teams span "significant time-zone differences" turns into a few concrete practices:

- **Overlap hours, written down.** Find the two or three hours where most of the team is working and protect them for the meetings that must be synchronous. Everything else assumes no overlap.
- **Rotate the inconvenient slot.** If a recurring meeting is early for one region and late for another, alternate so the same people don't always pay.
- **Handoffs in writing.** At the end of a day, work that continues in another region gets a short note: where it stands, what's next, what's blocked, where the context lives. On-call handoffs follow the same rule.
- **Times in UTC** (or with the time zone) in anything written, and recordings of the meetings that happen outside someone's hours, with notes they can read in five minutes.
- **Decide without waiting a day per round trip.** A proposal with a comment deadline ("comments by Wednesday 17:00 UTC, decision Thursday") lets everyone contribute in their own hours, where a chain of questions across zones takes a week.

Team boundaries matter here too: a team spread across too many zones has no overlap at all, which is an argument for drawing teams along time zones where you can ([Team Structure](/docs/leadership/team-structure)).

## All-Hands and Transparency

Default to sharing. The roadmap, the reasoning behind priorities, how the company is doing, what leadership is worried about: if it's not confidential for a real reason (personal data, legal, a deal under negotiation), it should be visible to the team. People make better local decisions when they know the context, and they fill gaps with rumor when they don't.

The all-hands, monthly or so, is where that context gets explained and questioned. What makes it work:

- **Written first.** The numbers and updates go out as a document; the meeting is for questions and the things that need a voice.
- **Real questions, answered.** An open question doc, with anonymous questions allowed, answered in the meeting or in writing after. A question dodged in public is remembered longer than any answer.
- **Recorded,** for every time zone that couldn't attend.

## Communicating Bad News and Change

Bad news travels badly through hallways and DMs; it should be delivered once, clearly, by the person responsible for it.

- **Early and direct.** A slipped deadline told two weeks ahead is a planning input; told the day before, it's a failure. The same goes for upward reporting: a status of "at risk" that turns into "off track" with no warning erodes trust faster than the slip itself.
- **The news first, then the reasons, then what happens next.** Not a long preamble that makes everyone guess.
- **Don't sandwich it.** Basecamp: "Great news delivered on the heels of bad news makes both bits worse." Give each its own space.
- **Invite questions, and answer them.** Basecamp again: "If something's going to be difficult to hear or share, invite questions at the end." Silence in the meeting usually means speculation in private afterwards.
- **The affected people hear first.** Anyone whose role, team or project is changing hears it from their manager, in person, before the announcement. Reading about your own reorg in a channel is a failure of the manager, not the person.
- **During incidents, communicate on a clock,** not when there's news ([Incident Response](/docs/operations/incident-response#communicate-on-a-clock)). Regular updates with "no change" are better than silence.

Change in general (a new process, a reorg, a tool migration) needs the same written treatment as a technical decision: what's changing, why, what stays the same, when, and who to ask. Then expect to repeat it, because the first announcement reaches fewer people than anyone thinks.

## References

**Reference**

- [GitLab Handbook: Communication](https://handbook.gitlab.com/handbook/communication/), async as the starting point, agendas, public channels over DMs, and written sources of truth
- [Basecamp: How We Communicate](https://basecamp.com/guides/how-we-communicate), principles on writing, async, meetings, urgency and delivering bad news

**Research**

- [Microsoft Work Trend Index 2023: Will AI Fix Work?](https://www.microsoft.com/en-us/worklab/work-trend-index/will-ai-fix-work), inefficient meetings as the top productivity disruptor and time spent communicating

**In practice**

- [Amazon 2017 Letter to Shareholders](https://www.aboutamazon.com/news/company-news/2017-letter-to-shareholders), six-page narrative memos instead of slides, read silently at the start of meetings
- [Amazon 2016 Letter to Shareholders](https://www.aboutamazon.com/news/company-news/2016-letter-to-shareholders), "disagree and commit" and deciding with about 70% of the information
