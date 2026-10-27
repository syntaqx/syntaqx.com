+++
title = "Automated Testing"
description = "Choosing test tools, end-to-end tests that survive redesigns, page objects vs helpers, property and snapshot tests, suite speed, and failure artifacts."
category = "Quality"
order = 1053
tags = ["quality", "testing", "automation", "e2e", "ci"]
+++

[Testing Strategy](/docs/quality/testing) decides what to test and at which level. This doc is about the craft of the suites themselves: which tools, how to write tests that survive a redesign, how to keep them fast, and what a failure should leave behind. The goal is a suite where a red build means a real bug, and finding it takes minutes.

## Choosing the Tools

Pick boring, well-supported tools that match the language of the code under test, and pick one per job. Two end-to-end frameworks in one repository means two sets of helpers, two sets of flakes and half the expertise in each.

| Job | My default | Also fine | Notes |
| --- | ---------- | --------- | ----- |
| Unit and integration, JS/TS | [Vitest](https://vitest.dev/) | [Jest](https://jestjs.io/) | Vitest shares the Vite config, so there's no second build setup to keep in sync |
| Unit and integration, Python | [pytest](https://docs.pytest.org/) | | Fixtures and parametrization cover what other runners need plugins for |
| Unit and integration, Go | `go test` | | The standard library is enough; table-driven tests are the idiom |
| API tests | The same runner, with an HTTP client | | API tests are integration tests; keep them in code, in the repository, not in a separate GUI tool |
| Web end to end | [Playwright](https://playwright.dev/) | [Cypress](https://docs.cypress.io/) | Playwright drives Chromium, Firefox and WebKit from one API and runs tests in parallel out of the box |
| Web, legacy or grid-based | [Selenium](https://www.selenium.dev/) / [WebDriver](https://www.w3.org/TR/webdriver2/) | | The vendor-neutral standard; choose it when you need real branded browsers on a grid |
| iOS native | [XCUITest](https://developer.apple.com/documentation/xctest) | | Apple's own UI testing, built on XCTest and the accessibility tree |
| Android native | [Espresso](https://developer.android.com/training/testing/espresso) | | Waits for the app to be idle before each action, so it rarely needs explicit waits |
| Mobile, cross-platform | [Maestro](https://docs.maestro.dev/) | [Appium](https://appium.io/) | Maestro flows are short YAML files; Appium speaks WebDriver and runs on most device clouds |

My default for a new web product is Playwright for end to end and the language's standard runner for everything else. For mobile, the platform-native frameworks for teams that own one platform each, and Maestro when one team owns both apps and wants one suite.

## End-to-End Tests That Hold Up

End-to-end tests are the expensive top of [the pyramid](/docs/quality/testing#the-pyramid), so each one has to earn its keep. Most of the cost is maintenance and flakes, and most of both come from a handful of habits.

- **Find elements the way a user does.** Locate by role and accessible name, then by label, then by a test id; never by CSS class or XPath. Playwright's [locator guide](https://playwright.dev/docs/locators) recommends exactly this, because CSS and XPath break whenever the DOM is restructured. A role locator has a bonus: if the test can't find the button by its name, a screen reader can't either.
- **Test ids are a contract.** When there's no accessible name to use, add a `data-testid` and treat it like an API: stable, named for meaning (`checkout-total`), never generated.
- **Never sleep.** A fixed `sleep(2000)` is too long on a fast run and too short on a slow one, so it's both slow and flaky. Use web-first assertions that retry until the condition holds or a timeout expires; Playwright's [locators auto-wait](https://playwright.dev/docs/best-practices) for this reason. Wait for the state the user would see ("the order number is visible"), not for a network call or a timer.
- **One journey per test.** "Sign up, add to cart, pay, see receipt" is one test of one journey. Don't chain journeys so that test 7 depends on test 6; every test must run alone and in any order.
- **Set up state through the API, not the UI.** If the journey under test is "refund an order", create the order with an API call or a seed, then drive only the refund through the browser. Clicking through checkout to reach the refund screen tests checkout twenty times and makes every refund test fail when checkout breaks. See [Test Data & Environments](/docs/quality/test-data) for seeding.
- **Sign in once.** Authenticate in a setup step, save the browser's storage state, and start every test already signed in; Playwright's [authentication guide](https://playwright.dev/docs/auth) documents the pattern. Use one account per parallel worker when tests change server-side state. The saved state file holds live session cookies, so keep it out of version control.
- **Own your data, mock what you don't own.** Each test creates its own records with unique names, so parallel tests never collide. Third-party sites and APIs get stubbed at the network layer; a test that fails when a payment provider's sandbox is down tells you nothing about your code.

```ts
test("customer can refund a paid order", async ({ page, api }) => {
  // Arrange: state through the API, not the UI
  const order = await api.createPaidOrder({ total: "42.00" });

  // Act: only the journey under test goes through the browser
  await page.goto(`/orders/${order.id}`);
  await page.getByRole("button", { name: "Refund" }).click();
  await page.getByLabel("Reason").fill("Damaged in transit");
  await page.getByRole("button", { name: "Confirm refund" }).click();

  // Assert: what the user sees, with auto-waiting
  await expect(page.getByRole("status")).toHaveText("Refund issued");
});
```

## Page Objects, Screenplay, or Helpers

Once a suite has more than a few tests, the same steps repeat, and they need a home.

- **Page objects** wrap a screen, or a significant part of one, behind methods like `checkout.payWith(card)`. Martin Fowler's [PageObject](https://martinfowler.com/bliki/PageObject.html) advice holds up: model what the user sees as meaningful, not one object per page, and keep assertions out of the object so it only exposes state.
- **Screenplay** models actors with abilities performing tasks and asking questions ([Serenity/JS](https://serenity-js.org/handbook/design/screenplay-pattern/) is the reference implementation). It reads well in business language and scales to very large suites, at the cost of a lot of ceremony.
- **Plain helpers and fixtures** are functions: `signInAs(page, "admin")`, `createPaidOrder(api)`. No class hierarchy, nothing to learn.

My default: plain helpers and fixtures until a component repeats across many tests, then a small component object for that component (a date picker, a data table), never a deep page-object hierarchy. I'd reach for Screenplay only when non-engineers read and write the scenarios. Whatever the pattern, assertions stay in the test, where a reader can see what's being checked.

## Test Structure

- **Arrange, act, assert.** Every test has the three parts in that order, ideally visibly separated. A test that acts and asserts five times is five tests.
- **Name the behavior.** `refund is rejected after 90 days`, not `testRefund2`. The name is the first line of the failure report, so it should say what broke without opening the file.
- **One reason to fail.** Several assertions are fine when they check one outcome (status, body, resulting row); unrelated checks belong in separate tests.
- **No logic in tests.** Loops and conditionals in a test body are code that needs its own tests. Use parametrized or table-driven cases instead.

## Property-Based Tests

A property-based test states a rule that holds for every input ("allocating an amount across N splits always sums to the original") and lets the framework generate hundreds of inputs to try to break it. When one fails, the framework shrinks it to the smallest counterexample ([fast-check](https://fast-check.dev/docs/introduction/what-is-property-based-testing/) for JS/TS, [Hypothesis](https://hypothesis.readthedocs.io/) for Python).

They earn their place on pure logic with clear invariants: parsers and serializers (decode of encode is the identity), money allocation, sorting and deduplication, state machines (no sequence of events reaches an invalid state). They're a poor fit for UI and for code whose rule is hard to state without reimplementing it. Fix the seed in CI, or log it, per [deterministic fixtures](/docs/quality/testing#deterministic-fixtures), so a failure can be replayed.

## Snapshot Tests

A snapshot test records an output and fails when it changes. That makes it cheap to write and easy to abuse.

- **Where they earn their place:** small, stable, meaningful outputs where a change is worth a look: a generated SQL query, an error message catalog, a CLI's help text, a serialized API response shape.
- **Where they rot:** large snapshots of rendered component trees. Nobody reads a 400-line diff, so the habit becomes "update snapshots and move on," and the test asserts only that the output is whatever it is now. Jest's own [snapshot guidance](https://jestjs.io/docs/snapshot-testing) warns against exactly that habit and asks for snapshots that are short, focused, committed and reviewed like code.
- **My rule:** if a snapshot is too big to review in a pull request, replace it with explicit assertions on the parts that matter. Visual snapshots (screenshots) are a different tool with their own rules, in [Visual & Cross-Platform Testing](/docs/quality/cross-platform-testing).

## Keeping It Fast

The pull request suite has a budget, about 10 minutes, set in [Testing Strategy](/docs/quality/testing#in-ci) and [CI & Continuous Deployment](/docs/delivery/ci-pipelines#fast). Spend effort in this order:

1. **Push tests down.** The cheapest speedup is an end-to-end test that should have been an integration test.
2. **Parallelize within a machine.** Tests that own their data can run on every core; tests that share state can't, which is one more reason they shouldn't.
3. **Shard across machines.** Split the suite into N slices on N runners (Playwright's `--shard=1/4`, or the runner's equivalent) and merge the reports. Wall-clock time drops almost linearly until setup dominates.
4. **Run what the change touches.** Test impact analysis maps each test to the code it exercises and runs only the affected ones ([Paul Hammant's overview](https://martinfowler.com/articles/rise-test-impact-analysis.html)); monorepo tools do a coarser version by package. Run the full suite on merge to main and nightly, because the map is never perfect.
5. **Then, and only then, move tests out of the PR path.** A slow suite that runs only nightly is a suite whose failures nobody connects to a change.

Track suite duration and the slowest tests as a trend. Suites get slow one test at a time, and nobody notices until it's 25 minutes.

## Artifacts on Failure

A failed test should carry everything needed to diagnose it without rerunning it locally.

- **Traces first.** A Playwright trace records every action, DOM snapshot, network request and console message on a timeline; the [best practices](https://playwright.dev/docs/best-practices) recommend it over videos for CI failures. Use `trace: "retain-on-failure"` so passing tests cost nothing to store.
- **Screenshot and video** on failure, for the reviewer who wants the picture without opening a trace viewer.
- **Logs from the system under test,** not just the test runner: application logs and request IDs for the test's time window, linked from the report, ideally via the same [observability](/docs/operations/observability) tooling as production.
- **Seeds and IDs.** The random seed, the records the test created, and the build under test, printed in the failure output.

Upload artifacts from CI with a short retention (a couple of weeks), and link them from the check's summary so the first click from a red pull request lands on the trace.

## Who Owns the Suite

The team that owns the code owns its tests, end to end included, under the same [ownership](/docs/engineering/code-ownership) rules as the code. A separate automation team writing tests after the fact produces a suite that lags every feature, breaks on every change it wasn't told about, and is fixed by people who don't know what the right behavior is. Tests ship in the same pull request as the change they cover and get [reviewed](/docs/engineering/commits-and-reviews) with it.

Quality engineers still have a real job: owning the framework, the shared helpers, the CI wiring, flake tracking and coaching. They make tests easy to write; they don't write everyone's tests.

## When Not to Automate

Automate checks you'll run many times with a known right answer. Don't automate:

- **Questions you can't yet state.** "Is this new flow confusing?" or "what breaks if I do this oddly?" is [exploratory testing](/docs/quality/exploratory-testing), done by a person.
- **One-off checks,** like a data migration you'll run once. Verify it with a script and a person, then throw both away.
- **Features still changing daily.** Write the unit and integration tests now; add the end-to-end test once the UI stops moving.
- **Things a lower level already covers.** A second end-to-end test of a rule that a unit test already pins down adds runtime, not confidence.

## References

**Reference**

- [Playwright: Best practices](https://playwright.dev/docs/best-practices), user-facing locators, auto-waiting, isolation, sharding and traces
- [Playwright: Locators](https://playwright.dev/docs/locators), role, label and test id locators, and why CSS and XPath are discouraged
- [Playwright: Authentication](https://playwright.dev/docs/auth), signing in once and reusing storage state
- [Playwright: Test use options](https://playwright.dev/docs/test-use-options), trace, video and screenshot modes
- [Jest: Snapshot testing](https://jestjs.io/docs/snapshot-testing), treating snapshots as code
- [fast-check: What is property-based testing](https://fast-check.dev/docs/introduction/what-is-property-based-testing/), properties and shrinking
- [Hypothesis](https://hypothesis.readthedocs.io/), property-based testing for Python
- [Serenity/JS: Screenplay pattern](https://serenity-js.org/handbook/design/screenplay-pattern/), actors, abilities, interactions, tasks and questions
- [W3C WebDriver](https://www.w3.org/TR/webdriver2/), the browser automation protocol behind Selenium and Appium
- [Maestro](https://docs.maestro.dev/), mobile UI flows in YAML
- [Appium](https://appium.io/), cross-platform mobile automation over WebDriver
- [Espresso](https://developer.android.com/training/testing/espresso), Android UI tests
- [XCTest](https://developer.apple.com/documentation/xctest), Apple's unit and UI testing framework, home of XCUITest
- [Vitest](https://vitest.dev/guide/), a test runner that reuses the Vite config

**In practice**

- [Martin Fowler: PageObject](https://martinfowler.com/bliki/PageObject.html), what page objects should model and why they hold no assertions
- [Paul Hammant: The Rise of Test Impact Analysis](https://martinfowler.com/articles/rise-test-impact-analysis.html), running only the tests a change affects
