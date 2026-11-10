+++
title = "Quote, Bind & Issue"
description = "The quote lifecycle, binders, issuance and declarations, policy numbers, 12:01 a.m. effective times, e-delivery consent, and proof of insurance."
category = "Insurance Industry"
order = 2725
part = "Policy Administration"
tags = ["insurance", "policy-administration", "quoting", "binders", "e-delivery", "proof-of-insurance"]
+++

Three moments turn an inquiry into a contract. A **quote** is an offer to insure at a price, valid for a while, on the facts given; North Carolina's insurance department puts it plainly to consumers: "A quote is an estimate of your premium. It does not offer a firm price or contract." **Binding** is the moment coverage exists: the insurer, or an agent or MGA with authority, agrees to cover the risk from a stated time, and from then on a loss is a claim, whether or not any paper has been issued. **Issuance** produces the policy: the declarations page, the forms, the ID cards, the documents a lender or a police officer will ask for. Between binding and issuance there may be a **binder**, a temporary contract that some states give the force of a policy for a limited time.

The system has to get three things exactly right: the state of each quote and policy at each moment, the effective time to the minute in the right time zone (an accident at 11:45 p.m. on the day before the effective date is not covered), and the documents, with proof of how and when they were delivered and that the insured agreed to electronic delivery. This chapter covers the quote lifecycle, binders, issuance and the declarations, policy numbers, effective time rules, e-delivery consent, and ID cards and proof of insurance. The rating that produces the quote is How a Rate Is Built; the underwriting that can stop a bind is Underwriting Rules, Referrals & Models; the product and forms issued are Products, Coverages & Forms.

## How the Platforms Do It

As of November 2026, from public documentation:

| Platform | Quote | Bind and issue |
| --- | --- | --- |
| **Guidewire PolicyCenter** | A Submission job creates a new policy; a transaction moves through initiate (Draft), modify, quote (Quoted) and complete; "within a single policy transaction, multiple quotes can be generated and compared," one version selected at a time; modifying a quoted job sends it back to draft for requoting | `bind-and-issue` completes a job (status Bound); jobs can also be withdrawn; underwriting issues block at quoting, binding or issuance |
| **Socotra** | Quotes are priced by the rating plugin and move to `priced` | Transactions progress through validation, pricing and underwriting before issuance; an Issuance transaction creates the policy |
| **NFIP** | Federal rates, application with premium | Coverage effective 12:01 a.m. local time on the 30th calendar day after application and premium, with listed exceptions |

The pattern is the same everywhere: a quote is a priced version of a submission; binding converts a selected, quoted, unblocked version into a policy transaction; issuance generates and delivers the documents. Systems that collapse bind and issue into one step still have to treat them separately in the data, because coverage exists from the bind, and document delivery can fail and be retried.

## The Quote Lifecycle

A quote's states and the events that move it:

| State | Meaning | Leaves by |
| --- | --- | --- |
| `draft` | Inputs being collected; prefill and consumer reports may be ordered | Rating succeeds (`quoted`) or fails eligibility (`declined`) |
| `quoted` | Priced on a product version and rate tables, with a worksheet; an offer | Edited (back to `draft`), selected and bound (`bound`), expired (`expired`), referred (`referred`) |
| `referred` | Blocked by an underwriting issue at quote or bind | Approved (`quoted`) or declined (`declined`) |
| `bound` | Converted into a policy transaction; coverage exists | Terminal for the quote |
| `expired` | Past its validity or past the requested effective date | Requote creates a new quote |
| `declined` | Ineligible or refused, possibly with an adverse action notice | Terminal |

Rules a quote engine has to hold:

- **A quote is immutable once priced.** Changing a driver creates a new version and a new worksheet; the old version stays, because the customer may have been shown it, and adverse action is judged on what was quoted (Consumer Reports & Third-Party Data). Guidewire's model of a quoted job falling back to draft on any change is the same rule.
- **Validity has two clocks.** A quote expires after its validity period and also when the rating basis changes under it: a new rate table effective before the requested effective date, a consumer report older than the freshness rule, or a requested effective date that has passed.
- **Binding requotes if anything changed.** If the selected version's inputs, product version or rate tables differ from what was priced, the system reprices before binding and shows the new price.
- **Multiple versions are normal.** Different limits and deductibles for side-by-side comparison are versions of one quote; exactly one becomes the policy.

## Binders

A binder is evidence that coverage is bound before the policy is issued. California's statute is a useful model of what a binder statute does: a binder "issued in accordance with this section shall be deemed an insurance policy" for proving coverage; it is a written document naming the insured, the coverage, the insurer, the agent and the effective date that "temporarily obligates the insurer to provide that insurance coverage pending issuance of the insurance policy"; it includes the policy's usual terms and any endorsements it designates unless its terms say otherwise; it "shall be valid for the period specified therein not exceeding 90 days" and ends when the policy issues; it doesn't apply to life or disability insurance or to coverage of $1,000,000 or more; a party that refuses a valid binder as proof of insurance without reasonable cause may be liable; and an agent who issues a binder without authority risks the license (Cal. Ins. Code 382.5).

For a system, a binder is a document and a commitment with its own expiry. A worked example, mine: a California homeowners binder issued March 1, 2027 for a policy effective that day, specifying 60 days, is valid through April 30; one specifying more than 90 days is valid only for 90, through May 30. A binder job that watches for the policy's issuance, and escalates as the binder's end approaches, keeps the insured from being covered by a binder that has quietly lapsed. Binders matter most where a third party needs proof at a closing: the mortgage lender at a home purchase, the lienholder at a car purchase.

## Issuance and the Declarations

Issuance generates the documents from the bound policy version: the declarations page (Products, Coverages & Forms lists its contents), the policy and endorsement forms by edition, state-required notices, ID cards for auto, a mortgagee or lienholder copy, and an invoice or payment confirmation (Billing & Premium Finance). Rules:

- **Generate from the version, keep what was sent.** Each document is rendered from the bound `policy_versions` row and its form list, stored as rendered with the template version, and never regenerated in place ([What Was Sent Is What You Keep](/docs/building-blocks/generated-documents#what-was-sent-is-what-you-keep)). A later correction is a new document from a new transaction.
- **Issue asynchronously, idempotently.** Rendering and delivery can fail; the bind must not. A bound policy with documents pending is a valid state with a retry queue and an alert ([Render in the Background](/docs/building-blocks/generated-documents#render-in-the-background)).
- **Report outward on bind.** Some events fire at bind regardless of documents: the state's insurance verification report for auto, the lienholder or mortgagee notice, the agency download (Comparative Raters & Agency Systems), the first premium entries and the commission accrual.

## Policy Numbers

A policy number is the identity everyone outside the system uses: the insured, agents, lenders, the DMV, claimants and other insurers. Practices worth copying:

- **Assign at bind, not at quote,** so abandoned quotes don't consume numbers and the number means coverage exists. A quote has its own reference.
- **Keep the number stable across terms** and add a term or version suffix where a document needs one; renewals are new `policy_terms` on the same `policies` row.
- **Encode little or nothing.** Prefixes for line or state are common and harmless; encoding the agent, the office or the underwriting company makes renumbering inevitable when any of them changes. Use a check digit so a mistyped number fails fast ([Numbering](/docs/building-blocks/generated-documents#numbering)).
- **Never reuse a number,** even for a cancelled flat policy, because claims and reports may reference it years later.

## Effective Times

Coverage starts and ends at a moment, not a date. Personal lines policies conventionally run from 12:01 a.m. at the insured's location, and the federal flood policy makes the convention law: new NFIP coverage takes effect at 12:01 a.m. local time "on the 30th calendar day after the application date" and premium presentment, so an application with premium paid May 1 takes effect May 31 (44 CFR 61.11), and the policy "will expire at 12:01 a.m. on the last day of the policy term" (Standard Flood Insurance Policy, VII.E.1). The flood rule's exceptions show how effective time can depend on events: coverage bought in connection with a loan closing takes effect at the closing; within 13 months after a map revision, initial coverage starts at 12:01 a.m. on the day after application; and an application mailed to the NFIP counts from the application date only if it arrives within 10 days, or is sent by certified mail within 4 days, otherwise from receipt.

Rules for storing effective times:

- **Store an instant with the zone it was defined in.** `effective_at` is a timestamp; the policy also records the zone of the location whose clock defines it (the foundation's `policy_terms.effective_at` comment: "12:01 a.m. local at the risk, as stored"). A policy on a car garaged in Arizona and an insured who lives in Indiana has one zone the filing or form names; the system must not guess from the user's browser.
- **Bind time can be later than 12:01 a.m.** A same-day bind at 3:40 p.m. is effective at the bind time, not retroactively at 12:01 a.m., unless the insurer accepts the earlier time on a no-known-loss statement. North Carolina's amendatory endorsement shows the same idea for a newly acquired auto added late: coverage "will begin at the time you request the coverage."
- **Terms end at the same clock time they started,** so a renewal begins exactly when the prior term ends, with no gap and no overlap; the exclusion constraint on `policy_versions` enforces no overlap within a term.
- **Daylight saving time doesn't move 12:01 a.m.** Store instants computed from the local wall-clock time on each date, not a fixed offset copied from the first one.

## Electronic Delivery

Policies, notices and ID cards are documents a law requires to be delivered, usually "in writing," which makes e-delivery a consent question. Two layers apply:

- **E-SIGN.** Where a law requires information to be provided to a consumer in writing, electronic delivery satisfies it only if the consumer affirmatively consented and hasn't withdrawn; received, before consenting, a clear and conspicuous statement of the right to paper and to withdraw (and any fees or consequences), the scope of the consent, how to withdraw and update contact information, and how to get paper copies; received the hardware and software requirements; and consented electronically "in a manner that reasonably demonstrates" the ability to access the format used. A later change in requirements that creates a material risk of non-access needs a new statement and consent. Congress specifically intended the act to apply to the business of insurance (15 U.S.C. 7001(c), (i)). The general mechanics are in [Consumer Consent Comes First](/docs/compliance/electronic-signatures#consumer-consent-comes-first).
- **State insurance e-commerce laws.** NCOIL's Insurance E-Commerce Model Act (adopted March 8, 2020) is the template many states' insurance codes follow. It makes electronic delivery equivalent to "first class mail, first class mail with postage prepaid, certified mail, certificate of mail, or certificate of mailing"; defines delivery as an email to a consented address, or a posting with a separate notice containing the posting's address (effective on the later of the two); requires consent and disclosures much like E-SIGN's, with withdrawal "no more burdensome than providing consent"; requires the insurer to "take all measures reasonably calculated to ensure" receipt, and to fall back to another lawful method when it has a reasonable basis to believe a document wasn't received or learns the email address is invalid; requires active confirmation of receipt where another law requires confirmation; and allows posting a policy without personal information on the website with separate, specific consent, kept accessible while in force and available for five years after expiration.

The model's equivalence to certificate-of-mailing matters for cancellation and nonrenewal notices, where proof of mailing is the legal proof (Cancellation, Nonrenewal & Notice Law): an electronic notice is only as good as the consent record behind it and the evidence that the email was sent to the consented address. My rule: **a notice whose legal effect depends on delivery goes electronically only if the party's consent covers that document type, and the send record carries the consent version, the address and the provider's acceptance**; a bounce triggers the paper path automatically, per the model's alternative-delivery rule.

## ID Cards and Proof of Insurance

Auto ID cards are the most-requested document an insurer issues. States prescribe the content and allow electronic display: Florida requires drivers to carry proof "in a uniform paper or electronic format, as prescribed by the department," and provides that presenting an electronic device to an officer "does not constitute consent for the officer to access any information on the device" (Fla. Stat. 316.646). Beyond the card, many states run insurance verification systems that query or receive policy data from insurers so that registration and law enforcement can check coverage directly; those reporting duties are Personal Auto. For the policy system:

- **Generate ID cards per vehicle per term,** reissued on any transaction that changes a vehicle, the named insured or the term; old cards stay valid only through their stated dates.
- **Serve them in the app and as wallet passes** that refresh from the policy, so a cancellation stops the card from showing coverage that no longer exists.
- **Proof of insurance for lenders** (evidence of insurance, mortgagee clauses, lienholder copies) is another document type, often requested by the lender's servicer; [Mortgage Servicing](/books/banking-and-lending/mortgage-servicing#force-placed-insurance) shows what happens when the lender doesn't get it.

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model): `policies`, `policy_terms`, `policy_transactions`, `policy_versions`, and the `submissions` defined in Underwriting Rules, Referrals & Models. This chapter defines `quotes`, `binders`, `documents` and `delivery_consents`; `notices` (the legally required subset of documents with deadlines) is defined in Cancellation, Nonrenewal & Notice Law.

```sql
CREATE TABLE quotes (                      -- a priced, immutable version of a submission
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  submission_id      UUID NOT NULL REFERENCES submissions (id),
  version            INT NOT NULL,
  product_id         UUID NOT NULL REFERENCES products (id),  -- the frozen product version
  requested_effective_at TIMESTAMPTZ NOT NULL,
  effective_zone     TEXT NOT NULL,         -- 'America/New_York': whose 12:01 a.m.
  inputs             JSONB NOT NULL,        -- the full rating input, as rated
  rating_worksheet_ref UUID NOT NULL,       -- rating_steps rows (How a Rate Is Built)
  term_premium       BIGINT NOT NULL,
  fees               BIGINT NOT NULL DEFAULT 0,
  status             TEXT NOT NULL CHECK (status IN ('draft', 'quoted', 'referred',
                       'bound', 'expired', 'declined', 'superseded')),
  selected           BOOLEAN NOT NULL DEFAULT FALSE,
  valid_until        TIMESTAMPTZ NOT NULL,
  priced_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  bound_transaction_id UUID REFERENCES policy_transactions (id),
  UNIQUE (submission_id, version)
);

CREATE TABLE binders (                     -- temporary evidence of coverage
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_id          UUID NOT NULL REFERENCES policies (id),
  quote_id           UUID NOT NULL REFERENCES quotes (id),
  issued_by          UUID NOT NULL,         -- producer or user; authority checked
  effective_at       TIMESTAMPTZ NOT NULL,
  specified_end_at   TIMESTAMPTZ NOT NULL,
  legal_max_end_at   TIMESTAMPTZ,           -- e.g. 90 days under Cal. Ins. Code 382.5
  ends_at            TIMESTAMPTZ GENERATED ALWAYS AS
                       (LEAST(specified_end_at, COALESCE(legal_max_end_at, specified_end_at))) STORED,
  superseded_by_issue_at TIMESTAMPTZ,       -- the policy issued; the binder ends
  document_id        UUID                   -- documents
);

CREATE TABLE documents (                   -- everything issued, as rendered
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_id          UUID REFERENCES policies (id),
  policy_version_id  UUID REFERENCES policy_versions (id),
  transaction_id     UUID REFERENCES policy_transactions (id),
  kind               TEXT NOT NULL,         -- 'declarations', 'policy_packet', 'id_card',
                                            -- 'binder', 'evidence_of_insurance', 'invoice', ...
  template_ref       TEXT NOT NULL,         -- template and version
  form_ids           UUID[] NOT NULL DEFAULT '{}',
  rendered_ref       TEXT,                  -- immutable stored file
  content_hash       TEXT,
  status             TEXT NOT NULL CHECK (status IN ('pending', 'rendered', 'sent',
                       'delivered', 'failed', 'returned')),
  recipient_party_id UUID REFERENCES parties (id),
  channel            TEXT CHECK (channel IN ('email', 'portal_posting', 'mail',
                       'certified_mail', 'app', 'agent')),
  consent_id         UUID,                  -- delivery_consents, for electronic channels
  address_used       TEXT,
  sent_at            TIMESTAMPTZ,
  provider_receipt   JSONB,                 -- mail vendor or email provider acceptance
  idempotency_key    TEXT NOT NULL UNIQUE
);

CREATE TABLE delivery_consents (           -- E-SIGN and state e-commerce consent, versioned
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id           UUID NOT NULL REFERENCES parties (id),
  policy_id          UUID REFERENCES policies (id),   -- null for relationship-wide consent
  disclosure_version TEXT NOT NULL,         -- the statement shown before consent
  document_types     TEXT[] NOT NULL,       -- what the consent covers
  email              TEXT,
  demonstrated_access BOOLEAN NOT NULL,     -- consented electronically in the used format
  consented_at       TIMESTAMPTZ NOT NULL,
  withdrawn_at       TIMESTAMPTZ,
  invalidated_at     TIMESTAMPTZ,           -- bounce or invalid address: paper fallback
  reconsent_required_reason TEXT            -- hardware or software requirement change
);
```

Binding a quote is one database transaction that creates the policy, its first term, the new business `policy_transactions` row, the first `policy_versions` row and its risks and coverages, marks the quote bound and enqueues issuance; the document jobs run after it commits ([Every Step Is Idempotent](/docs/building-blocks/workflows#every-step-is-idempotent)). The electronic channel check before a send:

```sql
SELECT dc.id
FROM delivery_consents dc
WHERE dc.party_id = :party_id
  AND (dc.policy_id IS NULL OR dc.policy_id = :policy_id)
  AND :document_kind = ANY (dc.document_types)
  AND dc.withdrawn_at IS NULL
  AND dc.invalidated_at IS NULL
  AND dc.reconsent_required_reason IS NULL
ORDER BY dc.consented_at DESC
LIMIT 1;                                   -- no row: deliver on paper
```

## Auditing

- **Every quote version with its inputs, worksheet, product version and validity,** and which version was bound.
- **Every bind with who bound it, their authority on that date, the bind instant and its zone,** and any no-known-loss statement for a backdated start.
- **Every binder with its specified and legal end** and the policy issuance that superseded it.
- **Every document as rendered, with template, forms, channel, address, consent version and provider receipt;** a delivery failure has a fallback record.
- **Every consent with the disclosure shown, the scope, the access demonstration and any withdrawal.**

## What This Means for the System You Build

- **Make quotes immutable priced versions** and requote on any change in inputs, product version, rate tables or report freshness.
- **Separate bind (coverage exists) from issue (documents delivered),** with issuance as an idempotent, retried job.
- **Store effective instants with their defining zone,** and never assume 12:01 a.m. when the bind was later.
- **Track binders as expiring commitments** with the state's maximum.
- **Gate electronic delivery on a scoped, versioned consent** and fall back to paper on any sign of non-receipt.
- **Assign policy numbers at bind,** stable across terms, never reused.

## References

**Law and regulation**

- [Cal. Ins. Code 382.5 (FindLaw)](https://codes.findlaw.com/ca/insurance-code/ins-sect-382-5/), binders deemed a policy for proof of coverage, contents, the 90-day maximum, exclusions for life, disability and $1,000,000 coverage, refusal liability and agent authority
- [15 USC 7001](https://www.law.cornell.edu/uscode/text/15/7001), E-SIGN consumer consent and disclosures, hardware and software changes, retention, and application to the business of insurance
- [44 CFR 61.11](https://www.law.cornell.edu/cfr/text/44/61.11), NFIP effective dates: 12:01 a.m. on the 30th day, the map revision, loan closing and post-wildfire exceptions, and mailed applications
- [44 CFR Appendix A(1) to Part 61](https://www.law.cornell.edu/cfr/text/44/appendix-A(1)_to_part_61), the Standard Flood Insurance Policy's expiration at 12:01 a.m. on the last day of the term
- [Fla. Stat. 316.646](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0300-0399/0316/Sections/0316.646.html), proof of insurance in paper or electronic format, and electronic display not being consent to search the device

**Regulators and guidance**

- [North Carolina Department of Insurance: FAQs About Auto Insurance](https://www.ncdoi.gov/consumers/auto-and-vehicle-insurance/faqs-about-auto-insurance), a quote as an estimate rather than a firm price or contract

**Standards**

- [NCOIL: Insurance E-Commerce Model Act, adopted March 8, 2020 (PDF)](https://ncoil.org/wp-content/uploads/2023/02/NCOIL-E-Commerce-Model-FINAL-3-8-20.pdf), electronic delivery's equivalence to mail and certificates of mailing, consent and disclosures, receipt measures, alternative delivery, confirmation of receipt, and website posting of policies

**Filings**

- [North Carolina Rate Bureau: Circular A-26-2 (PDF)](https://www.ncrb.org/Portals/0/ncrb/circular%20letters/automobile/2026/A-26-2%202026%20NC%20Personal%20Auto%20Rate%20Review%20and%20Program%20Changes.pdf?ver=8EeBogwTkuRGXminwAqqlw%3d%3d), the amendatory endorsement's start of coverage for a newly acquired auto requested late

**Vendor documentation**

- [Guidewire: Renewals (PolicyCenter Cloud API)](https://docs.guidewire.com/cloud/pc/202507/cloudapibf/cloudAPI/topics/122-PCjobTypes/02-renewals/c_renewals.html), the initiate, modify, quote and complete steps, falling back to draft on change, and `bind-and-issue`
- [Guidewire: Multi-version quoting](https://docs.guidewire.com/cloud/pc/202507/cloudapibf/cloudAPI/topics/124-PCsupport/00-quoting/c_multi-version-quoting.html), multiple quoted versions in one transaction with one selected
- [Guidewire: Underwriting issues in PolicyCenter](https://docs.guidewire.com/cloud/pc/202507/cloudapibf/cloudAPI/topics/124-PCsupport/00-underwriting-issues/c_underwriting_issues_in_policycenter.html), blocking points at quoting, binding and issuance
- [Socotra: Policy transactions](https://docs.socotra.com/features/policy-management/policy-transactions), the Issuance transaction and progression through validation, pricing and underwriting
- [Socotra: Rating plugin](https://docs.socotra.com/configuration/plugins/rating), quotes moving to `priced`
