+++
title = "AI-Assisted Testing"
description = "Agents that drive a real browser to explore, find UI and UX gaps, and write bug reports, and how every confirmed finding becomes an automated test."
category = "Quality"
order = 1055
tags = ["quality", "testing", "ai", "agents", "exploratory-testing"]
+++

Exploratory testing never automated well, because a script can't decide its next test from what the last one showed. A model driving a real browser can, imperfectly. It clicks, reads the console, looks at the screenshot, notices the label that wraps, and tries the next thing. That puts a new tool between the person exploring and the [automated suite](/docs/quality/automated-testing): the agent explores, a person judges, and the suite keeps what was learned.

The order matters. An agent's exploration is cheap, broad and nondeterministic, which is exactly right for finding questions and exactly wrong for a release gate. Its findings are leads until a person or a test confirms them, and its lasting output is tests, not reports.

## Give the Agent Eyes

A coding agent that writes UI code can't see it. It reasons from the JSX and the CSS to what it thinks renders, and that's where its UI mistakes live: the dark-mode token it didn't check, the button the sticky footer covers at phone width, the flex row that overflows with a long name. Typecheck and unit tests pass, the diff reads fine, and the page is wrong.

A browser closes that loop. With [Claude in Chrome](https://code.claude.com/docs/en/chrome) connected to Claude Code, the same session that wrote the change opens it, takes a screenshot, reads console errors and the DOM, and fixes what it finds. Anthropic's docs list the jobs plainly: live debugging from console errors and DOM state, design verification against a mock, and web app testing of form validation, visual regressions and user flows. My rule from [AI-Assisted Development](/docs/engineering/ai-assisted-development#run-it-before-you-believe-it) applies here first: nothing visual is done until it has been looked at in each theme and at phone width, and the agent can do that looking itself.

## What an Agent Finds

Pointed at a running app with a charter, an agent is good at the tireless half of exploration:

- **Breadth.** Every page at three widths, in both themes, as each role. A person does this once and skims; an agent does it every time, in the same detail on the fortieth page as on the first.
- **What's under the page.** Console errors, failed requests, hydration warnings, a 404 on a font or an image. Nobody opens the console while clicking through a flow; an agent can read it after every action.
- **Visual and layout gaps.** Truncated labels, overlapping elements, text that fails contrast, an empty state that looks like an error, a modal that scrolls off a small screen. It sees the screenshot and the accessibility tree together, so it can say both "this looks broken" and "this button has no name".
- **The heuristics, applied literally.** Give it the [heuristics table](/docs/quality/exploratory-testing#heuristics-and-tours) and it will try zero, one and many, the boundary values, the long name in Arabic, the back button halfway through, and the double submit, without getting bored.
- **The write-up.** Steps from a known state, expected and actual, the console line, the request that failed, and a screenshot or GIF recording, in the shape of [a good bug report](/docs/quality/defects#the-bug-report). This is often the most valuable part: the evidence is captured at the moment it happened.

## What It Misses

The agent's limits are the same ones [AI-Assisted Development](/docs/engineering/ai-assisted-development#plausible-but-wrong) describes for code: its mistakes look exactly like its successes.

- **Confident misses.** "Everything works" after checking two of the five states it was asked about. Ask what it didn't cover, and treat a report without that section as incomplete.
- **Confident false alarms.** A "bug" that was its own misclick, a timing guess, or a misread screenshot. Nothing becomes a defect until it's been reproduced, by a person or by a test that fails.
- **Judgment.** It can say a flow has six steps; it can't be confused the way a new customer is, or know that "Archive" means something different to this domain's users. Usability calls, [acceptance](/docs/quality/exploratory-testing#user-acceptance-testing) and taste stay with people.
- **Anything outside the browser.** Real devices, OS dialogs, screen readers, printed output. The [accessibility](/docs/frontend/accessibility#testing) keyboard and screen-reader passes are still a person's job.
- **Repeatability.** Two runs of the same charter explore differently. That's the point of exploration and the reason an agent never sits in the CI pass/fail path.

## Choosing the Browser

Three tools cover most of this, and they answer different questions:

| Tool | Drives | Best for | Watch for |
| ---- | ------ | -------- | --------- |
| [Claude in Chrome](https://code.claude.com/docs/en/chrome) | Your real Chrome, in a visible window, from Claude Code | Exploring alongside development, checking a change by eye, reading console and network, recording GIFs | It shares your browser's sign-ins, so it can act on any site you're logged into |
| [Playwright MCP](https://github.com/microsoft/playwright-mcp) | A Playwright browser, through structured accessibility snapshots | Exploration that should end in Playwright code; isolated sessions with seeded storage state | Snapshots read structure, not pixels, so layout problems need a screenshot to show up |
| [Playwright test agents](https://playwright.dev/docs/test-agents) | Planner, generator and healer agents over your Playwright project | Turning explored flows into a reviewed plan and then into tests | The healer can change a test until it passes |

My default: Claude in Chrome while building, because the agent and I are looking at the same window and it sees what the user would see. Playwright's tools when the session's output is meant to be a test, because they speak the suite's language. Playwright MCP describes itself as working "purely on structured data", with no vision model needed, which makes it good at locators and poor at noticing that something looks wrong; the two complement each other.

## Charter the Agent

An agent session without a charter is ad hoc clicking at machine speed. Use the [same template](/docs/quality/exploratory-testing#writing-charters) as for a person, explore *target* with *resources* to discover *information*, and add what a person would have from the debrief: what to report and in what shape.

```markdown
Explore the refund flow on the preview build, signed in as the
support-agent test account, to discover whether a partial refund
leaves the order, the totals and the ledger consistent.

- Try: full and partial refunds, a refund larger than the capture,
  a second refund while the first is pending, back and reload mid-flow.
- Check at 375px and 1280px wide, in light and dark themes.
- Read the console and failed requests after every action.
- Don't change any data outside orders you create.

Report: what you covered, what you didn't and why, each problem with
steps, expected, actual, the console line or request, and a screenshot.
Mark anything you couldn't reproduce twice as unconfirmed.
```

Scope it like a session: one area, one risk, a stopping point. "Test the app" produces a long, shallow report of typos. Charters come from the same places as a person's, the risks in the [quality strategy](/docs/quality/strategy), recent incidents and what changed this release, and the agent's report feeds the same debrief.

## From Finding to Test

Exploration finds the question; automation keeps asking it. For an agent the second step is nearly free, because it already knows the steps it took, so every confirmed finding should leave a test behind:

1. **Reproduce it.** A person, or the agent in a fresh session, follows the reported steps. Unconfirmed findings stop here.
2. **Write the test first and watch it fail.** The agent writes it from its own steps, to the [end-to-end rules](/docs/quality/automated-testing#end-to-end-tests-that-hold-up): role locators, state through the API, no sleeps. A test that passes before the fix proves nothing.
3. **Fix it, and see the test pass.** Then run the charter again on the fixed build.
4. **File the defect** with the test linked, per [Every Fix Gets a Regression Test](/docs/quality/defects#every-fix-gets-a-regression-test).

Most UI findings translate into an assertion Playwright already has. "The Refund button is under the sticky footer on a small phone" is a click actionability check: Playwright's click requires the element to [receive events](https://playwright.dev/docs/actionability), meaning it is the hit target at the action point, and `trial` runs those checks without clicking.

```ts
test("refund button is reachable on a small phone", async ({ page, api }) => {
  // Arrange: the order through the API, the viewport the agent found it at
  const order = await api.createPaidOrder({ total: "42.00" });
  await page.setViewportSize({ width: 375, height: 667 });

  // Act and assert: fails if anything covers the button
  await page.goto(`/orders/${order.id}`);
  await page.getByRole("button", { name: "Refund" }).click({ trial: true });
});
```

Findings that are about appearance rather than behavior (contrast, a wrong token, a layout shift) belong in [visual regression tests](/docs/quality/cross-platform-testing#visual-regression-testing) or the [automated accessibility checks](/docs/quality/cross-platform-testing#automated-accessibility-checks), not in a pile of one-off assertions.

Playwright's test agents formalize the same pipeline. The planner explores the app and writes a Markdown plan in `specs/`, the generator turns it into tests and "verifies selectors and assertions live as it performs the scenarios", and the healer reruns failures and patches them. The plan is the review point: a person reads `specs/` before any test is generated, because a plan that tests the wrong thing produces a suite that confidently checks the wrong thing.

## Healing Isn't Fixing

A self-healing test is an agent editing the test until it passes. That's fine for a renamed button and harmful for a real bug, where the healthy outcome is a red build. Playwright's healer can return "a skipped test if the healer believes that functionality is broken", which is better than a passing one, but a skipped test is still a silent one.

My rule: **healed changes go through review like any other diff.** A locator change needs only a glance. A changed assertion, an added wait, or a skip is a behavior change and needs a person to say why the old expectation was wrong. A suite that heals itself without review drifts toward whatever the app currently does, which is the opposite of a test.

## Safe to Point at

An agent driving a browser can do anything the browser can, steered by any text it reads.

- **A separate profile with test accounts.** Claude in Chrome shares the browser's login state, so explore from a Chrome profile signed in only to [test accounts](/docs/quality/test-data#test-accounts-in-production), never from the one that holds your email, cloud console and production admin.
- **Local, preview or staging, with synthetic data.** Not production as a real user, and never with real customer records in view. Use the extension's site permissions to limit where it can click and type.
- **Pages are untrusted input.** Text on a page, in a support ticket or in seeded data can carry instructions aimed at the agent; see [AI Security](/docs/security/ai-security). A test environment full of user-generated content is a prompt-injection surface.
- **Review recordings before sharing.** Anthropic's docs warn that a GIF captures everything visible in the browser, including account details on logged-in pages.

## Where It Fits

| When | What the agent does | What people do |
| ---- | ------------------- | -------------- |
| Every UI change | Opens it in each theme and at phone width, reads the console, fixes what it sees | Review the diff and the screenshots |
| A feature reaches a testable state | Chartered sweeps for breadth: widths, roles, heuristics, data variety | A chartered session on what the sweep can't judge: meaning, flow, usability |
| Before a bug bash | A sweep that clears the typos and console errors first | The [bug bash](/docs/quality/exploratory-testing#bug-bashes) finds the interesting ones |
| A bug is confirmed | Writes the failing test from its own steps | Review the test and the fix |

The agent doesn't replace the exploratory session; it moves the person's hour from breadth to judgment. The output of both is the same three things: a defect for each bug, an automated test for each that can have one, and a sharper charter for the area that turned out to be fragile.

## References

**Reference**

- [Claude Code: Use Claude Code with Chrome](https://code.claude.com/docs/en/chrome), browser testing, console reading, site permissions and GIF recording from Claude Code
- [Playwright: Test agents](https://playwright.dev/docs/test-agents), the planner, generator and healer, `specs/` plans and the seed test
- [Playwright MCP](https://github.com/microsoft/playwright-mcp), browser automation for agents through accessibility snapshots, with isolated and persistent profiles
- [Playwright: Actionability](https://playwright.dev/docs/actionability), the checks a click runs, including receiving events
- [Playwright: Locator](https://playwright.dev/docs/api/class-locator), the `trial` option that runs actionability checks without acting
