+++
title = "The Data Center & Colocation"
description = "Power, cooling, Uptime tiers and TIA-942 ratings, cross-connects, remote hands, and how colocation is sold, from a cabinet to a powered shell."
category = "Hosting & Cloud Industry"
order = 2114
part = "The Stack, Bottom to Top"
tags = ["data-centers", "colocation", "power", "cooling", "interconnection"]
+++

Every server in this volume sits in a building that somebody has to power, cool, guard and wire to the rest of the internet, and the building is the slowest-moving part of the stack. A virtual machine appears in a minute and a dedicated server in an hour, but a data hall takes years to permit, connect to the grid and build, and the electricity it was designed for decides what can go in it for decades. Colocation is the business of renting that building out in pieces: a cabinet, a cage, a private suite or a whole powered shell, priced mostly by the kilowatt, with the cables to other tenants and networks (cross-connects) and the on-site technicians who rack and reboot for absent customers (remote hands) sold on top.

The customer of a colocation operator is usually a provider itself. A web host, a developer cloud, a CDN or a GPU cloud that doesn't own buildings leases space and power from one, and the colocation contract becomes the underlay of its regions. This chapter covers what a facility sells and how it's rated (power, cooling, Uptime Institute tiers and TIA-942 ratings), the connective products that make a building valuable (cross-connects and interconnection fabrics), remote hands, how the market prices all of it, and what changed when AI racks went from 10 kW to more than 100. It adds facilities, cabinets, cross-connects, power circuits and remote hands tickets to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). The servers that go into the cabinets are [Dedicated Servers & Bare Metal](/books/hosting-and-cloud/dedicated-servers); the switches that connect them are [Data Center Networking](/books/hosting-and-cloud/data-center-networking); how a provider lays out buildings into regions and failure domains is [Regions, Zones, Cells & Quotas](/books/hosting-and-cloud/regions-zones-and-cells#what-a-zone-promises); peering, IXPs and IP addressing belong to [Networks, Peering & IP Addresses](/books/hosting-and-cloud/networks-peering-and-ip-addresses#transit-peering-and-interconnection); and the move from a home rack into a first quarter-rack is [From Homelab to Colocation](/books/hosting-and-cloud/homelab-to-colocation#when-the-house-isn-t-enough).

## How the Providers Do It

| Operator | Footprint (as stated) | How it sells | What it shows |
| --- | --- | --- | --- |
| **Equinix** | 280 data centers in 77 markets in 36 countries; "more than 500,000 interconnections" (FY2025 10-K) | Cabinets and private cages billed "based on the space and power a customer consumes"; cross-connects; Equinix Fabric for "on-demand, software-defined interconnection"; Smart Hands for "around-the-clock, on-site operational support" | Retail colocation whose margin is the interconnection inside it: interconnection revenue was $422 million in Q3 2025 |
| **Digital Realty** | 310 data centers (89 of them in unconsolidated entities) in over 55 metros and more than 30 countries; more than 232,000 cross-connects (FY2025 10-K) | Turn-key Data Center Suites, Powered Base Buildings, build-to-suit and high-density colocation; ServiceFabric as a connectivity layer to clouds and partners | Wholesale and retail in one portfolio, from a shell the tenant fits out to a cabinet |
| **CoreSite (American Tower)** | 30 data centers in 11 markets, 4.8 million+ square feet, 44,000+ interconnections (as of October 2026) | Colocation with the Open Cloud Exchange (OCX); Remote Hands "available 24x7" for rack and stack, cross-connect termination, fiber light readings, power cycling and serial console access; a "100% uptime SLA" | A tower company buying interconnection density; American Tower closed the acquisition on December 28, 2021 |
| **Iron Mountain Data Centers** | 31 data centers in 21 markets; 488 MW leasable and 852 MW under construction or held for development, 1,340 MW potential (FY2025 10-K) | Colocation and build-to-suit inside a records-management company | Capacity reported in megawatts, not square feet |
| **QTS (Blackstone)** | "30+ facilities," with campuses listed at 190 to 278 MW+ each, many "In Development" (as of October 2026) | Hyperscale and wholesale campuses | Private capital at data center scale: Blackstone completed the roughly $10 billion take-private on August 31, 2021 |
| **Centersquare (formerly Cyxtera and Evoque)** | 80 colocation data centers, 500+ MW, 17 markets (as of October 2026) | Retail colocation | A leased-building model that went through Chapter 11 in 2023 and was recombined under Brookfield |

Four patterns run through the table. **Power is the unit:** operators describe themselves in megawatts and price in kilowatts, because power and the cooling that removes it are the scarce inputs, and floor space follows. **Interconnection is the moat:** Equinix and CoreSite publish cross-connect and interconnection counts the way a cloud publishes regions, because a building full of networks and clouds attracts the next tenant who wants to reach them. **Wholesale and retail are different businesses:** a powered shell or a multi-megawatt suite is leased to one tenant who fits it out, a cabinet is sold to thousands with power, cooling, security and remote hands bundled, and the large operators run both. **The capital is patient and changes hands:** two of the six operators above were taken private or acquired in 2021 and one was sold out of bankruptcy, and the tenant's contract survives the change of owner, which is a reason to read assignment clauses.

The market is tight as of mid-2026. CBRE reported North American primary-market vacancy at 1.4% in H1 2026, flat on year-end 2025, with 7,481 MW under construction and more than 80% of it preleased; Northern Virginia vacancy fell to 0.2% from 0.7% with 2,420.2 MW under construction, and asking rents rose for every deployment size, led by 8.3% for 3 to 10 MW requirements. A tenant that needs capacity in a constrained market in 2026 signs before the building is finished.

## How It Got Here

### Neutral buildings (late 1990s)

The first colocation businesses sold what a single company couldn't build alone: diverse power feeds, generators, cooling, physical security and, most of all, a building where many networks were present. Equinix was incorporated on June 22, 1998 to run neutral interconnection buildings where carriers and customers meet, and the cross-connect, a physical cable from one tenant's cabinet to another's, became the product that made the building worth more than its floor area ([From Bare Metal to Cloud](/books/hosting-and-cloud/bare-metal-to-cloud#era-1-files-on-someone-else-s-server-to-the-early-2000s)). **What it solved:** carrier density and redundancy no single tenant could afford. **What it cost:** long contracts, physical lead times, and staff who must drive to the building.

### Ratings and the vocabulary of redundancy

As buyers compared buildings, the industry settled on two rating systems. The Uptime Institute's Tier Standard defines four levels by the topology of power and cooling: Tier I protects against human error "but not unexpected failure or outage"; Tier II adds "redundant capacity components for power and cooling"; Tier III is "concurrently maintainable," needing "no shutdowns when equipment needs maintenance or replacement"; Tier IV has "several independent and physically isolated systems" so that planned and unplanned events don't affect the IT load. Uptime certifies a facility in three stages: Tier Certification of Design Documents, of the Constructed Facility (that it was "constructed as designed") and of Operational Sustainability. TIA-942 rates the same idea from Rated-1 "Basic Site Infrastructure" through Rated-3 "Concurrently Maintainable" to Rated-4 "Fault Tolerant," where one fault anywhere can occur without downtime, and TIA has authorized a revision, TIA-942-C. **What it solved:** a shared language for redundancy in contracts and RFPs. **What it cost:** a rating describes design and construction, not this month's operations, unless the operational certification is also held.

### Efficiency as a number (2007 on)

Power Usage Effectiveness, introduced by The Green Grid in 2007, is total facility power divided by IT equipment power: 1.0 would mean every watt reaches a server. Uptime's 2025 survey put respondents' weighted average annual PUE at 1.54, "the sixth consecutive year that this headline figure has virtually stood still," with facilities commissioned in the last five years at 1.48 and those of 20 MW and above at 1.44. A hyperscaler that designs its own buildings reports far lower: Google's trailing-twelve-month fleet PUE was 1.09 for Q4 2025. ASHRAE's thermal guidelines (fifth edition) recommend 18 to 27 °C at server inlets for its A1 to A4 classes, and added an H1 class for high-density equipment with a narrower 18 to 22 °C recommended range. **What it solved:** a metric operators could report and buyers could compare. **What it cost:** PUE measures overhead, not total energy or the carbon in it, and a colocation tenant pays for the overhead whether or not the operator reports it.

### Consolidation and a bankruptcy (2021 to 2024)

Investors bought the sector at scale. Blackstone completed its acquisition of QTS for about $10 billion including debt on August 31, 2021, and American Tower closed its acquisition of CoreSite on December 28, 2021. Cyxtera, which leased many of its buildings, filed for Chapter 11 in the US Bankruptcy Court for the District of New Jersey on June 4, 2023 (case 23-14853); its plan was confirmed on November 17, 2023, and it sold substantially all of its assets to a Brookfield Infrastructure affiliate for $775 million, closing and emerging on January 12, 2024. Brookfield's counsel dates its completion through the portfolio company Evoque to January 16, 2024, at a total of $1.3 billion including seven data center properties, and the combined business launched as Centersquare in April 2024. **What it solved:** capital for building at the rate demand required. **What it cost:** tenants learned that an operator with leased buildings and high debt can fail, and that their contracts move with the assets.

### The AI rack (2023 on)

Standard colocation racks are built for 5 to 10 kW; high-density GPU racks need 40 to 80 kW or more (Inflect's 2026 market guide). A rack-scale system moved the number again: NVIDIA's GB200 NVL72 puts 72 Blackwell GPUs and 36 Grace CPUs in one liquid-cooled rack, Supermicro specifies its version at "total power 132kW" with a 250 kW in-rack coolant distribution unit, and SemiAnalysis puts the NVL72 at about 120 kW against about 40 kW for higher-density air-cooled H100 racks. Oxide's rack-scale computer, at about 15 kW, sits at the conventional end. **What it solved:** whole training clusters in a few rows. **What it cost:** most existing halls can't power or cool these racks without facility water, so the newest AI capacity goes to new buildings, and the GPU business that fills them is the later chapter [GPU & AI Clouds](/books/hosting-and-cloud/gpu-and-ai-clouds#power-cooling-and-the-rack).

## What a Facility Sells

### Power

Power is the product and the constraint. A tenant buys circuits, each a voltage, amperage and phase from a breaker in a power distribution unit, normally in pairs on separate A and B feeds so a single feed can fail; Inflect's 2026 guide gives dual 20-amp 208 V circuits as the typical full-rack provision. Redundancy only holds if either feed of the pair can carry the whole cabinet alone, so the load a tenant plans per cabinet is set by one feed, not by the two added together. Inflect's 2026 guide describes two billing models in the US market: a fixed all-in rate per committed kilowatt (around $250 per kW per month in its example) that bundles cooling and facility overhead, or metered energy at a utility-linked rate ($0.06 to $0.12 per kWh in its range) plus a space or circuit charge; it reports that the per-kW rate is generally the same for liquid- and air-cooled racks. Wholesale tenants contract for megawatts of critical IT load and pay the utility cost through.

The behind-the-meter chain is what the Uptime tiers describe: utility feeds, switchgear, uninterruptible power supplies (UPS) that bridge until generators start, generators with on-site fuel, and the distribution paths to each row. A Tier III building can take any one component or path out for maintenance without dropping the load; a Tier IV building survives an unplanned failure of one. The tenant's half is to use both feeds: a server with one power supply plugged into one feed gets none of the building's redundancy.

### Cooling

Every watt delivered becomes heat to remove. Air cooling with hot and cold aisles, containment and computer room air handlers serves conventional densities within the ASHRAE recommended inlet range. SemiAnalysis puts higher-density air-cooled racks at about 40 kW; beyond that the options are rear-door heat exchangers, direct-to-chip liquid cooling fed by a coolant distribution unit (CDU), or immersion. Liquid cooling needs facility water to the row, which is a building decision, not a tenant one; Supermicro offers liquid-to-air CDUs of 180 or 240 kW for sites without facility water. PUE is how the operator reports the overhead of all of this, and it's the number a tenant should ask for per building, measured annually, because a design PUE and an operated PUE differ.

### Space

Space is sold in units that set how much of the room the tenant controls:

- **Cabinet** (rack): a lockable enclosure in a shared room, with power circuits to it; Equinix's 10-K calls them "steel-framed cabinets sized to industry standards," and Inflect lists a full rack at 36 to 44U and a half rack at 18 to 22U, with single rack units (1U, 1.75 inches) sold for one server.
- **Cage:** a fenced area with several cabinets, "designed and built to order for a single customer" in Equinix's description; Inflect puts a typical cage at 200 to 400+ square feet with a minimum of two to four cabinets.
- **Private suite:** a walled room with its own access control, sometimes its own cooling units.
- **Powered shell or base building:** the building with power to it, which the tenant fits out; Digital Realty sells Powered Base Buildings and build-to-suit.

Retail colocation (cabinets and cages) bundles power, cooling, security and access; wholesale (suites, halls, shells) leases capacity by the megawatt for long terms and leaves fit-out and operations to the tenant.

## Cross-Connects and Interconnection

A cross-connect is "a point-to-point cable link between two Equinix customers in the same data center" in Equinix's own definition, and the same product everywhere: a fiber or copper run from the tenant's cabinet to a meet-me room patch panel and on to another tenant, a carrier, an internet exchange port or a cloud on-ramp. Inflect's 2026 ranges put a US cross-connect at $100 to $500 to install plus $150 to $300 a month. The monthly charge for a passive cable is the interconnection business: Equinix reported more than 499,000 interconnections and $422 million of interconnection revenue in Q3 2025, up 10% year over year as reported, after Q2 2025 became its first quarter above $400 million.

Ordering one runs on a document. The party that owns the far port issues a **letter of authorization and connecting facility assignment** (LOA-CFA) naming its panel and port; the other side, or its network provider, gives it to the colocation operator to order the cross-connect. AWS documents exactly this flow for Direct Connect: download the LOA-CFA and send it "to your network provider or colocation provider so that they can order a cross connect for you." The operator runs and tests the cable and returns a circuit ID, and bills whoever ordered it. Disconnection is an order too, and an unbilled cable left in place after a contract ends is a cost to whoever is still paying the monthly charge.

Software-defined interconnection is the virtual version. Equinix Fabric, Digital Realty's ServiceFabric and CoreSite's Open Cloud Exchange give a tenant one physical port and let it provision virtual connections to clouds and other tenants on demand, billed by bandwidth and term. The physical port is still a cross-connect; the virtual circuits ride on it.

## Remote Hands

The tenant's servers are in a building its staff rarely visit, so the operator sells their hands. CoreSite's list is representative: rack and stack, cross-connect termination, fiber light readings, power cycling or swapping modular equipment, and remote serial console access. Equinix's Smart Hands and CoreSite's Remote Hands are the named products; dedicated server providers sell the same service on their own hardware (Hetzner lists "Remote Hands (15 minutes)" at €21.00, charged each time, as of October 2026). Inflect's 2026 range is $50 to $150 per 15-minute interval, or a bundle of hours in tiered contracts.

A remote hands request is a work order with the same parts everywhere: what to do, on which asset in which cabinet, authorization from someone allowed to request work, a time window, the technician's notes and photos, and the billed increments. Tenants that want the request done right pre-label everything: asset tags on servers, port labels, a cabling diagram, and a runbook for the task. Shipping and receiving (the dock accepts a pallet of servers for a tenant) is a related service with its own rules about tracking numbers and storage time.

## How Colocation Is Sold

A colocation contract is a master services agreement with order forms. The commercial terms that matter:

- **Committed power and space,** with a term, an escalator, and the right (or not) to expand into adjacent space. Inflect's 2026 guide puts pilot terms at 3 to 12 months, reports 3 to 5 year terms earning 10 to 20% discounts over month-to-month, and notes early-exit charges of 50 to 100% of the remaining contract value at some providers.
- **Power billing model:** all-in per committed kilowatt, or metered energy plus a space or circuit charge, and what happens above the commitment.
- **Service levels:** CoreSite publishes a "100% uptime SLA"; Equinix reports "99.9999%+ operational uptime" across its data centers in 2025 as a record rather than an SLA. Read what a power SLA counts as an outage: where it requires both A and B feeds to a cabinet to fail, a tenant that used only one feed is outside it.
- **Interconnection:** cross-connect install and monthly prices, and whether the operator permits carriers the tenant brings.
- **Remote hands:** included hours, the rate after them, and response time.
- **Access and compliance:** who may enter, how visitors are authorized, and which attestations the operator holds (SOC 2 and ISO 27001 reports for the facility controls the tenant inherits, per the playbook's [SOC 2](/docs/compliance/soc-2#engineering-is-the-evidence) doc).
- **Assignment and change of control:** whether the contract survives a sale of the operator or the building, and what the tenant may do if the operator fails.

For the provider reselling colocation capacity downstream, the same contract terms become its costs: a host that buys a cage at an all-in per-kW price and sells dedicated servers by the month carries the risk that its servers draw more than it planned.

## The Alternatives

| Model | Strengths | Failure modes | Ownership and terms | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- |
| **Build and own** | Full control of design, density and cost at scale; lowest long-run cost per kW | Years of lead time, grid connection, capital, and an operations team | Owned land and building | Capital plus operations | Hyperscalers, the largest platforms |
| **Wholesale or powered shell** | Megawatts on long terms, own fit-out and operations, operator handles the building | Long commitments, fit-out capital, little flexibility to shrink | Multi-year lease of MW | Per kW of critical load, utility pass-through | Clouds, large SaaS, GPU clouds |
| **Retail colocation (cabinets, cages, suites)** | Fast to start, interconnection on site, remote hands, no building to run | Higher per-kW price, density limits, contract and change-of-control risk | Order forms under an MSA; months to 5 years | All-in per kW or metered, plus cross-connects and remote hands | Hosts, developer clouds, CDNs, enterprises, repatriating companies |
| **Dedicated servers in someone else's colo** | No hardware capital, provider handles spares and reimaging | One provider's hardware choices and network | Monthly rental | Per server per month | Small hosts, bare-metal users (see [Dedicated Servers & Bare Metal](/books/hosting-and-cloud/dedicated-servers)) |
| **Cloud** | No building, hardware or contract for capacity; minutes to scale | Highest unit cost for steady load; egress fees; no say in density | Usage terms | Per second, per GB | Everyone, for variable load |

## My Default

My default for a provider that doesn't own buildings is retail colocation in two facilities of different operators in the same metro, each rated or certified to Tier III or Rated-3 for design and construction, with A and B power to every cabinet, a power commitment I expect to use at 60 to 80% within the first year, and cross-connects to at least two carriers and an internet exchange in each. I'd buy power all-in per kilowatt while the footprint is small, because metered billing adds a meter and a reconciliation for savings that only matter at scale, and I'd switch to metered or wholesale terms once a single site passes a few hundred kilowatts of steady load. Two operators instead of one costs some interconnection between them and buys the ability to walk away from either, which the 2023 Chapter 11 showed has real value.

What would change it: GPU racks above about 40 kW, which need a building with liquid cooling to the row and usually a new one; a residency requirement that only one operator meets; or a scale where the operator's margin pays for owning, which most providers never reach ([Repatriation](/books/hosting-and-cloud/repatriation#a-cost-model-for-owning) and [From Homelab to Colocation](/books/hosting-and-cloud/homelab-to-colocation) cover the earlier steps).

## How to Build It

The chapter adds facilities, colocation kinds and their side tables, and remote hands tickets to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). The same tables serve both sides: a colocation seller's customers hold cabinets, circuits and cross-connects as resources; a provider that buys colocation records its own cabinets as resources of its own internal account, with the vendor's contract behind them. [Dedicated Servers & Bare Metal](/books/hosting-and-cloud/dedicated-servers) places hardware in these cabinets; [Regions, Zones, Cells & Quotas](/books/hosting-and-cloud/regions-zones-and-cells) maps facilities to zones; [Hybrid & On-Prem Cloud](/books/hosting-and-cloud/hybrid-and-on-prem-cloud) adds facilities at customer sites.

```sql
-- resources.kind gains 'cabinet', 'cross_connect', 'power_circuit'

CREATE TABLE facilities (                -- a building or data hall
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  code            TEXT NOT NULL UNIQUE,  -- the provider's code, e.g. 'fra2-hall3'
  operator        TEXT NOT NULL CHECK (operator IN ('self', 'colo_vendor', 'customer')),
  vendor_name     TEXT,                  -- the colocation operator, when not self
  vendor_site_ref TEXT,                  -- the operator's own building code
  country         CHAR(2) NOT NULL,
  subdivision     TEXT,
  region_id       TEXT REFERENCES regions (id),  -- null: not (yet) in a region
  design_rating   TEXT,                  -- 'Uptime Tier III (design, constructed)', 'TIA-942 Rated-3'
  rating_ref      TEXT,                  -- certificate number or the attestation document
  status          TEXT NOT NULL CHECK (status IN ('planned', 'active', 'draining', 'exited')),
  CHECK ((operator = 'colo_vendor') = (vendor_name IS NOT NULL))
);

CREATE TABLE facility_contracts (        -- the provider's own colo contracts, as a buyer
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  facility_id        UUID NOT NULL REFERENCES facilities (id),
  vendor_name        TEXT NOT NULL,
  committed_kw       NUMERIC(10,2) NOT NULL,
  power_billing      TEXT NOT NULL CHECK (power_billing IN ('all_in_per_kw', 'metered',
                       'per_circuit')),
  term               TSTZRANGE NOT NULL,
  assignment_clause  TEXT,               -- what happens on a sale of the operator
  contract_ref       TEXT NOT NULL
);

CREATE TABLE cabinets (                  -- side table: kind = 'cabinet'
  resource_id      UUID PRIMARY KEY REFERENCES resources (id),
  facility_id      UUID NOT NULL REFERENCES facilities (id),
  location_code    TEXT NOT NULL,        -- room, row and position: 'H3-R12-C07'
  enclosure        TEXT NOT NULL CHECK (enclosure IN ('cabinet', 'cage', 'suite', 'shell')),
  rack_units       SMALLINT,             -- 42, 45, 48; null for a suite or shell
  committed_kw     NUMERIC(8,2) NOT NULL,
  cooling          TEXT NOT NULL CHECK (cooling IN ('air', 'rear_door', 'direct_liquid',
                     'immersion')),
  UNIQUE (facility_id, location_code)
);

CREATE TABLE power_circuits (            -- side table: kind = 'power_circuit'
  resource_id      UUID PRIMARY KEY REFERENCES resources (id),
  cabinet_id       UUID NOT NULL REFERENCES resources (id),   -- kind = 'cabinet'
  feed             TEXT NOT NULL CHECK (feed IN ('A', 'B')),
  pair_circuit_id  UUID REFERENCES resources (id),            -- its other feed
  volts            SMALLINT NOT NULL,    -- 120, 208, 230, 415
  amps             SMALLINT NOT NULL,
  phase            SMALLINT NOT NULL CHECK (phase IN (1, 3)),
  pdu_ref          TEXT NOT NULL,        -- the panel and breaker it comes from
  billing_mode     TEXT NOT NULL CHECK (billing_mode IN ('all_in_per_kw', 'metered',
                     'per_circuit')),
  derated_kw       NUMERIC(8,2) NOT NULL -- the planned usable load, below the breaker rating
);

CREATE TABLE cross_connects (            -- side table: kind = 'cross_connect'
  resource_id      UUID PRIMARY KEY REFERENCES resources (id),
  facility_id      UUID NOT NULL REFERENCES facilities (id),
  a_cabinet_id     UUID NOT NULL REFERENCES resources (id),   -- the ordering tenant's side
  a_port           TEXT NOT NULL,        -- panel and port
  z_party          TEXT NOT NULL,        -- the other tenant, carrier, IX or cloud on-ramp
  z_party_kind     TEXT NOT NULL CHECK (z_party_kind IN ('tenant', 'carrier', 'ix',
                     'cloud_onramp', 'own_cabinet')),
  z_port           TEXT NOT NULL,
  media            TEXT NOT NULL CHECK (media IN ('smf', 'mmf', 'copper', 'coax')),
  loa_ref          TEXT NOT NULL,        -- the LOA/CFA it was ordered against
  circuit_ref      TEXT,                 -- the operator's circuit ID, once installed
  tested_at        TIMESTAMPTZ
);

CREATE TABLE remote_hands_tickets (      -- work orders on site
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id       UUID NOT NULL REFERENCES accounts (id),
  facility_id      UUID NOT NULL REFERENCES facilities (id),
  cabinet_id       UUID REFERENCES resources (id),
  asset_ref        TEXT,                 -- the asset tag; hardware_assets in the next chapter
  task             TEXT NOT NULL CHECK (task IN ('power_cycle', 'rack_and_stack',
                     'part_swap', 'cabling', 'light_reading', 'console', 'receive_shipment',
                     'inspection', 'other')),
  instructions     TEXT NOT NULL,
  requested_by     TEXT NOT NULL,        -- typed actor; must be on the access list
  urgency          TEXT NOT NULL CHECK (urgency IN ('scheduled', 'standard', 'urgent')),
  status           TEXT NOT NULL CHECK (status IN ('open', 'scheduled', 'in_progress',
                     'awaiting_customer', 'done', 'cancelled')),
  worked_during    TSTZRANGE,            -- technician time on the task
  billed_increments SMALLINT,            -- 15-minute units, the common billing grain
  sku_id           UUID REFERENCES skus (id),
  notes            TEXT,                 -- the technician's report; photos stored by reference
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE facility_access_grants (    -- who may enter or request work
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id       UUID NOT NULL REFERENCES accounts (id),
  facility_id      UUID NOT NULL REFERENCES facilities (id),
  person_name      TEXT NOT NULL,
  may_enter        BOOLEAN NOT NULL,
  may_request_work BOOLEAN NOT NULL,
  valid_during     TSTZRANGE NOT NULL
);
```

Notes on the sketch:

- **A facility is not a region.** A region is a customer-facing footprint; a facility is a building or hall with an operator and a rating. One region spans several facilities and a facility can serve none yet, so `region_id` is nullable and the mapping to zones belongs to Regions, Zones, Cells & Quotas.
- **Power circuits are resources with pairs.** Each feed is its own resource so it can be billed, metered and suspended, and `pair_circuit_id` makes the A/B pairing queryable: "which cabinets have only one feed," the question a power SLA turns on, is one join.
- **Derated load is a column, not a calculation at query time.** The planned usable kilowatts per circuit, below the breaker rating, is set when the circuit is provisioned, so capacity planning and over-draw alerts compare metered load against a stored number.
- **Metered power is usage.** For `billing_mode = 'metered'`, PDU readings arrive as `usage_events` with meter `power.kwh` and the circuit as `resource_id`; an all-in circuit is a recurring SKU and needs no meter for billing, only for capacity alerts.
- **Cross-connects carry their paperwork.** The LOA reference, the circuit ID and the test date are what the operator and the other party ask for when a circuit is disputed or disconnected; a cross-connect with no billed owner is found by joining it to an ended subscription.
- **Remote hands are billable work orders.** Increments and the SKU make the ticket an invoice line; the access list makes "who asked for this" provable.
- **Events:** `facility.status_changed`, `cabinet.provisioned`, `power_circuit.over_draw` (metered load above `derated_kw`), `cross_connect.ordered`, `cross_connect.installed`, `cross_connect.disconnected`, `remote_hands.requested` and `remote_hands.completed` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to billing, capacity planning and the customer's notifications.

## Auditing

- **Who entered and who asked.** Every access grant with its range, every visit the operator logs, and every remote hands request with its requester, because a physical change to a server is as consequential as an API call ([Audit Trails](/docs/architecture/audit-trails#typed-actors)).
- **What the building was rated, and when.** The design, constructed-facility and operational attestations with their dates, and the operator's SOC 2 or ISO 27001 reports for each period, because a customer's auditor inherits those controls.
- **Power drawn against power sold.** Metered readings per circuit, over-draw events, and single-feed cabinets, which are where SLA claims and capacity disputes start.
- **Every cross-connect's life.** Order, LOA, installation, test, and disconnection, so a monthly charge can be traced to a cable that exists.

## What This Means for the System You Build

- **Model the building separately from the region,** with the operator, its rating and its contract, because the customer sees regions and the provider pays for facilities.
- **Price and plan in kilowatts,** derated per circuit, and alert on draw against the derated number, not the breaker.
- **Make A and B feeds first-class,** so the SLA question "were both feeds down" and the risk question "which servers have one" are queries.
- **Treat cross-connects as billed resources with paperwork,** and reconcile them against the operator's invoice every month.
- **Run remote hands as work orders** with an access list, billed increments and the technician's report attached.
- **Read the change-of-control clause,** because operators are bought, sold and occasionally reorganized in bankruptcy, and the contract is what survives.
- **Expect AI racks to need a different building,** and plan GPU capacity around liquid cooling and power, not floor space.

## References

**Papers and standards**

- [Uptime Institute: Tier classification](https://uptimeinstitute.com/tiers), Tier I to IV definitions, concurrent maintainability and fault tolerance
- [Uptime Institute: Tier Certification](https://uptimeinstitute.com/tier-certification), design documents, constructed facility and operational sustainability certifications
- [TIA: TIA-942 certifications and ratings](https://tiaonline.org/products-and-services/tia942certification/tia-942-certifications-ratings/), Rated-1 to Rated-4
- [TIA: TIA-942 certification](https://tiaonline.org/products-and-services/tia942certification/), TIA-942-C newly authorized
- [ASHRAE TC 9.9: Thermal Guidelines reference card, fifth edition](https://www.ashrae.org/file%20library/technical%20resources/bookstore/supplemental%20files/therm-gdlns-5th-r-e-refcard.pdf), recommended 18 to 27 °C for classes A1 to A4 and the H1 class
- [Uptime Institute: Global Data Center Survey 2025](https://datacenter.uptimeinstitute.com/rs/711-RIA-145/images/2025.Annual.Survey.Report.pdf), PUE's 2007 introduction by The Green Grid, the 1.54 weighted average and the newer and larger facility averages

**Filings**

- [Equinix: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1101239/000110123926000032/eqix-20251231.htm), 280 data centers in 77 markets and 36 countries, more than 500,000 interconnections, Fabric, Smart Hands, the cross-connect definition, billing on space and power, and 99.9999%+ operational uptime in 2025
- [Equinix: Q2 2025 results](https://www.sec.gov/Archives/edgar/data/0001101239/000110123925000035/eqix-063025xpressrelease.htm), the first quarter of interconnection revenue above $400 million
- [Equinix: Q3 2025 results](https://www.sec.gov/Archives/edgar/data/1101239/000110123925000061/october292025pressrelease-.htm), more than 499,000 interconnections and $422 million of interconnection revenue
- [Equinix: Form 10-K for 2016, organization note](https://www.sec.gov/Archives/edgar/data/1101239/000162828017008031/R8.htm), incorporation on June 22, 1998
- [Digital Realty: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1297996/000110465926015365/dlr-20251231x10k.htm), 310 data centers, metros and countries, and cross-connect count
- [Iron Mountain: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1020569/000102056926000013/irm-20251231.htm), 31 data centers in 21 markets and leasable and planned megawatts
- [QTS: Form 8-K exhibit 99.1 (August 31, 2021)](https://www.sec.gov/Archives/edgar/data/1577368/000110465921111681/tm2126608d1_ex99-1.htm), Blackstone's completed acquisition for about $10 billion including debt
- [American Tower: completion of the CoreSite acquisition (SEC exhibit)](https://www.sec.gov/Archives/edgar/data/1053507/000119312521367969/d256586dex992.htm), December 28, 2021
- [Verita (claims agent): Cyxtera Technologies Chapter 11](https://veritaglobal.net/cyxtera), petition date June 4, 2023, case 23-14853 (D.N.J.), confirmation and effective dates

**Provider documentation**

- [Digital Realty: Data centers](https://www.digitalrealty.com/data-centers), the headline footprint as of October 2026
- [Digital Realty: Colocation](https://www.digitalrealty.com/platform-digital/colocation), suites, Powered Base Buildings, build-to-suit and high-density colocation
- [Digital Realty: ServiceFabric](https://www.digitalrealty.com/platform-digital/servicefabric), the connectivity layer
- [CoreSite: Data centers](https://www.coresite.com/data-centers), 30 data centers, 11 markets, interconnections and OCX
- [CoreSite: Remote Hands](https://coresite.com/colocation/remote-hands), the task list and 24x7 availability
- [CoreSite: Data center operations](https://www.coresite.com/data-centers/data-center-design/data-center-operations), the 100% uptime SLA
- [Iron Mountain: Data centers](https://www.ironmountain.com/data-centers), the 1.4 GW portfolio
- [QTS: Data centers](https://q.com/data-centers), campus capacities as of October 2026
- [Centersquare](https://csquare.com/), 80 colocation data centers and 500+ MW as of October 2026
- [AWS Direct Connect: Download the LOA-CFA](https://docs.aws.amazon.com/directconnect/latest/UserGuide/download-loa-cfa.html), the LOA-CFA sent to a colocation provider to order a cross-connect
- [Hetzner: Price list for additional products](https://docs.hetzner.com/robot/general/pricing/price-list-for-additional-products), Remote Hands at €21.00 per 15 minutes
- [Google: Data center efficiency](https://datacenters.google/efficiency/), Q4 2025 trailing-twelve-month PUE of 1.09
- [NVIDIA: GB200 NVL72](https://www.nvidia.com/en-us/data-center/gb200-nvl72/), 36 Grace CPUs and 72 Blackwell GPUs in a liquid-cooled rack
- [Supermicro: SRS-GB200-NVL72](https://supermicro.com/en/products/system/gpu/48u/srs-gb200-nvl72), total power of 132 kW, in-rack CDU and liquid-to-air options

**Announcements and release notes**

- [CBRE: North American data center demand continues to outpace supply](https://www.cbre.com/press-releases/north-american-data-center-demand-continues-to-outpace-supply-despite-record-construction), H1 2026 vacancy, construction, preleasing and rent increases
- [American Tower: completes acquisition of CoreSite](https://www.coresite.com/news/american-tower-completes-acquisition-coresite-realty-corporation), December 28, 2021
- [Davis Polk: Cyxtera emerges from Chapter 11](https://www.davispolk.com/experience/cyxtera-technologies-emerges-chapter-11), the $775 million sale and January 12, 2024 emergence
- [McCarthy Tétrault: Brookfield closes acquisition of Cyxtera through Evoque](https://www.mccarthy.ca/en/experience/brookfield-infrastructure-partners-closes-us-1-3b-acquisition-of-cyxtera-technologies-through-its-portfolio-company-evoque-data-center-solutions), January 16, 2024 and the $1.3 billion total
- [Data Center Frontier: Centersquare emerges](https://www.datacenterfrontier.com/colocation/article/55016615/brookfield-infrastructures-evoque-cyxtera-data-center-collaboration-emerges-as-centersquare), the April 2024 brand launch
- [Oxide: The cloud computer](https://oxide.computer/blog/the-cloud-computer), a rack-scale system at about 15 kW

**In practice**

- [Inflect: Colocation pricing in 2026](https://inflect.com/blog/colocation-pricing-what-to-expect-for-racks-cabinets-and-cages-in-2026), cross-connect, remote hands, rack density, rack sizes, circuits, contract terms and power billing ranges
- [SemiAnalysis: GB200 hardware architecture](https://newsletter.semianalysis.com/p/gb200-hardware-architecture-and-component), about 120 kW per NVL72 against about 40 kW for air-cooled H100 racks
</content>
</invoke>
