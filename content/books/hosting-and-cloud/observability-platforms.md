+++
title = "Observability Platforms"
description = "Datadog, New Relic, Grafana, Honeycomb, Dynatrace and cloud monitoring: OpenTelemetry, pricing by host, gigabyte and cardinality, and bill shock."
category = "Hosting & Cloud Industry"
order = 2137
part = "Managed Services"
tags = ["observability", "monitoring", "opentelemetry", "pricing", "cardinality"]
+++

An observability platform sells the ability to see what software is doing: metrics, logs, traces and profiles collected from the customer's systems, stored, indexed and queried. It is a managed service with an unusual cost structure, because the customer's bill grows with the customer's own success and verbosity. More hosts, more requests, more tags on a metric, a debug log left on: each becomes more data the platform ingests, stores and indexes, and the platform bills for all of it. It is one of the few products in this volume where a single tag added by an engineer on a Friday can change the monthly invoice by an order of magnitude.

The market has three layers. Independent platforms sell the whole stack as a service (Datadog, New Relic, Dynatrace, Honeycomb, Grafana Cloud, Elastic, Splunk inside Cisco, Chronosphere inside Palo Alto Networks). Each cloud bundles its own monitoring into its bill (CloudWatch, Azure Monitor, Google Cloud Observability). And open standards and open-source engines (Prometheus, OpenTelemetry, Grafana's Loki, Tempo and Mimir) set the data formats underneath and give every customer a credible threat to run it themselves. This chapter covers how the platforms got here, how they work, how each prices, OpenTelemetry, the cardinality problem, the public bill-shock cases, sampling and pipelines as cost control, consolidation, and extends [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) with ingest, host and cardinality meters.

The engineering of instrumenting a system is the playbook's: the [Observability](/docs/observability/overview) section for request IDs, [OpenTelemetry instrumentation](/docs/observability/opentelemetry), [the Collector](/docs/observability/collector), traces, logs and metrics, [SLOs & Error Budgets](/docs/operations/slos) for alerting on what users feel, [On-Call](/docs/operations/on-call) and [Incident Response](/docs/operations/incident-response) for what happens when an alert fires, and [Cost & FinOps](/docs/operations/cost-and-finops) for budgets and anomaly alerts. This chapter is the vendor side: what is sold, and how it is metered.

## How the Providers Do It

| Platform | Ownership, as of October 2026 | Main pricing units | Notes |
| --- | --- | --- | --- |
| **Datadog** | Public (Nasdaq: DDOG) | Per host per month for infrastructure and APM; per GB ingested and per million indexed log events; custom metrics by count | Fiscal 2025 revenue $3,427.2 million |
| **New Relic** | Private (Francisco Partners and TPG since Nov 2023) | Per GB ingested after 100 GB free; per user | Dropped host pricing in 2020 |
| **Dynatrace** | Public (NYSE: DT) | Annual platform commitment drawn down at a rate card: memory-GiB-hours, GiB of logs, GiB scanned | ARR passed $2 billion in fiscal 2026 |
| **Grafana Cloud** | Private (Grafana Labs) | Active series for metrics; GB processed, written and retained for logs, traces and profiles; active users | Open-source LGTM stack, AGPL since 2021 |
| **Honeycomb** | Private | Events per month; unlimited seats and custom fields | Built for high-cardinality event queries |
| **Elastic Observability** | Public (NYSE: ESTC) | Not detailed here | Elastic Cloud 48% of fiscal 2026 revenue |
| **Splunk** | Cisco since 18 Mar 2024 | Not detailed here | Bought for about $28 billion |
| **Chronosphere** | Palo Alto Networks since 29 Jan 2026 | Not detailed here | Telemetry Pipeline still sold standalone |
| **AWS CloudWatch** | AWS | Per metric-month, per GB of logs, per alarm, per dashboard | Billed on the AWS invoice |
| **Azure Monitor** | Microsoft | Per GB ingested into Log Analytics; commitment tiers; retention | First 5 GB a month free |
| **Google Cloud Observability** | Google | Per GiB of logs, per MiB of metrics, per million Prometheus samples, per million spans | First 50 GiB of logs per project free |

Three patterns run through the table:

- **The pricing unit encodes the architecture.** Per host means an agent on each machine; per GB means an ingest pipeline; per indexed event means a search index; per active series means a time-series database; per event means a columnar event store. Every platform has moved toward splitting the bill by stage (ingest, index, retain, query), so customers pay less for data they keep and rarely read.
- **Every cloud bundles monitoring,** and Datadog's 10-K names the clouds' "native solutions" as competitors while it sells through their marketplaces.
- **Consolidation follows security.** Cisco bought Splunk, Palo Alto Networks bought Chronosphere, and private equity took New Relic private, all between 2023 and 2026.

## How Observability Got Here

| Date | Step | Problem it solved | What it cost |
| --- | --- | --- | --- |
| 2010 | Google's Dapper paper, "Google's production distributed systems tracing infrastructure" | Following one request across many services | Sampling, and instrumentation in every service |
| June 2010 | Datadog incorporated | Monitoring cloud infrastructure as a service, per host | A per-host bill that grows with the fleet |
| 2012 | Prometheus started at SoundCloud | Metrics with labels, pulled over HTTP, queried with PromQL | Each server stores its own data |
| 2016 | Prometheus joins the CNCF, its second project after Kubernetes | | |
| 2016 | Honeycomb founded | Querying raw, high-cardinality events | A new data model for teams used to dashboards |
| Early 2019 | OpenTracing and OpenCensus announce their merger as OpenTelemetry; CNCF sandbox on 17 May 2019 | "There were two of them" | Years of instrumentation migration |
| 30 Jul 2020 | New Relic drops host pricing for per-GB and per-user | Customers penalized for running more, smaller hosts | Bills tied to data volume instead |
| 20 Apr 2021 | Grafana, Loki and Tempo move to AGPLv3 | (Cloud resale of Grafana's projects) | |
| March 2022 | Grafana Mimir completes the LGTM stack | Prometheus-compatible metrics at "over 1 billion active series" | |
| 2022 to 2023 | The optimization years: Datadog reports customers cutting usage | Customers' cloud and observability bills | Slower growth for every vendor |
| 18 Mar 2024 | Cisco completes its Splunk acquisition | | |
| 29 Jan 2026 | Palo Alto Networks completes its Chronosphere acquisition | | |
| 21 May 2026 | OpenTelemetry graduates at the CNCF | A vendor-neutral standard for all signals | |

## How the Platforms Work

Every platform has the same five stages, and the bill attaches to them:

1. **Collection.** An agent on each host (Datadog's agent, the OpenTelemetry Collector, Grafana Alloy), an SDK in each process, or a cloud's own emitters. Collection is where host counts come from, and where sampling and dropping can happen before anything is billed.
2. **Ingest.** The platform's endpoint receives metrics, logs, spans and events, applies the customer's drop and transformation rules, and meters bytes or events. New Relic bills "per GB ingested after drop/transformation rules," which makes the rules a pricing feature.
3. **Storage tiers.** Metrics go to a time-series database keyed by series, logs to a search index or a cheaper archive, traces and events to a columnar store. Each platform sells hot and cold tiers: Datadog's standard indexing against Flex storage, Azure's Analytics against Basic Logs, Grafana's processing, write and retention split, New Relic's Original Data against Data Plus and seven-year Live Archives.
4. **Query.** Dashboards, alerts and ad hoc queries. Some platforms bill queries directly (Dynatrace by GiB scanned, Azure Basic Logs per GB queried); others include them and charge for the index that makes them fast.
5. **Retention.** How long each tier keeps data, usually priced per GB-month or per GB-day past an included window.

The key engineering fact for pricing is that a metric is not one thing. Prometheus defines a time series by "metric name and key-value labels," and its naming guide is direct about the consequence: "every unique combination of key-value label pairs represents a new time series," so "do not use labels to store dimensions with high cardinality ... such as user IDs, email addresses." Each series is a stream the database has to index and store forever. A platform priced per series is priced by cardinality.

## Datadog: The Benchmark Business

Datadog is the largest independent platform and the one whose filings show the business most clearly. Its fiscal 2025 10-K reports revenue of $3,427.2 million, "approximately 32,700 customers," "approximately 4,310 customers with ... ARR of $100,000 or more, representing 90% of our ARR," about 603 customers above $1 million, and trailing dollar-based net retention of "about 120%." About 84% of customers use two or more products, 55% four or more and 18% eight or more. The 10-K names AWS, Azure and Google Cloud as competitors with "native solutions" and lists "fluctuations in monthly subscriptions based on usage" as a revenue risk: a usage business, concentrated in large accounts, selling more products into each.

Its list prices (as of October 2026) show the per-stage model:

- **Infrastructure** per host per month: Pro $15 on an annual plan or $18 on demand, Enterprise $23 or $27. Pro includes 100 custom metrics per host and Enterprise 200, pooled across the account.
- **APM** per host: $31 to $40 alongside Infrastructure, depending on tier.
- **Logs**: ingest at $0.10 per GB; standard indexing at $1.70 per million events a month with 15-day retention (annual), $2.55 on demand; Flex storage at $0.05 per million events stored.
- **Custom metrics** beyond the allotment, at $5 per 100 a month on the list price page.

Datadog's definition of a custom metric is the cardinality rule made into a price: a custom metric is "uniquely identified by a combination of a metric name and tag values (including the host tag)," and "custom metrics are counted hourly and averaged monthly across your entire account." Its documentation's example is one metric reported from two hosts with an endpoint tag and a status tag, which is four custom metrics; as a histogram each combination counts five, and as a distribution with percentiles, ten. **Metrics without Limits** splits billing into tag combinations ingested and tag combinations indexed for query, so customers can keep fine-grained data flowing while paying to query only the tags they use.

## New Relic, Dynatrace and the Consumption Turn

New Relic made the market's biggest pricing change. On 30 Jul 2020 it dropped host-based pricing ("the traditional concept of paying for monitoring per host has not aged well," in Manav Khurana's words) for per-user pricing on its full platform and per-GB pricing on data, with a free tier of 100 GB a month and one full user. Its current billing (as of October 2026) still starts with 100 GB of free ingest a month, then $0.40 per GB on Original Data and $0.60 on Data Plus; Original Data keeps at least eight days, Data Plus up to 90, and Live Archives up to seven years. Francisco Partners and TPG took the company private on 8 Nov 2023 at $87.00 a share, "approximately $6.5 billion" in equity value.

Dynatrace took the commitment route. The **Dynatrace Platform Subscription** is an annual platform-level commitment drawn down at rate-card prices, with overage at the same rates; its 10-K calls it a "minimum annual spend commitment" model. The rate card (as of October 2026) prices full-stack monitoring at $0.01 per memory-GiB-hour (about $58 a month for an 8 GiB host), log ingest and processing at $0.20 per GiB, log retention at $0.0007 per GiB-day and queries at $0.0035 per GiB scanned. Pricing by memory rather than by host means a large host costs more than a small one, the inverse of the per-host model's bias. For fiscal 2026 (year ended 31 Mar 2026) Dynatrace reported total ARR of $2,054 million, up 18%, and revenue of $2,018 million.

## Grafana, Honeycomb and the Open Stacks

**Grafana Labs** sells the managed version of its own open-source stack, which it calls LGTM: Loki for logs (Prometheus's label model applied to logs), Grafana for visualization, Tempo for traces and Mimir for metrics, completed when Mimir arrived in March 2022, with Pyroscope for profiling, Beyla for eBPF auto-instrumentation and Alloy as its OpenTelemetry collector. On 20 Apr 2021 it moved Grafana, Loki and Tempo from Apache 2.0 to AGPLv3, choosing an OSI-approved license over source-available ones ([Open Source & the Clouds](/books/hosting-and-cloud/open-source-and-the-clouds#confluent-grafana-cockroachdb-and-sentry)). Grafana Cloud's pricing (as of October 2026) splits by stage: Free includes 10,000 active series and 50 GB each of logs, traces and profiles with 14-day retention; Pro is a $19 monthly platform fee plus metrics from $6.50 per 1,000 active series, and logs, traces and profiles at $0.05 per GB processed, $0.40 per GB written and $0.10 per GB retained for 30 days, plus $8 per active visualization user.

**Honeycomb**, founded in 2016 by Christine Yen and Charity Majors, "two former Facebook engineers," prices by events, not hosts or seats: Free includes 20 million events and 100 million metric data points a month, and Pro starts at $150 a month for 50 million events, with "unlimited seats" and "unlimited custom fields" (as of October 2026). Pricing by event rather than by series removes the cardinality penalty: a field with a million distinct values costs the same as one with two, which is the product's whole argument.

**Elastic** sells observability on the Elasticsearch engine through Elastic Cloud, which was about 48% of its fiscal 2026 revenue of $1,739.3 million ($640.9 million annual and $196.3 million monthly cloud).

## Cloud-Native Monitoring

Each cloud's own monitoring is billed on its invoice and priced by its own units (as of October 2026):

- **AWS CloudWatch:** custom metrics at $0.30 per metric-month for the first 10,000 and $0.10 up to 250,000; logs at $0.50 per GB ingested in AWS's examples, $0.03 per GB archived; standard alarms at $0.10 per alarm-metric; a free tier of 10 metrics, 5 GB of logs and three dashboards.
- **Azure Monitor:** Analytics Logs at $2.30 per GB ingested after the first 5 GB a month (East US), commitment tiers from 100 to 50,000 GB a day, Basic Logs with 30-day retention and per-GB query charges, Analytics retention free for 31 days and up to 12 years paid, standard metrics and activity logs free.
- **Google Cloud Observability:** logs at $0.50 per GiB with the first 50 GiB per project per month free and 30 days of retention included, $0.01 per GiB-month beyond; monitoring by MiB ingested in tiers from $0.2580; Managed Service for Prometheus at $0.06 per million samples for the first 50 billion; traces at $0.20 per million spans after 2.5 million free. Google has announced alerting charges ($0.35 a month per metric reference plus $0.50 per million points) effective 1 Sep 2027.

The cloud's monitoring is the default because it is already collecting: every managed service emits metrics into it, and it is the only place some data exists. Its weakness is the same as its strength: it sees one cloud.

## OpenTelemetry

OpenTelemetry is the vendor-neutral instrumentation standard: APIs and SDKs for each language, a wire protocol (OTLP), and the Collector, which receives, processes and exports telemetry to any backend. It began as a merger. OpenTracing and OpenCensus announced it in early 2019; it joined the CNCF sandbox on 17 May 2019, and the CNCF's history post put the problem simply: "there were two of them." OpenTelemetry was "the next major version of both," with seed governance from Google, LightStep, Microsoft and Uber. It reached incubation in August 2021 and graduated on 21 May 2026, with more than 12,000 contributors from over 2,800 companies.

Status by signal (the specification's status page, as of October 2026): tracing API, SDK and protocol stable; metrics API and protocol stable, SDK mixed; logs bridge API, SDK and protocol stable; baggage stable; the profiles protocol in development; each language SDK has its own status.

What OpenTelemetry changes for the market is switching cost. When instrumentation is vendor-specific (an agent and SDK per platform), leaving a vendor means re-instrumenting every service. With OpenTelemetry, the code emits OTLP to a Collector, and changing vendors is a Collector configuration change. Once instrumentation is vendor-neutral, the competition moves to storage, query and price, and the Collector becomes the place the customer controls cost.

## Pricing by Host, Gigabyte and Cardinality

The units, and the behavior each one rewards and punishes:

| Unit | Who uses it | Rewards | Punishes |
| --- | --- | --- | --- |
| Per host | Datadog infrastructure and APM | Few, large hosts | Many small hosts, containers on short-lived nodes |
| Per memory-GiB-hour | Dynatrace full-stack | Small hosts | Large hosts |
| Per GB ingested | New Relic, CloudWatch Logs, Azure Monitor, Grafana write, Datadog log ingest | Concise telemetry | Verbose logs, debug left on |
| Per indexed event | Datadog log indexing | Indexing only what is searched | Indexing everything |
| Per active series or custom metric | Datadog custom metrics, Grafana metrics, CloudWatch custom metrics | Few, low-cardinality tags | High-cardinality tags |
| Per event | Honeycomb | High-cardinality fields | Many small events |
| Per GB scanned | Dynatrace queries, Azure Basic Logs | Narrow queries | Broad dashboards over long ranges |
| Per user | New Relic full users, Grafana visualization users | Few people with access | Giving the whole company access |

A worked cardinality example shows why the custom-metric unit is the dangerous one. Take one latency metric reported as a distribution with percentiles from 100 hosts, tagged with 50 endpoints and 5 status classes. If every combination reports in a given hour, that is 100 x 50 x 5 = 25,000 tag combinations, and at ten billable metrics per combination for a distribution with percentiles, 250,000 custom metrics. On Datadog Pro, 100 hosts include 10,000; the other 240,000 at the list price of $5 per 100 would be about $12,000 a month for one metric. Adding a `customer_id` tag with a few thousand values multiplies that again. The real count is lower when not every combination reports every hour (the count is of combinations actually seen, averaged over the month), which is also why it is hard to predict. The same metric in Honeycomb is one event per request whatever its fields; in Grafana Cloud it is billed by active series, with the same cardinality math under a different rate.

## Bill Shock

The public cases, each from the source that reported it:

- **The "$65 million customer."** On Datadog's first-quarter 2023 call (4 May 2023), CFO David Obstler explained a drop in billings: "We had a large upfront bill for a client in Q1 22 that did not recur at the same level or timing in Q1 23," describing the client as "a crypto company which continues to be a customer of ours. But that was an early optimizer"; Olivier Pomel said "we restructured their contract." Datadog didn't name the customer. Pragmatic Engineer reported on 11 May 2023, citing current and former Coinbase engineers, that Coinbase's Datadog bill for 2021 was about $65 million, that in 2022 Coinbase built a team to move to self-hosted Grafana, Prometheus and ClickHouse and double-wrote for months, and that it stayed after Datadog offered a restructured contract. Neither company confirmed the figure.
- **The optimization years.** On Datadog's third-quarter 2022 call (3 Nov 2022), Obstler said "customers continue to be more cost-conscious" and guidance "includes slower than historical growth in usage among existing customers." On the second-quarter 2023 call (8 Aug 2023), Pomel said "customers, particularly some larger spending customers, scrutinize costs and optimize their cloud and observability usage," and that "the cloud optimization across our customer base may start to subside."
- **The largest customer cuts usage.** On the second-quarter 2026 call (6 Aug 2026), Pomel announced "a nine-figure renewal with a leading AI company" that "uses 17 Datadog products," and Obstler said "we have seen a usage reduction, which is incorporated in our Q3 and full year 2026 guidance." Datadog didn't name the customer or size the reduction; its shares closed down about 19% that day.
- **Moving off a vendor or a stack.** Uber's engineering blog (19 Feb 2021) described moving log analytics from ELK to ClickHouse, which "reduced the hardware cost of the platform by more than half," with one ClickHouse node ingesting "300K logs per second, about ten times what a single ES node could achieve." Airbnb's engineering blog describes replacing a pipeline that had used a Veneur fork "to keep costs under control" with OpenTelemetry and vmagent, "reducing the overall cost by an order of magnitude," without naming its vendor.
- **What practitioners report.** Grafana Labs' 2025 observability survey (1,255 responses, fielded September 2024 to January 2025) found 74% rank cost a top priority in choosing tools, 37% say their tooling "costs too much," and 29% say costs are "too difficult to predict and budget for"; the median respondent spent 10% of total compute infrastructure spend on observability, the mean 17%. Its fourth survey (1,363 responses, announced 18 Mar 2026) found 31% naming cost their biggest concern. Grafana sells a competing product, so these are a vendor's survey, with a published method.

Vendor comparisons are marketing and read that way. ClickHouse's 2 Apr 2024 post estimated its own internal logging volume would cost "$26M" a month at Datadog list prices against about $150,000 on its own platform, a comparison at list price with no discounts, by a competitor. Honeycomb's Charity Majors wrote that she has "seen a single custom metric cost $30k per month." Neither is an audited bill.

The pattern across the cases is the same three steps: usage grows silently because the unit grows with the business and with engineers' tags; the bill arrives at a level nobody approved; and the customer either rebuilds on open source or negotiates, and the vendor restructures the contract to keep it. A provider's defense is the same as for any surprise bill: show the cost driver before the invoice, per tag and per service, and let the customer cap it. The customer's side is the playbook's [Budgets and Anomaly Alerts](/docs/operations/cost-and-finops#budgets-and-anomaly-alerts) and the [Cost Data, FinOps & Surprise Bills](/books/hosting-and-cloud/finops-and-surprise-bills) chapter.

## Sampling and Pipelines

The cost lever every vendor and customer reaches for is to send less, and to decide what before it reaches the meter.

- **Head sampling** decides at the start of a trace (for example, by trace-ID ratio). It is cheap and consistent, but it can't keep "every trace with an error," because it decides before the error happens.
- **Tail sampling** decides after seeing most of a trace's spans, so it keeps errors and slow traces; it is stateful, harder to run and often vendor-specific. The OpenTelemetry Collector has both tail-sampling and probabilistic-sampling processors, and high-volume systems combine them ([Head or Tail Sampling](/docs/observability/tracing#head-or-tail-sampling)).
- **Pipelines** drop, aggregate and route telemetry before billing: the Collector, Grafana Alloy, Chronosphere's Telemetry Pipeline (still sold on its own after the Palo Alto Networks deal). Their pitch is cost; the reductions vendors quote for them are marketing until measured on the customer's own data.
- **Ingest versus index.** Datadog's Metrics without Limits and its log indexing, Grafana's processing, write and retention split, and Azure's Basic Logs all let customers ingest everything and pay full price only for what they query.

Prometheus's own documentation draws the line on what metrics are for: it is "not a good fit" where 100% accuracy is needed, "such as per-request billing." Telemetry is sampled and aggregated by design; a provider's billing meters are a separate pipeline with idempotent, append-only events ([Tenancy, money and time](/books/hosting-and-cloud/hosting-and-cloud-business#tenancy-money-and-time)), never a dashboard query.

## Consolidation

- **Cisco and Splunk:** announced 21 Sep 2023 at $157 a share in cash, about $28 billion in equity value, framed as security plus observability; completed 18 Mar 2024.
- **Francisco Partners and TPG and New Relic:** completed 8 Nov 2023; New Relic's stock "ceased trading."
- **Palo Alto Networks and Chronosphere:** announced 19 Nov 2025 for "a total consideration of $3.35 billion, to be paid in cash and replacement equity awards"; completed 29 Jan 2026, with founder Martin Mao joining as SVP and general manager of observability.

Two of three buyers are security companies. Security operations and observability collect the same telemetry from the same hosts, and the buyer's argument in each case was that one pipeline and one store should serve both.

## The Alternatives

| Approach | Model | Strengths | Failure modes | Licensing and ownership | Cost shape |
| --- | --- | --- | --- | --- | --- |
| **Full-stack SaaS** (Datadog, New Relic, Dynatrace) | Agents or OTLP to the vendor's platform | Everything integrated, fast to start, many products | Bills scale with usage and cardinality; hard to predict | Proprietary; New Relic private-equity owned | Per host, GB, event, series, user or commitment |
| **Event-based SaaS** (Honeycomb) | Wide events, columnar queries | No cardinality penalty; fast ad hoc questions | Less pre-built infrastructure monitoring | Proprietary | Per event |
| **Managed open-source stack** (Grafana Cloud, Elastic Cloud) | The vendor runs the open-source engines | Data formats are open; can self-host later | Series and GB still billed | AGPL (Grafana), AGPL/SSPL/ELv2 (Elastic) | Active series, GB processed, written and retained |
| **Cloud-native monitoring** (CloudWatch, Azure Monitor, Google Cloud Observability) | Built into the cloud | Already collecting; one bill | One cloud only; logs can be expensive per GB | Proprietary | Per metric, GB, alarm, sample |
| **Self-hosted open source** (Prometheus, Loki, Tempo, Mimir, ClickHouse) | Run the stack yourself | No vendor bill; full control | Staff, storage and on-call for the monitoring system itself | Apache 2.0 (Prometheus), AGPL (Grafana projects) | Infrastructure and people |
| **OpenTelemetry Collector in front of any of these** | Vendor-neutral collection and pipeline | Switch vendors by configuration; control cost before ingest | Another system to run; sampling decisions to own | Apache 2.0, CNCF | Collector infrastructure |

## My Default

My default is OpenTelemetry for all instrumentation, a Collector I run in front of whatever backend I choose, and the cloud's native monitoring for the managed services that only report there. For the backend, I'd start with a managed platform (Grafana Cloud if I want open formats and the option to self-host later, Honeycomb if most of my questions are about individual requests, Datadog if I want the most integrated product and accept its pricing), with budgets and per-service cost reports from the first week. Cardinality is a design decision: I'd review every new metric tag the way I'd review a new database index, and keep user and request identifiers in traces and events, never in metric tags.

The tradeoff that would change this is scale and staff. Past a certain volume, the public cases show the same move (Coinbase's reported migration work, Uber's ClickHouse, Airbnb's pipeline): run the storage yourself on open-source engines, because at that size a team running ClickHouse or Mimir costs less than the bill. Below that size, running the monitoring system yourself is one more system to page on.

## How to Build It

This chapter adds the meters an observability product bills, an hourly series count that turns cardinality into a billable number, ingest rules that apply before the meter, and per-tier retention, on top of [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Telemetry is usage, not a resource: the chapter adds no resource kind or side table, bills against the core's `projects`, and points meters at the monitored resource where there is one. Everything here hangs off `usage_events` and `skus`.

| Meter | Unit | Counted as |
| --- | --- | --- |
| `obs.host_hours` | hour | Distinct hosts reporting in each hour, per product (infrastructure, APM) |
| `obs.memory_gib_hours` | hour | Monitored memory per hour, for memory-priced plans |
| `obs.ingested_bytes` | gb | Bytes received after ingest rules, per signal (logs, traces, profiles) |
| `obs.indexed_events` | request | Log events written to a searchable index, per retention tier |
| `obs.series_hours` | hour | Distinct series (metric name plus tag combination) seen in each hour |
| `obs.events` | request | Events or spans stored, for event-priced plans |
| `obs.scanned_bytes` | gb | Bytes read by queries, where queries are billed |
| `obs.retained_gb_days` | gb_month | Data held past the included window, per tier |
| `obs.active_users` | request | Distinct users who used the product in the month |

```sql
CREATE TABLE ingest_rules (              -- drop, sample or reroute telemetry before it is billed
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id    UUID NOT NULL REFERENCES accounts (id),
  project_id    UUID REFERENCES projects (id),
  signal        TEXT NOT NULL CHECK (signal IN ('metric', 'log', 'trace', 'event', 'profile')),
  match         JSONB NOT NULL,          -- attribute filter, e.g. {"service": "checkout", "level": "debug"}
  action        TEXT NOT NULL CHECK (action IN ('drop', 'sample', 'drop_tags', 'archive_only')),
  sample_rate   NUMERIC CHECK (sample_rate > 0 AND sample_rate <= 1),
  dropped_tags  TEXT[],                  -- for 'drop_tags': cut cardinality at ingest
  valid_during  TSTZRANGE NOT NULL,      -- every bill can be explained by the rules in force
  created_by    TEXT NOT NULL,
  CHECK ((action = 'sample') = (sample_rate IS NOT NULL)),
  CHECK ((action = 'drop_tags') = (dropped_tags IS NOT NULL))
);

CREATE TABLE series_counts (             -- cardinality, measured hourly, per metric name
  account_id    UUID NOT NULL REFERENCES accounts (id),
  project_id    UUID REFERENCES projects (id),
  metric_name   TEXT NOT NULL,
  hour          TIMESTAMPTZ NOT NULL,    -- truncated to the hour, UTC
  series        BIGINT NOT NULL,         -- distinct tag combinations seen in the hour
  weight        SMALLINT NOT NULL DEFAULT 1,  -- billable metrics per series: 1, 5, 10 by type
  indexed       BOOLEAN NOT NULL,        -- queryable, or ingested only
  top_tags      JSONB NOT NULL,          -- each tag key with its distinct count, for the bill's "why"
  PRIMARY KEY (account_id, metric_name, hour, indexed)
);

CREATE TABLE retention_policies (        -- how long each tier keeps each signal
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id    UUID NOT NULL REFERENCES accounts (id),
  signal        TEXT NOT NULL,
  tier          TEXT NOT NULL CHECK (tier IN ('hot', 'indexed', 'flex', 'archive')),
  retention     INTERVAL NOT NULL,
  included      INTERVAL NOT NULL,       -- the part the price includes; beyond is metered
  valid_during  TSTZRANGE NOT NULL
);
```

The monthly custom-metric charge is a count averaged over hours, minus an allotment pooled across hosts, the rule Datadog documents. The rating job derives it from the two hourly tables, and the `top_tags` column lets the invoice say which tag drove it:

```sql
-- Billable custom metrics for one account and month: hourly weighted series, averaged,
-- less the pooled allotment (included per host times the average hosts reporting).
WITH hourly AS (
  SELECT hour, SUM(series * weight) AS metrics
  FROM series_counts
  WHERE account_id = $1 AND indexed
    AND hour >= $2 AND hour < $3          -- the billing month, closed-open
  GROUP BY hour
), hosts AS (
  SELECT AVG(quantity) AS avg_hosts
  FROM usage_events
  WHERE account_id = $1 AND meter = 'obs.host_hours'
    AND lower(occurred_during) >= $2 AND lower(occurred_during) < $3
)
SELECT AVG(h.metrics)                                   AS avg_custom_metrics,
       hosts.avg_hosts * $4                             AS allotment,  -- e.g. 100 per host
       GREATEST(0, AVG(h.metrics) - hosts.avg_hosts * $4) AS billable
FROM hourly h CROSS JOIN hosts
GROUP BY hosts.avg_hosts;
```

Notes on the sketch:

- **Cardinality is measured, stored and explained.** `series_counts` is written once an hour per metric name, with the distinct count per tag key, so a customer asking "why did my bill triple" gets "the `customer_id` tag on `checkout.latency` went from 1 to 4,000 values on the 12th," not a total.
- **Ingest rules are effective-dated.** A bill is computed after the rules in force at the time, so the rules carry a range and a creator, and a disputed month can be rerated with the rules as they were.
- **Ingest and index are separate meters.** Customers can keep sending data they don't query and pay the lower rate, which is the pricing model every platform has converged on.
- **Billing never reads telemetry storage.** Meters come from the ingest path as `usage_events` with idempotency keys; the time-series database is sampled and approximate by design, as Prometheus says of itself.
- **Warn before the invoice.** A daily job compares month-to-date series and bytes against the customer's budget from the [Cost Data, FinOps & Surprise Bills](/books/hosting-and-cloud/finops-and-surprise-bills#budgets-and-alerts) chapter and raises `obs.cardinality_spike` and `obs.ingest_spike` events through the [outbox](/docs/architecture/events#the-transactional-outbox) to notifications, with the top tags attached.

## Auditing

- **Every rule that changed what was billed.** Ingest, sampling and drop rules with their ranges and creators, because a bill is the product of usage and rules.
- **Cardinality history.** Hourly series counts per metric with their tag breakdown, kept for as long as an invoice can be disputed.
- **Retention changes.** Who lengthened or shortened retention, and when, since retention changes cost and, for logs that hold personal data, compliance ([Data Retention & Deletion](/docs/architecture/data-retention)).
- **Access to telemetry.** Logs and traces carry customer and end-user data; who queried what is an audit question in its own right ([Audit Trails](/docs/architecture/audit-trails)).

## What This Means for the System You Build

- **Price by stage** (ingest, index, retain, query), so customers can keep data cheaply and pay for what they read.
- **Measure cardinality hourly and explain it by tag,** on the invoice and before it.
- **Accept OpenTelemetry natively,** and expect customers to put a Collector between you and their code.
- **Make ingest rules and retention effective-dated data,** so any bill can be recomputed.
- **Warn on spikes daily** against the customer's budget, with the driver attached.
- **Keep billing meters out of the telemetry store:** observability data is sampled; billing data is exact.
- **Expect large customers to optimize or leave,** and offer commitments and restructured contracts before they rebuild on open source.

## References

**Filings and earnings calls**

- [Datadog: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1561550/000162828026008819/ddog-20251231.htm), revenue, customers, ARR concentration, net retention, product adoption, competitors, usage risk and incorporation
- [Datadog Q1 2023 earnings call transcript](https://transcripts.platformaeronaut.com/transcripts/DDOG-1Q23-transcript), the large upfront bill and the restructured contract
- [Datadog Q3 2022 earnings call transcript (The Motley Fool)](https://www.fool.com/earnings/call-transcripts/2022/11/03/datadog-ddog-q3-2022-earnings-call-transcript/), cost-conscious customers and slower usage growth
- [Datadog Q2 2023 earnings call transcript](https://transcripts.platformaeronaut.com/transcripts/DDOG-2Q23-transcript), larger customers optimizing and signs it may subside
- [Datadog Q2 2026 earnings call transcript](https://transcripts.platformaeronaut.com/transcripts/DDOG-2Q26-transcript), the nine-figure renewal and the usage reduction
- [TIKR: Datadog fell 19% on a Q2 beat](https://www.tikr.com/blog/datadog-fell-19-on-a-q2-beat-is-the-selloff-a-buying-opportunity-or-a-warning), the 6 Aug 2026 share move
- [Dynatrace: Fiscal 2026 fourth-quarter results](https://www.sec.gov/Archives/edgar/data/1773383/000177338326000011/fy26q4-earningsreleaseex99.htm), ARR and revenue
- [Dynatrace: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1773383/000177338326000019/dt-20260331.htm), the minimum annual spend commitment model
- [Elastic: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1707753/000170775326000018/estc-20260430.htm), revenue and Elastic Cloud
- [New Relic: Form 8-K on the take-private](https://www.sec.gov/Archives/edgar/data/1448056/000119312523273042/d469974d8k.htm), the closing date
- [Palo Alto Networks: Chronosphere acquisition announcement](https://www.sec.gov/Archives/edgar/data/1327567/000132756725000032/ex992pressrelease.htm), the $3.35 billion consideration
- [Palo Alto Networks: Chronosphere acquisition completed](https://www.sec.gov/Archives/edgar/data/1327567/000119312526029489/d884183dex991.htm), completion, leadership and the standalone pipeline

**Vendor pricing and documentation**

- [Datadog: Pricing](https://www.datadoghq.com/pricing/), infrastructure, APM, logs and custom metric allotments
- [Datadog: Pricing list](https://www.datadoghq.com/pricing/list/), the custom metric overage price
- [Datadog: Custom metrics billing](https://docs.datadoghq.com/account_management/billing/custom_metrics/), the definition, the hourly count, the worked example and Metrics without Limits
- [New Relic: Data ingest billing](https://docs.newrelic.com/docs/accounts/accounts-billing/new-relic-one-pricing-billing/data-ingest-billing), free ingest, drop rules and retention tiers
- [New Relic: Pricing](https://newrelic.com/pricing), per-GB rates
- [New Relic: Francisco Partners and TPG complete acquisition](https://newrelic.com/press-release/20231108), the price and delisting
- [Dynatrace: Pricing](https://www.dynatrace.com/pricing/), the platform subscription and rate card
- [Grafana Labs: Pricing](https://grafana.com/pricing/), the free tier, active series and per-GB rates
- [Grafana Labs: Open source projects](https://grafana.com/oss/), Loki, Tempo, Mimir, Pyroscope, Beyla and Alloy
- [Honeycomb: Pricing](https://www.honeycomb.io/pricing), events, seats and custom fields
- [AWS: CloudWatch pricing](https://aws.amazon.com/cloudwatch/pricing/), metrics, logs, alarms and the free tier
- [Azure: Monitor pricing](https://azure.microsoft.com/en-us/pricing/details/monitor/), ingest, commitment tiers, Basic Logs and retention
- [Azure Retail Prices API: Log Analytics, East US](https://prices.azure.com/api/retail/prices?$filter=serviceName%20eq%20'Log%20Analytics'%20and%20armRegionName%20eq%20'eastus'), the per-GB rate
- [Google Cloud: Observability pricing](https://cloud.google.com/stackdriver/pricing), logging, monitoring, Prometheus, trace and alerting rates

**Standards and papers**

- [Sigelman et al., Dapper, a Large-Scale Distributed Systems Tracing Infrastructure (2010)](https://research.google/pubs/dapper-a-large-scale-distributed-systems-tracing-infrastructure/), Google's tracing system
- [Prometheus: Overview](https://prometheus.io/docs/introduction/overview/), SoundCloud origin, CNCF, the data model and per-request billing
- [Prometheus: Metric and label naming](https://prometheus.io/docs/practices/naming/), labels as series and high-cardinality warnings
- [CNCF: A brief history of OpenTelemetry](https://www.cncf.io/blog/2019/05/21/a-brief-history-of-opentelemetry-so-far/), the merger and its governance
- [Google Open Source: OpenTelemetry, the merger of OpenCensus and OpenTracing](https://opensource.googleblog.com/2019/05/opentelemetry-merger-of-opencensus-and.html), 21 May 2019
- [CNCF: OpenTelemetry project journey report](https://www.cncf.io/reports/opentelemetry-project-journey-report/), sandbox and incubation dates
- [CNCF: OpenTelemetry graduates](https://www.cncf.io/announcements/2026/05/21/cloud-native-computing-foundation-announces-opentelemetrys-graduation/), 21 May 2026 and contributor figures
- [OpenTelemetry: Specification status](https://opentelemetry.io/docs/specs/status/), status by signal
- [OpenTelemetry: Sampling](https://opentelemetry.io/docs/concepts/sampling/), head and tail sampling

**History, cases and surveys**

- [The Register: New Relic dumps per-host pricing](https://www.theregister.com/2020/07/30/new_relic_payment), the 2020 change
- [Grafana Labs: Relicensing Grafana, Loki and Tempo to AGPLv3](https://grafana.com/blog/2021/04/20/grafana-loki-tempo-relicensing-to-agplv3/), the 2021 license change
- [Grafana Labs: Open source projects in 2022](https://grafana.com/blog/2022/12/28/grafana-labs-open-source-projects-2022), Mimir completing LGTM
- [TechCrunch: Honeycomb lands $50M](https://techcrunch.com/2023/04/06/honeycomb-lands-50m-investment-to-expand-modern-observability-platform/), founders and founding year
- [Cisco: Cisco to acquire Splunk](https://investor.cisco.com/news/news-details/2023/Cisco-to-Acquire-Splunk-to-Help-Make-Organizations-More-Secure-and-Resilient-in-an-AI-Powered-World/default.aspx), the price and rationale
- [Cisco: Cisco completes acquisition of Splunk](https://newsroom.cisco.com/c/r/newsroom/en/us/a/y2024/m03/cisco-completes-acquisition-of-splunk.html), 18 Mar 2024
- [Pragmatic Engineer: Datadog's $65M/year customer mystery](https://blog.pragmaticengineer.com/datadog-65m-year-customer-mystery/), the reported Coinbase case
- [Uber: Fast and reliable schema-agnostic log analytics platform](https://www.uber.com/blog/logging/), ELK to ClickHouse and the hardware cost
- [Airbnb: Building a high-volume metrics pipeline with OpenTelemetry and vmagent](https://airbnb.tech/infrastructure/building-a-high-volume-metrics-pipeline-with-opentelemetry-and-vmagent/), the order-of-magnitude cost reduction
- [Grafana Labs: Observability Survey 2025](https://grafana.com/observability-survey/2025/), cost findings and method
- [Grafana Labs: Fourth annual observability survey](https://grafana.com/press/2026/03/18/grafana-labs-4th-annual-observability-survey-reveals-a-field-at-a-crossroads-ai-economics-complexity-and-the-enduring-power-of-open-source/), the 2026 findings
- [ClickHouse: Building a logging platform and saving millions over Datadog](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog), a vendor's list-price comparison
- [Honeycomb: The cost crisis in observability tooling](https://www.honeycomb.io/blog/cost-crisis-observability-tooling), a vendor's anecdote
