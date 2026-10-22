+++
title = "Webhooks"
description = "Signed, at-least-once webhook delivery: payload shape, signature verification, retry schedule, and how consumers should dedupe and process events."
category = "Payments"
order = 7.3
tags = ["api", "webhooks", "events", "payments"]
+++

Webhooks tell you that something happened without polling. They follow the [Standard Webhooks](https://www.standardwebhooks.com/) spec, so any compliant library can verify them.

## Delivery Guarantees

- **At least once.** The same event can arrive more than once. Dedupe by event ID.
- **No ordering guarantee.** `payment.captured` can arrive before `payment.authorized`. Use the object's `status` and timestamps, not arrival order.
- **Retries until acknowledged** or the retry schedule runs out.

## Payload

Events are **thin**: they say what happened and which object, plus a snapshot of it at the time.

```json
{
  "id": "evt_01J9Z8K3V7Q4N2M6X5R8T0B1C3",
  "type": "payment.captured",
  "created_at": "2026-10-22T14:23:45Z",
  "data": {
    "id": "01J9Z8K3V7Q4N2M6X5R8T0B1C3",
    "status": "captured",
    "amount": 1999,
    "currency": "USD"
  }
}
```

- `type` is `resource.event`, past tense: `payment.captured`, `refund.failed`.
- `data` is the object as of the event. If you need the current state, fetch it. That's the only safe answer when events arrive out of order.
- New event types and new fields can be added at any time. See [Versioning & Deprecation](/docs/versioning).

## Signatures

Every delivery carries three headers:

| Header | Description |
| ------ | ----------- |
| `webhook-id` | The event ID, stable across retries |
| `webhook-timestamp` | Unix seconds when this attempt was sent |
| `webhook-signature` | `v1,` + base64 HMAC-SHA256 of the signed content |

The signed content is `{webhook-id}.{webhook-timestamp}.{raw body}`.

### Verifying

1. Use the **raw request body**. Don't parse and re-serialize JSON first.
2. Compute the HMAC with your endpoint's secret and compare with a **constant-time** comparison.
3. Reject timestamps more than **5 minutes** from now, so a captured request can't be replayed later.
4. The header can list several signatures (space separated) during secret rotation. Accept if any match.

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

Any response other than `2xx` within **15 seconds** counts as a failure, and the event is retried with exponential backoff and jitter:

| Attempt | Delay after previous |
| ------- | -------------------- |
| 1 | Immediately |
| 2 | 1 minute |
| 3 | 5 minutes |
| 4 | 30 minutes |
| 5 | 2 hours |
| 6 | 8 hours |
| 7 | 24 hours |

After the last attempt the event is marked failed. An endpoint that fails continuously for several days is disabled, and the account owner is notified.

## Consumer Expectations

1. **Verify the signature** before anything else.
2. **Acknowledge fast.** Store the event and return `200`, then process it asynchronously. Slow work causes timeouts, and timeouts cause duplicate deliveries.
3. **Dedupe by `webhook-id`.** A unique constraint on processed event IDs is the simplest version. See [Idempotency](/docs/idempotency).
4. **Don't trust order.** Fetch the current object when the transition matters.
5. **Don't rely on webhooks alone.** Run a periodic job that lists recent objects and catches anything a missed webhook would have told you.

## Replay

Every event is retained for 30 days and can be listed and redelivered:

```http
GET /events?type=payment.captured&created_after=2026-10-21T00:00:00Z
POST /events/{id}/redeliver
```

Redelivery sends the same `webhook-id`, so a correct consumer handles it as a no-op if it already processed it.
