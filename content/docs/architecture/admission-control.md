+++
title = "Waiting Rooms & Admission Control"
nav_title = "Admission Control"
description = "Admitting users at the rate a system can serve: capacity per scope, queues with ceilings, honest wait estimates, signed admission tokens and fairness."
category = "Architecture"
order = 420
tags = ["architecture", "admission-control", "waiting-room", "capacity", "reliability"]
aliases = ["admission-control", "waiting-rooms"]
+++

Some demand arrives all at once and on purpose: a game launch, a ticket on-sale, a sneaker drop, a vaccine appointment window, open enrollment, a flash sale, the first morning after a long outage. Capacity planning can't fix it, because the peak is many times anything worth provisioning for and lasts an hour. The choice is between admitting everyone and failing for everyone, or admitting people at the rate the system can serve them and telling the rest, honestly, how long they'll wait.

That second choice is admission control. A waiting room or a login queue is admission control with a user interface. This chapter covers how to decide what to admit, where the queue lives, what it tells people, how admission is proven to the systems behind it, and how to keep it fair.

## Admission, Rate Limiting and Load Shedding

Three mechanisms protect a system from more work than it can do, and they answer different questions:

| | Question | Unit | What the user sees |
| --- | --- | --- | --- |
| **[Rate limiting](/docs/requests/rate-limiting)** | Is this client asking too often? | Requests per client per window | `429` and `Retry-After` |
| **Admission control** | Is there room for one more user right now? | Sessions admitted, at a rate and up to a total | A place in line and an estimate |
| **Load shedding** | The system is past capacity; what do I drop? | Requests, by priority | Errors or degraded features |

A rate limit is per client and fair to well-behaved ones; it does nothing when a million well-behaved clients arrive together. Load shedding is the last line, dropping work after it has already arrived. Admission control sits in front of both: it decides who starts a session at all, so the work behind the gate stays inside capacity. A system that faces spikes needs all three.

## Capacity per Scope

Admission needs a number to admit against, set from load tests rather than discovered by a database falling over ([Load Testing](/docs/operations/load-testing#capacity-planning)).

- **Two limits, not one.** A maximum of concurrent active sessions and a maximum rate of new admissions. Cloudflare's Waiting Room is configured with exactly these two: total active users ("how many simultaneous users you want to allow") and new users per minute, and "a sharp spike in either of these values might result in queuing." The rate matters as much as the total, because new sessions are expensive (login, loading state, warming caches) and a burst of them hurts more than the same number of settled users.
- **Per scope.** A game has a capacity per shard or data center, a ticketing site per event, a store per drop. A global number lets one hot scope starve the rest.
- **What "active" means.** A session counts while it's doing something. Cloudflare counts a user as active for a configurable session duration after their last request; a game counts a logged-in character. Define it, because it's what frees room for the next person.

## Admitting: a Rate or a Line

There are two ways to let people through, and they behave differently under a spike.

**A token bucket** admits at a steady rate: each admission takes a token, tokens refill at the admission rate, and the bucket's size allows a small burst. Anyone who doesn't get a token retries later. It's simple, stateless per user and fine when contention is mild, but it's a lottery decided by who retries at the right moment, which favors scripts and gives humans no idea how long they'll wait.

**A queue** gives each arrival a position and admits from the front as room frees up. The AWS Virtual Waiting Room solution is a public reference design: a visitor "requests a number in line," the browser "polls regularly for updates" showing the number currently being served, and when their number comes up they exchange the number and a device ID for a session token. Admission advances a single serving counter, so admitting the next 100 people is one increment. (As of October 2026 AWS marks that solution deprecated, but the design is the clearest public write-up of the pattern.)

My default is the queue whenever people will wait more than a few seconds, and the bucket behind it as the inlet: the queue decides order, the bucket decides how fast the front moves.

## FIFO or Random

Order is a policy, and the right one depends on what's being rationed. Cloudflare's queueing methods spell out the choice:

- **First in, first out** rewards "visitors who get in the queue first and wait longer." It's right for service access (logging into a game, reaching a support portal), where order of arrival is the fair answer.
- **Random** selects from everyone waiting when spots open, for when you "want to distribute products or services more equitably." It's right for scarce goods with a known start time (tickets, limited drops), where FIFO turns into a race decided in the first second by whoever has the fastest script.

For a scheduled event, combine them: a pre-queue that opens before the start, randomized once at the start time so arriving at 9:59:59 is no worse than arriving at 9:45, then FIFO from that shuffled order. Say which method applies on the waiting page, because people tolerate a lottery they were told about far better than one they discover.

## The Queue Has a Ceiling

A queue that grows without bound fills memory and promises waits nobody will sit through. Give it a limit and decide what happens past it. Square Enix's notes on the *Final Fantasy XIV: Endwalker* launch (December 2021) are a public example: every World hit its login cap for long periods, and error 2002 appeared when logging into a logical data center with "more than 17,000 players in the login queue," so new players couldn't even join the line. That's a ceiling working as designed, with an error message that didn't say so.

Past the ceiling, say plainly that the queue is full and when to try again (with jitter built into the suggestion), rather than failing with a generic error that invites refreshing.

## Position and Wait Messages

People tolerate a long, known wait far better than a short, unknown one. The waiting page is the product during a launch:

- **Show position and an estimate,** computed from the recent admission rate (people admitted per minute over the last few minutes), not from the configured maximum. Show a range or round generously; an estimate that grows is worse than a pessimistic one that shrinks.
- **Refresh on a calm interval.** Cloudflare's waiting page refreshes automatically every 20 seconds with an updated estimate. Polling every second multiplies load at the worst time; jitter the interval.
- **Make leaving and returning safe.** A place in line is held by a signed token or cookie, so a refresh, a closed tab or a network blip doesn't send someone to the back. Cloudflare issues each user a cookie that manages their exit from the queue; AWS's design ties the number to a device ID.
- **Tell them what happens next:** how long they'll have once admitted, whether the session will be reclaimed when idle, and whether the event might sell out before they reach the front.

## The Admission Token

Admission only works if the systems behind the gate refuse anyone who didn't pass through it.

- **Admitted users get a signed, time-limited token.** In AWS's design, the protected backend has an authorizer that ensures every call carries "a validated time-limited token issued by the waiting room core API," and users who find the backend directly are sent back to the waiting room.
- **One token per place in line.** Issuing is idempotent on the queue number, so polling twice doesn't mint two admissions, and a token can't be reused from a second device if it's bound to the device or session that queued.
- **Validate at the edge, statelessly.** A signature and expiry check at the CDN or gateway is cheap enough to run on every request without touching the overloaded systems behind it.
- **Expiry returns capacity.** When an admitted session ends or idles out, its slot goes back to the inlet. A token that never expires is a permanent seat.

## Fairness and Bots

Anything scarce enough to need a queue is worth automating against. Assume bots will queue.

- **One place per identity.** Limit places in line per account, per device and per payment instrument where you have them, and dedupe at checkout as well as at the gate.
- **Challenge at the entrance, not at the front.** A bot check when joining the queue costs a human seconds; one at the front, after an hour's wait, is cruel when it misfires.
- **Randomize timed drops,** so early arrival and raw speed stop being the advantage.
- **Rate-limit the queue's own endpoints** (join, status, token exchange), keyed on the same identities ([Rate Limiting](/docs/requests/rate-limiting#what-to-key-on)), and watch for one identity holding many places.
- **Don't trust the client's position or timestamp.** Both come from the server, signed.

## Priority Classes

Not every arrival is equal, and that's a legitimate business decision: paying subscribers ahead of free trials, existing customers ahead of new sign-ups, accessibility needs, staff and support sessions. Model priority as separate queues or weighted admission from each, never as a bypass around the gate, and store the rule with an effective date and an owner like any other business rule ([Rules as Data](/docs/architecture/rules-as-data)). Publish it, too: an unexplained priority looks like a bug, or like favoritism.

## Reclaiming Idle Sessions

During a spike, every idle admitted session is someone in the queue not being served. Square Enix's notes say FFXIV logs out inactive players after 30 minutes and that emote loops and attacking training dummies "cannot bypass the automatic logout." Whatever the product:

- **Define idle by meaningful activity,** not by any request (a page left open polling isn't a user).
- **Shorten idle timeouts during an event,** as configuration, and say so on the waiting page.
- **Warn before reclaiming,** and let someone who was reclaimed rejoin near the front rather than the back, when the product allows it.

## Protecting What's Downstream

The capacity number is a proxy for what actually breaks: a database, a payment provider, a matchmaker, an inventory service. Tie admission to their health, not only to a fixed count.

- **Slow the inlet when dependencies degrade.** If database latency or error rates climb, lower the admission rate automatically; raise it again slowly when they recover. A fixed rate set from last week's load test is a guess about today.
- **Let clients back off on their own.** Google's SRE book describes adaptive client-side throttling: each client tracks requests and accepts over the last two minutes, and once requests reach K times accepts (K typically 2) it starts rejecting locally with rising probability, so an overloaded backend stops receiving traffic it would only reject.
- **Make rejection cheap.** The SRE book's caution is that rejecting is only protective when it costs much less than serving. A waiting page served from a CDN is cheap; a rejection that first loads the user's profile isn't.
- **Shed by criticality behind the gate.** Requests that admitted users make still carry a priority, so under pressure the system drops recommendations and analytics before checkout ([Retries & Timeouts](/docs/architecture/retries-and-timeouts#retry-budgets) covers keeping retries from becoming the overload).

## Ramping After an Outage

An outage is a launch you didn't plan. When the system comes back, every client tries to reconnect at once, and the reconnect storm is often the second outage.

- **Open the gate in steps,** admitting a fraction of normal capacity, watching databases and caches warm at each step, then widening.
- **Put the waiting room in front during recovery,** even if it's normally in passthrough. Cloudflare's methods include passthrough (no queueing) and a reject mode that shows a static page, which make the gate something you switch on in an incident rather than build during one.
- **Clients reconnect with jittered backoff,** never in lockstep ([Retries & Timeouts](/docs/architecture/retries-and-timeouts#exponential-backoff-with-jitter); [Realtime Connections](/docs/architecture/realtime-connections#reconnecting-without-a-stampede)).

## Checklist

- Admission, rate limiting and load shedding are all present, each doing its own job.
- Capacity is two numbers per scope (concurrent sessions and admission rate), set from load tests.
- Waits longer than a few seconds use a queue with a serving counter; a token bucket sets how fast the front moves.
- FIFO for access, random for scarce goods with a start time, and the method is stated on the page.
- The queue has a ceiling with a clear message past it.
- Position and estimate come from the recent admission rate; refreshes are calm and jittered; a place survives a reload.
- Admission is a signed, time-limited token validated at the edge; backends refuse requests without it.
- Places are limited per identity, bots are challenged on entry, and position comes only from the server.
- Priority classes are configured, effective-dated and published.
- Idle sessions are reclaimed, with shorter timeouts during events.
- The admission rate follows downstream health, and recovery after an outage ramps through the same gate.

## References

**Reference**

- [Cloudflare: About Waiting Room](https://developers.cloudflare.com/waiting-room/about/), total active users and new users per minute, session duration, a cookie per user and a 20-second refresh of the estimated wait
- [Cloudflare: Queueing methods](https://developers.cloudflare.com/waiting-room/reference/queueing-methods/), FIFO, random, passthrough and reject, and when to use each
- [Google SRE Book: Handling Overload](https://sre.google/sre-book/handling-overload/), adaptive client-side throttling with K times accepts, criticality, per-customer limits and the cost of rejecting

**In practice**

- [AWS Compute Blog: Introducing AWS Virtual Waiting Room](https://aws.amazon.com/blogs/compute/introducing-aws-virtual-waiting-room/), numbers in line, polling a serving counter, exchanging a number and device ID for a session token, and an authorizer requiring a time-limited token
- [AWS Solutions: Virtual Waiting Room on AWS (GitHub)](https://github.com/aws-solutions/virtual-waiting-room-on-aws), the solution's source and its deprecation notice
- [Square Enix: Ongoing Congestion Situation and Compensation](https://na.finalfantasyxiv.com/lodestone/news/detail/1c59de837cc84285ad1cdb4c9a9cad782363f25b), login caps on every World, error 2002 past 17,000 queued players and the 30-minute idle logout (Naoki Yoshida, December 2021)
