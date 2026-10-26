+++
title = "API Security"
description = "The OWASP API Security Top 10 (2023), risk by risk, and the playbook practice that prevents each one, so security is designed in rather than bolted on."
category = "Security"
order = 706
tags = ["security", "api", "owasp", "authorization"]
+++

Most API breaches aren't clever. They're an endpoint that returns another customer's record when you change an ID in the URL, found by someone who simply tried. APIs are especially exposed because they're built to be called by programs: an attacker doesn't need a hidden page, just the client's network traffic and the patience to change values.

The [OWASP API Security Top 10](https://api-security.owasp.org/editions/2023/en/0x11-t10) catalogs the mistakes that keep causing these breaches, and almost none of them need security tooling. They're prevented by ordinary conventions applied everywhere, which is why most fixes below point at other chapters. Security that depends on each engineer remembering is fragile; security that falls out of the default way you build an endpoint holds.

## API1:2023 Broken Object Level Authorization

Changing `/invoices/123` to `/invoices/124` returns someone else's invoice. It's the most common flaw for a structural reason: every endpoint that takes an ID can have it, and the happy path works without the check. The fix is to make ownership part of how data is fetched, as [Authorization](/docs/security/authorization) sets out:

```sql
-- Wrong: authorization depends on someone remembering to check afterward
SELECT * FROM invoices WHERE id = $1;

-- Right: the query can't return another account's invoice
SELECT * FROM invoices WHERE id = $1 AND account_id = $2;
```

A route-level check protects one endpoint; a scoped query protects every caller of it, and row-level security ([Multi-Tenancy](/docs/architecture/multi-tenancy)) backstops a forgotten filter. Unguessable IDs like [UUID v7](/docs/fundamentals/identifier-conventions) make enumeration harder but aren't the fix: IDs leak through URLs, logs and shared links, and only the check makes a leaked ID harmless.

## API2:2023 Broken Authentication

Weak tokens, credentials in URLs, no limits on login or token endpoints, where attackers can try millions of guesses for free.

- Credentials go in the `Authorization` header, never the URL. Keys are prefixed, hashed at rest, shown once, and rotatable. See [API Authentication](/docs/api-design/authentication).
- Rate limit authentication endpoints much harder than the rest, keyed by account as well as IP, because credential stuffing comes from thousands of addresses at once. See [Rate Limiting](/docs/requests/rate-limiting).

## API3:2023 Broken Object Property Level Authorization

The API returns fields the caller shouldn't see, or accepts fields they shouldn't set (`"role": "admin"` in a profile update). It comes from convenience: serializing the whole row, or binding the whole body to the model. Both work until someone adds a sensitive column, and then every shortcut leaks it or lets callers write it.

- **Allowlist output.** Serialize explicit fields, never the whole database row. See [JSON Field Conventions](/docs/requests/json-conventions).
- **Allowlist input.** Unknown and read-only fields are rejected with `422`, not silently ignored or, worse, saved.
- **Allowlist expansions.** `expand` only reaches documented relations the caller can read. See [Resource Relationships](/docs/api-design/resource-relationships).

## API4:2023 Unrestricted Resource Consumption

Without limits, anyone can make you pay for their requests in compute, money or third-party quota. The bill is often the real damage: one script hitting an endpoint that sends an SMS or calls a paid model can cost more in an afternoon than the feature earns in a month.

- [Rate limits](/docs/requests/rate-limiting) on every endpoint, with headers that tell clients where they stand.
- Size limits everywhere: page size ([Pagination](/docs/requests/pagination)), batch size ([Bulk Operations](/docs/requests/bulk-operations)), request bodies (`QUERY` content is capped at 64 KB, see [HTTP QUERY](/docs/requests/http-query)).
- [Timeouts](/docs/architecture/retries-and-timeouts) on every call, and long work moved to [long-running operations](/docs/requests/long-running-operations).
- Spend limits on anything metered: SMS, email, AI tokens.

## API5:2023 Broken Function Level Authorization

A regular user calls an admin endpoint because the UI hides the button but the API doesn't check. The fixes are [Authorization](/docs/security/authorization)'s: deny by default, so a route that declares no scope doesn't deploy; admin functions on separate routes with separate scopes, never a flag on a normal endpoint; and a test per endpoint that a caller without the scope gets `403`.

## API6:2023 Unrestricted Access to Sensitive Business Flows

Every request is individually valid, but automated at scale it's abuse: buying out inventory, mass account creation, card testing through a payment form.

- Identify the flows that hurt when automated, and limit them by business key (per card, email or device), not just per IP. Attackers rotate IPs cheaply; they can't rotate the card they're testing.
- Add friction where it's cheap for humans and expensive for bots.
- Alert on the business metric, not just the error rate. See [Observability](/docs/operations/observability).

## API7:2023 Server Side Request Forgery

The API fetches a URL the caller supplied (an avatar, a webhook endpoint, an import) and the caller points it at `169.254.169.254` or an internal admin port.

- Allowlist destinations where possible. Otherwise resolve the host, block private, loopback and link-local ranges, and check every redirect hop: an innocent hostname can resolve to `127.0.0.1`, and an innocent first response can redirect inward.
- Route outbound fetches through an egress proxy that enforces the rules, rather than validating IPs by hand.
- Never return the fetched response body or detailed errors to the caller.

## API8:2023 Security Misconfiguration

Verbose errors, permissive CORS, missing headers, default credentials, debug endpoints left on.

- One [error format](/docs/requests/error-responses) that never includes stack traces or internal details.
- [Security headers](/docs/security/security-headers) on every response, and CORS that only allows what it must.
- Configuration that's validated at boot and identical in shape across environments. See [Environments](/docs/operations/environments).

## API9:2023 Improper Inventory Management

Old versions, forgotten staging hosts and undocumented endpoints nobody patches. Attackers are often better at finding your forgotten hosts than you are.

- Every endpoint is in the OpenAPI document, and CI fails if the document and the routes disagree.
- Versions have a published lifecycle with `Deprecation` and `Sunset`, and retired versions actually stop answering. See [Versioning & Deprecation](/docs/api-design/versioning).
- Every service has an owner. See [Code Ownership](/docs/engineering/code-ownership).

## API10:2023 Unsafe Consumption of APIs

Trusting a third-party API more than user input because it's a "partner". A partner can be compromised, misconfigured or buggy, and their failure becomes yours the moment you act on their data unchecked.

- Validate third-party responses against a schema, with the same rigor as user input.
- Verify signatures on everything inbound: [webhooks](/docs/api-design/webhooks) are rejected unless the HMAC and timestamp check out.
- Time out and fail closed on third-party calls. See [Retries & Timeouts](/docs/architecture/retries-and-timeouts).
- Model output is third-party data too. See [AI & LLM Security](/docs/security/ai-security).

## Where to Start

[Threat model](/docs/security/threat-modeling) the API, then fix object-level authorization first. It's the most common and the most damaging, and its fix, scoping every query, closes off a whole class of future mistakes.

## References

**Specifications**

- [OWASP: API Security Top 10 (2023)](https://api-security.owasp.org/editions/2023/en/0x11-t10), the ten risks and their names

**Reference**

- [OWASP: Server Side Request Forgery Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html), allowlists, IP range blocking and redirect handling
- [OWASP: Threat Modeling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html), finding these risks before they ship
- [MDN: Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS), what CORS does and does not protect
