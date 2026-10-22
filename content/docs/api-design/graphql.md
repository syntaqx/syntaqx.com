+++
title = "GraphQL in Depth"
nav_title = "GraphQL"
description = "Designing a GraphQL schema that survives years of change: nullability, connections, mutation payloads, N+1, cost limits, authorization, caching and federation."
category = "API Design"
order = 1.85
tags = ["graphql", "api", "schema", "performance", "security"]
+++

[API Styles](/docs/api-design/api-styles) argues when GraphQL is the right call: a first-party client composing many resources into exactly the shape a screen needs. This page is what to do once you've made that call. Most GraphQL pain isn't GraphQL's fault. It comes from schemas designed like database dumps, servers with no cost controls, and authorization bolted onto resolvers one at a time. All three are decisions you make in the first month and live with for years.

## Design the Schema for the Client

A GraphQL schema is a product, not a projection of your tables. The temptation is to generate types from the ORM and expose every column. That couples every client to your storage, leaks internal names into a contract you can't easily change, and exposes fields nobody asked for that you now have to secure and support.

Design from the screens inward. Name things the way the product talks about them, expose only what a client needs, and treat every field as a promise. Adding later is cheap; removing is a deprecation cycle.

### Nullable by Default, and Why That's Right

The spec makes every field nullable unless you mark it Non-Null with `!`. That feels backwards to anyone coming from typed languages, and the instinct is to put `!` everywhere. Resist it.

The reason is how GraphQL handles failure. When a resolver fails, the field becomes `null` and an entry goes in the `errors` array. If that field was declared Non-Null, the null can't sit there, so it propagates to the nearest nullable parent. Mark too much as Non-Null and one failing field on one item in a list wipes out the whole list, or the whole response. A product page that should have rendered everything except the reviews widget instead renders nothing.

The rule I use:

- **Non-Null** for fields that can't fail independently of their parent: `id`, scalar columns loaded with the row, and fields the parent can't exist without.
- **Nullable** for anything resolved separately: a call to another service, a relationship that might be missing, anything behind its own authorization check.
- **Arguments and input fields** are the opposite case. Make them Non-Null whenever they're required, because that's the server telling the client what it must send, and relaxing a required argument later is a safe change while tightening one is breaking.

Going from nullable to Non-Null on an output field is safe for clients. Going the other way breaks every client that assumed a value. Start nullable; tighten when you're sure.

### Global Object IDs

Give every entity that a client might refetch an `id: ID!` that's unique across the whole schema, not just within its type, and expose a `node(id: ID!)` field that can fetch any of them. This is the Global Object Identification convention, and it's what lets a normalized client cache (more below) store each object once and update it everywhere it appears.

The ID should be opaque to the client. Encoding the type and the database key (base64 of `Order:1234`, or better, a [prefixed ID](/docs/fundamentals/identifier-conventions) like `ord_...`) lets the `node` resolver route without a lookup. Clients should never parse it.

### Lists Are Connections

Any list that can grow goes through a connection, the Relay cursor connections convention: `edges { cursor node }` plus `pageInfo { hasNextPage endCursor }`, paged with `first`/`after` (and `last`/`before` if you need backwards). It's verbose, and that's the point: a bare `[Order!]!` has no room for paging, totals or per-edge data, and changing it later is breaking.

```graphql
type Customer implements Node {
  id: ID!
  name: String!
  orders(first: Int!, after: String): OrderConnection!
}

type OrderConnection {
  edges: [OrderEdge!]!
  pageInfo: PageInfo!
}

type OrderEdge {
  cursor: String!
  node: Order
}
```

Make `first` required and cap it. An unbounded list argument is a cost-control hole. Cursors are opaque for the same reasons as in [REST pagination](/docs/requests/pagination): they let you change the paging strategy without breaking anyone. Small, fixed lists (the three addresses on an account) can stay plain lists.

### Mutations: One Input, One Payload

Each mutation takes a single input object and returns its own payload type:

```graphql
type Mutation {
  updateShippingAddress(input: UpdateShippingAddressInput!): UpdateShippingAddressPayload!
}

type UpdateShippingAddressPayload {
  order: Order
  userErrors: [UserError!]!
}

type UserError {
  field: [String!]
  code: String!
  message: String!
}
```

The input object can gain optional fields without breaking callers. The payload can gain fields (the updated order, a warning, a related object the client should refresh) without breaking callers either. A mutation that returns `Order` directly has no room for either.

Name mutations as specific actions, `cancelOrder` or `updateShippingAddress`, not a generic `updateOrder` that accepts anything. Specific mutations are easier to authorize, audit and evolve, for the same reasons the REST conventions model [actions as their own sub-resources](/docs/api-design/naming-conventions).

## Errors: Two Kinds, Two Channels

GraphQL has one built-in error channel, the top-level `errors` array, and it's the wrong place for most errors a client must handle.

The `errors` array is for things the client didn't cause and can't fix: a resolver threw, a backend timed out, the query was invalid. Entries have a message, a path and free-form `extensions`, and clients generally treat them as "something went wrong." A response can have both partial results and errors, which is GraphQL's strength: one failing widget doesn't take the page down.

Expected failures belong in the schema, where the client is forced to see them:

- **`userErrors` in mutation payloads** for validation: the card was declined, the email is taken, the quantity exceeds stock. The client renders them next to the right field. This is Shopify's convention, and it works.
- **Union result types** when a query has distinct outcomes the client should branch on: `union OrderResult = Order | OrderNotFound | OrderAccessDenied`. The client's `__typename` switch handles each one, and the type checker reminds it when you add one.

The test: if a well-behaved client should show the user something specific, it's in the schema. If it should show a generic error and report it, it's in `errors`. Stuffing validation into `errors` with a magic code in `extensions` gives clients an untyped, undocumented contract, which is the one thing GraphQL is supposed to fix.

## Evolve, Don't Version

GraphQL APIs don't take version numbers, and they don't need to. Clients ask for exactly the fields they use, so adding a field affects nobody, and you can see (from operation logs or persisted documents) exactly who still uses a field you want to remove.

The lifecycle:

1. **Add** the new field or type alongside the old one.
2. **Deprecate** the old one with `@deprecated(reason: "Use shippingAddress.")`. It stays selectable; tooling flags it, and introspection marks it.
3. **Measure** usage per client from your operation logs. This is the part teams skip, and it's the part that makes removal safe.
4. **Remove** when usage reaches zero, or when the [deprecation window](/docs/operations/versioning) you promised has passed and you've told the stragglers.

What counts as breaking is the same as in REST: removing or renaming a field, changing its type, making an output nullable, making an argument required, removing an enum value clients send. Adding an enum value clients receive is breaking for clients with exhaustive switches; document that enums can grow, and have clients handle unknown values.

Run a schema diff in CI that fails the build on a breaking change without an explicit override. Breaking changes should be a decision, never an accident.

## N+1 and DataLoader

Resolvers run per field, per object. Ask for 50 orders and each order's customer, and a naive server runs one query for the orders and fifty for the customers. That's the N+1 problem, and every GraphQL server has it by default.

The standard fix is [DataLoader](https://github.com/graphql/dataloader): each resolver calls `customerLoader.load(order.customerId)`, and DataLoader collects every `load` made in the same tick of execution into one batch call, `SELECT ... WHERE id = ANY($1)`. Fifty queries become one.

Two rules that bite people:

- **The batch function returns results in key order, one per key**, with `null` or an error for missing ones. Databases don't return rows in the order you asked, so reorder by key. A mismatched order hands one customer's data to another order.
- **Create loaders per request, never globally.** DataLoader caches by key for the life of the instance. A global loader caches across users, which means one user's authorized result can be served to another. Per request, the cache is a correctness feature (the same customer loaded twice in one query is consistent); across requests, it's a data leak.

Batching fixes query counts, not query cost. A connection that loads 100 items with 5 nested lists each is still a lot of rows. That's what cost limits are for.

## Cost Control Is Not Optional

In REST, the server decides how much work a request does. In GraphQL, the caller does. A query nesting `friends { friends { friends } }` three levels deep at 100 each asks for a million objects in one request, and a rate limit that counts requests sees one.

Every GraphQL server needs, from the first day it's reachable:

- **Depth limits**, with a tighter limit on nested lists, since lists multiply.
- **Breadth and alias limits.** Aliases let one query call the same expensive field a hundred times under different names. Cap top-level fields, aliases and batched operations.
- **Required, capped page sizes** on every connection, so cost is computable before execution.
- **Cost analysis.** Weight each field (a scalar is 0 or 1, a connection costs its page size times its children), compute the cost before executing, reject anything over a ceiling, and charge the cost against the client's [rate limit](/docs/operations/rate-limiting) budget instead of counting requests. GitHub's public API does exactly this, with an hourly point budget and a hard cap on nodes per call.
- **Timeouts**, as a backstop, because estimates are estimates.

### Trusted Documents

For a first-party API, go further: only run queries you've seen before. At build time, the client extracts every operation, the server stores them by hash, and production requests send the hash instead of the query text. The server executes only known documents and rejects everything else.

This is the single most effective GraphQL security control. Arbitrary queries from attackers are simply not executable, cost is known per operation in advance, request bodies shrink, and you get an exact inventory of which client uses which fields. It doesn't work for a public API, where third-party queries can't be known ahead of time; that's where cost analysis carries the weight.

Disabling introspection in production is sometimes recommended for the same reason. It hides the schema from casual probing, but it's obscurity, not a control. Trusted documents are the control.

## Authorization at Every Node

The classic GraphQL security bug: `order(id:)` checks that the caller owns the order, but `customer.orders`, `node(id:)` and `search` each return orders through a different path, and one of them doesn't check. GraphQL makes this worse than REST because every type is reachable from many entry points, and the client picks the path.

The fix is structural, as in [Authorization](/docs/security/authorization): check access where the object is loaded, not where the field is declared. If every path to an `Order` goes through one loader or one domain function that enforces the rule, no new field can bypass it. Checks in individual resolvers will be forgotten in one of them.

Field-level rules (an `email` only visible to admins) follow the same principle: one place that decides, called by the resolver, with the field nullable so a denial can return `null` without failing the parent. And the `node` field deserves its own test, because it's a universal lookup by ID: [broken object-level authorization](/docs/security/api-security) waiting to happen if the per-type check isn't there.

## Caching

HTTP caching mostly doesn't apply to GraphQL, and this is its biggest operational cost compared to REST. Queries are usually `POST` to one URL, so CDNs and browsers see one endpoint with varying bodies, and there's no resource URL to cache or invalidate.

What replaces it:

- **Normalized client caches.** Apollo Client, Relay and urql store each object once, keyed by `__typename` and `id`, and every query that includes that object reads the same entry. Update an order through a mutation that returns it, and every screen showing that order updates. This is why global IDs and mutation payloads that return the changed object matter.
- **Persisted queries over GET.** With trusted documents, a query is a hash plus variables, which fits in a URL. Send read-only operations as `GET` and they become cacheable by a CDN with normal `Cache-Control`, as long as the response doesn't vary by user.
- **Server-side caching below the graph**, in the loaders and services resolvers call, using the techniques in [Application Caching](/docs/architecture/application-caching). Caching whole responses at the GraphQL layer is rarely worth it: the combination of fields and variables makes the hit rate poor, and per-user authorization makes it dangerous.

## Federation, Carefully

Federation splits one graph across teams: each team owns a subgraph, and a router composes them into a supergraph that clients query as one API. Apollo Federation is the most widely used implementation, and the GraphQL Foundation's Composite Schemas working group is standardizing the approach, though that spec is still at an early stage.

It solves a real problem: a single GraphQL server that ten teams commit to becomes a coordination bottleneck. It also brings real costs:

- **A router in every request**, which plans queries across subgraphs and becomes critical infrastructure to run, upgrade and observe.
- **Distributed N+1.** A query spanning three subgraphs makes sequential network hops, and entity resolution across subgraphs needs the same batching discipline as DataLoader, now over the network.
- **Composition as a deploy gate.** A subgraph change that breaks composition must fail that team's CI, so you need schema checks against the live supergraph, not just per-service tests.
- **Ownership questions** for shared types: who owns `Customer` when four subgraphs add fields to it?

Use federation when the organizational problem is real: several teams, independent deploys, a single client-facing graph that must stay coherent. Before that point, one GraphQL service organized into modules gives you the same schema with none of the network. This is the [service boundaries](/docs/architecture/service-boundaries) argument applied to the graph: split along team lines when teams need independence, not before.

## Subscriptions Cost More Than They Look

Subscriptions are a long-lived request that pushes results when a source event fires. They're the right tool for genuinely live data: a chat, a dashboard watching an order move, collaborative editing.

They're also stateful connections on a stack built for stateless requests: WebSockets or SSE to keep open, load balancers to configure for them, per-connection memory, an event source (usually pub/sub) feeding every server, authorization re-checked on every event, not just at subscribe time, and reconnection logic on the client that has to resubscribe and catch up on missed events.

Before reaching for them, ask whether polling a cheap query every few seconds is good enough. For most "live" UIs, it is, and it reuses everything you already have. Use subscriptions when latency genuinely matters or the polling cost would be real.

## References

**Specifications**

- [GraphQL Specification (October 2021)](https://spec.graphql.org/October2021/), nullability, Non-Null propagation, `@deprecated`, subscriptions
- [Relay: GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm), connections, edges, `pageInfo` and opaque cursors
- [GraphQL Composite Schemas Specification](https://github.com/graphql/composite-schemas-spec), the Foundation's in-progress standard for composing subgraphs

**Reference**

- [GraphQL: Response](https://graphql.org/learn/response/), partial results alongside `errors`
- [GraphQL: Global Object Identification](https://graphql.org/learn/global-object-identification/), globally unique IDs and the `node` field
- [GraphQL: Pagination](https://graphql.org/learn/pagination/), why connections
- [GraphQL: Security](https://graphql.org/learn/security/), depth, breadth, alias and cost limits, and trusted documents
- [GraphQL: Caching](https://graphql.org/learn/caching/), client-side normalized caching by ID
- [GraphQL: Authorization](https://graphql.org/learn/authorization/), authorization in the business logic layer
- [DataLoader](https://github.com/graphql/dataloader), per-request batching and caching, and the batch function contract
- [Apollo Federation](https://www.apollographql.com/docs/graphos/schema-design/federated-schemas/federation), subgraphs, the router and the supergraph

**In practice**

- [GitHub: GraphQL rate and node limits](https://docs.github.com/en/graphql/overview/rate-limits-and-node-limits-for-the-graphql-api), point-based query cost and a node cap per call
- [Shopify: GraphQL Admin API](https://shopify.dev/docs/api/admin-graphql), mutation payloads with `userErrors`
