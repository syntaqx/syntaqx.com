+++
title = "How Carriers, Brokers & 3PLs Make Money"
nav_title = "Logistics Economics"
description = "Operating ratio, revenue per mile and per hundredweight, gross and net revenue, asset-based and asset-light models, the agent model and contract warehousing."
category = "Logistics & Supply Chain Industry"
order = 2804
part = "The Business"
tags = ["logistics", "unit-economics", "operating-ratio", "freight-brokerage", "contract-logistics", "data-model"]
+++

Logistics companies sell capacity, and how they make money depends on whether they own it. An asset carrier owns tractors, trailers, terminals or track and employs drivers; its revenue is high, its costs are mostly fixed in the short run, and its margin is the few cents per dollar left after the fleet. A broker owns no trucks; it buys capacity load by load and resells it, so its revenue is mostly someone else's cost and its margin is the spread. An agent network sells under one company's authority and shares the spread with independent agents. A contract logistics provider runs warehouses for clients on multi-year contracts, priced on its own labor and space. The same dollar of freight revenue means something different in each, which is why the industry measures them with different numbers.

For a system, the economics decide which numbers must be computable. An LTL carrier lives on revenue per hundredweight and operating ratio by terminal and lane; a truckload carrier on revenue per mile, empty miles and revenue per tractor; a broker on gross margin per load and per rep; an agent network on commission per agent; a warehouse operator on cost per unit handled against the contract's rates. Each is a sum over records the core model already holds, plus costs it doesn't: what the driver was paid, what the fuel cost, what the tractor costs per mile. This chapter covers operating ratio and the unit metrics, gross and net revenue, the asset-based and asset-light models with their filed numbers, the agent model, contract warehousing economics, and the records that make each computable. It extends `freight_charges` and `loads` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model).

The money in a single movement is [How the Money Splits](/books/logistics/logistics-business#how-the-money-splits); the companies themselves are [The Logistics Landscape](/books/logistics/logistics-landscape); the broker's per-load pricing is [Pricing and Margin](/books/logistics/freight-brokerage#pricing-and-margin). Revenue recognition (principal or agent, in-transit revenue, accrued purchased transportation) is Logistics Accounting; warehouse client billing is Contract Logistics & 3PL Billing; driver settlements are Carrier Dispatch & Asset Management.

## How the Companies Do It

As of November 2026, from 2025 annual filings:

| Company | Model | Headline measure in its filing | 2025 figure |
| --- | --- | --- | --- |
| **C.H. Robinson** | Broker and forwarder, principal on most transportation | Adjusted gross profit: "total revenues less the total of purchased transportation and related services" | $2,588.6 million on $16.2 billion of revenue, a margin of 16.8% (15.6% in 2024) |
| **GXO Logistics** | Contract warehousing | Revenue and operating income | $13,178 million of revenue, $245 million of operating income (about 1.9%, my division) |
| **J.B. Hunt** | Asset-light intermodal on railroads' track, plus dedicated and brokerage | Revenue per load | Intermodal: 2,138,191 loads at $2,795 a load |
| **Knight-Swift** | Asset-based truckload, plus LTL, logistics and intermodal | Operating ratio: "operating expenses as a percentage of total revenue, or the inverse of operating margin" | Consolidated 97.1% (96.7% in 2024); Truckload 97.0% (94.8% adjusted); Logistics 96.0%; Intermodal 102.1% |
| **Landstar** | Agents, owner-operators and brokerage carriers | Revenue by capacity type and agent | $4.7 billion; BCOs about 38% of revenue, brokerage carriers about 53% |
| **Old Dominion** | Asset-based LTL | Operating ratio, "calculated by dividing total operating expenses by revenue"; revenue per hundredweight | 75.2%; $33.31 per hundredweight on 1,477-pound average shipments |
| **RXO** | Broker, managed transportation, last mile | Revenue less cost of transportation and services | $1,131 million on $5,742 million (about 19.7%, my division), from about 21.6% in 2024 |
| **Union Pacific** | Class I railroad | Operating ratio | 59.8% |

The patterns:

- **Asset businesses report operating ratio; asset-light ones report the spread.** Old Dominion's 75.2% and Knight-Swift's 97.0% are expense over revenue; C.H. Robinson's 16.8% is what's left after paying carriers. A broker's operating ratio on gross revenue is near 100% by construction and says little, which is why brokers lead with adjusted gross profit.
- **The spread between best and worst is enormous.** Old Dominion keeps about 25 cents of each revenue dollar before interest and tax, Union Pacific about 40, Knight-Swift's truckload segment about 3 on a GAAP basis; Knight-Swift's intermodal segment lost money. Density (more freight through the same fixed network) is most of the difference.
- **Unit metrics follow the mode.** Per hundredweight and per shipment for LTL, per mile and per tractor for truckload, per load for intermodal and brokerage, per car for rail, per unit handled for warehousing.

## Operating Ratio

Operating ratio is operating expenses divided by revenue, so lower is better, and 100% is breakeven before interest and taxes. Old Dominion "calculated by dividing total operating expenses by revenue"; Knight-Swift calls it "the inverse of operating margin." Carriers also publish adjusted ratios that exclude items such as amortization of acquired intangibles and impairments, so two carriers' ratios are comparable only on the same basis. Knight-Swift's 2025 truckload segment was 97.0% on GAAP and 94.8% adjusted, a gap of 2.2 points from what the adjustment removes.

What moves it:

- **Density.** An LTL network's terminals, doors, linehaul schedules and P&D routes cost about the same whether trailers are full or half full; more shipments per stop and per linehaul mile lower the ratio. Old Dominion's 2025 tonnage per day fell 8.8% and its ratio still sat at 75.2%, because its yield per hundredweight rose 3.9%.
- **Utilization and empty miles.** A truckload tractor costs nearly the same per day whether it runs 400 miles or 250; Knight-Swift's truckload tractors averaged 83,650 miles in 2025 with 13.9% empty ([An Asset Carrier Load](/books/logistics/logistics-business#an-asset-carrier-load)).
- **Price versus cost in the cycle.** Contract rates set in a soft market and driver pay, insurance and equipment costs that don't fall with them squeeze the ratio at the bottom of a cycle ([Freight Markets & Cycles](/books/logistics/freight-markets)).
- **Insurance and claims.** Self-insured retentions put large accident costs straight into operating expense: Landstar retains liability for trucking claims "up to $5 million per occurrence" and cargo claims up to $250,000 per claim.

A system computes operating ratio from the general ledger, not from freight records; what freight records add is attribution: the ratio by terminal, lane, customer or fleet, which needs costs allocated to loads.

## Unit Metrics

| Metric | Definition | Mode | Example from filings |
| --- | --- | --- | --- |
| **Revenue per hundredweight** | "total revenue divided by total weight (in pounds) times 100" (Knight-Swift's LTL definition) | LTL | Old Dominion $33.31 |
| **Revenue per shipment** | Revenue over shipments | LTL, parcel | Old Dominion $492.01 |
| **Weight per shipment** | Pounds over shipments | LTL | Old Dominion 1,477 pounds |
| **Revenue per tractor** | Revenue over average tractors | Truckload | Knight-Swift truckload $199,897 |
| **Miles per tractor** | Total miles over average tractors | Truckload | Knight-Swift 83,650 |
| **Empty mile percentage** | Unloaded miles over total miles | Truckload | Knight-Swift 13.9% |
| **Revenue per load** | Revenue over loads | Intermodal, brokerage, truckload | J.B. Hunt intermodal $2,795 |
| **Gross margin per load** | Revenue less purchased transportation, per load | Brokerage | Not disclosed per load by the public brokers |
| **Operating ratio** | Operating expenses over revenue | Asset carriers, railroads | Old Dominion 75.2%, Union Pacific 59.8% |

Each metric has a denominator that the records must define the same way every time: which revenue (with or without fuel surcharge), which miles (from which mileage source, loaded and empty), which weight (as billed or as reweighed), which shipments (counting a rebill once). The definitions are data with versions, because a metric whose definition changed in March can't be trended across March without knowing it.

## Gross and Net Revenue

A broker or forwarder that is the principal, controlling the service and carrying the carrier's contract, books the customer's full charge as revenue and the carrier's cost as purchased transportation; one that is an agent books only its fee. C.H. Robinson records most transportation "at the gross amount we charge our customers" and its customs brokerage, managed solutions, freight forwarding and sourcing managed procurement at the net amount; RXO recognizes net revenue "when we do not control the specific services"; Uber Freight presents gross "in most markets." The same economic activity can therefore show very different revenue.

The comparable number is the spread, under whichever name: adjusted gross profit at C.H. Robinson, revenue less cost of transportation at RXO, net revenue elsewhere. In C.H. Robinson's North American Surface Transportation segment it was $1,706.3 million on $11,562.7 million of revenue in 2025 (about 14.8%, my division); in Global Forwarding $741.9 million on $3,090.0 million (about 24.0%). The two percentages aren't comparable as margins: forwarding does more of the work (consolidation, documentation, customs), and some of its transactions are recorded net, which shrinks the denominator.

The accounting judgment (principal or agent, and when revenue is recognized over a transit) is [ASC 606 and IFRS 15 in Five Steps](/docs/money/accounting#asc-606-and-ifrs-15-in-five-steps) and Logistics Accounting. The system's job is simpler: keep both sides of every load as lines, so the spread is a sum and the gross figure is a presentation choice made later.

## Asset-Based and Asset-Light

**Asset-based** carriers own the capacity. Their costs per load are mostly not on any invoice: driver wages and benefits, fuel bought at the pump, tractor and trailer depreciation or lease, maintenance, insurance, tolls, terminal costs. To know what a load earned, they allocate those costs to it, usually at standard rates per mile, hour or stop, trued up to actuals at month end. In a tight market they earn more on every truck they own; in a soft one their fleet is a fixed cost and they cut it slowly.

**Asset-light** companies buy capacity. Their cost per load is on the carrier's invoice, so contribution is revenue less purchased transportation less the people and technology that sell and cover it. They scale up and down with the market because their capacity is variable, and their margin is squeezed whenever buy rates rise faster than contracted sell rates (RXO's 2025 experience).

Most large companies are both. Knight-Swift reports truckload, LTL, logistics (brokerage) and intermodal segments with separate ratios; J.B. Hunt's intermodal business owns 124,838 pieces of trailing equipment, mostly 53-foot containers, and buys rail linehaul from BNSF and Norfolk Southern; Landstar uses owner-operators' trucks and brokerage carriers, not its own. The data model has to support a load hauled on owned equipment, a load bought from a carrier and a load moved by a leased owner-operator in the same company, with costs attributed differently for each.

## The Agent Model

Landstar's filing is the clearest public description of an agent network. Independent commission sales agents (about 960 of them) find customers and capacity; Landstar's operating subsidiaries, "and not the Company's agents, contract directly with customers," and generally carry the credit risk and the liability for loss or damage. Capacity comes from BCO Independent Contractors (owner-operators leased to Landstar, 8,514 trucks at December 27, 2025, about 38% of revenue), Truck Brokerage Carriers (a database of over 62,000 approved, about 53%), railroads (about 2%) and air and ocean carriers (about 5%). The 457 agents producing $1 million or more each accounted for 95% of revenue.

The money per load splits three ways. The owner-operator is paid a percentage of the load's revenue ("62% to 70%" with a tractor only, 73% to 77% with a trailer too), under the federal leasing rule's requirements ([Owner-Operators and Leases](/books/logistics/truckload#owner-operators-and-leases)); a brokerage carrier is paid its negotiated rate. The agent is paid a contractually agreed percentage of one of three bases: revenue; "revenue less the cost of purchased transportation"; or revenue less a retained percentage and purchased transportation, which the filing calls "retention contracts." Landstar keeps the rest.

For a system, each agent's contract is data (which basis, which percentage, which customers it owns), the commission is computed per load from the load's lines when the load is final, and corrections after the fact (a rebill, a claim, a short pay) re-run it and post the difference.

## Contract Warehousing

A contract logistics provider runs a warehouse or distribution network for a client under a multi-year contract. GXO's 2025 filing describes the pricing shapes: "Most of our customer contracts contain both fixed and variable components"; "Under fixed-price contracts, the Company agrees to perform the specified work for a pre-determined price"; "Cost-plus contracts provide for the payment of allowable costs incurred" plus a margin; some contracts use "cost reimbursement based on the costs incurred" or "time and materials pricing is based on the hours of services provided." Revenue "is recognized over the period in which services are provided," and contracts range "from a few months to a few years." Its top five customers were about 20% of revenue.

The economics follow the structure:

- **Cost-plus (open book).** The client sees the costs and pays them plus a fee or markup; the provider's risk is low and its margin thin, and the records must show allowable costs by category so the client can audit them.
- **Fixed and variable (transactional).** A fixed fee for the facility and management plus rates per unit received, stored, picked and shipped; the provider earns more when it beats its own productivity assumptions and loses when volume falls below the plan the fixed fee assumed.
- **Gainshare.** Savings against a baseline are split, which needs an agreed baseline and measured productivity.

Margins are thin at scale: GXO's operating income was about 1.9% of revenue in 2025 (my division of $245 million by $13,178 million). Start-up costs come before the revenue ("The timing and magnitude of our new contract start-ups can vary"), so a new contract loses money in its first months. Contract Logistics & 3PL Billing covers how the rates become invoices.

## How to Build It

The deltas add standard cost rates and the cost allocations that asset operators attach to loads, agent commission terms and commissions, and metric definitions:

```sql
CREATE TABLE standard_cost_rates (          -- what a mile, hour or stop costs the fleet, versioned
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_party_id  UUID NOT NULL REFERENCES parties (id),  -- the carrier
  component       TEXT NOT NULL CHECK (component IN ('driver_pay', 'fuel', 'tractor',
                    'trailer', 'maintenance', 'insurance', 'tolls', 'terminal', 'overhead')),
  basis           TEXT NOT NULL CHECK (basis IN ('per_mile', 'per_loaded_mile', 'per_hour',
                    'per_stop', 'per_day', 'per_load')),
  rate            NUMERIC(14, 4) NOT NULL,  -- minor units per basis unit
  currency        CHAR(3) NOT NULL,
  applies_to      JSONB NOT NULL DEFAULT '{}',  -- {"fleet": "regional", "equipment": "53_reefer"}
  valid_during    TSTZRANGE NOT NULL,
  source          TEXT NOT NULL CHECK (source IN ('budget', 'trailing_actuals', 'manual'))
);

CREATE TABLE load_cost_allocations (        -- costs that aren't on any invoice to the operator
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  load_id         UUID NOT NULL REFERENCES loads (id),
  component       TEXT NOT NULL,          -- a standard_cost_rates component
  quantity        NUMERIC(14, 3) NOT NULL,  -- miles, hours, stops
  rate            NUMERIC(14, 4) NOT NULL,
  amount          BIGINT NOT NULL,        -- minor units, rounded once
  currency        CHAR(3) NOT NULL,
  method          TEXT NOT NULL CHECK (method IN ('standard', 'actual', 'true_up')),
  standard_rate_id UUID REFERENCES standard_cost_rates (id),
  period          DATE NOT NULL,          -- the accounting month it belongs to
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON load_cost_allocations (load_id);

CREATE TABLE agent_commission_terms (       -- one agent's contract, versioned
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  principal_party_id UUID NOT NULL REFERENCES parties (id),  -- the company whose authority is used
  agent_party_id   UUID NOT NULL REFERENCES parties (id),
  basis            TEXT NOT NULL CHECK (basis IN ('revenue', 'revenue_less_purchased',
                     'retention')),
  commission_bp    INT NOT NULL CHECK (commission_bp BETWEEN 0 AND 10000),
  retained_bp      INT CHECK (retained_bp BETWEEN 0 AND 10000),  -- the principal's retention
  valid_during     TSTZRANGE NOT NULL,
  document_id      UUID REFERENCES documents (id),
  CHECK ((basis = 'retention') = (retained_bp IS NOT NULL)),
  EXCLUDE USING gist (principal_party_id WITH =, agent_party_id WITH =, valid_during WITH &&)
);

ALTER TABLE loads
  ADD COLUMN agent_party_id UUID REFERENCES parties (id);  -- the agent credited with the load

ALTER TABLE freight_charges
  ADD COLUMN agent_commission_terms_id UUID REFERENCES agent_commission_terms (id);
  -- payable lines of kind 'other' with code 'agent_commission', computed from the terms

CREATE TABLE metric_definitions (           -- what each reported number means, versioned
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  code            TEXT NOT NULL,          -- 'revenue_per_cwt', 'empty_mile_pct', 'gross_margin_per_load'
  version         INT NOT NULL,
  definition      TEXT NOT NULL,          -- in words, as published to users
  numerator       TEXT NOT NULL,          -- e.g. 'receivable charges excluding fuel_surcharge'
  denominator     TEXT NOT NULL,          -- e.g. 'billed weight in pounds / 100'
  valid_during    TSTZRANGE NOT NULL,
  UNIQUE (code, version)
);
```

Contribution per load combines invoiced lines and allocated costs; for a brokered load the second set is empty and contribution is the margin:

```sql
CREATE VIEW load_contribution AS
SELECT l.id AS load_id, l.owner_party_id, m.currency,
       m.revenue,
       m.purchased_transportation,
       COALESCE(a.allocated, 0) AS allocated_cost,
       m.revenue - COALESCE(m.purchased_transportation, 0) - COALESCE(a.allocated, 0)
         AS contribution
FROM loads l
JOIN load_margins m ON m.load_id = l.id
LEFT JOIN (
  SELECT load_id, currency, SUM(amount) AS allocated
  FROM load_cost_allocations
  GROUP BY load_id, currency) a ON a.load_id = l.id AND a.currency = m.currency;
```

The agent commission, computed from the load's final lines and the terms in force on the pickup date:

```go tab="Go"
// Commission returns the agent's commission in minor units. Purchased transportation
// excludes the commission line itself.
func Commission(t Terms, revenue, purchased int64) (int64, error) {
	var base int64
	switch t.Basis {
	case "revenue":
		base = revenue
	case "revenue_less_purchased":
		base = revenue - purchased
	case "retention":
		retained := mulBP(revenue, t.RetainedBP) // the principal's share comes off the top
		base = revenue - retained - purchased
	default:
		return 0, fmt.Errorf("unknown commission basis %q", t.Basis)
	}
	if base < 0 {
		base = 0 // a load bought above its sell rate earns no commission
	}
	return mulBP(base, t.CommissionBP), nil
}

// mulBP multiplies by basis points with half-even rounding, once.
func mulBP(amount int64, bp int) int64 {
	n := amount * int64(bp)
	q, r := n/10000, n%10000
	if r*2 > 10000 || (r*2 == 10000 && q%2 != 0) {
		q++
	}
	return q
}
```

```rust tab="Rust"
pub fn commission(t: &Terms, revenue: i64, purchased: i64) -> i64 {
    let base = match t.basis {
        Basis::Revenue => revenue,
        Basis::RevenueLessPurchased => revenue - purchased,
        Basis::Retention { retained_bp } => revenue - mul_bp(revenue, retained_bp) - purchased,
    }
    .max(0); // a load bought above its sell rate earns no commission
    mul_bp(base, t.commission_bp)
}

/// Multiply by basis points with half-even rounding, once (non-negative amounts).
fn mul_bp(amount: i64, bp: i32) -> i64 {
    let n = amount * i64::from(bp);
    let (q, r) = (n / 10_000, n % 10_000);
    if r * 2 > 10_000 || (r * 2 == 10_000 && q % 2 != 0) { q + 1 } else { q }
}
```

Design notes:

- **Allocations are not charges.** A driver's pay or a tractor's depreciation is a cost, not a line anyone bills or pays on the load, so it lives beside `freight_charges`, not in it, and margin stays a sum over billable lines ([How the Money Splits](/books/logistics/logistics-business#how-the-money-splits)).
- **Standard first, then true-up.** Loads carry standard costs when they close; month-end actuals post `true_up` rows against the same loads, so a lane's contribution in a closed month never changes silently ([Closed Periods Stay Closed](/docs/money/accounting#closed-periods-stay-closed)).
- **Commissions re-run on changes.** A rebill, short pay or claim on a load changes its lines; the commission recomputes and the difference posts as a new line in the current period.
- **Metrics name their definition version.** Every dashboard figure carries the definition it used, and a change to a definition is a new version with a start date ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).
- **Fuel in or out, always stated.** Revenue per mile with fuel surcharge and without are different metrics; a definition says which.

## What This Means for the System You Build

- **Keep both sides of every load as lines,** so gross revenue, net revenue and margin are presentations of the same data.
- **Attach allocated costs to loads** for owned capacity, at versioned standard rates trued up to actuals.
- **Model agent contracts as versioned terms** and compute commissions from final lines.
- **Define every metric once, with its denominator,** and version the definition.
- **Report the measure the business runs on:** operating ratio by terminal and lane for asset carriers, margin per load and rep for brokers, cost per unit against contract rates for warehouses.

## References

**Filings**

- [C.H. Robinson Worldwide: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1043277/000104327726000009/chrw-20251231.htm), adjusted gross profit and margin, segment revenue and AGP, and gross and net recognition
- [GXO Logistics: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1852244/000185224426000007/gxo-20251231.htm), revenue, operating income, contract structures, recognition over time, contract length, start-ups and customer concentration
- [J.B. Hunt Transport Services: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/728535/000143774926005294/jbht20251231_10k.htm), intermodal loads, revenue per load, trailing equipment and rail partners
- [Knight-Swift Transportation: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1492691/000149269126000016/knx-20251231.htm), the operating ratio definition and segment ratios, revenue per hundredweight, and truckload tractor metrics
- [Landstar System: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/853816/000119312526064756/d66072d10k.htm), agents, Million Dollar Agents, capacity mix, BCO pay, commission bases, credit risk and self-insured retentions
- [Old Dominion Freight Line: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/878927/000119312526067161/odfl-20251231.htm), operating ratio, revenue per hundredweight and shipment, weight per shipment and tonnage
- [RXO: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1929561/000192956126000013/rxo-20251231.htm), revenue, cost of transportation and services, and net recognition
- [Uber Technologies: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1543151/000154315126000015/uber-20251231.htm), Freight's gross presentation
- [Union Pacific: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/100885/000010088526000037/unp-20251231.htm), operating ratio
