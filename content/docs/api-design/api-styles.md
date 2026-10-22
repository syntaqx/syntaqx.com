+++
title = "Choosing an API Style"
description = "REST, GraphQL, gRPC and events: what each one optimizes for, what it costs, and how to pick by who the consumer is rather than by what's fashionable."
category = "API Design"
order = 1.8
tags = ["api", "rest", "graphql", "grpc", "architecture"]
+++

The question is rarely "which style is best". It's "who calls this, and what do they need from the contract". A public API used by thousands of strangers, a frontend your own team ships every day, and a service three hops deep in your backend have different problems, and each style is a different answer to one of them. Pick by the consumer and you rarely regret it. Pick by fashion and you spend a year building around the style's weak spots.

## What Each One Optimizes For

| Style | Optimizes for | Pays for it with |
| ----- | ------------- | ---------------- |
| REST over HTTP | Strangers: anything that speaks HTTP can call it, cache it, retry it and debug it with `curl` | Several round trips to assemble a view; payload shape fixed by the server |
| GraphQL | One client composing many resources into exactly the shape a screen needs, in one request | HTTP caching, cost control and authorization all move into your server code |
| gRPC | Internal service-to-service calls: a typed contract, generated clients, streaming, deadlines | Browsers can't call it directly; harder to inspect; needs tooling at every layer |
| Events and webhooks | Telling others something happened, without them polling | Eventual consistency, ordering, duplicates and delivery become your problem |

## REST: The Default for Anyone You Don't Control

A public API's consumers are strangers with every language, framework and level of skill. What helps them most is the thing they already know: HTTP. Methods say whether a call is safe to retry, status codes say what happened, `Cache-Control` and ETags let every proxy and browser cache work for free, and when something breaks they can reproduce it with `curl` and read the response. Every one of those properties comes from the protocol, so you don't have to build or document it ([REST & HTTP Verbs](/docs/fundamentals/rest-http-verbs), [Caching](/docs/requests/caching)).

The real weaknesses are over-fetching and round trips: a screen that needs a customer, their last five orders and each order's items can take several requests. The playbook answers that without leaving HTTP: [expansion](/docs/requests/expanding-responses) inlines related resources on request, and [HTTP QUERY](/docs/requests/http-query) carries a structured query that doesn't fit in a URL. That covers most of what people reach for GraphQL to solve, while keeping caching and retry semantics intact.

## GraphQL: When One Client Composes Many Resources

GraphQL's real strength is a client that owns its data needs. A product frontend asks for exactly the fields a screen renders, across many types, in one request, and the schema tells it everything that exists. When the same team ships the client and the API, that tightness is a feature: no endpoint-per-screen, no versioning negotiations, and the schema is the contract.

The costs are real, and they land on the server:

- **HTTP caching mostly goes away.** Queries typically go to one endpoint, so the URL no longer identifies the resource, and shared caches can't help. Caching moves into the client (normalized by globally unique IDs) and into your resolvers.
- **Cost is decided by the caller.** One query can ask for friends of friends of friends. Depth limits, breadth and alias limits, and a cost budget per query are mandatory, not tuning. GitHub's public GraphQL API, for example, prices every query in points (an hourly budget of 5,000) and caps a single call at 500,000 nodes, because request counting means nothing when one request can do the work of thousands.
- **N+1 queries are the default.** A resolver per field means fetching 50 orders' customers can be 50 queries unless you batch per request, which is what DataLoader exists for.
- **Authorization moves to every field.** There's no URL to put a check on; a sensitive field reachable through any path in the graph has to be authorized wherever it resolves. Miss one path and you've built the object-level authorization bug from [API Security](/docs/security/api-security) into the schema.
- **Errors don't map to HTTP.** A response can be partly successful, with `data` and an `errors` list together, so status codes stop telling clients and monitoring what happened. It also wraps every result in an envelope, the opposite of [the playbook's](/docs/api-design/principles) bare resources, which is the right trade for a composing client and the wrong one for strangers.

For a first-party client, persisted queries (an allowlist of the operations your app actually sends) close most of these: the server only runs queries it has seen, so cost is known ahead of time and arbitrary queries are impossible. That's exactly why the pattern doesn't fit a public API, where you can't know the queries in advance.

## gRPC: Typed Calls Between Your Own Services

Inside a system, the consumer is another service you own, and the problems are different: a contract both sides compile against, efficient calls at high volume, timeouts that propagate, and streams. gRPC is built for that. Services are defined in Protocol Buffers, clients and servers are generated for each language, calls run over HTTP/2, and every call can carry a deadline: if it passes, the call ends with `DEADLINE_EXCEEDED` on both sides instead of the server working for a client that gave up. It supports unary calls plus server, client and bidirectional streaming, which REST can only approximate.

Two claims deserve honesty. "Protobuf is faster" is true for encoding size and parsing cost, but for most services the time goes to the database and the network, not serialization, so measure before choosing gRPC for speed. And the contract only stays safe if you follow protobuf's evolution rules: field numbers identify fields on the wire, so a deleted field's number must never be reused, or an old client will read new data as the wrong field.

The costs are tooling and reach. Browsers can't speak native gRPC; gRPC-Web goes through a proxy such as Envoy. Every layer that inspects traffic (load balancers, gateways, observability) has to understand HTTP/2 and gRPC status codes, and you can't debug with `curl` and your eyes. That's fine between services you own and instrument; it's a barrier for anyone else.

## Events and Webhooks: Push, Not Pull

When the question is "tell me when something happens", none of the request styles fit well: polling is wasteful and slow. Inside the system that's [events](/docs/architecture/events); across the boundary to customers it's [webhooks](/docs/payments/webhooks). Both trade the simplicity of request and response for delivery guarantees you now own: duplicates, ordering, retries and replay. They complement a request API rather than replacing it; a webhook says "payment captured", and the client fetches the payment over REST when it needs the details.

## My Defaults

- **Public and partner APIs: REST**, with the conventions in this playbook, plus expansion and QUERY for the cases that push people toward GraphQL. Strangers get HTTP semantics they already understand.
- **Internal service-to-service: gRPC where it pays**: high call volume, streaming, many languages, or a contract that changes often and benefits from generated clients. Otherwise plain internal REST is fine and cheaper to operate.
- **GraphQL for a first-party client that composes many resources**, behind persisted queries, with cost limits and per-field authorization from day one.
- **Events and webhooks for anything that happened**, alongside whichever request style serves reads.

## Mixing Them

Most real systems use more than one, and that's fine if each boundary has one style. A common shape: gRPC between services, a GraphQL or REST backend-for-frontend owned by the product team, REST for the public API, and webhooks out. What hurts is two styles for the same consumer at the same boundary: two contracts to version, document and secure, and they drift. If you need to expose a gRPC service over HTTP, transcode it from the same definitions (Google's API design guide describes mapping gRPC methods to HTTP routes) rather than maintaining a second hand-written API.

## References

**Specifications**

- [RFC 9110: HTTP Semantics](https://datatracker.ietf.org/doc/html/rfc9110), the methods, status codes and caching semantics REST builds on
- [GraphQL Specification (October 2021)](https://spec.graphql.org/October2021/), responses with `data` and `errors`
- [Protocol Buffers: Encoding](https://protobuf.dev/programming-guides/encoding/), field numbers on the wire
- [gRPC over HTTP/2](https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-HTTP2.md), how calls, metadata and status map onto HTTP/2

**Reference**

- [gRPC: Core concepts](https://grpc.io/docs/what-is-grpc/core-concepts/), the four method types, deadlines and cancellation
- [gRPC: Status codes](https://grpc.io/docs/guides/status-codes/), errors outside HTTP status codes
- [gRPC-Web: Basics](https://grpc.io/docs/platforms/web/basics/), calling gRPC from a browser through a proxy
- [Protocol Buffers: Dos and Don'ts](https://protobuf.dev/programming-guides/dos-donts/), never reusing field numbers
- [GraphQL: Security](https://graphql.org/learn/security/), depth, breadth and cost limits, and trusted documents
- [GraphQL: Caching](https://graphql.org/learn/caching/), why HTTP caching doesn't apply and globally unique IDs instead
- [GraphQL: Authorization](https://graphql.org/learn/authorization/), authorization in the business layer, not resolvers ad hoc

**In practice**

- [GitHub: GraphQL rate and node limits](https://docs.github.com/en/graphql/overview/rate-limits-and-node-limits-for-the-graphql-api), point-based query cost and a 500,000-node cap
- [DataLoader](https://github.com/graphql/dataloader), batching per request to avoid N+1 resolvers
- [Google AIP-127: HTTP and gRPC transcoding](https://google.aip.dev/127), one definition served as both gRPC and HTTP
