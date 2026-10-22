+++
title = "GraphQL in Depth"
nav_title = "GraphQL"
description = "Designing a GraphQL schema that survives years of change: nullability, connections, mutation payloads, N+1, cost limits, authorization, caching and federation."
category = "API Design"
order = 207
tags = ["graphql", "api", "schema", "performance", "security"]
+++

[Choosing an API Style](/docs/api-design/api-styles) argues when GraphQL is the right call: a first-party client composing many resources into exactly the shape a screen needs. Once you've made that call, most of the pain that follows isn't GraphQL's fault. It comes from schemas designed like database dumps, servers with no cost controls, and authorization bolted onto resolvers one at a time: decisions made in the first month and lived with for years.

## Design the Schema for the Client

A GraphQL schema is a product, not a projection of your tables. Generating types from the ORM couples every client to your storage, leaks internal names into a contract you can't easily change, and exposes fields nobody asked for that you now have to secure and support. Design from the screens inward: name things the way the product talks, expose only what a client needs, and treat every field as a promise. Adding later is cheap; removing is a deprecation cycle.

### Nullable by Default, and Why That's Right

The spec makes every field nullable unless you mark it Non-Null with `!`. That feels backwards coming from typed languages, and the instinct is to put `!` everywhere. Resist it, because of how GraphQL handles failure. When a resolver fails, the field becomes `null` and an entry goes in the `errors` array. If the field was declared Non-Null, the null propagates to the nearest nullable parent, so with too much Non-Null, one failing field on one list item wipes out the whole list, or the whole response. A product page that should have rendered everything but the reviews widget renders nothing.

My rule:

- **Non-Null** for fields that can't fail independently of their parent: `id`, scalar columns loaded with the row, and fields the parent can't exist without.
- **Nullable** for anything resolved separately: a call to another service, a relationship that might be missing, anything behind its own authorization check.
- **Arguments and input fields** are the opposite case: Non-Null whenever required. That tells the client what it must send, and relaxing a required argument later is safe while tightening one is breaking.

On outputs it runs the other way: nullable to Non-Null is safe for clients, the reverse breaks every client that assumed a value. Start nullable; tighten when you're sure.

### Global Object IDs

Give every entity a client might refetch an `id: ID!` that's unique across the whole schema, not just its type, and a `node(id: ID!)` field that fetches any of them. This Global Object Identification convention is what lets a normalized client cache store each object once and update it everywhere it appears. The ID is opaque to clients; encoding the type in it (base64 of `Order:1234`, or a type prefix like `ord_...`) lets the `node` resolver route without a lookup ([Identifier Conventions](/docs/fundamentals/identifier-conventions)).

### Lists Are Connections

Any list that can grow is a Relay cursor connection: `edges { cursor node }` plus `pageInfo { hasNextPage endCursor }`, paged with `first`/`after`. It's verbose on purpose: a bare `[Order!]!` has no room for paging, totals or per-edge data, and changing it later is breaking.

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

Make `first` required and cap it; an unbounded list argument is a cost-control hole. Cursors are opaque for the same reasons as in [REST pagination](/docs/requests/pagination). Small, fixed lists (the three addresses on an account) can stay plain lists.

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

Both sides can then grow without breaking callers: the input gains optional fields, the payload gains a warning or a related object to refresh. A mutation that returns `Order` directly has no room for either. Name mutations as specific actions (`cancelOrder`, not a generic `updateOrder`): they're easier to authorize, audit and evolve, for the same reasons REST models [actions as sub-resources](/docs/api-design/naming-conventions).

## Errors: Two Kinds, Two Channels

GraphQL's one built-in error channel, the top-level `errors` array, is the wrong place for most errors a client must handle. It's for things the client didn't cause and can't fix: a resolver threw, a backend timed out, the query was invalid. Clients treat its entries as "something went wrong", and partial results beside them are GraphQL's strength: one failing widget doesn't take the page down.

Expected failures belong in the schema, where the client is forced to see them:

- **`userErrors` in mutation payloads** for validation: the card was declined, the email is taken, the quantity exceeds stock. The client renders them next to the right field. This is Shopify's convention, and it works.
- **Union result types** when a query has distinct outcomes the client should branch on: `union OrderResult = Order | OrderNotFound | OrderAccessDenied`. The client's `__typename` switch handles each one, and the type checker reminds it when you add one.

The test: if a well-behaved client should show the user something specific, it's in the schema; if it should show a generic error and report it, it's in `errors`. Validation stuffed into `errors` with a magic code in `extensions` is an untyped, undocumented contract, the one thing GraphQL is supposed to fix.

## Evolve, Don't Version

GraphQL APIs don't need version numbers. Clients ask for exactly the fields they use, so adding a field affects nobody, and operation logs show exactly who still uses a field you want to remove. The lifecycle:

1. **Add** the new field or type alongside the old one.
2. **Deprecate** the old one with `@deprecated(reason: "Use shippingAddress.")`. It stays selectable; tooling flags it, and introspection marks it.
3. **Measure** usage per client from your operation logs. This is the part teams skip, and it's the part that makes removal safe.
4. **Remove** when usage reaches zero, or when the [deprecation window](/docs/api-design/versioning) you promised has passed and you've told the stragglers.

What counts as breaking is the same as in [REST](/docs/api-design/versioning): removing or renaming a field, changing its type, making an output nullable, making an argument required. Document that enums can grow, so clients handle unknown values. Run a schema diff in CI that fails on a breaking change without an explicit override: breaking changes should be a decision, never an accident.

## N+1 and DataLoader

Resolvers run per field, per object. Ask for 50 orders and each order's customer, and a naive server runs one query for the orders and fifty for the customers. Every GraphQL server has this N+1 problem by default. The standard fix is [DataLoader](https://github.com/graphql/dataloader): resolvers call `customerLoader.load(order.customerId)`, and DataLoader collects every `load` in the same tick into one batch call, `SELECT ... WHERE id = ANY($1)`. Two rules bite people:

- **The batch function returns results in key order, one per key**, with `null` or an error for missing ones. Databases don't return rows in the order you asked, so reorder by key. A mismatched order hands one customer's data to another order.
- **Create loaders per request, never globally.** DataLoader caches by key for the instance's life, so a global loader serves one user's authorized result to another. Per request, the cache keeps one query consistent; across requests, it's a data leak.

Batching fixes query counts, not query cost. That's what cost limits are for.

## Cost Control Is Not Optional

In REST, the server decides how much work a request does; in GraphQL, the caller does. `friends { friends { friends } }` at 100 each asks for a million objects in one request, and a rate limit that counts requests sees one. From the first day it's reachable, every GraphQL server needs:

- **Depth limits**, with a tighter limit on nested lists, since lists multiply.
- **Breadth and alias limits.** Aliases let one query call the same expensive field a hundred times under different names. Cap top-level fields, aliases and batched operations.
- **Required, capped page sizes** on every connection, so cost is computable before execution.
- **Cost analysis.** Weight each field (a scalar is 0 or 1, a connection costs its page size times its children), compute the cost before executing, reject anything over a ceiling, and charge the cost against the client's [rate limit](/docs/requests/rate-limiting) budget instead of counting requests. GitHub's public API does exactly this, with an hourly point budget and a hard cap on nodes per call.
- **Timeouts**, as a backstop, because estimates are estimates.

### Trusted Documents

For a first-party API, go further: only run queries you've seen before. At build time the client extracts every operation, the server stores them by hash, and production requests send the hash. Everything else is rejected. It's the single most effective GraphQL security control: attackers' arbitrary queries can't execute, cost is known per operation in advance, and you get an exact inventory of which client uses which fields. A public API can't know third-party queries ahead of time, so there cost analysis carries the weight. Disabling introspection hides the schema from casual probing, but that's obscurity; trusted documents are the control.

## Authorization at Every Node

The classic GraphQL security bug: `order(id:)` checks that the caller owns the order, but `customer.orders`, `node(id:)` and `search` each return orders through a different path, and one doesn't check. Every type is reachable from many entry points, and the client picks the path. The fix is structural, as in [Authorization](/docs/security/authorization): check access where the object is loaded, not where the field is declared, so every path to an `Order` goes through one function that enforces the rule. Field-level rules (an `email` only admins see) work the same way, with the field nullable so a denial returns `null` without failing the parent. And `node` deserves its own test: a universal lookup by ID is [broken object-level authorization](/docs/security/api-security) waiting to happen.

## Caching

HTTP caching mostly doesn't apply, GraphQL's biggest operational cost compared to REST: queries are usually `POST` to one URL, so there's no resource URL to cache or invalidate. What replaces it:

- **Normalized client caches.** Apollo Client, Relay and urql store each object once, keyed by `__typename` and `id`. A mutation that returns the changed order updates every screen showing it, which is why global IDs and mutation payloads matter.
- **Persisted queries over GET.** With trusted documents, a query is a hash plus variables, which fits in a URL. Send read-only operations as `GET` and they become cacheable by a CDN with normal `Cache-Control`, as long as the response doesn't vary by user.
- **Server-side caching below the graph**, in the loaders and services resolvers call ([Application Caching](/docs/architecture/application-caching)). Caching whole responses is rarely worth it: field and variable combinations make the hit rate poor, and per-user authorization makes it dangerous.

## Federation, Carefully

Federation splits one graph across teams: each owns a subgraph, and a router composes them into a supergraph that clients query as one API. Apollo Federation is the most widely used implementation; the GraphQL Foundation's Composite Schemas spec is standardizing it, still at an early stage. It solves a real problem, a single server ten teams commit to, and brings real costs:

- **A router in every request**, which plans queries across subgraphs and becomes critical infrastructure to run, upgrade and observe.
- **Distributed N+1.** A query spanning three subgraphs makes sequential network hops, and entity resolution across subgraphs needs the same batching discipline as DataLoader, now over the network.
- **Composition as a deploy gate.** A subgraph change that breaks composition must fail that team's CI, so you need schema checks against the live supergraph, not just per-service tests.
- **Ownership questions** for shared types: who owns `Customer` when four subgraphs add fields to it?

Use it when the organizational problem is real. Before then, one GraphQL service organized into modules gives you the same schema with none of the network: the [service boundaries](/docs/architecture/service-boundaries) argument applied to the graph.

## Subscriptions Cost More Than They Look

Subscriptions push results when a source event fires, the right tool for genuinely live data: a chat, collaborative editing. They're also stateful connections on a stack built for stateless requests: WebSockets or SSE to keep open, load balancers configured for them, per-connection memory, pub/sub feeding every server, authorization re-checked on every event, and clients that resubscribe and catch up after reconnecting. For most "live" UIs, polling a cheap query every few seconds is good enough and reuses everything you have. Use subscriptions when latency genuinely matters.

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
