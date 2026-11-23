+++
title = "EU, UK & Canada Customs"
nav_title = "EU, UK & Canada"
description = "Customs from the declarant's seat in the EU, UK and Canada: UCC, EORI, MRNs, ICS2, the 2026 reform and EUR 3 duty, CDS and GB/XI EORI, CARM, CADs and ACI."
category = "Logistics & Supply Chain Industry"
order = 2855
part = "Customs and Trade"
tags = ["logistics", "customs", "eu-customs", "ics2", "uk-customs", "carm", "eori", "advance-cargo-information"]
+++

A US-built customs platform meets the rest of the world the first time a customer ships to Rotterdam, Felixstowe or Toronto. The concepts carry over (an importer, a declarant, a declaration per consignment, advance cargo data from the carrier, duty and tax to pay), but every name, number and system is different. The EU has one customs code and twenty-seven national declaration systems, a pre-arrival security system that takes filings from carriers and forwarders separately, and a reform adopted in September 2026 that moves duty liability for online sales onto platforms. The UK left the EU's systems and finished moving every declaration to its own service in March 2024, while Northern Ireland stays partly inside the EU's rules. Canada replaced its accounting system in October 2024 and made every importer register in a portal.

It is hard because the identifiers, the representation rules and the release events differ per jurisdiction, and a system that hard-codes US concepts (an entry number with a filer code, an importer of record with a bond, a single ACE) can't hold an EU declaration lodged by an indirect representative in Belgium, an ENS filed in two parts by a carrier and a forwarder, or a Canadian commercial accounting declaration paid under release prior to payment.

This chapter is the declarant's, broker's, carrier's and importer's view: the EU's Union Customs Code, EORI numbers, declarations and MRNs, representation, AEO status, ICS2, the customs reform and the low-value changes of 2026; the UK's Customs Declaration Service, GB and XI EORI numbers, Northern Ireland and the end of low-value duty relief; and Canada's CARM, business numbers and import-export accounts, commercial accounting declarations, ACI eManifest and CUSMA. It extends the entry model of [Import Entry & ACE](/books/logistics/import-entry) (`customs_entries`, `customs_entry_lines`, `advance_cargo_filings`) and `parties` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model). A merchant's checkout view (merchant of record, IOSS, DAP and DDP, the EUR 3 duty as a cost, UK point-of-sale VAT, Canada's courier thresholds) is Commerce's [Customs Entry and Duties](/books/commerce/cross-border-commerce#customs-entry-and-duties), and the EU's VAT and duty dates for parcels are in its [European Union](/books/commerce/cross-border-commerce#european-union) section.

## How the Regulators Do It

As of November 2026, from each authority's own pages and legislation:

| Jurisdiction | Law | Trader identifier | Declarations | Advance cargo data | Recent change |
| --- | --- | --- | --- | --- | --- |
| **European Union** | Union Customs Code, in force 1 May 2016, with transitional arrangements while systems are finished | EORI: country code plus up to 15 characters, one per person, valid EU-wide | National systems of each member state; each declaration gets an 18-character MRN | ICS2: Entry Summary Declaration by the carrier, with house-level data from forwarders; all modes since 1 September 2025 | Customs reform adopted 16 September 2026; EUR 3 per-item duty on low-value goods from 1 July 2026; EUR 2 handling fee from 1 November 2026 |
| **United Kingdom (Great Britain)** | UK customs legislation (outside the EU's) | GB EORI, issued immediately unless HMRC checks the application | Customs Declaration Service for all declarations since 30 March 2024 (CHIEF closed) | Safety and security declarations in S&S GB, including for EU goods since 31 January 2025; GVMS for roll-on roll-off ports | Low-value (GBP 135) duty relief ends by October 2028 |
| **United Kingdom (Northern Ireland)** | Windsor Framework (27 February 2023): EU customs rules apply in part | XI EORI, after a GB EORI | UK systems for NI; UK Internal Market Scheme for goods "not at risk" of moving to the EU | ICS2 applies to Northern Ireland | Simplified GB to NI movements under the Windsor Framework |
| **Canada** | Customs Act and its regulations | Business number with an import-export (RM) account, obtained through the CARM Client Portal | Commercial accounting declarations (CADs) in CARM, the system of record since October 21, 2024 | ACI eManifest by carriers and forwarders, 1 hour (highway) to 24 hours before loading (marine containers) | CARM replaced CCS and CADEX; the CAD replaced the B3 |

The patterns:

- **Security data and the declaration are separate filings by separate parties.** The EU's ENS, the UK's S&S GB declaration, Canada's ACI and the US ISF and manifest are lodged by carriers and forwarders before arrival for risk assessment; the customs declaration that releases the goods and assesses duty is the declarant's. A platform tracks both per shipment and links them.
- **The trader's identity is a registration per jurisdiction.** An EORI, a GB or XI EORI, a Canadian business number with an RM account and a US importer number are different identifiers for the same party, each with its own validity and issuer, and a declaration is rejected without the right one.
- **Representation is a legal choice, not a role label.** In the EU a customs representative acts directly (in the importer's name) or indirectly (in its own name, sharing liability); a broker's system records which, per declaration, because it decides who owes the duty.
- **Low-value e-commerce is where the rules moved in 2026.** The EU ended its EUR 150 duty exemption and added a handling fee, the UK set an end date for its GBP 135 relief, and the reform makes platforms the importers for distance sales. Systems that treated parcels as a separate, duty-free stream now treat them as declarations.

## The European Union

### The Union Customs Code and EORI

The Union Customs Code (Regulation (EU) No 952/2013) "entered into force on 1 May 2016"; the Commission notes that "some transitional arrangements still apply" because "not all of the electronic systems to deal with formalities are in place yet." Customs declarations are lodged in each member state's national system, so a broker filing in the Netherlands and Germany integrates with two systems under one code.

The Economic Operators Registration and Identification number (EORI) is "one common type of identification number across the EU," required for customs operations anywhere in the customs territory. Each person holds one at a time. The format is the two-letter code of the issuing country followed by up to 15 alphanumeric characters unique within it. An operator established in the EU applies in its country of establishment; a non-EU operator that lodges declarations, entry or exit summary declarations or temporary storage declarations, or acts as a carrier, applies in the country of its first customs operation.

### Declarations, MRNs and Representation

Customs may accept a simplified declaration that "may omit certain of the particulars" of a standard one, and using it regularly needs an authorization (Article 166). Each accepted declaration is identified by a Movement Reference Number, "a unique, 18-digit customs ID generated for every import/export shipment," which the Commission's MRN Follow-up service uses to track a shipment "from first departure to its destination"; the MRN is to an EU declaration what the entry number is to a US one, and [Import Entry & ACE](/books/logistics/import-entry) stores either in `customs_entries.declaration_number`.

Anyone may appoint a customs representative, and the appointment is one of two kinds (Article 18): **direct**, where the representative "shall act in the name of and on behalf of another person," or **indirect**, where it acts "in his or her own name but on behalf of another person." The representative must be established in the EU, with a waiver for those acting for persons not required to be. The choice matters most for sellers not established in the EU: the Commission's low-value guidance names indirect representatives among the declarants who pay the EUR 3 duty, and the representative's liability goes with acting in its own name.

### Authorised Economic Operators

An EU-established operator meeting the UCC's criteria "may apply for the status of authorised economic operator," in two forms: "an authorised economic operator for customs simplifications" (AEOC) and "an authorised economic operator for security and safety" (AEOS), which can be held together (Article 38). AEO status is the EU's trusted-trader authorization, comparable in role to CTPAT in the US. For a system, it is an authorization per party with a reference and validity, and it changes which procedures a declarant can use.

### ICS2: Entry Summary Declarations

Goods brought into the EU "shall be covered by an entry summary declaration," lodged "within a specific time-limit, before the goods are brought into the customs territory of the Union" at the customs office of first entry, normally by the carrier, though the importer, consignee or others may lodge it instead (UCC Article 127). The Import Control System 2 (ICS2) is the system that receives it, built in three releases:

| Release | From | Scope |
| --- | --- | --- |
| 1 | 15 March 2021 | Postal and express consignments by air, pre-loading data |
| 2 | 1 March 2023 | All air cargo: "all air carriers, freight forwarders, express couriers, and postal operators" file a full ENS before arrival |
| 3 | 3 June 2024 (maritime and inland waterway carriers, connecting until 4 December 2024); house-level filers 4 December 2024 to 1 April 2025; road and rail from 1 April 2025 | Every mode; "fully operational in all Member States for all means of transport" from 1 September 2025 |

The Release 1 date is from IATA's material and its scope from secondary sources, not a Commission page. <!-- source-gap: logistics-customs-outside-us-ics2-r1 | secondary | ICS2 Release 1 went live on 15 March 2021, covering postal and express air consignments | closes with: a Commission page or notice dating Release 1 | checked: 2026-11-22 -->

ICS2 takes filings from more than one party per shipment: the carrier must submit a complete ENS for all goods, and "house level filers such as freight forwarders, logistics operators" (in the Commission's words) connected on their own schedule under Release 3 to file the house-level data they hold. A platform that is a forwarder files its part and tracks the carrier's. The goods description must be "precise enough for Customs services to be able to identify the goods" (Commerce's [HS Codes and Customs Data](/books/commerce/cross-border-commerce#hs-codes-and-customs-data) quotes the guidance and the rejected terms). For air cargo, a pre-loading subset is risk-assessed before the aircraft is loaded, and the outcomes the industry describes are a request for information, a request for high-risk cargo screening, and a do-not-load instruction where a threat is found. <!-- source-gap: logistics-customs-outside-us-ics2-dnl | secondary | ICS2 air pre-loading outcomes include referrals for information or screening and a do-not-load instruction | closes with: the Commission's ICS2 page or Implementing Regulation (EU) 2015/2447 text on pre-loading risk analysis outcomes | checked: 2026-11-22 --> A system filing ENS data needs to receive and act on each referral before loading, and record the answer.

Several member states, and the UK for Northern Ireland, asked for temporary extensions for road and rail when Release 3 completed; the Commission's August 29, 2025 notice records the requests without naming the member states, so a road or rail filer checks the national customs authority's own notice.

### The 2026 Customs Reform

The European Parliament and the Council adopted the customs reform on 16 September 2026, "the most comprehensive reform of the EU Customs Union since its establishment in 1968," and it entered into force on 21 September 2026, to be implemented gradually. What changes for a declarant's system, by date:

- **EU Customs Authority.** A new agency in Lille, established in 2027.
- **EU Customs Data Hub.** One EU data environment replacing national declaration systems over time: "mandatory for e-commerce on 1 July 2028," voluntary for other businesses from 2031, and mandatory for all importers from 1 March 2034. Data is submitted once rather than through multiple national systems.
- **Importers for distance sales.** Online platforms and non-EU sellers become responsible for customs formalities and duty on goods they sell into the EU, which moves the declarant role, and the liability, from the courier's bulk filing to the seller or platform.
- **Trust & Check traders.** Trusted traders may "self-release" goods, clear imports with the authorities of their member state of establishment, and under conditions import without active customs intervention.

### Low-Value Consignments in 2026

The EU's duty exemption for consignments up to EUR 150 applied until 30 June 2026. Under Council Regulation (EU) 2026/382:

- **A temporary EUR 3 duty per item, from 1 July 2026 until 1 July 2028,** charged per item in a consignment, based on tariff classification "(not quantity)": five T-shirts are one item and EUR 3; a T-shirt and a watch are two items and EUR 6. The declarant (the seller or importer, including IOSS holders, special arrangements users and indirect representatives) declares and pays it, whatever the VAT scheme; consumers are liable only in residual cases. The Commission's page doesn't state at which digit level two classifications count as different items; the implementing rules published on 8 June 2026 govern. <!-- source-gap: logistics-customs-outside-us-eur3-item-level | missing | the tariff classification level (6, 8 or 10 digits) at which goods count as separate items for the EUR 3 duty | closes with: the text of the amended UCC Implementing or Delegated Act of 8 June 2026 or Commission guidance stating the level | checked: 2026-11-22 -->
- **Product identifiers (PIDs)** may be declared voluntarily from 1 July 2026 and are mandatory from 1 November 2026.
- **A EUR 2 Union handling fee** on small parcels from 1 November 2026, set by a delegated act on the basis of customs supervision costs.

For a platform, each low-value consignment's declaration now carries per-line tariff classifications, product identifiers and a computed count of items for the duty, and the fee and duty are lines the declarant pays and passes on. Who bears them commercially is Commerce's question; who declares and pays is this system's.

## The United Kingdom

### CDS and EORI

HMRC closed CHIEF and moved every declaration to the Customs Declaration Service: "All businesses will now need to declare goods through the Customs Declaration Service from 30 March 2024," and exports moved in early March 2024. CDS declarations carry an MRN like EU declarations, and at roll-on roll-off ports using the Goods Vehicle Movement Service (GVMS) the haulier creates a goods movement reference (GMR) that must "include declaration references" for all goods carried, such as import MRNs and safety and security ENS MRNs; for goods moving from Great Britain to Northern Ireland, once the ENS MRN is included, GVMS submits the arrival and presentation notifications automatically.

A GB EORI is issued immediately unless HMRC needs to check the application, which can take up to five working days. An XI EORI, needed for customs activity in Northern Ireland, comes "within 5 days," and "you must have applied for a GB EORI number before you can get an XI EORI number."

Entry summary declarations for Great Britain go to S&S GB "before your goods arrive," up to 200 days in advance; the carrier is responsible, though a customs agent may submit. The waiver for goods from the EU ended on 31 January 2025, so EU-origin freight now needs an ENS like any other.

### Northern Ireland and the Windsor Framework

The Windsor Framework, published by the UK and EU on 27 February 2023, keeps Northern Ireland partly within EU customs rules, and HMRC says it "has introduced simplified processes for moving goods from Great Britain" into it. Traders authorized under the UK Internal Market Scheme can declare goods "not at risk" of moving into the EU, and those goods are not charged duty when entering Northern Ireland from free circulation in Great Britain; goods "at risk" pay the applicable EU rate. A shipment to Belfast therefore needs an XI EORI, a risk determination per consignment and the right declaration, which a GB-only model doesn't have.

### Low-Value Imports

The UK's GBP 135 point-of-sale VAT regime is Commerce's to explain. On the customs side, the government's policy paper "removes the £135 customs duty relief for low value imports" and introduces "new requirements for data, payments and compliance"; on 23 June 2026 it brought the change forward "by six months to October 2028." As of November 2026 the paper (last updated 28 October 2026) gives no detailed design, so the data and payment requirements are still to be published. <!-- source-gap: logistics-customs-outside-us-uk-low-value | status | the data, payment and declaration requirements that replace UK low-value duty relief in October 2028 | closes with: HMRC guidance or legislation setting out the new low-value import requirements | checked: 2026-11-22 -->

## Canada

### CARM and the Commercial Accounting Declaration

The CBSA Assessment and Revenue Management system (CARM) became "the official system of record used to assess and collect duties and taxes for commercial goods imported into Canada" on October 21, 2024. The cutover ran from October 4 at 4:00 pm ET, when the legacy CCS and CADEX systems were switched off, to October 21 at 3:00 am ET; electronic B3 accounting documents held during the cutover were submitted afterward as Commercial Accounting Declarations (CADs) in the new format. CARM had collected over $4.7 billion and registered more than 15,700 new businesses on its portal by December 11, 2024.

What an importer and its broker need:

- **A business number and an import-export (RM) account.** "You need a business number and an import-export program (RM) account before you import or export goods." Since CARM, the RM account is obtained only through the CARM Client Portal, where a business account manager registers the business and assigns roles to other users.
- **Release prior to payment (RPP) security,** to get goods released before duties and taxes are paid: the importer enrolls in the RPP sub-program and posts the required financial security through the portal. During the cutover, existing RPP privileges and brokers' RPP bonds continued under the old processes, and CBSA later temporarily suspended the security requirement for RPP participants.
- **Statements and payments** through CARM's daily notices and statements of account, and a published Open API catalog for software that integrates with it.

For a system built on US entries, a CAD is a `customs_entries` row with `country = 'CA'`, a transaction number as its declaration number and a release that may precede accounting; the RPP security is the Canadian counterpart of a continuous bond ([Customs Brokers & Bonds](/books/logistics/customs-brokers-and-bonds)).

### ACI eManifest

Canada's Advance Commercial Information (ACI) eManifest program makes carriers and freight forwarders transmit conveyance, cargo and house bill data electronically before arrival, through EDI or the eManifest Portal; highway carriers, freight forwarders, warehouse operators and customs brokers can apply for a shared secret through the portal. The timeframes are in the Reporting of Imported Goods Regulations:

| Mode | Carrier's cargo data | Forwarder's house bill data |
| --- | --- | --- |
| Marine | 24 hours before loading for containerized cargo; 24 hours before arrival for bulk or break-bulk | 24 hours before loading if any part is containerized, otherwise 24 hours before arrival |
| Air | 4 hours before arrival, or at departure for flights under 4 hours | Same as the air carrier |
| Rail | 2 hours before arrival | 2 hours before arrival |
| Highway | 1 hour before arrival | 1 hour before arrival |

Marine conveyance data is due 96 hours before arrival when containers are on board. Corrections after arrival use the House Bill, Cargo and Conveyance Manual Correction Request Form.

### CUSMA

The Canada-United States-Mexico Agreement took effect "on July 1, 2020," replacing NAFTA with no transition period. Claiming its preferential tariff treatment in Canada requires "a valid certification of origin," kept with the declaration that claims it. The rules of origin and the US side of the agreement (USMCA) are [Drawback, FTZs & Trade Agreements](/books/logistics/drawback-ftz-and-trade-agreements); the courier thresholds for low-value shipments are Commerce's.

## How to Build It

The US entry model generalizes with three changes: identifiers per party per jurisdiction, jurisdiction-specific columns on the declaration, and new kinds of advance cargo filing.

```sql
-- A party's customs registrations, one row per identifier per jurisdiction.
CREATE TABLE customs_identifiers (
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id     UUID NOT NULL REFERENCES parties (id),
  jurisdiction TEXT NOT NULL CHECK (jurisdiction IN ('US', 'EU', 'GB', 'XI', 'CA')),
  kind         TEXT NOT NULL CHECK (kind IN ('us_importer_number', 'eori', 'ca_business_number',
                 'ca_rm_account', 'aeo_c', 'aeo_s', 'ukims', 'ioss', 'ca_carrier_code')),
  value        TEXT NOT NULL,            -- as issued; an EORI starts with its country code
  issuer       CHAR(2),                  -- the issuing member state, for an EORI
  valid_during DATERANGE NOT NULL,
  verified_at  TIMESTAMPTZ,              -- last check against the issuer's lookup
  document_id  UUID REFERENCES documents (id),  -- the authorization, where one exists
  UNIQUE (jurisdiction, kind, value),
  CHECK (kind <> 'eori' OR value ~ '^[A-Z]{2}[A-Z0-9]{1,15}$')
);
CREATE INDEX ON customs_identifiers (party_id, jurisdiction);

-- Declarations outside the US: who lodged it, how, where, and the duty basis.
ALTER TABLE customs_entries
  ADD COLUMN representation      TEXT,   -- EU: 'direct' or 'indirect'; null when the importer files
  ADD COLUMN customs_office_code TEXT,   -- EU customs office, UK or CA port or office
  ADD COLUMN local_reference     TEXT,   -- the declarant's own reference before an MRN exists
  ADD COLUMN declaration_kind    TEXT,   -- 'standard', 'simplified', 'supplementary', 'cad',
                                         -- 'low_value', per jurisdiction
  ADD COLUMN ni_at_risk          BOOLEAN,  -- GB to NI: the Windsor Framework determination
  ADD COLUMN rpp_release         BOOLEAN,  -- CA: released before payment under RPP
  -- NOT VALID: checks new rows now; validate after backfill without blocking writes
  ADD CONSTRAINT customs_entries_representation_check
    CHECK (representation IN ('direct', 'indirect')) NOT VALID,
  ADD CONSTRAINT customs_entries_eu_mrn_check
    CHECK (country IN ('US', 'CA', 'GB', 'XI') OR declaration_number IS NULL
           OR length(declaration_number) = 18) NOT VALID;

-- Low-value EU lines: the product identifier and the item group the EUR 3 duty counts.
ALTER TABLE customs_entry_lines
  ADD COLUMN product_identifier TEXT,     -- EU PID, mandatory from 1 November 2026
  ADD COLUMN duty_item_key      TEXT;     -- the classification that makes it a separate item

-- New kinds of advance cargo filing: drop and re-add the check, unvalidated.
ALTER TABLE advance_cargo_filings
  DROP CONSTRAINT advance_cargo_filings_kind_check,
  ADD CONSTRAINT advance_cargo_filings_kind_check CHECK (kind IN ('us_isf_10_2', 'us_isf_5',
    'us_ams', 'us_acas', 'eu_ics2_ens', 'eu_ics2_house', 'eu_ics2_preloading', 'gb_ens',
    'ca_aci_cargo', 'ca_aci_house', 'ca_aci_conveyance')) NOT VALID;
ALTER TABLE advance_cargo_filings
  ADD COLUMN referral TEXT,               -- ICS2 pre-loading outcome, if any
  ADD COLUMN referral_answered_at TIMESTAMPTZ,
  ADD CONSTRAINT advance_cargo_filings_referral_check CHECK (referral IN
    ('request_for_information', 'request_for_screening', 'do_not_load')) NOT VALID;

CREATE INDEX CONCURRENTLY customs_entry_lines_duty_item_idx
  ON customs_entry_lines (customs_entry_id, duty_item_key);
```

The EUR 3 duty for an EU low-value declaration is the count of distinct item keys, not of units; the result becomes a duty row in `entry_line_duties` ([Tariff Programs](/books/logistics/tariff-programs)), and the handling fee a charge on the declaration:

```sql
SELECT e.id, e.declaration_number,
       count(DISTINCT l.duty_item_key)                     AS items,
       count(DISTINCT l.duty_item_key) * 300               AS flat_duty_minor,  -- EUR 3.00
       bool_or(l.product_identifier IS NULL)               AS missing_pid
FROM customs_entries e
JOIN customs_entry_lines l ON l.customs_entry_id = e.id
WHERE e.country NOT IN ('US', 'CA', 'GB', 'XI')
  AND e.declaration_kind = 'low_value'
  AND e.arrived_at >= '2026-07-01' AND e.arrived_at < '2028-07-01'
GROUP BY e.id, e.declaration_number;
```

In production the rate, the dates and the item rule come from `tariff_measures` with effective dates, not literals in the query ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).

Design notes:

- **The country column is the switch.** `customs_entries.country` (a member state code for EU declarations, since each is lodged in a national system, or 'GB', 'XI', 'CA') selects which identifiers, representation rules, declaration kinds and number formats apply; the core of the entry stays the same.
- **Identifiers are dated registrations.** An EORI can be invalidated, an XI EORI depends on a GB one, and an RM account belongs to a business number; `customs_identifiers` keeps each with validity and the last verification, and a declaration snapshots the one it used ([Crosswalks of External IDs](/docs/building-blocks/record-linkage#crosswalks-of-external-ids)).
- **Security filings and declarations are linked, not merged.** An ENS or ACI filing is an `advance_cargo_filings` row per party that filed it (carrier, house filer), linked to the shipment; the declaration references it. A do-not-load or referral blocks loading until answered, and the answer is recorded.
- **Representation decides liability.** Store direct or indirect per declaration, with the representative's authorization as a document, because a duty demand years later goes to whoever the declaration says.
- **Plan for the Data Hub.** From 1 July 2028 EU e-commerce declarations go to one EU environment instead of national systems; keep the national system integration behind an interface ([Mapping Their Schema to Yours](/docs/building-blocks/integrations#mapping-their-schema-to-yours)) so the switch is a new adapter.

## Auditing

- **Every declaration** with its jurisdiction, MRN or transaction number, declarant, representation, customs office and the identifiers used, as lodged and as amended.
- **Every advance cargo filing** per filer, with referrals, do-not-load instructions and their answers and times.
- **Every identifier and authorization** (EORI, XI EORI, AEO, UKIMS, BN and RM account, IOSS) with validity and verification history.
- **Every low-value EU declaration's item count,** product identifiers and the duty and fee paid, so a later inquiry about the EUR 3 duty can be answered line by line.
- **Every CAD and its release,** with the RPP security relied on and the statement it was paid on.

The mechanics are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Generalize the entry, don't fork it:** one declaration model with a country and jurisdiction-specific columns, not a US system with an EU copy.
- **Hold customs identifiers per party per jurisdiction,** dated and verified, and block a declaration that lacks the one its jurisdiction needs.
- **Record representation on every EU declaration,** direct or indirect, with the authorization behind it.
- **Treat advance cargo data as its own filings by carriers and house filers,** with ICS2 referrals and do-not-load answered before loading.
- **Count EU low-value items by tariff classification,** carry product identifiers from 1 November 2026, and keep the EUR 3 duty and EUR 2 fee as dated rules ending 1 July 2028.
- **Model Northern Ireland separately:** XI EORI, the at-risk determination and UKIMS authorization.
- **Register Canadian importers in CARM,** with a business number, an RM account, portal roles and RPP security, and file CADs, not B3s.
- **Isolate national systems behind adapters,** because the EU Customs Data Hub will replace them for e-commerce in 2028 and for everyone by 2034.

## References

**European Union**

- [European Commission: Union Customs Code](https://taxation-customs.ec.europa.eu/customs/union-customs-code_en), entry into force on 1 May 2016 and the transitional arrangements
- [Regulation (EU) No 952/2013, the Union Customs Code (EUR-Lex)](https://eur-lex.europa.eu/eli/reg/2013/952/oj/eng), Articles 18 (representation), 38 (AEO), 127 (entry summary declaration) and 166 (simplified declarations)
- [European Commission: EORI number](https://taxation-customs.ec.europa.eu/customs/customs-procedures-import-and-export/customs-procedures/economic-operators-registration-and-identification-number-eori_en), who needs one, the format and where to apply
- [European Commission: MRN Follow-up](https://taxation-customs.ec.europa.eu/online-services/online-services-and-databases-customs/mrn-follow_en), the 18-character MRN and tracking from departure to destination
- [European Commission: ICS2 Release 2 go-live (March 1, 2023)](https://taxation-customs.ec.europa.eu/news/import-control-system-2-ics2-release-2-go-live-2023-03-01_en), air cargo filers and the full ENS
- [European Commission: ICS2 live for maritime and inland waterway transport (June 3, 2024)](https://taxation-customs.ec.europa.eu/news/import-control-system-2-ics2-live-maritime-and-inland-waterway-transport-2024-06-03_en), the Release 3 carrier and house filer windows, the carrier's complete ENS, house level filers and road and rail from 1 April 2025
- [European Commission: Transition to ICS2 Release 3 complete (August 29, 2025)](https://taxation-customs.ec.europa.eu/news/transition-ics2-release-3-complete-limited-temporary-derogations-some-member-states-2025-08-29_en), full operation from 1 September 2025 and the requests for road and rail extensions
- [European Commission: EU Customs Reform](https://taxation-customs.ec.europa.eu/customs/eu-customs-reform_en), adoption, entry into force, the Customs Authority, Data Hub dates, importers for distance sales, Trust & Check, the end of the EUR 150 exemption and the EUR 2 handling fee
- [European Commission: Guidance and legal text on the temporary flat duty for low-value imports (June 8, 2026)](https://taxation-customs.ec.europa.eu/news/guidance-and-legal-text-temporary-flat-fee-low-value-imports-which-will-apply-until-1-july-2028-2026-06-08_en), Regulation (EU) 2026/382, the per-item rule and example, the declarant and product identifiers

**United Kingdom**

- [GOV.UK: Customs Declaration Service](https://www.gov.uk/government/collections/customs-declaration-service), CHIEF's closure and all declarations on CDS from 30 March 2024
- [GOV.UK: Get an EORI number](https://www.gov.uk/eori), when one is needed
- [GOV.UK: Apply for an EORI number](https://www.gov.uk/eori/apply-for-eori), GB and XI EORI timing and the GB-first rule
- [GOV.UK: Making an entry summary declaration](https://www.gov.uk/guidance/making-an-entry-summary-declaration), S&S GB, the carrier's responsibility, 200 days in advance and the end of the EU waiver on 31 January 2025
- [GOV.UK: Get a goods movement reference](https://www.gov.uk/guidance/get-a-goods-movement-reference), GVMS and the MRNs a GMR carries
- [GOV.UK: The Windsor Framework](https://www.gov.uk/government/publications/the-windsor-framework), the framework documents published 27 February 2023
- [GOV.UK: UK Internal Market Scheme authorisation](https://www.gov.uk/guidance/apply-for-authorisation-for-the-uk-internal-market-scheme-if-you-bring-goods-into-northern-ireland), the Windsor Framework's simplified processes, "not at risk" goods and duty into Northern Ireland
- [GOV.UK: Reforming customs rules for low value imports](https://www.gov.uk/government/publications/reforming-customs-rules-for-low-value-imports), removing the GBP 135 duty relief and new requirements
- [GOV.UK: Acceleration of cheap import reforms (June 23, 2026)](https://www.gov.uk/government/news/government-backs-high-street-with-acceleration-of-cheap-import-reforms-and-crackdown-on-dodgy-online-sellers), the end of relief brought forward to October 2028

**Canada**

- [CBSA: CARM](https://www.canada.ca/en/border-services-agency/services/carm.html), the Client Portal, business numbers and RM accounts, RPP enrollment and the Open API catalog
- [CBSA: Customs Notice 24-29, CARM cutover period](https://www.cbsa-asfc.gc.ca/publications/cn-ad/cn24-29-eng.html), cutover dates, the end of CCS and CADEX, CADs in place of B3s and RM accounts through the portal
- [CBSA: Customs Notice 24-17](https://www.cbsa-asfc.gc.ca/publications/cn-ad/cn24-17-eng.html), the move of the launch to October 2024 and the RPP security transition
- [CBSA: CARM's first results (December 11, 2024)](https://www.canada.ca/en/border-services-agency/news/2024/12/cbsas-new-accounting-system-has-collected-over-47-billion-in-duties-and-taxes-since-its-external-launch.html), system of record on October 21, 2024, revenue, registrations and the RPP security suspension
- [CBSA: Commercial import accounting](https://www.cbsa-asfc.gc.ca/prog/arl-glcc/menu-eng.html), assessment and payment through CARM, daily notices and statements of account
- [CBSA: Release Prior to Payment](https://www.canada.ca/en/border-services-agency/services/carm/release-prior-payment.html), enrollment and financial security
- [CBSA: ACI eManifest, cargo and warehouse requirements](https://www.cbsa-asfc.gc.ca/prog/aci-manif-ipec/menu-eng.html), carriers, forwarders, the portal, EDI, shared secrets and the manual correction request form
- [Reporting of Imported Goods Regulations, SOR/86-873](https://laws-lois.justice.gc.ca/eng/regulations/SOR-86-873/FullText.html), advance information timeframes by mode for carriers and forwarders
- [CBSA: CUSMA](https://www.cbsa-asfc.gc.ca/services/cusma-aceum/menu-eng.html), entry into force on July 1, 2020 and the certification of origin

**Industry**

- [IATA: Pre-loading advance cargo information](https://www.iata.org/en/publications/newsletters/iata-knowledge-hub/why-2023-is-a-key-year-for-security-changes-to-standard-procedures-for-pre-loading-advanced-cargo/), ICS2 release dates including Release 1, and referral and do-not-load outcomes in pre-loading regimes
