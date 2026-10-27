+++
title = "Manual & Exploratory Testing"
description = "What people catch that scripts can't, chartered exploratory sessions, heuristics, bug bashes, acceptance testing, and when manual work earns a place."
category = "Quality"
order = 1054
tags = ["quality", "testing", "exploratory-testing", "process"]
+++

An automated test checks what someone thought to assert. Everything else, the confusing label, the flow that works but makes no sense, the bug that only shows up when you hit back halfway through checkout, is invisible to it. Manual testing is how you find what nobody thought to ask about, and that's the only job I give it. Anything a person checks the same way twice belongs in the [automated suite](/docs/quality/automated-testing).

## What People Catch

A script compares output to an expectation. A person notices things there was never an expectation for:

- **Usability.** The button is there and works, and nobody can find it. The form validates correctly and the error message blames the user for the system's rule.
- **Copy and meaning.** A label that says "Archive" and deletes. A confirmation that doesn't say what's being confirmed. Units missing from a number.
- **Things that are technically correct.** A total that's right but formatted in the wrong currency for the account. A list sorted by an ID nobody understands. An empty state that looks like an error.
- **Combinations nobody wrote down.** Two features that each pass their tests and conflict when used together, or a flow that breaks when you change your mind halfway through.
- **"That's odd."** The page that takes slightly too long, the flicker on load, the count that's off by one only for the second page. A person stops and pulls the thread; a script passes on.

Each of those, once found, usually becomes an automated check. Exploration finds the question; automation keeps asking it. An agent driving a browser can take the tireless half of this, the breadth and the write-ups, and turn its confirmed findings into tests; see [AI-Assisted Testing](/docs/quality/ai-assisted-testing).

## Scripted Manual Testing Is a Smell

A spreadsheet of numbered steps with expected results, executed by hand before each release, is an automated test running on the slowest, most expensive and least consistent hardware available. People skim steps they've done forty times, and the script never changes, so it stops finding anything after its first few runs.

My rule: **if it can be written as steps and an expected result, automate it.** Scripted manual testing survives in two places only: checks that can't be automated at a sensible cost (a physical device, a printed receipt, a third-party screen you don't control), and a short checklist for those, covered below. A long manual regression pass is a sign the code isn't testable in pieces, the same disease as the [ice-cream cone](/docs/quality/testing#where-the-pyramid-goes-wrong).

## Exploratory Testing

Cem Kaner coined the term in the 1980s; James Bach's working definition is "performing tests while learning things that may influence the testing." The usual short form is simultaneous learning, test design and execution. The tester decides the next test based on what the last one showed, instead of following a plan written before anyone saw the software.

It isn't ad hoc clicking. Done well it has a goal, a time box, notes, and a report, and it's skilled work: knowing where bugs hide, which variations matter, and when a small oddity is worth an hour. Elisabeth Hendrickson's *Explore It!* is the practical guide, and the structure below comes from it and from the Bachs.

## Session-Based Test Management

Session-based test management (SBTM), from Jonathan and James Bach, makes exploration manageable without scripting it. The unit of work is the session, which Jonathan Bach defines as "an uninterrupted block of reviewable, chartered test effort":

- **Chartered:** each session has a mission, what's being tested or what problems to look for.
- **Uninterrupted:** no email, chat or meetings. A session that keeps getting interrupted produces scattered notes and shallow testing.
- **Time-boxed.** In the original practice sessions ran about ninety minutes, give or take. My default is 60 to 90 minutes: long enough to get past the obvious, short enough to stay focused.
- **Reviewable:** a session sheet records the charter, who tested, when, the notes, the bugs, and the issues (questions about the process or project, not the product).
- **Debriefed.** A short conversation after each session, whose first goal, in Bach's words, is to "understand and accept the session report": what was covered, what wasn't, what's worth another session.

SBTM also splits session time into test design and execution, bug investigation and reporting, and setup (the TBS metrics), and tracks time spent "on charter" versus on opportunity, following something off-charter that looked important. Going off charter is allowed; if a whole session drifts, the debrief rewrites the charter to match what was done. The ratios matter more than the numbers: a team spending most of a session on setup has an environment problem, not a testing problem ([Test Data & Environments](/docs/quality/test-data)).

### Writing Charters

Hendrickson's three-part template:

> Explore *target* with *resources* to discover *information*.

- **Target:** where you're exploring, a feature, a requirement, a module.
- **Resources:** what you bring, a tool, a data set, a technique, a configuration, another feature.
- **Information:** what you want to learn, the risk you're probing.

For example: "Explore refunds with a partially captured payment to discover whether totals and ledger entries stay consistent." Or: "Explore the invite flow with an expired link and a second browser session to discover what an invited user sees." A charter is one sentence and points at a risk. "Test the settings page" is not a charter; it has no information to discover, so the session has no way to finish.

Write charters from the risks in the [quality strategy](/docs/quality/strategy), from recent incidents, from areas that changed this release, and from questions people keep asking in review. Keep them in a backlog; the Bachs called theirs the hopper.

## Heuristics and Tours

A heuristic is a fallible prompt for a test idea, and the useful ones are short enough to carry in your head. The [Test Heuristics Cheat Sheet](https://www.ministryoftesting.com/articles/ab1cd85c), started by Elisabeth Hendrickson, James Lyndsay and Dale Emery and now maintained with Ministry of Testing, is the standard list. The ones I reach for first:

| Heuristic | Prompt | Finds |
| --------- | ------ | ----- |
| Boundaries | At the limit, just under, just over | Off-by-one, validation gaps |
| Goldilocks | Too big, too small, just right | Overflows, truncation, layouts that break |
| Count | Zero, one, many | Empty states, pluralization, pagination |
| Selection | Some, none, all | Permission gaps, "select all" bugs |
| Position | Beginning, middle, end | Edge-of-list and edit-position bugs |
| CRUD | Create, read, update, delete each thing | Orphans, stale views, missing delete paths |
| Follow the data | Walk one record through every step and check it at each | Data lost or changed between steps |
| Interruptions | Log off, time out, cancel, kill the process, lose the network | Half-done state, duplicate submissions |
| Multi-user | Same record from two accounts, or one account twice | Lost updates, races |
| State analysis | Draw the states and transitions, then try the missing ones | Illegal transitions that the UI forgot to block |
| Sequences | Reverse, repeat, undo, redo, do it simultaneously | Order-dependent bugs |
| Configurations | Screen size, network speed, locale, device | Environment-specific failures |

Two I add for most products: **permissions** (every action as every role, including one that just lost access) and **data variety** (long names, non-Latin scripts, emoji, right-to-left text, time zones, currencies with no minor unit). [Internationalization](/docs/frontend/internationalization) and [accessibility](/docs/frontend/accessibility#testing) bugs fall out of those two faster than from any script.

Tours are a way to pick charters: James Whittaker's *Exploratory Software Testing* frames sessions as tours of districts of a city (business, historical, entertainment, seedy and others), each with a different point of view on the product. Useful when a team keeps exploring the same comfortable paths.

## Bug Bashes

A bug bash puts many people on the product at once for a fixed block of time, usually before a launch. Run badly, it's an afternoon that produces sixty duplicate tickets about the same typo. Run well:

- **Charter it.** Give each person or pair a charter or an area, so coverage is spread and not everyone tests sign-up.
- **Mix the room.** Engineers from other teams, support, sales, design. The people who didn't build it find the most, because they don't know which paths to avoid.
- **Prepare the environment.** Accounts, seeded data and a build ready before anyone arrives, or the first hour is setup.
- **One place to report,** with a short template (steps, expected, actual, screenshot) and someone triaging live to merge duplicates and ask follow-ups while the reporter still remembers.
- **Time-box it** to 60 to 90 minutes, then a short debrief: the worst three findings, areas nobody reached.
- **Triage the same day** with the normal process in [Defects & Triage](/docs/quality/defects). A bug bash whose tickets sit untriaged for a week teaches people not to come to the next one.

## User Acceptance Testing

User acceptance testing asks a different question from every other test: not "does it work" but "does it do what the people who asked for it need". So it should be done by those people, or the closest you have: the customer, the internal team whose workflow it changes, the product owner who wrote the requirement. Engineers running UAT on their own feature are checking their understanding against itself.

- **Give it real scenarios,** written by the users from their actual work, not acceptance criteria copied from the ticket.
- **Do it before the release, not as the release.** UAT that finds a misunderstood requirement the day before launch is a planning failure; show people working software early and often, behind a [feature flag](/docs/delivery/feature-flags) in production where possible.
- **Record the sign-off** when it's contractual or regulated, with who accepted what version. Otherwise it feeds [Release Readiness](/docs/quality/release-readiness) like any other evidence.

## Regression Checklists

Test case management systems (a database of thousands of manual test cases, with runs, assignments and pass rates) solve a problem I'd rather not have. They make a large manual regression pass easy to administer, which makes it easy to keep, and they live away from the code, so they rot the moment the code changes.

My default: **a short checklist in the repository** for the handful of things not automated, reviewed in the same pull request as the code that changes them. A Markdown file per area is enough. Each item says what to check and why it isn't automated, so the list gets shorter as reasons expire. If the checklist takes more than about an hour to run, something on it should have been automated already. Exploratory sessions don't belong in it; they get charters, because their value is that they're different every time.

## When Manual Testing Earns a Scheduled Place

Exploration should happen continuously, a session whenever a feature reaches a testable state. A few situations earn time on the release plan:

| Situation | Why | What I schedule |
| --------- | --- | --------------- |
| New feature | Nobody knows the failure modes yet | Chartered sessions before the flag widens, by someone other than the builder |
| Risky release | Migrations, pricing, permissions, big refactors | Sessions on the changed area plus its neighbors, and a bug bash for the largest |
| Hardware and mobile | Real devices, sensors, OS dialogs, interruptions | Device sessions per [Mobile Releases](/docs/delivery/mobile-releases), on the beta build |
| Payments flows | Real money, third-party screens, 3D Secure | A checklist pass in the processor's test mode, and a real small-value transaction after release |
| Accessibility | Automated scans catch only part of it | Keyboard and screen-reader sessions per [Accessibility](/docs/frontend/accessibility#testing) |

Whatever the session finds goes three places: a defect for each bug, an automated test for each bug that can have one, and a note in the next charter for the area that turned out to be fragile.

## References

**Foundations**

- [James Bach: Exploratory Testing](https://www.satisfice.com/exploratory-testing), the working definition, and Cem Kaner coining the term
- [Jonathan Bach: Session-Based Test Management](https://www.satisfice.com/download/session-based-test-management) (STQE, November/December 2000), sessions, session sheets, debriefs and the TBS metrics
- [Elisabeth Hendrickson: Explore It!](https://pragprog.com/titles/ehxta/explore-it/), chartering and running exploratory sessions
- [James Whittaker: Exploratory Software Testing](https://www.informit.com/store/exploratory-software-testing-tips-tricks-tours-and-9780321636416), the tourist metaphor and touring tests

**Reference**

- [Ministry of Testing: Test Heuristics Cheat Sheet](https://www.ministryoftesting.com/articles/ab1cd85c), Goldilocks, CRUD, interruptions, count, selection and the rest
- [Workroom Productions: Shaping Testing with Charters](https://www.workroom-productions.com/shaping-testing-with-charters/), Hendrickson's target, resources, information template
