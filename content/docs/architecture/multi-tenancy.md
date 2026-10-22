+++
title = "Multi-Tenancy"
description = "Serving many customers from one system safely: choosing an isolation model, enforcing tenant scope in the database, and keeping noisy neighbors in check."
category = "Architecture"
order = 8.2
tags = ["architecture", "multi-tenancy", "postgres", "security"]
aliases = ["multi-tenancy"]
+++

In a multi-tenant system, the worst bug isn't an outage. It's one customer seeing another customer's data. An outage is an apology; a cross-tenant leak is a breach notification, a lost customer and possibly a regulator. Every design choice here exists to make that bug impossible rather than merely unlikely.

## Isolation Models

| Model | Isolation | Cost per tenant | Operational load | Use when |
| ----- | --------- | --------------- | ---------------- | -------- |
| Shared tables, `tenant_id` column | Logical | Lowest | Lowest | The default, for most SaaS |
| Schema per tenant | Stronger | Medium | Migrations run N times | Moderate tenant counts with custom needs |
| Database per tenant | Strongest | Highest | A fleet to manage | Contractual or regulatory isolation, very large tenants |

Start with shared tables. They're the cheapest to run, one migration updates everyone, and capacity is pooled so small tenants cost almost nothing. The per-tenant models trade that for isolation: a migration that runs 5,000 times will fail on some of them, and you'll spend a week finding which.

Keep the door open to move a single large or regulated tenant to its own database later. That's easy if every query is already scoped by tenant and IDs are globally unique, and a rewrite if they aren't.

## `tenant_id` Everywhere

- **Every tenant-owned table has a `tenant_id`,** even when it could be derived through a join. A tenant derivable through three joins is a tenant nobody checks, and it can't be enforced with a policy on the table itself.
- **It leads every index and unique constraint:** `UNIQUE (tenant_id, email)`, not `UNIQUE (email)`. Two tenants can each have an `alice@example.com` without colliding, and every lookup stays inside one tenant's slice of the index.
- **Cache keys, queue partitions, object storage paths and log fields** all include it. A cache key without the tenant is a cross-tenant leak with a TTL.
- **IDs are still globally unique** ([UUID v7](/docs/fundamentals/identifier-conventions)), so data can move between shards or databases without renumbering, and an ID alone never resolves to the wrong tenant's row.

## Enforce It in the Database

Application code will eventually forget a `WHERE tenant_id = ...`. Not because anyone is careless, but because there are thousands of queries, written over years, by people who weren't there when the rule was explained. A single missed filter in a reporting endpoint is enough. So the database refuses instead, with Postgres [row-level security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html):

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

- **`FORCE` applies the policy to the table owner too.** Superusers and roles with `BYPASSRLS` still skip it, so the application never connects as either. Migrations, which do need the owner role, run under a separate credential.
- **[`SET LOCAL`](https://www.postgresql.org/docs/current/sql-set.html) scopes the setting to the transaction,** so a pooled connection can't carry one tenant's context into the next request. A plain `SET` would persist on the connection, and the next request to borrow it would inherit someone else's tenant.
- **It fails closed.** If no tenant was set, the query errors instead of returning rows: either the setting doesn't exist yet on that connection, or a previous transaction's value has reverted to an empty string that can't be cast to `uuid`.

The cost is modest: the policy adds a predicate to every query (which the leading `tenant_id` index already serves), and every code path that touches tenant data has to run inside a transaction that sets the tenant. That second part is the point.

## Tenant Context

- **Resolved once, at the edge,** from the credential (see [API Authentication](/docs/api-design/authentication)), never from a request body or a client-supplied header. If a client can say which tenant it is, an attacker can say which tenant they'd like to be.
- **Propagated explicitly** through the request context, into every database transaction, outbound call, log line and [event](/docs/architecture/events).
- **Background jobs carry it in the message.** A job without a tenant fails instead of running unscoped; "unscoped" in a background job means "every tenant".
- **Cross-tenant operations are separate code paths,** used by internal tooling with their own permissions and an audit trail. Mixing them into tenant code means one flag decides whether a query is scoped.

A resource in another tenant returns `404`, not `403`. A `403` confirms the ID exists, which tells an attacker their guess was right.

## Noisy Neighbors

Shared infrastructure means one tenant's traffic spike can become everyone's outage. Isolation covers performance as well as data.

- **Rate limits per tenant,** not just per IP. A tenant's integration bug that retries in a tight loop should exhaust that tenant's quota, not the database. See [Rate Limiting](/docs/operations/rate-limiting).
- **Fair queueing.** Background work is partitioned or weighted by tenant, so one tenant's backlog of 2 million jobs doesn't sit in front of everyone else's 10.
- **Per-tenant metrics.** Latency, error rate and resource use by tenant, so you can see who's hot before it's a page. Keep the label bounded: the top tenants by name and the rest grouped, or the metrics system becomes the noisy neighbor.
- **Statement timeouts** on every query, so one tenant's pathological filter can't hold a connection for minutes while the pool drains.

## Testing Isolation

Isolation is a feature, so it has tests:

- Every integration test runs with at least two tenants, and asserts that tenant A can't read, list, update or delete tenant B's data.
- A test fails if any tenant-owned table is missing an RLS policy, so a new table can't ship unprotected.

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
