+++
title = "Closing, eNotes & MERS"
description = "Mortgage closing as records: wet, hybrid and eNote closings, RON, SMART Doc eNotes, control under E-SIGN and UETA, MERS and the eRegistry, and the post-closing file."
category = "Banking & Lending Industry"
order = 2450
part = "Origination and Underwriting"
tags = ["banking", "lending", "mortgages", "enotes", "mers", "remote-online-notarization", "closing"]
+++

Closing is where a loan stops being an application and becomes property. The borrower signs a promissory note (the debt) and a mortgage or deed of trust (the lien on the home), a notary acknowledges the security instrument so the county will record it, the settlement agent disburses the money, and the lender walks away holding a negotiable instrument it will probably sell within weeks. On paper, whoever holds the original note, properly endorsed, can enforce it, and a vault of wet-ink originals is how the industry has tracked who that is. An electronic note can't be "held," so federal and state law replaced possession with **control**, and the mortgage industry built one registry (the MERS eRegistry) to say who has it.

This chapter covers the closing types from wet ink to fully remote, the closing table and the rescission period that holds funding on refinances, notarization in person, electronic and remote, eNotes in the MISMO SMART Doc format, control under E-SIGN and UETA, the MERS System and the eRegistry, delivering eNotes to investors, and the post-closing file, all as of October 2026. The disclosures that must reach the borrower before the closing are in [TRID & Mortgage Disclosures](/books/banking-and-lending/mortgage-disclosures); the generic electronic signature rules are in the playbook's [Electronic Signatures](/docs/compliance/electronic-signatures); the same control concept for auto contracts is in [Electronic Contracts and Control](/books/banking-and-lending/auto-lending#electronic-contracts-and-control); selling the loan is The Secondary Mortgage Market.

## How the Platforms Do It

Digital closing is a stack of specialists around the LOS. As of October 2026, from vendor, registry and agency pages:

| Who | Role | Public detail |
| --- | --- | --- |
| **MERS (ICE)** | The registries | The MERS System tracks servicing rights and beneficial ownership; the eRegistry is the system of record for the Controller and Location of each eNote; "3.3M+ eNotes registered" since inception (undated). ICE bought the remaining equity of MERSCORP Holdings on October 4, 2018 |
| **Snapdocs** | eClosing, eVault, RON | Supports wet, hybrid, eNote and RON closings; its eVault is "Compliant with MERS, MISMO, and GSEs" and separates authoritative from non-authoritative copies |
| **DocMagic** | Documents, eClose, eVault | Total eClose for "completely paperless eClosings"; SmartSAFE eVault with "Direct eDelivery and seamless connectivity with the MERS eRegistry" and a tamper-evident seal |
| **Proof (formerly Notarize)** | Remote online notarization | Lists MISMO certification; says First American Title completed over 50,000 RON signings with it |
| **ICE Encompass** | LOS | eClose, MERS registration and recording from the system of record |
| **Pavaso** | (exited) | Old Republic Title says "The wind down of business operations of Pavaso is now complete" |

Adoption is real but partial: Fannie Mae's eNote share of deliveries through the first quarter of 2026 was 16.8% overall, 24.0% for refinances and 11.3% for purchases, per MISMO's statistics page. Most loans still close with a wet-ink note, which means a lender's system has to support every closing type at once, and Pavaso's exit is a reminder that the eVault holding the authoritative copy is a vendor you may have to leave.

## Closing Types

- **Wet:** every document printed and signed in ink, the note shipped to a custodian, the security instrument recorded on paper or scanned for eRecording.
- **Hybrid:** disclosures and most documents signed electronically, often days before; the note and the security instrument (and anything needing a notary) signed in ink at the table.
- **eNote:** the note is signed electronically and becomes a SMART Doc in an eVault, registered on the MERS eRegistry; the security instrument may be wet-signed and notarized in person, or electronically notarized. Snapdocs describes eNote closings as including "both digital and wet-signed documents."
- **RON:** every document, including the notarized security instrument, signed remotely with the notary on audio-video; "there are no physically printed or signed documents."
- **In-person electronic notarization (IPEN):** the signer and notary in the same room, signing on a screen.

Which type a loan can use depends on the state (notarization law, county eRecording), the title insurer, the investor (Fannie Mae requires special approval to deliver eMortgages) and the warehouse lender. My rule is to decide the closing type per loan as a computed eligibility, recorded with the inputs, rather than as a channel setting, because the same lender will close wet in one county and fully remote in the next.

## The Closing Table and Funding

At or before closing, the settlement agent (a title company, escrow company or attorney, by state practice) reconciles the Closing Disclosure the borrower received at least three business days earlier, prepares a settlement statement (ALTA publishes Borrower-Buyer, Cash, Combined and Seller versions, which itemize what each side pays and are "not meant to replace" the Closing Disclosure), collects signatures, and disburses: the seller's payoff, the seller's proceeds, the third-party fees, and any cash to the borrower. Funding is the lender's wire to the agent, timed to the signing and, for refinances, to rescission.

### Rescission and Funding

On a refinance or home equity loan secured by the borrower's principal dwelling, the consumer may rescind until **midnight of the third business day** (specific definition) after the latest of consummation, delivery of the rescission notice, or delivery of the material disclosures (12 CFR 1026.23(a)(3)). Until that period ends and the creditor is reasonably satisfied the consumer hasn't rescinded, "no money shall be disbursed other than in escrow" (1026.23(c)). If the notice or material disclosures are never delivered (an understated finance charge beyond tolerance counts), the right lasts up to **three years** after consummation, or until the property is sold or transferred. A purchase-money mortgage has no rescission right, and a refinance with the same creditor is exempt except for new money beyond the unpaid balance (1026.23(f)). Waiver is allowed only for a bona fide personal financial emergency, in a dated statement written and signed by every consumer with the right (printed forms prohibited).

For the system, rescission is a funding gate: a loan closed on Thursday, December 17, 2026 can fund no earlier than Tuesday, December 22, after the rescission period runs through midnight Monday, December 21 (Friday 18, Saturday 19, Monday 21; Sunday doesn't count). The rescission notice is a disclosure with its delivery recorded per consumer, and a rescission received in the window is a case with its own clock.

## Notarization: In Person, Electronic and Remote

The security instrument must be acknowledged before a notary to be recorded, and notarization is state law. **Remote online notarization** lets the notary and signer meet over audio-video: Virginia was the early mover (its law was signed March 26, 2011, with the audio-video provisions effective July 1, 2012), and its statute requires the notary to keep a copy of the audio-video recording and keep the electronic record for at least five years (Va. Code 47.1-14). Most states have followed, though counts differ by source and by whether a law is in effect: Proof's July 2026 tracker says 42 states and DC have effective RON laws, with California (from January 2030), Massachusetts and North Carolina enacted but not yet in effect. <!-- source-gap: ron-state-count | secondary | number of states with RON laws in effect as of October 2026 | closes with: a dated state-by-state table from a notary commission authority, MBA or NASS | checked: 2026-10-29 -->

There's no federal RON law. The SECURE Notarization Act, which passed the House 336-90 on July 27, 2022 and died in the Senate, was reintroduced as H.R. 1777 on March 3, 2025; it would require identity proofing by at least two distinct processes and keep recordings for the longer of the state's period or five years (ten if the state sets none). As far as I could verify it hadn't left committee as of October 2026. <!-- source-gap: secure-notarization-act-status | status | latest congressional action on H.R. 1777 / S. 1561 (119th Congress) | closes with: the congress.gov actions page for either bill | checked: 2026-10-29 -->

What a RON session produces, under state laws and the MISMO RON standards (Version 2, covering identity verification, recordings and notarial records, was out for comment in 2024 and MISMO expects to re-release it in 2026): identity proofing results (the federal bill would require two distinct processes), the audio-video recording, the notary's electronic journal entry, the notary's digital certificate on the document, and a retention obligation measured in years. MERS offers storage for RON videos on loans registered on its systems. Each is a record the lender should be able to retrieve, even when the notary platform and the title company hold it.

## eNotes and SMART Docs

An **eNote** is a promissory note created, signed and stored electronically. For the mortgage market it's a **MISMO SMART Doc**: Securable, Manageable, Archivable, Retrievable, Transferable, a format that "links data, the visual representation of the form, and signature" in one document, with the view in XHTML, PDF or TIFF. After signing, a **tamper-evident seal** is applied: in the eRegistry's words, "a cryptographic hash value applied to an eNote after closing that detects any subsequent alterations." The MERS eRegistry FAQ cites SMART Doc v1.02 as the registration format, and MISMO's Version 3 implementation guide was open for comment through October 29, 2026, so a vault has to handle more than one version.

Fannie Mae's requirements (Selling Guide B8-8-02) show what the industry expects: the Uniform Fannie Mae/Freddie Mac eNote with an electronic note clause referencing the eRegistry, the SMART Doc format, a valid unique **18-digit MIN**, the borrower signing only the eNote (never a paper note too), and registration on the eRegistry "as soon as possible after the tamper-evident seal has been applied, but no later than one business day after signing," naming the originating lender as the first Controller. An error that requires a new note means executing a new eNote and reversing the original registration; a clerical error is fixed by an eNote correction agreement reported to the eRegistry as a modification.

## Control: E-SIGN and UETA

Paper notes are negotiated by endorsement and delivery; electronic ones by control. The law that makes it work:

- **E-SIGN, 15 U.S.C. 7021:** a **transferable record** is an electronic record that would be a note under UCC Article 3 if on paper, that the issuer has "expressly agreed" is a transferable record, and that relates to a loan "secured by real property." A person has control if a system "reliably establishes" that person as the one to whom it was issued or transferred.
- **The safe harbor (7021(c)):** a single authoritative copy exists that is unique, identifiable and unalterable (except as below); it identifies the person with control; it is communicated to and maintained by that person or a designated custodian; copies or revisions that change the identified assignee need that person's consent; every copy is readily identifiable as not the authoritative copy; and any revision is readily identifiable as authorized or not.
- **The effect (7021(d)-(f)):** the person with control is the holder and can be a holder in due course; "delivery, possession, and endorsement are not required"; the borrower keeps every defense it would have on paper; and the enforcing party must reasonably prove control on request.
- **UETA section 16,** as enacted in the states (Minnesota's 325L.16 is an example), uses the same six conditions without E-SIGN's real-property limit, covering notes and documents of title.

The safe harbor is a specification for a system: one authoritative copy, an identity of who controls it, changes only with that party's consent, every other copy marked as a copy. The eVault holds the authoritative copy and the eRegistry records who controls it, and together they are the evidence a servicer needs when it forecloses on an eNote.

## The MERS System and the eRegistry

**The MERS System** is "a national electronic database that tracks changes in mortgage servicing rights and beneficial ownership interests" in residential loans, keyed by the **Mortgage Identification Number (MIN)** assigned to each loan for its life. Fannie Mae requires that a MERS-registered loan have MERS as mortgagee of record, either as nominee for the lender in the security instrument or as an assignee by recorded assignment; MERS "has no beneficial interest in the mortgage" and acts only on instructions; and when MERS is named as nominee, a sale or servicing transfer to another MERS member needs no new recorded assignment (Selling Guide B8-7-01). That last point is the reason MERS exists: one county recording at origination instead of one per transfer.

**The eRegistry** is the system of record for eNotes ("the mortgage industry's sole authorized registry for identifying the current Controller"). It doesn't store the eNote; it records roles:

- **Controller:** the participant with control (the paper holder's equivalent).
- **Location:** the participant that maintains the authoritative copy, often the Controller's eVault.
- **Master Servicer:** authorized by the Controller to perform some eRegistry transactions on its behalf.
- **Secured Party:** a warehouse lender's interest while it finances the loan.
- **Delegatee for Transfer:** an arrangement letting a custodian act for a lender.

A sale is a **transfer of control** (and usually of location) on the eRegistry, not an endorsement. The Controller may convert an eNote to paper, which deactivates it on the registry; a paper note can't become an eNote. Participation requires an eRegistry addendum to MERS membership.

## Delivering eNotes to Investors

Delivery is a chain of eRegistry transactions. Under Fannie Mae's rules (Selling Guide C1-2-04), the eNote "must be transmitted to Fannie Mae's eVault via MERS eDelivery" (or direct eDelivery); after acceptance, the lender or warehouse lender submits a transfer that makes Fannie Mae the Controller and Location of the authoritative copy, names the servicer as Master Servicer, and uses the submission date as the effective date; no Secured Party may remain on the record, so the warehouse lender must start or approve the transfer. Pools can mix paper and eNotes. Ginnie Mae issued its first MBS backed entirely by eNotes, about $24 million of loans closed in December 2020, as of January 1, 2021, under its Digital Collateral Program.

For the system: the warehouse lender's release, the investor's acceptance and the eRegistry transfer are three events that must happen in order, each with a confirmation, and the loan isn't sold until the registry says so. A rejected transfer leaves the lender as Controller of a loan it thinks it sold.

## The Post-Closing File

After funding, the loan file isn't complete until trailing items arrive and the collateral is where the investor needs it:

- **The recorded security instrument:** recorded by the county, increasingly by eRecording (ICE's Simplifile network says it reaches recording offices serving "more than 90% of US residents"), with the recording reference and date on the collateral record.
- **The final title policy** from the title insurer, replacing the commitment.
- **The note:** a wet-ink original endorsed and shipped to the document custodian, or an eNote registered, sealed and in the eVault with its control history.
- **MERS registration** of the MIN on the MERS System, and eRegistry registration for an eNote.
- **The closing package:** every signed document, the settlement statement, the final Closing Disclosure, the notary's records or RON recording reference, and the rescission notices with their delivery.
- **Post-consummation corrections:** a corrected Closing Disclosure within 30 days for a changed amount or 60 for a clerical error or cure ([Cures](/books/banking-and-lending/mortgage-disclosures#cures)).

One limit carries into servicing: E-SIGN's consent rules don't reach notices of "default, acceleration, repossession, foreclosure, or eviction, or the right to cure" under credit secured by a primary residence (15 U.S.C. 7003(b)(2)), so an all-digital loan still needs paper for its most serious notices (Mortgage Servicing, Escrow & Loss Mitigation).

## How to Build It

These are deltas against [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model). The loan is a `loans` row, the home a `collateral` row whose `lien_ref` holds the recorded instrument, and every signed document and notice a `disclosures` row or a closing document. This chapter adds the closing, its documents and notarizations, the eNote and its control history, rescission, and post-closing items, and puts the MIN on the loan.

```sql
ALTER TABLE loans
  ADD COLUMN mers_min          CHAR(18) UNIQUE,     -- the 18-digit Mortgage Identification Number
  ADD COLUMN mers_role         TEXT CHECK (mers_role IN ('nominee', 'assignee', 'none'));

CREATE TABLE closings (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id            UUID NOT NULL REFERENCES loans (account_id),
  closing_type          TEXT NOT NULL CHECK (closing_type IN ('wet', 'hybrid', 'enote', 'ipen', 'ron')),
  eligibility           JSONB NOT NULL,        -- state, county eRecording, title, investor, warehouse inputs
  settlement_agent      TEXT NOT NULL,
  property_state        CHAR(2) NOT NULL,
  scheduled_at          TIMESTAMPTZ NOT NULL,
  consummated_at        TIMESTAMPTZ,
  funding_gate_at       TIMESTAMPTZ,           -- end of rescission, or consummation if none
  funded_at             TIMESTAMPTZ,
  journal_entry_id      UUID REFERENCES journal_entries (id),  -- the funding wire
  status                TEXT NOT NULL CHECK (status IN ('scheduled', 'signed', 'rescission_hold',
                          'funded', 'rescinded', 'cancelled'))
);

CREATE TABLE closing_documents (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  closing_id            UUID NOT NULL REFERENCES closings (id),
  kind                  TEXT NOT NULL,         -- 'note', 'security_instrument', 'closing_disclosure',
                                               -- 'rescission_notice', 'settlement_statement', ...
  signing_method        TEXT NOT NULL CHECK (signing_method IN ('wet', 'esign', 'ipen', 'ron')),
  signer_party_ids      UUID[] NOT NULL,
  signed_at             TIMESTAMPTZ,
  document_ref          TEXT NOT NULL,         -- the signed document; for an eNote, a non-authoritative copy
  disclosure_id         UUID REFERENCES disclosures (id),
  notarization_id       UUID                   -- notarizations, below
);

CREATE TABLE notarizations (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  closing_id            UUID NOT NULL REFERENCES closings (id),
  kind                  TEXT NOT NULL CHECK (kind IN ('paper', 'ipen', 'ron')),
  notary_commission_state CHAR(2) NOT NULL,
  notary_commission_ref TEXT NOT NULL,
  identity_methods      TEXT[] NOT NULL,       -- 'credential_analysis', 'kba', 'biometric', ...
  platform              TEXT,
  recording_ref         TEXT,                  -- audio-video, where it is stored
  journal_ref           TEXT,
  retain_until          DATE,                  -- the longest applicable retention
  performed_at          TIMESTAMPTZ NOT NULL
);

CREATE TABLE enotes (
  account_id            UUID PRIMARY KEY REFERENCES loans (account_id),
  mers_min              CHAR(18) NOT NULL UNIQUE,
  smart_doc_version     TEXT NOT NULL,         -- '1.02', '3', ...
  tamper_seal_digest    TEXT NOT NULL,         -- the hash in the seal
  evault                TEXT NOT NULL,         -- the Location's vault
  transferable_record_clause BOOLEAN NOT NULL, -- the issuer's express agreement
  signed_at             TIMESTAMPTZ NOT NULL,
  registered_at         TIMESTAMPTZ,           -- by one business day after signing (Fannie Mae)
  status                TEXT NOT NULL CHECK (status IN ('signed', 'registered', 'transferred',
                          'converted_to_paper', 'paid_off', 'reversed'))
);

CREATE TABLE enote_control_transfers (       -- the eRegistry history, as confirmed
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id            UUID NOT NULL REFERENCES enotes (account_id),
  transaction_kind      TEXT NOT NULL CHECK (transaction_kind IN ('registration', 'transfer_control',
                          'transfer_location', 'master_servicer_change', 'secured_party_add',
                          'secured_party_release', 'modification', 'registration_reversal',
                          'deactivation')),
  controller            TEXT NOT NULL,         -- MERS Org IDs after the transaction
  location              TEXT NOT NULL,
  master_servicer       TEXT,
  secured_party         TEXT,
  effective_date        DATE NOT NULL,
  eregistry_ref         TEXT NOT NULL,         -- the registry's transaction ID
  confirmed_at          TIMESTAMPTZ,           -- null until the registry confirms
  rejected_reason       TEXT
);

CREATE TABLE rescission_periods (            -- 12 CFR 1026.23, per consumer with the right
  closing_id            UUID NOT NULL REFERENCES closings (id),
  party_id              UUID NOT NULL REFERENCES parties (id),
  notice_disclosure_id  UUID REFERENCES disclosures (id),
  starts_on             DATE NOT NULL,         -- latest of consummation, notice, material disclosures
  expires_at            TIMESTAMPTZ NOT NULL,  -- midnight, third specific business day
  extended_until        DATE,                  -- up to three years if disclosures were defective
  waived                BOOLEAN NOT NULL DEFAULT FALSE,
  waiver_ref            TEXT,
  rescinded_case_id     UUID REFERENCES cases (id),
  PRIMARY KEY (closing_id, party_id)
);

CREATE TABLE post_closing_items (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id            UUID NOT NULL REFERENCES loans (account_id),
  kind                  TEXT NOT NULL CHECK (kind IN ('recorded_security_instrument',
                          'final_title_policy', 'note_to_custodian', 'mers_registration',
                          'eregistry_registration', 'corrected_closing_disclosure')),
  due_on                DATE NOT NULL,
  received_at           TIMESTAMPTZ,
  reference             TEXT,                  -- recording number, policy number, tracking ID
  status                TEXT NOT NULL CHECK (status IN ('open', 'received', 'exception', 'waived'))
);
```

How it runs:

1. **Eligibility decides the closing type.** Before scheduling, a rule set reads the property state's notarization law, the county's eRecording, the title insurer, the investor's eMortgage approval and the warehouse lender's eNote acceptance, and writes `closings.closing_type` with the inputs.
2. **Funding has a gate.** For a rescindable transaction, `funding_gate_at` is computed from `rescission_periods` with the specific business-day calendar (the same calendar [TRID & Mortgage Disclosures](/books/banking-and-lending/mortgage-disclosures#how-to-build-it) uses), and the funding job won't release the wire before it or while any consumer's period is open or rescinded.
3. **An eNote is registered within a business day.** Signing writes `enotes` with the seal's digest; registration on the eRegistry is a job with a deadline of one business day, and its confirmation writes the first `enote_control_transfers` row. The lender's copy of the eNote is never the authoritative one; `document_ref` points at a marked copy, and the vault holds the original ([Storage and Retrieval](/docs/compliance/electronic-signatures#storage-and-retrieval)).
4. **Sales move control, then ownership.** A sale writes `loans.owner` only after the eRegistry confirms the transfer of control to the investor and the release of the warehouse lender's secured party; a rejected transfer opens an exception.
5. **Notarizations carry their retention.** `retain_until` is the longest of the state's requirement and the lender's policy, and the recording reference survives a change of notary platform.
6. **Post-closing items are deadlines.** Each item has a due date from investor and title requirements, and an open item past due is an exception on the loan, visible to secondary marketing before it blocks a sale.

## Auditing

A closing is audited when a loan is sold, foreclosed or challenged:

- **Who signed what, how and when:** every document with its signing method, signers, timestamps and notarization.
- **Notarization evidence:** identity methods, the notary's commission, the recording and journal references, and retention dates.
- **Rescission:** each consumer's notice delivery, period, any waiver and any rescission, against the funding time.
- **The eNote:** SMART Doc version, seal digest, the transferable record clause, registration time, and every eRegistry transaction with its confirmation, so control can be proven on request as 15 U.S.C. 7021(f) requires.
- **MERS:** the MIN, MERS's role (nominee or assignee) and registration.
- **Post-closing:** each trailing item's due and received dates and exceptions.

## What This Means for the System You Build

- **Support every closing type at once,** and decide the type per loan from recorded eligibility inputs.
- **Gate funding on rescission** computed from the specific business-day calendar, per consumer.
- **Never treat a stored PDF as the note:** for an eNote, the eVault's authoritative copy and the eRegistry's Controller are the truth.
- **Register eNotes within one business day** and record every eRegistry transaction with its confirmation.
- **Move ownership only after the registry confirms** the control transfer and the warehouse release.
- **Keep notarization evidence retrievable** for its full retention, independent of the notary platform.
- **Track post-closing items as deadlines,** and keep paper paths for the notices E-SIGN excludes.

## References

**Law and regulation**

- [15 U.S.C. 7021](https://www.law.cornell.edu/uscode/text/15/7021), transferable records, control, the six-condition safe harbor, holder status and proof of control
- [15 U.S.C. 7003](https://www.law.cornell.edu/uscode/text/15/7003), E-SIGN's exclusion of default, acceleration, foreclosure and right-to-cure notices for primary residences
- [Minn. Stat. 325L.16](https://www.revisor.mn.gov/statutes/cite/325L.16), a state enactment of UETA's transferable records section
- [12 CFR 1026.23 (Regulation Z)](https://www.consumerfinance.gov/rules-policy/regulations/1026/23/), the right of rescission, the three-day and three-year periods, no disbursement except in escrow, waiver and exemptions
- [Va. Code 47.1-14](https://law.lis.virginia.gov/vacode/title47.1/chapter2/section47.1-14/), recording of the audio-video conference and five-year retention
- [H.R. 1777, SECURE Notarization Act (119th Congress, introduced)](https://www.govinfo.gov/content/pkg/BILLS-119hr1777ih/html/BILLS-119hr1777ih.htm), identity proofing and recording retention in the federal proposal

**Agencies and registries**

- [Fannie Mae Selling Guide B8-8-01: General Information on eMortgages](https://selling-guide.fanniemae.com/sel/b8-8-01/general-information-emortgages), special approval and the eNote technology provider requirement
- [Fannie Mae Selling Guide B8-8-02: Creating, Closing and Correcting eNotes](https://selling-guide.fanniemae.com/sel/b8-8-02/requirements-creating-closing-and-correcting-enotes), the SMART Doc format, 18-digit MIN, one-business-day registration and corrections
- [Fannie Mae Selling Guide C1-2-04: Delivering eMortgages](https://selling-guide.fanniemae.com/sel/c1-2-04/delivering-emortgages-fannie-mae), eDelivery, the transfer to Fannie Mae as Controller and Location, and the secured party rule
- [Fannie Mae Selling Guide B8-7-01: MERS](https://selling-guide.fanniemae.com/sel/b8-7-01/mortgage-electronic-registration-systems-mers-inc), MERS as mortgagee of record, nominee, no beneficial interest and the MIN on the security instrument
- [MERS](https://www.mersinc.org/), the MERS System and eRegistry and their participation figures
- [MERS: eRegistry FAQ](https://www.mersinc.org/products-services/mers-esuite/eregistry/faq), Controller, Location, Master Servicer, the tamper seal, SMART Doc v1.02 and conversion to paper
- [MERS: MERS System](https://www.mersinc.org/products-services/mers-system), the MIN for the life of a loan
- [MERS: RON Video Storage](https://www.mersinc.org/products-services/ron-video-storage), storage of RON recordings for registered loans
- [ICE: Completes acquisition of MERS (October 4, 2018)](https://ir.theice.com/press/news-details/2018/Intercontinental-Exchange-Completes-Acquisition-of-MERS/default.aspx), ownership of MERSCORP Holdings
- [MBA Newslink: Ginnie Mae issues first MBS backed by digital pools (January 2021)](https://newslink.mba.org/servicing-newslink/2021/january/mba-newslink-wednesday-jan-27-2021/ginnie-mae-issues-1st-mbs-backed-by-digital-pools/), the first all-eNote Ginnie Mae security

**Standards**

- [MISMO: SMART Doc Version 3](https://www.mismo.org/standards-resources/emortgage-standards-and-specifications/smart-doc-version-3), the SMART acronym, the data-view-signature binding and the 2026 comment period
- [MISMO: Remote Online Notarization Standards](https://www.mismo.org/standards-resources/emortgage-standards-and-specifications/remote-online-notarization-(ron)-standards), Version 2 areas and the planned 2026 re-release
- [MISMO: eMortgage Statistics](https://www.mismo.org/standards-resources/digital-mortgage-resource-center/digital-mortgage-education/emortgage-statistics), Fannie Mae eNote share through the first quarter of 2026

**Vendors and trade bodies**

- [Snapdocs: What is an eNote](https://www.snapdocs.com/what-is-an-enote), wet, hybrid, eNote and RON closings
- [Snapdocs: eVault](https://www.snapdocs.com/evault), MERS, MISMO and GSE compliance and authoritative copies
- [DocMagic: SmartSAFE](https://www.docmagic.com/smartsafe), eVault, eDelivery, eRegistry connectivity and tamper-evident seals
- [DocMagic](https://www.docmagic.com/), Total eClose
- [Proof](https://www.proof.com/), MISMO certification and First American's RON volume
- [Proof: Is remote online notarization legal in all states (July 8, 2026)](https://www.proof.com/blog/is-remote-online-notarization-legal-in-all-states), states with effective and pending RON laws
- [Old Republic Title: Pavaso](https://www.oldrepublictitle.com/pavaso), the completed wind-down
- [ICE Mortgage Technology: Encompass](https://mortgagetech.ice.com/products/encompass), eClose, MERS registration and recording
- [ICE Mortgage Technology: Simplifile for counties](https://mortgagetech.ice.com/products/simplifile/solutions/counties), eRecording reach
- [ALTA: Settlement Statements](https://www.alta.org/policies-and-standards/policy-forms/settlement-statements), the four versions and their relation to the Closing Disclosure
- [National Notary Association: Virginia HB 2318 and SB 827](https://www.nationalnotary.org/knowledge-center/news/law-updates/va-house-bill-2318-senate-bill-827), the first RON law
- [Rep. Dean: House passes remote online notarization bill (July 2022)](https://dean.house.gov/2022/7/reps-dean-and-armstrong-lead-house-in-passing-bill-to-allow-remote-online-notarization-nationwide), the 336-90 House vote
