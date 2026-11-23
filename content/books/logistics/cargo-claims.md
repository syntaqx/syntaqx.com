+++
title = "Cargo Liability & Claims"
description = "Who pays for lost or damaged freight: Carmack, released rates, 49 CFR 370 claim rules, LTL tariffs, brokers, COGSA and Montreal limits, and the claim workflow."
category = "Logistics & Supply Chain Industry"
order = 2826
part = "Carrier Regulation"
tags = ["logistics", "freight", "cargo-claims", "carmack", "liability", "ltl", "compliance"]
+++

When freight arrives crushed, wet, short or not at all, the question of who pays has a different answer for every mode and almost every contract. A truckload carrier in interstate commerce is liable for "the actual loss or injury to the property" under the Carmack Amendment, unless the shipper agreed to a lower released value in writing. An LTL carrier's rules tariff caps that liability by the pound, at one figure for new goods and another, far lower, for used ones. A broker isn't a carrier under Carmack at all and owes what its contracts say. An ocean carrier owes $500 a package under COGSA unless the shipper declared a higher value on the bill of lading, and an airline 26 Special Drawing Rights a kilogram under the Montreal Convention. A shipper whose pallet of electronics was dropped at a cross-dock may recover the invoice value, $5 a pound, or ten cents a pound, depending on paperwork signed before the freight moved.

The software is hard because a claim is a legal process with statutory floors, regulatory clocks and contract terms layered on each other, all hanging off the original shipment's records. The claimant needs the bill of lading, the delivery receipt with its exceptions, the commercial invoice and photos; the carrier has to acknowledge in 30 days and answer in 120; the carrier's tariff sets the limit and the filing period, which may not be shorter than nine months; the salvage has to be sold and accounted for; and the shipper's insurer may pay first and then pursue the carrier. This chapter covers the carrier's liability by mode, the claim rules in 49 CFR 370, the bill of lading terms that govern most LTL freight, released value tariffs, the broker's position, concealed damage, salvage and subrogation, and the tables and state machine that run a claim. Commerce owns parcel claims for merchants ([Carrier Liability and Claims](/books/commerce/shipping-and-carriers#carrier-liability-and-claims)); Insurance owns the motor truck cargo policy that pays many of these ([The Lines](/books/insurance/commercial-lines#the-lines)).

## How the Carriers Do It

As of November 2026, from carrier rules tariffs and claims pages and the uniform bill of lading terms that LTL carriers participating in the NMFC apply:

| Source | Standard liability | Buying more | Filing period | Concealed damage |
| --- | --- | --- | --- | --- |
| **AAA Cooper** (rules tariff page) | "Twenty dollars ($20.00) per pound per package," capped at "fifty thousand dollars ($50,000.00) per shipment," whichever is lower | Full Value Coverage requested at shipment, Item 570 | "Within nine (9) months of the date of delivery" | Not stated on the page |
| **ArcBest (ABF Freight)** (claims guide) | Per ABF 111 Series Item 780-1, Carmack and the uniform bill of lading; no figure on the guide | Not stated on the guide | "Within nine months of the delivery date"; loss claims from delivery or a reasonable delivery time | Report within five business days of delivery; a late report "may release the carrier from liability" |
| **Old Dominion** (ODFL 100-Q, Item 594, revised November 3, 2025) | The lowest of invoice value, replacement cost, or "$5.00 per pound or $50,000 per occurrence" for new goods and "$0.10 per pound or $10,000 per occurrence" for used, reconditioned, refurbished or remanufactured goods, applied "only to the weight of the lost or damaged commodities" | Additional Cargo Liability, Item 574, requested before shipping and shown on the bill of lading, up to $250,000 new and $15,000 used without officer approval; "is NOT ... insurance" | "Within nine (9) months of the date of delivery," or for a loss the date delivery was anticipated, with supporting documents; two years to sue after disallowance | Notice "within five (5) business days from the date of delivery" and a chance to inspect, or the claim is denied |
| **RXO** (shipper guide, as a broker) | The carrier's | Through the carrier, or cargo insurance | "Up to nine months from the delivery date," and "up to two years" to sue after denial | Carriers often treat damage as concealed if notified within five business days, and a paying carrier generally pays "1/3 of their standard liability" |
| **NMFC Uniform Straight Bill of Lading** (NMF 100-AV, Item 250150) | Liable "as at common law," with exceptions for acts of God, the public enemy, authority of law, the shipper's act or default, the defect or vice in the property, and strikes and labor disputes; released value applied per article lost, "not on the total weight of the handling unit" | Released value stated on the bill or in the tariff | Nine months from delivery for damage, nine months from the bill of lading date for loss; two years to sue from final disposition | Not addressed |

Three patterns:

- **Used goods are nearly uninsured by the carrier.** Old Dominion's ten cents a pound on used or refurbished commodities makes a 500-pound pallet of refurbished servers worth $50 to the carrier, whatever the invoice says. A shipper's system that doesn't flag used goods at booking, and buy excess value or insurance for them, is self-insuring them by default.
- **Nine months and two years are everywhere, because Carmack sets them as floors.** The statute forbids a carrier from giving the shipper less than nine months to file or two years to sue; every tariff and bill of lading above uses exactly those floors, and Old Dominion's adds a five-business-day notice for concealed damage on top.
- **The limit is computed per article, not per shipment.** The uniform bill of lading multiplies the released value by the weight of "each individual article, package or piece lost or damaged," so a crushed 30-pound carton on a 1,200-pound pallet is worth 30 pounds of liability. The claim lines have to carry the weight of what was damaged.

## The Carmack Amendment

For interstate motor carriers and freight forwarders, 49 U.S.C. 14706 makes the receiving carrier, the delivering carrier and any carrier over whose route the property moved liable "to the person entitled to recover under the receipt or bill of lading" for "the actual loss or injury to the property." A freight forwarder "is both the receiving and delivering carrier" (14706(a)(2)). The claimant may sue the delivering carrier or the carrier that caused the loss, which can recover from the carrier "over whose line or route the loss or injury occurred" (14706(b), (d)). Three provisions shape every claim system:

- **Actual loss.** The statute doesn't define the measure further; a claim is stated as the value of what was lost or the cost to repair it, net of salvage, and proved with the certified invoice or other proof of value that 370.7 asks for.
- **Released rates.** A carrier may set rates that limit liability "to a value established by written or electronic declaration of the shipper or by written agreement" between them, if that value is reasonable (14706(c)(1)(A)); a carrier that doesn't file its tariff must give the shipper, on request, "a written or electronic copy of the rate, classification, rules, and practices" behind the rate (14706(c)(1)(B)). Household goods follow separate full-value rules (14706(f)).
- **Time limits.** A carrier "may not provide by rule, contract, or otherwise, a period of less than 9 months for filing a claim," or less than two years for a suit, measured from the carrier's written notice disallowing the claim (14706(e)(1)). The nine months therefore lives in the carrier's bill of lading or tariff, which may give more but not less.

The carrier's bill of lading is the contract the limit and the clocks hang on; 49 CFR 373.101 requires it to name the consignor and consignee, origin and destination, the number of packages, a description of the freight, and the weight, volume or measurement where they rate it. Because a released value rests on the shipper's written declaration or agreement (14706(c)(1)(A)), the signed bill of lading or contract that carries it is the record a carrier needs to enforce its limit, and the record a shipper needs to know what it agreed to.

## Claim Rules in 49 CFR 370

FMCSA's claim regulations apply to every claim against a carrier subject to them:

- **What a claim is.** A written claim, filed with the proper carrier within the contract's time limits, that contains "facts sufficient to identify the baggage or shipment," asserts liability, and demands "a specified or determinable amount of money" (370.3(b)). Bad order reports, damage appraisals, exception notations on a delivery receipt and the carrier's inspection report "shall, standing alone, not be considered by carriers as sufficient" (370.3(c)). A claim for "$100 more or less" isn't payable until it is restated as a specified amount (370.3(d)).
- **Acknowledgment.** The carrier acknowledges a claim in writing "within 30 days" unless it has paid or declined it in that time, says what more it needs, opens a separate claim file with a sequential number, and records the receipt date (370.5).
- **Investigation.** Each claim is "promptly and thoroughly investigated"; the claim is supported by the bill of lading, evidence of the freight charges and a certified invoice or other proof of value; and for a whole missing package the carrier may require the consignee's statement that the goods weren't received "from any other source" (370.7).
- **Disposition.** The carrier pays, declines or makes "a firm compromise settlement offer in writing" within 120 days of receiving the claim; if it can't, it tells the claimant the status and the reason at 120 days and again at the end of "each succeeding 60-day period while the claim remains pending" (370.9).
- **Overlapping claims.** When the investigation shows that other carriers on the route received a similar claim on the same shipment, the carrier communicates with them and, before agreeing how to dispose of the claims, notifies every claimant of the overlap and requires each to prove its title to the property or its right to the claim (370.3(e)).
- **Salvage.** Damaged freight the consignee refuses is sold or disposed of in a way that protects everyone with an interest, with an itemized, numbered record of each lot tied to its shipment and claim, full disclosure if the buyer is related to the carrier, and the proceeds recorded against the claim (370.11).

These are the clocks a carrier's claims system runs on, and they're the clocks a shipper's or broker's system should expect the carrier to keep.

## Released Values in LTL

LTL is the mode where released values matter most, because almost every LTL shipment moves under a carrier's rules tariff and the uniform bill of lading. A worked claim under Old Dominion's Item 594 limits: a shipper sends one pallet of 24 cartons of new small appliances, each carton 25 pounds and invoiced at $180, and four cartons arrive crushed.

| Line | Basis | Amount |
| --- | --- | --- |
| Invoice value of the damaged cartons | 4 × $180 | $720.00 |
| Less salvage, if the shipper keeps and sells the damaged goods (illustrative) | Sold as damaged | ($60.00) |
| Actual loss | Invoice less salvage | $660.00 |
| Released value limit | 4 cartons × 25 lb × $5.00, per article lost | $500.00 |
| Per-occurrence cap | $50,000 | Not reached |
| **Carrier's liability** | Lowest of actual loss, replacement cost and the limit | **$500.00** |

Had the same cartons been refurbished, the limit would be 100 pounds at $0.10, or $10.00. Had the shipper declared Additional Cargo Liability of $4,500 on the bill of lading, the full $660 actual loss would be recoverable and the shipper would have paid the higher transportation charge Item 574 sets for it, which the carrier bills as an accessorial. Computing the limit by the whole pallet's 600 pounds ($3,000) instead of the four cartons is the classic overstatement the uniform bill of lading's Section 5(a) was written to stop. The data model consequence is that a claim's lines carry the weight and value of what was damaged, not the shipment's totals; [Freight Class, Density & LTL Pricing](/books/logistics/freight-classification) covers the tariffs these items sit in.

## The Broker's Position

Carmack runs against "a carrier providing transportation or service," and a broker is a different regulated person: one "other than a motor carrier" that arranges transportation for compensation (49 U.S.C. 13102(2)). A broker therefore isn't liable under Carmack for the carrier's loss; its exposure is contract (a shipper agreement that promises to pay claims, or to pursue them) and its own negligence. The broker-carrier agreement is where brokers put the carrier's liability, often raising it above the carrier's tariff limit or making it full value, and where they reserve the right to set off a paid claim against the carrier's freight bill; [How Freight Brokerage Works](/books/logistics/freight-brokerage) covers the agreement. In practice the broker files or coordinates the claim against the carrier on the shipper's behalf (RXO describes its role as coaching and mediation with carriers' claims teams), which is why a broker's claims system holds the same claim twice: as an obligation to its customer and as a demand against its carrier.

Two consequences for records. First, the broker must know which carrier physically had the freight, because the claim goes to that carrier and its cargo insurer; a double-brokered load breaks that chain ([Freight Fraud & Cargo Theft](/books/logistics/freight-fraud) covers it). Second, any amount the broker pays its customer above what the carrier pays is the broker's own loss, which it can carry under a contingent cargo policy ([Commercial Lines](/books/insurance/commercial-lines#the-lines) owns the products).

## Concealed Damage, Salvage and Subrogation

**Concealed damage** is damage found after the consignee signed a clean delivery receipt. Carmack and part 370 set no separate deadline for reporting it; carriers set one in practice. ArcBest asks for a report "within five business days after delivery" and an inspection, and warns that a late report "may release the carrier from liability"; Old Dominion's Item 594 makes five business days a condition, denying a concealed damage claim reported later; RXO describes five business days as common and a carrier that pays as typically paying a third of its standard liability. The claim is still a claim under 370.3 with the same nine-month filing floor; the practice changes the evidence the carrier will accept. My rule: when a consignee opens a carton and finds damage, record the discovery time, photograph before moving it, keep all packaging, and notify the delivering terminal the same day, because every one of those is what the carrier's inspector will ask for.

**Salvage** reduces the loss. Either the carrier takes the damaged goods and sells them, recording the lot and proceeds against the claim (370.11), or the claimant keeps them and deducts their value from the claim. ArcBest tells claimants to "hold the salvage and all packaging materials until the matter is resolved." The claim record holds which one happened and the amount.

**Subrogation.** A shipper with its own cargo or inland marine insurance is often paid by its insurer first, and the insurer then pursues the carrier in the shipper's place, under the same Carmack rights and the same time limits ([Subrogation Rights](/books/insurance/subrogation-and-salvage#subrogation-rights) owns the insurer's side). The carrier's claims system therefore receives claims from insurers and their recovery agents as well as from shippers, and requiring each claimant to prove its right before paying, as 370.3(e) does for overlapping claims, is what stops it paying twice when both file.

## Ocean and Air

Ocean and air liability is international and runs on per-package or per-kilogram limits that the shipper can raise only by declaring value:

| Regime | Applies to | Limit | Notice and suit |
| --- | --- | --- | --- |
| **COGSA** (U.S. Carriage of Goods by Sea Act, 1936) | Ocean bills of lading to or from U.S. ports | "$500 per package," unless the nature and value were declared before shipment | Notice of non-apparent loss "within three days of the delivery"; suit "within one year after delivery" |
| **Hague-Visby Rules** (as in the UK Carriage of Goods by Sea Act 1971) | Bills of lading under the laws of the UK and other states that enacted them | "666.67 units of account per package or unit" or "2 units of account per kilogramme" of gross weight, whichever is higher | Suit "within one year of their delivery or of the date when they should have been delivered" |
| **Rotterdam Rules** (2008 convention) | Would cover door-to-door contracts with a sea leg | Not in force: 25 signatories and 5 parties as of November 22, 2026, against the 20 ratifications its article 94 requires | Not applicable |
| **Montreal Convention** (1999) | International carriage by air between states party to it | 26 SDRs per kilogram since December 28, 2024 (22 before, 17 originally), unless the consignor made "a special declaration of interest in delivery at destination" | Complaint within 14 days of receipt for damage, 21 days for delay; action within two years |

ICAO revises the Montreal limits for inflation every five years under the convention's review mechanism, and put the 2024 cargo limit at about US$35 a kilogram; the U.S. dollar value of an SDR moves daily, so a claims system stores the limit in SDRs and converts at the rate for the date that governs the claim, not at booking. Because COGSA's limit is counted per package, the piece count on the bill of lading is a liability field as well as a description. [Bills of Lading & eBL](/books/logistics/ocean-documents) covers the documents and [Air Cargo](/books/logistics/air-cargo) the air waybill; forwarders that issue their own house bills ([Freight Forwarders & NVOCCs](/books/logistics/forwarders-and-nvoccs)) face their customers' claims under those bills.

## How to Build It

A claim is a record with a state machine, lines that carry what was damaged, deadlines computed from the shipment's dates, and links to the documents and money that settle it. First, the liability facts on the shipment and the claim link on charges:

```sql
ALTER TABLE shipments
  ADD COLUMN liability_regime   TEXT,       -- which rules govern a claim on this shipment
  ADD COLUMN released_rate      NUMERIC(12, 4),  -- minor units per kg, from the tariff or the bill
  ADD COLUMN released_rate_used NUMERIC(12, 4),  -- the lower rate for used or refurbished goods
  ADD COLUMN liability_cap      BIGINT,     -- per shipment or occurrence, minor units
  ADD COLUMN bol_signed_at      TIMESTAMPTZ;  -- the signature the limit depends on
ALTER TABLE shipments ADD CONSTRAINT shipments_liability_regime_check
  CHECK (liability_regime IN ('carmack_actual_loss', 'carmack_released_value',
    'carmack_declared_value', 'cogsa', 'hague_visby', 'montreal', 'contract')) NOT VALID;
ALTER TABLE shipments ADD CONSTRAINT shipments_liability_cap_check
  CHECK (liability_cap >= 0) NOT VALID;
ALTER TABLE shipments VALIDATE CONSTRAINT shipments_liability_regime_check;
ALTER TABLE shipments VALIDATE CONSTRAINT shipments_liability_cap_check;

ALTER TABLE shipment_lines
  ADD COLUMN used_goods BOOLEAN NOT NULL DEFAULT FALSE;  -- the lower released rate applies

ALTER TABLE freight_charges
  ADD COLUMN cargo_claim_id UUID;           -- a claim set-off or chargeback, and excess value
CREATE INDEX CONCURRENTLY freight_charges_cargo_claim_id_idx ON freight_charges (cargo_claim_id);
```

Excess value bought from a carrier (Old Dominion's Additional Cargo Liability, AAA Cooper's Full Value Coverage) is an ordinary `freight_charges` row of kind `'accessorial'` with its code; a broker charging a paid claim back to its carrier is kind `'chargeback'` with `cargo_claim_id` set. The foreign key on `cargo_claim_id` is added `NOT VALID` after the table below exists. Then the claim:

```sql
CREATE TABLE cargo_claims (               -- a claim for loss, damage or delay
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_party_id       UUID NOT NULL REFERENCES parties (id),  -- whose record this is
  role                 TEXT NOT NULL CHECK (role IN ('received_as_carrier',
                         'filed_against_carrier', 'handled_for_customer')),
  shipment_id          UUID NOT NULL REFERENCES shipments (id),
  load_id              UUID REFERENCES loads (id),
  claimant_party_id    UUID NOT NULL REFERENCES parties (id),  -- shipper, consignee or insurer
  carrier_party_id     UUID NOT NULL REFERENCES parties (id),  -- the carrier claimed against
  kind                 TEXT NOT NULL CHECK (kind IN ('loss', 'shortage', 'visible_damage',
                         'concealed_damage', 'delay', 'contamination', 'temperature')),
  carrier_claim_number TEXT,                -- the carrier's sequential claim file number
  claimed_amount       BIGINT NOT NULL CHECK (claimed_amount > 0),  -- a specified amount
  currency             CHAR(3) NOT NULL,
  liability_limit      BIGINT,              -- computed from the regime and the damaged lines
  delivered_at         TIMESTAMPTZ,         -- starts the damage filing clock
  discovered_at        TIMESTAMPTZ,         -- concealed damage: when the consignee found it
  carrier_notified_at  TIMESTAMPTZ,
  file_by              DATE NOT NULL,       -- 9 months from delivery, or from the BOL date for loss
  filed_at             TIMESTAMPTZ,
  received_at          TIMESTAMPTZ,         -- the carrier's receipt date, per 370.5(b)
  acknowledge_by       TIMESTAMPTZ,         -- received_at plus 30 days
  dispose_by           TIMESTAMPTZ,         -- received_at plus 120 days, then every 60
  disallowed_at        TIMESTAMPTZ,         -- written disallowance starts the 2-year suit clock
  sue_by               DATE,
  status               TEXT NOT NULL CHECK (status IN ('draft', 'filed', 'acknowledged',
                         'investigating', 'offered', 'paid', 'declined', 'appealed',
                         'in_litigation', 'withdrawn', 'closed')),
  insurer_party_id     UUID REFERENCES parties (id),  -- a subrogating insurer, when there is one
  retain_until         DATE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (owner_party_id, carrier_party_id, carrier_claim_number)
);

CREATE TABLE cargo_claim_lines (          -- what was lost or damaged, per article
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  cargo_claim_id    UUID NOT NULL REFERENCES cargo_claims (id),
  shipment_line_id  UUID REFERENCES shipment_lines (id),
  handling_unit_id  UUID REFERENCES handling_units (id),
  description       TEXT NOT NULL,
  quantity          NUMERIC(14, 3) NOT NULL CHECK (quantity > 0),
  weight_g          BIGINT NOT NULL CHECK (weight_g > 0),  -- of the damaged articles only
  invoice_value     BIGINT NOT NULL CHECK (invoice_value >= 0),
  repair_cost       BIGINT CHECK (repair_cost >= 0),
  salvage_value     BIGINT NOT NULL DEFAULT 0 CHECK (salvage_value >= 0),
  used_goods        BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE cargo_claim_events (         -- every transition and notice, append-only
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  cargo_claim_id UUID NOT NULL REFERENCES cargo_claims (id),
  from_status    TEXT,
  to_status      TEXT NOT NULL,
  kind           TEXT NOT NULL CHECK (kind IN ('transition', 'acknowledgment',
                   'status_notice', 'document_requested', 'document_received',
                   'inspection', 'offer', 'payment', 'disallowance', 'salvage_sold',
                   'subrogation_notice')),
  amount         BIGINT,                    -- an offer, payment or salvage proceeds
  occurred_at    TIMESTAMPTZ NOT NULL,
  recorded_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_party_id UUID REFERENCES parties (id),
  document_id    UUID REFERENCES documents (id)  -- the letter, photo or report
);

CREATE TABLE cargo_claim_documents (      -- the evidence a claim needs, by role
  cargo_claim_id UUID NOT NULL REFERENCES cargo_claims (id),
  document_id    UUID NOT NULL REFERENCES documents (id),
  role           TEXT NOT NULL CHECK (role IN ('claim_letter', 'bill_of_lading',
                   'delivery_receipt', 'commercial_invoice', 'freight_bill', 'photo',
                   'inspection_report', 'repair_estimate', 'salvage_record',
                   'non_receipt_statement', 'carrier_correspondence')),
  PRIMARY KEY (cargo_claim_id, document_id)
);

ALTER TABLE freight_charges ADD CONSTRAINT freight_charges_cargo_claim_id_fkey
  FOREIGN KEY (cargo_claim_id) REFERENCES cargo_claims (id) NOT VALID;
ALTER TABLE freight_charges VALIDATE CONSTRAINT freight_charges_cargo_claim_id_fkey;

CREATE INDEX ON cargo_claims (owner_party_id, status, dispose_by);
CREATE INDEX ON cargo_claim_events (cargo_claim_id, occurred_at);
```

The released value limit, computed per article as the uniform bill of lading requires, and compared with what was claimed:

```sql
SELECT c.id,
       SUM(l.invoice_value - l.salvage_value) AS actual_loss,
       LEAST(
         SUM(ROUND(l.weight_g / 1000.0 *
           CASE WHEN l.used_goods THEN s.released_rate_used ELSE s.released_rate END)),
         COALESCE(s.liability_cap, 'Infinity'::NUMERIC)) AS released_limit
FROM cargo_claims c
JOIN shipments s ON s.id = c.shipment_id
JOIN cargo_claim_lines l ON l.cargo_claim_id = c.id
WHERE c.id = $1 AND s.liability_regime = 'carmack_released_value'
GROUP BY c.id, s.liability_cap;
```

The payable amount is the lower of the two, which the claim stores in `liability_limit` with the inputs it used. And the carrier's daily queue, every claim whose acknowledgment or disposition is due in the next week:

```sql
SELECT id, carrier_claim_number, status,
       CASE WHEN status = 'filed' THEN acknowledge_by ELSE dispose_by END AS due
FROM cargo_claims
WHERE owner_party_id = $1
  AND role = 'received_as_carrier'
  AND status IN ('filed', 'acknowledged', 'investigating')
  AND CASE WHEN status = 'filed' THEN acknowledge_by ELSE dispose_by END < NOW() + INTERVAL '7 days'
ORDER BY due;
```

The state machine is short, and every arrow writes a `cargo_claim_events` row:

| From | To | On |
| --- | --- | --- |
| `draft` | `filed` | The written claim is sent with a specified amount; `filed_at` must be on or before `file_by` |
| `filed` | `acknowledged` | The carrier's acknowledgment, within 30 days of receipt, or a payment or decline in that time |
| `acknowledged` | `investigating` | Documents requested, inspection scheduled |
| `investigating` | `offered`, `paid`, `declined` | The carrier's written disposition by day 120; otherwise a `status_notice` event at day 120 and every 60 days, and `dispose_by` moves forward |
| `offered` | `paid`, `appealed`, `withdrawn` | The claimant accepts, contests or drops it |
| `declined` | `appealed`, `in_litigation`, `closed` | A written disallowance sets `disallowed_at` and `sue_by` two years later |
| `paid`, `withdrawn`, `in_litigation` | `closed` | Payment reconciled, salvage accounted for, set-offs and chargebacks posted |

Design notes:

- **Deadlines come from the contract, with the statute as a floor.** `file_by` is computed from the carrier's bill of lading or tariff (nine months from delivery for damage, from the bill of lading date for loss, under the uniform terms), and a contract that grants more wins; a contract that grants less is ignored in favor of the nine-month floor ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).
- **Guard the transitions in the database.** Allowed transitions live in a table, and one function moves a claim and writes the event, so a claim can't jump from `filed` to `paid` without an acknowledgment record when the rules required one ([Guarded in the Database](/docs/building-blocks/workflows#guarded-in-the-database)).
- **Lines are per article.** The claim's limit is a function of the damaged articles' weights and values, never the shipment's totals, and the used goods flag travels from the shipment line to the claim line.
- **Money is settled through the ledger, not on the claim.** A carrier's payment, a broker's payout to its customer, a set-off against a carrier's freight bill and a salvage sale are separate entries linked to the claim; the claim's status says where it stands, not how much was paid ([Accounting](/docs/money/accounting)).
- **International limits stay in their units.** Store COGSA's $500 as dollars per package and Montreal's 26 as SDRs per kilogram, with the conversion rate and date used, so a claim paid months later can show its arithmetic.
- **Emit what finance and customers watch.** `cargo_claim.filed`, `cargo_claim.acknowledged`, `cargo_claim.status_notice_due`, `cargo_claim.paid` and `cargo_claim.disallowed` feed reserves, customer notifications and carrier scorecards ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## Auditing

FMCSA can inspect a carrier's claim files (370.7 requires keeping the documents an investigation needed), and a court reads them in a Carmack suit:

- **The claim as filed,** with its specified amount, filing date against `file_by`, and the documents attached.
- **Every clock kept:** the 30-day acknowledgment, the 120-day disposition and each 60-day status notice, with the letters themselves.
- **The limit's arithmetic:** the regime, the released rate, the damaged articles' weights and values, the cap, and the signed bill of lading that made the limit apply.
- **Salvage:** each lot, its number, its buyer and any relationship to the carrier, and the proceeds credited to the claim (370.11).
- **Overlapping claimants and subrogation:** every claimant, the proof of each one's right, and which one was paid.
- **The money:** payments, set-offs and chargebacks linked to the claim and reconciled to the ledger.

The record mechanics are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Record the liability regime and released rate on the shipment at booking,** with the signed bill of lading that makes them apply, and flag used goods.
- **Compute the carrier's limit per damaged article,** the lower of actual loss and the released value, and store its inputs.
- **Run claims as a state machine with the 370 clocks:** 30 days to acknowledge, 120 to dispose, 60-day notices, and a two-year suit clock from disallowance.
- **Treat nine months as a floor, not the deadline,** and compute the filing date from the contract.
- **Capture concealed damage evidence the day it's found,** with discovery time, photos and packaging.
- **Keep the broker's two claims apart:** the obligation to the customer and the demand against the carrier, settled by separate ledger entries.
- **Hold ocean and air limits in their own units,** with the conversion and date used.

## References

**Statutes and regulations**

- [49 U.S.C. 14706: Liability of carriers under receipts and bills of lading](https://www.law.cornell.edu/uscode/text/49/14706), actual loss, forwarders, apportionment, released rates, venue, the nine-month and two-year floors and household goods
- [49 U.S.C. 13102: Definitions](https://www.law.cornell.edu/uscode/text/49/13102), the broker as a person other than a motor carrier
- [49 CFR 370.3: Filing of claims](https://www.law.cornell.edu/cfr/text/49/370.3), minimum contents, documents that aren't claims, uncertain amounts and overlapping claims
- [49 CFR 370.5: Acknowledgment of claims](https://www.law.cornell.edu/cfr/text/49/370.5), 30 days, the claim file and its number
- [49 CFR 370.7: Investigation of claims](https://www.law.cornell.edu/cfr/text/49/370.7), prompt investigation, supporting documents and the non-receipt statement
- [49 CFR 370.9: Disposition of claims](https://www.law.cornell.edu/cfr/text/49/370.9), 120 days and 60-day status notices
- [49 CFR 370.11: Processing of salvage](https://www.law.cornell.edu/cfr/text/49/370.11), disposal, lot records, related buyers and proceeds
- [49 CFR 373.101: Motor carrier bills of lading](https://www.law.cornell.edu/cfr/text/49/373.101), required contents
- [46 U.S.C. 30701 note: Carriage of Goods by Sea Act](https://www.law.cornell.edu/uscode/text/46/30701), $500 per package, three-day notice and one-year suit
- [UK Carriage of Goods by Sea Act 1971, Schedule (Hague-Visby Rules)](https://www.legislation.gov.uk/ukpga/1971/19/schedule), 666.67 units per package or 2 per kilogram and one-year suit
- [UK Carriage by Air Acts (Implementation of the Montreal Convention 1999) Order 2002, Schedule 1](https://www.legislation.gov.uk/uksi/2002/263/schedule/1), Article 22(3) special declaration, Article 31 complaint periods and Article 35 two years

**Treaties and standards**

- [ICAO: International air travel liability limits set to increase](https://icao.int/news/international-air-travel-liability-limits-set-increase-enhancing-customer-compensation-0), cargo from 22 to 26 SDRs per kilogram on December 28, 2024, about US$35, and the five-year review
- [ICAO: 2024 revised limits of liability, administrative package](https://www.icao.int/sites/default/files/secretariat/legal/Administrative%20Packages/mtl99_en.pdf), the original 17 SDRs and the revised 26 under Article 22(3)
- [United Nations Treaty Collection: Rotterdam Rules status](https://treaties.un.org/Pages/ViewDetails.aspx?src=TREATY&mtdsg_no=XI-D-8&chapter=11&clang=_en), not in force, 25 signatories and 5 parties as of November 22, 2026
- [NMFTA: Uniform Straight Bill of Lading terms and conditions (NMF 100-AV)](https://nmfta.org/wp-content/media/2022/10/Uniform_Bill_of_Lading_Terms_and_Conditions.pdf), common-law liability and its exceptions, claim periods, two years to sue from final disposition, per-article released value and dangerous goods disclosure

**Carriers and brokers**

- [AAA Cooper: Liability terms and conditions](https://www.aaacooper.com/Rates/RulesTariff), $20 per pound per package, $50,000 per shipment and nine months
- [ArcBest: A guide to cargo claims](https://arcb.com/node/7741), nine months, five business days for concealed damage, salvage and documents
- [Old Dominion: ODFL 100-Q Item 594, Maximum carrier cargo liability](https://www.odfl.com/content/dam/odfl/us/en/documents/rates-and-tariffs/tariff-100/594.pdf), $5.00 and $0.10 per pound, $50,000 and $10,000 per occurrence, weight of the damaged goods only, nine months, five business days for concealed damage and two years to sue
- [Old Dominion: Cargo liability](https://www.odfl.com/us/en/tools/freight-shipping-rate-estimate/freight-cargo-liability.html), Additional Cargo Liability under Item 574 and its maximums
- [RXO: LTL freight damage claims](https://rxo.com/resources/shipper/ltl-freight-damage-claims/), five business days, one-third payouts on concealed damage, nine months, two years and the broker's role
