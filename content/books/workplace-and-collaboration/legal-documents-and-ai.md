+++
title = "Legal Documents, DMS & AI"
description = "Matter-centric document management, email filing, confidentiality in the cloud under Opinion 477, generative AI under Opinion 512, fake citations and privilege."
category = "Workplace & Collaboration Industry"
order = 2059
part = "Law Firms and Professional Services"
tags = ["legal-tech", "document-management", "generative-ai", "confidentiality", "privilege"]
+++

A law firm's work product is documents: pleadings, contracts, memos, due diligence reports, and the email that surrounds them. Large firms keep them in a **document management system** (DMS), not in a general file-sharing product, for reasons that come straight from the rules: every document has to be filed to a client and matter, access has to follow the matter's walls, versions have to be preserved, email has to be filed alongside the documents it discusses, and the firm has to be able to show it made reasonable efforts to keep all of it confidential. A general-purpose drive organized by person and folder does none of that by default.

Generative AI added two problems on top. A tool that reads the firm's documents to answer questions has to respect the same walls and confidentiality duties as a person, and the ABA has said when client consent is needed before client information goes into one. And a tool that drafts can invent authority: lawyers have been sanctioned for filing briefs with citations to cases that don't exist. Both problems are now part of what a legal DMS and a legal AI product have to be built around.

This chapter covers document management for firms, email filing, confidentiality in the cloud, generative AI under the ABA's guidance, fabricated citations, and privilege. The matter as a container is in [How the Records Map to the Core Model](/books/workplace-and-collaboration/law-firms-and-professional-services#how-the-records-map-to-the-core-model); walls are in [Ethical Walls](/books/workplace-and-collaboration/matters-intake-and-conflicts#ethical-walls). Retention, holds and discovery exports follow the Part 9 chapters [Retention & Legal Hold](/books/workplace-and-collaboration/retention-and-legal-hold) and [eDiscovery & Export](/books/workplace-and-collaboration/ediscovery-and-export), and permission-aware AI over workplace content in general is the Part 8 chapter [AI Assistants Over Company Data](/books/workplace-and-collaboration/ai-assistants).

## How the Platforms Do It

As of October 2026, from vendor documentation. Document management:

| Vendor | Matter organization | Email | Security and walls | AI |
| --- | --- | --- | --- | --- |
| **iManage** (Work) | Libraries (the docs use "library and database" synonymously) containing workspaces; matters are presented as workspaces | File email and attachments from Outlook; link Outlook folders to iManage folders and keep them in sync | Access levels Full Access, Read/Write, Read Only, No Access; items inherit the container's security by default; Security Policy Manager for walls and need-to-know | Ask iManage gives cited answers from the repository "without moving documents outside of the trusted iManage platform" and in line with permissions |
| **NetDocuments** | Workspaces per matter or project | "Connect emails automatically to the right matter or project": predictive filing, folder mapping, and Send & File that files a message as it's sent | Security policies on workspaces, documents and users for ethical walls | ndMAX Legal AI Assistant and an AI App Builder |

Legal AI tools:

| Tool | What its vendor says it is |
| --- | --- |
| **Harvey** | "AI software for legal and professional services," with products including Vault, Knowledge, Agents and Spaces |
| **Thomson Reuters CoCounsel Legal** | Research, analysis and drafting "grounded in trusted Westlaw and Practical Law content," with Deep Research and agentic planning |
| **Vincent by Clio** (formerly vLex Vincent) | AI over Clio's legal database of over one billion documents from more than 100 countries; zero-retention agreements with LLM providers |
| **LexisNexis Protégé** | LexisNexis's AI assistant brand, extended in 2025 to CounselLink+ for matter and invoice summaries |
| **Intapp** | "Walls for AI" and Celeste, an "agentic AI coworker," among its products |

Three patterns:

- **The DMS keeps the AI inside its walls.** iManage says data processed by its AI "stays on the iManage platform" and answers align with "your permissions, security standards, and governance policies"; NetDocuments puts its assistant over the documents already in workspaces. The selling point is that AI doesn't create a second copy of client documents with different access rules.
- **Research tools ground on curated content.** CoCounsel grounds on Westlaw and Practical Law, Vincent on Clio's legal database. Grounding narrows hallucination; the research below shows it doesn't eliminate it.
- **Walls extend to AI as a product feature.** Intapp lists Walls for AI next to Walls; a wall that stops a screened lawyer at the DMS but not at the assistant isn't a wall.

## The Matter Workspace

A DMS organizes documents by client and matter first. The vocabulary varies (iManage libraries, workspaces and folders; NetDocuments workspaces), and what a matter DMS needs is the same:

- **A workspace per matter,** created when the matter opens, named and numbered from the matter record, with a standard folder template (correspondence, pleadings, drafts, research, agreements).
- **Profiles on every document.** Each document carries metadata: client and matter number, document type, author, dates, a document number that's stable across versions, and version history. Search and retention run on the profile.
- **Security inherited from the workspace.** iManage's default is that "items added to a container inherit the security settings of the container," with explicit levels per user or group (Full Access, Read/Write, Read Only, No Access). Inheritance is what lets a wall placed on a matter cover every document in it without touching each one.
- **Versions, not copies.** A redline is a new version of the same document number, not a new file named "v7 final FINAL." Version history is the record of who changed what, which matters in disputes about what a draft said.
- **Check-out and locking** for documents edited outside the browser, in my view, so two lawyers don't produce divergent versions of the same agreement.

In the [core model](/books/workplace-and-collaboration/workplace-business#the-core-data-model), the matter workspace is the matter container itself, documents are `items` of kind file with `item_versions` for each version, and the DMS profile is a kind-specific extension. The firm's general workplace tools (chat channels for the matter, meeting recordings) can hang off the same container, which is how a firm gets one place to apply walls, retention and holds.

## Email Filing

Most of a matter's record arrives by email, and email lives in personal mailboxes organized by person. Email filing moves each relevant message into the matter workspace so that it's searchable, governed and preserved with the rest of the matter.

How the DMS vendors approach it:

- **From the mail client.** iManage Work for Outlook lets users "file emails and attachments directly to the iManage platform from within Outlook," and lets Outlook folders be linked to DMS folders and kept in sync.
- **Predictive and rule-based filing.** NetDocuments describes "predictive email filing or folder mapping" that can "automatically file emails into the right place within the DMS," and says "any emails moved into a mapped folder will automatically be filed."
- **Filing on send.** NetDocuments' Send & File "allows users to file emails automatically as they are sent," linked to the right workspace or folder.

What a filing system has to get right:

- **One message, filed once per matter.** The same email arrives in ten mailboxes. Filing dedupes on the message's identity (the Message-ID header, plus a content hash for messages without one) so the workspace holds one copy with a record of who filed it.
- **Suggestions are suggestions.** A predicted matter is shown to the user, who confirms; automatic filing to the wrong matter puts one client's information in another client's workspace, possibly behind a different wall.
- **Attachments become documents.** An attached draft filed with the email is also profiled as a document in the workspace, linked to the message.
- **The wall is checked at filing.** A screened lawyer can't file into a matter they're walled from, and a message filed to a walled matter isn't visible to them through the DMS's search even though they might have received a copy.

## Confidentiality in the Cloud

The ABA's position on cloud services follows from Model Rule 1.6(c) rather than from any rule about the cloud: "A lawyer shall make reasonable efforts to prevent the inadvertent or unauthorized disclosure of, or unauthorized access to, information relating to the representation of a client." Comment [18] makes that a judgment with factors (sensitivity, likelihood of disclosure without more safeguards, cost and difficulty of safeguards, and whether they make software "excessively difficult to use") and says an unauthorized disclosure isn't a violation "if the lawyer has made reasonable efforts to prevent the access or disclosure." Comment [19] adds, for transmitting communications, that special security measures aren't required "if the method of communication affords a reasonable expectation of privacy," but "special circumstances, however, may warrant special precautions," and a client may require more or consent to less.

The formal opinions apply the same standard to technology over time. From the ABA's index of opinions by issue date:

- **Formal Opinion 99-413** (March 10, 1999), "Protecting the Confidentiality of Unencrypted E-Mail."
- **Formal Opinion 06-442** (August 5, 2006), "Review and Use of Metadata," and 05-437 and 06-440 on inadvertently disclosed and unsolicited privileged materials.
- **Formal Opinion 08-451** (August 5, 2008), on outsourcing legal and nonlegal support services, which Opinion 512 quotes: a lawyer may outsource "provided the lawyer remains ultimately responsible for rendering competent legal services."
- **Formal Opinion 11-459** (August 4, 2011), "Duty to Protect the Confidentiality of E-mail Communications with One's Client."
- **Formal Opinion 477** (May 11, 2017), "Securing Communication of Protected Client Information," which Opinion 512 cites for a "reasonable efforts standard" and a "fact-specific approach," rejecting a list of specific required security measures.
- **Formal Opinion 483** (October 17, 2018), "Lawyers' Obligations After an Electronic Data Breach or Cyberattack."

What this means for a vendor selling to firms:

- **There's no checkbox.** Because the standard is reasonableness under the circumstances, firms evaluate vendors themselves (the supervision duty of Model Rule 5.3 covers the vendor) and document why. The vendor's security documentation, certifications, subprocessor list and contract terms are the firm's evidence; the Part 9 chapter [Certifications & Procurement Assurance](/books/workplace-and-collaboration/compliance-certifications) covers what those usually are.
- **Clients raise the bar.** Comment [18] says a client "may require the lawyer to implement special security measures not required by this Rule." Corporate clients do this in outside counsel guidelines, so a firm may need customer-managed keys, data residency or restrictions on AI for one client and not another. The DMS has to support per-matter or per-client controls, not only firm-wide ones. Encryption options are in the Part 9 chapter [Encryption & Customer-Managed Keys](/books/workplace-and-collaboration/encryption-and-customer-keys).
- **Breach response is a professional duty.** Opinion 483 exists because a firm's obligations after an incident include duties to clients, so the vendor's incident notification terms and logs are part of what the firm buys.

## Generative AI

**ABA Formal Opinion 512** (July 29, 2024) is the ABA's first formal opinion on generative AI, a 15-page opinion that applies existing rules rather than creating new ones. Its summary lists the duties in play: "to provide competent legal representation, to protect client information, to communicate with clients, to supervise their employees and agents, to advance only meritorious claims and contentions, to ensure candor toward the tribunal, and to charge reasonable fees." What each means for a tool:

- **Competence (Rule 1.1).** Lawyers "should either acquire a reasonable understanding of the benefits and risks of the GAI tools that they employ in their practices or draw on the expertise of others"; "uncritical reliance on content created by a GAI tool can result in inaccurate legal advice to clients or misleading representations to courts and third parties." Output must be checked, and the degree depends on the task.
- **Confidentiality (Rule 1.6).** Self-learning tools, which use inputs to improve outputs for others, "raise the risk that information relating to one client's representation may be disclosed improperly, even if the tool is used exclusively by lawyers at the same firm." For those tools, "a client's informed consent is required prior to inputting information relating to the representation," and "merely adding general, boiler-plate provisions to engagement letters purporting to authorize the lawyer to use GAI is not sufficient." The opinion extends the same protection to former and prospective clients' information.
- **Communication (Rule 1.4).** Whether a lawyer must disclose GAI use or get consent depends on the facts, and "there are also situations where Model Rule 1.4 requires lawyers to discuss their use of GAI tools unprompted by the client."
- **Supervision (Rules 5.1 and 5.3).** "Managerial lawyers must establish clear policies regarding the law firm's permissible use of GAI," and supervisory lawyers must make reasonable efforts to ensure compliance by lawyers and nonlawyers.
- **Fees (Rule 1.5).** Hourly billing must reflect actual time; a lawyer "may not charge a client to learn about how to use a GAI tool or service that the lawyer will regularly use for clients"; tools that function like general office equipment are overhead absent advance disclosure ([Time Entry](/books/workplace-and-collaboration/time-billing-and-ledes#time-entry)).

The opinion's distinction between self-learning tools and others is the one a product has to make legible. A firm admin deciding whether a tool needs client consent needs to know, from the vendor's terms: whether inputs or outputs are used to train or improve models for anyone else; whether they're retained, where and for how long; whether other customers or the vendor's staff can see them; and whether the tool's index of firm content respects matter permissions and walls. Vendors now state these terms directly (Vincent by Clio's zero-retention agreements with LLM providers, iManage's statement that its AI processing stays on its platform), and the firm's AI policy maps each tool to what it may be used for.

The duties land on the firm's admin as configuration:

- **An approved-tools list** with each tool's data terms and the uses allowed (public research only, firm documents, client documents with consent).
- **Per-client consent records** where a tool needs them, specific to the tool, not a clause in the engagement letter.
- **Per-client restrictions** from outside counsel guidelines, some of which prohibit AI on the client's matters or require disclosure.
- **Permission-trimmed retrieval** so the assistant can only read what the user can, including walls ([The Lethal Trifecta](/docs/security/ai-security#the-lethal-trifecta) covers why an assistant that reads private data, sees untrusted content and can send data out needs more than permissions).

## Fabricated Citations

The risk the courts have acted on is invented authority. In *Mata v. Avianca, Inc.*, No. 22-cv-1461 (S.D.N.Y.), Judge P. Kevin Castel's Opinion and Order on Sanctions of June 22, 2023 begins: "Technological advances are commonplace and there is nothing inherently improper about using a reliable artificial intelligence tool for assistance. But existing rules impose a gatekeeping role on attorneys to ensure the accuracy of their filings." The court found that the respondents "abandoned their responsibilities when they submitted non-existent judicial opinions with fake quotes and citations created by the artificial intelligence tool ChatGPT, then continued to stand by the fake opinions after judicial orders called their existence into question." Under Rule 11, or alternatively its inherent authority, it ordered letters to the client and to each judge falsely named as the author of a fake opinion, and imposed a $5,000 penalty, jointly and severally, on the two lawyers and their firm, payable within 14 days.

Specialized tools reduce the problem without removing it. A Stanford study of legal research tools (Magesh and others, "Hallucination-Free? Assessing the Reliability of Leading AI Legal Research Tools," 2024) found that the AI research tools from LexisNexis and Thomson Reuters "each hallucinate between 17% and 33% of the time," fewer than general-purpose chatbots but far from zero; Stanford HAI's write-up reported more than 17% for Lexis+ AI and Ask Practical Law AI and more than 34% for Westlaw's AI-Assisted Research, against 58% to 82% for general-purpose chatbots in its earlier study.

For a product, the lesson is that verification is a feature:

- **Every citation in generated text links to the source** in the tool's corpus, and a citation that doesn't resolve is marked unverified, not silently dropped.
- **Quoted language is checked against the source** text, because Mata's fake opinions came with fake quotes.
- **A filing workflow records verification:** who checked each authority, against what, when. That record is the evidence of the "gatekeeping role" the court described.
- **Model output is labeled** as generated in the document's history, so a reviewer knows which passages need checking ([Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions)).

## Privilege

Confidentiality and privilege overlap but aren't the same. Model Rule 1.6's Comment [3] separates "the attorney-client privilege, the work product doctrine and the rule of confidentiality established in professional ethics": privilege and work product apply when evidence is compelled in proceedings, while the confidentiality duty "applies not only to matters communicated in confidence by the client but also to all information relating to the representation, whatever its source." A DMS protects both, and has to support the second's procedures.

- **Who counts.** *Upjohn Co. v. United States*, 449 U.S. 383 (1981), rejected the "control group test" for corporate clients, holding that communications from lower-level employees to counsel at management's direction can be privileged, and that the privilege "only protects disclosure of communications; it does not protect disclosure of the underlying facts." For a firm's system, that means privilege is a property of communications and documents, recorded as metadata, not a property of the people involved.
- **Inadvertent disclosure.** Federal Rule of Evidence 502(b) provides that a disclosure in a federal proceeding doesn't waive privilege if it "is inadvertent," the holder "took reasonable steps to prevent disclosure," and the holder "promptly took reasonable steps to rectify the error." Rule 502(g) defines work product as "tangible material (or its intangible equivalent) prepared in anticipation of litigation or for trial." The "reasonable steps" are partly the firm's systems: privilege designations on documents, review before production, and the ability to find and claw back what went out.
- **Designations as data.** A document's profile records whether it's privileged, work product or neither, the basis, and who designated it. Those designations feed the privilege log in discovery (the Part 9 chapter [eDiscovery & Export](/books/workplace-and-collaboration/ediscovery-and-export#privilege-and-clawback) covers review and production).
- **AI and privilege.** Whether sending privileged material to a third-party AI service risks waiver is not something the ABA's opinion resolves; Opinion 512 addresses confidentiality and consent. <!-- source-gap: wc-ai-privilege-waiver | missing | whether use of third-party GAI services can waive attorney-client privilege | closes with: a court decision or bar opinion addressing privilege waiver through GAI or cloud processing | checked: 2026-10-29 --> My default is to treat a tool that keeps inputs only for the firm, under contract, like any other vendor the firm supervises, and a self-learning or retaining tool as outside the privilege boundary until a court says otherwise.

## How to Build It

Deltas against the book's [core data model](/books/workplace-and-collaboration/workplace-business#the-core-data-model) (documents are `items` with `files` and `item_versions`; the matter workspace is the matter container) and the earlier chapters in this part. This chapter owns document profiles, email filings, privilege designations and the firm's AI controls.

```sql
CREATE TABLE document_profiles (               -- the DMS profile on a file item
  item_id          UUID PRIMARY KEY REFERENCES items (id),
  matter_id        UUID NOT NULL REFERENCES matters (container_id),
  doc_number       BIGINT NOT NULL,              -- stable across versions
  doc_type         TEXT NOT NULL,                -- 'pleading', 'agreement', 'memo', 'correspondence', ...
  author_member_id UUID REFERENCES members (id),
  checked_out_by   UUID REFERENCES members (id),
  checked_out_at   TIMESTAMPTZ,
  generated_by_tool TEXT,                        -- set when a GAI tool produced the first draft
  UNIQUE (matter_id, doc_number)
);

CREATE TABLE email_filings (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  matter_id        UUID NOT NULL REFERENCES matters (container_id),
  message_item_id  UUID NOT NULL REFERENCES items (id),     -- the one filed copy
  rfc5322_message_id TEXT,
  content_hash     BYTEA NOT NULL,
  method           TEXT NOT NULL CHECK (method IN ('manual', 'folder_mapping', 'on_send', 'suggested')),
  suggestion_confidence REAL,
  filed_by         UUID NOT NULL REFERENCES members (id),
  confirmed_at     TIMESTAMPTZ,                  -- required when method = 'suggested'
  filed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (matter_id, content_hash)
);

CREATE TABLE privilege_designations (
  item_id          UUID NOT NULL REFERENCES items (id),
  designation      TEXT NOT NULL CHECK (designation IN ('attorney_client', 'work_product', 'both', 'none')),
  basis            TEXT,
  designated_by    UUID NOT NULL REFERENCES members (id),
  designated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  superseded_at    TIMESTAMPTZ,
  PRIMARY KEY (item_id, designated_at)
);

CREATE TABLE ai_tools (                          -- the firm's approved-tools list
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id     UUID NOT NULL REFERENCES workspaces (id),
  app_id           UUID REFERENCES apps (id),     -- when the tool is an installed app
  name             TEXT NOT NULL,
  trains_on_inputs BOOLEAN NOT NULL,              -- self-learning in Opinion 512's sense
  retains_inputs   INTERVAL,                      -- null when zero retention
  processing_region TEXT,
  reads_firm_content BOOLEAN NOT NULL,            -- retrieval over the DMS
  allowed_use      TEXT NOT NULL CHECK (allowed_use IN ('public_only', 'firm_content',
                     'client_content_with_consent', 'client_content')),
  terms_item_id    UUID REFERENCES items (id),    -- the vendor terms reviewed
  approved_by      UUID NOT NULL REFERENCES members (id),
  approved_at      TIMESTAMPTZ NOT NULL
);

CREATE TABLE ai_client_permissions (             -- per-client consent or prohibition
  client_id        UUID NOT NULL REFERENCES clients (id),
  ai_tool_id       UUID NOT NULL REFERENCES ai_tools (id),
  matter_id        UUID REFERENCES matters (container_id),   -- null for all the client's matters
  status           TEXT NOT NULL CHECK (status IN ('consented', 'prohibited', 'disclosure_required')),
  source           TEXT NOT NULL CHECK (source IN ('client_consent', 'outside_counsel_guidelines')),
  evidence_item_id UUID REFERENCES items (id),    -- the signed consent or the guideline
  valid_during     TSTZRANGE NOT NULL
);

CREATE TABLE ai_citation_checks (                -- verification of generated authority
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id          UUID NOT NULL REFERENCES items (id),       -- the draft
  item_version_id  UUID NOT NULL REFERENCES item_versions (id),
  citation_text    TEXT NOT NULL,
  resolved_source  TEXT,                          -- reporter cite or database ID, null if unresolved
  quote_matches    BOOLEAN,
  checked_by       UUID REFERENCES members (id),
  checked_at       TIMESTAMPTZ,
  status           TEXT NOT NULL CHECK (status IN ('unverified', 'verified', 'not_found', 'misquoted'))
);
```

The check an assistant runs before reading a document on a user's behalf combines the platform's grants, the walls, and the firm's AI rules for the client:

```sql
SELECT d.item_id
FROM document_profiles d
JOIN matters m ON m.container_id = d.matter_id
JOIN ai_tools t ON t.id = :tool_id
WHERE d.item_id = ANY(:candidate_item_ids)
  AND has_access(:member_id, 'container', m.container_id)      -- allow grants minus deny grants
  AND t.allowed_use IN ('firm_content', 'client_content_with_consent', 'client_content')
  AND NOT EXISTS (SELECT 1 FROM ai_client_permissions p
                  WHERE p.client_id = m.client_id AND p.ai_tool_id = t.id
                    AND (p.matter_id IS NULL OR p.matter_id = m.container_id)
                    AND p.status = 'prohibited' AND p.valid_during @> NOW())
  AND (t.allowed_use <> 'client_content_with_consent'
       OR EXISTS (SELECT 1 FROM ai_client_permissions p
                  WHERE p.client_id = m.client_id AND p.ai_tool_id = t.id
                    AND (p.matter_id IS NULL OR p.matter_id = m.container_id)
                    AND p.status = 'consented' AND p.valid_during @> NOW()));
```

How it runs:

1. **Every file item in a matter container gets a profile** in the same transaction, numbered within the matter; versions are `item_versions`, and the document number survives them.
2. **Email filing dedupes by message identity and content hash,** checks the filer's access to the matter (walls included), and requires confirmation for predicted matters.
3. **AI access is checked per document at retrieval time** with the query above (deny grants from walls override; client prohibitions and missing consents exclude), never by indexing a matter into a shared AI index with weaker rules.
4. **Generated drafts are marked,** and citations in them are extracted into `ai_citation_checks`; a document with unverified citations can't move to a filing status.
5. **Privilege designations are append-only,** and production exports read the current designation and log what was withheld.

## Auditing

- **Document access:** every open, download, share and export of a matter document, by whom and through which client (web, desktop, API, AI tool), with walled-matter access attempts called out ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **Email filing:** what was filed where, by whom, by which method, and corrections of misfiled messages.
- **AI use:** the tool, the user, the matter, the documents retrieved, whether consent or a prohibition applied, and the output stored, so the firm can show its supervision under Opinion 512.
- **Citation verification:** each authority in a generated draft, its resolution and who checked it before filing.
- **Vendor review:** the firm's evaluation of each DMS and AI vendor's terms and controls, the reasonable-efforts record under Rule 1.6(c).
- **Privilege:** every designation and change, and every privileged item included in or withheld from a production.

## What This Means for the System You Build

- **Organize documents by matter workspace,** with profiles, stable document numbers and versions, and security inherited from the matter.
- **Make email filing deduplicated and confirmed,** with walls checked at filing, not only at viewing.
- **Support per-client security requirements,** because clients can demand more than the firm's defaults.
- **Classify every AI tool by Opinion 512's distinctions** (trains on inputs, retains them, reads firm content) and gate its use per client with specific consents and prohibitions.
- **Check AI retrieval per document, per user, at query time,** with walls as deny grants.
- **Treat citation verification as a workflow** with a record, and block filing drafts with unverified authority.
- **Record privilege as document metadata,** append-only, ready for review and clawback.

## References

**ABA Model Rules and opinions**

- [ABA Model Rule 1.6: Confidentiality of Information](https://www.americanbar.org/groups/professional_responsibility/publications/model_rules_of_professional_conduct/rule_1_6_confidentiality_of_information/), the reasonable-efforts duty in paragraph (c)
- [ABA Model Rule 1.6, Comment](https://www.americanbar.org/groups/professional_responsibility/publications/model_rules_of_professional_conduct/rule_1_6_confidentiality_of_information/comment_on_rule_1_6/), Comment [3] on privilege, work product and confidentiality, and Comments [18] and [19] on safeguards and transmission
- [ABA Model Rule 1.1, Comment](https://www.americanbar.org/groups/professional_responsibility/publications/model_rules_of_professional_conduct/rule_1_1_competence/comment_on_rule_1_1/), technology competence
- [ABA Model Rule 5.3: Responsibilities Regarding Nonlawyer Assistance](https://www.americanbar.org/groups/professional_responsibility/publications/model_rules_of_professional_conduct/rule_5_3_responsibilities_regarding_nonlawyer_assistant/), supervision of vendors and assistants
- [ABA Formal Ethics Opinions: Index by Issue Dates](https://www.americanbar.org/groups/professional_responsibility/publications/ethics_opinions/index_by_issue_dates/), titles and dates of Opinions 99-413, 05-437, 06-440, 06-442, 08-451, 11-459, 477 and 483
- [ABA Formal Opinion 512 (July 29, 2024), copy of the ABA PDF](https://www.lawnext.com/wp-content/uploads/2024/07/aba-formal-opinion-512.pdf), the duties, self-learning tools, informed consent, boilerplate, communication, supervision, fees, and its descriptions of Opinions 477 and 08-451
- [ABA: ABA issues first ethics guidance on a lawyer's use of AI tools (July 29, 2024)](https://www.americanbar.org/news/abanews/aba-news-archives/2024/07/aba-issues-first-ethics-guidance-ai-tools/), the opinion's date, length and rules applied

**Court records and law**

- [Mata v. Avianca, Inc., No. 22-cv-1461, Opinion and Order on Sanctions (S.D.N.Y. June 22, 2023), ECF No. 54](https://storage.courtlistener.com/recap/gov.uscourts.nysd.575368/gov.uscourts.nysd.575368.54.0.pdf), the gatekeeping passage, the findings and the sanctions
- [Upjohn Co. v. United States, 449 U.S. 383 (1981)](https://www.law.cornell.edu/supremecourt/text/449/383), rejection of the control group test and communications versus facts
- [Federal Rule of Evidence 502](https://www.law.cornell.edu/rules/fre/rule_502), inadvertent disclosure under 502(b) and definitions under 502(g)

**Research**

- [Magesh et al., "Hallucination-Free? Assessing the Reliability of Leading AI Legal Research Tools" (arXiv 2405.20362)](https://arxiv.org/abs/2405.20362), the 17% to 33% hallucination finding
- [Stanford HAI: AI on Trial: Legal Models Hallucinate in 1 out of 6 (or More) Benchmarking Queries](https://hai.stanford.edu/news/ai-trial-legal-models-hallucinate-1-out-6-or-more-benchmarking-queries), the per-tool rates and the earlier chatbot study

**Vendor documentation**

- [iManage](https://imanage.com/), the platform's positioning
- [iManage Work: Document and email management](https://imanage.com/imanage-products/document-email-management/work/), email management integrated with Outlook and security protections
- [iManage Work for Outlook Help](https://docs.imanage.com/cloud/work-outlook-help/en-US/iManage_Work_for_Outlook_Help.html), filing email and attachments from Outlook and linked folders
- [iManage Work Help](https://docs.imanage.com/cloud/work-web-help/en-US/iManage_Work_Help.html), libraries and databases, matters as workspaces
- [iManage Work Help: Managing security](https://docs.imanage.com/cloud/work-web-help/en-US/Managing_security.html), access levels and inheritance from containers
- [iManage Security Policy Manager](https://imanage.com/imanage-products/security-governance/security-policy-manager/), ethical walls and need-to-know policies
- [Ask iManage](https://imanage.com/imanage-products/the-imanage-platform/ai/ask-imanage/), cited answers, permissions and data staying on the platform
- [NetDocuments](https://www.netdocuments.com/), the platform's positioning
- [NetDocuments: Email management](https://www.netdocuments.com/solutions/email-management/), predictive filing, folder mapping and Send & File
- [NetDocuments: Ethical Walls](https://www.netdocuments.com/solutions/ethical-walls/), security policies for walls
- [NetDocuments: ndMAX Legal AI Assistant](https://www.netdocuments.com/solutions/legal-ai-assistant/), AI over workspace documents and the App Builder
- [Harvey](https://www.harvey.ai/), the product and its modules
- [Thomson Reuters CoCounsel Legal](https://legal.thomsonreuters.com/en/products/cocounsel-legal), grounding on Westlaw and Practical Law, Deep Research and agentic planning
- [Vincent by Clio](https://vlex.com/vincent-ai), the database, jurisdictions and zero-retention agreements
- [LexisNexis: Protégé in CounselLink (September 16, 2025)](https://www.lexisnexis.com/community/amp-pressroom/lexisnexis-announces-protege-in-counsellink-for-actionable-matter-and-invoice-insights), Protégé as LexisNexis's AI assistant
- [Intapp Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1565687/000156568726000073/inta-20260630.htm), Walls for AI and Celeste
