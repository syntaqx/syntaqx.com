+++
title = "Monetization Models"
description = "Premium, DLC, free-to-play, battle passes, subscriptions, ads and personalized shops: what each model sells, what it obliges you to keep, and what it builds."
category = "Gaming Industry"
order = 1620
part = "Money"
tags = ["gaming", "monetization", "free-to-play", "subscriptions", "virtual-currency", "personalization"]
+++

A monetization model reads like a business decision, and it is one, but it's also the largest single input to the backend. It decides what a player can own, how long you owe it to them, what happens when a payment is reversed, which regulators care, and which numbers the studio watches every morning. A premium game sells one license and owes it forever. A free-to-play game sells thousands of small things, each of which has to be granted exactly once, shown at an honest price and taken back cleanly when the money goes away. Most live games now run several models at once: a paid base game, expansions, a currency, a seasonal pass and a subscription, all landing in the same account.

This chapter covers the models and what each one builds: premium and DLC, items and currency, battle passes, subscriptions, ads, the revenue funnel and personalized shops, with the tables for passes, offers and prices. The store side (fees, billing rules, refunds, receipts) is in [Stores, Fees & Payments](/books/gaming/stores-and-payments); the ledgers and inventories underneath are in [Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements); the law on random items and selling to children is in [Loot Boxes & Consumer Law](/books/gaming/consumer-law-and-loot-boxes) and [Ratings, Age & Children](/books/gaming/ratings-and-age).

## The Models at a Glance

| Model | What the player pays for | What you owe afterward | Systems it needs |
| --- | --- | --- | --- |
| Premium | A license to the game | Access for as long as the account exists | Entitlement per account, per platform; refunds |
| DLC and expansions | Added content, sometimes bundled as a season pass | Access, plus any content the pass promised | Entitlements that depend on the base game; future grants |
| Free-to-play items | Cosmetics, boosts, convenience | Durable items forever; consumables until used | Catalog, offers, inventory, idempotent grants |
| Virtual currency | A balance spent on items | The balance, and a clear price in money | Wallet and ledger; currency packs; exchange-rate disclosure |
| Battle pass | A time-limited reward track | Rewards earned on the track | Seasons, tiers, progress, retroactive grants |
| Subscription | Access or benefits for a period | Benefits for the period paid | Entitlements with validity ranges; renewal state |
| Ads | Nothing; the advertiser pays | The promised reward for a watched ad | Ad SDK, server-side reward verification |

The market figures, by segment and revenue stream, are in [How Big It Is](/books/gaming/games-business#how-big-it-is). The point for a system designer isn't the totals, it's the mix: a studio that ships on PC and console in 2026 sells boxes, items and subscription access side by side, and the backend has to treat all three as one ownership record.

The ESRB's "In-Game Purchases" label gives a useful public taxonomy of what gets sold: "bonus levels, skins, music, virtual coins and other forms of in-game currency", "subscriptions, season passes and upgrades (e.g., to disable ads)". The ESRB's labels disclose without changing the age rating, while PEGI's 2026 criteria change the age ([Ratings, Age & Children](/books/gaming/ratings-and-age#pegi)).

## Premium and Paid Upfront

A premium game is the simplest model to build and the hardest to get exactly right across platforms. The player pays once, and you owe them access for as long as the account exists. The license usually lives at the store: Steam, PlayStation, Xbox and the mobile stores each record that the player owns the game, and your backend learns it by asking the store (or by the store launching the game with a ticket that says so). You own the mapping from a store's product to your entitlement, and you own whatever the player keeps across platforms, which is a policy decision per platform holder ([Accounts, Identity & Cross-Platform](/books/gaming/accounts-and-identity) covers linking).

Editions are bundles of entitlements, not separate games. A deluxe edition is the base license plus a cosmetic pack plus early access, so model it as a product that grants three entitlements, each of which can also be sold on its own. If you model "deluxe" as a flag on the account, the first time you sell the cosmetic pack separately you'll have two ways to own the same thing and two ways to refund it.

Refund windows shape the premium launch. Steam and PlayStation both give buyers 14 days, limited by playtime on Steam and by starting the download on PlayStation ([Stores, Fees & Payments](/books/gaming/stores-and-payments#refunds-and-chargebacks) has each store's rules and how you learn of a refund). A short game, or one whose value is front-loaded, meets those windows head-on, and the refund arrives as a revocation your backend has to process.

## DLC, Expansions and Season Passes

Downloadable content is a second purchase that depends on the first. An expansion is useless without the base game, so the entitlement check is a conjunction: the account owns both, on this platform, now. Steam's refund rule shows the dependency from the store's side: DLC is refundable within 14 days of purchase if the base game has been played for less than two hours since the DLC was bought and the DLC hasn't been consumed, modified or transferred, and some third-party DLC is non-refundable, which Steam marks on the store page before purchase.

A season pass, in the original sense, is a pre-purchase of DLC that doesn't exist yet. It's a promise, and the system has to keep it: when each piece of content ships, every pass holder needs the matching entitlement, including players who bought the pass two years earlier on a platform you've since stopped patching. Model the pass as an entitlement to a list of future products, and grant each product by a job that walks pass holders when the content releases ([Background Jobs](/docs/architecture/background-jobs)), not by checking "has pass" at every content gate. A content check that consults the pass directly works until the day you sell the same expansion on its own, and then two code paths decide ownership.

## Free-to-Play, Items and Currency

Free-to-play moves the price from the door to the catalog. The game is free; revenue comes from a small share of players buying items, and in competitive games often limited to cosmetics so that money doesn't decide matches. The system that results is a store inside the game: a catalog of items, offers that put items on sale at a price for a period, an inventory per account, and a grant path that runs once per purchase no matter how many times the client retries.

Two kinds of item behave differently. A **durable** item (a skin, a character, an emote) is owned for good and has to survive refunds of unrelated purchases, account merges and platform moves. A **consumable** (a boost, a currency pack, a reroll) is used up, which makes it refundable only until it's consumed and makes "was it used" a fact you have to record. Apple names the same split in its In-App Purchase types: consumable, non-consumable, auto-renewable subscription and non-renewing subscription.

### Virtual Currency

Most free-to-play games sell a currency rather than items directly: the player buys a pack of coins for money, then spends coins on items. A currency smooths regional pricing (one coin price per item, many money prices per pack), lets the game grant currency for play, and makes small purchases possible on stores with high fixed costs. It also hides the real price, and that's where regulators have stepped in.

Apple's App Review Guideline 3.1.1 requires in-app purchase for in-game currencies on the App Store and says "Any credits or in-game currencies purchased via in-app purchase may not expire." Beyond the stores, the FTC's 2025 order against HoYoverse and the EU consumer authorities' 2025 principles on virtual currencies both target the hidden price: exchange rates disclosed, real-money prices shown, no chains of currencies and no packs that force a leftover ([Loot Boxes & Consumer Law](/books/gaming/consumer-law-and-loot-boxes#pricing-virtual-currency-honestly) has both, and a currency design that passes them).

Those rules shape the data. Every item price in currency needs a money equivalent you can show, every pack needs a published rate, and pack sizes that always leave an unspendable remainder become a pattern a regulator can point at. My rule: a player should be able to see what an item costs in their own money before they confirm, and buy exactly what they need without stranding a balance.

Currency is also a liability on the books. A player who buys coins has paid for something they haven't received yet. Roblox's FY2025 10-K shows how one large platform accounts for it: bookings are "initially recorded in deferred revenue" and recognized over the period the items are available, and for durable items that period is the "estimated average lifetime of a paying user, which was 27 months as of December 31, 2025". Your finance team will ask the backend for exactly the data that estimate needs: what was bought, when, whether it was durable or consumable, and when it was used. The double-entry ledger that records it is in [Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements); amounts follow [Money](/docs/payments/money).

## Battle Passes

A battle pass is a time-limited reward track. Players earn progress by playing; each tier of the track unlocks a reward; a free lane is open to everyone and a premium lane opens when the player buys the pass, usually with currency; the track ends when the season does. No platform or regulator page I can cite defines the battle pass, and no public source I've opened gives conversion or completion figures for one, so this section describes the mechanism and the rules that now touch it, not benchmarks.

PEGI's criteria for games submitted from June 2026 reach battle-pass design directly: time-limited offers and rewards for returning to the game both raise the age rating, and a pass with daily challenges that expire is both ([Ratings, Age & Children](/books/gaming/ratings-and-age#pegi) has the levels). The pass's design is a rating input, so its features go through the build check in [Ratings as Data](/books/gaming/ratings-and-age#ratings-as-data).

The mechanism, as you'd build it:

- **A season** has a validity range, a track of tiers, and a progress threshold per tier. Thresholds and rewards are data, versioned per season ([Rules as Data](/docs/architecture/rules-as-data)), because live operations will tune them mid-season ([Live Operations](/books/gaming/live-operations)).
- **Progress** is per account per season, fed by match results and challenge completions through events ([Events](/docs/architecture/events)), never by the client. Each award is a row keyed by what earned it and the account's points are their sum (cached on `pass_progress`), the same balances-are-sums rule as the wallet, so a redelivered `match.completed` adds nothing.
- **Upgrading mid-season grants retroactively**: a player at tier 30 who buys the premium lane is owed premium rewards for tiers 1 through 30 at once. That's a batch of grants that has to be idempotent as a set.
- **The end of a season** freezes progress and closes the track. What happens to unclaimed rewards is a policy you publish, not a side effect of a deleted row.

```sql
-- Seasons and tiers are per game; a platform that runs passes for many
-- games (or studios) carries tenant_id on every table.
CREATE TABLE pass_seasons (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  game_id       UUID NOT NULL REFERENCES games (id),
  name          TEXT NOT NULL,
  valid_during  TSTZRANGE NOT NULL,                 -- [start, end)
  premium_offer_id UUID REFERENCES offers (id),     -- how the premium lane is sold (offers: below)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pass_tiers (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  season_id      UUID NOT NULL REFERENCES pass_seasons (id),
  tier_number    SMALLINT NOT NULL,
  lane           TEXT NOT NULL CHECK (lane IN ('free', 'premium')),
  progress_required INTEGER NOT NULL,               -- cumulative points to reach the tier
  item_id        UUID NOT NULL REFERENCES items (id),
  quantity       INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT pass_tiers_season_tier_lane_key UNIQUE (season_id, tier_number, lane)
);

CREATE TABLE pass_progress (
  tenant_id      UUID NOT NULL,
  season_id      UUID NOT NULL REFERENCES pass_seasons (id),
  account_id     UUID NOT NULL REFERENCES accounts (id),
  points         INTEGER NOT NULL DEFAULT 0,
  is_premium     BOOLEAN NOT NULL DEFAULT FALSE,
  premium_at     TIMESTAMPTZ,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (season_id, account_id)
);

CREATE TABLE pass_progress_awards (               -- append-only; points are their sum
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  season_id      UUID NOT NULL REFERENCES pass_seasons (id),
  account_id     UUID NOT NULL REFERENCES accounts (id),
  points         INTEGER NOT NULL CHECK (points > 0),
  source_ref     TEXT NOT NULL,                     -- 'match:<id>', 'challenge:<id>:<day>'
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (season_id, account_id, source_ref)
);
```

Rewards are entitlements with `source = 'reward'` and a `source_ref` of `pass:<season>:<tier>:<lane>`, so the `entitlements_grant_once` constraint from [Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements#entitlements-are-the-source-of-truth) turns a retry into a no-op; a currency reward is a ledger transaction keyed the same way ([Idempotency](/docs/payments/idempotency) covers the pattern). One statement then serves every trigger (a new award, an upgrade, a replayed job), run in the same database transaction that changes the progress:

```sql
-- Grant every reached tier the account is owed, once.
INSERT INTO entitlements (tenant_id, account_id, item_id, source, source_ref,
                          granted_by, valid_during)
SELECT t.tenant_id, p.account_id, t.item_id, 'reward',
       'pass:' || t.season_id || ':' || t.tier_number || ':' || t.lane,
       'system:pass', tstzrange(NOW(), NULL)
FROM pass_progress p
JOIN pass_tiers t ON t.season_id = p.season_id
WHERE p.season_id = $1 AND p.account_id = $2
  AND t.progress_required <= p.points
  AND (t.lane = 'free' OR p.is_premium)
ON CONFLICT ON CONSTRAINT entitlements_grant_once DO NOTHING;
```

My default is to grant a tier the moment it's reached rather than make players claim it, because a claim step is what creates unclaimed rewards at the end of a season. A game that wants the claim moment for its feel can keep it as presentation: the grant exists, and claiming only marks it seen.

## Subscriptions

Subscriptions come in two shapes in games. **Platform subscriptions** sell access to a library or to online play, such as Game Pass and PlayStation Plus ([The Games Business](/books/gaming/games-business#five-ways-games-make-money) lists Game Pass's tiers). A game in a library subscription gets its revenue from the platform holder under terms that aren't public, and its players arrive holding an entitlement that ends when their subscription does. **In-game subscriptions** sell a benefit for a period: a monthly currency stipend, a premium membership, a VIP lane.

Either way, the entitlement has a validity range, not a flag: each paid period is an entitlement with `source = 'subscription'`, `valid_during` set to the period and the store's renewal transaction as its `source_ref`, so a renewal is a new row and a lapse is the absence of one. A subscription benefit that's granted "while active" has to answer what the player keeps when the period ends: items granted during the period usually stay, access usually doesn't. Store rules apply on mobile: Apple requires an auto-renewable subscription period to "last at least seven days" (Guideline 3.1.2(a)), and pays 70% of the price in a subscriber's first year and 85% after a year of paid service. Subscription state machines, renewal jobs, dunning and the automatic-renewal laws are in [Subscriptions](/docs/payments/subscriptions), and store-billed subscriptions in [App Store Subscriptions](/docs/payments/subscriptions#app-store-subscriptions).

## Ads in Mobile Games

Mobile free-to-play games often earn from advertising as well as purchases. The form that fits games best is the rewarded ad, which Google's AdMob defines this way: "Rewarded ads allow you to reward users with in-app items for interacting with video ads, playable ads, and surveys." The reward is a grant like any other, and it has the same trust problem: a client that says "I watched the ad, give me 50 coins" can be replayed. AdMob's answer is server-side verification, a callback from the ad network to your server, with a `custom_data` value your app sets before showing the ad. Grant on the callback, as a ledger transaction of kind `reward` whose `source_ref` is the callback's transaction, not on the client's word.

Ads change who the game is for, in law. The FTC's 2025 amendments to the COPPA Rule require separate verifiable parental consent before a child's data is disclosed to third parties, including for targeted advertising, and the EU's Digital Services Act Article 28 bars ads based on profiling on online platforms when the provider is aware with reasonable certainty that the user is a minor. Selling ad removal (one of the ESRB's examples of an in-game purchase) is a durable entitlement that every ad call site has to check. [Ratings, Age & Children](/books/gaming/ratings-and-age) covers the age side.

The metrics split here too: GameAnalytics defines ARPDAU as "The IAP revenue sum divided by all daily active user count", while Unity's legacy analytics glossary counts Unity Ads revenue as well as verified purchases. A dashboard that mixes the two definitions compares different things ([Game Metrics](/books/gaming/game-metrics#revenue-arpdau-arppu-conversion-and-ltv) names the revenue measure in each definition).

## The Funnel in Numbers

Every model reduces to a few numbers per period: how many players were active, what share of them paid, how much each payer spent, and what the store kept. The sheet below runs one month for an illustrative free-to-play game. None of the values are benchmarks; they're there so the formulas close.

![Dimensional drawing of a month of free-to-play revenue: a bar of one million monthly active players with the 3 percent who pay highlighted, and a detail bar splitting their bookings into a store fee and net revenue, with a variable table and notes.](/diagrams/gm-monetization-funnel.svg "Most players never pay, so revenue is a thin slice of the audience times what each payer spends, less the store's share (illustrative values).")

The same codes, as definitions you can compute. The definitions of active players, conversion, ARPU and ARPPU are the ones in [Game Metrics](/books/gaming/game-metrics#revenue-arpdau-arppu-conversion-and-ltv); this sheet computes ARPU and ARPPU on **gross bookings**, not on net revenue, because it stops before refunds and is about what players spend:

| Code | Meaning | Formula | Illustrative value |
| --- | --- | --- | --- |
| M1 | Monthly active players | Distinct accounts active in the calendar month | 1,000,000 |
| C1 | Payer conversion (monthly) | P1 / M1 | 3.0% |
| P1 | Paying players | Accounts with at least one purchase in the month | 30,000 |
| A1 | ARPPU on gross bookings | B1 / P1 | $20.00 |
| B1 | Gross bookings | Sum of purchase prices, before tax | $600,000 |
| S1 | Store fee | B1 × store rate (30% here) | $180,000 |
| N1 | Net to developer | B1 - S1 | $420,000 |
| R1 | ARPU on gross bookings | B1 / M1 | $0.60 |

ARPU on net revenue for the same month would divide the net measure its definition names (N1 less refunds and chargebacks, say) by M1, and the two are never charted under one name. GameAnalytics computes metrics "within UTC dates/hours" and defines conversion as the "Percentage of daily active users who made a purchase reported per day"; C1 is monthly conversion, a different number from the average of daily ones, so name the window in every metric. Bookings are not revenue: the Roblox filing above is the example of bookings deferred and recognized over months. And the store's share varies by store and program, from 12% to 30% on the stores in [Stores, Fees & Payments](/books/gaming/stores-and-payments), so S1 is a weighted sum across stores, not one rate.

## Personalized Shops

A shop that shows every player the same items wastes most of its space: a player sees skins for characters they never play. Riot's public engineering post "Stocking Your Shop With Data Science" (30 April 2019, Riley Howsden) describes the alternative it built for League of Legends. Your Shop "creates personalized offers for every player around the globe", generating "the top-N recommendations for each player" with collaborative filtering:

- **Neighborhood methods** compare players or items by cosine similarity, which is cheap, though the post says "the quality of these recommendations is usually lower."
- **Matrix factorization** handles the sparse player-by-item matrix and widens coverage.
- **Sparse linear models (SLIM)**, the newest approach in the post, train a regularized item-to-item regression.

The data problems are the ones any game will meet. Ownership and play are implicit signals, not ratings. Random acquisition muddies them: Hextech loot and the random champion selection in ARAM mean owning or playing something says less about wanting it. Skins sit under champions, so the model has to separate the two levels. Players with little history get a default set. The post describes the scale: distributed algorithms on Apache Spark with clusters managed by Databricks, and offer generation taking "approximately 1000 compute hours", described as 50 machines for 20 hours each. Offers are generated a few days ahead so metrics can be checked first, then stored and uploaded to regional services. The team evaluates offline on conversion rate and accuracy first, then coverage, novelty and serendipity.

How you'd build one, from that shape:

1. **Candidates**: a batch job scores items per account from ownership and play history, offline, ahead of the rotation.
2. **Eligibility**: hard filters run after scoring, never inside the model. Remove items the account owns, items not sold in the player's region, items behind a rating or age gate, and items a parental control has blocked.
3. **Pricing**: a discount, if any, comes from rules attached to the offer (a fixed set of discount levels, say), stored as data and the same for every player who sees that item at that discount.
4. **Persistence**: the chosen offers are written per account per rotation, so the shop is stable across sessions and devices and support can see exactly what the player was shown.
5. **Exposure logging**: every impression and purchase goes to telemetry with the model version, which is what makes the offline metrics checkable later ([Telemetry & Analytics](/books/gaming/telemetry)).

My rule: personalize which items a player sees, never the price of the same item. A per-player price for identical goods is a fairness problem with players who compare notes, and it sits badly with the transparent-pricing principles above.

```sql
CREATE TABLE offers (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,                     -- the studio or game on a shared platform
  game_id       UUID NOT NULL REFERENCES games (id),
  kind          TEXT NOT NULL CHECK (kind IN ('item', 'bundle', 'currency_pack', 'pass', 'subscription')),
  valid_during  TSTZRANGE NOT NULL,
  is_personalizable BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prices are dated rows per store and market, in money or in the game's currency.
CREATE TABLE offer_prices (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  offer_id      UUID NOT NULL REFERENCES offers (id),
  store         TEXT NOT NULL,                     -- 'steam', 'apple', 'web', or 'in_game'
  region        TEXT NOT NULL,                     -- country, store region group, or 'ALL'
  currency      TEXT NOT NULL,                     -- ISO 4217, or the game's currency code
  amount        BIGINT NOT NULL CHECK (amount >= 0),  -- minor units, or whole currency units
  reason        TEXT,                              -- conversion method, promotion
  valid_during  TSTZRANGE NOT NULL,
  EXCLUDE USING gist (offer_id WITH =, store WITH =, region WITH =, currency WITH =,
    valid_during WITH &&)                          -- one live price per market
);

CREATE TABLE offer_items (
  tenant_id     UUID NOT NULL,
  offer_id      UUID NOT NULL REFERENCES offers (id),
  item_id       UUID NOT NULL REFERENCES items (id),
  quantity      INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (offer_id, item_id)
);

-- One row per account per rotation slot: what this player was offered.
CREATE TABLE player_offers (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  account_id    UUID NOT NULL REFERENCES accounts (id),
  offer_id      UUID NOT NULL REFERENCES offers (id),
  discount_percent SMALLINT NOT NULL DEFAULT 0 CHECK (discount_percent IN (0, 10, 20, 30, 40, 50)),
  model_version TEXT NOT NULL,
  valid_during  TSTZRANGE NOT NULL,
  shown_at      TIMESTAMPTZ,
  purchased_at  TIMESTAMPTZ,
  CONSTRAINT player_offers_account_offer_period_key UNIQUE (account_id, offer_id, valid_during)
);
```

The discount levels in the check constraint are illustrative; the point is a small, fixed set shared by everyone. Prices live in `offer_prices`, not on the offer, because one offer has a price per store and market, each with its own history ([Regional Pricing](/books/gaming/stores-and-payments#regional-pricing) has the rules those rows follow); the price in the game's currency is the `in_game` row, the same everywhere.

## How Monetization Shapes the System

Whatever the mix, every model above ends in the same few places, and they're the parts of the backend that can't be wrong:

- **Entitlements are the source of truth for ownership.** A store purchase, a battle-pass tier, a subscription period, an ad reward and a support make-good all end as an entitlement or an inventory grant with a source. The store receipt is evidence; the entitlement is the fact the game reads. The core `entitlements` table is defined in [The Games Business](/books/gaming/games-business), and grants, revocations and their audit belong to [Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements); its `source`, `source_ref` and `valid_during` columns already carry what every model needs, so each model writes into it with its own source rather than getting a table of its own.
- **Every grant is idempotent and every grant is reversible.** Grants are keyed by what caused them (a store transaction, a season tier, an ad callback), so retries can't double-grant; and each grant can be revoked with a reason when its cause is refunded or charged back. What revocation does to items already used, or to a balance already spent, is a policy you decide before launch: revoke what it bought, let the balance go negative, or write it off ([Refunds, Chargebacks and Clawbacks](/books/gaming/economies-and-entitlements#refunds-chargebacks-and-clawbacks)).
- **Prices are data with dates.** Offers, currency-pack rates, regional prices and discount levels are versioned rows with validity ranges, so you can answer what a player saw and paid on a given day ([Effective Dating & History](/docs/database/temporal-data)).
- **Every money movement reaches finance.** Bookings, deferrals, refunds, chargebacks and store fees go to a pipeline finance can reconcile against each store's reports ([Data Pipelines](/docs/architecture/data-pipelines)).

## Ethics and Regulation

Monetization is where a game meets consumer law most directly, and the rules have moved quickly since 2025. The detail lives in [Loot Boxes & Consumer Law](/books/gaming/consumer-law-and-loot-boxes) and [Ratings, Age & Children](/books/gaming/ratings-and-age); the pointers that change what you build:

- **Random paid items** need odds disclosed before purchase on the App Store and Google Play, raise the PEGI rating, and are off entirely in some countries; drop tables, disclosures and gates are built in [Loot Boxes & Consumer Law](/books/gaming/consumer-law-and-loot-boxes#building-drop-tables-that-can-be-audited).
- **Purchase flows** are a regulatory subject. The FTC's 2023 final order against Epic Games bars charging through dark patterns or without express consent ([The FTC's Orders](/books/gaming/consumer-law-and-loot-boxes#the-ftc-s-orders)). Confirmation steps, button placement and one-tap purchases are design decisions that a regulator can review.
- **Children** change everything: parental consent, spending limits, ad targeting, and what offers may say. A monetization design that hasn't been checked against the youngest player who can install the game isn't finished.

My rule: the systems that make spending easy (saved payment methods, one-tap buys, currency balances) need matching systems that make spending visible and controllable: purchase history in the client, spending limits a parent can set, and refunds that don't punish the account.

## What This Means for the System You Build

- **One ownership record across models:** entitlements and inventory grants with a source, a validity range and a revocation path, whatever sold them.
- **A catalog and offer system:** items, bundles, currency packs, passes and subscriptions as offers with dated prices, and per-player offer rows when the shop is personalized.
- **Idempotent grants keyed by cause,** so store retries, ad callbacks and season grants can't double-grant, and a defined policy for revoking what's already been used.
- **Currency that shows its price:** money equivalents for every item, published pack rates, and a ledger that finance can defer and recognize.
- **Season machinery for passes:** tiers and thresholds as versioned data, server-side progress from events, and retroactive grants on upgrade.
- **Metrics with named windows:** active players, conversion, ARPPU, bookings and store fees per store, defined once and reconciled against store reports.
- **Guardrails built in:** odds disclosure, age gates, spending controls and honest confirmation steps, designed with the monetization, not after it.

## References

**Specifications**

- [Apple: App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), Guideline 3.1.1 on in-app purchase for currencies, non-expiring currencies and loot-box odds, and 3.1.2(a) on the seven-day minimum subscription period
- [Apple: In-App Purchase](https://developer.apple.com/in-app-purchase/), the four in-app purchase types and the restore requirement
- [Apple: Auto-renewable subscriptions](https://developer.apple.com/app-store/subscriptions/), 70% proceeds in a subscriber's first year and 85% after a year of paid service
- [ESRB: Ratings guide](https://www.esrb.org/ratings-guide/), the In-Game Purchases interactive element and its examples
- [PEGI: Expanded age rating criteria](https://pegi.info/news/pegi-expands-age-rating-criteria-interactive-risk-categories), 12 March 2026, new criteria for paid random items, time-limited offers and play-by-appointment from June 2026
- [Google Play: Payments policy](https://support.google.com/googleplay/android-developer/answer/9858738), odds disclosure for randomized virtual items close to the purchase
- [FTC: Changes to the children's privacy rule](https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-finalizes-changes-childrens-privacy-rule-limiting-companies-ability-monetize-kids-data), 16 January 2025, opt-in consent for targeted advertising and third-party disclosures
- [Springlex: DSA Article 28](https://www.springlex.eu/en/packages/dsa/dsa-regulation/article-28/), the text of the minors-protection article, including the bar on profiling-based ads to known minors (secondary reproduction)

**Reference**

- [Google AdMob: Rewarded ads](https://developers.google.com/admob/android/rewarded), the rewarded-ad definition and custom data in server-side verification callbacks
- [GameAnalytics: Metrics](https://docs.gameanalytics.com/events-metrics-and-filtering/metrics), definitions of DAU, conversion, ARPDAU and ARPPU computed in UTC
- [Unity: Analytics terminology (2022.1)](https://docs.unity3d.com/2022.1/Documentation/Manual/UnityAnalyticsTerminology.html), ARPDAU including ad revenue and verified purchases
- [Roblox: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1315098/000131509826000024/rblx-20251231.htm), bookings recorded in deferred revenue and the 27-month paying-user lifetime
- [FTC: Final order requiring Epic Games to pay $245 million](https://www.ftc.gov/news-events/news/press-releases/2023/03/ftc-finalizes-order-requiring-fortnite-maker-epic-games-pay-245-million-tricking-users-making), 14 March 2023, the bar on dark patterns and billing without express consent

**In practice**

- [Steam: Refunds](https://store.steampowered.com/steam_refunds/), the 14-day and two-hour rule, DLC and early access playtime
- [PlayStation: Store cancellation policy (US)](https://www.playstation.com/en-us/legal/playstation-store-cancellation-policy/), the 14-day window for games that haven't started downloading or streaming
- [Riot Games: Stocking Your Shop With Data Science](https://www.riotgames.com/en/news/stocking-your-shop-data-science), 30 April 2019, Your Shop's collaborative filtering, data problems, compute and offline evaluation
