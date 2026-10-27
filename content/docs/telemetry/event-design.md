+++
title = "Event Design & Instrumentation"
description = "What to track and why: questions before events, object_action names, properties and context, versioned schemas, tracking plans as code, and identity stitching."
category = "Telemetry & Analytics"
order = 1251
tags = ["telemetry", "analytics", "events", "tracking-plan", "schemas", "identity"]
+++

Every product ends up instrumented. A SaaS app wants to know which teams finish onboarding, a store wants to know where checkout loses people, a game wants to know which level players quit on, a field service app wants to know how long a technician spends between arriving and starting work, and a bank wants to know how many people abandon an application at the identity check. Each of those starts as one `track()` call added by whoever needed the number that week, and a few years later there are hundreds of event names, several spellings of "signed up", and a funnel nobody trusts.

Bad instrumentation is expensive in a quiet way. It doesn't break the product; it breaks decisions, and nobody finds out until two dashboards disagree in a planning meeting. This chapter is how I design events so they stay useful: start from questions, name and shape events by one convention, hold every event to a versioned schema, keep the tracking plan in the repository, and get identity right before the first dashboard is built. [Collecting Events](/docs/telemetry/collection) covers getting the events off the device reliably, and [Consent & Privacy in Telemetry](/docs/telemetry/consent-and-privacy) covers what you may collect at all.

## Questions Before Events

The tracking plan starts with the decisions the data is for, not with a list of buttons. Amplitude's planning guide puts it as starting from goals and metrics because that "helps ensure you've prioritized the most important ones for your implementation," and Segment's recommends limiting a first plan "to a few core events." I agree with both, and I'd go further: an event without a question behind it is a cost with no owner.

So every event in the plan carries three things besides its schema:

- **The question it answers.** "What share of new workspaces invite a second member within seven days?" is a question. "Track the invite button" is not.
- **The metric or report that reads it.** If nothing reads it yet, it waits.
- **An owner,** the person who gets asked when it breaks and who decides when it's retired.

Questions also decide granularity. "Do people finish checkout?" needs `checkout_started` and `order_completed`. "Where in checkout do they stop?" needs a step event with the step as a property. "Why do they stop?" usually isn't answered by more events at all; it's answered by talking to users, and no amount of click tracking replaces that.

The opposite school, "track everything and analyze later," is what autocapture tools sell. It's fine for exploration, and I don't object to it running alongside a plan. It fails as the source of truth because a captured click on a CSS selector has no meaning until someone defines it, and the definition breaks the next time a designer renames the class.

## Names: Object, Then Action

Pick one naming convention for the whole company and enforce it in code. The one I use is **`object_action`, lowercase snake_case, action in the past tense:** `order_completed`, `invite_sent`, `report_exported`, `level_failed`, `visit_started`, `application_submitted`. The object comes first so related events sort together (`order_created`, `order_completed`, `order_refunded`), and the past tense says the event is a fact, the same rule as [Events & Async Messaging](/docs/architecture/events). [Data Pipelines & Analytics](/docs/architecture/data-pipelines#event-tracking) uses the same convention, and it matches the database and JSON field casing, so an event name can be a table name in the warehouse without quoting.

Vendors differ on casing. Segment's planning guide is a fan of "the Object (`Blog Post`) + Action (`Read`) framework" and recommends Title Case for event names with snake_case properties; Amplitude's default is also Title Case noun and past-tense verb. Either works. What doesn't work is two conventions at once: Amplitude points out that it "captures `Song Played` and `song played` as two separate events," and every analytics tool does the same.

The rules that matter more than casing:

- **No values in names.** `level_3_completed`, `clicked_pricing_annual` and `weapon_shotgun_fired` turn one event into hundreds. The level, the plan and the weapon are properties. Segment's guide warns against dynamic event names and values in names for exactly this reason; an event name is a low-cardinality key, the same rule OpenTelemetry applies to its own event names.
- **Name the outcome, not the widget.** `invite_sent` survives a redesign; `invite_button_clicked` doesn't, and it also counts the clicks that failed validation.
- **One event per action, with variation in properties.** `signup_completed` with a `method` of `email`, `google` or `sso` beats three events, which every funnel then has to union.
- **A reserved prefix for operational and automatic events,** so `sdk_` or `app_` events from the collector never collide with product events.

## Properties and Context

An event has three layers of fields, and keeping them apart is most of what makes events queryable:

| Layer | What it holds | Set by | Example fields |
| --- | --- | --- | --- |
| **Envelope** | Identity of the event itself | The SDK or collector | `event_id`, `event`, `schema`, `occurred_at` |
| **Context** | Where and on what it happened, the same for every event in a session | The SDK, once | `app_version`, `platform`, `os`, `locale`, `session_id`, `page_path` |
| **Properties** | What is specific to this occurrence | The call site | `order_id`, `item_count`, `total_amount`, `currency`, `step` |

Amplitude draws the same line between event properties, "attributes that describe details specific to a particular instance of an event," and user properties, which "apply across all the user's future events until you change them." I treat user properties (plan, role, cohort) as a join in the warehouse rather than something copied into every event, because a copied value is frozen at the time of the event, which is sometimes exactly what you want and usually not what you meant.

```json
{
  "event_id": "019a1f3c-5b7e-7d21-8c4a-3e9f0b6d2a71",
  "event": "order_completed",
  "schema": "https://schemas.example.com/events/order_completed/1-0-2.json",
  "occurred_at": "2026-10-22T14:23:45.123Z",
  "anonymous_id": "019a1e88-0c3d-7a10-9f2b-6d4e8a1c5b90",
  "user_id": "01932c6c-7616-7590-a8db-cb4b0e4d1c8a",
  "context": {
    "platform": "web",
    "app_version": "4.12.0",
    "session_id": "019a1f30-77aa-7c05-b1d2-0e5f6a7b8c9d",
    "locale": "en-GB",
    "page_path": "/checkout"
  },
  "properties": {
    "order_id": "019a1f3c-4a10-7e33-a6b5-2c8d9e0f1a2b",
    "item_count": 3,
    "total_amount": 4599,
    "currency": "EUR",
    "payment_method": "card"
  }
}
```

The conventions are the rest of the playbook's, applied to events:

- **IDs are opaque [UUID v7](/docs/fundamentals/identifier-conventions),** including the event ID, which the client generates so retries can be deduplicated ([Collecting Events](/docs/telemetry/collection)).
- **Times are [RFC 3339 in UTC](/docs/fundamentals/time)** and end in `_at`. A business date ends in `_on` and is assigned in the business's zone, not the device's.
- **Money is an integer amount in minor units with a `currency`,** per [Money & Amounts](/docs/payments/money). `total: 45.99` in an event is how revenue dashboards drift from the ledger.
- **Units go in the name** when they aren't obvious: `duration_ms`, `distance_m`, `file_size_bytes`.
- **Enumerations are lowercase strings from a declared list,** never free text. A free-text property is where personal data leaks in unnoticed, and where `Card`, `card` and `credit card` become three payment methods.
- **No personal data in properties by default.** The user is referenced by ID. An email, a name, a phone number or a free-text search query needs a stated purpose and goes through [Consent & Privacy in Telemetry](/docs/telemetry/consent-and-privacy).

Context is also where the product's own dimensions go. A game adds the build, match and map version ([Telemetry & Analytics in games](/books/gaming/telemetry#gameplay-events)); a multi-tenant SaaS adds the `tenant_id` ([Multi-Tenancy](/docs/architecture/multi-tenancy)); a field app adds the job and the device's connectivity state. Decide them once per product, set them in the SDK wrapper, and no call site has to remember them.

## Schemas and Versioning

An event without a schema is a suggestion. Every event type gets a machine-readable schema, validated when the event is collected, with a version that says whether old data still fits.

Snowplow built its pipeline around this idea. Its schemas are "self-describing JSON schemas, meaning that they contain metadata about themselves": a `self` block with vendor, name, format and version, referenced by a URI such as `iglu:com.snowplowanalytics.snowplow/page_view/jsonschema/1-0-0` and hosted in an Iglu registry. Each event is validated against its schema; events that fail go to a separate failed-events stream instead of being dropped, so they can be fixed and reprocessed. Its versioning is the clearest I know for analytics data: bump the first number for "a breaking change that prevents the new schema from validating historical data," the second for "a change that may prevent the new schema from validating some historical data," and the third for "a change that's compatible with all historical data," such as an optional field.

```json
{
  "$schema": "http://iglucentral.com/schemas/com.snowplowanalytics.self-desc/schema/jsonschema/1-0-0#",
  "self": { "vendor": "com.example", "name": "order_completed", "format": "jsonschema", "version": "1-0-2" },
  "description": "An order was paid and confirmed. Read by the checkout funnel and the revenue reconciliation.",
  "type": "object",
  "properties": {
    "order_id": { "type": "string", "format": "uuid" },
    "item_count": { "type": "integer", "minimum": 1 },
    "total_amount": { "type": "integer", "minimum": 0 },
    "currency": { "type": "string", "pattern": "^[A-Z]{3}$" },
    "payment_method": { "enum": ["card", "wallet", "bank_transfer", "gift_card"] },
    "coupon_code": { "type": ["string", "null"], "maxLength": 32 }
  },
  "required": ["order_id", "item_count", "total_amount", "currency", "payment_method"],
  "additionalProperties": false
}
```

Segment's Protocols and the planning features in Amplitude and Mixpanel reach the same place from a hosted tracking plan: Protocols raises a violation for "any event or property that does not match the tracking plan," and can forward blocked events "to a separate quarantined Segment source for analysis and review." Whichever tool holds the schema, the rules I hold events to are the [event schema evolution](/docs/architecture/events#schema-evolution) rules from the rest of the playbook:

- **Additive changes are free.** A new optional property is a third-number bump.
- **A rename, a type change or a new required property is a new major version,** emitted alongside the old one until every dashboard and model has moved. In CloudEvents terms, that's a new `dataschema` URI: the spec says "incompatible changes to the schema SHOULD be reflected by a different URI."
- **Failed validation quarantines, never drops and never loads.** Dropped events hide the bug; loaded ones poison the tables.
- **The schema version travels on the event,** so a model can handle `1-x` and `2-x` side by side during a migration.

When product events cross into the service event bus, they use the playbook's [CloudEvents envelope](/docs/architecture/events#envelope-cloudevents-binary-mode): `event_id` maps to `ce-id`, `event` to `ce-type`, `occurred_at` to `ce-time` and `schema` to `ce-dataschema`.

## The Tracking Plan Is Code

A tracking plan in a spreadsheet is accurate on the day it's written. Mine lives in the repository: one schema file per event version, with its question, owner and consumers in the schema's description or a sibling file, reviewed in pull requests like an API change.

The useful part is generating code from it. Avo's Codegen "produces type safe analytics wrappers that are code generated based on your tracking plan," so a call site can't send a property the plan doesn't define or misspell an event name; Avo's recommended flow is to change the plan on a branch, get it reviewed, implement it on a git branch, merge the git branch and then merge the plan. You don't need a vendor for the core of it:

```ts
// Generated from tracking-plan/order_completed/1-0-2.json. Do not edit.
export function trackOrderCompleted(p: {
  order_id: string;
  item_count: number;
  total_amount: number;
  currency: string;
  payment_method: "card" | "wallet" | "bank_transfer" | "gift_card";
  coupon_code?: string | null;
}): void {
  track("order_completed", "1-0-2", p);
}
```

CI then checks three things: every schema is valid and its version change matches its diff (a removed property with a patch bump fails), every generated function is up to date, and no code calls the raw `track()` with a string literal. A fourth check, run against production rather than in CI, compares what is actually arriving with the plan: Avo's Inspector and Segment's violations both do this, and a home-grown version is a daily query over the quarantine table.

## Identity

Most analytics questions are about people, and most events arrive before the product knows who the person is. A visitor reads three pricing pages, a player installs and plays a tutorial, a homeowner gets a quote from a field service company, all before any account exists. Identity design decides whether those events end up attached to the person who later signs up.

Three identifiers, with distinct jobs:

- **Anonymous ID:** generated by the SDK on first launch or first visit, stored on the device, and sent on every event. Segment defines it as "a pseudo-unique substitute for a User ID, for cases when you don't have an absolutely unique identifier." One per device or browser, not per person.
- **User ID:** your own stable, opaque ID for the account, from your database. Never an email or a phone number, which change and are personal data; Segment's guidance is the same, to send the email as a trait, not as the ID.
- **The link:** a record that an anonymous ID belongs to a user ID, created at the moment both are known (sign-up and sign-in).

Mixpanel's simplified ID merge is a clean statement of the mechanism: "when a `$user_id` and `$device_id` are present in the same event for the first time, a mapping is created," and earlier anonymous events from that device are attributed to the user, which works across several devices. It also names the trap: call `reset()` at logout, which generates a new device ID so different people on one device aren't merged into one profile.

![Plan view of one person's events across two devices over seven days. On the phone, anonymous ID a runs from day 0 to day 5 (A1 = 5.00 days), then user u from day 5 to day 7 (U2 = 2.00). On the laptop, anonymous ID b runs from day 1 to day 4 (A2 = 3.00), user u from day 4 to day 6 (U1 = 2.00), and after logout a new anonymous ID c from day 6 to day 7 (C1 = 1.00), shown dashed because it is not linked. The highlighted dimension P1 = A1 + U2 = 7.00 days is the person's stitched history. A variable table defines each code and notes explain the link at identify, reattribution and the reset at logout.](/diagrams/tm-event-design-identity.svg "Two anonymous IDs become one person at the moment each device sees a login, and a logout starts a new anonymous ID so the next person on the laptop isn't merged in (illustrative).")

The rules I build identity on:

- **Link anonymous to known; never merge two known users through an event.** One anonymous ID maps to at most one user ID. If a shared device sees a second login, that's a new anonymous ID (after the reset) or a conflict to log, not a merge of two accounts. Merging accounts is a deliberate, reversible operation with a record, the practice in [Matching & Merging](/docs/architecture/record-linkage#merges-recorded-and-reversible).
- **Keep the link as data, not as rewritten events.** Raw events keep the IDs they arrived with; the warehouse resolves identity through a link table at query or model time. When a link turns out to be wrong, you fix one row and rebuild, instead of trying to un-merge history.
- **Expect lag.** Mixpanel says the mapping "may take up to 24 hours to propagate fully"; a funnel built over the last hour will show some converted users as anonymous.

```sql
CREATE TABLE identity_links (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  anonymous_id     UUID NOT NULL,
  user_id          UUID NOT NULL REFERENCES users (id),
  source_event_id  UUID NOT NULL,       -- the first event carrying both IDs
  linked_at        TIMESTAMPTZ NOT NULL,
  unlinked_at      TIMESTAMPTZ,         -- set when a link is found to be wrong
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT identity_links_anonymous_id_key UNIQUE (anonymous_id)
);

CREATE INDEX identity_links_user_id_idx ON identity_links (user_id);
```

Cross-product identity (a player's console and PC accounts, a customer in the CRM and in billing) is record linkage, not event tracking, and belongs in the same model as every other many-source entity ([Matching & Merging](/docs/architecture/record-linkage)).

## Events, Logs, Metrics and Traces

Product analytics events and operational telemetry are both "telemetry," and teams regularly try to make one pipeline serve both. They answer different questions for different people, with different retention and privacy rules:

| Signal | Answers | Read by | Unit | Keep |
| --- | --- | --- | --- | --- |
| **Product event** | What did people do, and did it work for them? | Product, growth, finance | One meaningful user or business action | Months to years, aggregated longer |
| **Log** | What exactly happened in this one request? | Engineers on call | One line per step | Days to weeks |
| **Metric** | Is something wrong, and how much? | Alerts, dashboards | A number aggregated over time | Months |
| **Trace** | Where did this request spend its time? | Engineers | A tree of spans | Days, usually sampled |

[Observability](/docs/operations/observability) covers the last three. OpenTelemetry also has events of its own, defined as "named occurrences at a meaningful point in time" and carried as log records with an event name, and its naming rules (dot-separated namespaces, snake_case within a component, lowercase) suit operational events well. My line: if a product manager or a finance analyst will read it, it's a product event with a schema in the tracking plan; if only an engineer debugging the system will, it's operational telemetry with OpenTelemetry conventions. A crash is operational; "the user abandoned the upload after the third failure" is a product event that the crash may have caused. Join them through IDs (the `session_id`, the `request_id`), not by sending one into the other's pipeline.

## Server Side or Client Side

Where an event is emitted decides how much it can be trusted:

| | Client-side | Server-side |
| --- | --- | --- |
| Sees | UI behavior: views, clicks, scrolls, time on screen, client errors | Committed facts: orders, payments, sign-ups, entitlements, job completions |
| Loses events to | Ad blockers, closed tabs, flaky networks, consent refusals | Very little; it's your own infrastructure |
| Can be forged by | Anyone with a browser console or a modified client | Nobody outside your system |
| Clock | The device's, which may be wrong | Yours |

My rule: **anything that counts is recorded by the server.** Revenue, sign-ups, subscription changes, a game's match results and currency grants, a technician's completed visit, a loan application's submission: the backend emits these from the same transaction that commits the fact, through the [outbox](/docs/architecture/events#the-transactional-outbox), so the event exists if and only if the thing happened. Client events are for behavior and diagnostics, and they're allowed to be incomplete. When both exist for one action (a client `checkout_submitted` and a server `order_completed`), the gap between them is itself a useful metric: it measures failures between the button and the database.

## Governance

Instrumentation rots unless someone owns it. The practices that keep it alive:

- **Every event has an owner and consumers,** in the plan. An event whose consumers are all gone is deprecated, then stopped, then removed from the plan.
- **Changes are reviewed by someone from data,** in the same pull request as the code that emits them, because dashboards and models are the event's API consumers.
- **Violations are on a dashboard,** with a weekly look: new unplanned events, schema failures by event and app version, properties arriving null that shouldn't.
- **Block at the source, not in the UI.** Mixpanel's Lexicon can hide an event, but "hiding data does not affect data ingestion"; blocking stops new data and "you cannot recover event data after you block it." Hiding is for tidiness; a bad event is fixed or stopped where it's emitted.

## Checklist

- Each event exists to answer a written question, with an owner and at least one consumer.
- Names are `object_action`, past tense, in one casing for the whole company, with no values in names.
- Envelope, context and properties are separate; IDs are UUID v7, times RFC 3339 UTC, money integer minor units with a currency.
- Every event version has a schema in the repository; validation failures are quarantined and watched.
- Typed tracking functions are generated from the plan, and CI rejects untyped calls.
- Anonymous IDs link to user IDs at sign-up and sign-in, links are a table, logout resets the anonymous ID, and known users are never merged by an event.
- Product events and operational telemetry run on separate pipelines, joined by IDs.
- Revenue and other facts that count are emitted by the server from the transaction that commits them.

## References

**Specifications**

- [CloudEvents 1.0](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md), `dataschema` changes on incompatible schema changes, and `source` plus `id` identifies duplicates
- [OpenTelemetry: Semantic conventions for events](https://opentelemetry.io/docs/specs/semconv/general/events/), events as named log records, and when to use events, spans or logs
- [OpenTelemetry: Naming](https://opentelemetry.io/docs/specs/semconv/general/naming/), dot-separated namespaces, snake_case components and lowercase names

**Reference**

- [Snowplow: Schemas](https://docs.snowplow.io/docs/fundamentals/schemas/), self-describing JSON schemas, Iglu URIs and registries, and validation into failed events
- [Snowplow: Versioning schemas](https://docs.snowplow.io/docs/fundamentals/schemas/versioning/), what each part of a schema version means for historical data
- [Segment: Planning a full installation](https://www.twilio.com/docs/segment/getting-started/03-planning-full-install), starting from goals, a few core events, Object + Action names and casing
- [Segment: Spec, common fields](https://www.twilio.com/docs/segment/connections/spec/common), `anonymousId`, `userId` and `messageId`
- [Segment: Spec, Identify](https://www.twilio.com/docs/segment/connections/spec/identify), when to identify and why the user ID isn't an email
- [Segment: Protocols](https://www.twilio.com/docs/segment/protocols), tracking plans, violations, blocking and quarantined sources
- [Amplitude: Data planning playbook](https://amplitude.com/docs/data/data-planning-playbook), goals first, naming consistency, and event versus user properties
- [Mixpanel: Identifying users (simplified)](https://docs.mixpanel.com/docs/tracking-methods/id-management/identifying-users-simplified), device to user mapping, retroactive attribution and `reset()` at logout
- [Mixpanel: Lexicon](https://docs.mixpanel.com/docs/data-governance/lexicon), describing, hiding and blocking events, and what blocking can't undo

**In practice**

- [Avo: Developer guide](https://www.avo.app/docs/implementation/devs-101), type-safe tracking code generated from the tracking plan, and Inspector
- [Avo: Avo and git](https://www.avo.app/docs/implementation/avo-and-git), the branch, review and merge order for tracking plan changes
