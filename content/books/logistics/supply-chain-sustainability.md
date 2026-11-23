+++
title = "Emissions & Product Passports"
nav_title = "Emissions & Passports"
description = "Supply chain sustainability data: ISO 14083 and GLEC freight emissions, Scope 3, CBAM, EUDR, battery and ESPR passports, conflict minerals and US disclosure."
category = "Logistics & Supply Chain Industry"
order = 2865
part = "Manufacturing"
tags = ["logistics", "manufacturing", "sustainability", "emissions", "scope-3", "cbam", "eudr", "product-passports", "conflict-minerals", "data-model"]
+++

Sustainability in a supply chain is mostly a data obligation that arrives from outside. A shipper's customer asks for the grams of CO2e on every load it bought, because those grams are part of the customer's own Scope 3 inventory. An EU importer of steel bolts must declare the emissions embedded in them and buy certificates to cover them. A coffee roaster can't place a bag on the EU market without a due diligence statement that names the plots of land the beans grew on. A battery maker needs a digital passport behind a QR code for every battery of certain kinds it sells in the EU from February 2027. A US-listed electronics maker files each May 31 on where the tin, tantalum, tungsten and gold in its products came from.

The hard part is that the facts sit with someone else. Fuel burned is the carrier's; the smelter is a fourth-tier supplier's; the farm plot is a cooperative's; the steel mill's process emissions are the mill's. The system that has to report holds loads, lots and items, and has to attach to each the upstream record that proves a number, with the method, the factor and its version, and whether the number was measured or assumed. Get the grain wrong (emissions per shipment when the regulator wants them per tonne of goods, a passport per model when the rule wants one per battery) and the data can't be reused.

This chapter covers freight emissions under ISO 14083 and the GLEC Framework, Scope 3 Categories 4 and 9, a worked calculation for a multi-leg shipment, the EU's CBAM, the deforestation regulation (EUDR), product passports under the Battery Regulation and ESPR, US conflict minerals reporting, and the state of US climate disclosure rules as of November 2026. It extends `loads`, `items` and `lots` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model). Forced labor tracing to raw materials, the same tier-by-tier evidence problem for a different regulator, is [Forced Labor & Partner Agencies](/books/logistics/forced-labor-and-partner-agencies#the-package-tracing-to-raw-materials); EU customs declarations, which CBAM data rides on, are [EU, UK & Canada Customs](/books/logistics/customs-outside-the-us#the-european-union).

## How the Regulators Do It

As of November 2026, from each regulator's or standard setter's own pages and texts:

| Regime | Who it binds | What it asks for | Dates as of November 2026 | What the system holds |
| --- | --- | --- | --- | --- |
| **ISO 14083:2023 and the GLEC Framework** | Voluntary: carriers, logistics providers and shippers that report transport emissions | Emissions per transport chain element (legs and hubs), including energy provision, on shortest feasible or great circle distance | GLEC v3.1 and v3.2 cited in vendor methodology (Climatiq) | Per-leg and per-hub emissions with factor, method and data quality |
| **GHG Protocol Scope 3, Categories 4 and 9** | Companies reporting a Scope 3 inventory | Upstream and downstream transportation and distribution, by fuel-based, distance-based or spend-based methods | In force as guidance | Carrier emissions allocated to the reporting company's goods |
| **EU CBAM** | EU importers (or indirect customs representatives) of cement, iron and steel, aluminium, fertilisers, electricity and hydrogen above 50 tonnes | Authorised CBAM declarant status, embedded emissions declared yearly, certificates surrendered | Definitive regime from 1 January 2026, as amended by Regulation (EU) 2025/2083; certificates bought on the central platform from February 2027; price a quarterly average in 2026, weekly from 2027 | Per entry line: goods, mass, installation, embedded emissions, carbon price paid |
| **EUDR (Regulation (EU) 2023/1115)** | Operators and traders placing cattle, cocoa, coffee, oil palm, rubber, soya and wood products on the EU market | A due diligence statement with the geolocation of the plots of harvest; deforestation-free after 31 December 2020 | Large and medium operators 30 December 2026; micro and small 30 June 2027 | Statements linked to lots and entry lines, with plots |
| **EU Battery Regulation passport** | Economic operators placing EV, LMT and industrial batteries above 2 kWh on the EU market | A digital battery passport reached by a data carrier | Mandatory from 18 February 2027 | Passport identifier, carrier, data version per battery |
| **ESPR digital product passport (Regulation (EU) 2024/1781)** | Product groups as delegated acts name them | A DPP with a unique identifier, a data carrier and registration in the EU DPP Registry | Registry live 20 July 2026; iron and steel act Q4 2026, textiles, aluminium and tyres Q3 to Q4 2027 (indicative) | Passports by item, lot or unit, registry references |
| **SEC Rule 13p-1 and Form SD** | SEC registrants for which tin, tantalum, tungsten or gold is necessary to a product | A reasonable country of origin inquiry, and due diligence where minerals may come from the DRC or an adjoining country | Due annually on May 31 for the prior calendar year | Supplier inquiries (CMRT responses) and smelters per mineral |
| **US climate disclosure** | SEC registrants (stayed); California companies above $1 billion (SB 253) and $500 million (SB 261) in revenue | Scope 1, 2 and 3 emissions; biennial climate-related financial risk reports | SEC rules stayed, litigation in abeyance since September 12, 2025, rescission proposed June 3, 2026; CARB proposing to move the first Scope 1 and 2 deadline from August 10 to November 10, 2026; SB 261 enjoined pending appeal since November 18, 2025 | The inventory these regimes total |

The patterns:

- **Every number comes from upstream.** A shipper's Scope 3 is its carriers' Scope 1; a CBAM declaration needs the mill's installation data; a due diligence statement needs a farm's coordinates; a Form SD needs smelters four tiers down. The system's job is collecting, versioning and linking other parties' records to its own loads, lots and items, as the forced labor trace does for CBP.
- **Factors are dated reference data.** A default emission intensity, a CBAM default value and a smelter's audit status each change by publication. A figure computed last year is reproducible only if the row says which factor, which version and which method produced it ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).
- **Measured beats modeled, and the record must say which.** GHG Protocol prefers fuel data from carriers over distance times a factor; CBAM distinguishes actual emissions from default values. Every emissions row carries its data quality, and totals are reported with the share that was primary.
- **Grain is set by the rule.** Freight emissions are per leg and allocated per shipment; CBAM per entry line and installation; EUDR per lot of commodity and plot; passports per product, batch or unit as the product group's act decides. My default is to store at the finest grain the data arrives in and aggregate up, never the reverse.

## Transport Emissions: ISO 14083 and GLEC

ISO 14083:2023 is the international standard for quantifying and reporting greenhouse gas emissions from transport chains; the Smart Freight Centre's GLEC Framework is the industry's implementation guide, and Climatiq's ISO 14083 guide says a reporter "can also refer to the GLEC methodology, which meets the requirements of the ISO standard." ISO's page and the GLEC PDF both refused this tool's requests, so the concepts below are as public implementers describe them, not quoted from the standard. <!-- source-gap: logistics-supply-chain-sustainability-iso14083 | secondary | ISO 14083:2023 concepts (transport chain elements, transport and hub operation categories, well-to-wheel scope, data types) and the current GLEC Framework version | closes with: the ISO 14083:2023 abstract from iso.org and the GLEC Framework PDF from smartfreightcentre.org | checked: 2026-11-22 -->

### Legs and Hubs

A transport chain is a sequence of transport chain elements: "legs, for transport operations" and "locations for hub operations" (Climatiq's ISO 14083 guide). A container from a factory in Ningbo to a DC in Ohio is a drayage leg, a port terminal hub, an ocean leg, a terminal hub, a rail leg, a ramp hub and a final dray. Climatiq adds a hub each time the mode changes and at the start and end of the journey. In the core model a leg is a `loads` row on a shipment's `load_shipments.leg` sequence, and a hub is a `facilities` row of kind port terminal, rail ramp, cross dock or warehouse.

### Distance

Emissions intensity is per tonne-kilometer, so distance has to be defined. Climatiq's guide uses "Great circle distance(GCD)" for air and "shortest feasible distance(SFD)" for every other mode, and converts a caller's own distance to SFD with a distance adjustment factor. Actual driven miles from an ELD or a TMS are a different number from SFD; the record keeps which one was used, because a report that mixes them isn't comparable across carriers.

### Operation and Energy Provision

ISO 14083 reporting includes emissions from producing the energy, not just burning it; Climatiq says its estimates "cover both operational emissions and those arising during energy provision," and its intermodal API returns them separately as `vehicle_operation_co2e` and `vehicle_energy_provision_co2e`, with `hub_equipment_co2e` for hub operations and a `co2e_calculation_method` such as "ipcc_ar6_gwp100." The trade terms for the parts are tank-to-wheel (operation), well-to-tank (energy provision) and well-to-wheel (both). A battery-electric truck has almost no operational emissions and all of its emissions in energy provision, so a system that stores only operational grams reports electrification as free.

### Allocation

A vehicle carries many shipments, and the emissions of the trip are shared. The GHG Protocol's technical guidance sets default allocation by each mode's limiting factor: mass for road, rail and air ("Truck capacity is typically limited by mass"), volume for marine ("Vessel capacity is typically limited by volume"), and distance as well "if there are multiple shipments on a transport leg." A multi-stop LTL linehaul or a milk run allocates by tonne-kilometers (each shipment's mass times the distance it rode), which reduces to mass when every shipment rides the whole leg.

### Data Quality

The guidance and the vendors agree on the ordering: measured fuel or energy for the vehicle, allocated, is better than distance times a default intensity, which is better than spend. Climatiq says to "use primary data where possible, ie. calculate emissions based on fuel consumed," and that its freight feature "uses the GLEC default factors" otherwise. Each emissions row records whether it is primary (the carrier's measured fuel for this trip), modeled (the carrier's own fleet intensity, or a model of the vehicle) or default (a published factor for the mode and vehicle class).

## Scope 3: Categories 4 and 9

For a shipper, transport emissions are Scope 3. The GHG Protocol's Technical Guidance for Calculating Scope 3 Emissions defines **Category 4, upstream transportation and distribution,** as transport of purchased products between tier 1 suppliers and the company's own operations in vehicles it doesn't own or operate, and "third-party transportation and distribution services purchased by the reporting company," including inbound logistics, outbound logistics "(e.g., of sold products)" and transport between its own facilities. Outbound freight the company pays for is therefore Category 4, not 9. **Category 9, downstream transportation and distribution,** is transport of sold products from the company's operations to the end consumer "if not paid for by the reporting company," including retail and storage. Transport between tier 2 and tier 1 suppliers is Category 1 (purchased goods and services). Category 4 also includes storage in warehouses and distribution centers that the company doesn't operate, which is where hub emissions land.

A reporting company's Category 4 includes "the scope 1 and scope 2 emissions of third-party transportation companies (allocated to the reporting company)." Three methods, in falling order of accuracy:

- **Fuel-based:** fuel consumed, from the carrier, times the fuel's emission factor; for CO2 the guidance calls it "more accurate than the distance-based method because fuel consumption is directly related to emissions," and best applied to exclusive-use or truckload moves rather than LTL, with allocation otherwise.
- **Distance-based:** for each leg, "mass of goods purchased (tonnes or volume)" times "distance travelled in transport leg (km)" times the mode's or vehicle's emission factor in CO2e per tonne-km, summed across legs; each mode is calculated separately and aggregated.
- **Spend-based:** freight spend times environmentally-extended input-output (EEIO) emission factors, the fallback when neither other method can be applied; the guidance calls it effective for screening but with "high levels of uncertainty."

For a carrier the same grams are its own Scope 1 (fuel burned in its tractors) and Scope 2 (electricity for its terminals and electric trucks). A broker or 3PL that subcontracts all hauling has the reverse of a carrier's inventory: its customers' freight is its Scope 3, and the number it reports to each customer is an allocation of its carriers' figures. Getting the fuel data is a commercial negotiation; storing it with the load is the system's part.

## Calculating a Shipment

An 18,000 kg shipment moves by road 1,200 km to a rail ramp and 2,400 km by rail (illustrative figures throughout). With default intensities of 75 g CO2e per tonne-km for the truck and 20 g for the train (illustrative), the distance-based result is 18 t × 1,200 km × 75 g = 1,620,000 g for the road leg and 18 t × 2,400 km × 20 g = 864,000 g for rail, 2.48 tonnes CO2e before hubs. If the truck's carrier reports measured fuel for the whole trip instead, and the trailer also carried two other shipments to earlier stops, the trip's measured grams are split by tonne-kilometer across the three.

Both calculations stay in integers: mass in kilograms, distance in meters and intensity in milligrams per tonne-kilometer, so grams are kg × m × mg / 10^9 with one rounding at the end ([Rounding](/docs/money/amounts#rounding)). The product can exceed 64 bits on an ocean leg, so it is taken in 128. Allocation uses largest remainder so that the shipments' grams sum exactly to the trip's:

```go tab="Go"
package emissions

import (
	"math/bits"
	"sort"
)

// LegGrams is a leg's grams CO2e from a default intensity: tonne-km is kg/1,000 × m/1,000,
// so grams = kg × m × mgPerTkm / 10^9, rounded half up, with the product in 128 bits.
func LegGrams(massKg, distanceM, mgPerTkm uint64) uint64 {
	hi, lo := bits.Mul64(massKg*mgPerTkm, distanceM) // kg × mg stays far below 2^64
	lo, carry := bits.Add64(lo, 500_000_000, 0)
	hi += carry
	g, _ := bits.Div64(hi, lo, 1_000_000_000)
	return g
}

// Share is one shipment's use of a vehicle trip: its mass and the distance it rode.
type Share struct {
	MassKg    uint64
	DistanceM uint64
}

// AllocateByTonneKm splits a trip's measured grams across its shipments in proportion to
// tonne-km, in whole grams that sum exactly to the total. Ties go to the earlier share.
func AllocateByTonneKm(totalG uint64, shares []Share) []uint64 {
	out := make([]uint64, len(shares))
	rems := make([]uint64, len(shares))
	var sumW, allocated uint64
	for _, s := range shares {
		sumW += s.MassKg * s.DistanceM
	}
	if sumW == 0 {
		return out
	}
	for i, s := range shares {
		hi, lo := bits.Mul64(totalG, s.MassKg*s.DistanceM)
		out[i], rems[i] = bits.Div64(hi, lo, sumW) // quotient <= totalG, so no overflow
		allocated += out[i]
	}
	order := make([]int, len(shares))
	for i := range order {
		order[i] = i
	}
	sort.SliceStable(order, func(a, b int) bool { return rems[order[a]] > rems[order[b]] })
	for _, i := range order[:totalG-allocated] { // fewer leftover grams than shares
		out[i]++
	}
	return out
}
```

```rust tab="Rust"
/// A leg's grams CO2e from a default intensity: tonne-km is kg/1,000 × m/1,000, so
/// grams = kg × m × mg_per_tkm / 10^9, rounded half up, computed in 128 bits.
pub fn leg_grams(mass_kg: u64, distance_m: u64, mg_per_tkm: u64) -> u64 {
    let g = (mass_kg as u128 * distance_m as u128 * mg_per_tkm as u128 + 500_000_000)
        / 1_000_000_000;
    u64::try_from(g).expect("a leg's grams fit in 64 bits")
}

/// One shipment's use of a vehicle trip: its mass and the distance it rode.
pub struct Share {
    pub mass_kg: u64,
    pub distance_m: u64,
}

/// Splits a trip's measured grams across its shipments in proportion to tonne-km, in whole
/// grams that sum exactly to the total. Ties go to the earlier share.
pub fn allocate_by_tonne_km(total_g: u64, shares: &[Share]) -> Vec<u64> {
    let weights: Vec<u128> = shares.iter().map(|s| s.mass_kg as u128 * s.distance_m as u128).collect();
    let sum_w: u128 = weights.iter().sum();
    if sum_w == 0 {
        return vec![0; shares.len()];
    }
    let mut out = Vec::with_capacity(shares.len());
    let mut rems = Vec::with_capacity(shares.len());
    for w in &weights {
        let p = total_g as u128 * w;
        out.push((p / sum_w) as u64); // at most total_g
        rems.push(p % sum_w);
    }
    let leftover = total_g - out.iter().sum::<u64>(); // fewer leftover grams than shares
    let mut order: Vec<usize> = (0..shares.len()).collect();
    order.sort_by(|&a, &b| rems[b].cmp(&rems[a])); // stable sort keeps ties in input order
    for &i in order.iter().take(leftover as usize) {
        out[i] += 1;
    }
    out
}
```

`LegGrams(18_000, 1_200_000, 75_000)` returns 1,620,000. The same functions apply to the energy provision part with its own factor; the two are stored separately and summed for well-to-wheel.

## CBAM

The EU's Carbon Border Adjustment Mechanism "applies in its definitive regime from 1 January 2026," after a transitional phase from 2023 to 2025 (European Commission, Taxation and Customs Union). It covers cement, iron and steel, aluminium, fertilisers, electricity and hydrogen. EU importers, or their indirect customs representatives, who import above "a single mass-based threshold of 50 tonnes of CBAM goods" must apply for the status of "authorised CBAM declarants." Each year they "declare the emissions embedded in their imports and surrender the corresponding number of certificates," priced from the EU Emissions Trading System auction price as "a quarterly average in 2026 and as a weekly average from 2027 onwards," and a carbon price already paid in the country of origin can be deducted if the importer can prove it. The regime runs on Regulation (EU) 2023/956 as amended by Regulation (EU) 2025/2083, which the Commission lists as "simplifying and strengthening CBAM." Certificates "will be purchased on the common central platform from February 2027 onwards"; each 2026 quarterly price applies to emissions in goods imported that quarter, and the Commission published €75.36 for Q1, €75.28 for Q2 and €82.32 for Q3 2026 (as of November 2026). The Commission's pages I opened don't state the first annual declaration's due date, and EUR-Lex returned empty pages for the amending regulation, so that date isn't given here. <!-- source-gap: logistics-supply-chain-sustainability-cbam-dates | missing | the due date of the first annual CBAM declaration for 2026 imports | closes with: the consolidated CBAM Regulation (EU) 2023/956 as amended by 2025/2083, or a Commission CBAM page stating the date | checked: 2026-11-22 -->

For the system, CBAM is three facts per import line that customs data alone doesn't hold:

- **Which goods are CBAM goods,** by CN code on the item, and the declarant's running annual mass against the 50-tonne threshold, which decides whether the declarant status is needed before the shipment that crosses it.
- **Embedded emissions per tonne,** from the producing installation (actual values, which the Commission's verification pages govern) or the Commission's published default values; each line records which.
- **Carbon price paid** at origin, with the evidence for the deduction.

Embedded emissions belong to the supplier's installation and the period produced, so they are lot data from the supplier, carried to the EU declaration line ([EU, UK & Canada Customs](/books/logistics/customs-outside-the-us#the-european-union)). A steel bolt importer that can't get installation data from its supplier pays on default values, which is a commercial reason to put the data requirement in the purchase contract.

## EUDR

The EU deforestation regulation covers cattle, cocoa, coffee, oil palm, rubber, soya and wood, and certain products made from them. Products must not come from land "deforested after 31 December 2020" and must be legally produced, and each must be "Covered by a digital statement or simplified declaration" filed in the EUDR Information System, "a specialised online tool of the TRACES platform." The statement includes "the geolocation of the plot of harvest." As of the Commission's page in November 2026, the rules apply to large and medium operators and traders from 30 December 2026 and to micro and small enterprises from 30 June 2027, with products added by a delegated act (adopted 17 September 2026) in scope from 30 December 2027; the dates were postponed by amendments in December 2024 and on 19 December 2025, and a simplification review was published on 4 May 2026. Countries are benchmarked as low, standard or high risk under an implementing act of 22 May 2025.

What changes in the data model:

- **The plot is the unit of origin.** A lot of cocoa beans links to the plots it came from, as coordinates or polygons ([Coordinates & Geometry](/docs/fundamentals/coordinates-and-geometry#coordinates-datum-order-and-precision)), and a lot made from several suppliers' beans links to all of theirs. Mixing a non-compliant lot into a compliant one taints the output, so the genealogy of [Lot & Serial Traceability](/books/logistics/lot-traceability#how-to-build-it) is what proves a chocolate lot's statement.
- **The statement is a document with an identifier** in the Information System, kept with the lots it covers; my default is to carry that identifier onto the entry line of every import it covers, so a customs query finds it.
- **Plots may be personal data.** A smallholder's farm boundary identifies a person's land, so plot geometries are access-controlled and shared only as the regulation requires.

## Product Passports

### The ESPR Passport

The Ecodesign for Sustainable Products Regulation, (EU) 2024/1781, is the legal basis for the digital product passport, "a digital container for products, components, and materials" (European Commission). The EU's DPP Registry "becomes operational" on 20 July 2026, and the Commission announced that day that it "is now live." The Registry "will store the unique identifiers for each product" with mandatory registration data and generates a unique identifier for each DPP; the complete product information is held by the economic operator or a DPP service provider, not in the Registry; a data carrier such as a QR code links the physical product to its passport; and for imports the registration identifier "can be checked at customs," while EU-made products are registered before they are placed on the market. Product groups come by delegated act: the Commission's indicative timeline lists iron and steel for adoption in Q4 2026, textiles, aluminium and tyres in Q3 to Q4 2027, furniture in 2028, and a delegated act on DPP service providers in Q2 to Q3 2027.

### The Battery Passport

Batteries come first. The Commission's DPP page dates the battery passport to 18 February 2027 for "certain types of batteries," including electric vehicle, light means of transport and industrial batteries; the German-funded Battery Pass project, which concluded in March 2025, describes the scope as EV, LMT and industrial batteries above 2 kWh placed on the EU market, and its content guidance as "80+ data points" from material sourcing and circularity to performance, durability and carbon footprint. The passport's requirements are in Article 77 of Regulation (EU) 2023/1542, which EUR-Lex didn't return to this tool; the date and scope here are from the Commission's and the project's pages.

A passport is a published, versioned record with three parts the system owns: the identifier (registered, unique, permanent), the data carrier printed or attached at the plant (a QR code that resolves to the passport), and the data, which changes over the product's life (state of health for a battery, repairs, a change of economic operator) while earlier versions stay readable. Serialized batteries map to `serialized_units` from [Lot & Serial Traceability](/books/logistics/lot-traceability#how-to-build-it); materials and carbon footprint come from the bill of materials and supplier declarations, the same upstream collection as CBAM and Form SD.

## Conflict Minerals

Rule 13p-1 requires every registrant that files reports under Sections 13(a) or 15(d) of the Exchange Act, and for which conflict minerals are "necessary to the functionality or production of a product" it manufactures or contracts to have manufactured, to file Form SD, "due annually on May 31 for the prior calendar year" and covering a calendar year regardless of the registrant's fiscal year. Conflict minerals are columbite-tantalite (coltan), cassiterite, gold, wolframite, and their derivatives tantalum, tin and tungsten (3TG). The registrant conducts in good faith a "reasonable country of origin inquiry" designed to determine whether the minerals came from the Democratic Republic of the Congo or an adjoining country or from recycled or scrap sources. Where they may have, it exercises due diligence that conforms to "a nationally or internationally recognized due diligence framework" and files a Conflict Minerals Report describing the products, "the facilities used to process the necessary conflict minerals" (the smelters and refiners), the country of origin and the efforts to find the mine. The form also requires an independent private sector audit of that report. After a court of appeals decision on the rule, the SEC's Division of Corporation Finance has said (April 7, 2017) that it "will not recommend enforcement action" against companies that file only under paragraphs (a) and (b) of Item 1.01, the country of origin inquiry and its disclosure, which is why most filings stop there.

The inquiry runs on the Responsible Minerals Initiative's Conflict Minerals Reporting Template (CMRT), "a free, standardized reporting template" that passes mineral country of origin and the smelters and refiners used up the supply chain, and helps identify smelters that could undergo an RMAP assessment; RMI publishes sibling templates (EMRT, AMRT) for other minerals. A manufacturer sends the template to each direct supplier yearly, receives a spreadsheet back, and rolls up the smelter lists into its own. The system's job is the campaign: who was asked, who answered, whether the answer covers the company or only the products bought, which smelters each named, and how each smelter's status was checked. It is the same supplier-tier evidence model as UFLPA tracing ([Forced Labor & Partner Agencies](/books/logistics/forced-labor-and-partner-agencies#the-package-tracing-to-raw-materials)), with a yearly cycle and a smelter list in place of lot documents.

## US Climate Disclosure

The SEC adopted climate disclosure rules covering climate-related risks and greenhouse gas emissions, stayed their effectiveness pending litigation, and on March 27, 2025 voted to end its defense of them, telling the Eighth Circuit in *Iowa v. SEC* (No. 24-1522) that it withdrew its defense and no longer authorized counsel to argue its brief. On September 12, 2025 the court held the consolidated petitions in abeyance "until such time as the . . . Commission reconsiders the challenged Final Rules by notice-and-comment rulemaking or renews its defense," without ruling on the merits. On June 3, 2026 the SEC proposed rescinding the rules (Release No. 33-11421, 91 FR 33296), with comments due August 3, 2026. As of November 2026 the Federal Register shows no final rescission, so the rules remain adopted, stayed and undefended.

California's rules are the ones with dates. The California Air Resources Board's program page describes SB 253 as requiring entities with revenue over $1 billion doing business in California to disclose Scope 1, 2 and 3 emissions annually, and SB 261 as requiring companies over $500 million to publish "biennial climate-related financial risk reports." As of November 22, 2026, after that date has passed, CARB's page still says it "is updating its regulatory proposal" to move the first Scope 1 and 2 reporting deadline "from August 10, 2026, to November 10, 2026," with the initial regulation (Title 17, CCR, sections 96070 to 96077) applying "if approved by the Office of Administrative Law"; the page gives no Scope 3 deadline. SB 261 is enjoined: CARB's enforcement advisory of December 1, 2025 says the Ninth Circuit, in *Chamber of Commerce v. Sanchez* (No. 25-5327), granted "an injunction against the enforcement of Senate Bill (SB) 261" while the appeal is pending, that CARB "will not enforce" the January 1, 2026 statutory deadline, and that it will give an alternate reporting date "after the appeal is resolved"; CARB's page announces no such date as of November 22, 2026. <!-- source-gap: logistics-supply-chain-sustainability-california | status | whether CARB's November 10, 2026 Scope 1 and 2 deadline was finalized and approved by OAL, the first Scope 3 deadline, and whether the Ninth Circuit has decided Chamber of Commerce v. Sanchez (No. 25-5327, argued January 9, 2026) | closes with: an OAL approval notice, CARB's final regulation text, and the Ninth Circuit's decision or docket | checked: 2026-11-22 --> For a logistics system the practical effect is the same either way: large customers will ask for Category 4 data per load and per lane, with its method, on their reporting calendar.

## How to Build It

Seven tables and three alterations: versioned emission factors; emissions per transport chain element, allocated to shipments; product passports and their versions; EUDR statements and the lots they cover; CBAM data per EU entry line; and conflict minerals inquiries with their smelters. `loads` gains the measured energy that makes a row primary, and `items` the classifications that decide which regime applies. This chapter doesn't add document kinds; statements, passports and CMRT responses are stored as `documents` of kind `'other'` until a later chapter needs to query them by kind.

```sql
-- A published or declared intensity, as its source publishes it. Never edited; superseded.
CREATE TABLE emission_factors (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  source         TEXT NOT NULL CHECK (source IN ('glec', 'carrier_declared', 'cbam_default',
                   'national_inventory', 'vendor_model', 'other')),
  source_version TEXT NOT NULL,          -- 'GLEC v3.2', the carrier's declaration year
  carrier_party_id UUID REFERENCES parties (id),  -- for a carrier's own fleet intensity
  mode           TEXT NOT NULL CHECK (mode IN ('road', 'rail', 'sea', 'air',
                   'inland_waterways', 'hub', 'fuel', 'electricity', 'product')),
  vehicle_class  TEXT,                   -- '40t articulated', 'container ship 8000 TEU'
  energy_carrier TEXT,                   -- 'diesel', 'hvo', 'electricity', 'lng'
  region         TEXT,                   -- ISO country or a source's region code
  part           TEXT NOT NULL CHECK (part IN ('operation', 'energy_provision', 'total')),
  unit           TEXT NOT NULL CHECK (unit IN ('mg_per_tkm', 'mg_per_tonne_handled',
                   'mg_per_litre', 'mg_per_kwh', 'g_per_tonne_product')),
  value          BIGINT NOT NULL CHECK (value >= 0),
  gwp_basis      TEXT NOT NULL,          -- e.g. 'ipcc_ar6_gwp100'
  valid_during   DATERANGE NOT NULL,
  document_id    UUID REFERENCES documents (id)  -- the publication or declaration
);

-- Emissions for one transport chain element, for the vehicle or allocated to a shipment.
CREATE TABLE transport_emissions (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  element            TEXT NOT NULL CHECK (element IN ('leg', 'hub')),
  load_id            UUID REFERENCES loads (id),       -- the leg
  facility_id        UUID REFERENCES facilities (id),  -- the hub
  shipment_id        UUID REFERENCES shipments (id),   -- null: the whole vehicle or hub total
  parent_id          UUID REFERENCES transport_emissions (id),  -- the total it was allocated from
  mode               TEXT NOT NULL,
  mass_kg            BIGINT CHECK (mass_kg > 0),
  distance_m         BIGINT CHECK (distance_m >= 0),
  distance_basis     TEXT CHECK (distance_basis IN ('shortest_feasible', 'great_circle',
                       'actual', 'planned')),
  method             TEXT NOT NULL CHECK (method IN ('fuel_based', 'distance_based',
                       'spend_based')),
  data_quality       TEXT NOT NULL CHECK (data_quality IN ('primary', 'modeled', 'default')),
  operation_g        BIGINT NOT NULL CHECK (operation_g >= 0),         -- tank-to-wheel
  energy_provision_g BIGINT NOT NULL CHECK (energy_provision_g >= 0),  -- well-to-tank
  total_g            BIGINT GENERATED ALWAYS AS (operation_g + energy_provision_g) STORED,
  factor_ids         UUID[] NOT NULL DEFAULT '{}',  -- every emission_factors row used
  allocation_basis   TEXT CHECK (allocation_basis IN ('mass', 'volume', 'tonne_km')),
  calc_version       TEXT NOT NULL,      -- the code and parameters that produced it
  calculated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  superseded_at      TIMESTAMPTZ,        -- a recalculation adds rows and retires these
  CHECK ((element = 'leg') = (load_id IS NOT NULL)),
  CHECK ((element = 'hub') = (facility_id IS NOT NULL)),
  CHECK (parent_id IS NULL OR (shipment_id IS NOT NULL AND allocation_basis IS NOT NULL))
);
CREATE INDEX ON transport_emissions (shipment_id) WHERE superseded_at IS NULL;
CREATE INDEX ON transport_emissions (load_id) WHERE superseded_at IS NULL;

-- A product passport: identity, carrier and where its data lives.
CREATE TABLE product_passports (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  regime             TEXT NOT NULL CHECK (regime IN ('eu_battery', 'eu_espr')),
  product_group      TEXT NOT NULL,       -- 'ev_battery', 'lmt_battery', 'industrial_battery',
                                          -- 'iron_steel', as the delegated act names it
  item_id            UUID NOT NULL REFERENCES items (id),
  lot_id             UUID REFERENCES lots (id),
  serialized_unit_id UUID REFERENCES serialized_units (id),
  grain              TEXT NOT NULL CHECK (grain IN ('model', 'batch', 'item')),
  unique_identifier  TEXT NOT NULL UNIQUE,  -- as registered; permanent
  registry_ref       TEXT,                  -- the EU DPP Registry's registration
  data_carrier       TEXT NOT NULL CHECK (data_carrier IN ('qr_code', 'data_matrix', 'rfid',
                       'nfc')),
  resolver_url       TEXT NOT NULL,         -- what the carrier encodes
  hosted_by_party_id UUID REFERENCES parties (id),  -- the operator or its DPP service provider
  status             TEXT NOT NULL CHECK (status IN ('draft', 'registered', 'published',
                       'archived')),
  placed_on_market_at TIMESTAMPTZ,
  CHECK ((grain = 'model' AND lot_id IS NULL AND serialized_unit_id IS NULL)
      OR (grain = 'batch' AND lot_id IS NOT NULL AND serialized_unit_id IS NULL)
      OR (grain = 'item' AND serialized_unit_id IS NOT NULL))
);

CREATE TABLE product_passport_versions (  -- every published state stays readable
  passport_id  UUID NOT NULL REFERENCES product_passports (id),
  version      INT NOT NULL CHECK (version > 0),
  data         JSONB NOT NULL,            -- the attributes as published, not as now
  reason       TEXT NOT NULL,             -- 'initial', 'state_of_health', 'repair', 'operator_change'
  published_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (passport_id, version)
);

-- An EUDR due diligence statement and the plots behind it.
CREATE TABLE eudr_due_diligence_statements (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  operator_party_id     UUID NOT NULL REFERENCES parties (id),
  role                  TEXT NOT NULL CHECK (role IN ('operator', 'trader')),
  commodity             TEXT NOT NULL CHECK (commodity IN ('cattle', 'cocoa', 'coffee',
                          'oil_palm', 'rubber', 'soya', 'wood')),
  hs_code               TEXT NOT NULL,
  quantity_kg           BIGINT NOT NULL CHECK (quantity_kg > 0),
  production_country    CHAR(2) NOT NULL,
  country_risk          TEXT CHECK (country_risk IN ('low', 'standard', 'high')),
  plots                 JSONB NOT NULL,     -- GeoJSON FeatureCollection; access-controlled
  plot_count            INT NOT NULL CHECK (plot_count > 0),
  risk_conclusion       TEXT NOT NULL CHECK (risk_conclusion IN ('negligible', 'mitigated',
                          'not_negligible')),
  system_ref            TEXT,               -- the statement's identifier in the Information System
  submitted_at          TIMESTAMPTZ,
  document_id           UUID REFERENCES documents (id),
  status                TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'withdrawn',
                          'amended')),
  CHECK (status = 'draft' OR system_ref IS NOT NULL)
);

CREATE TABLE eudr_statement_lots (
  statement_id          UUID NOT NULL REFERENCES eudr_due_diligence_statements (id),
  lot_id                UUID NOT NULL REFERENCES lots (id),
  customs_entry_line_id UUID REFERENCES customs_entry_lines (id),  -- where it was referenced
  quantity_kg           BIGINT NOT NULL CHECK (quantity_kg > 0),
  PRIMARY KEY (statement_id, lot_id)
);

-- CBAM facts for one EU import line.
CREATE TABLE cbam_import_lines (
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  customs_entry_line_id  UUID NOT NULL UNIQUE REFERENCES customs_entry_lines (id),
  declarant_party_id     UUID NOT NULL REFERENCES parties (id),
  goods_category         TEXT NOT NULL CHECK (goods_category IN ('cement', 'iron_steel',
                           'aluminium', 'fertilisers', 'electricity', 'hydrogen')),
  cn_code                TEXT NOT NULL,
  net_mass_kg            BIGINT NOT NULL CHECK (net_mass_kg >= 0),
  installation_ref       TEXT,             -- the producing installation, as the supplier states it
  lot_id                 UUID REFERENCES lots (id),
  emissions_basis        TEXT NOT NULL CHECK (emissions_basis IN ('actual', 'default')),
  embedded_g_per_tonne   BIGINT NOT NULL CHECK (embedded_g_per_tonne >= 0),
  embedded_g             BIGINT NOT NULL CHECK (embedded_g >= 0),  -- mass times intensity, once
  factor_id              UUID REFERENCES emission_factors (id),   -- the default value used
  verification_doc_id    UUID REFERENCES documents (id),          -- for actual values
  carbon_price_paid      BIGINT CHECK (carbon_price_paid >= 0),   -- minor units, at origin
  currency               CHAR(3),
  carbon_price_doc_id    UUID REFERENCES documents (id),
  declaration_year       SMALLINT NOT NULL,
  CHECK (emissions_basis = 'default' OR verification_doc_id IS NOT NULL),
  CHECK (carbon_price_paid IS NULL OR (currency IS NOT NULL AND carbon_price_doc_id IS NOT NULL))
);

-- One supplier's conflict minerals answer for one reporting year.
CREATE TABLE conflict_minerals_inquiries (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  supplier_party_id UUID NOT NULL REFERENCES parties (id),
  reporting_year    SMALLINT NOT NULL,
  template          TEXT NOT NULL CHECK (template IN ('cmrt', 'emrt', 'amrt')),
  template_version  TEXT,                 -- as stated in the returned file
  declaration_scope TEXT CHECK (declaration_scope IN ('company', 'product', 'user_defined')),
  requested_at      TIMESTAMPTZ NOT NULL,
  received_at       TIMESTAMPTZ,
  document_id       UUID REFERENCES documents (id),  -- the spreadsheet as received
  status            TEXT NOT NULL CHECK (status IN ('requested', 'received', 'incomplete',
                      'accepted', 'escalated')),
  UNIQUE (supplier_party_id, reporting_year, template)
);

CREATE TABLE conflict_minerals_smelters (  -- each smelter or refiner a response names
  inquiry_id        UUID NOT NULL REFERENCES conflict_minerals_inquiries (id),
  metal             TEXT NOT NULL CHECK (metal IN ('tin', 'tantalum', 'tungsten', 'gold')),
  smelter_ref       TEXT NOT NULL,        -- the identifier as the template lists it
  smelter_name      TEXT NOT NULL,
  country           CHAR(2),
  assessment_status TEXT,                 -- as checked against RMI's lists, with the date
  checked_at        TIMESTAMPTZ,
  PRIMARY KEY (inquiry_id, metal, smelter_ref)
);

-- Measured energy on the load makes its emissions primary; NOT VALID checks new rows only.
ALTER TABLE loads
  ADD COLUMN fuel_used_ml      BIGINT,
  ADD COLUMN fuel_kind         TEXT,      -- 'diesel', 'hvo', 'cng', 'lng', 'jet_a', 'vlsfo'
  ADD COLUMN electricity_wh    BIGINT,
  ADD COLUMN actual_distance_m BIGINT,
  ADD COLUMN energy_source     TEXT,      -- 'eld', 'telematics', 'fuel_card', 'carrier_report'
  ADD CONSTRAINT loads_energy_check CHECK (fuel_used_ml IS NULL OR fuel_kind IS NOT NULL)
    NOT VALID;

-- Which regimes an item falls under, set by review, not inferred at filing time.
ALTER TABLE items
  ADD COLUMN cbam_cn_code      TEXT,
  ADD COLUMN eudr_commodity    TEXT,
  ADD COLUMN conflict_minerals TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN passport_group    TEXT,      -- the product group whose act requires a passport
  ADD CONSTRAINT items_eudr_commodity_check CHECK (eudr_commodity IN ('cattle', 'cocoa',
    'coffee', 'oil_palm', 'rubber', 'soya', 'wood')) NOT VALID,
  ADD CONSTRAINT items_conflict_minerals_check CHECK (conflict_minerals <@
    ARRAY['tin', 'tantalum', 'tungsten', 'gold']::TEXT[]) NOT VALID;

ALTER TABLE loads VALIDATE CONSTRAINT loads_energy_check;
ALTER TABLE items VALIDATE CONSTRAINT items_eudr_commodity_check;
ALTER TABLE items VALIDATE CONSTRAINT items_conflict_minerals_check;
```

A customer's Category 4 report is then a sum over current allocated rows for its shipments, with the share that is primary, because a customer reporting under any of the regimes above will be asked how much of its number was measured:

```sql
SELECT s.bill_to_party_id                                           AS customer,
       date_trunc('quarter', p.picked_up_at)                        AS quarter,
       sum(e.total_g)                                               AS total_g,
       sum(e.total_g) FILTER (WHERE e.data_quality = 'primary')     AS primary_g,
       round(100.0 * sum(e.total_g) FILTER (WHERE e.data_quality = 'primary')
             / nullif(sum(e.total_g), 0), 1)                        AS primary_pct
FROM transport_emissions e
JOIN shipments s ON s.id = e.shipment_id
CROSS JOIN LATERAL (                          -- legs and hubs both count from first pickup
  SELECT min(st.departed_at) AS picked_up_at
  FROM stop_shipments ss
  JOIN stops st ON st.id = ss.stop_id
  WHERE ss.shipment_id = s.id AND ss.action = 'pick'
) p
WHERE e.superseded_at IS NULL
  AND s.bill_to_party_id = $1
GROUP BY 1, 2
ORDER BY 2;
```

The CBAM threshold is a running sum per declarant and year, checked before an import is booked, not after the declaration:

```sql
SELECT declarant_party_id, declaration_year, sum(net_mass_kg) AS mass_kg,
       sum(net_mass_kg) > 50000 AS above_threshold   -- the 50-tonne mass threshold
FROM cbam_import_lines
WHERE declaration_year = $1
GROUP BY declarant_party_id, declaration_year;
```

In production the threshold and the goods list come from a dated rules table, not a literal ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored) for the reporting dates alike).

Design notes:

- **Emissions are calculated, so they're recalculated.** A carrier's fuel report arrives after the default estimate; a factor set is revised. A recalculation writes new rows and retires the old ones with `superseded_at`, and a report already sent to a customer keeps pointing at the rows it used ([Recorded Time and Corrections](/docs/database/temporal-data#recorded-time-and-corrections)).
- **The vehicle's total is a row; the allocations are its children.** `parent_id` links each shipment's share to the trip total it came from, and the allocations sum to the parent exactly, by the largest remainder rule above.
- **Factor identity, not factor values, on each row.** `factor_ids` points at immutable factor rows; nothing copies a number out of a factor table without the reference.
- **Passports are published versions.** The identifier and data carrier never change; the data does, by new version rows, and the resolver serves the current one while archived versions stay retrievable.
- **Upstream data is a campaign.** CMRT requests, CBAM installation data and EUDR plot data are each requested from suppliers on a schedule, tracked to an answer, validated and escalated, with the supplier's document kept as received ([An Import Is a Batch With Stages](/docs/building-blocks/imports-and-exports#an-import-is-a-batch-with-stages)).
- **Geolocation is evidence and possibly personal data.** Plot geometries are stored once per plot, shared only with the statement, and access-logged.

## Auditing

- **Every emissions figure:** element, mass, distance and its basis, method, data quality, each factor with its source and version, the calculation version, and the parent total for allocated rows; superseded rows kept.
- **Every factor:** as published or declared, with validity and the document behind it; a carrier's declared intensity with the declaration.
- **Every report sent:** to a customer, under Form SD, under CBAM, under EUDR, with the rows it summed and the document as filed.
- **Every supplier answer:** CMRT spreadsheets as received, smelter lists and the status checks run on each smelter with dates; installation data and verification documents for CBAM actual values; plot data and the source for EUDR.
- **Every passport version:** identifier, carrier, the data as published with its time, and the registry registration.
- **Item classifications:** who set an item's CN code, EUDR commodity, conflict minerals and passport group, when, and on what review.

The mechanics (typed actors, append-only history, tamper evidence) are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Store emissions per transport chain element,** legs and hubs, with operation and energy provision separately, and allocate to shipments by mass or tonne-kilometers in integer grams that sum exactly.
- **Record method and data quality on every figure,** and report the primary share, because measured fuel and default factors aren't the same claim.
- **Keep emission factors as immutable, versioned reference rows** and point at them; recalculate by adding rows, never by editing.
- **Put measured fuel and energy on the load** when an ELD, telematics or the carrier provides it; it turns a default estimate into primary data.
- **Classify items for CBAM, EUDR, conflict minerals and passports by review,** and carry the classification to lots and entry lines before goods ship.
- **Track the CBAM 50-tonne threshold as a running sum** per declarant and year, and collect installation emissions from suppliers as lot data.
- **Link EUDR statements to lots and plots,** and let the lot genealogy prove that a mixed lot's inputs are all covered.
- **Model passports as permanent identifiers with versioned data** at the grain the product group requires.
- **Run supplier data collection as yearly campaigns** with requests, answers, validation and escalation, reusing the supplier tiers built for forced labor tracing.

## References

**Standards and guidance**

- [GHG Protocol: Technical Guidance for Calculating Scope 3 Emissions, Category 4](https://ghgprotocol.org/sites/default/files/2022-12/Chapter4.pdf), Category 4 and Category 9 boundaries, carriers' scope 1 and 2 as Category 4, fuel-based, distance-based and spend-based methods, the distance-based formula, and allocation by limiting factor per mode
- [Climatiq: ISO 14083 methodology (v3.1)](https://www.climatiq.io/docs/guides/working-with-climatiq-data/compliance-and-certifications/iso-14083/iso-14083-v3.1), transport chain elements as legs and hubs, hubs at mode changes, great circle and shortest feasible distance, energy provision included, GLEC default factors, primary fuel data and GLEC meeting the ISO standard
- [Climatiq: Intermodal freight API v3.1](https://www.climatiq.io/docs/api-reference/intermodal-freight/intermodal-freight-v3.1), the route of locations and legs, transport modes, and the operation, energy provision and hub emission fields

**European Union**

- [European Commission: Carbon Border Adjustment Mechanism](https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en), the 2023 to 2025 transitional phase and the definitive regime from 1 January 2026
- [European Commission: CBAM definitive regime](https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism/cbam-definitive-regime_en), covered goods, the 50-tonne threshold, authorised CBAM declarants, annual declaration and surrender, certificate pricing and deduction of a carbon price paid
- [European Commission: Price of CBAM certificates](https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism/price-cbam-certificates_en), purchases on the central platform from February 2027, quarterly 2026 prices and their publication, weekly prices from 2027
- [European Commission: CBAM legislation and guidance](https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism/cbam-legislation-and-guidance_en), Regulation (EU) 2023/956, the amending Regulation (EU) 2025/2083 and the implementing acts
- [European Commission: Regulation on deforestation-free products](https://environment.ec.europa.eu/topics/forests/deforestation/regulation-deforestation-free-products_en), commodities, the 31 December 2020 cut-off, the 2026 and 2027 application dates, the September 2026 delegated act on added products, statements with plot geolocation, the TRACES Information System, amendments, the May 2026 review and country benchmarking
- [European Commission: Digital Product Passport](https://single-market-economy.ec.europa.eu/single-market/digital-product-passport_en), the ESPR legal basis, the DPP Registry going live on 20 July 2026, unique identifiers, data carriers, customs checks, the battery passport date and the delegated act timeline
- [Battery Pass project](https://thebatterypass.eu/), the 18 February 2027 date, EV, LMT and industrial batteries above 2 kWh, 80+ data points and the project's funding and end

**United States**

- [17 CFR 240.13p-1 (Cornell LII)](https://www.law.cornell.edu/cfr/text/17/240.13p-1), who must file Form SD and the "necessary to the functionality or production" test
- [SEC: Form SD](https://www.sec.gov/files/formsd.pdf), the May 31 deadline, the calendar-year basis, the minerals defined, the country of origin inquiry, due diligence, the Conflict Minerals Report, processing facilities and the independent private sector audit
- [SEC Division of Corporation Finance: Updated Statement on the Effect of the Court of Appeals Decision on the Conflict Minerals Rule (April 7, 2017)](https://www.sec.gov/news/public-statement/corpfin-updated-statement-court-decision-conflict-minerals-rule), no enforcement recommendation for filings under Item 1.01(a) and (b) only
- [SEC: SEC Votes to End Defense of Climate Disclosure Rules (March 27, 2025)](https://www.sec.gov/newsroom/press-releases/2025-58), the vote, the stay and Iowa v. SEC in the Eighth Circuit
- [Federal Register: Rescission of Climate-Related Disclosure Rules (91 FR 33296, June 3, 2026)](https://www.federalregister.gov/documents/full_text/html/2026/06/03/2026-11091.html), the proposed rescission, the August 3, 2026 comment deadline, the Eighth Circuit's September 12, 2025 abeyance order and the rules remaining stayed
- [Federal Register: climate disclosure rule documents](https://www.federalregister.gov/api/v1/documents.json?conditions[term]=%22Enhancement+and+Standardization+of+Climate-Related+Disclosures%22&order=newest&per_page=10), the 2024 rules and stay, and no final rescission as of November 2026
- [California Air Resources Board: Corporate GHG reporting and climate-related financial risk](https://ww2.arb.ca.gov/our-work/programs/california-corporate-greenhouse-gas-reporting-and-climate-related-financial-risk), SB 253 and SB 261 thresholds, the proposed deferral to November 10, 2026, the initial regulation pending OAL approval and the SB 261 enforcement advisory listing
- [California Air Resources Board: SB 261 Enforcement Advisory (December 1, 2025)](https://ww2.arb.ca.gov/sites/default/files/2025-12/Dec%201%20SB%20261%20Enforcement%20Advisory.pdf), the Ninth Circuit's November 18, 2025 injunction in Chamber of Commerce v. Sanchez (No. 25-5327), the January 9, 2026 argument and CARB's non-enforcement of the January 1, 2026 deadline

**Industry**

- [Responsible Minerals Initiative: Conflict Minerals Reporting Template](https://www.responsiblemineralsinitiative.org/reporting-templates/cmrt/), the CMRT as a free standardized template for country of origin and smelters, RMAP assessments, and the EMRT and AMRT
