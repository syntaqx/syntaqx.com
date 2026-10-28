+++
title = "Sending a Text"
description = "What happens after a send call: encoding and segments, throughput by carrier and brand, delivery receipts, STOP at the platform, filtering and carrier fines."
category = "Hosting & Cloud Industry"
order = 2182
part = "Communications Platforms"
tags = ["sms", "messaging", "throughput", "delivery-receipts", "opt-out", "carriers"]
+++

A send call to a CPaaS looks like one request: a from number, a to number and a body. Behind it the platform has to decide what the message costs before it leaves (how many segments, in which encoding), whether the sender may send it now (which campaign the number belongs to, how much of each carrier's limit is left), which carrier the recipient is on (a lookup, since numbers port), whether the recipient has opted out of this sender, and which upstream route to use. After it leaves, the platform waits for the carrier to say what happened, translates the answer into a status and an error code the customer can act on, bills the segments and the carrier's fee, and handles a STOP reply that arrives minutes later. When the carrier decides the content was spam, the platform may be fined, and it passes the fine on.

This chapter follows a text through that path from the platform's side: how the format came to be, segments and encoding, throughput, delivery receipts and errors, opt-outs at the platform layer, filtering and carrier fines, and how to model messages. It assumes the sender is registered ([Business Texting Registration](/books/hosting-and-cloud/texting-registration)) and leaves the law of consent and revocation to the playbook ([TCPA Consent](/docs/compliance/consumer-contact#tcpa-consent), [Revoking Consent](/docs/compliance/consumer-contact#revoking-consent)) and the application's outbound gate and message log to [Notifications & Consent](/docs/architecture/notifications#one-outbound-gate).

## How the Providers Do It

The providers expose the same lifecycle with different names and error vocabularies. As of October 2026:

| Provider | Encoding | Status and errors | Platform-level opt-out | Fees on failure |
| --- | --- | --- | --- | --- |
| **Twilio** | GSM-7 and UCS-2; "Smart Encoding" substitutes GSM look-alikes for common Unicode characters; long messages capped at 1,600 characters | Status callbacks per message; errors such as 30007 (filtered), 30032 (toll-free number not verified) and 21610 (recipient replied STOP) | Handles STOP and START keywords on its numbers and rejects sends to opted-out recipients with 21610 | $0.001 failed message processing fee; blocked toll-free messages still billed |
| **Telnyx** | Per-segment billing | Per-message status | Not captured | Passes carrier non-compliance fines through, with a published schedule |
| **Plivo** | Per-segment billing | Per-message status | Not captured | Lists carrier surcharges per direction, inbound and outbound |
| **Bandwidth** | Per-segment billing | Per-message status | Not captured | Reports messaging surcharges as their own revenue line |

The vocabulary differs, the shape doesn't: a message is accepted, queued, sent to the carrier, and ends delivered, undelivered or failed, with a reason code that decides whether the customer should retry, fix its registration, or stop texting that person.

## How It Got Here

SMS was designed as a signaling side channel for people's phones, and every property that makes business texting awkward today comes from that design:

| Date | Step | What it solved | What it cost |
| --- | --- | --- | --- |
| December 3, 1992 | The first text, "Merry Christmas," sent from a computer to a phone over Vodafone's network | Short messages on the control channel of every handset | A hard limit of 140 octets per message |
| April 28, 1999 | 3GPP publishes version 1.0.0 of TS 23.040 (the SMS technical realization, from GSM 03.40) and TS 23.038 (its alphabets) | 160 characters in 140 octets, and concatenation of longer messages with a user data header | 153 characters per concatenated part; anything outside the 7-bit alphabet halves the capacity |
| February 9, 2010 | Twilio adds SMS to its API | Texting from application code | Business traffic on a channel built for people, at volumes carriers hadn't planned for |
| 2020 to 2025 | Carriers add registration, per-message fees, throughput caps and content filtering, and block unregistered traffic | Spam control | Every send becomes a lookup, a limit check and a fee |
| May 2023 | CTIA's Messaging Principles and Best Practices updated | Written carrier expectations for message types, opt-in and opt-out | Filtering and fines judged against it |
| 2026 | RCS business messaging billed per message category, falling back to SMS | Rich messages where supported | Two channels to rate and track for one conversation |

The ETSI version of TS 23.040 states the limits plainly: messages "contain up to 140 octets"; with the 7-bit default alphabet a concatenated part holds "153 (160-7) characters," and with 8-bit data "134 (140-6) octets." Everything a platform bills by the segment follows from those two sentences.

## Segments and Encoding

A message is split into segments, and every provider bills per segment. The encoding decides how many characters fit:

| Encoding | Single segment | Per segment when concatenated | When it applies |
| --- | --- | --- | --- |
| **GSM-7** | 160 characters | 153 | Every character is in the GSM 7-bit default alphabet |
| **UCS-2** | 70 characters | 67 | Any character outside the GSM alphabet, including one emoji, switches the whole message |
| **8-bit data** | 140 octets | 134 | Binary payloads; rare in A2P |

The consequences for the platform:

- **One character changes the price.** A 150-character reminder is one segment; the same reminder with a smart quote or an emoji is three. Twilio's Smart Encoding substitutes GSM look-alikes for common Unicode characters to keep messages in GSM-7. Whether to do this silently is a product decision: it changes the text the customer wrote.
- **Count before sending.** Segment count is known at accept time, so the platform can return it, check it against the sender's balance or spending limit, and count it against carrier caps that are measured in segments.
- **Cap the length.** Twilio caps messages at 1,600 characters; a cap keeps a template bug from sending a hundred-segment message to every customer.
- **MMS is per message, not per segment,** and carries its own carrier fee and throughput limit.

The core model records this as a usage event on the meter `sms.segments` with the encoding, carrier, direction, number type and registration status as dimensions ([The CPaaS Business](/books/hosting-and-cloud/cpaas-business#how-to-build-it)).

## Throughput

A US text is limited on several scopes at once, and each is set by someone different:

| Scope | Who sets it | Unit | Example, as of October 2026 |
| --- | --- | --- | --- |
| **Campaign, on AT&T** | AT&T, from the brand's vetting score | Messages per minute | 4,500 a minute for a score of 75 to 100; 240 unvetted; 75 for Low-Volume Mixed; 15 for a sole proprietor |
| **Brand, on T-Mobile** | T-Mobile, from the vetting score | Segments per day | 200,000 for 75 to 100; 2,000 unvetted; 1,000 for a sole proprietor |
| **Brand, MMS, per carrier** | The platform, from trust score (Twilio) | Messages per second | 40 for 75 and above, 20 for 50 to 74, 5 under 50; 0.5 per number for a sole proprietor |
| **Number, toll-free** | The verification | Messages per second | Up to 20 once verified (Telnyx) |
| **Verizon** | Verizon | None published | Filters on content instead |
| **Upstream route** | The upstream provider's contract | Requests or messages per second | Per contract |
| **Account** | The platform | Requests per second | Per plan |

So the sender needs token buckets at every scope a message touches, counted in the unit that scope uses: an AT&T recipient draws from the campaign's per-minute bucket, a T-Mobile recipient from the brand's daily segment bucket, an MMS from the brand's per-second bucket, and every message from the number's and the account's. The carrier is known only after the lookup, so the order is: resolve the recipient's carrier, then check the buckets for that carrier.

What happens at the limit is the platform's choice, and it should be explicit. Exceeding a carrier's limit risks filtering or rejection at the carrier, so the platform should hold the message in its own queue rather than send it, with a maximum age after which it fails with a clear error instead of arriving hours late. A one-time passcode that arrives after ten minutes is worse than one that fails, because the user has already given up. My default is per-message priority and a time-to-live set by the customer, with passcodes and alerts ahead of marketing in every queue they share.

## Delivery Receipts and Errors

Once the platform hands a message to a carrier or upstream, it learns what happened only from delivery receipts (DLRs), which arrive asynchronously, sometimes per segment, sometimes late and occasionally never. The platform's status model turns them into one lifecycle:

1. **Accepted:** the API validated the request and assigned a message ID.
2. **Queued:** waiting on throughput or scheduling.
3. **Sent:** handed to the carrier or upstream.
4. **Delivered:** the carrier reported delivery to the handset.
5. **Undelivered or failed:** the carrier, the upstream or the platform reported a final failure, with a code.

Error codes are the product. They tell the customer whether to retry (a transient carrier error), to fix something (an unregistered or unverified number, a campaign mismatch), or to stop (the recipient opted out, the number isn't textable). Twilio's codes illustrate the classes: 30007 for a message filtered as spam, 30032 for a toll-free number that isn't verified, 21610 for a recipient who replied STOP. The playbook's sender treats the first group as transient and the last as permanent ([Providers and Their Errors](/docs/architecture/notifications#providers-and-their-errors)); the platform's job is to make that classification possible by mapping every carrier and upstream code to a stable, documented code of its own.

Failures cost money too. Twilio charges $0.001 for a message that ends in a failed state, and messages blocked for toll-free verification are still billed. A platform has to decide which of its own failures it bills (a message it rejected before sending should not cost the customer anything) and which carrier charges it passes through.

Status callbacks to the customer are webhooks with all the usual properties: retried, at least once, out of order. Each carries the message ID and a status sequence number so the customer can discard an older status that arrives after a newer one ([Webhooks](/docs/api-design/webhooks)).

## STOP at the Platform

Carriers expect opt-out keywords to work on every A2P number, whatever the sender's application does. CTIA's guidance asks for standard STOP wording, honoring normal-language requests, and one final confirmation with nothing after ([Texting: The Carrier Layer](/docs/compliance/consumer-contact#texting-the-carrier-layer)). Most platforms therefore handle STOP, START and HELP themselves, at the number or messaging service level:

- **STOP** (and its variants) records an opt-out for that recipient against that sender, sends the campaign's confirmation, and from then on rejects sends to the recipient from that sender with a permanent error (Twilio's 21610).
- **START** (or the campaign's opt-in keyword) lifts the platform's opt-out.
- **HELP** replies with the campaign's registered help text.
- **The inbound message is still delivered** to the customer's webhook, so the customer's own consent ledger can record the revocation. The platform's suppression is a backstop; the application's ledger is the system of record, as the playbook puts it.

Scope is the hard part. A platform-level opt-out keyed to the sending number is too narrow when a customer uses a pool of numbers for one campaign, and too broad when an ISV puts several of its customers behind one messaging service. My default is to key the platform's opt-out by brand and recipient, because that is the party the recipient was hearing from, and to expose the opt-out list to the customer by API. The FCC's revocation rules, including the scoped revocations allowed from November 25, 2026, are the application's to apply ([Revoking Consent](/docs/compliance/consumer-contact#revoking-consent)); the platform's keyword handling has to be at least as broad as the narrowest rule any of its customers relies on.

## Filtering and Carrier Fines

Registration says what a campaign may send; filtering checks whether it did. Carriers and their vendors filter on content and behavior: messages that don't match the registered use case, links on shared shortener domains, SHAFT content (sex, hate, alcohol, firearms, tobacco, and in practice cannabis), and phishing. Filtered messages fail with a code like Twilio's 30007, and the platform rarely learns the exact rule that fired.

Carriers also fine the platform for its customers' violations, and the platform passes the fines on. Telnyx publishes the pass-through schedule it applies:

| Violation | Fine, as published by Telnyx |
| --- | --- |
| Text-enabling a NANP number without verifying authority over it | $10,000 |
| Phishing or smishing | $2,000 |
| Third or later content violation | $10,000 |
| Long code program evasion (snowshoeing across numbers to evade limits) | $1,000 |
| Illegal content, including cannabis | $1,000 |
| Other SHAFT content | $500 |

The fines explain several platform rules. Text-enabling a number requires proof the customer controls it ([Phone Numbers & Porting](/books/hosting-and-cloud/phone-numbers-and-porting#where-a-platform-s-numbers-come-from)). Number pools larger than a campaign needs are suspicious, because spreading traffic across numbers to stay under limits is itself a violation. And the platform's terms must let it pass a fine to the customer whose traffic caused it, with the carrier's notice attached, which in turn means every message must be traceable to the brand, campaign and number it was sent under.

A platform also filters for itself, because a carrier fine or a mass block of its routes hurts every customer. The tools are the ones in [Telecom Fraud](/books/hosting-and-cloud/telecom-fraud) and the abuse desk: sudden volume on a new account, links to newly registered domains, content that doesn't match the campaign, high opt-out rates. A first finding should throttle or hold the campaign, not the account, the same narrowest-action rule abuse desks use ([Suspension Versus Takedown](/books/user-generated-platforms/abuse-desks#suspension-versus-takedown)).

## When Delivery Breaks

Delivery failures are often carrier-specific, and customers need to know which carrier. Twilio's status page shows the pattern: "SMS and MMS Delivery Delays from Twilio to Verizon United States," first posted May 27, 2026 at 10:13 PDT and resolved May 28 at 22:54 PDT, about 36.7 hours, affecting long code, short code, toll-free and Zipwhip traffic, with updates saying the cause was identified and no further detail. A status page for a CPaaS needs components per carrier and per number type, and the sender needs to keep accepting and queueing during a carrier delay rather than failing, within each message's time-to-live. Status page design is in [Outages, Post-Mortems & Status Pages](/books/hosting-and-cloud/outages-and-status-pages#status-pages) in the Running the Provider part.

## The Alternatives

The design choice that matters most is where throughput and opt-out are enforced:

| Approach | Model | Strengths | Failure modes |
| --- | --- | --- | --- |
| **Pass through to the upstream** | Send as fast as the customer asks; let the upstream or carrier enforce | Simplest | Carrier rejections and filtering hit the customer as errors; the platform can't prioritize; fines for evasion |
| **Reject at the API** | Return a rate-limit error when a bucket is empty | Clear to the customer; no queue to run | Pushes queueing onto every customer; bursty senders fail |
| **Queue at the platform** | Accept, queue per scope, send within limits, expire by time-to-live | Customers send naturally; priority across message types | A queue to operate; messages can arrive late if TTLs are long |
| **Opt-out only in the application** | The platform forwards STOP and keeps no list | No duplicate state | A customer bug keeps texting opted-out people, and the carrier fines the platform |
| **Opt-out at the platform as a backstop** | The platform suppresses and forwards | Carriers' expectation met regardless of customer bugs | Scope must be chosen carefully (number, brand, campaign) |

My default is to queue at the platform with per-message priority and time-to-live, and to keep a platform-level opt-out keyed by brand and recipient as a backstop, forwarded to the customer so the application's ledger stays the system of record.

## How to Build It

The chapter adds messages, their segments, delivery receipts, platform opt-outs, carrier fines and throughput limits to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Messages are high-volume operational records, not resources; they reference the number and campaign resources they used, and each sent message emits one `sms.segments` usage event.

```sql
CREATE TABLE messages (                  -- one row per message; partitioned by month
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  project_id          UUID REFERENCES projects (id),
  channel             TEXT NOT NULL CHECK (channel IN ('sms', 'mms', 'rcs', 'whatsapp',
                        'apple_messages', 'messenger', 'instagram', 'telegram', 'viber',
                        'line', 'kakao')),
  direction           TEXT NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  from_number_id      UUID REFERENCES resources (id),   -- kind = 'phone_number'
  campaign_id         UUID REFERENCES resources (id),   -- the campaign at send time
  peer_e164           TEXT NOT NULL,                    -- the recipient or sender
  peer_carrier_id     TEXT REFERENCES carriers (id),    -- from the lookup, frozen
  encoding            TEXT CHECK (encoding IN ('gsm7', 'ucs2', 'binary')),
  segments            SMALLINT NOT NULL CHECK (segments > 0),
  body_ref            TEXT,                -- body in short-retention storage, not here
  priority            SMALLINT NOT NULL DEFAULT 5,
  expires_at          TIMESTAMPTZ,         -- time-to-live: fail rather than arrive late
  status              TEXT NOT NULL CHECK (status IN ('accepted', 'queued', 'sent',
                        'delivered', 'undelivered', 'failed', 'received', 'expired')),
  error_code          TEXT,                -- the platform's stable code
  upstream_id         TEXT REFERENCES upstream_providers (id),
  upstream_message_id TEXT,
  accepted_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at             TIMESTAMPTZ,
  final_at            TIMESTAMPTZ,
  idempotency_key     TEXT,                -- the customer's, for safe API retries
  UNIQUE (account_id, idempotency_key)
);

CREATE TABLE message_segments (          -- per-part routing for concatenated messages
  message_id          UUID NOT NULL REFERENCES messages (id),
  part                SMALLINT NOT NULL,
  upstream_part_id    TEXT,
  status              TEXT NOT NULL,
  PRIMARY KEY (message_id, part)
);

CREATE TABLE delivery_receipts (         -- append-only, as received
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  message_id          UUID NOT NULL REFERENCES messages (id),
  part                SMALLINT,          -- when the receipt is per segment
  source              TEXT NOT NULL,     -- carrier or upstream
  raw_status          TEXT NOT NULL,     -- their vocabulary
  raw_code            TEXT,
  mapped_status       TEXT NOT NULL,     -- ours
  mapped_error_code   TEXT,
  reported_at         TIMESTAMPTZ NOT NULL,
  received_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE opt_outs (                  -- the platform's backstop suppression
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  brand_id            UUID REFERENCES resources (id),   -- scope: the brand, by default
  number_id           UUID REFERENCES resources (id),   -- or a number, for unregistered channels
  recipient_e164      TEXT NOT NULL,
  keyword             TEXT NOT NULL,                    -- what the recipient sent
  inbound_message_id  UUID REFERENCES messages (id),
  valid_during        TSTZRANGE NOT NULL,               -- closed by START
  lifted_by_message_id UUID REFERENCES messages (id),
  CHECK (num_nonnulls(brand_id, number_id) = 1)
);

CREATE TABLE throughput_limits (         -- every bucket the sender enforces
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  scope_kind    TEXT NOT NULL CHECK (scope_kind IN ('campaign', 'brand', 'number', 'account',
                  'upstream', 'sender_identity')),
  scope_id      TEXT NOT NULL,           -- the resource id, account id or upstream id
  carrier_id    TEXT REFERENCES carriers (id),           -- null: all carriers
  channel       TEXT NOT NULL CHECK (channel IN ('sms', 'mms', 'rcs', 'whatsapp')),
  unit          TEXT NOT NULL CHECK (unit IN ('messages', 'segments', 'unique_recipients')),
  per           INTERVAL NOT NULL,       -- '1 second', '1 minute', '1 day'
  limit_value   INT NOT NULL CHECK (limit_value > 0),
  source        TEXT NOT NULL,           -- 'carrier_grant', 'platform_plan', 'risk'
  valid_during  TSTZRANGE NOT NULL
);

CREATE TABLE carrier_fines (             -- a fine received and what was done with it
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  carrier_id          TEXT NOT NULL REFERENCES carriers (id),
  notice_ref          TEXT NOT NULL,     -- the carrier's or upstream's notice
  violation           TEXT NOT NULL,     -- 'unverified_text_enablement', 'phishing', ...
  campaign_id         UUID REFERENCES resources (id),
  account_id          UUID NOT NULL REFERENCES accounts (id),  -- whose traffic
  evidence_message_ids UUID[] NOT NULL DEFAULT '{}',
  currency            CHAR(3) NOT NULL,
  amount              BIGINT NOT NULL,
  disposition         TEXT NOT NULL CHECK (disposition IN ('passed_through', 'absorbed',
                        'disputed', 'waived')),
  invoice_line_id     UUID REFERENCES invoice_lines (id),
  case_id             UUID REFERENCES moderation_cases (id),
  received_at         TIMESTAMPTZ NOT NULL
);
```

The send path, in order: validate and count segments; check the sender's standing and the campaign assignment of the from number; check `opt_outs` for the brand and recipient; resolve the recipient's carrier; take tokens from every applicable `throughput_limits` bucket for that carrier (or queue); send; record `sent`; emit the usage event. A receipt appends to `delivery_receipts`, and the message's status moves only forward (a late `sent` never overwrites `delivered`).

Notes on the sketch:

- **Bodies don't live in the message table.** Message content is personal data with a short retention period; metadata (who, when, which campaign, status, segments) is kept as long as billing, fines and disputes need it ([Data Retention & Deletion](/docs/architecture/data-retention)).
- **The carrier and campaign are frozen at send time,** so a fine, a dispute or a re-rating months later uses the facts of the moment.
- **Receipts are kept raw and mapped.** Upstream vocabularies change; keeping the raw status and code lets the mapping be fixed and reapplied.
- **Limits are rows with sources.** Carrier grants, the platform's own plan limits and risk-based throttles are the same shape, and the most restrictive applicable row wins.
- **Fines link to evidence and to the invoice,** so the customer sees the carrier's notice and the messages it was about, and the platform can show it passed through exactly what it was charged.
- **Events:** `message.sent`, `message.delivered`, `message.failed`, `message.received`, `opt_out.created`, `opt_out.lifted` and `carrier_fine.received` go to customer webhooks and the abuse desk through the [outbox](/docs/architecture/events#the-transactional-outbox).

## Auditing

- **Every message's metadata and its final status,** with the campaign, number and carrier it went through, for fines and disputes.
- **Every receipt as received,** so a disputed "delivered" can be traced to the carrier's report.
- **Every platform opt-out** with the inbound message that created it and the one that lifted it, kept as long as a TCPA claim could reach it.
- **Every fine** with its notice, evidence and disposition.
- **Throughput limits in force over time,** so a customer asking why traffic slowed on a date can be shown the carrier's limit.

## What This Means for the System You Build

- **Count segments at accept time** and bill by them; decide deliberately whether to substitute GSM look-alikes.
- **Enforce every throughput scope** (campaign, brand, number, carrier, upstream, account) in the unit each one uses, after resolving the recipient's carrier.
- **Queue rather than exceed carrier limits,** with per-message priority and a time-to-live so late passcodes fail instead of arriving.
- **Map every upstream code to a stable code of your own** that says retry, fix or stop.
- **Handle STOP, START and HELP at the platform** as a backstop keyed by brand and recipient, and forward every inbound message to the customer's ledger.
- **Keep message bodies short-lived** and metadata long enough for fines and disputes.
- **Trace every fine** to its campaign, account and messages, and pass it through with the evidence.

## References

**Specifications and guidelines**

- [3GPP TS 23.038: Alphabets and language-specific information](https://portal.3gpp.org/desktopmodules/Specifications/SpecificationDetails.aspx?specificationId=745), the GSM 7-bit alphabet and its first 3GPP version
- [3GPP TS 23.040: Technical realization of SMS](https://portal.3gpp.org/desktopmodules/Specifications/SpecificationDetails.aspx?specificationId=747), the SMS specification and its GSM 03.40 parent
- [ETSI TS 123 040 V16.0.0 (PDF)](https://www.etsi.org/deliver/etsi_ts/123000_123099/123040/16.00.00_60/ts_123040v160000p.pdf), 140 octets, 153 characters per concatenated part, 134 octets of 8-bit data
- [CTIA: Messaging Principles and Best Practices (2023, PDF)](https://api.ctia.org/wp-content/uploads/2023/05/230523-CTIA-Messaging-Principles-and-Best-Practices-FINAL.pdf), message types, opt-in and opt-out expectations

**Provider documentation**

- [Twilio: What is the SMS character limit](https://www.twilio.com/docs/glossary/what-sms-character-limit), GSM-7 and UCS-2 segment sizes, Smart Encoding, the 1,600-character cap
- [Twilio: SMS pricing for the United States](https://www.twilio.com/en-us/sms/pricing/us), per-segment prices and the failed message processing fee
- [Twilio: Messaging on toll-free numbers pending verification](https://twilio.com/en-us/changelog/messaging-on-u-s--toll-free-phone-numbers-pending-verification-i), errors 30032 and 30007 and billing of blocked messages
- [Twilio: Increased MMS rate limits for A2P 10DLC](https://www.twilio.com/en-us/changelog/increased-mms-rate-limits-for-a2p-10dlc-phone-numbers-in-the-u-s0), MMS limits by trust score
- [Telnyx: 10DLC throughput](https://telnyx.com/resources/10dlc-throughput), AT&T per-campaign and T-Mobile per-brand limits counted in segments
- [Telnyx: 10DLC fees and charges](https://support.telnyx.com/en/articles/5634625-10dlc-fees-and-charges), pass-through non-compliance fines
- [Telnyx: Toll-free verification](https://developers.telnyx.com/docs/messaging/toll-free-verification), verified toll-free throughput

**In practice**

- [Vodafone: 25 years of the text message](https://www.vodafone.com/news/newsroom/technology/25-anniversary-text-message), the first text on December 3, 1992
- [TechCrunch: Twilio adds SMS (2010)](https://techcrunch.com/2010/02/09/twilio-sms-api/), SMS in Twilio's API from February 9, 2010
- [Twilio status: SMS and MMS delivery delays to Verizon (May 2026)](https://status.twilio.com/incidents/nzv6xbhnkzs2), a carrier-specific incident and its timeline
