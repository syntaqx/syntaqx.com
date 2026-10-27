+++
title = "Ratings, Age & Children"
description = "ESRB, PEGI and IARC ratings, purchase labels, platform age signals, COPPA in games, the FTC's game orders, parental controls, and how to build ratings as data."
category = "Gaming Industry"
order = 1625
part = "The Rules"
tags = ["gaming", "ratings", "esrb", "pegi", "coppa", "children", "parental-controls"]
+++

Every game that ships through a store carries an age rating, and every online game has to decide what it does when the player is a child. The two questions sound related and are handled by different people under different rules. A rating describes the **content** (violence, language, gambling themes) and, increasingly, the **interactive risks** (purchases, random items, chat). Children's privacy and safety law governs what the **service** does with a young player: what it collects, who they can talk to, what they can buy and who has to agree first.

This chapter covers both from a game's point of view: the rating systems and their purchase labels (ESRB, PEGI and IARC, then China, Japan, South Korea, Brazil, Australia and Germany), the age signals platforms now pass to games, COPPA as it applies to games, the FTC's orders against game companies, the parental controls players already have on their consoles and PCs, and how to build ratings and age rules as data. The general law of children's privacy (COPPA's text, consent methods, the UK Children's Code, age assurance and state app-store laws) is in the playbook's [Children's Privacy & Age Assurance](/docs/compliance/childrens-privacy); this chapter links to it rather than repeating it. Loot box regulation beyond ratings is in [Loot Boxes & Consumer Law](/books/gaming/consumer-law-and-loot-boxes). Dates are as of October 2026, and none of this is legal advice.

## Two Kinds of Rule

Ratings and children's law differ in where they come from and what failing them costs.

| | Age ratings | Children's privacy and safety law |
| --- | --- | --- |
| Source | Industry bodies (ESRB, PEGI, USK and others), plus some national law | Statute and regulation (COPPA, UK GDPR and the Children's Code, the Online Safety Act, the DSA, state app-store laws) |
| Subject | The content and interactive features of a product | What the service does with a child's data, contacts and money |
| Who acts | The publisher answers a questionnaire or submits the game; the store displays the result | The operator, continuously, for every player |
| Changes when | The game's content or features change | The player's age, consent or location changes, or the law does |
| Failure | A wrong label, a re-rating, a store delisting | Regulatory orders, civil penalties, private suits |

A rating is attached to a product version. Children's law is attached to a player session. A system that handles both needs ratings as data on the game and its builds, and age as data on the account, with rules that join them.

## ESRB

The Entertainment Software Rating Board rates games in North America. Its categories, from its ratings guide:

| Rating | ESRB description |
| --- | --- |
| E (Everyone) | "Content is generally suitable for all ages" |
| E10+ | "Content is generally suitable for ages 10 and up" |
| T (Teen) | "Content is generally suitable for ages 13 and up"; may contain "simulated gambling" among other things |
| M (Mature 17+) | "Content is generally suitable for ages 17 and up" |
| AO (Adults Only 18+) | "Content suitable only for adults ages 18 and up"; may include "gambling with real currency" |
| RP (Rating Pending) | Not yet rated; appears only in advertising for a game expected to carry a rating |

Alongside the rating, content descriptors explain why, and **Interactive Elements** flag features that "do not influence the rating assignment of a product":

- **In-Game Purchases:** "Contains in-game offers to purchase digital goods or premiums with real world currency," covering items such as bonus levels, skins, subscriptions and season passes.
- **In-Game Purchases (Includes Random Items):** the same, where "the player doesn't know prior to purchase the specific digital goods or premiums they will be receiving." The ESRB announced it on April 13, 2020, and it covers loot boxes, gacha, item or card packs, prize wheels and treasure chests, including when the purchase is made "with virtual coins or other forms of in-game currency that can be purchased with real world currency."
- **Users Interact:** "possible exposure to unfiltered/uncensored user-generated content," including user-to-user messaging.
- **Shares Location** and **Unrestricted Internet.**

The ESRB's position matters for design: in North America, adding loot boxes changes the label but not the age.

## PEGI

The Pan European Game Information system rates games in most of Europe with age labels of 3, 7, 12, 16 and 18, content descriptors (violence, bad language, fear or horror, gambling, sex, drugs, discrimination), and a set of **interactive risk descriptors**: In-Game Purchases, Paid Random Items, Time-Limited Offers, Cryptocurrency, Pressure to Play and Unrestricted Communication.

PEGI differs from the ESRB on exactly the point the ESRB set aside: since 2026, interactive features change the age. On March 12, 2026, PEGI announced that newly submitted games are rated on broader criteria from June 2026:

- **Paid random items:** "the default rating will be PEGI 16 if the game contains paid random items," and PEGI 18 in some cases.
- **Time-limited or quantity-limited offers:** PEGI 12.
- **NFTs or blockchain mechanisms:** PEGI 18.
- **Play-by-appointment:** rewards for returning (daily quests, login streaks) PEGI 7; PEGI 12 if players are punished for not returning, by losing content or progress.
- **Communication** that is "entirely unrestricted" (no blocking or reporting): PEGI 18.

On October 6, 2026, PEGI announced that existing digital-only games rated PEGI 3, 7 or 12 with paid random items are being re-rated to **PEGI 16** with the "Paid random items" descriptor, across all storefronts that use PEGI ratings. PEGI's stated reason was to "avoid that our age ratings over time become inconsistent" as online games stay live for years.

For a live game, that turns a monetization decision into a rating decision. A mobile game rated PEGI 7 that adds a paid gacha banner in Europe is now a PEGI 16 game, which changes who the stores will show it to and which parental control settings block it. A battle pass whose missions expire and take progress with them sits at PEGI 12 at least. The numbers are in the sheet below.

![Age-line sheet: a horizontal age axis from 0 to 18 at 30 px a year, with one row per regime. COPPA marks a child as under 13; Utah's app-store law splits ages into child under 13, 13 to 15 and 16 to 17; the UK Children's Code treats everyone under 18 as a child; the FTC's HoYoverse order requires parental consent for loot boxes under 16; ESRB thresholds fall at 10, 13, 17 and 18; PEGI's at 3, 7, 12, 16 and 18, with 16 highlighted as the default for paid random items. A dimension chain gives A1 = 13, A2 = 3 and A3 = 2, closing to A0 = 18.](/diagrams/gm-ratings-and-age-lines.svg "The lines that matter fall at 13, 16 and 18. Store age as a band that can answer each regime's question, not as a single is-child flag.")

## IARC

Most digital storefronts don't send each game to each rating board. The International Age Rating Coalition describes itself as "a streamlined global age rating system for digitally delivered games and apps," and says more than 119 million games and apps have been published with ratings assigned through its system. A publisher answers one questionnaire about the game's content and features, and the system issues the rating of each participating authority for its region. PEGI notes that its ratings are issued on IARC storefronts, including a "PEGI !" (parental guidance) label for some non-game apps with user-generated content, and the USK says that "within the IARC system, the USK also assigns age ratings for games and apps."

The engineering point is that a questionnaire is an input you own. The answers describe your game at a moment; change the game and the answers may no longer be true. Store the answers you gave, with the build they described, next to the certificate you received.

## Other Regions and Store Ratings

Outside the ESRB and PEGI territories, rating bodies differ in what they rate, whether the rating is law, and what else the state requires before a game may run at all. As of October 2026:

| Region | Body | Categories | What needs a rating | What it means for the system |
| --- | --- | --- | --- | --- |
| China | National Press and Publication Administration (NPPA) approves; the CADPA's group standard adds age reminders | No statutory age rating; voluntary 8+, 12+ and 16+ age-appropriateness reminders, announced December 2020 | Every online game, before it is published online: an application to the provincial publishing authority, then NPPA approval; publishing without it risks shutdown and fines of 5 to 10 times illegal revenue of 10,000 yuan or more | Real-name registration and login for every account, with no guest or trial mode; minors served only from 20:00 to 21:00 on Fridays, Saturdays, Sundays and public holidays, since September 1, 2021 |
| Japan | CERO | A (all ages), B (12+), C (15+), D (17+), Z (18+ only) | Games sold in Japan on consoles, PC, phones and cloud services; for online console games, only the framework, not "variable components such as bulletin boards that can be modified by users" | The rating covers the shipped game, so live and user-made content is the moderation pipeline's job; complete gacha is banned by separate law ([South Korea and Japan](/books/gaming/consumer-law-and-loot-boxes#south-korea-and-japan)) |
| South Korea | Game Rating and Administration Committee (GRAC) | All, 12+, 15+ and adults only (Apple shows it as 19+) | Nearly every game is rated by one of 11 designated self-classification operators, including Google, Apple and Epic Games, which rated 99.9% of 2,019,426 games in 2025, with GRAC monitoring after the fact; Epic's user-generated content alone was 52.1% | GRAC can override a store's rating; Apple requires a GRAC Rating Classification Number for frequent simulated gambling; paid random item odds must be published ([South Korea and Japan](/books/gaming/consumer-law-and-loot-boxes#south-korea-and-japan)) |
| Brazil | Ministry of Justice and Public Security (ClassInd) | L (general), 6 (added by an October 2025 ordinance), 10, 12, 14, 16, 18 | Games, and since the October 2025 ordinance apps of every kind, including online games and apps where users interact; Decree 12,880 of March 18, 2026 names in-game interaction, loot boxes and microtransactions among the risks a game's rating weighs | Loot boxes are prohibited in games for minors or likely to be accessed by them; under the decree's Article 23 the supplier verifies age and blocks the feature for minors, ships a version without loot boxes, or turns the feature off by default ([Brazil, and the Stores as Regulators](/books/gaming/consumer-law-and-loot-boxes#brazil-and-the-stores-as-regulators)) |
| Australia | Classification Board | G, PG and M advisory; MA 15+ and R 18+ legally restricted; RC (Refused Classification) can't be sold | Games supplied in Australia | Paid loot boxes carry a minimum M and simulated gambling a mandatory R 18+, for games classified from September 2024 ([Australia](/books/gaming/consumer-law-and-loot-boxes#australia)) |
| Germany | USK | 0, 6, 12, 16, 18, under section 14 of the Youth Protection Act | Physical games by USK review; digital games through IARC; since January 1, 2023, new submissions are assessed for usage risks (chats, in-game purchases, random items, location sharing) | Usage risks can raise the age: just under 30% of digital games rated in 2024 had them, and about a third of those got a higher rating, mostly for pressure to keep playing and increased purchase incentives |

Two patterns follow. In China the rules are gates on operation, not labels: approval decides whether the game runs, and the play-time window and real-name login are server-side rules on every session, keyed on a verified identity. Everywhere else the direction is PEGI's: interactive features (paid random items, chat, purchase pressure) increasingly move the age, so the build feature check in [Ratings as Data](#ratings-as-data) matters in every region, with one `game_ratings` row per authority.

### Store Ratings

Ratings aren't uniform even inside a single store. Apple's App Store uses its own scale (4+, 9+, 13+, 16+ and 18+) for regions without additional requirements, and region-specific values for Australia, Brazil and Korea. Its questionnaire asks about the features this chapter cares about, with Apple's definitions:

- **Loot Boxes:** "Virtual containers that provide players with randomized virtual items for purchase," listed at 9+ in the default scale.
- **Messaging and Chat** and **User-Generated Content,** both listed among the 4+ items.
- **Simulated Gambling** (13+ when infrequent, 18+ when frequent) and **Gambling** with real money or exchangeable currency (18+).
- **In-app controls:** whether the app has **Parental Controls** and **Age Assurance**.

Regional rules override the default. On February 24, 2026, Apple announced that on the **Brazil** storefront, an app that declares loot boxes in the questionnaire is updated to an **18+** rating, and that from the same date Apple blocks users in Australia, Brazil and Singapore from downloading 18+ apps unless they've been confirmed as adults. Korea's App Store values put loot boxes at 12+ and frequent simulated gambling at 19+. A loot box that is a 9+ feature in one country is a 12+ or 18+ feature in another, decided by the same checkbox, and the national rules in the table above sit underneath ([The Rules by Jurisdiction](/books/gaming/consumer-law-and-loot-boxes#the-rules-by-jurisdiction)).

## Platform Age Signals

Until recently a game learned a player's age by asking. Since 2026 the platforms pass age down, because state laws require app stores to verify it:

- **Apple's Declared Age Range API** returns an age band, or the age category a law defines, with the method used and whether parental controls are on. Utah's categories (under 13, 13 to 15, 16 to 17, adult) apply to new accounts in Utah from May 6, 2026; Louisiana's from July 1, 2026; Texas's from June 4, 2026, after an injunction against the law was lifted.
- **Apple's Significant Change API** (PermissionKit) asks a parent to approve a significant update for a child; until they do, the child must be kept from it. A `RESCIND_CONSENT` server notification tells you when a parent withdraws consent, and Apple stops the app launching.
- **Google's Play Age Signals API** returns signals in Brazil (since March 17, 2026) and for eligible Texas accounts created after May 28, 2026, and its terms forbid using them for "advertising, marketing, user profiling, or analytics."

Utah's law defines a **significant change** as a material change to an app's terms or privacy policy that, among other things, adds "new monetization features," such as in-app purchases or ads, or alters "the app's age rating or content descriptions." For a game, that's most seasons: a new paid currency, a new loot box, a new ad placement, a feature that triggers a PEGI re-rating. Treat the significant-change flag as part of the release, not a legal afterthought. The general mechanics, and the developer duties and dates in Utah's text, are in [Children's Privacy & Age Assurance](/docs/compliance/childrens-privacy#us-state-app-store-laws).

## COPPA in Games

COPPA applies to games the same way it applies to any online service: to games directed to children under 13, and to any game whose operator has actual knowledge it is collecting personal information from a child ([the rule in detail](/docs/compliance/childrens-privacy#coppa)). Games trip it in specific places.

**Directed to children** is judged on subject matter, visual content, "animated characters or child-oriented activities and incentives," music, celebrities who appeal to children, the ads, and evidence about who actually plays, including "the age of users on similar websites or services." A cartoon-styled game with a T rating can still be directed to children in part. The **mixed audience** category fits most all-ages games: you may screen for age, neutrally, before collecting anything, and treat only players identified as under 13 as children.

**Personal information in a game** includes things a game team doesn't think of as personal:

- **A display name** that "functions in the same manner as online contact information," which is any name another player can use to message the child.
- **Voice chat audio,** as "an audio file" containing "a child's voice."
- **Avatars made from a photo,** which the FTC's 2023 order with Microsoft treated as covered.
- **The device and account identifiers** every telemetry, crash and anti-cheat SDK collects. Those are persistent identifiers, allowed without consent only for "support for the internal operations" (analytics of how the game functions, security and anti-cheat, network communications, personalizing content), and never to "amass a profile on a specific individual" or for behavioral advertising.
- **Free-text chat,** because a child can type their address into it. Filtering personal information out of a child's posts before they're public is the rule's own way out of treating them as collected.

**Chat and voice** are the features that most change a game's position. COPPA treats enabling a child "to make personal information publicly available" as collection. The FTC's orders below required chat for children and teens to be off by default. And the UK's Online Safety Act reaches any service where users "interact with each other" ([Children's Privacy & Age Assurance](/docs/compliance/childrens-privacy#the-uk-online-safety-act)). The systems for chat, filtering and moderation are in [Parties, Presence, Chat & Voice](/books/gaming/social-systems) and [Player Behavior & Moderation](/books/gaming/player-behavior).

## The FTC's Game Orders

Three FTC actions against game companies set the practical bar. Each is described here as the FTC's own announcements describe it.

**Epic Games (Fortnite), December 19, 2022.** A **$275 million civil penalty for COPPA violations**, which the FTC called "the largest penalty ever obtained for violating an FTC rule," announced alongside a separate billing settlement. The FTC alleged that Epic collected personal information from children under 13 without parental notice and consent, and that "Epic's settings enable live on-by-default text and voice communications for users." The order requires voice and text chat to be turned off by default for children and teens unless affirmative consent is given. The billing side (button layouts, charges without consent, locking accounts that disputed charges) is in [Loot Boxes & Consumer Law](/books/gaming/consumer-law-and-loot-boxes#the-ftc-s-orders).

**Microsoft (Xbox), June 5, 2023.** A **$20 million** settlement over COPPA. The FTC alleged that Microsoft collected children's personal information during account sign-up before involving a parent, and kept data when a parent didn't finish setting up a child's account, between 2015 and 2020. The order requires Microsoft to tell game publishers when a user is a child, so the publisher applies COPPA too, and it treats avatars generated from a child's image, along with biometric and health data, as covered personal information.

**Cognosphere, doing business as HoYoverse (Genshin Impact), January 17, 2025.** A proposed order with a **$20 million** penalty, requiring court approval. On the children's side, the FTC alleged that the game was marketed to children and collected their data without parental consent; the order requires COPPA compliance, deletion of data collected from children under 13 without consent, and a parent's affirmative express consent before a child under 16 can buy loot boxes. Its odds, currency and pricing rules are in [Loot Boxes & Consumer Law](/books/gaming/consumer-law-and-loot-boxes#the-ftc-s-orders).

Three lessons recur. Defaults are what the FTC judges: chat on by default for a child is the violation, whatever the settings menu offers. Sign-up is where collection starts, so the age screen and parent flow come before anything else is stored. And platform and publisher share the problem: the Microsoft order made the platform tell the game, and a game that receives "this is a child" from a platform has actual knowledge from that moment.

## Parental Controls on Consoles and PCs

Every major platform gives parents controls that a game should respect, not duplicate badly:

- **Xbox** family settings, managed in the Xbox Family Settings app, let parents set screen time by day, filter games, apps and websites "based on the age of their children," require Ask a Parent approval for purchases, and "allow or block your child's ability to join multiplayer online games, create and join clubs."
- **PlayStation** family management sets an age level for games (content starts "if the age rating is the same or lower than the child's age"), playtime limits, a monthly spending limit for PlayStation Store that is **0 by default**, and a Communication and User-Generated Content restriction that disables "sending text messages and voice chatting with other players" and sharing or seeing user-generated content.
- **Nintendo Switch** Parental Controls set daily play limits, restrict games "based on the ESRB age rating" in the US, limit "your child's ability to exchange messages and images with other users," and restrict spending on Nintendo eShop.
- **Mobile** platforms add their own controls and, since 2026, the age signals above.

Two gaps matter for a game. First, platform spending limits cover the platform's store; PlayStation's applies to PlayStation Store purchases, so a game that sells currency through its own web shop or another payment path sits outside it. Second, a game that runs its own chat or voice service has to apply the platform's communication restriction to its own systems, which means reading it from the platform at sign-in and on every session, not once at install. A game that keeps its own accounts across platforms ([Accounts, Identity & Cross-Platform](/books/gaming/accounts-and-identity)) should apply the **strictest** setting from any linked platform, the same lowest-wins rule the age signals use.

## How to Build It

Ratings are data on the game, age is data on the account, and the rules that join them are data too.

### Ratings as Data

A rating belongs to a game in a region over a period, comes from an authority, and was produced by a set of answers about a version of the game. The table extends the volume's core model ([The Games Business](/books/gaming/games-business#the-core-data-model)); `tenant_id` is the studio or publisher, as there:

```sql
CREATE TABLE game_ratings (                 -- one authority's rating of a game, over time
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id             UUID NOT NULL,
  game_id               UUID NOT NULL REFERENCES games (id),
  authority             TEXT NOT NULL,      -- 'esrb', 'pegi', 'usk', 'apple', ...
  region                TEXT NOT NULL,      -- 'US', 'EU', 'BR', ...
  rating                TEXT NOT NULL,      -- 'T', '16', '13+'
  content_descriptors   TEXT[] NOT NULL DEFAULT '{}',
  interactive_elements  TEXT[] NOT NULL DEFAULT '{}',  -- 'in_game_purchases', 'paid_random_items', 'users_interact'
  certificate_ref       TEXT,               -- IARC certificate or the authority's reference
  questionnaire_version TEXT NOT NULL,      -- the answers that produced this rating
  rated_build_id        UUID REFERENCES builds (id),  -- the build the answers described
  valid_during          TSTZRANGE NOT NULL,
  EXCLUDE USING gist (game_id WITH =, authority WITH =, region WITH =,
    valid_during WITH &&)                   -- one live rating per authority and region
);

CREATE TABLE build_features (               -- what a build actually contains, declared in CI
  tenant_id UUID NOT NULL,
  build_id  UUID NOT NULL REFERENCES builds (id),
  feature   TEXT NOT NULL,                  -- 'in_game_purchases', 'paid_random_items',
                                            -- 'time_limited_offers', 'users_interact',
                                            -- 'voice_chat', 'ads', 'web_shop'
  PRIMARY KEY (build_id, feature)
);
```

The valuable check is the join. A release pipeline that knows what a build contains can compare it with what the ratings say:

```sql
-- Features in a candidate build that no live rating declares
SELECT bf.feature, gr.authority, gr.region
FROM build_features bf
JOIN builds b       ON b.id = bf.build_id
JOIN game_ratings gr ON gr.game_id = b.game_id
                    AND gr.valid_during @> NOW()
WHERE bf.build_id = $1
  AND bf.feature IN ('paid_random_items', 'time_limited_offers', 'users_interact')
  AND NOT (bf.feature = ANY (gr.interactive_elements));
```

A row back means the build adds something the ratings don't know about: a re-rating, a new questionnaire, a significant-change notice to the app stores and possibly a parental consent requirement before child accounts see it. Content features (violence, gambling themes) can't be detected this way and stay with the producer and the questionnaire, but monetization and communication features can, and they're the ones that have moved in 2026. The same feature list drives the significant-change flag that Utah's definition requires ([Live Operations](/books/gaming/live-operations) owns the release calendar).

### Age and Features

The playbook's `age_signals` and `parental_consents` tables apply to a game as written, with `tenant_id` added and `accounts` meaning the publisher account: signals are append-only, consents are per scope, and the effective band is derived from the signals with lowest-wins ([Children's Privacy & Age Assurance](/docs/compliance/childrens-privacy#how-to-build-it)). The `age_band` column that [Accounts, Identity & Cross-Platform](/books/gaming/accounts-and-identity#how-to-build-it) puts on `accounts` is a cache of that derivation, rewritten whenever a signal arrives and never set directly. In a game, the signals come from the platforms (Apple and Google signals, console child accounts), the game's own age screen, a parent's setting, and the moderation team when a player's behavior suggests they're younger than they said.

The features that depend on the band are a short, stable list: **text chat, voice chat, user-generated content, friend requests from strangers, purchases, paid random items, ads and ad personalization, and data sharing with third parties.** For each, a rule keyed by jurisdiction, band and date gives a mode and the consent scope that unlocks it. Rules are effective-dated because the dates in this chapter keep moving ([Rules as Data](/docs/architecture/rules-as-data#effective-dates-and-versions)):

```sql
CREATE TABLE feature_age_rules (            -- what each feature does for each band, where and when
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  game_id       UUID REFERENCES games (id), -- null: every game of the tenant
  feature       TEXT NOT NULL CHECK (feature IN ('text_chat_strangers', 'text_chat_friends',
                  'voice_chat', 'ugc', 'friend_requests', 'purchases', 'paid_random_items',
                  'ads_personalized', 'third_party_sharing', 'public_profile')),
  jurisdiction  TEXT NOT NULL,              -- 'ALL', 'US', 'US-UT', 'GB', 'BE', ...
  age_band      TEXT NOT NULL CHECK (age_band IN ('under_13', '13_15', '16_17',
                  'adult', 'unknown')),
  mode          TEXT NOT NULL CHECK (mode IN ('off', 'needs_consent', 'on')),
  consent_scope TEXT,                       -- the parental_consents scope that unlocks it
  rule_version  INTEGER NOT NULL,
  valid_during  TSTZRANGE NOT NULL,
  CHECK ((mode = 'needs_consent') = (consent_scope IS NOT NULL)),
  EXCLUDE USING gist (tenant_id WITH =, game_id WITH =, feature WITH =,
    jurisdiction WITH =, age_band WITH =, valid_during WITH &&)
);
```

Evaluation takes every rule that matches the feature, the band and any jurisdiction the player is in (`ALL`, the country, the state) and applies the **strictest** mode, then intersects that with the platform's restriction and the parent's setting, so no layer can loosen another. The answer, with the rule version and the signals behind the band, is what the decision record keeps. My defaults for a game that children can reach:

| Feature | Under 13 | 13 to 15 | 16 to 17 |
| --- | --- | --- | --- |
| Text and voice chat with strangers | Off; parental consent to enable, and only filtered chat | Off by default; the player or a parent can enable | On, with blocking and reporting |
| Chat with friends | Parental consent | On | On |
| Paid random items | Parental consent | Parental consent (the HoYoverse line) | On; PEGI 16 already applies |
| Purchases | Parental consent; platform limits respected | Spending limits visible and settable | On |
| Behavioral ads and third-party data sharing | Off (separate COPPA consent required) | Off | Off where DSA Article 28 applies |
| Public profile and precise location | Off | Off by default | Off by default |

That table is opinion, not law, and it's stricter than some regimes require. It's built to satisfy the strictest regimes in this chapter at once, so that a player's location doesn't have to be known precisely to be safe. Creators have their own age floors and payout rules, and content built by creators carries its own maturity labels ([Age Rules for Creators and Players](/books/gaming/creator-economies#age-rules-for-creators-and-players)).

### Failing Safe

- **Unknown is the youngest band.** A player whose age hasn't been established gets the under-13 column until a signal says otherwise.
- **Platform restrictions win.** If a linked console says communication is restricted, the game's own chat is off, regardless of the game's setting.
- **Revocation is immediate.** A `RESCIND_CONSENT` notification or a parent's request through support closes the consent and takes effect on the next request, not the next login, and the event goes to every service that checks it ([Events & Async Messaging](/docs/architecture/events)).
- **Aging up is a date, not a guess.** A band boundary crossing is computed from the signal's data and handled by a job that offers new choices rather than flipping defaults.

## Auditing

The records a regulator, a parent or a platform will ask for:

- **Every age decision,** with the signals and their methods that produced the band, and the rule version that turned it into a feature mode.
- **Every consent and revocation,** with scope, method, the notice version the parent saw and the evidence reference.
- **Every rating,** with the questionnaire answers and the build they described, and the release that changed the features.
- **Default states over time.** The FTC's orders judge defaults, so keep the history of what each feature's default was, per band, and when it changed.

Record structure is in [Audit Trails](/docs/architecture/audit-trails#automated-and-ai-decisions).

## What This Means for the System You Build

- **Ratings as effective-dated rows** per game, authority and region, with the questionnaire version and the build it described.
- **Operating rules where a rating body is a gate,** such as China's approval, real-name login and play-time window, enforced on the server for every session.
- **A declared feature list per build,** checked in CI against the live ratings, so adding paid random items, time-limited offers or chat triggers a re-rating and a significant-change notice before release.
- **Age as signals, not a flag,** from platforms, the age screen, parents and moderation, with the effective band derived lowest-wins and unknown treated as under 13.
- **A rule table for the feature list** (chat, voice, UGC, purchases, paid random items, ads, data sharing) keyed by jurisdiction, band and date, with consent scopes.
- **Platform parental controls read every session** and applied to the game's own chat, store and web shop, strictest linked platform wins.
- **Chat off by default for children and teens,** with parental or teen consent recorded to turn it on.
- **Audit records** for age decisions, consents, ratings and default changes.

## References

**Specifications**

- [ESRB: Ratings guide](https://www.esrb.org/ratings-guide/), rating categories, content descriptors and the Interactive Elements that don't affect the rating
- [ESRB: In-Game Purchases (Includes Random Items)](https://www.esrb.org/blog/in-game-purchases-includes-random-items/), April 13, 2020; what the label covers, including items bought with purchased currency
- [PEGI: What do the labels mean](https://pegi.info/what-do-the-labels-mean), age labels, content descriptors, interactive risk descriptors and the IARC "PEGI !" label
- [PEGI: Expanded age rating criteria](https://pegi.info/news/pegi-expands-age-rating-criteria-interactive-risk-categories), March 12, 2026; paid random items PEGI 16 by default, time-limited offers, play-by-appointment, NFTs and unrestricted communication from June 2026
- [PEGI: Updated ratings for existing games with paid random items](https://pegi.info/news/pegi-updates-age-ratings-existing-games-paid-random-items), October 6, 2026; re-rating existing PEGI 3, 7 and 12 digital games to PEGI 16
- [IARC: About](https://www.globalratings.com/about.aspx), the global rating system for digital games and apps and its count of rated titles
- [USK: Age classification for games and apps](https://usk.de/en/home/age-classification-for-games-and-apps/), the USK's procedures and its role within IARC
- [USK: The USK age ratings](https://usk.de/die-usk-alterskennzeichen/), the five age labels under section 14 of the Youth Protection Act, in German
- [USK: In-game purchases, chats and loot boxes: USK expands its criteria](https://usk.de/usk-pressemitteilung-umsetzung-neues-jugendschutzgesetz/), usage risks considered for new submissions from January 1, 2023, and the additional notices, in German
- [USK: Annual statistics 2024](https://usk.de/usk-jahresstatistik-2024-30-jahre-jugendschutz-bei-games/), February 26, 2025; the share of games with usage risks and of those rated higher, in German
- [CERO: Code of Ethics](https://www.cero.gr.jp/en/relays/download/3/78/49/289/?file=%2Ffiles%2Flibs%2F289%2F%2F20250327114356889.pdf), revised March 24, 2025; scope, online console games, the five categories and covered platforms
- [CERO: Rating system](https://www.cero.gr.jp/en/publics/index/17/), what CERO rates and the content types it reviews
- [China: NPPA notice on preventing minors' addiction to online games (2021 No. 14)](https://www.gov.cn/zhengce/zhengceku/2021-09/01/content_5634661.htm), August 30, 2021; the one-hour window, real-name registration and login, in Chinese
- [China: Provisions on the Administration of Online Publishing Services](https://www.gov.cn/gongbao/content/2016/content_5074079.htm), Article 27 approval before an online game is published, and the Article 51 penalties, in Chinese
- [Brazil: Decree 12,880 of March 18, 2026](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/decreto/d12880.htm), the risks a game's rating weighs, loot boxes for minors and the Article 23 options, in Portuguese
- [Australian Classification: What are the ratings?](https://www.classification.gov.au/classification-ratings/what-are-ratings), advisory and legally restricted categories and Refused Classification
- [Federal Register: Children's Online Privacy Protection Rule (April 22, 2025)](https://www.govinfo.gov/content/pkg/FR-2025-04-22/html/2025-05904.htm), definitions of child, personal information, directed to children, mixed audience and internal operations

**Reference**

- [FTC: Fortnite video game maker Epic Games to pay more than half a billion dollars](https://www.ftc.gov/news-events/news/press-releases/2022/12/fortnite-video-game-maker-epic-games-pay-more-half-billion-dollars-over-ftc-allegations), December 19, 2022; the COPPA penalty, on-by-default chat and the order's default-off requirement
- [FTC: Microsoft to pay $20 million over charges it illegally collected personal information from children](https://www.ftc.gov/news-events/news/press-releases/2023/06/ftc-will-require-microsoft-pay-20-million-over-charges-it-illegally-collected-personal-information), June 5, 2023; sign-up collection, notifying publishers and avatars as personal information
- [FTC: Genshin Impact developer will be banned from selling loot boxes to teens under 16 without parental consent](https://www.ftc.gov/news-events/news/press-releases/2025/01/genshin-impact-game-developer-will-be-banned-selling-lootboxes-teens-under-16-without-parental), January 17, 2025; the under-16 consent rule and COPPA requirements
- [Apple: Age ratings values and definitions](https://developer.apple.com/help/app-store-connect/reference/app-information/age-ratings-values-and-definitions/), App Store age categories, region-specific values and definitions of loot boxes, chat, UGC, parental controls and age assurance
- [Apple: Age requirements for apps distributed in Brazil, Australia, Singapore, Utah, and Louisiana](https://developer.apple.com/news/?id=f5zj08ey), February 24, 2026; 18+ for loot boxes in Brazil, adult confirmation for 18+ downloads, and Utah and Louisiana dates
- [Apple: Update for apps distributed in Texas](https://developer.apple.com/news/?id=sg176nne), June 3, 2026; SB 2420 applying to new Texas accounts from June 4, 2026
- [Apple: Age assurance frameworks](https://developer.apple.com/support/age-assurance/), the Declared Age Range API, significant changes and `RESCIND_CONSENT`
- [Android Developers: Play Age Signals API](https://developer.android.com/google/play/age-signals/overview), signals in Brazil and Texas and the limits on their use

**In practice**

- [Xbox: Family hub](https://www.xbox.com/en-US/family-hub), screen time, age filters, Ask a Parent and multiplayer controls
- [PlayStation: Parental controls and spending limits on PS5](https://www.playstation.com/en-us/support/account/ps5-parental-controls-spending-limits/), age levels, the default monthly spending limit of 0 and communication restrictions
- [Nintendo: Parental controls](https://www.nintendo.com/us/switch/parental-controls/), play time, ESRB-based restrictions, communication and spending limits
- [Inven Global: GRAC's monitoring budget cut while rated games surge](https://www.invenglobal.com/articles/27035/game-classification-volume-up-but-monitoring-workforce-reduced), October 11, 2026; 2025 self-classification volumes, the 11 operators and Epic's user-generated content share
- [National Business Daily: Online game age-appropriateness reminder standard released](https://www.nbd.com.cn/articles/2020-12-16/1573626.html), December 16, 2020; the CADPA group standard's 8+, 12+ and 16+ markers, in Chinese
- [SBT News: Government creates a 6-year age band and extends ratings to apps](https://sbtnews.sbt.com.br/noticia/politica/governo-cria-nova-faixa-etaria-de-6-anos-na-classificacao-indicativa-e-amplia-regra-para-aplicativos), October 15, 2025; the new band and the extension to online games and interactive apps, in Portuguese
