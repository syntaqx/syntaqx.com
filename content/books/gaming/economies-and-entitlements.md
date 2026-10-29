+++
title = "Inventories, Entitlements & Economies"
nav_title = "Entitlements & Economies"
description = "What an account owns and how it got it: entitlements, item definitions and instances, currency wallets as ledgers, sinks, crafting, trading and clawbacks."
category = "Gaming Industry"
order = 1616
part = "Backend and Live Services"
tags = ["gaming", "entitlements", "inventory", "virtual-currency", "ledgers", "economy"]
+++

A player who opens the store, buys a bundle, logs out and comes back a year later expects every skin, every gem and every unlocked character to still be there, on whatever device they sign in from. That expectation sounds like storage. It's bookkeeping. Ownership in a game changes hands constantly: purchases on four storefronts, drops at the end of matches, battle pass rewards, crafting, trades, support compensation, refunds and chargebacks that take things back weeks later. Each of those events moves something into or out of an account, and the system's job is to be able to say, for any item and any balance, exactly which events produced it. A store's digital goods, delivered as license keys and downloads rather than account entitlements, are the Commerce volume's [Digital Goods and Licenses](/books/commerce/products-and-variants#digital-goods-and-licenses).

This chapter is the backend that answers "what does this account own?" It covers entitlements as the record of ownership, item definitions and instances, inventories, virtual currency wallets kept as ledgers, the economy those ledgers measure, crafting and loot, trading, refunds and clawbacks, and the audit trail across all of it. What players pay, and the store fees and receipts on the way in, belong to [Monetization Models](/books/gaming/monetization) and [Stores, Fees & Payments](/books/gaming/stores-and-payments); the law on paid randomness belongs to [Loot Boxes & Consumer Law](/books/gaming/consumer-law-and-loot-boxes). The tables extend the core model from [The Games Business](/books/gaming/games-business).

## Entitlements Are the Source of Truth

An **entitlement** is a record that an account has the right to something: a game, a DLC, a character, a skin, a season's battle pass, access to a beta. Everything else that looks like ownership (a loadout screen, a cached inventory, a client's local file, a platform's library) is a view, and when a view disagrees with the entitlements, the entitlements win.

Entitlements are granted, never just set. Every one starts from an event with a source:

- **Purchases** in your own store, settled by your payment provider.
- **Platform receipts** from Steam, PlayStation, Xbox, Nintendo, Apple or Google, which say that a storefront you don't control took the money.
- **Drops and rewards** from play: end-of-match drops, achievements, battle pass tiers, event rewards.
- **Promotions:** codes, partner bundles, pre-order bonuses, compensation after an outage. Viewer rewards for watching a stream and creator codes are covered in [Affiliate Codes and Drops](/books/gaming/creator-economies#affiliate-codes-and-drops).
- **Support grants** by an agent, for a bug or a goodwill gesture.
- **Migrations,** when an old system's ownership moves into a new one.

Two rules follow from that list. First, the client never grants. Valve's Steam Inventory documentation states it plainly: without a server, "the client can't be trusted," keys shipped in a client can be captured, and explicit grants should come only from a trusted server when "the server is the master of the state of the game." A match result reported by a client is a claim; the game server or backend that owns the match decides the drop. Second, a platform's notification is a signal, not a receipt. Google Play's real-time developer notifications say only that a purchase's state changed, and Google tells developers to call the Play Developer API after each one to get the complete status before updating their own state. Validate every receipt server-side against the platform before you grant on it; PlayFab lists "server-side receipt validation" as a backend feature for exactly this, [Stores, Fees & Payments](/books/gaming/stores-and-payments#receipt-validation-and-entitlement-grants) covers each store's checks, and [Accounts, Identity & Cross-Platform](/books/gaming/accounts-and-identity) covers which account a platform receipt belongs to.

Entitlements reach further than the store screen. Riot's 2016 post on the League client update describes a client built from plugins, where which plugins load depends on the player's entitlements, such as regional features and game access. Ownership decides what the client even contains, so it has to be right before anything else runs.

The core `entitlements` table in [The Games Business](/books/gaming/games-business#the-core-data-model) is a spine: an account, an item, a tenant and a creation time, with `tenant_id` on every row for a platform that serves many studios ([Multi-Tenancy](/docs/architecture/multi-tenancy)). This chapter adds where the right came from, how long it lasts, who granted it, and its revocation. Rows are never deleted: ownership at any moment is a query over grants and revocations, not a flag someone flipped.

```sql
ALTER TABLE entitlements
  ADD COLUMN source        TEXT NOT NULL CHECK (source IN ('purchase', 'platform', 'reward',
                             'grant', 'subscription')),
  ADD COLUMN source_ref    TEXT NOT NULL,       -- order id, store transaction id, match + drop slot, campaign + account
  ADD COLUMN granted_by    TEXT NOT NULL,       -- typed actor: 'system:store', 'agent:<id>', 'liveops:<campaign>'
  ADD COLUMN valid_during  TSTZRANGE NOT NULL,  -- unbounded for a purchase, bounded for a pass or rental
  ADD COLUMN revoked_at    TIMESTAMPTZ,
  ADD COLUMN revoke_reason TEXT CHECK (revoke_reason IN ('refund', 'chargeback', 'fraud',
                             'grant_error', 'support', 'merge')),
  ADD COLUMN revoked_by    TEXT,
  ADD COLUMN revoke_ref    TEXT,                -- the store's refund or void id, or the support ticket
  ADD CONSTRAINT entitlements_revocation_complete
    CHECK ((revoked_at IS NULL) = (revoke_reason IS NULL)),
  ADD CONSTRAINT entitlements_grant_once UNIQUE (account_id, item_id, source, source_ref);
```

The `source` values cover the list above: `purchase` for your own store, `platform` for a store receipt, `reward` for drops and play rewards, `grant` for promotions, support and migrations, and `subscription` for access that lasts a billing period. The unique constraint is what makes grants idempotent: a webhook delivered twice, a match result retried, a compensation script run again after a timeout all collide on the same `source_ref` and grant once ([Idempotency](/docs/payments/idempotency#idempotency-beyond-the-api)). Time-limited access (a rental, a trial weekend, a season pass) is the `valid_during` range, not a cron job that deletes rows ([Effective Dating & History](/docs/database/temporal-data)).

An entitlement's state is therefore derived, never stored: **live** while `revoked_at` is null and now falls inside `valid_during`, **expired** once the range has ended, **revoked** once a revocation is recorded. Every read of ownership, from the store page to the match loadout, uses the same predicate, which I keep in one view so no service invents its own. Where a right may be used is a separate column, `platform_scope`, added in [Accounts, Identity & Cross-Platform](/books/gaming/accounts-and-identity#how-to-build-it) because store agreements, not ownership, decide it. Moving a right between accounts, as an [account merge](/books/gaming/accounts-and-identity#merging) does, is a revocation with reason `merge` and a new grant whose `source_ref` is the merge, never an update of `account_id`.

## Definitions and Instances

Every item system separates what an item is from a particular copy of it. Steam calls the first kind item definitions, which "describe the possible set of items in your game"; every backend vendor has the same split under some name.

- An **item definition** is catalog data, a row in the core `items` table: the skin's name, its kind, whether copies are unique, whether it can be traded. The numbers designers tune around it (price, rarity, stats, which drop tables can produce it) are versioned, effective-dated content keyed by the item ([Rules as Data](/docs/architecture/rules-as-data)).
- An **item instance** is one copy held by one player profile: this sword, with its rolled stats, its durability, who crafted it, where it came from, and the date it becomes tradable.

The split decides what is cheap to change. A balance patch that changes every sword's damage changes one definition. A bug that rolled bad stats on ten thousand swords is ten thousand instance corrections, each with an audit row. Keep anything you might rebalance on the definition, and put on the instance only what genuinely differs between copies.

Items come in three shapes. **Rights** (a game, a DLC, most skins) are only ever entitlements: one player's copy is indistinguishable from another's, so there's nothing to store but the right. **Stackable** items (potions, crafting shards, keys) are interchangeable, so a profile holds a count, one instance row with a quantity. **Unique** items (a weapon with rolled stats, a card with a level, anything tradable with a history) are one instance row each, owned by a player profile because they live inside one game. When a copy came from a purchase, it points to the entitlement that paid for it, and revoking that entitlement destroys the copy in the same transaction.

```sql
ALTER TABLE items
  ADD COLUMN is_unique    BOOLEAN NOT NULL DEFAULT FALSE,  -- copies carry their own state
  ADD COLUMN max_stack    INTEGER,                         -- for items that aren't unique
  ADD COLUMN is_tradeable BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN trade_hold   INTERVAL,                        -- how long a new copy waits before it can trade
  ADD COLUMN is_durable   BOOLEAN NOT NULL DEFAULT TRUE;   -- kept, or used up when used; finance needs it

ALTER TABLE item_instances
  ADD COLUMN entitlement_id UUID REFERENCES entitlements (id),  -- the right that paid for it, if any
  ADD COLUMN quantity       INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  ADD COLUMN attributes     JSONB NOT NULL DEFAULT '{}',  -- rolled stats, wear, level
  ADD COLUMN source         TEXT NOT NULL,              -- 'purchase', 'reward', 'craft', 'trade', 'grant', 'merge'
  ADD COLUMN source_ref     TEXT NOT NULL,
  ADD COLUMN tradable_after TIMESTAMPTZ,
  ADD COLUMN destroyed_at   TIMESTAMPTZ,
  ADD COLUMN destroy_reason TEXT CHECK (destroy_reason IN ('consumed', 'crafted', 'revoked', 'expired')),
  ADD CONSTRAINT item_instances_destroy_complete
    CHECK ((destroyed_at IS NULL) = (destroy_reason IS NULL));
```

## Inventories

An **inventory** is what a player can use in one game: the account's live entitlements plus the profile's live instances, usually grouped into containers (a bag, a stash, a bank, a loadout per character). It's a projection, and the questions it answers are hot ones. Every match start reads loadouts; every store page reads ownership to hide what the player already has.

Riot's 2016 post on running online services shows the shape of one production inventory service, the Loot service behind League's Hextech Crafting: a Java application "serving Loot requests over an HTTP/JSON ReST API", deployed as 12 containers, in front of a cache cluster "using Memcached and a small golang sidecar" for monitoring, configuration and start/stop, and a MySQL cluster of one primary and several replicas holding the records. When a player opens the crafting screen, the service checks the cache for the player's inventory, reads holdings from the database on a miss and fills the cache. That's the pattern to copy: reads served from a cache keyed by account, writes going to the database of record in a transaction, and the cache invalidated (not patched) after each write ([Application Caching](/docs/architecture/application-caching)).

The hard part of an inventory is concurrent writes. A match server granting a drop, a store granting a purchase and a crafting call consuming three shards can all hit the same account in the same second. Each write is a transaction that locks or version-checks the rows it touches, and anything that consumes checks quantity inside the transaction, never from a value the client sent ([Transactions & Concurrency](/docs/database/transactions-and-concurrency)). Capacity limits (a bag holds 100 items) are checked in the same transaction; a grant that doesn't fit goes to an overflow container or a mailbox, never silently nowhere.

## Wallets Are Ledgers

Virtual currency is the part of an economy that most resembles money, so build it like money. A wallet with a `balance` column is the design the [Payments](/docs/payments/payment-states#double-entry-ledger) chapters warn against: a bug that credits gems without debiting anything leaves a wrong number nobody can explain. In a double-entry ledger, every movement is a transaction of entries that sum to zero, a wallet's balance is the sum of its entries, and a cached balance can always be rebuilt from them.

The accounts for one currency:

| Account | Holds |
| --- | --- |
| `player_paid` | Paid currency each player holds, bought with real money |
| `player_earned` | Earned currency each player holds, from play, rewards or promotions |
| `issued_paid` | The faucet for paid currency: every paid unit in existence was issued against a sale |
| `issued_earned` | The faucet for earned currency: every reward, drop and compensation grant |
| `consumed` | The sink: currency spent on items, crafting, fees, repairs, kept split by paid and earned |

Amounts are whole units of the currency, and the currency is explicit on every row, a code for each virtual currency (`GEMS`, `GOLD`), never mixed with ISO codes for real money ([Money & Amounts](/docs/payments/money#currency-is-always-explicit)). A virtual currency has no exchange rate to real money in the ledger: what a gem cost is a fact about the purchase that issued it, stored with that purchase, not a price on the gem.

The core model gives `wallets` (one per account and currency) and a bare, append-only `currency_ledger_entries`. This chapter adds the transaction that groups entries and the columns that make an entry mean something: the wallet, the signed amount and its currency, and two columns that place it in an account, `ledger_account` (player, issued or consumed) and `funding` (paid or earned), so `player_paid` is a player entry with paid funding. Player entries name the player's wallet; issued and consumed entries name a system wallet that each game holds per currency under a system account, so every entry names a wallet.

```sql
CREATE TABLE currency_ledger_transactions (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  game_id            UUID NOT NULL REFERENCES games (id),
  kind               TEXT NOT NULL CHECK (kind IN ('purchase', 'grant', 'reward', 'spend',
                       'craft', 'trade', 'refund', 'correction', 'merge')),
  source             TEXT NOT NULL,           -- 'order', 'platform_receipt', 'match', 'campaign', 'ticket'
  source_ref         TEXT NOT NULL,
  reverses_id        UUID REFERENCES currency_ledger_transactions (id),
  spend_rule_version INTEGER,                 -- which spend-order rule split paid and earned
  config_version     TEXT,                    -- which prices, rewards or costs applied
  actor              TEXT NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (game_id, kind, source, source_ref)
);

ALTER TABLE wallets
  ADD CONSTRAINT wallets_id_currency UNIQUE (id, currency);  -- lets entries pin the currency

ALTER TABLE currency_ledger_entries
  ADD COLUMN transaction_id UUID NOT NULL REFERENCES currency_ledger_transactions (id),
  ADD COLUMN wallet_id      UUID NOT NULL,
  ADD COLUMN currency       TEXT NOT NULL,       -- 'GEMS'
  ADD COLUMN delta_amount   BIGINT NOT NULL CHECK (delta_amount <> 0),  -- signed, whole units
  ADD COLUMN ledger_account TEXT NOT NULL CHECK (ledger_account IN ('player', 'issued', 'consumed')),
  ADD COLUMN funding        TEXT NOT NULL CHECK (funding IN ('paid', 'earned')),
  ADD CONSTRAINT currency_ledger_entries_wallet
    FOREIGN KEY (wallet_id, currency) REFERENCES wallets (id, currency);
```

A deferred constraint trigger rejects any transaction whose entries don't sum to zero per currency, and another rejects a spend that would take a player account below zero. The unique key on the transaction's source makes every posting idempotent, as in the payments ledger. Rows are never updated or deleted; a wrong grant is corrected by a reversing transaction that points at it, so the history shows both the mistake and the fix ([Append-Only Records](/docs/payments/payment-states#append-only-records)).

The drawing walks one wallet through a purchase, a reward, a spend and a refund. The refund is the instructive row: the player bought 1,000 paid gems, spent 400 of them, and then the store refunded the purchase. Clawing back 1,000 paid gems from a wallet holding 600 leaves it at minus 400 unless the same transaction also revokes what those gems bought.

![A dimensional drawing of one currency wallet. A plan view shows the wallet's paid and earned balances as stacked bars after four transactions: a purchase of 1000 paid gems, a grant of 200 earned gems, a spend of 600 that uses the earned gems first, and a refund that claws back the purchase and revokes the item, leaving 200 earned gems, with a hatched ghost showing the minus 400 a clawback alone would leave. Below, a ledger table lists every transaction's entries across five accounts, each row summing to zero, with a closing row, and a variable table that closes the paid and earned balances with formulas.](/diagrams/gm-economies-and-entitlements-ledger.svg "A wallet is the sum of its entries: every row nets to zero, and a refund that claws back currency the player already spent must revoke what it bought in the same transaction.")

### Spend Order

When a player holds both paid and earned units of the same currency, every spend has to decide which to use first, and the decision has consequences. Spending earned first (the drawing's policy) keeps paid currency, the part with a cash origin and refund rights, on the books longer. Spending paid first recognizes revenue sooner and leaves less to claw back. Some games split them into two visible currencies so the question never arises. Whatever the policy, it's a rule with a version, applied by the ledger and recorded on each spend, because finance, refunds and regulators will all ask what a given purchase was paid with.

My default is earned first, as in the drawing: a refund most often lands on paid units that are still unspent, so the clawback reverses currency instead of reaching for items. The spend itself is one ledger transaction whatever the split: lock the player's wallet row, compute the earned and paid balances from the entries, take earned up to the price and paid for the rest, and post a `consumed` entry for each part with its `funding`, refusing the whole spend if the sum falls short. Nothing about the split is left for a later job to work out. The paid part is also attributed to purchases first in, first out (each purchase is a lot, and a spend draws down the oldest lot with units left), so the unspent remainder of any one purchase is a query, which is what a refund or a 14-day withdrawal of unused currency needs ([Loot Boxes & Consumer Law](/books/gaming/consumer-law-and-loot-boxes#refund-rights)).

## Paid and Earned Currency Are Different Money

Paid and earned units can look identical to a player and still be different things in every system behind the screen:

- **Refunds** take back paid units only; nobody refunds a quest reward.
- **Accounting** treats paid currency as money received for something not yet delivered (next section). Earned currency has no cash behind it.
- **Consumer law** cares about the paid side: the FTC's HoYoverse order and the EU's virtual currency principles both turn on the real-money cost of what a player buys, which only the paid side carries ([Loot Boxes & Consumer Law](/books/gaming/consumer-law-and-loot-boxes#pricing-virtual-currency-honestly)).
- **Regional rules** can differ for each. Store them apart and any rule can apply to one without a migration.
- **Cash-out** applies only to a creator's earned currency on platforms that let creators convert it to money, and turns that balance into a payable ([Cash-Out](/books/gaming/creator-economies#cash-out)).

So the ledger keeps them in separate accounts even when the client shows one number. The purchase that issued paid units links to the payment record (amount, currency, store, receipt), so for any paid unit you can find what was paid for it.

## Accounting for Virtual Currency

Selling virtual currency doesn't produce revenue on the day of the sale; the player has paid for something not yet delivered. The general rule (cash is not revenue, performance obligations, breakage, recognition schedules) is in [Accounting & Revenue Recognition](/docs/payments/accounting#cash-is-not-revenue). Roblox's FY2025 10-K is the clearest public example for a game: bookings are "initially recorded in deferred revenue" and recognized over the period the items are available, and for durable items that period is the "estimated average lifetime of a paying user, which was 27 months as of December 31, 2025". One more detail from the same filing matters to the system: Roblox reassesses that estimate every quarter, and the filing records a change from 28 months to 27. The estimate moves; the facts underneath it must not.

I'm not your accountant, and the right treatment for your game is your finance team's and auditor's call. The engineering consequence holds regardless: the ledger keeps the facts any such policy needs, so finance can recompute under this quarter's estimate. For every spend that means the paid and earned split (the `funding` on its `consumed` entries), whether the item bought is durable or used up (`is_durable` on the item), the time, and the purchase each paid unit traces back to. For every purchase it means the amount, currency, store and the store's fee, which [Stores, Fees & Payments](/books/gaming/stores-and-payments) records. With those, any deferral schedule can be rebuilt for any past quarter; without them, none can.

## Sources and Sinks

An economy is a set of **sources** (faucets that create currency and items: match rewards, quests, drops, purchases, compensation) and **sinks** (drains that remove them: store spends, crafting costs, repair, fees, item consumption). When sources outrun sinks, currency piles up, prices in any player market climb, and rewards stop feeling like rewards. When sinks outrun sources, the game feels stingy and players pay or leave.

The ledger is the instrument that measures this, which is a reason in itself to build one. The `issued_earned` account is the meter on every faucet and `consumed` on every sink, broken down by the transaction's `source` and `kind`. Net issuance for a day is the sum of issuance minus consumption; the money supply is the sum of the player accounts. Both are queries over append-only rows, so they're exact and can be recomputed for any past day, and they feed the dashboards in [Game Metrics](/books/gaming/game-metrics).

The levers live in configuration: reward amounts, drop rates, crafting costs and prices are data with versions and effective dates, changed through the same paths as any other server-side tuning ([Live Operations](/books/gaming/live-operations)). Each ledger transaction records the configuration version that priced it, so when someone asks why issuance doubled on a Tuesday, the answer is a diff.

## Crafting and Loot

Crafting is an exchange: consume inputs, produce outputs. Done right it's one transaction that debits the inputs (items, shards, currency) and creates the outputs, all or nothing. A crafting call that consumes shards, then crashes before granting the skin, is a support ticket; one that grants the skin and fails to consume the shards is a duplication exploit, and duplication exploits get found and shared fast.

Random outputs (a chest, a pack, a crafted item with rolled stats) add three requirements:

- **The server rolls.** The client asks; the server draws from the drop table and records the result. A client-side roll is a client-side grant.
- **The table is versioned data.** A drop table is a definition with weights, guarantees ("pity" counters that force a rare drop after N misses) and a validity range, and a published version never changes. The tables themselves (`drop_tables`, `drop_table_versions` with integer weights in `drop_table_entries`) are defined in [Loot Boxes & Consumer Law](/books/gaming/consumer-law-and-loot-boxes#odds-as-data), because published odds have to be versioned. Every roll records the table version, the draw and the outcome.
- **The odds you disclose are the odds you run.** Both mobile stores and several countries require odds disclosed before purchase, and China requires them to be true ([Store Odds Rules](/books/gaming/consumer-law-and-loot-boxes#store-odds-rules), [The Rules by Jurisdiction](/books/gaming/consumer-law-and-loot-boxes#the-rules-by-jurisdiction)). Recording the table version on every roll is how you show that what you published is what ran, and comparing observed rates to configured weights is a test you run continuously.

One table records every roll, whether a paid loot box, an earned chest or a craft with rolled stats, and links it to the table version it drew from and to what it granted:

```sql
CREATE TABLE item_rolls (                   -- one roll, reproducible from its inputs
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id             UUID NOT NULL,
  player_profile_id     UUID NOT NULL REFERENCES player_profiles (id),
  drop_table_version_id UUID NOT NULL REFERENCES drop_table_versions (id),
  roll                  INTEGER NOT NULL,   -- the drawn value in [0, total_weight)
  pity_count_before     INTEGER NOT NULL,   -- pulls since the last top-tier result
  is_pity_triggered     BOOLEAN NOT NULL,
  entry_id              UUID NOT NULL REFERENCES drop_table_entries (id),     -- what it produced
  paid_with             TEXT NOT NULL CHECK (paid_with IN ('money', 'currency', 'earned')),
  payment_ref           TEXT,               -- store order, when paid with money
  ledger_transaction_id UUID REFERENCES currency_ledger_transactions (id),  -- the spend, if any
  entitlement_id        UUID REFERENCES entitlements (id),     -- set when the result is a right
  item_instance_id      UUID REFERENCES item_instances (id),   -- set when it's a copy
  idempotency_key       TEXT NOT NULL,
  rolled_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (player_profile_id, idempotency_key)
);
```

## Trading and Real-Money Markets

Trading moves instances between accounts, and every trade is a chance to move value that shouldn't move. A trade is one transaction that checks both sides still own what they're offering, checks every item is tradable now (`tradable_after` has passed, the definition allows it), transfers ownership and records the counterparty on both instances. Items in an open trade are escrowed so they can't be spent, crafted or traded twice.

The risks come from outside the game:

- **Stolen payment methods.** A fraudster buys items with a stolen card, trades them to a clean account and sells them; the chargeback arrives weeks later against an account that no longer holds anything. Valve's guidance is a hold of at least 72 hours before newly purchased items can be traded or gifted ([Stores, Fees & Payments](/books/gaming/stores-and-payments#steam)), which `trade_hold` on the item and `tradable_after` on the copy enforce, and Steam reserves Trusted account status for accounts with a transaction more than 90 days old and no chargebacks.
- **Account theft.** Stolen accounts are emptied through trades. Holds after a password or email change, new-device trade delays and velocity limits all buy time for the owner to notice ([Authentication](/docs/security/authentication)). Valve added a second mechanism for Counter-Strike 2 in July 2025: items received in a trade are "Trade Protected" for a period, and a player "may reverse all Counter-Strike item trades from the last 7 days" from their trade history. A reversible trade needs the instance's chain of owners and an escrow-like state on the received copy (usable, but not tradable, sellable or consumable until protection ends), so the reversal can return exactly what moved.
- **Real-money trading.** Once items can be traded, third-party markets will price them in real money, whatever your terms say. Roblox's filing states that Robux have no authorized market outside its platform; a terms line like that is a legal position, not a control. Gold farming, bots and laundering follow the money ([Anti-Cheat](/books/gaming/anti-cheat)).
- **Gambling law.** Tradable items with real-money value change how regulators look at random rewards. Belgium's Gaming Commission examined CS:GO among the games in its 2018 loot box report and concluded that the paid loot boxes it examined were illegal. Whether items can leave an account is a legal question as much as a design one.
- **Skin gambling.** Tradable cosmetics become stakes on third-party sites. In July 2016 Valve said gambling sites were "using the OpenID API as a way for users to prove ownership of their Steam accounts and items," in breach of its API and user agreements, and that it would send notices "requesting they cease operations through Steam." In February 2017 the UK Gambling Commission secured convictions against the operators of FUTGalaxy, a site that let players gamble FIFA Ultimate Team coins, for providing unlicensed gambling facilities, with £265,000 in fines and costs between the two directors. If your items have a price, someone will run a casino on them, and your sign-in and trading APIs are its plumbing: watch for accounts that receive and send items at volumes no player does.
- **Blockchain items.** Selling items as tokens on a public chain puts them on an external market by design. Steam's onboarding rules list "applications built on blockchain technology that issue or allow exchange of cryptocurrencies or NFTs" among what can't be published on Steam (added in October 2021). Ubisoft's Quartz launched NFT "Digits" for Ghost Recon Breakpoint in December 2021; the last Breakpoint Digit came in March 2022 and no further Digits were released. A store ban plus a market that didn't come is a reason to keep ownership in your own ledger.

Every trade writes provenance: each instance carries its chain of owners, so when a fraudulent purchase is found, you can follow where its items went and decide how far to unwind. Treat trades as payments-grade events, with the scoring and review that [Fraud & Risk](/books/payments/fraud-and-risk) describes.

## Refunds, Chargebacks and Clawbacks

Money comes back out of a game's economy through refunds (the store or you agree to return it), chargebacks (the cardholder's bank forces it) and platform voids. Each store's policy and notification channel is in [Stores, Fees & Payments](/books/gaming/stores-and-payments#refunds-and-chargebacks), and card chargebacks, which can arrive months after the purchase, are in [Disputes & Chargebacks](/books/payments/disputes-and-chargebacks). They arrive differently and must all land the same way. Google Play's voided-purchase notification shows why the landing needs care: its `refundType` is either a full refund or a quantity-based partial refund of a multi-quantity purchase, and one purchase can be partially voided several times.

The clawback is an algorithm, and it has to be the same whatever the trigger:

1. **Find the grant.** The refund or void carries the store's transaction id; the entitlement and ledger transaction carry the same id as `source_ref`. Without that link, a refund can't be applied to anything.
2. **Reverse it.** Revoke the entitlement and destroy its copies, or post a reversing ledger transaction that points at the purchase through `reverses_id`. For a partial refund, reverse that quantity, and track the remaining refundable quantity so a later partial void can't reverse more than was bought.
3. **Handle what's already gone.** If the currency was spent, apply the game's published policy: revoke what it bought (the drawing's choice), let the paid balance go negative so the next purchase repays it, or absorb the loss and record a write-off. If items were traded away, follow provenance and decide whether to unwind the trade or write off the loss. My default order is: revoke what the refunded currency bought, starting with the most recent spends; let the paid balance go negative only for the remainder that can't be revoked (an item already consumed); and never unwind a trade from an innocent counterparty, writing that loss off instead.
4. **Record the decision** with the refund, the policy version and the actor, in the same database transaction as the reversal.

What a clawback must never do is lock the account for having disputed ([The FTC's Orders](/books/gaming/consumer-law-and-loot-boxes#the-ftc-s-orders)): it takes back what the disputed money paid for, and abuse goes through the penalty system like any other violation, never as a side effect of a refund. The finance side, deferred revenue reversed and the write-off booked, is in [Accounting for Virtual Currency](#accounting-for-virtual-currency).

## Auditing

Every grant, revocation, spend, craft and trade is already a ledger or entitlement row with an actor, a source and a reason, which covers most of an audit trail by construction. What's left is the human side ([Audit Trails](/docs/architecture/audit-trails)):

- **Support grants** carry the agent, the ticket, the reason and the approver, and agents have limits (per grant, per day, per account) above which a second person approves ([Support Access](/docs/security/support-access); [Player Support](/books/gaming/player-support)).
- **Live-ops grants** (compensation after an outage, an event reward to everyone who logged in) run as campaigns: a reviewed definition, a dry run that counts affected accounts and total issuance, and grants keyed by campaign and account so a rerun grants nothing twice. Compensation at scale happens; Square Enix gave players seven days of compensation after Final Fantasy XIV's December 2021 login congestion.
- **Corrections** are reversing transactions with a reason, never edits ([Amend, Don't Overwrite](/docs/architecture/audit-trails#amend-don-t-overwrite)).
- **Reconciliation** runs daily: every platform report against your grants (Steam's daily `GetReport()`, Google's voided purchases), every cached balance against the sum of its entries, every ledger transaction's entries against zero. A break becomes a tracked record with an owner, as in [Payments](/docs/payments/payment-states#reconciliation).

## What This Means for the System You Build

- **Entitlements as never-deleted grants** with a source, a unique `source_ref` and a typed actor, revocations recorded with their cause, and time-limited access as `valid_during` ranges.
- **Server-side grants only,** with every platform receipt validated against the platform before anything is granted.
- **Rights, stacks and unique copies modeled differently,** tunable numbers as versioned content, and copies pointing to the entitlement that paid for them.
- **Inventory reads from a cache, writes in transactions** that check quantity, capacity and ownership inside the transaction.
- **Every virtual currency as a double-entry ledger** with paid and earned accounts kept apart, faucet and sink accounts that measure the economy, idempotent postings and a versioned spend-order rule.
- **The facts finance needs** on every spend and purchase: paid split, consumable or durable, and the purchase each paid unit came from.
- **Server-rolled randomness** with drop tables as versioned data and every roll recorded against the odds you disclosed.
- **Trades as escrowed, atomic, provenance-writing transactions** behind holds and velocity limits.
- **One clawback algorithm** for refunds, voids and chargebacks, with a recorded policy for spent currency and traded items, and never an account lock as a side effect.
- **Daily reconciliation** against every store and against the ledger's own invariants, plus audited, limited support and campaign grants.

## References

**Specifications**

- [Android Developers: Real-time developer notifications reference](https://developer.android.com/google/play/billing/rtdn-reference), full and quantity-based partial voids, and calling the Developer API after each notification

**Reference**

- [Steamworks: Steam Inventory Service](https://partner.steamgames.com/doc/features/inventory), item definitions, playtime drops, untrusted clients and server-only explicit grants
- [Steamworks: Microtransactions](https://partner.steamgames.com/doc/features/microtransactions), daily `GetReport()` reconciliation, the 72-hour trade hold and Trusted status
- [Microsoft Learn: What is PlayFab](https://learn.microsoft.com/en-us/gaming/playfab/what-is-playfab), catalog, virtual currencies, drop tables and server-side receipt validation as backend features
- [Roblox: Annual report on Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1315098/000131509826000024/rblx-20251231.htm), bookings in deferred revenue, the 27-month paying-user life and its quarterly reassessment (28 to 27 months), and Robux having no authorized outside market

**In practice**

- [Riot Games: Running Online Services at Riot, Part I](https://www.riotgames.com/en/news/running-online-services-riot-part-i), the Loot service behind Hextech Crafting: Java REST service, Memcached with a Go sidecar, MySQL with replicas
- [Riot Games: The Architecture of the League Client Update](https://www.riotgames.com/en/news/architecture-league-client-update), client plugins loaded according to the player's entitlements
- [FTC: Genshin Impact game developer will be banned from selling lootboxes to teens under 16 without parental consent](https://www.ftc.gov/news-events/news/press-releases/2025/01/genshin-impact-game-developer-will-be-banned-selling-lootboxes-teens-under-16-without-parental), the order's disclosure of odds and multi-tiered currency exchange rates and a direct real-money option
- [Norwegian Consumer Authority: Action on harmful practices in the gaming industry](https://www.forbrukertilsynet.no/eng-articles/national-consumer-authorities-and-commission-take-action-on-harmful-practices-in-the-gaming-industry), the 2025 consumer principles on in-game virtual currencies
- [Belgian Gaming Commission: Research Report on Loot Boxes (English translation)](https://www.skadden.com/-/media/files/publications/2019/08/video-gaming-egaming-law-update/fn12_onderzoeksrapportlootboxenengelspublicatie.pdf), the 2018 report that examined four games and found their paid loot boxes illegal
- [Counter-Strike 2: Season Two, Episode One](https://steamcommunity.com/ogg/730/announcements/detail/529852487375519752), Trade Protected items and reversing trades from the last 7 days (July 2025)
- [Steam: In-Game Item Trading Update](https://store.steampowered.com/news/22883/), Valve's notices to gambling sites using Steam OpenID (July 2016)
- [UK Gambling Commission: Two men convicted after offering illegal gambling](https://www.gamblingcommission.gov.uk/news/article/two-men-convicted-after-offering-illegal-gambling-parasitic-upon-popular), the FUTGalaxy prosecution and fines (February 2017)
- [Steamworks: Onboarding](https://partner.steamgames.com/doc/gettingstarted/onboarding), what can't be published on Steam, including blockchain applications that issue or exchange cryptocurrencies or NFTs
- [Decrypt: Ubisoft ends Ghost Recon NFT support](https://decrypt.co/97090/ubisoft-tezos-nfts-other-games-ghost-recon-support-ends), the last Breakpoint Digit in March 2022 and no further drops
- [Square Enix: Ongoing congestion situation and compensation](https://na.finalfantasyxiv.com/lodestone/news/detail/1c59de837cc84285ad1cdb4c9a9cad782363f25b), seven days of compensation after login congestion
