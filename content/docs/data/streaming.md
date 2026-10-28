+++
title = "Streaming & Event Processing"
description = "Logs, partitions and consumer groups in Kafka, Kinesis, Pulsar and Redpanda; event time, windows, watermarks, state and exactly-once in Flink and Spark."
category = "Data Platforms"
order = 1275
tags = ["data", "streaming", "kafka", "flink", "stream-processing"]
+++

[Events & Async Messaging](/docs/architecture/events) is about application events: one service telling others that a payment was captured, with an outbox, idempotent consumers and a schema each consumer depends on. This chapter is about the analytical side of the same infrastructure: high-volume streams of clicks, gameplay events, card authorizations, vehicle positions and log lines, read by jobs that count, join and aggregate them while they're still moving. The broker is often the same product. The questions are different: not "did the invoice service hear about it?" but "how many checkouts failed in the last five minutes, counted by when they happened rather than when they arrived?"

[Data Pipelines & Analytics](/docs/architecture/data-pipelines) covers the batch path (CDC, raw, staging, marts) and the rules that make it replayable. Everything there still holds. A stream is a pipeline whose interval is very short and never closes, which is exactly why it's harder.

## When Streaming Beats Batch

Batch is the default. A model that runs every hour is simple to reason about, cheap to rerun, and easy to test, and most questions a business asks ("revenue by cohort", "churn by plan") don't get better answers by arriving faster. I add streaming only when one of these is true:

- **Someone acts on the answer within minutes.** A fraud rule that blocks a card, a live-ops dashboard that catches an economy exploit after a store change, a dispatcher rerouting a technician, an alert on a spike in failed logins. If the reader of the number looks at it tomorrow morning, an hourly batch is the right tool.
- **The product itself reads the result.** A "trending now" shelf in a store, a matchmaking queue's estimated wait, a usage meter a SaaS customer watches as they approach a quota. These are features, with the same [SLOs](/docs/operations/slos) as any other feature.
- **The volume is too large to land and then scan.** Aggregating or sampling in flight (per-minute counts instead of every raw position) can be cheaper than storing everything and querying it later.

Streaming costs more than it looks: always-on compute, state to checkpoint and restore, late data to reason about, and an on-call rotation for a job that never finishes. A common, sensible shape is both: the stream feeds the few things that need minutes, and the same events land in the raw store for the batch path, which remains the source of truth for anything that is reported, billed or paid.

## The Log

Every platform in this chapter is built on the same idea: an append-only, ordered log that consumers read at their own pace and can reread. Kafka's vocabulary is the common one.

- **Topics are partitioned.** A topic is "spread over a number of 'buckets' located on different Kafka brokers," so producers and consumers work in parallel ([Kafka: Introduction](https://kafka.apache.org/intro)).
- **The key picks the partition, and order holds within it.** "Events with the same event key (e.g., a customer or vehicle ID) are written to the same partition," and a consumer reads a partition's events "in exactly the same order as they were written." There is no order across partitions, which is the per-entity ordering rule from [Events](/docs/architecture/events#ordering).
- **Consumers keep their own position.** A consumer's position in a partition "is just a single integer, the offset of the next message to consume," so consumers can rewind and reprocess ([Kafka 4.0: Design](https://kafka.apache.org/40/design/design/)).
- **Consumer groups split the work.** Each partition is "consumed by exactly one consumer within each subscribing consumer group at any given time." Two groups (the fraud job and the warehouse loader) each read every event independently; within a group, a consumer beyond the partition count has nothing to read, so the partition count is your ceiling on parallelism. Choose it for the throughput you expect in a year, because with key hashing the key-to-partition mapping "will potentially be shuffled by adding partitions," and existing data isn't moved ([Kafka 4.0: Basic operations](https://kafka.apache.org/40/operations/basic-kafka-operations/)), so per-key order breaks across the change.
- **Reading doesn't delete.** "Unlike traditional messaging systems, events are not deleted after consumption." Retention is set per topic, by time or by size; the broker default `log.retention.hours` is 168, a week ([Kafka 4.0: Broker configs](https://kafka.apache.org/40/configuration/broker-configs/)).
- **Compaction keeps the latest value per key.** A compacted topic "will always retain at least the last known value for each message key," and "a message with a key and a null payload will be treated as a delete" (a tombstone). That makes a topic a changelog you can rebuild a table from: current account settings, current prices, current device assignments.

Retention is the replay window. If a stream job has a bug, you fix it and reprocess from an earlier offset, but only as far back as the topic still holds. Beyond that, replay comes from the raw store in the lake or warehouse, which is why every stream I run also lands in one.

## Choosing a Platform

| Platform | What it is | Worth knowing |
| --- | --- | --- |
| Apache Kafka | The reference log: partitions, consumer groups, retention and compaction | The largest ecosystem: Connect for sources and sinks, Kafka Streams, managed offerings on every cloud |
| Amazon Kinesis Data Streams | A managed stream of shards | Each shard takes up to 1,000 records or 1 MB per second of writes and 2 MB per second of reads; retention defaults to 24 hours and can be raised to 365 days at extra cost ([AWS: Key concepts](https://docs.aws.amazon.com/streams/latest/dev/key-concepts.html)) |
| Apache Pulsar | Brokers plus a separate storage layer | The broker is "a stateless component," and messages are stored on Apache BookKeeper; subscriptions can be exclusive, failover, shared or key-shared ([Pulsar: Architecture](https://pulsar.apache.org/docs/next/concepts-architecture-overview/); [Pulsar: Messaging](https://pulsar.apache.org/docs/next/concepts-messaging/)) |
| Redpanda | A Kafka-compatible broker | "Compatible with the Kafka API," written in C++, "packaged as a single binary" ([Redpanda](https://docs.redpanda.com/current/get-started/intro-to-events/)) |

My default is whichever managed service your cloud runs best, speaking the Kafka protocol where you can. The protocol is the durable choice: clients, connectors and stream processors written against it move between Kafka, its managed variants and Redpanda. Kinesis is a fine choice inside AWS when the volume is modest and nobody wants to operate anything, with two costs to note: shard limits are per shard, so a hot partition key throttles, and its default 24-hour retention is a short replay window unless you raise it. Pulsar earns its place when you need its subscription model (key-shared ordering across many consumers) or storage that scales separately from brokers.

Whatever you pick, a schema registry and the [schema evolution](/docs/architecture/events#schema-evolution) rules apply: additive changes only, consumers ignore unknown fields, and a breaking change is a new topic or event type.

## Stream Processors

A consumer that reads one event and writes one row needs no framework. The moment you count, join or aggregate across events, you need state, time and recovery, and a stream processor provides them.

- **Apache Flink** is a distributed engine for stateful streams, with event time, windows, keyed state and checkpoints at its core. It runs as its own cluster (or a managed service), and it's what I reach for when the job has large state or complex time logic.
- **Kafka Streams** is "a client library for processing and analyzing data stored in Kafka," embedded in an ordinary Java application with no cluster of its own ([Kafka Streams: Core concepts](https://kafka.apache.org/40/streams/core-concepts/)). It's the lightest option when input and output are both Kafka topics and your team already deploys JVM services.
- **Spark Structured Streaming** runs streaming queries on the DataFrame API, by default as a series of micro-batches ([Spark: Structured Streaming](https://spark.apache.org/docs/latest/streaming/apis-on-dataframes-and-datasets.html)). It fits teams that already run Spark for batch, because the same code and skills cover both.

Managed streaming SQL, warehouse-native streaming (materialized views over a stream) and real-time OLAP databases that ingest straight from a topic ([Real-Time Analytical Databases](/docs/data/analytical-databases)) cover a lot of simple aggregation now. Try them before standing up a cluster; move to a dedicated engine when state, joins or latency outgrow them.

## Event Time and Processing Time

Every stream event has two times. **Event time** is "the time that each individual event occurred on its producing device"; **processing time** is "the system time of the machine that is executing the respective operation" ([Flink: Timely stream processing](https://nightlies.apache.org/flink/flink-docs-stable/docs/concepts/time/)). The gap between them is ordinary: a phone that was offline in a subway, a game client that batches events for a minute, a technician's tablet that syncs when it gets signal, a retry after a broker failover.

Aggregate by processing time and the numbers depend on delivery, not on what happened: a backlog drained after an outage shows up as a spike that never occurred, and a replay produces different answers than the original run. Aggregate by event time and the numbers are reproducible, which is the same rule as partitioning batch data by event time in [Data Pipelines](/docs/architecture/data-pipelines#pipelines-must-be-replayable).

My rule: **event time for anything reported, processing time only for operational signals about the pipeline itself** (throughput, lag). The event's own timestamp is set by the producer in [RFC 3339](/docs/fundamentals/time) and travels in the envelope (`ce-time` in [CloudEvents](/docs/architecture/events#envelope-cloudevents-binary-mode)); the arrival time is recorded separately, never in place of it.

## Windows

A stream has no end, so "count the checkouts" needs a boundary. Aggregates on streams "are scoped by windows" ([Flink: Windows](https://nightlies.apache.org/flink/flink-docs-stable/docs/dev/datastream/operators/windows/)):

- **Tumbling** windows "have a fixed size and do not overlap": failed payments per minute, matches started per five minutes.
- **Sliding** windows have a fixed length and start at a fixed interval, so they overlap: "logins in the last ten minutes, updated every minute."
- **Session** windows have no fixed start and end and close after a gap of inactivity: a shopper's visit, a player's play session.

Windows are keyed like everything else: per merchant, per game server, per tenant. A global window over a whole stream is a single bottleneck, the stream version of global ordering.

## Watermarks and Late Data

If windows close by event time, the processor has to decide when a window is complete, knowing that more events for it may still be on their way. A **watermark** is that decision: it "declares that event time has reached" a given time, and elements that arrive after it are late ([Flink: Timely stream processing](https://nightlies.apache.org/flink/flink-docs-stable/docs/concepts/time/)). The watermark is usually "the latest event time seen, minus a delay you choose," and the delay is a trade between latency and completeness.

Spark documents the mechanics with a worked example: with `withWatermark("timestamp", "10 minutes")`, once the latest event time seen is 12:21 the watermark is 12:11, the state for the window 12:00 to 12:10 is cleared, and an event stamped 12:04 that arrives afterwards "is considered 'too late' and therefore ignored."

![Plan view of an event-time axis from 12:00 to 12:25. A ten-minute window W1 spans 12:00 to 12:10. The latest event time seen, E1, is 12:21; the watermark M1 sits at 12:11, ten minutes behind it (D1 = 10 minutes), so M1 = E1 - D1 has passed the window's end and the window is emitted and its state cleared. A late event stamped 12:04 arrives after that, falls inside the closed window, and is dropped or sent to a side output. A variable table defines W1, E1, D1 and M1.](/diagrams/dp-streaming-watermark.svg "The watermark trails the newest event time by a chosen delay. A window closes when the watermark passes its end, and anything for it that arrives later is late: dropped by default, or routed somewhere you can see it.")

The engines handle late data differently, and the defaults matter:

- **Flink:** allowed lateness "is set to `0`" by default, so late elements are dropped; `sideOutputLateData` gives you "a stream of the data that was discarded as late" ([Flink: Windows](https://nightlies.apache.org/flink/flink-docs-stable/docs/dev/datastream/operators/windows/)).
- **Kafka Streams:** a window's grace period "controls how long Kafka Streams will wait for out-of-order data records," and records after it are discarded for that window ([Kafka Streams: Core concepts](https://kafka.apache.org/40/streams/core-concepts/)).
- **Spark:** a watermark delay of two hours "guarantees that the engine will never drop any data that is less than 2 hours delayed," while later data "may or may not get aggregated."

```python
# Failed checkouts per merchant per minute, by event time, waiting up to 10 minutes for stragglers.
failed_per_minute = (
    checkout_events
    .where("status = 'failed'")
    .withWatermark("occurred_at", "10 minutes")
    .groupBy(window("occurred_at", "1 minute"), "merchant_id")
    .count()
)
```

How I set the delay: measure the real lateness distribution first (event time against arrival time, by client type), then pick the delay that covers the bulk of it for the latency the reader needs. Never drop late data silently. Route it to a side output or a late-events table, count it, and alert when the late share grows, because a sudden rise usually means a client release broke its clock or its batching. And keep the batch path as the reconciliation: the stream's per-minute count is the fast estimate, the nightly model over the raw store is the number of record.

## State

A count per merchant per minute, a running balance per account, a deduplication set of event IDs seen in the last hour: all state, held by the processor, keyed by the partition key so each instance owns a slice.

- **Flink** keeps the working copy of keyed state local to the task manager that owns the key, and snapshots it in checkpoints; checkpoints "can be incremental, and are optimized for being restored quickly," and the RocksDB state backend is the one that supports incremental snapshots ([Flink: Fault tolerance](https://nightlies.apache.org/flink/flink-docs-stable/docs/learn-flink/fault_tolerance/)).
- **Kafka Streams** keeps state stores in each task and uses the stream-table duality "to replicate its so-called state stores across machines for fault-tolerance."

Three habits keep state from becoming the incident:

- **Bound it.** Every piece of state needs an expiry: windows close, dedupe sets keep a fixed horizon, sessions time out. Unbounded state grows until restore takes an hour or the job runs out of disk.
- **Size the restore, not just the run.** Recovery time is the time to load the last checkpoint and replay from its offsets. Test it the way you test [backups](/docs/operations/disaster-recovery): by doing it.
- **Version the state with the code.** Changing a key or an aggregate's shape can make old checkpoints unreadable. Plan state migrations like schema migrations, or start the new version from a replay.

## Exactly-Once, as Each Documents It

"Exactly-once" means different things in different products, and the marketing version ("every event is processed exactly once") is none of them. Read each guarantee for what it covers:

- **Kafka** offers an idempotent producer, which "guarantees that resending will not result in duplicate entries in the log," and transactions that write to several partitions atomically. Consumers with `isolation.level=read_committed` see only committed transactions, so a job that reads from Kafka, processes and writes back to Kafka can be exactly-once end to end ([Kafka 4.0: Design](https://kafka.apache.org/40/design/design/)). The guarantee stops at Kafka's edge.
- **Flink** defines exactly-once as "every event will affect the state being managed by Flink exactly once," not that each event is processed once; after a failure, events are replayed from the last checkpoint. End to end, it requires that "your sources must be replayable" and "your sinks must be transactional (or idempotent)" ([Flink: Fault tolerance](https://nightlies.apache.org/flink/flink-docs-stable/docs/learn-flink/fault_tolerance/)).
- **Kafka Streams** is at-least-once by default; `processing.guarantee` set to `exactly_once_v2` turns on the transactional mode, and the first version of exactly-once is deprecated ([Kafka Streams: Core concepts](https://kafka.apache.org/40/streams/core-concepts/)).
- **Spark Structured Streaming** lists guarantees per sink: the file sink is exactly-once, the Kafka sink and `foreach` sink are at-least-once, and `foreachBatch` is at-least-once unless you use the batch ID it provides to deduplicate ([Spark: Structured Streaming](https://spark.apache.org/docs/latest/streaming/apis-on-dataframes-and-datasets.html)).

The common thread: the engine can make its own state exact, and the edges are your job. So I design every sink as if the stream were at-least-once, because somewhere it is: upserts keyed on the window and the key (`merchant_id`, `window_start_at`), writes that replace a partition, or a processed-ID table in the same transaction as the side effect, the same rules as [idempotent consumers](/docs/architecture/events#consumers-are-idempotent). Turn on the engine's transactional mode as well where it's cheap, but don't let a payout, an invoice or a ban depend on it alone.

## Operating Streams

- **Lag is the SLO.** How far behind the newest event each consumer group is, in time, not in messages. A fraud job five minutes behind is a fraud job that isn't working. Alert on lag, and on the watermark falling behind wall-clock time.
- **Plan replays before you need one.** Know your retention window, how to start a job from an earlier offset or timestamp, and where its output goes during a replay so it doesn't double-count into the live table.
- **Partition keys are a design decision.** Pick the key that the aggregation and the ordering need (account, merchant, match, vehicle), check its skew (one enormous merchant is one hot partition), and write it down.
- **Personal data streams too.** Topic retention and compaction are part of your [retention schedule](/docs/architecture/data-retention), and an erasure request has to reach a compacted topic (a tombstone for the key) and the raw store the stream lands in ([Data Governance & Access](/docs/data/data-governance)).
- **Costs run all day.** A streaming job is billed every hour whether or not anyone looks at its output; review each one against the decision it feeds ([Cost & FinOps](/docs/operations/cost-and-finops)).

## Checklist

- Is there a decision or a product feature that needs this answer in minutes? If not, batch.
- Does every event carry its own event time, separate from arrival time?
- Is the partition key chosen for ordering and aggregation, with its skew measured and the partition count sized for growth?
- Are windows, watermark delays and allowed lateness chosen from a measured lateness distribution, with late data counted and routed, never silently dropped?
- Is every piece of state bounded, checkpointed and restored in a drill?
- Is every sink idempotent, whatever the engine's exactly-once setting?
- Does the stream also land in the raw store, so the batch path can reconcile and rebuild?
- Are consumer lag and watermark delay on a dashboard, with alerts?

## References

**Reference**

- [Apache Kafka: Introduction](https://kafka.apache.org/intro), partitioned topics, same key to the same partition, per-partition order, per-topic retention, no deletion on consumption
- [Apache Kafka 4.0: Design](https://kafka.apache.org/40/design/design/), consumer offsets, consumer groups, log compaction and tombstones, idempotent producer, transactions and `read_committed`
- [Apache Kafka 4.0: Basic operations](https://kafka.apache.org/40/operations/basic-kafka-operations/), adding partitions shuffles the key-to-partition mapping and doesn't move existing data
- [Apache Kafka 4.0: Broker configs](https://kafka.apache.org/40/configuration/broker-configs/), `log.retention.hours` default of 168 and the `delete` cleanup policy
- [Apache Kafka 4.0: Kafka Streams core concepts](https://kafka.apache.org/40/streams/core-concepts/), the client library, event time, state stores, grace periods and `exactly_once_v2`
- [Amazon Kinesis Data Streams: Terminology and concepts](https://docs.aws.amazon.com/streams/latest/dev/key-concepts.html), shards and their limits, partition keys, retention from 24 hours to 365 days
- [Apache Pulsar: Architecture overview](https://pulsar.apache.org/docs/next/concepts-architecture-overview/), stateless brokers and BookKeeper storage
- [Apache Pulsar: Messaging](https://pulsar.apache.org/docs/next/concepts-messaging/), exclusive, failover, shared and key-shared subscriptions
- [Redpanda: Introduction](https://docs.redpanda.com/current/get-started/intro-to-events/), Kafka API compatibility, C++ and a single binary
- [Apache Flink: Timely stream processing](https://nightlies.apache.org/flink/flink-docs-stable/docs/concepts/time/), event time, processing time, watermarks and late elements
- [Apache Flink: Windows](https://nightlies.apache.org/flink/flink-docs-stable/docs/dev/datastream/operators/windows/), tumbling, sliding and session windows, allowed lateness of 0 by default, side outputs for late data
- [Apache Flink: Fault tolerance](https://nightlies.apache.org/flink/flink-docs-stable/docs/learn-flink/fault_tolerance/), checkpoints, state backends and end-to-end exactly-once requirements
- [Apache Spark: Structured Streaming programming guide](https://spark.apache.org/docs/latest/streaming/apis-on-dataframes-and-datasets.html), event-time windows, watermarks, and fault-tolerance guarantees per source and sink
