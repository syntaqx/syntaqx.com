+++
title = "The Health Tech Landscape"
description = "Who sells health software: EHR and practice management markets, patient engagement, revenue cycle, networks, telehealth, and who bought whom."
category = "Health Tech Industry"
order = 1902
part = "The Business"
tags = ["health-tech", "ehr", "practice-management", "market", "consolidation"]
+++

Health software is a few very large markets and dozens of small ones. Three EHR vendors run four in five US hospitals; a handful of practice management systems run most dental offices and vet hospitals, many still on a Windows server in the back office; patient engagement vendors sit on top of those systems and text, call and collect for the front desk; clearinghouses and revenue cycle companies move the claims; networks move the records; telehealth companies sell visits to employers and consumers. Ownership changes constantly: private equity has bought and merged much of the specialty software market, one of the largest clearinghouses belongs to UnitedHealth's Optum, and one attack on that clearinghouse in February 2024 stopped claims and payments for practices across the country.

This chapter maps the market a builder sells into or integrates with: who the incumbents are in each segment, how big the public ones are, what consolidation changed and what the Change Healthcare attack taught. [The Practice Business](/books/health-tech/practice-business) covers the practices themselves and [Business Models for Health Software](/books/health-tech/health-tech-business-models) how these companies charge.

## How the Platforms Do It

The segments, with representative vendors and the public facts that size them, as of October 2026:

| Segment | Representative vendors | Scale from public sources |
| --- | --- | --- |
| **Hospital EHR** | Epic, Oracle Health (Cerner), MEDITECH, TruBridge, Altera | Epic 50.8%, Oracle Health 20.1% and MEDITECH 15.6% of non-federal acute care hospitals in 2024 (ASTP/ONC) |
| **Ambulatory EHR and PM** | Epic, athenahealth, eClinicalWorks, NextGen, Veradigm, ModMed, Tebra, DrChrono, Elation, Canvas, Healthie | 91% of office-based physicians used a certified EHR in 2024; Epic was used by 27.7% of them (ASTP/ONC) |
| **Dental PMS** | Dentrix and Dentrix Ascend (Henry Schein One), Eaglesoft (Patterson), Open Dental, Curve, Denticon (Planet DDS), tab32 | Henry Schein's practice software served about 95,000 practices at the end of 2025 |
| **Optometry and PT** | Compulink, Crystal PM, RevolutionEHR, Eyefinity; WebPT, Raintree, Prompt | No public market share; mostly private companies |
| **Veterinary PMS** | Cornerstone, ezyVet and Neo (IDEXX), AVImark and Pulse (Covetrus), Shepherd, Digitail | IDEXX's veterinary software, services and imaging revenue was $345.9 million in 2025 |
| **Patient engagement** | Weave, NexHealth, RevenueWell, Lighthouse 360, Solutionreach, Podium, Dental Intelligence, Modento, PetDesk, Vetstoria, Phreesia, Luma Health, Zocdoc, Klara | Weave: nearly 40,000 locations and $239.0 million of revenue in 2025; Phreesia: $480.6 million in fiscal 2026 |
| **RCM and clearinghouses** | Change Healthcare (Optum), Availity, Waystar, Trizetto (Cognizant), Office Ally, Claim.MD, Stedi; dental: Vyne Dental, DentalXChange | Waystar: $1,099.3 million of revenue, over 30,000 clients and over 7.5 billion transactions in 2025 |
| **Interoperability** | Redox, Health Gorilla, Particle, Metriport, 1upHealth; networks CommonWell, Carequality, eHealth Exchange; TEFCA QHINs | Eleven designated QHINs on the RCE's list, including Epic Nexus, Oracle Health, CommonWell, eHealth Exchange, Health Gorilla and Surescripts |
| **Telehealth and digital health** | Teladoc, Amwell, Doxy.me, Hims & Hers, Ro | Teladoc $2,530.0 million and Hims & Hers $2,347.6 million of 2025 revenue |
| **E-prescribing** | Surescripts, DoseSpot | Surescripts is the network most EHRs route prescriptions through (E-Prescribing & Pharmacy) |

## The EHR Market

Hospitals finished adopting EHRs a decade ago: by ASTP/ONC's last data brief in its series, 99.4% of non-federal acute care hospitals had a certified EHR in 2024, and basic adoption had reached 99% by 2018. What changed since is concentration. MEDITECH led in 2010 with 23% of hospitals; by 2024 Epic had half of all hospitals, and Epic, Oracle Health and MEDITECH together served about four in five. KLAS's 2026 market share report, covering 2025 decisions, found the number of hospitals affected by EHR purchase decisions dropped 40% from 2024, with Epic adding 77 hospitals and Oracle Health losing 56. A hospital switches EHRs once in a decade or two, at a cost measured in years of staff time, so a vendor selling into hospitals sells into Epic's or Oracle's ecosystem first (SMART on FHIR & App Platforms and Hospitals & Health Systems cover the app programs and the security review).

Ambulatory care is more fragmented. Among office-based physicians in 2024, Epic was used by 27.7%, MEDITECH by 11.1%, eClinicalWorks by 7.5%, athenahealth by 7.3%, Cerner by 5.5%, NextGen by 4.1%, Practice Fusion by 3.2%, Allscripts by 2.7%, ModMed by 2.4% and Greenway by 2.1%, with 21.5% on other systems and 5% using none. The physicians on Epic are mostly in hospital-owned groups that inherit the hospital's instance; independent practices spread across athenahealth, eClinicalWorks, NextGen, ModMed (strong in dermatology, ophthalmology and orthopedics), Tebra and the cloud-native systems built for small practices and virtual care (Elation, Canvas, Healthie, DrChrono). For a builder, the ambulatory long tail is why integration platforms exist: a patient engagement product for medical practices needs a dozen EHR connections before it covers a meaningful share.

Most ambulatory EHRs are combined PM/EHR systems: the same product schedules, bills and charts. Dentistry, optometry, physical therapy and veterinary medicine run on specialty systems where the practice management side (scheduling, ledger, insurance) dominates and the clinical side is the specialty's charting (EHRs, PMSs & the Clinical Record).

## Specialty Practice Management

The specialties that the patient engagement market grew up in run on a small number of practice management systems, many of them still installed on a server in the practice:

- **Dental.** Henry Schein's Global Technology segment ("dental practice management, patient engagement and demand creation software solutions") served approximately 95,000 practices in 2025 and was 5.1% of Henry Schein's sales; its products are Dentrix (on-premises) and Dentrix Ascend (cloud) under the Henry Schein One name. <!-- source-gap: henry-schein-one-jv | secondary | Henry Schein One formed as a joint venture with Internet Brands in 2018 | closes with: the Henry Schein 10-Q or 10-K note describing the joint venture's closing and ownership | checked: 2026-10-29 --> Patterson's Eaglesoft is the other long-installed on-premises system; Patterson was taken private by Patient Square Capital in April 2025. Open Dental is open source with a public API, and cloud systems (Curve, Denticon from Planet DDS, tab32) are taking new offices and groups.
- **Veterinary.** IDEXX sells the on-premises Cornerstone and the cloud ezyVet, Animana and IDEXX Neo alongside its diagnostics; its veterinary software, services and diagnostic imaging revenue was $345.9 million in 2025, inside a Companion Animal Group of $3,953.3 million. Covetrus, formed when Henry Schein spun off its animal health business and merged it with Vets First Choice on February 7, 2019, sells AVImark, ImproMed and the cloud Pulse, and runs prescription management for clinics; it was taken private by CD&R and TPG in October 2022. Shepherd and Digitail are newer cloud systems.
- **Optometry and physical therapy.** Compulink, Crystal PM, RevolutionEHR and Eyefinity in optometry, WebPT, Raintree and Prompt in PT. None publishes market share.

Two things make this segment matter more than its revenue. The PMS is the system of record for everything a patient engagement vendor reads (appointments, patients, balances, recall dates), so its vendor decides how hard integration is and what it costs (Integrating with Practice Management Systems covers sync agents, partner programs and gatekeeping). And on-premises systems mean the practice's data sits on hardware the vendor doesn't control, which is why so many integrations start with an agent installed on the practice's server.

## Patient Engagement

Patient engagement software does the front desk's outward work: reminders and confirmations, recall, two-way texting, phones, online booking, intake forms, reviews and payments, all reading from and writing back to the PMS or EHR. The market splits by who it was built for. Weave began in dental and now sells to "Dental, Optometry, Veterinary, and Specialty Medical" practices, with nearly 40,000 locations under subscription and $239.0 million of revenue in 2025; NexHealth, RevenueWell, Lighthouse 360, Solutionreach, Dental Intelligence, Modento and Yapi are rooted in dental; PetDesk and Vetstoria in veterinary; Podium sells to many local businesses including practices. Phreesia sells intake, check-in and payments to medical groups and health systems, about 180 million patient visits in its fiscal 2026, roughly one in six US ambulatory visits by its count; Luma Health, Klara and Zocdoc work the medical side. EHR vendors build the same features into their own products (Epic's MyChart, athenahealth's patient engagement), which caps what an independent vendor can charge an Epic customer and leaves the small and mid-size practices on specialty systems as the market's core (Part 5 covers each function).

## Revenue Cycle and Clearinghouses

Clearinghouses route claims, eligibility checks, claim status and remittances between providers and payers, and revenue cycle companies do the work around them (coding, follow-up, denials) as software, as outsourced service or both. Change Healthcare, which UnitedHealth's Optum acquired after a federal court on September 19, 2022 denied the Justice Department's request to block the deal (on the condition that Change divest its ClaimsXten claims editing business to TPG), closed into Optum on October 3, 2022. Availity runs a large multi-payer provider portal; Waystar reported $1,099.3 million of 2025 revenue from "over 30,000 clients" and "over one million distinct providers"; Office Ally and Claim.MD sell low-cost submission to small practices; Stedi sells an API-first clearinghouse with published per-transaction prices. Dental claims go through dental clearinghouses (Vyne Dental, DentalXChange) or the PMS vendor's own service. R1 RCM and others sell outsourced revenue cycle to hospitals, paid in operating and incentive fees ([Business Models for Health Software](/books/health-tech/health-tech-business-models#percentage-of-collections-and-outsourced-rcm)). Clearinghouses covers payer connectivity and switching.

## Networks and Exchange

Records move between organizations through networks. CommonWell, founded in 2013 by seven companies, reported 34,000+ provider organizations and 226 million unique individuals as of April 2024; eHealth Exchange began as a federal initiative in 2006 and counts federal agencies (SSA, FDA, IHS) among its participants; Carequality is a framework connecting networks, including Epic's. TEFCA, the federal Trusted Exchange Framework and Common Agreement, designates Qualified Health Information Networks (QHINs); as of October 2026 the Sequoia Project's RCE lists eleven, among them CommonWell, eHealth Exchange, Epic Nexus, Oracle Health, Health Gorilla, Kno2, KONZA, Netsmart, eClinicalWorks, Medallies and Surescripts. Interoperability vendors (Redox, Health Gorilla, Particle, Metriport, 1upHealth) sell one API over these networks and the EHRs. Networks & Exchange covers query, push and patient matching across them.

## Telehealth and Digital Health

Telehealth splits into enterprise and direct to consumer. Teladoc reported $2,530.0 million of 2025 revenue, 83% from access fees that employers and health plans pay per member per month, plus BetterHelp's $950.4 million of consumer therapy; Amwell sells a platform to health systems and payers. Hims & Hers sells subscriptions to consumers ($2,347.6 million of 2025 revenue, 2.5 million subscribers at year end) and Ro competes with it privately. Doxy.me sells simple video visits to individual clinicians, with a free tier. Digital health devices and apps (wearables, remote monitoring, digital therapeutics) sit at the FDA and FTC boundary (Digital Health Apps & Devices).

## Who Bought Whom

The ownership history explains much of the integration landscape: who has a partner program, who charges for API access, which product lines were merged and which kept their own codebases.

| Date | Event |
| --- | --- |
| February 7, 2019 | Henry Schein spins off its animal health business and merges it with Vets First Choice as Covetrus |
| February 11, 2019 | athenahealth taken private by funds controlled by Veritas Capital and Elliott's Evergreen Coast Capital at $135.00 a share |
| July 17, 2019 | Phreesia prices its IPO at $18.00 a share on the NYSE |
| 2021 | Kareo and PatientPop merge, later renamed Tebra |
| 2022 | Oracle acquires Cerner, now Oracle Health |
| October 3, 2022 | Optum completes its combination with Change Healthcare |
| October 13, 2022 | CD&R and TPG complete their take-private of Covetrus |
| November 10, 2023 | Thoma Bravo completes its $1.8 billion take-private of NextGen Healthcare at $23.95 a share |
| February 21, 2024 | Cyberattack on Change Healthcare |
| April 17, 2025 | Patient Square Capital completes its acquisition of Patterson Companies |

The two rows with only a year are dated from secondary reporting; the companies' own announcements weren't reachable. <!-- source-gap: tebra-merger | secondary | Kareo and PatientPop merger date (announced November 2021) and Golub investment | closes with: a Tebra or Golub press release on a site that allows fetching | checked: 2026-10-29 --> <!-- source-gap: oracle-cerner-close | secondary | Oracle's acquisition of Cerner closed June 8, 2022 at $95 a share | closes with: Oracle's 10-K or press release on a fetchable page | checked: 2026-10-29 -->

The pattern across vet and dental is a distributor (Henry Schein, Patterson, Covetrus) or a diagnostics company (IDEXX) owning the practice software, because software is how a supplier stays in the practice's daily workflow; the pattern in medicine is private equity buying EHR and RCM vendors and merging them. Both matter to an integrator, since a vendor that also sells patient engagement has reason to make a competitor's integration slow or expensive (Integrating with Practice Management Systems covers the antitrust history).

## The Change Healthcare Attack

On February 21, 2024, attackers disrupted Change Healthcare's systems, and because Change sat between a large share of US providers and their payers, claims, eligibility checks, prior authorizations and pharmacy claims stopped flowing for weeks for practices that used it directly or through vendors that did. Practices that had never signed with Change found their PMS vendor's claims service, or their clearinghouse's downstream connection, ran through it. UnitedHealth provided interest-free loans to affected providers, and in the fourth quarter of 2025 increased its reserves against those loans' collection by $799 million. CMS made accelerated and advance Medicare payments available from March 9, 2024, sized at a month of the provider's claims and recouped from Medicare claims over 90 days. UnitedHealth later notified individuals whose information was taken, in what secondary sources put at about 190 million people. <!-- source-gap: change-breach-count | secondary | the number of individuals affected by the Change Healthcare breach as reported to HHS OCR | closes with: the OCR breach portal entry or HHS's Change Healthcare FAQ, both of which refused automated fetching | checked: 2026-10-29 -->

For the landscape, the lessons were about concentration. A practice's revenue depends on a clearinghouse it may not know it uses; a payer connection is a single point of failure unless a second clearinghouse is enrolled and tested; and enrollment for EDI, ERA and EFT with a new clearinghouse takes weeks per payer, so switching in a crisis is slow. Security for Health Data covers the security side and Clearinghouses the redundancy.

## How to Build It

The landscape enters the model as the products a practice runs, so that every integration, support case and migration knows what it's talking to. It extends `organizations` (vendors are organizations with `kind = 'vendor'`) and `integrations`:

```sql
CREATE TABLE health_it_products (        -- a product a practice runs or connects to
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  vendor_organization_id UUID NOT NULL REFERENCES organizations (id),
  name                   TEXT NOT NULL,  -- 'Dentrix', 'Dentrix Ascend', 'Open Dental', 'ezyVet'
  category               TEXT NOT NULL CHECK (category IN ('ehr', 'pms', 'pm_ehr', 'engagement',
                           'clearinghouse', 'rcm', 'interop', 'telehealth', 'erx', 'imaging',
                           'payments', 'phone')),
  specialties            TEXT[] NOT NULL DEFAULT '{}',  -- 'dental', 'veterinary', 'optometry'
  deployment             TEXT NOT NULL CHECK (deployment IN ('on_premises', 'cloud', 'hosted')),
  chpl_ids               TEXT[] NOT NULL DEFAULT '{}',  -- ONC certified product listings, if any
  api_kinds              TEXT[] NOT NULL DEFAULT '{}',  -- 'fhir_r4', 'hl7v2', 'vendor_rest', 'db'
  partner_program        TEXT,           -- how access is granted: open, partner, by approval
  status                 TEXT NOT NULL CHECK (status IN ('active', 'sunset', 'retired')),
  successor_id           UUID REFERENCES health_it_products (id),  -- where a retired product went
  UNIQUE (vendor_organization_id, name)
);

ALTER TABLE integrations
  ADD COLUMN product_id      UUID REFERENCES health_it_products (id),
  ADD COLUMN product_version TEXT;       -- the practice's installed version, read by the agent

-- Which upstream systems a practice's revenue depends on, for an outage like February 2024
SELECT o.display_name, p.name AS product, i.status
FROM integrations i
JOIN organizations o ON o.id = i.organization_id
JOIN health_it_products p ON p.id = i.product_id
WHERE p.category IN ('clearinghouse', 'rcm')
ORDER BY o.display_name;
```

- **A vendor is an organization; a product is not.** Henry Schein One, IDEXX and Optum are organizations whose ownership changes over time ([The Practice Business](/books/health-tech/practice-business#how-to-build-it) records affiliations with dates); Dentrix and ezyVet are products whose APIs, versions and partner terms an integration depends on.
- **Record the installed version.** On-premises systems lag: two offices of one group can run versions a year apart, with different database schemas. The sync agent reports `product_version` and the integration's behavior keys off it.
- **Products retire.** When a vendor merges product lines, `successor_id` keeps the history so conversions and support know where a practice came from (Data Migration & Conversions).

## What This Means for the System You Build

- **Sell into hospitals through their EHR's ecosystem;** half of them run Epic and most of the rest Oracle Health or MEDITECH.
- **Plan for a long tail in ambulatory and specialty care,** and budget integrations per EHR and PMS rather than assuming one standard.
- **Treat the PMS vendor as the gatekeeper** of your data access, and know who owns it and what else it sells.
- **Know every clearinghouse in your customers' revenue path,** including the ones behind your own vendors, and keep a tested second path.
- **Model vendors and products explicitly,** with versions and successors, so integration behavior, support and migrations know what they face.

## References

**Data briefs and research**

- [ASTP/ONC: Non-federal acute care hospital EHR adoption, 2008-2024 (Data Brief 83)](https://healthit.gov/data/data-briefs/non-federal-acute-care-hospital-electronic-health-record-adoption-2008-2024/), 99.4% certified EHR adoption and 2024 developer shares (Epic 50.8%, Oracle Health 20.1%, MEDITECH 15.6%)
- [ASTP/ONC: Office-based physician EHR adoption, 2008-2024 (Data Brief 84)](https://healthit.gov/data/data-briefs/office-based-physician-electronic-health-record-adoption-2008-2024/), 91% certified EHR use and developer shares among office-based physicians
- [TechTarget: ONC issues final data brief on EHR adoption](https://www.techtarget.com/searchhealthit/news/366645365/ONC-issues-final-data-brief-on-EHR-adoption-highlights-market-consolidation), MEDITECH's 23% in 2010 and three developers serving four in five hospitals
- [KLAS: US Acute Care EHR Market Share 2026](https://klasresearch.com/report/us-acute-care-ehr-market-share-2026-market-uncertainty-significantly-cuts-buying-decisions/3956), hospitals affected by purchase decisions down 40%
- [HIT Consultant: KLAS 2026 EHR market share report](https://hitconsultant.net/2026/05/14/klas-2026-ehr-market-share-report/), Epic adding 77 hospitals and Oracle Health losing 56 in 2025

**Filings**

- [Henry Schein: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/0001000228/000100022826000013/hsic-20251227.htm), the Global Technology segment, its share of sales and about 95,000 practices
- [Henry Schein: Form 10-K for 2018](https://www.sec.gov/Archives/edgar/data/1000228/000100022819000015/the10k_2018.htm), the February 7, 2019 separation and merger forming Covetrus
- [IDEXX Laboratories: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/874716/000087471626000038/idxx-20251231.htm), Companion Animal Group and veterinary software revenue, Cornerstone, ezyVet, Animana and Neo
- [Covetrus: Form 10-K for 2021](https://www.sec.gov/Archives/edgar/data/1752836/000175283622000018/cvet-20211231.htm), Pulse and prescription management
- [Covetrus: completion of acquisition by CD&R and TPG (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1752836/000119312522261932/d335086dex991.htm), October 13, 2022
- [Patterson Companies: completion of acquisition by Patient Square Capital (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/891024/000119312525087961/d913697dex991.htm), closing April 17, 2025
- [Weave Communications: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1609151/000160915126000016/weav-20251231.htm), revenue, verticals and locations
- [Phreesia: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1412408/000141240826000079/phr-20260131.htm), revenue and patient visits
- [Phreesia: Pricing of initial public offering](https://ir.phreesia.com/news/news-details/2019/Phreesia-Announces-Pricing-of-Initial-Public-Offering/default.aspx), July 17, 2019 at $18.00
- [R1 RCM: Form 10-K for 2023](https://www.sec.gov/Archives/edgar/data/1910851/000162828024007062/ah-20231231.htm), outsourced revenue cycle and its fees
- [Waystar: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1990354/000199035426000011/way-20251231.htm), revenue, clients, providers and transactions
- [athenahealth: Form 8-K on completion of the merger](https://www.sec.gov/Archives/edgar/data/1131096/000113109619000010/form8-kclosing.htm), February 11, 2019 at $135.00 a share
- [Change Healthcare: Court decision on the UnitedHealth combination (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1756497/000119312522247904/d405324dex991.htm), the September 19, 2022 ruling and the ClaimsXten divestiture
- [UnitedHealth Group: Form 8-K on completing the Change Healthcare combination](https://www.sec.gov/Archives/edgar/data/731766/000110465922104936/tm2226855d2_8k.htm), October 3, 2022
- [UnitedHealth Group: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/731766/000073176626000062/unh-20251231.htm), the February 21, 2024 attack, provider loans and the $799 million reserve increase
- [Teladoc Health: Fourth quarter and full year 2025 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1477449/000147744926000010/tdoc-20251231xexx991.htm), revenue, access fees and BetterHelp
- [Teladoc Health: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1477449/000147744926000012/tdoc-20251231.htm), 83% of revenue from access fees
- [Hims & Hers Health: Full year 2025 results](https://www.sec.gov/Archives/edgar/data/1773751/000177375126000019/hims-20251231x8xkearningsr.htm), revenue and subscribers

**Regulators and networks**

- [CMS: CHOPD accelerated and advance payments fact sheet](https://www.cms.gov/newsroom/fact-sheets/change-healthcare-optum-payment-disruption-chopd-accelerated-payments-part-providers-advance), availability from March 9, 2024, sizing and recoupment
- [Sequoia Project RCE: Designated QHINs](https://rce.sequoiaproject.org/designated-qhins/), the designated QHINs under TEFCA
- [CommonWell Health Alliance: About](https://www.commonwellalliance.org/about/), founding and April 2024 scale
- [eHealth Exchange: About](https://ehealthexchange.org/about/), origins and federal participants
- [ONC: Certified Health IT Product List](https://chpl.healthit.gov/), the list of certified health IT products

**In practice**

- [Thoma Bravo: Completes acquisition of NextGen Healthcare](https://www.thomabravo.com/press-releases/thoma-bravo-completes-acquisition-of-nextgen-healthcare), November 10, 2023, $1.8 billion
