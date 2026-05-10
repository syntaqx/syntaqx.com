+++
title = "Naming Conventions"
description = "Conventions for naming API routes to ensure consistency and RESTful alignment."
category = "API Design"
order = 1
tags = ["api", "naming", "rest"]
+++

Route naming matters. Consistent naming keeps endpoints predictable, discoverable, and aligned with REST.

## Guiding Principles

### Flat vs. Nested Structure

#### Use a flat structure when:

- The resource can exist independently.
- The resource is global or general in nature.
- There is no logical or required parent-child relationship.

```http
GET /post-tags
GET /comment-statuses
GET /subscription-tiers
```

#### Use a nested structure when:

- The resource is specific to a parent entity.
- The route requires the parent resource's ID.

```http
GET /posts/{postId}/tags
GET /posts/{postId}/comments
GET /users/{userId}/subscriptions
```

### Avoid Conflating Enums With Nested Resources

Routes representing enum-like data (dynamic or otherwise) should not follow the same structure as actual parent-child resources. Use flat structures unless they are tightly bound to a specific instance.

### Enum Routes

If enum-like values need to be served dynamically, you may optionally prefix them with `/enums/` for clarity. This is not required, but can make the nature of the data more obvious.

```http
GET /enums/post-tags
GET /enums/comment-statuses
GET /enums/subscription-tiers
```

> The `/enums/` prefix is discouraged unless the added clarity is necessary. Use your judgment based on the project context.

## Anti-Patterns

| Incorrect Pattern              | Reason                                                                 |
| ------------------------------ | ---------------------------------------------------------------------- |
| `/posts/tags`                  | Implies a relation that doesn't exist                                  |
| `/posts/comments`              | Suggests a nested resource but lacks a specific `postId`               |
| `/users/subscriptions`         | Violates REST by implying subscriptions for a specific user without ID |

## Recommended Patterns

| Type                    | Preferred Pattern                 |
| ----------------------- | --------------------------------- |
| Global/General Resource | `/post-tags`                      |
| Enum-like Resource      | `/comment-statuses`               |
| Parent-child Resource   | `/posts/{postId}/comments`        |
| Optional Enum Prefix    | `/enums/comment-statuses`         |
