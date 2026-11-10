+++
title = "Certificates of Insurance"
description = "ACORD certificates, what a certificate does and doesn't do, additional insured endorsements, NY, Texas and NCOIL certificate laws, and COI issuing and tracking."
category = "Insurance Industry"
order = 2751
part = "Commercial and Specialty Lines"
tags = ["insurance", "certificates-of-insurance", "additional-insured", "acord", "compliance", "commercial-lines"]
+++

A certificate of insurance is a one-page summary of someone else's policies, issued so a third party can see that coverage exists. A general contractor asks every subcontractor for one before letting it on site; a landlord asks a commercial tenant; a hospital asks a vendor; a city asks the company that rents its park. Millions are issued a year, mostly by agents and brokers from their agency management systems, increasingly by carriers' self-service portals for small commercial customers, and they are read by compliance teams and software that check them against contract requirements.

The certificate's legal weakness is its whole design problem. It is evidence, not coverage: it can't add an additional insured, promise notice of cancellation, or change a limit, however it is worded. What protects the certificate holder is an endorsement on the policy itself. So the issuing system has to produce certificates that match the policy and say nothing the policy doesn't, the tracking system has to look past the certificate to the endorsements, and both have to handle renewals, cancellations and the state laws that make misleading certificates illegal. This chapter covers the forms, what a certificate does and doesn't do, additional insured endorsements, the state certificate laws, and issuing and tracking. It extends `policies` and `party_roles` from [The Core Data Model](/books/insurance/insurance-business#the-core-data-model) with `certificates`. The business's side, carrying and tracking its own and its subcontractors' coverage, is in [Bonds and Certificates of Insurance](/books/field-operations/licensing-and-permits#bonds-and-certificates-of-insurance).

## How the Platforms Do It

As of November 2026, from public pages:

| Who | Role | What they say publicly |
| --- | --- | --- |
| **ACORD** | Standards body | Publishes the standard certificate forms (ACORD 25 for liability, and ACORD 27, both addressed in New York's 2002 opinion), which Texas law and the NCOIL model treat as standard forms needing no insurer filing |
| **Agency management systems** | Issuing | Agents and brokers issue most certificates from their AMS, filled from the policy data the carrier downloads (Comparative Raters & Agency Systems in the Distribution part covers downloads) |
| **ERGO NEXT and other small commercial sellers** | Self-service servicing | Online purchase and "24/7 access to purchasing and servicing" for GL, BOP and other small commercial policies, where proof of coverage is often the reason to buy |
| **illumend (formerly myCOI)** | Tracking for certificate holders | Its AI "checks every line against your contract requirements" and reads additional insured, waiver of subrogation, primary and noncontributory and per-project aggregate endorsements; 45 million+ insurance documents managed |
| **TrustLayer** | Tracking for certificate holders | Reads each COI, checks it against compliance profiles tied to contract requirements and "flags any gaps in coverage"; 400,000+ COIs a month |

Two industries meet at the certificate: the insurance side that issues it from policy data, and the risk management side that receives it and compares it to a contract. The tracking vendors' pitch is that the certificate alone isn't enough and the endorsements must be read too.

## What a Certificate Is

The ACORD 25 says it plainly: "THIS CERTIFICATE IS ISSUED AS A MATTER OF INFORMATION ONLY AND CONFERS NO RIGHTS UPON THE CERTIFICATE HOLDER," and if the holder is an additional insured, "the policy(ies) must be endorsed." The form lists the producer, the insured, the insurers affording coverage with their NAIC numbers, and for each line (general liability, auto, umbrella and excess, workers' compensation and employers liability, other) the policy number, effective and expiration dates and limits, plus boxes for additional insured and subrogation waiver, a description of operations, and the certificate holder.

New York's Insurance Department stated the rule in an opinion in 2002: ACORD certificates "may be used only to provide evidence of insurance in lieu of an actual copy of the applicable insurance policy"; they "may not be used to amend, expand, or otherwise alter the terms of the actual policy"; a certificate "is not a contract." A certificate that only restates the policy isn't a policy form; one that alters the policy "constitutes a policy form, which must be filed with the Superintendent."

What a certificate does not do:

- **It doesn't make the holder an additional insured.** Only an additional insured endorsement does, and the certificate's AI box only reports that one exists.
- **It doesn't give notice rights.** The holder gets notice of cancellation only if the policy or an endorsement grants it.
- **It doesn't promise the policy complies with the contract.** A contract number in the description field is not a warranty.
- **It doesn't stay true.** It is accurate as of the day it was issued; a cancellation the next week doesn't change the paper.

## Additional Insured Endorsements

The coverage a certificate holder actually wants lives in endorsements. For general liability, ISO's family is the industry's vocabulary:

| Form | What it does |
| --- | --- |
| **CG 20 10** | Additional insured, owners, lessees or contractors, scheduled person or organization: for injury or damage "caused, in whole or in part, by" the named insured's ongoing operations for the scheduled party; completed operations excluded |
| **CG 20 37** | The completed operations counterpart, scheduled |
| **CG 20 33, CG 20 38** | Blanket ongoing operations: any party the named insured has agreed in a written contract to add |
| **CG 20 39, CG 20 40** | Blanket completed operations |
| **CG 20 26** | Additional insured, designated person or organization, not specific to construction |
| **CG 20 01** | Primary and noncontributory wording for additional insureds |
| **CG 24 04** | Waiver of transfer of rights of recovery (waiver of subrogation) |

CG 20 10's current edition is 12 19 (earlier editions 04 13, 07 04 and 10 01 are still on policies), and the current form limits the AI coverage to what the contract requires and does not increase the limits. Edition matters: a contract requiring "CG 20 10 04 13 or equivalent" is satisfied or not depending on the edition on the policy. Blanket endorsements make the certificate holder's status depend on the insured's contract with it, so a tracking system that checks only the endorsement's name misses whether the contract qualifies.

### A Worked Compliance Check

The requirement and certificate are mine and illustrative. A general contractor's subcontract requires: GL of $1,000,000 each occurrence and $2,000,000 aggregate, the GC as additional insured for ongoing and completed operations on a primary and noncontributory basis, a waiver of subrogation, auto liability of $1,000,000 combined single limit, workers' compensation with $1,000,000 employers liability, and an umbrella of $5,000,000 following form. The subcontractor's broker sends a certificate:

| Requirement | Certificate shows | Endorsement found | Result |
| --- | --- | --- | --- |
| GL $1M / $2M | $1,000,000 / $2,000,000 | n/a | Meets |
| AI, ongoing operations | AI box checked | CG 20 33 blanket, contract required | Meets if the subcontract is signed before the work |
| AI, completed operations | AI box checked | None | **Fails**: no completed operations endorsement |
| Primary and noncontributory | Stated in description | None | **Fails**: the description field can't make coverage primary |
| Waiver of subrogation | Box checked | CG 24 04 blanket | Meets |
| Auto $1M CSL | $1,000,000 | n/a | Meets |
| WC and EL $1M | Statutory; EL $500,000 / $500,000 / $500,000 | n/a | **Fails**: EL limits below the requirement |
| Umbrella $5M | $5,000,000 | Follow form per declarations | Meets, if the umbrella schedules the GL |

Three failures, two of which the certificate itself hid: the boxes and the description said yes, and only the endorsements said no. A rule that compares a certificate to a contract without the endorsements passes this subcontractor.

## The Certificate Laws

States have legislated against certificates that misstate coverage and against certificate holders who demand them. The National Council of Insurance Legislators' **Certificates of Insurance Model Act**, adopted November 18, 2012 and readopted July 15, 2017 and July 16, 2022, is the template:

- **Filed forms only.** A person "may not prepare, issue, or request or require the issuance of a certificate of insurance" for risks in the state unless the form has been filed with the commissioner; ACORD, AAIS and ISO standard forms, and forms set by law, need no filing by individual insurers.
- **No alteration.** A certificate "is not a policy of insurance and does not affirmatively or negatively amend, extend, or alter the coverage," and "shall not confer to any person new or additional rights."
- **No false or coverage-changing content, and no contract warranties.** Nobody may alter a filed form, or prepare, issue, request or require a certificate with false or misleading information or one that purports to change coverage, and a certificate "may not warrant" that the policy meets a contract's requirements.
- **Notice only from the policy.** A person is entitled to notice of cancellation, nonrenewal or material change "only if the person has such notice rights under the terms of the policy of insurance or any endorsement."
- **Void documents and fines.** A certificate or other document required in violation is "null and void"; the commissioner may investigate, order a stop and fine per violation.

Two state laws, as examples:

**New York Insurance Law Article 5** (sections 501 to 504) bars anyone from wilfully requiring, as a condition of a contract, work or payment, a liability certificate on any form other than one promulgated by the issuing insurer, a standard form from an industry standard-setting organization, or one the superintendent approves (502(a)); from requiring terms that state the policy covers what it doesn't (502(b)); and says a certificate may not "amend, extend, or alter the coverage" or confer rights beyond the policy (502(c)). The superintendent may impose $1,000 for a first violation and $2,000 for each later one (503).

**Texas Insurance Code chapter 1811**, in effect since September 1, 2011, makes the form a filing matter: an insurer or agent "may not issue a certificate of insurance" unless the form was filed and approved under section 1811.101 or is a standard form; nobody may "execute, issue, or require the issuance" of a certificate for Texas risks on an unapproved form (1811.052). Standard forms from ACORD, AAIS and ISO are "deemed approved on the date the form is filed with the department" (1811.103). Nobody may require a certificate "that contains any false or misleading information concerning the policy" (1811.054), and "A certificate of insurance may not alter the terms and conditions of the notice required by a policy" (1811.155).

I couldn't confirm a current list of which states have enacted the NCOIL model or their own versions. <!-- source-gap: coi-state-laws | missing | which states have enacted certificate of insurance laws (NCOIL model or their own) and when | closes with: NCOIL's adoption list or a state-by-state compilation opened | checked: 2026-11-09 -->

## Issuing Certificates

The issuer is usually the producer, sometimes the insurer. A certificate must be generated from policy data as it stands on the issue date, never typed freehand, because the laws above make a misleading one a violation and a typed AI box with no endorsement is exactly that. The rules an issuing system enforces:

- **Fill from the policy version in force on the issue date:** insurers and NAIC numbers, policy numbers, dates and limits.
- **Check the AI and subrogation boxes only if an endorsement on the policy grants it** for this holder (scheduled by name, or blanket with the insured's attestation of a qualifying contract).
- **Keep the description field to facts on the policy:** the project or location, and references to endorsements by form number and edition, never "certificate holder is primary" or "30 days' notice of cancellation" unless the policy says so.
- **Use a filed or standard form** for the state where the risk is.
- **Record who requested it and for whom,** because renewals and cancellations need the list of holders.

Renewal produces a new certificate for every holder of the expiring one; an endorsement that changes a limit or removes a location produces new certificates for the holders affected; cancellation triggers the notices the policy or endorsements grant to the holders who have notice rights, and nothing for those who don't.

## Tracking Certificates

The certificate holder's system (a general contractor's, a property manager's, a facilities network's, or a vendor like illumend or TrustLayer) compares what it receives against what each contract requires. What works:

- **Requirements as data,** per contract or vendor class: lines, limits, endorsements by form or by function, editions accepted, primary and noncontributory, waivers, carrier rating minimums.
- **Ingest the certificate and the endorsements,** extract them into fields, and evaluate each requirement against the policy evidence, not the boxes.
- **Track expiry and renewal** per policy, not per certificate, and request new evidence before expiry.
- **Verify with the source** when the stakes justify it: the producer or the insurer.
- **Gate work on compliance** (no site access, no dispatch, no payment) where the contract allows it, which is what field service platforms do.

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model). A certificate is a rendered `documents` row with a structured record of what it said and which policy versions it was filled from; its holder is a party, and an additional insured status is a `party_roles` row on the policy version with the endorsement that grants it.

```sql
CREATE TABLE certificates (                -- one certificate as issued
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  certificate_number TEXT NOT NULL UNIQUE,
  form               TEXT NOT NULL,         -- 'ACORD 25', a filed form number
  form_state_ok      BOOLEAN NOT NULL,      -- filed or standard for the risk's state
  insured_party_id   UUID NOT NULL REFERENCES parties (id),
  holder_party_id    UUID NOT NULL REFERENCES parties (id),
  issued_by_producer_id UUID REFERENCES producers (id),  -- null when the insurer issued it
  issued_at          TIMESTAMPTZ NOT NULL,
  as_of              TIMESTAMPTZ NOT NULL,  -- the policy data it reflects
  description        TEXT,                  -- facts only, validated against the policies
  supersedes_id      UUID REFERENCES certificates (id),  -- renewal or change reissue
  document_id        UUID NOT NULL,         -- documents: the rendered certificate
  delivered_at       TIMESTAMPTZ,
  requested_by       TEXT                   -- the insured, the holder, a portal
);

CREATE TABLE certificate_lines (           -- each policy the certificate reports
  certificate_id     UUID NOT NULL REFERENCES certificates (id),
  policy_version_id  UUID NOT NULL REFERENCES policy_versions (id),
  line               TEXT NOT NULL,         -- 'gl', 'auto', 'umbrella', 'wc_el', 'property'
  limits_shown       JSONB NOT NULL,        -- copied from coverages, never typed
  ai_shown           BOOLEAN NOT NULL,
  ai_party_role_id   UUID REFERENCES party_roles (id),  -- the AI status that justifies it
  subrogation_waiver_shown BOOLEAN NOT NULL,
  waiver_form_id     UUID,                  -- forms: the endorsement edition
  PRIMARY KEY (certificate_id, policy_version_id, line),
  CHECK (NOT ai_shown OR ai_party_role_id IS NOT NULL),
  CHECK (NOT subrogation_waiver_shown OR waiver_form_id IS NOT NULL)
);

-- Additional insureds are party_roles on the policy version with the endorsement that
-- grants the status: role 'additional_insured', plus
--   attributes {"form_id": ..., "scope": "ongoing" | "completed" | "both",
--               "basis": "scheduled" | "blanket_contract", "primary_noncontributory": true,
--               "notice_of_cancellation_days": 30 | null}
```

Holders to reissue to at renewal, and holders owed notice at cancellation, are queries:

```sql
-- Holders of current certificates on a policy, with notice rights from the policy itself.
SELECT DISTINCT ON (c.holder_party_id) c.holder_party_id, c.id AS last_certificate,
       (pr.attributes->>'notice_of_cancellation_days')::int AS notice_days
FROM certificates c
JOIN certificate_lines cl ON cl.certificate_id = c.id
JOIN policy_versions pv ON pv.id = cl.policy_version_id
LEFT JOIN party_roles pr ON pr.subject_type = 'policy_version' AND pr.subject_id = pv.id
  AND pr.party_id = c.holder_party_id AND pr.role IN ('additional_insured', 'notice_holder')
WHERE pv.policy_term_id = :term_id
  AND NOT EXISTS (SELECT 1 FROM certificates n WHERE n.supersedes_id = c.id)
ORDER BY c.holder_party_id, c.issued_at DESC;
```

Design notes:

- **Generate, don't type.** Limits and dates on a certificate line are copied from the policy version; the AI and waiver boxes require the endorsement row; the schema refuses a checked box with nothing behind it.
- **The description field is validated.** Phrases that assert coverage terms (primary, notice days, "per contract") are rejected unless an endorsement on the policy carries that term.
- **Certificates are versions.** A reissue supersedes the old certificate; the holder list for renewals and cancellations is the set of unsuperseded certificates.
- **Notice rights come from party roles, not certificates.** A cancellation job reads `party_roles` for holders with notice rights and creates `notices` for them; certificate holders without them get nothing from the insurer.

## Auditing

- **Every certificate as issued,** with the policy versions it was filled from, so any one can be shown to match the policy on its issue date.
- **The endorsement behind every AI and waiver box,** by form and edition.
- **Holder lists over time:** who held a current certificate on any date, what reissues they received at renewal, and what notices the policy entitled them to.
- **Form compliance:** the form used for each certificate and whether it was filed or standard in the risk's state.

## What This Means for the System You Build

- **Issue certificates only from policy data as of the issue date,** never as free text.
- **Require an endorsement row behind every additional insured and waiver box,** enforced in the schema.
- **Restrict the description field to facts on the policy,** and refuse coverage-changing language.
- **Use filed or standard forms per state** and record which.
- **Keep the holder list current** to reissue at renewal and change, and give cancellation notice only to holders the policy entitles.
- **When tracking certificates, evaluate the endorsements against the contract,** not the checkboxes.

## References

**Law and regulation**

- [N.Y. Ins. Law 502](https://www.nysenate.gov/legislation/laws/ISC/502), the forms that may be required, the bar on requiring coverage terms the policy lacks, and certificates that may not alter coverage
- [N.Y. Ins. Law 503](https://www.nysenate.gov/legislation/laws/ISC/503), penalties of $1,000 for a first violation and $2,000 for each later one
- [Tex. Ins. Code 1811.052](https://texas.public.law/statutes/tex._ins._code_section_1811.052), certificates only on approved or standard forms, effective September 1, 2011
- [Tex. Ins. Code 1811.054](https://texas.public.law/statutes/tex._ins._code_section_1811.054), no requiring certificates with false or misleading information
- [Tex. Ins. Code 1811.103](https://texas.public.law/statutes/tex._ins._code_section_1811.103), ACORD, AAIS and ISO standard forms deemed approved on filing
- [Tex. Ins. Code 1811.155](https://texas.public.law/statutes/tex._ins._code_section_1811.155), a certificate may not alter a policy's notice terms

**Regulators and guidance**

- [New York Insurance Department: OGC Opinion 02-12-04, December 4, 2002](https://www.dfs.ny.gov/insurance/ogco2002/rg021204.htm), ACORD certificates as evidence only, not contracts, and certificates that alter coverage as policy forms
- [NCOIL: Certificates of Insurance Model Act (PDF)](https://ncoil.org/wp-content/uploads/2025/12/Certificates-Model-re-adopted-7-16-22.pdf), adopted November 18, 2012 and readopted 2017 and 2022: filed forms, no alteration, no false content or warranties, notice only from the policy, void documents and fines

**Standards**

- [UCF: Sample ACORD 25 certificate (PDF)](https://procurement.ucf.edu/wp-content/uploads/sites/3/2020/05/SampleCertificate-UCF-BOT.pdf), the information-only disclaimer and the note that additional insureds require an endorsement
- [InsuranceXDate: CG 20 10 additional insured endorsement](https://insurancexdate.com/insurance-forms/CG/CG-20-10/), editions 12 19, 04 13, 07 04 and 10 01, ongoing operations scope, and the related CG 20 37, 20 33, 20 38, 20 39, 20 40, 20 26, 20 01 and 24 04 forms

**Vendor documentation**

- [illumend (from myCOI)](https://www.illumend.ai/), AI review of certificates and endorsements against contract requirements
- [TrustLayer](https://www.trustlayer.io/), compliance profiles, automated collection and gap flagging, and volumes
- [ERGO NEXT: ERGO finalizes the full acquisition of NEXT Insurance](https://www.nextinsurance.com/blog/ergo-successfully-finalizes-the-full-acquisition-of-next-insurance/), small commercial products sold online with self-service purchasing and servicing
