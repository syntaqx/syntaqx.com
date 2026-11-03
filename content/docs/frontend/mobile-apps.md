+++
title = "Mobile Apps"
description = "Building iOS and Android apps: native or cross-platform, an API that serves old versions, push, deep links, secure storage, OAuth, store rules and startup."
category = "Frontend"
order = 609
tags = ["mobile", "ios", "android", "frontend", "security"]
+++

A mobile app looks like a web front end with a different toolkit, and most of the mistakes come from treating it like one. The web client is redeployed with the server and lives in a browser that enforces the rules for you. A mobile app is a binary on a device you don't control, installed when the user feels like it, reviewed by a store before every release, and still calling your API years later. Every decision below follows from those facts. Getting builds to users (release trains, phased rollouts, signing, over-the-air updates) is [Mobile Releases](/docs/delivery/mobile-releases); this chapter is about building the thing it ships.

## Native, Cross-Platform or the Web

There are three families, and each has a few serious options.

| Choice | How it renders | Strengths | Costs |
| --- | --- | --- | --- |
| **Native** (Swift and SwiftUI, Kotlin and Jetpack Compose) | The platform's own UI toolkit | Every OS feature on release day; platform conventions, accessibility and background execution for free; the vendor's own tools and docs | Two codebases, two skill sets, features built twice |
| **React Native** | Native views driven from JavaScript or TypeScript | One codebase a web team can read; native views, so platform look and accessibility mostly come along | Native work still appears at the edges; upgrades need discipline; a JavaScript runtime in the startup path |
| **Flutter** | Its own engine draws every pixel | One codebase, pixel-identical on both platforms, strong tooling | Widgets reimplement the platform's rather than use them, so conventions and new OS controls lag; Dart is a skill few teams already have |
| **Kotlin Multiplatform** | Native UI per platform, or shared UI through Compose Multiplatform | Shares the logic (networking, storage, rules) without giving up native UI; adopt it one module at a time | Still two UI codebases unless you share UI too; iOS developers work with Kotlin-generated frameworks |
| **Web or PWA** | The browser | One codebase, instant deploys, no store review | Weaker background work, storage the browser can evict, no store presence, and limits on iOS |

The details matter. React Native's New Architecture "removes the asynchronous bridge between JavaScript and native and replaces it with JavaScript Interface (JSI)," and has been on by default since 0.76 ([React Native: New Architecture](https://reactnative.dev/architecture/landing-page)). Flutter "has its own implementations of each UI control, rather than deferring to those provided by the system," rendered by its Impeller engine shipped inside the app ([Flutter: Architectural overview](https://docs.flutter.dev/resources/architectural-overview)). Kotlin Multiplatform lets you "share all of your business logic while keeping the UI native, or gradually migrate the UI using Compose Multiplatform" ([Kotlin Multiplatform overview](https://kotlinlang.org/docs/multiplatform/kmp-overview.html)).

**My default is native UI on each platform**: SwiftUI on iOS, Jetpack Compose on Android, against one well-designed API. The app is where users meet the product, and native is the only option where platform conventions, accessibility, background execution and each year's new OS features come without a wrapper in between. Two codebases cost more people, but the cost is visible and linear. The cost of a cross-platform layer shows up later and unevenly: a framework upgrade that blocks an OS release, a native module nobody on the team can debug, a screen reader bug in a widget you didn't write.

Deviate when the facts point elsewhere:

- **React Native** when the team is a web team, the app is mostly screens over an API (forms, lists, detail views), and shipping both platforms with one team matters more than platform polish. It's the strongest cross-platform choice for that shape, because its views are the platform's.
- **Kotlin Multiplatform for the logic** when two native apps duplicate something complex and easy to get subtly different: a sync engine, pricing rules, a parser, validation. Share that module and keep the UI native. It's the cheapest way to stop two implementations drifting.
- **Flutter** when a custom, brand-identical interface matters more than platform feel (a kiosk, a media app with its own visual language), or the team already knows it.
- **A web app or PWA** when the use is occasional, needs no device capabilities beyond the camera and location, and doesn't need to be in a store. A field app that works offline for days, takes payments or talks to Bluetooth hardware is the opposite case; [Offline-First Sync](/docs/building-blocks/offline-sync#native-react-native-or-a-pwa) explains why the browser loses there.

Two choices are wrong in every family. A web view wrapped in an app shell and submitted as an app runs into Apple's Guideline 4.2, which expects an app to "elevate it beyond a repackaged website" ([App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)). And picking a framework because one engineer likes it is picking who you'll hire for the next five years.

## Architecture Inside the App

Whatever the toolkit, the shape that holds up is the same: a UI layer that renders state, a domain layer that holds the rules, and a data layer that owns the network and the local database. The UI never calls the network directly, and the network layer never touches views. Unidirectional data flow (state goes down, events come up) is what SwiftUI and Compose are built for, and it's what makes screens testable without a device.

- **The local database is the source of truth for the UI.** Screens read from local storage and the network layer updates it. The app shows something immediately on launch, survives a dropped connection, and doesn't need a loading spinner for data it already has. Apps that must work offline for real take this much further ([Offline-First Sync](/docs/building-blocks/offline-sync)).
- **Every network call is a retry waiting to happen.** Phones switch networks, sleep and lose signal in elevators. Writes carry an [idempotency key](/docs/requests/idempotency) so a retry after a timeout doesn't create a second order, and requests have timeouts sized for cellular, not office Wi-Fi.
- **Dependency injection at the edges** (Hilt on Android, plain initializers on iOS) so the data layer can be replaced with fakes in tests and the app can run against staging or a local server.
- **Modules by feature,** not by layer, once the app passes a handful of screens: build times stay reasonable and teams stop colliding in one giant target.

## The API Contract Outlives Every Release

On the web, a breaking API change and the client fix ship together. On mobile, the version you shipped last year is still installed, still calling, and you can't update it. Treat every released app version as a third-party client of your API.

- **Additive changes only** for anything a supported version reads: add fields and endpoints, never remove or repurpose them. [Versioning & Deprecation](/docs/api-design/versioning#breaking-and-non-breaking-changes) has the full list of what counts as breaking.
- **Tolerant readers in the app.** Unknown fields are ignored, and an enum value the app has never seen maps to a safe fallback instead of a crash. The second rule is the one apps break: a server adds `"status": "on_hold"` and every old version that decodes enums strictly crashes on launch.
- **Send the app version and build on every request** (a `User-Agent` or a dedicated header), so the server can measure who still uses an endpoint, gate features by version, and know when an old path can go.
- **A minimum supported version, enforced at launch,** built into the first release because adding it later only reaches users who already updated. The mechanism and the policy for raising it are in [Mobile Releases](/docs/delivery/mobile-releases#minimum-supported-versions-and-forced-upgrades).

A tolerant enum in Swift, so a value added next year decodes instead of throwing:

```swift
enum OrderStatus: Decodable, Equatable {
    case pending, paid, shipped, cancelled
    case unknown(String)

    init(from decoder: Decoder) throws {
        let raw = try decoder.singleValueContainer().decode(String.self)
        switch raw {
        case "pending": self = .pending
        case "paid": self = .paid
        case "shipped": self = .shipped
        case "cancelled": self = .cancelled
        default: self = .unknown(raw) // render a neutral state, never crash
        }
    }
}
```

The binary is public, so the API can't trust it. Anything compiled into the app (an API key, a feature rule, a price) can be extracted, and a modified client can call any endpoint with any payload. Authorization, pricing and limits are enforced on the server, exactly as they are for a browser.

## Authentication on a Phone

Native apps get OAuth 2.0 and OpenID Connect with one set of rules, written down in RFC 8252, "OAuth 2.0 for Native Apps" ([RFC 8252](https://www.rfc-editor.org/rfc/rfc8252)):

- **Sign in through the system browser, never a web view.** RFC 8252 says "native apps MUST NOT use embedded user-agents to perform authorization requests," because a web view hosted by the app can read the user's credentials and cookies. On iOS that's `ASWebAuthenticationSession`; on Android, Custom Tabs. They share the browser's session, so a user already signed in to your identity provider doesn't type a password again.
- **PKCE, always.** "Public native app clients MUST implement the Proof Key for Code Exchange" (RFC 7636). The app is a public client: a client secret bundled into it "should not be treated as confidential," so don't ship one.
- **Redirect back on a claimed `https` URL** (a universal link or App Link, below) where you can; RFC 8252 says apps should prefer it over a private-use scheme like `com.example.app:/callback`, which another app can try to register.

The sign-in methods themselves (passkeys first, MFA, recovery) are the same as on the web, and both platforms support passkeys natively; [Authentication](/docs/security/authentication#passkeys-first) covers them. Two store rules shape the screen. If you offer a third-party social login for the user's primary account, Apple's Guideline 4.8 requires an equivalent option that limits data collection to name and email, lets users keep their email private, and doesn't track for advertising without consent, which in practice means Sign in with Apple; enterprise apps that require an existing company account are exempt. And Guideline 5.1.1(v) says that if your app supports account creation, "you must also offer account deletion within the app," and that an app without significant account-based features should work without a login at all.

**Tokens after sign-in.** Keep the access token in memory and short-lived, and the refresh token in the platform's secure storage (next section), rotated on use where your identity provider supports it, so a copied token stops working. Biometric unlock is a gate on that local key, not a login: Face ID proves the person holding the phone is its owner, not who they are to your server.

**Attesting the app.** Apple's App Attest and Google's Play Integrity API let your server check that a request came from your genuine, unmodified app on a real device. App Attest creates a hardware-backed key that Apple certifies belongs to a valid instance of your app, and its documentation is blunt that "you can't rely on your app's logic to perform security checks on itself," so the server verifies ([Apple: Establishing your app's integrity](https://developer.apple.com/documentation/devicecheck/establishing-your-app-s-integrity)). Google says Play Integrity "works best when used alongside other signals as part of your overall anti-abuse strategy and not as your sole anti-abuse mechanism," warns against caching verdicts, and allows 10,000 requests a day by default ([Play Integrity API overview](https://developer.android.com/google/play/integrity/overview)). Use them for the high-value moments (account creation, payouts, redeeming a reward) as one input to [risk scoring](/docs/building-blocks/risk-scoring), not as a gate on every request; some legitimate devices will always fail them.

## Secrets on the Device

Each platform has one right place for small secrets, and it isn't preferences or a file.

- **iOS: the Keychain,** which stores "small bits of user data in an encrypted database," including passwords, keys and certificates ([Apple: Keychain services](https://developer.apple.com/documentation/security/keychain-services)). Use an accessibility class that keeps tokens on this device only and unavailable while it's locked, unless background work genuinely needs them.
- **Android: the Android Keystore,** where keys are used "with the key material remaining non-exportable": operations run in a system process, and on supported hardware the key never leaves the Trusted Execution Environment or a StrongBox secure element ([Android Keystore system](https://developer.android.com/privacy-and-security/keystore)). The Keystore holds keys, not arbitrary data, so the pattern is a Keystore key that encrypts the token you store. Keys can also require recent user authentication before each use.

What never goes on the device: server API keys for third parties (proxy those calls through your backend), signing keys, other users' data beyond what the screen needs, and anything in logs. Treat the local database as readable by anyone who has the unlocked phone, and encrypt it when it holds sensitive data. The full rules for classifying and handling that data are in [Sensitive Data](/docs/security/sensitive-data).

## Push Notifications

Push goes through Apple Push Notification service on iOS and Firebase Cloud Messaging on Android: the app registers, receives a device token, and uploads it to your server, which sends through the platform service. The server side (token lifecycle, consent, quiet hours, the one outbound gate every message passes) is [Notifications & Consent](/docs/building-blocks/notifications#push-notifications). The app side is about the permission prompt, which you get one good shot at:

- **Ask in context, not on first launch.** Apple: "Sending the request in context provides a better experience than automatically requesting authorization on first launch, because people can see the purpose your apps notifications serve" ([Apple: Asking permission to use notifications](https://developer.apple.com/documentation/usernotifications/asking-permission-to-use-notifications)). Ask when the user follows a thread, places an order, or turns on an alert. The system prompt shows only once; after a refusal, the only way back is Settings.
- **Android 13 made it opt-in.** On a fresh install on Android 13 or later, "your app's notifications are off by default" until the user grants `POST_NOTIFICATIONS`, and an app targeting Android 13 controls when the dialog appears ([Android: Notification runtime permission](https://developer.android.com/develop/ui/views/notifications/notification-permission)).
- **Consider provisional authorization on iOS.** It grants quiet delivery to Notification Center without a prompt, and the user decides to keep or turn off your notifications when they first see one. It suits apps whose notifications prove themselves better than a prompt can describe them.
- **Push must not be required for the app to work,** and marketing push needs explicit opt-in through consent language in the app with an in-app way to opt out (Apple Guideline 4.5.4). Send "You have a new message" and fetch the content in the app, since payloads show on lock screens.

Register for a token on every launch and upload it when it changes: tokens rotate on reinstall, restore and sometimes for no visible reason.

## Deep Links

A link to `https://example.com/orders/123` should open the order in the app if it's installed and the web page if it isn't. That's what **universal links** (iOS) and **Android App Links** do: the app declares the domains it handles, and the domain publishes a file naming the app (`apple-app-site-association` and `assetlinks.json`, both under `/.well-known/`), so the OS knows the association is real.

- **Prefer verified `https` links to custom schemes.** Apple says "universal links are strongly recommended" over custom URL schemes, and warns that if several apps register the same scheme, "the app the system targets is undefined" ([Apple: Defining a custom URL scheme](https://developer.apple.com/documentation/xcode/defining-a-custom-url-scheme-for-your-app)). Android App Links, on Android 6 and later with Google services, skip the disambiguation dialog plain deep links get ([Android: About app links](https://developer.android.com/training/app-links)).
- **One URL space for web and app.** The same path works in a browser, in an email, in a push notification and in the app's own navigation. Design routes once, as you would for the web, and keep a web page behind every one of them.
- **Treat every link as untrusted input.** Apple again: universal links "offer a potential attack vector into your app, so make sure to validate all URL parameters," and don't let a link "directly delete content or access sensitive information." A link opens a screen; acting still takes the user's tap, and the screen still checks the user may see the object.
- **Links survive the install.** A link tapped before installing should land on the right screen after the first launch (deferred deep linking). Carry the intended path through the store and sign-in, and test the cold-start path, which is where most link handling breaks.

## Store Rules That Shape the Design

App review is a design constraint, not a final hurdle. Read the guidelines before designing sign-in, payments and anything that looks like an app store of its own.

**Digital goods go through the store's billing, with exceptions that are moving.** Apple's Guideline 3.1.1: "If you want to unlock features or functionality within your app, (by way of example: subscriptions, in-game currencies, game levels, access to premium content, or unlocking a full version), you must use in-app purchase." Physical goods and services consumed outside the app (a ride, a meal, a repair) use your own payments. Multiplatform services may let users access what they bought on the web, provided those items are also available as in-app purchases (3.1.3(b)). The rule about pointing users elsewhere has changed by region: the guidelines now say entitlements "are not required for developers to include buttons, external links, or other calls to action in their United States storefront apps," while other storefronts allow links only under specific entitlements.

Google Play's Payments policy requires Google Play's billing system for digital goods and in-app features, exempts physical goods and services, and permits alternative billing or links out only in eligible regions under enrollment programs ([Google Play: Payments policy](https://support.google.com/googleplay/android-developer/answer/9858738)). In the US, following the Ninth Circuit's September 12, 2025 decision in the Epic litigation, Google stopped requiring Play Billing and allowed links to outside transactions from October 29, 2025, launched its external content links and alternative billing programs on December 9, 2025, and required enrolled developers to report transactions and pay service fees from October 1, 2026; a further settlement on March 4, 2026 asked the court for a revised injunction ([Google Play: Changes to Google Play in the US](https://support.google.com/googleplay/android-developer/answer/15582165)). <!-- source-gap: play-us-revised-injunction | status | Google and Epic's March 4, 2026 settlement asked the court for a revised Modified Injunction whose terms were not yet published | closes with: the court's order or Google's Play Console Help update describing the revised injunction | checked: 2026-11-03 --> The revised terms weren't published when this was written, so check that page before designing a US payment flow.

The design consequences are stable even while the rules move:

- **Keep entitlements on your server,** computed across store purchases and web purchases, so the app can sell through the store, the web, or both without a rewrite. How store subscriptions map onto your billing states is in [Subscriptions](/docs/money/subscriptions#app-store-subscriptions).
- **Make the payment path per storefront a configuration,** not a code path baked into the release.
- **No downloaded features.** Guideline 2.5.2 forbids downloading code "which introduces or changes features or functionality of the app"; [Mobile Releases](/docs/delivery/mobile-releases#over-the-air-updates-within-the-rules) covers what over-the-air updates may still do.
- **Account deletion in the app,** sign-in only where it's needed, and Sign in with Apple wherever social login is offered, as above.

## Minimum OS Versions

Every OS version you support is a configuration to test and a set of APIs you can't use. Every version you drop is users who can't install your next release. Set the floor from data, not habit.

Three inputs decide it:

1. **Your own analytics**: the share of active users, and of revenue, on each OS version. This is the number that matters, and it can differ sharply from the platform average (enterprise fleets lag; consumer apps skew new).
2. **The platform's adoption.** Apple publishes it: as of June 7, 2026, iOS 26 ran on 86% of iPhones introduced in the last four years and 79% of all iPhones that transacted on the App Store ([Apple: App Store usage](https://developer.apple.com/support/app-store/)). Android is more spread out across versions and manufacturers, which is why your own numbers matter more there.
3. **The stores' own floors.** These are about the SDK you build with and target, not the minimum you support. Since April 28, 2026, App Store uploads must be built with Xcode 26 and the iOS 26 SDK, and from September 9, 2026, iOS apps must target iOS 13 or later ([Apple: Upcoming requirements](https://developer.apple.com/news/upcoming-requirements/)). Google Play requires new apps and updates to target Android 16 (API level 36) by August 31, 2026, with extensions to November 1, 2026 on request ([Google Play: Target API level requirements](https://support.google.com/googleplay/android-developer/answer/11926878)). Targeting a new API level changes behavior (permissions, background limits), so the yearly bump is planned work, not a build flag.

My default is to support the current major release and the two before it on iOS, review the floor once a year after the new release ships, and drop a version when it falls under a few percent of active users and holds back an API you need. On Android, set `minSdk` from your own usage and keep it where the cost of the oldest versions (test devices, workarounds) is still worth the users on them. Either way, publish the policy so support, sales and the API team know what's coming. Raising the OS floor and raising the app's minimum version are separate decisions: users on a dropped OS keep the last build that supported it, and your API keeps serving them until that build falls under the app's minimum.

## Accessibility on Mobile

Accessibility on mobile is mostly the platform's, if you let it be. Native controls come with screen reader labels, focus order, Dynamic Type and contrast behavior that a custom-drawn control has to rebuild. The baseline is the same as the web (WCAG 2.2 AA, per [Accessibility](/docs/frontend/accessibility)); the W3C's WCAG2ICT note, updated December 11, 2025, explains how its criteria apply to non-web software such as apps ([WCAG2ICT](https://www.w3.org/TR/wcag2ict/)).

- **Touch targets:** Apple's default control size is 44 by 44 points, with 28 by 28 as the minimum ([Apple HIG: Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)); Android recommends at least 48 by 48 dp ([Android: Make apps more accessible](https://developer.android.com/guide/topics/ui/accessibility/apps)). Extend the hit area of a small icon rather than enlarging the icon.
- **Text that scales:** support Dynamic Type on iOS (Apple asks for enlargement to at least 200 percent) and `sp` units on Android, and test at the largest sizes, where fixed-height rows clip and labels overlap.
- **Labels for everything a screen reader meets:** `accessibilityLabel` on iOS, `contentDescription` on Android, describing purpose ("Share"), not appearance ("arrow icon"). Decorative images are hidden from assistive technology.
- **Contrast:** 4.5:1 for normal text and 3:1 for large text, in light and dark mode.
- **Test with VoiceOver and TalkBack** on a real device for each release's new screens, and run the platforms' automated checks (Xcode's Accessibility Inspector, Android's Accessibility Scanner and Compose test APIs) in CI.

It's also the law in more places. The US Department of Justice's rule for state and local governments adopts WCAG 2.1 AA and applies to their mobile apps, with compliance dates moved in 2026 to April 26, 2027 for governments of 50,000 people or more and April 26, 2028 for smaller ones ([ADA.gov: Fact sheet on the web and mobile accessibility rule](https://www.ada.gov/resources/2024-03-08-web-rule/)). An app built to WCAG 2.2 AA clears that bar.

## Startup Time and App Size

**Startup is the first impression and the most-measured number.** Android defines two metrics: time to initial display (TTID), "the time it takes to display the first frame," and time to full display (TTFD), "the time it takes for the app to become fully interactive," which the app reports with `reportFullyDrawn` ([Android: App startup time](https://developer.android.com/topic/performance/vitals/launch-time)). Google recommends optimizing for the cold start, where the process starts from nothing, since warm and hot starts improve with it. Measure the same two moments on iOS: first frame, and first usable screen.

- **Do nothing in startup that the first screen doesn't need.** SDK initializations (analytics, crash reporting, ads, feature flags) are the usual culprits; initialize lazily or after the first frame. Google's own advice for heavy initialization is "lazy initialization. In other words, only initialize objects that are immediately needed."
- **Show cached data first,** from the local database, and refresh behind it. Never block launch on the network or on fetching flags.
- **Precompile the startup path** on Android with Baseline Profiles, and keep the dependency graph small on iOS, where every dynamic framework adds load time.
- **Track startup per release** as a [release health gate](/docs/delivery/mobile-releases#release-health-gates), so a new SDK that adds 400 milliseconds is caught at 1% rollout, not in reviews.

**App size decides who installs.** Google Play limits the base module to 500 MB of compressed download, and apps over 200 MB show users on mobile data a dialog about the size before installing ([Google Play: Optimize your app's size](https://support.google.com/googleplay/android-developer/answer/9859372)). Ship Android App Bundles so each device downloads only its own architecture and resources, deliver large assets on demand, strip unused code with R8, and audit the size contribution of every SDK before adding it. A size budget in CI, failing the build when the download grows more than an agreed amount, stops the slow creep nobody notices release by release.

## Checklist

- **A deliberate platform choice:** native by default, a cross-platform framework for a stated reason.
- **Layers inside the app,** with the local database feeding the UI and idempotent, cellular-sized network calls.
- **An API that serves every supported version:** additive changes, tolerant readers, the app version on every request, a minimum version enforced from the first release.
- **OAuth with PKCE through the system browser,** no client secret in the binary, refresh tokens in secure storage, App Attest or Play Integrity as one risk signal.
- **Secrets in the Keychain or behind Keystore keys,** nothing else secret on the device.
- **Push permission asked in context,** tokens uploaded on change, no sensitive payloads.
- **Verified universal links and App Links,** one URL space with the web, every parameter validated.
- **Store rules designed in:** entitlements on the server, per-storefront payment paths, in-app account deletion.
- **A published minimum OS policy,** reviewed yearly against your own usage and the stores' SDK floors.
- **Accessibility from native controls,** tested with VoiceOver and TalkBack at the largest text sizes.
- **Startup and size measured per release,** with budgets that fail the build or the rollout.

## References

**Specifications**

- [RFC 8252: OAuth 2.0 for Native Apps](https://www.rfc-editor.org/rfc/rfc8252), the external user-agent requirement, PKCE, redirect URI options and native apps as public clients
- [W3C: WCAG2ICT](https://www.w3.org/TR/wcag2ict/), applying WCAG 2 to non-web software, December 11, 2025

**Reference**

- [Apple: App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), 2.5.2 downloaded code, 3.1.1 in-app purchase and the US storefront exception, 3.1.3(b) multiplatform services, 4.2 minimum functionality, 4.5.4 push, 4.8 login services, 5.1.1(v) account deletion
- [Apple: Upcoming requirements](https://developer.apple.com/news/upcoming-requirements/), the Xcode 26 SDK requirement from April 28, 2026 and the iOS 13 minimum target from September 9, 2026
- [Apple: App Store usage](https://developer.apple.com/support/app-store/), iOS 26 adoption measured June 7, 2026
- [Apple: Keychain services](https://developer.apple.com/documentation/security/keychain-services), storing small secrets in an encrypted database
- [Apple: Establishing your app's integrity](https://developer.apple.com/documentation/devicecheck/establishing-your-app-s-integrity), App Attest keys, attestation and server-side verification
- [Apple: Asking permission to use notifications](https://developer.apple.com/documentation/usernotifications/asking-permission-to-use-notifications), asking in context and provisional authorization
- [Apple: Defining a custom URL scheme](https://developer.apple.com/documentation/xcode/defining-a-custom-url-scheme-for-your-app), why universal links are recommended over schemes
- [Apple: Supporting universal links in your app](https://developer.apple.com/documentation/xcode/supporting-universal-links-in-your-app), handling links and validating their parameters
- [Apple HIG: Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility), control sizes and Dynamic Type
- [Google Play: Payments policy](https://support.google.com/googleplay/android-developer/answer/9858738), Play Billing for digital goods, exemptions, alternative billing and links in eligible regions
- [Google Play: Changes to Google Play in the US](https://support.google.com/googleplay/android-developer/answer/15582165), the post-Epic US programs, dates and fees
- [Google Play: Target API level requirements](https://support.google.com/googleplay/android-developer/answer/11926878), Android 16 (API 36) by August 31, 2026
- [Google Play: Optimize your app's size](https://support.google.com/googleplay/android-developer/answer/9859372), the 500 MB base module limit and the 200 MB mobile data dialog
- [Android Keystore system](https://developer.android.com/privacy-and-security/keystore), non-exportable keys, TEE and StrongBox, user authentication binding
- [Android: Play Integrity API overview](https://developer.android.com/google/play/integrity/overview), verdicts, request limits and using it as one signal
- [Android: Notification runtime permission](https://developer.android.com/develop/ui/views/notifications/notification-permission), off by default on Android 13 and asking in context
- [Android: About app links](https://developer.android.com/training/app-links), deep links versus verified App Links
- [Android: App startup time](https://developer.android.com/topic/performance/vitals/launch-time), TTID, TTFD and cold starts
- [Android: Make apps more accessible](https://developer.android.com/guide/topics/ui/accessibility/apps), 48 dp targets, contrast and content descriptions
- [ADA.gov: Fact sheet on the web and mobile accessibility rule](https://www.ada.gov/resources/2024-03-08-web-rule/), WCAG 2.1 AA for government apps and the 2026 compliance dates

**In practice**

- [React Native: New Architecture](https://reactnative.dev/architecture/landing-page), JSI replacing the bridge, default since 0.76
- [Flutter: Architectural overview](https://docs.flutter.dev/resources/architectural-overview), Flutter's own widgets and the Impeller renderer
- [Kotlin Multiplatform overview](https://kotlinlang.org/docs/multiplatform/kmp-overview.html), sharing logic with native or shared UI
