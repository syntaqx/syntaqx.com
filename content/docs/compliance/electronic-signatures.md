+++
title = "Electronic Signatures & Records"
nav_title = "E-Signatures & Records"
description = "E-signatures for engineers: ESIGN and UETA, consumer consent, embedded or remote signing, signing evidence, versioned click-through terms and retention."
category = "Compliance"
order = 907
tags = ["compliance", "e-signature", "esign", "contracts", "records"]
+++

Every product eventually asks someone to agree to something. A player accepts a game's EULA before the first match, a SaaS admin accepts the terms of service on signup, a seller accepts a marketplace's fee policy before listing, a homeowner signs a service agreement on a sales rep's tablet, a borrower signs loan documents on a phone. Months or years later somebody asks the same question: what exactly did this person agree to, and how do you know it was them? The answer is whatever the system captured in the few seconds around the click or the signature. If it captured a boolean `has_accepted_terms`, the answer is "trust us".

This chapter covers the US law that makes electronic agreement work, the consent step most products skip, where the signer's device fits, what evidence to keep, how to version click-through terms, and how to store records so they can be produced intact. It's about what the law asks of a system's design, not legal advice: which documents need what is a question for counsel.

## The Law: ESIGN and UETA

Two laws carry electronic signatures in the United States. The federal **ESIGN Act** says a signature, contract or record relating to a transaction in interstate or foreign commerce "may not be denied legal effect, validity, or enforceability solely because it is in electronic form" ([15 U.S.C. 7001(a)](https://www.law.cornell.edu/uscode/text/15/7001)). Its definition of an electronic signature is deliberately broad: "an electronic sound, symbol, or process, attached to or logically associated with a contract or other record and executed or adopted by a person with the intent to sign the record" ([15 U.S.C. 7006](https://www.law.cornell.edu/uscode/text/15/7006)). A drawn squiggle, a typed name and a click on "I agree" can all qualify. What matters is intent and the link to a specific record, and both are things your system has to be able to show.

ESIGN doesn't force anyone to use electronic records: it doesn't "require any person to agree to use or accept electronic records or electronic signatures" (7001(b)). A customer who wants paper is entitled to say so.

The state-level counterpart is the **Uniform Electronic Transactions Act (UETA)**, a uniform act the [Uniform Law Commission](https://www.uniformlaws.org/committees/community-home?CommunityKey=2c04b76c-2b7d-4399-977e-d5876ba7e034) adopted in 1999. It has been adopted by nearly every state, the District of Columbia and the U.S. Virgin Islands; New York has its own electronic signature law, the Electronic Signatures and Records Act, instead ([DLA Piper: UETA near full adoption](https://www.dlapiper.com/en/insights/publications/2021/07/with-illinoiss-adoption-of-ueta-united-states-near-full-adoption)). UETA contributes the rule every dispute turns on, **attribution**: a signature is attributable to a person "if it was the act of the person," which "may be shown in any manner, including a showing of the efficacy of any security procedure" (California's enactment: [Cal. Civ. Code 1633.9](https://california.public.law/codes/civil_code_section_1633.9)). Its effect is then judged from "the context and surrounding circumstances" at the time.

That's the engineering brief in one sentence. The law accepts electronic signatures readily; what it can't do is prove who signed and what they saw. Your records do that.

## Consumer Consent Comes First

The part of ESIGN that products most often get wrong is **7001(c)**. When a law requires that information be given to a *consumer in writing* (a cancellation notice, a credit disclosure, a renewal notice), an electronic record satisfies it only if:

- The consumer **affirmatively consented** and hasn't withdrawn.
- Before consenting, they got a clear and conspicuous statement of their right to a paper copy, their right to withdraw consent and its consequences, whether consent covers this transaction or a category of records, how to withdraw and update contact details, and how to get a paper copy and whether there's a fee.
- They got a statement of the **hardware and software** needed to access and keep the records.
- They consented electronically "in a manner that reasonably demonstrates that the consumer can access information in the electronic form that will be used."

The last item rules out the most common shortcut. If the disclosures will arrive as PDFs by email, a checkbox on a sales rep's screen doesn't demonstrate that the consumer can open a PDF in their own inbox. A link sent to that inbox, opened and confirmed, does.

Two more clauses matter for a long-lived product. If you later change the hardware or software needed, in a way that creates a material risk the consumer can't access or keep later records, you must tell them the new requirements and their right to withdraw, and get the demonstrating consent again (7001(c)(1)(D)). And a missing demonstration doesn't by itself void a contract the consumer signed (7001(c)(3)): the contract can stand while the electronic disclosures that went with it don't count as "in writing". That's the worse outcome, because it surfaces years later as "the customer was never validly told they could cancel".

My rule: **consent to electronic records is its own versioned record**, captured once per customer before anything that relies on it, with the disclosure text version, the channel it was demonstrated on, and the time. It is not a sentence buried in the terms of service.

## Embedded or Remote: Whose Device

Every signing flow answers one question first: whose screen is the signer looking at?

| Pattern | Examples | Evidence of identity | Signer keeps a copy |
| ------- | -------- | -------------------- | ------------------- |
| Seller's device, handed over | A rep's tablet at the door, a dealership or bank branch kiosk | Whatever the seller recorded: staff login, location, photo | Only if one is delivered afterwards |
| Embedded in your app, on the signer's device | Terms at signup, a seller agreement in a marketplace dashboard, an in-game EULA | The signer's authenticated session in your app | If you send or show one |
| Remote link from the provider | A lease, a contractor agreement, loan documents | Control of the inbox or phone the link went to, plus any code checked | Yes, before and after signing |

The seller's-device pattern is fast and works without the signer's email, and it's also the one where "I never saw those terms" is easiest to claim and hardest to rebut, because the signer never held a copy. I default to sending the document to the signer's own device and keeping the handed-over screen for when that's impossible, and then I don't count the agreement as complete until the signed copy has been delivered to a verified contact. An undelivered copy goes in a visible exception queue. [Signing the Agreement](/books/field-operations/signing-the-agreement#embedded-or-remote-whose-device) works through this for door-to-door sales, for example.

In embedded mode, identity is your job. Your app already authenticated the user (see [Authentication](/docs/security/authentication)), and that session is the attribution evidence, so record which session, which factor and when. For a high-stakes document, step the user up first rather than relying on a week-old cookie.

## Buy the Ceremony

For contracts that carry real money or legal weight, I use an e-signature provider rather than building the signing ceremony. They produce a sealed document and an independently verifiable record that doesn't depend on your database being trusted. All three major providers support both embedded and remote signing, and all three put the same thing on you when embedded: the signer's identity.

- **DocuSign eSignature** marks an embedded signer with a sender-created `clientUserId` showing "the recipient is embedded (captive)", and records your `authenticationMethod`, "the convention used to authenticate the signer". When the session ends, the redirect to your `returnUrl` carries an event such as `signing_complete`, `decline` or `session_timeout` ([DocuSign SDK: RecipientViewRequest](https://javadoc.io/static/com.docusign/docusign-esign-java/6.7.0/com/docusign/esign/model/RecipientViewRequest.html)). The signing URL "works once and expires after 5 minutes" ([Workato: DocuSign recipient view](https://docs.workato.com/en/connectors/docusign/action-create-recipient-view)), so request it when the signer arrives, not when the envelope is created. The documents API returns a `combined` PDF "containing the combined content of all documents and the certificate" ([DocuSign SDK: EnvelopesApi](https://javadoc.io/static/com.docusign/docusign-esign-java/6.7.0/com/docusign/esign/api/EnvelopesApi.html)).
- **Dropbox Sign** gives each signer a `signature_id` that you exchange for a `sign_url` at the moment they're ready; URLs are "only valid for 60 minutes" and "expire as soon as they're accessed," a repeat request for a signer who already signed returns `409`, and the iFrame only loads on the API app's registered domain ([Dropbox Sign: Embedded signing walkthrough](https://developers.hellosign.com/docs/embedded-signing/walkthrough/)).
- **Adobe Acrobat Sign** lists embedding a signing UI, receiving status updates in real time, retrieving signed agreements and downloading audit trails among its API's core uses ([Acrobat Sign developer guide](https://developer.adobe.com/acrobat-sign/docs/overview/developer_guide/)).

The browser redirect can be lost or forged, so confirm completion from the provider's API or a verified [webhook](/docs/api-design/webhooks), then download the signed document and the certificate into your own storage straight away. When you leave a vendor, your agreements must not leave with it.

## What the Evidence Holds

Whether the provider or your own code runs the ceremony, every signature or acceptance should leave behind:

- **The document as presented:** the rendered file the signer saw, not a template ID plus field values, with a hash of it before signing and of the signed result.
- **The consent record** it relied on, with the disclosure version.
- **Signer identity evidence:** account and session, contact point, any one-time code sent and verified, and the authentication method.
- **Timestamps** from the server, in UTC per [Time](/docs/fundamentals/time); a device clock is a claim, not evidence.
- **IP address and device:** user agent, app version, and for in-person signing the staff member and location.
- **An event trail:** sent, opened, viewed, each field completed, signed or declined, delivered.
- **The certificate:** the provider's completion certificate or audit trail, stored next to the document.
- **Delivery of the signed copy:** channel, address, time and result.

This is personal data kept for legal reasons, so classify it like any other field ([Sensitive Data](/docs/payments/sensitive-data#classify-every-field)) and keep it out of general-purpose logs. [Audit Trails & Records](/books/field-operations/audit-trails-and-records#e-signature-evidence) shows the same list applied to field service, for example.

## Click-Through Terms Are Signatures Too

Most products never touch a signing provider. They show terms and a button: a game's EULA, a SaaS app's terms of service, a marketplace's seller policy, an API's acceptable-use policy. Under ESIGN's definition, the click is a "process" adopted "with the intent to sign", which is why the same evidence questions apply. The difference is volume, so the design has to be cheap per row and exact about versions.

The model is two tables. Terms are versioned, immutable documents; an acceptance points at exactly one version.

```sql
CREATE TABLE terms_versions (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  document_key   TEXT NOT NULL
                   CHECK (document_key IN ('terms_of_service', 'seller_policy', 'eula')),
  version        TEXT NOT NULL,             -- '2026-10-01'
  content_sha256 TEXT NOT NULL,             -- hash of the rendered text shown
  storage_key    TEXT NOT NULL,             -- the rendered file, in WORM storage
  is_material    BOOLEAN NOT NULL DEFAULT false,
  effective_at   TIMESTAMPTZ NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT terms_versions_document_key_version_key UNIQUE (document_key, version)
);

CREATE TABLE terms_acceptances (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  terms_version_id  UUID NOT NULL REFERENCES terms_versions (id),
  account_id        UUID NOT NULL REFERENCES accounts (id),
  session_id        UUID,                   -- the authenticated session that clicked
  surface           TEXT NOT NULL
                      CHECK (surface IN ('signup', 'launcher', 'seller_dashboard', 'reacceptance_gate')),
  ip_address        INET,
  user_agent        TEXT,
  accepted_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- the re-acceptance gate's lookup, which also covers the foreign key to accounts
CREATE INDEX terms_acceptances_account_id_terms_version_id_idx
  ON terms_acceptances (account_id, terms_version_id);
CREATE INDEX terms_acceptances_terms_version_id_idx ON terms_acceptances (terms_version_id);
```

A few rules make this hold up:

- **The rows are append-only.** An acceptance is never updated or deleted by application code; a new version means a new row.
- **Store what was shown, not what's current.** The rendered text and its hash, so "which terms did this player accept in March?" is a lookup, not a reconstruction from a CMS that's been edited since.
- **Make the act unambiguous.** A checkbox the user ticks or a button that says "Agree and continue", next to a link to the exact version. A pre-ticked box or a "by using this site" footer is weak evidence of intent.
- **Record the surface.** The same terms accepted in a game launcher and on a website were presented differently, and a dispute may turn on that.

Acceptance is a business event, so publish it through the [outbox](/docs/architecture/events#the-transactional-outbox) like any other:

```http
ce-specversion: 1.0
ce-id: 019a2f1e-6c40-7d3a-9b1e-5f2c8a7d4e10
ce-source: /accounts
ce-type: terms.accepted
ce-subject: 0193f0a1-4b2c-7e11-8d3f-2a6b9c0e1f45
ce-time: 2026-10-26T15:04:12Z
Content-Type: application/json

{
  "id": "019a2f1e-6c3f-7b20-a4d1-0c9e8f7a6b51",
  "account_id": "0193f0a1-4b2c-7e11-8d3f-2a6b9c0e1f45",
  "terms_version_id": "019a1b7c-2d90-7f44-b6a2-3e1d0c9f8a72",
  "accepted_at": "2026-10-26T15:04:12Z"
}
```

## Re-acceptance on Change

Terms change. The question is whether a change needs fresh agreement, and that's a legal call made per version and recorded as data (`is_material` above), not a judgment made in code at request time.

For a material change, the pattern is a gate: on the next login, launch or API call that matters, the user sees the new version and either accepts or can't continue past the gate. A game shows the updated EULA in the launcher before the next match; a marketplace lets sellers browse but blocks new listings until they accept the new fee policy; a SaaS app blocks the admin, not every end user, because the admin is the one bound by the contract. Before the effective date, send notice, and record the notice's delivery the same way you record a signed copy's.

The gate is a query: does this account have an acceptance for the current version of each required document? Index it, cache it per session, and make it fail closed for material versions. Users who never come back keep the version they accepted, and your records should say so, rather than quietly showing them as on the latest terms.

The ESIGN consent record has the same lifecycle: a change to the formats or software needed to read your records can require consent to be demonstrated again (7001(c)(1)(D)).

## Storage and Retrieval

ESIGN's retention rule is the storage spec. An electronic record satisfies a retention requirement only if it "accurately reflects" the original and "remains accessible to all persons who are entitled to access" for the required period, "in a form that is capable of being accurately reproduced for later reference" (7001(d)). And where a contract must be in writing, an electronic version "may be denied" effect if it can't be "retained and accurately reproduced for later reference by all parties" (7001(e)). In practice:

- **Keep the signed artifact, not the inputs.** The sealed PDF, its hash and the certificate. A template plus field values re-rendered next year by different code is not the record that was signed.
- **Write once.** Store signed documents in object storage with write-once retention, keyed by the agreement's ID, and verify the stored hash on read.
- **The signer can get a copy, any time.** "All parties" means the customer too: a download link in their account, and a support path for the customer who has since lost access.
- **Retention follows the contract.** Keep it for the life of the agreement plus whatever period counsel sets for disputes, then delete on schedule. Signature evidence is a textbook case for [legal holds and pseudonymization rather than erasure](/docs/architecture/data-retention#erasure-vs-append-only-records) when a person asks to be forgotten ([GDPR & Privacy](/docs/compliance/gdpr)).
- **Production is a feature.** One call should assemble an agreement's packet: the document as signed, the certificate, the consent record, the event trail and the delivery record. If producing it takes an engineer and a day, it'll be wrong on the day it matters.

## Outside the US: eIDAS

The EU's eIDAS Regulation defines three levels. A **simple** electronic signature is data "attached to or logically associated with" other electronic data; an **advanced** one must be "uniquely linked to and capable of identifying the signatory" and under the signatory's control; a **qualified** one is an advanced signature "created by a qualified signature creation device" and "based on a qualified certificate." No electronic signature may be denied legal effect or admissibility just because it's electronic or not qualified, and qualified signatures have "the equivalent legal effect of handwritten signatures across all EU Member States" ([European Commission: eSignature FAQ](https://ec.europa.eu/digital-building-blocks/sites/display/DIGITAL/eSignature+FAQ)). Click-through terms and most commercial contracts work at the simple or advanced level; when a counterparty or a law asks for qualified, confirm your provider can produce one before you promise it.

## Checklist

- Consent to electronic records is captured, versioned and demonstrated on the channel the records will use, before anything relies on it.
- The signer sees the document on their own device by default; a handed-over screen requires delivery of the copy before the agreement counts.
- Embedded signing records your session, authentication method and any step-up.
- Provider completion is confirmed by API or verified webhook, and the signed PDF and certificate land in your own write-once storage.
- Evidence covers the document as presented, hashes, identity, server timestamps, IP and device, the event trail, the certificate and delivery.
- Terms are immutable versions with a content hash; acceptances are append-only rows pointing at one version.
- Material changes are flagged per version and gate the next relevant action until accepted.
- Every party can retrieve their signed copy, and one call produces an agreement's full packet.

## References

**Specifications**

- [15 U.S.C. 7001: General rule of validity](https://www.law.cornell.edu/uscode/text/15/7001), validity of electronic signatures and records, no duty to accept them, consumer consent disclosures in 7001(c), and retention and reproduction in 7001(d) and (e)
- [15 U.S.C. 7006: Definitions](https://www.law.cornell.edu/uscode/text/15/7006), electronic signature as a sound, symbol or process adopted with intent to sign, and consumer
- [California Civil Code 1633.9](https://california.public.law/codes/civil_code_section_1633.9), UETA's attribution rule as California enacted it

**Reference**

- [Uniform Law Commission: Electronic Transactions Act](https://www.uniformlaws.org/committees/community-home?CommunityKey=2c04b76c-2b7d-4399-977e-d5876ba7e034), the uniform act's home and enactment kit
- [Washington House bill report, SB 6028 (2020)](https://lawfilesext.leg.wa.gov/biennium/2019-20/Htm/Bill%20Reports/House/6028-S.E%20HBR%20APH%2020.htm), UETA's 1999 adoption and its enactment in the District of Columbia and the U.S. Virgin Islands
- [DLA Piper: With Illinois's adoption of UETA, United States near full adoption (2021)](https://www.dlapiper.com/en/insights/publications/2021/07/with-illinoiss-adoption-of-ueta-united-states-near-full-adoption), Illinois as the 49th state and New York's own Electronic Signatures and Records Act
- [European Commission: eSignature FAQ](https://ec.europa.eu/digital-building-blocks/sites/display/DIGITAL/eSignature+FAQ), eIDAS simple, advanced and qualified signatures and their legal effect

**In practice**

- [DocuSign SDK: RecipientViewRequest](https://javadoc.io/static/com.docusign/docusign-esign-java/6.7.0/com/docusign/esign/model/RecipientViewRequest.html), `clientUserId` for embedded signers, `authenticationMethod` and return URL events
- [DocuSign SDK: EnvelopesApi](https://javadoc.io/static/com.docusign/docusign-esign-java/6.7.0/com/docusign/esign/api/EnvelopesApi.html), retrieving the combined PDF of the documents and the certificate
- [Workato: DocuSign create recipient view](https://docs.workato.com/en/connectors/docusign/action-create-recipient-view), the embedded signing URL working once and expiring after five minutes
- [Dropbox Sign: Embedded signing walkthrough](https://developers.hellosign.com/docs/embedded-signing/walkthrough/), per-signer sign URLs valid for 60 minutes, expiry on access, 409 on repeat and domain verification
- [Adobe: Acrobat Sign developer guide](https://developer.adobe.com/acrobat-sign/docs/overview/developer_guide/), embedded signing UI, real-time status updates, signed agreement retrieval and audit trail downloads
