+++
title = "Certifications & Procurement Assurance"
nav_title = "Certifications & Assurance"
description = "SOC 2, the ISO family, FedRAMP and government clouds, CJIS, HIPAA BAAs, IRAP and C5, and the trust centers and questionnaires a workplace vendor answers."
category = "Workplace & Collaboration Industry"
order = 2051
part = "Security and Compliance"
tags = ["compliance", "soc-2", "fedramp", "hipaa", "procurement", "iso-27001"]
+++

No large employer buys a chat tool, a wiki or a meeting product on a demo. Before the contract is signed, the buyer's security team asks for a SOC 2 report, ISO certificates, a completed questionnaire, a data processing addendum and, depending on who the buyer is, a FedRAMP authorization, a HIPAA business associate agreement, a CJIS addendum or an Australian IRAP assessment. The vendor can't let every customer's auditor into its systems, so it buys audits once and hands the results to every buyer, usually through a trust center behind an NDA. Procurement assurance is that machinery: which programs a workplace vendor carries, what each one actually covers, and how a buyer reads them.

It's hard for three reasons. Every program certifies a **scope** (named products, named environments, a named period), and the scope rarely matches what the buyer will deploy: a FedRAMP authorization covers a separate government environment, not the commercial product the sales team demoed; a HIPAA agreement covers messages and files but not the third-party apps installed beside them. Government and regulated buyers often need a **different cloud**, with different staff, features and prices, not a different contract. And the thesis of this volume shows up in the reports themselves: every report lists controls the customer must run, and most of them are settings in the customer's admin console. The vendor proves the platform; the customer's admin decides whether the deployment stays inside what was proven.

This chapter covers the programs as a workplace vendor holds them and a workplace buyer reads them. The infrastructure side (the shared responsibility model, SOC 2 and ISO 27001 for a cloud provider, FedRAMP 20x and GovRAMP, sovereign clouds) is the Hosting & Cloud volume's [Shared Responsibility & Compliance Programs](/books/hosting-and-cloud/compliance-programs); the frameworks as engineering disciplines are the playbook's [SOC 2](/docs/compliance/soc-2), [HIPAA](/docs/compliance/hipaa) and [GDPR](/docs/compliance/gdpr). Data residency is [Data Residency & Sovereignty](/books/workplace-and-collaboration/data-residency-and-sovereignty), and the procurement process around these documents (security reviews, DPAs, MSAs) is [From Self-Serve to Enterprise](/books/workplace-and-collaboration/selling-to-enterprises). Financial-services recordkeeping is [Regulated Communications & Archiving](/books/workplace-and-collaboration/regulated-communications). Program status is as of October 2026.

## How the Platforms Do It

What five large workplace vendors list on their own compliance pages, as of October 2026:

| Vendor | SOC and ISO | AI management | US government | HIPAA | International programs |
| --- | --- | --- | --- | --- | --- |
| **Microsoft 365** | SOC 2, ISO 27001 and others on the Service Trust Portal | ISO/IEC 42001 for Microsoft Copilot, Copilot Chat, Copilot Studio, Security Copilot, GitHub Copilot and others | GCC at FedRAMP High; GCC High assessed at FIPS 199 High for ITAR and CUI; DoD at SRG Impact Level 5, DoD entities only | BAA in the Data Protection Addendum by default; in-scope services include Teams, Exchange Online, SharePoint and Microsoft Copilot | IRAP at PROTECTED; a Microsoft 365 C5 Type 2 report; CJIS agreements in 47 states and DC |
| **Google Workspace** | SOC and ISO reports | Not on the pages opened | FedRAMP High and DoD IL4 for Enterprise Plus, Frontline Plus, Business Continuity and Business Continuity Plus editions, not every service within them | BAA accepted electronically in the Admin console; covers listed "Included Functionality" only | Not on the pages opened |
| **Slack** | ISO 27001, 27017, 27018, 27701; SOC 2 Type II and SOC 3; CSA STAR | ISO/IEC 42001 | FedRAMP Moderate (Enterprise or Enterprise+ with an add-on); GovSlack FedRAMP JAB High, pursuing DoD IL4 | Enterprise plans with a BAA and a configuration guide | IRAP, C5, ISMAP (Japan), ENS High (Spain), TISAX, Korea CSP assessment |
| **Atlassian** | Listed in its Compliance Resource Center | Not on the pages opened | Atlassian Government Cloud for Jira, Confluence and Jira Service Management at FedRAMP Moderate (since March 17, 2025) and TX-RAMP, working toward GovRAMP | Standard, Premium or Enterprise plans with a BAA; the page names Jira, Confluence, Jira Service Management, Rovo and Jira Product Discovery as the relevant products | Not on the pages opened |
| **Zoom** | SOC 2 Type 2 (and a SOC 2 + HITRUST report); ISO 27001, 27017, 27018, 27701; CSA STAR Level 2 | Not listed | Zoom for Government at FedRAMP Moderate (a JAB authorization since July 28, 2023), GovRAMP, DoD IL4, TX-RAMP and CJIS | HIPAA guidance among its regulatory resources | IRAP, BSI C5, ENS, ISMAP and others |

Four patterns run through the table:

- **The baseline is the same everywhere.** SOC 2 Type 2 and ISO 27001 with its cloud and privacy extensions are table stakes; a buyer who doesn't receive them stops. The differences are above the baseline.
- **Government means another environment.** Microsoft's GCC, GCC High and DoD, Slack's GovSlack, Atlassian Government Cloud and Google's eligible editions are separate scopes with their own eligibility, staff screening and feature lists. A commercial tenant doesn't become FedRAMP authorized by contract.
- **HIPAA is a contract and a configuration, not a certificate.** Every vendor offers a BAA, every BAA names the features it covers, and every vendor's guide tells the customer's admin what to switch off.
- **AI got its own management standard.** ISO/IEC 42001 appears on Microsoft's and Slack's lists within two years of publication, which is how buyers now ask about assistants ([AI Assistants Over Company Data](/books/workplace-and-collaboration/ai-assistants) covers the products).

## What a Buyer Asks For

A security review of a workplace vendor collects a packet, and the packet is the same shape across vendors:

- **A SOC 2 Type 2 report** for the period that overlaps the buyer's own audit year, with a bridge letter for the gap since the period ended. The buyer reads the system description first (which products and environments are in scope), then the exceptions, then the complementary user entity controls the playbook describes in [What Auditors Test](/docs/compliance/soc-2#what-auditors-test). SOC 3 is the public summary; it says the audit happened and nothing a security reviewer can test against. Slack lists both, plus separate SOC 2 and SOC 3 reports for GovSlack, which tells the buyer that the government environment is a separate system description.
- **ISO certificates with their scope statements.** ISO/IEC 27001 is the management system; 27017 adds cloud controls, 27018 protects personal data in public clouds and 27701 is the privacy management system ([SOC 2 and ISO 27001](/docs/compliance/soc-2#soc-2-and-iso-27001) for how the two families relate). The certificate names the scope; a certificate for "the platform" that leaves out the product being bought is common and easy to miss.
- **A questionnaire** in a standard format or the buyer's own, answered from the vendor's library (below).
- **Contracts that carry the controls:** the data processing addendum ([Controllers, Processors and the DPA](/docs/compliance/gdpr#controllers-processors-and-the-dpa)), a BAA where health data is in scope, the subprocessor list, and for government buyers the program's own addenda.
- **Program-specific evidence** where the buyer is regulated: a FedRAMP package, a CJIS addendum, an IRAP report, a C5 report.

The inversion is visible in what the buyer does with the packet. A provider's report says how the vendor runs the service; the buyer's own auditor then asks how the buyer ran its tenant: whether SSO was enforced, whether external sharing was restricted, whether retention was set, whether admin roles were reviewed. Those are the complementary controls, and in a workplace product nearly all of them are admin console settings. A vendor that publishes them as a checklist mapped to its admin settings, and better still as a report the customer's admin can run, turns its SOC 2 into something the customer can use.

## The ISO Family, Now Including Privacy and AI

Two editions changed the family's shape recently:

- **ISO/IEC 27701:2025** was published on October 14, 2025 as a standalone privacy information management system standard. The 2019 edition was an extension of 27001, so a privacy certificate required a security certificate underneath it; the 2025 edition can be certified on its own. As of October 2026 the accreditation bodies hadn't fixed the transition period for holders of the 2019 certificate. Slack and Zoom both list 27701.
- **ISO/IEC 42001:2023** specifies an AI management system: policies, objectives and processes for the responsible development, provision or use of AI systems, audited like any management system. Microsoft lists Microsoft Copilot, Copilot Chat, Copilot Studio, Copilot Health, Security Copilot, GitHub Copilot, Foundry and Dragon Copilot in scope and says a customer can use the certification in its own 42001 assessment while engaging its own assessor for its own controls. Slack lists 42001 alongside its security certifications.

A 42001 certificate answers whether the vendor manages AI risk as a process; it says nothing about whether a given assistant can reach data a user shouldn't see. That question is permission-trimmed retrieval, which is a product property tested in [AI Assistants Over Company Data](/books/workplace-and-collaboration/ai-assistants), not a certificate. A buyer who accepts the certificate as the answer to oversharing has answered the wrong question.

## Government Clouds

FedRAMP itself, Rev5 and the 20x classes, is the Hosting & Cloud volume's [FedRAMP 20x and GovRAMP](/books/hosting-and-cloud/compliance-programs#fedramp-20x-and-govramp), including the June 11, 2027 date after which FedRAMP stops accepting new Rev5 certifications. What a workplace vendor adds is that its government offering is a separate deployment of the product, and the separation shows up as eligibility, screening, federation limits and missing features.

**Microsoft's ladder** is the most explicit, from its service descriptions:

| Environment | Who may buy | Assessment | Notable differences |
| --- | --- | --- | --- |
| **GCC** | US federal, state, local and tribal governments and contractors holding or processing data for them, after a validation process | FedRAMP High; CJIS in states with agreements | Support under worldwide terms, "including no support agent physical location or citizenship assurances"; Viva Engage outside the FedRAMP boundary |
| **GCC High** | Validated organizations, including the Defense Industrial Base and contractors handling CUI or ITAR data | NIST SP 800-53 at FIPS 199 High; can demonstrate equivalency to IL4 or "necessary inheritance for CMMC" | Users can share only with other GCC High organizations; phone and audio conferencing through Direct Routing; Viva Engage not available; no trials |
| **DoD** | Department of Defense entities only | DoD Cloud Computing SRG Impact Level 5 | Staff with elevated access must pass DoD IT-2 adjudication |

Staff with temporary access to customer content in GCC, GCC High or DoD must have passed screening that includes US citizenship, a seven-year employment and criminal history check, fingerprinting and checks against the Treasury, Commerce and State Department restricted lists; GCC adds state-adjudicated CJIS screening. None of the three environments' support channels is inside the accreditation boundary, and Microsoft tells customers not to share controlled data with support until they've confirmed the agent is authorized. That is the [support access](/docs/security/support-access#delegation-not-impersonation) problem with a federal answer: the vendor's people are part of the scope, so the vendor screens and limits them, and the customer is told where the boundary ends.

**The others** follow the same shape with fewer tiers. GovSlack is Slack's separate government environment, listed as FedRAMP JAB High authorized and pursuing DoD IL4, with its own SOC reports; commercial Slack is FedRAMP Moderate for Enterprise or Enterprise+ customers who buy a FedRAMP support add-on and follow a Secure Configuration Guide. Zoom for Government was first FedRAMP authorized in March 2019 and received a JAB Moderate provisional authorization on July 28, 2023. Atlassian Government Cloud announced its FedRAMP Moderate authorization on March 17, 2025, with FedRAMP High and IL5 environments on its roadmap rather than authorized. It serves Jira, Confluence and Jira Service Management to US government agencies and organizations doing government work, with user tiers starting at 201 for Jira and Confluence and 26 agents for Jira Service Management; its page says commercial Atlassian Cloud apps aren't FedRAMP Moderate compliant, Marketplace apps aren't authorized (so customers may need their own assessment), only Atlassian and certified partners can install apps, and "some platform capabilities are not yet available." Google's FedRAMP High and IL4 scope is a set of editions rather than a separate cloud, and Google's scope page warns that "not all services that are available within these editions are FedRAMP or IL authorized."

Three consequences for the product:

- **Federation is bounded by the environment.** GCC High users share only with GCC High; Teams' external access to unmanaged consumer accounts isn't available in GCC, GCC High or DoD at all. Cross-organization features ([Guests & Cross-Org Collaboration](/books/workplace-and-collaboration/guests-and-external-collaboration)) have to know which environment each side is in.
- **Features lag, and the lag is published.** Every government offering lists what it lacks, and AI features are usually the last to arrive. A roadmap that ships to commercial first has to track, per feature, which environments it has reached.
- **Apps break the boundary.** An authorized environment with unauthorized apps installed is only as authorized as the weakest app; Atlassian's rule that only it and certified partners install apps is the strict answer, and app review ([Apps & Marketplaces](/books/workplace-and-collaboration/apps-and-marketplaces)) is the general one.

## Programs Without a Certificate

Several of the programs buyers ask about have no certificate to hand over. The vendor's answer is a contract, an agreement with an authority, or an assessment report the buyer relies on.

**CJIS.** The FBI's CJIS Security Policy governs criminal justice information in the cloud, and "the FBI doesn't offer certification" of compliance. Instead every private contractor that processes CJI signs the CJIS Security Addendum (Appendix H of the policy), and a vendor signs information agreements state by state with each state's CJIS Systems Agency; Microsoft lists agreements covering criminal justice agencies in 47 states and the District of Columbia, as of August 24, 2026. Version 6.1 of the policy took effect June 25, 2026; since 6.0 it is organized around NIST SP 800-53 Revision 5 control families, requires MFA at Authenticator Assurance Level 2, and requires CJI to be stored and processed within the United States. Zoom lists CJIS among Zoom for Government's programs. For a vendor, CJIS is fifty separate relationships, not one audit.

**HIPAA.** HHS approves no certification standard for HIPAA compliance by a business associate, as Microsoft's page says and the playbook's [There Is No HIPAA Certification](/docs/compliance/hipaa#there-is-no-hipaa-certification) explains. The vendor's commitment is the [business associate agreement](/docs/compliance/hipaa#the-business-associate-agreement), and its evidence is ISO 27001, SOC 2 and, for some, HITRUST (Microsoft's BAA-covered services are audited for both ISO 27001 and HITRUST CSF; Zoom lists a SOC 2 + HITRUST report). HHS's own cloud guidance closes the obvious escape routes: a cloud provider that stores ePHI is a business associate "even if the CSP processes or stores only encrypted ePHI and lacks an encryption key," the conduit exception covers transmission-only services and not storage, using a cloud service to hold ePHI without a BAA puts the customer in violation, and OCR "does not endorse, certify, or recommend specific technology or products." The next section is how the agreement scopes the product; what a BAA must say and how it chains to subcontractors is the Health Tech volume's [What a BAA Must Say](/books/health-tech/vendor-compliance-posture#what-a-baa-must-say).

**ITAR and CUI.** Neither has a certificate; a contractor handling export-controlled or controlled unclassified data needs an environment whose people and data stay inside US boundaries. That is why GCC High exists as a separate environment with US-citizen screening, and why it sells to contractors as well as agencies.

## HIPAA Agreements Are Scoped to Features

Every workplace vendor that signs a BAA limits it to parts of the product, and the limits are the customer's admin's job to enforce:

| Vendor | Who can sign | What's covered | What the customer must do |
| --- | --- | --- | --- |
| **Slack** | Enterprise plans | PHI only in messages, files, file names and names of private channels or DMs | Agree to the Slack Guide for HIPAA Entities; don't use Slack to talk with patients, plan members or their families; monitor with Slack DLP or the Discovery API with an external DLP provider; assess every third-party app separately (Slack has no BAA with them); Email-to-Slack isn't available |
| **Google Workspace** | Admins accept the BAA in the Admin console | The services on the HIPAA Included Functionality list, including covered Gemini features in Gmail | Don't put PHI in "Additional Google Services" or third-party apps, which the BAA doesn't cover |
| **Microsoft 365** | Available by default through the Data Protection Addendum to covered entities and business associates | Listed in-scope services, including Teams, Exchange Online, SharePoint, OneDrive, Microsoft Copilot and Copilot Chat | Run its own compliance program; Microsoft can't sign the customer's own BAA form |
| **Atlassian** | Standard, Premium or Enterprise plans | Jira, Confluence, Jira Service Management, Rovo and Jira Product Discovery | Read and follow the HIPAA usage guide before entering PHI |

Two rules follow for anyone building a workplace product that health customers will buy:

- **Covered features are data.** Which features may hold PHI (messages yes, channel topics no; files yes, a canvas maybe) is a list the product must know, so it can block or warn when a HIPAA-flagged workspace turns on something outside it. Slack's rule that PHI may appear in the names of private channels but not in other features is exactly that kind of list.
- **Apps are outside by default.** No vendor's BAA covers the marketplace. A HIPAA workspace needs an app policy that requires the admin to attest to a separate agreement before an app that can read messages is installed.

## International Programs

The national programs a workplace vendor meets most often, from Microsoft's descriptions and the vendors' lists:

- **IRAP (Australia).** The Australian Cyber Security Centre endorses individual assessors, who assess a system against the Australian Government Information Security Manual. There's no longer a government list of certified services: the Certified Cloud Services List ended in 2020, and assessments since then follow the ACSC's cloud security guidance, with each agency making its own authorization decision. Microsoft's assessment covers services up to PROTECTED; Slack and Zoom both list IRAP, Slack with the report available through its account team. New Zealand agencies also use IRAP assessments.
- **C5 (Germany).** The BSI created the Cloud Computing Compliance Criteria Catalogue in 2016 and revised it as C5:2020: 114 requirements in 17 domains, built on ISO/IEC 27001, the CSA Cloud Controls Matrix and IT-Grundschutz. Its distinctive demand is disclosure: the system description must state jurisdiction and data processing locations and the provider's disclosure obligations to public authorities. A C5 audit can be combined with a SOC 2 audit to reuse overlapping work, and Microsoft publishes a combined SOC 2, C5 and CSA STAR report alongside a Microsoft 365 C5 Type 2 report.
- **ISMAP, ENS and TISAX.** Slack lists registration in Japan's ISMAP, Spain's ENS at High and a TISAX assessment for automotive buyers, whose results it says are "not intended for the general public."

The pattern is the same as FedRAMP's: each national program reuses ISO and SOC work and adds a jurisdictional question (who can compel the data, where staff sit, which country's assessor signed). Where the buyer's question is really sovereignty, the answer moves to [Data Residency & Sovereignty](/books/workplace-and-collaboration/data-residency-and-sovereignty) and the Hosting & Cloud volume's [Sovereign Cloud](/books/hosting-and-cloud/compliance-programs#sovereign-cloud).

## Trust Centers and Questionnaires

The documents above reach buyers through two channels.

**Trust centers.** A trust center is a page where a vendor publishes its certifications, policies, subprocessors and status, and gates the sensitive documents (SOC 2 reports, pen test summaries) behind a request and an NDA. Microsoft runs its own Service Trust Portal with ISO, SOC, C5 and IRAP reports and the HIPAA BAA; Slack offers IRAP and C5 reports through the account team; Atlassian runs a Compliance Resource Center. Many smaller vendors buy the page: Drata announced its acquisition of SafeBase, a trust center platform that also automates inbound security reviews, on February 11, 2025, which folded trust centers into compliance automation suites.

**Questionnaires.** Buyers still send questionnaires, in standard formats or their own. The Cloud Security Alliance's CAIQ is a questionnaire mapped to its Cloud Controls Matrix (version 4.1 is the current one as of October 2026), and it's what a provider submits to list itself in the CSA STAR Registry, where Slack is listed. The Shared Assessments SIG is the other common standard format, and Zoom lists both among its assessments. A vendor answers hundreds of these a year, so the work is a library: one approved answer per control, each with an owner, an evidence link (a report section, a policy, a configuration) and a review date, from which each questionnaire is assembled and reviewed rather than written.

Three rules make the library honest:

- **Answers cite scope.** "Yes, data is encrypted at rest" is true for the commercial product and needs a different evidence link for GovSlack or a government cloud. An answer without a scope is how a vendor promises a buyer something only another environment does.
- **Answers expire with their evidence.** When a SOC 2 period ends or a certificate lapses, every answer that cites it is due for review.
- **Contractual answers are contracts.** A questionnaire attached to an order form is a representation. The library tracks which customers received which version of which answer, so a later change can be checked against what was promised.

## How to Build It

The vendor side of assurance is bookkeeping of scope: which program covers which product in which environment for which period, which features a contract covers, and who saw which document. It adds four tables to the core data model in [The Workplace Software Business](/books/workplace-and-collaboration/workplace-business#the-core-data-model) and two columns on `workspaces`. The Hosting & Cloud volume's `compliance_attestations` is the same idea for a provider's regions; this book names its tables `assurance_*` to keep the two models distinct.

```sql
ALTER TABLE workspaces
  ADD COLUMN cloud_environment  TEXT NOT NULL DEFAULT 'commercial' CHECK (cloud_environment IN
                                  ('commercial', 'gov_moderate', 'gov_high', 'gov_dod')),
  ADD COLUMN compliance_profile TEXT[] NOT NULL DEFAULT '{}';  -- 'hipaa', 'fedramp', 'cjis', 'finra'

CREATE TABLE assurance_attestations (    -- a report, certificate, authorization or agreement the vendor holds
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  program        TEXT NOT NULL CHECK (program IN ('soc2_type2', 'soc3', 'iso_27001', 'iso_27017',
                   'iso_27018', 'iso_27701', 'iso_42001', 'csa_star', 'fedramp', 'govramp', 'dod_il',
                   'cjis_state_agreement', 'irap', 'c5', 'national_scheme', 'hitrust')),
  program_detail TEXT,                   -- 'Moderate', 'IL4', 'PROTECTED', 'C5:2020 Type 2', 'US-TX'
  issuer         TEXT NOT NULL,          -- CPA firm, certification body, agency, state CSA, assessor
  period         DATERANGE NOT NULL,     -- audit period, or certificate validity
  document_ref   TEXT,                   -- the file in the trust center
  access         TEXT NOT NULL CHECK (access IN ('public', 'nda', 'account_team')),
  supersedes_id  UUID REFERENCES assurance_attestations (id),
  status         TEXT NOT NULL CHECK (status IN ('in_force', 'expired', 'superseded', 'withdrawn',
                   'in_progress'))
);

CREATE TABLE assurance_scopes (          -- what an attestation covers, down to the feature
  attestation_id    UUID NOT NULL REFERENCES assurance_attestations (id),
  product           TEXT NOT NULL,       -- 'chat', 'wiki', 'meetings', 'ai_assistant'
  feature           TEXT NOT NULL DEFAULT '*',
  cloud_environment TEXT NOT NULL,       -- matches workspaces.cloud_environment
  customer_controls TEXT[] NOT NULL DEFAULT '{}',  -- complementary control ids, mapped to admin settings
  PRIMARY KEY (attestation_id, product, feature, cloud_environment)
);

CREATE TABLE assurance_agreements (      -- a BAA, CJIS addendum or similar signed with one customer
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  kind             TEXT NOT NULL CHECK (kind IN ('baa', 'cjis_addendum', 'dpa', 'program_addendum')),
  version          TEXT NOT NULL,        -- the template version accepted
  accepted_by      UUID REFERENCES accounts (id),  -- for click-through acceptance in the admin console
  accepted_at      TIMESTAMPTZ NOT NULL,
  covered_features TEXT[] NOT NULL,      -- 'chat.messages', 'chat.files', 'chat.private_channel_names'
  terminated_at    TIMESTAMPTZ
);

CREATE TABLE trust_document_requests (   -- who received which gated document, under which NDA
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  attestation_id  UUID NOT NULL REFERENCES assurance_attestations (id),
  requester_email TEXT NOT NULL,
  organization_id UUID REFERENCES organizations (id),  -- null for a prospect not yet a customer
  nda_ref         TEXT,
  status          TEXT NOT NULL CHECK (status IN ('requested', 'approved', 'denied', 'downloaded')),
  decided_by      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

The check that matters at runtime is whether turning a feature on keeps a workspace inside what its contracts and attestations cover:

```sql
-- Features enabled in a HIPAA workspace that its BAA doesn't cover
-- $2: the vendor's list of features that may hold PHI ('chat.files', 'huddles.recording')
SELECT p.setting_key AS feature
FROM admin_policies p                -- feature switches per scope (Admin Consoles & Policies)
JOIN workspaces w ON w.organization_id = p.organization_id
LEFT JOIN assurance_agreements a
  ON a.organization_id = w.organization_id AND a.kind = 'baa' AND a.terminated_at IS NULL
WHERE w.id = $1
  AND p.scope_type = 'workspace' AND p.scope_id = w.id
  AND p.value = 'true'::jsonb
  AND 'hipaa' = ANY (w.compliance_profile)
  AND p.setting_key = ANY ($2)
  AND (a.id IS NULL OR NOT p.setting_key = ANY (a.covered_features));
```

Notes on the sketch:

- **The environment is a workspace fact.** `cloud_environment` is set at creation and never edited in place; moving a customer from commercial to a government environment is a migration ([Migrations, Imports & Switching](/books/workplace-and-collaboration/migrations-and-switching)), because staff, regions and features differ.
- **Scope goes to the feature.** A wildcard row says the whole product is in scope; feature rows record the exceptions, so a sales answer, the trust center and the admin console all read one source. A feature that ships to `commercial` first has no `gov_high` row until it's assessed.
- **Customer controls point at settings.** Each complementary control id maps to an admin setting or report, so the admin console can show the customer which of their own controls are met.
- **Agreements constrain the console.** When a HIPAA workspace turns on a feature outside `covered_features`, or installs an app that can read messages, the console blocks or asks for an attestation; the decision is an `audit_events` row.
- **Events:** `attestation.issued`, `attestation.expiring` (to schedule a bridge letter and review every questionnaire answer that cites it), `assurance_scope.changed` and `agreement.accepted` go to the trust center, sales and customer notices.

## Auditing

- **Every attestation with its scope history,** so coverage of any product, feature and environment on any date can be shown, and bridge letters issued for every period gap.
- **Every gated document released,** to whom, under which NDA, approved by whom ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)); a SOC 2 report describes the vendor's controls in detail and is itself sensitive.
- **Every agreement accepted,** the template version, who clicked accept for the customer and when, and the features it covered at the time.
- **Configuration drift against the agreement:** features or apps enabled in a regulated workspace outside what its agreement covers, and how the console responded.
- **Questionnaire answers as sent:** which version of which answer went to which customer, with the evidence it cited.
- **Staff access to government environments,** by screened personnel only, with the reason for each session.

## What This Means for the System You Build

- **Get SOC 2 Type 2 and ISO 27001 with 27017 and 27018 before the first enterprise deal,** and publish the system description's scope plainly; buyers read scope before anything else.
- **Map every complementary control to an admin setting** and let the customer's admin see which of their own controls are met.
- **Treat a government offering as a separate environment** with its own staff, regions, feature list and app rules, and track per feature which environments it has reached.
- **Model HIPAA as covered features,** block or warn when a regulated workspace leaves them, and keep apps outside the agreement by default.
- **Plan CJIS as state relationships** and ITAR or CUI as an environment, not as audits.
- **Run questionnaires from a library** of scoped, evidence-linked, expiring answers, and record what each customer was told.
- **Expect ISO/IEC 42001 questions about AI,** and answer oversharing with how retrieval is permission-trimmed, not with the certificate.

## References

**Vendor documentation**

- [Microsoft Learn: Office 365 GCC](https://learn.microsoft.com/en-us/office365/servicedescriptions/office-365-platform-service-description/office-365-us-government/gcc), eligibility, FedRAMP High, personnel screening including CJIS, support outside the boundary without citizenship assurances, Viva Engage outside FedRAMP
- [Microsoft Learn: Office 365 GCC High and DoD](https://learn.microsoft.com/en-us/office365/servicedescriptions/office-365-platform-service-description/office-365-us-government/gcc-high-and-dod), eligibility and validation, FIPS 199 High, IL5 for DoD entities only, IL4 equivalency and CMMC inheritance, screening, sharing only with GCC High, Direct Routing, Viva Engage unavailable, support outside the boundary
- [Microsoft Learn: CJIS Security Policy](https://learn.microsoft.com/en-us/compliance/regulatory/offering-cjis), no FBI certification, the Security Addendum, state agreements in 47 states and DC as of August 24, 2026, version 6.1 effective June 25, 2026, AAL2 MFA and US storage
- [Microsoft Learn: ISO/IEC 42001](https://learn.microsoft.com/en-us/compliance/regulatory/offering-iso-42001), what the standard specifies, Microsoft services in scope and using the certification in a customer's own assessment
- [Microsoft Learn: HIPAA and HITECH](https://learn.microsoft.com/en-us/compliance/regulatory/offering-hipaa-hitech), the BAA through the Data Protection Addendum by default, in-scope services, ISO 27001 and HITRUST audits, no HHS-approved certification
- [Microsoft Learn: IRAP](https://learn.microsoft.com/en-us/compliance/regulatory/offering-irap-australia), endorsed assessors, the ISM, PROTECTED, the end of the Certified Cloud Services List and New Zealand use
- [Microsoft Learn: C5](https://learn.microsoft.com/en-us/compliance/regulatory/offering-c5-germany), the BSI catalog's history, 114 requirements in 17 domains, disclosure of jurisdiction, combination with SOC 2 and the Microsoft 365 C5 Type 2 report
- [Microsoft Learn: Manage external meetings and chat](https://learn.microsoft.com/en-us/microsoftteams/trusted-organizations-external-meetings-chat), unmanaged Teams accounts unavailable in GCC, GCC High and DoD
- [Google Cloud: FedRAMP and DoD compliance scope](https://docs.cloud.google.com/architecture/security/fedramp-dod-compliance-scope), the Workspace editions for FedRAMP High and IL4 and that not every service in them is authorized
- [Google Workspace: HIPAA compliance with Google Workspace and Cloud Identity](https://knowledge.workspace.google.com/admin/compliance/hipaa-compliance-with-google-workspace-and-cloud-identity), electronic BAA acceptance, Included Functionality, Additional Services and third-party apps not covered
- [Slack: Compliance certifications and regulations](https://slack.com/trust/compliance), ISO, SOC, CSA STAR, ISO 42001, FedRAMP Moderate and its plan requirements, GovSlack, IRAP, C5, ISMAP, ENS, TISAX and FINRA 17a-4 configurability
- [Slack: Slack and HIPAA](https://slack.com/help/articles/360020685594-Slack-and-HIPAA), Enterprise plans, where PHI may appear, the guide, DLP monitoring, third-party apps and Email-to-Slack
- [Atlassian: Government Cloud](https://www.atlassian.com/licensing/government-cloud), products, FedRAMP Moderate and TX-RAMP, GovRAMP in progress, user tier minimums, eligibility and app limits
- [Atlassian: Atlassian achieves FedRAMP Moderate authorization for Atlassian Government Cloud (March 17, 2025)](https://investors.atlassian.com/news/news-details/2025/Atlassian-Achieves-FedRAMPR-Moderate-Authorization-for-Atlassian-Government-Cloud/default.aspx), the authorization date and products
- [Atlassian: Atlassian Government Cloud](https://www.atlassian.com/blog/company-news/atlassiangovernmentcloud), FedRAMP High and IL5 on the roadmap, not yet authorized
- [Atlassian: HIPAA compliance](https://www.atlassian.com/trust/compliance/resources/hipaa), the plans, the BAA, the relevant products and the usage guide
- [Atlassian: Compliance Resource Center](https://www.atlassian.com/trust/compliance/resources), the resource center as Atlassian's channel for compliance documents
- [Zoom: Compliance](https://www.zoom.com/en/trust/legal-compliance/), Zoom's SOC, ISO, CSA STAR, IRAP, C5, ENS, ISMAP and TX-RAMP listings, Zoom for Government's FedRAMP Moderate, GovRAMP, DoD IL4 and CJIS, HIPAA guidance, and SIG and CAIQ among its assessments
- [Zoom: Zoom for Government achieves JAB authorization (August 3, 2023)](https://news.zoom.com/zoom-for-government-achieves-jab-authorization/), the initial FedRAMP authorization in March 2019 and the JAB Moderate P-ATO on July 28, 2023

**Standards and programs**

- [DNV: Revision of ISO/IEC 27701](https://www.dnv.com/assurance/Management-Systems/new-iso/transition/revision-of-iso-iec-27701/), publication on October 14, 2025, standalone status and the pending transition timeline
- [FedRAMP: 20x](https://www.fedramp.gov/20x/), the classes, certification terminology and the June 11, 2027 Rev5 date
- [Cloud Security Alliance: STAR Level 1 questionnaire (CAIQ)](https://cloudsecurityalliance.org/artifacts/star-level-1-security-questionnaire-caiq-v4), CAIQ v4.1 as the current version and its use for STAR Registry submission
- [Shared Assessments: SIG](https://sharedassessments.org/sig/), the questionnaire's existence and publisher

**Law and regulation**

- [HHS: Guidance on HIPAA and cloud computing](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html), cloud providers as business associates even without the key, the conduit exception, no BAA as a violation and no OCR certification

**In practice**

- [Drata: Drata to acquire SafeBase](https://drata.com/about/news/drata-to-acquire-safe-base-accelerating-trust-management-within-enterprise-governance-risk-and-compliance), February 11, 2025, SafeBase's trust center and security review automation
