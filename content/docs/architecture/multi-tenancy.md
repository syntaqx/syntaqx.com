+++
title = "Multi-Tenancy"
description = "Serving many customers from one system safely: choosing an isolation model, enforcing tenant scope in the database, and keeping noisy neighbors in check."
category = "Architecture"
order = 8.2
tags = ["architecture", "multi-tenancy", "postgres", "security"]
aliases = ["multi-tenancy"]
+++

In a multi-tenant system, the worst bug isn't an outage. It's one customer seeing another customer's data. Every design choice here exists to make that bug impossible rather than unlikely.

## Isolation Models

| Model | Isolation | Cost per tenant | Operational load | Use when |
| ----- | --------- | --------------- | ---------------- | -------- |
| Shared tables, `tenant_id` column | Logical | Lowest | Lowest | The default, for most SaaS |
| Schema per tenant | Stronger | Medium | Migrations run N times | Moderate tenant counts with custom needs |
| Database per tenant | Strongest | Highest | Fleet management | Contractual or regulatory isolation, very large tenants |

Start with shared tables. Keep the door open to move a single large or regulated tenant to its own database later, which is easy if every query is already tenant-scoped and hard if it isn't.

## `tenant_id` Everywhere

- **Every tenant-owned table has a `tenant_id`,** even when it could be derived through a join. Derivable isn't enforceable.
- **It leads every index and unique constraint:** `UNIQUE (tenant_id, email)`, not `UNIQUE (email)`. Tenants can have the same values without colliding, and lookups stay inside one tenant's range.
- **Cache keys, queue partitions, object storage paths and log fields** all include it.
- **IDs are still globally unique** ([UUID v7](/docs/fundamentals/identifier-conventions)), so data can move between shards or databases without renumbering.

## Enforce It in the Database

Application code will eventually forget a `WHERE tenant_id = ...`. Make the database refuse instead, with Postgres [row-level security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html):

```sql
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON payments
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

Each request sets the tenant at the start of its transaction:

```sql
SET LOCAL app.tenant_id = '01932c6c-7616-7590-a8db-cb4b0e4d1c8a';
```

- `FORCE` applies the policy to the table owner too. Superusers and roles with `BYPASSRLS` still skip it, so the application never connects as one.
- [`SET LOCAL`](https://www.postgresql.org/docs/current/sql-set.html) scopes the setting to the transaction, so a pooled connection can't leak one tenant's context into the next request.
- If the setting is missing, `current_setting` raises an error. Failing closed is the point.

## Tenant Context

- **Resolved once, at the edge,** from the credential (see [API Authentication](/docs/api-design/authentication)), never from a request body or a client-supplied header.
- **Propagated explicitly** through the request context, into every database transaction, outbound call, log line and [event](/docs/architecture/events).
- **Background jobs carry it in the message.** A job without a tenant fails instead of running unscoped.
- **Cross-tenant operations are separate code paths,** used by internal tooling with their own permissions and an audit trail.

A resource in another tenant returns `404`, not `403`. Don't confirm it exists.

## Noisy Neighbors

One tenant's traffic spike shouldn't become everyone's outage.

- **Rate limits per tenant,** not just per IP. See [Rate Limiting](/docs/operations/rate-limiting).
- **Fair queueing.** Background work is partitioned or weighted by tenant so one tenant's backlog of 2 million jobs doesn't starve everyone else.
- **Per-tenant metrics.** Latency, error rate and resource use by tenant, so you can see who's hot before it's a page. Use a bounded label: top tenants by name, the rest grouped.
- **Statement timeouts** on every query, so one tenant's pathological filter can't hold a connection for minutes.

## Testing Isolation

Isolation is a feature, so it has tests:

- Every integration test runs with at least two tenants, and asserts that tenant A can't read, list, update or delete tenant B's data.
- A test fails if any tenant-owned table is missing an RLS policy.

See [Testing Strategy](/docs/engineering/testing).

## References

**Reference**

- [PostgreSQL: Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html), RLS behavior, `FORCE` and `BYPASSRLS`
- [PostgreSQL: CREATE POLICY](https://www.postgresql.org/docs/current/sql-createpolicy.html), policy syntax
- [PostgreSQL: SET](https://www.postgresql.org/docs/current/sql-set.html), transaction-scoped `SET LOCAL`

**In practice**

- [AWS: SaaS Tenant Isolation Strategies](https://docs.aws.amazon.com/whitepapers/latest/saas-tenant-isolation-strategies/saas-tenant-isolation-strategies.html), silo, pool and bridge isolation models
- [AWS: SaaS Lens](https://docs.aws.amazon.com/wellarchitected/latest/saas-lens/saas-lens.html), tenant context and noisy neighbors
- [Amazon Builders' Library: Fairness in Multi-Tenant Systems](https://aws.amazon.com/builders-library/fairness-in-multi-tenant-systems/), per-tenant limits and quotas
- [Microsoft: Architect Multitenant Solutions](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/overview), isolation trade-offs across the stack
