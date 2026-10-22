+++
title = "Authorization"
description = "Deciding what an authenticated caller may do: RBAC, ABAC and relationship-based models, where checks belong, object-level access, and testing deny-by-default."
category = "Security"
order = 9.15
tags = ["security", "authorization", "access-control", "api"]
+++

Authentication answers "who is this?". Authorization answers "may they do this, to this, right now?". The first is mostly solved: you use a standard ([API Authentication](/docs/api-design/authentication)) and a well-tested library. The second is specific to your product, written by your team, and spread across every endpoint, which is why it's where the breaches are. Broken object-level authorization has led the OWASP API Security Top 10 in both editions ([API Security](/docs/security/api-security)), and it's rarely a sophisticated attack: someone changes an ID in a URL and gets another customer's data.

## Choosing a Model

| Model | Decides by | Fits | Strains when |
| ----- | ---------- | ---- | ------------ |
| RBAC: role-based | The caller's roles ("admin", "billing") | Coarse permissions over features | Every exception becomes a new role, until there are hundreds |
| ABAC: attribute-based | Attributes of caller, resource and context ("owner of this record, during business hours, from this region") | Rules that depend on the data | Policies are hard to read and to list "who can access X" |
| ReBAC: relationship-based | Relationships ("member of the team that owns this folder") | Sharing, hierarchies, documents, organizations | You need infrastructure for the relationship graph |

Most products need a mix. Roles for coarse feature access ("can this user manage billing at all?"), and object-level rules for the data ("is this invoice in their account?"). RBAC alone fails the second question by design: a role says what kind of thing you can do, not which records you can do it to, and teams that try to make roles carry that end up with a role per customer. Relationship-based access is what Google built Zanzibar for: its paper describes trillions of access-control lists and millions of checks per second, at a 95th-percentile latency under 10 ms. You probably don't need that scale, but the model (check a relationship path from user to object) fits anything with sharing, and open-source implementations like OpenFGA follow it.

## Where Checks Belong

**On the server, at every object access.** Hiding a button in the UI isn't authorization; the API behind it still answers anyone who calls it. Every endpoint checks, on every request, against the specific object being read or changed, not just the endpoint.

**In one policy layer, called everywhere.** When each handler writes its own `if user.role == ...`, the rules drift: one endpoint forgets the account check, another checks the wrong field. Put the decision in one place, a function or service every handler calls with (caller, action, resource), and keep the handlers free of policy. That also makes the policy reviewable as a whole and testable on its own.

**Fetch through the scope, not after it.** The safest check is the one you can't skip: load records through a query that's already scoped to what the caller may see (`WHERE account_id = $caller_account AND id = $id`), so a missing check returns nothing rather than someone else's row. In a multi-tenant database, row-level security makes that scope a property of the connection, so even a query that forgets the filter can't cross tenants ([Multi-Tenancy](/docs/architecture/multi-tenancy)).

**Deny by default.** No rule matched means no access. A new endpoint, a new resource type or a new role starts with nothing until a rule grants it. The opposite default turns every forgotten rule into an open door.

**Answer `404` for what they can't see.** When a caller asks for an object outside their scope, return `404`, not `403`: a `403` confirms the object exists, which tells an attacker their guessed ID is valid ([API Authentication](/docs/api-design/authentication)). Reserve `403` for things they can see but not change.

## Least Privilege

Grant the smallest permission that does the job, and make broader access a deliberate step. Scopes on API keys and OAuth tokens are the same idea at the token level: a key that only reads payments can't refund one, so a leaked key does less damage. Default new keys to restricted scopes and make full access an explicit choice.

## Staff and Support Access

Internal tools are where least privilege usually breaks, because "support needs to see everything" is easy to justify. Give staff access to customer data its own rules: granted for a reason, scoped to the customer in question, time-limited, and every access logged with who, what, when and why ([Sensitive Data](/docs/payments/sensitive-data)). "Impersonate this customer" features need the strictest version: the session shows the customer's view but records the staff member as the actor, and changes made while impersonating are flagged.

## Policy as Code

When rules grow past a handful, express them as policy in a dedicated language rather than scattered `if` statements. Open Policy Agent (OPA) evaluates policies written in Rego and is used across infrastructure and applications. Cedar, the language behind Amazon Verified Permissions, is designed for RBAC and ABAC and for policies that can be analyzed and validated against a schema. Either one gives you policies you can review, version and test separately from the code that enforces them. Neither is required: a single well-tested authorization module in your own language is a perfectly good policy layer for most products. What matters is one place, not a particular engine.

## Testing Authorization

Authorization bugs don't break the happy path, so normal tests miss them. Test the denials explicitly:

- **For every endpoint, a request as the wrong user** (another account, a lower role, a revoked key) must fail. Generate these from the route list, so a new endpoint without a denial test fails CI.
- **Cross-tenant tests**: create data as account A, request it with account B's credentials, by ID, through every endpoint that takes an ID.
- **Field-level tests** where responses vary by permission: a field the caller may not see must be absent, not merely hidden in the UI.

A test suite where every endpoint proves it says no is the cheapest defense against the most common API breach.

## Caching Decisions Safely

Authorization checks are on the hot path, so caching them is tempting. Cache carefully: a cached "yes" outlives the permission it was based on, so a user removed from a team keeps access until the cache expires. Keep the time to live short, invalidate when roles or memberships change, and never cache a decision across tenants or without the full (caller, action, resource) in the key. Responses that vary by caller must be `private` so a shared cache can't serve one user's data to another ([Caching](/docs/requests/caching)).

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
