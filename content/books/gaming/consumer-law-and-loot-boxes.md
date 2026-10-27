+++
title = "Loot Boxes & Consumer Law"
description = "Loot box rules by country, store odds disclosure, the EU's virtual currency principles, FTC orders on dark patterns, refunds, and auditable drop tables."
category = "Gaming Industry"
order = 1626
part = "The Rules"
tags = ["gaming", "loot-boxes", "consumer-law", "virtual-currency", "odds", "refunds"]
+++

A loot box is a purchase whose contents the buyer doesn't know in advance. Apple defines loot boxes as "virtual containers that provide players with randomized virtual items for purchase"; the ESRB's label for them covers anything where "the player doesn't know prior to purchase the specific digital goods or premiums they will be receiving," including gacha, card packs, prize wheels and treasure chests, and including purchases made with currency bought for real money. Whether that's a game mechanic, a sales technique or gambling depends on the country, and the answers have been converging since 2025 on three demands: **tell people the odds, show them the real price, and keep children out unless a parent agrees.**

This chapter covers the rules (country by country, store by store, and the EU consumer authorities' 2025 principles on virtual currencies), the FTC's orders against game companies over purchases, refund rights, what the law asks when a game's servers shut down (the Stop Killing Games initiative, California's license disclosure law, refunds of unspent currency and offline modes), and how to build drop tables and disclosures that are true by construction and can be audited. The monetization models themselves are in [Monetization Models](/books/gaming/monetization), the currency ledger in [Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements), store refund mechanics in [Stores, Fees & Payments](/books/gaming/stores-and-payments), and the rating consequences of paid random items in [Ratings, Age & Children](/books/gaming/ratings-and-age). Dates are as of October 2026. This isn't legal advice, and gambling law in particular turns on facts that only counsel can weigh.

## The Rules by Jurisdiction

| Jurisdiction | Position | What it means for a build |
| --- | --- | --- |
| Belgium | The Gaming Commission's 2018 report found the paid loot boxes it examined to be illegal games of chance | Paid random items off for Belgian players |
| Netherlands | The highest administrative court overturned the gambling regulator's penalty against EA's FIFA packs in 2022 | Not treated as gambling on those facts; consumer law still applies |
| United Kingdom | No change to gambling law (2022); industry principles (2023), implementation period ended July 2024 | Under-18 purchases need parental consent; probability disclosure; spending controls |
| China | Draw probabilities must be published (2016 notice, effective May 1, 2017) | Names, contents and probabilities of every item, on the site or draw page |
| Brazil | Loot boxes banned in games aimed at or likely accessed by minors (Lei 15.211/2025, in force March 17, 2026); Apple rates declared loot boxes 18+ | Paid random items off unless the game's rating keeps minors out |
| Australia | Paid random items carry a minimum M classification, simulated gambling R 18+ (from September 2024) | The feature sets the floor of the rating |
| South Korea | Probability disclosure for paid random items mandatory (from March 22, 2024) | Odds for every paid random item, published |
| Japan | Kompu gacha (complete gacha) unlawful under the Premiums and Representations Act (2012) | No prize for completing a set of paid random items |
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

The government said it would report after the implementation period and independent scrutiny; legislation stays an option. The period ended in July 2024, and as of October 2026 no government evaluation has been published. Independent research has: Leon Y. Xiao and Mie Lange Lund checked the UK's 100 highest-grossing iPhone games before and after the principles took effect in 2024 and, as the 5Rights Foundation summarized it in May 2025, found that none of the 81 games with loot boxes used effective age verification and only 7 consistently disclosed probabilities. A principle the industry wrote and nobody enforces is a weak defense; build to the commitments as if they were law.

### China

The Ministry of Culture's notice on online game operations, issued on December 1, 2016 and effective May 1, 2017, requires operators to publish on the official website or the draw page the names, properties, contents, quantities and draw or synthesis probabilities (名称、性能、内容、数量及抽取或者合成概率) of all items in random draws, and the published information "应当真实有效" (must be true and valid). China is where publishing the full table, not just a rarity summary, became a legal requirement.

### Brazil, and the Stores as Regulators

Brazil is the first large market to ban loot boxes for minors by statute. Article 20 of Lei 15.211/2025, the Digital Statute of Children and Adolescents (ECA Digital), says loot boxes "são vedadas" (are prohibited) in electronic games aimed at children and adolescents or likely to be accessed by them, under the game's indicative rating. The law was signed on September 17, 2025 and, after an amendment fixed the date, entered into force on March 17, 2026. "Likely to be accessed" is the operative phrase: a game doesn't escape by saying it's for adults if its rating, marketing and audience say otherwise.

The stores moved too. Apple announced on February 24, 2026 that on the Brazil storefront, an app that declares loot boxes in its age rating questionnaire "will be updated to 18+," and that 18+ downloads in Brazil, Australia and Singapore require the store to confirm the user is an adult. A rule like that reaches a game through its store listing before any regulator does.

### Australia

Australia regulates through classification rather than gambling law. From September 2024, games with in-game purchases linked to elements of chance, including paid loot boxes, receive a minimum classification of M, and games with simulated gambling (social casino games) a mandatory R 18+, which makes them legally restricted to adults. The change applies to games classified from that date, on every device type, so a live game that adds paid random items later has to be classified again.

### South Korea and Japan

South Korea made probability disclosure law: under an amended enforcement decree of the Game Industry Promotion Act, operators must disclose the type of each paid probability-based item and its probability from March 22, 2024, as the Ministry of Culture, Sports and Tourism announced in January 2024. Japan acted earlier and more narrowly. In May 2012 the Consumer Affairs Agency stated that **kompu gacha** ("complete gacha", a prize for collecting a full set of items from paid draws) is the "card matching" method banned outright under the Act against Unjustifiable Premiums and Misleading Representations, with the revised standards applied from July 1, 2012. Ordinary gacha stayed legal; the prize for completing a set did not.

### The European Union

There's no EU loot box law. What there is: PEGI's 2026 rating criteria, which raise the age rating for paid random items ([Ratings, Age & Children](/books/gaming/ratings-and-age#pegi)), and consumer law applied to virtual currencies, below. Belgium shows that national gambling law can still apply on top.

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

The engineering consequences are the same in every case: a refund you issue can cover only what's left unspent, one already issued by a store or bank runs the clawback in [Refunds, Chargebacks and Clawbacks](/books/gaming/economies-and-entitlements#refunds-chargebacks-and-clawbacks), and neither may lock the account for having asked (the Epic order, above).

"How much of this purchase is unspent" has a definite answer only if the ledger decides which purchase each paid spend came from. My default is first in, first out: every spend of paid currency is attributed to the oldest purchase with units left, under the versioned spend-order rule in [Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements#spend-order), so a purchase's unspent balance is what it issued minus what has been attributed to it. A 14-day withdrawal request then reverses exactly that remainder, and the answer is the same whether support, the store or a regulator asks.

## Pricing Virtual Currency Honestly

The CPC principles and the HoYoverse order turn currency design into something a regulator can measure. A design that passes both:

- **One premium currency.** No second paid currency that converts into the first, and no crafting currency that can only be bought. If the game needs currencies for progression, keep them earn-only, which also keeps them outside the principles' scope.
- **A real-money price next to every currency price,** in the player's own currency, computed from a published reference rate. The principles ask for the price without quantity discounts or promotions; my reading is that the reference rate should come from the undiscounted pack, not the best-value bundle.
- **Packs that can buy the catalog.** If items cost multiples of 100, sell packs in multiples of 100, or let the player buy the exact shortfall at checkout. A catalog priced at 1,200 and packs of 1,000 and 2,800 is the pattern principle 3 names.
- **Direct purchase of random items with money.** The HoYoverse order requires it for that company; it's also the simplest way to make the price of a draw unambiguous everywhere.
- **No expiry on purchased currency.** Apple's Guideline 3.1.1 already says purchased credits and currencies "may not expire," and principle 6 warns against unilaterally changing their value.

## When the Servers Shut Down

Every online game eventually turns its servers off, and a game that can't run without them stops working for everyone who paid for it. Ubisoft's The Crew turned that into a legal question. Ubisoft delisted the game and stopped selling its microtransactions on December 14, 2023, took the always-online game's servers down on March 31, 2024, citing "upcoming server infrastructure and licensing constraints," and in April 2024 players found the game moved to an "inactive games" section of their Ubisoft Connect libraries, with existing installs launching a demo. A citizens' initiative, a UK petition and a lawsuit followed, and California passed a disclosure law on the same question of what a digital purchase is. As of October 2026, none of them makes keeping a game playable mandatory, but together they set out what a shutdown owes the people who paid.

### The Citizens' Initiative and the UK Petition

The European Citizens' Initiative "Stop Destroying Videogames", the EU arm of the Stop Killing Games campaign, asks the Commission to require publishers that sell or license games in the EU to leave them in a functional state. It collected about 1.45 million signatures and was submitted on January 26, 2026 with 1,294,188 verified statements of support, past the one-million threshold and the national minimums in 24 Member States. The organisers met Executive Vice-President Henna Virkkunen and Commissioner Michael McGrath on February 23, 2026, the European Parliament held a public hearing on April 16 and a plenary debate on May 21, and the Commission adopted its communication on June 16, 2026. Its answer: it "cannot propose a legal obligation to keep video games playable" at this stage, because existing consumer law already provides safeguards. What it committed to instead is talks, starting by the end of 2026, with industry and consumer representatives on an industry code of conduct for the end-of-life phase of games, awareness work with consumer authorities, and a report on the Digital Content Directive (below) before the end of 2026. That code and that report are the two things to watch.

In the UK, e-petition 702074, "Prohibit publishers irrevocably disabling video games they have already sold," reached 189,886 signatures. The government's response of February 3, 2025 was that "There are no plans to amend UK consumer law on disabling video games," and when Parliament debated the petition on November 3, 2025, the minister held to it: "We do not think that mandating end-of-life plans is proportionate or enforceable."

### The Crew Lawsuit

Two California buyers sued Ubisoft over The Crew on November 4, 2024 (Cassell v. Ubisoft, Eastern District of California, No. 2:24-cv-03058), as a fraud claim arguing that buyers were sold what looked like a game and got a revocable license. An amended complaint followed on March 18, 2025, and the docket shows the case terminated on June 13, 2025; the campaign's own wiki records a voluntary dismissal without prejudice. No court ruled on the merits, so the case settled nothing except that the "you bought a license" question will be asked in court.

### California's License Disclosure Law

California answered the same question with a disclosure rule. AB 2426, signed on September 24, 2024 and in force from January 1, 2025, makes it unlawful to advertise or sell a digital good with "buy," "purchase" or similar terms that a reasonable person would understand to confer an unrestricted ownership interest, unless the seller does one of two things:

- **Gets an affirmative acknowledgment** from the purchaser at the time of the transaction that they are receiving a license, with the license's restrictions and the fact that access may be revoked if the seller loses the rights to the good; or
- **Shows a clear and conspicuous statement** before the transaction that the purchase is a license, with a hyperlink, QR code or similar access to the full license terms.

Subscriptions, goods offered for free, and goods that can be permanently downloaded and stored offline are exempt. Steam's response, added to the cart in October 2024, is the second path in one line: "A purchase of a digital product grants a license for the product on Steam," with a link to the Subscriber Agreement. For a game with its own web store or in-game store selling paid items to California players, the statement belongs in the purchase flow, generated from the same offer record as the price, and logged with the transaction so the disclosure shown at purchase time is a fact, not an assumption. The offline exemption is also an engineering incentive: a good the player can keep without the publisher's servers isn't the thing the law is about.

### What the Law Already Requires at Shutdown

There's no shutdown statute, but existing law reaches a shutdown from several sides:

- **EU conformity.** The Digital Content Directive (2019/770) requires content supplied continuously over a period, which describes a live service, to be "in conformity throughout the duration of that period" (Article 8(4)); for a one-off sale, updates are owed for the period "that the consumer may reasonably expect, given the type and purpose" of the content (Article 8(2)(b)). A modification that "negatively impacts" access or use, beyond a minor impact, lets the consumer terminate free of charge within 30 days (Article 19(2)), unless the trader lets them keep the unmodified content at no extra cost (Article 19(4)). On termination the trader refunds the price, or for continuous supply the proportionate part for the period of non-conformity and any advance payment for the rest of the term (Article 16(1)), and must make available content the consumer created or provided, other than personal data, free of charge and in a "commonly used and machine-readable format" (Article 16(4)). How these articles apply to a shutdown hasn't been settled in court that I know of, which is why the Commission's report on the directive matters.
- **Unspent paid currency.** In the EU, the CPC principles above keep unused purchased currency withdrawable for 14 days. Japan goes further: under Article 20 of the Payment Services Act, an issuer that discontinues a prepaid payment instrument must refund the outstanding balance, after public notice, with a claims period of not less than 60 days. Game currency that qualifies is refunded this way when a game closes; LINE's notice for LINE HELLO BT21, which ended on June 28, 2024, cites Article 20(1), refunds the paid balance unused at the end of service, and ran applications from July 5 to October 4, 2024. Whether a given currency is a prepaid payment instrument depends on its design, which is counsel's call, but the ledger has to be able to answer "how much paid currency, bought for how much, was unspent at the end" either way.
- **Store refunds.** Store policy still applies at shutdown, and stores add their own end-of-service rules: Valve's retirement guidance says all purchases stay covered by the normal Steam refund policy, that Valve may offer refunds beyond it, and that a free-to-play game owes players at least 90 days' notice with in-game purchasing disabled and time to use remaining currency. Per-store windows are in [Stores, Fees & Payments](/books/gaming/stores-and-payments#refunds-and-chargebacks). Publishers have also gone past the floors: Sony offered full refunds for Concord when it took the game offline on September 6, 2024, two weeks after launch, and Ubisoft refunded XDefiant's Ultimate Founder's Pack and any purchase made in the 30 days before its shutdown announcement.

### Offline Modes and End-of-Life Patches

The engineering answer to all of this is a game that keeps working without the publisher. Publishers have shipped it in three forms:

- **An offline mode in the live game.** Ubisoft said in April 2025 that The Crew 2 and The Crew Motorfest would both get offline modes, and The Crew 2's shipped in a patch on October 20, 2025: the player picks online or offline at launch, offline progression is saved locally, and multiplayer, leaderboards, user-generated content and the shop are disabled. As of October 2026 I found no released offline mode for Motorfest.
- **Private servers.** Velan Studios announced on February 2, 2023 that Knockout City's servers would close on June 6, 2023, and released a free PC edition that players can run on privately hosted servers. Console players got no equivalent.
- **A separate offline edition.** Capcom released Mega Man X DiVE Offline on Steam on September 1, 2023, at $29.99, before the mobile game's online service ended on September 27, 2023.

Each one is cheaper to build if the game was designed for it, which is the runbook's subject: [End of Service](/books/gaming/live-operations#end-of-service) covers the notice, the stop-sale, the delisting, the patch and the order of shutdown. Exporting saves and player data is in [Access and Portability](/books/gaming/saves-and-player-data#access-and-portability), and what a player's purchases entitle them to is the entitlement record in [Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements#entitlements-are-the-source-of-truth). My rule: the end-of-life plan is part of what's sold. Disclose the license where the law asks, stop selling paid currency before anything else, refund unspent paid balances where any law in a market requires it, and say at launch what the game becomes when the servers go.

## How to Build It

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

- **Region:** paid tables off where paid random items are off (Belgium, and Brazil for games minors are likely to play), with the geofence keyed to the account's billing country and the store region, not the IP address alone.
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

### Unspent Paid Currency at Shutdown

A shutdown refund, a Japanese Article 20 notice and a 14-day withdrawal all ask the same question at a cutoff instant: how much paid currency each account still held. With the ledger in [Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements#wallets-are-ledgers) it's one query, run at the moment paid sales stop and again when the servers go off:

```sql
SELECT w.account_id, e.currency, SUM(e.delta_amount) AS unspent_paid_units
FROM currency_ledger_entries e
JOIN currency_ledger_transactions t ON t.id = e.transaction_id
JOIN wallets w ON w.id = e.wallet_id
WHERE t.tenant_id = $1
  AND t.game_id = $2
  AND e.ledger_account = 'player'
  AND e.funding = 'paid'
  AND e.created_at < $3                      -- the cutoff instant
GROUP BY w.account_id, e.currency
HAVING SUM(e.delta_amount) > 0;
```

Units aren't money, so the refund amount comes from the purchase lots, not a price per gem. Under first-in, first-out attribution ([Spend Order](/books/gaming/economies-and-entitlements#spend-order)), the units left are the newest purchases' remainders, and each one is refunded at what that purchase actually cost per unit, in the currency it was paid in, through the store or channel that took the money. The refund itself posts a `refund` transaction that moves the units out of `player_paid`, so the balance at the next query is zero and a second run refunds nothing.

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
- **A shutdown that's planned at sale:** license disclosure where California requires it, logged with the transaction; paid sales stopped first; unspent paid balances computed from the ledger at a cutoff and refunded per lot where law or store policy requires; and an offline mode, private servers or an offline edition designed in rather than promised later.

## References

**Specifications**

- [CPC Network: Key principles on in-game virtual currencies (PDF)](https://commission.europa.eu/document/download/8af13e88-6540-436c-b137-9853e7fe866a_en), March 21, 2025; the seven principles, their legal bases and practices to avoid
- [Apple: App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), Guideline 3.1.1 on odds disclosure before purchase and non-expiring purchased currency
- [Google Play: Payments policy](https://support.google.com/googleplay/android-developer/answer/9858738), odds disclosure in advance of and in close proximity to the purchase
- [Elawcn: Ministry of Culture notice on online game operations (2016)](https://www.elawcn.com/rule/2020/0301/617.html), a reproduction of the notice; Article 6's publication of item names, contents and draw probabilities
- [Planalto: Lei nº 15.211, de 17 de setembro de 2025](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/L15211.htm), the ECA Digital; Article 20's loot box prohibition and Article 41-A's entry into force on March 17, 2026
- [Australian Classification: New classifications for gambling content in video games](https://www.classification.gov.au/about-us/media-and-news/news/new-classifications-for-gambling-content-video-games), the M minimum for in-game purchases linked to chance and R 18+ for simulated gambling from September 2024
- [Japanese Law Translation: Act against Unjustifiable Premiums and Misleading Representations](https://www.japaneselawtranslation.go.jp/en/laws/view/2888/en), the act under which kompu gacha was held unlawful
- [Directive (EU) 2019/770, Article 8](https://www.legislation.gov.uk/eudr/2019/770/article/8/2020-01-31), conformity throughout continuous supply and updates for the period the consumer may reasonably expect
- [Directive (EU) 2019/770, Article 16](https://www.legislation.gov.uk/eudr/2019/770/article/16/2020-01-31), reimbursement on termination, proportionate for continuous supply, and retrieval of user-created content
- [Directive (EU) 2019/770, Article 19](https://www.legislation.gov.uk/eudr/2019/770/article/19/2020-01-31), modifications that negatively impact access, the 30-day termination right and the exception for keeping the unmodified content
- [Japanese Law Translation: Payment Services Act](https://www.japaneselawtranslation.go.jp/en/laws/view/4477), Article 20's refund of prepaid payment instrument balances on discontinuation and the claims period of not less than 60 days
- [Steamworks: Retiring a product](https://partner.steamgames.com/doc/store/retire_app), refunds under the normal policy and beyond it, and 90 days' notice for free-to-play games with purchases disabled

**Reference**

- [Belgian Gaming Commission: Research report on loot boxes (unofficial English translation, PDF)](https://www.skadden.com/-/media/files/publications/2019/08/video-gaming-egaming-law-update/fn12_onderzoeksrapportlootboxenengelspublicatie.pdf), April 2018; the finding that the paid loot boxes examined were illegal games of chance
- [Dirkzwager: Loot boxes in FIFA not a prohibited game of chance after all](https://www.dirkzwager.nl/kennis/artikelen/loot-boxes-in-fifa-toch-geen-verboden-kansspel-dwangsom-onterecht-opgelegd), April 1, 2022; the Council of State ruling on EA's FIFA packs, in Dutch
- [GOV.UK: Government response to the call for evidence on loot boxes](https://www.gov.uk/government/consultations/loot-boxes-in-video-games-call-for-evidence/outcome/government-response-to-the-call-for-evidence-on-loot-boxes-in-video-games), July 18, 2022; no change to gambling law and the expectation of industry-led measures
- [GOV.UK: Update on improvements to industry-led protections](https://www.gov.uk/guidance/loot-boxes-in-video-games-update-on-improvements-to-industry-led-protections), July 18, 2023; parental consent for under-18s, £0 default limits, probability disclosure, refunds and the 12-month implementation period
- [5Rights Foundation: Research reveals "non-existent" enforcement of industry-led standards on loot boxes](https://5rightsfoundation.com/research-reveals-non-existent-enforcement-of-industry-led-standards-on-loot-boxes), May 29, 2025; Xiao and Lund's before-and-after study of the UK's top-grossing iPhone games
- [Aju News: Probability disclosure for paid random items mandatory from March 22](https://www.ajunews.com/view/20240102104711033), January 2, 2024; the Ministry of Culture, Sports and Tourism's announcement of the amended enforcement decree, in Korean
- [4Gamer: Consumer Affairs Agency publishes its view on kompu gacha](https://www.4gamer.net/games/000/G000000/20120518018/), May 18, 2012; kompu gacha as banned card matching and the July 1, 2012 start, in Japanese
- [Forbrukertilsynet: Consumer authorities take action on harmful practices in the gaming industry](https://www.forbrukertilsynet.no/eng-articles/national-consumer-authorities-and-commission-take-action-on-harmful-practices-in-the-gaming-industry), March 21, 2025; the principles' announcement and the Star Stable action
- [European Commission: Stakeholder talks on the CPC Network's key principles](https://commission.europa.eu/news-and-media/news/european-commission-hosts-stakeholders-talks-application-cpc-networks-key-principles-games-virtual-2025-06-03_en), June 3, 2025; the principles' status and follow-up
- [FTC: Epic Games to pay more than half a billion dollars](https://www.ftc.gov/news-events/news/press-releases/2022/12/fortnite-video-game-maker-epic-games-pay-more-half-billion-dollars-over-ftc-allegations), December 19, 2022; button configurations, unwanted charges and account locks
- [FTC: Final order requiring Epic Games to pay $245 million](https://www.ftc.gov/news-events/news/press-releases/2023/03/ftc-finalizes-order-requiring-fortnite-maker-epic-games-pay-245-million-tricking-users-making), March 14, 2023; the ban on dark patterns, charges without consent and account locks
- [FTC: $126 million in refunds to Fortnite players](https://www.ftc.gov/news-events/news/press-releases/2025/06/ftc-sends-126-million-refunds-fortnite-players-who-were-charged-unwanted-items-reopens-claims), June 25, 2025; the refund rounds and the nearly $200 million total
- [FTC: Genshin Impact developer will be banned from selling loot boxes to teens under 16 without parental consent](https://www.ftc.gov/news-events/news/press-releases/2025/01/genshin-impact-game-developer-will-be-banned-selling-lootboxes-teens-under-16-without-parental), January 17, 2025; odds and exchange-rate disclosure, direct money purchase and the under-16 rule
- [Apple: Age requirements for apps distributed in Brazil, Australia, Singapore, Utah, and Louisiana](https://developer.apple.com/news/?id=f5zj08ey), February 24, 2026; loot boxes rated 18+ on the Brazil storefront
- [European Citizens' Initiative: Stop Destroying Videogames](https://citizens-initiative.europa.eu/stop-destroying-videogames_en), the 1,294,188 verified signatures, the February meeting, the April hearing, the May plenary debate and the Commission's June 16, 2026 communication and follow-up
- [European Citizens' Initiative: 14th valid initiative submitted to the Commission](https://citizens-initiative.europa.eu/news/14th-valid-initiative-stop-destroying-videogames-submitted-commission-examination-2026-01-26_en), January 26, 2026; submission, thresholds in 24 Member States and the July 27, 2026 reply deadline
- [heise: 1,294,188 signatures for "Stop Destroying Videogames"](https://heise.de/-11154579), about 1.45 million signatures collected before verification
- [UK Parliament: Petition 702074](https://petition.parliament.uk/petitions/702074), 189,886 signatures, the government response of February 3, 2025 and the November 3, 2025 debate
- [VGC: UK parliament debates Stop Killing Games campaign](https://www.videogameschronicle.com/news/digital-ownership-must-be-respected-uk-parliament-debates-stop-killing-games-campaign-but-government-doesnt-budge), November 4, 2025; the minister's position that mandating end-of-life plans isn't proportionate
- [CourtListener: Cassell v. Ubisoft Entertainment S.A.](https://www.courtlistener.com/docket/69344952/cassell-v-ubisoft-entertainment-sa/), E.D. Cal. 2:24-cv-03058; filed November 4, 2024, amended complaint March 18, 2025, terminated June 13, 2025
- [Morgan Lewis: California becomes first state to pass law targeting advertising of digital media licenses](https://www.morganlewis.com/pubs/2024/10/california-becomes-first-state-to-pass-law-targeting-advertising-of-digital-media-licenses), October 17, 2024; AB 2426's signing, effective date, two compliance paths and exemptions
- [Frankfurt Kurnit: Steam updates checkout disclosures in light of new California law](https://technologylaw.fkks.com/post/102jlqx/steam-updates-checkout-disclosures-in-light-of-new-california-false-advertising-l), October 14, 2024; Steam's license notice and the acknowledgment path's contents
- [LY Corporation: LINE GAME title end and refund notice](https://www.lycorp.co.jp/ja/news/announcements/008711/), the Payment Services Act Article 20(1) refund for LINE HELLO BT21 and its application period, in Japanese

**In practice**

- [ESRB: In-Game Purchases (Includes Random Items)](https://www.esrb.org/blog/in-game-purchases-includes-random-items/), the label's scope, including purchases with bought currency
- [PEGI: Expanded age rating criteria](https://pegi.info/news/pegi-expands-age-rating-criteria-interactive-risk-categories), paid random items PEGI 16 by default from June 2026
- [Steam: Refunds](https://store.steampowered.com/steam_refunds/), the 14-day, two-hour rule and in-game purchase refunds by developer opt-in
- [Insider Gaming: Ubisoft taking The Crew offline](https://insider-gaming.com/ubisoft-taking-the-crew-offline/), December 15, 2023; the March 31, 2024 shutdown and Ubisoft's stated infrastructure and licensing reasons
- [Stop Killing Games wiki: The Crew](https://stopkillinggames.wiki.gg/wiki/The_Crew), the December 14, 2023 delisting and stop of microtransaction sales, and the lawsuit's voluntary dismissal
- [Gfinity: Ubisoft pulls The Crew digital copies from libraries](https://www.gfinityesports.com/article/ubisoft-pulls-the-crew-digital-copies-from-libraries), April 2024; the "inactive games" section and installs launching a demo
- [Ubisoft: The Crew 2 offline mode patch notes](https://www.ubisoft.com/en-us/game/the-crew/the-crew-2/news-updates/4kuseh7DXQ6fuf4tFoHix0/the-crew-2-offline-mode-patchnote), October 20, 2025; local saves and the systems disabled offline
- [Pure Xbox: Ubisoft update on offline mode for two The Crew titles](https://purexbox.com/news/2025/04/ubisoft-provides-update-on-offline-mode-for-two-the-crew-titles), April 25, 2025; offline modes committed for The Crew 2 and Motorfest
- [Gematsu: Knockout City to end service on June 6](https://gematsu.com/2023/02/knockout-city-to-end-service-on-june-6-private-hosted-server-edition-to-be-released-for-pc), February 2, 2023; end of service, the stop of real-money purchases and the PC private server edition
- [Siliconera: Mega Man X DiVE Offline release date set](https://www.siliconera.com/mega-man-x-dive-offline-release-date-set/), the September 1, 2023 offline edition at $29.99 and the September 27, 2023 end of the online service
- [TheSixthAxis: Concord is shutting down, refunds being issued](https://www.thesixthaxis.com/2024/09/03/concord-is-shutting-down-this-week-refunds-being-issued-while-they-explore-options/), September 3, 2024; the September 6 shutdown and full refunds
- [Gematsu: XDefiant to end service on June 3, 2025](https://gematsu.com/2024/12/xdefiant-to-end-service-on-june-3-2025), December 3, 2024; refunds for the Ultimate Founder's Pack and purchases in the prior 30 days
