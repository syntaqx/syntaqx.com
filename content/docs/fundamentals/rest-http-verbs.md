+++
title = "REST & HTTP Verbs"
description = "What GET, QUERY, POST, PUT, PATCH and DELETE promise to clients, caches and retries, and why breaking those promises causes real outages."
category = "Fundamentals"
order = -1
tags = ["api", "rest", "http"]
aliases = ["rest-http-verbs"]
+++

An HTTP method isn't a naming style. It's a promise, and software you don't control acts on it. Caches store the responses to `GET`. Browsers, link previewers and crawlers follow `GET` links on their own. HTTP clients and proxies retry idempotent requests after a dropped connection without asking you. If an endpoint's method lies about what it does, that machinery does the wrong thing on your behalf.

That's the practical case for REST ([Fielding's dissertation](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm) is the theory): resources have URLs, methods say what you're doing to them, and status codes say how it went. Everything else in this playbook builds on those promises.

## The Two Properties That Matter

**Safe** means the client isn't asking for any change. A safe request can be repeated, prefetched, cached and crawled.

**Idempotent** means sending the request twice has the same effect on the server as sending it once. The response may differ (a second `DELETE` finds nothing to delete), but the state ends up the same. Idempotent requests are the ones it's safe to retry after a timeout, when you don't know whether the first one landed.

| Method | Safe | Idempotent | Body has meaning |
| ------ | ---- | ---------- | ---------------- |
| `GET` | Yes | Yes | No |
| `QUERY` | Yes | Yes | Yes |
| `PUT` | No | Yes | Yes |
| `DELETE` | No | Yes | Rarely |
| `PATCH` | No | Only if the patch format makes it so | Yes |
| `POST` | No | No | Yes |

These come from [RFC 9110](https://datatracker.ietf.org/doc/html/rfc9110#section-9.2) and [RFC 5789](https://datatracker.ietf.org/doc/html/rfc5789), but the reason to follow them is the table's last consequence: everything in the "No" column needs its own retry story ([Idempotency](/docs/payments/idempotency)), and everything in the "Yes" column gets one for free.

## GET: Read

Retrieve a resource or a collection. It must never change anything, not even "harmless" things like marking a notification read. A `GET /emails/{id}/unsubscribe` link gets fired by mail scanners and link previewers before a human ever sees it.

```http
GET /users/01932c6c-7616-7590-a8db-cb4b0e4d1c8a
```

```json
{
  "id": "01932c6c-7616-7590-a8db-cb4b0e4d1c8a",
  "name": "Alice",
  "email": "alice@example.com"
}
```

Collections return an array, even with one item. A client that has to check whether it got an object or a list has been handed a bug.

```json
[
  { "id": "01932c6c-7616-7590-a8db-cb4b0e4d1c8a", "name": "Alice" },
  { "id": "0194a7f3-2b11-7e80-9c3d-4e8f1a2b5c70", "name": "Bob" }
]
```

## QUERY: Read With a Body

A search whose criteria travel in the body: safe and idempotent like `GET`, defined by [RFC 10008](https://datatracker.ietf.org/doc/html/rfc10008). Use it when filters are too long, too structured, or too sensitive for a URL that ends up in logs.

```http
QUERY /users
Content-Type: application/json

{ "email_domain": "example.com", "sort": "-created_at" }
```

The alternative, `POST /users/search`, works but lies: caches won't store it, and clients won't retry it, because `POST` says "this might change something". See [HTTP QUERY](/docs/requests/http-query) for discovery and the fallback for clients that can't send it yet.

## POST: Create, or Do Something

`POST` is for operations whose result isn't fully described by a URL the client already knows: creating a resource where the server assigns the ID, or triggering a process.

```http
POST /users
Content-Type: application/json

{ "name": "Alice", "email": "alice@example.com" }
```

```http
HTTP/1.1 201 Created
Location: /users/01932c6c-7616-7590-a8db-cb4b0e4d1c8a
```

Return `201` with a `Location` pointing at the new resource, and the resource itself in the body so the client doesn't need a second request.

Actions that aren't naturally a field update get their own sub-resource, still as a noun-like path:

```http
POST /users/01932c6c-7616-7590-a8db-cb4b0e4d1c8a/password-resets
```

```http
HTTP/1.1 202 Accepted
```

`202` says the work was accepted, not finished. If the client needs to follow it, return a status resource ([Long-Running Operations](/docs/requests/long-running-operations)).

`POST` is the one method nobody can safely retry blind. A timed-out `POST /payments` might have charged the card. That's why every `POST` accepts an `Idempotency-Key`.

## PUT: Replace at a Known URL

`PUT` replaces the whole resource at a URL the client already knows. Send it five times and the result is the same as once, which is exactly why it's retry-safe.

```http
PUT /users/01932c6c-7616-7590-a8db-cb4b0e4d1c8a/preferences
Content-Type: application/json

{ "theme": "dark", "locale": "en-US" }
```

"Whole" is the part people get wrong. A field missing from a `PUT` body is cleared, not left alone. That makes `PUT` a poor fit for large resources edited by more than one client: two clients each sending their own full copy will overwrite each other's changes. Use it for small, self-contained documents (settings, a configuration blob) and for creating a resource at a client-chosen ID.

## PATCH: Change Some Fields

`PATCH` changes only what you send. [RFC 5789](https://datatracker.ietf.org/doc/html/rfc5789) says plainly that it's "neither safe nor idempotent" by definition, because a patch can say "append this to the list" and appending twice isn't appending once.

The patch format decides. I use [JSON Merge Patch](https://datatracker.ietf.org/doc/html/rfc7396): the body is the fields to set, `null` clears a field, and absent fields are untouched. Setting a field to a value is idempotent, so merge-patch requests are safe to retry in practice.

```http
PATCH /users/01932c6c-7616-7590-a8db-cb4b0e4d1c8a
Content-Type: application/merge-patch+json

{ "email": "alice@new.example.com" }
```

Where lost updates matter, pair it with `If-Match` so a stale client gets `412` instead of silently overwriting someone else's edit ([Caching & Conditional Requests](/docs/requests/caching)).

## DELETE: Remove

```http
DELETE /users/01932c6c-7616-7590-a8db-cb4b0e4d1c8a
```

```http
HTTP/1.1 204 No Content
```

Deleting something that's already gone returns `204` again, not `404`. The scenario that decides it: a client sends `DELETE`, the connection drops, it retries. The first request did the work. If the retry returns `404`, the client reports a failure for a delete that succeeded. The state the client asked for, "this doesn't exist", is true, so say so.

## Choosing

| You want to... | Use |
| -------------- | --- |
| Read something by its URL | `GET` |
| Search with criteria too big or sensitive for a URL | `QUERY` |
| Create something the server names | `POST` to the collection |
| Create or replace something at a known URL | `PUT` |
| Change a few fields | `PATCH` (merge patch) |
| Trigger a process | `POST` to an action sub-resource |
| Remove something | `DELETE` |

When none of them fits, that's usually a sign the resource is wrong, not the method. "Approve this invoice" isn't a missing verb; it's `POST /invoices/{id}/approvals`, a record that the approval happened.

## References

**Specifications**

- [RFC 9110: HTTP Semantics, Section 9](https://datatracker.ietf.org/doc/html/rfc9110#section-9.2), safe and idempotent methods defined
- [RFC 5789: PATCH Method for HTTP](https://datatracker.ietf.org/doc/html/rfc5789), why `PATCH` is not idempotent by definition
- [RFC 7396: JSON Merge Patch](https://datatracker.ietf.org/doc/html/rfc7396), the patch format that makes it so in practice
- [RFC 10008: The HTTP QUERY Method](https://datatracker.ietf.org/doc/html/rfc10008), safe reads with a request body
- [Roy Fielding: Architectural Styles and the Design of Network-based Software Architectures, Chapter 5](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm), the dissertation that defines REST

**Reference**

- [MDN: HTTP request methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods), every method with browser behavior
- [MDN: Idempotent](https://developer.mozilla.org/en-US/docs/Glossary/Idempotent), what idempotency does and doesn't promise
- [MDN: Safe (HTTP Methods)](https://developer.mozilla.org/en-US/docs/Glossary/Safe/HTTP), which methods never change state
- [MDN: Location](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Location), pointing at a newly created resource

**In practice**

- [Martin Fowler: Richardson Maturity Model](https://martinfowler.com/articles/richardsonMaturityModel.html), why resources plus verbs beat RPC over HTTP
