+++
title = "Notifications & Consent"
description = "Sending email, texts and push safely: a consent ledger per contact point and purpose, one outbound gate, send-time re-checks, templates, and the message log."
category = "Architecture"
order = 410
tags = ["architecture", "notifications", "consent", "email", "sms", "push"]
aliases = ["notifications"]
+++

Every product ends up talking to its users outside the product. A game tells a player their energy has refilled, a SaaS app emails an admin that a seat limit was hit, a marketplace texts a buyer that the seller shipped, a bank pushes a fraud alert, a field service business texts that the technician is ten minutes out. Each of those starts as one line of code in whatever service noticed the event, and that's the problem: five services, five ways of deciding whether someone wants a message, and an opt-out that only reaches the one that happened to receive it.

Messages can't be taken back, either: a text at 3 a.m., a reminder for a cancelled appointment, a marketing email after an unsubscribe. This chapter is the mechanics: how consent is recorded, how every message passes one gate, and how the log proves what happened. [Calls, Texts & Email](/docs/compliance/consumer-contact) covers the law behind the rules, and [Customer Communications](/books/field-operations/customer-communications) is a worked example in one industry.

## Purpose Decides Everything

The first thing to know about a message is its **purpose**, because purpose decides which consent applies and which opt-out stops it. I default to three, because the rules split three ways:

| Purpose | Examples | CTIA message type | TCPA, automated calls and texts | Email (CAN-SPAM) |
| --- | --- | --- | --- | --- |
| `transactional` | Receipts, shipping updates, appointment reminders, security alerts, password resets | Informational | Informational: prior express consent | Transactional or relationship: largely exempt |
| `marketing` | Promotions, win-back offers, referral asks, newsletters | Promotional | Telemarketing or advertisement: prior express written consent | Commercial: opt-out, address, ad disclosure |
| `collections` | Past-due reminders, payment plan notices | Informational | Informational, plus debt-collection rules | Depends on primary purpose |

A fourth CTIA type, **conversational**, is the reply to a message the person sent first; it's implied consent for that exchange, not a purpose to record. `collections` is its own purpose rather than a kind of `transactional` because debt-collection law adds limits of its own, and because people who opt out of dunning messages still want their receipts.

Purpose is a property of the template, set when the template is written, never inferred at send time. The trap it guards against is the mixed message: CTIA warns that adding a call to action like a coupon code to an informational text "may place the message in the promotional category," and CAN-SPAM judges an email by its primary purpose. A shipping notice with "20% off your next order" in it is a `marketing` message, and the gate should treat it as one.

## The Consent Ledger

A boolean `sms_opt_in` on the user row can't answer the questions that matter when consent is disputed: when, how, for what, shown which wording, and has it been revoked since? And it's on the wrong thing. Consent belongs to a **contact point** (a phone number, an email address, a device), not a person: two accounts share a family phone, a number gets reassigned to a stranger, one person has a work and a personal email.

So consent is an append-only ledger keyed by contact point and purpose, and current consent is a projection of it:

```sql
CREATE TABLE consent_events (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL REFERENCES tenants (id),
  contact_point    TEXT NOT NULL,              -- E.164 phone, lowercased email, or push token ID
  channel          TEXT NOT NULL CHECK (channel IN ('sms', 'voice', 'email', 'push')),
  purpose          TEXT NOT NULL CHECK (purpose IN ('transactional', 'marketing', 'collections')),
  action           TEXT NOT NULL CHECK (action IN ('grant', 'revoke')),
  method           TEXT NOT NULL CHECK (method IN
                     ('web_form', 'keyword_reply', 'one_click', 'agent', 'signed_agreement', 'provider_report')),
  person_id        UUID,
  disclosure_id    UUID REFERENCES disclosures (id),  -- the versioned consent text that was shown
  evidence_ref     TEXT,                       -- inbound message, form submission or recording ID
  occurred_at      TIMESTAMPTZ NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- named for its leading columns: the full list would pass Postgres's 63-byte identifier limit
CREATE INDEX consent_events_tenant_id_contact_point_idx
  ON consent_events (tenant_id, contact_point, channel, purpose, occurred_at DESC);
```

- **Never update, never delete.** A revocation is a new row. When someone claims they opted out in March, the ledger shows whether they did, by what method, and what the system did next. It's the [Payment States & Ledgers](/docs/payments/payment-states) rule applied to permission.
- **Keep the disclosure.** `disclosure_id` points at the exact consent text the person saw, versioned like any other legal text, because "I agreed to receive texts" means nothing without what they were told. The consent text is a `messaging_consent` row in the same versioned [disclosures](/docs/payments/subscriptions#consent-and-reminders-as-data) table renewal terms use.
- **One ledger for the whole platform.** The messaging service, the dialer, the marketing tool, the support inbox and any AI agent all read the same projection and append to the same ledger. A second opt-out list in a vendor tool is the classic failure: two systems texting one number, and a STOP that only reached one of them. If a vendor must keep its own list, sync both ways and treat a mismatch as an incident.
- **Revocations come from everywhere.** A STOP reply, an unsubscribe click, an email that says "please stop texting me", a support agent noting a request on a call. Each becomes a `revoke` row with its method and evidence, written before anything acknowledges it.
- **Erasure doesn't erase revocations.** When a person's data is deleted ([Data Retention & Deletion](/docs/architecture/data-retention)), keep a suppression for the contact point, ideally as a keyed hash, so they aren't re-added from an old import and messaged again.

Channel preferences ("email for receipts, push for everything else") sit on top of consent as a separate, editable setting. Consent says what you may send; preferences say what the person would like.

## One Outbound Gate

Every message, from every service, goes through one function before it reaches a provider, and that function is the only code holding provider credentials. It returns one of three answers, each with a reason:

```ts
type GateDecision =
  | { action: "send" }
  | { action: "defer"; until: string; reason: string }   // RFC 3339 instant
  | { action: "block"; reason: string };

function evaluate(message: OutboundMessage, now: Instant): GateDecision
```

In order, it checks:

1. **Consent** for this contact point, channel and purpose, from the ledger projection. No grant, or a later revoke, blocks.
2. **Suppression lists:** do-not-call registries and internal do-not-contact lists for calls and texts, hard-bounced and complained addresses for email, invalidated tokens for push.
3. **Quiet hours in the recipient's time zone.** Not the server's and not the business's. The zone comes from the recipient's address or profile, stored as an IANA zone ([Time & Date Formats](/docs/fundamentals/time)); when it's unknown, use the narrowest window across the zones it could be. Outside the window the answer is defer, not block: a reminder computed at 6 a.m. Eastern for someone in California waits until it's allowed.
4. **Frequency caps** per contact point and purpose, such as no more than one marketing message a day and three collections attempts a week. Caps are configuration, by jurisdiction where the law sets them.
5. **Channel rules:** the sender registration matches the purpose, the template has the required opt-out wording, the email has its unsubscribe headers.

Urgent messages (a fraud alert, a passcode the person just requested) bypass quiet hours by template configuration, never by a caller's flag. The rules (windows, caps, required wording) are data keyed by jurisdiction, channel, purpose and effective date, so a change in law is a reviewed row, not a deploy.

The gate's decision is written to the message log whether it sends or not. A block is evidence that the controls ran.

## Event-Triggered, Re-Checked at Send Time

Messages are triggered by domain events, not written inline in request handlers: `order.shipped`, `invoice.past_due`, `appointment.scheduled`. The notification service subscribes ([Events & Async Messaging](/docs/architecture/events)), decides what to send and when, and schedules it on a durable queue ([Background Jobs](/docs/architecture/background-jobs)).

The design decision that matters: **a scheduled message is a claim about the future, so every check runs again when it's due.** A reminder scheduled on Monday for Wednesday is evaluated on Wednesday against Wednesday's facts.

- **Record the subject's version.** The message stores the version of the appointment, invoice or order it was rendered for. At send time, compare it to the current version. If the appointment moved, drop the old reminder; the reschedule event produces its own. Never send "see you Tuesday" for an appointment that's now Thursday.
- **Drop what's gone stale.** A day-before reminder deferred by quiet hours until after the appointment is dropped, not delivered late. A message has an expiry along with its due time.
- **Re-check consent and quiet hours.** A revocation between scheduling and sending wins.

Duplicates come from at-least-once delivery, as everywhere else. Give each message an **idempotency key built from (subject, purpose, occurrence)**: `invoice 0193b1c4-…, payment_reminder, 2026-11-01`. A unique constraint on the key makes a redelivered event or retried job a no-op ([Idempotency](/docs/payments/idempotency)). The occurrence is what distinguishes legitimate repeats (the second reminder, next month's statement) from duplicates.

## Templates and Localization

Templates are versioned per tenant, purpose, channel and locale, and each message stores the template version and variables it rendered with, so "what did we send?" has an exact answer years later.

- **Locale comes from the recipient,** with a defined fallback chain, and dates, times, numbers and currency go through `Intl`-style formatting, never string concatenation ([Internationalization](/docs/frontend/internationalization)).
- **Count SMS segments at render time.** A text in GSM-7 fits 160 characters in one segment (153 per segment once split); one character outside that set, an emoji or many accented letters, switches the whole message to UCS-2 at 70 (67 when split). A 150-character reminder becomes three billable segments because a translator typed a curly quote. Show template authors the count, and warn on the switch.
- **Required wording is validated, not remembered.** A marketing text without opt-out instructions, or a marketing email without an unsubscribe link and postal address, fails template validation and can't be published.

## Providers and Their Errors

Provider responses sort into two groups, and the system must act on both:

- **Permanent:** the address will never work as is. An SMTP 5yz reply, a phone number that has opted out at the carrier (Twilio's error 21610 means the recipient replied STOP and can't be messaged until they reply START), a push token APNs reports as `Unregistered` or FCM as `UNREGISTERED`. Stop sending, record why, and suppress the contact point. For an opt-out the provider saw first, append a `revoke` to the ledger: the provider is a backstop, not the system of record, and without the revoke your product keeps showing a "text customer" button that can never work.
- **Transient:** an SMTP 4yz reply, a provider rate limit, an APNs 5xx. Retry with backoff and jitter ([Retries & Timeouts](/docs/architecture/retries-and-timeouts)), and run the gate again before each retry, since a retry that crosses into quiet hours is a new send.

Switching channels is never a way around a block: a text that can't be sent because the person opted out doesn't become an email.

## The Message Log

The message log is append-only, like the consent ledger, and records outcomes rather than just sends: scheduled, deferred (until when, why), suppressed (which check), dropped (stale), sent (provider, provider message ID, segments), delivered, failed (permanent or transient, the provider's code), opened or clicked where tracked.

"Why didn't the customer get the reminder?" is answered by the suppression row. Tamper evidence and export are in [Audit Trails](/docs/architecture/audit-trails). Message bodies are personal data with an ordinary retention window; the consent ledger and suppression decisions are kept as long as anyone could bring a claim about them.

## Email: Authentication and Streams

Mailbox providers decide what reaches the inbox, and they now demand authentication. Gmail requires every sender to publish SPF or DKIM, and bulk senders (more than 5,000 messages a day to Gmail) to publish SPF, DKIM and DMARC with the From domain aligned, keep the spam rate below 0.30% (aiming under 0.10%), and support one-click unsubscribe on marketing mail.

- **SPF** lists the servers allowed to send for a domain, **DKIM** signs each message, and **DMARC** (now RFC 9989) tells receivers what to do when neither aligns with the From domain. Start at `p=none` with reporting, then move to `quarantine` and `reject` once every legitimate sender is aligned.
- **One-click unsubscribe is RFC 8058:** a `List-Unsubscribe` header with an HTTPS URL plus `List-Unsubscribe-Post: List-Unsubscribe=One-Click`, both covered by the DKIM signature. The mailbox provider POSTs to the URL; your endpoint identifies the recipient and list from an unguessable token in the URL, appends a `revoke` to the ledger, and returns success without a redirect.
- **Separate transactional and marketing streams:** different subdomains (`mail.example.com`, `news.example.com`), and different IPs or provider streams where volume allows. Google's guidelines ask for a distinct From address per category and say not to mix content types in one message. The payoff is isolation: a marketing campaign that draws complaints damages the marketing domain's reputation, not the password resets, and a marketing unsubscribe never suppresses a receipt or a legally required notice.

## Multi-Tenant Senders

When the product sends on its customers' behalf (a clinic scheduler, a storefront platform, a field service suite), each tenant is a sender in its own right.

- **Per-tenant email domains.** Each tenant authenticates its own domain (they add your DKIM keys and SPF include to their DNS), or sends from a per-tenant subdomain of yours. One tenant's bad list then can't drag every other tenant into the spam folder.
- **Per-tenant 10DLC brands.** US business texting from ordinary ten-digit numbers runs through A2P 10DLC registration: a **brand** says who is sending, and a **campaign** says what is sent and how people opt in, opt out and get help. A platform registers each tenant as its own brand, with campaigns per purpose, and holds what is sent to what was registered; unregistered traffic is filtered more and charged extra fees.
- **Tenant isolation in the gate.** Consent, caps and suppressions are scoped by tenant (`tenant_id` everywhere, per [Multi-Tenancy](/docs/architecture/multi-tenancy)), except platform-level suppressions such as hard bounces, which protect every tenant.

## Push Notifications

Push is the channel most designs forget to bring under the same rules. It differs from text and email in three ways.

- **The address is a token, and tokens die.** The app registers with APNs or FCM and uploads a token; store it with the device, app version and a last-seen timestamp. Treat APNs `410 Unregistered` and FCM `UNREGISTERED` (and `INVALID_ARGUMENT` when the payload is known to be valid) as permanent: delete the token. APNs includes a `timestamp` with a 410; a token registered after that time was reissued and is still good. FCM treats a registration as stale after a month without connecting and, on Android, expires it after 270 days; prune stale tokens on your side too, rather than paying to fan out to devices nobody uses.
- **Permission is the platform's, consent is yours.** The OS prompt (iOS authorization, Android 13's `POST_NOTIFICATIONS` runtime permission, off by default for new installs) is a precondition, not consent. Apple's App Review Guideline 4.5.4 forbids push for promotions or direct marketing unless the user explicitly opted in through consent language in the app and can opt out in the app. So push marketing gets a `grant` in the ledger like any other channel, and the in-app settings screen appends `revoke` rows.
- **Quiet hours still apply.** No telephone law sets push hours, but a 2 a.m. buzz for a promotion costs you the permission. Run push through the same gate, with the same recipient-zone window and frequency caps. Use the platforms' expiry and collapse settings (APNs `apns-expiration` and `apns-collapse-id`) so a deferred or superseded notification doesn't arrive hours late or stack up.

Apple's guideline also says push shouldn't carry sensitive personal or confidential information, and payloads show on lock screens: send "You have a new message" and fetch the content in the app.

## Checklist

- **Purpose on every template,** fixed at authoring; mixed content is marketing.
- **One append-only consent ledger** per contact point, channel and purpose, shared by every service and vendor.
- **One outbound gate** holding the provider credentials, returning send, defer or block with a reason.
- **Send-time re-checks** against the subject's version, with expiry for stale messages.
- **Idempotency keys per (subject, purpose, occurrence)** under a unique constraint.
- **Versioned, localized templates** with segment counts and required wording.
- **Permanent provider errors suppress and revoke;** transient ones retry through the gate.
- **An append-only message log** of suppressions and deferrals as well as sends.
- **SPF, DKIM, DMARC and RFC 8058,** with separate transactional and marketing streams.
- **Per-tenant sender domains and 10DLC brands.**
- **Push under the same gate,** with token cleanup and explicit marketing opt-in.

## References

**Specifications**

- [RFC 8058: Signaling One-Click Functionality for List Email Headers](https://www.rfc-editor.org/rfc/rfc8058), `List-Unsubscribe-Post`, HTTPS URI, DKIM coverage and no redirects
- [RFC 9989: Domain-Based Message Authentication, Reporting, and Conformance (DMARC)](https://www.rfc-editor.org/rfc/rfc9989), the current DMARC standard, obsoleting RFC 7489
- [RFC 5321: Simple Mail Transfer Protocol](https://www.rfc-editor.org/rfc/rfc5321), transient (4yz) and permanent (5yz) reply codes

**Reference**

- [PostgreSQL: Lexical structure](https://www.postgresql.org/docs/current/sql-syntax-lexical.html), identifiers truncated at 63 bytes
- [CTIA: Messaging Principles and Best Practices (PDF)](https://api.ctia.org/wp-content/uploads/2023/05/230523-CTIA-Messaging-Principles-and-Best-Practices-FINAL.pdf), conversational, informational and promotional messages, their consent levels, and opt-out handling
- [Google: Email sender guidelines](https://support.google.com/a/answer/81126), authentication, bulk-sender DMARC, spam-rate thresholds, one-click unsubscribe and separating message types
- [Twilio: SMS character limits](https://www.twilio.com/docs/glossary/what-sms-character-limit), GSM-7 and UCS-2 segment sizes
- [Twilio: Error 21610](https://www.twilio.com/docs/api/errors/21610), sends to a recipient who replied STOP
- [Twilio: A2P 10DLC](https://www.twilio.com/docs/messaging/compliance/a2p-10dlc), brands, campaigns and unregistered traffic
- [Apple: Handling notification responses from APNs](https://developer.apple.com/documentation/usernotifications/handling-notification-responses-from-apns), status codes, `Unregistered`, the 410 timestamp and retry guidance
- [Firebase: Best practices for FCM registration token management](https://firebase.google.com/docs/cloud-messaging/manage-tokens), timestamps, staleness, 270-day expiry and invalid-token errors
- [Android Developers: Notification runtime permission](https://developer.android.com/develop/ui/views/notifications/notification-permission), `POST_NOTIFICATIONS` on Android 13 and later
- [Apple: App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), guideline 4.5.4 on push consent, marketing opt-in and sensitive content
