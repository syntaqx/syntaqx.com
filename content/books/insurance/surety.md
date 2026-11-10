+++
title = "Surety Bonds"
description = "The three-party bond, contract vs commercial bonds, the Miller Act, Circular 570 and the 10% underwriting limitation worked, indemnity and e-bonds."
category = "Insurance Industry"
order = 2750
part = "Commercial and Specialty Lines"
tags = ["insurance", "surety", "bonds", "construction", "federal-contracts", "commercial-lines"]
+++

A surety bond is a guarantee sold by an insurance company. It has three parties: the **principal**, who owes an obligation (a contractor to finish a building, a licensee to follow the law, an executor to administer an estate honestly); the **obligee**, who is owed it (the project owner, the state, the court); and the **surety**, which promises the obligee that the principal will perform or the surety will pay, up to the bond's **penal sum**. It looks like insurance, is written and regulated by insurers, and is reported on its own statutory line, but it works the other way around: the surety expects no losses, because the principal is liable to repay it for anything it pays. A surety's underwriting is credit underwriting, and its premium is closer to a fee for lending its balance sheet than to a price for expected losses.

For the system, a bond is not a policy in the usual sense. There is no insured; the obligee holds the rights and the principal pays and indemnifies. A claim is a demand by the obligee that the surety investigate a default, and the surety's main asset after paying is its indemnity claim against the principal and the people who signed for it. This chapter covers the parties and the bond types, federal bonds under the Miller Act and Treasury's Circular 570 (with the underwriting limitation worked), indemnity agreements, claims, bond forms and electronic bonds. It extends `policies` and `parties` from [The Core Data Model](/books/insurance/insurance-business#the-core-data-model) with `bonds` and `indemnity_agreements`. Bonds a field service business must carry for licensing are covered from the business's side in [Bonds and Certificates of Insurance](/books/field-operations/licensing-and-permits#bonds-and-certificates-of-insurance); surety bonds in place of rental deposits are in [Deposit Alternatives](/books/property-tech/insurance-deposits-and-guarantees#deposit-alternatives).

## How the Platforms Do It

As of November 2026, from 2025 filings:

| Company | Surety business | What the filing says |
| --- | --- | --- |
| **RLI** | Contract, commercial and transactional surety | 2025 surety net premiums earned of $148.0 million: transactional $52.4 million, commercial $50.7 million, contract $44.9 million; surety sold through independent agents |
| **Palomar** | Surety through acquisitions | Bought First Indemnity of America, a New Jersey surety, in January 2025, and The Gray Casualty & Surety Company in January 2026 (renamed Palomar Casualty & Surety) |
| **Skyward Specialty** | Surety division | One of its nine underwriting divisions |
| **US Treasury** | Federal acceptance list | Circular 570 lists the companies holding certificates of authority as acceptable sureties on federal bonds, updated August 1, 2026 |
| **SBA** | Guarantees for small contractors | Guarantees bonds on contracts up to $9 million (non-federal) and $14 million (federal), for a fee of 0.6% of the contract price |

RLI's split is the industry's split. **Contract** surety (bid, performance and payment bonds on construction) is the largest and most underwritten; **commercial** surety covers everything else a law or contract requires (license and permit, court, fiduciary, customs, utility deposits, public official bonds); **transactional** is RLI's term for the small, high-volume commercial bonds issued almost instantly, often online through agents.

## Bond Types

| Type | Obligee | What the surety guarantees |
| --- | --- | --- |
| **Bid bond** | Project owner | The bidder will sign the contract and provide performance and payment bonds if awarded, or pay the difference to the next bidder up to the penal sum |
| **Performance bond** | Project owner | The contractor will perform the contract; on default the surety may finance the contractor, hire a completion contractor, tender a new contractor or pay |
| **Payment bond** | Subcontractors and suppliers (through the owner) | The contractor will pay for labor and materials; it replaces lien rights on public projects, where liens on public property aren't allowed |
| **Maintenance / warranty bond** | Project owner | Defects in completed work will be fixed for a period |
| **License and permit bond** | A state or city | The licensee (a contractor, auto dealer, mortgage broker, collection agency) will comply with the licensing law; consumers harmed may claim |
| **Court and fiduciary bonds** | A court | Appeal bonds secure a judgment pending appeal; fiduciary bonds guarantee an executor, administrator, guardian or trustee |
| **Customs and federal bonds** | US government agencies | Importers' duties, federal licensing and contract obligations |
| **Public official bonds** | A public body | Faithful performance by an official who handles public money |

Fidelity bonds (employee dishonesty) are named bonds but are really two-party insurance for the employer, and are usually written on crime forms.

## Federal Bonds and the Miller Act

On federal construction contracts, the Miller Act (40 USC 3131) requires both bonds "before any contract of more than $100,000 is awarded for the construction, alteration, or repair of any public building or public work of the Federal Government":

- a **performance bond** with a surety satisfactory to the officer awarding the contract, "in an amount the officer considers adequate," for the protection of the Government; and
- a **payment bond** "for the protection of all persons supplying labor and material in carrying out the work," which "shall equal the total amount payable by the terms of the contract" unless the contracting officer finds in writing that this is impractical, and in no case less than the performance bond.

The statute's $100,000 is applied as an inflation-adjusted threshold: FAR 28.102-1 requires both bonds on construction contracts "exceeding $150,000," and for contracts between $35,000 and $150,000 the contracting officer selects two or more payment protections (a payment bond, an irrevocable letter of credit, a tripartite escrow, certificates of deposit or deposited securities). The threshold is a dated parameter, not a constant. Most states have parallel "Little Miller Acts" for state and local public works with their own thresholds and claim notice rules, so the bond requirement and the claimant's notice deadlines are data per jurisdiction and project type.

### Circular 570 and the Underwriting Limitation

A federal bond must be written by a surety Treasury has certified. The Bureau of the Fiscal Service administers the program under 31 USC 9304-9308 and publishes Circular 570, "a complete list of companies that write or reinsure federal bonds," updated August 1, 2026 as of this writing. Each listed company has an underwriting limitation, defined in 31 CFR 223.10: no certified company may underwrite "any single risk on any bond or policy" greater than "10 percent of the paid-up capital and surplus of such company, as determined by Treasury." A single risk is "the total risk under one bond or policy," however many individual risks it covers, and the full penal sum counts, except for named cases: an appeal bond counts as the judgment plus 10%, and a contract bond written above the contract amount counts as the contract amount.

Above the limitation, 31 CFR 223.11 allows two protective methods. **Co-surety**: several certified companies may write one bond as long as each one's share is within its own limitation. **Reinsurance**: a company writing a bond to the United States must "reinsure liability in excess of the underwriting limitation," with certified reinsurers, each within its own limitation, and reinsurance on federal bonds is due "within 45 days from the date of execution and delivery of the bond" (the agency may shorten that). For Miller Act bonds the reinsurance uses Standard Forms 273, 274 and 275.

A worked limitation, with numbers that are mine: a surety's Treasury-determined paid-up capital and surplus is $85,000,000, so its underwriting limitation is $8,500,000. A contractor wins a $12,000,000 federal building contract and needs a performance bond and a payment bond, each in the full contract amount.

| Bond | Penal sum | Within $8.5M? | Protection needed |
| --- | --- | --- | --- |
| Performance | $12,000,000 | No | Reinsure $3,500,000 with certified reinsurers, each within its own limitation, within 45 days of delivering the bond; or a co-surety takes at least $3,500,000 |
| Payment | $12,000,000 | No | The same, separately: each bond is its own single risk |

If the surety cedes the excess to a reinsurer whose limitation is $2,000,000, it needs at least two reinsurers ($2,000,000 plus $1,500,000) for each bond, and the system tracks four reinsurance agreements against a 45-day deadline. An SBA guarantee, available on a federal contract of this size (the program reaches $14 million), would protect the surety against part of a loss but would not change its Treasury limitation or the protection the bond needs.

## Underwriting

Contract surety underwriting is the "three Cs": character, capacity and capital. The surety reviews the contractor's financial statements (CPA-reviewed or audited above small programs), work-in-progress schedules showing every open job's contract value, billings, costs and estimated profit, bank lines of credit, backlog, experience with similar work, and the owners' personal financial strength. It sets an **aggregate program** (the total backlog of bonded work it will support) and a **single job limit**, and every bond request is checked against both. Commercial bonds are underwritten by class: a license bond for a notary is issued on an application and a credit check; a large appeal bond needs collateral.

Premium is usually a percentage of the contract price (for contract bonds, on a sliding scale by contract size) or a flat amount per bond for small commercial bonds, on rates the surety files like other P&C rates. Because the principal indemnifies the surety, the premium is not loss-cost driven in the same way as insurance.

## Indemnity Agreements

Before writing contract bonds, the surety has the principal and usually its owners and their spouses sign a **general indemnity agreement**. Its usual terms: the indemnitors repay the surety for every loss, cost and attorney's fee; the surety may settle claims in its discretion and its payment is evidence of liability; the indemnitors must post collateral when the surety sets up a reserve (collateral security); the surety takes an assignment of contract proceeds, equipment and materials on default; and the surety may take over the contractor's books and bank accounts.

For the system, the indemnity agreement is a contract among parties that outlives any one bond: one agreement covers every bond issued to the principal and its affiliates, with a list of indemnitors who can be added or released, and the surety's recovery after a loss is a receivable against all of them.

## Claims

A surety claim is a demand by an obligee or claimant, not a first-party loss. The surety investigates whether the principal defaulted and whether the claimant is covered by the bond and gave timely notice, and it has the defenses the principal has. The Miller Act's clocks show the shape: a supplier unpaid 90 days after its last labor or material may sue on the payment bond; one with a contract only with a subcontractor must first give the prime contractor written notice within 90 days of its last labor or material; and every action "must be brought no later than one year after the day on which the last of the labor was performed or material was supplied" (40 USC 3133). On a performance bond default, the surety chooses among financing the principal, completing the work through a completion contractor, tendering a new contractor to the owner, or paying the penal sum or the owner's damages.

The money runs backward as well: every surety payment opens a recovery against the principal and indemnitors under the indemnity agreement, plus salvage of contract balances and equipment. Loss ratios net of these recoveries are what the line is underwritten on, so the claims system must book them as `recoveries` against the same exposure.

## Bond Forms and E-Bonds

The obligee usually writes the bond form, not the surety: federal agencies prescribe Standard Forms under FAR 28.106-1 (SF 24 bid bond, SF 25 performance bond, SF 25A payment bond, SF 34 and 35 annual bonds, SF 273 to 275 reinsurance agreements, SF 1414 and 1415 consents of surety), public owners use statutory forms, and private owners use AIA's or ConsensusDocs' forms or their own. The surety's job is to issue the right form with the right penal sum, effective date and parties, executed by an **attorney-in-fact** under a power of attorney from the surety and sealed. Forged and altered bonds are a long-standing fraud, which is why obligees verify bonds with the surety.

Electronic bonds replace the wet-signed, sealed paper. State transportation departments take electronic bid bonds through clearinghouses: Illinois DOT "accepts electronic bid bonds from Surety2000 and SurePath" ([Illinois DOT: bid bonds](https://webapps.dot.illinois.gov/WCTB/LbBidBonds?page=1)), and Alaska's bidding guide has staff verify each bond on "the two electronic bid bond clearinghouses," Surety2000 and SurePath (SuretyWave) ([Alaska DOT&PF: 5.13 Electronic Bid Bonds (PDF)](https://dot.alaska.gov/aashtoware/docs/preconstruction/Bidding%20-%205.13%20Electronic%20Bid%20Bonds.pdf)). For federal bid bonds it depends on the solicitation: I found no agency-wide federal acceptance, and where a solicitation didn't authorize electronic submission GAO upheld the Army Corps of Engineers' rejection of a bid bond that "contained a copy of the surety agent's signature" ([GAO: TJ's Marine Construction LLC, B-402227, January 7, 2010 (PDF)](https://www.gao.gov/pdf/product/387695)). Some states are reported to take license bond filings electronically from sureties; I haven't opened one. An e-bond is a signed, verifiable record held on a platform where the obligee can confirm it came from the surety and was issued by an authorized attorney-in-fact. <!-- source-gap: ebond-platforms | missing | which federal agencies accept electronic bid bonds and through which platforms, and which states take license bonds electronically | closes with: an agency notice or solicitation clause, or a state license-bond e-filing page, opened | checked: 2026-11-10 -->

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model). A bond is a `policies` row (so premium, commissions, statutory reporting and claims reuse the spine) with a `bonds` record for what makes it a bond: the penal sum, the obligee, the form, the attorney-in-fact and the limitation check. The principal is the named insured `party_role`; the obligee is a `party_role` of its own.

```sql
CREATE TABLE bonds (                       -- one bond, issued on a policies row
  policy_id          UUID PRIMARY KEY REFERENCES policies (id),
  bond_type          TEXT NOT NULL CHECK (bond_type IN ('bid', 'performance', 'payment',
                       'maintenance', 'license_permit', 'court', 'fiduciary', 'customs',
                       'public_official', 'other_commercial')),
  penal_sum          BIGINT NOT NULL,       -- minor units; the surety's maximum liability
  limitation_basis   BIGINT NOT NULL,       -- the liability counted under 31 CFR 223.10(b)
  obligee_party_id   UUID NOT NULL REFERENCES parties (id),
  contract_ref       TEXT,                  -- the project or license number
  contract_amount    BIGINT,
  form_ref           TEXT NOT NULL,         -- 'SF 25A', 'state statutory', 'AIA A312', ...
  form_document_id   UUID,                  -- the obligee's form as executed
  attorney_in_fact_id UUID REFERENCES parties (id),
  poa_number         TEXT,                  -- the power of attorney used
  executed_on        DATE NOT NULL,
  federal            BOOLEAN NOT NULL DEFAULT FALSE,
  indemnity_agreement_id UUID,              -- indemnity_agreements
  electronic_ref     TEXT,                  -- e-bond platform id, when issued electronically
  status             TEXT NOT NULL CHECK (status IN ('issued', 'in_force', 'released',
                       'exonerated', 'claimed', 'cancelled'))
);

CREATE TABLE surety_limitations (          -- Treasury's figure for each certified company
  insurer_id         UUID NOT NULL REFERENCES insurers (id),
  effective_from     DATE NOT NULL,         -- per the Circular 570 edition
  underwriting_limitation BIGINT NOT NULL,  -- 10% of paid-up capital and surplus
  source             TEXT NOT NULL,         -- 'Circular 570, 2026-08-01'
  PRIMARY KEY (insurer_id, effective_from)
);

CREATE TABLE bond_protections (            -- co-surety and reinsurance above the limitation
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  bond_policy_id     UUID NOT NULL REFERENCES bonds (policy_id),
  method             TEXT NOT NULL CHECK (method IN ('co_surety', 'reinsurance',
                       'pledged_assets', 'letter_of_credit')),
  counterparty_insurer_id UUID REFERENCES insurers (id),
  amount             BIGINT NOT NULL,
  form_ref           TEXT,                  -- 'SF 273' for Miller Act reinsurance, ...
  due_by             DATE,                  -- executed + 45 days for federal bonds
  executed_on        DATE,
  delivered_to_agency_on DATE
);

CREATE TABLE indemnity_agreements (        -- one agreement, many bonds
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  principal_party_id UUID NOT NULL REFERENCES parties (id),
  signed_on          DATE NOT NULL,
  document_id        UUID NOT NULL,         -- the signed agreement
  collateral_required BIGINT NOT NULL DEFAULT 0,
  aggregate_program  BIGINT,                -- the bonded backlog the surety will support
  single_job_limit   BIGINT
);

CREATE TABLE indemnitors (
  indemnity_agreement_id UUID NOT NULL REFERENCES indemnity_agreements (id),
  party_id           UUID NOT NULL REFERENCES parties (id),
  role               TEXT NOT NULL CHECK (role IN ('principal', 'affiliate', 'owner',
                       'spouse', 'other')),
  added_on           DATE NOT NULL,
  released_on        DATE,
  PRIMARY KEY (indemnity_agreement_id, party_id)
);
```

The limitation check runs at issue and its shortfall becomes the protection rows the bond needs before the deadline:

```sql
SELECT b.policy_id,
       b.limitation_basis - sl.underwriting_limitation AS excess_to_protect,
       b.executed_on + 45 AS reinsurance_due,
       COALESCE(SUM(bp.amount), 0) AS protected
FROM bonds b
JOIN policies p ON p.id = b.policy_id
JOIN LATERAL (SELECT underwriting_limitation FROM surety_limitations
              WHERE insurer_id = p.insurer_id AND effective_from <= b.executed_on
              ORDER BY effective_from DESC LIMIT 1) sl ON TRUE
LEFT JOIN bond_protections bp ON bp.bond_policy_id = b.policy_id
WHERE b.federal
  AND b.limitation_basis > sl.underwriting_limitation
GROUP BY b.policy_id, b.limitation_basis, sl.underwriting_limitation, b.executed_on;
```

Design notes:

- **The bond is a policy with an obligee.** Reuse the policy spine for premium, commissions and statutory reporting; put the obligee, penal sum and form in `bonds`; never model the obligee as the insured.
- **The limitation basis is not always the penal sum.** Store the counted liability separately (judgment plus 10% for appeal bonds, the contract amount for overbonded contracts), computed by rule with its citation.
- **Exoneration ends a bond, not expiry.** Many bonds have no expiry date: a performance bond runs until the work is accepted and the warranty period ends, a license bond until the surety cancels on notice to the obligee. The status needs `released` and `exonerated`, with the obligee's release letter as the evidence.
- **Recoveries are expected.** A paid surety claim opens a `recoveries` row against the indemnitors on the agreement, and collateral demands are notices with deadlines.
- **Program limits are checked at every bond request.** The aggregate program and single job limit live on the indemnity agreement, and the bonded backlog is the sum of open contract bonds' remaining contract amounts.

## Auditing

- **Every bond as executed:** the form, penal sum, parties, attorney-in-fact and power of attorney number, so the surety can confirm or deny a bond an obligee presents.
- **Limitation and protection.** For each federal bond, the limitation in effect, the counted liability, and every co-surety or reinsurance agreement with its execution date against the 45-day rule.
- **Indemnity coverage.** Which agreement and indemnitors stood behind each bond on its execution date, and every release.
- **Claim and recovery.** Each claim's notice dates against the statutory deadlines, the default decision, payments and recoveries from indemnitors and salvage.

## What This Means for the System You Build

- **Model a bond as a policy plus a bond record** with the obligee, penal sum, form and attorney-in-fact.
- **Load Treasury's limitations by Circular 570 edition** and check every federal bond against them at issue.
- **Generate the co-surety or reinsurance tasks** with the 45-day deadline when a bond exceeds the limitation.
- **Keep indemnity agreements as their own contracts,** with indemnitors over time and program limits checked on every request.
- **End bonds by release or exoneration,** not by a date, and keep the release as evidence.
- **Book recoveries from indemnitors** against every paid surety claim.

## References

**Law and regulation**

- [40 USC 3131](https://www.law.cornell.edu/uscode/text/40/3131), the Miller Act: performance and payment bonds on federal construction contracts over $100,000 and the payment bond amount
- [40 USC 3133](https://www.law.cornell.edu/uscode/text/40/3133), payment bond suits: the 90-day wait, the 90-day notice for second-tier claimants and the one-year limit
- [FAR 28.102-1](https://www.acquisition.gov/far/28.102-1), the $150,000 threshold for Miller Act bonds and the payment protections between $35,000 and $150,000
- [FAR 28.106-1](https://www.acquisition.gov/far/28.106-1), the federal bond and reinsurance Standard Forms
- [31 CFR 223.10](https://www.law.cornell.edu/cfr/text/31/223.10), the underwriting limitation of 10% of paid-up capital and surplus, the single risk, and the counted liability for appeal and contract bonds
- [31 CFR 223.11](https://www.law.cornell.edu/cfr/text/31/223.11), co-surety and reinsurance above the limitation, the 45-day deadline for reinsurance on federal bonds and Standard Forms 273 to 275

**Regulators and guidance**

- [US Treasury, Bureau of the Fiscal Service: Circular 570](https://www.fiscal.treasury.gov/surety-bonds/circular-570.html), the list of certified companies acceptable on federal bonds and as reinsurers, administered under 31 USC 9304-9308, updated August 1, 2026
- [US Small Business Administration: Surety bonds](https://www.sba.gov/funding-programs/surety-bonds), guarantees on contracts up to $9 million non-federal and $14 million federal, and the 0.6% fee
- [Illinois DOT: bid bonds](https://webapps.dot.illinois.gov/WCTB/LbBidBonds?page=1), electronic bid bonds accepted from Surety2000 and SurePath
- [Alaska DOT&PF: 5.13 Electronic Bid Bonds (PDF)](https://dot.alaska.gov/aashtoware/docs/preconstruction/Bidding%20-%205.13%20Electronic%20Bid%20Bonds.pdf), verifying bonds on the two clearinghouses
- [GAO: TJ's Marine Construction LLC, B-402227, January 7, 2010 (PDF)](https://www.gao.gov/pdf/product/387695), a bid bond with a copied surety signature rejected as nonresponsive

**Filings**

- [RLI Corp.: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/84246/000110465926018013/rli-20251231x10k.htm), surety net premiums earned by contract, commercial and transactional, and distribution through independent agents
- [Palomar Holdings: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1761312/000119312526067364/plmr-20251231.htm), the acquisitions of First Indemnity of America and The Gray Casualty & Surety Company
- [Skyward Specialty: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1519449/000151944926000015/skwd-20251231.htm), the Surety division among its nine underwriting divisions
