+++
title = "Pagination"
description = "Page-based and cursor-based pagination using the Link header."
category = "Requests & Responses"
order = 4
tags = ["api", "pagination", "standards"]
+++

Large result sets get split into pages. Pagination metadata lives in the `Link` header (RFC 8288), never in the response body.

Two approaches are supported: **page-based** and **cursor-based**.

## Page-Based Pagination

The client specifies a page number and items per page. The server responds with results for the requested page, and the `Link` header contains navigation links.

### Example Request

```http
GET /api/v1/resources?page=2&per_page=25
```

#### Query Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `page` | `1` | The current page number |
| `per_page` | `10` | Number of items per page |

### Example Response

```http
HTTP/1.1 200 OK
Link: <https://api.syntaqx.com/v1/resources?page=1&per_page=25>; rel="prev", <https://api.syntaqx.com/v1/resources?page=3&per_page=25>; rel="next"
```

## Cursor-Based Pagination

Cursor-based pagination is more efficient for large or frequently updated datasets. Instead of specifying a `page`, the client passes a `cursor` value that references a specific position in the dataset. This avoids issues with records shifting between requests.

### Example Request

```http
GET /api/v1/resources?cursor=eyJpZCI6IjEyMyJ9&limit=25
```

#### Query Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `cursor` | - | Token representing the current position in the dataset |
| `limit` | `25` | Number of items to return |

### Example Response

```http
HTTP/1.1 200 OK
Link: <https://api.syntaqx.com/v1/resources?cursor=eyJpZCI6IjEyMyJ9&limit=25>; rel="next"
```

## Link Header

The `Link` header uses these `rel` types for navigation:

| Rel | Description |
| --- | ----------- |
| `prev` | Previous page or cursor position |
| `next` | Next page or cursor position |
| `first` | First page (when available) |
| `last` | Last page (when available) |

When there are no more results, `rel="next"` is omitted. Likewise, `rel="prev"` is omitted on the first page.

## Invalid Parameters

Bad pagination input (out-of-range page numbers, malformed cursors) returns `422` with the standard [error format](/docs/error-responses).
