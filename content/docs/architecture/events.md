+++
title = "Events & Async Messaging"
description = "Publishing and consuming events reliably: the transactional outbox, idempotent consumers, partition keys for ordering, CloudEvents, and schema evolution."
category = "Architecture"
order = 402
tags = ["architecture", "events", "messaging", "cloudevents"]
aliases = ["events"]
+++

Events decouple services in time. The producer says what happened and moves on, and consumers react when they can, even if they were down when it happened. That's what makes asynchronous systems resilient, but only if publishing is reliable and consuming is safe to repeat. Get either wrong and you have a system that silently loses facts or applies them twice, which is worse than a synchronous call that at least fails loudly.

## Commands vs Events

| | Command | Event |
| --- | ------- | ----- |
| Says | "Do this" | "This happened" |
| Name | Imperative: `capture_payment` | Past tense: `payment.captured` |
| Receivers | Exactly one handler | Zero or more subscribers |
| Can be rejected | Yes | No, it already happened |

The distinction matters because the failure modes differ. A command that can't be executed should fail loudly to its sender. An event has no sender waiting; if a subscriber can't handle it, that's the subscriber's problem to retry. Disguising a command as an event ("`invoice.should_be_sent`") hides the failure: the producer believes the work is in hand, and nothing tells it otherwise.

## The Transactional Outbox

The classic bug is the dual write. The service updates its database, then publishes to the broker. If the process dies between the two, the database says the payment was captured and no other service ever hears about it. Reverse the order and you announce a capture that was then rolled back. No amount of retry logic fixes this, because the two writes go to two systems that can't commit together.

The [transactional outbox](https://microservices.io/patterns/data/transactional-outbox.html) turns two writes into one:

1. In the **same transaction** as the state change, insert the event into an `outbox_events` table.
2. A relay reads unpublished rows in order and publishes them to the broker.
3. After the broker acknowledges, the relay marks the row published.

```sql
BEGIN;
UPDATE payments SET status = 'captured' WHERE id = $1 AND status = 'authorized';
INSERT INTO outbox_events (id, type, subject, payload, created_at)
VALUES ($2, 'payment.captured', $1, $3, NOW());
COMMIT;
```

Now the event exists if and only if the capture committed. The relay can crash after publishing and before marking the row, so an event is occasionally published twice. That's the trade: the outbox converts "sometimes lost" into "sometimes duplicated", and duplicates are a problem consumers can solve. Lost events aren't.

A change-data-capture stream (Debezium reading the database's write-ahead log, for example) is an equivalent relay. It needs no polling and adds no load to the tables, at the cost of running and operating the CDC pipeline.

## Consumers Are Idempotent

Every broker worth using delivers **at least once**, because the only way to guarantee delivery over a network is to resend when unsure. Exactly-once delivery doesn't exist across a network; exactly-once **processing** does, and it's the consumer's job.

- **Dedupe by event ID.** Record processed IDs in the same transaction as the side effect, with a unique constraint. If the side effect commits, so does the record of it.
- **Or make the handler naturally idempotent.** "Set status to captured" is safe to repeat. "Add 100 to the balance" is not, and it's the kind of handler that looks fine in testing and double-credits in production.
- **Acknowledge after the work commits,** never before. Acknowledging first turns a crash mid-handler into a lost event.

See [Idempotency](/docs/payments/idempotency) for the same rule at the API boundary, and [Webhooks](/docs/payments/webhooks) for it across organizations.

## Ordering

Global ordering means a single sequence, which means a single consumer at a time: no parallelism, and one slow message blocks everything. It's almost never what you need. Order **per entity** instead.

- **Partition by the entity ID.** All events for one payment go to the same partition (Kafka) or message group (SQS FIFO), so they're consumed in order, while different payments are processed in parallel.
- **Don't assume order across entities.** Events for different payments interleave any way they like.
- **Carry a version.** Each event includes the entity's version number, and a consumer ignores anything older than what it already applied. Partitioning makes reordering rare; versions make it harmless, including after a replay.

## Envelope: CloudEvents, Binary Mode

Event metadata follows [CloudEvents 1.0](https://cloudevents.io/), using **binary content mode**: attributes travel as headers, and the body is the event payload itself.

Two reasons. First, a standard envelope means brokers, routers and tooling can filter and route on `type` or `source` without understanding every payload, and a consumer written against one producer understands the next. Second, binary mode keeps the body as the resource itself, with no `data` wrapper, the same rule as [API Design Principles](/docs/api-design/principles) and [Webhooks](/docs/payments/webhooks). CloudEvents' structured mode would nest the payload under `data`; binary mode doesn't.

```http
POST /events HTTP/1.1
ce-specversion: 1.0
ce-id: 0194a7f3-2b11-7e80-9c3d-4e8f1a2b5c70
ce-source: /payments
ce-type: payment.captured
ce-subject: 01932c6c-7616-7590-a8db-cb4b0e4d1c8a
ce-time: 2026-10-22T14:23:45Z
Content-Type: application/json

{
  "id": "01932c6c-7616-7590-a8db-cb4b0e4d1c8a",
  "status": "captured",
  "amount": 1999,
  "currency": "USD",
  "version": 4
}
```

Kafka and AMQP bindings map the same attributes to message headers. Event IDs are [UUID v7](/docs/fundamentals/identifier-conventions), times are [RFC 3339](/docs/fundamentals/time).

## Schema Evolution

Events outlive the code that produced them. They're replayed, archived and read by consumers you've never met, sometimes years later. An API response is consumed once; an event is a record.

- **Every event type has a schema** (JSON Schema, Avro or Protobuf) in a registry or the repository, checked in CI so a breaking change fails a build instead of a consumer.
- **Additive changes only.** New optional fields are fine. Removing, renaming or retyping a field is a new event type (`payment.captured.v2`), published alongside the old one until every consumer has moved.
- **Consumers ignore unknown fields.** That's the other half of the bargain, and what makes additive changes safe.

It's the same breaking-change discipline as [Versioning & Deprecation](/docs/api-design/versioning), applied to messages, with less room for error because you can't see who's listening.

## When Processing Fails

- **Retry with backoff** for transient failures. See [Retries & Timeouts](/docs/architecture/retries-and-timeouts).
- **Dead-letter after a limit.** A message that fails every time (a "poison message") would otherwise block its partition forever, and every event behind it for that entity. Move it to a [dead-letter queue](https://www.enterpriseintegrationpatterns.com/patterns/messaging/DeadLetterChannel.html) with the error attached, and let the rest flow.
- **Alert on dead letters, then replay deliberately** once the bug is fixed. A dead-letter queue nobody watches is just a slower way to lose data.
- **Watch consumer lag.** How far behind a consumer is matters more than how fast it is: a consumer an hour behind means customers see hour-old state. Lag belongs on the dashboard next to the [SLOs](/docs/operations/slos).

## References

**Specifications**

- [CloudEvents 1.0](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md), event attributes
- [CloudEvents HTTP Protocol Binding](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/bindings/http-protocol-binding.md), binary content mode with attributes as headers

**In practice**

- [microservices.io: Transactional Outbox](https://microservices.io/patterns/data/transactional-outbox.html), publishing events atomically with the state change
- [Enterprise Integration Patterns: Idempotent Receiver](https://www.enterpriseintegrationpatterns.com/patterns/messaging/IdempotentReceiver.html), consumers that tolerate duplicates
- [Enterprise Integration Patterns: Dead Letter Channel](https://www.enterpriseintegrationpatterns.com/patterns/messaging/DeadLetterChannel.html), where messages go when processing keeps failing
- [Martin Fowler: What do you mean by "Event-Driven"?](https://martinfowler.com/articles/201701-event-driven.html), commands vs events and event-carried state
- [Apache Kafka Documentation](https://kafka.apache.org/documentation/), partition keys and per-partition ordering
