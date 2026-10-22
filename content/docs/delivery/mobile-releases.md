+++
title = "Mobile Releases"
description = "Shipping mobile apps when you can't roll back: release trains, phased rollouts, flags, minimum versions, health gates, signing, beta tracks and OTA rules."
category = "Delivery"
order = 1106
tags = ["mobile", "ios", "android", "release", "delivery"]
+++

[Continuous deployment](/docs/delivery/ci-pipelines) assumes you can put a fix in front of every user within minutes. Mobile breaks that assumption. A release goes through store review, users install it when they feel like it, and once a build is on a phone you can't take it back. The version you shipped two years ago is still running somewhere and still calling your API.

So mobile is the clearest case for continuous *delivery*: you keep CI, automated tests and a releasable main branch, but the step to users is a deliberate, gated release. The practices here make that release boring, and win back as much of the rollback ability the platform takes away as possible.

## What's Different

Four constraints shape everything else:

- **No rollback.** You can stop a rollout, but users who already updated keep the bad build until you ship a new one. The fix is always forward, and it goes through review again.
- **Review latency.** Every binary passes store review, usually quickly but never guaranteed, so "we'll hotfix it" has a lead time you don't control.
- **Version fragmentation.** Users update slowly and some never do. Your backend serves every version still in the wild, simultaneously.
- **The binary is public.** Anything compiled into the app, including API keys and feature logic, can be extracted. The client is untrusted, exactly as it is on the web.

## Release Trains

Ship on a fixed schedule, weekly or every two weeks, regardless of what's ready. On the cut day a release branch is created from main; whatever's merged goes, whatever isn't waits for the next train. Releasing when a feature is done sounds more responsive and works worse: big features hold releases hostage, releases grow riskier as they wait, and nobody can predict when a fix will reach users. A train keeps releases small and predictable, and ends the debate about waiting for one more thing.

What makes trains work:

- **Main is always releasable.** Unfinished work merges behind [feature flags](/docs/delivery/feature-flags), switched off, so the cut is never blocked by half-done features.
- **The release branch takes fixes only.** Fixes land on main first, then get cherry-picked to the branch, so the next train never loses them.
- **The cut is automated.** Version bump, changelog, build, signing and upload to the beta track happen in CI from one trigger. A release that needs someone's laptop waits for that person.
- **One release owner per train**, rotating, who watches health metrics and makes the go/no-go call on rollout stages.

## Beta Tracks

Every build goes to testers before it goes to the public:

- **TestFlight (iOS):** up to 100 internal testers from your team, and up to 10,000 external testers. Builds for external testers go through a beta review first. A build can be tested for up to 90 days.
- **Google Play testing tracks:** internal testing (up to 100 testers, available within minutes), closed testing for invited groups, and open testing that anyone can join from the store listing.

Use them as stages: internal testers get every train cut the day it's made, and a wider group gets it for a few days before public release. Employees dogfooding the next release on their own phones catch more than any test plan.

## Phased Rollouts

Both stores let you release to a fraction of users first; use it for every release.

**App Store phased release** runs over seven days at 1%, 2%, 5%, 10%, 20%, 50% and 100% of users with automatic updates turned on. It can be paused (for up to 30 days in total) if something looks wrong. Two caveats: it only governs automatic updates, so anyone can still download the new version manually from the store, and pausing stops the spread but doesn't remove the build from anyone who has it.

**Google Play staged rollouts** go to the percentage you choose and stay there until you increase it. You can halt a rollout, which stops new users from receiving that version, and resume it later. Users who already have it keep it.

The playbook:

1. Release to the smallest stage.
2. Watch [release health](#release-health-gates) against the previous version, on the same metrics, for long enough to see real usage (a day is a reasonable minimum at low percentages).
3. Advance only when the gates pass. Halt on any regression, fix forward, and start the new build from the first stage.

This is the mobile version of a [canary](/docs/delivery/deployment-strategies), except that halting limits the damage without undoing it.

## Flags and Remote Config Are Your Rollback

Since you can't roll back a binary, move the risk out of it. Every significant feature ships dark behind a [feature flag](/docs/delivery/feature-flags) and is turned on separately from the release:

- **The binary rollout and the feature rollout are independent.** The build reaches 100% with the feature off; then the feature rolls out by percentage, platform and app version, with its own metrics.
- **Kill switches for anything risky:** a new checkout flow, a third-party SDK, a local data migration. Turning it off takes seconds and needs no review.
- **Remote configuration for values that change:** timeouts, polling intervals, copy, limits. Shipping a binary to change a number is a week of latency.
- **Flags default safely when offline.** The app must start and work when the flag service is unreachable, with the last known values or conservative defaults. Never block launch on fetching flags.
- **Target by app version.** A feature that needs a fix from build 4.12 should be enabled only for `>= 4.12`, and the flag system must be able to say that.

Old flag checks live in old binaries forever, so the server keeps serving a value for a removed flag until the versions containing it are gone.

## Every Version Is Still Out There

On the web, the client and server deploy together. On mobile, your API serves today's app, last month's and the one from two years ago that someone never updated. Design for it:

- **API changes are backward compatible,** per [Versioning & Deprecation](/docs/api-design/versioning): add fields, never remove or repurpose one a supported version reads. Clients ignore unknown fields and handle enum values they've never seen.
- **Send the app version on every request,** so you can measure who still uses what, target flags, and decide when an old path can go.
- **Server-driven behavior where it's cheap**: option lists, copy, simple layouts, eligibility rules, all fixable without a release. Don't overdo it; a fully server-driven UI is a browser engine you have to build and test yourself.

### Minimum Supported Versions and Forced Upgrades

Eventually a version has to stop working: a security fix that needs the client, an API you need to remove. Build the mechanism before you need it, because adding it later only reaches users who already updated.

- **A version check at launch** against a server-provided policy: the minimum supported version (below it, block with an upgrade screen that links to the store) and a recommended version (below it, show a dismissible prompt).
- **Use the hard block rarely.** It's mobile's only real rollback for a dangerous build: keep it for security and data-integrity problems, and versions that have shrunk to a sliver of users.
- **Publish a support window,** such as "the last 12 months of releases," so the API team knows what must keep working.
- **The block screen must work on every old version.** Its contract (an endpoint, a response shape) is the one API you can never change.

## Release Health Gates

Every rollout decision depends on per-release crash and error reporting (Crashlytics, Sentry and similar). The core metric is **crash-free sessions** (or users): the share of sessions that didn't end in a crash, by app version. Gate stages on numbers decided before the release, not on someone's impression of a dashboard:

- **Crash-free sessions** for the new version at or above the previous version's, within a small tolerance. The absolute number varies by app; what matters is no regression.
- **App-not-responding rate and launch time** on Android, hangs and launch time on iOS, compared to the previous version.
- **Key business events** (logins, checkouts, sends) per session, against the previous version. A build that doesn't crash but silently breaks checkout fails this one.
- **Backend error rates for requests from the new version.**

Upload symbol files (dSYMs, ProGuard/R8 mappings) from CI for every build. A crash report you can't symbolicate is a stack of addresses.

## Signing and Reproducible Builds

Signing proves a build came from you, and losing control of the keys is one of the few mobile mistakes a release can't fix.

- **Builds and signing happen in CI**, never on a laptop, with signing material in the CI's secret store or a managed signing service, readable only by the release job.
- **On Android, use Play App Signing**, which is required for new apps. Google holds the app signing key; you hold an upload key, and if the upload key is lost or compromised, it can be reset. A self-managed signing key that's lost means you can never update that app again.
- **On iOS, manage certificates and provisioning profiles centrally** (fastlane match or the platform's automatic signing in CI), not per developer, and know when they expire before they do.
- **Pin and lock everything the build uses** (toolchains, [lockfiles](/docs/engineering/dependencies), build images), so a build from the release tag can be reproduced and a dependency change can't slip in between beta and store.
- **The store build is the beta build.** Promote the exact binary that testers validated rather than rebuilding it. A rebuild is a new, untested artifact.

## Hotfixes

When a release is bad, the process is the train's, compressed:

1. **Halt the rollout** and turn off any flag that contains the damage. Most incidents end here.
2. **Fix on main**, cherry-pick to the release branch, and cut a patch version (`4.12.1`). Don't bundle anything else.
3. **Run the same pipeline**: tests, beta track, phased release. Shorten the stages, but don't skip them; a rushed hotfix that crashes is worse than the original bug.
4. **Request expedited review** only for genuine emergencies. Apple offers it, and it works best when rarely asked for.
5. **Write the [postmortem](/docs/operations/incident-response)**, with particular attention to why a flag or gate didn't catch it.

## Over-the-Air Updates, Within the Rules

Frameworks that run JavaScript or other interpreted code (React Native with Expo's EAS Update, for example) can download new code and assets without a store release, bounded by store rules.

Apple's App Review Guideline 2.5.2 says apps may not download or execute code that introduces or changes features or functionality. Guideline 4.7 carves out specific cases like HTML5 and JavaScript mini apps and games, each with its own requirements. Google Play's policies are similar in spirit. Expo's own documentation is direct: updates must follow the App Store and Play Store guidelines.

So OTA updates fix bugs and store releases ship features: changing what the app does, beyond what reviewers saw, belongs in a reviewed binary. Native code changes always need a binary, so tie each update to the native runtime version it was built for. And OTA updates get the same discipline, staged and gated on health; they're the one part of mobile you can actually roll back.

## References

**Reference**

- [Apple: Release a version update in phases](https://developer.apple.com/help/app-store-connect/update-your-app/release-a-version-update-in-phases/), the seven-day 1% to 100% schedule, automatic updates only, pausing
- [Apple: TestFlight](https://developer.apple.com/testflight/), internal and external testers, and review for external builds
- [Apple: TestFlight overview](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/), builds testable for up to 90 days
- [Apple: App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), 2.5.2 on downloaded code and 4.7 on mini apps and games
- [Google Play: Release app updates with staged rollouts](https://support.google.com/googleplay/android-developer/answer/6346149), choosing percentages, halting and resuming
- [Google Play: Set up an open, closed, or internal test](https://support.google.com/googleplay/android-developer/answer/9845334), testing tracks and their limits
- [Android: Sign your app](https://developer.android.com/studio/publish/app-signing), Play App Signing and upload key resets
- [Expo: EAS Update](https://docs.expo.dev/eas-update/introduction/), what can ship over the air, and following store guidelines
- [Expo: Runtime versions](https://docs.expo.dev/eas-update/runtime-versions/), matching updates to compatible native builds

**In practice**

- [Sentry: Release health](https://docs.sentry.io/product/releases/health/), crash-free sessions and users per release
- [Firebase Crashlytics](https://firebase.google.com/docs/crashlytics), realtime crash reporting for mobile apps
- [Reproducible Builds](https://reproducible-builds.org/), why the same source should produce the same binary
