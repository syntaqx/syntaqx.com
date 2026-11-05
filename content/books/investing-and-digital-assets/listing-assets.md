+++
title = "Listing & Delisting Assets"
description = "How exchanges decide what to list: diligence, NYDFS and MiCA rules, per-chain integration, listing as inside information, delistings, forks and migrations."
category = "Investing & Digital Assets Industry"
order = 2545
part = "Crypto Exchanges"
tags = ["crypto", "exchanges", "listings", "delisting", "mica", "nydfs", "insider-trading"]
+++

A broker doesn't decide which stocks exist; an issuer registers, an exchange lists it under rules the SEC approved, and every broker can trade it the same day. A crypto exchange decides for itself. Anyone can deploy a token in minutes, so every asset on an exchange is there because the exchange chose it, integrated its chain, and accepted the legal, security and market risk of offering it to customers. Listing is the exchange's most consequential product decision, it moves prices when announced, and in the US it was for years the question regulators sued over. Delisting is the same decision in reverse, with customers holding the asset when it's made.

This chapter covers how exchanges describe their listing process, the rules that now govern it (New York's coin-listing guidance and MiCA's admission-to-trading rules), the per-chain and per-token integration checklist, the launch sequence through trading modes, paid listings and conflicts, listing announcements as inside information and the first crypto insider trading case, delistings and the US and EU episodes that forced them, and chain upgrades, token migrations and forks. Whether a token is a security, and how the SEC's view moved in 2025 and 2026, is [Securities, Commodities & Crypto Market Structure](/books/investing-and-digital-assets/securities-or-commodities); token standards and their traps are Tokens & Token Standards; chain events as corporate actions are Corporate Actions & Asset Events.

## How the Platforms Do It

What exchanges publish about listing, as of November 2026:

| Exchange | Process, as described | Fees | Notable public detail |
| --- | --- | --- | --- |
| **Binance** | No set requirements; looks for a "proven team, a useful product, and a large user base" and at least a minimum viable product; the founder or CEO applies by email | Not mentioned in its listing FAQ | "A strict, one-way NDA at the first point of contact" |
| **Coinbase** | Asset listing procedures reviewed "with a group of senior leaders from across the company"; policies to analyze whether each asset is a security before permitting trading; 360+ assets on Coinbase Exchange | Not stated in its filings | First crypto insider trading case was a Coinbase product manager (2022) |
| **Kraken** | Applications only through its listing form; "Listings & Risk teams assess security, regulatory posture, liquidity potential and market fit," then Legal signs off and engineers connect nodes and test deposits and withdrawals; aims to answer in two weeks; rejected projects may reapply after three months | "Never charges a fee to list an asset" | About 2 to 6 weeks to integrate an EVM token after approval; a public listings roadmap; for the EEA, a MiCA white paper filed with a national authority at least 20 business days before listing |
| **Robinhood** | A listing committee "regularly reviews cryptocurrencies" against listing and continued-support policies; 19 coins in the US after relisting SOL, ADA, XRP and PEPE on November 13, 2024 | Discloses on some assets that it "received integration fees in connection with supporting this asset" | Footnoted per asset on its coin availability page |

The common shape: **a review across legal, security, technical and market dimensions, a committee that decides, and engineering integration after approval.** The differences are in what's disclosed: whether fees are paid, who sits on the committee, and how conflicts are handled. New York now writes those down as requirements.

## The Rules

### New York: coin-listing and delisting policies

The New York Department of Financial Services' Guidance Regarding Listing of Virtual Currencies of November 15, 2023 replaced its 2020 guidance and applies to every BitLicensee and New York trust company. A regulated entity may offer a coin in one of three ways: self-certify it under a coin-listing policy the Department approved, list it from the Department's **Greenlist**, or get the Department's approval of the coin as a material change. The Department "will not approve a coin-listing policy absent an accompanying coin-delisting policy."

What a listing policy must contain:

- **Governance.** The board or equivalent approves the policy, reviews it at least annually, and approves or disapproves each coin; it must be independent of whoever recommends a listing, and conflicts are disclosed publicly. Changes need the Department's prior approval.
- **A risk assessment in eight areas:** technical design and technology, operational, cybersecurity, market and liquidity, illicit finance, legal, reputational, and regulatory. Every listed coin is re-evaluated at least annually.
- **Enhanced review for retail.** Some coins can't be self-certified for retail customers unless they're greenlisted: stablecoins (including collateral for a non-greenlisted stablecoin), exchange coins, coins with protocol-resiliency concerns (one party controlling more than 51% of hash power or the proof-of-stake equivalent), bridged coins, and coins with less than 35% of total supply circulating.

The delisting policy is required of every entity, with clear roles, a record of coins held personally by members of the governing body, information barriers, triggers and an impact analysis. Notice runs on fixed clocks: the Department gets written notice of a delisting decision at least 10 business days before customers are told, and customers get at least 30 calendar days' written notice.

The Greenlist, as published on the Department's virtual currency page in November 2026, holds BTC, ETH, and six New York-approved stablecoins: GUSD, GYEN, ZUSD, RLUSD, USDW and GOLD. An entity must notify the Department at least 10 days before offering a greenlisted coin in New York, and the Department may remove coins from it at its discretion.

### The EU: admission to trading under MiCA

MiCA puts the listing decision into law for crypto-assets other than stablecoins. Admission to trading requires a crypto-asset white paper drawn up under Article 6, notified to the home competent authority under Article 8 at least 20 working days before publication (with an explanation of why the asset isn't an e-money token, an asset-referenced token or excluded from MiCA), and published under Article 9. If a trading platform admits an asset on its own initiative and no white paper exists, the operator must meet those requirements itself (Article 5(2)), and the applicant and the operator can agree in writing that the operator will (Article 5(3)). Kraken's EEA requirements reflect this: the white paper and explanatory note filed with a national authority at least 20 business days before listing, which Kraken says it doesn't draft.

Article 76 sets the operating rules for the platform's own diligence. Before admitting an asset, the operator must "assess the suitability of the crypto-asset concerned," weighing "the reliability of the technical solutions used and the potential association to illicit or fraudulent activities," and the experience and track record of the issuer and its team. The rules must state that an asset isn't admitted where no required white paper has been published, and must prevent admission of assets with an inbuilt anonymization function unless holders and their transaction history remain identifiable, which in practice keeps most privacy coins off EU platforms.

Stablecoins have their own route: only MiCA-authorized issuers' e-money and asset-referenced tokens may be offered, covered in the Payments volume's [The EU and the UK](/books/payments/stablecoins#the-eu-and-the-uk) and in Stablecoin Law. Its delisting consequences are below.

### The US federal question

Through 2023 and 2024 the listing question in the US was whether a token was a security, and the SEC answered it by suing. On June 5, 2023 it sued Binance, BAM Trading (Binance.US) and Changpeng Zhao, and on June 6 it sued Coinbase, in both cases alleging the platforms operated as unregistered exchanges, brokers and clearing agencies for tokens it called securities. Coinbase's 10-K still describes "policies and procedures to analyze whether each crypto asset that we seek to facilitate trading" is a security, and says an adverse determination "may result in us removing that crypto asset." The SEC dismissed the Coinbase case on February 27, 2025, citing its new Crypto Task Force and stressing the dismissal wasn't a view on the merits, and moved to dismiss the Binance case with prejudice on May 29, 2025. Where the securities analysis stands after those dismissals and the SEC's 2026 taxonomy work is Securities, Commodities & Crypto Market Structure; for a listing team, the point is that the legal review is a dated memo per asset, because the answer has changed and may again.

## The Diligence

The review a listing committee sees, organized by NYDFS's eight areas, with what an engineer contributes to each:

| Area | Questions | Engineering input |
| --- | --- | --- |
| **Technical design** | Is the chain or contract sound? Audits, client diversity, upgrade mechanism, admin keys | Contract review: upgradeable proxy and who controls it, mint authority, freeze and blacklist functions, fee-on-transfer or rebasing behavior, pause switches |
| **Operational** | Can the exchange run it? Node software, finality, history of halts and reorgs | Node and RPC plan, confirmation policy, deposit traps, memo or tag needs, how the chain behaves under load |
| **Cybersecurity** | Signing support, key scheme fit, wallet software maturity | Custody vendor or in-house signer support, multisig or MPC on this chain, address derivation |
| **Market and liquidity** | Depth across venues, concentration of holders, market makers, price sources | Pricing oracle and reference sources, whether a market maker has committed liquidity |
| **Illicit finance** | Exposure to sanctioned addresses, mixers, hacks; analytics coverage | Whether the blockchain analytics vendor covers the chain and token for screening and the Travel Rule |
| **Legal** | Securities analysis, the issuer's representations, MiCA white paper status | The dated legal memo; for the EEA, the white paper reference |
| **Reputational** | Team, history, controversies | None |
| **Regulatory** | Which entities and jurisdictions can offer it, greenlist status, enhanced-review categories | Per-entity availability (`product_offerings`) and geofencing |

Contract behavior is where engineering findings most often stop a listing. A token whose contract can freeze balances or blacklist addresses can freeze the exchange's omnibus wallet, and for issuer-backed stablecoins it does by design (Freezes, Blacklists & Seizures covers that); a fee-on-transfer token credits less than was sent and breaks a deposit matcher that expects the sent amount; a rebasing token changes balances with no transfer at all, so the ledger and the chain drift apart daily unless the exchange models it; an upgradeable proxy means the contract the exchange reviewed may not be the one it's holding next month. The mechanics are in Tokens & Token Standards.

## The Integration Checklist

Approval starts the engineering work. Per chain (if the chain is new) and per token:

- **Chain:** two independent node or RPC sources ([Blockchain Nodes, RPC & Validators](/books/hosting-and-cloud/blockchain-nodes-and-validators)), a chain watcher with reorg handling, the `chains` row with its finality rule, and a confirmation policy by amount band ([Confirmation Policies per Chain](/books/investing-and-digital-assets/crypto-deposits-and-withdrawals#confirmation-policies-per-chain)).
- **Asset network row:** contract address or native, token standard, on-chain decimals, and whether deposits and withdrawals are enabled. The same instrument on a second chain is a second `asset_networks` row, never a second instrument.
- **Addresses:** derivation scheme, memo or tag requirement and `RequireDest` where available, deposit traps to block or warn on (Kraken's list for its chains includes privacy-feature deposits and coinbase rewards it won't credit).
- **Wallets:** hot, warm and cold wallets with limits, signer support, a gas float on account chains, and the sweep rule ([Hot, Warm & Cold Wallets](/books/investing-and-digital-assets/hot-and-cold-wallets#hot-wallet-limits-and-sizing)).
- **Fees:** withdrawal fee and minimum, set from the chain's fee market.
- **Compliance:** analytics coverage for screening and Travel Rule, and listing in the sanctions screening configuration.
- **Market:** trading pairs, tick and lot sizes, price bands, the reference price source, and market data.
- **Reporting:** inclusion in proof of reserves, tax lot handling and cost basis feeds, and statements.
- **Tests on mainnet:** a small deposit and withdrawal through every path, a sweep, a reorg simulation on a test network, and a cold-wallet round trip before customers can deposit.

Kraken's estimate of 2 to 6 weeks for an EVM token after approval is the time this list takes when the chain is already integrated. A new chain is months.

## The Launch Sequence

A listing goes live in stages, each a market mode on the venue ([How a Crypto Exchange Works](/books/investing-and-digital-assets/crypto-exchange-architecture#how-to-build-it)) or an asset network flag, so liquidity can build before anyone can take it:

| Stage | Deposits | Withdrawals | Order book | Why |
| --- | --- | --- | --- | --- |
| **Announced** | Off | Off | None | Customers and market makers prepare |
| **Transfer only** | On | On | None | Inventory arrives before trading |
| **Post-only** | On | On | `post_only`: resting orders only, no matching | A book forms without anyone sweeping it |
| **Limit-only** | On | On | `limit_only` | Matching without market orders into a thin book |
| **Full trading** | On | On | `normal` | Market orders and simple buys allowed |

My default is to advance a stage when the book's depth and spread meet a written threshold, not on a clock, and to open the simple-buy product (which takes liquidity on the customer's behalf) only at full trading. A listing that goes straight to full trading in a market with no resting orders is a listing where the first market buy sets an absurd price.

## Paid Listings and Conflicts

Whether an issuer pays to be listed is a disclosure question that New York now treats as a governance one. Kraken says it never charges a listing fee. Robinhood discloses per asset where it "received integration fees in connection with supporting this asset," and lists those footnotes on its coin availability page. NYDFS requires that conflicts be disclosed publicly and that the governing body be independent of whoever recommends a listing. Whatever an exchange's policy, the record of who paid what, for which asset, and who on the committee holds the asset belongs with the listing decision, and the delisting policy's record of coins held personally by governing members is the same data.

## Listing Announcements Are Inside Information

A listing announcement moves price, so knowing one in advance is trading on inside information whether or not the token is a security.

**The Wahi case.** On July 21, 2022 the SEC charged Ishan Wahi, a Coinbase product manager who helped coordinate listing announcements, his brother Nikhil Wahi and a friend, Sameer Ramani, with insider trading: from June 2021 to April 2022 they traded ahead of listing announcements in at least 25 crypto assets, at least nine of which the SEC alleged were securities, for profits over $1.1 million. The Southern District of New York brought parallel criminal charges. On May 30, 2023 the SEC announced settlements with both brothers, who had pleaded guilty to conspiracy to commit wire fraud: Ishan was sentenced to 24 months in prison and forfeited 10.97 ETH and 9,440 USDT, and Nikhil to 10 months with $892,500 forfeited. The criminal charge didn't depend on the securities question; misappropriating an employer's confidential information was enough.

**MiCA writes it into the regulation.** Article 89 prohibits insider dealing in crypto-assets, including using inside information to cancel or amend an existing order, and Article 92 requires "any person professionally arranging or executing transactions in crypto-assets" to have systems "to prevent and detect market abuse" and to report "without delay" any reasonable suspicion about an order or transaction to its competent authority.

The controls follow: a need-to-know list for every pending listing with access logged, an information barrier between the listing team and anyone trading, a restricted list that blocks covered employees from trading listed-pending assets anywhere the firm can see, surveillance of on-chain and off-platform buying of a pending asset by addresses linked to employees, and announcement timing that leaves the smallest window between decision and publication. Surveillance in depth is [Market Surveillance & Manipulation](/books/investing-and-digital-assets/market-surveillance#crypto-wash-trading-and-venue-surveillance).

## Delisting

### Why exchanges delist

Delistings come from the same eight areas as listings, usually after something changed: a regulator's view (the US delistings of 2023), a law (MiCA's stablecoin rules), a security failure (a bridge exploit that leaves a bridged token unbacked), a chain that stops being maintained or loses its validators, liquidity that dries up, or an issuer that migrates the token to a new contract. A delisting policy names the triggers in advance, so the decision is the policy being applied rather than a judgment made under pressure.

### The 2023 US delistings

After the SEC's June 2023 suits named tokens it considered securities, US platforms restricted or delisted them. Robinhood ended support for ADA, MATIC and SOL in June 2023, according to press reports at the time, and relisted SOL and ADA (with XRP and PEPE) on November 13, 2024.<!-- source-gap: robinhood-2023-delisting | secondary | Robinhood ended support for ADA, MATIC and SOL effective June 27, 2023 | closes with: Robinhood's June 2023 customer notice or newsroom post | checked: 2026-11-05 --> Binance.US, press reported, suspended dollar deposits in June 2023 and became a crypto-only platform for a period.<!-- source-gap: binance-us-usd-suspension | secondary | Binance.US suspended USD deposits June 8, 2023 after the SEC suit | closes with: a Binance.US announcement or a court filing in SEC v. Binance | checked: 2026-11-05 --> The lesson for the delisting machinery was that it had to run at the scale of whole assets across millions of accounts, on a regulator's timeline, including automatic conversion of balances customers didn't withdraw or sell.

### MiCA and non-compliant stablecoins

On January 17, 2025 ESMA told national authorities to ensure compliance with MiCA's stablecoin rules "as soon as possible and no later than the end of Q1 2025": trading platforms had to stop making non-compliant asset-referenced and e-money tokens available for trading, other services restricted by the end of January 2025, with sell-only allowed until the end of the first quarter, while "mere custody and transfer" could continue. USDT, whose issuer isn't MiCA-authorized, was the main asset affected, and EEA exchanges restricted it on varying schedules; Coinbase's restriction from December 2024 is documented in press reports, not in a primary notice I could open.<!-- source-gap: coinbase-eea-usdt | secondary | Coinbase Europe restricted USDT for EEA customers from December 2024 | closes with: a Coinbase EU help-center notice or a Coinbase filing | checked: 2026-11-05 --> On October 8, 2026 ESMA went further: its opinion says CASPs "should cease providing services related to non-MiCA-compliant stablecoins to clients in the European Union," custody and transfer included, with only liquidating, converting, withdrawing, transferring out or safekeeping pending exit allowed, and national authorities to act within three months, which points to early January 2027.

### Wind-down mechanics

A delisting is a sequence of state changes, each with a notice and a date, and the dates come from the policy (New York's 10 business days to the Department and 30 calendar days to customers are the floor there):

| Step | What changes | Customer can |
| --- | --- | --- |
| **Decision** | Recorded with triggers and impact analysis; regulator notified where required | Nothing yet |
| **Announcement** | Notice with every date that follows | Trade, deposit, withdraw |
| **Deposits off** | `asset_networks.deposits_enabled = false`; late deposits go to recovery | Trade, withdraw |
| **Sell-only or cancel-only** | `instruments.status = 'close_only'`, pair mode `cancel_only`, simple buys off; sells allowed through a convert or a limit book | Sell, withdraw |
| **Trading off** | Market mode `halted`; open orders canceled | Withdraw |
| **Withdraw-only window** | Hot and warm wallets kept funded for the asset | Withdraw |
| **Conversion or final disposition** | Remaining balances converted to cash or a stablecoin at a disclosed price, or held for withdrawal, per the terms | Receive the proceeds |
| **Retired** | Instrument `delisted`; wallets drained to the firm's disposal and addresses still watched | Nothing; late deposits go to recovery |

Three details cause most of the trouble. **Customers who never act:** the terms must say what happens to their balance, and the conversion price must come from a disclosed source at a disclosed time. **Staked or locked balances:** unbonding periods may outlast the window, so staked assets need their own schedule. **Tax:** an automatic conversion is a disposal, reported like any other (Crypto Tax).

## Chain Upgrades, Migrations and Forks

### Planned upgrades

A hard fork the whole network agrees to is a node upgrade with a deadline. The exchange upgrades its nodes ahead of the activation, pauses deposits and withdrawals for the chain around the activation block, verifies the chain finalizes on the new rules, and resumes. The pause belongs in the asset network's status, announced in advance, like any other planned maintenance.

### Token migrations

A token migration moves an asset to a new contract or a new native asset, often with a new ticker. When Polygon's MATIC became POL, Kraken listed POL on September 4, 2024 at 12:00 UTC, suspended MATIC on the Ethereum network and enabled POL deposits and withdrawals there, and left staked MATIC unaffected. For the ledger, a migration is an asset event (the core model's `asset_events` with type `token_migration`): a conversion of every holder's balance from the old instrument to the new one at the migration ratio, posted as one journal entry per account at a stated time, with the exchange migrating its own wallets' holdings on chain through the issuer's migration contract and reconciling the result. Deposits of the old token after the cutoff go to recovery or to an automatic conversion, per the policy.

### Forks and airdrops

A contentious fork splits a chain into two, and the exchange has to decide which one its customers' balances follow, and whether to credit the other. Kraken's stated policy is to support the new chain in uncontentious forks, to wait and see in contentious ones with funds following "the chain that is most dominant," that it is "not obligated to credit airdrops," and that customers who want a fork's or airdrop's coins should withdraw to a private wallet "well ahead of the deadline." Coinbase's 10-K says it does "not believe that we are required to support any fork or airdrop." The iShares Bitcoin Trust's custodian picks the branch, supports at least the original, and doesn't support airdrops; the Trust abandons incidental rights. The engineering consequences of a fork are real either way:

- **Replay protection.** A transaction valid on both branches can be replayed on the other; Ethereum's EIP-155 put the chain ID into the signed data for exactly this reason. Withdrawals pause until the exchange knows replay is impossible, or splits its coins on chain first.
- **Balances at the fork block.** If the exchange credits the new coin, each customer's entitlement is their balance at the fork height, computed from the ledger at that point, and the exchange needs the coins on chain to back it, which means its wallets held the original at that block.
- **A new instrument.** The forked coin is a new listing, through the same review, even if the decision is to credit and immediately offer withdrawal only.

## How to Build It

These are deltas against the core data model in [The Investing & Digital Assets Business](/books/investing-and-digital-assets/investing-business#the-core-data-model) (`instruments` with status active, halted, close_only or delisted; `asset_networks` with `deposits_enabled` and `withdrawals_enabled`; `asset_events` and `asset_event_elections`; `disclosures`; `cases`) and against [How a Crypto Exchange Works](/books/investing-and-digital-assets/crypto-exchange-architecture#how-to-build-it) (`product_offerings`, `trading_pairs`, `market_modes`). This chapter adds the review, its assessments and votes, the checklist items, the insider list for pending listings, the stage history, announcements, and delisting plans.

```sql
CREATE TABLE listing_reviews (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  instrument_id    UUID NOT NULL REFERENCES instruments (id),
  kind             TEXT NOT NULL CHECK (kind IN ('listing', 'annual_review', 'delisting', 'new_network', 'fork', 'migration')),
  legal_entity_id  UUID NOT NULL REFERENCES legal_entities (id),  -- reviews are per entity and its rules
  route            TEXT CHECK (route IN ('self_certified', 'greenlist', 'regulator_approved', 'mica_white_paper', 'not_applicable')),
  white_paper_ref  TEXT,                          -- the notified MiCA white paper, where required
  requested_by     TEXT NOT NULL,                 -- 'issuer_application', 'internal', 'regulator'
  integration_fee  BIGINT,                        -- cents, if any was paid; disclosed per policy
  opened_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status           TEXT NOT NULL CHECK (status IN ('open', 'approved', 'rejected', 'withdrawn'))
);

CREATE TABLE listing_assessments (
  review_id     UUID NOT NULL REFERENCES listing_reviews (id),
  area          TEXT NOT NULL CHECK (area IN ('technical_design', 'operational', 'cybersecurity', 'market_liquidity',
                  'illicit_finance', 'legal', 'reputational', 'regulatory')),
  rating        TEXT NOT NULL CHECK (rating IN ('low', 'medium', 'high', 'unacceptable')),
  findings      JSONB NOT NULL,                   -- e.g. {"upgradeable_proxy": true, "freeze_function": true}
  memo_ref      TEXT,                             -- the dated legal or technical memo
  assessed_by   UUID NOT NULL,
  assessed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (review_id, area)
);

CREATE TABLE listing_decisions (                  -- the governing body's vote, one row per member
  review_id      UUID NOT NULL REFERENCES listing_reviews (id),
  member_id      UUID NOT NULL,
  vote           TEXT NOT NULL CHECK (vote IN ('approve', 'reject', 'abstain', 'recused')),
  holds_asset    BOOLEAN NOT NULL,                -- personal holdings, as the delisting policy requires
  conflict_note  TEXT,
  voted_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (review_id, member_id)
);

CREATE TABLE listing_checklist_items (
  review_id        UUID NOT NULL REFERENCES listing_reviews (id),
  asset_network_id UUID NOT NULL REFERENCES asset_networks (id),
  check_name       TEXT NOT NULL,                 -- 'second_node', 'confirmation_policy', 'test_deposit', 'cold_round_trip', ...
  passed           BOOLEAN NOT NULL,
  evidence_ref     TEXT NOT NULL,                 -- tx hash, runbook, ticket
  checked_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (review_id, asset_network_id, check_name)
);

CREATE TABLE listing_insiders (                   -- who knows about a pending listing or delisting
  review_id     UUID NOT NULL REFERENCES listing_reviews (id),
  person_id     UUID NOT NULL,
  added_by      UUID NOT NULL,
  added_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  removed_at    TIMESTAMPTZ,                      -- when the announcement made it public
  PRIMARY KEY (review_id, person_id)
);

CREATE TABLE instrument_stages (                  -- append-only: the current stage is the latest row
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  instrument_id   UUID NOT NULL REFERENCES instruments (id),
  legal_entity_id UUID NOT NULL REFERENCES legal_entities (id),
  stage           TEXT NOT NULL CHECK (stage IN ('announced', 'transfer_only', 'post_only', 'limit_only', 'full_trading',
                    'deposits_off', 'sell_only', 'trading_off', 'withdraw_only', 'converted', 'retired')),
  review_id       UUID REFERENCES listing_reviews (id),
  disclosure_id   UUID REFERENCES disclosures (id),  -- the notice customers received
  effective_at    TIMESTAMPTZ NOT NULL,
  set_by          UUID NOT NULL
);

CREATE TABLE listing_announcements (             -- listing and delisting notices, to whom and when
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  review_id         UUID NOT NULL REFERENCES listing_reviews (id),
  audience          TEXT NOT NULL CHECK (audience IN ('regulator', 'customers', 'public')),
  sent_at           TIMESTAMPTZ NOT NULL,
  required_lead     TEXT,                         -- '10 business days' to NYDFS, '30 calendar days' to customers
  first_effect_at   TIMESTAMPTZ NOT NULL,         -- the first stage the notice announces
  disclosure_id     UUID REFERENCES disclosures (id),
  CHECK (first_effect_at >= sent_at)
);

CREATE TABLE delisting_plans (
  review_id            UUID PRIMARY KEY REFERENCES listing_reviews (id),
  instrument_id        UUID NOT NULL REFERENCES instruments (id),
  triggers             TEXT[] NOT NULL,           -- 'regulatory', 'security', 'liquidity', 'issuer', 'chain', 'law'
  impact_analysis_ref  TEXT NOT NULL,
  deposits_off_at      TIMESTAMPTZ NOT NULL,
  trading_off_at       TIMESTAMPTZ NOT NULL,
  withdraw_until       TIMESTAMPTZ NOT NULL,
  disposition          TEXT NOT NULL CHECK (disposition IN ('convert', 'hold_for_withdrawal', 'return_on_chain')),
  convert_to_instrument_id UUID REFERENCES instruments (id),
  conversion_price_source  TEXT,                  -- the disclosed source and time of the price
  staked_balances_plan TEXT,                      -- unbonding that outlasts the window
  asset_event_id       UUID REFERENCES asset_events (id),  -- the conversion, once scheduled
  CHECK (deposits_off_at <= trading_off_at AND trading_off_at <= withdraw_until)
);
```

The stage table drives everything else: entering `transfer_only` flips `asset_networks.deposits_enabled` and `withdrawals_enabled`; `post_only`, `limit_only`, `full_trading`, `sell_only` and `trading_off` set the instrument's pairs' mode in `trading_pairs` (with a `market_modes` row each) and, for `sell_only`, `instruments.status = 'close_only'`; `converted` runs the conversion as an `asset_events` row with one journal entry per holding account, keyed by `(asset_event_id, account_id)`. A job refuses to advance a delisting past `announced` until a `listing_announcements` row for each required audience is old enough, measured in the policy's own units (business days for the regulator, calendar days for customers). The insiders table feeds surveillance: trades in the pending asset by anyone on the list, or by addresses linked to them, between `added_at` and the announcement are alerts. And `listing_decisions.holds_asset` with `vote = 'recused'` is how the conflict rules become a query instead of a promise.

## Auditing

What a regulator, auditor or court asks of a listing program:

- **The policy versions** in force on each date, their approvals, and (in New York) the Department's approval of each change.
- **Every review** with its eight assessments, memos, the decision and each member's vote, holdings and recusals, and any fee paid.
- **Annual re-evaluations** of every listed asset, on time.
- **Integration evidence** per asset network: the checks, the test transactions and the date deposits opened.
- **Insider lists and access logs** for every pending listing and delisting, and the surveillance results for the window before each announcement.
- **Delisting notices** with their timing against the required lead, every stage change, and the conversion price, source and time for balances converted.
- **Fork and migration decisions,** with the snapshot height, the balances credited and the on-chain evidence that the coins were held at that height.

## What This Means for the System You Build

- **A listing is a dated decision by a governed body,** with assessments in every risk area, recorded votes, holdings and recusals, and a re-review at least yearly.
- **Integration is a checklist with evidence,** per chain and per token, including mainnet test transactions and a cold round trip.
- **Launch through stages:** transfer-only, post-only, limit-only, then full trading, advanced on depth, not on a clock.
- **Pending listings are inside information,** with a need-to-know list, logged access, a restricted list and surveillance.
- **Delistings run on notice clocks** and a written sequence that ends with what happens to balances nobody moved.
- **Migrations and forks are asset events** posted from the ledger at a stated height, backed by coins the wallets held at that block.
- **Contract behavior is a listing input:** freeze functions, upgradeable proxies, fee-on-transfer and rebasing all change how the ledger and the chain agree.

## References

**Law and regulation**

- [Regulation (EU) 2023/1114 (MiCA), Article 5](https://www.springlex.eu/en/packages/mica/mica-regulation/article-5/), white paper, notification and publication for admission to trading, and the trading platform's responsibility
- [MiCA, Article 8](https://www.springlex.eu/en/packages/mica/mica-regulation/article-8/), notification to the home authority at least 20 working days before publication, with the classification explanation
- [MiCA, Article 76](https://www.springlex.eu/en/packages/mica/mica-regulation/article-76/), the platform's suitability assessment, no admission without a required white paper, and the anonymization rule
- [MiCA, Article 89](https://www.springlex.eu/en/packages/mica/mica-regulation/article-89/), the insider dealing prohibition, including canceling or amending orders
- [MiCA, Article 92](https://www.springlex.eu/en/packages/mica/mica-regulation/article-92/), systems to prevent and detect market abuse and reporting suspicions without delay

**Regulators and guidance**

- [NYDFS: Guidance Regarding Listing of Virtual Currencies (November 15, 2023)](https://www.dfs.ny.gov/industry_guidance/industry_letters/il20231115_listing_virtual_currencies), the three listing routes, governance, the eight risk areas, enhanced retail categories, delisting policies and notice periods
- [NYDFS: Virtual currency businesses and the Greenlist](https://www.dfs.ny.gov/virtual_currency_businesses), the greenlisted coins and the 10-day notice before offering one
- [ESMA: Statement on the provision of services in non-MiCA-compliant ARTs and EMTs (January 17, 2025)](https://www.esma.europa.eu/sites/default/files/2025-01/ESMA75-223375936-6099_Statement_on_stablecoins.pdf), the end of Q1 2025 deadline, sell-only until then, and custody and transfer continuing
- [ESMA: Opinion on services related to non-MiCA-compliant stablecoins (October 8, 2026)](https://www.esma.europa.eu/node/235756), ceasing services including custody, the exit-only services allowed, and the three-month horizon

**Courts and enforcement**

- [SEC: Charges against Binance, BAM Trading and Zhao (Release 2023-101)](https://www.sec.gov/newsroom/press-releases/2023-101), the June 5, 2023 complaint and the May 29, 2025 motion to dismiss with prejudice
- [SEC: Charges against Coinbase (Release 2023-102)](https://www.sec.gov/newsroom/press-releases/2023-102), the June 6, 2023 complaint alleging an unregistered exchange, broker and clearing agency
- [SEC: Dismissal of the Coinbase case (Release 2025-47)](https://www.sec.gov/newsroom/press-releases/2025-47), the February 27, 2025 joint stipulation and its stated reasons
- [SEC: Insider trading charges in first-ever crypto asset case (Release 2022-127)](https://www.sec.gov/news/press-release/2022-127), the Wahi brothers and Ramani, 25 assets, nine alleged securities, and over $1.1 million in profits
- [SEC: Settlements with the Wahi brothers (Release 2023-98)](https://www.sec.gov/news/press-release/2023-98), the sentences, forfeitures and guilty pleas

**Filings**

- [Coinbase Global: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1679788/000167978826000015/coin-20251231.htm), listing review by senior leaders, the security analysis policy, removal of assets, 360+ assets, and no obligation to support forks or airdrops
- [iShares Bitcoin Trust ETF: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1980994/000143774926006058/bit20251231_10k.htm), the custodian's fork and airdrop policy

**Standards and protocols**

- [EIP-155: Simple replay attack protection](https://eips.ethereum.org/EIPS/eip-155), the chain ID in the signed transaction

**Vendor documentation**

- [Binance: How to get your coin listed](https://www.binance.com/en/support/faq/how-to-get-your-coin-listed-on-binance-com-053e4bdc48364343b863d1833618d8ba), no set requirements, founder applications by email, and the one-way NDA
- [Kraken: Get listed](https://www.kraken.com/get-listed), the application form, the review teams, no listing fee, 2 to 6 weeks for EVM tokens, the roadmap, and MiCA white paper filing
- [Kraken: Five simple steps to get listed (September 19, 2024)](https://blog.kraken.com/product/asset-listings/5-simple-steps-how-to-get-listed-on-kraken), the two-week response aim and three-month reapplication
- [Kraken: General statement on forks, airdrops and new cryptocurrencies](https://support.kraken.com/articles/115013895208-general-statement-on-forks-airdrops-and-addition-of-new-cryptocurrencies), uncontentious and contentious forks, no obligation to credit airdrops, and migrations
- [Kraken: Changes to MATIC on the Polygon network](https://support.kraken.com/articles/changes-to-matic-on-the-polygon-network), the POL listing on September 4, 2024 and the MATIC suspension on Ethereum
- [Kraken: Cryptocurrency deposit processing times](https://support.kraken.com/hc/en-us/articles/203325283-Cryptocurrency-deposit-processing-times), deposits it won't credit per chain
- [Robinhood: Crypto expands with SOL, PEPE, ADA and XRP (November 13, 2024)](https://robinhood.com/us/en/newsroom/robinhood-crypto-expands-offering-with-solana-sol-pepe-pepe-cardano-ada-amp-xrp-xrp-for-u-s-customers/), the relisting, 19 coins and the listing committee
- [Robinhood: Coin availability](https://robinhood.com/us/en/support/articles/coin-availability/), integration fee disclosures per asset
