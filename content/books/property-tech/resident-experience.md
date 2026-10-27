+++
title = "Resident Experience"
description = "Resident portals and apps, communications and consent, amenity bookings, resident services, surveys and sentiment, AI resident agents, renewals and retention."
category = "Property Tech Industry"
order = 1724
part = "Operations"
tags = ["property-tech", "resident-portal", "communications", "amenities", "surveys", "retention"]
+++

Most of a resident's relationship with a property happens between move-in and notice, and most of it now happens in an app. A household pays rent there, asks for a repair, books the clubhouse for a birthday, finds out the water will be off on Tuesday, picks up a package, answers a survey about the repair, and eventually gets a renewal offer or gives notice. To the operator, each of those is a different system with a different owner; to the resident, it's one login, and the experience is judged by the worst of them. The renewal decision at the end is made from the sum: a household that waited two weeks for a dishwasher and heard about the water shutoff from a neighbor is pricing its move.

This chapter covers the resident-facing layer: portals and apps, the communications that run through them and the consent rules that govern those, amenity reservations, bookable resident services, surveys and sentiment, AI agents that answer residents, and the renewal and retention loop the rest feeds. It is mostly a front end over records other chapters own (the ledger, work orders, the lease, access credentials), so its hardest problems are identity, consent and accountability rather than data. Paying rent is Collecting Rent; the lease, its documents and renewal terms are The Lease; renewal pricing is Revenue Management & Pricing; rewards, marketplaces and bulk internet are Resident Financial Products & Ancillary Revenue; online reviews and the rules on them are Leads, CRM, Tours & the Leasing Center.

## How the Platforms Do It

Every suite ships a resident app, and the feature lists have converged:

| Platform | Resident product | What its public pages describe |
| --- | --- | --- |
| **Entrata** | Homebody app, ResidentPortal | Pay rent, submit maintenance, message staff, view and renew the lease, manage vehicles, community events and amenities, a digital move-in and move-out checklist, a loyalty program, and "a fully white-labeled app"; the web portal adds e-documents, an "integrated community wall," classifieds, events, surveys and newsletters |
| **RealPage** | LOFT | LOFT Payments (all payment types, including the Livble flexible rent option), LOFT Living (maintenance requests and community engagement), LOFT Moving ("smart resident checklists," internet and utility setup with integrated providers, and amenity, parking, storage and rentable item reservations), and a points program |
| **Buildium** | Resident Center | Online payments with history, autopay, maintenance requests with photos and appointment scheduling, renters insurance selection, announcements plus SMS "when email isn't enough," lease documents, iOS and Android apps, for "tenants or homeowners" |
| **Yardi** | RentCafe Resident Portal | Pay rent and utilities online, request maintenance, enable autopay |
| **RealPage** | AI Resident Agent | "Handles everyday resident questions, service requests, amenity bookings, and rent reminders," across channels, 24/7 |
| **Entrata** | OXP Communications, Resident Pulse | A shared workspace bringing SMS and email together; Resident Pulse (beta, June 2026) reading "resident feedback and individual interactions across multiple channels" for sentiment, keyword trends and satisfaction scoring |
| **EliseAI** | SentimentAI | Conversational check-ins at renewals, work orders and move-outs, feeding dashboards and escalating negative work-order responses (June 2025) |
| **Amenify** | Resident services | Cleaning, handyman, dog walking and chores from local providers, offered inside Entrata's resident app with a $50 move-in credit and $20 a month (June 2025) |

What differs is less the feature list than three structural choices. **Branding:** a white-label app carries the operator's name and keeps the resident relationship with the operator; a vendor-branded app builds the vendor's audience, which matters when the vendor sells resident financial products through it. **Breadth of the login:** the best apps are one identity across application, lease signing, move-in, residency and move-out, so the household never re-registers; RealPage's page describes residents using "the same login" for a moving checklist after signing. **Who answers:** messages, requests and questions go to site staff, a central team, an outsourced center or an AI agent, and the app has to route each to the right one without the resident noticing the seams.

## Portals and Apps

A resident app is a client for records the platform already has. What it shows, by area:

| Area | What the resident does | Owned by |
| --- | --- | --- |
| Account | Balance, charges, payments, autopay, receipts | Charges & Resident Ledgers; Collecting Rent |
| Requests | Submit with photos, permission to enter, track, rate | [Maintenance & Work Orders](/books/property-tech/maintenance-and-work-orders) |
| Lease | Documents, addenda, renewal offers, notice to vacate | The Lease |
| Household | Occupants, roommates, pets, vehicles, emergency contacts | The Lease; [Access, Smart Buildings & Parking](/books/property-tech/access-and-smart-buildings#parking-and-towing) |
| Access | Mobile key, guest passes, packages | [Access, Smart Buildings & Parking](/books/property-tech/access-and-smart-buildings) |
| Coverage | Renters insurance proof, deposit alternative status | Insurance, Deposits & Guarantees |
| Community | Announcements, events, community wall, classifieds | This chapter |
| Amenities and services | Book spaces, order services | This chapter |
| Moving | Move-in checklist, utility and internet setup, move-out checklist | Move-In & Move-Out; Utilities & Energy |

Four things decide whether it works:

**Identity follows the lease, not the email address.** A portal account belongs to a `people` row, and what it can see comes from that person's current `lease_members` roles: a leaseholder sees the ledger and signs; an adult occupant may submit requests but not see the balance, depending on the operator's policy; a guarantor sees what they guarantee and nothing about the household's requests. When a roommate leaves mid-lease, their access to the household's records ends that day, and their own history stays available to them. My rule: portal permissions are derived from `lease_members.valid_during` and role on every request, never copied onto the account.

**Multiple households, multiple properties.** A person can be a leaseholder at one property, a guarantor at another and a former resident at a third, sometimes under different operators that happen to use the same suite. Inside one operator, the app switches between leases; across operators, they're separate tenants and separate accounts, because the data belongs to each operator ([Multi-Tenancy](/docs/architecture/multi-tenancy)).

**Documents are records, not attachments.** The lease, addenda, notices and move-in inspection are shown from the signed record with its retrieval guarantees ([Storage and Retrieval](/docs/compliance/electronic-signatures#storage-and-retrieval)); a legal notice delivered through the portal counts as delivered only where the law and the resident's electronic consent allow it ([Consumer Consent Comes First](/docs/compliance/electronic-signatures#consumer-consent-comes-first)), which The Lease owns.

**Accessibility and language.** The app is a public accommodation for some residents and the only way to reach the office for others: it meets WCAG 2.2 AA ([Accessibility](/docs/frontend/accessibility)), works on low-end phones, and supports the languages the property's residents use ([Internationalization](/docs/frontend/internationalization)). Federal language-access guidance for federally assisted housing was issued under Executive Order 13166, which Executive Order 14224 revoked on March 1, 2025, directing the Attorney General to rescind guidance issued under it while stating that agencies aren't required to stop producing materials in other languages; what that means for assisted owners as of October 2026 is in Fair Housing. My default is to translate the transactional and legal messages residents rely on regardless, and to tell residents how to get help in their language.

Segment editions extend the same portal: a housing authority's landlord and participant portals (Subsidized & Affordable Housing), family portals in senior living (Senior Living), sales reporting and certificates of insurance for commercial tenants (Commercial Property), and owner portals for association members (Community Associations).

## Communications and Consent

A property sends more kinds of messages than most businesses, and each kind has different rules:

| Kind | Examples | Rules that apply |
| --- | --- | --- |
| **Legal notice** | Rent increase, lease violation, entry notice, notice to pay or quit | Content, timing and method set by state and local law; electronic delivery only where allowed and consented |
| **Emergency** | Fire, flood, gas leak, building evacuation | Sent on every channel at once; not optional |
| **Operational** | Water shutoff, elevator outage, pest treatment, inspections | Informational about the resident's tenancy; timely, by unit or building |
| **Transactional** | Payment receipt, work order status, package arrived, booking confirmed | Triggered by the resident's own activity |
| **Community** | Events, newsletters, wall posts | Optional; easy to mute |
| **Marketing** | Renewal promotions, referral programs, partner offers | Consent and opt-out rules for marketing; partner offers disclose the relationship |

The general machinery is in [Notifications & Consent](/docs/architecture/notifications): classify by purpose ([Purpose Decides Everything](/docs/architecture/notifications#purpose-decides-everything)), record consent per channel and purpose in a ledger ([The Consent Ledger](/docs/architecture/notifications#the-consent-ledger)), and send everything through one gate that re-checks consent, quiet hours and suppression at send time ([One Outbound Gate](/docs/architecture/notifications#one-outbound-gate)). Texting rules (TCPA consent, revocation in any reasonable manner, carrier registration) are in [Calls, Texts & Email](/docs/compliance/consumer-contact#tcpa-consent).

The property twists:

- **Legal notices are not notifications.** A rent increase or an entry notice sent by app push is a message about a notice; the notice itself is a document served by a method the law accepts, with its own record of service, which The Lease and [Maintenance & Work Orders](/books/property-tech/maintenance-and-work-orders#entry-notice) own. The communications layer links to the served notice; it never substitutes for it.
- **Opting out of marketing never silences the tenancy.** A resident who texts STOP to a renewal promotion still needs to hear about the water shutoff and the fire alarm test. That's why the purpose has to be right on every template, and why consent is per purpose, not per phone number ([Revoking Consent](/docs/compliance/consumer-contact#revoking-consent)).
- **Audience comes from leases and units.** "Building C, floors 3 to 5" or "units on the east riser" resolves through units and current leases at send time, including occupants who opted in, not from a mailing list that went stale at the last move-out.
- **The operator is the sender, per property.** Messages go out under the property's name and number, from a sender registered for that tenant ([Multi-Tenant Senders](/docs/architecture/notifications#multi-tenant-senders)); replies land in a shared inbox where site and central staff see one thread per household, which is what Entrata's OXP Communications describes for SMS and email together.
- **Partner messages are the operator's messages.** An internet or moving offer sent through the app is marketing by the operator, whatever revenue share sits behind it; the disclosure and consent obligations are Resident Financial Products & Ancillary Revenue's.

**Community walls and classifieds** are user-generated content inside the operator's product. My default is posting rules residents accept, reporting and moderation by staff, and a review queue for posts that look like housing ads (a sublet or roommate post), because a discriminatory preference in a housing notice is a fair housing problem wherever it's published (Fair Housing).

## Amenity Reservations

Amenities are rentable inventory with short durations: a clubhouse for an evening, a guest suite for three nights, a grill or a court for an hour, the freight elevator and loading dock for a move. Entrata lists amenity booking in its app and portal; RealPage's LOFT Moving lists "amenity, parking, storage, and rentable items reservations"; RealPage's AI Resident Agent takes amenity bookings.

The mechanics are a reservation system ([Reservations & Holds](/docs/architecture/reservations-and-holds)):

- **Exclusive amenities** (a party room, a guest suite, the move elevator) use a time-range exclusion constraint so two households can't hold the same slot ([Exclusion Constraints for Time](/docs/architecture/reservations-and-holds#exclusion-constraints-for-time)).
- **Shared amenities with capacity** (a gym or pool with a headcount limit) use counters per slot ([Counters for Pooled Inventory](/docs/architecture/reservations-and-holds#counters-for-pooled-inventory)).
- **Rules are per amenity:** lead time, maximum duration, bookings per household per period, hours, whether staff approve, a fee and a refundable deposit as charge codes on the lease ledger, cancellation terms. Fair use limits stop one household from holding every Saturday ([Caps and Abuse](/docs/architecture/reservations-and-holds#caps-and-abuse)).
- **Eligibility comes from the lease:** current leaseholders and adult occupants in good standing, by property or building, with any delinquency restriction applied as written policy, not a staff judgment at the counter.
- **Fees are charges.** A party room fee posts to the lease ledger with its charge code; a damage deposit is a held amount released after inspection; damage beyond it becomes a chargeback with evidence, the same way work orders do ([Resident Chargebacks](/books/property-tech/maintenance-and-work-orders#resident-chargebacks)).
- **Bookings may open doors.** A confirmed booking can grant an access credential to the amenity for the slot ([Smart Locks and Access Control](/books/property-tech/access-and-smart-buildings#smart-locks-and-access-control)).

Amenity rules are a fair housing surface. California's civil rights department settled a familial status case in April 2018 for $25,000 where house rules barred children from the pool after 6 p.m. while adults could swim until 9 p.m. My rule: amenity rules are written about conduct and safety that apply to everyone, never about who the user is, and they're reviewed as policy text, not typed into a booking form by whoever set it up (Fair Housing).

## Resident Services

Resident services are things a resident buys at home: cleaning, handyman work, dog walking, furniture assembly, internet and utility setup, moving help. Amenify's partnership with Entrata (June 2025) lets operators offer cleaning, handyman, dog walking and chores from vetted local providers, with a $50 move-in credit and $20 a month; Entrata's app page describes it as "$300/year in lifestyle service credits." RealPage's LOFT Moving offers "internet & utility setup with integrated providers."

The platform's part is narrow and contractual:

- **Who is the merchant.** The provider performs and usually charges the resident directly; if the operator collects, the charge is on the ledger and the operator is responsible for it. Either way the order, the price and the provider are recorded.
- **Who pays for credits.** A service credit is a concession, a marketing expense or a vendor-funded promotion, and the owner's statement has to say which.
- **What the operator earns.** Referral and revenue-share income from services belongs to someone under the management agreement; Resident Financial Products & Ancillary Revenue owns the money and the disclosure.
- **What the provider may do.** A dog walker or cleaner entering a unit needs the resident's own access grant (a guest credential the resident issues), never a staff credential, and the operator's entry-notice rules don't apply because the operator isn't entering ([Smart Locks and Access Control](/books/property-tech/access-and-smart-buildings#smart-locks-and-access-control)).

## Surveys and Sentiment

Operators survey at the moments that predict renewal: after move-in, after a work order closes, before renewal, and at move-out. EliseAI's SentimentAI describes conversational check-ins at renewals, work orders and move-outs with automatic escalation of negative work-order responses; Entrata's ResidentPortal lets staff "post surveys"; Entrata's Resident Pulse reads "resident feedback and individual interactions across multiple channels" into sentiment analysis, keyword trends and satisfaction scoring, and RealPage's portal page frames engagement as what keeps residents "more likely to renew."

How to make that a system rather than a dashboard:

- **Trigger from events.** `work_order.completed` sends the work-order survey; `lease.moved_in` plus a few weeks sends the move-in survey; the renewal window opening sends the renewal pulse. One survey per household per period, with quiet hours and the community-message consent, so surveys don't become spam.
- **Tie the answer to its subject.** A one-star response points at the work order and the technician or vendor that did it, so it feeds vendor scorecards ([Vendors, Procurement & Payables](/books/property-tech/vendors-and-payables)) and reopens the request if the resident says it isn't fixed.
- **Separate what residents said from what a model inferred.** A survey score is the resident's statement; a sentiment label on a text thread is a model's guess with a version. Store both, never overwrite one with the other, and keep the model output out of decisions the resident can't see or contest ([Automated Risk Decisions](/docs/architecture/risk-scoring)).
- **Escalate, don't just score.** A response that says "still leaking" or "I feel unsafe" opens a work order or a manager task with an owner; an emergency in free text skips the queue ([Emergencies Skip the Model](/docs/architecture/ai-agents#emergencies-skip-the-model)).
- **Don't gate reviews.** Asking only happy residents to post public reviews, or paying for positive ones, runs into the FTC's rules on consumer reviews, which Leads, CRM, Tours & the Leasing Center owns along with reputation management.

## AI Resident Agents

An AI agent that answers residents is a staff member with the same access and none of the judgment. RealPage's AI Resident Agent handles "everyday resident questions, service requests, amenity bookings, and rent reminders" across channels at any hour, and the suites' AI tiers include similar agents ([The Software Landscape](/books/property-tech/software-landscape#packaging-core-tiers-and-ai) covers the packaging).

The general rules are in [AI Agents in the Product](/docs/architecture/ai-agents); the resident-side twists:

- **Identity before account actions.** The agent confirms it's talking to a lease member before discussing a balance, a lease or a work order, and acts only with that person's permissions ([Identity Before Account Actions](/docs/architecture/ai-agents#identity-before-account-actions)).
- **Emergencies skip the model.** Gas, fire, flooding, no heat in winter and threats to safety route to the emergency path by deterministic rules ([Emergencies Skip the Model](/docs/architecture/ai-agents#emergencies-skip-the-model)), the same triage [Maintenance & Work Orders](/books/property-tech/maintenance-and-work-orders#triage-and-priority) uses.
- **No legal promises.** The agent can explain a policy; it can't waive a fee, grant an accommodation, agree to a payment plan or extend a deadline unless that action is a tool with its own rules. Its promises are the operator's ([The AI's Promises Are the Business's Promises](/docs/architecture/ai-agents#the-ai-s-promises-are-the-business-s-promises)).
- **Accommodation requests go to people.** A resident who mentions a disability, an assistance animal or a need for a change is making a request the operator must handle through its process, and the agent's job is to recognize it and hand it off ([Reasonable Accommodations and Modifications](/books/property-tech/fair-housing#reasonable-accommodations-and-modifications)).
- **Disclose and hand off.** Residents know they're talking to an AI where the law requires it and as my default everywhere ([Telling People They're Talking to an AI](/docs/compliance/consumer-contact#telling-people-they-re-talking-to-an-ai)), and can reach a person ([Human Handoff Is a Product Feature](/docs/architecture/ai-agents#human-handoff-is-a-product-feature)).

AI in Property Management covers governance, automation levels and cost allocation to owners across all agents.

## Renewals and Retention

Renewal is where the resident experience turns into revenue. Each household that renews avoids a turn, vacancy days and leasing cost, which is why operators watch renewal rate and why every vendor in this chapter frames engagement as retention.

The renewal flow in the app:

1. **The offer arrives on time.** The renewal window and its offers come from Revenue Management & Pricing, capped where a rent cap applies, and the notice of any increase is served under the property's `rent_increase_notice` rule ([The Rules Matrix](/books/property-tech/landlord-tenant-law#the-rules-matrix)). The app shows the offer; The Lease owns the document.
2. **Options are clear.** Terms and prices side by side, including month-to-month if offered and any fees, signed electronically by every leaseholder and guarantor.
3. **Notice to vacate is just as easy.** A resident who isn't renewing gives notice in the app, with the date and time recorded as received, the notice period the lease and law require, and a forwarding address for the deposit accounting (Move-In & Move-Out). Making notice hard to give doesn't retain anyone; it produces disputes.
4. **Roommate changes route correctly.** One leaseholder renewing and another leaving is a new lease with a different household membership, not an edit (The Lease).

**Retention signals** are what tell a manager whom to call before the window opens: repeated or reopened work orders, slow responses, negative survey answers, unanswered messages, a recent transfer request, a noise complaint thread. My rule: signals are drawn from the household's service history and stated feedback, and never from protected characteristics or their proxies (Fair Housing). Two further limits:

- **Complaints are protected.** Many states prohibit retaliating against a tenant for complaining about habitability. California, for one, bars a landlord from recovering possession within 180 days of a protected act such as a good-faith repair notice, a habitability complaint to the landlord or an agency, or an inspection that results, and separately prohibits retaliation for organizing a tenants' association. A model that ranks "likely to complain" households lower for renewal offers is building a retaliation exhibit. Retention signals may prioritize outreach and service, never a worse offer or a non-renewal.
- **Signals are explainable.** A manager sees why a household is flagged (three reopened work orders, a detractor survey), not a score.

Renewal rate, notice reasons and the trade-out between renewal and new-lease rents are defined in Operating Metrics.

## How to Build It

The schema extends [the core model](/books/property-tech/property-business#the-core-data-model): amenities are property inventory; reservations, service orders and surveys hang off leases and people; fees post as `charges`. Consent and message history use the playbook's consent ledger and message log ([The Consent Ledger](/docs/architecture/notifications#the-consent-ledger), [The Message Log](/docs/architecture/notifications#the-message-log)) with `people` as the subject, so there's no consent table here.

```sql
CREATE TABLE amenities (
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id              UUID NOT NULL,
  property_id            UUID NOT NULL REFERENCES properties (id),
  building_id            UUID REFERENCES buildings (id),   -- null when property-wide
  name                   TEXT NOT NULL,
  kind                   TEXT NOT NULL CHECK (kind IN ('room', 'guest_suite', 'court', 'grill',
                           'pool', 'fitness', 'move_elevator', 'loading_dock', 'other')),
  booking_mode           TEXT NOT NULL CHECK (booking_mode IN ('exclusive', 'capacity',
                           'not_reservable')),
  capacity               INT CHECK (capacity > 0),          -- for 'capacity' mode
  rules                  JSONB NOT NULL DEFAULT '{}',       -- lead time, max duration, caps, hours
  requires_approval      BOOLEAN NOT NULL DEFAULT FALSE,
  fee_charge_code_id     UUID REFERENCES charge_codes (id),
  deposit_charge_code_id UUID REFERENCES charge_codes (id),
  access_point_id        UUID REFERENCES access_points (id),  -- door a booking opens
  CHECK (booking_mode <> 'capacity' OR capacity IS NOT NULL)
);

CREATE TABLE amenity_reservations (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  amenity_id         UUID NOT NULL REFERENCES amenities (id),
  lease_id           UUID NOT NULL REFERENCES leases (id),
  booked_by_person_id UUID REFERENCES people (id),          -- null when staff or an agent booked
  booked_by_actor    TEXT NOT NULL,                          -- typed actor: person, user, agent
  during             TSTZRANGE NOT NULL,
  exclusive_slot     BOOLEAN NOT NULL,                       -- copied from the amenity at insert
  party_size         INT NOT NULL DEFAULT 1 CHECK (party_size > 0),
  status             TEXT NOT NULL CHECK (status IN ('held', 'pending_approval', 'confirmed',
                       'cancelled', 'no_show', 'completed')),
  held_until         TIMESTAMPTZ,                            -- holds expire on read
  fee_charge_id      UUID REFERENCES charges (id),
  credential_id      UUID REFERENCES access_credentials (id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  EXCLUDE USING GIST (amenity_id WITH =, during WITH &&)
    WHERE (status IN ('held', 'pending_approval', 'confirmed') AND exclusive_slot)
);
```

The exclusion constraint needs to know whether the amenity is exclusive, and Postgres can't reference another table in a constraint, so `exclusive_slot` is copied from the amenity's booking mode when the row is created and never updated. Capacity amenities use a per-slot counter row locked on booking ([Counters for Pooled Inventory](/docs/architecture/reservations-and-holds#counters-for-pooled-inventory)).

```sql
CREATE TABLE service_offerings (          -- bookable services from partners
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  property_id      UUID REFERENCES properties (id),        -- null: all the tenant's properties
  provider_name    TEXT NOT NULL,
  category         TEXT NOT NULL CHECK (category IN ('cleaning', 'handyman', 'pet_care',
                     'moving', 'internet', 'utilities', 'other')),
  merchant_of_record TEXT NOT NULL CHECK (merchant_of_record IN ('provider', 'operator')),
  agreement_ref    TEXT,                                    -- revenue share terms live there
  valid_during     DATERANGE NOT NULL
);

CREATE TABLE service_orders (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  offering_id         UUID NOT NULL REFERENCES service_offerings (id),
  lease_id            UUID NOT NULL REFERENCES leases (id),
  ordered_by_person_id UUID NOT NULL REFERENCES people (id),
  scheduled_for       TSTZRANGE,
  amount              BIGINT,                               -- minor units, if known
  currency            CHAR(3),
  credit_applied      BIGINT NOT NULL DEFAULT 0,            -- who funds it is on the credit's charge code
  charge_id           UUID REFERENCES charges (id),         -- only when the operator collects
  guest_credential_id UUID REFERENCES access_credentials (id),  -- the resident's grant to the provider
  status              TEXT NOT NULL CHECK (status IN ('requested', 'scheduled', 'completed',
                        'cancelled')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE surveys (
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id   UUID NOT NULL,
  name        TEXT NOT NULL,
  trigger     TEXT NOT NULL CHECK (trigger IN ('move_in', 'work_order_completed',
                'renewal_window', 'move_out', 'ad_hoc')),
  version     INT NOT NULL,                 -- questions are versioned; answers cite the version
  questions   JSONB NOT NULL,
  UNIQUE (tenant_id, name, version)
);

CREATE TABLE survey_responses (            -- what the resident said
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  survey_id     UUID NOT NULL REFERENCES surveys (id),
  person_id     UUID NOT NULL REFERENCES people (id),
  lease_id      UUID NOT NULL REFERENCES leases (id),
  work_order_id UUID REFERENCES work_orders (id),        -- the subject, when there is one
  score         SMALLINT,                                -- the headline question
  answers       JSONB NOT NULL,
  responded_at  TIMESTAMPTZ NOT NULL,
  UNIQUE (survey_id, person_id, work_order_id)
);

CREATE TABLE resident_feedback (           -- what a model or a person inferred, kept apart
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  lease_id        UUID NOT NULL REFERENCES leases (id),
  source          TEXT NOT NULL CHECK (source IN ('survey', 'message', 'call', 'review',
                    'staff_note')),
  source_ref      UUID,                    -- the response, message or call it was read from
  sentiment       TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  topics          TEXT[] NOT NULL DEFAULT '{}',   -- 'maintenance', 'noise', 'amenities'
  classified_by   TEXT NOT NULL,           -- 'model:<name>@<version>' or a user id
  escalated_work_order_id UUID REFERENCES work_orders (id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Design decisions behind it:

- **Portal permissions are computed, not stored.** A request from a portal session resolves the person's current `lease_members` rows on every call; there's no "resident user" table whose permissions drift from the lease.
- **Reservations post charges, not balances.** A fee is a `charges` row with the amenity's charge code, reversed on a cancellation the rules refund; a deposit is a charge with its release recorded.
- **Holds expire on read.** A household that starts a booking and abandons it doesn't block the slot past `held_until` ([Expiry Is Enforced on Read](/docs/architecture/reservations-and-holds#expiry-is-enforced-on-read)).
- **The merchant of record is explicit** on every service offering, so the ledger, the owner statement and the disclosure all say the same thing about who sold what.
- **Stated and inferred feedback are separate tables,** and inferred rows name the model and version that produced them, so a disputed label can be traced and a model change can be re-run.
- **Events in, events out.** Surveys and retention flags subscribe to `lease.moved_in`, `work_order.completed` and the renewal window; bookings and orders emit their own events for owner reporting and integrations ([Events & Async Messaging](/docs/architecture/events)).

## Auditing

- **Every message to a resident,** with its purpose, channel, template version, the consent that allowed it and the delivery result ([The Message Log](/docs/architecture/notifications#the-message-log)); for legal notices, a link to the served notice record.
- **Consent changes,** including opt-outs by keyword and their effective time, kept as long as a TCPA claim can be brought.
- **Who saw what in the portal,** especially former roommates and guarantors, since access to a household's records after someone leaves is a common complaint.
- **Amenity rules as policy text,** with versions and effective dates, so a fair housing complaint about pool hours can be answered with the rule in force on the date.
- **AI agent conversations and actions,** with the tools called and the handoffs made ([Auditing AI Actions](/docs/architecture/ai-agents#auditing-ai-actions)).
- **Retention flags and the actions taken on them,** so a renewal decision can be shown to rest on service history, not on complaints or protected characteristics.

## What This Means for the System You Build

- **One identity across the resident's life,** from application to move-out, with permissions derived from current lease roles on every request.
- **Classify every message by purpose** and send it through one gate; a marketing opt-out never silences operational or emergency messages.
- **Treat legal notices as served documents,** with the app message pointing at the notice, not replacing it.
- **Build amenities as reservations,** with exclusion constraints or counters, fees as charges, holds that expire, and rules written about conduct.
- **Record the merchant of record and who funds credits** for every resident service.
- **Trigger surveys from events,** tie answers to their subject, and keep stated and inferred feedback apart.
- **Give AI agents identity checks, deterministic emergency routing and no power to make legal promises,** and hand accommodation requests to people.
- **Make notice to vacate as easy as renewing,** and keep retention signals to service history, explainable and never used for worse offers.
- **Meet WCAG 2.2 AA and translate what residents rely on.**

## References

**Law and guidance**

- [Executive Order 14224: Designating English as the Official Language of the United States](https://www.govinfo.gov/content/pkg/DCPD-202500315/html/DCPD-202500315.htm), revocation of Executive Order 13166, rescission of guidance issued under it, agencies not required to stop producing other-language materials (March 1, 2025)
- [California Civil Rights Department: DFEH settles familial status discrimination case against Montebello landlord](https://calcivilrights.ca.gov/2018/04/10/dfeh-settles-familial-status-discrimination-case-against-montebello-landlord/), pool hours for children and adults, $25,000 settlement (April 10, 2018)
- [California Civil Code section 1942.5](https://california.public.law/codes/civil_code_section_1942.5), retaliation: 180 days after protected acts, and tenants' associations

**Platforms**

- [Entrata: Homebody app](https://www.entrata.com/products/homebody-app), resident app features, move checklist, loyalty, $300 a year in service credits, white label
- [Entrata: ResidentPortal](https://www.entrata.com/products/residentportal), e-documents, community wall, classifieds, events, surveys, newsletters, packages and amenity booking
- [Entrata: Entrata partners with Amenify](https://www.entrata.com/press/entrata-partners-with-amenify), resident services and the $50 move-in and $20 monthly credits (June 9, 2025)
- [Entrata: Entrata launches new AI capabilities to automate leasing, unify communications and surface resident insights](https://www.entrata.com/press/entrata-launches-new-ai-capabilities-to-automate-leasing-unify-communications-and-surface-resident-insights), OXP Communications for SMS and email, Resident Pulse in beta (June 15, 2026)
- [RealPage: Resident portal](https://www.realpage.com/resident-portal/), LOFT Payments, Living and Moving, checklists, utility and internet setup, reservations, points program, renewal framing
- [RealPage: Lumina AI](https://www.realpage.com/platforms/lumina-ai/), the AI Resident Agent's tasks
- [Buildium: Resident Center](https://www.buildium.com/features/resident-center/), payments, autopay, maintenance requests and scheduling, renters insurance, announcements and SMS, documents, apps
- [RentCafe](https://www.rentcafe.com/), the RentCafe Resident Portal's payment and maintenance features
- [EliseAI: SentimentAI](https://eliseai.com/blog/sentimentai), check-ins at renewals, work orders and move-outs, escalation of negative work-order responses (June 16, 2025)
