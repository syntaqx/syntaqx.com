+++
title = "The Logistics Landscape"
description = "Who hauls and arranges freight: carriers by mode, brokers, 3PLs and forwarders, the software categories, filing figures and the 2023 to 2026 consolidation."
category = "Logistics & Supply Chain Industry"
order = 2802
part = "The Business"
tags = ["logistics", "supply-chain", "carriers", "brokers", "logistics-software", "data-model"]
+++

US freight is a few very large companies on top of a very long tail. Trucks moved "more than 72% of all domestic freight tonnage" in 2024, 11.27 billion tons for $906 billion of revenue, and 91.5% of the carriers that moved it run 10 or fewer trucks, according to the American Trucking Associations. Above that tail sit asset carriers with tens of thousands of tractors, LTL networks with hundreds of terminals, Class I railroads, parcel networks, brokers that arrange millions of loads without owning a truck, forwarders that consolidate ocean and air freight across continents, contract warehouse operators, and a software industry that sells each of them a system and connects them to each other.

The landscape matters to an engineer because it decides who the counterparties are. A shipper's TMS talks to a handful of large carriers by API and EDI and to thousands of small ones through a broker; a large broker's TMS has hundreds of thousands of carriers on its platform (C.H. Robinson counted more than 450,000 transportation providers in 2025), most of them very small, through load boards, apps and email; a carrier's dispatch system talks to the brokers and shippers that tender to it, each with its own formats. And the companies change: carriers fail (Yellow, August 2023), software vendors are bought and renamed (MercuryGate into Körber's supply chain software business, now Infios; e2open into WiseTech), business units are spun off (FedEx Freight, June 1, 2026). This chapter maps the companies by role and mode with their filed figures, the software categories and their vendors, and the 2023 to 2026 consolidation, and adds the records that keep a party graph true as the companies change. It extends `parties` and `carriers` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model).

How these companies make money is [How Carriers, Brokers & 3PLs Make Money](/books/logistics/logistics-economics); what the market cycle did to them is [Freight Markets & Cycles](/books/logistics/freight-markets). The roles themselves (shipper, carrier, broker, forwarder, customs broker) are defined in [Who's Who](/books/logistics/logistics-business#who-s-who).

## How the Companies Do It

As of November 2026, from 2025 annual filings (calendar 2025 unless noted):

| Company | Role | 2025 revenue | What the filing says about the model |
| --- | --- | --- | --- |
| **C.H. Robinson** | Broker, forwarder, managed services | $16.2 billion; adjusted gross profit $2.59 billion | About 37 million shipments, more than 450,000 transportation providers on its platform, gross recognition for most transportation |
| **GXO Logistics** | Contract logistics | $13.2 billion | 1,043 facilities, about 221 million square feet, about 154,000 team members in 26 countries; "Most of our customer contracts contain both fixed and variable components" |
| **J.B. Hunt** | Intermodal, dedicated, brokerage, final mile, truckload | $12.00 billion | Intermodal the largest segment ($5,975 million), most moves on BNSF and Norfolk Southern |
| **XPO** | LTL | $8,157 million | An LTL carrier first |
| **Knight-Swift** | Truckload, LTL, logistics, intermodal | $7,469.7 million | Truckload $4,865.0 million on an average 21,428 tractors; LTL $1,478.5 million |
| **RXO** | Broker, managed transportation, last mile | $5,742 million | Coyote acquired for $1.038 billion (September 16, 2024) |
| **Schneider National** | Truckload, intermodal, logistics | $5,674.3 million | |
| **Old Dominion** | LTL | $5,496.4 million | 260 service centers, operating ratio 75.2% |
| **Uber Freight** | Broker, TMS | $5,099 million | Presented gross "in most markets"; Adjusted EBITDA $(33) million |
| **Landstar** | Asset-light: agents, owner-operators, brokerage carriers | $4.7 billion | About 960 independent commission sales agents; 8,514 BCO trucks |
| **Saia** | LTL | $3,234.3 million | |
| **Werner** | Truckload, logistics | $2,974.4 million | |
| **Heartland Express** | Truckload | $805.7 million | |
| **Union Pacific** | Class I railroad | $24,510 million operating revenue | Operating ratio 59.8%, 32,889 route miles |

And the software side:

| Company | Category | Latest annual figures | Notes |
| --- | --- | --- | --- |
| **Descartes Systems Group** | Network, TMS, visibility, customs, routing | $729.0 million for the year to January 31, 2026, 93% services | "uniting logistics-intensive businesses on its Global Logistics Network"; eight acquisitions since the start of fiscal 2025, among them 3GTMS ($112.7 million net of cash, March 24, 2025) |
| **Manhattan Associates** | WMS, TMS, order management | $1,081.4 million; cloud subscriptions $408.1 million | Remaining performance obligations $2.23 billion at December 31, 2025 |
| **Samsara** | Telematics and ELDs | $444 million in the fourth quarter of fiscal 2026; $1.9 billion ending ARR | |
| **SPS Commerce** | EDI network | $751.5 million; 96% recurring | Mostly retail EDI ([EDI](/books/commerce/edi)) |
| **WiseTech Global** | Forwarding and customs (CargoWise), now e2open | Completed the e2open acquisition August 3, 2025 at $3.30 a share, an enterprise value of $2.1 billion | Files in Australia |

The patterns:

- **Revenue isn't size.** C.H. Robinson's $16.2 billion and Uber Freight's $5.1 billion are mostly what they pay carriers; GXO's $13.2 billion is mostly its warehouses' labor and rent. Comparing brokers to carriers, or brokers to each other, needs net revenue and operating ratios ([How Carriers, Brokers & 3PLs Make Money](/books/logistics/logistics-economics)).
- **Almost every large company plays several roles.** J.B. Hunt, Knight-Swift, Schneider and Werner run brokerages beside their fleets; C.H. Robinson forwards ocean and air freight and files customs entries; Landstar is a broker whose capacity is mostly owner-operators leased to it. The party graph in [The Core Data Model](/books/logistics/logistics-business#the-core-data-model) is built for this.
- **The tail is where the counterparties are.** 99.3% of carriers run fewer than 100 power units (ATA); a broker's carrier network is mostly companies with no IT department, which is why load boards, apps, email and PDFs matter as much as EDI and APIs.
- **Software consolidates into networks.** The large software companies sell connectivity as much as applications (Descartes's network, SPS's, WiseTech's after e2open), and the acquisitions of 2024 to 2026 bought networks of connected partners as much as code.

## Carriers by Mode

**Truckload.** The largest segment and the most fragmented. A handful of public fleets (Knight-Swift, Schneider, Werner, Heartland, J.B. Hunt's dedicated and truckload units) run tens of thousands of tractors; the ATA's figures put 91.5% of carriers at 10 trucks or fewer, and its January 2026 outlook cites "roughly 580,000 authorized interstate motor carriers." Truckload covers dry van, reefer, flatbed and dedicated fleets ([Truckload](/books/logistics/truckload) covers the equipment and operations).

**LTL.** A concentrated network business: Old Dominion, Saia, XPO, FedEx Freight, ArcBest's ABF and Estes run national terminal networks, with regional carriers beneath them. Yellow, once among the largest, filed for Chapter 11 on August 6, 2023 and liquidated ([Yellow's Failure](/books/logistics/ltl-networks#yellow-s-failure) covers it). FedEx Freight became a separate NYSE company, FDXF, on June 1, 2026, with FedEx distributing one share for every two FedEx shares held on May 15, 2026 and keeping 19.9% to dispose of within 24 months.

**Intermodal and rail.** Six Class I railroads (BNSF, Union Pacific, CSX, Norfolk Southern, CPKC and CN) own the track; intermodal marketing companies and asset-light intermodal carriers (J.B. Hunt, Hub Group, Schneider) own or control the containers and sell door to door ([Intermodal & Drayage](/books/logistics/intermodal-and-drayage)). Union Pacific and Norfolk Southern's proposed merger is before the Surface Transportation Board on a revised application, after the Board rejected the first one without prejudice in January 2026 ([The Union Pacific and Norfolk Southern Merger](/books/logistics/rail-freight#the-union-pacific-and-norfolk-southern-merger) has the dated steps).

**Parcel.** UPS, FedEx, the Postal Service and Amazon run the national networks, with regional carriers beneath them ([Parcel Networks From the Carrier Side](/books/logistics/parcel-networks); the shipper's view is [Shipping & Carriers](/books/commerce/shipping-and-carriers)).

**Ocean and air.** Ocean liner shipping is concentrated in a few carriers (MSC, Maersk, CMA CGM, COSCO, Hapag-Lloyd) and their alliances; air cargo moves in passenger bellies and freighters, mostly booked by forwarders ([Ocean Shipping](/books/logistics/ocean-shipping) and [Air Cargo](/books/logistics/air-cargo)).

## Brokers, 3PLs and Forwarders

**Freight brokers** arrange motor carriage without hauling it: C.H. Robinson, RXO (which bought Coyote in 2024), Uber Freight, TQL, Echo, Arrive and the brokerage divisions of asset carriers. TQL, Echo and Arrive are private and file nothing. A broker's register is in FMCSA's records (broker authority, [Operating Authority & Registration](/books/logistics/operating-authority), and the $75,000 bond, [Broker and Forwarder Security](/books/logistics/financial-security-and-insurance#broker-and-forwarder-security)); what it does is [How Freight Brokerage Works](/books/logistics/freight-brokerage).

**Agent networks** are a variant: Landstar's "approximately 960 independent commission sales agents" sell freight and choose capacity under Landstar's authority, insurance and credit, and 457 agents with $1 million or more of revenue each produced 95% of its revenue. The agent is a party with a contract, not an employee, and the system has to record which agent owns each customer and load.

**3PLs** is the broad label for companies that run logistics for shippers under contract: managed transportation (a 3PL operating the shipper's freight on a TMS, often the shipper's own, and paid a fee), contract warehousing (GXO, and the warehouse arms of DHL Supply Chain and others), and integrated services. The same company can be a broker on one shipper's loads and a managed transportation provider on another's, with different revenue recognition: C.H. Robinson records managed solutions and customs brokerage at the net amount and most transportation gross.

**Forwarders and NVOCCs** arrange international freight and consolidate it: Expeditors, Kuehne+Nagel, DSV, Flexport and C.H. Robinson's Global Forwarding. Their licensing and systems are [Freight Forwarders & NVOCCs](/books/logistics/forwarders-and-nvoccs).

**Freight payment and finance** sit underneath: Cass audits and pays freight bills (34.451 million transportation invoices, $36.447 billion, in 2025), Triumph factors carrier invoices and runs a payments network, and DAT and Truckstop sell factoring next to their load boards ([How the Money Splits](/books/logistics/logistics-business#how-the-money-splits)).

## Software Categories

| Category | What it runs | Who buys it | Representative vendors (alphabetical) |
| --- | --- | --- | --- |
| **Shipper TMS** | Planning, tendering, rating, visibility, freight audit for a shipper's freight | Manufacturers, retailers, distributors, 3PLs running managed transportation | Blue Yonder, Descartes, e2open (WiseTech), Infios (MercuryGate), Manhattan, Oracle OTM, SAP TM, Uber Freight |
| **Broker TMS** | Customer quotes, load building, carrier sourcing, confirmations, tracking, billing and carrier pay | Brokers and 3PLs | Descartes (3GTMS, MyCarrierPortal), DAT (Broker TMS), McLeod, Revenova, Rose Rocket, Turvo |
| **Carrier TMS (dispatch)** | Orders, dispatch, driver assignment, settlements, maintenance | Asset carriers | Alvys, McLeod, Trimble (TMW) |
| **WMS and WES** | Inventory, receiving, picking, shipping, labor, automation control | Warehouses, 3PLs, retailers | Blue Yonder, Infios, Manhattan, Oracle, SAP EWM |
| **Yard and dock** | Gate, yard moves, dock appointments | Shippers' DCs, carriers' yards | C3, Kaleris, Opendock (Loadsmart) |
| **Visibility** | Aggregated tracking from ELDs, apps, EDI and APIs, ETAs | Shippers, brokers | Descartes MacroPoint, FourKites, project44 |
| **ELD and telematics** | Hours of service, vehicle data, driver apps | Carriers | Geotab, Motive, Platform Science (with Trimble's former telematics units since February 10, 2025), Samsara |
| **Load boards and matching** | Posting and finding spot freight | Brokers and carriers | DAT, Truckstop, broker apps ([Load Boards & Digital Freight Matching](/books/logistics/load-boards-and-matching)) |
| **Carrier vetting** | Onboarding, identity, insurance and monitoring | Brokers and shippers | Carrier Assure, Highway, MyCarrierPortal, RMIS ([Carrier Onboarding & Vetting](/books/logistics/carrier-onboarding)) |
| **Forwarding and customs** | Bookings, house bills, consolidations, entries | Forwarders, NVOCCs, customs brokers | CargoWise (WiseTech), Descartes, Magaya |
| **Freight audit and payment** | Invoice audit, payment, GL coding | Shippers | Cass, and the TMS vendors' own modules |
| **EDI networks** | Translation and partner connections | Everyone | SPS Commerce and the TMS vendors' networks |
| **ERP and MES** | Orders, inventory, production, finance | Manufacturers, distributors | Epicor, Infor, Microsoft, Oracle, Plex (Rockwell), SAP, Siemens |

Category lines blur: a broker TMS includes visibility, a shipper TMS includes freight audit, a load board sells a broker TMS. The categories still matter because they decide which system is the record for what. A shipper's TMS owns the shipment and the routing guide; the broker's TMS owns the load it covered and its carrier contract; the carrier's dispatch system owns the driver and the truck; the visibility platform owns none of them and aggregates all of them.

## Consolidation, 2023 to 2026

The movements that changed counterparties, with dates from filings and the companies' own releases:

- **August 6, 2023: Yellow files for Chapter 11.** [Yellow's Failure](/books/logistics/ltl-networks#yellow-s-failure) covers what followed.
- **2023: Convoy shuts down;** Flexport buys its technology (reported November 1, 2023) and sells the relaunched Convoy Platform to DAT (announced July 28, 2025).
- **September 16, 2024: RXO closes its acquisition of Coyote** for $1.038 billion in cash.
- **October 1, 2024: Körber Supply Chain Software, "a joint venture between Körber AG and KKR," completes its acquisition of MercuryGate;** the business has since rebranded as Infios.
- **Autumn 2024: Descartes acquires MyCarrierPortal** (release posted October 2, 2024), adding carrier onboarding to its network.
- **February 10, 2025: Platform Science completes its acquisition of Trimble's global transportation telematics business units;** Trimble keeps Enterprise, Maps, Vusion and Transporeon and takes a board seat.
- **March 24, 2025: Descartes acquires 3GTMS,** a TMS vendor, for about $112.7 million net of cash.
- **August 3, 2025: WiseTech completes its acquisition of e2open,** at an enterprise value of $2.1 billion.
- **June 1, 2026: FedEx Freight separates from FedEx** as FDXF on the NYSE.

DSV's acquisition of DB Schenker, the largest forwarding combination of the period, closed in 2025 according to the companies' announcements, which I have not opened for this chapter. <!-- source-gap: logistics-landscape-dsv-schenker | missing | DSV completed its acquisition of DB Schenker in 2025 | closes with: DSV's company announcement or annual report giving the completion date | checked: 2026-11-22 -->

For software that integrates with these companies, each movement is a migration event: a carrier that disappears takes its SCAC and open PROs with it; a vendor that is acquired changes its APIs, its contracts and eventually its product; a spin-off splits one party into two, with separate tax IDs, invoices and remit-to addresses from a date.

## How to Build It

The deltas record corporate events with effective dates, which software a partner runs, a few classification columns, and a size band read from the power units [Operating Authority & Registration](/books/logistics/operating-authority#how-to-build-it) stores:

```sql
ALTER TABLE parties
  ADD COLUMN parent_party_id UUID REFERENCES parties (id),  -- the current parent, if any
  ADD COLUMN lei             CHAR(20),       -- ISO 17442 Legal Entity Identifier, where issued
  ADD COLUMN sec_cik         TEXT,           -- for public companies: where the filings are
  ADD COLUMN successor_party_id UUID REFERENCES parties (id);  -- set when the party ceases
ALTER TABLE parties ADD CONSTRAINT parties_parent_not_self_check
  CHECK (parent_party_id IS DISTINCT FROM id) NOT VALID;

-- A carrier's size band is derived, not stored: carriers.power_units (from the MCS-150,
-- added in Operating Authority & Registration) banded at read time.
CREATE VIEW carrier_size_bands AS
SELECT party_id,
       CASE WHEN power_units IS NULL THEN NULL
            WHEN power_units <= 1    THEN '1'
            WHEN power_units <= 10   THEN '2_10'
            WHEN power_units <= 100  THEN '11_100'
            WHEN power_units <= 1000 THEN '101_1000'
            ELSE '1001_plus' END AS size_band
FROM carriers;

CREATE TABLE party_corporate_events (      -- acquisitions, mergers, spin-offs, renames, failures
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  kind                TEXT NOT NULL CHECK (kind IN ('acquisition', 'merger', 'spin_off',
                        'divestiture', 'rename', 'bankruptcy', 'liquidation', 'ceased')),
  subject_party_id    UUID NOT NULL REFERENCES parties (id),   -- the company it happened to
  counterparty_id     UUID REFERENCES parties (id),            -- the acquirer, or the new spun-off company
  announced_on        DATE,
  effective_at        TIMESTAMPTZ NOT NULL,  -- when records must change, not the press date
  detail              JSONB NOT NULL DEFAULT '{}',  -- new names, tickers, retained stakes
  source_url          TEXT NOT NULL,         -- the filing or release relied on
  recorded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON party_corporate_events (subject_party_id, effective_at);

CREATE TABLE partner_systems (             -- which software a partner runs, for integration
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id            UUID NOT NULL REFERENCES parties (id),
  category            TEXT NOT NULL CHECK (category IN ('shipper_tms', 'broker_tms',
                        'carrier_tms', 'wms', 'yms', 'visibility', 'eld', 'load_board',
                        'carrier_vetting', 'forwarding', 'customs', 'freight_audit',
                        'edi_network', 'erp', 'mes')),
  vendor_party_id     UUID REFERENCES parties (id),  -- the vendor, itself a party
  product             TEXT NOT NULL,         -- as the partner names it
  connection          TEXT CHECK (connection IN ('edi_van', 'edi_as2', 'api', 'sftp',
                        'portal', 'email')),
  valid_during        TSTZRANGE NOT NULL DEFAULT tstzrange(NOW(), NULL),
  source              TEXT NOT NULL CHECK (source IN ('partner', 'onboarding', 'observed'))
);
```

Software vendors are parties too (with no logistics role), so an acquisition is a corporate event between two parties, and every partner running the acquired product can be found with one query:

```sql
SELECT ps.party_id, ps.product, ps.connection
FROM partner_systems ps
JOIN party_corporate_events e ON e.subject_party_id = ps.vendor_party_id
WHERE e.id = $1                    -- e.g. the WiseTech and e2open event
  AND ps.valid_during @> NOW();
```

Applying an event is a change set, not an edit. A spin-off creates the new party, moves the roles, identifiers and contacts that belong to it from the effective time, and leaves the history pointing at the old one; a carrier that ceases is marked with a successor (or none) and its open loads, tenders and invoices are listed for a person:

```go tab="Go"
func (s *Service) ApplyCorporateEvent(ctx context.Context, e CorporateEvent) error {
	return s.tx(ctx, func(q *Queries) error {
		if err := q.InsertCorporateEvent(ctx, e); err != nil {
			return err
		}
		switch e.Kind {
		case "ceased", "liquidation", "bankruptcy":
			if err := q.SetPartyStatus(ctx, e.SubjectID, "on_hold"); err != nil {
				return err
			}
			open, err := q.OpenWorkForParty(ctx, e.SubjectID) // loads, tenders, invoices, rate agreements
			if err != nil {
				return err
			}
			return q.EnqueueOutbox(ctx, "party.ceased", e.SubjectID, open)
		case "spin_off":
			return q.EnqueueOutbox(ctx, "party.spun_off", e.SubjectID, e.CounterpartyID)
		default:
			return q.EnqueueOutbox(ctx, "party.corporate_event", e.SubjectID, e.ID)
		}
	})
}
```

```rust tab="Rust"
pub async fn apply_corporate_event(svc: &Service, e: CorporateEvent) -> Result<(), sqlx::Error> {
    let mut tx = svc.pool.begin().await?;
    insert_corporate_event(&mut tx, &e).await?;
    match e.kind {
        EventKind::Ceased | EventKind::Liquidation | EventKind::Bankruptcy => {
            set_party_status(&mut tx, e.subject_id, PartyStatus::OnHold).await?;
            let open = open_work_for_party(&mut tx, e.subject_id).await?; // loads, tenders, invoices
            enqueue_outbox(&mut tx, "party.ceased", e.subject_id, &open).await?;
        }
        EventKind::SpinOff => {
            enqueue_outbox(&mut tx, "party.spun_off", e.subject_id, &e.counterparty_id).await?;
        }
        _ => enqueue_outbox(&mut tx, "party.corporate_event", e.subject_id, &e.id).await?,
    }
    tx.commit().await
}
```

Design notes:

- **Effective time, not announcement time.** A deal announced in one quarter and closed in another changes invoices, tax IDs and remit-to addresses only from closing; `effective_at` is what records follow, and the source is kept.
- **Parents are a pointer, history is events.** `parent_party_id` answers "who owns this carrier now"; the events answer "who owned it when this load moved." Ownership percentages for sanctions screening are [Export Compliance & Screening](/books/logistics/export-compliance)'s.
- **A party never becomes another party.** When companies merge, both rows survive with a successor link, because every old load, invoice and claim names the one that existed then ([Merges, Recorded and Reversible](/docs/building-blocks/record-linkage#merges-recorded-and-reversible)).
- **Size bands are inputs, not judgments.** A banded power unit count drives routing and vetting rules (a one-truck carrier on a five-load-a-day lane); the count comes from the registry's MCS-150 data, so the band is a view over it rather than a second copy that can drift.

## What This Means for the System You Build

- **Expect every counterparty to play several roles** and to change owner, name or existence during the life of its records.
- **Record corporate events with effective times and sources,** and drive migrations, holds and re-onboarding from them.
- **Know which software each partner runs,** because integrations, cutovers and vendor acquisitions follow it.
- **Treat the long tail as the normal case:** most carriers have no API, and the portal, app, email and PDF paths are production paths.
- **Compare companies on net revenue and operating ratio,** never on gross revenue.

## References

**Filings**

- [C.H. Robinson Worldwide: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1043277/000104327726000009/chrw-20251231.htm), revenue, adjusted gross profit, shipments, providers and gross and net recognition
- [GXO Logistics: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1852244/000185224426000007/gxo-20251231.htm), revenue, facilities, square feet, team members and contract structure
- [J.B. Hunt Transport Services: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/728535/000143774926005294/jbht20251231_10k.htm), revenue, segments and rail partners
- [XPO: revenue in XBRL](https://data.sec.gov/api/xbrl/companyconcept/CIK0001166003/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json), 2025 revenue
- [Knight-Swift Transportation: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1492691/000149269126000016/knx-20251231.htm), revenue by segment and tractors
- [RXO: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1929561/000192956126000013/rxo-20251231.htm), revenue and the Coyote acquisition
- [Schneider National: revenue in XBRL](https://data.sec.gov/api/xbrl/companyconcept/CIK0001692063/us-gaap/Revenues.json), 2025 revenue
- [Old Dominion Freight Line: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/878927/000119312526067161/odfl-20251231.htm), revenue, service centers and operating ratio
- [Uber Technologies: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1543151/000154315126000015/uber-20251231.htm), Freight revenue, Adjusted EBITDA and gross presentation
- [Landstar System: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/853816/000119312526064756/d66072d10k.htm), revenue, agents and BCO trucks
- [Saia: revenue in XBRL](https://data.sec.gov/api/xbrl/companyconcept/CIK0001177702/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json), 2025 revenue
- [Werner Enterprises: revenue in XBRL](https://data.sec.gov/api/xbrl/companyconcept/CIK0000793074/us-gaap/Revenues.json), 2025 revenue
- [Heartland Express: revenue in XBRL](https://data.sec.gov/api/xbrl/companyconcept/CIK0000799233/us-gaap/Revenues.json), 2025 revenue
- [Union Pacific: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/100885/000010088526000037/unp-20251231.htm), operating revenue, operating ratio and route miles
- [Cass Information Systems: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/708781/000070878126000010/cass-20251231.htm), transportation invoices and dollars paid
- [Yellow Corporation: Form 8-K (August 7, 2023)](https://www.sec.gov/Archives/edgar/data/716006/000119312523204370/d483482d8k.htm), the Chapter 11 filing
- [FedEx: Form 8-K Exhibit 99.1 on the FedEx Freight separation](https://www.sec.gov/Archives/edgar/data/0001048911/000110465926068519/tm2616055d2_ex99-1.htm), completion date, ticker, distribution ratio and retained stake
- [Descartes Systems Group: fiscal 2026 results](https://www.sec.gov/Archives/edgar/data/1050140/000092963826000965/exhibit99-1.htm), revenue, services share, the network and acquisitions
- [Descartes Systems Group: 3GTMS acquisition](https://www.sec.gov/Archives/edgar/data/1050140/000092963825002172/exhibit99-2.htm), date and price
- [Manhattan Associates: 2025 results](https://www.sec.gov/Archives/edgar/data/1056696/000119312526024382/manh-ex99_1.htm), revenue, cloud subscriptions and RPO
- [SPS Commerce: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1092699/000109269926000012/spsc-20251231.htm), revenue and recurring share

**Industry**

- [American Trucking Associations: American Trucking Trends 2025](https://trucking.org/news-insights/ata-releases-latest-edition-american-trucking-trends-0), tonnage share, tons, revenue, drivers and fleet sizes
- [American Trucking Associations: Navigating the challenges of 2026](https://trucking.org/news-insights/navigate-challenges-2026-truckings-trusted-roadmap), about 580,000 authorized interstate motor carriers

**Vendors and press**

- [Samsara: Q4 fiscal 2026 results](https://www.samsara.com/company/news/press-releases/q4-fiscal-year-2026-results), quarterly revenue and ARR
- [WiseTech Global: Completes acquisition of e2open](https://www.wisetechglobal.com/news/wisetech-global-completes-strategic-acquisition-of-e2open/), date, price and enterprise value
- [Modern Materials Handling: Körber Supply Chain Software completes acquisition of MercuryGate](https://www.mmh.com/article/koerber_supply_chain_software_completes_acquisition_of_tms_provider_mercurygate/software_tech), date, the Körber and KKR joint venture, and the Infios rebrand
- [Trimble: Platform Science completes acquisition of Trimble's telematics units](https://news.trimble.com/2025-02-10-Platform-Science-Completes-Acquisition-of-Trimbles-Global-Transportation-Telematics-Business-Units), date, what was sold and what Trimble kept
- [DAT: Company](https://www.dat.com/company), the product lines, including factoring
- [Truckstop: Factoring](https://truckstop.com/product/factoring/), Truckstop Factoring for carriers
- [Descartes: Descartes acquires MyCarrierPortal](https://www.descartes.com/resources/news/press-release-descartes-acquires-mycarrierportal), carrier onboarding and monitoring
- [TechCrunch: Flexport acquires technology of former digital freight unicorn Convoy (November 1, 2023)](https://techcrunch.com/2023/11/01/flexport-acquires-technology-of-former-digital-freight-unicorn-convoy), Convoy's end and the technology sale
- [GeekWire: Flexport is selling Convoy's technology to DAT (July 28, 2025)](https://www.geekwire.com/2025/flexport-is-selling-convoys-technology-to-freight-giant-dat/), the sale to DAT
