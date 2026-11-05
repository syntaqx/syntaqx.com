+++
title = "Corporate Actions & Asset Events"
nav_title = "Corporate Actions"
description = "Dividends, splits, mergers, spinoffs, tenders and proxy votes through DTC to the ledger, and forks, airdrops, migrations and delistings on chains."
category = "Investing & Digital Assets Industry"
order = 2510
part = "Accounts and Positions"
tags = ["investing", "corporate-actions", "dividends", "splits", "proxy-voting", "forks", "airdrops", "cost-basis"]
+++

A position changes without the customer doing anything. A company pays a dividend, splits its shares three for one, merges into another company for cash and stock, spins off a division, or asks holders whether they want to tender. A chain forks into two, a protocol drops new tokens into every holder's address, a token moves to a new contract, a stablecoin issuer redenominates, an exchange delists an asset. Each of these is an **asset event**: something the issuer or the network does that changes what every holder owns, on a schedule the firm doesn't set, and that the ledger has to apply to every account at once, exactly, with the tax basis following.

The reason this is hard is that nobody hands the broker a list of its customers' entitlements. The issuer's agent pays the record holder, which for street-name shares is DTC's nominee; DTC allocates to its participants by their positions; the broker allocates to its customers by its own books, and a clearing firm does it again for each introducing broker. At every level the payer computes the entitlement on its own positions with its own rounding, so the broker receives a total and has to divide it across thousands of accounts, many of them holding fractions, and end with a ledger that ties to the cash and shares it actually received. A crypto exchange has the same job with no agent at all: when a chain forks, nobody pays it anything, and whether its customers get the new coin is its own decision.

This chapter covers that work on the core model of [The Investing & Digital Assets Business](/books/investing-and-digital-assets/investing-business#the-core-data-model): the dates that decide who is entitled, cash and stock dividends, splits and reverse splits with cash in lieu, mergers and elections, spinoffs and their basis allocation, tender offers, DTC's processing, fractional entitlements, proxy and pass-through voting, and the chain events. The basis consequences are carried into the lot engine in [Cost Basis, Tax Lots & Wash Sales](/books/investing-and-digital-assets/cost-basis-and-tax-lots#corporate-actions-and-basis), and the cash a customer receives shows up on the forms in [Confirms, Statements & Tax Forms](/books/investing-and-digital-assets/statements-and-tax-forms#the-1099-composite).

## How the Platforms Do It

What platforms and the depository publish about corporate actions, as of November 2026:

| Platform | What it processes | How it treats fractions and orders | Voluntary events and votes |
| --- | --- | --- | --- |
| **Alpaca** (mandatory corporate actions) | Cash and stock dividends, forward and reverse splits, spinoffs, cash, stock and mixed mergers, full calls, liquidations, name changes; a stock-and-cash merger posts three entries (remove the old security, allocate new shares, allocate cash) | "For reverse splits all GTC orders will be canceled"; for forward splits "GTC buy limits and sell stops are adjusted"; a CUSIP change makes "the current asset" inactive and adds a new one; dividends post gross (`DIV`) with foreign withholding separately (`DIVNRA`) | Tender, exchange and rights offers, election mergers, consents and warrant exercises, announced to customers by email with instructions, at "$100 per client per voluntary corporate action" |
| **DTC** (Corporate Actions Processing) | "Announcements, elections, payments and reporting" for distributions, redemptions and reorganizations, across about 1.44 million issues and more than $100 trillion of securities serviced (Q2 2026) | Allocates to participants by position; participants allocate to their customers | Collects instructions from participants where an event needs them; ISO 20022 messaging |
| **Fidelity** (fractional positions) | Dividends on fractional-only positions "in proportion to your ownership interest," supported to $0.01 | Fractions reinvest like full shares in its dividend reinvestment program | "You will not be able to participate in proxy voting" for the fractional portion, and most voluntary corporate actions are unavailable for it |
| **Robinhood** (fractional shares) | Dividends on fractions "rounded to the nearest penny" | Forward splits deliver proportional fractions; reverse splits pay "the cash equivalent of any fractional (non-whole) share amounts" | Robinhood will "aggregate and report votes on fractional shares" |

Three things stand out. **The event is announced once and applied many times.** DTC processes it for participants, each broker for its accounts, and Alpaca's three-entry merger is the shape every broker's ledger takes: one balanced set per instrument the event touches. **Orders are part of the event.** A forward split has to rewrite open orders' prices and quantities or cancel them, and a reverse split usually cancels them, because a working order at the old price is wrong the moment the split takes effect. **Fractions are where brokers differ.** One aggregates fractional votes, another excludes them; both pay dividends on fractions to the cent and both turn reverse-split fractions into cash. Those are product choices sitting on one rule: the fractions must sum, with whatever the firm holds itself, to the whole shares the firm actually received.

## Record, Ex and Pay Dates

Every distribution has four dates. The issuer **declares** it, names a **record date** (holders on its books that day are paid) and a **pay date**, and the exchange or FINRA sets the **ex-date**, the first day a buyer no longer gets the distribution. Under FINRA's Uniform Practice Code, Rule 11140(b)(1), for cash dividends and for stock dividends under 25% of the security's value, the ex-date "shall be the record date if the record date falls on a business day." Under T+1 that is arithmetic: a buyer on the business day before the record date settles on the record date and is on the books; a buyer on the record date settles a day later and isn't.

**Worked numbers: who gets the dividend.** XYZ declares $0.24 per share with a record date of Friday, November 13, 2026, and a pay date of Monday, November 30.

| Trade date | Settles | On the books at the record date? | Paid on Nov 30 |
| --- | --- | --- | --- |
| Thu, Nov 12 (buy) | Fri, Nov 13 | Yes | Buyer |
| Fri, Nov 13 (buy, the ex-date) | Mon, Nov 16 | No | Seller |
| Thu, Nov 12 (sell) | Fri, Nov 13 | No | Buyer of those shares |

For distributions of **25% or more** of the security's value, including large stock dividends and splits, Rule 11140(b)(2) moves the ex-date to "the first business day following the payable date." A 3-for-1 split with a record date of Monday, November 9 and a payable date of Friday, November 13 goes ex on Monday, November 16. Shares sold between the record date and the ex-date trade at the pre-split price with the new shares still attached, so the seller, who was on the record date's books, has to pass the additional shares to the buyer. A broker that applies the split from its record-date positions alone credits the wrong customer; the entitlement follows the trades made in that window.

My trigger for most events is the ex-date, not the pay date. On the ex-date the market price drops by the distribution, so a customer's trade-date position on the ex-date is entitled to a receivable (cash or shares) that pays on the pay date. Booking the receivable at ex-date keeps market value honest overnight and gives the reconciliation something to match when DTC pays.

## Cash and Stock Dividends

A cash dividend is three entries. On the ex-date, per entitled account, a receivable: the customer is owed the dividend, the firm is owed it by DTC. On the pay date, DTC credits the firm's settlement account and the receivable clears into the customer's cash, minus any withholding. Then the reconciliation: what DTC paid on the firm's position against the sum of what the firm credited its customers and itself.

Withholding is decided per account at the pay date: a US person without a valid certification is backup withheld, a documented foreign person at the treaty or statutory rate ([Tax Status: W-9 and W-8BEN](/books/investing-and-digital-assets/opening-accounts#tax-status-w-9-and-w-8ben)). Alpaca's `DIV` and `DIVNRA` entries are the public shape: gross dividend in one line, foreign withholding as its own line, net as the difference, so the year-end form can report gross and withheld separately.

**Worked numbers: a dividend on a fractional position.** A customer holds 37.123 shares of XYZ at the ex-date. Entitlement: 37.123 × $0.24 = $8.90952, rounded to $8.91, as Robinhood and Alpaca both round dividends on fractions "to the nearest penny." The firm received $0.24 on every whole share at DTC; summed across every customer and the firm's own inventory of fractions, the rounded credits never quite equal what arrived, and the difference is booked to a firm rounding account rather than lost. [Rounding and Residuals](/books/investing-and-digital-assets/fractional-and-recurring#rounding-and-residuals) works the full allocation across several accounts.

A **stock dividend** under 25% is a cash dividend paid in shares: the same dates, an entitlement in shares with fractions cashed out or credited, and a basis consequence (a nontaxable stock dividend spreads the old basis across old and new shares). Dividend reinvestment, where the customer elects to buy more shares with the cash, is not a corporate action at all; it is an order the broker places after the pay date ([DRIP Is an Order, Not an Event](/books/investing-and-digital-assets/fractional-and-recurring#drip-is-an-order-not-an-event)).

## Splits and Reverse Splits

A split changes the number of shares and nothing else: same company, same total value, same total basis, same acquisition dates. The IRS's Publication 550 says to "figure the basis of stock splits in the same way as stock dividends if identical stock is distributed on the stock held", that is, divide the old basis across the old and new shares. In the lot engine, every open lot's quantity is multiplied, its per-share basis divided, and its acquisition date kept.

**Worked numbers: a 3-for-1 forward split.** A customer holds two lots of XYZ before the split.

| Lot | Acquired | Before: shares | Before: basis | After: shares | After: basis | After: per share |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| 1 | Feb 3, 2025 | 40 | $6,000.00 | 120 | $6,000.00 | $50.00 |
| 2 | Jul 8, 2026 | 10.5 | $1,890.00 | 31.5 | $1,890.00 | $60.00 |
| **Total** | | **50.5** | **$7,890.00** | **151.5** | **$7,890.00** | |

The ledger entry is one balanced set in XYZ: the customer line +101 shares, the DTC location line −101 (101 more shares held there; DTC credits the firm's account with the new shares on the payable date). Market value is unchanged because the price fell to a third. Open orders are part of the same event: a GTC limit buy for 20 shares at $140 becomes 60 shares at $46.67, or is canceled and the customer told; a stop that isn't adjusted becomes a sell order three times too high. Alpaca adjusts GTC buy limits and sell stops on a forward split; my default is to adjust only where the arithmetic is exact and cancel the rest with a notice.

A **reverse split** consolidates shares, usually to lift a low price above an exchange's minimum, and creates fractions for anyone whose position doesn't divide evenly. Issuers pay **cash in lieu** of the fractions, and Publication 550 treats that cash as "an amount realized on the sale of the fractional shares": a sale, with a gain or loss against the fraction's share of basis.

**Worked numbers: a 1-for-10 reverse split with cash in lieu.** A customer holds 125 shares of ABC with a basis of $1,500.00, bought March 3, 2026. After the split the position would be 12.5 shares; the half share is paid in cash at the post-split price of $9.80.

- **Shares:** 12 whole, plus 0.5 cashed out.
- **Basis:** $1,500.00 over 12.5 post-split shares is $120.00 per share. The 12 shares keep $1,440.00 and the March 3, 2026 acquisition date; the half share carries $60.00.
- **Cash in lieu:** 0.5 × $9.80 = $4.90, a sale of the half share for $4.90 against $60.00 of basis: a $55.10 short-term loss.
- **Reporting:** the 1099-B instructions exempt "sales of fractional shares of stock if gross proceeds are less than $20", so a broker need not report this $4.90 sale. The loss is still real and the lot engine still records it, closing the half share's lot with a `lot_closings` row; I show it on the year-end realized gain and loss detail even when no 1099-B line is required.

Reverse splits usually change the CUSIP. Alpaca's documentation is explicit that when "the CUSIP changes, the current asset becomes INACTIVE" and a new asset is added; in the core model that is a new `instruments` row, with the event moving every position from the old instrument to the new one in one entry, so the old instrument's lines net to zero and history before the split still reads correctly.

The cash-in-lieu arithmetic happens at every level of the chain, each on its own position. The issuer's agent cashes out fractions of record holders; DTC allocates whole shares to participants by their positions; the broker, whose customers' fractions don't sum to its own, decides how to pay each customer's fraction: at the agent's price where the agent paid for the firm's fraction, and at a price it sets and discloses for the rest. A firm that holds customer fractions in its own inventory (the riskless principal model in [How Brokers Create Fractions](/books/investing-and-digital-assets/fractional-and-recurring#how-brokers-create-fractions)) is buying those fractions from its customers, and books it as a principal trade.

## Mergers and Elections

A **cash merger** is a forced sale: every share becomes a fixed amount of cash on the effective date, a disposal at that price, with each lot closed and a gain or loss reported on the 1099-B. A **stock merger** exchanges old shares for new at a ratio and, if it qualifies as a reorganization, carries basis and acquisition dates into the new shares with fractions paid in cash. A **mixed merger** pays both, which is why Alpaca's stock-and-cash merger posts three entries.

An **election merger** lets each holder choose cash or stock, subject to proration when one side is oversubscribed, and is where the corporate actions system needs a form, a deadline and a default:

- **The election** is an `asset_event_elections` row per account: what was chosen, for how many shares, when. Customers who don't elect get the default the merger agreement names.
- **The broker's deadline** is earlier than the agent's. The broker has to aggregate its customers' instructions and submit them through DTC before DTC's own cutoff, which is before the agent's; the customer-facing deadline is computed back from those with a margin for operations.
- **Proration** comes after the deadline. If cash is oversubscribed, each cash elector's shares are partly paid in stock at the ratio the agent announces; the broker applies the same ratio to each customer's election and books the result when DTC allocates.

The tax side of a merger depends on whether the deal is a reorganization, which the issuer reports on Form 8937 for its holders; a broker that has already reported the event and then receives the issuer's statement corrects the 1099-B within 30 days ([Corrections and Their Timing](/books/investing-and-digital-assets/statements-and-tax-forms#corrections-and-their-timing)).

## Spinoffs

A **spinoff** distributes shares of a subsidiary to the parent's holders. In a tax-free spinoff no income arises and the parent's basis is split between parent and subsidiary by relative fair market value. Publication 550's own example allocates 10.9624% of the parent's basis to the spun-off shares; its rule is to "divide the adjusted basis of the old stock" between old and new, and the holding period of the new shares is the same as the old ones', as for a nontaxable stock dividend. The issuer publishes the allocation percentage on Form 8937, due "on or before the 45th day following the organizational action" per the 1099-B instructions, and brokers apply it.

**Worked numbers: a spinoff basis allocation.** A customer holds 200 shares of Parent with a basis of $18,000.00 ($90.00 per share), acquired April 1, 2024. Parent spins off Sub at one Sub share per four Parent shares, so the customer receives 50 Sub. The issuer's Form 8937 uses the first regular-way prices after the distribution: Parent $72.00, Sub $48.00.

| | Shares | Fair market value | Share of value | Basis allocated | Per share |
| --- | ---: | ---: | ---: | ---: | ---: |
| Parent | 200 | $14,400.00 | 85.7143% | $15,428.57 | $77.14 |
| Sub | 50 | $2,400.00 | 14.2857% | $2,571.43 | $51.43 |
| **Total** | | **$16,800.00** | **100%** | **$18,000.00** | |

Sub's basis is $18,000.00 × 2,400 / 16,800 = $2,571.428..., rounded to $2,571.43; Parent gets the remainder, $15,428.57, so the two sum to the original basis exactly ([Allocate Remainders Explicitly](/docs/money/amounts#rounding)). Both carry the April 1, 2024 acquisition date, so a sale of Sub in December 2026 is long-term even though the customer has held Sub for weeks. With several Parent lots, the allocation runs per lot: each lot spawns a Sub lot with its own share of basis and its own date.

The timing problem is that Sub starts trading before the issuer publishes the percentage. A customer can sell Sub the week after the spinoff, before Form 8937 exists. The lot engine records a provisional allocation (from the issuer's preliminary statement or the first trading prices), marks the lots `basis_status = provisional`, and restates every affected lot and closing when the final percentage arrives, producing corrected 1099-Bs for any closed lot.

## Tender Offers

A **tender offer** asks holders to sell their shares to the bidder or the issuer at a stated price, often for a limited number. SEC Rule 14e-1 sets the clock: an offer may not be held open "less than twenty business days" from its start, must remain open "at least ten business days" after a change in the price or the percentage sought, and the bidder must pay or return shares "promptly after the termination or withdrawal." For the broker it is a voluntary event like an election merger: an offer announcement to every holder, a customer deadline ahead of DTC's, instructions aggregated and submitted, tendered shares blocked from sale while they are tendered, proration if the offer is oversubscribed, and the purchase booked as a sale at the offer price with lots closed. Untendered shares stay where they were. A Dutch auction (the holder names a price within a range) adds the price to the election.

## DTC Processing

DTC is the industry's corporate action processor for street-name securities: its Corporate Actions Processing service lets participants "Manage corporate action announcements, elections, payments and reporting through one reliable service," for distributions, redemptions and reorganizations, across about 1.44 million issues serviced (Q2 2026), with ISO 20022 message specifications for participants. From a participant's side the flow is:

1. **Announcement.** DTC publishes the event's terms (type, ratios, rates, dates, options, deadlines) to participants; the broker loads it as an `asset_events` row, from the feed rather than retyped, and compares it to at least one other source (the issuer's press release, a data vendor).
2. **Entitlement.** On the record date (or the ex-date, for events where the entitlement follows trades), DTC computes each participant's entitlement on its DTC position. The broker computes each account's entitlement on its own books, and the two totals have to agree with the firm's DTC position plus its fails and pending deliveries.
3. **Elections.** For voluntary events, participants submit instructions to DTC before its cutoff; the broker's customer deadline sits ahead of it.
4. **Allocation and payment.** On the pay date, DTC credits cash and shares to participants; the broker posts its customers' entitlements and reconciles what arrived against what it posted.
5. **Revisions.** Terms change (a rate restated, a ratio corrected, a deadline extended); DTC republishes, and the broker reverses and reposts every entry the old terms produced.

An introducing broker's clearing firm does this for it, and the introducing broker still owns the customer-facing parts: the notice, the election screen, the deadline it shows.

## Fractional Entitlements

Fractional shares inherit every corporate action with the arithmetic made visible. A forward split multiplies fractions (Robinhood customers "receive the relevant amount of fractional shares"), a dividend pays to the cent, a reverse split turns fractions into cash, a merger turns them into fractions of the new company or into cash, and a spinoff can create a fraction of the new company from a whole number of the old. The firm's rule has to be the same at every event: compute each account's entitlement at the instrument's quantity precision, round cash to the cent with one stated rule, cash out fractions the firm won't carry, and book what is left over to a firm account so that customers' positions plus the firm's own equal what the firm received from DTC. Where fractions are held in the firm's inventory, the firm is itself a holder and receives its own entitlement, which is part of the reconciliation. [Fractional Shares & Recurring Investing](/books/investing-and-digital-assets/fractional-and-recurring#rounding-and-residuals) has the worked allocation.

Voluntary events are harder for fractions: a fraction can't be tendered at DTC because DTC holds whole shares, which is why Fidelity says most voluntary corporate actions aren't available for the fractional portion. A firm that offers it is tendering whole shares from its own inventory against its customers' fractions, and takes the proration risk itself.

## Proxy and Pass-Through Voting

Street-name holders vote through their broker. When an issuer plans a meeting it sends a search card, and SEC Rule 14b-1 requires the broker to reply "no later than seven business days after the date it receives an inquiry" with the approximate number of beneficial owners, then to forward proxy materials to them "no later than five business days after receipt", and, on request, to provide a list of beneficial owners who haven't objected to disclosure of their names. FINRA Rule 2251 adds that a member may not give a proxy to vote stock registered in its name except as the rule permits, and that the issuer reimburses the out-of-pocket costs at approved rates. A broker can hire an agent for the mailing and the tabulation; the obligations stay with the broker.

In the ledger's terms a vote is a record-date snapshot: each account's position at the meeting's record date is its voting entitlement, and the votes the broker submits for a meeting can't exceed the firm's DTC position. Fractions are the product choice. Robinhood will "aggregate and report votes on fractional shares"; Fidelity excludes the fractional portion. Aggregating means summing fractional votes by choice across customers and submitting whole votes, with a rounding rule for the remainder, which is the same allocation problem as a dividend in the other direction.

**Pass-through voting** extends the idea to funds: holders of a fund that owns the shares get a say in how the fund votes them, which turns a fund's record date into a set of customer instructions and a fund-level tally. Whatever the program, the records are the same: who was entitled, what they were sent and when, what they instructed, and what the firm submitted.

## Chain Events

Crypto has asset events without an issuer's agent, a depository or a record date. The exchange is its own DTC: it decides whether to apply the event, computes entitlements from its own ledger at a block height, and moves its own wallets on chain to back what it credits. The exchange-side decisions (which chain a fork's balances follow, replay protection, listing the new coin) are in [Chain Upgrades, Migrations and Forks](/books/investing-and-digital-assets/listing-assets#chain-upgrades-migrations-and-forks); this section is the account and ledger side.

### Forks and airdrops

A **hard fork** splits a chain; if both branches survive, every holder at the fork block owns the asset on both. An **airdrop** sends new tokens to holders' addresses. The IRS's Rev. Rul. 2019-24 makes the exchange's decision a tax event for its customers. It holds that a taxpayer has no income from a hard fork "if the taxpayer does not receive units of a new cryptocurrency," and has ordinary income when units are received in an airdrop following a hard fork, measured at fair market value "when the airdrop is recorded on the distributed ledger," with that amount as the basis. And it addresses custody directly: a taxpayer lacks dominion and control "if the address to which the cryptocurrency is airdropped is contained in a wallet managed through a cryptocurrency exchange and the cryptocurrency exchange does not support the newly-created cryptocurrency." So for a customer of an exchange, income arises when the exchange credits the new coin, at its value then, not at the fork.

For the ledger that means a credited fork or airdrop is two things at once:

- **An entitlement computed at the snapshot block.** Each account's balance of the original asset at the fork or snapshot height, from the ledger as of that block, times the distribution ratio. The exchange's wallets must have held the original at that block for the new coins to exist on chain at all.
- **An income event at crediting time.** A new tax lot per account with `acquired_at` the crediting time and basis the fair market value then, from a named price source, and an income record for year-end reporting. A credit days or months after the fork is still income at the crediting date's value.

An exchange that doesn't support a fork owes the customer nothing under its terms (the policies Kraken and Coinbase publish are quoted in [Forks and Airdrops](/books/investing-and-digital-assets/listing-assets#forks-and-airdrops)), but it holds the forked coins on chain in its wallets anyway, and its records should say so: the coins are an unrecognized balance in the wallet, not the firm's property by default, and a later decision to distribute them is an event like any other.

### Token migrations and redenominations

A **token migration** replaces one contract with another, often at 1:1 with a new ticker; a **redenomination** changes the unit (1,000 old for 1 new). Both are a conversion of every holder's balance at a stated time, posted as one entry per account moving the old instrument to the new one at the ratio, with remainders below the new instrument's precision booked like split fractions. The exchange migrates its own wallets through the issuer's migration contract and reconciles the new contract's balances to the customers' new lines.

The tax treatment of a contract migration is less settled than a stock split's. <!-- source-gap: ida-token-migration-tax | missing | whether a 1:1 token contract migration or redenomination is a disposal for US tax purposes | closes with: IRS guidance or a final regulation addressing token migrations | checked: 2026-11-05 --> I found no IRS guidance that says whether a one-for-one move to a new contract is a disposal, so my default is to carry each lot's basis and acquisition date into the new instrument, as a split does, record the event as a carryover with the migration's identifiers, and flag the lots so the treatment can be restated if guidance arrives.

### Delistings

A **delisting** ends trading on the platform; it is not an event at the issuer, and nothing happens to the asset on chain. What happens to the customer's balance is set by the wind-down plan in [Wind-Down Mechanics](/books/investing-and-digital-assets/listing-assets#wind-down-mechanics): withdraw it to another wallet by a date, sell it while sell-only trading lasts, or have it converted to cash or another asset by the platform. A forced conversion is a sale on the customer's account: an execution at the conversion price, lots closed, and a 1099-DA line like any other sale.

## How to Build It

These are deltas against [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model): `asset_events` (kind, `terms`, record, ex and pay dates, `snapshot_block`, `election_deadline`, status) and `asset_event_elections`, plus `journal_entries` and `journal_lines`, `tax_lots` and `lot_closings`, `orders` and `instruments`. This chapter adds the per-account entitlements, the proxy votes, and the exchange's recorded decision on each chain event, and extends the event with its source and revisions.

```sql
ALTER TABLE asset_events
  ADD COLUMN new_instrument_id UUID REFERENCES instruments (id),  -- the CUSIP-changed, merged, spun-off or forked asset
  ADD COLUMN revision INT NOT NULL DEFAULT 1,                     -- DTC or issuer restatements bump it
  ADD COLUMN source TEXT NOT NULL DEFAULT 'dtc',                  -- 'dtc', 'clearing_firm', 'issuer', 'chain', 'internal'
  ADD COLUMN source_ref TEXT,                                     -- the depository's event ID
  ADD COLUMN entitlement_basis TEXT NOT NULL DEFAULT 'record_date'
    CHECK (entitlement_basis IN ('record_date', 'ex_date_trades', 'snapshot_block')),
  DROP CONSTRAINT asset_events_status_check,
  ADD CONSTRAINT asset_events_status_check CHECK (status IN ('announced', 'confirmed',
    'entitled', 'processed', 'reconciled', 'canceled'));

CREATE TABLE asset_event_entitlements (       -- what each account gets, computed once per revision
  asset_event_id     UUID NOT NULL REFERENCES asset_events (id),
  revision           INT NOT NULL,
  account_id         UUID REFERENCES accounts (id),            -- NULL: the firm's own entitlement (firm lines carry no account)
  eligible_quantity  NUMERIC(78, 0) NOT NULL,                  -- position at record date, ex-date or snapshot block
  cash_amount        BIGINT NOT NULL DEFAULT 0,                -- minor units, gross
  withholding_amount BIGINT NOT NULL DEFAULT 0,
  share_quantity     NUMERIC(78, 0) NOT NULL DEFAULT 0,        -- new or changed shares, smallest units
  cash_in_lieu       BIGINT NOT NULL DEFAULT 0,                -- fractions paid out
  rounding_rule      TEXT NOT NULL,                            -- 'half_even_cents', 'truncate_9dp', ...
  status             TEXT NOT NULL CHECK (status IN ('computed', 'posted', 'reversed')),
  journal_entry_id   UUID REFERENCES journal_entries (id),
  UNIQUE NULLS NOT DISTINCT (asset_event_id, revision, account_id)
);

CREATE TABLE proxy_votes (                    -- record-date entitlement, what was sent, what came back
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  asset_event_id     UUID REFERENCES asset_events (id),        -- the meeting, recorded as an event without ledger effect
  meeting_ref        TEXT NOT NULL,
  record_date        DATE NOT NULL,
  account_id         UUID NOT NULL REFERENCES accounts (id),
  entitled_quantity  NUMERIC(78, 0) NOT NULL,                  -- fractions included, at the instrument's precision
  materials_sent_at  TIMESTAMPTZ,                              -- Rule 14b-1: within five business days of receipt
  instruction        JSONB,                                    -- per proposal: for, against, abstain
  instructed_at      TIMESTAMPTZ,
  submitted_quantity NUMERIC(78, 0),                           -- whole votes after aggregation
  UNIQUE (meeting_ref, account_id)
);

CREATE TABLE chain_event_decisions (          -- the exchange's own call on a fork, airdrop or migration
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  asset_event_id     UUID NOT NULL REFERENCES asset_events (id),
  decision           TEXT NOT NULL CHECK (decision IN ('credit', 'credit_later', 'not_supported',
                       'migrate', 'withdraw_only')),
  snapshot_block     BIGINT,
  crediting_at       TIMESTAMPTZ,                              -- income and acquisition time for the new lots
  price_source       TEXT,                                     -- fair market value at crediting, named
  wallet_balance_at_snapshot NUMERIC(78, 0),                   -- what the firm's wallets held of the original
  decided_by         TEXT NOT NULL,
  decided_at         TIMESTAMPTZ NOT NULL,
  rationale          TEXT NOT NULL,
  UNIQUE (asset_event_id)
);
```

The event moves through the core statuses plus two this chapter adds: `entitled` once the entitlements for the current revision are computed and frozen, `reconciled` once what arrived (from DTC, the clearing firm or the chain) ties to what was posted. A revision from DTC reverses the posted entitlements and sends the event back to `confirmed` with a new revision number; a cancellation reverses everything it posted.

![The asset event state machine. A row of states: announced, confirmed, entitled, processed and reconciled, with that path accented and reconciled a terminal state. Dashed exits labeled withdrawn, from announced, and terminated, from confirmed, lead to the terminal canceled state. A dashed back edge over the top from processed to confirmed is labeled revised terms: reverse, recompute.](/diagrams/ida-asset-event-states.svg "An event is applied once per revision: terms are confirmed against a second source, entitlements are frozen, posted on the pay date and reconciled to what DTC or the chain delivered; a restatement reverses the posting and runs the event again.")

Entitlements for a cash dividend, from trade-date positions at the record date, rounded per account with the remainder to the firm:

```sql
WITH holders AS (
  SELECT jl.account_id, SUM(jl.amount) AS qty               -- smallest units of the instrument
  FROM journal_lines jl
  JOIN journal_entries je ON je.id = jl.journal_entry_id
  WHERE jl.instrument_id = :instrument
    AND jl.ledger_account IN ('customer', 'firm')
    AND je.effective_date < :ex_date                         -- bought before the ex-date
  GROUP BY jl.account_id                                     -- firm lines group as one NULL row
  HAVING SUM(jl.amount) > 0
)
SELECT account_id, qty,
       ROUND(qty * :rate_cents / :unit_scale) AS cash_cents   -- round half-even in the application, then
FROM holders;                                                -- book the total minus the sum to the firm rounding account
```

The posting check, per event and revision: the sum of entitlements equals what the firm's DTC position (plus fails) entitles it to, in shares and in cents, with the difference on one firm line.

```sql
SELECT e.asset_event_id, e.revision,
       SUM(e.cash_amount)    AS posted_cash,
       SUM(e.share_quantity) AS posted_shares
FROM asset_event_entitlements e
WHERE e.asset_event_id = :event AND e.revision = :revision AND e.status <> 'reversed'
GROUP BY e.asset_event_id, e.revision;
-- compared with the DTC allocation for the same event; a difference opens a recon_break
```

Design notes:

- **One entry per account per event revision,** balanced per instrument: old shares out and new shares in, receivable and cash, cash in lieu as a sale with its lot closing. The idempotency key is the event, the revision and the account.
- **Lots follow the event in the same transaction.** A split rewrites lot quantities, a spinoff spawns lots, a merger closes or carries them, a fork opens them; the lot changes and the ledger entry commit together or not at all ([Corporate Actions and Basis](/books/investing-and-digital-assets/cost-basis-and-tax-lots#corporate-actions-and-basis)).
- **Orders are touched by the event.** Every open order in the instrument is adjusted (where the arithmetic is exact) or canceled, with an `order_events` row naming the asset event, before the market opens on the ex-date.
- **Two sources before confirming.** An event's terms are checked against a second source before entitlements are frozen; most corporate action losses are a ratio or a date keyed wrong.
- **The firm is a holder too.** Its own inventory of fractions and its proprietary positions get entitlements like any account, so the event reconciles to DTC in full.

## Auditing

Corporate actions are a standing exam topic for broker-dealers and a frequent source of customer complaints, and a chain event is a decision an exchange should be able to defend later. Keep:

- **Every event with every revision,** its source, the second source it was checked against, and who confirmed it.
- **Every entitlement as computed and posted,** with the positions it was computed from, the rounding rule and the entries it produced, and every reversal.
- **Every election and its deadline,** what the customer was shown, when they instructed, what was submitted to DTC, and the proration applied.
- **Every reconciliation to DTC, the clearing firm or the chain,** per event, with breaks worked to a cause.
- **Proxy distribution and voting records:** search card responses, material delivery times, instructions and submitted votes.
- **Every chain event decision** with its rationale, snapshot block, wallet balances at that block and the price source used for income.

## What This Means for the System You Build

- **Treat every corporate action and chain event as one record applied to every account,** with its own revisions, not as a batch of manual adjustments.
- **Use the ex-date and trades in the window,** not just record-date positions, for events of 25% or more.
- **Move lots, positions and open orders in the same event,** and reconcile the result to what DTC or the chain delivered.
- **Make cash in lieu a sale** with its own lot closing, even when the proceeds are under the reporting threshold.
- **Record provisional basis for spinoffs and mergers** and restate when the issuer's Form 8937 arrives.
- **Compute fractional entitlements with one rule and book the remainder** to a firm account.
- **Record the exchange's decision on every fork and airdrop,** and treat crediting as the customer's income event at that time's value.
- **Keep proxy records as carefully as ledger records:** entitlements, deliveries, instructions and votes.

## References

**Law and regulation**

- [17 CFR 240.14e-1: Unlawful tender offer practices](https://www.law.cornell.edu/cfr/text/17/240.14e-1), twenty business days minimum, ten business days after a change in price or percentage, prompt payment or return
- [17 CFR 240.14b-1: Obligation of registered brokers and dealers in connection with the prompt forwarding of certain communications to beneficial owners](https://www.law.cornell.edu/cfr/text/17/240.14b-1), the seven-business-day search card response, forwarding within five business days, and the list of non-objecting beneficial owners
- [FINRA Rule 11140: Transactions in Securities "Ex-Dividend," "Ex-Rights" or "Ex-Warrants"](https://www.finra.org/rules-guidance/rulebooks/finra-rules/11140), the ex-date as the record date for distributions under 25%, and the first business day after the payable date for 25% or more
- [FINRA Rule 2251: Processing and Forwarding of Proxy and Other Issuer-Related Materials](https://www.finra.org/rules-guidance/rulebooks/finra-rules/2251), prompt forwarding, voting stock registered in the member's name, issuer reimbursement

**Regulators and guidance**

- [IRS: Publication 550, Investment Income and Expenses](https://www.irs.gov/publications/p550), basis for stock splits and nontaxable stock dividends, the spin-off allocation example, cash for fractional shares as an amount realized on their sale, holding periods of distributed shares
- [IRS: Rev. Rul. 2019-24](https://www.irs.gov/pub/irs-drop/rr-19-24.pdf), no income from a hard fork without new units, ordinary income at fair market value when an airdrop is recorded, basis equal to income, and no dominion and control while an exchange doesn't support the new asset
- [IRS: Instructions for Form 1099-B (2026)](https://www.irs.gov/instructions/i1099b), Form 8937 due by the 45th day after the organizational action, corrected 1099-B within 30 days of the issuer statement, the $20 exception for fractional share sales

**Standards and protocols**

- [DTCC: Asset Services](https://www.dtcc.com/asset-services), 1.44 million issues serviced and more than $100 trillion of securities held and serviced (Q2 2026)
- [DTCC: Corporate Actions Processing](https://www.dtcc.com/products-and-services/asset-services/corporate-actions-processing), announcements, elections, payments and reporting for distributions, redemptions and reorganizations, and ISO 20022 messaging specifications

**Vendor documentation**

- [Alpaca: Mandatory corporate actions](https://docs.alpaca.markets/us/docs/mandatory-corporate-actions.md), the event types, GTC order cancellation on reverse splits and adjustment on forward splits, CUSIP changes as new assets, spinoff basis, merger entries and dividend activity types
- [Alpaca: Voluntary corporate actions](https://docs.alpaca.markets/us/docs/voluntary-corporate-actions.md), the voluntary event types and the $100 per client per event fee
- [Alpaca: Fractional trading](https://docs.alpaca.markets/docs/fractional-trading), dividends on fractions rounded to the nearest penny
- [Fidelity: Fractional shares](https://www.fidelity.com/trading/fractional-shares), dividends on fractional positions, no proxy voting or most voluntary actions for the fractional portion
- [Robinhood: Fractional shares](https://robinhood.com/us/en/support/articles/fractional-shares/), dividends rounded to the penny, aggregated fractional votes, proportional fractions on forward splits and cash for fractions on reverse splits
