+++
title = "Error Responses"
description = "Standard error response format and HTTP status codes used across the API."
category = "Requests & Responses"
order = 2
tags = ["api", "errors", "standards"]
+++

Every error returns the same JSON shape, regardless of the status code.

## Format

Two fields:

- **`message`**: What went wrong, in plain language.
- **`errors`** *(optional)*: Field-level validation failures. Keys are field names, values are arrays of messages.

### Example: Validation Error (422)

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "first_name": ["The first name must be a string."]
  }
}
```

### Example: Not Found (404)

```json
{
  "message": "The requested endpoint could not be found."
}
```

## Status Codes

The HTTP status code tells you what happened. There's no `success` boolean in the body.

| Code | Meaning | When |
| ---- | ------- | ---- |
| `200` | OK | Request succeeded |
| `400` | Bad Request | Malformed or unservable request |
| `401` | Unauthorized | Authentication required |
| `403` | Forbidden | Understood, but not allowed |
| `404` | Not Found | Resource doesn't exist |
| `422` | Unprocessable Entity | Validation failed |
| `429` | Too Many Requests | [Rate limit](/docs/rate-limiting) exceeded |
| `500` | Internal Server Error | Something broke server-side |
