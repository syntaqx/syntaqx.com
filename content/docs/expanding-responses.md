+++
title = "Expanding Responses"
description = "Use the expand parameter to include related resources inline within API responses."
category = "Requests & Responses"
order = 6
tags = ["api", "expand", "rest"]
+++

By default, only top-level resource fields are returned. Use the `expand` parameter to include related objects inline within the response.

## Using the `expand` Parameter

Use the `expand` query parameter to include related fields in the response.

- **Single expansion**: `expand=field_name` to expand one relationship.
- **Multiple expansions**: `expand[]=field_1&expand[]=field_2` to expand multiple relationships.

> You can always provide expansion as `expand[]=field` even when requesting only one. Both forms are valid.

## Default Behavior

When no expansion is requested, related resources are returned as ID references:

```http
GET /v1/orders/49b2a928-c215-43fc-a022-9ac49143ab07
```

```json
{
  "id": "49b2a928-c215-43fc-a022-9ac49143ab07",
  "amount": 3650,
  "customer_id": "c7e1b9a4-3204-41ed-a1eb-0242ac120002",
  "status": "completed",
  "created_at": "2025-03-14T06:13:07Z",
  "updated_at": "2025-03-14T06:13:07Z"
}
```

## Single Expansion

To expand a single relationship, such as `customer`:

```http
GET /v1/orders/49b2a928-c215-43fc-a022-9ac49143ab07?expand=customer
```

```json
{
  "id": "49b2a928-c215-43fc-a022-9ac49143ab07",
  "amount": 3650,
  "customer_id": "c7e1b9a4-3204-41ed-a1eb-0242ac120002",
  "customer": {
    "id": "c7e1b9a4-3204-41ed-a1eb-0242ac120002",
    "email": "jane@example.com",
    "name": "Jane Doe",
    "created_at": "2025-03-10T12:00:00Z"
  },
  "status": "completed",
  "created_at": "2025-03-14T06:13:07Z",
  "updated_at": "2025-03-14T06:13:07Z"
}
```

## Multiple Expansions

To expand multiple relationships, use the `expand[]` syntax:

```http
GET /v1/orders/49b2a928-c215-43fc-a022-9ac49143ab07?expand[]=customer&expand[]=refunds
```

```json
{
  "id": "49b2a928-c215-43fc-a022-9ac49143ab07",
  "amount": 3650,
  "customer_id": "c7e1b9a4-3204-41ed-a1eb-0242ac120002",
  "customer": {
    "id": "c7e1b9a4-3204-41ed-a1eb-0242ac120002",
    "email": "jane@example.com",
    "name": "Jane Doe"
  },
  "refunds": [
    {
      "id": "70785cf1-db13-3ed1-ae90-4694fe0bd431",
      "amount": 1200,
      "reason": "fraudulent",
      "status": "succeeded"
    },
    {
      "id": "2533f596-282f-3d2c-ba4f-188bcc4d9d36",
      "amount": 800,
      "reason": "requested_by_customer",
      "status": "pending"
    }
  ],
  "status": "completed",
  "created_at": "2025-03-14T06:13:07Z",
  "updated_at": "2025-03-14T06:13:07Z"
}
```

## Design Considerations

- **ID preservation**: Expanding a relationship does not remove the corresponding `*_id` field. `customer_id` is always present alongside an expanded `customer` object.
- **Syntax consistency**: Use `expand[]=field_name` for multiple expansions to avoid ambiguity.
- **Validation**: The server validates `expand` values. Only valid, authorized relationships are expanded. Unsupported expansions return a [standard error response](/docs/error-responses).
- **Performance**: Expanding relationships increases response size. Clients should expand only what they need.
