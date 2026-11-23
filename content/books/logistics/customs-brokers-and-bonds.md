+++
title = "Customs Brokers & Bonds"
nav_title = "Brokers & Bonds"
description = "Who may transact customs business: 19 CFR 111 licenses and permits, supervision, powers of attorney, reasonable care, customs bonds and recordkeeping."
category = "Logistics & Supply Chain Industry"
order = 2848
part = "Customs and Trade"
tags = ["logistics", "customs", "customs-brokers", "customs-bonds", "importer-of-record", "cbp"]
+++

Every commercial import into the United States has an importer of record: the party that tells CBP what the goods are, what they're worth and where they come from, and that owes the duty if the numbers turn out wrong. Most importers don't file themselves. They hire a licensed customs broker, sign a power of attorney, and post a bond with a surety that promises CBP it will pay if the importer doesn't. That three-way arrangement (importer, broker, surety) sits underneath every entry, every refund and every penalty in this part of the volume, and it is regulated tightly: a broker needs a federal license and a national permit, must supervise its employees in a way CBP can audit, must hold a power of attorney signed directly by each client, and keeps five years of records; a bond's amount is set by a formula CBP publishes and recomputes when the importer's duties grow.

The hard part for software is that the relationships are dated, scoped and easy to get wrong silently. A broker can file for an importer only while a valid power of attorney exists, under a permit that is active, on a bond that is in force and sufficient; a forwarder that hired the broker is not the client; the importer number on the entry must match the identity on file with CBP; and when duties multiply, as they did under the 2025 and 2026 tariff programs ([Tariff Programs](/books/logistics/tariff-programs)), a continuous bond that was sufficient last year can be insufficient this quarter. This chapter covers who may transact customs business, the broker's license, permit and continuing education, responsible supervision and control, powers of attorney, the importer's reasonable care and the broker's duties to the client, the importer of record and its number, customs bonds and how CBP sizes them, and recordkeeping. It extends `parties`, `party_roles` and `documents` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model); the entries these parties file are [Import Entry & ACE](/books/logistics/import-entry), and surety bonds as an insurance product are the Insurance volume's [Surety](/books/insurance/surety#bond-types).

## How the Platforms Do It

Customs brokerage is done by forwarders and brokers of every size, on software from a handful of vendors that connect to CBP's Automated Broker Interface. As of November 2026, from the companies' own filings:

| Company | Role | What it publishes about customs |
| --- | --- | --- |
| **Expeditors** | Forwarder and licensed customs broker | "Expeditors is licensed as a customs broker by the Customs and Border Protection (CBP) agency of DHS"; customs brokerage and other services were about 39% of 2025 revenue ($4.27 billion of $11.07 billion); "All United States customs brokers must maintain prescribed records and are subject to periodic audits by CBP"; pricing reflects "the number of declarations filed" |
| **C.H. Robinson** | Broker, forwarder and licensed customs broker | Performs customs brokerage "pursuant to its customs brokerage license issued by U.S. Customs and Border Protection"; CTPAT certified "as both a customs broker and NVOCC"; customs adjusted gross profit of $132.8 million in 2025, up from $107.5 million in 2024; customs brokerage is recorded at the net amount |
| **Descartes Systems Group** | Software | NetCHB connects brokers to ABI; importer security filing and Canada's ACI eManifest; denied party screening; fiscal 2026 revenue of $729.0 million |
| **WiseTech Global** | Software | CargoWise, a forwarding and customs platform, earned $756.9 million in fiscal 2026 (to June 30); WiseTech completed its acquisition of e2open, whose global trade products include customs compliance, on August 3, 2025 |

Three patterns:

- **Brokerage rides on forwarding.** The largest US brokers are forwarders that clear the freight they move, and the filings price brokerage per declaration. A broker's system is therefore usually a module of a forwarding system, sharing the shipment, the house bill and the client.
- **The broker earns a fee, not the duty.** C.H. Robinson's net presentation is the rule: duties and fees the broker advances for the importer are pass-through, owed to CBP whoever pays them, and only the brokerage fee is the broker's revenue. Model them as separate lines with separate payees.
- **Regulation is per filer, not per vendor.** Software vendors don't hold licenses; the broker does, and CBP audits the broker's records and supervision. Whatever the software, the broker's own records (powers of attorney, employee lists, client communications) have to be retrievable for five years.

## Who May Transact Customs Business

The statute defines a customs broker as "any person granted a customs broker's license" and customs business as "those activities involving transactions with U.S. Customs and Border Protection concerning the entry and admissibility" of merchandise, including classification, valuation, duties and the documents that support them (19 U.S.C. 1641(a)). "No person may conduct customs business (other than solely on behalf of that person)" without a license (1641(b)(1)). The parenthetical matters: an importer may file its own entries, and some large importers do, but a company filing for anyone else needs a license, and transacting customs business without one carries a penalty "not to exceed $10,000 for each such transaction" (1641(b)(6)).

A license is personal or corporate; a permit is what lets a licensed broker work. Since CBP's broker modernization rules took effect on December 19, 2022, "CBP eliminated broker districts and district permits" (CBP's modernization page), and "a national permit is required for the purpose of transacting customs business throughout the customs territory" (19 CFR 111.19(a)), with an individual broker qualifying the permit and supervising activity under it (111.19(f)). Three recurring obligations keep a license and permit alive, each of which revokes by operation of law if missed:

- **The license exam.** CBP gives the customs broker license examination "on the fourth Wednesday in April and October" (19 CFR 111.13).
- **The permit user fee.** For 2027, $190.88 per active permit, payable through the eCBP portal from November 30, 2026 and due January 29, 2027; missing it means "automatic permit revocation by operation of law," as of CBP's November 13, 2026 page.
- **The triennial status report and continuing education.** The regulation requires "at least 36 continuing education credits of qualifying continuing broker education each triennial period" (111.102(b)); for the first cycle, CBP's page says brokers "will be expected to certify completion of 20 hours of CE credits when filing the TSR," earned between January 1, 2025 and January 31, 2027, with the report filed between December 14, 2026 and February 28, 2027 (CBP recommends by January 31) with a $100 fee, and "Failure to complete CE credits and the TSR will result in the automatic revocation of your license by operation of law." CBP's page doesn't explain why the first cycle is 20 hours against the regulation's 36. <!-- source-gap: logistics-customs-brokers-ce-20-vs-36 | missing | why the 2024-2027 CE cycle requires 20 hours while 19 CFR 111.102(b) states 36 credits | closes with: the transition provision in the 2022 final rule or a CBP FAQ explaining the first-cycle figure | checked: 2026-11-22 -->

For a system, these are dated obligations per license and permit, each with a due date and a consequence, exactly the kind of deadline the playbook says to compute and store ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).

## Responsible Supervision and Control

"A customs broker shall exercise responsible supervision and control over the customs business that it conducts" (19 U.S.C. 1641(b)(4)), defined as "that degree of supervision and control necessary to ensure the proper transaction of the customs business of a broker" (19 CFR 111.1). The regulation doesn't set a ratio; it says a brokerage must employ "a sufficient number of licensed brokers relative to the job complexity" and lists what CBP weighs (111.28): training of employees, the volume and type of business, reject rates on filings, access to the tariff schedule and regulations, audits of employee transactions, timeliness of processing, and responsiveness to CBP. Since the modernization rules, a broker reports new and terminated employees, and changes to current employees' information, "within thirty (30) calendar days" (111.28(b)).

Those factors are data a broker's system already has or should: who prepared and who reviewed each entry, which filings ABI rejected and why, how long entries took from arrival to filing, and how fast CBP's requests were answered. My rule: record the preparer and the licensed reviewer on every filing as typed actors ([Typed Actors](/docs/building-blocks/audit-trails#typed-actors)), and make reject rate and review coverage reports a query over those records, not a spreadsheet assembled for an audit.

## The Power of Attorney

"Before transacting Customs business in the name of his principal, a customhouse broker is required to obtain a valid power of attorney," which the broker keeps with its records rather than filing with CBP (19 CFR 141.46). CBP Form 5291 "may be used" but isn't required; a power of attorney on other paper must be a general or limited power "executed in the same manner as a Customs Form 5291," and the form's own text runs "until and including" a date "or until notice of revocation in writing is duly given" (141.32).

The modernization rules closed the forwarder gap. "The broker must execute a customs power of attorney directly with the importer of record or drawback claimant," signed by the importer "and not via a freight forwarder or other third party," and an agreement with a forwarder can't prevent the importer and broker from communicating directly (19 CFR 111.36(c)(3)); brokers holding powers of attorney for existing active clients had until February 17, 2023 to meet it (CBP's modernization page). When a forwarder engages the broker, the importer must be told in advance which broker the forwarder chose, and the broker must send its charges to the importer directly (111.36(c)(1) and (2)). The broker keeps each power of attorney until it is revoked and then for five years after revocation or after the client stops being active (111.23).

In the data model the power of attorney is a dated grant from one party to another with a scope (general, or limited to named ports, activities or a drawback claim), a signer and a document. A broker's filing system checks it on every filing: no active power of attorney from this importer, no entry.

## Reasonable Care and the Broker's Duties

The importer's duty is in the entry statute. The importer of record, "either in person or by an agent authorized by the party in writing," makes entry "using reasonable care," filing "the declared value, classification and rate of duty applicable to the merchandise" and the information CBP needs to "collect accurate statistics" (19 U.S.C. 1484(a)(1)). Reasonable care is the standard against which CBP's penalties for false or negligent entries are measured, from negligence to fraud ([Import Entry & ACE](/books/logistics/import-entry) covers 19 U.S.C. 1592 and prior disclosure), and it stays with the importer when a broker files.

The broker's duties run to both the client and CBP:

- **Diligence in advice.** A broker "must exercise due diligence to ascertain the correctness of any information which the broker imparts to a client" (19 CFR 111.39(b)).
- **Telling the client about errors.** A broker that knows a client has not complied with the law or made an error or omission in a document must promptly advise the client, advise on corrective action, and keep a record of that communication (111.39(c)).
- **Money.** A broker must exercise "due diligence in making financial settlements," pay the government "on or before the date that payment is due," transmit a client's late payment "within 5 working days," and give a client a written statement of money received "within 60 calendar days of receipt" (111.29).
- **Penalties.** CBP may propose a monetary penalty against a broker "not to exceed $30,000 in total for a violation or violations" (19 U.S.C. 1641(d)(2)(A)), alongside license suspension or revocation.

The record of the error notice is the one systems forget. When a broker's classification review finds that last quarter's entries used the wrong tariff number, the advice to the client, the date, and the client's decision (a post-summary correction, a prior disclosure, nothing) are records the broker must be able to show.

## The Importer of Record

Entry documentation may be filed "by the owner or purchaser of the merchandise," or by a licensed broker the owner, purchaser or consignee designates, and "the importer of record must be one of the parties who is eligible to file the documentation" (19 U.S.C. 1484(a)(2)(B)). In practice the importer of record is the buyer, the seller selling delivered duty paid, or, for a nonresident seller, a party that takes on the obligation; who it is follows from the sale's Incoterms rule as much as from the paperwork ([Incoterms: DAP and DDP](/books/commerce/cross-border-commerce#incoterms-dap-and-ddp) covers the merchant's choice).

Every importer of record and ultimate consignee has an identity on file with CBP. CBP Form 5106, "Create/Update Importer Identity Form," is filed "with the first formal entry," using the IRS employer identification number where one exists, a Social Security number otherwise, or a number CBP assigns when neither exists (19 CFR 24.5). The entry summary instructions fix the formats: "IRS EIN NN-NNNNNNN," "IRS EIN with suffix NN-NNNNNNNXX," "SSN NNN-NN-NNNN" and "CBP assigned number YYDDPP-NNNNN," and the number "must reflect a valid identification number filed with CBP via the CBP Form 5106 or its electronic equivalent" (CBP Form 7501 instructions, rev. 11/26). A Social Security number on an importer record is a person's tax identifier and belongs in a vault, with the row holding a reference, as the core model does for CDL numbers.

## Customs Bonds

A customs bond is "a performance contract taken out by a party engaging in transactions or activities with CBP to adequately protect the revenue," a contract between principal and surety with "CBP is the third-party beneficiary" (CBP, A Guide for the Public: How CBP Sets Bond Amounts, February 2024). Sureties must be on Treasury's Circular 570, "a complete list of companies that write or reinsure federal bonds," last updated August 1, 2026 ([Circular 570 and the Underwriting Limitation](/books/insurance/surety#circular-570-and-the-underwriting-limitation) covers the surety's side).

### What the Importer's Bond Promises

The basic importation and entry bond (activity code 1, 19 CFR 113.62) binds principal and surety "jointly and severally" to deposit estimated duties, taxes and charges on time and pay later-assessed amounts on demand; to complete the entry and produce missing documents; and to redeliver conditionally released goods when CBP demands, no later than 30 days after release or after the conditional release period ends. When they don't, liquidated damages are set by the bond:

| Default | Liquidated damages (19 CFR 113.62) |
| --- | --- |
| Failure to redeliver | The value of the merchandise; three times value for restricted or prohibited merchandise or alcoholic beverages |
| Importer security filing violation | "$5,000 for each violation" |
| Advance air or truck cargo information, ACAS | $5,000 per violation |
| Unpaid estimated duties | Two times the unpaid amount or $1,000, whichever is greater |
| Other defaults not involving merchandise | $1,000 per default |

### Bond Types and Codes

The entry summary carries the bond type in block 5: "0" for government entries or entry types not requiring a bond, "8" for continuous, "9" for single transaction, with surety code "998" when cash or government securities stand in place of a surety and "999" when surety is waived (CBP Form 7501 instructions). CBP's guide lists the activity codes a bond can cover, among them 1 (basic importation and entry), 1a (drawback payment refunds), 2 (custodial, for bonded warehouses and carriers), 3 (international carrier), 4 (foreign trade zone operator) and 16 (importer security filing). A continuous bond "secures one or more transactions or activities over a one-year period, is renewed automatically on the anniversary of the effective date of the bond, and remains in effect until terminated"; a single transaction bond secures one. Since CBP's eBond test began on January 3, 2015, sureties transmit bonds to ACE electronically through the CATAIR eBond chapter, and a bond must be on file in ACE before activity under it.

### How CBP Sizes a Bond

For a continuous activity code 1 bond, "the minimum Activity Code 1 continuous bond amount is $50,000 or 10% of the total estimated duties, taxes, and fees in the previous 12-month period, whichever is greater," set "in increments of $10,000 up to $100,000 and then in increments of $100,000 for larger bonds"; CBP calls this the Reviewer formula. Informal entries, foreign trade zone admissions, warehouse withdrawals, drawback, vessel repair, Defense Contract Management Agency entries and the old Type 86 entries are left out of the base. CBP then adds the Analytical formula to that rounded amount: 10% of delinquent bills that are unprotested and under 210 days past due or protested, 100% of delinquent bills over 210 days or tied to a denied protest, and 100% of unpaid debit vouchers, and rounds the total up again in the same increments (the guide's Appendix B worksheet). An importer with no prior imports estimates the coming year, and "in no event can the bond amount be less than $50,000."

Worked, with numbers that are illustrative:

| Importer | Prior 12 months' duties, taxes and fees | 10% | Delinquent bills | Bond |
| --- | --- | --- | --- | --- |
| A | $310,000 | $31,000 | None | $50,000 (the floor) |
| B | $612,000 | $61,200 | None | $70,000 (next $10,000 step) |
| C | $2,340,000 | $234,000 | $40,000 protested (adds $4,000) | $400,000 ($300,000 rounded, plus $4,000, rounded up again) |

The worksheet rounds up at both steps ("rounded up by increments of $10,000 up to $100,000 and then by increments of $100,000"), and any bond amount is stated in whole dollars, fractions rounded to "the next highest dollar." A single transaction bond is generally "not less than the total entered value, plus all duties, taxes, and fees," 10% of entered value for unconditionally duty-free goods, three times the value for restricted merchandise, and never less than $100; an ISF-only continuous bond is at least $50,000 and a single transaction ISF bond at least $10,000.

### Sufficiency and Exhaustion

CBP's Revenue Division reviews continuous bonds periodically and issues a notice of insufficiency that requires a larger bond by a deadline; a port or center director can demand additional security immediately when a transaction "would place the revenue in jeopardy." A bond is "exhausted when the full amount of the bond, or in the case of a continuous bond the full amount of the bond for that annual period, has been paid by the principal or the surety as liquidated damages" or by the surety under other terms; duties the principal pays itself don't reduce it. Because the formula looks back twelve months, an importer whose duties jump (a new Section 232 or Section 301 duty on its main product, say) carries a bond sized on last year's duties until CBP's next review catches up, and the system that tracks the importer's rolling duties can see the insufficiency coming before the notice arrives.

## Recordkeeping

Brokers keep records in the customs territory "at least 5 years after the date of entry," and powers of attorney until revoked and then five years more (19 CFR 111.23). Importers keep entry records "for 5 years from the date of entry," drawback records until the third anniversary of "the date of payment of the claim," and packing lists for 60 days after the release period (19 CFR 163.4). Five years from entry is the floor for anything an entry relied on: the commercial invoice, the classification basis, the origin evidence, the power of attorney, the bond in force and the broker's communications about errors. When broker and importer both keep a copy, each is responsible for its own, so a broker's purge schedule never deletes the importer's records and an importer that changes brokers takes its history with it.

## How to Build It

Four tables carry the relationships: the broker's permits, the importer's grants of authority, the bonds, and the importer's identity with CBP. They extend `parties`, `party_roles` and `documents`:

```sql
-- A broker's license and national permit, with the obligations that revoke them.
CREATE TABLE customs_broker_permits (
  id                      UUID PRIMARY KEY DEFAULT uuidv7(),
  broker_party_id         UUID NOT NULL REFERENCES parties (id),  -- the licensed broker
  country                 CHAR(2) NOT NULL DEFAULT 'US',
  license_number          TEXT NOT NULL,
  permit_number           TEXT,          -- the national permit; null while only licensed
  filer_code              CHAR(3),       -- the entry filer code CBP assigned (Form 7501 block 1)
  qualifying_person_id    UUID REFERENCES parties (id),  -- the individual broker who qualifies it
  status                  TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'revoked',
                            'cancelled')),
  next_user_fee_due_on    DATE,          -- e.g. 2027-01-29 for the 2027 fee
  next_status_report_due_on DATE,        -- the triennial status report deadline
  ce_credits_certified    SMALLINT,      -- as certified on the last report
  valid_during            DATERANGE NOT NULL,
  UNIQUE (country, license_number),
  UNIQUE (country, filer_code)
);

-- A grant of authority from an importer (or drawback claimant) to a broker.
CREATE TABLE customs_powers_of_attorney (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  grantor_party_id   UUID NOT NULL REFERENCES parties (id),  -- the importer of record
  broker_party_id    UUID NOT NULL REFERENCES parties (id),
  scope              TEXT NOT NULL CHECK (scope IN ('general', 'limited')),
  limits             JSONB NOT NULL DEFAULT '{}',  -- for limited: ports, activities, a claim
  signed_by          TEXT NOT NULL,      -- name and title of the importer's signer
  executed_directly  BOOLEAN NOT NULL,   -- signed with the importer, not via a forwarder
  intermediary_party_id UUID REFERENCES parties (id),  -- the forwarder, if one engaged the broker
  valid_during       DATERANGE NOT NULL, -- upper bound: the stated end or the revocation
  revoked_at         TIMESTAMPTZ,
  retain_until       DATE,               -- five years after revocation or the last activity
  document_id        UUID NOT NULL REFERENCES documents (id),  -- the signed POA as received
  CHECK (executed_directly),             -- 19 CFR 111.36(c)(3)
  CHECK (grantor_party_id <> broker_party_id)
);
CREATE INDEX ON customs_powers_of_attorney (grantor_party_id, broker_party_id);

-- A customs bond: principal, surety, activity, amount and period.
CREATE TABLE customs_bonds (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  country            CHAR(2) NOT NULL DEFAULT 'US',
  principal_party_id UUID NOT NULL REFERENCES parties (id),
  surety_party_id    UUID REFERENCES parties (id),  -- null with cash in lieu of surety
  surety_code        CHAR(3),            -- CBP's surety code; '998' cash, '999' waived
  bond_number        TEXT NOT NULL,
  bond_type          CHAR(1) NOT NULL CHECK (bond_type IN ('8', '9')),  -- continuous, single
  activity_code      TEXT NOT NULL CHECK (activity_code IN ('1', '1a', '2', '3', '3a', '3a3', '4',
                       '5', '6', '7', '8', '9', '10', '11', '12', '15', '16', '17')),
  amount             BIGINT NOT NULL CHECK (amount >= 10000),  -- minor units; $100 minimum
  currency           CHAR(3) NOT NULL DEFAULT 'USD',
  effective_on       DATE NOT NULL,
  terminated_on      DATE,               -- continuous bonds renew until terminated
  customs_entry_ref  TEXT,               -- the one entry a single transaction bond secures
  status             TEXT NOT NULL CHECK (status IN ('pending', 'active', 'insufficient',
                       'exhausted', 'terminated')),
  document_id        UUID REFERENCES documents (id),
  UNIQUE (country, bond_number),
  CHECK (bond_type = '9' OR customs_entry_ref IS NULL)
);

-- The importer's identity with CBP: the number on every entry it files.
CREATE TABLE importer_records (
  party_id          UUID NOT NULL REFERENCES parties (id),
  country           CHAR(2) NOT NULL DEFAULT 'US',
  number_kind       TEXT NOT NULL CHECK (number_kind IN ('ein', 'ein_suffix', 'ssn',
                      'cbp_assigned')),
  number            TEXT,              -- EIN or CBP-assigned number, as formatted on the 7501
  number_vault_ref  TEXT,              -- for an SSN: a vault reference, never the number
  form_5106_filed_at TIMESTAMPTZ,      -- or the electronic equivalent's acceptance
  verified_at       TIMESTAMPTZ,       -- last confirmation that ACE holds this identity
  PRIMARY KEY (party_id, country),
  CHECK ((number_kind = 'ssn') = (number_vault_ref IS NOT NULL AND number IS NULL)),
  CHECK (number_kind <> 'ein' OR number ~ '^[0-9]{2}-[0-9]{7}$'),
  CHECK (number_kind <> 'ein_suffix' OR number ~ '^[0-9]{2}-[0-9]{7}[0-9A-Z]{2}$'),
  CHECK (number_kind <> 'cbp_assigned' OR number ~ '^[0-9]{6}-[0-9]{5}$')
);

-- The surety is a role, and the POA and bond are kept as exchanged. Both checks are
-- replaced: drop and re-add, unvalidated, then validate after any backfill.
ALTER TABLE party_roles
  DROP CONSTRAINT party_roles_role_check,
  ADD CONSTRAINT party_roles_role_check CHECK (role IN ('shipper', 'consignee', 'bill_to',
    'beneficial_cargo_owner', 'carrier', 'broker', 'freight_forwarder', 'nvocc',
    'customs_broker', 'importer_of_record', 'warehouse_operator', 'terminal_operator',
    'factor', 'freight_payment_provider', 'manufacturer', 'supplier', 'notify_party',
    'surety')) NOT VALID;

ALTER TABLE documents
  DROP CONSTRAINT documents_kind_check,
  ADD CONSTRAINT documents_kind_check CHECK (kind IN ('bill_of_lading', 'rate_confirmation',
    'proof_of_delivery', 'delivery_receipt', 'lumper_receipt', 'freight_invoice',
    'ocean_bill_of_lading', 'sea_waybill', 'air_waybill', 'arrival_notice',
    'commercial_invoice', 'packing_list', 'customs_entry', 'notice_of_assignment',
    'certificate_of_insurance', 'load_tender', 'tender_response', 'status_message',
    'ship_notice', 'power_of_attorney', 'customs_bond', 'bond_insufficiency_notice',
    'client_error_notice', 'other')) NOT VALID;
```

Before an entry is transmitted, the broker's system asks one question of these tables: may this broker file for this importer today, under which permit, on which bond?

```sql
SELECT p.filer_code, poa.id AS power_of_attorney_id, b.bond_number, b.amount,
       ir.number AS importer_number
FROM customs_broker_permits p
JOIN customs_powers_of_attorney poa
  ON poa.broker_party_id = p.broker_party_id
 AND poa.grantor_party_id = $2
 AND poa.valid_during @> CURRENT_DATE
 AND poa.revoked_at IS NULL
JOIN importer_records ir
  ON ir.party_id = $2 AND ir.country = 'US' AND ir.form_5106_filed_at IS NOT NULL
JOIN customs_bonds b
  ON b.principal_party_id = $2
 AND b.activity_code = '1'
 AND b.status = 'active'
 AND b.effective_on <= CURRENT_DATE
 AND (b.terminated_on IS NULL OR b.terminated_on > CURRENT_DATE)
WHERE p.broker_party_id = $1
  AND p.status = 'active'
  AND p.valid_during @> CURRENT_DATE
  AND (poa.scope = 'general' OR poa.limits->'ports' ? $3)
ORDER BY b.bond_type          -- a continuous bond ('8') before a single transaction bond
LIMIT 1;
```

No row means no entry: the filing waits for a power of attorney, a bond or a permit, and the reason is shown to the person who tried. The bond's sufficiency is a separate, continuous check, because CBP's formula is a function of the importer's own history:

```go tab="Go"
// ContinuousBondMinimum applies CBP's Reviewer and Analytical formulas to amounts in
// cents: 10% of the prior 12 months' duties, taxes and fees with a $50,000 floor,
// rounded up, plus additions for delinquent bills and unpaid debit vouchers, rounded
// up again ($10,000 steps through $100,000, $100,000 steps above).
func ContinuousBondMinimum(dutiesTaxesFees, delinquentProtestedOrRecent, delinquentOld, unpaidDebitVouchers int64) int64 {
	const floor = 5_000_000 // $50,000.00 in cents
	reviewer := max(dutiesTaxesFees/10, floor)
	reviewer = roundUpBond(reviewer) // Appendix B, line A
	total := reviewer + delinquentProtestedOrRecent/10 + delinquentOld + unpaidDebitVouchers
	return roundUpBond(total) // lines A + B + C + D, rounded up again
}

// roundUpBond rounds up to $10,000 steps through $100,000 and $100,000 steps above.
func roundUpBond(cents int64) int64 {
	step := int64(1_000_000) // $10,000
	if cents > 10_000_000 {   // above $100,000
		step = 10_000_000
	}
	return (cents + step - 1) / step * step
}
```

```rust tab="Rust"
/// Applies CBP's Reviewer and Analytical formulas to amounts in cents: 10% of the
/// prior 12 months' duties, taxes and fees with a $50,000 floor, rounded up, plus
/// additions for delinquent bills and unpaid debit vouchers, rounded up again.
pub fn continuous_bond_minimum(
    duties_taxes_fees: i64,
    delinquent_protested_or_recent: i64,
    delinquent_old: i64,
    unpaid_debit_vouchers: i64,
) -> i64 {
    const FLOOR: i64 = 5_000_000; // $50,000.00 in cents
    let reviewer = round_up_bond((duties_taxes_fees / 10).max(FLOOR)); // Appendix B, line A
    let total = reviewer
        + delinquent_protested_or_recent / 10
        + delinquent_old
        + unpaid_debit_vouchers;
    round_up_bond(total) // lines A + B + C + D, rounded up again
}

/// Rounds up to $10,000 steps through $100,000 and $100,000 steps above.
fn round_up_bond(cents: i64) -> i64 {
    let step: i64 = if cents > 10_000_000 { 10_000_000 } else { 1_000_000 };
    (cents + step - 1) / step * step
}
```

Run it nightly over each importer's trailing twelve months of entries (formal entries only, as the guide excludes informal, zone admission, withdrawal and drawback entries) and compare with the bond in force; a gap is a task for the broker to raise with the importer and its surety before CBP's notice arrives.

Design notes:

- **Every relationship is dated.** Permits, powers of attorney, bonds and importer identities each have a validity range, and every entry records which ones it relied on, so an audit five years later can show that the authority existed on the day of filing ([Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows)).
- **The forwarder is a party, not the client.** `intermediary_party_id` records who engaged the broker; the grant is still from the importer, and the broker's invoices go to the importer as 111.36 requires.
- **Advanced money is not revenue.** Duties, fees and bond premiums the broker pays for the importer are `freight_charges` of kind `duty` or `government_fee`, receivable from the importer and payable to CBP; the brokerage fee is a separate `brokerage_fee` line. The broker's margin is computed over its own lines only.
- **Identity numbers are formatted and validated at the edge.** The 7501's formats become checks, and an SSN never sits in a plain column.
- **Emit events on the obligations.** `customs_bond.insufficient`, `power_of_attorney.revoked`, `broker_permit.fee_due` and `broker_permit.revoked` are what stop filings and open tasks ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## Auditing

- **Authority on the day.** For every entry, the permit, power of attorney, importer identity and bond it was filed under, as they stood that day.
- **Every power of attorney** as signed, with its scope, the signer, any intermediary, revocation and the retention date that follows.
- **Every bond** with its surety, amount, activity code, period, insufficiency notices and the replacement bond that answered them.
- **Supervision evidence.** Preparer and licensed reviewer on each filing, ABI rejects with their reasons, employee additions and terminations with the date CBP was told.
- **Client communications about errors,** with what was found, when the client was told, and what it decided.
- **Money held for clients.** Every payment received from an importer, its transmission to CBP, and the statements sent to the client within 60 days.

The mechanics are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Block filings without authority:** an active permit, a direct power of attorney from the importer, an importer identity on file and a bond in force, checked on every transmission.
- **Treat license and permit obligations as dated deadlines** (the permit user fee, the triennial status report, continuing education), each of which revokes by operation of law.
- **Record the importer, not the forwarder, as the grantor,** and keep the forwarder as an intermediary party.
- **Recompute bond sufficiency from the importer's own entries,** with CBP's formula, and warn before the duties outgrow the bond.
- **Keep the broker's duties as records:** error notices to clients, payments transmitted within five working days, statements within 60 days.
- **Store importer numbers in CBP's formats,** with Social Security numbers vaulted.
- **Keep everything five years from entry,** and powers of attorney five years past revocation.

## References

**Statutes and regulations**

- [19 U.S.C. 1641: Customs brokers](https://www.law.cornell.edu/uscode/text/19/1641), definitions of customs broker and customs business, the license requirement, responsible supervision, and the $10,000 and $30,000 penalties
- [19 U.S.C. 1484: Entry of merchandise](https://www.law.cornell.edu/uscode/text/19/1484), reasonable care, what entry files, and who may be importer of record
- [19 CFR 111.1: Definitions](https://www.law.cornell.edu/cfr/text/19/111.1), responsible supervision and control, and the triennial period
- [19 CFR 111.13: Written examination](https://www.law.cornell.edu/cfr/text/19/111.13), the fourth Wednesday in April and October
- [19 CFR 111.19: Permits](https://www.law.cornell.edu/cfr/text/19/111.19), the national permit and its qualifying broker
- [19 CFR 111.23: Retention of records](https://www.law.cornell.edu/cfr/text/19/111.23), five years from entry, and powers of attorney after revocation
- [19 CFR 111.28: Responsible supervision and control](https://www.law.cornell.edu/cfr/text/19/111.28), the factors CBP weighs and employee reporting
- [19 CFR 111.29: Diligence in correspondence and paying monies](https://www.law.cornell.edu/cfr/text/19/111.29), payment timing and client statements
- [19 CFR 111.36: Relations with unlicensed persons](https://www.law.cornell.edu/cfr/text/19/111.36), freight forwarders and the direct power of attorney
- [19 CFR 111.39: Advice to client](https://www.law.cornell.edu/cfr/text/19/111.39), diligence and notice of errors
- [19 CFR 111.102: Continuing education](https://www.law.cornell.edu/cfr/text/19/111.102), 36 credits per triennial period
- [19 CFR 113.62: Basic importation and entry bond conditions](https://www.law.cornell.edu/cfr/text/19/113.62), the obligations and liquidated damages
- [19 CFR 141.32: Form for power of attorney](https://www.law.cornell.edu/cfr/text/19/141.32), CBP Form 5291 and its alternatives
- [19 CFR 141.46: Power of attorney retained by customhouse brokers](https://www.law.cornell.edu/cfr/text/19/141.46), obtained before transacting business and kept with the broker's records
- [19 CFR 163.4: Record retention period](https://www.law.cornell.edu/cfr/text/19/163.4), five years from entry, drawback and packing lists
- [19 CFR 24.5: Filing identification number](https://www.law.cornell.edu/cfr/text/19/24.5), CBP Form 5106, EIN, SSN and CBP-assigned numbers

**Government**

- [CBP: Customs brokers](https://www.cbp.gov/trade/programs-administration/customs-brokers), the 2027 permit user fee, payment window and automatic revocation
- [CBP: Broker modernization](https://www.cbp.gov/trade/programs-administration/customs-brokers/modernization), the December 19, 2022 effective date, national permits, the direct power of attorney and employee lists
- [CBP: Triennial status report and continuing education](https://www.cbp.gov/trade/programs-administration/customs-brokers/customs-broker-triennial-status-report-tsr-and-continuing-education-ce-requirements), the 20-hour first cycle, the filing window and fee, and revocation
- [CBP: A Guide for the Public: How CBP Sets Bond Amounts (February 2024)](https://www.cbp.gov/sites/default/files/assets/documents/2024-Feb/FINAL_A%20Guide%20for%20the%20Public_How%20CBP%20Sets%20Bond%20Amounts%20%28February%202024%29_0.pdf), bond definitions, activity codes, the Reviewer and Analytical formulas, single transaction and ISF bond amounts, eBond and sufficiency reviews
- [CBP: Form 7501 and instructions (rev. 11/26)](https://www.cbp.gov/document/forms/form-7501-entry-summary-continuation-sheets), bond type and surety codes, filer codes and importer number formats
- [Bureau of the Fiscal Service: Circular 570](https://www.fiscal.treasury.gov/surety-bonds/circular-570.html), Treasury's listing of approved sureties and its August 1, 2026 update

**Filings**

- [Expeditors International: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/746515/000119312526071569/expd-20251231.htm), its customs broker license, CBP audits, the share and amount of customs brokerage revenue and per-declaration pricing
- [C.H. Robinson Worldwide: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1043277/000104327726000009/chrw-20251231.htm), its customs brokerage license, CTPAT certification, customs adjusted gross profit and net revenue recognition
- [Descartes Systems Group: Annual Information Form for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1050140/000110465926026450/dsgx-20260131xex99d1.htm), NetCHB, security filings, screening and revenue
- [WiseTech Global: FY26 results (August 26, 2026)](https://announcements.asx.com.au/asxpdf/20260826/pdf/07379lj9h8npgj.pdf), CargoWise revenue
- [WiseTech Global: Completes strategic acquisition of e2open (August 3, 2025)](https://www.wisetechglobal.com/news/wisetech-global-completes-strategic-acquisition-of-e2open/), the completion date
