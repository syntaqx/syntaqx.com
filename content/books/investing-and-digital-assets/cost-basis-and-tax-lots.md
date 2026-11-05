+++
title = "Cost Basis, Tax Lots & Wash Sales"
nav_title = "Cost Basis & Wash Sales"
description = "Lot relief methods, covered and noncovered securities, wash sales across accounts, basis through corporate actions and transfers, per-wallet crypto basis."
category = "Investing & Digital Assets Industry"
order = 2512
part = "Accounts and Positions"
tags = ["investing", "cost-basis", "tax-lots", "wash-sales", "1099-b", "crypto-tax", "rev-proc-2024-28"]
+++

Every sale has two prices: what the customer got and what the customer paid. The first is on the execution. The second is a reconstruction: which of the customer's purchases this sale used up, what those purchases cost, how that cost was changed by splits, spinoffs, return-of-capital distributions and losses disallowed on earlier sales, and when the holding period started. Since 2011 a US broker has had to report that reconstruction to the IRS for most stock it sells, on the same Form 1099-B the customer files from, and since January 1, 2026 a crypto broker has had to do the same for digital assets on Form 1099-DA. A broker's basis is a number the IRS matches against the customer's return. Getting it wrong costs the customer money or the broker penalties and corrected forms.

The record behind it is the **tax lot**: one row per acquisition, with quantity, cost, acquisition date and every adjustment since. The **lot engine** applies each sale to lots by the account's relief method, carries disallowed wash sale losses into replacement lots, rewrites lots through corporate actions, imports lots from other brokers, and produces the realized gains and losses that become the 1099. This chapter covers basis and holding periods, lot relief methods with worked numbers, covered and noncovered securities, wash sales within and across accounts, basis through corporate actions, transferred basis, crypto basis per wallet and per account under the 2024 regulations and Rev. Proc. 2024-28, and the lot engine, on the core model's `tax_lots` and `lot_closings` ([The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model)). Crypto income events (staking, mining, DeFi) and the wider tax picture are in Crypto Tax later in this book; harvesting losses on purpose is in [Tax-Loss Harvesting & Direct Indexing](/books/investing-and-digital-assets/tax-loss-harvesting-and-direct-indexing).

## How the Platforms Do It

What brokers publish about lots and methods, and what the rules default to, as of November 2026:

| Source | Default method | Other methods | Adjustments it names |
| --- | --- | --- | --- |
| **IRS** (Treas. Reg. 1.1012-1 and the 1099-B instructions) | Without identification, stock sold is "charged against the earliest lot"; a broker reports "any shares for which the acquisition date is unknown" first, then those acquired first | Specific identification by instruction and written confirmation; a standing order counts; average basis for fund and dividend reinvestment plan shares | Wash sale losses added to the replacement's basis when both trades are in the same account; issuer statements of actions affecting basis |
| **Robinhood** | "The default method for your Robinhood account is first-in, first-out (FIFO)"; futures closed FIFO too | Not described in the article | Basis adjusted "for applicable trading fees, corporate action activity, or a wash sale" |
| **Vanguard** | Average cost for mutual funds; "FIFO is the default cost basis method Vanguard uses for all investments other than mutual funds" | Average cost, FIFO, highest in first out, MinTax; the method can be chosen "at the time of sale" | Covered status by purchase date: January 1, 2011 for stocks, January 1, 2012 for funds |

Three things stand out. **FIFO is the default because it's the law's default,** not a product choice: absent identification, the earliest lot goes first. **Every other method is identification.** "Highest cost" or "minimum tax" is a standing instruction to pick particular lots, which the regulation treats as adequate identification; the broker's job is to apply it at the time of the sale and confirm it in writing. **The adjustments are where the work is.** Fees, corporate actions and wash sales change basis after the purchase, and each has its own source and timing.

## Basis and Holding Period

Basis is cost: "the basis of property shall be the cost of such property" (26 USC 1012(a)), increased by commissions and adjusted by later events. Two rules make it per account. Since 2011, the conventions for identifying what was sold "shall be applied on an account by account basis" for specified securities (1012(c)(1)), so a customer with the same stock at two brokers has two independent sets of lots. And the holding period decides the rate: property held "more than 1 year" gives long-term gain or loss, counted from the day after acquisition, with the day of sale included (Publication 550). A lot bought January 31, 2024 and sold January 29, 2025 is short-term; sold February 6, 2025, it is long-term.

In the ledger, a lot opens on trade date from the execution, with `acquired_at` the execution time and `holding_period_start` the trade date (the core model's `tax_lots`). Its cost is the execution amount plus commissions and fees charged on the buy; a sale's proceeds are reduced "by commissions and transfer taxes related to the sale" (1099-B instructions, box 1d). Both are in the account's base currency in minor units, because the forms are in dollars.

## Lot Relief Methods

When a sale doesn't close a whole position, something has to say which lots it used:

- **FIFO (first in, first out).** The default: without identification, the stock sold "is charged against the earliest lot the taxpayer purchased or acquired" (Treas. Reg. 1.1012-1(c)(1)). The 1099-B instructions put shares with unknown acquisition dates ahead of everything else, then "the shares that were purchased or acquired first, whether they are covered or noncovered."
- **Specific identification.** The customer names the lots: for stock held by a broker, the customer specifies "the particular stock" to the broker at the time of sale and the broker confirms the specification "in a written document" (1.1012-1(c)(3)), which may be electronic (c)(9).
- **Standing orders.** "A standing order or instruction for the specific identification of stock is treated as an adequate identification" (1.1012-1(c)(8)). Highest cost, lowest cost, last in first out and tax-minimizing rules are all standing orders, applied by the broker at each sale.
- **Average basis.** Allowed only for shares of a regulated investment company (a mutual fund) or stock in a dividend reinvestment plan (1.1012-1(e)): basis "is determined by averaging the basis of all shares of identical stock in an account." For a broker that elects it as the default, the 1099-B instructions treat average basis as reported unless the customer instructs otherwise.

**Worked numbers: one sale, three methods.** An account holds three lots of ABC. On Monday, November 2, 2026 the customer sells 60 shares at $120.00, for proceeds of $7,200.00.

| Lot | Acquired | Shares | Cost | Per share |
| --- | --- | ---: | ---: | ---: |
| L1 | Jan 15, 2024 | 50 | $4,000.00 | $80.00 |
| L2 | Jun 10, 2025 | 50 | $7,000.00 | $140.00 |
| L3 | Mar 3, 2026 | 50 | $5,500.00 | $110.00 |

| Method | Lots relieved | Basis | Long-term | Short-term | Total |
| --- | --- | ---: | ---: | ---: | ---: |
| FIFO | 50 of L1, 10 of L2 | $5,400.00 | +$1,800.00 (L1 +$2,000, L2 −$200) | | **+$1,800.00** |
| Highest cost | 50 of L2, 10 of L3 | $8,100.00 | −$1,000.00 (L2) | +$100.00 (L3) | **−$900.00** |
| Specific ID: 50 of L3, 10 of L1 | 50 of L3, 10 of L1 | $6,300.00 | +$400.00 (L1) | +$500.00 (L3) | **+$900.00** |

The same sale is a $1,800 gain, a $900 loss or a $900 gain, depending on a choice made at or before the trade. Highest cost realizes the loss in L2 (held more than a year, so long-term) and a small short-term gain in L3; the specific identification picks lots the customer wants out of for other reasons. The engine has to record which method applied, from which instruction, at the time of the sale, because a method changed after the trade doesn't change the trade: the regulation's identification is at the time of sale, and the written confirmation is what proves it.

Under average basis, the same 150 shares (if ABC were a mutual fund) average to $16,500 / 150 = $110.00, so the sale's basis is $6,600.00 and its gain $600.00; the holding period still runs lot by lot, first acquired first, so the 50 shares from L1 and 10 from L2 are long-term.

## Covered and Noncovered Securities

A broker must report basis only for **covered securities** (26 USC 6045(g)): specified securities acquired on or after the applicable date in the account, or transferred in from an account where they were covered with a transfer statement. The 1099-B instructions give the dates as stock "acquired for cash in an account after 2010," average-basis stock "after 2011," certain debt instruments and options "after 2013," a later group of debt "after 2015," and securities futures entered into "after 2013." For digital assets the statute's date is January 1, 2023, but under the final regulations a digital asset is covered "only if it was acquired in an account for which the broker provided custodial services," after 2025 (1099-DA instructions); brokers report basis on covered sales from January 1, 2026.

A noncovered lot still has a basis; the broker just isn't required to report it, and checks box 5 on the 1099-B (box 9 on the 1099-DA). A broker can still show its record of it to the customer, labeled as not reported to the IRS. The engine carries `covered` on every lot (the core model already does) and derives it from the acquisition date, the instrument type and how the lot arrived; a transfer that arrives without a statement turns a covered lot noncovered, which is why [Transferred Basis](#transferred-basis) is part of the lot engine and not of the transfer system.

## Wash Sales

A loss on a sale of "stock or securities" is disallowed if, within a period "beginning 30 days before the date of such sale" and "ending 30 days after such date," the taxpayer acquired, or contracted or took an option to acquire, substantially identical stock or securities (26 USC 1091(a)). The disallowed loss isn't lost: the replacement's basis becomes the old basis adjusted by the price difference (1091(d)), which Publication 550 puts as "add the disallowed loss to the cost of the new stock or securities," and the new stock's holding period includes the old stock's. Publication 550 extends the rule to purchases by a spouse or a controlled corporation, and to purchases in the taxpayer's IRA or Roth IRA, where the loss is disallowed and the basis is not added to the IRA shares.

**Worked numbers: a wash sale carried into the replacement lot.** One account, one stock.

| Date | Event | Shares | Price | Amount |
| --- | --- | ---: | ---: | ---: |
| Mon, Mar 2, 2026 | Buy, lot A | 100 | $50.00 | $5,000.00 |
| Thu, Oct 1, 2026 | Sell lot A | 100 | $40.00 | $4,000.00 |
| Tue, Oct 20, 2026 | Buy, lot B (19 days after the sale) | 100 | $42.00 | $4,200.00 |
| Wed, Feb 10, 2027 | Sell lot B | 100 | $48.00 | $4,800.00 |

- **The October 1 sale** realizes a $1,000.00 loss ($4,000 − $5,000), and the October 20 purchase is within 30 days after it, so all $1,000.00 is disallowed. The 2026 Form 1099-B line shows proceeds $4,000.00 (box 1d), basis $5,000.00 (box 1e) and wash sale loss disallowed $1,000.00 (box 1g); on Form 8949 the customer enters code W and the disallowed amount "as a positive number in column (g)", so the allowed loss is $0.
- **Lot B's basis** is $4,200.00 + $1,000.00 = **$5,200.00**.
- **Lot B's holding period** includes lot A's. Lot A was held from March 3 through October 1, 213 days. My engine expresses the tacking as an adjusted holding-period start: October 20, 2026 minus 213 days is **March 21, 2026**. Lot B becomes long-term if sold after March 21, 2027.
- **The February 10, 2027 sale** is $4,800.00 against $5,200.00: a **$400.00 short-term loss**, allowed (no replacement within 30 days), on the 2027 form. Over both years the customer lost $5,000.00 − $4,000.00 + $4,200.00 − $4,800.00 = $400.00 net, and that is what was finally recognized; the wash sale moved $1,000 of loss from 2026 into the basis of lot B, and from there partly into 2027's result.

**Partial replacement.** If the customer had bought only 60 shares on October 20, 60% of the loss ($600.00) is disallowed and added to the 60 replacement shares, and $400.00 is allowed in 2026. Publication 550's examples match replacement shares to loss shares in order of acquisition when several purchases fall in the window, splitting the disallowed loss across the replacement lots by share count.

**Purchases before the sale count too.** A purchase on September 15 (16 days before the October 1 sale) is a replacement just as October 20's is; a dividend reinvestment, a recurring buy or a fractional purchase in the window is a purchase ([DRIP Is an Order, Not an Event](/books/investing-and-digital-assets/fractional-and-recurring#drip-is-an-order-not-an-event)). The engine scans 30 days both ways from every loss sale, which means a loss isn't final until 30 days after the trade.

### What the broker reports, and what it doesn't

The broker's reporting duty is narrower than the customer's tax rule. Basis reporting ignores section 1091 unless "the transactions occur in the same account with respect to identical securities" (6045(g)(2)(B)(ii)); the 1099-B instructions: report a disallowed loss "if both the sale and purchase transactions occur in the same account with respect to covered securities", identified by CUSIP, and "increase the adjusted basis of the acquired securities by the amount of the disallowed loss reported in box 1g." Everything else is the customer's to compute:

- **Across accounts at the same firm.** A loss in the individual account and a purchase in the joint account, or in the customer's IRA, is a wash sale the 1099-B won't show unless the firm chooses to track it.
- **Across firms and spouses.** No broker sees the other side.
- **Substantially identical but not identical.** Different share classes, options on the stock, or (case by case) funds that track the same index; the broker's same-CUSIP rule misses them all.
- **IRA replacements.** The loss in the taxable account is disallowed and the IRA's basis doesn't increase, so the loss is permanently gone, which no form shows.

My default is to compute wash sales the reporting rule requires, per account by CUSIP, and to detect the cross-account cases inside the firm for the same customer as warnings, shown in the realized gain and loss detail and used by harvesting tools to block purchases, without changing the 1099-B. [Tax-Loss Harvesting & Direct Indexing](/books/investing-and-digital-assets/tax-loss-harvesting-and-direct-indexing#wash-sales-across-accounts) turns that warning into a constraint.

### Digital assets and wash sales

Section 1091 applies to "stock or securities," and a digital asset that is not a security isn't one. The Form 1099-DA instructions require a disallowed wash sale loss in box 1i only for tokenized securities, the digital assets that are also securities, with the same basis increase. <!-- source-gap: ida-crypto-wash-sale-bills | status | that no enacted law as of November 2026 extends section 1091 to digital assets that are not securities | closes with: congress.gov status of the pending bills, opened | checked: 2026-11-05 --> Extending the rule to all digital assets has been proposed in Congress, and I couldn't open a current status for any bill, so the engine treats wash sales on non-security digital assets as off by configuration per instrument class, with tokenized securities on.

## Corporate Actions and Basis

Corporate actions rewrite lots, and the events are in [Corporate Actions & Asset Events](/books/investing-and-digital-assets/corporate-actions#splits-and-reverse-splits). For the lot engine:

- **Splits and stock dividends:** every open lot's quantity is multiplied, its total basis and dates kept.
- **Reverse splits with cash in lieu:** quantity divided; the fraction cashed out is a sale with its share of the lot's basis.
- **Spinoffs:** each parent lot spawns a lot of the new company with an allocated share of basis and the parent lot's dates; the allocation comes from the issuer's Form 8937 and may be provisional until it arrives.
- **Mergers:** a taxable cash merger closes lots at the deal price; a reorganization carries basis and dates into the new shares; a mixed deal does both.
- **Return of capital:** a nondividend distribution reduces basis; where the shares can't be identified, Publication 550 says to "reduce the basis of your earliest purchases first."

Issuers report organizational actions that affect basis on Form 8937, due "on or before the 45th day following the organizational action," and a broker "must take into account all the information reported by the issuer"; if it has already filed, it "must file a corrected Form 1099-B within 30 days of receiving the issuer statement" (1099-B instructions). So the lot engine needs a restatement path: an issuer statement arrives, the event's terms are revised, every lot it touched is recomputed, and every closing that used those lots produces a correction ([Corrections and Their Timing](/books/investing-and-digital-assets/statements-and-tax-forms#corrections-and-their-timing)).

## Transferred Basis

When a position moves between brokers, its lots move with it on paper. Treas. Reg. 1.6045A-1 requires the delivering broker (or custodian, issuer or IRA trustee) to send the receiving broker a **transfer statement** "within fifteen days after the settlement date," with the security, quantity, transfer and settlement dates and, for covered securities, adjusted basis, original acquisition date and any holding period adjustment under section 1091. Gifts carry the donor's basis and acquisition date and the date and fair market value of the gift; inherited securities carry the date of death as the acquisition date and the estate's basis. If no complete statement arrives, the receiving broker requests one, once, and may then treat the security as noncovered when it's later sold.

In the lot engine that is a `basis_transfers` row per lot, matched to the ACATS asset lines ([ACATS Transfers](/books/investing-and-digital-assets/funding-and-transfers#acats-transfers)): the lots open on arrival with `basis_status = pending` and the transfer's settlement date, are replaced by the statement's lots when it arrives, and turn noncovered if it never does. A sale in the meantime uses pending lots and is restated when the statement lands. Outbound, the same engine produces the statements the firm owes, within the fifteen days.

Crypto is different. The regulation excludes from the statement requirement a security whose sale is reportable as a digital asset (1.6045A-1(a)(1)(vi)), so a coin deposited from another exchange or a self-custody wallet arrives with no basis the receiving broker can rely on. The 1099-DA reports units and dates transferred in (boxes 12a and 12b), and those units are noncovered for the receiving broker. My default is to let the customer enter basis for transferred-in units, store it as customer-provided and noncovered, and use it for the customer's realized gain view, never for a covered 1099-DA box.

## Crypto Basis per Wallet and per Account

Before 2025 many crypto holders tracked basis across all their wallets as one pool ("universal" tracking). The 2024 final regulations ended that. Treas. Reg. 1.1012-1(j), applicable "to all acquisitions and dispositions of digital assets on or after January 1, 2025," identifies units within the place they are held:

- **Held with a broker** ((j)(3)): absent identification, units are disposed of in order of time from the earliest date they were acquired and held with that broker, with transfers into the broker's custody disregarded. Adequate identification is specifying the units to the broker by the date and time of the sale; a standing order counts, and a broker that offers only one identification method is treated as having a standing order for it.
- **Not held with a broker** ((j)(1) and (j)(2)): the same earliest-first default, or identification recorded on the taxpayer's own books no later than the time of the sale.
- **Withheld units** ((j)(3)(iii)): units a broker withholds for backup withholding or transaction costs are deemed identified, regardless of any standing order.
- **Not an accounting method** ((j)(4)): switching between earliest, latest or highest-basis identification isn't a change of accounting method.

**Rev. Proc. 2024-28** is the bridge. It allows "any reasonable allocation as of January 1, 2025, of units of unused basis to a wallet or account that holds the same number of remaining digital asset units," in one of two forms. A **specific unit allocation** assigns identified units of unused basis to each wallet or account, and must be completed before the earlier of the first sale, disposition or transfer of that asset on or after January 1, 2025, or the due date (with extensions) of the 2025 return. A **global allocation** is a rule (for example, highest basis first to wallet A, then B) that had to be described in the taxpayer's books "before January 1, 2025", with the allocation itself completed by the later of those dates; an allocation that leaves discretion after January 1, 2025 doesn't qualify. Basis already used can't be allocated, and the amounts still have to be substantiated.

**Worked numbers: from universal to per-account.** On January 1, 2025 a customer holds 2.0 BTC: 0.6 BTC at Exchange A and 1.4 BTC in a self-custody wallet. Their records show two lots of unused basis: 1.0 BTC bought June 1, 2021 for $30,000 and 1.0 BTC bought February 1, 2024 for $60,000. Their global allocation rule, written down in December 2024, assigns highest-basis units first to Exchange A.

| Location | Units | Allocated from | Basis |
| --- | ---: | --- | ---: |
| Exchange A | 0.6 | 2024 lot | $36,000 |
| Self-custody wallet | 0.4 | 2024 lot | $24,000 |
| Self-custody wallet | 1.0 | 2021 lot | $30,000 |
| **Total** | **2.0** | | **$90,000** |

In March 2025 the customer sells 0.5 BTC at Exchange A for $50,000. Within Exchange A the only units are from the 2024 lot, so the basis is $30,000 and the gain **$20,000**, long-term (held from February 1, 2024). Under the old universal FIFO the same sale would have used the 2021 lot: basis $15,000, gain $35,000. The allocation decided $15,000 of gain, and it was decided once, by a rule written before the year began.

Exchange A's side of this is narrow: it reports units and proceeds, and for these pre-2026 units (noncovered) basis is the customer's. Its lot engine still has to apply the per-account default and honor standing orders from 2025 on, keep lots per account and never pool across a customer's accounts, record customer-provided basis for transferred-in units separately from its own, and start covered basis reporting for units acquired in custody from January 1, 2026.

## The Lot Engine

The lot engine is an event processor over the ledger. Its inputs are executions (buys open lots, sells close them), asset events (splits, spinoffs, mergers, forks, airdrops), transfers (lots in and out, with or without statements), relief elections and standing orders, and issuer statements. Its outputs are lots, closings, wash sale adjustments and the realized gain and loss that the 1099 reads.

![The lot engine as a pipeline. Four inputs, executions, asset events, transfers and elections, join into the first of five stages: open or adjust (buys, events, transfers in), apply method (FIFO default, standing orders), scan 30 days (both ways, same account), adjust lots (basis and holding period) and closings (proceeds, basis, term, wash loss). The scan stage is accented. A dashed back edge from closings to the first stage is labeled issuer statement or late trade: replay from the earliest date it touches.](/diagrams/ida-lot-engine.svg "The engine replays events per account and instrument in trade-date order; a late trade, a busted trade or an issuer's Form 8937 restates from the earliest date it touches and produces corrected forms for anything already reported.")

Three properties make it reliable:

- **Deterministic replay per account and instrument.** Given the same events in trade-date order (with a fixed tiebreak for same-time events), the engine produces the same lots and closings. That makes a restatement a replay, not a patch: a busted trade, a late corporate action or an issuer statement replays from the earliest date it touches.
- **Wash sales are provisional for 30 days.** A loss closing is marked `wash_window_open` until 30 days after the trade, and the adjustment is made when a replacement appears in the window, forward or back. Year-end forms wait for the window across January.
- **Every number has a reason.** A lot's basis is its cost plus a list of adjustments, each pointing at the event, closing or statement that caused it, so "why is my basis $5,200" has an answer that isn't a recomputation.

## How to Build It

These are deltas against [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model): `tax_lots` (account, instrument, `acquired_at`, quantity and remaining quantity, `cost_basis`, `wash_sale_adjustment`, `holding_period_start`, `covered`, `source_ref`) and `lot_closings` (lot, execution, quantity, proceeds, realized gain, method). This chapter adds the elections that choose methods, the wash sale adjustments as their own rows, and the basis that arrives with transfers, plus the lot columns they need.

```sql
ALTER TABLE tax_lots
  ADD COLUMN origin TEXT NOT NULL DEFAULT 'purchase' CHECK (origin IN ('purchase',
    'transfer_in', 'gift', 'inheritance', 'corporate_action', 'reinvestment', 'airdrop',
    'fork', 'income')),
  ADD COLUMN basis_status TEXT NOT NULL DEFAULT 'final' CHECK (basis_status IN ('final',
    'provisional', 'pending_statement', 'customer_provided')),
  ADD COLUMN parent_lot_id UUID REFERENCES tax_lots (id),   -- split, spinoff, merger or replacement lineage
  ADD COLUMN asset_event_id UUID REFERENCES asset_events (id);

ALTER TABLE lot_closings
  ADD COLUMN term TEXT NOT NULL DEFAULT 'short' CHECK (term IN ('short', 'long')),
  ADD COLUMN wash_window_open BOOLEAN NOT NULL DEFAULT FALSE,  -- loss closings for 30 days after trade
  ADD COLUMN disallowed_loss BIGINT NOT NULL DEFAULT 0,        -- 1099-B box 1g, 1099-DA box 1i
  ADD COLUMN lot_relief_election_id UUID,                      -- which instruction chose the lot
  ADD COLUMN restated_by UUID REFERENCES lot_closings (id);   -- a replay's replacement row

CREATE TABLE lot_relief_elections (           -- default methods and standing orders, versioned
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  instrument_class   TEXT NOT NULL,           -- 'equity', 'mutual_fund', 'digital_asset', ... or one instrument
  instrument_id      UUID REFERENCES instruments (id),
  method             TEXT NOT NULL CHECK (method IN ('fifo', 'lifo', 'highest_cost', 'lowest_cost',
                       'tax_min', 'average', 'specific_id')),
  scope              TEXT NOT NULL CHECK (scope IN ('standing', 'single_order')),
  order_id           UUID REFERENCES orders (id),          -- for a single-order identification
  lot_selections     JSONB,                   -- specific lots and quantities, as instructed
  valid_during       TSTZRANGE NOT NULL,      -- in force at the sale's time, not when the form runs
  confirmed_at       TIMESTAMPTZ              -- the written confirmation, 1.1012-1(c)(3)
);

CREATE TABLE wash_sale_adjustments (          -- one per loss closing and replacement lot pair
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  loss_closing_id    UUID NOT NULL REFERENCES lot_closings (id),
  replacement_lot_id UUID NOT NULL REFERENCES tax_lots (id),
  matched_quantity   NUMERIC(78, 0) NOT NULL CHECK (matched_quantity > 0),
  disallowed_loss    BIGINT NOT NULL CHECK (disallowed_loss > 0),  -- added to the replacement's basis
  holding_days_added INT NOT NULL,            -- the loss lot's holding period, tacked on
  scope              TEXT NOT NULL CHECK (scope IN ('same_account_reported', 'cross_account_warning')),
  detected_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reversed_at        TIMESTAMPTZ             -- a replay that undid the match
);

CREATE TABLE basis_transfers (                -- 6045A statements in and out, per lot
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  transfer_id        UUID NOT NULL REFERENCES transfers (id),
  direction          TEXT NOT NULL CHECK (direction IN ('in', 'out')),
  instrument_id      UUID NOT NULL REFERENCES instruments (id),
  quantity           NUMERIC(78, 0) NOT NULL,
  adjusted_basis     BIGINT,                  -- null for noncovered or unknown
  original_acquired_on DATE,
  wash_holding_adjustment_days INT,
  kind               TEXT NOT NULL CHECK (kind IN ('standard', 'gift', 'inheritance')),
  gift_fmv           BIGINT,                  -- gifts: fair market value at the gift date
  statement_due_on   DATE NOT NULL,           -- settlement date plus 15 days
  received_or_sent_at TIMESTAMPTZ,
  requested_at       TIMESTAMPTZ,             -- the one request for a missing statement
  status             TEXT NOT NULL CHECK (status IN ('expected', 'received', 'sent',
                       'missing_noncovered')),
  tax_lot_id         UUID REFERENCES tax_lots (id)
);
```

Wash sale candidates for one loss closing, same account and same instrument, 30 days either side (the reported scope; the cross-account warning runs the same query over the customer's other accounts):

```sql
SELECT l.id AS replacement_lot_id, l.acquired_at, l.quantity
FROM lot_closings c
JOIN tax_lots sold ON sold.id = c.tax_lot_id
JOIN tax_lots l    ON l.account_id = sold.account_id
                  AND l.instrument_id = sold.instrument_id
                  AND l.id <> sold.id
WHERE c.id = :loss_closing
  AND c.realized_gain < 0
  AND l.origin IN ('purchase', 'reinvestment')
  AND l.acquired_at::date BETWEEN c.closed_at::date - 30 AND c.closed_at::date + 30
  AND NOT EXISTS (SELECT 1 FROM wash_sale_adjustments w   -- a replacement absorbs a loss once
                  WHERE w.replacement_lot_id = l.id AND w.reversed_at IS NULL)
ORDER BY l.acquired_at;                     -- matched in order of acquisition
```

Design notes:

- **Lots and closings are rewritten by replay, never edited.** A restatement writes new closings with `restated_by` links, so the original 1099 can always be reproduced and the corrected one explained.
- **The relief election in force at the sale's time is the one that applies,** found by the sale's timestamp in `valid_during`; a later change of default doesn't touch earlier sales.
- **Basis arithmetic is in minor units with explicit remainders.** A lot split three ways for a partial sale or a spinoff allocates cents so the parts sum to the whole.
- **Per account, always.** No query that relieves lots crosses `account_id`; crypto lots are per account (the broker's custody) and customer-provided lots for transferred-in units are flagged so they never feed covered reporting.
- **Years close late.** The year's forms run after the 30-day wash window of the last December trade has closed and after the expected issuer statements; anything later is a correction.

## Auditing

Basis is reported to the IRS, matched against returns, and disputed by customers. Keep:

- **Every lot and closing with its full lineage:** the execution, asset event or transfer that opened it, every adjustment with its cause, and every restatement.
- **Every relief election and standing order** with its validity period and the written confirmation of each specific identification.
- **Every wash sale adjustment,** reported or warning, with the loss closing, the replacement lot and the quantities matched.
- **Every transfer statement** received and sent, with dates against the fifteen-day deadline and the request for a missing one.
- **Every issuer statement** applied, the lots it changed and the corrected forms it produced, with dates against the 30-day correction rule.
- **For crypto,** the per-account ordering applied, standing orders, withheld units, and which lots were customer-provided.

## What This Means for the System You Build

- **Make lots the record of basis,** per account and instrument, opened from executions, events and transfers, with every adjustment as its own row.
- **Apply the relief method in force at the time of the sale,** default FIFO, with standing orders and written confirmation of identifications.
- **Scan 30 days both ways for wash sales,** report same-account same-CUSIP adjustments, and warn on the cross-account cases.
- **Carry disallowed losses and holding periods into replacement lots,** and keep the loss window open for 30 days after every loss.
- **Restate by replay** when an issuer statement, a late trade or a bust arrives, and produce corrections for anything already reported.
- **Treat transfer statements as lot data,** with the fifteen-day clock both ways and noncovered as the fallback.
- **Keep crypto lots per account from 2025 on,** honor the Rev. Proc. 2024-28 allocations customers made, and keep customer-provided basis out of covered reporting.

## References

**Law and regulation**

- [26 USC 1012: Basis of property, cost](https://www.law.cornell.edu/uscode/text/26/1012), basis as cost, account-by-account conventions for specified securities, and average-basis stock acquired before 2012 as a separate account
- [26 USC 1091: Loss from wash sales of stock or securities](https://www.law.cornell.edu/uscode/text/26/1091), the 61-day window, contracts and options, and the replacement's basis
- [26 USC 6045: Returns of brokers](https://www.law.cornell.edu/uscode/text/26/6045), adjusted basis and term reporting, the same-account identical-securities wash sale rule, covered security dates including January 1, 2023 for digital assets, and the transfer statement requirement
- [26 CFR 1.1012-1: Basis of property](https://www.law.cornell.edu/cfr/text/26/1.1012-1), the earliest-lot default, identification with a broker and written confirmation, standing orders, average basis, and (j) digital assets held with and without a broker from January 1, 2025
- [26 CFR 1.6045A-1: Statements of information required in connection with transfers of securities](https://www.law.cornell.edu/cfr/text/26/1.6045A-1), the fifteen-day statement, its contents, gifts and inheritances, missing statements, and the digital asset exception

**Regulators and guidance**

- [IRS: Rev. Proc. 2024-28](https://www.irs.gov/pub/irs-drop/rp-24-28.pdf), the safe harbor for allocating unused digital asset basis to wallets and accounts as of January 1, 2025, specific unit and global allocations and their deadlines
- [IRS: Final regulations and related guidance for reporting by brokers on sales and exchanges of digital assets](https://www.irs.gov/newsroom/final-regulations-and-related-IRS-guidance-for-reporting-by-brokers-on-sales-and-exchanges-of-digital-assets), gross proceeds from 2025, basis from 2026, Rev. Proc. 2024-28 and Notices 2024-56 and 2024-57 (updated November 7, 2025)
- [IRS: Instructions for Form 1099-B (2026)](https://www.irs.gov/instructions/i1099b), covered security dates, the default order of shares reported, specific identification, wash sale reporting in box 1g, issuer statements and 30-day corrections, transfer statements
- [IRS: Instructions for Form 1099-DA (2026)](https://www.irs.gov/instructions/i1099da), covered digital assets acquired in custodial accounts after 2025, box 1i wash sale losses for tokenized securities, earliest-units default, transfer-in boxes 12a and 12b
- [IRS: Instructions for Form 8949 (2025)](https://www.irs.gov/instructions/i8949), code W with the nondeductible loss as a positive column (g) adjustment, code B for incorrect basis, boxes G to L for digital assets
- [IRS: Publication 550, Investment Income and Expenses](https://www.irs.gov/publications/p550), wash sale rules and examples including spouse and IRA purchases, holding periods, nondividend distributions applied to earliest purchases

**Vendor documentation**

- [Robinhood: Cost basis](https://robinhood.com/us/en/support/articles/cost-basis/), FIFO as the default, adjustments for fees, corporate actions and wash sales
- [Vanguard: Cost basis](https://investor.vanguard.com/investor-resources-education/taxes/cost-basis), average cost for mutual funds and FIFO otherwise by default, the methods offered, choosing a method at the time of sale, covered dates
