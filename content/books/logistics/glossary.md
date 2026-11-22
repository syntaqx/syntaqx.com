+++
title = "Logistics Glossary"
nav_title = "Glossary"
description = "Every logistics term by part: the business, road and rail, ocean and air, brokerage, carrier rules, planning, visibility, freight money, customs, manufacturing."
category = "Logistics & Supply Chain Industry"
order = 2899
part = "Reference"
tags = ["logistics", "supply-chain", "freight", "glossary", "reference"]
+++

Logistics borrows its words from trucking, railroads, shipping law, customs law, warehousing and the factory floor, and the same word shifts with context: a shipment is goods under one bill of lading to a shipper and a parcel with a tracking number to a merchant, a load is a vehicle's trip to a broker and the cargo itself to a driver, a carrier is a regulated motor carrier to FMCSA and any company that moves freight to everyone else, and a tender is an offer of a load here and a way a sale was paid in a store. Entries are grouped by the part of the volume that explains them, alphabetized within each group, and each is one line and a link to the chapter that owns the idea; a word with two meanings appears once per meaning, qualified. Terms the [Commerce](/books/commerce/glossary) and [Banking & Lending](/books/banking-and-lending/glossary) glossaries already define keep their definitions. The volume's own names for the core records (party, party role, carrier, facility, item, lot, order, order line, shipment, shipment line, handling unit, load, stop, tender, rate agreement, lane rate, freight charge, shipment event, equipment unit, driver, document, freight invoice) are the ones in [The Core Data Model](/books/logistics/logistics-business#the-core-data-model).

## The Business

- **3PL (third-party logistics provider):** a company that runs warehouses for brands, receiving, storing, picking, packing and shipping their stock for fees per receipt, unit stored and order, as ShipBob and ShipMonk do ([The Logistics Business](/books/logistics/logistics-business#who-s-who); defined in [Warehouses, 3PLs & Fulfillment Networks](/books/commerce/warehouses-and-3pls#3pls)).
- **Advance ship notice (ASN):** a notice of what an inbound truck, pallet or carton contains, sent ahead so the receiver can check it ([The Logistics Business](/books/logistics/logistics-business#a-manufactured-lot-from-a-supplier); defined in [Warehouses, 3PLs & Fulfillment Networks](/books/commerce/warehouses-and-3pls#receiving-and-inbound)).
- **Asset carrier:** a carrier that owns or leases the vehicles that move the freight, as opposed to a broker or forwarder that arranges them ([The Logistics Business](/books/logistics/logistics-business#who-s-who)).
- **Beneficial cargo owner (BCO):** the party that owns the goods and the commercial interest in them, whoever appears as shipper or consignee on a bill; not Landstar's "BCO Independent Contractor," an owner-operator ([The Logistics Business](/books/logistics/logistics-business#who-s-who)).
- **Buy side, sell side:** the payable lines owed to carriers and vendors and the receivable lines owed by customers; each movement a broker or forwarder handles has both ([The Logistics Business](/books/logistics/logistics-business#how-the-money-splits)).
- **Consignee:** the party freight is delivered to, named on the bill of lading ([The Logistics Business](/books/logistics/logistics-business#who-s-who)).
- **Document (logistics):** a bill of lading, rate confirmation, proof of delivery, waybill, invoice, entry or EDI message, kept as the bytes exchanged with a hash ([The Logistics Business](/books/logistics/logistics-business#the-core-data-model)).
- **Equipment unit:** a tractor, trailer, container, chassis, railcar or ULD, identified by a number its owner or a registry assigns ([The Logistics Business](/books/logistics/logistics-business#the-core-data-model)).
- **Event time, received time:** when a milestone happened according to its reporter, and when the system learned it; kept as two columns on every shipment event ([The Logistics Business](/books/logistics/logistics-business#the-core-data-model)).
- **Facility:** a place freight moves to, from or through (a plant, DC, store, terminal, port, ramp or airport), with an operator, a time zone and appointment rules; distinct from its address ([The Logistics Business](/books/logistics/logistics-business#the-core-data-model)).
- **Freight charge:** one priced line on a shipment or load, with its side, payer, payee, kind, code, quantity, rate and source ([The Logistics Business](/books/logistics/logistics-business#one-rule-for-all-of-them)).
- **Freight invoice:** a bill for freight, sent to a customer or received from a carrier or vendor, with its payee and its lines as billed ([The Logistics Business](/books/logistics/logistics-business#the-core-data-model)).
- **Freight payment provider:** a company that audits and pays freight invoices on a shipper's behalf, as Cass does ([The Logistics Business](/books/logistics/logistics-business#who-s-who)).
- **Handling unit:** what is physically handled (a pallet, carton, crate or drum) with its dimensions, weight and SSCC; distinct from the lines of goods on it ([The Logistics Business](/books/logistics/logistics-business#the-core-data-model)).
- **Lane rate:** one priced origin and destination pair inside a rate agreement, with its basis (flat, per mile, per hundredweight, per container, a tariff discount), minimum and fuel schedule ([The Logistics Business](/books/logistics/logistics-business#the-core-data-model)).
- **Load:** one vehicle's or container's trip with its stops, carrying one or more shipments ([The Logistics Business](/books/logistics/logistics-business#the-life-of-a-shipment)).
- **Lot:** a batch of an item made together and traced as one, identified by its manufacturer's lot code ([The Logistics Business](/books/logistics/logistics-business#a-manufactured-lot-from-a-supplier)).
- **Order (logistics):** the commercial demand behind freight: a sales, purchase, transfer or return order, owned by the party whose number it carries ([The Logistics Business](/books/logistics/logistics-business#the-core-data-model)).
- **Party:** an organization or person appearing in any role; one row however many roles it plays ([The Logistics Business](/books/logistics/logistics-business#who-s-who)).
- **Party role:** a role a party plays (shipper, carrier, broker, factor, customs broker and the rest), with the dates it applies ([The Logistics Business](/books/logistics/logistics-business#the-core-data-model)).
- **Planned versus actual:** an appointment or requested window against the arrival or delivery that happened, kept side by side for detention, on-time measures and claims ([The Logistics Business](/books/logistics/logistics-business#the-core-data-model)).
- **Rate agreement:** a contract, tariff, service contract, quote or rate confirmation that prices freight between an owner and a counterparty for a period ([The Logistics Business](/books/logistics/logistics-business#the-core-data-model)).
- **Shipment (logistics):** goods under one bill of lading from one origin to one destination, with its shipper, consignee, bill-to party and identifiers ([The Logistics Business](/books/logistics/logistics-business#the-life-of-a-shipment)).
- **Shipment event:** a milestone or position as reported (by EDI, API, ELD, app or geofence), with its source code, event time and received time ([The Logistics Business](/books/logistics/logistics-business#the-core-data-model)).
- **Shipper:** the party that tenders goods to a carrier and is named as consignor on the bill of lading ([The Logistics Business](/books/logistics/logistics-business#who-s-who)).
- **Stop:** a facility visit on a load, with its appointment, its actual arrival and departure, and the shipments it picks up or drops ([The Logistics Business](/books/logistics/logistics-business#the-core-data-model)).

## Road and Rail

- **Car reporting marks:** the reporting marks and number that identify a railcar, which a Class I railroad's demurrage invoice must show for each car ([The Logistics Business](/books/logistics/logistics-business#who-s-who)).
- **Deadhead:** miles driven without cargo, paid for by the carrier and billed to nobody; 13.9% of Knight-Swift's truckload miles in 2025 ([The Logistics Business](/books/logistics/logistics-business#an-asset-carrier-load)).
- **Density (freight):** a handling unit's weight in pounds over its cube in cubic feet; under NMFTA's 13-step scale, 10 to under 12 pounds per cubic foot is class 92.5 ([The Logistics Business](/books/logistics/logistics-business#an-ltl-shipment)).
- **Freight class:** the NMFC rating that, with weight and lane, sets an LTL base rate; for density-based items it follows from the density ([The Logistics Business](/books/logistics/logistics-business#an-ltl-shipment)).
- **Hundredweight (cwt):** 100 pounds, the unit LTL rates and revenue are quoted in; Old Dominion earned $33.31 per cwt in 2025 ([The Logistics Business](/books/logistics/logistics-business#an-ltl-shipment)).
- **LTL (less than truckload):** freight in handling units sharing trailers through a carrier's terminal network, priced from a tariff or base rate by class or density and weight, less a discount ([The Logistics Business](/books/logistics/logistics-business#modes)).
- **Operating ratio:** operating expenses as a percentage of revenue, the inverse of operating margin; 75.2% for Old Dominion and 97.0% for Knight-Swift's truckload segment in 2025 ([The Logistics Business](/books/logistics/logistics-business#an-asset-carrier-load)).
- **Owner-operator:** a driver who owns or leases a tractor and runs under their own authority or leases on to a carrier under 49 CFR 376 ([The Logistics Business](/books/logistics/logistics-business#who-s-who)).
- **PRO number:** an LTL carrier's tracking number for a shipment ([The Logistics Business](/books/logistics/logistics-business#modes)).
- **Rail demurrage:** a charge for railcars held past free time, which compensates the railroad and penalizes undue detention (49 CFR 1333.1) ([The Logistics Business](/books/logistics/logistics-business#who-s-who)).
- **Reweigh:** a carrier's correction of a shipment's weight from its own scale, which re-rates the shipment and can change its class ([The Logistics Business](/books/logistics/logistics-business#an-ltl-shipment)).
- **Truckload:** a whole trailer for one shipper's freight, priced per load or per mile on a contract lane or a spot quote, plus fuel surcharge ([The Logistics Business](/books/logistics/logistics-business#modes)).

## Ocean and Air

- **Air waybill (AWB):** the airline's transport document for an air consignment; a forwarder's consolidation travels on a master AWB with house AWBs under it ([The Logistics Business](/books/logistics/logistics-business#modes)).
- **Container number:** an ISO 6346 identifier of a three-letter owner code, an equipment category letter, a six-digit serial and a check digit ([The Logistics Business](/books/logistics/logistics-business#modes)).
- **Detention (ocean), per diem:** the charge for keeping a carrier's container out past free time, billed within 30 days of the last day under 46 CFR 541.7 ([The Logistics Business](/books/logistics/logistics-business#an-ocean-import)).
- **Demurrage (ocean):** the charge for a container left at the terminal past free time ([The Logistics Business](/books/logistics/logistics-business#an-ocean-import)).
- **FCL, LCL:** full container load, booked by one shipper, and less than container load, a share of a container an NVOCC consolidates ([The Logistics Business](/books/logistics/logistics-business#modes)).
- **House bill, master bill:** an NVOCC's or forwarder's own bill of lading or air waybill to its customer, and the carrier's bill to the NVOCC or forwarder underneath it ([The Logistics Business](/books/logistics/logistics-business#who-s-who)).
- **NVOCC (non-vessel-operating common carrier):** an FMC-licensed intermediary that issues its own bills over an ocean carrier's, with $75,000 of financial responsibility ($150,000 if registered rather than licensed) ([The Logistics Business](/books/logistics/logistics-business#who-s-who)).

## Freight Brokerage

- **Freight broker:** a person other than a motor carrier that sells, negotiates for or holds itself out as arranging motor carrier transportation for compensation (49 U.S.C. 13102(2)), with a $75,000 bond or trust fund ([The Logistics Business](/books/logistics/logistics-business#who-s-who)).
- **Freight forwarder:** a person that assembles and consolidates shipments and assumes responsibility for them from receipt to destination, using other carriers (49 U.S.C. 13102(8)) ([The Logistics Business](/books/logistics/logistics-business#who-s-who)).
- **Gross margin (brokerage), adjusted gross profit:** revenue less purchased transportation; C.H. Robinson's adjusted gross profit margin was 16.8% in 2025 ([The Logistics Business](/books/logistics/logistics-business#a-brokered-truckload)).
- **Rate confirmation:** the broker's load-level contract with a carrier, setting the rate, accessorials and terms on top of the broker-carrier agreement ([The Logistics Business](/books/logistics/logistics-business#a-brokered-truckload)).

## Carrier Regulation

- **MC number, FF number:** FMCSA docket numbers for motor carriers and freight forwarders, still issued as of 2026 alongside the USDOT number ([The Logistics Business](/books/logistics/logistics-business#who-s-who)).
- **Motus:** FMCSA's registration system replacing the Unified Registration System and the FMCSA Portal, phase I released December 8, 2025 ([The Logistics Business](/books/logistics/logistics-business#who-s-who)).
- **SCAC (Standard Carrier Alpha Code):** NMFTA's carrier identifier, issued only by NMFTA ([The Logistics Business](/books/logistics/logistics-business#modes)).
- **USDOT number:** FMCSA's unique identifier for every regulated entity ([The Logistics Business](/books/logistics/logistics-business#who-s-who)).

## Planning and Execution

- **Accessorial:** a charge beyond linehaul and fuel for extra service or delay (detention, liftgate, layover, lumper, stop-off) ([The Logistics Business](/books/logistics/logistics-business#how-the-money-splits)).
- **Detention (trucking):** pay for a truck held at a facility past free time; the DOT Inspector General estimated it cost truckload drivers $1.1 billion to $1.3 billion a year ([The Logistics Business](/books/logistics/logistics-business#a-brokered-truckload)).
- **Fuel surcharge:** a per-mile or percentage line indexed to a published diesel price, such as the EIA's weekly on-highway average ([The Logistics Business](/books/logistics/logistics-business#a-brokered-truckload)).
- **Linehaul:** the base transportation charge for moving freight between origin and destination, before fuel and accessorials ([The Logistics Business](/books/logistics/logistics-business#a-brokered-truckload)).
- **Tender (freight):** an offer of a load to a carrier, by EDI 204, API, portal or load board, which the carrier accepts or rejects before it expires ([The Logistics Business](/books/logistics/logistics-business#the-life-of-a-shipment)).

## Data and Visibility

- **204, 990, 214, 210:** the X12 Motor Carrier Load Tender, Response to a Load Tender, Transportation Carrier Shipment Status Message and Motor Carrier Freight Details and Invoice ([The Logistics Business](/books/logistics/logistics-business#the-life-of-a-shipment)).
- **SSCC (Serial Shipping Container Code):** GS1's 18-digit ID for a carton or pallet, printed as a GS1-128 barcode and linked to the ASN ([The Logistics Business](/books/logistics/logistics-business#a-manufactured-lot-from-a-supplier); defined in [Warehouses, 3PLs & Fulfillment Networks](/books/commerce/warehouses-and-3pls#receiving-and-inbound)).

## Freight Money

- **Factoring:** buying a business's invoices at a discount, with an advance, a reserve and a fee; with or without recourse, with or without notice to the customer ([The Logistics Business](/books/logistics/logistics-business#a-brokered-truckload); defined in [Small Business Lending](/books/banking-and-lending/small-business-lending#invoice-factoring-and-financing)).
- **Notice of assignment (NOA):** a factor's notice that a carrier's invoice was sold to it; after receiving one, a broker discharges the debt only by paying the factor (UCC 9-406(a)) ([The Logistics Business](/books/logistics/logistics-business#a-brokered-truckload)).
- **Payee:** the party a freight invoice is paid to, which a notice of assignment can change from the carrier to its factor ([The Logistics Business](/books/logistics/logistics-business#the-core-data-model)).
- **Proof of delivery (POD):** the signed delivery receipt or photo that shows freight arrived, and that gates the carrier's invoice ([The Logistics Business](/books/logistics/logistics-business#the-life-of-a-shipment)).
- **Quick pay:** a carrier's option to be paid in days instead of on standard terms, for a fee taken off the payable ([The Logistics Business](/books/logistics/logistics-business#a-brokered-truckload)).

## Customs and Trade

- **Entry summary:** the filing, with estimated duties, due within 10 working days after the time of entry (19 CFR 142.12) ([The Logistics Business](/books/logistics/logistics-business#an-ocean-import)).
- **Harbor maintenance fee (HMF):** a port use fee of 0.125% of the cargo's value (19 CFR 24.24) ([The Logistics Business](/books/logistics/logistics-business#an-ocean-import)).
- **Importer security filing (ISF):** the importer's data on an ocean shipment, due 24 hours before the cargo is laden at the foreign port (19 CFR 149.2) ([The Logistics Business](/books/logistics/logistics-business#the-life-of-a-shipment)).
- **Landed cost:** a unit's supplier price plus freight, insurance, duty, brokerage and handling, allocated to received units by quantity, value, weight or volume ([The Logistics Business](/books/logistics/logistics-business#an-ocean-import); defined in [Purchasing & Replenishment](/books/commerce/purchasing-and-replenishment#landed-cost)).
- **Merchandise processing fee (MPF):** CBP's ad valorem fee on formal entries, 0.3464% within a minimum and maximum adjusted each fiscal year (19 CFR 24.23) ([The Logistics Business](/books/logistics/logistics-business#an-ocean-import)).

## Manufacturing

- **Lot code:** the manufacturer's identifier for a lot, carried in GS1 application identifier (10) up to 20 characters ([The Logistics Business](/books/logistics/logistics-business#a-manufactured-lot-from-a-supplier)).
- **Lot genealogy:** the record of which input lots went into which finished lots, used to find every affected shipment when one input is defective ([The Logistics Business](/books/logistics/logistics-business#the-life-of-a-shipment)).

## References

**Reference**

- [49 U.S.C. 13102: Definitions](https://www.law.cornell.edu/uscode/text/49/13102), broker and freight forwarder
- [46 CFR 515.21: Financial responsibility requirements](https://www.law.cornell.edu/cfr/text/46/515.21), NVOCC amounts
- [UCC 9-406: Discharge of account debtor](https://www.law.cornell.edu/ucc/9/9-406), payment after a notice of assignment
- [NMFTA: Decoding density](https://nmfta.org/news/decoding-density-the-freight-factor-you-cant-afford-to-overlook/), the density scale
- [X12: Transaction sets](https://x12.org/products/transaction-sets), the transportation transaction set titles
- [19 CFR 24.23: Merchandise processing fee](https://www.law.cornell.edu/cfr/text/19/24.23), the MPF rate and adjustment
