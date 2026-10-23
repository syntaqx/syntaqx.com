+++
title = "Designing the Payments API"
nav_title = "The Payments API"
description = "The surface merchants integrate with: payment objects and intents, modifications, keys and the client, test mode, versioning, errors, events and platforms."
category = "Payments Industry"
order = 1413
part = "Taking Payments"
tags = ["payments", "api-design", "webhooks", "testing", "versioning", "sdk"]
+++

Onboarding decides who may take payments. Everything before it in this volume is machinery a merchant never sees: networks, rails and rules. What they see is an API, a set of client libraries, a dashboard and a stream of events, and the quality of those decides whether a provider gets integrated at all. The playbook's [API design principles](/docs/api-design/principles) apply in full; this chapter is what's particular to an API that moves money, drawn from how Stripe, Adyen, Braintree and Payabli have solved the same problems.

## The Objects

A payments API is a small set of nouns, each with its own lifecycle:

| Object | What it is |
| --- | --- |
| **Customer** | The payer, with their saved payment methods |
| **Payment method** | A tokenized instrument: a card, a bank account, a wallet. Never the raw number ([Running a Card Vault](/docs/industries/payments/card-vault)) |
| **Payment** (an "intent") | One attempt to collect an amount, from creation to success or failure, across however many steps it takes |
| **Setup** | Saving a payment method for later without charging it, under a mandate the customer agreed to |
| **Refund** | Money going back, with its own lifecycle, referencing the payment |
| **Dispute** | A chargeback against a payment, with deadlines and evidence |
| **Payout** | Money leaving a merchant's balance for their bank |
| **Balance transaction** | One line of the merchant's ledger: every movement in or out of their balance |
| **Event** | A record that something happened, delivered by webhook |
| **Account** | A merchant on a platform (the object [Merchant Onboarding](/docs/industries/payments/merchant-onboarding) builds), with its capabilities and requirements |

**Payments are intents because payments take steps.** Stripe's original Charges API made a payment one call: send a card, get a result. Strong Customer Authentication broke that: a payment might need the customer to authenticate with their bank in the middle, and a single call can't wait for a human. So Stripe deprecated Charges for creating payments in favor of the PaymentIntent, an object that lives across the whole attempt and moves through `requires_payment_method`, `requires_confirmation`, `requires_action`, `processing`, `requires_capture`, `canceled` and `succeeded`. A failed attempt goes back to `requires_payment_method` so the same intent can be retried with another card, and each attempt underneath it is still recorded. Any payment API that will meet [3-D Secure](/docs/industries/payments/strong-customer-authentication), redirects to banks or asynchronous methods needs the same shape.

**One online card payment, in order:** the merchant creates the payment; the risk check runs ([Fraud & Risk](/docs/industries/payments/fraud-and-risk)); 3-D Secure runs if the issuer or the rules ask ([SCA & 3-D Secure](/docs/industries/payments/strong-customer-authentication)); the authorization goes out; the merchant captures; events tell the merchant each step; settlement and the payout follow; and a dispute can arrive for months ([Disputes & Chargebacks](/docs/industries/payments/disputes-and-chargebacks)). [Payouts & Settlement](/docs/industries/payments/payouts-and-settlement#one-payment-traced) traces the same payment through every layer.

**The public states are not the internal ones.** Merchants need to know what they can do next; your system needs to know exactly where a payment is ([Payment States & Ledgers](/docs/payments/payment-states)). Map the internal machine, with its in-flight states and per-method finality, onto a smaller public one, and keep the mapping in one place. A merchant who sees `processing` doesn't need to know you're waiting on a processor timeout query.

## Modifications Are Requests

After a payment is authorized, everything else is a request against it: capture (all or part), cancel before capture, refund after capture, and adjust the authorization amount. Adyen makes each a separate call with its own reference, with the outcome reported by webhook, and offers a fifth, **reversal**, for when the merchant isn't sure whether the payment was captured: it cancels or refunds, whichever applies. That's the honest model for an API sitting on networks that answer late.

**Void before capture, refund after.** Cancelling before capture (a void) releases the hold and never reaches the cardholder's statement; a refund after capture is a new credit, and most providers keep their fees on the original sale.

**A refund is a transaction of its own.** It isn't an undo. On a card it's a credit sent back through the network, which the issuer can decline if the card is closed, and it's funded from the merchant's balance, which may not cover it. So a refund has states (pending, succeeded, failed), a failure path that needs a person to choose another way to return the money, and a ledger entry against the merchant's balance that can take it negative ([Payouts & Settlement](/docs/industries/payments/payouts-and-settlement#negative-balances)). Refunds go back to the instrument that paid, which Visa's rules require where possible ([Payment States & Ledgers](/docs/payments/payment-states#append-only-records)), and on bank rails a refund is a new credit, not a reversal of the debit.

## Keys and the Client

A payments API has two kinds of caller, and they get different keys:

- **Publishable keys** go in browsers and apps. They can create tokens and confirm a payment the server already created, and nothing else: Stripe's can't create charges or read account data.
- **Secret keys** stay on servers. The safer default is a **restricted key** per service, scoped to the resources it needs, read or write; Stripe now recommends restricted keys over unrestricted secret keys for new uses.
- **A client secret** ties one browser session to one payment: the server creates the payment and hands the client a secret that lets it confirm that payment only, and it's never stored or logged.

The card number goes from the customer's device straight to the provider, through hosted fields or an SDK, and the merchant's server only handles the token. That's what keeps the merchant's [PCI scope](/docs/compliance/pci-dss) small, and it's why the client-side libraries are part of the API, not a convenience.

**Keys need a lifecycle.** Prefix them by kind and mode (`pk_live_`, `sk_test_`) so a leaked key is recognizable, show live secrets once at creation, let a rotated key overlap its replacement for a few days (Stripe allows up to seven) so deploys can catch up, and let merchants restrict keys by IP range. [API Authentication](/docs/api-design/authentication) covers the general case.

## Test Mode

Merchants build against a test environment for weeks before they process a real payment, so test mode is a product, not a staging server.

- **Separate keys, separate data.** Test and live keys each see only their own objects, and nothing crosses between them. Card networks never see a test payment.
- **Magic inputs for every outcome.** Test card numbers that succeed, decline generically, decline for insufficient funds, require 3-D Secure every time or only off-session, open a fraud dispute, or raise an early fraud warning (an issuer's fraud report, [Fraud & Risk](/docs/industries/payments/fraud-and-risk#the-two-costs)). Stripe's list is the model; Adyen and Payabli publish their own. Disputes in test mode resolve by evidence values that win or lose on purpose.
- **Simulated time.** Subscriptions renew monthly and disputes take weeks, so test clocks advance a customer's time and run everything that would have happened.
- **Simulated events.** A command-line tool that triggers any event type against a local endpoint, so merchants can build their webhook handlers before the events would naturally occur.
- **Many sandboxes.** One per developer and one for CI, so tests don't trip over each other's data.

Build it as its own deployment of the same code: a separate ledger, processor adapters replaced by simulators that answer deterministically, and the same API, so a merchant switching keys changes nothing else. And tell merchants not to load-test against it; it isn't sized like production.

## Versioning

A payments API can't break integrations, because a broken integration stops a business taking money. The pattern that works is **date-based versions pinned per account**: a merchant's requests run on the version they integrated against until they choose to upgrade, a header (`Stripe-Version`) overrides it per request, and webhook endpoints are pinned to a version when they're created. Stripe now ships monthly versions with no breaking changes and two named major releases a year, which are the only ones with breaking changes; Adyen versions in the URL path (`/v68/payments`, for one). Either way, upgrades are something the merchant does deliberately, endpoint by endpoint, with the old and new versions running side by side. [Versioning](/docs/api-design/versioning) covers the general strategy.

## Errors, Lists and Limits

- **Errors say what to do next.** A decline is not a bug: Stripe returns HTTP 402 with a type (`card_error`), a code, the issuer's decline code, and advice on whether retrying could help. Merchants need all of it to decide between asking for another card and trying again tomorrow ([Stored Cards & Recurring Billing](/docs/industries/payments/stored-credentials#declines-and-the-rules-on-retrying)). Every response carries a request ID support can look up ([Errors](/docs/requests/error-responses)).
- **Idempotency is mandatory, and its window matters.** Every write accepts an idempotency key, and the stored result replays for retries ([Idempotency](/docs/payments/idempotency)). Providers keep keys for very different spans: at least 24 hours on Stripe's v1 API and 30 days on v2, 7 to 14 days on Adyen, 72 hours on Checkout.com. The window has to outlast the longest retry a client will make, and a key reused with different parameters is an error (Stripe returns `idempotency_error`), not a silent replay. An IETF draft standardizes the `Idempotency-Key` header but isn't an RFC yet.
- **Lists use cursors,** not page numbers, because payments arrive constantly ([Pagination](/docs/requests/pagination)). Related objects expand on request instead of always being embedded.
- **Metadata is the merchant's,** small and bounded (Stripe allows 50 keys of 500 characters), and never used for authorization decisions.
- **Rate limits say why.** Stripe allows 100 requests a second globally in live mode and tells you, in a header, whether a 429 came from a global, endpoint, concurrency or resource-specific limit ([Rate Limiting](/docs/requests/rate-limiting)).

## Events

The API tells merchants what they asked for; events tell them what happened afterward, which in payments is most of it. Publish a catalog and keep it stable:

| Area | Events a merchant needs |
| --- | --- |
| Payments | created, requires action, authorized, captured, failed, canceled |
| Refunds | created, succeeded, failed |
| Disputes | opened (with the response deadline), updated, closed won or lost, funds withdrawn or reinstated |
| Payouts | created, paid, failed or returned |
| Accounts | updated, requirements due (with a deadline), capabilities changed |
| Payment methods | updated by an [account updater](/docs/industries/payments/stored-credentials#keeping-the-card-alive), mandate revoked |

**Missed events can be listed.** Webhooks fail; an events endpoint that returns recent events, filterable by type, lets a merchant catch up without a support ticket (Stripe keeps full event payloads for 30 days).

Delivery is at least once, unordered and signed, as [Webhooks](/docs/payments/webhooks) describes: Stripe retries for up to three days, Adyen for much longer, and both sign every delivery. Two newer choices are worth copying. **Thin events** carry only the event type and the object's ID, and the receiver fetches the current object, so payloads never go stale and don't depend on API version. **Event destinations** beyond webhooks, like a cloud event bus, suit merchants who'd rather not run a public endpoint.

## Acting for Platforms

When a platform calls the API for one of its merchants, the request says so: Stripe takes the merchant's account ID in a header alongside the platform's own key, rather than handing the platform a credential per merchant. Embedded dashboard components run on short-lived, single-use account sessions, so the platform's frontend never holds a long-lived merchant credential. Events from every connected merchant arrive at the platform's one endpoint, tagged with the merchant they belong to, which is the routing [Payments for Software Platforms](/docs/industries/payments/software-platforms#events-to-the-platform) depends on.

## SDKs, the Spec and Reports

- **Publish the OpenAPI specification,** and generate typed client libraries from it, so every language gets every field on the same day. Stripe and Adyen both publish theirs. The libraries pin the API version they were built for and follow semantic versioning, so a breaking API change is a major SDK release.
- **Reports are asynchronous jobs.** A merchant asks for a report over a period, the provider builds a file, and an event says it's ready to download. The payout reconciliation report, every transaction behind every payout, is the one merchants ask for most. Watch units: APIs speak in minor units and many CSV reports in major units.

## What This Means for the System You Build

- **Intents for payments, separate objects for refunds, disputes and payouts,** and a public state machine mapped from the internal one.
- **Modifications as requests with asynchronous results,** and refunds as transactions that can fail and take a balance negative.
- **Publishable, restricted and secret keys,** client secrets per payment, and card data that never touches the merchant's server.
- **A real test mode:** separate data, magic inputs for every outcome, test clocks, triggered events.
- **Date-pinned versions,** with deliberate, side-by-side upgrades.
- **Errors with decline codes and advice,** mandatory idempotency with a window longer than any retry, cursors, and rate limits that explain themselves.
- **A stable, signed event catalog,** and a published spec that generates the SDKs.

## References

**Reference**

- [IETF: The Idempotency-Key HTTP Header Field (draft)](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/), the header, its status codes, and its status as an Internet-Draft
- [Standard Webhooks](https://github.com/standard-webhooks/standard-webhooks/blob/main/spec/standard-webhooks.md), signed, versioned webhook delivery

**In practice**

- [Stripe: The PaymentIntent object](https://docs.stripe.com/api/payment_intents/object), statuses, capture methods and the client secret
- [Stripe: Migrating from the Charges API](https://docs.stripe.com/payments/payment-intents/migration/charges), why intents replaced single-call charges
- [Adyen: Modify payments](https://docs.adyen.com/online-payments/modify-payments), capture, cancel, refund, reversal and authorization adjustment as separate requests
- [Braintree: Transaction statuses](https://developer.paypal.com/braintree/docs/reference/general/statuses), a transaction's lifecycle through settlement
- [Stripe: API keys](https://docs.stripe.com/keys), publishable, secret and restricted keys, prefixes and rotation
- [Stripe: Testing](https://docs.stripe.com/testing), test cards for declines, authentication and disputes
- [Stripe: Test clocks](https://docs.stripe.com/billing/testing/test-clocks/api-advanced-usage), simulated time for subscriptions
- [Stripe: Sandboxes](https://docs.stripe.com/sandboxes), isolated test environments
- [Stripe: Versioning](https://docs.stripe.com/api/versioning), date-based versions, monthly releases and twice-yearly majors
- [Adyen: API versioning](https://docs.adyen.com/development-resources/versioning), versions in the URL path
- [Stripe: Idempotent requests](https://docs.stripe.com/api/idempotent_requests), key storage and replay, including errors
- [Adyen: API idempotency](https://docs.adyen.com/development-resources/api-idempotency), keys kept 7 to 14 days
- [Checkout.com: Idempotency](https://www.checkout.com/docs/developer-resources/api/idempotency), keys kept 72 hours
- [Stripe: Errors](https://docs.stripe.com/api/errors), error types, decline codes and advice codes
- [Stripe: Rate limits](https://docs.stripe.com/rate-limits), global and per-endpoint limits and why a request was limited
- [Stripe: Event destinations](https://docs.stripe.com/event-destinations), thin and snapshot events and non-webhook destinations
- [Stripe: Connect authentication](https://docs.stripe.com/connect/authentication), acting on behalf of connected accounts
- [Stripe: OpenAPI specification](https://github.com/stripe/openapi), the published spec behind the SDKs
- [Stripe: Reporting API](https://docs.stripe.com/reports/api), asynchronous report runs
- [Payabli: API overview](https://docs.payabli.com/developers/api-reference/api-overview.md), environments, idempotency and rate limits
- [Stripe: API v2 overview](https://docs.stripe.com/api-v2-overview), idempotent replay within 30 days on v2
- [Stripe: Metadata](https://docs.stripe.com/api/metadata), limits on keys and values
