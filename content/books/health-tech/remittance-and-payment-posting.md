+++
title = "Remittance & Posting"
description = "How payer money lands: the 835 ERA, CARC, RARC and group codes, EFT and TRN reassociation, payer virtual cards and their fees, auto-posting, secondary claims."
category = "Health Tech Industry"
order = 1923
part = "Revenue Cycle"
tags = ["health-tech", "x12-835", "era", "eft", "carc", "payment-posting", "data-model"]
+++

When a payer adjudicates claims it sends two things by two routes. The money goes to the practice's bank, usually as an ACH credit, sometimes as a paper check or a virtual credit card. The explanation goes through the clearinghouse as an X12 835, the electronic remittance advice (ERA): for every claim in the payment, what was charged, allowed, paid and assigned to the patient, line by line, with codes for every dollar of difference. Posting is the job of putting the explanation onto the practice's ledger: the payer's payment against each claim line, a contractual write-off for the difference between charge and allowed amount, the patient's share moved to patient responsibility, denials opened as work, and the deposit matched to the bank. In a small office the person who posts is often the person who answered the phone this morning; in a billing company it's a team running auto-posting with exceptions.

The 835 is the most useful transaction in the cycle and the most demanding. It's useful because it is complete: the codes say exactly why a dollar wasn't paid, which turns denials into data. It's demanding because posting has to be exact (the ledger must balance to the payment, to the cent), because one ERA covers many claims and one deposit can cover several ERAs, because payers take back money from old claims inside new payments, and because the bank deposit and the ERA arrive separately and have to be matched by a trace number. This chapter covers the 835's structure, the adjustment codes, EFT and reassociation, virtual card payments, posting rules and automation, provider-level adjustments and recoupments, and secondary claims. It extends `remittances`, `remittance_lines`, `payments` and `ledger_entries` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model). The ACH rail itself is the Payments volume's [ACH](/books/payments/ach); reconciliation in general is [Ledger & Reconciliation](/books/payments/ledger-and-reconciliation).

## How the Platforms Do It

As of October 2026, from regulators' and vendors' documentation:

| Source | What it says about remittance | Notable mechanics |
| --- | --- | --- |
| **HIPAA standards (45 CFR 162.1602)** | Health care payments by EFT use the NACHA CCD+ with the 835's "TRN Reassociation Trace Number" in the addenda; the remittance is the 835 005010X221 | One trace number ties the deposit to its ERA |
| **CAQH CORE rule 370** (adopted under HIPAA) | The plan must release the 835 "No sooner than three business days" before and "No later than three business days after" the CCD+ effective entry date | "Late or missing" means four business days after either the payment or the 835 arrives |
| **CMS virtual card guidance (May 24, 2022)** | Plans may pay by virtual card, but if a provider asks for EFT and ERA, "the health plan must comply"; HHS doesn't regulate the fees | A plan "may not require a provider to agree to receive payment or reassociation services from its business associate" |
| **Medicare** | EFT is required at enrollment (CMS-588) | 835s through the contractor's EDI gateway |
| **Stedi** | 835s delivered as events or by polling, as JSON or X12 | Match claims on CLP01 to the claim's patient control number, lines on the line item control number; a repeated TRN02 marks a duplicate ERA |

Three patterns:

- **Two messages, one payment.** Every source assumes the money and the explanation travel apart and must be joined by the trace number. A practice that posts from the ERA without matching the deposit, or deposits without posting, has an unreconciled ledger.
- **The codes are the content.** The operating rules standardize which codes go with which business scenarios so that software can post without a person reading each line.
- **The payer can't force its payment vendor on the provider.** The virtual card guidance protects the provider's right to standard EFT and ERA, which is the provider's lever against card fees.

## The 835

An 835 is a payment header, a trace number, and a list of claims, each with its service lines and adjustments. An illustrative ERA for the physical therapy claim in [Claims](/books/health-tech/claims#the-837-claim) (written for this chapter, not taken from an implementation guide):

```
BPR*I*128*C*ACH*CCP*01*999999992*DA*12345678*1512345678**01*888888880*DA*98765*20261110~
TRN*1*EFT20261110001*1512345678~
N1*PR*EXAMPLE HEALTH PLAN~
N1*PE*HARBOR PHYSICAL THERAPY*XX*1234567893~
CLP*PT20261014A*1*270*128*32*12*PAYERCLM778899~
NM1*QC*1*RIVERA*ANA****MI*W123456789~
SVC*HC:97161*120*72**1~
CAS*CO*45*30~
CAS*PR*2*18~
SVC*HC:97110:GP*90*56**2~
CAS*CO*45*20~
CAS*PR*2*14~
SVC*HC:97140:GP*60*0**1~
CAS*CO*97*60~
LQ*HE*M15~
```

Read it as the payer's arithmetic:

- **`BPR`**: an ACH credit of $128 from the payer's account to the practice's, effective November 10, 2026. **`TRN`**: the trace number `EFT20261110001`, which also travels in the bank deposit's addenda.
- **`CLP`**: the claim, by the practice's own patient control number, processed as primary (`1`), $270 charged, $128 paid, $32 patient responsibility, with the payer's own claim number at the end.
- **Line 1**: the evaluation, $120 charged and $72 paid; $30 is a contractual adjustment (`CO` group, reason `45`, charge over the fee schedule) and $18 is the patient's coinsurance (`PR` group, reason `2`).
- **Line 2**: two units of therapeutic exercise, $90 charged, $56 paid, $20 contractual, $14 coinsurance.
- **Line 3**: manual therapy, $60 charged and nothing paid: reason `97`, the benefit "is included in the payment/allowance for another service/procedure," with remark `M15` ("Separately billed services/tests have been bundled"). That's a denial, and a work item ([Denials, Appeals & Claim Status](/books/health-tech/denials-and-appeals)).

Every line balances: charge equals payment plus all adjustments. Every claim balances: its charge equals the sum of its lines. The payment equals the sum of claim payments less provider-level adjustments. A parser checks all three on every ERA and refuses to auto-post one that doesn't balance.

## CARC, RARC and Group Codes

Three code sets explain every dollar not paid:

- **Group codes** say who is responsible for an adjustment: **CO** (contractual obligation: the provider writes it off and can't bill the patient), **PR** (patient responsibility: deductible, coinsurance, copay, non-covered services the patient agreed to), **OA** (other adjustment, neither party), **PI** (payer-initiated reduction the payer believes the provider can't bill the patient for).
- **Claim adjustment reason codes** (CARCs) say why. A few that drive most posting: **1** deductible, **2** coinsurance, **3** copayment, **45** charge over the fee schedule or contracted rate, **16** "Claim/service lacks information or has submission/billing error(s)," **97** bundled into another service, **197** precertification or authorization absent.
- **Remittance advice remark codes** (RARCs) add detail: what was missing, what to do next. X12 hosts the list as an external code list; `M15` (bundled) and `N130` ("Consult plan benefit documents/guidelines") are typical.

Group and reason together decide posting. `PR` with `1`, `2` or `3` moves the amount to the patient; `CO` with `45` is a contractual write-off; `CO` with `16` or `197` is a denial to work, not to write off; `OA` amounts are inspected. The code lists change several times a year (X12's RARC page was dated July 1, 2026 when read for this chapter), so the posting rules are data keyed by group, reason and remark, with effective dates, and a code the rules don't know routes to a person ([What Belongs in Data](/docs/architecture/rules-as-data#what-belongs-in-data)).

## EFT and Reassociation

HIPAA's EFT standard (45 CFR 162.1602) makes health care payments by ACH use the CCD+ entry, a corporate credit with one addenda record, and puts the 835's TRN reassociation trace number in field 3 of that addenda. The bank deposit thus carries the same trace number as the ERA's `TRN` segment, and the payment amount matches the ERA's `BPR`. The CCD format and its addenda are in [Files, Batches and SEC Codes](/books/payments/ach#files-batches-and-sec-codes).

Reassociation is matching them:

1. **ERA arrives** through the clearinghouse; the parser records its TRN, payer and payment amount as an expected deposit.
2. **Deposit arrives** in the bank file (BAI2 or the bank's API, with the CCD+ addenda); its addenda trace number and amount are recorded.
3. **Match** on trace number, payer and amount. CORE 370 makes the timing predictable: the 835 is released no more than three business days before and no more than three after the payment's effective date, and anything missing four business days after the other half arrived is "late or missing," a reason to call the payer.
4. **Reconcile.** A matched pair closes; an ERA without money or money without an ERA is a break worked from a queue ([A Matching Engine](/books/payments/ledger-and-reconciliation#a-matching-engine)).

Small practices often never see the addenda, because their bank shows deposits as a single line with the payer's name. Getting the addenda requires asking the bank to report it, which is the first thing to set up for any practice adopting automated posting. Paper checks are the old version of the same problem: the check and a paper explanation of benefits arrive in one envelope, and the practice posts by hand from the EOB.

## Virtual Card Payments

Some payers, and the payment vendors they use, pay providers with a single-use virtual credit card: a card number delivered by fax, email or portal, which the practice runs through its own card terminal for the payment amount. The practice pays its card processing fees on that amount, so a payment by card costs the practice a few percent of the claim that an ACH credit wouldn't, and the payer or its vendor may earn a share of the card's interchange.

CMS's guidance letter of May 24, 2022, from its National Standards Group, sets the boundaries under HIPAA:

- The standards "permit health plans to pay claims by VCC."
- "HHS does not regulate … fees assessed by health plans or credit card networks for VCC payments."
- If a provider asks to be paid through the standard EFT with the ERA, "the health plan must comply," using the CCD+, the TRN and the 835 together, in network or not.
- A plan "may not require a provider to agree to receive payment or reassociation services from its business associate," and must keep a one-to-one match between an ERA and its EFT.
- Complaints go to CMS through its enforcement tool (ASETT).

What software does with that: record each payer's payment method per practice; detect virtual card payments (a `BPR` payment method for a card, or an ERA arriving with no matching deposit and a card notice instead); post the card payment as a payer payment with the processing fee recorded as a separate expense, never netted from the claim; and give the practice the opt-out path, since the remedy is a request to the payer for EFT. The card mechanics and fees are the Payments volume's [Interchange & Pricing](/books/payments/interchange-and-pricing); the practice side is Part 5's [Payments in the Practice](/books/health-tech/patient-payments) chapter.

## Posting

Posting turns each 835 claim into ledger entries. For the claim above, with charges already on the ledger at the full fee:

| Entry | Line | Amount | Account effect |
| --- | --- | --- | --- |
| Insurance payment | 1, 2 | $72, $56 | Reduces the line's insurance balance |
| Contractual adjustment (CO 45) | 1, 2 | $30, $20 | Write-off; never billed to the patient |
| Transfer to patient (PR 2) | 1, 2 | $18, $14 | Moves balance from insurance to patient responsibility |
| Denial (CO 97, M15) | 3 | $60 | Stays as an insurance balance with a denial work item; written off only by a person's decision |

Rules that keep posting right:

- **Post at the line.** Claim-level posting hides which service was denied and makes appeals and patient explanations impossible. The 835 gives lines; the ledger keeps them.
- **Match lines by control number,** the line item control number the claim sent and the 835 echoes (Stedi: Loop 2110 `REF`), and fall back to code, date and units only when a payer drops it.
- **Never auto-write-off a denial.** `CO` with a denial reason looks like a contractual adjustment in the arithmetic and is not one. Auto-posting rules list exactly which CARCs are contractual (45, and a short list of others the practice approves); everything else opens work.
- **Compare against the contract.** The allowed amount (charge less contractual adjustments) is checked against the practice's expected rate for that payer and code, and shortfalls open underpayment work ([Underpayments and Contracts](/books/health-tech/denials-and-appeals#underpayments-and-contracts)).
- **Patient responsibility is the payer's number.** The `PR` amount is what the practice may bill the patient (for an in-network payer, never more), and it is what the patient statement shows ([Patient Statements, Estimates & Collections](/books/health-tech/patient-financial-experience)).
- **Duplicates are detected, not posted.** Payers retransmit ERAs; Stedi treats an ERA with a repeated TRN02 as a duplicate. The parser keys ERAs by payer, trace number and amount, and a second copy is logged and ignored.
- **Reversals post as reversals.** A payer that reprocesses a claim sends a reversal (`CLP` status `22`) and a new payment; the reversal negates the original entries rather than deleting them.

**Auto-posting** applies these rules without a person for every claim that balances, matches a claim on file and carries only approved codes. Exceptions (unmatched claims, unknown codes, denials, underpayments, reversals) go to a posting queue. A practice's auto-post rate is a measure of how clean its claims and payer contracts are.

## Provider-Level Adjustments and Recoupments

Below the claims, an 835 can carry `PLB` segments: adjustments to the payment that aren't tied to a claim in this ERA. The common ones are **recoupments** (taking back an overpayment on an older claim by reducing this payment), **interest** the payer owes on a late claim under state prompt-pay law, **forward balances** (a negative balance carried to the next payment) and **withholds** under value-based contracts. They are why an ERA's payment can be less than the sum of its claim payments.

Posting a recoupment correctly takes two steps: reduce the old claim's insurance payment (the payer is reversing what it paid on that claim, identified in the PLB's reference), and record the reduction against this payment, so both claims' ledgers are right and the deposit still reconciles. A recoupment the practice disputes is a work item, not a quiet adjustment ([Denials, Appeals & Claim Status](/books/health-tech/denials-and-appeals#audits-and-recoupments)).

## Secondary Claims

When a patient has a second plan, the primary's 835 is the input to the secondary claim. The secondary 837 carries the primary payer's adjudication in its other-payer loops: what the primary paid at the claim and line level and every `CAS` adjustment, with the remaining patient responsibility. The secondary payer then applies its own coordination method ([Coordination of Benefits](/books/health-tech/eligibility-and-benefits#coordination-of-benefits)).

Three things go wrong:

- **Billing the secondary before the primary pays,** which the secondary denies with a coordination reason.
- **Losing the primary's adjustments,** by building the secondary from charges instead of from the posted primary remittance. The secondary claim is generated from the posted 835 lines, adjustment codes included.
- **Crossovers billed twice.** Medicare forwards claims automatically to many supplemental payers and Medicaid (a crossover), and the primary 835 says so; a practice that also sends the secondary claim itself gets a duplicate denial. Stedi notes that if the crossover payer isn't part of the same parent corporation, the provider must be enrolled separately with it.

For dental, the secondary claim also needs the primary's handling of frequencies and downgrades, because the secondary's own rules may differ and its payment is computed from what's left.

## How to Build It

The core `remittances` row is one payer payment (trace number, method, amount, the 835 as a document), and each `remittance_lines` row is what the payer did with one claim line, with its adjustments as a JSON list of group, CARC and amount, its remark codes and the claim status code. This chapter adds the parse state and the 835's identifiers, provider-level adjustments, bank deposits and their reassociation, posting rules, and posting runs:

```sql
ALTER TABLE remittances                  -- trace_number, payment_method, payment_amount, paid_on core
  ADD COLUMN edi_txn_id      UUID REFERENCES edi_transactions (id),  -- the raw 835 as exchanged
  ADD COLUMN status          TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received',
                               'unbalanced', 'duplicate', 'posting', 'posted', 'exceptions'));

ALTER TABLE remittance_lines             -- amounts, adjustments, remarks and claim status are core
  ADD COLUMN patient_control_number TEXT NOT NULL,   -- CLP01, how the claim was matched
  ADD COLUMN line_control_number    TEXT,            -- Loop 2110 REF, how the line was matched
  ADD COLUMN procedure_code  TEXT NOT NULL,
  ADD COLUMN modifiers       TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN units           NUMERIC(8,2),
  ADD COLUMN crossed_over_to TEXT,                   -- the payer Medicare forwarded the claim to
  ADD COLUMN posting_status  TEXT NOT NULL DEFAULT 'pending' CHECK (posting_status IN ('pending',
                               'auto_posted', 'manual_posted', 'exception'));

CREATE TABLE provider_adjustments (      -- PLB: not tied to a claim in this ERA
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  remittance_id    UUID NOT NULL REFERENCES remittances (id),
  reason           TEXT NOT NULL,          -- recoupment, interest, forward balance, withhold
  reference        TEXT,                   -- the original claim, for a recoupment
  claim_id         UUID REFERENCES claims (id),
  amount           BIGINT NOT NULL         -- positive reduces the payment
);

CREATE TABLE bank_deposits (             -- money that reached the bank, from the bank's file or API
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  bank_account_ref TEXT NOT NULL,
  method           TEXT NOT NULL CHECK (method IN ('ach', 'check', 'card_settlement')),
  amount           BIGINT NOT NULL,
  trace_number     TEXT,                   -- CCD+ addenda field 3
  payer_name       TEXT,
  effective_date   DATE NOT NULL,
  source_ref       TEXT NOT NULL           -- the bank file and line it came from
);

CREATE TABLE eft_reassociations (        -- a deposit matched to its 835
  deposit_id       UUID PRIMARY KEY REFERENCES bank_deposits (id),
  remittance_id    UUID NOT NULL UNIQUE REFERENCES remittances (id),  -- one ERA, one EFT
  matched_by       TEXT NOT NULL,          -- typed actor: automation or the user who matched it
  matched_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE posting_rules (             -- which codes post how, per organization, dated
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID REFERENCES organizations (id),  -- null for the platform default
  payer_id         UUID REFERENCES payers (id),
  group_code       TEXT NOT NULL CHECK (group_code IN ('CO', 'PR', 'OA', 'PI')),
  reason_code      TEXT NOT NULL,          -- CARC
  remark_code      TEXT,
  action           TEXT NOT NULL CHECK (action IN ('contractual', 'to_patient', 'denial',
                     'review', 'informational')),
  valid_during     DATERANGE NOT NULL
);

CREATE TABLE posting_runs (              -- one auto-posting pass over one remittance
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  remittance_id    UUID NOT NULL REFERENCES remittances (id),
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at      TIMESTAMPTZ,
  lines_posted     INT NOT NULL DEFAULT 0,
  lines_excepted   INT NOT NULL DEFAULT 0,
  rule_versions    JSONB NOT NULL,         -- the posting rules in effect, for replay
  outcome          TEXT CHECK (outcome IN ('posted', 'partial', 'failed'))
);
```

Each adjustment in a line's JSON list is classified by the first posting rule that matches it, most specific first (organization and payer, then organization, then the platform default):

```sql
SELECT a.adj, r.action
FROM remittance_lines rl
CROSS JOIN LATERAL jsonb_array_elements(rl.adjustments) AS a(adj)
LEFT JOIN LATERAL (
  SELECT pr.action
  FROM posting_rules pr
  WHERE pr.group_code = a.adj->>'group'
    AND pr.reason_code = a.adj->>'carc'
    AND (pr.organization_id = $1 OR pr.organization_id IS NULL)
    AND (pr.payer_id = $2 OR pr.payer_id IS NULL)
    AND pr.valid_during @> CURRENT_DATE
  ORDER BY pr.organization_id NULLS LAST, pr.payer_id NULLS LAST
  LIMIT 1
) r ON TRUE
WHERE rl.remittance_id = $3;               -- a null action routes the line to a person
```

Reassociation is a match on the trace number with an amount check, run whenever either side arrives:

```sql
INSERT INTO eft_reassociations (deposit_id, remittance_id, matched_by)
SELECT d.id, r.id, 'automation'
FROM bank_deposits d
JOIN remittances r
  ON r.organization_id = d.organization_id
 AND r.trace_number = d.trace_number
 AND r.payment_amount = d.amount
WHERE d.organization_id = $1
  AND r.status <> 'duplicate'
  AND NOT EXISTS (SELECT 1 FROM eft_reassociations e WHERE e.deposit_id = d.id)
  AND NOT EXISTS (SELECT 1 FROM eft_reassociations e WHERE e.remittance_id = r.id)
ON CONFLICT DO NOTHING
RETURNING deposit_id, remittance_id;
```

Design notes:

- **Balance before posting.** Lines, claims and the payment must each add up; an unbalanced ERA is stored and flagged, never partly posted.
- **Post in one transaction per claim:** every ledger entry for a remittance claim commits together, keyed by the remittance claim so a retry can't post twice ([Idempotency Beyond the API](/docs/payments/idempotency#idempotency-beyond-the-api)).
- **Posting rules decide, and the decision is recorded** with the posting run's rule versions, so a misposting can be traced to the rule that caused it and fixed everywhere.
- **Payer payments are `payments` rows** with a payer source, applied to claim lines through ledger entries, the same as patient payments ([Payments Are Applied, Not Assigned](/docs/payments/payment-states#payments-are-applied-not-assigned)).
- **Events:** `remittance.received`, `remittance.posted`, `remittance.exception`, `deposit.unmatched` and `denial.opened`.

## Auditing

- **Every ERA, raw,** with its parse, and every deposit with its source bank file.
- **Every ledger entry traced to its source:** an adjustment row, a payment, a person's manual posting with a reason.
- **Reassociation breaks** and how each was resolved, with the payer contacted.
- **Write-offs by reason and person,** since denials written off as contractual are the classic revenue leak and a compliance question if patients were billed instead.
- **Virtual card payments and their fees,** per payer, as evidence for an EFT request.

## What This Means for the System You Build

- **Parse the 835 at line level** and refuse to post anything that doesn't balance at line, claim and payment level.
- **Store group, reason and remark codes on every adjustment,** with dated posting rules that say which are contractual, which move to the patient and which are denials.
- **Reassociate on the TRN trace number and amount,** get the CCD+ addenda from the bank, and work breaks after four business days.
- **Detect virtual card payments,** post the fee separately, and support the practice's right to standard EFT and ERA.
- **Never auto-write-off a denial;** open work instead.
- **Post recoupments to the claim they reverse** and reconcile the deposit anyway.
- **Build secondary claims from the posted primary remittance,** and watch for Medicare crossovers.

## References

**Regulations, operating rules and guidance**

- [45 CFR 162.1602: Standards for EFT and remittance advice](https://www.law.cornell.edu/cfr/text/45/162.1602), CCD+, the TRN in addenda field 3, the 835 version
- [CAQH CORE: EFT and ERA Reassociation Rule (CORE 370)](https://www.caqh.org/hubfs/EFTERA_Reassociation_Rule.pdf), the three-business-day release window and the late or missing definition
- [CMS: Guidance letter on virtual credit cards, EFT and ERA (May 24, 2022)](https://www.cms.gov/files/document/guidance-letter-vcc-eft-era.pdf), plans may pay by card, must honor EFT and ERA requests, can't require their business associate's services
- [CMS: Administrative simplification FAQs](https://www.cms.gov/priorities/key-initiatives/burden-reduction/administrative-simplification/subregulatory-guidance/faqs), the guidance letter's FAQ companion
- [CMS-588: EFT authorization agreement](https://www.cms.gov/medicare/cms-forms/cms-forms/downloads/cms588.pdf), Medicare's EFT requirement

**Code lists**

- [X12: Claim adjustment reason codes](https://x12.org/codes/claim-adjustment-reason-codes), CARCs 1, 2, 3, 16, 45, 97 and 197
- [X12: Claim adjustment group codes](https://x12.org/codes/claim-adjustment-group-codes), CO, OA, PI and PR
- [X12: Remittance advice remark codes](https://x12.org/codes/remittance-advice-remark-codes), M15, N130 and the list's update date

**Vendor documentation**

- [Stedi: Receive claim responses](https://www.stedi.com/docs/healthcare/receive-claim-responses), 835 delivery, claim and line matching, duplicate ERAs by trace number, crossover enrollment
