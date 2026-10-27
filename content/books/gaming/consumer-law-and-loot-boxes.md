+++
title = "Loot Boxes & Consumer Law"
description = "Loot box rules by country, store odds disclosure, the EU's virtual currency principles, FTC orders on dark patterns, refunds, and auditable drop tables."
category = "Gaming Industry"
order = 1623
part = "The Rules"
tags = ["gaming", "loot-boxes", "consumer-law", "virtual-currency", "odds", "refunds"]
+++

A loot box is a purchase whose contents the buyer doesn't know in advance. Apple defines loot boxes as "virtual containers that provide players with randomized virtual items for purchase"; the ESRB's label for them covers anything where "the player doesn't know prior to purchase the specific digital goods or premiums they will be receiving," including gacha, card packs, prize wheels and treasure chests, and including purchases made with currency bought for real money. Whether that's a game mechanic, a sales technique or gambling depends on the country, and the answers have been converging since 2025 on three demands: **tell people the odds, show them the real price, and keep children out unless a parent agrees.**

This chapter covers the rules (country by country, store by store, and the EU consumer authorities' 2025 principles on virtual currencies), the FTC's orders against game companies over purchases, refund rights, and how to build drop tables and disclosures that are true by construction and can be audited. The monetization models themselves are in [Monetization Models](/books/gaming/monetization), the currency ledger in [Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements), store refund mechanics in [Stores, Fees & Payments](/books/gaming/stores-and-payments), and the rating consequences of paid random items in [Ratings, Age & Children](/books/gaming/ratings-and-age). Dates are as of October 2026. This isn't legal advice, and gambling law in particular turns on facts that only counsel can weigh.

## The Rules by Jurisdiction

| Jurisdiction | Position | What it means for a build |
| --- | --- | --- |
| Belgium | The Gaming Commission's 2018 report found the paid loot boxes it examined to be illegal games of chance | Paid random items off for Belgian players |
| Netherlands | The highest administrative court overturned the gambling regulator's penalty against EA's FIFA packs in 2022 | Not treated as gambling on those facts; consumer law still applies |
| United Kingdom | No change to gambling law (2022); industry-led protections expected from 2023 | Under-18 purchases need parental consent; probability disclosure; spending controls |
| China | Draw probabilities must be published (2016 notice, effective May 1, 2017) | Names, contents and probabilities of every item, on the site or draw page |
| Brazil | On the App Store, declaring loot boxes makes the app 18+ (from February 24, 2026) | Store reach changes with the checkbox |
| EU (all) | Consumer protection principles on virtual currencies (March 2025); PEGI 16 for paid random items from June 2026 | Real-money prices, no forced currency purchases, withdrawal rights, children protected |
| United States | No loot box statute; FTC orders under consumer protection and COPPA | Odds and exchange rates disclosed, under-16 consent in one order, no dark patterns |

### Belgium

The Belgian Gaming Commission's "Research Report on Loot Boxes" (April 2018; an unofficial English translation is public, and the official version is in Dutch) examined four games and concluded: "Because paid loot boxes in the examined video games are illegal, criminal prosecution should be undertaken if these loot boxes continue to be offered." The report also said licensors whose brands appear in such games "must urgently be confronted" with their part. The practical result is that publishers geofence paid random items out of Belgium: the feature exists, the region flag turns it off.

### The Netherlands

The Dutch gambling authority (Kansspelautoriteit) imposed a penalty order on EA over FIFA Ultimate Team packs, and a district court upheld it. In 2022 the Council of State, the highest administrative court, overturned that decision. As the Dutch law firm Dirkzwager summarized the ruling, the packs were "geen opzichzelfstaand spel" (not a separate game) but part of a game of skill, and EA's research showed 92% of players obtained packs only through play; the penalty had been suspended, so nothing was paid. The ruling turned on the facts of that game, and the design lesson is in them: a random item that is mostly earned through play and sits inside a skill game is in a different position from a paid draw that stands on its own.

### The United Kingdom

In July 2022 the government decided against changing the Gambling Act 2005 "at this time" and asked industry to act instead. In July 2023 it welcomed industry guidance, coordinated by the trade body Ukie, and set a 12-month implementation period. The commitments the government listed:

- technical controls so that under-18s can't buy paid loot boxes "without the consent or knowledge" of a parent or guardian,
- spending controls and transparent information available to all players, with the government wanting "default £0 spending limits on child accounts",
- "clear probability disclosures", and
- "fair and lenient refund policies".

The government said it would report after the implementation period and independent scrutiny; legislation stays an option.

### China

The Ministry of Culture's notice on online game operations, issued on December 1, 2016 and effective May 1, 2017, requires operators to publish on the official website or the draw page the names, properties, contents, quantities and draw or synthesis probabilities (名称、性能、内容、数量及抽取或者合成概率) of all items in random draws, and the published information "应当真实有效" (must be true and valid). China is where publishing the full table, not just a rarity summary, became a legal requirement.

### Brazil, and the Stores as Regulators

Apple announced on February 24, 2026 that on the Brazil storefront, an app that declares loot boxes in its age rating questionnaire "will be updated to 18+," and that 18+ downloads in Brazil, Australia and Singapore require the store to confirm the user is an adult. A rule like that reaches a game through its store listing before any regulator does.

### The European Union

There's no EU loot box law. What there is: PEGI's rating change (paid random items rated PEGI 16 by default from June 2026, and existing PEGI 3, 7 and 12 digital games re-rated from October 2026), and consumer law applied to virtual currencies, below. Belgium shows that national gambling law can still apply on top.

## Store Odds Rules

Both mobile stores require disclosure before purchase, whatever the country:

- **Apple** (App Review Guideline 3.1.1): "Apps offering 'loot boxes' or other mechanisms that provide randomized virtual items for purchase must disclose the odds of receiving each type of item to customers prior to purchase."
- **Google Play** (Payments policy): apps and games "offering mechanisms to receive randomized virtual items from a purchase" must "clearly disclose the odds of receiving those items in advance of, and in close and timely proximity to, that purchase."

Neither says what format to use. Google's "close and timely proximity" rules out odds buried in a web page nobody reaches from the purchase screen. Apple's "each type of item" leaves room for rarity-level odds; China's notice doesn't. My default is to publish per-item probabilities everywhere and link them from the purchase confirmation, which satisfies all three.

## The EU's Principles on In-Game Virtual Currencies

On March 21, 2025, the EU's Consumer Protection Cooperation Network (the national consumer authorities, coordinated by the European Commission) published key principles on in-game virtual currencies. They apply to currencies "purchased with real-world monetary value and then used by consumers to pay a price" for in-game content, and they treat spending that currency as subject to consumer law "just like purchases with real-world currencies." Currencies earned only through play are outside them. The principles are non-binding, but each cites the law it rests on (the Unfair Commercial Practices Directive, the Consumer Rights Directive and the Unfair Contract Terms Directive), which is binding. The same day, the network announced action against Star Stable Entertainment over practices aimed at children.

Seven principles, each with its practical consequence:

1. **Price indication should be clear and transparent.** When currency or content is sold, "their price in real-world money should be clearly and prominently displayed." When currency is exchanged for another currency, or content is bought with currency, the real-money price is shown too, "based on what the consumer would have to pay in full... without applying quantity discounts or other promotional offers."
2. **Practices obscuring the cost should be avoided:** "offering for purchase and mixing different in-game virtual currencies in one video game," and "requiring several exchanges of in-game virtual currencies before making any in-game purchase."
3. **Practices that force the purchase of unwanted currency should be avoided:** "offering in-game virtual currencies only in bundles mismatching the value of purchasable in-game digital content," and "denying consumers the possibility to choose the specific amount of in-game virtual currency to be purchased."
4. **Clear pre-contractual information** with every offer: main characteristics, trader identity, "the price in real-world monetary value", withdrawal rights, the legal guarantee, payment and delivery.
5. **The right of withdrawal should be respected,** within 14 days where it applies. Losing it for digital content requires the consumer's express consent to immediate supply and acknowledgment of the loss, which "can be requested and provided together in a single click but separately from the click to purchase." Practices to avoid include "exempting the purchase of in-game virtual currency, which is not digital content, from the right of withdrawal" and denying withdrawal "for any in-game virtual currency that remains unused."
6. **Fair contract terms in plain language,** avoiding terms that let the trader unilaterally modify "the value of in-game virtual currencies," remove purchased content, or ban accounts "without the ability to contest the reason."
7. **Respect consumer vulnerabilities.** Any game "not exclusively intended for an adult audience should expect a significant part of its player base to be under the age of 18." "Age gates and parental control functions do not limit traders' responsibilities." And games whose business model targets "whales" are "to be assessed according to a stricter threshold."

Principle 5 is the one engineering teams most often get wrong: it treats unused currency as withdrawable for 14 days, separately from the content bought with it. That requires knowing, per purchase, how much of the purchased currency has been spent, which only a ledger that tracks purchase lots can answer ([Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements)).

## The FTC's Orders

The US has no loot box statute, so the FTC acts through its general power over unfair and deceptive practices, and through COPPA. Its orders against game companies are the clearest statement of what it expects.

**Epic Games, 2022 and 2023.** On December 19, 2022 the FTC announced that Epic would pay $245 million in refunds over "dark patterns and billing practices" (alongside a separate $275 million COPPA penalty). The FTC alleged that "counterintuitive, inconsistent, and confusing button configuration" led players to make unwanted purchases, that children could buy currency without parental involvement, and that Epic locked the accounts of customers who disputed unauthorized charges with their card issuers. The final order, announced March 14, 2023, "prohibits Epic from charging consumers through the use of dark patterns," bars charging without express informed consent, and bars locking accounts over disputed charges. The FTC has since sent refunds in rounds: 629,344 payments totaling more than $72 million in December 2024, and more than $126 million in June 2025, bringing the total to nearly $200 million.

**Cognosphere (HoYoverse), January 17, 2025.** A proposed order with a $20 million penalty. The FTC alleged that players were deceived about their odds of winning the game's top-rarity "five-star" prizes, that event banners and influencer campaigns suggested better odds than existed, and that virtual currency bundles in odd denominations, exchanged through more than one currency, obscured the real cost. The order requires disclosure of loot box odds and "exchange rates for multi-tiered virtual currency," requires that loot boxes be purchasable directly with real money, bans misrepresenting odds, prices or features, and bans selling loot boxes to children under 16 without parental consent.

Read together with the EU principles, the orders describe one design: a confirmation step that can't be triggered by accident, a real-money price at the point of decision, odds that are true and visible, no multi-hop currency, and an account that isn't punished for disputing a charge.

## Refund Rights

Refunds for digital purchases come from three layers, and the strictest applies:

- **Law.** In the EU and UK, the 14-day withdrawal right for distance contracts, lost for digital content only with express consent and acknowledgment; the CPC principles say unused purchased currency stays withdrawable. In the US, refund duties come mostly from store policy, card network rules and FTC orders.
- **Store policy.** Each store sets its own windows and conditions, and on a closed store the store decides; Steam, for example, refunds third-party in-game purchases only if the developer opts in. The per-store table and how each store tells you is in [Stores, Fees & Payments](/books/gaming/stores-and-payments#refunds-and-chargebacks).
- **Your own commitments,** like the UK industry's "fair and lenient refund policies."

The engineering consequences are the same in every case. A refund needs to know what was bought, whether it was consumed, and what was received for it; a refund of currency you issue can cover only what's left unspent, and one already issued by a store or bank reverses the unspent part and applies the published policy to the rest (revoke what it bought, a negative balance or a write-off, as in [Refunds, Chargebacks and Clawbacks](/books/gaming/economies-and-entitlements#refunds-chargebacks-and-clawbacks)); and a refunded or charged-back purchase must never lock the account for having asked ([Stores, Fees & Payments](/books/gaming/stores-and-payments) owns the receipt and refund flows; [Player Support](/books/gaming/player-support) owns the queue).

"How much of this purchase is unspent" has a definite answer only if the ledger decides which purchase each paid spend came from. My default is first in, first out: every spend of paid currency is attributed to the oldest purchase with units left, under the versioned spend-order rule in [Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements#spend-order), so a purchase's unspent balance is what it issued minus what has been attributed to it. A 14-day withdrawal request then reverses exactly that remainder, and the answer is the same whether support, the store or a regulator asks.

## Pricing Virtual Currency Honestly

The CPC principles and the HoYoverse order turn currency design into something a regulator can measure. A design that passes both:

- **One premium currency.** No second paid currency that converts into the first, and no crafting currency that can only be bought. If the game needs currencies for progression, keep them earn-only, which also keeps them outside the principles' scope.
- **A real-money price next to every currency price,** in the player's own currency, computed from a published reference rate. The principles ask for the price without quantity discounts or promotions; my reading is that the reference rate should come from the undiscounted pack, not the best-value bundle.
- **Packs that can buy the catalog.** If items cost multiples of 100, sell packs in multiples of 100, or let the player buy the exact shortfall at checkout. A catalog priced at 1,200 and packs of 1,000 and 2,800 is the pattern principle 3 names.
- **Direct purchase of random items with money.** The HoYoverse order requires it for that company; it's also the simplest way to make the price of a draw unambiguous everywhere.
- **No expiry on purchased currency.** Apple's Guideline 3.1.1 already says purchased credits and currencies "may not expire," and principle 6 warns against unilaterally changing their value.

## Building Drop Tables That Can Be Audited

A drop table is the list of possible outcomes of a draw with their probabilities. Everything in this section follows from one rule: **the disclosure and the roll read the same rows.** Odds published from a spreadsheet and a roll coded in the game server will drift apart, and the first person to notice will be a player with a spreadsheet of their own.

![Drop table and odds sheet. A plan view shows one illustrative drop table as a bar at 5.4 px per percent: legendary 1.00, epic 9.00, rare 30.00 and common 60.00, chained to P0 = 100.00, highlighted. Detail A enlarges the legendary band at 400 px per percent into four items of 0.25 each, closing to P1 = 1.00. Detail B shows a hard pity at 50 pulls on a pull axis, with expected pulls E1 = (1 - 0.99^50) / 0.01 = 39.50 and the consolidated rate R1 = 1 / 39.50 = 2.53%. A variable table lists every code.](/diagrams/gm-consumer-law-and-loot-boxes-odds.svg "Every level of a drop table closes to its parent, and the disclosed rates are computed from the same rows the server rolls. Pity changes the effective rate, so disclose the base rate, the guarantee and the result.")

### Odds as Data

Store probabilities as **integer weights** over a fixed total, chosen so that every probability is exact at the precision you display. With a total of 10,000, each unit is 0.01%, and a table that displays two decimals sums to exactly 100.00; with floats or with weights over an arbitrary total, rounding makes the published table sum to 99.99 and someone will screenshot it. Tables are versioned and effective-dated, and a published version is immutable: changing odds means publishing a new version, with a start time, which is also when the disclosure changes ([Rules as Data](/docs/architecture/rules-as-data#effective-dates-and-versions)).

The tables extend the volume's core model ([The Games Business](/books/gaming/games-business#the-core-data-model)); `tenant_id` is the studio, as there:

```sql
CREATE TABLE drop_tables (                  -- a named source of random rewards
  id        UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id UUID NOT NULL,
  game_id   UUID NOT NULL REFERENCES games (id),
  slug      TEXT NOT NULL,                  -- 'summer-banner-2026', 'gold-chest'
  is_paid   BOOLEAN NOT NULL,               -- paid random item: drives ratings, age gates, geofences
  UNIQUE (game_id, slug)
);

CREATE TABLE drop_table_versions (          -- immutable once published
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  drop_table_id  UUID NOT NULL REFERENCES drop_tables (id),
  version        INTEGER NOT NULL,
  total_weight   INTEGER NOT NULL CHECK (total_weight > 0),  -- e.g. 10000: 1 unit = 0.01%
  pity_threshold INTEGER,                   -- hard pity: guaranteed top tier on this pull, or null
  pity_tier      TEXT,                      -- the tier the guarantee awards
  valid_during   TSTZRANGE NOT NULL,
  published_at   TIMESTAMPTZ,               -- null while draft
  approved_by    TEXT,
  UNIQUE (drop_table_id, version),
  EXCLUDE USING gist (drop_table_id WITH =, valid_during WITH &&)  -- one live version
);

CREATE TABLE drop_table_entries (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id             UUID NOT NULL,
  drop_table_version_id UUID NOT NULL REFERENCES drop_table_versions (id),
  item_id               UUID NOT NULL REFERENCES items (id),
  tier                  TEXT NOT NULL,      -- 'legendary', 'epic', 'rare', 'common'
  weight                INTEGER NOT NULL CHECK (weight > 0),
  UNIQUE (drop_table_version_id, item_id)
);
```

Each opening is a row in `item_rolls`, which [Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements#crafting-and-loot) defines alongside the ledger: it points at the `drop_table_versions` row it drew from and the `drop_table_entries` row it produced, and records the drawn value, the pity count before the pull, how it was paid for and the idempotency key.

Publishing a version runs checks the database can't express on its own: entries' weights sum to `total_weight`, every item exists and is grantable in every region where the table is live, no paid table is live in a region where paid random items are off, and the disclosure page renders from this version before the version can start. The disclosure is generated: for each entry, `weight / total_weight`; for each tier, the sum; and the pity rule in words, with the consolidated rate below.

### The Roll

- **On the server, never the client.** The client asks; the server rolls, grants and records. A client that rolls can be made to roll whatever its owner likes ([Anti-Cheat](/books/gaming/anti-cheat)).
- **From a cryptographically secure generator,** drawing an integer in `[0, total_weight)` without modulo bias (rejection sampling, or the language's uniform-integer function), then walking the cumulative weights in a fixed order. Record the drawn value, so any opening can be replayed against its version and produce the same item.
- **Exactly once.** The purchase, the currency spend, the roll, the grant and the pity counter update are one transaction with one idempotency key, so a retried request returns the original result instead of a second roll ([Idempotency](/docs/payments/idempotency)). A player who can retry until they like the result has found a free reroll.

### Pity and the Effective Rate

A **pity** system guarantees a top-tier result after a number of draws without one. It makes spending more predictable and makes the published base rate misleading on its own: with a 1.00% base rate and a guarantee on the 50th draw, the expected number of draws per top-tier item is

E = (1 - (1 - p)^N) / p = (1 - 0.99^50) / 0.01 = 39.50,

so the consolidated rate is 1 / 39.50 = 2.53%, more than two and a half times the base. A "soft pity" that raises the rate before the guarantee changes the sum but not the method: the expected draws are the sum, over k from 0 to N - 1, of the probability of reaching draw k + 1 without a top-tier result. Disclose all three numbers (base rate, guarantee, consolidated rate) and the rules a player can't see: whether the counter carries over between banners, whether it resets on any top-tier result or only a featured one, and whether a featured item is guaranteed or only more likely. The HoYoverse allegations were about exactly that gap between what banners suggested and what the odds were.

Pity counters are per player profile and per pity pool, derived from openings (the count since the last top-tier result) and cached for speed. Store `pity_count_before` on each opening, so the counter can be rebuilt and a support agent can answer "why didn't I get the guarantee" from the record.

### Auditing the Odds

An odds audit compares what happened with what was published. For each live version, a daily job counts openings and outcomes per entry and tier, excluding pity-triggered results for the base-rate check, and tests each observed rate against the disclosed one. With a published 1.00% and 100,000 non-pity openings, the standard error is √(0.01 × 0.99 / 100,000) = 0.031 percentage points, so an observed rate between about 0.91% and 1.09% is within three standard errors; with dozens of entries checked daily, set the alarm threshold wider (four standard errors or a multiple-comparison correction) so it fires on real faults and not on noise. A second check compares observed draws per top-tier result with the consolidated rate, which catches a broken pity counter that a base-rate check can't see.

Keep the audit's inputs: the version, the counts, the test and the result, per day. When a regulator, a platform or a player asks whether the odds are real, the answer is a query, not an investigation ([Telemetry & Analytics](/books/gaming/telemetry) carries the events; [Audit Trails](/docs/architecture/audit-trails) the record).

### Gates Around the Draw

- **Region:** paid tables off where paid random items are off (Belgium), with the geofence keyed to the account's billing country and the store region, not the IP address alone.
- **Age and consent:** paid draws behind parental consent for under-18 accounts in the UK under the industry commitments, and under-16 in the HoYoverse order's terms; the age band and consent model are in [Ratings, Age & Children](/books/gaming/ratings-and-age#age-and-features).
- **Spending limits:** a per-account limit, default zero on child accounts, enforced on the server before the payment, and visible to the player and parent (below).
- **Confirmation:** a deliberate confirmation step showing the item or draw, the real-money price, and a link to the odds, placed where it can't be hit by the button that dismissed the last dialog.

A spending limit is a row per account, set by the player or a parent, and the check sums money already committed in the window from the store transactions ([Stores, Fees & Payments](/books/gaming/stores-and-payments#receipt-validation-and-entitlement-grants)):

```sql
CREATE TABLE spending_limits (
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  account_id   UUID NOT NULL REFERENCES accounts (id),
  period       TEXT NOT NULL CHECK (period IN ('day', 'week', 'month')),
  limit_amount BIGINT NOT NULL CHECK (limit_amount >= 0),  -- 0: no purchases
  currency     TEXT NOT NULL,                              -- ISO 4217
  set_by       TEXT NOT NULL CHECK (set_by IN ('default', 'player', 'parent', 'support')),
  valid_during TSTZRANGE NOT NULL,
  EXCLUDE USING gist (account_id WITH =, period WITH =, valid_during WITH &&)
);
```

Before a purchase starts, the server adds the purchase price to the sum of the account's `store_transactions` in the period that aren't `rejected` or `reversed` (pending ones count, so two quick purchases can't both slip under), and refuses if any live limit would be exceeded. Purchases in another currency are converted to the limit's currency at that day's reference rate before the comparison. Child accounts get a `default` row of zero at creation, which a parent's consent replaces; a platform's own limit still applies on its store, so this one matters most for the web store and any path the platform doesn't see ([Parental Controls on Consoles and PCs](/books/gaming/ratings-and-age#parental-controls-on-consoles-and-pcs)).

## Auditing

What gets asked for, and by whom:

- **Odds history** (regulators, platforms, players): every published version with its entries, effective range, approver and the disclosure as rendered.
- **Openings** (support, disputes): every roll with version, drawn value, pity state, payment and grant, reproducible.
- **Prices** (consumer authorities): the reference rate and money price shown for each offer at each time, per market.
- **Refunds and disputes** (FTC orders, card networks): every refund, its reversal in the ledger, and evidence that no account was locked for disputing.

## What This Means for the System You Build

- **Drop tables as versioned, immutable data** with integer weights over a total that makes displayed odds exact, effective-dated and approved before going live.
- **One source for the roll and the disclosure,** with per-item and per-tier probabilities, the pity rule, and the consolidated rate generated from the live version and linked from the purchase confirmation.
- **Server-side, recorded, idempotent rolls** from a secure generator, reproducible from the stored draw.
- **Pity state on every opening** and counters rebuilt from openings.
- **A daily odds audit** against disclosed base and consolidated rates, with results kept.
- **One premium currency,** real-money prices from an undiscounted reference rate beside every currency price, packs that match the catalog, direct money purchase of draws, and no expiry.
- **Refunds that know what's unspent,** with purchase lots in the ledger and no account locks for disputes.
- **Gates for region, age and consent, and spending limits** evaluated on the server before payment.

## References

**Specifications**

- [CPC Network: Key principles on in-game virtual currencies (PDF)](https://commission.europa.eu/document/download/8af13e88-6540-436c-b137-9853e7fe866a_en), March 21, 2025; the seven principles, their legal bases and practices to avoid
- [Apple: App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), Guideline 3.1.1 on odds disclosure before purchase and non-expiring purchased currency
- [Google Play: Payments policy](https://support.google.com/googleplay/android-developer/answer/9858738), odds disclosure in advance of and in close proximity to the purchase
- [Elawcn: Ministry of Culture notice on online game operations (2016)](https://www.elawcn.com/rule/2020/0301/617.html), a reproduction of the notice; Article 6's publication of item names, contents and draw probabilities

**Reference**

- [Belgian Gaming Commission: Research report on loot boxes (unofficial English translation, PDF)](https://www.skadden.com/-/media/files/publications/2019/08/video-gaming-egaming-law-update/fn12_onderzoeksrapportlootboxenengelspublicatie.pdf), April 2018; the finding that the paid loot boxes examined were illegal games of chance
- [Dirkzwager: Loot boxes in FIFA not a prohibited game of chance after all](https://www.dirkzwager.nl/kennis/artikelen/loot-boxes-in-fifa-toch-geen-verboden-kansspel-dwangsom-onterecht-opgelegd), April 1, 2022; the Council of State ruling on EA's FIFA packs, in Dutch
- [GOV.UK: Government response to the call for evidence on loot boxes](https://www.gov.uk/government/consultations/loot-boxes-in-video-games-call-for-evidence/outcome/government-response-to-the-call-for-evidence-on-loot-boxes-in-video-games), July 18, 2022; no change to gambling law and the expectation of industry-led measures
- [GOV.UK: Update on improvements to industry-led protections](https://www.gov.uk/guidance/loot-boxes-in-video-games-update-on-improvements-to-industry-led-protections), July 18, 2023; parental consent for under-18s, £0 default limits, probability disclosure, refunds and the 12-month implementation period
- [Forbrukertilsynet: Consumer authorities take action on harmful practices in the gaming industry](https://www.forbrukertilsynet.no/eng-articles/national-consumer-authorities-and-commission-take-action-on-harmful-practices-in-the-gaming-industry), March 21, 2025; the principles' announcement and the Star Stable action
- [European Commission: Stakeholder talks on the CPC Network's key principles](https://commission.europa.eu/news-and-media/news/european-commission-hosts-stakeholders-talks-application-cpc-networks-key-principles-games-virtual-2025-06-03_en), June 3, 2025; the principles' status and follow-up
- [FTC: Epic Games to pay more than half a billion dollars](https://www.ftc.gov/news-events/news/press-releases/2022/12/fortnite-video-game-maker-epic-games-pay-more-half-billion-dollars-over-ftc-allegations), December 19, 2022; button configurations, unwanted charges and account locks
- [FTC: Final order requiring Epic Games to pay $245 million](https://www.ftc.gov/news-events/news/press-releases/2023/03/ftc-finalizes-order-requiring-fortnite-maker-epic-games-pay-245-million-tricking-users-making), March 14, 2023; the ban on dark patterns, charges without consent and account locks
- [FTC: $126 million in refunds to Fortnite players](https://www.ftc.gov/news-events/news/press-releases/2025/06/ftc-sends-126-million-refunds-fortnite-players-who-were-charged-unwanted-items-reopens-claims), June 25, 2025; the refund rounds and the nearly $200 million total
- [FTC: Genshin Impact developer will be banned from selling loot boxes to teens under 16 without parental consent](https://www.ftc.gov/news-events/news/press-releases/2025/01/genshin-impact-game-developer-will-be-banned-selling-lootboxes-teens-under-16-without-parental), January 17, 2025; odds and exchange-rate disclosure, direct money purchase and the under-16 rule
- [Apple: Age requirements for apps distributed in Brazil, Australia, Singapore, Utah, and Louisiana](https://developer.apple.com/news/?id=f5zj08ey), February 24, 2026; loot boxes rated 18+ on the Brazil storefront

**In practice**

- [ESRB: In-Game Purchases (Includes Random Items)](https://www.esrb.org/blog/in-game-purchases-includes-random-items/), the label's scope, including purchases with bought currency
- [PEGI: Expanded age rating criteria](https://pegi.info/news/pegi-expands-age-rating-criteria-interactive-risk-categories), paid random items PEGI 16 by default from June 2026
- [Steam: Refunds](https://store.steampowered.com/steam_refunds/), the 14-day, two-hour rule and in-game purchase refunds by developer opt-in
