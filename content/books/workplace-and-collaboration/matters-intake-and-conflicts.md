+++
title = "Matters, Intake & Conflicts"
description = "Intake and prospective clients, conflict rules 1.7, 1.9 and 1.10, conflict search over parties, ethical walls, engagement letters and closing a matter."
category = "Workplace & Collaboration Industry"
order = 2056
part = "Law Firms and Professional Services"
tags = ["legal-tech", "conflicts-of-interest", "ethical-walls", "intake", "law-firms"]
+++

A firm can't take a matter until it knows it may. Before a matter opens, someone has to establish who the client is, who is on the other side, who else is involved, and whether any lawyer in the firm owes a duty to any of them that the new work would cut against. That check is the conflict check, and its mechanics make it a search problem: the firm compares a list of names (the prospective client, adverse parties, their parents and subsidiaries, officers, insurers, opposing counsel) against every party in every matter it has ever handled, finds the ones that might be the same person or company, and has a lawyer decide what each hit means. Get it wrong and the firm can be disqualified from the case, lose its fee and face discipline.

Then the matter has to be run so that the decision holds: a lawyer who is screened out must stay out of the documents, the email, the chat channel, the time entries and now the AI assistant that can read all of them. And when the work ends, the matter has to be closed on the record: money returned, the file handed over or kept, and retention clocks started.

This chapter covers the life of a matter from intake to closing. The model it extends (parties, clients, matters as containers) is in [How the Records Map to the Core Model](/books/workplace-and-collaboration/law-firms-and-professional-services#how-the-records-map-to-the-core-model).

## How the Platforms Do It

As of October 2026, from vendor documentation:

| Vendor | Intake | Conflict search | Walls and screens |
| --- | --- | --- | --- |
| **Clio** (Manage, Grow) | Clio Grow takes leads and can start a conflict check during intake | Searches contacts and matters by names, contact details and other identifiers; flex or exact matching; up to 10 searches per check; results marked with a status and closed into a report linked to the matter | Not covered |
| **Intapp** (Intake, Conflicts, Walls) | Intake starts conflicts checks; DealCloud can too | "Unify client, engagement, and relationship data in a searchable system"; AI detection across matters, relationships and corporate hierarchies; an auditable record of analyses and decisions | Walls "limits access to sensitive matters across applications" and reverses unauthorized changes in connected systems; "Walls for AI" listed among products |
| **iManage** (Security Policy Manager) | Not covered | Not covered | Applies ethical wall policies and need-to-know access by client, matter, department, practice area or office, and pushes them to connected systems |
| **NetDocuments** | Not covered | Not covered | Security policies on workspaces, documents and users to build ethical walls |
| **Filevine** | Leads and client intake | Not covered | Not covered |

Three patterns:

- **The check is a record, not a search box.** Clio closes each check into a report that can be shared, downloaded and associated with a matter, and a closed check can't be edited (it can be duplicated and rerun). Intapp sells "an auditable record of all analyses and decisions." The deliverable is evidence of diligence, dated, with what was searched and what was decided.
- **Large firms separate who searches from who decides.** Intapp's products split intake, conflicts and walls; a conflicts team runs searches and a lawyer clears or escalates. Small-firm tools let any authorized user run a check (Clio limits it to administrators and the General Access role by default).
- **Walls are enforced outside the system that defines them.** iManage pushes policies to "practice management, finance" systems; Intapp says changes made in systems outside Walls are "automatically reversed." A wall that only exists in one product is a wall with doors.

## Intake and Prospective Clients

Intake starts before there's a client. ABA Model Rule 1.18 defines a **prospective client** as a person "who consults with a lawyer about the possibility of forming a client-lawyer relationship with respect to a matter," and gives that person rights even if the firm never takes the work:

- The lawyer may not use or reveal what the prospective client said, except as Rule 1.9 would allow for a former client (1.18(b)).
- If the lawyer received information "that could be significantly harmful" to that person, the lawyer may not represent anyone adverse to them in the same or a substantially related matter, and the disqualification spreads to the whole firm (1.18(c)).
- The firm can still act if both sides give informed consent confirmed in writing, or if the lawyer who heard the information "took reasonable measures to avoid exposure to more disqualifying information than was reasonably necessary," is timely screened, gets no part of the fee, and written notice goes promptly to the prospective client (1.18(d)).

Formal Opinion 492 (June 9, 2020) addresses these obligations, including what "significantly harmful" information is. For an intake system, Rule 1.18 has two concrete effects:

- **Collect only what the conflict check needs before the check runs.** An intake form that asks for the whole story up front exposes the reviewing lawyer to more than the rule's "reasonably necessary," and that can disqualify the firm from the other side of the case. The staged pattern is names first (client, adverse parties, related parties), conflict check, then the facts.
- **Declined prospects stay in the conflicts database.** A prospective client the firm turned away is a party with a protected relationship, so the intake record, the people involved and who heard what are kept and searched like former clients.

Intake is also where the firm decides whether to take the client at all. Model Rule 1.16(a) opens: "A lawyer shall inquire into and assess the facts and circumstances of each representation to determine whether the lawyer may accept or continue the representation," and requires declining or withdrawing if the client seeks to use the lawyer's services "to commit or further a crime or fraud." Formal Opinion 463 (May 23, 2013) covers client due diligence, money laundering and terrorist financing. So intake records hold the diligence done on the client (identity, ownership of an entity client, source of funds where the matter calls for it) alongside the conflict check.

## The Conflict Rules

Three model rules define what a conflict is, and a fourth defines the screen that can cure some of them.

**Current clients (Rule 1.7).** A concurrent conflict exists if a representation "will be directly adverse to another client," or there's "a significant risk" it "will be materially limited" by the lawyer's responsibilities to another client, a former client, a third person or the lawyer's own interest. The lawyer may proceed only if they reasonably believe they can represent each affected client competently and diligently, the representation isn't prohibited by law, it doesn't involve one client's claim against another in the same proceeding, and "each affected client gives informed consent, confirmed in writing."

**Former clients (Rule 1.9).** A lawyer who represented a client may not represent another person "in the same or a substantially related matter in which that person's interests are materially adverse to the interests of the former client" without the former client's informed consent, confirmed in writing. A lawyer who moves firms carries a narrower version: no adverse work in a substantially related matter where the lawyer acquired material confidential information at the old firm (1.9(b)). And no lawyer may use or reveal a former client's information to their disadvantage (1.9(c)). Formal Opinion 497 (February 10, 2021) addresses what "materially adverse" means.

**Imputation (Rule 1.10).** While lawyers are associated in a firm, "none of them shall knowingly represent a client when any one of them practicing alone would be prohibited from doing so by Rules 1.7 or 1.9." One lawyer's conflict is everyone's, with two exceptions: a purely personal-interest conflict that doesn't risk materially limiting the others (1.10(a)(1)), and a conflict a lateral hire brings from a prior firm under Rule 1.9(a) or (b), which the firm can cure with a screen (1.10(a)(2)).

**The screen.** Model Rule 1.0(k) defines "screened" as "the isolation of a lawyer from any participation in a matter through the timely imposition of procedures within a firm that are reasonably adequate under the circumstances to protect information that the isolated lawyer is obligated to protect." For a lateral conflict, Rule 1.10(a)(2) requires all of:

1. The disqualified lawyer "is timely screened from any participation in the matter and is apportioned no part of the fee therefrom."
2. **Written notice** promptly given to the affected former client, including "a description of the screening procedures employed," a statement of compliance, a statement that review may be available before a tribunal, and an agreement to respond promptly to written inquiries or objections.
3. **Certifications** of compliance with the rules and the screening procedures, from the screened lawyer and a partner, "at reasonable intervals upon the former client's written request and upon termination of the screening procedures."

Each element is something a system produces or records: the screen's start time against the lawyer's start date (timely), the fee allocation rule (no part of the fee), the notice sent and its content, and certifications on request and at the end. Each state adopts its own version of Rule 1.10, so the screening conditions are rules per jurisdiction, not constants ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)).

**Laterals and mergers.** A lawyer joining a firm, or two firms merging, must check conflicts before the move, which means disclosing some information about the lawyer's existing matters to a firm that doesn't yet owe those clients anything. Model Rule 1.6(b)(7) permits disclosure "to detect and resolve conflicts of interest arising from the lawyer's change of employment or from changes in the composition or ownership of a firm," only if it doesn't compromise privilege or prejudice the client. Comment [13] limits it to "no more than the identity of the persons and entities involved in a matter, a brief summary of the general issues involved, and information about whether the matter has terminated," and only after substantive discussions about the move have begun. Formal Opinion 09-455 (October 8, 2009) covers disclosure of conflicts information when lawyers move between firms, and Opinion 489 (December 4, 2019) covers notice obligations when lawyers change firms. In software, a lateral's matter list arrives as an import into a staging area, is searched as a batch against the firm's database, and stays out of the main party data until the lawyer joins.

**Business conflicts are not ethics conflicts.** Firms also check "business" or "positional" issues that the rules don't prohibit: suing a large client's subsidiary in an unrelated matter, taking a legal position that cuts against another client's interests (Formal Opinion 93-377, "Positional Conflicts," addresses when that becomes a conflict). The system should let the firm record these as a separate category of hit with a separate approver, so the ethics decision and the business decision aren't blurred.

## Conflict Search

A conflict check is a search over **parties in roles**. A party is any person or organization the firm has a record of; a role is how they relate to a matter: client, adverse party, related party (parent, subsidiary, affiliate), co-party, opposing counsel, insurer, witness, expert, prospective client. A hit matters because of the combination: the new matter's adverse party is a current client in another matter (Rule 1.7), or a former client in a related matter (Rule 1.9), or a prospective client the firm heard from last year (Rule 1.18).

What a good search does:

- **Searches name variations and identifiers, not one string.** Clio's check takes name variations for people and companies, email addresses, phone numbers, addresses and dates of birth, and offers flex matching (similar results) or exact matching; a result returns when any one piece of information appears anywhere in the selected data. The general technique is the playbook's [Match Before Create](/docs/architecture/record-linkage#match-before-create): normalize names (legal suffixes like Inc. and LLC, punctuation, word order for people), compare tokens, and treat strong identifiers (tax IDs, registration numbers) as decisive.
- **Expands corporate families.** An adverse party's parent and subsidiaries are searched too, because representing a client against a current client's subsidiary can be direct adversity depending on the facts. Formal Opinion 95-390 (January 25, 1995) addresses conflicts in the corporate family context. The party relationship graph (parent of, subsidiary of, officer of, spouse of) is data the firm has to maintain, and Intapp markets detection across "corporate hierarchies" as part of its conflicts product.
- **Searches beyond the party list.** Clio's search categories include calendar events, notes, document names and communication logs. A name that appears only in a document title or a call note is still a lead.
- **Bands results for review.** Exact identifier matches, strong name matches and weak name matches go into different queues; a reviewer marks each result (Clio's statuses) with a note. Weak matches are the cost of recall: missing a real conflict is far worse than reviewing a false one ([Review Bands](/docs/architecture/record-linkage#review-bands)).
- **Freezes the result.** The check records the search terms, the parameters, the data searched (as of when), every hit, each disposition, the reviewer and the final decision. Clio closes a check automatically after 3 days to keep reports current; a stale check is rerun, not edited.

When a hit is a real conflict, the outcomes are: decline the matter; take it with informed consent confirmed in writing from each affected client (Rules 1.7(b)(4), 1.9(a)); take it with a screen where the rules allow (Rule 1.10(a)(2), Rule 1.18(d)); or end the conflicting representation where that's permitted. Each outcome has documents (the consent letters, the screen memo, the notice) that belong to the check.

**New parties after opening.** Conflicts aren't checked once. A matter acquires new parties as it goes (an added defendant, a new witness, an acquirer of the client), and each addition is a new check against the database. The trigger is adding a party to a matter, not a calendar.

## Ethical Walls

An **ethical wall** (also called a screen or information barrier) is the operational form of Rule 1.0(k)'s screen: a named lawyer, or group, is kept out of a named matter, or a matter is kept to a named team, across every system that holds its information. Firms also use walls beyond what the rules require: for confidential deals, for clients who demand need-to-know access, and for lawyers who are conflicted on a personal basis.

How walls work in practice:

- **Defined once, enforced everywhere.** The wall is a policy (who is excluded or included, which matter or client, from when) in one system, which pushes access changes to the DMS, the financial system, the time entry system, chat, search and the AI tools. iManage's Security Policy Manager pushes policies to connected systems "including practice management, finance"; Intapp Walls says it manages "policies across every system and AI tool."
- **Two shapes: exclusionary and inclusionary.** An exclusionary wall keeps named people out of a matter everyone else can see. An inclusionary wall (need-to-know) makes a matter visible only to its named team. iManage describes barriers by client, matter, department, practice area or office.
- **Drift is detected and reversed.** If someone adds a screened lawyer to a matter's document workspace by hand, the wall system notices on its next sync and removes the access; Intapp describes unauthorized changes being "automatically reversed in systems outside Intapp Walls." The reversal and the attempt are both audit events.
- **Acknowledgment and certification.** My default is a written acknowledgment from each screened person when the wall starts, plus the certifications Rule 1.10(a)(2)(iii) requires on request and at the end, as a workflow with reminders rather than a memo.
- **Search and AI respect it.** A screened lawyer's enterprise search and AI assistant must not return the walled matter's content. That only works if retrieval checks permissions at query time against the same grants the wall wrote (the book's chapter [AI Assistants Over Company Data](/books/workplace-and-collaboration/ai-assistants#how-grounding-works) covers permission-aware retrieval).

In the [core model](/books/workplace-and-collaboration/workplace-business#the-core-data-model), a wall is a set of **deny grants**: the screen record says "member X (or group Y) may not access matter Z," and the platform writes grants with a deny effect on the matter container that override any allow from group membership or link sharing. Deny-overrides-allow is a deliberate exception to the additive model most collaboration products use ([Choosing a Model](/docs/security/authorization#choosing-a-model)), and it's the one exception a legal product can't do without. The general permission model is the subject of the Part 2 chapter [Permissions & Sharing](/books/workplace-and-collaboration/permissions-and-sharing).

## Engagement Letters

Once the conflict check clears, the firm documents the engagement. The rules set minimums; firms and clients add more.

- **Scope and fee basis.** Model Rule 1.5(b): "The scope of the representation and the basis or rate of the fee and expenses for which the client will be responsible shall be communicated to the client, preferably in writing, before or within a reasonable time after commencing the representation," except for a regularly represented client on the same basis. Changes in the basis or rate must also be communicated.
- **Contingent fees in a signed writing.** Rule 1.5(c) requires a contingent fee agreement "in a writing signed by the client," stating the percentage at settlement, trial or appeal, the expenses deducted, and whether they're deducted before or after the fee is calculated, and requires a written closing statement at the end. Rule 1.5(d) prohibits contingent fees in some domestic relations matters and for criminal defense.
- **Fee division across firms.** Rule 1.5(e) allows splitting a fee with a lawyer in another firm only if it's proportional to the work or both assume joint responsibility, the client agrees to the arrangement and each lawyer's share in writing, and the total is reasonable.
- **State additions.** California's Rule 1.15(b) lets a flat fee paid in advance go into the firm's operating account only with written disclosure, and if it exceeds $1,000 the client's agreement must be in a writing signed by the client ([Earned and Unearned Fees](/books/workplace-and-collaboration/trust-accounting-iolta#earned-and-unearned-fees)).
- **Technology consents.** Formal Opinion 512 says that where informed consent is needed before putting client information into a self-learning AI tool, "merely adding general, boiler-plate provisions to engagement letters purporting to authorize the lawyer to use GAI is not sufficient" ([Generative AI](/books/workplace-and-collaboration/legal-documents-and-ai#generative-ai)). Consent to specific tools is a separate, specific record.
- **Conflict waivers.** Informed consents under Rules 1.7 and 1.9 are often part of the engagement letter or a companion letter; they're "confirmed in writing," which Rule 1.0(b) allows to be a writing the lawyer sends promptly confirming an oral consent.

The engagement letter itself is a document in the matter, usually signed electronically (the Part 5 chapter [E-Signatures & Agreements](/books/workplace-and-collaboration/e-signatures-and-agreements) covers validity). What the system keeps as structured data is what other modules need: the fee arrangement and rates (for billing), whether advance fees go to trust (for trust accounting), the scope (for matter closing and for disputes about it), consents given (for conflicts and AI), and the date signed.

## Matter Closing and File Retention

Closing a matter is a checklist with legal content:

1. **Money.** Model Rule 1.16(d): on termination, take reasonable steps to protect the client's interests, including "surrendering papers and property to which the client is entitled and refunding any advance payment of fee or expense that has not been earned or incurred." Any trust balance for the matter is billed against (if earned) or returned; a matter can't close with money in trust ([Closing a Matter's Trust Balance](/books/workplace-and-collaboration/trust-accounting-iolta#closing-a-matter-s-trust-balance)).
2. **The client's file.** The client is entitled to its file; Formal Opinion 471 (July 1, 2015) addresses what papers and property a lawyer must surrender to a former client. Rule 1.16(d) adds that the lawyer "may retain papers relating to the client to the extent permitted by other law." The system needs an export of the matter's documents and correspondence in a form the client can use.
3. **A closing letter.** Telling the client the representation has ended fixes the date when the client becomes a former client, which matters for Rule 1.9 and for retention clocks.
4. **Retention.** Trust records have fixed periods: Model Rule 1.15(a) says records "shall be preserved for a period of [five years] after termination of the representation" (the bracket means each state picks its number); Florida keeps trust records 6 years after the final conclusion of each representation, Illinois 7 years after the end of the representation, and California 5 years after final distribution of the funds. The rest of the file (documents, email, notes) has no single period in the Model Rules, and closed-file retention guidance varies by state. <!-- source-gap: wc-closed-file-retention | missing | closed client file retention periods (non-trust) vary by state; no ABA or state source opened | closes with: a state bar opinion or rule on closed-file retention periods (e.g. a Florida Bar closed-files packet) | checked: 2026-10-29 --> Firms set their own schedules, often longer for wills, matters involving minors and anything with a continuing obligation.
5. **Holds.** A matter that may be the subject of litigation (a malpractice claim, a related case) is put on legal hold before its retention clock can delete anything. The mechanics are those of the Part 9 chapter [Retention & Legal Hold](/books/workplace-and-collaboration/retention-and-legal-hold); the legal twist is that the firm is often the custodian of its client's documents, not just its own.
6. **Destruction, recorded.** When retention ends, destruction is a recorded act with the policy, the date, the approver, and confirmation that the client was offered the file, because a former client may ask for it years later ([Retention Schedules by Record Type](/docs/architecture/data-retention#retention-schedules-by-record-type)).

The conflicts record never closes. A closed matter's parties stay in the conflicts database permanently (as former client, former adverse party), because Rule 1.9 has no expiry. Retention policies on documents must not delete the party and role data that conflict search depends on.

## How to Build It

Deltas against the core data model ([The Workplace Software Business](/books/workplace-and-collaboration/workplace-business#the-core-data-model)) and the matter tables in [How to Build It](/books/workplace-and-collaboration/law-firms-and-professional-services#how-to-build-it). This chapter owns matter parties, intake, conflict checks, screens, engagement letters and closing.

```sql
CREATE TABLE party_relationships (           -- the corporate family and other links
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id    UUID NOT NULL REFERENCES workspaces (id),
  from_party_id   UUID NOT NULL REFERENCES parties (id),
  to_party_id     UUID NOT NULL REFERENCES parties (id),
  relation        TEXT NOT NULL CHECK (relation IN ('parent_of', 'affiliate_of', 'officer_of',
                    'director_of', 'spouse_of', 'employee_of', 'insurer_of', 'counsel_for')),
  source          TEXT NOT NULL CHECK (source IN ('manual', 'intake', 'licensed_data')),
  valid_during    DATERANGE NOT NULL
);

CREATE TABLE party_names (                   -- every variation searched
  party_id        UUID NOT NULL REFERENCES parties (id),
  name            TEXT NOT NULL,
  normalized      TEXT NOT NULL,             -- suffixes stripped, case folded, tokens sorted
  kind            TEXT NOT NULL CHECK (kind IN ('legal', 'trade', 'former', 'alias', 'transliteration'))
);
CREATE INDEX party_names_trgm ON party_names USING GIN (normalized gin_trgm_ops);

CREATE TABLE matter_parties (
  matter_id       UUID NOT NULL REFERENCES matters (container_id),
  party_id        UUID NOT NULL REFERENCES parties (id),
  role            TEXT NOT NULL CHECK (role IN ('client', 'adverse', 'related', 'co_party',
                    'opposing_counsel', 'insurer', 'witness', 'expert', 'prospective_client')),
  added_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  added_by        UUID NOT NULL REFERENCES members (id),
  conflict_check_id UUID,                    -- the check that cleared this addition
  PRIMARY KEY (matter_id, party_id, role)
);

CREATE TABLE intakes (                        -- before a matter exists
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id    UUID NOT NULL REFERENCES workspaces (id),
  prospect_party_id UUID NOT NULL REFERENCES parties (id),
  matter_id       UUID REFERENCES matters (container_id),   -- set when opened
  stage           TEXT NOT NULL CHECK (stage IN ('names_only', 'conflict_check', 'facts',
                    'diligence', 'accepted', 'declined')),
  heard_by        UUID[] NOT NULL DEFAULT '{}',              -- members exposed to its facts (1.18)
  declined_reason TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE conflict_checks (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id    UUID NOT NULL REFERENCES workspaces (id),
  intake_id       UUID REFERENCES intakes (id),
  matter_id       UUID REFERENCES matters (container_id),
  trigger         TEXT NOT NULL CHECK (trigger IN ('intake', 'party_added', 'lateral', 'merger', 'rerun')),
  parameters      JSONB NOT NULL,            -- terms, variations, identifiers, match mode, categories
  data_as_of      TIMESTAMPTZ NOT NULL,      -- the party data the search ran against
  status          TEXT NOT NULL CHECK (status IN ('open', 'in_review', 'cleared', 'cleared_with_conditions',
                    'conflict', 'expired')),
  decided_by      UUID REFERENCES members (id),   -- a lawyer, not the searcher
  decided_at      TIMESTAMPTZ,
  created_by      UUID NOT NULL REFERENCES members (id),
  CHECK (decided_by IS NULL OR decided_by <> created_by OR trigger = 'rerun')
);

CREATE TABLE conflict_hits (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  check_id        UUID NOT NULL REFERENCES conflict_checks (id),
  searched_term   TEXT NOT NULL,
  party_id        UUID REFERENCES parties (id),
  matter_id       UUID REFERENCES matters (container_id),
  hit_role        TEXT,                      -- the party's role in that matter
  match_band      TEXT NOT NULL CHECK (match_band IN ('identifier', 'strong', 'weak', 'text')),
  category        TEXT CHECK (category IN ('ethics', 'business', 'none')),
  disposition     TEXT CHECK (disposition IN ('not_same', 'no_conflict', 'consent_needed',
                    'screen_needed', 'conflict')),
  note            TEXT,
  reviewed_by     UUID REFERENCES members (id)
);

CREATE TABLE conflict_resolutions (          -- consents and screens that cure a hit
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  hit_id          UUID NOT NULL REFERENCES conflict_hits (id),
  kind            TEXT NOT NULL CHECK (kind IN ('informed_consent', 'screen', 'declined', 'withdrawal')),
  consenting_client_id UUID REFERENCES clients (id),
  document_item_id UUID REFERENCES items (id),     -- the signed consent or notice
  screen_id       UUID,
  effective_at    TIMESTAMPTZ NOT NULL
);

CREATE TABLE screens (                        -- ethical walls
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id    UUID NOT NULL REFERENCES workspaces (id),
  matter_id       UUID REFERENCES matters (container_id),
  client_id       UUID REFERENCES clients (id),          -- a client-wide wall
  shape           TEXT NOT NULL CHECK (shape IN ('exclusionary', 'inclusionary')),
  basis           TEXT NOT NULL CHECK (basis IN ('lateral_1_10', 'prospective_1_18', 'client_request',
                    'confidential_deal', 'personal_interest', 'other')),
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ,
  notice_item_id  UUID REFERENCES items (id),            -- written notice to the former client
  CHECK (matter_id IS NOT NULL OR client_id IS NOT NULL)
);

CREATE TABLE screen_members (
  screen_id       UUID NOT NULL REFERENCES screens (id),
  member_id       UUID REFERENCES members (id),
  group_id        UUID REFERENCES groups (id),
  side            TEXT NOT NULL CHECK (side IN ('excluded', 'included')),
  acknowledged_at TIMESTAMPTZ,
  fee_excluded    BOOLEAN NOT NULL DEFAULT TRUE,          -- "apportioned no part of the fee"
  CHECK (member_id IS NOT NULL OR group_id IS NOT NULL)
);

CREATE TABLE screen_certifications (
  screen_id       UUID NOT NULL REFERENCES screens (id),
  certified_by    UUID NOT NULL REFERENCES members (id),  -- the screened lawyer, and a partner
  occasion        TEXT NOT NULL CHECK (occasion IN ('start', 'on_request', 'termination')),
  certified_at    TIMESTAMPTZ NOT NULL
);

-- Walls write deny grants (grants.effect = 'deny', from Permissions & Sharing) that override any allow.
ALTER TABLE grants
  ADD COLUMN screen_id  UUID REFERENCES screens (id);

CREATE TABLE engagement_letters (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  matter_id       UUID NOT NULL REFERENCES matters (container_id),
  document_item_id UUID NOT NULL REFERENCES items (id),
  fee_basis       TEXT NOT NULL CHECK (fee_basis IN ('hourly', 'flat', 'contingent', 'hybrid', 'pro_bono')),
  advance_to_trust BOOLEAN NOT NULL,
  scope_summary   TEXT NOT NULL,
  signed_by_client_at TIMESTAMPTZ,           -- required for contingent fees
  sent_at         TIMESTAMPTZ NOT NULL,
  supersedes_id   UUID REFERENCES engagement_letters (id)
);

CREATE TABLE matter_closings (
  matter_id       UUID PRIMARY KEY REFERENCES matters (container_id),
  closing_letter_item_id UUID REFERENCES items (id),
  trust_balance_at_close BIGINT NOT NULL,    -- must be zero to close
  file_offered_at TIMESTAMPTZ,
  retention_policy_id UUID NOT NULL REFERENCES retention_policies (id),
  destroy_after   DATE NOT NULL,             -- computed from the policy and the jurisdiction
  closed_by       UUID NOT NULL REFERENCES members (id),
  closed_at       TIMESTAMPTZ NOT NULL,
  CHECK (trust_balance_at_close = 0)
);
```

How it runs:

1. **Intake is staged.** Names first, then a conflict check, and the facts form opens only after the check clears; members who see the facts are recorded in `heard_by` so a later Rule 1.18 question has an answer.
2. **A conflict check freezes its inputs** (`parameters`, `data_as_of`) and every hit, and a lawyer other than the searcher decides. A matter can't move from `intake` to `open` without a cleared check, and adding a party to an open matter creates a new check before the party row is committed.
3. **Screens compile to grants.** Creating or changing a screen writes deny grants (exclusionary) or replaces the matter's allow grants with the named team (inclusionary) in the same transaction; a sync job compares effective access in every connected system against the screen and reverses drift, logging both the drift and the fix.
4. **Fee exclusion is checked at billing,** so a screened lawyer's share of origination or profit credit on the matter is zero, which is a rule the billing chapter's allocation logic must read.
5. **Closing is gated** on a zero trust balance (a check constraint, backed by the trust ledger query), a closing letter, and a retention policy. The matter's parties and roles are excluded from document retention so the conflicts history survives.

## Auditing

- **Every conflict check:** what was searched, against which data as of when, every hit and its disposition, who reviewed, who decided, and the consents or screens that cured each conflict, kept permanently.
- **Intake exposure:** who heard each prospective client's facts, and when, for Rule 1.18.
- **Screens:** creation, every member added or removed, acknowledgments, notices sent, certifications, every drift detected and reversed, and every access attempt by an excluded member on the walled matter ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **Engagement terms:** every version of the engagement letter and fee basis, with the client's signature where required.
- **Closing and destruction:** the closing date, the trust balance at close, the file offered, the retention policy applied, holds that blocked deletion, and the destruction record.

## What This Means for the System You Build

- **Stage intake:** names, conflict check, then facts, and keep declined prospects in the conflicts database.
- **Search parties in roles,** with name variations, identifiers, corporate families and free-text sources, and band the results for review.
- **Freeze each check** with its inputs, hits, dispositions and the deciding lawyer; rerun rather than edit.
- **Check again whenever a party is added,** not on a schedule.
- **Implement walls as deny grants that override everything,** enforced in every connected system, including search and AI, with drift detection.
- **Record each element Rule 1.10(a)(2) requires:** timely start, fee exclusion, written notice, certifications.
- **Hold engagement terms as data** (fee basis, trust advances, consents), with the signed letter as the source document.
- **Gate closing on a zero trust balance and a retention policy,** and never let document retention delete conflicts history.

## References

**ABA Model Rules and opinions**

- [ABA Model Rule 1.0: Terminology](https://www.americanbar.org/groups/professional_responsibility/publications/model_rules_of_professional_conduct/rule_1_0_terminology/), "confirmed in writing," "informed consent" and "screened"
- [ABA Model Rule 1.5: Fees](https://www.americanbar.org/groups/professional_responsibility/publications/model_rules_of_professional_conduct/rule_1_5_fees/), scope and basis communicated, contingent fees in a signed writing, prohibited contingent fees and fee division
- [ABA Model Rule 1.6: Confidentiality of Information](https://www.americanbar.org/groups/professional_responsibility/publications/model_rules_of_professional_conduct/rule_1_6_confidentiality_of_information/), disclosure to detect conflicts under (b)(7)
- [ABA Model Rule 1.6, Comment](https://www.americanbar.org/groups/professional_responsibility/publications/model_rules_of_professional_conduct/rule_1_6_confidentiality_of_information/comment_on_rule_1_6/), Comment [13] on what may be disclosed and when
- [ABA Model Rule 1.7: Conflict of Interest: Current Clients](https://www.americanbar.org/groups/professional_responsibility/publications/model_rules_of_professional_conduct/rule_1_7_conflict_of_interest_current_clients/), concurrent conflicts and the conditions for consent
- [ABA Model Rule 1.9: Duties to Former Clients](https://www.americanbar.org/groups/professional_responsibility/publications/model_rules_of_professional_conduct/rule_1_9_duties_of_former_clients/), substantially related matters, moving lawyers and former-client information
- [ABA Model Rule 1.10: Imputation of Conflicts of Interest](https://www.americanbar.org/groups/professional_responsibility/publications/model_rules_of_professional_conduct/rule_1_10_imputation_of_conflicts_of_interest_general_rule/), imputation and the screening, notice and certification elements
- [ABA Model Rule 1.15: Safekeeping Property](https://www.americanbar.org/groups/professional_responsibility/publications/model_rules_of_professional_conduct/rule_1_15_safekeeping_property/), the bracketed five-year trust records period
- [ABA Model Rule 1.16: Declining or Terminating Representation](https://www.americanbar.org/groups/professional_responsibility/publications/model_rules_of_professional_conduct/rule_1_16_declining_or_terminating_representation/), the duty to inquire, crime or fraud, and duties on termination
- [ABA Model Rule 1.18: Duties to Prospective Client](https://www.americanbar.org/groups/professional_responsibility/publications/model_rules_of_professional_conduct/rule_1_18_duties_of_prospective_client/), prospective clients, significantly harmful information and screening
- [ABA Formal Ethics Opinions: Index by Issue Dates](https://www.americanbar.org/groups/professional_responsibility/publications/ethics_opinions/index_by_issue_dates/), titles and dates of Opinions 463, 471, 489, 492, 497, 09-455, 95-390 and 93-377
- [ABA Formal Opinion 512 (July 29, 2024), copy of the ABA PDF](https://www.lawnext.com/wp-content/uploads/2024/07/aba-formal-opinion-512.pdf), boilerplate engagement-letter consent to GAI is not sufficient

**State rules**

- [State Bar of California: Rule 1.15 executive summary and redline](https://www.calbar.ca.gov/Portals/0/documents/rules/Rule_1.15-Exec_Summary-Redline.pdf), the flat fee over $1,000 written agreement and five-year records
- [The Florida Bar: Rules Regulating The Florida Bar, Chapter 5 (June 2026)](https://www-media.floridabar.org/uploads/2026/06/2026_12-JUNE-Chapter-5-RRTFB-1.pdf), six-year trust records retention
- [Illinois ARDC: Client Trust Account Handbook (January 2026)](https://iardc.org/Files/ClientTrustAccountHandbook.pdf), seven-year records under Rule 1.15A

**Vendor documentation**

- [Clio Help: Run Conflict Checks in Clio Manage and Clio Grow](https://help.clio.com/hc/en-us/articles/41182681954331-Run-Conflict-Checks-in-Clio-Manage-and-Clio-Grow), parameters, flex and exact search, ten searches, statuses, reports, three-day close, roles and matter association
- [Intapp Conflicts](https://www.intapp.com/conflicts/), unified data, corporate hierarchies, checks from Intake and DealCloud, filtered reports and an auditable record
- [Intapp Walls](https://www.intapp.com/walls/), access limits across applications and reversal of unauthorized changes
- [Intapp Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1565687/000156568726000073/inta-20260630.htm), Intake, Conflicts, Walls and Walls for AI as products
- [iManage Security Policy Manager](https://imanage.com/imanage-products/security-governance/security-policy-manager/), ethical wall and need-to-know policies, barrier types and propagation to connected systems
- [NetDocuments: Ethical Walls](https://www.netdocuments.com/solutions/ethical-walls/), security policies on workspaces, documents and users
- [Filevine](https://www.filevine.com/), leads and client intake
