+++
title = "Webhooks"
description = "Signed, at-least-once webhook delivery: payload shape, signature verification, retry schedule, and how consumers should dedupe and process events."
category = "API Design"
order = 209
tags = ["api", "webhooks", "events", "payments"]
aliases = ["webhooks", "payments/webhooks"]
+++

The [state machine](/docs/payments/payment-states) changes long after the API call that started it: a bank transfer settles days later, a dispute arrives weeks later, and a customer finishes 3-D Secure in a browser tab the client never sees. Webhooks are how those transitions reach the systems that need them, without polling. They're also an API you call, into servers you don't control, over a network that fails, and every rule below follows from that.

## Delivery Guarantees

- **At least once.** If a delivery times out, I can't know whether the receiver processed it, so I send it again, and consumers dedupe by event ID. At most once would mean a dropped event is simply lost, and for "payment succeeded" that's an order that never ships.
- **No ordering guarantee.** Retries and parallel delivery mean `payment.captured` can arrive before `payment.authorized`. Guaranteeing order would mean one event at a time per receiver, so one slow event blocks everything behind it. Consumers decide based on the object's state, not arrival order.
- **Retries until acknowledged,** or until the retry schedule runs out.

## Payload

Each event carries a **snapshot** of the resource as it was when the event happened. The resource sits under its own name, never a generic `data` wrapper, consistent with [API Design Principles](/docs/api-design/principles#bodies-carry-resources-headers-carry-metadata). [GitHub's webhooks](https://docs.github.com/en/webhooks/webhook-events-and-payloads) are shaped the same way.

```json
{
  "id": "0194a7f3-2b11-7e80-9c3d-4e8f1a2b5c70",
  "type": "payment.captured",
  "api_version": "2026-10-01",
  "created_at": "2026-10-22T14:23:45Z",
  "payment": {
    "id": "01932c6c-7616-7590-a8db-cb4b0e4d1c8a",
    "status": "captured",
    "amount": 1999,
    "currency": "USD"
  }
}
```

- `type` is `resource.event`, past tense: `payment.captured`, `refund.failed`. Past tense because it's a fact, not a request; see [Events & Async Messaging](/docs/architecture/events).
- The resource key matches the first part of `type`, and it's the same shape `GET /payments/{paymentId}` returns for the event's `api_version` ([Versioning & Deprecation](/docs/api-design/versioning)). A consumer reuses its existing types instead of learning a second schema. Events are never changed after they're created.
- A snapshot can be stale by the time it's processed. If the current state matters, fetch it. That's the only safe answer when events arrive out of order.
- New event types and new fields can be added at any time, so consumers ignore what they don't recognize.

## Signatures

A webhook endpoint is a public URL. Without a signature, anyone who finds it can post `payment.captured` and get goods shipped for free. Every delivery is signed using the [Standard Webhooks](https://www.standardwebhooks.com/) format, so receivers can verify it with an off-the-shelf library instead of hand-rolled crypto:

| Header | Description |
| ------ | ----------- |
| `Webhook-Id` | The event ID, stable across retries |
| `Webhook-Timestamp` | Unix seconds when this attempt was sent |
| `Webhook-Signature` | `v1,` + base64 [HMAC](https://datatracker.ietf.org/doc/html/rfc2104)-SHA256 of the signed content |

The signed content is `{Webhook-Id}.{Webhook-Timestamp}.{raw body}`. Each retry gets a new timestamp and signature.

### Verifying

1. **Use the raw request body.** Re-serialized JSON can change whitespace or key order and fail a valid signature, which tempts people to disable verification "temporarily".
2. **Compare in constant time.** An ordinary string comparison returns as soon as a byte differs, and that timing difference is enough to guess a signature one byte at a time.
3. **Reject timestamps more than 5 minutes from now.** The timestamp is inside the signature, so it can't be altered. Without a window, a captured request can be replayed forever. Five minutes tolerates realistic clock skew and queueing while keeping the replay window short. Keep the clock synced with NTP.
4. **Accept any of several signatures.** When a secret is rolled, the old one stays valid for **24 hours** and every delivery is signed with both, so the receiver can deploy the new secret without a gap. 24 hours is enough because the receiver is one system its owner can redeploy in a day.

```ts
const signed = `${id}.${timestamp}.${rawBody}`;
const expected = Buffer.from(
  `v1,${createHmac("sha256", secret).update(signed).digest("base64")}`,
);
const ok = header.split(" ").some((sig) => {
  const actual = Buffer.from(sig);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
});
```

## Retries

Only a `2xx` counts as delivered. Redirects, `4xx`, `5xx`, TLS errors and timeouts are all failures. A redirect counts as a failure because following one would send signed payment data to wherever a misconfigured or compromised endpoint points.

Failed deliveries retry with exponential backoff for **up to 3 days**:

| Attempt | Delay after previous |
| ------- | -------------------- |
| 1 | Immediately |
| 2 | 1 minute |
| 3 | 5 minutes |
| 4 | 30 minutes |
| 5 | 2 hours |
| 6 | 6 hours |
| 7 | 12 hours |
| 8 | 24 hours |
| 9 | 24 hours |

Early retries are close together because most failures are blips; later ones spread out so a receiver that's down isn't hammered while it recovers (the general case is in [Retries & Timeouts](/docs/architecture/retries-and-timeouts)). Three days survives an outage that starts Friday evening and gets fixed Monday morning, without delivering events so late they're useless. Stripe retries live events for up to three days as well.

After the last attempt the event is marked failed, the account owner is notified when an endpoint keeps failing, and a disabled endpoint gets no further retries.

## Consumer Expectations

1. **Verify the signature** before anything else, including parsing.
2. **Acknowledge fast.** Store the event and return `200`, then process it from a queue. If processing happens inside the request and takes longer than the timeout, the sender retries, and now you're processing it twice, concurrently.
3. **Dedupe by `Webhook-Id`.** A unique constraint on processed event IDs, written in the same transaction as the side effect, is the simplest correct version. See [Idempotency](/docs/payments/idempotency).
4. **Don't trust order.** Fetch the current object when the transition matters.
5. **Subscribe only to the event types you handle.** Every extra subscription is load and noise for nothing.
6. **Don't rely on webhooks alone.** Endpoints get misconfigured and secrets expire. A periodic job that lists recent objects catches anything a missed webhook would have told you.

## Replay

Events are retained for **30 days** and can be listed and redelivered within that window:

```http
GET /events?type=payment.captured&created_after=2026-10-21T00:00:00Z
POST /events/{eventId}/redeliver
```

Thirty days covers a consumer that discovers a bug at month-end close and needs to reprocess the month. Redelivery sends the same `Webhook-Id`, so a correct consumer treats anything it already processed as a no-op.

## References

**Specifications**

- [Standard Webhooks](https://www.standardwebhooks.com/), the header and signature format
- [RFC 2104: HMAC](https://datatracker.ietf.org/doc/html/rfc2104), keyed-hash signatures

**Reference**

- [Node.js: crypto.timingSafeEqual](https://nodejs.org/api/crypto.html), constant-time comparison

**In practice**

- [Stripe: Receive Stripe events in your webhook endpoint](https://docs.stripe.com/webhooks), three-day retries, a five-minute signature tolerance and a 24-hour secret rollover
- [GitHub: Validating webhook deliveries](https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries), HMAC verification
- [GitHub: Best practices for using webhooks](https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks), respond fast, process asynchronously
