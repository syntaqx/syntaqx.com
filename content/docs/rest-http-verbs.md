+++
title = "REST & HTTP Verbs"
description = "A quick primer on REST architecture and the HTTP methods that drive it."
category = "Fundamentals"
order = -1
tags = ["api", "rest", "http"]
+++

REST (Representational State Transfer) is an architectural style for web services that communicate over HTTP. Resources are identified by URIs, and HTTP methods define what you can do with them.

Following REST keeps APIs predictable: every team member, every client library, and every integration knows the shape of a request before reading a single line of docs.

## HTTP Methods

### GET - Read

Retrieve a resource or collection. Safe and idempotent. Calling it twice changes nothing.

```http
GET /v1/users/8f14e45f-ea6f-4d9d-8a47-2e0538b48e69
```

```json
{
  "id": "8f14e45f-ea6f-4d9d-8a47-2e0538b48e69",
  "name": "Alice",
  "email": "alice@example.com"
}
```

Collections return arrays, even for a single result:

```http
GET /v1/users
```

```json
[
  { "id": "8f14e45f-ea6f-4d9d-8a47-2e0538b48e69", "name": "Alice" },
  { "id": "9c56a27c-1d43-4c75-8575-3c31eb5770e8", "name": "Bob" }
]
```

### POST - Create or Trigger

Create a new resource, or kick off a process. Not idempotent. Sending the same request twice can create duplicates or trigger the action again.

**Creating a resource:**

```http
POST /v1/users
Content-Type: application/json

{ "name": "Alice", "email": "alice@example.com" }
```

```http
HTTP/1.1 201 Created
Location: /v1/users/8f14e45f-ea6f-4d9d-8a47-2e0538b48e69
```

The server assigns the ID. The `Location` header points to the new resource.

**Triggering a process:**

```http
POST /v1/users/8f14e45f-ea6f-4d9d-8a47-2e0538b48e69/reset-password
```

```http
HTTP/1.1 202 Accepted
```

No resource created, just an action dispatched.

### PUT - Replace

Replace a resource entirely at a known URI. Idempotent. Sending it five times leaves the same result as sending it once. Omitted fields may be cleared depending on implementation.

```http
PUT /v1/users/8f14e45f-ea6f-4d9d-8a47-2e0538b48e69
Content-Type: application/json

{ "name": "Alice", "email": "alice-new@example.com" }
```

```http
HTTP/1.1 200 OK
```

### PATCH - Partial Update

Update specific fields without touching the rest. Also idempotent.

```http
PATCH /v1/users/8f14e45f-ea6f-4d9d-8a47-2e0538b48e69
Content-Type: application/json

{ "email": "alice-updated@example.com" }
```

```http
HTTP/1.1 200 OK
```

Only `email` changes. Everything else stays as-is.

### DELETE - Remove

Delete a resource. Idempotent. Deleting something that's already gone still returns success, because the desired state (resource absent) is achieved.

```http
DELETE /v1/users/8f14e45f-ea6f-4d9d-8a47-2e0538b48e69
```

```http
HTTP/1.1 204 No Content
```

## POST vs. PUT vs. PATCH

| Method | Purpose | Idempotent | Scope |
| ------ | ------- | ---------- | ----- |
| POST | Create a resource or trigger a process | No | Collection URI, server assigns the ID |
| PUT | Replace a resource at a known URI | Yes | Full replacement, missing fields may be cleared |
| PATCH | Update specific fields on a resource | Yes | Partial, only provided fields change |

## When to Use What

| Verb | Typical Use |
| ---- | ----------- |
| GET | Fetch a user profile, list orders, read configuration |
| POST | Create a user, submit a form, trigger a webhook |
| PUT | Replace a user's full profile, overwrite a config |
| PATCH | Update an email address, toggle a setting |
| DELETE | Remove a user, revoke a token |
