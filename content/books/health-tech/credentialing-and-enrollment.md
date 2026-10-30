+++
title = "Credentialing, Enrollment & Provider Data"
nav_title = "Credentialing & Enrollment"
description = "Getting a practitioner paid: NPI and NPPES, Medicare enrollment in PECOS, CAQH ProView, payer credentialing, directory accuracy rules and directory APIs."
category = "Health Tech Industry"
order = 1951
part = "Payers"
tags = ["health-tech", "payers", "credentialing", "npi", "pecos", "provider-directory", "data-model"]
+++

A new dentist joins a practice on the first of the month and can see patients that day. Getting paid for those patients takes months. The dentist needs a National Provider Identifier, a state license and DEA registration that the payers can verify, a profile in the industry's shared credentialing database, a credentialing decision from each payer's committee, an enrollment that links the dentist to the practice's tax ID and locations, and a listing in each payer's directory. Until each payer finishes, claims for that dentist's work are denied or paid out of network. The provider side calls this provider enrollment or payer enrollment; the payer side calls it credentialing and network management; both sides spend real money on keeping the resulting data correct, and regulators now fine the payer when the directory is wrong.

This chapter covers the identifiers (NPI, taxonomy, the Medicare enrollment record), the shared data hubs (NPPES, PECOS, CAQH ProView), credentialing as payers and accreditors define it, payer enrollment and its effective dates, and provider directories with their accuracy rules and APIs. It extends `practitioners`, `practitioner_roles` and `organizations` from [The Health Tech Business](/books/health-tech/health-tech-business#the-core-data-model). The kinds of payer and network are [Payers & Plans](/books/health-tech/payers-and-plans); EDI, ERA and EFT enrollment with clearinghouses is Clearinghouses in the Revenue Cycle part.

## How the Platforms Do It

As of October 2026, from public pages:

| System or vendor | Run by | What it holds | Notes |
| --- | --- | --- | --- |
| **NPPES** | CMS | The NPI and its data elements: name, type (individual or organization), addresses, taxonomy codes | Public NPI Registry with a free JSON API (version 2.1) and downloadable files |
| **PECOS** | CMS | Medicare enrollment: the practitioner or supplier, practice locations, reassignments to groups, ownership | Online enrollment, revalidation; paper forms as a fallback |
| **CAQH ProView** (DataSpring) | CAQH, rebranded DataSpring in 2026 | A practitioner's self-reported credentialing profile, shared with the plans the practitioner designates | Says 86% of US physicians share data with it; 7.4M+ provider records; about 1,000 health plans and other entities; sanctions flagged daily |
| **OIG LEIE** | HHS Office of Inspector General | Individuals and entities excluded from federal health care programs | CSV download plus monthly supplements; online search |
| **Payer credentialing** | Each payer, often delegated | Verified credentials, the committee decision, recredentialing dates | Medicare Advantage: recredentialing at least every 3 years (42 CFR 422.204) |
| **Credentialing services** | CVOs, RCM firms, practice software | Applications, follow-up, status tracking per payer | Many practices outsource; the work is forms, portals and phone calls |

Two patterns:

- **Enter once, share by consent.** ProView's model is that "Providers and group administrators enter data once and it is shared with all plans they designate." The payer still verifies at the primary source; the hub removes the re-typing, not the verification.
- **The government records are public; the payer records are not.** NPPES is a public registry anyone can query; PECOS enrollment status is visible in CMS public files; a commercial payer's credentialing decision and network status are visible only to the provider (through the payer's portal) and to members (through the directory).

## Identifiers

- **NPI.** The HIPAA standard identifier for health care providers. A covered provider must obtain one, "Use the NPI it obtained from the NPS to identify itself on all standard transactions," disclose it to entities that need it, and report changes to its required data within 30 days (45 CFR 162.410). An individual gets a Type 1 NPI for life; an organization (a practice, a group, a hospital, a pharmacy) gets a Type 2, and a large organization may get several for subparts. The NPI carries no meaning: no specialty, no state, no network status.
- **Taxonomy code.** The provider type and specialty from the Health Care Provider Taxonomy code set, recorded in NPPES and sent on claims. The NPI Registry returns them per record (for example `261QM1300X`, "Clinic/Center, Multi-Specialty", with a `primary` flag). Payers use taxonomy to route a claim to the right fee schedule, so a practitioner's taxonomy on the claim must match what the payer enrolled.
- **Tax ID (TIN).** The payee: claims pay the TIN, so a practitioner's enrollment is always "this NPI billing under this TIN at these locations."
- **Medicare PTAN and enrollment record.** Medicare issues its own provider transaction access number on enrollment; the enrollment links the individual to the group by reassignment, so the group can bill for the practitioner's services.
- **Medicaid and payer IDs.** State Medicaid programs and some commercial payers still assign their own provider numbers beside the NPI.
- **License, DEA and board certification.** State license numbers per state of practice, a DEA registration per state for prescribers of controlled substances, and specialty board status, each with an expiry.

The NPI Registry answers in one call:

```go tab="Go"
resp, err := http.Get("https://npiregistry.cms.hhs.gov/api/?version=2.1&number=" + npi)
if err != nil {
	return err
}
defer resp.Body.Close()
var out struct {
	ResultCount int `json:"result_count"`
	Results     []struct {
		Number          string `json:"number"`
		EnumerationType string `json:"enumeration_type"` // "NPI-1" or "NPI-2"
		Taxonomies      []struct {
			Code    string `json:"code"`
			Desc    string `json:"desc"`
			State   string `json:"state"`
			License string `json:"license"`
			Primary bool   `json:"primary"`
		} `json:"taxonomies"`
	} `json:"results"`
}
err = json.NewDecoder(resp.Body).Decode(&out)
```

```shell tab="Shell"
curl -s "https://npiregistry.cms.hhs.gov/api/?version=2.1&number=$NPI" \
  | jq '.results[0] | {number, enumeration_type, taxonomies}'
```

My rule: look up every NPI a user types against the registry before saving it, store the response as an observation with its fetch time, and re-check on a schedule, because the registry is the source and the user's typing is not ([Observations, Not Overwrites](/docs/architecture/record-linkage#observations-not-overwrites)).

## Medicare Enrollment

Medicare enrollment is its own process, separate from credentialing. CMS directs providers to "Enroll using PECOS, the online Medicare enrollment system," with paper applications as a fallback, and the Medicare Administrative Contractor for the practice's jurisdiction processes the application and "may have additional requests for information." Rules that shape software:

- **Effective dates.** A physician may bill retrospectively for services "Thirty days prior to their effective date if circumstances precluded enrollment in advance," or 90 days in a federally declared disaster, provided all program requirements were met and services were at the enrolled location (42 CFR 424.521). A practice that starts a new physician before enrollment carries that window as a hard deadline: submit within 30 days of starting, or lose the earliest services.
- **Reporting changes.** CMS requires a change of ownership, an adverse legal action or a change of practice location to be reported within 30 days, and "all other changes within 90 days."
- **Revalidation.** Providers must "resubmit and recertify the accuracy of its enrollment information every 5 years," DMEPOS suppliers every 3 years, and CMS may revalidate off cycle (42 CFR 424.515).
- **Reassignment.** A practitioner who works for a group reassigns benefits to it; leaving the group ends the reassignment, and the new group needs its own.

## Credentialing

Credentialing is the payer verifying that a practitioner is who they say they are and qualified to treat its members. Medicare Advantage rules are a concrete floor: initial credentialing requires a written application, verification of "licensure or certification from primary sources," disciplinary status, eligibility for Medicare payment and site visits as appropriate, with a signed attestation; and "Recredentialing at least every 3 years," which must consider performance indicators such as quality data, utilization, grievances and satisfaction surveys (42 CFR 422.204). An MA organization must not contract with individuals "excluded from participation under Medicare," and must check the preclusion list.

Commercial plans follow accreditation standards, most often NCQA's. NCQA separates Credentialing Accreditation, for organizations "providing full-scope credentialing services" including committee review, from Credentialing Certification, for organizations "that verify practitioner credentials." Its detailed standards (verification time limits, the recredentialing cycle) are sold, not published, so this chapter states the shape without the numbers. <!-- source-gap: ncqa-credentialing-timelines | missing | NCQA verification time limits and recredentialing cycle | closes with: NCQA Credentialing Standards and Guidelines (paid) or a payer's public provider manual quoting them | checked: 2026-10-29 -->

The steps, on the payer's side:

1. **Application.** Usually the CAQH profile plus the payer's own forms: education, training, work history with gaps explained, licenses, DEA, board certification, malpractice insurance and claims history, hospital privileges, disclosure questions, and an attestation.
2. **Primary source verification.** Licenses with the state board, education and board certification with their issuers, DEA, malpractice history from the National Practitioner Data Bank, exclusions from the OIG's LEIE (whose excluded parties cannot be paid by federal health care programs "for items or services they furnish, order, or prescribe"), state Medicaid exclusion lists and the Medicare preclusion list. ProView says its own verification draws on "licensing boards," medical schools and government registries.
3. **Committee decision.** A credentialing committee approves, denies or approves with conditions; delegated groups (a large IPA or health system) may credential on the payer's behalf under a delegation agreement and audits.
4. **Ongoing monitoring.** Sanctions, license actions and exclusions between cycles; ProView describes sanctions "flagged daily."
5. **Recredentialing.** On the cycle, with performance data.

For the practice, the visible symptom is time: weeks to months per payer, multiplied by every payer the practice takes. The workflow is a tracker of per-payer applications with follow-up dates and the documents each asked for.

## Payer Enrollment

Credentialing says the practitioner is qualified; enrollment (contracting, loading) says the payer will pay this NPI under this TIN at these locations, in these networks, from this date. The practice-side work is applying to each payer and network, signing or joining the group's contract, confirming the load, and testing with a first claim. What goes wrong:

- **Effective date gaps.** The practitioner starts before the effective date, and claims for the gap deny as out of network or as an unenrolled rendering provider.
- **Location and TIN mismatches.** The payer loaded the practitioner at one location; claims from the second location deny.
- **Taxonomy mismatches.** The claim's taxonomy isn't what the payer loaded, and the claim prices on the wrong fee schedule or denies.
- **Network partials.** In the commercial PPO, not in the exchange narrow network or the MA HMO; members of the missing network are out of network.

## Provider Directories

The directory is where members find in-network providers, and it is regulated because it has been wrong for years.

**The No Surprises Act rules.** For plan years beginning on or after January 1, 2022, plans and issuers must verify and update directory information "not less frequently than once every 90 days," remove providers they can't verify, update the online database within 2 business days of receiving information, and answer a member's question about network status "as soon as practicable and in no case later than 1 business day," keeping the response for at least 2 years (42 U.S.C. 300gg-115). A member who relied on a directory or response saying a provider was in network pays no more than in-network cost-sharing. The Departments said in August 2021 that they would write implementing regulations after January 1, 2022 and that until then plans should use "a good faith, reasonable interpretation of the statute" (ACA FAQs Part 49). Providers have a matching duty to send directory information to the plans they contract with.

**The CMS Provider Directory API.** The 2020 Interoperability and Patient Access rule required Medicare Advantage organizations, Medicaid and CHIP programs and their managed care plans to make provider directory information publicly available through a standards-based API starting January 1, 2021 (Marketplace issuers on the federal exchange were already publishing machine-readable directories). CMS-0057-F later recommended implementation guides for that existing API. The API is public and unauthenticated by design: anyone can query the payer's network.

**Directory data quality.** The data a member needs (accepting new patients, location hours, languages, telehealth) changes faster than a 90-day cycle, and every payer asks the practice separately. Hubs sell directory attestation once for many payers (CAQH's directory service is the best known), and payers buy outreach vendors to call offices. Software on the provider side can win here by sending changes the day they happen.

## How to Build It

The core `practitioners` (with NPI), `practitioner_roles` (practitioner at an organization and location with specialty, taxonomy code and `accepts_new_patients`) and `organizations` hold who works where. Credentialing and enrollment add the licenses and credentials with their verifications, an application per payer, the enrollment that results, and directory attestations. Every row carries the `organization_id` of the tenant keeping it (a practice, a credentialing service or a payer):

```sql
CREATE TABLE practitioner_licenses (     -- licenses, DEA, board certs, malpractice, each with expiry
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  practitioner_id UUID NOT NULL REFERENCES practitioners (id),
  kind            TEXT NOT NULL CHECK (kind IN ('state_license', 'dea', 'state_cds',
                    'board_certification', 'malpractice_policy', 'hospital_privileges',
                    'education', 'training')),
  issuer          TEXT NOT NULL,          -- a state board, DEA, a specialty board, an insurer
  jurisdiction    TEXT,                   -- ISO 3166-2 for licenses and DEA
  number          TEXT,
  valid_during    DATERANGE,
  document_id     UUID REFERENCES documents (id)
);

CREATE TABLE credential_verifications (  -- primary source checks, append-only
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  credential_id   UUID REFERENCES practitioner_licenses (id),
  practitioner_id UUID NOT NULL REFERENCES practitioners (id),
  source          TEXT NOT NULL CHECK (source IN ('state_board', 'dea', 'npdb', 'oig_leie',
                    'sam', 'state_medicaid_exclusions', 'medicare_preclusion', 'nppes',
                    'board', 'school', 'caqh')),
  result          TEXT NOT NULL CHECK (result IN ('verified', 'not_found', 'discrepancy',
                    'sanction', 'excluded')),
  evidence_ref    TEXT NOT NULL,          -- the stored response or screenshot
  verified_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE credentialing_applications ( -- one application to one payer, start to decision
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  practitioner_id UUID NOT NULL REFERENCES practitioners (id),
  payer_id        UUID NOT NULL REFERENCES payers (id),
  kind            TEXT NOT NULL CHECK (kind IN ('initial', 'recredential', 'add_location',
                    'add_network', 'revalidation')),
  status          TEXT NOT NULL CHECK (status IN ('preparing', 'submitted', 'in_review',
                    'info_requested', 'approved', 'denied', 'withdrawn')),
  submitted_on    DATE,
  decided_on      DATE,
  next_follow_up  DATE,                   -- the tracker's reason to exist
  payer_reference TEXT,                   -- the payer's application number
  delegated_org_id UUID REFERENCES organizations (id)  -- a delegated credentialing entity
);

CREATE TABLE payer_enrollments (         -- this NPI, under this TIN, at this location, in this network
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  practitioner_role_id UUID NOT NULL REFERENCES practitioner_roles (id),
  payer_id        UUID NOT NULL REFERENCES payers (id),
  network_id      UUID REFERENCES networks (id),
  billing_tin     TEXT NOT NULL,
  billing_npi     TEXT NOT NULL,          -- the group's Type 2 NPI when billed under the group
  taxonomy_code   TEXT NOT NULL,          -- what the payer loaded; claims must match
  payer_provider_id TEXT,                 -- PTAN, Medicaid number, payer's own ID
  status          TEXT NOT NULL CHECK (status IN ('pending', 'active', 'terminated',
                    'denied')),
  effective_during DATERANGE NOT NULL,
  retro_billing_until DATE,               -- Medicare: services from 30 days before effective
  recredential_due DATE,
  application_id  UUID REFERENCES credentialing_applications (id),
  EXCLUDE USING GIST (practitioner_role_id WITH =, payer_id WITH =,
    network_id WITH =, effective_during WITH &&) WHERE (status = 'active')
);

CREATE TABLE directory_attestations (    -- what the practice told each payer about its directory data
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  practitioner_role_id UUID NOT NULL REFERENCES practitioner_roles (id),
  payer_id        UUID NOT NULL REFERENCES payers (id),
  channel         TEXT NOT NULL CHECK (channel IN ('caqh', 'payer_portal', 'roster_file',
                    'api', 'phone', 'email')),
  payload         JSONB NOT NULL,         -- accepting new patients, hours, languages, telehealth
  attested_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ            -- when the payer confirmed the update
);
```

On the payer side, the directory itself is a view over `payer_enrollments` joined with the latest attestation and verification per role, and the 90-day clock is a computed deadline per directory entry:

```sql
-- Directory entries whose verification is due within 10 days, or overdue.
SELECT pr.id, p.npi, e.payer_id,
       MAX(a.attested_at) AS last_verified,
       MAX(a.attested_at) + INTERVAL '90 days' AS due_at
FROM payer_enrollments e
JOIN practitioner_roles pr ON pr.id = e.practitioner_role_id
JOIN practitioners p ON p.id = pr.practitioner_id
LEFT JOIN directory_attestations a
  ON a.practitioner_role_id = pr.id AND a.payer_id = e.payer_id
WHERE e.status = 'active' AND e.effective_during @> CURRENT_DATE
GROUP BY pr.id, p.npi, e.payer_id
HAVING MAX(a.attested_at) IS NULL
    OR MAX(a.attested_at) + INTERVAL '90 days' < NOW() + INTERVAL '10 days';
```

Design notes:

- **Enrollment is per role, payer, network and date.** One practitioner has many: the same NPI at two locations, in three networks of one payer, under two TINs after a group change. A claim validator checks the rendering NPI, billing TIN, location and taxonomy against an active enrollment on the date of service before the claim leaves.
- **Verifications are evidence.** Each primary source check keeps its response, because an accreditation audit asks to see the verification, not a checkbox ([What a Record Holds](/docs/architecture/audit-trails#what-a-record-holds)).
- **Deadlines are computed and stored:** license and DEA expiries, recredentialing due dates, Medicare revalidation, retro-billing windows and directory verification, each with the rule that set it ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).
- **External IDs are a crosswalk.** NPI, PTAN, Medicaid numbers, CAQH ID and each payer's provider ID map to one practitioner ([Crosswalks of External IDs](/docs/architecture/record-linkage#crosswalks-of-external-ids)).

## Auditing

- **Every verification with its evidence,** the source and the date, kept for the accreditation and contract audit cycles.
- **Committee decisions** with who decided, the conditions and the date.
- **Directory changes and member responses:** each update with its received and published time (the 2-business-day clock), each member inquiry with the written response (kept at least 2 years), and each 90-day verification.
- **Enrollment history** so a claim can be shown to have been in or out of network on its date of service.

## What This Means for the System You Build

- **Validate NPIs against NPPES** and store taxonomy, type and the fetch time as an observation.
- **Model enrollment as NPI, TIN, location, taxonomy, payer and network with an effective range,** and check claims against it before submission.
- **Track credentialing as applications per payer** with follow-up dates, because the work is mostly waiting and chasing.
- **Compute every credential expiry and revalidation date,** and the Medicare 30-day retro-billing window for new starts.
- **Send directory changes the day they happen** and keep the payer's acknowledgment; on the payer side, run the 90-day verification and 2-business-day update clocks as tracked deadlines.
- **Check exclusions and sanctions continuously,** not only at credentialing.

## References

**Regulations and statutes**

- [45 CFR 162.410: Implementation specifications, health care providers (Cornell LII)](https://www.law.cornell.edu/cfr/text/45/162.410), obtain and use the NPI, disclose it, report changes within 30 days
- [42 CFR 424.515: Revalidation (Cornell LII)](https://www.law.cornell.edu/cfr/text/42/424.515), every 5 years, DMEPOS every 3 years, off-cycle revalidation
- [42 CFR 424.521: Retrospective billing (Cornell LII)](https://www.law.cornell.edu/cfr/text/42/424.521), 30 days before the effective date, 90 days in a disaster
- [42 CFR 422.204: Provider selection and credentialing (Cornell LII)](https://www.law.cornell.edu/cfr/text/42/422.204), MA initial credentialing, recredentialing at least every 3 years, exclusion and preclusion checks
- [42 U.S.C. 300gg-115: Provider directory information (Cornell LII)](https://www.law.cornell.edu/uscode/text/42/300gg-115), 90-day verification, 2-business-day updates, 1-business-day responses
- [DOL: FAQs about ACA and CAA implementation Part 49](https://www.dol.gov/sites/dolgov/files/EBSA/about-ebsa/our-activities/resource-center/faqs/aca-part-49.pdf), directory provisions applicable from 2022 plan years, good faith interpretation pending rulemaking (August 2021)

**Agencies**

- [CMS: Medicare enrollment for providers and suppliers](https://www.cms.gov/medicare/enrollment-renewal/providers-suppliers), PECOS, MAC processing, 30-day and 90-day change reporting
- [NPPES NPI Registry API](https://npiregistry.cms.hhs.gov/api/?version=2.1&organization_name=mayo%20clinic&state=MN&limit=1), the version 2.1 response shape with enumeration type and taxonomies
- [HHS OIG: Exclusions](https://oig.hhs.gov/exclusions/), the LEIE, the effect of exclusion, the CSV and monthly supplements
- [CMS: Interoperability and Patient Access fact sheet](https://www.cms.gov/newsroom/fact-sheets/interoperability-and-patient-access-fact-sheet), the Provider Directory API from January 1, 2021
- [CMS: Interoperability and Prior Authorization final rule fact sheet (CMS-0057-F)](https://www.cms.gov/newsroom/fact-sheets/cms-interoperability-and-prior-authorization-final-rule-cms-0057-f), implementation guides recommended for the existing Provider Directory API

**In practice**

- [DataSpring (CAQH)](https://www.dataspring.com/), the 2026 rebrand, 86% of physicians, 7.4M+ provider records, about 1,000 health plans and entities
- [DataSpring: Credentialing](https://www.dataspring.com/solutions/provider-data/credentialing), enter once and share with designated plans, primary source verification, sanctions flagged daily
- [NCQA: Credentialing](https://www.ncqa.org/programs/health-plans/credentialing/), Credentialing Accreditation versus Certification
