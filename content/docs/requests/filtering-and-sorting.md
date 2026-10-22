+++
title = "Filtering & Sorting"
description = "Query parameter conventions for filtering and sorting collections: field filters, range operators, sort=-created_at, allowlists, and when to use QUERY."
category = "Requests & Responses"
order = 4.2
tags = ["api", "filtering", "sorting", "standards"]
aliases = ["filtering-and-sorting"]
+++

Lists get filtered and sorted with plain query parameters. The syntax is deliberately small. Most real filters are a handful of equality checks and a date range, and a syntax that covers those with plain `key=value` pairs works in every HTTP client, cache, log line and browser address bar. Anything that outgrows it moves to [HTTP QUERY](/docs/requests/http-query) instead of growing a filter language inside the URL.

## Filtering

A filter is a query parameter named after the field it filters:

```http
GET /payments?status=captured&currency=USD
```

- **Multiple parameters are AND.** `status=captured&currency=USD` matches both.
- **Comma-separated values are OR** within one field: `status=captured,settled`. That covers the common "any of these states" case without repeating the parameter. It only works for values that can't contain commas (enums, IDs), which is every filterable field here; free text goes through `q` instead.
- **Values use the field's JSON format:** [RFC 3339](https://datatracker.ietf.org/doc/html/rfc3339) for times ([Time](/docs/fundamentals/time)), minor units for amounts ([Money](/docs/payments/money)), lowercase strings for enums ([JSON Field Conventions](/docs/requests/json-conventions)).

### Ranges

Range filters add a suffix to the field name:

| Suffix | Meaning | Example |
| ------ | ------- | ------- |
| `_after` | Strictly after | `created_after=2026-10-01T00:00:00Z` |
| `_before` | Strictly before | `created_before=2026-11-01T00:00:00Z` |
| `_gte` | Greater than or equal | `amount_gte=1000` |
| `_lte` | Less than or equal | `amount_lte=5000` |

Suffixes keep each parameter a plain `key=value`, so they work with every HTTP client, cache and log parser. Bracket syntaxes like `created[gt]=` read fine, but they need custom parsing in every client and server, and different frameworks parse brackets differently.

Every suffix works on any range-filterable field, and the strict and inclusive forms both exist because they answer different questions:

- **Time windows pair an inclusive start with an exclusive end:** `created_gte=2026-10-01T00:00:00Z&created_before=2026-11-01T00:00:00Z` is exactly October. Consecutive windows line up end to end, so a payment at exactly midnight lands in one month, never both and never neither.
- **`_after` is for "since":** `created_after=` a timestamp fetches only what came later. For walking a whole list without gaps, prefer a [cursor](/docs/requests/pagination): two items can share a timestamp, and a cursor breaks the tie by `id`.
- **Amounts usually use inclusive bounds** (`amount_gte`, `amount_lte`), because "at least $10" is how people state thresholds.

### Allowlisted Fields

Only documented fields can be filtered. Filtering on anything else returns `422` with the standard [error format](/docs/requests/error-responses):

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "nickname": ["This field can't be filtered."]
  }
}
```

Allowlisting does two jobs. **Performance:** every filterable field is backed by an index, so no filter combination turns into a full table scan; an open-ended filter on any column is an unindexed query waiting to happen. **Security:** filtering on a field leaks information about it even when the field is never returned. If `?ssn_last4=1234` were allowed, a client could learn a hidden value one guess at a time, by watching which filters return results.

## Sorting

One `sort` parameter, a comma-separated list of fields, applied left to right. A leading `-` means descending. It's compact, it reads naturally (`-created_at` is "newest first"), and it avoids pairing every field with a separate direction parameter that can get out of step. JSON:API uses the same convention, so many developers already know it:

```http
GET /payments?sort=-created_at
GET /payments?sort=status,-amount
```

- **The default is `-created_at`,** newest first, unless the resource documents otherwise. Most list views care about recent items, and a documented default means two clients that don't pass `sort` see the same order.
- **Sortable fields are allowlisted** and indexed, like filters.
- **`id` is always the final tiebreaker,** so the order is stable when values repeat. With [UUID v7](/docs/fundamentals/identifier-conventions), sorting by `id` is also sorting by creation time.

## Search

Free-text search is its own parameter, `q`, not a filter:

```http
GET /customers?q=alice
```

Search is a different operation from filtering: it's fuzzy, ranked and often backed by a separate index. Keeping it in its own parameter means a filter always means an exact match, and what `q` matches (name, email, prefix, full text) is documented per endpoint.

## With Pagination

Filters and sort are part of the result set's identity. The `Link` header in [Pagination](/docs/requests/pagination) carries them forward on every `next` and `prev` URL, and a cursor is only valid with the filters and sort that produced it. Changing either means starting from the first page.

## When to Switch to QUERY

Query parameters stop working well when:

- The filter is a tree (`(a AND b) OR c`), not a flat list.
- The filter values are long enough to approach URL length limits.
- The values are sensitive and shouldn't land in access logs.

At that point, don't invent a filter language for the query string. Every one that's been tried (bracket trees, mini expression parsers) ends up as a custom parser with its own escaping rules and its own bugs. Accept a structured query in the body with [HTTP QUERY](/docs/requests/http-query), which stays safe, idempotent and cacheable like `GET`, and uses the same field names and operators as the parameters above.

## References

**Specifications**

- [RFC 3986: Uniform Resource Identifier (URI): Generic Syntax](https://datatracker.ietf.org/doc/html/rfc3986), the query component filters live in
- [RFC 3339: Date and Time on the Internet: Timestamps](https://datatracker.ietf.org/doc/html/rfc3339), the format for time filters

**Reference**

- [MDN: 422 Unprocessable Content](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/422), rejecting filters on fields that aren't allowlisted

**In practice**

- [JSON:API: Sorting](https://jsonapi.org/format/#fetching-sorting), the `sort=-field` convention
- [Google AIP-132: Standard methods: List](https://google.aip.dev/132), filtering and ordering on list methods
- [Google AIP-160: Filtering](https://google.aip.dev/160), a full filter language, and why it belongs outside the query string
- [Stripe: Search](https://docs.stripe.com/search), a dedicated search syntax kept separate from list filters
- [Zalando: RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/), query parameter and sorting conventions
