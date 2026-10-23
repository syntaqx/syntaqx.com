+++
title = "Authorization"
description = "Deciding what an authenticated caller may do: RBAC, ABAC and relationship-based models, where checks belong, object-level access, and testing deny-by-default."
category = "Security"
order = 704
tags = ["security", "authorization", "access-control", "api"]
+++

Authentication, [for people](/docs/security/authentication) or [for API callers](/docs/api-design/authentication), answers "who is this?", and it's mostly solved: a standard and a well-tested library. Authorization answers "may they do this, to this, right now?", and it's specific to your product, written by your team and spread across every endpoint, which is why it's where the breaches are. Broken object-level authorization has led the OWASP API Security Top 10 in both editions ([API Security](/docs/security/api-security)), and it's rarely a sophisticated attack: someone changes an ID in a URL and gets another customer's data.

## Choosing a Model

| Model | Decides by | Fits | Strains when |
| ----- | ---------- | ---- | ------------ |
| RBAC: role-based | The caller's roles ("admin", "billing") | Coarse permissions over features | Every exception becomes a new role, until there are hundreds |
| ABAC: attribute-based | Attributes of caller, resource and context ("owner of this record, during business hours, from this region") | Rules that depend on the data | Policies are hard to read and to list "who can access X" |
| ReBAC: relationship-based | Relationships ("member of the team that owns this folder") | Sharing, hierarchies, documents, organizations | You need infrastructure for the relationship graph |

Most products need a mix: roles for coarse feature access ("can this user manage billing at all?") and object-level rules for the data ("is this invoice in their account?"). RBAC alone fails the second by design: a role says what kind of thing you can do, not to which records, and teams that make roles carry that end up with a role per customer. Relationship-based access is what Google built Zanzibar for: its paper describes trillions of access-control lists and millions of checks per second, at a 95th-percentile latency under 10 ms. You probably don't need that scale, but the model (check a relationship path from user to object) fits anything with sharing, and open-source implementations like OpenFGA follow it.

## Where Checks Belong

**On the server, at every object access.** Hiding a button isn't authorization; the API behind it still answers anyone who calls it. Every request checks against the specific object being read or changed, not just the endpoint.

**In one policy layer, called everywhere.** When each handler writes its own `if user.role == ...`, the rules drift: one forgets the account check, another checks the wrong field. Put the decision in one function or service every handler calls with (caller, action, resource), so the policy is reviewable as a whole and testable on its own.

**Fetch through the scope, not after it.** The safest check is the one you can't skip: load records through a query that's already scoped to what the caller may see (`WHERE account_id = $caller_account AND id = $id`), so a missing check returns nothing rather than someone else's row. In a multi-tenant database, row-level security makes that scope a property of the connection, so even a query that forgets the filter can't cross tenants ([Multi-Tenancy](/docs/architecture/multi-tenancy)).

**Deny by default.** No rule matched means no access: a new endpoint, resource type or role starts with nothing until a rule grants it. The opposite default turns every forgotten rule into an open door.

**Answer `404` for what they can't see.** For an object outside the caller's scope, return `404`, not `403`: a `403` confirms the object exists, telling an attacker their guessed ID is valid. Reserve `403` for things they can see but not change.

## Least Privilege

Grant the smallest permission that does the job, and make broader access a deliberate step. Scopes on API keys and OAuth tokens apply it per token: a key that only reads payments can't refund one, so a leaked key does less damage. Default new keys to restricted scopes.

## Staff and Support Access

Internal tools are where least privilege usually breaks, because "support needs to see everything" is easy to justify. Give staff access to customer data its own rules: granted for a reason, scoped to the customer in question, time-limited, and every access logged with who, what, when and why ([Sensitive Data](/docs/payments/sensitive-data)). "Impersonate this customer" features need the strictest version: the session shows the customer's view but records the staff member as the actor, and changes made while impersonating are flagged.

## Policy as Code

When rules grow past a handful, a policy language beats scattered `if` statements. Open Policy Agent (OPA) evaluates policies written in Rego across infrastructure and applications; Cedar, behind Amazon Verified Permissions, is designed for RBAC and ABAC policies that can be analyzed and validated against a schema. Either gives you policies you review, version and test apart from the code that enforces them. Neither is required: one well-tested authorization module in your own language is a fine policy layer for most products. What matters is one place, not a particular engine.

## Testing Authorization

Authorization bugs don't break the happy path, so normal tests miss them. Test the denials explicitly:

- **For every endpoint, a request as the wrong user** (another account, a lower role, a revoked key) must fail. Generate these from the route list, so a new endpoint without a denial test fails CI.
- **Cross-tenant tests**: create data as account A, request it with account B's credentials, by ID, through every endpoint that takes an ID.
- **Field-level tests** where responses vary by permission: a field the caller may not see must be absent, not merely hidden in the UI.

A suite where every endpoint proves it says no is the cheapest defense against the most common API breach.

## Caching Decisions Safely

Authorization checks sit on the hot path, so caching them is tempting, but a cached "yes" outlives the permission behind it: a user removed from a team keeps access until it expires. Keep the time to live short, invalidate when roles or memberships change, and never cache a decision across tenants or without the full (caller, action, resource) in the key. Responses that vary by caller must be `private` so a shared cache can't serve one user's data to another ([Caching](/docs/requests/caching)).

## This Site

syntaqx.com has no accounts, so it makes no authorization decisions: every endpoint is public and identical for every caller. That's a deliberate departure from the playbook, recorded in [ADR 0001](https://github.com/syntaqx/syntaqx.com/blob/main/docs/adr/0001-no-authentication-or-user-identity.md). The one place it scopes by caller is `POST /echo`, whose idempotency keys are scoped to the caller's IP so one client can't replay another's response ([Idempotency](/docs/payments/idempotency)).

## References

**Specifications**

- [NIST: Role-Based Access Control](https://csrc.nist.gov/projects/role-based-access-control), the RBAC model
- [NIST SP 800-162: Guide to Attribute Based Access Control](https://csrc.nist.gov/pubs/sp/800/162/upd2/final), the ABAC model
- [RFC 6749: OAuth 2.0](https://datatracker.ietf.org/doc/html/rfc6749), access token scopes

**Reference**

- [OWASP API1:2023 Broken Object Level Authorization](https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/), the most common API vulnerability
- [OWASP API5:2023 Broken Function Level Authorization](https://api-security.owasp.org/editions/2023/en/0xa5-broken-function-level-authorization/), endpoints that skip role checks
- [OWASP: Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html), deny by default, checks on every request, and testing authorization logic
- [PostgreSQL: Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html), scoping enforced by the database
- [Open Policy Agent](https://www.openpolicyagent.org/docs/latest/), a general-purpose policy engine with the Rego language
- [Cedar](https://docs.cedarpolicy.com/), a policy language for RBAC and ABAC, behind Amazon Verified Permissions

**In practice**

- [Google: Zanzibar](https://research.google/pubs/zanzibar-googles-consistent-global-authorization-system/), relationship-based authorization at global scale (USENIX ATC 2019)
- [OpenFGA](https://openfga.dev/), an open-source relationship-based authorization system modeled on Zanzibar
