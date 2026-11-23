+++
title = "Drawback, FTZs & Trade Agreements"
nav_title = "Drawback, FTZs & FTAs"
description = "Getting duty back or never paying it: drawback and the 99% refund, foreign trade zone statuses and weekly entry, USMCA certification and the 2026 joint review."
category = "Logistics & Supply Chain Industry"
order = 2852
part = "Customs and Trade"
tags = ["logistics", "customs", "drawback", "foreign-trade-zones", "usmca", "trade-agreements"]
+++

Duty paid is not always duty kept. An importer that re-exports what it brought in, or exports products made from imported parts, can claim most of the duty back as drawback, up to five years later. A manufacturer that runs its plant as a foreign trade zone pays no duty on parts until finished goods leave the zone for US commerce, and none on what it exports. And goods that qualify under a trade agreement enter at a preferential rate, often free, if the importer holds the right certification when it makes the claim. Each of the three turns the duty an entry would otherwise owe into a record-keeping obligation, and each depends on proving facts years later from data the importer has to have kept on the day.

All three got more valuable and more complicated with the 2025 and 2026 tariff programs. Additional duties of 10% to 50% made drawback claims worth filing that weren't before, and several programs declared their duties eligible for drawback; at the same time, the same programs require goods admitted to a zone to take privileged foreign status, which fixes the duty at admission and removes the zone's classic inverted-tariff saving, and some programs can't be reduced by a trade agreement at all. This chapter covers drawback (its types, the 99% refund, substitution and its limits, timing, accelerated payment), foreign trade zones (the statuses, admission, weekly entry and how the 2026 programs changed them), and trade agreements (USMCA certification of origin, the 2026 joint review, and the agreements' interaction with the tariff programs). It extends `facilities`, `shipment_lines` and `lots` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model), and the entries and duties of [Import Entry & ACE](/books/logistics/import-entry) and [Tariff Programs](/books/logistics/tariff-programs).

## How the Regulators Do It

As of November 2026:

| Program | Authority | Administered by | What it does | 2026 status |
| --- | --- | --- | --- | --- |
| **Drawback** | 19 U.S.C. 1313; 19 CFR part 190 | CBP, in ACE (entry type 47) | Refunds 99% of duties, taxes and fees on imports exported or destroyed, or used to make exports | Section 301 and Section 338 duties eligible; IEEPA refunds through CAPE take priority on designated entries |
| **Foreign trade zones** | 19 U.S.C. 81c; 19 CFR part 146 | CBP supervises zones the Foreign-Trade Zones Board has authorized | Defers duty until goods enter US commerce, charges duty only on the foreign merchandise used, none on exports | Section 301 and Section 338 goods require privileged foreign status on admission |
| **USMCA** | The agreement; 19 CFR part 182; HTSUS General Note 11 | USTR (the agreement), CBP (claims) | Preferential rates for originating goods of Canada, Mexico and the US | First joint review on July 1, 2026 ended without a 16-year extension; annual reviews follow |
| **GSP** | 19 U.S.C. 2465 | USTR | Duty-free treatment for designated developing countries | Lapsed: "No duty-free treatment provided under this subchapter shall remain in effect after December 31, 2020" |

Three patterns:

- **Each program is a proof problem.** Drawback proves an import and an export connect; a zone proves what was admitted, in what status, and what left; a preference claim proves origin under the agreement's rule. The duty saving is only as good as the records behind it, kept five years or more.
- **The tariff programs decide the value.** A 3% general duty rarely justified a drawback program; a 25% or 50% additional duty does. The same programs restrict zones and agreements, so the saving moves from FTZs and FTAs toward drawback.
- **Timing is the risk.** Drawback has a five-year claim window and a liquidation prerequisite; zone status has to be chosen before goods are manipulated; a USMCA certification has to be in the importer's hands when the claim is made. Each deadline is earlier than the moment someone notices the money.

## Drawback

### The Types

Drawback refunds duty on imported merchandise when it, or something like it, leaves the country (19 U.S.C. 1313):

| Type | Section | What qualifies |
| --- | --- | --- |
| Manufacturing | 1313(a) | "Articles manufactured or produced in the United States with the use of imported merchandise," then exported or destroyed |
| Substitution manufacturing | 1313(b) | Exported articles made with domestic or other merchandise substituted for the imported merchandise, used "within a period not to exceed 5 years from the date of importation" |
| Rejected merchandise | 1313(c) | Imported goods that didn't conform to sample or specification, were shipped without consent or were defective, exported or destroyed "within 5 years after the date of importation" |
| Unused merchandise | 1313(j)(1) | Imported goods exported or destroyed unused, "before the close of the 5-year period beginning on the date of importation and before the drawback claim is filed" |
| Substitution unused | 1313(j)(2) | Other goods "classifiable under the same 8-digit HTS subheading number as such imported merchandise," exported unused within the same five years |

The refund is "equal to 99 percent of the duties, taxes, and fees paid on the imported merchandise" (1313(l)). A drawback entry must be filed "not later than 5 years after the date on which merchandise on which drawback is claimed was imported," and claims "not completed within the 5-year period shall be considered abandoned" (1313(r)(1)).

### Substitution and Its Limits

Substitution is where drawback became practical for distributors: the export doesn't have to be the imported unit, only commercially interchangeable at the tariff level the statute names. Two limits apply:

- **The "other" rule.** Substitution at the eight-digit level is barred where the eight-digit description "begins with the term 'other'," unless the goods match at the ten-digit statistical reporting number (1313(j)(5)). Many basket provisions begin with "other," so the classification of both the import and the export decides whether a claim exists at all ([The Tariff Schedule](/books/logistics/classification-valuation-origin#the-tariff-schedule)).
- **The lesser-of rule.** Where substitution occurs and the export is an article, the refund is based on the lesser of the duty paid on the imported merchandise or "the amount of duties, taxes, and fees that would apply to the exported article if the exported article were imported" (1313(l)(2)).

A worked substitution unused claim, with illustrative numbers: an importer brought in 1,000 cast fittings of China origin on an entry in March 2026, paying $3,000 of general duty, $15,000 of Section 301 duty and $34.64 of merchandise processing fee ($18,034.64 in all, $18.03464 a unit). In October 2026 it exports 400 fittings of the same eight-digit subheading, made in Mexico, from stock. Had those 400 been imported, they would have owed $1.20 a unit (illustrative). The lesser-of rule caps the claim at $1.20 times 400, $480, and the refund is 99% of that, $475.20. The same 400 exported fittings, if they were the Chinese units themselves (unused merchandise under (j)(1)), would return 99% of $7,213.86, or $7,141.72. The difference is a tracking question: which units left. A substitution claim is easier to support; a direct identification claim pays more when the imported goods carried the additional duties.

### Claims, Liquidation and Accelerated Payment

Claims are filed in ACE as drawback entries (type 47) that designate import entry lines against export records. The import entry must be liquidated or reliquidated before it can appear on a drawback claim, and CBP encourages importers to file IEEPA refund declarations in CAPE for drawback-eligible entries before claiming drawback, since drawback-designated entries are a later CAPE deployment ([Refunds Through CAPE](/books/logistics/tariff-programs#refunds-through-cape)). A claimant approved for accelerated payment can be paid before liquidation of the claim, if it furnishes "a properly executed bond in an amount sufficient to cover the estimated amount" of drawback (activity code 1a); CBP notifies the applicant in writing within 90 days, and approval applies to unliquidated claims filed before and after the notice (19 CFR 190.92). Drawback records are kept until the third anniversary of "the date of payment of the claim" (19 CFR 163.4), which, for a claim filed near the five-year limit and paid after review, can be eight years or more after the import.

Recent programs state eligibility in their guidance: "Section 301 duties are eligible for duty drawback" (CBP Section 301 FAQs), and the Section 338 duties on Canadian goods "are eligible for drawback" (CSMS 70314289). Whether a program's duties can be drawn back is a field on the tariff measure, not an assumption.

## Foreign Trade Zones

### How a Zone Defers and Reduces Duty

A foreign trade zone is an area treated, for customs duty, as outside the customs territory until goods leave it for US commerce. Foreign merchandise can be admitted, stored, manipulated and manufactured without duty; when goods are entered for consumption from a zone, the duty attaches to the foreign merchandise used (19 U.S.C. 81c(a)), which is the basis for the zone's classic saving on an inverted tariff, where the finished product's rate is lower than its parts' and the importer elects to pay on the finished product. Goods exported from the zone never pay. CBP may allow a zone operator to file one consumption entry for "the estimated removals of merchandise during the calendar week" rather than an entry per shipment (19 CFR 146.63(c)), which also cuts merchandise processing fees. The entry types are 26 for zone admission and 06 for zone consumption entries ([Entry Types](/books/logistics/import-entry#entry-types)), and a zone operator posts a continuous bond under activity code 4 ([Bond Types and Codes](/books/logistics/customs-brokers-and-bonds#bond-types-and-codes)).

### Zone Status

Every lot in a zone has a status that decides how it will be classified and valued when it leaves:

| Status | Rule | Effect |
| --- | --- | --- |
| **Privileged foreign** | "Foreign merchandise which has not been manipulated or manufactured so as to effect a change in tariff classification," on application on CBP Form 214 at admission "or at any time thereafter before the merchandise has been manipulated or manufactured in the zone" (19 CFR 146.41) | Classified and valued as provided in 146.65; "cannot be abandoned and remains applicable to the merchandise even if changed in form by manipulation or manufacture" |
| **Non-privileged foreign** | Foreign merchandise without privileged status, waste from manipulating privileged merchandise, and domestic merchandise that has lost its identity (19 CFR 146.42) | The default for foreign goods; entered in the condition it leaves the zone in, which is where the inverted-tariff election lives |
| **Domestic** | Merchandise eligible for domestic status under 19 CFR 146.43 | The status the 2026 programs let goods keep instead of privileged foreign status |

The 2026 tariff programs took the choice away for their goods. Goods subject to the Section 301 duties, unless eligible for domestic status, "may only be admitted as 'privileged foreign status,'" effective the date the duty is imposed (CSMS 69326983), and the same rule appears in CBP's guidance for Section 301 China and for Section 338. Privileged foreign status fixes the merchandise's classification at admission, so a manufacturer can no longer avoid an additional duty on a component by paying the finished product's rate; the zone still defers the duty and still exempts exports. Partner agency data follows goods into zones too: CPSC's certificate eFiling applies to zone admissions from January 8, 2027 ([CPSC eFiling](/books/logistics/forced-labor-and-partner-agencies#cpsc-efiling)).

### What the Zone's System Must Know

Treat a zone operator's inventory system as a customs record: it has to show, by lot, what was admitted on which Form 214 in which status, what was manipulated or consumed into what, what left by weekly entry, transfer or export, and what remains. It is a warehouse management system with a status per lot and a customs reconciliation on top, and its errors are customs violations, not inventory variances.

## Trade Agreements

### USMCA Claims and Certifications

A USMCA claim is made by the importer on the entry line (the special program indicator before the tariff number), based on a certification of origin that "must be in the possession of the importer at the time the claim for preferential tariff treatment is made" and produced on CBP's request (19 CFR 182.12(a)). The importer, exporter or producer may complete the certification, based on its own knowledge or, for an exporter that isn't the producer, reasonable reliance on the producer's written representation (182.12(f)). To be valid, a certification must include the minimum data elements (182.12(a)(4) and (5)):

- whether the certifier is the importer, exporter or producer, and the certifier's name, title, address, telephone and email;
- the exporter, producer and importer, if different and known (or "Various" or a list);
- a description of the good detailed enough to tie it to the invoice and the HS, and its HTSUS classification to six or more digits;
- the origin criterion: the applicable General Note 11 rule;
- for a single shipment the invoice number, or for a blanket certification the period, "not exceeding 12 months from the date of certification";
- the legal name of the authorized signer and the certification statement, which begins "I certify that the goods described in this document qualify as originating."

A certification "will be accepted as valid for four years following the date on which it was completed" (182.12(h)), and the importer's address must be in a USMCA country (182.12(b)). Remember USITC's warning that USMCA's rules of origin are written in HS 2012 terms, so the rule cited is matched against the product's classification in that edition, not today's ([The Tariff Schedule](/books/logistics/classification-valuation-origin#the-tariff-schedule)).

### The Joint Review and the Tariff Programs

USMCA entered into force on July 1, 2020 and terminates 16 years later, on July 1, 2036, "unless each Party confirms that it wishes to continue the Agreement for a new 16-year term." The parties met for the first joint review on July 1, 2026, and "the United States did not agree to extend the Agreement for a new 16-year term"; the Commission now meets annually until all three confirm an extension or the term expires. USTR's notice for the 2027 annual review set January 12, 2027 as the deadline for written comments (USTR, October 2026). What changed is the horizon a sourcing decision can count on: a year at a time, against an end date ten years out.

USMCA qualification also decides some tariff program treatment: USMCA goods of Canada and Mexico entered free under General Note 11 were outside the Section 122 surcharge, and the Section 301 forced labor action has its own conditions for Canada and Mexico (9903.05.93 and .94). It doesn't help against Section 232: those duties "may not be waived due to a Free Trade Agreement" unless a Chapter 99 number provides it ([Exemptions That Recur](/books/logistics/tariff-programs#exemptions-that-recur)). A preference claim therefore isn't a rate lookup; it's an input to every program's scope.

## How to Build It

Drawback claims and their designations, zone admissions by lot and status, and preference claims backed by certifications. `facilities` gains its zone identity; `lots` gain zone status through admissions:

```sql
-- A drawback claim: one ACE drawback entry with its designations.
CREATE TABLE drawback_claims (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  claimant_party_id   UUID NOT NULL REFERENCES parties (id),
  filer_party_id      UUID NOT NULL REFERENCES parties (id),
  claim_number        TEXT,              -- the drawback entry number (type 47)
  provision           TEXT NOT NULL CHECK (provision IN ('1313a', '1313b', '1313c',
                        '1313j1', '1313j2')),
  accelerated_payment BOOLEAN NOT NULL DEFAULT FALSE,
  customs_bond_id     UUID REFERENCES customs_bonds (id),  -- activity code 1a
  earliest_import_on  DATE NOT NULL,     -- drives the five-year filing limit
  file_by             DATE NOT NULL,     -- earliest_import_on + 5 years
  claimed_amount      BIGINT NOT NULL CHECK (claimed_amount >= 0),
  refunded_amount     BIGINT,
  currency            CHAR(3) NOT NULL DEFAULT 'USD',
  filed_at            TIMESTAMPTZ,
  paid_on             DATE,
  retain_until        DATE,              -- third anniversary of payment
  status              TEXT NOT NULL CHECK (status IN ('draft', 'filed', 'accelerated_paid',
                        'liquidated', 'denied', 'protested', 'abandoned'))
);

-- Each designation: an import entry line matched to an export or destruction.
CREATE TABLE drawback_claim_lines (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  drawback_claim_id     UUID NOT NULL REFERENCES drawback_claims (id),
  customs_entry_line_id UUID NOT NULL REFERENCES customs_entry_lines (id),  -- designated import
  export_shipment_id    UUID REFERENCES shipments (id),
  export_reference      TEXT,             -- the EEI ITN or other proof of export
  destroyed             BOOLEAN NOT NULL DEFAULT FALSE,
  quantity              NUMERIC(14, 3) NOT NULL CHECK (quantity > 0),
  uom                   TEXT NOT NULL,
  import_tariff_number  TEXT NOT NULL,    -- snapshots for the 8-digit and 'other' tests
  export_tariff_number  TEXT NOT NULL,
  duty_per_unit_import  NUMERIC(14, 4) NOT NULL,  -- minor units, from entry_line_duties
  duty_per_unit_export  NUMERIC(14, 4),   -- the lesser-of comparison for substitution
  refund_amount         BIGINT NOT NULL,  -- 99% of the lesser, rounded once
  exported_on           DATE,
  CHECK (export_shipment_id IS NOT NULL OR destroyed)
);
CREATE INDEX ON drawback_claim_lines (customs_entry_line_id);

-- The zone a facility is, so admissions and weekly entries resolve to it.
ALTER TABLE facilities
  ADD COLUMN ftz_zone_number TEXT,       -- the zone and subzone as the Board designated them
  ADD COLUMN ftz_site        TEXT,
  ADD COLUMN ftz_operator_bond_id UUID,  -- the operator's activity code 4 bond
  ADD CONSTRAINT facilities_ftz_bond_fk FOREIGN KEY (ftz_operator_bond_id)
    REFERENCES customs_bonds (id) NOT VALID;

-- One admission of foreign or domestic goods into a zone, by lot and status.
CREATE TABLE ftz_admissions (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  facility_id        UUID NOT NULL REFERENCES facilities (id),  -- a zone site
  applicant_party_id UUID NOT NULL REFERENCES parties (id),
  form_214_number    TEXT NOT NULL,
  shipment_line_id   UUID REFERENCES shipment_lines (id),
  item_id            UUID NOT NULL REFERENCES items (id),
  lot_id             UUID REFERENCES lots (id),
  quantity           NUMERIC(14, 3) NOT NULL CHECK (quantity > 0),
  uom                TEXT NOT NULL,
  zone_status        TEXT NOT NULL CHECK (zone_status IN ('privileged_foreign',
                       'non_privileged_foreign', 'domestic', 'zone_restricted')),
  status_required_by TEXT,                -- the measure that forced privileged foreign status
  tariff_number_at_admission TEXT,        -- fixed for privileged foreign status
  value_at_admission BIGINT,
  origin_country     CHAR(2),
  admitted_at        TIMESTAMPTZ NOT NULL,
  status_granted_at  TIMESTAMPTZ,         -- privileged status may be granted after admission
  manipulated_at     TIMESTAMPTZ,         -- after this, privileged status can't be applied for
  CHECK (zone_status <> 'privileged_foreign' OR tariff_number_at_admission IS NOT NULL),
  CHECK (status_granted_at IS NULL OR manipulated_at IS NULL
         OR status_granted_at <= manipulated_at)
);

-- A claim of preferential treatment on an entry line, with the certification behind it.
CREATE TABLE preference_claims (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  customs_entry_line_id UUID NOT NULL REFERENCES customs_entry_lines (id),
  agreement             TEXT NOT NULL CHECK (agreement IN ('usmca', 'korus', 'cafta_dr',
                          'other')),
  special_program       TEXT NOT NULL,      -- the SPI reported on the line
  certifier_role        TEXT NOT NULL CHECK (certifier_role IN ('importer', 'exporter',
                          'producer')),
  certifier_party_id    UUID NOT NULL REFERENCES parties (id),
  origin_criterion      TEXT NOT NULL,      -- the General Note 11 rule cited
  rule_edition          TEXT NOT NULL,      -- the HS edition the rule is written in
  blanket_period        DATERANGE,          -- at most 12 months; null for one shipment
  invoice_number        TEXT,               -- for a single-shipment certification
  certified_on          DATE NOT NULL,      -- valid four years from here
  in_possession_at      TIMESTAMPTZ NOT NULL,  -- must precede the claim
  claimed_at            TIMESTAMPTZ NOT NULL,
  document_id           UUID NOT NULL REFERENCES documents (id),
  origin_determination_id UUID REFERENCES origin_determinations (id),
  CHECK (in_possession_at <= claimed_at),
  CHECK (blanket_period IS NULL OR upper(blanket_period) <= lower(blanket_period) + 366),
  CHECK (claimed_at::date <= certified_on + 1461)
);
```

The drawback question an importer asks every month: which exports in the last period can be matched to imports still inside the five-year window, and what each match is worth.

```sql
-- Candidate substitution matches: exports of $1 to imports at the same 8 digits.
SELECT x.id AS export_shipment_line, l.id AS import_entry_line,
       e.declaration_number, l.tariff_number,
       e.entry_time::date + INTERVAL '5 years' AS file_by,
       sum(d.amount) FILTER (WHERE d.stage IN ('liquidated', 'deposit'))
         / NULLIF(l.quantity, 0) AS duty_per_unit
FROM shipment_lines x
JOIN item_classifications ic ON ic.item_id = x.item_id AND ic.jurisdiction = 'US'
 AND ic.nomenclature = 'HTSUS' AND ic.valid_during @> CURRENT_DATE
JOIN customs_entry_lines l ON left(l.tariff_number, 8) = left(ic.code, 8)
JOIN customs_entries e ON e.id = l.customs_entry_id
 AND e.importer_party_id = $2
 AND e.liquidation_status IN ('liquidated', 'reliquidated', 'final')
 AND e.entry_time > NOW() - INTERVAL '5 years'
JOIN entry_line_duties d ON d.customs_entry_line_id = l.id
WHERE x.shipment_id = $1
  AND NOT EXISTS (SELECT 1 FROM drawback_claim_lines c WHERE c.customs_entry_line_id = l.id)
GROUP BY x.id, l.id, e.declaration_number, l.tariff_number, e.entry_time
ORDER BY duty_per_unit DESC NULLS LAST;
```

The query finds candidates; the "other" rule, the lesser-of comparison and partially used designations are applied by the claim builder, which records each rule it applied on the claim line.

Design notes:

- **Drawback consumes import quantity.** A designated entry line can back exports only up to its quantity; track drawn quantity per line so two claims can't designate the same units, and keep duty per unit from `entry_line_duties`, by program, because the lesser-of rule and partial program refunds need it.
- **Zone status is per lot and per admission.** The status, the tariff number fixed at admission, and the measure that forced privileged status are columns, because a weekly entry months later computes duty from them.
- **A preference claim needs possession before the claim.** `in_possession_at` before `claimed_at` is a constraint, not a reminder; blanket certifications are checked for their 12-month period and four-year validity.
- **Keep export proof with the claim.** An ITN, a bill of lading, or a destruction certificate is the other half of every drawback line ([Export Compliance & Screening](/books/logistics/export-compliance)).
- **Rounding happens once.** The 99% refund is computed per designation from unrounded per-unit duty and rounded when it becomes a refund amount ([Rounding](/docs/money/amounts#rounding)).

## Auditing

- **Every drawback claim** with its provision, designations, export proofs, the five-year limit for each import, the lesser-of computations, and payment, kept to the third anniversary of payment.
- **Every zone admission** with its Form 214, status, the classification and value fixed at admission, manipulation, and every removal by weekly entry, transfer or export, reconciling to the inventory on hand.
- **Every preference claim** with its certification as received, the certifier, rule, edition, blanket period, and the date it reached the importer.
- **Every program eligibility decision:** whether a measure's duties were drawback eligible and whether it forced privileged foreign status, from the measure row in force.

## What This Means for the System You Build

- **Track drawback potential from the day of import,** with per-unit duty by program and a five-year filing limit on every entry line.
- **Match exports to imports with the statute's tests:** eight digits, the "other" rule, the lesser-of amount, and quantity not already designated.
- **Run zones as customs inventory:** lot-level status, the tariff number fixed at admission, and a weekly entry that reconciles.
- **Apply privileged foreign status where the 2026 programs require it,** and recompute the zone's value case without the inverted-tariff election for those goods.
- **Hold USMCA certifications as documents with their data elements,** in hand before the claim, checked for period and validity.
- **Feed preference status into every tariff program's scope,** and don't expect it to waive Section 232.
- **Plan for USMCA's annual reviews,** keeping the agreement's rules and its July 1, 2036 end date as data.

## References

**Statutes and regulations**

- [19 U.S.C. 1313: Drawback and refunds](https://www.law.cornell.edu/uscode/text/19/1313), drawback types, the five-year limits, the 8-digit and "other" substitution tests, the 99% refund and the lesser-of rule
- [19 CFR 190.92: Accelerated payment of drawback](https://www.law.cornell.edu/cfr/text/19/190.92), the bond, approval and timing
- [19 CFR 163.4: Record retention period](https://www.law.cornell.edu/cfr/text/19/163.4), drawback records to the third anniversary of payment
- [19 U.S.C. 81c: Exemption from customs laws of merchandise in zones](https://www.law.cornell.edu/uscode/text/19/81c), duty on the foreign merchandise used when entered from a zone
- [19 CFR 146.41: Privileged foreign status](https://www.law.cornell.edu/cfr/text/19/146.41), the application, its timing and the bar on abandonment
- [19 CFR 146.42: Nonprivileged foreign status](https://www.law.cornell.edu/cfr/text/19/146.42), what has it
- [19 CFR 146.63: Entry for consumption](https://www.law.cornell.edu/cfr/text/19/146.63), weekly entry for estimated removals
- [19 CFR 182.12: Certification of origin](https://www.law.cornell.edu/cfr/text/19/182.12), the claim, who certifies, the minimum data elements, blanket periods and four-year validity
- [19 U.S.C. 2465: Termination of GSP duty-free treatment](https://www.law.cornell.edu/uscode/text/19/2465), the December 31, 2020 lapse

**Government**

- [USTR: Request for comments on the operation of the USMCA (October 2026)](https://ustr.gov/sites/default/files/files/Press/Releases/USMCA%20FRN%2010.2.26.pdf), the July 1, 2026 joint review, annual reviews, the July 1, 2036 end date and the January 12, 2027 comment deadline
- [CBP CSMS 69326983: Section 301 forced labor import duties (July 23, 2026)](https://content.govdelivery.com/accounts/USDHSCBP/bulletins/421d887), privileged foreign status for zone admissions and the Canada and Mexico conditions
- [CBP CSMS 70314289: Further modifying Section 338 duties on goods of Canada (October 29, 2026)](https://content.govdelivery.com/accounts/USDHSCBP/bulletins/430e931), drawback eligibility and zone status
- [CBP: Section 301 FAQs](https://www.cbp.gov/trade/programs-administration/entry-summary/section-301-trade-remedies/faqs), drawback eligibility and privileged foreign status
- [CBP: IEEPA duty refunds](https://www.cbp.gov/trade/programs-administration/trade-remedies/ieepa-duty-refunds), drawback-designated entries, liquidation before designation and CAPE priority
- [CBP: Form 7501 and instructions (rev. 11/26)](https://www.cbp.gov/document/forms/form-7501-entry-summary-continuation-sheets), zone admission and consumption entry types
- [USITC: General Rules of Interpretation, HTSUS Revision 23 (2026)](https://hts.usitc.gov/reststop/file?release=currentRelease&filename=General%20Rules%20of%20Interpretation), the compiler's note on USMCA rules in HS 2012 terms
- [Federal Register: Proclamation 11012 (February 25, 2026)](https://www.govinfo.gov/content/pkg/FR-2026-02-25/html/2026-03824.htm), the USMCA exclusion from the Section 122 surcharge
- [CBP: Section 232 FAQs](https://www.cbp.gov/trade/programs-administration/entry-summary/232-tariffs-aluminum-and-steel/faqs), no FTA waiver of Section 232 duties
