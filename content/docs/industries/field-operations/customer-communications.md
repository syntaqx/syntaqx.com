+++
title = "Customer Communications"
description = "The messages around every job: confirmations, reminders, on-my-way texts, service reports, review requests, shared numbers and the inbox that answers them."
category = "Field Operations Industry"
order = 1525
part = "Customers and Billing"
tags = ["field-operations", "sms", "email", "consent", "tcpa", "notifications", "reviews"]
+++

A field service company talks to each customer more often than almost any other business they deal with. Every visit produces a confirmation, a reminder, an "on my way" text, a service report, an invoice and often a review request, and a recurring customer gets that sequence with every visit: twice a year for spring and fall HVAC tune-ups, four times for quarterly pest treatments, 26 times for biweekly cleaning and 52 for weekly pool service. Most of it goes by text, and every one of those texts is a claim about the world made in advance: the visit may have moved an hour ago, the technician may have been swapped, the customer may have replied STOP to last week's review request. A reminder for a cancelled visit, a 6 a.m. text, or a STOP that only stopped half the messages is a complaint at best and a lawsuit at worst.

The general machinery (a consent ledger keyed by purpose, one outbound gate, send-time re-checks, the message log) is in [Notifications & Consent](/docs/architecture/notifications), and the law behind it (TCPA consent and revocation, calling hours, CTIA's carrier rules, CAN-SPAM) is in [Calls, Texts & Email](/docs/compliance/consumer-contact). This chapter is what's particular to field work: the lifecycle a job produces, how the platforms run it, what the rules mean for each message, and two problems field service has worse than most industries: phone numbers shared across accounts, and a second texting system beside the FSM.

## The Messages a Job Sends

The industry has converged on the same lifecycle, whatever the trade. Each message is triggered by a change in the job, not by a calendar, and each has a different purpose.

![Timeline of the messages a field service job sends: a confirmation when booked, a reminder the day before, an on-my-way text with a live ETA link when the technician is en route, a service report at completion, an invoice or receipt, and a review request days later, with the first five informational and the review request needing a check of its purpose.](/diagrams/fo-customer-communications-lifecycle.svg "One visit produces about six messages. Five are informational; the review request is the one whose purpose and consent need a second look.")

- **Confirmation,** when the visit is booked: the date, the arrival window, and what to prepare. Preparation is trade-specific and is the part customers actually read: pets inside and gate unlocked for pest and lawn, the thermostat reachable and the filter size for an HVAC tune-up, the water shut-off located for a plumbing repair, the key or lockbox code confirmed for a cleaning crew, someone home to sign for an appliance delivery.
- **Reminder,** usually a day ahead, often asking for a confirm or reschedule reply: the last cheap chance to learn the customer won't be home.
- **On my way,** when the technician starts toward the property, usually with a live ETA link.
- **Service report,** at completion: work done, findings, photos and readings. In pest control and lawn care it carries the products applied and is part of a regulatory record ([Proof of Service](/docs/industries/field-operations/proof-of-service)); in HVAC it carries refrigerant readings; in repair work, parts installed and their warranty.
- **Invoice or receipt,** with a payment link if nothing is on file, then a **review request** days later.

Around the job sit account messages (renewal notice, failed payment, past-due), covered in [Billing Recurring Service](/docs/industries/field-operations/billing-recurring-service) and [Collections & Retention](/docs/industries/field-operations/collections-and-retention), and marketing: the seasonal mosquito add-on, the pre-summer AC check. Repair and install work adds two more that recurring trades rarely send: the **estimate follow-up** after a technician quotes a replacement water heater or furnace, and the **parts-arrived** message that books the return visit when a special-order part comes in. The estimate follow-up is the one most likely to drift from informational into a sales pitch.

## How the Platforms Do It

Every suite ships the core lifecycle. They differ in how reminders are triggered, whether on-my-way is manual or automatic, and how much of reviews and two-way texting is built in versus bought from a reputation vendor.

| Platform | Reminders | On my way | Review requests |
| --- | --- | --- | --- |
| ServiceTitan | Configured notifications | Sent automatically on dispatch; text or email; tracking link with distance, ETA, tech photo and rating | Marketing Pro Reputation: trigger and survey, resends, delivery metrics |
| FieldRoutes | Per route day, SMS, voice or email by saved preference; statuses including Confirmed via Office | Tech taps a button; SMS with a Live Technician View link that ends at check-in or after 90 minutes | Customer reviews in the portal |
| Jobber | Email on by default, text if the contact receives texts; relative or time-of-day timing | Manual, tech picks 5 to 60 minutes away | Triggers on job close, visit count or paid invoice; at most one per client per six months |
| Housecall Pro | Scheduled and finished notifications, resent on time or technician change | Text when the button is clicked | Reviews app sends on finish, routes customers between review sites |
| GorillaDesk | Confirmation automations (customer clicks to confirm) then reminders | Manual, live location link and/or arrival time | Pro plan |

Two details are worth borrowing. FieldRoutes tracks each reminder's state (sent, don't send, pending confirmation, confirmed via office), turning reminders into a confirmation workflow: the unconfirmed visits on tomorrow's routes are the ones to call. And Housecall Pro resends the scheduled notification when the time or technician changes, so the customer's copy tracks the real appointment.

Delivery platforms go further on triggers, because a delivery customer waits by the door: Onfleet notifies on task started, an ETA threshold, driver arriving, completed, failed and a **delay** threshold, and Salesforce Field Service's Appointment Assistant notifies when the worker is en route and again about a mile away. The delay trigger is the one trades should copy: a message that the technician is running late beats a customer calling the office to ask. Delivery messages also collect: the tracking link is where a customer says where to leave a package or asks to hold it, and a failed-attempt message carries the next step ([Last-Mile Delivery & Distribution](/docs/industries/field-operations/last-mile-delivery)).

Beside the FSM sits a layer of communications vendors. Podium sells one inbox for calls, texts, web leads and social messages, with automatic review requests and an AI agent that books; Birdeye and Broadly sell similar reputation and messaging tools. Many businesses run one of these and an FSM together, which creates this chapter's hardest data problem: two systems texting one number, with two opt-out lists.

## The On-My-Way Message

For messaging, the on-my-way text is one more event-triggered message. Dispatching a visit isn't the trigger: `visit.dispatched` means the visit is on the technician's route, often hours before they leave for it. The visit moves to `en_route` when the technician taps "on my way" or the device leaves a geofence around the previous stop, `visit.en_route` is emitted, and the message goes out with a tracking link if the business uses one. FieldRoutes' version carries a Live Technician View link; ServiceTitan's carries a tracking URL with distance and ETA. What the link shows, when location sharing starts and stops, and how its token is scoped belong to [Dispatch & the Day of Service](/docs/industries/field-operations/dispatch), which owns live ETA links.

Two field-specific rules for the message itself. **Guard manual sends:** a technician who taps "on my way" for the wrong stop sends an ETA that's an hour off, so allow it only for the visit next on the route. And **name who is coming:** a photo and first name is a safety feature for the customer opening the door, which is why the message is re-rendered when dispatch reassigns the visit.

## What the Rules Mean for Each Message

The rules in [Calls, Texts & Email](/docs/compliance/consumer-contact) sort messages by purpose, and the field lifecycle maps onto the three purposes in [Notifications & Consent](/docs/architecture/notifications#purpose-decides-everything) like this:

| Message | Purpose | Why |
| --- | --- | --- |
| Confirmation, reminder, on my way, service report, receipt | `transactional` | Informational under the TCPA and CTIA: express consent, usually the customer giving the number at booking |
| Estimate follow-up | `transactional` if it only restates the quote; `marketing` if it pitches | The same message drifts across the line depending on its wording |
| Review request | `transactional` or `marketing`, decided by counsel | It promotes the business on a public site; treat it as its own template with its own purpose, not part of the completion report |
| Seasonal offer, add-on, referral | `marketing` | Telemarketing or advertisement: prior express written consent |
| Past-due notice | `collections` | Informational, with collection rules on top ([Collections & Retention](/docs/industries/field-operations/collections-and-retention)) |

The trap is the mixed message. CTIA warns that adding a call to action such as a coupon code to an informational text "may place the message in the promotional category," and a reminder that ends "add a mosquito treatment for $49" or "ask about our duct cleaning special" is now marketing. Field businesses do this constantly, because the reminder is the message every customer reads. My rule: purpose is set on the template when it's written, and a template with an offer in it is a `marketing` template, gated by marketing consent, whatever it's called.

**Revocation changed in the fall of 2026.** FCC 26-67, adopted September 30, 2026, replaced the "revoke all" rule before it ever took effect; the order's amendments take effect 30 days after Federal Register publication, so check the published effective date before relying on them. A STOP sent in reply to an informational message may now be treated as stopping only that category, so a customer who stops review requests can still get appointment reminders. A STOP in reply to a marketing message stops all marketing from that business. And a business may designate its revocation methods (a reply with one of the standard words, an automated key-press opt-out, a website or phone number) as the exclusive ones, if it discloses them in each message; one standard word such as "Reply STOP to opt out" satisfies that in a text. The ten-business-day limit for honoring a revocation is unchanged. The details are in [Calls, Texts & Email](/docs/compliance/consumer-contact#revoking-consent).

For field service that raises a real design choice:

- **Scoped revocation, by message category.** A STOP to a review request stops review requests; reminders and on-my-way texts keep coming. The order allows it, and it keeps the customer informed about visits they're still paying for. The cost is a customer who has to opt out several times to get silence.
- **STOP stops everything on that channel.** Stricter than the rule now requires, and fine as a policy: it's what most customers mean. The cost is a customer who no longer hears that the technician is ten minutes out.

Scoped and channel-wide STOP are both defensible: scoping keeps the reminders a customer still wants, while channel-wide is simpler to explain and stricter than the rule requires. Either way, record which template each STOP answered, and keep the scope a configuration value: the FCC's further notice is still asking whether to require a one-step revoke-all method.

The rest of the law reaches field messages in familiar ways. **Quiet hours** are evaluated in the property's time zone, not the office's or the server's, from dated per-state rules, and my default is the narrowest window among the states the business serves for every non-urgent message, informational included: customers don't distinguish a 7 a.m. reminder from a 7 a.m. sales text. **Carrier registration** is per business: each tenant is its own 10DLC brand with campaigns per purpose (ServiceTitan's SMS payment links and Housecall Pro's portal messaging both require registration first), and a reminders campaign that starts sending promotions risks suspension ([Notifications & Consent](/docs/architecture/notifications#multi-tenant-senders)). **Email** carries the long messages (reports with photos, invoices, agreements), and a service report that leads with a promotion can become a commercial email under CAN-SPAM's primary-purpose test; authentication and separate streams are in [Notifications & Consent](/docs/architecture/notifications#email-authentication-and-streams).

## One Number, Several Accounts

In most consumer products a phone number belongs to one person with one account. In field service it often doesn't. A **property manager** has one number on dozens of accounts, one per rental, and texts "can you come Thursday instead" without saying which property. A **couple** keeps separate accounts for a home and a lake house on one shared phone. A **tenant** gets the visit texts while the **owner** gets the invoices. A **restaurant chain** routes every location's texts to one facilities desk.

Three rules follow. **Thread by the pair of numbers,** the business's sending number and the customer's, not by account, and show every account the customer number maps to. **Make the agent choose when it's ambiguous;** never guess the property from the most recent visit, because "cancel tomorrow" applied to the wrong rental cancels a paying customer's service. And **consent belongs to the number, not the account:** a STOP from the property manager's phone is a revocation for that contact point across every account it's on, which is why the ledger in [Notifications & Consent](/docs/architecture/notifications#the-consent-ledger) is keyed by contact point. A per-account opt-out flag, the common shortcut, keeps texting the manager about the other 39 rentals.

## Two-Way Texting and the Shared Inbox

Customers reply to reminders: "can you come Thursday instead," "gate code is 4471," "STOP." The suites have moved to a dedicated number per business with replies in a shared inbox (Jobber's message center), or one-way texts with replies forwarded to the office as an alert (FieldRoutes' on-my-way). Either way, a reply is work: a reschedule, a note for the technician, an access change.

- **Route replies to the job, not just the inbox.** A gate code or "dog is out" belongs on the visit the technician will open, not in a thread the office reads later. Show the latest inbound message on the visit in the technician app.
- **Keyword handling comes first.** Opt-out and opt-in keywords are checked before anything routes the message, case-insensitive and whole-message, and the revocation is appended to the ledger before anything acknowledges it. The acknowledgment is a single confirmation text with no marketing in it, sent within five minutes: 47 CFR 64.1200(a)(12) presumes a confirmation sent inside that window falls within the customer's prior consent, and a later one has to be shown reasonable.
- **No personal phones.** Technicians texting customers from their own phones is the most common failure in the trade: nothing is logged, no opt-out is honored, and the customer keeps the technician's number after they leave the company. Give technicians in-app messaging through the business number, or a masked number per visit.

**Two systems, one customer.** When a reputation or messaging vendor texts beside the FSM, the customer sees one business and two opt-out lists. Sync opt-outs both ways in near real time and treat a mismatch as an incident, or let only one system send texts. "I replied STOP and you texted me again" is exactly the fact pattern a TCPA claim is built on.

**AI replies** now sit on top of the inbox. Podium sells an AI agent that responds and books; Jobber's Receptionist answers calls and texts, books through the business's online booking settings and escalates on trigger terms; Housecall Pro lists CSR AI for calls, with text answering in alpha. An AI that upsells in a conversational thread has sent a marketing message. Disclosure, tools and limits are covered in [AI Agents in the Product](/docs/architecture/ai-agents) and, for field work, [AI in Field Operations](/docs/industries/field-operations/ai-in-field-operations). My rule: every change an AI makes to a visit goes through the same scheduling service, policy checks and audit trail as a human's.

## Reviews and Surveys

Review requests are the message most tied to revenue in home services, where a map listing's rating decides who gets called. ServiceTitan records the trigger and survey for each request and reports sent, delivered and clicked. Jobber triggers on job close, visit count or a paid invoice and limits requests to one per client every six months, with follow-ups. Housecall Pro sends on finish and splits customers across review sites by default.

**When to ask** is a field-specific choice. Ask a one-time repair customer after the job; ask a recurring customer at milestones (the first visit, the first year), capped per period as Jobber does, never after every weekly pool visit. Never ask after a `not_completed` visit or one with an open complaint.

The FTC's rule on consumer reviews prohibits offering compensation or incentives conditioned on a review expressing a particular sentiment, positive or negative, and prohibits misrepresenting that the reviews you display are all or most of those submitted when you suppress some by rating. A "rate us first, and only happy customers get the Google link" flow deserves a lawyer's review before you build it. Asking every eligible customer, and offering an incentive (if any) for any honest review, is the safe design.

**Net Promoter Score** (0 to 10, percent promoters at 9 or 10 minus percent detractors at 0 to 6) is the common survey. Tie each response to the visit and technician, so a detractor creates a follow-up task for the branch manager, not just a number.

## How to Build It

The design is the one in [Notifications & Consent](/docs/architecture/notifications#event-triggered-re-checked-at-send-time): **a message is scheduled from an event, and every gate is re-evaluated at send time.** Consent, the visit and quiet hours can all change between Monday's scheduling and Wednesday's send.

![Six-stage send pipeline for a scheduled customer message: message due, job unchanged, consent ok, send window, render and link, hand off to the provider, with exits for dropping stale messages, suppressing for missing consent, deferring for quiet hours, falling back to a default locale, and retrying transient provider errors or stopping on permanent ones.](/diagrams/fo-customer-communications-send-gates.svg "A reminder scheduled on Monday is evaluated again on Wednesday. Each gate can stop it, and each stop is logged as an outcome.")

What's specific to field work:

- **The subject is the visit, and its version decides staleness.** Each message stores the visit version it was rendered against. At send time, a changed date, window or technician drops the old message, and the reschedule produces a new confirmation. Never send a reminder that says Tuesday for a visit that's now Thursday, or names a technician who was reassigned.
- **Recurring visits need an occurrence in the key.** The idempotency key is the visit, the purpose and the occurrence (`reminder_day_before`, `reminder_morning_of`), so a double-fired `visit.scheduled` can't send two reminders, while a quarterly customer still gets each quarter's.
- **Late is worse than never.** A day-before reminder deferred by quiet hours until after the visit's window opens is dropped, not delivered. An on-my-way text that arrives after `visit.arrived` is dropped too.
- **The time zone is the property's,** stored as an IANA zone on the property, because a business in one zone routinely serves customers in another near a state line ([Time & Date Formats](/docs/fundamentals/time#future-wall-clock-times-local-time-plus-a-zone)).
- **Producers emit the canonical events** (`visit.scheduled`, `visit.dispatched`, `visit.en_route`, `visit.arrived`, `visit.cancelled`, `visit.completed`, `invoice.finalized`); nothing in the scheduling or technician app sends a text inline.
- **Channel preferences are per person and purpose,** separate from consent (email for reports, text for on-my-way), and Jobber keeps them on each contact, not only the client; expose them in [Customer Self-Service](/docs/industries/field-operations/customer-self-service).
- **Reminder texts stay short.** Jobber keeps them to 160 characters with no emojis or URLs, and GorillaDesk warns template authors when a character pushes a message into more segments; one emoji turns a 160-character reminder into three billable segments ([Notifications & Consent](/docs/architecture/notifications#templates-and-localization)).

**What goes wrong in the field.** Reminders for rescheduled visits. Promotional copy creeping into reminder templates in the busy season. A reply ("cancel tomorrow") applied to the wrong account on a shared number. And day-before reminders that wait on tomorrow's routes being finalized in the evening, then run into quiet hours; send them from the provisional route and correct them only on change.

## Auditing

Communications are evidence in TCPA suits, consumer complaints, chargebacks ("I was never told about the visit") and pesticide inspections, where the report sent to the customer is part of the record. The general design is in [Audit Trails](/docs/architecture/audit-trails) and the message log in [Notifications & Consent](/docs/architecture/notifications#the-message-log); field records are in [Audit Trails & Records](/docs/industries/field-operations/audit-trails-and-records). For field messaging, make sure the record can show:

- **Which visit version each message was rendered for,** and the suppression row when a stale reminder was dropped, which answers "why didn't the customer get a reminder?"
- **Every revocation with the words received, the channel and the template it answered,** including opt-outs told to a technician on site and entered in the app.
- **Which account an inbound message on a shared number was applied to,** and who chose.
- **The service report exactly as sent,** with the products and readings it listed, since that copy can be the customer's only record of what was applied at their home.

## What This Means for the System You Build

- **Event-triggered messages for each step of the visit lifecycle,** with trade-specific preparation text and send-time re-checks against the visit's version.
- **Purpose fixed on every template,** with offers moved into separate `marketing` templates rather than appended to reminders.
- **A chosen revocation scope** (by category or channel-wide) held as configuration, with the template each STOP answered recorded.
- **Quiet hours evaluated in the property's time zone,** and stale reminders and on-my-way texts dropped, not sent late.
- **Threads by number pair, with explicit account choice** on numbers shared across accounts, and consent kept per contact point.
- **Replies routed onto the visit** the technician will open, and no texting from personal phones.
- **One opt-out list,** synced with any reputation or texting vendor that also sends.
- **Review requests capped per customer,** sent to every eligible customer, never tied to sentiment.
- The general requirements (consent ledger, outbound gate, message log, sender registration) are in [Notifications & Consent](/docs/architecture/notifications#checklist).

## References

**Specifications**

- [FCC 26-67: Report and Order and Further Notice of Proposed Rulemaking (PDF)](https://docs.fcc.gov/public/attachments/FCC-26-67A1.pdf), adopted September 30, 2026 and effective 30 days after Federal Register publication: scoped revocation for informational messages, marketing revocations covering all marketing, designated exclusive revocation methods and their disclosure, the ten-business-day limit, and the open questions on revoke-all
- [Cornell LII: 47 CFR 64.1200](https://www.law.cornell.edu/cfr/text/47/64.1200), the ten-business-day revocation limit and the one-time confirmation text presumed within consent if sent within five minutes
- [16 CFR 465.4](https://www.law.cornell.edu/cfr/text/16/465.4) and [16 CFR 465.7](https://www.law.cornell.edu/cfr/text/16/465.7), incentives conditioned on review sentiment and review suppression
- [FTC: CAN-SPAM Act compliance guide](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business), primary purpose and mixed messages

**Reference**

- [CTIA: Messaging Principles and Best Practices (PDF)](https://api.ctia.org/wp-content/uploads/2023/05/230523-CTIA-Messaging-Principles-and-Best-Practices-FINAL.pdf), message types and consent, and the warning that a call to action can make an informational message promotional
- [Qualtrics: How to calculate NPS](https://www.qualtrics.com/experience-management/customer/measure-nps/), the NPS scale and formula

**In practice**

- [ServiceTitan: dispatch notifications](https://help.servicetitan.com/docs/enable-text-and-email-dispatch-notifications.md), automatic on-my-way with a tracking URL, distance and ETA
- [ServiceTitan: review requests](https://help.servicetitan.com/docs/manage-review-requests), triggers, resends and delivery metrics
- [ServiceTitan: SMS invoice payment links](https://help.servicetitan.com/docs/use-sms-invoice-payment-links), registration needed for SMS delivery
- [FieldRoutes: appointment reminders](https://knowledgebase.fieldroutes.com/docs/sending-appointment-reminders-to-customers.md), reminder channels and statuses
- [FieldRoutes: On My Way notification](https://knowledgebase.fieldroutes.com/docs/on-my-notification.md), the on-my-way text, its Live Technician View link and replies routed to the office
- [Jobber: reminders](https://help.getjobber.com/hc/en-us/articles/360033608974), default channels, timing and text limits
- [Jobber: On My Way](https://help.getjobber.com/hc/en-us/articles/360021265374), manual sends and two-way replies
- [Jobber: reviews](https://help.getjobber.com/es/articles/reviews-marketing-tools/), triggers, follow-ups and frequency limit
- [Jobber: client basics](https://help.getjobber.com/en/articles/client-basics/), per-contact communication settings
- [Jobber: Receptionist](https://help.getjobber.com/hc/en-us/articles/25315927533847), AI call and text answering with escalation
- [Housecall Pro: customer notifications](https://help.housecallpro.com/en/articles/357613-customer-notifications-overview), the notification set and resend on change
- [Housecall Pro: Reviews app](https://help.housecallpro.com/en/articles/2637765-reviews-app), review routing between sites
- [Housecall Pro: CSR AI](https://help.housecallpro.com/en/articles/9740104-csr-ai-overview), AI call answering and the status of text answering
- [Housecall Pro: customer portal](https://help.housecallpro.com/en/articles/8448657-using-the-customer-portal), messaging that requires registration
- [GorillaDesk: automated email and SMS](https://intercom.help/gorilladesk/en/articles/8944155-automated-email-sms), confirmations versus reminders
- [GorillaDesk: on the way messaging](https://intercom.help/gorilladesk/en/articles/5581067-on-the-way-messaging), live location links and Unicode segment warnings
- [Onfleet: notification triggers](https://intercom.help/onfleet-4f83d83093ac/en/articles/16090283-notification-set-up-triggers), delivery-grade notification triggers including delays
- [Trailhead: Real-Time Location in Appointment Assistant](https://trailhead.salesforce.com/content/learn/modules/real-time-location-appointment-assistant/get-to-know-real-time-location-in-appointment-assistant), en-route and nearby notifications
- [Podium for home services](https://homeservices.podium.com/), unified inbox, review requests and AI booking
- [Birdeye](https://birdeye.com/) and [Broadly](https://broadly.com/), reputation and messaging platforms
