+++
title = "Business Phone & Contact Center"
nav_title = "Business Phone & Contact"
description = "UCaaS and CCaaS: Teams Phone, Zoom Phone, RingCentral and Google Voice; PSTN connectivity, porting, dynamic 911 location, recording, contact centers."
category = "Workplace & Collaboration Industry"
order = 2021
part = "Meetings and Voice"
tags = ["ucaas", "ccaas", "business-phone", "e911", "number-porting", "call-recording"]
+++

The office phone system moved into the collaboration suite. What used to be a PBX in a closet, a carrier's trunk and a desk phone per employee is now a license on the same account as chat and meetings: an employee's number rings their laptop, their mobile app and a desk phone at once, an auto attendant answers the main line, a call queue spreads support calls across agents, and the admin who manages chat policies also manages dial plans. The industry calls this unified communications as a service (UCaaS); its customer-facing sibling, the contact center with queues, routing, IVR and agent tooling, is contact center as a service (CCaaS).

It's harder than it looks because the phone network comes with obligations that chat and meetings don't have. A phone number belongs to a numbering plan and moves between carriers through a regulated porting process. A call to 911 has to arrive at the right dispatch center with an address a dispatcher can act on, from a softphone that may be in an office on the fourth floor today and a kitchen tomorrow. Recording a call is wiretap law. And every vendor sits on a carrier stack with its own duties. The Hosting & Cloud volume covers those duties from the provider's side: [Phone Numbers & Porting](/books/hosting-and-cloud/phone-numbers-and-porting), [911, CPNI & Telecom Duties](/books/hosting-and-cloud/telecom-duties), [Voice Platforms](/books/hosting-and-cloud/voice-platforms) and [The CPaaS Business](/books/hosting-and-cloud/cpaas-business). This chapter covers the workplace side: how UCaaS vendors package the phone system, the PSTN connectivity models, porting from the customer's chair, emergency calling built on the customer's own network map, call recording, and contact centers.

## How the Platforms Do It

As of October 2026:

| Vendor | PSTN connectivity | Footprint | Contact center | Notes from public sources |
| --- | --- | --- | --- | --- |
| **Microsoft Teams Phone** | Calling Plans (Microsoft as carrier), Operator Connect, Teams Phone Mobile, Direct Routing through a customer-managed SBC | Calling Plans where Microsoft offers them; operators by country | Queues app in Teams Premium; certified partners; compliance recording for call queues | Calling Plans carry a 99.999% reliability SLA; multiple models can mix in one tenant |
| **Zoom Phone** | Native PSTN, Provider Exchange, Premises Peering and Cloud Peering for existing carriers | Native PSTN in more than 45 countries and territories; Provider Exchange in more than 90 | Zoom Contact Center (voice, video, SMS, web chat) and Zoom Virtual Agent | 10-K: Zoom Phone is subject to US federal and international regulation |
| **RingCentral** | Own service, with a CLEC subsidiary certificated in two states | RingEX in 45 countries, numbers in 100 | RingCentral Contact Center (built on NICE) and native RingCX | Subscriptions were over 90% of revenue in 2025 |
| **Google Voice** | Google numbers, or existing carrier numbers through SIP Link | 14 countries | Ring groups and call queuing, not a full contact center | Starter $10 (up to 10 users), Standard $20, Premier $30 per user per month, on top of Workspace |
| **Amazon Connect** | Amazon telephony | Regional | Usage-priced CCaaS | $0.038 per voice minute plus telephony; $0.010 per chat message |

Two business models share the table. **UCaaS is seat-priced**: a phone license per user plus a calling plan or the customer's own carrier, and the vendors' growth story is attaching phone seats to existing meeting and chat seats (the suite fight in Suites, Bundling & Antitrust in the Business part). **CCaaS is often usage-priced**, per minute and per message, because contact center volume follows customers, not employees.

## What a Business Phone System Is

Every UCaaS product assembles the same parts, and the customer's admin configures all of them:

- **Numbers:** direct numbers for users, main and toll-free numbers for the business, numbers for conference bridges. Teams distinguishes user numbers, Audio Conferencing numbers and voice application numbers (auto attendants and call queues), and notes that Teams Phone Mobile supports only user numbers.
- **A dial plan:** extensions, normalization rules, what "9" or "0" means, which users can call internationally.
- **Call handling:** auto attendants (press 1 for sales), call queues and ring groups, hunt groups, transfer, park, forwarding, voicemail, delegation for executives and assistants, shared lines.
- **Endpoints:** desktop and mobile clients, certified desk phones, conference phones and room systems ([Rooms, Devices & the Hybrid Office](/books/workplace-and-collaboration/rooms-and-the-hybrid-office)).
- **PSTN connectivity:** how calls reach the public network, below.
- **Emergency calling,** recording and analytics.

The tenancy model matters for the phone system more than for chat: numbers, emergency addresses and dial plans are per country, so a multinational tenant runs many phone systems under one admin console, with a different carrier and different emergency rules in each.

## Connecting to the Phone Network

Microsoft documents four ways to connect Teams to the PSTN, and they're a clean map of the industry's options because each reappears at other vendors:

- **The vendor is the carrier.** With Microsoft Calling Plans, "PSTN access, phone numbers, emergency screening service in the U.S., and support for your telephone service come from Microsoft." Zoom's native PSTN and Google Voice numbers are the same model. Simplest to buy, least flexible in countries the vendor doesn't serve.
- **A certified carrier plugs in.** Operator Connect lets a customer pick a carrier that "already completed the PSTN integration with Microsoft," enable it in the admin center and assign its numbers; numbers, emergency service, support and SLA come from the carrier. Zoom's Provider Exchange is the analogous program.
- **The mobile number is the work number.** Teams Phone Mobile assigns the number on an employee's SIM as their Teams number through a participating mobile operator.
- **Bring your own carrier.** Direct Routing connects "any PSTN operator" through a certified session border controller that the customer, an integrator or a Direct-Routing-as-a-Service provider procures and manages. Zoom's Premises and Cloud Peering let customers "redirect existing third-party voice circuits to the Zoom Phone Cloud" and keep their carrier, numbers and rates; Google's SIP Link connects existing carrier numbers to Voice.

Microsoft's own advice is to mix them, for example Calling Plans for most users, Teams Phone Mobile for mobile workers, Operator Connect for knowledge workers and Direct Routing in remote regions. Direct Routing has real engineering in it: with media bypass, media flows directly between the Teams client and the SBC rather than through Microsoft's media servers, using ICE with the SBC in ICE-Lite mode, which keeps calls inside the customer's network when both ends are there. The trunk itself is SIP, covered from the provider's side in [SIP Trunking](/books/hosting-and-cloud/voice-platforms#sip-trunking).

## Numbers and Porting

Moving to a UCaaS vendor usually means bringing the business's existing numbers, and porting is where projects slip. The mechanics are regulated and carrier-driven ([Porting In](/books/hosting-and-cloud/phone-numbers-and-porting#porting-in)); what the customer experiences, from Microsoft's documentation of Calling Plan ports as of October 2026:

- **The order must match the losing carrier's records exactly:** account number, the authorized person, service address, business name and billing telephone number. A single port order covers numbers with the same carrier, account, billing number, number type and service address, so a company with several of each submits several orders. Mismatched information is "the most common cause of errors and delays."
- **One order per account at a time.** Ports against the same account are processed in series, an industry practice; overlapping requests get rejected.
- **The losing carrier decides.** In the US the losing carrier's response time is 3 to 5 business days (5 to 7 in Canada), ending in a firm order commitment or a rejection with a category but not the corrected data. "Microsoft has no say in the port approval decision."
- **Plan weeks, not days.** Processing typically takes 7 to 14 days and up to 30; the minimum lead time is five days in the US and ten in Canada; target dates can't be more than 30 days out; orders of 1,000 or more numbers go to a manual desk; and Microsoft recommends a target at least 15 business days out, choosing "predictability over speed."
- **Don't cancel the old service first.** Inactive or disconnected numbers can't be ported, and an account freeze placed to prevent unauthorized ports blocks the legitimate one until removed, which can take one to three weeks.
- **Ports happen in business hours.** US user numbers can be scheduled between 8 a.m. and 8 p.m. Eastern, and many carriers' porting teams stop at 5 p.m., so a late cutover that fails waits until the next day.

The number belongs to the customer, not the vendor, and the reverse port is the customer's exit. A UCaaS vendor that makes porting out slow is holding the customer's phone numbers hostage, which is both a switching-cost tactic and, for interconnected VoIP providers, a regulatory problem ([Porting Out and Number Takeover](/books/hosting-and-cloud/phone-numbers-and-porting#porting-out-and-number-takeover)).

## Emergency Calling on the Customer's Network Map

US law requires multi-line phone systems to let users dial 911 directly and notify someone on site (Kari's Law), and requires calls to carry a dispatchable location: a street address plus floor or room where needed (RAY BAUM's Act). The Hosting & Cloud volume covers both duties and their compliance dates in [911 for VoIP](/books/hosting-and-cloud/telecom-duties#911-for-voip) and [Kari's Law and Hosted Phone Systems](/books/hosting-and-cloud/telecom-duties#kari-s-law-and-hosted-phone-systems). The workplace problem is that the phone is a laptop. It moves between floors, buildings, homes and hotels, and only the customer knows which network jack or access point is on which floor.

So the vendors make the customer's admin draw the map. Teams' dynamic emergency calling, as documented on Microsoft Learn:

- **Emergency addresses and places.** The admin defines civic addresses (validated and geocoded, which is required before an address can be attached to network identifiers) and places within them, such as a floor or wing; each combination gets a location ID.
- **The Location Information Service (LIS) maps the network to those locations.** The admin loads wireless access point BSSIDs, Ethernet switch chassis IDs, switch ports (discovered by the client through LLDP) and subnets, each with a location. When a client starts or its network changes, it asks LIS, and the first match wins in this order: access point, switch and port, switch, subnet.
- **Trusted IP addresses** tell the service the client is on the corporate network before subnet lookups apply; access point and switch lookups happen regardless.
- **Propagation isn't instant:** some network setting changes take up to four hours to reach clients, so a reorganized floor plan is briefly wrong.
- **Some clients can't do it.** Dynamic emergency calling isn't supported on the Teams web client, and Microsoft's advice is to turn off PSTN calling from the web for users of it. Remote workers can share location through operating system location services.
- **Notification is a conferenced security desk.** The emergency calling policy decides who is notified and how; during a 911 call, a security desk can be conferenced in, and the policy can treat the 933 test number differently so tests don't alarm anyone. In the US and Canada, 933 reaches a bot that reads back the caller's number and location and whether a real call would route automatically or be screened first.
- **Direct Routing adds parts:** the SBC must pass location in the SIP INVITE as PIDF-LO, and the customer must connect an emergency routing service provider or configure the SBC for ELIN.

This is the volume's inversion at its most concrete. The legal duty sits with the provider of the phone system, but the data that makes a 911 call find the caller is the customer's network inventory, maintained by the customer's network team. A UCaaS product that doesn't make that inventory easy to load, validate and keep current has a compliance problem it can't fix on its own servers.

## Call Recording

Call recording reuses the meeting recording model ([Recordings, Transcripts & AI Notes](/books/workplace-and-collaboration/recordings-transcripts-and-ai-notes#convenience-and-compliance-recording)) with telephone twists:

- **Convenience recording of PSTN calls** is a calling-policy setting, and in Teams it applies to PSTN calls for users with particular licenses (Microsoft lists E5, or E3 with the Teams Phone add-on).
- **Compliance recording** covers users' inbound and outbound calls under policy, and Compliance Recording for Call Queues records "all agent answered inbound call queue calls" without assigning a policy to each agent. It isn't supported for E911 calls. PSTN callers hear an audio notice in the Teams user's default language.
- **Google Voice** offers call recording on every edition and automatic recording, transcription and AI notes on Premier.

The law is the same wiretap law as meetings, with the twist that a caller's location is unknown, so the playbook's advice holds: announce recording at the start of every call and capture the announcement ([Recording Calls](/docs/compliance/consumer-contact#recording-calls)). A recorded line where customers read card numbers aloud also pulls the recordings into PCI DSS scope ([PCI DSS](/docs/compliance/pci-dss)), which is why contact centers pause recording or route card capture to a separate system.

## Contact Centers

A contact center is a phone system optimized for queues of customers rather than conversations between employees. The parts:

- **Entry points:** numbers, chat widgets, SMS, social messaging, increasingly video. Zoom describes its Contact Center as "optimized for video" and supporting "voice, SMS, and webchat."
- **IVR and self-service:** menus and, now, AI agents that answer or deflect before a human does (Zoom Virtual Agent, RingCentral's AI Receptionist and AI Virtual Assistant). The rules for AI voices and disclosure are the playbook's [Artificial and AI Voices](/docs/compliance/consumer-contact#artificial-and-ai-voices).
- **Routing (ACD):** matching each contact to an available agent by skill, language, priority and wait time.
- **Agent state and workforce management:** available, on a call, wrap-up, break; forecasting and scheduling against service levels.
- **Quality and compliance:** recording, screen recording, scoring, and the supervision regulated firms need.
- **Integration:** the agent's screen shows the customer from the CRM, and every contact writes back to it.

The vendors reach it differently. RingCentral sells a contact center built on NICE's CCaaS technology alongside its own RingCX; Zoom and Microsoft build theirs into the suite; Amazon Connect sells it by usage with no seat licenses. For the customer, the decision is whether the contact center is part of the employee phone system (one vendor, one admin, one number inventory) or a separate specialist system integrated through SIP and the CRM. Outbound campaigns from a contact center bring the dialing and texting rules of [TCPA Consent](/docs/compliance/consumer-contact#tcpa-consent), [Business Texting Registration](/books/hosting-and-cloud/texting-registration) and caller ID attestation under [STIR/SHAKEN](/books/hosting-and-cloud/voice-platforms#stir-shaken-signing-and-attestation), which a customer meets through its vendor's carrier stack.

## The Money

UCaaS revenue is subscription revenue: RingCentral reports subscriptions as "over 90% of our total revenues" for 2025 and 2024, sold through a direct inside sales force and through resellers, distributors and global service providers. Phone seats are sold on top of meeting and chat seats, calling plans or carrier contracts on top of phone seats, and regulatory fees and taxes pass through on the invoice ([Universal Service and Regulatory Fees](/books/hosting-and-cloud/telecom-duties#universal-service-and-regulatory-fees)). The vendor's margin depends on how much of the carrier stack it owns, the same owned-versus-aggregated question as [Owned Network Versus Aggregator](/books/hosting-and-cloud/cpaas-business#owned-network-versus-aggregator); RingCentral, for instance, holds a competitive local exchange carrier subsidiary certificated in two states. Seat counting and resellers are Billing, Seats & Resellers in the Running the Platform part.

## How to Build It

The phone system attaches to `workspaces` (per-country configuration), `members` (users with numbers) and `apps` (auto attendants and queues as voice applications). These tables add connectivity, numbers, porting, the emergency location map and call records.

```sql
CREATE TABLE pstn_connections (            -- how a workspace reaches the phone network
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id       UUID NOT NULL REFERENCES workspaces (id),
  kind               TEXT NOT NULL CHECK (kind IN ('vendor_carrier', 'certified_operator',
                       'mobile_operator', 'customer_sbc')),
  carrier            TEXT,                  -- the operator, for the non-vendor kinds
  country            TEXT NOT NULL,         -- ISO 3166-1
  sbc_fqdn           TEXT,                  -- customer_sbc only
  sends_location     BOOLEAN NOT NULL DEFAULT FALSE,  -- PIDF-LO in the INVITE
  emergency_routing  TEXT,                  -- ERS provider or ELIN, for customer_sbc
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE phone_numbers (
  e164               TEXT PRIMARY KEY,      -- +14255551234
  workspace_id       UUID NOT NULL REFERENCES workspaces (id),
  pstn_connection_id UUID NOT NULL REFERENCES pstn_connections (id),
  usage              TEXT NOT NULL CHECK (usage IN ('user', 'conferencing', 'voice_app')),
  number_type        TEXT NOT NULL CHECK (number_type IN ('geographic', 'toll_free',
                       'mobile')),
  member_id          UUID REFERENCES members (id),
  app_installation_id UUID REFERENCES app_installations (id),  -- auto attendant or queue
  registered_location_id UUID,             -- emergency_locations.id, the static fallback
  state              TEXT NOT NULL CHECK (state IN ('porting_in', 'active', 'porting_out',
                       'released')),
  CHECK (num_nonnulls(member_id, app_installation_id) <= 1)
);

CREATE TABLE number_ports (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id       UUID NOT NULL REFERENCES workspaces (id),
  direction          TEXT NOT NULL CHECK (direction IN ('in', 'out')),
  losing_carrier     TEXT NOT NULL,
  account_number     TEXT NOT NULL,
  billing_number     TEXT NOT NULL,
  service_address    JSONB NOT NULL,
  numbers            TEXT[] NOT NULL,
  full_port          BOOLEAN NOT NULL,
  loa_signed_by      TEXT NOT NULL,         -- the authorized person on the losing account
  target_at          TIMESTAMPTZ NOT NULL,
  state              TEXT NOT NULL CHECK (state IN ('draft', 'submitted', 'foc', 'rejected',
                       'completed', 'cancelled')),
  foc_at             TIMESTAMPTZ,
  rejection_reason   TEXT,                  -- the category the losing carrier gave
  submitted_at       TIMESTAMPTZ
);
-- One open port per losing account: carriers reject overlapping requests.
CREATE UNIQUE INDEX one_open_port_per_account ON number_ports (losing_carrier, account_number)
  WHERE state IN ('submitted', 'foc');

CREATE TABLE emergency_locations (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id       UUID NOT NULL REFERENCES workspaces (id),
  civic_address      JSONB NOT NULL,        -- validated
  place              TEXT,                  -- floor, wing, suite
  latitude           NUMERIC(9,6) NOT NULL, -- geocode, required for dynamic use
  longitude          NUMERIC(9,6) NOT NULL,
  validated_at       TIMESTAMPTZ NOT NULL
);

CREATE TABLE network_locations (           -- the customer's map from network to place
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id       UUID NOT NULL REFERENCES workspaces (id),
  identifier_kind    TEXT NOT NULL CHECK (identifier_kind IN ('wap_bssid', 'switch_port',
                       'switch', 'subnet')),
  identifier         TEXT NOT NULL,         -- BSSID, chassis ID plus port, chassis ID, CIDR
  emergency_location_id UUID NOT NULL REFERENCES emergency_locations (id),
  updated_by         UUID NOT NULL REFERENCES members (id),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, identifier_kind, identifier)
);

CREATE TABLE call_records (                -- CDRs: CPNI, protect and retain accordingly
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id       UUID NOT NULL REFERENCES workspaces (id),
  direction          TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound', 'internal')),
  from_number        TEXT NOT NULL,
  to_number          TEXT NOT NULL,
  member_id          UUID REFERENCES members (id),
  queue_app_id       UUID REFERENCES app_installations (id),
  pstn_connection_id UUID REFERENCES pstn_connections (id),
  emergency          BOOLEAN NOT NULL DEFAULT FALSE,
  location_sent_id   UUID REFERENCES emergency_locations (id),
  location_source    TEXT CHECK (location_source IN ('wap_bssid', 'switch_port', 'switch',
                       'subnet', 'os_location', 'registered', 'none')),
  recorded           BOOLEAN NOT NULL DEFAULT FALSE,
  started_at         TIMESTAMPTZ NOT NULL,
  answered_at        TIMESTAMPTZ,
  ended_at           TIMESTAMPTZ
);
```

Notes on the sketch:

- **Location resolution is a deterministic lookup with a recorded answer.** On a network change, the client sends its BSSID, LLDP chassis and port, and IP and prefix; the service tries `network_locations` in the documented order and returns a location ID. Every emergency call stores which location it sent and which identifier produced it, which is the evidence that the system worked.
- **Clients that can't locate are blocked from PSTN calling** by policy rather than allowed to place 911 calls with no location.
- **Emergency notification is its own path.** A 911 call triggers the security-desk notification from the emergency calling policy, independently of the call's media path, and is never subject to compliance recording.
- **Porting is a state machine around an outside party.** The service validates the order against the customer service record before submitting, refuses overlapping orders per account (the unique index), and tracks the firm order commitment the losing carrier returns.
- **Call records are CPNI.** Access is limited and logged, and retention follows the telecom rules as well as the customer's policy ([CPNI](/books/hosting-and-cloud/telecom-duties#cpni)).
- **Events:** `number.assigned`, `number.port_submitted`, `number.port_foc`, `number.port_rejected`, `number.port_completed`, `emergency_location.changed`, `emergency_call.placed`, `call.recorded` feed the admin center, notifications, billing and the audit log.

## Auditing

- **Every emergency call** with the location sent, how it was resolved, the notification delivered and to whom, kept long enough to answer a regulator or a court.
- **Every change to emergency addresses and the network location map,** with the admin, since a wrong entry routes a 911 call to the wrong place.
- **Every port in and out,** with the letter of authorization, the submitted data, rejections and the completion time.
- **Every number assignment and release,** because a reassigned number receives the previous holder's calls and texts.
- **Recording policy changes and every compliance-recording failure.**
- **Access to call records** by staff and by admins ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).

## What This Means for the System You Build

- **Support several PSTN models in one tenant:** vendor as carrier, certified operators, mobile numbers and the customer's own SBC.
- **Treat numbers as the customer's,** and make porting out as well supported as porting in.
- **Validate port orders against the losing carrier's records before submitting,** serialize them per account, and plan cutovers in business hours.
- **Give the customer's admin an emergency location map** (addresses, places, access points, switch ports, subnets) with validation, geocoding and a documented match order.
- **Record the location sent with every 911 call,** notify the on-site security desk, and block PSTN calling from clients that can't locate.
- **Exempt emergency calls from compliance recording,** and announce recording on every recorded call.
- **Decide whether the contact center is part of the phone system or beside it,** and route outbound campaigns through the dialing, texting and caller ID rules.
- **Protect call records as CPNI.**

## References

**Vendor documentation**

- [Microsoft Learn: PSTN connectivity options](https://learn.microsoft.com/en-us/microsoftteams/pstn-connectivity), Calling Plans, Operator Connect, Teams Phone Mobile and Direct Routing, the 99.999% Calling Plan SLA, number types, mixing models
- [Microsoft Learn: Microsoft Teams call flows](https://learn.microsoft.com/en-us/microsoftteams/microsoft-teams-online-call-flows), Direct Routing media bypass with ICE-Lite on the SBC
- [Microsoft Learn: What's a port order?](https://learn.microsoft.com/en-us/microsoftteams/phone-number-calling-plans/port-order-overview), required information, one order per account, carrier response times, firm order commitments, lead times, large ports, freezes, porting hours
- [Microsoft Learn: Plan and manage emergency calling](https://learn.microsoft.com/en-us/microsoftteams/what-are-emergency-locations-addresses-and-call-routing), emergency addresses, places, location IDs, validation and geocodes, security desk notification
- [Microsoft Learn: Configure dynamic emergency calling](https://learn.microsoft.com/en-us/microsoftteams/configure-dynamic-emergency-calling), LIS, network identifiers and match order, trusted IPs, propagation time, unsupported web client, 933 test calls, PIDF-LO and ERS for Direct Routing
- [Microsoft Learn: Introduction to recording Teams calls, meetings, and events](https://learn.microsoft.com/en-us/microsoftteams/teams-recording-policy), PSTN call recording licensing
- [Microsoft Learn: Microsoft Teams compliance recording (third-party)](https://learn.microsoft.com/en-us/microsoftteams/teams-recording-compliance), compliance recording for call queues, E911 exclusion, PSTN audio notice
- [Microsoft Learn: Plan for Teams events](https://learn.microsoft.com/en-us/microsoftteams/plan-events), the Queues app as a Teams Premium capability
- [Google Workspace: Google Voice](https://workspace.google.com/products/voice/), editions, prices, user limits, ring groups and call queuing, SIP Link, recording and AI notes, 14 countries
- [Amazon Connect pricing](https://aws.amazon.com/connect/pricing/), per-minute voice and per-message chat pricing

**Filings**

- [RingCentral 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1384905/000138490526000021/rng-20251231.htm), subscription share of revenue, RingEX footprint, RingCentral Contact Center on NICE and RingCX, AI products, sales channels, the CLEC subsidiary, E-911 and USF obligations
- [Zoom Communications 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1585521/000158552126000030/zm-20260131.htm), Zoom Phone's native PSTN and Provider Exchange footprint, Premises and Cloud Peering, Zoom Contact Center and Zoom Virtual Agent, regulation of Zoom Phone
