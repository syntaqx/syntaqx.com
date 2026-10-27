+++
title = "Multi-Tenancy"
description = "Serving many customers from one system safely: choosing an isolation model, enforcing tenant scope in the database, and keeping noisy neighbors in check."
category = "Architecture"
order = 406
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

Start with shared tables: cheapest to run, one migration updates everyone, and pooled capacity makes small tenants nearly free. The per-tenant models trade that for isolation, and a migration that runs 5,000 times will fail on some of them. Keep the door open to move one large or regulated tenant to its own database later, which is easy if every query is already scoped by tenant and IDs are globally unique, and a rewrite if they aren't.

## `tenant_id` Everywhere

- **Every tenant-owned table has a `tenant_id`,** even when it could be derived through a join. A tenant three joins away is a tenant nobody checks, and a policy on the table can't enforce it.
- **It leads every index and unique constraint:** `UNIQUE (tenant_id, email)`, not `UNIQUE (email)`, so two tenants can each have an `alice@example.com` and every lookup stays inside one tenant's slice of the index.
- **Cache keys, queue partitions, object storage paths and log fields** all include it. A cache key without the tenant is a cross-tenant leak with a TTL.
- **IDs are still globally unique** ([UUID v7](/docs/fundamentals/identifier-conventions)), so data can move between shards or databases without renumbering, and an ID alone never resolves to the wrong tenant's row.

## Enforce It in the Database

Application code will eventually forget a `WHERE tenant_id = ...`, not from carelessness but because there are thousands of queries written over years by people who weren't there when the rule was explained. One missed filter in a reporting endpoint is enough. So the database refuses instead, with Postgres [row-level security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html):

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
- **[`SET LOCAL`](https://www.postgresql.org/docs/current/sql-set.html) scopes the setting to the transaction.** A plain `SET` would persist on the pooled connection, and the next request to borrow it would inherit someone else's tenant.
- **It fails closed.** If no tenant was set, the query errors instead of returning rows: either the setting doesn't exist yet on that connection, or a previous transaction's value has reverted to an empty string that can't be cast to `uuid`.

The cost is modest: the policy adds a predicate to every query (which the leading `tenant_id` index already serves), and every code path that touches tenant data has to run inside a transaction that sets the tenant. That second part is the point.

## Tenant Context

- **Resolved once, at the edge,** from the credential ([API Authentication](/docs/api-design/authentication)), never from a request body or a client-supplied header. If a client can say which tenant it is, an attacker can say which tenant they'd like to be.
- **Propagated explicitly** through the request context, into every database transaction, outbound call, log line and [event](/docs/architecture/events).
- **Background jobs carry it in the message.** A job without a tenant fails instead of running unscoped; "unscoped" in a background job means "every tenant".
- **Cross-tenant operations are separate code paths,** used by internal tooling with their own permissions and an audit trail. Mixing them into tenant code means one flag decides whether a query is scoped.

A resource in another tenant returns `404`, never `403`, which would confirm the ID exists ([Error Responses](/docs/requests/error-responses)).

## Tenant Hierarchies

A flat tenant is rare once customers grow. A game publisher has studios, and studios ship titles. A SaaS customer has an organization with projects ([Google Cloud](https://docs.cloud.google.com/resource-manager/docs/cloud-platform-resource-hierarchy) nests folders between them). A marketplace has sellers, and sellers run several stores. A field service company has regions, and regions have branches. The tenant is still the isolation boundary, but inside it sits a tree, and three things move through that tree in different directions.

**Configuration inherits down, with explicit overrides.** Prices, fee schedules, feature flags, cancellation windows and payout timing are set high in the tree and overridden only where a node needs something different. Store the override on the node that has it and resolve the effective value by walking up to the nearest ancestor that sets it. Never copy the parent's value into its children at creation: copies drift, so change the region's price list and half its branches keep the old one, with no record that anyone chose that.

```sql
WITH RECURSIVE ancestors AS (
  SELECT id, parent_id, 0 AS depth FROM tenant_nodes WHERE id = $1
  UNION ALL
  SELECT n.id, n.parent_id, a.depth + 1
  FROM tenant_nodes n JOIN ancestors a ON n.id = a.parent_id
)
SELECT s.value
FROM ancestors a
JOIN node_settings s ON s.node_id = a.id AND s.key = 'cancellation_window'
ORDER BY a.depth
LIMIT 1;
```

Show the resolved value and where it came from ("inherited from North Region") in the admin UI, because "why does this branch charge that?" is the first support question a hierarchy produces.

**Permissions are scoped to a node.** A grant is a role at a node, and it covers that node's subtree: a studio lead sees every title in the studio, a store manager sees one store, the publisher's finance team sees everything. Google Cloud works the same way: roles granted on a folder "are inherited by all project and folder resources in that folder." Enforce the scope where you enforce the tenant, in the database, so a branch manager's report can't include the next branch because one query forgot a filter. A materialized path ([`ltree`](https://www.postgresql.org/docs/current/ltree.html)) or a closure table makes "is this row inside the user's subtree" an indexed check instead of a recursive query per row. The authorization model itself is in [Authorization](/docs/security/authorization).

**Reporting rolls up from the same entries.** Every number a store sees must sum exactly into its seller's report and the marketplace's. That only works when every level reads the same underlying rows, each tagged with the leaf node it belongs to, and a parent's report is the sum of its subtree. A separate aggregate pipeline per level recomputes fees slightly differently and the totals stop matching. Decide what happens when a node moves (a branch changes regions, a title moves studios): either history follows the node, or each entry stamps the path it had when it was written. Finance usually wants the second.

**Put the hierarchy key wherever a rule can differ.** `tenant_id` goes on every row; the node key (`branch_id`, `store_id`, `project_id`) goes on every row whose rules, permissions or reports vary below the tenant. Discovering later that invoice numbering, tax or a cancellation window differs by branch, on a table that only knows its tenant, is a backfill across years of data.

For worked examples, see [Payments for Software Platforms](/books/payments/software-platforms#the-hierarchy) and [The Field Operations Business](/books/field-operations/field-operations-business#branches-regions-and-the-org-chart).

## Noisy Neighbors

Shared infrastructure means one tenant's traffic spike can become everyone's outage, so isolation covers performance as well as data.

- **[Rate limits](/docs/requests/rate-limiting) per tenant,** not just per IP. A tenant's integration stuck in a retry loop should exhaust that tenant's quota, not the database.
- **Fair queueing.** Background work is partitioned or weighted by tenant, so one tenant's backlog of 2 million jobs doesn't sit in front of everyone else's 10.
- **Per-tenant metrics.** Latency, error rate and resource use by tenant, so you can see who's hot before it's a page. Keep the label bounded: the top tenants by name and the rest grouped, or the metrics system becomes the noisy neighbor.
- **Statement timeouts** on every query, so one tenant's pathological filter can't hold a connection for minutes while the pool drains.

## Testing Isolation

Isolation is a feature, so it has [tests](/docs/engineering/testing). Every integration test runs with at least two tenants and asserts that tenant A can't read, list, update or delete tenant B's data, and a test fails if any tenant-owned table is missing an RLS policy, so a new table can't ship unprotected.

## References

**Reference**

- [PostgreSQL: Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html), RLS behavior, `FORCE` and `BYPASSRLS`
- [PostgreSQL: CREATE POLICY](https://www.postgresql.org/docs/current/sql-createpolicy.html), policy syntax
- [PostgreSQL: SET](https://www.postgresql.org/docs/current/sql-set.html), transaction-scoped `SET LOCAL`
- [PostgreSQL: WITH Queries](https://www.postgresql.org/docs/current/queries-with.html), recursive CTEs for walking a tree to the nearest override
- [PostgreSQL: ltree](https://www.postgresql.org/docs/current/ltree.html), materialized paths for indexed subtree checks
- [Google Cloud: Resource hierarchy](https://docs.cloud.google.com/resource-manager/docs/cloud-platform-resource-hierarchy), organization, folders and projects, with policies inherited down the tree

**In practice**

- [AWS: SaaS Tenant Isolation Strategies](https://docs.aws.amazon.com/whitepapers/latest/saas-tenant-isolation-strategies/saas-tenant-isolation-strategies.html), silo, pool and bridge isolation models
- [AWS: SaaS Lens](https://docs.aws.amazon.com/wellarchitected/latest/saas-lens/saas-lens.html), tenant context and noisy neighbors
- [Amazon Builders' Library: Fairness in Multi-Tenant Systems](https://aws.amazon.com/builders-library/fairness-in-multi-tenant-systems/), per-tenant limits and quotas
- [Microsoft: Architect Multitenant Solutions](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/overview), isolation trade-offs across the stack
