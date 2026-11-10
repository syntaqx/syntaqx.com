+++
title = "MGAs, Programs & Fronting"
nav_title = "MGAs & Fronting"
description = "Delegated underwriting and binding authority, program administrators, fronting and hybrid fronting, capacity providers, the NAIC MGA Act and the bordereau."
category = "Insurance Industry"
order = 2705
part = "The Business"
tags = ["insurance", "mga", "delegated-authority", "fronting", "reinsurance"]
+++

A large and growing share of US premium is underwritten by someone other than the insurer whose name is on the policy. A managing general agent (MGA) prices and binds a niche (contractors' liability, high-value homes, pet, cannabis dispensaries, short-term rentals) under authority delegated by a carrier; a program administrator does the same for a defined class of business; a fronting carrier lends its licenses, its rating and its policy forms to an MGA's program and passes most of the risk to reinsurers and other capital providers; an insurtech starts as an MGA and buys a carrier to front for itself. Conning estimated MGA premium at about $128 billion for 2025, and fronting carriers supported about 20% of it.

Delegation splits the work and keeps the liability in one place. The MGA owns underwriting, the customer and often claims; the reinsurers own most of the loss; the fronting carrier owns the license, the statutory statement and the obligation to every policyholder if the others don't pay. The software problem is the boundary: the carrier must know what was bound in its name, under which authority, at what price, and what was collected and paid, from records it doesn't keep itself. That boundary has a name, the **bordereau**, and much of this chapter is about it. It extends `producers`, `insurers` and `policies` from [The Core Data Model](/books/insurance/insurance-business#the-core-data-model) with `programs`, `binding_authorities` and `bordereaux`.

## How the Platforms Do It

As of November 2026, from filings and published figures:

| Company | Role | Scale (latest year) | How it describes the model |
| --- | --- | --- | --- |
| **Accelerant** | Risk exchange connecting MGAs ("Members") with risk capital | $4.19B Exchange Written Premium in 2025; 280 Members, 95 Risk Capital Partners, 18 Risk Exchange Insurers; IPO July 2025 | Historically targeted reinsuring 90% of premium written by its insurers, retaining about 10%; Exchange Services earns "a fixed-percentage, volume-based fee" from capital partners |
| **Markel** (Programs and Solutions, including State National) | Fronting carrier | $1.9B of fronting premiums inside Markel Insurance's $12.5B gross premium in 2025 | Fronting is business "written on behalf of a general agent or capacity provider" and ceded to a capacity provider "in exchange for ceding fees"; also fronts for Nephila's reinsurers from Bermuda |
| **Hippo** (Spinnaker) | Insurtech MGA that became a carrier platform | $1.11B gross written premium through owned and partner MGAs | Serves "as a licensed insurance carrier for MGAs," with admitted and E&S paper; a captive takes a share of MGA business |
| **Ryan Specialty** | Wholesale broker, binding authority and underwriting management | Underwriting management revenue $1,024M (up 58.5%), binding authority $370M in 2025 | Runs MGAs and programs on carriers' paper and places binding authority business for retail agents |
| **Lloyd's** | Market whose syndicates delegate to coverholders | More than 3,000 local coverholders | Coverholders bind on syndicates' behalf under binding authority contracts ([Lloyd's](/books/insurance/who-carries-the-risk#lloyd-s)) |
| **Root** | Insurtech carrier using a fronting form in one state | Auto in 36 states | Names a "Texas county mutual fronting arrangement" among its risks |

The table spans the whole chain: an MGA (inside Ryan Specialty or Hippo), a fronting carrier (Markel's State National, Hippo's Spinnaker), a marketplace for capacity (Accelerant), and a market whose structure has run on delegated authority for centuries (Lloyd's). The same concepts recur in each: a program, a binding authority with limits, a carrier of record, a set of capacity providers with shares, and a monthly reporting cycle.

## The Market

The figures here are research firms' estimates reported in trade press, labeled as such, because no regulator publishes an MGA total:

- **MGA premium.** Conning estimated statutory MGA direct premium at $102.6 billion for 2025, up 12%, and about $128 billion including Lloyd's and other business not fully captured in statutory reporting, against $114.1 billion in 2024 (up 16%); the broader P&C market grew about 5% in 2025.
- **Fronting.** Conning estimated $22.6 billion of fronting carrier gross premium in 2025, up 17% after 26% growth in 2024, supporting about 20% of US MGA premium (17% in 2023). It reported five companies exiting or de-emphasizing fronting, and Morningstar DBRS data showing the ten largest fronting carriers with about 69% of MGA-dedicated premium.
- **Programs.** The Target Markets Program Administrators Association's 2025 study put program premiums at $110.8 billion for 2024, up 40% from 2022.

The definitions differ between sources (what counts as an MGA, as fronting, as a program), so the numbers don't add; a carrier's own measure should be its premium by `programs` row, defined in its own records.

## What the Law Calls an MGA

The NAIC's Managing General Agents Act (Model 225, adopted 1989, last amended 2002) is the regulatory frame. Its definition is narrower than the industry's use of the word: an MGA is a person who manages all or part of an insurer's business and, acting as its agent, "produces, directly or indirectly, and underwrites an amount of gross direct written premium equal to or more than five percent (5%) of the policyholder surplus as reported in the last annual statement of the insurer in any one quarter or year," together with adjusting or paying claims over $10,000 per claim or negotiating reinsurance for the insurer. Employees of the insurer, the US manager of an alien insurer's branch, affiliated underwriting managers not paid by premium volume, and a reciprocal's attorney-in-fact are excluded. "Underwrite" means the authority to accept or reject risk.

Worked, mine: an insurer with $400 million of surplus on its last annual statement. An agency that underwrites $20 million or more of its premium in a quarter or a year (5% of $400 million) and settles claims above $10,000 is an MGA under the model, whatever it calls itself; one that underwrites $30 million but sends every claim to the insurer's adjusters is not. The insurer has to review its books each quarter to see whether any producer has crossed the line, notify the producer and the commissioner, and bring the relationship into compliance within 30 days.

The act requires an MGA to be a licensed producer in the state, and a written contract with at least these terms:

| Requirement (Model 225, section 4) | What it becomes in the system |
| --- | --- |
| Insurer may terminate for cause and suspend underwriting authority during a dispute | Authority status with effective dates, checked at bind time |
| MGA renders accounts of all transactions and remits funds at least monthly | The monthly premium and claims bordereau and remittance |
| Funds held in a fiduciary capacity at an FDIC-insured institution; at most three months of estimated claim payments and allocated LAE retained | A fiduciary account per program, reconciled to the bordereau ([Trust Accounts and Fiduciary Funds](/books/insurance/commissions-and-agency-accounting#trust-accounts-and-fiduciary-funds)) |
| Separate records, with the insurer's and commissioner's access | Program-level data the carrier can query or receive |
| No assignment of the contract | |
| Underwriting guidelines: maximum annual premium volume, basis of rates, types of risks, maximum limits, exclusions, territorial limits, cancellation provisions, maximum policy period | The binding authority's limits, as data |
| Surety bond of at least $100,000 or 10% of the prior year's premium produced for the insurer, capped at $500,000; optional E&O | Bond record with amount and expiry |
| Claims: report all claims timely; send the file on request or when a claim may exceed a set amount, involves a coverage dispute, may exceed the MGA's authority, stays open over six months, or closes above a set amount | Referral rules on the claims bordereau |
| Electronic claim files transmitted timely | A claims data feed, not only a monthly summary |
| Interim profit sharing, where the MGA influences reserves, paid no sooner than one year after earned for property and five years for casualty | Profit commission held and released on a schedule |

And it forbids the MGA to bind reinsurance (except facultative under obligatory agreements with listed reinsurers), commit the insurer to syndicates, appoint unlicensed producers, pay or commit to a claim over the lesser of a specified amount or 1% of the insurer's surplus without approval, collect from reinsurers, put subproducers on the insurer's board, share employees with the insurer, or appoint a sub-MGA. The insurer's own duties: keep two years of audited MGA financials showing positive net worth, get an annual actuarial opinion on any loss reserves the MGA sets, review the MGA's underwriting and claims operations on site at least semi-annually, keep binding authority for reinsurance with an unaffiliated officer, and notify the commissioner within 30 days of entering or ending an MGA contract. The MGA's acts "are considered to be the acts of the insurer," and it may be examined as if it were the insurer.

Worked again on the $400 million insurer: the MGA can't settle a claim above $4 million (1% of surplus) without approval, whatever its contract says. An MGA that produced $30 million for the insurer last year needs a bond of 10% of $30 million, $3 million, capped at $500,000; one that produced $800,000 needs 10% ($80,000) raised to the $100,000 floor.

The model is old and unevenly adopted. The NAIC's state page (Fall 2020) shows most states' MGA statutes enacted between 1990 and 1994, with the NAIC Legal Division classifying most of them under "Previous Version" rather than as adoptions of the current text, so the exact thresholds (bond amounts, claim triggers) vary by state. Store each state's rule with its citation rather than the model's.

## Binding Authority and Program Administrators

Delegation comes in degrees, and the contract states which:

- **Binding authority.** The agent may bind coverage within guidelines, on the carrier's rates and forms, and the carrier underwrites anything outside them. Ryan Specialty reports binding authority as its own specialty; Lloyd's coverholders bind syndicates under binding authority contracts.
- **Underwriting authority (MGA, program administrator).** The agent also prices within the filed rating plan, selects risks, issues policies and endorsements, collects premium and sometimes settles claims or hires a third-party administrator to. A program administrator does this for a defined program: a class of business, a set of states, a product.
- **Claims authority.** Separate from underwriting: a settlement limit per claim, a list of what must be referred, and often a TPA in between.

Every term in a binding authority is a rule the system can check before a policy binds: is the risk class in the program's list, the state in its territory, the limit at or below the maximum, the policy period within the maximum, the premium inside the year's volume cap, the form set the approved one. The underwriting guideline items in Model 225 are a minimum schema. A program is a product (Filing Rates & Forms covers the filing; the fronting carrier files the rates and forms in its own name), and the binding authority is the permission to sell it, issued to a producer for a period. Here is the check, run at bind:

```go tab="Go"
type Authority struct {
	Classes        map[string]bool
	States         map[string]bool
	MaxLimit       int64 // per occurrence, minor units
	MaxTermDays    int
	AnnualCap      int64 // maximum written premium in the authority year
	SuspendedSince *time.Time
}

type Bind struct {
	Class, State     string
	Limit, Premium   int64
	TermDays         int
	At               time.Time
}

// Check returns the reasons a bind falls outside the authority; empty means bindable.
func (a Authority) Check(b Bind, writtenThisYear int64) []string {
	var out []string
	if a.SuspendedSince != nil && !b.At.Before(*a.SuspendedSince) {
		out = append(out, "authority suspended")
	}
	if !a.Classes[b.Class] {
		out = append(out, "class not in program")
	}
	if !a.States[b.State] {
		out = append(out, "state outside territory")
	}
	if b.Limit > a.MaxLimit {
		out = append(out, "limit above maximum")
	}
	if b.TermDays > a.MaxTermDays {
		out = append(out, "policy period above maximum")
	}
	if writtenThisYear+b.Premium > a.AnnualCap {
		out = append(out, "annual premium volume exceeded")
	}
	return out
}
```

```rust tab="Rust"
use std::collections::HashSet;
use chrono::{DateTime, Utc};

pub struct Authority {
    pub classes: HashSet<String>,
    pub states: HashSet<String>,
    pub max_limit: i64,
    pub max_term_days: u32,
    pub annual_cap: i64,
    pub suspended_since: Option<DateTime<Utc>>,
}

pub struct Bind {
    pub class: String,
    pub state: String,
    pub limit: i64,
    pub premium: i64,
    pub term_days: u32,
    pub at: DateTime<Utc>,
}

/// Reasons a bind falls outside the authority; empty means bindable.
pub fn check(a: &Authority, b: &Bind, written_this_year: i64) -> Vec<&'static str> {
    let mut out = Vec::new();
    if a.suspended_since.is_some_and(|s| b.at >= s) { out.push("authority suspended"); }
    if !a.classes.contains(&b.class) { out.push("class not in program"); }
    if !a.states.contains(&b.state) { out.push("state outside territory"); }
    if b.limit > a.max_limit { out.push("limit above maximum"); }
    if b.term_days > a.max_term_days { out.push("policy period above maximum"); }
    if written_this_year + b.premium > a.annual_cap { out.push("annual premium volume exceeded"); }
    out
}
```

A non-empty result isn't necessarily a decline: it is a referral to the carrier's underwriter, recorded with the reason, which is how Underwriting Rules, Referrals & Models treats every rule outside authority. The check runs where the MGA binds, in the MGA's system, and again where the carrier ingests the bordereau, because the carrier is liable for what was bound in its name whether or not the MGA checked.

## Fronting and Hybrid Fronting

A **fronting carrier** issues policies for a program it doesn't intend to keep: the MGA underwrites, the fronting carrier's licenses, filings and rating sit on the policy, and most or all of the risk is ceded to reinsurers or other capacity providers, for a fee. Markel's 10-K defines fronting as business "written on behalf of a general agent or capacity provider that is then ceded" to a capacity provider "in exchange for ceding fees," and reports $1.9 billion of fronting premiums in 2025; it also notes Hagerty's business "transitioned from being an underwriting product to a fronting arrangement" effective January 1, 2026, the same customer and product with the risk moved off Markel's net. A **hybrid fronting** carrier keeps a meaningful share of the risk, so its interests align with the reinsurers'; Accelerant's insurers historically targeted ceding 90% and keeping about 10%.

The fronting carrier can't cede its liability: its policyholders' claims are against it, and if a reinsurer fails to pay, it pays. Its protection is the quality of its reinsurers and the collateral they post, which is why Conning's commentary describes the market as a test of "platform quality rather than simply capacity and growth," and why collateral, credit for reinsurance and recoverables are the subject of Reinsurance Operations.

A program's money, worked per $100.00 of gross premium (my illustrative terms: a 25% MGA commission, a 5% fronting fee on ceded premium, a 90% quota share to reinsurers who reimburse their share of the commission and the fee through a ceding commission):

| Step | Amount |
| --- | --- |
| Insured pays gross premium (taxes and fees aside) | $100.00 |
| MGA keeps its commission and remits net | MGA $25.00; remits $75.00 |
| Ceded premium to reinsurers, 90% | $90.00 |
| Ceding commission on ceded premium: 25% MGA commission + 5% fronting fee | $27.00 |
| Net paid to reinsurers (90.00 - 27.00) | $63.00 |
| Fronting carrier keeps (75.00 - 63.00) | $12.00 |
| Of which: its 10% share of premium net of its share of commission (10.00 - 2.50) | $7.50 |
| Of which: fronting fee (5% of $90.00) | $4.50 |

Losses split the same way: on a $40.00 loss, reinsurers owe $36.00 and the carrier $4.00, but the carrier pays the claimant $40.00 and collects $36.00 later, and if a reinsurer defaults, the carrier owes the claimant anyway. The fronting fee pays for that credit risk, the licenses and filings, the statutory reporting and the oversight the MGA Act requires; whether $4.50 is enough depends on how good the collateral is.

## Capacity Providers and Collateral

Behind a fronting carrier sits a stack of capacity, and the system has to know every layer:

- **Rated reinsurers** on quota share and excess of loss treaties for the program, each with a share.
- **Collateralized capital**: reinsurers without a rating or US authorization, insurance-linked securities funds and sidecars that post collateral in trust so the fronting carrier can take credit (Cat Bonds, ILS & State Cat Funds).
- **Captives and cells** owned by the MGA or its parent: Hippo reports a captive taking a share of the risk written through its MGAs, and Accelerant's filing names Cayman reinsurance vehicles alongside 77 third-party reinsurers ([Captives and Protected Cells](/books/insurance/who-carries-the-risk#captives-and-protected-cells)).
- **Risk capital marketplaces**: Accelerant describes connecting "selected specialty insurance underwriters" (sellers) with risk capital partners (buyers), paid by a volume-based fee.

### The Capacity Stack

One program's capacity, as data, is a list of contracts with shares and attachment points, effective for a period, which `reinsurance_contracts` in Reinsurance Structures defines. For a fronted program, three questions matter at every renewal: does the stack cover 100% of what the fronting carrier doesn't keep, is each participant's collateral at or above what its share requires, and does the binding authority's period line up with the capacity's period. A binding authority that runs past the reinsurance it depends on is the classic failure: policies bound in month thirteen of a twelve-month treaty, with nobody behind them but the fronting carrier.

## The MGA-Plus-Carrier Pattern

The insurtech cohort converged on the same structure: start as a licensed agency (an MGA) placing business on other carriers' paper, buy or form a carrier, and add a captive or reinsurance vehicle to keep part of the risk. Hippo describes Hippo Insurance Services as an agency placing with affiliated and unaffiliated insurers, Spinnaker as its carrier, and its platform as serving MGAs beyond its own; Lemonade's 10-K lists Lemonade Insurance Agency LLC beside its insurers, a Cayman SPC and a Bermuda captive cell; Root uses a Cayman reinsurer and a Texas county mutual. The agency earns commission without capital; the carrier gives control over filings, rates and claims; the captive keeps a share of the underwriting profit offshore and flexible; and the platform business (fronting other MGAs) monetizes the licenses.

For the data, the pattern means one corporate group can be producer, insurer and reinsurer on the same policy. `producers`, `insurers` and `reinsurance_contracts` each hold one of the roles, linked through `insurer_relationships` ([How to Build It](/books/insurance/who-carries-the-risk#how-to-build-it)), and intercompany transactions (commission paid to the affiliate agency, premium ceded to the affiliate captive) are reported as affiliated in statutory schedules.

## The Bordereau

A bordereau is the periodic report from the party that did the work to the party that bears the risk: the MGA to the carrier, the carrier to its reinsurers, a coverholder to a Lloyd's syndicate. Model 225 requires an MGA to "render accounts to the insurer detailing all transactions and remit all funds due under the contract to the insurer on not less than a monthly basis," and to transmit electronic claim files timely. In practice that is two reports a month, each a file of rows:

| Premium (risk) bordereau | Claims bordereau |
| --- | --- |
| Policy number, insured, risk address and state | Claim number, policy number, loss date, reported date |
| Effective and expiry dates, transaction type (new, endorsement, cancellation, renewal) and its effective date | Cause of loss, catastrophe code, loss state |
| Class code, limits, deductibles, coverages | Paid this period and to date, by cost type (indemnity, DCC, A&O) |
| Gross premium, taxes and fees by state | Outstanding reserve by cost type |
| MGA commission, net premium due | Recoveries (salvage, subrogation) |
| Producer of record (retail agent) and its license | Status, and referral flags (over authority, coverage dispute, open over six months) |

The carrier's ingestion is where most fronting losses would first show up, and the work is reconciliation, not import:

- **Policy-level reconciliation.** Every transaction on this month's bordereau either matches a prior row or is new; a policy that disappears without a cancellation, a cancellation with no new business before it, or a premium that changed without an endorsement is a break.
- **Authority checks.** Each new policy re-run against the binding authority valid on its bind date ([Binding Authority and Program Administrators](#binding-authority-and-program-administrators)): classes, states, limits, volume.
- **Cash reconciliation.** The net premium due on the bordereau against the remittance received, and against the MGA's fiduciary account balance.
- **Claims reconciliation.** Paid to date this month equals paid to date last month plus paid this period; reserves move only with a reason; claims above the referral thresholds came with their files.

A worked cash check, mine: April's premium bordereau shows $1,840,000.00 gross written, $460,000.00 MGA commission at 25%, and $72,000.00 of cancellations returning $18,000.00 of commission. Net due is (1,840,000 - 72,000) - (460,000 - 18,000) = 1,768,000 - 442,000 = **$1,326,000.00**. The MGA remitted $1,301,500.00. The $24,500.00 difference is a break the carrier works with the MGA: an endorsement booked by one side and not the other, a cancellation dated in different months, or cash collected but not yet remitted. Until it's explained, the carrier's books record what the bordereau says it is owed and what it received, never a plug.

Bordereaux are the carrier's records of business it didn't write, so the carrier's statutory statement, premium tax returns and statistical reports are only as right as the bordereau; and because the carrier cedes the same business to reinsurers, it produces its own bordereau downstream from the MGA's. The rows have to keep their identity across all three.

## How to Build It

A program ties a product to a producer with authority and a capacity stack; bordereaux are dated batches with lines, reconciled to policies and cash:

```sql
CREATE TABLE programs (                    -- a delegated book: one product, one MGA
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  name                 TEXT NOT NULL,
  insurer_id           UUID NOT NULL REFERENCES insurers (id),   -- carrier of record
  administrator_id     UUID NOT NULL REFERENCES producers (id),  -- the MGA or program administrator
  fronting             BOOLEAN NOT NULL,     -- carrier intends to cede most of the risk
  retained_share_bp    INT,                  -- hybrid share kept, e.g. 1000 = 10%
  valid_during         DATERANGE NOT NULL
);

CREATE TABLE binding_authorities (         -- what the administrator may do, for a period
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  program_id           UUID NOT NULL REFERENCES programs (id),
  kind                 TEXT NOT NULL CHECK (kind IN ('binding', 'underwriting', 'claims')),
  product_ids          UUID[] NOT NULL,      -- filed products it may sell
  classes              TEXT[] NOT NULL,
  states               TEXT[] NOT NULL,
  max_limit            BIGINT NOT NULL,      -- per occurrence, minor units
  max_term_days        INT NOT NULL,
  annual_premium_cap   BIGINT,
  claim_settlement_cap BIGINT,               -- never above 1% of insurer surplus (Model 225)
  commission_bp        INT NOT NULL,
  status               TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'terminated')),
  valid_during         DATERANGE NOT NULL,
  contract_doc_id      UUID NOT NULL         -- the signed MGA or binding authority agreement
);

CREATE TABLE program_capacity (            -- the stack behind a fronted program
  program_id               UUID NOT NULL REFERENCES programs (id),
  reinsurance_contract_id  UUID NOT NULL,    -- reinsurance_contracts (Reinsurance Structures)
  share_bp                 INT NOT NULL,
  collateral_required      BIGINT,
  valid_during             DATERANGE NOT NULL
);

CREATE TABLE bordereaux (                  -- one file per program, kind and period
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  program_id           UUID NOT NULL REFERENCES programs (id),
  direction            TEXT NOT NULL CHECK (direction IN ('received', 'sent')),
  kind                 TEXT NOT NULL CHECK (kind IN ('premium', 'claims')),
  period_start         DATE NOT NULL,
  period_end           DATE NOT NULL,
  status               TEXT NOT NULL CHECK (status IN ('received', 'validated',
                         'reconciled', 'accepted', 'disputed', 'superseded')),
  file_ref             TEXT NOT NULL,        -- the file as received, hashed and stored
  control_total        BIGINT NOT NULL,      -- net due or paid this period, as stated
  supersedes_id        UUID REFERENCES bordereaux (id),
  received_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (program_id, direction, kind, period_start, period_end, file_ref)
);

CREATE TABLE bordereau_lines (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  bordereau_id         UUID NOT NULL REFERENCES bordereaux (id),
  line_no              INT NOT NULL,
  external_ref         TEXT NOT NULL,        -- the MGA's policy or claim reference
  policy_id            UUID REFERENCES policies (id),             -- once matched
  transaction_id       UUID REFERENCES policy_transactions (id),  -- the transaction it created
  claim_id             UUID,
  payload              JSONB NOT NULL,       -- the row as received
  result               TEXT NOT NULL CHECK (result IN ('pending', 'matched', 'created',
                         'outside_authority', 'break')),
  break_reason         TEXT,
  UNIQUE (bordereau_id, line_no)
);

CREATE TABLE bordereau_remittances (       -- cash received against a premium bordereau
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  bordereau_id         UUID NOT NULL REFERENCES bordereaux (id),
  amount               BIGINT NOT NULL,
  received_on          DATE NOT NULL,
  bank_ref             TEXT NOT NULL         -- the wire or ACH trace, for bank reconciliation
);

-- April's cash check: net due per the bordereau against remittances received.
SELECT b.id,
       b.control_total                              AS net_due_stated,
       SUM((l.payload->>'net_due')::BIGINT)         AS net_due_from_lines,
       (SELECT COALESCE(SUM(r.amount), 0) FROM bordereau_remittances r
         WHERE r.bordereau_id = b.id)               AS remitted
FROM bordereaux b
JOIN bordereau_lines l ON l.bordereau_id = b.id
WHERE b.program_id = :program AND b.kind = 'premium'
  AND b.period_start = DATE '2026-04-01'
GROUP BY b.id, b.control_total;
```

Design notes:

- **A bordereau line creates or matches a policy transaction.** The carrier's policy records are built from the lines, through the same `policy_transactions` every other policy uses; the line keeps the payload as received so a dispute can show what the MGA said.
- **Corrections supersede.** A resent April file is a new `bordereaux` row with `supersedes_id`; the April that was reconciled and booked stays as it was, and differences flow as next-period adjustments.
- **Authority is checked twice and stored once.** The `binding_authorities` row valid on the bind date is the authority of record; the MGA's check and the carrier's re-check both cite it.
- **The state of a bordereau** moves from received, to validated (rows parse, control totals agree), to reconciled (policy, cash and claims checks done), to accepted or disputed, with superseded when a corrected file replaces it.

## Auditing

- **What was bound in the carrier's name, under what authority.** Every policy from a program with its binding authority, the authority's limits on the bind date, the check results and any referral.
- **Every bordereau as received.** Files stored unaltered with their hashes, their lines, the reconciliation results and every break and how it was resolved.
- **Oversight performed.** Audited MGA financials, actuarial opinions on MGA-set reserves, semi-annual on-site reviews, quarterly checks for producers who crossed the MGA threshold, and notices to commissioners, each with a date, because Model 225 makes them the insurer's duties.
- **Capacity in force.** For every day of a program, the reinsurance and collateral behind it, so no policy was bound without the stack it depended on.

## What This Means for the System You Build

- **Model programs and binding authorities as dated data,** with every underwriting guideline as a checkable rule.
- **Check authority at bind and again at ingestion,** and turn every failure into a referral with its reason.
- **Treat the bordereau as a reconciliation, not an import:** policies, cash and claims each tie back to the prior period and the remittance.
- **Keep the carrier of record on every policy,** whatever the MGA's brand, and the capacity stack on every program.
- **Align authority periods with capacity periods,** and alert before a binding authority outlives its reinsurance.
- **Store each state's MGA rule with its citation,** because adoption of the model varies.

## References

**NAIC**

- [NAIC: Managing General Agents Act (Model 225) (PDF)](https://content.naic.org/sites/default/files/model-law-225.pdf), the MGA definition and its 5% of surplus and $10,000 claim thresholds, licensing, required contract provisions, the bond, claims reporting, interim profit deferral, prohibited acts, the insurer's duties, examination authority and the adoption history
- [NAIC: Managing General Agents Act state page (PDF)](https://content.naic.org/sites/default/files/model-law-state-page-225.pdf), state statutes and the Legal Division's classification of adoptions and previous versions, Fall 2020

**Filings**

- [Accelerant Holdings: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1997350/000199735026000003/arx-20251231.htm), the risk exchange, Exchange Written Premium, Members, Risk Capital Partners, Risk Exchange Insurers, the 90% cession target, fees and the July 2025 IPO
- [Markel Group: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1096343/000109634326000020/mkl-20251231.htm), the definition of fronting, ceding fees, $1.9 billion of fronting premiums, Nephila and the Hagerty transition
- [Hippo: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1828105/000182810526000008/hippo-20251231.htm), owned and partner MGAs, serving as a licensed carrier for MGAs, Spinnaker and the captive reinsurer
- [Ryan Specialty: Fourth quarter 2025 results (Form 8-K, Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1849253/000184925326000004/ryan-20251231xex991.htm), underwriting management and binding authority revenue
- [Lemonade: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1691421/000169142126000016/lmnd-20251231.htm), its agency, insurers, Cayman SPC and Bermuda captive cell
- [Root: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1788882/000178888226000014/root-20251231.htm), Root Re and the Texas county mutual fronting arrangement

**In practice**

- [Insurance Business: US MGA market swells to $128 billion (July 28, 2026)](https://www.insurancebusinessmag.com/us/news/excess-surplus/us-mga-market-swells-to-128-billion-as-specialization-reshapes-distribution-584067.aspx), Conning's MGA premium estimates for 2023-2025, fronting carriers' $22.6 billion and 20% share, and TMPAA's program premium figure
- [Insurance Business: Conning says fronting sector's easy growth phase is ending (August 31, 2026)](https://www.insurancebusinessmag.com/us/news/breaking-news/conning-fronting-sectors-easy-growth-phase-is-ending-587956.aspx), fronting premium growth, exits, the Morningstar DBRS concentration figure and the "platform quality" quote
- [Lloyd's: Our market](https://www.lloyds.com/about-lloyds/our-market), more than 3,000 local coverholders
