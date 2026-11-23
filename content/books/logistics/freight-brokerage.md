+++
title = "How Freight Brokerage Works"
nav_title = "Freight Brokerage"
description = "Brokers, carriers and forwarders in the statute, broker-carrier agreements, rate confirmations, margins, broker records and negligent selection."
category = "Logistics & Supply Chain Industry"
order = 2816
part = "Freight Brokerage"
tags = ["logistics", "freight-brokerage", "rate-confirmation", "broker-liability", "fmcsa", "data-model"]
+++

A freight broker sells a shipper a truck it doesn't own. The shipper agrees a price to move a load from a dock in Joliet to a DC in Atlanta; the broker finds a motor carrier willing to haul it for less, signs that carrier to a one-load contract, tracks the truck, collects the paperwork, bills the shipper and pays the carrier. The spread is the business. C.H. Robinson, the largest US-listed broker, turned $16.2 billion of 2025 revenue into $2.59 billion of adjusted gross profit across all its services, and the arithmetic of one load, from linehaul through the quick pay fee, is in [A Brokered Truckload](/books/logistics/logistics-business#a-brokered-truckload).

It's hard because the broker sits between two contracts that are written separately, priced separately and enforced separately, and it carries the risk of both. The shipper contract promises service the broker can't perform itself; the carrier contract is often signed minutes before pickup with a company the broker has never used, whose identity, insurance and safety record it has to trust on the evidence of public registries and a certificate from an insurance agent. The rules that bind it are thin: a federal registration and a $75,000 bond, a three-year record of each transaction, a ban on calling itself a carrier, and, since May 14, 2026, the Supreme Court's holding that a state negligence suit for choosing an unsafe carrier is not preempted. This chapter covers what a broker is in the statute and how it differs from a carrier, a forwarder and a dispatcher; the broker-carrier agreement and the rate confirmation; how brokers price and where margin comes from; the transaction record and the transparency rule still in proposal; negligent selection after *Montgomery v. Caribe Transport II*; and the records that come from all of it. It extends `loads`, `rate_agreements` and `freight_charges` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model).

Vetting the carrier before the load is [Carrier Onboarding & Vetting](/books/logistics/carrier-onboarding); the fraud that targets brokers is [Freight Fraud & Cargo Theft](/books/logistics/freight-fraud); finding carriers on load boards and booking them automatically is [Load Boards & Digital Freight Matching](/books/logistics/load-boards-and-matching). Broker registration and the bond are in [Operating Authority & Registration](/books/logistics/operating-authority) and [Broker and Forwarder Security](/books/logistics/financial-security-and-insurance#broker-and-forwarder-security); tender messages are in [Tendering & Acceptance](/books/logistics/tendering); paying carriers, quick pay and factors are in [Paying Carriers, Quick Pay & Factoring](/books/logistics/paying-carriers); and gross versus net revenue for a broker is in [Logistics Accounting](/books/logistics/logistics-accounting).

## How the Brokers Do It

As of November 2026, from 10-K filings, carrier terms the brokers publish and their carrier pages:

| Broker | Scale and model | Carrier terms in public | Payment and quick pay | Revenue presentation |
| --- | --- | --- | --- | --- |
| **Arrive Logistics** | Private broker | Rate confirmation terms that incorporate the broker-carrier agreement and govern where they conflict; a confirmation is "deemed accepted by Carrier unless it is rejected within 48 hours of receipt"; double brokering without written authorization means "forfeiture of payment" | "within 30 days after receipt of invoice" and "all pages of the signed proof of delivery" | Private |
| **C.H. Robinson** | $16.2 billion revenue, about 37 million shipments and more than 450,000 transportation providers in 2025; loads booked through Navisphere Carrier, "free to all C.H. Robinson contract carriers" | Carrier requirements: "An active MC/MX# or DOT#," authority "active for at least 7 days," $1,000,000 auto and $100,000 cargo, certificates from the agent through Highway | "Quick Pay fees are standardized at 2.0%"; factoring through C.H. Robinson Factoring by Triumph | "Most transactions in our transportation and sourcing businesses are recorded at the gross amount"; net for customs brokerage, managed solutions, freight forwarding and sourcing managed procurement |
| **Flock Freight** | Private broker | A published broker-carrier agreement: no re-brokering, co-brokering or interlining without consent; Carmack liability; no "Unsatisfactory" or "Conditional" rating; 24-month non-solicitation | Payment "within thirty (30) days of receipt of Carrier's undisputed invoice," POD within 24 hours; a factoring notice "shall not take effect until fifteen (15) days after Broker receives" it | Private |
| **RXO** | $5.74 billion of 2025 revenue after acquiring Coyote for $1.038 billion in cash (closed September 16, 2024); largest customer 11.4% of revenue | Loads through RXO Connect, a "self-learning" digital brokerage platform | Not stated in the filing | Gross where it controls the service; net "when we do not control the specific services" |
| **TQL** | Private; "about 18% of carriers are disqualified at onboarding" | Active FMCSA authority, $1,000,000 auto and $100,000 cargo, insurance "verified directly with the carrier's insurance agent," conditional ratings "generally avoided" | Not stated on the vetting page | Private |
| **Uber Freight** | $5,099 million of Freight revenue in 2025, Adjusted EBITDA of $(33) million | Not stated in the filing | Not stated in the filing | Gross "in most markets," carrier payments in cost of revenue |

The pattern bullets:

- **Two layers of contract.** Every broker publishing terms uses a master broker-carrier agreement signed at onboarding and a per-load rate confirmation that prices one load and points back to the master. Which wins in a conflict is the broker's choice and it differs: Arrive's confirmation governs; Flock's agreement makes conflicting bill of lading terms "subordinate."
- **Requirements above the federal floor.** The federal minimum for a general freight carrier is $750,000 of liability and no cargo insurance at all; C.H. Robinson, TQL, Arrive and Flock all ask for $1,000,000 auto and $100,000 cargo, and C.H. Robinson and TQL take the certificate or the verification from the insurance agent rather than the carrier. Those numbers are a market convention, not a rule, and a shipper contract can raise them.
- **Thirty days and a fee to be faster.** Standard terms run about 30 days from a complete invoice with a signed POD; faster payment is a percentage fee (2.0% at C.H. Robinson). The clock starts on paperwork, not delivery.
- **Gross revenue, compared on the spread.** The principal brokers report gross revenue; the comparable number is revenue less purchased transportation (adjusted gross profit or net revenue), and [How Carriers, Brokers & 3PLs Make Money](/books/logistics/logistics-economics) compares them on it.

## Broker, Carrier, Forwarder, Dispatcher

The statute draws the lines, and each one changes what the company must register, insure and keep:

| Role | Statutory test | Registration | Financial security | Liability for the cargo |
| --- | --- | --- | --- | --- |
| **Motor carrier** | "a person providing motor vehicle transportation for compensation" (49 U.S.C. 13102(14)) | Operating authority (an MC docket) and a USDOT number | Public liability ($750,000 for general freight) and, for some, cargo | Carmack: "the actual loss or injury to the property" (49 U.S.C. 14706) |
| **Broker** | "a person, other than a motor carrier or an employee or agent of a motor carrier," that sells, negotiates for or holds itself out as arranging motor carrier transportation for compensation (13102(2)) | Broker authority | A $75,000 surety bond (BMC-84) or trust fund (BMC-85) (49 CFR 387.307) | None by statute; by contract and, after *Montgomery*, in tort for negligent selection |
| **Freight forwarder** | Holds itself out to the general public, "assembles and consolidates" shipments and "assumes responsibility for the transportation from the place of receipt to the place of destination" (13102(8)) | Freight forwarder authority | Liability and cargo, plus the same $75,000 security as a broker | Carmack, as a carrier would be |
| **Bona fide agent** | "part of the normal organization of a motor carrier," working under a continuing agreement with no discretion to send traffic elsewhere (49 CFR 371.2) | Under the carrier's authority | The carrier's | The carrier's |
| **Dispatch service** | A broker or a bona fide agent depending on the facts; one that books loads for several carriers and chooses which gets each "is not a bona fide agent and must obtain broker operating authority registration" (FMCSA guidance, June 16, 2023) | Broker authority, unless it is a bona fide agent | A broker's, if it is one | None |

The same guidance says that handling the money "is not an essential requirement for one to be considered a broker," and that publishing loads is not brokerage only if the publisher is not "involved in any transaction between the shipper and a motor carrier," which is where load boards sit ([Load Boards & Digital Freight Matching](/books/logistics/load-boards-and-matching)).

The penalty for brokering without authority and the bond is set by statute: a person may broker interstate only if registered and financially secure, the government may recover up to $10,000 per violation, an injured party may recover "for all valid claims incurred without regard to amount," and the liability runs "jointly and severally" to the company's officers, directors and principals (49 U.S.C. 14916). A shipper using an unregistered broker, or a broker re-brokering to one, is dealing with a company whose owners are personally exposed and whose bond doesn't exist.

Two more rules in part 371 shape the product. A broker may not offer brokerage service "in any name other than that in which its registration is issued", may not "represent its operations to be that of a carrier," and "any advertising shall show the broker status of the operation" (371.7): the shipper-facing app, the quote email and the invoice name the broker as a broker. And a broker may not accept carrier compensation on freight it owns or controls through common ownership with the shipper, or give shippers anything of value beyond "inexpensive advertising items" (371.9), which is why an asset carrier's brokerage arm and a shipper's in-house logistics subsidiary need the relationships recorded.

The roles live on the party, not the company type. An asset carrier with a brokerage division is one party with the `carrier` and `broker` roles and two dockets; the load says which hat it wore. Whether a given load was brokered or hauled on the company's own trucks decides which records, which insurance and which revenue line apply, so `loads` records it explicitly rather than inferring it from whether a carrier row is set.

## The Broker-Carrier Agreement

No regulation prescribes what the master contract says; the content is the brokers' and their trade association's convention, visible in the agreements brokers publish. Flock Freight's, as one published example, covers:

- **Status.** "the relationship between Broker and Carrier is that of independent contractor," and the carrier controls its drivers and equipment.
- **Insurance.** "Auto liability $1,000,000.00 combined single limit per occurrence," "All Risk Broad Form Motor Truck Cargo Legal Liability Coverage minimum $100,000.00 per Occurrence," and general liability of $1,000,000 per occurrence and $2,000,000 aggregate. The products are [Commercial Lines](/books/insurance/commercial-lines#the-lines); the federal minimums and filings are [Bonds & Insurance Minimums](/books/logistics/financial-security-and-insurance#public-liability-minimums).
- **Safety.** The carrier "represents that it does not have an 'Unsatisfactory' or 'Conditional' safety rating," and must stop if it gets one.
- **No re-brokering.** The carrier "shall not re-broker, co-broker, subcontract, assign, interline, or transfer the transportation" without consent, the clause that makes double brokering a breach as well as a fraud ([Freight Fraud & Cargo Theft](/books/logistics/freight-fraud)).
- **Cargo liability.** "Carrier's liability shall be determined under the Carmack Amendment, 49 U.S.C. §14706," with claims accepted within nine months, the statutory floor on a carrier's claim period ([Cargo Liability & Claims](/books/logistics/cargo-claims#the-carmack-amendment)).
- **Payment.** Thirty days from an undisputed invoice, POD within 24 hours of delivery, and a notice redirecting payment to a factor (the agreement calls it a Notice of Release) that takes effect 15 days after receipt.
- **Indemnity and non-solicitation.** The carrier indemnifies the broker for its own performance, and may not solicit the broker's customers during the agreement or for 24 months after.
- **Term.** One year, renewing, terminable by either side on 30 days' notice.

The system's job is to know which version of the agreement each carrier signed, when, by whom, and which clauses differ from the standard. A broker that changes its standard agreement has carriers on several versions at once, and a claim, a non-solicitation dispute or a payment-term argument is decided by the version in force on the load's date, not today's.

## The Rate Confirmation

The rate confirmation (rate con) is the load's contract: one carrier, one load, one price, the load's specifics, and the terms that change from load to load. Two published sets show its shape: Arrive's terms are incorporated into each confirmation, govern "as to the provisions in conflict" with the master agreement, and treat the confirmation as "deemed accepted by Carrier unless it is rejected within 48 hours of receipt," while "Receipt of shipment by Carrier constitutes acceptance." What a confirmation carries, across those examples and the master agreements they reference:

- **The parties.** The broker as a broker (371.7), the carrier's legal name, USDOT and docket numbers, and the dispatcher and driver contacts the load will use.
- **The load.** Pickup and delivery facilities, appointment windows in each facility's time zone, commodity, weight, equipment, temperature for a reefer, seal requirements and reference numbers.
- **The price.** Linehaul (flat or per mile), fuel (often included in an all-in spot rate), and the accessorials that are pre-approved and those that need approval, each with its rate.
- **Conditions.** Notice before detention accrues (Arrive asks for "notice 30 minutes prior to detention occurring"), what counts as late at pickup, reporting a discrepancy "before leaving the customer's premises," tracking requirements, and the penalty for re-brokering.
- **Payment.** Terms, required documents ("all pages of the signed proof of delivery"), quick pay options and fees.

A confirmation changes. A shipper moves the appointment, a stop is added, detention is approved, the rate is renegotiated after a TONU. Each change is a new version the carrier accepts, and the version accepted before the event is the one an accessorial dispute reads; the documents are kept as exchanged in `documents`, and the priced lines become payable `freight_charges` with the confirmation as their source.

Confirmations are also a fraud surface: a criminal who intercepts or forges one can redirect the load or the payment. Highway sells "Secure Rate Con Delivery" for that reason, and [Freight Fraud & Cargo Theft](/books/logistics/freight-fraud) covers the controls.

## Pricing and Margin

A broker prices twice, on different clocks. The **sell** is a contract rate agreed with the shipper in a bid for months of volume on a lane, or a spot quote for one load that day; the **buy** is almost always a spot price for one carrier, negotiated when the load is covered. Contract sell rates go stale as the market moves while spot buy rates follow it daily, which is why broker margins compress when the market tightens and widen when it loosens. RXO's 2025 10-K says it directly: the market tightened in 2025, "with capacity rapidly exiting in certain regions driven primarily by regulatory changes and enforcement," which "caused buy rates to increase faster than our contractual sell rates." Its revenue less cost of transportation and services was about 19.7% of revenue in 2025 against about 21.6% in 2024 (my division of the filed figures, which include its managed transportation and last mile businesses).

The inputs to a buy price:

- **The market.** Lane benchmarks from rate data vendors (DAT iQ, Truckstop, Greenscreens) and the broker's own history on the lane, adjusted for day of week, lead time and equipment. [Freight Markets & Cycles](/books/logistics/freight-markets) covers the indexes.
- **The load.** Lead time (a same-day load costs more), stops, hours of loading, weight, hazmat, team requirement, appointment tightness, and whether the trailer can be dropped.
- **The carrier.** A carrier whose truck delivers near the pickup and wants to get home bids below the market; a carrier with no load back from the destination bids above it.
- **The margin target.** A floor per load in dollars or percent, sometimes by customer, approved above by a manager when the buy would go under it.

Margin is a number the system computes, never a field: receivable lines minus payable lines on the load, in the same currency, excluding void lines (the `load_margins` view in [The Core Data Model](/books/logistics/logistics-business#the-core-data-model)). A broker reports it per load, per customer, per lane, per carrier rep and per month, and each is a different grouping of the same lines. Two things make it slippery. Accessorials arrive after the fact and may be billable to the shipper, payable to the carrier, both or neither; a detention line paid to the carrier but not approved by the shipper is margin given away. And a quick pay fee is a payable line with a negative amount, which raises margin on the load, while a factor's fee is between the carrier and its factor and never touches the broker's books ([How the Money Splits](/books/logistics/logistics-business#how-the-money-splits)).

## The Broker's Record and Transparency

The current rule is short. A broker keeps a record of each transaction for three years, with the consignor's name and address, the originating carrier's name, address and registration number, the bill of lading or freight bill number, the broker's compensation for brokerage service and who paid it, any non-brokerage services with their fees and payers, and the freight charges it collected and the date it paid the carrier; and "each party to a brokered transaction has the right to review the record of the transaction" (49 CFR 371.3). The rule doesn't say how fast, in what form, or whether a carrier can sign the right away, and carrier groups petitioned FMCSA in 2020 for 48-hour delivery of the records and a ban on waiver clauses.

The proposal that followed, Transparency in Property Broker Transactions (89 FR 91648, November 20, 2024, RIN 2126-AC63), would:

- require the record to be kept "in an electronic format," in any system that meets 49 CFR 390.32;
- require the broker to "provide the records required to be maintained under Sec. 371.3(a) within 48 hours" of a party's request;
- fold non-brokerage services into one compensation line: "the amount of compensation received by the broker for each service performed in connection with each shipment," with the date of payment and the payer, and add any penalties assessed on the shipment;
- delete the definition of non-brokerage service from 371.2.

It would not ban waivers or confidentiality clauses: FMCSA declined the petitioners' request, reasoning that parties may generally waive rights unless Congress bars it, and framed access as the broker's regulatory obligation instead. Comments closed January 21, 2025 and were reopened for 30 days on February 18, 2025. As of November 22, 2026 the Federal Register shows no final rule, so the 2024 text is a proposal and the three-year rule is the law. <!-- source-gap: logistics-freight-brokerage-transparency-status | status | the broker transparency rule (RIN 2126-AC63) remains a proposal with no final rule | closes with: a final rule in the Federal Register or a withdrawal notice | checked: 2026-11-22 -->

A system built for the current rule can meet the proposed one with little change if it computes the record rather than assembling it by hand: every field the rule names is already a column or a sum over `freight_charges`, and the date the carrier was paid is a payment record. My rule is to build the 48-hour export now. It's cheap when the data is lines, it turns a carrier's request into a routine job rather than a legal event, and the record request itself (who asked, when, what was sent, when) is a record a broker will want if the proposal becomes final or a court asks.

## Negligent Selection After *Montgomery*

The case. Shawn Montgomery's tractor-trailer was struck by a truck hauling plastic pots through Illinois for Caribe Transport II, a motor carrier; C.H. Robinson had brokered the load. He sued the broker for negligently hiring a carrier that, he alleged, held a "conditional" safety rating from FMCSA with findings on driver qualification, hours of service, maintenance and crash rate. The district court and the Seventh Circuit held the claim preempted by the Federal Aviation Administration Authorization Act (FAAAA), which bars state law "related to a price, route, or service of any motor carrier ... with respect to the transportation of property" (49 U.S.C. 14501(c)(1)), following that circuit's 2023 *Ye v. GlobalTranz*; the Eleventh Circuit had reached the same result in *Aspen American Insurance v. Landstar Ranger*.

The holding. On May 14, 2026 the Supreme Court reversed, 9 to 0, in an opinion by Justice Barrett: "A claim that one company negligently hired another to transport goods is not preempted by the FAAAA because States retain authority to regulate safety 'with respect to motor vehicles'" (*Montgomery v. Caribe Transport II, LLC*, No. 24-1238, 608 U.S. ___). Even if the claim falls within the preemption clause, the safety exception, which says the clause "shall not restrict the safety regulatory authority of a State with respect to motor vehicles" (14501(c)(2)(A)), saves it: common-law duties of care are part of a state's safety authority, and "requiring C.H. Robinson to exercise ordinary care in selecting a carrier 'concerns' motor vehicles." State claims about broker prices, routes and services with no relationship to safety remain preempted. The case went back for proceedings on the merits; the Court did not set what reasonable care requires.

The concurrence. Justice Kavanaugh, joined by Justice Alito, called it a closer case than the opinion suggested, noted that federal law requires brokers "to select a federally registered carrier but does not otherwise 'impos[e] safety standards on broker hiring,'" and wrote that the decision "should not be read to mean that brokers will routinely be subject to state tort liability," because "brokers should be able to successfully defend against state tort suits if the brokers have acted reasonably," quoting plaintiff's counsel that a broker "is not going to have a problem if it's asking the hard questions of the carrier."

What it means for the records. The standard of care will be set state by state, jury by jury, and what a broker can show it checked is its defense. Three things follow:

- **The selection decision is evidence.** For every load, the system should be able to say which carrier was chosen, by whom or by which rule, under which version of the broker's carrier policy, and what that carrier's authority, insurance, safety rating and inspection record looked like at that moment, as returned by the source, not as it looks today.
- **The policy is evidence too.** Whether the broker accepts carriers with a Conditional rating, how it weighs unrated new entrants, which out-of-service rates it treats as disqualifying: a written, versioned policy applied consistently is what "acted reasonably" looks like in a record. The policy content is the broker's and its counsel's; [Carrier Onboarding & Vetting](/books/logistics/carrier-onboarding) covers what brokers check.
- **Overrides need reasons.** A rep who books a carrier the rules flagged, because the load had to move, leaves the most important record in the case. It needs an approver, a reason and a timestamp.

## How to Build It

The deltas against [The Core Data Model](/books/logistics/logistics-business#the-core-data-model) add the agreement, the confirmation and its versions, the per-load selection record and record requests, and mark what a load was:

```sql
ALTER TABLE loads
  ADD COLUMN arrangement       TEXT,                          -- which hat the owner wore
  ADD COLUMN customer_party_id UUID REFERENCES parties (id),  -- the shipper the broker sold to
  ADD COLUMN covered_at        TIMESTAMPTZ,                   -- when the carrier accepted
  ADD COLUMN covered_by        UUID;                          -- the rep or rule that covered it
ALTER TABLE loads ADD CONSTRAINT loads_arrangement_check
  CHECK (arrangement IN ('own_fleet', 'brokered', 'co_brokered', 'agent')) NOT VALID;
ALTER TABLE loads ADD CONSTRAINT loads_brokered_customer_check
  CHECK (arrangement IS DISTINCT FROM 'brokered' OR customer_party_id IS NOT NULL) NOT VALID;

CREATE TABLE broker_carrier_agreements (  -- the master contract, one row per signed version
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  broker_party_id     UUID NOT NULL REFERENCES parties (id),
  carrier_party_id    UUID NOT NULL REFERENCES parties (id),
  template_version    TEXT NOT NULL,       -- the broker's standard agreement it started from
  deviations          JSONB NOT NULL DEFAULT '{}',  -- negotiated clause changes, by clause key
  payment_terms_days  SMALLINT NOT NULL CHECK (payment_terms_days BETWEEN 0 AND 120),
  signed_by_name      TEXT NOT NULL,       -- the carrier's signer, as signed
  signed_at           TIMESTAMPTZ NOT NULL,
  valid_during        TSTZRANGE NOT NULL,
  document_id         UUID NOT NULL REFERENCES documents (id),  -- the signed copy
  status              TEXT NOT NULL CHECK (status IN ('active', 'superseded', 'terminated')),
  EXCLUDE USING gist (broker_party_id WITH =, carrier_party_id WITH =, valid_during WITH &&)
    WHERE (status <> 'superseded')
);

CREATE TABLE rate_confirmations (          -- one load, one carrier, one price, versioned
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  load_id             UUID NOT NULL REFERENCES loads (id),
  carrier_party_id    UUID NOT NULL REFERENCES parties (id),
  agreement_id        UUID NOT NULL REFERENCES broker_carrier_agreements (id),
  rate_agreement_id   UUID NOT NULL REFERENCES rate_agreements (id),  -- kind 'rate_confirmation'
  version             SMALLINT NOT NULL CHECK (version > 0),
  reason              TEXT NOT NULL CHECK (reason IN ('original', 'appointment_change',
                        'stop_change', 'accessorial_approved', 'rate_change', 'tonu',
                        'cancellation')),
  total_amount        BIGINT NOT NULL CHECK (total_amount >= 0),  -- what the version priced
  currency            CHAR(3) NOT NULL,
  terms_version       TEXT NOT NULL,       -- the confirmation terms printed with it
  sent_to             TEXT NOT NULL,       -- the verified contact it went to
  sent_at             TIMESTAMPTZ NOT NULL,
  accepted_at         TIMESTAMPTZ,
  acceptance_method   TEXT CHECK (acceptance_method IN ('e_signature', 'portal_click', 'api',
                        'deemed', 'pickup')),  -- 'deemed': silence past the terms' window
  document_id         UUID NOT NULL REFERENCES documents (id),
  UNIQUE (load_id, carrier_party_id, version)
);

ALTER TABLE freight_charges
  ADD COLUMN rate_confirmation_id UUID REFERENCES rate_confirmations (id);  -- payable lines' source

CREATE TABLE load_carrier_selections (     -- why this carrier, on this load, at this moment
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  load_id               UUID NOT NULL REFERENCES loads (id),
  carrier_party_id      UUID NOT NULL REFERENCES parties (id),
  policy_version        TEXT NOT NULL,     -- the broker's carrier policy that was applied
  outcome               TEXT NOT NULL CHECK (outcome IN ('eligible', 'eligible_with_warning',
                          'ineligible', 'overridden')),
  check_ids             UUID[] NOT NULL,   -- the registration, insurance and safety reads used
  failed_rules          TEXT[] NOT NULL DEFAULT '{}',
  decided_by_kind       TEXT NOT NULL CHECK (decided_by_kind IN ('user', 'rule', 'agent')),
  decided_by            TEXT NOT NULL,
  override_reason       TEXT,
  override_approved_by  UUID,
  decided_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (outcome <> 'overridden' OR (override_reason IS NOT NULL
                                     AND override_approved_by IS NOT NULL))
);

CREATE TABLE broker_record_requests (      -- a party asking for its 371.3 record
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  broker_party_id     UUID NOT NULL REFERENCES parties (id),
  requester_party_id  UUID NOT NULL REFERENCES parties (id),
  load_ids            UUID[] NOT NULL,
  received_at         TIMESTAMPTZ NOT NULL,
  due_at              TIMESTAMPTZ NOT NULL,  -- policy today; 48 hours if the proposal is final
  fulfilled_at        TIMESTAMPTZ,
  document_id         UUID REFERENCES documents (id),  -- the export as sent
  status              TEXT NOT NULL CHECK (status IN ('open', 'fulfilled', 'refused',
                        'withdrawn')),
  refusal_reason      TEXT,                -- e.g. requester was not a party to the load
  CHECK (status <> 'refused' OR refusal_reason IS NOT NULL)
);
```

The transaction record is a query, not a table, because every field it needs already exists:

```sql
CREATE VIEW broker_transaction_records AS  -- 49 CFR 371.3(a), per load
SELECT l.id AS load_id,
       l.owner_party_id AS broker_party_id,
       s.shipper_party_id AS consignor_party_id,
       l.carrier_party_id,
       c.usdot_number, c.docket_number,
       s.bol_number,
       m.currency,
       m.revenue, m.purchased_transportation,
       m.margin AS broker_compensation
FROM loads l
JOIN load_shipments ls ON ls.load_id = l.id
JOIN shipments s ON s.id = ls.shipment_id
LEFT JOIN carriers c ON c.party_id = l.carrier_party_id
LEFT JOIN load_margins m ON m.load_id = l.id
WHERE l.arrangement IN ('brokered', 'co_brokered');
```

The one field the view leaves out is the date the broker paid the carrier, which 371.3 also requires. It belongs to the payment record, not to the load; the export joins it by load from wherever payments are recorded ([Paying Carriers, Quick Pay & Factoring](/books/logistics/paying-carriers#how-to-build-it) defines that table), so the view stays valid on the core model alone.

Design notes:

- **The confirmation the carrier accepted is the price.** Payable charges point at the confirmation version that created them, and a new version supersedes, never edits. An accessorial approved after pickup is a new version, so the dispute about whether it was approved reads one row.
- **Deemed acceptance is still a record.** Where the broker's terms deem a confirmation accepted after 48 hours of silence, or on pickup, the system records the method and the moment, because "the carrier never agreed" is the first argument in a rate dispute.
- **Selection is captured when it happens.** `load_carrier_selections` points at the check rows read at the time ([Snapshot What Changes Underneath You](/docs/building-blocks/audit-trails#snapshot-what-changes-underneath-you)); a broker that re-runs checks today to show what was true in March shows nothing.
- **The policy is data.** The rules a selection applies (rating, authority age, insurance limits by commodity) are versioned rows, and each selection records the version ([Record Which Rule Decided](/docs/building-blocks/rules-as-data#record-which-rule-decided)).
- **Margin is enforced at cover.** The check that a buy keeps the load above its floor runs when the confirmation is sent, against the current receivable lines, and an exception is an approval with a reason.

The cover step, which every broker TMS has in some form: check the floor, check the selection, version the confirmation.

```go tab="Go"
type CoverRequest struct {
	LoadID     uuid.UUID
	CarrierID  uuid.UUID
	BuyMinor   int64 // the confirmation total, minor units
	Currency   string
	ApprovedBy *uuid.UUID // a manager, when the buy breaks the floor
}

var ErrBelowFloor = errors.New("buy rate below margin floor without approval")
var ErrIneligible = errors.New("carrier not eligible under current policy")

func (s *Service) Cover(ctx context.Context, r CoverRequest) (RateConfirmation, error) {
	return s.tx(ctx, func(q *Queries) (RateConfirmation, error) {
		sell, err := q.ReceivableTotal(ctx, r.LoadID, r.Currency)
		if err != nil {
			return RateConfirmation{}, err
		}
		floor, err := q.MarginFloor(ctx, r.LoadID) // minor units, from the customer's terms
		if err != nil {
			return RateConfirmation{}, err
		}
		if sell-r.BuyMinor < floor && r.ApprovedBy == nil {
			return RateConfirmation{}, ErrBelowFloor
		}
		sel, err := s.selector.Decide(ctx, q, r.LoadID, r.CarrierID) // writes load_carrier_selections
		if err != nil {
			return RateConfirmation{}, err
		}
		if sel.Outcome == "ineligible" {
			return RateConfirmation{}, ErrIneligible
		}
		return q.InsertRateConfirmation(ctx, r.LoadID, r.CarrierID, r.BuyMinor, r.Currency)
	})
}
```

```rust tab="Rust"
pub struct CoverRequest {
    pub load_id: Uuid,
    pub carrier_id: Uuid,
    pub buy_minor: i64, // the confirmation total, minor units
    pub currency: String,
    pub approved_by: Option<Uuid>, // a manager, when the buy breaks the floor
}

#[derive(Debug, thiserror::Error)]
pub enum CoverError {
    #[error("buy rate below margin floor without approval")]
    BelowFloor,
    #[error("carrier not eligible under current policy")]
    Ineligible,
    #[error(transparent)]
    Db(#[from] sqlx::Error),
}

pub async fn cover(svc: &Service, r: CoverRequest) -> Result<RateConfirmation, CoverError> {
    let mut tx = svc.pool.begin().await?;
    let sell = receivable_total(&mut tx, r.load_id, &r.currency).await?;
    let floor = margin_floor(&mut tx, r.load_id).await?; // minor units
    if sell - r.buy_minor < floor && r.approved_by.is_none() {
        return Err(CoverError::BelowFloor);
    }
    let sel = svc.selector.decide(&mut tx, r.load_id, r.carrier_id).await?; // records the decision
    if sel.outcome == Outcome::Ineligible {
        return Err(CoverError::Ineligible);
    }
    let rc = insert_rate_confirmation(&mut tx, r.load_id, r.carrier_id, r.buy_minor, &r.currency)
        .await?;
    tx.commit().await?;
    Ok(rc)
}
```

Emit `load.covered`, `rate_confirmation.sent`, `rate_confirmation.accepted` and `carrier_selection.overridden` ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)); tracking, billing and the compliance team's override review subscribe to them.

## Auditing

- **The contracts in force on the load's date.** The master agreement version, the confirmation versions with their acceptance method and time, and the terms printed with each.
- **The selection.** Per load, the policy version, the checks read with their responses, the outcome, and every override with its approver and reason. This is the record a negligent selection suit asks for.
- **The 371.3 record.** Computable for any load for three years, with the export sent for each request and its timing.
- **Margin, line by line.** Every receivable and payable charge, its source (contract, confirmation version, carrier invoice) and every void with its reason.
- **Status statements.** Every shipper-facing document names the broker as a broker (371.7).

The mechanics are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Record what a load was,** brokered or on the company's own trucks, because registration, insurance, records and revenue all follow it.
- **Keep two layers of contract,** the signed master agreement version and the per-load confirmation, and price payables from the confirmation version the carrier accepted.
- **Version every confirmation change** and record how it was accepted, deemed acceptance included.
- **Compute margin from lines,** and enforce the floor when the carrier is covered, with approvals for exceptions.
- **Capture the carrier selection decision at the moment it's made,** with the policy version and the checks it read, and require a reason and an approver for every override.
- **Build the 371.3 record as a query and its export as a routine job,** so a 48-hour clock, if it comes, is a configuration change.
- **Track the transparency rule as a proposal** until the Federal Register says otherwise.

## References

**Statutes and regulations**

- [49 U.S.C. 13102: Definitions](https://www.law.cornell.edu/uscode/text/49/13102), broker, freight forwarder, motor carrier and motor vehicle
- [49 U.S.C. 14501: Federal authority over intrastate transportation](https://www.law.cornell.edu/uscode/text/49/14501), the FAAAA preemption clause and its safety exception
- [49 U.S.C. 14916: Unlawful brokerage activities](https://www.law.cornell.edu/uscode/text/49/14916), registration and security requirement, the $10,000 penalty, private recovery and personal liability
- [49 CFR 371.2: Definitions](https://www.law.cornell.edu/cfr/text/49/371.2), broker, bona fide agent, brokerage and non-brokerage service
- [49 CFR 371.3: Records to be kept by brokers](https://www.law.cornell.edu/cfr/text/49/371.3), the record's contents, three-year retention and the right to review
- [49 CFR 371.7: Misrepresentation](https://www.law.cornell.edu/cfr/text/49/371.7), the registered name and broker status in advertising
- [49 CFR 371.9: Rebating and compensation](https://www.law.cornell.edu/cfr/text/49/371.9), compensation on controlled freight and gifts to shippers
- [49 CFR 387.307: Property broker surety bond or trust fund](https://www.law.cornell.edu/cfr/text/49/387.307), $75,000 and Forms BMC-84 and BMC-85

**Federal Register**

- [Transparency in Property Broker Transactions, proposed rule (89 FR 91648, November 20, 2024)](https://www.govinfo.gov/content/pkg/FR-2024-11-20/html/2024-27115.htm), electronic records, 48-hour delivery, compensation per service, and no waiver ban
- [Federal Register API: FMCSA broker transparency documents](https://www.federalregister.gov/api/v1/documents.json?conditions[term]=broker%20transparency&conditions[agencies][]=federal-motor-carrier-safety-administration&order=newest), the February 18, 2025 reopening and no final rule as of November 22, 2026
- [Definitions of Broker and Bona Fide Agents, final guidance (June 16, 2023)](https://www.govinfo.gov/content/pkg/FR-2023-06-16/html/2023-13080.htm), dispatch services, handling money and publishing loads

**Courts**

- [Montgomery v. Caribe Transport II, LLC, No. 24-1238 (May 14, 2026)](https://www.supremecourt.gov/opinions/25pdf/24-1238_1b7d.pdf), the facts, the holding, the unanimous vote and the Kavanaugh concurrence

**Filings**

- [C.H. Robinson Worldwide: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1043277/000104327726000009/chrw-20251231.htm), revenue, shipments, providers and gross revenue recognition
- [RXO: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1929561/000192956126000013/rxo-20251231.htm), revenue, the Coyote acquisition, customer concentration, RXO Connect, buy rates rising faster than sell rates, and net recognition where it doesn't control the service
- [Uber Technologies: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1543151/000154315126000015/uber-20251231.htm), Freight revenue, Adjusted EBITDA and gross presentation

**Brokers**

- [Arrive Logistics: Rate confirmation terms and conditions](https://www.arrivelogistics.com/temporary-rate-confirmation-terms-and-conditions/), precedence over the agreement, deemed acceptance, re-brokering forfeiture, detention notice, discrepancy reporting and payment documents
- [Flock Freight: Broker-carrier agreement](https://www.flockfreight.com/resources/broker-carrier-agreement), status, insurance, safety rating, re-brokering, Carmack, payment, factoring notice, non-solicitation and term
- [C.H. Robinson: Carrier FAQ](https://www.chrobinson.com/en/Carriers/FAQ/), carrier requirements, Highway certificates, the 2.0% quick pay fee, factoring by Triumph and Navisphere Carrier
- [TQL: Carrier vetting](https://www.tql.com/carrier-vetting), requirements, agent-verified insurance, conditional ratings and the 18% disqualification rate
- [Highway](https://highway.com/), Secure Rate Con Delivery
