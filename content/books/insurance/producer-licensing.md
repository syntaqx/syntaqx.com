+++
title = "Producer Licensing & Appointments"
nav_title = "Licensing & Appointments"
description = "The Producer Licensing Model Act, lines of authority, NIPR, the NPN and PDB, nonresident licenses, CE, appointments, terminations and checks before you pay."
category = "Insurance Industry"
order = 2715
part = "Distribution"
tags = ["insurance", "distribution", "licensing", "compliance", "producers"]
+++

Nobody may sell, solicit or negotiate insurance in a state without a license from that state, for that line of insurance, and in most states nobody may act as an insurer's agent without that insurer's appointment on file. An agency that sells in all fifty states holds fifty licenses (one resident, the rest nonresident), each with its own lines of authority, renewal date and continuing education; each of its agents does too; and each carrier it represents files an appointment for each agent in each state that requires one. Those licenses lapse, get suspended, get renewed late; agents leave and are terminated, sometimes for cause, which the carrier must report.

The rule that turns all of this into software is short: a carrier and an agency may not pay a commission to someone who needed a license and didn't have one. So every bind and every commission payment checks a license, a line of authority and an appointment as of a date, against data that lives in the states' systems and reaches carriers through the National Insurance Producer Registry. This chapter covers the NAIC's Producer Licensing Model Act, lines of authority, the NPN and the Producer Database, resident and nonresident licensing, CE, business entity licenses, appointments and terminations as system events, and the check before paying. It extends `producers`, `producer_licenses` and `appointments` from [The Core Data Model](/books/insurance/insurance-business#the-core-data-model) with `license_checks` and `ce_records`.

## How the Platforms Do It

As of November 2026:

| System | Who runs it | What it does |
| --- | --- | --- |
| **NIPR Producer Database (PDB)** | NIPR, an independent nonprofit affiliate of the NAIC established in October 1996 | Links the state licensing systems, updated daily by participating departments for the 50 states, DC, Puerto Rico, Guam and the US Virgin Islands; "more than 5 million entities"; subscribers look up producers, track appointments and terminations, and get batch reports and alerts |
| **NIPR Gateway** | NIPR | The network between regulators and the regulated for applications, appointments and terminations; appointment and termination transactions validate against the NPN in real time and must follow NIPR data standards |
| **NIPR LicenseHub** | NIPR | Resident and nonresident license applications and renewals; NIPR charges a transaction fee (currently $5.60) on top of state fees; state review typically takes 7-10 days; since February 2026 it handles business entity licensing for New York and Washington |
| **Vertafore Sircon** | Vertafore (Roper) | Producer compliance and licensing management for carriers and agencies; Vertafore claims 50% of producer-compliance transactions |
| **State licensing systems** | Each department of insurance | The license of record; NIPR routes to them, and each state's statute governs |

Two design facts follow. **The state is the source of truth and NIPR is the pipe.** A carrier's own producer records are copies, refreshed from the PDB and from its own appointment and termination filings; a disagreement is resolved in the state's favor. **The NPN is the key.** NIPR describes the National Producer Number as "a unique NAIC identifier assigned during the licensing application process" to individuals and business entities in the PDB; it is the same in every state, while each state's license number differs.

## Who Must Be Licensed

The NAIC's Producer Licensing Model Act (Model 218, adopted 1988, last amended 2005) sets the frame most states follow. "A person shall not sell, solicit or negotiate insurance in this state for any class or classes of insurance unless the person is licensed for that line of authority." The three verbs are defined:

- **Sell**: to exchange a contract of insurance by any means, for money or its equivalent, on behalf of an insurance company.
- **Solicit**: attempting to sell insurance, or asking or urging a person to apply for a particular kind of insurance from a particular company.
- **Negotiate**: conferring directly with or offering advice directly to a purchaser about the substantive benefits, terms or conditions of a particular contract, by someone who sells insurance or obtains it from insurers for purchasers.

Section 4 lists who doesn't need a license, and the list is a design document for who in a carrier or a platform may touch a customer:

- **Insurers themselves**, though not their officers, employees or affiliates.
- **Employees without commission** whose work is executive, administrative, managerial or clerical and only indirectly related to selling; who do underwriting, loss control, inspection or claims; or who act as special agents giving producers technical help without selling.
- **People enrolling individuals in group plans** or doing administrative services for mass-marketed P&C insurance, with no commission.
- **Employers and associations** administering benefits for their own employees, without compensation from the insurer.
- **Advertising without intent to solicit** in the state, through mass media not limited to its residents, by someone who doesn't sell, solicit or negotiate insurance on risks there.
- **Certain nonresidents placing multistate commercial risks**, if licensed where the insured has its principal place of business.

The line between exempt "advertising" and licensed "soliciting" is where lead generation, comparison sites and embedded offers live ([Leads, Aggregators & Consent](/books/insurance/leads-and-consent)). On those definitions, a customer service representative who quotes a price and recommends a coverage is negotiating, while one who takes a payment or changes an address is doing clerical work. A direct carrier's licensed sales staff are producers with NPNs even though no agency is involved.

Federal law adds a bar the states don't control. 18 USC 1033(e) makes it a crime for anyone convicted of a felony "involving dishonesty or a breach of trust" (or of an offense under the section) to willfully engage in the business of insurance, and equally for anyone to "willfully permit the participation" of such a person, punishable by fine and up to five years; the exception is the written consent of an insurance regulator with authority over the insurer, specifically referring to the subsection (the "1033 waiver"). A carrier's or agency's onboarding has to screen employees and producers for it and keep any waiver, because the employer commits the offense by permitting participation.

## Lines of Authority

A license is issued for named lines of authority. The model act's section 7(A) lists them:

| Line | Model act definition, abridged |
| --- | --- |
| Life | Coverage on human lives, including endowments and annuities, and may include accidental death and disability income benefits |
| Accident and health or sickness | Coverage for sickness, bodily injury or accidental death, and may include disability income |
| Property | Coverage for direct or consequential loss or damage to property of every kind |
| Casualty | Coverage against legal liability, including death, injury or disability, or damage to property |
| Variable life and variable annuity | Coverage under variable life and variable annuity contracts (also a securities product; [Investing & Digital Assets](/books/investing-and-digital-assets/advice-and-conduct#broker-or-adviser) covers the broker-dealer side) |
| Personal lines | Property and casualty coverage sold to individuals and families for primarily noncommercial purposes |
| Credit | Limited line credit insurance (credit life, credit disability, credit property, GAP and similar coverage tied to an extension of credit) |
| Other | Any other line permitted under state law, including the limited lines each state defines and, separately, surplus lines licenses |

The mapping from a product to a required line of authority is data, per state: a homeowners policy needs property and casualty (or personal lines), commercial general liability needs casualty, a fixed annuity needs life, a variable annuity needs the variable line plus a securities registration. The limited lines are where embedded insurance lives, because a rental counter clerk or an electronics retailer can sell under a limited license without the full exam ([Embedded Insurance](/books/insurance/embedded-insurance)).

## Resident and Nonresident Licenses

A producer has one **home state**, where it "maintains his or her principal place of residence or principal place of business and is licensed to act as an insurance producer," and holds a resident license there after prelicensing education where required and an exam for each line. In every other state it holds a **nonresident license**, which the model act grants without an exam to a producer licensed and in good standing in its home state, on the home state's application or the NAIC Uniform Application, if the home state reciprocates; the commissioner may verify the home-state license through the Producer Database. A producer who moves files a change of address within 30 days and applies for a resident license in the new state within 90 days, without re-examination for lines already held.

Reciprocity was federal policy before it was state practice. The Gramm-Leach-Bliley Act of 1999 created the National Association of Registered Agents and Brokers (NARAB) to take effect unless, within three years, a majority of states enacted uniform or reciprocal licensing laws; the NAIC certified 47 states as reciprocal, with California, Florida and Washington not, according to the Congressional Research Service. The NARAB Reform Act of 2015 (Pub. L. 114-1, 15 USC 6751 and following) re-created NARAB as a nonprofit, "not ... an agent or instrumentality of the Federal Government," with a 13-member board appointed by the President and confirmed by the Senate, membership in which would let a nonresident producer operate in any state by paying that state's fees. As of the Wholesale & Specialty Insurance Association's October 2026 page, "the NARAB Board of Directors has yet to be appointed" and NARAB "has never become operational." <!-- source-gap: narab-board-status | secondary | NARAB II board never appointed and NARAB not operational as of October 2026 | closes with: a Treasury, White House or Senate page on NARAB board nominations or a CRS update after 2015 | checked: 2026-11-10 -->

So nonresident licensing still runs state by state through NIPR: one application per state, one fee per state, and the state's own requirements for anything beyond the reciprocal minimum.

## NIPR, the NPN and the PDB

NIPR is the system of record for producer data that crosses states, and a carrier's producer onboarding is a set of NIPR interactions:

1. **Look up the producer by NPN** in the PDB: every state license, line of authority, status, effective and expiration date, and appointments, as each state reports them.
2. **File appointments** through the Gateway (or the state's own system, where it differs), validated against the NPN, and pay the fee.
3. **Subscribe to alerts** so a license change in any state (a lapse, a suspension, a new line) reaches the carrier's records without polling.
4. **File terminations** within the deadline, with the reason.

The PDB is refreshed daily by states, so a carrier's copy is as good as its last sync. Store each PDB read as an observation with its fetch time and the state's reported status, and reconcile them to the carrier's own `producer_licenses` rows instead of overwriting; a license the PDB shows as expired yesterday and active today may have been renewed late, and the commission rules care which day the business was written ([Observations, Not Overwrites](/docs/building-blocks/record-linkage#observations-not-overwrites)).

## Renewal, Lapse and Continuing Education

A license stays in effect "as long as the fee ... is paid and education requirements for resident individual producers are met by the due date." A lapsed individual license can be reinstated within 12 months of the renewal due date without a new exam, at a penalty of double the unpaid renewal fee (model act section 7(C)). Between the lapse and the reinstatement, the producer was unlicensed, and business written in that gap is the classic commission and market conduct problem.

Continuing education is set by each state. Texas, for example, requires general lines agents (property and casualty, and life, accident and health) to complete 24 hours every two years, including 3 hours of ethics, with at least half in a classroom or classroom equivalent (28 TAC 19.1003). An agent who misses the deadline gets 90 days to finish and pays $50 per deficient hour, or the license is inactivated: a Texas agent six hours short at renewal pays 6 × $50 = $300 and has 90 days to complete them. Under the model act's reciprocity section, a nonresident who meets its home state's CE satisfies this state's, if the home state recognizes this state's CE on the same basis, so CE is tracked against the home state.

## Business Entity Licenses and the DRLP

Agencies are licensed too. Where a state requires it, "a business entity acting as an insurance producer is required to obtain an insurance producer license," on the NAIC Uniform Business Entity Application, and before approving it the commissioner must find that the entity "has designated a licensed producer responsible for the business entity's compliance with the insurance laws, rules and regulations of this state," the designated responsible licensed producer (DRLP). The entity's license can be suspended or revoked if an individual licensee's violation "was known or should have been known" by its partners, officers or managers and was neither reported nor corrected.

For the system: an agency is a `producers` row of kind `agency` with its own NPN and licenses; its agents are `producers` rows with `parent_id` pointing to it; each state license of the entity names a DRLP, who must hold an active individual license in that state for the relevant lines. A DRLP who leaves the agency breaks the entity's compliance in every state where they were designated, which is an event to alert on, not a field to edit.

## Appointments

An appointment is the insurer's notice to the state that a producer is its agent. The model act makes appointments optional ("some states do not require the formal appointment of a producer"); where required:

- **When.** The insurer files a notice of appointment "within fifteen (15) days from the date the agency contract is executed or the first insurance application is submitted," and may appoint a producer to all or some insurers in its group with one filing where the state has electronic appointments. Carriers describe the two state practices as **immediate** (filed on contract execution or first business, whichever comes first) and **just-in-time** (filed when the first business arrives).
- **Verification.** The commissioner may verify eligibility within 30 days and notify the insurer within five days if the producer is ineligible.
- **Fees.** The insurer pays an appointment fee and, in some states, a renewal appointment fee. NIPR's Kansas page shows $2 for a Kansas-domiciled company and $5 for a foreign company, collected at submission, and the annual appointment renewal fee eliminated from July 1, 2025.
- **Not required everywhere.** One carrier's public appointment fee addendum lists Alaska, Arizona, Colorado, Illinois, Indiana, Maryland, Missouri and Oregon as non-appointment states, and shows fees it deducts from agents' commissions (Florida $62 plus $8 per county appointment, Texas $12, Kansas $7); I found no regulator-published list, so treat the set as a dated rule per state with its own citation. <!-- source-gap: non-appointment-states | secondary | list of states that do not require producer appointments | closes with: an NAIC or NIPR chart of appointment requirements by state | checked: 2026-11-10 -->

Florida shows how strict a state can be: no one may act as an agent unless "currently licensed by the department and appointed by an appropriate appointing entity or person" (Fla. Stat. 626.112, 2026), and knowingly transacting insurance without a license is a third-degree felony; the appointing entity files with the department and pays the appointment fee and taxes when it does (626.451).

Worked, mine: a carrier appointing 1,200 agents in Kansas as a foreign company pays 1,200 × $5 = $6,000 in appointment fees, collected by NIPR at submission, and since July 2025 nothing to renew them. The same carrier in a state with annual renewal fees owes them every year for every active appointment, which is why carriers terminate appointments for agents who haven't written business: an inactive appointment is a recurring fee and a compliance surface.

## Terminations

Ending an appointment is a reportable event with a clock. Under section 15 of the model act, the insurer notifies the commissioner within 30 days after the effective date of termination, in the commissioner's format, both for cause (one of the section 12 grounds: misrepresentation, misappropriating premium, fraud, a felony conviction, forgery, another state's revocation and the rest) and without cause; it has an ongoing duty to report information it later discovers that would have been reportable; and within 15 days after notifying the commissioner it mails a copy to the producer. An insurer that fails to report, or reports with actual malice, may lose its certificate of authority or be fined. Producers have their own duty: report any administrative action in another jurisdiction within 30 days of final disposition, and any criminal prosecution within 30 days of the initial pretrial hearing (section 17).

A termination therefore has a reason code (for cause or not, which ground), an effective date, a filing date that must be within 30 days of it, and a copy to the producer within 15 days of filing. Commission on business written before termination may still be owed, and renewal commission is a contract question ([Clawbacks and Chargebacks](/books/insurance/commissions-and-agency-accounting#clawbacks-and-chargebacks)).

## Checking Before You Bind and Pay

Section 13 of the model act is the rule the whole data model serves: "An insurance company or insurance producer shall not pay a commission, service fee, brokerage or other valuable consideration to a person for selling, soliciting or negotiating insurance in this state if that person is required to be licensed under this Act and is not so licensed," and the person can't accept it either. Two refinements matter: renewal or other deferred commissions may be paid to someone who was licensed **at the time of the sale**, even if not licensed now; and commissions may be paid to an agency, or to people who don't sell, solicit or negotiate in the state, unless an anti-rebating law forbids it.

The check at bind and at payment, per transaction:

1. The producer of record (and the individual sub-producer who did the selling) held an **active license in the risk's state**, for a **line of authority covering the product**, on the transaction's sale date.
2. In an appointment state, the producer had an **active appointment** with the issuing insurer in that state (or the insurer filed one within the allowed window, for just-in-time states).
3. For an agency, its **entity license** was active and it had a **DRLP** with an active license.
4. The producer isn't **barred** (a for-cause termination, a 1033 issue without waiver, a sanctioned party).

The payment check differs from the bind check in one way: it looks back to the sale date for deferred commissions, and forward to today for everything else.

```go tab="Go"
type License struct {
	State, Status string
	Lines         map[string]bool
	From, To      time.Time // effective window, To exclusive
}

// Licensed reports whether any license covers the line in the state on the date.
func Licensed(ls []License, state, line string, on time.Time) bool {
	for _, l := range ls {
		if l.State == state && l.Lines[line] && !on.Before(l.From) && on.Before(l.To) {
			return true
		}
	}
	return false
}

// CanPay applies PLMA section 13: deferred (renewal) commission needs a license
// at the time of sale; anything else needs one at the time of sale and now.
func CanPay(ls []License, state, line string, sold, now time.Time, deferred bool) bool {
	if !Licensed(ls, state, line, sold) {
		return false
	}
	return deferred || Licensed(ls, state, line, now)
}
```

```rust tab="Rust"
use std::collections::HashSet;
use chrono::{DateTime, Utc};

pub struct License {
    pub state: String,
    pub lines: HashSet<String>,
    pub from: DateTime<Utc>,
    pub to: DateTime<Utc>, // exclusive
}

pub fn licensed(ls: &[License], state: &str, line: &str, on: DateTime<Utc>) -> bool {
    ls.iter().any(|l| l.state == state && l.lines.contains(line) && on >= l.from && on < l.to)
}

/// PLMA section 13: deferred (renewal) commission needs a license at the time
/// of sale; anything else needs one at the time of sale and now.
pub fn can_pay(ls: &[License], state: &str, line: &str,
               sold: DateTime<Utc>, now: DateTime<Utc>, deferred: bool) -> bool {
    licensed(ls, state, line, sold) && (deferred || licensed(ls, state, line, now))
}
```

The license windows come from the license history, not the current license: a license that lapsed in March and was reinstated in May has two windows with a gap, and business sold in April fails the check. A failed check at bind is a hold (bind under a properly licensed producer, or refer); a failed check at payment is a held commission with a reason, not a silent skip, because the producer will ask.

## How to Build It

License history, CE, appointment rules by state and every check that was run:

```sql
ALTER TABLE producer_licenses
  ADD COLUMN npn                 TEXT,      -- denormalized from producers for PDB matching
  ADD COLUMN effective           DATERANGE, -- one row per continuous window; a lapse ends it
  ADD COLUMN drlp_producer_id    UUID REFERENCES producers (id),  -- entities only
  ADD COLUMN source              TEXT NOT NULL DEFAULT 'pdb',     -- 'pdb', 'state_site', 'manual'
  ADD COLUMN observed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE appointments
  ADD COLUMN filed_at            TIMESTAMPTZ,
  ADD COLUMN filing_ref          TEXT,      -- NIPR or state confirmation
  ADD COLUMN fee                 BIGINT,
  ADD COLUMN termination_cause   TEXT,      -- PLMA s12 ground when for cause
  ADD COLUMN termination_filed_at TIMESTAMPTZ,
  ADD COLUMN producer_copy_sent_at TIMESTAMPTZ;

CREATE TABLE appointment_rules (           -- per state, dated, cited
  state              TEXT NOT NULL,
  required           BOOLEAN NOT NULL,
  timing             TEXT CHECK (timing IN ('immediate', 'just_in_time')),
  file_within_days   INT,                   -- 15 under the model act
  termination_days   INT NOT NULL,          -- 30 under the model act
  fee_domestic       BIGINT,
  fee_foreign        BIGINT,
  renewal_fee        BIGINT,
  rule_ref           TEXT NOT NULL,         -- statute, regulation or NIPR page
  valid_during       DATERANGE NOT NULL,
  PRIMARY KEY (state, valid_during)
);

CREATE TABLE ce_records (                  -- credits toward a license period
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  producer_id        UUID NOT NULL REFERENCES producers (id),
  state              TEXT NOT NULL,         -- the home state, for reciprocity
  course_ref         TEXT NOT NULL,
  hours              NUMERIC(4,1) NOT NULL,
  category           TEXT NOT NULL,         -- 'general', 'ethics', 'flood', 'annuity', ...
  delivery           TEXT NOT NULL CHECK (delivery IN ('classroom', 'classroom_equivalent',
                       'self_study')),
  completed_on       DATE NOT NULL,
  reported_to_state  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE license_checks (              -- every check, at bind or at payment
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  purpose            TEXT NOT NULL CHECK (purpose IN ('bind', 'commission', 'appointment',
                       'onboarding')),
  producer_id        UUID NOT NULL REFERENCES producers (id),
  policy_transaction_id UUID REFERENCES policy_transactions (id),
  commission_id      UUID,                  -- commissions (Commissions & Agency Accounting)
  state              TEXT NOT NULL,
  line               TEXT NOT NULL,
  as_of              DATE NOT NULL,         -- sale date or payment date
  license_id         UUID REFERENCES producer_licenses (id),
  appointment_id     UUID REFERENCES appointments (id),
  result             TEXT NOT NULL CHECK (result IN ('pass', 'fail', 'hold')),
  reasons            TEXT[] NOT NULL DEFAULT '{}',
  checked_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Terminations at risk of missing the 30-day filing clock.
SELECT a.id, a.producer_id, a.state, a.terminated_on,
       a.terminated_on + r.termination_days AS due
FROM appointments a
JOIN appointment_rules r ON r.state = a.state AND a.terminated_on <@ r.valid_during
WHERE a.terminated_on IS NOT NULL
  AND a.termination_filed_at IS NULL
ORDER BY due;
```

Design notes:

- **One license row per continuous window.** A lapse closes the window and a reinstatement opens another, so a check as of any date is a range lookup, and the gap is visible.
- **Every check is stored with the rows it used.** A market conduct examiner or a producer disputing a held commission sees which license and appointment were read and why the result came out as it did.
- **Rules per state are dated data,** including the appointment requirement itself, the fees and the clocks, each with a citation, because states change them (Kansas dropped renewal fees in 2025).
- **Terminations are filings with deadlines,** computed from the rule and tracked to done, like any other regulatory clock ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).

## Auditing

- **Licensed on the sale date.** For any policy transaction, the license, line and appointment the producer held that day, and the check that confirmed it.
- **Commissions paid only to the licensed.** Every commission with its check, including deferred commissions checked against the sale date.
- **Appointments and terminations on time.** Filing dates against contract or first-business dates, termination filings within 30 days, producer copies within 15 days, and for-cause reasons.
- **Background and waivers.** 1033 screening results and any written consent, kept with the producer and employee records.

## What This Means for the System You Build

- **Key producers by NPN** and refresh licenses and appointments from the PDB as observations, never overwrites.
- **Map every product to the line of authority it needs, by state.**
- **Store license history as continuous windows,** so a lapse is a gap a date query can see.
- **Check license, line, appointment and entity DRLP at bind and at payment,** with deferred commissions checked against the sale date, and store every check.
- **Treat appointments and terminations as filings with clocks and fees,** driven by dated state rules.
- **Screen for 18 USC 1033** at onboarding and keep any waiver.

## References

**Law and regulation**

- [18 USC 1033](https://www.law.cornell.edu/uscode/text/18/1033), subsection (e): the bar on persons convicted of felonies involving dishonesty or breach of trust engaging in the business of insurance, the offense of permitting it, and the regulator's written consent
- [15 USC 6751](https://www.law.cornell.edu/uscode/text/15/6751), the National Association of Registered Agents and Brokers as re-established in 2015, not a federal agency
- [Fla. Stat. 626.112](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0626/Sections/0626.112.html), license and appointment required to act as an agent; unlicensed transaction a third-degree felony
- [Fla. Stat. 626.451](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0626/Sections/0626.451.html), appointment filing with the fee and taxes

**NAIC**

- [NAIC: Producer Licensing Model Act (Model 218) (PDF)](https://content.naic.org/sites/default/files/model-law-218.pdf), license required, definitions of sell, solicit and negotiate, exceptions, business entity licenses and the designated producer, lines of authority, renewal and reinstatement, nonresident licensing, exemption from examination, license denial grounds, commissions, appointments, terminations, reciprocity and reporting of actions
- [NAIC: National Insurance Producer Registry (NIPR)](https://content.naic.org/cipr-topics/national-insurance-producer-registry-nipr), NIPR's establishment in 1996, the PDB's coverage and daily updates, more than 5 million entities, and the Gateway

**Regulators and guidance**

- [Texas Department of Insurance: Agent continuing education](https://tdi.texas.gov/agent/agcehome.html), 24 hours every two years with 3 of ethics, half classroom, and the 90-day extension at $50 per deficient hour
- [Congressional Research Service: NARAB (R43095)](https://www.everycrsreport.com/reports/R43095.html), the GLBA reciprocity trigger, 47 states certified, California, Florida and Washington not, and the NARAB II board and membership

**Vendor documentation**

- [NIPR: Licensing Center](https://nipr.com/licensing-center), the NPN definition, LicenseHub, state review times and business entity licensing for New York and Washington
- [NIPR: Producer Database](https://nipr.com/products-and-services/producer-database), lookups, appointment and termination tracking, reports and alerts
- [NIPR: Appointments and terminations](https://nipr.com/industry-solutions/appointment-and-terminations), NPN validation and NIPR data standards
- [NIPR: Renew a license](https://nipr.com/help/help-articles/renew-a-license), the $5.60 transaction fee
- [NIPR: Kansas company appointment renewals](https://nipr.com/industry-solutions/company-appointment-renewals/kansas), Kansas appointment fees and the end of renewal fees from July 1, 2025
- [Vertafore](https://www.vertafore.com/), Sircon and the producer-compliance share claim

**In practice**

- [Americo: Appointment fee addendum (PDF)](https://www.americo.com/Content/AppointmentFeeAddendum.pdf), immediate and just-in-time appointment states, the non-appointment states it lists, and state fees deducted from commissions
- [WSIA: NARAB](https://www.wsia.org/wcm/wcm/Legislative_Advocacy___PAC/NARAB.aspx), the board never appointed and NARAB not operational
