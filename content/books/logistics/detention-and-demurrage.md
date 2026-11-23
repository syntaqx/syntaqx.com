+++
title = "Detention & Demurrage"
description = "Charges for time with an ocean container: free time, OSRA 2022, the FMC billing rule after the 541.4 ruling, the incentive principle and disputes."
category = "Logistics & Supply Chain Industry"
order = 2813
part = "Ocean and Air"
tags = ["logistics", "ocean", "demurrage", "detention", "fmc", "osra", "billing", "data-model"]
+++

Demurrage and detention are what an ocean container costs once the free time runs out. Demurrage is charged while a loaded import box sits in the marine terminal after its free days, or an export box arrives too early; detention, often called per diem, is charged while the carrier's container is outside the terminal, at the importer's warehouse or on the trucker's chassis, past its free days. The FMC's regulation defines both together as "any charges, including 'per diem' charges, assessed by ocean common carriers, marine terminal operators, or non-vessel-operating common carriers related to the use of marine terminal space (e.g., land) or shipping containers, but not including freight charges" (46 CFR 541.3). The nine large carriers that report to the FMC collected "roughly $15.4 billion in D&D charges between April 1, 2020, and March 31, 2025."

The software is hard because each charge is a computation over facts that several parties hold and none controls. The free time and daily rates come from the carrier's tariff or the shipper's service contract; the clock starts on a date the terminal sets (when the box is available), pauses for holds some carriers excuse and others don't, skips days the terminal or depot was shut, and stops on a gate event the trucker's receipt proves; the invoice may come from the carrier, the terminal or the NVOCC that booked the box, and since OSRA 2022 an invoice that omits required information, or arrives more than 30 days after the charge was last incurred, need not be paid. This chapter covers free time and how the clocks run, the statute and the FMC's billing rule (with the 2025 ruling that vacated its section on who may be billed), the incentive principle the FMC applies to reasonableness, disputes and charge complaints, and the records that let a billed party check every line. It extends `freight_charges`, `equipment_units` and `shipment_events` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model); the gate events, interchange receipts, per diem under the trucking interchange agreement and the nightly free-time count are [Intermodal & Drayage](/books/logistics/intermodal-and-drayage#per-diem-detention-and-storage), rail demurrage is [Rail Freight](/books/logistics/rail-freight#demurrage-under-49-cfr-1333), and trucking detention at a shipper's dock is [Rating, Tariffs & Accessorials](/books/logistics/rating-and-accessorials).

## How the Regulators and Carriers Do It

As of November 2026, the rules a billing system and a billed party's audit both implement:

| Source | Applies to | What it sets |
| --- | --- | --- |
| **46 U.S.C. 41104(a)(15), (d) and (f)** (OSRA 2022, signed June 16, 2022) | Common carriers | A D&D invoice must carry the information subsection (d) lists, among it the "date that container is made available" and "a statement that the common carrier's performance did not cause or contribute to the underlying invoiced charges"; failure "shall eliminate any obligation of the charged party to pay the applicable charge" |
| **46 U.S.C. 41310** (charge complaints) | Any person, against common carriers | The FMC must accept and investigate information about a charge; the carrier must "bear the burden of establishing the reasonableness" of D&D charges; noncompliant charges are refunded and penalized |
| **46 CFR 541** (final rule February 2024, fully effective May 28, 2024) | Invoices from ocean common carriers, marine terminal operators and NVOCCs | Minimum invoice contents (541.6), issuance within 30 calendar days (541.7), at least 30 days for the billed party to ask for mitigation, refund or waiver and 30 days to resolve (541.8); 541.4, on who may be billed, set aside by the D.C. Circuit on September 23, 2025 and removed from the CFR on December 29, 2025 |
| **46 CFR 545.5** (interpretive rule, May 18, 2020) | Ocean common carriers, marine terminal operators and OTIs | The "incentive principle": whether a charge still serves as a financial incentive that promotes "freight fluidity," applied to cargo availability, empty returns, notice and government inspections |
| **FMC data collection** | CMA CGM, COSCO, Evergreen, Hapag-Lloyd, HMM, Maersk, MSC, ONE and Yang Ming | Quarterly D&D billed, collected and waived; billings fell 24% and collections 19% quarter on quarter in the first quarter of 2025, with waivers up 7% |
| **Hapag-Lloyd US D&D guide** (May 2026) | Hapag-Lloyd's US imports and exports | Charges on "a calendar / continuous day basis after free time has expired"; bank holidays and shutout days excluded from free time, and after it shutout days not charged while bank holidays are; the clock stopped during a customs hold "for no fault of the customer"; no carrier haulage demurrage when the merchant meets stated conditions |

Three patterns:

- **The invoice is now the evidence.** OSRA moved the burden onto the billing party: the invoice must show the containers, the dates the clock started and stopped, the rule and rate applied, and a certification that the carrier's own performance didn't cause the charge, and a missing element cancels the debt. A billing system that can't produce every 541.6 field for every line is producing invoices that need not be paid.
- **Carriers excuse what they caused, by policy.** Hapag-Lloyd's guide excludes unscheduled terminal closures from charges as "unforeseen shutout days," excludes bank holidays from free time, and pauses the clock during customs holds that aren't the customer's fault, describing this as complying "with the incentive principle." Each carrier writes these rules differently, which is why they are data per carrier and per date, not code.
- **The billed party is a fact to be justified.** With 541.4 gone, the regulation no longer limits whom a carrier may invoice, but 541.6(a) still requires the invoice to state why the billed party "is the proper party of interest and therefore liable." The system has to know the contract chain (who booked, under which bill, on whose account) to state or test that reason.

## Free Time

Free time is the number of days the container or the terminal space is free before charges start, set by the carrier's tariff or the service contract and different for imports and exports, dry and reefer boxes, ports and inland points. The billing party's terms decide four things the computation needs:

- **When the clock starts.** For import demurrage, the container's availability for pickup after discharge (each tariff says whether the availability day itself is a free day), which is why 541.6(b) requires "the container availability date" on every import invoice; for export demurrage, a gate-in before the earliest return date; for detention, the out-gate from the terminal or ramp.
- **What counts as a day.** Calendar days, working days, or days the relevant gate is open. Hapag-Lloyd counts calendar days after free time expires; within free time it excludes bank holidays (planned port-wide closures) and shutout days (strikes, severe weather, holidays only some terminals observe), extending free time by each one, and after free time it charges bank holidays but not shutout days.
- **What stops the clock.** A customs hold through no fault of the customer, under Hapag-Lloyd's policy, stops the line demurrage or detention clock and restarts it on release; held inside the terminal, the hold and release dates and every day between don't count toward free time, though the terminal's own storage charges for those days stay the customer's.
- **Who is charged under carrier haulage.** When the carrier arranges the inland move (store-door delivery), Hapag-Lloyd charges no line demurrage or marine terminal storage at the port if the delivery order is submitted five days before the vessel arrives, customs clearance, payment and any original bill are in five days before free time at the discharge port expires, and the consignee gives an appointment within 48 hours of the carrier's trucker calling; the inland version keys the same conditions to five days before the box gates in at the inland terminal. It invoices detention under carrier haulage to the consignee.

The days after free time are priced in tiers, a daily rate for the first block of days and higher rates for later blocks, per equipment type. The free days, tiers and day-counting rules are versioned terms per billing party and per date, which [Intermodal & Drayage](/books/logistics/intermodal-and-drayage#how-to-build-it) stores as `equipment_free_time_terms` (`terminal_demurrage` and `per_diem` for the two ocean charges); this chapter's computation reads them, adds the clock rules a carrier's guide states (holds that stop the clock, how holidays and shutout days count inside and after free time), and stores which version decided each line ([Record Which Rule Decided](/docs/building-blocks/rules-as-data#record-which-rule-decided)).

A worked import, with Hapag-Lloyd's day rules and illustrative free days and rates:

| Fact | Value |
| --- | --- |
| Vessel discharge | Thursday, March 5, 2026 |
| Container available for pickup | Friday, March 6 (the availability date) |
| Free time, demurrage (illustrative) | 4 days: March 6 to March 9 |
| Customs hold, no fault of the customer | Placed March 8, released March 10 (hold and release days and the day between don't count) |
| Free time, as extended | March 6, 7, then March 11 and 12 |
| Out-gate | Monday, March 16 |
| Chargeable demurrage days | March 13, 14, 15, 16: 4 days |
| Rate (illustrative tiers) | Days 1 to 4 at $150: $600.00 |
| Last day incurred | March 16 |
| Latest conforming invoice date | April 15, 2026 (30 calendar days) |

The terminal's storage for March 8 to 10 is billed separately, by the terminal or passed through by the carrier, and has its own invoice. Whether the out-gate day counts as a full day is a term of the tariff, which is why the line must show "the specific date or dates for which demurrage and/or detention were charged" (541.6(b)) rather than only a count.

## The Billing Rule

OSRA 2022 made D&D billing a statutory matter: a common carrier may not invoice D&D unless the invoice carries the information subsection (d) lists "showing that such charges comply with" the FMC's rules, including 46 CFR 545 (46 U.S.C. 41104(a)(15)), and a noncompliant invoice "shall eliminate any obligation of the charged party to pay" (41104(f)). The FMC's rule, 46 CFR 541, followed on February 26, 2024 and became fully effective on May 28, 2024, after the contents section waited for Paperwork Reduction Act approval; invoices issued from that date "must be fully compliant."

It applies to "any invoice issued by an ocean common carrier, marine terminal operator, or non-vessel-operating common carrier for the collection of demurrage or detention charges," and not to billing "among and between ocean common carriers and marine terminal operators" (541.2). The billing party is whichever of those issues the invoice; the billed party is "the person receiving the demurrage or detention invoice" who "is responsible for the payment" (541.3). A failure to include any required minimum information "eliminates any obligation of the billed party to pay the applicable charge" (541.5).

The minimum contents, by paragraph of 541.6:

| Paragraph | Information |
| --- | --- |
| (a) Identifying | Bill of lading number(s); container number(s); for imports, port(s) of discharge; the basis for why the billed party is "the proper party of interest and therefore liable" |
| (b) Timing | Invoice date; invoice due date; allowed free time in days; start and end dates of free time; for imports, the container availability date; for exports, the earliest return date; "the specific date or dates for which demurrage and/or detention were charged" |
| (c) Rate | Total amount due; the applicable rule (tariff name and rule number, terminal schedule, service contract number and section, or negotiated arrangement); the specific rate or rates |
| (d) Dispute | An email, phone number or other contact; a digital means "such as a URL address, QR code, or digital watermark" leading to a public page that lists what a request needs; defined timeframes to submit and to resolve a request |
| (e) Certifications | That the charges are consistent with 46 CFR 541 and 545.5, and that "the billing party's performance did not cause or contribute to the underlying invoiced charges" |

Timing, under 541.7: the billing party must invoice "within thirty (30) calendar days" of the date the charge was last incurred, or the billed party need not pay. An NVOCC passing through a carrier's charge has 30 days from the issuance date of the invoice it received. An NVOCC billed and billing for the same charge can tell its own billing party that its customer disputed the charge, which gives the NVOCC an additional 30 days to dispute it in turn. A billing party that invoiced the wrong person may invoice the right one, but only within 30 days of the charge being last incurred. Under 541.8, the billing party must allow the billed party "at least thirty (30) calendar days from the invoice issuance date" to request mitigation, refund or waiver, and "must attempt to resolve the request within thirty (30) calendar days" of receiving it, unless both agree to longer.

## Who May Be Billed

Section 541.4 limited D&D invoices to the person for whose account the carrier or terminal provided the transportation or storage and who contracted for it, or to the consignee. On September 23, 2025, the U.S. Court of Appeals for the D.C. Circuit, in the World Shipping Council's challenge, set that section aside; the FMC announced on November 20, 2025 that "apart from section 541.4, the rest of the Rule remains in effect," that carriers and terminals "must continue to follow these requirements," that the decision doesn't prevent it from addressing invoice recipients in a future rulemaking, and that the court indicated it could keep its policy with a fuller explanation. The FMC removed the section by a final rule published December 29, 2025 (90 FR 60579), and the current regulation shows 541.4 as reserved.

For the systems on both sides, the practical change is small and the record-keeping change is none. Billing parties may invoice the shipper, the consignee or, in practice, the trucker in interchange, but every invoice must still state the basis on which the billed party is liable (541.6(a)), a wrongly billed party can still be re-invoiced only inside the 30-day window (541.7), and the charge must still pass the incentive principle. As of November 22, 2026, the FMC's demurrage and detention documents in the Federal Register since the removal are complaint notices and a charge complaint procedure rule, with no proposed rule on invoice recipients.

## The Incentive Principle

The FMC's interpretive rule asks whether D&D practices are "serving their intended primary purposes as financial incentives to promote freight fluidity," and applies the test to four situations (46 CFR 545.5(c)): cargo availability (whether demurrage and free time are tied to when the cargo can actually be retrieved), empty container return (detention when the empty can't be returned, for example because no depot will accept it, is likely unreasonable absent extenuating circumstances), notice of availability (its type, recipients, format, timing and effect), and government inspections. It also weighs whether a carrier's D&D policies are accessible and clear, its dispute process (contacts, timeframes, what corroboration it demands), and whether its terms are clearly defined (545.5(d) and (e)). In a charge complaint the carrier carries the burden of showing the charge was reasonable under 545.5 (46 U.S.C. 41310).

The evidence each situation needs is a dated fact the billed party has to hold, not argue from memory:

| Situation | Evidence the billed party keeps |
| --- | --- |
| Cargo not available | The availability date the carrier or terminal published, each change to it, holds and releases with their times |
| No appointment available | The terminal's appointment search results or the missed slot, with the time it was sought |
| Empty can't be returned | The depot's refusal, a closed or full return location, the carrier's return instruction and its time |
| Inspection hold | The CBP or partner agency hold and release messages |
| Late or missing notice | When the arrival notice and availability notice were received, and by whom |

These are `shipment_events` rows (`available`, `hold`, `customs_released`, `gate_out`, `gate_in`), `equipment_interchanges` and `terminal_appointments` outcomes from [Intermodal & Drayage](/books/logistics/intermodal-and-drayage#how-to-build-it), and documents (the arrival notice, the depot's refusal). Kept with event time and received time separately, they let a dispute say not only what happened but when the billed party learned it ([Two Kinds of Time](/docs/database/temporal-data#two-kinds-of-time)).

## Disputes and Charge Complaints

A billed party's audit runs the same computation the billing party should have run, line by line, and checks the invoice against the rule:

1. **Conformance.** Every 541.6 element present, the invoice issued within 30 days of the last day charged (or of the invoice an NVOCC received), and the dispute window offered at least 30 days. A failure here ends the matter without arguing the days.
2. **Computation.** The free time and tiers in force on the governing date, the clock start from the availability date or out-gate, the excused days under the billing party's own published rules, and the stop from the interchange receipt. A difference in days or rate becomes a disputed line.
3. **Reasonableness.** Where the computation matches but the days were caused by the carrier's or terminal's performance (no availability, no return location, an inspection), a request for waiver with the evidence.

The dispute goes to the contact and through the process the invoice names, inside its window; the billing party must attempt to resolve it in 30 days. If it doesn't, any person may submit the charge to the FMC as a charge complaint with "bill of lading numbers and invoices" and other relevant information; the FMC must investigate, the carrier bears the burden of showing reasonableness, and a noncompliant charge is refunded with a civil penalty (46 U.S.C. 41310). Since a final rule of September 1, 2026 (91 FR 56053), a charge complaint may instead be filed through the FMC's traditional complaint process, before an administrative law judge or a small claims officer, where the carrier still bears the burden of showing its charges reasonable under 545.5. When an NVOCC passed the charge through, the FMC considers whether the NVOCC or another party is responsible, and the statute protects an NVOCC that only passed through an ocean carrier's invoice (41104(e)).

The conformance check is mechanical, and it should run on every D&D invoice the moment it arrives:

```go tab="Go"
type DDInvoice struct {
	IssuedOn         time.Time
	DueOn            time.Time
	BillNumbers      []string
	ContainerNumbers []string
	DischargePorts   []string // imports
	LiabilityBasis   string   // why the billed party is the proper party
	FreeDays         *int
	FreeTimeStart    *time.Time
	FreeTimeEnd      *time.Time
	AvailableOn      *time.Time // imports
	EarliestReturnOn *time.Time // exports
	ChargedDates     []time.Time
	Total            int64 // minor units
	RuleReference    string
	Rates            []int64
	DisputeContact   string
	DisputeURL       string
	SubmitWindowDays int
	CertifiesRules   bool
	CertifiesNoFault bool
	Import           bool
	// For an NVOCC pass-through: when the invoice it received was issued.
	UpstreamIssuedOn *time.Time
}

// Nonconformities returns the reasons the billed party has no obligation to pay.
// An empty result means the invoice conforms on its face; the days still need auditing.
func Nonconformities(inv DDInvoice) []string {
	var out []string
	need := func(ok bool, what string) {
		if !ok {
			out = append(out, what)
		}
	}
	need(len(inv.BillNumbers) > 0, "541.6(a): bill of lading number")
	need(len(inv.ContainerNumbers) > 0, "541.6(a): container number")
	need(!inv.Import || len(inv.DischargePorts) > 0, "541.6(a): port of discharge")
	need(inv.LiabilityBasis != "", "541.6(a): basis for the billed party's liability")
	need(inv.FreeDays != nil && inv.FreeTimeStart != nil && inv.FreeTimeEnd != nil,
		"541.6(b): free time and its start and end")
	need(!inv.Import || inv.AvailableOn != nil, "541.6(b): container availability date")
	need(inv.Import || inv.EarliestReturnOn != nil, "541.6(b): earliest return date")
	need(len(inv.ChargedDates) > 0, "541.6(b): dates charged")
	need(inv.RuleReference != "" && len(inv.Rates) > 0, "541.6(c): rule and rates")
	need(inv.DisputeContact != "" && inv.DisputeURL != "", "541.6(d): dispute contact and link")
	need(inv.CertifiesRules && inv.CertifiesNoFault, "541.6(e): certifications")
	need(inv.SubmitWindowDays >= 30, "541.8(a): at least 30 days to request mitigation")

	if len(inv.ChargedDates) > 0 {
		last := inv.ChargedDates[0]
		for _, d := range inv.ChargedDates {
			if d.After(last) {
				last = d
			}
		}
		from := last
		if inv.UpstreamIssuedOn != nil { // NVOCC: 30 days from the invoice it received
			from = *inv.UpstreamIssuedOn
		}
		need(!inv.IssuedOn.After(from.AddDate(0, 0, 30)), "541.7: issued more than 30 days late")
	}
	return out
}
```

```rust tab="Rust"
use chrono::{Duration, NaiveDate};

pub struct DdInvoice {
    pub issued_on: NaiveDate,
    pub import: bool,
    pub bill_numbers: Vec<String>,
    pub container_numbers: Vec<String>,
    pub discharge_ports: Vec<String>,
    pub liability_basis: Option<String>,
    pub free_days: Option<u16>,
    pub free_time: Option<(NaiveDate, NaiveDate)>,
    pub available_on: Option<NaiveDate>,
    pub earliest_return_on: Option<NaiveDate>,
    pub charged_dates: Vec<NaiveDate>,
    pub rule_reference: Option<String>,
    pub rates: Vec<i64>, // minor units per day
    pub dispute_contact: Option<String>,
    pub dispute_url: Option<String>,
    pub submit_window_days: u16,
    pub certifies_rules: bool,
    pub certifies_no_fault: bool,
    /// For an NVOCC pass-through: when the invoice it received was issued.
    pub upstream_issued_on: Option<NaiveDate>,
}

/// Reasons the billed party has no obligation to pay; empty means it conforms on its face.
pub fn nonconformities(inv: &DdInvoice) -> Vec<&'static str> {
    let mut out = Vec::new();
    let mut need = |ok: bool, what: &'static str| if !ok { out.push(what) };
    need(!inv.bill_numbers.is_empty(), "541.6(a): bill of lading number");
    need(!inv.container_numbers.is_empty(), "541.6(a): container number");
    need(!inv.import || !inv.discharge_ports.is_empty(), "541.6(a): port of discharge");
    need(inv.liability_basis.is_some(), "541.6(a): basis for the billed party's liability");
    need(inv.free_days.is_some() && inv.free_time.is_some(), "541.6(b): free time and its dates");
    need(!inv.import || inv.available_on.is_some(), "541.6(b): container availability date");
    need(inv.import || inv.earliest_return_on.is_some(), "541.6(b): earliest return date");
    need(!inv.charged_dates.is_empty(), "541.6(b): dates charged");
    need(inv.rule_reference.is_some() && !inv.rates.is_empty(), "541.6(c): rule and rates");
    need(inv.dispute_contact.is_some() && inv.dispute_url.is_some(), "541.6(d): dispute contact and link");
    need(inv.certifies_rules && inv.certifies_no_fault, "541.6(e): certifications");
    need(inv.submit_window_days >= 30, "541.8(a): at least 30 days to request mitigation");
    if let Some(last) = inv.charged_dates.iter().max() {
        let from = inv.upstream_issued_on.unwrap_or(*last); // NVOCC: from the invoice it received
        need(inv.issued_on <= from + Duration::days(30), "541.7: issued more than 30 days late");
    }
    out
}
```

The 30 days are calendar days on dates, so the check works on dates in the billing location's calendar, not on instants; the result and the rule version that produced it are stored with the invoice ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).

## How to Build It

A D&D line is a `freight_charges` row of kind `demurrage` or `per_diem`, payable when the system is the billed party and receivable when it bills (an NVOCC is often both for the same box). What D&D adds is the invoice as the FMC defines it, with its 541.6 fields, its lines per container and date range, the computation the billed party ran, and the dispute. The clocks read `shipment_events` (`available`, `hold`, `customs_released`, `gate_out`, `gate_in`), the interchange receipts and the versioned free-time terms that [Intermodal & Drayage](/books/logistics/intermodal-and-drayage#how-to-build-it) defines as `equipment_interchanges` and `equipment_free_time_terms`, and links each line to the receipts and terms it used:

```sql
CREATE TABLE detention_demurrage_invoices (  -- a D&D invoice, sent or received, as 541.6 defines it
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  side                 TEXT NOT NULL CHECK (side IN ('receivable', 'payable')),
  billing_party_id     UUID NOT NULL REFERENCES parties (id),
  billing_party_kind   TEXT NOT NULL CHECK (billing_party_kind IN ('ocean_common_carrier',
                         'marine_terminal_operator', 'nvocc')),
  billed_party_id      UUID NOT NULL REFERENCES parties (id),
  number               TEXT NOT NULL,
  charge_kind          TEXT NOT NULL CHECK (charge_kind IN ('demurrage', 'detention',
                         'combined')),
  direction            TEXT NOT NULL CHECK (direction IN ('import', 'export')),
  issued_on            DATE NOT NULL,
  due_on               DATE NOT NULL,
  received_at          TIMESTAMPTZ,      -- payable side: when it was received
  bill_numbers         TEXT[] NOT NULL,
  discharge_ports      CHAR(5)[] NOT NULL DEFAULT '{}',  -- UN/LOCODEs, imports
  liability_basis      TEXT,             -- 541.6(a): why the billed party is liable
  rule_reference       TEXT,             -- tariff rule, service contract section or NRA
  dispute_contact      TEXT,
  dispute_url          TEXT,             -- the 541.6(d) digital pointer
  submit_window_days   SMALLINT,         -- as stated on the invoice
  resolve_window_days  SMALLINT,
  certifies_rules      BOOLEAN NOT NULL DEFAULT FALSE,  -- 541 and 545.5
  certifies_no_fault   BOOLEAN NOT NULL DEFAULT FALSE,
  upstream_invoice_id  UUID REFERENCES detention_demurrage_invoices (id),  -- NVOCC pass-through
  currency             CHAR(3) NOT NULL,
  stated_total         BIGINT NOT NULL CHECK (stated_total >= 0),
  conformance          JSONB,            -- the nonconformities found, with the rule version used
  status               TEXT NOT NULL CHECK (status IN ('draft', 'issued', 'received',
                         'nonconforming', 'in_audit', 'approved', 'disputed', 'paid',
                         'waived', 'void')),
  freight_invoice_id   UUID REFERENCES freight_invoices (id),  -- when it also travels as a freight invoice
  document_id          UUID REFERENCES documents (id),
  UNIQUE (side, billing_party_id, number),
  CHECK (due_on >= issued_on)
);

CREATE TABLE detention_demurrage_invoice_lines (  -- one container, one date range, one rate
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  dd_invoice_id          UUID NOT NULL REFERENCES detention_demurrage_invoices (id),
  equipment_id           UUID NOT NULL REFERENCES equipment_units (id),
  container_number       TEXT NOT NULL,    -- as printed
  free_days              SMALLINT NOT NULL CHECK (free_days >= 0),
  free_time_start_on     DATE NOT NULL,
  free_time_end_on       DATE NOT NULL,
  available_on           DATE,             -- imports
  earliest_return_on     DATE,             -- exports
  charged_dates          DATE[] NOT NULL,  -- the specific dates, not just a count
  daily_rates            BIGINT[] NOT NULL,  -- minor units, one per charged date
  amount                 BIGINT NOT NULL CHECK (amount >= 0),
  computed_dates         DATE[],           -- payable side: the billed party's own computation
  computed_amount        BIGINT,
  free_time_terms_id     UUID REFERENCES equipment_free_time_terms (id),  -- the version applied
  start_interchange_id   UUID REFERENCES equipment_interchanges (id),  -- detention: the out-gate
  stop_interchange_id    UUID REFERENCES equipment_interchanges (id),  -- the gate that stopped it
  CHECK (cardinality(charged_dates) = cardinality(daily_rates)),
  CHECK (free_time_end_on >= free_time_start_on)
);

CREATE TABLE detention_demurrage_disputes (  -- a request for mitigation, refund or waiver
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  dd_invoice_id     UUID NOT NULL REFERENCES detention_demurrage_invoices (id),
  dd_invoice_line_id UUID REFERENCES detention_demurrage_invoice_lines (id),  -- null: whole invoice
  ground            TEXT NOT NULL CHECK (ground IN ('nonconforming_invoice', 'late_invoice',
                      'wrong_party', 'computation', 'cargo_not_available',
                      'no_appointment', 'empty_not_returnable', 'government_hold',
                      'notice', 'other')),
  requested_amount  BIGINT NOT NULL CHECK (requested_amount >= 0),
  submitted_at      TIMESTAMPTZ NOT NULL,
  submit_by         DATE NOT NULL,       -- issued_on plus the window offered
  resolve_by        DATE NOT NULL,       -- 30 days after submission unless extended by agreement
  passed_upstream_at TIMESTAMPTZ,        -- NVOCC told its billing party (541.7(c))
  evidence          UUID[] NOT NULL DEFAULT '{}',  -- documents and shipment_events ids
  outcome           TEXT CHECK (outcome IN ('granted', 'partly_granted', 'denied',
                      'withdrawn', 'charge_complaint_filed')),
  outcome_amount    BIGINT,
  resolved_at       TIMESTAMPTZ,
  CHECK (submitted_at::date <= submit_by)
);

ALTER TABLE freight_charges
  ADD COLUMN dd_invoice_line_id UUID;
ALTER TABLE freight_charges ADD CONSTRAINT freight_charges_dd_invoice_line_fkey
  FOREIGN KEY (dd_invoice_line_id) REFERENCES detention_demurrage_invoice_lines (id) NOT VALID;
ALTER TABLE freight_charges ADD CONSTRAINT freight_charges_dd_kind_check
  CHECK (dd_invoice_line_id IS NULL OR kind IN ('demurrage', 'per_diem')) NOT VALID;

ALTER TABLE equipment_units
  ADD COLUMN dd_billing_party_id UUID REFERENCES parties (id);  -- who bills this box's time today

ALTER TABLE equipment_free_time_terms    -- the carrier's stated clock rules, beside the day counts
  ADD COLUMN clock_rules JSONB NOT NULL DEFAULT '{}';
  -- {"customs_hold_stops_clock": true, "bank_holidays": {"in_free_time": "skip",
  --  "after_free_time": "charge"}, "shutout_days": {"in_free_time": "skip",
  --  "after_free_time": "skip"}, "availability_day_free": true}

CREATE INDEX CONCURRENTLY freight_charges_dd_invoice_line_idx
  ON freight_charges (dd_invoice_line_id);
CREATE INDEX CONCURRENTLY dd_invoice_lines_equipment_idx
  ON detention_demurrage_invoice_lines (equipment_id);
ALTER TABLE freight_charges VALIDATE CONSTRAINT freight_charges_dd_invoice_line_fkey;
ALTER TABLE freight_charges VALIDATE CONSTRAINT freight_charges_dd_kind_check;
```

An importer's weekly question, which received D&D invoices are past the 30-day issuance rule or differ from its own computation, and when the dispute window closes:

```sql
WITH lines AS (
  SELECT l.dd_invoice_id,
         sum(l.amount) AS billed,
         sum(COALESCE(l.computed_amount, l.amount)) AS computed,
         max((SELECT max(d) FROM unnest(l.charged_dates) AS d)) AS last_charged_on
  FROM detention_demurrage_invoice_lines l
  GROUP BY l.dd_invoice_id
)
SELECT i.number, p.display_name AS billing_party, i.issued_on, x.last_charged_on,
       i.issued_on > x.last_charged_on + 30 AS late_under_541_7,
       x.billed - x.computed AS overbilled,
       i.issued_on + COALESCE(i.submit_window_days, 30) AS dispute_by
FROM detention_demurrage_invoices i
JOIN parties p ON p.id = i.billing_party_id
JOIN lines x ON x.dd_invoice_id = i.id
WHERE i.side = 'payable'
  AND i.billed_party_id = $1
  AND i.status IN ('received', 'in_audit')
  AND i.upstream_invoice_id IS NULL      -- pass-throughs count from the upstream issue date
  AND (i.issued_on > x.last_charged_on + 30 OR x.billed <> x.computed)
ORDER BY dispute_by;
```

Design notes:

- **An invoice line is a container and its dates.** 541.6 asks for the specific dates charged and the rates, so a line stores the dates and a rate per date, not a day count; the billed party's own computation sits beside them in `computed_dates` and `computed_amount`.
- **Conformance is computed at receipt and stored.** The list of nonconformities, with the rule version, goes on the invoice the moment it arrives; a nonconforming invoice is a status, not an argument, because it ends the obligation to pay.
- **Calendar dates, in the billing location's calendar.** The 30-day issuance and dispute windows are calendar days on dates; the free-time count uses the terms' day rules and the facility's holiday and shutout calendar ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).
- **A line names its evidence.** `free_time_terms_id` and the start and stop interchanges point at the rows [Intermodal & Drayage](/books/logistics/intermodal-and-drayage#how-to-build-it) keeps, so a recomputation reads the same terms and gate times the line used.
- **Pass-through is a link.** An NVOCC's invoice to its customer points at the carrier's invoice it received through `upstream_invoice_id`, which sets its own 30-day clock and lets a customer's dispute be passed upstream with its date.
- **Excuses are evidence rows.** Availability, holds, refused returns and missed appointments are events and documents with occurred and received times; a dispute lists them by id rather than describing them.
- **Who bills the box is a fact with a reason.** `liability_basis` on a receivable invoice is generated from the contract chain (booking party, bill of lading, haulage arrangement), not typed, because 541.6(a) still requires it after the 541.4 ruling.
- **Emit the D&D events.** `free_time.expiring`, `dd_invoice.received`, `dd_invoice.nonconforming`, `dd_dispute.submitted`, `dd_dispute.resolve_by_missed` and `dd_dispute.resolved` drive the import desk's queue and the payables hold ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## Auditing

- **Every D&D invoice as received or issued,** with its 541.6 fields parsed and the original kept, and the conformance result with the rule version that produced it.
- **Every line's dates and rates,** with the free-time terms version and the events (availability, holds, gate times) the computation used.
- **Every dispute,** with its ground, evidence, submission time against the invoice's window, the billing party's answer and its time against the 30-day resolution rule, and any pass-through to an upstream billing party.
- **Every charge complaint** submitted to the FMC, with the bills and invoices it included.
- **On the billing side, the basis for each billed party** and the certification text printed, since a false certification is a Shipping Act matter ([Audit Trails](/docs/building-blocks/audit-trails)).

## What This Means for the System You Build

- **Check every received D&D invoice against 541.6, 541.7 and 541.8 on arrival,** and stop payment on a nonconforming one.
- **Store charged dates and per-day rates,** not just a total or a day count, and keep your own computation beside them.
- **Version free-time terms per billing party and date,** including how they count holidays, shutout days and holds.
- **Keep availability, holds, appointments and gate times as events with both timestamps,** because they are the dispute's evidence.
- **Link pass-through invoices to the invoice they pass through,** and track the upstream dispute clock.
- **Generate the liability basis from the contract chain** when billing, since the 541.4 ruling removed the limit on recipients but not the duty to explain.
- **Make disputes records with deadlines,** so the 30-day windows on both sides are computed and visible.

## References

**Statutes and regulations**

- [46 U.S.C. 41104: Common carriers](https://www.law.cornell.edu/uscode/text/46/41104), the (a)(15) prohibition, the (d) invoice contents including availability date and performance statement, the (e) NVOCC safe harbor and the (f) elimination of the obligation to pay
- [46 U.S.C. 41310: Charge complaints](https://www.law.cornell.edu/uscode/text/46/41310), who may submit, investigation, the carrier's burden, refunds and penalties, and NVOCCs
- [46 CFR Part 541, Subpart A](https://www.law.cornell.edu/cfr/text/46/part-541/subpart-A), section list with 541.4 reserved
- [46 CFR 541.2: Scope and applicability](https://www.law.cornell.edu/cfr/text/46/541.2), billing parties covered and carrier-terminal billing excluded
- [46 CFR 541.3: Definitions](https://www.law.cornell.edu/cfr/text/46/541.3), billed party, billing party, demurrage or detention and invoice
- [46 CFR 541.5: Failure to include required information](https://www.law.cornell.edu/cfr/text/46/541.5), elimination of the obligation to pay
- [46 CFR 541.6: Contents of invoice](https://www.law.cornell.edu/cfr/text/46/541.6), identifying, timing, rate, dispute and certification information
- [46 CFR 541.7: Issuance of demurrage and detention invoices](https://www.law.cornell.edu/cfr/text/46/541.7), 30 days, NVOCC timing, dispute pass-through and re-invoicing the correct party
- [46 CFR 541.8: Requests for fee mitigation, refund, or waiver](https://www.law.cornell.edu/cfr/text/46/541.8), the 30-day request and resolution periods
- [46 CFR 545.5: Unreasonable demurrage and detention practices](https://www.law.cornell.edu/cfr/text/46/545.5), the incentive principle, its four applications, policies, terminology and its May 18, 2020 source (85 FR 29665)

**Government**

- [Federal Register: Demurrage and Detention Billing Requirements; Properly Issued Invoices Provision Set Aside by Court (December 29, 2025)](https://www.federalregister.gov/documents/2025/12/29/2025-23920/demurrage-and-detention-billing-requirements-properly-issued-invoices-provision-set-aside-by-court), the removal of 541.4 from the CFR, 90 FR 60579
- [Federal Register: Charge Complaint Procedures (September 1, 2026)](https://www.federalregister.gov/documents/2026/09/01/2026-17876/charge-complaint-procedures), charge complaints through the traditional complaint process and the carrier's burden, 91 FR 56053
- [Federal Register: FMC documents on demurrage and detention, newest first](https://www.federalregister.gov/api/v1/documents.json?conditions%5Bterm%5D=demurrage%20detention&conditions%5Bagencies%5D%5B%5D=federal-maritime-commission&order=newest), no proposed rule on invoice recipients after the removal, as of November 22, 2026
- [FMC: Court of Appeals decision on demurrage and detention billing practices (November 20, 2025)](https://www.fmc.gov/articles/u-s-court-of-appeals-issues-decision-in-case-on-demurrage-and-detention-billing-practices/), the September 23, 2025 D.C. Circuit ruling setting aside 541.4, what remains in effect and future rulemaking
- [FMC: Final rule on demurrage and detention cleared to take full effect May 28](https://www.fmc.gov/articles/final-rule-on-demurrage-detention-cleared-to-take-full-effect-may-28/), the February 2024 rule, the delayed contents section and full effectiveness
- [FMC: Ocean Shipping Reform Act of 2022](https://www.fmc.gov/resources-services/ocean-shipping-reform-act-of-2022/), signing date, public law, interim charge complaint procedures and reissued invoices
- [FMC: Detention and demurrage](https://www.fmc.gov/detention-and-demurrage/), the nine reporting carriers, $15.4 billion collected from April 2020 to March 2025, and first-quarter 2025 changes

**Carriers**

- [Hapag-Lloyd: Detention and Demurrage Tariff Guide for the United States (May 2026)](https://www.hapag-lloyd.com/content/dam/website/downloads/detention_demurrage/Detention_and_Demurrage_Guide_USA_May_2026.pdf), port and inland carrier haulage conditions, customs holds inside and outside the terminal, detention under carrier haulage, calendar-day charging, bank holidays and shutout days in and after free time
