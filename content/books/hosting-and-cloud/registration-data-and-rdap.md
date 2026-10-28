+++
title = "Registration Data & RDAP"
description = "WHOIS to RDAP, GDPR and the Registration Data Policy, redaction, disclosure requests and their clocks, RDRS, privacy and proxy services, and accuracy duties."
category = "Hosting & Cloud Industry"
order = 2165
part = "Domains and DNS"
tags = ["domains", "rdap", "whois", "gdpr", "privacy", "registration-data"]
+++

Every gTLD registration comes with a contact record the registrar must collect, verify, keep accurate, protect, publish in part, and disclose on request to some people and not others. For most of the internet's history that record was public: anyone could query a WHOIS server on port 43 and read the registrant's name, address, phone and email. Since May 2018 it mostly isn't. The registrar now holds personal data under the GDPR and similar laws, publishes a redacted version over RDAP, a JSON protocol with a real access model, and answers requests for the rest under deadlines ICANN sets. The data is the same; who may see it, and how the registrar decides, changed completely.

That makes registration data a privacy system with an operational edge. A trademark owner wants the registrant behind a phishing domain, a police force wants the same for a fraud investigation, a security researcher wants it to link a campaign, and the registrant has a right not to be exposed to any of them without a reason. The registrar has to answer within two business days that it received the request and within 30 days what it decided, with reasons, and has to be able to show later what it held and when. This chapter covers how the record got here, what the Registration Data Policy requires, how RDAP works, disclosure requests and the RDRS, privacy and proxy services, and the accuracy duties in the registrar's contract. Law enforcement process (subpoenas, warrants, emergency requests) follows [Law Enforcement Requests & User Data](/books/user-generated-platforms/law-enforcement-requests#the-operating-model); the GDPR's general machinery is the playbook's [GDPR](/docs/compliance/gdpr). None of this is legal advice.

## How the Providers Do It

Registrars publish how they redact and how they disclose, and the pages converge on a pattern: redact by default, relay messages to the registrant through a form or an anonymized address, accept disclosure requests that state who is asking and why, and send compelled requests down a separate legal path. As of October 2026:

| Provider | Public data by default | Reaching the registrant | Disclosure requests | Stated timing |
| --- | --- | --- | --- | --- |
| **Cloudflare Registrar** | Free redaction of "most contact information categorized as personal data"; registrant state or province and country stay visible; only where the registry permits | A contact form that forwards to the registrant's email | By email, with the requestor's identity, whether it acts for someone else, the data elements, legal basis and rationale, and affirmations of good faith and lawful processing; abusive or incomplete requests may be denied | Acknowledgment typically within two business days, a substantive response within thirty business days |
| **Namecheap** | Not covered on the disclosure page | Not covered on the disclosure page | US court orders and subpoenas to its legal address; UDRP data only to the provider once a case is filed; non-US orders case by case; DSA requests through its EU agent; everything else under a GDPR "Balancing Test", with a listed set of required contents and a statement under penalty of perjury; urgent threats flagged in the subject line with the agency's contact | Prompt confirmation; outcome "within thirty (30) calendar days"; may ban abusive requestors |
| **Porkbun** | WHOIS Privacy free and on by default, except .us; redacted records still show country, state and organization | Not covered on the privacy page | Not covered on the privacy page | Not stated |
| **GoDaddy** | Public WHOIS "no longer shows personal registrant information" | Complaints about Domains By Proxy names go to that service | Requests for non-public data on a legitimate interest; release otherwise only with the customer's permission or valid legal process, with a subpoena for civil or criminal matters | Not stated on the complaints page |
| **Tucows** | Real contact data hidden since after 25 May 2018; accredited third parties use a gated Tiered Access Directory | Not covered | Civil subpoenas from Canadian, Danish, German or US courts and warrants from those countries; others only if domesticated; may notify the customer and delay production so it can challenge; research billed at $150 an hour | Within the time the subpoena sets |
| **ICANN RDRS** | Not a registrar | Not applicable | A central form that routes requests to participating registrars, who decide; launched with 56 registrars covering 51% of domains under management | No ICANN-set deadline; registrars' own and the policy's |

Three practices recur:

- **Redact first, consent to publish.** The policy requires redaction only where law requires it; Cloudflare redacts personal data by default and Porkbun turns its privacy service on by default, without asking where the registrant lives. Only the registrant's consent puts redacted fields back.
- **Two paths for requests.** Compulsory process (a court order, a subpoena, a warrant, a DSA request) goes to legal; a voluntary request on a legitimate interest goes to a balancing test. Namecheap, GoDaddy and Tucows draw the line explicitly, and it matters because the first path is about validity and jurisdiction, the second about necessity and proportionality.
- **The request carries its own justification.** Cloudflare's and Namecheap's required contents track section 10.2 of the Registration Data Policy almost word for word: identity, the elements wanted, the legal basis, the rationale, a good-faith affirmation and an agreement to process lawfully. A request without them is incomplete, not denied on the merits.

## How We Got Here

**1982 to 2004: a public directory.** RFC 812 (1 March 1982) described NICNAME/WHOIS, a directory server on SRI's Network Information Center machine listening on TCP port 43, giving ARPANET users names, mailing addresses, phone numbers and mailboxes. RFC 954 (October 1985) asked that "each individual with a directory on an ARPANET or MILNET host" be in the WHOIS database. RFC 3912 (September 2004) restated the protocol and named its limits: it "has not been internationalised", "has no provisions for strong security" and "lacks mechanisms for access control, integrity, and confidentiality", so it should carry only data meant to be public. ICANN's registrar contracts kept the full contact record public until 2018, so a protocol its own specification called fit only for public data carried personal data for everyone who registered a name.

**2013: accuracy duties.** The 2013 Registrar Accreditation Agreement added the Whois Accuracy Program Specification: validate formats and verify the registrant's email or phone within 15 days of a registration, transfer or change, and suspend or verify manually when the registrant doesn't respond. It also carried an interim Specification on Privacy and Proxy Registrations. [Accuracy](#accuracy) has the details.

**2015 to 2019: RDAP built and mandated.** The IETF's WEIRDS working group finalized the RDAP RFCs in March 2015 (RFC 7480 to 7484: HTTP usage, security, query format, JSON responses and bootstrapping). ICANN set 26 August 2019 as the deadline for gTLD registries and registrars to have an RDAP service running technically.

**2018: GDPR and the Temporary Specification.** The GDPR applied from 25 May 2018. ICANN's Board adopted the Temporary Specification for gTLD Registration Data on 17 May 2018, effective 25 May 2018: personal data became subject to tiered access, listed registrant and contact fields were to be treated as redacted ("REDACTED FOR PRIVACY") unless the contact consented, and each contact's email had to be replaced by an address or web form that forwards messages. It solved the conflict with the law and cost everyone who had relied on public WHOIS (trademark owners, security researchers, law enforcement, other registrars running transfers) their lookup.

**2019: the EPDP and an interim policy.** A temporary specification lasts a year, so the GNSO ran an expedited policy development process. On 15 May 2019 the Board adopted the EPDP Phase 1 recommendations as a new Consensus Policy (Resolution 2019.05.15.02), except Purpose 2 of Recommendation 1 and the part of Recommendation 12 that would have let registrars delete the Organization field. An Interim Registration Data Policy, effective 20 May 2019, required contracted parties to keep implementing measures consistent with the Temporary Specification until the permanent policy took over.

**2021 to 2024: RDAP matures.** RFC 9082 (query format) and RFC 9083 (JSON responses) replaced RFC 7482 and 7483 in June 2021 as STD 95; RFC 9224 (March 2022) replaced the bootstrap RFC 7484. ICANN's 2023 global amendments, approved by the Board on 30 April 2023, took effect on 7 August 2023 and started an RDAP ramp-up period that ended on 3 February 2024, with RDAP service levels and the gTLD RDAP Profile becoming contractual. ICANN published the Registration Data Policy and a new gTLD RDAP Profile on 21 February 2024; RFC 9537 (March 2024) standardized how an RDAP response says which fields were redacted.

**2023 to 2026: requests without a system.** EPDP Phase 2 had recommended a System for Standardized Access/Disclosure (SSAD). Instead of building it, ICANN launched the Registration Data Request Service, a voluntary request router, on 28 November 2023 as a two-year pilot, and the Board directed in October 2025 that it continue for up to two more years. On 12 March 2026 the Board resolved that the SSAD recommendations "are not in the best interests of the ICANN community or ICANN, and therefore does not adopt these recommendations at this time" (Resolution 2026.03.12.10), sending them back for supplemental work to be completed within RDRS's extension, which ends in November 2027.

**2025: WHOIS ends, the policy starts.** The contractual obligation to run WHOIS over port 43 and the web ended on 28 January 2025, when RDAP became "the definitive source" for gTLD registration data. The Registration Data Policy took effect on 21 August 2025, replacing the interim policy, and registries and registrars had to implement the February 2024 RDAP profile after 20 August 2025. A revision published 12 May 2026 added deadlines for urgent requests, effective only once a requestor authentication policy is in place.

## The Registration Data Policy

The policy, effective 21 August 2025, is the consensus policy every gTLD registrar and registry follows for collecting, transferring, publishing and disclosing registration data. Its main sections, as of October 2026:

**Collection (section 6).** The registrar must collect the domain name, its own registrar fields, and the registrant's name, street, city, country, phone and email, with state or province and postal code where the country uses them (6.1). It must offer the registrant a chance to give an organization and collect it if given (6.5). A technical contact is optional for the registrar to offer, and if offered the registrant must be told it can use its own or non-personal details (6.2, 6.3). The administrative and billing contacts are gone; data collected for them before the policy may be deleted once the registrant fields are collected (6.8).

**Transfer to the registry (section 7).** Some fields always go to the registry (7.1). The registrant's name, street, city, country, phone and email (7.3), and the organization, state, postal code and technical fields (7.4), go only "provided an appropriate legal basis exists and data processing agreement is in place", and ICANN doesn't decide whether a legal basis exists. In practice this is a per-registry setting: some registries take the full contact object over EPP, some take none, and the contact objects in [The Objects](/books/hosting-and-cloud/epp-and-domain-data#the-objects) exist only where they do. Data processing agreements are required where law requires them (section 5), which is the [controller and processor](/docs/compliance/gdpr#controllers-processors-and-the-dpa) question for a registrar, its registries and its resellers.

**Publication and redaction (section 9).** RDDS (RDAP, and WHOIS where it still runs) must publish the domain name, registrar, IANA ID, abuse contacts, statuses, dates and nameservers (9.1). Redaction "MUST" apply where law requires it and "MAY" apply where there's a commercially reasonable purpose or limiting it isn't technically feasible (9.2.1), and registrars may, but needn't, distinguish natural from legal persons. When redaction applies, the registrant's name, street, postal code, phone and fax and the technical contact's name and phone must be redacted (9.2.2.1, 9.2.2.2); organization and city may be (9.2.2.3, 9.2.2.4). In place of the email the registrar publishes "an email address or a link to a web form" that doesn't reveal the address (9.2.3). The registrant must be offered the chance to consent to publishing redacted fields, and an organization the registrant agrees to publish must be published (9.2.4, 9.2.6). A privacy or proxy service's full registration data is published in place of its customer's (9.2.5).

**Disclosure (section 10).** A direct link from the registrar's homepage to the request process (10.1), required request contents (10.2), and deadlines: acknowledgment "no more than two (2) business days from receipt", a response "no more than thirty (30) calendar days from acknowledgement" absent exceptional circumstances (10.5), and a denial that "identif[ies] the specific reason(s)" and explains how the registrant's rights were weighed against the requestor's interests (10.6.2). [Disclosure Requests](#disclosure-requests) covers the workflow.

**Retention (section 12).** Data needed for the Transfer Dispute Resolution Policy is kept for no less than 15 months after the registrar's sponsorship ends or after an inter-registrant transfer, longer where law requires and shorter only with an ICANN waiver. The RAA's Data Retention Specification still asks registrars to keep registrant contact data for the sponsorship plus two years, and payment, log and communication records for 180 days after the interaction. The playbook's [Retention Schedules by Record Type](/docs/architecture/data-retention#retention-schedules-by-record-type) is where those numbers live as configuration.

## RDAP

RDAP is registration data over HTTPS and JSON, with a query format, a response format, a way to find the right server, and room for access control that port 43 never had.

**Finding the server.** IANA publishes bootstrap registries as JSON: each has a `services` array pairing entries (TLDs, IP prefixes, AS ranges) with base RDAP URLs. A client matches a domain right to left, label by label, longest match wins, appends the query path to a base URL ending in `/`, tries HTTPS first and caches the registry (RFC 9224). ICANN's Lookup tool and its open-source command-line client do this for anyone.

**Queries.** Lookups are exact paths: `domain/<name>`, `nameserver/<name>`, `entity/<handle>`, `ip/<address>`, `autnum/<number>` and `help`. Searches are patterns: `domains?name=`, `domains?nsLdhName=`, `domains?nsIp=`, `nameservers?name=`, `entities?fn=` and `entities?handle=` (RFC 9082). Clients use GET or HEAD over HTTPS; servers answer 200, redirect with 301, 302, 303 or 307, return 404 when nothing matches, 400 for a malformed query and 429 with `Retry-After` when rate limiting, and are encouraged to send `Access-Control-Allow-Origin: *` for public data (RFC 7480).

**Responses.** A domain object carries `objectClassName`, `ldhName`, `status`, `events`, `entities`, `nameservers`, `links`, `notices` and `remarks`, and the top-level object declares the specifications it follows in `rdapConformance` (RFC 9083). Events have an `eventAction` (registration, reregistration, last changed, expiration, deletion, reinstantiation, transfer, locked, unlocked) and an `eventDate`. Entities carry roles (registrant, technical, administrative, abuse, billing, registrar, reseller, sponsor, proxy, notifications, noc) and their contact data as a jCard in `vcardArray`, whose `fn` must be present but may be empty when the name is redacted. The registrar's `abuse` entity is where reporters find the address the [abuse desk](/books/user-generated-platforms/abuse-desks#intake) publishes.

**Saying what was redacted.** RFC 9537 adds a `redacted` member: an array with one object per redacted field, giving its `name`, a JSONPath to it (`prePath` for a removed field, `postPath` for an emptied, partial or replaced one), a `method` (`removal`, `emptyValue`, `partialValue` or `replacementValue`, defaulting to removal) and an optional `reason`. A client can then tell "no organization" from "organization withheld".

**Registry and registrar.** Where a registry holds no contact data, its RDAP answer carries the domain's statuses, dates and nameservers, and the registrar's RDAP carries the contacts; where the registry holds contacts, both answer. The registrar's service has to be consistent with the registry's on the facts both publish (statuses, expiry, nameservers), which means it reads from the same mirrored state as [Registry Integration](/books/hosting-and-cloud/epp-and-domain-data#registry-integration) keeps.

**Port 43 after the sunset.** The obligation ended on 28 January 2025; the servers didn't all stop. Registrars retire them on their own schedules (Spaceship's TCP WHOIS was retired from 18 March 2026), so clients and abuse tooling that still parse port 43 text need to move. RDAP has room for authenticated, differentiated access (RFC 7481 covers its security services), which is what an SSAD would have used; with SSAD not adopted, non-public data moves through disclosure requests as of October 2026.

## Disclosure Requests

A disclosure request asks the registrar to reveal redacted data about one registration. It isn't a subpoena (which compels) and it isn't an RDAP query (which anyone can make). The registrar is the controller deciding whether to share personal data with a third party, and the decision is a legitimate-interest balancing under the GDPR's [lawful bases](/docs/compliance/gdpr#lawful-bases), made one request at a time and recorded.

**Intake.** The request arrives from the homepage link the policy requires, by email, through RDRS, or attached to a UDRP or court case. The policy's required contents (10.2) are the checklist: the requestor's identity and contact details, whether it's a natural or legal person, authorization (such as a power of attorney) if it acts for someone else, the data elements requested, the legal rights and rationale, an affirmation of good faith, and an agreement to process the data lawfully. A request missing any of them is answered "incomplete" with what's needed, and the clock for that response still runs.

**Resolve to a version.** The request names a domain and usually a time ("the registrant when this phishing page went up"). The registrar resolves the domain to the registrant data row in force at that time, not today's, because the registrant may have changed since and disclosing the new one would be wrong twice. If the domain isn't sponsored by the registrar (it moved, or never was), the answer is "not sponsored", one of RDRS's standard denial reasons.

**Decide.** The balancing weighs the requestor's interest and its necessity against the registrant's rights: Namecheap lists whether the data is necessary, whether less intrusive means exist, whether an established legal mechanism fits better, whether the requestor can be verified, whether it sits in a country without an adequacy decision, and whether the request is specific enough. Requests from trademark owners about a clear infringement, from security teams about a live campaign, and from consumer protection authorities fare differently, and the record should show why. A denial carries the specific reason and the weighing (10.6.2). The registrar may act against abusive requestors and must say so (10.8).

**Respond on the clock.** Acknowledge within two business days, respond within 30 calendar days of acknowledgment. Cloudflare publishes thirty business days for its substantive response, a reminder that each registrar's stated practice has to be checked against the policy's floor.

**Urgent requests.** The 12 May 2026 revision defines urgent requests (imminent threat to life, serious bodily injury, critical infrastructure, or child exploitation) from an "Authenticated Requestor", with acknowledgment within two hours, a response "not to exceed 24 hours absent exceptional circumstances", and any extension notified within 24 hours and capped at 72 hours from receipt (10.7). It applies only once ICANN implements a consensus policy for requestor authentication, which hasn't happened as of October 2026. Until then registrars handle emergencies under their own law enforcement practice; Namecheap asks for urgency in the subject line with the law enforcement agency's contact. My rule is to staff for the two-hour acknowledgment now, because the volume is small and the harm is not.

**The RDRS.** ICANN's Registration Data Request Service routes requests to registrars that choose to take part; it decides nothing and holds no data. It launched on 28 November 2023 with 56 registrars covering 51% of domains under management and 209 requestor accounts, peaked at 95 registrars covering 60% in February 2025, and at the end of the two-year pilot on 30 November 2025 had 80 participating registrars, 13,701 requestor accounts and 3,721 disclosure requests, by ICANN's summary report; several registrars withdrew as the RDRS Standing Committee began drafting its final report. For a registrar, participating means one more intake channel whose requests arrive in a standard shape with a requestor category (law enforcement, IP holder, CSIRT, litigation, and others), which is the best argument for joining: it produces cleaner requests than email does. Its continuation runs to November 2027.

**Compelled requests are a different workflow.** A subpoena, court order, warrant or a DSA request for information is legal process, validated for jurisdiction and form and produced under [Law Enforcement Requests & User Data](/books/user-generated-platforms/law-enforcement-requests#the-operating-model). The disclosure workflow should recognize one and route it there, as Namecheap and Tucows do, rather than balancing it.

## Privacy and Proxy Services

A privacy service shows its own contact details in place of the customer's while the customer remains the registrant; a proxy service is the registrant and licenses the name to the customer. Either way the public record shows the service, and the Registration Data Policy requires the service's full data to be published (9.2.5).

The rules for the services themselves are still the 2013 RAA's interim Specification on Privacy and Proxy Registrations. Registrars and their affiliates must require providers to publish their terms and pricing, a contact for reports of abuse or trademark infringement, their business contact details, and their procedures for when they relay messages to the customer, when they reveal or publish the customer's identity, and when they terminate service; registrars must also escrow the customers' contact data (sections 2.1 to 2.5). The specification was meant to last until an accreditation program replaced it, "until the earlier to occur of (i) January 1, 2017, and (ii)" that program's start, extendable by agreement, and it has been. The Board adopted the Privacy and Proxy Services Accreditation Issues (PPSAI) recommendations on 9 August 2016; implementation was put on hold in 2019 because of overlapping work (the GDPR-era policy), and ICANN restarted it with a new Implementation Review Team after the Registration Data Policy was published in February 2024. As of October 2026 there is no accreditation program in force.

Two consequences for the system. Redaction and privacy services now overlap: a registrar that redacts by default adds little with a privacy service beyond the service's name in the record and its forwarding, and Cloudflare and Porkbun include redaction or privacy free. And the customer behind the service is still the person every request and dispute is about: the UDRP's verification request asks for the full registration data, and the UDRP Rules expect any reveal of the underlying customer to happen before the registrar confirms its lock ([What the Registrar Must Do](/books/hosting-and-cloud/domain-disputes#what-the-registrar-must-do)). The Transfer Policy Review also says adding or removing a registrar's own privacy service isn't a Change of Registrant Data (Recommendation 25.3), so the data model must record the service and the customer separately.

## Accuracy

The 2013 RAA's accuracy duties survived the GDPR untouched, because accurate data and published data are different questions.

- **On registration, transfer in, and registrant change.** Within 15 days, validate that required fields are present, email and phone numbers are in valid formats and postal addresses are properly formatted and internally consistent, and verify the registrant's email (by an affirmative response) or phone (by a code sent by call or SMS) (Whois Accuracy Program Specification, section 1). If the registrant doesn't respond, the registrar "shall either verify the applicable contact information manually or suspend the registration".
- **On changes.** Within 15 calendar days of receiving changed contact data, validate it and, where section 1 requires, verify it, with the same verify-or-suspend rule (section 2).
- **On evidence of inaccuracy.** A bounced email or similar information means re-verifying the email; no affirmative response within 15 days means manual verification or suspension (section 4). A third party's report of inaccurate data means the registrar must "take reasonable steps to investigate" and correct what it learns is wrong (RAA 3.7.8).
- **On willful inaccuracy.** A registrant who willfully provides inaccurate data, willfully fails to update it within seven days of a change, or fails for more than 15 days to respond to an accuracy inquiry is in material breach (RAA 3.7.7.2), and the registrar must suspend or terminate the name or put it on `clientHold` and `clientTransferProhibited` until the data is validated (section 5).
- **On licensing.** A registrant who licenses the name to someone else stays responsible and accepts liability for harm caused by its wrongful use unless it discloses the licensee's identity within seven days to a party with reasonable evidence of actionable harm (RAA 3.7.7.3), the clause proxy services operate under.

The suspension path is shared with abuse: an inaccuracy complaint is a report category at the abuse desk, and a suspension for unverified data is a `domain_locks` row of its own reason with `clientHold`, lifted when verification completes. Accuracy is also why `registrant_data` keeps verification timestamps: the registrar has to prove, to ICANN Compliance, that each version was verified within 15 days or suspended.

## My Default

My default is to redact every personal field for every registrant, natural or legal, and publish only what consent adds, because the policy allows it, the natural-versus-legal distinction is error-prone at sign-up, and a wrongly published individual is a GDPR breach while a wrongly redacted company is a disclosure request. I'd publish a relay form rather than an anonymized address (it can rate-limit and filter), emit RFC 9537 `redacted` members so clients can tell withheld from empty, and run RDAP from the same state the registry integration mirrors.

For disclosure, I'd run one intake for every channel (form, email, RDRS) with the policy's required contents as the form, resolve every request to the registrant version in force at the requested time, route legal process to the legal workflow, and decide the rest with a written balancing per request, inside the policy's two-business-day and 30-day clocks, measured from receipt. I'd join RDRS, because it produces structured requests from identified requestors. The tradeoff that would change it: if a registrar serves mostly businesses in jurisdictions without data protection law, publishing the organization by default (with consent captured at sign-up) cuts disclosure volume a lot, at the cost of a consent flow that has to be right for every individual who registers as an organization.

## How to Build It

The chapter adds `registrant_data`, the versions of each contact as collected, and `disclosure_requests` to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Which version a domain uses, for which role and when, is a `domain_contacts` range from [The Domain Data Model & EPP](/books/hosting-and-cloud/epp-and-domain-data#how-to-build-it).

```sql
CREATE TABLE registrant_data (           -- one version of a contact as collected; never edited
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id            UUID NOT NULL REFERENCES accounts (id),  -- whose customer data it is
  supersedes_id         UUID REFERENCES registrant_data (id),    -- the version it replaced
  person_type           TEXT NOT NULL CHECK (person_type IN ('natural', 'legal',
                          'undeclared')),
  name                  TEXT NOT NULL,
  organization          TEXT,            -- collected if offered (RDP 6.5)
  street                TEXT[] NOT NULL,
  city                  TEXT NOT NULL,
  state_province        TEXT,            -- where the country uses it
  postal_code           TEXT,
  country               CHAR(2) NOT NULL,
  phone                 TEXT NOT NULL,   -- +CC.NNNN form, as EPP expects
  phone_ext             TEXT,
  fax                   TEXT,
  email                 TEXT NOT NULL,
  -- privacy and proxy: the service's row points at the customer's
  pp_service            TEXT NOT NULL DEFAULT 'none' CHECK (pp_service IN ('none',
                          'privacy', 'proxy')),
  pp_provider           TEXT,            -- the provider, if not the registrar's own
  underlying_id         UUID REFERENCES registrant_data (id),  -- the customer behind it
  -- publication and legal basis
  publish_consent       TEXT[] NOT NULL DEFAULT '{}' CHECK (publish_consent <@ ARRAY[
                          'name', 'organization', 'street', 'city', 'state_province',
                          'postal_code', 'phone', 'email']),  -- RDP 9.2.4
  consent_recorded_at   TIMESTAMPTZ,
  collected_via         TEXT NOT NULL CHECK (collected_via IN ('signup', 'checkout',
                          'api', 'reseller', 'transfer_in', 'support', 'migration')),
  -- accuracy: set once, never changed (WAPS sections 1, 2 and 4)
  validated_at          TIMESTAMPTZ,     -- formats and consistency checked
  verify_due_at         TIMESTAMPTZ NOT NULL,  -- 15 days from collection
  verified_at           TIMESTAMPTZ,
  verified_via          TEXT CHECK (verified_via IN ('email', 'phone', 'manual')),
  verification_failed_at TIMESTAMPTZ,    -- no response: the suspension lock follows
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((pp_service = 'none') = (underlying_id IS NULL)),
  CHECK ((cardinality(publish_consent) = 0) = (consent_recorded_at IS NULL)),
  CHECK ((verified_at IS NULL) = (verified_via IS NULL)),
  CHECK (verified_at IS NULL OR verification_failed_at IS NULL)
);
-- A trigger rejects any UPDATE except setting a NULL accuracy column, and any DELETE
-- outside the retention job; a correction is a new row and a new domain_contacts range.

CREATE TABLE disclosure_requests (       -- one request to reveal redacted data
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  received_at           TIMESTAMPTZ NOT NULL,
  channel               TEXT NOT NULL CHECK (channel IN ('web_form', 'email', 'rdrs',
                          'postal')),
  external_ref          TEXT,            -- the RDRS request id
  priority              TEXT NOT NULL CHECK (priority IN ('standard', 'urgent')),
  requestor_name        TEXT NOT NULL,
  requestor_org         TEXT,
  requestor_contact     JSONB NOT NULL,  -- as given; replies go only here
  requestor_type        TEXT NOT NULL CHECK (requestor_type IN ('natural', 'legal')),
  requestor_category    TEXT NOT NULL CHECK (requestor_category IN ('law_enforcement',
                          'ip_holder', 'csirt', 'cybersecurity', 'consumer_protection',
                          'dispute_resolution_provider', 'litigation', 'domain_investor',
                          'research', 'security_researcher', 'other')),  -- RDRS's list
  requestor_authenticated BOOLEAN NOT NULL DEFAULT FALSE,  -- an Authenticated Requestor, once
                                         -- ICANN's authentication policy exists
  on_behalf_of          TEXT,
  authorization_ref     TEXT,            -- power of attorney or similar, in the evidence store
  domain_name           TEXT NOT NULL,   -- as given, A-label normalized
  domain_id             UUID REFERENCES domains (resource_id),  -- null: not sponsored here
  as_of                 TIMESTAMPTZ NOT NULL,  -- the moment the requestor cares about
  registrant_data_id    UUID REFERENCES registrant_data (id),  -- the version in force at as_of
  elements_requested    TEXT[] NOT NULL CHECK (cardinality(elements_requested) > 0),
  legal_basis           TEXT,            -- as claimed
  rationale             TEXT NOT NULL,
  good_faith_affirmed   BOOLEAN NOT NULL,
  lawful_processing_agreed BOOLEAN NOT NULL,
  legal_request_id      UUID REFERENCES legal_requests (id),  -- routed to legal process
  -- clocks, computed by rule and stored (RDP 10.5, 10.7)
  ack_due_at            TIMESTAMPTZ NOT NULL,
  acknowledged_at       TIMESTAMPTZ,
  response_due_at       TIMESTAMPTZ,     -- set on acknowledgment
  clock_rule_version    TEXT NOT NULL,   -- which version of the deadline rule applied
  -- decision
  outcome               TEXT CHECK (outcome IN ('disclosed', 'partially_disclosed',
                          'denied', 'publicly_available', 'not_sponsored', 'incomplete',
                          'routed_to_legal', 'withdrawn')),
  denial_reason         TEXT CHECK (denial_reason IN ('applicable_law',
                          'rights_outweigh_interest', 'not_necessary',
                          'other_mechanism_fits', 'requestor_unverified', 'abusive',
                          'other')),
  balancing_record      TEXT,            -- how the registrant's rights were weighed (10.6.2)
  elements_disclosed    TEXT[],
  decided_by            TEXT,            -- typed actor; never automated for a disclosure
  responded_at          TIMESTAMPTZ,
  registrant_notified_at TIMESTAMPTZ,
  CHECK ((outcome = 'denied') = (denial_reason IS NOT NULL)),
  CHECK (outcome <> 'denied' OR balancing_record IS NOT NULL),
  CHECK ((outcome IN ('disclosed', 'partially_disclosed'))
         = (elements_disclosed IS NOT NULL)),
  CHECK (outcome <> 'routed_to_legal' OR legal_request_id IS NOT NULL)
);

CREATE INDEX disclosure_requests_open ON disclosure_requests (ack_due_at)
  WHERE responded_at IS NULL;
```

Notes on the sketch:

- **Versions, never edits.** A registrant's correction, a sale, a privacy service added: each is a new `registrant_data` row and a new `domain_contacts` range, so "who was the registrant on 3 March" is one as-of query ([Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows)) and a disclosure request or a UDRP verification gets the version that was in force, not today's. The trigger makes immutability a property of the table, not a convention. A change of registrant is also a `domain_transfers` row of kind `inter_registrant` ([Transfers, Locks & Registrar Security](/books/hosting-and-cloud/transfers-and-locks#how-to-build-it)).
- **Accuracy is set once per version.** Validation and verification belong to the version that was checked; a new version starts a new 15-day clock, and a failed verification produces a `domain_locks` row with `clientHold` rather than an edit here.
- **Privacy is a row about a row.** The service's contact data is a version of its own, pointing at the customer's version, so RDAP publishes the service, the verification request from a UDRP provider gets both, and a reveal is a pointer, not a copy.
- **Redaction is computed at publication.** `publish_consent` is the only per-version publication input; what RDAP shows is the policy's rule applied to it (redact everything personal, publish consented fields and the organization if consented), kept as [rules as data](/docs/architecture/rules-as-data#what-belongs-in-data) with the `redacted` member generated from the same rule.
- **Which registry gets what is configuration.** Section 7's "legal basis and data processing agreement" decision is per registry, so it lives with the registry's row from [ICANN, Registries & Registrars](/books/hosting-and-cloud/icann-registries-and-registrars#the-contracts), and `domain_contacts.registry_contact_id` is set only where a contact was sent.
- **The clock is a rule with a version.** Two business days and 30 calendar days today; two hours, 24 hours and 72 hours for authenticated urgent requests once that section takes effect. The deadlines are computed when the request arrives and stored with the rule version, per [Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored), so a later policy change doesn't move an open request's due date.
- **Legal process leaves this table.** A subpoena or court order sets `outcome = 'routed_to_legal'` and links the UGP `legal_requests` row, whose productions record exactly what left; a UDRP or URS provider's request for registration data is part of the proceeding and recorded on its `domain_disputes` row ([Domain Disputes](/books/hosting-and-cloud/domain-disputes#how-to-build-it)).
- **Events:** `registrant_data.collected`, `registrant_data.verified`, `registrant_data.verification_failed`, `disclosure_request.received`, `disclosure_request.acknowledged`, `disclosure_request.decided` and `disclosure_request.overdue` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to RDAP publication, the EPP contact sync, the suspension worker, notifications and the privacy team's queue.

## Auditing

- **Every version and where it went.** Each `registrant_data` row, when it was collected and how, which domains used it for which role and when, and which registries received it under which agreement.
- **Verification evidence.** For every version, validated and verified timestamps within 15 days, or the suspension that followed, because ICANN Compliance audits exactly that.
- **What was published.** The redaction rule version in force and the consent behind any published personal field, so a complaint about exposure can be answered with the consent record ([Consent](/docs/compliance/gdpr#lawful-bases)).
- **Every disclosure decision.** The request as received, the version resolved, the balancing, the elements disclosed, who decided, and both clock timestamps against their deadlines; denials with their stated reason.
- **Access to the data.** Who in support, abuse and legal read a registrant record and why, kept as access logs ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **Retention runs.** What was deleted when sponsorship plus the retention period ended, and what was kept under a legal hold or a longer legal requirement ([Erasure vs Append-Only Records](/docs/architecture/data-retention#erasure-vs-append-only-records)).

## What This Means for the System You Build

- **Store registrant data as immutable versions** linked to domains by ranges, so every question about the past has one answer.
- **Redact everything personal by default** and publish only what the registrant consents to, with RFC 9537 markers.
- **Run RDAP from the same state as the registry integration,** with bootstrap-correct URLs, rate limits and an abuse entity.
- **Verify within 15 days or suspend,** and keep the evidence per version.
- **Build one disclosure intake** with the policy's required contents, stored clocks and a written balancing per decision.
- **Route legal process to legal,** and staff for two-hour urgent acknowledgments before the rule requires it.
- **Model privacy and proxy services as data about data,** so the public record and the real customer are both answerable.

## References

**Policies and contracts**

- [ICANN: Registration Data Policy](https://www.icann.org/en/contracted-parties/consensus-policies/registration-data-policy), 21 August 2025 effective date, collection (6), transfer to registries (5, 7), publication and redaction (9), disclosure requests and deadlines (10), urgent requests and the 12 May 2026 revision (3.8, 3.9, 10.7, Implementation Note 11), retention (12)
- [ICANN: Temporary Specification for gTLD Registration Data](https://www.icann.org/resources/pages/gtld-registration-data-specs-en), Board adoption 17 May 2018, effective 25 May 2018, tiered access, redaction and anonymized email
- [ICANN: Interim Registration Data Policy for gTLDs](https://www.icann.org/resources/pages/interim-registration-data-policy-en), effective 20 May 2019, superseded on 21 August 2025
- [ICANN Board: Resolutions of 15 May 2019](https://www.icann.org/resources/board-material/resolutions-2019-05-15-en), EPDP Phase 1 adoption (2019.05.15.02) and the parts not adopted (2019.05.15.06, 2019.05.15.07)
- [ICANN Board: Approved Resolutions, 12 March 2026](https://www.icann.org/en/board-activities-and-meetings/materials/approved-resolutions-regular-meeting-of-the-icann-board-12-03-2026-en), SSAD recommendations not adopted (2026.03.12.10), RDRS extension ending November 2027 (2026.03.12.11)
- [ICANN: 2013 Registrar Accreditation Agreement](https://www.icann.org/resources/pages/approved-with-specs-2013-09-17-en), registrant duties (3.7.7.2, 3.7.7.3), investigating inaccuracy (3.7.8), the Whois Accuracy Program Specification (sections 1, 2, 4, 5), the Specification on Privacy and Proxy Registrations (2.1 to 2.5 and its term), the Data Retention Specification (1.1, 1.2)
- [ICANN: 2023 Global Amendments (RDAP)](https://www.icann.org/resources/pages/global-amendment-2023-2022-12-22-en), Board approval 30 April 2023, effective 7 August 2023, ramp-up to 3 February 2024, WHOIS obligations ending 28 January 2025
- [ICANN: RDAP background](https://www.icann.org/resources/pages/rdap-background-2018-08-31-en), WEIRDS RFCs in March 2015, 26 August 2019 technical deadline, the February 2024 gTLD RDAP Profile and its requirement after 20 August 2025
- [ICANN: Launching RDAP, sunsetting WHOIS (27 January 2025)](https://www.icann.org/en/announcements/details/icann-update-launching-rdap-sunsetting-whois-27-01-2025-en), RDAP as the definitive source from 28 January 2025, ICANN Lookup
- [ICANN: Seeks volunteers for the PPSAI Implementation Review Team (20 May 2024)](https://www.icann.org/en/announcements/details/icann-seeks-volunteers-for-the-ppsai-implementation-review-team-20-05-2024-en), Board adoption on 9 August 2016, the 2019 hold and the 2024 restart
- [GNSO Council: Transfer Policy Review Recommendations Report (31 March 2025)](https://gnso.icann.org/sites/default/files/policy/2025/draft/gnso-council-recommendations-report-to-icann-board-tpr-wg-31mar25-en.pdf), Recommendation 25.3 on privacy services and Change of Registrant Data

**RDRS**

- [ICANN: Registration Data Request Service](https://www.icann.org/rdrs-en), what RDRS does, the pilot dates and continuation
- [ICANN: RDRS Two-Year Pilot Summary Report (February 2026)](https://www.icann.org/en/system/files/files/rdrs-two-year-pilot-summary-report-27feb26-en.pdf), launch on 28 November 2023 with 56 registrars and 51% of domains under management, the February 2025 peak of 95 registrars and 60%, totals at 30 November 2025, requestor and denial categories

**Specifications**

- [RFC 812: NICNAME/WHOIS](https://www.rfc-editor.org/rfc/rfc812.html), 1 March 1982, the SRI-NIC directory on TCP port 43
- [RFC 954: NICNAME/WHOIS](https://www.rfc-editor.org/rfc/rfc954.html), October 1985, registration of individuals in the WHOIS database
- [RFC 3912: WHOIS Protocol Specification](https://www.rfc-editor.org/rfc/rfc3912.html), September 2004, no internationalization, security or access control
- [RFC 7480: HTTP Usage in RDAP](https://www.rfc-editor.org/rfc/rfc7480.html), March 2015, methods, status codes, rate limiting and CORS, and its companion RFCs 7481 to 7484
- [RFC 9082: RDAP Query Format](https://www.rfc-editor.org/rfc/rfc9082.html), June 2021, lookup and search paths
- [RFC 9083: JSON Responses for RDAP](https://www.rfc-editor.org/rfc/rfc9083.html), June 2021, object classes, common members, event actions, statuses, entity roles and jCard
- [RFC 9224: Finding the Authoritative RDAP Service](https://www.rfc-editor.org/rfc/rfc9224.html), March 2022, IANA bootstrap registries and matching
- [RFC 9537: Redacted Fields in RDAP](https://www.rfc-editor.org/rfc/rfc9537.html), March 2024, the `redacted` member, paths and methods

**Providers**

- [Cloudflare: WHOIS redaction](https://developers.cloudflare.com/registrar/account-options/whois-redaction/index.md), redacted fields, state and country shown, the contact form, free, registry permitting
- [Cloudflare: WHOIS requests](https://developers.cloudflare.com/registrar/whoisrequests/index.md), required contents, two business days to acknowledge, thirty business days to respond
- [Namecheap: Domain Registration Data Disclosure Policy and Guide (Wayback Machine capture, 20 October 2026)](https://web.archive.org/web/20261020164901/https://www.namecheap.com/legal/general/domain-registration-data-disclosure-policy-guide/), legal process paths, UDRP disclosure to the provider, the Balancing Test and its required contents, urgent requests, 30 calendar days
- [Porkbun: How to Configure WHOIS Privacy Service](https://kb.porkbun.com/article/97-how-to-configure-whois-privacy-service-porkbun), free and on by default, .us excluded, fields shown when redacted
- [GoDaddy: Complaint Mechanisms](https://www.godaddy.com/help/godaddy-complaint-mechanisms-40875), no personal data in public WHOIS, legitimate-interest requests, subpoenas, Domains By Proxy
- [Tucows: Whois use and information](https://tucowsdomains.com/help/whois-use-and-information/), redaction after 25 May 2018, the Tiered Access Directory, accepted jurisdictions, customer notice, fees
- [Spaceship: TCP WHOIS sunset (Wayback Machine capture)](http://web.archive.org/web/20260914111020/https://www.spaceship.com/blog/tcp-whois-sunset/), port 43 retired from 18 March 2026
