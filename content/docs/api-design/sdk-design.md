+++
title = "SDK Design"
description = "When to ship client libraries, generated versus hand-written, and the behavior every SDK should build in: retries, idempotency, pagination and errors."
category = "API Design"
order = 1.9
tags = ["api", "sdk", "clients", "developer-experience"]
+++

An SDK is where your API's conventions either reach the developer or get lost. The [retry rules](/docs/operations/retries-and-timeouts), the [idempotency keys](/docs/payments/idempotency), the [pagination links](/docs/requests/pagination): each is documented, and each is something a busy developer will half-implement under deadline. A good SDK implements them once, correctly, for everyone. A bad one adds a layer of bugs between the developer and an API that was fine.

## When to Ship One

Ship SDKs when integrations are many and mistakes are expensive: a payments API, where a naive retry without a key double-charges, or any API where correct pagination and error handling take real code. Each integrator otherwise rebuilds the same client, and most get the edge cases wrong.

Don't, or not yet, when the API is small and stable, consumers are few, or plain HTTP is already easy. Every SDK is a product: one per language, each with releases, a changelog, support questions and its own dependency upgrades. Three languages kept current beat seven left to rot, because a stale SDK is worse than none: it pins people to old behavior you can't change.

## Generated, Hand-Written, or Both

| Approach | Strength | Weakness |
| -------- | -------- | -------- |
| Generated from the OpenAPI document | Every endpoint, always in sync with the spec | Reads like the spec, not like the language; edge behavior is whatever the generator does |
| Hand-written | Idiomatic, ergonomic, deliberate behavior | Drifts from the API; every new endpoint is manual work in every language |
| Generated core, hand-written layer | Coverage and sync from generation, ergonomics where they matter | Two layers to understand and test |

I use the hybrid. Generate the types and request plumbing from the [OpenAPI document](/docs/api) so nothing drifts, and hand-write the thin layer developers actually touch: retries, pagination, errors, configuration. This is also why the spec has to be complete and accurate: a generated SDK turns every gap in it into a bug in every language at once.

## Idiomatic per Language

A Go developer expects `context.Context`, errors as values and no exceptions. A Python developer expects keyword arguments and exceptions. A TypeScript developer expects promises and types precise enough to autocomplete. An SDK that looks the same in every language feels foreign in all of them, and developers distrust what feels foreign. Keep concepts consistent across languages (the same resources, the same names, the same behavior) and the surface native to each.

## Behavior to Build In

**Retries, with idempotency keys.** The SDK should retry what's safe to retry, with backoff and jitter, and nothing else ([Retries & Timeouts](/docs/operations/retries-and-timeouts)). For `POST`, that means generating an `Idempotency-Key` once per logical call and reusing it on every retry; that's the only way a retry after a timeout can't create a second payment. Keep the default retry count small: AWS's SDKs default to three attempts in total, which is enough to ride out a blip without turning an outage into a pile-up. Let callers pass their own key so a retry across process restarts stays one operation.

**Timeouts.** Every call gets a default timeout, configurable per client and per call. An SDK that can hang forever passes that hang on to every app built on it.

**Pagination that follows `Link`.** Expose an iterator that follows `rel="next"` until it runs out, so `for payment in client.payments.list()` walks everything without the caller ever touching a cursor. The iterator must follow the URL the server gave it, not rebuild one, which is what lets the server change its pagination without breaking SDK users.

**Typed errors that carry the `Request-Id`.** Map the [error format](/docs/requests/error-responses) to typed errors (validation, not found, rate limited, conflict, server) so callers branch on type, not on string matching. Put the field errors, the HTTP status and the `Request-Id` on every error object. The Request-Id is what turns "it failed" in a support ticket into a log line you can find ([Observability](/docs/operations/observability)).

**Identity in the `User-Agent`.** Send the SDK's name and version, the language and its version. When a bug shows up in the API's logs, that's how you learn which SDK release sends the malformed request and who needs to upgrade.

## Versioning

An SDK has two versions to keep straight: its own and the API's. The SDK follows [SemVer](https://semver.org/) on its own surface, so a renamed method or changed type is a major release ([Dependency Management](/docs/engineering/dependencies)). The API version it speaks is a separate choice: pin each SDK release to the dated API version that was current when it shipped, sent as `Api-Version` on every call, so upgrading the SDK is how a customer opts into newer API behavior ([Versioning & Deprecation](/docs/operations/versioning)). Stripe works this way: each SDK version uses the API version current at its release and follows semantic versioning for its own changes.

Let callers override the API version per client for the rare case that needs it, and say clearly in the changelog which API version each release pins.

## Testing

Test the hand-written layer against behavior, not mocks of your own code. Run the SDK against a real test environment or recorded responses (cassette tools like vcrpy record real HTTP interactions once and replay them) for each scenario that matters: a retry after a timeout reusing the same key, a `429` honoring `Retry-After`, pagination to the end, every error type mapping correctly. Run contract tests from the OpenAPI document in CI, so a spec change that breaks generation fails before release ([Testing Strategy](/docs/engineering/testing)).

## Deprecation

Deprecate in the SDK the way the API deprecates on the wire: mark the method deprecated in the language's own mechanism (annotations, `@deprecated` JSDoc, warnings) with what to use instead, keep it working for a stated window, and remove it only in a major release. Surface the API's `Deprecation` and `Sunset` headers as warnings in the SDK's logs, so developers learn about a retirement before the `410`, not from it.

## References

**Specifications**

- [Semantic Versioning 2.0.0](https://semver.org/), what major, minor and patch promise for the SDK's own surface
- [MDN: User-Agent](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/User-Agent), identifying the SDK and its version on every request

**Reference**

- [OpenAPI Generator](https://openapi-generator.tech/), generating clients from an OpenAPI document
- [vcrpy](https://vcrpy.readthedocs.io/), recording real HTTP interactions and replaying them in tests

**In practice**

- [Azure SDK: General guidelines](https://azure.github.io/azure-sdk/general_introduction.html), idiomatic, consistent, approachable, diagnosable and dependable as design principles
- [AWS SDKs: Retry behavior](https://docs.aws.amazon.com/sdkref/latest/guide/feature-retry-behavior.html), three attempts by default, exponential backoff with full jitter and a retry budget
- [Stripe: SDK versioning](https://docs.stripe.com/sdks/versioning), semantic versioning for the SDK and the API version pinned per release
- [Stripe: Advanced error handling](https://docs.stripe.com/error-low-level), SDKs that generate idempotency keys and retry automatically
