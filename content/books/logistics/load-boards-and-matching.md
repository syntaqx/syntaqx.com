+++
title = "Load Boards & Digital Freight Matching"
nav_title = "Load Boards & Matching"
description = "DAT, Truckstop and broker load boards, digital freight matching and Convoy's fall, pricing models, book-now and auto-booking, and the posting and offer records."
category = "Logistics & Supply Chain Industry"
order = 2819
part = "Freight Brokerage"
tags = ["logistics", "freight-brokerage", "load-boards", "freight-matching", "spot-market", "data-model"]
+++

A load board is a marketplace listing: a broker posts a load (origin, destination, dates, equipment, weight, sometimes a rate), and carriers looking for freight search for it and call, message or click to book. It started as a phone service (DAT's original name was Dial-A-Truck) and is now the spot market's main venue: DAT says "hundreds of millions of loads are posted" on its board every year, and Truckstop cites 80 million loads annually. Digital freight matching is the same matching done by the broker's own software, offering a load to the carriers most likely to want it at a price the system sets, and booking it without a phone call.

It's hard because the market is two-sided, fast and adversarial. A posted load is an offer that goes stale in minutes when the truck market is tight and sits for hours when it's loose; the same load is often on two boards and the broker's own app at once, and must come down from all of them when it's covered; the posted rate is a negotiating position the broker may not want competitors to see; and the carrier calling about it may not be who it says it is. Convoy raised money at a $3.8 billion valuation in April 2022 on the idea that software could do this matching better than brokers' reps; by November 2023 it was a "shuttered digital freight network" whose technology Flexport bought, and DAT bought that technology from Flexport on July 30, 2025. This chapter covers the boards and the broker apps, what the FMCSA says a board is, how matching and pricing work, book-now and auto-booking, the business models, and the posting and offer records. It extends `loads` and `tenders` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model).

What a broker is and how it prices a load are in [How Freight Brokerage Works](/books/logistics/freight-brokerage#pricing-and-margin); checking the carrier who calls is [Carrier Onboarding & Vetting](/books/logistics/carrier-onboarding), and the fraud aimed at posted loads is [Freight Fraud & Cargo Theft](/books/logistics/freight-fraud). The spot and contract indexes boards publish are [Freight Markets & Cycles](/books/logistics/freight-markets); the tender state machine that a booking enters is [Tendering & Acceptance](/books/logistics/tendering); routing guides that decide when a load reaches the spot market are [Freight Procurement & Routing Guides](/books/logistics/procurement-and-routing-guides).

## How the Platforms Do It

As of November 2026, from the vendors' pricing and company pages, broker carrier pages and filings:

| Platform | Owner | Model | Booking | Published pricing |
| --- | --- | --- | --- | --- |
| **C.H. Robinson Navisphere Carrier** | C.H. Robinson | A broker's own board and app: "thousands of available loads," "free to all C.H. Robinson contract carriers" | The app lists "all available loads within 100 miles"; the carrier can make an offer or book | Free to its carriers; the broker earns its margin |
| **DAT One** | DAT Freight & Analytics, a Roper Technologies business | The largest board by its own account; "266 million transactions" across lanes; rate data from DAT iQ | "Book Now," accepting a load and locking the rate with one click, on combo broker-carrier plans; Priority Booking for brokers; TMS and FTP integration for automated posting | Carriers $59 to $339 a month (Standard, Enhanced, Pro, Select, Office); brokers $159 to $449 (Express, Select Broker, Office Broker); combos $339 and $469 |
| **Truckstop** | Truckstop | Load board with rate insights and broker ratings; owns RMIS onboarding since 2021 | "Book It Now ... with brokers you know you can trust," on carrier Advanced and Pro and broker Pro and Premium | Per user per month: carriers $42 to $159, brokers $109 to $369, combos $139 to $420, shippers $109 to $239; a $42 carrier application fee |
| **Uber Freight** | Uber Technologies | A broker and TMS business selling through an app; $5,099 million of 2025 revenue presented gross | App booking at a posted price | The broker's margin |
| **Convoy Platform** | DAT, since July 30, 2025 (from Flexport, which bought Convoy's technology in 2023) | Convoy's automated matching: its procurement technology "fully automates the supply side for 98% of loads booked," per TechCrunch's 2023 report | Automated offers and booking | Not published; FreightWaves reported the DAT price "near $250 million" |

The patterns:

- **Two business models.** Public boards sell subscriptions to both sides and never touch the freight; broker apps are free to carriers and make the broker's spread. DAT and Truckstop also sell rate data and carrier vetting around the board (DAT's CarrierWatch, Truckstop's RMIS), and DAT sells factoring, so the subscription is the entry point.
- **Booking moves into the board.** One-click booking at a posted price (DAT's Book Now, Truckstop's Book It Now, the broker apps) replaces the phone call for the share of loads where the broker is willing to publish a price and accept the first qualified carrier.
- **Trust is a feature of the board.** Truckstop sells broker ratings with "days-to-pay, credit history," DAT shows days to pay and credit scores and says "On average, our brokers pay within 28 days," and both run carrier vetting next to the board. The board is where the two sides decide whether to trust each other.
- **Matching consolidated.** Convoy's technology passed through Flexport to DAT; the venture-funded digital brokers of 2021 either became features of larger companies or shrank, and the board operators own the matching layer as well as the listings.

## What a Board Is, Legally

A board that only publishes freight is not a broker; a platform that takes part in the transaction may be. FMCSA's 2023 guidance on the definition of broker says that "merely making information about potential shippers publicly available" does not require broker authority, but only if the publisher is not "involved in any transaction between the shipper and a motor carrier," and it didn't adopt commenters' view that load boards and load-matching services "should not be considered brokers," answering only with the publishing test. The same guidance holds that handling money "is not an essential requirement for one to be considered a broker," and a dispatch service that books loads for several carriers and chooses which carrier gets each "must obtain broker operating authority registration."

So the design decisions are legal ones. A board that sets the price, chooses the carrier, issues the rate confirmation or moves the money is close to the line; one that lists loads posted by registered brokers and lets them contract with carriers directly is the classic board. The broker apps are on the other side of the line by design: the broker is the contracting party and the app is its sales channel. A platform's terms, its confirmation documents and its data model should all say which it is ([Broker, Carrier, Forwarder, Dispatcher](/books/logistics/freight-brokerage#broker-carrier-forwarder-dispatcher)).

## Posting

A posting is the broker's advertisement of a load, not the load. One load can have postings on several boards and the broker's own app, each with its own identifier, visible rate (or none), comment text and status. What posting systems handle:

- **Fields.** Origin and destination (city and state, or a radius around them), pickup date or window, equipment and length, full or partial, weight, stops, the posted rate or a blank, and a contact. Boards map their own equipment and commodity codes, so a broker's `53_dry_van` becomes the board's code at the edge.
- **Posting by integration.** Brokers post from the TMS automatically (DAT's broker plans "connect with pre-approved TMS platforms and automate load posting," with FTP as the other route; the alternative is reps posting by hand), with rules for which loads to post, when (immediately for a same-day load, after the routing guide fails for a contract load) and with what rate.
- **Withdrawal.** The posting must come down everywhere when the load is covered, cancelled or rescheduled. A stale posting wastes carriers' time, generates calls the broker can't take and is the listing fraudsters harvest for load details.
- **Rate visibility.** Posting the rate attracts carriers and reveals the broker's price to competitors and shippers; a blank rate makes every booking a negotiation. Brokers vary it by lane, lead time and how hard the load is.
- **Refresh.** On boards that sort by age, re-posting moves a load up the list; boards limit or log refreshes to stop the games.

## Matching

Matching ranks carriers for a load, or loads for a truck. The inputs are the same whether a rep does it from memory or software does it at scale:

- **Where the truck is and will be.** A truck delivering near the pickup, empty when the load is ready, is the best match: the carrier's deadhead to the pickup is cost it can't bill ([Deadhead](/books/logistics/logistics-business#an-asset-carrier-load) shows its weight). Tracking feeds, ELD integrations and trucks carriers post as available give position and availability.
- **Where the carrier wants to go.** Preferred lanes, home base, and the backhaul a carrier needs to get a truck home; a carrier that hauled the lane last week will probably haul it again.
- **Fit.** Equipment, hazmat and team capability, insurance limits against the load's value, the broker's qualification of the carrier and its restrictions.
- **Performance.** On-time pickup and delivery, tracking compliance, claims and fall-offs (accepting and then cancelling) on the broker's own loads.
- **Price.** The carrier's likely ask on this lane given its history, against the broker's target buy.

The output is an ordered list and, for each candidate, the offer to make. My rule is to treat ranking as a weighted objective in money, not a points table, because every input above is ultimately a cost or a probability of one (deadhead miles, a fall-off's re-cover cost, a late delivery's penalty), and money is the only unit a rep and a model can argue about ([One Unit, Preferably Money](/docs/building-blocks/weighing-objectives#one-unit-preferably-money)). Eligibility (authority, insurance, qualification) is a hard constraint before ranking, never a weight.

## Pricing a Posted Load

A broker posting a load sets a target buy and, for book-now, a price it will pay the first qualified carrier. The inputs are the ones in [Pricing and Margin](/books/logistics/freight-brokerage#pricing-and-margin), with three that matter more on a board:

- **Time to pickup.** The price for a load picking up in six hours is not the price for the same load in three days; a posted price usually steps up as pickup approaches and the load is still uncovered.
- **The market right now.** Board-level ratios of posted loads to posted trucks and the broker's own response rate on recent postings tell it whether the posted price is attracting carriers.
- **The margin floor.** Each increase is bounded by the sell rate less the floor, and past it the load needs a manager or goes back to the shipper.

Carriers respond by booking at the posted price, offering a counter, or ignoring the post. A system that records every offer and counter, with its time and the posted price at that moment, learns the lane's real clearing price; one that records only the final booking learns what the broker paid, not what the market wanted.

## Book-Now and Auto-Booking

Book-now turns a posting into a standing offer: any carrier who meets the conditions and clicks gets the load at the posted price, with a rate confirmation generated and sent. The conditions are where the risk sits:

- **Who may book.** Only carriers the broker has qualified, with the restrictions the load needs (equipment, hazmat, value), and often only carriers with history on the broker's own loads. An unknown carrier booking a high-value load in one click is the fraud scenario ([Freight Fraud & Cargo Theft](/books/logistics/freight-fraud)).
- **How much.** A price the broker set in advance, or one its pricing engine set and may change by the minute; the booking locks the price shown at the click, which the system must record.
- **How many.** One load can only be booked once. Two carriers clicking within the same second on the broker's app and on a board's book-now button is a race the system must lose cleanly for one of them.
- **What follows.** The booking creates an accepted tender, a rate confirmation and the withdrawal of every other posting for the load, in one transaction or in a saga that compensates if any step fails ([Sagas, Not Distributed Transactions](/docs/building-blocks/workflows#sagas-not-distributed-transactions)).

Auto-booking goes further: the broker's system offers loads to ranked carriers directly (by app notification, email or API) and accepts the first acceptance, or accepts a carrier's counteroffer automatically when it is inside a band. The decision record (which carriers were offered the load, at what price, in what order, who accepted, which rule accepted a counter) is what the broker needs when a shipper asks why a carrier was chosen and when a court asks the same question after *Montgomery* ([Negligent Selection After *Montgomery*](/books/logistics/freight-brokerage#negligent-selection-after-montgomery)).

## Convoy

Convoy is the industry's reference case for digital matching, and its record is mostly in press reports. TechCrunch reported in November 2023 that it had been valued at $3.8 billion in April 2022 after a $260 million Series E, that it "boasted more than 400,000 truck drivers and 80,000 carriers in its network," that its procurement technology "fully automates the supply side for 98% of loads booked," and that it pursued Fortune 500 accounts whose complexity, with the freight recession, made profitability hard. Flexport bought its technology stack and a small team, not the company or its liabilities, at a price its CEO called "modest." GeekWire reported on July 28, 2025 that Flexport was selling the relaunched Convoy Platform to DAT, and FreightWaves, as GeekWire cites it, put the price "near $250 million"; Roper Technologies, DAT's parent, reports Convoy's results "from July 30, 2025" and doesn't disclose a price for it. The exact date Convoy ceased operations in October 2023 appears only in secondary reports. <!-- source-gap: logistics-load-boards-convoy-shutdown-date | secondary | Convoy ceased operations in October 2023 | closes with: a court filing, WARN notice or company statement dating the shutdown | checked: 2026-11-22 -->

The lesson for system design isn't that automated matching fails; the automation survived and sold twice. It's that matching is a feature of a brokerage's economics, which a down cycle tests (cheap capacity, falling sell rates, shippers rebidding), and that the hard records under it (qualification, confirmations, payments, claims) are the same as any broker's.

## How to Build It

The deltas add postings per channel, every offer and counter, carrier capacity and lane preferences, and the booking rules:

```sql
ALTER TABLE loads
  ADD COLUMN target_buy        BIGINT,  -- minor units, the posted target
  ADD COLUMN max_buy           BIGINT,  -- sell less the margin floor
  ADD COLUMN booking_lock      UUID;  -- the offer that won; set once, under a row lock
ALTER TABLE loads ADD CONSTRAINT loads_buy_bounds_check
  CHECK (target_buy >= 0 AND max_buy >= 0 AND target_buy <= max_buy) NOT VALID;

ALTER TABLE tenders
  ADD COLUMN load_offer_id UUID;  -- the offer that became this tender, for board and app bookings

CREATE TABLE load_postings (                -- one advertisement of a load on one channel
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  load_id           UUID NOT NULL REFERENCES loads (id),
  channel           TEXT NOT NULL CHECK (channel IN ('dat', 'truckstop', 'broker_app',
                      'email_blast', 'other_board')),
  external_id       TEXT,               -- the board's posting ID, once accepted
  posted_rate       BIGINT CHECK (posted_rate >= 0),  -- null: rate not shown
  currency          CHAR(3) NOT NULL,
  book_now          BOOLEAN NOT NULL DEFAULT FALSE,
  fields            JSONB NOT NULL,     -- the posting as sent, in the board's codes
  status            TEXT NOT NULL CHECK (status IN ('pending', 'live', 'refreshed',
                      'withdrawn', 'expired', 'rejected')),
  posted_at         TIMESTAMPTZ,
  withdrawn_at      TIMESTAMPTZ,
  withdraw_reason   TEXT CHECK (withdraw_reason IN ('covered', 'cancelled', 'rescheduled',
                      'repriced', 'manual')),
  UNIQUE (channel, external_id)
);
CREATE INDEX ON load_postings (load_id) WHERE status IN ('pending', 'live', 'refreshed');

CREATE TABLE load_offers (                  -- every price exchanged for a load, either way
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  load_id           UUID NOT NULL REFERENCES loads (id),
  posting_id        UUID REFERENCES load_postings (id),
  carrier_party_id  UUID REFERENCES parties (id),  -- null until a caller is identified
  direction         TEXT NOT NULL CHECK (direction IN ('broker_offer', 'carrier_bid',
                      'carrier_counter', 'broker_counter', 'book_now')),
  amount            BIGINT NOT NULL CHECK (amount >= 0),
  currency          CHAR(3) NOT NULL,
  posted_rate_then  BIGINT,             -- what the posting showed at that moment
  rank              INT,                -- the carrier's place in the match list, if offered
  decided_by_kind   TEXT CHECK (decided_by_kind IN ('user', 'rule', 'carrier')),
  decided_by        TEXT,
  status            TEXT NOT NULL CHECK (status IN ('open', 'accepted', 'declined',
                      'countered', 'expired', 'lost_race', 'withdrawn')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at        TIMESTAMPTZ,
  responded_at      TIMESTAMPTZ
);
CREATE INDEX ON load_offers (load_id, created_at);
CREATE UNIQUE INDEX load_offers_one_winner ON load_offers (load_id) WHERE status = 'accepted';

CREATE TABLE carrier_capacity_posts (       -- a truck a carrier says is available
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  carrier_party_id  UUID NOT NULL REFERENCES parties (id),
  source            TEXT NOT NULL CHECK (source IN ('dat', 'truckstop', 'broker_app',
                      'tracking', 'rep')),
  equipment_type    TEXT NOT NULL,
  available_at      GEOGRAPHY(Point, 4326) NOT NULL,
  available_during  TSTZRANGE NOT NULL,
  destinations      TEXT[] NOT NULL DEFAULT '{}',  -- lane keys: 'state:US-TX', 'zip3:750'
  observed_at       TIMESTAMPTZ NOT NULL,
  received_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE auto_booking_rules (           -- who may book what without a person
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_party_id    UUID NOT NULL REFERENCES parties (id),
  version           INT NOT NULL,
  applies_to        JSONB NOT NULL,     -- {"equipment": "53_dry_van", "max_cargo_value": ...}
  min_loads_with_us INT NOT NULL DEFAULT 0,
  qualification_in  TEXT[] NOT NULL DEFAULT ARRAY['approved'],
  counter_band_bp   INT CHECK (counter_band_bp BETWEEN 0 AND 10000),  -- auto-accept counters within
  valid_during      TSTZRANGE NOT NULL,
  UNIQUE (owner_party_id, version)
);
```

The book-now race resolves on the load row: lock it, check it's still open, mark the winner, and let every other click see `lost_race`. The tender, the confirmation and the withdrawals follow in the same transaction, or through the outbox if a board's API must be called:

```go tab="Go"
var ErrAlreadyBooked = errors.New("load already booked")

func (s *Service) BookNow(ctx context.Context, loadID, carrierID uuid.UUID, priceShown int64) (uuid.UUID, error) {
	var offerID uuid.UUID
	err := s.tx(ctx, func(q *Queries) error {
		load, err := q.LockLoad(ctx, loadID) // SELECT ... FOR UPDATE
		if err != nil {
			return err
		}
		if load.BookingLock != nil || load.Status != "planning" {
			return ErrAlreadyBooked
		}
		if err := s.rules.MayAutoBook(ctx, q, load, carrierID); err != nil {
			return err // not qualified, restricted, or too new for this freight
		}
		offerID, err = q.InsertOffer(ctx, loadID, carrierID, "book_now", priceShown, "accepted")
		if err != nil {
			return err
		}
		if err := q.SetBookingLock(ctx, loadID, offerID); err != nil {
			return err
		}
		if err := q.InsertAcceptedTender(ctx, loadID, carrierID, priceShown, offerID); err != nil {
			return err
		}
		return q.EnqueueOutbox(ctx, "load.booked", loadID, offerID) // withdraws postings, sends rate con
	})
	return offerID, err
}
```

```rust tab="Rust"
#[derive(Debug, thiserror::Error)]
pub enum BookError {
    #[error("load already booked")]
    AlreadyBooked,
    #[error("carrier may not auto-book this load: {0}")]
    NotAllowed(String),
    #[error(transparent)]
    Db(#[from] sqlx::Error),
}

pub async fn book_now(svc: &Service, load_id: Uuid, carrier_id: Uuid, price_shown: i64)
    -> Result<Uuid, BookError>
{
    let mut tx = svc.pool.begin().await?;
    let load = lock_load(&mut tx, load_id).await?; // SELECT ... FOR UPDATE
    if load.booking_lock.is_some() || load.status != LoadStatus::Planning {
        return Err(BookError::AlreadyBooked);
    }
    svc.rules.may_auto_book(&mut tx, &load, carrier_id).await
        .map_err(|e| BookError::NotAllowed(e.to_string()))?;
    let offer_id = insert_offer(&mut tx, load_id, carrier_id, Direction::BookNow, price_shown).await?;
    set_booking_lock(&mut tx, load_id, offer_id).await?;
    insert_accepted_tender(&mut tx, load_id, carrier_id, price_shown, offer_id).await?;
    enqueue_outbox(&mut tx, "load.booked", load_id, offer_id).await?; // withdraws postings, sends rate con
    tx.commit().await?;
    Ok(offer_id)
}
```

A lane's clearing price, from offers rather than bookings:

```sql
SELECT date_trunc('week', o.created_at) AS week,
       percentile_cont(0.5) WITHIN GROUP (ORDER BY o.amount) AS median_carrier_ask,
       count(*) FILTER (WHERE o.direction = 'book_now') AS book_now_count,
       count(DISTINCT o.carrier_party_id) AS carriers_responding
FROM load_offers o
JOIN loads l ON l.id = o.load_id
WHERE l.owner_party_id = $1
  AND o.direction IN ('carrier_bid', 'carrier_counter', 'book_now')
  AND o.load_id IN (SELECT id FROM loads_on_lane($2, $3))  -- origin and destination keys
GROUP BY 1
ORDER BY 1;
```

Design notes:

- **Postings are not loads.** A load has many postings and none of them is its state; covering the load withdraws them all, and a failed withdrawal on one board is an alert, not a silent leftover.
- **Every offer is data.** Bids, counters and book-now clicks are rows with the posted price at that moment, which is what pricing models and rate disputes need; the booking alone is a biased sample.
- **One winner, enforced by the database.** The row lock and the partial unique index on accepted offers make the race deterministic ([Unique Keys for Discrete Units](/docs/building-blocks/reservations-and-holds#unique-keys-for-discrete-units)); the losing carrier gets a clear `lost_race`, not a confirmation that is later withdrawn.
- **Board calls are idempotent and outside the lock.** Posting and withdrawing on DAT or Truckstop go through the outbox with idempotency keys, because a board's API timing out must not hold a database lock or post twice ([Idempotency Beyond the API](/docs/requests/idempotency#idempotency-beyond-the-api)).
- **Rules are versioned.** An auto-booking decision records the rule version that allowed it, like every selection ([Record Which Rule Decided](/docs/building-blocks/rules-as-data#record-which-rule-decided)).
- **Capacity posts are observations.** A carrier's posted truck is a claim at a time; it expires with its window and is never treated as the truck's position.

Emit `load.posted`, `load.withdrawn`, `offer.received`, `offer.accepted` and `load.booked`; pricing, rep notifications and posting sync subscribe to them.

## Auditing

- **Every posting,** with what each channel showed, when it went live and when and why it came down.
- **Every offer and counter,** with its price, the posted price then, the carrier, who or which rule decided, and the outcome.
- **Every automatic booking,** with the rule version, the carrier's qualification at that moment and the match rank.
- **The races,** with the losing offers kept, so a carrier disputing a lost booking can be answered.

The mechanics are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Keep postings separate from loads,** one per channel, and withdraw all of them in the same flow that covers the load.
- **Record every offer and counter** with the price shown at the time, not only the booking.
- **Rank carriers on money,** after hard eligibility checks, and record the ranking an automatic offer used.
- **Make book-now a guarded standing offer:** qualified carriers only, restricted by freight, one winner enforced by the database.
- **Run board integrations through the outbox** with idempotency keys and alert on failed withdrawals.
- **Know which side of the broker line the platform is on,** and make its documents and data model say so.

## References

**Government**

- [Definitions of Broker and Bona Fide Agents, final guidance (June 16, 2023)](https://www.govinfo.gov/content/pkg/FR-2023-06-16/html/2023-13080.htm), publishing shipper information, load-matching services, handling money and dispatch services

**Vendors**

- [DAT: Company](https://www.dat.com/company), Dial-A-Truck, loads posted, 266 million transactions, Roper Technologies and the product lines, including factoring
- [DAT: Load boards](https://www.dat.com/load-boards), carrier, broker and combo plans and prices, Book Now, Priority Booking, TMS integration, days to pay and CarrierWatch
- [Truckstop: Load board](https://truckstop.com/product/load-board/), Book It Now, rate insights, broker ratings, 80 million annual loads, plans and prices
- [C.H. Robinson: Carrier FAQ](https://www.chrobinson.com/en/Carriers/FAQ/), Navisphere Carrier, the 100-mile list and offers in the app
- [Truckstop.com acquires Registry Monitoring Insurance Services (March 22, 2021)](https://prnewswire.com/news-releases/truckstopcom-acquires-registry-monitoring-insurance-services-rmis-301252521.html), Truckstop's ownership of RMIS

**Filings**

- [Uber Technologies: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1543151/000154315126000015/uber-20251231.htm), Freight revenue and its gross presentation
- [Roper Technologies: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/882835/000088283526000009/rop-20251231.htm), DAT as a Roper business and Convoy's results from July 30, 2025

**Press**

- [TechCrunch: Flexport acquires technology of former digital freight unicorn Convoy (November 1, 2023)](https://techcrunch.com/2023/11/01/flexport-acquires-technology-of-former-digital-freight-unicorn-convoy), valuation, network size, automation share and what Flexport bought
- [GeekWire: Flexport is selling Convoy's technology to DAT (July 28, 2025)](https://www.geekwire.com/2025/flexport-is-selling-convoys-technology-to-freight-giant-dat/), the sale and the reported price
