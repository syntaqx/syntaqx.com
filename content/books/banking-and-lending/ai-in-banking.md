+++
title = "AI in Banking & Lending"
description = "Models and agents across a bank, October 2026: underwriting, fraud, servicing and collections agents, rights a chat triggers, explanation limits, governance."
category = "Banking & Lending Industry"
order = 2474
part = "Running the Platform"
tags = ["banking", "lending", "ai", "generative-ai", "model-risk", "fair-lending", "collections"]
+++

Banks were early users of models and have been regulated as users of models for fifteen years: credit scores, fraud scores, AML monitoring, loss forecasting and stress tests all run on them, and model risk management, adverse action and fair lending law were written around them. What arrived since 2023 is a different kind of system: large language models that read documents, talk to customers, draft notes and narratives, and increasingly act as agents with tools. They sit awkwardly in the existing framework. The banking agencies' 2026 model risk guidance excludes generative and agentic AI from its scope; the consumer protection laws don't exclude anything, and a chatbot that misstates a fee, misses a dispute or calls a debtor at the wrong hour is the bank's conduct.

This chapter maps where models decide and where they assist across a bank or lender, what the large institutions have published, and the banking twist on each use: underwriting, fraud and financial crime, servicing assistants and the legal rights a conversation can trigger, collections, explanation and fair lending limits, and governance. The payments uses (fraud scoring at authorization, authorization optimization, disputes, agentic payments and mandates) are [AI in Payments](/books/payments/ai-in-payments), and AI in a store is [AI in Commerce](/books/commerce/ai-in-commerce). Model governance in depth is [Model Risk Management](/books/banking-and-lending/model-risk); reasons from models are [Reasons From Machine-Learning Models](/books/banking-and-lending/adverse-action#reasons-from-machine-learning-models). The general engineering of agents (narrow tools, decisions in code, identity before account actions, evals, handoff) is [AI Agents in the Product](/docs/architecture/ai-agents), and defending them is [AI & LLM Security](/docs/security/ai-security). The chapter extends `credit_decisions` and `cases`, and adds `ai_use_cases`, `assistant_sessions`, `assistant_actions`, `rights_signals` and `assistant_evaluations`.

## Where Models Decide

| Use | Kind of model | What it decides or proposes | What stays deterministic | Owning chapter |
| --- | --- | --- | --- | --- |
| **Credit underwriting and pricing** | Scorecards and machine learning | A probability of default, a grade, a price | Policy rules, partner criteria, reason codes, the notice | [Underwriting & Decision Engines](/books/banking-and-lending/decision-engines) |
| **Line management** | Machine learning | Increases, decreases, authorizations over limit | Regulation Z notice rules, ability-to-pay checks | [Credit Cards as Credit](/books/banking-and-lending/credit-cards#credit-limits) |
| **Document extraction** | LLMs and OCR | Income, employer, balances from pay stubs, statements, tax returns | What counts as verified; the underwriter's sign-off | [Loan Origination](/books/banking-and-lending/loan-origination#documents-and-verification-services) |
| **Fraud and account takeover** | Machine learning, device and behavior signals | A risk score per login, change or payment | Step-up rules, holds, payment interventions | [Account Takeover & Scams](/books/banking-and-lending/account-takeover-and-scams) |
| **AML monitoring** | Rules plus models for alert scoring | Which alerts to work first, a draft narrative | The SAR decision, the deadline, confidentiality | [BSA/AML Programs](/books/banking-and-lending/bsa-aml) |
| **Customer service assistants** | LLMs with tools | Answers, summaries, proposed actions | Fees, refunds, disputes opened, money moved | This chapter |
| **Collections** | Propensity models, LLM agents | Who to contact, when, with what offer | Contact limits, hardship terms, legal holds | [Collections & Recovery](/books/banking-and-lending/collections) |
| **Complaints and QA** | LLM classification | Which conversations are complaints, which rights were raised | The complaint record and its clock | [Errors & Disputes on Deposit Accounts](/books/banking-and-lending/deposit-errors-and-disputes#complaints) |
| **Loss forecasting** | Statistical and ML models | Expected losses for CECL and stress tests | The allowance as approved and booked | [Credit Losses & CECL](/books/banking-and-lending/credit-losses-and-cecl) |

The line through every row is the playbook's: the model scores, extracts, drafts or proposes, and code the institution can read and change decides ([Decide in Code](/docs/architecture/ai-agents#decide-in-code)). In banking the line is drawn by law as much as by money. A model may suggest a hardship plan; the plan's terms, the disclosures and the stop on collection activity are rules. A model may draft a SAR narrative; whether to file is a person's determination with a clock.

## How the Platforms Do It

What institutions and lenders have published, as of October 2026. Figures are the companies' own:

| Company | System | What it has published |
| --- | --- | --- |
| **Bank of America** | Erica, a virtual assistant since 2018; Erica for Employees | More than 3 billion client interactions and nearly 50 million users since launch, averaging more than 58 million interactions a month, and more than 1.7 billion "proactive, personalized insights" (August 2025); the employee version is used by over 90% of employees and cut IT service desk calls by 50% |
| **Capital One, Bank of America and the largest banks** | Chatbots in retail banking | The CFPB's 2023 review found all of the top ten US commercial banks using chatbots, naming Capital One's Eno and Erica, and estimated that about 37% of the US population used a bank's chatbot in 2022 |
| **Klarna** | An AI assistant for customer service (February 2024) | In its first month, 2.3 million conversations, "two-thirds" of its service chats, the work of about 700 full-time agents, resolution in about 2 minutes against 11, 25% fewer repeat inquiries, and an estimated $40 million profit improvement for 2024 |
| **Upstart** | Machine-learning underwriting for bank and credit union partners | 91% of 2025 loans fully automated, with partners' credit criteria as hard limits ([Automation Rates](/books/banking-and-lending/decision-engines#automation-rates)) |

What the table says: **assistants are mostly informational.** Bank of America's release describes insights, alerts and guidance, not money movement; the first deployments answer, route and summarize. **Volume is the case for them,** in interactions a month and service minutes saved. **Underwriting automation is older and further along,** because it sits inside a governance framework that already existed. And the CFPB's review is the warning attached to all of it: chatbots that give wrong answers, can't recognize when a customer is invoking a legal right, and trap customers in loops without a person.

## Underwriting

Machine learning in credit decisions is governed as a model and explained as a decision, and both are covered where they live: validation, monitoring and the 2026 guidance in [Model Risk Management](/books/banking-and-lending/model-risk#machine-learning-and-llms-in-credit); policy, score and price in [Policy, Then Score, Then Price](/books/banking-and-lending/decision-engines#policy-then-score-then-price); notices and reasons in [Adverse Action & Explaining Decisions](/books/banking-and-lending/adverse-action). What generative AI adds to underwriting is mostly upstream of the decision:

- **Extraction is an input with provenance.** An LLM that reads income from a pay stub or recurring deposits from a bank statement produces a number that feeds DTI, ability to repay and HMDA's "income relied on." Each extracted value is stored with the document, the model version, a confidence and whether a person or a rule verified it, and a low-confidence value goes to review rather than into the decision ([Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions)).
- **Assistance is not decision.** An underwriter's copilot can summarize a file, flag inconsistencies and draft a credit memo; the decision record names the underwriter and the policy version, and the memo is a document in the file, not a reason code.
- **The LLM never picks the reasons.** Principal reasons come from the scoring model's attributions mapped to reason codes ([Building Reasons From Scorecards](/books/banking-and-lending/adverse-action#building-reasons-from-scorecards)); an LLM may phrase a customer letter around the codes, never choose them.

## Fraud and Financial Crime

Fraud models are the bank's oldest machine learning in production, and their payments side is [Fraud Scoring](/books/payments/ai-in-payments#fraud-scoring). On accounts, the twist is that generative AI helps the attackers as much as the defenders:

- **Deepfakes against the bank's own controls.** New York's DFS warned in October 2024 that AI makes phishing, vishing and smishing more convincing and can impersonate a customer or executive on audio and video, and advised against authentication by SMS, voice or video, in favor of certificates and physical keys, with liveness checks on biometrics. Voice authentication in the call center, a video call to approve a wire and a selfie at enrollment are the controls this attacks ([Security, Resilience & Incident Notice](/books/banking-and-lending/security-and-resilience#nydfs-part-500)).
- **Scams run on scripts.** The P2P and impersonation scams in [Account Takeover & Scams](/books/banking-and-lending/account-takeover-and-scams) scale with generated messages and cloned voices; the defense is the same set of interventions before the money moves, with models scoring which payments get one.
- **AML alert triage and narratives.** Models that rank alerts and LLMs that draft investigation summaries or SAR narratives cut the time an investigator spends per alert. Two rules hold: the SAR determination and its date are a person's ([Suspicious Activity Reports](/books/banking-and-lending/bsa-aml#suspicious-activity-reports)), and everything the model reads or writes about a SAR is SAR information, so the model, its prompts, its logs and its vendor sit inside the restricted boundary ([Confidentiality](/books/banking-and-lending/bsa-aml#confidentiality)).

## Servicing Assistants and the Rights a Chat Can Trigger

A customer service assistant at a bank is a support agent with one property a retailer's lacks: consumer finance law attaches duties to what customers say, and some of those duties start a clock the moment the customer says it. The CFPB's 2023 chatbot review named the failure: chatbots that "fail to recognize when a customer is invoking federal rights." The ones that matter most:

| What the customer says | What it can be | What starts |
| --- | --- | --- |
| "I didn't make this transfer" or "this debit is wrong" | A Regulation E notice of error, which may be oral and needs only enough to identify the account and the error | The 10-business-day investigation clock, at that message ([The Notice and the Clock](/books/banking-and-lending/deposit-errors-and-disputes#the-notice-and-the-clock)) |
| "I was charged twice on my card" | A billing error under Regulation Z if it arrives in writing at the creditor's designated address; otherwise a dispute the bank may handle anyway | The billing error clock when it qualifies ([Cardholder Disputes](/books/payments/issuer-processing#cardholder-disputes)) |
| "I'm filing a complaint" or a sustained grievance | A complaint, under the bank's complaint program and, for a program bank, the sponsor's | The complaint record and its response target ([Complaints](/books/banking-and-lending/deposit-errors-and-disputes#complaints)) |
| "I lost my job and can't pay" | A hardship request; for a mortgage, possibly a loss mitigation application | Hardship evaluation; Regulation X timelines for a mortgage ([Loss Mitigation](/books/banking-and-lending/mortgage-servicing#loss-mitigation)) |
| "I'm on active duty" | A Servicemembers Civil Relief Act request | The SCRA rate cap and protections ([The Servicemembers Civil Relief Act](/books/banking-and-lending/apr-and-rate-caps#the-servicemembers-civil-relief-act)) |
| "I filed for bankruptcy" | Notice of the automatic stay | A stop on collection activity ([Stays: Bankruptcy and the SCRA](/books/banking-and-lending/collections#stays-bankruptcy-and-the-scra)) |
| "Stop calling me" | A cease-communication request under Regulation F for a debt collector, a TCPA revocation for automated calls and texts | The contact stop ([Revoking Consent](/docs/compliance/consumer-contact#revoking-consent)) |

The design that follows:

- **Detect, then hand off with a case.** A classifier (rules plus a model) reads every turn for these signals; a detected signal opens the right case with the message's time as `cases.opened_at`, and either the assistant collects what the case needs or a person takes over. The assistant never decides that a message "wasn't really" a notice; ambiguous signals go to a person.
- **Recall over precision.** Missing a Reg E notice is a violation with a deadline already running; opening a case that turns out to be a question costs a few minutes. Tune the detector for recall and measure it on labeled conversations.
- **The assistant's promises are the bank's.** A misstated fee, a promised refund or a wrong deadline binds or misleads like an employee's would ([The AI's Promises Are the Business's Promises](/docs/architecture/ai-agents#the-ai-s-promises-are-the-business-s-promises)). Answers about fees, rates and rights come from the product version's terms through a tool, not from the model's memory of a policy page.
- **A person is always reachable.** The CFPB's review describes customers stuck "in repetitive loops"; the path to a human is a product feature with a measured time to reach it ([Human Handoff Is a Product Feature](/docs/architecture/ai-agents#human-handoff-is-a-product-feature)).
- **Identity before account actions.** The assistant reads and acts only within the authenticated session's entitlements, steps up for sensitive actions as the digital platform does, and never takes identity from what the customer types ([Identity Before Account Actions](/docs/architecture/ai-agents#identity-before-account-actions); [Authentication and the FFIEC Guidance](/books/banking-and-lending/digital-banking#authentication-and-the-ffiec-guidance)).
- **Actions are tools with keys.** Freezing a card, ordering a replacement, scheduling a transfer or opening a dispute are tools that call the same services the app does, with the same idempotency keys and step-up rules, and the decision to execute is code's ([Tools, Not Database Access](/docs/architecture/ai-agents#tools-not-database-access)).

## Collections

Collections is where AI meets the most specific conduct law in the volume. Who may be contacted, how often, at what hours, through which channels and with what disclosures is Regulation F for debt collectors, the TCPA for automated calls and texts, state law beyond both, and the SCRA and bankruptcy stays for protected borrowers ([Collections & Recovery](/books/banking-and-lending/collections#contact-strategy) owns the rules). What changes with models and agents:

- **AI voices are artificial voices.** The FCC's February 2024 declaratory ruling (FCC 24-17, CG Docket 23-362) confirms that the TCPA's restrictions on "artificial or prerecorded voice" encompass AI technologies that generate human voices, so such calls "require the prior express consent of the called party" absent an emergency purpose or exemption ([Artificial and AI Voices](/docs/compliance/consumer-contact#artificial-and-ai-voices)). An AI agent calling a delinquent borrower is a prerecorded-voice call for consent purposes, whatever it sounds like.
- **Telling people it's an AI.** The playbook's rule is to say so at the start, which also meets the state laws that require it in some contexts ([Telling People They're Talking to an AI](/docs/compliance/consumer-contact#telling-people-they-re-talking-to-an-ai)).
- **Contact limits are enforced outside the model.** A propensity model chooses who to call first; a contact ledger and rules decide whether a call is allowed at all (the frequency limit, the consumer's time zone, a cease request, a stay). The agent asks the gate; the gate answers ([One Outbound Gate](/docs/architecture/notifications#one-outbound-gate)).
- **Offers are terms.** A settlement, a payment plan or a hardship program the agent offers is a product with terms set in code, disclosed and recorded; the model chooses among offers the policy allows for that account, and never invents one.
- **Every conversation is a record.** Recordings and transcripts are kept as the collections and complaint rules require, and are personal data with retention limits ([Recordings and Transcripts Are Personal Data](/docs/architecture/ai-agents#recordings-and-transcripts-are-personal-data)).

## Explainability and Fair Lending Limits

Three legal limits shape which models a lender can use for credit, and none of them changed because guidance was withdrawn:

- **Reasons must be specific and accurate.** Regulation B requires the principal reasons for adverse action, specific enough to describe the factors actually considered. The CFPB's 2022 and 2023 circulars on complex models were withdrawn in May 2025; the regulation they interpreted wasn't ([The CFPB Circulars](/books/banking-and-lending/adverse-action#reasons-from-machine-learning-models)). A model whose decisions can't be explained in reasons can't be used to deny credit.
- **Discrimination law still applies, by more than one route.** The 2026 Regulation B rule changed the effects test under ECOA, but the Fair Housing Act, state law and the prohibition on proxies remain, so a lender still tests models for disparities and for variables standing in for a protected class ([Disparate Impact and the 2026 Reg B Rule](/books/banking-and-lending/fair-lending#disparate-impact-and-the-2026-reg-b-rule); [Fair Lending Testing](/books/banking-and-lending/fair-lending#fair-lending-testing)).
- **New AI statutes add their own duties.** Colorado repealed and reenacted its 2024 AI act as SB 26-189, signed May 14, 2026, covering automated decision-making technology used to materially influence consequential decisions including financial or lending services: notice to the consumer at the point of interaction, within 30 days after an adverse outcome a plain-language description of the technology's role, a right to request meaningful human review and to correct inaccurate data, and records kept three years. Developers' documentation duties start January 1, 2027, and the attorney general must adopt rules on the post-adverse-outcome disclosures by the same date. In the EU, creditworthiness assessment is a high-risk use under the AI Act, with obligations moved to December 2, 2027 by the Digital Omnibus ([AI in Payments](/books/payments/ai-in-payments#model-risk-fair-lending-and-udaap)).

<!-- source-gap: colorado-sb26-189-bank-exemption | status | whether SB 26-189 exempts banks and credit unions under federal or state prudential supervision, as SB 24-205 did, and when deployer duties take effect | closes with: the enacted text of SB 26-189 or attorney general rules | checked: 2026-10-30 -->

How the Colorado act applies to a bank depends on exemptions and effective dates in the enacted text that I could not confirm from the legislature's summary; a lender with Colorado applicants should read the act itself. The engineering consequence is the same either way: an adverse decision already produces reasons under Regulation B, and producing "the technology's role" and a human review path from the same decision record is a small addition if the record was built for it.

## Governance

The 2026 interagency model risk guidance (SR 26-2 and OCC Bulletin 2026-13, April 17, 2026) is risk-based, aimed at banks over $30 billion, and says generative and agentic AI are outside its scope, with a request for information on AI promised ([The Guidance in 2026](/books/banking-and-lending/model-risk#the-guidance-in-2026)). Treasury's December 2024 report on AI in financial services, built on 103 comment letters, recommended among other things that financial firms review AI use cases for compliance with existing laws and regulations before deploying them and periodically after. So a bank's AI governance in 2026 is mostly its own policy, built from parts it already has:

- **An inventory of uses, not only models.** Each use case (the chatbot, the extraction service, the collections agent) is registered with what it may decide or propose, whether it faces customers, which laws it touches, its legal review and its owner. The scoring models inside it are in the model inventory; the generative pieces are there too with `in_guidance_scope` false ([Model Risk Management](/books/banking-and-lending/model-risk#how-to-build-it)).
- **Evaluations before release, per version.** A new model or prompt version passes a fixed evaluation set before it reaches customers: accuracy on fee and rate questions against the product terms, recall on rights signals, refusal of out-of-scope actions, and fair treatment across customer groups where the use touches credit ([Evals](/docs/architecture/ai-agents#evals); [Governance and Evaluation](/books/commerce/ai-in-commerce#governance-and-evaluation) is the commerce version).
- **Vendors carry the bank's duties.** A vendor's assistant, model or agent is a third party under the bank's third-party risk program, and for a program bank it is the program's vendor under the sponsor's oversight; the contract covers data use, model changes, incident notice and audit ([Vendor Concentration](/books/banking-and-lending/security-and-resilience#vendor-concentration)).
- **Monitoring in production.** Complaint rates, handoff rates, rights-signal recall on sampled conversations, answer accuracy, and drift in the scores that decide, each with an owner and a threshold ([Monitoring and Drift](/books/banking-and-lending/model-risk#monitoring-and-drift)).
- **Prompt injection is a security risk with money behind it.** An assistant with account tools that reads untrusted text (a payee name, a document, an email) is the lethal combination the playbook describes; tools that move money require authenticated intent the model can't manufacture ([The Lethal Trifecta](/docs/security/ai-security#the-lethal-trifecta)).

## How to Build It

The volume already records model use in credit: `model_inventory` and `model_versions` ([Model Risk Management](/books/banking-and-lending/model-risk#how-to-build-it)), `model_outputs` on every decision ([Underwriting & Decision Engines](/books/banking-and-lending/decision-engines#how-to-build-it)) and `account_security_events` for authentication ([Account Takeover & Scams](/books/banking-and-lending/account-takeover-and-scams#how-to-build-it)). This chapter adds the use-case inventory and the records of assistants: sessions, proposed actions, the rights signals that open cases, and evaluations:

```sql
CREATE TABLE ai_use_cases (                -- each AI use, with what it may do and its review
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id      UUID REFERENCES institutions (id),   -- null: a platform use serving several
  program_id          UUID REFERENCES programs (id),
  name                TEXT NOT NULL,         -- 'servicing_assistant', 'paystub_extraction', ...
  authority           TEXT NOT NULL CHECK (authority IN ('informs', 'proposes', 'decides')),
  customer_facing     BOOLEAN NOT NULL,
  laws_touched        TEXT[] NOT NULL,       -- 'reg_e', 'reg_b', 'reg_f', 'tcpa', 'udaap', 'co_sb26_189'
  model_inventory_id  UUID REFERENCES model_inventory (id),
  vendor              TEXT,
  legal_review_ref    TEXT NOT NULL,         -- the pre-deployment review
  owner               TEXT NOT NULL,
  status              TEXT NOT NULL CHECK (status IN ('proposed', 'approved', 'live', 'paused',
                        'retired')),
  approved_at         TIMESTAMPTZ
);

CREATE TABLE assistant_sessions (          -- one conversation, by chat or voice
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  use_case_id         UUID NOT NULL REFERENCES ai_use_cases (id),
  party_id            UUID REFERENCES parties (id),   -- null until authenticated
  account_id          UUID REFERENCES accounts (id),
  channel             TEXT NOT NULL CHECK (channel IN ('app_chat', 'web_chat', 'voice_inbound',
                        'voice_outbound', 'sms')),
  model_version       TEXT NOT NULL,
  prompt_version      TEXT NOT NULL,
  ai_disclosed_at     TIMESTAMPTZ,           -- when the customer was told it's an AI
  consent_ref         TEXT,                  -- prior express consent, for outbound AI voice calls
  started_at          TIMESTAMPTZ NOT NULL,
  handed_off_at       TIMESTAMPTZ,           -- to a person
  ended_at            TIMESTAMPTZ,
  transcript_ref      TEXT NOT NULL,         -- the conversation as it happened
  retain_until        DATE NOT NULL
);

CREATE TABLE assistant_actions (           -- every tool call the model proposed, and what code decided
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  session_id          UUID NOT NULL REFERENCES assistant_sessions (id),
  tool                TEXT NOT NULL,         -- 'freeze_card', 'open_dispute', 'schedule_transfer', ...
  arguments           JSONB NOT NULL,
  proposed_at         TIMESTAMPTZ NOT NULL,
  decision            TEXT NOT NULL CHECK (decision IN ('executed', 'refused_by_policy',
                        'needs_step_up', 'sent_to_person')),
  decided_by          TEXT NOT NULL,         -- the policy rule or the person
  idempotency_key     TEXT UNIQUE,           -- passed to the service it called
  transaction_id      UUID REFERENCES transactions (id),
  case_id             UUID REFERENCES cases (id)
);

CREATE TABLE rights_signals (              -- a turn that may invoke a legal right, and what it opened
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  session_id          UUID NOT NULL REFERENCES assistant_sessions (id),
  turn_ref            TEXT NOT NULL,         -- the message in the transcript
  said_at             TIMESTAMPTZ NOT NULL,  -- the notice time, if it is one
  kind                TEXT NOT NULL CHECK (kind IN ('reg_e_error', 'billing_error', 'complaint',
                        'hardship', 'scra', 'bankruptcy', 'cease_communication',
                        'debt_validation_dispute', 'fraud_report')),
  detected_by         TEXT NOT NULL,         -- 'rule:...', 'model:version'
  confidence          NUMERIC(4, 3),
  outcome             TEXT NOT NULL CHECK (outcome IN ('case_opened', 'sent_to_person',
                        'confirmed_not_a_notice')),
  confirmed_by        TEXT,                  -- a person, for 'confirmed_not_a_notice'
  case_id             UUID REFERENCES cases (id),
  CHECK (outcome <> 'confirmed_not_a_notice' OR confirmed_by IS NOT NULL)
);

CREATE TABLE assistant_evaluations (       -- the gate a version passes before customers see it
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  use_case_id         UUID NOT NULL REFERENCES ai_use_cases (id),
  model_version       TEXT NOT NULL,
  prompt_version      TEXT NOT NULL,
  eval_set_version    TEXT NOT NULL,
  results             JSONB NOT NULL,        -- {"fee_answer_accuracy": 0.99, "rights_recall": 0.98, ...}
  thresholds          JSONB NOT NULL,        -- what each metric had to reach
  passed              BOOLEAN NOT NULL,
  approved_by         TEXT,
  run_at              TIMESTAMPTZ NOT NULL
);
```

Rights signals that never became a case and weren't cleared by a person, the daily check a compliance team runs:

```sql
SELECT s.kind, s.said_at, s.detected_by, a.party_id, a.transcript_ref
FROM rights_signals s
JOIN assistant_sessions a ON a.id = s.session_id
WHERE s.outcome = 'sent_to_person'
  AND s.case_id IS NULL
  AND s.said_at < NOW() - INTERVAL '1 day'
ORDER BY s.said_at;                           -- each row is a clock that may already be running
```

Design notes:

- **The notice time is the message time.** `rights_signals.said_at` becomes `cases.opened_at` when a case opens, so the Reg E clock starts when the customer spoke, not when someone read the transcript.
- **Code decides, and says so.** Every proposed action has a decision and a `decided_by`; "the model did it" is never an answer, and refusals are measured as carefully as executions.
- **Versions are pinned per session.** The model and prompt versions on each session, with the evaluation that approved them, are what lets a complaint about one conversation be traced to a release.
- **Outbound AI calls carry their consent.** An `assistant_sessions` row on `voice_outbound` without a `consent_ref` is a call that shouldn't have been placed; the gate checks before dialing.
- **Credit decisions keep their own record.** An extraction that fed a decision is referenced from the decision's frozen inputs (`credit_decisions.inputs_ref`) with its model version, so the decision and the assistant records join without either duplicating the other.
- **Emit events:** `assistant_session.started`, `assistant_action.proposed`, `assistant_action.executed`, `rights_signal.detected`, `assistant_session.handed_off`, `assistant_evaluation.passed`.

## Auditing

- **Every AI use, reviewed.** The inventory with each use's authority, laws touched, legal review, owner and approval, and every change to them.
- **Every conversation as it happened.** Transcripts with the model and prompt versions, the AI disclosure, consent for outbound calls, and the handoff time.
- **Every action and who decided it.** Each proposed tool call, the policy or person that decided, and what it moved or opened.
- **Every right raised.** Each detected signal, its notice time, the case it opened or the person who cleared it, which is the evidence that chat didn't swallow a dispute.
- **Every release's evaluation.** The evaluation set, results, thresholds and approver for each version customers saw.
- **Credit decisions as before.** Inputs, model versions, reasons and fair lending tests, with extractions traceable to their documents ([Model Risk Management](/books/banking-and-lending/model-risk#auditing)).

## What This Means for the System You Build

- **Separate informs, proposes and decides** for every AI use, and keep deciding in code for anything that moves money, sets terms or chooses reasons.
- **Store extractions as inputs with provenance:** document, model version, confidence and verification.
- **Detect rights in every conversation,** tuned for recall, and open the case with the customer's message time as the notice time.
- **Answer fees, rates and rights from the product terms through tools,** never from the model's memory.
- **Treat AI voice calls as artificial-voice calls** under the TCPA, with consent checked before dialing and contact limits enforced by a gate.
- **Keep SAR-related AI inside the restricted boundary,** including prompts, logs and vendors.
- **Inventory uses, evaluate every version before release, and monitor in production,** because the 2026 guidance leaves generative AI to the bank's own policy.
- **Build every adverse decision so it can also explain the technology's role** and offer human review, which is what new state AI laws ask.

## References

**Law and regulation**

- [FCC: Declaratory Ruling on AI-generated voices under the TCPA (FCC 24-17, adopted February 2, 2024)](https://docs.fcc.gov/public/attachments/FCC-24-17A1.pdf), AI voices are "artificial" voices requiring prior express consent
- [Colorado General Assembly: SB 26-189](https://leg.colorado.gov/bills/sb26-189), signed May 14, 2026, repealing and reenacting the Colorado AI Act: notice, the post-adverse-outcome description, human review, records and the 2027 dates
- [Colorado General Assembly: SB 24-205](https://leg.colorado.gov/bills/sb24-205), the 2024 act signed May 17, 2024

**Regulators and guidance**

- [CFPB: Chatbots in consumer finance (June 6, 2023)](https://www.consumerfinance.gov/about-us/newsroom/cfpb-issue-spotlight-analyzes-artificial-intelligence-chatbots-in-banking), the top ten banks' use, the 37% estimate, failures to recognize rights, loops and no path to a person
- [U.S. Treasury: Report on the uses, opportunities and risks of AI in financial services (December 19, 2024)](https://home.treasury.gov/news/press-releases/jy2760), the 103 comment letters and the recommendations, including pre-deployment review of use cases against existing law
- [NYDFS: Cybersecurity Risks Arising from Artificial Intelligence (October 16, 2024)](https://www.dfs.ny.gov/industry-guidance/industry-letters/il20241016-cyber-risks-ai-and-strategies-combat-related-risks), deepfake social engineering and authentication advice

**In practice**

- [Bank of America: Erica surpasses 3 billion client interactions (August 20, 2025)](https://newsroom.bankofamerica.com/content/newsroom/press-releases/2025/08/a-decade-of-ai-innovation--bofa-s-virtual-assistant-erica-surpas.html), interactions, users, monthly volume, proactive insights and the employee assistant
- [Klarna: AI assistant handles two-thirds of customer service chats in its first month (February 27, 2024)](https://www.klarna.com/international/press/klarna-ai-assistant-handles-two-thirds-of-customer-service-chats-in-its-first-month/), conversations, share, agent equivalent, resolution time, repeat inquiries and the profit estimate
