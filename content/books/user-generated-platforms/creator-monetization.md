+++
title = "Creator Monetization"
description = "How creators earn on user-generated platforms: subscriptions, gifts, tips and virtual currencies, paid chat, ad shares, sponsorships and splits compared."
category = "User-Generated Platforms Industry"
order = 1822
part = "Creators and Money"
aliases = []
tags = ["user-generated-content", "creator-economy", "subscriptions", "virtual-currency", "revenue-share", "live-streaming"]
+++

A creator on a user-generated platform earns from the same audience in half a dozen ways at once. A streamer's viewers subscribe at one of three tiers, gift subscriptions to strangers in chat, cheer with a virtual currency, watch ads the streamer chose to run, and click the affiliate link in the panel below the stream; a video maker earns a share of watch-page ads, a share of a pooled Shorts allocation, membership fees, paid comments and a commission on tagged products. Each of those is a separate program with its own price, its own split, its own eligibility rule and its own way of going wrong, and the platform has to compute every creator's share of every one of them, correctly, for years.

This chapter covers the creator's side of the money: subscriptions and memberships, gifting and promotions, regional prices, tips and virtual currencies and the spread between what the viewer pays and what the creator receives, paid chat, ad revenue shares and pools, incentive pay, shared music licensing costs, sponsorships and affiliate programs, how the splits compare, and the fraud that targets creator money. [Monetization Strategies](/books/user-generated-platforms/monetization-strategies) places these among the platform's other ways to earn and owns pricing, regional pricing and app-store fees; [Paying Creators & Sellers](/books/user-generated-platforms/paying-creators-and-sellers) owns what happens after a share is earned: eligibility gates, identity checks, payout schedules, holds and tax. Game platforms where players build the content (Roblox, Fortnite islands, mod hosts) have their own chapter in the Gaming volume, [UGC & Creator Economies](/books/gaming/creator-economies).

## How the Platforms Do It

As of October 2026, from each platform's public pages:

| Platform | What viewers and members pay for | Programs a creator joins | Notes |
| --- | --- | --- | --- |
| **YouTube** | Channel memberships, Super Chat, Super Stickers, Super Thanks; ads; Premium; tagged products | YouTube Partner Program modules (watch page, Shorts, commerce); Shopping affiliate | One program, accepted module by module; splits published per module |
| **Twitch** | Subscriptions at three tiers, gift subs, Bits, ads, Prime subs | Affiliate, then Partner; the Plus Program for higher sub splits; Ads Incentive; DJ Program; sponsorship offers | Splits change with program level and points; currency is Bits |
| **Kick** | Subscriptions | Creator incentive pay at an hourly rate | Kick says creators keep 95% of subscription earnings |
| **Discord** | Server Subscriptions (up to three tiers), one-time purchases in a Server Shop | Server monetization through Stripe, US owners only | 90% to the owner before fees |
| **Reddit** | Gold given on posts and comments | Contributor Program | Fixed cash per gold by karma tier |
| **Patreon** | Memberships | The platform plan the creator's page was published under | 10% for pages published after August 4, 2025 |

Two models sit behind the table. **Direct support** (subscriptions, gifts, tips, paid messages) is money a fan pays for a specific creator, so the creator's share is a percentage or a fixed amount of an identifiable payment. **Pooled programs** (ad shares, Shorts, Premium, engagement pools) divide revenue the platform earned from someone else (advertisers, all subscribers) by a measure of each creator's contribution, so the creator's share is an allocation the platform computes after the period closes. The first is a ledger problem; the second is a measurement problem, and most of the fraud in this chapter lives there.

## Subscriptions and Memberships

A creator subscription is a recurring payment from a fan to a creator or a community, at a price the platform or the creator sets from a fixed menu, with perks the platform delivers: badges, emotes, ad-free viewing on that channel, members-only posts and chats. The mechanics of renewal, dunning, proration and cancellation are the playbook's [Subscriptions](/docs/payments/subscriptions); what's different here is that every renewal also creates earnings for someone else.

The menus are narrow on purpose. Twitch's Partner page lists subscriptions at $5.99, $9.99 and $24.99; Discord lets a server owner create one to three paid tiers; YouTube lets a creator define membership levels and perks, and its policy prohibits some perks outright (content downloads, in-person one-to-one meetings, random-selection prizes, perks aimed at children). A fixed menu keeps prices comparable across creators, lets the platform localize them, and keeps the platform's checkout, tax and store SKUs manageable; a creator-set free price would need a store SKU per amount on mobile.

### Tiers, Points and Program Levels

The split on a subscription is rarely one number. Twitch's standard split is 50%; the Plus Program, announced on January 24, 2024 and effective May 1, 2024, opened to Affiliates as well as Partners, added a 60/40 level for streamers who hold 100 Plus Points for three consecutive months, and lowered the 70/30 level from 350 points to 300. Points come from recurring paid subscriptions, one for Tier 1, two for Tier 2 and six for Tier 3, and the earlier cap that dropped the 70/30 split back to 50% above $100,000 of annual net subscription revenue was removed immediately. Prime Gaming subscriptions, which the viewer doesn't pay for directly, moved in June 2024 to a fixed amount per subscription by the subscriber's country: $2.25 from the US and Canada and $1.80 from the UK.

So the creator's share of a given renewal depends on the creator's standing over the previous three months, which depends on other subscriptions. That's why the terms used are recorded per subscription period, not looked up when earnings are paid: a creator who drops below 100 points in June still earned 60% on May's renewals. The program levels themselves (Affiliate, Partner, the Plus tiers, YouTube's modules) are enrollments with criteria, owned by [Paying Creators & Sellers](/books/user-generated-platforms/paying-creators-and-sellers).

### Gifting and Promotions

A gift subscription is a subscription paid for by one account and held by another: a named recipient, or a random member of the channel's chat. Gifts are bought in bundles, which makes them the largest single purchases most viewers make, and platforms promote them. Twitch announced in May 2025 that Partners and Affiliates would get 70 hours of promotional time a year, usable in up to seven promotions, with discounts capped at 35% off bundles of five or more gift subs; in October 2025 it reported that streamer-led promotions had raised gifting revenue for medium-sized creators by 30% to 45% on average during the promotion.

Three questions decide the data model. **Who paid** (the gifter, whose card, refund and chargeback it is), **who holds it** (the recipient, whose perks and renewal choice it is), and **what it counts toward** (whether a gifted sub earns program points or counts for eligibility, which each program states for itself). A discounted gift sub also needs a rule for the creator's share: a percentage of what the gifter paid, or of the list price with the platform funding the discount. Recording the price row and the promotion on the gift keeps that rule answerable.

### Regional Prices and Price Changes

A $5.99 subscription is a different purchase in Istanbul than in Seattle. Twitch's local subscription pricing, started in Mexico and Turkey on May 20, 2021 and extended to Latin America, the Middle East and Africa, Europe and Asia Pacific that summer, set prices by the viewer's location and payment method, so two viewers in the same channel can pay different amounts. Twitch's stated reason was that support rates ran about 50% lower in Europe and Asia and nearly 80% lower in Latin America than in North America, and it reported that viewers in Mexico and Turkey were gifting five times more subs than before the change.

Two parts of that rollout are patterns any platform needs. **Existing subscribers moved too:** Twitch applied the local price to existing subs, new subs and gift subs. **Creators were protected through the transition:** Twitch covered 100% of a creator's baseline channel and Prime sub revenue for three calendar months including the month of the change, then reduced the top-up by 25% every three months over the next nine, for creators streaming at least 85% of their baseline hours. A price change that lowers a creator's income is a program change, and the guarantee is a time-limited earnings program of its own.

Price increases run the other way. Twitch raised the US Tier 1 price from $4.99 to $5.99 on web from July 11, 2024, in over 30 countries; existing subscriptions renewed at the new price unless the viewer cancelled, mobile app prices were to follow with at least 30 days' notice, and the streamer's percentage stayed the same, so creators received more per sub. Whether an existing subscriber can be moved to a new price without fresh consent depends on the jurisdiction and the store ([The Law of Automatic Renewal](/docs/payments/subscriptions#the-law-of-automatic-renewal)); Monetization Strategies covers how platforms set regional price tables ([Pricing and Regional Pricing](/books/user-generated-platforms/monetization-strategies#pricing-and-regional-pricing)).

### Store Billing

When the subscription is bought inside an iOS or Android app, the store may take its fee before the platform's split is applied, and creator platforms have to decide who absorbs it. Patreon's August 2024 announcement is the clearest public example: Apple required Patreon to use In-App Purchase for new memberships bought in its iOS app, applying its 30% fee to those memberships and to shop purchases from November 2024, while existing members were unaffected. Apple's in-app system supports only subscription billing, so Patreon's first-of-the-month and per-creation billing models were discontinued in November 2025, and Patreon's default was to raise the creator's prices in the iOS app only, to offset the fee, with the option to keep prices and absorb it. Twitch's 2024 price change likewise treated web and mobile prices separately. The fee rules, and how the US and EU rulings on steering change them, are in [App Stores, Fees, Steering and the Epic Rulings](/books/user-generated-platforms/monetization-strategies#app-stores-fees-steering-and-the-epic-rulings); for creator money the rule is that the store channel is recorded on every subscription period, because the same tier at the same list price yields different net revenue, and sometimes a different price, by channel.

## Tips, Paid Messages and Virtual Currencies

A tip is a one-time payment to a creator, usually attached to a moment: a message in live chat, a comment under a video, an award on a post. Some platforms sell it as money (YouTube's Super Chat, Super Stickers and Super Thanks, all paying the creator 70% of net revenue); others sell a virtual currency first and let the viewer spend it (Twitch's Bits, Reddit's Gold). YouTube's help page states that Super Chat and Super Sticker payments are non-refundable voluntary payments, and that some purchases in the Android app are billed through Google Play without a change in price.

### The Spread

With a currency, the creator's share is fixed in currency units and the viewer's price is set separately, by pack, channel and region, and the difference between them is the platform's margin. Twitch's Partner page says partners receive "1 cent per Bit used to Cheer for them," and creators receive 80% of that cent when Bits are spent in an extension, the developer receiving the rest. Streamlabs' published price list (updated February 2024) shows what viewers paid:

| Purchase | Viewer pays | Creator receives when spent | Gap |
| --- | --- | --- | --- |
| 100 Bits on desktop web | $1.40 | $1.00 | $0.40 |
| 95 Bits in the mobile app | $1.99 | $0.95 | $1.04, before the store's fee |
| 1 Gold on Reddit | $1.99 | $0.90, or $1.00 for Top Contributors | $1.09 or $0.99 |

Reddit's Contributor Program, which began rolling out in the US on September 25, 2023, paid $0.90 per gold to Contributors with 100 to 4,999 karma in a 12-month period and $1.00 to Top Contributors with 5,000 or more, with gold sold from $1.99 for one to $49.00 for 25. The spread pays for payment processing, store fees on mobile, fraud and chargebacks, and the platform's margin; it's also why the creator's figure is the one platforms publish.

Twitch's reason for ending Hype Chat shows the other side of a currency. When it announced in November 2023 that it would deprecate the feature, Twitch said viewers "saw more value in Cheering because it was easier to understand exactly how much streamers earned from Bits," and cited difficulty tracking earnings after currency conversion on direct Hype Chat purchases. A currency with a fixed creator value is easier to explain than a percentage of a local-currency payment after fees.

### Paid, Earned and Promotional Currency

A currency balance is money the platform owes in goods, not a number on the account. Three kinds of unit need separate buckets, as in any game wallet ([Paid and Earned Currency Are Different Money](/books/gaming/economies-and-entitlements#paid-and-earned-currency-are-different-money)):

- **Paid units,** bought with money: a liability to the buyer until spent, refundable or not under the platform's terms and consumer law, and revenue only as it's used.
- **Promotional units,** granted free: no money behind them, so spending them creates a creator payout the platform funds as a marketing cost, or creates none, and the terms must say which.
- **Earned units,** received by a creator (Reddit's Gold is given to the creator, then converted to cash): a liability to the creator, convertible at a published rate, with a minimum.

Units bought and never spent are **breakage**, recognized as revenue under the accounting rules once the platform can estimate them ([Breakage](/docs/payments/accounting#breakage)). A platform that also lets pre-monetization creators accrue earnings creates a fourth case: Twitch announced in 2025 that streamers below Affiliate could accrue revenue but not withdraw it, and could spend it on gift subs and Bits instead. That balance is a liability that can't be paid out, only spent on the platform, and it needs its own bucket. Monetization Strategies compares currencies across platforms ([Virtual Goods and Currencies](/books/user-generated-platforms/monetization-strategies#virtual-goods-and-currencies)).

### Paid Chat

Paying to have a message seen is the oldest live-stream product: the message is pinned, highlighted or held at the top of chat for a time that scales with the amount. Hype Chat launched in June 2023 for Partners, with streamer-set prices from $1 to $500 and a 70/30 split, and was deprecated five months later. YouTube's Super Chat and Super Stickers remain. Paid messages carry two duties a free message doesn't: the text is moderated like any chat message and can still be removed after it was paid for (and the platform's terms decide whether removal refunds it), and the message is part of the payment record, so it's stored with the payment rather than only in the chat system. The fanout, rate limits and the rest of the interactive layer (channel points, polls, predictions, Hype Trains) are in Live Chat & the Interactive Layer.

## Ad Revenue Share

Ads on a creator's content are sold by the platform, not the creator, and the creator's share is a percentage of what the platform earned net of its costs. YouTube's terms state the shares by module: 55% of net revenue from ads on the watch pages of a creator's public videos (including embeds in the YouTube player on other sites), and 70% of net fan-funding revenue. Twitch's Ads Incentive Program, as changed from April 1, 2023, paid opted-in Partners 55% of net ad revenue when the channel ran a minimum of three ad minutes per hour, and 30% below the minimum; Affiliates could also earn 55% by running more than three ad minutes per hour.

A share tied to ad minutes makes the creator part of the ad-load decision. The platform wants inventory; the viewer wants fewer ads; the creator is paid more for running more of them. That conflict is general ([When Models Collide](/books/user-generated-platforms/monetization-strategies#when-models-collide)), but for creators it's concrete: the program sets the threshold, and the creator chooses whether to cross it.

### Pools

Short-form feeds show ads between videos, not on them, so there's no single creator to credit. YouTube's answer is a pool. Each month the revenue from ads in the Shorts Feed is pooled by country; Shorts that use music give part of their share to music licensing (half with one track, two-thirds with two); the remaining Creator Pool is allocated by each monetizing creator's share of engaged views in that country; and the creator keeps 45% of the allocation, with or without music. YouTube's worked example:

| Step | Value |
| --- | --- |
| Shorts Feed ad revenue in Country A for the month | $100,000 |
| Revenue tied to Shorts with one music track (20% of views) | $20,000, half to music: $10,000 |
| Creator Pool | $90,000 |
| A creator's share of engaged views | 1%, so $900 allocated |
| Creator's 45% | $405 |

The same page sets a change dated February 1, 2027: eligibility for monthly Shorts ad and Premium revenue will require at least 10 million qualified Shorts views in the prior 90 days, and Shorts ads targeted to five or fewer channels can earn direct revenue at 45%. YouTube also pays 45% of net Premium revenue allocated to monetizing creators by their share of subscribers' Shorts views per country.

A pool is computed after the period closes, from cleaned view counts, per country, and its inputs (revenue, music shares, exclusions such as ineligible views) are as much part of the record as the result. Engagement pools in games (Fortnite's, Roblox's) follow the same shape and add the defense that only paying players' engagement counts ([How Creators Get Paid](/books/gaming/creator-economies#how-creators-get-paid)).

## Incentive and Guaranteed Pay

New platforms buy supply by paying creators for time, not results. Tubefilter reported in February 2024 that Kick's Creator Incentive Program paid a fixed hourly rate that rose with a streamer's followers and watch time, rather than a revenue split, with entry benchmarks Kick said were "subject to modification"; Kick doesn't publish the rate. Twitch's local pricing guarantee is the other kind: a temporary top-up to a baseline when the platform's own change cuts income.

Both are earnings with no fan payment behind them. They're funded from the platform's marketing or transition budget, they need explicit conditions (hours streamed, exclusivity, a baseline period) checked from the platform's own records, and they end on a date. Model them as revenue programs with terms like any other, so a creator's statement shows them and finance can see their cost.

## Music Costs Shared With Creators

Music is the cost creators most often bring onto a platform. Two programs publish how they share it. YouTube's Shorts pool takes the music licensing share out before the Creator Pool is divided, so creators who use music and those who don't keep the same 45% of their allocation, and the cost falls on the pool. Twitch's DJ Program, announced in June 2024, licensed music from Universal, Warner, Sony and independent labels through Merlin, with Twitch splitting the licensing cost 50/50 with DJ Program partners and subsidizing existing DJs for a year. A cost share deducted from a creator's earnings is a line on the statement, computed by rule, and the rule is a program term with an effective date. Matching music in uploads and streams is Copyright at Scale.

## Sponsorships, Affiliates and Disclosure

Much of what creators earn never passes through the platform: a brand pays the creator directly to mention a product. Platforms care because sponsored content competes with the ads they sell, and because the law requires disclosure. Twitch's June 2023 branded content guidelines would have banned burned-in video, display and audio ads in streams from July 1; Twitch withdrew them the next day, saying they were "bad for you and bad for Twitch." By 2025 Twitch was brokering deals instead, saying it would help 10 times more creators secure brand deals than in 2024 and rolling sponsorship offers out to Affiliates. Brokered sponsorships make the platform a party to the money, with a split, a contract and earnings like any other program.

Affiliate commerce brings the merchant to the platform. In YouTube's Shopping affiliate program, a creator in the Partner Program, in an eligible country and not running a music or made-for-kids channel, tags products, and earns a commission when a viewer clicks the tag and buys on the retailer's site; sellers set the rates, may offer custom rates to some creators, and the commission is computed at the rate on the day of purchase, not the day the product was tagged. Attribution, rate on purchase date, and reversal on return are the parts a platform builds. Creator codes in game stores and Drops for watching streams are the same pattern inside games ([Affiliate Codes and Drops](/books/gaming/creator-economies#affiliate-codes-and-drops)).

Disclosure is a legal duty on the creator that platforms build tools for. The FTC's Endorsement Guides (16 CFR Part 255, revised in 2023) treat free products and commissions as connections to disclose; say a disclosure in the video itself is more likely to be clear than one in the description; advise repeating it during a livestream because viewers join at any time; and say a platform's built-in tool isn't a guarantee, advising creators to add their own. YouTube asks creators to tick a paid promotion box, which adds a disclosure label at the start of the video, for branded content, sponsorships, endorsements or other commercial relationships. The platform's side is to record the declaration on the content item, show the label, and keep the declaration with the revision it applied to, because an undisclosed sponsorship is a policy violation and possibly an FTC matter.

## Revenue Splits Compared

The creator's share on each product, as published as of October 2026:

| Platform | Product | Creator's share | Of what |
| --- | --- | --- | --- |
| YouTube | Watch-page ads | 55% | Net ad revenue on the creator's public videos |
| YouTube | Shorts ads | 45% | The creator's allocation from the Creator Pool |
| YouTube | Memberships, Super Chat, Super Stickers, Super Thanks | 70% | Net revenue |
| YouTube | Premium (Shorts) | 45% | Net Premium revenue allocated by Shorts views |
| Twitch | Subscriptions | 50%; 60% at 100 Plus Points; 70% at 300 | Net subscription revenue |
| Twitch | Prime Gaming subscriptions | $2.25 (US, Canada), $1.80 (UK) | Fixed per subscription |
| Twitch | Bits | $0.01 per Bit; 80% of that in extensions | Bits used |
| Twitch | Ads | 55% with at least three ad minutes an hour; 30% below | Net ad revenue |
| Kick | Subscriptions | 95% | Subscription earnings |
| Discord | Server Subscriptions | 90%, before fees | Each membership |
| Reddit | Gold | $0.90 or $1.00 per gold | Gold received |
| Patreon | Memberships | 90%, before processing (pages published after August 4, 2025) | Membership payments |

The percentages hide the base. "Net" excludes taxes (YouTube says transaction taxes aren't revenue to Google and are excluded) and may exclude store fees and processing; Discord's help center warns that "various fees" affect the final amount. A creator comparing platforms needs the base as much as the rate, which is why the terms record what the share is computed on.

## Fraud on Creator Money

Creator programs pay out money that came in through the platform's checkout, so every payment fraud reaches them, and pooled programs add measurement fraud:

- **Stolen cards buying currency or gifts.** A stolen card buys Bits, gift subs or Gold, which are spent on a channel the fraudster controls; the creator's earnings are real until the chargeback arrives. Paid units should carry the payment they came from, so a chargeback can find and reverse what they bought ([Fraud & Risk](/books/payments/fraud-and-risk)).
- **Self-gifting and wash support.** A creator, or friends, buy subscriptions and tips for the creator's own channel to reach a points threshold or an eligibility bar, losing the platform's cut to gain a better split or a program level. Linking payer and payee accounts (shared payment instruments, devices, identity) is the check, run before enrollment decisions as well as after.
- **Fake views and engagement.** Pools and ad shares paid by views invite bots. YouTube's policy is that earnings from invalid traffic may be withheld, changed or offset, including from future balances when found after payment, that payments can be held up to 90 days while traffic is reviewed, and that editing, deleting or unlisting videos won't recover them. The same principle as game engagement pools applies: pay on a measure that's expensive to fake, computed on the server.
- **Refunds and reversals.** YouTube's membership policy refunds members' last payment when a program ends after more than 120 days in paused mode, and the refunds come out of the creator's share. Every earning needs a way to be reversed, with the reversal linked to its cause.

The holds that give these reversals time to arrive before money leaves are in [Paying Creators & Sellers](/books/user-generated-platforms/paying-creators-and-sellers).

## How to Build It

These are deltas against the [core data model](/books/user-generated-platforms/platform-business#the-core-data-model) and the tables [Monetization Strategies](/books/user-generated-platforms/monetization-strategies#how-to-build-it) adds: `products` (a premium plan, a creator tier, a community tier, a currency pack), `product_prices` (by channel, country, currency and validity), `revenue_programs` and `revenue_program_terms` (each program's shares in basis points, conditions and validity), and the Gaming volume's `store_transactions` and `store_fee_rates` for store-billed purchases. Program enrollments, tax profiles, holds and payouts are [Paying Creators & Sellers](/books/user-generated-platforms/paying-creators-and-sellers#how-to-build-it). Money stays in the Payments ledger; this chapter adds the records that say why money is owed to a creator.

```sql
CREATE TABLE subscriptions (             -- a platform plan, a creator tier or a community tier
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id        UUID NOT NULL REFERENCES accounts (id),     -- who holds it
  product_id        UUID NOT NULL REFERENCES products (id),     -- the plan or tier
  payee_profile_id  UUID REFERENCES profiles (id),              -- the creator; null otherwise
  community_id      UUID REFERENCES communities (id),           -- a server or community tier
  channel           TEXT NOT NULL CHECK (channel IN ('web', 'apple', 'google')),
  status            TEXT NOT NULL CHECK (status IN ('active', 'past_due', 'paused',
                      'cancelled', 'expired')),
  current_period    TSTZRANGE NOT NULL,
  auto_renew        BOOLEAN NOT NULL DEFAULT TRUE,              -- false for a gift
  cancel_at         TIMESTAMPTZ,                                -- end of the paid period
  gift_id           UUID,                                       -- subscription_gifts; set when gifted
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (num_nonnulls(payee_profile_id, community_id) <= 1)
);

CREATE TABLE subscription_periods (      -- one row per paid period; the facts earnings use
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  subscription_id      UUID NOT NULL REFERENCES subscriptions (id),
  period               TSTZRANGE NOT NULL,
  product_price_id     UUID NOT NULL REFERENCES product_prices (id),  -- list, regional or promo
  price_amount         BIGINT NOT NULL,       -- what was charged, minor units, before tax
  currency             CHAR(3) NOT NULL,
  channel              TEXT NOT NULL,         -- can change between periods
  payment_id           UUID REFERENCES payments (id),
  store_transaction_id UUID REFERENCES store_transactions (id),
  terms_id             UUID NOT NULL REFERENCES revenue_program_terms (id),  -- split in force
  program_points       SMALLINT NOT NULL DEFAULT 0,  -- what this period counts toward a tier
  is_gift              BOOLEAN NOT NULL DEFAULT FALSE,
  EXCLUDE USING GIST (subscription_id WITH =, period WITH &&),
  CHECK (num_nonnulls(payment_id, store_transaction_id) <= 1)
);

CREATE TABLE subscription_gifts (        -- one purchase, one or many subscriptions
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  gifter_account_id   UUID NOT NULL REFERENCES accounts (id),
  product_id          UUID NOT NULL REFERENCES products (id),
  payee_profile_id    UUID REFERENCES profiles (id),
  community_id        UUID REFERENCES communities (id),
  quantity            INT NOT NULL CHECK (quantity > 0),
  recipient_account_id UUID REFERENCES accounts (id),  -- null: random members of chat
  product_price_id    UUID NOT NULL REFERENCES product_prices (id),  -- a promotion is a price row
  payment_id          UUID REFERENCES payments (id),
  store_transaction_id UUID REFERENCES store_transactions (id),
  stream_id           UUID REFERENCES streams (content_item_id),     -- where it was given
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (recipient_account_id IS NULL OR quantity = 1)
);

ALTER TABLE subscriptions
  ADD FOREIGN KEY (gift_id) REFERENCES subscription_gifts (id);

CREATE TABLE currency_accounts (         -- unit balances; null account = the platform's side
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id  UUID REFERENCES accounts (id),
  currency    TEXT NOT NULL,              -- 'bits', 'gold'
  bucket      TEXT NOT NULL CHECK (bucket IN ('paid', 'promotional', 'earned', 'held',
                'issuance', 'consumed')),  -- the last two belong to the platform
  UNIQUE NULLS NOT DISTINCT (account_id, currency, bucket)
);

CREATE TABLE currency_ledger_entries (   -- double entry in units; sums to zero per transaction
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  transaction_id      UUID NOT NULL,
  currency_account_id UUID NOT NULL REFERENCES currency_accounts (id),
  units               BIGINT NOT NULL,    -- signed
  kind                TEXT NOT NULL CHECK (kind IN ('purchase', 'grant', 'spend', 'receive',
                        'convert', 'expire', 'refund', 'reversal')),
  source_payment_id   UUID REFERENCES payments (id),  -- the money behind paid units
  money_value         BIGINT,             -- the units' cost in minor units, for refunds and revenue
  money_currency      CHAR(3),
  reverses_id         UUID REFERENCES currency_ledger_entries (id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE fan_payments (              -- tips, paid messages, cheers, stickers
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  kind              TEXT NOT NULL CHECK (kind IN ('tip', 'paid_message', 'cheer', 'sticker',
                      'award')),
  payer_account_id  UUID NOT NULL REFERENCES accounts (id),
  payee_profile_id  UUID NOT NULL REFERENCES profiles (id),
  content_item_id   UUID REFERENCES content_items (id),   -- the stream, video, post or comment
  amount            BIGINT,               -- money, minor units, when sold as money
  currency          CHAR(3),
  units             BIGINT,               -- when spent from a currency
  unit_currency     TEXT,
  payment_id        UUID REFERENCES payments (id),
  currency_transaction_id UUID,            -- currency_ledger_entries.transaction_id
  message_body      TEXT,                 -- kept with the payment; moderated like chat
  message_state     TEXT NOT NULL DEFAULT 'none' CHECK (message_state IN ('none', 'shown',
                      'held', 'removed')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((amount IS NULL) <> (units IS NULL))
);

CREATE TABLE earnings (                  -- one accrual per payee per source event
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id      UUID NOT NULL REFERENCES merchants (id),  -- the payee
  source_type      TEXT NOT NULL CHECK (source_type IN ('subscription_period', 'fan_payment',
                     'ad_share', 'pool_allocation', 'incentive', 'affiliate', 'sponsorship',
                     'cost_share', 'adjustment')),
  source_id        UUID NOT NULL,         -- the row it came from
  terms_id         UUID NOT NULL REFERENCES revenue_program_terms (id),
  earned_period    DATERANGE,             -- for pools and ad shares: the month allocated
  gross_amount     BIGINT NOT NULL,       -- the base the share was computed on
  platform_amount  BIGINT NOT NULL,
  payee_amount     BIGINT NOT NULL,       -- negative for a reversal or a cost share
  currency         CHAR(3) NOT NULL,
  status           TEXT NOT NULL CHECK (status IN ('pending', 'available', 'paid',
                     'reversed', 'withheld')),
  available_on     DATE,
  reversal_of      UUID REFERENCES earnings (id),
  ledger_transaction_id UUID REFERENCES ledger_transactions (id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE NULLS NOT DISTINCT (source_type, source_id, merchant_id, reversal_of)
);
```

Design notes:

- **Periods are facts; the subscription is state.** A renewal adds a `subscription_periods` row with the price, channel, terms and points in force for that period, so a tier change, a regional repricing, a store switch or a split change never rewrites what was earned before. The exclusion constraint prevents two paid periods overlapping for one subscription.
- **Points are computed from periods.** A Plus-style program reads `program_points` over the trailing months for the payee's paid, non-gift periods (or with gifts, if the program counts them), and the resulting tier becomes the `terms_id` on the next periods. The rule that sets `program_points` is the program's, not the subscription's:

```sql
-- Points per calendar month for one creator: the input to the next tier decision
SELECT date_trunc('month', lower(sp.period)) AS month,
       sum(sp.program_points)               AS points
FROM subscription_periods sp
JOIN subscriptions s ON s.id = sp.subscription_id
WHERE s.payee_profile_id = $1
  AND lower(sp.period) >= date_trunc('month', now()) - interval '3 months'
  AND NOT sp.is_gift                         -- if the program excludes gifts
GROUP BY 1
ORDER BY 1;
```

- **A gift is a purchase and its subscriptions.** The gifter's payment is on `subscription_gifts`; each recipient's subscription points back to it with `auto_renew` off. A chargeback on the gift finds every subscription and every earning it created.
- **Units live in their own double-entry ledger.** Bits and Gold aren't money: they have no minor units and their money value depends on the pack they came from. The unit ledger balances in units (a purchase moves units from the platform's `issuance` account to the buyer's `paid` bucket; a cheer moves them to `consumed`; Gold given moves them to the creator's `earned` bucket), and each paid entry carries the payment and money value behind it, so a refund or chargeback can claw back exactly those units and revenue recognition can value what was consumed. The money itself (deferred revenue for unspent paid units, the creator liability, the platform's revenue) posts to the Payments ledger as usual ([Wallets Are Ledgers](/books/gaming/economies-and-entitlements#wallets-are-ledgers)).
- **Paid messages keep their text with the payment.** `fan_payments.message_body` is what was paid for; the chat system shows it, moderation can hold or remove it, and the record shows both.
- **Every earning cites its terms and its source.** `earnings` is the creator's subledger: one row per accrual, with the base, both shares, the program terms used and a link to the period, fan payment or pool allocation that caused it. A reversal is a new row pointing at the original, never an update. Pools write one `pool_allocation` source row per creator per country and month, holding the pool size, the music deduction and the creator's view share, so the $405 in YouTube's example can be recomputed.
- **Status follows the payout chapter.** `pending` until the hold and trigger rules release it, `available` to pay, `paid` with the payout that carried it, `withheld` for tax or a policy decision. The rules that move earnings between them are [Paying Creators & Sellers](/books/user-generated-platforms/paying-creators-and-sellers).
- **Emit events:** `subscription.renewed`, `subscription.gifted`, `fan_payment.created`, `earnings.accrued`, `earnings.reversed`. Live chat consumes the first three to show alerts; statements, tax reporting and program-tier jobs consume the rest ([Events & Async Messaging](/docs/architecture/events)).

## Auditing

Creator earnings are income someone will dispute, report to a tax authority and compare with a competitor's terms. The record has to show:

- **Every earning back to its payment or allocation,** with the program terms in force, the base and both shares, so a creator's statement can be rebuilt line by line ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)).
- **Every pool's inputs,** per country and period: revenue, deductions, eligible views, each creator's share and the exclusions applied, kept as long as the earnings are.
- **Every tier and program decision,** with the points or criteria that produced it and the date it took effect, because a creator who missed the 70% tier by two points will ask.
- **Every price and split change,** with its effective date and the notice given to subscribers and creators ([Snapshot What Changes Underneath You](/docs/architecture/audit-trails#snapshot-what-changes-underneath-you)).
- **Every reversal linked to its cause:** the refund, chargeback, invalid-traffic finding or program termination, and the earnings it reversed.
- **Disclosure declarations** on sponsored content, with the revision they applied to.

## What This Means for the System You Build

- **Model every creator product as a program with versioned terms,** and store the terms used on every period and every earning.
- **Record subscriptions as periods,** each with its price, channel, terms and points, so changes never rewrite history.
- **Treat a gift as a purchase that creates subscriptions,** with the gifter's payment traceable from every one of them.
- **Run virtual currency on a unit ledger** with paid, promotional and earned buckets, each paid unit tied to the payment behind it.
- **Publish the creator's share and record the base** it's computed on, net of which taxes, fees and costs.
- **Compute pools after the period closes, from cleaned counts,** and keep every input.
- **Make every earning reversible** by a new linked row, and hold earnings long enough for reversals to arrive.
- **Keep paid messages' text with the payment** and moderate it like any other message.
- **Record sponsorship disclosures on the content revision,** and show the label.

## References

**Platform terms**

- [YouTube: YouTube Partner Program revenue shares](https://support.google.com/youtube/answer/72902?hl=en), 55% watch-page ads, 45% Shorts, 70% fan funding, taxes excluded from revenue, US tax withholding
- [YouTube: Shorts monetization policies](https://support.google.com/youtube/answer/12504220?hl=en), Shorts Feed pool by country, the music split, the 45% share, the worked example, Premium's 45% and the February 1, 2027 changes
- [YouTube: YouTube Partner Program overview and eligibility](https://support.google.com/youtube/answer/72851?hl=en), the 1,000 subscriber and watch-hour or Shorts-view thresholds
- [YouTube: Channel memberships](https://support.google.com/youtube/answer/7636690?hl=en), membership perks and prohibited perks, paused mode, the 120-day termination and refunds from the creator's share
- [YouTube: Super Chat and Super Stickers](https://support.google.com/youtube/answer/7277005?hl=en), non-refundable voluntary payments and Google Play billing on Android
- [YouTube: YouTube Shopping affiliate program overview and eligibility](https://support.google.com/youtube/answer/13376398?hl=en), YPP, country, music and made-for-kids conditions
- [YouTube: Commission rates and earnings in the YouTube Shopping affiliate program](https://support.google.com/youtube/answer/17263096?hl=en), seller-set and custom rates, the rate on the day of purchase
- [YouTube: Add paid product placements, sponsorships and endorsements](https://support.google.com/youtube/answer/154235?hl=en), the paid promotion setting and disclosure label
- [YouTube: Invalid traffic on your videos](https://support.google.com/youtube/answer/10285842?hl=en), withheld or offset earnings, holds up to 90 days, no recovery by editing or deleting
- [Twitch: Partners](https://www.twitch.tv/p/en/partners/), subscription prices of $5.99, $9.99 and $24.99, one cent per Bit, ad revenue share
- [Twitch: A more flexible Ads Incentive Program coming in April](https://blog.twitch.tv/en/2023/03/09/a-more-flexible-ads-incentive-program-coming-in-april), 55% and 30% net ad revenue shares, the three-minute minimum, April 1, 2023
- [Twitch: Local sub pricing expands worldwide](https://blog.twitch.com/en/2021/08/05/local-sub-pricing-expands-worldwide/), prices by location, existing subs included, the revenue adjustment, support rates by region, gifting results
- [Twitch: Ten years of TwitchCon, Rotterdam](https://blog.twitch.tv/en/2025/05/31/ten-years-of-twitchcon-here-s-what-we-announced-in-rotterdam), gift sub promotions, pre-Affiliate earnings, over 1 million Affiliates
- [Twitch: Ten years of TwitchCon, San Diego](https://blog.twitch.com/en/2025/10/17/ten-years-of-twitchcon-here-s-what-we-announced-in-san-diego/), gifting lift from promotions, Combos with Bits, sponsorship offers for Affiliates
- [Twitch Developers: Extensions monetization](https://dev.twitch.tv/docs/extensions/monetization/), Bits products, revenue shared between broadcaster and developer
- [Discord: Creator Revenue FAQ](https://creator-support.discord.com/hc/en-us/articles/10424143128343-Creator-Revenue-FAQ), the 90/10 split, eligibility, US only, Stripe and monthly payouts
- [Patreon: Understanding Apple requirements for Patreon](https://news.patreon.com/articles/understanding-apple-requirements-for-patreon), the 30% fee on new iOS memberships, billing model changes, the iOS price tool (August 2024)
- [FTC: FTC's Endorsement Guides, What People Are Asking](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking), material connections, affiliate links, disclosure in video and livestreams, platform tools, the 2023 revision and 16 CFR Part 255

**In practice**

- [Insider Gaming: Twitch makes changes to streamer payouts](https://insider-gaming.com/twitch-makes-changes-to-streamer-payouts/), the Plus Program announcement of January 24, 2024: 60/40 at 100 points, 70/30 at 300, point values, the cap removal, Prime rates (secondary)
- [AlternativeTo: Twitch expands Plus Program with a 60/40 split](https://alternativeto.net/news/2024/1/twitch-expands-plus-program-to-more-streamers-with-new-60-40-revenue-split/), Affiliates eligible and the three consecutive months rule (secondary)
- [Shacknews: Twitch subscription price increase](https://shacknews.com/article/140084/twitch-subscription-price-increase-july-2024), $5.99 Tier 1 from July 11, 2024, existing subs renewing at the new price, mobile notice (secondary)
- [Streamlabs: What are Twitch Bits worth](https://streamlabs.com/content-hub/post/what-are-twitch-bits-worth), Bits pack prices on desktop and mobile, updated February 2024 (secondary)
- [Tubefilter: Twitch Hype Chat](https://tubefilter.com/2023/06/23/twitch-hype-chat-revenue/), prices from $1 to $500, Partners only, 70/30 (June 2023)
- [Tubefilter: Twitch will deprecate Hype Chat](https://www.tubefilter.com/?p=176946), the November 2023 decision and Twitch's reasons
- [Tubefilter: Kick's Creator Incentive Program](https://tubefilter.com/2024/02/01/kick-creator-incentive-program-launches-all-streamers/), hourly incentive pay and the 95% subscription share (February 2024)
- [Tubefilter: Discord server subscriptions open to US servers](https://www.tubefilter.com/2022/12/01/discord-creator-monetization-server-memberships-open-to-us-servers/), up to three tiers from $2.99 to $199.99 (December 2022)
- [Tubefilter: Twitch DJ Program](https://www.tubefilter.com/2024/06/07/twitch-dj-category-music-licensing-program/), the labels, the 50/50 cost split and the one-year subsidy (June 2024)
- [Social Media Today: Reddit launches new Reddit Gold program](https://www.socialmediatoday.com/news/reddit-launches-new-reddit-gold-program-will-see-top-contributors-paid/694665/), the Contributor Program launch, gold prices and payout per gold by karma tier (September 2023)
- [AlternativeTo: Patreon is increasing platform fees for new creators](https://alternativeto.net/news/2025/6/patreon-is-increasing-platform-fees-for-new-creators-starting-august-2025/), the 10% standard fee for pages published after August 4, 2025 (secondary)
- [Marketing Brew: Twitch scraps new ad guidelines after creator uproar](https://www.marketingbrew.com/stories/2023/06/08/twitch-scraps-new-ad-guidelines-after-creator-uproar), the burned-in ad ban and its retraction (June 2023)
