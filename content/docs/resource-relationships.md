+++
title = "Resource Relationships"
description = "Modeling associations between resources: direct endpoints vs. relationship endpoints, association data, and keeping route sets minimal."
category = "API Design"
order = 1.5
tags = ["api", "rest", "relationships", "design"]
+++

Every resource has its own CRUD endpoints. Associations between resources get a separate set of endpoints. Mixing the two up leads to APIs that are hard to reason about and harder to maintain.

## Direct Endpoints vs. Association Endpoints

Direct endpoints operate on a resource:

```http
POST   /projects
GET    /projects
GET    /projects/{projectId}
PATCH  /projects/{projectId}
DELETE /projects/{projectId}
```

Association endpoints manage the link between two resources. In a many-to-many relationship like projects and collaborators, the association has its own lifecycle:

```http
POST   /projects/{projectId}/collaborators/{userId}
GET    /projects/{projectId}/collaborators
PATCH  /projects/{projectId}/collaborators/{userId}
DELETE /projects/{projectId}/collaborators/{userId}
```

Note there is no `GET /projects/{projectId}/collaborators/{userId}` detail route here. The user already has a top-level endpoint at `GET /users/{userId}`. The nested routes only manage the association itself.

Each verb means something different depending on which type of endpoint it targets:

| Verb | Direct endpoint | Association endpoint |
| ---- | --------------- | -------------------- |
| `POST` | Creates a new resource | Links two existing resources together |
| `GET` (collection) | Returns all resources | Returns resources linked to the parent |
| `PATCH` | Modifies fields on the resource itself | Modifies fields that belong to the link (e.g. role, permissions) |
| `DELETE` | Destroys the resource | Unlinks the resources without destroying either one |

`DELETE /projects/{projectId}/collaborators/{userId}` removes the user from that project. The user account still exists.

## Association-Specific Data

Links between resources often carry their own fields. A project-collaborator association might track the user's role and when they joined, data that belongs to neither the project nor the user on its own.

```json
{
  "project_id": "01932c6c-7616-7590-a8db-cb4b0e4d1c8a",
  "user_id": "0194a7f3-2b11-7e80-9c3d-4e8f1a2b5c70",
  "role": "editor",
  "joined_at": "2026-04-10T09:15:00Z"
}
```

`PATCH` on the association endpoint updates these link-specific fields. To change the user's name or email, use `PATCH /users/{userId}` instead.

## Fetching Associations

`GET /projects/{projectId}/collaborators` returns the associations for that project. The response might include only link-specific data (role, joined date) or it might inline the full user details. See [Expanding Responses](/docs/expanding-responses) for patterns that give clients control over what gets included.

## Don't Duplicate Detail Routes

When a resource already has a top-level endpoint, adding a nested `GET` detail route is redundant.

```http
GET /teams/{teamId}/members             # Useful: scoped list filtered by team
GET /teams/{teamId}/members/{memberId}  # Redundant
GET /members/{memberId}                 # Already exists, use this
```

The nested collection route filters by the parent, which is valuable. The nested detail route just adds a second URL for the same resource. That means two cache keys, two sets of documentation, and two places to update when the response shape changes. Drop it.

Association-management verbs (`POST` to link, `PATCH` to update the link, `DELETE` to unlink) are still valid on the nested path. Those operate on the association, not the resource itself.

## When Nesting Makes Sense

Nest the endpoint when the child resource only exists in the context of its parent, or when modeling an explicit many-to-many link.

| Scenario | Approach |
| -------- | -------- |
| Line items in an order | Nested: `POST /orders/{orderId}/line-items` |
| Members of a team | Nested: `POST /teams/{teamId}/members/{memberId}` |
| A user's profile | Flat: `GET /users/{userId}` (profile is part of the resource) |
| Categories (global taxonomy) | Flat: `GET /categories` |

For guidance on flat vs. nested naming in general, see [Naming Conventions](/docs/naming-conventions).
