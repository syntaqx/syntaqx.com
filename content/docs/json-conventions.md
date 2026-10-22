+++
title = "JSON Field Conventions"
description = "How fields are named and typed in JSON bodies: snake_case, absent versus null, string enums, boolean prefixes, and safe handling of 64-bit numbers."
category = "Requests & Responses"
order = 2.5
tags = ["api", "json", "naming", "standards"]
+++

Every request and response body follows the same field rules, so a client that has seen one resource can guess the shape of the next.

## No Envelopes

A `GET` on a resource returns the resource. A list returns an array. Nothing is wrapped in `data`, `result`, `items` or `meta`, the way [GitHub's REST API](https://docs.github.com/en/rest) works. Metadata lives in headers: pagination in `Link` ([Pagination](/docs/pagination)), rate limits in `RateLimit` ([Rate Limiting](/docs/rate-limiting)), the version in `Api-Version` ([Versioning](/docs/versioning)).

```json
{
  "id": "01932c6c-7616-7590-a8db-cb4b0e4d1c8a",
  "status": "active",
  "is_verified": true,
  "created_at": "2026-10-22T14:23:45Z"
}
```

## Naming

- **snake_case**, everywhere: `first_name`, `created_at`, `amount_refunded`. It matches the [database columns](/docs/database-naming-conventions), so nothing gets renamed between layers.
- **Full words**, not abbreviations: `description`, not `desc`.
- **Plural for arrays**, singular for everything else: `tags`, `owner`.

## Types

| Kind | Format | Example |
| ---- | ------ | ------- |
| Identifier | String, [UUID v7](/docs/identifier-conventions) | `"01932c6c-7616-7590-a8db-cb4b0e4d1c8a"` |
| Foreign key | `{resource}_id` | `"user_id": "0194a7f3-2b11-7e80-9c3d-4e8f1a2b5c70"` |
| Datetime | RFC 3339 string, `_at` suffix ([Time](/docs/time)) | `"created_at": "2026-10-22T14:23:45Z"` |
| Date | `YYYY-MM-DD`, `_on` suffix | `"published_on": "2026-10-22"` |
| Money | Integer minor units plus currency ([Money](/docs/money)) | `"amount": 1999, "currency": "USD"` |
| Boolean | `is_`, `has_`, `can_` prefix | `"is_active": true` |
| Enum | Lowercase snake_case string | `"status": "requires_capture"` |

### Enums Are Strings

Enum values are lowercase snake_case strings, never integers. `"status": "captured"` is readable in a log; `"status": 3` needs a lookup table. Clients must tolerate values they don't recognize, because new values are a non-breaking change (see [Versioning](/docs/versioning)).

### Large Integers

JSON numbers are parsed as IEEE 754 doubles by JavaScript and many other clients, which are only exact up to 2^53 - 1 ([`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER)). Any integer that can exceed that is sent as a **string**. Amounts in minor units fit comfortably; 64-bit database IDs and counters may not, which is one more reason public IDs are UUIDs.

## Absent vs. `null`

- **Responses include every documented field.** A field with no value is `null`, not missing. Clients can rely on the shape.
- **In a `PATCH`, absent means "leave it alone" and `null` means "clear it".** That's [JSON Merge Patch](https://datatracker.ietf.org/doc/html/rfc7396) semantics.
- **Empty collections are `[]`,** never `null`.
- **Expansions are the exception:** a related object only appears inline when requested; see [Expanding Responses](/docs/expanding-responses).

## Unknown Fields

- **Clients ignore fields they don't recognize.** New response fields ship without a version bump.
- **Servers reject unknown request fields** with `422` and the standard [error format](/docs/error-responses). A typo like `ammount` should fail loudly, not be silently dropped.

## References

**Specifications**

- [RFC 8259: The JavaScript Object Notation (JSON) Data Interchange Format](https://datatracker.ietf.org/doc/html/rfc8259), JSON syntax and its interoperability limits on number precision
- [RFC 7396: JSON Merge Patch](https://datatracker.ietf.org/doc/html/rfc7396), absent versus `null` in a `PATCH`
- [RFC 3339: Date and Time on the Internet: Timestamps](https://datatracker.ietf.org/doc/html/rfc3339), the datetime format

**Reference**

- [MDN: Number.MAX_SAFE_INTEGER](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER), why large integers travel as strings
- [MDN: PATCH](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/PATCH), partial updates

**In practice**

- [GitHub Docs: REST API](https://docs.github.com/en/rest), unwrapped objects and arrays, with metadata in headers
- [Google AIP-140: Field names](https://google.aip.dev/140), consistent, unabbreviated field naming
- [Google AIP-126: Enumerations](https://google.aip.dev/126), defining and evolving enumerated values
- [Zalando: RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/), snake_case property names and JSON conventions
