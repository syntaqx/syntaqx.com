+++
title = "Choosing an API Style"
description = "REST, GraphQL, gRPC and events: what each one optimizes for, what it costs, and how to pick by who the consumer is rather than by what's fashionable."
category = "API Design"
order = 206
tags = ["api", "rest", "graphql", "grpc", "architecture"]
+++

The question is rarely "which style is best". It's "who calls this, and what do they need from the contract". A public API used by thousands of strangers, a frontend your own team ships daily, and a service three hops deep in your backend have different problems, and each style answers one of them. Pick by the consumer and you rarely regret it; pick by fashion and you spend a year building around the style's weak spots.

## What Each One Optimizes For

| Style | Optimizes for | Pays for it with |
| ----- | ------------- | ---------------- |
| REST over HTTP | Strangers: anything that speaks HTTP can call it, cache it, retry it and debug it with `curl` | Several round trips to assemble a view; payload shape fixed by the server |
| GraphQL | One client composing many resources into exactly the shape a screen needs, in one request | HTTP caching, cost control and authorization all move into your server code |
| gRPC | Internal service-to-service calls: a typed contract, generated clients, streaming, deadlines | Browsers can't call it directly; harder to inspect; needs tooling at every layer |
| Events and webhooks | Telling others something happened, without them polling | Eventual consistency, ordering, duplicates and delivery become your problem |

## REST: The Default for Anyone You Don't Control

A public API's consumers are strangers with every language, framework and level of skill, and what helps them most is what they already know: HTTP. Methods say whether a call is safe to retry, status codes say what happened, caching works in every proxy and browser for free, and anything that breaks reproduces with `curl`. Those properties come from the protocol, so you don't build or document them ([REST & HTTP Verbs](/docs/fundamentals/rest-http-verbs), [Caching](/docs/requests/caching)).

The real weaknesses are over-fetching and round trips: a screen that needs a customer, their last five orders and each order's items can take several requests. The playbook answers that without leaving HTTP: [expansion](/docs/api-design/resource-relationships) inlines related resources on request, and [HTTP QUERY](/docs/requests/http-query) carries a structured query that doesn't fit in a URL. That covers most of what people reach for GraphQL to solve, with caching and retries intact.

## GraphQL: When One Client Composes Many Resources

GraphQL's strength is a client that owns its data needs. A product frontend asks for exactly the fields a screen renders, across many types, in one request, and the schema tells it everything that exists. When the same team ships the client and the API, that tightness is a feature: no endpoint per screen, and the schema is the contract.

The costs land on the server. HTTP caching mostly goes away, because one endpoint no longer identifies a resource. The caller decides how expensive a query is, so depth and cost limits are mandatory. Resolvers make N+1 queries the default, authorization has to hold on every path through the graph, and a response can be part success, part error, with `data` and `errors` side by side, so status codes stop telling monitoring what happened. For a first-party client, an allowlist of the queries your app actually sends closes most of that, which is also why GraphQL fits strangers badly: you can't know their queries in advance. Doing it well is its own chapter, [GraphQL in Depth](/docs/api-design/graphql).

## gRPC: Typed Calls Between Your Own Services

Inside a system, the consumer is another service you own, and the problems are different: a contract both sides compile against, efficient calls at high volume, timeouts that propagate, and streams. gRPC is built for that. Services are defined in Protocol Buffers, clients and servers are generated for each language, calls run over HTTP/2, and every call can carry a deadline: if it passes, the call ends with `DEADLINE_EXCEEDED` on both sides instead of the server working for a client that gave up. It supports unary calls plus server, client and bidirectional streaming, which REST can only approximate.

Two claims deserve honesty. "Protobuf is faster" is true for encoding size and parsing, but most services spend their time in the database and the network, so measure before choosing gRPC for speed. And the contract only stays safe under protobuf's evolution rules: field numbers identify fields on the wire, so a deleted field's number is never reused, or an old client reads new data as the wrong field.

The costs are tooling and reach. Browsers can't speak native gRPC; gRPC-Web goes through a proxy such as Envoy. Every layer that inspects traffic has to understand HTTP/2 and gRPC status codes, and `curl` won't help you debug. That's fine between services you own and instrument, and a barrier for anyone else.

## Events and Webhooks: Push, Not Pull

When the question is "tell me when something happens", polling is wasteful and slow. Inside the system that's [events](/docs/architecture/events); across the boundary to customers it's [webhooks](/docs/api-design/webhooks). Both trade request-and-response simplicity for delivery guarantees you now own: duplicates, ordering, retries and replay. They complement a request API: a webhook says "payment captured", and the client fetches the payment over REST when it needs the details.

## My Defaults

- **Public and partner APIs: REST**, with the conventions in this playbook, plus expansion and QUERY for the cases that push people toward GraphQL. Strangers get HTTP semantics they already understand.
- **Internal service-to-service: gRPC where it pays**: high call volume, streaming, many languages, or a contract that changes often and benefits from generated clients. Otherwise plain internal REST is fine and cheaper to operate.
- **GraphQL for a first-party client that composes many resources**, behind persisted queries, with cost limits and per-field authorization from day one.
- **Events and webhooks for anything that happened**, alongside whichever request style serves reads.

## Mixing Them

Most real systems use more than one, which is fine if each boundary has one style: gRPC between services, a GraphQL or REST backend-for-frontend owned by the product team, REST for the public API, webhooks out. What hurts is two styles for the same consumer at the same boundary, two contracts to version, document and secure that drift apart. To expose a gRPC service over HTTP, transcode it from the same definitions rather than hand-writing a second API.

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

**In practice**

- [Google AIP-127: HTTP and gRPC transcoding](https://google.aip.dev/127), one definition served as both gRPC and HTTP
