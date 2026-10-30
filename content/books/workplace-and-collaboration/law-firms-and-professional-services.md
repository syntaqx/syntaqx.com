+++
title = "Law Firms & Professional Services"
nav_title = "Law Firms & Services"
description = "The matter-centric model of clients, matters, timekeepers and rates, the practice management vendors, and the ABA Model Rules that shape law firm software."
category = "Workplace & Collaboration Industry"
order = 2055
part = "Law Firms and Professional Services"
tags = ["legal-tech", "law-firms", "practice-management", "professional-services", "aba-model-rules"]
+++

A law firm is a workplace like any other in this book (people chat, meet, write documents, track work), with one difference that reorganizes the whole system: every record belongs to a **matter**. A matter is one piece of work for one client: a lawsuit, a merger, an estate, a patent application. Time is recorded against a matter, documents are filed to it, trust money is held for it, conflicts are checked before it opens, and its file is kept for years after it closes. A collaboration product organized around channels and projects can host a firm's chat; it can't run the firm until the matter is the primary key.

The second difference is who holds the duties. In the rest of this book the customer's admin decides retention, access and export because the customer is the controller of its data ([Workplace Chat Inverts the Duties](/books/user-generated-platforms/real-time-chat#workplace-chat-inverts-the-duties)). In a law firm those decisions are also professional obligations of individual licensed lawyers, enforced by state bars that can suspend a license. The firm's lawyers owe the client competence, confidentiality and the safekeeping of money; the software vendor is, in the vocabulary of the rules, a nonlawyer whose work the lawyers must supervise. That makes the firm's admin settings more than preferences: a sharing default, a retention schedule or an AI feature turned on for everyone can be an ethics question.

This part has five chapters. This one covers the model, the firm types, the vendors and the rules that shape the software. [Matters, Intake & Conflicts](/books/workplace-and-collaboration/matters-intake-and-conflicts) covers opening and closing a matter; [Trust Accounting & IOLTA](/books/workplace-and-collaboration/trust-accounting-iolta) covers client money; [Time, Billing & E-Billing](/books/workplace-and-collaboration/time-billing-and-ledes) covers time, invoices and LEDES; and [Legal Documents, DMS & AI](/books/workplace-and-collaboration/legal-documents-and-ai) covers document management, confidentiality in the cloud and generative AI. None of it is legal advice: it is what the rules say and how a system that follows them is built.

## How the Platforms Do It

As of October 2026, from vendor sites, help centers and filings:

| Vendor | Segment | What the public material shows |
| --- | --- | --- |
| **Clio** | Solo to mid-size, and an enterprise division | Clio Manage (matters, time, billing, trust), Clio Grow (intake and leads), Clio Accounting, Clio Payments; conflict checks shared between Manage and Grow; acquired vLex for $1 billion (announced June 30, 2025, when Clio reported $300 million ARR), closed November 10, 2025 with a $500 million Series G at a $5 billion valuation |
| **8am** (formerly AffiniPay) | Solo and small | 8am MyCase for cases, clients, documents and billing; 8am LawPay for payments; MyCase Payments customers migrated to LawPay |
| **Filevine** | Litigation and plaintiff firms | Matter management, leads and client intake, billing and timekeeping; markets itself as an AI "Legal Operating Intelligence System" |
| **PracticePanther** | Small firms | Trust accounting, general ledger and three-way trust reconciliation; timers and calendar events that become time entries |
| **Smokeball** | Small firms | Automatic time capture (AutoTime) and trust accounting in one platform |
| **CosmoLex** (ProfitSolv) | Small firms | Practice management with built-in trust and business accounting and three-way reconciliation |
| **Aderant** | Large firms | Expert (time and billing) and Expert Sierra (cloud practice and financial management) |
| **Elite** | Large firms | Elite 3E financial and practice management |
| **Intapp** | Large firms and other professional services | Intake, Conflicts, Walls, Terms, Time, Billstream, Workspaces and DealCloud; FY2026 revenue of $577.8 million; 97 of the Am Law 100 as clients |
| **Kantata** | Agencies and consultancies | Professional services automation: resource management, forecasting, financial management |
| **Harvest**, **Toggl** | Any team that bills time | Time tracking, invoicing, team time reporting |

Three patterns:

- **Small firms buy one system; large firms buy many.** Clio, MyCase, PracticePanther, Smokeball and CosmoLex each put matters, time, billing, trust accounting and payments in one product. A large firm runs a financial system (Aderant or Elite), a document management system (iManage or NetDocuments), a risk stack (Intapp) and the general workplace suite, and the matter number is what ties them together.
- **Payments and trust compliance come bundled.** The small-firm vendors either own a payment processor (8am's LawPay) or run one (Clio Payments), and both describe their fee handling in trust-account terms ([Cards and Trust Money](/books/workplace-and-collaboration/trust-accounting-iolta#cards-and-trust-money)).
- **Risk software is a category of its own at the top.** Intapp's 10-K describes it as a provider of "AI-powered solutions for professional firms in highly regulated industries," with conflicts, ethical walls and terms as separate products, and serves accounting, consulting, investment banking and private capital as well as law. Conflicts and walls are big enough problems at scale to support a public company.

## The Matter-Centric Model

Four records are at the center of every product above, under different names:

| Record | What it is | Why it's separate |
| --- | --- | --- |
| **Client** | The person or organization the firm represents | Billing, trust balances and conflicts are per client; one client has many matters |
| **Matter** | One engagement for one client (Clio "matter," MyCase "case," Intapp "engagement") | The unit of conflicts, time, documents, trust, invoices and file retention |
| **Timekeeper** | A lawyer, paralegal or other person whose time is billed | Has a classification (partner, associate, paralegal) and rates; may not be a user of every system |
| **Rate** | What an hour of a timekeeper costs on a matter | Varies by timekeeper, client, matter and date; negotiated discounts and e-billing caps depend on it |

Around them sit the records each later chapter owns: the parties to a matter and their relationships (for [conflicts](/books/workplace-and-collaboration/matters-intake-and-conflicts)), the engagement letter (scope and fee basis), the [trust ledger](/books/workplace-and-collaboration/trust-accounting-iolta) per client and matter, [time and expense entries, invoices in LEDES](/books/workplace-and-collaboration/time-billing-and-ledes), and the matter's [documents and email](/books/workplace-and-collaboration/legal-documents-and-ai).

The matter-centric model differs from the book's [general model](/books/workplace-and-collaboration/workplace-business#the-core-data-model) in three ways:

- **The container has a client.** A Slack channel or Jira project belongs to the workspace; a matter belongs to a client of the firm, and the client's identity drives conflicts, billing and who may see it.
- **The container has a lifecycle with legal effect.** Opening a matter is a decision recorded after a conflict check; closing it starts retention clocks and ends the duty to hold money for it ([Matter Closing and File Retention](/books/workplace-and-collaboration/matters-intake-and-conflicts#matter-closing-and-file-retention)).
- **Access is need-to-know by default at scale.** In a small firm everyone sees every matter. In a large firm, a matter may be screened from named lawyers who are conflicted, and that exclusion has to hold in every system ([Ethical Walls](/books/workplace-and-collaboration/matters-intake-and-conflicts#ethical-walls)). A general workplace product's permission model is built to share; a firm's is built to exclude precisely.

## Firm Types

Who buys, and what they need, varies with firm size and ownership:

- **Solo and small firms** buy self-serve, monthly, per user, the same way a team adopts any SaaS product. They need everything in one product, trust accounting that keeps them out of trouble with the bar, and online payments.
- **Mid-size firms** start to separate the financial system from the document system and to need real conflicts searching, because the number of former clients and adverse parties outgrows memory.
- **Large firms** (the Am Law 100 and 200, and their peers abroad) run enterprise systems with procurement, security questionnaires and client-imposed requirements. Their corporate clients send outside counsel guidelines that dictate billing formats, staffing and data security, so the client's rules shape the firm's software ([E-Billing and Outside Counsel Guidelines](/books/workplace-and-collaboration/time-billing-and-ledes#e-billing-and-outside-counsel-guidelines)).
- **In-house legal departments** are the buyers on the other side of e-billing: they use enterprise legal management tools (Thomson Reuters Legal Tracker, LexisNexis CounselLink, Brightflag, Onit and SimpleLegal, among others) to receive and audit outside counsel invoices. The ABA's definition of a "firm" includes "lawyers employed in a legal services organization or the legal department of a corporation or other organization" (Model Rule 1.0(c)), so the same professional duties apply.
- **Firms with nonlawyer owners** are the newest type. ABA Model Rule 5.4 bars sharing legal fees with a nonlawyer, partnering with one in the practice of law, and practicing in a for-profit firm where a nonlawyer "owns any interest therein." Arizona licenses alternative business structures, which its courts define as a business entity "that includes nonlawyers who have an economic interest or decision-making authority in a firm." Utah's regulatory sandbox, a pilot of the Utah Supreme Court, is closed to new applications and set to sunset on August 14, 2027; the court closed its ABS-only portion at the end of 2024. For software, an ABS changes the buyer (a corporate parent may run the systems) but not the duties owed to clients.

## The Rules That Shape the Software

The ABA Model Rules of Professional Conduct aren't binding by themselves; each state adopts its own version, usually close to the model. Several model rules reach directly into software choices, and the ABA's formal opinions apply them to technology.

**Competence includes technology.** Model Rule 1.1's Comment [8] says a lawyer "should keep abreast of changes in the law and its practice, including the benefits and risks associated with relevant technology." Formal Opinion 512 (July 29, 2024) applies it to generative AI: lawyers should "either acquire a reasonable understanding of the benefits and risks" of the tools they use or draw on the expertise of others who have it.

**Confidentiality is a reasonable-efforts duty.** Model Rule 1.6(c): "A lawyer shall make reasonable efforts to prevent the inadvertent or unauthorized disclosure of, or unauthorized access to, information relating to the representation of a client." Comment [18] lists the factors for what's reasonable: the sensitivity of the information, the likelihood of disclosure without more safeguards, the cost of more safeguards, the difficulty of implementing them, and how much they make "a device or important piece of software excessively difficult to use." It adds that a client may require special security measures or give informed consent to forgo ones that would otherwise be required. Formal Opinion 477 (May 11, 2017, "Securing Communication of Protected Client Information") reads this as a fact-specific standard rather than a list of mandated controls, and Formal Opinion 483 (October 17, 2018) covers obligations after a data breach. The consequence for a vendor: there is no single certification a firm can point to, so firms ask detailed security questions and corporate clients write their own requirements into outside counsel guidelines.

**The vendor is supervised like an assistant.** Model Rule 5.3, "Responsibilities Regarding Nonlawyer Assistance," requires partners and lawyers with comparable managerial authority to make "reasonable efforts to ensure that the firm has in effect measures giving reasonable assurance" that a nonlawyer's conduct "is compatible with the professional obligations of the lawyer," and makes a lawyer responsible for a nonlawyer's conduct that the lawyer orders, ratifies, or fails to remedy in time. Formal Opinion 08-451 (August 5, 2008) allows outsourcing legal and nonlegal support "provided the lawyer remains ultimately responsible." A practice management vendor, a DMS host and an AI provider all fall here. Managerial lawyers must also set firm-wide measures (Model Rule 5.1), which Opinion 512 turns into a duty to "establish clear policies regarding the law firm's permissible use of GAI."

**Remote and virtual work have their own opinions.** Formal Opinion 495 (December 16, 2020, "Lawyers Working Remotely") and Formal Opinion 498 (March 10, 2021, "Virtual Practice") address lawyers who practice through technology rather than from an office, and Opinion 512 cites 498 beside Comment [8].

**Conflicts, money and fees are covered in their chapters:** Rules 1.7, 1.9, 1.10 and 1.18 in [The Conflict Rules](/books/workplace-and-collaboration/matters-intake-and-conflicts#the-conflict-rules), Rule 1.15 in [Whose Money It Is](/books/workplace-and-collaboration/trust-accounting-iolta#whose-money-it-is), Rule 1.5 in [Rates and Fee Arrangements](/books/workplace-and-collaboration/time-billing-and-ledes#rates-and-fee-arrangements).

Read together, the rules put the firm's admin in the position the rest of this book describes for any customer admin, with a license behind it: the firm chooses the vendor, configures the safeguards, decides who sees what, and answers for it to a regulator. The vendor's job is to make the reasonable configuration the easy one and to leave a record that the firm can show it was reasonable.

## Professional Services Beyond Law

Agencies, consultancies, accounting firms and architects bill time to clients too, and their software (professional services automation, PSA) uses the same skeleton: a client, an engagement or project, people with roles and rates, time entries, invoices. Kantata describes itself as a PSA platform that connects "sales, resourcing, and delivery in one system"; Harvest helps teams "track time, bill clients" and measure performance; Toggl is a time tracker.

What PSA adds is forward planning: [resource management](/books/workplace-and-collaboration/portfolios-roadmaps-and-goals#capacity-and-resource-management) (who is booked on what next month), utilization targets and project budgets with margin. What it usually lacks is the legal layer: no client trust accounts, no conflicts rules under bar discipline, no LEDES. Intapp spans both, selling the same intake, conflicts and walls products to accounting and consulting firms that it sells to law firms, because independence and confidentiality obligations exist there too.

My view for a builder: the matter model generalizes cleanly to any professional service if the legal layer is a set of optional modules (conflicts, trust, LEDES) on top of client, engagement, timekeeper and rate. Building law first and generalizing is easier than adding trust accounting to a PSA product later, because trust money changes the ledger's shape.

## How the Records Map to the Core Model

The book's core data model (in the Part 1 chapter [The Workplace Software Business](/books/workplace-and-collaboration/workplace-business#the-core-data-model)) already has most of what a firm needs. The matter-centric variant extends it rather than running beside it:

| Firm concept | Core table | How it maps |
| --- | --- | --- |
| The firm (the vendor's customer) | `organizations` | One row; plan, billing, verified domains as for any customer |
| The firm's tenant | `workspaces` | Usually one; a global firm may have one per region for residency |
| Lawyers, paralegals, staff | `accounts`, `members` | Full members; contract attorneys may be guests |
| Practice groups, offices | `groups` | Directory groups from SCIM, used in walls and default access |
| Client | new `clients`, keyed to a `parties` row | Not a member: clients are records the firm keeps, and only become members if invited to a client portal as guests |
| Matter | `containers` with `kind = 'matter'`, plus a `matters` row keyed to it | The matter is the container that holds its documents, messages and tasks |
| Matter channel, matter workspace in a DMS | the same container, or child containers | A matter's chat channel can be the matter container itself or a child linked to it |
| Documents, email, notes | `items` (`files`, `messages`, `pages`) in the matter container | Filing an email is placing an item in the matter container ([Email Filing](/books/workplace-and-collaboration/legal-documents-and-ai#email-filing)) |
| Timekeeper | new `timekeepers`, keyed to `members` (or to a `parties` row for an outside timekeeper) | Classification and rates live here, not on the member |
| Ethical wall | `grants` with a deny effect, managed by a screen record | See [Ethical Walls](/books/workplace-and-collaboration/matters-intake-and-conflicts#ethical-walls) |
| File retention after closing | `retention_policies`, `legal_holds` | Closing a matter applies the firm's retention policy to the container |
| Every access and decision | `audit_events` | Conflict decisions, wall changes, trust transfers and AI use are audit events |

The design choice that matters: a matter is a **container**, not a parallel "project" table. That way the general machinery (permissions, retention, search, export, audit) applies to matters without being rebuilt, and the legal tables add what's specific.

## How to Build It

Deltas against the core data model in [The Workplace Software Business](/books/workplace-and-collaboration/workplace-business#the-core-data-model). This chapter owns parties, clients, matters, timekeepers and rates; later chapters in this part add [conflicts](/books/workplace-and-collaboration/matters-intake-and-conflicts#how-to-build-it), [trust](/books/workplace-and-collaboration/trust-accounting-iolta#how-to-build-it), [billing](/books/workplace-and-collaboration/time-billing-and-ledes#how-to-build-it) and [documents](/books/workplace-and-collaboration/legal-documents-and-ai#how-to-build-it).

```sql
-- The matter is a container kind.
ALTER TABLE containers
  DROP CONSTRAINT containers_kind_check,
  ADD CONSTRAINT containers_kind_check CHECK (kind IN ('channel', 'space', 'project', 'board',
    'folder', 'file', 'canvas', 'meeting_series', 'matter'));

CREATE TABLE parties (                        -- every person or organization the firm knows
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id    UUID NOT NULL REFERENCES workspaces (id),
  party_type      TEXT NOT NULL CHECK (party_type IN ('person', 'organization')),
  display_name    TEXT NOT NULL,
  legal_name      TEXT,
  tax_id_token    TEXT,                       -- vaulted where kept at all
  merged_into_id  UUID REFERENCES parties (id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE clients (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id    UUID NOT NULL REFERENCES workspaces (id),
  party_id        UUID NOT NULL REFERENCES parties (id),
  client_number   TEXT NOT NULL,              -- the firm's number, e.g. '00711'
  status          TEXT NOT NULL CHECK (status IN ('prospective', 'active', 'former', 'declined')),
  billing_contact_party_id UUID REFERENCES parties (id),
  UNIQUE (workspace_id, client_number)
);

CREATE TABLE matters (                        -- one row per container of kind 'matter'
  container_id     UUID PRIMARY KEY REFERENCES containers (id),
  workspace_id     UUID NOT NULL REFERENCES workspaces (id),
  client_id        UUID NOT NULL REFERENCES clients (id),
  matter_number    TEXT NOT NULL,             -- '00711-0528'
  name             TEXT NOT NULL,
  practice_area    TEXT,
  responsible_member_id UUID REFERENCES members (id),   -- the responsible attorney
  originating_member_id UUID REFERENCES members (id),   -- credit for bringing it in
  office_group_id  UUID REFERENCES groups (id),
  status           TEXT NOT NULL CHECK (status IN ('intake', 'open', 'pending_close',
                     'closed', 'declined')),
  opened_at        TIMESTAMPTZ,
  closed_at        TIMESTAMPTZ,
  client_matter_ref TEXT,                     -- the client's own matter ID, for e-billing
  confidential     BOOLEAN NOT NULL DEFAULT FALSE,     -- need-to-know from the start
  UNIQUE (workspace_id, matter_number)
);

CREATE TABLE timekeepers (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id     UUID NOT NULL REFERENCES workspaces (id),
  member_id        UUID REFERENCES members (id),       -- null for an outside timekeeper
  party_id         UUID REFERENCES parties (id),
  timekeeper_number TEXT NOT NULL,            -- stable; never the name
  classification   TEXT NOT NULL,             -- LEDES code: 'PARTNR', 'ASSOC', 'PARALG', ...
  ledes_name       TEXT NOT NULL,             -- 'Last, First', as e-billing requires
  admitted_jurisdictions TEXT[],              -- ISO 3166-2, where licensed
  valid_during     TSTZRANGE NOT NULL,
  CHECK (member_id IS NOT NULL OR party_id IS NOT NULL),
  UNIQUE (workspace_id, timekeeper_number)
);

CREATE TABLE timekeeper_rates (               -- most specific row wins: matter, client, standard
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id     UUID NOT NULL REFERENCES workspaces (id),
  timekeeper_id    UUID NOT NULL REFERENCES timekeepers (id),
  client_id        UUID REFERENCES clients (id),
  matter_id        UUID REFERENCES matters (container_id),
  hourly_rate      BIGINT NOT NULL,           -- minor units
  currency         CHAR(3) NOT NULL,
  valid_during     DATERANGE NOT NULL,
  EXCLUDE USING GIST (timekeeper_id WITH =,
                      COALESCE(client_id, '00000000-0000-0000-0000-000000000000'::uuid) WITH =,
                      COALESCE(matter_id, '00000000-0000-0000-0000-000000000000'::uuid) WITH =,
                      valid_during WITH &&)
);
```

How it runs:

1. **Every matter row has a container,** created in the same transaction, so permissions, retention and audit work on matters with no special cases. Matter-specific screens and closing rules come from the next chapter.
2. **Parties are the firm's universe,** not just clients: adverse parties, related companies and opposing counsel all get rows, because conflict search runs over them. Duplicates are merged with a recorded, reversible merge ([Merges, Recorded and Reversible](/docs/architecture/record-linkage#merges-recorded-and-reversible)).
3. **A timekeeper is not a member.** A contract attorney or an expert billed through the firm can be a timekeeper without an account; a member who leaves keeps their timekeeper history.
4. **Rates are dated rows** resolved at the time the work was done, never the rate in effect when the bill is printed ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)). Money is integer minor units ([Integer Minor Units](/docs/payments/money#integer-minor-units)).
5. **Matter status changes are audit events** with the actor and the reason, because opening and closing a matter have legal effect.

## Auditing

- **Matter lifecycle.** Who opened, who approved, when, linked to the conflict check that cleared it; who closed it and which retention policy it went under.
- **Client and party changes.** Merges and renames of parties, with the before and after, because a conflict check's result depends on the party data at the time it ran.
- **Rate changes.** Every new rate row, who entered it, and whether the change was communicated to the client (Model Rule 1.5(b) requires changes in the basis or rate to be communicated).
- **Vendor and subprocessor decisions.** The firm's record of which systems hold client information and the review done before adopting them, which is the evidence a firm needs under Rules 1.6(c) and 5.3 ([Audit Trails](/docs/architecture/audit-trails#what-a-record-holds)).

## What This Means for the System You Build

- **Make the matter the primary key** of time, documents, money and access, and model it as a container so the platform's general machinery applies.
- **Keep clients and parties as records the firm owns,** separate from members; only portal users become guests.
- **Separate timekeepers from accounts** and resolve rates by date and specificity.
- **Build for exclusion, not just sharing:** a firm needs to keep named people out of named matters everywhere, not only to share widely.
- **Treat the firm's admin settings as professional decisions:** defaults should be the reasonable choice under Rules 1.6(c) and 5.3, and every change should be recorded.
- **Expect two buyers:** small firms want one product with trust and payments; large firms want a matter number that ties a financial system, a DMS and a risk stack together through APIs.

## References

**ABA Model Rules and opinions**

- [ABA Model Rule 1.0: Terminology](https://www.americanbar.org/groups/professional_responsibility/publications/model_rules_of_professional_conduct/rule_1_0_terminology/), the definition of "firm" including legal departments, and "screened"
- [ABA Model Rule 1.1, Comment](https://www.americanbar.org/groups/professional_responsibility/publications/model_rules_of_professional_conduct/rule_1_1_competence/comment_on_rule_1_1/), Comment [8] on the benefits and risks of relevant technology
- [ABA Model Rule 1.5: Fees](https://www.americanbar.org/groups/professional_responsibility/publications/model_rules_of_professional_conduct/rule_1_5_fees/), communicating the basis or rate and changes to it
- [ABA Model Rule 1.6: Confidentiality of Information](https://www.americanbar.org/groups/professional_responsibility/publications/model_rules_of_professional_conduct/rule_1_6_confidentiality_of_information/), the reasonable-efforts duty in paragraph (c)
- [ABA Model Rule 1.6, Comment](https://www.americanbar.org/groups/professional_responsibility/publications/model_rules_of_professional_conduct/rule_1_6_confidentiality_of_information/comment_on_rule_1_6/), Comment [18] factors and client-required or waived measures
- [ABA Model Rule 5.3: Responsibilities Regarding Nonlawyer Assistance](https://www.americanbar.org/groups/professional_responsibility/publications/model_rules_of_professional_conduct/rule_5_3_responsibilities_regarding_nonlawyer_assistant/), managerial and supervisory duties over nonlawyers
- [ABA Model Rule 5.4: Professional Independence of a Lawyer](https://www.americanbar.org/groups/professional_responsibility/publications/model_rules_of_professional_conduct/rule_5_4_professional_independence_of_a_lawyer/), fee sharing, partnerships and nonlawyer ownership
- [ABA Formal Ethics Opinions: Index by Issue Dates](https://www.americanbar.org/groups/professional_responsibility/publications/ethics_opinions/index_by_issue_dates/), titles and dates of Opinions 477, 483, 495, 498 and 08-451
- [ABA Formal Opinion 512 (July 29, 2024), copy of the ABA PDF](https://www.lawnext.com/wp-content/uploads/2024/07/aba-formal-opinion-512.pdf), competence with GAI, managerial policies, 08-451's outsourcing holding and 477's fact-specific standard
- [ABA: ABA issues first ethics guidance on a lawyer's use of AI tools (July 29, 2024)](https://www.americanbar.org/news/abanews/aba-news-archives/2024/07/aba-issues-first-ethics-guidance-ai-tools/), the opinion's date and the rules it applies

**State regulators**

- [Arizona Supreme Court: Alternative Business Structure](https://www.azcourts.gov/cld/Alternative-Business-Structure), the definition of an ABS
- [Utah Office of Legal Services Innovation](https://utahinnovationoffice.org/), the sandbox's status, closure to applications, sunset date and the end of the ABS-only portion

**Vendor documentation and filings**

- [Intapp Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1565687/000156568726000073/inta-20260630.htm), revenue, products, industries and Am Law 100 clients
- [Intapp Conflicts](https://www.intapp.com/conflicts/), conflicts as a product
- [Intapp Walls](https://www.intapp.com/walls/), walls as a product
- [Clio Help: Run Conflict Checks in Clio Manage and Clio Grow](https://help.clio.com/hc/en-us/articles/41182681954331-Run-Conflict-Checks-in-Clio-Manage-and-Clio-Grow), conflict checks shared between Manage and Grow
- [Clio Help: Trust Reconciliation in Clio](https://help.clio.com/hc/en-us/articles/9290138047899-Trust-Reconciliation-in-Clio), trust in Clio Manage and Clio Accounting
- [TechCrunch: Clio drops $1B on vLex (June 30, 2025)](https://techcrunch.com/2025/06/30/legal-software-company-clio-drops-1b-on-law-data-giant-vlex), the deal and Clio's reported ARR
- [vLex: vLex joins Clio; Series G at $5B valuation (November 10, 2025)](https://vlex.com.mx/news/vLex-Joins-Clio-in-Landmark-1B-Acquisition-And-Clio-Announces-Series-G-5B-Valuation), the close, the round and the valuation
- [8am](https://www.8am.com/), the brands formerly under AffiniPay
- [8am MyCase](https://www.mycase.com/), cases, clients, documents and billing
- [MyCase: MyCase Payments migration](https://supportcenter.mycase.com/en/articles/10371719-mycase-payments-migration-2025), the move of payments customers to LawPay
- [Filevine](https://www.filevine.com/), matter management, intake and billing
- [PracticePanther](https://www.practicepanther.com/), trust accounting and three-way reconciliation
- [Smokeball](https://www.smokeball.com/), AutoTime and trust accounting
- [CosmoLex](https://www.cosmolex.com/), integrated trust and business accounting and its owner
- [Aderant](https://www.aderant.com/), Expert and Expert Sierra
- [Elite: About](https://www.elite.com/about/), Elite 3E
- [Kantata](https://www.kantata.com/), PSA capabilities
- [Harvest](https://www.getharvest.com/), time tracking and invoicing
- [Toggl](https://toggl.com/), time tracking
