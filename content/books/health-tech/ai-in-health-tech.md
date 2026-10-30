+++
title = "AI in Health Tech"
description = "Ambient scribes, coding and prior auth AI, patient-facing chat, decision support transparency, FDA device rules, state AI laws and LLMs with PHI under a BAA."
category = "Health Tech Industry"
order = 1961
part = "Running the Platform"
tags = ["health-tech", "ai", "llm", "fda", "clinical-decision-support", "hipaa"]
+++

AI arrived in health care through the paperwork before it reached the diagnosis. The products that spread fastest since 2023 write things: an ambient scribe that turns a visit's conversation into a draft note, a coding assistant that suggests the codes for that note, a prior authorization tool that assembles the clinical justification, an inbox assistant that drafts the reply to a patient's portal message, a front-desk agent that answers the phone. Behind them sits an older and more regulated layer: software that reads images or vitals and flags a finding, which the FDA has authorized as medical devices in large numbers, and the predictive models inside EHRs that score sepsis or readmission risk.

Each of those uses lands under a different rule. Whether the software is a regulated device depends on what it claims to do and whether a clinician can check its basis. Whether a patient must be told a message was written by a model depends on the state and on whether a clinician reviewed it. Whether a payer may let an algorithm deny care is now state law in California. Whether you may send the transcript to a model at all depends on a business associate agreement that covers that exact product and configuration. This chapter surveys the products and the rules as of October 2026 and how to build AI features that survive them. Where models run and what they cost is the Hosting & Cloud volume's [Where AI Runs](/books/hosting-and-cloud/where-ai-runs); the general engineering is the playbook's [AI Agents](/docs/architecture/ai-agents) and [AI & LLM Security](/docs/security/ai-security); the front-desk voice agent and the practice's scribe consent are [Practice Analytics & AI Front Desk](/books/health-tech/practice-analytics-and-ai). The chapter adds `ai_features` and `ai_outputs` to the core data model in [The Health Tech Business](/books/health-tech/health-tech-business#the-core-data-model).

## How the Platforms Do It

As of October 2026, from vendor pages and regulators:

| Use | Representative products | What the public record says | Rule that bites |
| --- | --- | --- | --- |
| **Ambient documentation** | Microsoft Dragon Copilot, Abridge, AWS HealthScribe (as a building block) | Dragon Copilot "ambiently capture[s] multi-party, multilingual conversations" and is embedded in EHRs such as Epic; Abridge says it is "trusted by 300+ health systems"; HealthScribe links "every sentence" of a generated note to the transcript and "does not retain inbound audio or output text" | Recording consent (state law), HIPAA and the BAA, clinician review before signing |
| **Clinical summarization** | Pieces Technologies (Texas hospitals) | Texas's attorney general settled with Pieces on September 18, 2024 over a claimed "severe hallucination rate" of "<1 per 100,000" it found "likely inaccurate" | State consumer protection on accuracy claims |
| **Image and signal analysis** | FDA-authorized devices, most of them in radiology | The FDA's AI-enabled device list runs through decisions dated June 29, 2026; the agency says it will "explore methods to identify and tag medical devices that incorporate foundation models" | FDA premarket review, change control |
| **Predictive decision support in EHRs** | Sepsis, deterioration and readmission scores | ONC's HTI-1 rule required certified EHRs to expose "source attributes" for predictive interventions; HTI-5 removes that requirement | Section 1557 nondiscrimination, ONC certification |
| **Utilization review and prior authorization** | Payer and vendor tools; CMS's WISeR model | WISeR (January 1, 2026 to December 31, 2031, in New Jersey, Ohio, Oklahoma, Texas, Arizona and Washington) uses AI to review selected services, with non-payment decided by "appropriately licensed clinicians" | California SB 1120; Medicare rules; state gold-carding laws |
| **Patient-facing generated messages** | Portal reply drafting, chat, voice agents | Common across EHRs and engagement vendors | California AB 3030 disclaimers unless a clinician reviews; Utah's disclosure rule for licensed services; Illinois's and Nevada's limits on AI therapy |

Four patterns run through the table:

- **Review is the dividing line.** California exempts a generated message a licensed provider "read and reviewed"; Texas requires a practitioner to review records created with AI; the FDA's non-device decision support criteria turn on whether a clinician can independently review the basis. A design that keeps a named clinician between the model and the patient is under lighter rules almost everywhere.
- **Accuracy claims are enforced like any other claim.** The Pieces settlement was about marketing metrics, not about the model. A published hallucination rate is a representation that has to be measured, defined and true.
- **Federal transparency rules are receding while state rules grow.** HTI-5, final in October 2026 and effective December 28, 2026, removed the EHR model-card requirements, and the states (California, Texas, Illinois, Utah, Nevada, Colorado) have filled the space with disclosure and human-decision rules.
- **The BAA covers products, not companies.** Model providers sign BAAs for specific services and configurations; the same provider's other features are outside it.

## Ambient Scribes

An ambient scribe records the visit (a phone or a room microphone), transcribes it with speaker roles, drafts a structured note (history, exam, assessment and plan, often in the practice's template), and hands the draft to the clinician, who edits and signs it into the EHR. Some also propose orders, codes and patient instructions. The architecture decisions that matter:

- **Consent before recording.** Recording a conversation is governed by state wiretap law (one-party or all-party consent) and by the practice's own policy; the scribe asks, records the patient's answer, and doesn't start without it. [Practice Analytics & AI Front Desk](/books/health-tech/practice-analytics-and-ai#ambient-scribes) owns the consent law; the system's job is a `consents` row before audio flows, and a visible indicator while it does.
- **Audio is PHI with the shortest life you can give it.** HealthScribe's model is the conservative one: no retention of the audio or the output on the service's side. On your side, keep audio only until the note is signed (or for a short quality window the practice agrees to), keep the transcript as long as the note it supports, and say so in the retention schedule ([Recordings and Transcripts Are Personal Data](/docs/architecture/ai-agents#recordings-and-transcripts-are-personal-data)).
- **Evidence links in the draft.** Every generated sentence points at the transcript span it came from, as HealthScribe does, so the clinician can check a claim in seconds and an auditor can see what was heard. A note sentence with no evidence is flagged.
- **The signed note is the clinician's.** The legal medical record is what the clinician signs; the draft and the edits between draft and signature are kept as provenance, not as the record. The diff is also the best quality signal there is: how much clinicians change, in which sections, by specialty.
- **Codes are suggestions until a person accepts them.** A scribe that proposes E/M levels or diagnosis codes moves into coding compliance; [Coding, Documentation & Compliance](/books/health-tech/coding-and-documentation#the-false-claims-act) covers upcoding enforcement, and the suggestion and its acceptance are both recorded.

## Coding, Revenue Cycle and Prior Authorization AI

Revenue cycle AI is where the money is and where the enforcement is. Coding assistants read the note and propose CPT, ICD-10-CM and HCPCS codes; denial tools predict which claims a payer will reject; prior authorization tools assemble the clinical justification from the chart. The rules:

- **Codes are claims to the government.** A code that the documentation doesn't support is a false claim if it's billed to Medicare or Medicaid, whether a person or a model chose it. Keep the evidence (which note sentence supports which code), require a coder's or clinician's acceptance for anything that raises the level, and measure the model's acceptance rate by code and by clinician to catch drift toward higher levels.
- **Payers may not let an algorithm decide medical necessity in California.** SB 1120 (Chapter 879, approved September 28, 2024) requires health plans and insurers using AI, algorithms or software for utilization review to base determinations on the enrollee's own information and to apply them fairly, and says the tool "shall not deny, delay, or modify health care services based, in whole or in part, on medical necessity"; that determination "shall be made only by a licensed physician or a licensed health care professional." A vendor selling to plans builds a human decision step into the product, not a configuration flag.
- **Medicare is piloting AI review with a human decision.** CMS's WISeR model uses technology including AI to review a pre-selected set of services vulnerable to fraud, waste and abuse in six states, with non-payment recommendations decided by licensed clinicians. [Prior Authorization](/books/health-tech/prior-authorization) covers the rest of the process, including the CMS-0057-F timelines and the Da Vinci APIs.
- **The provider-side assistant writes, the payer decides.** A tool that drafts a prior authorization request from the chart is documentation help for the provider and carries the provider's obligations; it never submits without the provider's review, because the request attests to medical facts.

## Patient-Facing AI

Generated text that reaches a patient is where the newest statutes are:

- **California AB 3030** (Chapter 848, approved September 28, 2024, adding Health and Safety Code section 1339.75) requires a health facility, clinic, physician's office or group practice that uses generative AI for "written or verbal patient communications pertaining to patient clinical information" to include a disclaimer that the message was AI-generated and "clear instructions" for reaching a human. Placement is specified by medium: at the beginning of letters and emails, throughout a chat or video interaction, and verbally "at the start and the end" of audio. A message "read and reviewed by a human licensed or certified health care provider" is exempt, and administrative matters ("appointment scheduling, billing, or other clerical or business matters") are outside the definition.
- **Texas SB 1188** (effective September 1, 2025) lets a practitioner use AI "for diagnostic purposes," including recommendations on diagnosis or treatment from the record, if acting within the scope of their license, the use isn't otherwise restricted, and the practitioner "reviews all records created with artificial intelligence"; the practitioner "must disclose" that use to patients.
- **Illinois HB 1806**, the Wellness and Oversight for Psychological Resources Act (Public Act 104-0054, August 1, 2025), bars offering therapy or psychotherapy unless conducted by a licensed professional, and bars licensed professionals from using AI to make independent therapeutic decisions, to interact directly with clients in therapeutic communication, or to generate treatment plans without the professional's review; civil penalties run to $10,000 per violation. A wellness chatbot that drifts into therapy is the product this targets.
- **Nevada AB 406** (effective July 1, 2025) bars an AI provider from offering a system "specifically programmed" to provide what would be professional mental or behavioral health care if a person provided it, or from representing that a system can provide that care, with civil penalties up to $15,000 per violation. Licensed mental and behavioral health providers may use AI only for administrative support (scheduling, records, billing, organizing session notes), must "independently review the accuracy" of what it generates from billing records and session notes, and otherwise commit unprofessional conduct; public schools may not use AI to perform the mental health duties of school counselors, psychologists and social workers.
- **Utah's Artificial Intelligence Policy Act** (SB 149, signed March 13, 2024), as amended by SB 226 (effective May 7, 2025), requires an individual providing services in a regulated occupation (one regulated by the state's Department of Commerce that requires a license or state certification) to "prominently disclose" generative AI use in a "high-risk artificial intelligence interaction," which includes collecting health data and giving medical or mental health advice. The disclosure is made verbally at the start of a spoken interaction and in writing before a written one, and the act now runs until its repeal date of July 1, 2027.
- **The FCC, the FTC and the states on voice and claims.** AI voice calls and disclosure rules for the front desk are [Practice Analytics & AI Front Desk](/books/health-tech/practice-analytics-and-ai#disclosure-ai-voices-and-recording); the FTC's authority over deceptive claims applies to health AI as to anything else, and the Texas attorney general used the state's consumer protection law against Pieces.

The system rule that follows: classify every patient-facing generation by content (clinical or administrative), by review (reviewed by a licensed provider before sending, or not) and by the patient's state, and let a rules table decide the disclaimer, its placement and the human contact path. A message drafted by a model and approved by a nurse in California goes without the disclaimer; the same message auto-sent goes with it.

## Clinical Decision Support and the FDA

Software that informs clinical decisions sits on a line the FD&C Act draws. Section 520(o)(1)(E) excludes from the device definition clinical decision support that meets four criteria (broadly: it doesn't process medical images or signals, it displays or analyzes medical information, it supports a professional's recommendation rather than directing treatment, and it lets the professional independently review the basis), and the FDA's guidance explains how it reads them. That guidance was reissued as a final guidance in January 2026, which the agency says "further clarifies" how its digital health policies apply, including to functions for patients and caregivers. What it means for a product:

- **Images and signals are devices.** Anything that analyzes an X-ray, an ECG waveform or a CGM trace to produce a finding is on the device side, which is why the FDA's AI-enabled device list is dominated by radiology. The list is "not a comprehensive resource," but it is the place to check whether a competitor's claim is cleared.
- **Showing the basis keeps text tools off the device side.** A tool that presents a recommendation with the guideline, the data and the reasoning a clinician can check is in a different position from one that outputs a risk score with no explanation, and the second is likelier to be a device. Claims in marketing count as much as behavior.
- **Changes need a plan.** A cleared AI device can't simply retrain and ship. Section 515C of the FD&C Act lets a manufacturer include a predetermined change control plan in its submission, and a later change "consistent with" the authorized plan needs no new premarket notification or supplement, so the retraining pipeline, its data and its acceptance tests are regulatory artifacts written before launch. [Digital Health Apps & Devices](/books/health-tech/digital-health-and-devices) covers device classification, wellness and SaMD in depth.

## Decision Support Transparency and Nondiscrimination

Two federal rules reach predictive models inside clinical workflows:

- **ONC certification.** HTI-1 created the decision support interventions criterion (§ 170.315(b)(11)) and required certified EHRs to let users see, and in some cases edit, "source attributes" for predictive interventions (the training data, intended use, validation and fairness information that function as a model card), with intervention risk management practices behind them. The HTI-5 final rule, published October 28, 2026 and effective December 28, 2026, finalizes "as proposed" the removal of the source attribute support, access and modification and intervention risk management requirements, and of the developer's obligation to keep source attributes current. ONC says it "will take under consideration for future rulemaking" whether to restore source attribute transparency. EHR model cards may persist as a product feature; they're no longer a certification requirement. [Cures Act, Information Blocking & Certification](/books/health-tech/information-blocking-and-certification#the-certification-program) covers the program.
- **Section 1557.** HHS's nondiscrimination rule makes it unlawful for a covered entity to discriminate on the basis of race, color, national origin, sex, age or disability "through the use of patient care decision support tools," gives it an "ongoing duty to make reasonable efforts to identify" tools whose inputs measure those characteristics, and requires reasonable efforts to mitigate the risk (45 CFR 92.210). The obligation is the provider's, but the provider can only meet it with the vendor's documentation of what each model uses, so a vendor's model documentation survives HTI-5 as a sales requirement.

Colorado is the state to watch for the same documentation. Its AI Act (SB24-205, 2024) put duties on AI developers and deployers from February 1, 2026; SB25B-004 pushed them to June 30, 2026, and before that date SB26-189 (signed May 14, 2026) repealed and reenacted the law as a narrower one on automated decision-making technology. As of October 2026, health care services are among the consequential decisions it covers; developers owe deployers documentation of intended uses, training data categories and known limitations from January 1, 2027, and deployers owe consumers notice at the point of interaction, a plain-language explanation within 30 days of an adverse decision, and human review on request.

## LLMs, PHI and the BAA

Sending a patient's note to a model API is a disclosure to a business associate, and the playbook's rule applies: no BAA, no PHI ([The Business Associate Agreement](/docs/compliance/hipaa#the-business-associate-agreement)). The detail that trips teams is scope:

- **Cloud platforms list eligible services.** AWS's HIPAA eligible services list (updated October 15, 2026) includes Amazon Bedrock, Bedrock AgentCore, Comprehend Medical, HealthLake and Transcribe including HealthScribe; a service not on the list is outside the BAA even in the same account.
- **Model providers cover named products and configurations.** Anthropic's BAA, for example, covers its first-party API's Messages API and listed features, Enterprise plans once an owner acts, and some tools in a HIPAA configuration, and excludes others by name (the Batch and Files APIs, connectors and MCP servers, and beta products among them); covered models "require 30-day data retention" unless zero retention is separately authorized. Other providers publish their own lists; read the current one for the exact endpoint you call.
- **Tools and connectors move data outside the agreement.** An agent that calls a third-party tool or MCP server with PHI in the arguments has made a disclosure to that third party, BAA or not ([Agents, Tools and MCP](/docs/security/ai-security#agents-tools-and-mcp)).
- **Minimum necessary applies to prompts.** Send the sections of the chart a feature needs, not the whole record; strip identifiers the task doesn't use; never put PHI in system prompts, evaluation sets or logs that leave the PHI boundary.
- **Training is a separate decision.** Using customers' PHI to train or fine-tune a model is a use the BAA must permit, and most practices' agreements don't; the usual path is de-identified data under a governed release ([De-identification, Research & Data Use](/books/health-tech/de-identification-and-data-use)).

Prompt injection is a clinical safety issue here, not only a security one: a patient message or an uploaded document can carry instructions, and an assistant with tools that can read other patients' charts or send messages is the lethal combination the playbook warns about ([The Lethal Trifecta](/docs/security/ai-security#the-lethal-trifecta)). Health AI features get read access to one patient's context at a time and no tool that writes outside the review queue.

## Governance and Evaluation

Health systems now buy AI with a governance review, and the questions are predictable: what the feature does, what data it sees, which model and vendor, whether a BAA covers it, how it was evaluated and on whom, how it fails, who reviews its output, and how it's monitored. A vendor that can answer from records sells faster:

- **A registry of features.** Every AI feature, per tenant, with its purpose, model and version, vendor, BAA reference, regulatory position (device or not, AB 3030 scope), review requirement and owner.
- **Evaluations by subgroup.** Accuracy measured on held-out cases, reported by age, sex, language and, where data permits, race and ethnicity, because Section 1557 asks providers to identify and mitigate discriminatory risk and they'll ask the vendor for the numbers.
- **Production monitoring.** Edit rates on scribe notes, acceptance rates on codes, override rates on alerts, by site and clinician, with alerts when they move.
- **Claims that match measurements.** Every number in marketing (accuracy, time saved, hallucination rate) traces to an evaluation run with its definition and data set, after the Pieces settlement.

## How to Build It

Two tables carry the record: the features a tenant runs, and every output with its review. Both extend the core model; generated clinical content points back to them:

```sql
CREATE TABLE ai_features (               -- an AI use, as deployed for one tenant
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL REFERENCES organizations (id),
  feature          TEXT NOT NULL,         -- 'ambient_note', 'code_suggestion', 'portal_reply_draft',
                                          -- 'prior_auth_packet', 'risk_score', 'intake_summary'
  audience         TEXT NOT NULL CHECK (audience IN ('clinician', 'staff', 'patient', 'payer')),
  content_class    TEXT NOT NULL CHECK (content_class IN ('clinical', 'administrative')),
  vendor           TEXT NOT NULL,
  model            TEXT NOT NULL,          -- model and version as the vendor reports it
  baa_ref          TEXT,                   -- the agreement and the covered service; null blocks PHI
  phi_allowed      BOOLEAN NOT NULL,
  regulatory_basis TEXT NOT NULL,          -- 'non_device_cds', 'fda_cleared:K123456', 'administrative'
  review_required  BOOLEAN NOT NULL,       -- a licensed reviewer before use or sending
  evaluation_id    UUID,                   -- the passing evaluation this configuration shipped on
  owner            TEXT NOT NULL,          -- the accountable person at the vendor or practice
  enabled_at       TIMESTAMPTZ,
  disabled_at      TIMESTAMPTZ,
  CHECK (baa_ref IS NOT NULL OR NOT phi_allowed)
);

CREATE TABLE ai_outputs (                -- one generation and what became of it
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL REFERENCES organizations (id),
  ai_feature_id    UUID NOT NULL REFERENCES ai_features (id),
  patient_id       UUID REFERENCES patients (id),
  encounter_id     UUID REFERENCES encounters (id),
  inputs           JSONB NOT NULL,         -- record IDs and versions sent, never the PHI itself
  prompt_ref       TEXT NOT NULL,          -- template and version in version control
  output_ref       TEXT NOT NULL,          -- encrypted object key of the draft
  evidence         JSONB,                  -- sentence-to-transcript or code-to-note spans
  status           TEXT NOT NULL CHECK (status IN ('draft', 'accepted', 'edited', 'rejected',
                     'sent', 'expired')),
  reviewed_by      UUID REFERENCES practitioners (id),
  reviewed_at      TIMESTAMPTZ,
  edit_distance    NUMERIC(5, 4),          -- share of the draft changed before acceptance
  disclaimer       TEXT,                   -- the disclosure applied, if any, and its placement
  patient_state    TEXT,                   -- jurisdiction used for the disclosure rule
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE documents
  ADD COLUMN ai_output_id UUID REFERENCES ai_outputs (id);   -- a signed note drafted by a scribe
ALTER TABLE communications
  ADD COLUMN ai_output_id UUID REFERENCES ai_outputs (id);   -- a message drafted by a model
```

Patient messages sent with clinical content, generated, and neither reviewed nor disclosed, which in California is the AB 3030 exposure:

```sql
SELECT o.id, o.tenant_id, o.patient_state, o.created_at
FROM ai_outputs o
JOIN ai_features f ON f.id = o.ai_feature_id
WHERE f.audience = 'patient'
  AND f.content_class = 'clinical'
  AND o.status = 'sent'
  AND o.reviewed_by IS NULL
  AND o.disclaimer IS NULL
  AND o.patient_state = 'CA';
```

Design notes:

- **The check constraint is the BAA rule.** A feature without an agreement reference can't be marked as allowed to see PHI, and the prompt builder refuses PHI for any feature where `phi_allowed` is false.
- **Inputs are references.** `inputs` lists the note, observation and document IDs and versions sent, so the PHI stays in its tables and a later question ("what did the model see") is answered by joining back.
- **Review is a person, not a flag.** `reviewed_by` points at a practitioner, because the AB 3030 exemption and the Texas review requirement are about a licensed human; a staff member's approval is recorded elsewhere and doesn't satisfy it.
- **Edits are the quality signal.** `edit_distance` by feature, clinician and model version is the production monitor, and a sudden drop (clinicians stop editing) is as worth investigating as a rise.
- **Disclosure is decided by rules, recorded on the row.** The rules table keyed by feature class, review state and patient jurisdiction picks the disclaimer and placement ([Rules as Data](/docs/architecture/rules-as-data)), and the applied text is stored with the output.
- **Emit `ai_output.created`, `ai_output.accepted`, `ai_output.rejected` and `ai_feature.disabled`;** a disabled feature stops new generations immediately across the tenant.

## Auditing

- **Every generation and its fate,** with the model, prompt version, inputs by reference, reviewer and edits, kept as long as the record it became part of ([Auditing AI Actions](/docs/architecture/ai-agents#auditing-ai-actions)).
- **Every feature's configuration history:** model changes, BAA references, regulatory basis and the evaluation it shipped on.
- **Every disclosure applied to a patient message,** with the rule that chose it.
- **Every recording consent** before audio was captured, and the deletion of audio when its window ended.
- **Evaluation results by subgroup,** retained for the provider's Section 1557 documentation.

## What This Means for the System You Build

- **Put a named clinician between the model and the patient** wherever you can; it's the line most rules draw.
- **Get consent before recording,** keep audio briefly, and link every generated sentence to its evidence.
- **Treat suggested codes and prior authorization packets as attestations** that need a person's acceptance, and monitor for drift toward higher levels.
- **Decide disclaimers by rule** from content class, review and the patient's state, and store what was applied.
- **Keep FDA's line in view:** analyzing images or signals is a device, and showing the basis keeps text decision support on the other side.
- **Document every predictive model's inputs and subgroup performance,** HTI-5 notwithstanding, because providers owe Section 1557 diligence.
- **Send PHI only to services a BAA names,** minimum necessary, and keep tools and connectors out of PHI-bearing agents.
- **Make every marketing number an evaluation result.**

## References

**Regulation and enforcement**

- [California Legislature: AB 3030 (Chapter 848, 2024)](https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240AB3030), generative AI patient communications, disclaimers, the review exemption and the definitions
- [California Legislature: SB 1120 (Chapter 879, 2024)](https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240SB1120), AI in utilization review and medical necessity decided by licensed professionals
- [Texas Legislature: SB 1188, enrolled text (89th Legislature)](https://capitol.texas.gov/tlodocs/89R/billtext/html/SB01188F.htm), AI for diagnostic purposes, review and disclosure
- [Texas Legislature Online: SB 1188 history](https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=SB1188), effective September 1, 2025
- [Nevada Legislature: AB 406, enrolled text (83rd Session, 2025)](https://archive.leg.state.nv.us/Session/83rd2025/Bills/AB/AB406_EN.pdf), AI and mental or behavioral health care, administrative-support use, penalties and the July 1, 2025 effective date
- [Utah Legislature: SB 149 (2024), Artificial Intelligence Amendments](https://le.utah.gov/~2024/bills/static/SB0149.html), signed March 13, 2024
- [Utah Legislature: SB 226 (2025), enrolled text](https://le.utah.gov/Session/2025/bills/enrolled/SB0226.pdf), disclosure in regulated occupations, high-risk interactions, the May 7, 2025 effective date and the July 1, 2027 repeal date
- [Colorado General Assembly: SB24-205](https://leg.colorado.gov/bills/sb24-205), the original AI Act and its February 1, 2026 duties
- [Colorado General Assembly: SB25B-004](https://leg.colorado.gov/bills/sb25b-004), the delay to June 30, 2026
- [Colorado General Assembly: SB26-189](https://leg.colorado.gov/bills/sb26-189), automated decision-making technology, signed May 14, 2026, duties and dates
- [Illinois General Assembly: HB 1806 bill status](https://www.ilga.gov/legislation/BillStatus.asp?DocNum=1806&GAID=18&DocTypeID=HB&SessionID=114), Public Act 104-0054, the therapy and AI restrictions and penalties
- [Texas Attorney General: settlement with Pieces Technologies (September 18, 2024)](https://www.texasattorneygeneral.gov/news/releases/attorney-general-ken-paxton-reaches-settlement-first-its-kind-healthcare-generative-ai-investigation), the accuracy claims and the disclosure terms
- [45 CFR 92.210 (Cornell LII)](https://www.law.cornell.edu/cfr/text/45/92.210), nondiscrimination in patient care decision support tools
- [Federal Register: HTI-5 final rule (October 28, 2026)](https://www.federalregister.gov/d/2026-21943), removal of source attributes and intervention risk management from § 170.315(b)(11), effective dates
- [ASTP/ONC: HTI-1 final rule](https://healthit.gov/regulations/hti-rules/hti-1-final-rule/), the decision support interventions criterion and algorithm transparency
- [ASTP/ONC: HTI-5 final rule removals or revisions of certification criteria (October 26, 2026)](https://healthit.gov/resources/hti-5-final-rule-removals-or-revisions-of-certification-criteria/), (b)(11) revised
- [21 U.S.C. 360j (Cornell LII)](https://www.law.cornell.edu/uscode/text/21/360j), subsection (o)(1)(E), the non-device clinical decision support criteria
- [21 U.S.C. 360e-4 (Cornell LII)](https://www.law.cornell.edu/uscode/text/21/360e-4), predetermined change control plans for devices
- [FDA: Clinical Decision Support Software guidance (January 2026)](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software), the final guidance on the non-device CDS criteria
- [FDA: Artificial Intelligence-Enabled Medical Devices list](https://www.fda.gov/medical-devices/artificial-intelligence-enabled-medical-devices/list-artificial-intelligence-enabled-medical-devices), scope, panels and foundation model tagging
- [CMS: WISeR model](https://www.cms.gov/priorities/innovation/innovation-models/wiser), dates, states, services and clinician decisions

**Vendors**

- [Microsoft: Dragon Copilot](https://www.microsoft.com/en-us/health-solutions/clinical-workflow/dragon-copilot), ambient capture, EHR embedding and availability
- [Abridge](https://www.abridge.com/), ambient documentation and health system count
- [AWS: HealthScribe](https://aws.amazon.com/healthscribe/), transcripts, speaker roles, evidence-linked notes and no retention
- [AWS: HIPAA eligible services reference](https://aws.amazon.com/compliance/hipaa-eligible-services-reference/), Bedrock, HealthScribe and Comprehend Medical as of October 15, 2026
- [Anthropic Privacy Center: Business associate agreements for commercial customers](https://privacy.claude.com/en/articles/8114513-business-associate-agreements-baa-for-commercial-customers), covered and excluded products and retention conditions
