+++
title = "Visual & Cross-Platform Testing"
nav_title = "Visual & Cross-Platform"
description = "Deterministic visual regression tests, a browser and device matrix built from real usage with tiers of support, real devices vs emulators, and mobile checks."
category = "Quality"
order = 1056
tags = ["quality", "testing", "visual-regression", "browsers", "mobile"]
+++

Functional tests prove the button works. They don't notice that it's now white on white, hidden behind the cookie banner on a small phone, or two lines tall in German. Visual and cross-platform testing covers how the product looks and behaves across the browsers, devices, sizes and languages people actually use, and the trick is covering enough of that space without a matrix so large nobody can keep it green.

## Visual Regression Testing

A visual test renders a page or component, takes a screenshot, and compares it pixel by pixel with an approved baseline. Any difference beyond a tolerance fails the test and shows a diff image. It catches what assertions can't: a CSS change that shifts layout three screens away, a z-index regression, a token change that alters every button.

Two ways to run it:

- **In the test runner.** Playwright's [`toHaveScreenshot`](https://playwright.dev/docs/test-snapshots) writes a baseline on the first run and compares against it afterwards; baselines live in the repository next to the test, one per browser and platform. Free, local, and everything is in the pull request.
- **A hosted service.** [Chromatic](https://www.chromatic.com/) (from the Storybook team) and [Percy](https://www.browserstack.com/docs/percy/overview/visual-testing-basics) render snapshots in the cloud, across browsers and widths, and give reviewers a web UI to approve or reject each change. You pay for consistent rendering and a review workflow you don't have to build.

My default: Playwright screenshots for a handful of key pages when the team already uses Playwright, and a hosted service once there's a component library with hundreds of states, where the review UI pays for itself.

## Keeping Visual Diffs Deterministic

A visual test is the flakiest kind of test there is unless the rendering is pinned. Playwright's own docs warn that rendering varies with the host OS, its version and settings, the hardware and headless mode, and tell you to compare only against baselines made in the same environment.

- **Render in a pinned container.** Generate and compare baselines in one container image, pinned to an exact version (Playwright [recommends pinning its image](https://playwright.dev/docs/docker)), on CI and on any developer machine that updates baselines. A baseline made on a Mac and compared on Linux fails on font smoothing alone.
- **Fonts are the usual culprit.** Ship the web fonts with the app or install them in the image, and wait for them to load before the screenshot. A fallback font for one frame produces a diff that has nothing to do with your change.
- **Freeze motion and time.** Disable animations and hide the text caret (both are `toHaveScreenshot` options), inject a fixed clock, and seed any random data, per [deterministic fixtures](/docs/quality/testing#deterministic-fixtures).
- **Mask what's dynamic.** Timestamps, avatars, ads, maps and live counters get masked (the `mask` option paints a box over them) or replaced with fixtures. Masking one element is better than loosening the whole comparison.
- **Keep thresholds tight.** `threshold` tolerates color differences per pixel and `maxDiffPixels` or `maxDiffPixelRatio` tolerate a count. My rule: a small pixel tolerance to absorb anti-aliasing, never a ratio large enough to hide a moved border or a missing icon. If a test needs a big tolerance to pass, the environment isn't pinned yet.
- **Move the mouse away.** Hover states end up in the screenshot.

### Reviewing Diffs

A visual diff is a code review artifact, not a test result to clear. Updated baselines ship in the same pull request as the change that caused them, and the reviewer looks at each one: an intended change gets approved, anything else is a bug. The failure mode is the same as for [snapshot tests](/docs/quality/automated-testing#snapshot-tests): once "update all baselines" is a reflex, the suite asserts nothing. If a change legitimately touches hundreds of screenshots (a new font, a token change), that is a pull request of its own, reviewed by sampling, with nothing else in it.

## Component or Full Page

- **Component-level visual tests** render each component state in isolation, usually from [Storybook](https://storybook.js.org/docs/writing-tests/visual-testing) stories, where every story becomes a test. They're fast, they cover states that are hard to reach in the full app (error, empty, loading, very long text), and a diff points at one component.
- **Full-page tests** catch what only appears in composition: layout, spacing between components, stacking, a global style leaking in. They're slower and more fragile, because every page has more dynamic content.

My default: component tests for the design system and shared components, every state, and full-page screenshots only for a few pages per critical journey, at each breakpoint. Don't screenshot every page of the app; the review burden grows faster than the coverage.

## Choosing the Browser and Device Matrix

Testing "every browser" is impossible and testing only the one on your laptop is negligent. Build the matrix from data.

- **Start from real usage.** Pull browser, OS, device class and viewport from your [product analytics](/docs/telemetry/product-analytics), weighted by sessions and, if it differs, by revenue or key conversions. A browser with 2% of sessions and 10% of purchases is not a 2% browser. Global market-share tables are a fallback for a product that hasn't launched yet.
- **Test engines, not brands.** Chrome, Edge, Opera and Samsung Internet are all Chromium; Safari is WebKit; Firefox is Gecko. Three engines cover most of the behavior differences, which is why Playwright tests [Chromium, Firefox and WebKit](https://playwright.dev/docs/browsers). Its WebKit build tracks upstream WebKit rather than shipping Safari, so a small real-Safari pass still belongs in the matrix.
- **iOS is its own case.** On iOS, App Store [guideline 2.5.6](https://developer.apple.com/app-store/review/guidelines/#2.5.6) requires browsers to use WebKit, with entitlements for alternative engines only in specific regions. Chrome on an iPhone mostly renders like Safari, not like Chrome on Android.
- **Write the matrix down,** with tiers, and revisit it quarterly from the same analytics. A supported list nobody updates drifts until it supports browsers nobody uses and skips the ones they do.

### Tiers of Support

Not every combination deserves the same effort. Three tiers, each with a clear promise:

- **Full:** everything works and looks as designed. Automated functional and visual tests run on every pull request; bugs are fixed like any other bug.
- **Functional:** every journey works; minor visual differences are acceptable. Automated functional tests run on merge or nightly; visual bugs are fixed when cheap.
- **Best effort:** no known blocking bugs at release; nothing automated. Reported bugs are triaged like any other, but cosmetic issues may be closed.

My rule for placing combinations: 5% or more of sessions (or of revenue) is full, 1% to 5% is functional, under 1% is best effort, and anything with a contractual or accessibility commitment is full regardless. A sample, not a template:

| Tier | Engine | Browsers and platforms | Versions | Automation |
| ---- | ------ | ---------------------- | -------- | ---------- |
| Full | Chromium | Chrome and Edge on Windows and macOS, Chrome on Android | Latest two stable | Functional and visual, every PR |
| Full | WebKit | Safari on macOS and iOS | Latest two major | Functional and visual, every PR; real-device pass before release |
| Functional | Gecko | Firefox on Windows and macOS | Latest stable and ESR | Functional, nightly |
| Functional | Chromium | Samsung Internet on Android | Latest stable | Functional, nightly on a device cloud |
| Best effort | Any | Everything else that supports the baseline features | | None; manual on report |

Publish the tiers where support and sales can see them, and decide what the product does below the floor: a working but plain page, or a clear "unsupported browser" message, never a blank screen.

## Real Devices, Emulators and Device Clouds

- **Emulation in the browser** (Playwright's [device descriptors](https://playwright.dev/docs/emulation): viewport, user agent, touch, pixel ratio) is a desktop engine pretending. It's right for layout and responsive checks on every pull request and wrong for anything about the real device: performance, memory, keyboard behavior, safe areas, OS dialogs.
- **Simulators and emulators** run the real OS image on your hardware. Good for most functional mobile tests in CI; they still don't reproduce real performance, sensors, push notifications or manufacturer customizations.
- **Real devices** are the only truth for those, and the only place some bugs exist. Rent them rather than maintain a drawer of phones: device clouds such as [AWS Device Farm](https://docs.aws.amazon.com/devicefarm/latest/developerguide/welcome.html), [Firebase Test Lab](https://firebase.google.com/docs/test-lab) and [BrowserStack](https://www.browserstack.com/) host real, physical devices and run standard frameworks like Appium, Espresso and XCUITest against them.

My default: emulation on every pull request, simulators and emulators for the mobile suite on merge, and a real-device run of the critical journeys on the full-tier devices before each release.

## Responsive Layouts and Touch

- **Test at the breakpoints and between them.** Each layout breakpoint gets a run, plus the narrowest width you support (320px is a common floor, and the one [accessibility](/docs/frontend/accessibility) reflow checks use) and one awkward in-between width, where layouts usually break.
- **Touch is not a click.** No hover on touch devices, so nothing important can hide behind one. Check tap target size, on-screen keyboards covering inputs, and gestures (swipe, pinch) on a touch-enabled context or a real device.
- **Orientation and safe areas.** Rotate at least once per journey on a phone, and check notches and home indicators don't cover controls.

## Mobile Specifics

Native apps add a dimension the web mostly doesn't have: old versions of your own app and of the OS stay in use for years ([Mobile Releases](/docs/delivery/mobile-releases#every-version-is-still-out-there)).

- **OS versions:** test the minimum supported OS version and the latest on every release, plus the current beta in the months before a major OS release, when your app is about to meet it.
- **Screen sizes and densities:** the smallest supported phone, a large phone, and a tablet if you support one. Small screens find most of the truncation and overlap bugs.
- **Android fragmentation:** manufacturer skins, aggressive battery management and different WebView versions change behavior on the same OS version. Pick devices from your own install base by manufacturer, not just by OS version.
- **Upgrade paths:** install the previous release, create data, upgrade, and check it survived. Fresh installs never find migration bugs.

## Automated Accessibility Checks

Run [axe-core](https://github.com/dequelabs/axe-core) inside the functional and visual suites (Playwright has [`@axe-core/playwright`](https://playwright.dev/docs/accessibility-testing)) on every page and component state you already render, and fail the build on new violations. It costs almost nothing once the pages are rendered for other tests.

Know its limits: automated rules catch missing names, contrast failures and invalid ARIA, not whether the reading order makes sense or a screen reader user can finish the task. [Accessibility](/docs/frontend/accessibility#testing) owns the full process, including the manual keyboard and screen-reader passes that automation can't replace.

## Localization Checks

Run the visual and functional suites in a pseudo-locale as well as the default one. Accented, padded, bracketed strings make unexternalized text, truncation and concatenation visible in the screenshots, and a right-to-left pseudo-locale checks mirrored layouts. [Internationalization](/docs/frontend/internationalization#pseudo-localization-in-ci) covers how pseudo-localization works; here it's one more column in the matrix. Add your longest real language (often German) and one right-to-left locale for the full-page screenshots of critical journeys.

## References

**Reference**

- [Playwright: Visual comparisons](https://playwright.dev/docs/test-snapshots), `toHaveScreenshot`, baselines and why rendering differs between environments
- [Playwright: PageAssertions](https://playwright.dev/docs/api/class-pageassertions), the `mask`, `animations`, `caret` and threshold options
- [Playwright: Docker](https://playwright.dev/docs/docker), the official image and pinning its version
- [Playwright: Browsers](https://playwright.dev/docs/browsers), Chromium, Firefox and WebKit, and how its WebKit relates to Safari
- [Playwright: Emulation](https://playwright.dev/docs/emulation), device descriptors for viewport, user agent and touch
- [Playwright: Accessibility testing](https://playwright.dev/docs/accessibility-testing), running axe in the suite and what it can't detect
- [Storybook: Visual tests](https://storybook.js.org/docs/writing-tests/visual-testing), every story as a visual test
- [Chromatic](https://www.chromatic.com/), hosted visual testing for Storybook
- [Percy: Visual testing basics](https://www.browserstack.com/docs/percy/overview/visual-testing-basics), baselines and the approval workflow
- [axe-core](https://github.com/dequelabs/axe-core), the accessibility rules engine
- [AWS Device Farm](https://docs.aws.amazon.com/devicefarm/latest/developerguide/welcome.html), real devices for automated and manual testing
- [Firebase Test Lab](https://firebase.google.com/docs/test-lab), physical and virtual test devices in the cloud
- [BrowserStack](https://www.browserstack.com/), real browsers and devices in the cloud

**Policy**

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), guideline 2.5.6 on WebKit for iOS browsers
