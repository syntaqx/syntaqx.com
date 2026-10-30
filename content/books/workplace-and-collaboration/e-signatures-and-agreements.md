+++
title = "E-Signatures & Agreements"
description = "E-signature as workplace software: envelopes and certificates, ESIGN exceptions, eIDAS levels and QTSPs, PDF signatures, CLM and remote notarization."
category = "Workplace & Collaboration Industry"
order = 2028
part = "Docs, Wikis and Files"
tags = ["workplace", "e-signature", "contracts", "eidas", "notarization"]
+++

Most agreements a company signs are workplace documents before they're legal ones: an offer letter drafted in Docs, an NDA from the legal team's template library, a vendor contract redlined in Word over three weeks of email, a statement of work approved in a chat thread. E-signature products turned the last step, getting signatures, into a sent link, and then grew backwards into the whole agreement lifecycle: templates, approvals, negotiation, obligations and renewals. For a workplace platform the category matters twice: it's a product category in its own right (DocuSign, Adobe Acrobat Sign, Dropbox Sign) and an integration every docs, files and CRM tool is expected to have.

The playbook's [Electronic Signatures & Records](/docs/compliance/electronic-signatures) owns the US law (ESIGN and UETA), consumer consent, embedded versus remote signing, the evidence to keep and click-through terms. This chapter covers what the workplace adds: the envelope model and its states, the account an organization runs (senders, signing groups, retention, admin controls), what the certificate of completion is for, the documents e-signature can't carry, eIDAS levels and qualified trust service providers for EU counterparties, signatures inside PDFs, contract lifecycle management, and remote online notarization. Industry flows that sign at the door or for a lease are in other volumes: [Signing the Agreement](/books/field-operations/signing-the-agreement) and [The Lease](/books/property-tech/the-lease#signing-the-lease).

The inversion applies here with a twist. The customer organization is the **sender**: it owns the account, the templates, the completed agreements and their retention, and its admins decide who may send on its behalf. The **signers** are often outside the organization entirely (candidates, customers, vendors), have no account, and still get a copy and an audit record. The vendor holds evidence for both, which is why its records are designed to be trusted by people who don't trust the sender.

## How the Platforms Do It

As of October 2026:

| Product | Unit | Status model (public) | Evidence artifact | Integration surface |
| --- | --- | --- | --- | --- |
| **DocuSign eSignature** | Envelope: documents, recipients, tabs | created, sent, delivered, signed, completed, declined, voided (plus correct and template) | Certificate of completion, retrievable with the documents | REST API, Connect webhooks, published per-account limits |
| **Adobe Acrobat Sign** | Agreement | Not detailed here | Audit trail, downloadable by API | REST API with real-time status updates |
| **Dropbox Sign** | Signature request | Not detailed here | Signed files as one PDF or a ZIP | REST API with embedded signing |

The three converge on the same model, which is why it's worth building to even if you only integrate: **a package of documents, an ordered list of recipients with roles, fields placed on pages and assigned to recipients, a state machine, an event trail, and a sealed result with a certificate.**

## The Envelope

DocuSign's vocabulary is the de facto standard. An **envelope** holds one or more documents and recipients; **tabs** (fields) are placed on documents and assigned to recipients; recipients have roles and an order, so a manager approves before the candidate signs and HR receives a copy last.

The envelope's state machine, from DocuSign's status codes:

| Status | Meaning |
| --- | --- |
| `created` | A draft, not yet sent |
| `sent` | An email with a link went to at least one recipient; stays here until every recipient has at least viewed it |
| `delivered` | All recipients have viewed the documents on the signing site (not email delivery) |
| `signed` | All recipients have signed; a transient state during processing |
| `completed` | Completed by all recipients |
| `declined` | A recipient declined to sign |
| `voided` | Voided by the sender or expired; the void reason says which |
| `correct` | Opened by the sender for correction; signing stops |

Two details carry over to any design. `delivered` means *viewed on the signing site*, a fact the platform observed, not an email delivery receipt, which the platform can't observe reliably. And `voided` covers both a sender's cancellation and expiry, distinguished by reason, so "why didn't this get signed" has a recorded answer.

Status changes should be pushed, not polled. DocuSign's rules are explicit: use Connect (webhooks) to track envelopes; an app may make at most one status GET per envelope per 15 minutes (polling at 20-minute intervals is the advice), and repeated GETs are flagged and can fail an app's go-live review. Accounts default to 3,000 API calls an hour across all integrations, with a 30-second burst limit of 500 calls in production, plus per-envelope hourly and 30-second burst limits on GETs and PUTs. Other published limits shape templates and integrations: 100 recipients per envelope, 200 MB per envelope, 32 MB per document via the API (50 MB in the UI), 5 MB of completed documents attached to the completion email (larger sends a link), 50 signing groups and 20 Connect configurations per account. Webhook handling in general is [Webhooks](/docs/api-design/webhooks).

## The Sender's Account

The organization's e-signature account is workplace software with the same admin needs as any other tool in this book:

- **Identity and seats.** Senders are members provisioned by SSO and SCIM (the book's identity chapters); signers are not, and must never need an account.- **Signing groups.** A shared recipient (a group mailbox's worth of people, any one of whom may sign for the company) is how countersignature works without waiting for one executive. DocuSign caps them at 50 per account.
- **Templates owned by the organization.** Offer letters, NDAs and order forms are templates with fields and routing built in, owned by a team rather than a person, versioned, and permissioned so only legal changes the clauses.
- **Envelopes owned by the organization.** When a sender leaves, their in-flight envelopes must move to a colleague and their completed ones must stay in the account. A completed agreement in a departed recruiter's personal folder is a records problem.
- **Retention and purge.** Completed documents are business records with retention periods set by the customer, and providers expose purge state on envelopes (DocuSign's envelope model carries purge request and completion fields). The organization decides how long the provider keeps documents; its own records system keeps them for as long as the law requires ([Storage and Retrieval](/docs/compliance/electronic-signatures#storage-and-retrieval)).
- **Export.** Every completed envelope's documents and certificate land in the organization's own document system (a matter workspace in legal, a personnel file in HR, a deal record in the CRM) as soon as it completes.

My rule: **the e-signature provider is the ceremony and the evidence, not the repository.** The repository is the customer's DMS, file platform or CRM, and the integration that moves completed packets there is part of the signing feature, not an afterthought.

## The Certificate of Completion

The certificate (DocuSign's term; Adobe's API calls it the audit trail) is a document the provider generates that records the envelope's history: who received, viewed and signed it, when, and how each signer was authenticated. <!-- source-gap: certificate-contents | missing | field-level contents of DocuSign's certificate of completion | closes with: DocuSign support documentation of the certificate of completion (JavaScript-rendered) | checked: 2026-10-29 --> DocuSign's API returns it alongside the documents, either combined into one PDF with them or as its own download, and its download limits treat the documents, the certificate, a ZIP archive and the combined PDF as separately throttled artifacts.

What it's for in a workplace: it's the record a party produces when the other party says "I never signed that," and it carries weight precisely because the sender didn't generate it. That's also its limit. The certificate proves what happened inside the provider's ceremony; it doesn't prove that the person who controlled the email inbox was the intended signer. For high-stakes agreements, the sender adds authentication (an access code, SMS code, or identity verification), and the certificate records which was used. [What the Evidence Holds](/docs/compliance/electronic-signatures#what-the-evidence-holds) has the full list of evidence to keep alongside it.

## What E-Signature Can't Carry

ESIGN validates electronic signatures and records broadly, and then lists what it doesn't cover ([15 U.S.C. 7003](https://www.law.cornell.edu/uscode/text/15/7003)). For a workplace product, the list is a template-library guardrail:

- **Wills, codicils and testamentary trusts**, and state **family law** matters such as adoption and divorce.
- **The UCC**, other than sections 1-107 and 1-206 and Articles 2 and 2A (sales and leases of goods, which ESIGN does cover).
- **Court orders, notices and official court documents.**
- **Notices of** utility shutoff; default, acceleration, repossession, foreclosure or eviction on a primary residence; cancellation of health or life insurance; and product recalls or failures that endanger health or safety.
- **Documents accompanying hazardous materials** in transport or handling.

State law, and other countries, add their own exclusions and formalities (witnessing, notarization, deeds), which is where notarization below comes in. My default: templates carry a document category, and categories on an exclusion list can't be sent for electronic signature without a legal override recorded in the audit trail.

## eIDAS: Three Levels and Qualified Providers

When the counterparty is in the EU, eIDAS defines the levels ([Outside the US: eIDAS](/docs/compliance/electronic-signatures#outside-the-us-eidas) has the definitions). The workplace consequences, from the European Commission's eSignature FAQ:

- **Any level is admissible**: under Article 25 an electronic signature "shall not be denied legal effect and admissibility as evidence" merely because it's electronic or not qualified. Only a **qualified** signature is explicitly equivalent to a handwritten one in every Member State.
- **Qualified means a qualified certificate from a qualified trust service provider (QTSP)**, audited and granted qualified status by a national authority, with the signature created on a qualified signature creation device (QSCD).
- **The QSCD can be remote.** A QTSP can manage the device on the signer's behalf, which is how qualified signatures work in a browser without smart cards. The Cloud Signature Consortium publishes a common specification for this cloud-signing model, in which trust service providers manage keys and certificates so users need no smart card or USB token.
- **Member States publish trusted lists** of their QTSPs (Article 22), and validation of a qualified signature produces a validation report checking integrity, the certificate's qualified status and the use of a QSCD (Article 32).
- **Seals are for organizations.** A signature is a natural person's; an electronic **seal** is a legal person's, for origin and integrity (an invoice, a certificate issued by the company), and where a qualified seal is required, a qualified signature by an authorized representative is acceptable.

eIDAS 2, Regulation (EU) 2024/1183, is in force: Member States must offer European Digital Identity Wallets to citizens by the end of 2026, creating qualified signatures for non-professional use will be free through them, and the trust services expand to cover electronic ledgers and the management of remote signature and seal creation devices. For a workplace platform, the wallet is a new signer channel to plan for: an EU candidate may soon sign an offer letter with a qualified signature from their phone at no cost.

The engineering consequence of levels is that **the level is a property of the envelope**, chosen by the sender's template from the document type and the counterparty's jurisdiction, and the provider must route qualified-level signing through a QTSP. A system that lets senders pick "qualified" without a QTSP integration is promising something it can't deliver.

## Signatures Inside the PDF

The certificate of completion is evidence alongside a document; a **digital signature** is cryptographic evidence inside it. PDF supports embedded signatures that cover byte ranges of the file and break visibly if the covered bytes change, with incremental updates allowing several signatures in sequence. Advanced and qualified eIDAS signatures are typically PDF signatures in the PAdES profile, and long-term validation embeds the certificate chain, revocation data and timestamps so the signature can be checked after the signer's certificate expires. <!-- source-gap: pades-ltv | missing | PAdES and long-term validation specifics | closes with: ETSI EN 319 142 or a vendor's public documentation of PAdES baseline levels and LTV | checked: 2026-10-29 -->

There are two ways to make a completed PDF tamper-evident: the provider applies its own digital signature to the finished file as a seal, with each signer's mark an image backed by the certificate's event record, or each signer signs with their own certificate. Both can satisfy ESIGN; they answer different questions. The provider seal proves the file hasn't changed since completion; a signer's own digital signature proves which key signed it.

My rule for storage: **store the completed PDF exactly as the provider returned it, byte for byte.** Re-saving it through a PDF library, adding a cover page, or "optimizing" it invalidates embedded signatures, and a hash mismatch against the certificate is the first thing opposing counsel checks.

## Contract Lifecycle Management

E-signature is one step of an agreement's life. **Contract lifecycle management (CLM)** covers the rest: intake (a request to contract), authoring from templates and clause libraries, internal approvals, negotiation and redlining with the counterparty, signature, then the post-signature life: storing the executed agreement as a record, extracting its terms (parties, dates, value, renewal and termination clauses, obligations), reminding owners of deadlines, and handling amendments and renewals. DocuSign's developer platform now lists Web Forms, Workflow Builder and Agreement Manager APIs alongside eSignature, which is the same expansion seen from the API catalog.

The parts that are hard engineering, not workflow configuration:

- **Redlining across organizations.** Negotiation happens in Word files or in a shared online editor, with each side's changes attributed and the agreed version locked before signature. The locked version's hash is what gets sent for signature, so "the version we agreed" and "the version signed" are provably the same.
- **Metadata extraction.** Renewal dates, notice periods and auto-renewal clauses drive reminders; extracting them (by humans, rules or AI) must record the source clause and a confidence, and a human confirms anything that triggers money or a deadline. Commerce's [Auto-Renewal & Cancellation Law](/books/commerce/auto-renewal-law) shows what a missed renewal notice costs on the consumer side.
- **Deadlines as computed, stored data.** "60 days before the renewal date" is computed once from the extracted terms, stored with the rule that produced it, and recomputed when an amendment changes the terms ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).
- **Obligations owned by people.** An obligation (deliver a report quarterly, maintain insurance) needs an owner who's a member, reassigned at offboarding like any other owned item.

## Remote Online Notarization

Some documents need a notary, not just a signature: affidavits, many real estate documents, powers of attorney. **Remote online notarization (RON)** lets a commissioned notary notarize an electronic document for a signer on a video call. The National Notary Association describes the requirements most states share: the notary meets their state's requirements for notarizing electronic documents for remotely located signers; "in most states, the Notary must use two or more methods of identifying the signer," such as knowledge-based authentication and credential analysis of an ID document; the notary makes and keeps an audio-visual recording of the notarization; and the act goes in an electronic journal. Coverage is broad but not complete: the NNA notes California's law pending certification and no RON law in Georgia, Mississippi and South Carolina (as of October 2026). <!-- source-gap: ron-state-count | missing | number of states with permanent RON laws and recording retention periods | closes with: NNA or MBA state-by-state RON table with dates, or state statutes | checked: 2026-10-29 -->

For a workplace platform, RON is usually an integration with a RON platform, and the product questions are routing and records: which templates require notarization, in which states the signer can use RON, where the recording and journal entry are kept, and for how long. The recording is a video of a person's face and ID document, about as sensitive as personal data gets; it belongs to the notary's records under state law, and the platform's retention of it follows that law, not the sender's preferences.

## How to Build It

Most products integrate a provider rather than run the ceremony. The chapter's tables track agreements on the workplace side, mirror provider state, and keep the packet. A signed agreement is an `items` row (`kind = 'agreement'`) so it inherits grants, retention, holds and export.

```sql
-- items.kind gains 'agreement'.

CREATE TABLE agreement_templates (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id     UUID NOT NULL REFERENCES workspaces (id),
  owner_group_id   UUID NOT NULL REFERENCES groups (id),   -- owned by a team, not a person
  name             TEXT NOT NULL,
  version          INT NOT NULL,
  document_category TEXT NOT NULL,                         -- checked against the exclusion list
  signature_level  TEXT NOT NULL DEFAULT 'simple'
                     CHECK (signature_level IN ('simple', 'advanced', 'qualified')),
  requires_notary  BOOLEAN NOT NULL DEFAULT FALSE,
  routing          JSONB NOT NULL,                         -- ordered roles, types, auth methods
  file_item_id     UUID NOT NULL REFERENCES items (id),    -- the template document
  UNIQUE (id, version)
);

CREATE TABLE envelopes (                    -- one per send; kind table for items 'agreement'
  item_id          UUID PRIMARY KEY REFERENCES items (id),
  workspace_id     UUID NOT NULL REFERENCES workspaces (id),
  template_id      UUID REFERENCES agreement_templates (id),
  template_version INT,
  provider         TEXT NOT NULL CHECK (provider IN ('docusign', 'acrobat_sign', 'dropbox_sign',
                     'internal')),
  provider_envelope_id TEXT,                               -- unique per provider
  sender_member_id UUID NOT NULL REFERENCES members (id),
  owner_member_id  UUID NOT NULL REFERENCES members (id),  -- reassigned at offboarding
  status           TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'delivered', 'completed',
                     'declined', 'voided', 'correcting')),
  void_reason      TEXT,                                   -- 'sender', 'expired', free text
  document_hash    BYTEA,                                  -- of the version sent for signature
  completed_hash   BYTEA,                                  -- of the sealed result as returned
  legal_override_by UUID REFERENCES members (id),          -- excluded category sent anyway
  sent_at          TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  UNIQUE (provider, provider_envelope_id)
);

CREATE TABLE envelope_recipients (
  envelope_item_id UUID NOT NULL REFERENCES envelopes (item_id),
  position         SMALLINT NOT NULL,                      -- routing order
  role             TEXT NOT NULL,                          -- 'candidate', 'hiring_manager', ...
  type             TEXT NOT NULL CHECK (type IN ('signer', 'approver', 'cc', 'in_person',
                     'signing_group', 'notary')),
  member_id        UUID REFERENCES members (id),           -- internal recipients
  external_email   TEXT,                                   -- outside signers have no account
  auth_method      TEXT NOT NULL DEFAULT 'email' CHECK (auth_method IN ('email', 'access_code',
                     'sms', 'id_verification', 'qtsp')),
  status           TEXT NOT NULL CHECK (status IN ('waiting', 'sent', 'viewed', 'signed',
                     'declined', 'completed')),
  acted_at         TIMESTAMPTZ,
  PRIMARY KEY (envelope_item_id, position, role)
);

CREATE TABLE envelope_events (              -- provider webhook events, deduplicated
  provider         TEXT NOT NULL,
  provider_event_id TEXT NOT NULL,
  envelope_item_id UUID NOT NULL REFERENCES envelopes (item_id),
  event            TEXT NOT NULL,
  occurred_at      TIMESTAMPTZ NOT NULL,                   -- provider's time
  received_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload          JSONB NOT NULL,
  PRIMARY KEY (provider, provider_event_id)
);

CREATE TABLE agreement_terms (              -- extracted metadata, each value sourced
  envelope_item_id UUID NOT NULL REFERENCES envelopes (item_id),
  term             TEXT NOT NULL,           -- 'renewal_date', 'notice_days', 'value', ...
  value            JSONB NOT NULL,
  source_page      INT,
  source_text      TEXT,
  extracted_by     TEXT NOT NULL CHECK (extracted_by IN ('human', 'rule', 'ai')),
  confirmed_by     UUID REFERENCES members (id),           -- required before deadlines fire
  PRIMARY KEY (envelope_item_id, term)
);
```

The completion flow: a verified webhook (or a 20-minute poll where webhooks aren't possible) moves the envelope to `completed`; a job downloads the sealed PDF and the certificate, stores both unmodified as `files` with `item_versions` rows ([Files, Sync & Storage](/books/workplace-and-collaboration/files-and-sync#how-to-build-it)), records `completed_hash`, files them into the destination container (HR, legal, deal), and only then marks the agreement complete in the product. Retention policies and legal holds (core `retention_policies`, `legal_holds`) apply to the agreement item like any other record, and a hold blocks the provider-side purge request as well as local deletion.

## Auditing

The agreement's own certificate is the signing evidence; the workplace side's `audit_events` add what the provider can't see:

- **Sending**: who sent which template version to whom, at which signature level, with which authentication; any legal override of an excluded category.
- **Changes**: corrections, voids (with reason), resends, recipient changes, and who made them.
- **Custody**: certificate and document downloads into the organization's systems, hashes, destination; export and access of completed agreements; ownership changes at offboarding.
- **Terms**: extraction runs, confirmations, edits to extracted terms, deadline computations and the reminders they triggered.
- **Retention**: purge requests sent to the provider, holds that blocked them.

## What This Means for the System You Build

- Model agreements as envelopes: documents, ordered recipients with roles, fields, a state machine, an event trail and a sealed result.
- Track status with verified webhooks, deduplicated by event ID; poll only within the provider's published limits.
- Make the organization own templates and agreements, with team ownership and reassignment at offboarding.
- Treat the provider as ceremony and evidence; file every completed PDF and certificate, unmodified, into the customer's own records system.
- Block excluded document categories from electronic signature unless a recorded legal override exists.
- Set the signature level on the template, and route qualified signatures through a QTSP rather than promising them.
- Hash the agreed version before sending and the sealed result after, and never re-save a signed PDF.
- Extract terms with their source and confirmation, compute deadlines once and store them, and give obligations owners.
- Handle notarization as routing plus records, with recordings retained under the notary's state law.

## References

**Law and regulation**

- [15 U.S.C. 7001: General rule of validity](https://www.law.cornell.edu/uscode/text/15/7001), validity, consumer disclosures, retention and accurate reproduction, electronic agents
- [15 U.S.C. 7003: Specific exceptions](https://www.law.cornell.edu/uscode/text/15/7003), wills and testamentary trusts, family law, UCC exceptions, court documents, listed notices, hazardous materials documents
- [15 U.S.C. 7006: Definitions](https://www.law.cornell.edu/uscode/text/15/7006), electronic signature and electronic record
- [European Commission: eSignature FAQ](https://ec.europa.eu/digital-building-blocks/sites/display/DIGITAL/eSignature+FAQ), signature levels, Article 25 legal effect, QTSPs and QSCDs, remote QSCDs, trusted lists (Article 22), validation (Article 32), seals
- [European Commission: European Digital Identity Regulation](https://digital-strategy.ec.europa.eu/en/policies/eudi-regulation), wallets by the end of 2026, free qualified signatures for non-professional use, ledgers and remote signature devices as trust services

**Vendor documentation**

- [DocuSign Developers: Envelope status codes](https://developers.docusign.com/docs/esign-rest-api/esign101/concepts/envelopes/status-codes/), envelope states and their definitions, Connect as the recommended status source; the API catalog in the site navigation
- [DocuSign Developers: eSignature API rules and resource limits](https://developers.docusign.com/docs/esign-rest-api/esign101/rules-and-limits/), 3,000 calls an hour default, 500-call burst, one status GET per envelope per 15 minutes, upload and download limits by artifact, file and envelope sizes, 100 recipients, 50 signing groups, 20 Connect configurations
- [DocuSign SDK: Envelope model](https://javadoc.io/static/com.docusign/docusign-esign-java/6.7.0/com/docusign/esign/model/Envelope.html), envelope status, purge state fields and void reason
- [Adobe: Acrobat Sign developer guide](https://developer.adobe.com/acrobat-sign/docs/overview/developer_guide/), agreements, signed document retrieval, audit trail downloads and real-time status updates
- [Dropbox Sign API: Download files](https://developers.hellosign.com/api/reference/operation/signatureRequestFiles/), signed documents as one merged PDF or a ZIP, 409 while files are prepared
- [Cloud Signature Consortium](https://cloudsignatureconsortium.org/), the common specification for cloud-based digital signatures with keys managed by trust service providers
- [National Notary Association: What is a remote online Notary?](https://www.nationalnotary.org/knowledge-center/remote-online-notary/what-is-a-remote-online-notary), RON definition, two or more identification methods in most states, audio-visual recording, electronic journal, states without RON law
