+++
title = "Voice Platforms"
description = "Voice from the provider's side: SIP trunking, STIR/SHAKEN signing and attestation, the Robocall Mitigation Database, and call labeling and branded calling."
category = "Hosting & Cloud Industry"
order = 2183
part = "Communications Platforms"
tags = ["voice", "sip", "stir-shaken", "robocalls", "rmd", "branded-calling"]
+++

A voice platform connects its customers' software to the telephone network: it hands them numbers that ring their applications, lets their applications place calls to anyone, and runs SIP trunks that connect their phone systems and contact centers to the public network. Since 2019 it has also been a link in the chain the FCC built to stop illegal robocalls. A US voice provider has to sign the calls it originates with its own certificate, vouch for whether its customer is entitled to the number it is calling from, file a robocall mitigation plan in a public database and recertify it every year, and refuse traffic from providers that aren't listed there. A provider that fails can be removed from the database, and removal, as one law firm put it, "effectively cut off from the U.S. phone network."

This chapter covers voice from the provider's side: how VoIP and call authentication came to be, SIP trunking, STIR/SHAKEN signing and attestation (including the 2025 rule on third-party signing), the Robocall Mitigation Database and its enforcement, call labeling and branded calling, and how to model calls. The telemarketing and robocall consent rules that bind the customer are the playbook's [Calls, Texts & Email](/docs/compliance/consumer-contact#tcpa-consent); 911, CPNI and universal service duties are [911, CPNI & Telecom Duties](/books/hosting-and-cloud/telecom-duties); toll fraud is [Telecom Fraud](/books/hosting-and-cloud/telecom-fraud). The view from a business that places calls through a provider is Field Operations' [Outbound Calls](/books/field-operations/contact-center#outbound-calls).

## How the Providers Do It

Every US voice provider now publishes guidance on the same three obligations, and their pages are the best public description of how the rules work in practice. As of October 2026:

| Provider | Network | What it publishes |
| --- | --- | --- |
| **Bandwidth** | Its own network as a CLEC; voice is about 60% of its revenue; emergency calling in 42 countries | How attestation and analytics interact ("the ABCs of attestation and analytics"); its 911 API; Maestro for orchestrating third-party voice, contact center, AI and fraud tools |
| **Telnyx** | Claims its own switch and private IP network (vendor claim) | An explainer of the FCC's Eighth Report and Order on third-party authentication and its September 18, 2025 effective date |
| **Twilio** | Software layer over carriers and upstream providers | Voice dialing geographic permissions, high-risk number ranges and toll fraud guidance |
| **Vonage** | API platform inside Ericsson | Network APIs through Ericsson's Aduna venture |
| **TransNexus** (call authentication vendor) | Software for providers | RMD recertification guidance: the March 1 deadline and the February 1 window |

The common pattern: a provider signs what it originates, verifies what it terminates, files in the RMD, checks that every upstream it accepts traffic from is listed, and sells branded calling and analytics on top.

## How It Got Here

Voice over IP made calls cheap to originate from anywhere and caller ID trivial to fake; each step since has tried to restore accountability without giving up the IP network:

| Date | Step | What it solved | What it cost |
| --- | --- | --- | --- |
| March 1999 | RFC 2543 defines the Session Initiation Protocol (SIP) | Call setup over IP between any endpoints | Caller identity is whatever the sender writes in a header |
| June 2002 | RFC 3261 replaces it as the SIP standard | A stable protocol for VoIP and trunking | Caller identity is still unsigned |
| May 19, 2005 | The FCC requires interconnected VoIP providers to provide 911 (FCC 05-116) | Emergency calls from VoIP phones | VoIP becomes a regulated telephone service ([911, CPNI & Telecom Duties](/books/hosting-and-cloud/telecom-duties#911-for-voip)) |
| February 2018 | RFCs 8224 (authenticated identity in SIP), 8225 (PASSporT) and 8226 (certificates) | A signed, verifiable claim about the calling number | Certificates, signing infrastructure and a governance system |
| May 2019 | RFC 8588 adds the SHAKEN extension to PASSporT, carrying the attestation level | Attestation as part of the signed token | Providers must decide, per call, how much they vouch for |
| December 30, 2019 | The TRACED Act (Public Law 116-105) | A statutory mandate for call authentication and robocall mitigation | Every voice provider gets compliance duties |
| March 31, 2020 | FCC 20-42 requires STIR/SHAKEN in the IP portions of networks by June 30, 2021 | A deadline | Non-IP networks need a mitigation plan instead |
| April 20, 2021 | The Robocall Mitigation Database opens (DA 21-454), with filings due June 30, 2021 and downstream providers barred from accepting unlisted providers' traffic from September 28, 2021 | A public list of who is accountable | A listing becomes a license to carry traffic |
| November 22, 2024 | FCC 24-120 (Eighth Report and Order) limits third-party signing: the provider must set attestation and sign with its own token; effective September 18, 2025 | Signing services that let anyone appear authenticated | Every obligated provider needs its own token and certificate |
| December 2024 to August 2025 | A show cause order to 2,411 providers (DA 24-1235), removal of 185 (DA 25-694) and then over 1,200 (DA 25-737) from the RMD | Enforcement of deficient filings | Downstream providers had to stop accepting their traffic within two days |
| January 2025 to March 2026 | FCC 24-135 (adopted December 30, 2024) adds annual recertification by March 1, fines for false or late filings and a fee; first recertification March 1, 2026 | Stale and fraudulent filings | A yearly filing and penalties |
| July 9 and September 9, 2026 | New proposals: know-your-upstream-provider and STIR/SHAKEN changes; screening of new RMD filers, faster removal and re-entry safeguards | Remaining gaps | More rules expected |

The direction is consistent: the FCC has moved from requiring a technology (sign your calls) to requiring accountability for traffic (know whom you carry, and be removable if you don't).

## SIP Trunking

A SIP trunk connects a customer's phone system (a PBX, a contact center platform, a voice application) to the provider over IP. It has two directions:

- **Origination (inbound):** calls to the customer's numbers arrive at the provider from the public network and are sent to the customer's SIP endpoint or application.
- **Termination (outbound):** the customer's system sends SIP INVITEs to the provider, which routes the call to the destination network.

The provider authenticates the customer's system by IP address allowlist, SIP credentials or both, and limits it by concurrent calls (channels) and calls per second. Media (RTP) flows separately from signaling, often through the provider's media servers. Every number on the trunk needs an emergency address if the trunk can dial 911 ([911, CPNI & Telecom Duties](/books/hosting-and-cloud/telecom-duties#911-for-voip)), and every outbound call needs a calling number the customer is entitled to use, which is where call authentication starts.

The provider's commercial units are per minute (by destination and number type), per channel or per trunk, and per number, with carrier and regulatory fees passed through like messaging's ([The CPaaS Business](/books/hosting-and-cloud/cpaas-business#how-the-money-is-made)).

## STIR/SHAKEN: Signing and Attestation

STIR (the IETF's Secure Telephone Identity Revisited) defines the cryptography; SHAKEN (Signature-based Handling of Asserted information using toKENs, ATIS-1000074, produced with the SIP Forum) defines how US carriers use it. When a provider originates a call, it creates a PASSporT, a signed token carrying the calling number, the called number, a timestamp and an attestation level, and attaches it to the SIP INVITE in an Identity header. The terminating provider fetches the signer's certificate, verifies the signature and passes the result to its analytics.

The pieces a provider operates:

- **An SPC token** from the STI Policy Administrator (iConectiv), which proves the provider is authorized to get certificates.
- **A certificate** from an approved STI Certification Authority, tied to the provider's identity.
- **A signing service** on outbound calls, and a verification service on inbound calls.
- **An attestation decision** for every call it originates.

The three attestation levels:

| Level | Meaning | When the provider uses it |
| --- | --- | --- |
| **A (full)** | The provider knows the customer and knows the customer is authorized to use the calling number | The number is the provider's own, assigned to this customer, or the customer proved it controls a number held elsewhere |
| **B (partial)** | The provider knows the customer but not its right to the number | A trunk customer sending calls from numbers the provider can't verify |
| **C (gateway)** | The provider can't authenticate the source | International gateways and traffic handed over from networks it can't identify |

Attestation isn't blocking. Bandwidth's explainer makes the point that terminating carriers and their analytics vendors (it names First Orion, Hiya, Nomorobo, TNS and YouMail) weigh attestation differently, and an A-attested call can still be labeled spam. What attestation does is attach the originating provider's name to the call, which is what traceback and enforcement need.

### Signing Through a Third Party

Many smaller providers bought signing as a service. The FCC's Eighth Report and Order (FCC 24-120, released November 22, 2024; 90 FR 40241, effective September 18, 2025) allows a provider with a STIR/SHAKEN obligation to use a third party to sign only if the provider itself sets the attestation level and the call is signed with the provider's own SPC token and certificate. A provider claiming implementation in the RMD must therefore register with the STI-PA, hold an Operating Company Number, file FCC Form 499-A and use an approved CA, per Telnyx's summary. The practical effect: every obligated provider needs its own identity in the system, and a signing vendor becomes an operator of the provider's keys, not a substitute for them.

## The Robocall Mitigation Database

The RMD is the FCC's public list of voice providers, each with a certification of its STIR/SHAKEN status and a robocall mitigation plan describing how it knows its customers and stops illegal traffic. Its force comes from the downstream rule: since September 28, 2021, providers may not accept calls directly from a provider that isn't listed. Listing is the license to send traffic onto the US network.

What a provider files and keeps current, as of October 2026:

- **A certification** of its STIR/SHAKEN implementation status.
- **A robocall mitigation plan** describing the steps it takes to avoid carrying illegal robocalls, including how it knows its customers.
- **Updates within 10 business days** of a change, and **annual recertification by March 1** (TransNexus says the window opens February 1), under FCC 24-135. The first recertification was due March 1, 2026, after the OMB approval notice (91 FR 5242) set that date.
- **Penalties:** a $10,000 base forfeiture for false or inaccurate filings and $1,000 for late updates. A $100 filing fee is adopted but not yet effective; it waits on notice to Congress, system changes and a Federal Register effective-date notice.

The FCC has shown it will remove providers in bulk. In December 2024 it ordered 2,411 providers to show cause why they shouldn't be removed for deficient filings (DA 24-1235). It removed 185 in August 2025 (DA 25-694) and over 1,200 on August 25, 2025 (DA 25-737); downstream providers had to stop accepting their traffic by August 27, and a removed provider can refile only with the Bureau's consent. Two further proposals are open as of October 2026: a September 9, 2026 notice on screening new filers, faster removal and re-entry safeguards, and a July 9, 2026 notice on knowing your upstream provider and STIR/SHAKEN.

For the platform, the RMD is two jobs. The first is its own filing, which must describe what the platform actually does; a plan that promises know-your-customer checks the platform doesn't run is a false filing. The second is checking every provider it accepts traffic from: a wholesale customer or upstream partner that drops out of the database must be cut off within the window the order sets, so the check runs daily against the database, not at onboarding only.

## Call Labeling and Branded Calling

What the called party sees is decided by the terminating carrier and its analytics vendor, not by the originating provider. Labels like "Spam Likely" come from analytics over call patterns, complaints and attestation; a provider can't buy its customers out of them, but it can stop sending traffic that earns them and help legitimate customers register their numbers with the analytics vendors.

Branded calling adds a verified name, logo and call reason to the display. CTIA's Branded Calling ID builds on STIR/SHAKEN with Rich Call Data carried in the signed token, with the business vetted by authorized partners. CTIA signed Verizon to its program on September 15, 2025, per Light Reading, which did not confirm a launch date. For the provider, branded calling is a vetting workflow (like texting registration) plus signing with the extra claims, and it only displays on networks that have joined.

## The Alternatives

A provider chooses how much of the call authentication chain to own:

| Approach | Model | Strengths | Failure modes |
| --- | --- | --- | --- |
| **Sign with your own token, in house** | Own SPC token, certificate and signing service | Full control of attestation; no vendor in the path | Key management, certificate renewal and signing availability are the provider's problem |
| **Own token, third-party signing service** | A vendor signs with the provider's token and certificate; the provider sets attestation | Compliant under FCC 24-120 without building signing | The vendor holds the provider's keys; its outage is the provider's |
| **Upstream signs for you** | The provider has no STIR/SHAKEN identity; an upstream signs as itself | No setup | Not compliant for a provider with its own obligation since September 18, 2025; the upstream's attestation is at best B |
| **Resell another CPaaS's voice** | The platform is a customer of a voice provider and doesn't originate calls itself | No RMD filing of its own if it isn't a voice service provider | The upstream's rules and attestation govern every call |

My default for a platform that originates calls is its own SPC token and certificate with a signing service it can replace, A attestation only for numbers the platform assigned or verified, B for trunk customers' unverified numbers, and a daily RMD check of every upstream and wholesale customer. I'd only build signing in house once call volume makes the vendor's per-signature cost or availability a measurable problem.

## How to Build It

The chapter adds SIP trunks, calls, attestations and RMD filings to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). A SIP trunk is a resource of kind `sip_trunk`, in the core model's kind list; calls, like messages, are operational records that reference resources and emit usage events on minute meters (`voice.minutes`, with direction, destination and number type as dimensions).

```sql
CREATE TABLE sip_trunks (                -- side table: kind = 'sip_trunk'
  resource_id      UUID PRIMARY KEY REFERENCES resources (id),
  auth_mode        TEXT NOT NULL CHECK (auth_mode IN ('ip_allowlist', 'credentials', 'both')),
  allowed_cidrs    CIDR[],
  max_channels     INT NOT NULL,         -- concurrent calls
  max_cps          NUMERIC NOT NULL,     -- calls per second
  origination_uri  TEXT,                 -- where inbound calls go
  emergency_enabled BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE calls (                     -- one row per call leg; partitioned by month
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id       UUID NOT NULL REFERENCES accounts (id),
  direction        TEXT NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  trunk_id         UUID REFERENCES resources (id),        -- kind = 'sip_trunk'
  number_id        UUID REFERENCES resources (id),        -- the platform number involved
  calling_e164     TEXT NOT NULL,        -- as presented
  called_e164      TEXT NOT NULL,
  sip_call_id      TEXT NOT NULL,
  upstream_id      TEXT REFERENCES upstream_providers (id), -- who handed it to us, or whom we sent it to
  status           TEXT NOT NULL CHECK (status IN ('initiated', 'ringing', 'answered',
                     'completed', 'busy', 'no_answer', 'failed', 'blocked')),
  block_reason     TEXT,                 -- 'rmd_unlisted_upstream', 'geo_permission', 'fraud'
  started_at       TIMESTAMPTZ NOT NULL,
  answered_at      TIMESTAMPTZ,
  ended_at         TIMESTAMPTZ,
  billable_seconds INT
);

CREATE TABLE attestations (              -- what the platform signed or verified on each call
  call_id          UUID PRIMARY KEY REFERENCES calls (id),
  role             TEXT NOT NULL CHECK (role IN ('signed', 'verified')),
  level            CHAR(1) CHECK (level IN ('A', 'B', 'C')),
  basis            TEXT,                 -- signed: 'assigned_number', 'verified_ownership',
                                         -- 'customer_known_only', 'gateway'
  orig_id          UUID,                 -- the SHAKEN origination identifier
  certificate_ref  TEXT,                 -- signer's certificate (ours, or the one we verified)
  signer_ocn       TEXT,
  verification     TEXT CHECK (verification IN ('passed', 'failed', 'no_signature')),
  rich_call_data   JSONB                 -- branded calling claims, when present
);

CREATE TABLE rmd_filings (               -- our filing, and every provider we exchange traffic with
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  subject          TEXT NOT NULL CHECK (subject IN ('self', 'upstream', 'downstream_customer')),
  provider_name    TEXT NOT NULL,
  rmd_number       TEXT,                 -- the database's filing number
  upstream_id      TEXT REFERENCES upstream_providers (id),
  account_id       UUID REFERENCES accounts (id),  -- a wholesale customer
  shaken_status    TEXT CHECK (shaken_status IN ('complete', 'partial', 'none')),
  listed           BOOLEAN NOT NULL,
  checked_at       TIMESTAMPTZ NOT NULL, -- when we last read the database
  filed_at         TIMESTAMPTZ,          -- self: when we filed or recertified
  plan_ref         TEXT,                 -- self: the plan document as filed
  removal_order    TEXT                  -- e.g. 'DA 25-737', when removed
);
```

The attestation decision is a function of the call and the platform's records, run at signing time:

```sql
-- A for numbers we assigned to this account or whose control it proved; B for a known
-- customer presenting a number we can't vouch for; C never on calls we originate.
SELECT CASE
  WHEN EXISTS (SELECT 1 FROM resource_identifiers ri
               JOIN resources r ON r.id = ri.resource_id
               WHERE ri.kind = 'e164' AND ri.value = $calling_e164
                 AND r.account_id = $account_id AND ri.held_during @> now())
    THEN 'A'
  WHEN EXISTS (SELECT 1 FROM sender_identities si
               JOIN resources r ON r.id = si.resource_id
               WHERE si.channel = 'voice_caller_id' AND si.identifier = $calling_e164
                 AND si.status = 'verified' AND r.account_id = $account_id
                 AND r.exists_during @> now())
    THEN 'A'
  ELSE 'B'
END AS level;
```

A verified caller ID is the record of a customer proving control of an outside number (a verification call or text to it): a `sender_identities` row of channel `voice_caller_id`, whose resource's `exists_during` is its validity range.

Notes on the sketch:

- **Attestation follows held identifiers.** Because numbers are held for a range in `resource_identifiers`, "is this customer entitled to this number right now" is a query, and A attestation is never given for a number the customer released last week.
- **Every upstream is checked against the RMD continuously.** A daily job reads the database, updates `rmd_filings.listed` and blocks inbound traffic from an unlisted upstream with a `block_reason` the operations team can see.
- **The platform's own filing is versioned with its plan,** so the plan in force on any date can be produced, and recertification is a dated row, not a calendar reminder.
- **Signing keys are infrastructure secrets** with rotation and monitoring like TLS keys; a certificate that expires stops every outbound call from being signed.
- **Events:** `call.completed` (which emits the minute usage), `call.blocked`, `attestation.signed`, `rmd.upstream_removed` and `rmd.recertification_due` go through the [outbox](/docs/architecture/events#the-transactional-outbox).

## Auditing

- **The attestation given on every originated call** and its basis, because traceback requests and enforcement start from the signer.
- **The RMD status of every upstream and wholesale customer over time,** to show traffic was refused once a provider was removed.
- **The platform's own RMD filings and plans,** each version with when it was filed and recertified.
- **Call records** with the calling number as presented and the trunk or number it came from, so a complaint resolves to a customer.
- **Verified caller IDs** for numbers the platform doesn't own, with how control was proved.

## What This Means for the System You Build

- **Get your own STIR/SHAKEN identity** (SPC token, certificate, OCN) if you originate calls; a signing vendor can sign with it, not instead of it.
- **Decide attestation from records,** A only for numbers the customer holds or proved, and log the basis for every call.
- **Treat the RMD as a license:** file truthfully, update within ten business days, recertify by March 1, and check every upstream and wholesale customer daily.
- **Block traffic from unlisted providers** automatically and visibly.
- **Help legitimate customers with labeling** through analytics registration and branded calling, and stop traffic that earns spam labels instead of arguing with them.
- **Model trunks as resources and calls as usage,** with emergency addresses on every number that can dial 911.

## References

**Standards**

- [RFC 2543: SIP: Session Initiation Protocol](https://www.rfc-editor.org/info/rfc2543), March 1999
- [RFC 3261: SIP: Session Initiation Protocol](https://www.rfc-editor.org/info/rfc3261), June 2002, obsoleting RFC 2543
- [RFC 8224: Authenticated Identity Management in SIP](https://www.rfc-editor.org/info/rfc8224), February 2018
- [RFC 8225: PASSporT](https://www.rfc-editor.org/info/rfc8225), February 2018
- [RFC 8226: Secure Telephone Identity Credentials: Certificates](https://www.rfc-editor.org/info/rfc8226), February 2018
- [RFC 8588: PASSporT Extension for SHAKEN](https://www.rfc-editor.org/info/rfc8588), May 2019
- [ATIS: SHAKEN (ATIS-1000074-E)](https://atis.org/resources/signature-based-handling-of-asserted-information-using-tokens-shaken-atis-1000074-e/), the SHAKEN standard and its errata

**Statutes, orders and rules**

- [TRACED Act, Public Law 116-105](https://www.govinfo.gov/app/details/PLAW-116publ105), approved December 30, 2019
- [Federal Register: Call Authentication Trust Anchor (FCC 20-42)](https://www.govinfo.gov/content/pkg/FR-2020-04-21/html/2020-07585.htm), adopted March 31, 2020, and the SHAKEN origins
- [Federal Register: FCC 20-42 summary](https://www.federalregister.gov/api/v1/documents/2020-07585.json), STIR/SHAKEN in IP networks by June 30, 2021
- [FCC: DA 21-454 (PDF)](https://docs.fcc.gov/public/attachments/DA-21-454A1.pdf), the RMD's opening on April 20, 2021, the June 30 deadline and the September 28, 2021 downstream prohibition
- [Federal Register: Call Authentication Trust Anchor (FCC 24-120)](https://www.federalregister.gov/api/v1/documents/2025-15809.json), 90 FR 40241, third-party authentication rules effective September 18, 2025
- [Federal Register: FCC 24-135 final rule](https://www.federalregister.gov/documents/full_text/html/2026/01/06/2026-00010.html), 91 FR 343, RMD rule changes effective February 5, 2026 except PRA items and the fee
- [Federal Register: OMB approval of RMD collections](https://www.federalregister.gov/api/v1/documents/2026-02311.json), 91 FR 5242, recertification from March 1, 2026
- [Federal Register: Improving the Effectiveness of the Robocall Mitigation Database (September 9, 2026)](https://www.federalregister.gov/documents/2026/09/09/2026-18366/improving-the-effectiveness-of-the-robocall-mitigation-database-call-authentication-trust-anchor), the new filer-screening and removal proposals
- [Federal Register: FCC 05-116, IP-Enabled Services and E911](https://www.govinfo.gov/content/pkg/FR-2005-06-29/html/05-12828.htm), VoIP 911 adopted May 19, 2005

**In practice**

- [Bandwidth: The ABCs of attestation and analytics](https://www.bandwidth.com/blog/abcs-of-attestation-and-analytics/), attestation levels, analytics vendors, A-attested calls labeled spam
- [Telnyx: Understanding the FCC's Eighth Report and Order](https://support.telnyx.com/en/articles/10806916-understanding-the-fcc-s-eighth-report-and-order-on-third-party-authentication), own SPC token and certificate, STI-PA registration, OCN, Form 499-A
- [Wiley: FCC removes over 1,200 providers from the RMD](https://www.wiley.law/alert-FCC-Enforcement-Action-Removes-Over-1200-Providers-from-Robocall-Mitigation-Database), the show cause order, the removals and their effect
- [TransNexus: RMD recertification guidance](https://transnexus.com/blog/2026/rmd-recertification-guidance/), March 1 recertification, the February 1 window, update deadlines, forfeitures and the delayed fee
- [Light Reading: Verizon to roll out Branded Calling ID](https://www.lightreading.com/5g/verizon-to-roll-out-branded-calling-id-on-wireless-network), CTIA's program and the September 15, 2025 agreement
- [Bandwidth: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1514416/000151441626000017/band-20251231.htm), voice share of revenue, 911 coverage, Maestro, TRACED Act and STIR/SHAKEN named
- [Twilio: Voice dialing geographic permissions](https://www.twilio.com/docs/voice/tutorials/voice-dialing-geographic-permissions), high-risk ranges and toll fraud guidance
