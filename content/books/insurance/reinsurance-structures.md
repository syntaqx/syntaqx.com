+++
title = "Reinsurance Structures"
description = "Treaty and facultative, quota share, surplus, per risk and cat excess of loss, layers, reinstatements, ceding commissions, and a loss worked through a program."
category = "Insurance Industry"
order = 2740
part = "Reserving, Catastrophe and Reinsurance"
tags = ["insurance", "reinsurance", "excess-of-loss", "quota-share", "catastrophe", "property-and-casualty"]
+++

Reinsurance is insurance for insurers. A primary insurer that writes 200,000 Florida homes can't hold enough capital to pay a 1-in-100-year hurricane on its own, and a regional carrier that writes a $20 million warehouse can't let one fire take a year's profit; so each cedes part of its risk to reinsurers in exchange for part of its premium. The contracts are few and large: a typical property insurer has a handful of treaties renewed once a year, each a negotiated document with its own definitions of what a loss is, what counts toward the retention, what the reinsurer pays and when the cover restores after a loss. The arithmetic is simple when you know the terms and the order they apply in, and very expensive to get wrong.

This chapter covers the shapes: treaty and facultative, the proportional forms (quota share and surplus share) and the non-proportional forms (per risk and catastrophe excess of loss, aggregate covers), layers and rates on line, reinstatements, ceding commissions and the order in which covers inure to each other, with one insurer's program worked from a single fire and a hurricane through every layer. How cessions are calculated and billed, recoverables collected and credit for reinsurance taken is [Reinsurance Operations](/books/insurance/reinsurance-operations); cat bonds, sidecars and state funds are [Cat Bonds, ILS & State Cat Funds](/books/insurance/alternative-capital).

## How the Platforms Do It

Public filings show the structures in use, as of November 2026:

| Company | Role | What the filing shows |
| --- | --- | --- |
| **Universal Insurance Holdings** (Florida homeowners) | Cedent | 2026-2027 program effective June 1, 2026: first event retention of $45 million, an all-states first event tower to $2.623 billion, the mandatory Florida Hurricane Catastrophe Fund layer at the 90% election (about $1.390 billion for its main insurer), a captive layer of 100% of $66 million in excess of $45 million, a specific second event layer and a third and fourth event layer, and reinstatement premium protection on $1.098 billion of non-FHCF first event coverage |
| **HCI Group** (Florida homeowners) | Cedent | Three towers for four insurers, June 1, 2026 to May 31, 2027: Tower 1 retention $10.0 million and up to $1.06 billion for a single Florida event; FHCF at the 45% election; full reinstatement premium protection on excess of loss treaties with paid reinstatements; about $381.2 million of net premium ceded to third parties |
| **NFIP** (FEMA) | Cedent | Annual traditional reinsurance (2024: $619.5 million of risk transferred to 18 reinsurers for $121.1 million) plus multi-year cat bonds |
| **Everest Group** | Reinsurer and cedent | About 72% of $17.7 billion of 2025 gross written premium from reinsurance; bought an adverse development cover on its own reserves ([Loss Reserving & Development](/books/insurance/loss-reserving)) |
| **RenaissanceRe** | Reinsurer | $11.74 billion of 2025 gross premiums written, $4.94 billion property and $6.80 billion casualty and specialty; three brokers (Aon 34.5%, Marsh McLennan 33.8%, Gallagher 13.0%) placed 81.3% |

The broker concentration matters to the system: most treaty business is placed through a few reinsurance brokers who prepare the submission, run the models, circulate the terms and keep the signed lines, so the cedent's records have to match the broker's placement slip ([Reinsurance Operations](/books/insurance/reinsurance-operations)).

## Treaty and Facultative

- **Treaty** reinsurance covers a defined class of business (all Florida homeowners, all commercial property in a state, a whole book) for a period, usually a year. Every policy in the class is ceded automatically on the treaty's terms; the reinsurer doesn't see individual risks.
- **Facultative** reinsurance (fac) covers one risk, negotiated individually: the reinsurer reviews the submission for that warehouse and accepts or declines. Fac fills the gaps treaties leave, usually large or unusual risks above treaty capacity or excluded by the treaty.

A contract has a **period** and a basis that decides which losses belong to it. **Risks attaching** covers losses on policies written or renewed during the treaty period, wherever the loss falls in time; **losses occurring** covers losses that happen during the period, whatever policy they fall under. The difference decides which contract a claim cedes to, so it is a contract attribute the system reads, not a convention.

## Proportional Reinsurance

In proportional (pro rata) reinsurance the reinsurer takes a share of premium and the same share of losses, and pays the cedent a **ceding commission** on its premium share for the acquisition and administrative costs the cedent bore.

**Quota share.** A fixed percentage of every policy in the class. A 30% quota share cedes 30% of each policy's premium and 30% of each loss. It provides capital relief (the ceded unearned premium and reserves reduce the insurer's net leverage) and spreads results, but cedes the good risks with the bad. RenRe's filing describes one of its vehicles, Fontana, as assuming "a whole account quota share of our global casualty and specialty book."

**Surplus share.** A percentage that varies by risk, set by the risk's size relative to the cedent's retention, called a **line**. A worked example, mine: retention (one line) $500,000; a nine-line surplus treaty, so capacity $4,500,000 above the retention.

| Insured value | Retained | Ceded to surplus | Cession share | Left over |
| --- | --- | --- | --- | --- |
| $400,000 | $400,000 | $0 | 0% | |
| $2,000,000 | $500,000 | $1,500,000 | 75.00% | |
| $6,000,000 | $500,000 | $4,500,000 | 75.00% | $1,000,000 (16.67%) needs facultative |

The share applies to premium and to every loss on that risk: an $800,000 fire on the $2,000,000 building cedes 75%, $600,000. On the $6,000,000 building the treaty's share is 4.5 / 6 = 75% and the cedent keeps 0.5 / 6 = 8.33%, so 16.67% must be placed facultatively or the cedent keeps it net. Surplus treaties suit commercial property, where values range widely; personal lines mostly use quota shares.

### Ceding Commission

The commission is a percentage of ceded premium. A **flat** commission is fixed. A **sliding scale** commission moves inversely with the ceded loss ratio between a minimum and a maximum; a worked scale, mine: provisional 32% at a 60% loss ratio, plus 0.5 point for each point the loss ratio falls below 60% (to a maximum of 37% at 50%), minus 0.5 point for each point above (to a minimum of 27% at 70%). The commission is paid provisionally and adjusted when the loss ratio is known, sometimes years later; a **profit commission** shares the reinsurer's margin back instead. Ceding commission is accounted against the cedent's acquisition expense, and its calculation reads the same ceded premium and ceded losses as the cessions ([Reinsurance Operations](/books/insurance/reinsurance-operations)).

## Excess of Loss

In non-proportional (excess of loss, XoL) reinsurance the reinsurer pays losses above a retention (the **attachment**) up to a **limit**, written "$100 million in excess of $50 million" or "$100M xs $50M." Premium is not a share of the cedent's premium; it is a price for the layer, quoted as a **rate on line** (ROL: premium divided by limit) or as a rate on the subject premium.

- **Per risk XoL** responds to a loss on one risk (one building, one policy) above the retention. It protects against large single losses.
- **Catastrophe XoL** responds to the sum of losses from one **loss occurrence** (an event, as the contract defines it, often by peril and a number of hours) across all risks. It protects against accumulation.
- **Aggregate XoL** (aggregate stop loss) responds when the total of losses over the period, or of losses each above a franchise, passes an aggregate retention. It protects against frequency: a year of many medium storms each under the cat retention.
- **Per policy and clash covers** in casualty respond to one policy's or several policies' losses from one occurrence.

A program **layers** XoL: separate contracts stacked one above the other, each with its own reinsurers, price and terms. Lower layers are hit more often and cost more per dollar of limit; higher layers are rarely hit and cost less, which is why rates on line fall as the layer rises. The modeled expected loss of each layer comes from the event loss table ([Catastrophe Models & Their Regulators](/books/insurance/catastrophe-models)); the ROL over expected loss is the multiple the market charges.

### Reinstatements

A cat layer's limit is used up by a loss. **Reinstatement** restores it for the rest of the period so the next event is covered, usually for an additional premium: "one reinstatement at 100%" means one restoration, at 100% of the original premium, **pro rata as to amount** (in proportion to the limit used) and sometimes also **pro rata as to time** (in proportion to the time left). A layer with one reinstatement provides twice its limit in the period at most. **Reinstatement premium protection** (RPP), which both Universal and HCI disclose buying, is a separate cover that pays the reinstatement premium the cedent would owe, so a first event doesn't cost new premium to keep the second event covered.

### Inuring Order

When a cedent has several covers, the contracts say which **inures to the benefit** of which: whether a recovery under one reduces the loss subject to another. A common order for a property program, and the one used below: the quota share applies first; per risk XoL applies to the net retained after the quota share; the cat XoL applies to the net after both. Get the order wrong and every downstream recovery is wrong.

## A Loss Through a Program

A worked program, mine, for a homeowners insurer with $400 million of gross written premium:

| Cover | Terms | Price |
| --- | --- | --- |
| Quota share | 30% of all policies; ceding commission 32% provisional, sliding 27% to 37% | 30% of premium: $120 million ceded, $38.4 million commission |
| Per risk XoL | $1.5 million xs $0.5 million per risk, on the net after the quota share | |
| Cat XoL layer 1 | $50 million xs $50 million, one reinstatement at 100% pro rata as to amount | $15 million (ROL 30%) |
| Cat XoL layer 2 | $100 million xs $100 million, one reinstatement at 100% | $18 million (ROL 18%) |
| Cat XoL layer 3 | $150 million xs $200 million, one reinstatement at 100% | $15 million (ROL 10%) |

![A reinsurance tower: the insurer's $50 million retention at the bottom, three catastrophe excess of loss layers stacked above it to $350 million, a 30% quota share applied before the tower, and a $210 million net event loss marked against the stack.](/diagrams/ins-reinsurance-tower.svg "The worked program as a tower. The hurricane's $300 million gross loss becomes $210 million after the quota share, exhausts the first two layers and uses $10 million of the third.")

**A single fire.** A $2.4 million fire destroys one high-value home.

1. Quota share: 30% of $2.4 million, **$720,000**, ceded; net $1,680,000.
2. Per risk XoL: the net $1,680,000 exceeds the $500,000 retention by $1,180,000, within the $1.5 million limit; **$1,180,000** recovered. Net retained: **$500,000**.
3. Cat XoL: one risk, no catastrophe occurrence; nothing.

The insurer pays $2.4 million and recovers $1.9 million from two contracts with different reinsurers, at different times: the quota share through the quarterly account, the per risk as a loss billing once paid.

**A hurricane.** Gross losses of $300 million from one occurrence, no single home above $500,000 after the quota share (so the per risk treaty is not involved).

1. Quota share: 30%, **$90 million** ceded; net **$210 million**.
2. Cat XoL, on the $210 million net:

| Layer | Attachment and limit | Loss to the layer | Remaining limit |
| --- | --- | --- | --- |
| Retention | first $50 million | $50 million retained | |
| Layer 1 | $50M xs $50M | $50 million (exhausted) | $0, reinstatable |
| Layer 2 | $100M xs $100M | $100 million (exhausted) | $0, reinstatable |
| Layer 3 | $150M xs $200M | $10 million | $140 million |
| Above $350 million | | none | |

Cat recoveries are $160 million; the insurer's net loss is $210 million − $160 million = **$50 million**, its retention.

3. Reinstatement premiums, one reinstatement at 100% pro rata as to amount:

| Layer | Original premium | Limit used | Reinstatement premium |
| --- | --- | --- | --- |
| Layer 1 | $15 million | 50 / 50 | $15.0 million |
| Layer 2 | $18 million | 100 / 100 | $18.0 million |
| Layer 3 | $15 million | 10 / 150 | $1.0 million |
| **Total** | | | **$34.0 million** |

Without reinstatement premium protection the insurer owes $34 million to keep the tower in place for the rest of the season, at the moment its cash is going to claimants; that is why Florida cedents buy RPP. A reinstatement pro rata as to time would also scale each amount by the share of the period left.

4. The quota share's sliding commission. Suppose the quota share's loss ratio for the year comes in at 65% after the storm. The commission slides to 32% − 0.5 × 5 = **29.5%**; on $120 million of ceded premium the insurer returns 2.5% × $120 million = **$3.0 million** of the commission already received.

The whole event, gross to net: $300 million gross, $90 million to the quota share reinsurers, $160 million to the cat reinsurers, $50 million retained, plus $34 million of reinstatement premium and $3.0 million of commission returned. Every one of those numbers is a calculation over the claims history and the contracts, and every one must be reproducible when the reinsurers audit it.

The core of an excess of loss layer and its pro rata reinstatement premium:

```go tab="Go"
// LayerLoss is the part of loss x that falls in a layer of `limit`
// excess of `attach`.
func LayerLoss(x, attach, limit int64) int64 {
	if x <= attach {
		return 0
	}
	return min(x-attach, limit)
}

// ReinstatementPremium is pro rata as to amount: premium × used / limit,
// times the reinstatement rate in basis points (10000 = 100%).
func ReinstatementPremium(premium, used, limit, rateBP int64) int64 {
	return premium * used / limit * rateBP / 10000
}
```

```rust tab="Rust"
/// The part of loss `x` that falls in a layer of `limit` excess of `attach`.
pub fn layer_loss(x: i64, attach: i64, limit: i64) -> i64 {
    if x <= attach { 0 } else { (x - attach).min(limit) }
}

/// Pro rata as to amount: premium × used / limit, times the reinstatement
/// rate in basis points (10_000 = 100%).
pub fn reinstatement_premium(premium: i64, used: i64, limit: i64, rate_bp: i64) -> i64 {
    premium * used / limit * rate_bp / 10_000
}
```

Amounts are integer minor units ([Money & Amounts](/docs/money/amounts#integer-minor-units)); multiplying before dividing would overflow sooner on large towers in cents, so a production version uses 128-bit intermediates or decimal and rounds once, at the contract's stated precision.

## A Florida Tower

The Universal program shows how a real Florida tower combines the pieces. The state's Hurricane Catastrophe Fund is mandatory for residential property insurers ([Cat Bonds, ILS & State Cat Funds](/books/insurance/alternative-capital)), so private reinsurance is bought below it, alongside it and above it:

- **Retention:** $45 million for the first event, all states.
- **Below the FHCF:** a captive layer (100% of $66 million xs $45 million), private layers, and specific second, third and fourth event covers with their own retentions ($86 million xs $25 million for the third and fourth events, a $20 million retention reduction).
- **The FHCF layer:** reimbursement at the 90% election, about $1.390 billion for the main insurer.
- **Above and around:** private layers to the first event exhaustion of $2.623 billion, with a second event exhaustion point of $1.209 billion if a first event fully exhausts the tower.
- **Protection of the protection:** full reinstatement on $1.098 billion of non-FHCF first event coverage, and RPP or a specific second event contract for layers between the retention and the FHCF attachment.
- **Forward cover:** $352 million of capacity already secured for 2027-2028, $277 million of it below the FHCF.

The design question for each layer is the same as in the worked program: the probability it is hit (from the model's OEP curve), the price, and what happens to the second event. The system question is that every layer is a separate contract, many with several reinsurers each on different shares, and the FHCF's retention and coverage are computed by statute, not negotiated.

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model): `reinsurance_contracts` and `cessions` were named there. This chapter defines `reinsurance_contracts`, `reinsurance_layers` (a contract's layers, or its single share for proportional covers), `reinsurance_participations` (each reinsurer's signed line) and `reinsurance_inurings` (the order). `cessions` and statements are defined in [Reinsurance Operations](/books/insurance/reinsurance-operations); `ils_instruments` in [Cat Bonds, ILS & State Cat Funds](/books/insurance/alternative-capital) references these contracts.

```sql
CREATE TABLE reinsurance_contracts (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  insurer_id         UUID NOT NULL REFERENCES insurers (id),  -- the cedent
  reference          TEXT NOT NULL UNIQUE,  -- broker placement or UMR reference
  kind               TEXT NOT NULL CHECK (kind IN ('treaty', 'facultative')),
  form               TEXT NOT NULL CHECK (form IN ('quota_share', 'surplus_share',
                       'per_risk_xol', 'cat_xol', 'aggregate_xol', 'per_policy_xol',
                       'adverse_development', 'loss_portfolio_transfer',
                       'state_fund_reimbursement')),
  basis              TEXT NOT NULL CHECK (basis IN ('risks_attaching',
                       'losses_occurring', 'accident_years')),
  period             DATERANGE NOT NULL,    -- [2026-06-01, 2027-06-01)
  subject            JSONB NOT NULL,        -- lines, states, programs, policy_ids
  currency           TEXT NOT NULL DEFAULT 'USD',
  occurrence_clause  JSONB,                 -- {"wind": {"hours": ...}, ...}
  ceding_commission  JSONB,                 -- flat or {"provisional":..,"slide":[..]}
  premium_basis      TEXT CHECK (premium_basis IN ('share_of_premium', 'rate_on_line',
                       'rate_on_subject_premium', 'deposit_and_adjust')),
  broker_party_id    UUID REFERENCES parties (id),
  status             TEXT NOT NULL CHECK (status IN ('quoted', 'bound', 'in_force',
                       'expired', 'commuted'))
);

CREATE TABLE reinsurance_layers (          -- one row for a QS; one per layer for XoL
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  contract_id        UUID NOT NULL REFERENCES reinsurance_contracts (id),
  seq                INT NOT NULL,
  cession_share_bp   INT,                   -- quota share: 3000 = 30%
  line_size          BIGINT,                -- surplus: one line (the retention)
  lines              INT,                   -- surplus: number of lines of capacity
  attachment         BIGINT,                -- XoL retention, minor units
  limit_amount       BIGINT,                -- XoL limit per occurrence or risk
  aggregate_limit    BIGINT,                -- annual cap across occurrences
  franchise          BIGINT,                -- aggregate covers: losses counted above
  co_participation_bp INT NOT NULL DEFAULT 0,  -- cedent's share of the layer
  reinstatements     INT,                   -- null: unlimited; 0: none
  reinstatement_rate_bp INT,                -- 10000 = 100%
  reinstatement_basis TEXT CHECK (reinstatement_basis IN ('amount', 'amount_and_time')),
  layer_premium      BIGINT,                -- XoL deposit or minimum premium
  UNIQUE (contract_id, seq)
);

CREATE TABLE reinsurance_participations (  -- each reinsurer's signed line
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  layer_id           UUID NOT NULL REFERENCES reinsurance_layers (id),
  reinsurer_id       UUID NOT NULL REFERENCES insurers (id),
  signed_share_bp    INT NOT NULL,          -- share of the layer
  collateral_ref     TEXT,                  -- trust, LOC (Reinsurance Operations)
  UNIQUE (layer_id, reinsurer_id)
);

CREATE TABLE reinsurance_inurings (        -- which recoveries reduce which subjects
  contract_id        UUID NOT NULL REFERENCES reinsurance_contracts (id),
  inures_to_id       UUID NOT NULL REFERENCES reinsurance_contracts (id),
  PRIMARY KEY (contract_id, inures_to_id)
);
```

Participations on a layer sum to 100% less the cedent's co-participation; a check enforces it at binding. Design choices that matter:

- **Terms are data.** Attachment, limit, reinstatements, occurrence clause and commission slide are columns the cession engine reads, so a new treaty year is a new contract, not a code change ([Rules as Data](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).
- **The inuring graph is explicit** and acyclic; the engine computes recoveries in its topological order.
- **Reinsurers are insurers** in the core model's `insurers` table (with domicile and form), because credit for reinsurance and collateral depend on who they are ([Reinsurance Operations](/books/insurance/reinsurance-operations)).
- **Layer usage is derived,** from cessions against the layer, never a stored remaining-limit balance someone decrements.

## Auditing

- **Contracts match the placement.** Every layer's terms and every signed line match the broker's slip and the signed wording; differences are resolved before the first cession.
- **Recoveries reproduce.** For each occurrence, gross loss, inuring recoveries, layer losses and reinstatement premiums recompute from claims and contract terms to the dollar.
- **Occurrence grouping follows the wording.** Claims grouped into a loss occurrence meet the contract's peril and hours clause, independently of the internal cat code.
- **Commission adjustments are traceable** to the loss ratio calculation they used, at each adjustment date.

## What This Means for the System You Build

- **Model each layer as its own record** with attachment, limit, reinstatements and reinsurers' shares, under a contract with period, basis and subject.
- **Encode the inuring order** and compute recoveries in it.
- **Derive layer usage and reinstatement premium from cessions,** pro rata as to amount (and time, if the contract says).
- **Treat ceding commission as a function of ceded loss ratio** with provisional payments and later adjustments.
- **Keep facultative certificates in the same model** as treaties, keyed to the policies they cover.
- **Store the occurrence clause** with the contract and group claims by it, not by the internal event code alone.

## References

**Regulators and guidance**

- [FEMA: NFIP reinsurance program](https://www.fema.gov/flood-insurance/work-with-nfip/reinsurance), traditional placements by year with risk transferred, reinsurer counts and premiums

**Filings**

- [Universal Insurance Holdings: Form 8-K on the 2026-2027 reinsurance program, May 28, 2026](https://www.sec.gov/Archives/edgar/data/891166/000089116626000053/uve-20260528.htm), first event retention, all-states tower, FHCF layer at 90%, captive and second, third and fourth event layers, reinstatement premium protection, second event exhaustion and 2027-2028 capacity
- [HCI Group: Form 8-K on the 2026-2027 reinsurance program, June 1, 2026](https://www.sec.gov/Archives/edgar/data/1400810/000119312526249754/hci-20260601.htm), three towers, retentions, single-event limits, the 45% FHCF election, full RPP and ceded premium estimates
- [RenaissanceRe: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/913144/000091314426000012/rnr-20251231.htm), gross premiums written by segment, Fontana's whole account quota share, and broker concentration
- [Everest Group: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1095073/000109507326000006/eg-20251231.htm), gross written premium and its reinsurance share
