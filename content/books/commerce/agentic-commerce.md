+++
title = "Agentic & AI Shopping"
description = "AI shopping agents as a sales channel: ChatGPT, Google AI Mode, Perplexity and Amazon; ACP and UCP checkout, feeds for agents, agent identity and liability."
category = "Commerce Industry"
order = 2334
part = "Marketplaces"
tags = ["commerce", "agentic-commerce", "ai", "checkout", "feeds", "protocols"]
+++

An AI shopping agent is a new kind of storefront that the merchant doesn't render. A shopper asks a chat assistant for a waterproof phone case under $40 that ships by Friday; the assistant reads product feeds and pages from many stores, compares them, shows three, and either sends the shopper to one store's checkout or buys it on their behalf without the shopper ever seeing the store's site. To the merchant this looks like a marketplace in some ways (a third party owns the shopper's attention and decides whose product is shown) and like its own site in others (the merchant usually stays the seller, sets the price and charges the card). Since September 2025 the large assistants have shipped checkout inside the conversation, and the protocols they publish define how a merchant's catalog, cart, checkout and order look to an agent.

This chapter covers AI shopping as a sales channel as of October 2026: the agent surfaces (ChatGPT, Google AI Mode and Gemini, Perplexity, Microsoft Copilot and Meta through Shopify, Amazon's own assistant and its Buy for Me), the agentic checkout protocols at the commerce layer (OpenAI and Stripe's Agentic Commerce Protocol, the Universal Commerce Protocol, Shopify's agent APIs), product data and feeds for agents, telling agents apart and controlling their access, and who is responsible when an agent buys. How an agent pays (mandates, agentic tokens, Visa Intelligent Commerce, Mastercard Agent Pay, AP2) is the Payments volume's [Agentic Commerce](/books/payments/ai-in-payments#agentic-commerce) and [What an Agent May Initiate](/books/payments/ai-in-payments#what-an-agent-may-initiate); the crawler controls for AI search are the playbook's [AI Search Features](/docs/frontend/seo#ai-search-features); AI used inside a store (content, search, support) is [AI in Commerce](/books/commerce/ai-in-commerce). The chapter extends `carts`, `orders` and `sales_channels` and adds `agent_clients` and `agent_checkout_sessions`.

## How the Platforms Do It

As of October 2026, from the platforms' own announcements and documentation:

| Surface | Launched | How a purchase happens | Who is the seller | What the merchant integrates |
| --- | --- | --- | --- | --- |
| **ChatGPT** (OpenAI) | Instant Checkout, September 29, 2025, for US users, with Etsy sellers first and Shopify merchants announced | Inside the chat through the Agentic Commerce Protocol, or by sending the shopper to the store's checkout | "OpenAI is not the merchant of record"; the merchant validates the order, calculates tax, runs risk checks and charges the payment | A product feed (approved partners), and the Agentic Checkout Spec for in-chat checkout |
| **Google AI Mode and Gemini** | Agentic checkout ("buy for me" on tracked prices, with Google Pay), November 13, 2025; the Universal Commerce Protocol, January 11, 2026 | In AI Mode or Gemini through UCP, paid with Google Pay; "We'll always ask for your permission first" | "Retailers remain the seller of record" | Merchant Center products marked eligible for native checkout (US only), and UCP checkout and order endpoints; UCP access by waitlist |
| **Perplexity** | Shopping with checkout by PayPal for all US users, November 25, 2025 | Inside Perplexity, with PayPal | Retailers "stay at the center of the transaction" | PayPal as the payment route |
| **Shopify agentic storefronts** | "Active by default for eligible stores" | ChatGPT sends buyers to the store's own checkout; Google AI Mode and Gemini, Microsoft Copilot and Meta check out in the channel | The merchant, which retains "full ownership of the customer relationship" | Nothing beyond Shopify; managed under Sales channels > Agentic |
| **Amazon Alexa for Shopping** | Rufus, renamed Alexa for Shopping on May 13, 2026 | On Amazon, including auto-buying "items at a set price" | Amazon or its sellers | Nothing new; it's Amazon's own catalog |
| **Amazon Buy for Me** | A subset of US customers | Amazon's agent buys on a brand's own website, passing the customer's encrypted name, address and payment | The brand, which handles delivery, returns and support | Nothing; the agent uses the brand's site as a shopper would |

Three patterns run through the table:

- **The merchant stays the seller.** OpenAI, Google, Perplexity and Shopify all say so in nearly the same words: the agent is a channel, the merchant is merchant of record, charges the payment and owns fulfillment, returns and disputes. That makes an agent order a first-party order taken through someone else's interface, not a marketplace sale.
- **Two integration styles.** Either the agent calls the merchant's checkout as an API (ACP, UCP, Shopify's Checkout MCP), or it uses the merchant's website as a person would (Amazon's Buy for Me, browser agents). The first is negotiated; the second arrives uninvited.
- **Feeds decide visibility.** Every surface starts from structured product data: OpenAI's product feed, Google's Merchant Center, Shopify's catalog. A product missing from the feed, or marked ineligible for checkout, isn't shown or can't be bought.

Amazon is on both sides: its assistant shops only Amazon, its Buy for Me agent shops other stores, and its robots.txt disallows the crawlers and user agents of OpenAI, Perplexity, Google's AI training token, Anthropic, Meta and others. Amazon also told Perplexity that "agentic third-party applications such as Perplexity's Comet have the same obligations" as other parties on its store and asked it to remove Amazon from Comet; Perplexity's response, on November 4, 2025, was titled "Bullying is Not Innovation." I couldn't confirm the current status of the dispute from a court record. <!-- source-gap: amazon-perplexity-comet | status | court, docket and status (any injunction) of Amazon's legal action against Perplexity over the Comet agent | closes with: the court docket or an order | checked: 2026-10-28 -->

## Three Ways an Agent Buys

Every agent purchase falls into one of three shapes, and each needs different things from the store:

- **Handoff.** The agent finds the product and sends the shopper to the store's checkout with the cart filled. The store's normal checkout runs, with its normal fraud checks and terms. Shopify's Checkout MCP returns a `continue_url` for this, and ChatGPT's purchases from Shopify stores take this path ("Customers complete purchases on your online store checkout, in ChatGPT's in-app browser or in a new tab"). Whether ChatGPT's Instant Checkout continues in-chat for other merchants, I couldn't confirm. <!-- source-gap: openai-instant-checkout-2026 | status | whether ChatGPT Instant Checkout still completes purchases in chat as of October 2026, and its merchant fees | closes with: OpenAI's merchant documentation or help center (blocked to fetches) | checked: 2026-10-28 -->
- **Delegated checkout.** The agent completes checkout through the merchant's API: it creates a checkout session, updates it with address and shipping choice, and completes it with a payment token the shopper approved in the agent's interface. The merchant computes totals, charges the token and creates the order. This is ACP and UCP.
- **Browsing agent.** The agent drives the store's website like a person (Buy for Me, browser agents). The store sees a session, a cart and a checkout, filled by software. Nothing was negotiated, and the store can only tell by the agent's own identification or its behavior.

My default is to support handoff everywhere, delegated checkout on the surfaces that bring volume, and to identify browsing agents rather than block them, because blocking a shopper's own agent turns away a sale the shopper asked for.

## Agentic Checkout Protocols

The two published checkout protocols describe the same object, a checkout session the agent drives and the merchant prices, with different wiring.

**The Agentic Commerce Protocol (ACP)**, published by OpenAI and Stripe under Apache 2.0, defines a merchant-hosted checkout API:

- **Endpoints.** `POST /checkout_sessions` creates a session from items; `POST /checkout_sessions/{id}` updates it (buyer, address, fulfillment option); `GET /checkout_sessions/{id}` reads it; `POST /checkout_sessions/{id}/complete` places the order with a payment token; `POST /checkout_sessions/{id}/cancel` abandons it.
- **States.** `not_ready_for_payment`, `ready_for_payment`, `completed` and `canceled`; the merchant's response carries line items, totals, fulfillment options and messages the agent shows the buyer.
- **Headers.** `Idempotency-Key`, a request `Signature`, and an `API-Version` (dated, such as `2025-09-12`).
- **Orders.** The merchant sends `order_created` and `order_updated` webhooks back to the agent.
- **Payment.** A separate Delegated Payment Spec has the agent obtain a token from the merchant's payment provider, limited by `max_amount`, currency, expiry, merchant and checkout session; Stripe's shared payment token is the first implementation ([Agentic Commerce](/books/payments/ai-in-payments#agentic-commerce)).

**The Universal Commerce Protocol (UCP)**, announced by Google on January 11, 2026 as "a new open standard for agentic commerce" and co-developed with Shopify, Etsy, Wayfair, Target and Walmart, is broader:

- **Discovery.** A business publishes a profile at `/.well-known/ucp` listing its capabilities; agents identify themselves with a `UCP-Agent` header.
- **Capabilities.** Checkout (`dev.ucp.shopping.checkout`, with create, update and complete), identity linking over OAuth 2.0, orders, and payment token exchange, versioned by date (such as `2026-08-25`), over REST or JSON-RPC, with support for MCP, A2A and AP2.
- **Google's implementation.** Native checkout in AI Mode and Gemini uses `POST /checkout-sessions`, `GET` and `PUT /checkout-sessions/{id}`, and `complete` and `cancel`, with Google Pay as the payment handler; order lifecycle webhooks (created, shipped with tracking, delivered, returned, with refunds and cancellations as adjustments) are signed per RFC 9421. In Merchant Center, only products with `native_commerce` checkout eligibility show "Buy now," for US products.
- **Shopify's implementation.** Checkout MCP at `https://{shop-domain}/api/ucp/mcp` exposes `create_checkout`, `get_checkout`, `update_checkout`, `complete_checkout` and `cancel_checkout`, with states `incomplete`, `requires_escalation`, `ready_for_complete`, `complete_in_progress`, `completed` and `canceled`. `requires_escalation` is the honest one: the checkout needs something only the buyer can do (a verification, a choice), and the agent hands off.

Stripe sits on both: its Agentic Commerce Suite shares a merchant's catalog with agents and runs checkout, and Stripe is "a member of the UCP Tech Council."

For a merchant's system, both protocols map onto what [Cart & Checkout](/books/commerce/cart-and-checkout) already has:

- **The protocol session is a checkout.** An agent's checkout session creates a `carts` row and a `checkouts` row on the merchant's side; updates recompute shipping and tax exactly as an address change in a wallet sheet does ([Accelerated Checkouts](/books/commerce/cart-and-checkout#accelerated-checkouts)).
- **Complete is "place order."** The idempotency key, the freeze, the stock check, the authorization and the order creation are the sequence in [Placing the Order Exactly Once](/books/commerce/cart-and-checkout#placing-the-order-exactly-once), with the agent's token as the payment method.
- **Every server rule runs.** Age-restricted items, shipping eligibility, quantity limits and required disclosures are enforced on the server when the agent completes, because the agent's interface isn't the merchant's ([Required Disclosures](/books/commerce/product-information#required-disclosures)). A rule the protocol can't express is a `requires_escalation`, not a skipped rule.
- **The protocol is an adapter.** ACP and UCP are versioned by date and still moving; one internal checkout with a thin adapter per protocol survives their revisions.

## Product Data for Agents

Agents choose from feeds, and they are stricter than search engines about what they can act on:

- **OpenAI's product feed** requires `item_id`, `title`, `description`, `url`, `brand`, `seller_name`, `image_url`, `availability` and `price` for discovery, with `is_eligible_checkout`, `seller_privacy_policy` and `seller_tos` needed for checkout; it takes JSONL, CSV or TSV, with a full snapshot "at least once a day," and is "currently available to approved partners."
- **Google** uses Merchant Center product data, the same feed as Shopping ([Channel Content and Syndication](/books/commerce/product-information#channel-content-and-syndication)), with checkout eligibility as a product attribute.
- **Shopify's Global Catalog** (`search_catalog`, `lookup_catalog`, `get_product`) clusters products across stores by a Universal Product ID and marks some fields as "Inferred," generated by Shopify rather than the merchant.
- **Marketplace operators** are selling the same thing: Mirakl offers "Agentic Activation" to enrich catalogs so they can be found by AI assistants.

What this means for the catalog:

- **Facts beat prose.** An agent answering "waterproof to what depth, fits which phone, ships by when" reads attributes, not marketing copy. Products with complete, typed attributes ([Attribute Models](/books/commerce/product-information#attribute-models)), GTINs and accurate delivery promises are the ones an agent can recommend with confidence.
- **The feed price is the checkout price.** A feed refreshed daily and a checkout priced live will disagree whenever a price changes; the agent shows the feed's number and the checkout charges another. Prices and availability in feeds come from the same resolver as the store ([Pricing & Price Lists](/books/commerce/pricing#how-to-build-it)), and changes push to agent feeds the way they push to Google.
- **Inferred fields are someone else's claims.** When a catalog or agent infers an attribute the merchant didn't supply, it may be wrong, and the shopper will hold the merchant to it. Supplying the attribute is the only control.
- **Policies are data.** Return windows, shipping times, terms and privacy links are fields the agent reads and repeats; they come from the merchant's policy records, not a page of text.

## Agent Identity and Access

A store needs to tell three kinds of automated traffic apart: crawlers that index for search or train models, a shopper's agent acting on their request, and bots that hoard inventory or test cards. The controls, as of October 2026:

- **robots.txt is a request, not a lock.** RFC 9309 says its rules "are not a form of access authorization." Vendors separate search crawlers, training crawlers and user-initiated fetchers into different user agents, and say user-initiated fetches may not honor robots.txt: OpenAI's `ChatGPT-User` ("robots.txt rules may not apply"), Perplexity's `Perplexity-User` ("generally ignores robots.txt rules") and Google's user-triggered fetchers, including `Google-Agent`, "used by agents hosted on Google infrastructure to navigate the web." The tokens and the trade-offs of blocking them are in [AI Search Features](/docs/frontend/seo#ai-search-features).
- **Signed agents.** Web Bot Auth has an agent sign its HTTP requests (`Signature`, `Signature-Input`, `Signature-Agent` headers per HTTP Message Signatures, RFC 9421) with keys published at `/.well-known/http-message-signatures-directory`, so a site can verify which operator sent a request. Visa's Trusted Agent Protocol and Mastercard Agent Pay both use it, tagging browsing (`agent-browser-auth`) and paying (`agent-payer-auth`) requests with keys in network-hosted directories; Google says it's "experimenting with the Web Bot Auth protocol."
- **Trust tiers.** Shopify's agent profiles show the shape: an anonymous agent can search; a signed agent (RFC 9421, ECDSA P-256 keys in its UCP profile) can do more but can't complete checkout; a token-holding agent (a JWT) can call `complete_checkout` and read orders. Its Global Catalog limits each client to 5 requests per second by default, with HTTP 429 and `Retry-After`.
- **Pay per crawl.** Cloudflare's pay per crawl uses HTTP 402 with crawler price headers to charge crawlers for access, in private beta since July 2025.

My rules: identify agents by signature where they sign, treat a verified agent as a signal in the risk check rather than a pass (card-testing and inventory-hoarding defenses still apply, [Fraud & Risk](/books/payments/fraud-and-risk#card-testing)), rate-limit by verified operator rather than by IP, and keep content that genuinely mustn't be read behind authentication rather than robots.txt.

## Fraud, Liability and the Order After

An agent order is still an order, and everything the merchant owes a buyer still applies:

- **The merchant charges, so the merchant carries the chargeback.** Every surface keeps the merchant as merchant of record, so disputes, refunds and fraud losses on agent orders are the merchant's, under card network rules as for any card-not-present sale ([Disputes & Chargebacks](/books/payments/disputes-and-chargebacks)). Evidence is what changes: the agent's signed request, the shopper's approval in the agent's interface, and (where the payment carries one) the mandate are what answer "I didn't buy this." AP2 calls its mandates "a non-repudiable audit trail"; Visa says its commerce signals "help manage disputes." I found no network rule text that shifts liability for agent-initiated purchases as of October 2026, and the Payments volume treats the question as open ([What an Agent May Initiate](/books/payments/ai-in-payments#what-an-agent-may-initiate)).
- **Wrong item, right agent.** A shopper whose agent bought the wrong size will return it. Return policies apply unchanged; my default is to treat agent-placed orders as ordinary returns, not disputes about whether the agent was authorized.
- **Consumer law doesn't move.** Shipping promises, fee disclosure and EU withdrawal rights apply to the merchant's sale however it was placed ([Consumer Protection Online](/books/commerce/online-consumer-protection)); the merchant can't assume the agent showed the shopper what the law requires, so terms and required disclosures go into the protocol response the agent must display, and the order confirmation the merchant sends.
- **Order status goes back to the agent.** ACP's order webhooks and UCP's order lifecycle events keep the agent current, so a shopper asking the assistant "where's my order" gets the merchant's tracking. The merchant also sends its own confirmation and shipping emails, because the shopper is its customer.
- **Promises made by the agent aren't the merchant's,** unless the merchant's own data made them. What a merchant's own AI says to a customer binds the merchant ([The AI's Promises Are the Business's Promises](/docs/architecture/ai-agents#the-ai-s-promises-are-the-business-s-promises)); what a third party's agent says is that party's, which is a reason to keep the data the agent repeats (prices, delivery dates, policies) accurate and recorded.

## How to Build It

Agents as clients with a verification method and a trust tier, and each agent checkout as a session mapped to the merchant's own checkout and order, extending `sales_channels`, `carts` and `orders` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model) and `checkouts` from [Cart & Checkout](/books/commerce/cart-and-checkout#how-to-build-it):

```sql
ALTER TABLE sales_channels
  DROP CONSTRAINT sales_channels_kind_check,
  ADD CONSTRAINT sales_channels_kind_check CHECK (kind IN ('marketplace', 'first_party', 'pos',
    'phone', 'kiosk', 'agent'));           -- 'chatgpt', 'google_ai_mode', 'perplexity'

ALTER TABLE orders
  DROP CONSTRAINT orders_channel_check,
  ADD CONSTRAINT orders_channel_check CHECK (channel IN ('marketplace', 'first_party', 'pos',
    'phone', 'kiosk', 'wholesale', 'agent'));

CREATE TABLE agent_clients (               -- an agent operator the store recognizes, and how
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  channel_id        TEXT NOT NULL REFERENCES sales_channels (id),
  operator          TEXT NOT NULL,         -- 'openai', 'google', 'perplexity', 'microsoft'
  protocol          TEXT NOT NULL CHECK (protocol IN ('acp', 'ucp', 'mcp', 'browser', 'feed_only')),
  protocol_version  TEXT,                  -- the dated version negotiated, e.g. '2026-04-08'
  verification      TEXT NOT NULL CHECK (verification IN ('none', 'user_agent', 'web_bot_auth',
                      'oauth_token', 'api_key')),
  key_directory_url TEXT,                  -- where the agent's signing keys are published
  trust_tier        TEXT NOT NULL CHECK (trust_tier IN ('anonymous', 'signed', 'token')),
  may_complete      BOOLEAN NOT NULL DEFAULT FALSE,  -- may place orders without handoff
  rate_limit_rps    INT,
  status            TEXT NOT NULL CHECK (status IN ('active', 'paused', 'blocked')),
  UNIQUE (channel_id, operator, protocol)
);

ALTER TABLE carts
  ADD COLUMN agent_client_id UUID REFERENCES agent_clients (id);  -- set when an agent built it

CREATE TABLE agent_checkout_sessions (     -- the protocol's session, mapped to the store's
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  agent_client_id   UUID NOT NULL REFERENCES agent_clients (id),
  external_session_ref TEXT NOT NULL,      -- the ID the store returned, or the agent's
  checkout_id       UUID NOT NULL REFERENCES checkouts (id),
  protocol_status   TEXT NOT NULL,         -- as the protocol names it: 'ready_for_payment',
                                           -- 'requires_escalation', ...
  escalation_reason TEXT,                  -- why the buyer must finish it themselves
  continue_url      TEXT,                  -- the handoff link, when escalated
  payment_token_kind TEXT CHECK (payment_token_kind IN ('shared_payment_token', 'google_pay',
                      'network_agentic_token', 'paypal', 'vault_token')),
  token_limits      JSONB,                 -- max amount, currency, expiry as granted
  mandate_ref       TEXT,                  -- the signed mandate or approval record, if any
  request_signature JSONB,                 -- the verified signature on the completing request
  disclosures_sent  JSONB NOT NULL DEFAULT '[]',  -- terms, policies and warnings returned
  order_id          UUID REFERENCES orders (id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at      TIMESTAMPTZ,
  UNIQUE (agent_client_id, external_session_ref)
);

-- Agent orders and the share refunded, by operator, for the risk team.
SELECT ac.operator, COUNT(*) AS orders,
       AVG(CASE WHEN EXISTS (SELECT 1 FROM order_payments op
                             WHERE op.order_id = o.id AND op.kind = 'refund')
                THEN 1 ELSE 0 END) AS refunded_share
FROM agent_checkout_sessions s
JOIN agent_clients ac ON ac.id = s.agent_client_id
JOIN orders o ON o.id = s.order_id
WHERE o.placed_at <@ $1
GROUP BY ac.operator;
```

Design notes:

- **Agents are channels, merchant of record unchanged.** An agent order has `channel = 'agent'`, `channel_partner` set to the operator and `merchant_of_record = 'merchant'`; tax, fulfillment and accounting treat it as a first-party sale, and reporting can still see where it came from.
- **One checkout, many front doors.** The protocol session points at an ordinary `checkouts` row, so pricing, tax, stock and rule enforcement are the store's own; the adapter translates states and fields and nothing else.
- **Completion is gated by tier.** Only agents with `may_complete` and a verified token or signature can place orders without handoff; everything else gets a `continue_url` ([Authorization](/docs/security/authorization)).
- **Keep the evidence with the order.** The verified request signature, the token's limits, the mandate reference and the disclosures returned are stored on the session, because a dispute on an agent order is answered with them ([Auditing AI Actions](/docs/architecture/ai-agents#auditing-ai-actions)).
- **Protocol versions are data.** Each client records the dated version it speaks; a new version is a new adapter path behind the same checkout, tested before the client is moved ([Versioning](/docs/api-design/versioning)).
- **Order events fan out.** `order.placed` and the fulfillment events feed each agent's webhook as well as the store's own notifications, signed and retried ([Webhooks](/docs/api-design/webhooks)).

## Auditing

- **Every agent checkout session** with its protocol, version, status history, payment token kind and limits, and the order it produced.
- **The verified identity of each completing request:** the signature, the key directory it was checked against, and the agent's tier at the time.
- **What the store told the agent to show:** terms, policies, required disclosures and the totals, as returned.
- **Feed snapshots sent to each agent surface,** so a price or claim the agent repeated can be checked against what the merchant supplied.
- **Access decisions:** which agents were allowed, rate-limited, escalated or blocked, and why.

## What This Means for the System You Build

- **Treat each AI surface as a sales channel** where you stay merchant of record, with its own channel row and reporting.
- **Support handoff everywhere,** and delegated checkout through ACP or UCP where the volume justifies it, as adapters over one checkout.
- **Enforce every rule on the server at completion;** escalate to the buyer when the protocol can't express one.
- **Feed agents complete, typed product data** with prices and availability from the same resolver as checkout.
- **Identify agents by signature,** tier their permissions, and treat verification as a risk signal, not a pass.
- **Keep the evidence of each agent purchase** (signature, approval, token limits, disclosures) with the order, because the chargeback is still yours.
- **Send order status back to the agent and to the customer,** who remains yours.

## References

**Agent surfaces**

- [Stripe: Stripe powers Instant Checkout in ChatGPT (September 2025)](https://stripe.com/newsroom/news/stripe-openai-instant-checkout), launch, Etsy and Shopify merchants, and shared payment tokens
- [OpenAI: Commerce documentation](https://developers.openai.com/commerce), feeds, checkout and payment specs
- [OpenAI: Key concepts](https://developers.openai.com/commerce/guides/key-concepts.md), merchant of record and merchant responsibilities
- [OpenAI: Get started](https://developers.openai.com/commerce/guides/get-started.md), approved partners and daily feed snapshots
- [Google: New tech and tools for retailers in an agentic shopping era (January 2026)](https://blog.google/products/ads-commerce/agentic-commerce-ai-tools-protocol-retailers-platforms/), UCP, co-developers and retailers as seller of record
- [Google: Agentic checkout and holiday AI shopping (November 2025)](https://blog.google/products/shopping/agentic-checkout-holiday-ai-shopping/), buy for me with Google Pay and permission first
- [Perplexity: Shopping that puts you first (November 2025)](https://www.perplexity.ai/hub/blog/shopping-that-puts-you-first), PayPal checkout for US users
- [Perplexity: Bullying is not innovation (November 2025)](https://www.perplexity.ai/hub/blog/bullying-is-not-innovation), its response to Amazon
- [Amazon: Statement on Perplexity's Comet](https://www.aboutamazon.com/news/company-news/amazon-perplexity-comet-statement), obligations of agentic applications
- [Amazon: Buy for Me](https://www.aboutamazon.com/news/retail/amazon-shopping-app-buy-for-me-brands), buying on brand websites
- [Amazon: Rufus](https://www.aboutamazon.com/news/retail/amazon-rufus), renamed Alexa for Shopping
- [Amazon: Alexa for Shopping](https://www.aboutamazon.com/news/retail/alexa-for-shopping-ai-assistant), auto buying and usage in 2025
- [Amazon: robots.txt](https://www.amazon.com/robots.txt), disallowed AI crawlers and agents
- [Shopify Help Center: Agentic storefronts](https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts), channels, default activation and checkout paths

**Protocols and platform APIs**

- [Agentic Commerce Protocol](https://www.agenticcommerce.dev/), maintainers and license
- [OpenAI: Agentic Checkout Spec](https://developers.openai.com/commerce/specs/checkout.md), endpoints, states, headers and webhooks
- [OpenAI: Delegated Payment Spec](https://developers.openai.com/commerce/specs/payment.md), allowance limits and vault tokens
- [OpenAI: Product feed spec](https://developers.openai.com/commerce/specs/file-upload/products.md), required fields, checkout fields and formats
- [Universal Commerce Protocol](https://ucp.dev/), license, participants and transports
- [UCP: Specification overview](https://ucp.dev/latest/specification/overview/), profiles, agent header, capabilities and versions
- [Google: UCP for merchants](https://developers.google.com/merchant/ucp), waitlist and merchant of record
- [Google: Native checkout](https://developers.google.com/merchant/ucp/guides/checkout/native), checkout session endpoints and Google Pay
- [Google: Merchant Center for UCP](https://developers.google.com/merchant/ucp/guides/merchant-center/overview), checkout eligibility and US scope
- [Google: Order lifecycle](https://developers.google.com/merchant/ucp/implementation/2026-04-08/order-lifecycle), signed order webhooks
- [Shopify: Agentic commerce](https://shopify.dev/docs/agents), catalog, cart, checkout and order tools
- [Shopify: Checkout MCP](https://shopify.dev/docs/agents/carts-and-checkout/checkout-mcp), tools, states and continue URL
- [Shopify: Global Catalog](https://shopify.dev/docs/agents/catalog/global-catalog), catalog tools, UPID and inferred fields
- [Shopify: Agent auth and rate limiting](https://shopify.dev/docs/agents/profiles/auth-and-rate-limiting), trust tiers and limits
- [Stripe: Agentic Commerce Suite for retail](https://docs.stripe.com/agentic-commerce/sellers/use-cases/retail.md), catalog sharing and availability
- [Stripe: UCP](https://docs.stripe.com/agentic-commerce/protocols/ucp.md), UCP Tech Council and building blocks
- [Mirakl](https://www.mirakl.com/), Agentic Activation

**Agent identity and access**

- [RFC 9309: Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309.html), rules are not access authorization
- [OpenAI: Overview of crawlers](https://developers.openai.com/api/docs/bots), OAI-SearchBot, GPTBot and ChatGPT-User
- [Perplexity: Crawlers](https://docs.perplexity.ai/guides/bots), PerplexityBot and Perplexity-User
- [Google: User-triggered fetchers](https://developers.google.com/crawling/docs/crawlers-fetchers/google-user-triggered-fetchers), Google-Agent and Web Bot Auth experiments
- [Cloudflare: Web Bot Auth](https://developers.cloudflare.com/bots/reference/bot-verification/web-bot-auth/), signature headers and key directory
- [Cloudflare: Securing agentic commerce (October 2025)](https://blog.cloudflare.com/secure-agentic-commerce/), Visa and Mastercard signature tags
- [Cloudflare: Introducing pay per crawl (July 2025)](https://blog.cloudflare.com/introducing-pay-per-crawl/), HTTP 402 and crawler price headers
- [Visa: Trusted Agent Protocol (October 2025)](https://usa.visa.com/about-visa/newsroom/press-releases.releaseId.21716.html), agent intent, recognition and payment information
- [Visa: Intelligent Commerce (April 2025)](https://usa.visa.com/about-visa/newsroom/press-releases.releaseId.21361.html), commerce signals for disputes
- [Google Cloud: Announcing AP2 (September 2025)](https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol), mandates as an audit trail
