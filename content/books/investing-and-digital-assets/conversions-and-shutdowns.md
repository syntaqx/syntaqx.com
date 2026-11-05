+++
title = "Conversions, Shutdowns & Distributions"
nav_title = "Conversions & Exits"
description = "Moving millions of accounts between brokers, changing clearing firms, leaving a market, distributing a bankrupt platform's assets and escheating dormant ones."
category = "Investing & Digital Assets Industry"
order = 2581
part = "Running the Platform"
tags = ["investing", "crypto", "conversions", "migrations", "bankruptcy", "unclaimed-property"]
+++

Every account ends somewhere. Most end quietly: the customer transfers out by ACATS, sells, withdraws and closes. But some end in bulk, decided by someone other than the customer: an acquirer converts millions of accounts to its own platform over a series of weekends, an introducing broker moves every account to a new clearing firm, an exchange stops serving a country, a crypto lender files for bankruptcy and its customers become creditors paid through a distribution agent, or a customer simply stops answering and the state takes the property. Each is a migration in which the ledger, the lots, the standing instructions and the customer's rights must arrive intact on the other side, and in which every break is a customer who can't trade, a wrong tax form or an asset that went to the wrong place.

The chapter covers how the large events of recent years ran, brokerage conversions with a conversion weekend's reconciliation of positions and lots in worked numbers, changing clearing firms and bulk transfers, exiting a market, bankruptcies and distributions in cash or in kind, unclaimed property for securities and crypto, and how an account ends. The general migration method (crosswalks, loading with side effects off, reconciliation, the rollback window) is the playbook's [Replacing Systems](/docs/architecture/replacing-systems); single-account transfers are [ACATS Transfers](/books/investing-and-digital-assets/funding-and-transfers#acats-transfers); moving a brokerage-as-a-service provider is [Contracts and Moving Providers](/books/investing-and-digital-assets/brokerage-as-a-service#contracts-and-moving-providers); delisting one asset is [Delisting](/books/investing-and-digital-assets/listing-assets#wind-down-mechanics); SIPC liquidations of failed broker-dealers are [SIPC](/books/investing-and-digital-assets/customer-protection#sipc); and the 2022 crypto failures themselves are [FTX, Celsius & the 2022 Collapse](/books/investing-and-digital-assets/exchange-collapses). The chapter adds `conversion_batches`, `conversion_accounts`, `distribution_claims` and `unclaimed_property_items` to [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model).

## How the Platforms Do It

The public record of large account events, as of November 2026:

| Event | What happened | Source |
| --- | --- | --- |
| **Schwab converts TD Ameritrade** (2023 to 2024) | Four transition groups in 2023 moved about $1.6 trillion of client assets across more than 15 million accounts, including 7,000 RIAs; a fifth group in May 2024 completed it, about $1.9 trillion across more than 17 million accounts in all; by December 31, 2024, TD Ameritrade, Inc. and TD Ameritrade Clearing were no longer registered broker-dealers | Schwab 10-Ks for 2023 and 2024 |
| **Celsius distributions** (2024) | Plan effective January 31, 2024; US creditors paid through PayPal and creditors elsewhere through Coinbase where supported, in liquid crypto or in dollars for those ineligible; creditors couldn't choose a partner; recoveries estimated from crypto prices as of May 31, 2023; distributions unclaimed for a year treated as unclaimed property under the plan and redistributed to other creditors | Debtors' distribution notice (S.D.N.Y. 22-10964) |
| **FTX distributions** (2025 to 2026) | Distributions through BitGo, Kraken and Payoneer; a March 31, 2026 round of about $2.2 billion; cumulative recoveries reported at 96% for Dotcom customer claims and 100% for US customer claims, measured at claim values | Secondary press only, below |
| **Mt. Gox** (2014 to 2027) | Repayments in bitcoin and bitcoin cash since 2024, with the deadline moved to October 31, 2027 ([Mt. Gox](/books/investing-and-digital-assets/exchange-security#mt-gox)) | Trustee notices |
| **US exchanges and the 2023 SEC cases** | The SEC charged Bittrex in April 2023 with operating an unregistered exchange, broker and clearing agency, and Binance and its US affiliate BAM Trading in June 2023; the Binance case was dismissed with prejudice on May 29, 2025 | SEC press releases 2023-78 and 2023-101 |

<!-- source-gap: ftx-distributions-and-appeal | secondary | FTX distribution agents (BitGo, Kraken, Payoneer), the March 31, 2026 round and cumulative recovery percentages | closes with: the FTX Recovery Trust's distribution notices or the plan administrator's filings on the D. Del. 22-11068 docket | checked: 2026-11-05 -->
<!-- source-gap: ida-market-exits | missing | dates and mechanics of US and non-US crypto market exits (Bittrex's US wind-down, Binance.US dollar rails, Binance's exits from Canada and the Netherlands, Coinbase's exit from Japan) | closes with: the companies' own announcements or court notices, opened | checked: 2026-11-05 -->

FTX's figures above come only from secondary press, and the exits of US and foreign crypto venues from markets in 2023 are not in this chapter's sources at all; I describe the mechanics without their dates. Three patterns run through what is sourced:

- **Big moves are batched.** Schwab moved more than 17 million accounts in five groups over a year rather than once. Each group is a full migration with its own freeze, load, reconciliation and go decision, and the lessons of the first change the next.
- **Distribution is a payments problem.** Celsius didn't send coins to creditors' wallets; it used PayPal and Coinbase as distribution partners, each with its own KYC, limits and supported countries. A bankrupt platform's last product is a payout pipeline.
- **The record decides who gets what.** Celsius creditors' recoveries were estimated from crypto prices on a fixed date and the estate's records. Whatever the ledger said on the valuation date is what the customer gets, in cash or in kind.

## Brokerage Conversions

A conversion moves accounts from one platform to another without the customer asking: after an acquisition, a consolidation of affiliates, a move to self-clearing, or a provider change. It is a bulk version of ACATS with three differences: no customer-signed transfer instruction, the receiving firm often already owns the carrying firm, and everything about the account moves, not just the assets.

**Consent.** A bulk transfer usually proceeds on negative consent: the customer is told and may object, and silence is consent. FINRA's guidance (Notice to Members 02-57) accepts negative response letters for bulk transfers where a member is in financial or operational difficulty, an introducing firm is no longer in business, a networking arrangement with a financial institution changes, members merge or one acquires another, or an introducing firm changes clearing firms, and not for a registered representative moving accounts to a new firm. The letter must describe why the transfer is happening, state the customer's right to object, explain how to move the account elsewhere instead, disclose any cost the transfer imposes, and give at least 30 days to respond unless exigent circumstances exist. Opt-outs received have to be honored, so the conversion's account list is the eligible list minus every objection, frozen at a cutoff.

**What moves.** A conversion that moves only positions and cash leaves customers broken in a dozen small ways. The inventory:

| Category | Items | Notes |
| --- | --- | --- |
| **Holdings** | Positions by instrument, cash, margin debit, short positions, options with expirations | Instruments the new platform doesn't carry need a decision: set them up, or liquidate with notice |
| **Tax lots** | Every open lot with acquisition date, adjusted basis, wash sale adjustment, holding period start, covered status | The transfer statement rules apply between brokers ([Transferred Basis](/books/investing-and-digital-assets/cost-basis-and-tax-lots#transferred-basis)); between affiliates the lots move with the account all the same |
| **Open orders** | Good-til-canceled orders, conditional orders | Usually canceled at the freeze with notice, because order semantics differ between OMSs |
| **Standing instructions** | Recurring investments, dividend reinvestment, sweep elections, cash management | Each must map to a product on the new platform, or be ended with notice |
| **Linked accounts** | Bank links and ACH authorizations, wire templates | Authorizations may need re-consent under the new firm's name |
| **People** | Joint owners, beneficiaries and transfer-on-death designations, trusted contacts, powers of attorney, authorized traders | Losing a beneficiary designation in a conversion is a problem discovered at a death |
| **Approvals** | Options levels, margin, crypto and futures capabilities | Mapped to the new firm's levels; a mismatch is a re-approval, not a silent upgrade |
| **History** | Statements, confirms, tax documents, activity | Kept available; records retention keeps running ([How Long and How: Rule 17a-4](/books/investing-and-digital-assets/books-records-and-cat#how-long-and-how-rule-17a-4)) |
| **Identity** | Logins, devices, account numbers | Account numbers change; a crosswalk maps old to new ([Crosswalks and ID Mapping](/docs/architecture/replacing-systems#crosswalks-and-id-mapping)) |

**The tax year splits.** A conversion mid-year leaves activity on two firms' books. Which entity issues each 1099 for the pre-conversion activity, and how lots and wash sales carry across, is decided before the first batch and told to customers, because a wash sale that straddles the conversion is the classic split-year error ([Wash Sales](/books/investing-and-digital-assets/cost-basis-and-tax-lots#wash-sales)).

### The conversion weekend

Each batch converts over a weekend, when US equities are closed (from December 2026 that's Friday 8:00 pm to Sunday 8:00 pm ET, [A Week Without a Close](/books/investing-and-digital-assets/extended-and-overnight-trading#a-week-without-a-close)):

1. **Freeze.** At Friday's close the batch's accounts on the old platform go to `closing_only` then frozen; open orders are canceled; the extract runs from one consistent snapshot of positions, cash, lots and instructions.
2. **Load with side effects off.** The new platform loads accounts, positions, lots and instructions without sending notifications, confirms, tax reports or orders ([Load With Side Effects Off](/docs/architecture/replacing-systems#load-with-side-effects-off)).
3. **Reconcile.** Control totals from the old platform against the loaded data, at every level (below).
4. **Go or roll back.** By a set time (my default is Sunday noon), every break is resolved or explained, or the batch rolls back and the accounts stay where they were for another week ([Cutover and the Rollback Window](/docs/architecture/replacing-systems#cutover-and-the-rollback-window)).
5. **Open.** The accounts open on the new platform at Monday's first session; the old ones stay read-only for reference ([Keep the Old System as a Read-Only Archive](/docs/architecture/replacing-systems#keep-the-old-system-as-a-read-only-archive)).

### Worked numbers: reconciling one batch

A hypothetical batch of my own: 412,000 accounts, the third of five, extracted Friday at 8:00 pm. The control totals, source against loaded:

| Control | Source | Loaded | Difference | Cause |
| --- | --- | --- | --- | --- |
| Accounts | 412,000 | 412,000 | 0 | |
| Position lines (account × instrument) | 3,108,442 | 3,108,439 | −3 | Three positions in a closed-end fund the new platform hadn't set up; rejected to exceptions |
| Shares of the largest ETF held | 18,402,117.441 | 18,402,117.441 | 0 | |
| Fractional shares, all instruments | 214,553.118274 | 214,553.118270 | −0.000004 | Four accounts' fractions held at nine decimals at the source and rounded to six on load |
| Free credit cash | $1,284,906,331.17 | $1,284,906,331.17 | 0 | |
| Margin debit | $96,220,415.08 | $96,220,415.08 | 0 | |
| Open tax lots | 9,877,206 | 9,877,206 | 0 | |
| Adjusted basis, covered lots | $41,602,118,904.55 | $41,602,113,224.55 | −$5,680.00 | Wash sale adjustments on 37 lots in a separate source field the mapping missed |
| Lots sum to positions, per account and instrument | all | 2 mismatches | 0.8312 shares | A dividend reinvestment that settled after the lot extract but before the position extract |
| Open GTC orders | 61,240 | 0 | −61,240 | Canceled at the freeze by policy, with notice; not a break |
| Recurring plans, bank links, beneficiaries | 88,113 / 301,442 / 54,201 | same | 0 | |

What each break means and what fixes it:

- **The three unknown positions** are three customers who would open Monday with holdings missing. The instrument is set up, the three positions reloaded, and the control rerun. A position is never dropped to make a count match.
- **The fractional rounding** is small in shares and wrong in principle: a customer's holding can't change in a migration. The new platform's `instruments.decimals` for those instruments is raised to the source's precision (or, if the platform truly can't hold nine decimals, the residual is paid in cash at Friday's close under a disclosed policy, as a recorded entry per account, [Rounding and Residuals](/books/investing-and-digital-assets/fractional-and-recurring#rounding-and-residuals)).
- **The $5,680 of missing wash sale adjustments** would have produced wrong gains on 37 customers' next 1099-B and wrong holding periods. The mapping is fixed, the lots reloaded for those accounts, and the basis control rerun to zero. Because adjusted basis is a sum over lots, this break is invisible in any position-level control; only a lot-level total catches it.
- **The two lot-to-position mismatches** come from extracting lots and positions at different moments. The fix is the process, not the data: extract everything from one snapshot (a single `through_entry_id`, as [How Positions Derive From the Ledger](/books/investing-and-digital-assets/ledgers-and-positions#how-positions-derive-from-the-ledger) defines it), then reload the two accounts' lots.

By Sunday morning every control is zero or a documented policy difference (the canceled orders), and the batch goes. The next batch gets two new controls: lot-level adjusted basis per account, and the single-snapshot check.

## Changing Clearing Firms

An introducing broker that moves to a new clearing firm, or brings clearing in house, is doing a conversion in which its own customers don't see a new brand but every account changes carrying firm. The mechanics:

- **Consent and notice.** A change of clearing firm is one of the circumstances FINRA's negative response guidance names; customers get the letter, 30 days, and the right to object.
- **Assets move through ACATS in bulk** from the old clearing firm to the new one, or through DTC deliveries for a self-clearing move, with cost basis following ([ACATS Transfers](/books/investing-and-digital-assets/funding-and-transfers#acats-transfers)). Fractional shares, proprietary funds and assets the new firm won't carry need customer instructions or a disclosed disposition.
- **Obligations move too.** Which firm sends confirms and statements, holds customer funds under Rule 15c3-3, files the 1099s and answers which customer complaints is the clearing agreement's allocation ([Who Owns Which Obligation](/books/investing-and-digital-assets/brokerage-as-a-service#who-owns-which-obligation)); the cutover date for each obligation is part of the plan.
- **The day both firms are live.** Activity on the old firm in the last days (dividends, settling trades, ACH returns) keeps arriving after the conversion; the old firm forwards residuals for months, as ACATS residuals do.

A broker becoming self-clearing adds its own NSCC, DTC and OCC memberships, clearing fund deposits and the reserve computation to the list ([Self-Clearing and Introducing Brokers](/books/investing-and-digital-assets/clearing-and-settlement#self-clearing-and-introducing-brokers)).

## Exiting a Market

A crypto platform leaves a country or a state when a license is refused or surrendered, a law changes, a regulator acts, or the business no longer pays. The asset-level version of the sequence is [Delisting](/books/investing-and-digital-assets/listing-assets#wind-down-mechanics); a market exit runs the same steps for every asset at once, scoped by residence:

| Step | What changes | Customer can |
| --- | --- | --- |
| **Decision and notice** | `product_offerings` rows for the jurisdiction get an end date; regulators notified where the license requires it | Everything, until the dates in the notice |
| **New business stops** | No new accounts, deposits or purchases from that residence | Sell, withdraw |
| **Close-only** | Accounts in the jurisdiction set to `closing_only`; staking unbonded | Sell, withdraw, transfer |
| **Withdraw-only** | Trading off for those accounts; wallets kept funded | Withdraw crypto, withdraw cash |
| **Final disposition** | Remaining balances converted to cash at a disclosed source and time, or held for withdrawal, per the terms | Receive cash; claim later |
| **Residual** | Unclaimed balances follow the unclaimed property law of the customer's state or country | Claim from the state |

Three details decide whether an exit is orderly. **Residence is verified, not inferred,** because an account the platform thinks is in one state and is in another gets the wrong exit ([How a Crypto Exchange Works](/books/investing-and-digital-assets/crypto-exchange-architecture#how-to-build-it) keys products to `residence_jurisdiction`). **Fiat rails may leave first:** when a bank or a payment partner withdraws, cash withdrawals stop before the platform chooses to, and customers can only exit in crypto. **Staked and locked balances** need unbonding before the withdraw-only window ends.

## Bankruptcies and Distributions

A broker-dealer that fails goes to a SIPA liquidation with a trustee, customer property and SIPC advances ([SIPC](/books/investing-and-digital-assets/customer-protection#sipc)). A crypto platform that fails usually goes to Chapter 11, where its customers are creditors and their recovery depends on whether the assets were theirs or the estate's ([Celsius: the Terms Decided](/books/investing-and-digital-assets/exchange-collapses#celsius-the-terms-decided)). Either way the end is a distribution, and a distribution is a payout system built in a hurry by people who didn't build the platform. What it needs:

- **A claim per customer from the records.** Each customer's claim is their ledger balance at the valuation date, by asset, valued under the plan. Celsius estimated recoveries from crypto prices as of May 31, 2023, so the number of coins a creditor received was fixed by that date's prices. A platform whose ledger can produce every customer's balance by asset at any timestamp makes this a query; one that can't makes it a forensic reconstruction ([The Books](/books/investing-and-digital-assets/exchange-collapses#the-books)).
- **In kind or in cash.** Celsius distributed liquid crypto (bitcoin and ether) or dollars, and its notice said creditors could not elect dollars ("Can I elect to receive my claim distribution in USD? No"). Distributing in kind protects creditors from the estate's sale price and exposes them to the distribution partner's limits and the market on the day; distributing cash is simpler and fixes the value.
- **A distribution agent.** Celsius paid US creditors through PayPal and others through Coinbase, assigned by the debtors ("You are not able to affirmatively select a Distribution Partner"), with the partner's own KYC, the creditor's email matched to the Celsius account, a PayPal withdrawal limit of $40,000 a week at the time, and a signed message to prove ownership for withdrawals to self-custody. The estate's system produces a file per agent; the agent's system pays and reports back; the reconciliation between them is the estate's.
- **Unclaimed distributions.** Celsius treated distributions unclaimed for one year after the first attempt as unclaimed property under the plan and redistributed them to other creditors, rather than sending them to the states. Which rule applies depends on the plan, and the system needs the clock either way.
- **Tax information.** Celsius told creditors it would "not be providing any forms ... for accounting and tax purposes." A platform that keeps lot records to the end can give creditors what they need to report the loss and the distribution; one that doesn't leaves them to reconstruct it.

## Unclaimed Property

When an owner stops showing interest in property a firm holds, state law eventually presumes it abandoned and requires the firm to report it and deliver it to the state, which holds it for the owner. For a broker or exchange, the property is securities, cash, uncashed dividend checks and, in states that cover it, virtual currency.

Delaware's law (Title 12, Chapter 11) is a useful model because many firms are incorporated there and its text names virtual currency:

- **Securities** are presumed abandoned 3 years after the owner's last indication of interest; **virtual currency** 5 years after; property not otherwise listed, the earlier of 5 years after the owner could first demand it or other triggers in the section.
- **Virtual currency** is defined as "a digital representation of value, including cryptocurrency," with exclusions for game content, loyalty programs and the like.
- **What counts as interest:** a record communicated by the owner about the property; an oral communication the holder records at the time; presenting a check for a dividend, interest or other distribution; and "activity directed by an owner in the account in which the property is held, including accessing the account." Communications from third parties don't count unless the record shows the owner knew of the property.

<!-- source-gap: ida-unclaimed-california | missing | California's dormancy period for securities (CCP 1516) and its 2025 law on escheating digital financial assets in kind, with effective dates | closes with: the California code sections and the State Controller's holder guidance, opened | checked: 2026-11-05 -->

Other states set their own periods and contact rules, and California's treatment of securities and crypto isn't in this chapter's sources; a firm generally applies the law of the owner's last known address state, which makes the rules a table, not a constant. The bank-side version, with the priority rules for which state gets the property and a worked dormant account, is the Banking & Lending volume's [Dormancy, Escheat & Closing Accounts](/books/banking-and-lending/dormancy-and-escheat#which-state-gets-it). What the system needs:

- **Last owner-directed activity, per account, stored.** A login, a trade, a transfer the owner initiated or a message from the owner resets the clock; automatic activity (dividend reinvestment, a recurring plan the firm runs, a statement mailed) generally doesn't, on my reading of Delaware's "activity directed by an owner." The clock reads the owner's actions, never the account's activity.
- **Due diligence before reporting.** Holders send notice to the owner's last known address before reporting; a response resets the clock.
- **Report and deliver.** Securities are delivered to the state in kind or liquidated depending on the state's rules; virtual currency may be delivered in kind or converted, per the state. Either way it's a `transfers` row out of the account and a journal entry, and the account shows what was escheated, when, to which state, so the owner can claim it.
- **Crypto needs a wallet address or an exchange account at the state's custodian,** and a state that requires liquidation fixes the value at the sale date, which the owner may dispute later.

## The End of an Account

An account closes when its positions and cash are zero, its last transfer has settled and nothing is pending. Closing is not the end of the firm's obligations:

- **Residuals keep coming** for months after a full ACATS transfer out (dividends, class action proceeds, corporate action cash) and are forwarded or paid to the customer ([ACATS Transfers](/books/investing-and-digital-assets/funding-and-transfers#acats-transfers)).
- **Tax forms arrive the next year** for the activity of the year the account closed ([Confirms, Statements & Tax Forms](/books/investing-and-digital-assets/statements-and-tax-forms)).
- **Records outlive the account** under Rule 17a-4's retention periods ([How Long and How: Rule 17a-4](/books/investing-and-digital-assets/books-records-and-cat#how-long-and-how-rule-17a-4)), and privacy erasure requests are bounded by them.
- **Deposits to old addresses still arrive.** A closed crypto account's deposit addresses stay watched, and coins sent to them go to the recovery process, not into the void ([Wrong Networks and Recovery](/books/investing-and-digital-assets/crypto-deposits-and-withdrawals#wrong-networks-and-recovery)).
- **A deceased owner's account** is closed through the estate or the transfer-on-death beneficiary, after documents, with the account restricted in the meantime.

## How to Build It

The volume already records accounts, positions, lots, transfers and cases. This chapter adds the conversion batch and its crosswalk, the creditor's claim in a distribution, and the property reported to a state:

```sql
CREATE TABLE conversion_batches (          -- one group of accounts converted together
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  kind                TEXT NOT NULL CHECK (kind IN ('brokerage_conversion', 'clearing_change',
                        'entity_migration', 'provider_change', 'market_exit')),
  source_entity       TEXT NOT NULL,         -- the carrying firm or platform accounts leave
  target_legal_entity_id UUID NOT NULL REFERENCES legal_entities (id),
  sequence_no         INT NOT NULL,          -- third of five
  notice_sent_on      DATE,                  -- negative response letters
  objection_deadline  DATE,                  -- at least 30 days after receipt
  freeze_at           TIMESTAMPTZ NOT NULL,
  go_deadline         TIMESTAMPTZ NOT NULL,  -- roll back if not reconciled by then
  snapshot_ref        TEXT,                  -- the single extract point at the source
  controls            JSONB NOT NULL DEFAULT '[]',  -- [{"control": "lot_basis", "source": ..., "loaded": ...}]
  status              TEXT NOT NULL CHECK (status IN ('planned', 'noticed', 'frozen', 'loaded',
                        'reconciling', 'went_live', 'rolled_back', 'closed')),
  decided_by          TEXT,
  decided_at          TIMESTAMPTZ
);

CREATE TABLE conversion_accounts (         -- the crosswalk, and each account's outcome
  batch_id            UUID NOT NULL REFERENCES conversion_batches (id),
  source_account_ref  TEXT NOT NULL,         -- the old account number
  account_id          UUID REFERENCES accounts (id),   -- the new account, once loaded
  outcome             TEXT NOT NULL CHECK (outcome IN ('converted', 'objected', 'transferred_elsewhere',
                        'excluded', 'exception', 'rolled_back')),
  exceptions          JSONB NOT NULL DEFAULT '[]',     -- unknown instruments, lot breaks, ...
  PRIMARY KEY (batch_id, source_account_ref)
);

CREATE TABLE distribution_claims (         -- a customer as creditor of a failed platform
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id     UUID NOT NULL REFERENCES legal_entities (id),  -- the debtor
  case_ref            TEXT NOT NULL,         -- court and case number
  party_id            UUID NOT NULL REFERENCES parties (id),
  account_id          UUID REFERENCES accounts (id),
  claim_class         TEXT NOT NULL,         -- the plan's class
  valuation_date      DATE NOT NULL,         -- petition date or the plan's pricing date
  claim_by_instrument JSONB NOT NULL,        -- quantities from the ledger at the valuation date
  claim_value         BIGINT NOT NULL,       -- minor units at the plan's prices
  allowed_value       BIGINT,
  distribution_form   TEXT CHECK (distribution_form IN ('cash', 'in_kind', 'mixed')),
  agent               TEXT,                  -- the distribution partner assigned
  agent_kyc_status    TEXT,
  distributions       JSONB NOT NULL DEFAULT '[]',  -- round, amount, sent_at, agent_ref, claimed_at
  unclaimed_after     DATE,                  -- the plan's deadline from the first attempt
  status              TEXT NOT NULL CHECK (status IN ('filed', 'allowed', 'disputed', 'partly_paid',
                        'paid', 'unclaimed', 'redistributed'))
);

CREATE TABLE unclaimed_property_items (    -- property presumed abandoned, through to delivery
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  owner_party_id      UUID NOT NULL REFERENCES parties (id),
  property_type       TEXT NOT NULL CHECK (property_type IN ('security', 'cash', 'virtual_currency',
                        'uncashed_check', 'other')),
  instrument_id       UUID NOT NULL REFERENCES instruments (id),
  quantity            NUMERIC(78, 0) NOT NULL CHECK (quantity > 0),
  state               TEXT NOT NULL,         -- owner's last known address: 'US-DE', 'US-CA', ...
  last_owner_activity_at TIMESTAMPTZ NOT NULL,
  dormancy_years      SMALLINT NOT NULL,     -- from the state's rule for the property type
  rule_ref            TEXT NOT NULL,         -- '12 Del. C. 1133(13)', ...
  presumed_abandoned_on DATE NOT NULL,
  due_diligence_sent_at TIMESTAMPTZ,
  owner_responded_at  TIMESTAMPTZ,           -- resets the clock; the item is closed
  reported_at         TIMESTAMPTZ,
  delivered_as        TEXT CHECK (delivered_as IN ('in_kind', 'liquidated')),
  transfer_id         UUID REFERENCES transfers (id),  -- the delivery out of the account
  status              TEXT NOT NULL CHECK (status IN ('dormant', 'notice_sent', 'reported',
                        'delivered', 'reclaimed', 'closed'))
);

ALTER TABLE accounts
  ADD COLUMN last_owner_activity_at TIMESTAMPTZ;   -- owner-directed only; the dormancy clock
```

The lot-level controls from the worked numbers, run per batch after the load; any row is a break:

```sql
-- Adjusted basis per account, source extract against loaded lots.
SELECT ca.source_account_ref, s.adjusted_basis AS source_basis, l.adjusted_basis AS loaded_basis
FROM conversion_accounts ca
JOIN source_lot_totals s ON s.source_account_ref = ca.source_account_ref   -- staged extract
JOIN LATERAL (
  SELECT SUM(t.cost_basis + t.wash_sale_adjustment) AS adjusted_basis
  FROM tax_lots t WHERE t.account_id = ca.account_id AND t.remaining_quantity > 0 AND t.covered
) l ON TRUE
WHERE ca.batch_id = :batch_id AND l.adjusted_basis IS DISTINCT FROM s.adjusted_basis;

-- Open lots sum to the position, per account and instrument.
SELECT p.account_id, p.instrument_id,
       p.settled_quantity + p.unsettled_quantity AS position,
       COALESCE(SUM(t.remaining_quantity), 0)    AS lots
FROM conversion_accounts ca
JOIN positions p ON p.account_id = ca.account_id
LEFT JOIN tax_lots t ON t.account_id = p.account_id AND t.instrument_id = p.instrument_id
WHERE ca.batch_id = :batch_id
GROUP BY p.account_id, p.instrument_id, p.settled_quantity, p.unsettled_quantity
HAVING COALESCE(SUM(t.remaining_quantity), 0) <> p.settled_quantity + p.unsettled_quantity;
```

Accounts reaching their dormancy date in the next 90 days, for due diligence letters, by the owner's state rule:

```sql
SELECT a.id, ap.party_id, r.state, r.dormancy_years,
       a.last_owner_activity_at + make_interval(years => r.dormancy_years) AS presumed_on
FROM accounts a
JOIN account_parties ap ON ap.account_id = a.id AND ap.role = 'owner'
                       AND ap.valid_during @> NOW()
JOIN party_states ps ON ps.party_id = ap.party_id               -- last known address state
JOIN dormancy_rules r ON r.state = ps.state AND r.property_type = 'security'
WHERE a.status NOT IN ('closed')
  AND a.last_owner_activity_at + make_interval(years => r.dormancy_years)
      BETWEEN NOW() AND NOW() + INTERVAL '90 days';
```

`party_states` and `dormancy_rules` stand for the address record and a per-state rules table loaded from each state's statute, effective-dated like any rule ([Rules as Data](/docs/building-blocks/rules-as-data)); `source_lot_totals` is the staged extract from the source platform.

Design notes:

- **Every control is a total at a level that can hide a break.** Accounts, positions, shares per instrument, fractions, cash, lots and adjusted basis each catch errors the others don't; the worked numbers' basis break was invisible at the position level.
- **One snapshot for the extract.** Positions, lots and cash come from the same `through_entry_id` at the source, or the controls compare different moments.
- **The crosswalk is permanent.** `conversion_accounts` keeps old and new numbers forever, because statements, tax forms, complaints and unclaimed property inquiries will cite the old one.
- **Claims come from the ledger at a timestamp.** `claim_by_instrument` is the output of the positions-as-of query at the valuation date, with the query and its high-water mark stored.
- **The dormancy clock reads owner actions only.** `accounts.last_owner_activity_at` is updated by owner-initiated events, never by the firm's automated activity.
- **Events:** `conversion_batch.went_live` and `.rolled_back` notify customers and support; `unclaimed_property_item.notice_due` drives the letters; `distribution.sent` posts the payout entry and the agent file.

## Auditing

What regulators, auditors, trustees, states and customers ask about accounts that ended in bulk:

- **Every conversion batch:** the notices and objection deadlines, the account list and objections honored, the freeze, the controls with source and loaded totals, every break with its fix, and the go or rollback decision with who made it.
- **The crosswalk,** old account to new, forever.
- **Every claim and distribution:** the ledger snapshot it came from, the valuation, the plan class, the agent, each payment and its confirmation, and every unclaimed distribution with what was done with it.
- **Every escheated item:** the owner's last activity, the state's rule, the due diligence letter, the report and the delivery, so a returning owner can be told exactly where their property went.
- **Market exits:** the notice, the dates of each step, and every account's final disposition at the disclosed price.

## What This Means for the System You Build

- **Batch every large migration,** with negative consent notices, a freeze, side-effect-free loading, reconciliation and a rollback deadline per batch.
- **Move the whole account,** not just its holdings: lots with adjustments, instructions, beneficiaries, approvals and history.
- **Reconcile at every level,** including lot-level adjusted basis, and extract from one snapshot.
- **Never round a customer's holding in a migration;** raise precision or pay the residual under a disclosed policy.
- **Plan market exits as a sequence of states per jurisdiction,** with verified residence and fiat rails that may leave first.
- **Keep the ledger able to produce every balance at any timestamp,** because a distribution is that query.
- **Store the last owner-directed activity per account** and drive unclaimed property from per-state rules as data.
- **Keep crosswalks, claims and escheat records permanently;** the questions come years later.

## References

**Law and regulation**

- [Delaware Code, Title 12, Chapter 11, Subchapter II (Unclaimed Property: presumptions of abandonment)](https://delcode.delaware.gov/title12/c011/sc02/index.html), the 3-year period for securities and 5-year period for virtual currency, the definitions of security and virtual currency, and what counts as an indication of interest

**Regulators and guidance**

- [FINRA: Notice to Members 02-57, Use of Negative Response Letters for the Bulk Transfer of Customer Accounts (September 2002)](https://www.finra.org/rules-guidance/notices/02-57), the circumstances where negative consent may be used, the letter's contents and the 30-day response period

**Filings**

- [Charles Schwab: Form 10-K for 2023](https://www.sec.gov/Archives/edgar/data/316709/000031670924000018/schw-20231231.htm), the four 2023 transition groups, the assets and accounts moved, and the final group planned for May 2024
- [Charles Schwab: Form 10-K for 2024](https://www.sec.gov/Archives/edgar/data/316709/000031670925000010/schw-20241231.htm), five groups and about $1.9 trillion across more than 17 million accounts, the final group in May 2024, and the deregistration of the TD Ameritrade broker-dealers

**Courts and enforcement**

- [In re Celsius Network LLC: Notice regarding distributions (Bankr. S.D.N.Y. 22-10964, Doc 4220, January 11, 2024)](https://cases.stretto.com/public/x191/11749/PLEADINGS/1174901112480000000065.pdf), PayPal and Coinbase as distribution partners, no choice of partner or of dollars, the PayPal limit, ownership proof for self-custody, valuation prices, one year to claim, and no tax forms
- [Celsius Network: Case information (Stretto)](https://cases.stretto.com/celsius/), the plan's effective date of January 31, 2024 and later distribution notices
- [SEC: SEC charges crypto asset trading platform Bittrex and its former CEO (press release 2023-78, April 17, 2023)](https://www.sec.gov/newsroom/press-releases/2023-78), the charges of operating an unregistered exchange, broker and clearing agency
- [SEC: SEC files 13 charges against Binance entities and founder (press release 2023-101, June 5, 2023)](https://www.sec.gov/newsroom/press-releases/2023-101), the charges against Binance and BAM Trading and the May 29, 2025 dismissal

**In practice**

- [Bitcoin.com News: FTX sets $2.2 billion distribution as creditor recoveries reach up to 120% (March 18, 2026)](https://news.bitcoin.com/ftx-sets-2-2b-distribution-as-creditor-recoveries-reach-up-to-120), the March 31, 2026 round, the distribution agents and cumulative recoveries by class (secondary source)
