+++
title = "Expanding Responses"
description = "Related resources come back as IDs unless the client asks to expand them: fewer round trips without bloating every response, with depth and access limits."
category = "Requests & Responses"
order = 6
tags = ["api", "expand", "rest"]
aliases = ["expanding-responses"]
+++

Every resource points at others: an order has a customer, a payment has refunds. An API has to decide how much of that graph each response carries, and both extremes hurt. Return only IDs and a client showing one order makes three more requests to draw the screen. Embed everything and every response drags along data most callers never read, slower to build and harder to cache.

The answer here: **IDs by default, related objects on request**, with the `expand` parameter.

## IDs by Default

Related resources appear as `{relation}_id` fields:

```http
GET /orders/49b2a928-c215-43fc-a022-9ac49143ab07
```

```json
{
  "id": "49b2a928-c215-43fc-a022-9ac49143ab07",
  "amount": 3650,
  "currency": "USD",
  "customer_id": "c7e1b9a4-3204-41ed-a1eb-0242ac120002",
  "status": "completed",
  "created_at": "2025-03-14T06:13:07Z"
}
```

The default response is small, fast, and the same for everyone, so it caches well. A client that needs nothing else pays for nothing else.

## Expanding on Request

`expand` names a relationship to inline. The expanded object appears under the relationship's name, and the `_id` field stays:

```http
GET /orders/49b2a928-c215-43fc-a022-9ac49143ab07?expand[]=customer&expand[]=refunds
```

```json
{
  "id": "49b2a928-c215-43fc-a022-9ac49143ab07",
  "amount": 3650,
  "currency": "USD",
  "customer_id": "c7e1b9a4-3204-41ed-a1eb-0242ac120002",
  "customer": {
    "id": "c7e1b9a4-3204-41ed-a1eb-0242ac120002",
    "email": "jane@example.com",
    "name": "Jane Doe"
  },
  "refunds": [
    { "id": "01932c6c-7616-7590-a8db-cb4b0e4d1c8a", "amount": 1200, "status": "succeeded" }
  ],
  "status": "completed",
  "created_at": "2025-03-14T06:13:07Z"
}
```

- **`expand[]=` is the canonical form.** `expand=customer` is accepted for a single value, but links the server generates (like `Link` headers in [Pagination](/docs/requests/pagination)) always use `expand[]=`, so there's one form to document and test.
- **The `_id` field never disappears.** Code that reads `customer_id` keeps working whether or not someone added an expansion. Expansion only ever adds fields.
- **Nested expansion uses dots:** `expand[]=refunds.payment`. On a list, expansions apply to each item.

## Limits That Keep It Safe

Expansion hands the client a lever on how much work the server does per request, so it gets the same limits as any other input:

- **Only documented relationships can be expanded.** Anything else is a `422` with the standard [error format](/docs/requests/error-responses). An open-ended `expand` is an open-ended join.
- **Two levels deep at most.** Each level multiplies the work, and on a list of 100 items it multiplies it 100 times. `refunds.payment` is fine; `refunds.payment.customer.addresses` belongs in its own request.
- **Authorization applies to every expanded object.** Expanding `customer` on an order the caller can see must not reveal a customer they can't. Expansion is a common place for that check to be forgotten, which is exactly [broken object level authorization](/docs/security/api-security). An expansion the caller isn't allowed to see fails the same way the direct request would.
- **Expensive relationships stay out.** If expanding something means calling a slow third party or scanning a large table, it's a separate endpoint, not an expansion.

## Why Not the Alternatives?

- **Always embed related objects.** Every response pays for every relationship, and a change to a customer invalidates every cached order that embedded it.
- **Side-loading, as in JSON:API's `include`.** Related objects go into a separate top-level `included` array, normalized and de-duplicated. That's efficient for large graphs, but it requires an envelope around every response and client code to stitch objects back together, which these docs avoid ([JSON Field Conventions](/docs/requests/json-conventions)).
- **GraphQL.** Clients choose every field, which is the most flexible option and a different paradigm, with its own caching, cost limiting and tooling. If clients need that much control everywhere, that's an argument for GraphQL, not for an ever-growing `expand`.

`expand` covers the common case, "this screen also needs the customer", with one request, a predictable shape, and no new paradigm. Stripe's API popularized it, and its long use there is good evidence that it holds up.

## References

**Reference**

- [OWASP: API1:2023 Broken Object Level Authorization](https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/), why every expanded object needs its own authorization check

**In practice**

- [Stripe: Expanding Responses](https://docs.stripe.com/api/expanding_objects), the `expand[]` parameter, dot paths for nested expansion, and a depth limit
- [JSON:API: Inclusion of Related Resources](https://jsonapi.org/format/#fetching-includes), the side-loading alternative
- [Microsoft: Graph REST API Guidelines](https://github.com/microsoft/api-guidelines/blob/vNext/graph/GuidelinesGraph.md), `$expand` on navigation properties
- [GraphQL: Introduction](https://graphql.org/learn/), the client-chosen-fields alternative
