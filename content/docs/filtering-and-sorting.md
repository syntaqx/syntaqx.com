+++
title = "Filtering & Sorting"
description = "Query parameter conventions for filtering and sorting collections: field filters, range operators, sort=-created_at, allowlists, and when to use QUERY."
category = "Requests & Responses"
order = 4.2
tags = ["api", "filtering", "sorting", "standards"]
+++

Lists get filtered and sorted with plain query parameters. The syntax is deliberately small: enough for the common cases, with [HTTP QUERY](/docs/http-query) for anything that outgrows it.

## Filtering

A filter is a query parameter named after the field it filters:

```http
GET /payments?status=captured&currency=USD
```

- **Multiple parameters are AND.** `status=captured&currency=USD` matches both.
- **Comma-separated values are OR** within one field: `status=captured,settled`.
- **Values use the field's JSON format:** RFC 3339 for times ([Time](/docs/time)), minor units for amounts ([Money](/docs/money)), lowercase strings for enums ([JSON Field Conventions](/docs/json-conventions)).

### Ranges

Range filters add a suffix to the field name:

| Suffix | Meaning | Example |
| ------ | ------- | ------- |
| `_after` | Strictly after | `created_after=2026-10-01T00:00:00Z` |
| `_before` | Strictly before | `created_before=2026-11-01T00:00:00Z` |
| `_gte` | Greater than or equal | `amount_gte=1000` |
| `_lte` | Less than or equal | `amount_lte=5000` |

Suffixes keep each parameter a plain `key=value`, so they work with every HTTP client, cache and log parser. Bracket syntaxes like `created[gt]=` read fine but need custom parsing everywhere.

### Allowlisted Fields

Only documented fields can be filtered, and each one is backed by an index. Filtering on anything else returns `422` with the standard [error format](/docs/error-responses):

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "nickname": ["This field can't be filtered."]
  }
}
```

An open-ended filter on any column is an unindexed query waiting to happen.

## Sorting

One `sort` parameter, a comma-separated list of fields. A leading `-` means descending:

```http
GET /payments?sort=-created_at
GET /payments?sort=status,-amount
```

- **The default is `-created_at`,** newest first, unless the resource documents otherwise.
- **Sortable fields are allowlisted** and indexed, like filters.
- **`id` is always the final tiebreaker,** so the order is stable when values repeat. With [UUID v7](/docs/identifier-conventions), sorting by `id` is also sorting by creation time.

## Search

Free-text search is its own parameter, `q`, not a filter:

```http
GET /customers?q=alice
```

What `q` matches (name, email, prefix, full text) is documented per endpoint.

## With Pagination

Filters and sort are part of the result set's identity. The `Link` header in [Pagination](/docs/pagination) carries them forward on every `next` and `prev` URL, and a cursor is only valid with the filters and sort that produced it. Changing either means starting from the first page.

## When to Switch to QUERY

Query parameters stop working well when:

- The filter is a tree (`(a AND b) OR c`), not a flat list.
- The filter values are long enough to approach URL length limits.
- The values are sensitive and shouldn't land in access logs.

At that point, don't invent a filter language for the query string. Accept a structured query in the body with [HTTP QUERY](/docs/http-query), which stays safe, idempotent and cacheable like `GET`.
