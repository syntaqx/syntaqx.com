+++
title = "Webhooks"
description = "Signed, at-least-once webhook delivery: payload shape, signature verification, retry schedule, and how consumers should dedupe and process events."
category = "Payments"
order = 7.3
tags = ["api", "webhooks", "events", "payments"]
+++

Webhooks tell you that something happened without polling. Signatures follow the [Standard Webhooks](https://www.standardwebhooks.com/) spec, so any compliant library can verify them, and delivery behaves like [Stripe's](https://docs.stripe.com/webhooks).

## Delivery Guarantees

- **At least once.** The same event can arrive more than once. Dedupe by event ID.
- **No ordering guarantee.** `payment.captured` can arrive before `payment.authorized`. Don't use arrival order or `created_at` to decide what happened first.
- **Retries until acknowledged** or the retry schedule runs out.

## Payload

Each event carries a **snapshot** of the resource as it was when the event happened. Like [GitHub's webhooks](https://docs.github.com/en/webhooks/webhook-events-and-payloads), the resource sits under its own name, never under a generic `data` wrapper (see [API Design Principles](/docs/api-design-principles#response-format)).

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

- `type` is `resource.event`, past tense: `payment.captured`, `refund.failed`.
- The resource key matches the first part of `type`: `payment` for `payment.*`, `refund` for `refund.*`. It's the same shape `GET /payments/{paymentId}` returns, for the event's `api_version` (see [Versioning & Deprecation](/docs/versioning)). Events are never changed after they're created.
- If you need the current state, fetch it. That's the only safe answer when events arrive out of order.
- New event types and new fields can be added at any time.

## Signatures

Every delivery carries three headers:

| Header | Description |
| ------ | ----------- |
| `Webhook-Id` | The event ID, stable across retries |
| `Webhook-Timestamp` | Unix seconds when this attempt was sent |
| `Webhook-Signature` | `v1,` + base64 HMAC-SHA256 of the signed content |

The signed content is `{Webhook-Id}.{Webhook-Timestamp}.{raw body}`. Each retry gets a new timestamp and signature.

### Verifying

1. Use the **raw request body**. Don't parse and re-serialize JSON first.
2. Compute the HMAC with your endpoint's secret and compare with a **constant-time** comparison.
3. Reject timestamps more than **5 minutes** from now, so a captured request can't be replayed later. Keep your clock synced with NTP.
4. The header can list several signatures (space separated). When a secret is rolled, the old one stays valid for up to **24 hours** and every delivery is signed with both. Accept if any match.

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

Only a `2xx` counts as delivered. Redirects, `4xx`, `5xx`, TLS errors and timeouts are all failures, and the event is retried with exponential backoff for **up to 3 days**:

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

After the last attempt the event is marked failed. The account owner is notified when an endpoint keeps failing, and a disabled endpoint gets no further retries.

## Consumer Expectations

1. **Verify the signature** before anything else.
2. **Acknowledge fast.** Store the event and return `200`, then process it from a queue. Slow work causes timeouts, and timeouts cause duplicate deliveries.
3. **Dedupe by `Webhook-Id`.** A unique constraint on processed event IDs is the simplest version. See [Idempotency](/docs/idempotency).
4. **Don't trust order.** Fetch the current object when the transition matters.
5. **Subscribe only to the event types you handle.**
6. **Don't rely on webhooks alone.** Run a periodic job that lists recent objects and catches anything a missed webhook would have told you.

## Replay

Events are retained for **30 days** and can be listed and redelivered within that window:

```http
GET /events?type=payment.captured&created_after=2026-10-21T00:00:00Z
POST /events/{eventId}/redeliver
```

Redelivery sends the same `Webhook-Id`, so a correct consumer handles it as a no-op if it already processed it.
