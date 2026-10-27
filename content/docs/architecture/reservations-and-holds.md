+++
title = "Reservations & Holds"
description = "Selling scarce slots and inventory: holds that expire on read, caps per holder, idempotent confirmation, and a database that refuses double-booking."
category = "Architecture"
order = 417
tags = ["architecture", "reservations", "booking", "inventory", "concurrency", "postgres"]
aliases = ["reservations-and-holds"]
+++

Anything scarce that people pick before they pay works the same way: an appointment slot, a hotel room, a concert seat, a rental car, the last unit of a product, a court booking, a technician's Thursday morning. Between "I want that one" and "it's mine" there are minutes of form-filling, card entry, a contract signature or a phone call, and during those minutes two things must stay true. Nobody else can take what this person is about to buy, and if they walk away, it goes back on sale without anyone having to notice.

That gap is where double-bookings, phantom sold-outs and angry customers come from. This chapter is the mechanics: what a hold is, where it lives, how it expires, how it becomes a booking exactly once, and how the database (not the application) refuses the second claim on the same thing.

## Requests, Holds and Bookings

Three different things sit between a customer's wish and a commitment, and conflating them is the root of most booking bugs:

| | Claims capacity? | Committed? | Ends by |
| --- | --- | --- | --- |
| **Request** | No | No | Someone finds a slot, or declines |
| **Hold** | Yes, temporarily | No | Confirmation, release or expiry |
| **Booking** | Yes | Yes | Completion, cancellation or no-show |

A **request** is demand without a slot: "any morning next week," a booking that needs review, a lead from a marketplace. It consumes no capacity and is answered later. A **hold** is a slot without a commitment: the seat is grey on everyone else's map while this customer finishes checkout. A **booking** is the commitment itself.

Model each explicitly. A request is a row awaiting a slot (or an [operation](/docs/requests/long-running-operations#accepting-the-work) answered with `202 Accepted` and a later event), never a booking with a fake time. A hold is a reservation in a `held` state with an expiry, not a flag in the browser. And a booking that started as a hold should be the same record moved to `confirmed`, so nothing is lost between the two.

## Where a Hold Lives

There are three reasonable places to keep a hold, and the choice decides what the database can enforce for you:

| Option | How it works | Tradeoff |
| --- | --- | --- |
| **A reservation row in `held`, with an expiry** | Holds and bookings share one table and one conflict constraint; confirming is a state change on the row | One constraint prevents every conflict; expired rows must be ignored on read and swept |
| **A separate hold table** | Holds are their own rows, checked alongside bookings | Keeps the bookings table clean; every availability query and conflict check must read both tables, and the constraint can't span them |
| **A cache key with a TTL** | One key per resource and slot, set with `SET key value NX EX seconds` in Redis, so it's created only if absent and expires on its own | Fast and self-cleaning; the database can't enforce it against bookings, and a cache outage or eviction drops every hold |

My default is the first: one table, one constraint, the hold and the booking the same row. The cache option is tempting because expiry is free, but Redis's own documentation discourages the simple `SET NX EX` lock pattern for correctness in favor of its Redlock algorithm, and even a correct lock in Redis only protects what passes through Redis. A booking written by the office, an import or a vendor sync never touches the key. Use the cache as a fast "someone is looking at this" hint in front of the database, not as the thing that prevents double-booking.

## Expiry Is Enforced on Read

A hold that has expired must stop blocking availability at the instant it expires, whether or not a cleanup job has run. Make expiry part of every read that asks "is this taken?":

```sql
-- what blocks a slot right now
WHERE status = 'confirmed'
   OR (status = 'held' AND hold_expires_at > now())
```

A sweeper still runs, marking expired holds as `expired` so they stop cluttering queries and so the release is recorded, but it's housekeeping. If it stalls for an hour, nothing is stuck; slots simply show as free because the reads already say so.

The one place a stale `held` row still matters is the conflict constraint, which doesn't know about `now()`. The safe pattern expires conflicting holds in the same transaction as the new claim (below), so a dead hold never blocks a live customer.

## Hold Lifetimes Are Policy

How long a hold lasts is a business rule, and it differs by channel. A web checkout needs minutes. A rep finishing a contract on a doorstep, a buyer waiting on a purchase order, or a group booking that needs a deposit needs much longer. Payment providers bound this for you when the hold rides on their checkout: Stripe Checkout sessions expire between 30 minutes and 24 hours after creation (24 hours by default), and Stripe's guide to limited inventory expires the session early and returns the items when the `checkout.session.expired` event arrives.

- **Store the expiry per hold,** computed from a per-channel policy held as configuration ([Rules as Data](/docs/architecture/rules-as-data#effective-dates-and-versions)), never a constant in code.
- **Show the countdown.** The customer should see that the seat is held for 10 more minutes, and the client should warn before it lapses.
- **Extend only on progress.** Starting payment can extend a hold once, to cover a slow 3-D Secure challenge; idling on the page doesn't.
- **Never let a hold outlive the payment window.** If your hold is 15 minutes and the payment session is 30, a customer can pay for something that's already been released. Make the payment session's expiry no later than the hold's, or extend the hold when payment begins.

## Caps and Abuse

Holds are free to create and block everyone else, which makes them an abuse surface: a script, a scalper, a competitor or a buggy client can hold every slot in a territory or every seat in a section without paying for any.

- **Cap active holds per holder:** per session, per account, per device and per payment instrument where you have one. A customer needs one or two concurrent holds, not forty.
- **Cap quantity per hold,** the familiar "maximum eight tickets per order."
- **Rate-limit hold creation** separately from browsing, keyed on the same identities ([Rate Limiting](/docs/requests/rate-limiting#what-to-key-on)).
- **Watch the hold-to-confirm ratio** per holder. A holder who creates hundreds of holds and confirms none is either broken or hostile, and both deserve a block.

A cap counted with `SELECT count(*)` and then an insert is a race under the default isolation level: two concurrent requests both see one hold and both insert a second. Enforce it with a per-holder counter row updated conditionally in the same transaction, a lock on the holder's row, or serializable isolation with retries ([Transactions & Concurrency](/docs/database/transactions-and-concurrency#serializable-with-retries)).

## Preventing Double-Booking

Checking availability and then inserting is a race: two customers both see Thursday at 9 as free, and both insert. The application can't close that gap reliably; the database can. Which tool fits depends on the shape of what you're selling.

### Exclusion Constraints for Time

When the thing is a resource over an interval (a room, a technician, a vehicle, a court), PostgreSQL's range types and exclusion constraints refuse overlapping claims outright. The PostgreSQL documentation's own example is a room reservation table with `EXCLUDE USING GIST (room WITH =, during WITH &&)`, which "will reject overlapping ranges only if the meeting room numbers are equal," using the `btree_gist` extension for the equality part:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE reservations (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  resource_id     UUID NOT NULL REFERENCES resources (id),
  during          TSTZRANGE NOT NULL,          -- closed-open, UTC instants
  status          TEXT NOT NULL CHECK (status IN
                    ('held', 'confirmed', 'cancelled', 'expired', 'completed')),
  hold_expires_at TIMESTAMPTZ,                 -- set only while held
  holder_ref      TEXT NOT NULL,               -- session, account or agent holding it
  channel         TEXT NOT NULL,               -- web, phone, partner, staff, system
  idempotency_key TEXT NOT NULL,
  version         INTEGER NOT NULL DEFAULT 1,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT reservations_tenant_id_idempotency_key_key UNIQUE (tenant_id, idempotency_key),
  CONSTRAINT reservations_hold_expiry_ck CHECK ((status = 'held') = (hold_expires_at IS NOT NULL)),
  CONSTRAINT reservations_during_excl EXCLUDE USING GIST (
    resource_id WITH =,
    during      WITH &&
  ) WHERE (status IN ('held', 'confirmed'))
);
```

The partial `WHERE` means cancelled, expired and completed rows stop blocking the slot. Ranges are closed-open (`[09:00, 10:00)`), so back-to-back bookings don't collide; store instants in UTC and keep the customer's local promise separately ([Temporal Data](/docs/database/temporal-data#one-naming-standard-range-columns)). Buffers between bookings (travel, cleaning, turnover) belong inside the range, not in application code that the constraint can't see.

Creating a hold expires any dead holds in its way in the same transaction, then inserts:

```sql
BEGIN;

UPDATE reservations
   SET status = 'expired', hold_expires_at = NULL, version = version + 1
 WHERE resource_id = $1
   AND status = 'held'
   AND hold_expires_at <= now()
   AND during && $2;

INSERT INTO reservations (tenant_id, resource_id, during, status, hold_expires_at,
                          holder_ref, channel, idempotency_key)
VALUES ($3, $1, $2, 'held', now() + $4::interval, $5, $6, $7);

COMMIT;
```

If two transactions race, both may expire the same dead hold, but only one insert survives: the other fails with an exclusion violation (SQLSTATE `23P01`), which the API maps to `409 Conflict` and a fresh availability search, not a `500`.

### Counters for Pooled Inventory

When units are interchangeable (200 general admission tickets, 3 visits per crew per morning window, 12 rental cars of a class), there's no interval to overlap, only a count. Keep a capacity row per pool and claim against it with a conditional update in the same transaction as the hold insert:

```sql
UPDATE inventory_pools
   SET claimed = claimed + $2
 WHERE id = $1
   AND claimed + $2 <= capacity;
-- zero rows updated: sold out (or not enough left for this quantity)
```

Releasing a hold (expiry, cancellation) decrements the same row in the same transaction that changes the hold's status. The counter is a cache of the rows, so a nightly job compares `claimed` to the sum of live holds and bookings and alerts on drift; drift means some path changed status without touching the counter.

### Unique Keys for Discrete Units

When each unit has an identity (seat 14C, room 412 on one night, a numbered parking bay), a partial unique index is the simplest constraint there is:

```sql
CREATE UNIQUE INDEX seat_claims_live_uniq
  ON seat_claims (event_id, seat_id)
  WHERE status IN ('held', 'confirmed');
```

A hotel night works the same way with one row per room per night; a multi-night stay is several rows inserted in one transaction, so it holds all nights or none.

### Optimistic Concurrency for Everything Else

Some rules can't be expressed as a constraint: "a customer may hold at most one slot per day," "a confirmed booking can only move to a slot of equal or greater length," a change that must also reach a vendor's system. For those, read the row with its `version`, decide, and write back only if the version hasn't moved (`UPDATE ... WHERE id = $1 AND version = $2`); zero rows means someone else changed it, so reload and decide again. [Transactions & Concurrency](/docs/database/transactions-and-concurrency#optimistic-concurrency) has the pattern. When the authoritative calendar is someone else's (a channel manager, a vendor's scheduling API), your constraint only protects your copy: call their booking operation, which does its own locking, and treat their conflict response as a normal outcome.

## Confirming a Hold, Idempotently

Confirmation is where retries hurt most: the customer has paid, the network blips, and the app sends "confirm" again. It must produce one booking, one charge and one confirmation email.

- **Every claim-creating request carries an idempotency key,** stored on the row under a unique constraint, as in the table above. A retry with the same key returns the stored result instead of claiming again ([Idempotency](/docs/payments/idempotency#what-the-server-stores)). Natural keys work too: a partner's booking ID, or a recurring series' occurrence ID for system-created bookings.
- **Confirmation is a conditional state change** on the existing row, not a new insert:

```sql
UPDATE reservations
   SET status = 'confirmed', hold_expires_at = NULL, version = version + 1
 WHERE id = $1
   AND status = 'held'
   AND hold_expires_at > now()
RETURNING *;
```

Zero rows has two meanings, and the handler distinguishes them by reading the row. Already `confirmed` by this same request: return the stored result, which is what makes the retry harmless. `expired` or taken: try to claim the same slot again (it may still be free), and if that fails, tell the customer plainly and offer alternatives.

- **Order payment and confirmation deliberately.** The common sequence is hold, authorize payment, confirm, capture. If the hold has lapsed by the time the authorization succeeds and the slot is gone, void the authorization rather than capturing for something you can't deliver. Payment providers' webhooks arrive late and twice, so the handler that confirms on `payment succeeded` is idempotent on the provider's event ID ([Webhooks](/docs/api-design/webhooks#consumer-expectations)).
- **Rescheduling keeps the identity.** Moving a booking is claiming the new slot and releasing the old one in one transaction, so the customer is never left with neither, and the booking's history, payments and messages stay attached.

## Releasing on Abandonment

Most holds end without a decision: the tab closes, the app is backgrounded, the phone call drops. Release has three paths, and a system needs all of them:

1. **Explicit release** when the customer removes an item, picks a different slot or cancels. Do it immediately; don't wait for expiry.
2. **Expiry,** which is the safety net. It's enforced on read and recorded by the sweeper, with `expired` as a status distinct from `cancelled`, because "the customer walked away" and "the customer said no" are different facts for conversion analysis.
3. **Upstream signals,** such as a payment session expiring (Stripe's `checkout.session.expired`) or a partner cancelling its own hold. These release the matching hold through the same code path as the other two.

A released unit is the most valuable inventory you have, because someone wanted it a minute ago. If there's a waitlist, releasing is an event that offers the unit to the next person in line (as a new hold with its own expiry), rather than dropping it silently back into the pool.

## Overbooking Is a Policy, Not a Bug

Some businesses sell more than they have on purpose, because a predictable share of bookings never show: airlines, hotels, clinics with high no-show rates, restaurants. That's a legitimate strategy, and it has to be a visible one.

- **Model it as capacity, not as a hole in the constraint.** The pool's `capacity` is the oversell limit (physical capacity plus an allowance), set per pool from measured no-show rates and stored with who set it and when. The constraint still holds; it just holds at a different number.
- **Decide in advance what happens when everyone shows up.** US airline regulation is the clearest public model: a carrier "shall request volunteers for denied boarding before using any other boarding priority," and compensation for involuntary denied boarding scales with the delay, from nothing when alternate transport arrives within an hour, to 200% of the fare (capped) at one to two hours, to 400% (capped) beyond that, for domestic flights (14 CFR Part 250). Whatever your industry, write the equivalent down: who gets moved, in what order, and what they're offered.
- **Never oversell what can't be substituted.** A specific seat, a named room, a single technician's only slot or a medical procedure is not a pool, and overbooking it is just double-booking with a spreadsheet.

## Auditing

Bookings are promises, and they end up in disputes and chargebacks. Record:

- **Every state change** of a reservation (held, confirmed, released, expired, moved, cancelled) with the actor, channel and reason, so "I booked that and you gave it away" can be answered.
- **The expiry policy and its version** that applied to each hold, and any extension.
- **Conflicts refused,** at least as counts per resource and channel. A rising conflict rate means availability shown to customers is stale, which is a bug even when the constraint saves you.
- **Overbooking decisions:** the capacity set and by whom, and every customer moved or denied with what they were offered.

Record structure and typed actors are in [Audit Trails](/docs/architecture/audit-trails#what-a-record-holds).

## Checklist

- Requests, holds and bookings are distinct states; requests never claim capacity.
- A hold is a database row with an expiry, ideally the same row that becomes the booking.
- Expiry is enforced on every read; the sweeper is housekeeping, not correctness.
- Hold lifetimes are per-channel configuration, and never outlive the payment session they depend on.
- Active holds are capped per holder, quantity is capped per hold, and hold creation is rate limited.
- The database refuses double-booking: exclusion constraints for time, conditional counters for pools, unique indexes for numbered units.
- Conflict errors map to `409` and a fresh search, not a `500`.
- Every claim-creating request has an idempotency key; confirmation is a conditional update.
- Release happens explicitly, by expiry and from upstream signals, through one code path, and offers the unit to a waitlist when there is one.
- Overbooking, if any, is an explicit capacity number with a written policy for when everyone shows up.

## References

**Specifications**

- [14 CFR 250.2b: Carriers to request volunteers for denied boarding](https://www.law.cornell.edu/cfr/text/14/250.2b), volunteers first, involuntary denial only when too few come forward
- [14 CFR 250.5: Amount of denied boarding compensation](https://www.law.cornell.edu/cfr/text/14/250.5), the one-hour, two-hour, 200% and 400% tiers for domestic flights, with dollar caps subject to inflation adjustment

**Reference**

- [PostgreSQL: Range Types, Constraints on Ranges](https://www.postgresql.org/docs/current/rangetypes.html), exclusion constraints that reject overlapping reservations, combined with equality through `btree_gist`
- [Redis: SET](https://redis.io/docs/latest/commands/set/), `NX` and `EX` options and the note discouraging the simple lock pattern in favor of Redlock
- [Stripe: Idempotent requests](https://docs.stripe.com/api/idempotent_requests), saved responses replayed for a retried key

**In practice**

- [Stripe: Create a Checkout Session](https://docs.stripe.com/api/checkout/sessions/create), `expires_at` between 30 minutes and 24 hours, defaulting to 24 hours
- [Stripe: Manage limited inventory](https://docs.stripe.com/payments/checkout/managing-limited-inventory), expiring sessions to stop customers holding inventory, and returning items on `checkout.session.expired`
