+++
title = "The CPaaS Business"
description = "How communications platforms make money: owned networks versus aggregators, usage revenue, carrier fees passed through, and why the margin keeps shrinking."
category = "Hosting & Cloud Industry"
order = 2179
part = "Communications Platforms"
tags = ["cpaas", "messaging", "voice", "pass-through", "carriers"]
+++

A communications platform as a service (CPaaS) rents phone numbers and carries texts, calls and email for other companies, through an API, billed by the unit. Its customers are software companies: a scheduling app that sends reminders, a bank that sends one-time passcodes, a contact center that places calls, a marketplace that masks two parties' numbers. Almost none of them want to become a phone company, and the CPaaS exists so they don't have to. It holds the carrier interconnects, the number inventory, the registrations the carriers demand, the regulatory filings the FCC requires and the fraud controls that keep a leaked API key from becoming a six-figure bill. The customer sees an endpoint that takes a phone number and a body and returns a message ID.

Underneath, the business is closer to a registrar than to a cloud. A cloud owns the servers it rents; most of a CPaaS's cost of goods is fees paid to carriers it doesn't own, and a growing share of its invoice is money collected for someone else. This chapter covers how the business works: how the providers came to be and where they sit, owned network versus aggregator, how the revenue is shaped and why its margin keeps falling, and how to model carriers and their fees. The rest of the part follows a message and a call through the system: [Phone Numbers & Porting](/books/hosting-and-cloud/phone-numbers-and-porting), [Business Texting Registration](/books/hosting-and-cloud/texting-registration), [Sending a Text](/books/hosting-and-cloud/sending-a-text), [WhatsApp & Messaging Apps](/books/hosting-and-cloud/messaging-apps), [Voice Platforms](/books/hosting-and-cloud/voice-platforms), [911, CPNI & Telecom Duties](/books/hosting-and-cloud/telecom-duties), [Telecom Fraud](/books/hosting-and-cloud/telecom-fraud), [Email Sending Platforms](/books/hosting-and-cloud/email-sending-platforms) and [Inbox Rules](/books/hosting-and-cloud/inbox-rules).

The part is written from the platform's side. The law of contacting people (TCPA consent, revocation, quiet hours, do-not-call, CAN-SPAM) is the playbook's [Calls, Texts & Email](/docs/compliance/consumer-contact), and the engineering of a sender (the consent ledger, one outbound gate, the message log, email authentication, per-tenant brands) is [Notifications & Consent](/docs/architecture/notifications). This part covers what the company that carries those messages has to build on top.

## How the Providers Do It

Every provider below sells numbers, messaging and voice by the unit; they differ in how much of the network they own, how they report, and what else they bundle. As of October 2026:

| Provider | Ownership and listing | Network model | What the public record shows |
| --- | --- | --- | --- |
| **Twilio** | NYSE: TWLO | Mostly aggregator: a software layer over carriers and upstream providers | $5.07 billion revenue in 2025, 74% of it usage-based; about 402,000 active customer accounts; GAAP gross margin 49%; one reportable segment since Q3 2025 |
| **Bandwidth** | Nasdaq: BAND | Owned network: a competitive local exchange carrier in 49 states and DC | $753.8 million revenue in 2025, $192.4 million of it messaging surcharges; voice about 60% of revenue; 911 service in 42 countries |
| **Sinch** | Nasdaq Stockholm: SINCH | Aggregator with operator connections; email through Mailgun and Mailjet | SEK 27,080 million net sales in 2025, organic growth 1%; more than 190,000 customers |
| **Vonage** | Part of Ericsson since July 2022 | API platform (formerly Nexmo) inside a network equipment vendor | Ericsson impaired SEK 32 billion of Vonage goodwill and intangibles in Q3 2023 and a further SEK 11.4 billion "mainly" related to Vonage in Q2 2024 |
| **Telnyx** | Private | Claims its own switching and a private IP network, licensed in 30 or more countries (vendor claims, unaudited) | Publishes the most complete public tables of 10DLC fees and carrier throughput |
| **Plivo** | Private | Aggregator | Publishes list prices below Twilio's and compares itself to Twilio on its pricing page |
| **Infobip** | Private, Croatia | "800+" direct operator connections (vendor claim) | €1.85 billion revenue in 2024 and a €134 million net loss, per press reports of its UK filing |
| **Bird** (formerly MessageBird) | Private, Amsterdam | Aggregator | Cut SMS prices by 90% when it rebranded on February 1, 2024 |

Email senders (Amazon SES, Twilio SendGrid, Mailgun, Postmark, Resend) are the same business on a different network, with mailbox providers in the carriers' role; [Email Sending Platforms](/books/hosting-and-cloud/email-sending-platforms) covers them. The landscape view, with who resells whom, is [The Provider Landscape](/books/hosting-and-cloud/provider-landscape#communications-platforms).

## How It Got Here

The industry is younger than most of the stack in this volume, and every era added a layer of fees and rules the platform now has to carry:

| Date | Step | What it solved | What it cost |
| --- | --- | --- | --- |
| 1947 | AT&T develops the North American Numbering Plan; implementation begins in 1951 | Direct dialing of long distance with one numbering scheme | Numbers became a regulated, administered resource ([Phone Numbers & Porting](/books/hosting-and-cloud/phone-numbers-and-porting#how-it-got-here)) |
| December 3, 1992 | The first text message, "Merry Christmas", sent from a computer over Vodafone's network | A data channel on every handset | 140 octets per message, the root of segment pricing |
| July 2000 | Bandwidth is founded; it later becomes a CLEC | Owning the numbers and the switch | Carrier regulation and 911 duties come with the license |
| 2001 | Vonage is founded as a consumer VoIP phone company | Phone service over the internet | VoIP gradually acquired telephone-company duties (911, USF) |
| 2008 | Twilio is incorporated (March) and launches its voice API in private beta (November 20) | Telephony as an HTTP API, for developers | The platform sits between developers and carriers it doesn't control |
| February 9, 2010 | Twilio adds SMS to its API | Texting from code | Business traffic on a channel designed for people |
| May 5, 2016 | Vonage agrees to buy Nexmo for $230 million in cash and stock | A consumer VoIP company buys an API business | Integration and, later, a sale |
| June 23, 2016 | Twilio lists on the NYSE at $15 a share | Public capital for a usage business | Quarterly disclosure of margin and net expansion |
| November 10, 2017 | Bandwidth lists on Nasdaq at $20 a share | The owned-network model goes public | Surcharges become a reported revenue line |
| February 1, 2019 | Twilio completes its SendGrid acquisition, valued at about $3 billion at close | Email joins the messaging bundle | Two reputation systems in one company |
| February 13, 2019 | CLX Communications rebrands as Sinch | A European aggregator takes a single global brand | Growth by acquisition across markets |
| 2020 to 2021 | US carriers launch A2P 10DLC routes with per-message fees and brand and campaign registration through The Campaign Registry | Spam control for business texting on ordinary numbers | A registration workflow, monthly campaign fees and carrier surcharges ([Business Texting Registration](/books/hosting-and-cloud/texting-registration)) |
| April 28, 2021 | MessageBird agrees to buy SparkPost for $600 million | Email for a messaging aggregator | Another email bundle |
| July 14, 2021 | Twilio completes its acquisition of Zipwhip, valued at about $850 million | Toll-free texting and direct carrier connections | Zipwhip accounts kept outside Twilio's account counts |
| September 30, 2021 | Sinch agrees to buy Pathwire (Mailgun, Mailjet, Email on Acid) at an enterprise value of $1.9 billion | Email for Sinch | Email becomes the strongest part of its API platform, per its 2025 results |
| July 21, 2022 | Ericsson completes its acquisition of Vonage | A network vendor bets on network APIs | Two impairments within two years |
| February 1, 2024 | MessageBird rebrands as Bird and cuts SMS prices by 90% | Price as a weapon against Twilio | A price war on a product with carrier fees as its floor |
| 2025 to 2026 | Carriers raise A2P fees (Verizon, T-Mobile); the FCC removes over 1,200 voice providers from the Robocall Mitigation Database | Carriers recover cost of spam control; the FCC enforces call authentication | Margin pressure for platforms and new compliance gates ([Voice Platforms](/books/hosting-and-cloud/voice-platforms#the-robocall-mitigation-database)) |

Two threads run through the table. The first is that the API abstraction never removed the carrier: every layer of carrier control added since 2020 (registration, surcharges, throughput caps, fines) passes straight through the platform to its customers. The second is that the bundle kept growing. Twilio, Sinch and Bird all bought an email company, Vonage was bought by an equipment vendor, and Ericsson's Aduna venture (with twelve operators, live in the US, Germany, Spain, Canada, France and the Netherlands as of March 3, 2026) is the carriers' own attempt to sell network APIs directly.

## Owned Network Versus Aggregator

The basic choice is how much of the path to own. A CPaaS can be a carrier, can buy from carriers directly, or can buy from someone who does:

| Model | What the provider holds | Strengths | Failure modes | Who does it |
| --- | --- | --- | --- | --- |
| **Owned network** | Carrier authorization, its own numbering resources, switches, interconnects with other carriers, often its own 911 routing | Lower cost of goods per unit, control over porting and number inventory, direct carrier relationships, regulatory standing to get numbers directly | Capital and regulatory burden: state certifications, 911, CPNI, USF, robocall rules all apply directly; a DDoS on the network is the provider's outage | Bandwidth ("authorized to provide competitive local exchange telecommunications services in 49 states and the District of Columbia"); Telnyx says it owns its switch (vendor claim) |
| **Direct-connect aggregator** | Contracts and SMPP or SIP connections with many carriers, plus some numbering from partners | Breadth across countries; can route around a failed or expensive carrier | Each connection is a contract to negotiate and a fee schedule to track; quality varies by country | Infobip ("800+" operator connections), Sinch |
| **Software aggregator** | A routing and orchestration layer over owned-network providers and aggregators | Fastest to build; developer experience as the product; least capital | Thinnest margin; the upstream provider's outage, fee change or policy is the platform's; little control over numbers | Twilio describes a "Super Network" software layer that "continually analyzes billions of data points to optimize the quality and cost of communications" (filing language, marketing tone) |
| **Reseller or ISV** | Accounts at one or more CPaaS, with its own customers registered as brands under it | No telecom footprint at all | Every rule of the CPaaS and the carriers applies, and the ISV answers for its customers' registrations | Most software companies that text: see [Accounts, Organizations & Resellers](/books/hosting-and-cloud/accounts-and-resellers#resellers-and-white-label) |

The line moves. Twilio bought Zipwhip partly for "direct connections to carriers ... including onboarding, gateway, registry and spam detection," a step toward owning more of the path; Bandwidth sells an orchestration layer (Maestro) for third-party voice, contact center, AI and fraud tools, a step toward software. Many providers are both: owned network in the US, aggregator abroad.

What owning buys is visible in the filings. Bandwidth's non-GAAP gross margin was 58% in 2025 against a GAAP gross margin of 39%; Twilio's GAAP gross margin was 49%. The two aren't comparable line for line (Bandwidth's non-GAAP figure excludes, among other items, the dilution from surcharges), but the owned-network provider keeps more of each dollar of its own service revenue, and gives up the breadth and the developer base.

## How the Money Is Made

CPaaS revenue is overwhelmingly usage. Twilio recognizes messaging, voice, user authentication and identity revenue on usage, and email and Segment on subscription; usage-based revenue was 74% of its 2025 total, up from 71% in 2023. Bandwidth separates recurring cloud communications fees ($146.9 million in 2025) from usage. The units:

| Unit | What is billed | Example list prices, as of October 2026 |
| --- | --- | --- |
| **Per segment** | Each SMS segment, outbound and inbound (a long message is several segments; [Sending a Text](/books/hosting-and-cloud/sending-a-text#segments-and-encoding)) | Twilio $0.0083 per US SMS segment on long code, toll-free and short code; Plivo $0.0077 on long code and short code, $0.0079 on toll-free |
| **Per message** | MMS, RCS rich media | Twilio $0.022 per outbound MMS; Plivo $0.018 to $0.02 per MMS and $0.018 per RCS rich media message |
| **Per minute** | Voice, origination and termination | Priced per country and number type |
| **Per number per month** | Local, toll-free, short code leases | Twilio $1.15 a month for a local number and $2.15 for toll-free; Plivo $0.50 and $1.00 |
| **Per registration** | Brand registration, vetting, monthly campaign fees, verification | Pass-through at cost (Telnyx) or marked up; [Business Texting Registration](/books/hosting-and-cloud/texting-registration#what-registration-costs) |
| **Per carrier fee** | The recipient carrier's surcharge on each message | A pass-through line; see below |
| **Per failure** | A message that ends in a failed state | Twilio charges $0.001 per failed message |
| **Per verification** | A completed one-time-passcode verification, as a product above raw SMS | Priced per verification on verification products |

Usage revenue moves with the customer's own business, which is why the providers report net expansion rather than seat counts. Twilio's dollar-based net expansion rate was 108% for 2025 (103% in 2023); Bandwidth's net retention rate was 98% in 2025 after 122% in 2024, with 12-month customer retention above 98.8%. Concentration is real but bounded: Twilio's top ten active customer accounts produced 9% of 2025 revenue, and Bandwidth had no customer above 10%. Twilio's definition of an active customer account (at least $5 of revenue in the last month of the period) is a reminder that most accounts are small.

### Pass-Through Fees and the Margin

The defining fact of the business is that a rising share of the invoice is someone else's money. Since 2020, US carriers have charged a per-message fee on application-to-person traffic, varying by carrier, direction, number type, message type and registration status, and they change it. Twilio's 10-K says passing network-provider fees to customers "typically increases revenue and cost of revenue," leaving gross profit dollars flat while gross margin falls, that fees "in some markets ... change daily or weekly," and that "recent increases to A2P messaging fees charged by major U.S. mobile carriers" are expected to pressure margins modestly. Bandwidth says it passes new A2P carrier fees to customers and that this is "not expected to impact the gross profit"; it reports messaging surcharges as a separate revenue line, $192.4 million in 2025 (down 8% from $208.7 million in 2024), a quarter of total revenue.

The fees themselves are a dated table, not a constant. The same carrier fee appears at different amounts depending on the provider and the date:

| Recipient carrier (registered 10DLC SMS) | Telnyx table, July 22, 2025 | Bandwidth, effective date shown | Twilio list, October 2026 | Plivo list, October 2026 |
| --- | --- | --- | --- | --- |
| T-Mobile, outbound | $0.003 | $0.0045 from January 19, 2026 | $0.0045 | $0.0045 |
| T-Mobile, inbound | $0.003 | $0.0025 from January 19, 2026 | $0.0025 | $0.0025 |
| AT&T, outbound | $0.003 | Not captured | $0.0035 | $0.0035 |
| Verizon, outbound | $0.0045 | $0.0045 from May 1, 2026; $0.0050 from October 1, 2026 | $0.005 | $0.0050 |

The table is a snapshot of what each provider published, as of October 2026; providers announced the T-Mobile change with different dates (Twilio says T-Mobile first planned January 15 and the change took effect January 19, 2026), and Vonage's pass-through table dates the other 2026 changes: AT&T to $0.0035 per SMS and $0.0090 per MMS from April 1, 2026, and Verizon to $0.0045 per SMS and $0.0070 per MMS from May 1, 2026. The platform's own price book has to record the effective date of each change it receives. Carriers also fine the platform for its customers' violations ([Sending a Text](/books/hosting-and-cloud/sending-a-text#filtering-and-carrier-fines)), and the FCC and USAC add regulatory fees on voice ([911, CPNI & Telecom Duties](/books/hosting-and-cloud/telecom-duties#universal-service-and-regulatory-fees)). Both are pass-through too.

### Margin Pressure

Four forces push the margin down, and the filings name most of them:

- **Surcharges.** Each carrier fee increase raises revenue and cost by the same amount, so the percentage falls even when nothing else changes. Twilio's non-GAAP gross margin went from 53% in 2023 and 2024 to 51% in 2025.
- **Mix.** Twilio says international messages carry a lower gross margin than domestic ones. Growth abroad dilutes.
- **Price competition.** Bird's 90% SMS price cut in February 2024 was aimed at Twilio with a "your margins are my opportunity" campaign. The floor is the carrier fee: no provider can sell a US text below what the recipient's carrier charges for it.
- **Carriers selling around the platform.** Network APIs sold by operators (Aduna, and Ericsson's stated rationale for buying Vonage, "create a market for easy to adopt global network Application Program Interfaces") are an attempt to capture value the CPaaS layer holds today.

The response across the providers is the same: move up the stack into products priced per outcome rather than per unit (verification, contact center, customer data, AI agents), and treat raw messaging as the volume that feeds them. Sinch says its API platform's strength is "predominately powered by our messaging and email solutions"; Twilio's revenue now includes Segment's subscription revenue in one segment with communications.

### The Risks the Filings Name

The 10-K risk factors are a map of the rest of this part: TCPA class actions as the most common private enforcement (Twilio), 911 tax and surcharge litigation in California and Illinois (Bandwidth), carrier fee changes, fraud through artificially inflated traffic (Twilio names its Verify Fraud Guard product "aimed at automatically blocking fraudulent messages resulting from artificially inflated traffic or SMS pumping"), and outages. Bandwidth's late-September 2021 incident is the public example of the last: "a series of sophisticated DDoS attacks aimed at Bandwidth and our industry" cost it about $0.7 million of third-quarter revenue and an estimated $9 million to $12 million of full-year CPaaS revenue, in lost volume and credits.

## My Default

My default for a software company that needs to text or call is to be a customer or ISV on a CPaaS, with a second provider wired in for failover, and not to become a carrier to save on cost of goods: the recipient carrier's fee is the floor under every model, and the duties an owned network takes on (state certifications, 911, CPNI, USF, the robocall rules) are a business of their own. For a company building a CPaaS, I'd start as a software aggregator over one owned-network upstream per country and own more of the path only where the margin difference above pays for the regulatory burden, starting with numbers and porting in the home market. In either role I'd carry carrier fees as dated pass-through lines the customer sees, never folded into the per-segment price, because they changed several times in 2026 alone and a bundled price turns each change into lost margin or a repricing.

What would change it: enough steady volume in one country that the lower cost of goods per unit outweighs the regulatory burden, which is the trade Bandwidth's owned network in 49 states and DC makes.

## How to Build It

The chapter adds carriers and the rules that map a message to the carrier fee it owes, on top of [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Carrier fees are SKUs with `pass_through = 'carrier'`, priced with ordinary `price_versions`, so they are effective-dated and separable on every invoice like a registry fee. Fines and regulatory fees use the same mechanism with `pass_through = 'carrier'` or `'regulatory'`.

```sql
CREATE TABLE carriers (                  -- the networks a message or call terminates on
  id            TEXT PRIMARY KEY,        -- 'us.tmobile', 'us.verizon', 'us.att', 'gb.vodafone'
  name          TEXT NOT NULL,
  country       CHAR(2) NOT NULL,
  ocn           TEXT,                    -- Operating Company Number, where assigned
  network_kind  TEXT NOT NULL CHECK (network_kind IN ('mobile', 'wireline', 'voip',
                  'cable', 'mvno')),
  parent_id     TEXT REFERENCES carriers (id),  -- an MVNO's host network
  connection    TEXT NOT NULL CHECK (connection IN ('direct', 'via_upstream', 'owned')),
  status        TEXT NOT NULL CHECK (status IN ('active', 'degraded', 'retired'))
);

CREATE TABLE upstream_providers (        -- whom the platform buys a route from
  id            TEXT PRIMARY KEY,        -- an owned-network CPaaS, an aggregator, a carrier
  name          TEXT NOT NULL,
  channels      TEXT[] NOT NULL,         -- 'sms', 'mms', 'rcs', 'voice'
  contract_ref  TEXT
);

CREATE TABLE carrier_fee_rules (         -- which carrier fee SKU a message owes
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  carrier_id       TEXT NOT NULL REFERENCES carriers (id),
  channel          TEXT NOT NULL CHECK (channel IN ('sms', 'mms', 'rcs', 'voice')),
  direction        TEXT NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  number_type      TEXT NOT NULL CHECK (number_type IN ('local', 'toll_free', 'short_code',
                     'mobile', 'national')),
  registration     TEXT NOT NULL CHECK (registration IN ('registered', 'unregistered',
                     'not_applicable')),
  sku_id           UUID NOT NULL REFERENCES skus (id),  -- pass_through = 'carrier'
  notice_ref       TEXT,                 -- the upstream or carrier notice it came from
  valid_during     TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (carrier_id WITH =, channel WITH =, direction WITH =,
    number_type WITH =, registration WITH =, valid_during WITH &&)
);

ALTER TABLE skus
  ADD COLUMN carrier_id TEXT REFERENCES carriers (id);  -- set on carrier fee SKUs
```

A carrier fee SKU looks like `sms.us.carrier.tmobile.outbound.registered`, unit `segment` (or `message` for MMS), `charge_kind = 'usage'`, `pass_through = 'carrier'`. When T-Mobile changes its fee, the platform closes the old `price_versions` row and opens a new one from the effective date, with `announced_at` set to when the platform received the notice, and it does the same in its own reseller price book if it sells wholesale. A message sent at 23:59 the day before the change rates at the old fee even if the usage pipeline sees it a day late.

Rating a message produces two or more `rated_usage` rows: the provider's own per-segment SKU and the carrier fee SKU found through `carrier_fee_rules` for the recipient's carrier at send time. The recipient's carrier is a fact captured when the message was sent (from a number portability lookup, since a ported number's carrier isn't the one its prefix suggests) and carried on the usage event's `dimensions`:

```sql
-- A sent message's usage event, as the messaging service emits it
INSERT INTO usage_events (source, idempotency_key, account_id, resource_id, meter,
                          quantity, dimensions, occurred_during)
VALUES ('messaging.sender', 'msg_01JB...:segments', $account, $number_resource,
        'sms.segments', 3,
        '{"carrier": "us.tmobile", "direction": "outbound", "number_type": "local",
          "registration": "registered", "country": "US", "encoding": "UCS-2"}',
        tstzrange($sent_at, $sent_at, '[]'));
```

Notes on the sketch:

- **The carrier is resolved at send time and frozen.** Numbers port between carriers, so the fee owed follows the carrier that held the number when the message went out, the same "held at the instant" rule the core model uses for IP addresses.
- **One rule table, many fee shapes.** Direction, number type, channel and registration status are the dimensions the providers' fee tables use; a carrier that charges unregistered traffic more, or charges inbound, is a row rather than a branch in code.
- **Pass-through reconciles both ways.** Carrier and upstream invoices arrive later with their own counts. Keep the upstream's invoice lines, match them to the platform's rated carrier fees by carrier, month and SKU, and report the difference: a gap means either the lookup was wrong, the fee table was stale or the upstream billed something it shouldn't have.
- **Revenue and pass-through stay separate in every report.** Gross margin on the platform's own SKUs and gross margin including pass-through are both reported, because the second falls whenever a carrier raises a fee.
- **Prepaid balances are a ledger, not a cache.** Many CPaaS accounts are prepaid with auto-recharge. Twilio's July 18, 2013 billing incident is the public lesson: a network event made all billing Redis replicas resync at once, a restart loaded the wrong configuration and dropped balances, and auto-recharge charged cards repeatedly without recording the new balance, affecting 1.4% of customers. Twilio's fixes were a double-entry ledger of record, real-time validation against it, and fail-safes against charging when a balance can't be written. Balances in this model are sums of ledger entries ([Payments](/books/payments/card-payments#the-core-data-model)), and a recharge that can't record its result doesn't run.
- **Events:** `carrier_fee.changed`, `carrier.degraded`, `upstream_invoice.reconciled` and `usage.rated` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to billing, the status page and the routing layer. Rating mechanics and price catalogs are owned by [Metering & Rating](/books/hosting-and-cloud/metering-and-rating) and [Pricing Catalogs](/books/hosting-and-cloud/pricing-catalogs) in the Metering and Billing part.

## Auditing

- **Every carrier fee and its source.** Each `carrier_fee_rules` row and price version with the notice it came from and its effective date, so a customer disputing a surcharge can be shown the carrier's change.
- **The carrier each message was rated against,** captured at send time, so a re-rating months later uses the same carrier.
- **Pass-through collected against pass-through paid,** by carrier and month, because carriers and upstreams reconcile against their own counts and auditors will ask why the two differ.
- **Balance changes as ledger entries,** with the recharge that funded them, so a double charge can be proved or disproved.

## What This Means for the System You Build

- **Decide what you own.** Owning a network buys margin and control at the price of every telecom duty; aggregating buys breadth and speed at the price of margin. Most providers do both by country.
- **Treat carrier fees as effective-dated pass-through SKUs,** keyed by carrier, direction, number type, channel and registration, never as a constant in the price.
- **Resolve the recipient's carrier at send time** from a portability lookup and freeze it on the usage event.
- **Report margin with and without pass-through,** or the business will look like it is shrinking every time a carrier raises a fee.
- **Reconcile against the upstream invoice** monthly, by carrier and SKU.
- **Keep prepaid balances in a ledger** and refuse to charge when the result can't be recorded.
- **Expect the floor to move:** price competition stops at the carrier fee, and carriers are selling APIs of their own.

## References

**Filings and company releases**

- [Twilio: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1447669/000144766926000021/twlo-20251231.htm), revenue, usage-based share, active customer accounts and definition, net expansion, gross margins, concentration, one segment, carrier fee pass-through and margin pressure, international margin, Verify Fraud Guard, TCPA risk, "Super Network" language
- [Twilio: Q4 2025 results (8-K Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1447669/000144766926000010/twloq425ex991.htm), fourth-quarter revenue and net expansion
- [Twilio: Form S-1 (2016)](https://www.sec.gov/Archives/edgar/data/1447669/000104746916013448/a2227414zs-1.htm), incorporation in March 2008 and first product in 2008
- [Twilio: Pricing of initial public offering](https://twilio.com/en-us/press/releases/twilio-announces-pricing-of-initial-public-offering), $15 a share, NYSE trading from June 23, 2016
- [Twilio: SendGrid acquisition announcement (8-K exhibit)](https://www.sec.gov/Archives/edgar/data/0001447669/000110465918062222/a18-36722_1ex99d1.htm), the all-stock deal valued at about $2 billion
- [Twilio: SendGrid acquisition completed (8-K exhibit)](https://www.sec.gov/Archives/edgar/data/1447669/000110465919005275/a19-3826_1ex99d1.htm), completion on February 1, 2019, about $3 billion
- [Twilio completes acquisition of Zipwhip (release reprint)](https://futurumgroup.com/news/twilio-completes-acquisition-of-zipwhip-a-leading-provider-of-toll-free-messaging-in-the-united-states), completion on July 14, 2021, about $850 million, direct carrier connections
- [Bandwidth: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1514416/000151441626000017/band-20251231.htm), revenue, messaging surcharges, recurring fees, segment growth, pass-through, margins, retention, CLEC authorization, 911 in 42 countries, Maestro
- [Bandwidth: Form 10-K for 2017](https://www.sec.gov/Archives/edgar/data/0001514416/000151441618000003/bandwidthinc10-k123117doc.htm), founded July 2000
- [Bandwidth: Pricing of initial public offering](https://bandwidth.com/newsroom/bandwidth-inc-announces-pricing-of-initial-public-offering), $20 a share, Nasdaq trading from November 10, 2017
- [Bandwidth: Preliminary Q3 2021 revenue and DDoS impact](https://www.bandwidth.com/newsroom/bandwidth-announces-preliminary-third-quarter-2021-revenue-results-exceeding-guidance-and-estimated-full-year-revenue-impact-of-ddos-attack/), the September 2021 attacks and their revenue impact
- [Sinch: Fourth quarter and full year 2025 results](https://www.group.sinch.com/media/press-releases-and-news/2026/sinch-reports-fourth-quarter-and-full-year-2025-results--strengthened-financial-performance-and-continued-market-leadership/), net sales, organic growth, customers, messaging and email as the API platform's strength
- [Sinch: CLX Communications rebrands as Sinch (PDF)](https://www.group.sinch.com/files/Main/22250/3755580/20190213_clx_rebrands_as_sinch_eng.pdf), the February 13, 2019 rebrand
- [Vonage: Agreement to acquire Nexmo (PDF)](https://s29.q4cdn.com/651905246/files/doc_news/2016/05/05/vonageholdingscorptoacquirenexmoincsecon.pdf), $230 million in cash and stock, May 5, 2016
- [Vonage: Form 10-K for 2020](https://www.sec.gov/Archives/edgar/data/1272830/000127283021000087/vg-20201231.htm), founded in 2001 as a VoIP home phone company
- [Ericsson: Completes acquisition of Vonage](https://www.ericsson.com/en/press-releases/2022/7/ericsson-completes-acquisition-of-vonage), closing on July 21, 2022 and the network API rationale
- [Ericsson: Impairment charge of SEK 32 billion](https://www.ericsson.com/en/press-releases/2023/10/ericsson-announces-impairment-charge-of-sek-32-billion-and-provides-update-on-q3-earnings), the Q3 2023 Vonage impairment
- [Ericsson: Second quarter results 2024](https://www.ericsson.com/en/press-releases/2024/7/ericsson-reports-second-quarter-results-2024), the SEK 11.4 billion impairment mainly related to Vonage
- [Aduna: Network API availability (March 3, 2026)](https://tools.prnewswire.com/en-us/live/20823/release/20260303EN98152), the operators and countries live

**Pricing and fees**

- [Twilio: SMS pricing for the United States](https://www.twilio.com/en-us/sms/pricing/us), per-segment and MMS prices, carrier fees, the failed message fee, number prices
- [Plivo: SMS pricing for the United States](https://www.plivo.com/sms/pricing/us/), per-segment, MMS and RCS prices, carrier surcharges, number prices
- [Telnyx: 10DLC fees and charges](https://support.telnyx.com/en/articles/5634625-10dlc-fees-and-charges), carrier per-message fees as of July 22, 2025
- [Bandwidth: Carrier surcharges](https://www.bandwidth.com/support/en/articles/12823178-carrier-surcharges), T-Mobile and Verizon fees with effective dates
- [Twilio: T-Mobile messaging carrier fee changes, January 2026](https://support.twilio.com/hc/en-us/articles/44609260499995-T-Mobile-Messaging-Carrier-Fee-Changes-January-2026), effective January 19, 2026 after a planned January 15, and $0.0045 outbound SMS
- [Vonage: SMS/MMS pass-through fee changes](https://api.support.vonage.com/hc/en-us/articles/5672262029084), updated April 7, 2026, the AT&T (April 1, 2026), Verizon (May 1, 2026) and T-Mobile (January 19, 2026) changes

**In practice**

- [Telnyx: Global communications](https://telnyx.com/global-communications), licensed countries, owned switch and network (vendor claims)
- [Infobip: Media kit](https://www.infobip.com/media-kit), founding and operator connections (vendor claims)
- [ICT Business: Infobip 2024 results](https://www.ictbusiness.biz/business/infobip-strengthend-its-financials-in-2024), revenue and net loss reported from the UK filing
- [TechCrunch: MessageBird rebrands as Bird and slashes SMS prices by 90%](https://techcrunch.com/2024/02/01/messagebird-rebrands-as-bird-and-slashes-prices-by-90-on-sms-to-take-on-twilio), the February 2024 price cut
- [TechCrunch: Twilio launches in private beta (2008)](https://techcrunch.com/2008/11/20/twilio-powerful-api-for-phone-services-that-can-recreate-grandcentral-in-15-lines-of-code/), November 20, 2008
- [TechCrunch: Twilio adds SMS (2010)](https://techcrunch.com/2010/02/09/twilio-sms-api/), February 9, 2010
- [TechCrunch: Sinch acquires Pathwire](https://techcrunch.com/2021/09/30/sinch-acquires-pathwire-the-company-behind-mailgun-and-mailjet-for-1-9b-to-add-email-into-its-api-based-communications-platform), the $1.9 billion deal
- [PYMNTS: MessageBird to acquire SparkPost](https://www.pymnts.com/news/partnerships-acquisitions/2021/messagebird-acquire-sparkpost-600-million-dollars/), the April 28, 2021 announcement
- [Twilio: Billing incident post-mortem (2013)](https://www.twilio.com/en-us/blog/billing-incident-post-mortem-breakdown-analysis-and-root-cause-html), the Redis balance failure and the ledger remedy
- [Vodafone: 25 years of the text message](https://www.vodafone.com/news/newsroom/technology/25-anniversary-text-message), the first text on December 3, 1992
- [NANPA: 2025 Annual Report (PDF)](https://www.nanpa.com/sites/default/files/2026-03/2025_NANPA_AnnualReport_FINAL.pdf), the NANP's origin in 1947
- [NANPA: About](https://www.nanpa.com/about), implementation of the plan from 1951
