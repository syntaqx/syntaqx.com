+++
title = "Resource Relationships"
description = "Modeling links between resources as their own sub-resources: PUT to link, DELETE to unlink, data on the link itself, and no duplicate URLs for the same thing."
category = "API Design"
order = 1.5
tags = ["api", "rest", "relationships", "design"]
aliases = ["resource-relationships"]
+++

Most API design arguments about relationships come from one confusion: treating the link between two resources as if it were one of the resources. "Remove Alice from the project" and "delete Alice" are different operations, and an API that can't tell them apart will eventually do the second when someone meant the first.

So I model a relationship as a resource of its own, with its own URL and lifecycle, separate from the things it connects.

## Resources and Links

Each resource has its own endpoints, at its own top-level URL:

```http
POST   /projects
GET    /projects/{projectId}
PATCH  /projects/{projectId}
DELETE /projects/{projectId}

GET    /users/{userId}
```

The link between them (a user collaborating on a project) lives under the parent it's scoped to, addressed by both IDs:

```http
GET    /projects/{projectId}/collaborators
PUT    /projects/{projectId}/collaborators/{userId}
PATCH  /projects/{projectId}/collaborators/{userId}
DELETE /projects/{projectId}/collaborators/{userId}
```

The same verb means something different on each kind of URL, and that's the point:

| Verb | On a resource | On a link |
| ---- | ------------- | --------- |
| `PUT` / `POST` | Creates the resource | Links two existing resources |
| `GET` (list) | All resources | Resources linked to this parent |
| `PATCH` | Changes the resource's fields | Changes the link's fields (role, permissions) |
| `DELETE` | Destroys the resource | Unlinks; both resources survive |

`DELETE /projects/{projectId}/collaborators/{userId}` takes Alice off the project. Her account is untouched.

## Link With PUT, Not POST

The link's URL is fully known before it exists: the project ID and the user ID name it. That's exactly what `PUT` is for. It's also idempotent, which matters here more than it looks:

- A client adds a collaborator, the connection drops, the client retries. With `PUT`, the retry is a no-op and returns the same link. With `POST`, the server has to decide whether a second link is a duplicate or an error, and clients have to handle `409` for an operation that succeeded.
- "Make sure Alice is on this project" is a common need (a sync job, a provisioning script). `PUT` expresses it directly.

```http
PUT /projects/01932c6c-7616-7590-a8db-cb4b0e4d1c8a/collaborators/0194a7f3-2b11-7e80-9c3d-4e8f1a2b5c70
Content-Type: application/json

{ "role": "editor" }
```

`201 Created` the first time, `200 OK` when the link already existed. Unlinking with `DELETE` is idempotent the same way.

## Data on the Link

Links often carry facts that belong to neither side: Alice's role on this project, when she joined. Those live on the link, not on the user or the project:

```json
{
  "project_id": "01932c6c-7616-7590-a8db-cb4b0e4d1c8a",
  "user_id": "0194a7f3-2b11-7e80-9c3d-4e8f1a2b5c70",
  "role": "editor",
  "joined_at": "2026-04-10T09:15:00Z"
}
```

`PATCH` on the link changes the role. Changing Alice's name is `PATCH /users/{userId}`. If the link starts accumulating many fields of its own, that's a sign it's a first-class resource (a membership, an enrollment) and deserves its own top-level ID.

## One URL Per Resource

A nested list is useful: `GET /teams/{teamId}/members` is "this team's members", a filter you can't easily express otherwise. A nested detail route usually isn't:

```http
GET /teams/{teamId}/members            # useful: the team's members
GET /teams/{teamId}/members/{userId}   # usually a second URL for /users/{userId}
```

Two URLs for the same user means two cache keys that go stale independently, two places in the docs, and two response shapes that drift apart. Keep the nested path for the link's own operations and its link data, and send clients to the resource's own URL for the resource itself. Whether a list returns just the link data or inlines each user is up to the client: see [Expanding Responses](/docs/requests/expanding-responses).

## When the Child Really Is Nested

Some resources have no life outside their parent: an order's line items, an invoice's lines. Those are plain nested resources, not links, and `POST` creates them because the server assigns their IDs:

| Scenario | Model |
| -------- | ----- |
| Line items on an order | Nested resource: `POST /orders/{orderId}/line-items` |
| A user on a team | Link: `PUT /teams/{teamId}/members/{userId}` |
| A user's own profile | Part of the user: `GET /users/{userId}` |
| A global taxonomy | Flat: `GET /categories` |

## Deleting Linked Resources

Decide up front what deleting one side does to its links, and document it: deleting a project removes its collaborator links; deleting a user removes them from every project. What you never want is a dangling link that lists a user who no longer exists. Enforce it in the database with foreign keys (`ON DELETE CASCADE` on the link table), not in application code that a new code path can skip.

## References

**Specifications**

- [RFC 9110: HTTP Semantics, PUT](https://datatracker.ietf.org/doc/html/rfc9110#name-put), creating or replacing a resource at a known URI

**In practice**

- [Google AIP-124: Resource association](https://google.aip.dev/124), modeling many-to-many relationships
- [Google AIP-122: Resource names](https://google.aip.dev/122), when a resource has a parent and when it stands alone
- [Martin Fowler: Richardson Maturity Model](https://martinfowler.com/articles/richardsonMaturityModel.html), resources with their own URIs as the foundation
- [Zalando RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/), limits on nesting depth and sub-resources
