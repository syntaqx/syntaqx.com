+++
title = "Replacing a TMS, WMS or ERP"
nav_title = "Replacing Systems"
description = "Moving off a TMS, WMS or ERP: cutover by facility, lane or partner, loads in flight, inventory counts, EDI re-onboarding, ID maps, reconciliation and rollback."
category = "Logistics & Supply Chain Industry"
order = 2869
part = "Running the Platform"
tags = ["logistics", "migration", "cutover", "edi", "wms", "erp"]
+++

A logistics system is replaced while freight keeps moving. A broker switching TMS has loads on the road that were tendered in the old system, carriers waiting to be paid from it, and shippers sending 204s to an address it owns. A distributor switching WMS has inventory on every shelf whose location, lot and license plate live only in the old system's database, and trucks arriving tomorrow with ASNs the old system acknowledged. A manufacturer switching ERP has open purchase orders with suppliers, open sales orders with customers, inventory valued at a cost the new system must agree with, and a month-end close that doesn't move. And every trading partner, carrier API and visibility network the old system talked to has to be connected again, tested, and switched without a day of missed tenders or duplicate invoices.

Public filings show what a bad cutover costs. Lamb Weston said its North American ERP transition "temporarily reduced the visibility of finished goods inventories located at distribution centers," and it estimated the transition reduced net sales by "approximately $135 million" and net income by "approximately $72 million" in its fiscal third quarter of 2024. CONMED said its fourth quarter 2022 results were "significantly disrupted by the implementation of a new warehouse management system." Lands' End attributed an 8.5% revenue decline in its first quarter of fiscal 2026 "primarily" to "the rollout of a new warehouse management system and the deliberate pacing of shipments as the distribution centers ramped back to normal capacity." This chapter covers why replacements fail, choosing a cutover strategy, the TMS, WMS and ERP cutovers, re-onboarding partners, EDI cutover and parallel runs, data migration with ID maps and reconciliation, and rollback. It extends `documents`, uses the `external_refs` that `parties` and `facilities` already carry, and adds `migration_runs`, `migration_id_maps`, `migration_reconciliations`, `partner_cutovers` and `edi_dual_run_diffs`.

The general method (strangling instead of rewriting, big bang or phased or parallel, crosswalks, loading with side effects off, dark launches, reconciliation, rollback windows and archives) is the playbook's [Replacing a System](/docs/architecture/replacing-systems), and this chapter states each rule once and links it. The store version is the Commerce volume's [Replatforming & Migration](/books/commerce/replatforming), whose [Cutover Plans](/books/commerce/replatforming#cutover-plans) and [Validation and Reconciliation](/books/commerce/replatforming#validation-and-reconciliation) have the same shape with different objects.

## How the Platforms Do It

As of November 2026, from vendors' own documentation and companies' own filings:

| Company | What it says | What it means for a replacement |
| --- | --- | --- |
| **CONMED** (8-K, February 2, 2023) | Fourth quarter 2022 sales "significantly impacted by the implementation of new warehouse management software"; $6.8 million ($6,769 thousand in its reconciliation tables) of 2022 "incremental freight, professional fees and other costs related to the implementation" | A WMS cutover shows up as lost shipments and expedited freight, in the same quarter |
| **Lamb Weston** (8-K, April 4, 2024) | The transition moved "certain central systems and functions, including order to cash"; it "temporarily reduced the visibility of finished goods inventories located at distribution centers"; "greater impact on shipments of higher-margin mixed-product loads" | An ERP cutover's first casualty is inventory visibility, and mixed loads (several items, one truck) fail first because every line has to be found |
| **Lands' End** (8-K, June 9, 2026) | Revenue down $22.3 million (8.5%) on "the temporary disruption associated with the rollout of a new warehouse management system"; inventory up 14% from "the timing effects of the distribution center ramp-up"; Europe, "where distribution was not affected," grew 15% | A WMS cutover by facility is a natural cohort; the unaffected region is the control group |
| **Manhattan Associates** | "Continuous updates keep the platform current without requiring a traditional upgrade cycle" | A cloud WMS or TMS removes version upgrades as a replacement trigger; it doesn't remove the first migration onto it |
| **Microsoft** (Dynamics 365 implementation guide) | Go-live readiness includes "Create and sign off on a cutover plan" and a data migration plan; migration data is "master data, such as customers, products, and vendors, or open transactions, such as sales orders, purchase orders, stock on hand, and open balances"; AX 2012 upgrades move warehouse mobile users to "the Dynamics 365 Warehouse Management mobile app" | The vendor's own split, master data and open transactions, is the plan; the scanner app on the warehouse floor is part of the cutover |
| **SAP** (February 2020 announcement) | Business Suite 7 core applications get mainstream maintenance "until the end of 2027" and "optional extended maintenance until the end of 2030"; S/4HANA has a "maintenance commitment" until "the end of 2040" | A fixed end of maintenance makes a big bang tempting; the date is when the old system stops being supported, not when the new one must be live everywhere |

Three patterns run through the table:

- **Failures surface as freight, not as errors.** None of the three filings describes a software bug; they describe orders not filled, inventory that couldn't be seen and shipments paced down. The test of a logistics cutover is whether trucks leave full and on time the next morning.
- **The vendor's method splits master data from open transactions.** Microsoft's guide names both, and every cutover below is a plan for the open transactions: loads in flight, inventory on the shelf, open orders and open balances.
- **Maintenance dates drive the calendar.** SAP's 2027 and 2030 dates set when replacements start; they should not set the cutover date for every facility at once.

## Why Replacements Fail

From the filings above and the method in the playbook, the failures fall into a few kinds:

- **Inventory the new system can't see or doesn't trust.** Balances migrated without a count, locations mapped wrong, lots or license plates dropped: the WMS directs a picker to an empty slot, the ERP promises stock it can't find, and the order waits. Lamb Weston's lost visibility of finished goods at distribution centers is this failure at ERP level.
- **Open work dropped between systems.** A load tendered in the old TMS and delivered after cutover belongs to neither unless someone decided which; an ASN acknowledged by the old WMS is unknown to the new one when the truck arrives.
- **Partners not ready.** A carrier still sending 990s to the old system's mailbox, a shipper whose 204 map wasn't certified, a visibility network still connected to the old account: the new system goes live and some of its partners don't.
- **Throughput below the old system's on the first day.** People slower on new screens and scanners, waves that release differently, labels that print slower. Lands' End's "deliberate pacing of shipments" is a planned version; an unplanned one is a backlog.
- **History left behind that someone needs.** Broker transaction records owed for three years (49 CFR 371.3), entry records for five (19 CFR 163.4), claims and detention evidence, carrier payment history: the old system is switched off and the records go with it.

## Choosing a Cutover Strategy

The options and their costs are [Big Bang, Phased or Parallel](/docs/architecture/replacing-systems#big-bang-phased-or-parallel), with the default to phase by cohort and let exactly one system act on any record at a time. Logistics supplies natural cohorts:

| System | Cohort | Why it works | What has to bridge |
| --- | --- | --- | --- |
| **WMS** | One building | A warehouse's inventory, docks and staff are physically separate | Transfers between a migrated and an unmigrated building; one ERP fed by two WMSs |
| **TMS (shipper)** | A ship-from facility, a business unit or a mode | Loads originate somewhere; parcel can move before truckload | One routing guide and carrier base used from both systems |
| **TMS (broker)** | A customer, an office or a mode | A customer's freight and its billing stay in one system | Carriers working loads in both; one carrier pay run fed by both |
| **TMS (carrier)** | A terminal, a fleet or a division | Dispatch, drivers and equipment are assigned by terminal | Drivers relayed across terminals; one settlement run |
| **ERP** | A legal entity or a plant | Books close by entity; MRP plans by plant | Intercompany orders and transfers between migrated and unmigrated entities |
| **EDI** | One trading partner at a time | Each partner has its own maps, IDs and certification | Partners on the new system while the system behind them is still the old one |

My rules for the calendar: never cut over a WMS or TMS in the weeks before a customer's peak (for a retail distributor, the run-up to the holidays; for a produce shipper, its harvest), never cut over an ERP in the days around a period close, and never move a broker's or shipper's TMS during the annual bid when lane rates are being loaded. A big bang is right only when the business is one cohort anyway (a single warehouse, a small brokerage), and then it gets a full rehearsal (a mock cutover with real data, timed) and a written go or no-go decision, the "well-informed go/no-go decision" Microsoft's guide says its go-live readiness assessments exist to support.

## TMS Cutover

The TMS is where in-flight work is most visible, because every load has a carrier, a driver and a customer waiting on it ([The Order-to-Invoice Pipeline](/books/logistics/transportation-management#the-order-to-invoice-pipeline) lists the steps a load can be in):

- **Loads in flight are drained, not moved, by default.** Loads tendered in the old system finish there: their remaining events, POD, invoices and carrier payment stay with the system that holds their rate confirmation. New loads are built in the new system from the cutover moment. A load that must move (a long ocean or intermodal move that outlives the old system) moves whole, with its tenders, charges and documents, and is flagged as migrated.
- **Open tenders expire in the old system.** A tender is an offer with an expiry ([The Tender State Machine](/books/logistics/tendering#the-tender-state-machine)); at cutover, the old system stops sending new tenders, open ones are answered or expire there, and the new system starts the waterfall for loads not yet tendered. Two systems tendering the same load to two carriers is how a broker books two trucks.
- **Rates load with their validity.** Contracts and lane rates load as `rate_agreements` and `lane_rates` with their real validity ranges, and fuel schedules with their index history ([Lane Rate Tables](/books/logistics/rating-and-accessorials#lane-rate-tables)); a lane rate that starts "today" in the new system reprices every load picked up yesterday. Spot quotes don't migrate: they expire in hours.
- **Routing guides move as a version.** The routing guide in force is loaded with its effective date, so tender compliance across the cutover is measured against one guide ([Routing Guides](/books/logistics/procurement-and-routing-guides#routing-guides)).
- **Carriers carry their qualification.** The carrier master migrates with authority, insurance and onboarding status and the date each was last checked, but the new system rechecks before the first tender and resumes monitoring ([Monitoring](/books/logistics/carrier-onboarding#monitoring)); a qualification status copied from a spreadsheet export is a claim, not a check.
- **Money is open items plus accruals.** Unpaid carrier invoices, unbilled delivered loads and accrued purchased transportation for delivered loads not yet invoiced ([Accruals](/books/logistics/freight-audit-and-payment#accruals)) are reconciled to the cent before and after; carrier pay for drained loads runs from the old system until the last of them settles.

## WMS Cutover

A WMS holds the only record of where things physically are, so its cutover is a count:

- **Freeze, then count.** Receiving and shipping stop for the window (or run in a reduced, paper-backed mode), and inventory is either counted wall to wall (every location, every license plate) or migrated from the old system's balances after a cycle count program has proved them accurate. My default is a full count for any building whose inventory accuracy isn't already measured and high; the migrated balances are then the count, not the old system's numbers.
- **Locations first, then license plates, then balances.** Location codes, zones and their attributes (pick face, reserve, hazmat, temperature) load first; license plates (LPNs) with their item, lot, quantity, status and location next; balances are derived from the plates. A plate whose label is already on a pallet keeps its number, or the building is relabeled before it opens.
- **Lots, expiry and holds survive.** A quarantined lot or a recalled lot that arrives in the new system as available stock is the most dangerous record in the migration; holds migrate with their reason and the person who placed them.
- **Open inbound and outbound.** ASNs acknowledged but not received, appointments booked, orders allocated or in waves: each is either finished in the old system before the freeze or loaded into the new one in a defined state, with the dock schedule and the yard agreeing ([Dock Appointments](/books/logistics/yard-and-dock#dock-appointments)).
- **The floor is part of the system.** Scanners, label printers, scales and automation controllers are cut over too; Microsoft's guide tells AX 2012 upgrades that use a warehouse mobile solution to move to the Dynamics 365 Warehouse Management mobile app. A conveyor or sorter integration that wasn't tested at the full rate of the busiest hour fails at that hour.
- **Ramp, don't flip.** Plan the first weeks below normal volume, as Lands' End described doing, with the old building's peak rate as the target and a date for reaching it.

[Warehouse Management Systems](/books/logistics/warehouse-management#how-to-build-it) describes the inventory model (`warehouse_locations`, `warehouse_lpns`, `lots`, `inventory_balances`) this migrates into, and [Cycle Counting](/books/logistics/warehouse-management#cycle-counting) how a building proves its balances.

## ERP Cutover

An ERP cutover moves the commercial and financial records the TMS and WMS hang from:

- **Open orders with their history.** Open purchase orders keep their supplier confirmations and receipts so far; open sales orders keep their allocations and shipments so far. An order half-shipped in the old system is migrated with the open quantity only, linked to the shipped part's history.
- **Period close decides the date.** Cut over at the start of a period, after the old system has closed the last one, so open receivables and payables, inventory value and accruals load as opening balances that tie to the old system's closing trial balance.
- **Inventory value and quantity agree.** The ERP's quantity on hand by item and location ties to the WMS's balances, and its value to the old ERP's valuation; a standard cost change slipped into the migration shows up as a variance nobody can explain.
- **Planning restarts from the migrated state.** MRP runs again on migrated open orders and balances before the first planned order is released ([The MRP Explosion](/books/logistics/production-planning#the-mrp-explosion)), because an MRP run on half-migrated data releases orders for parts already on order.

## Partner Re-Onboarding

Every trading partner and API connection the old system had is a connection the new one needs, and partners have their own calendars. My rule: **inventory partners first, then test each one, then switch each one, on its own date.**

- **The inventory.** Every EDI partner with each transaction set and direction (204, 990, 214, 210, 997 from [The Transportation Sets](/books/logistics/transportation-edi#the-transportation-sets) and, for shippers, the retail sets in the Commerce volume's [EDI](/books/commerce/edi)), every carrier and visibility API account, every portal login, every SFTP drop and every email address partners send documents to.
- **IDs.** Keep the ISA sender ID and qualifier if the new system can use them, because a new ID is a change on every partner's side; if the ID must change, each partner adds it and the date is agreed. Interchange control numbers (ISA13, assigned by the sender) continue from the old system's last value rather than restarting, because a partner's duplicate check sees a restarted sequence as resent files ([Envelopes and Acknowledgments](/books/commerce/edi#envelopes-and-acknowledgments)).
- **Test per partner, per set.** Test interchanges carry `T` in ISA15, each partner certifies each set from its own guide, and 997s come back for each test file ([Partner Onboarding](/books/logistics/transportation-edi#partner-onboarding), [Partner Testing](/books/commerce/edi#partner-testing)). On a platform where a carrier's map is shared across tenants, the map is already certified and only the tenant's connection is new ([The Partner Integration Layer](/books/logistics/logistics-architecture#the-partner-integration-layer)). A partner certified for 204 and 990 but not 214 isn't ready.
- **Endpoints and certificates.** AS2 certificates and URLs, VAN mailboxes and SFTP keys are new on the new system; partners load them before the switch, and the old ones stay valid until the partner confirms the switch.
- **API credentials and authority.** Carrier and visibility API connections are new OAuth clients or keys for the new system, and letters of authority that let a visibility network share a carrier's data name the new account; [Connections and Credentials](/books/logistics/logistics-apis#connections-and-credentials) describes the `partner_connections` record each one needs.

## EDI Cutover and Parallel Runs

The playbook's distinction between parallel comparison and parallel operation is sharpest in EDI ([Big Bang, Phased or Parallel](/docs/architecture/replacing-systems#big-bang-phased-or-parallel)):

- **Inbound, both systems may read.** A partner's 204s and 214s can be copied to the new system in the dark: it runs the receive, parse, map and match steps of its event pipeline ([The Event Pipeline](/books/logistics/logistics-architecture#the-event-pipeline)) and builds the tender or event without answering, and its result is compared to the old system's. The new system sends no 990s and no 997s while dark.
- **Outbound, only one system sends.** Dual-sending 204s tenders the same load twice; dual-sending 210s bills the shipper twice. In a parallel run the new system generates its outbound documents and the comparison job diffs them against what the old system actually sent, field by field, without transmitting.
- **Compare normalized documents.** Element order, control numbers, timestamps and whitespace differ by design; the comparison normalizes them and reports the differences that matter: a stop missing, an appointment in the wrong time zone, a reference qualifier changed, a charge code mapped to a different line. Every difference is explained before that partner switches ([Dark Launch and Shadow Reads](/docs/architecture/replacing-systems#dark-launch-and-shadow-reads)).
- **Switch one partner at a time.** For each partner, on its agreed date: the old system stops sending and answering, the partner (or the VAN) routes to the new endpoint, the first live documents are watched by a person, and the old map stays ready for the rollback window.

## Data Migration

The method is [Crosswalks and ID Mapping](/docs/architecture/replacing-systems#crosswalks-and-id-mapping), [Load With Side Effects Off](/docs/architecture/replacing-systems#load-with-side-effects-off) and [Reconciliation](/docs/architecture/replacing-systems#reconciliation). The logistics specifics:

- **Keep this system's keys; map the old system's IDs.** Parties and facilities already carry `external_refs` keyed by system, so the old TMS's customer and carrier codes become a key there, and an old facility code from the WMS becomes a facility's key. Loads, shipments, orders and documents get rows in an ID map instead, because they have no `external_refs` column and an inbound 214 that still quotes the old load number has to resolve.
- **Open records move; history is archived or moved as history.** Open loads (where not drained), open orders, inventory, open invoices and active rate agreements move as live records. Closed history moves as read-only records with their original dates, or stays in a searchable archive, for at least as long as the longest obligation: three years for a broker's transaction records, five years from entry for customs records ([Keep the Old System as a Read-Only Archive](/docs/architecture/replacing-systems#keep-the-old-system-as-a-read-only-archive)).
- **Side effects off.** A migrated delivered load must not bill the customer again, a migrated tender must not reach the carrier, a migrated inventory balance must not trigger replenishment. Loads write as a migration actor that billing, tendering and notifications ignore.
- **Reconcile counts and sums, independently of the loader.** Open loads by status and owner; delivered-not-billed loads; open receivables and payables by currency to the cent; accrued purchased transportation; active lane rates by agreement; carriers by qualification status; inventory units by item, lot, location and status; open purchase and sales order lines and quantities. Each check compares the old system's own report with the new system's tables, and the cutover approval cites the checks.

## Rollback

A rollback is decided before cutover: who can order one, by when, and what it costs ([Cutover and the Rollback Window](/docs/architecture/replacing-systems#cutover-and-the-rollback-window)). For a cohort:

- **The old system stays intact and paused** for the window: its records for the cohort untouched, its outbound EDI maps and API connections disabled but kept, its scheduled jobs off.
- **The new system records everything it did** in the window: loads built and tendered, documents sent, inventory moved, invoices issued. Rolling back carries those records to the old system, so a rollback after the first day is a migration in reverse, not a switch.
- **The window covers one cycle:** a full carrier pay run and a customer billing run for a TMS, a full receiving-to-shipping cycle at peak rate for a WMS, a period close for an ERP.
- **Partners roll back by partner.** Each partner's switch is reversible on its own, which is the reason to switch them one at a time.

## How to Build It

The playbook's batch and crosswalk tables, specialized for logistics. Parties and facilities keep their `external_refs` as the map for their old codes; everything else maps through `migration_id_maps`:

```sql
CREATE TABLE migration_runs (             -- one load of one entity from one old system
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_party_id  UUID NOT NULL REFERENCES parties (id),  -- whose data is moving
  source_system   TEXT NOT NULL,          -- 'legacy_tms', 'legacy_wms:dc-04', 'legacy_erp'
  cohort          TEXT NOT NULL,          -- 'facility:<id>', 'customer:<id>', 'partner:<id>', 'all'
  entity          TEXT NOT NULL,          -- 'carriers', 'lane_rates', 'open_loads', 'lpns', ...
  kind            TEXT NOT NULL CHECK (kind IN ('mock', 'full', 'delta', 'rerun')),
  input_sha256    BYTEA NOT NULL,         -- the export file as received, archived unchanged
  mapping_version TEXT NOT NULL,          -- transform code and code maps, in version control
  started_by      TEXT NOT NULL,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at     TIMESTAMPTZ,
  created_count   INT,
  updated_count   INT,
  rejected_count  INT                     -- each rejected row is in the run's failure file
);

CREATE TABLE migration_id_maps (          -- the old system's ID for a record, dated
  owner_party_id   UUID NOT NULL REFERENCES parties (id),
  source_system    TEXT NOT NULL,
  entity           TEXT NOT NULL CHECK (entity IN ('load', 'shipment', 'order', 'tender',
                     'document', 'freight_invoice', 'rate_agreement', 'item', 'lot',
                     'handling_unit')),
  source_id        TEXT NOT NULL,         -- as the old system wrote it, leading zeros kept
  target_id        UUID NOT NULL,         -- this system's row
  migration_run_id UUID NOT NULL REFERENCES migration_runs (id),
  linked_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unlinked_at      TIMESTAMPTZ,           -- a wrong link is closed, never edited
  link_reason      TEXT NOT NULL CHECK (link_reason IN ('migration', 'reviewed', 'merge')),
  PRIMARY KEY (owner_party_id, source_system, entity, source_id, linked_at)
);
CREATE UNIQUE INDEX migration_id_maps_open_idx
  ON migration_id_maps (owner_party_id, source_system, entity, source_id)
  WHERE unlinked_at IS NULL;
CREATE INDEX ON migration_id_maps (entity, target_id);

CREATE TABLE migration_reconciliations (  -- the cutover gate, check by check
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_party_id  UUID NOT NULL REFERENCES parties (id),
  cohort          TEXT NOT NULL,
  check_key       TEXT NOT NULL,          -- 'open_loads_by_status', 'open_payables:USD',
                                          -- 'accrued_purchased_transportation', 'lpn_units'
  run_ids         UUID[] NOT NULL,
  expected        NUMERIC NOT NULL,       -- from the old system's own report
  actual          NUMERIC NOT NULL,       -- from this system's tables, not the loader
  passed          BOOLEAN NOT NULL,
  explanation     TEXT,                   -- required to accept a difference
  approved_by     TEXT,
  run_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (passed OR approved_by IS NULL OR explanation IS NOT NULL)
);

CREATE TABLE partner_cutovers (           -- one partner's switch, set by set
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_party_id     UUID NOT NULL REFERENCES parties (id),
  partner_party_id   UUID NOT NULL REFERENCES parties (id),
  channel            TEXT NOT NULL CHECK (channel IN ('edi', 'api', 'portal', 'sftp',
                       'email')),
  transaction_set    TEXT,                -- '204', '990', '214', '210'; null for non-EDI
  direction          TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  old_endpoint       TEXT NOT NULL,       -- mailbox, AS2 URL or account, as configured
  new_endpoint       TEXT NOT NULL,
  isa_id_changes     BOOLEAN NOT NULL DEFAULT FALSE,
  next_control_number BIGINT,             -- continues the old ISA13 sequence
  status             TEXT NOT NULL CHECK (status IN ('planned', 'testing', 'certified',
                       'dark', 'live', 'rolled_back', 'retired')),
  certified_at       TIMESTAMPTZ,
  agreed_switch_at   TIMESTAMPTZ,         -- the date agreed with the partner
  switched_at        TIMESTAMPTZ,
  rollback_until     TIMESTAMPTZ,         -- the old endpoint stays ready until then
  CHECK (status NOT IN ('live', 'dark') OR certified_at IS NOT NULL),
  UNIQUE (owner_party_id, partner_party_id, channel, transaction_set, direction)
);

CREATE TABLE edi_dual_run_diffs (         -- one difference between old and new output
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  partner_cutover_id UUID NOT NULL REFERENCES partner_cutovers (id),
  old_document_id   UUID REFERENCES documents (id),  -- what the old system sent or read
  new_output_ref    TEXT NOT NULL,        -- what the new system produced, never transmitted
  business_key      TEXT NOT NULL,        -- the load, BOL or invoice both describe
  path              TEXT NOT NULL,        -- 'S5[2].G62.date', 'L1[3].charge_code'
  old_value         TEXT,
  new_value         TEXT,
  disposition       TEXT NOT NULL DEFAULT 'open' CHECK (disposition IN ('open', 'fixed',
                      'accepted', 'old_system_wrong')),
  explanation       TEXT,
  found_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON edi_dual_run_diffs (partner_cutover_id) WHERE disposition = 'open';
```

The core tables record what a migration created, live-safe:

```sql fragment
ALTER TABLE documents ADD COLUMN migration_run_id UUID;  -- documents carried from the old system
ALTER TABLE documents ADD CONSTRAINT documents_migration_run_fkey
  FOREIGN KEY (migration_run_id) REFERENCES migration_runs (id) NOT VALID;
ALTER TABLE documents VALIDATE CONSTRAINT documents_migration_run_fkey;

-- parties and facilities keep old codes in external_refs, keyed by the source system:
-- {"legacy_tms": "CARR00412"}; the index lets an inbound message that quotes one resolve.
-- parties_external_refs_idx already exists (Logistics APIs & Standards); facilities gets the same.
CREATE INDEX CONCURRENTLY facilities_external_refs_idx
  ON facilities USING gin (external_refs jsonb_path_ops);
```

Resolving an old load number quoted by a carrier's 214 after cutover:

```sql
SELECT m.target_id AS load_id
FROM migration_id_maps m
WHERE m.owner_party_id = $1
  AND m.source_system = 'legacy_tms'
  AND m.entity = 'load'
  AND m.source_id = $2                    -- the B10 or L11 reference as received
  AND m.unlinked_at IS NULL;
```

Open payables by carrier, old against new, for one check in the gate. `legacy_open_payables(carrier_code, currency, amount)` is loaded from the old system's own aging report:

```sql
SELECT p.id AS carrier_party_id,
       lp.currency,
       lp.amount                                   AS old_system_open,
       COALESCE(SUM(fi.total), 0)                  AS new_system_open,
       COALESCE(SUM(fi.total), 0) - lp.amount      AS difference
FROM legacy_open_payables lp
JOIN parties p ON p.external_refs ->> 'legacy_tms' = lp.carrier_code
LEFT JOIN LATERAL (
  SELECT SUM(l.amount) AS total
  FROM freight_invoices i
  JOIN freight_invoice_lines l ON l.freight_invoice_id = i.id
  WHERE i.side = 'payable' AND i.issuer_party_id = p.id
    AND i.currency = lp.currency AND i.status IN ('received', 'in_audit', 'approved', 'disputed')
  GROUP BY i.id) fi ON TRUE
GROUP BY p.id, lp.currency, lp.amount
HAVING COALESCE(SUM(fi.total), 0) <> lp.amount;
```

The dual-run comparer for outbound documents: parse both, normalize what differs by design, and report each difference at a path a person can read. Go first:

```go tab="Go"
// Segments as parsed: ID and elements, in order. Envelopes are stripped first.
type Segment struct {
	ID       string
	Elements []string
}

type Diff struct {
	Path     string
	Old, New string
}

// ignore lists what differs by design between systems: control numbers and
// creation timestamps.
var ignore = map[string]bool{"ST02": true, "SE02": true, "G6203": true}

// Compare walks both documents by segment ID and occurrence, so an inserted
// segment is one difference, not a shifted cascade.
func Compare(oldDoc, newDoc []Segment) []Diff {
	index := func(doc []Segment) map[string][]string {
		m := map[string][]string{}
		seen := map[string]int{}
		for _, s := range doc {
			seen[s.ID]++
			for i, e := range s.Elements {
				key := fmt.Sprintf("%s[%d].%02d", s.ID, seen[s.ID], i+1)
				m[key] = append(m[key], strings.TrimSpace(e))
			}
		}
		return m
	}
	o, n := index(oldDoc), index(newDoc)
	var diffs []Diff
	for _, key := range unionSorted(o, n) {
		seg := key[:strings.Index(key, "[")]
		if ignore[seg+key[len(key)-2:]] {
			continue
		}
		ov, nv := strings.Join(o[key], "|"), strings.Join(n[key], "|")
		if ov != nv {
			diffs = append(diffs, Diff{Path: key, Old: ov, New: nv})
		}
	}
	return diffs
}
```

```rust tab="Rust"
use std::collections::{BTreeMap, BTreeSet, HashMap};

/// A segment as parsed: ID and elements, in order. Envelopes are stripped first.
pub struct Segment { pub id: String, pub elements: Vec<String> }

#[derive(Debug, PartialEq)]
pub struct Diff { pub path: String, pub old: String, pub new: String }

/// What differs by design between systems: control numbers and creation timestamps.
const IGNORE: &[&str] = &["ST02", "SE02", "G6203"];

fn index(doc: &[Segment]) -> BTreeMap<String, String> {
    let mut seen: HashMap<&str, usize> = HashMap::new();
    let mut m = BTreeMap::new();
    for s in doc {
        let n = seen.entry(s.id.as_str()).or_insert(0);
        *n += 1;
        for (i, e) in s.elements.iter().enumerate() {
            m.insert(format!("{}[{}].{:02}", s.id, n, i + 1), e.trim().to_string());
        }
    }
    m
}

/// Walks both documents by segment ID and occurrence, so an inserted segment
/// is one difference, not a shifted cascade.
pub fn compare(old_doc: &[Segment], new_doc: &[Segment]) -> Vec<Diff> {
    let (o, n) = (index(old_doc), index(new_doc));
    let keys: BTreeSet<&String> = o.keys().chain(n.keys()).collect();
    keys.into_iter()
        .filter(|k| {
            let seg = &k[..k.find('[').unwrap()];
            !IGNORE.contains(&format!("{}{}", seg, &k[k.len() - 2..]).as_str())
        })
        .filter_map(|k| {
            let (ov, nv) = (o.get(k).cloned().unwrap_or_default(), n.get(k).cloned().unwrap_or_default());
            (ov != nv).then(|| Diff { path: k.clone(), old: ov, new: nv })
        })
        .collect()
}
```

Design notes:

- **Mock runs are runs.** `migration_runs.kind = 'mock'` keeps every rehearsal with its counts and timing, so the cutover window is planned from measured load times, not estimates.
- **Two kinds of map, one rule.** Parties and facilities map old codes in `external_refs` because the core model already gives them that column and partners quote those codes for years; transactional records map in `migration_id_maps`, dated and closed rather than edited ([Crosswalks of External IDs](/docs/building-blocks/record-linkage#crosswalks-of-external-ids)). Either way this system's keys never change.
- **The gate is rows.** `migration_reconciliations` keeps expected, actual, the explanation for an accepted difference and the approver; a cohort goes live when its checks pass and the approval cites them.
- **Partners have their own state machine.** `partner_cutovers` can't go dark or live uncertified, keeps the old endpoint until `rollback_until`, and carries the next control number so the ISA13 sequence continues. Once live, the partner's channel is an ordinary `partner_connections` row ([Logistics APIs & Standards](/books/logistics/logistics-apis#how-to-build-it)) and the cutover row stays as its history.
- **Diffs never transmit.** `edi_dual_run_diffs.new_output_ref` points at a document the new system generated and stored, not a `documents` row, because `documents` holds what was exchanged and nothing in a dual run is allowed to reach the outbound gate.
- **The comparer reports paths, not files.** A difference at `S5[2].G62.02` (the second stop's appointment) is something a person can fix in a map; "the files differ" isn't.

## Auditing

- **What came from where.** Every migrated record's old ID, run and export file, with the file archived unchanged and its checksum, for as long as the record is kept.
- **The reconciliation and its approval,** check by check, with accepted differences explained and the approver named, per cohort.
- **Each partner's switch:** certification dates, the agreed and actual switch times, the old and new endpoints, the dual-run differences and how each was resolved, and any rollback.
- **The money across the move.** Open receivables, payables and accruals before and after, by counterparty and currency, tied to both systems' reports.
- **Inventory across the move.** The count or the migrated balances, by item, lot, location and status, with holds and their reasons.
- **The old system's archive,** retrievable by load, BOL, PRO, entry and invoice number for three years for brokered transactions (49 CFR 371.3) and five years from entry for customs records (19 CFR 163.4), with its audit logs exported before access ends.

## What This Means for the System You Build

- **Cut over by cohort:** a building, a customer, a terminal, an entity, a partner; and never before a peak, during a bid or around a close.
- **Drain loads in flight in the old TMS** and start new ones in the new; never let two systems tender the same load.
- **Count inventory before a WMS opens,** migrate locations, plates and holds in order, and plan the ramp.
- **Cut an ERP over at a period start,** with opening balances tied to the old system's close and quantities tied to the WMS.
- **Inventory every partner connection,** keep ISA IDs and control number sequences where possible, certify each set, and switch partners one at a time.
- **Read in the dark, never send twice:** dual-run inbound freely, diff outbound without transmitting.
- **Keep your own keys,** map old IDs in `external_refs` and a dated ID map, and reconcile counts and sums independently of the loader.
- **Write the rollback window down** to cover a full pay run, billing run or close, and keep the old system paused, not deleted, until it closes.
- **Archive history for its longest obligation** and export the old audit logs before you lose access.

## References

**Filings**

- [CONMED: Fourth quarter and full-year 2022 results (8-K exhibit, February 2, 2023)](https://www.sec.gov/Archives/edgar/data/816956/000117494723000151/ex99-1.htm), sales impacted by new warehouse management software and $6.8 million of implementation costs
- [Lamb Weston: Third quarter fiscal 2024 results (8-K exhibit, April 4, 2024)](https://www.sec.gov/Archives/edgar/data/1679273/000167927324000017/lw-20240225x8kxexx9913q24.htm), the ERP transition of order to cash, reduced inventory visibility at distribution centers, about $135 million of net sales and $72 million of net income, and mixed-product loads
- [Lands' End: First quarter fiscal 2026 results (8-K exhibit, June 9, 2026)](https://www.sec.gov/Archives/edgar/data/799288/000119312526262940/le-ex99_1.htm), the new warehouse management system rollout, the 8.5% revenue decline, deliberate pacing, inventory up 14% and Europe unaffected

**Vendors**

- [Manhattan Associates: Manhattan Active Platform](https://www.manh.com/solutions/manhattan-active-platform), continuous updates without a traditional upgrade cycle
- [Microsoft Learn: Prepare your production environment to go live](https://learn.microsoft.com/en-us/dynamics365/guidance/implementation-guide/prepare-to-go-live), cutover and data migration plans, the go-live readiness review and go/no-go decision, and moving AX 2012 warehouse users to the Warehouse Management mobile app
- [Microsoft Learn: Manage configuration and migration data](https://learn.microsoft.com/en-us/dynamics365/guidance/implementation-guide/data-management-configuration-data-migration), master data versus open transactions such as sales orders, purchase orders, stock on hand and open balances
- [SAP News: Maintenance for SAP Business Suite 7 and SAP S/4HANA (February 2020)](https://news.sap.com/2020/02/sap-s4hana-maintenance-2040-clarity-choice-sap-business-suite-7/), mainstream maintenance to the end of 2027, optional extended maintenance to the end of 2030 and S/4HANA to the end of 2040

**Regulations**

- [49 CFR 371.3: Records to be kept by brokers](https://www.law.cornell.edu/cfr/text/49/371.3), the transaction record and its three-year retention
- [19 CFR 163.4: Record retention period](https://www.law.cornell.edu/cfr/text/19/163.4), five years from the date of entry
