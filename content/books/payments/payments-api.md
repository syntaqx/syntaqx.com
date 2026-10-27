+++
title = "Designing the Payments API"
nav_title = "The Payments API"
description = "The surface merchants integrate with: payment objects and intents, modifications, keys and the client, test mode, versioning, errors, events and platforms."
category = "Payments Industry"
order = 1417
part = "Taking Payments"
tags = ["payments", "api-design", "webhooks", "testing", "versioning", "sdk"]
+++

Onboarding decides who may take payments. Everything before it in this volume is machinery a merchant never sees: networks, rails and rules. What they see is an API, a set of client libraries, a dashboard and a stream of events, and the quality of those decides whether a provider gets integrated at all. The playbook's [API design principles](/docs/api-design/principles) apply in full; this chapter is what's particular to an API that moves money, drawn from how Adyen, Braintree, Checkout.com and Stripe have solved the same problems.

## The Objects

A payments API is a small set of nouns, each with its own lifecycle:

| Object | What it is |
| --- | --- |
| **Customer** | The payer, with their saved payment methods |
| **Payment method** | A tokenized instrument: a card, a bank account, a wallet. Never the raw number ([Running a Card Vault](/books/payments/card-vault)) |
| **Payment** (an "intent") | One attempt to collect an amount, from creation to success or failure, across however many steps it takes |
| **Setup** | Saving a payment method for later without charging it, under a mandate the customer agreed to |
| **Refund** | Money going back, with its own lifecycle, referencing the payment |
| **Dispute** | A chargeback against a payment, with deadlines and evidence |
| **Payout** | Money leaving a merchant's balance for their bank |
| **Balance transaction** | One line of the merchant's ledger: every movement in or out of their balance |
| **Event** | A record that something happened, delivered by webhook |
| **Account** | A merchant on a platform (the object [Merchant Onboarding](/books/payments/merchant-onboarding) builds), with its capabilities and requirements |

**Payments are intents because payments take steps.** Stripe's original Charges API made a payment one call: send a card, get a result. Strong Customer Authentication broke that: a payment might need the customer to authenticate with their bank in the middle, and a single call can't wait for a human. So Stripe deprecated Charges for creating payments in favor of the PaymentIntent, an object that lives across the whole attempt and moves through `requires_payment_method`, `requires_confirmation`, `requires_action`, `processing`, `requires_capture`, `canceled` and `succeeded`. A failed attempt goes back to `requires_payment_method` so the same intent can be retried with another card, and each attempt underneath it is still recorded. Any payment API that will meet [3-D Secure](/books/payments/strong-customer-authentication), redirects to banks or asynchronous methods needs the same shape.

**One online card payment, in order:** the merchant creates the payment; the risk check runs ([Fraud & Risk](/books/payments/fraud-and-risk)); 3-D Secure runs if the issuer or the rules ask ([SCA & 3-D Secure](/books/payments/strong-customer-authentication)); the authorization goes out; the merchant captures; events tell the merchant each step; settlement and the payout follow; and a dispute can arrive for months ([Disputes & Chargebacks](/books/payments/disputes-and-chargebacks)). [Payouts & Settlement](/books/payments/payouts-and-settlement#one-payment-traced) traces the same payment through every layer.

**The public states are not the internal ones.** Merchants need to know what they can do next; your system needs to know exactly where a payment is ([Payment States & Ledgers](/docs/payments/payment-states)). Map the internal machine, with its in-flight states and per-method finality, onto a smaller public one, and keep the mapping in one place. A merchant who sees `processing` doesn't need to know you're waiting on a processor timeout query.

## Waiting on the Customer

A payment that needs the customer mid-flight (a 3-D Secure challenge, a redirect to a bank, a wallet confirmation, a voucher to pay in a shop) is a real state, not a timeout: `requires_action` in the [payment state machine](/docs/payments/payment-states), carrying what the client has to do next.

```json
{
  "id": "01932c6c-7616-7590-a8db-cb4b0e4d1c8a",
  "status": "requires_action",
  "amount": 12000,
  "currency": "EUR",
  "next_action": {
    "type": "redirect",
    "redirect_url": "https://acs.example-bank.eu/challenge/9f2c",
    "return_url": "https://shop.example/checkout/complete",
    "expires_at": "2026-10-22T14:38:45Z"
  }
}
```

- **The server resumes; the client never decides.** After the step, the client tells the server to continue (or the server hears from the authentication provider or the bank), and the server moves the payment on. A return to `return_url` proves nothing by itself.
- **It expires.** A customer who walks away leaves the payment in `requires_action` forever unless it times out to a failure with a reason.
- **The response is `200` with a status, not an error.** Needing the customer is a normal outcome of a valid request; a `402` makes every client treat a recoverable step as a failure. Reserve `402` for real declines.
- **Webhooks report the transition,** so a client that loses its connection mid-step learns the outcome from the event, not the redirect ([Webhooks](/docs/api-design/webhooks)).

The `next_action` types are an open list: Stripe's include redirects, SDK-driven 3-D Secure, and displaying bank transfer instructions or a voucher. [SCA & 3-D Secure](/books/payments/strong-customer-authentication#modeling-the-extra-step-in-an-api) covers what the 3-D Secure step adds.

## Modifications Are Requests

After a payment is authorized, everything else is a request against it: capture (all or part), cancel before capture, refund after capture, and adjust the authorization amount. Adyen makes each a separate call with its own reference, with the outcome reported by webhook, and offers a fifth, **reversal**, for when the merchant isn't sure whether the payment was captured: it cancels or refunds, whichever applies. That's the honest model for an API sitting on networks that answer late.

**Void before capture, refund after.** Cancelling before capture (a void) releases the hold and never reaches the cardholder's statement; a refund after capture is a new credit, and most providers keep their fees on the original sale.

**A refund is a transaction of its own.** It isn't an undo. On a card it's a credit sent back through the network, which the issuer can decline if the card is closed, and it's funded from the merchant's balance, which may not cover it. So a refund has states (pending, succeeded, failed), a failure path that needs a person to choose another way to return the money, and a ledger entry against the merchant's balance that can take it negative ([Payouts & Settlement](/books/payments/payouts-and-settlement#negative-balances)). Refunds go back to the instrument that paid, which Visa's rules require where possible ([Payment States & Ledgers](/docs/payments/payment-states#append-only-records)), and on bank rails a refund is a new credit, not a reversal of the debit.

## Keys and the Client

A payments API has two kinds of caller, and they get different keys:

- **Publishable keys** go in browsers and apps. They can create tokens and confirm a payment the server already created, and nothing else: Stripe's can't create charges or read account data. Adyen's equivalent, the client key, identifies one API credential to its Web Components and isn't used for API requests at all, and it only works from the domains listed as that credential's allowed origins. Payabli splits its tokens the same way, public for embedded components and private for API calls.
- **Secret keys** stay on servers. The safer default is a **restricted key** per service, scoped to the resources it needs, read or write; as of October 2026, Stripe's docs recommend against unrestricted secret keys for new uses and suggest migrating existing ones to restricted keys. Limiting where a key works helps too: Stripe attaches access policies (IP ranges, networks, countries) to keys, and Payabli tokens take an IP allowlist.
- **A client secret** ties one browser session to one payment: the server creates the payment and hands the client a secret that lets it confirm that payment only, and it's never stored or logged.

The card number goes from the customer's device straight to the provider, through hosted fields or an SDK, and the merchant's server only handles the token. That's what keeps the merchant's [PCI scope](/docs/compliance/pci-dss) small, and it's why the client-side libraries are part of the API, not a convenience.

Key prefixes, show-once secrets and overlapping rotation follow [API Authentication](/docs/api-design/authentication#prefixes-say-what-a-key-is) and its [Rotation](/docs/api-design/authentication#rotation) section. The payments twist is the mode in the prefix (`pk_live_`, `sk_test_`), so a test key can never move money and a leaked live key is recognizable on sight.

## Test Mode

Merchants build against a test environment for weeks before they process a real payment, so test mode is a product, not a staging server.

- **Separate keys, separate data.** Test and live keys each see only their own objects, and nothing crosses between them. Card networks never see a test payment.
- **Magic inputs for every outcome.** Test card numbers that succeed, decline generically, decline for insufficient funds, require 3-D Secure every time or only off-session, open a fraud dispute, or raise an early fraud warning (an issuer's fraud report, [Fraud & Risk](/books/payments/fraud-and-risk#the-two-costs)). Stripe's list is the model; Adyen and Braintree publish their own. Disputes in test mode resolve by evidence values that win or lose on purpose.
- **Simulated time.** Subscriptions renew monthly and disputes take weeks, so test clocks advance a customer's time and run everything that would have happened.
- **Simulated events.** A command-line tool that triggers any event type against a local endpoint, so merchants can build their webhook handlers before the events would naturally occur.
- **Many sandboxes.** One per developer and one for CI, so tests don't trip over each other's data.

Build it as its own deployment of the same code: a separate ledger, processor adapters replaced by simulators that answer deterministically, and the same API, so a merchant switching keys changes nothing else. And tell merchants not to load-test against it; it isn't sized like production.

## Versioning

A payments API can't break integrations, because a broken integration stops a business taking money. Date-based versions pinned per account, with a per-request override, are the general strategy ([Versioning](/docs/api-design/versioning#why-dates)). What payments adds: **webhook endpoints are pinned to a version too**, because an event shaped for the wrong version is a payment the merchant's handler can't read. Stripe ships monthly versions without breaking changes and two named major releases a year that carry them, and pins each webhook endpoint's payload to a version; Adyen versions in the URL path (`/v{version}/payments`). Either way, upgrades are something the merchant does deliberately, endpoint by endpoint, with old and new running side by side.

## Errors, Lists and Limits

The general rules for [errors](/docs/requests/error-responses), [pagination](/docs/requests/pagination#cursors-by-default) and [rate limits](/docs/requests/rate-limiting) apply unchanged: one error shape with a request ID, cursors because payments arrive constantly, and a `429` that says which limit was hit. What a payments API adds:

- **A decline is not a bug.** Stripe returns HTTP 402 with a type (`card_error`), a code, the issuer's decline code, and advice on whether retrying could help. Merchants need all of it to decide between asking for another card and trying again tomorrow ([Stored Cards & Recurring Billing](/books/payments/stored-credentials#declines-and-the-rules-on-retrying)).
- **Idempotency is mandatory, and its window matters.** Every write accepts an idempotency key, and the stored result replays for retries ([Idempotency](/docs/payments/idempotency)). Providers keep keys for very different spans: 7 to 14 days on Adyen, 72 hours on Checkout.com, 2 minutes on Payabli, and at least 24 hours on Stripe's v1 API and 30 days on v2. Payabli's is optional, set in an `idempotencyKey` header on POST requests, and a repeat within its window returns `409 Conflict` rather than the original response, so a client that timed out finds the result by querying transactions instead. The window has to outlast the longest retry a client will make, and a key reused with different parameters is an error (Stripe returns `idempotency_error`), not a silent replay. An IETF draft standardizes the `Idempotency-Key` header; as of October 2026 it is still an Internet-Draft, at revision 08.
- **Metadata is the merchant's,** small and bounded (Stripe allows 50 keys, with names up to 40 characters and values up to 500), and never used for authorization decisions.
- **Rate limits protect the money path first.** Stripe allows 100 requests a second globally in live mode and says in a header whether a `429` came from a global, endpoint, concurrency or resource-specific limit, so a reporting script can't starve checkout. Payabli limits each API token (200 requests a minute, 3,000 per 15 minutes, 10,000 an hour) and times out writes after 30 seconds and reads after 90. It keeps a second kind of limit apart from these: per-merchant transaction and decline limits that are fraud controls, not capacity ([Card Testing](/books/payments/fraud-and-risk#card-testing)).

## Events

The API tells merchants what they asked for; events tell them what happened afterward, which in payments is most of it. Publish a catalog and keep it stable:

| Area | Events a merchant needs |
| --- | --- |
| Payments | created, requires action, authorized, captured, failed, canceled |
| Refunds | created, succeeded, failed |
| Disputes | opened (with the response deadline), updated, closed won or lost, funds withdrawn or reinstated |
| Payouts | created, paid, failed or returned |
| Accounts | updated, requirements due (with a deadline), capabilities changed |
| Payment methods | updated by an [account updater](/books/payments/stored-credentials#keeping-the-card-alive), mandate revoked |

**Missed events can be listed.** Webhooks fail; an events endpoint that returns recent events, filterable by type, lets a merchant catch up without a support ticket. Stripe's lists events going back 30 days; Payabli keeps notification logs that can be queried and retried by ID.

Delivery is at least once, unordered and signed, as [Webhooks](/docs/api-design/webhooks) describes. Providers differ most on how hard they try and how the receiver knows a delivery is genuine:

| Provider | Retries | Authenticating a delivery |
| --- | --- | --- |
| Adyen | A retry queue, retrying for up to 30 days | An HMAC signature on each notification |
| Payabli | 2 retries 5 minutes apart, then marked failed for manual retry from the portal or API | Custom headers the merchant configures (`webHeaderParameters`), such as an Authorization header, and fixed source IP addresses; its docs describe no payload signature |
| Stripe | Live-mode retries for up to three days | A signature header with a per-endpoint signing secret |

A short retry window moves the catch-up job to the receiver: with two retries over ten minutes, an outage of an hour loses events unless the receiver reconciles from a list endpoint or the provider's notification log. And a shared header proves only that the sender knew the header, not that the body wasn't changed, so where no signature is offered, treat the webhook as a prompt and fetch the object from the API before acting on it. Two newer choices are worth copying. **Thin events** carry only the event type and the object's ID, and the receiver fetches the current object, so payloads never go stale and don't depend on API version. **Event destinations** beyond webhooks, like a cloud event bus, suit merchants who'd rather not run a public endpoint.

## Acting for Platforms

When a platform calls the API for one of its merchants, the request says so: Payabli names the merchant's paypoint entrypoint in the path (`/api/Query/{resource}/{entry}`), and Stripe takes the merchant's account ID in a header alongside the platform's own key, rather than handing the platform a credential per merchant. Embedded dashboard components run on short-lived, single-use account sessions, so the platform's frontend never holds a long-lived merchant credential. Events from every connected merchant arrive at the platform's one endpoint, tagged with the merchant they belong to, which is the routing [Payments for Software Platforms](/books/payments/software-platforms#events-to-the-platform) depends on.

## SDKs, the Spec and Reports

- **Publish the OpenAPI specification,** and generate typed client libraries from it, so every language gets every field on the same day. Adyen and Stripe both publish theirs. The libraries pin the API version they were built for and follow semantic versioning, so a breaking API change is a major SDK release ([SDK Design](/docs/api-design/sdk-design#versioning)).
- **Reports are asynchronous jobs.** A merchant asks for a report over a period, the provider builds a file, and an event says it's ready to download ([Long-Running Operations](/docs/requests/long-running-operations)). The payout reconciliation report, every transaction behind every payout, is the one merchants ask for most. Watch units: APIs speak in minor units and many CSV reports in major units.

## How to Build It

The API surface adds keys, the next action on a waiting payment, idempotent replays and the event log, as deltas on [the core data model](/books/payments/card-payments#the-core-data-model):

```sql
CREATE TABLE api_keys (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id   UUID NOT NULL REFERENCES merchants (id),
  kind          TEXT NOT NULL,         -- publishable, secret, restricted
  livemode      BOOLEAN NOT NULL,
  prefix        TEXT NOT NULL,         -- pk_live_, rk_test_, shown in logs
  secret_hash   TEXT NOT NULL,         -- never the key itself
  permissions   JSONB,                 -- restricted keys only
  expires_at    TIMESTAMPTZ,           -- set when rotated, for the overlap
  last_used_at  TIMESTAMPTZ
);

ALTER TABLE payments
  ADD COLUMN next_action        JSONB,        -- set only in requires_action
  ADD COLUMN action_expires_at  TIMESTAMPTZ,
  ADD COLUMN api_version        TEXT NOT NULL;

CREATE TABLE idempotency_records (
  merchant_id     UUID NOT NULL REFERENCES merchants (id),
  key             TEXT NOT NULL,
  request_hash    TEXT NOT NULL,       -- same key, different body is an error
  response_status INT,
  response_body   JSONB,
  expires_at      TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (merchant_id, key)
);

CREATE TABLE events (
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id  UUID NOT NULL REFERENCES merchants (id),
  type         TEXT NOT NULL,          -- payment.captured, dispute.created
  object_type  TEXT NOT NULL,
  object_id    UUID NOT NULL,
  api_version  TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL
);

CREATE TABLE webhook_deliveries (
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  event_id     UUID NOT NULL REFERENCES events (id),
  endpoint_id  UUID NOT NULL,
  attempt      INT NOT NULL,
  status_code  INT,
  next_retry_at TIMESTAMPTZ
);
```

Write the event row in the same transaction as the state change it reports, and deliver from the table, so an event is never announced for a change that rolled back.

## Auditing

API records are evidence when a merchant says "we never sent that refund", when a key leaks, and when a payment's history has to be explained to an issuer or a regulator. The general design is in [Audit Trails](/docs/architecture/audit-trails); for the API, make sure the record shows:

- **Which key made every write,** by key ID and prefix, never the secret, with the request ID and source IP, so a leaked key's actions can be listed and reversed.
- **Key lifecycle:** creation, scope changes, rotation and revocation, with the person who did each ([Typed Actors](/docs/architecture/audit-trails#typed-actors)).
- **Requests made on a merchant's behalf,** with the platform and the merchant account both recorded, since either can be asked.
- **Every webhook delivery attempt** and its response code, so "we never got the event" has an answer.
- **Who in support viewed or acted on a merchant's account** ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).

## What This Means for the System You Build

- **Intents for payments, separate objects for refunds, disputes and payouts,** and a public state machine mapped from the internal one.
- **`requires_action` as a real, expiring state** with a typed next action, resumed by the server and confirmed by webhook.
- **Modifications as requests with asynchronous results,** and refunds as transactions that can fail and take a balance negative.
- **Publishable, restricted and secret keys,** client secrets per payment, and card data that never touches the merchant's server.
- **A real test mode:** separate data, magic inputs for every outcome, test clocks, triggered events.
- **Date-pinned versions for requests and webhook endpoints,** with deliberate, side-by-side upgrades.
- **Errors with decline codes and advice,** and mandatory idempotency with a window longer than any retry.
- **A stable, signed event catalog,** written with the change it reports, and a published spec that generates the SDKs.

## References

**Specifications**

- [IETF: The Idempotency-Key HTTP Header Field (draft)](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/), the header, its status codes, and its status as an Internet-Draft (revision 08, October 22, 2026)
- [Standard Webhooks](https://github.com/standard-webhooks/standard-webhooks/blob/main/spec/standard-webhooks.md), signed, versioned webhook delivery

**In practice**

- [Stripe: The PaymentIntent object](https://docs.stripe.com/api/payment_intents/object), statuses, capture methods, the client secret and `next_action` types
- [Stripe: Migrating from the Charges API](https://docs.stripe.com/payments/payment-intents/migration/charges), why intents replaced single-call charges
- [Adyen: Modify payments](https://docs.adyen.com/online-payments/modify-payments), capture, cancel, refund, reversal and authorization adjustment as separate requests
- [Braintree: Transaction statuses](https://developer.paypal.com/braintree/docs/reference/general/statuses), a transaction's lifecycle through settlement
- [Stripe: API keys](https://docs.stripe.com/keys), publishable, secret and restricted keys, prefixes, rotation, access policies, and the recommendation against secret keys for new uses
- [Adyen: Client-side authentication](https://docs.adyen.com/development-resources/client-side-authentication), the client key, which isn't used for API requests, and allowed origins
- [Payabli: API tokens](https://docs.payabli.com/developers/api-tokens), public tokens for components, private tokens for the API, and IP allowlists
- [Stripe: Testing](https://docs.stripe.com/testing), test cards for declines, authentication and disputes
- [Adyen: Test card numbers](https://docs.adyen.com/development-resources/test-cards-and-credentials/test-card-numbers), test cards per brand and outcome
- [Braintree: Testing and going live](https://developer.paypal.com/braintree/docs/reference/general/testing), sandbox card numbers and amounts that trigger declines
- [Stripe: Test clocks](https://docs.stripe.com/billing/testing/test-clocks/api-advanced-usage), simulated time for subscriptions
- [Stripe: Sandboxes](https://docs.stripe.com/sandboxes), isolated test environments
- [Stripe: Versioning](https://docs.stripe.com/api/versioning), date-based versions, monthly releases and twice-yearly majors
- [Adyen: API versioning](https://docs.adyen.com/development-resources/versioning), versions in the URL path
- [Stripe: Idempotent requests](https://docs.stripe.com/api/idempotent_requests), key storage and replay, including errors
- [Stripe: API v2 overview](https://docs.stripe.com/api-v2-overview), idempotent replay within 30 days on v2
- [Adyen: API idempotency](https://docs.adyen.com/development-resources/api-idempotency), keys kept 7 to 14 days
- [Checkout.com: Idempotency](https://www.checkout.com/docs/developer-resources/api/idempotency), keys kept 72 hours
- [Payabli: API overview](https://docs.payabli.com/developers/api-reference/api-overview), the optional `idempotencyKey` header kept 2 minutes with `409 Conflict` on reuse, per-token request limits and request timeouts
- [Stripe: Errors](https://docs.stripe.com/api/errors), error types, decline codes and advice codes
- [Stripe: Rate limits](https://docs.stripe.com/rate-limits), global and per-endpoint limits and why a request was limited
- [Stripe: Metadata](https://docs.stripe.com/api/metadata), 50 keys, 40-character key names and 500-character values
- [Stripe: Receive events in your webhook endpoint](https://docs.stripe.com/webhooks), live-mode retries for up to three days, signed deliveries and versioned event payloads
- [Stripe: List all events](https://docs.stripe.com/api/events/list), events listable going back 30 days
- [Adyen: Troubleshoot webhooks](https://docs.adyen.com/development-resources/webhooks/troubleshoot/), the retry queue and retries for up to 30 days
- [Adyen: Verify HMAC signatures](https://docs.adyen.com/development-resources/webhooks/secure-webhooks/verify-hmac-signatures), HMAC-signed notifications
- [Payabli: Webhooks and notifications](https://docs.payabli.com/guides/pay-ops-notifications-webhooks-overview), queueing within 5 minutes, 2 retries at 5-minute intervals, manual retry, custom headers through `webHeaderParameters`, and source IP addresses
- [Payabli: API conventions](https://docs.payabli.com/guides/platform-api-conventions-reference), the merchant's entrypoint in the request path
- [Stripe: Event destinations](https://docs.stripe.com/event-destinations), thin and snapshot events and non-webhook destinations
- [Stripe: Connect authentication](https://docs.stripe.com/connect/authentication), acting on behalf of connected accounts
- [Stripe: OpenAPI specification](https://github.com/stripe/openapi), the published spec behind the SDKs
- [Stripe: Reporting API](https://docs.stripe.com/reports/api), asynchronous report runs
