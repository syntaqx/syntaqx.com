+++
title = "Outages, Post-Mortems & Status Pages"
nav_title = "Outages & Status Pages"
description = "The 2025 cloud and edge outages, the global-config failure pattern, control-plane dependencies, CPaaS incidents, vendor risk, and honest status pages."
category = "Hosting & Cloud Industry"
order = 2209
part = "Running the Provider"
tags = ["outages", "post-mortems", "status-pages", "incidents", "reliability"]
+++

A provider's outage is its customers' outage, multiplied. When a cloud region fails, every company running there fails at once, and their customers find out from social media before any status page changes color. That is why the public post-mortem became a genre of its own in this industry: AWS, Google, Microsoft, Cloudflare and Fastly publish detailed write-ups of their largest failures, with timelines in minutes and the internal names of the systems that broke. Read together, they are the best public engineering literature on how large systems fail, and they say the same few things over and over.

This chapter reads them as a set. It covers how providers publish status and post-mortems, the dated history of the incidents that shaped the industry, the three 2025 cloud outages and the edge outages around them, the pattern they share (configuration pushed everywhere at once), control-plane dependencies, incidents at communications platforms, vendor risk, how status pages model components and incidents, how post-mortems are written and revised, and the tables that record status, incidents and their effect on customers on top of [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model).

The incident process itself is the playbook's: [Incident Response](/docs/operations/incident-response) for declaring, roles, severity and the postmortem template, [On-Call](/docs/operations/on-call) for paging and runbooks, [SLOs & Error Budgets](/docs/operations/slos) for what counts as an outage, [Observability](/docs/operations/observability) for seeing it, and [Disaster Recovery](/docs/operations/disaster-recovery) for surviving a region. How the parts that fail fit together is [Provider Architecture](/books/hosting-and-cloud/provider-architecture); what customers are owed afterward is SLAs & Service Credits.

## How the Providers Do It

| Provider | Status surface | Post-mortem practice, as of October 2026 |
| --- | --- | --- |
| **AWS** | AWS Health: public events on the Service health page, plus account-specific events naming the affected resources | A public post-event summary for issues with "broad and significant customer impact," such as failures of a significant percentage of control-plane API calls, total power failure or significant network failure; summaries stay up at least five years. The list shows DynamoDB (October 19, 2025), Kinesis Data Streams (July 30, 2024) and Lambda (June 13, 2023), all in US East, and none for 2026 |
| **Google Cloud** | Service Health, with an entry per incident | A mini incident report soon after, then a full report; the June 12, 2025 entry carries both, and they describe the trigger differently |
| **Microsoft Azure** | Azure status and status history | A preliminary post-incident review (PIR), then a final PIR, under one tracking ID; the history page shows only recent PIRs |
| **Cloudflare** | cloudflarestatus.com | Long engineering posts on its blog, often within a day or two, naming the internal systems and including code |
| **Fastly** | status.fastly.com | A summary post on its blog (June 8, 2021) |
| **Twilio** | status.twilio.com, per product and carrier | Incident entries with timestamps; detailed blog post-mortems for the largest events (billing, July 2013; the 2022 security incident) |
| **Hosted status pages** | Atlassian Statuspage and its peers | The provider writes the updates; the tool models components, incidents and subscribers |

Three patterns run through the table:

- **The largest providers publish the most.** Detailed public write-ups come from companies whose customers are engineers and who compete on reliability. Most web hosts and smaller clouds publish a status entry and nothing more.
- **Post-mortems are revised.** Google's mini report and full report characterize the June 2025 trigger differently; Azure's final PIR for Front Door replaced the preliminary account entirely. A provider's first explanation is a hypothesis, and the record should keep both.
- **The status page is a dependency too.** Google's first report on June 12, 2025 came about an hour late, partly because its status infrastructure was affected, and one remediation is to keep "monitoring and communication infrastructure" running when Google Cloud is down.

## How We Got Here

| Date | Incident | What it taught |
| --- | --- | --- |
| Apr 21 to 24, 2011 | AWS EBS, US East: a network change, a re-mirroring storm, a regional control plane starved | One zone's failure can reach others through a shared control plane |
| Jul 18, 2013 | Twilio billing: Redis replicas resync at once, the master restarts with the wrong configuration and drops balances; auto-recharge charges cards repeatedly; 1.4% of customers | Never charge money when the balance can't be written; promote a replica rather than restart a master |
| Jul 2, 2019 | Cloudflare: a WAF rule with a regular expression drives CPU to 100% worldwide, deployed "globally in one go"; about 27 minutes | Rules and configuration need progressive rollout like code |
| Mar 10, 2021 | OVHcloud Strasbourg fire destroys SBG2 | Backups in the same building aren't backups; French courts later held OVH liable in two cases |
| Jun 8, 2021 | Fastly: a latent bug shipped May 12, triggered by one customer's valid configuration; about 85% of the network returns errors | A single customer's change can reach the whole fleet |
| Late Sep 2021 | Bandwidth: "a series of sophisticated DDoS attacks aimed at Bandwidth and our industry" | An attack on a carrier platform is an outage for every customer's phone numbers |
| Nov 2 to 4, 2023 | Cloudflare control plane and analytics: a facility loses utility and generator power; some services existed only there; about 40 hours | Control-plane services need the data plane's redundancy |
| Jul 19, 2024 | CrowdStrike Channel File 291: a content update with 21 input fields to a sensor expecting 20 crashes Windows hosts; Microsoft estimated 8.5 million devices | A privileged agent's content push is a vendor risk to every customer at once |
| May 2024 | Google Cloud deletes UniSuper's private cloud after an internal tool left a parameter blank; recovery from backups the customer held | A provider's provisioning bug can delete a customer; keep a copy outside it |
| Jun 12, 2025 | Google Cloud Service Control; Cloudflare Workers KV fails with a third-party storage provider the same day | Global metadata without flags; a hidden dependency on another cloud |
| Jul 14, 2025 | Cloudflare 1.1.1.1 withdrawn globally for 62 minutes by a dormant configuration error | Legacy hard-coded lists and changes that skip canaries |
| Oct 19 to 20, 2025 | AWS US East: the DynamoDB DNS race, then EC2 and load balancers | Automation races, congestive collapse, health checks that remove healthy capacity |
| Oct 29 to 30, 2025 | Azure Front Door: incompatible configuration metadata crashes the data plane | Control-plane versions must agree on what they write |
| Nov 18 and Dec 5, 2025 | Cloudflare: a doubled Bot Management feature file, then a global configuration change hitting an old Lua path | Treat internally generated configuration like user input |

## The 2025 Cloud Outages

**AWS, October 19 to 20, 2025.** Impact ran from 11:48 PM PDT on October 19 to 2:20 PM PDT on October 20 in US East, in three overlapping periods. DynamoDB's DNS management has a DNS Planner that generates plans and three independent DNS Enactors that apply them to Route 53. One Enactor was delayed while retrying; another applied a newer plan and then ran cleanup, which deletes much older plans; the delayed Enactor then wrote its old plan over the new one, and cleanup deleted it, leaving the regional endpoint's DNS record with no addresses. DynamoDB was impaired until 2:40 AM. EC2's DropletWorkflow Manager, whose host state checks depend on DynamoDB, had let host leases time out; when DynamoDB returned, the volume of leases to re-establish kept timing out, and "DWFM had entered a state of congestive collapse," with no established recovery procedure. Engineers throttled work and restarted hosts at 4:14 AM. Network Manager then fell behind on propagating network state, so new instances were brought into service before their networking was ready, Network Load Balancer health checks flapped, and automatic zone DNS failover removed healthy capacity until engineers disabled it at 9:36 AM. Remediations: the DNS automation disabled worldwide until the race is fixed, a velocity control on how much capacity one load balancer can remove, a test suite for the DWFM recovery path, and queue-size-based throttling.

**Google Cloud, June 12, 2025.** Service Control, the API policy and quota check behind Google Cloud's APIs, gained new quota policy checks on May 29 in a code path that rollout never exercised, and the change "did not have appropriate error handling nor was it feature flag protected." On June 12 a policy with blank fields was written to regional Spanner tables, and because quota metadata replicates globally, "this metadata was replicated globally within seconds." The blank fields hit a null pointer and "the null pointer caused the binary to crash" in every region. The cause was identified in about 10 minutes and a kill switch was rolling out in about 40, but in us-central1 restarting tasks overloaded their Spanner table because Service Control "did not have the appropriate randomized exponential backoff," and recovery there took about 2 hours 40 minutes; the last service recovered at 18:18 Pacific. Remediations: make Service Control fail open, feature-flag critical binaries, add randomized backoff, and keep monitoring and communications running when Google Cloud is not.

**Azure Front Door, October 29 to 30, 2025.** The final PIR (tracking ID YKYN-BWZ) says a sequence of customer configuration changes across two control-plane build versions "resulted in incompatible customer configuration metadata being generated," which "triggered a crash during asynchronous processing within the data plane service." The metadata was introduced at 15:35 UTC and impact began at 15:41; configuration protection blocked further changes at 15:43; alerts fired at 15:48; propagation to the data plane was blocked at 17:30 and a last-known-good configuration rolled out from 17:40; Front Door's DNS recovered at 18:30, and the incident was mitigated at 00:05 UTC on October 30. The preliminary review had described an inadvertent configuration change that bypassed safety checks because of a defect; the final review replaced that account.

## The Edge Outages

The edge networks fail the same way at a different layer. Cloudflare's series is the most fully documented:

| Date | What broke | Scope and duration | Remediation named |
| --- | --- | --- | --- |
| Jul 2, 2019 | A WAF Managed Rules regex drove CPU to 100% | Traffic dropped by up to 82%; about 27 minutes | Progressive deployment for rules |
| Jun 12, 2025 | Workers KV's storage, backed partly by a third-party cloud that had its own outage | 90.22% of KV requests failed; Access logins failed entirely; 17:52 to 20:28 UTC | Remove the single-provider dependency |
| Jul 14, 2025 | A dormant June 6 configuration error tied the 1.1.1.1 resolver prefixes to a pre-production topology; a July 14 change withdrew them globally | 62 minutes; DNS over HTTPS mostly unaffected; a coincident BGP hijack was not the cause | Retire legacy hard-coded lists; no change skips canaries |
| Nov 18, 2025 | A database permissions change made a query return duplicate rows; the Bot Management feature file doubled past a hard limit of 200 features (normally about 60); the proxy panicked and returned 5xx | Impact 11:28 to 14:30 UTC, all clear 17:06; the file regenerated every five minutes, so the failure flapped | Treat internally generated configuration like user input; more global kill switches |
| Dec 5, 2025 | A change to protect against a React Server Components vulnerability, and disabling an internal test tool through global configuration, hit a bug in the older proxy's Lua code | About 28% of HTTP traffic returned 500s; 08:47 to 09:12 UTC | Staged rollout for threat-response data, fail open on bad configuration, break-glass access |

Fastly's June 8, 2021 outage is the other reference case: a bug shipped on May 12 waited until one customer made a valid configuration change, which caused about 85% of the network to return errors. Fastly detected it within a minute, identified the configuration at 10:27 UTC, and had 95% of the network recovered within 49 minutes.

## The Global-Config Failure Pattern

Line the 2025 write-ups up and the same sequence appears in nearly all of them:

1. **Something that isn't code changes.** A quota policy (Google), customer configuration metadata (Azure), a generated feature file (Cloudflare, November), a threat-response rule (Cloudflare, December), a DNS plan (AWS), endpoint content (CrowdStrike, 2024).
2. **It propagates everywhere quickly, by design.** Configuration is meant to take effect fast: Google's quota metadata replicated "globally within seconds," Cloudflare's feature file regenerated every five minutes. The speed that makes it useful skips the canaries code goes through.
3. **A consumer that trusted it crashes.** A null pointer, a hard limit hit with a panic, a field count off by one, two control-plane versions disagreeing. The consumer is in the data plane, so the crash is customer-visible everywhere at once.
4. **Recovery is slower than the failure.** Restarting tasks stampede a database (Google), a backlog collapses a workflow (AWS), a flapping file keeps re-breaking a fleet (Cloudflare).

The remediation lists converge just as clearly, and they are the design rules a provider should adopt before its own incident:

- **Stage configuration like code.** Cell by cell, zone by zone, region by region, with bake time and automatic halt on error rates. CrowdStrike's own list (template type tests, staged deployment rings, customer control over content rollout) is the same rule for an agent vendor.
- **Validate generated data as input.** Bounds checks, field counts, size limits, and a schema the consumer checks before loading.
- **Fail open, or keep the last good version.** A data-plane consumer that rejects a bad file keeps serving with the previous one; a policy check that can't evaluate lets traffic through rather than blocking every API call (Google's fail-open remediation).
- **Flags default off, kill switches everywhere.** New code paths ship disabled; every global configuration has a switch to stop propagation and roll back, tested before it is needed.
- **Back off with jitter on recovery.** Every client and task restarting at once is a second outage ([Exponential Backoff With Jitter](/docs/architecture/retries-and-timeouts#exponential-backoff-with-jitter)).
- **Limit automatic capacity removal.** AWS's velocity control on load balancer failover is the general rule: automation that takes capacity out of service must have a ceiling.

> [!IMPORTANT]
> The riskiest deploy path at most providers is not the code pipeline but the configuration, policy and rule channel next to it. If a change can reach every region in seconds, it needs the canaries, the bake time and the kill switch that code gets.

## Control-Plane Dependencies

The second pattern is the dependency nobody drew. Each case below had a component whose failure was not expected to matter:

- **A control plane in one building.** Cloudflare's November 2023 power loss at one facility took down its control plane and analytics for about 40 hours because services such as Kafka and ClickHouse existed only there, while the data plane kept serving. Its response was a program to move the control plane off single facilities and to require high availability before a product reaches general availability.
- **Another cloud underneath.** Cloudflare's Workers KV failed in June 2025 because its storage was backed partly by a third-party cloud provider that was having its own outage; Access, WARP, Turnstile and other products that read KV failed with it.
- **A database under the host manager.** AWS's EC2 host management depended on DynamoDB, so a DNS race in DynamoDB became an EC2 launch outage that outlasted DynamoDB's own.
- **The status page and the monitoring.** Google's status infrastructure was affected by the outage it was reporting, and some customers' monitoring, hosted on Google Cloud, failed with it.

The defense is the one [Provider Architecture](/books/hosting-and-cloud/provider-architecture#control-plane-and-data-plane) names: draw the graph, make the data plane statically stable against the control plane, keep the recovery path free of the systems it recovers, and host status and monitoring somewhere the outage can't reach.

## Incidents at Communications Platforms

A CPaaS fails in ways the clouds don't, because money and carriers are in the path:

- **Twilio billing, July 18, 2013.** A brief network problem made every billing Redis replica resync at once, overloading the master; a restart loaded the wrong configuration, attempted recovery from an append-only file, dropped all balances and came up as a replica of itself, read-only. Auto-recharge then charged customers' cards repeatedly without recording the new balances, affecting 1.4% of customers; voice and messaging kept working. Twilio refunded the charges, gave a credit of 10% of the last 30 days, and named the fixes: promote replicas instead of restarting the master, refuse to charge when a balance can't be written, and validate balances in real time against a double-entry ledger.
- **Bandwidth, late September 2021.** DDoS attacks on Bandwidth "and our industry" cost an estimated $0.7 million of third-quarter revenue from lost volume and credits and an estimated $9 million to $12 million for the year; Bandwidth helped customers divert traffic.
- **Carrier-specific delivery.** Twilio's status page posted "SMS and MMS Delivery Delays from Twilio to Verizon United States" at 10:13 PDT on May 27, 2026 and resolved it at 22:54 PDT on May 28, about 37 hours, across long code, short code, toll-free and Zipwhip traffic. The failure was downstream of the platform, and the status component that mattered was the carrier, not the API.
- **Social engineering.** In August 2022 attackers phished Twilio employees with fake login pages and used internal tools to reach 209 customers' data out of more than 270,000, and 93 Authy users; Twilio moved all staff to FIDO2 keys.

Two lessons are specific to this industry. A billing system must fail closed for charging and open for service: when the ledger can't be written, stop taking money, keep carrying traffic. And a communications status page needs components per carrier and per number type, because that is how the failures arrive ([Sending a Text](/books/hosting-and-cloud/sending-a-text); [The CPaaS Business](/books/hosting-and-cloud/cpaas-business)).

## Vendor Risk

Every provider depends on vendors whose failures become its own: the cloud under a PaaS, the carrier under a CPaaS, the CDN in front of a site, the security agent on every host. The public cases set out the forms vendor risk takes:

- **A privileged agent's content push.** CrowdStrike's July 2024 update supplied 21 input fields to a sensor template that expected 20; the out-of-bounds read crashed Windows hosts worldwide. Microsoft estimated 8.5 million devices, "less than one percent of all Windows machines," and about 99% of sensors were back by July 29. The remediation list includes customer control over content rollout, which is the clause a provider should ask any agent vendor for.
- **A provider's own provisioning tool.** In the UniSuper case Google said an internal tool left a parameter blank in early 2023, which defaulted to a fixed one-year term, so the customer's private cloud was deleted at the end of it with no notification because the deletion wasn't customer-initiated. Recovery took several days and depended on backups in Cloud Storage and third-party backup software; Google deprecated the tool and audited every such deployment.
- **A building.** After the 2021 Strasbourg fire, a French commercial court awarded Bati Courtage about €101,000 in January 2023 because its backups, contractually described as isolated, were in the same building; another customer was awarded about €154,000 in March 2023 (the storage lessons are Storage: Block, File & Object's).
- **A dependency of the dependency.** Cloudflare's KV outage came from the third-party cloud under it, which is the case for asking every vendor which providers it depends on and what happens when they fail.

My rule for vendor risk: for each vendor in the data path, record what fails when it fails, whether the provider can switch away within the incident, and whether the vendor's status feeds the provider's own status page.

## Status Pages

A status page is a public model of the service, and its value depends on the model matching how failures happen. Atlassian's Statuspage documentation describes the model most hosted tools share:

- **Components** "represent each of the separate infrastructure or functional part of your service," grouped into component groups; Statuspage caps a page at 1,100 components.
- **Five component statuses:** Operational, Under Maintenance, Degraded Performance ("works but is slow or minorly affected"), Partial Outage ("broken for some customers but working for others") and Major Outage ("completely unavailable").
- **A computed top-level status.** With two or more components, any Major Outage makes the page read Partial System Outage, any Partial Outage reads Minor Service Outage, and only all components in Major Outage reads Major System Outage. The rule exists so one broken component doesn't declare the whole service down, and it means a provider's banner understates a single critical failure unless the component model is right.
- **Incidents** move through Investigating, Identified, Monitoring and Resolved, with an impact (None, Minor, Major, Critical, Maintenance) computed from the affected components and overridable by hand. Scheduled maintenance has its own lifecycle.
- **Third-party components** mirror a vendor's status page automatically, degrading the provider's component when the vendor's does, with a manual override when the vendor is slow or the incident doesn't affect the provider.

What a provider's component model needs, from the incidents above:

- **Product by region,** because nearly every cloud outage in this chapter was regional and a single "Compute" component is either always green or always red. AWS describes its public events the same way: "a service issue for Amazon Simple Storage Service (Amazon S3) in the US East (Ohio) Region."
- **Control plane separate from data plane.** "Existing instances unaffected; launches failing" is the most common shape of a cloud incident, and a component model that can't say it forces a choice between alarming everyone and telling no one.
- **The underlay and key vendors as components,** for a provider that resells (the region's cloud, the carriers, the CDN), so customers see where the failure is.
- **Per-account status** where the provider can compute it: which of this customer's resources are affected, from `resources` and the incident's scope. AWS's account-specific Health events do this, naming the "affected entities" so a customer can find the IDs of its affected instances.

The communication rules are the playbook's: post the first update fast, give every update a next-update time and keep it, write for the reader's impact rather than the hypothesis ([Communicate on a Clock](/docs/operations/incident-response#communicate-on-a-clock)), and link support tickets to the open incident so they leave the queue together ([Customer Support](/docs/operations/customer-support#classify-route-answer)). The provider-specific rule is where the page lives: hosted off the provider's own infrastructure, with its DNS, certificates and update tooling independent of the systems it reports on, because Google's report shows what happens otherwise.

## Post-Mortems as a Product

The public post-mortem serves customers deciding whether to stay, engineers elsewhere learning from it, and the provider's own record. The good ones share a structure: a timeline in UTC or a named time zone to the minute; the internal systems named; the trigger separated from the conditions that made it dangerous; customer impact by product and region; and a numbered list of remediations with owners and, in the best cases, dates. The playbook's [Postmortem](/docs/operations/incident-response#the-postmortem) template is the internal version, and its rule of contributing factors over a single root cause matches what the public write-ups show: no 2025 outage had one cause.

Three practices separate providers that publish well:

- **Publish criteria, not discretion.** AWS states when a post-event summary is owed (broad and significant impact, a significant share of control-plane calls, total power or network failure) and keeps them for five years. A provider that decides case by case invites the question of what it chose not to publish.
- **Keep both versions.** A preliminary review is a hypothesis under time pressure; the final review is the record. Azure's Front Door reviews show the account changing materially, and a reader who saw only the first would have learned the wrong lesson.
- **Report what was done.** The remediation list is a promise. Cloudflare's "Code Orange" after November 2023 and Google's fail-open change after June 2025 are the kind of commitments customers check in the next incident.

## The Alternatives

| Approach | Model | Strengths | Failure modes | Cost and ownership | Who uses it |
| --- | --- | --- | --- | --- | --- |
| **Hosted status page product** | A SaaS page with components, incidents, subscribers and third-party mirroring | Independent of the provider's infrastructure; subscribers, email, SMS and webhooks built in | Statuses set by hand lag reality; the component model is whatever was set up years ago | A subscription | Most PaaS, SaaS, smaller clouds and CPaaS |
| **Own status system on separate infrastructure** | Built in house, hosted on another provider, fed from monitoring and incident tooling | Per-region, per-product, per-account detail; automatic updates from health checks | Must itself be kept independent; easy to host it on the infrastructure it reports | Engineering time | Hyperscalers and large edge networks |
| **Static page plus social accounts** | A minimal page updated by hand | Cheap, survives almost anything | No subscribers, no history, no components | Nearly free | Small hosts |
| **Per-account health events** | Events about this customer's resources, through the console, API and email | Tells each customer what is theirs; no public alarm for a local problem | Requires the resource-to-incident mapping to be correct | Engineering time | AWS Health's account-specific events |

## My Default

My default is two layers: a public status page on a hosted product or on infrastructure that shares nothing with the platform, with components by product, region and plane (control and data), plus vendor components mirrored automatically; and per-account incident notices generated from the incident's scope against `resources`, so each customer learns which of their things are affected. I'd publish post-mortem criteria in advance, publish preliminary and final reviews under one incident ID, and keep both.

On the engineering side my default is to treat the configuration channel as the most dangerous deploy path and give it staged rollout, validation and a kill switch before the first incident proves it. What would change this: a provider small enough that a hand-run page and an honest email are all it can sustain should do that well, rather than run an automated page that shows green during outages, because a status page that is wrong costs more trust than one that is simple.

## How to Build It

The chapter adds the status model and the incident record, joined to resources and accounts so impact and credits can be computed. SLA claims and the credits they produce are SLAs & Service Credits' `sla_claims` and the core `credit_grants`; operations the control plane ran during the incident are [Provider Architecture](/books/hosting-and-cloud/provider-architecture#how-to-build-it)'s `control_plane_operations`.

```sql
CREATE TABLE status_components (         -- what the public page shows, and what it maps to
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  group_name     TEXT NOT NULL,          -- 'Compute', 'Messaging', 'Carriers'
  name           TEXT NOT NULL,          -- 'Compute: launches (eu-central-1)'
  product_id     UUID REFERENCES products (id),
  region_id      TEXT REFERENCES regions (id),       -- null: global
  plane          TEXT NOT NULL CHECK (plane IN ('control', 'data', 'both')),
  vendor         TEXT,                   -- set for a mirrored vendor or underlay component
  vendor_source  TEXT,                   -- the vendor status feed it follows
  display_order  INT NOT NULL,
  valid_during   TSTZRANGE NOT NULL,     -- components retire with regions and products
  UNIQUE (group_name, name)
);

CREATE TABLE incidents (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  public_ref     TEXT UNIQUE,            -- the ID customers see, e.g. a tracking ID
  kind           TEXT NOT NULL CHECK (kind IN ('incident', 'maintenance', 'security')),
  severity       TEXT NOT NULL CHECK (severity IN ('sev1', 'sev2', 'sev3')),  -- internal
  impact         TEXT NOT NULL CHECK (impact IN ('none', 'minor', 'major', 'critical',
                   'maintenance')),       -- public, computed then overridable
  status         TEXT NOT NULL CHECK (status IN ('investigating', 'identified', 'monitoring',
                   'resolved', 'scheduled', 'in_progress', 'completed')),
  title          TEXT NOT NULL,
  started_at     TIMESTAMPTZ NOT NULL,   -- when impact began, revised as facts emerge
  detected_at    TIMESTAMPTZ,
  mitigated_at   TIMESTAMPTZ,
  resolved_at    TIMESTAMPTZ,
  trigger_kind   TEXT CHECK (trigger_kind IN ('code_deploy', 'config_push', 'capacity',
                   'dependency', 'vendor', 'facility', 'attack', 'operator_action',
                   'unknown')),
  CHECK ((status IN ('resolved', 'completed')) = (resolved_at IS NOT NULL)),
  CHECK (mitigated_at IS NULL OR mitigated_at >= started_at)
);

CREATE TABLE incident_components (       -- which components, at what status, when
  incident_id    UUID NOT NULL REFERENCES incidents (id),
  component_id   UUID NOT NULL REFERENCES status_components (id),
  status         TEXT NOT NULL CHECK (status IN ('operational', 'under_maintenance',
                   'degraded_performance', 'partial_outage', 'major_outage')),
  during         TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (incident_id WITH =, component_id WITH =, during WITH &&)
);

CREATE TABLE incident_updates (          -- every public update, append-only
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  incident_id    UUID NOT NULL REFERENCES incidents (id),
  status         TEXT NOT NULL,          -- the incident status this update set
  body           TEXT NOT NULL,
  next_update_by TIMESTAMPTZ,            -- the clock the playbook asks for
  posted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  posted_by      TEXT NOT NULL
);

CREATE TABLE incident_reviews (          -- preliminary and final post-mortems, both kept
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  incident_id    UUID NOT NULL REFERENCES incidents (id),
  stage          TEXT NOT NULL CHECK (stage IN ('preliminary', 'final', 'amended')),
  public_url     TEXT,                   -- null for an internal-only review
  published_at   TIMESTAMPTZ,
  supersedes_id  UUID REFERENCES incident_reviews (id),
  remediations   JSONB NOT NULL DEFAULT '[]'  -- [{item, owner, due, done_at}]
);

CREATE TABLE incident_scope (            -- what was affected, for notices and credits
  incident_id    UUID NOT NULL REFERENCES incidents (id),
  resource_id    UUID NOT NULL REFERENCES resources (id),
  account_id     UUID NOT NULL REFERENCES accounts (id),
  effect         TEXT NOT NULL CHECK (effect IN ('unavailable', 'degraded',
                   'control_plane_only', 'data_at_risk')),
  during         TSTZRANGE NOT NULL,
  PRIMARY KEY (incident_id, resource_id)
);
```

```sql
-- Which accounts to notify, and the affected time per resource for SLA math.
SELECT s.account_id,
       COUNT(*)                                   AS affected_resources,
       SUM(upper(s.during) - lower(s.during))     AS affected_time
FROM incident_scope s
WHERE s.incident_id = $1
  AND s.effect <> 'control_plane_only'
GROUP BY s.account_id;

-- Build the scope from the components: every live resource of the product in the
-- region during the component's outage window.
INSERT INTO incident_scope (incident_id, resource_id, account_id, effect, during)
SELECT ic.incident_id, r.id, r.account_id,
       CASE WHEN c.plane = 'control' THEN 'control_plane_only'
            WHEN ic.status = 'major_outage' THEN 'unavailable'
            ELSE 'degraded' END,
       ic.during * r.exists_during
FROM incident_components ic
JOIN status_components c ON c.id = ic.component_id
JOIN skus k ON k.product_id = c.product_id
JOIN rated_usage u ON u.sku_id = k.id AND u.rated_during && ic.during
JOIN resources r ON r.id = u.resource_id
                 AND (c.region_id IS NULL OR r.region_id = c.region_id)
                 AND r.exists_during && ic.during
WHERE ic.incident_id = $1
  AND ic.status IN ('degraded_performance', 'partial_outage', 'major_outage')
ON CONFLICT (incident_id, resource_id) DO NOTHING;
```

Notes on the sketch:

- **Public impact and internal severity are separate columns.** Severity drives paging and roles ([Severity Levels](/docs/operations/incident-response#severity-levels)); impact is what the page shows. They disagree often, and both are facts.
- **Component status is a range, not a field.** `incident_components` records each status with its window, so the page's history, the SLA calculation and the post-mortem timeline come from the same rows.
- **Updates are append-only with a clock.** `next_update_by` makes a missed update detectable; an alert on it is cheap and keeps the promise the playbook asks for.
- **Reviews supersede, never overwrite.** A final review points at the preliminary one it replaces, so both stay readable.
- **Scope is per resource.** Notices, credits and support linkage all read `incident_scope`; the scope query above is a starting point that engineers correct, and a correction is a new row set, not an edit.
- **`trigger_kind` makes the pattern countable.** Counting incidents by trigger over a year shows whether configuration pushes or dependencies are the provider's real risk, which is the question this chapter keeps asking.
- **Events:** `incident.opened`, `incident.updated`, `incident.resolved`, `incident.review_published` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to the status page, subscriber notifications, support tooling and the SLA claim process.

## Auditing

- **Every public update, as posted,** with its time and author, because customers, regulators and lawyers compare what the provider said with what it knew.
- **Component history,** so a claim that a service was down at a given minute can be checked against what the page showed.
- **Scope and notices,** which accounts were told and when, and which resources were counted for credits.
- **Reviews and remediations,** with every version and the status of each remediation item, so the next incident's review can say whether the last one's promises were kept.
- **Configuration pushes during the window,** joined from the deployment and configuration logs, because the trigger is usually there.

## What This Means for the System You Build

- **Stage configuration like code,** validate generated data as input, and keep a tested kill switch on every global channel.
- **Fail open or keep the last good version** in the data plane when the control plane sends something bad.
- **Draw the dependency graph,** including the vendors and other clouds under your services, and check it after every incident.
- **Back off with jitter on recovery** and cap automation that removes capacity.
- **Model the status page as product by region by plane,** with vendors mirrored, and host it where your outage can't reach.
- **Notify per account** from the incident's resource scope, and use the same scope for credits.
- **Publish post-mortem criteria,** keep preliminary and final reviews, and track remediations to done.
- **Fail closed for charging and open for service** in billing during incidents.

## References

**Cloud post-mortems**

- [AWS: Summary of the Amazon DynamoDB service disruption in the Northern Virginia (US-EAST-1) Region](https://aws.amazon.com/message/101925/), October 19 to 20, 2025: the Planner and Enactor race, DWFM congestive collapse, NLB health checks, remediations
- [AWS: Summary of the Amazon EC2 and Amazon RDS service disruption in the US East Region](https://aws.amazon.com/message/65648/), April 2011
- [AWS Health: Concepts](https://docs.aws.amazon.com/health/latest/ug/aws-health-concepts-and-terms.html), public and account-specific events, affected entities
- [AWS: Post-Event Summaries](https://aws.amazon.com/premiumsupport/technology/pes/), publication criteria, five-year availability, the list of summaries
- [Google Cloud: Service Health incident, June 12, 2025](https://status.cloud.google.com/incidents/ow5i3PPK96RduMcb1SsW), Service Control, global replication, the kill switch, the us-central1 herd effect, the late first report and the remediations
- [Azure status history: Azure Front Door, tracking ID YKYN-BWZ](https://azure.status.microsoft/en-us/status/history/?trackingId=YKYN-BWZ), the final PIR's metadata explanation and timeline
- [Google Cloud blog: Details of Google Cloud GCVE incident](https://cloud.google.com/blog/products/infrastructure/details-of-google-cloud-gcve-incident), the UniSuper deletion and recovery, May 24, 2024

**Edge post-mortems**

- [Cloudflare: Details of the Cloudflare outage on July 2, 2019](https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/), the regex, global deployment and duration
- [Cloudflare: Cloudflare outage, July 2, 2019](https://blog.cloudflare.com/cloudflare-outage/), traffic drop and timeline
- [Fastly: Summary of June 8 outage](https://www.fastly.com/blog/summary-of-june-8-outage), the latent bug, one customer's configuration, recovery times
- [Cloudflare: Post-mortem on the control plane and analytics outage](https://blog.cloudflare.com/post-mortem-on-cloudflare-control-plane-and-analytics-outage/), November 2023, single-facility services and the response
- [Cloudflare: Service outage, June 12, 2025](https://blog.cloudflare.com/cloudflare-service-outage-june-12-2025/), Workers KV and the third-party dependency
- [Cloudflare: 1.1.1.1 incident on July 14, 2025](https://blog.cloudflare.com/cloudflare-1-1-1-1-incident-on-july-14-2025/), the dormant configuration error
- [Cloudflare: 18 November 2025 outage](https://blog.cloudflare.com/18-november-2025-outage/), the feature file, the 200-feature limit and the flapping
- [Cloudflare: 5 December 2025 outage](https://blog.cloudflare.com/5-december-2025-outage/), the global configuration change and the Lua bug

**Vendor risk and CPaaS incidents**

- [CrowdStrike: Channel File 291 root cause analysis, executive summary](https://www.crowdstrike.com/wp-content/uploads/2024/08/Executive-Summary_Root-Cause-Analysis_Channel-File-291.pdf), the 20 versus 21 fields, recovery and remediations
- [Microsoft: Helping our customers through the CrowdStrike outage](https://blogs.microsoft.com/blog/2024/07/20/helping-our-customers-through-the-crowdstrike-outage/), 8.5 million Windows devices
- [Blocks & Files: OVH must pay damages for lost backup data](https://blocksandfiles.com/2023/03/23/ovh-cloud-must-pay-damages-for-lost-backup-data/), the Strasbourg fire and the second judgment
- [Le Monde Informatique: Incendie SBG2, OVH condamné à verser plus de 100 000 euros](https://www.lemondeinformatique.fr/actualites/lire-incendie-sgb2-strasbourg-ovh-condamne-a-verser-plus-de-100-000-eteuro-89434.html), the Bati Courtage judgment and award
- [Twilio: Billing incident post-mortem](https://www.twilio.com/en-us/blog/billing-incident-post-mortem-breakdown-analysis-and-root-cause-html), July 2013, 1.4% of customers, refunds and fixes
- [Twilio: August 2022 social engineering attack](https://www.twilio.com/en-us/blog/august-2022-social-engineering-attack), affected customers and Authy users, FIDO2
- [Bandwidth: Preliminary third quarter 2021 revenue and DDoS impact](https://www.bandwidth.com/newsroom/bandwidth-announces-preliminary-third-quarter-2021-revenue-results-exceeding-guidance-and-estimated-full-year-revenue-impact-of-ddos-attack/), the attacks and their revenue effect
- [Twilio status: SMS and MMS delivery delays to Verizon](https://status.twilio.com/incidents/nzv6xbhnkzs2), May 27 to 28, 2026

**Status pages**

- [Atlassian: What is a component?](https://support.atlassian.com/statuspage/docs/what-is-a-component), the five component statuses and the 1,100-component limit
- [Atlassian: Top-level status and incident impact calculations](https://support.atlassian.com/statuspage/docs/top-level-status-and-incident-impact-calculations), page status and impact rules
- [Atlassian: Create an incident](https://support.atlassian.com/statuspage/docs/create-an-incident/), incident statuses and notifications
- [Atlassian: Add a third-party component](https://support.atlassian.com/statuspage/docs/add-a-third-party-component/), mirrored vendor status and overrides
