+++
title = "Hazardous Materials in Transport"
nav_title = "Hazmat in Transport"
description = "49 CFR 171-180 for carriers: the 172.101 table, shipping papers, placards, segregation, PHMSA registration, permits, H endorsements, training and incidents."
category = "Logistics & Supply Chain Industry"
order = 2827
part = "Carrier Regulation"
tags = ["logistics", "trucking", "hazmat", "phmsa", "placards", "shipping-papers", "compliance"]
+++

A truck carrying paint, aerosols, batteries, cleaning chemicals or fuel additives is carrying hazardous materials, and the Hazardous Materials Regulations (49 CFR parts 171 to 180) apply to every person who touches the shipment: the shipper who classifies and packages it, the carrier that accepts it, the dock worker who loads it, the driver who hauls it. PHMSA writes the rules; FMCSA enforces them on the highway and adds its own permit and insurance requirements; TSA screens every driver who holds the hazmat endorsement; states inspect at the roadside. For a carrier, the regulations turn into concrete duties on each load: refuse freight without a proper shipping paper, keep the paper within the driver's reach, put the right placards on the vehicle, keep incompatible materials apart, have a registered number and a trained, endorsed driver, carry enough insurance, and report an incident by phone within 12 hours and in writing within 30 days.

The software is hard because the duty depends on arithmetic across a whole load. One drum of a Class 8 corrosive needs no placard; the same drum plus enough Class 3 flammable cartons to cross 454 kilograms aggregate needs placards, which makes the vehicle a CMV and its driver a CDL holder with an H endorsement, and puts the carrier into PHMSA registration. A broker's load planner, a carrier's dispatcher and an LTL terminal's dock all have to compute that from line data the shipper supplied, and the shipper's description is the one source of truth the regulations allow. This chapter covers the carrier side of parts 171 to 180: who is a hazmat employer, the hazardous materials table, shipping papers and emergency response information, placarding and marking, segregation and loading, PHMSA registration, FMCSA safety permits, the hazmat endorsement and TSA's threat assessment, training, incident reporting and insurance, then the tables. Commerce owns the seller's side, classification for parcel shippers, limited quantities and lithium batteries ([Hazmat Shipping](/books/commerce/pesticides-chemicals-and-hazmat#hazmat-shipping)); Field Operations owns materials of trade carried in service vans ([Carrying Regulated Products](/books/field-operations/fleet-and-safety#carrying-regulated-products)).

## How the Regulators Do It

As of November 2026, from the regulations and Federal Register:

| Agency | What it owns for carriers | Records it holds or requires | Fees and timing |
| --- | --- | --- | --- |
| **PHMSA** | The Hazardous Materials Regulations; annual registration of offerors and carriers above set quantities (part 107 subpart G); incident reports (171.15, 171.16) | Registration statement and certificate, kept three years; Form 5800.1 incident reports | $250 a year for a small business or not-for-profit, $2,575 for others, plus a $25 processing fee (107.612); payment electronic only under an August 2026 rule; a proposed fee increase was withdrawn November 20, 2025 |
| **FMCSA** | Highway enforcement of the HMR; hazmat safety permits for the highest-risk materials (385.403); insurance minimums (387.9); the Hazardous Materials Compliance BASIC | Permit, financial responsibility filings, inspection results | Permit required before hauling; $1,000,000 or $5,000,000 minimum liability depending on the material |
| **TSA** | The security threat assessment for every hazmat endorsement (49 CFR 1572) | Determination sent to the state, which updates CDLIS within 15 days | Renewed with the endorsement, at least every five years |
| **States and CVSA** | Roadside inspections, including hazmat and cargo tank inspections at Levels I, II or V and radioactive shipments at Level VI; issuing and renewing the H endorsement | Inspection reports; license records | Each inspection |
| **National Response Center** | The telephone report of a serious incident | NRC report number, which the written report cites | "As soon as practical but no later than 12 hours" |

Three patterns:

- **The shipper's description drives everything.** Placards, segregation, the driver's endorsement, registration, the permit and the insurance tier all follow from the identification number, proper shipping name, class and packing group on the shipping paper. A carrier's system stores that description as received and derives its duties from it; it never reclassifies.
- **Thresholds are aggregates over the vehicle.** Placarding at 454 kilograms of Table 2 materials, the DANGEROUS placard's 1,000-kilogram limit per category, registration at 2,268 kilograms of one class in non-bulk packages, and the single-material identification number marking at 4,000 kilograms are all sums over what's loaded on one vehicle, which changes at every LTL stop.
- **People need credentials, not just training.** The carrier's employees need hazmat training every three years, the driver of a placarded load needs a CDL with an H endorsement and a current TSA determination, and the carrier needs a registration number in every truck. Each expires on its own schedule.

## Who the Rules Bind

A **hazmat employer** is "a person who employs or uses at least one hazmat employee on a full-time, part time, or temporary basis," and a **hazmat employee** includes anyone who "operates a vehicle used to transport hazardous materials" and an owner-operator self-employed in transporting them (49 CFR 171.8). A carrier with even one driver who hauls a placarded load is a hazmat employer; so is a broker whose staff prepare shipping papers, and an LTL terminal whose dock workers load hazmat. A **carrier** is "a person who transports passengers or property in commerce," and a carrier that only performs functions required as a condition of accepting a shipment isn't thereby an **offeror** (171.8), which is the line between a carrier checking a shipper's paperwork and a carrier that prepares it and takes on the shipper's duties.

**Bulk packaging** is a packaging, including a transport vehicle or freight container, with a capacity over 450 liters (119 gallons) for a liquid, over 400 kilograms and 450 liters for a solid, or a water capacity over 454 kilograms (1,000 pounds) for a gas (171.8); everything smaller is non-bulk. Cargo tanks, portable tanks and hopper trailers are bulk, and many rules below (placarding, marking, insurance) switch on that distinction.

## The Hazardous Materials Table

The 172.101 table is the regulation's lookup: each row is a **proper shipping name**, and its columns give the symbols (column 1), the name (2), the hazard class or division (3), the UN or NA identification number (4), the packing group (5), the label codes (6), special provisions (7), the packaging sections for exceptions, non-bulk and bulk (8A to 8C), quantity limits for passenger and cargo aircraft (9A, 9B) and vessel stowage (10A, 10B). Column 1's symbols change the row's meaning: **+** fixes the name, class and packing group whatever the material's actual properties, **A** and **W** make the entry regulated only by air or by vessel, **D** and **I** mark domestic and international names, and **G** requires a technical name in parentheses after the basic description.

A carrier doesn't classify, but it reads the table: to check that the description on a shipping paper is a valid row, to find the labels the packages should bear, to decide which placard the class requires, and to see whether an air-only (**A**) entry is regulated on its truck at all. My default is to load the table as reference data, versioned by its effective date, and validate every inbound description against it, rejecting a shipment whose identification number and proper shipping name don't belong to the same row.

## Shipping Papers and Emergency Response Information

The shipper prepares the shipping paper, usually as part of the bill of lading; the carrier may not accept or transport hazardous material without one, and a later carrier may not move it unless the paper travels with it (177.817). Its core is the **basic description**: the identification number, proper shipping name, hazard class or division (subsidiary hazards in parentheses) and packing group in Roman numerals, "shown in sequence with no additional information interspersed," followed by the total quantity with its unit, for example "UN1263, Paint, 3, PG II, 2 drums, 400 L" (172.202). Hazmat entries on a mixed paper are listed first, in a contrasting color, or marked with an "X" in an HM column "placed before the basic shipping description" (172.201(a)(1)).

Every paper carries an **emergency response telephone number** (172.201(d)), and the number has rules of its own (172.604): it is "monitored at all times the hazardous material is in transportation," reaches someone with comprehensive emergency response information or connects to one immediately (an answering service that calls back does not qualify), and, where a third-party provider answers it, the registered offeror's name, contract number or other identifier appears next to it. Limited and excepted quantities and some listed materials (dry ice, consumer commodity, battery-powered equipment) are exempt. **Emergency response information** (172.602) travels with the paper: the description and technical name, immediate health hazards, fire and explosion risks, immediate precautions, firefighting methods, spill handling without fire, and first aid. The information can be a separate guidance document if it has all seven elements and cross-references the paper's description (172.602(b)); PHMSA's Emergency Response Guidebook is the reference most first responders carry, but the regulation's test is the seven contents, not a particular book. It must be "immediately accessible" to the driver, kept like the paper itself (172.602(c)).

In the cab, the paper is tabbed or placed on top of other papers, within the driver's reach with the seat belt on and visible to someone entering, or in a holder on the driver's door; when the driver leaves the cab it goes in the door holder or on the seat. The carrier keeps a copy, or an electronic image, for one year after it accepted the shipment (three years for hazardous waste), with the acceptance date on it (177.817); the offeror keeps its copy two years from acceptance by the first carrier (172.201(e)). The electronic image allowance covers the carrier's retained copy; the in-cab rules in 177.817 describe a paper the driver can reach and a first responder can find at the driver's door.

## Placarding and Marking

Placards tell a first responder what is on a vehicle before anyone opens it. The rule (172.504) has two tables:

- **Table 1 materials require placards in any quantity:** Divisions 1.1, 1.2 and 1.3 explosives, Division 2.3 poison gas, Division 4.3 dangerous when wet, certain Division 5.2 organic peroxides, Division 6.1 inhalation hazards, and Class 7 radioactive material bearing a Yellow III label.
- **Table 2 materials require placards above a threshold:** Divisions 1.4, 1.5 and 1.6, flammable and non-flammable gases (2.1, 2.2), Class 3 flammable and combustible liquids, Divisions 4.1, 4.2, 5.1, the other 5.2 and 6.1 materials, Class 8 corrosives and Class 9. On the highway or rail, a vehicle carrying "less than 454 kg (1001 pounds) aggregate gross weight" of Table 2 materials needs no placard; the exception doesn't apply to bulk packagings (172.504(c)).
- **The DANGEROUS placard.** A vehicle with non-bulk packages of two or more Table 2 categories may display one DANGEROUS placard instead of each category's, unless "1,000 kg (2,205 pounds) aggregate gross weight or more of one category" was loaded at one facility, in which case that category's placard is required (172.504(b)).

Placards also decide who may drive: a vehicle that requires placards is a CMV under 390.5 at any weight, and its driver needs a CDL (Group C covers vehicles that carry placarded hazmat, 383.91) with an H endorsement. That's the cascade a load planner has to compute before it assigns a driver.

**Marking** names the material on the packaging. A non-bulk package shows the proper shipping name and identification number (172.301(a)(1)), a technical name where the table requires one, and usually the consignor's or consignee's name and address (172.301(d)). A transport vehicle carrying 4,000 kilograms (8,820 pounds) or more aggregate gross weight of one non-bulk material, loaded at one facility with nothing else, displays that material's identification number on each side and end (172.301(a)(3)). Bulk packagings of 1,000 gallons or more show the identification number on each side and each end, at least 50 millimeters high on cargo tanks (172.302). The carrier's driver checks the placards and markings at pickup; the system's job is to compute what they should be and print it on the driver's load sheet.

## Segregation, Loading and Attendance

Packages that must be labeled or placarded are loaded against the segregation table in 177.848: an **X** means the two materials "may not be loaded, transported, or stored together in the same transport vehicle or storage facility," an **O** means they may share a vehicle only if separated so that leaking packages couldn't mix, a blank means no restriction, and explosives follow their own compatibility table. Specific rules sit beside the table, such as cyanides, which "may not be stored, loaded and transported with acids if a mixture of the materials would generate hydrogen cyanide" (177.848(c)). For an LTL terminal or a multi-stop load this is a planning constraint: a pallet of Class 8 acids and a pallet of cyanides can't be consolidated on the same trailer, and the load planner needs to know before the dock does. Load Planning & Optimization covers the constraint solvers; the rules belong in a table as data ([Rules as Data](/docs/building-blocks/rules-as-data#what-belongs-in-data)).

Drivers are trained on loading and unloading, segregation, securement, attendance, parking, routing and incident reporting (177.816), which a current CDL with a tank or hazmat endorsement can satisfy for the parts the endorsement covers. Attendance is strict for explosives: a vehicle carrying Division 1.1, 1.2 or 1.3 is attended at all times, with exceptions for a safe haven or a shipper's, carrier's or consignee's property; any other hazmat vehicle on a public street, highway or shoulder is attended by its driver, and "attended" means on the vehicle, awake and not in the sleeper berth, or within 100 feet with an unobstructed view (49 CFR 397.5). Hours of service and parking intersect here, which is why a hazmat load's planned rest stops matter ([Hours of Service](/books/logistics/hours-of-service)).

## Registration and Permits

**PHMSA registration.** A person who offers or transports, in a motor vehicle, rail car or freight container, a highway route-controlled quantity of Class 7 material, more than 25 kilograms of Division 1.1, 1.2 or 1.3 explosives, more than one liter per package of a material extremely toxic by inhalation, a bulk packaging of 13,248 liters (3,500 gallons) or more for liquids or gases or more than 13.24 cubic meters for solids, a non-bulk shipment of 2,268 kilograms (5,000 pounds) or more of one class that requires placards, or "a quantity of hazardous material that requires placarding" registers with PHMSA every year (107.601). The last trigger means any carrier that hauls a placarded load registers. The fee is $250 a year for a small business or not-for-profit and $2,575 for others, plus a $25 processing fee per statement, for registration years 2014-2015 and later (107.612); PHMSA proposed raising the fees in May 2024 and withdrew that proposal on November 20, 2025, and an August 4, 2026 rule ended paper check payment in favor of DOT's e-Commerce site. A registrant keeps its statement and certificate three years, and a motor carrier keeps a copy of the certificate, or a document showing the number labeled "U.S. DOT Hazmat Reg. No.," in every truck and tractor (107.620).

**FMCSA hazmat safety permits.** For the highest-risk materials, a motor carrier also needs an FMCSA permit before hauling, interstate or intrastate (385.403): a highway route-controlled quantity of Class 7, more than 25 kilograms of Division 1.1, 1.2 or 1.3 or a placarded quantity of Division 1.5, more than one liter per package of a Zone A inhalation hazard, a Zone B inhalation hazard in bulk, a Zone C or D inhalation hazard in a packaging of 3,500 gallons or more, or methane-rich compressed or refrigerated liquefied gas in bulk of 3,500 gallons or more. Carriers of highway route-controlled radioactive material inspect their vehicles before each trip to CVSA's Level VI procedures, which FMCSA incorporates by reference by edition (the April 1, 2024 handbook, with the 2025 edition proposed in November 2025).

**Insurance.** A carrier of hazardous materials needs more public liability coverage than a general freight carrier's $750,000: $1,000,000 for oil, hazardous waste and hazmat not listed elsewhere, and $5,000,000 for hazardous substances in bulk cargo tanks, portable tanks or hoppers, certain bulk explosives, gases and poisons, and highway route-controlled radioactive material (387.9). [Bonds & Insurance Minimums](/books/logistics/financial-security-and-insurance) owns the schedule and the filings, and Insurance owns the policies.

## The Endorsement and the Threat Assessment

A driver of a placarded load holds a CDL with the **H** endorsement (or **X**, combined tank and hazmat), and first-time H applicants complete entry-level training before the knowledge test ([Entry-Level Driver Training](/books/logistics/drivers-and-qualification#entry-level-driver-training)). A state may not issue, renew, upgrade or transfer an H endorsement unless TSA has determined the driver poses no security threat (or the driver holds a valid TWIC), and it renews the endorsement "every 5 years or less" (49 CFR 383.141). TSA's assessment looks at disqualifying criminal offenses, immigration status, a broader analysis of whether the applicant poses a security threat, and mental incapacity (1572.5). States notify holders at least 60 days before the endorsement expires, may extend it up to 90 days when TSA hasn't decided in time, and within 15 days of a determination update the record, notify CDLIS, and revoke or deny the endorsement after a final determination of threat (1572.13). For the carrier, `driver_licenses.hazmat_expires_on` from [Drivers: CDLs, Qualification & the Clearinghouse](/books/logistics/drivers-and-qualification#the-license) is the date that matters: a driver whose H endorsement lapses can still drive general freight but not a placarded load.

## Training

Every hazmat employee gets general awareness, function-specific, safety and security awareness training, and in-depth security training where the employer has a security plan (172.704(a)). New employees and those changing jobs train "within 90 days after employment or a change in job function," working only under a trained employee's direct supervision until then, and everyone repeats it "at least once every three years." The employer keeps a record for each employee covering the preceding three years, for as long as the employee does hazmat work and "90 days thereafter," with the employee's name, the latest completion date, the materials or where they are, the trainer's name and address, and certification of training and testing (172.704(d)). OSHA, EPA and other training counts to the extent it covers the same components (172.704(b)). In data terms that's a training record per employee per category with a completion date and a three-year expiry, gating who can be assigned a hazmat load or a hazmat dock task, the same shape as the qualification items in Drivers.

## Incidents

Two reports, on two clocks:

- **By telephone to the National Response Center** (800-424-8802), "as soon as practical but no later than 12 hours" after an incident in which, among other triggers, someone is killed or hospitalized, the public is evacuated for an hour or more, a major transportation artery or facility is closed for an hour or more, radioactive or infectious substance packaging is involved in a fire, breakage or spillage, a marine pollutant is released above 450 liters or 400 kilograms, or the reporter judges the situation warrants it (171.15).
- **In writing to PHMSA on DOT Form F 5800.1** "within 30 days of discovery of the incident," by the person in physical possession of the material at the time, for every incident 171.15 covers, any unintentional release, structural damage to a specification cargo tank of 1,000 gallons or more, undeclared hazardous material discovered in transport, and fires, ruptures or dangerous heat from batteries (171.16). The carrier keeps a copy two years and updates the report within a year if someone dies, the material was misidentified, or the damage estimate changes by $25,000 or 10 percent, whichever is greater. Minor vent releases and small releases of some limited quantity and Packing Group III materials are excepted, unless a phone report was required.

Because the carrier usually has possession when something leaks on a truck or at a terminal, these are the carrier's reports, and a broker's system should route an incident on a brokered load to the carrier that holds the freight. An undeclared hazmat discovery (a shipment that turns out to be hazardous with no shipping paper) is itself reportable.

## How to Build It

The extensions below hold the shipper's hazmat description per item and line, the shipping paper's carrier-side facts, the registrations and permits, training, and incidents. First, the core table extensions:

```sql
ALTER TABLE shipment_lines
  ADD COLUMN hazmat_description_id UUID,        -- the 172.202 description as tendered
  ADD COLUMN package_count         INT,
  ADD COLUMN package_type          TEXT,        -- 'drum', 'box', 'cylinder', 'ibc', 'cargo_tank'
  ADD COLUMN bulk                  BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN hazmat_quantity       NUMERIC(14, 3),  -- the total quantity on the paper
  ADD COLUMN hazmat_quantity_uom   TEXT;
ALTER TABLE shipment_lines ADD CONSTRAINT shipment_lines_package_count_check
  CHECK (package_count > 0) NOT VALID;
ALTER TABLE shipment_lines ADD CONSTRAINT shipment_lines_hazmat_quantity_uom_check
  CHECK (hazmat_quantity_uom IN ('kg', 'L', 'GBq')) NOT VALID;
ALTER TABLE shipment_lines ADD CONSTRAINT shipment_lines_hazmat_described_check
  CHECK (NOT hazmat OR hazmat_description_id IS NOT NULL) NOT VALID;

ALTER TABLE items
  ADD COLUMN hazmat_description_id UUID;        -- the owner's default; lines carry their own
```

`shipment_lines.hazmat` already exists in the core model; the check makes every hazmat line carry a description, and it is validated after a backfill from the shipper's data. Then the reference and operating tables:

```sql
CREATE TABLE hazmat_descriptions (        -- one 172.101 row as a shipper uses it
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  identification_number  TEXT NOT NULL CHECK (identification_number ~ '^(UN|NA|ID)[0-9]{4}$'),
  proper_shipping_name   TEXT NOT NULL,
  technical_name         TEXT,            -- required where column 1 shows G
  hazard_class           TEXT NOT NULL,   -- '3', '8', '2.1', '6.1', '1.4'
  subsidiary_classes     TEXT[] NOT NULL DEFAULT '{}',
  packing_group          TEXT CHECK (packing_group IN ('I', 'II', 'III')),
  placard_table          SMALLINT NOT NULL CHECK (placard_table IN (0, 1, 2)),  -- 0: none
  placard                TEXT,            -- 'FLAMMABLE', 'CORROSIVE', 'POISON GAS'
  inhalation_hazard_zone CHAR(1) CHECK (inhalation_hazard_zone IN ('A', 'B', 'C', 'D')),
  reportable_quantity    BOOLEAN NOT NULL DEFAULT FALSE,
  marine_pollutant       BOOLEAN NOT NULL DEFAULT FALSE,
  hmt_effective_on       DATE NOT NULL,   -- the edition of the table this row was checked against
  UNIQUE (identification_number, proper_shipping_name, hazard_class, packing_group,
          technical_name)
);

CREATE TABLE hazmat_shipment_papers (     -- the carrier's view of a shipment's shipping paper
  shipment_id              UUID PRIMARY KEY REFERENCES shipments (id),
  document_id              UUID NOT NULL REFERENCES documents (id),  -- the paper or BOL as received
  emergency_phone          TEXT NOT NULL,  -- numeric, with area code
  eri_registrant           TEXT,           -- name or contract number beside a third-party number
  eri_document_id          UUID REFERENCES documents (id),  -- the 172.602 information
  shipper_certified        BOOLEAN NOT NULL,
  accepted_at              TIMESTAMPTZ NOT NULL,  -- starts the carrier's one-year retention
  hazardous_waste          BOOLEAN NOT NULL DEFAULT FALSE,
  undeclared_found_at      TIMESTAMPTZ,    -- hazmat found without a paper: a 171.16 report
  CHECK (emergency_phone ~ '^\+?[0-9 ()-]{10,}$')
);

CREATE TABLE phmsa_registrations (        -- part 107 subpart G, per registration year
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id            UUID NOT NULL REFERENCES parties (id),
  registration_number TEXT NOT NULL,
  registration_year   TEXT NOT NULL CHECK (registration_year ~ '^[0-9]{4}-[0-9]{4}$'),
  valid_during        DATERANGE NOT NULL,
  size_class          TEXT NOT NULL CHECK (size_class IN ('small_business', 'not_for_profit',
                        'other')),
  fee                 BIGINT NOT NULL,     -- minor units: 25000 or 257500, plus processing
  processing_fee      BIGINT NOT NULL DEFAULT 2500,
  currency            CHAR(3) NOT NULL DEFAULT 'USD',
  certificate_document_id UUID REFERENCES documents (id),  -- kept 3 years, copied to each truck
  UNIQUE (party_id, registration_year)
);

CREATE TABLE hazmat_safety_permits (      -- FMCSA permits under 385.403
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  carrier_party_id  UUID NOT NULL REFERENCES parties (id),
  permit_number     TEXT NOT NULL,
  covers            TEXT[] NOT NULL CHECK (covers <@ ARRAY['hrcq_class_7', 'explosives_1_1_1_3',
                      'division_1_5', 'pih_zone_a', 'pih_zone_b_bulk', 'pih_zone_c_d_bulk',
                      'methane_bulk']::TEXT[]),
  valid_during      DATERANGE NOT NULL,
  document_id       UUID REFERENCES documents (id)
);

CREATE TABLE hazmat_training_records (    -- 172.704, per employee and function
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_party_id  UUID NOT NULL REFERENCES parties (id),
  person_party_id    UUID NOT NULL REFERENCES parties (id),
  category           TEXT NOT NULL CHECK (category IN ('general_awareness', 'function_specific',
                       'safety', 'security_awareness', 'in_depth_security', 'driver_177_816')),
  function           TEXT,                -- 'driver', 'dock_loading', 'shipping_papers'
  completed_on       DATE NOT NULL,
  expires_on         DATE NOT NULL,       -- three years, or sooner for a revised security plan
  trainer            TEXT NOT NULL,       -- name and address, as 172.704(d) requires
  materials_ref      TEXT NOT NULL,
  tested             BOOLEAN NOT NULL,
  retain_until       DATE,                -- 90 days after the person stops hazmat work
  CHECK (expires_on <= completed_on + INTERVAL '3 years')
);

CREATE TABLE hazmat_incident_reports (    -- 171.15 phone notice and 171.16 written report
  id                      UUID PRIMARY KEY DEFAULT uuidv7(),
  carrier_party_id        UUID NOT NULL REFERENCES parties (id),
  shipment_id             UUID REFERENCES shipments (id),
  load_id                 UUID REFERENCES loads (id),
  facility_id             UUID REFERENCES facilities (id),  -- a terminal, during storage
  occurred_at             TIMESTAMPTZ NOT NULL,
  discovered_at           TIMESTAMPTZ NOT NULL,
  phone_report_required   BOOLEAN NOT NULL,
  phone_report_due_at     TIMESTAMPTZ,     -- occurred_at plus 12 hours
  nrc_report_number       TEXT,
  phone_reported_at       TIMESTAMPTZ,
  written_report_due_on   DATE NOT NULL,   -- discovered_at plus 30 days
  written_reported_at     TIMESTAMPTZ,
  supplement_due_by       DATE,            -- one year after the incident
  kind                    TEXT NOT NULL CHECK (kind IN ('release', 'fire', 'explosion',
                            'cargo_tank_damage', 'undeclared_hazmat', 'battery_event',
                            'other')),
  fatalities              SMALLINT NOT NULL DEFAULT 0,
  hospitalized            SMALLINT NOT NULL DEFAULT 0,
  damage_estimate         BIGINT,          -- minor units; a change of $25,000 or 10% re-reports
  currency                CHAR(3) NOT NULL DEFAULT 'USD',
  form_document_id        UUID REFERENCES documents (id),  -- the 5800.1 as filed
  retain_until            DATE NOT NULL,   -- two years
  CHECK (NOT phone_report_required OR phone_report_due_at IS NOT NULL)
);

CREATE TABLE hazmat_segregation_rules (   -- the 177.848(d) table, as data
  class_a     TEXT NOT NULL,
  class_b     TEXT NOT NULL,
  rule        CHAR(1) NOT NULL CHECK (rule IN ('X', 'O')),
  effective_during DATERANGE NOT NULL,
  PRIMARY KEY (class_a, class_b, effective_during)
);

ALTER TABLE shipment_lines ADD CONSTRAINT shipment_lines_hazmat_description_fkey
  FOREIGN KEY (hazmat_description_id) REFERENCES hazmat_descriptions (id) NOT VALID;
ALTER TABLE items ADD CONSTRAINT items_hazmat_description_fkey
  FOREIGN KEY (hazmat_description_id) REFERENCES hazmat_descriptions (id) NOT VALID;
```

What a load needs on the vehicle, computed from the lines on it after a given stop. This sketch treats every Table 2 category alike for the threshold and ignores the subsidiary placard and DANGEROUS refinements, which belong in the rules table:

```sql
WITH on_board AS (                         -- hazmat lines picked and not yet dropped
  SELECT h.placard_table, h.placard, sl.bulk, sl.weight_g
  FROM load_shipments ls
  JOIN shipment_lines sl ON sl.shipment_id = ls.shipment_id AND sl.hazmat
  JOIN hazmat_descriptions h ON h.id = sl.hazmat_description_id
  WHERE ls.load_id = $1
    AND NOT EXISTS (
      SELECT 1 FROM stop_shipments ss JOIN stops st ON st.id = ss.stop_id
      WHERE ss.shipment_id = ls.shipment_id AND ss.action = 'drop'
        AND st.load_id = $1 AND st.sequence <= $2)
)
SELECT placard,
       SUM(weight_g) AS gross_g,
       BOOL_OR(placard_table = 1) AS table_1,
       BOOL_OR(bulk) AS bulk
FROM on_board
WHERE placard_table > 0
GROUP BY placard
HAVING BOOL_OR(placard_table = 1) OR BOOL_OR(bulk)
    OR (SELECT SUM(weight_g) FROM on_board WHERE placard_table = 2) >= 454000;
```

Any row returned means the vehicle is placarded, so dispatch checks for a CDL with an H endorsement, a current TSA-backed `hazmat_expires_on`, current hazmat training for the driver and a PHMSA registration in force. And the segregation check for the same load:

```sql
SELECT a.hazard_class, b.hazard_class, r.rule
FROM shipment_lines la
JOIN hazmat_descriptions a ON a.id = la.hazmat_description_id
JOIN load_shipments lsa ON lsa.shipment_id = la.shipment_id AND lsa.load_id = $1
JOIN shipment_lines lb ON lb.hazmat
JOIN hazmat_descriptions b ON b.id = lb.hazmat_description_id
JOIN load_shipments lsb ON lsb.shipment_id = lb.shipment_id AND lsb.load_id = $1
JOIN hazmat_segregation_rules r
  ON r.class_a = a.hazard_class AND r.class_b = b.hazard_class
 AND r.effective_during @> CURRENT_DATE
WHERE la.id < lb.id;
```

An `X` row blocks the load as planned; an `O` row needs a separation note the dock confirms.

Design notes:

- **Store the description as the shipper tendered it,** linked to the table row it validated against and that row's edition; a correction from the shipper is a new description, never an edit.
- **Compute placards, endorsement and registration needs per stop,** because the on-board aggregate changes at every LTL pickup and drop, and the driver's credentials are checked against the heaviest segment.
- **The shipping paper is a document with a retention clock:** `documents.retain_until` (from [Drivers: CDLs, Qualification & the Clearinghouse](/books/logistics/drivers-and-qualification#how-to-build-it)) set to one year from acceptance, three for hazardous waste.
- **Incidents start two clocks at once,** 12 hours for the phone report and 30 days for the written one, and alert the people responsible from the time the carrier learned of the event ([Timers, Deadlines and Escalations](/docs/building-blocks/workflows#timers-deadlines-and-escalations)).
- **Rules are data with effective dates:** the placard tables, the segregation table, the registration thresholds and the fees each change by rulemaking, and a past load is judged by the rules in force on its date ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).
- **Emit what dispatch and safety need.** `load.placard_required`, `load.segregation_conflict`, `hazmat_incident.phone_report_due` and `phmsa_registration.expiring` are what dispatch, the dock and the compliance team subscribe to ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## Auditing

A PHMSA or FMCSA inspector, and a court after an incident, asks for these records:

- **The shipping paper as received** and the emergency response information with it, kept a year after acceptance (three for hazardous waste), with the acceptance date.
- **The placard and segregation computation** for each load, what the system said the vehicle needed at each stop, and the driver who was assigned against it.
- **Registration and permits in force on the load's date,** and the copy of the certificate in the truck.
- **Training records for every hazmat employee,** three years back, with the trainer, materials and testing.
- **Incident reports,** the NRC report number and time, the 5800.1 as filed, its updates, and the two-year copy.

The record mechanics are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Validate every hazmat description against the 172.101 table** and store it as tendered, with the table's edition.
- **Compute placards, segregation and driver credentials from what's on board at each stop,** and block a dispatch that breaks any of them.
- **Keep the shipping paper reachable for the driver and retained for a year,** with the emergency response number and information checked at acceptance.
- **Track PHMSA registration, FMCSA permits, H endorsements and training as expiring credentials** with their own dates.
- **Run incident reports on the 12-hour and 30-day clocks,** with updates within a year.
- **Route insurance minimums through the financial responsibility chapter,** and the seller's hazmat duties to Commerce.

## References

**Regulations**

- [49 CFR 107.601: Applicability of registration](https://www.law.cornell.edu/cfr/text/49/107.601), the quantity triggers including any placarded quantity
- [49 CFR 107.612: Amount of fee](https://www.law.cornell.edu/cfr/text/49/107.612), $250 and $2,575 for 2014-2015 and later and the $25 processing fee
- [49 CFR 107.620: Recordkeeping requirements](https://www.law.cornell.edu/cfr/text/49/107.620), three years and the registration number in every truck
- [49 CFR 171.8: Definitions and abbreviations](https://www.law.cornell.edu/cfr/text/49/171.8), hazmat employer and employee, carrier, offeror and bulk packaging
- [49 CFR 171.15: Immediate notice of certain hazardous materials incidents](https://www.law.cornell.edu/cfr/text/49/171.15), the 12-hour telephone report, triggers and NRC numbers
- [49 CFR 171.16: Detailed hazardous materials incident reports](https://www.law.cornell.edu/cfr/text/49/171.16), Form 5800.1 within 30 days, triggers, exceptions, updates and retention
- [49 CFR 172.101: Purpose and use of the hazardous materials table](https://www.law.cornell.edu/cfr/text/49/172.101), the table's columns and column 1 symbols
- [49 CFR 172.201: Preparation and retention of shipping papers](https://www.law.cornell.edu/cfr/text/49/172.201), distinguishing entries, the emergency number and two-year offeror retention
- [49 CFR 172.202: Description of hazardous material on shipping papers](https://www.law.cornell.edu/cfr/text/49/172.202), the basic description sequence and total quantity
- [49 CFR 172.301: General marking requirements for non-bulk packagings](https://www.law.cornell.edu/cfr/text/49/172.301), name and number, technical names, consignor or consignee and the 4,000-kilogram rule
- [49 CFR 172.302: General marking requirements for bulk packagings](https://www.law.cornell.edu/cfr/text/49/172.302), identification numbers on each side and end and minimum sizes
- [49 CFR 172.504: General placarding requirements](https://www.law.cornell.edu/cfr/text/49/172.504), Tables 1 and 2, the 454-kilogram exception and the DANGEROUS placard
- [49 CFR 172.602: Emergency response information](https://www.law.cornell.edu/cfr/text/49/172.602), required contents and accessibility
- [49 CFR 172.604: Emergency response telephone number](https://www.law.cornell.edu/cfr/text/49/172.604), monitoring, knowledge, third-party providers and exceptions
- [49 CFR 172.704: Training requirements](https://www.law.cornell.edu/cfr/text/49/172.704), categories, 90 days, three years, records and other training
- [49 CFR 177.816: Driver training](https://www.law.cornell.edu/cfr/text/49/177.816), driver topics and the CDL endorsement substitute
- [49 CFR 177.817: Shipping papers](https://www.law.cornell.edu/cfr/text/49/177.817), carrier acceptance, subsequent carriers, in-cab location, one-year retention and electronic images
- [49 CFR 177.848: Segregation of hazardous materials](https://www.law.cornell.edu/cfr/text/49/177.848), applicability, the X and O codes and cyanides with acids
- [49 CFR 383.91: Commercial motor vehicle groups](https://www.law.cornell.edu/cfr/text/49/383.91), Group C for placarded hazmat
- [49 CFR 383.141: General hazardous materials endorsement requirements](https://www.law.cornell.edu/cfr/text/49/383.141), the TSA determination and five-year renewal
- [49 CFR 385.403: Who must hold a safety permit](https://www.law.cornell.edu/cfr/text/49/385.403), the materials that need an FMCSA permit
- [49 CFR 387.9: Financial responsibility, minimum levels](https://www.law.cornell.edu/cfr/text/49/387.9), $1,000,000 and $5,000,000 for hazardous materials
- [49 CFR 397.5: Attendance and surveillance of motor vehicles](https://www.law.cornell.edu/cfr/text/49/397.5), explosives, other hazmat and the 100-foot rule
- [49 CFR 1572.5: Standards for security threat assessments](https://www.law.cornell.edu/cfr/text/49/1572.5), criminal history, immigration, threat analysis and mental capacity
- [49 CFR 1572.13: State responsibilities for issuance of hazardous materials endorsement](https://www.law.cornell.edu/cfr/text/49/1572.13), notices, 90-day extensions and 15-day updates

**Federal Register**

- [PHMSA: Federal Register documents on registration fees](https://www.federalregister.gov/api/v1/documents.json?conditions[term]=%22registration+fees%22+hazardous+materials&conditions[agencies][]=pipeline-and-hazardous-materials-safety-administration&order=newest&per_page=8), the May 2024 fee proposal, its November 20, 2025 withdrawal and the August 4, 2026 electronic payment rule
- [Incorporation by Reference; North American Standard Out-of-Service Criteria; Hazardous Materials Safety Permits (November 19, 2025)](https://www.govinfo.gov/content/pkg/FR-2025-11-19/html/2025-20282.htm), Level VI pre-trip inspections for highway route-controlled radioactive material and the handbook editions
