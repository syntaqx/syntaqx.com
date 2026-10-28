+++
title = "Phone Numbers & Porting"
description = "Phone numbers from the platform's side: the NANP, where inventory comes from, VoIP numbering rules, the number lifecycle, porting, and SIM swap rules."
category = "Hosting & Cloud Industry"
order = 2180
part = "Communications Platforms"
tags = ["phone-numbers", "porting", "nanp", "numbering", "sim-swap"]
+++

A phone number is the CPaaS equivalent of an IP address: a scarce, administered identifier the platform leases to a customer for a while, that carries a reputation with it, and that someone will later ask about by value and date. Unlike an IP address, a number also belongs to its user in a legal sense. US law gives subscribers the right to take their number to another carrier, so a platform has to accept numbers ported in from elsewhere, give them up when a customer ports out, and stop a fraudster from porting one out in the customer's name. It also has to get numbers in the first place, which means either holding numbering resources itself, under FCC rules that now require certifications from VoIP providers, or buying them from someone who does.

This chapter covers the number from the platform's side: how US numbering came to be administered the way it is, where a platform's inventory comes from, the number lifecycle from search to release, porting in and out, and the port-out and SIM swap rules that are adopted but, as of October 2026, still not in force. Registering a number for business texting is [Business Texting Registration](/books/hosting-and-cloud/texting-registration); the reassigned numbers database a sender checks before calling an old number is the playbook's [Reassigned Numbers](/docs/compliance/consumer-contact#reassigned-numbers).

## How the Providers Do It

Every CPaaS sells the same verbs (search, buy, configure, release, port in), and they differ in how much inventory they hold and how much of porting they automate. As of October 2026:

| Provider | Inventory | Porting | Published prices, as of October 2026 |
| --- | --- | --- | --- |
| **Twilio** | Local, toll-free, mobile and short code numbers through its API; bring-your-own-number for numbers whose service stays elsewhere | Port-in requests with documents and status through the console and API | Local $1.15 a month, toll-free $2.15, bring-your-own-number $0.50 |
| **Bandwidth** | Its own numbering resources as a CLEC in 49 states and DC | Ports onto its own network | Not captured |
| **Telnyx** | "7M+ active phone numbers" and porting in "50+ countries" (vendor claims) | Port-in through its portal and API | Not captured |
| **Plivo** | Local and toll-free numbers by API | Port-in on request | Local $0.50 a month, toll-free $1.00 |
| **Bird** | Numbers by country | Publishes a porting explainer that names the federal field list | Not captured |

The common practice: a number is searchable by country, area code, rate center or pattern; a purchase assigns it to the customer's account and project immediately; capabilities (voice, SMS, MMS, fax, emergency calling) are flags on the number that depend on the route behind it; a port-in is a separate, slower order that ends with the number appearing in the same inventory.

## How It Got Here

US numbering is a shared national resource administered under contract to the FCC, and almost every rule a platform follows today was added to stop a specific abuse or remove a specific lock-in:

| Date | Step | What it solved | What it cost |
| --- | --- | --- | --- |
| 1947 | AT&T develops the North American Numbering Plan "to simplify and facilitate direct dialing of long-distance calls"; implementation begins in 1951 | One numbering scheme across the US, Canada and the Caribbean | A finite space of area codes and exchanges |
| 1984 | Bell System divestiture moves number administration from AT&T to Bellcore | Neutral administration among competing carriers | Numbers became a regulated allocation |
| May 1993 | Toll-free numbers become portable between carriers; a "RespOrg" manages each number's records in the toll-free Service Management System | Businesses keep their 800 numbers when they switch carriers | A separate registry and responsible-organization role for toll-free |
| 1996 | The Telecommunications Act gives local carriers "the duty to provide, to the extent technically feasible, number portability" (47 U.S.C. 251(b)(2)) | Competition for local service | Every carrier must support porting, and numbers are no longer tied to one network |
| July 2, 1996 | The FCC releases its First Report and Order on number portability (FCC 96-286), effective August 26, 1996 | The rules and timetable for local number portability | The portability database and its per-query costs |
| October 9, 1997 | The FCC names Lockheed Martin as NANP administrator; Neustar takes over in December 1999 | A neutral administrator chosen by the regulator | Administration by government contract |
| November 24, 2003 | Wireless carriers in the top 100 metropolitan areas must support number portability | Mobile subscribers keep their numbers | Ports between mobile and fixed networks ("intermodal"), and the port-out fraud that came with them |
| 2010 and 2015 | The FCC limits the fields a carrier may require for a simple port (47 CFR 52.36; 75 FR 35315, amended 80 FR 66480) | Ports fail less often for trivial mismatches | Fewer checks against a fraudulent port |
| July 22, 2015 | Somos launches the Texting and Smart Services (TSS) Registry | A registry of which provider may text-enable a toll-free number | Text enablement becomes its own authorization |
| December 1, 2020 | SomosGov is awarded the combined contract for the NANP Administrator, Pooling Administrator and Reassigned Numbers Database, combined as "NANPA" | One administrator for numbering | Contract option periods; the current one runs to November 30, 2026 |
| November 15, 2023 | The FCC adopts SIM swap and port-out fraud rules for wireless carriers (FCC 23-95) | Account takeover through a moved number | Compliance waived until OMB review and a compliance-date notice, still pending as of October 2026 |
| August 8, 2024 | New applicants for direct access to numbers must make robocall, public safety and national security certifications and ownership disclosures | Number access for providers that enable robocalls | A heavier application for VoIP providers |
| December 18, 2025 | FCC 25-86 extends the certifications to existing authorization holders; the rule is effective March 19, 2026 (91 FR 7153), but the existing-holder filing has no compliance date yet | Bad actors already holding numbers | A filing every holder will owe once OMB approves the collection |

The table explains the shape of the system. Portability made the number the customer's, not the carrier's, which is why a platform can neither keep a number a customer wants to move nor hand one to someone else on a phone call. Pooling and utilization rules made numbers something a provider must justify needing. And the robocall era made access to numbers a privilege the FCC can condition on who the provider is and whom it serves.

## The Numbering Plan

A NANP number is ten digits: a three-digit area code (NPA), a three-digit central office code (NXX) and a four-digit line number. Numbers are assigned to carriers in blocks for a rate center, the geographic unit that decides whether a call is local; a "local" number on a CPaaS is a number from some carrier's block in some rate center, whatever network now serves it. Toll-free numbers sit outside the geographic plan and are managed through the toll-free registry by RespOrgs, defined in 47 CFR 52.101 as "the entity chosen by a toll free subscriber to manage and administer the appropriate records in the toll free Service Management System." Short codes (five and six digits) aren't NANP numbers at all; they are leased from the carriers' own registry ([Business Texting Registration](/books/hosting-and-cloud/texting-registration#short-codes)).

Two administrators matter to a platform that holds numbers directly. NANPA administers area codes and central office codes; the Pooling Administrator hands out thousand-number blocks within a code so that a carrier doesn't have to take ten thousand numbers to serve a rate center. Both are run by SomosGov under the same FCC contract as of October 2026.

## Where a Platform's Numbers Come From

A platform's inventory has four possible sources, and most mix them:

| Source | How it works | Strengths | Failure modes |
| --- | --- | --- | --- |
| **Own numbering resources** | The platform, as a carrier or as an interconnected VoIP provider with direct access, applies to NANPA and the Pooling Administrator for codes and blocks | Lowest cost per number; control over capabilities and porting | Utilization rules, months-to-exhaust forecasts, certifications, and state commissions; only for a provider with carrier or direct-access standing |
| **Upstream provider** | The platform leases numbers from an owned-network provider or another CPaaS and resells them | No regulatory footprint; broad coverage | The upstream controls availability, capabilities and port-outs; a number's route depends on a contract |
| **Ported in** | The customer brings a number from another carrier | The customer keeps its published number | Slow, paperwork-heavy, and fails on mismatched details |
| **Bring your own number / hosted messaging** | Voice stays with the existing carrier, and the platform is authorized to send and receive texts on the number | No port; a landline or toll-free number becomes textable | Text enablement must be authorized by the number's owner; an unauthorized one draws a carrier fine ([Sending a Text](/books/hosting-and-cloud/sending-a-text#filtering-and-carrier-fines)) |

### Growth Numbering

A provider holding numbering resources can't simply ask for more. Under 47 CFR 52.15(g)(4), an application for growth numbering resources needs a Months-to-Exhaust Worksheet showing utilization by rate center for the prior six months and a twelve-month projection; carriers may "maintain no more than a six-month inventory" per rate center; and the applicant must meet a utilization threshold, now 75%, in the rate center where it wants more. The consequence for the product is that idle inventory is a regulatory problem as well as a cost: a provider that hoards numbers for fast provisioning can't get new ones where it needs them.

### VoIP Direct Access and Its Certifications

Interconnected VoIP providers can get numbers directly from the administrators rather than through a carrier partner, under authorization from the FCC. The FCC has steadily conditioned that access on who the provider is. Since August 8, 2024, new applicants have had to make robocall mitigation, public safety and national security certifications and disclose their ownership. FCC 25-86 (Third Report and Order, adopted December 18, 2025, WC Dockets 13-97, 07-243 and 20-67) extends those certifications to existing authorization holders, citing the TRACED Act's know-your-customer provisions for number access. The order was published at 91 FR 7153 and took effect March 19, 2026, but the rule itself says compliance with the existing-holder filing "will not be required until this paragraph (g)(3)(x)(F) is removed or contains a compliance date." The FCC submitted the information collection to OMB on July 28, 2026; as of October 2026, the compliance date is pending. A companion further notice published February 12, 2026 proposes more changes.

For a platform, that means three records: the authorization itself and its conditions, the certifications filed and when, and the ownership disclosures, kept current, because a false certification is the cheapest way to lose access to numbers entirely.

## The Number Lifecycle

A number on a platform passes through the same states whatever its source:

1. **Available.** In inventory, searchable, not assigned.
2. **Reserved.** Held for a customer during checkout or a search session, released if not bought.
3. **Assigned.** Leased to an account and project, with capabilities configured (webhooks for inbound messages and calls, a messaging service or campaign, an emergency address for voice). Billing starts. In the core model this is a `resources` row of kind `phone_number` with its `phone_numbers` side table, and a `resource_identifiers` row of kind `e164` with the period it is held.
4. **Ported out or released.** The customer moves the number away, or gives it back. A released number leaves the customer's account immediately.
5. **Aging.** Before a released number goes back to inventory it rests, so that calls and texts meant for the last holder (and the reputation attached to it) fade before a new customer gets it. Providers set their own aging periods; I treat the period as a published rule per number type, not a constant.
6. **Quarantined.** A number tied to abuse, a carrier complaint or a law enforcement request is kept out of inventory until it is cleared.
7. **Returned.** The number goes back to the upstream or the administrator when the platform no longer needs it, which also keeps utilization within the rules.

Two things make the lifecycle more than a status column. Numbers move between customers, so every question asked later ("who sent this text from this number on March 3?") is answered by the identifier's held range, not by the current holder, the same rule the core model applies to IP addresses. And a recycled number carries obligations for the next holder's customers: a caller who contacts a reassigned number without checking the FCC's Reassigned Numbers Database takes the consent risk, which the playbook covers in [Reassigned Numbers](/docs/compliance/consumer-contact#reassigned-numbers).

## Porting In

A port moves a number's service from one provider to another while the number stays the same. The gaining provider submits a Local Service Request (LSR) to the losing provider, which validates it against the customer's account and either confirms a date (a Firm Order Commitment) or rejects it. The rules a platform designs around are federal:

- **Intervals (47 CFR 52.35).** A simple wireline or intermodal port completes within one business day; a non-simple port within four. A business day is Monday to Friday, 8 a.m. to 5 p.m. at minimum, and a complete request received between 8 a.m. and 1 p.m. local time (in the portability region's time zone) activates at midnight. Intermodal includes interconnected VoIP.
- **Fields (47 CFR 52.36).** For a simple port, the losing carrier may require only a short list: the ported telephone number, account number, ZIP code, company code, new network service provider, desired due date, purchase order number, version, number portability direction indicator, customer carrier name abbreviation, requisition type and status, activity, initiator's telephone number and agency authority status. A passcode is optional unless the end user asked for one and was assigned it. Bird's explainer makes the practical point: account name and service address aren't on the list, so a losing carrier can't reject a simple port for a misspelled business name.

What happens before the LSR is industry practice rather than rule, and no public rule spells it out: the gaining platform collects a Letter of Authorization from the customer naming the numbers and authorizing the port, and often a copy of a recent bill or a customer service record from the losing carrier, so the fields match the first time. Rejections are mostly mismatches (account number, PIN, ZIP), partial ports (moving some numbers off an account that has others), and numbers that are under contract or locked.

The platform's port-in product is therefore a long-running workflow with an external counterparty: draft, documents collected, submitted, rejected with a reason and resubmitted, confirmed for a date, activated, and the number's messaging and calling routes switched at activation. Texting on a ported-in number also needs the number assigned to a registered campaign before traffic flows ([Business Texting Registration](/books/hosting-and-cloud/texting-registration#how-to-build-it)).

## Porting Out and Number Takeover

The same rules let a customer leave, and let a fraudster pretend to be the customer. A port-out to a criminal's account moves the victim's calls and texts, including one-time passcodes, to the attacker; a SIM swap does the same within one mobile carrier. The FCC's response, FCC 23-95 (adopted November 15, 2023, WC Docket 21-341), applies to wireless (CMRS) providers, including resellers, and requires:

- **Secure authentication** before a SIM change or a port-out: biographical data, account information, recent payment and call detail records don't count as secure, and SMS alone is discouraged.
- **Immediate notice before** a SIM change or port-out request is processed.
- **A free account lock** against both, at the customer's option.
- **Failed-attempt procedures,** an annual review of authentication methods, employee training, no access to customer proprietary network information before authentication, and three years of records of SIM change requests and fraud metrics.

The order was effective January 8, 2024, except for its information-collection sections, which were delayed. In DA 24-649 (July 5, 2024), the Wireline Competition Bureau responded to a petition from CTIA, CCA and NCTA by waiving compliance with all of the rules, including those not subject to OMB review, until OMB completes its review and the FCC publishes a compliance date; it denied the petitioners' requested March 10, 2025 date. The current rule text, 47 CFR 64.2010(h)(9), still says "compliance with this paragraph (h) will not be required until this paragraph is removed or contains a compliance date." As of October 2026, the Federal Register shows no compliance-date notice, only Unified Agenda entries listing the proceeding as a long-term action.

The rules bind mobile carriers, not most CPaaS. A platform's own port-out exposure is different but real: its customers' numbers can be ported away by someone who learns the account number and PIN, and a business that loses its main number loses its customers' calls. The defensible practice, which follows the FCC's model even where the FCC's rule doesn't apply:

- **A port-out PIN per account or number,** set by the customer, stored as a hash, required on every port-out validation.
- **A port-out lock** the customer can switch on, with a deliberate path to switch it off (from an authenticated session, with notice).
- **Notice before release:** when a port-out request arrives, tell the account's owners before confirming it, through a channel other than the number being ported.
- **Records** of every port-out request, the validation result and the notice sent.

## The Alternatives

A customer that needs numbers has four ways to get them, and a platform should offer most of them:

| Approach | Model | Strengths | Failure modes | Who uses it |
| --- | --- | --- | --- | --- |
| **Lease from the CPaaS** | Buy a new number by API | Instant, cheap, fully configurable | A new number has no recognition; customers must learn it | Most new applications, masked-number marketplaces, verification |
| **Port in** | Move an existing number's service | Keeps the published number | Days to weeks; rejections; a partial port can break the old account | Businesses moving their main lines and contact centers |
| **Hosted messaging / bring your own number** | Text-enable a number whose voice stays elsewhere | No port, no downtime on voice | Needs the number owner's authorization; carrier fines for unauthorized text enablement | Businesses with landline or toll-free numbers that want texting |
| **Own numbering** | Become a carrier or VoIP provider with direct access | Margin and control | Utilization rules, certifications, state filings, 911 and CPNI duties | Owned-network CPaaS and large UCaaS providers |

My default for a platform without a carrier footprint is to lease from one owned-network upstream per country, with a second as a fallback for availability, and to offer port-in and hosted messaging as products from day one, because the customers who matter most already have numbers. I'd apply for direct access only when number costs or port control are a measurable share of margin, and not before the platform is ready to file and keep current the certifications FCC 25-86 requires.

## How to Build It

The chapter adds the platform's number inventory and port requests to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model), and port-out protection to `phone_numbers`. A number the customer holds is a `resources` row of kind `phone_number`; inventory that nobody holds isn't a resource, so it has its own table.

```sql
ALTER TABLE phone_numbers
  ADD COLUMN rate_center        TEXT,          -- NANP geographic numbers
  ADD COLUMN source             TEXT NOT NULL DEFAULT 'upstream' CHECK (source IN
                                  ('own_block', 'upstream', 'ported_in', 'hosted')),
  ADD COLUMN upstream_id        TEXT REFERENCES upstream_providers (id),
  ADD COLUMN port_out_pin_hash  BYTEA,         -- set by the customer; never stored plain
  ADD COLUMN port_out_locked    BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN emergency_address_id UUID;        -- voice; 911, CPNI & Telecom Duties adds the table

CREATE TABLE number_inventory (          -- numbers the platform can assign, held or not
  e164          TEXT PRIMARY KEY,        -- +1NXXNXXXXXX
  country       CHAR(2) NOT NULL,
  number_type   TEXT NOT NULL CHECK (number_type IN ('local', 'toll_free', 'short_code',
                  'mobile', 'national')),
  npa           TEXT,
  rate_center   TEXT,
  region        TEXT,                    -- state or province
  source        TEXT NOT NULL CHECK (source IN ('own_block', 'upstream', 'ported_in')),
  upstream_id   TEXT REFERENCES upstream_providers (id),
  block_ref     TEXT,                    -- the code or thousand-block it belongs to
  capabilities  TEXT[] NOT NULL,         -- what the route supports: 'sms', 'mms', 'voice', 'fax'
  status        TEXT NOT NULL CHECK (status IN ('available', 'reserved', 'assigned', 'aging',
                  'quarantined', 'returned')),
  status_until  TIMESTAMPTZ,             -- reservation expiry, end of aging
  resource_id   UUID REFERENCES resources (id),  -- set while assigned
  quarantine_reason TEXT,
  CHECK ((status = 'assigned') = (resource_id IS NOT NULL)),
  CHECK (status NOT IN ('reserved', 'aging') OR status_until IS NOT NULL)
);

CREATE TABLE port_requests (             -- a port in or out, as a long-running workflow
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id        UUID NOT NULL REFERENCES accounts (id),
  direction         TEXT NOT NULL CHECK (direction IN ('in', 'out')),
  numbers           TEXT[] NOT NULL,     -- E.164; one request may move many
  counterparty      TEXT NOT NULL,       -- the losing carrier (in) or gaining carrier (out)
  port_type         TEXT NOT NULL CHECK (port_type IN ('simple', 'non_simple', 'toll_free')),
  status            TEXT NOT NULL CHECK (status IN ('draft', 'documents_pending',
                      'submitted', 'rejected', 'confirmed', 'activated', 'cancelled')),
  loa_document_ref  TEXT,                -- the customer's letter of authorization
  account_number_hash BYTEA,             -- validation fields kept hashed, compared not shown
  pin_hash          BYTEA,
  zip               TEXT,
  foc_date          DATE,                -- the date the losing side confirmed
  rejection_code    TEXT,
  rejection_detail  TEXT,
  owner_notified_at TIMESTAMPTZ,         -- port-out: notice before release
  validation_result TEXT CHECK (validation_result IN ('pin_match', 'pin_mismatch',
                      'locked', 'not_found')),
  submitted_at      TIMESTAMPTZ,
  activated_at      TIMESTAMPTZ,
  created_by        TEXT NOT NULL        -- typed actor
);

CREATE TABLE numbering_authorizations (  -- the platform's own standing to hold numbers
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  kind             TEXT NOT NULL CHECK (kind IN ('clec_certificate', 'voip_direct_access',
                     'resporg', 'tss_registry')),
  jurisdiction     TEXT NOT NULL,        -- 'US', 'US-CA'
  reference        TEXT NOT NULL,        -- docket, certificate or entity id
  certifications   JSONB NOT NULL DEFAULT '{}',  -- what was certified, e.g. under FCC 25-86
  filed_at         TIMESTAMPTZ,
  valid_during     TSTZRANGE NOT NULL
);
```

Notes on the sketch:

- **Inventory is not a resource; a held number is.** A number gets a `resources` row, a `phone_numbers` side row and an `e164` identifier when it is assigned, and the identifier's `held_during` closes when it is released. `number_inventory.resource_id` points at the current holder only; history lives on `resource_identifiers`, whose exclusion constraint makes two simultaneous holders impossible.
- **Aging and quarantine are states with an end.** `status_until` makes the aging period explicit and lets a job return numbers to `available` when it passes; a quarantined number stays out until a person lifts it with a reason.
- **Utilization is a query.** Assigned over total per rate center and block, over time, is the number a growth application needs; keeping `block_ref` and `rate_center` on inventory makes it computable.
- **Ports are workflows with a counterparty.** Each status change is an event with the counterparty's response attached; a rejection keeps its code so the most common ones can be fixed in the form before submission next time.
- **Port-out validation never reveals secrets.** The PIN and account number are compared as hashes and the result recorded; a support agent can see that a request failed validation, not what was entered.
- **Events:** `number.assigned`, `number.released`, `number.quarantined`, `port.submitted`, `port.rejected`, `port.confirmed`, `port.activated`, `port_out.requested` (which triggers the owner notice) go through the [outbox](/docs/architecture/events#the-transactional-outbox). Activation of a port-in fires the routing change and the campaign assignment together.

## Auditing

- **Who held each number, when,** from `resource_identifiers`, for abuse reports, carrier complaints and law enforcement requests ([Law Enforcement Requests & User Data](/books/user-generated-platforms/law-enforcement-requests)).
- **Every port request** with its documents, validation result, owner notice and the counterparty's responses, because a disputed port-out is a claim against the platform.
- **Inventory utilization by rate center over time,** for growth applications and for the platform's own purchase decisions.
- **Numbering authorizations and certifications,** with what was certified and when, ready for the existing-holder filing once FCC 25-86's compliance date is set.

## What This Means for the System You Build

- **Treat numbers like IP addresses:** held for a range, attributed by instant, aged before reuse, quarantined after abuse.
- **Keep inventory separate from holdings,** with utilization computable by rate center.
- **Build porting as a workflow** with an external counterparty, rejection codes and resubmission, designed around the one-business-day interval and the federal field list.
- **Protect port-outs** with a hashed PIN, an optional lock and notice before release, following FCC 23-95's model even though its compliance date is still pending as of October 2026.
- **Offer hosted messaging** alongside porting, with the owner's authorization recorded before a number is text-enabled.
- **Track your numbering authorizations and certifications** as data, because access to numbers now depends on them.

## References

**Statutes and regulations**

- [47 U.S.C. 251](https://www.law.cornell.edu/uscode/text/47/251), the duty to provide number portability in section 251(b)(2)
- [Federal Register: Telephone Number Portability, First Report and Order (1996)](https://www.federalregister.gov/api/v1/documents/96-18477.json), FCC 96-286, released July 2, 1996, effective August 26, 1996
- [CPUC: Wireless local number portability begins (November 24, 2003)](https://docs.cpuc.ca.gov/published/News_release/31849.htm), the wireless portability start in the top 100 metropolitan areas
- [Federal Register search: wireless number portability from November 24, 2003](https://www.federalregister.gov/api/v1/documents.json?conditions[term]=%22number%20portability%22%20%22November%2024%2C%202003%22), federal rule and notice text confirming the date
- [47 CFR 52.15](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-47?part=52&section=52.15), growth numbering, the months-to-exhaust worksheet, the six-month inventory, the 75% threshold, and the existing-holder filing paragraph
- [47 CFR 52.35](https://www.law.cornell.edu/cfr/text/47/52.35), porting intervals and the 1 p.m. cutoff
- [47 CFR 52.36](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-47?part=52&section=52.36), the fields a carrier may require for a simple port
- [47 CFR 52.101](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-47?part=52&section=52.101), the responsible organization and the toll-free SMS database
- [47 CFR 64.2010](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-47?part=64&section=64.2010), the SIM change and port-out rules and the compliance-date paragraph
- [Federal Register: Protecting Consumers from SIM-Swap and Port-Out Fraud (2023)](https://www.govinfo.gov/content/pkg/FR-2023-12-08/html/2023-26338.htm), FCC 23-95 requirements and effective dates
- [FCC: DA 24-649 (PDF)](https://docs.fcc.gov/public/attachments/DA-24-649A1.pdf), the waiver of all the SIM swap and port-out rules pending OMB review and a compliance-date notice
- [Federal Register search: SIM-Swap (FCC)](https://www.federalregister.gov/api/v1/documents.json?conditions[term]=%22SIM-Swap%22&conditions[agencies][]=federal-communications-commission&order=newest), no compliance-date notice as of October 2026
- [FCC: FCC 25-86, Numbering Policies for Modern Communications (PDF)](https://docs.fcc.gov/public/attachments/FCC-25-86A1.pdf), certifications for existing direct-access holders and the TRACED Act basis
- [Federal Register: FCC 25-86 final rule](https://www.federalregister.gov/api/v1/documents/2026-03066.json), 91 FR 7153, effective March 19, 2026
- [Federal Register: FCC 25-86 rule text (PDF)](https://www.govinfo.gov/content/pkg/FR-2026-02-17/pdf/2026-03066.pdf), the paragraph deferring the existing-holder filing
- [Federal Register search: Numbering Policies for Modern Communications](https://www.federalregister.gov/api/v1/documents.json?conditions[term]=%22Numbering+Policies+for+Modern+Communications%22&conditions[agencies][]=federal-communications-commission&order=newest&conditions[publication_date][gte]=2026-01-01), the OMB submission of July 28, 2026 and the companion notice

**Administrators and registries**

- [NANPA: 2025 Annual Report (PDF)](https://www.nanpa.com/sites/default/files/2026-03/2025_NANPA_AnnualReport_FINAL.pdf), the NANP's history, administrators and the current contract term
- [NANPA: About](https://www.nanpa.com/about), implementation of the plan from 1951
- [Somos: FCC awards SomosGov the NANPA, PA and RNDA contract](https://www.somos.com/FCC_Awards_SomosGov_Contract_for_NANPA_PA_and_RNDA), the December 1, 2020 award
- [Somos: Launch of the TSS Registry](https://www.somos.com/insights/somos-launches-texting-and-smart-services-tss-registry), text enablement for toll-free numbers from July 22, 2015
- [Florida PSC: Order on Centel's 800 number portability tariff (1993)](https://www.floridapsc.com/library/Orders/1993/05828-1993_93-0820.ord.doc), toll-free portability in May 1993

**In practice**

- [Twilio: SMS pricing for the United States](https://www.twilio.com/en-us/sms/pricing/us), number prices including bring-your-own-number
- [Plivo: SMS pricing for the United States](https://www.plivo.com/sms/pricing/us/), number prices
- [Telnyx: Global communications](https://telnyx.com/global-communications), active numbers and porting countries (vendor claims)
- [Bird: What is number porting](https://bird.com/explained/numbers/what-is-number-porting-and-how-does-a-port-in-work), the federal field list in practice
- [Bandwidth: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1514416/000151441626000017/band-20251231.htm), CLEC authorization in 49 states and DC
