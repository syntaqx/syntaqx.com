+++
title = "Freight Class, Density & LTL Pricing"
nav_title = "Freight Class & Pricing"
description = "Pricing LTL freight: the NMFC and its 2025 density scale, reweighs and inspections, base rates, weight breaks, discounts, FAK, minimums and accessorials."
category = "Logistics & Supply Chain Industry"
order = 2807
part = "Road and Rail"
tags = ["logistics", "ltl", "nmfc", "freight-class", "density", "rating", "accessorials", "data-model"]
+++

An LTL shipment's price is assembled from parts that different organizations own. A classification published by the National Motor Freight Traffic Association (NMFTA) puts the freight in a class from 50 to 500, by what it is or, increasingly, by how dense it is. A base rate table (the carrier's own, or a neutral one such as SMC3's CzarLite) gives a rate per hundred pounds for that class, weight bracket and pair of points. The shipper's pricing agreement discounts the base, overrides the class with a freight-all-kinds rule, and sets a minimum charge. A fuel surcharge indexed to the government's weekly diesel price is added as a percentage. Then the carrier's rules tariff adds accessorials for everything else (liftgate, residential delivery, appointments, inspection, reweighing), each with its own item number, unit and minimum.

It is hard because the shipper rates the shipment from what it declares, and the carrier bills it from what it measures. Since NMFTA's Docket 2025-1 took effect on July 19, 2025, many more commodities are classed by density, so a pallet's class now depends on its dimensions as tendered, including the pallet, measured "down to the inch." A dimensioner on the carrier's dock that reads two inches taller than the shipper's bill can move a pallet a class, and the carrier's rules tariff makes that correction, plus a fee, binding. Each carrier also keeps its own exceptions: one rates density only under a written agreement and with its own 18-band table and rounding rule, another charges a cubic minimum on light, bulky shipments, a third charges by the lineal foot of trailer a shipment occupies.

This chapter covers the NMFC and the 2025 changes, density and how carriers measure it, reweighs, inspections and reclassification, base rates, weight breaks and discounts, FAK, minimum charges, cube and lineal foot rules, the LTL fuel surcharge, accessorials, liability limits as they affect price, and the billing deadlines. It extends `items`, `shipment_lines`, `handling_units` and `lane_rates` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model), whose LTL example already worked one shipment through a class and a reweigh ([An LTL Shipment](/books/logistics/logistics-business#an-ltl-shipment)). The network the freight moves through is [LTL Networks](/books/logistics/ltl-networks); truckload and contract rate tables in general are Rating, Tariffs & Accessorials; parcel dimensional weight is the Commerce volume's ([Dimensional Weight](/books/commerce/shipping-and-carriers#dimensional-weight)).

## How the Carriers Do It

As of November 2026, from carriers' rules tariffs and annual reports and NMFTA's own publications:

| Source | Classification | Density and cube | Reweigh and inspection | Minimums |
| --- | --- | --- | --- | --- |
| **NMFTA** (the NMFC) | The classification itself, a "voluntary" standard: participants are "neither constrained nor compelled to use or abide by" it | Docket 2025-1 (effective July 19, 2025) expanded the 11-sub density scale to 13 subs, classes 400 to 50; density per handling unit unless the papers give only a total weight | Its rules (such as Item 360 on bills of lading) are what carrier tariffs take exceptions to | Not in the NMFC; "FAKs are not addressed in the NMFC" |
| **ArcBest** (ABF Freight) | "Approximately 17% of our Asset-Based business is subject to base LTL tariffs"; the rest is under customer pricing | "Space-based pricing" with cubic minimum charges for shipments under its LTL tariffs, because linehaul costs are "generally driven by space rather than weight"; "the shift to density-based classification beginning in the second half of 2025" | In its rules tariff | Dynamic pricing quotes through a portal and API to fill excess capacity |
| **FedEx Freight** (FXF 100 Rules Tariff, January 5, 2026) | "Freight is rated by a class system, which is established by the National Motor Freight Traffic Association" | Extreme length from $775 (12 to 15 feet) to $1,514 (20 feet or more) | Weight (reweigh) and freight (inspection) validation, Item 981: $40 a shipment; bill of lading corrections, Item 360: $50 | In its rules tariff |
| **TForce Freight** (UPGF 102-T, August 17, 2026) | Class rates by default; density rates "only upon a written agreement" | Its own 18-band density table with its own rounding (Item 645); cubic minimum at 6 pounds a cubic foot for shipments of 750 cubic feet or more under 6 pcf, rated at class 150 (Item 575) | Inspection $40 and reweigh $40 when the correction raises net charges by $15.00 or more; scales within plus or minus 1% (Items 365, 990) | Absolute minimum charge after discount $186.00 within the continental U.S. (Item 610-A) |
| **XPO** (CNWY 199-AK.2, May 18, 2026) | Class rates with customer exceptions and FAKs | Cubic capacity: 350 to 750 cubic feet under 3 pcf, or 750 or more under 6 pcf, rated at 6 pounds a cubic foot at class 125 "excluding FAKs and NMFC overrides" (Item 233); lineal foot charge over 14 feet of trailer, 112 square feet or 20,000 pounds, minimum $802.00 (Item 234) | Inspection $47.85 (Item 26) and reweigh $47.85 (Item 239); bill of lading corrections $49.80 (Item 205) | In its base tariff CNWY-599 |
| **SMC3** (CzarLite) | Base rates for class "and density pricing" | CzarLite Density, "simplified density rating" | Not applicable | Not applicable; "the most widely used neutral LTL base rate for pricing agreements in North America" |

Four patterns:

- **The NMFC is a reference, the carrier's tariff is the contract.** NMFTA says the classification is voluntary; each carrier's rules tariff adopts it with exceptions, and each shipper's pricing agreement takes exceptions to the tariff. Rating a shipment means applying three layers in order, and the system must know which layer every number came from.
- **Density is how carriers price space.** ArcBest says its linehaul cost is driven by space; TForce and XPO both charge a cubic minimum on light freight; the 2025 docket moved generic commodities onto the 13-sub density scale. Dimensions as tendered are now a rating input as important as weight.
- **Corrections are a published, fee-bearing process.** Every carrier reserves the right to reweigh, measure and inspect, re-rate on what it finds, and charge $40 to about $48 for the trouble. The shipper's bill of lading is a claim the carrier will test.
- **Carriers' density tables are not the NMFC's.** TForce's Table 645 has 18 bands (less than 1 pcf at class 500 through 50 or greater at class 50), not the NMFC's 13, and rounds density to the half-unit before looking it up. A rating engine that assumes one density table for every carrier will misprice.

## The NMFC

The National Motor Freight Classification groups commodities into items, each with a description, packaging requirements and a class or a set of subprovisions ("subs") that assign classes by density or another measure. Classes run from 50 (dense, easy to handle, unlikely to be damaged) to 500 (light, awkward or fragile); the class is a rating input, not a price. NMFTA's classification body, the Freight Classification Development Council (FCDC), weighs four transportation characteristics: density, and three it describes in its 2025 FAQ:

- **Handling:** most freight is "readily handled by dock personnel," but articles that, "due to their size, weight, configuration, hazardous nature, fragility, etc., pose additional handling difficulties" may get a higher class.
- **Stowability:** loading restrictions from regulations (such as hazmat coloading prohibitions), excessive weight or length, protrusions, "the inability to tier the commodity," and "the inability to load other freight on top."
- **Liability:** "susceptibility to damage, propensity to damage other freight with which transported, perishability and hazardous nature."

**Docket 2025-1** was issued January 30, 2025, discussed at an FCDC public meeting on March 3 and finalized in a disposition bulletin by March 21; it took effect July 19, 2025, which NMFTA called "one of the most significant updates" in the classification's history. Its core change: NMFC items "grouped within generic headings" that "do not present any known handling, stowability, or liability concerns" were cancelled and "referenced within a 13-sub density item within that generic heading," keeping their descriptions and minimum packaging requirements; items with such characteristics keep classes assigned "based on the commodity's unique characteristics," which may have density breaks of their own. The scale every generic density item now uses:

| Sub | Density, pounds per cubic foot | Class |
| --- | --- | --- |
| 1 | Less than 1 | 400 |
| 2 | 1 but less than 2 | 300 |
| 3 | 2 but less than 4 | 250 |
| 4 | 4 but less than 6 | 175 |
| 5 | 6 but less than 8 | 125 |
| 6 | 8 but less than 10 | 100 |
| 7 | 10 but less than 12 | 92.5 |
| 8 | 12 but less than 15 | 85 |
| 9 | 15 but less than 22.5 | 70 |
| 10 | 22.5 but less than 30 | 65 |
| 11 | 30 but less than 35 | 60 |
| 12 | 35 but less than 50 | 55 |
| 13 | 50 or greater | 50 |

NMFTA replaced its ClassIT lookup with ClassIT+, launched July 15, 2025 as "the exclusive new home for NMFC data moving forward." The NMFC itself is licensed, which is why a shipper's system stores the item and sub its classification staff (or ClassIT+) assigned rather than a copy of the classification.

## Density

Density is weight over cube, per handling unit. NMFTA's method: multiply "the greatest straight-line dimensions of length, width, and height (depth) in inches, including all projections, if any, as tendered to the carrier," divide by 1,728 to get cubic feet, and divide the handling unit's weight by that. Its example: a pallet of boxes 48 × 40 × 45 inches weighing 450 pounds is 86,400 cubic inches, 50 cubic feet, and 9.00 pounds per cubic foot, sub 6, class 100. Two rules make it a per-unit calculation:

- **Each handling unit separately.** NMFC Item 110, Sec. 8(d): "where a shipment consists of multiple handling units the density shall be calculated on each handling unit, except that where shipping papers show only a total weight for all handling units tendered the density may be calculated by using the total weight and the total cube." Two pallets of the same item can rate in different classes.
- **The pallet counts.** Dimensions include the pallet and any overhang; TForce's tariff repeats that "the pallet, platform, rack or skid constitutes the shipping package, or a part thereof, and must be included in the computation of density." NMFTA lists rounding measurements "too generously" and using "dimensioners that measure less accurately than the carriers" among shippers' common errors.

Carriers add their own measurement rules in their tariffs. TForce (Items 630 and 645) may apply a height of not less than 96 inches to any unit that can't have freight loaded on top (because of its nature, its packaging, a pyramided or rounded-off pallet, or a do-not-stack instruction), may use a 96-inch width for articles 70 inches wide or more, may compute cube from lineal feet of trailer occupied when units can't be measured individually, rates a unit under one cubic foot as one cubic foot, fills an omitted dimension with a default of 120 inches long, 96 wide or 96 high, and rounds density to the nearest tenth and then up to the next half or whole number before looking up the class. It also refuses NMFC Item 171 "bumping," "the declaration on the original bill of lading of an artificially higher weight" to reach a lower class.

The calculation belongs in code once, with the carrier's rules as parameters:

```go tab="Go"
// Band is one row of a density scale: densities at or above MinPCF and below
// the next band's MinPCF rate at Class. Scales are data, versioned per source.
type Band struct {
	MinPCF float64
	Class  float64
}

// DensityPCF follows NMFTA's method: greatest dimensions in inches including
// projections, cube in cubic feet, weight over cube.
func DensityPCF(lengthIn, widthIn, heightIn, weightLb float64) float64 {
	cubicFeet := math.Max(lengthIn*widthIn*heightIn/1728, 1) // some tariffs floor at 1 cu ft
	return weightLb / cubicFeet
}

// ClassFor returns the class for a density on a scale sorted by MinPCF ascending.
func ClassFor(pcf float64, scale []Band) float64 {
	class := scale[0].Class
	for _, b := range scale {
		if pcf >= b.MinPCF {
			class = b.Class
		}
	}
	return class
}
```

```rust tab="Rust"
/// One row of a density scale: densities at or above `min_pcf`, and below the
/// next band's, rate at `class`. Scales are data, versioned per source.
struct Band {
    min_pcf: f64,
    class: f64,
}

/// NMFTA's method: greatest dimensions in inches including projections,
/// cube in cubic feet, weight over cube.
fn density_pcf(length_in: f64, width_in: f64, height_in: f64, weight_lb: f64) -> f64 {
    let cubic_feet = (length_in * width_in * height_in / 1728.0).max(1.0); // some tariffs floor at 1 cu ft
    weight_lb / cubic_feet
}

/// The class for a density on a scale sorted by `min_pcf` ascending.
fn class_for(pcf: f64, scale: &[Band]) -> f64 {
    scale
        .iter()
        .filter(|b| pcf >= b.min_pcf)
        .last()
        .map_or(scale[0].class, |b| b.class)
}
```

Rounding is the carrier's, and it comes before the lookup: TForce's 11.26 pcf becomes 11.5, still class 92.5 in its table, but its 13.4 becomes 13.5 and moves from class 85 to class 77. The rounding rule is a parameter of the scale, stored with it, never a constant in the function.

## Reweighs, Inspections and Reclassification

The bill of lading is the shipper's declaration; the carrier's scale, dimensioner and inspector are its audit. Each carrier's rules tariff defines the process and the fee:

- **Reweigh.** TForce "may weigh shipments in its custody with or without notice," on platform or lift truck scales "with a manufacturer's specified tolerance of plus or minus 1%," and charges a $40.00 weight adjustment fee when the corrected weight raises net freight charges by $15.00 or more; on a mixed shipment, "the additional weight will be added to the highest classed item." XPO charges $47.85 a shipment for weighing or reweighing, and FedEx Freight $40 for weight or inspection validation.
- **Inspection and reclassification.** TForce may inspect packages and verify weight or density "to determine the actual characteristics of the commodities"; when a shipment is "found incorrectly described, the bill of lading and the Carrier freight bill will be corrected and freight charges assessed according to the proper descriptions and weights," with a $40.00 fee when the inspection raises net charges by $15.00 or more. XPO's inspection fee is $47.85.
- **Corrections the shipper asks for.** Changing a bill after tender is its own charge: $50 a request at FedEx Freight (Item 360) and $49.80 a correction at XPO (Item 205). TForce won't accept a corrected bill or authorization "to change dimensions or density" after the shipment "has been tendered for delivery."

Corrections have legal clocks. A carrier that wants to bill more than it originally billed and collected, and expects the payer to contest it, must "issue any bill for charges in addition to those originally billed within 180 days of the receipt of the original bill"; a shipper that wants to contest charges must "contest the original bill or subsequent bill within 180 days of receipt of the bill" (49 U.S.C. 13710(a)(3)). A carrier must sue to collect charges, and a shipper to recover overcharges, "within 18 months after the claim accrues," and a claim accrues "on delivery or tender of delivery by the carrier" (49 U.S.C. 14705). Carriers' tariffs restate the window for their own overcharge process: TForce pays an overcharge or duplicate payment claim only if it is filed in writing "within 180 days of receipt of Carrier's freight bill." A carrier must also give the shipper, on request, "a written or electronic copy of the rate, classification, rules" the charges are based on (13710(a)(1)), which is how a shipper's audit gets the tariff it checks against.

For the system, a correction is never an edit. The shipment keeps its lines and handling units as tendered; the carrier's measurement is a second set of facts with its source (scale, dimensioner, inspector), time and evidence (a dimensioner image, an inspection certificate); the re-rated charges are new `freight_charges` rows with source `carrier_invoice` or `event`, the original lines voided with the reason, and the fee is its own line of kind `reweigh` or `accessorial`. The business chapter's example, a 1,200-pound shipment reweighed to 1,330 pounds and moved from class 92.5 to 85, shows why both versions are kept: the shipper's freight audit compares them line by line, and the 180-day clock runs from the bill that changed.

## Base Rates, Weight Breaks and Discounts

Rating an LTL shipment from class rates takes five inputs:

1. **The base rate tariff.** A table of rates per hundredweight by origin and destination (usually postal code or point), class, and weight group: a carrier's own (TForce's UPGF 560 and 525 series, XPO's CNWY-599) or a neutral one such as CzarLite, which SMC3 positions as the benchmark for "thousands of successful shipper, carrier and logistics service provider (LSP) pricing agreements."
2. **The weight group.** Rates fall as weight rises, in brackets whose names encode their floors: TForce applies "weight groups L5C through M10M" to LTL and "M20M or greater" to capacity loads, where L5C is under 500 pounds, M5C 500 and up, M1M 1,000 and up, M2M 2,000, M5M 5,000, M10M 10,000 and M20M 20,000 (C for hundreds, M for thousands).
3. **Deficit weight.** A shipment just under a bracket may be cheaper rated at the bracket's minimum weight and lower rate. TForce states the principle: "the charges assessed against the smaller shipment shall not exceed those of any larger quantity." The rating engine prices both and keeps the lower.
4. **The discount and minimum.** The pricing agreement discounts the base rate, and the result is checked against a minimum charge after discount, itself floored by the carrier's absolute minimum ($186.00 within the continental U.S. at TForce).
5. **Fuel and accessorials,** applied to the discounted linehaul and per the rules tariff.

Worked through for three pallets, each 48 × 40 × 48 inches and 600 pounds (11.25 pcf, sub 7, class 92.5), 1,800 pounds in all, on illustrative base rates of $95.00 per hundredweight at class 92.5 in the M1M bracket and $78.00 in M2M, a 75% discount, and TForce's fuel table:

| Step | Arithmetic | Amount |
| --- | --- | --- |
| Rate as weighed, M1M | 18 cwt × $95.00 | $1,710.00 |
| Rate as deficit weight, M2M | 20 cwt × $78.00 | $1,560.00 |
| Base charge, the lower of the two | | $1,560.00 |
| Discount, 75% (illustrative) | | ($1,170.00) |
| Discounted linehaul, above the $186.00 absolute minimum | | $390.00 |
| Fuel surcharge, 54.5% of linehaul (TForce schedule at $5.937 diesel) | $390.00 × 0.545 | $212.55 |
| **Total before accessorials** | | **$602.55 ($33.48 per cwt actual)** |

The fuel line comes from TForce's Item 1: 31.30% at an EIA on-highway diesel price of at least 361 cents, plus 0.1% "for each one-cent ($ .01) increase over 361 cents," with changes in Monday's EIA price taking effect "the following Wednesday." At the EIA's $5.937 for the week of November 16, 2026, that is 31.30% plus 232 × 0.1%, or 54.5%. LTL fuel surcharges are percentages of linehaul, so they compound with the discount: a deeper discount lowers the fuel charge too.

The shipper's pricing agreement is therefore mostly a set of overrides on a base: which base tariff and version, the discount (often different by lane, direction or weight group), the minimum charge and floor, class exceptions or FAK bands, accessorial waivers or caps, and the fuel table. The core `lane_rates` row already has `basis = 'tariff_discount'` and `discount_bp`; this chapter adds what the discount applies to.

## FAK and Class Exceptions

A **freight-all-kinds** (FAK) provision rates a range of actual classes as one class: a shipper whose products classify anywhere from 55 to 100 might negotiate "classes 55 through 100 rated as 70." It simplifies rating and gives the shipper a predictable price; it is entirely contractual. NMFTA's answer on whether FAKs protect against the 2025 density changes is that "FAKs are not addressed in the NMFC," so "those impacts should be discussed with your transportation provider." Carriers carve FAKs out of their protective rules: XPO's cubic capacity rule rates light freight at class 125 "excluding FAKs and NMFC overrides," its trade show rule says "FAK provisions" below class 125 "will not apply," and TForce's cubic minimum uses a class 150 rate that "shall not be reduced or increased by any exception class, class tier/grouping or Freight All Kinds class rating."

A rating engine applies the order the agreement and tariff imply: determine the actual class (NMFC item or density sub, after any carrier measurement), apply the agreement's class exceptions and FAK bands, rate, then apply the carrier rules that override FAK (cube minimums, trade show, lineal foot). An FAK band stored as free text ("55-100 as 70") can't be applied by software; stored as rows with a lower class, an upper class and the rated class, it can.

## Cube, Length and Capacity Rules

Light, bulky or long freight takes space a class rate doesn't pay for, and carriers price it with rules that override the class:

- **Cubic minimums.** XPO (Item 233): a shipment of 350 but less than 750 cubic feet at an average density under 3 pcf, or 750 cubic feet or more under 6 pcf, is rated at a weight of its cubic feet times 6, at class 125. TForce (Item 575): 750 cubic feet or more under 6 pcf, rated at 6 pounds a cubic foot at the class 150 rate less discount, with a minimum height of 8 feet when top loading is precluded.
- **Lineal feet.** XPO (Item 234) charges by lineal foot when a shipment occupies 14 feet or more of trailer length at 49 inches wide and 51 high, 112 square feet of floor at 51 inches high, or 20,000 pounds ("every 1,000 lbs. equals 1 lineal foot"), at rates per lineal foot per mile from $0.22 under 750 miles to $0.13 at 1,800 or more, with an $802.00 minimum.
- **Capacity loads.** TForce (Item 390) applies a capacity load minimum to a shipment that "occupies the full visible capacity of a Van or doubles trailer," and a note in the same tariff treats same-day shipments from one place to one place that reach 20,000 pounds or 28 linear feet of a vehicle as one shipment.
- **Length.** Long articles carry their own charges: XPO's excessive length from $460.00 (8 to under 11 feet) to $4,950.00 (20 feet or more), FedEx Freight's extreme length from $775 to $1,514.

These rules need the shipment's total cube and the longest article, which is why handling unit dimensions belong on every LTL shipment even where the agreement rates by class.

## Accessorials

Accessorials are priced in the carrier's rules tariff, item by item, and vary in unit (per shipment, per hundredweight with a minimum and maximum, per 15 minutes, per day). Two published schedules side by side:

| Service | FedEx Freight (FXF 100, January 5, 2026) | XPO (CNWY 199-AK.2, May 18, 2026) |
| --- | --- | --- |
| Liftgate | $13.96 per cwt, $207 minimum, $681 maximum | $13.45 per cwt, $259.00 minimum, $644.00 maximum |
| Residential delivery | $243 per shipment | $16.00 per cwt, $180.00 minimum, $880.00 maximum (with limited access) |
| Limited access | $229 per shipment | As residential |
| Inside pickup or delivery | $18.92 per cwt, $200 minimum, $1,999 maximum | $17.45 per cwt, $179.00 minimum, $1,504.00 maximum |
| Notification before delivery | $65 per shipment | $26.30 per notification; appointment $67.50 per shipment |
| Detention with power | $82 per 28-foot trailer each 15 minutes, $97 minimum | $72.25 per 15 minutes, $95.50 minimum |
| Hazardous materials | $61 per shipment | $54.00 per shipment |
| Redelivery | $21.05 per cwt, $210 minimum, $2,203 maximum | $18.50 per cwt, $175.50 minimum, $553.00 maximum |
| Reweigh and inspection | $40 per shipment (Item 981) | $47.85 each (Items 239 and 26) |
| Bill of lading correction | $50 per request (Item 360) | $49.80 per correction (Item 205) |

Every accessorial on a carrier's invoice should be traceable to a request on the bill of lading (liftgate, inside delivery), a fact about the destination (residential, limited access, a remote or high-cost postal code tier), or an event the carrier recorded (detention from arrival and departure times, a reweigh from a scale ticket, redelivery from a failed attempt). Freight audit is the comparison of those charges with that evidence (Freight Audit & Payment). Guaranteed service is priced the same way, as a percentage of linehaul: XPO's guaranteed service is 25% of net linehaul with a $66.25 minimum, its guaranteed by noon 35% with a $166 minimum, both subject to fuel surcharge.

## Liability and Declared Value

Class and liability are linked: a carrier's liability for loss and damage is limited by its tariff, and a shipper who wants more declares value and pays for it. TForce limits liability on new commodities to the lesser of "twenty five dollars ($25.00) per pound per package," $100,000 a shipment, the invoice value, the NMFC's limits or the contract's, unless excess declared value coverage is requested in writing on the bill and paid for; used goods and some categories carry lower limits, as low as $0.10 a pound per package for some articles. XPO charges excess value at 3% of the declared value above its maximum liability, with a $107.50 minimum. The rating engine needs the declared value from the bill and the applicable limit to price the excess value charge; the claim itself is Cargo Liability & Claims.

## How to Build It

The core model puts `freight_class` and `nmfc_item` on items and on shipment lines as rated, dimensions and weight on handling units as tendered, and a tariff discount on `lane_rates`. Classification adds the NMFC sub and how the class was determined, the carrier's measurements beside the shipper's, density scales and base tariffs as versioned data, FAK bands, and the inspections that correct a shipment. `ALTER`s run on a live database as the business chapter describes ([Lock-Aware DDL](/docs/database/zero-downtime-migrations#lock-aware-ddl)):

```sql
ALTER TABLE items
  ADD COLUMN nmfc_sub      SMALLINT,     -- the sub within the item, for density items
  ADD COLUMN class_basis   TEXT,         -- how the item's class is decided
  ADD COLUMN packaging_req TEXT;         -- the item's minimum packaging, as classified
ALTER TABLE items ADD CONSTRAINT items_class_basis_check
  CHECK (class_basis IS NULL OR class_basis IN ('fixed', 'density_13_sub',
    'density_item_specific', 'other_measure')) NOT VALID;

ALTER TABLE handling_units
  ADD COLUMN measured_length_mm INT,     -- the carrier's measurement
  ADD COLUMN measured_width_mm  INT,
  ADD COLUMN measured_height_mm INT,
  ADD COLUMN measured_weight_g  BIGINT,
  ADD COLUMN measured_by        TEXT,    -- 'dimensioner', 'scale', 'inspector', 'shipper_scale'
  ADD COLUMN measured_at        TIMESTAMPTZ,
  ADD COLUMN top_load_precluded BOOLEAN NOT NULL DEFAULT FALSE;  -- the carrier may cube it at 96 inches
ALTER TABLE handling_units ADD CONSTRAINT handling_units_measured_check
  CHECK (measured_at IS NULL OR (measured_length_mm > 0 AND measured_width_mm > 0
    AND measured_height_mm > 0 AND measured_weight_g > 0)) NOT VALID;

ALTER TABLE shipment_lines
  ADD COLUMN nmfc_sub        SMALLINT,
  ADD COLUMN class_source    TEXT,       -- where the rated class came from
  ADD COLUMN density_pcf_x10 INT;        -- as rated, tenths of a pound per cubic foot
ALTER TABLE shipment_lines ADD CONSTRAINT shipment_lines_class_source_check
  CHECK (class_source IS NULL OR class_source IN ('nmfc_item', 'nmfc_density_sub',
    'carrier_density_table', 'fak', 'carrier_correction')) NOT VALID;

CREATE TABLE freight_density_scales (    -- a density-to-class table, as its source publishes it
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  source            TEXT NOT NULL,       -- 'nmfc_13_sub', or a carrier tariff and item
  carrier_party_id  UUID REFERENCES parties (id),  -- null for the NMFC's own scale
  rounding          TEXT NOT NULL CHECK (rounding IN ('none', 'nearest_tenth',
                      'tenth_then_half_up')),  -- the carrier's rule, applied before lookup
  valid_during      TSTZRANGE NOT NULL,
  document_id       UUID REFERENCES documents (id)  -- the docket or tariff page
);

CREATE TABLE freight_density_bands (
  scale_id   UUID NOT NULL REFERENCES freight_density_scales (id),
  min_pcf    NUMERIC(6, 2) NOT NULL CHECK (min_pcf >= 0),  -- inclusive; the band ends at the next
  class      NUMERIC(4, 1) NOT NULL,
  sub        SMALLINT,                   -- the NMFC sub number, where it has one
  PRIMARY KEY (scale_id, min_pcf)
);

CREATE TABLE ltl_base_tariffs (          -- a base rate table: a carrier's own or a neutral one
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  publisher        TEXT NOT NULL,        -- 'czarlite', or the carrier's tariff name
  carrier_party_id UUID REFERENCES parties (id),
  version          TEXT NOT NULL,
  basis            TEXT NOT NULL CHECK (basis IN ('class', 'density')),
  valid_during     TSTZRANGE NOT NULL,
  UNIQUE (publisher, version)
);

CREATE TABLE ltl_base_rates (            -- rate per cwt by lane, class and weight group
  tariff_id    UUID NOT NULL REFERENCES ltl_base_tariffs (id),
  origin       TEXT NOT NULL,            -- a key: 'zip5:60606', 'zip3:606', a rate base point
  destination  TEXT NOT NULL,
  class        NUMERIC(4, 1) NOT NULL,   -- or a density band's lower bound for density tariffs
  weight_group TEXT NOT NULL CHECK (weight_group IN ('L5C', 'M5C', 'M1M', 'M2M', 'M5M',
                 'M10M', 'M20M')),          -- as the tariff names them; add groups a tariff uses
  min_weight_lb INT NOT NULL,            -- the group's floor, for deficit weight
  rate_per_cwt NUMERIC(10, 4) NOT NULL,  -- minor units per hundredweight
  minimum_charge BIGINT,                 -- the tariff's minimum, before discount
  PRIMARY KEY (tariff_id, origin, destination, class, weight_group)
);

ALTER TABLE lane_rates
  ADD COLUMN base_tariff_id   UUID REFERENCES ltl_base_tariffs (id),
  ADD COLUMN absolute_minimum BIGINT,  -- after discount, minor units
  ADD COLUMN density_scale_id UUID REFERENCES freight_density_scales (id);
ALTER TABLE lane_rates ADD CONSTRAINT lane_rates_base_tariff_check
  CHECK (basis <> 'tariff_discount' OR base_tariff_id IS NOT NULL) NOT VALID;
ALTER TABLE lane_rates ADD CONSTRAINT lane_rates_absolute_minimum_check
  CHECK (absolute_minimum IS NULL OR absolute_minimum >= 0) NOT VALID;

CREATE TABLE lane_rate_fak_bands (       -- 'classes 55 through 100 rate as 70'
  lane_rate_id UUID NOT NULL REFERENCES lane_rates (id),
  class_from   NUMERIC(4, 1) NOT NULL,
  class_to     NUMERIC(4, 1) NOT NULL,
  rated_class  NUMERIC(4, 1) NOT NULL,
  PRIMARY KEY (lane_rate_id, class_from),
  CHECK (class_to >= class_from)
);

CREATE TABLE rating_inspections (        -- a carrier's reweigh, remeasure or reclassification
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  shipment_id         UUID NOT NULL REFERENCES shipments (id),
  carrier_party_id    UUID NOT NULL REFERENCES parties (id),
  kind                TEXT NOT NULL CHECK (kind IN ('reweigh', 'dimension', 'inspection',
                        'reclassification')),
  declared            JSONB NOT NULL,    -- what the bill said: weights, dims, items, classes
  found               JSONB NOT NULL,    -- what the carrier found
  charge_delta        BIGINT,            -- change in net charges, minor units
  fee_charge_id       UUID REFERENCES freight_charges (id),  -- the reweigh or inspection fee
  evidence_document_id UUID REFERENCES documents (id),  -- certificate, dimensioner image, scale ticket
  occurred_at         TIMESTAMPTZ NOT NULL,
  received_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  disputed_at         TIMESTAMPTZ,       -- within 180 days of the bill, 49 U.S.C. 13710(a)(3)
  outcome             TEXT CHECK (outcome IN ('accepted', 'reversed', 'compromised'))
);

ALTER TABLE items VALIDATE CONSTRAINT items_class_basis_check;
ALTER TABLE shipment_lines VALIDATE CONSTRAINT shipment_lines_class_source_check;
ALTER TABLE lane_rates VALIDATE CONSTRAINT lane_rates_base_tariff_check;
ALTER TABLE lane_rates VALIDATE CONSTRAINT lane_rates_absolute_minimum_check;
ALTER TABLE handling_units VALIDATE CONSTRAINT handling_units_measured_check;
```

The base rate lookup with deficit weight, for one rated class and lane: price the shipment in its own weight group and at the floor of every heavier group, and keep the cheapest:

```sql
SELECT r.weight_group,
       GREATEST(r.min_weight_lb, $4) AS rated_weight_lb,
       ROUND(GREATEST(r.min_weight_lb, $4) / 100.0 * r.rate_per_cwt) AS base_charge
FROM ltl_base_rates r
WHERE r.tariff_id = $1 AND r.origin = $2 AND r.destination = $3
  AND r.class = $5                                -- after FAK and class exceptions
  AND (r.min_weight_lb >= $4                      -- heavier groups, at their floor
       OR r.min_weight_lb = (SELECT max(min_weight_lb) FROM ltl_base_rates
                             WHERE tariff_id = $1 AND origin = $2 AND destination = $3
                               AND class = $5 AND min_weight_lb <= $4))  -- its own group
ORDER BY base_charge
LIMIT 1;
```

Design notes:

- **Every scale and tariff is versioned data.** The NMFC's 13-sub scale, a carrier's 18-band table, CzarLite and a carrier's base tariff each have effective ranges; a shipment is rated on the versions in force on its pickup date, and re-rating a year-old shipment reads the old ones ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).
- **Declared and measured sit side by side.** The shipper's dimensions are the core columns; the carrier's are the `measured_` columns; neither overwrites the other, and density is computed from whichever the bill was rated on, recorded in `shipment_lines.class_source`.
- **Convert units once.** The core stores millimeters and grams; the NMFC computes in inches and pounds with 1,728 cubic inches to the foot. Convert at the rating boundary, compute density in pounds per cubic foot, and store it as rated, so a dispute about a tenth of a pound isn't a dispute about floating point ([Rounding](/docs/money/amounts#rounding)).
- **Rating records its reasoning.** Each rated charge stores the tariff version, class source, weight group, deficit weight decision, discount and minimum that produced it ([Record Which Rule Decided](/docs/building-blocks/rules-as-data#record-which-rule-decided)); an auditor or a carrier's billing clerk asks for exactly that.
- **Clocks are computed.** The 180-day windows to rebill and to contest, and the 18-month window to sue, are dates derived from the bill's receipt and the delivery, stored on the dispute.

## Auditing

- **The classification of every item** as assigned, with the NMFC item, sub and the docket in force, and who assigned it.
- **Every handling unit's declared and measured dimensions and weight,** with the measuring device, time and image, which settle reclassification disputes.
- **Every rating:** base tariff and version, class source, FAK band applied, weight group and deficit weight, discount, minimum, fuel table row and accessorial items, so the carrier's invoice can be reproduced.
- **Every inspection and reweigh** with its evidence, fee and the change in charges, and every dispute with its filing date against the 180-day and 18-month clocks.
- **The tariffs themselves:** the rules tariff and base tariff versions a shipment was rated under, which a shipper is entitled to request under 49 U.S.C. 13710(a)(1).

## What This Means for the System You Build

- **Store the class and how it was decided,** per shipment line, and the NMFC item and sub per item; never store only a class number.
- **Capture handling unit dimensions on every LTL shipment,** including the pallet, rounded honestly, because density, cube minimums, lineal foot rules and liability all read them.
- **Keep density scales as data per source,** with each carrier's rounding rule, rather than one hard-coded table.
- **Rate in layers:** classification, then agreement exceptions and FAK, then base rate and weight group with deficit weight, then discount and minimum, then carrier overrides, fuel and accessorials, recording each step.
- **Treat a carrier's reweigh or reclass as new facts and new lines,** with evidence and a fee line, and track the dispute clocks.
- **Version fuel tables and accessorial schedules** with their effective dates and the diesel index row that applied.

## References

**NMFTA and neutral rates**

- [NMFTA: 2025 NMFC changes, frequently asked questions](https://nmfta.org/wp-content/media/2024/11/1106-FAQ_Doc-3.pdf), the voluntary standard, FAKs, Item 110 Sec. 8(d), the density method and example, the 13-sub expansion, handling, stowability and liability, cancelled items and the docket timeline
- [NMFTA: Decoding density](https://nmfta.org/news/decoding-density-the-freight-factor-you-cant-afford-to-overlook/), the full 13-sub scale and common measurement errors
- [NMFTA: NMFC changes take effect and ClassIT+ launches](https://nmfta.org/news/nmfta-implements-historic-nmfc-changes-launches-classit-to-support-industry-in-adapting-to-new-classification-standards/), Docket 2025-1 effective July 19, 2025 and ClassIT+ from July 15, 2025
- [SMC3: CzarLite](https://www.smc3.com/czarlite.htm), the neutral base rate, class and density pricing and its use in pricing agreements

**Carrier tariffs**

- [TForce Freight: Tariff UPGF 102-T, Rules and Charges (effective August 17, 2026)](https://www.tforcefreight.com/downloads/UPGF-102-T-20260817.pdf), fuel surcharge table and EIA rule, liability limits, bumping, inspection and reclassification, capacity loads, cubic minimum, absolute minimum, density measurement and rounding, density rates by agreement and Table 645, overcharge claims and reweighs
- [XPO: Tariff CNWY 199-AK.2 accessorial reference guide (effective May 18, 2026)](https://www.xpo.com/cdn/download_files/s1/p2831/CNWY_199-AK.2_Tri-Fold.pdf), cubic capacity, lineal foot, excessive length, accessorial charges, guaranteed service, excess value, inspection, reweigh and bill corrections
- [FedEx Freight: Surcharge quicksheet (effective January 5, 2026)](https://www.fedexfreight.com/content/dam/web/us/documents/fxf-quicksheet-2026.pdf), FXF 100 accessorial charges, Item 360 corrections and Item 981 validation

**Filings**

- [ArcBest: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/894405/000110465926019699/arcb-20251231x10k.htm), the share of business under base tariffs, space-based pricing, density-based classification and dynamic pricing
- [FedEx Freight Holding Company: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/2082247/000162828026053359/fdxf-20260531.htm), rating by the NMFTA class system

**Statutes and data**

- [49 U.S.C. 13710: Additional billing and collecting practices](https://www.law.cornell.edu/uscode/text/49/13710), rates and rules on request and the 180-day windows to rebill and contest
- [49 U.S.C. 14705: Limitation on actions](https://www.law.cornell.edu/uscode/text/49/14705), 18 months to sue for charges or overcharges and accrual on delivery
- [U.S. Energy Information Administration: Gasoline and diesel fuel update](https://www.eia.gov/petroleum/gasdiesel/), the on-highway diesel average for the week of November 16, 2026
