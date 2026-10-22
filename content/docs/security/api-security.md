+++
title = "API Security"
description = "The OWASP API Security Top 10 (2023), risk by risk, and the playbook practice that prevents each one, so security is designed in rather than bolted on."
category = "Security"
order = 9.1
tags = ["security", "api", "owasp", "authorization"]
+++

Most API breaches aren't clever. They're an endpoint that returns another customer's record when you change an ID in the URL, found by someone who simply tried. APIs are especially exposed because they're built to be called by programs: an attacker doesn't need to find a hidden page, just read the client's network traffic and start changing values.

The [OWASP API Security Top 10](https://api-security.owasp.org/editions/2023/en/0x11-t10) catalogs the mistakes that keep causing these breaches. The useful observation is that almost none of them need security-specific tooling. They're prevented by ordinary conventions applied everywhere, which is why so many of the fixes below point at other docs in this playbook. Security that depends on each engineer remembering is fragile; security that falls out of the default way you build an endpoint holds.

## API1:2023 Broken Object Level Authorization

Changing `/invoices/123` to `/invoices/124` returns someone else's invoice. It's the most common API flaw for a structural reason: every endpoint that takes an ID can have it, and the check is easy to forget because the happy path works without it.

The fix is to make the ownership check part of how data is fetched, so there's no way to load an object without it:

```sql
-- Wrong: authorization depends on someone remembering to check afterward
SELECT * FROM invoices WHERE id = $1;

-- Right: the query can't return another account's invoice
SELECT * FROM invoices WHERE id = $1 AND account_id = $2;
```

- **Check ownership on every object, every time,** in the data layer, not just at the route. A route-level check protects one endpoint; a scoped query protects every caller of it.
- **Scope queries by tenant** so a missing check returns nothing instead of everything. See [Multi-Tenancy](/docs/architecture/multi-tenancy) (Postgres row-level security as a backstop).
- **Return `404`, not `403`,** for objects in another account, so the API doesn't confirm they exist. See [API Authentication](/docs/api-design/authentication).
- **Unguessable IDs help, but aren't the fix.** [UUID v7](/docs/fundamentals/identifier-conventions) makes enumeration harder, but IDs leak through URLs, logs and shared links. The authorization check is what makes a leaked ID harmless.

## API2:2023 Broken Authentication

Weak tokens, credentials in URLs, no limits on login or token endpoints. Authentication endpoints are where attackers can try millions of guesses for free, so they need defenses the rest of the API doesn't.

- Credentials go in the `Authorization` header, never the URL. Keys are prefixed, hashed at rest, shown once, and rotatable. See [API Authentication](/docs/api-design/authentication).
- Rate limit authentication endpoints much harder than the rest, keyed by account as well as IP, because credential stuffing comes from thousands of addresses at once. See [Rate Limiting](/docs/operations/rate-limiting).

## API3:2023 Broken Object Property Level Authorization

The API returns fields the caller shouldn't see, or accepts fields the caller shouldn't set (`"role": "admin"` in a profile update). It usually comes from convenience: serializing the whole database row, or binding the whole request body to the model. Both work until someone adds a sensitive column, and then every endpoint that took the shortcut leaks it or lets callers write it.

- **Allowlist output.** Serialize explicit fields, never the whole database row. See [JSON Field Conventions](/docs/requests/json-conventions).
- **Allowlist input.** Unknown and read-only fields are rejected with `422`, not silently ignored or, worse, saved.
- **Allowlist expansions.** `expand` only reaches documented relations the caller can read. See [Expanding Responses](/docs/requests/expanding-responses).

## API4:2023 Unrestricted Resource Consumption

No limits means anyone can make you pay for their requests, in compute, money or third-party quota. The bill is often the real damage: one script hitting an endpoint that sends an SMS or calls a paid model can cost more in an afternoon than the feature earns in a month.

- [Rate limits](/docs/operations/rate-limiting) on every endpoint, with headers that tell clients where they stand.
- Size limits everywhere: page size ([Pagination](/docs/requests/pagination)), batch size ([Bulk Operations](/docs/requests/bulk-operations)), request bodies (`QUERY` content is capped at 64 KB, see [HTTP QUERY](/docs/requests/http-query)).
- [Timeouts](/docs/operations/retries-and-timeouts) on every call, and long work moved to [long-running operations](/docs/requests/long-running-operations).
- Spend limits on anything metered: SMS, email, AI tokens.

## API5:2023 Broken Function Level Authorization

A regular user calls an admin endpoint because the UI hides the button but the API doesn't check. Hiding a feature in the interface isn't access control; anyone can call the API directly.

- **Deny by default.** Every route declares the scope it needs, and a route without one doesn't deploy. Allow-by-default means every new endpoint starts open, and the one that ships without a check is the one that gets found.
- **Admin functions live on separate routes,** with separate scopes, never as a flag on a normal endpoint.
- **Test the negative case:** each endpoint has a test that a caller without the scope gets `403`.

## API6:2023 Unrestricted Access to Sensitive Business Flows

Every request is individually valid, but automated at scale it's abuse: buying out inventory, mass account creation, card testing through a payment form.

- Identify the flows that hurt when automated, and limit them by business key (per card, per email, per device), not just per IP. Attackers rotate IP addresses cheaply; they can't rotate the card they're testing.
- Add friction where it's cheap for humans and expensive for bots.
- Alert on the business metric, not just the error rate. See [Observability](/docs/operations/observability).

## API7:2023 Server Side Request Forgery

The API fetches a URL the caller supplied (an avatar, a webhook endpoint, an import) and the caller points it at `169.254.169.254` or an internal admin port.

- Allowlist destinations where possible. Otherwise resolve the host, block private, loopback and link-local ranges, and check every redirect hop. Validating the URL string isn't enough: an innocent-looking hostname can resolve to `127.0.0.1`, and an innocent first response can redirect inward.
- Make outbound fetches through an egress proxy that enforces the rules, rather than validating IPs by hand.
- Never return the fetched response body or detailed errors to the caller.

## API8:2023 Security Misconfiguration

Verbose errors, permissive CORS, missing headers, default credentials, debug endpoints left on.

- One [error format](/docs/requests/error-responses) that never includes stack traces or internal details.
- [Security headers](/docs/security/security-headers) on every response, and CORS that only allows what it must.
- Configuration that's validated at boot and identical in shape across environments. See [Configuration & Secrets](/docs/operations/configuration).

## API9:2023 Improper Inventory Management

Old versions, forgotten staging hosts and undocumented endpoints that nobody patches. You can't secure what you don't know you're running, and attackers are often better at finding your forgotten hosts than you are.

- Every endpoint is in the OpenAPI document, and CI fails if the document and the routes disagree.
- Versions have a published lifecycle with `Deprecation` and `Sunset`, and retired versions actually stop answering. See [Versioning & Deprecation](/docs/operations/versioning).
- Every service has an owner. See [Code Ownership](/docs/engineering/code-ownership).

## API10:2023 Unsafe Consumption of APIs

Trusting data from a third-party API more than user input, because it came from a "partner". A partner can be compromised, misconfigured or simply buggy, and their failure becomes yours the moment you act on their data without checking it.

- Validate third-party responses against a schema, with the same rigor as user input.
- Verify signatures on everything inbound: [webhooks](/docs/payments/webhooks) are rejected unless the HMAC and timestamp check out.
- Time out and fail closed on third-party calls. See [Retries & Timeouts](/docs/operations/retries-and-timeouts).
- Model output is third-party data too. See [AI & LLM Security](/docs/security/ai-security).

## Where to Start

Threat model the API ([Threat Modeling](/docs/security/threat-modeling)), then fix object-level authorization first. It's at the top of the list because it's both the most common and the most damaging, and because the fix, scoping every query, also closes off a whole class of future mistakes.

## References

**Specifications**

- [OWASP: API Security Top 10 (2023)](https://api-security.owasp.org/editions/2023/en/0x11-t10), the ten risks and their names

**Reference**

- [OWASP: Server Side Request Forgery Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html), allowlists, IP range blocking and redirect handling
- [OWASP: Threat Modeling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html), finding these risks before they ship
- [MDN: Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS), what CORS does and does not protect
