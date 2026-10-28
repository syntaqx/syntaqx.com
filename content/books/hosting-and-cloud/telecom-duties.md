+++
title = "911, CPNI & Telecom Duties"
description = "The telephone-company duties a voice platform inherits: 911 and dispatchable location, Kari's Law, CPNI and breach rules, and universal service and 911 fees."
category = "Hosting & Cloud Industry"
order = 2184
part = "Communications Platforms"
tags = ["911", "cpni", "usf", "telecom-regulation", "voip", "breach-notification"]
+++

A software company that lets its customers make phone calls becomes, in the eyes of the FCC, something close to a phone company. Interconnected VoIP has had to carry 911 calls since 2005, send them with a location dispatchers can use since 2021 and 2022, protect the call records it holds and certify that it does every March 1, report breaches of them to federal law enforcement, and contribute to the federal Universal Service Fund on its interstate revenue at a rate that reached 42% for the last quarter of 2026. States add their own 911 surcharges per line, collected through the provider's invoice. None of these duties care that the provider thinks of itself as an API company.

This chapter covers the duties from the provider's side: how they came to apply to VoIP, 911 and dispatchable location, Kari's Law for the phone systems a platform hosts, CPNI protection and the breach rules (including a 2024 rule that is adopted but not in force), universal service and 911 fees as pass-through, the contact-law changes a platform tracks for its customers, and how to model all of it. Sales and telecom taxes as a whole are [Tax on Hosting & Cloud](/books/hosting-and-cloud/tax#telecom-taxes-and-regulatory-fees) in the Metering and Billing part; the numbering certifications VoIP providers now make are in [Phone Numbers & Porting](/books/hosting-and-cloud/phone-numbers-and-porting#voip-direct-access-and-its-certifications); robocall duties are in [Voice Platforms](/books/hosting-and-cloud/voice-platforms). None of this is legal advice.

## How the Providers Do It

The public filings show the duties as lines of business and as risks. As of October 2026:

| Provider | 911 | Regulatory fees | Named risks |
| --- | --- | --- | --- |
| **Bandwidth** | "Full PSTN replacement with integrated local emergency services in 42 countries," dynamic location routing and an emergency calling API | Federal USF assessed on interstate and international revenue "from certain customers," and "generally passed on to our customers"; states may assess USF and telecom taxes on VoIP's intrastate share | A San Francisco Access Line Tax deficiency of $3.8 million (paid under protest July 25, 2025; refund suit filed December 31, 2025) and a suit alleging it failed to bill, collect and remit 911 taxes and surcharges in Cook and Kane Counties, Chicago and Illinois |
| **Twilio** | Emergency calling on its voice products | Non-income taxes "such as sales tax, value-added tax, goods and services tax, and telecommunications taxes"; internationally, "payment into universal service funds"; revenue recognized net of taxes collected | TCPA litigation and regulatory change |
| **Telnyx, Plivo, Vonage** | Emergency calling on voice products | Fees passed through on invoices | Not captured |

The pattern: 911 is a product with its own API and coverage list, regulatory fees are pass-through lines, and the litigation is about whether the provider collected the right local fees on the right lines.

## How It Got Here

Each duty arrived as a separate response to VoIP replacing landlines, and most were extended from the telephone network rather than written for software:

| Date | Step | What it solved | What it cost |
| --- | --- | --- | --- |
| May 19, 2005 | FCC 05-116 requires interconnected VoIP providers to provide 911 with a registered location; effective July 29, 2005, with location and notice requirements from November 28, 2005 | VoIP callers reaching dispatchers | A registered address per line, kept current by the customer |
| 2006 | The FCC sets a 64.9% interstate safe harbor for interconnected VoIP's USF contributions | A way to split VoIP revenue that has no fixed geography | USF contributions on VoIP revenue |
| July 23, 2008 | The NET 911 Improvement Act (Public Law 110-283) | A statutory basis for VoIP 911 and its access to 911 infrastructure | 911 fees can apply to VoIP lines |
| February 16, 2018 | Kari's Law (47 U.S.C. 623) is enacted; it binds phone systems sold or installed from February 16, 2020 | Calling 911 from a hotel or office phone without dialing 9 first | Configuration and notification duties on every multi-line system |
| December 5, 2019 | FCC rules implementing Kari's Law and RAY BAUM's Act dispatchable location (84 FR 66760) | A location a dispatcher can act on, not a billing address | Location data per call |
| January 6, 2021 and January 6, 2022 | Dispatchable location compliance: fixed VoIP and multi-line systems' first duties from 2021; non-fixed VoIP and the rest from 2022 | Nomadic users reached at the room they are in | Dynamic location for softphones and mobile clients |
| February 12, 2024 | The FCC's 2023 data breach order expands carrier breach reporting to personal information and removes the customer-notice waiting period (89 FR 9968), with the core amendments "delayed indefinitely" | Modern breach notice for carriers | Still not in force as of October 2026 |
| June 27, 2025 | *FCC v. Consumers' Research*: the Supreme Court upholds the USF's structure, 6 to 3 | Uncertainty over the fund's constitutionality | The fund and its pass-through continue |
| August 13, 2025 and July 31, 2026 | A Sixth Circuit panel upholds the breach order, 2 to 1; the full court grants rehearing en banc and vacates the panel decision | Review of the FCC's authority to write the rule | Litigation pending |
| September 14, 2026 | The USF contribution factor for Q4 2026 is proposed at 42.0% (DA 26-946) | Funding of the universal service programs | A record pass-through charge on interstate telecom revenue |

## 911 for VoIP

An interconnected VoIP provider (one whose service connects to the public network in both directions) must route 911 calls to the right public safety answering point with the caller's number and location. The rules distinguish two kinds of service:

- **Fixed:** the line is used at one place. Since January 6, 2021, 47 CFR 9.11 requires the provider to "provide automated dispatchable location with each 911 call": a street address plus whatever is needed to find the caller, such as a floor or suite.
- **Non-fixed:** the user can move (a softphone, a mobile app, a laptop client). Since January 6, 2022, the provider must provide automated dispatchable location "if technically feasible"; otherwise it must provide Registered Location information or Alternative Location Information, or route the caller to a national emergency call center.

For a platform, this means every number or extension that can dial 911 needs an emergency address, validated before it is accepted, and every client that can move needs a way to detect and update location (network-based detection, a prompt when the network changes). Bandwidth sells this as a product: dynamic location routing and an emergency calling API. The cost of getting it wrong is a call routed to the wrong dispatcher, so validation happens when the address is set, not when the call is made.

### Kari's Law and Hosted Phone Systems

Kari's Law covers multi-line telephone systems (MLTS): the phone systems in offices, hotels and campuses, including hosted and cloud PBXs a platform runs for its customers. For systems "manufactured, imported, offered for first sale or lease, first sold or leased, or installed after" February 16, 2020, users must be able to dial 911 "without dialing any additional digit" (even where "9" is normally needed for an outside line), and the system must notify a central location (a front desk, security) where that is possible without hardware or software improvement. The FCC's rule (47 CFR 9.16) adds that the notification must be contemporaneous, must not delay the call, and must go somewhere someone is likely to see or hear it. A cloud PBX product therefore needs direct 911 dialing on by default and a configurable notification target per site.

## CPNI

Customer proprietary network information is what a carrier knows about a customer's use of its service: call detail records, numbers called, services subscribed. Carriers and interconnected VoIP providers must protect it, and three duties shape the platform:

- **Annual certification.** Under 47 CFR 64.2009(e), an officer signs a compliance certificate each year with a statement of the provider's procedures, any actions taken against data brokers, and a summary of customer complaints about unauthorized release, filed "on or before March 1 in EB Docket No. 06-36, for data pertaining to the previous calendar year."
- **Access controls.** CPNI is released to customers only after authentication, and support staff see it only when they need to. The SIM swap order adds that mobile carriers may not give access to CPNI before authenticating the customer ([Phone Numbers & Porting](/books/hosting-and-cloud/phone-numbers-and-porting#porting-out-and-number-takeover)).
- **Breach notification,** which is where the rules are unsettled.

### The Breach Rules, as of October 2026

The rule in force is the old one. The current text of 47 CFR 64.2011 defines a breach as unauthorized access to CPNI only, requires notice to the US Secret Service and the FBI "as soon as practicable, and in no event later than seven (7) business days, after reasonable determination of the breach," and bars notice to customers until seven full business days after that notice. A carrier with an "extraordinarily urgent need" may notify sooner after consulting the investigating agency, and the agency may direct a delay of up to 30 days, extendable. Breach records are kept for at least two years.

The FCC's 2023 data breach order changes that, but hasn't taken effect. The rule published at 89 FR 9968 (February 12, 2024) was effective March 13, 2024 except for the amendments to 64.2011 and the parallel rule for relay services (64.5111), which are "delayed indefinitely" pending OMB approval and a Federal Register notice. Those amendments would extend breach reporting to personally identifiable information, require reporting to the FCC and federal law enforcement as soon as practicable and no later than seven business days after a reasonable determination, and remove the waiting period before customers are told. The FCC published information-collection notices for the order on April 16 and June 17, 2026. In court, a Sixth Circuit panel upheld the order 2 to 1 on August 13, 2025 (*Ohio Telecom Association v. FCC*), but on July 31, 2026 the full court granted rehearing en banc, vacated the panel decision and stayed the mandate. As of October 2026 the expanded rule is adopted, not effective, and its litigation is pending.

My default is to build for the stricter rule now: classify breaches of personal information as well as CPNI, be able to report to the FCC, the Secret Service and the FBI within seven business days, and be able to notify customers without a waiting period, while following the old rule's waiting period until the new one takes effect. A breach report pipeline that can only do the old rule will be rebuilt under deadline when the new one lands.

## Universal Service and Regulatory Fees

The federal Universal Service Fund pays for rural, low-income, schools and libraries, and rural health care programs, and is funded by contributions from telecommunications and interconnected VoIP providers on their interstate and international end-user revenue. Providers pass the contribution to customers as a line item.

The rate changes every quarter. The contribution factor is projected program costs divided by projected contributable revenue (47 CFR 54.709(a)); for Q4 2026, the FCC's public notice DA 26-946 (released September 14, 2026) projected $2.026 billion in program collections against $6.910 billion of projected end-user interstate and international revenue, for a factor of 42.0%, up from 38.8% in Q3. The factor is deemed approved if the FCC doesn't act within 14 days, and carriers may not recover more than that percentage of interstate charges through the federal USF line. The next notice, for Q1 2027, is due in mid-December 2026.

For interconnected VoIP, the interstate share of revenue isn't obvious, so the FCC offers a safe harbor: a provider may report 64.9% of its revenue as interstate, or use an FCC-approved traffic study, or actual revenues. USAC's 2026 Form 499-A training lists the 64.9% figure for interconnected and non-interconnected VoIP, and says traffic studies need a margin of error of no more than 1% at 95% confidence. Providers report revenue on FCC Form 499-A each year, which is also a requirement for a provider claiming STIR/SHAKEN implementation through a third party ([Voice Platforms](/books/hosting-and-cloud/voice-platforms#signing-through-a-third-party)).

The fund's legal basis is settled for now. In *FCC v. Consumers' Research* (decided June 27, 2025, 6 to 3, opinion by Justice Kagan), the Supreme Court held that neither Congress's delegation to the FCC nor the FCC's reliance on USAC violates the nondelegation doctrine, reversing the Fifth Circuit.

State and local charges sit on top. States may assess their own universal service fees on VoIP's intrastate share; 911 and 988 surcharges are set per line; some cities levy access line or utility users' taxes. California's 911 surcharge is $0.41 per access line per month for 2025 and 2026, and its 988 surcharge drops from $0.08 to $0.05 for 2026; it applies to VoIP lines (Cal OES counted 4,140,208 of them) and is set by Cal OES by October 1 for the following year. Bandwidth's two disputes, a San Francisco access line tax deficiency and an Illinois 911 suit, show what happens when a provider and a jurisdiction disagree about which lines owe what. The address that decides the jurisdiction is the service address, at the rooftop level, which is why tax engines for communications identify each charge with a transaction and service pair rather than a product code.

In the core model, each of these is a SKU with `pass_through = 'regulatory'`. The federal USF line is a percentage of the interstate portion of other lines, not a unit price, so it gets its own effective-dated rate table (below) and the [rating run](/books/hosting-and-cloud/metering-and-rating#pass-through-fees) computes it from the period's rated voice and messaging revenue after the safe-harbor split.

## Contact Law the Platform Tracks

The law of contacting people is the customer's to follow and the playbook's to explain ([Calls, Texts & Email](/docs/compliance/consumer-contact)). Three changes since the playbook's consent section was written matter to a platform because they change what its customers ask it to support:

- **The one-to-one consent rule is gone.** The FCC's 2023 rule would have required prior express written consent to name one seller and cover only "logically and topically associated" calls. The Eleventh Circuit vacated it in *Insurance Marketing Coalition v. FCC* (No. 24-10277, January 24, 2025, 127 F.4th 303), days before its January 27, 2025 effective date; the court's mandate issued April 30, 2025, and the FCC removed the text and restored the prior definition by a final rule at 90 FR 42137, published and effective August 29, 2025 (DA 25-621). Lead generation platforms may again collect consent for several sellers at once, subject to everything else in the TCPA.
- **Florida narrowed its mini-TCPA.** HB 761 (Laws of Florida ch. 2023-150, effective May 25, 2023) amended the Florida Telephone Solicitation Act so that an automated system must "both select and dial," and a plaintiff must first reply STOP and allow 15 days before suing over texts.
- **Oklahoma added one.** The Oklahoma Telephone Solicitation Act of 2022 (effective November 1, 2022) requires prior express written consent for automated sales calls, bars them from 8 p.m. to 8 a.m., limits them to three in 24 hours even with consent, and sets $500 per violation, trebled if willful.

For the platform, these are reasons to support per-seller consent records, STOP handling that is fast and logged ([Sending a Text](/books/hosting-and-cloud/sending-a-text#stop-at-the-platform)), and quiet hours and frequency limits per state as data the customer's gate can read.

## The Alternatives

A software company that wants to offer calling has three ways to take on these duties:

| Approach | Who holds the duties | Strengths | Failure modes |
| --- | --- | --- | --- |
| **Be the provider** | The company: 911, CPNI certification, breach reporting, Form 499-A, USF contributions, state fees, RMD | Control and margin; can serve regulated customers directly | Every filing and fee is the company's; an error is the company's enforcement action or tax suit |
| **Build on an owned-network provider's 911 and regulatory stack** | Shared: the upstream handles 911 routing and some filings; the company still certifies CPNI and contributes on its own revenue if it is the provider of record | 911 coverage without building it; fewer filings | The upstream's coverage list is the product's; regulatory status depends on the contract and the facts |
| **Resell as a customer of a CPaaS** | Mostly the CPaaS, which bills USF and fees to the company and carries 911 | Least burden | Least control; passes every fee and policy through; may still owe state duties if it sells to end users |

My default for a platform that sells voice to businesses is to be the provider of record for its own customers (because the duties follow the relationship with the end user, and pretending otherwise invites the tax suits in Bandwidth's filing), buy 911 routing and location validation from an owned-network provider that covers the countries it serves, and build the regulatory calendar (March 1 CPNI certification, March 1 RMD recertification, the yearly Form 499-A, quarterly USF factors) into the system rather than into someone's memory.

## How to Build It

The chapter adds emergency addresses, breach reports, regulatory filings and regulatory fee rates to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). The `phone_numbers.emergency_address_id` column added in [Phone Numbers & Porting](/books/hosting-and-cloud/phone-numbers-and-porting#how-to-build-it) points here.

```sql
CREATE TABLE emergency_addresses (       -- a validated location for 911
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  street             TEXT NOT NULL,
  unit               TEXT,               -- floor, suite, room: the "dispatchable" part
  city               TEXT NOT NULL,
  region             TEXT NOT NULL,
  postal_code        TEXT NOT NULL,
  country            CHAR(2) NOT NULL,
  validation_status  TEXT NOT NULL CHECK (validation_status IN ('pending', 'valid',
                       'invalid', 'corrected')),
  validated_by       TEXT,               -- the 911 provider's validation service
  validated_at       TIMESTAMPTZ,
  location_kind      TEXT NOT NULL CHECK (location_kind IN ('registered', 'dynamic',
                       'alternative')),
  valid_during       TSTZRANGE NOT NULL  -- a moved user closes one and opens another
);

ALTER TABLE phone_numbers
  ADD CONSTRAINT phone_numbers_emergency_address_fk
    FOREIGN KEY (emergency_address_id) REFERENCES emergency_addresses (id);

CREATE TABLE mlts_sites (                -- Kari's Law settings per hosted phone system site
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id            UUID NOT NULL REFERENCES accounts (id),
  trunk_id              UUID REFERENCES resources (id),   -- or the hosted PBX resource
  direct_911            BOOLEAN NOT NULL DEFAULT TRUE,    -- no prefix needed
  notification_targets  TEXT[] NOT NULL,                  -- front desk, security
  default_address_id    UUID NOT NULL REFERENCES emergency_addresses (id)
);

CREATE TABLE cpni_breach_reports (       -- one per incident; built for the stricter rule
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  incident_ref          TEXT NOT NULL,   -- the security incident
  data_classes          TEXT[] NOT NULL, -- 'cpni', 'pii'
  determined_at         TIMESTAMPTZ NOT NULL,  -- "reasonable determination"; clocks start here
  rule_applied          TEXT NOT NULL CHECK (rule_applied IN ('64.2011_current',
                          '64.2011_2024')),
  reported_to           TEXT[] NOT NULL DEFAULT '{}',  -- 'usss', 'fbi', 'fcc'
  reported_at           TIMESTAMPTZ,
  law_enforcement_delay TEXT,            -- a request to delay customer notice, if any
  customers_affected    INT,
  customer_notice_at    TIMESTAMPTZ,
  harm_assessment       TEXT,
  retained_until        DATE NOT NULL    -- at least two years under 64.2011
);

CREATE TABLE regulatory_filings (        -- the calendar of what the provider files
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  kind            TEXT NOT NULL CHECK (kind IN ('cpni_certification', 'form_499a',
                    'form_499q', 'rmd_recertification', 'numbering_certification',
                    'state_911_remittance', 'state_usf_remittance')),
  jurisdiction    TEXT NOT NULL,         -- 'US', 'US-CA', a county or city
  period          DATERANGE NOT NULL,    -- the data period it covers
  due_on          DATE NOT NULL,
  filed_at        TIMESTAMPTZ,
  signed_by       TEXT,                  -- the officer, for certifications
  document_ref    TEXT,
  docket          TEXT                   -- e.g. 'EB Docket No. 06-36'
);

CREATE TABLE regulatory_fee_rates (      -- percentages and per-line amounts, effective-dated
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  code           TEXT NOT NULL,          -- 'usf.federal', 'ca.911', 'ca.988', 'sf.access_line'
  jurisdiction   TEXT NOT NULL,
  basis          TEXT NOT NULL CHECK (basis IN ('percent_of_interstate', 'per_line_month',
                   'percent_of_charges')),
  rate           NUMERIC(12,6) NOT NULL, -- 0.420000 for 42.0%; 41 minor units per line
  currency       CHAR(3),                -- per-line amounts
  sku_id         UUID NOT NULL REFERENCES skus (id),  -- pass_through = 'regulatory'
  source_ref     TEXT NOT NULL,          -- 'DA 26-946', the Cal OES letter
  valid_during   TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (code WITH =, jurisdiction WITH =, valid_during WITH &&)
);

ALTER TABLE accounts
  ADD COLUMN interstate_method TEXT CHECK (interstate_method IN ('safe_harbor',
    'traffic_study', 'actual')),        -- how this provider splits VoIP revenue
  ADD COLUMN usf_exempt_ref    TEXT;     -- a customer's reseller or exemption certificate
```

Notes on the sketch:

- **Addresses are validated on entry** and effective-dated, because a nomadic user's location changes and a dispatcher needs the one in force at the moment of the call.
- **Breach reports record which rule was applied.** When the 2024 amendments take effect, the clock and the recipients change; the report says which applied, and the pipeline can run either.
- **Filings are a calendar of rows,** with periods and due dates, so the March 1 certifications and the yearly revenue report are tracked like invoices, with an owner and a filed-at time.
- **USF is a rate on revenue, not a unit price.** The rating run computes the interstate portion of the period's revenue (by the account's method), applies the factor in force, caps recovery at the factor, and writes a regulatory pass-through line; an exempt reseller's certificate removes it.
- **Rates come with their source,** the public notice or the agency letter, so a customer disputing a line sees where the number came from.
- **Events:** `emergency_address.validated`, `emergency_address.invalid`, `breach.determined` (which starts the clock), `regulatory_filing.due` and `regulatory_rate.changed` go through the [outbox](/docs/architecture/events#the-transactional-outbox).

## Auditing

- **The emergency address in force for each number at each moment,** with its validation, because a 911 failure investigation starts there.
- **Kari's Law settings per site** and when they changed.
- **Every CPNI access by staff,** with the reason, and every release to a customer with how they were authenticated ([Audit Trails](/docs/architecture/audit-trails#typed-actors)).
- **Every breach determination and report,** with timestamps against the rule's clock.
- **Every filing,** with the signer and the document as filed.
- **Every regulatory fee line** with the rate, its source and the revenue it was computed on, because states and cities audit what was collected and remitted.

## What This Means for the System You Build

- **Require a validated emergency address** for every number that can dial 911, and detect location for clients that move.
- **Ship hosted phone systems with direct 911 dialing and notification** on by default.
- **Certify CPNI protection every March 1** from records of who accessed what, not from a template.
- **Build breach reporting for the 2024 rule** (PII included, seven business days, no waiting period) and run the current rule until the new one takes effect; as of October 2026 it is adopted, not in force, and in en banc litigation.
- **Model USF and 911 fees as regulatory pass-through** with effective-dated rates and their sources, and compute USF on the interstate share by a stated method.
- **Put every regulatory deadline in the system** as a filing with a period, a due date and an owner.

## References

**Statutes and court decisions**

- [47 U.S.C. 623 (Kari's Law)](https://www.law.cornell.edu/uscode/text/47/623), direct 911 dialing and notification for multi-line systems from February 16, 2020
- [NET 911 Improvement Act, Public Law 110-283](https://www.govinfo.gov/app/details/PLAW-110publ283), approved July 23, 2008
- [Supreme Court: FCC v. Consumers' Research (PDF)](https://www.supremecourt.gov/opinions/24pdf/24-354_0861.pdf), decided June 27, 2025, upholding the USF
- [SCOTUSblog: FCC v. Consumers' Research](https://www.scotusblog.com/cases/federal-communications-commission-v-consumers-research/), the vote and the justices joining
- [Sixth Circuit: Ohio Telecom Association v. FCC (PDF)](https://infobytes.orrick.com/wp-content/uploads/FCC-OPINION.pdf), the August 13, 2025 panel decision upholding the breach order
- [State Bar of Michigan e-Journal No. 86269](https://www.michbar.org/opinions/content_search_detail/EJournalNumber/86269), rehearing en banc granted and the panel decision vacated on July 31, 2026
- [Eleventh Circuit: Insurance Marketing Coalition v. FCC (PDF)](https://media.ca11.uscourts.gov/opinions/pub/files/202410277.pdf), vacatur of the one-to-one consent rule, January 24, 2025
- [Florida Senate: HB 761 (2023)](https://www.flsenate.gov/Session/Bill/2023/761), signed and effective May 25, 2023

**Regulations, orders and notices**

- [Federal Register: FCC 05-116, IP-Enabled Services and E911](https://www.govinfo.gov/content/pkg/FR-2005-06-29/html/05-12828.htm), adoption, effective date and the November 28, 2005 compliance date
- [47 CFR 9.11](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-47?part=9&section=9.11), dispatchable location for fixed and non-fixed interconnected VoIP and the fallback options
- [47 CFR 9.16](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-47?part=9&section=9.16), MLTS direct dialing, notification and dispatchable location
- [TLP: FCC announces compliance dates for Kari's Law and RAY BAUM's Act](https://www.tlp.law/2020/12/08/fcc-announces-compliance-dates-for-karis-law-ray-baums-act-911-dispatchable-location-information/), the January 6, 2021 and 2022 dates
- [47 CFR 64.2009](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-47?part=64&section=64.2009), the annual CPNI certification due March 1
- [47 CFR 64.2011](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-47?part=64&section=64.2011), the breach rule currently in force: definition, notice clocks, delays and two-year retention
- [Federal Register: Data Breach Reporting Requirements (2024)](https://www.federalregister.gov/api/v1/documents/2024-01667.json), 89 FR 9968 and the indefinite delay of the 64.2011 and 64.5111 amendments
- [Warner Norcross + Judd: Sixth Circuit upholds the FCC's 2024 data breach rules](https://www.wnj.com/updates/sixth-circuit-upholds-fccs-2024-data-breach-reporting-rules/), what the 2024 rule would require
- [FCC: DA 26-946, Q4 2026 contribution factor (PDF)](https://docs.fcc.gov/public/attachments/DA-26-946A1.pdf), the 42.0% factor, its inputs, deemed approval and the recovery cap
- [CommLaw Group: FCC proposes record 42% USF factor](https://commlawgroup.com/2026/fcc-proposes-record-42-usf-contribution-factor-for-q4-2026/), the Q3 2026 factor of 38.8%
- [USAC: 2026 Form 499-A training for VoIP providers (PDF)](https://www.usac.org/wp-content/uploads/service-providers/documents/training/2026/2026-499A-Series-VoIP-Providers.pdf), the 64.9% safe harbor and traffic study requirements
- [Federal Register: Delete, Delete, Delete; Targeting and Eliminating Unlawful Text Messages](https://www.federalregister.gov/api/v1/documents/2025-16641.json), 90 FR 42137, effective August 29, 2025, conforming the rules to the court's mandate of April 30, 2025
- [Cal OES: Access line letter to CDTFA for 2026 (PDF)](https://www.caloes.ca.gov/wp-content/uploads/PSC/Documents/CDTFA-Access-Line-Letter-CY-2026.pdf), the 911 and 988 surcharges and VoIP line counts
- [CDTFA: 911 and 988 surcharges](https://cdtfa.ca.gov/taxes-and-fees/mts.htm), per access line per month

**In practice**

- [Bandwidth: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1514416/000151441626000017/band-20251231.htm), 911 coverage, USF and state fees passed through, the San Francisco and Illinois disputes
- [Twilio: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1447669/000144766926000021/twlo-20251231.htm), telecommunications taxes and universal service fund payments
- [Chargebee: AvaTax for Communications](https://www.chargebee.com/docs/2.0/avatax-for-communication.html), transaction and service pairs for communications taxes
- [Quarles: Amendments to the Florida Telephone Solicitation Act](https://www.quarles.com/newsroom/publications/a-return-to-relative-sanity-amendments-to-the-florida-telephone-solicitation-act), the HB 761 changes
- [Manatt: Washington's and Oklahoma's telemarketing laws](https://manatt.com/insights/newsletters/tcpa-connect/what-you-need-to-know-about-washingtons-and-oklah), the Oklahoma Telephone Solicitation Act
- [Morrison Foerster: Eleventh Circuit vacates the one-to-one consent rule](https://www.mofo.com/resources/insights/250130-eleventh-circuit-vacates-fcc-s-tcpa-one-to-one-consent-rule), the effective date it preceded
