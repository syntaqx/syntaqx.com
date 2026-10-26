+++
title = "Regulated Materials"
description = "Pesticides, refrigerants and pool chemicals: FIFRA and the label, certified applicators, state use records, product catalogs, dilution, weather and SDS."
category = "Field Operations Industry"
order = 1515
part = "The Rules"
tags = ["field-operations", "pesticides", "compliance", "recordkeeping", "regulation", "refrigerants"]
+++

A lawn technician who sprays a weed control, or a pest technician who treats a perimeter, has just done something federal and state law care about in detail: which product, under which registration, mixed at what rate, how much, against what pest, where, by whom, under which license, in what weather. If the record is wrong or missing, the company can't defend the application to an inspector, a customer who claims harm, or a neighbor who says the spray drifted into their garden. Lawn, tree, pool and HVAC work carry versions of the same burden. It's hard because the record is written by someone in a yard with a phone, often offline, the rules differ by state and by product, and the record has to stay right for years after the label and the license have both changed.

This chapter covers what the law asks for, how the platforms capture it, and how to build an application record that survives an inspection. Who is allowed to apply is its own topic, in [Licenses & Permits](/docs/industries/field-operations/licensing-and-permits).

## The Label Is the Law

Pesticides in the US are governed by the **Federal Insecticide, Fungicide, and Rodenticide Act (FIFRA)**. With certain exceptions, every pesticide distributed or sold in the US must be registered by EPA, and the registration produces a **label**, and in EPA's words, "the label is the law." It specifies who may use the product and "where, how, how much, and how often it may be used," and every label carries the sentence "It is a violation of Federal law to use this product in a manner inconsistent with its labeling." The statute backs it: using a registered pesticide "in a manner inconsistent with its labeling" is an unlawful act under 7 U.S.C. 136j(a)(2)(G), and so is refusing to keep required records or knowingly falsifying them.

For a software system, three things on the label matter most:

- **The EPA registration number.** Written "EPA Reg. No.", it's a company number, a hyphen, and a product number reflecting the order the company submitted products. EPA's Pesticide Product Label System (PPLS) searches by registration number, distributor product number, company, product name and active ingredient. The **EPA establishment number** ("EPA Est.") is different: it identifies the facility that produced the product; don't key a catalog on it.
- **The label version.** PPLS keeps current and historical labels, each stamped with a date. Labels change, and you validate against the one in force on the day of the application.
- **The signal word.** DANGER (Category I, high toxicity), WARNING (Category II), CAUTION (Category III), and an optional CAUTION for Category IV. Useful for in-app warnings.

Disinfectants count too. EPA says "disinfectants are pesticides" and that it "regulates and registers antimicrobial pesticides." Pool sanitizers and algaecides carry FIFRA registrations and labels for the same reason, so a pool service or a commercial cleaning platform holds registered products whether or not it thinks of itself as a pesticide business, and the label's directions bind its crews too.

## Restricted Use and Certified Applicators

EPA classifies some products as **restricted use pesticides (RUPs)**: not available to the general public, and usable only by a certified applicator or someone under a certified applicator's direct supervision. EPA publishes an RUP report listing each restricted registration with its number, product name, company and active ingredient; import it, don't hand-maintain the flag.

Certification is federal in standard and state in practice: state agencies certify applicators under EPA-approved plans, many states require certification for all commercial pesticide use, and the federal commercial categories in 40 CFR 171.101, such as "Ornamental and turf pest control," "Industrial, institutional, and structural pest control" and "Non-soil fumigation," are what states map their own onto. [Licenses & Permits](/docs/industries/field-operations/licensing-and-permits) covers the licensing model.

Two parts of the rule turn directly into data:

- **Recertification (40 CFR 171.107):** a certification "shall expire five years after issuance" unless the applicator recertifies, and "a certifying authority may establish a shorter certification period." Five years is the ceiling, not the default: store each certification's expiry from the issuing state, and treat it as lapsed if recertification didn't land before that date.
- **Direct supervision (40 CFR 171.201):** a noncertified person may use an RUP only if the certified applicator has confirmed they're at least 18 and trained and instructed on the equipment within 12 months, the label is accessible throughout, and the supervisor is reachable immediately; training records are kept two years from the date of use.

So an RUP application record names both the person who applied it and the certified applicator responsible, and the system must prove the supervision prerequisites held that day.

## What States Want Recorded

The application record itself is mostly a state requirement, and the states don't agree on fields, deadlines or retention. A few verified examples:

| State | Who and what | Record fields (highlights) | Timing and retention |
| ----- | ------------ | -------------------------- | -------------------- |
| Texas | Structural pest control use records (4 Tex. Admin. Code 7.144) | Addresses, products and EPA registration numbers, amount, mixing rate or active ingredient percentage, target pest, date, license numbers of everyone applying, supervising or training, and the business's; termite work adds area treated and barrier diagrams | Kept two years at the business, produced on request |
| Minnesota | Structural applicators (Minn. Stat. 18B.37, subd. 3) | Date, target pest, brand name, EPA registration number, amount, time completed, customer, applicator name and license, company; fumigation adds temperature and exposure time | Completed within five days after the application, copy to the customer, kept five years after treatment |
| New York | Commercial applicators (NYSDEC policy OGC 3) | EPA registration number, product, quantity, date, address with five-digit ZIP, dosage rate, method, target organism, and the place precisely enough to "return to a site and identify the exact location," such as a particular kitchen in a restaurant | Annual report by February 1 for the prior year; records kept three years |
| California | Structural pest control businesses (DPR enforcement letter ENF 12-18) | Monthly summary pesticide use report to the county agricultural commissioner where the work was done, on the DPR form or through the Cal-Ag permit system | Monthly; counties publish their own due dates; school and day care sites are reported separately |
| Arizona | Termite work (Ariz. Admin. Code R3-8-503) | Termite Action Registration Form (TARF) with license number, qualifying party, and for pretreatments the chemical, EPA registration number, amount, active ingredient percentage and square and linear footage | Within 30 days of the treatment, with a fee; service records kept three years; specimen labels and SDS kept for every product in use |
| Pennsylvania | Applicators near registered hypersensitive people (7 Pa. Code 128.112) | Notice of each contact and attempt, with time and method | Notice 12 to 72 hours before application; record within 24 hours, kept three years |

These rules change, and every state has its own. Treat the table as the shape of the problem, check current state law before relying on any field or deadline, and build the requirements as data so a rule change is a configuration change.

The pattern across them is consistent: product identity by registration number, quantity in a real unit, rate or concentration, target, location at the precision the state asks for, date and time, and the license of every person involved. What varies is retention (two, three, five years in the table), whether you file a report or only keep records, how often you file, and the unit and format the state accepts.

## How the Platforms Do It

The pest and lawn verticals document the deepest chemical tooling; the horizontal suites publish little on it.

| Platform | Catalog | Capture | Reporting |
| -------- | ------- | ------- | --------- |
| FieldRoutes | EPA number, active ingredients, default dilution, concentrated and diluted units, mix ratio, label and SDS links, Sentricon flags, state pest control code | Per appointment: dilution, diluted and concentrated amounts, targets, locations, method, square footage, active ingredient rate, EPA lot | State Chemical Report by county in Standard, California, New York and Ohio formats; New York export to the state upload format; Arizona TARF; California School and Day Care Report |
| PestPac (WorkWave) | EPA number, concentration and undiluted quantity per chemical; approved units and thresholds | EPA numbers auto-populate in the app; techs can't enter arbitrary concentrations | California, Cal-Ag, New York and Arizona TARF exports; distributor-to-truck inventory |
| GorillaDesk | Master lists for materials and EPA numbers, locations, target pests, methods, units, area, dilution | On service templates, jobs, or individual devices | Material Use report; materials print on invoices and work orders "to meet state requirements" |
| Jobber | Company licensing, applicator license numbers, chemical list, tank mixtures | Treatment record: address, job, applicator, time, chemical and concentration, weather, notes; web only, not the mobile app | Sortable list and CSV export |
| Solea | Keyed by EPA number, which fills name, manufacturer and active ingredients; label and SDS linked | Product, amount or total mix, method, target pests, areas, weather (temperature, wind, rain), at checkout or per device | Usage and active ingredient totals by technician, state or team; state formats not published |
| Arborgold | Materials with inventory | Crews record weather and chemical use at the job site | State regulatory reports "printed and filed in a couple of clicks" |
| Pool Brain | Chemical categories with dosing defaults; custom chemicals with unit, cost and price | Dosing calculated from water readings using Orenda formulas | Use and cost per body of water and technician; per-unit billing |

A few details in these docs are worth copying. FieldRoutes' New York output drops products not measured in accepted volume or weight units, so a product logged in "bottles" is invisible to the state. PestPac and Solea catch off-label concentrations at entry, not in a report. Pool Brain only deactivates a chemical that has been used, never deletes it.

## The Product Catalog

- **Key products by registration number plus your own ID.** Distributor products share a base registration and one product comes in several sizes, so your `product_id` is the identity and the registration number a validated attribute.
- **Version the label.** Store the label's stamp date and the facts you validate against (sites, pests, rate ranges, RUP status, signal word, re-entry instructions) as a `label_version`. Applications reference the version in force that day.
- **Fill from the registry, review by a human.** Look the product up by EPA registration number, pull name, registrant and active ingredients from the public registry, then have a licensed person confirm rates and sites, because label directions are prose.
- **Carry the documents.** Label PDF and SDS on every product, available offline in the technician app.
- **Units are part of the product.** Concentrate, diluted and inventory units and the conversions between them.
- **Per-jurisdiction availability.** Where a product may be used depends on its label and on local rules; model it per jurisdiction as data and check it at assignment and at entry.
- **Deactivate, never delete.** A product with applications against it stays forever.

## Rates, Dilution and Units

Most technicians don't apply concentrate; they mix it. A label rate like "0.8 fl oz per gallon" and a tank of 2 gallons means the record has three numbers that must agree: concentrate applied (1.6 fl oz if the whole tank goes down), finished mix applied, and active ingredient applied (concentrate times the active ingredient percentage). Different states want different ones: Texas accepts the mixing rate plus total material, or the active ingredient percentage plus total.

Do the math in the system, not in the technician's head:

1. The technician picks the product and the mix (or a saved **tank mix**, as Jobber supports, or a preset like GorillaDesk's material presets) and enters what they actually applied.
2. The app computes concentrate and active ingredient from the mix ratio and the label version's concentration.
3. It compares the rate to the label version's range and to the area treated, and warns or blocks when it's off, as PestPac does by preventing arbitrary concentrations.
4. It stores the entered values and the computed ones, with the formula version, so a later dispute can reproduce the arithmetic.

Store quantities as decimals with an explicit unit, never floats, and refuse a report rather than emit a unit the state doesn't accept.

Tank mixes have a subtlety: one tank may hold two products applied in one pass. Record one application line per product, linked to the same mix, so each product's quantity and registration number are reportable on their own.

## Weather, Location and Sensitive Places

Labels govern conditions as well as amounts. Many carry spray drift language that names wind speed and direction, temperature and humidity as factors the applicator must weigh, and some set numeric wind limits; those are per product, so they live on the label version. Jobber and Arborgold capture weather with the application. Fill it from a weather API at the device's location and time, let the technician correct it, and store both with the reading's source, since a station 20 miles away is weak evidence.

Location needs to be as precise as the strictest state you serve. New York wants enough detail to return to "the exact location." Record treated areas (perimeter, kitchen, bait station 7) as structured values from the property's area list, plus the device's coordinates, which also answers the "were you even here" dispute in [Proof of Service](/docs/industries/field-operations/proof-of-service).

Some places carry extra rules:

- **Sensitivity registries.** Pennsylvania distributes its Pesticide Hypersensitivity Registry of physician-verified people to licensed businesses by March 1 and July 15 each year. Applicators notify listed people whose property line is within 500 feet, 12 to 72 hours ahead, with a window of at most 24 hours, the products' brand names and EPA numbers, and the business's license number. Load each release as a dated dataset, geocode it, and run the 500-foot check at scheduling so the notice goes out in the window.
- **Schools and day care.** FieldRoutes' docs describe California's annual report on applications at school and day care sites, driven by a "School" sub-property type. Make site type a property attribute, not a note.
- **Customer-specific restrictions.** "No products in the garden," "pets on site," "beehives on the east fence." Store them on the property and show them before the first spray.

## Safety Data Sheets

OSHA's Hazard Communication standard requires employers to keep a safety data sheet for each hazardous chemical and make it "readily accessible during each work shift to employees when they are in their work area(s)," and permits electronic access that creates no barrier to immediate access (29 CFR 1910.1200(g)(8)). Field technicians fall under the exception for traveling employees: "Where employees must travel between workplaces during a workshift," the sheets "may be kept at the primary workplace facility," and "the employer shall ensure that employees can immediately obtain the required information in an emergency" (29 CFR 1910.1200(g)(9)). So the rule doesn't require a binder in every van; it requires that a technician with a spill in a basement can get the sheet now. Arizona's rule separately requires a business to keep specimen labels and SDSs for every pesticide currently in use.

My default is to meet the emergency test on the device rather than through a phone call to the shop: attach the current SDS and label to each catalog product, sync them so they open offline, and record which SDS version was attached when. A truck inventory view with each product's SDS one tap away covers it, and [Fleet, Inventory & Safety](/docs/industries/field-operations/fleet-and-safety) supplies what's on the truck. The alternative, a phone line to the branch, can meet the emergency test too, but only if someone answers every time.

## Other Trades

- **HVAC refrigerants.** Under the Clean Air Act's Section 608, which covers ozone-depleting refrigerants (CFCs and HCFCs) and their substitutes, such as HFCs, technicians who maintain, service, repair or dispose of equipment that could release refrigerant must be certified (Core plus Type 1 small appliances, Type 2 high-pressure, Type 3 low-pressure, or Universal for all), and only certified technicians, or employers showing they employ one, may buy refrigerant for stationary equipment. The recordkeeping rules have changed several times, so date what you build to. As EPA's Section 608 guidance stood when last updated (February 24, 2026): technicians disposing of appliances holding 5 to 50 pounds keep, for three years, each appliance's location, recovery date and refrigerant type, monthly totals recovered by type, and transfers for reclamation; for appliances holding 50 pounds or more of ozone-depleting refrigerant, the technician gives the owner documentation of refrigerant added and of leak inspections. Separately, since January 1, 2026, EPA's AIM Act leak-repair rule (40 CFR 84.106) covers appliances holding 15 pounds or more of an HFC or a substitute with a global warming potential above 53, excluding residential and light commercial air conditioning and heat pumps, and requires service records (appliance, date, type of work, technician, refrigerant added or recovered) kept at least three years. The record either way is a refrigerant movement (type, quantity, charged or recovered, appliance, technician, certification) with cylinder inventory behind it, covered in [Fleet, Inventory & Safety](/docs/industries/field-operations/fleet-and-safety).
- **Pool chemicals.** Sanitizers and algaecides are registered pesticides; the operational record is a dosing record driven by water chemistry. Pool Brain calculates doses from the technician's readings with Orenda's formulas, tracks use and cost per body of water, and can append a "wait to swim" message to the customer's email when a flagged chemical was used. Store readings, recommended dose, dose added and product, so a complaint about the water can be answered from the record.
- **Termite baiting.** Bait stations are long-lived devices with their own service history. GorillaDesk records materials per device; PestPac's app scans Sentricon bait stations and tracks termite activity; ServiceTitan's Property Care generates a report in Corteva's required format for a monthly upload.

## Designing the Application Record

The record is assembled from the catalog, the visit, the technician and the jurisdiction, validated, then frozen.

![An application record is assembled from four inputs: the catalog product with its label version, the technician's licenses, the visit's address and jurisdiction rules, and weather at the device's location. Four checks run at entry: product allowed in this jurisdiction, applicator certified or supervised for the category, rate within the label, and required state fields present. The saved record carries a snapshot of the product and license and feeds the customer's service report, the state report, inventory and the audit trail. Corrections are new amendment records, never edits.](/diagrams/fo-regulated-materials-record.svg "The application record is checked at entry against the label version and the jurisdiction's rules, then frozen with its own copy of the product and license data. Reports and slips read the snapshot; corrections append.")

A minimal schema, added alongside the canonical visits and properties rather than redefining them:

```sql
CREATE TABLE products (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  name               TEXT NOT NULL,
  epa_reg_no         TEXT,              -- null only for unregistered materials
  distributor_no     TEXT,
  is_restricted_use  BOOLEAN NOT NULL DEFAULT FALSE,  -- from EPA's RUP report
  is_active          BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE label_versions (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  product_id      UUID NOT NULL REFERENCES products (id),
  stamped_on      DATE NOT NULL,
  valid_during    DATERANGE NOT NULL,      -- when this label governs use
  signal_word     TEXT,
  ai_percent      NUMERIC(9,6) NOT NULL,   -- per active ingredient in practice
  rate_min        NUMERIC(12,6), rate_max NUMERIC(12,6), rate_unit TEXT,
  sites           TEXT[] NOT NULL,
  label_url       TEXT NOT NULL, sds_url TEXT,
  CONSTRAINT label_versions_valid_during_excl
    EXCLUDE USING GIST (product_id WITH =, valid_during WITH &&)
);

CREATE TABLE applications (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  visit_id           UUID NOT NULL REFERENCES visits (id),
  property_id        UUID NOT NULL REFERENCES properties (id),
  label_version_id   UUID NOT NULL REFERENCES label_versions (id),
  applied_at         TIMESTAMPTZ NOT NULL,     -- device clock: when the product went down
  received_at        TIMESTAMPTZ NOT NULL,     -- server clock; later after offline sync
  applicator_id      UUID NOT NULL REFERENCES staff_members (id),
  applicator_license JSONB NOT NULL,          -- snapshot: number, state, category, expires on
  supervisor_id      UUID REFERENCES staff_members (id),  -- certified applicator for RUP or apprentice work
  supervisor_license JSONB,
  product_snapshot   JSONB NOT NULL,           -- name, reg no, ai %, signal word at time of use
  mix_id             UUID,                     -- shared by products in one tank
  concentrate_qty    NUMERIC(14,6) NOT NULL, concentrate_unit TEXT NOT NULL,
  applied_qty        NUMERIC(14,6) NOT NULL, applied_unit TEXT NOT NULL,
  ai_qty             NUMERIC(14,6) NOT NULL, ai_unit TEXT NOT NULL,
  calc_version       TEXT NOT NULL,
  method             TEXT NOT NULL,
  target_pests       TEXT[] NOT NULL,
  areas              TEXT[] NOT NULL,
  area_sqft          NUMERIC(12,2), linear_ft NUMERIC(12,2),
  weather            JSONB,                    -- reading, source, station distance, is_edited
  location           GEOGRAPHY(POINT, 4326),
  jurisdiction_ids   UUID[] NOT NULL,          -- jurisdictions (id), from Licenses & Permits
  warnings           JSONB NOT NULL DEFAULT '[]',  -- off-rate, overridden checks, with reason
  amends_id          UUID REFERENCES applications (id)
);
```

The decisions behind it:

- **Snapshot, don't join.** The product name, registration number, active ingredient percentage and the applicator's license number are copied into the record. A catalog edit or license renewal next year must not change what a 2026 record says ([Audit Trails: Snapshot What Changes Underneath You](/docs/architecture/audit-trails#snapshot-what-changes-underneath-you)). The alternative, a foreign key to the label version alone, works only if label versions are truly immutable; the snapshot is cheap insurance against a catalog merge or a hand edit.
- **Two clocks.** `applied_at` is when the product went down, from the device clock checked against server time; `received_at` is when the server received it. Offline capture is normal ([The Technician App](/docs/industries/field-operations/technician-app)). Minnesota's deadline runs from the application ("no later than five days after the application of the pesticide"), so the record's completion deadline is computed from `applied_at`, and a record that syncs late is late against that date, not against `received_at`. Store instants in UTC and render in the property's time zone ([Time](/docs/fundamentals/time)).
- **Validate at entry, record what you overrode.** Run the four checks in the diagram for every jurisdiction the address falls in. A hard failure blocks completion; a soft one (rate slightly high, weather missing) is allowed with a stored reason.
- **Append-only.** A correction is a new row with `amends_id`, author, time and reason; reports read the latest amendment and the original stays ([Amend, Don't Overwrite](/docs/architecture/audit-trails#amend-don-t-overwrite)). FIFRA makes knowingly falsifying required records unlawful, so a system that lets anyone quietly rewrite last month's quantities is a liability.
- **State requirements are data.** The `jurisdictions` table is defined in [Licenses & Permits](/docs/industries/field-operations/licensing-and-permits#a-licensing-model); an address can fall in several. Required fields, accepted units, location precision, filing frequency, due date and retention per jurisdiction drive both validation and report generation ([Rules as Data](/docs/architecture/rules-as-data)).
- **Reports are derived and reproducible.** A state report is a query over snapshots for a jurisdiction and period, rendered in that state's format. Store each generated file with its parameters and a hash, mark the period filed, and regenerate only as a new version. Vendors usually stop at the file: FieldRoutes' New York export produces a file for the state's upload site, and its docs say the Arizona TARF feature doesn't send forms to the state. Record who filed it and when.
- **Inventory follows the record.** Each application decrements the truck's stock of that product by the concentrate quantity; purchases minus applications minus transfers should equal the shelf, and unexplained gaps are a compliance signal as well as a cost.

What goes wrong in practice: technicians log products from habit rather than what's in the tank (pre-fill from the service type, but require a confirmation), a license expires mid-season and surfaces only on the state report, and a merged catalog row points history at the wrong label. Each is invisible until an inspector asks.

## Auditing

Application records are what an inspector, a plaintiff's lawyer and an insurer all ask for. Beyond the records themselves:

- **Overrides** with the check that failed (off-rate, missing weather, supervision not confirmed), who allowed it and why.
- **Catalog and label changes** with before and after values, since a wrong rate range silently passes bad records.
- **Registry and notice activity:** which registry release was loaded, which properties matched, and each notification attempt with time and method.
- **Report generation and filing:** parameters, the file and its hash, who filed it and when.

The record structure is in [Audit Trails](/docs/architecture/audit-trails); application record retention by state, and what a privacy deletion does to these records, are in [Audit Trails & Records](/docs/industries/field-operations/audit-trails-and-records).

## What This Means for the System You Build

- **A product catalog keyed by your own ID,** with validated EPA registration numbers, restricted-use status from EPA's list, versioned labels, units, and offline labels and SDSs.
- **An application record per product per visit** with concentrate, applied and active ingredient quantities, method, targets, treated areas, weather with its source, coordinates, and both the applied and received times.
- **Snapshots of product and license data in every record,** so history never changes when the catalog or a license does.
- **Validation at entry** against the label version, the applicator's certification or supervision, and every overlapping jurisdiction's required fields, with overrides recorded and reasoned.
- **Append-only corrections** with before, after, who and why.
- **Jurisdiction rules as data** that drive validation, report formats, filing deadlines and retention.
- **Reproducible state reports** with stored outputs and filing status per period.
- **Registry and sensitive-site checks at scheduling time,** with notices sent and logged inside the required window.
- **The same record shape for refrigerant movements and pool dosing,** tied to certifications, inventory and the refrigerant rule in force on the service date.

## References

**Specifications**

- [7 U.S.C. 136j: Unlawful acts](https://www.law.cornell.edu/uscode/text/7/136j), use inconsistent with labeling, and refusing or falsifying required records
- [40 CFR 171.101: Commercial applicator categories](https://www.law.cornell.edu/cfr/text/40/171.101), the federal categories, quoted by name, including ornamental and turf, industrial, institutional and structural, and soil and non-soil fumigation
- [40 CFR 171.107: Recertification](https://www.law.cornell.edu/cfr/text/40/171.107), certifications that expire five years after issuance at most, shorter periods set by the certifying authority, and recertification before expiry
- [40 CFR 171.201: Direct supervision of noncertified applicators](https://www.law.cornell.edu/cfr/text/40/171.201), age, 12-month training and equipment instruction, label access, communication and two-year records
- [4 Tex. Admin. Code 7.144: Pest control use records](https://www.law.cornell.edu/regulations/texas/4-Tex-Admin-Code-SS-7-144), Texas record fields, termite additions and two-year retention
- [Minn. Stat. 18B.37: Records](https://www.revisor.mn.gov/statutes/cite/18B.37), structural applicator fields, completion within five days after the application, customer copy and five-year retention
- [Ariz. Admin. Code R3-8-503: Recordkeeping and retention](https://www.law.cornell.edu/regulations/arizona/Ariz-Admin-Code-SS-R3-8-503), TARF timing and contents, labels and SDS, and three-year retention
- [7 Pa. Code 128.111: Registry](https://www.law.cornell.edu/regulations/pennsylvania/7-Pa-Code-SS-128-111), Pennsylvania's hypersensitivity registry and its March 1 and July 15 releases
- [7 Pa. Code 128.112: Notification](https://www.law.cornell.edu/regulations/pennsylvania/7-Pa-Code-SS-128-112), 500 feet, 12 to 72 hours, notice contents and three-year records
- [40 CFR 84.106: Leak repair](https://www.law.cornell.edu/cfr/text/40/84.106), the AIM Act leak-repair rule from January 1, 2026: 15-pound HFC appliances, exclusions and three-year service records
- [29 CFR 1910.1200: Hazard communication](https://www.law.cornell.edu/cfr/text/29/1910.1200), SDS access each shift in (g)(8), and SDSs kept at the primary workplace for traveling employees if immediately obtainable in an emergency in (g)(9)

**Reference**

- [EPA: Summary of FIFRA](https://www.epa.gov/laws-regulations/summary-federal-insecticide-fungicide-and-rodenticide-act), registration of pesticides distributed or sold in the US
- [EPA: Introduction to Pesticide Labels](https://www.epa.gov/pesticide-labels/introduction-pesticide-labels), "the label is the law" and the federal-law statement on every label
- [EPA: Label Review Training, Parts of the Label](https://www.epa.gov/pesticide-labels/label-review-training-module-2-parts-label-page-14), registration and establishment number formats
- [EPA: Pesticide Product Label System, more information](https://www.epa.gov/pesticide-labels/pesticide-product-label-system-ppls-more-information), search by registration and distributor number, and historical labels
- [EPA: Restricted Use Products Report](https://www.epa.gov/pesticide-worker-safety/restricted-use-products-rup-report), RUPs limited to certified applicators and those they supervise
- [EPA: Certification Standards for Pesticide Applicators](https://www.epa.gov/pesticide-worker-safety/certification-standards-pesticide-applicators), the 2017 rule's age, recertification and category changes
- [EPA: Selected EPA-registered disinfectants](https://www.epa.gov/pesticide-registration/selected-epa-registered-disinfectants), disinfectants as registered antimicrobial pesticides
- [NPIC: Signal Words](http://npic.orst.edu/factsheets/signalwords.html), DANGER, WARNING and CAUTION and the toxicity categories
- [NYSDEC: OGC 3, Pesticide recordkeeping and reporting](https://dec.ny.gov/regulatory/guidance-and-policy-documents/ogc-3-pesticide-recordkeeping-and-reporting-of-commercial-applicators), New York record contents, February 1 reports, exact location and three-year retention
- [California DPR: ENF 12-18, structural pesticide use reporting](https://www.cdpr.ca.gov/?p=7249), monthly summary reports to the county agricultural commissioner
- [EPA: Section 608 of the Clean Air Act](https://www.epa.gov/section608), refrigerant management for ozone-depleting refrigerants and their substitutes, such as HFCs
- [EPA: Section 608 Technician Certification](https://www.epa.gov/section608/section-608-technician-certification-0), who must be certified and the certification types
- [EPA: Questions and answers for Section 608 certified technicians](https://www.epa.gov/section608/epas-refrigerant-management-program-questions-and-answers-section-608-certified), disposal records, documentation for appliances of 50 pounds or more of ozone-depleting refrigerant, and three-year retention (last updated February 24, 2026)
- [EPA: Refrigerant Sales Restriction](https://www.epa.gov/section608/refrigerant-sales-restriction), refrigerant purchases limited to certified technicians and their employers

**In practice**

- [FieldRoutes: Chemicals API](https://knowledgebase.fieldroutes.com/apidocs/chemicals.md), catalog fields including EPA number, active ingredients, dilution, units, label and SDS links
- [FieldRoutes: Chemical Uses API](https://knowledgebase.fieldroutes.com/apidocs/chemical-uses.md), per-appointment application fields including dilution, amounts, areas, method and EPA lot
- [FieldRoutes: State Chemical Report](https://knowledgebase.fieldroutes.com/docs/state-chemical-report.md), county reports in state formats and New York's accepted units
- [FieldRoutes: Arizona TARF](https://knowledgebase.fieldroutes.com/docs/arizona-tarf.md), TARF setup, linear footage and that the feature doesn't submit to the state
- [FieldRoutes: California School and Day Care Report](https://knowledgebase.fieldroutes.com/docs/california-school-and-day-care-report.md), school sites as a property type and annual reporting
- [PestPac: Chemical Tracking](https://www.pestpac.com/features/chemical-tracking-software), auto-populated EPA numbers, approved units and state exports
- [GorillaDesk: Material Usage](https://intercom.help/gorilladesk/en/articles/1086001-material-usage), master lists, per-device materials and printed material tables
- [Jobber: Chemical Tracking](https://help.getjobber.com/es/articles/chemical-tracking/), applicator licenses, tank mixtures, weather and CSV export
- [Solea: Chemical Tracking](https://www.solea.ai/product/chemical-tracking), lookup by EPA number, dilution checks, weather and usage reports
- [Arborgold: Plant Health Care Software](https://arborgold.com/industries/plant-health-care-software/), weather and chemical records at the job site and state reports
- [ServiceTitan: Expands into Enterprise Pest Control, Lawn Care and Pool and Spa](https://www.servicetitan.com/press/servicetitan-expands-into-enterprise-pest-control-lawn-care-and-pool-spa-markets), Sentricon reporting for Corteva's monthly upload
- [Pool Brain: Chemical Settings Explained](https://help.poolbrain.com/en/articles/6789830-chemical-settings-explained), Orenda dosing, deactivate-not-delete and swim wait messages
- [PestPac: Mobile App](https://www.pestpac.com/features/pest-control-mobile-app), scanning Sentricon bait stations and state WDI/WDO forms
