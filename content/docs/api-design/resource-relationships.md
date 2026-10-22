+++
title = "Relationships & Expansion"
description = "Links between resources as their own sub-resources (PUT to link, DELETE to unlink), and related objects as IDs unless the client asks to expand them."
category = "API Design"
order = 203
tags = ["api", "rest", "relationships", "expand", "design"]
aliases = ["resource-relationships", "requests/expanding-responses", "expanding-responses"]
+++

Every resource points at others: a user collaborates on a project, an order has a customer. An API has to decide how a client changes a relationship without touching the things it connects, and how much of the graph each response carries. Get the first wrong and the API deletes Alice when someone meant to take her off a project. Get the second wrong and a client either makes three extra requests per screen or downloads data it never reads.

My answers: a relationship is a resource of its own, and related objects come back as IDs unless the client asks to expand them.

## Links Are Resources

Each resource has its own endpoints at its own top-level URL ([Naming Conventions](/docs/api-design/naming-conventions)). The link between two of them (a user collaborating on a project) lives under the parent it's scoped to, addressed by both IDs:

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

The link's URL is known before it exists, since the two IDs name it. That's what `PUT` is for, and its idempotency matters: when a client retries after a dropped connection, a `PUT` is a no-op, while a `POST` forces the server to call the second link a duplicate or an error, and the client to handle a `409` for something that succeeded. "Make sure Alice is on this project", the everyday need of a sync job, is exactly a `PUT`.

```http
PUT /projects/01932c6c-7616-7590-a8db-cb4b0e4d1c8a/collaborators/0194a7f3-2b11-7e80-9c3d-4e8f1a2b5c70
Content-Type: application/json

{ "role": "editor" }
```

`201 Created` the first time, `200 OK` when the link already existed. `DELETE` unlinks idempotently the same way.

## Data on the Link

Links often carry facts that belong to neither side: Alice's role on this project, when she joined. Those live on the link:

```json
{
  "project_id": "01932c6c-7616-7590-a8db-cb4b0e4d1c8a",
  "user_id": "0194a7f3-2b11-7e80-9c3d-4e8f1a2b5c70",
  "role": "editor",
  "joined_at": "2026-04-10T09:15:00Z"
}
```

`PATCH` on the link changes the role. A link that accumulates many fields is really a first-class resource (a membership) and deserves its own ID.

## One URL Per Resource

A nested list is useful: `GET /teams/{teamId}/members` is a filter you can't easily express otherwise. A nested detail route usually isn't. `GET /teams/{teamId}/members/{userId}` is a second URL for `/users/{userId}`, which means two cache keys that go stale independently, two places in the docs, and two response shapes that drift apart. Keep the nested path for the link's own operations and data, and send clients to the resource's own URL for the resource.

Some children really are nested, because they have no life outside their parent: an order's line items. Those are plain nested resources, not links, created with `POST` because the server assigns their IDs.

Decide up front what deleting one side does to its links: deleting a project removes its collaborator links, deleting a user removes them from every project. A link that lists a user who no longer exists is the one outcome to rule out, so enforce it with foreign keys (`ON DELETE CASCADE` on the link table), not in application code a new path can skip.

## IDs by Default

In responses, related resources appear as `{relation}_id` fields:

```json
{
  "id": "49b2a928-c215-43fc-a022-9ac49143ab07",
  "amount": 3650,
  "currency": "USD",
  "customer_id": "c7e1b9a4-3204-41ed-a1eb-0242ac120002",
  "status": "completed"
}
```

The default response is small, fast and the same for everyone, so it caches well.

## Expanding on Request

When a screen also needs the customer, `expand` inlines it in the same request. The expanded object appears under the relationship's name, and the `_id` field stays:

```http
GET /orders/49b2a928-c215-43fc-a022-9ac49143ab07?expand[]=customer&expand[]=refunds
```

```json
{
  "id": "49b2a928-c215-43fc-a022-9ac49143ab07",
  "amount": 3650,
  "currency": "USD",
  "customer_id": "c7e1b9a4-3204-41ed-a1eb-0242ac120002",
  "customer": {
    "id": "c7e1b9a4-3204-41ed-a1eb-0242ac120002",
    "email": "jane@example.com",
    "name": "Jane Doe"
  },
  "refunds": [
    { "id": "01932c6c-7616-7590-a8db-cb4b0e4d1c8a", "amount": 1200, "status": "succeeded" }
  ],
  "status": "completed"
}
```

- **`expand[]=` is the canonical form.** `expand=customer` is accepted for one value, but server-generated links (like [Pagination](/docs/requests/pagination)'s `Link` headers) always use `expand[]=`.
- **Expansion only adds.** Code that reads `customer_id` keeps working whether or not someone added an expansion.
- **Nested expansion uses dots** (`expand[]=refunds.payment`), and on a list, expansions apply to each item.

Expansion hands the client a lever on how much work the server does, so it gets limits like any other input:

- **Only documented relationships expand.** Anything else is a `422` ([Error Responses](/docs/requests/error-responses)); an open-ended `expand` is an open-ended join.
- **Two levels deep at most.** Each level multiplies the work, and on a list of 100 items it multiplies it 100 times.
- **Authorization applies to every expanded object.** Expanding `customer` on an order the caller can see must not reveal a customer they can't. Expansion is a classic place to forget that check, which is [broken object-level authorization](/docs/security/api-security); an expansion fails exactly as the direct request would.
- **Expensive relationships stay out.** Anything that calls a slow third party or scans a large table is its own endpoint.

Always embedding makes every response pay for every relationship. JSON:API-style side-loading needs an envelope, which [JSON Field Conventions](/docs/requests/json-conventions) rules out. Clients that need to choose every field are asking for [GraphQL](/docs/api-design/graphql), not an ever-growing `expand`. Stripe popularized `expand`, and its long use there is good evidence it holds up.

## References

**Specifications**

- [RFC 9110: HTTP Semantics, PUT](https://datatracker.ietf.org/doc/html/rfc9110#name-put), creating or replacing a resource at a known URI

**Reference**

- [OWASP: API1:2023 Broken Object Level Authorization](https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/), why every expanded object needs its own authorization check

**In practice**

- [Google AIP-124: Resource association](https://google.aip.dev/124), modeling many-to-many relationships
- [Google AIP-122: Resource names](https://google.aip.dev/122), when a resource has a parent and when it stands alone
- [Stripe: Expanding Responses](https://docs.stripe.com/api/expanding_objects), the `expand[]` parameter, dot paths for nested expansion, and a depth limit
- [JSON:API: Inclusion of Related Resources](https://jsonapi.org/format/#fetching-includes), the side-loading alternative
- [Zalando RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/), limits on nesting depth and sub-resources
