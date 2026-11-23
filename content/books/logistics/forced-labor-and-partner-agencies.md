+++
title = "Forced Labor & Partner Agencies"
nav_title = "Forced Labor & PGAs"
description = "The import rules beyond duty: 19 USC 1307, WROs and UFLPA tracing to raw materials, and the FDA, CPSC, APHIS, EPA and other agency data filed with an entry."
category = "Logistics & Supply Chain Industry"
order = 2853
part = "Customs and Trade"
tags = ["logistics", "customs", "forced-labor", "uflpa", "partner-government-agencies", "fda", "cpsc", "supply-chain-tracing"]
+++

A customs entry answers more than "what duty is owed." Before a container of solar modules, a pallet of frozen shrimp or a carton of children's pajamas is released, two other questions get asked. Was anything in it, down to the polysilicon, the cotton or the aluminum ingot, made with forced labor? And does every federal agency with an interest in the product (FDA for food and drugs, CPSC for consumer products, USDA for plants and wood, EPA for chemicals, NHTSA for vehicle equipment, Fish and Wildlife for animal parts) have the data it requires? CBP enforces both at the border, and both can hold goods that are correctly classified and fully paid.

They are hard for different reasons. Forced labor enforcement inverts the usual burden: under the Uyghur Forced Labor Prevention Act, goods with a link to the Xinjiang region or to a listed entity are presumed inadmissible, and the importer rebuts that presumption with documents that trace the supply chain "from the raw material stage to the finished, imported goods," often across five or six tiers of suppliers the importer has never contracted with. Partner agency requirements are hard because there are many of them, each with its own message format, its own flags on tariff numbers, its own timing and its own release decision, and a broker's system must assemble them per entry line from data that lives with the importer, the factory and the lab.

This chapter covers the forced labor statute and its three enforcement tools (Withhold Release Orders, Findings and the UFLPA presumption), what an importer has to assemble to get detained goods released, and the partner government agency (PGA) data that travels with an entry: FDA prior notice and entry review, CPSC eFiling, APHIS and the Lacey Act declaration, the EPA's TSCA certification and the smaller programs. It builds on `items`, `lots`, `parties` and `documents` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model) and on the entry tables of [Import Entry & ACE](/books/logistics/import-entry) (`customs_entries`, `customs_entry_lines`, `customs_entry_events`). The seller's view of CPSC certificates (what a certificate says, who issues it, which lab) belongs to Commerce's [Certificates and eFiling](/books/commerce/product-safety-and-recalls#certificates-and-efiling); this chapter is the filer's and the importer's side at the border.

## How the Regulators Do It

As of November 2026, from each agency's own pages and the regulations:

| Agency or program | What it stops at entry | How data reaches it | Timing | Outcomes the filer sees |
| --- | --- | --- | --- | --- |
| **CBP, 19 USC 1307 (WROs and Findings)** | Goods made "wholly or in part" with forced, convict or indentured labor | Admissibility proof after detention: a certificate of origin and a consignee's statement (19 CFR 12.43) | Proof due "within 3 months after the date the article was imported" | Detention, release, exclusion, or seizure and forfeiture under a Finding |
| **CBP, UFLPA** | Goods made in the Xinjiang region or by an Entity List entity, presumed made with forced labor | Applicability or exception review package through the Forced Labor Portal | 30 days from the detention notice, extendable twice to 90 days in total | Detention, release, exclusion (export or destroy within 180 days, or protest) |
| **FDA** | Food without prior notice; adulterated or misbranded food, drugs, devices, cosmetics, tobacco | FDA data in the ACE PGA Message Set, prior notice through ACE or FDA's PNSI | Prior notice 2 to 8 hours before arrival by mode | May Proceed, Documents Requested, exam or sample, detention, refusal |
| **CPSC** | Regulated consumer products without certificate data | Full or Reference PGA Message Set at entry | In effect July 8, 2026; FTZ withdrawals from January 8, 2027 | Release or hold; CPSC may ask CBP to seize noncompliant products |
| **USDA APHIS** | Plant pests, regulated plants and plant products; Lacey Act plant products without a declaration | APHIS CORE and Lacey Act message sets in ACE, or the LAWGS web form | Paper PPQ 505 no longer accepted from January 1, 2026 | Release, hold, refusal |
| **EPA (TSCA)** | Chemical substances without the import certification | Positive or negative certification electronically before release (19 CFR 12.121) | Before release | Release or detention |
| **NHTSA, FCC, TTB, FWS** | Vehicles and equipment, radio frequency devices, alcohol labels, wildlife | Declarations, COLA numbers and forms per program; NHTSA, TTB and FWS have ACE PGA guides | Per program | Per program |

The patterns:

- **The data is the importer's; the filing is the broker's.** Every program above asks for facts the broker can't know (a lab's test date, a plant's genus and species, a cotton mill's address, a chemical's TSCA status) and files them in ACE in one transmission with the entry. A broker's system is a collector of other parties' data with deadlines attached.
- **The tariff number triggers the question, the product answers it.** FDA flags HTS numbers FD1 to FD4 and lets the filer disclaim lines that aren't FDA-regulated; CPSC encourages Disclaim message sets; Lacey Act has a de minimis disclaimer. The HTS number says an agency may care; the item's real nature says whether it does.
- **Release is plural.** CBP's cargo release and each agency's decision are separate events on the same entry, and goods move only when all of them allow it. FDA's own pages say "a release does not preclude future FDA action if a problem is found later."
- **Forced labor is evidence, not a field.** No message set carries "not made with forced labor." What CBP accepts is a package of ordinary business records, translated into English, that ties the imported goods to their raw materials. Systems that keep those records linked as they happen can produce the package in days; systems that don't can't produce it at all.

## Forced Labor: The Statute and Its Tools

Section 307 of the Tariff Act (19 USC 1307) provides that goods "mined, produced, or manufactured wholly or in part in any foreign country by convict labor or/and forced labor or/and indentured labor under penal sanctions shall not be entitled to entry." Forced labor means "all work or service which is exacted from any person under the menace of any penalty for its nonperformance and for which the worker does not offer himself voluntarily," and it "includes forced or indentured child labor." Until 2016 a "consumptive demand" clause let in goods the US couldn't produce enough of; Public Law 114-125 struck it. CBP's Forced Labor Division assesses the elements using the International Labour Organization's 11 indicators of forced labor.

CBP enforces the statute three ways:

- **Withhold Release Order (WRO).** When information "reasonably but not conclusively indicates" that covered goods are being or are likely to be imported, the Commissioner orders ports to withhold release (19 CFR 12.42(e)). CBP's guidance describes the standard as reasonable suspicion. Detained goods can be exported at any time before seizure, or released if the importer proves admissibility: a certificate of origin signed by the foreign seller or owner (plus one from the last seller in any other producing country) and a statement by the ultimate consignee showing "every reasonable effort to determine the source of the merchandise" and the results, both "within 3 months after the date the article was imported" (19 CFR 12.43). If proof is late or insufficient, the goods are excluded, and if 60 days pass without export or a protest, they are deemed abandoned and destroyed (19 CFR 12.44(a)).
- **Finding.** When CBP has probable cause, the Commissioner, with the approval of the Secretary of Homeland Security, publishes a Finding in the Customs Bulletin and the Federal Register (19 CFR 12.42(f) refers to the Treasury Secretary; CBP's 2026 guidance to Homeland Security). Covered goods are then seized and forfeiture proceedings begin if the importer's proof doesn't establish admissibility or wasn't filed in time (19 CFR 12.44(b)). CBP's WRO and Findings page, modified November 13, 2026, lists every active order and points to the CBP Data Portal for counts; CBP "does not generally publicize specific detentions, re-exportations, exclusions, or seizures."
- **Rebuttable presumptions.** The UFLPA (Public Law 117-78) presumes that goods made wholly or in part in the Xinjiang Uyghur Autonomous Region (XUAR), or by an entity on the UFLPA Entity List, are prohibited under section 307; the presumption took effect June 21, 2022. The Countering America's Adversaries Through Sanctions Act does the same for goods made by North Korean nationals, and CBP's guidance says that since 2024 it excludes shipments when it enforces that presumption.

Whatever the tool, the detention mechanics are the general ones in 19 USC 1499(c): CBP decides within five days (excluding weekends and holidays) of examination whether to release or detain, sends a notice stating "the specific reason for the detention," its anticipated length and the tests or inquiries planned, and if it makes no admissibility decision within 30 days of presentation, the goods are treated as excluded for the purposes of a protest under 19 USC 1514.

## UFLPA Enforcement

### The Entity List

The Department of Homeland Security's UFLPA Entity List is the list a screening system checks every supplier against. As of its October 28, 2026 update it held 210 listings in sections tied to the statute's clauses: 9 entities in Xinjiang that make goods with forced labor, 50 that work with the Xinjiang government to recruit, transport or receive forced labor, none yet in the exporters section, and 151 facilities that source material through "poverty alleviation," "pairing-assistance" or similar labor schemes. Some companies appear in more than one section, so 210 is a count of rows, not of unique entities. The latest additions, effective October 29, 2026, were three genomics companies (BGI Genomics, MGI Tech and Shenzhen BGI Technology); others were added effective August 3, 2026.

The Entity List is not on the Consolidated Screening List that export compliance uses ([Export Compliance & Screening](/books/logistics/export-compliance)), so an import compliance system needs its own feed, matched against every party in the trace (not only the seller on the invoice), with the effective date of each listing kept, because a supplier listed after goods shipped is a different case from one listed before.

### Potential Input, Direct Input

CBP's June 2026 operational guidance for importers splits UFLPA cases by what CBP knows. A **potential input** is information that goods "may be" made in the XUAR or by a listed entity; depending on how certain the link is, CBP detains or excludes. A **direct input** is information that they are; CBP excludes. CBP's FAQ names six high-priority sectors for enforcement: cotton, tomatoes, polysilicon, polyvinyl chloride (PVC), aluminum and seafood.

A detention (CBP Form 6051D with Attachment 2-B) starts a 30-day clock. Within it the importer tells the port which way it will go:

- **Export or destroy,** at its own cost.
- **Request an applicability review,** arguing the UFLPA does not apply because nothing in the goods came from the XUAR or a listed entity. The importer's assigned Center of Excellence and Expertise reviews it.
- **Request an exception,** conceding the Xinjiang or Entity List link but showing "by clear and convincing evidence" that the goods were not made with forced labor, having "fully complied" with the importer guidance in the UFLPA Strategy and answered every CBP request. The Forced Labor Division reviews it, and CBP must report any exception it grants to Congress within 30 days. CBP's FAQ calls clear and convincing evidence "a higher standard of proof than a preponderance of the evidence."

Extensions are discretionary, at most two, and should not exceed 90 calendar days in total from the detention notice. The importer pays storage for the whole review, and CBP may require a single-transaction bond of three times the value of the detained goods (19 CFR 113.62). CBP's FAQ gives an average review of two to three weeks for a complete package and says detentions of shipments from a previously cleared, identical supply chain have "declined to an average of ten to 14 days." If the importer does nothing for 30 days, the goods are deemed excluded. A denial produces an exclusion notice: export or destroy within 180 days, or protest under 19 USC 1514 through ACE's protest module; a seizure is contested through the Fines, Penalties and Forfeitures petition process. CTPAT Trade Compliance partners get their packages reviewed first, may hold detained goods at their own facility instead of redelivering them, and get 48 hours' notice of a new WRO or Finding.

CBP's UFLPA statistics dashboard reports enforcement counts, but only in interactive charts and the CBP Data Portal, so this chapter doesn't quote them. <!-- source-gap: logistics-forced-labor-uflpa-counts | missing | UFLPA detention, exclusion and release counts by sector as of November 2026 | closes with: a CBP Data Portal export or a CBP release stating the counts | checked: 2026-11-22 -->

### The Package: Tracing to Raw Materials

An applicability review "require[s] documentation tracing the supply chain from the raw material stage to the finished, imported goods," and that documentation must show "no goods or inputs were produced in the XUAR or by an entity on the UFLPA Entity List." CBP asks for documents "produced in the ordinary course of business that details the order, purchase, manufacture, and transportation of inputs throughout their supply chain," with an executive summary on top and English translations of everything. Its Appendix E lists, by level:

- **The whole chain.** A description of every stage of mining, production and manufacture; each entity's role (CBP needs to know whether a supplier is also a manufacturer); relationships between entities under the related-party definition in 19 CFR 152.102(g); and every supplier at every step, with addresses, emails and phone numbers.
- **The merchandise and each component.** Purchase orders, invoices for all suppliers and sub-suppliers, packing lists, bills of materials, certificates of origin, payment records, the seller's and buyer's inventory records (dock and warehouse receipts), shipping records (manifests, bills of lading, waybills) and import and export records.
- **The producer.** The same records for raw materials, plus production orders, factory capacity reports, site visit reports and evidence "that the volume of input of component materials matches the volume of output." Audits count only if unannounced, independent and built on the ILO indicators; CBP "generally does not consider financial audits, environmental audits" sufficient.

Three rules shape the system that has to produce this. Affidavits and redacted or untranslated documents "are not sufficient" on their own. Every tier is a quantity reconciliation: the polysilicon bought must cover the wafers made, the wafers the cells, the cells the modules, by lot and date, which is the mass balance CBP's input-equals-output test describes. And CBP encourages origin testing, including isotopic testing, to check where the raw material came from, so test results are records too. In practice this is the lot genealogy model of Lot & Serial Traceability, later in this volume, extended upstream past the importer's own suppliers, with each link carrying the document that proves it.

## Partner Government Agencies at Entry

### The PGA Message Set

ACE's PGA Message Set is the part of an ABI entry that carries agency data: the filer sends the cargo release or entry with additional records per line for each agency that regulates the product, instead of separate paper to each agency. CBP's CATAIR page publishes the core chapter and a supplemental guide per agency; as of its November 13, 2026 revision those are AMS, APHIS (the CORE message set and the Lacey Act declaration), ATF, CPSC, DDTC, DEA, EPA, FWS, FDA, NHTSA, NMFS, the Office of Marine Conservation, TTB and FSIS. Each guide sets the agency's program codes, required data and the disclaim option. Each answer comes back separately: the cargo release from CBP, and per agency a may-proceed, hold, document request or rejection, which [Import Entry & ACE](/books/logistics/import-entry) records as `customs_entry_events` with an `agency`.

The broker's system needs three things per line: which agencies the tariff number and product trigger, whether each applies or is disclaimed, and the agency's data as of the filing. That is a rules table keyed by tariff number with effective dates ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)), because agency flags on HTS numbers change with the tariff schedule, plus item attributes that resolve the "may or may not" flags.

### FDA: Prior Notice and Entry Review

Imported food needs prior notice to FDA, and food without it "shall be refused admission" and held at the port, with no release on bond, until notice is given and FDA is satisfied (21 USC 381(m)). The timing is set by 21 CFR 1.279:

| Mode | Notice must be confirmed at least | Earliest submission |
| --- | --- | --- |
| Road | 2 hours before arrival at the port | 30 days ahead through ABI/ACE, 15 days through FDA's PNSI |
| Rail | 4 hours | Same |
| Air | 4 hours | Same |
| Water | 8 hours | Same |
| International mail | Before the food is sent | Limits don't apply; the confirmation number goes on the CN22 or CN23 |

FDA's reply carries a PN Confirmation Number, which must travel with the goods when notice was filed through PNSI. The content (21 CFR 1.281) is product and party data a broker can't invent: the complete FDA product code, common name, quantity and any lot or code numbers; the manufacturer and its food facility registration number, or the grower and growing location for food in its natural state; the FDA country of production and the shipping country; the shipper; the anticipated port, date and time; the importer, owner and ultimate consignee; the carrier's SCAC or IATA code; the bill of lading or air waybill number and the vessel, flight, container or railcar; and any country that has refused the food. For mail, the notice adds, "beginning October 1, 2026, the name of the mail service and the mail tracking number."

FDA's flags on tariff numbers say what the filer owes it. FD1 means the product may or may not be FDA-regulated (submit or disclaim); FD2 means FDA-regulated but not food (submit entry data); FD3 means it may or may not be food (prior notice and entry data, or disclaim); FD4 means food (prior notice and entry data). FDA's own FD3 example is salt, which may season food or treat roads.

After filing, FDA's PREDICT tool, which "uses various sources of information to assess risk," screens every line; scores aren't disclosed. A low-risk line properly submitted "may be allowed to enter domestic commerce without further FDA review," and an entry reviewer can "issue a May Proceed or setup a work assignment." The states a filer's system must track:

- **May Proceed.** The goods may proceed; FDA can still act later.
- **Documents Requested.** The reviewer needs entry documents to decide.
- **Exam or sample.** FDA examines or samples the goods; they must not be distributed until FDA decides admissibility.
- **Detained.** A Notice of FDA Action marked "Detained," which is also the notice of hearing. The importer can submit testimony (FDA prefers its ITACS system) or ask to recondition the product. FDA's procedures allow 10 business days from detention; notices generally give 20 calendar days, and extensions must be asked for within the window.
- **Refused.** The goods must be exported "within 90 days of the date of notice of such refusal" or destroyed (21 USC 381(a)).

The grounds for refusal are broad: goods that "appear" adulterated or misbranded, made under insanitary conditions, or forbidden in their country of origin. "Appear" is the standard, so the burden at a detention hearing is the importer's.

### CPSC eFiling

Since July 8, 2026, importers of consumer products that need a General Certificate of Conformity or a Children's Product Certificate must file the certificate data electronically with the entry; for products withdrawn from a foreign trade zone the requirement starts January 8, 2027, and domestic manufacturers aren't covered. CPSC's Acting Chairman said the rule "creates no new testing, certification, or compliance obligations": the certificates already had to exist, and now their data has to be at the border. What the certificate must say is Commerce's [Certificates and eFiling](/books/commerce/product-safety-and-recalls#certificates-and-efiling).

There are two ways to file:

- **Full PGA Message Set.** "The importer provides their broker with the seven required product certificate data elements," and the broker files them with every entry of that product.
- **Reference PGA Message Set.** "The importer pre-enters the product certificate data into the CPSC Product Registry," and gives the broker three Certificate Identifiers ("the Certifier ID, Product ID, and Version ID") to file instead. The Registry "does not communicate with CBP's ACE system"; the identifiers are the link.

CPSC's FAQ says "any product requiring certification must have an eFiled certificate, regardless of the value of the imported shipment," so low-value shipments aren't excused. It also says CPSC "does not intend to request that CBP deny entry of products into the U.S. solely based on failure to eFile," while still enforcing the certificate rules and asking CBP to seize noncompliant products, and it encourages Disclaim message sets for products that don't need certificates, which may improve an importer's risk score.

For a system, the Reference path changes the data model more than the Full one: the certificate becomes a versioned record the importer maintains once per product, the version moves when the product is retested or materially changed, and the entry line carries a pointer to the version in force when the goods were made, not when they were entered.

### USDA APHIS and the Lacey Act

APHIS regulates plant pests, plants and plant products, and animal products at the border. Its permit rules are program by program; for plant pests, "no person shall import, move interstate, transit, or release into the environment plant pests" without a permit or other APHIS authorization (7 CFR 330.200). APHIS data travels in ACE under its CORE implementation guide on CBP's CATAIR page.

The Lacey Act declaration is the requirement most importers meet. Anyone importing a plant or plant product in a covered category must file a declaration with "the scientific name of any plant (including the genus and species of the plant)," the value, "the quantity, including the unit of measure," and "the name of the country from which the plant was taken"; where the species or country varies and is unknown, each one that may have been used is listed, and paper products declare their average recycled content (16 USC 3372(f)). APHIS began Phase VII of its implementation on December 1, 2024 for further product categories; ACE is "the primary method for filing Lacey Act declarations," with APHIS's LAWGS web form as the alternative; and "as of January 1, 2026, APHIS is no longer accepting paper submissions of the PPQ 505 or 505B form." A de minimis disclaimer covers products whose plant material is no more than 5 percent of a unit's weight, provided the plant material on the entry line totals no more than 2.9 kilograms.

A wooden chair, a guitar or a box of printer paper therefore needs botanical data on the item record (genus, species, country of harvest per component), which no product catalog holds by default and which has to come from the supplier's bill of materials.

### EPA: TSCA Certification

Importers of chemical substances certify at entry under 19 CFR 12.121 either "I certify that all chemical substances in this shipment comply with all applicable rules or orders under TSCA" (positive) or "I certify that all chemicals in this shipment are not subject to TSCA" (negative). The certification is filed electronically through ACE "prior to release of the shipment," with the certifier's name, phone number and email per entry. EPA publishes its own supplemental guide for the PGA Message Set on CBP's CATAIR page. Which certification applies is a property of the item and its composition, not the shipment, so it belongs on the item with a reviewer and a date.

### The Smaller Programs

- **NHTSA.** Motor vehicles and equipment subject to federal safety standards need a declaration "in a paper or electronic format accepted by U.S. Customs and Border Protection" at importation, choosing among options such as conforming to all applicable standards and bearing a certification label, or being imported "solely for export" (49 CFR 591.5). The trade calls the declaration form HS-7; the regulation's text doesn't name it. <!-- source-gap: logistics-forced-labor-hs7 | missing | the NHTSA declaration form is designated HS-7 | closes with: an NHTSA or CBP page naming Form HS-7 | checked: 2026-11-22 --> NHTSA's PGA Message Set manual carries it in ACE.
- **FCC.** Radio frequency devices may be imported only under one of the conditions in 47 CFR 2.1204 (authorized devices, up to 4,000 units for testing, up to 400 for trade shows, export only, repair and others), and "the ultimate consignee must be able to document compliance with the selected import condition." The current rule names no declaration form, and FCC has no supplemental guide on CBP's CATAIR page as of November 2026.
- **TTB.** Imported wine in containers "is not eligible for release from customs custody for consumption" without a certificate of label approval (COLA) matching the label; an electronic filer gives CBP "the TTB-assigned number of the valid COLA" with the entry (27 CFR 4.40). Excise tax on spirits is assessed at importation (27 CFR 27.40).
- **Fish and Wildlife Service.** Wildlife imports need "a completed Declaration for Importation or Exportation of Fish or Wildlife (Form 3-177)," filed where Service clearance is requested (50 CFR 14.61); FWS publishes an ACE implementation guide.

## How to Build It

Four tables, keyed to the entry model from [Import Entry & ACE](/books/logistics/import-entry): a review per forced labor detention, a trace graph per item or lot, the agency rules per tariff number, and the agency filings per entry line.

```sql
-- One forced labor case on one entry: a WRO, Finding or UFLPA detention, and how it ended.
CREATE TABLE forced_labor_reviews (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  customs_entry_id   UUID NOT NULL REFERENCES customs_entries (id),
  regime             TEXT NOT NULL CHECK (regime IN ('uflpa', 'caatsa', 'wro', 'finding')),
  basis_ref          TEXT,                  -- the WRO or Finding cited, or 'potential_input'
  input_kind         TEXT CHECK (input_kind IN ('potential', 'direct')),  -- UFLPA only
  detained_at        TIMESTAMPTZ,           -- the date of presentation the notice states
  notice_received_at TIMESTAMPTZ NOT NULL,
  notice_document_id UUID REFERENCES documents (id),  -- CBP Form 6051D or the exclusion notice
  response_due_on    DATE NOT NULL,         -- 30 days from the notice, moved by each extension
  extensions_granted SMALLINT NOT NULL DEFAULT 0 CHECK (extensions_granted BETWEEN 0 AND 2),
  path               TEXT CHECK (path IN ('applicability_review', 'exception_review',
                       'admissibility_proof', 'export', 'destroy', 'protest', 'petition')),
  package_document_id UUID REFERENCES documents (id),  -- the submission as sent, with its index
  submitted_at       TIMESTAMPTZ,
  outcome            TEXT CHECK (outcome IN ('released', 'excluded', 'seized', 'exported',
                       'destroyed', 'abandoned')),
  decided_at         TIMESTAMPTZ,
  disposal_due_on    DATE,                  -- 180 days from a UFLPA exclusion
  storage_cost       BIGINT CHECK (storage_cost >= 0),  -- minor units; the importer pays
  currency           CHAR(3),
  CHECK (storage_cost IS NULL OR currency IS NOT NULL),
  CHECK (outcome IS NULL OR decided_at IS NOT NULL)
);
CREATE INDEX ON forced_labor_reviews (customs_entry_id);

-- One link in the chain from raw material to imported good, with the record that proves it.
CREATE TABLE supply_chain_trace_records (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id            UUID NOT NULL REFERENCES items (id),     -- the output at this tier
  lot_id             UUID REFERENCES lots (id),
  parent_id          UUID REFERENCES supply_chain_trace_records (id),  -- the next tier down
  tier               SMALLINT NOT NULL CHECK (tier >= 0),     -- 0: the imported good
  material           TEXT NOT NULL,         -- 'polysilicon', 'cotton lint', 'aluminum ingot'
  supplier_party_id  UUID NOT NULL REFERENCES parties (id),
  role               TEXT NOT NULL CHECK (role IN ('miner', 'grower', 'processor',
                       'manufacturer', 'trader', 'exporter', 'carrier')),
  facility_id        UUID REFERENCES facilities (id),         -- where it was made, not billed
  origin_country     CHAR(2) NOT NULL,
  origin_subdivision TEXT,                  -- ISO 3166-2; CN-XJ is the question
  quantity_in        NUMERIC(18, 3),        -- input consumed, for the mass balance
  quantity_out       NUMERIC(18, 3),
  uom                TEXT NOT NULL,
  produced_during    TSTZRANGE,
  evidence_kind      TEXT NOT NULL CHECK (evidence_kind IN ('purchase_order', 'invoice',
                       'packing_list', 'bill_of_materials', 'certificate_of_origin',
                       'payment_record', 'inventory_record', 'transport_record',
                       'production_record', 'capacity_report', 'audit_report',
                       'isotopic_test', 'translation')),
  document_id        UUID NOT NULL REFERENCES documents (id), -- the record itself, as received
  verified_by        TEXT,                  -- who checked it against its neighbors
  recorded_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (parent_id IS NULL OR parent_id <> id)
);
CREATE INDEX ON supply_chain_trace_records (item_id, lot_id);
CREATE INDEX ON supply_chain_trace_records (parent_id);

-- Which agency a tariff number may trigger, and what the filer then owes it, by date.
CREATE TABLE pga_requirements (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  agency         TEXT NOT NULL CHECK (agency IN ('FDA', 'CPSC', 'APHIS', 'EPA', 'NHTSA',
                   'FWS', 'TTB', 'AMS', 'ATF', 'DEA', 'DDTC', 'NMFS', 'OMC', 'FSIS')),
  program_code   TEXT NOT NULL,            -- the agency's program in its CATAIR guide
  tariff_prefix  TEXT NOT NULL,            -- HTSUS digits, matched by prefix
  flag           TEXT,                     -- e.g. 'FD3'; the agency's indicator
  disposition    TEXT NOT NULL CHECK (disposition IN ('required', 'may_apply')),
  data_rules     JSONB NOT NULL DEFAULT '{}',  -- required elements and timing by mode
  valid_during   DATERANGE NOT NULL,
  source_ref     TEXT NOT NULL,            -- the guide version or CSMS that set it
  EXCLUDE USING gist (agency WITH =, program_code WITH =, tariff_prefix WITH =,
                      valid_during WITH &&)  -- equality on TEXT needs btree_gist
);

-- What was sent to an agency for one entry line, and what came back.
CREATE TABLE pga_filings (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  customs_entry_line_id UUID NOT NULL REFERENCES customs_entry_lines (id),
  agency                TEXT NOT NULL,
  program_code          TEXT NOT NULL,
  requirement_id        UUID REFERENCES pga_requirements (id),  -- the rule in force
  message_set           TEXT NOT NULL CHECK (message_set IN ('full', 'reference', 'disclaim',
                          'declaration', 'certification')),
  data                  JSONB NOT NULL,   -- the elements as transmitted, not as now
  reference_ids         JSONB NOT NULL DEFAULT '{}',  -- CPSC certifier/product/version IDs,
                                           -- FDA PN confirmation number, permit, COLA
  filed_at              TIMESTAMPTZ NOT NULL,
  status                TEXT NOT NULL CHECK (status IN ('filed', 'accepted', 'rejected',
                          'may_proceed', 'documents_requested', 'exam', 'hold', 'detained',
                          'refused', 'released')),
  status_at             TIMESTAMPTZ NOT NULL,
  UNIQUE (customs_entry_line_id, agency, program_code)
);

-- High-priority material flags on items, so screening knows which lines need a trace.
ALTER TABLE items
  ADD COLUMN forced_labor_materials TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN botanical_content      JSONB,    -- Lacey Act: genus, species, country per component
  ADD COLUMN tsca_certification     TEXT,     -- 'positive' or 'negative', per composition review
  -- NOT VALID: checks new rows now; validate after backfill without blocking writes
  ADD CONSTRAINT items_forced_labor_materials_check CHECK (forced_labor_materials <@
    ARRAY['cotton', 'tomatoes', 'polysilicon', 'pvc', 'aluminum', 'seafood']::TEXT[]) NOT VALID,
  ADD CONSTRAINT items_tsca_certification_check CHECK (tsca_certification IN ('positive',
    'negative')) NOT VALID;
```

Before filing, the broker's system asks which lines on an entry have a high-priority material and an incomplete trace: no tier reaching a raw material, a tier with no document, or a tier whose inputs don't cover its outputs.

```sql
WITH RECURSIVE chain AS (
  SELECT l.id AS line_id, t.id, t.role, t.origin_subdivision, t.quantity_in, t.quantity_out
  FROM customs_entry_lines l
  JOIN supply_chain_trace_records t
    ON t.item_id = l.item_id AND t.tier = 0 AND (l.lot_id IS NULL OR t.lot_id = l.lot_id)
  WHERE l.customs_entry_id = $1
  UNION ALL
  SELECT p.line_id, c.id, c.role, c.origin_subdivision, c.quantity_in, c.quantity_out
  FROM supply_chain_trace_records c
  JOIN chain p ON c.parent_id = p.id
)
SELECT l.line_number, i.sku, i.forced_labor_materials,
       coalesce(bool_or(c.role IN ('miner', 'grower')), false)     AS reaches_raw_material,
       coalesce(bool_or(c.origin_subdivision = 'CN-XJ'), false)    AS xinjiang_tier,
       coalesce(bool_or(c.quantity_in IS NULL OR c.quantity_out IS NULL), false) AS missing_balance
FROM customs_entry_lines l
JOIN items i ON i.id = l.item_id
LEFT JOIN chain c ON c.line_id = l.id
WHERE l.customs_entry_id = $1
  AND cardinality(i.forced_labor_materials) > 0
GROUP BY l.id, l.line_number, i.sku, i.forced_labor_materials
HAVING NOT coalesce(bool_or(c.role IN ('miner', 'grower')), false)
    OR coalesce(bool_or(c.origin_subdivision = 'CN-XJ'), false)
    OR coalesce(bool_or(c.quantity_in IS NULL OR c.quantity_out IS NULL), false);
```

Design notes:

- **The trace is a graph of documents, not a questionnaire.** Each link is a supplier, a facility, a material, quantities and the business record that proves it. A supplier's signed statement is a weak link CBP says isn't sufficient alone; keep it, but don't let it close a tier.
- **Screen every party in the trace, at its effective date.** The UFLPA Entity List has dated additions; screen suppliers, facilities' operators and exporters, keep the list version used, and rescreen open traces when the list changes, as [Export Compliance & Screening](/books/logistics/export-compliance) does for export lists.
- **Deadlines are computed and stored.** `response_due_on` and `disposal_due_on` are set from the notice date and each extension, with the rule that produced them ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)); a missed 30-day window turns a detention into an exclusion.
- **Agency rules are dated data.** Flags on tariff numbers, required elements and message set versions change with CBP's CATAIR guides and CSMS messages; `pga_requirements` keeps them with validity ranges and the source that set them.
- **File what you knew.** `pga_filings.data` is the payload as transmitted; a corrected certificate or a new prior notice is a new filing, not an edit, because a detention is judged on what was filed.
- **One event stream for every agency.** Each agency's answer becomes a `customs_entry_events` row with its agency, so a single query shows why a container is still at the terminal.

## Auditing

- **Every forced labor case** with its regime, notice, deadlines, extensions, the package as submitted, the decision and the disposal, kept with the entry.
- **Every trace link** with its document, who verified it and when, and every Entity List screening of the parties in it, with the list version.
- **Every PGA filing** as transmitted, per line and agency, with the requirement rule and source version in force, and every agency response with its time.
- **Every certificate version, Lacey Act declaration, TSCA certification and prior notice confirmation** linked to the item and lot it covered.
- **The importer's reasonable care.** CBP ties forced labor due diligence to the importer's duty under 19 USC 1484 to provide accurate and complete information; the records above are how that is shown. Entry record retention itself is in [Customs Brokers & Bonds](/books/logistics/customs-brokers-and-bonds).

The mechanics (typed actors, append-only history, tamper evidence) are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Treat forced labor as a supply chain record,** built as goods are bought and made, tier by tier, down to the raw material, with the business document behind each link.
- **Flag high-priority materials on the item** (cotton, tomatoes, polysilicon, PVC, aluminum, seafood) and refuse to file an entry for a flagged line with an incomplete trace without a person's sign-off.
- **Screen every supplier in the trace against the UFLPA Entity List,** with listing dates and list versions, separately from export screening.
- **Track detentions as cases with clocks:** 30 days to respond, at most two extensions within 90 days, 180 days after a UFLPA exclusion, 3 months for WRO proof, 60 days before abandonment.
- **Keep agency requirements per tariff number as dated rules** and resolve "may apply" flags from item attributes, filing or disclaiming deliberately.
- **Hold certificate, botanical, TSCA and prior notice data on the item and lot,** maintained by the importer, so the broker files from data that exists before the goods ship.
- **Record every agency's answer as its own event,** because a CBP release isn't an FDA may-proceed.

## References

**Statutes and regulations**

- [19 U.S.C. 1307 (Cornell LII)](https://www.law.cornell.edu/uscode/text/19/1307), the forced labor prohibition, the definition and the 2016 removal of the consumptive demand clause
- [19 U.S.C. 1499 (Cornell LII)](https://www.law.cornell.edu/uscode/text/19/1499), the five-day detention decision, the notice's contents and deemed exclusion after 30 days
- [19 CFR 12.42 (Cornell LII)](https://www.law.cornell.edu/cfr/text/19/12.42), withhold release orders, the "reasonably but not conclusively indicates" standard and Findings
- [19 CFR 12.43 (Cornell LII)](https://www.law.cornell.edu/cfr/text/19/12.43), the certificate of origin, the consignee's statement and the three-month limit
- [19 CFR 12.44 (Cornell LII)](https://www.law.cornell.edu/cfr/text/19/12.44), export before seizure, exclusion, 60-day abandonment and seizure under a Finding
- [19 CFR 12.121 (Cornell LII)](https://www.law.cornell.edu/cfr/text/19/12.121), the TSCA positive and negative certifications and electronic filing before release
- [21 U.S.C. 381 (Cornell LII)](https://www.law.cornell.edu/uscode/text/21/381), FDA refusal grounds, the 90-day export or destruction rule and holding food without prior notice
- [21 CFR 1.279 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/1.279), prior notice timing by mode, earliest submission and the confirmation number
- [21 CFR 1.281 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/1.281), prior notice contents and the mail tracking number from October 1, 2026
- [16 U.S.C. 3372 (Cornell LII)](https://www.law.cornell.edu/uscode/text/16/3372), the Lacey Act plant declaration contents
- [7 CFR 330.200 (Cornell LII)](https://www.law.cornell.edu/cfr/text/7/330.200), the plant pest permit requirement
- [49 CFR 591.5 (Cornell LII)](https://www.law.cornell.edu/cfr/text/49/591.5), the NHTSA import declaration and its options
- [47 CFR 2.1204 (Cornell LII)](https://www.law.cornell.edu/cfr/text/47/2.1204), FCC import conditions and the consignee's documentation duty
- [27 CFR 4.40 (Cornell LII)](https://www.law.cornell.edu/cfr/text/27/4.40), COLA required for release of imported wine and the COLA number in electronic filings
- [27 CFR 27.40 (Cornell LII)](https://www.law.cornell.edu/cfr/text/27/27.40), excise tax on imported distilled spirits
- [50 CFR 14.61 (Cornell LII)](https://www.law.cornell.edu/cfr/text/50/14.61), the Fish and Wildlife Form 3-177 declaration

**CBP and DHS**

- [CBP: Forced Labor Enforcement Operational Guidance for Importers, Publication 5560-0526 (June 2026)](https://www.cbp.gov/sites/default/files/2026-06/fld_importer_guidance_final_06092026_0.pdf), potential and direct inputs, the 30-day window, extensions, the treble bond, applicability and exception reviews, Appendix E documents, 180-day disposal, CAATSA, CTPAT benefits and isotopic testing
- [CBP: Uyghur Forced Labor Prevention Act](https://www.cbp.gov/trade/forced-labor/UFLPA), the rebuttable presumption, its June 21, 2022 effective date and the clear and convincing standard
- [CBP: UFLPA enforcement FAQs](https://www.cbp.gov/trade/forced-labor/faqs-uflpa-enforcement), applicability versus exception, review and detention times, the clear and convincing standard and the six priority sectors
- [CBP: Withhold Release Orders and Findings](https://www.cbp.gov/trade/forced-labor/withhold-release-orders-and-findings), the dashboard, its November 13, 2026 modification and CBP's practice on publicizing detentions
- [DHS: UFLPA Entity List](https://www.dhs.gov/uflpa-entity-list), 210 listings by section and the October 29, 2026 additions
- [CBP: ACE CATAIR](https://www.cbp.gov/trade/ace/catair), the PGA Message Set chapter and each agency's supplemental guide

**Partner agencies**

- [FDA: FDA Import Process](https://www.fda.gov/industry/import-program/fda-import-process), entry through ACE, the screening tool that "uses various sources of information to assess risk" and holding goods until admissibility is decided
- [FDA: Entry Screening Systems and Tools](https://www.fda.gov/industry/fda-import-process/entry-screening-systems-and-tools), PREDICT, undisclosed scores, entry without further review and May Proceed
- [FDA: Entry Review](https://www.fda.gov/industry/fda-import-process/entry-review), the Documents Requested status and release without precluding later action
- [FDA: Detention and Hearing](https://www.fda.gov/industry/fda-import-process/detention-hearing), the Notice of FDA Action, testimony, reconditioning, response times and refusal
- [FDA: Harmonized Tariff Schedule and FD Flags](https://www.fda.gov/industry/import-basics/harmonized-tariff-schedule-and-fd-flags), FD1 to FD4 and disclaiming
- [CPSC: Mandatory eFiling for Certificates of Compliance (July 8, 2026)](https://www.cpsc.gov/Newsroom/News-Releases/2026/CPSC-Implements-Mandatory-eFiling-for-Certificates-of-Compliance-Targeting-Dangerous-Foreign-Imports), the effective date, the FTZ date, domestic manufacturers and no new obligations
- [CPSC: eFiling FAQ](https://www.cpsc.gov/FAQ/eFiling-Frequently-Asked-Questions-FAQ), the Full and Reference message sets, Certificate Identifiers, low-value shipments, enforcement discretion and Disclaim message sets
- [CPSC: eFiling Product Registry](https://cpsc.gov/eFiling-CPSC-Product-Registry), the Registry and its separation from ACE
- [USDA APHIS: Lacey Act](https://www.aphis.usda.gov/plant-imports/lacey-act), ACE and LAWGS filing, Phase VII, the end of paper PPQ 505 and the de minimis disclaimer's 5 percent and 2.9 kilogram limits

