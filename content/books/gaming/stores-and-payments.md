+++
title = "Stores, Fees & Payments"
description = "Store fees and billing rules for Steam, Epic, Microsoft, Apple and Google as of October 2026, web stores, regional prices, refunds, taxes and receipt checks."
category = "Gaming Industry"
order = 1621
part = "Money"
tags = ["gaming", "app-stores", "store-fees", "payments", "refunds", "receipt-validation"]
+++

Every purchase in a game crosses a store, and the store decides more than its cut. It decides whether you may take the payment yourself, which payment methods the player sees, how long the player has to change their mind, who collects the tax, what you're told when the money is reversed, and what proof of purchase your server gets. Those rules differ by store, by country and, since 2024, by court order, and several of them changed in 2025 and 2026. A game that ships on PC, two consoles and two phone platforms is running five payment systems with five sets of terms, and its backend has to turn all of them into one ownership record.

This chapter is the store layer: what each store charges and requires, as of October 2026, then the parts you build regardless of store (web stores, regional prices, refunds and chargebacks, taxes, and receipt validation into entitlement grants). What players buy and why is in [Monetization Models](/books/gaming/monetization); the entitlements and ledgers that purchases land in are in [Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements). Card payments as an industry have their own volume, starting at [How Card Payments Work](/books/payments/card-payments).

Every fee and term below is dated "as of October 2026". Treat the numbers as a snapshot and the structure as the lesson: a fee schedule per store, per program, per region, with effective dates, is data your system stores, not constants in code.

## Who Is the Seller

The first question about any store is who sells the item to the player, because that party processes the payment, handles the refund, answers the chargeback and usually collects the tax. On a closed store the store is the seller and you're paid a share; on your own web store you're the seller and you carry all of it.

| Store | Fee on a game or in-game purchase | Store billing required? | Source date |
| --- | --- | --- | --- |
| Steam | 30% of sales under $10M, 25% to $50M, 20% above | Yes for in-game purchases (Steam Wallet) | Tiers from 2018 |
| Epic Games Store | 0% on the first $1M per app per year, then 12% | Epic processes store sales; webshops offered | June 2025 |
| Microsoft Store (PC) | 12% of Net Receipts for games | Yes for games | ADA v8.11, April 2026 |
| Xbox console | 30% of Net Receipts for console games and non-subscription in-app products | Yes | ADA v8.11, April 2026 |
| Apple App Store (US) | 30% on In-App Purchase; 15% for small developers | IAP for in-app digital goods; links out allowed in the US | Court orders 2025 |
| Apple App Store (EU) | 26% on IAP; 20% with alternative payments; 15% on link-out sales | No; DMA terms | 1 October 2026 |
| Google Play (US, UK, EEA) | 20% + 5% billing fee for new installs | No in the US since 29 October 2025 | 30 June 2026 |
| PlayStation, Nintendo | Not public | Yes | n/a |

The sections that follow give each row its sources and caveats.

## Steam

Valve's Steamworks documentation states the costs of getting onto Steam plainly. Steam Direct charges "$100 USD (or equivalent)" for each new app, non-refundable, and "recoupable in the payment made after your product has at least $1,000.00 Adjusted Gross Revenue." The revenue share isn't stated on those pages; Valve's announcement of "New Revenue Share Tiers" (late 2018) renders without its text, and TechCrunch's report of it (3 December 2018) gives the tiers: "30 percent cut on sales under $10 million, then a 25 percent cut on sales between $10 million and $50 million, then a 20 percent cut on sales above $50 million." Contemporary reports disagreed on whether the lower rates apply to all sales once a threshold is crossed or only to sales above it, so confirm with your distribution agreement before modeling revenue above $10 million.

Steam's microtransaction model is the clearest example of a store that is the seller. Its documentation says "Steam is providing services as a payment processor" and "Steam customers can only make purchases from the Steam Wallet", through the microtransaction API. The flow, from the implementation guide:

1. The game client gets the player's Steam ID and language; your backend gets their country and currency from `GetUserInfo`.
2. Your backend calls `ISteamMicroTxn/InitTxn` with your own unique 64-bit order ID, the items and the prices. Amounts are in hundredths; country decides the price; if you send a currency other than the player's, Steam converts at the current market rate and shows the converted price.
3. Steam's overlay shows the player the items and an authorize button, and takes them through adding wallet funds if needed.
4. The client receives `MicroTxnAuthorizationResponse_t` and forwards it to your backend.
5. Your backend calls `ISteamMicroTxn/FinalizeTxn`. "A successful response means that the purchase has been accepted and the items should be granted."
6. Your backend polls `GetReport` "at least once each day to reconcile changes to transactions" (and as often as every minute), and claws back items for transactions that turn into refunds or chargebacks.

Two fraud rules from the same page are worth copying on any store: Steam catches most fraudulent transactions within 48 hours, and it recommends that you "prevent trading or gifting of the newly purchased items for at least 72 hours from the time of purchase." Refunds on fraudulent accounts trigger an "automatic 'claw-back' system removing the funds and items." A trade hold is data on the item definition ([Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements) gives items a `trade_hold`), not a special case in the trading code.

## Epic Games Store

Epic's own store pages refused automated access during research, so the terms here come from Epic's announcement as quoted by GameFromScratch (1 May 2025): "developers will pay a 0% revenue share on their first $1,000,000 in revenue per app per year", then "our regular 88%/12% revenue share", starting in June 2025. The same announcement launched webshops "hosted by the Epic Games Store", which let developers send players from a game to buy digital items on any platform that allows it, and said players "will also accrue 5% Epic Rewards on all their purchases". Read Epic's current distribution terms for the exact threshold wording (per app or per product, gross or net) before you rely on it.

## Microsoft Store and Xbox

Microsoft publishes its store terms. The Microsoft Store App Developer Agreement version 8.11 (published 17 March 2026, effective 17 April 2026) sets the Store Fee in Section 6(b):

- "Fifteen percent (15%) of Net Receipts for any Apps" not listed under the 30% rule.
- "Twelve percent (12%) of Net Receipts for any Games (and any in-App Products in such Games)" not listed under the 30% rule.
- "Thirty percent (30%) of Net Receipts" for Xbox console apps billed on a non-subscription basis, all Xbox console games in the Microsoft Store, and in-app products bought on a non-subscription basis on an Xbox console.

Two definitions in the agreement matter for the arithmetic. "Net Receipts" are amounts received from customers minus taxes collected for remittance, minus amounts refunded or charged back, and minus anything you owe Microsoft; the fee is a share of that, not of the sticker price. And the commerce rule differs by product: purchases on a third-party commerce engine "are not subject to the Store Fee", but for all games and in-app products in games, on any device, and all apps on Xbox consoles, "you must use Microsoft's commerce engine."

That 30% console line is the one public data point for console store economics. PlayStation and Nintendo publish their consumer refund rules but not their developer revenue terms, and this book doesn't report terms that aren't public.

## Apple App Store

### United States

On the App Store, In-App Purchase has long carried a 30% commission. The Ninth Circuit's December 2025 opinion in *Epic Games v. Apple* states it directly: with IAP, "users pay Apple, which remits 70% to the developers and keeps 30% for itself as a commission." Two programs lower it: the App Store Small Business Program offers "a reduced commission rate of 15% on paid apps and Apple In-App Purchases" for developers with up to $1 million in proceeds in the prior calendar year (and for new developers), and auto-renewable subscriptions pay 85% to the developer after a subscriber's first year of paid service.

Guideline 3.1.1 still requires IAP for in-game currencies and unlocks inside the app. What changed in the US is steering. Since 1 May 2025, the guidelines say entitlements "are not required for developers to include buttons, external links, or other calls to action in their United States storefront apps", and the prohibition on such links applies "except for the United States storefront". A US player can tap a button in the game and buy on your web store.

The court timeline behind that change, from the opinion and the Supreme Court docket:

| Date | Event |
| --- | --- |
| 16 January 2024 | The Supreme Court denies Apple's petition on the 2021 injunction; Apple's compliance plan, with a 27% commission on linked-out purchases within seven days of the link, takes effect |
| 30 April 2025 | The district court finds Apple in civil contempt and bars a commission on linked-out purchases |
| 11 December 2025 | The Ninth Circuit affirms the contempt finding, holds that the 27% commission "had a prohibitive effect", but reverses the outright commission ban and remands, saying Apple should be able to charge a commission based on costs "genuinely and reasonably necessary" for coordinating external links, plus some compensation for its intellectual property |
| 30 June 2026 | The Supreme Court grants Apple's petition, "limited to Question 1" (No. 25-1311) |
| 13 August 2026 | Apple's application for a stay is denied |
| 14 September 2026 | Apple files its merits brief; Epic's is due 13 November 2026 |

As of October 2026 the case is pending, so the US link-out commission is unsettled. Design for it to change: the commission on linked-out purchases is a rate with an effective date in your fee table, and your web store records which purchases came from an in-app link and when.

### European Union

The EU path runs through the Digital Markets Act. On 23 April 2025 the European Commission found that "Apple breached its anti-steering obligation under the Digital Markets Act" and fined it €500 million. Apple's current EU terms took effect on 1 October 2026, superseding the earlier alternative terms with Attachment 14 of the Developer Program License Agreement:

- **App Store commission:** 26% on sales through Apple In-App Purchase, and 20% on sales through alternative payment processing in the app (15% and 10% for Small Business Program participants and for subscriptions after their first year). "App Store commission rates apply to the price paid by the customer," and the subscriptions page describes the base as the price minus VAT.
- **Store services commission:** 15% (10% for program participants and later-year subscriptions) on out-of-app offers reached through a link in the app, and "Only sales made within 7 days of the link tap are subject to this commission."
- **Core Technology Commission:** 5% on digital sales in apps distributed outside the App Store, through alternative marketplaces or web distribution.
- **Reporting:** with alternative payments you collect and remit the taxes yourself and send Apple a report of all alternative payment transactions "monthly within 15 days following the end of the calendar month."

The seven-day window is an attribution requirement. To pay the right commission, your web store has to know which purchases followed a link tap from the iOS app within seven days, which means a link token carried from the app into the checkout and stored with the order.

## Google Play

Google Play changed its fee structure in 2026. Its service-fee page, as of October 2026, describes a new structure in Australia, the EEA, Japan, the UK and the US. Whether a player counts as a new or existing install depends on their first install or update relative to the regional rollout date: 30 June 2026 for the EEA, UK and US, and 30 September 2026 for Australia and Japan.

| Transaction | New installs | Existing installs |
| --- | --- | --- |
| Auto-renewing subscriptions | 10% + 5% billing fee | 10% + 5% billing fee |
| Other transactions | 20% + 5% billing fee | 25% + 5% billing fee, or 20% for external web links |
| Other, Play Games Level Up or Apps Experience programs | 15% + 5% billing fee | 20% + 5% billing fee, or 15% for external web links |

The 5% billing fee applies when the purchase goes through Google Play Billing (and to paid-app purchases). In all other markets, until the new fees roll out globally, the older structure holds: 15% on the first $1 million of annual earnings and 30% above, and 15% on auto-renewing subscriptions. Alternative billing in South Korea and India costs 4% less than the Google Play billing rate for the same transaction.

The US terms follow *Epic v. Google*. Google's developer notice gives the dates:

| Date | Event |
| --- | --- |
| 12 September 2025 | The Ninth Circuit upholds the injunction's changes to Android and Google Play |
| 29 October 2025 | For US users, Google Play Billing is no longer required, and developers may link to outside downloads and transactions |
| 9 December 2025 | The Payments policy, alternative billing programs and external content links program launch |
| 4 March 2026 | Google and Epic sign a settlement and ask the court for a revised Modified Injunction |
| 22 July 2026 | The third-party app store programs take effect |
| 1 October 2026 | Enrollees in external content links and alternative billing begin reporting transactions and paying service fees |
| 1 February 2027 | Extended deadline (announced 21 October 2026) for external content links enrollees to report downloads and pay fees |

The notice doesn't state the fee amounts for those programs; read each program's page before modeling them.

## Where a $9.99 Purchase Goes

Put the rates side by side on one purchase and the spread is the whole argument for web stores. The sheet takes a $9.99 price before tax through each store at the rate a typical mid-sized game would pay, and through a web store paying only a card fee.

![Dimensional drawing of one 9.99 dollar purchase split into a store fee and net revenue for eight channels: Steam, Epic Games Store, Microsoft Store on PC, Xbox console, Apple US, Apple EU, Google Play US for new installs, and a web store paying a card fee, with coded fee and net dimensions and notes.](/diagrams/gm-store-fees.svg "On the same $9.99 purchase, the developer keeps between $6.99 and $9.40 depending on where the player bought, before refunds, chargebacks and the costs a web store carries itself.")

| Code | Channel | Rate used | Fee | Net |
| --- | --- | --- | --- | --- |
| P1 | Price before tax | | | 9.99 |
| F1, N1 | Steam | 30% (sales under $10M) | 9.99 × 0.30 = 3.00 | 9.99 - 3.00 = 6.99 |
| F2, N2 | Epic Games Store | 12% (after the first $1M in the year) | 9.99 × 0.12 = 1.20 | 8.79 |
| F3, N3 | Microsoft Store, PC game | 12% of Net Receipts | 9.99 × 0.12 = 1.20 | 8.79 |
| F4, N4 | Xbox console game | 30% of Net Receipts | 9.99 × 0.30 = 3.00 | 6.99 |
| F5, N5 | Apple US, IAP | 30% standard | 9.99 × 0.30 = 3.00 | 6.99 |
| F6, N6 | Apple EU, IAP | 26% from 1 October 2026 | 9.99 × 0.26 = 2.60 | 7.39 |
| F7, N7 | Google Play US, new install | 20% + 5% billing fee | 9.99 × 0.25 = 2.50 | 7.49 |
| F8, N8 | Web store, US card | 2.9% + $0.30 | 9.99 × 0.029 + 0.30 = 0.59 | 9.40 |

Fees are rounded to the cent and each row closes: Fn + Nn = P1. The web row uses Stripe's standard US card pricing as of October 2026 (2.9% plus 30 cents per successful domestic card transaction, an extra 1.5% for international cards and 1% when currency conversion is needed). It is the floor, not the cost: the web store also pays for tax compliance, fraud losses, $15 dispute fees, refunds, support and the conversion it loses by sending players out of the game. And the store rows are the cases shown; a small developer on Apple's or Google's programs, or a game inside Epic's first $1 million, pays less.

## Web Stores and Direct Payments

Since 2025 a game can, in more places than before, sell outside the platform's billing: links out of US iOS and Android apps, alternative payments and link-outs in the EU, Epic's own-payment option and webshops, and any game's own website for PC. The decision is a trade, and the fee is only one side of it.

What you gain is margin and ownership of the customer relationship: your own receipts, your own refund policy within the law, bundles and prices the store can't sell, and payment methods the store doesn't offer ([Wallets & Local Payment Methods](/books/payments/wallets-and-local-methods)).

What you take on is everything the store did:

- **You're the seller.** Taxes in every country you sell to ([Sales Tax & VAT](/docs/payments/sales-tax)), or a merchant-of-record provider that takes that on for a fee.
- **Fraud.** Stolen cards are used on virtual items because items deliver instantly and some can be traded or resold. Card testing hits checkout pages ([Fraud & Risk](/books/payments/fraud-and-risk)).
- **Chargebacks** arrive months later, cost a fee each, and count toward card-network monitoring thresholds ([Disputes & Chargebacks](/books/payments/disputes-and-chargebacks)).
- **Identity.** The web purchase has to land on the right game account, which means signing in on the web with the same account the game uses ([Accounts, Identity & Cross-Platform](/books/gaming/accounts-and-identity)) or carrying a signed token from the game to the checkout.
- **Store rules.** Link placement, wording and parental gates are set per store and per region; Apple's EU terms put alternative payments behind a parental gate for 13- to 17-year-olds and don't permit out-of-app offers for under-13s.

My default: keep store billing in the game and offer the web store as a link where the rules allow it, with a price or bundle advantage that's honest about why it exists. The web store gets a ledger, idempotent grants and refund handling just as complete as the store integrations; a cheaper channel that grants twice or never revokes costs more than the fee it saved.

## Regional Pricing

A game priced at $59.99 everywhere is unaffordable in much of the world and invites key resellers to arbitrage the gap. Stores provide tools; the policy is yours. Steam's pricing documentation offers three conversion methods for suggested regional prices: "Exchange rate conversion only", "Purchasing power conversion only", using "public data about the purchasing power of customers within a given country and/or region", and "Multi-variable conversion", which also weighs comparable entertainment costs. Steam's rules are the kind every pricing system ends up needing:

- Partners set prices, and Valve reviews initial prices and changes, "usually processed within one or two business days."
- Prices should change only "after 30 days from release", and discounts generally can't start within 30 days of release.
- "Increasing a price in one or more currencies will generate a 30 day cooldown on your ability to submit discounts."
- The base price "must be at least equivalent to Steam's Multi-Variable Conversion method for the $0.99 USD tier."
- Where Steam has no local currency it prices in USD, with optional discounted USD region groups (USD_CIS, USD_LATAM, USD_MENA and USD_SASIA).

So a price is a row keyed by product, store, currency or region, and validity range, with the reason for the price (conversion method, promotion) and the rule that cools it down: the `offer_prices` table in [Personalized Shops](/books/gaming/monetization#personalized-shops), with the cooldown and floor checked when a new row is proposed rather than when it goes live. In-game currency packs need the same per-region prices, and the item prices in currency stay the same everywhere, which is one reason games sell currency. Mismatches between a player's account country and payment currency are a fraud signal: Steam suggests comparing the wallet currency from `GetUserInfo` with the user's country, while noting that travel can explain a mismatch. Converting and storing both currencies is covered in [Multi-Currency](/docs/payments/multi-currency).

Whether a price includes tax is the other regional decision. EU and UK consumer prices are usually shown tax-inclusive, so a price that's identical across countries yields different net revenue as VAT rates differ ([VAT and GST on Digital Goods](/docs/payments/sales-tax#vat-and-gst-on-digital-goods)).

## Refunds and Chargebacks

Every store has a refund policy, and most of them put the decision with the store. Your job is to learn about the refund quickly and take back what it paid for.

| Store | Policy, as of October 2026 | How you learn about it |
| --- | --- | --- |
| Steam | Games within 14 days with under two hours played; in-game purchases in third-party games only if the developer opts in; subscriptions within 48 hours if unused; refunds issued within a week of approval | `GetReport` lists refunded and charged-back transactions |
| PlayStation Store (US) | Games and add-ons within 14 days unless downloading or streaming has started; currency bought outside gameplay within 14 days if the game hasn't been launched; currency bought in gameplay not cancellable unless faulty; wallet funds non-refundable | Platform-specific; not public |
| Apple | Apple decides refunds | App Store Server Notifications report refunds; you can send consumption information when Apple asks |
| Google Play | Varies by product, payment method and location; "The developer can help with purchase issues and can process refunds" | The Voided Purchases API lists purchases "canceled, revoked, or charged back" |

Steam's policy also shows a rule worth knowing: "If you have been banned by VAC (the Valve Anti-Cheat system) on a game, you lose the right to refund that game."

On your own web store, refunds are your policy within consumer law (the EU right of withdrawal for digital content is part of the CPC principles in [Loot Boxes & Consumer Law](/books/gaming/consumer-law-and-loot-boxes)), and chargebacks are the card network's. Stripe's documentation summarizes the card timeline: cardholders can typically dispute "within 120 days of the original payment", you usually have 7 to 21 days to respond, the issuer usually decides within 60 to 75 days, and the full cycle takes two to three months. Stripe also reports that "about 40% of Visa and Mastercard EFWs" (early fraud warnings) become fraud disputes if the charge isn't refunded. Virtual goods invite friendly fraud because the item was delivered and used before the dispute arrives, so keep the evidence: the account, the device, the session, the grant and the play time after it ([Disputes & Chargebacks](/books/payments/disputes-and-chargebacks#reason-codes-decide-the-evidence)).

What a reversal does to the account is a policy with legal edges. The FTC's 2023 final order against Epic Games bars it from locking accounts of customers who dispute charges, so "ban the account on chargeback" is not a safe default. Revoke what the payment bought, record the reversal, and handle abuse through the same penalty system as any other policy violation ([Player Behavior & Moderation](/books/gaming/player-behavior)).

When an item was already used, the revocation needs a rule: Steam's guidance and Google's Voided Purchases API both describe clawing back unused items "as if they were never purchased". For spent currency, the choices are revoking what it bought, a negative balance that future purchases repay, or writing it off. Pick one per game, publish it, and implement it in the ledger rather than by hand ([Refunds, Chargebacks and Clawbacks](/books/gaming/economies-and-entitlements#refunds-chargebacks-and-clawbacks) has the algorithm). On your own store you can also refund only the unspent part in the first place, which avoids the question.

## Taxes

On a store, the store usually handles consumer tax: Microsoft's "Net Receipts" exclude "any sales, use, or VAT/GST taxes collected from Customers for remittance by Microsoft or a billing service provider", and the store fee is computed after. When you step outside store billing, the tax is yours: Apple's EU terms say that for sales through an alternative payment provider, "you're responsible for the collection and remittance of any applicable taxes."

Games are digital services for VAT. In the EU and UK, consumer sales are taxed where the customer is, which means location evidence on every web sale and registration (or the One Stop Shop) for EU VAT. All of that is in [Sales Tax & VAT](/docs/payments/sales-tax), including when a merchant of record is the better choice. Two gaming specifics: the money transaction is the currency pack purchase, not the later spending of currency inside the game, so that's where the tax snapshot belongs; and a web store that offers the same price everywhere is choosing tax-inclusive pricing, with net revenue varying by country.

## Receipt Validation and Entitlement Grants

The client's word that a purchase succeeded is not proof. Every store gives your server a way to verify a purchase directly, and the grant should happen only after that check, on the server, exactly once.

- **Apple.** The App Store Server API is "a REST API that you call from your server to request and provide information about your customers' In-App Purchases", and the App Store signs the transaction information it returns. Get Transaction Info works for any transaction ID; Get Transaction History returns the whole history; App Store Server Notifications push refunds and subscription changes, and you can request notifications missed in the past 180 days. Set an `appAccountToken` (a UUID) at purchase time and "the App Store returns the same app account token value in the resulting transaction", which ties the purchase to your account.
- **Google.** "Your app should always verify the legitimacy of purchases before granting benefits to a user", using `Purchases.products:get` or `Purchases.subscriptionsv2:get`. Grant only when the state is `PURCHASED`, never while `PENDING`. Acknowledge (or consume) "within three days so that the purchase isn't automatically refunded and entitlement revoked." Use the purchase token as the key: it "is globally unique, so you can safely use this value as a primary key", while `orderId` isn't, because "not all purchases generate an orderId". Pass `obfuscatedAccountId` at purchase to tie the purchase to your account.
- **Steam.** `FinalizeTxn` succeeding is the verification and the signal to grant; there is no later acknowledgment, and `GetReport` is the reconciliation.
- **Web store.** Your processor's webhook is the signal, verified and processed idempotently ([Webhooks](/docs/api-design/webhooks)).

All four reduce to one state machine per store transaction:

| State | Meaning | Next |
| --- | --- | --- |
| `pending` | The client reported a purchase, or the store reported a pending payment | `verified`, `rejected` |
| `verified` | The store's server confirmed the purchase for this account | `granted` |
| `granted` | Entitlements and items written, keyed by the store transaction | `acknowledged` |
| `acknowledged` | The store told the purchase was fulfilled (Google acknowledge or consume, Apple finish); Steam and web purchases move here with the grant, since finalizing or capturing came first | `reversed` |
| `rejected` | Verification or fraud checks failed; nothing granted | (final) |
| `reversed` | Refunded, voided or charged back; grants revoked | (final) |

Grant before acknowledging. If the grant fails, the store's own timeout (Google's three days) refunds the player rather than leaving them charged with nothing; if the acknowledgment fails after a grant, a retry is harmless because the grant is keyed. Google's security guidance prefers an explicit revoke and refund when your checks reject a purchase, since an auto-refund from a missing acknowledgment "is ambiguous since it can also result from a processing timeout".

```sql
-- One row per purchase at any store. A platform serving many games or
-- studios carries tenant_id and scopes uniqueness by store and game.
CREATE TABLE store_transactions (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id             UUID NOT NULL,
  game_id               UUID NOT NULL REFERENCES games (id),
  account_id            UUID NOT NULL REFERENCES accounts (id),
  store                 TEXT NOT NULL CHECK (store IN ('steam', 'epic', 'microsoft', 'xbox', 'playstation', 'nintendo', 'apple', 'google', 'web')),
  store_transaction_xid TEXT NOT NULL,           -- Apple transaction id, Google purchase token, Steam order id, processor charge id
  store_product_xid     TEXT NOT NULL,           -- the store's SKU, mapped to an offer
  offer_id              UUID REFERENCES offers (id),
  price_amount          BIGINT NOT NULL,         -- minor units, before tax
  tax_amount            BIGINT,                  -- when the store reports it, or when you collected it
  currency              TEXT NOT NULL,
  country_code          TEXT,
  state                 TEXT NOT NULL CHECK (state IN ('pending', 'verified', 'granted', 'acknowledged', 'rejected', 'reversed')),
  reversal_reason       TEXT CHECK (reversal_reason IN ('refund', 'chargeback', 'voided', 'fraud')),
  link_token            TEXT,                    -- set when the purchase followed an in-app link (EU 7-day window)
  store_fee_rate_id     UUID,                    -- the store_fee_rates row the estimate used
  store_fee_estimate    BIGINT,                  -- minor units; the store's report is the truth
  verified_at           TIMESTAMPTZ,
  granted_at            TIMESTAMPTZ,
  acknowledged_at       TIMESTAMPTZ,
  reversed_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT store_transactions_store_xid_key UNIQUE (store, game_id, store_transaction_xid)
);

-- The fee schedule is data: per store, program and region, effective-dated.
-- Published rates are the same for every tenant, so this is shared reference data.
CREATE TABLE store_fee_rates (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  store          TEXT NOT NULL,
  program        TEXT NOT NULL DEFAULT 'standard',  -- small_business, level_up, first_million ...
  region         TEXT NOT NULL,                     -- 'US', 'EEA', 'ROW' ...
  transaction_kind TEXT NOT NULL CHECK (transaction_kind IN ('paid_app', 'in_app', 'subscription_first_year', 'subscription_later', 'link_out')),
  rate_basis_points INTEGER NOT NULL,               -- 3000 = 30%
  fixed_amount   BIGINT NOT NULL DEFAULT 0,
  currency       TEXT,
  valid_during   DATERANGE NOT NULL,
  source_url     TEXT NOT NULL                      -- where the rate is published
);
```

The fee on a transaction is an estimate until the store pays. Some rates depend on things a single purchase can't see: Steam's tier on the game's cumulative sales, Epic's on whether the year's first $1 million has passed, Apple's and Google's on program enrollment and, for subscriptions, on how long the subscriber has paid. My default is to estimate at grant time from the rate row in force for the game's program and record which row was used, then treat each store's payout or sales report as the truth and post the difference in reconciliation. Finance gets a daily margin that's nearly right and a monthly one that's exact, and a rate change is a new row rather than a code change.

The grants themselves go into the core `entitlements` and inventory tables with the store transaction ID as their `source_ref`, and a reversal writes the revocation there ([Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements) owns grants, revocations and clawbacks). Every state change is an event that finance, support and anti-fraud consume ([Events](/docs/architecture/events)), and the store's notifications are only one input: a daily reconciliation against each store's report (Steam's `GetReport`, Apple's transaction history, Google's voided purchases) catches whatever the push missed. Support needs to see the whole row, from verification to reversal, when a player says they paid and got nothing ([Player Support](/books/gaming/player-support)).

## What This Means for the System You Build

- **A fee schedule as data:** rates per store, program, region and transaction kind, with validity ranges and sources, so the next court order or program change is a new row.
- **One store transaction table and state machine** across Steam, consoles, Apple, Google, Epic and the web: verified on the server, granted once keyed by the store's ID, acknowledged after the grant, reversed with a reason.
- **Server-side verification for every store,** with account binding at purchase (`appAccountToken`, `obfuscatedAccountId`, your own order ID) and daily reconciliation against store reports.
- **Revocation that runs itself:** refunds, voids and chargebacks revoke what they paid for under a published rule for used items and spent currency, without locking the account.
- **Regional prices as dated rows** with conversion method, cooldowns and floors, and a tax-inclusive or exclusive decision per region.
- **A web store only as complete as the store integrations:** tax, fraud, disputes, identity linking and link-attribution tokens for commission windows, or a merchant of record that takes them on.
- **Dates on every fee and term** in the code and in the docs; many changed in 2025 and 2026, and some are still in court.

## References

**Specifications**

- [Microsoft Store App Developer Agreement v8.11](https://go.microsoft.com/fwlink/?linkid=528905), effective 17 April 2026, Section 6(b) Store Fees, the Net Receipts definition and the commerce engine requirement for games
- [Apple: App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), Guideline 3.1.1 and the United States storefront exception in 3.1.1(a) and 3.1.3
- [Apple: Updates to the App Review Guidelines](https://developer.apple.com/news/?id=9txfddzf), 1 May 2025, changes for the US court decision on buttons, links and calls to action
- [Apple: Digital Markets Act and apps in the EU](https://developer.apple.com/support/dma-and-apps-in-the-eu/), the terms effective 1 October 2026: 26% and 20% commissions, the 15% store services commission within 7 days of a link tap, the 5% Core Technology Commission and monthly reporting
- [Apple: App Store Small Business Program](https://developer.apple.com/app-store/small-business-program/), the 15% commission and the $1 million eligibility threshold
- [Apple: Auto-renewable subscriptions](https://developer.apple.com/app-store/subscriptions/), 70% proceeds in the first year, 85% after, and VAT excluded from the commission base in the EU
- [Google Play: Service fees](https://support.google.com/googleplay/android-developer/answer/112622), the 2026 fee structure, rollout dates, billing fee, rest-of-world tiers and alternative billing
- [Google Play: Policies for developers serving users in the US](https://support.google.com/googleplay/android-developer/answer/15582165?hl=en), the injunction, settlement, program and fee-reporting dates

**Reference**

- [Steamworks: Steam Direct fee](https://partner.steamgames.com/doc/gettingstarted/appfee), the $100 fee per app, recouped after $1,000 in Adjusted Gross Revenue
- [Steamworks: Microtransactions](https://partner.steamgames.com/doc/features/microtransactions), Steam as payment processor, the Steam Wallet requirement, daily reconciliation, the 72-hour trade hold and clawback
- [Steamworks: Microtransactions implementation guide](https://partner.steamgames.com/doc/features/microtransactions/implementation), the InitTxn, authorization, FinalizeTxn and GetReport flow, order IDs and currency handling
- [Steamworks: Pricing](https://partner.steamgames.com/doc/store/pricing), regional conversion methods, review time, 30-day rules and the price floor
- [Steamworks: Supported currencies](https://partner.steamgames.com/doc/store/pricing/currencies), USD pricing and the discounted USD region groups
- [Apple: App Store Server API](https://developer.apple.com/documentation/appstoreserverapi), signed transaction information, transaction and refund history, and notification history
- [Apple: appAccountToken](https://developer.apple.com/documentation/storekit/product/purchaseoption/appaccounttoken(_:)), a UUID returned in the transaction to tie a purchase to your account
- [Apple: In-App Purchase](https://developer.apple.com/in-app-purchase/), App Store Server Notifications for refunds and the consumption information endpoint
- [Android Developers: Integrate the Google Play Billing Library](https://developer.android.com/google/play/billing/integrate), verification before granting, pending purchases and the three-day acknowledgment window
- [Android Developers: Fight fraud and abuse](https://developer.android.com/google/play/billing/security), backend verification, purchase tokens as keys, explicit revoke and refund, and the Voided Purchases API
- [Stripe: How disputes work](https://docs.stripe.com/disputes/how-disputes-work), dispute windows, response and decision times, and early fraud warnings
- [Stripe: Pricing](https://stripe.com/pricing), the standard US card rate, international and conversion surcharges and the dispute fee

**In practice**

- [Ninth Circuit: Epic Games v. Apple, No. 25-2935](https://cdn.ca9.uscourts.gov/datastore/opinions/2025/12/11/25-2935.pdf), 11 December 2025, the 30% IAP commission, the 27% link-out commission, the contempt finding and the remand
- [Supreme Court docket 25-1311, Apple v. Epic Games](https://www.supremecourt.gov/docket/docketfiles/html/public/25-1311.html), cert granted 30 June 2026 limited to Question 1, the stay denial and the briefing schedule
- [European Commission: Apple and Meta DMA decisions](https://digital-markets-act.ec.europa.eu/commission-finds-apple-and-meta-breach-digital-markets-act-2025-04-23_en), 23 April 2025, the €500 million fine for breaching the anti-steering obligation
- [TechCrunch: Valve's new Steam revenue share tiers](https://techcrunch.com/?p=1753729), 3 December 2018, the 30%, 25% and 20% tiers (secondary)
- [GameFromScratch: Epic Games Store web shops and $1M revenue share](https://gamefromscratch.com/epic-games-store-announce-web-shops-and-1m-revenue-share/), 1 May 2025, Epic's announcement quoted: 0% on the first $1 million per app per year, 88/12 above, webshops (secondary)
- [Steam: Refunds](https://store.steampowered.com/steam_refunds/), refund windows by product type, VAC bans and abuse
- [PlayStation: Store cancellation policy (US)](https://www.playstation.com/en-us/legal/playstation-store-cancellation-policy/), cancellation windows for games, currency, subscriptions and wallet funds
- [Google Play Help: Refunds](https://support.google.com/googleplay/answer/2479637), policy varying by product, payment method and location, with developers able to refund
- [FTC: Final order requiring Epic Games to pay $245 million](https://www.ftc.gov/news-events/news/press-releases/2023/03/ftc-finalizes-order-requiring-fortnite-maker-epic-games-pay-245-million-tricking-users-making), 14 March 2023, including the bar on locking accounts over disputed charges
