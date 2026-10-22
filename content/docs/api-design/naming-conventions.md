+++
title = "Naming Conventions"
description = "How API paths are named: plural kebab-case nouns, one level of nesting, IDs not names in URLs, actions as sub-resources, and no formats or versions in paths."
category = "API Design"
order = 1
tags = ["api", "naming", "rest"]
aliases = ["naming-conventions"]
+++

A URL outlives the code behind it. It ends up in client code, bookmarks, logs, docs and other teams' configs, and renaming one is a breaking change. So paths are named once, carefully, by rules simple enough that nobody has to look them up.

## The Rules

| Rule | Yes | No |
| ---- | --- | -- |
| Plural nouns for collections | `/invoices` | `/invoice`, `/getInvoices` |
| kebab-case path segments | `/line-items` | `/lineItems`, `/line_items` |
| snake_case query parameters | `?created_after=` | `?createdAfter=` |
| Identify by ID | `/users/{userId}` | `/users/alice` |
| Lowercase, no trailing slash | `/invoices` | `/Invoices/` |
| No file extensions | `Accept: text/csv` | `/invoices.csv` |
| No versions | `Api-Version: 2026-10-01` | `/v1/invoices` |

The reasoning behind the less obvious ones:

- **Plural, always.** `/invoices` is the collection and `/invoices/{id}` is one member of it. Mixing singular and plural means every integrator guesses wrong half the time.
- **kebab-case paths, snake_case everywhere else.** URLs are case-sensitive and read by humans; hyphens are the conventional word separator in them. Query parameters and JSON fields use snake_case to match the [JSON fields](/docs/requests/json-conventions) and [database columns](/docs/database/naming-conventions) they map to, so nothing is renamed between layers.
- **IDs, not names.** Names change; a user renames themselves and every stored URL breaks. An opaque, permanent [ID](/docs/fundamentals/identifier-conventions) never does. If a human-readable URL matters (a public profile), make the slug a separate, redirectable field.
- **No extensions or versions in the path.** Both describe a representation or a revision of the resource, not the resource. They belong in `Accept` and `Api-Version`, so the URL stays one stable name ([Versioning](/docs/operations/versioning)).

## Flat or Nested

Nest a resource under a parent only when it can't exist without that parent:

```http
GET  /orders/{orderId}/line-items     # a line item belongs to exactly one order
POST /orders/{orderId}/line-items
```

Keep it flat when the resource stands on its own, even if it's often viewed through a parent:

```http
GET /users/{userId}                   # not /teams/{teamId}/users/{userId}
GET /comment-statuses                 # a global list, not a child of anything
```

- **One level of nesting, at most.** `/orgs/{orgId}/projects/{projectId}/tasks/{taskId}` makes every task URL depend on two parents. Move a project to another org and every task URL changes. If a task has its own ID, it gets its own top-level URL: `/tasks/{taskId}`.
- **A nested path needs a real parent ID.** `/posts/comments` reads like "comments of posts" but has no post. It's either `/comments` (all of them) or `/posts/{postId}/comments` (one post's).
- **Relationships between independent resources** (a user on a team) are their own topic: [Resource Relationships](/docs/api-design/resource-relationships).

## Lookup Lists

Enum-like values that clients need at runtime (statuses, tiers, categories) are ordinary flat collections:

```http
GET /comment-statuses
GET /subscription-tiers
```

Don't nest them under a resource (`/comments/statuses` collides with `/comments/{commentId}` and implies a parent that doesn't exist), and don't put them under an `/enums/` prefix: it groups endpoints by how they happen to be implemented rather than by what they are, and the day a "tier" gains a price and a description, it isn't an enum anymore.

## Actions

Some operations aren't a field update: approving, cancelling, refunding. Model them as a sub-resource that records the action, and `POST` to it:

```http
POST /invoices/{invoiceId}/approvals
POST /payments/{paymentId}/refunds
```

The noun is the record the action creates: an approval, a refund. It can have its own ID, timestamps and history. A bare verb (`POST /invoices/{id}/approve`) is a reasonable fallback when nothing is worth recording, but it should be the exception.

## Documentation Placeholders

In docs and OpenAPI, path parameters are written as `{orderId}`, `{userId}`: the resource name plus `Id`. The braces are documentation only; the value is always the resource's opaque ID.

## References

**Specifications**

- [RFC 3986: URI Generic Syntax](https://datatracker.ietf.org/doc/html/rfc3986), what a path segment can contain, and case sensitivity
- [RFC 9110: HTTP Semantics](https://datatracker.ietf.org/doc/html/rfc9110), `Accept` for representations instead of extensions

**In practice**

- [Google AIP-122: Resource names](https://google.aip.dev/122), collection identifiers and parent-child naming
- [Google AIP-136: Custom methods](https://google.aip.dev/136), operations that don't map to a standard method
- [Microsoft Azure REST API Guidelines](https://github.com/microsoft/api-guidelines/blob/vNext/azure/Guidelines.md), URL structure and casing rules at scale
- [Zalando RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/), kebab-case paths, snake_case parameters and pluralized resource names
