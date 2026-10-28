+++
title = "Managed Queues & Streaming"
description = "SQS to Kafka as a service: managed brokers, buses, logs and realtime pub/sub, what delivery guarantees cover, and pricing by message, byte and broker-hour."
category = "Hosting & Cloud Industry"
order = 2128
part = "Managed Services"
tags = ["queues", "streaming", "kafka", "rabbitmq", "sqs", "pricing"]
+++

A managed queue is the oldest managed service in the cloud. Amazon put SQS into beta in November 2004, before S3 or EC2, because the first thing distributed applications need after somewhere to run is a way to hand work to each other without both being up at once. Twenty years later "messaging" covers four different products that are easy to confuse: queues that hand each message to one consumer and forget it, pub/sub topics and event buses that fan a message out to many subscribers, logs that keep every message for days or forever so consumers can read and reread at their own pace, and realtime channels that push messages to browsers and phones over WebSockets.

Each is sold as a service by several kinds of company: the hyperscalers (SQS, SNS, EventBridge, Kinesis, MSK, Pub/Sub, Service Bus, Event Hubs), the companies behind an open-source engine (Confluent for Kafka, Synadia for NATS, StreamNative for Pulsar, Redpanda), hosts of someone else's engine (CloudAMQP and Amazon MQ for RabbitMQ, Aiven for Kafka), and developer platforms that wrap messaging in HTTP (Cloudflare Queues, Upstash QStash, Ably). This chapter covers the four shapes, the history from SQS to object-storage Kafka, how each family works, what "exactly once" covers in each vendor's own words, the meters with a worked cost, and extends [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) with `queues`, `topics` and message brokers.

The engineering of using messaging lives in the playbook: [Events & Async Messaging](/docs/architecture/events) for the outbox, idempotent consumers and ordering, [Background Jobs](/docs/architecture/background-jobs) for job queues, retries and dead letters, [Streaming](/docs/data/streaming) for logs, consumer groups and stream processing, [Retries & Timeouts](/docs/architecture/retries-and-timeouts) and [Webhooks](/docs/api-design/webhooks). This chapter is the provider side: what is sold, how it is built and how it is billed.

## How the Providers Do It

| Provider | Queue | Pub/sub and bus | Log | Broker protocols | Notes, as of October 2026 |
| --- | --- | --- | --- | --- | --- |
| **AWS** | SQS standard, FIFO, fair queues | SNS, EventBridge | Kinesis Data Streams, MSK (Kafka) | Amazon MQ (ActiveMQ, RabbitMQ) | Bills each 64 KB of payload as one request on SQS, SNS and EventBridge |
| **Google Cloud** | Pub/Sub pull subscriptions | Pub/Sub topics | Pub/Sub with retention up to 31 days | None | Bills bytes, $40 per TiB |
| **Azure** | Service Bus queues | Service Bus topics | Event Hubs, with a Kafka endpoint | AMQP 1.0, JMS on Service Bus | Event Hubs sells capacity units: throughput, processing and capacity units |
| **Confluent (IBM)** | None | None | Confluent Cloud (Kafka), WarpStream (BYOC) | Kafka | Acquired by IBM, closed 17 Mar 2026 |
| **Aiven, Redpanda, StreamNative** | None | None | Kafka (Aiven), Kafka-compatible (Redpanda), Pulsar and Kafka-compatible (StreamNative) | Kafka, Pulsar | BYOC offered by all three |
| **CloudAMQP** | RabbitMQ, LavinMQ | Exchanges | None | AMQP, MQTT, STOMP | Shared plans metered by messages, dedicated by node |
| **Synadia** | NATS JetStream | NATS subjects | JetStream streams | NATS | NATS trademarks moved to the Linux Foundation in 2025 |
| **Cloudflare, Upstash** | Cloudflare Queues, QStash | QStash topics | None | HTTP | At-least-once delivery to HTTP or Workers |
| **Ably, Pusher** | None | Channels to browsers and devices | Message history | WebSockets, SSE | Priced per message and per connection-minute |

Three patterns run through the table:

- **The unit of sale reveals the architecture.** Queues and buses bill per request (AWS) or per byte (Google); logs bill per shard, throughput unit, broker-hour or partition-hour, because a log is provisioned capacity; brokers bill per node; realtime services bill per message and per connected minute.
- **Every engine company sells its own cloud and competes with the hyperscaler's version of its engine.** Confluent against MSK, Synadia's NATS against everyone's queues, CloudAMQP against Amazon MQ, Redpanda against both.
- **Storage is moving to object storage.** Kafka's tiered storage, WarpStream, MSK Express brokers, StreamNative's Ursa and Kafka's accepted Diskless Topics proposal all push the log's data into S3 and its equivalents, because cross-zone replication and disks are the biggest line in a streaming bill.

## Queues, Logs and Buses

The four shapes, by what happens to a message after it is read:

| Shape | A message goes to | After it's processed | Ordering | Examples |
| --- | --- | --- | --- | --- |
| **Queue** | One consumer of many competing | Deleted | None, or per group | SQS, Service Bus queues, RabbitMQ queues, Cloudflare Queues |
| **Pub/sub topic or bus** | Every subscription, each then acting as a queue | Deleted per subscription | Per key where offered | SNS, EventBridge, Pub/Sub, Service Bus topics, NATS subjects |
| **Log** | Any consumer that reads it, at its own offset | Kept until retention expires | Per partition or shard | Kafka, Kinesis, Event Hubs, Pulsar, JetStream |
| **Realtime channel** | Connected clients subscribed to the channel | Kept for a short history | Per channel | Ably, Pusher |

The difference that matters most for a provider is the log's. A queue's storage cost is proportional to the backlog, which is usually near zero; a log's is proportional to throughput times retention, whether anyone reads it or not. That is why a queue can be sold per request with no capacity planning and a log has, until recently, always been sold as provisioned capacity. The playbook's [The Log](/docs/data/streaming#the-log) and [Queues in Postgres, or a Broker](/docs/architecture/background-jobs#queues-in-postgres-or-a-broker) cover choosing between them for an application.

## How Managed Messaging Got Here

| Date | Step | Problem it solved | What it cost |
| --- | --- | --- | --- |
| 3 Nov 2004 | SQS beta, "with little fanfare" | Handing work between components without both being up | 8 KB messages; best-effort everything |
| 11 Jul 2006 | SQS production launch: "10 cents for a 1000 messages, and 20 cents per Gigabyte" | | |
| 7 Apr 2010 | SNS | Fan-out to many subscribers | |
| 2011 | Kafka enters the Apache Incubator (4 Jul 2011) from LinkedIn; graduates 23 Oct 2012 | A durable, replayable log at high throughput | Running ZooKeeper and brokers |
| 2012 | CloudAMQP starts "as hosted RabbitMQ" | Running RabbitMQ clusters | A second vendor |
| 14 Nov 2013 | Amazon Kinesis limited preview | A managed log on AWS | Shards to provision |
| 1 Dec 2014 | Azure Event Hubs Basic and Standard price meters begin | The same on Azure | Throughput units to provision |
| Sept 2016 | Yahoo open-sources Pulsar | Stateless brokers over BookKeeper storage, multi-tenancy | A more complex system |
| 17 Nov 2016 | SQS FIFO, "exactly-once processing" | Ordering and deduplication | 300 requests per second per queue at launch; a higher price |
| 28 Nov 2017 | Amazon MQ (ActiveMQ) | Lift-and-shift of JMS and AMQP applications | Broker-hours |
| 2018 | NATS joins the CNCF | | |
| 7 Nov 2018 | Event Hubs for Kafka GA | Kafka clients without Kafka brokers | A compatibility subset |
| 14 Dec 2018 | Confluent Community License | (Confluent's competition with cloud-hosted Kafka) | Some Confluent components no longer open source |
| 30 May 2019 | Amazon MSK GA | Kafka on AWS | Broker-hours and storage |
| 11 Jul 2019 | EventBridge | Routing AWS and SaaS events by rule | $1 per million events |
| 30 Nov 2021 | Kinesis on-demand | No shards to plan | Per-GB rates above provisioned |
| 28 Apr 2022 | MSK Serverless GA | No brokers to plan | A cluster-hour floor |
| 1 Jun 2024 | RabbitMQ community support policy under Broadcom | | Patches for older releases only for commercial customers |
| 9 Sep 2024 | Confluent acquires WarpStream | Kafka written directly to S3, in the customer's account | |
| 7 Nov 2024 | MSK Express brokers | Faster scaling, storage without provisioning | Per-GB ingest charge |
| 1 May 2025 | CNCF and Synadia settle over NATS | Who owns an open-source project's name | |
| 2 Mar 2026 | Kafka accepts KIP-1150 Diskless Topics | Kafka data in object storage, no broker replication | Implementation still in progress |
| 17 Mar 2026 | IBM completes its Confluent acquisition | | |

## SQS

AWS's own fifteen-year retrospective lists the steps: a late-2004 beta, the 2006 production launch priced per message and per byte, 8 KB messages, then visibility-timeout control (2007), a free tier and configurable retention (2010), batching and delay queues (2011), long polling (2012), 256 KB payloads and a 50% price cut (2013), dead-letter queues (2014), the Extended Client Library for payloads up to 2 GB through S3 (2015), FIFO (2016), server-side encryption (2017), PrivateLink and Lambda triggers (2018), and tiered pricing (2021). On Prime Day 2021 SQS peaked at 47.7 million messages per second.

How it works:

- **Standard queues** deliver "at least once": "more than one copy of a message might be delivered," ordering is best effort, and throughput is "nearly unlimited." A message is stored in multiple zones before the send is acknowledged; AWS describes three copies across storage nodes and zones.
- **The visibility timeout** is the lease: a received message is hidden for 30 seconds by default (up to 12 hours) while the consumer works; if the consumer doesn't delete it in time, it reappears. That is where duplicates come from, and why consumers must be idempotent ([Consumers Are Idempotent](/docs/architecture/events#consumers-are-idempotent)).
- **Limits** (as of October 2026): retention 4 days by default, 60 seconds to 14 days; messages up to 1 MiB; delays up to 15 minutes; batches of 10.
- **FIFO queues** (17 Nov 2016) add "exactly-once processing" with a `MessageDeduplicationId` and per-group ordering by `MessageGroupId`. Internally a FIFO queue is partitions replicated across zones, with the partition chosen by a hash of the group ID, so throughput scales with the number of distinct groups: 300 transactions per second per partition per API action, and high-throughput mode up to 70,000 per second in the largest regions.
- **Fair queues** use `MessageGroupId` on standard queues to share one queue among many tenants or groups, a provider-side tool for the playbook's [noisy neighbor](/docs/architecture/multi-tenancy#noisy-neighbors) problem.

Pricing (US East, as of October 2026): every API action is a request, "each 64 KB chunk of a payload is billed as 1 request," and the first million requests a month are free. Standard requests are $0.40 per million for the first 100 billion a month, $0.30 for the next 100 billion and $0.24 above; FIFO is $0.50, $0.40 and $0.35 on the same tiers. A message that is sent, received and deleted is three requests.

## SNS and EventBridge

**SNS** (announced 7 Apr 2010) is fan-out: a publish to a topic is delivered to every subscription (SQS queues, Lambda functions, HTTP endpoints, email, Firehose). It also bills each 64 KB as a request, charges nothing for delivery to SQS or Lambda, and $0.50 per million standard publishes after the first million (as of October 2026). FIFO topics bill published messages, subscriber deliveries and payload gigabytes separately.

**EventBridge** (11 Jul 2019) is a bus: events from AWS services, SaaS partners and the customer's own code are matched against rules and routed to targets. Custom and partner events are $1.00 per million, AWS management events are free to ingest, archives and replay are billed by the gigabyte, Pipes connect a source to a target with filtering at $0.40 per million, and Scheduler includes 14 million invocations a month. The pricing page lists an enhanced custom event bus "launched in September 2026," priced per gigabyte instead of per event. EventBridge is where the CloudEvents-style envelope the playbook recommends ([Envelope: CloudEvents, Binary Mode](/docs/architecture/events#envelope-cloudevents-binary-mode)) meets a provider's routing product.

## Managed Brokers: RabbitMQ and ActiveMQ

Some applications need a broker that speaks a protocol (AMQP, JMS, MQTT, STOMP), not a cloud API. Two kinds of company sell that.

**Amazon MQ** launched on 28 Nov 2017 as managed Apache ActiveMQ with JMS, NMS, AMQP, STOMP, MQTT and WebSocket, single-instance or active/standby across zones; RabbitMQ followed. It bills broker-hours (as of October 2026, an mq.m5.large RabbitMQ broker is $0.288 an hour, and a three-node cluster bills as three) plus storage.

**CloudAMQP** started in 2012 "as hosted RabbitMQ," founded by Carl Hörberg, and now also runs LavinMQ, "our own broker built in Crystal," on the same platform. Its plans show the two ways to size a broker (as of October 2026): shared plans are metered by messages a month (the free Little Lemur allows 1 million messages, 20 connections and 100 queues; Tough Tiger is $19 for 10 million), while dedicated plans are sized by node, from Sassy Squirrel at $50 a month to Raging Rhino at $5,499, each with one-, three- and five-node prices. Billing is per second, data transfer is included up to a fair-use 30% of monthly spend, and idle free instances are deleted after two months. Its sizing advice is the rule for any broker: "Pick a plan by how much your system holds: connections, queues and stored messages."

**RabbitMQ under Broadcom.** RabbitMQ's server and core plugins remain under the Mozilla Public License 2.0, and Broadcom has not relicensed them. What changed is support. A policy announced on 31 May 2024 and effective 1 Jun 2024 limits core-team support to commercial customers, active contributors and reporters who supply full reproductions, and ends community patches for 3.12.x and older; each release now has a published "End of Community Support" date (4.4's is 31 Jul 2027) with paid extended support after it. The commercial edition, VMware Tanzu RabbitMQ, adds standby replication for disaster recovery, FIPS 140-2 TLS, audit logging and other features, and is licensed by physical core with usage reports every six months on request. For a hosting provider, that makes the support calendar of the engine part of the product, the same problem as database [extended support](/books/hosting-and-cloud/managed-databases#extended-support-and-forced-upgrades).

## Pub/Sub and Service Bus

**Google Cloud Pub/Sub** is one service for queues, fan-out and short-retention logs: a topic has subscriptions, each a queue of its own. It bills bytes, not requests: the first 10 GiB a month are free, then "$40 per TiB in all Google Cloud regions," where throughput is bytes published plus bytes delivered, and "a minimum of 1 KB is assessed for each request," so small messages should be batched. Subscriptions retain messages for 7 days by default and up to 31; the acknowledgement deadline is 10 seconds by default and up to 600; dead-letter topics take messages after 5 to 100 attempts; ordering keys deliver in order within a region.

**Azure Service Bus** is the enterprise broker as a service: queues, topics with subscriptions that carry filter rules and actions, sessions for FIFO and request/response, scheduled delivery, deferral, duplicate detection, dead-lettering, auto-forwarding and transactions over one entity, with AMQP 1.0 as its main protocol and JMS 2.0 on Premium. A namespace is "your own capacity slice of a large cluster made up of dozens of all-active virtual machines." The tiers price differently (East US, as of October 2026): Basic is $0.05 per million operations; Standard is a $10 monthly base with 13 million operations and 1,000 brokered connections included, then $0.80 per million operations up to 100 million and less above; Premium is $0.9275 per **messaging unit** hour (about $677 a month at 730 hours), with no per-operation charge, purchasable in 1, 2, 4, 8 or 16 units and billed on the highest number allocated in each hour.

## Kafka as a Service

Kafka is a partitioned, replicated log. Producers append to partitions, brokers replicate each partition to followers, and consumer groups track their own offsets; data stays until retention removes it. LinkedIn brought it to the Apache Incubator on 4 Jul 2011, and it graduated on 23 Oct 2012. Running it means running brokers with local disks, replicating every byte across zones, and rebalancing partitions when brokers change. That operational weight is the market.

**Confluent** is the business built on it. Its fiscal 2025 10-K reports revenue of $1,166.7 million (2024: $963.6 million), with "Confluent Cloud revenue represented 54% and 51% of our total revenue" in 2025 and 2024, and 1,521 customers with $100,000 or more in ARR. Confluent Cloud's ARR is calculated by "annualizing actual consumption of Confluent Cloud in the last three months of the applicable period," a consumption business measured like one. IBM agreed to acquire it on 7 Dec 2025 for $31 a share (about $11 billion in enterprise value), shareholders approved on 12 Feb 2026, and the deal completed on 17 Mar 2026, when Nasdaq trading was suspended before the open.

Confluent's engine, **Kora**, is described in a VLDB 2023 paper that is the best public account of running a multi-tenant log at scale: "tens of thousands of clusters" in 73 regions across AWS, Google Cloud and Azure; tiered storage that keeps new data on local disk and moves aged segments to object storage, so rebalancing moves only the active set and retention is limited only by the object store; a capacity abstraction, the **CKU** (Confluent Kafka Unit), with bandwidth, request and connection limits comparable across clouds; tenants pinned to **cells** of brokers spread across zones; and dynamic quotas that raised the share of tenants meeting the bandwidth SLO from 99% to over 99.9%. The paper also says "a majority of our availability lapses have been caused by malfunctioning cloud infrastructure," which is the underlay showing through.

The other Kafka services:

- **Amazon MSK** (GA 30 May 2019) sells provisioned brokers (kafka.m5.large at $0.21 per broker-hour plus $0.10 per GB-month of storage, as of October 2026), Serverless (GA 28 Apr 2022: $0.75 per cluster-hour, $0.0015 per partition-hour, $0.10 per GB in and $0.05 out, up to 200 MBps ingress per cluster), and Express brokers (7 Nov 2024: "up to three times more throughput per-broker," faster scaling and storage without provisioning, billed per broker-hour plus $0.01 per GB ingested).
- **Aiven** sells Kafka beside its databases on hourly plans with no separate HA charge, on several clouds, and in the customer's account (BYOC). It led KIP-1150, **Diskless Topics**, which keeps topic data in object storage with no broker replication; the Kafka community accepted it on 2 Mar 2026 with nine binding votes, and its implementation proposals were still in progress as of October 2026.
- **WarpStream**, bought by Confluent in September 2024 for "total preliminary purchase consideration of $135.1 million," is Kafka-compatible and writes directly to S3 from agents in the customer's own cloud account, which Confluent said solved two problems with earlier bring-your-own-cloud designs: broad vendor access to the customer's account, and stateful brokers that couldn't scale elastically.
- **Redpanda** is a Kafka-compatible engine under the Business Source License, whose Additional Use Grant forbids offering a "Streaming or Queueing Service" to third parties, cloud and hosting providers explicitly included; each release converts to Apache 2.0 after four years. Redpanda Cloud sells Serverless (up to 100 MB/s of writes, 99.9% SLA), BYOC in the customer's VPC (up to 2 GB/s, 99.99%), and a self-managed Enterprise Edition; unit rates are not on its pricing page.

The object-storage turn is the industry's answer to its own bill: replicating every byte three times across zones on provisioned disks is expensive, and object storage already replicates. The usual tradeoff is latency: a write acknowledged by an object store takes longer than one acknowledged by a local disk.

## Kinesis and Event Hubs

The hyperscalers' own logs predate their managed Kafka.

**Kinesis Data Streams** was announced in limited preview on 14 Nov 2013 as "a fully managed service for real-time processing of streaming data at any scale." Its unit is the **shard**: "Each shard can support up to 1 MB/sec or 1,000 records/sec write throughput or up to 2 MB/sec or 2,000 records/sec read throughput," and a stream is as many shards as the customer provisions. Records are kept for 24 hours by default and up to 365 days at extra cost. Consumers share a shard's read throughput (AWS gives "around 200 ms" average latency with one consumer and "up to around 1000 ms" with five) unless they use **enhanced fan-out**, which gives each registered consumer its own 2 MB per second per shard pushed over HTTP/2, at "typically an average of 70 ms." On-demand mode (30 Nov 2021) removed shard planning: a stream starts at 4 MB/s of writes and scales to 10 GB/s in the largest regions. Pricing (US East, as of October 2026): provisioned is $0.015 per shard-hour plus $0.014 per million 25 KB PUT payload units, with extended retention at $0.020 per shard-hour; on-demand Standard is $0.04 per stream-hour plus $0.08 per GB written and $0.04 per GB read; a newer On-demand Advantage mode drops the stream-hour charge for per-GB rates with a minimum commitment. (Kinesis Data Firehose was renamed Amazon Data Firehose on 9 Feb 2024.)

**Azure Event Hubs** sells capacity in units by tier. A **throughput unit** (Basic and Standard) is "up to 1 MB per second or 1,000 events per second" in and "up to 2 MB per second or 4,096 events per second" out, with up to 40 per namespace; Premium sells **processing units** isolated "at the CPU and memory level" (about 5 to 10 MB/s in per unit); Dedicated sells single-tenant **capacity units**. Retention is 1 day on Basic, 7 on Standard and 90 on Premium and Dedicated. Capture writes the stream to Blob Storage or Data Lake in Avro. Event Hubs for Kafka (GA 7 Nov 2018) lets Kafka clients connect "simply by changing a connection string," mapping a Kafka cluster to a namespace and a topic to an event hub, on Standard and above, with "at-least once" delivery. Prices (East US, as of October 2026): Basic $0.015 and Standard $0.03 per throughput-unit hour plus $0.028 per million ingress events; Premium $1.027 per processing-unit hour; Dedicated $6.849 per capacity-unit hour.

## Pulsar

Apache Pulsar is the main alternative design for a log. Its Apache incubation proposal says it is "the direct evolution of systems that were developed at Yahoo since 2011" and was "open-sourced under Apache license in September 2016"; it entered the incubator in June 2017 and the Apache Software Foundation announced it as a top-level project on 25 Sep 2018. Its architecture "separates the serving and storage layers, leveraging Apache BookKeeper as the storage component": brokers are stateless, a BookKeeper cluster of **bookies** stores each topic as a series of append-only **ledgers**, tiered storage copies sealed segments to object storage, and multi-tenancy is built into names (`persistent://tenant/namespace/topic`). Subscriptions come in four types (exclusive, shared, failover and key_shared), so one system serves both queue and log uses.

**StreamNative**, "founded by the original creators of Apache Pulsar" in 2019, sells it as a service and launched **Ursa** on 14 May 2024 as "a Kafka-compatible data streaming engine built on top of lakehouse storage," generally available on its BYOC offering for AWS from 3 Feb 2025. Its pricing page lists Serverless "starting at $73/month," Dedicated from $505 and BYOC from $365 (as of October 2026), without per-unit rates. Its "up to 95%" savings claim is the vendor's own benchmark.

## NATS

NATS is a lightweight messaging system built on subjects; JetStream "adds a persistence layer on top, giving you at-least-once delivery - messages survive restarts and can be replayed." It was contributed to the CNCF in 2018, and its 2025 dispute is the clearest case of who controls an open-source project's name. In April 2025 the CNCF said Synadia, the company behind NATS, had never completed a promised trademark transfer and had proposed leaving the CNCF with the nats.io domain and GitHub organization returned "within two weeks" and the server relicensed to the Business Source License; the CNCF petitioned the USPTO to cancel the NATS trademark registrations. On 1 May 2025 they settled: Synadia assigns its two NATS trademark registrations to the Linux Foundation, the domain and repositories stay with the CNCF, NATS stays Apache 2.0, and a proprietary fork must use a different name. The licensing side is [Open Source & the Clouds](/books/hosting-and-cloud/open-source-and-the-clouds#nats-redpanda-and-rabbitmq).

## Serverless and HTTP Queues

Functions and edge code can't hold a broker connection or poll a queue, so the newest products push messages over HTTP.

- **Cloudflare Queues** (GA 1 Apr 2024) deliver "at least once" ("in rare occasions, may be delivered more than once") to a consumer Worker, and bill per 64 KB operation (a write, a read and a delete are about three per message): Free includes 10,000 operations a day with 24-hour retention, Paid includes 1 million a month then $0.40 per million, with retention of 4 days by default and up to 14. Cloudflare's worked example puts 1 million small messages a day for 30 days at about $35.60.
- **Upstash QStash** is "serverless messaging and scheduling" that "acts as a middleman between you and an API to guarantee delivery": the producer posts a message, QStash calls the destination URL, retries on failure, and supports delays and cron schedules, with a 1 MB default message limit. It is the provider-side version of the playbook's [Webhooks](/docs/api-design/webhooks#retries) retry rules.

## Realtime Pub/Sub

A realtime service fans messages out to connected browsers and devices rather than to backend consumers. **Ably** was "born in 2013" and launched publicly in 2016; its building block is the channel ("Channels are used to separate messages into different topics"), multiplexed over one WebSocket per client. Its architecture documentation describes clusters spanning two to ten regions with routing, gossip, frontend and core layers, channels placed on core processes by consistent hashing, with every message stored in memory in two or more data centers in the receiving region and copied to at least one other region. It claims "Exactly-once delivery semantics" and "Guaranteed message ordering from publishers to subscribers"; its idempotency documentation is more exact: SDKs assign each message an ID, and "Ably can only detect duplicate messages within a 2-minute window." Pricing (as of October 2026): Free includes 6 million messages a month and 200 concurrent connections; Standard is $29 a month and Pro $399 plus usage, at $2.50 per million messages, $1.00 per million connection-minutes and $1.00 per million channel-minutes.

**Pusher** Channels sells the same shape by daily message and concurrent-connection allowances: a free Sandbox of 200,000 messages a day and 100 connections, up to Growth Plus at $1,199 a month for 90 million messages a day and 30,000 connections. Its terms and privacy links go to MessageBird.

## Delivery Semantics as Sold

"Exactly once" appears on many pricing pages and means something narrower on each. In each vendor's own terms:

| Service | Claim | What it covers | What it doesn't |
| --- | --- | --- | --- |
| SQS standard | At least once | Every message is delivered | Duplicates; order |
| SQS FIFO | "Exactly-once processing" | Deduplication of sends by `MessageDeduplicationId`; order within a group | A consumer that processes then fails to delete |
| Pub/Sub exactly-once | No redelivery after a successful ack | Pull subscriptions only, "within a cloud region" | Publish-side duplicates "still possible" |
| Service Bus | "Once-only processing semantics" | Settling an input and sending output in one transaction, on one entity | Effects outside Service Bus |
| Kafka transactions | Exactly-once within Kafka | Read-process-write between Kafka topics | Side effects in other systems |
| Event Hubs Kafka endpoint | At least once | | |
| Cloudflare Queues | At least once | | |
| Ably | "Exactly-once delivery semantics" | Idempotent publishing, duplicates detected "within a 2-minute window" | Retries after two minutes |

The common rule follows from the table: every guarantee ends at the boundary of the vendor's system, so the consumer's side effects still need [idempotent consumers](/docs/architecture/events#consumers-are-idempotent), and the playbook's [Exactly-Once, as Each Documents It](/docs/data/streaming#exactly-once-as-each-documents-it) covers the streaming engines in detail. A provider writing its own messaging documentation should state the boundary next to the claim.

## Pricing Meters and a Worked Cost

The meters, by family:

| Family | Meters |
| --- | --- |
| Request-priced queues and buses | Requests in 64 KB chunks (SQS, SNS, EventBridge, Cloudflare Queues); operations (Service Bus Standard) |
| Byte-priced pub/sub | TiB published plus delivered, 1 KB minimum per request (Pub/Sub) |
| Provisioned logs | Shard-hours and payload units (Kinesis); throughput, processing or capacity unit hours (Event Hubs); broker-hours, storage and storage throughput (MSK, Confluent dedicated) |
| Serverless logs | Cluster-hours, partition-hours, GB in and out (MSK Serverless); stream-hours and GB (Kinesis on-demand) |
| Brokers | Node-hours or plans sized by messages, connections and queues (Amazon MQ, CloudAMQP) |
| Retention | GB-month beyond an included window (Kinesis, MSK, Event Hubs Premium) |
| Realtime | Messages, connection-minutes, channel-minutes, GB transferred (Ably) |

A worked example makes the shapes concrete. Take 1 million messages a day, each under 1 KB, for a 30-day month (30 million messages), one consumer, in US East, at list prices as of October 2026, assuming three billable operations per message (send, receive, delete) where operations are billed and 730 hours where capacity is:

| Service | Calculation | Monthly |
| --- | --- | --- |
| SQS standard | 90 million requests, 1 million free, 89 million at $0.40 per million | About $35.60 |
| Cloudflare Queues | 90 million operations, 1 million included, 89 million at $0.40 per million | About $35.60 |
| SNS to one SQS queue | 30 million publishes, 1 million free, at $0.50 per million; delivery to SQS free (plus the queue's own cost) | About $14.50 plus the queue |
| Pub/Sub | About 60 GB of throughput (1 KB minimum each way), 10 GiB free, about 50 GiB at $40 per TiB | About $2 |
| Service Bus Standard | $10 base; 90 million operations, 13 million included, 77 million at $0.80 per million | About $72 |
| Kinesis provisioned | One shard for 730 hours at $0.015, plus 30 million payload units at $0.014 per million | About $11.40 |
| Event Hubs Standard | One throughput unit for 730 hours at $0.03, plus 30 million events at $0.028 per million | About $22.70 |
| MSK Serverless | The cluster-hour alone: 730 hours at $0.75 | At least $547.50 |
| Amazon MQ RabbitMQ | One mq.m5.large broker for 730 hours at $0.288, before storage | About $210 |
| CloudAMQP | 30 million messages is above the shared plans; the smallest dedicated plan | From $50 |
| Ably Standard | $29 plan plus 30 million messages at $2.50 per million, before connection and channel minutes | About $104 |

The same traffic costs from about $2 to over $500 a month depending only on the product's shape. At low volume, per-request and per-byte services are cheapest and provisioned clusters have a floor that dominates; at high, steady volume the order reverses, because a shard, a throughput unit or a broker carries far more than this example uses. Pub/Sub's byte pricing rewards small messages that are batched; the request-priced services reward batching too, since a batch of ten is one request. The provider's lesson is the FinOps chapter's: publish the floor, the unit and a worked example, because customers can't compare these from the rate cards alone ([Measure Cost per Unit](/docs/operations/cost-and-finops#measure-cost-per-unit-not-just-in-total)).

## The Alternatives

| Approach | Model | Strengths | Failure modes | Licensing and ownership | Cost shape |
| --- | --- | --- | --- | --- | --- |
| **Queue in the application's database** | A jobs table with `SKIP LOCKED` | No new system; transactional enqueue | Throughput ceiling; vacuum and lock pressure | The database's | Free until it isn't |
| **Cloud queue** (SQS, Service Bus, Pub/Sub, Cloudflare Queues) | Request- or byte-priced, provider-run | No capacity planning; near-zero idle cost | At-least-once; limited retention; per-cloud APIs | Proprietary | Per request or byte |
| **Event bus** (EventBridge, Event Grid) | Rule-based routing | Native events from the cloud's own services | Per-event cost at volume; proprietary rules | Proprietary | Per event |
| **Managed broker** (Amazon MQ, CloudAMQP, Service Bus Premium) | A protocol broker run for you | AMQP, JMS, MQTT; existing applications move unchanged | Brokers are stateful and sized; failover is a reconnect | RabbitMQ MPL 2.0, ActiveMQ Apache 2.0; RabbitMQ support policy set by Broadcom | Node-hours or plans |
| **Managed Kafka** (Confluent, MSK, Aiven) | Provisioned or serverless log | Replay, retention, the Kafka ecosystem | Partitions and consumer groups to design; a capacity floor | Apache Kafka Apache 2.0; Confluent components under its Community License; Confluent owned by IBM | Broker or capacity units, storage, throughput |
| **Kafka-compatible engines** (Redpanda, WarpStream, Event Hubs, Ursa) | Kafka protocol on another engine | Simpler operations, object storage, BYOC | Compatibility gaps; vendor-specific features | Redpanda BSL; WarpStream proprietary (Confluent) | Varies; BYOC adds the customer's cloud bill |
| **Cloud logs** (Kinesis, Event Hubs) | Shards or throughput units | Native integration with the cloud's analytics | Per-cloud API; shard or unit planning in provisioned mode | Proprietary | Unit-hours plus data |
| **Pulsar** (StreamNative) | Stateless brokers over BookKeeper | Queue and log semantics in one; multi-tenancy | More components to run | Apache 2.0 | Plans from StreamNative |
| **NATS** (Synadia, self-hosted) | Subjects plus JetStream | Light, fast, edge-friendly | Smaller ecosystem than Kafka | Apache 2.0, trademarks at the Linux Foundation | Self-hosted or Synadia plans |
| **Realtime pub/sub** (Ably, Pusher) | Channels to clients | Browser and mobile fan-out, presence, history | Not a backend log; per-message cost at volume | Proprietary | Messages and connection-minutes |

## My Default

My default for work handed between services is the cloud's own queue (SQS, Service Bus, Pub/Sub, or Cloudflare Queues on Workers), with a dead-letter queue configured from day one and consumers written to be idempotent, because it costs almost nothing idle, needs no capacity planning, and every vendor's guarantee ends at its own boundary anyway. If the work already lives in Postgres and the volume is modest, a jobs table is simpler still.

I'd reach for a log only when I need replay, multiple independent consumers of the same history, or ordered streams at high volume, and then managed Kafka from whichever vendor runs it in my cloud, with the object-storage options (Express brokers, WarpStream, Diskless Topics once it ships) where latency allows. I'd pick a managed broker only to move an existing AMQP, JMS or MQTT application without rewriting it. For browsers and devices I'd use a realtime service rather than exposing a backend log. The tradeoff that would change these defaults is volume and steadiness: at sustained high throughput, provisioned capacity beats per-request pricing by a wide margin, and the worked example's order reverses.

## How to Build It

The chapter adds `queues` and `topics` side tables for resources of kind `'queue'` and `'topic'`, a `message_broker` kind and side table for brokers and Kafka-style clusters, `topic_subscriptions`, and the message, throughput and retention meters, on top of [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). The core `subscriptions` table is the customer's commitment to a plan; a subscription to a topic is a different thing and gets its own name.

```sql
ALTER TABLE resources DROP CONSTRAINT resources_kind_check;
ALTER TABLE resources ADD CONSTRAINT resources_kind_check CHECK (kind IN (
  'server', 'virtual_machine', 'volume', 'snapshot', 'image',
  'network', 'subnet', 'interconnect', 'placement_group', 'ip_address',
  'load_balancer', 'cluster', 'node_pool', 'container_service', 'function',
  'database', 'cache', 'queue', 'topic', 'edge_store', 'bucket',
  'registry', 'ci_pipeline', 'gpu_reservation', 'model_endpoint',
  'hosting_account', 'site', 'mailbox',
  'domain', 'dns_zone', 'certificate', 'cdn_zone',
  'phone_number', 'sender_identity',
  'message_broker'));                    -- added: a broker or log cluster that holds queues and topics

CREATE TABLE message_brokers (           -- side table: kind = 'message_broker'
  resource_id      UUID PRIMARY KEY REFERENCES resources (id),
  engine           TEXT NOT NULL CHECK (engine IN ('kafka', 'kafka_compatible', 'rabbitmq',
                     'lavinmq', 'activemq', 'pulsar', 'nats', 'provider_native')),
  engine_version   TEXT,
  capacity_model   TEXT NOT NULL CHECK (capacity_model IN ('nodes', 'capacity_units',
                     'serverless')),
  nodes            SMALLINT,             -- brokers, for 'nodes'
  capacity_units   NUMERIC,              -- CKUs, messaging, throughput or processing units
  storage_model    TEXT NOT NULL CHECK (storage_model IN ('local_disk', 'tiered',
                     'object_storage')),
  deployment       TEXT NOT NULL CHECK (deployment IN ('provider_account', 'byoc')),
  CHECK ((capacity_model = 'nodes') = (nodes IS NOT NULL))
);

CREATE TABLE queues (                    -- side table: kind = 'queue'
  resource_id                UUID PRIMARY KEY REFERENCES resources (id),
  broker_id                  UUID REFERENCES resources (id),  -- null: a provider-native queue
  queue_kind                 TEXT NOT NULL CHECK (queue_kind IN ('standard', 'fifo', 'fair')),
  delivery                   TEXT NOT NULL CHECK (delivery IN ('at_least_once',
                               'deduplicated', 'transactional')),
  retention                  INTERVAL NOT NULL,   -- 4 days default, 14 max on SQS
  visibility_timeout         INTERVAL NOT NULL,
  max_message_bytes          INT NOT NULL,
  dedup_window               INTERVAL,            -- for 'deduplicated'
  dead_letter_queue_id       UUID REFERENCES resources (id),
  max_receive_count          SMALLINT,            -- attempts before dead-lettering
  CHECK ((dead_letter_queue_id IS NULL) = (max_receive_count IS NULL)),
  CHECK (delivery <> 'deduplicated' OR dedup_window IS NOT NULL)
);

CREATE TABLE topics (                    -- side table: kind = 'topic'
  resource_id        UUID PRIMARY KEY REFERENCES resources (id),
  broker_id          UUID REFERENCES resources (id),   -- the cluster it lives in, if any
  topic_kind         TEXT NOT NULL CHECK (topic_kind IN ('fanout', 'event_bus', 'log',
                       'realtime_channel')),
  partitions         INT,                -- partitions or shards, for logs
  retention          INTERVAL,           -- null: unlimited, for tiered logs
  retention_bytes    BIGINT,
  replication_factor SMALLINT,
  CHECK (topic_kind <> 'log' OR partitions IS NOT NULL)
);

CREATE TABLE topic_subscriptions (       -- who receives a topic's messages; not a billing subscription
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id       UUID NOT NULL REFERENCES accounts (id),
  topic_id         UUID NOT NULL REFERENCES resources (id),
  target_kind      TEXT NOT NULL CHECK (target_kind IN ('queue', 'function', 'http_endpoint',
                     'email', 'consumer_group')),
  target_ref       TEXT NOT NULL,        -- a resource id, URL or consumer group name
  filter           JSONB,                -- rule or attribute filter, as the product defines it
  delivery         TEXT NOT NULL CHECK (delivery IN ('push', 'pull')),
  valid_during     TSTZRANGE NOT NULL
);
```

The meters, rated by SKUs in the core catalog:

| Meter | Unit | Counted as |
| --- | --- | --- |
| `queue.requests` | request | Each API action, one per started 64 KB of payload |
| `topic.publishes` | request | Each publish, one per started 64 KB |
| `topic.deliveries` | request | Each delivery, by `target_kind` dimension (some free) |
| `stream.throughput_bytes` | gb | Bytes published plus delivered, with a per-request minimum |
| `stream.capacity_unit_seconds` | second | Shards, throughput units or capacity units held, billed on the hour's maximum |
| `broker.node_seconds` | second | Each broker node |
| `stream.partition_seconds` | second | Each partition, for partition-priced serverless logs |
| `stream.retained_gb_hours` | gb_month | Retained data beyond the included window |
| `realtime.messages`, `realtime.connection_minutes`, `realtime.channel_minutes` | request, minute | Per realtime message, connected minute and active channel minute |

Chunking happens once, at the meter, so every service agrees on what a request is:

```sql
-- Billable requests for one API call with a payload of n bytes: one per started 64 KB,
-- at least one (SQS, SNS and EventBridge all bill this way).
CREATE FUNCTION billable_requests(payload_bytes BIGINT) RETURNS BIGINT
  LANGUAGE sql IMMUTABLE AS
$$ SELECT GREATEST(1, CEIL(payload_bytes / 65536.0)::BIGINT) $$;

-- Capacity units billed for an hour are the highest allocated during it (Service Bus
-- Premium bills this way), not the average.
SELECT resource_id, date_trunc('hour', lower(occurred_during)) AS hour,
       MAX(quantity) AS billed_units
FROM usage_events
WHERE meter = 'stream.capacity_unit_seconds'
GROUP BY resource_id, date_trunc('hour', lower(occurred_during));
```

Notes on the sketch:

- **Brokers contain queues and topics.** A RabbitMQ broker or Kafka cluster is a resource of its own, billed by node or unit; its queues and topics point at it with `broker_id`. A provider-native queue (SQS-style) has no broker row, because the customer never sees one.
- **Delivery semantics are a column.** `at_least_once`, `deduplicated` with its window, or `transactional`, so documentation, the console and support can say exactly what the customer bought.
- **Dead letters are configured, not implied.** The dead-letter queue and attempt count are a pair, and a message moving there is an event the customer can alert on ([When Processing Fails](/docs/architecture/events#when-processing-fails)).
- **Retention is a cost driver.** It is stored per topic and metered beyond the included window, because a log's storage is throughput times retention whether or not anyone reads it.
- **BYOC is a deployment value.** A BYOC cluster runs in the customer's cloud account; the provider bills its fee while the customer's cloud bills the machines and storage, and both bills reference the same resource.
- **Events:** `queue.dead_lettered`, `queue.backlog_threshold_crossed`, `broker.scaled`, `broker.failover` and `topic.retention_changed` go through the [outbox](/docs/architecture/events#the-transactional-outbox).

## Auditing

- **What delivery guarantee was sold.** The queue's delivery mode and deduplication window at the time of an incident, because duplicate-processing disputes turn on what the customer was told.
- **Messages the provider dropped or dead-lettered.** Counts per queue and reason (retention expiry, max receives, size), retained long enough to answer a customer's investigation; the messages themselves are customer data with their own retention.
- **Capacity changes and their billing.** Every scale-up and scale-down with its time, so an hour billed at its maximum can be explained.
- **Engine support status.** Which broker versions are past community support and on paid extended support, as with database engines.

## What This Means for the System You Build

- **Sell queues, buses, logs and realtime channels as different products,** with different meters, because they have different cost structures.
- **Chunk payloads into requests in one place** and publish the chunk size.
- **State the boundary of every delivery guarantee** next to the claim.
- **Make dead-lettering a configured pair** (target and attempts) and an alertable event.
- **Meter retention separately** on logs, and show customers what their retention costs.
- **Publish a worked monthly cost** for a common workload on each product, including any capacity floor.
- **Model BYOC as a deployment of the same resource,** with two bills that point at it.

## References

**AWS**

- [AWS What's New: Introducing Amazon SQS (3 Nov 2004)](https://aws.amazon.com/about-aws/whats-new/2004/11/03/introducing-the-amazon-simple-queue-service), the beta
- [AWS What's New: Amazon SQS generally available (11 Jul 2006)](https://aws.amazon.com/about-aws/whats-new/2006/07/11/amazon-simple-queue-service-amazon-sqs-now-generally-available/), the production launch
- [Werner Vogels: Your queues are ready](https://allthingsdistributed.com/2006/07/your_queues_are_ready.html), the 2006 launch price
- [AWS: Amazon SQS, 15 years and still queueing](https://aws.amazon.com/blogs/aws/amazon-sqs-15-years-and-still-queueing/), the feature timeline, Prime Day 2021 peak and three-copy storage
- [Amazon SQS: Standard queues](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues.html), at-least-once delivery and throughput
- [AWS: SQS FIFO queues with exactly-once processing](https://aws.amazon.com/blogs/aws/new-for-amazon-simple-queue-service-fifo-queues-with-exactly-once-delivery-deduplication/), the 2016 launch, deduplication and message groups
- [AWS What's New: FIFO queues and lower standard prices](https://aws.amazon.com/about-aws/whats-new/2016/11/amazon-sqs-introduces-fifo-queues-with-exactly-once-processing-and-lower-prices-for-standard-queues), launch pricing
- [Amazon SQS: Pricing](https://aws.amazon.com/sqs/pricing/), requests, 64 KB chunks and the free tier
- [AWS Price List API: Amazon SQS, US East](https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AWSQueueService/current/us-east-1/index.json), standard and FIFO tiers as of October 2026
- [Amazon SQS: Message quotas](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/quotas-messages.html), retention, size, visibility timeout, delay and fair queues
- [Amazon SQS: High throughput for FIFO queues](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/high-throughput-fifo.html), partitions and throughput
- [AWS What's New: Announcing Amazon SNS](https://aws.amazon.com/about-aws/whats-new/2010/04/07/announcing-amazon-simple-notification-service), the 7 Apr 2010 launch
- [Amazon SNS: Pricing](https://aws.amazon.com/sns/pricing/), 64 KB chunks and free deliveries to SQS and Lambda
- [AWS Price List API: Amazon SNS, US East](https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonSNS/current/us-east-1/index.json), publish and delivery rates
- [AWS What's New: Introducing Amazon EventBridge](https://aws.amazon.com/about-aws/whats-new/2019/07/introducing-amazon-eventbridge/), the 11 Jul 2019 launch
- [Amazon EventBridge: Pricing](https://aws.amazon.com/eventbridge/pricing/), events, Pipes, Scheduler, archives and the enhanced bus
- [AWS: Amazon MQ](https://aws.amazon.com/blogs/aws/amazon-mq-managed-message-broker-service-for-activemq/), the 2017 launch and protocols
- [Amazon MQ: Pricing](https://aws.amazon.com/amazon-mq/pricing/), broker-hours and storage
- [Amazon press: MSK generally available](https://press.aboutamazon.com/2019/5/aws-announces-general-availability-of-amazon-managed-streaming-for-apache-kafka-amazon-msk), 30 May 2019
- [AWS: MSK Serverless generally available](https://aws.amazon.com/blogs/aws/amazon-msk-serverless-now-generally-available-no-more-capacity-planning-for-your-managed-kafka-clusters), limits per cluster and partition
- [AWS: Express brokers for Amazon MSK](https://aws.amazon.com/blogs/aws/introducing-express-brokers-for-amazon-msk-to-deliver-high-throughput-and-faster-scaling-for-your-kafka-clusters/), the throughput and scaling claims
- [Amazon MSK: Pricing](https://aws.amazon.com/msk/pricing/), broker, storage, Express and Serverless rates
- [AWS What's New: Introducing Amazon Kinesis](https://aws.amazon.com/about-aws/whats-new/2013/11/14/introducing-amazon-kinesis/), the 14 Nov 2013 preview
- [Kinesis Data Streams: Quotas and limits](https://docs.aws.amazon.com/streams/latest/dev/service-sizes-and-limits.html), shard throughput and on-demand limits
- [Kinesis Data Streams: Data retention](https://docs.aws.amazon.com/streams/latest/dev/kinesis-extended-retention.html), 24 hours to 365 days
- [Kinesis Data Streams: Enhanced fan-out](https://docs.aws.amazon.com/streams/latest/dev/enhanced-consumers.html), dedicated throughput and latency figures
- [AWS What's New: Kinesis Data Streams On-Demand](https://aws.amazon.com/about-aws/whats-new/2021/11/amazon-kinesis-data-streams-on-demand/), the 30 Nov 2021 launch
- [Kinesis Data Streams: Pricing](https://aws.amazon.com/kinesis/data-streams/pricing/), payload units and on-demand modes
- [AWS Price List API: Amazon Kinesis, US East](https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonKinesis/current/us-east-1/index.json), shard, payload, retention and on-demand rates
- [AWS What's New: Amazon Data Firehose](https://aws.amazon.com/about-aws/whats-new/2024/02/amazon-data-firehose-formerly-kinesis-data-firehose/), the 2024 rename

**Google Cloud and Azure**

- [Google Cloud: Pub/Sub pricing](https://cloud.google.com/pubsub/pricing), throughput pricing and the 1 KB minimum
- [Google Cloud: Subscription properties](https://docs.cloud.google.com/pubsub/docs/subscription-properties), retention, ack deadlines, dead-letter topics and ordering
- [Google Cloud: Exactly-once delivery](https://docs.cloud.google.com/pubsub/docs/exactly-once-delivery), its scope and limits
- [Microsoft Learn: Service Bus messaging overview](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-messaging-overview), the feature set, namespaces and once-only processing
- [Azure: Service Bus pricing](https://azure.microsoft.com/en-us/pricing/details/service-bus/), tiers and included operations
- [Azure Retail Prices API: Service Bus, East US](https://prices.azure.com/api/retail/prices?$filter=serviceName%20eq%20'Service%20Bus'%20and%20armRegionName%20eq%20'eastus'), Basic, Standard and Premium rates
- [Microsoft Learn: Service Bus Premium messaging](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-premium-messaging), messaging units and hourly billing
- [Microsoft Learn: Event Hubs scalability](https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-scalability), throughput and processing units
- [Microsoft Learn: Event Hubs quotas](https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-quotas), retention, storage, units and partitions by tier
- [Microsoft Learn: Event Hubs Capture](https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-capture-overview), Capture to storage
- [Microsoft Learn: Event Hubs for Apache Kafka](https://learn.microsoft.com/en-us/azure/event-hubs/azure-event-hubs-apache-kafka-overview), the mapping, tiers and at-least-once delivery
- [Azure: Event Hubs for Apache Kafka generally available](https://azure.microsoft.com/en-us/blog/announcing-the-general-availability-of-azure-event-hubs-for-apache-kafka/), 7 Nov 2018
- [Azure Retail Prices API: Event Hubs, East US](https://prices.azure.com/api/retail/prices?$filter=serviceName%20eq%20'Event%20Hubs'%20and%20armRegionName%20eq%20'eastus'), unit and ingress rates and the 2014 meter start dates

**Kafka, Confluent and peers**

- [Apache Incubator: Kafka](https://incubator.apache.org/projects/kafka.html), incubation on 4 Jul 2011 and graduation on 23 Oct 2012
- [Confluent: Form 10-K for 2024](https://www.sec.gov/Archives/edgar/data/1699838/000095017025022369/cflt-20241231.htm), the ARR definition and the WarpStream purchase price
- [Confluent: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1699838/000169983826000006/cflt-20251231.htm), revenue, Confluent Cloud share and large customers
- [Confluent: Form 8-K on the IBM merger](https://www.sec.gov/Archives/edgar/data/1699838/000110465926014429/tm266253d1_8k.htm), the shareholder vote
- [Confluent: Form 8-K on completion](https://www.sec.gov/Archives/edgar/data/1699838/000110465926029071/tm268826d6_8k.htm), completion on 17 Mar 2026 and the trading suspension
- [Povzner et al., Kora: A Cloud-Native Event Streaming Platform for Kafka (VLDB 2023)](https://www.vldb.org/pvldb/vol16/p3822-povzner.pdf), cells, CKUs, tiered storage, quotas and availability lapses
- [Confluent: Confluent acquires WarpStream](https://www.confluent.io/blog/confluent-acquires-warpstream/), the BYOC rationale
- [Aiven: KIP-1150 accepted and the road ahead](https://aiven.io/blog/kip-1150-accepted-and-the-road-ahead), the 2 Mar 2026 vote
- [Aiven: Pricing](https://aiven.io/pricing), hourly plans and BYOC
- [Redpanda: Business Source License](https://github.com/redpanda-data/redpanda/blob/dev/licenses/bsl.md), the Additional Use Grant and conversion
- [Redpanda: Pricing](https://www.redpanda.com/pricing), Serverless, BYOC and Enterprise

**Brokers, Pulsar, NATS and HTTP services**

- [CloudAMQP: About](https://www.cloudamqp.com/about_us.html), the 2012 start, founder and LavinMQ
- [CloudAMQP: Plans](https://www.cloudamqp.com/plans.html), shared and dedicated plans and sizing advice
- [RabbitMQ: LICENSE](https://github.com/rabbitmq/rabbitmq-server/blob/main/LICENSE), MPL 2.0
- [RabbitMQ: New community support policy](https://www.rabbitmq.com/blog/2024/05/31/new-community-support-policy), the 2024 policy
- [RabbitMQ: Release information](https://www.rabbitmq.com/release-information), end of community support per release
- [RabbitMQ: Commercial features](https://www.rabbitmq.com/commercial-features), the Tanzu-only features
- [Broadcom: VMware Tanzu RabbitMQ Specific Program Documentation](https://ftpdocs.broadcom.com/cadocs/0/contentimages/VMware_Tanzu_RabbitMQ_Specific_Program_Documentation_2025_08_18.pdf), per-core licensing and usage reports
- [Apache Incubator: Pulsar proposal](https://cwiki.apache.org/confluence/spaces/INCUBATOR/pages/110694328/PulsarProposal), the Yahoo origin and the 2016 open-sourcing
- [Apache Software Foundation: Pulsar becomes a top-level project](https://news.apache.org/foundation/entry/the-apache-software-foundation-announces39), 25 Sep 2018, BookKeeper storage and the license
- [Apache Pulsar: Architecture overview](https://pulsar.apache.org/docs/next/concepts-architecture-overview/), stateless brokers, bookies and ledgers
- [Apache Pulsar: Tiered storage](https://pulsar.apache.org/docs/next/tiered-storage-overview/), segments moved to object storage
- [Apache Pulsar: Messaging concepts](https://pulsar.apache.org/docs/next/concepts-messaging/), topic names and subscription types
- [StreamNative: About](https://streamnative.io/about), the 2019 founding
- [StreamNative: Ursa launch](https://streamnative.io/press-releases/streamnative-launches-ursa-kafka-compatible-data-streaming-engine), 14 May 2024
- [StreamNative: Ursa engine GA](https://streamnative.io/blog/announcing-ursa-engine-ga-lakehouse-first-kafka-streaming-with-unity-iceberg-catalog-integration), 3 Feb 2025
- [StreamNative: Ursa on AWS](https://streamnative.io/blog/announcing-ursa-engine-ga-on-aws-leaderless-lakehouse-native-data-streaming-that-slashes-kafka-costs-by-95), the cost claim
- [StreamNative: Pricing](https://streamnative.io/pricing), starting prices and SLAs
- [NATS: JetStream](https://docs.nats.io/nats-concepts/jetstream), persistence and at-least-once delivery
- [CNCF: Protecting NATS](https://www.cncf.io/blog/2025/04/24/protecting-nats-and-the-integrity-of-open-source-cncfs-commitment-to-the-community), the 2025 dispute
- [CNCF: CNCF and Synadia align on NATS](https://www.cncf.io/announcements/2025/05/01/cncf-and-synadia-align-on-securing-the-future-of-the-nats-io-project/), the 1 May 2025 settlement
- [Cloudflare Queues: Delivery guarantees](https://developers.cloudflare.com/queues/reference/delivery-guarantees/), at-least-once delivery
- [Cloudflare Queues: Pricing](https://developers.cloudflare.com/queues/platform/pricing/), operations, retention and the worked example
- [Upstash: QStash](https://upstash.com/docs/qstash/overall/getstarted), HTTP delivery, retries and schedules
- [Ably: Raises $1M](https://ably.com/blog/ably-raises-1m), the 2013 start and 2016 launch
- [Ably: Channels](https://ably.com/docs/channels), channels over one connection
- [Ably: Platform architecture](https://ably.com/docs/platform/architecture), clusters, layers, persistence and delivery claims
- [Ably: Idempotent publishing](https://ably.com/docs/pub-sub/advanced#idempotency), the two-minute deduplication window
- [Ably: Pricing](https://ably.com/pricing), plans and usage rates
- [Pusher: Channels pricing](https://pusher.com/channels/pricing/), plans by daily messages and connections
