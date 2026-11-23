+++
title = "Fuel, Tolls & Fuel Cards"
description = "Fleet fuel cards and their controls, fuel on settlements, the IFTA quarterly return, IRP apportioned plates, the heavy vehicle use tax, and tolls."
category = "Logistics & Supply Chain Industry"
order = 2846
part = "Freight Money"
tags = ["logistics", "fuel-cards", "ifta", "irp", "tolls", "fuel-tax", "trucking", "data-model"]
+++

Fuel is one of the largest bills a truckload carrier pays, and it comes with taxes that follow the truck across borders. A tractor that fills up in Texas and burns the fuel in Pennsylvania has paid Texas tax on fuel Pennsylvania is owed, so every interstate carrier files a quarterly fuel tax return that moves the tax between jurisdictions according to where its trucks actually drove. The same trucks carry one set of license plates paid for by the same distances, a federal use tax by weight, and transponders billed by many toll agencies. A fleet card ties most of it together: it pays at the pump, records which driver, truck and odometer reading, and produces the transaction file the fuel tax return and the owner-operator's settlement both read.

It is hard because the records come from different systems and must agree. The fuel card processor knows gallons, prices and the station; the ELD knows miles by jurisdiction; the dispatch system knows which load and which owner-operator the truck was serving; the toll provider knows plates and plazas, sometimes weeks later. The tax return is computed from all of them, an auditor can ask for every trip and receipt four years on, and a missing or altered receipt loses the credit for the tax already paid. A card that pumps reefer fuel or a pickup's gasoline onto the tractor's account is both a cost leak and a tax error.

This chapter covers fleet fuel cards (how they work, the controls and prompts, the networks and how issuers earn, fraud and misuse), fuel as a cost line and a settlement deduction, the International Fuel Tax Agreement (IFTA) and its quarterly return with a worked calculation, apportioned registration under the International Registration Plan (IRP), the heavy vehicle use tax, and tolls. It extends `freight_charges`, `equipment_units` and `drivers` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model). What a carrier charges its customer for fuel, the surcharge schedule on the EIA diesel index, is [Rating, Tariffs & Accessorials](/books/logistics/rating-and-accessorials#fuel-surcharges) and isn't repeated here. Settlements and the dispatch legs that carry driver and tractor are [Carrier Dispatch & Asset Management](/books/logistics/carrier-operations#settlements); operating authority and UCR are [Operating Authority & Registration](/books/logistics/operating-authority#who-needs-what). The card as credit is the Banking volume's [Commercial Card Types](/books/banking-and-lending/corporate-cards#commercial-card-types), and the issuing stack is the Payments volume's [Commercial and Virtual Cards](/books/payments/card-issuing#commercial-and-virtual-cards).

## How the Platforms Do It

As of November 2026, from annual reports, vendor documentation and program pages:

| Company | What it is | What it provides | What a carrier's system gets |
| --- | --- | --- | --- |
| **Bestpass** | Toll aggregator for fleets | Coverage for "100 percent of major U.S. toll roads," toll-by-plate on every plan, one account and one monthly statement | A consolidated toll file per plate or device |
| **Comdata** (Corpay) | Fleet fuel card and driver funds | Acceptance at chains including Pilot, Flying J, Love's and TA Petro; spend controls; OneClick, which leaves the card locked until the driver unlocks it to fuel; Comchek for sending drivers funds; IFTA and permit services | Transactions, advances and lumper receipts |
| **Corpay** | Parent of Comdata; Vehicle Payments segment | Proprietary and third-party networks; Sem Parar RFID toll tags in Brazil at about 8,300 merchant locations; about 8% of 2025 revenue "directly influenced by the absolute price of fuel," and further revenue from fuel price spreads | Card data and controls; toll tags outside the US |
| **E-ZPass Group** | Interoperability association of toll agencies | Toll entities "stretching across 20 states" and "over 64 million E-ZPass devices in circulation"; holds no customer accounts | Nothing directly: accounts sit with member agencies or an aggregator |
| **Motive** | ELD and fleet platform | `GET /v1/ifta/trips` returns trip records by date and jurisdiction with distance and start and end odometer; fuel purchases arrive from integrated fuel cards, manual entry or CSV import | Jurisdiction mileage and fuel purchases by vehicle |
| **PrePass** | Weigh station bypass and tolling | PrePass Plus combines "bypassing, toll payments, reconciliation" | Toll transactions bundled with bypass |
| **Samsara** | ELD and fleet platform | `GET /fleet/reports/ifta/jurisdiction` by year and month or quarter returns `taxableMeters`, `totalMeters` and `taxPaidLiters` per jurisdiction, plus counts of purchases and vehicles missing a fuel type; the latest 72 hours may still change | Jurisdiction mileage and tax-paid fuel in metric units |
| **WEX** (EFS, Fleet One) | Fleet card issuer and closed-loop network | A network covering "more than 90 percent" of U.S. fuel locations; captures amount, driver, vehicle and odometer; EFS cards accepted at 12,000+ truck stops, real-time limits per card, custom prompts, MoneyCodes | Transactions with prompt data; Mobility revenue of $1,386.0 million on 546.1 million transactions in 2025 |

Four patterns:

- **The issuer is paid by the merchant, the customer or the spread.** WEX records a net payment processing rate of 1.32% of fuel spend from merchants in 2025 (net of customer discounts and network fees) (on an average U.S. fuel price of $3.32 a gallon in its data) and says over-the-road customers pay "a flat fee derived from each fuel purchase transaction"; Corpay earns some revenue as a percentage of the purchase and some from the spread between the price charged and the merchant's cost. Fuel price moves revenue in every model, which is why both report it as a risk.
- **The card is a data capture device.** Both large issuers sell the transaction record (driver, vehicle, odometer, product, location) as much as the payment, and the ELD vendors consume it to compute tax-paid fuel.
- **IFTA mileage comes from the ELD.** Samsara and Motive both expose jurisdiction distance by vehicle and period as a product, which is the trip record a carrier used to keep by hand.
- **Tolls are aggregated.** Toll agencies are many and interoperable only in groups; fleets buy one account from an aggregator or a card company and reconcile one statement.

## Fuel Cards

### How a Fleet Card Works

A fleet card is a commercial charge card the carrier's account pays, issued per driver, per truck or both. On a closed network (WEX's proprietary network, EFS, Comdata's network) the issuer also runs the acceptance side at the merchant; on an open network card (a Fleet Mastercard or Visa Fleet) the transaction rides the card network and acceptance is wider. At a pump the transaction starts as an authorization for an estimate and finishes with the pumped amount, and the card networks set how large that first hold may be for a fleet card ([Partial Approvals, Holds and Changing Amounts](/books/payments/issuer-processing#partial-approvals-holds-and-changing-amounts)). The carrier receives a posted transaction with gallons, unit price, product, station and the prompt answers, usually a day later in a file or by API, and pays the issuer on the account's billing cycle.

### Controls and Prompts

The controls are what make the card a fleet product rather than a credit card. EFS lets a fleet "Set purchase limits in real-time, down to the individual card level" and validate purchases with custom prompts; Corpay describes "customizable user-level controls, programmable alerts and detailed transaction reporting"; Comdata's OneClick keeps the card locked until the driver unlocks it. In practice a card program combines:

- **Product restrictions:** tractor diesel only, or diesel plus DEF, or reefer fuel as a separate product, with non-fuel purchases (oil, repairs, scales) allowed by category.
- **Prompts at the pump:** a driver ID, a unit number, a trip or load number, and an odometer or hubodometer reading; WEX lists "the driver, the vehicle, the odometer reading" among the data it captures.
- **Limits:** gallons per transaction (sized to the tank), dollars per day, transactions per day, and sometimes time-of-day or location rules.
- **Unlock and alerts:** a card locked by default and opened from an app, and an alert on every declined or unusual purchase.

These are issuer-side spend controls evaluated during authorization ([Spend Controls](/books/payments/issuer-processing#spend-controls)); the carrier's system owns the policy and pushes it to the issuer, and keeps a copy of what was in force on each date so that an audit of a disputed purchase can say which rule allowed it.

### Networks, Pricing and Rebates

Fuel is bought at three kinds of price: the pump (retail) price, a discount off it negotiated by the fleet or its card program, and a price set from the merchant's cost. Corpay says it "can also deliver fuel price savings to our business customers when compared to the retail price of fuel"; Comdata's Mastercard lets holders "Get cash price at majority of network stops"; the card programs of large fleets typically negotiate per-chain pricing. The system's job is to store what was actually charged per gallon next to the pump price where the merchant reports both, so discount reporting reads the records rather than the contract. Rebates paid back to the fleet later are their own entries against the account, never a change to the posted transactions. Line-item data on a fuel card works like Level 3 data on a purchasing card ([Level 2 and Level 3 Data](/books/payments/interchange-and-pricing#level-2-and-level-3-data)): the product code and quantity are what make the transaction usable for tax and cost accounting.

### Fraud and Misuse

Fuel card losses come in three shapes: stolen card data (skimmed at the pump or phished from a driver) used at another pump; a legitimate driver buying fuel for a vehicle that isn't the tractor (a personal pickup, another truck, jugs for resale); and fuel bought as the wrong product, such as reefer fuel pumped into the tractor's tank or the reverse. The first is the issuer's fraud problem; the second and third are the carrier's, and the controls above exist for them. The tax rules turn misuse into a second loss: IFTA allows no "tax-paid credit for any fuel placed into a vehicle other than a qualified motor vehicle" (Procedures Manual P550.210), and only fuel placed in the supply tank used to propel the vehicle is reportable as taxable fuel (Articles of Agreement R820), so reefer fuel must be kept apart on the record.

My rule: compare every transaction with the truck. Gallons above the tank's capacity, an odometer prompt that disagrees with the ECM odometer for that tractor at that time, a station far from the tractor's last ELD position, or two fill-ups closer together than the miles allow are exceptions a reviewer clears, and the ELD data that drives IFTA is the evidence that makes these checks cheap.

## Fuel on the Books and the Settlement

For a company truck, fuel is an operating cost of the carrier, posted from the card file to the general ledger and allocated to the dispatch leg and load that burned it; it is not a `freight_charges` line, because freight charges are what customers and carriers bill each other. Cost per mile by tractor and lane reads the fuel transactions and the leg's miles.

For a leased owner-operator, fuel is usually the lessor's cost paid on the carrier's card. The federal leasing rule requires the lease to "clearly specify the responsibility of each party with respect to the cost of fuel, fuel taxes, empty mileage," tolls and the rest, and to list every item "initially paid for by the authorized carrier, but ultimately deducted from the lessor's compensation," with how each is computed (49 CFR 376.12(e), (h)). Each fuel purchase on the card becomes a chargeback line on the owner-operator's settlement with the transaction as its support document, and a cash advance (an EFS MoneyCode or a Comdata Comchek) becomes an advance line deducted later; the lease terms are in [Owner-Operators and Leases](/books/logistics/truckload#owner-operators-and-leases) and the settlement mechanics in [Settlements](/books/logistics/carrier-operations#settlements). Fuel tax is a lease item too: if the lessor's miles run under the carrier's IFTA license, the carrier files and the lease says whether, and how, the lessor's share of a balance due is charged back.

## IFTA

The International Fuel Tax Agreement lets a carrier license in one jurisdiction and file one quarterly return for all of them. Federal law makes it the only form a state may use: a state may require fuel use tax reporting and payment "only if" the requirement "conforms with the International Fuel Tax Agreement" (49 U.S.C. 31705). A member may be a US state, the District of Columbia, a Canadian province or territory or a Mexican state (the definition of jurisdiction, Articles of Agreement R227); IFTA, Inc.'s rate matrix tracked 58 for the fourth quarter of 2026, 48 US jurisdictions and 10 Canadian provinces. The governing documents (Articles of Agreement, Procedures Manual and Audit Manual) were republished effective August 26, 2026.

### Who Licenses, and Where

A **qualified motor vehicle** is one used, designed or maintained to transport persons or property that has two axles and a gross or registered gross vehicle weight over 26,000 pounds (11,797 kilograms), or three or more axles regardless of weight, or is used in a combination over 26,000 pounds; recreational vehicles are excluded (R245). Any person based in a member jurisdiction operating qualified vehicles in two or more member jurisdictions must license, unless it buys trip permits trip by trip instead (R305, R310).

The **base jurisdiction** is where the vehicles are based for registration, where operational control and records are kept or can be made available, and where some of the fleet's travel happens (R212). The license runs for the calendar year; a copy (paper or an electronic image) must be carried in each vehicle, and the base jurisdiction issues two decals per vehicle, placed on "the exterior portion of both sides of the cab" (R605, R610, R620, R625). Decals are serialized and issued annually (P320), and a temporary decal permit lets a new truck run for 30 days before the decals are on (R263). The system therefore tracks, per tractor and year, the decal serials and where the license copy is.

### Records

The licensee keeps records "to substantiate information reported on the tax returns" (R700) for four years after the return was due or filed, whichever is later, and the burden of proof in an audit is on the licensee (P510, P520). Two kinds of record carry the return:

- **Distance records.** A trip record not produced by a tracking system must show the trip's dates, origin and destination, route, beginning and ending odometer or ECM reading, total distance, distance in each jurisdiction and the vehicle unit number (P540.100). A vehicle tracking system's record must be made at least every 10 minutes while the engine is on, with date and time, latitude and longitude to four decimal places, the ECM odometer and the vehicle number, and be available as a spreadsheet or delimited file, not an image (P540.200).
- **Fuel records.** For tax-paid credit on a retail purchase, the receipt or transaction listing (a card processor's listing counts) must show the date, seller's name and address, quantity, fuel type, price per unit or total, the vehicle it went into, and the purchaser's name; altered or illegible records don't count (P550.200, P550.220, P550.300). Bulk tanks need delivery receipts, quarterly reconciliations per tank, tank capacity and a withdrawal record per fill (P550.400, P550.600).

If the records are inadequate the base jurisdiction assesses by cutting the reported fleet MPG to 4.00 or by 20% (P570.100), which for most fleets is a large bill. That one rule is why the ELD's jurisdiction mileage and the card file are kept as evidence, not as working data.

### The Quarterly Return

Returns are quarterly for the calendar quarters and due "on the last day of the month following the close of the reporting period" (April 30, July 31, October 31 and January 31), the next business day when that falls on a weekend or holiday, and a return is required even for a quarter with no operations (R254, R930.100, R960.100). A licensee with under 5,000 miles a year outside the base jurisdiction may ask to file annually (R930.200). The return carries, at minimum, the total distance in all jurisdictions, total fuel, the **average fuel consumption factor to two decimal places**, and for each jurisdiction the tax rate, total and taxable miles, taxable gallons, tax-paid gallons, net taxable gallons, tax and interest, "with rounding provided to the nearest whole unit" (P720). The arithmetic is:

```text
fleet MPG            = total miles (all jurisdictions, taxable or not) / total gallons placed in the fleet
taxable gallons (j)  = taxable miles in j / fleet MPG
net taxable gallons  = taxable gallons (j) - tax-paid gallons bought in j
tax due (j)          = net taxable gallons x j's rate for the quarter   (negative is a credit)
```

A credit in one jurisdiction offsets tax owed to another on the same return, and unused credits carry forward until offset or for eight quarters (R1120). Late filing or underpayment draws a penalty of "$50.00 or 10 percent of delinquent taxes, whichever is greater" (R1220), and interest for a US-based fleet runs at two points above the IRS underpayment rate, accruing monthly at a twelfth of it (R1230.100). Refunds due are paid within 90 days of a request or draw interest (R1150). Rates change by quarter: each member notifies IFTA, Inc., which distributes the converted rates to the members by the first Monday of the quarter (P1120), and the fourth-quarter 2026 matrix was marked "not final until December 4, 2026." A rate can also change inside a quarter: the same matrix carries a second Ohio row dated October 4, 2026, for a rate holiday that its footnote runs to January 2, 2027. A rate is therefore data keyed by jurisdiction, fuel type, quarter and the date it takes effect, loaded from the matrix and never typed in ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)). Some jurisdictions add a **surcharge**, shown as its own row: the 4Q2026 matrix has surcharge rows for Indiana, Kentucky and Virginia. A surcharge is computed on taxable gallons with no credit for gallons bought in the jurisdiction. <!-- source-gap: logistics-fuel-and-fuel-cards-surcharge | missing | IFTA surcharge rows are computed on taxable gallons without tax-paid credit | closes with: a member jurisdiction's IFTA return instructions or the IFTA Procedures Manual stating the surcharge computation | checked: 2026-11-22 --> I haven't found that rule in the IFTA governing documents themselves; the members' return instructions are the place to confirm it before coding it.

### A Worked Return

A fleet runs 120,000.0 miles in a quarter and puts 18,750.000 gallons of diesel in its tractors, a fleet MPG of 6.40. The fleet, its miles and gallons are invented, and so are the rates: they are illustrative, not the 4Q2026 matrix (which has Illinois special diesel at $0.7380 and Indiana at $0.6300, for example):

| Jurisdiction | Taxable miles | Taxable gallons | Tax-paid gallons | Net gallons | Rate (illustrative) | Tax |
| --- | --- | --- | --- | --- | --- | --- |
| Illinois | 30,000 | 4,688 | 6,000 | −1,312 | $0.7000 | −$918.40 |
| Indiana | 25,000 | 3,906 | 2,000 | 1,906 | $0.6000 | $1,143.60 |
| Indiana surcharge | 25,000 | 3,906 | none | 3,906 | $0.1000 | $390.60 |
| Ohio | 20,000 | 3,125 | 5,500 | −2,375 | $0.4700 | −$1,116.25 |
| Pennsylvania | 15,000 | 2,344 | 0 | 2,344 | $0.7400 | $1,734.56 |
| Texas | 30,000 | 4,688 | 5,250 | −562 | $0.2000 | −$112.40 |
| **Total** | 120,000 | | 18,750 | | | **$1,121.71** |

The fleet bought exactly the fuel it burned and still owes $1,121.71, because it bought no fuel in Pennsylvania, where the rate is high, and more than it burned in Illinois, Ohio and Texas; their credits ($2,147.05) offset most of what Indiana and Pennsylvania are owed ($3,268.76). Rounding is half up to whole gallons (4,687.5 becomes 4,688), which is a choice the base jurisdiction's form makes and the code should take as a parameter if a jurisdiction differs. The same calculation in integer units: miles in tenths, gallons in thousandths, MPG in hundredths, rates in ten-thousandths of a dollar a gallon (the matrix prints four decimals), tax in cents, with every division rounded once ([Rounding](/docs/money/amounts#rounding)):

```go tab="Go"
// Units: miles in tenths, gallons in thousandths, fleet MPG in hundredths,
// tax rates in ten-thousandths of a dollar per gallon, tax in cents.
type JurisdictionInput struct {
	Jurisdiction    string // "US-IL"
	TaxableTenths   int64  // taxable miles in the jurisdiction x 10
	TaxPaidMilliGal int64  // tax-paid gallons bought there x 1,000
	RateE4          int64  // dollars per gallon x 10,000, as the rate matrix prints it
	Surcharge       bool   // a surcharge row: taxed on taxable gallons, no tax-paid credit
}

type ReturnLine struct {
	Jurisdiction                             string
	TaxableGal, TaxPaidGal, NetGal, TaxCents int64 // whole gallons, signed cents
	Surcharge                                bool
}

// roundDiv divides and rounds half away from zero; d must be positive.
func roundDiv(n, d int64) int64 {
	if n < 0 {
		return -roundDiv(-n, d)
	}
	return (n + d/2) / d
}

// FleetMPG is total miles over total fuel, to two decimals (IFTA P720.350).
func FleetMPG(totalTenths, totalMilliGal int64) int64 {
	return roundDiv(totalTenths*10000, totalMilliGal)
}

// Lines computes each jurisdiction's line in whole gallons (P720.500) and the net due.
func Lines(mpgHundredths int64, in []JurisdictionInput) ([]ReturnLine, int64) {
	out := make([]ReturnLine, 0, len(in))
	var due int64
	for _, j := range in {
		taxable := roundDiv(j.TaxableTenths*10, mpgHundredths) // miles / MPG
		paid := int64(0)
		if !j.Surcharge {
			paid = roundDiv(j.TaxPaidMilliGal, 1000)
		}
		net := taxable - paid
		cents := roundDiv(net*j.RateE4, 100)
		due += cents
		out = append(out, ReturnLine{j.Jurisdiction, taxable, paid, net, cents, j.Surcharge})
	}
	return out, due
}
```

```rust tab="Rust"
/// Units: miles in tenths, gallons in thousandths, fleet MPG in hundredths,
/// tax rates in ten-thousandths of a dollar per gallon, tax in cents.
pub struct JurisdictionInput {
    pub jurisdiction: String,    // "US-IL"
    pub taxable_tenths: i64,     // taxable miles in the jurisdiction x 10
    pub tax_paid_milli_gal: i64, // tax-paid gallons bought there x 1,000
    pub rate_e4: i64,            // dollars per gallon x 10,000, as the rate matrix prints it
    pub surcharge: bool,         // a surcharge row: taxed on taxable gallons, no tax-paid credit
}

pub struct ReturnLine {
    pub jurisdiction: String,
    pub taxable_gal: i64, // whole gallons
    pub tax_paid_gal: i64,
    pub net_gal: i64,
    pub tax_cents: i64, // signed: a credit is negative
    pub surcharge: bool,
}

/// Divides and rounds half away from zero; `d` must be positive.
fn round_div(n: i64, d: i64) -> i64 {
    if n < 0 {
        return -round_div(-n, d);
    }
    (n + d / 2) / d
}

/// Total miles over total fuel, to two decimals (IFTA P720.350).
pub fn fleet_mpg(total_tenths: i64, total_milli_gal: i64) -> i64 {
    round_div(total_tenths * 10_000, total_milli_gal)
}

/// Each jurisdiction's line in whole gallons (P720.500), and the net due.
pub fn lines(mpg_hundredths: i64, input: &[JurisdictionInput]) -> (Vec<ReturnLine>, i64) {
    let mut due = 0;
    let out = input
        .iter()
        .map(|j| {
            let taxable_gal = round_div(j.taxable_tenths * 10, mpg_hundredths); // miles / MPG
            let tax_paid_gal = if j.surcharge { 0 } else { round_div(j.tax_paid_milli_gal, 1000) };
            let net_gal = taxable_gal - tax_paid_gal;
            let tax_cents = round_div(net_gal * j.rate_e4, 100);
            due += tax_cents;
            let (jurisdiction, surcharge) = (j.jurisdiction.clone(), j.surcharge);
            ReturnLine { jurisdiction, taxable_gal, tax_paid_gal, net_gal, tax_cents, surcharge }
        })
        .collect();
    (out, due)
}
```

With the table's inputs, `FleetMPG(1200000, 18750000)` returns 640 and `Lines` returns a net due of 112,171 cents. Two inputs need care. Total miles include miles that no jurisdiction taxes (R266 counts all distance "regardless of whether" it is taxable), and total gallons include all fuel placed in the fleet's qualified vehicles (R820), so leaving out a truck's off-road miles or a bulk-tank fill changes every jurisdiction's line. And where a qualified vehicle travels only in jurisdictions that tax by distance or not at all, the fuel reporting rules relax (R820, P550.900); the return still lists the distance.

## IRP Apportioned Registration

The International Registration Plan does for plates what IFTA does for fuel tax: the carrier registers its interstate fleet in one base jurisdiction, receives one plate and one **cab card** per vehicle, and pays each member jurisdiction a share of its registration fee by distance. Federal law bars a state outside the Plan from limiting operation of a commercial vehicle registered in a participating state (49 U.S.C. 31704). The Texas DMV's information packet sets out the Plan's terms as a base jurisdiction applies them:

- **Apportionable vehicles** are power units with two axles over 26,000 pounds gross or registered gross weight, three or more axles regardless of weight, or combinations over 26,000 pounds, used in two or more member jurisdictions; vehicles at or under 26,000 pounds, recreational vehicles and some others may be apportioned at the registrant's option.
- **Fees** "are calculated based on distance percentages for each jurisdiction in which the vehicle or fleet of vehicles operates": each jurisdiction's share is its distance over the fleet's total distance in the reporting period. They don't include fuel taxes, oversize or overweight permits, or operating authority.
- **The reporting period** is the 12 months from July 1 to June 30 that end in the calendar year before the registration year begins (for a registration year starting in October, November or December, the previous such 12-month period); renewals use actual distance, and an initial application, or a fleet with no actual distance in the period, uses the Plan's **average per-vehicle distance** chart. Actual distance includes all movement: loaded, empty, deadhead, bobtail and personal.
- **Records** (individual vehicle distance records and monthly, quarterly or annual summaries) are kept for "three (3) reporting periods plus the current reporting period, four (4) total," and the base jurisdiction must audit three percent of fleets that renew each year.

The cab card lists the jurisdictions and weights the vehicle is registered for, so the system stores it per vehicle per registration year, and the distance by jurisdiction comes from the same ELD records as IFTA, aggregated over July through June instead of by calendar quarter. Two periods, one source: my rule is to store jurisdiction distance once, by vehicle and day, and derive both filings from it.

## The Heavy Vehicle Use Tax

A highway vehicle with a taxable gross weight of 55,000 pounds or more owes the federal heavy vehicle use tax, filed on IRS Form 2290. The tax is $100 a year plus $22 for each 1,000 pounds over 55,000, up to $550 over 75,000 pounds, and applies to use before October 1, 2029 (26 U.S.C. 4481). The period runs July 1 to June 30 (July 1, 2026 to June 30, 2027 for the current return); the return is due by "the last day of the month following the month of first use"; electronic filing is required for 25 or more vehicles; a vehicle expected to run 5,000 miles or less (7,500 for agricultural vehicles) can have the tax suspended; records are kept at least 3 years; and the stamped Schedule 1 is the proof of payment a state asks for at registration (2026 instructions). That last link is what ties it to IRP: the Texas DMV, for one, requires proof of HVUT payment to register a vehicle of 55,000 pounds or more and keeps a unit whose 2290 hasn't been paid off the apportioned fleet, so the system stores the Schedule 1 per vehicle and tax period and blocks renewal without it.

## Tolls

Tolls reach a carrier three ways: through a **transponder** account (E-ZPass in the East and Midwest, regional systems elsewhere, or an aggregator's device that several agencies accept), through **toll-by-plate** invoices the agency mails to the plate's registered owner, and through violation notices when neither worked. Interoperability is by group: the E-ZPass Group's agencies span 20 states, and an aggregator such as Bestpass or PrePass sells one account across groups and covers plate tolls where the device isn't read. A toll arrives as a record of plate or device, agency, plaza or entry and exit, time, vehicle class (axles), amount, and the posting date, which can be weeks after the trip for plate tolls.

The system's job is attribution. A toll for a plate at a time resolves to the tractor that carried the plate, the dispatch leg it was on, the driver and the load. From there it goes one of three ways: a company cost allocated to the load; an accessorial billed to the customer where the contract allows it, as a receivable `freight_charges` line with the toll as its source; or a chargeback to a leased owner-operator, where the lease states who pays tolls (376.12(e)). A violation fee is usually a separate decision from the toll, and the lease's treatment of fines decides who carries it. Rental tractors, interchanged trailers and plates moved between units are where attribution fails, so the history of which unit carried which plate and transponder is part of the model.

## How to Build It

The fuel and toll records attach to the core spine through `equipment_units` (plates, decals, registration, weights for HVUT) and `drivers` (the pump ID), and to settlements and loads through the dispatch legs that [Carrier Dispatch & Asset Management](/books/logistics/carrier-operations#how-to-build-it) defines (`dispatch_legs`, `driver_settlement_lines`). `freight_charges` gains a source link for a toll or fuel line billed to a customer. New tables hold card accounts and cards, fuel transactions, toll identifiers (transponders and plates, with their history) and transactions, jurisdiction distance, IFTA licenses, rates, returns and lines, and IRP registrations. Jurisdictions are ISO 3166-2 codes (`US-IL`, `CA-ON`); quantities use the units of the worked return; `ALTER`s follow the live-database pattern ([Lock-Aware DDL](/docs/database/zero-downtime-migrations#lock-aware-ddl)):

```sql
ALTER TABLE equipment_units
  ADD COLUMN plate_number          TEXT,
  ADD COLUMN plate_jurisdiction    TEXT,     -- 'US-TX'
  ADD COLUMN registered_gross_weight_g BIGINT,  -- the weight on the cab card
  ADD COLUMN taxable_gross_weight_g    BIGINT,  -- for HVUT, per the 2290 instructions
  ADD COLUMN fuel_tank_capacity_ml BIGINT,   -- for the gallons-per-fill check
  ADD COLUMN ifta_qualified        BOOLEAN,  -- R245, set from axles and weights
  ADD COLUMN ifta_decal_serials    TEXT[],   -- this year's two decals
  ADD COLUMN ifta_decal_year       SMALLINT,
  ADD COLUMN irp_registration_id   UUID;
ALTER TABLE equipment_units ADD CONSTRAINT equipment_units_decals_check
  CHECK (ifta_decal_serials IS NULL OR ifta_decal_year IS NOT NULL) NOT VALID;

ALTER TABLE drivers
  ADD COLUMN fuel_pump_id_ref TEXT;          -- the driver ID entered at the pump, a vault reference

CREATE TABLE fuel_card_accounts (        -- a carrier's account with a fleet card issuer
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  carrier_party_id UUID NOT NULL REFERENCES parties (id),
  issuer_party_id  UUID NOT NULL REFERENCES parties (id),  -- WEX, Comdata, a bank
  program          TEXT NOT NULL,          -- the issuer's product name
  account_ref      TEXT NOT NULL,          -- the issuer's account number
  network          TEXT NOT NULL CHECK (network IN ('closed_loop', 'open_loop')),
  billing_cycle    TEXT NOT NULL CHECK (billing_cycle IN ('daily', 'weekly', 'semi_monthly',
                     'monthly')),
  currency         CHAR(3) NOT NULL,
  UNIQUE (issuer_party_id, account_ref)
);

CREATE TABLE fuel_cards (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  fuel_card_account_id UUID NOT NULL REFERENCES fuel_card_accounts (id),
  card_token           TEXT NOT NULL,      -- the issuer's card ID or a vault token, never the PAN
  last4                CHAR(4) NOT NULL,
  driver_id            UUID REFERENCES drivers (id),         -- a driver card
  equipment_id         UUID REFERENCES equipment_units (id), -- a unit card
  controls             JSONB NOT NULL,     -- products, limits, prompts as pushed to the issuer
  controls_version     INT NOT NULL DEFAULT 1,
  status               TEXT NOT NULL CHECK (status IN ('active', 'locked', 'suspended',
                         'cancelled')),
  UNIQUE (fuel_card_account_id, card_token)
);

CREATE TABLE fuel_transactions (         -- one posted purchase, as the issuer reported it
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  fuel_card_id        UUID REFERENCES fuel_cards (id),       -- null: bulk tank or a receipt
  source              TEXT NOT NULL CHECK (source IN ('card_file', 'card_api', 'bulk_withdrawal',
                        'receipt', 'manual')),
  external_id         TEXT NOT NULL,       -- the issuer's transaction ID
  occurred_at         TIMESTAMPTZ NOT NULL,
  received_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  merchant_name       TEXT NOT NULL,
  merchant_address    TEXT,
  facility_id         UUID REFERENCES facilities (id),       -- a known truck stop or yard tank
  jurisdiction        TEXT NOT NULL,       -- where it was bought: 'US-TX'
  product             TEXT NOT NULL CHECK (product IN ('diesel', 'reefer_diesel', 'gasoline',
                        'def', 'biodiesel', 'cng', 'lng', 'propane', 'electricity', 'non_fuel')),
  product_code        TEXT,                -- as the issuer sent it
  volume_milli        BIGINT,              -- thousandths of the unit
  volume_unit         TEXT CHECK (volume_unit IN ('gal', 'l', 'kwh')),
  unit_price_e4       BIGINT,              -- per unit, ten-thousandths of the currency unit
  pump_price_e4       BIGINT,              -- retail price, where the merchant reports it
  amount              BIGINT NOT NULL,     -- minor units, as billed
  currency            CHAR(3) NOT NULL,
  tax_paid            BOOLEAN NOT NULL,    -- price includes the jurisdiction's fuel tax
  equipment_id        UUID REFERENCES equipment_units (id),
  driver_id           UUID REFERENCES drivers (id),
  odometer_entered    INT,                 -- the prompt answer
  odometer_ecm        INT,                 -- from the ELD at occurred_at
  dispatch_leg_id     UUID REFERENCES dispatch_legs (id),
  settlement_line_id  UUID REFERENCES driver_settlement_lines (id),  -- deducted from a lessor
  receipt_document_id UUID REFERENCES documents (id),
  ifta_eligible       BOOLEAN,             -- propulsion fuel in a qualified vehicle, as reviewed
  review_status       TEXT NOT NULL DEFAULT 'unreviewed' CHECK (review_status IN ('unreviewed',
                        'cleared', 'exception', 'disputed')),
  UNIQUE (source, external_id)
);

CREATE TABLE toll_identifiers (          -- which unit carried a transponder or plate, when
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  kind           TEXT NOT NULL CHECK (kind IN ('transponder', 'plate')),
  value          TEXT NOT NULL,          -- device number, or plate number
  issuer         TEXT NOT NULL,          -- the device's agency or aggregator, or the plate's jurisdiction
  equipment_id   UUID NOT NULL REFERENCES equipment_units (id),
  valid_during   TSTZRANGE NOT NULL,
  EXCLUDE USING gist (kind WITH =, value WITH =, issuer WITH =, valid_during WITH &&)  -- btree_gist
);

CREATE TABLE toll_transactions (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  provider_party_id UUID NOT NULL REFERENCES parties (id),
  external_id      TEXT NOT NULL,
  method           TEXT NOT NULL CHECK (method IN ('transponder', 'plate', 'violation')),
  device_ref       TEXT,
  plate_number     TEXT,
  plate_jurisdiction TEXT,
  agency           TEXT NOT NULL,
  entry_plaza      TEXT,
  exit_plaza       TEXT,
  vehicle_class    TEXT,                   -- as billed: axles or class code
  occurred_at      TIMESTAMPTZ NOT NULL,
  posted_at        TIMESTAMPTZ NOT NULL,   -- plate tolls post weeks later
  amount           BIGINT NOT NULL,
  fee_amount       BIGINT NOT NULL DEFAULT 0,  -- violation or video fees, decided separately
  currency         CHAR(3) NOT NULL,
  equipment_id     UUID REFERENCES equipment_units (id),  -- resolved
  dispatch_leg_id  UUID REFERENCES dispatch_legs (id),
  disposition      TEXT CHECK (disposition IN ('company_cost', 'rebill_customer',
                     'chargeback_lessor', 'disputed')),
  settlement_line_id UUID REFERENCES driver_settlement_lines (id),
  UNIQUE (provider_party_id, external_id)
);

ALTER TABLE freight_charges
  ADD COLUMN toll_transaction_id UUID,
  ADD COLUMN fuel_transaction_id UUID;
ALTER TABLE freight_charges ADD CONSTRAINT freight_charges_toll_transaction_fkey
  FOREIGN KEY (toll_transaction_id) REFERENCES toll_transactions (id) NOT VALID;
ALTER TABLE freight_charges ADD CONSTRAINT freight_charges_fuel_transaction_fkey
  FOREIGN KEY (fuel_transaction_id) REFERENCES fuel_transactions (id) NOT VALID;

CREATE TABLE jurisdiction_distance_records (  -- distance by unit, day and jurisdiction
  equipment_id     UUID NOT NULL REFERENCES equipment_units (id),
  day              DATE NOT NULL,          -- in the fleet's reporting time zone
  jurisdiction     TEXT NOT NULL,
  distance_tenths  INT NOT NULL CHECK (distance_tenths >= 0),  -- miles x 10
  taxable_tenths   INT NOT NULL CHECK (taxable_tenths >= 0),   -- excludes off-road and exempt
  odometer_start   INT,
  odometer_end     INT,
  source           TEXT NOT NULL CHECK (source IN ('eld', 'gps', 'trip_sheet', 'manual')),
  source_ref       TEXT,                   -- the vendor's report or trip ID
  dispatch_leg_id  UUID REFERENCES dispatch_legs (id),
  recorded_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (equipment_id, day, jurisdiction, source),
  CHECK (taxable_tenths <= distance_tenths)
);

CREATE TABLE ifta_licenses (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  licensee_party_id UUID NOT NULL REFERENCES parties (id),
  base_jurisdiction TEXT NOT NULL,
  license_number    TEXT NOT NULL,         -- unchanged year to year (R610)
  license_year      SMALLINT NOT NULL,
  filing_frequency  TEXT NOT NULL DEFAULT 'quarterly' CHECK (filing_frequency IN ('quarterly',
                      'annual')),
  document_id       UUID REFERENCES documents (id),
  status            TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'revoked',
                      'cancelled')),
  UNIQUE (base_jurisdiction, license_number, license_year)
);

CREATE TABLE jurisdiction_fuel_tax_rates (  -- one row of the quarter's rate matrix
  jurisdiction     TEXT NOT NULL,
  fuel_type        TEXT NOT NULL,          -- 'special_diesel', 'gasoline', ...
  quarter_start    DATE NOT NULL,          -- first day of the calendar quarter
  effective_on     DATE NOT NULL,          -- quarter_start, or a dated row inside the quarter
  surcharge        BOOLEAN NOT NULL DEFAULT FALSE,
  rate_e4          BIGINT NOT NULL,        -- per US gallon, ten-thousandths of a dollar
  currency         CHAR(3) NOT NULL DEFAULT 'USD',
  matrix_version   TEXT NOT NULL,          -- the matrix as downloaded, e.g. its posting date
  PRIMARY KEY (jurisdiction, fuel_type, quarter_start, effective_on, surcharge, matrix_version)
);

CREATE TABLE ifta_returns (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  ifta_license_id    UUID NOT NULL REFERENCES ifta_licenses (id),
  period             DATERANGE NOT NULL,   -- a calendar quarter, or the year if annual
  fuel_type          TEXT NOT NULL,
  version            INT NOT NULL DEFAULT 1,  -- an amended return is a new version
  total_tenths       BIGINT NOT NULL,      -- all miles, R266
  total_milli_gal    BIGINT NOT NULL,      -- all fuel placed, R820
  fleet_mpg_hundredths INT NOT NULL,       -- P720.350
  due_on             DATE NOT NULL,        -- computed: R960
  amount_due         BIGINT,               -- sum of the lines plus penalty, stored when filed
  currency           CHAR(3) NOT NULL,
  status             TEXT NOT NULL CHECK (status IN ('draft', 'filed', 'paid', 'amended')),
  filed_at           TIMESTAMPTZ,
  document_id        UUID REFERENCES documents (id),  -- the return as filed
  UNIQUE (ifta_license_id, period, fuel_type, version)
);

CREATE TABLE ifta_return_lines (
  ifta_return_id   UUID NOT NULL REFERENCES ifta_returns (id),
  jurisdiction     TEXT NOT NULL,
  surcharge        BOOLEAN NOT NULL DEFAULT FALSE,
  rate_e4          BIGINT NOT NULL,        -- copied from the matrix row used
  total_miles      INT NOT NULL,           -- whole units, P720.500
  taxable_miles    INT NOT NULL,
  taxable_gallons  INT NOT NULL,
  tax_paid_gallons INT NOT NULL,
  net_gallons      INT NOT NULL,           -- signed
  tax_amount       BIGINT NOT NULL,        -- signed minor units: a credit is negative
  interest_amount  BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (ifta_return_id, jurisdiction, surcharge)
);

CREATE TABLE irp_registrations (         -- one fleet's apportioned registration year
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  registrant_party_id UUID NOT NULL REFERENCES parties (id),
  base_jurisdiction  TEXT NOT NULL,
  account_number     TEXT NOT NULL,
  fleet_number       TEXT NOT NULL,
  registration_year  DATERANGE NOT NULL,
  reporting_period   DATERANGE NOT NULL,   -- July through June before the year
  distance_basis     TEXT NOT NULL CHECK (distance_basis IN ('actual', 'average_per_vehicle')),
  status             TEXT NOT NULL CHECK (status IN ('draft', 'invoiced', 'paid', 'expired')),
  UNIQUE (base_jurisdiction, account_number, fleet_number, registration_year)
);

CREATE TABLE irp_jurisdiction_distances (
  irp_registration_id UUID NOT NULL REFERENCES irp_registrations (id),
  jurisdiction     TEXT NOT NULL,
  distance_miles   INT NOT NULL CHECK (distance_miles >= 0),
  percentage_e4    INT NOT NULL,           -- share of total distance, ten-thousandths
  fee_amount       BIGINT,                 -- as the base jurisdiction invoiced it
  currency         CHAR(3) NOT NULL,
  PRIMARY KEY (irp_registration_id, jurisdiction)
);

ALTER TABLE equipment_units ADD CONSTRAINT equipment_units_irp_registration_fkey
  FOREIGN KEY (irp_registration_id) REFERENCES irp_registrations (id) NOT VALID;

CREATE INDEX CONCURRENTLY fuel_transactions_equipment_idx ON fuel_transactions (equipment_id, occurred_at);
CREATE INDEX CONCURRENTLY toll_transactions_plate_idx ON toll_transactions (plate_number, occurred_at);

ALTER TABLE equipment_units VALIDATE CONSTRAINT equipment_units_decals_check;
ALTER TABLE equipment_units VALIDATE CONSTRAINT equipment_units_irp_registration_fkey;
ALTER TABLE freight_charges VALIDATE CONSTRAINT freight_charges_toll_transaction_fkey;
ALTER TABLE freight_charges VALIDATE CONSTRAINT freight_charges_fuel_transaction_fkey;
```

The calculation's inputs are two sums for the quarter, over the licensee's IFTA-qualified units: `taxable_tenths` from `jurisdiction_distance_records` by jurisdiction, and `volume_milli` from `fuel_transactions` by the jurisdiction of purchase, counting only tax-paid propulsion fuel with a valid record (`tax_paid AND ifta_eligible`). Fleet totals sum every row, taxable or not.

Design notes:

- **The card file is an import with stages.** Issuer files are re-sent and corrected; `UNIQUE (source, external_id)` makes re-import idempotent, and a corrected transaction updates the posted row only before review, after which it is a new row and a reversal ([Matching, Duplicates and Re-Import](/docs/building-blocks/imports-and-exports#matching-duplicates-and-re-import)).
- **Distance is stored once, by unit and day.** IFTA's quarters and IRP's July-to-June year are both sums over `jurisdiction_distance_records`; when the ELD vendor and a trip sheet disagree, both rows stay and the return records which source it used.
- **Returns are versions.** A filed return is never edited; an amendment is a new version with its own lines and document, and each line copies the rate it used from the matrix version in force.
- **Deadlines are computed.** The IFTA due date, the 2290 due date from the month of first use and the IRP renewal follow from rules and are stored with the rule that produced them ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).
- **Card numbers stay out.** The row holds the issuer's card ID or a vault token and the last four digits; the driver's pump ID is a vault reference like the CDL number in the core model.
- **Positions are personal data.** The 10-minute GPS records IFTA accepts are a driver's movements too; keep them for the four-year tax retention, not longer, and at the precision the rule asks for ([Consent, Law and Retention](/docs/building-blocks/location-tracking#consent-law-and-retention)).

## Auditing

- **Every fuel transaction as received,** with the issuer's file or API response, the receipt where there is one, the prompt answers, the ECM odometer it was checked against and the review outcome; altered records lose their credit (P550.200), so the original is kept and corrections are new rows ([Amend, Don't Overwrite](/docs/building-blocks/audit-trails#amend-don-t-overwrite)).
- **Distance records** for four years after each return's due or filing date, in the form P540 accepts: trip records with odometer and route, or tracking data at 10-minute intervals exportable as a spreadsheet.
- **Each IFTA return and amendment** with its inputs (the distance and fuel rows it summed), the matrix version, the computed lines and the filed document; an inadequate-records finding cuts fleet MPG to 4.00 or by 20%, so the trail from return to record must hold.
- **IRP applications and cab cards** for three reporting periods plus the current one, with the distance by jurisdiction that set each year's fees.
- **Form 2290 Schedule 1s** per vehicle and tax period for at least 3 years, linked to the registration they supported.
- **Toll attribution,** from the provider's record to the unit, leg and load, and to the customer charge or lessor chargeback it became, with the support document the lease requires for a chargeback.
- **Card control changes,** who changed which limit or product rule and when, so a disputed purchase can be tied to the policy in force.

## What This Means for the System You Build

- **Treat the fuel card as a data feed,** not just a payable: product, gallons, location, driver, unit and odometer are inputs to tax, cost, settlements and fraud review.
- **Check every purchase against the truck,** using tank capacity, the ECM odometer and the last ELD position, and keep reefer fuel and non-qualified vehicles off the IFTA lines.
- **Store jurisdiction distance once,** by vehicle and day from the ELD, and derive the IFTA quarter and the IRP year from it.
- **Compute the return in integer units** with one rounding rule per step, load rates from the quarterly matrix as versioned data, and keep each filed return immutable.
- **Route each toll to a decision:** company cost, customer rebill as a `freight_charges` line, or lessor chargeback under the lease.
- **Deduct fuel and advances from owner-operators only as the lease lists them,** with the transaction as the support document on the settlement line.
- **Block registration renewal on missing Schedule 1s,** and track decals, cab cards and plates per unit and year.

## References

**Agreements and manuals**

- [IFTA: Articles of Agreement (effective August 26, 2026)](https://www.iftach.org/manuals/2026/AA/Articles%20of%20Agreement%20-%2008-26-26.pdf), base jurisdiction (R212), member jurisdictions (R227), qualified motor vehicle (R245), quarterly periods (R254), total distance (R266), licensing and trip permits (R305, R310), license, copies and decals (R605 to R625), temporary decal permits (R263), records (R700), taxable fuel (R820), filing periods and annual option (R930), due dates (R960), credits and carry-forward (R1120), refund interest (R1150), penalties (R1220) and interest (R1230)
- [IFTA: Procedures Manual (effective August 26, 2026)](https://www.iftach.org/manuals/2026/PM/Procedures%20Manual%20-%2008-26-26.pdf), decal design (P320), four-year retention and burden of proof (P510, P520), distance records and tracking data (P540), fuel records and tax-paid credit (P550), the inadequate-records assessment (P570), required return elements and rounding (P720), rate reporting (P1120)
- [IFTA: Manuals](https://www.iftach.org/manual2020.php), the current editions of the governing documents
- [IFTA: Tax rate matrix, 4Q2026](https://www.iftach.org/taxmatrix4/Taxmatrix.php), the matrix columns, surcharge rows for Indiana, Kentucky and Virginia, the dated Ohio row of October 4, 2026, the Illinois and Indiana special diesel rates, and "not final until December 4, 2026"
- [IFTA: Tax rate matrix home](https://www.iftach.org/taxmatrix4/), 58 jurisdictions tracked for the quarter (48 US, 10 Canadian)

**Statutes and regulations**

- [49 U.S.C. 31705: Fuel use tax](https://www.law.cornell.edu/uscode/text/49/31705), state fuel use tax reporting and payment must conform with IFTA
- [49 U.S.C. 31704: Participation in international registration plan](https://www.law.cornell.edu/uscode/text/49/31704), states outside the Plan may not limit IRP-registered vehicles
- [26 U.S.C. 4481: Imposition of tax](https://www.law.cornell.edu/uscode/text/26/4481), heavy vehicle use tax rates and the October 1, 2029 end date
- [49 CFR 376.12: Written lease requirements](https://www.law.cornell.edu/cfr/text/49/376.12), who pays fuel, fuel taxes and tolls, and chargeback items

**Government**

- [IRS: Instructions for Form 2290 (07/2026)](https://www.irs.gov/instructions/i2290), the 55,000-pound threshold, the 2026-2027 period, due date, e-filing for 25 or more vehicles, Schedule 1 as proof, the mileage use limit and 3-year retention
- [IRS: About Form 2290](https://www.irs.gov/forms-pubs/about-form-2290), the tax and the 5,000 and 7,500 mile suspension
- [Texas DMV: Apportioned registration](https://www.txdmv.gov/motor-carriers/commercial-fleet-registration/apportioned-registration), fees by distance percentage, actual distance on applications, cab card as proof of registration, proof of HVUT payment at registration
- [Texas DMV: Apportioned Registration Information Packet](https://www.txdmv.gov/sites/default/files/body-files/TxIRP_Information_Packet_Booklet.pdf), apportionable vehicles, fees and exclusions, the reporting period definition, average per-vehicle distance, units with unpaid HVUT kept off the fleet, record retention and the three percent audit rule

**Filings**

- [WEX: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1309108/000130910826000010/wex-20251231.htm), the closed-loop network's coverage, data captured at the point of sale, flat fees from over-the-road customers, Mobility revenue, transactions, average fuel price and net payment processing rate
- [Corpay: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1175454/000117545426000018/flt-20251231.htm), Vehicle Payments networks and controls, savings against retail, revenue influenced by fuel prices and spreads, and Sem Parar tolls in Brazil

**Vendors**

- [Bestpass](https://bestpass.com/), toll coverage, toll-by-plate and one monthly statement
- [Comdata: Large fleets](https://www.comdata.com/large-fleets/), chain acceptance, spend controls, cash price, OneClick and IFTA services
- [Comdata: Comchek](https://www.comdata.com/products-services/comchek/), funds to drivers and Express Codes
- [E-ZPass Group](https://www.e-zpassgroup.org/), 20 states, 64 million devices and no customer accounts held by the Group
- [EFS: Fleet card](https://www.efsllc.com/fuel-card/efs-fleet-card/), 12,000+ truck stops, card-level limits, custom prompts and MoneyCodes
- [Motive: IFTA trips](https://developer-docs.gomotive.com/reference/fetch-a-list-of-companys-ifta-trip-reports.md), the endpoint and its jurisdiction, distance and odometer fields
- [Motive: Fuel purchases](https://developer-docs.gomotive.com/reference/overview-fuel-purchases.md), purchases from fuel card integrations, manual entry and CSV import
- [PrePass](https://prepass.com/), bypass with toll payments and reconciliation
- [Samsara: IFTA jurisdiction reports](https://developers.samsara.com/reference/getiftajurisdictionreports), the endpoint, its parameters, metric fields and troubleshooting counts
