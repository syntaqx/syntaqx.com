+++
title = "Pagination"
description = "Cursor pagination by default, page numbers only for small stable lists, metadata in the Link header, and why offsets break on data that keeps changing."
category = "Requests & Responses"
order = 4
tags = ["api", "pagination", "standards"]
aliases = ["pagination"]
+++

Any list that can grow gets split into pages. The questions are how a client asks for the next page, where the navigation lives, and what happens when rows are added or deleted while someone is paging through. Most pagination bugs come from the last one.

## Navigation Lives in the Link Header

The body of a list response is the list: an array, nothing else ([JSON Field Conventions](/docs/requests/json-conventions)). Where to go next lives in the `Link` header:

```http
HTTP/1.1 200 OK
Link: <https://api.syntaqx.com/payments?cursor=eyJpZCI6IjEyMyJ9&limit=25>; rel="next"
```

Putting navigation in the body means wrapping the array in an object, with the items under a `data` key and the cursor beside them, and then every client has to unwrap every list. Headers keep the body a plain array and use a standard every HTTP library already parses. Clients follow the URL in `rel="next"` as-is and never build page URLs themselves, so the server can change the scheme without breaking anyone.

| Rel | Meaning |
| --- | ------- |
| `next` | The next page. Omitted on the last page, which is how a client knows it's done |
| `prev` | The previous page. Omitted on the first |
| `first`, `last` | Only where they're cheap and meaningful (page-based lists) |

Every link carries the same filters, sort and limit as the request that produced it ([Filtering & Sorting](/docs/requests/filtering-and-sorting)), so following `next` never silently changes the result set.

## Cursors by Default

The client passes an opaque `cursor` from the previous response, and the server returns the items after it:

```http
GET /payments?limit=25
GET /payments?cursor=eyJpZCI6IjEyMyJ9&limit=25
```

### Why Not Offsets?

`?page=3&per_page=25` translates to `OFFSET 50 LIMIT 25`, and offsets have two problems that grow with the data:

- **Rows shift under the reader.** If a new payment arrives while a client is on page 2, everything moves down one, and page 3 starts with an item the client already saw. Deletes do the opposite and skip one. For an export or a sync job, that's a duplicate or a silent gap.
- **Deep pages get slow.** To return rows 100,000 to 100,025, the database reads and throws away the first 100,000. Page 1 is fast and page 4,000 times out.

A cursor encodes *where you are* (the sort values and `id` of the last item returned) instead of *how many to skip*. The next query is `WHERE (created_at, id) < (…) ORDER BY created_at DESC, id DESC LIMIT 25`, which an index answers at the same speed on any page, and inserts elsewhere in the list don't move the reader. The `id` tiebreaker matters: without it, two items with the same `created_at` can be skipped or repeated at a page boundary.

The cost is real: a cursor can't jump to page 40, and it can't tell you how many pages there are. For APIs that's the right trade. Machine clients walk lists front to back, and correctness under change matters more than random access.

### Cursors Are Opaque

The example cursor happens to be base64-encoded JSON, but clients must treat it as an opaque string: never decode it, build it, or store it long term. That's what lets the server change what's inside (add a sort key, switch the index) without a breaking change. The server validates every cursor it receives, and one that's malformed, expired, or used with different filters than it was issued for returns `422` with the standard [error format](/docs/requests/error-responses).

## Page Numbers for Small, Stable Lists

Page-based pagination is still the right tool when a person is browsing a list that's small and rarely changes, and wants to jump to page 5 or see "page 2 of 7":

```http
GET /plans?page=2&per_page=25
```

```http
HTTP/1.1 200 OK
Link: <https://api.syntaqx.com/plans?page=1&per_page=25>; rel="prev", <https://api.syntaqx.com/plans?page=3&per_page=25>; rel="next", <https://api.syntaqx.com/plans?page=7&per_page=25>; rel="last"
```

If the list can grow without bound, or a client will walk all of it, use a cursor.

## Limits

| Parameter | Default | Maximum |
| --------- | ------- | ------- |
| `limit` (cursor) | `25` | `100` |
| `per_page` (page-based) | `25` | `100` |

- **A ceiling on every list.** Without one, a single `?limit=1000000` is a denial of service against your own database. 100 keeps any one response small enough to be fast and cheap, while making a full walk only a handful of requests per thousand items.
- **Over the maximum is a `422`, not a silent clamp.** A client that asked for 500 and quietly got 100 will believe it has everything.
- **No total count by default.** `COUNT(*)` over a large, filtered table can cost more than the page itself, and the number is stale by the time the client reads it. Endpoints where a total is cheap and genuinely useful can document one.

## This Site

The syntaqx API serves the playbook itself as a paginated list. `GET https://api.syntaqx.com/docs?limit=10` returns a bare array of ten docs and a `Link` header with the next page; follow it to the end and you see every doc exactly once. Cursors are opaque, a cursor reused with different filters is a `422`, and `limit` over 100 is a `422` rather than a quiet clamp.

## References

**Specifications**

- [RFC 8288: Web Linking](https://datatracker.ietf.org/doc/html/rfc8288), the `Link` header and its `rel` types
- [RFC 9110: HTTP Semantics](https://datatracker.ietf.org/doc/html/rfc9110), the `422` status code

**Reference**

- [MDN: Link](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Link), the header as clients see it
- [MDN: 422 Unprocessable Content](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/422), rejecting bad pagination input

**In practice**

- [GitHub Docs: Using pagination in the REST API](https://docs.github.com/en/rest/using-the-rest-api/using-pagination-in-the-rest-api), navigation through the `Link` header, and a 100-item `per_page` maximum on most endpoints
- [Stripe: Pagination](https://docs.stripe.com/api/pagination), cursor pagination anchored on object IDs
- [Google AIP-158: Pagination](https://google.aip.dev/158), opaque page tokens that clients must not parse
- [Use The Index, Luke: Paging Through Results](https://use-the-index-luke.com/sql/partial-results/fetch-next-page), why offsets get slower with depth and how keyset pagination avoids it
