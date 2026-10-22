+++
title = "JSON Field Conventions"
description = "How fields are named and typed in JSON bodies: snake_case, absent versus null, string enums, boolean prefixes, and safe handling of 64-bit numbers."
category = "Requests & Responses"
order = 301
tags = ["api", "json", "naming", "standards"]
aliases = ["json-conventions"]
+++

[Naming Conventions](/docs/api-design/naming-conventions) settle the URLs; this settles what's inside the bodies, the part of an API clients touch on every line of code. When fields are consistent, a developer who has used one resource can guess the shape of the next. When they drift (`createdAt` here, `created_at` there, `"active"` or `"is_active"` or `"enabled"`), every resource is a separate thing to learn, and every guess is a bug waiting to happen.

## No Envelopes

A `GET` on a resource returns the resource. A list returns an array. Nothing is wrapped in `data`, `result`, `items` or `meta`.

```json
{
  "id": "01932c6c-7616-7590-a8db-cb4b0e4d1c8a",
  "status": "active",
  "is_verified": true,
  "created_at": "2026-10-22T14:23:45Z"
}
```

Envelopes usually exist to carry metadata next to the payload: a page cursor, a request ID, a status flag. HTTP already has a place for metadata, and using it keeps the body exactly the resource:

- **Pagination** lives in `Link` ([Pagination](/docs/requests/pagination)).
- **Rate limits** live in `RateLimit` ([Rate Limiting](/docs/requests/rate-limiting)).
- **The version** lives in `Api-Version` ([Versioning](/docs/api-design/versioning)).
- **Success or failure** lives in the status code ([Error Responses](/docs/requests/error-responses)).

Clients stop writing `response.data.data`, a resource from a `GET` is byte-for-byte what a webhook or an expansion embeds, and generic tooling (caches, logs, `curl | jq`) sees the actual object. Metadata is a little less visible in raw bodies, a fair trade for never unwrapping anything. GitHub's REST API has worked this way for years.

## Naming

- **snake_case, everywhere:** `first_name`, `created_at`, `amount_refunded`. JavaScript's convention is camelCase, and either choice works; what doesn't work is mixing them. snake_case wins here because it matches the [database columns](/docs/database/naming-conventions), so nothing gets renamed between the table, the API and the logs, and a field means the same thing wherever you grep for it.
- **Full words,** not abbreviations: `description`, not `desc`. Abbreviations save keystrokes once and cost a lookup every time someone reads them.
- **Plural for arrays,** singular for everything else: `tags`, `owner`.

## Types

| Kind | Format | Example |
| ---- | ------ | ------- |
| Identifier | String, [UUID v7](/docs/fundamentals/identifier-conventions) | `"01932c6c-7616-7590-a8db-cb4b0e4d1c8a"` |
| Foreign key | `{resource}_id` | `"user_id": "0194a7f3-2b11-7e80-9c3d-4e8f1a2b5c70"` |
| Datetime | RFC 3339 string, `_at` suffix ([Time](/docs/fundamentals/time)) | `"created_at": "2026-10-22T14:23:45Z"` |
| Date | `YYYY-MM-DD`, `_on` suffix | `"published_on": "2026-10-22"` |
| Money | Integer minor units plus currency ([Money](/docs/payments/money)) | `"amount": 1999, "currency": "USD"` |
| Boolean | `is_`, `has_`, `can_` prefix | `"is_active": true` |
| Enum | Lowercase snake_case string | `"status": "requires_capture"` |

The suffixes and prefixes carry the type in the name: `published_on` has no time component, and `is_active` can't be mistaken for a timestamp of when something became active.

### Enums Are Strings

Enum values are lowercase snake_case strings, never integers. `"status": "captured"` reads correctly in a log, a support ticket and a database query; `"status": 3` needs a lookup table, and the table drifts.

Adding a value to an enum is a non-breaking change ([Versioning](/docs/api-design/versioning)), so **clients must handle values they don't recognize**: a `switch` with a default case, not one that throws.

### Large Integers

JSON doesn't limit number size, but JavaScript and many other parsers read every number as an IEEE 754 double, which is exact only up to 2^53 - 1. Past that, `9007199254740993` silently becomes `9007199254740992`: no error, just a different number, and if it's an ID, a different record.

So any integer that can exceed 2^53 - 1 is sent as a **string**. Amounts in minor units fit comfortably (2^53 cents is about 90 trillion dollars). 64-bit database IDs and counters may not, which is one more reason public IDs are UUID strings in the first place.

## Absent vs. `null`

- **Responses include every documented field.** A field with no value is `null`, not missing, so clients can rely on the shape.
- **In a `PATCH`, absent means "leave it alone" and `null` means "clear it".** That's [JSON Merge Patch](https://datatracker.ietf.org/doc/html/rfc7396). Without the distinction, a client that only wants to change `email` has to resend every other field, and one stale copy overwrites someone else's change.
- **Empty collections are `[]`,** never `null`, so no loop needs a null check.
- **Expansions are the exception:** a related object appears inline only when requested ([Relationships & Expansion](/docs/api-design/resource-relationships#expanding-on-request)).

## Unknown Fields

- **Clients ignore response fields they don't recognize.** That's what lets the server add fields without a new version.
- **Servers reject request fields they don't recognize** with `422`. A typo like `ammount` that's silently dropped means the request "succeeds" with the default amount, and nobody finds out until reconciliation. Failing loudly makes it a test failure on day one.

The opposite rules are deliberate. Strictness means a newer client sending a field an older server doesn't know gets an error instead of partial success, which is correct: it asked for something the server can't do.

## References

**Specifications**

- [RFC 8259: The JavaScript Object Notation (JSON) Data Interchange Format](https://datatracker.ietf.org/doc/html/rfc8259), JSON syntax and its warning about number precision across implementations
- [RFC 7396: JSON Merge Patch](https://datatracker.ietf.org/doc/html/rfc7396), absent versus `null` in a `PATCH`
- [RFC 3339: Date and Time on the Internet: Timestamps](https://datatracker.ietf.org/doc/html/rfc3339), the datetime format

**Reference**

- [MDN: Number.MAX_SAFE_INTEGER](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER), the 2^53 - 1 limit
- [MDN: PATCH](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/PATCH), partial updates

**In practice**

- [GitHub Docs: REST API](https://docs.github.com/en/rest), unwrapped objects and arrays, with metadata in headers
- [Google AIP-140: Field names](https://google.aip.dev/140), consistent, unabbreviated field naming
- [Google AIP-126: Enumerations](https://google.aip.dev/126), defining and evolving enumerated values
- [Zalando: RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/), snake_case property names and JSON conventions
