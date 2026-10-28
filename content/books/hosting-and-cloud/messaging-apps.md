+++
title = "WhatsApp & Messaging Apps"
description = "Business messaging over channels an app owner runs: the WhatsApp Business Platform, Apple, Meta and other apps, international sender IDs, resale and fallback."
category = "Hosting & Cloud Industry"
order = 2183
part = "Communications Platforms"
tags = ["whatsapp", "messaging", "templates", "sender-id", "cpaas", "fallback"]
+++

An SMS travels over carriers that are regulated, interconnected and paid per message, and the rules a sender follows are written by the carriers and enforced by filtering. A WhatsApp message travels over one company's network. Meta decides who may send, what a message outside a conversation must look like, what each one costs, how many people a business may reach in a day, and when to block or remove a sender, and it changes those rules on its own schedule. Apple, Telegram, Rakuten Viber, LINE and Kakao run their own versions of the same arrangement. For a CPaaS these channels are a large business on someone else's platform: it onboards its customers into the app owner's accounts, submits their templates to the owner's review, passes the owner's fee through with its own on top, and absorbs the owner's enforcement decisions, which can switch off a customer's channel overnight with no carrier, regulator or court in between.

This chapter covers that business from the platform's side: how WhatsApp's business platform got to its current shape, how its accounts, templates, windows, limits, prices and enforcement work as of October 2026, the other apps in a line each, the alphanumeric sender IDs that international SMS needs, how the CPaaS providers resell WhatsApp, falling back from an app to SMS, and the abuse these channels attract. RCS business messaging rides the carriers rather than an app and is covered in [Business Texting Registration](/books/hosting-and-cloud/texting-registration#rcs-business-messaging); the delivery mechanics shared with SMS (status lifecycle, receipts, error mapping, time-to-live) are [Sending a Text](/books/hosting-and-cloud/sending-a-text). The law of contacting people outside the US is the playbook's [Outside the US](/docs/compliance/consumer-contact#outside-the-us), and the application's consent ledger, templates and outbound gate are [Notifications & Consent](/docs/architecture/notifications#the-consent-ledger).

## How the Providers Do It

Every large CPaaS sells WhatsApp next to SMS, as a partner of Meta's, and the price is Meta's fee plus the provider's. The published shapes, as of October 2026:

| Provider | Price shape | Meta's fee | Notes |
| --- | --- | --- | --- |
| **Twilio** | $0.005 per message, "inbound or outbound" | "Meta's per-template message fee, which Twilio passes through to customers"; its calculator shows utility and authentication starting at $0.0034 a message | $0.001 for a message that ends in a failed state; pricing "current as of September 2026" |
| **Bird** (formerly MessageBird) | A processing fee "on every outbound message, in every category," $0.0050 in the US | "Pay Bird's processing rate plus any Meta fee" | Monthly deposit plans from $0 to $2,500 that become spendable balance |
| **360dialog** | A monthly license per number: €49, €99 or €500 by tier; a partner platform from €250 a month plus a fee per channel | Listed on every plan as "+Meta WhatsApp Messaging Fees"; the partner platform states "zero message markup" | Prices in euros, page stamped October 26, 2026 |
| **Vonage** | A platform fee per message that starts "as low as 0.0001 Euros (0.00016 USD)" and "adjusts per volume and region" | "WhatsApp fees apply on a per message basis for each delivered message. See Meta for pricing details." | WhatsApp calling carries a separate platform fee of $0.004 a minute; page viewed October 28, 2026 |
| **Sinch** | A Sinch fee set by "your agreement with Sinch - platform access, per-message service fees and any inclusions in your plan"; no per-message figure is published | "Meta WhatsApp fees are separate from, and in addition to, the fees Sinch charges you" | Sinch's fee still applies to the 1,000 service messages a month that are free of Meta's fee |
| **Infobip** | "WhatsApp is charged per message. Each type of message template and free-form message has its price." | Not stated separately | Neither its own fee nor Meta's is broken out on the page |

Three models, then: a per-message markup on top of Meta's fee (Twilio, Bird and Vonage publish theirs; Sinch sets its own by contract), a flat license per number with Meta's fee passed through (360dialog), and a bundled per-message price (Infobip). Each has to change when Meta changes its own prices, which it did four times in 2026 alone.

## How It Got Here

WhatsApp's business platform is younger than Twilio's SMS API, and almost every rule in it was introduced by Meta in a dated notice:

| Date | Step | What it solved | What it cost |
| --- | --- | --- | --- |
| August 1, 2018 | WhatsApp launches its Business API: replies to users free "for up to 24 hours," then "a fixed rate by country per message sent after that" | Businesses on the app people already used, with a limit on business-initiated messages | Self-hosted software, run by the business or a partner |
| May 19, 2022 | Meta opens "the new, cloud-based version of the WhatsApp Business Platform" to "any business across the world" | No servers to run; direct access without a hosting partner | Meta now hosts the traffic and owns more of the stack |
| January 9, 2024 | New features ship "exclusively to Cloud API"; the on-premises client gets only fixes | One codebase for Meta | Self-hosters forced to migrate |
| July 1, 2024 | New numbers "can only be registered for use with Cloud API"; Meta starts a recurring process to recategorize approved templates | The end of new on-premises deployments; categories enforced after approval | A template's price can change after the business wrote it |
| November 1, 2024 | Service conversations become free for all businesses | Customer care without a per-conversation fee | Revenue moves to templates |
| July 1, 2025 | Per-message pricing replaces conversation-based pricing; utility messages inside the customer service window become free | A price per delivered template message, by category and market | Every rating pipeline rebuilt |
| October 23, 2025 | "The final supported version of the On-Premise API client expired"; messages to and from numbers still on it stop being delivered | One platform | The last self-hosted senders go dark |
| October 1, 2026 | Meta resumes charging for service messages above a free tier and for utility messages sent inside the window | Revenue on customer care at scale | Free traffic becomes billable again, mid-contract for many resellers |

Two things follow for a platform. First, on-premises hosting is gone, so a CPaaS no longer runs WhatsApp software; it is an API client of Meta with a commercial role in between. Second, the price list is a dated table in the same way the US carriers' fees are ([Pass-Through Fees and the Margin](/books/hosting-and-cloud/cpaas-business#pass-through-fees-and-the-margin)), except that one company changes it for every market at once.

## The WhatsApp Business Platform

### Who Sits Between the Business and Meta

A business can use the Cloud API directly, but most reach it through a partner, and Meta defines the partner roles by who carries the money:

| Role | What Meta's docs say | Who pays Meta | What the partner can do |
| --- | --- | --- | --- |
| **Solution Partner** | Provides "a full range of WhatsApp Business Platform services to other businesses (clients)" | The partner, which has "credit lines which can be extended to clients" and can "directly invoice their clients" | Embedded Signup and creating a WhatsApp Business Account for a client |
| **Tech Provider** | Offers the same services, alone or with a Solution Partner | The client: "Tech Providers do not have credit lines," so clients add their own payment method and Meta bills them | Embedded Signup, but not creating an account for the client |
| **Tech Partner** | A Tech Provider that is, or could be, a Meta Business Partner | The client | As a Tech Provider, plus Meta's partner programs |

The roles still go by the older name Business Solution Provider (BSP) in much of the industry. The role decides the platform's billing design: a Solution Partner rates Meta's fee and invoices it, carrying the credit risk of every client it onboards, while a Tech Provider never sees Meta's fee on its own invoice and bills only its own markup or license.

### Portfolios, Accounts and Numbers

Meta's objects nest three deep, and each level carries its own state:

1. **The business portfolio** is the business itself. Business verification happens here, and the messaging limit is set here: "Messaging limits are calculated and set at the business portfolio level," shared by every number under it.
2. **The WhatsApp Business Account** (WABA, a "Messaging account" in Meta's newer docs) holds templates and phone numbers.
3. **The business phone number** is the sender. It must be owned by the business, have "a country and area code (short codes are not supported)," and be able to receive a voice call or SMS, because it is verified with a code sent by SMS or voice. Registering one requires a display name, which goes through review (statuses such as `PENDING_REVIEW` and `AVAILABLE_WITHOUT_REVIEW`). A new portfolio may register two numbers; Meta raises the cap to 20 once the business is verified or reaches a 2,000 messaging limit. An Official Business Account shows "a blue checkmark beside their name."

Each number also has a quality rating (the API returns values such as `GREEN`), derived from how recipients react, and a throughput level. The send call is `POST /<WHATSAPP_BUSINESS_PHONE_NUMBER_ID>/messages`.

### The Customer Service Window

The rule at the center of the platform: when a user messages or calls the business, "a 24-hour timer called a customer service window starts," and "if the user messages or calls you again before the timer expires, the timer resets to 24 hours." While it is open the business may send any message type, free-form text included. "When the window closes, you can only send pre-approved template messages." A user who messages from an ad that clicks to WhatsApp, on the Android or iOS app, opens a customer service window; the business's first reply inside it is free and opens a free entry point window, which "may remain open for up to 7 days" from that reply and in which Meta doesn't charge for marketing, utility, authentication or service messages (Meta Business Agent messages are still charged). Meta's page names only click-to-WhatsApp ads as the entry point; some resellers' help pages, Sinch's among them as of October 2026, still describe a 72-hour window that a Facebook Page call-to-action button also opens, so the platform should rate from Meta's documentation.

For the platform this is a gate, not a guideline: a free-form send outside a window fails at Meta, so the sender should check the window before sending and either fail fast or require a template. The window is per business number and user, and an inbound message on any route to the customer's webhook has to update it.

### Templates and Their Categories

A template is a message the business registers in advance with placeholders, reviewed by Meta, and the only thing it may send outside a window. "Each template must be categorized as authentication, marketing, or utility":

| Category | Meta's definition | Typical use |
| --- | --- | --- |
| **Marketing** | Goals "from generating awareness to driving sales" | Offers, announcements, re-engagement |
| **Utility** | Follow-ups "on user actions or requests," typically "triggered by user actions" | Order and delivery updates, appointment reminders, account alerts |
| **Authentication** | Verifying "a user's identity" | One-time passcodes |
| **Service** (not a template) | Free-form messages inside an open window | Customer care replies |

Review is automatic "upon creation or after editing" and "can take up to 24 hours." Only an `APPROVED` template can be sent; a template can later become `PAUSED` ("due to recurring negative feedback from customers, or low read-rates") or `DISABLED`. An account in an unverified portfolio may hold 250 templates; a verified portfolio with an approved display name may hold up to 6,000, created at no more than 100 an hour.

Approval isn't final. Since July 1, 2024 Meta recategorizes approved templates, and since April 9, 2025 a utility template that Meta decides is marketing "is approved as `MARKETING`" and keeps working at the marketing price, with one day's notice (none for businesses already warned for misuse) and 60 days to appeal. A template that should have been authentication is rejected on the first day of the following month, with no review. A template's category is therefore a fact with history: the price of a message is the category in force when it was delivered, not the category the customer asked for.

### Quality, Messaging Limits and Throughput

Two limits apply, and they measure different things:

| Limit | Unit | Levels | How it changes |
| --- | --- | --- | --- |
| **Messaging limit** | Unique users reached outside customer service windows in a rolling 24 hours, per portfolio | 250, 2,000, 10,000, 100,000, unlimited | To 2,000 by verifying the business, or by sending 2,000 delivered messages to unique users in 30 days with high-quality templates; above that, one level up within 6 hours when quality is high and the portfolio used half its limit in the last 7 days |
| **Throughput** | Messages per second, per number | 80 by default, 1,000 | Automatic upgrade at no cost for a number in an unlimited portfolio that reaches 100,000 unique users outside windows in 24 hours with quality YELLOW or higher |

There is also a pair rate limit on sending too many messages to the same user. Because the messaging limit is per portfolio, one busy number can exhaust it for all of the business's numbers, and an ISV that puts several of its customers under one portfolio shares one limit and one quality history across them. That is the same problem as one 10DLC brand for many tenants ([Multi-Tenant Senders](/docs/architecture/notifications#multi-tenant-senders)), and the answer is the same: a portfolio per customer business, onboarded through Embedded Signup.

The platform's sender enforces both limits the way it enforces carrier throughput ([Throughput](/books/hosting-and-cloud/sending-a-text#throughput)): per-second buckets per number, and a rolling count of unique recipients per portfolio, queueing rather than sending into a rejection.

### Per-Message Pricing

Since July 1, 2025 "Meta charges on a per-message basis," only for messages from businesses to users, and "businesses are only charged when a message is delivered." The price depends on the template's category and the recipient's market, from Meta's rate cards. As of October 2026:

- **Marketing, utility and authentication templates** are charged per delivered message. Utility and authentication have volume tiers by market, counted across the portfolio, counting "only messages that are charged," reset monthly.
- **Service messages** are free up to "1,000 delivered service messages per month" per business number and charged beyond that from October 1, 2026, except for eligible governments and non-profits (free through December 31, 2027).
- **Utility messages inside an open window** were free from July 1, 2025 and are charged again from October 1, 2026.
- **Authentication-international** rates apply when a business based in another country sends authentication messages to users in listed markets (Indonesia from June 1, 2024, India from July 1, 2024, seven more from February 1, 2025, nine more from October 1, 2026), once it sends more than 750,000 qualifying messages in 30 days.
- **Rates change by notice.** Meta changed rates in many markets on January 1, April 1, July 1 and October 1, 2026, and launched local billing currencies along the way.

Rating a WhatsApp message therefore needs facts a segment count doesn't: the category in force at delivery, the recipient's market, the business's country, whether a window or free entry point was open, the free-tier count for that number this month, and the portfolio's tier position. The rating mechanics belong to [Metering & Rating](/books/hosting-and-cloud/metering-and-rating); the point here is that the usage event must carry those facts frozen at delivery.

### Opt-In and Policy Enforcement

Meta's Business Messaging Policy (last updated September 23, 2026) requires that people "have given you their mobile phone number or username" and that "you have received opt-in permission from the recipient," confirming "that they wish to receive subsequent messages or calls from you." The business is "solely responsible for determining the method of opt-in," and must "respect all requests (either on or off WhatsApp) by a person to block, discontinue, or otherwise opt out." The policy lists prohibited goods and services (firearms, alcohol and tobacco, drugs, medical and healthcare products, adult products, dating, multi-level marketing, real-money gambling), with limited exceptions for some regulated verticals in some countries, and businesses selling through catalogs must follow Meta's Commerce Policy.

Enforcement is a ladder Meta runs on the business account:

| Step | Effect |
| --- | --- |
| **Warning** | Names the policy violated |
| **Short template block** | 1 or 3 days without marketing, utility and authentication templates or new numbers |
| **Full block** | 5, 7 or 30 days without sending any messages or adding numbers |
| **Account lock** | Indefinite, removed only on appeal |
| **Disablement** | Permanently removed from the platform; Meta "may prohibit you and your organization from all future use of WhatsApp products and services" |

Severe harm (child exploitation, scams, terrorism, illegal drug sales) can lead to immediate offboarding. Appeals go through Business Support Home and "typically take 24 to 48 hours," and not every spam violation can be appealed. For a platform, every step is an event it receives rather than a decision it makes, and its own abuse desk should treat it as one: a Meta block on a customer is evidence, and a pattern of them across a platform's portfolios puts the platform's own partner standing at risk.

## The Other Apps

The other business messaging channels follow the same shape (an owner, a registration, a rule about who speaks first, a price) with different details. In a line each, as of October 2026:

| Channel | Who may start | Access | Limits and price | Source |
| --- | --- | --- | --- | --- |
| **Apple Messages for Business** | The customer: "Your business may only send a message in response to an active conversation"; marketing needs the customer to have sent "subscribe" | Through "an Apple-approved Messaging Service Provider (MSP)"; Apple doesn't currently onboard businesses that mainly offer medical or health services | Apple charges nothing; cost depends on the MSP | Apple's Messages for Business documentation and policies, v3.1, July 21, 2026 |
| **Facebook Messenger** | Inside a standard messaging window that "for most user actions" lasts 24 hours (up to 7 days after a click-to-Messenger ad); message tags for personally relevant updates outside it; a Human Agent tag for replies within 7 days | Send API: `POST /<PAGE_ID>/messages` on the Graph API | Not captured | Meta Messenger Platform docs |
| **Instagram** | The same 24-hour window, with the 7-day Human Agent tag | Instagram professional accounts: `POST /<IG_ID>/messages` on graph.instagram.com | Not captured | Meta Instagram Platform docs |
| **Telegram bots** | The user: "Bots can't start conversations with users" | Bot API | About 30 messages a second for bulk sends; paid broadcasts up to 1,000 a second at 0.1 Stars per message above the free rate, for bots with 100,000 Stars and 100,000 monthly active users | Telegram Bots FAQ |
| **Viber Business Messages** | The business, for promotional, transactional and one-time-passcode messages, plus customer-initiated chats | Through messaging partners (Viber lists 126) | Through the partner | Rakuten Viber for Business |
| **LINE Official Account** | Either: reply messages to a user who wrote or added the account, push messages at any time | Messaging API | Push, multicast, broadcast and narrowcast count against a monthly quota by plan; replies don't; over quota the API refuses | LINE Developers |
| **Kakao AlimTalk** | The business, for informational messages only, including to users who haven't added the channel | Only through official dealers under partner contract with Kakao | Only templates approved by Kakao's review | Kakao Business guide |
| **Google Business Messages** | Shut down | None | Chat features in Business Profile ended July 31, 2024, after customers were notified on July 15; records downloadable until August 30, 2024 | Google Business Profile Help |

Google's shutdown is the risk of the whole category in one line: a channel whose owner withdraws it takes every integration with it, on the owner's timeline. Treat each app as a product with its own end-of-life clock ([Migrations, Shutdowns & End of Life](/books/hosting-and-cloud/migrations-and-end-of-life)).

## International Sender IDs

Outside the US, many countries' SMS isn't sent from a phone number at all but from an alphanumeric sender ID: "your company name or brand displayed as the sender ID for one-way text messaging," at most 11 characters of letters, digits and spaces (Twilio), and "recipients cannot reply" (Infobip). Like the 10DLC regime, registration is a carrier and regulator requirement the platform collects and submits, but it is country by country, and the CPaaS country guides are the working references. As Twilio's guides describe them, as of October 2026:

| Country | Alphanumeric sender ID | Requirement | Provisioning |
| --- | --- | --- | --- |
| **United States** | "Not Supported" | Long codes need 10DLC registration, toll-free needs verification ([Business Texting Registration](/books/hosting-and-cloud/texting-registration)) | Short codes 6 to 10 weeks |
| **United Kingdom** | Supported, including dynamic sender IDs | Operator pre-registration "Not Required"; Twilio registers only Protected Sender IDs | Not captured |
| **India** | "Pre-registration required" | Company and sender ID registration in the operators' DLT portal, under TRAI's rules: a registered principal entity, registered headers, content templates and consent templates, each message carrying the entity ID, header and content ID; operators prefix the header (Twilio's example: "VM-TWILIO") | 10 business days |
| **Saudi Arabia** | Required; long and short codes not supported | Registered sender IDs only; promotional senders "must affix -AD" | 2 weeks |
| **United Arab Emirates** | "Only supported through pre-registration" | Promotional sender IDs carry an "AD-" prefix that "counts towards the 11-character limit"; no promotional messages from 9 pm to 7 am local time | 2 weeks |
| **Turkey** | Required | "Starting on November 18th, 2026, messages with unregistered Sender IDs to Turkish networks will be blocked"; promotional traffic prohibited since February 15, 2021 | 2 weeks |
| **Indonesia** | Pre-registration required for international and domestic senders | Operators deprovision senders that send fewer than 1,000 messages per 3 months per network | About 3 to 4 weeks |

Three platform rules follow. A sender ID is a registered identity with a lifecycle (submitted, approved, rejected, deprovisioned for inactivity), held per country and traffic type, not a free-text field on the send call. The prefix and length rules mean the platform validates the name per country before submission. And the registration is tied to the content: India's DLT checks each message against a registered template, so the template table this chapter builds for WhatsApp serves Indian SMS too.

## Reselling WhatsApp

A CPaaS's WhatsApp revenue has the same structure as its US SMS revenue: a fee of its own on top of a fee it collects for someone else ([How the Money Is Made](/books/hosting-and-cloud/cpaas-business#how-the-money-is-made)). The differences are in who bills whom and when:

- **Billing role.** As a Solution Partner, the platform is invoiced by Meta and invoices its customers, so it rates Meta's fee as a pass-through line and carries the credit risk. As a Tech Provider, Meta bills the customer directly, and rating Meta's fee as well would double-bill.
- **Charged on delivery.** Meta charges delivered messages; Twilio's own fee applies "inbound or outbound," and Bird's "when the message is processed." The platform's fee and Meta's fee for the same message can therefore be earned at different moments, and an undelivered template can cost the platform's fee without Meta's.
- **Free tiers belong to the number.** The 1,000 free service messages are per business number per month, so the platform has to count them per number to rate correctly, and has to say on the invoice which messages were free.
- **Price changes are Meta's.** A markup model passes each change through automatically; a license model (360dialog) keeps the platform's revenue stable while the customer's total moves; a bundled per-message price has to be repriced at every notice, the same trap as folding US carrier fees into a per-segment price.

My default is the markup model with Meta's fee as a separate pass-through line, for the reason the CPaaS chapter gives for carrier fees: the owner's fee changed four times in 2026, and only a separated line survives that without repricing.

## Fallback to SMS

The common design is to try an app first and fall back to SMS when the app message isn't delivered: WhatsApp where the recipient has it, SMS everywhere else. It is cheaper and richer when it works, and it has three costs that a platform has to expose rather than hide:

- **Consent is per channel.** WhatsApp's policy requires opt-in to messages from the business on WhatsApp; US texting consent is governed by the TCPA and the carriers' rules ([TCPA Consent](/docs/compliance/consumer-contact#tcpa-consent)); and a STOP on SMS or a block on WhatsApp doesn't revoke the other automatically, though a request "off WhatsApp" must be honored on it. A fallback may only go to a channel the recipient has consented to, and the consent ledger has to record channels separately ([The Consent Ledger](/docs/architecture/notifications#the-consent-ledger)).
- **Registration is still required.** The SMS fallback needs its own 10DLC campaign, toll-free verification or sender ID; an app channel doesn't excuse it.
- **Double delivery and double cost.** Delivery receipts are asynchronous, so a fallback triggered by a timeout can deliver both copies: two charges and, for a passcode, two codes. The trigger should be a definite failure from the app (not registered on WhatsApp, template rejected, window closed) or a time-to-live chosen per message type, and the two messages must be linked so the customer is billed and shown one logical send.

My default is fallback as an explicit, per-message policy the customer sets (channels in order, a timeout per step, and a consent check per channel at each step), with every attempt recorded as its own message linked to the first. I'd never fall back silently for marketing, because the consent for the second channel is the part most likely to be missing.

## Fraud and Abuse on These Channels

The abuse patterns of SMS reappear with the app owner as judge:

- **Template abuse.** Marketing sent through utility templates to pay the utility price is the abuse Meta's recategorization targets; repeat offenders lose the day's notice and then face restrictions. The platform's own check is cheap: compare a customer's templates against their category before submission, because a rejection or a block lands on the customer's account and the pattern lands on the partner.
- **Account bans.** Meta's enforcement ladder ends in disabling the account and possibly barring the organization from WhatsApp. A disabled customer's numbers stop working with no carrier to route around, which is why fallback and a second channel matter for anything critical, such as passcodes.
- **Credit exposure.** A Solution Partner's credit line extends to its clients, so a fraudster who sends a burst of templates on a new account and never pays leaves the partner owing Meta. The controls are the ones for cloud free-tier fraud ([Free-Tier Fraud & Stolen Keys](/books/hosting-and-cloud/free-tier-fraud-and-stolen-keys)): prepaid balances or limits for new accounts, and spend alerts per account.
- **Passcode traffic.** Authentication templates are priced per market, with authentication-international rates for cross-border senders at volume; traffic to unexpected markets is the same signal as SMS pumping ([SMS Pumping](/books/hosting-and-cloud/telecom-fraud#sms-pumping)), and country allowlists apply to app channels as well as SMS.
- **Sender ID impersonation.** An alphanumeric sender ID is a brand name anyone could type, which is why the UK has Protected Sender IDs and most other countries require registration. The platform checks a requested sender ID against the customer's verified brand, the same rule as text-enabling only numbers the customer controls.

## The Alternatives

A business that needs to reach people outside the US has these channels, and a platform usually offers all of them:

| Channel | Who owns the rules | Who speaks first | Cost shape | Strengths | Failure modes | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **SMS with a sender ID** | Carriers and regulators, per country | Either (one-way for alphanumeric) | Per segment, by country | Reaches every phone; no app needed | Country-by-country registration; no replies to alphanumeric IDs; pumping | Passcodes and alerts everywhere |
| **WhatsApp** | Meta | Customer free-form inside the window; business by template | Per delivered template by category and market, plus the reseller's fee | Reach where WhatsApp is the default app; rich content; replies | Policy enforcement; template review and recategorization; price changes by notice | Customer care, notifications and marketing in WhatsApp-heavy markets |
| **Apple Messages for Business** | Apple | Customer only | Free from Apple; MSP's price | Native on Apple devices; rich interactions | No business-initiated messages; MSP required | Customer care entry points on web and maps |
| **Messenger and Instagram** | Meta | Customer, then 24 hours (7 with human agent) | Not captured | Where social customers already are | Narrow window; tags restricted to non-promotional updates | Social customer care |
| **Telegram, Viber, LINE, Kakao** | Each app | Varies: Telegram only after the user; Kakao AlimTalk business-initiated informational | Stars for paid broadcasts (Telegram), quota plans (LINE), partner pricing (Viber, Kakao) | Dominant in specific markets | Each a separate integration and policy | Market-specific programs |
| **RCS** | Carriers and Google | Business, after agent launch | Per message by category | Default messaging app, SMS fallback | Uneven reach | Rich messages over carrier networks ([Business Texting Registration](/books/hosting-and-cloud/texting-registration#rcs-business-messaging)) |

## My Default

My default for a platform is to treat every app channel as a sender identity like a 10DLC brand: registered, reviewed, rated and suspendable, with one table of templates across WhatsApp, Kakao and Indian DLT, one customer-service-window gate, and the owner's fee as a dated pass-through line. For a customer, I'd use WhatsApp where it is the default messaging app and SMS with a registered sender ID everywhere else, with fallback only to channels the recipient consented to, and I'd never make an app channel the only path for passcodes or anything else that can't wait out an appeal.

What would change it: a market where one app is effectively universal and SMS delivery is poor makes the app the primary channel, with SMS as the backstop rather than the other way around; even then I'd keep the SMS registration live, because an app owner can block a sender faster than a carrier can.

## How to Build It

The chapter adds messaging-app accounts, templates, service windows, owner enforcement and international sender ID registrations to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Every app identity is a `resources` row of kind `sender_identity` with a `sender_identities` side row; the core's `channel` CHECK already lists `meta_business_portfolio`, `whatsapp_business_account`, `whatsapp_number`, `apple_messages_account`, `messenger_page`, `instagram_account`, `telegram_bot`, `viber_account`, `line_channel`, `kakao_channel` and `alphanumeric_sender`, and `resources.parent_id` nests a number under its business account and the account under its portfolio. The owner's fee is a SKU with the core's `pass_through = 'channel_owner'`. [Sending a Text](/books/hosting-and-cloud/sending-a-text#how-to-build-it)'s `messages` table carries every channel, and its `throughput_limits` holds WhatsApp's per-number throughput (unit `messages`) and the portfolio's messaging limit (scope `sender_identity`, unit `unique_recipients`, per `'24 hours'`). Business verification, display name review and sender ID registration are submissions to an external reviewer, so they are [Business Texting Registration](/books/hosting-and-cloud/texting-registration#how-to-build-it)'s `registration_reviews` rows.

```sql
CREATE TABLE messaging_app_accounts (    -- side table for app sender identities
  resource_id         UUID PRIMARY KEY REFERENCES resources (id),
  owner               TEXT NOT NULL CHECK (owner IN ('meta', 'apple', 'telegram', 'rakuten_viber',
                        'line', 'kakao')),
  owner_object_id     TEXT NOT NULL,     -- the owner's id: portfolio, WABA, phone number id,
                                         -- page, bot
  partner_role        TEXT CHECK (partner_role IN ('solution_partner', 'tech_provider',
                        'messaging_service_provider', 'official_dealer', 'direct')),
  owner_billed_party  TEXT NOT NULL CHECK (owner_billed_party IN ('platform', 'customer',
                        'none')),        -- 'customer': never rate the owner's fee
  display_name        TEXT,
  display_name_status TEXT,              -- the owner's vocabulary, e.g. 'PENDING_REVIEW'
  quality_rating      TEXT CHECK (quality_rating IN ('green', 'yellow', 'red', 'unknown')),
  business_country    CHAR(2),           -- for cross-border rates
  UNIQUE (owner, owner_object_id)
);

CREATE TABLE message_templates (         -- WhatsApp templates, Kakao AlimTalk, India DLT content
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  sender_identity_id  UUID NOT NULL REFERENCES resources (id),  -- WABA, Kakao channel,
                                                                -- DLT entity
  channel             TEXT NOT NULL CHECK (channel IN ('whatsapp', 'kakao', 'sms')),
  name                TEXT NOT NULL,
  language            TEXT NOT NULL,     -- BCP 47
  requested_category  TEXT NOT NULL,     -- what the customer asked for
  category            TEXT CHECK (category IN ('marketing', 'utility', 'authentication',
                        'informational', 'registered_content')),  -- in force now
  status              TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'approved',
                        'rejected', 'paused', 'disabled')),
  owner_template_id   TEXT,              -- the owner's or registry's id, once submitted
  body                JSONB NOT NULL,    -- components and placeholders, as submitted
  UNIQUE (sender_identity_id, name, language)
);

CREATE TABLE template_status_events (    -- append-only: every review, recategorization, pause
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  template_id         UUID NOT NULL REFERENCES message_templates (id),
  cause               TEXT NOT NULL CHECK (cause IN ('submitted', 'review', 'recategorization',
                        'quality', 'appeal', 'customer_edit')),
  from_status         TEXT,
  to_status           TEXT NOT NULL,
  from_category       TEXT,
  to_category         TEXT,
  owner_notice_ref    TEXT,              -- the webhook or notice it came from
  appeal_until        TIMESTAMPTZ,       -- e.g. 60 days after a recategorization
  occurred_at         TIMESTAMPTZ NOT NULL
);

CREATE TABLE service_windows (           -- when free-form sends are allowed, and what's free
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  sender_identity_id  UUID NOT NULL REFERENCES resources (id),  -- the number, page or account
  peer_ref            TEXT NOT NULL,     -- E.164, or the app's user id (PSID, IGSID)
  kind                TEXT NOT NULL CHECK (kind IN ('customer_service', 'free_entry_point',
                        'human_agent')),
  opened_by_message_id UUID REFERENCES messages (id),  -- the inbound message or ad referral
  open_during         TSTZRANGE NOT NULL -- [received, received + 24 hours) for WhatsApp
);
CREATE INDEX service_windows_lookup
  ON service_windows USING GIST (sender_identity_id, peer_ref, open_during);

CREATE TABLE channel_enforcements (      -- the owner's decisions against a sender
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  sender_identity_id  UUID NOT NULL REFERENCES resources (id),
  owner               TEXT NOT NULL,     -- 'meta', 'apple', 'kakao', or a carrier for sender IDs
  kind                TEXT NOT NULL CHECK (kind IN ('warning', 'template_block', 'full_block',
                        'account_lock', 'disabled', 'deprovisioned')),
  policy_ref          TEXT,              -- the policy the owner named
  owner_notice_ref    TEXT NOT NULL,
  valid_during        TSTZRANGE NOT NULL, -- open-ended for a lock or disablement
  appeal_status       TEXT CHECK (appeal_status IN ('none', 'requested', 'unchanged',
                        'reversed')),
  case_id             UUID REFERENCES moderation_cases (id),  -- the platform's own review
  account_hold_id     UUID REFERENCES account_holds (id)      -- when the platform acts too
);

CREATE TABLE sender_id_registrations (   -- side table: sender_identities.channel = 'alphanumeric_sender'
  resource_id         UUID PRIMARY KEY REFERENCES resources (id),
  country             CHAR(2) NOT NULL,
  sender_id           TEXT NOT NULL CHECK (char_length(sender_id) BETWEEN 1 AND 11),
  traffic_type        TEXT NOT NULL CHECK (traffic_type IN ('transactional', 'promotional',
                        'otp')),
  displayed_as        TEXT,              -- with the operator's or regulator's prefix:
                                         -- 'AD-...', '...-AD', 'VM-...'
  registry_ref        TEXT,              -- e.g. the DLT entity and header ids
  brand_id            UUID REFERENCES resources (id),  -- the verified brand it may name
  min_activity_note   TEXT,              -- deprovisioning rule, e.g. Indonesia's per network
  UNIQUE (country, sender_id, traffic_type)
);

ALTER TABLE messages
  ALTER COLUMN peer_e164 DROP NOT NULL,
  ADD COLUMN peer_ref TEXT,                    -- app user id when there is no number
  ADD COLUMN sender_identity_id UUID REFERENCES resources (id),  -- WhatsApp number, page,
                                                                 -- sender ID
  ADD COLUMN template_id UUID REFERENCES message_templates (id),
  ADD COLUMN pricing_category TEXT,            -- the category in force at delivery
  ADD COLUMN window_id UUID REFERENCES service_windows (id),     -- the window it was sent in
  ADD COLUMN fallback_of_id UUID REFERENCES messages (id),       -- the attempt it replaces
  ADD CONSTRAINT messages_peer_check CHECK (num_nonnulls(peer_e164, peer_ref) >= 1);
```

The send path for an app channel, in order: resolve the sender identity and refuse if a `channel_enforcements` row blocks it now; for a free-form message, find a `service_windows` row containing now for the sender and peer, else fail with a stable "window closed, template required" code; for a template, require `status = 'approved'`; check the recipient's consent for this channel in the customer's ledger; take tokens from the number's per-second bucket and count the recipient against the portfolio's unique-recipient limit; send; and on the delivered receipt, emit the usage event with the category in force, the market and the window, which rates the platform's SKU and, when `owner_billed_party = 'platform'`, the owner's pass-through SKU.

Notes on the sketch:

- **Owner states are mirrored, never inferred.** Template status, display name status, quality rating and enforcement arrive by webhook or API; the tables store the owner's value with the notice it came from, and the platform's own decisions live in `account_holds` and `moderation_cases`, so "Meta blocked them" and "we suspended them" never blur.
- **A template's category has history.** `template_status_events` records every change, and each message stores the category used to rate it, so a customer disputing a marketing charge on a template they wrote as utility can be shown the recategorization notice and its date.
- **One template table, three regimes.** WhatsApp templates, Kakao AlimTalk templates and India's DLT content templates are all pre-registered text with placeholders and an external approval, so they share the table and the review trail.
- **Windows are rows.** An inbound message inserts a window rather than updating a timestamp, so the question "was this free-form send allowed, and was it free?" is a lookup against the window in force at the time.
- **Fallback is linked attempts.** Each channel attempt is its own `messages` row with `fallback_of_id`, so receipts, consent checks and billing stay per attempt while the customer sees one logical send.
- **Events:** `template.approved`, `template.rejected`, `template.recategorized`, `template.paused`, `service_window.opened`, `channel_enforcement.received`, `sender_id.approved` and `sender_id.deprovisioned` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to the sender, billing, the abuse desk and the customer's webhooks.

## Auditing

- **Every template's submissions, approvals, recategorizations and pauses,** with the owner's notice and the appeal deadline, kept as long as invoices that rated against them can be disputed.
- **The category, market, window and free-tier position each message was rated with,** frozen at delivery, so a re-rating months later after an owner's price change uses the facts of the moment.
- **Every enforcement action an owner took against a sender,** with the platform's own review and any hold it placed.
- **Every sender ID registration** with the country, traffic type, registry references and the brand it was checked against.
- **Every fallback chain,** with the consent check made for each channel at each step.

## What This Means for the System You Build

- **Model each app identity as a sender identity resource,** nested portfolio, account and number, with the owner's ids and states mirrored from its webhooks.
- **Gate free-form sends on a recorded customer service window** and fail fast with a stable code when it's closed.
- **Keep templates in one table across WhatsApp, Kakao and DLT,** with every review and recategorization appended, and rate each message on the category in force at delivery.
- **Enforce both WhatsApp limits:** per-number messages per second and per-portfolio unique recipients per 24 hours, queueing rather than sending into a rejection.
- **Carry the owner's fee as a dated pass-through line,** and rate it only when the platform, not the customer, is the party the owner bills.
- **Treat alphanumeric sender IDs as registered identities** per country and traffic type, validated against the country's prefix and length rules and the customer's verified brand.
- **Fall back only by explicit policy,** to consented channels, with linked attempts and timeouts chosen per message type.
- **Never make an app channel the only path** for passcodes or other messages that can't wait out an owner's appeal.

## References

**Platform documentation**

- [Meta: Pricing on the WhatsApp Business Platform](https://developers.facebook.com/docs/whatsapp/pricing), per-message pricing from July 1, 2025, charging on delivery, categories, free tier, the free entry point window of up to 7 days, October 1, 2026 changes, volume tiers and the 2026 rate updates
- [Meta: Conversation-based pricing](https://developers.facebook.com/docs/whatsapp/pricing/conversationpricing), deprecated and replaced on July 1, 2025; service conversations free from November 1, 2024
- [Meta: Authentication-international rates](https://developers.facebook.com/docs/whatsapp/pricing/authentication-international-rates), cross-border eligibility, the 750,000-message threshold and market launch dates
- [Meta: On-Premises API sunset](https://developers.facebook.com/docs/whatsapp/on-premises/sunset), January 9, 2024, July 1, 2024 and October 23, 2025
- [Meta: Send messages](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages), the customer service window and the send endpoint
- [Meta: Business phone numbers](https://developers.facebook.com/docs/whatsapp/cloud-api/phone-numbers), eligibility, verification codes, display name statuses, number caps and Official Business Accounts
- [Meta: Messaging limits](https://developers.facebook.com/docs/whatsapp/messaging-limits), portfolio-level limits, tiers and scaling paths
- [Meta: Throughput](https://developers.facebook.com/docs/whatsapp/throughput), 80 and 1,000 messages per second and the pair rate limit
- [Meta: Templates overview](https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/overview), categories, review, statuses and template limits
- [Meta: Template categorization](https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/template-categorization), recategorization since July 1, 2024 and April 9, 2025, notice and appeal
- [Meta: Policy enforcement](https://developers.facebook.com/docs/whatsapp/overview/policy-enforcement), the enforcement ladder and appeals
- [Meta: Solution providers](https://developers.facebook.com/docs/whatsapp/solution-providers), Solution Partners, Tech Providers and Tech Partners
- [Meta: Messenger Platform send messages](https://developers.facebook.com/docs/messenger-platform/send-messages/), the Send API, the standard messaging window, message tags and the Human Agent tag
- [Meta: Instagram Messaging API](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/messaging-api), professional accounts, the 24-hour window and the Human Agent tag
- [Apple: Messages for Business documentation](https://register.apple.com/resources/messages/messaging-documentation), Messaging Service Providers
- [Apple: Messages for Business FAQ](https://register.apple.com/resources/messages/messaging-documentation/faq), customer-initiated conversations and cost
- [Apple: Messages for Business policies](https://register.apple.com/resources/messages/messaging-documentation/policies), replies only in active conversations, subscribe for marketing, excluded health businesses
- [Telegram: Bots](https://core.telegram.org/bots), bots can't start conversations
- [Telegram: Bots FAQ](https://core.telegram.org/bots/faq), broadcast limits and paid broadcasts
- [Rakuten Viber: Business Messages](https://www.forbusiness.viber.com/en/business-messages/), message types
- [Rakuten Viber: Messaging partners](https://www.forbusiness.viber.com/en/messaging-partners/), the partner list
- [LINE Developers: Sending messages](https://developers.line.biz/en/docs/messaging-api/sending-messages/), reply and push messages
- [LINE Developers: Messaging API pricing](https://developers.line.biz/en/docs/messaging-api/pricing/), counted message types and plan quotas
- [Kakao Business: AlimTalk](https://kakaobusiness.gitbook.io/main/ad/infotalk), informational messages, official dealers and template review
- [Google Business Profile Help: Changes to chat and call history](https://support.google.com/business/answer/14919056?hl=en), the July 31, 2024 shutdown and the July 15 notice

**Policy and regulation**

- [WhatsApp Business Messaging Policy](https://whatsappbusiness.com/policy/), opt-in, opt-out, prohibited goods and enforcement, last updated September 23, 2026
- [TRAI: Advice to senders](https://trai.gov.in/advice-to-senders), principal entities, headers, content and consent templates

**Provider documentation**

- [Twilio: WhatsApp pricing](https://www.twilio.com/en-us/whatsapp/pricing), $0.005 per message, Meta's fee passed through, the failed message fee
- [Bird: WhatsApp pricing](https://bird.com/pricing/whatsapp), the processing fee on outbound messages and deposit plans
- [360dialog: Pricing](https://www.360dialog.com/pricing), licenses per number and Meta's fees on every plan
- [Infobip: WhatsApp Business pricing](https://www.infobip.com/whatsapp-business/pricing), per-message prices by template type
- [Vonage: WhatsApp API pricing](https://www.vonage.com/communications-apis/messages/features/whatsapp/pricing/), the per-message platform fee from 0.0001 euros over Meta's fee, the calling fee
- [Sinch Engage: How WhatsApp pricing works](https://support.app.sinch.com/hc/en-us/articles/17443227354895-How-WhatsApp-pricing-works), Meta's and Sinch's fees as separate layers, Sinch's fee set by agreement, the 72-hour entry point window it describes
- [Twilio: What is an alphanumeric sender ID](https://www.twilio.com/docs/glossary/what-alphanumeric-sender-id), one-way brand senders and the 11-character limit
- [Infobip: Alphanumeric senders](https://www.infobip.com/docs/resources-and-numbers/alphanumeric-senders), no replies and approval in most countries
- [Twilio: SMS guidelines for the United States](https://www.twilio.com/en-us/guidelines/us/sms), alphanumeric not supported
- [Twilio: SMS guidelines for the United Kingdom](https://www.twilio.com/en-us/guidelines/gb/sms), no operator pre-registration, Protected Sender IDs
- [Twilio: SMS guidelines for India](https://www.twilio.com/en-us/guidelines/in/sms), DLT registration and operator prefixes
- [Twilio: SMS guidelines for Saudi Arabia](https://www.twilio.com/en-us/guidelines/sa/sms), registered sender IDs and the -AD suffix
- [Twilio: SMS guidelines for the United Arab Emirates](https://www.twilio.com/en-us/guidelines/ae/sms), pre-registration, the AD- prefix and quiet hours
- [Twilio: SMS guidelines for Turkey](https://www.twilio.com/en-us/guidelines/tr/sms), registration, the November 18, 2026 block and the promotional ban
- [Twilio: SMS guidelines for Indonesia](https://www.twilio.com/en-us/guidelines/id/sms), pre-registration and deprovisioning for inactivity

**In practice**

- [TechCrunch: WhatsApp launches its Business API (2018)](https://techcrunch.com/2018/08/01/whatsapp-business-api/), August 1, 2018, free replies for 24 hours and per-message charges after
- [Meta for Developers: Conversations 2022 recap](https://developers.facebook.com/blog/post/2022/05/19/conversations-2022-recap/), the Cloud API opened to any business on May 19, 2022
