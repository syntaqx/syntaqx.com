+++
title = "Realtime Connections"
description = "Pushing changes to connected clients: an edge and routing tier, auth on connect, heartbeats, fan-out, resume and catch-up, and surviving reconnect storms."
category = "Architecture"
order = 419
tags = ["architecture", "realtime", "websockets", "sse", "presence", "scaling"]
aliases = ["realtime-connections"]
+++

Some screens are wrong a second after they load unless the server can tell them something changed: a chat, a friends list, a dispatch board, a live order status, a shared document, a trading view, a party invite in a game. The alternative to a held connection is every client asking "anything new?" every few seconds, which is slow for the user and expensive for you, since nearly every answer is "no."

A realtime connection is a long-lived channel from a client that's currently open to the server. It isn't the same thing as a push notification. Push reaches a device whose app isn't running, through Apple's or Google's service, and is covered in [Notifications](/docs/architecture/notifications#push-notifications). This chapter covers the connected case: choosing a transport, the shape of the tier that holds connections, and the failure modes that only show up when a million clients hold sockets at once.

## Choosing a Transport

| Transport | Direction | Fits | Watch for |
| --- | --- | --- | --- |
| **WebSocket** (RFC 6455) | Both ways, one connection | Chat, games, collaborative editing, anything where the client also sends often | Your own framing, heartbeats and resume; some proxies and corporate networks interfere |
| **Server-Sent Events** (`EventSource`) | Server to client; client sends over normal HTTP | Feeds, status updates, dashboards, streamed responses | Built-in reconnect and `Last-Event-ID`; per-host connection limits in browsers on HTTP/1.1 |
| **Long polling** | Server to client, one response per request | Fallback where the others are blocked; low-volume updates | A request per message; ordering and duplicates are yours |
| **Short polling** | Client asks on a timer | Changes measured in minutes; a handful of clients | Cost grows with clients times frequency, almost all of it wasted |

My default is SSE when the server mostly talks and the client mostly listens, because it's plain HTTP, reconnects on its own and resumes from the last event ID the browser remembers. WebSockets earn their place when the client sends as much as it receives. Either way, the hard parts below are the same.

## Edge and Routing

The published architectures of large realtime systems converge on the same split:

- **Riot Messaging Service** (League of Legends, 2017) has an edge tier, "a collection of independent servers responsible for hosting player client connections," and a routing tier with "a global view of all client sessions across all RMSE servers" that maps each player to the edge node holding them and routes published messages there. Any backend service can publish; it never needs to know where a player is connected.
- **Slack** describes gateway servers that hold users' WebSocket subscriptions, deployed across multiple geographic regions so clients connect nearby, in front of channel servers that each own a subset of channels assigned by consistent hashing, plus separate presence servers.
- **Discord** runs one session process per connected user, and when anything is published in a guild (a server), "it is fanned out to every session connected to it."

The shape I'd build:

1. **An edge tier that only holds sockets.** It terminates TLS and WebSockets, authenticates the connection, and forwards messages. It holds no business state and doesn't know about other edge nodes, so it scales by adding nodes.
2. **A routing layer** that knows which edge node holds each session (user ID to node and connection IDs), kept in memory or a fast store with expiry, and rebuilt from live connections after a restart.
3. **Publishers are ordinary services.** Business services emit a message addressed to users, a channel or a topic. They never hold sockets and never call edge nodes directly; they publish, often from the same [outbox](/docs/architecture/events#the-transactional-outbox) that feeds the rest of the system.

That split keeps deploys of business logic from dropping a million connections, and lets the connection tier be sized for connections while everything else is sized for work.

## Authenticate on Connect

RFC 6455 states that the protocol "doesn't prescribe any particular way that servers can authenticate clients during the WebSocket handshake"; cookies, HTTP authentication or TLS client certificates all work. That leaves the decisions to you:

- **Authenticate before the connection is useful.** Riot's edge establishes the connection "after successful authentication." Check the session or token during the upgrade request, or require an auth message as the first frame and close the connection if it doesn't arrive within a few seconds.
- **Check `Origin` for browser clients.** Browsers send it on the handshake, and it's the server's defense against another site's script opening a socket with the user's cookies. A cookie-authenticated WebSocket without an origin check is the realtime version of CSRF ([Authentication](/docs/security/authentication#csrf)).
- **Keep tokens out of URLs.** A token in the query string ends up in access logs and proxies. Prefer the cookie on the upgrade, or a short-lived single-use ticket fetched over normal HTTPS and presented once.
- **Connections outlive tokens.** A socket opened with a 15-minute access token is still open an hour later. Either refresh in-band (the client sends a new token before the old one expires, and the server closes connections whose token lapses), or cap connection lifetime and reconnect. Managed gateways often cap it for you; Amazon API Gateway WebSocket APIs, for example, have a maximum connection duration of 2 hours and a 10-minute idle timeout.
- **Revocation must reach open connections.** Signing out, a password change, a ban or a permission change publishes a "disconnect sessions for user X" message through the same routing layer, and authorization for each subscription (this channel, this document) is checked when subscribing, not assumed from the connection ([Authorization](/docs/security/authorization#where-checks-belong)).

## Heartbeats and Dead Connections

TCP can take a long time to notice that the other side is gone. A phone that walked into an elevator, a laptop that went to sleep or a NAT that silently dropped the mapping leaves a connection that looks open and delivers nothing.

- **Heartbeat at the application level.** WebSocket Ping and Pong frames exist for this; RFC 6455 says a Ping "may serve either as a keepalive or as a means to verify that the remote endpoint is still responsive." For SSE, the HTML standard recommends sending a comment line "every 15 seconds or so" because some legacy proxies drop idle HTTP connections.
- **Treat a missing acknowledgment as dead.** Discord's gateway is a good public model: the client heartbeats on an interval the server announces, and if no heartbeat ACK arrives between attempts, the connection may be "zombied," and the client closes it and reconnects to resume. Servers do the same in reverse, reaping sessions that miss their heartbeat window.
- **Jitter the first heartbeat.** Discord tells clients to wait `heartbeat_interval * jitter` (a random value between 0 and 1) before the first one, so a fleet of clients that connected together doesn't heartbeat together forever.
- **Presence is derived from heartbeats.** A user is online while at least one of their sessions holds a live connection, and goes offline when the last session misses its window. Presence state belongs in memory with expiry, not in a database row someone remembers to clear.

## Fan-Out

One change, many recipients: a message to a 10,000-member channel, a status change to 200 friends, a price update to every open dashboard. Fan-out cost is roughly the rate of changes times the online recipients per change, and it's usually what sizes the tier.

- **Route by session, not by broadcast.** The routing layer turns "users A, B, C" into "edge node 7: connections 12 and 40; edge node 9: connection 3," so each node gets one message for its local recipients instead of every node receiving everything.
- **Batch per node.** Discord found that sending to each of tens of thousands of session processes individually made publishing from a large guild take "anywhere from 900ms to 2.1s," and its fix groups recipients by remote node so a sender makes at most one send per node involved.
- **Coalesce changes.** Five status changes in ten seconds from one user don't need to reach their friends five times. Merge within a short window and send the latest state.
- **Send only what's shown.** A client with the member list closed needs availability changes, not every detail. Let clients subscribe to what's on screen.
- **Shard by the thing that fans out.** Slack assigns channels to channel servers by consistent hashing; Discord shards bot connections by guild. Keeping one hot channel's state on one owner makes its ordering simple and its fan-out local.

## Ordering and Catch-Up

Connections drop, and a client that reconnects needs to know what it missed. Decide this up front, because it can't be bolted on.

- **Number the stream.** Each message on a stream (a user's session, a channel, a document) carries a sequence number or an event ID assigned by the stream's owner. Clients apply in order and detect gaps.
- **Resume from the last one seen.** SSE has it built in: on reconnect the browser sends a `Last-Event-ID` header with the last ID it received, and the server can replay from there. Discord's gateway asks clients to cache the last sequence number and resume with the session ID and that number, reconnecting to a session-specific resume URL.
- **Bound the replay window.** Keeping every session's undelivered messages forever isn't possible. Riot's edge caches messages for a dropped session in memory and delivers them if the client reconnects; if it doesn't come back within a few minutes, or memory runs low, the session is purged and the client re-syncs its state from the services. That's the right shape: a short, memory-bounded resume window, and a full resync beyond it.
- **The push is a hint; the store is the truth.** Anything that must survive the client being offline (a message, a friend request, an assigned job) is written to a durable store first, and the realtime message tells the client to fetch or apply it. A client that missed the window loads current state over normal HTTP, with the same [pagination](/docs/requests/pagination) and authorization as any read. Messages make the screen fast; they never become the only copy.
- **Make handlers idempotent.** Resume and resync overlap, so a client sees some messages twice. Applying a message keyed by its ID twice must be harmless.

## Reconnecting Without a Stampede

The most dangerous moment for a connection tier isn't peak traffic; it's when every client reconnects at once, after a deploy, a network blip or an edge node crash.

- **Back off with jitter.** RFC 6455 says the first reconnect after an abnormal closure "SHOULD be delayed by a random amount of time," suggests a random value between 0 and 5 seconds as reasonable, and asks for "truncated binary exponential backoff" after that, precisely because clients reconnecting immediately can amount to a denial-of-service attack. The general formula is in [Retries & Timeouts](/docs/architecture/retries-and-timeouts#exponential-backoff-with-jitter).
- **Make resume cheaper than a fresh connect.** A fresh connection loads the user's state, subscriptions and presence; a resume replays a few messages. Discord limits fresh identifies (1,000 per 24 hours for a bot, with a `max_concurrency` per 5 seconds) while resumes don't count against that limit, which pushes clients toward the cheap path.
- **Drain, don't drop, on deploys.** Stop accepting new connections on a node, tell connected clients to reconnect elsewhere (with jitter), and wait before terminating. Slack describes a draining mechanism that moves users from a failing region to the nearest healthy one.
- **Rate-limit new connections at the edge.** A cap on connections per second per node turns a reconnect storm into a short queue instead of a crash ([Waiting Rooms & Admission Control](/docs/architecture/admission-control)).

## Scaling Connection Counts

Connections are mostly idle, so the first limit is usually memory per connection, not CPU or message rate.

- **Measure memory per idle session** and size nodes from it. Discord reported each VM handling up to 500,000 live sessions; Riot's load tests had a single edge machine handling "at least 10M concurrent connections." Figures like these depend heavily on the runtime (Discord's is Elixir, built for huge numbers of lightweight processes) and on what each session holds, so measure your own.
- **Raise the operating system's limits** (file descriptors, ephemeral ports at the load balancer, kernel socket buffers) before the first load test, not during the launch.
- **Account for the connect rate as well as the count.** Managed gateways often quota new connections per second: Amazon API Gateway's default is 500 new WebSocket connections per second per account per Region, which with its 2-hour connection cap is what bounds concurrent connections there.
- **Load test the reconnect storm,** not only steady state: drop every connection on one node and watch what the rest of the tier, the routing layer and the services behind it do when they all come back ([Load Testing](/docs/operations/load-testing)).

## Load Shedding

A connection tier must protect itself and what's behind it, because one slow consumer or one chatty client can consume a node.

- **Limit what clients send.** Discord's gateway allows 120 events per connection every 60 seconds and disconnects clients that exceed it. Every inbound message type has a size limit and a rate limit.
- **Bound every outbound buffer.** A client on a bad network reads slower than you publish. Give each connection a bounded queue; when it fills, drop what can be dropped (superseded presence updates, intermediate progress) and, if it stays full, close the connection and let the client resync. An unbounded buffer turns one slow phone into an out-of-memory crash for 100,000 other users.
- **Stop calling what's failing.** Discord's sessions kept retrying a registry that was timing out until the backlog ran nodes out of memory; the fix was a counter of outstanding requests that lets sessions "bail early" when it's too high. A circuit breaker or a concurrency limit per dependency does the same job ([Retries & Timeouts](/docs/architecture/retries-and-timeouts#circuit-breakers)).
- **Shed by importance.** Under pressure, typing indicators and presence detail go first, messages and state changes last. Refuse new connections before dropping existing ones.

## Checklist

- The transport matches the traffic: SSE when the server mostly talks, WebSockets when both sides do, polling only as a fallback.
- An edge tier holds sockets and nothing else; a routing layer maps users to connections; business services only publish.
- Connections authenticate on connect, check `Origin`, keep tokens out of URLs, refresh or cap their lifetime, and can be revoked.
- Heartbeats in both directions reap dead connections; presence is derived from them.
- Fan-out routes by session, batches per node, coalesces changes and sends only what's shown.
- Every stream is numbered; clients resume within a bounded window and resync beyond it; durable data is stored before it's pushed.
- Reconnects use jittered exponential backoff; resume is cheaper than connect; deploys drain.
- Nodes are sized from measured memory per idle session, and the reconnect storm is load tested.
- Inbound messages are rate limited, outbound buffers are bounded, and low-value traffic is shed first.
- Anything that must reach a user who isn't connected goes through push notifications instead.

## References

**Specifications**

- [RFC 6455: The WebSocket Protocol](https://www.rfc-editor.org/rfc/rfc6455), Ping and Pong as keepalives, the `Origin` header, no prescribed client authentication (section 10.5) and randomized, exponentially backed-off reconnects (section 7.2.3)
- [HTML Standard: Server-sent events](https://html.spec.whatwg.org/multipage/server-sent-events.html), `Last-Event-ID` on reconnect, the `retry` field and keepalive comments every 15 seconds or so

**Reference**

- [Amazon API Gateway: WebSocket API quotas](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-execution-service-websocket-limits-table.html), 2-hour connection duration, 10-minute idle timeout and 500 new connections per second by default
- [Discord: Gateway](https://docs.discord.com/developers/events/gateway), heartbeats with jitter, zombied connections, sequence numbers, resuming, identify limits and 120 events per 60 seconds

**In practice**

- [Riot Games: Riot Messaging Service](https://www.riotgames.com/en/news/riot-messaging-service), edge and routing tiers, authentication on connect, 10 million connections per edge machine in load tests, and messages cached for a few minutes after a drop (February 28, 2017)
- [Slack Engineering: Real-time Messaging](https://slack.engineering/real-time-messaging/), regional gateway servers, channel servers by consistent hashing, presence servers and region draining
- [Discord: How Discord Scaled Elixir to 5,000,000 Concurrent Users](https://discord.com/blog/how-discord-scaled-elixir-to-5-000-000-concurrent-users), guild fan-out to sessions, per-node batched sends, 500,000 sessions per VM and a semaphore to shed calls to a failing service
