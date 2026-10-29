+++
title = "Email, SMS & Lifecycle Marketing"
nav_title = "Email, SMS & Lifecycle"
description = "Campaigns and flows, segmentation from order data, deliverability after the 2024 bulk-sender rules, CAN-SPAM, TCPA, state texting laws and SMS consent."
category = "Commerce Industry"
order = 2353
part = "Marketing and Customers"
tags = ["commerce", "email", "sms", "lifecycle", "consent", "tcpa", "deliverability"]
+++

A store's own list is the one audience it doesn't rent. A shopper who gave an email for 10% off, a subscriber who texted a keyword, a customer who checked the box at checkout: each can be reached again tomorrow for the price of a message rather than a click. So every store sends two kinds of marketing. **Campaigns** go to a segment at a time the merchant picks (the spring launch, the Black Friday sale). **Flows** go to one person when something they did, or failed to do, triggers them: a welcome after signing up, a reminder after leaving a checkout, a reorder prompt when the bottle should be running low, a last offer before the store stops writing to someone who never opens. Flows are the larger share of the work and the larger share of the risk, because a flow sends forever without anyone pressing a button.

The rules come from three directions at once. Mailbox providers decide whether email arrives, and since February 2024 Gmail and Yahoo require bulk senders to authenticate, offer one-click unsubscribe and keep complaints low. Carriers decide whether texts arrive, through registration and filtering. And the law decides what a store may send at all: CAN-SPAM for email, the TCPA, the FCC's rules and a growing set of state texting laws for SMS, with per-message damages that make a mistake in a flow a class action.

This chapter covers the platforms, campaigns and flows, the standard commerce flows and their triggers, segmentation from order data, frequency and the transactional line, deliverability, the email and texting law as it applies to a store, and the records that prove consent. Consent storage itself belongs to [Customers, Accounts & Privacy](/books/commerce/customers-and-accounts#marketing-consent), which owns `marketing_consents`; this chapter reads it. The law in general is the playbook's [Calls, Texts & Email](/docs/compliance/consumer-contact), and the sending machinery (one outbound gate, the message log, streams) is [Notifications & Consent](/docs/architecture/notifications). Order and shipping notifications are transactional and belong to the operational chapters ([Tracking Events](/books/commerce/shipping-and-carriers#tracking-events)); service businesses' reminders and on-my-way texts are Field Operations' [Customer Communications](/books/field-operations/customer-communications). The chapter extends `customers` and `marketing_consents` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model) and adds `campaigns`, `flows`, `flow_steps`, `flow_enrollments`, `message_sends` and `suppressions`.

## How the Platforms Do It

As of October 2026, from each vendor's help center and pricing page:

| Platform | What it is | How it bills | Commerce flows | SMS specifics |
| --- | --- | --- | --- | --- |
| **Klaviyo** | Email, SMS and push built on the store's event data | By active profile ("contacts who may receive marketing emails"); free tier of 250 active profiles and 500 emails a month | Triggers on lists, segments, metrics (`Started Checkout`, `Viewed Product`, `Placed Order`), date properties, price drops and low inventory; predictive CLV, churn risk and expected next order date | Quiet hours you set, delaying by default; double opt-in recommended for SMS and required "by some carriers and for abandoned cart messages (in the US and Canada)" |
| **Attentive** | SMS-first, with email | "Pay per message and subscriber count"; enterprise by custom quote | Journeys, including AI-scheduled ones | Two-tap mobile signup that opens a prefilled text; programmatic opt-ins need a legal disclosure |
| **Postscript** | SMS for Shopify stores | Monthly plan plus per-message rates and carrier fees: Starter $0 a month with a $49 minimum at $0.009 an SMS, down to $0.007 on Professional | Automations on Shopify events | Waking hours of 8 a.m. to 9 p.m. local by default, stricter state hours listed per state, messages held rather than dropped; confirmed opt-in by "Reply Y" |
| **Omnisend** | Email and SMS for small stores | By contact count, including non-subscribers who received automated messages; free for 250 contacts and 500 emails | Welcome, cart, checkout, browse, product and search abandonment, post-purchase, birthday | US SMS from $0.009 to $0.007 |
| **Braze** | Customer engagement platform for larger brands and apps | By contract | eCommerce Canvas templates on `ecommerce.product_viewed`, `ecommerce.cart_updated`, `ecommerce.checkout_started` and `ecommerce.order_placed` events | Through its messaging channels |
| **Mailchimp** | Email marketing, with SMS | By contacts, including unsubscribed ones; free for 250 contacts and 500 sends a month | Abandoned cart and customer journeys | US quiet hours 9 p.m. to 11 a.m. Eastern, queued; double opt-in "required to send abandoned cart text messages" |
| **Shopify Messaging** | The platform's own email, SMS and WhatsApp | 10,000 free emails a month, then $1 per 1,000; "abandoned checkout emails are always free" | Browse, cart and checkout recovery, welcome, thank-you, first-purchase upsell, win-back, birthday, VIP | SMS and WhatsApp only on the three recovery templates |

Three patterns run through the table:

- **The event stream is the product.** Every platform's flows trigger on the same handful of commerce events (viewed a product, added to cart, started checkout, placed an order, fulfilled), so the integration that sends those events accurately decides what the marketing can do. A missing `Placed Order` is a customer who keeps getting cart reminders after buying.
- **Pricing follows the list, not the send.** Email platforms bill by profile or contact, often including people who can't be marketed to, which rewards suppressing and deleting dead contacts; SMS bills by message segment plus carrier fees ([Segments and Encoding](/books/hosting-and-cloud/sending-a-text#segments-and-encoding)).
- **Compliance is built in, and partial.** Quiet hours, STOP handling and double opt-in are platform settings now, which is useful and also the trap: the defaults differ by vendor (Postscript's waking hours, Mailchimp's 9 p.m. to 11 a.m., Klaviyo's whatever the merchant set), and the merchant, not the vendor, is the sender the law holds to account.

## Campaigns and Flows

A **campaign** is one send to a segment, at a scheduled time, with one piece of content (or a few, for a test). A **flow** (Klaviyo's term; Braze calls it a Canvas, Attentive a Journey, Omnisend an automation) is a graph: a trigger, filters on who may enter, delays, branches, messages, and exit conditions. The mechanics worth knowing, from Klaviyo's documentation because it is the most explicit:

- **Trigger filters evaluate the event; profile filters evaluate the person.** A trigger filter ("cart value over $50") is checked once, at entry. A profile filter ("has placed order zero times since starting this flow") is checked at entry and again before every send, and someone who fails it at a later step skips that step.
- **Exit conditions are what make a flow safe.** Klaviyo's recommended filter for abandoned cart is "Person has Placed Order zero times since starting this flow." Braze's abandoned cart template exits on a cart update, a checkout start or an order. Without the exit, the shopper who bought on the phone gets the desktop cart reminder.
- **Delays are the strategy.** Klaviyo's prebuilt abandoned cart flows wait 4 hours before the first message; Braze's templates wait 1 hour for browse and 4 hours for cart and checkout. Shopify itself calls a checkout abandoned once it "remains incomplete for more than ten minutes after the customer has provided their email information" ([Abandonment and Recovery](/books/commerce/cart-and-checkout#abandonment-and-recovery)).
- **Flows and campaigns collide.** A customer in three flows and on a campaign's segment can get four messages in a day. Klaviyo's Smart Sending skips a message to anyone who received one within a window (16 hours by default for email, 24 for SMS), on by default for campaigns and in many prebuilt flows, and "Messages marked as transactional in Klaviyo are never skipped."

## The Core Commerce Flows

Every store converges on the same set. Their triggers, from the vendors' libraries:

| Flow | Trigger | Exits or suppresses on | What it's for |
| --- | --- | --- | --- |
| **Welcome series** | Added to a list (newsletter signup, popup) | First order, for the discount-reminder steps | Deliver the signup offer, introduce the brand |
| **Browse abandonment** | Viewed Product by an identifiable visitor | Added to cart, started checkout, ordered | A nudge on a product looked at |
| **Cart abandonment** | Added to Cart | Checkout started, order placed | Recover a cart before checkout |
| **Checkout abandonment** | Started Checkout with an email or phone captured | Order placed through any channel | The highest-intent recovery ([Abandonment and Recovery](/books/commerce/cart-and-checkout#abandonment-and-recovery)) |
| **Post-purchase** | Placed Order, or fulfilled or delivered | Return or cancellation | Care and use, review request, cross-sell |
| **Replenishment** | Time since an order of a consumable, from its usage period or the customer's own interval | A new order of the item, an active subscription | Reorder before it runs out |
| **Back in stock** | Subscribed to Back in Stock on a sold-out item | Purchase of the item | Notify when inventory returns |
| **Price drop** | A viewed or carted item's price falls | Purchase | Notify of a lower price |
| **Winback** | No order in a period sized to the purchase cycle | A new order | Reactivate lapsed customers |
| **Sunset** | No engagement in a long period | Engagement | Ask once more, then stop sending ([Deliverability](#deliverability)) |

The commerce-specific rules:

- **Recovery needs the real order book.** Abandonment flows exit on an order, which means the order must arrive as an event from every channel the customer might buy through: the web store, the app, a phone order, a store purchase on the same email. An order from POS that never reaches the email platform is a customer reminded to buy what they bought.
- **Replenishment comes from the item, not a guess.** A 30-day supply ordered with a quantity of two lasts 60 days. The usage period is an item attribute ([Units and Pack Sizes](/books/commerce/products-and-variants#units-and-pack-sizes)), the reminder date is computed from the order line's quantity, and a customer with an active subscription for the item is excluded, since [Subscription Commerce](/books/commerce/subscription-commerce#schedules-and-anchors) owns their cadence.
- **Back in stock has a capacity problem.** Klaviyo's back-in-stock flow is triggered only by its own "Subscribed to Back in Stock" event and sends in batches separated by a notification frequency once stock passes a "Restock minimum," because notifying 5,000 people about 40 units creates 4,960 disappointed ones and possibly an oversell ([Overselling](/books/commerce/inventory#overselling)).
- **Price-drop and discount flows are pricing.** A price-drop message is a price comparison and is only as truthful as the former price ([Price Comparisons](/books/commerce/online-consumer-protection#price-comparisons)); a recovery coupon is a promotion that should carry a single-use code and a budget ([Codes, Limits and Budgets](/books/commerce/promotions-and-gift-cards#codes-limits-and-budgets)), or it trains shoppers to abandon carts for the discount.
- **Post-purchase review requests have rules of their own.** The FTC's rule on consumer reviews bars suppressing negative reviews and conditioning an incentive on what a review says ([Fake Reviews and the FTC Rule](/books/commerce/reviews-and-ratings#fake-reviews-and-the-ftc-rule)); [Collecting Reviews](/books/commerce/reviews-and-ratings#collecting-reviews) covers the requests themselves.

## Segmentation From Order Data

A segment is a versioned definition with computed members ([Customer Segments](/books/commerce/customers-and-accounts#customer-segments)); for marketing, the useful definitions come from orders rather than from demographics:

- **Recency, frequency and monetary value (RFM).** Klaviyo's RFM report scores each dimension 1 to 3, with recency cutoffs at 180 and 365 days by default and frequency and monetary thresholds at the 33rd and 66th percentiles, and groups customers into Champions, Loyal, Recent, Needs attention, At risk and Inactive. The same computation is a few lines of SQL over `orders` ([How to Build It](#how-to-build-it)).
- **Predictions.** Klaviyo's predictive fields (historic, predicted and total CLV, churn risk, average time between orders, expected date of next order) need at least 500 customers who have ordered, 180 days of order history with orders in the last 30 days, and some customers with three or more orders; predicted CLV looks a year ahead and the model retrains at least weekly. Below those thresholds a store has rules, not predictions, and should say so in the segment's name.
- **Product and category affinity.** Bought in a category, never bought the accessory, bought a size: the joins are over `order_lines` and the catalog.
- **Exclusions are segments too.** Customers with an open return or a support ticket in progress, wholesale buyers, employees, people who received a refund for non-delivery last week, and anyone in a sensitive-inference segment that must not be targeted ([Customer Segments](/books/commerce/customers-and-accounts#customer-segments)).

Two cautions. Membership is not consent: the sending system checks `marketing_consents` per channel at send time, every time. And a segment built from net revenue must net out returns, or the "Champions" are serial returners ([Return-Rate Economics](/books/commerce/returns-and-exchanges#return-rate-economics)).

## Frequency, Transactional and Marketing

The line between transactional and marketing decides which rules apply to a message, and it is drawn by content. Under CAN-SPAM, a message's **primary purpose** decides whether it's commercial ([Email: CAN-SPAM](/docs/compliance/consumer-contact#email-can-spam)); under CTIA's guidance, adding a call to action such as a coupon to an informational text "may place the message in the promotional category" ([Texting: The Carrier Layer](/docs/compliance/consumer-contact#texting-the-carrier-layer)). So:

- **An order confirmation, a shipping update and a delivery notice are transactional,** sent on the transactional stream, without marketing consent, and not counted against marketing frequency.
- **A shipping update with a "you might also like" carousel is a mixed message,** and the safe reading is that the marketing content makes it marketing. My rule: transactional templates carry no promotional blocks, and the template, not the sender, declares the purpose ([Purpose Decides Everything](/docs/architecture/notifications#purpose-decides-everything)).
- **An abandoned cart reminder is marketing** in most readings, which is why Klaviyo and Mailchimp require double opt-in for abandoned cart texts.
- **Frequency caps are per person across all sources.** A daily or weekly cap per channel, applied after flows and campaigns are merged, with transactional messages outside it, is the general form of Smart Sending.

## Deliverability

A message that lands in spam reached nobody. The mailbox providers' rules since 2024, which the Hosting & Cloud volume covers from the sending platform's side ([What the Rules Require, as a Platform Sees Them](/books/hosting-and-cloud/inbox-rules#what-the-rules-require-as-a-platform-sees-them)), reduce for a store to this:

- **Gmail.** "Starting February 1, 2024, all email senders who send email to Gmail accounts must meet the requirements," with more for senders of "more than 5,000 messages per day to Gmail accounts": SPF, DKIM and DMARC, alignment, and "Marketing messages and subscribed messages must support one-click unsubscribe," with a June 1, 2024 deadline for that. Keep the spam rate in Postmaster Tools "below 0.10% and avoid ever reaching a spam rate of 0.30% or higher." Bulk-sender status "doesn't have an expiration date," and from November 2025 Gmail began "ramping up its enforcement on non-compliant traffic" with temporary and permanent rejections.
- **Yahoo.** The same shape: SPF and DKIM, DMARC "with at least p=none," the RFC 8058 POST method "highly recommended," unsubscribes honored "within 2 days," spam rate below 0.3%.
- **Microsoft.** Senders of "5,000 or more email messages" to Outlook.com and its sibling domains must pass SPF and DKIM, publish DMARC (p=none acceptable) and align, or get "550; 5.7.515 Access denied."
- **One-click unsubscribe is a header, not a link.** RFC 8058 requires `List-Unsubscribe-Post: List-Unsubscribe=One-Click` alongside a `List-Unsubscribe` HTTPS URI, both covered by the DKIM signature; the provider POSTs to the URI with no cookies or context, and the receiver must not redirect. The footer link stays, for CAN-SPAM and for people.

What the store controls is the list. Four practices keep it clean:

- **Send to people who engage.** Opens no longer measure that: Apple Mail Privacy Protection downloads remote content "privately ... in the background," and Klaviyo says the preload "causes a false open event" that "artificially inflates your open rates," with no way to separate human opens from machine ones beyond an "Apple Privacy Open" flag. Engagement segments use clicks, orders, site activity and recent signups, and treat an MPP open as no signal.
- **Sunset the unengaged.** A sunset flow asks once more and then suppresses. Platforms that bill per profile make this cheaper too.
- **Confirm where the source is weak.** Double opt-in costs signups and saves complaints; it is the default answer for popups with incentives and for any SMS list, and M3AAWG's confirmed opt-in is the level Shopify records ([Marketing Consent](/books/commerce/customers-and-accounts#marketing-consent)).
- **Never buy or rent a list.** A bought list breaks CAN-SPAM's spirit, PECR's letter (the soft opt-in "doesn't cover bought-in lists"), every ESP's acceptable use policy, and the spam rate in a week ([Onboarding and Vetting](/books/hosting-and-cloud/email-sending-platforms#onboarding-and-vetting)).

Links matter too: a text's link unfurls in Apple Messages from the page's Open Graph tags, and an email client may show a card for a shared product page, so product and landing pages need their preview metadata right ([How Each Unfurler Behaves](/docs/frontend/link-previews#how-each-unfurler-behaves)).

## Email Law for a Store

CAN-SPAM is an opt-out law: a store may email anyone it has an address for, as long as each commercial message has accurate headers and subject, identifies itself as an ad, carries a physical postal address and a working opt-out honored within ten business days ([Email: CAN-SPAM](/docs/compliance/consumer-contact#email-can-spam)). The mailbox providers are stricter in practice (two days for Yahoo, a 48-hour recommendation from Google). The EU and UK are opt-in, with the soft opt-in for existing customers' similar products ([Outside the US](/docs/compliance/consumer-contact#outside-the-us)). Three commerce consequences:

- **The checkout checkbox is the main source of consent,** unchecked by default, with its wording versioned in `marketing_consents.wording_ref`.
- **A soft opt-in is a basis, scoped to the merchant and similar products,** and doesn't survive the address being shared with a sister brand.
- **Both the sender and the company promoted are liable** under CAN-SPAM, so a brand that lets an affiliate email for it (the next chapter's [Affiliates and Influencers](/books/commerce/acquisition-and-attribution#affiliates-and-influencers)) owns the affiliate's compliance.

## SMS Law for a Store

Texting is where commerce marketing meets per-message statutory damages. The federal rules (prior express written consent for marketing texts, revocation by any reasonable means within ten business days, calling hours, do-not-call) are the playbook's ([TCPA Consent](/docs/compliance/consumer-contact#tcpa-consent), [Revoking Consent](/docs/compliance/consumer-contact#revoking-consent)). The store's version adds signup, keywords, quiet hours by state, and a court record that moved in 2025 and 2026.

### Signup and Consent

A marketing text needs **prior express written consent**: a signed agreement (an electronic signature, such as a checkbox with disclosure or a keyword texted in response to a disclosed offer) authorizing this seller to send marketing texts to this number, stating that agreeing isn't a condition of purchase. Carriers add disclosure requirements at the signup point, as Twilio's 10DLC documentation sets them out: the brand, the types of messages, the message frequency ("You may receive up to 4 messages per month"), "Message and data rates may apply," "Reply STOP to unsubscribe" and "Reply HELP for help," with links to terms and a privacy policy. The commerce forms:

- **Checkout checkbox** with the phone field, unchecked, with the disclosure beside it.
- **Popup or two-tap signup,** where the phone number or a prefilled text the shopper sends is the signature. Attentive notes that "A legal disclosure is required when a user is opted-in programmatically."
- **Keyword** in an ad or on packaging ("Text JOIN to 12345"), where the inbound text is the consent and the reply carries the disclosure.
- **Confirmed (double) opt-in,** where the first message asks for a reply. Postscript's: "Reply Y to subscribe to recurring automated promotional msgs (e.g. cart reminders). Msg & data rates may apply," and after the Y: "You're subscribed! Reply STOP to unsubscribe, HELP for help." It is required by some carriers and platforms for cart reminders, and it is the strongest evidence a number belongs to the person who typed it.

Consent is per brand and per number, never transferable, and an opt-in list isn't shared, even with a sister brand on the same platform ([Texting: The Carrier Layer](/docs/compliance/consumer-contact#texting-the-carrier-layer)).

### Keywords and Revocation

STOP and its synonyms revoke; HELP returns the program's name and contact; START or UNSTOP resubscribes (Postscript accepts both). The FCC's rules as of October 2026, in the playbook's [Revoking Consent](/docs/compliance/consumer-contact#revoking-consent): revocation by any reasonable means honored within ten business days, a single non-marketing confirmation allowed within five minutes, and from November 25, 2026 (FCC 26-67) a revocation in response to a marketing text revokes all of the store's marketing texts, while one sent in reply to an informational text may be scoped to that category. For a store that means a STOP to a cart reminder ends all promotional texts, a STOP to a shipping update can end shipping texts only, and a reply of "no more please" counts even though it isn't a keyword. Opt-out language in the message is the designated method's disclosure; Postscript recommends it "at least once a month," and the rule's designated-method option rewards putting it in every message.

### Quiet Hours and State Texting Laws

The federal window for telephone solicitations is 8 a.m. to 9 p.m. at the called party's location, and 64.1200(e) applies it to "telephone solicitations or telemarketing calls or text messages to wireless telephone numbers." The FCC also codified in its 2023 order (FCC 23-107, effective March 26, 2024) that "the National Do-Not-Call (DNC) Registry's protections extend to text messages." States add their own windows, frequency caps and consent rules, several of them aimed squarely at ecommerce texting:

| State | Law | Window and caps | Notes |
| --- | --- | --- | --- |
| **Florida** | Florida Telephone Solicitation Act, as narrowed in 2023 | 8 a.m. to 8 p.m.; three calls in 24 hours on the same subject | An automated system must "both select and dial," and a plaintiff must reply STOP and wait 15 days before suing over texts ([Contact Law the Platform Tracks](/books/hosting-and-cloud/telecom-duties#contact-law-the-platform-tracks)) |
| **Oklahoma** | Oklahoma Telephone Solicitation Act of 2022 | 8 p.m. to 8 a.m. barred; three in 24 hours even with consent | Prior express written consent for automated sales calls, $500 a violation ([Contact Law the Platform Tracks](/books/hosting-and-cloud/telecom-duties#contact-law-the-platform-tracks)) |
| **Maryland** | Stop the Spam Calls Act (effective January 1, 2024) | No solicitations "between 8 p.m. and 8 a.m."; no more than three in 24 hours on the same subject | Prior express written consent for an "automated system for the selection or dialing of telephone numbers," covering "telephone call, text message, or voicemail" |
| **Virginia** | Telephone Privacy Protection Act, as amended by SB 1339 (2025) | 8 a.m. to 9 p.m. unless the person consented | Covers "any text message sent to any wireless telephone with a Virginia area code"; a reply of "UNSUBSCRIBE" or "STOP" "shall be honored for at least 10 years" |
| **Texas** | SB 140 (effective September 1, 2025) | Texas solicitation hours | Extends "telephone solicitation" to "a transmission of a text or graphic message," makes violations DTPA acts with a private remedy; the Secretary of State says a business texting "with prior consent of the consumer is not required to complete the Telephone Solicitation Registration Statement" |

Vendors encode these differently. Postscript holds automation messages until "waking hours begin in the subscriber's timezone" and lists Florida, Connecticut, Oklahoma, Maryland and Washington at 8 a.m. to 8 p.m. and Texas at 9 a.m. to 9 p.m. Monday to Saturday and noon to 9 p.m. Sunday, with Texas hours turned on manually. Klaviyo delays by default with an optional maximum delay after which messages are skipped, and resolves the time zone from the profile's location, then the area code. Mailchimp holds US texts from 9 p.m. to 11 a.m. Eastern. Three engineering rules follow:

- **The recipient's time, not the store's.** A number's area code is a weak guess (people keep numbers when they move); a shipping address is better; the strictest plausible zone is safest. Virginia's law keys on the area code itself.
- **Hold, don't drop, and re-check on release.** A held cart reminder released at 8 a.m. must re-check that the cart is still open and consent still stands ([Event-Triggered, Re-Checked at Send Time](/docs/architecture/notifications#event-triggered-re-checked-at-send-time)).
- **State rules are data with sources and dates.** A table of windows and caps in the outbound gate, effective-dated, with the statute it came from, so Texas's next amendment is a row ([One Outbound Gate](/docs/architecture/notifications#one-outbound-gate)).

### The Courts, as of October 2026

Most TCPA texting suits against stores in 2024 and 2025 were do-not-call and quiet-hours claims, brought under the private right of action in 47 U.S.C. 227(c)(5) for someone who "has received more than one telephone call within any 12-month period" in violation of the regulations. Whether a text is a "telephone call" there is now contested:

- **The Supreme Court removed deference.** *McLaughlin Chiropractic v. McKesson* (2025) lets district courts decide what the TCPA means without being bound by the FCC ([TCPA Consent](/docs/compliance/consumer-contact#tcpa-consent)), which reopened the question.
- **The Seventh Circuit said no.** In *Steidinger v. Blackstone Medical Services* (No. 25-2398, July 14, 2026), consolidated suits over marketing texts that continued after STOP replies and registry listings, the court held that "texts are not calls, so § 227(c)(5) does not authorize the plaintiffs' suit," reading "telephone call" by its 1991 meaning and noting that the FCC's extension of the registry to texts rests on a different subsection. It left agency enforcement "undisturbed."
- **Other courts read it differently.** The Ninth Circuit's *Howard v. Republican National Committee* (2026), which the Seventh Circuit distinguished, holds that "a text message is properly deemed to be a 'call'" under 227(b), the autodialer and prerecorded-voice provision, and district courts outside the Seventh Circuit have split on 227(c). A circuit split invites the Supreme Court. <!-- source-gap: text-dnc-district-split | secondary | district court decisions after July 2026 on whether texts are calls under 227(c)(5), and quiet-hours rulings such as King v. Bon Charge (D. Del. 2026) | closes with: the opinions themselves on CourtListener or PACER | checked: 2026-10-28 -->
- **Consent is still the defense.** Quiet-hours rules govern "telephone solicitations," which exclude messages sent with the recipient's prior express invitation or permission, and the FCC has an open petition from ecommerce groups (DA 25-216, March 2025) asking whether quiet hours apply to texts sent with prior express written consent. No ruling had issued as of October 2026. <!-- source-gap: fcc-da-25-216 | secondary | DA 25-216 public notice on quiet hours for consented texts, and whether the FCC has ruled | closes with: the DA 25-216 PDF and any later FCC order | checked: 2026-10-28 -->

None of this changes what a store should build. Seventh Circuit plaintiffs can still sue under state laws (the Steidinger plaintiffs pleaded Florida's), the FCC and state attorneys general can enforce, 227(b) claims for autodialed texts survive, and carriers filter without a court. My rule: consent, quiet hours and STOP handling built to the strictest state, regardless of which circuit the store is sued in.

### Registration

Business texting from ten-digit numbers requires an A2P 10DLC brand and campaign registration; toll-free numbers need toll-free verification; short codes have their own approval. The campaign's declared use case, sample messages and opt-in description must match what the store sends, or carriers filter it ([10DLC: Brands and Campaigns](/books/hosting-and-cloud/texting-registration#10dlc-brands-and-campaigns), [Toll-Free Verification](/books/hosting-and-cloud/texting-registration#toll-free-verification)). The texting platform registers the store as an ISV customer; the store supplies the truthful answers and keeps the opt-in flow the reviewers saw.

## How to Build It

Consent lives in `marketing_consents` ([Customers, Accounts & Privacy](/books/commerce/customers-and-accounts#how-to-build-it)); this chapter adds the definitions of what is sent, each send, and the suppression list every sender honors. A store using Klaviyo or Attentive holds most of this in the vendor; a platform or a store that sends itself owns it, and either way the send log and suppressions must be reachable for an audit and a deletion request:

```sql
ALTER TABLE marketing_consents
  ADD COLUMN brand_id      UUID REFERENCES brands (id),  -- consent is per brand, never shared
  ADD COLUMN confirmed_at  TIMESTAMPTZ,      -- the double opt-in reply or click
  ADD COLUMN signup_unit   TEXT;             -- 'checkout_checkbox', 'popup', 'two_tap', 'keyword'

CREATE TABLE campaigns (                 -- one send to a segment
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id     UUID NOT NULL REFERENCES merchants (id),
  brand_id        UUID REFERENCES brands (id),
  channel         TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'push')),
  purpose         TEXT NOT NULL CHECK (purpose IN ('marketing', 'informational')),
  segment_id      UUID REFERENCES customer_segments (id),
  segment_version INT,                    -- the definition the audience came from
  template_ref    TEXT NOT NULL,          -- versioned content, purpose declared on it
  scheduled_for   TIMESTAMPTZ,
  respect_quiet_hours BOOLEAN NOT NULL DEFAULT TRUE,
  status          TEXT NOT NULL CHECK (status IN ('draft', 'scheduled', 'sending', 'sent',
                    'cancelled')),
  created_by      TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE flows (                     -- a triggered program, versioned
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id     UUID NOT NULL REFERENCES merchants (id),
  kind            TEXT NOT NULL CHECK (kind IN ('welcome', 'browse_abandonment',
                    'cart_abandonment', 'checkout_abandonment', 'post_purchase',
                    'replenishment', 'back_in_stock', 'price_drop', 'winback', 'sunset',
                    'other')),
  version         INT NOT NULL,
  trigger_event   TEXT NOT NULL,          -- 'checkout.contact_captured', 'order.placed', ...
  trigger_filter  JSONB NOT NULL DEFAULT '{}',  -- checked once, at entry
  profile_filter  JSONB NOT NULL DEFAULT '{}',  -- re-checked before every step
  exit_events     TEXT[] NOT NULL DEFAULT '{}', -- 'order.placed', 'subscription.created'
  reentry_after   INTERVAL,               -- null: once per person ever
  status          TEXT NOT NULL CHECK (status IN ('draft', 'live', 'paused', 'retired')),
  UNIQUE (merchant_id, kind, version)
);

CREATE TABLE flow_steps (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  flow_id       UUID NOT NULL REFERENCES flows (id),
  position      INT NOT NULL,
  delay         INTERVAL NOT NULL DEFAULT '0',  -- after the previous step
  channel       TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'push')),
  purpose       TEXT NOT NULL CHECK (purpose IN ('marketing', 'informational')),
  template_ref  TEXT NOT NULL,
  branch        JSONB,                  -- condition to take this step, if any
  UNIQUE (flow_id, position)
);

CREATE TABLE flow_enrollments (          -- one person in one flow, from one event
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  flow_id        UUID NOT NULL REFERENCES flows (id),
  customer_id    UUID NOT NULL REFERENCES customers (id),
  trigger_ref    TEXT NOT NULL,           -- the checkout, order or product event that entered
  entered_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  next_step_at   TIMESTAMPTZ,
  exited_at      TIMESTAMPTZ,
  exit_reason    TEXT CHECK (exit_reason IN ('completed', 'exit_event', 'filter',
                   'unsubscribed', 'suppressed', 'manual')),
  UNIQUE (flow_id, customer_id, trigger_ref)  -- a replayed event doesn't enroll twice
);

CREATE TABLE message_sends (             -- every send and every skip, append-only
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id     UUID NOT NULL REFERENCES merchants (id),
  customer_id     UUID REFERENCES customers (id),
  channel         TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'push')),
  address         TEXT NOT NULL,          -- the email or E.164 number used
  purpose         TEXT NOT NULL CHECK (purpose IN ('marketing', 'informational',
                    'transactional')),
  campaign_id     UUID REFERENCES campaigns (id),
  enrollment_id   UUID REFERENCES flow_enrollments (id),
  template_ref    TEXT NOT NULL,
  consent_id      UUID REFERENCES marketing_consents (id),  -- the row that allowed it
  outcome         TEXT NOT NULL CHECK (outcome IN ('sent', 'held_quiet_hours',
                    'skipped_frequency', 'skipped_no_consent', 'skipped_suppressed',
                    'skipped_filter', 'failed')),
  recipient_tz    TEXT,                   -- the zone quiet hours were evaluated in
  provider_ref    TEXT,                   -- the ESP or SMS provider's message ID
  decided_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (campaign_id IS NULL OR enrollment_id IS NULL)
);

CREATE TABLE suppressions (              -- addresses nothing marketing may reach
  merchant_id   UUID NOT NULL REFERENCES merchants (id),
  channel       TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'push')),
  address       TEXT NOT NULL,            -- normalized email or E.164 number
  reason        TEXT NOT NULL CHECK (reason IN ('unsubscribed', 'stop_keyword', 'complaint',
                  'hard_bounce', 'invalid', 'sunset', 'privacy_request', 'legal_hold')),
  scope         TEXT NOT NULL DEFAULT 'marketing' CHECK (scope IN ('marketing',
                  'informational_category', 'all')),
  source_ref    TEXT,                     -- the message, request or bounce it came from
  keep_until    DATE,                     -- e.g. ten years for a Virginia text opt-out
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (merchant_id, channel, address, reason)
);
```

The gate every marketing send passes through, in one query:

```sql
-- May this customer get a marketing SMS now? Latest consent, no suppression, under the cap.
SELECT c.id
FROM customers c
JOIN LATERAL (
  SELECT state FROM marketing_consents mc
  WHERE mc.customer_id = c.id AND mc.channel = 'sms' AND mc.address = c.phone
  ORDER BY mc.recorded_at DESC LIMIT 1
) consent ON consent.state = 'subscribed'
WHERE c.id = $1
  AND NOT EXISTS (SELECT 1 FROM suppressions s
                  WHERE s.merchant_id = c.merchant_id AND s.channel = 'sms'
                    AND s.address = c.phone AND s.scope IN ('marketing', 'all'))
  AND (SELECT COUNT(*) FROM message_sends m
       WHERE m.customer_id = c.id AND m.channel = 'sms' AND m.purpose = 'marketing'
         AND m.outcome = 'sent' AND m.decided_at > NOW() - INTERVAL '24 hours') = 0;
-- Quiet hours are evaluated after this, from the state rules table, in the recipient's zone.
```

Design notes:

- **Consent and suppression are separate.** Consent says yes for a purpose; suppression says no for an address, whatever any consent says. A hard bounce, a spam complaint or a privacy deletion suppresses without being a consent change, and an address re-entered by a new customer stays suppressed until that person opts in anew.
- **Log the skip as well as the send.** A `message_sends` row with `outcome = 'skipped_no_consent'` or `'held_quiet_hours'` is the proof that the gate worked, which is what a TCPA defense or a regulator asks for ([The Message Log](/docs/architecture/notifications#the-message-log)).
- **Enroll idempotently.** Commerce events arrive twice; the unique key on flow, customer and trigger keeps one abandoned checkout to one reminder series ([Idempotency Beyond the API](/docs/payments/idempotency#idempotency-beyond-the-api)).
- **Exits are events from the order book.** `order.placed` from every channel, `subscription.created`, `return.created`; a flow listening only to the web store's events will remind phone and store buyers.
- **Version flows like code.** A live flow's change creates a new version; enrollments keep the version they entered, so a complaint about a message sent in March can be answered with March's flow.
- **Hash for deletion reach.** A privacy deletion redacts the customer but keeps a suppression on a hash of the address if the law allows keeping it, so a re-import from an old CSV doesn't resubscribe them; record the basis ([Erasure vs Append-Only Records](/docs/architecture/data-retention#erasure-vs-append-only-records)).
- **Emit events:** `flow.enrolled`, `message.sent`, `message.skipped`, `suppression.added`, consumed by analytics and attribution ([Event Design](/docs/telemetry/event-design)).

## Auditing

- **For every marketing text, the consent row that allowed it,** with the disclosure wording, the signup unit, the timestamp and the confirmation reply where double opt-in applied.
- **Every STOP and unsubscribe,** with the message it answered, its scope, and the time it took effect against the ten-business-day limit.
- **Quiet-hours decisions,** with the recipient zone used, the rule applied and the release time of held messages.
- **Flow versions and the enrollments under each,** so any message can be traced to the definition that sent it.
- **Deliverability signals by stream:** spam rate, bounce rate and unsubscribe rate, against the providers' thresholds.

## What This Means for the System You Build

- **Send accurate commerce events from every channel,** because flows enter and exit on them.
- **Give every flow an exit on purchase** and re-check consent and the cart before each step.
- **Declare purpose on the template,** keep promotional content out of transactional messages, and cap marketing frequency per person across flows and campaigns.
- **Meet the bulk-sender rules:** authenticated and aligned domains, RFC 8058 one-click unsubscribe, spam rate under 0.1%, and a sunset policy that ignores machine opens.
- **Collect SMS consent with the full disclosure,** confirm it, and keep it per brand and per number.
- **Treat STOP to a marketing text as stopping all marketing texts,** and honor plain-language revocations.
- **Hold texts for quiet hours in the recipient's zone,** from dated state rules built to the strictest state.
- **Log every send and every skip** with the consent and rule that decided it.

## References

**Platform documentation**

- [Klaviyo Help Center: Flow filters and trigger filters](https://help.klaviyo.com/hc/en-us/articles/115002779051), trigger types, trigger filters checked at entry and profile filters re-checked before each step
- [Klaviyo Help Center: Abandoned cart flow](https://help.klaviyo.com/hc/en-us/articles/115002779411), the Started Checkout trigger, the placed-order filter and the 4-hour default delay
- [Klaviyo Help Center: Flows glossary](https://help.klaviyo.com/hc/en-us/articles/360054130591), welcome, browse abandonment, post-purchase, winback, price drop and sunset flows
- [Klaviyo Help Center: Back in stock](https://help.klaviyo.com/hc/en-us/articles/115003872251), the subscription trigger, restock minimum and notification frequency
- [Klaviyo Help Center: Smart Sending](https://help.klaviyo.com/hc/en-us/articles/115002779311), the 16-hour and 24-hour defaults and the transactional exemption
- [Klaviyo Help Center: SMS quiet hours](https://help.klaviyo.com/hc/en-us/articles/55578813576091), delay by default, maximum delay and time zone resolution
- [Klaviyo Help Center: Predictive analytics](https://help.klaviyo.com/hc/en-us/articles/360020919731), predicted fields and data requirements
- [Klaviyo Help Center: RFM analysis](https://help.klaviyo.com/hc/en-us/articles/17797937793179), scores, cutoffs and groups
- [Klaviyo Help Center: Single and double opt-in](https://help.klaviyo.com/hc/en-us/articles/115005251108), SMS double opt-in and abandoned cart messages
- [Klaviyo Help Center: Apple Mail Privacy Protection](https://help.klaviyo.com/hc/en-us/articles/4416791883163), false opens and the Apple Privacy Open property
- [Klaviyo: Pricing](https://www.klaviyo.com/pricing), active profiles and the free tier
- [Postscript Help Center: Quiet hours](https://help.postscript.io/en/articles/13563937-guide-to-quiet-hours), waking hours, state hours and held messages
- [Postscript Help Center: Onsite and confirmed opt-in](https://help.postscript.io/en/articles/13563921-understanding-onsite-opt-in-confirmed-opt-in), the Reply Y wording and confirmation
- [Postscript Help Center: Customize your messages](https://help.postscript.io/en/articles/13563968-customize-your-messages), START and UNSTOP, opt-out language monthly
- [Postscript: Pricing](https://postscript.io/pricing), plan fees, per-message rates and carrier fees
- [Attentive Docs: Add subscriptions](https://docs.attentive.com/reference/addsubscriptions.md), legal disclosure for programmatic opt-ins
- [Attentive: Pricing](https://www.attentive.com/pricing), pay per message and subscriber count
- [Omnisend Help Center: Automations library](https://support.omnisend.com/en/articles/4334766-automations-library), prebuilt automations
- [Omnisend: Pricing](https://www.omnisend.com/pricing/), contact-based billing and SMS rates
- [Mailchimp: Single opt-in vs double opt-in](https://mailchimp.com/help/single-opt-in-vs-double-opt-in/), audience opt-in settings and abandoned cart texts
- [Mailchimp: About SMS quiet hours](https://mailchimp.com/help/about-sms-quiet-hours/), the US window and queuing
- [Mailchimp: About pricing plans](https://mailchimp.com/help/about-mailchimp-pricing-plans/), contact counting and send limits
- [Braze Docs: eCommerce use cases](https://www.braze.com/docs/user_guide/engagement_tools/canvas/ideas_and_strategies/ecommerce_use_cases/), Canvas templates, events and delays
- [Shopify Help Center: Marketing automations](https://help.shopify.com/en/manual/promoting-marketing/create-marketing/shopify-messaging/marketing-automations/create), Shopify Messaging templates and channels
- [Shopify Help Center: Shopify Messaging email pricing](https://help.shopify.com/en/manual/promoting-marketing/create-marketing/shopify-messaging/email/pricing), free allowance, rates and free abandoned checkout emails
- [Twilio Docs: A2P 10DLC business information](https://www.twilio.com/docs/messaging/compliance/a2p-10dlc/collect-business-info), opt-in disclosure elements and auto-reply contents

**Deliverability**

- [Google Workspace Admin Help: Email sender guidelines](https://support.google.com/a/answer/81126), the February 2024 requirements, bulk senders and spam rate thresholds
- [Google Workspace Admin Help: Email sender guidelines FAQ](https://support.google.com/a/answer/14229414), the June 2024 one-click deadline, 48-hour unsubscribes and November 2025 enforcement
- [Yahoo Sender Hub: Best practices](https://senders.yahooinc.com/best-practices/), authentication, RFC 8058, two-day unsubscribes and the 0.3% spam rate
- [Microsoft Support: Fix error 550 5.7.515 in Outlook.com](https://support.microsoft.com/en-gb/outlook/fix-ndr-error-550-5-7-515-in-outlook-com), high-volume sender authentication
- [RFC 8058: Signaling one-click functionality for list email headers](https://www.rfc-editor.org/rfc/rfc8058.html), the List-Unsubscribe-Post header, DKIM coverage and the POST
- [Apple Support: Protect your email privacy in Mail](https://support.apple.com/guide/mail/protect-email-privacy-mlhlp1205/mac), hidden IP and background download of remote content

**Law and courts**

- [47 CFR 64.1200](https://www.law.cornell.edu/cfr/text/47/64.1200), calling hours and their application to text messages in (e)
- [Federal Register: Targeting and Eliminating Unlawful Text Messages (FCC 23-107)](https://www.govinfo.gov/content/pkg/FR-2024-01-26/html/2023-28832.htm), do-not-call protections extended to texts, effective March 26, 2024
- [Seventh Circuit: Steidinger v. Blackstone Medical Services, No. 25-2398 (PDF)](https://blogs.duanemorris.com/classactiondefense/wp-content/uploads/sites/56/2026/07/Steidinger-v.-Blackstone-Medical-Services.pdf), texts are not telephone calls under 227(c)(5), and Howard v. RNC on 227(b)
- [Maryland Code, Commercial Law 14-4501](https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gcl&section=14-4501&enactments=false), definitions covering text messages and written consent
- [Maryland Code, Commercial Law 14-4502](https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gcl&section=14-4502&enactments=false), automated system consent, hours and the three-in-24 cap
- [Maryland General Assembly: HB 37 (2023)](https://mgaleg.maryland.gov/mgawebsite/Legislation/Details/hb0037?ys=2023RS), the Stop the Spam Calls Act and its effective date
- [Code of Virginia 59.1-510](https://law.lis.virginia.gov/vacode/title59.1/chapter51/section59.1-510/), texts to Virginia area codes as telephone solicitations
- [Code of Virginia 59.1-511](https://law.lis.virginia.gov/vacode/title59.1/chapter51/section59.1-511/), permitted hours
- [Code of Virginia 59.1-514](https://law.lis.virginia.gov/vacode/title59.1/chapter51/section59.1-514/), STOP and UNSUBSCRIBE honored for ten years
- [Texas Legislature: SB 140 (89R) history](https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=SB140), signed June 20, 2025, effective September 1, 2025
- [Texas Legislature: SB 140 enrolled text](https://capitol.texas.gov/tlodocs/89R/billtext/html/SB00140F.htm), text messages as solicitations and the DTPA remedy
- [Texas Secretary of State: Telephone solicitation FAQ](https://www.sos.state.tx.us/statdoc/faqs3400.shtml), no registration for consented texting
- [ICO: Electronic mail marketing](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/electronic-and-telephone-marketing/electronic-mail-marketing/), the soft opt-in and bought-in lists

**In practice**

- [Postscript Help Center: Texas SB 140](https://help.postscript.io/hc/en-us/articles/40915081452443), what consented senders must and need not do after the Texas litigation
