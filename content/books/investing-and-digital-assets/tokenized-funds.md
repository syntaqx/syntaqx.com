+++
title = "Tokenized Treasuries & Funds"
nav_title = "Tokenized Funds"
description = "BUIDL, BENJI, OUSG, USTB and others: fund shares as tokens, on-chain transfer agents, allowlists, NAV and dividends on chain, collateral and reserves."
category = "Investing & Digital Assets Industry"
order = 2567
part = "Tokenization"
tags = ["tokenization", "money-market-funds", "treasuries", "buidl", "benji", "transfer-agents", "rwa"]
+++

A tokenized fund is an ordinary fund whose shares are recorded, or represented, as tokens on a public chain. The fund still buys Treasury bills and overnight repo, still strikes a net asset value, still declares dividends and still pays redemptions in dollars; what changes is the shareholder record. Instead of a line in a transfer agent's database that only the agent and its broker-dealers can read, each holder's shares sit at a wallet address, and a transfer between two eligible holders is a transaction on the chain rather than an instruction to the agent. That one change is what lets a share of a government money market fund move at 3 a.m. on a Sunday, sit in a smart contract as collateral, or back a stablecoin.

The fund doesn't become a crypto asset by doing this. It is still a security, sold only to the investors its offering allows, and every token contract that carries one is permissioned: a transfer to an address the transfer agent hasn't approved fails. The chain is fast and always open; the fund behind it keeps business days, cutoffs and a board. Most of the engineering in this chapter is the seam between those two clocks: income that accrues every calendar day but is paid on business days, a NAV struck hourly or daily that has to reach a contract that reads it every block, and redemptions that leave the chain as a burn and arrive as a wire.

This chapter covers the funds that lead the category, what a tokenized fund is in law and in the ledger, the transfer agent's on-chain record, allowlists, NAV and income on chain with worked numbers, peer-to-peer transfers and secondary liquidity, and use as collateral and stablecoin reserves, on the core model of [The Investing & Digital Assets Business](/books/investing-and-digital-assets/investing-business#the-core-data-model). Tokenized stocks are [Tokenized Stocks & 24/7 Securities](/books/investing-and-digital-assets/tokenized-stocks); the transfer agent rules and permissioned token standards both kinds share are [Transfer Agents & Permissioned Tokens](/books/investing-and-digital-assets/transfer-agents-and-permissioned-tokens).

## How the Platforms Do It

The largest tokenized Treasury and money market products, with distributed value from the rwa.xyz data aggregator (page dated November 5, 2026) and structure from each issuer's own documents, as of November 2026:

| Product | Manager or issuer | Value (rwa.xyz) | Who can hold it | How income reaches the holder | Record and chains |
| --- | --- | ---: | --- | --- | --- |
| **USDY** | Ondo | $2.40B | "General access" in Ondo's terms | A "tokenized note secured by US Treasuries" | 12 networks |
| **USYC** | Circle | $2.24B | Not documented on the pages I opened | Not documented on the pages I opened | Solana, Ethereum, BNB Chain, Arc |
| **BUIDL** (BlackRock USD Institutional Digital Liquidity Fund) | BlackRock, tokenized by Securitize | $1.89B | Qualified purchasers; transfers "only ... to whitelisted investors" | Accrued daily to the holder of record at 3:00 p.m. ET, paid the next business day "in the form of new BUIDL tokens" | Aptos, Arbitrum, Avalanche, BNB Chain, Ethereum, Optimism, Polygon, Solana |
| **BENJI / FOBXX** (Franklin OnChain U.S. Government Money Fund) | Franklin Templeton | $1.10B | Retail through the Benji app; institutions | Declared daily, "automatically reinvested in additional shares at NAV on the payable date" | Transfer agent's blockchain-integrated record; Stellar primary, with Polygon, Aptos, Avalanche, Arbitrum, Ethereum, Solana and Base |
| **JLTXX** | JPMorgan (Kinexys Digital Assets) | $0.79B | Institutional | Not documented on the pages I opened | Solana, Ethereum |
| **WTGXX** | WisdomTree | $0.67B | Not documented on the pages I opened | Not documented on the pages I opened | 8 networks |
| **USTB** (Invesco Short Duration US Government Securities Fund) | Invesco, on Superstate | $0.43B | Onboarded investors with allowlisted addresses | Accumulating: the balance stays the same and the NAV per share "increases over time," updated continuously | Solana, Plume, Ethereum |
| **OUSG** | Ondo | $0.32B | Investors eligible for Ondo's qualified access funds | NAV updated at the end of each business day and written to an on-chain price oracle | XRP Ledger, Solana, Polygon, Ethereum |

The category held $14.28 billion across 123 assets and 86,024 holders on rwa.xyz's November 5, 2026 page, with a 7-day APY of 3.60%; Franklin's separately listed iBENJI held another $1.71 billion. Three things stand out:

- **Income is paid three different ways.** New tokens at a stable $1.00 (BUIDL), reinvested shares at a stable $1.00 (FOBXX), or no distribution at all and a rising price per token (USTB, OUSG). Each has a different ledger, a different lot history and a different integration story for anyone holding the token in a contract.
- **Every one is permissioned.** Eligibility is decided off chain, at onboarding, and enforced on chain by an allowlist the transfer agent controls. "Tokenized" never means "anyone can hold it."
- **Funds hold funds.** OUSG "is invested in funds issued by leading asset managers such as BlackRock," Franklin Templeton, WisdomTree and Fidelity, plus bank deposits and USDC for liquidity. Tokenized funds are building blocks for other tokenized products, which stacks one fund's cutoffs and liquidity on another's.

## What a Tokenized Fund Is

There are two legal shapes, and the token means something different in each.

- **A registered fund whose record is on chain.** Franklin's FOBXX is a series of Franklin Templeton Trust, a registered investment company, and a government money market fund under Rule 2a-7 that "uses the amortized cost method of valuation to seek to maintain a stable $1.00 share price" and invests at least 99.5% of total assets in government securities, cash and fully collateralized repo. The prospectus is explicit about which record counts: the transfer agent "maintains the official record of share ownership via a proprietary blockchain-integrated system" that uses "one or more public blockchain networks," and those records stay "under the full and complete control of the Fund's transfer agent." The token isn't a claim on a share; it is the share, as the agent records it.
- **A private fund sold to qualified investors.** BUIDL is offered through Securitize Markets, LLC, a registered broker-dealer, to qualified purchasers, and "seeks a stable $1 NAV" from "core investments of overnight repo and 3-month Treasuries," while noting it "cannot guarantee it will do so." The tokens are the fund's shares as its transfer agent records them, with transfers limited to whitelisted investors.

Products that look the same on a block explorer can be neither. USDY is described by Ondo as a note secured by Treasuries, not a fund share, so a holder is a creditor of the issuer with a security interest, not a fund shareholder. My rule for a platform listing any of these is to model the legal claim first and the token second: `instruments.instrument_type = 'tokenized_security'` for all of them, with the claim (fund share, note, wrapper certificate) as an attribute that drives the disclosure, the custody treatment and the tax lots ([The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model)).

Two consequences follow for a holder's platform:

- **The fund's documents beat the token's code.** If the transfer agent's record and the chain disagree, the agent's record governs for FOBXX by the prospectus's own words. Franklin's agent corrects errors or unauthorized transactions by adding "a correcting instruction to a later block" rather than deleting history, so the chain is append-only even when the agent overrides it. A platform reconciling its customers' holdings reads the chain and the agent's statements, and treats a mismatch as a break, not as a ledger choice.
- **Securities law follows the share.** A tokenized fund share is sold under the fund's registration or offering exemption, held by eligible investors only, and transferred under the fund's rules. Selling it to a customer is a securities business for the platform's broker-dealer, not its crypto entity ([Regulators & Licenses](/books/investing-and-digital-assets/regulators-and-licenses)).

## The Transfer Agent on Chain

In a traditional fund the transfer agent keeps the shareholder file, processes purchases and redemptions, pays dividends and answers to the SEC's transfer agent rules. A tokenized fund keeps all of that and adds a chain to the agent's system. Franklin's arrangement, from the prospectus:

- **Wallets per investor.** The transfer agent creates a Stellar wallet for each investor unless the investor asks for another approved network. Wallets are either agent-hosted, where "the transfer agent holds the private key," or investor-managed, "currently an option available only to institutional investors."
- **The agent controls the record.** Purchases mint to the investor's wallet, redemptions burn from it, and the agent can correct the record with a later instruction.
- **Lost keys are an operation, not a loss.** For an agent-hosted wallet the agent holds the key; for an investor-managed wallet the investor does, and correcting a lost key "may require information collection and operational tasks" and "may render the investor's holdings unavailable while these activities take place."

Superstate describes the same role as a "digital transfer agent" that "maintains an SEC-compliant shareholder registry across book-entry holdings, tokenized holdings," with investors moving shares between the two forms. That last part matters: in most of these funds a share can be held either way, and the agent's file is the sum of book-entry and on-chain holdings. Total supply on any one chain is not the fund's shares outstanding.

The rules that govern the agent (registration, turnaround, the master securityholder file, the control book) and the token standards that implement its powers (identity registries, forced transfers, recovery) are in [Transfer Agents & Permissioned Tokens](/books/investing-and-digital-assets/transfer-agents-and-permissioned-tokens).

## Allowlists

An allowlist is the on-chain list of addresses the agent has approved to hold the token. A transfer to any other address reverts. Every product above has one, under different names (BUIDL "only permits token transfers to whitelisted investors"; Franklin's peer-to-peer transfers run between "whitelisted wallets"; Superstate investors tokenize shares once they have "a compatible allowlist address from the portal").

The allowlist is where off-chain onboarding meets on-chain enforcement, and a platform that holds these tokens for customers has to fit into it:

- **Who is on the list: the customer or the platform.** A custodian that holds a tokenized fund in an omnibus wallet gets one allowlisted address for all its customers, and the fund's record shows one holder. Eligibility of each underlying customer is then the platform's job and its contract with the fund, the same omnibus question as street name for stocks ([Omnibus and Segregated](/books/investing-and-digital-assets/ledgers-and-positions#omnibus-and-segregated)). A segregated model allowlists each customer's address and makes the fund's record match the platform's.
- **Adding an address takes time.** The fund's agent, not the platform, writes the list. A customer who wants to withdraw tokens to a new address waits for the agent's approval, so the withdrawal flow has a state for it.
- **Removal freezes the holder.** An address taken off the list can't send or receive. The ledger keeps the position and marks it restricted, the same treatment as a frozen stablecoin balance ([Freeze and Blacklist Functions](/books/investing-and-digital-assets/tokens-and-standards#freeze-and-blacklist-functions)).
- **Protocols are holders too.** A lending market or an AMM pool that holds the token needs its contract address on the list. Superstate's issuers "allowlist protocols ... on launch day"; Aave's permissioned instance limits supply to "qualified users allowlisted by the RWA issuers" ([Real-World-Asset Collateral](/books/investing-and-digital-assets/defi-lending#real-world-asset-collateral)).

## NAV and Income on Chain

A fund's NAV is struck on the fund's schedule and its income accrues on calendar days. The token has to carry both.

**When the NAV is struck.** FOBXX "typically calculates its NAV as of each hour from 8:00 a.m. (Eastern time)" until "normally, 5:00 p.m. (Eastern time)," on days the fund is open for business, and orders are "processed at the NAV next calculated" after receipt: forward pricing, as for any mutual fund. Same-day purchases and redemptions must arrive before 2 p.m. Pacific (5 p.m. Eastern), and redemption proceeds go out by electronic funds transfer within seven days. BUIDL takes redemption requests "between 8:00 AM and 3:00 PM ET on the applicable Redemption Date to achieve same-day settlement." USTB's NAV per share "updates around the clock"; Bitwise's USCC on Superstate sets it "daily at 5pm ET"; OUSG updates "at the end of each Business Day." The chain never closes; every one of these funds still has a cutoff.

**How income is paid.** At a stable $1.00 NAV, income has to be paid as more units, or the token would drift above a dollar. BUIDL mints new tokens to each holder's wallet; FOBXX reinvests in additional shares. A floating NAV fund pays nothing: Superstate's funds use "an accumulating model rather than cash distributions," so "the NAV/S increases over time" and fees accrue into it too. The three models, for the same income:

| Model | Example | Token balance | Price per token | What the platform's ledger does |
| --- | --- | --- | --- | --- |
| New tokens at $1.00 | BUIDL | Rises by each distribution | $1.00 | A mint to the omnibus wallet, allocated to customers as a dividend in units; a new tax lot per distribution |
| Reinvested shares at $1.00 | FOBXX | Rises on the payable date | $1.00 | The same, recorded as a dividend reinvestment |
| Accumulating NAV | USTB, OUSG | Unchanged | Rises with income less fees | Nothing moves; the mark changes, and gain is realized on redemption |

### Worked numbers: daily accrual paid as new tokens, and a redemption cutoff

Take a fund on BUIDL's published schedule: income accrues each calendar day to the holder of record at 3:00 p.m. ET and is paid the next business day as new tokens; redemptions received from 8:00 a.m. to 3:00 p.m. ET settle the same day at the $1.00 NAV. The fund declares a daily dividend of **$0.00009863 per unit** (3.60% a year over 365 days, rounded; in practice the fund declares its actual net income each day). A customer holds 10,000,000.00 units in the platform's omnibus wallet. My model assumes, as a design choice to confirm against each fund's terms, that a redemption accepted for same-day settlement takes its units out of that day's 3:00 p.m. record.

| Day (2026) | Units at 3:00 p.m. ET | Accrual (units × $0.00009863) | Paid as tokens on |
| --- | ---: | ---: | --- |
| Thu, Nov 12 | 10,000,000.00 | 986.30 | Fri, Nov 13 |
| Fri, Nov 13 | 10,000,986.30 | 986.40 | Mon, Nov 16 |
| Sat, Nov 14 | 10,000,986.30 | 986.40 | Mon, Nov 16 |
| Sun, Nov 15 | 10,000,986.30 | 986.40 | Mon, Nov 16 |
| Mon, Nov 16 | 10,003,945.50 | 986.69 | Tue, Nov 17 |
| Tue, Nov 17 | 10,004,932.19 | 986.79 | Wed, Nov 18 |

- **The weekend is paid on Monday.** Friday's, Saturday's and Sunday's accruals (986.40 each, on the balance after Friday's payment) arrive as one mint of **2,959.20** units on Monday, November 16. The token pays income on days the fund's bank can't move a dollar, and pays it in arrears on the next day it can.
- **A redemption before the cutoff.** On Wednesday, November 18, after Tuesday's 986.79 arrives, the customer holds 10,005,918.98 units and asks to redeem 4,000,000.00 at 2:40 p.m. ET. It settles that day for **$4,000,000.00**; 6,005,918.98 units are in the 3:00 p.m. record and Wednesday's accrual is **592.36** units, paid Thursday.
- **The same request at 3:05 p.m.** It misses the window and becomes Thursday's redemption. All 10,005,918.98 units are in Wednesday's record, the accrual is **986.88**, and the customer earns **394.52** more units (4,000,000.00 × $0.00009863) for waiting, but gets dollars a business day later.

The same income in an accumulating fund: a token at $10.0000 that accrues 0.009863% a day is worth $10.0000 × 1.00009863^30 = **$10.0296** after 30 days, with no new tokens and no dividend record. The platform marks the position up; nothing is credited.

For the ledger, each distribution is an `asset_events` row of kind `dividend` paid in units of the fund's own instrument, one `journal_entries` row debiting the omnibus position and crediting each customer, with the allocation rule and rounding residual recorded as for any dividend ([Fractional Entitlements](/books/investing-and-digital-assets/corporate-actions#fractional-entitlements)). For a customer who holds the token in self-custody, the mint lands in their wallet directly and the platform has nothing to allocate, only something to show.

## Transfers and Secondary Liquidity

The chain makes a share transferable outside the fund's purchase and redemption window, within the allowlist. Franklin allows peer-to-peer transfers "between whitelisted wallets on any approved network or between two approved networks," processed on blockchain confirmation with no minimum, and says plainly that "Peer-to-peer transfers do not constitute a public trading market" and that the fund "does not require transfers to occur at NAV." Two eligible holders can therefore trade a $1.00 share at $0.999 on a Saturday, and the fund doesn't stand behind the price.

Instant liquidity, where it exists, comes from someone's balance sheet, not the fund. Ondo lets an OUSG investor who pays in USDC or PYUSD "immediately receive OUSG tokens" and redeem for USDC instantly, within 24-hour limits shown on its site and a $5,000 minimum; the non-instant path has $100,000 and $50,000 minimums. The instant leg is Ondo using its own liquidity (bank deposits and USDC in the portfolio) and settling with the underlying funds on their schedule. A platform offering "instant" redemption of a tokenized fund is extending the same credit: it pays the customer now and waits for the fund, and that exposure belongs in its risk limits and its disclosures.

The other route out is a market. The SEC's tokenized NMS stock exemption of September 2026 lets its venues pair tokenized stocks with "a tokenized money market fund," so a tokenized fund can be the cash leg of a stock trade on such a venue ([Tokenized Stocks & 24/7 Securities](/books/investing-and-digital-assets/tokenized-stocks)).

## Collateral and Stablecoin Reserves

A share that can sit in a smart contract and pays daily is better collateral than cash at a bank, which pays nothing on a margin account's weekend, and better than a Treasury bill, which can't move on a Sunday. Three uses lead:

- **Stablecoin reserves.** The GENIUS Act's eligible reserves include government money market funds investing only in the listed assets and "tokenized forms" of eligible assets (12 U.S.C. 5903(a)(1)). A tokenized government MMF share can back a payment stablecoin under the statute, subject to the regulators' rules and the issuer's liquidity ladder ([The Reserve](/books/investing-and-digital-assets/issuing-a-stablecoin#the-reserve)).
- **Margin and lending collateral.** Permissioned lending markets accept tokenized funds and stocks from allowlisted users ([Real-World-Asset Collateral](/books/investing-and-digital-assets/defi-lending#real-world-asset-collateral)). The allowlist binds the liquidator, and the fund's cutoffs decide how fast seized collateral becomes dollars.
- **Fund of funds.** OUSG holds other managers' tokenized funds. A platform that accepts OUSG as collateral is taking the liquidity of two funds and the issuer's instant-redemption balance sheet, stacked.

For a lender or exchange taking a tokenized fund as collateral, my haircut inputs are the fund's own: the NAV policy (stable or floating), the redemption cutoff and settlement lag, any liquidity fee or gate the board can impose (FOBXX "does not currently intend to impose liquidity fees" but its board may, with notice), the allowlist's rules for transfer to a liquidator, and the oracle's update schedule when the NAV floats. A price that updates once a business day can't be liquidated against on Saturday.

## How to Build It

These are deltas against [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model): a tokenized fund is an `instruments` row with `instrument_type = 'tokenized_security'`, one `asset_networks` row per chain it lives on, and its distributions are `asset_events`. This chapter adds the fund's terms, the allowlist status of each address the platform uses, and the NAV and distribution postings it reads from the chain or the agent.

```sql
CREATE TABLE tokenized_funds (               -- the fund behind a tokenized instrument, versioned
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  instrument_id       UUID NOT NULL REFERENCES instruments (id),
  claim               TEXT NOT NULL CHECK (claim IN ('fund_share', 'note', 'wrapper')),
  fund_kind           TEXT NOT NULL CHECK (fund_kind IN ('registered_2a7', 'private_fund',
                        'other')),
  manager             TEXT NOT NULL,
  transfer_agent      TEXT NOT NULL,
  record_rule         TEXT NOT NULL CHECK (record_rule IN ('agent_record_governs',
                        'chain_governs', 'book_and_chain')),     -- per the offering documents
  nav_policy          TEXT NOT NULL CHECK (nav_policy IN ('stable', 'floating')),
  income_model        TEXT NOT NULL CHECK (income_model IN ('new_units', 'reinvested_units',
                        'accumulating')),
  accrual_record_time TIME,                  -- e.g. 15:00 in the fund's zone
  calendar            TEXT NOT NULL,         -- the business-day calendar for payments
  fund_zone           TEXT NOT NULL,         -- 'America/New_York'
  subscription_cutoff TIME NOT NULL,
  redemption_window   TSTZRANGE,             -- or a daily window in the fund's zone, in terms
  settlement_lag_days SMALLINT NOT NULL,     -- business days from acceptance to cash
  eligibility         TEXT NOT NULL,         -- 'qualified_purchaser', 'non_us', 'retail', ...
  terms               JSONB NOT NULL,        -- minimums by chain, fees, gates, liquidity fees
  valid_during        TSTZRANGE NOT NULL,
  EXCLUDE USING gist (instrument_id WITH =, valid_during WITH &&)
);

CREATE TABLE holder_allowlists (             -- an address's standing on one token's allowlist
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  asset_network_id    UUID NOT NULL REFERENCES asset_networks (id),
  address_id          UUID NOT NULL REFERENCES addresses (id),
  holder_kind         TEXT NOT NULL CHECK (holder_kind IN ('omnibus', 'customer',
                        'protocol', 'counterparty')),
  account_id          UUID REFERENCES accounts (id),         -- for a segregated customer
  status              TEXT NOT NULL CHECK (status IN ('requested', 'approved', 'rejected',
                        'removed')),
  requested_at        TIMESTAMPTZ NOT NULL,
  decided_at          TIMESTAMPTZ,
  onchain_tx_id       UUID REFERENCES onchain_transactions (id),  -- the agent's list update
  UNIQUE (asset_network_id, address_id, requested_at)
);

CREATE TABLE onchain_nav_postings (          -- each NAV or distribution the fund published
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  instrument_id       UUID NOT NULL REFERENCES instruments (id),
  kind                TEXT NOT NULL CHECK (kind IN ('nav', 'daily_dividend_rate',
                        'distribution')),
  effective_at        TIMESTAMPTZ NOT NULL,  -- the strike or record time, not when seen
  nav_per_unit        NUMERIC(38, 18),       -- floating NAV funds
  rate_per_unit       NUMERIC(38, 18),       -- declared daily dividend per unit
  source              TEXT NOT NULL CHECK (source IN ('oracle', 'agent_statement',
                        'mint_events')),
  asset_network_id    UUID REFERENCES asset_networks (id),
  onchain_tx_id       UUID REFERENCES onchain_transactions (id),
  asset_event_id      UUID REFERENCES asset_events (id),     -- a paid distribution
  observed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (instrument_id, kind, effective_at, source)
);
```

Fund orders are ordinary `orders` with the fund as the venue, but they move through states a market order never has: accepted before or after the cutoff, waiting on the agent, then minted or burned on chain and settled in cash.

![A state machine for a tokenized fund order. Requested leads to accepted, then pending_agent, then onchain, then settled, a terminal state; that path is accented. A dashed edge labeled after cutoff runs from requested up to next_window, and a dashed edge labeled window opens runs from next_window down to accepted. Dashed exits lead from requested to rejected, labeled not eligible or not allowlisted, and from pending_agent to rejected, labeled agent refused. A dashed edge over the top from onchain back to pending_agent is labeled reverted: resubmit. Terminal states have double outlines.](/diagrams/ida-fund-order-states.svg "A subscription or redemption waits on the fund's cutoff and its transfer agent before it touches the chain; the order's cash side settles on the fund's calendar, not the chain's.")

Accrual for one day, per account, from the declared rate and the 3:00 p.m. record, with same-day redemptions removed:

```sql
SELECT p.account_id,
       p.settled_quantity
         - COALESCE(SUM(o.quantity) FILTER (WHERE o.side = 'sell'
             AND o.accepted_for = :day), 0)           AS units_in_record,
       ROUND((p.settled_quantity
         - COALESCE(SUM(o.quantity) FILTER (WHERE o.side = 'sell'
             AND o.accepted_for = :day), 0)) * n.rate_per_unit, 2) AS accrual_units
FROM positions p
JOIN onchain_nav_postings n ON n.instrument_id = p.instrument_id
                           AND n.kind = 'daily_dividend_rate'
                           AND n.effective_at = :record_time
LEFT JOIN fund_orders o     ON o.account_id = p.account_id
                           AND o.instrument_id = p.instrument_id
WHERE p.instrument_id = :fund
  AND p.as_of = :record_time
GROUP BY p.account_id, p.settled_quantity, n.rate_per_unit;
```

Here `fund_orders` is a view over `orders` and `order_events` carrying the window each order was accepted for. Design notes:

- **Two clocks on every row.** Accruals use calendar days and the fund's record time; payments and cash use the fund's business-day calendar. Store both, never derive one from the other.
- **Sum the allocations to the mint.** The customer accruals for a day must add up to what the fund minted to the omnibus wallet; the difference is a rounding residual with a written rule, as for any dividend.
- **Supply on one chain isn't shares outstanding.** Reconcile the platform's position against the agent's statement across book-entry and every chain, and the chain balance against its own ledger per network.
- **Allowlist state gates withdrawals.** A withdrawal of a tokenized fund to an address that isn't `approved` for that `asset_network_id` doesn't sign; it waits or fails.
- **Read NAVs as data with a time.** A floating NAV is an `onchain_nav_postings` row with its strike time; marks, collateral values and redemption amounts use the posting in force at their own time.

## Auditing

A tokenized fund position is a securities position and a chain balance at once. Keep:

- **Every fund order** with its acceptance time against the cutoff, the window it was accepted for, the NAV it got and the mint or burn that settled it.
- **Every distribution** with the declared rate, the record-time positions, each customer's allocation, the rounding residual and the mint it ties to.
- **Every allowlist request and decision** for every address the platform uses, and every removal.
- **Daily reconciliation** of the platform's ledger against the agent's statement and each chain's balance, with breaks as `recon_breaks` rows and a clock to resolve them.
- **The fund's terms in force** on every date (cutoffs, minimums, fees, gates), versioned, since an order is judged by the terms of its day.

## What This Means for the System You Build

- **Model the claim before the token:** a fund share, a note and a wrapper behave alike on chain and differently in law, custody and tax.
- **The transfer agent's record governs** where the offering documents say so; the chain is one view of it, and a mismatch is a break.
- **Carry two clocks:** calendar-day accrual at the record time, business-day payment and settlement, and a cutoff on every order.
- **Pick the ledger treatment from the income model:** new units are dividends in kind with new lots, reinvestments are reinvestments, accumulating NAV is a mark.
- **Instant redemption is credit you extend** until the fund pays; size it and disclose it.
- **Allowlist status is a precondition** for any transfer, withdrawal or collateral move, and removal is a restriction on the position, not a loss.
- **Haircut on the fund's terms:** NAV policy, cutoffs, gates and the oracle's schedule.

## References

**Law and regulation**

- [12 U.S.C. 5903: Requirements for issuing payment stablecoins](https://www.law.cornell.edu/uscode/text/12/5903), eligible reserve assets including government money market funds and tokenized forms of eligible assets

**Regulators and guidance**

- [SEC: Order granting conditional exemptive relief for tokenized NMS stocks (Rel. 34-106402, 91 FR 60168, September 22, 2026)](https://www.federalregister.gov/documents/full_text/text/2026/09/22/2026-19388.txt), tokenized money market funds as a permitted pair asset on tokenized securities venues

**Filings**

- [Franklin Templeton Trust: Form 485BPOS (July 27, 2026)](https://www.sec.gov/Archives/edgar/data/1786958/000165558926000970/c485bpos.htm), FOBXX's official record via a blockchain-integrated system, networks, hosted and investor-managed wallets, amortized cost and the stable $1.00, daily dividends reinvested on the payable date, hourly NAV from 8:00 a.m. to 5:00 p.m. ET, the 2 p.m. Pacific cutoff, minimums by network, peer-to-peer transfers, fees and waivers, error correction and lost keys

**Vendor documentation**

- [Securitize: BUIDL](https://securitize.io/blackrock/buidl), daily accrual to the holder of record at 3:00 p.m. ET paid the next business day as new tokens, the 8:00 a.m. to 3:00 p.m. ET redemption window, whitelisted transfers, qualified purchasers, the stable $1 NAV aim, holdings, chains and management fees by chain
- [Superstate: NAV, income, and yield](https://docs.superstate.com/investors/tokenized-funds/nav-income-and-yield.md), the accumulating model, continuous and daily NAV per share, the on-chain price oracle and fees in NAV
- [Superstate: Opening Bell](https://docs.superstate.com/issuers/opening-bell.md), the digital transfer agent's registry across book-entry and tokenized holdings, allowlist addresses and protocol allowlisting
- [Ondo: OUSG overview](https://docs.ondo.finance/qualified-access-products/ousg/overview.md), underlying funds, instant mint and redemption in USDC and PYUSD, limits and minimums, end-of-day NAV to the on-chain oracle, the management fee waiver
- [Ondo: Documentation](https://docs.ondo.finance/), USDY as a tokenized note secured by US Treasuries

**In practice**

- [rwa.xyz: Tokenized Treasuries (page dated November 5, 2026)](https://app.rwa.xyz/treasuries), a data aggregator's distributed value, holders, asset count and 7-day APY for the category, and values and chains per product
