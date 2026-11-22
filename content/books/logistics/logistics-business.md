+++
title = "The Logistics Business"
description = "How freight moves and gets paid: shippers, carriers, brokers and forwarders, the modes, how the money splits, the life of a shipment, and the core data model."
category = "Logistics & Supply Chain Industry"
order = 2801
part = "The Business"
tags = ["logistics", "supply-chain", "freight", "business-models", "data-model"]
+++

Logistics is a promise to move goods from one dock to another by a time, at a price, with proof. A resin supplier promises a plant twenty pallets by Tuesday's 6 a.m. appointment; a retailer's distribution center promises a store a mixed trailer overnight; an importer's forwarder promises a container from a port in Asia to a warehouse in Ohio in five weeks, through two terminals, a rail ramp and a customs entry. Between the goods and the money sit the people who own the cargo, the carriers who haul it (by parcel van, truck, train, ship or plane), the brokers, forwarders and third-party logistics providers (3PLs) who arrange the haul without owning the vehicle, the warehouses and terminals that hold it on the way, the customs brokers and regulators who let it cross a border, and the factors and payment providers who turn a delivered load into cash. C.H. Robinson alone handled "approximately 37 million shipments" in 2025 with "more than 450,000 transportation providers" on its platform, and Cass Information Systems paid $36.4 billion of freight invoices for its customers the same year.

The software is hard because one movement lives in many records owned by many companies. A pallet of cartons is a line on a purchase order to the buyer, a shipment on a bill of lading to the shipper, a stop on a load to the carrier's dispatcher, a PRO number to an LTL terminal, a set of status messages to a visibility platform, a tender and a margin to a broker, an invoice to audit, a payable to a factor and, if it crosses a border, an entry line with a tariff number and a duty. Each company keeps its own copy, in its own time zone, with its own codes, and each copy can be wrong in a different way: an appointment that was planned but not kept, a status that arrived three hours after it happened, a weight the carrier's scale disagreed with, a payee that changed when the carrier sold its invoices. This chapter is the map the rest of the volume uses: how to read it, the parties, the modes, how the money splits in five common movements, the life of a shipment, and the data model every later chapter extends. Terms are collected in the volume's [Glossary](/books/logistics/glossary).

## How to Read This Volume

The volume follows freight from the business that ships it to the platform that runs it, in twelve parts plus a reference. Chapters not yet published are listed by title:

- **The Business.** This chapter; The Logistics Landscape (carriers, brokers, 3PLs, forwarders and the software categories, with filing figures and the 2023 to 2026 consolidation); Freight Markets & Cycles (spot and contract, the 2021 peak and the recession after it, the indexes, and what a cycle does to rate tables and tender rejections); and How Carriers, Brokers & 3PLs Make Money (operating ratio, revenue per mile and per hundredweight, gross and net revenue, asset-light and asset-based models, the agent model, contract warehousing economics).
- **Road and Rail.** Truckload (equipment, drop and live, power-only, owner-operators, driver pay, deadhead); LTL Networks (terminals, linehaul, pickup and delivery, PRO numbers, claims, Yellow's failure); Freight Class, Density & LTL Pricing (the NMFC, the 2025 density changes, reweighs, tariffs, discounts, FAK, minimums, accessorials); Intermodal & Drayage (containers and chassis, ramps, per diem, port appointments); Rail Freight (Class I networks, carload, waybills, car hire, demurrage, rail EDI, the Union Pacific and Norfolk Southern merger); and Parcel Networks From the Carrier Side (hubs, sortation, zones and DIM as the carrier sets them, volumes).
- **Ocean and Air.** Ocean Shipping (carriers, alliances, schedules, booking, containers, VGM, terminals, the DCSA standards); Bills of Lading & eBL (bill versus waybill, negotiability, house and master, electronic bills); Detention & Demurrage (free time, OSRA 2022, the FMC billing rule, disputes); Freight Forwarders & NVOCCs (FMC licensing and bonds, consolidation, forwarder systems); and Air Cargo (air waybills, e-AWB, ULDs, screening, ACAS, ONE Record, status codes).
- **Freight Brokerage.** How Freight Brokerage Works (broker, carrier and forwarder in the statute, the rate confirmation, the broker-carrier agreement, margins, transparency, negligent selection); Carrier Onboarding & Vetting; Freight Fraud & Cargo Theft; and Load Boards & Digital Freight Matching.
- **Carrier Regulation.** Operating Authority & Registration; Bonds & Insurance Minimums; Hours of Service; ELDs & Telematics; Drivers: CDLs, Qualification & the Clearinghouse; Safety Ratings, CSA & Inspections; Cargo Liability & Claims; and Hazardous Materials in Transport.
- **Planning and Execution.** Transportation Management Systems; Rating, Tariffs & Accessorials; Freight Procurement & Routing Guides; Tendering & Acceptance; Load Planning & Optimization; and Carrier Dispatch & Asset Management.
- **Data and Visibility.** Transportation EDI; Logistics APIs & Standards; Visibility & Tracking; and ETAs & Exception Management.
- **Warehouses and Yards.** Warehouse Management Systems; Picking, Packing & Labor; Warehouse Automation; Yard Management & Dock Scheduling; and Contract Logistics & 3PL Billing.
- **Freight Money.** Freight Invoicing & Settlement; Freight Audit & Payment; Paying Carriers, Quick Pay & Factoring; Fuel, Tolls & Fuel Cards; and Logistics Accounting.
- **Customs and Trade.** Customs Brokers & Bonds; Import Entry & ACE; Classification, Valuation & Origin; Tariff Programs; Drawback, FTZs & Trade Agreements; Forced Labor & Partner Agencies; Export Compliance & Screening; and EU, UK & Canada Customs.
- **Manufacturing.** ERP, MES & ISA-95; BOMs, PLM & Engineering Change; MRP, Scheduling & Work Orders; Demand & Supply Planning; Supplier Schedules, JIT & Automotive EDI; Quality Systems; Lot & Serial Traceability; FSMA 204, DSCSA & UDI; Recalls From the Manufacturer's Side; and Emissions & Product Passports.
- **Running the Platform.** Logistics Platform Architecture; Logistics Metrics; AI in Logistics; and Replacing a TMS, WMS or ERP.
- **Reference.** A [Glossary](/books/logistics/glossary) of every term the volume defines, grouped by part.

The volume covers what logistics adds. The general engineering lives in the playbook, and chapters link to it rather than repeat it: [Money & Amounts](/docs/money/amounts), [Accounting](/docs/money/accounting), [Idempotency](/docs/requests/idempotency), [Rules as Data](/docs/building-blocks/rules-as-data), [Integrations](/docs/building-blocks/integrations), [Location Tracking](/docs/building-blocks/location-tracking), [Events & Async Messaging](/docs/architecture/events), [Webhooks](/docs/api-design/webhooks), [Multi-Tenancy](/docs/architecture/multi-tenancy), [Temporal Data](/docs/database/temporal-data), [Addresses](/docs/fundamentals/addresses), [Coordinates & Geometry](/docs/fundamentals/coordinates-and-geometry) and [Audit Trails](/docs/building-blocks/audit-trails).

Other volumes own topics this one leans on, and where both model the same thing they use the same concepts:

- **Commerce** owns parcel shipping from the shipper's side ([Shipping & Carriers](/books/commerce/shipping-and-carriers), including [dimensional weight](/books/commerce/shipping-and-carriers#dimensional-weight)), a brand's 3PLs and fulfillment networks ([Warehouses, 3PLs & Fulfillment Networks](/books/commerce/warehouses-and-3pls#3pls)), retail EDI and carton labels ([EDI](/books/commerce/edi#ship-notices-and-carton-labels)), routing guides, chargebacks and OTIF ([Wholesale & Retail Distribution](/books/commerce/wholesale-and-retail-distribution#routing-guides)), cross-border selling for a merchant ([Cross-Border Commerce](/books/commerce/cross-border-commerce#customs-entry-and-duties)), consumer product recalls ([Product Safety, Compliance & Recalls](/books/commerce/product-safety-and-recalls#recalls)), hazmat for sellers ([Pesticides, Chemicals & Hazmat](/books/commerce/pesticides-chemicals-and-hazmat#hazmat-shipping)), a merchant's purchasing and landed cost ([Purchasing & Replenishment](/books/commerce/purchasing-and-replenishment#landed-cost)) and commerce ERP sync ([ERP & Integrations](/books/commerce/erp-and-integrations)).
- **Field Operations** owns own-fleet service routing and the vehicle routing problem ([Route Optimization](/books/field-operations/route-optimization)), the last mile and proof of delivery ([Last-Mile Delivery](/books/field-operations/last-mile-delivery#proof-when-nobody-signs)), and service vans as commercial vehicles ([Fleet, Inventory & Safety](/books/field-operations/fleet-and-safety#when-a-service-van-is-a-commercial-motor-vehicle)).
- **Payments** owns the rails a carrier is paid on ([Vendor Payouts](/books/payments/vendor-payouts), [ACH](/books/payments/ach)), including [stopping a changed bank account](/books/payments/vendor-payouts#stopping-the-changed-bank-account).
- **Banking & Lending** owns factoring as a product ([Invoice Factoring and Financing](/books/banking-and-lending/small-business-lending#invoice-factoring-and-financing)).
- **Workforce** owns worker classification ([Worker Classification](/books/workforce/worker-classification#abc-tests)) and payroll for drivers and warehouse workers.
- **Insurance** owns trucking insurance products ([Commercial Lines](/books/insurance/commercial-lines#the-lines)) and surety bonds as a product ([Surety](/books/insurance/surety#bond-types)).

The volume is US-centric, with the EU, UK and Canada where their rules bind a US shipper, carrier or importer, or where their systems do something differently. No single company is the model: the vocabulary and tables are the industry's, benchmarked across brokers, carriers in every mode, forwarders, warehouse operators, software vendors and manufacturers, and a company's own product name appears only where the chapter is describing that company. Figures are as of November 2026 unless dated otherwise.

## Who's Who

| Party | Who they are | What they need from the system |
| --- | --- | --- |
| **Shippers** | The party that tenders goods to a carrier: a manufacturer, a distributor, a retailer's distribution center, an importer, a 3PL shipping for a client | Capacity at a price, a pickup that happens, a delivery inside the window, and a freight bill that matches what was agreed |
| **Consignees** | The party the goods are delivered to: a plant, a DC, a store, a construction site, a household | An appointment kept, the right goods in the right quantity, and paperwork that lets them receive and pay |
| **Beneficial cargo owners (BCOs)** | The party that owns the goods and the commercial interest in them, whoever appears as shipper or consignee on a bill. In ocean freight the term separates a retailer or manufacturer from the intermediaries booking for it | Landed cost, visibility across every leg, and control of who books its freight |
| **Asset carriers** | Companies that own or lease the vehicles: truckload fleets (Knight-Swift, Schneider, Werner, Heartland), LTL networks (Old Dominion, Saia, XPO, FedEx Freight, ArcBest, Estes), parcel networks (UPS, FedEx, USPS, Amazon), railroads (Union Pacific, BNSF, CSX, Norfolk Southern, CPKC, CN), ocean lines (Maersk, MSC, CMA CGM, Hapag-Lloyd, COSCO) and airlines | Loads that fit their network, accurate weights and dimensions, appointments they can make, and prompt payment |
| **Owner-operators** | A driver who owns or leases a tractor and either runs under their own operating authority or leases on to a carrier and runs under its authority. Landstar had 8,514 trucks from its "BCO Independent Contractors" at the end of 2025 | Loads, fast settlement, and the lease terms the regulation requires ([Worker Classification](/books/workforce/worker-classification#abc-tests) owns the employment question) |
| **Freight brokers** | A person "other than a motor carrier" that "sells, offers for sale, negotiates for, or holds itself out" as arranging motor carrier transportation for compensation (49 U.S.C. 13102(2)): C.H. Robinson, RXO, Uber Freight, TQL, Echo, Coyote, and the brokerage arms of asset carriers | Carriers it can trust, a margin between the buy and the sell, and records of each transaction for three years |
| **3PLs** | Third-party logistics providers: a broad label for companies that run transportation, warehousing or both for shippers under contract, often as a managed service on the shipper's own TMS | Their clients' orders, their carriers' rates, and billing per the contract |
| **Freight forwarders and NVOCCs** | A forwarder "assembles and consolidates" shipments and "assumes responsibility for the transportation from the place of receipt to the place of destination" (13102(8)); in ocean freight, a non-vessel-operating common carrier issues its own house bills over a carrier's master bill and is licensed by the FMC: Expeditors, Kuehne+Nagel, DSV, Flexport | Bookings with carriers, consolidations that fill containers and ULDs, and house documents that match the master |
| **Customs brokers** | Licensed by CBP to transact customs business for importers under a power of attorney, filing entries in ACE and paying duties on the importer's behalf | Commercial invoices, classifications, the importer's bond, and the cargo's arrival data |
| **Warehouses and 3PL operators** | Operators of distribution centers, cross-docks and contract warehouses, for themselves or for clients | Advance notice of what's coming, appointments, labels they can scan, and billing per receipt, pallet and pick |
| **Ports, terminals and rail ramps** | Marine terminal operators, container yards, intermodal ramps and airport cargo terminals where freight changes mode | Containers and chassis returned on time, appointments, and charges for storage past free time |
| **Factors and freight payment providers** | A factor buys a carrier's invoices for cash now (Triumph purchased $11.7 billion of them in 2025); a freight payment provider audits and pays freight bills for shippers (Cass) | A notice of assignment honored, invoices matched to proof of delivery, and payment to the right payee |
| **Software vendors** | TMS, WMS, yard, visibility, ELD, load board, customs, forwarding, ERP and MES vendors: Oracle, SAP, Blue Yonder, Manhattan, e2open (WiseTech), Descartes, Infios, McLeod, Trimble, project44, FourKites, DAT, Truckstop, Samsara, Motive, Geotab, CargoWise, Magaya | Clean data in partners' formats, and the identifiers that let one company's record be matched to another's |
| **Manufacturers** | Plants that buy components and materials on purchase orders and supplier schedules, make lots, and ship finished goods | Inbound parts on time and in sequence, lot traceability, and outbound freight at contract rates |
| **Regulators** | FMCSA (motor carrier registration, insurance, hours of service, driver qualification); PHMSA (the Hazardous Materials Regulations); CBP (entries, security filings, fees); the FMC (ocean intermediaries and detention and demurrage billing); the STB (rail rates and demurrage); FDA (prior notice of imported food, recalls); NHTSA (vehicle and equipment defect reports) | Registrations current, financial security on file, records kept, filings on time, and defects and recalls reported |

Each regulator's hook in the records is narrow and specific:

- **FMCSA** identifies every regulated entity by its USDOT number, which its Motus registration system (replacing the Unified Registration System and the FMCSA Portal, phase I released December 8, 2025) keeps as "the unique identifier"; the April 2026 notice announcing Motus says MC and FF docket numbers are not eliminated in phase II. A broker must keep a $75,000 surety bond (Form BMC-84) or trust fund (BMC-85) in effect, and a for-hire carrier of non-hazardous property in vehicles of 10,001 pounds or more needs $750,000 of public liability coverage (49 CFR 387.307 and 387.9).
- **PHMSA** writes the Hazardous Materials Regulations, which apply to whoever offers hazardous material for transport, the carrier that takes possession of it and whoever makes the packaging (49 CFR 171.1).
- **CBP** sets the clock on an import: the entry summary within "10 working days after the time of entry" (19 CFR 142.12), the importer security filing's data "no later than 24 hours before the cargo is laden aboard the vessel at the foreign port" (19 CFR 149.2), and the carrier's cargo declaration on the same 24 hours (19 CFR 4.7).
- **The FMC** licenses ocean transportation intermediaries and sets their financial responsibility: $50,000 for an ocean freight forwarder, $75,000 for an NVOCC and $150,000 for a registered NVOCC (46 CFR 515.21). Under the Ocean Shipping Reform Act of 2022 (Public Law 117-146, signed June 16, 2022) and 46 CFR 541, a detention or demurrage invoice issued more than 30 calendar days after the charge was last incurred need not be paid (541.7).
- **The STB** regulates rail demurrage, "a charge that both compensates rail carriers for the expenses incurred when rail cars are detained" past free time and "serves as a penalty for undue car detention" (49 CFR 1333.1), and specifies what a Class I railroad's demurrage invoice must show, down to each car's reporting marks and its placement and release times (1333.4).
- **FDA** requires prior notice of imported food at least 2 hours before arrival by road, 4 by rail or air and 8 by water (21 CFR 1.279).
- **NHTSA** requires a manufacturer to report a safety defect "not more than 5 working days after" it is determined to be safety related (49 CFR 573.6).

Two splits shape the data model. **One organization, many roles.** C.H. Robinson is a broker on a truckload, a forwarder on an ocean move and a customs broker on the same container's entry; J.B. Hunt is an asset carrier on its dedicated fleet and a broker on its brokerage loads; a 3PL is the shipper of record on a bill of lading for a client's goods it doesn't own; a manufacturer is the consignee of its inbound freight and the shipper of its outbound. A model that stores "carrier" or "customer" as the type of a company breaks the first time the same company appears on both sides. **Who owns the goods versus who appears on the paper.** The shipper on a bill of lading, the beneficial cargo owner, the importer of record, the party billed for the freight and the party a carrier is paid through can be five different companies on one container, and each regulation, invoice and claim names a different one.

## Modes

| Mode | Unit | Who prices it | Typical documents | Identifiers |
| --- | --- | --- | --- | --- |
| **Parcel** | A package, priced by weight, zone and dimensional weight | The carrier, from published rates with negotiated discounts ([Shipping & Carriers](/books/commerce/shipping-and-carriers#dimensional-weight) owns the shipper's view) | Label, manifest, invoice | Tracking number |
| **LTL (less than truckload)** | Handling units (pallets, crates) sharing a trailer through a terminal network | The carrier's tariff or a neutral base rate such as SMC3's CzarLite ("the most widely used neutral LTL base rate for pricing agreements in North America," by its own account), by class or density and weight, less a negotiated discount | Bill of lading, delivery receipt, freight bill (X12 210, "Motor Carrier Freight Details and Invoice") | BOL number, PRO number, SCAC |
| **Truckload** | A whole trailer, dry van, reefer or flatbed | A contract lane rate or a spot quote, per load or per mile, plus fuel surcharge | Load tender (X12 204, "Motor Carrier Load Tender") and response (990), rate confirmation, bill of lading, proof of delivery | Load number, BOL number, trailer number, SCAC |
| **Intermodal** | A container or trailer on rail between ramps, with drayage at each end | An intermodal marketing company or the railroad, per container | Tender, rail waybill, interchange receipts, dray orders | Container number, rail waybill number |
| **Carload rail** | A railcar from a shipper's siding or a transload | The railroad's tariff or contract, per car | Bill of lading, waybill (X12 404 and 417), demurrage invoices | Car reporting marks and number |
| **Ocean FCL and LCL** | A full container (FCL), or a share of one consolidated by an NVOCC (LCL) | The ocean carrier under a service contract or tariff, or the NVOCC; LCL by volume or weight | Booking, shipping instructions, bill of lading or sea waybill, arrival notice, customs entry | Booking number, bill of lading number, container number |
| **Air** | A consignment of pieces, priced by chargeable weight, often consolidated into ULDs | The airline, or the forwarder that buys space from it | Master air waybill (electronic, as the e-AWB, where both sides have signed IATA's multilateral agreement), house air waybills, security and customs filings | AWB number, house bill number |

A container number follows the BIC code that ISO 6346 adopted: a three-letter owner code, a fourth letter for the equipment category, a six-digit serial number and a check digit. A SCAC is NMFTA's carrier identifier, "issued and governed exclusively by the NMFTA." Every one of these identifiers is assigned by someone other than the system storing it, and most are reused or reissued over time, which is why the data model keys none of its rows on them.

## How the Money Splits

Every movement is a bundle of separately priced lines, each with a payer and a payee, and in brokered and forwarded freight each line exists twice: once on the sell side, to the customer, and once on the buy side, to the carrier or vendor. The figures from filings and regulations below are cited; every number labeled illustrative is a plain example of the arithmetic, not a market rate.

### A Brokered Truckload

A shipper moves an 800-mile dry van load through a broker on a contract lane; the broker covers it with a carrier at a negotiated rate. Diesel is the EIA's U.S. on-highway average of $5.937 a gallon for the week of November 16, 2026, and both sides use an illustrative fuel schedule that starts at $1.25 a gallon and adds one cent a mile for each six cents above it (78 steps, $0.78 a mile). Pickup ran two hours past the free time:

| Line | Side | Payer | Payee | Amount |
| --- | --- | --- | --- | --- |
| Linehaul, 800 miles at $2.50 (illustrative) | Receivable | Shipper | Broker | $2,000.00 |
| Fuel surcharge, 800 miles at $0.78 | Receivable | Shipper | Broker | $624.00 |
| Detention, 2 hours at $75 (illustrative) | Receivable | Shipper | Broker | $150.00 |
| Linehaul (illustrative) | Payable | Broker | Carrier | $1,700.00 |
| Fuel surcharge, same schedule | Payable | Broker | Carrier | $624.00 |
| Detention, 2 hours at $50 (illustrative) | Payable | Broker | Carrier | $100.00 |
| **Broker gross margin** | | | | **$350.00 (12.6% of $2,774.00)** |
| Quick pay fee, 2% of $2,424.00 (illustrative), if the carrier takes it | Payable | Carrier | Broker | $48.48 |

The broker's revenue is $2,774.00 and its cost of purchased transportation $2,424.00; the spread is what brokers report as net revenue or adjusted gross profit. C.H. Robinson defines adjusted gross profit as "total revenues less the total of purchased transportation and related services and the cost of purchased products sourced for resale"; it was $2.59 billion on $16.2 billion of revenue in 2025, an adjusted gross profit margin of 16.8% across all its services (15.6% in 2024). In its North American truckload business, its average linehaul rate to customers, excluding fuel, rose about 2.5% in 2025 while its linehaul cost per mile rose about 2.0%, and that half-point gap is the business. Brokers that act as principal book the customer's full charge as revenue: C.H. Robinson records most transportation "at the gross amount we charge our customers" because "the carrier's contract is with us, not the customer," and Uber Freight presents its revenue "on a gross basis" with carrier payments in cost of revenue ($5,099 million of Freight revenue in 2025). Compare brokers on adjusted gross profit, never on revenue ([Accounting](/docs/money/accounting#asc-606-and-ifrs-15-in-five-steps)).

Detention exists because a truck's time is the carrier's inventory: the DOT Inspector General estimated in January 2018 that detention cost for-hire truckload drivers $1.1 billion to $1.3 billion a year in earnings and their carriers $250.6 million to $302.9 million in net income, and that each 15-minute increase in average dwell time raises the expected crash rate by 6.2%. The shipper's obligation is statutory where it requires help unloading: a shipper or receiver that needs assistance must provide it "or shall compensate the owner or operator for all costs" (49 U.S.C. 14103).

Two lines on the buy side change who receives the money rather than how much. A **quick pay** fee is the carrier's choice to be paid in days instead of on the broker's standard terms, at a discount; it is a negative payable line, not a lower rate. A **factor** is a payee: when a carrier sells its invoice, the factor sends the broker a notice of assignment, and under UCC 9-406(a), after receiving it the broker "may discharge its obligation by paying the assignee and may not discharge the obligation by paying the assignor." Paying the carrier after a notice means paying twice. Triumph's factoring segment buys "invoices generated by small to medium sized trucking fleets," $11.699 billion of them in 2025, typically without recourse for small owner-operators and with recourse for larger fleets; the factor's fee is between it and the carrier and never appears on the broker's books. The broker's own record of the transaction (the shipper, the carrier and its registration number, the bill of lading number, its compensation and who paid it, and the date it paid the carrier) must be kept for three years, and "each party to a brokered transaction has the right to review" it (49 CFR 371.3).

The rate confirmation that fixes the buy-side lines is the load's contract with the carrier, layered on the broker-carrier agreement, and there's no regulation or published standard that sets its contents; what it carries (rate, accessorials, payment terms, the broker's conditions) varies by broker. <!-- source-gap: logistics-business-rate-confirmation | missing | standard contents of a broker rate confirmation and typical quick pay terms | closes with: a published model broker-carrier agreement or rate confirmation (TIA, a large broker's carrier terms page) | checked: 2026-11-22 -->

### An LTL Shipment

A shipper sends two pallets, each 48 by 40 by 48 inches and 600 pounds, to a business with no dock. Each pallet is 53.33 cubic feet (92,160 cubic inches over 1,728), so its density is 11.25 pounds per cubic foot, which the 13-step density scale NMFTA introduced with its 2025 NMFC changes puts at class 92.5, the band for "10 but less than 12." The carrier rates it on its base tariff and the shipper's discount:

| Line | Payer | Payee | Amount |
| --- | --- | --- | --- |
| Base rate, class 92.5, 12 cwt at $95.00 per cwt (illustrative) | Shipper | Carrier | $1,140.00 |
| Discount, 75% (illustrative) | Carrier | Shipper | ($855.00) |
| Minimum charge check, $125.00 (illustrative): not reached | | | $0.00 |
| Fuel surcharge, 32% of discounted linehaul (illustrative) | Shipper | Carrier | $91.20 |
| Liftgate at delivery (illustrative) | Shipper | Carrier | $95.00 |
| **Total** | | | **$471.20 ($39.27 per cwt)** |

If the carrier's dock scale reads 1,330 pounds instead of 1,200, the shipment is reweighed and re-rated, and the class moves with the density: 665 pounds a pallet is 12.47 pounds per cubic foot, class 85. At an illustrative $88.00 per cwt the base is $1,170.40, the discounted linehaul $292.60, the fuel surcharge $93.63 and the total with liftgate $481.23. The heavier shipment is denser, so its rate per hundredweight falls even as its charge rises; the system that computed $471.20 has to accept the carrier's correction, keep both versions and show why they differ.

For scale, Old Dominion's 2025 LTL revenue per hundredweight was $33.31 and its revenue per shipment $492.01 on an average 1,477 pounds; its fuel surcharges "are generally indexed to fuel prices published by the U.S. Department of Energy." An LTL carrier's profitability is its operating ratio, "total operating expenses by revenue": 75.2% for Old Dominion in 2025, which Freight Class, Density & LTL Pricing and How Carriers, Brokers & 3PLs Make Money take apart.

### An Ocean Import

An importer brings in one 40-foot high-cube container of goods with an entered value of $60,000, booked through an NVOCC, cleared by a customs broker and drayed to its warehouse:

| Line | Payer | Payee | Amount |
| --- | --- | --- | --- |
| Ocean freight, port to port (illustrative) | Importer | NVOCC (which pays the ocean carrier its own rate) | $3,000.00 |
| Duty, 5% of entered value (illustrative general rate; additional duties under Chapter 99 can stack on it) | Importer, often advanced by the broker | CBP | $3,000.00 |
| Merchandise processing fee, 0.3464% of entered value | Importer | CBP | $207.84 |
| Harbor maintenance fee, 0.125% of value | Importer | CBP | $75.00 |
| Entry filing (illustrative) | Importer | Customs broker | $150.00 |
| Importer security filing (illustrative) | Importer | Customs broker or NVOCC | $35.00 |
| Demurrage, 2 days past free time at $175 (illustrative) | Importer | Ocean carrier or terminal | $350.00 |
| Drayage, port to warehouse (illustrative) | Importer | Drayage carrier | $650.00 |
| Chassis, 4 days at $45 (illustrative) | Importer | Drayage carrier or chassis pool | $180.00 |
| Detention (per diem), 3 days late returning the empty at $150 (illustrative) | Importer | Ocean carrier | $450.00 |

The merchandise processing fee is 0.3464% of value for a formal entry, inside a minimum and maximum that the regulation sets at $25 and $485 and CBP adjusts every fiscal year for inflation (19 CFR 24.23); the harbor maintenance fee is "a port use fee of 0.125 percent" of the cargo's value on cargo through the ports the regulation lists (19 CFR 24.24). The government lines are owed to CBP however the broker collects them, and the duty rate on the line comes from the goods' classification, which is where Customs and Trade begins. The detention and demurrage lines carry a deadline: a common carrier's invoice must go out within 30 days of the charge being last incurred, and a late one need not be paid (46 CFR 541.7). A forwarder's or NVOCC's invoice to the importer usually bundles several of these lines; keeping them apart is what lets the importer dispute one.

### An Asset Carrier Load

A truckload carrier hauls a 500-mile load with its own tractor, trailer and employee driver, after 70 empty miles to reach the shipper. The carrier is paid by the shipper (or a broker); its costs are the driver, fuel and the fleet:

| Line | Payer | Payee | Amount |
| --- | --- | --- | --- |
| Linehaul, 500 loaded miles at $2.40 (illustrative) | Shipper | Carrier | $1,200.00 |
| Fuel surcharge, 500 miles at $0.78 | Shipper | Carrier | $390.00 |
| Driver pay, 570 miles at $0.62 (illustrative) | Carrier | Driver | $353.40 |
| Fuel, 570 miles at 6.5 miles a gallon (illustrative) and $5.937 | Carrier | Fuel seller | $520.63 |
| **Left for equipment, insurance, maintenance, overhead and profit** | | | **$715.97** |

The 70 empty miles (12.3% of the trip) are paid for and billed to nobody. Knight-Swift's truckload segment ran 13.9% of its miles without cargo in 2025, on an average length of haul of 368 miles, with average revenue per tractor of $199,897 and 83,650 total miles per tractor (roughly $2.39 a mile driven, my division). What's left after the fleet is small: Knight-Swift defines operating ratio as "operating expenses as a percentage of total revenue, or the inverse of operating margin," and its truckload segment's was 97.0% in 2025 on a GAAP basis (94.8% adjusted). Driver pay models (per mile, per load, percentage, hourly) are payroll ([Workforce](/books/workforce/worker-classification#abc-tests) owns wage-hour and classification).

A leased-on owner-operator changes the cost lines into a settlement. Landstar pays its owner-operators a share of each load's revenue, which "generally ranges from 62% to 70%" when they provide only a tractor and "73% to 77%" with a trailer, and in 2025 it billed customers $229 million of fuel surcharges and "passed 100% of such fuel surcharges" to them. The federal leasing rule requires the lease to state the compensation "clearly," list every chargeback with how it is computed, give the lessor the rated freight bill when pay is a percentage of revenue, and pay "within 15 days after submission of the necessary delivery documents" (49 CFR 376.12).

### A Manufactured Lot From a Supplier

A plant buys 20 pallets of resin on a purchase order. The supplier ships one lot, labels each pallet with a GS1 serial shipping container code (application identifier (00), 18 digits) and the lot code (AI (10), up to 20 characters), and sends an advance ship notice. The plant's routing guide names the carrier, and the freight is collect, so the plant pays it. The receiving inspection fails a moisture test and the lot goes on hold:

| Line | Payer | Payee | Amount |
| --- | --- | --- | --- |
| Goods at PO price, 20 pallets (illustrative) | Plant | Supplier | $48,000.00 |
| Inbound truckload, collect (illustrative) | Plant | Carrier, through its freight payment provider | $1,850.00 |
| Expedited replacement freight, charged back for the rejected lot (illustrative) | Supplier | Plant, as a debit against the supplier's invoice | $3,200.00 |
| Return freight for the rejected lot (illustrative) | Supplier | Carrier | $1,400.00 |

The goods and the freight are separate contracts with separate parties, and the purchase order's delivery term (an Incoterms rule such as FCA, or a domestic FOB term) decides who books and pays the freight and where risk passes. The lot is the unit that quality, traceability and a recall later ask about, so it travels as a column on every line that carries it, from the supplier's ASN to the plant's receipt. Cass, as one freight payment provider, paid 34.451 million transportation invoices worth $36.447 billion in 2025 (about $1,058 an invoice on average, my division), and "remits payment of invoices prior to receiving funds from its customers" in some cases.

### One Rule for All of Them

Most of the rules in this volume govern one row of these tables: what a carrier may bill for detention and when, what a broker must keep about its compensation, who may be paid after a notice of assignment, when a demurrage invoice stops being payable, what fee CBP collects on an entry, how a leased owner-operator's chargebacks are disclosed. My rule: store every charge as a line with its side (receivable or payable), its payer and payee, its kind and code, its quantity and rate, and its source (the contract, tariff, quote, tender, event or invoice that produced it), and compute every total (the shipper's bill, the carrier's pay, the broker's margin, the importer's landed cost, the plant's freight accrual) as a sum over lines. A total stored without its lines can't be audited against a carrier's invoice, disputed one accessorial at a time, re-rated after a reweigh, or shown to an auditor.

## The Life of a Shipment

The same few records move through every mode; what differs is who creates them, how many hands they pass through, and when the money moves.

**A domestic truckload or LTL shipment.** A sales order or purchase order becomes demand to move goods (the **order**). A planner, or a TMS, turns some of its lines into **shipments**, each from one origin to one destination under one bill of lading, packed into **handling units**. Shipments that fit together are planned onto a **load** with **stops** at each facility, inside appointment windows set in each facility's time zone. The load is **tendered** to a carrier, over EDI as a 204 load tender answered by a 990, or through an API, a portal or a load board; the tender expires if unanswered, and a rejection sends it to the next carrier in the routing guide or to the spot market. The carrier dispatches a driver and equipment; at **pickup** the driver signs a bill of lading naming the consignor and consignee, origin and destination, number of packages, description of the freight and its weight where weight rates it (49 CFR 373.101). **Tracking** events arrive as 214 status messages, API calls, ELD positions and app check-ins, each with the time it happened and, separately, the time the system learned it. At **delivery** the consignee signs a delivery receipt, or the carrier captures a photo; that **proof of delivery** gates the **invoice**, a 210 or a PDF, which is **audited** against the agreed lines and the events that justify accessorials, approved, and **paid** on terms, by quick pay or to a factor.

**An ocean import.** The importer or its NVOCC books space with an ocean carrier (DCSA publishes Booking, Bill of Lading, Track & Trace and Arrival Notice standards for these exchanges). The importer security filing goes in 24 hours before the container is laden abroad, and the carrier's cargo declaration on the same clock. The container is stuffed, gated in, loaded and sailed; the carrier issues a bill of lading or sea waybill, and the NVOCC its house bill. On arrival the carrier sends an arrival notice, the customs broker files the entry and, within 10 working days of entry, the entry summary with estimated duties; CBP releases the goods, or holds them for an exam or a partner agency. A drayage carrier picks up the container within free time if it can, on a terminal appointment, with a chassis; the warehouse unloads it, and the empty goes back to the carrier's yard. Every day past free time at the terminal is demurrage, and every day the empty stays out is detention or per diem, each billed within 30 days of the last day.

**A manufactured lot.** A plant's planning system releases a purchase order or a supplier schedule against forecast and production needs. The supplier makes a lot, records its genealogy, ships it with an ASN and labels carrying the SSCC and lot code, and the plant's carrier moves it. The plant receives against the ASN, inspects the lot, and releases, quarantines or rejects it; a released lot is consumed into work orders whose finished lots record which input lots they used. If a defect surfaces later, that genealogy is how the plant finds every finished lot and every customer shipment that carried the bad input, inside a regulator's clock (five working days to report a vehicle defect to NHTSA, for example).

Across all three, the order is what was wanted, the shipment is what was handed to a carrier, and the load is what a vehicle carried. One order ships as several shipments; one load carries shipments from many orders and many shippers; one container's shipment rides three loads (a dray, a rail move and another dray). That split is the spine of the data model.

## The Core Data Model

Every company in this volume converges on the same concepts under different names: an Oracle order release, an SAP freight unit and a shipper's BOL line are all shipments; a broker's load, a carrier's trip, a rail waybill's movement and a forwarder's consolidation are all loads; a carrier's terminal, a customer's dock and a port terminal are all facilities. The volume uses one set of names, and every later chapter's How to Build It extends it rather than redefining it:

| Entity | Table | What it is |
| --- | --- | --- |
| **party** | `parties` | An organization or person that appears in any role: a shipper, carrier, broker, factor, plant, port |
| **party role** | `party_roles` | A role a party plays, with its validity; one party has many |
| **carrier** | `carriers` | The carrier facts about a party that hauls: SCAC, USDOT number, docket number, modes, authority status |
| **facility** | `facilities` | A place freight moves to, from or through, with its time zone and operator |
| **item** | `items` | A thing that ships, as its owner identifies it, with its freight class and hazmat flag |
| **lot** | `lots` | A batch of an item made together and traced as one |
| **order** | `orders`, `order_lines` | The commercial demand: a sales, purchase, transfer or return order |
| **shipment** | `shipments`, `shipment_lines` | Goods under one bill of lading from one origin to one destination, with its parties and identifiers |
| **handling unit** | `handling_units` | What is physically handled: a pallet, carton, crate or drum, with dimensions, weight and SSCC |
| **load** | `loads`, `load_shipments` | One vehicle's or container's trip, carrying one or more shipments |
| **stop** | `stops`, `stop_shipments` | A facility visit on a load, with its appointment and actual times, and which shipments it picks or drops |
| **tender** | `tenders` | An offer of a load to a carrier and the carrier's answer |
| **rate agreement and lane rate** | `rate_agreements`, `lane_rates` | A contract, tariff or quote, and the priced lanes inside it |
| **freight charge** | `freight_charges` | Every priced line, receivable or payable, with payer, payee, kind and source |
| **shipment event** | `shipment_events` | A milestone or position as reported, with event time and received time |
| **equipment unit** | `equipment_units` | A tractor, trailer, container, chassis, railcar or ULD |
| **driver** | `drivers` | A person who drives for a carrier, employed or leased on |
| **document** | `documents` | A bill of lading, rate confirmation, POD, invoice, waybill or EDI message, as exchanged |
| **freight invoice** | `freight_invoices`, `freight_invoice_lines` | A bill for freight sent to a customer or received from a carrier, with its lines as billed |

Seven splits matter in every chapter:

- **Order versus shipment versus load.** The order is the commercial demand and belongs to the buyer and seller; the shipment is the goods tendered under one bill of lading and belongs to the shipper; the load is the vehicle's trip and belongs to whoever plans it. A broker never sees the order; a carrier often sees only the load; a shipper's TMS sees all three. Linking them is `shipment_lines.order_line_id` and `load_shipments`, both many-to-many in practice.
- **One organization, many roles.** A party is one row however many roles it plays, and `party_roles` says which. Carrier-specific facts sit in `carriers`, keyed by the party, so a broker that also runs trucks is one party with two roles, and a carrier's invoice, a shipper's bill and a factor's notice all point at parties.
- **Buy side versus sell side on every charge.** `freight_charges.side` says whether a line is receivable (a customer owes it) or payable (it's owed to a carrier or vendor), and the same accessorial exists on both sides with different amounts. Margin is the sum of one side minus the other, per load or shipment, never a stored number.
- **Planned versus actual.** An appointment is a range on the stop; an arrival is a timestamp on the stop, set from the event that proved it. A pickup window on the shipment is what was asked; the tender's expiry is what was offered; the event is what happened. Detention, on-time measures and claims all compare one with the other, so neither overwrites the other.
- **Event time versus received time.** A 214 that says a truck arrived at 14:05 may arrive at 17:20. `shipment_events.occurred_at` is when it happened and `received_at` when the system learned it ([Two Kinds of Time](/docs/database/temporal-data#two-kinds-of-time)); ETAs and exceptions run on the first, latency and partner scorecards on the second.
- **Facility versus address.** An address is where mail goes; a facility is a dock with an operator, hours, an appointment rule, a gate location and a time zone ([Time Zone From the Place](/docs/fundamentals/addresses#time-zone-from-the-place)). Two facilities can share an address (a plant's receiving and shipping docks); one facility outlives a change of address.
- **Handling unit versus line.** A line is what the goods are (an item, a lot, a quantity, a class); a handling unit is how they are packaged and handled (a pallet's dimensions and weight, its SSCC). Density is weight over cube, measured per handling unit as tendered, and a density-based class follows it; a pallet can carry several lines and a line can span several pallets.

The spine, in the playbook's [naming conventions](/docs/database/naming-conventions), with amounts in integer minor units ([Integer Minor Units](/docs/money/amounts#integer-minor-units)) and weights in grams and dimensions in millimeters, converted once at the edge; columns each chapter owns (customs, claims, hours of service, warehouse locations, quality) are added there:

```sql
CREATE TABLE parties (                   -- an organization or person in any role
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  kind          TEXT NOT NULL CHECK (kind IN ('organization', 'person')),
  legal_name    TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  country       CHAR(2),                 -- ISO 3166-1 alpha-2, where it is domiciled
  external_refs JSONB NOT NULL DEFAULT '{}',  -- ERP, TMS and partner IDs, keyed by system
  status        TEXT NOT NULL CHECK (status IN ('prospect', 'active', 'on_hold', 'blocked',
                  'closed')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE party_roles (               -- one party, many roles
  party_id     UUID NOT NULL REFERENCES parties (id),
  role         TEXT NOT NULL CHECK (role IN ('shipper', 'consignee', 'bill_to',
                 'beneficial_cargo_owner', 'carrier', 'broker', 'freight_forwarder', 'nvocc',
                 'customs_broker', 'importer_of_record', 'warehouse_operator',
                 'terminal_operator', 'factor', 'freight_payment_provider', 'manufacturer',
                 'supplier', 'notify_party')),
  valid_during TSTZRANGE NOT NULL DEFAULT tstzrange(NOW(), NULL),
  PRIMARY KEY (party_id, role)
);

CREATE TABLE carriers (                  -- carrier facts about a party with the carrier role
  party_id         UUID PRIMARY KEY REFERENCES parties (id),
  scac             TEXT UNIQUE,          -- NMFTA's Standard Carrier Alpha Code
  usdot_number     TEXT UNIQUE,          -- FMCSA's unique identifier for regulated entities
  docket_number    TEXT,                 -- an MC or FF number, still issued in 2026
  modes            TEXT[] NOT NULL CHECK (modes <@ ARRAY['parcel', 'ltl', 'truckload',
                     'drayage', 'intermodal', 'rail', 'ocean', 'air']::TEXT[]),
  fleet_kind       TEXT CHECK (fleet_kind IN ('asset', 'non_asset', 'owner_operator')),
  authority_status TEXT NOT NULL CHECK (authority_status IN ('active', 'pending', 'inactive',
                     'revoked', 'not_required')),
  checked_at       TIMESTAMPTZ           -- the last registry and insurance check
);

CREATE TABLE facilities (                -- a place freight moves to, from or through
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  operator_party_id    UUID REFERENCES parties (id),
  kind                 TEXT NOT NULL CHECK (kind IN ('plant', 'distribution_center',
                         'warehouse', 'store', 'customer_site', 'cross_dock',
                         'carrier_terminal', 'port_terminal', 'container_yard', 'rail_ramp',
                         'rail_yard', 'airport_cargo', 'border_crossing')),
  name                 TEXT NOT NULL,
  address_id           UUID,             -- the playbook's addresses table
  gate                 GEOGRAPHY(Point, 4326),  -- where trucks enter, not the address centroid
  time_zone            TEXT NOT NULL,    -- IANA; appointments display in this zone
  country              CHAR(2) NOT NULL,
  subdivision          TEXT,             -- ISO 3166-2; state rules resolve from here
  gln                  TEXT,             -- GS1 Global Location Number, where assigned
  external_refs        JSONB NOT NULL DEFAULT '{}',  -- terminal, port and customs codes
  appointment_required BOOLEAN NOT NULL DEFAULT FALSE,
  status               TEXT NOT NULL CHECK (status IN ('active', 'inactive'))
);

CREATE TABLE items (                     -- a thing that ships, as its owner identifies it
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_party_id UUID NOT NULL REFERENCES parties (id),
  sku            TEXT NOT NULL,
  description    TEXT NOT NULL,          -- as it must read on a bill of lading
  gtin           TEXT,
  nmfc_item      TEXT,                   -- the NMFC item and sub
  freight_class  NUMERIC(4, 1),          -- the default; density items resolve per handling unit
  hazmat         BOOLEAN NOT NULL DEFAULT FALSE,
  unit_weight_g  BIGINT CHECK (unit_weight_g > 0),
  lot_tracked    BOOLEAN NOT NULL DEFAULT FALSE,
  serial_tracked BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (owner_party_id, sku)
);

CREATE TABLE lots (                      -- a batch made together, traced as one
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id               UUID NOT NULL REFERENCES items (id),
  manufacturer_party_id UUID NOT NULL REFERENCES parties (id),
  lot_code              TEXT NOT NULL CHECK (length(lot_code) <= 20),  -- GS1 AI (10)
  made_at_facility_id   UUID REFERENCES facilities (id),
  produced_on           DATE,
  expires_on            DATE,
  status                TEXT NOT NULL CHECK (status IN ('released', 'quarantined', 'on_hold',
                          'rejected', 'recalled', 'consumed')),
  UNIQUE (item_id, manufacturer_party_id, lot_code)
);

CREATE TABLE orders (                    -- the commercial demand
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_party_id        UUID NOT NULL REFERENCES parties (id),  -- whose order number it is
  kind                  TEXT NOT NULL CHECK (kind IN ('sales', 'purchase', 'transfer',
                          'return')),
  number                TEXT NOT NULL,
  buyer_party_id        UUID NOT NULL REFERENCES parties (id),
  seller_party_id       UUID NOT NULL REFERENCES parties (id),
  ship_from_facility_id UUID REFERENCES facilities (id),
  ship_to_facility_id   UUID REFERENCES facilities (id),
  delivery_term         TEXT,            -- the Incoterms rule or domestic FOB term, as agreed
  requested_window      TSTZRANGE,
  status                TEXT NOT NULL CHECK (status IN ('open', 'planned',
                          'partially_shipped', 'shipped', 'closed', 'cancelled')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (owner_party_id, kind, number)
);

CREATE TABLE order_lines (
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id    UUID NOT NULL REFERENCES orders (id),
  line_number INT NOT NULL,
  item_id     UUID NOT NULL REFERENCES items (id),
  lot_id      UUID REFERENCES lots (id),  -- when the order names a lot
  quantity    NUMERIC(14, 3) NOT NULL CHECK (quantity > 0),
  uom         TEXT NOT NULL,              -- the unit code as exchanged: 'EA', 'CS', 'KG'
  status      TEXT NOT NULL CHECK (status IN ('open', 'allocated', 'shipped', 'cancelled')),
  UNIQUE (order_id, line_number)
);

CREATE TABLE shipments (                 -- goods under one bill of lading, one origin, one destination
  id                      UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_party_id          UUID NOT NULL REFERENCES parties (id),  -- whose record this is
  shipper_party_id        UUID NOT NULL REFERENCES parties (id),
  consignee_party_id      UUID NOT NULL REFERENCES parties (id),
  bill_to_party_id        UUID NOT NULL REFERENCES parties (id),
  origin_facility_id      UUID NOT NULL REFERENCES facilities (id),
  destination_facility_id UUID NOT NULL REFERENCES facilities (id),
  mode                    TEXT NOT NULL CHECK (mode IN ('parcel', 'ltl', 'truckload',
                            'intermodal', 'rail', 'ocean_fcl', 'ocean_lcl', 'air')),
  service_level           TEXT,          -- 'standard', 'guaranteed', 'expedited', or the carrier's
  payment_terms           TEXT NOT NULL CHECK (payment_terms IN ('prepaid', 'collect',
                            'third_party')),
  bol_number              TEXT,          -- the shipper's bill of lading number
  pro_number              TEXT,          -- an LTL carrier's tracking number
  house_bill_number       TEXT,          -- a forwarder's or NVOCC's bill
  master_bill_number      TEXT,          -- the carrier's bill of lading or master air waybill
  pickup_window           TSTZRANGE,     -- as requested
  delivery_window         TSTZRANGE,
  declared_value          BIGINT CHECK (declared_value >= 0),  -- liability under released rates
  currency                CHAR(3) NOT NULL,
  status                  TEXT NOT NULL CHECK (status IN ('draft', 'planned', 'tendered',
                            'booked', 'picked_up', 'in_transit', 'delivered', 'exception',
                            'cancelled')),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (owner_party_id, bol_number)
);

CREATE TABLE handling_units (            -- what is physically handled
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  shipment_id UUID NOT NULL REFERENCES shipments (id),
  parent_id   UUID REFERENCES handling_units (id),  -- a carton on a pallet
  kind        TEXT NOT NULL CHECK (kind IN ('pallet', 'carton', 'crate', 'drum', 'tote',
                'bundle', 'roll', 'piece')),
  sscc        CHAR(18) UNIQUE,           -- GS1 AI (00)
  length_mm   INT CHECK (length_mm > 0), -- including overhang, as density is measured
  width_mm    INT CHECK (width_mm > 0),
  height_mm   INT CHECK (height_mm > 0),
  weight_g    BIGINT CHECK (weight_g > 0),
  stackable   BOOLEAN NOT NULL DEFAULT TRUE,
  CHECK (parent_id IS NULL OR parent_id <> id)
);

CREATE TABLE shipment_lines (            -- what goods, how many, from which order line
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  shipment_id      UUID NOT NULL REFERENCES shipments (id),
  order_line_id    UUID REFERENCES order_lines (id),  -- null: freight with no order here
  handling_unit_id UUID REFERENCES handling_units (id),
  item_id          UUID REFERENCES items (id),
  lot_id           UUID REFERENCES lots (id),
  description      TEXT NOT NULL,        -- snapshot, as printed on the bill of lading
  quantity         NUMERIC(14, 3) NOT NULL CHECK (quantity > 0),
  uom              TEXT NOT NULL,
  weight_g         BIGINT NOT NULL CHECK (weight_g > 0),
  freight_class    NUMERIC(4, 1),        -- snapshot, as rated
  nmfc_item        TEXT,
  hazmat           BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE equipment_units (           -- a tractor, trailer, container, chassis, railcar or ULD
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_party_id UUID REFERENCES parties (id),  -- null: not known, as for most containers seen
  kind           TEXT NOT NULL CHECK (kind IN ('tractor', 'trailer', 'container', 'chassis',
                   'railcar', 'uld')),
  identifier     TEXT NOT NULL,          -- unit number, container number, reporting marks
  equipment_type TEXT,                   -- '53_dry_van', '53_reefer', '48_flatbed', '40_high_cube'
  vin            CHAR(17),
  status         TEXT NOT NULL CHECK (status IN ('active', 'out_of_service', 'retired')),
  UNIQUE NULLS NOT DISTINCT (kind, owner_party_id, identifier)
);

CREATE TABLE drivers (                   -- a person who drives for a carrier
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  carrier_party_id UUID NOT NULL REFERENCES parties (id),
  person_party_id  UUID NOT NULL REFERENCES parties (id),  -- an owner-operator is a party too
  engagement       TEXT NOT NULL CHECK (engagement IN ('employee', 'leased_owner_operator')),
  cdl_country      CHAR(2),
  cdl_subdivision  TEXT,                 -- the issuing state or province
  cdl_number_ref   TEXT,                 -- a vault reference, never the number itself
  status           TEXT NOT NULL CHECK (status IN ('onboarding', 'active', 'inactive',
                     'terminated')),
  UNIQUE (carrier_party_id, person_party_id)
);

CREATE TABLE loads (                     -- one vehicle's or container's trip
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_party_id   UUID NOT NULL REFERENCES parties (id),  -- the shipper, broker or carrier planning it
  number           TEXT NOT NULL,
  mode             TEXT NOT NULL CHECK (mode IN ('ltl_linehaul', 'truckload', 'drayage',
                     'intermodal_rail', 'rail', 'ocean', 'air', 'pickup_delivery')),
  carrier_party_id UUID REFERENCES parties (id),  -- set when a tender is accepted
  equipment_type   TEXT,
  tractor_id       UUID REFERENCES equipment_units (id),
  trailer_id       UUID REFERENCES equipment_units (id),  -- or the container
  driver_id        UUID REFERENCES drivers (id),
  planned_miles    NUMERIC(8, 1),
  status           TEXT NOT NULL CHECK (status IN ('planning', 'tendered', 'covered',
                     'dispatched', 'in_transit', 'delivered', 'closed', 'cancelled')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (owner_party_id, number)
);

CREATE TABLE load_shipments (            -- which shipments ride which load, by leg
  load_id     UUID NOT NULL REFERENCES loads (id),
  shipment_id UUID NOT NULL REFERENCES shipments (id),
  leg         SMALLINT NOT NULL DEFAULT 1 CHECK (leg > 0),  -- dray, rail, dray as 1, 2, 3
  PRIMARY KEY (load_id, shipment_id)
);

CREATE TABLE stops (                     -- a facility visit on a load
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  load_id         UUID NOT NULL REFERENCES loads (id),
  sequence        SMALLINT NOT NULL CHECK (sequence > 0),
  facility_id     UUID NOT NULL REFERENCES facilities (id),
  kind            TEXT NOT NULL CHECK (kind IN ('pickup', 'delivery', 'pickup_delivery',
                    'cross_dock', 'interchange', 'border')),
  handling        TEXT CHECK (handling IN ('live', 'drop', 'preloaded')),
  appointment     TSTZRANGE,             -- planned; shown in the facility's time zone
  appointment_ref TEXT,                  -- the facility's confirmation number
  arrived_at      TIMESTAMPTZ,           -- actual, from the event that proved it
  departed_at     TIMESTAMPTZ,
  UNIQUE (load_id, sequence),
  CHECK (departed_at IS NULL OR arrived_at IS NULL OR departed_at >= arrived_at)
);

CREATE TABLE stop_shipments (            -- what each stop picks up or drops off
  stop_id     UUID NOT NULL REFERENCES stops (id),
  shipment_id UUID NOT NULL REFERENCES shipments (id),
  action      TEXT NOT NULL CHECK (action IN ('pick', 'drop')),
  PRIMARY KEY (stop_id, shipment_id, action)
);

CREATE TABLE documents (                 -- paper and messages, as exchanged
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  kind                  TEXT NOT NULL CHECK (kind IN ('bill_of_lading', 'rate_confirmation',
                          'proof_of_delivery', 'delivery_receipt', 'lumper_receipt',
                          'freight_invoice', 'ocean_bill_of_lading', 'sea_waybill',
                          'air_waybill', 'arrival_notice', 'commercial_invoice',
                          'packing_list', 'customs_entry', 'notice_of_assignment',
                          'certificate_of_insurance', 'load_tender', 'tender_response',
                          'status_message', 'ship_notice', 'other')),
  direction             TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  counterparty_party_id UUID NOT NULL REFERENCES parties (id),
  number                TEXT NOT NULL,   -- the document's own number, or the BOL or PRO it proves
  shipment_id           UUID REFERENCES shipments (id),
  load_id               UUID REFERENCES loads (id),
  format                TEXT NOT NULL CHECK (format IN ('pdf', 'image', 'x12', 'edifact',
                          'json', 'xml', 'csv')),
  content_ref           TEXT NOT NULL,   -- object storage key; the bytes as exchanged
  sha256                BYTEA NOT NULL,
  issued_at             TIMESTAMPTZ,
  received_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (kind, direction, counterparty_party_id, number)
);

CREATE TABLE rate_agreements (           -- a contract, tariff or quote that prices freight
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  side            TEXT NOT NULL CHECK (side IN ('receivable', 'payable')),
  owner_party_id  UUID NOT NULL REFERENCES parties (id),
  counterparty_id UUID NOT NULL REFERENCES parties (id),  -- the customer, or the carrier or vendor
  kind            TEXT NOT NULL CHECK (kind IN ('contract', 'tariff', 'spot_quote',
                    'rate_confirmation', 'service_contract')),
  mode            TEXT NOT NULL,
  currency        CHAR(3) NOT NULL,
  valid_during    TSTZRANGE NOT NULL,
  document_id     UUID REFERENCES documents (id),  -- the signed agreement or confirmation
  status          TEXT NOT NULL CHECK (status IN ('draft', 'active', 'expired', 'superseded'))
);

CREATE TABLE lane_rates (                -- one priced lane inside an agreement
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  rate_agreement_id UUID NOT NULL REFERENCES rate_agreements (id),
  origin            TEXT NOT NULL,       -- a key: 'zip3:606', 'state:US-IL', 'facility:<id>'
  destination       TEXT NOT NULL,
  equipment_type    TEXT,
  basis             TEXT NOT NULL CHECK (basis IN ('flat', 'per_mile', 'per_cwt',
                      'per_container', 'per_kg', 'per_pallet', 'tariff_discount')),
  rate              NUMERIC(14, 4),      -- minor units per basis unit; null for a discount
  discount_bp       INT CHECK (discount_bp BETWEEN 0 AND 10000),  -- off a base tariff
  minimum_charge    BIGINT CHECK (minimum_charge >= 0),
  fuel_schedule     TEXT,                -- the fuel surcharge table this lane uses
  valid_during      TSTZRANGE NOT NULL,
  CHECK ((basis = 'tariff_discount') = (discount_bp IS NOT NULL)),
  CHECK ((basis = 'tariff_discount') = (rate IS NULL))
);

CREATE TABLE tenders (                   -- a load offered to a carrier, and the answer
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  load_id              UUID NOT NULL REFERENCES loads (id),
  carrier_party_id     UUID NOT NULL REFERENCES parties (id),
  tendered_by_party_id UUID NOT NULL REFERENCES parties (id),
  channel              TEXT NOT NULL CHECK (channel IN ('edi_204', 'api', 'portal', 'email',
                         'load_board', 'phone')),
  lane_rate_id         UUID REFERENCES lane_rates (id),  -- null: a spot offer
  amount               BIGINT,           -- the offered rate, minor units
  currency             CHAR(3) NOT NULL,
  sent_at              TIMESTAMPTZ NOT NULL,
  expires_at           TIMESTAMPTZ NOT NULL,
  responded_at         TIMESTAMPTZ,
  status               TEXT NOT NULL CHECK (status IN ('sent', 'accepted', 'rejected',
                         'expired', 'withdrawn', 'superseded')),
  response_code        TEXT,             -- as received, e.g. a 990's action code
  external_ref         TEXT,             -- the shipment ID the 204 carried
  CHECK (expires_at > sent_at)
);

CREATE TABLE freight_invoices (          -- a bill for freight, sent or received
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  side             TEXT NOT NULL CHECK (side IN ('receivable', 'payable')),
  issuer_party_id  UUID NOT NULL REFERENCES parties (id),
  bill_to_party_id UUID NOT NULL REFERENCES parties (id),
  payee_party_id   UUID NOT NULL REFERENCES parties (id),  -- a factor after a notice of assignment
  number           TEXT NOT NULL,
  invoice_date     DATE NOT NULL,
  due_date         DATE NOT NULL,
  currency         CHAR(3) NOT NULL,
  stated_total     BIGINT NOT NULL,      -- as the issuer printed it; audit compares the lines
  status           TEXT NOT NULL CHECK (status IN ('draft', 'issued', 'received', 'in_audit',
                     'approved', 'disputed', 'short_paid', 'paid', 'void')),
  document_id      UUID REFERENCES documents (id),
  UNIQUE (side, issuer_party_id, number)
);

CREATE TABLE freight_invoice_lines (     -- each line as billed
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  freight_invoice_id UUID NOT NULL REFERENCES freight_invoices (id),
  shipment_id        UUID REFERENCES shipments (id),
  load_id            UUID REFERENCES loads (id),
  kind               TEXT NOT NULL,      -- mapped to a freight_charges kind
  code               TEXT,               -- as billed, e.g. a 210's special charge code
  description        TEXT,
  quantity           NUMERIC(14, 3),
  rate               NUMERIC(14, 4),
  amount             BIGINT NOT NULL,    -- signed minor units; a discount is negative
  CHECK (shipment_id IS NOT NULL OR load_id IS NOT NULL)
);

CREATE TABLE freight_charges (           -- every priced line, on both sides
  id                      UUID PRIMARY KEY DEFAULT uuidv7(),
  side                    TEXT NOT NULL CHECK (side IN ('receivable', 'payable')),
  shipment_id             UUID REFERENCES shipments (id),
  load_id                 UUID REFERENCES loads (id),
  payer_party_id          UUID NOT NULL REFERENCES parties (id),
  payee_party_id          UUID NOT NULL REFERENCES parties (id),
  kind                    TEXT NOT NULL CHECK (kind IN ('linehaul', 'fuel_surcharge',
                            'accessorial', 'detention', 'layover', 'truck_ordered_not_used',
                            'lumper', 'stop_off', 'minimum_adjustment', 'discount', 'reweigh',
                            'demurrage', 'per_diem', 'chassis', 'terminal_handling',
                            'drayage', 'ocean_freight', 'air_freight', 'duty',
                            'government_fee', 'brokerage_fee', 'filing_fee',
                            'quick_pay_fee', 'chargeback', 'other')),
  code                    TEXT,          -- the accessorial or charge code its source uses
  quantity                NUMERIC(14, 3),  -- miles, hours, cwt, days
  rate                    NUMERIC(14, 4),  -- minor units per unit
  amount                  BIGINT NOT NULL,  -- signed minor units, rounded once
  currency                CHAR(3) NOT NULL,
  source                  TEXT NOT NULL CHECK (source IN ('contract', 'tariff', 'spot_quote',
                            'tender', 'rate_confirmation', 'carrier_invoice', 'event',
                            'government', 'manual')),
  rate_agreement_id       UUID REFERENCES rate_agreements (id),
  lane_rate_id            UUID REFERENCES lane_rates (id),
  evidence_document_id    UUID REFERENCES documents (id),  -- the lumper receipt, the POD
  freight_invoice_line_id UUID REFERENCES freight_invoice_lines (id),  -- once billed or matched
  status                  TEXT NOT NULL CHECK (status IN ('estimated', 'accrued', 'billed',
                            'approved', 'disputed', 'void')),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (shipment_id IS NOT NULL OR load_id IS NOT NULL),
  CHECK (payer_party_id <> payee_party_id)
);

CREATE TABLE shipment_events (           -- a milestone or position, as reported
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  shipment_id  UUID REFERENCES shipments (id),
  load_id      UUID REFERENCES loads (id),
  stop_id      UUID REFERENCES stops (id),
  equipment_id UUID REFERENCES equipment_units (id),
  code         TEXT NOT NULL CHECK (code IN ('booked', 'pickup_arrived', 'picked_up',
                 'departed', 'position', 'arrived', 'out_for_delivery', 'delivery_arrived',
                 'delivered', 'gate_in', 'gate_out', 'loaded', 'discharged', 'available',
                 'customs_released', 'hold', 'exception', 'eta_updated')),
  classifier   TEXT NOT NULL DEFAULT 'actual' CHECK (classifier IN ('planned', 'estimated',
                 'actual')),
  source       TEXT NOT NULL CHECK (source IN ('edi_214', 'edi_315', 'rail_edi', 'api',
                 'dcsa', 'iata', 'eld', 'driver_app', 'geofence', 'manual')),
  source_code  TEXT,                     -- as received, e.g. a 214 status code
  reason_code  TEXT,                     -- as received
  occurred_at  TIMESTAMPTZ NOT NULL,     -- when it happened, per the reporter
  reported_tz  TEXT,                     -- the zone the reporter stated, kept for display
  received_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- when this system learned it
  position     GEOGRAPHY(Point, 4326),
  facility_id  UUID REFERENCES facilities (id),
  document_id  UUID REFERENCES documents (id),  -- the message it arrived in
  dedupe_key   TEXT NOT NULL UNIQUE,     -- source, reporter, code, subject and occurred_at
  CHECK (shipment_id IS NOT NULL OR load_id IS NOT NULL OR equipment_id IS NOT NULL)
);

CREATE INDEX ON shipment_events (shipment_id, occurred_at);
CREATE INDEX ON shipment_events (load_id, occurred_at);
CREATE INDEX ON freight_charges (load_id, side);
CREATE INDEX ON freight_charges (shipment_id, side);

CREATE VIEW load_margins AS              -- margin is a sum over lines, never a column
SELECT load_id,
       currency,
       SUM(amount) FILTER (WHERE side = 'receivable') AS revenue,
       SUM(amount) FILTER (WHERE side = 'payable')    AS purchased_transportation,
       COALESCE(SUM(amount) FILTER (WHERE side = 'receivable'), 0)
         - COALESCE(SUM(amount) FILTER (WHERE side = 'payable'), 0) AS margin
FROM freight_charges
WHERE load_id IS NOT NULL AND status <> 'void'
GROUP BY load_id, currency;
```

A broker's question at month end, which loads delivered but haven't been billed, reads straight off the spine:

```sql
SELECT l.id, l.number, s.arrived_at AS delivered_at
FROM loads l
JOIN stops s ON s.load_id = l.id
WHERE l.owner_party_id = $1
  AND l.status = 'delivered'
  AND s.kind = 'delivery'
  AND s.sequence = (SELECT max(sequence) FROM stops WHERE load_id = l.id)
  AND NOT EXISTS (
    SELECT 1 FROM freight_charges c
    WHERE c.load_id = l.id AND c.side = 'receivable' AND c.status IN ('billed', 'approved')
  )
ORDER BY s.arrived_at;
```

Design notes:

- **Keys are this system's, identifiers are the world's.** Every row has a UUIDv7 key; a SCAC, USDOT number, PRO, BOL, container number or AWB number is a column, unique only in the scope its issuer guarantees. Container numbers are reused across trips, PROs are recycled by some carriers, a BOL number is unique only to its shipper, and FMCSA's Motus notice leaves the elimination of MC and FF numbers to a later release. Matching an inbound message to a record is a lookup on identifiers plus dates, never a primary key ([Mapping Their Schema to Yours](/docs/building-blocks/integrations#mapping-their-schema-to-yours)).
- **Tenancy follows the owner.** `owner_party_id` on orders, shipments, loads and rate agreements is whose record it is; a shipper's TMS, a broker's TMS and a carrier's dispatch system each hold their own copy of the same physical movement. A software vendor serving many of them adds a tenant above parties as [Tenant Hierarchies](/docs/architecture/multi-tenancy#tenant-hierarchies) describes, and a party known to two tenants is two rows unless they agree to share.
- **Facilities resolve time and rules.** An appointment is a `TSTZRANGE`, stored as instants and displayed in `facilities.time_zone`; an EDI message's local date and time is converted with the zone of the facility it names, not the server's. Detention clocks, cutoffs and on-time measures compute in the facility's zone.
- **Rates are not amounts.** `lane_rates.rate` and `freight_charges.rate` are minor units per unit with four decimals, because a per-mile or per-hundredweight rate often isn't a whole cent; the line's `amount` is an integer, rounded once when quantity meets rate ([Rounding](/docs/money/amounts#rounding)).
- **Charges are estimated, then accrued, then billed.** A tender creates estimated payable charges; pickup turns them into accruals, which is the purchased transportation a month-end close needs; the carrier's invoice is matched line by line through `freight_invoice_line_id`. A charge never changes amount after it is billed: a correction is a new line, and the old one is voided with a reason.
- **Payee is on the invoice, not the carrier.** A carrier's bank account and remit-to change when it signs with a factor, and a notice of assignment applies from the day it's received. `freight_invoices.payee_party_id` records who was owed on that invoice; Paying Carriers, Quick Pay & Factoring adds the notices and remit-to history that set it, and [Stopping the Changed Bank Account](/books/payments/vendor-payouts#stopping-the-changed-bank-account) owns the controls on changing one.
- **Events are append-only and deduplicated.** The same arrival can come by 214, API and geofence, and a carrier can resend a day of 214s. `dedupe_key` drops exact repeats; conflicting reports are kept and the stop's `arrived_at` is set from the one the system trusts, with the choice recorded ([Arrival and Departure Detection](/docs/building-blocks/location-tracking#arrival-and-departure-detection)).
- **Documents are kept as exchanged.** A signed BOL, a POD photo, a lumper receipt and a 214 are evidence in a claim, an accessorial dispute or a detention invoice; `documents` keeps the bytes and their hash, and parsed copies live in the owning tables.
- **Personal data stays thin.** Drivers and owner-operators are people: a CDL number lives in a vault and the row holds a reference; positions are personal data when they track a person's vehicle ([Coordinates & Geometry](/docs/fundamentals/coordinates-and-geometry)).
- **Emit life-cycle events.** `shipment.planned`, `load.tendered`, `tender.accepted`, `tender.rejected`, `stop.arrived`, `stop.departed`, `shipment.delivered`, `freight_charge.accrued`, `freight_invoice.received` and `freight_invoice.approved` are what visibility, billing, audit, accounting and customer notifications subscribe to ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

The records map onto the [Commerce](/books/commerce/commerce-business#the-core-data-model) volume's where both books meet a movement. A Commerce `fulfillments` row (some of an order's lines, from one location, by one provider) is the demand for a logistics `shipments` row, and its `fulfillment_lines` become `shipment_lines`. A Commerce `shipments` row (a parcel or load with a tracking number) is a logistics shipment for parcel and LTL, and for a truckload its carrier and trailer belong to a logistics `loads` row. A Commerce `locations` row of kind warehouse or store is a logistics `facilities` row operated by the merchant's party, or by a 3PL's. Commerce `documents` and logistics `documents` have the same shape, with a party in place of Commerce's counterparty text. A merchant is a party with the shipper role, and a Commerce item is a logistics item owned by that party.

Each later chapter extends a defined part of this spine. The chapters, the core tables each one builds on or alters, and the tables it adds (listed here when the chapter ships) are below; a table is defined once, by the chapter named here, and later chapters reference it:

| Chapter | Extends | Adds |
| --- | --- | --- |
| The Logistics Landscape | `parties`, `carriers` | (added when the chapter ships) |
| Freight Markets & Cycles | `lane_rates`, `tenders` | (added when the chapter ships) |
| How Carriers, Brokers & 3PLs Make Money | `freight_charges`, `loads` | (added when the chapter ships) |
| Truckload | `loads`, `equipment_units`, `drivers` | (added when the chapter ships) |
| LTL Networks | `shipments`, `handling_units`, `facilities` | (added when the chapter ships) |
| Freight Class, Density & LTL Pricing | `items`, `shipment_lines`, `handling_units`, `lane_rates` | (added when the chapter ships) |
| Intermodal & Drayage | `loads`, `equipment_units`, `stops` | (added when the chapter ships) |
| Rail Freight | `loads`, `equipment_units`, `freight_charges` | (added when the chapter ships) |
| Parcel Networks From the Carrier Side | `shipments`, `facilities` | (added when the chapter ships) |
| Ocean Shipping | `shipments`, `loads`, `equipment_units` | (added when the chapter ships) |
| Bills of Lading & eBL | `documents`, `shipments` | (added when the chapter ships) |
| Detention & Demurrage | `freight_charges`, `equipment_units`, `shipment_events` | (added when the chapter ships) |
| Freight Forwarders & NVOCCs | `parties`, `shipments`, `documents` | (added when the chapter ships) |
| Air Cargo | `shipments`, `equipment_units`, `shipment_events` | (added when the chapter ships) |
| How Freight Brokerage Works | `loads`, `rate_agreements`, `freight_charges` | (added when the chapter ships) |
| Carrier Onboarding & Vetting | `carriers`, `parties`, `documents` | (added when the chapter ships) |
| Freight Fraud & Cargo Theft | `carriers`, `tenders`, `freight_invoices` | (added when the chapter ships) |
| Load Boards & Digital Freight Matching | `loads`, `tenders` | (added when the chapter ships) |
| Operating Authority & Registration | `carriers` | (added when the chapter ships) |
| Bonds & Insurance Minimums | `carriers`, `documents` | (added when the chapter ships) |
| Hours of Service | `drivers`, `loads` | (added when the chapter ships) |
| ELDs & Telematics | `drivers`, `equipment_units`, `shipment_events` | (added when the chapter ships) |
| Drivers: CDLs, Qualification & the Clearinghouse | `drivers`, `documents` | (added when the chapter ships) |
| Safety Ratings, CSA & Inspections | `carriers`, `equipment_units`, `drivers` | (added when the chapter ships) |
| Cargo Liability & Claims | `shipments`, `freight_charges`, `documents` | (added when the chapter ships) |
| Hazardous Materials in Transport | `items`, `shipment_lines`, `documents` | (added when the chapter ships) |
| Transportation Management Systems | `orders`, `shipments`, `loads` | (added when the chapter ships) |
| Rating, Tariffs & Accessorials | `rate_agreements`, `lane_rates`, `freight_charges` | (added when the chapter ships) |
| Freight Procurement & Routing Guides | `rate_agreements`, `lane_rates`, `tenders` | (added when the chapter ships) |
| Tendering & Acceptance | `tenders`, `loads` | (added when the chapter ships) |
| Load Planning & Optimization | `loads`, `load_shipments`, `stops`, `handling_units` | (added when the chapter ships) |
| Carrier Dispatch & Asset Management | `loads`, `drivers`, `equipment_units` | (added when the chapter ships) |
| Transportation EDI | `documents`, `tenders`, `shipment_events`, `freight_invoices` | (added when the chapter ships) |
| Logistics APIs & Standards | `documents`, `shipment_events`, `parties` | (added when the chapter ships) |
| Visibility & Tracking | `shipment_events`, `stops` | (added when the chapter ships) |
| ETAs & Exception Management | `shipment_events`, `stops` | (added when the chapter ships) |
| Warehouse Management Systems | `facilities`, `items`, `lots`, `handling_units` | (added when the chapter ships) |
| Picking, Packing & Labor | `orders`, `order_lines`, `handling_units` | (added when the chapter ships) |
| Warehouse Automation | `facilities`, `handling_units` | (added when the chapter ships) |
| Yard Management & Dock Scheduling | `facilities`, `stops`, `equipment_units` | (added when the chapter ships) |
| Contract Logistics & 3PL Billing | `rate_agreements`, `freight_charges`, `parties` | (added when the chapter ships) |
| Freight Invoicing & Settlement | `freight_invoices`, `freight_invoice_lines`, `freight_charges` | (added when the chapter ships) |
| Freight Audit & Payment | `freight_invoices`, `freight_invoice_lines`, `freight_charges` | (added when the chapter ships) |
| Paying Carriers, Quick Pay & Factoring | `freight_invoices`, `parties`, `carriers` | (added when the chapter ships) |
| Fuel, Tolls & Fuel Cards | `freight_charges`, `equipment_units`, `drivers` | (added when the chapter ships) |
| Logistics Accounting | `freight_charges`, `freight_invoices` | (added when the chapter ships) |
| Customs Brokers & Bonds | `parties`, `party_roles`, `documents` | (added when the chapter ships) |
| Import Entry & ACE | `shipments`, `shipment_lines`, `freight_charges`, `documents` | (added when the chapter ships) |
| Classification, Valuation & Origin | `items`, `shipment_lines` | (added when the chapter ships) |
| Tariff Programs | `shipment_lines`, `freight_charges` | (added when the chapter ships) |
| Drawback, FTZs & Trade Agreements | `facilities`, `shipment_lines`, `lots` | (added when the chapter ships) |
| Forced Labor & Partner Agencies | `parties`, `items`, `shipments` | (added when the chapter ships) |
| Export Compliance & Screening | `parties`, `items`, `shipments` | (added when the chapter ships) |
| EU, UK & Canada Customs | `shipments`, `shipment_lines`, `documents` | (added when the chapter ships) |
| ERP, MES & ISA-95 | `facilities`, `items`, `orders` | (added when the chapter ships) |
| BOMs, PLM & Engineering Change | `items` | (added when the chapter ships) |
| MRP, Scheduling & Work Orders | `items`, `lots`, `orders` | (added when the chapter ships) |
| Demand & Supply Planning | `items`, `facilities`, `orders` | (added when the chapter ships) |
| Supplier Schedules, JIT & Automotive EDI | `orders`, `order_lines`, `documents`, `handling_units` | (added when the chapter ships) |
| Quality Systems | `lots`, `items`, `parties` | (added when the chapter ships) |
| Lot & Serial Traceability | `lots`, `shipment_lines`, `handling_units` | (added when the chapter ships) |
| FSMA 204, DSCSA & UDI | `items`, `lots`, `shipment_events` | (added when the chapter ships) |
| Recalls From the Manufacturer's Side | `lots`, `shipments`, `parties` | (added when the chapter ships) |
| Emissions & Product Passports | `loads`, `items`, `lots` | (added when the chapter ships) |
| Logistics Platform Architecture | every table, the playbook's `outbox_events` | (added when the chapter ships) |
| Logistics Metrics | `loads`, `stops`, `tenders`, `shipment_events` | (added when the chapter ships) |
| AI in Logistics | `documents`, `tenders`, `shipment_events` | (added when the chapter ships) |
| Replacing a TMS, WMS or ERP | `parties`, `documents`, `external_refs` | (added when the chapter ships) |

Chapters change tables that already hold rows, so their `ALTER`s are written to run on a live database: checks, required columns and foreign keys on existing columns are added `NOT VALID`, which checks new rows without scanning the old ones, and indexes and unique keys are built `CONCURRENTLY`. Once any backfill is done, each `NOT VALID` constraint is validated under a lock that doesn't block reads or writes ([Lock-Aware DDL](/docs/database/zero-downtime-migrations#lock-aware-ddl)). The pattern, for a check a later chapter might add to `shipments`:

```sql fragment
ALTER TABLE shipments ADD CONSTRAINT shipments_declared_value_currency_check
  CHECK (declared_value IS NULL OR currency IS NOT NULL) NOT VALID;
CREATE INDEX CONCURRENTLY shipments_pro_number_idx ON shipments (pro_number);
ALTER TABLE shipments VALIDATE CONSTRAINT shipments_declared_value_currency_check;
```

## Auditing

The records in this chapter are the ones shippers, carriers, brokers, factors, auditors, regulators and courts ask about later:

- **What was agreed.** Every rate agreement, lane rate, tender and rate confirmation with its validity and the document behind it, so a billed line can be judged against the price in force on the pickup date, not today's.
- **What was charged, line by line, on both sides.** Every freight charge with its side, payer, payee, kind, code, quantity, rate, source and evidence, and every voided line with its reason; a carrier disputing a short pay, a shipper disputing detention and an auditor testing purchased transportation all read these rows.
- **What a broker owes the record.** The consignor, the carrier and its registration number, the bill of lading number, the broker's compensation and who paid it, and the date the carrier was paid, kept three years and open to every party to the transaction (49 CFR 371.3).
- **What happened, and when it was known.** Every event with its occurred and received times, its source and the message it came in, so an on-time claim, a detention invoice or a late D&D bill can be tested against the facts.
- **Who was paid.** Every invoice's payee, every notice of assignment and the date it was received, and every payment, so a carrier who says it wasn't paid and a factor who says it should have been can both be answered.
- **The paper.** Bills of lading, PODs, lumper receipts, waybills, entries and EDI messages as exchanged, with hashes.

The mechanics (typed actors, append-only history, tamper evidence) are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Model parties and roles, not company types,** and keep carrier facts in their own table keyed by the party.
- **Keep order, shipment and load as three records,** linked many-to-many, so splits, consolidations and multi-leg moves don't rewrite each other.
- **Store every charge as a line with its side, payer, payee, kind and source,** and compute revenue, cost, margin and landed cost as sums over lines.
- **Keep planned and actual side by side:** appointments as ranges, arrivals as timestamps from the event that proved them.
- **Record event time and received time separately** on every status, and deduplicate without discarding conflicting reports.
- **Make facilities first-class,** with time zones, operators and appointment rules, and compute every clock in the facility's zone.
- **Separate handling units from lines,** because density, class, labels and claims are per handling unit and goods are per line.
- **Treat every outside identifier as data, not a key,** unique only in its issuer's scope.
- **Put the payee on the invoice** and honor notices of assignment from the day they arrive.
- **Keep documents as exchanged,** and emit life-cycle events for tenders, stops, deliveries, charges and invoices.

## References

**Filings**

- [C.H. Robinson Worldwide: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1043277/000104327726000009/chrw-20251231.htm), 2025 revenue, shipments and providers, the adjusted gross profit definition and margin, truckload rate and cost changes, and gross revenue recognition
- [Old Dominion Freight Line: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/878927/000119312526067161/odfl-20251231.htm), operating ratio, revenue per hundredweight and per shipment, weight per shipment, and fuel surcharges indexed to DOE prices
- [Knight-Swift Transportation: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1492691/000149269126000016/knx-20251231.htm), the operating ratio definition, truckload operating ratio, deadhead, length of haul, revenue and miles per tractor
- [Landstar System: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/853816/000119312526064756/d66072d10k.htm), BCO trucks, the share of revenue paid to BCOs, and fuel surcharges passed through
- [Uber Technologies: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1543151/000154315126000015/uber-20251231.htm), Freight revenue and its presentation on a gross basis
- [Triumph Financial: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1539638/000153963826000007/tfin-20251231.htm), factoring as the purchase of trucking invoices, 2025 purchase volume, and recourse structures
- [Cass Information Systems: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/708781/000070878126000010/cass-20251231.htm), transportation invoice and dollar volume, and remitting before customer funding

**Statutes and regulations**

- [49 U.S.C. 13102: Definitions](https://www.law.cornell.edu/uscode/text/49/13102), broker, freight forwarder and motor carrier
- [49 U.S.C. 14103: Loading and unloading motor vehicles](https://www.law.cornell.edu/uscode/text/49/14103), the shipper's or receiver's duty to provide or pay for help
- [49 CFR 371.3: Records to be kept by brokers](https://www.law.cornell.edu/cfr/text/49/371.3), the transaction record, three-year retention and the right to review
- [49 CFR 373.101: Motor carrier bills of lading](https://www.law.cornell.edu/cfr/text/49/373.101), required contents
- [49 CFR 376.12: Written lease requirements](https://www.law.cornell.edu/cfr/text/49/376.12), compensation, chargebacks, rated freight bills and 15-day payment
- [49 CFR 387.9: Financial responsibility, minimum levels](https://www.law.cornell.edu/cfr/text/49/387.9), $750,000 for non-hazardous property
- [49 CFR 387.307: Property broker surety bond or trust fund](https://www.law.cornell.edu/cfr/text/49/387.307), $75,000, Forms BMC-84 and BMC-85, and drawdown notice
- [49 CFR 171.1: Applicability of the Hazardous Materials Regulations](https://www.law.cornell.edu/cfr/text/49/171.1), PHMSA and who the rules bind
- [49 CFR 573.6: Defect and noncompliance information](https://www.law.cornell.edu/cfr/text/49/573.6), the five-working-day report
- [49 CFR 1333.1: Rail demurrage](https://www.law.cornell.edu/cfr/text/49/1333.1), its definition
- [49 CFR 1333.4: Demurrage invoice contents](https://www.law.cornell.edu/cfr/text/49/1333.4), car reporting marks and placement times
- [46 CFR 515.21: Financial responsibility requirements](https://www.law.cornell.edu/cfr/text/46/515.21), OTI amounts
- [46 CFR 541.7: Timing of detention and demurrage invoices](https://www.law.cornell.edu/cfr/text/46/541.7), the 30-day rule
- [19 CFR 4.7: Vessel cargo declarations](https://www.law.cornell.edu/cfr/text/19/4.7), 24 hours before lading
- [19 CFR 24.23: Merchandise processing fee](https://www.law.cornell.edu/cfr/text/19/24.23), 0.3464% and the adjusted minimum and maximum
- [19 CFR 24.24: Harbor maintenance fee](https://www.law.cornell.edu/cfr/text/19/24.24), 0.125% of value
- [19 CFR 142.12: Entry summary filing](https://www.law.cornell.edu/cfr/text/19/142.12), 10 working days after entry
- [19 CFR 149.2: Importer security filing timing](https://www.law.cornell.edu/cfr/text/19/149.2), 24 hours before lading
- [21 CFR 1.279: Prior notice timing](https://www.law.cornell.edu/cfr/text/21/1.279), hours before arrival by mode
- [UCC 9-406: Discharge of account debtor](https://www.law.cornell.edu/ucc/9/9-406), payment after a notice of assignment

**Government**

- [Federal Register: Availability of Motus, FMCSA's new registration system (April 29, 2026)](https://www.govinfo.gov/content/pkg/FR-2026-04-29/html/2026-08334.htm), Motus phases, the USDOT number as identifier, and MC/FF numbers retained
- [Federal Maritime Commission: Ocean Shipping Reform Act of 2022](https://www.fmc.gov/resources-services/ocean-shipping-reform-act-of-2022/), signing date, public law number and non-conforming invoices
- [DOT Office of Inspector General: ST2018019, commercial driver detention (January 31, 2018)](https://www.oig.dot.gov/library-item/36237), detention's cost to drivers and carriers and its effect on crash risk
- [U.S. Energy Information Administration: Gasoline and diesel fuel update](https://www.eia.gov/petroleum/gasdiesel/), the on-highway diesel average for the week of November 16, 2026

**Standards**

- [X12: Transaction sets](https://x12.org/products/transaction-sets), the 204, 210, 214, 404, 417 and 990 titles
- [NMFTA: Decoding density](https://nmfta.org/news/decoding-density-the-freight-factor-you-cant-afford-to-overlook/), the 13-sub density scale
- [NMFTA: SCAC](https://scac.nmfta.org/), the Standard Carrier Alpha Code and who issues it
- [GS1: Application Identifiers](https://ref.gs1.org/ai/GS1_Application_Identifiers.jsonld), AI (00) SSCC and AI (10) batch or lot formats
- [BIC: BIC codes](https://www.bic-code.org/bic-codes/), the container identification structure in ISO 6346
- [DCSA: Standards](https://dcsa.org/standards), the booking, bill of lading, track and trace and arrival notice standards
- [IATA: Electronic air waybill](https://www.iata.org/en/programs/cargo/e/eawb/), the e-AWB that replaces the paper air waybill
- [SMC3: CzarLite](https://www.smc3.com/czarlite.htm), the neutral LTL base rate for class and density pricing
