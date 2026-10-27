+++
title = "UGC & Creator Economies"
description = "Games built by players: UGC platforms, creator payouts, affiliate codes and Drops, sandboxed scripts, review, IP takedowns, creator tax and age rules."
category = "Gaming Industry"
order = 1624
part = "Money"
aliases = []
tags = ["gaming", "ugc", "creator-economy", "mods", "payouts", "dmca"]
+++

Some games are made mostly by their players. Roblox and Fortnite's creative islands are platforms where the studio builds the engine, the economy and the safety systems, and millions of creators build the experiences; Steam Workshop, mod.io and CurseForge carry mods for thousands of games; a streamer's audience earns items for watching. Each of these turns players into a second kind of user, the **creator**, who uploads content that runs inside the game, earns money from it, and can break things the studio is accountable for: a script that exploits other players, an island that isn't suitable for the children who'll play it, a model copied from someone else's game.

This chapter is the creator side of a game's money and platform: how the major UGC platforms work, how creators get paid (sales shares, engagement pools, points), affiliate codes and Drops, how user content is sandboxed and reviewed before it ships, IP takedowns, creator identity and tax, and age rules for creators and the players of their content. The player-facing economy that creators sell into is in [Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements); moderating what players build is in [Player Behavior & Moderation](/books/gaming/player-behavior#user-generated-content-and-young-players); paying creators out is a vendor payout problem, covered in [Vendor Payouts](/books/payments/vendor-payouts).

## How the Platforms Do It

As of October 2026, from each platform's public documentation:

| Platform | What creators make | How creators earn | Who may earn |
| --- | --- | --- | --- |
| **CurseForge** | Mods and add-ons, largely for Minecraft and World of Warcraft | Points from a project's popularity, worth $0.05 each, redeemed for payouts | Authors who opt in to the rewards program |
| **Fortnite** (UEFN and Fortnite Creative) | Islands built in Unreal Editor for Fortnite with Verse, or in Creative | A share of an engagement pool funded by Item Shop revenue; a share of in-island V-Bucks transactions | Fortnite Developer Program: 18 or older, a qualifying purchase, tax verification |
| **mod.io** | Mods and UGC across PC, console and mobile, embedded in a game's own UI | Studio-run marketplaces with a split each studio defines; partner program for creators | Vetted by each studio's criteria; KYC at cash-out |
| **Roblox** | Whole experiences in Roblox Studio with Luau scripts; avatar items; Creator Store assets | Robux from passes, products and items, exchanged for cash through Developer Exchange; engagement-based Creator Rewards | DevEx: 13 or older, verified email, tax form, 30,000 earned Robux minimum |
| **Steam Workshop** | Items, maps and mods for a specific game | Paid items in a curated Workshop, at a share each developer sets | Contributors who accept the Workshop Legal Agreement; Steam accounts are 13+ |

The split is between **platforms where the game is the creators' work** (Roblox, Fortnite), which run a full economy with payouts, rating, moderation and fraud control, and **mod hosts attached to someone else's game** (Workshop, mod.io, CurseForge), where the studio decides what is allowed and the host provides distribution, review tooling and, increasingly, payments. A studio adding UGC to its own game usually starts as the second and grows toward the first.

## How Creators Get Paid

There are three ways a game platform pays creators, and the big platforms combine them. Video, streaming and membership platforms add subscriptions, tips and ad revenue shares, compared in the User-Generated Platforms book's [Creator Monetization](/books/user-generated-platforms/creator-monetization#revenue-splits-compared).

**A share of sales.** The creator sells something (a pass, an item, a mod) and gets a percentage. Roblox says creators "generally earn 70%" of what they sell in Robux in their own experience and "30% of anything they sell in the Marketplace." Its marketplace terms show how detailed a split gets: on an in-experience purchase of an avatar item, the item's creator receives 30% and the experience owner 40%, the creator's share rises to 70% when the item is priced at six times the floor, uploads cost 80 Robux, and proceeds sit in escrow for 30 days. Fortnite's in-island transactions pay developers "ordinarily" 50% of the V-Bucks value, raised to 100% from 9 January 2026 through 31 January 2027. Steam's Workshop leaves the percentage to the game: contributors' share is a portion of Adjusted Gross Revenue "determined by the developer/publisher," and contributors on a shared item "specify revenue split percentages" among themselves. mod.io's marketplace is the same: "Studios define how revenue is split with their content creators."

**A share of an engagement pool.** The platform puts a share of its revenue into a pool and divides it by how much players engage with each creator's content. Fortnite's version: "Forty percent of the eligible net revenue from Fortnite's Item Shop and related real-money purchases is placed into an Engagement Pool," allocated daily and paid "30 days after the end of the calendar month," using active playtime, retention and playtime around Item Shop spending. Roblox's Creator Rewards, which replaced its earlier engagement-based payouts and affiliate program from 24 July 2025, pay 5 Robux a day for each qualifying user, an "Active Spender" who has spent at least $9.99 in the past 60 days, who opens the experience among their first three of the day and spends at least 10 minutes in it.

**Points.** CurseForge allocates a monthly pool of points by a project's popularity in its client and website, distributed daily, each worth $0.05; authors who don't log in for 60 days stop accruing.

What the engagement models have in common is their defense against fraud: **only engagement from paying players counts.** Fortnite counts engagement from "Fortnite players who have made a real money purchase on their accounts"; Roblox's daily reward needs an Active Spender. A pool divided by raw playtime is an invitation to bot farms; tying it to accounts with real payment history makes faking engagement cost money. The same principle applies to any game that pays creators by usage: the measure has to be one that's expensive to fake, and it has to be computed on the server from match and session records, never from a client's report ([Telemetry & Analytics](/books/gaming/telemetry)).

Paying for new players is the other common lever. Fortnite gives a developer "75% of that player's contributions to the Engagement Pool for the next six months" for players new to Fortnite (or returning after more than six months) who come for their island; Roblox's Audience Expansion pays "a 35% revenue share on their first $100 of Qualifying Purchases" for new or reactivated users an experience brings in. Both need attribution: which creator brought this player, first, and for how long the credit lasts.

### Cash-Out

On Roblox the earned currency and the cash are separate steps. Developer Exchange converts "Earned Robux" (not purchased Robux) at $0.0038 per Robux since 5 September 2025, previously $0.0035, with a higher $0.0054 rate for certain earnings from purchases by US players verified as 18 or older, and only "when you have a minimum of 30,000 Earned Robux." Separating earned from purchased currency is the same paid-and-earned split as any game wallet ([Paid and Earned Currency Are Different Money](/books/gaming/economies-and-entitlements#paid-and-earned-currency-are-different-money)), with a third bucket: currency a creator earned from other players, which is convertible to cash and therefore a liability the platform owes.

## Affiliate Codes and Drops

Creators who don't build content still sell it. Two mechanisms connect a creator's audience to a game's economy.

**Creator codes.** A player enters a streamer's code in the store, and a share of their purchases goes to the creator for a period. Epic's Support-A-Creator is the best-known program; Roblox's Audience Expansion is the same idea attached to an experience. The backend parts are an attribution (account to creator, with a start and an end), a rule for what purchases count, and an accrual per qualifying purchase that reverses if the purchase is refunded. The code is a label on the account with an effective date, not a field on the purchase that gets overwritten when the player switches creators ([Effective Dating & History](/docs/database/temporal-data)).

**Drops.** A viewer watches a stream and earns an in-game item. Twitch Drops is the reference design. The viewer claims the reward on Twitch, links their Twitch account to the game account, and the game fetches the entitlement and grants it:

- **Get Drops Entitlements** returns the claims for a game, filterable by user and by `fulfillment_status`, which is `CLAIMED` ("The user claimed the benefit") or `FULFILLED` ("The developer granted the benefit that the user claimed").
- **Update Drops Entitlements** marks up to 100 entitlement IDs as fulfilled, per call, and reports each as `SUCCESS`, `INVALID_ID`, `NOT_FOUND`, `UNAUTHORIZED` or `UPDATE_FAILED`, the last being transient and to be retried.
- **Late links still count.** Twitch requires developers to fulfill for viewers who "claim and link their accounts at least 14 days after the campaign ends."

That is the store transaction state machine again with different names ([Receipt Validation and Entitlement Grants](/books/gaming/stores-and-payments#receipt-validation-and-entitlement-grants)): read the claim from the platform server-to-server, grant the entitlement keyed by the Drops entitlement ID so a retry can't grant twice, then mark it fulfilled. Grant before marking fulfilled; if marking fails, the retry is harmless. The account link is the precondition, and it follows the same rules as any platform identity link ([Linking](/books/gaming/accounts-and-identity#linking)): an unlinked viewer's claim waits, and a link that moves between accounts must not move the rewards with it.

## Sandboxing User Scripts

When creators upload code, the code runs on your servers and your players' devices. The engine has to treat it as hostile.

Roblox's Luau is the clearest public example. Its sandbox is designed to be safe "even in the face of untrusted (and in Roblox's case, actively malicious) code": the `io` library "has been removed entirely," the `debug` library "to a large extent," `loadstring` doesn't accept bytecode, and each script gets its own globals so "all scripts are isolated from each other." The platform then layers authority on top. Roblox's security guidance tells creators to "Assume every piece of data sent from the client has been manipulated, fabricated, or sent with malicious intent," that "all critical logic must be validated server-side," and that exploiters can fire remote events "at any frequency with arbitrary arguments."

The rules for a game that runs creator code, taken from that design:

- **A language or VM you control,** with no file system, network or process access except through APIs you expose, and per-script isolation. Native code from creators belongs only in mods for single-player or private-server play, where the player accepts the risk.
- **Budgets per script.** CPU time per tick, memory, instance counts, outbound calls. A creator's infinite loop must stall their island, not the server process hosting several.
- **Creator code is client code when it runs on the client.** The server-authority rules in [Anti-Cheat](/books/gaming/anti-cheat#server-authority-is-the-first-defense) apply to creator scripts too; the platform makes the safe pattern the easy one (server-side state, validated remotes) and teaches it.
- **Platform services stay behind platform APIs.** Purchases, currency, chat and identity are called through APIs the platform enforces, so a creator's script can't grant itself currency or bypass the chat filter. Roblox requires creators to filter any displayed text "you don't have explicit control over" through its filtering service and removes experiences that don't "until you add filtering."
- **Mobile store rules apply.** On iOS, code not embedded in the binary is allowed for "HTML5 and JavaScript mini apps and mini games, streaming games, chatbots, and plug-ins" under Guideline 4.7, with purchases inside them following the in-app purchase rules ([Mobile Games](/books/gaming/mobile-games#app-review-and-store-rules)).

## Content Pipelines and Review

User content reaches players through a pipeline with gates, and the gates are where ratings, safety and platform certification are enforced.

- **Upload and scan.** Assets are validated (format, size, polygon and texture budgets) and scanned automatically for known-bad content. mod.io describes four moderation levels a studio can combine: automated scanning, rules-based moderation, content approval and community reporting.
- **Rating before release.** Fortnite requires "IARC-assigned age ratings" for every published island: the creator completes the IARC questionnaire before the island goes to moderation, islands may go no higher than ESRB Teen, PEGI 16 or IARC 16+, and "Inaccurate questionnaire responses may result in your content being rejected." Roblox's content maturity labels gate who may play an experience ([User-Generated Content and Young Players](/books/gaming/player-behavior#user-generated-content-and-young-players)). The rating is metadata on the content version, and the age gates in [Ratings, Age & Children](/books/gaming/ratings-and-age#age-and-features) read it.
- **Approval, for curated catalogs.** Steam's curated Workshop requires the developer to "approve each item," and Workshop items stay "hidden by default until the contributor agrees to the Steam Workshop Legal Agreement." Paid content is usually curated; free content often isn't.
- **Platform certification for consoles.** Console platform holders treat UGC as part of the game's certification, which is why mod.io advertises support for "certification requirements around UGC" and the "Word filtering, parental controls and safety processes required by each platform." The Xbox privilege for user-generated content is one of those a title must check ([Cross-Play, Cross-Progression and Cross-Purchase](/books/gaming/accounts-and-identity#cross-play-cross-progression-and-cross-purchase)).

My rule: **every content version is immutable and reviewed as a version.** A creator who updates an approved island submits a new version that goes through the gates again; players get the approved version until the new one passes. An approval that covers "the island" rather than a version is how unreviewed content ships under a reviewed label. Moderation after release (reports, takedowns, penalties on the creator) follows the same ladder as for players, from [Player Behavior & Moderation](/books/gaming/player-behavior) and [Trust & Safety](/docs/security/trust-and-safety); the creator-specific addition is that a penalty can also freeze earnings.

## IP and Takedowns

UGC platforms host content that infringes other people's rights, copied models, music and characters, and the law gives a host protection in exchange for a process.

In the US, the DMCA safe harbor (17 U.S.C. § 512) requires a host to have "designated an agent to receive notifications of claimed infringement," registered with the Copyright Office; to respond "expeditiously to remove, or disable access to" material on a valid notice; to restore it "not less than 10, nor more than 14, business days" after a counter-notice unless the claimant sues; and to adopt and reasonably implement a policy terminating "repeat infringers" in appropriate circumstances, and tell users about it. In the EU, the Digital Services Act requires hosts to run an electronic notice-and-action mechanism (Article 16) and to suspend, after a warning, users who frequently provide manifestly illegal content, and those who frequently file manifestly unfounded notices (Article 23).

The platforms' public processes follow that shape:

- **Roblox** runs Rights Manager, open to rights holders "that don't have a presence on Roblox," who register, verify ownership and report up to 250 links per claim; its IP guidelines say it generally restores content "within 14 business days" after a counter-notice and "suspends or terminates the accounts" of users "who repeatedly or egregiously infringe."
- **Steam** takes claims through a web form that warns that knowingly misrepresenting infringement creates liability.
- **mod.io** says its team "will action valid DMCA's, unless your team actions them sooner."

The same process at video-platform scale, with fingerprinting systems such as Content ID and the EU's Article 17, is in [Copyright at Scale](/books/user-generated-platforms/copyright#fingerprinting-and-content-id).

What that means for the system:

- **A claim is a case with a state machine:** received, validated, content disabled, creator notified, counter-notice received, restore scheduled, restored or kept down because the claimant sued. Each transition has a deadline the law sets, so the deadlines are data.
- **Takedowns are per content version and per item,** and disabling content must also stop sales and pause the earnings it accrues, without deleting the purchases players already made. Whether players keep an item that was taken down for infringement is a policy; record it.
- **Strikes count toward a repeat-infringer policy,** per creator account, with a published threshold, and the termination is a penalty like any other ([Penalties and Escalation Ladders](/docs/security/trust-and-safety#penalties-and-escalation-ladders)).
- **Abusive claimants are tracked too,** because the DSA requires it and because takedown notices are a harassment tool between rival creators.

## Creator Identity, KYC and Tax

A creator who earns money is a payee, and paying them brings identity checks and tax reporting the player-facing game never needed. The payout mechanics (enrollment, methods, a payout as a state machine, W-9s and TIN matching, 1099s) are in [Vendor Payouts](/books/payments/vendor-payouts#tax-w-9s-tin-matching-and-1099s), and the eligibility gates, risk holds, 1042-S and DAC7 reporting every creator and seller platform shares are in [Paying Creators & Sellers](/books/user-generated-platforms/paying-creators-and-sellers); the game-platform specifics:

- **Verification happens at cash-out, not at upload.** mod.io: "By default, KYC verification is only required for cash-out." Roblox's DevEx requires a verified email, a DevEx portal account and a W-9 or W-8 on file, and pays through Tipalti; its higher DevEx rate and Audience Expansion require ID verification. Epic's Fortnite Developer Program runs a tax interview through a provider that produces a W-9 or W-8 ("Verification can take up to five business days") and pays through Hyperwallet. Most platforms outsource the payee onboarding to a payouts provider, which also collects the tax forms.
- **Which tax form depends on how the money moves.** For payments to US creators, nonemployee compensation of $2,000 or more is reported on Form 1099-NEC for tax years after 2025 (Epic's FAQ still cited $600 as of October 2026, a reminder to read thresholds from the IRS, not a vendor page). Payment settlement entities report on Form 1099-K when payments to a payee exceed $20,000 across more than 200 transactions, the threshold the One Big Beautiful Bill reinstated retroactively. The [Vendor Payouts](/books/payments/vendor-payouts#tax-w-9s-tin-matching-and-1099s) chapter covers why a payment through a card or payment network goes on a 1099-K rather than a 1099-NEC.
- **Teams and splits.** Islands and mods are often made by several people. Steam's Workshop agreement has contributors set their own split; a platform with team payouts needs the split recorded per content version, agreed by every member, before earnings accrue, because changing it later reallocates money already earned.
- **Earned is not yet paid.** Earnings accrue daily or per sale, sit in escrow or a holding period (Roblox's 30 days for marketplace sales, Fortnite's payment 30 days after month end), and become payable only after refunds and fraud review have had time to land. A refund after payout becomes a negative balance the next payout absorbs.

## Age Rules for Creators and Players

UGC platforms are full of young players, and many creators are young too. The age rules differ by role:

- **Creating** is usually open with the platform's account: Steam accounts require age 13, and Roblox's creation tools come with a Roblox account.
- **Earning** has its own floor. Roblox DevEx requires creators to be at least 13; Fortnite's Developer Program requires 18. A minor's payouts raise contract and tax questions in most countries, which is why many programs set the floor at the age of majority, and the platform needs an age signal it trusts, not a birthday the creator typed ([Children's Privacy & Age Assurance](/docs/compliance/childrens-privacy)).
- **Playing** a creator's content follows the content's rating and the player's age band: Fortnite's island ratings and Roblox's maturity labels, read by the age model in [Ratings, Age & Children](/books/gaming/ratings-and-age).
- **Selling to children** inside creator content carries the same rules as the platform's own store: spending limits, parental controls and loot box rules apply to what creators sell ([Loot Boxes & Consumer Law](/books/gaming/consumer-law-and-loot-boxes)). Platforms enforce this by owning the purchase API, so a creator can't build their own checkout.

## How to Build It

The chapter's additions to the [core data model](/books/gaming/games-business#the-core-data-model): creators and their teams, content as reviewed versions, an earnings ledger that accrues and pays out, attribution to creators, and IP claims.

```sql
CREATE TABLE creators (                       -- a payee and publisher; one or more accounts
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  kind              TEXT NOT NULL CHECK (kind IN ('individual', 'team', 'company')),
  display_name      TEXT NOT NULL,
  status            TEXT NOT NULL CHECK (status IN ('active', 'earnings_frozen', 'terminated')),
  payee_ref         TEXT,                     -- the payouts provider's payee id, after KYC
  kyc_verified_at   TIMESTAMPTZ,
  age_verified_band TEXT,                     -- from the age model; gates earning
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE creator_members (
  creator_id   UUID NOT NULL REFERENCES creators (id),
  account_id   UUID NOT NULL REFERENCES accounts (id),
  role         TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'contributor')),
  valid_during TSTZRANGE NOT NULL,
  PRIMARY KEY (creator_id, account_id, valid_during)
);

CREATE TABLE ugc_content (                    -- an island, experience, mod or item line
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id   UUID NOT NULL,
  game_id     UUID NOT NULL REFERENCES games (id),
  creator_id  UUID NOT NULL REFERENCES creators (id),
  kind        TEXT NOT NULL CHECK (kind IN ('experience', 'mod', 'map', 'avatar_item', 'asset')),
  item_id     UUID REFERENCES items (id),     -- set when the content is sold as an item
  live_version_id UUID,                       -- the approved version players get
  status      TEXT NOT NULL CHECK (status IN ('draft', 'live', 'disabled', 'removed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ugc_content_versions (           -- immutable; reviewed as a unit
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  content_id     UUID NOT NULL REFERENCES ugc_content (id),
  version        INTEGER NOT NULL,
  package_uri    TEXT NOT NULL,
  package_sha256 TEXT NOT NULL,
  rating         JSONB,                       -- IARC certificate and per-authority ratings
  revenue_split  JSONB NOT NULL,              -- member account -> basis points, summing to 10000
  review_status  TEXT NOT NULL CHECK (review_status IN ('submitted', 'scanning',
                   'in_review', 'approved', 'rejected', 'withdrawn')),
  reviewed_by    TEXT,                        -- 'system:scanner' or 'agent:<id>'
  reviewed_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (content_id, version)
);

CREATE TABLE creator_attributions (           -- creator codes and new-player credit
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  account_id   UUID NOT NULL REFERENCES accounts (id),   -- the player
  creator_id   UUID NOT NULL REFERENCES creators (id),
  kind         TEXT NOT NULL CHECK (kind IN ('creator_code', 'new_player', 'reactivated')),
  valid_during TSTZRANGE NOT NULL,
  EXCLUDE USING gist (account_id WITH =, kind WITH =, valid_during WITH &&)
);

CREATE TABLE creator_earnings (               -- append-only accruals and their reversals
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  creator_id      UUID NOT NULL REFERENCES creators (id),
  content_id      UUID REFERENCES ugc_content (id),
  kind            TEXT NOT NULL CHECK (kind IN ('sale_share', 'engagement', 'attribution',
                    'reversal', 'adjustment', 'payout')),
  source          TEXT NOT NULL,              -- 'store_transaction', 'ledger_transaction', 'pool_day', 'payout'
  source_ref      TEXT NOT NULL,
  amount          BIGINT NOT NULL,            -- signed, minor units of the payout currency
  currency        TEXT NOT NULL,
  rule_version    TEXT NOT NULL,              -- which share, pool or rate applied
  payable_after   TIMESTAMPTZ NOT NULL,       -- end of escrow or holding period
  reverses_id     UUID REFERENCES creator_earnings (id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (creator_id, kind, source, source_ref)
);

CREATE TABLE ip_claims (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  content_version_id UUID NOT NULL REFERENCES ugc_content_versions (id),
  claimant        TEXT NOT NULL,
  regime          TEXT NOT NULL CHECK (regime IN ('dmca', 'dsa', 'other')),
  status          TEXT NOT NULL CHECK (status IN ('received', 'invalid', 'disabled',
                    'counter_noticed', 'restore_scheduled', 'restored', 'upheld')),
  counter_notice_at TIMESTAMPTZ,
  restore_due     DATERANGE,                  -- the legal window for restoring
  counts_as_strike BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Notes on the sketch:

- **A creator is not an account.** A creator is a payee and a publisher, which may be one person or a team whose members change; earnings belong to the creator, and accounts act for it through `creator_members` with roles and dates. Penalizing a creator (frozen earnings, termination) is separate from penalizing a member's player account, though one often follows the other.
- **Content is versioned and the split travels with the version.** `revenue_split` is fixed when the version is submitted, so earnings from version 3 follow version 3's split even after the team changes it for version 4.
- **Earnings are a ledger, not a balance.** Each sale share is an accrual keyed by the store transaction or currency ledger transaction that funded it; a refund posts a `reversal` pointing at it, keyed the same way, so the refund pipeline from [Refunds, Chargebacks and Clawbacks](/books/gaming/economies-and-entitlements#refunds-chargebacks-and-clawbacks) reaches creators automatically. An engagement payout is one accrual per creator per pool day, with the pool's inputs stored with `rule_version`. A payout is a negative entry keyed by the payout, and a creator's payable balance is the sum of entries past `payable_after`.
- **The payout itself is the payouts system's job:** a payable per creator per period, disbursed through the provider, reconciled, with tax totals per creator per year and per method ([A Payout Is a State Machine](/books/payments/vendor-payouts#a-payout-is-a-state-machine)). Earnings in Robux-like currency are converted at the rate in force when cashed out, recorded on the payout.
- **One attribution per kind at a time,** enforced by the exclusion constraint, so a player who switches creator codes ends one range and starts another, and accruals use the range in force at purchase.
- **Drops** are grants into the existing `entitlements` table with `source = 'grant'` and `source_ref` set to the platform and its entitlement ID (`twitch:<id>`), which the economies chapter's unique constraint makes idempotent.
- **Events:** `ugc.version_submitted`, `ugc.version_approved`, `ugc.content_disabled`, `creator.earnings_accrued`, `creator.payout_paid` and `ip_claim.status_changed` go through the outbox to review queues, the store, finance and creator dashboards ([Events & Async Messaging](/docs/architecture/events)).

## Auditing

Creators are paid partners, and their disputes are about money and takedowns:

- **Earnings lineage.** Every accrual traceable to the purchase, ledger transaction or pool day that funded it and the rule version that set its share, and every reversal to the refund that caused it. "Why did my payout drop" is answered from these rows.
- **Pool computations.** For engagement pools, each day's inputs (eligible revenue, eligible engagement per creator, exclusions for fraud) and the allocation, kept so a payout can be recomputed and explained.
- **Review decisions.** Who or what approved or rejected each content version, under which policy version and rating, and every disablement and its reason ([Auditing Moderation Decisions](/docs/security/trust-and-safety#auditing-moderation-decisions)).
- **IP claims.** Each notice, its validation, the dates of every legal step, strikes counted against the creator, and claimants flagged for abuse.
- **Identity and tax.** When KYC passed, which tax form is on file, and changes to payout details, which are an account-takeover target exactly as vendor bank changes are ([Stopping the Changed Bank Account](/books/payments/vendor-payouts#stopping-the-changed-bank-account)).

The record structure is in [Audit Trails](/docs/architecture/audit-trails).

## What This Means for the System You Build

- **Creators as payees, separate from player accounts,** with teams, roles and dated membership.
- **Content as immutable versions,** each scanned, rated and reviewed before players see it, with the revenue split fixed per version.
- **Creator code in a sandbox you control,** with no direct access to files, network or platform services, per-script budgets, and server authority as the default pattern.
- **Engagement-based payouts measured on the server** and counted only from players whose engagement is costly to fake.
- **An append-only earnings ledger** keyed to the purchases that funded it, with refunds reversing earnings automatically and holding periods before money is payable.
- **Drops and creator codes as idempotent, account-linked grants and dated attributions.**
- **A takedown case system** with legal deadlines as data, a published repeat-infringer policy, and tracking of abusive claimants.
- **KYC and tax at cash-out, through a payouts provider,** with thresholds read from the tax authority, not from memory.
- **Age floors for earning separate from age gates for playing,** both read from the platform's age model.

## References

**Specifications**

- [17 U.S.C. § 512](https://www.law.cornell.edu/uscode/text/17/512), designated agents, expeditious removal, the 10 to 14 business day restore window and the repeat infringer policy
- [EUR-Lex: Regulation (EU) 2022/2065, the Digital Services Act](https://eur-lex.europa.eu/eli/reg/2022/2065/oj/eng), the official text of Articles 16 and 23; the article pages below reproduce it
- [Digital Services Act, Article 16](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_16.html), notice and action mechanisms (unofficial consolidated text)
- [Digital Services Act, Article 23](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_23.html), suspension for frequent manifestly illegal content and manifestly unfounded notices (unofficial consolidated text)
- [IRS: Form 1099-K threshold under the One Big Beautiful Bill](https://www.irs.gov/newsroom/irs-issues-faqs-on-form-1099-k-threshold-under-the-one-big-beautiful-bill-dollar-limit-reverts-to-20000), the $20,000 and 200-transaction threshold reinstated (IR-2025-107, October 23, 2025)
- [IRS: Instructions for Forms 1099-MISC and 1099-NEC](https://www.irs.gov/instructions/i1099mec), the $2,000 nonemployee compensation threshold for tax years after 2025
- [Apple: App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), Guideline 4.7 on mini apps, mini games and plug-ins

**Reference**

- [Roblox: Developer Exchange](https://create.roblox.com/docs/production/monetization/developer-exchange), the $0.0038 and $0.0054 rates, the 30,000 Robux minimum, eligibility and Tipalti
- [Roblox: Earn on Roblox](https://create.roblox.com/docs/production/earn-on-roblox), the 70% and 30% shares on sales in experiences and the Marketplace
- [Roblox: Marketplace fees and commissions](https://create.roblox.com/docs/marketplace/marketplace-fees-and-commissions), creator and experience-owner shares, price-multiple shares, the upload fee and 30-day escrow
- [Roblox: Creator Rewards](https://create.roblox.com/docs/creator-rewards), the July 24, 2025 start, Active Spenders, daily engagement and the 35% Audience Expansion share
- [Luau: Sandboxing](https://luau.org/sandbox), removed libraries, bytecode restrictions and per-script isolation
- [Roblox: Security and cheat mitigation tactics](https://create.roblox.com/docs/scripting/security/security-tactics), treating client data as malicious and server-side validation
- [Roblox: Text filtering](https://create.roblox.com/docs/ui/text-filtering), creators' filtering duty and removal of games that don't filter
- [Roblox: Rights Manager](https://create.roblox.com/docs/production/publishing/rights-manager), rights holder registration and 250 links per report
- [Roblox: Intellectual Property Guidelines](https://create.roblox.com/docs/production/publishing/ip-guidelines), restoring within 14 business days after a counter-notice and terminating repeat infringers
- [Epic Games: Engagement payout in Fortnite Creative](https://dev.epicgames.com/documentation/fortnite/engagement-payout-in-fortnite-creative), the 40% Engagement Pool, metrics, payment timing, new-player credit and paying-player engagement
- [Epic Games: Fortnite Developer Program FAQs](https://dev.epicgames.com/documentation/fortnite/fortnite-developer-program-faqs-in-fortnite), the 18+ requirement, daily allocation, in-island transaction shares and 1099-NEC reporting
- [Epic Games: Fortnite Developer Program](https://dev.epicgames.com/documentation/fortnite/fortnite-developer-program), eligibility, tax verification and Hyperwallet payouts
- [Epic Games: IARC overview and FAQs](https://dev.epicgames.com/documentation/fortnite/iarc-overview-and-faqs-in-fortnite-creative), required IARC ratings for islands and maximum ratings
- [Steamworks: Steam Workshop](https://partner.steamgames.com/doc/features/workshop), ready-to-use and curated Workshops and paid item payments
- [Steamworks: Workshop implementation](https://partner.steamgames.com/doc/features/workshop/implementation), items hidden until the contributor accepts the legal agreement
- [Steam Workshop Legal Agreement](https://steamcommunity.com/workshop/workshoplegalagreement/?appid=440), revenue share set by the developer and contributor splits
- [Steam Subscriber Agreement](https://store.steampowered.com/subscriber_agreement/), the minimum age of 13 (last updated September 10, 2026)
- [Steam: Copyright infringement claim form](https://steamcommunity.com/dmca/create/), the web form and misrepresentation warning
- [mod.io: Marketplace](https://docs.mod.io/monetization/marketplace), studio-defined revenue splits
- [mod.io: Partner Program](https://docs.mod.io/monetization/partner), vetting criteria and KYC at cash-out
- [mod.io: Moderation](https://docs.mod.io/moderation/), the four moderation levels
- [mod.io: Community reports](https://docs.mod.io/moderation/community-reports), mod.io acting on valid DMCA notices
- [mod.io: Console](https://docs.mod.io/platforms/console), UGC certification support and platform safety processes
- [CurseForge: Reward Program FAQ](https://support.curseforge.com/en/support/solutions/articles/9000197902-reward-program-faq), points by popularity, $0.05 per point and the 60-day inactivity rule
- [Twitch: Drops](https://dev.twitch.tv/docs/drops/), fulfilling claims linked up to 14 days after a campaign ends
- [Twitch: API reference, Entitlements](https://dev.twitch.tv/docs/api/reference/), Get and Update Drops Entitlements, fulfillment statuses and update results
