+++
title = "Platform Architecture"
description = "How field platforms are built: vendor data models, monolith or services, multi-tenancy, webhooks and APIs, geospatial, time zones, sync and extensibility."
category = "Field Operations Industry"
order = 1532
part = "Running the Platform"
tags = ["field-operations", "architecture", "data-model", "multi-tenancy", "webhooks", "integrations"]
+++

A field operations platform is a scheduling system, a mobile app that works without signal, a billing engine, a compliance record and an integration hub, all sharing one customer and one calendar. Every chapter before this one describes a piece of it; this one is how the pieces fit. The hard parts are not exotic. They are a data model that separates the work from the visit, a tenant model that keeps one plumbing company's customers away from the competitor across town, webhooks that arrive twice and out of order, a technician who edited a visit offline while the dispatcher moved it, and a 2 AM job that ran twice on the night the clocks changed. The general practice lives in the playbook: [Service Boundaries](/docs/architecture/service-boundaries), [Events & Async Messaging](/docs/architecture/events), [Multi-Tenancy](/docs/architecture/multi-tenancy), [Time & Date Formats](/docs/fundamentals/time) and [API Design Principles](/docs/api-design/principles). The data model itself is in [The Field Operations Business](/books/field-operations/field-operations-business#the-core-data-model); what follows is what field operations adds on top, and what the major platforms publicly document.

## The Model, Across Vendors

The volume's canonical entities, their tables and the diagram are in [The Field Operations Business](/books/field-operations/field-operations-business#the-core-data-model). Every platform converges on the same handful of concepts under different names, which is what an integration or a migration maps between:

| Concept | Salesforce Field Service | Dynamics 365 Field Service | ServiceNow FSM | Delivery platforms |
| --- | --- | --- | --- | --- |
| The work to be done (`work_orders`) | Work order, with line items | Work order, with incidents, products, services, tasks | Work order, with one or more tasks | Order or task |
| A visit at a time (`visits`) | Service appointment | Booking (bookable resource booking) | Work order task, scheduled | Stop on a route |
| Who does it | Service resource, crew | Bookable resource (people, equipment, facilities) | Field service agent | Worker or driver |
| Where they may work | Service territory, territory members | Territory | Not published | Team, hub, depot, zone |
| What they must be able to do | Skills | Characteristics | Not published | Skills (exact string match at Onfleet, Bringg) |
| Recurring source (`agreements`, `recurrences`) | Maintenance plan | Agreement | Install base work plan, planned work schedule | Varies |

Salesforce's **work type** is a template that sets duration and skill requirements and can create the appointment automatically; Dynamics runs work order statuses (Unscheduled to Posted) and booking statuses (Scheduled, Traveling, In Progress, Completed) on separate life cycles. Delivery platforms (Onfleet, Spoke, Bringg) flatten everything to a stop-level task, because most deliveries are one visit. Resources are more than technicians: Dynamics books equipment and facilities, and Salesforce models crews and capacity-based contractors, so give resources a kind from day one: the core model's `technician` (pointing at a staff member), `crew`, `contractor` and `equipment`, with vehicles in their own table.

## Architecture Options

The literature offers a short list of shapes, and the market has examples of each.

| Shape | What it is | Who ships this way | Strengths | Costs |
| --- | --- | --- | --- | --- |
| Modular monolith | One deployable, strict internal modules with owned tables | Common for products that started small and stayed in one codebase | One transaction across modules, simple ops, fast refactoring | Discipline to keep modules from reaching into each other's tables |
| Services | Independently deployed services, each owning its data | Typical once teams and load grow | Independent scaling and release, team autonomy | Distributed transactions, eventual consistency, operational overhead |
| Extensible platform | A metadata-driven core that customers and partners extend | Salesforce, Dynamics 365 (Dataverse), ServiceNow | Customers model their own business without forking | Governor and API limits, upgrade-safe extension rules, cost |
| Vertical SaaS plus marketplace | A fixed domain model, extended by partner apps over an API | FieldRoutes, ServiceTitan, simPRO | Deep fit for one trade, partners fill gaps | Integration seams, data synced across products |
| Single integrated system | One codebase owns every function, including AI agents | Some AI-native entrants | No sync between tools, one release cycle | Must build everything; less room for best-of-breed |

Why to start with a modular monolith and when to split is in [Service Boundaries](/docs/architecture/service-boundaries#start-with-a-modular-monolith). The field market argues the product-level version of the same question: Solea's comparison page makes the integrated case in market terms ("One team builds all of it, so there's nothing to connect or keep in sync"), and the marketplace model makes the opposite bet: FieldRoutes' partner marketplace lists AI call answering from Avoca, and simPRO's lists a maintenance planner, because no single vendor ships every capability first.

Inside the monolith, the modules are **bounded contexts**, each with its own model of common concepts (Fowler's term): a property is a point and a service window to scheduling, a tax jurisdiction to billing, and a regulated application site to compliance. Where to draw the lines is a judgment. One option is to start from where the vendors already draw them in the table above (customer and place, the recurring source, the work, the resource and its territory and skills); others split by product line or by team ownership. Either way each module owns its tables, as [Every Piece of Data Has One Owner](/docs/architecture/service-boundaries#every-piece-of-data-has-one-owner) describes.

My default is a modular monolith, peeling out only what has a genuinely different runtime profile in field work:

- **The optimizer.** CPU-heavy and asynchronous at every vendor that documents it (Onfleet, Spoke and OptimoRoute return a job ID and report completion later). Run it as a queue-fed worker pool ([Route Optimization](/books/field-operations/route-optimization)).
- **The messaging gateway,** with its own carriers, rate limits and consent rules ([Customer Communications](/books/field-operations/customer-communications)).
- **Mobile sync, reporting and webhook delivery,** whose load follows technicians' days, month-end, and retry schedules rather than office traffic ([Data Pipelines & Analytics](/docs/architecture/data-pipelines)).

Whatever the split, money and compliance records are written synchronously and append-only; everything else may be eventually consistent.

## Multi-Tenant SaaS

The SaaS vendors in this volume are multi-tenant: many businesses share one platform. How the large ones do it is public. Salesforce describes "a single shared multitenant database with a single schema" in which every record carries an OrgID; custom objects are "virtual constructs described by metadata," so creating one doesn't create a table, and governor limits exist to prevent "malicious or unintentional monopolization of shared, multitenant system resources." Dynamics 365 gives each customer environments on Dataverse and enforces per-user service protection limits in a sliding window, answered with HTTP 429 and a `Retry-After` header.

The playbook's [Multi-Tenancy](/docs/architecture/multi-tenancy) chapter covers the isolation models and enforcing them with row-level security; field operations adds two things:

- **A tenant hierarchy, not a flat tenant.** Brands, regions, branches and territories, with permissions, numbering, pricing and tax varying by branch. Delivery platforms draw the same tree as teams and hubs (Onfleet) or teams, fulfillment centers and service areas (Bringg). How configuration resolves down it and reports roll up it is in [Tenant Hierarchies](/docs/architecture/multi-tenancy#tenant-hierarchies).
- **Everyone's night is the same night.** Recurring work is generated and routes are optimized overnight; Dynamics agreements carry a Record Generation Time setting for exactly that reason. Thousands of tenants in one time zone want the solver at the same hour, so queue the runs with per-tenant fairness and size the pool for the peak ([Background Jobs](/docs/architecture/background-jobs#scheduling)). The optimizer makes the peak worse than most jobs, since one large branch's solve can take minutes.

## Integration: Webhooks Out, Webhooks In

A field platform is both a webhook sender (to accounting, marketing, CRM and a customer's own systems) and a receiver (from payment processors, telematics, lead sources and delivery partners). The vendors that document their webhooks agree on the essentials and differ on details:

| Vendor | Signature | Retries | Stated caveats |
| --- | --- | --- | --- |
| Onfleet | HMAC-SHA512 over the raw body, hex secret, `X-Onfleet-Signature` | Not published | Numbered trigger IDs (taskStarted, taskEta, taskCompleted, taskFailed and more) |
| Samsara | HMAC-SHA256 over `v1:<timestamp>:<body>`, `X-Samsara-Signature` with `X-Samsara-Timestamp` | 5 attempts in total, exponential backoff | No redirects; a webhook that never returns 2xx may be disabled |
| Motive | HMAC-SHA1, `X-KT-Webhook-Signature` | After 1 minute, 1 hour, 6 hours; 403 means bad signature, no retry | Handler must process each request only once |
| Spoke | Not covered on the best-practices page | About an hour, independent backoff per message | May arrive out of order; handle idempotently; redirects are errors |
| FarEye | Bearer token | Up to 4 retries | Respond 200 within 30 seconds; duplicates and out-of-order after retries |
| Stripe | HMAC-SHA256 over `timestamp.body`, `Stripe-Signature` | Up to three days in live mode | Ordering not guaranteed; 5-minute default timestamp tolerance against replay |

![Webhook delivery: the business write and an outbox row commit in one transaction, a relay signs and posts, failures retry with backoff then disable and notify; the receiver verifies the signature, dedupes on event id, returns 2xx before real work, and processes from a queue.](/diagrams/fo-platform-architecture-webhooks.svg "Sending: write the event in the same transaction as the change, then deliver from a relay with retries. Receiving: verify, dedupe, acknowledge fast, process later.")

The general practice (outbox, signatures, retries, replay) is in [Webhooks](/docs/api-design/webhooks) and [Events & Async Messaging](/docs/architecture/events#the-transactional-outbox). What the field adds:

- **Verify each vendor's own scheme.** The table has four HMAC schemes and one bearer token. Write one verifier per inbound vendor against the raw bytes, reject stale timestamps where the vendor signs one, and accept either secret during a rotation, the way Stripe keeps a rolled secret valid for up to 24 hours and signs with both.
- **Expect duplicates and disorder from field feeds.** Spoke, FarEye and Stripe all say events can arrive out of order or twice, and telematics feeds are high-volume. Dedupe on event ID, acknowledge fast, process from a queue, and on any event about a task re-read the current state from the sender's API instead of trusting the payload ([Consumers Are Idempotent](/docs/architecture/events#consumers-are-idempotent)).
- **Offer a pull feed beside push.** Oracle Field Service lets a client subscribe to event types and poll with a page marker, and FieldRoutes exposes a Changelogs resource. Pull is how an accounting or marketing partner catches up after its own outage.
- **Say where a change came from.** A visit completed offline syncs hours later; partners need the channel and both times to make sense of the event.

Your own events follow the playbook's CloudEvents envelope in binary mode, with UUID v7 IDs; the field-specific parts are the subject, the channel and when the work happened:

```http
ce-specversion: 1.0
ce-id: 019a2f6e-4c1d-7b3a-9e52-6a1f0c8d2b47
ce-source: /visits
ce-type: visit.completed
ce-subject: 019a2f6d-9e3a-7c20-b1f4-7d8e2a6c5b90
ce-time: 2026-10-26T17:05:31Z
Content-Type: application/json

{
  "id": "019a2f6d-9e3a-7c20-b1f4-7d8e2a6c5b90",
  "status": "completed",
  "work_order_id": "019a2f6c-1f20-7e85-a3d6-5b7c9e0f4a12",
  "completed_at": "2026-10-26T15:41:58Z",
  "channel": "mobile_offline",
  "synced_at": "2026-10-26T17:05:31Z",
  "version": 3
}
```

## APIs and Rate Limits

Public API terms range widely, and they shape what partners can build. ServiceTitan limits calls per application per tenant and throttles reporting separately, Spoke limits route optimizations apart from reads and writes, Briostack sells request tiers, and FieldRoutes publishes its whole API reference openly, down to chemical uses, doors and knocks.

The general rules are in the playbook: limits reported on every response with `RateLimit-Policy` and `RateLimit`, and a 429 with `Retry-After` when over ([Rate Limiting](/docs/requests/rate-limiting#headers)); opaque cursors in the `Link` header ([Pagination](/docs/requests/pagination)); batch endpoints and asynchronous jobs instead of single-record loops ([Bulk Operations](/docs/requests/bulk-operations), [Long-Running Operations](/docs/requests/long-running-operations)); deliberate versions ([Versioning & Deprecation](/docs/api-design/versioning)); and OAuth client credentials scoped to the tenants that installed the app ([API Authentication](/docs/api-design/authentication)). What the field adds is the key and the budgets: key limits on the application and the tenant together, since one partner serves many businesses and one business runs many partners, and give the expensive operations their own budgets, as ServiceTitan does for reporting and Spoke for optimization. A season-start import of a branch's customers or a nightly route solve is a job, not a burst of calls.

## Geography and Time

Service points, geocode precision and the technician's pin are in [Customers, Accounts & Properties](/books/field-operations/customers-and-properties#addresses-for-service-work); territories as polygons or ZIP lists, resolved with PostGIS, are in [Territories & Capacity](/books/field-operations/territories-and-capacity#point-in-polygon-with-postgis); and the rules for instants, local times and zones are in [Time & Date Formats](/docs/fundamentals/time). What the platform layer has to hold together:

- **Distance is not drive time.** Straight-line distance (`ST_DWithin` on geography, in meters) filters candidates; slot offers and ETAs need a road-network engine.
- **The zone belongs to the property.** Visit windows are wall-clock promises at the property, stored as local time plus its IANA zone as the [core model](/books/field-operations/field-operations-business#the-core-data-model) does, and recurrences expand in that zone ([Recurring Schedules](/books/field-operations/recurring-schedules#rfc-5545-as-the-rule-language)). ServiceTitan keeps a time zone on each location record, which is the right grain, since one branch's territory can cross a zone line.
- **Nightly generation and optimization run per business date,** in the branch's local time, idempotent per date, across the clock change ([Background Jobs](/docs/architecture/background-jobs#scheduling)).

## Roles and Permissions

Role-based access control (users assigned to roles, roles to permissions, per NIST's RBAC model) is the base ([Authorization](/docs/security/authorization)). Field operations needs scope on top: a dispatcher for the north branch, a technician who sees today's route and the properties on it, a sales rep who sees only their own accounts, a franchise owner who sees everything in their territories. ServiceTitan gates its audit trail behind View customer or View location permission, and Jobber filters its activity feed by permission.

Two traps the vendor docs surface:

- **Shared tables leak.** Dynamics 365 warns that "all users who have access to the Agent Task table can see agent feed items." Any feed, inbox or notification table needs the same row-level scoping as the records it points to.
- **Automation runs as someone.** Dynamics notes that agreement processes run with their owner's permissions. Integrations, nightly generation and AI agents each get their own identity, so "who changed this" never answers "the admin account" ([Service Accounts Are Users](/docs/security/support-access#service-accounts-are-users)).

## Mobile Sync

Technicians work in basements, crawl spaces and rural routes. The enterprise vendors document three different stances:

| Vendor | What syncs | Conflict rule |
| --- | --- | --- |
| Salesforce | Offline briefcase scoped to each worker's profile; critical changes every five minutes; auto-offline after 3 failed checks at 15-second intervals | Not published |
| Dynamics 365 | Offline profile per table, sync from 5 minutes to 1 day | Table level, not field level; by default the technician's offline change wins, or a setting makes the dispatcher's win |
| ServiceNow | Write-back actions queued in an outbox and replayed in order | A failed action is marked and not retried; conflicts are handled server side by administrators |

The design (commands replayed in order, conflicts decided per command type) is in [Offline-First Sync](/docs/architecture/offline-sync#conflicts-choosing-who-wins), and the field rule for who wins is in [Conflicts in Field Work](/books/field-operations/technician-app#conflicts-in-field-work). At the platform layer, keep money server-authoritative and plan for [Mobile Releases](/docs/delivery/mobile-releases): old app versions keep syncing for months, so the server accepts every command version still in the field.

## Extensibility

No two field businesses track exactly the same things, so every platform eventually grows three extension points:

- **Custom fields.** Salesforce stores customer-defined objects and fields as metadata; Jobber offers property-level custom fields. The design (definitions, validation, indexing, and values that reach the API, exports, webhooks and the audit trail) is in [Custom Fields](/docs/architecture/custom-fields). In field work most of them land on the property and the visit (a gate code, a pool's volume, a commercial site's PO number), and the ones a technician fills in need to sync offline and validate on the device, not only on the server.
- **Workflows.** "When a termite inspection finds activity, create a treatment estimate." Run rules as asynchronous subscribers to your domain events, with budgets; Salesforce's governor limits show why customer logic on a shared platform needs them.
- **Marketplaces.** A public API, OAuth app installs per tenant, webhooks, and a listing with a review process. Avoca describes itself as a ServiceTitan "Certified App" and appears on FieldRoutes' marketplace; simPRO lists partner apps on its own. Certification is where you enforce scopes, rate limits and data handling before a partner reaches customer data.

## Auditing

The platform-level record is one layer every write passes through, with typed actors, before and after, and reasons ([Audit Trails](/docs/architecture/audit-trails)). What the field adds:

- **The channel, including offline.** Web, mobile online, mobile offline (with device time, a sequence number and sync time), API app, webhook, AI agent. "The technician completed it at 2:10" and "the server heard at 5:05" are both facts.
- **Optimizer runs as records:** inputs, settings, locks and the result, because "why did the route change" is a question a customer, a technician and a commission dispute will all ask. ServiceTitan logs route optimization runs in its audit trail.
- **Vendor history doesn't line up.** Salesforce keeps history objects per entity, Dataverse logs old and new values per column (exportable only through the API), and Housecall Pro's activity feed shows employee and device. When you integrate, keep your own record of what each system wrote.

The field records regulators and courts ask for are in [Audit Trails & Records](/books/field-operations/audit-trails-and-records).

## What This Means for the System You Build

- **Extend the volume's core model** rather than redefining it, with resource kinds from day one, and map vendor concepts onto it for integrations and migrations.
- **Start as a modular monolith** and peel out the optimizer, messaging, sync, reporting and webhook delivery when their load demands it.
- **Scope every row by tenant and, where rules differ, by branch,** and queue nightly work per tenant with fairness.
- **Send events through an outbox** with the channel and both times; verify each inbound vendor's scheme and receive idempotently.
- **Keep the property's IANA zone** for windows and recurrences, and use drive time, not distance, for offers.
- **Sync commands, not rows,** per [Conflicts in Field Work](/books/field-operations/technician-app#conflicts-in-field-work), with money server-authoritative.
- **Make custom fields first-class** and audit centrally, with the channel (offline included) and optimizer runs as records.

## References

**Specifications**

- [IANA: Time Zone Database](https://www.iana.org/time-zones), the history of local time by location, updated as political bodies change zones and rules
- [NIST: Role Based Access Control](https://csrc.nist.gov/projects/role-based-access-control), users assigned to roles and roles to privileges, standardized as ANSI/INCITS 359

**Reference**

- [Martin Fowler: BoundedContext](https://martinfowler.com/bliki/BoundedContext.html), contexts with different models of common concepts
- [PostGIS: ST_DWithin](https://postgis.net/docs/ST_DWithin.html), meters on geography and index-assisted distance filtering
- [Stripe: Receive events in your webhook endpoint](https://docs.stripe.com/webhooks), timestamped signatures, three days of retries, no ordering guarantee, and rolled secrets kept valid for up to 24 hours with one signature per secret

**In practice**

- [Salesforce: Field Service Developer Guide (PDF)](https://resources.docs.salesforce.com/latest/latest/en-us/sfdc/pdf/field_service_dev.pdf), work orders versus service appointments, resources, territories, offline settings and history objects
- [Salesforce Architects: Platform Multitenant Architecture](https://architect.salesforce.com/fundamentals/platform-multitenant-architecture), shared schema with OrgID, metadata-defined custom objects, governor limits
- [Microsoft Learn: Work order and booking statuses](https://learn.microsoft.com/en-us/dynamics365/field-service/work-order-status-booking-status), independent lifecycles and status side effects
- [Microsoft Learn: Set up agreements](https://learn.microsoft.com/en-us/dynamics365/field-service/set-up-agreements-work-orders), record generation time and processes that run with their owner's permissions
- [Microsoft Learn: Offline data sync](https://learn.microsoft.com/en-us/dynamics365/field-service/mobile-power-app-system-offline-sync), table-level conflicts and who wins
- [Microsoft Learn: Service protection API limits](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/api-limits), per-user sliding-window limits answered with 429 and Retry-After
- [Microsoft Learn: Manage Dataverse auditing](https://learn.microsoft.com/en-us/power-platform/admin/manage-dataverse-auditing), old and new values, retention and export limits
- [Microsoft Learn: Supervise agents with agent feed](https://learn.microsoft.com/en-us/dynamics365/field-service/supervise-agents-with-agent-feed), the warning that agent tasks are visible to everyone with table access
- [ServiceNow: Field Service Management](https://www.servicenow.com/docs/r/DBkKvgbNn2vmEpXdLk9O2w/7VK7EvpC7hPlIEAZ9EvSbg), the task-driven work order model
- [ServiceNow: Mobile action item guidelines](https://www.servicenow.com/docs/r/mobile/action-item-general-guideline.html), ordered offline outbox and server-side conflict handling
- [ServiceTitan: Default API rate limits](https://help.servicetitan.com/docs/default-api-rate-limitsfor-regular-apis-and-reporting-apis), limits per app per tenant, with reporting throttled separately
- [ServiceTitan: Audit trail on customer and location records](https://help.servicetitan.com/docs/use-the-audit-trail-on-customer-and-location-records), user, field, timestamp, old and new values, time zone per location
- [Briostack: Public API](https://www.briostack.com/public-api/), OAuth 2.0 and request tiers
- [FieldRoutes: API reference](https://knowledgebase.fieldroutes.com/apidocs), public resources including changelogs
- [Onfleet: Webhooks](https://docs.onfleet.com/reference/webhooks) and [Onfleet: Secrets](https://docs.onfleet.com/reference/secrets), trigger IDs and HMAC-SHA512 signing
- [Samsara: Webhooks](https://developers.samsara.com/docs/webhooks), timestamped HMAC-SHA256, five attempts, no redirects, inactive webhooks disabled
- [Motive: Webhooks v2](https://developer.gomotive.com/reference/webhooks-v2), HMAC-SHA1 and the 1 minute, 1 hour, 6 hour retry schedule
- [Spoke: Webhook best practices](https://developer.dispatch.spoke.com/docs/webhooks/getting-started/best-practices), an hour of retries, out-of-order delivery, idempotent handling
- [Spoke: Dispatch API](https://developer.dispatch.spoke.com/api), separate rate limits for reads, writes and optimizations
- [FarEye: Developer self-guide](https://developer.fareyeconnect.com/self-guide.html), 30-second acknowledgement, four retries, duplicates
- [Oracle Field Service: Receiving events](https://docs.oracle.com/en/cloud/saas/field-service/cxfsc/OFSC_Receiving_Events.html), subscription and polling event feed
- [Bringg: Glossary](https://help.bringg.com/docs/glossary-overview), teams, fulfillment centers and service areas by map or ZIP
- [Solea: Compare with FieldRoutes](https://www.solea.ai/compare/fieldroutes), the single-system argument
- [FieldRoutes Marketplace: Avoca](https://marketplace.fieldroutes.com/partners/avoca-ai.md), a partner AI app on a vertical platform's marketplace
- [simPRO Marketplace: Maintenance Planner](https://marketplace.simprogroup.com/apps/simpro-maintenance-planner), partner extension of a trades platform
- [Jobber: Activity feed](https://help.getjobber.com/en/articles/activity-feed/), permission-filtered history
- [Housecall Pro: Activity feed](https://help.housecallpro.com/en/articles/4154392-activity-feed), entries showing employee and device
