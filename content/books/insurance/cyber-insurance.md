+++
title = "Cyber Insurance"
description = "The cyber market in NAIC figures, coverages, war and state-backed attack exclusions, ransomware and OFAC, response panels, and scan-driven underwriting."
category = "Insurance Industry"
order = 2749
part = "Commercial and Specialty Lines"
tags = ["insurance", "cyber-insurance", "ransomware", "underwriting", "exclusions", "commercial-lines"]
+++

Cyber insurance pays for what an attack or a data breach costs a business: the forensic investigators and lawyers in the first days, notifying affected people, restoring systems and data, the income lost while systems are down, an extortion payment if one is made, and the claims and regulatory actions that follow. It is the youngest major commercial line and the one whose underwriting looks most like software: insurers scan an applicant's internet-facing systems before quoting, ask about specific controls (multi-factor authentication, backups, endpoint detection), sell security services alongside the policy, and run incident response through panels of vendors they've vetted. It is also the line where the insurer fears accumulation most, because one vulnerability or one state actor can hit thousands of insureds at once, which is why the war and state-backed attack exclusions were rewritten between 2021 and 2023.

This chapter covers the market from the NAIC's data, the coverages, the exclusions, ransomware and the sanctions rules on paying it, incident response panels, and underwriting by scan and questionnaire. It extends `submissions` from [Underwriting Rules, Referrals & Models](/books/insurance/underwriting) with `security_assessments`, and claims from [The Core Data Model](/books/insurance/insurance-business#the-core-data-model) with incident records. Data security rules that apply to insurers themselves (the NAIC Insurance Data Security Model Law, New York's Part 500) are in [Data, AI & Privacy Rules](/books/insurance/data-ai-and-privacy-rules) in the Regulation part; this chapter is about insuring other people's cyber risk.

## How the Platforms Do It

As of November 2026, from the companies' public pages:

| Company | Model | What it says publicly |
| --- | --- | --- |
| **At-Bay** | MGA with security services ("InsurSec") | More than 40,000 policyholders; vulnerability scanning, dark web monitoring, email fraud alerts and an optional managed detection and response service sold by an affiliate and "not required for insurance coverage"; in-house response and recovery team |
| **Coalition** | "Active insurance": coverage plus security tools | 130,000+ clients; an AI security operations service; an incident response affiliate; enterprise coverage of up to $25 million primary and excess, with capacity named from Allianz, Arch, Ascot, Fortegra, Lloyd's, Vantage and Aspen |
| **Lloyd's market** | Syndicates writing standalone cyber | Required since March 31, 2023 to exclude state-backed cyber-attacks in all standalone cyber-attack policies |
| **Package and endorsement writers** | Cyber added to a BOP, package or professional policy | Nearly two-thirds of 2025 US cyber policies in force were endorsements on other commercial policies |

The two insurtechs in the table share a pattern: an MGA (or affiliated insurer) that underwrites from external scans, sells or bundles security services, and runs claims and incident response in house, with risk on other insurers' paper and reinsurance. Traditional carriers write cyber both standalone and as an endorsement on other commercial policies.

## The Market

The NAIC's cyber report, released October 21, 2026 with 2025 data, puts US domestic cyber direct written premium at $7.46 billion, or $9.46 billion including alien surplus lines insurers, up from $2.75 billion in 2020. Domestic policies in force rose 33% to 5.84 million, reported claims rose 20% to 56,323, and endorsements on other commercial policies were nearly two-thirds of policies in force. The gap between the two premium figures is the share written by non-US surplus lines insurers (largely Lloyd's), which file nothing with US regulators and are counted separately. Press coverage of the full report gives a per-company ranking and a standalone versus endorsement premium split I couldn't verify, because the report itself was too large to open. <!-- source-gap: naic-cyber-2026-detail | secondary | standalone vs endorsement premium share, surplus lines share of cyber premium, largest writer and loss ratios in the NAIC 2026 cyber report | closes with: the NAIC 2026 cyber insurance market report PDF opened | checked: 2026-11-10 -->

Three structures carry cyber cover, and the NAIC data call separates them:

- **Standalone policies**, with their own forms, limits, retentions and panels.
- **Package policies**, where cyber is a coverage part of a larger commercial or professional policy with its own limit.
- **Endorsements** that add limited cyber cover (often first-party breach response) to a BOP or package, many with low sublimits.

## Coverages

A standalone cyber policy is a set of insuring agreements, each with its own limit or sublimit and retention, under an aggregate:

| Insuring agreement | First or third party | What it pays |
| --- | --- | --- |
| **Incident response / breach costs** | First | Forensics, breach counsel, notification, call centers, credit monitoring, public relations |
| **Business interruption** | First | Lost income and extra expense during a network outage, after a waiting period measured in hours; contingent BI for an outage at a vendor |
| **Data restoration** | First | Restoring or recreating data and software |
| **Cyber extortion** | First | Ransom payments and negotiators, subject to sanctions law |
| **Funds transfer fraud / social engineering** | First | Money sent on fraudulent instructions, usually sublimited |
| **Network security and privacy liability** | Third | Claims by people whose data was exposed, or by others harmed by a security failure |
| **Regulatory defense and penalties** | Third | Regulatory investigations and fines where insurable |
| **Media liability** | Third | Defamation and infringement in online content |
| **PCI fines and assessments** | Third | Card brand assessments after a payment card breach |

Third-party sections are claims-made, so the retro date and tail mechanics of [Professional & Management Liability](/books/insurance/professional-and-management-liability#claims-made-mechanics) apply; first-party sections are triggered by discovery of an event during the policy period.

### A Worked Ransomware Claim

The numbers are mine. A manufacturer has a $3 million aggregate cyber policy with a $50,000 retention, an 8-hour BI waiting period, and a $1 million extortion sublimit. Attackers encrypt its systems; operations stop for six days.

| Item | Incurred | Applied |
| --- | --- | --- |
| Forensics and breach counsel (panel vendors) | $180,000 | Incident response |
| Ransom negotiation and payment, after a sanctions screen | $650,000 | Extortion, within the $1 million sublimit |
| Data restoration | $120,000 | Data restoration |
| Lost income: six days less the 8-hour waiting period | $540,000 | Business interruption, net of the waiting period |
| Notification and credit monitoring for 40,000 people | $210,000 | Incident response |
| Total | $1,700,000 | |
| Less retention | −$50,000 | One retention for the event |
| Paid | $1,650,000 | Remaining aggregate $1,350,000 for later claims and any third-party suits |

Each line is an exposure on one claim with its own coverage code and sublimit, the retention is applied once per event, and every payment erodes the aggregate. A class action by the 40,000 people, filed a year later, is a third-party exposure on the same claim (related to the event) against the remaining $1,350,000.

## War and State-Backed Attack Exclusions

Traditional war exclusions were written for physical conflict, and a state-sponsored attack outside a shooting war fits them badly. The London market's answer was four model clauses published in 2021, LMA5564 to LMA5567, revised as "A" versions in January 2023: LMA5564 excludes all state-sponsored attacks and is the broadest, while LMA5567, the most used (in its 5567A revision), covers state-backed attacks unless the attack crosses the impairment thresholds. Lloyd's then made exclusion mandatory. Lloyd's Market Bulletin Y5381 (August 17, 2022) requires that all standalone cyber-attack policies in Lloyd's risk codes CY and CZ "must include, unless agreed by Lloyd's, a suitable clause excluding liability for losses arising from any state backed cyber-attack," in addition to any war exclusion, from March 31, 2023 at inception or renewal. At a minimum the exclusion must:

1. exclude losses from war, declared or not, where the policy has no separate war exclusion;
2. exclude losses from state-backed cyber-attacks that significantly impair a state's ability to function or its security capabilities;
3. be clear whether it excludes computer systems outside the affected state;
4. set "a robust basis by which the parties agree on how any state backed cyberattack will be attributed to one or more states"; and
5. define all key terms.

Managing agents must show the clauses were legally reviewed, Lloyd's accepts any of the four LMA model clauses (issued under LMA21-043-PD) as meeting the requirements, and policies in force on March 31, 2023 needed endorsing only if they expired more than twelve months later.

For the system, the exclusion's version is part of the form set, and attribution is a claim fact with a source: the policy's attribution clause decides whose attribution counts (commonly the government of the affected state), and the claim file must record the attribution evidence relied on and when. Reinsurance must be back to back: Lloyd's told managing agents to check their reinsurance programs gave matching cover.

## Ransomware and Sanctions

Paying a ransom may violate US sanctions if the attacker is a sanctioned person or in an embargoed jurisdiction. OFAC's updated advisory of September 21, 2021 names "cyber insurance firms" among the companies facilitating ransomware payments that "may risk violating OFAC regulations," and says OFAC "may impose civil penalties for sanctions violations based on strict liability," even if the payer didn't know. License applications for ransomware payments are reviewed "on a case-by-case basis with a presumption of denial." OFAC treats as significant mitigating factors a company's meaningful cybersecurity steps, a "self-initiated and complete report of a ransomware attack to law enforcement or other relevant U.S. government agencies, such as CISA," made as soon as possible, and full cooperation; it says it would more likely resolve such cases with a non-public response when those steps were taken.

New York's Department of Financial Services went further in Insurance Circular Letter No. 2 (February 4, 2021), its Cyber Insurance Risk Framework, which "recommends against making ransom payments" and asks insurers writing cyber to adopt seven practices: a board-approved cyber insurance risk strategy, managing and eliminating silent cyber exposure, evaluating systemic risk, rigorously measuring each insured's risk, educating insureds and producers, obtaining cybersecurity expertise, and requiring notice to law enforcement in cyber policies.

A ransom payment is therefore a claim payment with a gate in front of it: a sanctions screen of the threat actor and the wallet with the evidence kept, a check that law enforcement was notified (and when), the insured's consent, and the payment rail (usually a negotiator converting to cryptocurrency), each recorded. The general OFAC screen on claim payments is in [Exposures, Reserves & Payments](/books/insurance/reserves-and-payments) in the Claims part; this is the strictest case of it.

## Silent Cyber

"Silent" or non-affirmative cyber is exposure to cyber losses under property, liability or other policies that neither grant nor exclude them. DFS's framework says insurers should eliminate it by stating in each policy whether cyber losses are covered or excluded, and mitigate existing exposure, through reinsurance for example, until wordings change; it applies even to insurers that don't write cyber. Lloyd's phased in the same requirement from 2020 (Market Bulletin Y5258, cited in Y5381). For the system, this is a forms question with a data answer: every form in the catalog carries an affirmative, excluded or silent cyber flag, and the exposure report on the silent ones is a query.

## Incident Response Panels

Most standalone policies come with a panel: breach counsel, forensic firms, negotiators, notification and call center vendors, and PR firms the insurer has pre-approved at agreed rates, reached through a hotline. Using the panel usually avoids consent requirements and may be required for some coverages; using an off-panel vendor may need consent or be paid only at panel rates. Breach counsel typically engages the forensic firm, to keep its report within legal privilege. At-Bay and Coalition both run in-house or affiliated response teams in addition to panels.

The system side: a cyber claim opens with a hotline call and assigns panel vendors within hours, so the claim, the vendor assignments and the first reserve exist before the insured has filed anything formal; vendor invoices are paid at panel rates and allocated to the right insuring agreement; and the incident's timeline (discovery, containment, restoration) drives the BI calculation and any regulatory notice deadlines the insured faces.

## Underwriting by Scan and Questionnaire

Cyber underwriting starts outside the applicant's network. At-Bay lists vulnerability scanning and dark web monitoring; Coalition offers a security assessment; DFS's framework expects insurers to have "a data-driven, comprehensive plan for assessing the cyber risk of each insured and potential insured," using detailed information about the insured's program, third-party risk evaluations and claims history to find the control gaps that predict losses. In practice an application combines:

- **An external scan** of the applicant's domains and IP ranges: exposed services (remote desktop, unpatched VPN appliances, databases), known vulnerabilities with their severity, email security configuration, leaked credentials, and technologies in use.
- **A controls questionnaire:** MFA for remote access, email and privileged accounts; offline or immutable backups and tested restores; endpoint detection and response; patch cadence; employee training; vendor management; incident response plan.
- **Firmographics:** industry, revenue, records held by type (payment cards, health, personal), and dependence on technology vendors.

The scan is evidence at a point in time and is repeated: before quote, at bind (some insurers require critical findings fixed as a bind condition), during the term (alerts to the insured about new exposures), and at renewal. The questionnaire's answers are warranties: an insured who answered yes to MFA and didn't have it faces a rescission or coverage defense, so the signed answers are kept by version.

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model) and the `submissions` table from [Underwriting Rules, Referrals & Models](/books/insurance/underwriting): scans and questionnaires are assessments attached to a submission or an in-force policy, and findings are rows that can be bind conditions; claims gain an incident record and a ransom gate.

```sql
CREATE TABLE security_assessments (        -- one scan or questionnaire, at one time
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  submission_id      UUID,                  -- submissions (Underwriting), pre-bind
  policy_id          UUID REFERENCES policies (id),  -- in-force monitoring and renewal
  kind               TEXT NOT NULL CHECK (kind IN ('external_scan', 'questionnaire',
                       'third_party_rating', 'inspection')),
  vendor             TEXT,                  -- scan engine or rating provider
  scope              JSONB NOT NULL,        -- domains, IP ranges, entities assessed
  performed_at       TIMESTAMPTZ NOT NULL,
  document_id        UUID,                  -- the signed questionnaire, or the raw report
  score              NUMERIC(8, 3),         -- when the vendor produces one
  model_version_id   UUID,                  -- model_versions (Data, AI & Privacy Rules)
  CHECK (submission_id IS NOT NULL OR policy_id IS NOT NULL)
);

CREATE TABLE security_findings (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  assessment_id      UUID NOT NULL REFERENCES security_assessments (id),
  code               TEXT NOT NULL,         -- 'rdp_exposed', 'cve:...', 'no_mfa_email', ...
  severity           TEXT NOT NULL CHECK (severity IN ('info', 'low', 'medium', 'high',
                       'critical')),
  answer             JSONB,                 -- the questionnaire answer, as warranted
  bind_condition     BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_at        TIMESTAMPTZ,
  resolution_evidence_id UUID               -- the rescan or document that closed it
);

CREATE TABLE cyber_incidents (             -- the event behind a cyber claim
  claim_id           UUID PRIMARY KEY REFERENCES claims (id),
  discovered_at      TIMESTAMPTZ NOT NULL,
  contained_at       TIMESTAMPTZ,
  restored_at        TIMESTAMPTZ,           -- ends the BI period of restoration
  incident_type      TEXT NOT NULL,         -- 'ransomware', 'bec', 'data_breach', ...
  records_exposed    INT,
  attribution        TEXT,                  -- state attribution, if asserted
  attribution_source TEXT,                  -- whose attribution, per the policy clause
  war_exclusion_form_id UUID,               -- forms: the exclusion edition on the policy
  law_enforcement_notified_at TIMESTAMPTZ
);

CREATE TABLE ransom_approvals (            -- the gate before an extortion payment
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  claim_id           UUID NOT NULL REFERENCES claims (id),
  threat_actor       TEXT,
  wallet_addresses   TEXT[] NOT NULL,
  sanctions_screened_at TIMESTAMPTZ NOT NULL,
  sanctions_result   TEXT NOT NULL CHECK (sanctions_result IN ('clear', 'potential_match',
                       'blocked')),
  screening_evidence_id UUID NOT NULL,
  insured_consent_doc_id UUID NOT NULL,
  approved_by        UUID,
  claim_payment_id   UUID REFERENCES claim_payments (id),
  CHECK (sanctions_result = 'clear' OR claim_payment_id IS NULL)
);
```

Design notes:

- **Assessments are evidence with a timestamp.** A quote records which assessments it read; a renewal makes new ones rather than editing old ones, so a coverage defense can show what the insurer knew at bind.
- **Bind conditions are findings.** A quote with an unresolved critical finding marked as a bind condition can't bind; the resolution is a rescan or document linked to the finding.
- **Sublimits are coverage terms.** Each insuring agreement is a coverage with its own limit and retention under a policy aggregate, so the exposures on a claim erode the right sublimit and the aggregate together.
- **A ransom payment can't exist without a clear screen.** The check constraint on `ransom_approvals` and a payment workflow that requires an approval row make the sanctions gate structural.
- **Flag every form's cyber stance** (affirmative, excluded, silent) so silent cyber exposure is a report, not a research project.

## Auditing

- **What the insurer knew at bind.** Every assessment and finding a quote read, the questionnaire as signed, and the resolution of each bind condition.
- **The exclusions on each policy,** by form and edition, and for each claim the attribution relied on, its source and its date.
- **Every extortion payment's gate:** screen, evidence, law enforcement notice, consent, approver and payment, retained as OFAC would ask to see them.
- **Panel use.** Vendor assignments with their engagement path (breach counsel or insurer), rates and invoices, allocated to insuring agreements.

## What This Means for the System You Build

- **Treat scans and questionnaires as dated evidence** attached to submissions and policies, with findings that can block a bind.
- **Model each insuring agreement as its own coverage** with sublimit and retention under the aggregate.
- **Record the war and state-backed exclusion form on every policy** and attribution facts on every claim.
- **Gate every ransom payment** behind a sanctions screen, a law enforcement notice and the insured's consent, enforced in the schema.
- **Open cyber claims from a hotline** with vendor assignments and reserves before formal notice, and track the incident timeline for BI.
- **Tag every form's cyber stance** so silent exposure can be measured.

## References

**Regulators and guidance**

- [NAIC: Report finds cyber insurance market has nearly tripled since 2020 as cyber risk grows](https://content.naic.org/article/naic-report-finds-cyber-insurance-market-has-nearly-tripled-2020-cyber-risk-grows), October 21, 2026: 2025 domestic direct written premium of $7.46 billion ($9.46 billion with alien surplus lines), 5.84 million policies, 56,323 claims and the endorsement share of policies
- [US Treasury, OFAC: Updated Advisory on Potential Sanctions Risks for Facilitating Ransomware Payments, September 21, 2021 (PDF)](https://ofac.treasury.gov/media/912981/download?inline), cyber insurers as facilitators, strict liability, mitigating factors and the presumption of denial for licenses
- [New York DFS: Insurance Circular Letter No. 2 (2021), Cyber Insurance Risk Framework](https://www.dfs.ny.gov/industry_guidance/circular_letters/cl2021_02), the seven practices, silent cyber, measuring each insured's risk and the recommendation against ransom payments

**Standards**

- [Lloyd's: Market Bulletin Y5381, State backed cyber-attack exclusions, August 17, 2022 (PDF)](https://assets.lloyds.com/media/e9a4058c-4c25-48d6-99d3-0c466987e099/Y5381%20Market%20Bulletin%20-%20Cyber-attack%20exclusions.pdf), the mandatory exclusion for risk codes CY and CZ from March 31, 2023, its five minimum requirements, the LMA model clauses and back-to-back reinsurance

**In practice**

- [Insurance Journal: Lloyd's cyber war exclusions, May 9, 2023](https://www.insurancejournal.com/news/international/2023/05/09/720020.htm), LMA5564 as the broadest clause, LMA5567 and 5567A as the most used, and the January 2023 revisions

**Vendor documentation**

- [At-Bay](https://www.at-bay.com/), InsurSec, scanning and monitoring, optional MDR from an affiliate, in-house response, policyholder count
- [Coalition](https://www.coalitioninc.com/), active insurance, security tools, incident response affiliate, client count, enterprise limits and named capacity providers
