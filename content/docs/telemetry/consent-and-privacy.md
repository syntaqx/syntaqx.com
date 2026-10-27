+++
title = "Consent & Privacy in Telemetry"
description = "Analytics within the rules: consent before device storage, gating SDKs, opt-out signals like GPC, minors, minimizing, pseudonymous IDs, retention and deletion."
category = "Telemetry & Analytics"
order = 1253
tags = ["telemetry", "analytics", "privacy", "consent", "gdpr", "ccpa"]
+++

Analytics is the part of a product most likely to collect personal data nobody decided to collect. An SDK added for one funnel sets an identifier on every visitor before the cookie banner has rendered. A page URL carries an email address in its query string into every event. A support tool's session replay records a bank customer typing their account number. A game's analytics SDK sends a device ID for a nine-year-old player to an ad network. Each was one line of code, and each is the kind of thing regulators write about.

The rules aren't vague about telemetry; they're just spread across several laws, and they ask different questions. This chapter is how I build analytics so it's on the right side of them by construction: what needs consent before anything runs, how SDKs are gated, how opt-out signals are honored, what changes for children, and how minimization, pseudonymous IDs, retention and deletion work in an event pipeline. [GDPR & Privacy](/docs/compliance/gdpr) covers the law in general and [Data Retention & Deletion](/docs/architecture/data-retention) the deletion mechanics; this is the telemetry-specific part. It describes how the rules shape the system, not legal advice for your product, which is a question for counsel.

## Two Rules, Two Questions

In Europe, two different laws apply to the same analytics call, and teams that only think about one of them get the other wrong.

**The ePrivacy rule asks about the device.** Article 5(3) of the ePrivacy Directive covers "the storing of information, or the gaining of access to information already stored, in the terminal equipment of a subscriber or user," and allows it only with consent or where it's necessary for specific purposes. It's not limited to cookies, and it doesn't depend on the information being personal data. The EDPB's guidelines on its technical scope (version 2.0, adopted in October 2024) apply it to tracking pixels and tracking links, to information produced by local processing and then sent back to a server, and to IP-based tracking where the address originates from the user's equipment. An analytics SDK that writes an ID to `localStorage`, reads it on the next visit and sends it home is squarely inside it.

**The GDPR asks about the processing.** Whatever happens on the device, building profiles of identifiable people from events needs a lawful basis ([GDPR & Privacy](/docs/compliance/gdpr#lawful-bases)), a purpose, minimization and a retention period.

Some regulators carve out narrow measurement from the consent requirement, and the conditions are the useful part, because they describe what low-risk analytics looks like:

- **The UK.** The ICO's guidance lists an exception for statistical purposes, where "the sole purpose of the storage or access is to enable the person" to collect statistics about how the service is used, in order to improve it. It requires clear information and a "simple and free" way to object, and it doesn't cover tracking or profiling individual visitors, or advertising.
- **France.** The CNIL exempts audience measurement from consent if the site informs users and lets them object, limits the purpose to audience measurement and A/B testing, doesn't cross-check the data with other processing, limits the tracker to a single site or app publisher, truncates the last byte of the IP address and limits tracker lifetime to 13 months.

My default is to design analytics so that it would meet conditions like these (first-party, single-purpose, no cross-site profile, short-lived identifiers, truncated IPs) and still gate it on consent wherever the exemption doesn't clearly apply. An exemption you rely on in one country is a consent requirement in the next.

## Consent Before Collection

Where consent is required, it has to come first. The ICO puts it plainly: "If none of the exceptions apply to your use of storage and access technologies, then you must obtain prior consent." Its guidance on managing consent in practice is a good specification for any consent experience:

- **Nothing non-exempt runs before the choice.** A user ignoring the banner hasn't consented; silence and inactivity don't count.
- **Refusing is as easy as accepting,** with "reject all" as prominent as "accept all."
- **Nothing is pre-enabled.** Purpose toggles start off.
- **Continued use is not consent,** and neither are browser settings alone.
- **Purposes are separate:** analytics, personalization and advertising are distinct choices, not one bundle.
- **Withdrawal is as easy as giving consent,** and stops the technology.
- **You can prove it.** Keep a record of what was chosen, when and against which version of the notice.

That last point is the same design as the [consent ledger for notifications](/docs/architecture/notifications#the-consent-ledger): an append-only record of grants and withdrawals per purpose, keyed by the anonymous ID (and the user ID once known), with the version of the text shown. A boolean in a cookie is the current state; the ledger is the evidence.

## Gating SDKs

Consent is enforced in code, at two points.

**On the device, nothing loads until the purpose is granted.** A consent management platform (CMP) shows the choices and stores them; your SDK wrapper reads that state before it initializes any vendor SDK, sets any identifier or sends any event. Google's consent mode is a useful illustration of the two ways vendors handle it. You set a default state for each consent type (`analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization`) before any measurement command, then update it when the user chooses. In basic mode Google's tags are prevented "from loading until a user interacts with a consent banner"; in advanced mode they load anyway and, while consent is denied, "send measurements without cookies." Whether that cookieless traffic is acceptable is a legal question about your setup, not a vendor setting, which is why I default to the basic pattern: an SDK that hasn't been granted doesn't load.

The gate lives in one place:

```ts
type Purpose = "analytics" | "personalization" | "advertising";
type ConsentState = Record<Purpose, "granted" | "denied" | "unknown">;

function track(event: string, schemaVersion: string, properties: object): void {
  const consent = consentStore.current();
  if (consent.analytics !== "granted" && !isExempt(event)) return;  // not queued, not stored
  queue.append(buildEvent(event, schemaVersion, properties, { consent }));
}
```

- **Every SDK is behind the wrapper.** A vendor script pasted into a tag manager bypasses the gate; the review for a new tool asks what it collects before consent and how it's stopped.
- **The consent state travels on every event** as context, so the pipeline can check it and an auditor can see it.
- **The pipeline enforces it again.** The collector drops events whose consent state doesn't permit their purpose, and the forwarding step only sends advertising destinations the events whose state allows advertising. Client-side gates fail open more often than you'd like (a stale build, a tag added outside the wrapper); the server-side check catches it.
- **Withdrawal acts immediately:** stop sending, delete the identifiers the SDK stored on the device, and record the withdrawal.

![Dimensional sheet in two plan views. The first shows a first page view over 8 seconds at 60 px per second, with four lanes: the consent banner from 0.4 to 6.0 seconds, strictly necessary storage running throughout, analytics hatched as a keep-out until the choice at 6.0 seconds and then running, and advertising hatched for the whole view because it was refused and a Sec-GPC signal opts out of sale and sharing. The highlighted dimension W1 = 6.00 seconds is the wait for a choice during which nothing non-exempt runs. The second view, at 36 px per month, shows M1 = 13.00 months, the maximum lifetime of an analytics identifier under the CNIL exemption, and M2 = 6.00 months, the ICO's general guideline before asking someone who declined again. A variable table defines each code.](/diagrams/tm-consent-and-privacy-gating.svg "Consent gates time: nothing non-exempt runs before the choice, refused purposes stay off for the whole visit, and identifiers and re-asks have lifetimes of their own (W1 illustrative; M1 from the CNIL, M2 from the ICO).")

## California: Opt-Out of Sale and Sharing

US privacy laws mostly don't require consent before analytics. California's CCPA, as amended by the CPRA, gives people the right to stop a business selling or sharing their personal information, and the California Attorney General's summary is specific about what sharing means: "Sharing refers specifically to sharing for cross-context behavioral advertising," targeting ads based on activity "across numerous websites." So the line in a telemetry system runs between analytics you use to run your own product and the events you forward to ad platforms: conversion pixels, audience syncs, retargeting tags. Whether a particular vendor arrangement counts as a sale is a question for counsel; the system's job is to be able to turn off everything on the advertising side, per person and per device.

The signal to honor is **Global Privacy Control**. Browsers and extensions that support it send a `Sec-GPC: 1` request header, and expose `navigator.globalPrivacyControl` to scripts. The Attorney General's page says a business covered by the law "must honor" it as "a valid consumer request to stop the sale or sharing," and the CPPA's regulations (section 7025, in the text effective January 1, 2026) are precise about the scope: the business treats the signal as an opt-out "for that browser or device and any consumer profile associated with that browser or device, including pseudonymous profiles," and for the consumer too if known. It may not ask for more information than the signal to process it.

In a pipeline that means:

- **Read GPC at the edge** (the header on the first request, the JavaScript property in the SDK) and record it in the consent ledger as an opt-out of sale and sharing for that anonymous ID, and for the user ID once linked.
- **Apply it to the profile, not just the session.** Identity stitching ([Event Design & Instrumentation](/docs/telemetry/event-design#identity)) is exactly how an opt-out on one browser reaches the pseudonymous profile and the account.
- **Don't treat a missing signal as a new consent.** The regulations say that where the consumer is known, the absence of the signal after it was sent isn't consent to opt back in, and the Attorney General's page says businesses must wait at least 12 months before asking someone who opted out to opt back in.

## Minors

Children change the rules everywhere, and analytics identifiers are where products trip on them.

- **US, under 13 (COPPA).** The FTC's COPPA guidance treats "a persistent identifier that can be used to recognize a user over time and across different websites or online services" as personal information. Identifiers collected only for "support for the internal operations" of the service need no parental consent if no other personal information is collected, and the FTC says analytics can fall under that, but "the term 'support for internal operations' does not include behavioral advertising," and the identifiers may not be used to build a profile of an individual.
- **California, under 16.** The Attorney General's summary says a business may sell the data of a consumer it knows is under 16 only with opt-in authorization: from a parent for children under 13, and from the child between 13 and 16.
- **EU.** Where consent is the basis for an online service offered directly to a child, GDPR Article 8 requires parental authorization below 16, an age member states can lower to no less than 13.

The engineering consequence is a **restricted mode** decided by the age signal the product has (a date of birth, an age gate, a child-directed app): advertising destinations off, no third-party SDKs that profile, internal-operations analytics only, shorter retention. The age signal goes into the consent state on every event, so the pipeline can enforce restricted mode as it enforces consent. [Children's Privacy & Age Assurance](/docs/compliance/childrens-privacy) covers the laws in full and how to establish age in the first place. For a worked case, see how games handle child players ([Telemetry & Analytics in games](/books/gaming/telemetry#players-consent-and-children)).

## Collect Less

The cheapest privacy control is the field you never collected. Data minimization is a GDPR principle ([Data Retention & Deletion](/docs/architecture/data-retention)), and in telemetry it's mostly a set of defaults in the SDK wrapper and the collector:

- **No direct identifiers in events.** The user is an opaque user ID ([Event Design & Instrumentation](/docs/telemetry/event-design#properties-and-context)); names, emails and phone numbers stay in the systems that need them.
- **Strip URLs.** Query strings and fragments carry tokens, emails and search terms. Send the route template (`/orders/{id}`) or an allow-listed set of parameters, never the raw URL.
- **No free text by default.** Search queries, form contents and support messages are opted in per event with a stated purpose, or not collected.
- **Truncate IP addresses at the collector,** after deriving whatever coarse location or bot signal you need. The CNIL's condition (drop the last byte) is a reasonable floor.
- **Coarse over precise.** City instead of coordinates, device class instead of a full fingerprint of hardware and fonts.
- **Session replay and heatmap tools mask everything by default,** with inputs and sensitive regions never recorded, and are reviewed like any other SDK.

## Pseudonymous Is Not Anonymous

Most analytics data is pseudonymous: events keyed by an anonymous ID or an opaque user ID, with the link to a real person held somewhere else. That's valuable and it's still personal data. GDPR Recital 26 says data that has undergone pseudonymisation and could be attributed to a person using additional information is information about an identifiable person, and that only anonymous information falls outside the regulation. The EDPB's pseudonymisation guidelines (adopted for consultation in January 2025) add that this "also holds true if pseudonymised data and additional information are not in the hands of the same person," and that even when the additional information is erased, the data counts as anonymous "only if the conditions for anonymity are met."

What follows for telemetry:

- **Hashing an email is not anonymizing it.** The EDPB gives the example: if you know the transformation is a SHA-256 hash of a name, you can hash all the names you have elsewhere and see which match. An unkeyed hash of an email is a lookup table away from the email. If you need a join key, use a keyed hash (HMAC) with the key held outside the analytics domain, and still treat the output as personal data.
- **Define the pseudonymisation domain.** The EDPB's term is the context in which data shouldn't be attributable to people: typically the analytics team and its tools. Keep the identity tables (user ID to email) out of it, and give analysts the pseudonymous warehouse, not production.
- **Anonymous means aggregated, with thresholds.** A daily count of sign-ups by country is anonymous; a table of 40 rows keyed by device ID isn't, however the columns are named. Reports exported outside the analytics domain suppress small groups.

Pseudonymization is still worth doing. The EDPB notes that the risk reduction it brings may help a controller rely on legitimate interests, and it's the difference between a warehouse breach that exposes behavior keyed by random IDs and one that exposes it keyed by email.

## Retention

Raw events are the most detailed record of behavior a company holds, and they don't need to live forever. My defaults:

- **Raw events have a fixed window,** long enough to rebuild models after a bug and short enough to explain, partitioned by event date so expiring a day is dropping a partition ([Data Retention & Deletion](/docs/architecture/data-retention#retention-windows)).
- **Aggregates outlive raw data.** Daily counts by dimension, cohort tables and metric snapshots keep the history the business needs without the individual trail.
- **Identifiers expire on the device too.** A first-party analytics identifier gets a lifetime (the CNIL's 13 months is a sensible ceiling) and is regenerated after it.
- **Vendor copies have the same windows.** Set data retention in every analytics tool to match yours; a vendor holding five years of events you deleted after one is your problem, not theirs.

## Deletion Reaches the Analytics Tools

An erasure request ([GDPR & Privacy](/docs/compliance/gdpr#data-subject-rights)) has to reach every copy, and analytics creates many: the raw store, the warehouse, the stream's retention, and every vendor the events were forwarded to. [Data Retention & Deletion](/docs/architecture/data-retention#erasure-requests) describes the erasure pipeline; for telemetry, three details decide whether it works.

**Delete by every identifier.** Events are keyed by anonymous IDs as well as user IDs, so the request resolves the user ID to every linked anonymous ID through the identity links and deletes by all of them.

**Suppress, then delete.** Vendor deletion APIs are asynchronous and don't stop new data. Segment's regulations distinguish suppressing a user ID (new events "blocked at the API") from deleting what's stored, offer a combined `SUPPRESS_WITH_DELETE` that also forwards to destinations supporting programmatic deletion, and set a 30-day SLA for its own stores while not guaranteeing the timing for warehouses and destinations. Amplitude's User Privacy API processes deletions "within 30 days," but "running a deletion job for a user doesn't block new events for that user," and data still in a connected warehouse may be reingested on the next sync. So the order is: stop collection and forwarding for the person, delete in your own stores (the source of any re-sync), then call each vendor's deletion API and record the job.

**Device mode escapes server-side controls.** Segment notes that destinations loaded in the browser bypass its suppression; vendors you send to directly from the client need their own deletion call and their own consent gate. Fewer device-mode tools is a privacy feature as much as a performance one ([Collecting Events](/docs/telemetry/collection#server-side-tracking-and-cdps)).

Keep proof: the request, each system called, each job ID and its completion, without keeping the deleted data. And keep a keyed hash of the user ID on a suppression list, so a stale import or a replay doesn't bring the person back.

## Checklist

- Device storage and access is gated per purpose wherever consent is required, with exemptions relied on only where their conditions are met.
- Nothing non-exempt loads, stores or sends before the choice; refusing is as easy as accepting.
- Consent is an append-only ledger with the notice version; the current state rides on every event.
- Every SDK sits behind one wrapper, and the pipeline re-checks consent before storing or forwarding.
- GPC is read at the edge and applied as an opt-out of sale and sharing to the device's profiles and the linked account.
- An age signal switches on a restricted mode: no behavioral advertising, no profiling SDKs, shorter retention.
- Events carry opaque IDs, route templates, truncated IPs and no free text by default.
- Pseudonymous data is treated as personal data; hashes are keyed, and exports are aggregated with thresholds.
- Raw events, device identifiers and vendor copies all have retention windows.
- Erasure resolves every linked ID, suppresses first, deletes in your stores, then calls each vendor, and records the proof.

## References

**Specifications**

- [EDPB: Guidelines 2/2023 on the technical scope of Art. 5(3) of the ePrivacy Directive (PDF)](https://edpb.europa.eu/system/files/2024-10/edpb_guidelines_202302_technical_scope_art_53_eprivacydirective_v2_en_0.pdf), Article 5(3)'s wording and its application to pixels, tracking links, local processing and IP-based tracking
- [EDPB: Guidelines 01/2025 on pseudonymisation (PDF)](https://www.edpb.europa.eu/system/files/2025-01/edpb_guidelines_202501_pseudonymisation_en.pdf), pseudonymised data as personal data, the pseudonymisation domain and the hashing example
- [GDPR-Info: Recital 26](https://gdpr-info.eu/recitals/no-26/), pseudonymised versus anonymous information
- [GDPR-Info: Article 8](https://gdpr-info.eu/art-8-gdpr/), a child's consent to online services, 16 by default and no lower than 13
- [CPPA: CCPA regulations, effective January 1, 2026 (PDF)](https://cppa.ca.gov/regulations/pdf/ccpa_statute_eff_20260101.pdf), section 7025 on opt-out preference signals and pseudonymous profiles
- [W3C: Global Privacy Control](https://w3c.github.io/gpc/), the `Sec-GPC` header and `navigator.globalPrivacyControl`

**Reference**

- [ICO: What are the exceptions?](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/), the strictly necessary and statistical purposes exceptions and their conditions
- [ICO: How do we manage consent in practice?](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/how-do-we-manage-consent-in-practice/), prior consent, equal refusal, no pre-enabling, withdrawal, records and re-asking
- [CNIL: Sheet n°16, Use analytics on your websites and applications](https://www.cnil.fr/en/sheet-ndeg16-use-analytics-your-websites-and-applications), the conditions for consent-exempt audience measurement
- [California Attorney General: California Consumer Privacy Act](https://oag.ca.gov/privacy/ccpa), the opt-out of sale and sharing, what sharing means, GPC, minors and the 12-month wait
- [FTC: Complying with COPPA, frequently asked questions](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions), persistent identifiers and support for internal operations
- [Google: Set up consent mode](https://developers.google.com/tag-platform/security/guides/consent), default and updated consent states and the consent types
- [Google: Consent mode overview](https://developers.google.com/tag-platform/security/concepts/consent-mode), basic and advanced implementations
- [Segment: User deletion and suppression](https://www.twilio.com/docs/segment/privacy/user-deletion-and-suppression), regulation types, forwarding to destinations, SLAs and device-mode bypass
- [Amplitude: User Privacy API](https://amplitude.com/docs/apis/analytics/user-privacy), deletion timing, new events not blocked and reingestion from warehouses
